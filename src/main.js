// ===== MTS MAIN =====
// UI logic, event handlers, chart rendering, calendar, news, init

function sideCountries(side) {
  // 'US/Qatar' → ['USA','Qatar'], 'Iran' → ['Iran']
  return side.split('/').map(s => SIDE_TO_COUNTRY[s.trim()] || s.trim());
}
// Canonical name for a country (handles short aliases)
function canonCo(co) { return SIDE_TO_COUNTRY[co] || co; }
function itemMatchesCo(side) {
  if (!selCo.size && !selFactions.size) return true;
  const countries = sideCountries(side);
  // Direct match: any selected country matches
  if (selCo.size && countries.some(c => selCo.has(c))) return true;
  // Short-name match
  if (selCo.size) {
    for (const sc of selCo) {
      const canon = canonCo(sc);
      if (countries.includes(canon)) return true;
      if (canon !== sc && countries.includes(sc)) return true;
    }
  }
  // Faction match
  if (selFactions.size) {
    return countries.some(c => {
      const cf = countryFaction[c];
      return cf && selFactions.has(cf.faction);
    });
  }
  return false;
}
function newsMatchesCo(tags) {
  if (!selCo.size && !selFactions.size) return true;
  // Country match
  if (selCo.size) {
    for (const sc of selCo) {
      if (tags.includes(sc)) return true;
      const canon = canonCo(sc);
      if (canon !== sc && tags.includes(canon)) return true;
    }
  }
  // Faction match
  if (selFactions.size) {
    return tags.some(t => {
      const key = canonCo(t);
      const fi = countryFaction[key] || countryFaction[t];
      return fi && selFactions.has(fi.faction);
    });
  }
  return false;
}
// Check if a specific country is in the active filter
function isCoSelected(co) {
  if (!selCo.size && !selFactions.size) return false;
  if (selCo.has(co)) return true;
  const canon = canonCo(co);
  if (selCo.has(canon)) return true;
  if (selFactions.size) {
    const fi = countryFaction[co] || countryFaction[canon];
    return fi && selFactions.has(fi.faction);
  }
  return false;
}
// Check if any filter is active
function hasFilter() { return selCo.size > 0 || selFactions.size > 0; }
// Check if a country passes the filter (for map items with .co field)
function coPassesFilter(co) {
  if (!hasFilter()) return true;
  return isCoSelected(co);
}

// ===== STATE =====
let selDay = days[days.length - 1], selSt = null;
let selCo = new Set();       // selected countries (empty = all)
let selFactions = new Set();  // selected factions (empty = all)
let hoveredCountry = null;
let hzHoveredCountry = null; // hovered country on maritime map
let showNFZ = false, showRoutes = false, showJamming = false;
let showOpen = false, showRestricted = false, showClosed = false;
let showCoalitionBases = false, showIranBases = false;
let showFleet = false;
// Airways map zoom/pan state (now managed by MapLibre — vars kept for compatibility)
let aZoom = 1;
const hzShow = {mine:false, cleared:false, patrol:false, passage:false, houthi:false, lanes:false, corridors:false, naval:false, chokepoints:false};
// OPSEC (dark) is DEFAULT
let filtersOpen = false;
function toggleFilters() {
  filtersOpen = !filtersOpen;
  document.querySelector('.top-row').classList.toggle('open', filtersOpen);
  document.getElementById('filterBtn').classList.toggle('active', filtersOpen);
  if (filtersOpen) { if (peoplePopupOpen) togglePeoplePopup(); setTimeout(() => { drawCasualtyChart(); drawDisplacementChart(); drawOilPriceChart(); drawShippingChart(); drawFlightChart(); drawGoldChart(); drawInsuranceChart(); drawNotamChart(); }, 30); }
}
document.addEventListener('keydown', e => { if (e.key === 'Escape' && filtersOpen) toggleFilters(); if (e.key === 'Escape' && calPopupOpen) toggleCalPopup(); if (e.key === 'Escape' && peoplePopupOpen) togglePeoplePopup(); });

let calPopupOpen = false;
function toggleCalPopup() {
  calPopupOpen = !calPopupOpen;
  document.getElementById('calPopup').classList.toggle('open', calPopupOpen);
  document.getElementById('calPopupBtn').classList.toggle('active', calPopupOpen);
}
document.addEventListener('click', e => {
  if (calPopupOpen && !document.getElementById('calPopupBtn').contains(e.target)) toggleCalPopup();
  if (peoplePopupOpen && !document.getElementById('peoplePopupBtn').contains(e.target) && !document.getElementById('peopleOverlay').contains(e.target)) togglePeoplePopup();
});

// ===== KEY PEOPLE =====
let peoplePopupOpen = false;
function togglePeoplePopup() {
  peoplePopupOpen = !peoplePopupOpen;
  document.getElementById('peopleOverlay').classList.toggle('open', peoplePopupOpen);
  document.getElementById('peoplePopupBtn').classList.toggle('active', peoplePopupOpen);
  if (peoplePopupOpen) { if (filtersOpen) toggleFilters(); renderPeopleGrid(); }
}
function renderPeopleGrid() {
  const g = document.getElementById('ppGrid');
  const groups = {coalition:[], axis:[], neutral:[]};
  KEY_PEOPLE.forEach(p => { if (groups[p.faction]) groups[p.faction].push(p); });
  const hasFactionFilter = selFactions.size > 0;
  const cols = ['coalition','axis','neutral'].map(f => {
    const dimmed = hasFactionFilter && !selFactions.has(f) ? ' dimmed' : '';
    const label = {coalition:'Coalition',axis:'Axis',neutral:'Non-Aligned'}[f];
    const cards = groups[f].map(p => `<div class="pp-card">
      <div class="pp-flag">${p.flag}</div>
      <div class="pp-info">
        <div class="pp-name">${p.name}${p.status==='killed'?'<span class="pp-status killed">KILLED</span>':p.status==='unknown'?'<span class="pp-status unknown">UNKNOWN</span>':'<span class="pp-status active">ACTIVE</span>'}</div>
        <div class="pp-title">${p.title}</div>
        <div class="pp-desc">${p.desc}</div>
      </div>
    </div>`).join('');
    return `<div class="pp-col${dimmed}"><div class="pp-col-header ${f}">${label}</div>${cards}</div>`;
  });
  g.innerHTML = cols.join('');
}

// ===== DAILY SUMMARY TABS =====
let activeDsTab = 'conflict';
function switchDsTab(tab) {
  activeDsTab = tab;
  document.querySelectorAll('.ds-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.ds-pane').forEach(p => p.classList.remove('active'));
  document.querySelector('.ds-tab[onclick*="' + tab + '"]').classList.add('active');
  const paneMap = {conflict:'dsConflict', logistics:'dsLogistics', diplomacy:'dsDiplomacy', markets:'dsMarkets', humanitarian:'dsHumanitarian'};
  document.getElementById(paneMap[tab]).classList.add('active');
}

// ===== PAGE TABS =====
let newsCatFilter = 'all';

function togNewsCat(cat) {
  newsCatFilter = cat;
  document.querySelectorAll('.nf-cat').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
  renderNews();
}

function togNewsCo(co) {
  // If this country belongs to a currently-selected faction, no-op
  const canon = canonCo(co);
  const fi = countryFaction[co] || countryFaction[canon];
  if (fi && selFactions.has(fi.faction)) return;
  if (selCo.has(co)) selCo.delete(co);
  else selCo.add(co);
  _afterFilterChange();
}

function togNewsFaction(faction) {
  togFilterFaction(faction);
}

function togFilterFaction(faction) {
  if (selFactions.has(faction)) {
    selFactions.delete(faction);
    // Also remove countries of this faction from selCo
    Object.keys(countryFaction).forEach(co => {
      if (countryFaction[co].faction === faction) selCo.delete(co);
    });
  } else {
    selFactions.add(faction);
    // Also add countries of this faction to selCo
    Object.keys(countryFaction).forEach(co => {
      if (countryFaction[co].faction === faction) selCo.add(co);
    });
  }
  _afterFilterChange();
}





// ===== CALENDAR =====
let calWeekOffset = 0;
const CONFLICT_START = conflictPhases[0][0];
let PRESENT_DAY = days[days.length - 1];

function getCalDays() {
  const baseEnd = new Date(PRESENT_DAY + 'T12:00:00');
  const shifted = new Date(baseEnd);
  shifted.setDate(shifted.getDate() + calWeekOffset * 7);
  const endD = new Date(shifted);
  const startD = new Date(shifted);
  startD.setDate(startD.getDate() - 27);
  const result = [];
  for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1))
    result.push(d.toISOString().slice(0, 10));
  return result;
}

function buildCal(cf) {
  const g = document.getElementById('calG');
  g.innerHTML = '';
  ['S','M','T','W','T','F','S'].forEach(h => {
    const e = document.createElement('div');
    e.className = 'ch'; e.textContent = h; g.appendChild(e);
  });
  const calDays = getCalDays();
  const sd = new Date(calDays[0] + 'T12:00:00');
  for (let i = 0; i < sd.getDay(); i++) {
    const e = document.createElement('div');
    e.className = 'cd empty'; g.appendChild(e);
  }
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let lastMonth = sd.getMonth();

  // Precompute trend for each day from Feb 28 onward
  function getDayTrend(ds, co) {
    const di = days.indexOf(ds);
    if (di < 1 || ds < CONFLICT_START) return null;
    const lb = Math.min(di, 7), pd = days[di - lb];
    const windowStart = pd, windowEnd = ds;
    const priorStart = days[Math.max(0, di - lb * 2)];
    const ctx = { selDay: ds, pd, windowStart, windowEnd, priorStart, co: co || null };
    let tw = 0, ts = 0;
    TREND_FACTORS.forEach(f => {
      const result = f.fn(ctx);
      if (result) { ts += result.score * f.weight; tw += f.weight; }
    });
    const composite = tw > 0 ? ts / tw : 0;
    return composite; // returns numeric score for spectrum coloring
  }

  calDays.forEach(ds => {
    const dt = new Date(ds + 'T12:00:00');
    // Month divider
    if (dt.getMonth() !== lastMonth) {
      // Fill remaining cells in the row before divider
      const currentChildren = g.children.length;
      const cellsInRow = (currentChildren - 7) % 7; // subtract header row
      if (cellsInRow > 0) {
        for (let p = cellsInRow; p < 7; p++) {
          const pad = document.createElement('div');
          pad.className = 'cd empty'; g.appendChild(pad);
        }
      }
      const divider = document.createElement('div');
      divider.className = 'cal-month-divider';
      divider.innerHTML = '<span>' + monthNames[dt.getMonth()] + '</span>';
      g.appendChild(divider);
      // Add day-of-week padding for the new month's first day
      for (let i = 0; i < dt.getDay(); i++) {
        const pad = document.createElement('div');
        pad.className = 'cd empty'; g.appendChild(pad);
      }
      lastMonth = dt.getMonth();
    }
    const e = document.createElement('div');
    e.className = 'cd';
    e.textContent = dt.getDate();
    const isPreConflict = ds < CONFLICT_START;

    // Apply trend-based coloring from Feb 28 onward
    if (!isPreConflict && ds >= CONFLICT_START) {
      const trend = getDayTrend(ds, cf || null);
      if (trend !== null) {
        const tc = getTrendColor(trend);
        const r = parseInt(tc.slice(1,3),16), g = parseInt(tc.slice(3,5),16), b = parseInt(tc.slice(5,7),16);
        e.style.background = 'rgba(' + r + ',' + g + ',' + b + ',.15)';
        e.style.color = '#fff';
      } else {
        e.classList.add('peace-day');
      }
    } else {
      e.classList.add('peace-day');
    }

    if (isPreConflict) e.classList.add('pre-conflict');
    if (ds === CONFLICT_START || ds === PRESENT_DAY) e.classList.add('bold-date');
    if (ds === selDay) e.classList.add('selected');
    if (daysSet.has(ds)) {
      e.addEventListener('click', () => selectDay(ds));
    } else {
      e.style.cursor = 'default'; e.style.opacity = '0.25';
    }
    g.appendChild(e);
  });
  const upEl = document.getElementById('calUp'), dnEl = document.getElementById('calDown');
  upEl.className = calWeekOffset <= -4 ? 'disabled' : '';
  dnEl.className = calWeekOffset >= 4 ? 'disabled' : '';
}

function calNav(dir) {
  const g = document.getElementById('calG');
  g.classList.add('cal-transition', 'slide-out');
  setTimeout(() => {
    calWeekOffset += dir;
    buildCal();
    g.classList.remove('slide-out'); g.classList.add('slide-in');
    setTimeout(() => { g.classList.remove('cal-transition', 'slide-in'); }, 20);
  }, 180);
}

