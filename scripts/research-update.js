#!/usr/bin/env node
/**
 * MTS Research Update Script
 *
 * Uses Claude Haiku 4.5 (via Anthropic Messages API + web search) to research
 * the day's events and produce a draft updates/YYYY-MM-DD.json for human review.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... node scripts/research-update.js              # today's date
 *   ANTHROPIC_API_KEY=sk-... node scripts/research-update.js 2026-04-02   # specific date
 *   ANTHROPIC_API_KEY=sk-... node scripts/research-update.js --force      # overwrite existing
 *   ANTHROPIC_API_KEY=sk-... node scripts/research-update.js --yes        # skip cost confirmation
 *
 * Workflow:
 *   1. Run prep-update.js first (fetches live prices)
 *   2. Run this script (researches events, fills draft)
 *   3. Review + edit updates/YYYY-MM-DD.json
 *   4. Run: node scripts/daily-update.js updates/YYYY-MM-DD.json
 *
 * Requirements:
 *   - Node.js 18+ (uses built-in fetch)
 *   - ANTHROPIC_API_KEY env var
 *   - Web search beta feature enabled on your API key
 *     (request at console.anthropic.com or contact support)
 *
 * Canonical country tags (use exactly these strings):
 *   USA, UK, Saudi Arabia, UAE, Iran, Israel, Lebanon, Syria, Iraq, Yemen,
 *   Jordan, Qatar, Bahrain, Kuwait, Oman, Egypt, Turkey, Azerbaijan, Russia,
 *   Germany, Italy, France, Japan, India, Pakistan, North Korea, Cyprus
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const UPDATES_DIR = path.resolve(__dirname, '../updates');
const MODEL       = 'claude-haiku-4-5-20251001';
const API_URL     = 'https://api.anthropic.com/v1/messages';

// ── Args ──────────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  let dateArg = null;
  let force = false;
  let yes = false;
  for (const a of args) {
    if (a === '--force' || a === '-f') { force = true; }
    else if (a === '--yes'  || a === '-y') { yes = true; }
    else if (/^\d{4}-\d{2}-\d{2}$/.test(a)) { dateArg = a; }
    else { console.error(`Unknown argument: ${a}`); process.exit(1); }
  }
  return { dateArg, force, yes };
}

// ── Date ──────────────────────────────────────────────────────────────────────

function resolveDate(arg) {
  if (arg) return arg;
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ── Cost estimate + confirmation ──────────────────────────────────────────────

// Haiku 4.5 pricing (as of 2026-04)
const PRICE_INPUT_PER_TOK  = 0.80  / 1_000_000;  // $0.80 / MTok
const PRICE_OUTPUT_PER_TOK = 4.00  / 1_000_000;  // $4.00 / MTok
const PRICE_WEB_SEARCH     = 0.01;               // $0.01 / search (est.)
const EST_SEARCHES         = 4;                  // typical searches per run
const EST_OUTPUT_TOKENS    = 2_000;              // typical output size

function estimateCost(systemPrompt, userPrompt) {
  // Rough token estimate: ~4 chars per token
  const inputTokens = Math.ceil((systemPrompt.length + userPrompt.length) / 4);
  const searchCost  = EST_SEARCHES * PRICE_WEB_SEARCH;
  const inputCost   = inputTokens * PRICE_INPUT_PER_TOK;
  const outputCost  = EST_OUTPUT_TOKENS * PRICE_OUTPUT_PER_TOK;
  const total       = inputCost + outputCost + searchCost;
  return { inputTokens, inputCost, outputCost, searchCost, total };
}

async function confirmProceed(est) {
  const fmt = n => `$${n.toFixed(4)}`;
  console.log('  ┌──────────────────────────────────────────┐');
  console.log('  │ Estimated API cost for this run          │');
  console.log('  ├──────────────────────────┬───────────────┤');
  console.log(`  │ Input  (~${String(est.inputTokens).padEnd(6)} tokens)   │ ${fmt(est.inputCost).padEnd(13)} │`);
  console.log(`  │ Output (~${String(EST_OUTPUT_TOKENS).padEnd(6)} tokens)   │ ${fmt(est.outputCost).padEnd(13)} │`);
  console.log(`  │ Web search (~${EST_SEARCHES} searches)    │ ${fmt(est.searchCost).padEnd(13)} │`);
  console.log('  ├──────────────────────────┴───────────────┤');
  console.log(`  │ Total (est.)                  ${fmt(est.total).padEnd(13)} │`);
  console.log('  └──────────────────────────────────────────┘');
  console.log('\n  Set a monthly limit at console.anthropic.com → Settings → Limits\n');

  process.stdout.write('Proceed? [y/N] ');
  return new Promise(resolve => {
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', data => {
      process.stdin.pause();
      resolve(data.trim().toLowerCase() === 'y');
    });
  });
}

// ── Anthropic API call ────────────────────────────────────────────────────────

async function callClaude(apiKey, systemPrompt, userPrompt) {
  const body = {
    model: MODEL,
    max_tokens: 4096,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type':            'application/json',
      'x-api-key':               apiKey,
      'anthropic-version':       '2023-06-01',
      'anthropic-beta':          'web-search-2025-03-05',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${text}`);
  }

  const data = await res.json();

  // Extract text from content blocks (web_search_result blocks are transparent)
  const text = data.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('');

  return text;
}

// ── JSON extraction ───────────────────────────────────────────────────────────

function extractJSON(text) {
  // Try to find a JSON code block first
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) {
    try { return JSON.parse(fence[1].trim()); } catch { /* fall through */ }
  }
  // Try raw JSON object
  const obj = text.match(/\{[\s\S]*\}/);
  if (obj) {
    try { return JSON.parse(obj[0]); } catch { /* fall through */ }
  }
  return null;
}

