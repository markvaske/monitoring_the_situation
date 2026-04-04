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
 *   1. Extends the days[] date range in src/data.js (one small regex)
 *   2. Appends/updates entries in src/data-store/ JSON files
 *      — no more regex surgery on JS source code
 *
 * What it does NOT do:
 *   - conflictPhases[] / phases[] changes (too rare; edit data.js manually)
 *   - conflictSides{} or FACTION_DETAIL{} (structural; edit data.js manually)
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT       = path.resolve(__dirname, '..');
const DATA_FILE  = path.join(ROOT, 'src', 'data.js');
const STORE_DIR  = path.join(ROOT, 'src', 'data-store');

// ── JSON helpers ──────────────────────────────────────────────────────────────

function readJson(filename) {
  const p = path.join(STORE_DIR, filename);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeJson(filename, data) {
  const p = path.join(STORE_DIR, filename);
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function updateJson(filename, updaterFn) {
  const data = readJson(filename);
  updaterFn(data);
  writeJson(filename, data);
}

// ── Extend days[] end date in data.js ─────────────────────────────────────────
// This is the ONE remaining regex touch on data.js — the rest is pure JSON.

function extendDays(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  let content = fs.readFileSync(DATA_FILE, 'utf8');
  const updated = content.replace(
    /const s = new Date\(\d+, \d+, \d+\), e = new Date\(\d+, \d+, \d+\)/,
    `const s = new Date(${y}, 1, 25), e = new Date(${y}, ${m - 1}, ${d})`
  );
  if (updated === content) {
    console.warn('  [WARN] extendDays: date range pattern not found in data.js — skipping');
    return false;
  }
  fs.writeFileSync(DATA_FILE, updated, 'utf8');
  return true;
}

// ── Validation ────────────────────────────────────────────────────────────────

function validate(update) {
  const errors = [];

  if (!update.date || !/^\d{4}-\d{2}-\d{2}$/.test(update.date))
    errors.push('Missing or invalid date (must be YYYY-MM-DD)');

  if (update._draft || update._instructions)
    errors.push('File still has _draft or _instructions fields — review and remove before applying');

  const required = ['escalation_score', 'headline', 'sub', 'oil', 'gold',
                    'suez', 'insurance', 'notam', 'casualties', 'displacement'];
  for (const k of required)
    if (update[k] == null) errors.push(`Missing required field: ${k}`);

  if (update.escalation_score != null &&
      (update.escalation_score < 1 || update.escalation_score > 10))
    errors.push('escalation_score must be 1–10');

  // Verify casualty figures don't decrease against last known entry
  try {
    const cas = readJson('casualty-data.json');
    const dates = Object.keys(cas).sort();
    const lastDate = dates[dates.length - 1];
    if (lastDate && update.casualties) {
      const last = cas[lastDate];
      const sides = ['coalition', 'axis', 'civilian'];
      const fields = ['deaths', 'injuries'];
      for (const s of sides) {
        for (const f of fields) {
          const prev = last[s]?.[f] ?? 0;
          const next = update.casualties[s]?.[f] ?? 0;
          if (next < prev)
            errors.push(`casualties.${s}.${f} decreased: ${prev} → ${next} (figures must be cumulative)`);
        }
      }
    }
  } catch { /* casualty-data.json not readable — skip check */ }

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

  const d   = update.date;
  const cas = update.casualties;
  const dis = update.displacement;
  console.log(`\nApplying MTS daily update for ${d}...\n`);

  // 1. Extend days[] in data.js
  process.stdout.write('  [1/9] Extending days[] in data.js ... ');
  console.log(extendDays(d) ? 'ok' : 'skipped');

  // 2. Time-series scalar/object entries
  console.log('  [2/9] Time-series JSON files');

  process.stdout.write('         escalation-scores.json ... ');
  updateJson('escalation-scores.json', obj => { obj[d] = update.escalation_score; });
  console.log('ok');

  process.stdout.write('         oil-prices.json ... ');
  updateJson('oil-prices.json', obj => { obj[d] = { brent: update.oil.brent, wti: update.oil.wti }; });
  console.log('ok');

  process.stdout.write('         gold-prices.json ... ');
  updateJson('gold-prices.json', obj => { obj[d] = update.gold; });
  console.log('ok');

  process.stdout.write('         suez-data.json ... ');
  updateJson('suez-data.json', obj => { obj[d] = update.suez; });
  console.log('ok');

  process.stdout.write('         insurance-data.json ... ');
  updateJson('insurance-data.json', obj => {
    obj[d] = { gulf: update.insurance.gulf, redsea: update.insurance.redsea, eastmed: update.insurance.eastmed };
  });
  console.log('ok');

  process.stdout.write('         notam-data.json ... ');
  updateJson('notam-data.json', obj => {
    obj[d] = { closed: update.notam.closed, restricted: update.notam.restricted, total: update.notam.total };
  });
  console.log('ok');

  process.stdout.write('         casualty-data.json ... ');
  updateJson('casualty-data.json', obj => {
    obj[d] = {
      coalition: { deaths: cas.coalition.deaths, injuries: cas.coalition.injuries },
      axis:      { deaths: cas.axis.deaths,      injuries: cas.axis.injuries      },
      civilian:  { deaths: cas.civilian.deaths,  injuries: cas.civilian.injuries  },
    };
  });
  console.log('ok');

  process.stdout.write('         displacement-data.json ... ');
  updateJson('displacement-data.json', obj => { obj[d] = { ...dis }; });
  console.log('ok');

  // 3. Daily headlines
  process.stdout.write('  [3/9] daily-headlines.json ... ');
  updateJson('daily-headlines.json', obj => {
    obj[d] = { headline: update.headline, sub: update.sub };
  });
  console.log('ok');

  // 4. news[]
  const newsItems = update.news || [];
  console.log(`  [4/9] news.json — ${newsItems.length} item(s)`);
  if (newsItems.length) {
    updateJson('news.json', arr => {
      for (const n of newsItems) {
        const entry = { d, cat: n.cat, imp: n.imp, t: n.t, tags: n.tags, tx: n.tx };
        if (n.l) entry.l = n.l;
        if (n.s) entry.s = n.s;
        arr.push(entry);
      }
    });
  }

  // 5. HZ events
  const hzItems = update.hz_events || [];
  console.log(`  [5/9] hz-events.json — ${hzItems.length} item(s)`);
  if (hzItems.length) {
    updateJson('hz-events.json', arr => {
      for (const e of hzItems) {
        const entry = { d, type: e.type, desc: e.desc, lat: e.lat, lng: e.lng, count: e.count };
        if (e.region) entry.region = e.region;
        arr.push(entry);
      }
    });
  }

  // 6. Milestones
  const msItems = update.milestones || [];
  console.log(`  [6/9] milestones.json — ${msItems.length} item(s)`);
  if (msItems.length) {
    updateJson('milestones.json', arr => {
      for (const m of msItems) {
        const entry = { d, icon: m.icon, label: m.label, kw: m.kw, cats: m.cats };
        if (m.lat != null) { entry.lat = m.lat; entry.lng = m.lng; }
        arr.push(entry);
      }
    });
  }

  // 7. countryPosture
  const posture = update.posture_updates || {};
  const postureKeys = Object.keys(posture);
  console.log(`  [7/9] country-posture.json — ${postureKeys.length} country update(s)`);
  if (postureKeys.length) {
    updateJson('country-posture.json', obj => {
      for (const [country, text] of Object.entries(posture)) {
        if (!(country in obj)) {
          console.warn(`  [WARN] country-posture.json: key not found: '${country}' — adding new entry`);
        }
        obj[country] = text;
      }
    });
  }

  // 8. Verify all touched JSON files still parse
  process.stdout.write('  [8/9] Verifying JSON integrity ... ');
  const touched = [
    'escalation-scores.json', 'oil-prices.json', 'gold-prices.json', 'suez-data.json',
    'insurance-data.json', 'notam-data.json', 'casualty-data.json', 'displacement-data.json',
    'daily-headlines.json',
    ...(newsItems.length  ? ['news.json']       : []),
    ...(hzItems.length    ? ['hz-events.json']  : []),
    ...(msItems.length    ? ['milestones.json'] : []),
    ...(postureKeys.length ? ['country-posture.json'] : []),
  ];
  for (const f of touched) {
    try { readJson(f); }
    catch (err) { console.error(`\n  ✗ ${f}: ${err.message}`); process.exit(1); }
  }
  console.log('ok');

  // 9. Done
  console.log('  [9/9] Complete\n');
  console.log(`✓ Done — MTS updated for ${d}`);
  console.log('\nNext steps:');
  console.log('  1. Open the site and verify the new day looks correct');
  console.log('  2. git add src/data.js src/data-store/');
  console.log(`  3. git commit -m "Daily update: ${d}"`);
  console.log('  4. git push\n');
}

run();