// ===== SELECT DAY =====
function selectDay(ds) { selDay = ds; ganttSelPhase = null; selMilestoneIdx = null; buildCal(); refresh(); drawMap(); updateTrend(); buildGantt(); closePopup(); updateDayNav(); }
function updateDayNav() {
  const d = new Date(selDay + 'T12:00:00');
  document.getElementById('dayLabel').textContent = d.toLocaleDateString('en-US', {month:'short', day:'numeric'});
  document.getElementById('dayPrev').disabled = (selDay === days[0]);
  document.getElementById('dayNext').disabled = (selDay === days[days.length - 1]);
}
function stepDay(dir) {
  const idx = days.indexOf(selDay);
  const next = idx + dir;
  if (next >= 0 && next < days.length) selectDay(days[next]);
}

// ===== GANTT CHART =====
// Category swim lanes with indicator dots + hover popups.
// Each lane = one news category. Dots color-coded by impact (e/d/n).
// Multi-day stories render as connecting lines between start and end dots.
// Hover any dot for a rich popup with story details.
let highlightedNewsIdx = -1;

const catIcons = {military:'\u{1F3AF}',aviation:'\u2708',maritime:'\u2693',stocks:'\u{1F4C8}',diplomatic:'\u{1F30D}',general:'\u{1F4CB}'};
const impLabels = {e:'Escalation',d:'De-escalation',n:'Neutral'};

// Named conflict phases for the timeline phase bar
// Colors are computed dynamically from average ESCALATION_SCORES via getEscColor()
function getMilestonesForDay(d) {
  return MILESTONES.filter(ms => ms.d === d);
}

let ganttSelPhase = null; // null = auto-derive from selDay
let selMilestoneIdx = null; // null = no milestone filter; number = index into MILESTONES[]

function selectPhase(pi) {
  ganttSelPhase = pi;
  selMilestoneIdx = null;
  buildGantt();
  renderNews();
}

function selectMilestone(gi) {
  const ms = MILESTONES[gi];
  if (!ms) return;
  // Toggle off if already selected
  if (selMilestoneIdx === gi) { selMilestoneIdx = null; }
  else { selMilestoneIdx = gi; }
  // Set day to milestone's date and enter phase mode for that phase
  selDay = ms.d;
  ganttSelPhase = getPhaseForDay(ms.d);
  buildCal(); refresh(); drawMap(); updateTrend(); buildGantt(); updateDayNav();
}

function buildGantt() {
  const container = document.getElementById('ganttChart');
  const ganttDays = days.filter(d => d >= CONFLICT_START);
  if (!ganttDays.length) { container.innerHTML = '<div style="font-size:.8rem;color:var(--text3);padding:12px">No conflict data.</div>'; return; }

  const numDays = ganttDays.length;
  const lastDay = ganttDays[numDays - 1];

  let html = '';
  // Date header row — clickable dates for scrubbing
  html += '<div class="gantt-header"><div class="gantt-dates">';
  ganttDays.forEach(d => {
    const dt = new Date(d + 'T12:00:00');
    const label = (dt.getMonth()+1) + '/' + dt.getDate();
    const isSel = d === selDay;
    html += '<div class="gantt-dh' + (isSel ? ' sel' : '') + '" onclick="selectDay(\'' + d + '\')" title="' + d + '">' + label + (isSel ? '<div class="gantt-marker"></div>' : '') + '</div>';
  });
  html += '</div></div>';

  // Phase bar — colored segments with milestone markers and day needle
  const curPhase = typeof ganttSelPhase === 'number' ? ganttSelPhase : getPhaseForDay(selDay);
  html += '<div class="gantt-phase-bar-row"><div class="gantt-phase-bar">';
  CONFLICT_PHASES_NAMED.forEach((phase, pi) => {
    const startIdx = ganttDays.indexOf(phase.start);
    if (startIdx === -1) return;
    const nextStart = pi < CONFLICT_PHASES_NAMED.length - 1 ? ganttDays.indexOf(CONFLICT_PHASES_NAMED[pi + 1].start) : numDays;
    const span = nextStart - startIdx;
    const widthPct = (span / numDays * 100).toFixed(2);
    const isSel = pi === curPhase;
    html += '<div class="gantt-phase-seg' + (isSel ? ' gps-selected' : '') + '" style="width:' + widthPct + '%;background:' + getPhaseColor(pi) + '" onclick="selectPhase(' + pi + ')" title="' + phase.label + '">';
    if (span >= 3) html += '<span class="gps-label">' + phase.label + '</span>';
    html += '</div>';
  });
  const selIdx = ganttDays.indexOf(selDay);
  if (selIdx !== -1) {
    const needlePct = ((selIdx + 0.5) / numDays * 100).toFixed(2);
    html += '<div class="gantt-needle" style="left:' + needlePct + '%"></div>';
  }
  html += '</div></div>';

  // Phase detail blocks — only show selected phase
  html += '<div class="phase-details">';
  CONFLICT_PHASES_NAMED.forEach((phase, pi) => {
    const nextStart = pi < CONFLICT_PHASES_NAMED.length - 1 ? CONFLICT_PHASES_NAMED[pi + 1].start : null;
    const endDay = nextStart ? ganttDays[ganttDays.indexOf(nextStart) - 1] || lastDay : lastDay;
    const startDt = new Date(phase.start + 'T12:00:00');
    const endDt = new Date(endDay + 'T12:00:00');
    const fmt = {month:'short',day:'numeric'};
    const dateRange = startDt.toLocaleDateString('en-US', fmt) + ' \u2013 ' + endDt.toLocaleDateString('en-US', fmt);
    const isVisible = pi === curPhase;

    // Milestones in this phase, grouped by day
    const phaseMilestones = MILESTONES.filter(ms => ms.d >= phase.start && (!nextStart || ms.d < nextStart));
    const msByDay = {};
    phaseMilestones.forEach(ms => { (msByDay[ms.d] = msByDay[ms.d] || []).push(ms); });
    const msDays = Object.keys(msByDay).sort().reverse();

    // Escalation stats for this phase
    const phaseDays = ganttDays.filter(d => d >= phase.start && (!nextStart || d < nextStart));
    let escMin = 10, escMax = 1;
    phaseDays.forEach(d => { const e = ESCALATION_SCORES[d] || 1; escMin = Math.min(escMin, e); escMax = Math.max(escMax, e); });

    html += '<div class="phase-block' + (isVisible ? ' phase-visible' : '') + '" style="border-left:3px solid ' + getPhaseColor(pi, 0.8) + '">';
    html += '<div class="pb-header"><span class="pb-label">' + phase.label + '</span><span class="pb-dates">' + dateRange + '</span>' +
      '<span class="pb-esc" style="margin-left:auto;font-size:.58rem;padding:2px 7px;border-radius:4px;background:' + getEscColor(escMax) + '20;color:' + getEscColor(escMax) + '">Threat ' + escMin + '\u2013' + escMax + '</span></div>';
    // Summary paragraph
    if (phase.summary) {
      html += '<div class="pb-summary">' + phase.summary + '</div>';
    }
    // Milestone table grouped by day — faction-style rows
    if (msDays.length) {
      html += '<div class="pb-ms-table">';
      msDays.forEach(d => {
        const dMs = msByDay[d];
        const mdt = new Date(d + 'T12:00:00');
        const dayLabel = mdt.toLocaleDateString('en-US', {weekday:'short', month:'short', day:'numeric'});
        const dayNum = Math.floor((mdt - new Date('2026-02-28T12:00:00')) / 86400000) + 1;
        const isDaySel = d === selDay;
        html += '<div class="pb-ms-day' + (isDaySel ? ' pb-ms-day-sel' : '') + '" onclick="selectDay(\'' + d + '\')">';
        html += '<div class="pb-ms-day-header"><span class="pb-ms-date">' + dayLabel + '</span>' +
          (dayNum > 0 ? '<span class="pb-ms-daynum">Day ' + dayNum + '</span>' : '') + '</div>';
        html += '<div class="pb-ms-events">';
        dMs.forEach(ms => {
          const gi = MILESTONES.indexOf(ms);
          const isActive = selMilestoneIdx === gi;
          const hasGeo = ms.lat != null && ms.lng != null;
          html += '<div class="pb-ms-event' + (isActive ? ' pb-ms-event-active' : '') + (hasGeo ? ' pb-ms-geo' : '') + '" onclick="event.stopPropagation();selectMilestone(' + gi + ')"><span class="pb-ms-icon">' + ms.icon + '</span><span class="pb-ms-label">' + ms.label + '</span>' + (hasGeo ? '<span class="pb-ms-pin">\u{1F4CD}</span>' : '') + '</div>';
        });
        html += '</div></div>';
      });
      html += '</div>';
    }
    html += '</div>';
  });
  html += '</div>';

  container.innerHTML = html;
}

function highlightNews(idx) {
  highlightedNewsIdx = idx;
  const item = news[idx];
  if (item) {
    selDay = item.d;
    buildCal(); refresh(); drawMap(); updateTrend(); buildGantt();
    // Also highlight in news coverage panel
    setTimeout(() => {
      document.querySelectorAll('.ni').forEach(el => el.classList.remove('highlighted'));
      document.querySelectorAll('.ni').forEach(el => {
        if (el.querySelector('h3') && el.querySelector('h3').textContent === item.t) {
          el.classList.add('highlighted');
        }
      });
    }, 50);
  }
}

// ===== WIDGET ONE: CONFLICT PARTIES =====
// ===== CASUALTY CHART =====
let casMode = 'all'; // 'all', 'deaths', 'injuries'
let casShowCoalition = true, casShowAxis = true, casShowCivilian = true;

function setCasMode(mode) {
  casMode = mode;
  document.getElementById('casModeAll').classList.toggle('active', mode === 'all');
  document.getElementById('casModeDeaths').classList.toggle('active', mode === 'deaths');
  document.getElementById('casModeInjuries').classList.toggle('active', mode === 'injuries');
  drawCasualtyChart();
}

function togCasFaction(faction) {
  if (faction === 'coalition') casShowCoalition = !casShowCoalition;
  else if (faction === 'axis') casShowAxis = !casShowAxis;
  else casShowCivilian = !casShowCivilian;
  // Ensure at least one is visible
  if (!casShowCoalition && !casShowAxis && !casShowCivilian) {
    casShowCoalition = casShowAxis = casShowCivilian = true;
  }
  updateCasLegend();
  drawCasualtyChart();
}

function updateCasLegend() {
  const nav = document.querySelector('.cas-nav');
  if (!nav) return;
  nav.querySelector('.cl-coalition').classList.toggle('cl-dimmed', !casShowCoalition);
  nav.querySelector('.cl-axis').classList.toggle('cl-dimmed', !casShowAxis);
  nav.querySelector('.cl-civilian').classList.toggle('cl-dimmed', !casShowCivilian);
}

function getCasVal(cd, faction) {
  const f = cd[faction];
  if (casMode === 'deaths') return f.deaths;
  if (casMode === 'injuries') return f.injuries;
  return f.deaths + f.injuries;
}

