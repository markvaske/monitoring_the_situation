# MTS — Monitoring The Situation

## Project Overview

A real-time conflict tracker for a hypothetical Iran-Israel-US war starting February 28, 2026. Visualizes airport closures, maritime activity (Strait of Hormuz, Red Sea), military operations, diplomatic developments, economic impacts, and humanitarian data across 20+ Middle East countries. Built as a static multi-file web app deployed to GitHub Pages — no build step, no server, no framework.

**Target users:** Analysts, journalists, policy researchers tracking a multi-theater conflict scenario.
**Core value:** Dense, interactive, multi-domain situational awareness in a single page.

---

## Tech Stack & Dependencies

| Layer | Technology | Notes |
|-------|-----------|-------|
| Languages | HTML5, CSS3, ES6+ JavaScript | No transpilation |
| Rendering | Canvas 2D API | Maps, charts (8 chart types) |
| Fonts | Google Fonts (DM Sans, DM Serif Display) | `@import` in `styles.css` |
| Maps | Custom Mercator projection | Country polygons from Natural Earth 50m GeoJSON |
| Hosting | GitHub Pages | Auto-deploys on push to `main` |
| External APIs | None | All data is embedded in `src/data.js` |

**No other dependencies.** No npm, no bundler, no framework.

---

## Environment Setup

1. Clone repo: `git clone https://github.com/markvaske/monitoring_the_situation`
2. Open `index.html` directly in browser for local preview (no server needed)
3. Edit source files in `src/` or `index.html`/`styles.css`
4. Deploy: `git add -A && git commit -m "message" && git push` — Pages updates automatically
5. Live site: https://markvaske.github.io/monitoring_the_situation

---

## Architecture

### Multi-File Structure

| File | Role |
|------|------|
| `index.html` | HTML shell — layout, nav, panels, script/style tags |
| `styles.css` | All CSS — theme variables, layout, responsive breakpoints |
| `src/data.js` | All data structures + rendering helpers + daily update functions |
| `src/map.js` | Canvas map rendering — draw layers, hit testing, tooltips |
| `src/main.js` | UI logic — charts, event handlers, calendar, news, filters, init |
| `scripts/daily-update.js` | Node.js script for applying daily JSON update files |
| `scripts/prep-update.js` | Node.js script for fetching current price data |
| `updates/YYYY-MM-DD.json` | Daily update input files (one per day) |

### Canvas Map Architecture

- **Single canvas** (`#mc`) with uniform-scale Mercator projection
- Context variable is `ctx2` (NOT `ctx` — conflicts with DOM element `#ctx`)
- `_updateMapScale(w,h)` → `lx(lng)` / `ly(lat)` coordinate transforms
- Viewport: `{lnMin:28, lnMax:67, ltMin:9, ltMax:45}`
- Zoom/pan: `aZoom` (1–12), `aPanX`/`aPanY`, drag-to-pan, button zoom
- DPR-aware hit testing via `hitTestCountries()` (paths in CSS space, test with `mx*dpr, my*dpr`)

### Draw Layer Order

Context countries → conflict countries → faction overlay → water labels → sea layers (Houthi zones, shipping lanes, corridors, locations, events) → air layers (NFZ, bypass routes, jamming, bases, fleet, naval, airports) → infrastructure markers → refugee flow arrows → context labels

### Tooltip Priority

Airports → mil bases → fleet → naval facilities → jamming zones → maritime locations → countries

---

## Data Structures & Models

### Geographic Data

| Structure | Description |
|-----------|------------|
| `AP[]` | 27 airports: `{c, n, co, lat, lng}` |
| `CP{}` | Conflict country polygons from Natural Earth 50m GeoJSON. MultiPolygon: Turkey (2 rings), Oman (2 rings). Bahrain hand-drawn. India and Pakistan included as neutral faction countries. |
| `CP_CTX{}` | 26 context country polygons. MultiPolygon: Azerbaijan (Nakhchivan), Greece (Crete+mainland). All 50m resolution. |
| `CTX_LABEL_POS{}` | Explicit label positions (lng/lat) for 26 context countries |
| `countryFlags{}` | Country → emoji flag pair. **Only flag emojis — no other text.** |
| `MIL_BASES[]` | 13 military bases with lat/lng/side/desc |
| `FLEET_POS[]` | 9 fleet positions (carrier strike groups, task forces, IRGCN) |
| `NAVAL_FACILITIES[]` | 11 naval bases/facilities |
| `CIVILIAN_INFRA[]` | 20 infrastructure items (hospitals, power, desal, cable) |
| `REFUGEE_FLOWS[]` | 8 directional flow arrows with from/to lat/lng |
| `MAP_WATER_LABELS[]` | 6 water body labels with rotation |
| `HZ_WATER_LABELS[]` | 5 maritime water body labels |

