// ===== MTS MAP LAYER =====
// Canvas map rendering, projection math, draw functions, popups, zoom/pan

// ===== NO-FLY ZONES =====
// FIR boundaries derived from Natural Earth 110m country polygons (CP{}) with over-water
// extensions for Gulf, Caspian, and Mediterranean airspace. Adjacent FIRs share common
// boundary points to prevent gaps/overlaps. Land segments use exact CP{} coordinates;
// water segments approximate published median lines.
function getNFZones(d) {
  if (d < '2026-02-28') return [];
  const zones = [
    // Iran FIR (OIIX): Land borders from CP Iran + over-water extensions into Caspian Sea (north),
    // Persian Gulf median line (south/SW), and Gulf of Oman (SE). Shares border with Iraq FIR along
    // Iran-Iraq border, and Kuwait FIR at Shatt al-Arab/Basrah area.
    {name:'Iran FIR',level:'total',coords:[
      // NW corner: Turkey-Iran-Armenia tripoint, then along Iran-Azerbaijan/Armenia/Turkey borders
      [44.793,39.713],[44.952,39.336],[45.458,38.874],[46.144,38.741],[46.506,38.771],
      // Azerbaijan border to Caspian coast
      [47.685,39.508],[48.060,39.582],[48.356,39.289],[48.010,38.794],[48.634,38.270],
      [48.883,38.320],[49.200,37.583],[50.148,37.375],[50.842,36.873],
      // Caspian Sea — over-water extension along Iran's northern coast (FIR extends to ~midline ~40°N)
      [51.5,37.2],[52.264,36.700],[53.826,36.965],[53.922,37.199],
      // Turkmenistan border (NE)
      [54.800,37.392],[55.512,37.964],[56.180,37.935],[56.619,38.121],[57.330,38.029],
      [58.436,37.523],[59.235,37.413],
      // Afghanistan border (east)
      [60.378,36.527],[61.123,36.492],[61.211,35.650],[60.803,34.404],[60.528,33.676],
      [60.964,33.529],[60.536,32.981],[60.864,32.183],[60.942,31.548],
      // Pakistan border (SE)
      [61.699,31.380],[61.781,30.736],[60.874,29.829],[61.369,29.303],[61.772,28.699],
      [62.728,28.260],[62.755,27.379],[63.234,27.217],[63.317,26.757],
      // SE coast — Makran coast & Gulf of Oman
      [61.874,26.240],[61.497,25.078],[59.616,25.381],[58.526,25.610],[57.397,25.740],
      // Gulf of Oman — FIR extends over water (median with Oman ~25.5°N)
      [56.971,26.967],[56.492,27.143],[55.724,26.965],
      // Persian Gulf — median line (between Iran coast and Arab states)
      [54.715,26.481],[53.493,26.812],[52.484,27.581],[51.521,27.866],
      // Gulf median continues west — FIR boundary between Iran and Qatar/Bahrain/Saudi waters
      [50.853,28.815],[50.115,30.148],
      // Shatt al-Arab / Iraq-Iran border at Gulf
      [49.577,29.986],[48.941,30.317],[48.568,29.927],[48.015,30.452],[48.005,30.985],
      // Iran-Iraq border (west, heading north)
      [47.685,30.985],[47.849,31.709],[47.335,32.469],[46.109,33.017],
      [45.417,33.968],[45.648,34.748],[46.152,35.093],[46.076,35.677],
      [45.421,35.978],
      // NW: Iran-Turkey border
      [44.773,37.170],[44.226,37.972],[44.421,38.281],[44.109,39.428],[44.793,39.713]
    ]},
    // Iraq FIR (ORBB): Land-locked except small Gulf coast at Basrah. Borders: Turkey (N),
    // Syria (NW, shared at ~41°E), Jordan (W point), Saudi Arabia (S), Kuwait (SE), Iran (E).
    // All boundary points taken from CP Iraq with shared points at adjacent FIR boundaries.
    {name:'Iraq FIR',level:'total',coords:[
      // SW: Jordan-Iraq-Saudi tripoint area, heading west along Jordan border
      [39.195,32.161],[38.792,33.379],
      // Syria-Iraq border (NW, heading NE along Turkey border) — shared with Syria FIR
      [41.006,34.419],[41.384,35.628],[41.290,36.359],[41.837,36.606],
      // Iraq-Turkey border (north)
      [42.350,37.230],[42.779,37.385],[43.942,37.256],[44.293,37.002],
      // Turkey-Iran-Iraq tripoint, then along Iraq-Iran border (east) — shared with Iran FIR
      [44.773,37.170],[45.421,35.978],[46.076,35.677],[46.152,35.093],
      [45.648,34.748],[45.417,33.968],[46.109,33.017],[47.335,32.469],
      [47.849,31.709],[47.685,30.985],[48.005,30.985],[48.015,30.452],[48.568,29.927],
      // Iraq-Kuwait border / Gulf coast — shared with Kuwait FIR
      [47.975,29.976],[47.302,30.059],[46.569,29.099],
      // Iraq-Saudi border (south)
      [44.709,29.179],[41.890,31.190],[40.400,31.890],
      // Back to Jordan tripoint
      [39.195,32.161]
    ]},
    // Syria FIR (OSTT): Land borders from CP Syria + Mediterranean over-water extension west.
    // Shares border with Iraq FIR (east) and Israel/Beirut FIR (south at Lebanon border).
    // Turkey border (north). Clean clockwise polygon.
    {name:'Syria FIR',level:'total',coords:[
      // Start NW Mediterranean (off coast), going clockwise
      // Mediterranean over-water extension
      [34.0,35.8],[34.0,34.0],
      // Southern boundary — Lebanon-Syria border (shared with Israel FIR)
      // From coast heading east along Lebanon-Syria border
      [35.905,35.410],[35.998,34.645],[36.448,34.594],[36.112,34.202],
      [36.066,33.825],[35.821,33.277],
      // Syria-Israel/Jordan border (south, Golan Heights)
      [35.836,32.868],[35.700,32.716],[35.720,32.709],[36.834,32.313],
      // Syria-Jordan-Iraq tripoint
      [38.792,33.379],
      // Syria-Iraq border (east) — shared with Iraq FIR
      [41.006,34.419],[41.384,35.628],
      // Syria-Turkey-Iraq tripoint
      [41.290,36.359],[41.837,36.606],[41.212,37.074],
      // Syria-Turkey border (north, heading west to coast)
      [40.673,37.091],[39.523,36.716],[38.700,36.713],[38.168,36.901],
      [37.067,36.623],[36.739,36.818],[36.685,36.260],[36.418,36.041],
      [36.150,35.822],
      // NW coast to Mediterranean
      [35.905,35.410],
      // Close via Mediterranean
      [34.0,35.8]
    ]},
    // Israel FIR (LLLL — Tel Aviv FIR): Covers Israel, Palestinian territories, Lebanon,
    // and Jordan airspace. Extends west into Mediterranean. South to Eilat/Aqaba.
    // Clean clockwise polygon — fixed from original self-intersecting version.
    {name:'Israel FIR',level:'total',coords:[
      // Start NW at Lebanon coast/Syria FIR boundary, going clockwise
      // Lebanon-Syria border (shared with Syria FIR) — northern boundary
      [35.821,33.277],[36.066,33.825],[36.112,34.202],[36.448,34.594],
      [35.998,34.645],
      // Mediterranean over-water — from Lebanon coast heading south
      [34.0,34.0],[32.5,33.0],[32.5,30.0],
      // Southern coast approaching Eilat
      [34.265,31.219],[34.922,29.501],[34.956,29.357],
      // Jordan border (east, heading north)
      [36.069,29.197],[36.501,29.505],[36.741,29.865],[37.504,30.004],
      [37.668,30.339],[37.999,30.509],[37.002,31.508],
      // Jordan-Syria-Iraq border area
      [39.005,32.010],[39.195,32.161],
      // Jordan-Iraq-Syria tripoint — heading west along Syria-Jordan border
      [38.792,33.379],
      // Syria-Jordan/Golan border back to Israel
      [36.834,32.313],[35.720,32.709],
      // Israel north to Lebanon
      [35.700,32.716],[35.836,32.868],[35.821,33.277]
    ]}
  ];
  if (d >= '2026-02-28') {
    zones.push({name:'N. Gulf ADIZ',level:'partial',coords:[[47,30.3],[48.5,30],[48.8,28.5],[48.4,28.6],[47.7,28.5],[47.5,29],[46.6,29.1],[47,30.3]]});
    zones.push({name:'Bahrain TMA',level:'total',coords:[[50.2,26.4],[50.8,26.4],[50.8,25.8],[50.2,25.8],[50.2,26.4]]});
  }
  if (d >= '2026-03-01') {
    // Kuwait FIR (OKAC): Kuwait country borders + Gulf extension
    zones.push({name:'Kuwait FIR',level:'total',coords:[
      [46.569,29.099],[47.302,30.059],[47.975,29.976],
      [48.183,29.534],[48.094,29.306],[48.416,28.552],
      [47.709,28.526],[47.460,29.003],[46.569,29.099]
    ]});
  }
  return zones;
}

