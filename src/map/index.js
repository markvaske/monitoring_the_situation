// ===== MAP INDEX =====
// drawMap() orchestrator, map click/hover/drag event handlers,
// exports initMap and drawMap as globals

// ===== MAPLIBRE HOVER / CLICK EVENTS =====
function _setupMapEvents() {
  let _hovCo = null;     // hovered conflict country name
  let _hovCtx = null;    // hovered context country name

  mlMap.on('mousemove', e => {
    const nav = document.getElementById('mapLegend');
    const azEl = document.getElementById('airZoom');
    if ((nav && nav.matches(':hover')) || (azEl && azEl.matches(':hover'))) {
      tt.style.display = 'none'; return;
    }
    const mx = e.point.x, my = e.point.y;

    // Custom hit-testing for overlay elements (airports, bases, fleet, etc.)
    let found = null;
    AP.forEach(a => {
      if (found) return;
      if (hasFilter() && !coPassesFilter(a.co)) return;
      const s = getStat(a.c, selDay);
      if ((s === 'Open' && !showOpen) || (s === 'Restricted' && !showRestricted) || (s === 'Closed' && !showClosed)) return;
      if (Math.hypot(mx - lx(a.lng), my - ly(a.lat)) < 12) found = {type: 'a', data: a};
    });
    if (!found) MIL_BASES.forEach(base => {
      if (found) return;
      const isIran = base.side === 'Iran';
      if ((isIran && !showIranBases) || (!isIran && !showCoalitionBases)) return;
      if (!itemMatchesCo(base.side)) return;
      if (Math.hypot(mx - lx(base.lng), my - ly(base.lat)) < 10) found = {type: 'b', data: base};
    });
    if (!found && showFleet) FLEET_POS.forEach(fp => {
      if (found) return;
      if (!itemMatchesCo(fp.side)) return;
      if (Math.hypot(mx - lx(fp.lng), my - ly(fp.lat)) < 12) found = {type: 'fleet', data: fp};
    });
    if (!found && hzShow.naval) NAVAL_FACILITIES.forEach(nf => {
      if (found) return;
      if (!itemMatchesCo(nf.side)) return;
      if (Math.hypot(mx - lx(nf.lng), my - ly(nf.lat)) < 10) found = {type: 'naval', data: nf};
    });
    if (!found && showJamming) getJammingZones(selDay).forEach(jz => {
      if (found) return;
      const rPx = Math.abs(lx(jz.lng + jz.radius) - lx(jz.lng));
      if (Math.hypot(mx - lx(jz.lng), my - ly(jz.lat)) < rPx) found = {type: 'j', data: jz};
    });
    if (!found) HZ_LOCS.forEach(loc => {
      if (found) return;
      if (Math.hypot(mx - lx(loc.lng), my - ly(loc.lat)) < 10) found = {type: 'loc', data: loc};
    });

    // Country hover via MapLibre feature query (if no overlay hit)
    const features = mlMap.queryRenderedFeatures(e.point, { layers: ['countries-fill', 'countries-ctx-fill'] });
    const feature = found ? null : features[0];
    const newName = feature ? feature.properties.mts_name : null;

    // Clear stale hover states
    if (_hovCo && _hovCo !== newName) {
      mlMap.setFeatureState({ source: 'countries', id: _hovCo }, { hover: false });
      _hovCo = null;
    }
    if (_hovCtx && _hovCtx !== newName) {
      mlMap.setFeatureState({ source: 'countries', id: _hovCtx }, { hover: false });
      _hovCtx = null;
    }

    // Apply new hover state
    if (feature) {
      if (feature.layer.id === 'countries-fill') {
        _hovCo = newName;
        mlMap.setFeatureState({ source: 'countries', id: newName }, { hover: true });
      } else {
        _hovCtx = newName;
        mlMap.setFeatureState({ source: 'countries', id: newName }, { hover: true });
      }
    }

    const newHover = feature ? newName : null;
    if (newHover !== hoveredCountry) { hoveredCountry = newHover; drawMap(); }

    // Tooltip + cursor
    const mapCanvas = mlMap.getCanvas();
    if (found || feature) {
      mapCanvas.style.cursor = 'pointer';
      tt.style.display = 'block';
      tt.style.left = (mx + 15) + 'px';
      tt.style.top = (my - 10) + 'px';
      if (found) {
        if (found.type === 'a') {
          const s = getStat(found.data.c, selDay);
          tt.textContent = found.data.n + ' (' + found.data.c + ') \u2022 ' + s;
        } else if (found.type === 'b') {
          tt.textContent = '\ud83d\udccd ' + found.data.name + ' \u2022 ' + found.data.side + ' \u2022 ' + found.data.desc;
        } else if (found.type === 'j') {
          tt.textContent = '\u26a1 ' + found.data.name + ' \u2022 ' + found.data.severity + ' \u2022 ' + found.data.desc;
        } else if (found.type === 'fleet') {
          tt.textContent = '\u26f5 ' + found.data.name + ' \u2022 ' + found.data.side + ' \u2022 ' + found.data.desc;
        } else if (found.type === 'naval') {
          tt.textContent = '\u2693 ' + found.data.name + ' \u2022 ' + found.data.side + ' \u2022 ' + found.data.desc;
        } else if (found.type === 'loc') {
          tt.textContent = '\u2693 ' + found.data.name;
        }
      } else {
        tt.textContent = newName + ' \u2022 ' + csLabel(getCStatus(newName, selDay)) + ' \u2022 Click for details';
      }
    } else {
      mapCanvas.style.cursor = '';
      tt.style.display = 'none';
      if (hoveredCountry) { hoveredCountry = null; drawMap(); }
    }
  });

  mlMap.on('mouseleave', () => {
    tt.style.display = 'none';
    hoveredCountry = null;
    if (_hovCo) { mlMap.setFeatureState({ source: 'countries', id: _hovCo }, { hover: false }); _hovCo = null; }
    if (_hovCtx) { mlMap.setFeatureState({ source: 'countries', id: _hovCtx }, { hover: false }); _hovCtx = null; }
  });

  mlMap.on('click', e => {
    const popup = document.getElementById('airportPopup');
    if (popup && popup.contains(e.originalEvent.target)) return;
    const cpopup = document.getElementById('countryPopup');
    if (cpopup && cpopup.contains(e.originalEvent.target)) return;
    const mx = e.point.x, my = e.point.y;
    // Airport click takes priority
    let clickedAP = null;
    AP.forEach(a => {
      if (clickedAP) return;
      if (Math.hypot(mx - lx(a.lng), my - ly(a.lat)) < 12) clickedAP = a;
    });
    if (clickedAP) { showPopup(clickedAP, mx, my); return; }
    // Country click
    const features = mlMap.queryRenderedFeatures(e.point, { layers: ['countries-fill'] });
    if (features.length > 0) {
      const co = features[0].properties.mts_name;
      selectCo(co);
      showCountryPopup(co, mx, my);
    } else {
      if (hasFilter()) clearCo(); else closePopup();
    }
  });
}