// ── Prompts ───────────────────────────────────────────────────────────────────

function buildSystemPrompt() {
  return `You are a research assistant producing daily update data for MTS (Monitoring The Situation), a tracker for the Iran-Israel conflict and related Middle East tensions.

Your output must be a single JSON object matching the exact schema provided. All fields are required.

CRITICAL RULES:
- Every news item must be sourced from a real, verifiable article published on the target date. Include the URL.
- Casualty and displacement figures are CUMULATIVE (never decrease from prior days). Search for the latest reported totals.
- escalation_score: 1=calm/no news, 5=moderate tension/skirmishes, 8=major strikes/escalation, 10=existential/nuclear threshold. Be conservative.
- news[].imp: 'e'=escalation event, 'd'=de-escalation, 'n'=neutral/informational
- news[].cat: military | aviation | maritime | diplomatic | stocks | humanitarian | general
- hz_events[].type: mine | cleared | patrol | passage | houthi
- milestones[]: only for major turning points (cease-fires, new weapons deliveries, leadership changes, treaty signings). Leave [] if nothing qualifies.
- CANONICAL TAGS — use these exact strings or tags create spurious UI buttons:
  USA (not "United States"), UK (not "United Kingdom"), Saudi Arabia, UAE, Iran, Israel,
  Lebanon, Syria, Iraq, Yemen, Jordan, Qatar, Bahrain, Kuwait, Oman, Egypt, Turkey,
  Azerbaijan, Russia, Germany, Italy, France, Japan, India, Pakistan, North Korea, Cyprus
- posture_updates: one paragraph max per country, present tense, factual. Only include countries where posture changed on this date.
- If you cannot find a verifiable source for a field, use null for numbers or [] for arrays. Never fabricate.
- oil/gold: leave as pre-filled values from the input (do not change).`;
}

