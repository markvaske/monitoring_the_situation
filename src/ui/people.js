// ===== MTS KEY PEOPLE =====
// People popup widget

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