### Conflict & Status Data

| Structure | Description |
|-----------|------------|
| `conflictPhases[]` | `['date', {country:'war'\|'attack'\|'peace'}]` |
| `CONFLICT_PHASES_NAMED[]` | 5 named phases: Initial Strikes (Feb 28), Regional Escalation (Mar 1), Strait Crisis (Mar 6), Diplomatic Window (Mar 11), Widening War (Mar 15) |
| `phases[]` | `['date', {IATA:'Closed'\|'Restricted'\|'Open'}]` |
| `MILESTONES[]` | Curated key events: `{d, icon, label, kw, cats, lat?, lng?}` |
| `ESCALATION_SCORES{}` | Per-day 1-10 threat scores |
| `ESC_LABELS{}` | Score → label mapping (LOW through MAXIMUM) |

### Time Series Data

| Structure | Description |
|-----------|------------|
| `days[]` | Date strings array (Feb 25–Apr 1, 2026), `daysSet` for O(1) lookups |
| `news[]` | 500+ items: `{d, cat, imp, t, tags, tx, l?, s?}` |
| `DAILY_HEADLINES{}` | Per-date `{headline, sub}` |
| `CASUALTY_DATA{}` | Per-day cumulative: `{coalition/axis/civilian:{deaths,injuries}}` |
| `DISPLACEMENT_DATA{}` | Per-day cumulative by country (Iran, Lebanon, Iraq, Syria, UAE, Kuwait) |
| `OIL_PRICE_DATA{}` | Per-day `{brent, wti}` in USD/bbl |
| `GOLD_PRICE_DATA{}` | Per-day gold spot price USD/oz |
| `SUEZ_DATA{}` | Per-day Suez Canal transit count |
| `SHIPPING_DATA{}` | Computed from HZ_EVENTS passage entries |
| `INSURANCE_DATA{}` | Per-day `{gulf, redsea, eastmed}` war risk % hull value |
| `NOTAM_DATA{}` | Per-day `{closed, restricted, total}` active NOTAMs |

### Maritime Data

| Structure | Description |
|-----------|------------|
| `HZ_EVENTS[]` | Maritime events: `{d, type, desc, lat, lng, count, region?}`. Types: mine, cleared, patrol, passage. Passages use `region:'redsea'` for Bab el-Mandeb |
| `HZ_LANES[]` | Shipping lane paths |
| `HZ_LOCS[]` | Maritime location markers |
| `HOUTHI_ZONES[]` | 3 threat zone circles |
| `SAFE_CORRIDORS[]` | Coalition escort routes |

### Faction & Country Data

| Structure | Description |
|-----------|------------|
| `countryFaction{}` | Country → `{faction, role}`. Coalition: USA, Israel, Saudi Arabia, Qatar, Bahrain, Jordan, UK, France, Germany, Italy. Axis: Iran, Syria, Iraq, Lebanon, Yemen. Neutral: UAE, Kuwait, Oman, Egypt, Turkey, India, Pakistan, Azerbaijan, Russia, Japan. |
| `countryPosture{}` | Country → current posture paragraph (updated with each daily data update) |
| `conflictSides{}` | 3 faction groups with `{label, countries[]}` — must match countryFaction membership |
| `FACTION_DETAIL{}` | Per-country detail cards: `{name, flag, role, roleClass, body}` |
| `COUNTRY_ECON{}` | 21 countries: GDP, oil revenue, sovereign fund, imports, war cost |
| `KEY_PEOPLE[]` | Key figures: `{name, flag, faction, title, status, desc}`. Status: killed/active/unknown |
| `maritimePosture{}` | Country → naval posture summary |

> **Standing rule:** When adding a country to `countryFaction`, also add entries to `FACTION_DETAIL`, `COUNTRY_ECON`, `conflictSides`, `countryPosture`, and `countryFlags`. All five are required for full faction status.

> **countryFlags warning:** Values must be emoji flag pairs only (e.g. `'\u{1F1FA}\u{1F1F8}'`). The `daily-update.js` script's `updatePosture()` previously matched keys file-wide and could corrupt this object — fixed 2026-04-01 to scope search to `countryPosture` block only.

