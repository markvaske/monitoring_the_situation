#!/usr/bin/env node
/**
 * MTS Update Prep Script
 *
 * Fetches live Brent crude, WTI crude, and gold prices from Yahoo Finance,
 * then creates a pre-filled update JSON file ready for Claude to complete.
 *
 * Usage:
 *   node scripts/prep-update.js              # today's date
 *   node scripts/prep-update.js 2026-04-02   # specific date
 *
 * Output:
 *   updates/YYYY-MM-DD.json  — pre-filled with date + prices
 *
 * After running, tell Claude:
 *   "Fill in the news[], hz_events[], milestones[], and posture_updates fields
 *    in updates/YYYY-MM-DD.json for [date]. Prices are already populated."
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const UPDATES_DIR  = path.resolve(__dirname, '../updates');
const TEMPLATE_FILE = path.resolve(__dirname, 'update-template.json');

// ── Date ──────────────────────────────────────────────────────────────────────

function resolveDate(arg) {
  if (arg) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(arg)) {
      console.error('Date must be YYYY-MM-DD');
      process.exit(1);
    }
    return arg;
  }
  // Default: today in local time
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ── Price fetching ────────────────────────────────────────────────────────────

async function fetchPrice(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MTS-prep/1.0)' }
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} for ${symbol}`);

  const json = await res.json();
  const meta = json?.chart?.result?.[0]?.meta;
  if (!meta) throw new Error(`Unexpected response shape for ${symbol}`);

  const price = meta.regularMarketPrice ?? meta.previousClose;
  if (price == null) throw new Error(`No price found for ${symbol}`);

  return Math.round(price * 100) / 100;  // 2 dp
}

async function fetchPrices() {
  const symbols = { brent: 'BZ=F', wti: 'CL=F', gold: 'GC=F' };
  const results = {};

  for (const [key, sym] of Object.entries(symbols)) {
    process.stdout.write(`  Fetching ${key.padEnd(6)} (${sym}) ... `);
    try {
      results[key] = await fetchPrice(sym);
      console.log(`$${results[key]}`);
    } catch (err) {
      console.log(`FAILED — ${err.message}`);
      results[key] = null;
    }
  }

  return results;
}

// ── Last known values (fallback for weekends / market closures) ───────────────

function getLastKnownPrices(dateStr) {
  const dataFile = path.resolve(__dirname, '../src/data.js');
  const content  = fs.readFileSync(dataFile, 'utf8');

  // Find the last entry in OIL_PRICE_DATA
  const oilMatches = [...content.matchAll(/'(\d{4}-\d{2}-\d{2})':\s*\{brent:([\d.]+),wti:([\d.]+)\}/g)];
  const goldMatches = [...content.matchAll(/'(\d{4}-\d{2}-\d{2})':\s*([\d.]+),/g)];

  let lastBrent = null, lastWti = null, lastGold = null;

  if (oilMatches.length) {
    const last = oilMatches.at(-1);
    lastBrent = parseFloat(last[2]);
    lastWti   = parseFloat(last[3]);
  }

  // Gold is trickier since the pattern is shared — find last in GOLD_PRICE_DATA block
  const goldBlock = content.match(/const GOLD_PRICE_DATA\s*=\s*\{([\s\S]*?)\};/);
  if (goldBlock) {
    const gm = [...goldBlock[1].matchAll(/'[\d-]+':\s*([\d.]+)/g)];
    if (gm.length) lastGold = parseFloat(gm.at(-1)[1]);
  }

  return { brent: lastBrent, wti: lastWti, gold: lastGold };
}

// ── Build the pre-filled JSON ─────────────────────────────────────────────────

function buildUpdateFile(dateStr, prices, lastKnown) {
  const brent = prices.brent ?? lastKnown.brent;
  const wti   = prices.wti   ?? lastKnown.wti;
  const gold  = prices.gold  ?? lastKnown.gold;

  const isWeekend = (() => {
    const day = new Date(dateStr + 'T12:00:00Z').getUTCDay();
    return day === 0 || day === 6;
  })();

  const priceNote = (prices.brent == null)
    ? (isWeekend ? '(weekend — carried from last trading day)' : '(live fetch failed — verify manually)')
    : '(live)';

  return {
    _instructions: [
      `Fill in all empty/zero fields. Remove _instructions before running the script.`,
      `Prices are pre-filled ${priceNote}.`,
      `All casualty and displacement figures are CUMULATIVE — never decrease.`,
      `See scripts/update-template.json for field documentation.`
    ],

    date: dateStr,

    escalation_score: 0,   // Claude fills this

    headline: '',          // Claude fills these
    sub: '',

    oil:  { brent, wti },
    gold,
    suez: 0,               // Claude fills

    insurance: { gulf: 0.0, redsea: 0.0, eastmed: 0.0 },
    notam:     { closed: 0, restricted: 0, total: 0 },

    casualties: {
      coalition: { deaths: 0, injuries: 0 },
      axis:      { deaths: 0, injuries: 0 },
      civilian:  { deaths: 0, injuries: 0 }
    },

    displacement: {
      Iran: 0, Lebanon: 0, Iraq: 0, Syria: 0, UAE: 0, Kuwait: 0
    },

    news:            [],   // Claude fills
    hz_events:       [],
    milestones:      [],
    posture_updates: {}
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  const dateStr    = resolveDate(process.argv[2]);
  const outputFile = path.join(UPDATES_DIR, `${dateStr}.json`);

  console.log(`\nMTS prep-update for ${dateStr}\n`);

  // Guard: don't overwrite completed files
  if (fs.existsSync(outputFile)) {
    const existing = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    if (!existing._instructions && existing.news?.length > 0) {
      console.error(`updates/${dateStr}.json already exists and looks complete.`);
      console.error('Delete it first if you want to regenerate.');
      process.exit(1);
    }
    console.log(`  Note: updates/${dateStr}.json exists but is incomplete — overwriting.\n`);
  }

  // Fetch live prices
  console.log('Fetching prices from Yahoo Finance...');
  const prices    = await fetchPrices();
  const lastKnown = getLastKnownPrices(dateStr);

  // Fill in any failures with last known
  let carriedForward = false;
  for (const key of ['brent', 'wti', 'gold']) {
    if (prices[key] == null && lastKnown[key] != null) {
      prices[key] = lastKnown[key];
      carriedForward = true;
    }
  }
  if (carriedForward) console.log('\n  (Some prices carried forward from last known values)');

  // Write output
  const update = buildUpdateFile(dateStr, prices, lastKnown);
  fs.mkdirSync(UPDATES_DIR, { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(update, null, 2) + '\n');

  // Summary
  console.log(`\n✓ Created updates/${dateStr}.json`);
  console.log(`\n  Brent : $${update.oil.brent}`);
  console.log(`  WTI   : $${update.oil.wti}`);
  console.log(`  Gold  : $${update.gold}`);
  console.log('\nNext: give Claude this prompt:');
  console.log('─'.repeat(60));
  console.log(`Fill in updates/${dateStr}.json for ${dateStr}.`);
  console.log(`Prices are already populated — fill in escalation_score,`);
  console.log(`headline, sub, suez, insurance, notam, casualties,`);
  console.log(`displacement, news[], hz_events[], milestones[], and`);
  console.log(`posture_updates. Search: "Iran Israel war ${dateStr}"`);
  console.log(`and "Strait of Hormuz ${dateStr}".`);
  console.log('─'.repeat(60));
  console.log('\nThen run:');
  console.log(`  node scripts/daily-update.js updates/${dateStr}.json`);
  console.log(`  git add src/data.js updates/${dateStr}.json && git commit -m "Daily update: ${dateStr}" && git push\n`);
}

run().catch(err => {
  console.error('\nError:', err.message);
  process.exit(1);
});