// ===== BYPASS ROUTES =====
// Source: OPSGROUP "Middle East Airspace – Current Operational Picture" (12 Mar 2026)
// Two confirmed corridors for Europe-Asia traffic bypassing the closed Gulf corridor:
//   1. Southern: HECC/Egypt FIR → OEJD/Jeddah FIR → OOMM/Muscat FIR
//      Branch: UAE spur via LUDID restricted corridor (OOMM→OMAE for Dubai/Abu Dhabi ops)
//   2. Northern: Caucasus (Armenia/Azerbaijan UBBA FIR) → UTAV/Turkmenistan → OAKX/Kabul FIR → OPLR/Lahore
//      Branch A: Georgia alternate via BARAD/DISKA/ADEKI (avoids Armenia-Azerbaijan border)
//      Branch B: P500/G500 eastern Afghan corridor along Pakistan border (FAA-approved FL300+)
// Specific AZE boundary fixes: MATAL (to/from UDDF/Yerevan), MARAL/METKA/RODAR/LARGI (to/from UTAA/Turkmenbashi)
// Afghanistan: Class G, no ATC, TIBA procedures on 125.2 MHz, contingency routes only (e.g. L750)
function getBypassRoutes(d) {
  if (d < '2026-02-28') return [];
  const routes = [];
  // Southern Bypass: Egypt → Saudi Arabia → Oman (eastbound)
  // HECC/Cairo → Red Sea coast → OEJD/Jeddah → southern Saudi → OOMM/Muscat
  routes.push({name:'Southern Bypass (→East)',color:'#00e5ff',
    waypoints:[[25.5,35.5],[28,33],[31,31],[33,28.5],[35,26],[37,24.5],[39,23],[42,21.5],[45,20.5],[48,20],[51,20.5],[54,21],[56.5,23],[58.3,23.6]],
    branches:[
      // UAE spur: from Oman coast, north via LUDID into Emirates FIR (restricted corridor for UAE airport ops)
      {name:'UAE Spur (LUDID)',color:'rgba(0,229,255,0.5)',from:11,
        waypoints:[[54,21],[55,22.5],[55.3,24],[55.5,25.2]]},
      // Qatar spur: LAEEB arrival — limited approved flights only
      {name:'Qatar (LAEEB)',color:'rgba(0,229,255,0.4)',from:9,
        waypoints:[[48,20],[49,21.5],[50,22.5],[51.2,25.3]]},
      // Muscat staging spur: connecting to OOMS for repatriation/cargo staging
      {name:'Muscat Hub',color:'rgba(0,229,255,0.4)',from:13,
        waypoints:[[58.3,23.6],[58.5,22.5],[58.2,21.5]]},
      // Riyadh link: Saudi contingency routing via OEJD corridor
      {name:'Riyadh Link',color:'rgba(0,229,255,0.35)',from:6,
        waypoints:[[39,23],[41,23.5],[43,24],[44.5,24.2],[46.8,24.6]]}
    ]});
  // Southern Bypass westbound: Oman → Saudi → Egypt
  routes.push({name:'Southern Bypass (←West)',color:'rgba(0,229,255,0.6)',
    waypoints:[[58.3,23.6],[56,22],[53,20],[50,19.5],[47,19.5],[44,20],[41,21],[38,22.5],[35.5,25],[33.5,27.5],[31.5,30],[29,32],[26,34.5]],
    branches:[
      // UAE departure spur: from Emirates FIR via LUDID southward to rejoin main route in Oman
      {name:'UAE Spur (LUDID)',color:'rgba(0,229,255,0.4)',from:1,
        waypoints:[[55.5,25.2],[55.3,24],[55,22.5],[54.5,21],[53,20]]},
      // Qatar departure spur: DATRI departure — approved flights only
      {name:'Qatar (DATRI)',color:'rgba(0,229,255,0.35)',from:2,
        waypoints:[[51.2,25.3],[50.5,23],[49.5,21.5],[48.5,20],[47,19.5]]},
      // Muscat departure spur
      {name:'Muscat Hub',color:'rgba(0,229,255,0.35)',from:0,
        waypoints:[[58.2,21.5],[58.5,22.5],[58.3,23.6]]}
    ]});
  // Northern Bypass: Caucasus Corridor eastbound
  // Turkey → Georgia → UBBA/Azerbaijan (via MATAL/MARAL) → UTAV/Turkmenistan → OAKX/Kabul FIR (L750) → OPLR/Pakistan → India
  routes.push({name:'Caucasus Corridor (→East)',color:'#c084fc',
    waypoints:[[28.7,41.3],[32,41],[35,41.5],[38,41],[41,41.5],[43,41.7],[44.8,41.3],[46.5,41],[48.5,40.5],[50.5,39.8],[53,39],[56,38],[59,37],[62,36],[64.5,34.5],[66.5,32.5],[68,30],[69.5,27],[71,24],[72.8,19.1]],
    branches:[
      // Georgia alternate: via BARAD/DISKA/ADEKI (avoids Armenia-AZE border region)
      {name:'Georgia Alt.',color:'rgba(192,132,252,0.5)',from:4,
        waypoints:[[41,41.5],[42,42.5],[43.5,42.8],[45,42.2],[46.5,41]]},
      // Azerbaijan MATAL/ELSIV/PEMAN boundary crossing points (since Mar 12)
      {name:'AZE MATAL Fix',color:'rgba(192,132,252,0.4)',from:6,
        waypoints:[[44.8,41.3],[45.5,40.8],[46.0,40.2],[46.5,41]]},
      // L750 label: main Afghanistan corridor, Turkmenabat → Lahore (heavy traffic, Class G, TIBA)
      {name:'L750 (OAKX)',color:'rgba(192,132,252,0.5)',from:9,
        waypoints:[[50.5,39.8],[53,38.5],[56,37],[59,35.8],[62,34.5],[64.5,33],[67,31],[69,28.5]]},
      // P500/G500 eastern Afghan corridor: along Pakistan border, FAA-approved at FL300+
      {name:'P500/G500',color:'rgba(192,132,252,0.5)',from:13,
        waypoints:[[62,36],[64,35],[66,33.5],[68,31.5],[69.5,30],[70.5,28.5],[71.5,26],[72,24],[72.8,19.1]]}
    ]});
  // Northern Bypass westbound: India → Pakistan → Afghanistan → Caucasus
  routes.push({name:'Caucasus Corridor (←West)',color:'rgba(192,132,252,0.6)',
    waypoints:[[72.8,19.1],[71.5,23],[70,26.5],[68.5,29.5],[67,32],[65,34],[63,35.5],[60,36.8],[57,37.8],[54,38.8],[51,39.5],[49,40.2],[47,40.8],[45,41.2],[43.5,41.5],[41.5,41.2],[38.5,40.8],[35.5,41.2],[32.5,40.8],[29,41]],
    branches:[
      // P500/G500 eastern corridor westbound
      {name:'P500/G500',color:'rgba(192,132,252,0.4)',from:0,
        waypoints:[[72.8,19.1],[72,24],[71.5,26],[70.5,28.5],[69.5,30],[68,31.5],[66,33.5],[64,35],[63,35.5]]},
      // L750 westbound through Afghanistan
      {name:'L750 (OAKX)',color:'rgba(192,132,252,0.4)',from:3,
        waypoints:[[69,28.5],[67,31],[64.5,33],[62,34.5],[59,35.8],[56,37],[53,38.5],[51,39.5]]},
      // AZE boundary fixes westbound
      {name:'AZE MARAL Fix',color:'rgba(192,132,252,0.35)',from:11,
        waypoints:[[46.5,41],[46.0,40.2],[45.5,40.8],[44.8,41.3],[43.5,41.5]]},
      // Georgia alternate westbound
      {name:'Georgia Alt.',color:'rgba(192,132,252,0.4)',from:12,
        waypoints:[[46.5,41],[45,42.2],[43.5,42.8],[42,42.5],[41,41.5]]}
    ]});
  return routes;
}