function drawCasualtyChart() {
  const canvas = document.getElementById('casChart');
  if (!canvas) return;
  const wrap = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
  const w = wrap.clientWidth, h = wrap.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  const cx = canvas.getContext('2d');
  cx.scale(dpr, dpr);

  // Get conflict days with casualty data
  const conflictDays = days.filter(d => d >= CONFLICT_START && CASUALTY_DATA[d]);
  if (!conflictDays.length) return;

  // Determine what to show based on selection
  const selLabel = document.getElementById('casSelection');
  let filterShare = null;

  if (hasFilter()) {
    // Find first selected country with casualty data
    const selCountries = [...selCo];
    const matchedCo = selCountries.find(c => CASUALTY_COUNTRY_SHARE[c] || CASUALTY_COUNTRY_SHARE[canonCo(c)]);
    if (matchedCo) {
      const cs = CASUALTY_COUNTRY_SHARE[matchedCo] || CASUALTY_COUNTRY_SHARE[canonCo(matchedCo)];
      if (cs) {
        filterShare = cs;
        selLabel.textContent = '\u2014 ' + (selCountries.length > 1 ? selCountries.length + ' countries' : matchedCo);
      }
    } else if (selFactions.size) {
      selLabel.textContent = '\u2014 ' + [...selFactions].map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(', ');
    } else {
      selLabel.textContent = '\u2014 ' + selCountries.join(', ') + ' (no data)';
      cx.fillStyle = 'rgba(255,255,255,.3)';
      cx.font = '12px "DM Sans",sans-serif';
      cx.textAlign = 'center';
      cx.fillText('No casualty data for ' + selCountries.join(', '), w/2, h/2);
      return;
    }
  } else {
    selLabel.textContent = '';
  }

  // Build series
  const series = [];
  conflictDays.forEach(d => {
    const cd = CASUALTY_DATA[d];
    let coal = getCasVal(cd, 'coalition'), ax = getCasVal(cd, 'axis'), civ = getCasVal(cd, 'civilian');
    if (filterShare) {
      if (filterShare.faction === 'coalition') {
        coal = Math.round(coal * filterShare.share);
        ax = 0; civ = 0;
      } else {
        ax = Math.round(ax * filterShare.share);
        coal = 0; civ = 0;
      }
    }
    series.push({d, coalition:coal, axis:ax, civilian:civ});
  });

  // Chart dimensions
  const pad = {top:14, right:12, bottom:30, left:42};
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;

  // Y scale — only count visible factions
  let maxVal = 10;
  series.forEach(s => {
    if (casShowCoalition) maxVal = Math.max(maxVal, s.coalition);
    if (casShowAxis) maxVal = Math.max(maxVal, s.axis);
    if (casShowCivilian) maxVal = Math.max(maxVal, s.civilian);
  });
  const yMax = Math.ceil(maxVal / 100) * 100 || 100;
  const toX = (i) => pad.left + (i / (series.length - 1)) * cw;
  const toY = (v) => pad.top + ch - (v / yMax) * ch;

  // Background
  cx.clearRect(0, 0, w, h);

  // Grid lines
  cx.strokeStyle = 'rgba(255,255,255,.06)';
  cx.lineWidth = 1;
  const yTicks = 5;
  for (let i = 0; i <= yTicks; i++) {
    const yv = (yMax / yTicks) * i;
    const yy = toY(yv);
    cx.beginPath(); cx.moveTo(pad.left, yy); cx.lineTo(w - pad.right, yy); cx.stroke();
    cx.fillStyle = 'rgba(255,255,255,.35)';
    cx.font = '10px "DM Sans",sans-serif';
    cx.textAlign = 'right';
    cx.fillText(Math.round(yv).toLocaleString(), pad.left - 6, yy + 3);
  }

  // X labels (every other day)
  cx.fillStyle = 'rgba(255,255,255,.35)';
  cx.font = '9px "DM Sans",sans-serif';
  cx.textAlign = 'center';
  series.forEach((s, i) => {
    if (i % 2 === 0 || i === series.length - 1) {
      const dt = new Date(s.d + 'T12:00:00');
      const label = (dt.getMonth()+1) + '/' + dt.getDate();
      cx.fillText(label, toX(i), h - pad.bottom + 14);
    }
  });

  // Selected day marker
  const selIdx = series.findIndex(s => s.d === selDay);
  if (selIdx >= 0) {
    cx.save();
    cx.strokeStyle = 'rgba(0,229,255,.3)';
    cx.lineWidth = 1;
    cx.setLineDash([4, 3]);
    cx.beginPath(); cx.moveTo(toX(selIdx), pad.top); cx.lineTo(toX(selIdx), pad.top + ch); cx.stroke();
    cx.restore();
  }

  // Draw lines
  function drawLine(key, color) {
    cx.strokeStyle = color;
    cx.lineWidth = 2;
    cx.beginPath();
    series.forEach((s, i) => {
      const x = toX(i), y = toY(s[key]);
      i === 0 ? cx.moveTo(x, y) : cx.lineTo(x, y);
    });
    cx.stroke();
    // Area fill
    cx.save();
    cx.globalAlpha = 0.08;
    cx.fillStyle = color;
    cx.beginPath();
    series.forEach((s, i) => {
      const x = toX(i), y = toY(s[key]);
      i === 0 ? cx.moveTo(x, y) : cx.lineTo(x, y);
    });
    cx.lineTo(toX(series.length - 1), pad.top + ch);
    cx.lineTo(toX(0), pad.top + ch);
    cx.closePath();
    cx.fill();
    cx.restore();
  }

  const shouldShowCoal = casShowCoalition && (!filterShare || filterShare.faction !== 'axis');
  const shouldShowAxis = casShowAxis && (!filterShare || filterShare.faction !== 'coalition');
  const shouldShowCiv = casShowCivilian && !filterShare;

  if (shouldShowCoal) drawLine('coalition', '#00e5ff');
  if (shouldShowAxis) drawLine('axis', '#ff2d7b');
  if (shouldShowCiv) drawLine('civilian', '#ffe100');

  // Dots on selected day
  if (selIdx >= 0) {
    const s = series[selIdx];
    const dotR = 4;
    if (shouldShowCoal) { cx.fillStyle = '#00e5ff'; cx.beginPath(); cx.arc(toX(selIdx), toY(s.coalition), dotR, 0, Math.PI*2); cx.fill(); }
    if (shouldShowAxis) { cx.fillStyle = '#ff2d7b'; cx.beginPath(); cx.arc(toX(selIdx), toY(s.axis), dotR, 0, Math.PI*2); cx.fill(); }
    if (shouldShowCiv) { cx.fillStyle = '#ffe100'; cx.beginPath(); cx.arc(toX(selIdx), toY(s.civilian), dotR, 0, Math.PI*2); cx.fill(); }
  }

  // Hover handler
  canvas.onmousemove = function(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const tooltip = document.getElementById('casTooltip');
    let closest = -1, closestDist = Infinity;
    series.forEach((s, i) => {
      const dist = Math.abs(toX(i) - mx);
      if (dist < closestDist) { closestDist = dist; closest = i; }
    });
    if (closest < 0 || closestDist > cw / series.length) {
      tooltip.style.display = 'none';
      return;
    }
    const s = series[closest];
    const prev = closest > 0 ? series[closest - 1] : null;
    const dt = new Date(s.d + 'T12:00:00');
    const fd = dt.toLocaleDateString('en-US', {month:'short', day:'numeric'});
    const modeLabel = casMode === 'deaths' ? ' killed' : casMode === 'injuries' ? ' wounded' : '';

    let rows = '';
    function addRow(label, val, color, prevVal) {
      if (val === 0 && filterShare) return;
      const delta = prev ? val - prevVal : val;
      const sign = delta > 0 ? '+' : '';
      rows += '<div class="cas-tt-row"><span class="cas-tt-dot" style="background:' + color + '"></span><span class="cas-tt-label">' + label + '</span><span class="cas-tt-val">' + val.toLocaleString() + modeLabel + '</span><span class="cas-tt-delta">' + sign + delta + '/day</span></div>';
    }
    if (shouldShowCoal) addRow('Coalition', s.coalition, '#00e5ff', prev ? prev.coalition : 0);
    if (shouldShowAxis) addRow('Axis', s.axis, '#ff2d7b', prev ? prev.axis : 0);
    if (shouldShowCiv) addRow('Civilian', s.civilian, '#ffe100', prev ? prev.civilian : 0);

    const totalVal = (shouldShowCoal ? s.coalition : 0) + (shouldShowAxis ? s.axis : 0) + (shouldShowCiv ? s.civilian : 0);
    rows += '<div class="cas-tt-row" style="border-top:1px solid rgba(255,255,255,.1);padding-top:3px;margin-top:3px"><span class="cas-tt-label" style="font-weight:600">Total</span><span class="cas-tt-val">' + totalVal.toLocaleString() + modeLabel + '</span></div>';

    tooltip.innerHTML = '<div class="cas-tt-date">' + fd + '</div>' + rows;
    tooltip.style.display = 'block';
    const tx = toX(closest);
    const leftPos = tx + 14;
    const rightOverflow = leftPos + 160 > w;
    tooltip.style.left = (rightOverflow ? tx - 164 : leftPos) + 'px';
    tooltip.style.top = Math.max(4, Math.min(e.clientY - rect.top - 20, h - 60)) + 'px';
  };
  canvas.onmouseleave = function() { document.getElementById('casTooltip').style.display = 'none'; };
}


