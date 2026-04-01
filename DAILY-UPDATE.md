# MTS Daily Update Guide

## Overview

Three steps. You run two commands. Claude fills in one JSON file.

```
node scripts/prep-update.js          ← you run this
  → paste printed prompt into Claude
  → save Claude's JSON output
node scripts/daily-update.js ...     ← you run this
git add / commit / push              ← you run this
```

---

## Step 1 — Run the prep script

```bash
node scripts/prep-update.js
```

Or for a specific date:

```bash
node scripts/prep-update.js 2026-04-02
```

**What it does:**
- Fetches live Brent, WTI, and gold prices from Yahoo Finance
- Creates `updates/YYYY-MM-DD.json` with date and prices pre-filled
- Prints the Claude prompt to use (copy it)

**Output file location:** `updates/YYYY-MM-DD.json`

---

## Step 2 — Ask Claude to complete the file

1. Open a **new Claude session** (not --continue — fresh context = fewer credits)
2. Paste the prompt printed by the prep script. It looks like:

```
Fill in updates/2026-04-02.json for 2026-04-02.
Prices are already populated — fill in escalation_score,
headline, sub, suez, insurance, notam, casualties,
displacement, news[], hz_events[], milestones[], and
posture_updates. Search: "Iran Israel war 2026-04-02"
and "Strait of Hormuz 2026-04-02".
```

3. Claude will search for news and return a completed JSON block
4. Copy the JSON and save it to `updates/YYYY-MM-DD.json` (replacing the prep file)

**Before saving, quickly check:**
- [ ] Casualty and displacement figures are higher than the previous day (they're cumulative)
- [ ] `escalation_score` is between 1–10
- [ ] `_instructions` key has been removed
- [ ] At least 4 news items with sources

---

## Step 3 — Run the update script

```bash
node scripts/daily-update.js updates/2026-04-02.json
```

**What it does:**
- Extends the date range in `src/data.js`
- Inserts the new day's data into all 13 structures
- Updates `countryPosture` for changed countries
- Prints confirmation and next steps

If there's an error, it will tell you which structure failed — fix the JSON and re-run.

---

## Step 4 — Verify

Open `index.html` in a browser (or the live site) and check:
- [ ] New date appears in the calendar
- [ ] Correct headline shows for the new day
- [ ] Oil/gold charts include the new data point
- [ ] No browser console errors

---

## Step 5 — Commit and push

```bash
git add src/data.js updates/2026-04-02.json
git commit -m "Daily update: Apr 2"
git push
```

GitHub Pages deploys automatically. Live in ~60 seconds at:
https://markvaske.github.io/monitoring_the_situation

---

## Quick Reference

### File locations
| File | Purpose |
|---|---|
| `scripts/prep-update.js` | Fetches prices, creates pre-filled JSON |
| `scripts/daily-update.js` | Patches `src/data.js` from JSON input |
| `scripts/update-template.json` | Blank template with field documentation |
| `updates/YYYY-MM-DD.json` | Completed update files (one per day) |
| `src/data.js` | The data file — do not edit manually for daily updates |

### What needs manual editing (rare)
These are NOT handled by the script. Edit `src/data.js` directly if:
- A country's conflict status changes → `conflictPhases[]`
- An airport opens or closes → `phases[]`
- A new country joins a faction → `conflictSides{}` + `FACTION_DETAIL{}`

### Escalation score guide
| Score | Label | When to use |
|---|---|---|
| 1–2 | LOW / GUARDED | Pre-conflict tensions |
| 3–4 | ELEVATED | Diplomatic crisis, no combat |
| 5–6 | HIGH | Limited strikes or skirmishes |
| 7–8 | SEVERE | Active multi-front conflict |
| 9 | CRITICAL | Intense sustained combat |
| 10 | MAXIMUM | Peak escalation, infrastructure attacks, mass casualties |

### News importance flags
- `e` — escalation (strikes, threats, new fronts)
- `d` — de-escalation (ceasefires, diplomatic progress)
- `n` — neutral (status updates, troop movements, market data)
