// ===== MAP CORE =====
// MapLibre init, projection helpers, zoom/pan state + controls

// ===== MAP DOM REFERENCES =====
const mw = document.getElementById('mw');
const overlayCanvas = document.getElementById('mlOverlay');
const ctx2 = overlayCanvas.getContext('2d');
const tt = document.getElementById('tt');

// ===== VIEW BOUNDS =====
const VB = {lnMin: 28, lnMax: 67, ltMin: 9, ltMax: 45};

// ===== MAPLIBRE INSTANCE =====
let mlMap = null;
let _initialMapZoom = 4.5;

// ===== PROJECTION HELPERS =====
// Coordinate transforms — delegate to MapLibre's Web Mercator projection.
// In Mercator, X depends only on longitude and Y only on latitude.
function lx(lng) { return mlMap ? mlMap.project([lng, 0]).x : 0; }
function ly(lat) { return mlMap ? mlMap.project([0, lat]).y : 0; }

// ===== MAPLIBRE SOURCE + FEATURE STATE =====

// Push conflict status into MapLibre feature states when selDay changes
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

// ===== MAPLIBRE INIT =====
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

// ===== ZOOM CONTROLS =====
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

// ===== WATER BODY LABELS =====
const MAP_WATER_LABELS = [
  {name:'Persian Gulf', lng:51.5, lat:27.0, rotate:-0.15, size:9},
  {name:'Arabian Sea', lng:62.0, lat:18.0, rotate:0, size:10},
  {name:'Gulf of Oman', lng:58.0, lat:23.5, rotate:-0.1, size:8},
  {name:'Red Sea', lng:36.5, lat:21.5, rotate:-0.55, size:9},
  {name:'Gulf of Aden', lng:46.0, lat:12.0, rotate:-0.05, size:8},
  {name:'Mediterranean Sea', lng:30.5, lat:33.8, rotate:0, size:9},
  {name:'Caspian Sea', lng:51.0, lat:41.5, rotate:-0.2, size:8},
];

const HZ_WATER_LABELS = MAP_WATER_LABELS; // alias used in draw-sea.js