### Color System

| Structure | Description |
|-----------|------------|
| `FC{}` | Canonical faction colors: coalition=#00e5ff, axis=#ff2d7b, neutral=#ffe100 |
| `CONFLICT_FILLS` / `_BOLD` / `_HOVER` | War/attack/peace fill colors |
| `ESC_SPECTRUM[]` | 10-element escalation color gradient |
| `DISPLACEMENT_COLORS{}` | Country → chart color |
| `INFRA_ICONS{}` / `INFRA_COLORS{}` | Infrastructure type → emoji/color |

---

## Feature Inventory

### Navigation & Controls
- **Fixed nav bar** (52px): animated radar logo, "MTS" title, conflict status indicator, escalation indicator (1-10 scale), date navigation (◀ ▶), calendar popup, key people popup, charts toggle
- **Date stepping**: `stepDay(±1)`, `updateDayNav()`, calendar popup with day cells colored by `getTrendColor()`
- **Key people popup**: key figures in grid, status badges (killed/active/unknown)

### Maps
- **Unified canvas map** with Air and Sea layer groups
- **Country interaction**: hover highlight, click to select/filter, multi-select via Set, faction-based selection
- **Country popup**: airport status grid + naval posture + recent maritime events
- **Air layers**: airports (open/restricted/closed), coalition bases, Iran bases, no-fly zones (6 FIRs), bypass routes (4 main + branches), GPS jamming zones, fleet positions, naval facilities, civilian infrastructure, refugee flows, faction overlay patterns
- **Sea layers**: mines, cleared areas, patrols, passages (Hormuz + Red Sea split), Houthi threat zones, shipping lanes, safe corridors, naval facilities
- **Zoom/pan**: 1–12x zoom, drag-to-pan, preset views (Theater/Conflict/Gulf)

### Charts (collapsible overlay)
- **Calendar** (28-day paginated) + **7-Day Trend** indicator
- **Casualties**: stacked area by faction, mode toggle (all/deaths/injuries), per-faction visibility
- **Displaced & Refugees**: stacked area by country, per-country toggles
- **Oil Prices**: Brent + WTI dual line chart
- **Shipping Transits**: Hormuz + Red Sea + Suez
- **Flight Disruptions**: open/restricted/closed airport counts
- **Gold Price**: spot price line chart
- **War Risk Insurance**: Gulf + Red Sea + East Med premium lines
- **Active NOTAMs**: stacked area (closed + restricted) with total line

### News & Timeline
- **Daily headline hero**: newspaper-style headline + subhead
- **Conflict timeline (Gantt)**: 5 clickable phases, phase summary, milestone table with clickable chips
- **News feed**: phase-driven grouping, category filter chips, topic deduplication, milestone tags, country-linked interactive text
- **Milestone selection**: filters news by keywords, pans/zooms map to lat/lng

### Filtering
- **Country filter**: `selCo` Set, multi-select, click country name anywhere to toggle
- **Faction filter**: `selFactions` Set, toggles all countries in faction
- **News category filter**: `newsCatFilter` for aviation/maritime/military/stocks/diplomatic/humanitarian/general
- **All layers respect filters**: map layers, news, charts

### Factions
- **Three factions**: coalition (cyan), axis (pink), neutral (amber)
- **Faction detail cards**: country name, flag, role, posture paragraph, economic badges (GDP, oil revenue, sovereign fund, war cost)
- **Faction overlay**: diagonal stripe patterns on map (coalition=forward diagonals, axis=X cross-hatch, neutral=horizontal dashes)

---

## Styling & UI

