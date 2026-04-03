// ===== MAP DRAW-AIR =====
// drawAirLayers(): airports, NFZ, bypass routes, jamming, mil bases, fleet,
// naval facilities, civilian infra, refugee flows, faction overlays

// ===== NO-FLY ZONES =====
function getNFZones(d) {
  if (d < '2026-02-28') return [];
  const zones = [
    // Iran FIR (OIIX)
    {name:'Iran FIR',level:'total',coords:[
      [44.793,39.713],[44.952,39.336],[45.458,38.874],[46.144,38.741],[46.506,38.771],
      [47.685,39.508],[48.060,39.582],[48.356,39.289],[48.010,38.794],[48.634,38.270],
      [48.883,38.320],[49.200,37.583],[50.148,37.375],[50.842,36.873],
      [51.5,37.2],[52.264,36.700],[53.826,36.965],[53.922,37.199],
      [54.800,37.392],[55.512,37.964],[56.180,37.935],[56.619,38.121],[57.330,38.029],
      [58.436,37.523],[59.235,37.413],
      [60.378,36.527],[61.123,36.492],[61.211,35.650],[60.803,34.404],[60.528,33.676],
      [60.964,33.529],[60.536,32.981],[60.864,32.183],[60.942,31.548],
      [61.699,31.380],[61.781,30.736],[60.874,29.829],[61.369,29.303],[61.772,28.699],
      [62.728,28.260],[62.755,27.379],[63.234,27.217],[63.317,26.757],
      [61.874,26.240],[61.497,25.078],[59.616,25.381],[58.526,25.610],[57.397,25.740],
      [56.971,26.967],[56.492,27.143],[55.724,26.965],
      [54.715,26.481],[53.493,26.812],[52.484,27.581],[51.521,27.866],
      [50.853,28.815],[50.115,30.148],
      [49.577,29.986],[48.941,30.317],[48.568,29.927],[48.015,30.452],[48.005,30.985],
      [47.685,30.985],[47.849,31.709],[47.335,32.469],[46.109,33.017],
      [45.417,33.968],[45.648,34.748],[46.152,35.093],[46.076,35.677],
      [45.421,35.978],
      [44.773,37.170],[44.226,37.972],[44.421,38.281],[44.109,39.428],[44.793,39.713]
    ]},
    // Iraq FIR (ORBB)
    {name:'Iraq FIR',level:'total',coords:[
      [39.195,32.161],[38.792,33.379],
      [41.006,34.419],[41.384,35.628],[41.290,36.359],[41.837,36.606],
      [42.350,37.230],[42.779,37.385],[43.942,37.256],[44.293,37.002],
      [44.773,37.170],[45.421,35.978],[46.076,35.677],[46.152,35.093],
      [45.648,34.748],[45.417,33.968],[46.109,33.017],[47.335,32.469],
      [47.849,31.709],[47.685,30.985],[48.005,30.985],[48.015,30.452],[48.568,29.927],
      [47.975,29.976],[47.302,30.059],[46.569,29.099],
      [44.709,29.179],[41.890,31.190],[40.400,31.890],
      [39.195,32.161]
    ]},
    // Syria FIR (OSTT)
    {name:'Syria FIR',level:'total',coords:[
      [34.0,35.8],[34.0,34.0],
      [35.905,35.410],[35.998,34.645],[36.448,34.594],[36.112,34.202],
      [36.066,33.825],[35.821,33.277],
      [35.836,32.868],[35.700,32.716],[35.720,32.709],[36.834,32.313],
      [38.792,33.379],
      [41.006,34.419],[41.384,35.628],
      [41.290,36.359],[41.837,36.606],[41.212,37.074],
      [40.673,37.091],[39.523,36.716],[38.700,36.713],[38.168,36.901],
      [37.067,36.623],[36.739,36.818],[36.685,36.260],[36.418,36.041],
      [36.150,35.822],
      [35.905,35.410],
      [34.0,35.8]
    ]},
    // Israel FIR (LLLL)
    {name:'Israel FIR',level:'total',coords:[
      [35.821,33.277],[36.066,33.825],[36.112,34.202],[36.448,34.594],
      [35.998,34.645],
      [34.0,34.0],[32.5,33.0],[32.5,30.0],
      [34.265,31.219],[34.922,29.501],[34.956,29.357],
      [36.069,29.197],[36.501,29.505],[36.741,29.865],[37.504,30.004],
      [37.668,30.339],[37.999,30.509],[37.002,31.508],
      [39.005,32.010],[39.195,32.161],
      [38.792,33.379],
      [36.834,32.313],[35.720,32.709],
      [35.700,32.716],[35.836,32.868],[35.821,33.277]
    ]}
  ];
  if (d >= '2026-02-28') {
    zones.push({name:'N. Gulf ADIZ',level:'partial',coords:[[47,30.3],[48.5,30],[48.8,28.5],[48.4,28.6],[47.7,28.5],[47.5,29],[46.6,29.1],[47,30.3]]});
    zones.push({name:'Bahrain TMA',level:'total',coords:[[50.2,26.4],[50.8,26.4],[50.8,25.8],[50.2,25.8],[50.2,26.4]]});
  }
  if (d >= '2026-03-01') {
    zones.push({name:'Kuwait FIR',level:'total',coords:[
      [46.569,29.099],[47.302,30.059],[47.975,29.976],
      [48.183,29.534],[48.094,29.306],[48.416,28.552],
      [47.709,28.526],[47.460,29.003],[46.569,29.099]
    ]});
  }
  return zones;
}