// ===== GPS/RADAR JAMMING ZONES =====
// Documented interference areas — circles with center, radius (degrees), and severity
function getJammingZones(d) {
  if (d < '2026-02-28') return [];
  const zones = [];
  // Iranian GPS jamming — military-grade spoofing across western Iran & Gulf
  zones.push({name:'Iran Western Jamming',type:'gps',lat:33.5,lng:47.0,radius:3.5,
    severity:'heavy',desc:'GPS spoofing & jamming from Iranian EW sites'});
  zones.push({name:'Strait of Hormuz EW',type:'gps',lat:26.5,lng:56.0,radius:1.8,
    severity:'heavy',desc:'Dense GPS/ADS-B jamming at chokepoint'});
  // Eastern Mediterranean — Israeli/Syrian EW environment
  zones.push({name:'Eastern Med Jamming',type:'gps',lat:34.5,lng:35.5,radius:2.5,
    severity:'moderate',desc:'GPS interference — Israeli & Syrian EW overlap'});
  // Iraq-Syria corridor — multiple EW emitters
  zones.push({name:'Iraq-Syria Corridor',type:'radar',lat:35.5,lng:42.0,radius:2.5,
    severity:'moderate',desc:'Radar spoofing & GPS denial along border'});
  if (d >= '2026-03-02') {
    // Iran extends jamming into Gulf of Oman
    zones.push({name:'Gulf of Oman EW',type:'gps',lat:24.5,lng:58.5,radius:2.0,
      severity:'moderate',desc:'IRGCN electronic warfare — ship & aircraft GPS denied'});
    // Saudi/Jordan corridor — Houthi-origin jamming
    zones.push({name:'Riyadh-Amman Corridor',type:'gps',lat:29.0,lng:40.0,radius:2.8,
      severity:'light',desc:'Intermittent GPS spoofing — suspected Houthi origin'});
  }
  if (d >= '2026-03-07') {
    // Iran extends deep into Persian Gulf
    zones.push({name:'Central Gulf EW',type:'radar',lat:27.5,lng:51.5,radius:2.0,
      severity:'moderate',desc:'Iranian over-the-horizon radar interference'});
  }
  return zones;
}

