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
 *   node scripts/prep-update.js --force      # overwrite existing completed file
 *   node scripts/prep-update.js 2026-04-02 --force
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

// ── Args ──────────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  let dateArg = null;
  let force = false;
  for (const a of args) {
    if (a === '--force' || a === '-f') { force = true; }
    else if (/^\d{4}-\d{2}-\d{2}$/.test(a)) { dateArg = a; }
    else { console.error(`Unknown argument: ${a}\nUsage: node prep-update.js [YYYY-MM-DD] [--force]`); process.exit(1); }
  }
  return { dateArg, force };
}

// ── Date ──────────────────────────────────────────────────────────────────────

function resolveDate(arg) {
  if (arg) return arg;
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
  // Fetch all in parallel
  const entries = await Promise.all(
    Object.entries(symbols).map(async ([key, sym]) => {
      process.stdout.write(`  Fetching ${key.padEnd(6)} (${sym}) ... `);
      try {
        const price = await fetchPrice(sym);
        console.log(`$${price}`);
        return [key, price];
      } catch (err) {
        console.log(`FAILED — ${err.message}`);
        return [key, null];
      }
    })
  );
  return Object.fromEntries(entries);
}

// ── Price cache (persists last known prices across runs) ──────────────────────

const CACHE_FILE = path.resolve(__dirname, '../updates/prices-cache.json');

function loadPriceCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function savePriceCache(prices) {
  const cache = loadPriceCache();
  for (const [k, v] of Object.entries(prices)) {
    if (v != null) cache[k] = v;
  }
  cache._updated = new Date().toISOString();
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2) + '\n');
}

function getLastKnownPrices() {
  // Try cache file first (fast, no regex)
  const cache = loadPriceCache();
  if (cache.brent && cache.wti && cache.gold) return cache;

  // Fallback: regex scan of data.js (legacy path)
  const dataFile = path.resolve(__dirname, '../src/data.js');
  const content  = fs.readFileSync(dataFile, 'utf8');
  const oilMatches = [...content.matchAll(/'(\d{4}-\d{2}-\d{2})':\s*\{brent:([\d.]+),wti:([\d.]+)\}/g)];
  let lastBrent = null, lastWti = null, lastGold = null;
  if (oilMatches.length) {
    const last = oilMatches.at(-1);
    lastBrent = parseFloat(last[2]);
    lastWti   = parseFloat(last[3]);
  }
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
  const { dateArg, force } = parseArgs();
  const dateStr    = resolveDate(dateArg);
  const outputFile = path.join(UPDATES_DIR, `${dateStr}.json`);

  console.log(`\nMTS prep-update for ${dateStr}\n`);

  // Guard: don't overwrite completed files (bypass with --force)
  if (fs.existsSync(outputFile) && !force) {
    const existing = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    if (!existing._instructions && existing.news?.length > 0) {
      console.error(`updates/${dateStr}.json already exists and looks complete.`);
      console.error('Use --force to overwrite.');
      process.exit(1);
    }
    console.log(`  Note: updates/${dateStr}.json exists but is incomplete — overwriting.\n`);
  }
  if (force && fs.existsSync(outputFile)) {
    console.log(`  --force: overwriting existing updates/${dateStr}.json\n`);
  }

  // Fetch live prices in parallel
  console.log('Fetching prices from Yahoo Finance...');
  const prices    = await fetchPrices();
  const lastKnown = getLastKnownPrices();

  // Save successful fetches to cache
  savePriceCache(prices);

  // Fill in any failures with last known
  let carriedForward = false;
  for (const key of ['brent', 'wti', 'gold']) {
    if (prices[key] == null && lastKnown[key] != null) {
      prices[key] = lastKnown[key];
      carriedForward = true;
    }
  }
  if (carriedForward) console.log('\n  (Some prices carried forward from cache/last known)');

  // Write output
  const update = buildUpdateFile(dateStr, prices, lastKnown);
  fs.mkdirSync(UPDATES_DIR, { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(update, null, 2) + '\n');

  // Summary table
  const brentSrc = prices.brent != null ? 'live' : 'cache';
  const wtiSrc   = prices.wti   != null ? 'live' : 'cache';
  const goldSrc  = prices.gold  != null ? 'live' : 'cache';
  console.log(`\n✓ Created updates/${dateStr}.json`);
  console.log(`\n  ┌─────────┬───────────┬────────┐`);
  console.log(`  │ Price   │ Value     │ Source │`);
  console.log(`  ├─────────┼───────────┼────────┤`);
  console.log(`  │ Brent   │ $${String(update.oil.brent).padEnd(8)} │ ${brentSrc.padEnd(6)} │`);
  console.log(`  │ WTI     │ $${String(update.oil.wti).padEnd(8)} │ ${wtiSrc.padEnd(6)} │`);
  console.log(`  │ Gold    │ $${String(update.gold).padEnd(8)} │ ${goldSrc.padEnd(6)} │`);
  console.log(`  └─────────┴───────────┴────────┘`);
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
