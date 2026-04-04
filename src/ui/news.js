// ===== MTS NEWS =====
// News filter toggles and daily summary tab switching

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

// ===== DAILY SUMMARY TABS =====
function switchDsTab(tab) {
  activeDsTab = tab;
  document.querySelectorAll('.ds-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.ds-pane').forEach(p => p.classList.remove('active'));
  document.querySelector('.ds-tab[onclick*="' + tab + '"]').classList.add('active');
  const paneMap = {conflict:'dsConflict', logistics:'dsLogistics', diplomacy:'dsDiplomacy', markets:'dsMarkets', humanitarian:'dsHumanitarian'};
  document.getElementById(paneMap[tab]).classList.add('active');
}
