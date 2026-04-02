# Project Rules — MTS (Monitoring The Situation)

Follow V3.0 Spec (Notes DB) for all standard procedures.

## Project-Specific Conventions

### CRITICAL — Data Integrity
- MTS tracks **real-world events only**. This is NOT a hypothetical or fictional scenario.
- Every news item, casualty figure, price, milestone, and posture update must be sourced from verifiable real-world reporting.
- When running daily updates, always use web search to find actual events. Never invent, extrapolate, or fabricate data.
- If a data point cannot be verified, omit it rather than estimate.

### Architecture
- Multi-file structure: `index.html` (HTML shell), `styles.css`, `src/data.js`, `src/map.js`, `src/main.js`.
- Canvas context variable is `ctx2` (NOT `ctx` — conflicts with DOM element `#ctx`).
- Country polygons from Natural Earth 50m GeoJSON (real data). Bahrain hand-drawn (too small).
- Uniform-scale Mercator projection. `lx(ln)`/`ly(lt)` for coordinate transforms.
- `drawMap()` delegates to `drawSeaLayers()` and `drawAirLayers()`.
- DPR-aware hit-testing encapsulated in `hitTestCountries()`.

### CSS Namespace
- Spacing tokens: `--sp-xs`(4) `--sp-sm`(8) `--sp-md`(12) `--sp-lg`(16) `--sp-xl`(20) `--sp-2xl`(28).
- Dark/OPSEC theme only. No light mode.

### Data Layer
- Data lives in `src/data.js` (extracted from monolith 2026-04-01).
- `days[]` = Feb 25–Mar 27, 2026 (last updated). `daysSet` for O(1) lookups.
- Daily data structures: see `memory/daily-update-skill.md` for the full list.
- Faction system: `countryFaction{}`, `FACTION_DETAIL{}`, `COUNTRY_ECON{}`, `conflictSides{}`, `countryPosture{}`, `countryFlags{}`.
- New faction country checklist: add entries to all 6 structures above.

### Daily Updates
- When user says "update" → follow `memory/daily-update-skill.md`.
- After data updates, also update `countryPosture{}` (one paragraph per country max).

### Deployment
- Live at: https://markvaske.github.io/monitoring_the_situation
- Repo: https://github.com/markvaske/monitoring_the_situation
- Deploy: `git add -A && git commit -m "message" && git push` — Pages updates automatically.

## Counters & State
- Prompt counter: 4
- Next maintenance: prompt 10
- Concept learning queue: (empty)
- Current version: v1.0.0

## Project Notion IDs
- Project entry: `330b53061c7681eb83aefcf3dd3e56b7`
- Notes:
  - Build Guide: `331b53061c76818780e0ec85789aa57b`
  - Design Guide: `331b53061c7681a8a1f6ee643b1c399e`
  - Technical Decisions: `331b53061c768182a296dedded82d0a5`
  - Platform Evolution: `331b53061c768141b73cc7d276d4d194`
  - Changelog (Legacy): `331b53061c7681c7be8dd1712a852d74`
  - Data Provenance Audit: `331b53061c7681be8a40de2cc76a3b99`
  - Daily Update Procedure: `331b53061c76811db35bd53db3483fa0`
- Changelog: v1.0.0 → `331b53061c7681bba264ee735beea712`
- Features: 8 entries in shared Features DB (see Notion)
- Tasks: 15 entries in shared Tasks DB (see Notion)