function buildUserPrompt(dateStr, existingPrices) {
  const priceNote = existingPrices
    ? `Pre-filled prices (do NOT change): Brent $${existingPrices.brent}, WTI $${existingPrices.wti}, Gold $${existingPrices.gold}`
    : 'Prices not available — leave oil and gold as 0.';

  return `Research and compile the MTS daily update for ${dateStr}.

${priceNote}

Search for: "Iran Israel war ${dateStr}", "Strait of Hormuz ${dateStr}", "Middle East conflict ${dateStr}", "Houthi attack ${dateStr}", "IDF strike ${dateStr}", "Iran sanctions ${dateStr}".

Return ONLY a JSON object with this exact schema (no other text):

{
  "date": "${dateStr}",
  "escalation_score": <1-10>,
  "headline": "<short lead headline>",
  "sub": "<2-3 sentence sub-headline: major events, prices, key figures>",
  "oil": { "brent": <keep pre-filled>, "wti": <keep pre-filled> },
  "gold": <keep pre-filled>,
  "suez": <Suez transit count for this date or 0 if unknown>,
  "insurance": { "gulf": <war risk % e.g. 0.5>, "redsea": <e.g. 1.2>, "eastmed": <e.g. 0.3> },
  "notam": { "closed": <count>, "restricted": <count>, "total": <count> },
  "casualties": {
    "coalition": { "deaths": <cumulative total>, "injuries": <cumulative total> },
    "axis":      { "deaths": <cumulative total>, "injuries": <cumulative total> },
    "civilian":  { "deaths": <cumulative total>, "injuries": <cumulative total> }
  },
  "displacement": {
    "Iran": <cumulative>, "Lebanon": <cumulative>, "Iraq": <cumulative>,
    "Syria": <cumulative>, "UAE": <cumulative>, "Kuwait": <cumulative>
  },
  "news": [
    {
      "cat": "<category>",
      "imp": "<e|d|n>",
      "t": "<headline>",
      "tx": "<2-4 sentences with specific details>",
      "tags": ["<Country>", "<Country>"],
      "l": "<source URL>",
      "s": "<source name>"
    }
  ],
  "hz_events": [
    {
      "type": "<type>",
      "desc": "<description>",
      "lat": <latitude>,
      "lng": <longitude>,
      "count": <ship count or 0>
    }
  ],
  "milestones": [],
  "posture_updates": {
    "<Country>": "<one paragraph>"
  }
}`;
}

// ── Load existing prep-update prices ─────────────────────────────────────────

function loadExistingPrices(dateStr) {
  const filePath = path.join(UPDATES_DIR, `${dateStr}.json`);
  try {
    const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (existing.oil?.brent && existing.oil?.wti && existing.gold) {
      return { brent: existing.oil.brent, wti: existing.oil.wti, gold: existing.gold };
    }
  } catch { /* file doesn't exist or isn't parseable */ }
  return null;
}

// ── Merge draft with existing file (preserves prices) ────────────────────────