### Theme
- **Dark/OPSEC only** — no light mode, no toggle
- CSS variables on `:root`: deep blues (#070b10), neon interactive colors
- Neon palette: cyan #00e5ff, pink #ff2d7b, green #00ff88, yellow #ffe100, purple #c084fc

### Typography
- Body/nav: DM Sans (400/500/600/700)
- Headings/water labels: DM Serif Display (400)

### Spacing Tokens
`--sp-xs`(4px) `--sp-sm`(8px) `--sp-md`(12px) `--sp-lg`(16px) `--sp-xl`(20px) `--sp-2xl`(28px)

### Layout
- Fixed nav bar → collapsible charts overlay (position:fixed, z:88) → single scrollable page
- Map + legend panel: side-by-side flex (`.map-row`), stacks on < 768px
- Charts: 3-per-row widget grid, fixed 120px chart height
- Responsive breakpoints: 1100px, 768px, 480px

---

## Build & Deploy

### Local Preview
Open `index.html` directly in browser — no server needed.

### Deploy
```bash
git add -A && git commit -m "message" && git push
```
GitHub Pages rebuilds automatically. Live at: https://markvaske.github.io/monitoring_the_situation

### Daily Update Workflow
1. Create `updates/YYYY-MM-DD.json` (see `scripts/update-template.json` for format)
2. Run `node scripts/prep-update.js` to fetch current prices (optional)
3. Run `node scripts/daily-update.js updates/YYYY-MM-DD.json`
4. Verify in browser, then commit and push
5. Full procedure: `DAILY-UPDATE.md` or `memory/daily-update-skill.md`

### Adding New Countries
Always use Natural Earth 50m GeoJSON (`ne_50m_admin_0_countries.geojson`). Never use 110m. Round coordinates to 3 decimals. Bahrain is the only hand-drawn country (too small for GeoJSON).

---

## Performance Patterns (preserve on rebuild)

- **hitPath caching**: `buildHitPaths()` skips rebuild when canvas size + zoom/pan unchanged
- **Hover redraw**: only calls `drawMap()` when `hoveredCountry` actually changes
- **daysSet**: Set version of `days[]` for O(1) `.has()` in `buildCal()`
- **Resize debounce**: 80ms `setTimeout` on window resize
- **Batched NFZ hatching**: single `beginPath()`/`stroke()` per zone

---

## Critical Implementation Notes

- Canvas context is `ctx2`, NOT `ctx` (conflicts with DOM element `#ctx`)
- `isPointInPath`: paths built in CSS-pixel space, test with `mx*dpr, my*dpr` (encapsulated in `hitTestCountries`)
- Yemen southern coast adjusted to avoid overlapping Djibouti at Bab el-Mandeb
- NFZ FIR boundaries share exact boundary points between adjacent FIRs (no gaps/overlaps)
- `PRESENT_DAY` is `let` — auto-computed as `days[days.length - 1]`
- All layer toggles default to `false` — nothing visible until user activates
- `hzShow{}` uses `if (hzShow.x) { }` pattern — completely hidden when off, no ghost/dimmed states
- Canonical country naming: 'USA' and 'UK' throughout; `canonCo()` resolves aliases

---

## Changelog

| Date | Summary |
|------|---------|
| 2026-03-23 | Created Project.md — merged existing rebuild guide and MEMORY.md into structured format. |
| 2026-03-23 | Promoted India and Pakistan from CP_CTX{} to CP{} as neutral faction countries. |
| 2026-03-23 | Added missing FACTION_DETAIL, COUNTRY_ECON entries for India, Pakistan, Germany, Italy, Japan. |
| 2026-03-23 | Daily update: Mar 23 data (Trump postpones strikes, Pakistan/Egypt mediation, IRGC HQ strike, oil $99.94). |
| 2026-03-24 | Daily update: Mar 24 data (US 15-point peace plan, Erbil Peshmerga strike, Bahrain missile, Bushehr hit). |
| 2026-03-25 | Design audit: defined 6 CSS spacing tokens, extracted drawSeaLayers()/drawAirLayers() from drawMap(). |
| 2026-03-25 | Daily update: Mar 25 data (82nd Airborne deploying, Brent crashes to $94.42, Iran $2M Hormuz toll). |
| 2026-03-27 | Daily update: Mar 26–27 data (IRGCN commander Tangsiri killed, Houthis fire first missile at Israel). |
| 2026-03-28 | Migrated from Dia single-file artifact to multi-file repo on GitHub Pages. Split index.html into index.html + styles.css + src/data.js + src/map.js + src/main.js. |
| 2026-03-28 | Daily update: Mar 28–30 data. |
| 2026-04-01 | Added daily-update.js script + update JSON workflow. Added prep-update.js price fetcher. Added DAILY-UPDATE.md operator guide. |
| 2026-04-01 | Daily update: Mar 31 + Apr 1 data (largest Iranian missile salvo, Trump ceasefire claim/denial, oil $105.20). |
| 2026-04-01 | Fix: countryFlags corruption for Iran, Israel, Lebanon, UAE, Pakistan — posture text was written to wrong object by daily-update.js. Fixed updatePosture() to scope search to countryPosture block only. |
