# MTS — Monitoring The Situation

## Project Overview

A real-time conflict tracker for a hypothetical Iran-Israel-US war starting February 28, 2026. Visualizes airport closures, maritime activity (Strait of Hormuz, Red Sea), military operations, diplomatic developments, economic impacts, and humanitarian data across 20+ Middle East countries. Built as a single self-contained HTML file for sandboxed artifact deployment — no build step, no server, no CDN dependencies (except Google Fonts `@import`).

**Target users:** Analysts, journalists, policy researchers tracking a multi-theater conflict scenario.
**Core value:** Dense, interactive, multi-domain situational awareness in a single page.

---

## Tech Stack & Dependencies

| Layer | Technology | Notes |
|-------|-----------|-------|
| Languages | HTML5, CSS3, ES6+ JavaScript | Single file, no transpilation |
| Rendering | Canvas 2D API | Maps, charts (8 chart types) |
| Fonts | Google Fonts (DM Sans, DM Serif Display) | `@import` in `<style>` block |
| Maps | Custom Mercator projection | Country polygons from Natural Earth 50m GeoJSON |
| Hosting | Dia browser artifact sandbox | `upload_artifact` to preview |
| External APIs | None | All data is embedded |

**No other dependencies.** No npm, no bundler, no framework. The sandbox blocks all network access except the Google Fonts import.

---

## Environment Setup

1. File lives at `work/artifacts/middle_east_airport_closures/index.html`
2. Edit the single HTML file directly
3. Run `upload_artifact` after every edit to preview in browser
4. No env vars, no config files, no `.env`
5. Sandbox restrictions: no `curl`, `npm`, `python`, `git`, `rm`, `tail`, `head` — use `grep` and the `Read` tool instead

---

## Architecture

### Single-File Structure

Everything lives in one `index.html` — CSS in `<style>`, JS in `<script>`, no external files.

### Components (top to bottom in file)

1. **Rebuild guide** — HTML comment block at top (lines 2–178)
2. **CSS** — Theme variables, layout, responsive breakpoints (1100/768/480px)
3. **HTML** — Nav bar, charts overlay, map container, news/factions sections
4. **JavaScript** — Data structures → state → rendering → interaction handlers

### Canvas Map Architecture

- **Single canvas** (`#mc`) with uniform-scale Mercator projection
- Context variable is `ctx2` (NOT `ctx` — conflicts with DOM element `#ctx`)
- `_updateMapScale(w,h)` → `lx(lng)` / `ly(lat)` coordinate transforms
- Viewport: `{lnMin:28, lnMax:67, ltMin:9, ltMax:45}`
- Zoom/pan: `aZoom` (1–12), `aPanX`/`aPanY`, drag-to-pan, button zoom
- DPR-aware hit testing via `hitTestCountries()` (paths in CSS space, test with `mx*dpr, my*dpr`)

### Shared Map Utilities

- `buildCountryHitPaths()` — builds Path2D hit paths, caches by canvas size
- `hitTestCountries()` — DPR-aware country detection under cursor
- `drawCountryPolygons()` — renders countries with hover/select borders, supports `getHoverBorder`/`getSelectBorder` callbacks
- `getStatusBorder()` — conflict-status-matched border color (war=pink, attack=yellow, peace=green)
- `drawRoutePath()` — shared route rendering for bypass routes + branches

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
| `countryFlags{}` | Country → emoji flag pair |
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
| `MILESTONES[]` | 41 curated key events: `{d, icon, label, kw, cats}` |
| `ESCALATION_SCORES{}` | Per-day 1-10 threat scores |
| `ESC_LABELS{}` | Score → label mapping (LOW through MAXIMUM) |

### Time Series Data

| Structure | Description |
|-----------|------------|
| `days[]` | Date strings array (Feb 25–Mar 26, 2026), `daysSet` for O(1) lookups |
| `news[]` | ~432 items: `{d, d2?, cat, imp, t, tags, tx, l, s}` |
| `DAILY_HEADLINES{}` | Per-date `{headline, sub}` (Feb 15–Mar 26) |
| `CASUALTY_DATA{}` | Per-day cumulative: `{coalition/axis/civilian:{deaths,injuries}}` |
| `DISPLACEMENT_DATA{}` | Per-day cumulative by country (Iran, Lebanon, Iraq, Syria, UAE, Kuwait) |
| `OIL_PRICE_DATA{}` | Per-day `{brent, wti}` in USD/bbl |
| `GOLD_PRICE_DATA{}` | Per-day gold spot price USD/oz. Baseline ~$4,920, peaked $5,321 (Mar 13), settled $4,398 (Mar 26) |
| `SUEZ_DATA{}` | Per-day Suez Canal transit count |
| `SHIPPING_DATA{}` | Computed from HZ_EVENTS passage entries |
| `INSURANCE_DATA{}` | Per-day `{gulf, redsea, eastmed}` war risk % hull value |
| `NOTAM_DATA{}` | Per-day `{closed, restricted, total}` active NOTAMs |

