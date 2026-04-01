#!/usr/bin/env node
/**
 * MTS Daily Update Script
 *
 * Usage:
 *   node scripts/daily-update.js updates/2026-04-02.json
 *
 * The input JSON file describes one day's worth of data.
 * See scripts/update-template.json for the full format.
 *
 * What this script does:
 *   1. Extends the days[] date range
 *   2. Appends entries to all time-series objects
 *   3. Appends news[], HZ_EVENTS[], MILESTONES[] items
 *   4. Inserts the DAILY_HEADLINES entry
 *   5. Replaces countryPosture entries for changed countries
 *
 * What it does NOT do:
 *   - conflictPhases[] / phases[] changes (too rare; do manually)
 *   - conflictSides{} or FACTION_DETAIL{} (structural changes; do manually)
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const DATA_FILE = path.resolve(__dirname, '../src/data.js');

// ── File I/O ──────────────────────────────────────────────────────────────────

function readData()      { return fs.readFileSync(DATA_FILE, 'utf8'); }
function writeData(c)    { fs.writeFileSync(DATA_FILE, c, 'utf8'); }

// ── Core: find closing bracket of a named const ───────────────────────────────

/**
 * Returns the index of the closing } or ] of `const name = { ... }` / `= [ ... ]`.
 * Correctly skips strings (single, double, template-literal).
 */
function findCloseIdx(content, name) {
  const re = new RegExp(`const\\s+${name}\\s*=\\s*([\\[{])`);
  const m  = re.exec(content);
  if (!m) throw new Error(`Structure not found in data.js: ${name}`);

  const openCh  = m[1];
  const closeCh = openCh === '[' ? ']' : '}';
  let depth = 0, inStr = false, strCh = '';

  for (let i = m.index + m[0].length - 1; i < content.length; i++) {
    const c = content[i];

    if (inStr) {
      if (c === '\\')    { i++; continue; }   // escaped char — skip both
      if (c === strCh)   inStr = false;
      continue;
    }

    if (c === '"' || c === "'" || c === '`') { inStr = true; strCh = c; continue; }
    if (c === openCh)  depth++;
    else if (c === closeCh && --depth === 0) return i;
  }

  throw new Error(`Cannot find closing bracket for: ${name}`);
}

/** Insert text just before the closing bracket of the named structure. */
function insertBeforeClose(content, name, text) {
  const idx = findCloseIdx(content, name);
  return content.slice(0, idx) + text + content.slice(idx);
}

// ── Extend days[] end date ────────────────────────────────────────────────────

function extendDays(content, dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  // JS months are 0-indexed
  return content.replace(
    /const s = new Date\(\d+, \d+, \d+\), e = new Date\(\d+, \d+, \d+\)/,
    `const s = new Date(${y}, 1, 25), e = new Date(${y}, ${m - 1}, ${d})`
  );
}

// ── countryPosture replace ────────────────────────────────────────────────────

function updatePosture(content, country, newText) {
  const safeKey = country.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const keyRe   = new RegExp(`'${safeKey}'\\s*:\\s*'`);
  const km      = keyRe.exec(content);
  if (!km) {
    console.warn(`  [WARN] countryPosture key not found: ${country} — skipping`);
    return content;
  }

  // Scan forward from after the opening quote to find the unescaped closing quote
  let i = km.index + km[0].length;
  while (i < content.length) {
    if (content[i] === '\\') { i += 2; continue; }
    if (content[i] === "'")  break;
    i++;
  }

  const escaped = newText.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return content.slice(0, km.index) + `'${country}': '${escaped}'` + content.slice(i + 1);
}

// ── Formatters ────────────────────────────────────────────────────────────────

function fmtNews(d, n) {
  const tags = JSON.stringify(n.tags);
  const src  = (n.l && n.s) ? `\n   l:'${n.l}',s:'${n.s}'` : '';
  return (
    `  {d:'${d}',cat:'${n.cat}',imp:'${n.imp}',t:${JSON.stringify(n.t)},tags:${tags},\n` +
    `   tx:${JSON.stringify(n.tx)},${src}},\n`
  );
}

function fmtHzEvent(d, e) {
  const region = e.region ? `,region:'${e.region}'` : '';
  return `  {d:'${d}',type:'${e.type}',desc:${JSON.stringify(e.desc)},lat:${e.lat},lng:${e.lng},count:${e.count}${region}},\n`;
}

function fmtMilestone(d, ms) {
  const kw   = JSON.stringify(ms.kw);
  const cats = JSON.stringify(ms.cats);
  const ll   = (ms.lat != null) ? `, lat:${ms.lat}, lng:${ms.lng}` : '';
  return `  {d:'${d}', icon:'${ms.icon}', label:${JSON.stringify(ms.label)}, kw:${kw}, cats:${cats}${ll}},\n`;
}

// ── Validation ────────────────────────────────────────────────────────────────