// ===== DRAW MAP (orchestrator) =====
function drawMap() {
  if (!mlMap) return;
  _syncCountryColors();
  _syncCountryFeatureStates();

  // Resize overlay canvas to match container
  const dpr = window.devicePixelRatio || 1;
  const w = mw.clientWidth, h = mw.clientHeight;
  overlayCanvas.width = w * dpr;
  overlayCanvas.height = h * dpr;
  overlayCanvas.style.width = w + 'px';
  overlayCanvas.style.height = h + 'px';
  ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx2.clearRect(0, 0, w, h);

  // Sub-linear zoom scale for text/icons
  const azs = Math.pow(Math.pow(2, Math.max(0, mlMap.getZoom() - _initialMapZoom)), 0.4);

  // Country labels (faction color + name at explicit visual centroids)
  const CONFLICT_LABEL_POS = {
    'Turkey':[34.5,39.5],'Syria':[38.5,35.2],'Iraq':[43.5,33.5],
    'Iran':[54.0,33.0],'Saudi Arabia':[44.5,24.0],'UAE':[54.2,24.0],
    'Oman':[57.0,21.5],'Qatar':[51.2,25.5],'Bahrain':[50.5,26.05],
    'Kuwait':[47.5,29.3],'Jordan':[36.5,31.2],'Israel':[35.0,31.5],
    'Lebanon':[35.5,34.0],'Egypt':[30.5,27.5],'Yemen':[47.5,15.5],
    'Pakistan':[67,29],'India':[76,23]
  };
  for (const co of CONFLICT_COUNTRY_NAMES) {
    const isSelected = hasFilter() && isCoSelected(co);
    const pos = CONFLICT_LABEL_POS[co];
    if (!pos) continue;
    const cx = lx(pos[0]), cy = ly(pos[1]);
    const lc = getFactionColor(co);
    const isHov = hoveredCountry === co;
    if (isHov || isSelected) {
      ctx2.font = (isSelected ? '700 ' + (10*azs) + 'px' : '600 ' + (9*azs) + 'px') + ' "DM Sans",sans-serif';
      ctx2.textAlign = 'center'; ctx2.fillStyle = lc;
      ctx2.fillText(co, cx, cy + 5*azs);
    } else {
      ctx2.font = '500 ' + (8*azs) + 'px "DM Sans",sans-serif';
      ctx2.textAlign = 'center'; ctx2.globalAlpha = 0.25;
      ctx2.fillStyle = lc;
      ctx2.fillText(co, cx, cy + 5*azs);
      ctx2.globalAlpha = 1;
    }
  }

  // Context country labels (dimmed)
  const CTX_LABEL_POS = {
    'Sudan':[30,16],'Eritrea':[39.5,15.5],'Djibouti':[42.8,11.5],'Ethiopia':[40,9],
    'Somalia':[46,6],'Afghanistan':[66,34],
    'Turkmenistan':[59,40],'Armenia':[44.5,40.2],'Georgia':[44,42],
    'Azerbaijan':[49,40.5],'Russia':[50,44],'Cyprus':[33,35],'Libya':[23,27],
    'Greece':[23,39],'Nepal':[84,28.5],
    'Uzbekistan':[64,42],'Tajikistan':[71,39],'Kenya':[38,0],
    'Tanzania':[34,-5],'Chad':[19,15],'Niger':[10,17],
    'Sri Lanka':[80.5,8],'Myanmar':[96,20],
    'South Sudan':[30,7],'Uganda':[32,2],'Central African Republic':[21,6],
    'Kazakhstan':[55,47]
  };
  const ctxLabelColor = 'rgba(255,255,255,0.18)';
  const ctxLabelHover = 'rgba(255,255,255,0.45)';
  ctx2.textAlign = 'center';
  for (const [co, [lng, lat]] of Object.entries(CTX_LABEL_POS)) {
    const x = lx(lng), y = ly(lat);
    if (x < -20 || x > w + 20 || y < -20 || y > h + 20) continue;
    const isHov = hoveredCountry === co;
    ctx2.font = (isHov ? '600 ' : '500 ') + (7.5*azs) + 'px "DM Sans",sans-serif';
    ctx2.fillStyle = isHov ? ctxLabelHover : ctxLabelColor;
    ctx2.fillText(co.toUpperCase(), x, y);
  }

  // Water body labels
  MAP_WATER_LABELS.forEach(wb => {
    const x = lx(wb.lng), y = ly(wb.lat);
    if (x < -50 || x > w + 50 || y < -50 || y > h + 50) return;
    ctx2.save();
    ctx2.translate(x, y);
    ctx2.rotate(wb.rotate);
    ctx2.font = '600 ' + (wb.size*azs) + 'px "DM Serif Display",serif';
    ctx2.fillStyle = 'rgba(255,255,255,0.07)';
    ctx2.textAlign = 'center';
    ctx2.fillText(wb.name, 0, 0);
    ctx2.restore();
  });

  // === SEA LAYERS (toggle-gated) ===
  drawSeaLayers(ctx2, w, h, azs);

  // === AIR LAYERS (toggle-gated) ===
  drawAirLayers(ctx2, w, h, azs);

  // Milestone emoji marker
  if (selMilestoneIdx != null) {
    const ms = MILESTONES[selMilestoneIdx];
    if (ms && ms.lat != null && ms.lng != null) {
      ctx2.save();
      ctx2.globalAlpha = 1;
      ctx2.shadowColor = 'transparent'; ctx2.shadowBlur = 0;
      ctx2.fillStyle = '#ffffff';
      const mx = lx(ms.lng), my = ly(ms.lat);
      const sz = Math.max(18, 22 * azs);
      ctx2.font = sz + 'px sans-serif';
      ctx2.textAlign = 'center'; ctx2.textBaseline = 'middle';
      ctx2.fillText(ms.icon, mx, my);
      ctx2.restore();
    }
  }
}