// ===== BYPASS ROUTES =====
function getBypassRoutes(d) {
  if (d < '2026-02-28') return [];
  const routes = [];
  routes.push({name:'Southern Bypass (→East)',color:'#00e5ff',
    waypoints:[[25.5,35.5],[28,33],[31,31],[33,28.5],[35,26],[37,24.5],[39,23],[42,21.5],[45,20.5],[48,20],[51,20.5],[54,21],[56.5,23],[58.3,23.6]],
    branches:[
      {name:'UAE Spur (LUDID)',color:'rgba(0,229,255,0.5)',from:11,
        waypoints:[[54,21],[55,22.5],[55.3,24],[55.5,25.2]]},
      {name:'Qatar (LAEEB)',color:'rgba(0,229,255,0.4)',from:9,
        waypoints:[[48,20],[49,21.5],[50,22.5],[51.2,25.3]]},
      {name:'Muscat Hub',color:'rgba(0,229,255,0.4)',from:13,
        waypoints:[[58.3,23.6],[58.5,22.5],[58.2,21.5]]},
      {name:'Riyadh Link',color:'rgba(0,229,255,0.35)',from:6,
        waypoints:[[39,23],[41,23.5],[43,24],[44.5,24.2],[46.8,24.6]]}
    ]});
  routes.push({name:'Southern Bypass (←West)',color:'rgba(0,229,255,0.6)',
    waypoints:[[58.3,23.6],[56,22],[53,20],[50,19.5],[47,19.5],[44,20],[41,21],[38,22.5],[35.5,25],[33.5,27.5],[31.5,30],[29,32],[26,34.5]],
    branches:[
      {name:'UAE Spur (LUDID)',color:'rgba(0,229,255,0.4)',from:1,
        waypoints:[[55.5,25.2],[55.3,24],[55,22.5],[54.5,21],[53,20]]},
      {name:'Qatar (DATRI)',color:'rgba(0,229,255,0.35)',from:2,
        waypoints:[[51.2,25.3],[50.5,23],[49.5,21.5],[48.5,20],[47,19.5]]},
      {name:'Muscat Hub',color:'rgba(0,229,255,0.35)',from:0,
        waypoints:[[58.2,21.5],[58.5,22.5],[58.3,23.6]]}
    ]});
  routes.push({name:'Caucasus Corridor (→East)',color:'#c084fc',
    waypoints:[[28.7,41.3],[32,41],[35,41.5],[38,41],[41,41.5],[43,41.7],[44.8,41.3],[46.5,41],[48.5,40.5],[50.5,39.8],[53,39],[56,38],[59,37],[62,36],[64.5,34.5],[66.5,32.5],[68,30],[69.5,27],[71,24],[72.8,19.1]],
    branches:[
      {name:'Georgia Alt.',color:'rgba(192,132,252,0.5)',from:4,
        waypoints:[[41,41.5],[42,42.5],[43.5,42.8],[45,42.2],[46.5,41]]},
      {name:'AZE MATAL Fix',color:'rgba(192,132,252,0.4)',from:6,
        waypoints:[[44.8,41.3],[45.5,40.8],[46.0,40.2],[46.5,41]]},
      {name:'L750 (OAKX)',color:'rgba(192,132,252,0.5)',from:9,
        waypoints:[[50.5,39.8],[53,38.5],[56,37],[59,35.8],[62,34.5],[64.5,33],[67,31],[69,28.5]]},
      {name:'P500/G500',color:'rgba(192,132,252,0.5)',from:13,
        waypoints:[[62,36],[64,35],[66,33.5],[68,31.5],[69.5,30],[70.5,28.5],[71.5,26],[72,24],[72.8,19.1]]}
    ]});
  routes.push({name:'Caucasus Corridor (←West)',color:'rgba(192,132,252,0.6)',
    waypoints:[[72.8,19.1],[71.5,23],[70,26.5],[68.5,29.5],[67,32],[65,34],[63,35.5],[60,36.8],[57,37.8],[54,38.8],[51,39.5],[49,40.2],[47,40.8],[45,41.2],[43.5,41.5],[41.5,41.2],[38.5,40.8],[35.5,41.2],[32.5,40.8],[29,41]],
    branches:[
      {name:'P500/G500',color:'rgba(192,132,252,0.4)',from:0,
        waypoints:[[72.8,19.1],[72,24],[71.5,26],[70.5,28.5],[69.5,30],[68,31.5],[66,33.5],[64,35],[63,35.5]]},
      {name:'L750 (OAKX)',color:'rgba(192,132,252,0.4)',from:3,
        waypoints:[[69,28.5],[67,31],[64.5,33],[62,34.5],[59,35.8],[56,37],[53,38.5],[51,39.5]]},
      {name:'AZE MARAL Fix',color:'rgba(192,132,252,0.35)',from:11,
        waypoints:[[46.5,41],[46.0,40.2],[45.5,40.8],[44.8,41.3],[43.5,41.5]]},
      {name:'Georgia Alt.',color:'rgba(192,132,252,0.4)',from:12,
        waypoints:[[46.5,41],[45,42.2],[43.5,42.8],[42,42.5],[41,41.5]]}
    ]});
  return routes;
}