function validate(update) {
  const errors = [];

  if (!update.date || !/^\d{4}-\d{2}-\d{2}$/.test(update.date))
    errors.push('Missing or invalid date (must be YYYY-MM-DD)');

  const required = ['escalation_score', 'headline', 'sub', 'oil', 'gold',
                    'suez', 'insurance', 'notam', 'casualties', 'displacement'];
  for (const k of required)
    if (update[k] == null) errors.push(`Missing required field: ${k}`);

  if (update.escalation_score < 1 || update.escalation_score > 10)
    errors.push('escalation_score must be 1–10');

  // Verify casualty figures don't decrease (check against last entry in file)
  // (Just a reminder — full check would require parsing the file)

  if (errors.length) {
    console.error('\nValidation errors:');
    errors.forEach(e => console.error(`  ✗ ${e}`));
    process.exit(1);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

function run() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error('Usage: node scripts/daily-update.js <update.json>');
    console.error('       node scripts/daily-update.js updates/2026-04-02.json');
    process.exit(1);
  }

  const update = JSON.parse(fs.readFileSync(path.resolve(inputPath), 'utf8'));
  validate(update);

  const d = update.date;
  console.log(`\nApplying MTS daily update for ${d}...\n`);

  let content = readData();

  // 1. Extend days[]
  console.log('  [1/8] Extending days[] to', d);
  content = extendDays(content, d);

  // 2. Time-series objects (insert before closing }; of each)
  const cas = update.casualties;
  const dis = update.displacement;

  const tsUpdates = [
    ['ESCALATION_SCORES',
      `  '${d}':${update.escalation_score},\n`],

    ['OIL_PRICE_DATA',
      `  '${d}':{brent:${update.oil.brent},wti:${update.oil.wti}},\n`],

    ['GOLD_PRICE_DATA',
      `  '${d}':${update.gold},\n`],

    ['SUEZ_DATA',
      `  '${d}':${update.suez},\n`],

    ['INSURANCE_DATA',
      `  '${d}':{gulf:${update.insurance.gulf},redsea:${update.insurance.redsea},eastmed:${update.insurance.eastmed}},\n`],

    ['NOTAM_DATA',
      `  '${d}':{closed:${update.notam.closed},restricted:${update.notam.restricted},total:${update.notam.total}},\n`],

    ['CASUALTY_DATA',
      `  '${d}': {coalition:{deaths:${cas.coalition.deaths},injuries:${cas.coalition.injuries}}, ` +
      `axis:{deaths:${cas.axis.deaths},injuries:${cas.axis.injuries}}, ` +
      `civilian:{deaths:${cas.civilian.deaths},injuries:${cas.civilian.injuries}}},\n`],

    ['DISPLACEMENT_DATA',
      `  '${d}': {${Object.entries(dis).map(([k,v]) => `${k}:${v}`).join(', ')}},\n`],
  ];

  console.log('  [2/8] Updating time-series objects');
  for (const [name, entry] of tsUpdates) {
    process.stdout.write(`         ${name} ... `);
    content = insertBeforeClose(content, name, entry);
    console.log('ok');
  }

  // 3. DAILY_HEADLINES
  console.log('  [3/8] DAILY_HEADLINES');
  const hlEntry =
    `  '${d}':{headline:${JSON.stringify(update.headline)},sub:${JSON.stringify(update.sub)}},\n`;
  content = insertBeforeClose(content, 'DAILY_HEADLINES', hlEntry);

  // 4. news[]
  const newsItems = update.news || [];
  console.log(`  [4/8] news[] — ${newsItems.length} item(s)`);
  if (newsItems.length) {
    const newsText = newsItems.map(n => fmtNews(d, n)).join('');
    content = insertBeforeClose(content, 'news', newsText);
  }

  // 5. HZ_EVENTS[]
  const hzItems = update.hz_events || [];
  console.log(`  [5/8] HZ_EVENTS[] — ${hzItems.length} item(s)`);
  if (hzItems.length) {
    const hzText = '\n' + hzItems.map(e => fmtHzEvent(d, e)).join('');
    content = insertBeforeClose(content, 'HZ_EVENTS', hzText);
  }

  // 6. MILESTONES[]
  const msItems = update.milestones || [];
  console.log(`  [6/8] MILESTONES[] — ${msItems.length} item(s)`);
  if (msItems.length) {
    const msText = msItems.map(m => fmtMilestone(d, m)).join('');
    content = insertBeforeClose(content, 'MILESTONES', msText);
  }

  // 7. countryPosture updates
  const posture = update.posture_updates || {};
  const postureKeys = Object.keys(posture);
  console.log(`  [7/8] countryPosture — ${postureKeys.length} country update(s)`);
  for (const [country, text] of Object.entries(posture)) {
    process.stdout.write(`         '${country}' ... `);
    content = updatePosture(content, country, text);
    console.log('ok');
  }

  // 8. Write back
  console.log('  [8/8] Writing src/data.js');
  writeData(content);

  console.log(`\n✓ Done — src/data.js updated for ${d}`);
  console.log('\nNext steps:');
  console.log('  1. Open the site and verify the new day looks correct');
  console.log('  2. git add src/data.js');
  console.log(`  3. git commit -m "Daily update: ${d}"`);
  console.log('  4. git push\n');
}

run();