// ===== MILITARY BASES (key coalition / regional) =====

// ===== FLEET POSITIONS (carrier strike groups & task forces) =====

// ===== NAVAL FACILITIES =====
// ===== WATER BODY LABELS (for airways map) =====

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

// ===== MAP =====
const mw = document.getElementById('mw');
const overlayCanvas = document.getElementById('mlOverlay');
const ctx2 = overlayCanvas.getContext('2d');
const tt = document.getElementById('tt');

const VB = {lnMin: 28, lnMax: 67, ltMin: 9, ltMax: 45};

// MapLibre instance — initialized by _initMapLibre() at bottom of this file
let mlMap = null;
let _initialMapZoom = 4.5; // updated once map loads

// Coordinate transforms — delegate to MapLibre's Web Mercator projection.
// In Mercator, X depends only on longitude and Y only on latitude,
// so these single-axis wrappers are mathematically correct.
function lx(lng) { return mlMap ? mlMap.project([lng, 0]).x : 0; }
function ly(lat) { return mlMap ? mlMap.project([0, lat]).y : 0; }

// ===== MAPLIBRE — SOURCE + FEATURE STATE MANAGEMENT =====

// Push conflict status (war/attack/peace) into MapLibre feature states when selDay changes
function _syncCountryColors() {
  if (!mlMap || !mlMap.getSource('countries')) return;
  if (_syncCountryColors._lastDay === selDay) return;
  _syncCountryColors._lastDay = selDay;
  CONFLICT_COUNTRY_NAMES.forEach(name => {
    mlMap.setFeatureState(
      { source: 'countries', id: name },
      { status: getCStatus(name, selDay) }
    );
  });
}