// ===== DISPLACEMENT CHART =====
const dispShowCountries = {};
function drawDisplacementChart() {
  const canvas = document.getElementById('dispChart');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  const w = rect.width, h = rect.height;
  if (w < 10 || h < 10) return;
  canvas.width = w * dpr; canvas.height = h * dpr;
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  const ctx3 = canvas.getContext('2d');
  ctx3.scale(dpr, dpr);

  const conflictDays = days.filter(d => d >= CONFLICT_START && DISPLACEMENT_DATA[d]);
  if (!conflictDays.length) return;

  // Get all countries across all days
  const allCountries = [...new Set(conflictDays.flatMap(d => Object.keys(DISPLACEMENT_DATA[d])))].sort((a,b) => {
    const last = DISPLACEMENT_DATA[conflictDays[conflictDays.length-1]];
    return (last[b]||0) - (last[a]||0);
  });

  // Init visibility (all on by default)
  allCountries.forEach(c => { if (dispShowCountries[c] === undefined) dispShowCountries[c] = true; });

  // Build legend
  const legendEl = document.getElementById('dispLegend');
  if (legendEl && !legendEl.dataset.built) {
    legendEl.innerHTML = allCountries.map(c => {
      const col = DISPLACEMENT_COLORS[c] || '#888';
      return '<span onclick="togDispCountry(\'' + c.replace(/'/g, "\\'") + '\')" class="dl-' + c.replace(/\s/g,'') + '" style="--dl-col:' + col + '"><span class="disp-dot" style="background:' + col + ';width:10px;height:10px;border-radius:50%;display:inline-block"></span>' + c + '</span>';
    }).join('');
    legendEl.dataset.built = '1';
  }
  // Update dimmed state
  if (legendEl) {
    allCountries.forEach(c => {
      const sp = legendEl.querySelector('.dl-' + c.replace(/\s/g,''));
      if (sp) sp.classList.toggle('dl-dimmed', !dispShowCountries[c]);
    });
  }

  const visCountries = allCountries.filter(c => dispShowCountries[c]);
  const pad = {top:18, right:12, bottom:22, left:42};
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;
  const n = conflictDays.length;

  // Find max total stacked
  let maxTotal = 0;
  conflictDays.forEach(d => {
    const dd = DISPLACEMENT_DATA[d];
    let total = 0;
    visCountries.forEach(c => { total += dd[c] || 0; });
    if (total > maxTotal) maxTotal = total;
  });
  if (maxTotal === 0) maxTotal = 1;

  const toX = i => pad.left + (i / (n - 1)) * cw;
  const toY = v => pad.top + ch - (v / maxTotal) * ch;

  // Background
  ctx3.fillStyle = 'rgba(0,0,0,0)';
  ctx3.clearRect(0, 0, w, h);

  // Grid lines
  const gridLines = 4;
  ctx3.strokeStyle = 'rgba(255,255,255,.06)';
  ctx3.lineWidth = 1;
  for (let i = 0; i <= gridLines; i++) {
    const y = pad.top + (ch / gridLines) * i;
    ctx3.beginPath(); ctx3.moveTo(pad.left, y); ctx3.lineTo(w - pad.right, y); ctx3.stroke();
    const val = maxTotal * (1 - i / gridLines);
    ctx3.fillStyle = 'rgba(255,255,255,.3)';
    ctx3.font = '9px "DM Sans",sans-serif';
    ctx3.textAlign = 'right';
    ctx3.fillText(val >= 1000000 ? (val/1000000).toFixed(1) + 'M' : val >= 1000 ? Math.round(val/1000) + 'K' : Math.round(val), pad.left - 4, y + 3);
  }

  // X axis labels (every 3 days)
  ctx3.fillStyle = 'rgba(255,255,255,.3)';
  ctx3.font = '9px "DM Sans",sans-serif';
  ctx3.textAlign = 'center';
  conflictDays.forEach((d, i) => {
    if (i % 3 === 0 || i === n - 1) {
      const dt = new Date(d + 'T12:00:00');
      ctx3.fillText((dt.getMonth()+1) + '/' + dt.getDate(), toX(i), h - 4);
    }
  });

  // Stacked area
  // Bottom-up: each country stacked
  const stacks = new Array(n).fill(0);
  for (let ci = visCountries.length - 1; ci >= 0; ci--) {
    const c = visCountries[ci];
    const col = DISPLACEMENT_COLORS[c] || '#888';
    const prevStacks = stacks.slice();

    // Update stacks
    conflictDays.forEach((d, i) => {
      stacks[i] = prevStacks[i] + (DISPLACEMENT_DATA[d][c] || 0);
    });

    // Fill area
    ctx3.beginPath();
    ctx3.moveTo(toX(0), toY(stacks[0]));
    for (let i = 1; i < n; i++) ctx3.lineTo(toX(i), toY(stacks[i]));
    for (let i = n - 1; i >= 0; i--) ctx3.lineTo(toX(i), toY(prevStacks[i]));
    ctx3.closePath();
    ctx3.fillStyle = col.replace(')', ',.25)').replace('rgb', 'rgba').replace('#', '');
    // Use hex to rgba
    const r = parseInt(col.slice(1,3),16), g = parseInt(col.slice(3,5),16), b = parseInt(col.slice(5,7),16);
    ctx3.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',.25)';
    ctx3.fill();

    // Line on top
    ctx3.beginPath();
    ctx3.moveTo(toX(0), toY(stacks[0]));
    for (let i = 1; i < n; i++) ctx3.lineTo(toX(i), toY(stacks[i]));
    ctx3.strokeStyle = col;
    ctx3.lineWidth = 1.5;
    ctx3.globalAlpha = 0.8;
    ctx3.stroke();
    ctx3.globalAlpha = 1;
  }

  // Selected day marker
  const selIdx = conflictDays.indexOf(selDay);
  if (selIdx >= 0) {
    const x = toX(selIdx);
    ctx3.strokeStyle = 'rgba(0,229,255,.4)';
    ctx3.lineWidth = 1;
    ctx3.setLineDash([3,3]);
    ctx3.beginPath(); ctx3.moveTo(x, pad.top); ctx3.lineTo(x, pad.top + ch); ctx3.stroke();
    ctx3.setLineDash([]);
    // Dots at stack boundaries for selected day (matches reverse stacking order)
    const dd = DISPLACEMENT_DATA[conflictDays[selIdx]];
    if (dd) {
      let cumul = 0;
      for (let ci = visCountries.length - 1; ci >= 0; ci--) {
        const c = visCountries[ci];
        cumul += dd[c] || 0;
        const col = DISPLACEMENT_COLORS[c] || '#888';
        ctx3.fillStyle = col; ctx3.beginPath(); ctx3.arc(x, toY(cumul), 3, 0, Math.PI*2); ctx3.fill();
      }
    }
  }

  // Tooltip
  const tooltip = document.getElementById('dispTooltip');
  canvas.onmousemove = function(e) {
    const rect2 = canvas.getBoundingClientRect();
    const mx = e.clientX - rect2.left;
    if (mx < pad.left || mx > w - pad.right) { tooltip.style.display = 'none'; return; }
    const idx = Math.round(((mx - pad.left) / cw) * (n - 1));
    const closest = Math.max(0, Math.min(n - 1, idx));
    const d = conflictDays[closest];
    const dd = DISPLACEMENT_DATA[d];
    const dt = new Date(d + 'T12:00:00');
    const fd = dt.toLocaleDateString('en-US', {month:'short', day:'numeric'});
    let total = 0;
    let rows = '';
    visCountries.forEach(c => {
      const val = dd[c] || 0;
      total += val;
      const col = DISPLACEMENT_COLORS[c] || '#888';
      rows += '<div class="disp-tt-row"><span class="disp-tt-dot" style="background:' + col + '"></span><span class="disp-tt-label">' + c + '</span><span class="disp-tt-val">' + (val >= 1000000 ? (val/1000000).toFixed(1) + 'M' : val >= 1000 ? Math.round(val/1000).toLocaleString() + 'K' : val) + '</span></div>';
    });
    rows += '<div class="disp-tt-row" style="border-top:1px solid rgba(255,255,255,.1);padding-top:3px;margin-top:3px"><span class="disp-tt-label" style="font-weight:600">Total</span><span class="disp-tt-val">' + (total >= 1000000 ? (total/1000000).toFixed(1) + 'M' : Math.round(total/1000).toLocaleString() + 'K') + '</span></div>';
    tooltip.innerHTML = '<div class="disp-tt-date">' + fd + '</div>' + rows;
    tooltip.style.display = 'block';
    const tx = toX(closest);
    const leftPos = tx + 14;
    const rightOverflow = leftPos + 160 > w;
    tooltip.style.left = (rightOverflow ? tx - 164 : leftPos) + 'px';
    tooltip.style.top = Math.max(4, Math.min(e.clientY - rect2.top - 20, h - 60)) + 'px';
  };
  canvas.onmouseleave = function() {
    document.getElementById('dispTooltip').style.display = 'none';
  };
}
function togDispCountry(c) {
  dispShowCountries[c] = !dispShowCountries[c];
  drawDisplacementChart();
}

// ===== OIL PRICE CHART =====
function drawOilPriceChart() {
  const canvas = document.getElementById('oilChart');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  const w = rect.width, h = rect.height;
  if (w < 10 || h < 10) return;
  canvas.width = w * dpr; canvas.height = h * dpr;
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  const cx = canvas.getContext('2d');
  cx.scale(dpr, dpr);

  const priceDays = days.filter(d => OIL_PRICE_DATA[d]);
  if (!priceDays.length) return;

  // Update selection label
  const selLabel = document.getElementById('oilSelection');
  const todayPrice = OIL_PRICE_DATA[selDay];
  if (selLabel) selLabel.textContent = todayPrice ? '\u2014 $' + todayPrice.brent.toFixed(0) + ' Brent' : '';

  const pad = {top:14, right:12, bottom:22, left:38};
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;
  const n = priceDays.length;

  // Y scale
  let yMin = Infinity, yMax = -Infinity;
  priceDays.forEach(d => {
    const p = OIL_PRICE_DATA[d];
    yMin = Math.min(yMin, p.brent, p.wti);
    yMax = Math.max(yMax, p.brent, p.wti);
  });
  const yPad = (yMax - yMin) * 0.15;
  yMin = Math.floor((yMin - yPad) / 5) * 5;
  yMax = Math.ceil((yMax + yPad) / 5) * 5;

  const toX = i => pad.left + (i / (n - 1)) * cw;
  const toY = v => pad.top + ch - ((v - yMin) / (yMax - yMin)) * ch;

  cx.clearRect(0, 0, w, h);

  // Conflict start marker
  const conflictIdx = priceDays.indexOf(CONFLICT_START);
  if (conflictIdx >= 0) {
    cx.fillStyle = 'rgba(255,45,123,.06)';
    cx.fillRect(toX(conflictIdx), pad.top, cw - (toX(conflictIdx) - pad.left), ch);
  }

  // Grid lines
  cx.strokeStyle = 'rgba(255,255,255,.06)';
  cx.lineWidth = 1;
  const yTicks = 4;
  for (let i = 0; i <= yTicks; i++) {
    const yv = yMin + ((yMax - yMin) / yTicks) * i;
    const yy = toY(yv);
    cx.beginPath(); cx.moveTo(pad.left, yy); cx.lineTo(w - pad.right, yy); cx.stroke();
    cx.fillStyle = 'rgba(255,255,255,.35)';
    cx.font = '9px "DM Sans",sans-serif';
    cx.textAlign = 'right';
    cx.fillText('$' + Math.round(yv), pad.left - 4, yy + 3);
  }

  // X labels
  cx.fillStyle = 'rgba(255,255,255,.35)';
  cx.font = '9px "DM Sans",sans-serif';
  cx.textAlign = 'center';
  priceDays.forEach((d, i) => {
    if (i % 4 === 0 || i === n - 1) {
      const dt = new Date(d + 'T12:00:00');
      cx.fillText((dt.getMonth()+1) + '/' + dt.getDate(), toX(i), h - 4);
    }
  });

  // Selected day marker
  const selIdx = priceDays.indexOf(selDay);
  if (selIdx >= 0) {
    cx.save();
    cx.strokeStyle = 'rgba(0,229,255,.3)';
    cx.lineWidth = 1;
    cx.setLineDash([4, 3]);
    cx.beginPath(); cx.moveTo(toX(selIdx), pad.top); cx.lineTo(toX(selIdx), pad.top + ch); cx.stroke();
    cx.restore();
  }

  // Draw line helper
  function drawLine(key, color) {
    cx.strokeStyle = color;
    cx.lineWidth = 2;
    cx.beginPath();
    priceDays.forEach((d, i) => {
      const x = toX(i), y = toY(OIL_PRICE_DATA[d][key]);
      i === 0 ? cx.moveTo(x, y) : cx.lineTo(x, y);
    });
    cx.stroke();
    // Area fill
    cx.save();
    cx.globalAlpha = 0.06;
    cx.fillStyle = color;
    cx.beginPath();
    priceDays.forEach((d, i) => {
      const x = toX(i), y = toY(OIL_PRICE_DATA[d][key]);
      i === 0 ? cx.moveTo(x, y) : cx.lineTo(x, y);
    });
    cx.lineTo(toX(n - 1), pad.top + ch);
    cx.lineTo(toX(0), pad.top + ch);
    cx.closePath();
    cx.fill();
    cx.restore();
  }

  drawLine('brent', '#ff9500');
  drawLine('wti', '#00e5ff');

  // Dots on selected day
  if (selIdx >= 0) {
    const p = OIL_PRICE_DATA[priceDays[selIdx]];
    cx.fillStyle = '#ff9500'; cx.beginPath(); cx.arc(toX(selIdx), toY(p.brent), 4, 0, Math.PI*2); cx.fill();
    cx.fillStyle = '#00e5ff'; cx.beginPath(); cx.arc(toX(selIdx), toY(p.wti), 4, 0, Math.PI*2); cx.fill();
  }

  // Tooltip
  const tooltip = document.getElementById('oilTooltip');
  canvas.onmousemove = function(e) {
    const rect2 = canvas.getBoundingClientRect();
    const mx = e.clientX - rect2.left;
    if (mx < pad.left || mx > w - pad.right) { tooltip.style.display = 'none'; return; }
    const idx = Math.round(((mx - pad.left) / cw) * (n - 1));
    const closest = Math.max(0, Math.min(n - 1, idx));
    const d = priceDays[closest];
    const p = OIL_PRICE_DATA[d];
    const prev = closest > 0 ? OIL_PRICE_DATA[priceDays[closest - 1]] : null;
    const dt = new Date(d + 'T12:00:00');
    const fd = dt.toLocaleDateString('en-US', {month:'short', day:'numeric'});
    const delta = (v, pv) => { const d = v - pv; return (d >= 0 ? '+' : '') + d.toFixed(2); };
    let rows = '';
    rows += '<div class="oil-tt-row"><span class="oil-tt-dot" style="background:#ff9500"></span><span class="oil-tt-label">Brent</span><span class="oil-tt-val">$' + p.brent.toFixed(2) + '</span>' + (prev ? '<span class="oil-tt-delta">' + delta(p.brent, prev.brent) + '</span>' : '') + '</div>';
    rows += '<div class="oil-tt-row"><span class="oil-tt-dot" style="background:#00e5ff"></span><span class="oil-tt-label">WTI</span><span class="oil-tt-val">$' + p.wti.toFixed(2) + '</span>' + (prev ? '<span class="oil-tt-delta">' + delta(p.wti, prev.wti) + '</span>' : '') + '</div>';
    rows += '<div class="oil-tt-row" style="border-top:1px solid rgba(255,255,255,.1);padding-top:3px;margin-top:3px"><span class="oil-tt-label" style="font-size:.6rem;color:var(--text3)">Spread</span><span class="oil-tt-val" style="font-size:.65rem">$' + (p.brent - p.wti).toFixed(2) + '</span></div>';
    tooltip.innerHTML = '<div class="oil-tt-date">' + fd + '</div>' + rows;
    tooltip.style.display = 'block';
    const tx = toX(closest);
    const leftPos = tx + 14;
    tooltip.style.left = (leftPos + 160 > w ? tx - 164 : leftPos) + 'px';
    tooltip.style.top = Math.max(4, Math.min(e.clientY - rect2.top - 20, h - 60)) + 'px';
  };
  canvas.onmouseleave = function() { tooltip.style.display = 'none'; };
}

// ===== CASUALTY DATA (cumulative by faction, per day) =====
// Sources: Estimated from conflict reporting patterns (Reuters, Al Jazeera, DoD, IRGC statements)
// coalition = US + Israel + allied forces. axis = Iran + Hezbollah + Houthi + militia forces.
// civilian = non-combatant casualties across all territories.
// Each entry: {coalition: {deaths, injuries}, axis: {deaths, injuries}, civilian: {deaths, injuries}}
// ===== DISPLACEMENT DATA (cumulative displaced persons by country, per day) =====
// Sources: UNHCR, Lebanese disaster management, UNRWA, IOM, Iranian Red Crescent
// Each entry: {country: displaced_count, ...}
// ===== OIL PRICE DATA (end-of-day close, Brent + WTI, USD/bbl) =====
// Sources: Reuters, Bloomberg, Fortune, EIA. Pre-conflict baseline ~$72 Brent/$68 WTI
// ===== GOLD PRICE DATA (USD/oz, spot close) =====
// Sources: Kitco, Bloomberg, Reuters. Pre-conflict baseline ~$2,920. Flight to safety drives rally.
// ===== SHIPPING TRANSIT DATA (computed from HZ_EVENTS) =====
// Pre-conflict baseline: ~25 tankers/day through Hormuz, ~35/day through Bab el-Mandeb
// ===== SUEZ CANAL TRANSIT DATA =====
// Normal baseline ~50-55 daily transits. Drops as Red Sea traffic diverts around Cape.
// ===== ESCALATION SCORE (1-10 scale) =====

function updateEscalation() {
  const level = ESCALATION_SCORES[selDay] || 1;

  // Escalation level box in sparkline card
  const escBox = document.getElementById('escLevelBox');
  if (escBox) {
    escBox.textContent = level;
    escBox.style.color = getEscColor(level);
  }

  // Days since conflict in nav bar
  const dayEl = document.getElementById('conflictDayNum');
  if (dayEl) {
    if (selDay >= CONFLICT_START) {
      const cIdx = days.indexOf(CONFLICT_START);
      const sIdx = days.indexOf(selDay);
      dayEl.textContent = sIdx - cIdx + 1;
    } else {
      const cIdx = days.indexOf(CONFLICT_START);
      const sIdx = days.indexOf(selDay);
      dayEl.textContent = 'T' + (sIdx - cIdx);
    }
  }

  // Gradient bar marker position (level 1-10 mapped to 0-100%)
  const marker = document.getElementById('escMarker');
  if (marker) marker.style.left = ((level - 1) / 9 * 100) + '%';

  // Sparkline
  const canvas = document.getElementById('escSpark');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const cw = canvas.clientWidth || 220, ch = canvas.clientHeight || 80;
  canvas.width = cw * dpr;
  canvas.height = ch * dpr;
  const cx = canvas.getContext('2d');
  cx.scale(dpr, dpr);
  cx.clearRect(0, 0, cw, ch);

  const pad = {l:2, r:2, t:6, b:6};
  const pw = cw - pad.l - pad.r;
  const ph = ch - pad.t - pad.b;
  const n = days.length;
  if (n < 2) return;

  const selIdx = days.indexOf(selDay);

  // Draw filled area under sparkline with gradient fill
  const toX = i => pad.l + (i / (n - 1)) * pw;
  const toY = v => pad.t + ph - ((v - 1) / 9) * ph;

  // Create gradient matching the green→red escalation gradient
  const grad = cx.createLinearGradient(0, pad.t, 0, pad.t + ph);
  grad.addColorStop(0, 'rgba(255,45,123,.25)');
  grad.addColorStop(0.3, 'rgba(255,149,0,.15)');
  grad.addColorStop(0.6, 'rgba(255,225,0,.1)');
  grad.addColorStop(1, 'rgba(0,255,136,.05)');

  cx.beginPath();
  days.forEach((d, i) => {
    const v = ESCALATION_SCORES[d] || 1;
    const x = toX(i), y = toY(v);
    i === 0 ? cx.moveTo(x, y) : cx.lineTo(x, y);
  });
  cx.lineTo(toX(n - 1), pad.t + ph);
  cx.lineTo(toX(0), pad.t + ph);
  cx.closePath();
  cx.fillStyle = grad;
  cx.fill();

  // Draw sparkline stroke with per-segment coloring
  for (let i = 1; i < n; i++) {
    const v0 = ESCALATION_SCORES[days[i-1]] || 1;
    const v1 = ESCALATION_SCORES[days[i]] || 1;
    const avg = (v0 + v1) / 2;
    cx.beginPath();
    cx.moveTo(toX(i-1), toY(v0));
    cx.lineTo(toX(i), toY(v1));
    cx.strokeStyle = getEscColor(avg);
    cx.lineWidth = 2;
    cx.stroke();
  }

  // Current day dot
  if (selIdx >= 0) {
    const sx = toX(selIdx), sy = toY(ESCALATION_SCORES[days[selIdx]] || 1);
    cx.beginPath();
    cx.arc(sx, sy, 4, 0, Math.PI * 2);
    cx.fillStyle = getEscColor(level);
    cx.fill();
    cx.strokeStyle = '#fff';
    cx.lineWidth = 1;
    cx.stroke();
  }
}

// ===== CIVILIAN INFRASTRUCTURE =====
// ===== SHIPPING TRANSIT CHART =====
function drawShippingChart() {
  const canvas = document.getElementById('shipChart');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  const w = rect.width, h = rect.height;
  if (w < 10 || h < 10) return;
  canvas.width = w * dpr; canvas.height = h * dpr;
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  const cx = canvas.getContext('2d');
  cx.scale(dpr, dpr);

  const shipDays = days.filter(d => SHIPPING_DATA[d]);
  if (!shipDays.length) return;

  const selLabel = document.getElementById('shipSelection');
  const td = SHIPPING_DATA[selDay];
  if (selLabel) selLabel.textContent = td ? '\u2014 ' + td.hormuz + ' Hormuz, ' + td.redsea + ' Red Sea, ' + td.suez + ' Suez' : '';

  const pad = {top:14, right:12, bottom:22, left:32};
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;
  const n = shipDays.length;

  let yMax = 0;
  shipDays.forEach(d => { const s = SHIPPING_DATA[d]; yMax = Math.max(yMax, s.hormuz, s.redsea, s.suez); });
  yMax = Math.ceil(yMax / 5) * 5 + 5;

  const toX = i => pad.left + (i / (n - 1)) * cw;
  const toY = v => pad.top + ch - (v / yMax) * ch;

  cx.clearRect(0, 0, w, h);

  const conflictIdx = shipDays.indexOf(CONFLICT_START);
  if (conflictIdx >= 0) {
    cx.fillStyle = 'rgba(255,45,123,.06)';
    cx.fillRect(toX(conflictIdx), pad.top, cw - (toX(conflictIdx) - pad.left), ch);
  }

  cx.strokeStyle = 'rgba(255,255,255,.06)'; cx.lineWidth = 1;
  const yTicks = 4;
  for (let i = 0; i <= yTicks; i++) {
    const yv = (yMax / yTicks) * i;
    const yy = toY(yv);
    cx.beginPath(); cx.moveTo(pad.left, yy); cx.lineTo(w - pad.right, yy); cx.stroke();
    cx.fillStyle = 'rgba(255,255,255,.35)';
    cx.font = '9px "DM Sans",sans-serif';
    cx.textAlign = 'right';
    cx.fillText(Math.round(yv), pad.left - 4, yy + 3);
  }

  cx.fillStyle = 'rgba(255,255,255,.35)';
  cx.font = '9px "DM Sans",sans-serif';
  cx.textAlign = 'center';
  shipDays.forEach((d, i) => {
    if (i % 4 === 0 || i === n - 1) {
      const dt = new Date(d + 'T12:00:00');
      cx.fillText((dt.getMonth()+1) + '/' + dt.getDate(), toX(i), h - 4);
    }
  });

  const selIdx = shipDays.indexOf(selDay);
  if (selIdx >= 0) {
    cx.save(); cx.strokeStyle = 'rgba(0,229,255,.3)'; cx.lineWidth = 1; cx.setLineDash([4, 3]);
    cx.beginPath(); cx.moveTo(toX(selIdx), pad.top); cx.lineTo(toX(selIdx), pad.top + ch); cx.stroke();
    cx.restore();
  }

  function drawLine(key, color) {
    cx.strokeStyle = color; cx.lineWidth = 2; cx.beginPath();
    shipDays.forEach((d, i) => { const x = toX(i), y = toY(SHIPPING_DATA[d][key]); i === 0 ? cx.moveTo(x, y) : cx.lineTo(x, y); });
    cx.stroke();
    cx.save(); cx.globalAlpha = 0.06; cx.fillStyle = color; cx.beginPath();
    shipDays.forEach((d, i) => { const x = toX(i), y = toY(SHIPPING_DATA[d][key]); i === 0 ? cx.moveTo(x, y) : cx.lineTo(x, y); });
    cx.lineTo(toX(n - 1), pad.top + ch); cx.lineTo(toX(0), pad.top + ch); cx.closePath(); cx.fill(); cx.restore();
  }

  drawLine('hormuz', '#ff9500');
  drawLine('redsea', '#ff2d7b');
  drawLine('suez', '#c084fc');

  if (selIdx >= 0) {
    const s = SHIPPING_DATA[shipDays[selIdx]];
    cx.fillStyle = '#ff9500'; cx.beginPath(); cx.arc(toX(selIdx), toY(s.hormuz), 4, 0, Math.PI*2); cx.fill();
    cx.fillStyle = '#ff2d7b'; cx.beginPath(); cx.arc(toX(selIdx), toY(s.redsea), 4, 0, Math.PI*2); cx.fill();
    cx.fillStyle = '#c084fc'; cx.beginPath(); cx.arc(toX(selIdx), toY(s.suez), 4, 0, Math.PI*2); cx.fill();
  }

  const tooltip = document.getElementById('shipTooltip');
  canvas.onmousemove = function(e) {
    const rect2 = canvas.getBoundingClientRect();
    const mx = e.clientX - rect2.left;
    if (mx < pad.left || mx > w - pad.right) { tooltip.style.display = 'none'; return; }
    const idx = Math.round(((mx - pad.left) / cw) * (n - 1));
    const closest = Math.max(0, Math.min(n - 1, idx));
    const d = shipDays[closest], s = SHIPPING_DATA[d];
    const dt = new Date(d + 'T12:00:00');
    const fd = dt.toLocaleDateString('en-US', {month:'short', day:'numeric'});
    let rows = '<div class="ship-tt-row"><span class="ship-tt-dot" style="background:#ff9500"></span><span class="ship-tt-label">Hormuz</span><span class="ship-tt-val">' + s.hormuz + ' transits</span></div>';
    rows += '<div class="ship-tt-row"><span class="ship-tt-dot" style="background:#ff2d7b"></span><span class="ship-tt-label">Bab el-Mandeb</span><span class="ship-tt-val">' + s.redsea + ' transits</span></div>';
    rows += '<div class="ship-tt-row"><span class="ship-tt-dot" style="background:#c084fc"></span><span class="ship-tt-label">Suez</span><span class="ship-tt-val">' + s.suez + ' transits</span></div>';
    rows += '<div class="ship-tt-row" style="border-top:1px solid rgba(255,255,255,.1);padding-top:3px;margin-top:3px"><span class="ship-tt-label" style="font-size:.6rem;color:var(--text3)">Total</span><span class="ship-tt-val" style="font-size:.65rem">' + (s.hormuz + s.redsea + s.suez) + '</span></div>';
    tooltip.innerHTML = '<div class="ship-tt-date">' + fd + '</div>' + rows;
    tooltip.style.display = 'block';
    const tx = toX(closest);
    tooltip.style.left = (tx + 14 + 160 > w ? tx - 164 : tx + 14) + 'px';
    tooltip.style.top = Math.max(4, Math.min(e.clientY - rect2.top - 20, h - 60)) + 'px';
  };
  canvas.onmouseleave = function() { tooltip.style.display = 'none'; };
}

// ===== FLIGHT DISRUPTIONS CHART =====
function drawFlightChart() {
  const canvas = document.getElementById('flightChart');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  const w = rect.width, h = rect.height;
  if (w < 10 || h < 10) return;
  canvas.width = w * dpr; canvas.height = h * dpr;
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  const cx = canvas.getContext('2d');
  cx.scale(dpr, dpr);

  const fDays = days.filter(d => FLIGHT_STATUS_DATA[d]);
  if (!fDays.length) return;

  const selLabel = document.getElementById('flightSelection');
  const td = FLIGHT_STATUS_DATA[selDay];
  if (selLabel && td) selLabel.textContent = '\u2014 ' + td.closed + ' closed, ' + td.restricted + ' restricted';

  const pad = {top:14, right:12, bottom:22, left:32};
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;
  const n = fDays.length;
  const total = AP.length;

  const toX = i => pad.left + (i / (n - 1)) * cw;
  const toY = v => pad.top + ch - (v / total) * ch;

  cx.clearRect(0, 0, w, h);

  const conflictIdx = fDays.indexOf(CONFLICT_START);
  if (conflictIdx >= 0) {
    cx.fillStyle = 'rgba(255,45,123,.06)';
    cx.fillRect(toX(conflictIdx), pad.top, cw - (toX(conflictIdx) - pad.left), ch);
  }

  cx.strokeStyle = 'rgba(255,255,255,.06)'; cx.lineWidth = 1;
  const yTicks = 4;
  for (let i = 0; i <= yTicks; i++) {
    const yv = Math.round((total / yTicks) * i);
    const yy = toY(yv);
    cx.beginPath(); cx.moveTo(pad.left, yy); cx.lineTo(w - pad.right, yy); cx.stroke();
    cx.fillStyle = 'rgba(255,255,255,.35)';
    cx.font = '9px "DM Sans",sans-serif';
    cx.textAlign = 'right';
    cx.fillText(yv, pad.left - 4, yy + 3);
  }

  cx.fillStyle = 'rgba(255,255,255,.35)';
  cx.font = '9px "DM Sans",sans-serif';
  cx.textAlign = 'center';
  fDays.forEach((d, i) => {
    if (i % 4 === 0 || i === n - 1) {
      const dt = new Date(d + 'T12:00:00');
      cx.fillText((dt.getMonth()+1) + '/' + dt.getDate(), toX(i), h - 4);
    }
  });

  const selIdx = fDays.indexOf(selDay);
  if (selIdx >= 0) {
    cx.save(); cx.strokeStyle = 'rgba(0,229,255,.3)'; cx.lineWidth = 1; cx.setLineDash([4, 3]);
    cx.beginPath(); cx.moveTo(toX(selIdx), pad.top); cx.lineTo(toX(selIdx), pad.top + ch); cx.stroke();
    cx.restore();
  }

  // Stacked area: closed (bottom), restricted (middle), open (top)
  // Draw closed area
  cx.save(); cx.globalAlpha = 0.25; cx.fillStyle = '#ff2d7b'; cx.beginPath();
  fDays.forEach((d, i) => { const f = FLIGHT_STATUS_DATA[d]; const y = toY(f.closed); i === 0 ? cx.moveTo(toX(i), y) : cx.lineTo(toX(i), y); });
  cx.lineTo(toX(n-1), toY(0)); cx.lineTo(toX(0), toY(0)); cx.closePath(); cx.fill(); cx.restore();

  // Draw restricted area (stacked on closed)
  cx.save(); cx.globalAlpha = 0.2; cx.fillStyle = '#ffe100'; cx.beginPath();
  fDays.forEach((d, i) => { const f = FLIGHT_STATUS_DATA[d]; const y = toY(f.closed + f.restricted); i === 0 ? cx.moveTo(toX(i), y) : cx.lineTo(toX(i), y); });
  for (let i = n-1; i >= 0; i--) { const f = FLIGHT_STATUS_DATA[fDays[i]]; cx.lineTo(toX(i), toY(f.closed)); }
  cx.closePath(); cx.fill(); cx.restore();

  // Draw open area (stacked on restricted+closed)
  cx.save(); cx.globalAlpha = 0.1; cx.fillStyle = '#00ff88'; cx.beginPath();
  fDays.forEach((d, i) => { const y = toY(total); i === 0 ? cx.moveTo(toX(i), y) : cx.lineTo(toX(i), y); });
  for (let i = n-1; i >= 0; i--) { const f = FLIGHT_STATUS_DATA[fDays[i]]; cx.lineTo(toX(i), toY(f.closed + f.restricted)); }
  cx.closePath(); cx.fill(); cx.restore();

  // Lines
  cx.strokeStyle = '#ff2d7b'; cx.lineWidth = 1.5; cx.beginPath();
  fDays.forEach((d, i) => { const y = toY(FLIGHT_STATUS_DATA[d].closed); i === 0 ? cx.moveTo(toX(i), y) : cx.lineTo(toX(i), y); });
  cx.stroke();

  cx.strokeStyle = '#ffe100'; cx.lineWidth = 1.5; cx.beginPath();
  fDays.forEach((d, i) => { const f = FLIGHT_STATUS_DATA[d]; const y = toY(f.closed + f.restricted); i === 0 ? cx.moveTo(toX(i), y) : cx.lineTo(toX(i), y); });
  cx.stroke();

  if (selIdx >= 0) {
    const f = FLIGHT_STATUS_DATA[fDays[selIdx]];
    cx.fillStyle = '#ff2d7b'; cx.beginPath(); cx.arc(toX(selIdx), toY(f.closed), 4, 0, Math.PI*2); cx.fill();
    cx.fillStyle = '#ffe100'; cx.beginPath(); cx.arc(toX(selIdx), toY(f.closed + f.restricted), 4, 0, Math.PI*2); cx.fill();
  }

  const tooltip = document.getElementById('flightTooltip');
  canvas.onmousemove = function(e) {
    const rect2 = canvas.getBoundingClientRect();
    const mx = e.clientX - rect2.left;
    if (mx < pad.left || mx > w - pad.right) { tooltip.style.display = 'none'; return; }
    const idx = Math.round(((mx - pad.left) / cw) * (n - 1));
    const closest = Math.max(0, Math.min(n - 1, idx));
    const d = fDays[closest], f = FLIGHT_STATUS_DATA[d];
    const dt = new Date(d + 'T12:00:00');
    const fd = dt.toLocaleDateString('en-US', {month:'short', day:'numeric'});
    let rows = '<div class="flt-tt-row"><span class="flt-tt-dot" style="background:#ff2d7b"></span><span class="flt-tt-label">Closed</span><span class="flt-tt-val">' + f.closed + '</span></div>';
    rows += '<div class="flt-tt-row"><span class="flt-tt-dot" style="background:#ffe100"></span><span class="flt-tt-label">Restricted</span><span class="flt-tt-val">' + f.restricted + '</span></div>';
    rows += '<div class="flt-tt-row"><span class="flt-tt-dot" style="background:#00ff88"></span><span class="flt-tt-label">Open</span><span class="flt-tt-val">' + f.open + '</span></div>';
    rows += '<div class="flt-tt-row" style="border-top:1px solid rgba(255,255,255,.1);padding-top:3px;margin-top:3px"><span class="flt-tt-label" style="font-size:.6rem;color:var(--text3)">Total airports</span><span class="flt-tt-val" style="font-size:.65rem">' + (f.closed + f.restricted + f.open) + '</span></div>';
    tooltip.innerHTML = '<div class="flt-tt-date">' + fd + '</div>' + rows;
    tooltip.style.display = 'block';
    const tx = toX(closest);
    tooltip.style.left = (tx + 14 + 160 > w ? tx - 164 : tx + 14) + 'px';
    tooltip.style.top = Math.max(4, Math.min(e.clientY - rect2.top - 20, h - 60)) + 'px';
  };
  canvas.onmouseleave = function() { tooltip.style.display = 'none'; };
}

// ===== GOLD PRICE CHART =====
function drawGoldChart() {
  const canvas = document.getElementById('goldChart');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  const w = rect.width, h = rect.height;
  if (w < 10 || h < 10) return;
  canvas.width = w * dpr; canvas.height = h * dpr;
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  const cx = canvas.getContext('2d');
  cx.scale(dpr, dpr);

  const goldDays = days.filter(d => GOLD_PRICE_DATA[d]);
  if (!goldDays.length) return;

  const selLabel = document.getElementById('goldSelection');
  const todayGold = GOLD_PRICE_DATA[selDay];
  if (selLabel) selLabel.textContent = todayGold ? '\u2014 $' + todayGold.toLocaleString() : '';

  const pad = {top:14, right:12, bottom:22, left:42};
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;
  const n = goldDays.length;

  let yMin = Infinity, yMax = -Infinity;
  goldDays.forEach(d => { const p = GOLD_PRICE_DATA[d]; yMin = Math.min(yMin, p); yMax = Math.max(yMax, p); });
  const yPad = (yMax - yMin) * 0.15;
  yMin = Math.floor((yMin - yPad) / 50) * 50;
  yMax = Math.ceil((yMax + yPad) / 50) * 50;

  const toX = i => pad.left + (i / (n - 1)) * cw;
  const toY = v => pad.top + ch - ((v - yMin) / (yMax - yMin)) * ch;

  cx.clearRect(0, 0, w, h);

  const conflictIdx = goldDays.indexOf(CONFLICT_START);
  if (conflictIdx >= 0) {
    cx.fillStyle = 'rgba(255,45,123,.06)';
    cx.fillRect(toX(conflictIdx), pad.top, cw - (toX(conflictIdx) - pad.left), ch);
  }

  cx.strokeStyle = 'rgba(255,255,255,.06)'; cx.lineWidth = 1;
  const yTicks = 4;
  for (let i = 0; i <= yTicks; i++) {
    const yv = yMin + ((yMax - yMin) / yTicks) * i;
    const yy = toY(yv);
    cx.beginPath(); cx.moveTo(pad.left, yy); cx.lineTo(w - pad.right, yy); cx.stroke();
    cx.fillStyle = 'rgba(255,255,255,.35)';
    cx.font = '9px "DM Sans",sans-serif';
    cx.textAlign = 'right';
    cx.fillText('$' + Math.round(yv).toLocaleString(), pad.left - 4, yy + 3);
  }

  cx.fillStyle = 'rgba(255,255,255,.35)';
  cx.font = '9px "DM Sans",sans-serif';
  cx.textAlign = 'center';
  goldDays.forEach((d, i) => {
    if (i % 4 === 0 || i === n - 1) {
      const dt = new Date(d + 'T12:00:00');
      cx.fillText((dt.getMonth()+1) + '/' + dt.getDate(), toX(i), h - 4);
    }
  });

  const selIdx = goldDays.indexOf(selDay);
  if (selIdx >= 0) {
    cx.save(); cx.strokeStyle = 'rgba(0,229,255,.3)'; cx.lineWidth = 1; cx.setLineDash([4, 3]);
    cx.beginPath(); cx.moveTo(toX(selIdx), pad.top); cx.lineTo(toX(selIdx), pad.top + ch); cx.stroke();
    cx.restore();
  }

  // Gold line
  cx.strokeStyle = '#ffd700'; cx.lineWidth = 2; cx.beginPath();
  goldDays.forEach((d, i) => { const x = toX(i), y = toY(GOLD_PRICE_DATA[d]); i === 0 ? cx.moveTo(x, y) : cx.lineTo(x, y); });
  cx.stroke();

  // Area fill
  cx.save(); cx.globalAlpha = 0.08; cx.fillStyle = '#ffd700'; cx.beginPath();
  goldDays.forEach((d, i) => { const x = toX(i), y = toY(GOLD_PRICE_DATA[d]); i === 0 ? cx.moveTo(x, y) : cx.lineTo(x, y); });
  cx.lineTo(toX(n - 1), pad.top + ch); cx.lineTo(toX(0), pad.top + ch); cx.closePath(); cx.fill(); cx.restore();

  if (selIdx >= 0) {
    cx.fillStyle = '#ffd700'; cx.beginPath(); cx.arc(toX(selIdx), toY(GOLD_PRICE_DATA[goldDays[selIdx]]), 4, 0, Math.PI*2); cx.fill();
  }

  const tooltip = document.getElementById('goldTooltip');
  canvas.onmousemove = function(e) {
    const rect2 = canvas.getBoundingClientRect();
    const mx = e.clientX - rect2.left;
    if (mx < pad.left || mx > w - pad.right) { tooltip.style.display = 'none'; return; }
    const idx = Math.round(((mx - pad.left) / cw) * (n - 1));
    const closest = Math.max(0, Math.min(n - 1, idx));
    const d = goldDays[closest];
    const price = GOLD_PRICE_DATA[d];
    const prev = closest > 0 ? GOLD_PRICE_DATA[goldDays[closest - 1]] : null;
    const dt = new Date(d + 'T12:00:00');
    const fd = dt.toLocaleDateString('en-US', {month:'short', day:'numeric'});
    const delta = prev ? ((price - prev >= 0 ? '+' : '') + (price - prev).toFixed(0)) : '';
    const pctChg = prev ? (' (' + ((price/prev-1)*100).toFixed(1) + '%)') : '';
    let rows = '<div class="gold-tt-row"><span class="gold-tt-dot" style="background:#ffd700"></span><span class="gold-tt-label">XAU/USD</span><span class="gold-tt-val">$' + price.toLocaleString() + '</span></div>';
    if (delta) rows += '<div class="gold-tt-row" style="border-top:1px solid rgba(255,255,255,.1);padding-top:3px;margin-top:3px"><span class="gold-tt-label" style="font-size:.6rem;color:var(--text3)">Change</span><span class="gold-tt-val" style="font-size:.65rem">' + delta + pctChg + '</span></div>';
    const baseline = GOLD_PRICE_DATA[goldDays[0]];
    rows += '<div class="gold-tt-row"><span class="gold-tt-label" style="font-size:.6rem;color:var(--text3)">Since Feb 25</span><span class="gold-tt-val" style="font-size:.65rem;color:#ffd700">+' + ((price/baseline-1)*100).toFixed(1) + '%</span></div>';
    tooltip.innerHTML = '<div class="gold-tt-date">' + fd + '</div>' + rows;
    tooltip.style.display = 'block';
    const tx = toX(closest);
    tooltip.style.left = (tx + 14 + 160 > w ? tx - 164 : tx + 14) + 'px';
    tooltip.style.top = Math.max(4, Math.min(e.clientY - rect2.top - 20, h - 60)) + 'px';
  };
  canvas.onmouseleave = function() { tooltip.style.display = 'none'; };
}

// ===== INSURANCE PREMIUM CHART =====
function drawInsuranceChart() {
  const canvas = document.getElementById('insChart');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  const w = rect.width, h = rect.height;
  canvas.width = w * dpr; canvas.height = h * dpr;
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  const cx = canvas.getContext('2d');
  cx.scale(dpr, dpr);

  const insDays = days.filter(d => INSURANCE_DATA[d]);
  const n = insDays.length;
  if (n < 2) return;
  const todayIns = INSURANCE_DATA[selDay];
  const selLabel = document.getElementById('insSelection');
  if (selLabel) selLabel.textContent = todayIns ? '\u2014 Gulf ' + todayIns.gulf.toFixed(2) + '%, Red Sea ' + todayIns.redsea.toFixed(2) + '%' : '';

  const pad = {top:12,right:12,bottom:22,left:38};
  const cw = w - pad.left - pad.right, ch = h - pad.top - pad.bottom;

  let yMax = 0;
  insDays.forEach(d => { const p = INSURANCE_DATA[d]; yMax = Math.max(yMax, p.gulf, p.redsea, p.eastmed); });
  yMax = Math.ceil(yMax * 1.1);

  const toX = i => pad.left + (i / (n - 1)) * cw;
  const toY = v => pad.top + ch - (v / yMax) * ch;

  // Grid
  cx.strokeStyle = 'rgba(255,255,255,.06)'; cx.lineWidth = 1;
  const ySteps = 5;
  for (let i = 0; i <= ySteps; i++) {
    const yv = (yMax / ySteps) * i;
    const y = toY(yv);
    cx.beginPath(); cx.moveTo(pad.left, y); cx.lineTo(w - pad.right, y); cx.stroke();
    cx.fillStyle = 'rgba(255,255,255,.3)'; cx.font = '9px DM Sans'; cx.textAlign = 'right';
    cx.fillText(yv.toFixed(1) + '%', pad.left - 4, y + 3);
  }

  // X-axis labels
  cx.fillStyle = 'rgba(255,255,255,.3)'; cx.font = '9px DM Sans'; cx.textAlign = 'center';
  const xLabelStep = Math.max(1, Math.floor(n / 6));
  insDays.forEach((d, i) => { if (i % xLabelStep === 0 || i === n - 1) { const dt = new Date(d + 'T12:00:00'); cx.fillText(dt.toLocaleDateString('en-US', {month:'short', day:'numeric'}), toX(i), h - 4); } });

  // Conflict start line
  const csIdx = insDays.indexOf(CONFLICT_START);
  if (csIdx >= 0) { cx.strokeStyle = 'rgba(255,45,123,.3)'; cx.lineWidth = 1; cx.setLineDash([3,3]); cx.beginPath(); cx.moveTo(toX(csIdx), pad.top); cx.lineTo(toX(csIdx), h - pad.bottom); cx.stroke(); cx.setLineDash([]); }

  // Draw lines
  function drawLine(key, color) {
    cx.strokeStyle = color; cx.lineWidth = 1.5; cx.beginPath();
    insDays.forEach((d, i) => { const x = toX(i), y = toY(INSURANCE_DATA[d][key]); i === 0 ? cx.moveTo(x, y) : cx.lineTo(x, y); });
    cx.stroke();
  }
  drawLine('gulf', '#ff2d7b');
  drawLine('redsea', '#ff9500');
  drawLine('eastmed', '#00e5ff');

  // Selected day dots
  const selIdx = insDays.indexOf(selDay);
  if (selIdx >= 0) {
    cx.strokeStyle = 'rgba(255,255,255,.15)'; cx.lineWidth = 1; cx.setLineDash([3,3]);
    cx.beginPath(); cx.moveTo(toX(selIdx), pad.top); cx.lineTo(toX(selIdx), pad.top + ch); cx.stroke(); cx.setLineDash([]);
    const s = INSURANCE_DATA[insDays[selIdx]];
    cx.fillStyle = '#ff2d7b'; cx.beginPath(); cx.arc(toX(selIdx), toY(s.gulf), 4, 0, Math.PI*2); cx.fill();
    cx.fillStyle = '#ff9500'; cx.beginPath(); cx.arc(toX(selIdx), toY(s.redsea), 4, 0, Math.PI*2); cx.fill();
    cx.fillStyle = '#00e5ff'; cx.beginPath(); cx.arc(toX(selIdx), toY(s.eastmed), 4, 0, Math.PI*2); cx.fill();
  }

  // Tooltip
  const tooltip = document.getElementById('insTooltip');
  canvas.onmousemove = function(e) {
    const rect2 = canvas.getBoundingClientRect();
    const mx = e.clientX - rect2.left;
    if (mx < pad.left || mx > w - pad.right) { tooltip.style.display = 'none'; return; }
    const idx = Math.round(((mx - pad.left) / cw) * (n - 1));
    const closest = Math.max(0, Math.min(n - 1, idx));
    const d = insDays[closest], ins = INSURANCE_DATA[d];
    const dt = new Date(d + 'T12:00:00');
    const fd = dt.toLocaleDateString('en-US', {month:'short', day:'numeric'});
    let rows = '<div class="ins-tt-row"><span class="ins-tt-dot" style="background:#ff2d7b"></span><span class="ins-tt-label">Gulf</span><span class="ins-tt-val">' + ins.gulf.toFixed(2) + '%</span></div>';
    rows += '<div class="ins-tt-row"><span class="ins-tt-dot" style="background:#ff9500"></span><span class="ins-tt-label">Red Sea</span><span class="ins-tt-val">' + ins.redsea.toFixed(2) + '%</span></div>';
    rows += '<div class="ins-tt-row"><span class="ins-tt-dot" style="background:#00e5ff"></span><span class="ins-tt-label">East Med</span><span class="ins-tt-val">' + ins.eastmed.toFixed(2) + '%</span></div>';
    tooltip.innerHTML = '<div class="ins-tt-date">' + fd + '</div>' + rows;
    tooltip.style.display = 'block';
    const tx = toX(closest);
    tooltip.style.left = (tx + 14 + 160 > w ? tx - 164 : tx + 14) + 'px';
    tooltip.style.top = Math.max(4, Math.min(e.clientY - rect2.top - 20, h - 60)) + 'px';
  };
  canvas.onmouseleave = function() { tooltip.style.display = 'none'; };
}

// ===== NOTAM / FIR CLOSURE CHART =====
function drawNotamChart() {
  const canvas = document.getElementById('notamChart');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  const w = rect.width, h = rect.height;
  canvas.width = w * dpr; canvas.height = h * dpr;
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  const cx = canvas.getContext('2d');
  cx.scale(dpr, dpr);

  const notamDays = days.filter(d => NOTAM_DATA[d]);
  const n = notamDays.length;
  if (n < 2) return;
  const todayNotam = NOTAM_DATA[selDay];
  const selLabel = document.getElementById('notamSelection');
  if (selLabel) selLabel.textContent = todayNotam ? '\u2014 ' + todayNotam.closed + ' closed, ' + todayNotam.restricted + ' restricted, ' + todayNotam.total + ' total' : '';

  const pad = {top:12,right:12,bottom:22,left:32};
  const cw = w - pad.left - pad.right, ch = h - pad.top - pad.bottom;

  let yMax = 0;
  notamDays.forEach(d => { const p = NOTAM_DATA[d]; yMax = Math.max(yMax, p.total); });
  yMax = Math.ceil(yMax * 1.15);

  const toX = i => pad.left + (i / (n - 1)) * cw;
  const toY = v => pad.top + ch - (v / yMax) * ch;

  // Grid
  cx.strokeStyle = 'rgba(255,255,255,.06)'; cx.lineWidth = 1;
  const ySteps = 5;
  for (let i = 0; i <= ySteps; i++) {
    const yv = Math.round((yMax / ySteps) * i);
    const y = toY(yv);
    cx.beginPath(); cx.moveTo(pad.left, y); cx.lineTo(w - pad.right, y); cx.stroke();
    cx.fillStyle = 'rgba(255,255,255,.3)'; cx.font = '9px DM Sans'; cx.textAlign = 'right';
    cx.fillText(yv, pad.left - 4, y + 3);
  }

  // X-axis labels
  cx.fillStyle = 'rgba(255,255,255,.3)'; cx.font = '9px DM Sans'; cx.textAlign = 'center';
  const xLabelStep = Math.max(1, Math.floor(n / 6));
  notamDays.forEach((d, i) => { if (i % xLabelStep === 0 || i === n - 1) { const dt = new Date(d + 'T12:00:00'); cx.fillText(dt.toLocaleDateString('en-US', {month:'short', day:'numeric'}), toX(i), h - 4); } });

  // Conflict start line
  const csIdx = notamDays.indexOf(CONFLICT_START);
  if (csIdx >= 0) { cx.strokeStyle = 'rgba(255,45,123,.3)'; cx.lineWidth = 1; cx.setLineDash([3,3]); cx.beginPath(); cx.moveTo(toX(csIdx), pad.top); cx.lineTo(toX(csIdx), h - pad.bottom); cx.stroke(); cx.setLineDash([]); }

  // Stacked area: closed (bottom) + restricted (middle), total line on top
  // Fill closed area
  cx.fillStyle = 'rgba(255,45,123,.2)';
  cx.beginPath();
  cx.moveTo(toX(0), toY(0));
  notamDays.forEach((d, i) => cx.lineTo(toX(i), toY(NOTAM_DATA[d].closed)));
  cx.lineTo(toX(n - 1), toY(0)); cx.closePath(); cx.fill();

  // Fill restricted area (stacked on top of closed)
  cx.fillStyle = 'rgba(255,225,0,.15)';
  cx.beginPath();
  notamDays.forEach((d, i) => { const nd = NOTAM_DATA[d]; cx.lineTo(toX(i), toY(nd.closed)); });
  for (let i = n - 1; i >= 0; i--) { const nd = NOTAM_DATA[notamDays[i]]; cx.lineTo(toX(i), toY(nd.closed + nd.restricted)); }
  cx.closePath(); cx.fill();

  // Lines
  // Closed line
  cx.strokeStyle = '#ff2d7b'; cx.lineWidth = 1.5; cx.beginPath();
  notamDays.forEach((d, i) => { const x = toX(i), y = toY(NOTAM_DATA[d].closed); i === 0 ? cx.moveTo(x, y) : cx.lineTo(x, y); });
  cx.stroke();

  // Restricted line (stacked)
  cx.strokeStyle = '#ffe100'; cx.lineWidth = 1.5; cx.beginPath();
  notamDays.forEach((d, i) => { const nd = NOTAM_DATA[d]; const x = toX(i), y = toY(nd.closed + nd.restricted); i === 0 ? cx.moveTo(x, y) : cx.lineTo(x, y); });
  cx.stroke();

  // Total line
  cx.strokeStyle = 'rgba(255,255,255,.3)'; cx.lineWidth = 1; cx.setLineDash([4,3]); cx.beginPath();
  notamDays.forEach((d, i) => { const x = toX(i), y = toY(NOTAM_DATA[d].total); i === 0 ? cx.moveTo(x, y) : cx.lineTo(x, y); });
  cx.stroke(); cx.setLineDash([]);

  // Selected day dots
  const selIdx = notamDays.indexOf(selDay);
  if (selIdx >= 0) {
    cx.strokeStyle = 'rgba(255,255,255,.15)'; cx.lineWidth = 1; cx.setLineDash([3,3]);
    cx.beginPath(); cx.moveTo(toX(selIdx), pad.top); cx.lineTo(toX(selIdx), pad.top + ch); cx.stroke(); cx.setLineDash([]);
    const nd = NOTAM_DATA[notamDays[selIdx]];
    cx.fillStyle = '#ff2d7b'; cx.beginPath(); cx.arc(toX(selIdx), toY(nd.closed), 4, 0, Math.PI*2); cx.fill();
    cx.fillStyle = '#ffe100'; cx.beginPath(); cx.arc(toX(selIdx), toY(nd.closed + nd.restricted), 4, 0, Math.PI*2); cx.fill();
    cx.fillStyle = 'rgba(255,255,255,.4)'; cx.beginPath(); cx.arc(toX(selIdx), toY(nd.total), 4, 0, Math.PI*2); cx.fill();
  }

  // Tooltip
  const tooltip = document.getElementById('notamTooltip');
  canvas.onmousemove = function(e) {
    const rect2 = canvas.getBoundingClientRect();
    const mx = e.clientX - rect2.left;
    if (mx < pad.left || mx > w - pad.right) { tooltip.style.display = 'none'; return; }
    const idx = Math.round(((mx - pad.left) / cw) * (n - 1));
    const closest = Math.max(0, Math.min(n - 1, idx));
    const d = notamDays[closest], nd = NOTAM_DATA[d];
    const dt = new Date(d + 'T12:00:00');
    const fd = dt.toLocaleDateString('en-US', {month:'short', day:'numeric'});
    let rows = '<div class="notam-tt-row"><span class="notam-tt-dot" style="background:#ff2d7b"></span><span class="notam-tt-label">FIR Closed</span><span class="notam-tt-val">' + nd.closed + '</span></div>';
    rows += '<div class="notam-tt-row"><span class="notam-tt-dot" style="background:#ffe100"></span><span class="notam-tt-label">Restricted</span><span class="notam-tt-val">' + nd.restricted + '</span></div>';
    rows += '<div class="notam-tt-row" style="border-top:1px solid rgba(255,255,255,.1);padding-top:3px;margin-top:3px"><span class="notam-tt-dot" style="background:rgba(255,255,255,.3)"></span><span class="notam-tt-label">Total NOTAMs</span><span class="notam-tt-val">' + nd.total + '</span></div>';
    tooltip.innerHTML = '<div class="notam-tt-date">' + fd + '</div>' + rows;
    tooltip.style.display = 'block';
    const tx = toX(closest);
    tooltip.style.left = (tx + 14 + 160 > w ? tx - 164 : tx + 14) + 'px';
    tooltip.style.top = Math.max(4, Math.min(e.clientY - rect2.top - 20, h - 60)) + 'px';
  };
  canvas.onmouseleave = function() { tooltip.style.display = 'none'; };
}

// --- TREND FACTOR REGISTRY (pluggable — add new factors here) ---
// Each factor: { name, weight, fn(ctx) → {score: -1..1, detail: string} | null }
// ctx = { selDay, pd (lookback day), windowStart, windowEnd, priorStart, co (selCo or null) }
// Return null to skip this factor for the current scope (e.g. maritime is theater-only)
const TREND_FACTORS = [

  // 1. AIRPORT CLOSURES (weight 15)
  { name:'Airports', weight:15, fn(ctx) {
    const airports = ctx.co ? AP.filter(a => a.co === ctx.co) : AP;
    if (!airports.length) return null;
    let cN=0, cT=0, rN=0, rT=0;
    airports.forEach(a => {
      const sN = getStat(a.c, ctx.selDay), sT = getStat(a.c, ctx.pd);
      if (sN==='Closed') cN++; if (sT==='Closed') cT++;
      if (sN==='Restricted') rN++; if (sT==='Restricted') rT++;
    });
    const scoreNow = cN*2 + rN, scoreThen = cT*2 + rT;
    const delta = scoreThen - scoreNow;
    const mx = airports.length * 2;
    return { score: mx > 0 ? delta / mx : 0,
      detail: delta > 0 ? (cT-cN)+' fewer closed' : delta < 0 ? (cN-cT)+' more closed' : 'No change' };
  }},

  // 2. CONFLICT STATUS (weight 30)
  { name:'Conflict', weight:30, fn(ctx) {
    const sv = {war:3, attack:2, peace:1};
    const countries = ctx.co ? [ctx.co] : ['Iran','Israel','Syria','Iraq','UAE','Qatar','Saudi Arabia','Jordan','Lebanon','Bahrain','Kuwait','Oman','Egypt','Turkey','Yemen'];
    let csNow=0, csThen=0;
    countries.forEach(co => { csNow += sv[getCStatus(co, ctx.selDay)]||1; csThen += sv[getCStatus(co, ctx.pd)]||1; });
    const delta = csThen - csNow;
    const mx = countries.length * 2;
    if (ctx.co) {
      const sNow = getCStatus(ctx.co, ctx.selDay), sThen = getCStatus(ctx.co, ctx.pd);
      const word = sNow === sThen ? (sNow==='war'?'At war':'At '+sNow) : (delta>0?'De-escalating':'Escalating');
      return { score: mx > 0 ? delta / mx : 0, detail: word };
    }
    return { score: mx > 0 ? delta / mx : 0, detail: delta>0?'De-escalating':delta<0?'Escalating':'Unchanged' };
  }},

  // 3. MARITIME ACTIVITY (weight 10) — theater-level only, skip for single country
  { name:'Maritime', weight:10, fn(ctx) {
    if (ctx.co) return null; // no per-country maritime data
    const hzNow = getHormuzDayData(ctx.selDay), hzThen = getHormuzDayData(ctx.pd);
    const svMap = {open:0, contested:1, blocked:2};
    const statNow = svMap[getHormuzStatus(ctx.selDay)]||0, statThen = svMap[getHormuzStatus(ctx.pd)]||0;
    const mineDelta = hzThen.activeMines - hzNow.activeMines;
    const passDelta = hzNow.todayPassages - hzThen.todayPassages;
    const statusDelta = statThen - statNow;
    const raw = mineDelta*0.3 + (passDelta>0?0.3:passDelta<0?-0.3:0) + statusDelta*0.4;
    const norm = Math.max(-1, Math.min(1, raw));
    return { score: norm, detail: norm>0.1?'Easing':norm<-0.1?'Tightening':'Stalled' };
  }},

  // 4. NEWS SENTIMENT (weight 20)
  { name:'Sentiment', weight:20, fn(ctx) {
    const matchCo = n => !ctx.co || (n.tags && n.tags.includes(ctx.co));
    let sentNow=0, sentPrior=0, cntNow=0, cntPrior=0;
    news.forEach(n => {
      if (!matchCo(n)) return;
      const dip = n.cat==='diplomatic' ? 2 : 1;
      if (n.d >= ctx.windowStart && n.d <= ctx.windowEnd) {
        cntNow++;
        if (n.imp==='e') sentNow -= 1*dip; else if (n.imp==='d') sentNow += 1.5*dip;
      }
      if (n.d >= ctx.priorStart && n.d < ctx.windowStart) {
        cntPrior++;
        if (n.imp==='e') sentPrior -= 1*dip; else if (n.imp==='d') sentPrior += 1.5*dip;
      }
    });
    if (!cntNow && !cntPrior && ctx.co) return null; // no news for this country
    const avgNow = cntNow>0 ? sentNow/cntNow : 0;
    const avgPrior = cntPrior>0 ? sentPrior/cntPrior : 0;
    const delta = Math.max(-1, Math.min(1, avgNow - avgPrior));
    return { score: delta, detail: delta>0.1?'More hopeful':delta<-0.1?'More hostile':'Mixed' };
  }},

  // 5. CASUALTIES / MILITARY ACTIVITY (weight 25) — with rate-of-change momentum
  { name:'Casualties', weight:25, fn(ctx) {
    const matchCo = n => !ctx.co || (n.tags && n.tags.includes(ctx.co));
    // Count escalation events in current and prior windows
    const casNewsNow = news.filter(n => n.d>=ctx.windowStart && n.d<=ctx.windowEnd && (n.cat==='military'||n.cat==='general') && n.imp==='e' && matchCo(n)).length;
    const casNewsPrior = news.filter(n => n.d>=ctx.priorStart && n.d<ctx.windowStart && (n.cat==='military'||n.cat==='general') && n.imp==='e' && matchCo(n)).length;
    // HZ_EVENTS only if theater-wide
    let milNow=0, milPrior=0;
    if (!ctx.co) {
      milNow = HZ_EVENTS.filter(e => e.d>=ctx.windowStart && e.d<=ctx.windowEnd && (e.type==='mine'||e.type==='houthi')).reduce((s,e)=>s+e.count,0);
      milPrior = HZ_EVENTS.filter(e => e.d>=ctx.priorStart && e.d<ctx.windowStart && (e.type==='mine'||e.type==='houthi')).reduce((s,e)=>s+e.count,0);
    }
    const totalNow = milNow+casNewsNow, totalPrior = milPrior+casNewsPrior;
    if (!totalNow && !totalPrior && ctx.co) return null;
    // Level component: fewer events = improving
    const levelDelta = totalPrior - totalNow;
    const mx = Math.max(totalNow, totalPrior, 1);
    const levelScore = levelDelta / mx;
    // Momentum component: rate of change (daily rate current vs prior)
    const windowDays = Math.max(1, days.indexOf(ctx.windowEnd) - days.indexOf(ctx.windowStart) + 1);
    const priorDays = Math.max(1, days.indexOf(ctx.windowStart) - days.indexOf(ctx.priorStart));
    const rateNow = totalNow / windowDays;
    const ratePrior = totalPrior / priorDays;
    const rateDelta = ratePrior - rateNow;
    const rateMax = Math.max(rateNow, ratePrior, 0.5);
    const momentumScore = rateDelta / rateMax;
    // Blend: 40% level, 60% momentum (momentum is leading indicator)
    const blended = levelScore * 0.4 + momentumScore * 0.6;
    const norm = Math.max(-1, Math.min(1, blended));
    const detail = norm > 0.1 ? 'Decelerating' : norm < -0.1 ? 'Accelerating' : 'Sustained';
    return { score: norm, detail };
  }}
];

// Compute trend for a group of countries (used for faction trend indicators)
// Returns {arrow, cls, label} or null if insufficient data
function getGroupTrend(countries) {
  const di = days.indexOf(selDay);
  if (di < 1 || !countries.length) return null;
  const lb = Math.min(di, 7), pd = days[di - lb];
  const windowStart = pd, windowEnd = selDay;
  const priorStart = days[Math.max(0, di - lb * 2)];

  // Run each TREND_FACTOR with a synthetic co=null but filtering to group countries
  const factors = [];
  TREND_FACTORS.forEach(f => {
    // Build a context that pretends no single country is selected
    // but we'll evaluate per-country and average
    if (f.name === 'Maritime') return; // theater-level only, skip for faction subsets

    // Evaluate per-country and average
    let totalScore = 0, count = 0;
    countries.forEach(co => {
      const ctx = { selDay, pd, windowStart, windowEnd, priorStart, co };
      const result = f.fn(ctx);
      if (result) { totalScore += result.score; count++; }
    });
    if (count > 0) {
      const avgScore = totalScore / count;
      factors.push({ name: f.name, weight: f.weight, score: avgScore });
    }
  });

  if (!factors.length) return null;

  let tw = 0, ts = 0;
  factors.forEach(f => { ts += f.score * f.weight; tw += f.weight; });
  const composite = tw > 0 ? ts / tw : 0;

  if (composite > 0.05) return { arrow:'\u2197', cls:'ft-improving', label:'Improving', score:composite };
  if (composite < -0.05) return { arrow:'\u2198', cls:'ft-worsening', label:'Worsening', score:composite };
  return { arrow:'\u2192', cls:'ft-steady', label:'Steady', score:composite };
}

function updateTrend() {
  const di = days.indexOf(selDay);
  const aE = document.getElementById('tA'), lE = document.getElementById('tL'), dE = document.getElementById('tD');
  const hE = document.getElementById('tH');

  // Determine scope label
  const factionLabels = {coalition:'Coalition', axis:'Axis of Resistance', neutral:'Neutral'};
  if (selFactions.size) {
    const fLabels = [...selFactions].map(f => factionLabels[f] || f);
    hE.textContent = fLabels.join(', ') + ' Trend';
  } else if (selCo.size) {
    hE.textContent = (selCo.size > 2 ? selCo.size + ' Countries' : [...selCo].join(', ')) + ' Trend';
  } else hE.textContent = '7-Day Trend';

  if (di < 1) {
    aE.textContent = '\u2192'; aE.className = 'trend-arrow steady';
    lE.textContent = 'Not enough data'; dE.textContent = ''; return;
  }

  // If faction is selected, use getGroupTrend for that faction's countries
  if (selFactions.size) {
    let countries = [];
    for (const f of selFactions) {
      const fCos = Object.keys(countryFaction).filter(k => countryFaction[k].faction === f);
      countries.push(...fCos);
    }
    const result = getGroupTrend(countries);
    if (!result) {
      aE.textContent = '\u2192'; aE.className = 'trend-arrow steady';
      lE.textContent = 'No data'; dE.textContent = ''; return;
    }
    aE.textContent = result.arrow;
    aE.style.color = getTrendColor(result.score);
    aE.className = 'trend-arrow';
    lE.textContent = result.label;
    dE.textContent = '';
    return;
  }

  const lb = Math.min(di, 7), pd = days[di - lb];
  const windowStart = pd, windowEnd = selDay;
  const priorStart = days[Math.max(0, di - lb * 2)];
  const ctx = { selDay, pd, windowStart, windowEnd, priorStart, co: selCo.size === 1 ? [...selCo][0] : null };

  // Evaluate all registered factors
  const factors = [];
  TREND_FACTORS.forEach(f => {
    const result = f.fn(ctx);
    if (result) factors.push({ name:f.name, weight:f.weight, score:result.score, detail:result.detail });
  });

  if (!factors.length) {
    aE.textContent = '\u2192'; aE.className = 'trend-arrow steady';
    lE.textContent = 'No data'; dE.textContent = ''; return;
  }

  // Weighted composite (re-normalizes weights to active factors only)
  let totalWeight = 0, totalScore = 0;
  factors.forEach(f => { totalScore += f.score * f.weight; totalWeight += f.weight; });
  const composite = totalWeight > 0 ? totalScore / totalWeight : 0;

  if (composite > 0.05) {
    aE.textContent = '\u2197'; aE.className = 'trend-arrow';
    aE.style.color = getTrendColor(composite);
    lE.textContent = 'Improving';
  } else if (composite < -0.05) {
    aE.textContent = '\u2198'; aE.className = 'trend-arrow';
    aE.style.color = getTrendColor(composite);
    lE.textContent = 'Worsening';
  } else {
    aE.textContent = '\u2192'; aE.className = 'trend-arrow';
    aE.style.color = getTrendColor(composite);
    lE.textContent = 'Holding steady';
  }

  const top = factors.sort((a, b) => Math.abs(b.score * b.weight) - Math.abs(a.score * a.weight));
  const parts = top.slice(0, 3).map(f => f.name + ': ' + f.detail);
  dE.textContent = parts.join(' \u00B7 ');
}

// (Old STRAIT OF HORMUZ MAP section removed — sea layers now render in unified drawMap())

// ===== INIT =====
DataStore.ready.then(() => {
  drawLegendSwatches();
  renderParties();
  buildCal();
  selectDay(days[days.length - 1]);
  renderCountryDetail();
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => {
    drawMap(); buildGantt();
    if (filtersOpen) { drawCasualtyChart(); drawDisplacementChart(); drawOilPriceChart(); drawShippingChart(); drawFlightChart(); drawGoldChart(); drawInsuranceChart(); drawNotamChart(); }
  }, 80); });
});