### Maritime Data

| Structure | Description |
|-----------|------------|
| `HZ_EVENTS[]` | Maritime events: `{d, type, desc, lat, lng, count}`. Types: mine, cleared, patrol, passage. Passages use `region:'redsea'` for Bab el-Mandeb |
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

> **Standing rule:** When adding a country to `countryFaction`, also add entries to `FACTION_DETAIL`, `COUNTRY_ECON`, `conflictSides`, `countryPosture`, and `countryFlags`. All five are required for full faction status.
| `KEY_PEOPLE[]` | 21 key figures: `{name, flag, faction, title, status, desc}`. Status: killed/active/unknown |
| `maritimePosture{}` | Country → naval posture summary |

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
- **Key people popup**: 21 figures in grid, status badges (killed/active/unknown)

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
- Nav bar title + page tabs: `text-transform: uppercase`

### Layout
- Fixed nav bar → collapsible charts overlay (position:fixed, z:88) → single scrollable page
- Map + legend panel: side-by-side flex (`.map-row`), stacks on < 768px
- Charts: 3-per-row widget grid, fixed 120px chart height
- Responsive breakpoints: 1100px, 768px, 480px

### Component Patterns
- Card: `.card` with border/radius/bg
- Toggle: full color default, `.al-active` adds box-shadow glow in `--glow-color`
- Legend panel: `.map-legend-panel` with `.ml-group` sections, `.ml-sub-header` categories, `.ml-row` toggles
- News items: `.news-col-item` with discrete card styling
- Faction badges: `.cp-faction-*` and `.cp-status-*` CSS classes

---

## Build & Deploy

### Build
No build step. Edit `index.html` directly.

### Deploy / Preview
```
upload_artifact(
  site_root: "work/artifacts/middle_east_airport_closures",
  relative_path: "index.html"
)
```

### Extending Data (Daily Updates)
When user says **"update"** → follow the full procedure in `memory/daily-update-skill.md`.

Quick reference:
1. Search web for real-world events from the next date
2. Change date loop: `e = new Date(2026, 2, N)` in DATES section
3. Add entries to all 17+ data structures (news, HZ_EVENTS, MILESTONES, DAILY_HEADLINES, CASUALTY_DATA, DISPLACEMENT_DATA, OIL_PRICE_DATA, GOLD_PRICE_DATA, SUEZ_DATA, INSURANCE_DATA, NOTAM_DATA, ESCALATION_SCORES, countryPosture, CONFLICT_PHASES_NAMED)
4. Update `Project.md` changelog, `MEMORY.md` counts/ranges, and rebuild guide comment
5. Upload artifact

### Adding New Countries
Always use Natural Earth 50m GeoJSON (`ne_50m_admin_0_countries.geojson`). Never use 110m. Round coordinates to 3 decimals. Bahrain is the only hand-drawn country (too small for GeoJSON).

---

## Performance Patterns (preserve on rebuild)

- **hitPath caching**: `buildHitPaths()` skips rebuild when canvas size + zoom/pan unchanged
- **Hover redraw**: only calls `drawMap()` when `hoveredCountry` actually changes
- **daysSet**: Set version of `days[]` for O(1) `.has()` in `buildCal()`
- **Resize debounce**: 80ms `setTimeout` on window resize
- **Batched NFZ hatching**: single `beginPath()`/`stroke()` per zone
- **Init**: only calls `buildCal()` + `selectDay()` — no unnecessary Gantt build

---

## Critical Implementation Notes

- Canvas context is `ctx2`, NOT `ctx` (conflicts with DOM element `#ctx`)
- `isPointInPath`: paths built in CSS-pixel space, test with `mx*dpr, my*dpr` (encapsulated in `hitTestCountries`)
- Yemen southern coast adjusted to avoid overlapping Djibouti at Bab el-Mandeb
- NFZ FIR boundaries share exact boundary points between adjacent FIRs (no gaps/overlaps)
- `PRESENT_DAY` is `let` — auto-computed as `days[days.length - 1]`
- All layer toggles default to `false` — nothing visible until user activates
- `hzShow{}` uses `if (hzShow.x) { }` pattern — completely hidden when off, no ghost/dimmed states
- Mar 21-22 oil prices carry forward (weekend)
- Canonical country naming: 'USA' and 'UK' throughout; `canonCo()` resolves aliases

---

## Changelog