// Push selected-country state into MapLibre feature states
function _syncCountryFeatureStates() {
  if (!mlMap || !mlMap.getSource('countries')) return;
  CONFLICT_COUNTRY_NAMES.forEach(name => {
    mlMap.setFeatureState(
      { source: 'countries', id: name },
      { selected: hasFilter() && isCoSelected(name) }
    );
  });
}

// Build pattern ImageData for a faction stripe (used by MapLibre addImage)
function _createPatternImage(faction) {
  const sz = 10;
  const pc = document.createElement('canvas');
  pc.width = sz; pc.height = sz;
  const pctx = pc.getContext('2d');
  pctx.clearRect(0, 0, sz, sz);
  const color = FACTION_PATTERN_COLORS[faction] || 'rgba(255,255,255,0.2)';
  pctx.strokeStyle = color;
  pctx.lineWidth = faction === 'axis' ? 2 : 1.5;
  if (faction === 'axis') {
    pctx.beginPath();
    pctx.moveTo(0, 0); pctx.lineTo(sz, sz);
    pctx.moveTo(sz, 0); pctx.lineTo(0, sz);
    pctx.stroke();
  } else if (faction === 'coalition') {
    pctx.beginPath();
    pctx.moveTo(-2, sz); pctx.lineTo(sz, -2);
    pctx.moveTo(0, sz + 2); pctx.lineTo(sz + 2, 0);
    pctx.stroke();
  } else {
    pctx.setLineDash([3, 3]);
    pctx.beginPath();
    pctx.moveTo(0, sz / 2); pctx.lineTo(sz, sz / 2);
    pctx.stroke();
  }
  return { width: sz, height: sz, data: pctx.getImageData(0, 0, sz, sz).data };
}