// ===== GPS/RADAR JAMMING ZONES =====
function getJammingZones(d) {
  if (d < '2026-02-28') return [];
  const zones = [];
  zones.push({name:'Iran Western Jamming',type:'gps',lat:33.5,lng:47.0,radius:3.5,
    severity:'heavy',desc:'GPS spoofing & jamming from Iranian EW sites'});
  zones.push({name:'Strait of Hormuz EW',type:'gps',lat:26.5,lng:56.0,radius:1.8,
    severity:'heavy',desc:'Dense GPS/ADS-B jamming at chokepoint'});
  zones.push({name:'Eastern Med Jamming',type:'gps',lat:34.5,lng:35.5,radius:2.5,
    severity:'moderate',desc:'GPS interference — Israeli & Syrian EW overlap'});
  zones.push({name:'Iraq-Syria Corridor',type:'radar',lat:35.5,lng:42.0,radius:2.5,
    severity:'moderate',desc:'Radar spoofing & GPS denial along border'});
  if (d >= '2026-03-02') {
    zones.push({name:'Gulf of Oman EW',type:'gps',lat:24.5,lng:58.5,radius:2.0,
      severity:'moderate',desc:'IRGCN electronic warfare — ship & aircraft GPS denied'});
    zones.push({name:'Riyadh-Amman Corridor',type:'gps',lat:29.0,lng:40.0,radius:2.8,
      severity:'light',desc:'Intermittent GPS spoofing — suspected Houthi origin'});
  }
  if (d >= '2026-03-07') {
    zones.push({name:'Central Gulf EW',type:'radar',lat:27.5,lng:51.5,radius:2.0,
      severity:'moderate',desc:'Iranian over-the-horizon radar interference'});
  }
  return zones;
}

