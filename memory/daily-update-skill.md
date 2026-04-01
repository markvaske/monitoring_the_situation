# MTS Daily Update Procedure

## CRITICAL — Real Events Only

MTS tracks **real-world events**. Every data point must be sourced from verifiable reporting.

- Use web search to find actual news for the date being updated
- Never invent, fabricate, or extrapolate events
- Never fill gaps with plausible-sounding fiction
- If a figure (casualty count, oil price, etc.) cannot be verified, carry the last known value forward and note it
- Cite sources — if you cannot name a real outlet that reported it, don't include it

---

## How Updates Work (Script-Based)

Data is inserted via `scripts/daily-update.js`, not by editing `src/data.js` directly.
The script patches all 13 data structures in one run from a single JSON input file.

```
updates/
  2026-03-31.json   ← completed update files (one per day)
  2026-04-01.json
  ...

scripts/
  daily-update.js         ← the update script
  update-template.json    ← blank template to copy
```

**Do NOT manually edit `src/data.js`** for time-series or event data — use the script.
Manual edits to `src/data.js` are still needed for: `conflictPhases[]`, `phases[]`, `CONFLICT_PHASES_NAMED[]`, `conflictSides{}`, `FACTION_DETAIL{}` (rare structural changes only).

---

## Context / Credit Efficiency

`/compact` cannot be automated into the shell script — it is a Claude Code UI command only.
The practical equivalent is **starting a new Claude session** for each update rather than continuing an old one. A fresh session has no accumulated context and costs the least.

To keep update sessions lean:
1. Start a new `claude` session (not `--continue`)
2. Ask Claude to generate the JSON file only — do not ask it to read `data.js` or make edits
3. Run the script yourself: `node scripts/daily-update.js updates/YYYY-MM-DD.json`
4. Commit and push yourself

For price data, pre-fetch before opening Claude to eliminate web search calls:
- Oil: https://www.eia.gov/opendata/ (EIA API, free)
- Gold: https://metals-api.com or https://goldprice.org
- Paste the prices into your prompt so Claude doesn't need to search for them

---

## Step-by-Step Procedure

### Step 1 — Start a fresh Claude session

Open a new session (not `--continue`). This is the free equivalent of `/compact`.

### Step 2 — Run the prep script (fetches prices automatically)

```bash
node scripts/prep-update.js             # today
node scripts/prep-update.js 2026-04-02  # specific date
```

This creates `updates/YYYY-MM-DD.json` with `date`, `oil`, and `gold` already populated from Yahoo Finance. If the market is closed (weekend/holiday), it carries the last known values forward automatically.

The script also prints the exact Claude prompt to use — copy it.

### Step 3 — Give Claude the pre-filled file to complete

Paste the prompt printed by the prep script into a **new Claude session**. Claude only needs to:
- Search for news (2 searches)
- Fill in: `escalation_score`, `headline`, `sub`, `suez`, `insurance`, `notam`, `casualties`, `displacement`, `news[]`, `hz_events[]`, `milestones[]`, `posture_updates`

Claude should return the completed JSON. Save it to `updates/YYYY-MM-DD.json`.

Required fields:
| Field | Notes |
|---|---|
| `date` | YYYY-MM-DD |
| `escalation_score` | 1–10 |
| `headline` + `sub` | Lead story and detail |
| `oil` `{brent, wti}` | End-of-day USD/bbl. Carry weekend/holiday forward |
| `gold` | Spot price USD/oz |
| `suez` | Daily Suez Canal transit count |
| `insurance` `{gulf, redsea, eastmed}` | War risk % hull value |
| `notam` `{closed, restricted, total}` | Active NOTAMs |
| `casualties` | Cumulative — coalition / axis / civilian |
| `displacement` | Cumulative — Iran, Lebanon, Iraq, Syria, UAE, Kuwait |
| `news[]` | 4–8 items. See categories/flags below |
| `hz_events[]` | Maritime events at Hormuz and Red Sea |
| `milestones[]` | Major turning points only — leave `[]` if nothing qualifies |
| `posture_updates{}` | Countries where situation changed — one paragraph max each |

### Step 4 — Run the script

```bash
node scripts/daily-update.js updates/YYYY-MM-DD.json
```

The script will:
1. Extend `days[]` to the new date
2. Insert entries into all 8 time-series objects
3. Insert the `DAILY_HEADLINES` entry
4. Append to `news[]`, `HZ_EVENTS[]`, `MILESTONES[]`
5. Replace updated `countryPosture{}` entries

### Step 5 — Verify

Open the site locally and check that the new day:
- Appears in the calendar
- Shows the correct headline
- Charts reflect the new data points (oil, gold, casualties)
- No console errors

Also verify in `src/data.js`:
- Cumulative figures (casualties, displacement) never decrease day-over-day
- All date keys are in `YYYY-MM-DD` format

### Step 6 — Commit and push

```bash
git add src/data.js updates/YYYY-MM-DD.json
git commit -m "Daily update: [date or date range]"
git push
```

---

## News Item Categories
- `military` — strikes, operations, troop movements, weapons
- `aviation` — airport closures, NOTAMs, airspace, airline decisions
- `maritime` — Hormuz, Red Sea, shipping, mines, naval
- `diplomatic` — negotiations, statements, sanctions, alliances
- `stocks` — markets, oil, gold, economic impacts
- `humanitarian` — casualties, displacement, aid, civilian impact
- `general` — anything that doesn't fit above

## Importance Flags
- `e` — escalation (makes conflict worse)
- `d` — de-escalation (diplomatic progress, ceasefires)
- `n` — neutral (informational)

## Manually-Updated Structures (do not use the script for these)
| Structure | When to update |
|---|---|
| `conflictPhases[]` | Country status changes: `war` / `attack` / `peace` |
| `phases[]` | Airport status changes: `Closed` / `Restricted` / `Open` |
| `CONFLICT_PHASES_NAMED[]` | Current phase summary has evolved significantly |
| `conflictSides{}` | New country joins a faction |
| `FACTION_DETAIL{}` | New faction or major faction change |

---

## Last Updated
- Data current through: **2026-04-01**
- Next dates needed: 2026-04-02, 2026-04-03, ...