// Initialize MapLibre map and add all country layers
function _initMapLibre() {
  mlMap = new maplibregl.Map({
    container: 'mc',
    style: {
      version: 8,
      sources: {},
      layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#0a1628' } }]
    },
    bounds: [[VB.lnMin, VB.ltMin], [VB.lnMax, VB.ltMax]],
    fitBoundsOptions: { padding: 20 },
    dragRotate: false,
    touchZoomRotate: false,
    scrollZoom: false,
    attributionControl: false
  });

  mlMap.on('load', () => {
    _initialMapZoom = mlMap.getZoom();

    // Single GeoJSON source — both conflict + ctx countries, split by mts_type filter per layer.
    // promoteId uses mts_name so setFeatureState(id) works with our display names directly.
    mlMap.addSource('countries', {
      type: 'geojson',
      data: 'src/countries.geojson',
      promoteId: 'mts_name'
    });

    // Context country fill (dim background countries — filtered by mts_type)
    mlMap.addLayer({ id: 'countries-ctx-fill', type: 'fill', source: 'countries',
      filter: ['==', ['get', 'mts_type'], 'ctx'],
      paint: {
        'fill-color': ['case', ['boolean', ['feature-state', 'hover'], false],
          'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']
      }
    });
    mlMap.addLayer({ id: 'countries-ctx-border', type: 'line', source: 'countries',
      filter: ['==', ['get', 'mts_type'], 'ctx'],
      paint: {
        'line-color': ['case', ['boolean', ['feature-state', 'hover'], false],
          'rgba(255,255,255,0.3)', '#1a2a40'],
        'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 1.2, 0.4]
      }
    });

    // Conflict country fill — color driven by feature-state status, selected/hover variant
    mlMap.addLayer({ id: 'countries-fill', type: 'fill', source: 'countries',
      filter: ['==', ['get', 'mts_type'], 'conflict'],
      paint: {
        'fill-color': ['case',
          ['boolean', ['feature-state', 'selected'], false],
            ['match', ['feature-state', 'status'], 'war', 'rgba(255,45,123,0.35)', 'attack', 'rgba(255,225,0,0.28)', 'rgba(0,255,136,0.25)'],
          ['boolean', ['feature-state', 'hover'], false],
            ['match', ['feature-state', 'status'], 'war', 'rgba(255,45,123,0.28)', 'attack', 'rgba(255,225,0,0.22)', 'rgba(0,255,136,0.20)'],
            ['match', ['feature-state', 'status'], 'war', 'rgba(255,45,123,0.22)', 'attack', 'rgba(255,225,0,0.16)', 'rgba(0,255,136,0.14)']
        ]
      }
    });
    mlMap.addLayer({ id: 'countries-border', type: 'line', source: 'countries',
      filter: ['==', ['get', 'mts_type'], 'conflict'],
      paint: {
        'line-color': ['case',
          ['boolean', ['feature-state', 'selected'], false],
            ['match', ['feature-state', 'status'], 'war', '#ff2d7b', 'attack', '#ffe100', '#00ff88'],
          ['boolean', ['feature-state', 'hover'], false],
            ['match', ['feature-state', 'status'], 'war', '#ff2d7b', 'attack', '#ffe100', '#00ff88'],
          '#1a2a40'
        ],
        'line-width': ['case',
          ['boolean', ['feature-state', 'selected'], false], 2.5,
          ['boolean', ['feature-state', 'hover'], false], 1.8,
          0.8
        ]
      }
    });

    // Faction stripe patterns — registered as MapLibre images, rendered via fill-pattern layer
    ['coalition', 'axis', 'neutral'].forEach(f => {
      mlMap.addImage('pattern-' + f, _createPatternImage(f), { pixelRatio: 2 });
    });
    mlMap.addLayer({ id: 'factions-pattern', type: 'fill', source: 'countries',
      filter: ['==', ['get', 'mts_type'], 'conflict'],
      layout: { visibility: 'none' },
      paint: {
        'fill-pattern': ['match', ['get', 'faction'],
          'coalition', 'pattern-coalition',
          'axis',       'pattern-axis',
          /* neutral + fallback */ 'pattern-neutral'
        ]
      }
    });

    // Redraw overlay canvas on every MapLibre render (zoom, pan, resize)
    mlMap.on('render', drawMap);
    mlMap.on('zoom', updateAirwaysZoomUI);

    // Push initial status values into feature states
    _syncCountryColors();
    _syncCountryFeatureStates();

    _setupMapEvents();
    drawMap();
    drawLegendSwatches();
  });
}

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