// ===== LEGEND SWATCHES =====
function drawLegendSwatches() {
  const dpr = window.devicePixelRatio || 1;
  const S = 16; // CSS pixel size of each swatch canvas

  function makeSwatch(el) {
    const type = el.dataset.swatch;
    if (!type) return;
    // Remove any existing swatch canvas
    const old = el.querySelector('canvas.ml-swatch');
    if (old) old.remove();
    const c = document.createElement('canvas');
    c.className = 'ml-swatch';
    c.width = S * dpr; c.height = S * dpr;
    c.style.width = S + 'px'; c.style.height = S + 'px';
    const cx = c.getContext('2d');
    cx.scale(dpr, dpr);
    const mid = S / 2;

    switch (type) {
      case 'airport-open': {
        cx.font = '11px serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillStyle = '#00ff88'; cx.shadowColor = '#00ff88'; cx.shadowBlur = 4;
        cx.fillText('\u2708', mid, mid); cx.shadowBlur = 0;
        break;
      }
      case 'airport-restricted': {
        cx.font = '11px serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillStyle = '#ffe100'; cx.shadowColor = '#ffe100'; cx.shadowBlur = 4;
        cx.fillText('\u2708', mid, mid); cx.shadowBlur = 0;
        break;
      }
      case 'airport-closed': {
        cx.beginPath(); cx.arc(mid, mid, 6, 0, Math.PI*2);
        cx.fillStyle = 'rgba(255,45,123,0.15)'; cx.fill();
        cx.font = '11px serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillStyle = '#ff2d7b'; cx.shadowColor = '#ff2d7b'; cx.shadowBlur = 4;
        cx.fillText('\u2708', mid, mid); cx.shadowBlur = 0;
        break;
      }
      case 'base-us': {
        const d = 4;
        cx.fillStyle = 'rgba(0,229,255,0.55)';
        cx.beginPath(); cx.moveTo(mid, mid-d); cx.lineTo(mid+d*0.71, mid); cx.lineTo(mid, mid+d); cx.lineTo(mid-d*0.71, mid); cx.closePath(); cx.fill();
        cx.strokeStyle = '#0d1117'; cx.lineWidth = 0.6; cx.stroke();
        break;
      }
      case 'base-ir': {
        const d = 4;
        cx.fillStyle = 'rgba(255,45,123,0.55)';
        cx.beginPath(); cx.moveTo(mid, mid-d); cx.lineTo(mid+d*0.71, mid); cx.lineTo(mid, mid+d); cx.lineTo(mid-d*0.71, mid); cx.closePath(); cx.fill();
        cx.strokeStyle = '#0d1117'; cx.lineWidth = 0.6; cx.stroke();
        break;
      }
      case 'nfz': {
        cx.save();
        cx.beginPath(); cx.rect(1, 3, 14, 10); cx.clip();
        cx.strokeStyle = 'rgba(255,45,123,0.3)'; cx.lineWidth = 1;
        cx.beginPath();
        for (let dd = -16; dd < 32; dd += 4) { cx.moveTo(dd, 3); cx.lineTo(dd + 10, 13); }
        cx.stroke(); cx.restore();
        cx.strokeStyle = 'rgba(255,45,123,0.5)'; cx.lineWidth = 0.8;
        cx.setLineDash([2, 2]); cx.strokeRect(1, 3, 14, 10); cx.setLineDash([]);
        break;
      }
      case 'routes': {
        cx.strokeStyle = '#00e5ff'; cx.lineWidth = 2;
        cx.setLineDash([3, 2]); cx.beginPath(); cx.moveTo(1, mid); cx.lineTo(12, mid); cx.stroke(); cx.setLineDash([]);
        cx.fillStyle = '#00e5ff'; cx.beginPath(); cx.moveTo(14, mid); cx.lineTo(10, mid-3); cx.lineTo(10, mid+3); cx.closePath(); cx.fill();
        break;
      }
      case 'jamming': {
        cx.beginPath(); cx.arc(mid, mid, 6, 0, Math.PI*2);
        cx.fillStyle = 'rgba(255,200,0,0.15)'; cx.fill();
        cx.strokeStyle = 'rgba(255,200,0,0.4)'; cx.lineWidth = 0.8;
        cx.setLineDash([2, 2]); cx.stroke(); cx.setLineDash([]);
        cx.strokeStyle = 'rgba(255,200,0,0.15)'; cx.lineWidth = 0.5;
        cx.beginPath(); cx.arc(mid, mid, 3, 0, Math.PI*2); cx.stroke();
        break;
      }
      case 'fleet': {
        const sz = 5;
        cx.fillStyle = 'rgba(0,229,255,0.6)';
        cx.beginPath();
        cx.moveTo(mid, mid-sz); cx.lineTo(mid+sz*0.6, mid+sz*0.4);
        cx.lineTo(mid+sz*0.3, mid+sz); cx.lineTo(mid-sz*0.3, mid+sz);
        cx.lineTo(mid-sz*0.6, mid+sz*0.4); cx.closePath(); cx.fill();
        cx.strokeStyle = 'rgba(0,229,255,0.8)'; cx.lineWidth = 0.7; cx.stroke();
        break;
      }
      case 'infra': {
        cx.beginPath(); cx.arc(mid, mid, 5, 0, Math.PI*2);
        cx.fillStyle = 'rgba(255,107,107,0.15)'; cx.fill();
        cx.font = '10px serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillText('\u{1F3E5}', mid, mid);
        break;
      }
      case 'refugee': {
        cx.strokeStyle = '#ff9500'; cx.lineWidth = 2; cx.globalAlpha = 0.6;
        cx.setLineDash([3, 2]); cx.beginPath(); cx.moveTo(2, mid+2); cx.lineTo(11, mid-2); cx.stroke(); cx.setLineDash([]);
        cx.globalAlpha = 0.8; cx.beginPath();
        cx.moveTo(14, mid-3); cx.lineTo(10, mid-6); cx.moveTo(14, mid-3); cx.lineTo(10, mid); cx.stroke();
        cx.globalAlpha = 1;
        break;
      }
      case 'factions': {
        cx.save();
        cx.beginPath(); cx.rect(2, 3, 12, 10); cx.clip();
        cx.strokeStyle = 'rgba(167,139,250,0.4)'; cx.lineWidth = 1.5;
        cx.beginPath();
        for (let dd = -16; dd < 32; dd += 5) { cx.moveTo(dd, 3); cx.lineTo(dd + 10, 13); }
        cx.stroke(); cx.restore();
        break;
      }
      case 'houthi': {
        cx.fillStyle = '#ff6b00'; cx.shadowColor = '#ff6b00'; cx.shadowBlur = 3;
        cx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
          const r = i % 2 === 0 ? 5 : 2.5;
          const px = mid + r * Math.cos(a), py = mid + r * Math.sin(a);
          i === 0 ? cx.moveTo(px, py) : cx.lineTo(px, py);
        }
        cx.closePath(); cx.fill(); cx.shadowBlur = 0;
        break;
      }
      case 'mine': {
        cx.fillStyle = '#ff2d7b'; cx.shadowColor = '#ff2d7b'; cx.shadowBlur = 3;
        cx.beginPath(); cx.arc(mid, mid, 3.5, 0, Math.PI*2); cx.fill(); cx.shadowBlur = 0;
        cx.strokeStyle = '#0d1117'; cx.lineWidth = 1;
        cx.beginPath(); cx.moveTo(mid-2, mid-2); cx.lineTo(mid+2, mid+2); cx.stroke();
        cx.beginPath(); cx.moveTo(mid+2, mid-2); cx.lineTo(mid-2, mid+2); cx.stroke();
        break;
      }
      case 'lanes': {
        cx.strokeStyle = 'rgba(255,225,0,0.5)'; cx.lineWidth = 3;
        cx.setLineDash([3, 2]); cx.beginPath(); cx.moveTo(1, mid); cx.lineTo(15, mid); cx.stroke(); cx.setLineDash([]);
        break;
      }
      case 'corridors': {
        cx.strokeStyle = 'rgba(0,255,136,0.55)'; cx.lineWidth = 3;
        cx.setLineDash([3, 2]); cx.beginPath(); cx.moveTo(1, mid); cx.lineTo(15, mid); cx.stroke(); cx.setLineDash([]);
        break;
      }
      case 'patrol': {
        cx.strokeStyle = '#00e5ff'; cx.lineWidth = 0.8;
        cx.shadowColor = '#00e5ff'; cx.shadowBlur = 3;
        cx.beginPath(); cx.arc(mid, mid, 5, 0, Math.PI*2); cx.stroke();
        cx.beginPath(); cx.arc(mid, mid, 2.5, 0, Math.PI*2); cx.stroke();
        cx.shadowBlur = 0;
        break;
      }
      case 'cleared': {
        cx.strokeStyle = '#00ff88'; cx.lineWidth = 1.2;
        cx.beginPath(); cx.arc(mid, mid, 4, 0, Math.PI*2); cx.stroke();
        break;
      }
      case 'passages': {
        cx.strokeStyle = '#c084fc'; cx.lineWidth = 2;
        cx.shadowColor = '#c084fc'; cx.shadowBlur = 3;
        cx.setLineDash([3, 2]); cx.beginPath(); cx.moveTo(1, mid); cx.lineTo(11, mid); cx.stroke(); cx.setLineDash([]);
        cx.fillStyle = '#c084fc'; cx.beginPath(); cx.moveTo(14, mid); cx.lineTo(10, mid-3); cx.lineTo(10, mid+3); cx.closePath(); cx.fill();
        cx.shadowBlur = 0;
        break;
      }
      case 'naval': {
        cx.font = '12px serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillStyle = 'rgba(0,229,255,0.6)';
        cx.fillText('\u2693', mid, mid);
        break;
      }
      case 'chokepoint': {
        cx.fillStyle = '#ffe100'; cx.shadowColor = '#ffe100'; cx.shadowBlur = 4;
        cx.beginPath(); cx.arc(mid, mid+2, 3, 0, Math.PI*2); cx.fill(); cx.shadowBlur = 0;
        cx.strokeStyle = 'rgba(255,225,0,0.4)'; cx.lineWidth = 1;
        cx.beginPath(); cx.moveTo(mid, mid-1); cx.lineTo(mid, mid-5); cx.stroke();
        cx.fillStyle = 'rgba(255,225,0,0.6)'; cx.font = '600 4px "DM Sans",sans-serif';
        cx.textAlign = 'center'; cx.fillText('\u2302', mid, mid-6);
        break;
      }
    }
    el.insertBefore(c, el.firstChild);
  }

  document.querySelectorAll('.al-toggle[data-swatch]').forEach(makeSwatch);
}

// ===== BOOTSTRAP =====
// Bootstrap MapLibre — called once when core.js loads (map.on('load') fires async after main.js)
window.initMap = _initMapLibre;
window.drawMap = drawMap;
_initMapLibre();
