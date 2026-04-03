// ===== MAP SELECTION =====
// selectCo(), clearCo(), hasFilter(), _afterFilterChange(), _updateFilterBadges(),
// togFilterFaction(), togHzFilter(), toggle state vars and toggle functions

// ===== TOGGLE STATE VARS =====
let showNFZ = false, showRoutes = false, showJamming = false;
let showOpen = false, showRestricted = false, showClosed = false;
let showCoalitionBases = false, showIranBases = false;
let showFleet = false;

// ===== TOGGLE FUNCTIONS =====
function toggleNFZ() {
  showNFZ = !showNFZ;
  document.getElementById('togNFZ').classList.toggle('al-active', showNFZ);
  drawMap();
}
function toggleRoutes() {
  showRoutes = !showRoutes;
  document.getElementById('togRoutes').classList.toggle('al-active', showRoutes);
  drawMap();
}
function toggleJamming() {
  showJamming = !showJamming;
  document.getElementById('togJamming').classList.toggle('al-active', showJamming);
  drawMap();
}
function toggleAirportFilter(status) {
  if (status === 'open') { showOpen = !showOpen; document.getElementById('togOpen').classList.toggle('al-active', showOpen); }
  else if (status === 'restricted') { showRestricted = !showRestricted; document.getElementById('togRestricted').classList.toggle('al-active', showRestricted); }
  else if (status === 'closed') { showClosed = !showClosed; document.getElementById('togClosed').classList.toggle('al-active', showClosed); }
  drawMap();
}
function toggleCoalitionBases() {
  showCoalitionBases = !showCoalitionBases;
  document.getElementById('togCoalition').classList.toggle('al-active', showCoalitionBases);
  drawMap();
}
function toggleIranBases() {
  showIranBases = !showIranBases;
  document.getElementById('togIran').classList.toggle('al-active', showIranBases);
  drawMap();
}
function toggleFleet() {
  showFleet = !showFleet;
  document.getElementById('togFleet').classList.toggle('al-active', showFleet);
  drawMap();
}

// ===== COUNTRY FILTER =====
function selectCo(co) {
  const canon = canonCo(co);
  const fi = countryFaction[co] || countryFaction[canon];
  if (fi && selFactions.has(fi.faction)) {
    // Break out of faction mode — remove faction, select just this country
    selFactions.delete(fi.faction);
    Object.keys(countryFaction).forEach(c => {
      if (countryFaction[c].faction === fi.faction) selCo.delete(c);
    });
    selCo.add(co);
  } else {
    if (selCo.has(co)) selCo.delete(co);
    else selCo.add(co);
  }
  _afterFilterChange();
}

function clearCo() {
  selCo.clear();
  selFactions.clear();
  closePopup();
  _afterFilterChange();
}

function _afterFilterChange() {
  closePopup();
  _updateFilterBadges();
  buildCal(); refresh(); drawMap(); updateTrend(); buildGantt(); renderParties(); renderCountryDetail(); renderNews();
  if (peoplePopupOpen) renderPeopleGrid();
  _refreshCharts();
}

function _updateFilterBadges() {
  const badges = [];
  for (const f of selFactions) {
    const label = {coalition:'Coalition', axis:'Axis', neutral:'Neutral'}[f] || f;
    badges.push('<span class="fb fb-faction" data-f="' + f + '">' + label + ' <span data-action="tog-filter-faction" data-faction="' + f + '">&times;</span></span>');
  }
  for (const co of selCo) {
    // Skip countries already covered by a selected faction
    const fi = countryFaction[co] || countryFaction[canonCo(co)];
    if (fi && selFactions.has(fi.faction)) continue;
    badges.push('<span class="fb">' + co + ' <span data-action="select-co" data-co="' + co + '">&times;</span></span>');
  }
  const html = badges.length ? badges.join('') : '';
  const el1 = document.getElementById('nBadge');
  const el2 = document.getElementById('sBadge');
  if (el1) el1.innerHTML = html;
  if (el2) el2.innerHTML = html;
}

function togHzFilter(type) {
  hzShow[type] = !hzShow[type];
  updateLegendUI();
  drawMap();
}

function updateLegendUI() {
  const map = {mine:'togMine', cleared:'togCleared', patrol:'togPatrol', houthi:'togHouthi', passage:'togPassage', lanes:'togLanes', corridors:'togCorridors', naval:'togNaval', chokepoints:'togChokepoints'};
  Object.entries(map).forEach(([k, id]) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('al-active', hzShow[k]);
  });
}