function mergeDraft(dateStr, draft, existingPrices) {
  // Start from draft, apply price overrides if we have them
  const merged = { ...draft };
  if (existingPrices) {
    merged.oil  = { brent: existingPrices.brent, wti: existingPrices.wti };
    merged.gold = existingPrices.gold;
  }
  merged.date = dateStr;  // ensure date is correct
  merged._draft = true;   // flag for human review
  merged._draft_note = 'Generated by research-update.js. Verify all figures before running daily-update.js.';
  return merged;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  const { dateArg, force, yes } = parseArgs();
  const dateStr    = resolveDate(dateArg);
  const outputFile = path.join(UPDATES_DIR, `${dateStr}.json`);

  console.log(`\nMTS research-update for ${dateStr}\n`);

  // Require API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('Error: ANTHROPIC_API_KEY environment variable not set.');
    console.error('  export ANTHROPIC_API_KEY=sk-ant-...');
    process.exit(1);
  }

  // Guard: don't overwrite completed files
  if (fs.existsSync(outputFile) && !force) {
    const existing = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    if (!existing._instructions && !existing._draft && existing.news?.length > 0) {
      console.error(`updates/${dateStr}.json already exists and looks complete.`);
      console.error('Use --force to overwrite.');
      process.exit(1);
    }
    if (!existing._draft) {
      console.log(`  Note: updates/${dateStr}.json exists (draft or incomplete) — overwriting.\n`);
    }
  }

  // Load pre-filled prices from prep-update.js output
  const existingPrices = loadExistingPrices(dateStr);
  if (existingPrices) {
    console.log(`  Using prices from existing updates/${dateStr}.json:`);
    console.log(`    Brent $${existingPrices.brent}  WTI $${existingPrices.wti}  Gold $${existingPrices.gold}\n`);
  } else {
    console.log(`  No prep-update.js output found — run prep-update.js first for live prices.\n`);
  }

  // Cost estimate + confirmation
  const systemPrompt = buildSystemPrompt();
  const userPrompt   = buildUserPrompt(dateStr, existingPrices);
  const est = estimateCost(systemPrompt, userPrompt);

  if (!yes) {
    const ok = await confirmProceed(est);
    if (!ok) { console.log('Aborted.'); process.exit(0); }
    console.log();
  }

  // Call Claude with web search
  console.log(`Calling Claude Haiku (${MODEL}) with web search...`);
  console.log('  This may take 20-60 seconds.\n');

  let rawResponse;
  try {
    rawResponse = await callClaude(apiKey, systemPrompt, userPrompt);
  } catch (err) {
    console.error(`\nAPI call failed: ${err.message}`);
    if (err.message.includes('web_search')) {
      console.error('\nWeb search may not be enabled for your API key.');
      console.error('Request access at: https://console.anthropic.com');
    }
    process.exit(1);
  }

  // Parse JSON from response
  const draft = extractJSON(rawResponse);
  if (!draft) {
    console.error('\nFailed to extract JSON from model response.');
    console.error('\nRaw response saved to:', outputFile + '.raw.txt');
    fs.mkdirSync(UPDATES_DIR, { recursive: true });
    fs.writeFileSync(outputFile + '.raw.txt', rawResponse);
    process.exit(1);
  }

  // Merge and write
  const merged = mergeDraft(dateStr, draft, existingPrices);
  fs.mkdirSync(UPDATES_DIR, { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(merged, null, 2) + '\n');

  // Summary
  const newsCount = merged.news?.length ?? 0;
  const hzCount   = merged.hz_events?.length ?? 0;
  const msCount   = merged.milestones?.length ?? 0;
  const postCount = Object.keys(merged.posture_updates ?? {}).length;

  console.log(`✓ Draft written to updates/${dateStr}.json`);
  console.log(`\n  ┌──────────────────────┬───────┐`);
  console.log(`  │ Field                │ Count │`);
  console.log(`  ├──────────────────────┼───────┤`);
  console.log(`  │ news items           │ ${String(newsCount).padEnd(5)} │`);
  console.log(`  │ hz_events            │ ${String(hzCount).padEnd(5)} │`);
  console.log(`  │ milestones           │ ${String(msCount).padEnd(5)} │`);
  console.log(`  │ posture_updates      │ ${String(postCount).padEnd(5)} │`);
  console.log(`  │ escalation_score     │ ${String(merged.escalation_score ?? '?').padEnd(5)} │`);
  console.log(`  └──────────────────────┴───────┘`);

  console.log('\nNEXT: Review the draft carefully before applying:');
  console.log('─'.repeat(60));
  console.log(`  1. Open updates/${dateStr}.json`);
  console.log('  2. Verify each news item has a real source URL');
  console.log('  3. Verify casualty/displacement figures are cumulative and sourced');
  console.log('  4. Adjust escalation_score, headline, and sub as needed');
  console.log('  5. Remove the _draft and _draft_note fields');
  console.log(`  6. node scripts/daily-update.js updates/${dateStr}.json`);
  console.log(`  7. git add src/data.js updates/${dateStr}.json && git commit -m "Daily update: ${dateStr}" && git push`);
  console.log('─'.repeat(60) + '\n');
}

run().catch(err => {
  console.error('\nUnexpected error:', err.message);
  process.exit(1);
});