// Air layer rendering — called by drawMap() in index.js
function drawAirLayers(ctx, w, h, azs) {
  // NFZ overlay
  if (showNFZ) {
    const zones = getNFZones(selDay);
    zones.forEach(z => {
      const projected = z.coords.map(p => [lx(p[0], w), ly(p[1], h)]);
      ctx.save();
      ctx.beginPath();
      projected.forEach((p, i) => { i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]); });
      ctx.closePath(); ctx.clip();
      const spacing = z.level === 'total' ? 8 : 14;
      ctx.strokeStyle =
        (z.level === 'total' ? 'rgba(255,45,123,0.25)' : 'rgba(255,225,0,0.18)');
      ctx.lineWidth = z.level === 'total' ? 1.5 : 1;
      ctx.beginPath();
      for (let d = -w - h; d < w + h; d += spacing) { ctx.moveTo(d, 0); ctx.lineTo(d + h, h); }
      ctx.stroke(); ctx.restore();
      ctx.beginPath();
      projected.forEach((p, i) => { i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]); });
      ctx.closePath();
      ctx.strokeStyle =
        (z.level === 'total' ? 'rgba(255,45,123,0.5)' : 'rgba(255,225,0,0.4)');
      ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
      let zx = 0, zy = 0;
      projected.forEach(p => { zx += p[0]; zy += p[1]; });
      zx /= projected.length; zy /= projected.length;
      ctx.font = '600 ' + (7.5*azs) + 'px "DM Sans",sans-serif'; ctx.textAlign = 'center';
      ctx.fillStyle =
        (z.level === 'total' ? 'rgba(255,45,123,0.7)' : 'rgba(255,225,0,0.6)');
      ctx.fillText(z.name, zx, zy);
    });
  }

  // Bypass routes
  if (showRoutes) {
    const activeRoutes = getBypassRoutes(selDay);
    function drawRoutePath(c, pts, color, lineWidth, alpha) {
      if (pts.length < 2) return;
      c.beginPath();
      c.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) {
        if (i < pts.length - 1) {
          const cpx = (pts[i][0] + pts[i+1][0]) / 2, cpy = (pts[i][1] + pts[i+1][1]) / 2;
          c.quadraticCurveTo(pts[i][0], pts[i][1], cpx, cpy);
        } else { c.lineTo(pts[i][0], pts[i][1]); }
      }
      c.strokeStyle = color; c.lineWidth = lineWidth;
      c.setLineDash([8, 4]); c.globalAlpha = alpha; c.stroke();
      c.setLineDash([]); c.globalAlpha = 1;
      const last = pts[pts.length - 1], prev = pts[pts.length - 2];
      const angle = Math.atan2(last[1] - prev[1], last[0] - prev[0]);
      c.save(); c.translate(last[0], last[1]); c.rotate(angle);
      c.beginPath(); c.moveTo(0, 0); c.lineTo(-8, -4); c.lineTo(-8, 4); c.closePath();
      c.fillStyle = color; c.globalAlpha = alpha; c.fill();
      c.restore(); c.globalAlpha = 1;
    }
    activeRoutes.forEach(route => {
      if (route.waypoints.length < 2) return;
      const pts = route.waypoints.map(p => [lx(p[0], w), ly(p[1], h)]);
      drawRoutePath(ctx, pts, route.color, 2.5, 0.7);
      const mid = Math.floor(pts.length / 2);
      ctx.save(); ctx.translate(pts[mid][0], pts[mid][1] - 6*azs);
      ctx.font = '600 ' + (7*azs) + 'px "DM Sans",sans-serif'; ctx.textAlign = 'center';
      ctx.fillStyle = route.color; ctx.globalAlpha = 0.9; ctx.fillText(route.name, 0, 0);
      ctx.restore(); ctx.globalAlpha = 1;
      if (route.branches) {
        route.branches.forEach(br => {
          if (br.waypoints.length < 2) return;
          const bpts = br.waypoints.map(p => [lx(p[0], w), ly(p[1], h)]);
          drawRoutePath(ctx, bpts, br.color, 1.8, 0.55);
          const bmid = Math.floor(bpts.length / 2);
          ctx.save(); ctx.translate(bpts[bmid][0], bpts[bmid][1] - 5*azs);
          ctx.font = '500 ' + (6*azs) + 'px "DM Sans",sans-serif'; ctx.textAlign = 'center';
          ctx.fillStyle = br.color; ctx.globalAlpha = 0.75; ctx.fillText(br.name, 0, 0);
          ctx.restore(); ctx.globalAlpha = 1;
        });
      }
    });
  }

  // Jamming zones overlay
  if (showJamming) {
    const jzones = getJammingZones(selDay);
    jzones.forEach(jz => {
      const cx = lx(jz.lng, w), cy = ly(jz.lat, h);
      const rPx = Math.abs(lx(jz.lng + jz.radius) - lx(jz.lng));
      const baseColor = jz.severity === 'heavy' ? [255,140,0] :
                         jz.severity === 'moderate' ? [255,200,0] : [200,200,100];
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rPx);
      grad.addColorStop(0, 'rgba(' + baseColor.join(',') + ',0.18)');
      grad.addColorStop(0.6, 'rgba(' + baseColor.join(',') + ',0.08)');
      grad.addColorStop(1, 'rgba(' + baseColor.join(',') + ',0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(cx, cy, rPx, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(' + baseColor.join(',') + ',0.35)';
      ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(' + baseColor.join(',') + ',0.10)';
      ctx.lineWidth = 0.5;
      for (let r = rPx * 0.3; r < rPx; r += rPx * 0.25) {
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.font = '600 ' + (6.5*azs) + 'px "DM Sans",sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(' + baseColor.join(',') + ',0.6)';
      ctx.fillText(jz.type === 'radar' ? '\u26A1 ' + jz.name : '\u{1F4E1} ' + jz.name, cx, cy - rPx * 0.15);
      ctx.font = '500 ' + (5.5*azs) + 'px "DM Sans",sans-serif';
      ctx.fillStyle = 'rgba(' + baseColor.join(',') + ',0.4)';
      ctx.fillText(jz.severity.toUpperCase(), cx, cy + rPx * 0.1);
    });
  }

  // Military bases
  MIL_BASES.forEach(base => {
    const x = lx(base.lng, w), y = ly(base.lat, h);
    if (x < -10 || x > w + 10 || y < -10 || y > h + 10) return;
    const isUS = base.side.includes('US');
    const isIran = base.side === 'Iran';
    const isIsrael = base.side === 'Israel';
    if ((isIran && !showIranBases) || (!isIran && !showCoalitionBases)) return;
    if (!itemMatchesCo(base.side)) return;
    const color =
      (isIran ? 'rgba(255,45,123,0.55)' : isIsrael ? 'rgba(0,229,255,0.55)' : 'rgba(0,229,255,0.4)');
    const ds = 3.5 * azs;
    ctx.beginPath();
    ctx.moveTo(x, y - ds); ctx.lineTo(x + ds*0.71, y); ctx.lineTo(x, y + ds); ctx.lineTo(x - ds*0.71, y);
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = '#0d1117'; ctx.lineWidth = 0.6; ctx.stroke();
    ctx.font = '500 ' + (5*azs) + 'px "DM Sans",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = (isIran ? 'rgba(255,45,123,0.45)' : 'rgba(0,229,255,0.35)');
    ctx.fillText(base.name.replace(' AB','').replace(' Air Base',''), x, y - 6*azs);
  });

  // Fleet positions
  if (showFleet) {
    FLEET_POS.forEach(fp => {
      const x = lx(fp.lng, w), y = ly(fp.lat, h);
      if (x < -10 || x > w + 10 || y < -10 || y > h + 10) return;
      if (!itemMatchesCo(fp.side)) return;
      const isIran = fp.side === 'Iran';
      const color = isIran ? 'rgba(255,45,123,0.6)' : 'rgba(0,229,255,0.55)';
      const sz = fp.type === 'carrier' ? 6*azs : fp.type === 'amphib' ? 5.5*azs : 4.5*azs;
      ctx.beginPath();
      ctx.moveTo(x, y - sz); ctx.lineTo(x + sz*0.6, y + sz*0.4);
      ctx.lineTo(x + sz*0.3, y + sz); ctx.lineTo(x - sz*0.3, y + sz);
      ctx.lineTo(x - sz*0.6, y + sz*0.4); ctx.closePath();
      ctx.fillStyle = color; ctx.fill();
      ctx.strokeStyle = isIran ? 'rgba(255,45,123,0.8)' : 'rgba(0,229,255,0.8)';
      ctx.lineWidth = 0.8; ctx.stroke();
      if (fp.type === 'carrier') {
        ctx.beginPath(); ctx.arc(x, y, sz*1.6, 0, Math.PI*2);
        ctx.strokeStyle = isIran ? 'rgba(255,45,123,0.15)' : 'rgba(0,229,255,0.15)';
        ctx.lineWidth = 1.2; ctx.stroke();
      }
      ctx.font = '500 ' + (4.5*azs) + 'px "DM Sans",sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = isIran ? 'rgba(255,45,123,0.5)' : 'rgba(0,229,255,0.45)';
      const shortName = fp.name.replace(/\s*\(.*\)/, '');
      ctx.fillText(shortName, x, y - sz - 3*azs);
    });
  }

  // Naval facilities
  if (hzShow.naval) {
    NAVAL_FACILITIES.forEach(nf => {
      if (!itemMatchesCo(nf.side)) return;
      const x = lx(nf.lng, w), y = ly(nf.lat, h);
      if (x < -10 || x > w + 10 || y < -10 || y > h + 10) return;
      const isIran = nf.side === 'Iran';
      const color = isIran ? 'rgba(255,45,123,0.7)' : 'rgba(0,229,255,0.65)';
      const afs = 12 * azs;
      ctx.font = afs + 'px serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = color;
      ctx.shadowColor = isIran ? '#ff2d7b' : '#00e5ff'; ctx.shadowBlur = 4;
      ctx.fillText('\u2693', x, y);
      ctx.shadowBlur = 0;
      ctx.font = '500 ' + (4*azs) + 'px "DM Sans",sans-serif';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = isIran ? 'rgba(255,45,123,0.4)' : 'rgba(0,229,255,0.35)';
      ctx.fillText(nf.name.replace(' Naval Base','').replace(' (NAVCENT)',''), x, y - afs*0.55 - 2*azs);
    });
  }

  // Airport plane icons with IATA labels
  AP.forEach(a => {
    if (hasFilter() && !coPassesFilter(a.co)) return;
    const s = getStat(a.c, selDay);
    const x = lx(a.lng, w), y = ly(a.lat, h);
    if ((s === 'Open' && !showOpen) || (s === 'Restricted' && !showRestricted) || (s === 'Closed' && !showClosed)) return;
    const filtered = (selSt && s !== selSt);
    if (filtered) ctx.globalAlpha = 0.15;
    const color =
      (s === 'Closed' ? '#ff2d7b' : s === 'Restricted' ? '#ffe100' : '#00ff88');
    const fs = (s === 'Closed' ? 14 : s === 'Restricted' ? 12 : 10) * azs;
    if (s === 'Closed' && !filtered) {
      ctx.beginPath(); ctx.arc(x, y, fs*0.55, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,45,123,0.15)'; ctx.fill();
    }
    ctx.font = fs + 'px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.shadowColor = color; ctx.shadowBlur = 6;
    ctx.fillText('\u2708', x, y);
    ctx.shadowBlur = 0;
    ctx.font = '600 ' + (5.5*azs) + 'px "DM Sans",sans-serif';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillText(a.c, x, y + fs*0.55 + 8*azs);
    ctx.globalAlpha = 1;
  });

  // Infrastructure markers
  if (showInfra) {
    CIVILIAN_INFRA.forEach(inf => {
      if (hasFilter() && !coPassesFilter(inf.co)) return;
      const x = lx(inf.lng, w), y = ly(inf.lat, h);
      if (x < -20 || x > w + 20 || y < -20 || y > h + 20) return;
      const color = INFRA_COLORS[inf.type] || '#fff';
      const icon = INFRA_ICONS[inf.type] || '\u2022';
      ctx.save();
      ctx.beginPath(); ctx.arc(x, y, 8*azs, 0, Math.PI*2);
      ctx.fillStyle = color; ctx.globalAlpha = 0.15; ctx.fill();
      ctx.restore();
      ctx.font = (12*azs) + 'px serif';
      ctx.textAlign = 'center';
      ctx.fillText(icon, x, y + 4*azs);
      if (mlMap && mlMap.getZoom() > _initialMapZoom + 0.8) {
        ctx.font = '500 ' + (7*azs) + 'px "DM Sans",sans-serif';
        ctx.fillStyle = color; ctx.globalAlpha = 0.7;
        ctx.fillText(inf.name, x, y + 14*azs);
        ctx.globalAlpha = 1;
      }
    });
  }

  // Refugee flow arrows
  if (showRefugeeFlows && selDay >= '2026-02-28') {
    ctx.save();
    REFUGEE_FLOWS.forEach(flow => {
      if (hasFilter()) {
        const flowCos = flow.label.split(' \u2192 ').map(s => s.trim());
        if (!flowCos.some(c => coPassesFilter(c))) return;
      }
      const x1 = lx(flow.from.lng, w), y1 = ly(flow.from.lat, h);
      const x2 = lx(flow.to.lng, w), y2 = ly(flow.to.lat, h);
      if (x1 < -50 || x1 > w+50 || y1 < -50 || y1 > h+50) return;
      ctx.strokeStyle = flow.color; ctx.lineWidth = 2.5*azs; ctx.globalAlpha = 0.5;
      ctx.setLineDash([6*azs, 4*azs]);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      const angle = Math.atan2(y2-y1, x2-x1);
      const hl = 8*azs;
      ctx.setLineDash([]); ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - hl*Math.cos(angle-0.4), y2 - hl*Math.sin(angle-0.4));
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - hl*Math.cos(angle+0.4), y2 - hl*Math.sin(angle+0.4));
      ctx.stroke();
      if (mlMap && mlMap.getZoom() > _initialMapZoom + 0.5) {
        const mx = (x1+x2)/2, my = (y1+y2)/2;
        ctx.font = '500 ' + (7*azs) + 'px "DM Sans",sans-serif';
        ctx.fillStyle = flow.color; ctx.globalAlpha = 0.6;
        ctx.textAlign = 'center';
        ctx.fillText(flow.label, mx, my - 6*azs);
      }
    });
    ctx.restore();
  }
}
