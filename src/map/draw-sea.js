// ===== MAP DRAW-SEA =====
// drawSeaLayers(): HZ lanes, safe corridors, Houthi zones, maritime locations,
// maritime events, passages

// Sea layer rendering — called by drawMap() in index.js
function drawSeaLayers(ctx, w, h, azs) {
    // Houthi threat zones
    if (selDay >= '2026-02-28' && hzShow.houthi) {
      HOUTHI_ZONES.forEach(zone => {
        const cx = lx(zone.lng, w), cy = ly(zone.lat, h);
        const rPx = Math.abs(lx(zone.lng + zone.radius) - lx(zone.lng));
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rPx);
        grad.addColorStop(0, 'rgba(255,107,0,0.18)');
        grad.addColorStop(1, 'rgba(255,107,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(cx, cy, rPx, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,107,0,0.35)'; ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
      });
    }

    // Shipping lanes
    if (hzShow.lanes) {
      const laneColor = 'rgba(255,225,0,0.22)';
      function drawLaneSea(pts, lw) {
        ctx.beginPath();
        pts.forEach((p, i) => { const x = lx(p[0], w), y = ly(p[1], h); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
        ctx.strokeStyle = laneColor; ctx.lineWidth = lw || 3;
        ctx.setLineDash([6, 5]); ctx.stroke(); ctx.setLineDash([]);
      }
      drawLaneSea(HZ_LANES.hormuz_inbound, 4*azs);
      drawLaneSea(HZ_LANES.hormuz_outbound, 4*azs);
      drawLaneSea(HZ_LANES.redsea, 3*azs);
      drawLaneSea(HZ_LANES.bab_to_aden, 3*azs);
      // Lane labels
      ctx.font = '600 ' + (7*azs) + 'px "DM Sans",sans-serif';
      ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,225,0,0.45)';
      const inMid = HZ_LANES.hormuz_inbound[4];
      ctx.fillText('\u2190 INBOUND', lx(inMid[0], w), ly(inMid[1], h) - 6*azs);
      const outMid = HZ_LANES.hormuz_outbound[4];
      ctx.fillText('OUTBOUND \u2192', lx(outMid[0], w), ly(outMid[1], h) + 11*azs);
    }

    // Safe corridors
    if (hzShow.corridors && selDay >= '2026-02-28') {
      SAFE_CORRIDORS.forEach(c => {
        ctx.beginPath();
        c.path.forEach((p, i) => { const x = lx(p[0], w), y = ly(p[1], h); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
        ctx.strokeStyle = 'rgba(0,255,136,0.45)'; ctx.lineWidth = 4;
        ctx.setLineDash([8, 4]); ctx.stroke(); ctx.setLineDash([]);
        const mid = c.path[Math.floor(c.path.length / 2)];
        ctx.font = '600 ' + (6*azs) + 'px "DM Sans",sans-serif';
        ctx.fillStyle = 'rgba(0,255,136,0.6)'; ctx.textAlign = 'center';
        ctx.fillText(c.name, lx(mid[0], w), ly(mid[1], h) - 6*azs);
      });
    }

    // Key maritime locations (chokepoints, islands)
    ctx.font = '500 ' + (6.5*azs) + 'px "DM Sans",sans-serif';
    HZ_LOCS.forEach(loc => {
      if (loc.type === 'port' || loc.type === 'city') return;
      if (loc.type === 'chokepoint' && !hzShow.chokepoints) return;
      const x = lx(loc.lng, w), y = ly(loc.lat, h);
      if (x < -20 || x > w + 20 || y < -20 || y > h + 20) return;
      if (loc.type === 'chokepoint') {
        const dotR = 3*azs;
        ctx.fillStyle = '#ffe100'; ctx.shadowColor = '#ffe100'; ctx.shadowBlur = 4*azs;
        ctx.beginPath(); ctx.arc(x, y, dotR, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255,225,0,0.5)'; ctx.lineWidth = 1*azs;
        ctx.beginPath(); ctx.moveTo(x, y - dotR); ctx.lineTo(x, y - 8*azs); ctx.stroke();
        ctx.fillStyle = 'rgba(255,225,0,0.7)'; ctx.font = '600 ' + (8*azs) + 'px "DM Sans",sans-serif';
        ctx.textAlign = 'center'; ctx.fillText('\u2302', x, y - 8*azs);
        ctx.font = '700 ' + (7*azs) + 'px "DM Sans",sans-serif';
        ctx.fillStyle = 'rgba(255,225,0,0.7)'; ctx.textAlign = 'center';
        ctx.fillText(loc.name, x, y - 14*azs);
        ctx.font = '500 ' + (6.5*azs) + 'px "DM Sans",sans-serif';
      } else if (loc.type === 'island') {
        ctx.fillStyle = 'rgba(200,200,200,0.35)'; ctx.textAlign = 'center';
        ctx.fillText(loc.name, x, y + 3*azs);
      } else if (loc.type === 'peninsula') {
        ctx.fillStyle = 'rgba(200,200,200,0.45)'; ctx.textAlign = 'center';
        ctx.font = '600 ' + (7*azs) + 'px "DM Sans",sans-serif';
        ctx.fillText(loc.name, x, y + 3*azs);
        ctx.font = '500 ' + (6.5*azs) + 'px "DM Sans",sans-serif';
      }
    });

    // Maritime events for selected day
    const seaData = getHormuzDayData(selDay);
    const allBefore = HZ_EVENTS.filter(e => e.d <= selDay);
    const todayEvts = seaData.evts;

    // Active mines
    const minePositions = [], clearPositions = [];
    allBefore.forEach(e => { if (e.type === 'mine') minePositions.push(e); if (e.type === 'cleared') clearPositions.push(e); });
    minePositions.forEach(m => {
      const x = lx(m.lng, w), y = ly(m.lat, h);
      const wasCleared = clearPositions.some(c => Math.abs(c.lat - m.lat) < 0.2 && Math.abs(c.lng - m.lng) < 0.2 && c.d > m.d);
      if (wasCleared) {
        if (!hzShow.cleared) return;
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = '#00ff88'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(x, y, 4*azs, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      } else {
        if (!hzShow.mine) return;
        ctx.fillStyle = '#ff2d7b';
        ctx.shadowColor = '#ff2d7b'; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(x, y, 3.5*azs, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#0d1117'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(x - 2*azs, y - 2*azs); ctx.lineTo(x + 2*azs, y + 2*azs); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 2*azs, y - 2*azs); ctx.lineTo(x - 2*azs, y + 2*azs); ctx.stroke();
        ctx.shadowBlur = 0;
      }
    });

    // Patrol positions (today only)
    if (hzShow.patrol) {
    todayEvts.filter(e => e.type === 'patrol').forEach(p => {
      const x = lx(p.lng, w), y = ly(p.lat, h);
      ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 1.2;
      ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 5;
      ctx.beginPath(); ctx.arc(x, y, 6*azs, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, 2.5*azs, 0, Math.PI * 2); ctx.stroke();
      ctx.shadowBlur = 0;
    });
    }

    // Passage indicators
    if (hzShow.passage) {
    todayEvts.filter(e => e.type === 'passage' && e.count > 0).forEach(p => {
      const x = lx(p.lng, w), y = ly(p.lat, h);
      const isRS = p.region === 'redsea';
      const purple = '#c084fc';
      const lineLen = 22 * azs;
      const angle = isRS ? -Math.PI / 2 : 0;
      const x1 = x - lineLen * Math.cos(angle), y1 = y - lineLen * Math.sin(angle);
      const x2 = x + lineLen * Math.cos(angle), y2 = y + lineLen * Math.sin(angle);
      ctx.strokeStyle = purple; ctx.lineWidth = 2.5 * azs;
      ctx.setLineDash([5 * azs, 4 * azs]);
      ctx.shadowColor = '#c084fc'; ctx.shadowBlur = 5;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.setLineDash([]);
      const arrowSize = 5 * azs;
      ctx.fillStyle = purple;
      ctx.beginPath();
      ctx.moveTo(x2 + arrowSize * Math.cos(angle), y2 + arrowSize * Math.sin(angle));
      ctx.lineTo(x2 + arrowSize * Math.cos(angle + 2.5), y2 + arrowSize * Math.sin(angle + 2.5));
      ctx.lineTo(x2 + arrowSize * Math.cos(angle - 2.5), y2 + arrowSize * Math.sin(angle - 2.5));
      ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = purple;
      ctx.font = '700 ' + (8 * azs) + 'px "DM Sans",sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(p.count + ' ships', x, y1 - 6 * azs);
    });
    }

    // Houthi strike indicators (today only)
    if (hzShow.houthi) {
    todayEvts.filter(e => e.type === 'houthi' && e.count > 0).forEach(p => {
      const x = lx(p.lng, w), y = ly(p.lat, h);
      ctx.fillStyle = '#ff6b00';
      ctx.shadowColor = '#ff6b00'; ctx.shadowBlur = 6;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? 5*azs : 2.5*azs;
        const px = x + r * Math.cos(a), py = y + r * Math.sin(a);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
      if (p.count > 1) {
        ctx.font = '700 ' + (7*azs) + 'px "DM Sans",sans-serif';
        ctx.fillStyle = 'rgba(255,107,0,0.8)'; ctx.textAlign = 'center';
        ctx.fillText('\u00d7' + p.count, x, y - 7*azs);
      }
    });
    }
}
