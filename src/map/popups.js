// ===== MAP POPUPS =====
// showPopup(), showCountryPopup(), closePopup()

function showPopup(a, px, py) {
  closePopup();
  const popup = document.getElementById('airportPopup');
  document.getElementById('pT').textContent = a.n;
  const cs = getCStatus(a.co, selDay);
  document.getElementById('pS').textContent = a.c + ' \u2022 ' + a.co + ' ' + csLabel(cs);
  const dayIdx = days.indexOf(selDay);
  const hd = days.slice(Math.max(0, dayIdx - 6), dayIdx + 1);
  let html = '<div class="hr">';
  hd.forEach(d => {
    const s = getStat(a.c, d).toLowerCase();
    html += '<div class="hd"><div class="dot ' + s + '"></div>' + d.slice(5).replace('-', '/') + '</div>';
  });
  html += '</div>';
  document.getElementById('pH').innerHTML = html;
  const s = getStat(a.c, selDay);
  document.getElementById('pN').textContent =
    s === 'Closed' ? 'Total airspace closure. All scheduled services suspended.' :
    s === 'Restricted' ? 'Limited operations via approved corridors only.' :
    'Normal operations. Key transit hub for rerouted traffic.';
  popup.style.display = 'block';
  popup.style.left = Math.min(px, mw.clientWidth - 320) + 'px';
  popup.style.top = (py + 10) + 'px';
}

function closePopup() {
  document.getElementById('airportPopup').style.display = 'none';
  document.getElementById('countryPopup').style.display = 'none';
}

function showCountryPopup(co, px, py) {
  closePopup();
  const popup = document.getElementById('countryPopup');
  document.getElementById('cpT').textContent = co;
  const cs = getCStatus(co, selDay);
  document.getElementById('cpTags').innerHTML = buildPopupTags(co, cs);
  const postureEl = document.getElementById('cpPosture');
  postureEl.textContent = countryPosture[co] || '';
  postureEl.style.display = countryPosture[co] ? 'block' : 'none';
  let html = '';
  // Airport grid
  const coAPs = AP.filter(a => a.co === co);
  if (coAPs.length) {
    const dayIdx = days.indexOf(selDay);
    const hd = days.slice(Math.max(0, dayIdx - 6), dayIdx + 1);
    html = '<table class="co-grid"><thead><tr><th>Airport</th>';
    hd.forEach(d => { html += '<th>' + d.slice(5).replace('-', '/') + '</th>'; });
    html += '</tr></thead><tbody>';
    coAPs.forEach(a => {
      html += '<tr><td>' + a.n.split('(')[0].split(' ').slice(0,2).join(' ') + ' <span style="color:var(--text3)">(' + a.c + ')</span></td>';
      hd.forEach(d => {
        const s = getStat(a.c, d).toLowerCase();
        html += '<td><span class="gd ' + s + '" title="' + s + '"></span></td>';
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
  }
  // Naval posture + maritime events
  const mp = maritimePosture[co];
  if (mp) html += '<h4 style="font-size:.75rem;margin:6px 0 4px;color:var(--text2)">Naval Posture</h4><div class="hcp-evt">' + mp + '</div>';
  const coLower = co.toLowerCase();
  const relatedEvts = HZ_EVENTS.filter(ev => ev.d <= selDay && ev.desc.toLowerCase().includes(coLower)).slice(-5);
  if (relatedEvts.length) {
    html += '<h4 style="font-size:.75rem;margin:8px 0 4px;color:var(--text2)">Recent Maritime Events</h4>';
    relatedEvts.reverse().forEach(ev => {
      html += '<div class="hcp-evt">' + (EVT_ICONS[ev.type] || '') + ' <strong>' + ev.d + '</strong> ' + ev.desc + '</div>';
    });
  }
  document.getElementById('cpGrid').innerHTML = html;
  popup.style.display = 'block';
  const popW = popup.offsetWidth;
  const maxLeft = mw.clientWidth - popW - 4;
  popup.style.left = Math.max(0, Math.min(px, maxLeft)) + 'px';
  popup.style.top = Math.max(0, Math.min(py + 10, mw.clientHeight - popup.offsetHeight - 4)) + 'px';
}