| Date | Summary |
|------|---------|
| 2026-03-23 | Created Project.md — merged existing rebuild guide (index.html comment block) and MEMORY.md into structured build guide format. No code changes. |
| 2026-03-23 | Promoted India and Pakistan from CP_CTX{} to CP{} — now rendered as conflict countries with faction colors, posture cards, and interactive popups. Added countryFlags entries and CONFLICT_LABEL_POS positions. CP_CTX reduced from 28 to 26 countries. |
| 2026-03-23 | Added missing FACTION_DETAIL entries for India and Pakistan. Added missing COUNTRY_ECON entries for India, Pakistan, Germany, Italy, Japan. Added India/Pakistan to conflictSides.neutral. Added standing note in rebuild guide: new faction countries require entries in all five data structures. |
| 2026-03-23 | Daily update: Added 8 new news[] entries for Mar 23 (Trump postpones strikes, Iran denies negotiations, Pakistan/Egypt mediation, IRGC HQ strike, Beirut strikes, 82nd Airborne, ICRC warning, corrected oil crash data). Updated oil prices (Brent $99.94, WTI $88.13). Updated DAILY_HEADLINES. Added 3 new MILESTONES + 5 new HZ_EVENTS. Updated countryPosture for Iran, Israel, Lebanon, Saudi Arabia, Egypt, UK, Pakistan. Updated Widening War phase summary. Removed duplicate stocks entry. |
| 2026-03-24 | Daily update: Extended date range to Mar 24. Added 21 new news[] entries total for Mar 24. First batch (11): Tel Aviv missile hits, Beirut strikes resumed, Epic Fury continues, Kuwait intercepts, Pakistan talks, Netanyahu-Trump call, Brent $103.94, Hormuz transits, global energy crisis, AWS Bahrain, HMS Dragon. Second batch (10 from evening reporting): US 15-point peace plan via Pakistan, Iran prefers Vance as negotiator, Iran tells UN/IMO on Hormuz transit rules, Kurdish Peshmerga killed in Erbil, Bahrain missile kills Moroccan contractor, Bushehr nuclear plant hit, Israel Lebanon security zone, MBS pushes war, 290 US troops wounded + Zolqadr replaces Larijani, Philippines energy emergency, 350 children among dead. Added 7 MILESTONES + 9 HZ_EVENTS. Updated all time-series data. Updated countryPosture for Israel, Lebanon, Kuwait, Pakistan, Iraq, Bahrain, Iran. Updated DAILY_HEADLINES and Widening War phase summary. |
| 2026-03-25 | Design audit: Defined 6 CSS spacing tokens (--sp-xs through --sp-2xl), migrated ~25 CSS rules including responsive breakpoints. Documented color system and spacing tokens in Notion Design Guide. Extracted drawSeaLayers() and drawAirLayers() from drawMap(), reducing it from ~678 to ~190 lines. Updated rebuild guide with decomposed function documentation. |
| 2026-03-25 | Daily update: Extended date range to Mar 25. Added 22 news[] entries: IRGC missiles at US bases in Gulf, south Tehran strike (12 killed), Kuwait Airport fuel tank hit, central Israel missile (9 wounded inc 6 children), IDF 600+ missile site strikes + IRGC morale collapse, Esfahan Optics/Malek Ashtar strikes, Nazeat Islands damage, 82nd Airborne deploying, Lebanon kills (Adloun/Sidon/Habboush), Iran mocks peace plan, Wang Yi urges peace talks, Trump says Vance/Rubio leading talks, GOP rejects war powers 47-53, Kim Jong Un on nukes, Cyprus UK bases, Brent crashes 6% to $94.42, Iran Hormuz non-hostile vessel policy, Iran charging $2M transit fees + mines confirmed, WTO fertilizer warning, Philippines energy emergency, Lebanon existential crisis, casualty update. Added 7 MILESTONES + 7 HZ_EVENTS. Updated all time-series: OIL $94.42, GOLD $4620, INSURANCE (gulf down to 12.50%), ESCALATION 10, SUEZ 9, CASUALTIES, DISPLACEMENT. Updated countryPosture for Iran, Israel, Kuwait, Lebanon, Pakistan. Updated Widening War phase summary. |
| 2026-03-27 | Daily update: Extended date range to Mar 27 (two-day batch). Added 28 news[] entries across Mar 26-27: IDF kills IRGCN commander Tangsiri (Mar 26), Trump extends Hormuz deadline to Apr 6, 8 ships transit free as "show of sincerity", Wall Street worst day of war, Israel deploys 3rd division in Lebanon, Hezbollah record 94 ops, Pakistan confirms peace plan relay, Rubio "concrete progress", IDF strikes Arak Heavy Water and Ardakan Yellowcake plants (Mar 27), 12 US troops injured at Prince Sultan Air Base, Iran missile fire down 90% (330/470 launchers destroyed), CENTCOM strikes tunnel bulldozers, Houthis fire first missile from Yemen toward Israel, Iran formalizes $2M Hormuz toll, strikes on Isfahan/Ahvaz steel plants, Iran threatens Gulf industries, Abu Dhabi fires from debris, IAEA radiological warning, Ukraine-Saudi defense deal. Added 7 MILESTONES + 11 HZ_EVENTS. Yemen status changed to 'attack' (conflictPhases). Updated all time-series: OIL $105.85→$107.81, GOLD $4439→$4430, ESCALATION 9, SUEZ 10→9. Updated countryPosture for Iran, Israel, Lebanon, UAE, Saudi Arabia, Yemen. Updated Widening War phase summary through Mar 27. |