// Sea layer rendering — extracted from drawMap for decomposition
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

// Air layer rendering — extracted from drawMap for decomposition
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

function drawMap() {
  if (!mlMap) return;
  _syncCountryColors();
  _syncCountryFeatureStates();

  // Resize overlay canvas to match container (MapLibre handles its own canvas)
  const dpr = window.devicePixelRatio || 1;
  const w = mw.clientWidth, h = mw.clientHeight;
  overlayCanvas.width = w * dpr;
  overlayCanvas.height = h * dpr;
  overlayCanvas.style.width = w + 'px';
  overlayCanvas.style.height = h + 'px';
  ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx2.clearRect(0, 0, w, h);

  // Sub-linear zoom scale for text/icons — mirrors the original aZoom^0.4 feel
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
    badges.push('<span class="fb fb-faction" data-f="' + f + '">' + label + ' <span onclick="event.stopPropagation();togFilterFaction(\'' + f + '\')">&times;</span></span>');
  }
  for (const co of selCo) {
    // Skip countries already covered by a selected faction
    const fi = countryFaction[co] || countryFaction[canonCo(co)];
    if (fi && selFactions.has(fi.faction)) continue;
    badges.push('<span class="fb">' + co + ' <span onclick="event.stopPropagation();selectCo(\'' + co.replace(/'/g, "\\'") + '\')">&times;</span></span>');
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

// ===== ZOOM CONTROLS (wired to MapLibre) =====
function aZoomIn() { if (mlMap) mlMap.zoomIn({ duration: 200 }); }
function aZoomOut() { if (mlMap) mlMap.zoomOut({ duration: 200 }); }
function aZoomResetFn() {
  if (mlMap) mlMap.fitBounds([[VB.lnMin, VB.ltMin], [VB.lnMax, VB.ltMax]], { padding: 20, duration: 300 });
}
function updateAirwaysZoomUI() {
  if (!mlMap) return;
  const zoom = mlMap.getZoom();
  const atInitial = zoom <= _initialMapZoom + 0.05;
  const resetBtn = document.getElementById('aZoomReset');
  if (resetBtn) resetBtn.style.opacity = atInitial ? '0.35' : '1';
  const pct = document.getElementById('aZoomPct');
  if (pct) pct.textContent = Math.round(Math.pow(2, zoom - _initialMapZoom) * 100) + '%';
}

// Bootstrap MapLibre — called once when map.js loads (map.on('load') fires async after main.js)
_initMapLibre();

// ===== LEGEND SWATCHES (canvas-drawn to match actual map markers) =====
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
      // --- AIRPORTS: small plane icon matching map ---
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
      // --- BASES: filled diamond ---
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
      // --- NFZ: hatched rectangle ---
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
      // --- ROUTES: dashed line with arrow ---
      case 'routes': {
        cx.strokeStyle = '#00e5ff'; cx.lineWidth = 2;
        cx.setLineDash([3, 2]); cx.beginPath(); cx.moveTo(1, mid); cx.lineTo(12, mid); cx.stroke(); cx.setLineDash([]);
        cx.fillStyle = '#00e5ff'; cx.beginPath(); cx.moveTo(14, mid); cx.lineTo(10, mid-3); cx.lineTo(10, mid+3); cx.closePath(); cx.fill();
        break;
      }
      // --- JAMMING: dashed circle with concentric rings ---
      case 'jamming': {
        cx.beginPath(); cx.arc(mid, mid, 6, 0, Math.PI*2);
        cx.fillStyle = 'rgba(255,200,0,0.15)'; cx.fill();
        cx.strokeStyle = 'rgba(255,200,0,0.4)'; cx.lineWidth = 0.8;
        cx.setLineDash([2, 2]); cx.stroke(); cx.setLineDash([]);
        cx.strokeStyle = 'rgba(255,200,0,0.15)'; cx.lineWidth = 0.5;
        cx.beginPath(); cx.arc(mid, mid, 3, 0, Math.PI*2); cx.stroke();
        break;
      }
      // --- FLEET: chevron ship shape ---
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
      // --- INFRASTRUCTURE: emoji-style marker ---
      case 'infra': {
        cx.beginPath(); cx.arc(mid, mid, 5, 0, Math.PI*2);
        cx.fillStyle = 'rgba(255,107,107,0.15)'; cx.fill();
        cx.font = '10px serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillText('\u{1F3E5}', mid, mid);
        break;
      }
      // --- REFUGEE: dashed arrow ---
      case 'refugee': {
        cx.strokeStyle = '#ff9500'; cx.lineWidth = 2; cx.globalAlpha = 0.6;
        cx.setLineDash([3, 2]); cx.beginPath(); cx.moveTo(2, mid+2); cx.lineTo(11, mid-2); cx.stroke(); cx.setLineDash([]);
        cx.globalAlpha = 0.8; cx.beginPath();
        cx.moveTo(14, mid-3); cx.lineTo(10, mid-6); cx.moveTo(14, mid-3); cx.lineTo(10, mid); cx.stroke();
        cx.globalAlpha = 1;
        break;
      }
      // --- FACTIONS: stripe pattern ---
      case 'factions': {
        cx.save();
        cx.beginPath(); cx.rect(2, 3, 12, 10); cx.clip();
        cx.strokeStyle = 'rgba(167,139,250,0.4)'; cx.lineWidth = 1.5;
        cx.beginPath();
        for (let dd = -16; dd < 32; dd += 5) { cx.moveTo(dd, 3); cx.lineTo(dd + 10, 13); }
        cx.stroke(); cx.restore();
        break;
      }
      // --- HOUTHI: 8-point starburst ---
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
      // --- MINES: circle with X crosshair ---
      case 'mine': {
        cx.fillStyle = '#ff2d7b'; cx.shadowColor = '#ff2d7b'; cx.shadowBlur = 3;
        cx.beginPath(); cx.arc(mid, mid, 3.5, 0, Math.PI*2); cx.fill(); cx.shadowBlur = 0;
        cx.strokeStyle = '#0d1117'; cx.lineWidth = 1;
        cx.beginPath(); cx.moveTo(mid-2, mid-2); cx.lineTo(mid+2, mid+2); cx.stroke();
        cx.beginPath(); cx.moveTo(mid+2, mid-2); cx.lineTo(mid-2, mid+2); cx.stroke();
        break;
      }
      // --- SHIPPING LANES: dashed amber line ---
      case 'lanes': {
        cx.strokeStyle = 'rgba(255,225,0,0.5)'; cx.lineWidth = 3;
        cx.setLineDash([3, 2]); cx.beginPath(); cx.moveTo(1, mid); cx.lineTo(15, mid); cx.stroke(); cx.setLineDash([]);
        break;
      }
      // --- SAFE CORRIDORS: dashed green line ---
      case 'corridors': {
        cx.strokeStyle = 'rgba(0,255,136,0.55)'; cx.lineWidth = 3;
        cx.setLineDash([3, 2]); cx.beginPath(); cx.moveTo(1, mid); cx.lineTo(15, mid); cx.stroke(); cx.setLineDash([]);
        break;
      }
      // --- PATROL: concentric radar rings ---
      case 'patrol': {
        cx.strokeStyle = '#00e5ff'; cx.lineWidth = 0.8;
        cx.shadowColor = '#00e5ff'; cx.shadowBlur = 3;
        cx.beginPath(); cx.arc(mid, mid, 5, 0, Math.PI*2); cx.stroke();
        cx.beginPath(); cx.arc(mid, mid, 2.5, 0, Math.PI*2); cx.stroke();
        cx.shadowBlur = 0;
        break;
      }
      // --- CLEARED: hollow green circle ---
      case 'cleared': {
        cx.strokeStyle = '#00ff88'; cx.lineWidth = 1.2;
        cx.beginPath(); cx.arc(mid, mid, 4, 0, Math.PI*2); cx.stroke();
        break;
      }
      // --- PASSAGES: dashed purple arrow ---
      case 'passages': {
        cx.strokeStyle = '#c084fc'; cx.lineWidth = 2;
        cx.shadowColor = '#c084fc'; cx.shadowBlur = 3;
        cx.setLineDash([3, 2]); cx.beginPath(); cx.moveTo(1, mid); cx.lineTo(11, mid); cx.stroke(); cx.setLineDash([]);
        cx.fillStyle = '#c084fc'; cx.beginPath(); cx.moveTo(14, mid); cx.lineTo(10, mid-3); cx.lineTo(10, mid+3); cx.closePath(); cx.fill();
        cx.shadowBlur = 0;
        break;
      }
      // --- NAVAL BASES: anchor icon ---
      case 'naval': {
        cx.font = '12px serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillStyle = 'rgba(0,229,255,0.6)';
        cx.fillText('\u2693', mid, mid);
        break;
      }
      // --- CHOKEPOINTS: amber dot with label line ---
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

