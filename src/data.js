// ===== MTS DATA LAYER =====
// Extracted from index.html — all pure data structures

// ===== AIRPORTS =====
const AP=[
{c:'IKA',n:'Tehran Imam Khomeini',co:'Iran',lat:35.416,lng:51.152},
{c:'IFN',n:'Isfahan Shahid Beheshti',co:'Iran',lat:32.750,lng:51.861},
{c:'SYZ',n:'Shiraz Shahid Dastgheib',co:'Iran',lat:29.539,lng:52.590},
{c:'MHD',n:'Mashhad Shahid Hashemi',co:'Iran',lat:36.236,lng:59.641},
{c:'BGW',n:'Baghdad International',co:'Iraq',lat:33.262,lng:44.236},
{c:'EBL',n:'Erbil International',co:'Iraq',lat:36.238,lng:43.963},
{c:'BSR',n:'Basra International',co:'Iraq',lat:30.549,lng:47.662},
{c:'TLV',n:'Ben Gurion (Tel Aviv)',co:'Israel',lat:32.011,lng:34.887},
{c:'ETM',n:'Ramon Airport',co:'Israel',lat:29.727,lng:35.012},
{c:'DXB',n:'Dubai International',co:'UAE',lat:25.253,lng:55.366},
{c:'AUH',n:'Abu Dhabi International',co:'UAE',lat:24.433,lng:54.651},
{c:'DWC',n:'Al Maktoum International',co:'UAE',lat:24.896,lng:55.172},
{c:'DOH',n:'Hamad International',co:'Qatar',lat:25.261,lng:51.565},
{c:'DMM',n:'King Fahd (Dammam)',co:'Saudi Arabia',lat:26.471,lng:49.798},
{c:'JED',n:'King Abdulaziz (Jeddah)',co:'Saudi Arabia',lat:21.670,lng:39.156},
{c:'RUH',n:'King Khalid (Riyadh)',co:'Saudi Arabia',lat:24.958,lng:46.699},
{c:'AMM',n:'Queen Alia (Amman)',co:'Jordan',lat:31.723,lng:35.993},
{c:'BEY',n:'Beirut-Rafic Hariri',co:'Lebanon',lat:33.821,lng:35.488},
{c:'BAH',n:'Bahrain International',co:'Bahrain',lat:26.270,lng:50.634},
{c:'KWI',n:'Kuwait International',co:'Kuwait',lat:29.227,lng:47.969},
{c:'MCT',n:'Muscat International',co:'Oman',lat:23.593,lng:58.284},
{c:'SLL',n:'Salalah Airport',co:'Oman',lat:17.039,lng:54.091},
{c:'CAI',n:'Cairo International',co:'Egypt',lat:30.122,lng:31.406},
{c:'DAM',n:'Damascus International',co:'Syria',lat:33.411,lng:36.515},
{c:'IST',n:'Istanbul Airport',co:'Turkey',lat:41.262,lng:28.742},
{c:'ESB',n:'Ankara Esenbo\u011fa',co:'Turkey',lat:40.128,lng:32.995},
{c:'AYT',n:'Antalya Airport',co:'Turkey',lat:36.899,lng:30.801}
];

const countryFlags = {
  'Turkey':'\u{1F1F9}\u{1F1F7}','Syria':'\u{1F1F8}\u{1F1FE}','Iraq':'\u{1F1EE}\u{1F1F6}','Iran':'\u{1F1EE}\u{1F1F7}',
  'Saudi Arabia':'\u{1F1F8}\u{1F1E6}','Jordan':'\u{1F1EF}\u{1F1F4}','Lebanon':'\u{1F1F1}\u{1F1E7}','Israel':'\u{1F1EE}\u{1F1F1}',
  'Kuwait':'\u{1F1F0}\u{1F1FC}','Bahrain':'\u{1F1E7}\u{1F1ED}','Qatar':'\u{1F1F6}\u{1F1E6}','UAE':'\u{1F1E6}\u{1F1EA}',
  'Oman':'\u{1F1F4}\u{1F1F2}','Egypt':'\u{1F1EA}\u{1F1EC}','Yemen':'\u{1F1FE}\u{1F1EA}',
  'USA':'\u{1F1FA}\u{1F1F8}',
  'Azerbaijan':'\u{1F1E6}\u{1F1FF}','Russia':'\u{1F1F7}\u{1F1FA}',
  'France':'\u{1F1EB}\u{1F1F7}','UK':'\u{1F1EC}\u{1F1E7}',
  'Germany':'\u{1F1E9}\u{1F1EA}','Italy':'\u{1F1EE}\u{1F1F9}','Japan':'\u{1F1EF}\u{1F1F5}',
  'Kazakhstan':'\u{1F1F0}\u{1F1FF}',
  'India':'\u{1F1EE}\u{1F1F3}','Pakistan':'\u{1F1F5}\u{1F1F0}'
};

// Ordered list of conflict country display names — matches mts_name in countries.geojson
const CONFLICT_COUNTRY_NAMES = [
  'Turkey','Syria','Iraq','Iran','Saudi Arabia','UAE','Oman','Qatar',
  'Bahrain','Kuwait','Jordan','Israel','Lebanon','Egypt','Yemen','Pakistan','India'
];

const conflictPhases = [
  ['2026-02-28', {
    'Iran':'war','Israel':'war','Syria':'war',
    'Iraq':'attack',
    'UAE':'peace','Qatar':'peace','Saudi Arabia':'peace','Jordan':'peace',
    'Lebanon':'peace','Bahrain':'peace','Kuwait':'peace',
    'Oman':'peace','Egypt':'peace','Turkey':'peace','Yemen':'peace'
  }],
  ['2026-03-01', {
    'Iran':'war','Israel':'war','Syria':'war',
    'Iraq':'attack','UAE':'attack','Qatar':'attack','Saudi Arabia':'attack',
    'Jordan':'attack','Lebanon':'attack','Bahrain':'attack','Kuwait':'attack',
    'Oman':'peace','Egypt':'peace','Turkey':'peace','Yemen':'peace'
  }],
  ['2026-03-15', {
    'Oman':'attack'
  }],
  ['2026-03-27', {
    'Yemen':'attack'
  }]
];

function getCStatus(co, d) {
  if (d < conflictPhases[0][0]) return 'peace';
  let status = 'peace';
  for (const [pd, map] of conflictPhases) {
    if (d >= pd && map[co] !== undefined) status = map[co];
  }
  return status;
}
function csLabel(cs) { return cs === 'war' ? 'At War' : cs === 'attack' ? 'Under Attack' : 'At Peace'; }
function buildPopupTags(co, cs) {
  const fi = countryFaction[co];
  let html = '';
  if (fi) {
    const fLabel = fi.faction === 'coalition' ? 'Coalition' : fi.faction === 'axis' ? 'Iranian Axis' : 'Non-aligned';
    html += '<span class="cp-faction cp-faction-' + fi.faction + '">' + fLabel + '</span>';
  }
  html += '<span class="cp-status cp-status-' + cs + '">' + csLabel(cs) + '</span>';
  if (fi) html += '<span class="cp-role">' + fi.role + '</span>';
  return html;
}

// ===== UNIFIED COLOR PALETTE =====
// Faction colors (all faction-related rendering should use these)
const FC = {
  coalition: '#00e5ff',  // cyan
  axis:      '#ff2d7b',  // pink
  neutral:   '#ffe100'   // amber
};
// Faction with alpha helpers
function fcAlpha(faction, a) {
  const c = FC[faction];
  if (c === '#00e5ff') return 'rgba(0,229,255,' + a + ')';
  if (c === '#ff2d7b') return 'rgba(255,45,123,' + a + ')';
  if (c === '#ffe100') return 'rgba(255,225,0,' + a + ')';
  return 'rgba(255,255,255,' + a + ')';
}
// Escalation spectrum (1-10): green → cyan → yellow → orange → pink
// Same 5-stop gradient used by escalation bar, sparkline, and trend system
const ESC_SPECTRUM = ['#00ff88','#00ff88','#00e5ff','#00e5ff','#ffe100','#ffe100','#ff9500','#ff9500','#ff2d7b','#ff2d7b'];
function getEscColor(level) {
  const i = Math.max(0, Math.min(9, Math.round(level) - 1));
  return ESC_SPECTRUM[i];
}
// Trend score → spectrum color (maps -1..+1 to pink..green via same 5-stop)
function getTrendColor(score) {
  if (score > 0.3) return '#00ff88';
  if (score > 0.1) return '#00e5ff';
  if (score > -0.1) return '#ffe100';
  if (score > -0.3) return '#ff9500';
  return '#ff2d7b';
}

// Faction alignment → label color
// Derives from countryFaction{} — no separate sets needed
function getFactionColor(co) {
  const fi = countryFaction[co];
  if (!fi) return '#aaa'; // periphery (Djibouti, Eritrea, etc.)
  return FC[fi.faction] || '#ffe100';
}
// Shared conflict fill-color maps (used by both airways and maritime maps)
const CONFLICT_FILLS = {
  war: 'rgba(255,45,123,0.22)', attack: 'rgba(255,225,0,0.16)', peace: 'rgba(0,255,136,0.14)'
};
const CONFLICT_FILLS_BOLD = {
  war: 'rgba(255,45,123,0.35)', attack: 'rgba(255,225,0,0.28)', peace: 'rgba(0,255,136,0.25)'
};
const CONFLICT_FILLS_HOVER = {
  war: 'rgba(255,45,123,0.28)', attack: 'rgba(255,225,0,0.22)', peace: 'rgba(0,255,136,0.20)'
};

// Shared event type icons (used in showCountryPopup)
const EVT_ICONS = {mine:'\u{1F4A3}',cleared:'\u2705',passage:'\u{1F6A2}',patrol:'\u{2693}',houthi:'\u{1F525}'};

// Conflict-status-matched border colors for hover/select highlights
function getStatusBorder(co) {
  const cs = getCStatus(co, selDay);
  return (cs === 'war' ? '#ff2d7b' : cs === 'attack' ? '#ffe100' : '#00ff88');
}

const countryFaction = {
  'Iran': {faction:'axis', role:'Primary'},
  'Israel': {faction:'coalition', role:'Lead'},
  'Syria': {faction:'axis', role:'Staging ground'},
  'Iraq': {faction:'axis', role:'Irregular (PMF)'},
  'UAE': {faction:'neutral', role:'Exposed'},
  'Qatar': {faction:'coalition', role:'Host nation'},
  'Saudi Arabia': {faction:'coalition', role:'Silent partner'},
  'Jordan': {faction:'coalition', role:'Host nation'},
  'Lebanon': {faction:'axis', role:'Proxy (Hezbollah)'},
  'Bahrain': {faction:'coalition', role:'Host nation'},
  'Kuwait': {faction:'neutral', role:'Locked down'},
  'Oman': {faction:'neutral', role:'Bypass corridor'},
  'Egypt': {faction:'neutral', role:'Mediator / Gatekeeper'},
  'Turkey': {faction:'neutral', role:'Mediator'},
  'Yemen': {faction:'axis', role:'Proxy (Houthis)'},
  'USA': {faction:'coalition', role:'Lead'},
  'UK': {faction:'coalition', role:'Naval support'},
  'France': {faction:'coalition', role:'Naval support'},
  'Azerbaijan': {faction:'neutral', role:'Affected / Transit'},
  'Russia': {faction:'neutral', role:'Iran supporter'},
  'Germany': {faction:'coalition', role:'Reluctant ally'},
  'Italy': {faction:'coalition', role:'Reluctant ally'},
  'Japan': {faction:'neutral', role:'Economic stakeholder'},
  'India': {faction:'neutral', role:'Independent transit'},
  'Pakistan': {faction:'neutral', role:'Mediator'}
};
let countryPosture = {};

// ===== AIRPORT STATUS =====
const pre = {};
const phases = [
  ['2026-02-28', {IKA:'Closed',IFN:'Closed',SYZ:'Closed',MHD:'Closed',BGW:'Closed',EBL:'Closed',BSR:'Closed',DAM:'Closed',ETM:'Restricted',TLV:'Restricted',DXB:'Closed',AUH:'Closed',DWC:'Closed',DOH:'Closed',DMM:'Restricted',AMM:'Restricted',BEY:'Restricted'}],
  ['2026-03-01', {KWI:'Closed',BAH:'Closed'}],
  ['2026-03-06', {DXB:'Restricted',AUH:'Restricted',DWC:'Restricted',DOH:'Restricted'}]
];

function getStat(code, d) {
  let s = pre[code] || 'Open';
  for (const [pd, changes] of phases) {
    if (d >= pd && changes[code] !== undefined) s = changes[code];
  }
  return s;
}

// ===== DATES =====
const days = [];
{
  const s = new Date(2026, 1, 25), e = new Date(2026, 3, 1);
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1))
    days.push(d.toISOString().slice(0, 10));
}
const daysSet = new Set(days);

// ===== NEWS =====
// cat: 'aviation'|'maritime'|'military'|'stocks'|'diplomatic'|'general'
const newsCats = {aviation:'Aviation',maritime:'Maritime',military:'Military',stocks:'Markets',diplomatic:'Diplomacy',humanitarian:'Humanitarian',general:'General'};
let news = [];

// ===== STRAIT OF HORMUZ DATA =====
// Coastline polygons (hand-derived from Natural Earth) + viewport-edge closure
// Viewport: HVB covers the Strait region. Each polygon closes along viewport edges to fill land.
// Islands (Qeshm, Hormuz) drawn as standalone closed polygons.
// Expanded viewport: Red Sea through Persian Gulf — full maritime theater
const HVB = {lnMin:32, lnMax:60, ltMin:11, ltMax:28};

// Maritime posture by country — shown on maritime map click
const maritimePosture = {
  'Iran': 'IRGCN deployed anti-ship missiles at Bandar Abbas. Naval mines laid in Strait of Hormuz shipping lanes. Fast-attack craft patrolling choke points.',
  'Saudi Arabia': 'Royal Saudi Naval Forces on heightened alert. Eastern Fleet guarding oil terminal approaches. Cooperating with coalition minesweeping operations.',
  'Yemen': 'Houthi forces launching anti-ship missiles and drone attacks on Red Sea commercial shipping. Southern ports on heightened alert.',
  'Oman': 'Maintaining neutral waterways. Muscat acting as safe harbor for diverted vessels. Allowing coalition escort operations through Omani waters.',
  'UAE': 'Ports of Fujairah and Jebel Ali operating under enhanced security. Abu Dhabi Ports Authority restricting tanker movements in contested waters.',
  'Qatar': 'LNG tanker operations disrupted. Ras Laffan port on restricted schedule. Coordinating with US 5th Fleet for escort of critical energy shipments.',
  'Bahrain': 'US 5th Fleet HQ. Naval Support Activity managing coalition escort ops. Shallow-water mine clearance operations underway near port approaches.',
  'Kuwait': 'Mina al-Ahmadi oil terminal on high alert. Naval patrols increased in northern Gulf waters.',
  'Egypt': 'Suez Canal operations maintained. Egyptian Navy increasing Red Sea patrols south of canal zone.',
  'Iraq': 'Umm Qasr port operations reduced. Iraqi Navy cooperating with coalition mine countermeasures in northern Gulf.',
  'Israel': 'Israeli Navy deploying Sa\'ar corvettes for Red Sea escort operations. Eilat port monitoring Houthi missile threats.',
  'Jordan': 'Port of Aqaba on heightened security. Coordinating with Egyptian Navy on Red Sea commercial protection.'
};

// Shipping lanes — Strait of Hormuz TSS + Red Sea / Bab el-Mandeb routes
const HZ_LANES = {
  // Strait of Hormuz TSS
  hormuz_inbound: [ // Westbound into the Gulf — southern lane near Oman/Musandam
    [59.0,25.55],[58.0,25.65],[57.3,25.95],[56.8,26.15],[56.5,26.20],[56.2,26.15],[55.8,26.15],[55.2,26.25],[54.5,26.35]
  ],
  hormuz_outbound: [ // Eastbound out of the Gulf — northern lane near Iran
    [54.5,26.55],[55.2,26.50],[55.8,26.45],[56.2,26.40],[56.5,26.45],[56.8,26.50],[57.3,26.25],[58.0,25.75],[59.0,25.45]
  ],
  // Red Sea main shipping route — Suez to Bab el-Mandeb
  redsea: [
    [32.56,29.90],[33.30,28.50],[33.90,27.40],[34.60,26.00],
    [35.30,24.80],[36.20,23.00],[37.50,20.50],[38.50,18.50],
    [39.80,16.00],[41.50,14.50],[42.70,13.50],[43.30,12.60]
  ],
  // Bab el-Mandeb to Gulf of Aden — eastbound
  bab_to_aden: [
    [43.30,12.60],[44.00,12.50],[45.50,12.30],[47.00,12.00],
    [49.00,12.50],[51.00,13.00]
  ]
};

// Safe corridors (coalition-escorted routes avoiding Houthi threat zones)
const SAFE_CORRIDORS = [
  { name: 'Eastern Red Sea Corridor', desc: 'Saudi coast — coalition air cover',
    path: [[39.50,21.00],[39.80,19.50],[40.50,17.50],[41.20,15.50],[42.00,14.00],[42.80,13.00]] },
  { name: 'Hormuz Escort Lane', desc: 'USN-escorted tanker convoy route',
    path: [[59.0,25.50],[57.5,26.00],[56.5,26.20],[55.5,26.20],[54.5,26.40]] },
  { name: 'Gulf of Aden Corridor', desc: 'EUNAVFOR-patrolled transit zone',
    path: [[43.30,12.60],[45.00,12.00],[47.00,11.80],[49.50,12.00],[51.50,12.50]] }
];

// Houthi threat zones (approximate areas of anti-ship missile / drone attacks)
const HOUTHI_ZONES = [
  { name: 'Bab el-Mandeb Threat Zone', lat: 13.0, lng: 43.0, radius: 1.5 },
  { name: 'Southern Red Sea Threat Zone', lat: 15.0, lng: 42.0, radius: 2.0 },
  { name: 'Central Red Sea Threat Zone', lat: 18.0, lng: 40.0, radius: 1.8 }
];

// Key locations — expanded for full maritime theater
const HZ_LOCS = [
  // Strait of Hormuz
  {name:'Bandar Abbas',lat:27.18,lng:56.27,type:'port',side:'Iran'},
  {name:'Qeshm I.',lat:26.77,lng:55.92,type:'island',side:'Iran'},
  {name:'Larak I.',lat:26.87,lng:56.37,type:'island',side:'Iran'},
  {name:'Hormuz I.',lat:27.05,lng:56.47,type:'island',side:'Iran'},
  {name:'Musandam',lat:26.18,lng:56.25,type:'peninsula',side:'Oman'},
  {name:'Fujairah',lat:25.12,lng:56.33,type:'port',side:'UAE'},
  {name:'Khasab',lat:26.22,lng:56.25,type:'port',side:'Oman'},
  {name:'Jask',lat:25.64,lng:57.77,type:'port',side:'Iran'},
  {name:'Abu Dhabi',lat:24.45,lng:54.65,type:'port',side:'UAE'},
  {name:'Dubai',lat:25.25,lng:55.35,type:'port',side:'UAE'},
  // Persian Gulf
  {name:'Doha',lat:25.29,lng:51.53,type:'port',side:'Qatar'},
  {name:'Bahrain',lat:26.10,lng:50.50,type:'port',side:'Bahrain'},
  {name:'Dammam',lat:26.43,lng:50.10,type:'port',side:'Saudi Arabia'},
  // Red Sea
  {name:'Suez Canal',lat:29.95,lng:32.55,type:'chokepoint',side:'Egypt'},
  {name:'Hurghada',lat:27.26,lng:33.81,type:'port',side:'Egypt'},
  {name:'Jeddah',lat:21.49,lng:39.17,type:'port',side:'Saudi Arabia'},
  {name:'Yanbu',lat:24.09,lng:38.05,type:'port',side:'Saudi Arabia'},
  {name:'Port Sudan',lat:19.62,lng:37.22,type:'port',side:'Sudan'},
  {name:'Massawa',lat:15.61,lng:39.45,type:'port',side:'Eritrea'},
  // Bab el-Mandeb & Horn
  {name:'Bab el-Mandeb',lat:12.60,lng:43.30,type:'chokepoint',side:'Strait'},
  {name:'Djibouti',lat:11.59,lng:43.15,type:'port',side:'Djibouti'},
  {name:'Aden',lat:12.80,lng:45.03,type:'port',side:'Yemen'},
  {name:'Mocha',lat:13.32,lng:43.25,type:'port',side:'Yemen'},
  {name:'Hodeidah',lat:14.80,lng:42.95,type:'port',side:'Yemen'},
  // Yemen — Houthi-controlled areas
  {name:'Sana\'a',lat:15.35,lng:44.21,type:'city',side:'Yemen'},
  // Socotra
  {name:'Socotra I.',lat:12.50,lng:54.00,type:'island',side:'Yemen'}
];

// Daily events: mines, clearances, passages, patrols, Houthi strikes
// region: 'hormuz' or 'redsea' (default 'hormuz' if omitted)
let HZ_EVENTS = [];

// Strait status by date
function getHormuzStatus(d) {
  if (d < '2026-02-28') return 'open';
  if (d <= '2026-03-03') return 'blocked';
  return 'contested';
}

function getHormuzDayData(d) {
  const evts = HZ_EVENTS.filter(e => e.d === d);
  // Cumulative counts
  const allBefore = HZ_EVENTS.filter(e => e.d <= d);
  const totalMines = allBefore.filter(e => e.type === 'mine').reduce((s, e) => s + e.count, 0);
  const totalCleared = allBefore.filter(e => e.type === 'cleared').reduce((s, e) => s + e.count, 0);
  const todayPassages = evts.filter(e => e.type === 'passage').reduce((s, e) => s + e.count, 0);
  const hormuzPassages = evts.filter(e => e.type === 'passage' && e.region !== 'redsea').reduce((s, e) => s + e.count, 0);
  const redseaPassages = evts.filter(e => e.type === 'passage' && e.region === 'redsea').reduce((s, e) => s + e.count, 0);
  const todayPatrols = evts.filter(e => e.type === 'patrol').reduce((s, e) => s + e.count, 0);
  const todayHouthi = evts.filter(e => e.type === 'houthi').reduce((s, e) => s + e.count, 0);
  const totalHouthi = allBefore.filter(e => e.type === 'houthi').reduce((s, e) => s + e.count, 0);
  return { evts, totalMines, totalCleared, activeMines: totalMines - totalCleared, todayPassages, hormuzPassages, redseaPassages, todayPatrols, todayHouthi, totalHouthi };
}

// ===== COUNTRY FILTER HELPERS =====
// Maps short side strings to canonical country names used in countryFaction
const SIDE_TO_COUNTRY = {'US':'USA','United States':'USA','UK':'UK','United Kingdom':'UK','Saudi':'Saudi Arabia','UAE':'UAE','France':'France'};
let KEY_PEOPLE = [];
let MIL_BASES = [];
let FLEET_POS = [];
let NAVAL_FACILITIES = [];

const MAP_WATER_LABELS = [
  {name:'MEDITERRANEAN SEA',lat:34.0,lng:29.5,rotate:-0.15,size:8},
  {name:'PERSIAN GULF',lat:27.0,lng:51.5,rotate:1.0,size:7},
  {name:'RED SEA',lat:22.0,lng:37.5,rotate:1.3,size:7},
  {name:'ARABIAN SEA',lat:17.0,lng:61.0,rotate:0,size:9},
  {name:'CASPIAN SEA',lat:40.0,lng:51.0,rotate:-0.15,size:6},
  {name:'GULF OF ADEN',lat:12.5,lng:47.5,rotate:-0.05,size:6}
];
let CONFLICT_PHASES_NAMED = [];

// Compute phase color from average escalation score
function getPhaseColor(pi, alpha) {
  const phase = CONFLICT_PHASES_NAMED[pi];
  if (!phase) return 'rgba(255,255,255,' + (alpha || 0.3) + ')';
  const nextStart = pi < CONFLICT_PHASES_NAMED.length - 1 ? CONFLICT_PHASES_NAMED[pi + 1].start : null;
  let sum = 0, count = 0;
  for (const d of days) {
    if (d < phase.start) continue;
    if (nextStart && d >= nextStart) break;
    sum += (ESCALATION_SCORES[d] || 1);
    count++;
  }
  const avg = count > 0 ? sum / count : 5;
  const hex = getEscColor(avg);
  if (!alpha && alpha !== 0) alpha = 0.55;
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}

// Key milestone events — manually curated turning points (date, icon, short label, keyword matchers)
let MILESTONES = [];

// Match a news item to its milestone (if any) — requires date match + keyword/category relevance
function getNewsItemMilestone(n) {
  const candidates = MILESTONES.filter(m => m.d === n.d);
  if (!candidates.length) return null;
  for (const ms of candidates) {
    if (ms.cats && !ms.cats.includes(n.cat)) continue;
    if (ms.kw) {
      const title = n.t.toLowerCase();
      const hasKw = ms.kw.some(k => title.includes(k.toLowerCase()));
      if (!hasKw) continue;
    }
    return ms;
  }
  return null;
}

// Phase lookup helpers
function getPhaseForDay(d) {
  for (let i = CONFLICT_PHASES_NAMED.length - 1; i >= 0; i--) {
    if (d >= CONFLICT_PHASES_NAMED[i].start) return i;
  }
  return -1;
}
function getPhaseDateRange(pi) {
  const phase = CONFLICT_PHASES_NAMED[pi];
  if (!phase) return null;
  const start = phase.start;
  const end = pi < CONFLICT_PHASES_NAMED.length - 1 ? CONFLICT_PHASES_NAMED[pi + 1].start : null;
  return {start, end}; // end is exclusive (null = open-ended)
}
const conflictSides = {
  coalition: { label: 'Coalition', countries: ['USA','Israel','Saudi Arabia','Qatar','Bahrain','Jordan','UK','France','Germany','Italy'] },
  axis:      { label: 'Axis of Resistance', countries: ['Iran','Syria','Yemen','Lebanon','Iraq'] },
  neutral:   { label: 'Non-Aligned', countries: ['UAE','Kuwait','Oman','Egypt','Turkey','Azerbaijan','Russia','Japan','India','Pakistan'] }
};

function renderParties() {
  const el = document.getElementById('widgetParties');
  if (!el) return;
  let html = '';
  for (const [key, group] of Object.entries(conflictSides)) {
    html += '<div class="w1-group"><div class="w1-label w1-' + key + '">' + group.label + '</div><div class="w1-countries">';
    group.countries.forEach(co => {
      const flag = countryFlags[co] || '';
      const isSel = isCoSelected(co);
      html += '<div class="w1-co w1c-' + key + (isSel ? ' w1-sel' : '') + '" onclick="selectCo(\'' + co + '\')">';
      html += '<span class="w1-flag">' + flag + '</span>' + co + '</div>';
    });
    html += '</div></div>';
  }
  el.innerHTML = html;
}

// ===== FACTION DETAIL DATA =====
let FACTION_DETAIL = {};

function renderCountryDetail() {
  const el = document.getElementById('countryDetail');
  if (!el) return;
  if (!selCo.size && !selFactions.size) { el.innerHTML = '<div class="nf-detail-empty">Select a country or faction to view details</div>'; return; }

  let html = '';
  const factionColors = {coalition:FC.coalition, axis:FC.axis, neutral:FC.neutral};
  const factionBgs = {coalition:fcAlpha('coalition',.06), axis:fcAlpha('axis',.06), neutral:fcAlpha('neutral',.06)};
  const factionBorders = {coalition:fcAlpha('coalition',.25), axis:fcAlpha('axis',.25), neutral:fcAlpha('neutral',.25)};

  // Render faction summaries for selected factions
  const coveredByFaction = new Set();
  for (const fk of selFactions) {
    const side = conflictSides[fk];
    if (!side) continue;
    side.countries.forEach(c => { coveredByFaction.add(c); coveredByFaction.add(canonCo(c)); });

    // Member list with flags
    const members = side.countries.map(co => {
      const flag = countryFlags[co] || '';
      const dk = co;
      const fd = FACTION_DETAIL[co] || FACTION_DETAIL[dk];
      const role = fd ? fd.role : '';
      return '<div class="fs-member" style="cursor:default">' +
        '<span class="fs-flag">' + flag + '</span>' +
        '<span class="fs-name">' + co + '</span>' +
        (role ? '<span class="fs-role" style="color:' + factionColors[fk] + '">' + role + '</span>' : '') +
        '</div>';
    }).join('');

    // Aggregate casualties from CASUALTY_DATA for selected day
    const latestCas = CASUALTY_DATA[selDay];
    let casHTML = '';
    if (latestCas) {
      if (fk === 'coalition' && latestCas.coalition) {
        casHTML = '<div class="fs-cas">' +
          '<span class="fm-stat fm-stat-red">' + latestCas.coalition.deaths.toLocaleString() + ' killed</span>' +
          '<span class="fm-stat fm-stat-yellow">' + latestCas.coalition.injuries.toLocaleString() + ' wounded</span></div>';
      } else if (fk === 'axis' && latestCas.axis) {
        casHTML = '<div class="fs-cas">' +
          '<span class="fm-stat fm-stat-red">' + latestCas.axis.deaths.toLocaleString() + ' killed</span>' +
          '<span class="fm-stat fm-stat-yellow">' + latestCas.axis.injuries.toLocaleString() + ' wounded</span></div>';
      } else if (fk === 'neutral' && latestCas.civilian) {
        casHTML = '<div class="fs-cas">' +
          '<span class="fm-stat fm-stat-red">' + latestCas.civilian.deaths.toLocaleString() + ' civilian killed</span>' +
          '<span class="fm-stat fm-stat-yellow">' + latestCas.civilian.injuries.toLocaleString() + ' civilian wounded</span></div>';
      }
    } else {
      casHTML = '<div class="fs-cas"><span class="fm-stat" style="background:rgba(255,255,255,.06);color:var(--text2)">Pre-conflict \u2014 no casualties</span></div>';
    }

    // Airport status summary
    let apOpen = 0, apRestricted = 0, apClosed = 0;
    const factionCountryNames = side.countries;
    AP.forEach(a => {
      if (!factionCountryNames.includes(a.co)) return;
      const s = getStat(a.c, selDay);
      if (s === 'Closed') apClosed++;
      else if (s === 'Restricted') apRestricted++;
      else apOpen++;
    });
    const apHTML = '<div class="fs-airports">' +
      (apClosed ? '<span class="fm-stat fm-stat-red">' + apClosed + ' closed</span>' : '') +
      (apRestricted ? '<span class="fm-stat fm-stat-yellow">' + apRestricted + ' restricted</span>' : '') +
      (apOpen ? '<span class="fm-stat fm-stat-green">' + apOpen + ' open</span>' : '') +
      '</div>';

    html += '<div class="faction-summary" style="border-color:' + factionBorders[fk] + ';background:' + factionBgs[fk] + '">' +
      '<div class="fs-header"><span class="fs-label" style="color:' + factionColors[fk] + '">' + side.label + '</span>' +
      '<span class="fs-count">' + side.countries.length + ' members</span></div>' +
      '<div class="fs-members">' + members + '</div>' +
      '<div class="fs-stats">' +
      '<div class="fs-stat-group"><span class="fs-stat-label">Casualties</span>' + casHTML + '</div>' +
      '<div class="fs-stat-group"><span class="fs-stat-label">Airports</span>' + apHTML + '</div>' +
      '</div></div>';
  }

  // Render individual country cards for countries not covered by a faction selection
  for (const co of selCo) {
    if (coveredByFaction.has(co)) continue;
    const dk = co;
    const d = FACTION_DETAIL[dk] || FACTION_DETAIL[co];
    if (!d) continue;
    let econHTML = '';
    const econ = COUNTRY_ECON[dk] || COUNTRY_ECON[co];
    if (econ) {
      econHTML = '<div class="fm-econ" style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">' +
        '<strong style="font-size:.72rem;color:var(--text2)">Economic Exposure</strong>' +
        '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">' +
        '<span class="fm-stat fm-stat-blue">GDP: ' + econ.gdp + '</span>' +
        (econ.oilRev !== 'N/A' && econ.oilRev !== 'None' && econ.oilRev !== 'Minimal' ? '<span class="fm-stat fm-stat-yellow">Oil: ' + econ.oilRev + '</span>' : '') +
        (econ.sovFund && econ.sovFund !== 'N/A' && econ.sovFund !== 'None' && !econ.sovFund.includes('bankrupt') ? '<span class="fm-stat fm-stat-green">Fund: ' + econ.sovFund + '</span>' : '') +
        '<span class="fm-stat" style="background:rgba(255,255,255,.06);color:var(--text2)">' + econ.imports + '</span>' +
        '<span class="fm-stat fm-stat-red">' + econ.warCost + '</span>' +
        '</div></div>';
    }
    html += '<div class="faction-member">' +
      '<div class="fm-head"><span class="fm-flag">' + d.flag + '</span><span class="fm-name">' + d.name + '</span><span class="fm-role ' + d.roleClass + '">' + d.role + '</span></div>' +
      '<div class="fm-body">' + d.body + econHTML + '</div></div>';
  }

  if (!html) html = '<div class="nf-detail-empty">No detail available for selection</div>';
  el.innerHTML = html;
}

// ===== REFRESH ALL PANELS =====
function refresh() {
  let cl = 0, re = 0, op = 0;
  AP.forEach(a => {
    if (hasFilter() && !coPassesFilter(a.co)) return;
    const s = getStat(a.c, selDay);
    s === 'Closed' ? cl++ : s === 'Restricted' ? re++ : op++;
  });
  const di = days.indexOf(selDay);
  const prevDay = di > 0 ? days[di - 1] : null;
  const dt = new Date(selDay + 'T12:00:00');
  const fd = dt.toLocaleDateString('en-US', {weekday:'short', month: 'short', day: 'numeric', year: 'numeric'});
  const cn = hasFilter() ? ' (' + (selCo.size ? [...selCo].join(', ') : [...selFactions].map(f => ({coalition:'Coalition',axis:'Axis',neutral:'Neutral'}[f])).join(', ')) + ')' : '';
  const dateHeader = '<div class="ctx-section"><strong>' + fd + '</strong>' + cn + '</div>';
  const isPreConflict = selDay < CONFLICT_START;

  // --- Compute change data ---
  let airportChanges = [], conflictChanges = [], nfzAdded = [], nfzRemoved = [], routesAdded = [], routesRemoved = [], dayNews = [];
  const allCountries = [...new Set(AP.map(a => a.co))];

  if (!isPreConflict && prevDay) {
    AP.forEach(a => {
      if (hasFilter() && !coPassesFilter(a.co)) return;
      const cur = getStat(a.c, selDay), prev = getStat(a.c, prevDay);
      if (cur !== prev) airportChanges.push({name: a.n, code: a.c, from: prev, to: cur, country: a.co});
    });
    allCountries.forEach(co => {
      if (hasFilter() && !coPassesFilter(co)) return;
      const cur = getCStatus(co, selDay), prev = getCStatus(co, prevDay);
      if (cur !== prev) conflictChanges.push({country: co, from: prev, to: cur});
    });
    const curNFZ = getNFZones(selDay).map(z => z.name).sort();
    const prevNFZ = getNFZones(prevDay).map(z => z.name).sort();
    nfzAdded = curNFZ.filter(z => !prevNFZ.includes(z));
    nfzRemoved = prevNFZ.filter(z => !curNFZ.includes(z));
    const curRoutes = getBypassRoutes(selDay).map(r => r.name).sort();
    const prevRoutes = getBypassRoutes(prevDay).map(r => r.name).sort();
    routesAdded = curRoutes.filter(r => !prevRoutes.includes(r));
    routesRemoved = prevRoutes.filter(r => !curRoutes.includes(r));
  }
  if (!isPreConflict) {
    dayNews = news.filter(n => n.d === selDay);
    if (hasFilter()) dayNews = dayNews.filter(n => newsMatchesCo(n.tags));
  }

  // Country name → clickable, color-coded link
  function coLink(name) {
    const cs = getCStatus(name, selDay);
    const cls = cs === 'war' ? 'ctx-war' : cs === 'attack' ? 'ctx-attack' : 'ctx-peace';
    return '<span class="co-link ' + cls + '" onclick="selectCo(\'' + name.replace(/'/g, "\\'") + '\')">' + name + '</span>';
  }

  // Category mapping: news cat → summary tab
  const dsCatMap = {
    military: 'conflict', general: 'conflict',
    aviation: 'logistics', maritime: 'logistics',
    diplomatic: 'diplomacy',
    stocks: 'markets',
    humanitarian: 'humanitarian'
  };
  const dsDefaults = {
    conflict: 'No significant military or security developments reported.',
    logistics: 'Air and sea routes operating without notable changes.',
    diplomacy: 'No diplomatic developments reported.',
    markets: 'Markets steady with no major movements.',
    humanitarian: 'No humanitarian updates for this date.'
  };

  function buildCategoryParagraph(items) {
    if (!items.length) return null;
    const half = Math.ceil(items.length / 2);
    const p1 = items.slice(0, half).map(n => n.t).join('. ') + '.';
    if (items.length <= 3) return '<p>' + p1 + '</p>';
    const p2 = items.slice(half).map(n => n.t).join('. ') + '.';
    return '<p>' + p1 + '</p><p>' + p2 + '</p>';
  }

  // Group news by summary category
  const dsBuckets = {conflict:[], logistics:[], diplomacy:[], markets:[], humanitarian:[]};
  dayNews.forEach(n => {
    const tab = dsCatMap[n.cat] || 'conflict';
    dsBuckets[tab].push(n);
  });

  // Populate each pane
  const dsTabNames = ['conflict','logistics','diplomacy','markets','humanitarian'];
  dsTabNames.forEach(tab => {
    const items = dsBuckets[tab];
    const bodyId = 'ds' + tab.charAt(0).toUpperCase() + tab.slice(1) + 'Body';
    const bodyEl = document.getElementById(bodyId);
    if (!bodyEl) return;
    const content = buildCategoryParagraph(items) || '<p>' + dsDefaults[tab] + '</p>';
    bodyEl.innerHTML = dateHeader + content;
  });

  // Conflict status indicator
  const hasWar = allCountries.some(co => getCStatus(co, selDay) === 'war');
  const hasAttack = allCountries.some(co => getCStatus(co, selDay) === 'attack');
  const ciDot = document.getElementById('ciDot');
  const ciLabel = document.getElementById('ciLabel');
  ciDot.className = 'ci-dot ' + (hasWar ? 'ci-war' : hasAttack ? 'ci-attack' : 'ci-peace');
  ciLabel.textContent = hasWar ? 'Active Conflict' : hasAttack ? 'Elevated Threat' : 'Stable';
  updateEscalation();

  // Airport status — grouped by country as blocks (only if #aList exists)
  const list = document.getElementById('aList');
  if (list) {
  list.innerHTML = '';
  // Group airports by country
  const countries = {};
  AP.forEach(a => {
    if (hasFilter() && !coPassesFilter(a.co)) return;
    if (!countries[a.co]) countries[a.co] = [];
    countries[a.co].push(a);
  });
  const countryOrder = Object.keys(countries).sort();
  if (!countryOrder.length) {
    list.innerHTML = '<div style="font-size:.8rem;color:var(--text3);padding:12px 0">No airports match this filter.</div>';
  } else {
    // Group countries by faction
    const factionGroups = [
      {key:'axis', label:'Axis of Resistance', css:'axis', countries:[]},
      {key:'coalition', label:'Coalition', css:'coalition', countries:[]},
      {key:'neutral', label:'Non-Aligned', css:'neutral', countries:[]}
    ];
    countryOrder.forEach(co => {
      const fi = countryFaction[co];
      const fk = fi ? fi.faction : 'neutral';
      const fg = factionGroups.find(g => g.key === fk);
      if (fg) fg.countries.push(co);
    });
    factionGroups.forEach(fg => {
      if (!fg.countries.length) return;
      const group = document.createElement('div');
      group.className = 'faction-group';
      const label = document.createElement('div');
      label.className = 'faction-group-label ' + fg.css;
      label.textContent = fg.label;
      group.appendChild(label);
      const blocks = document.createElement('div');
      blocks.className = 'faction-group-blocks';
      fg.countries.forEach(co => {
        const block = document.createElement('div');
        block.className = 'co-block';
        const header = document.createElement('div');
        header.className = 'co-block-name';
        const flag = countryFlags[co] || '';
        header.innerHTML = (flag ? '<span class="co-block-flag">' + flag + '</span>' : '') + co;
        header.addEventListener('click', () => { selectCo(co); });
        block.appendChild(header);
        countries[co].sort((a, b) => a.n.localeCompare(b.n));
        countries[co].forEach(a => {
          const s = getStat(a.c, selDay);
          const sl = s.toLowerCase();
          const row = document.createElement('div');
          row.className = 'co-ap';
          row.innerHTML = '<span class="co-ap-dot ' + sl + '"></span><span class="co-ap-code ' + sl + '">' + a.c + '</span><span class="co-ap-name">' + a.n + '</span>';
          row.title = a.n + ': ' + s;
          row.addEventListener('click', () => {
            const w = mw.clientWidth, h = mw.clientHeight;
            showPopup(a, lx(a.lng, w), ly(a.lat, h));
          });
          block.appendChild(row);
        });
        blocks.appendChild(block);
      });
      group.appendChild(blocks);
      list.appendChild(group);
    });
  }
  } // end if (list)

  renderNews();
  if (filtersOpen) { drawCasualtyChart(); drawDisplacementChart(); drawOilPriceChart(); drawShippingChart(); drawFlightChart(); drawGoldChart(); drawInsuranceChart(); drawNotamChart(); }
}

let DAILY_HEADLINES = {};

function renderNews() {
  const di = days.indexOf(selDay);
  const nb = document.getElementById('nBody');
  nb.innerHTML = '';

  // Build country filter buttons grouped by conflict parties
  const allTags = [...new Set(news.flatMap(n => n.tags).map(t => canonCo(t)))].sort();
  const fGroups = {coalition:[], axis:[], neutral:[]};
  const sideCountries = {};
  for (const [key, group] of Object.entries(conflictSides)) {
    group.countries.forEach(co => { sideCountries[co] = key; fGroups[key].push(co); });
  }
  // Add any tagged countries not already in conflictSides — known countries only
  allTags.forEach(co => {
    if (sideCountries[co]) return; // already added
    const fi = countryFaction[co];
    if (fi) { fGroups[fi.faction].push(co); sideCountries[co] = fi.faction; }
    // Unknown tags (North Korea, Cyprus, etc.) are skipped — they appear in news but don't get filter buttons
  });
  const nfC = document.getElementById('nfCountries');
  if (nfC) {
    const coBtn = (co) => {
      const flag = countryFlags[co] || '';
      const isActive = isCoSelected(co);
      const isSel = isCoSelected(co);
      return '<button class="nf-btn nf-co' + (isActive ? ' active' : '') + (isSel ? ' nf-sel' : '') + '" data-co="' + co + '" onclick="togNewsCo(\'' + co + '\')">' + (flag ? flag + ' ' : '') + co + '</button>';
    };
    const factionOrder = [
      {key:'coalition', label:conflictSides.coalition.label, cls:'nf-fl-coalition', box:'nfb-coalition'},
      {key:'axis', label:conflictSides.axis.label, cls:'nf-fl-axis', box:'nfb-axis'},
      {key:'neutral', label:conflictSides.neutral.label, cls:'nf-fl-neutral', box:'nfb-neutral'}
    ];
    let html = '';
    factionOrder.forEach(fg => {
      const items = fGroups[fg.key] || [];
      const isActive = selFactions.has(fg.key);
      html += '<div class="nf-faction-box ' + fg.box + (isActive ? ' nfb-active' : '') + '">' +
        '<div class="nf-faction-header" onclick="togNewsFaction(\'' + fg.key + '\')">' +
        '<span class="nf-faction-label ' + fg.cls + '">' + fg.label + '</span></div>' +
        '<div class="nf-faction-btns">' +
        (items.length ? items.map(coBtn).join('') : '<span style="font-size:.68rem;color:var(--text3)">\u2014</span>') + '</div></div>';
    });
    nfC.innerHTML = html;
  }

  // Category filter chips
  const catEl = document.getElementById('catFilters');
  if (catEl) {
    catEl.innerHTML = Object.entries(newsCats).map(([k, v]) =>
      '<button class="cat-chip' + (newsCatFilter === k ? ' cc-active' : '') + '" onclick="togNewsCat(\'' + k + '\')">' + v + '</button>'
    ).join('');
  }

  // Determine scope: day-focused or phase-focused
  const isPhaseMode = typeof ganttSelPhase === 'number';
  const activePhaseIdx = isPhaseMode ? ganttSelPhase : getPhaseForDay(selDay);
  const phase = activePhaseIdx >= 0 ? CONFLICT_PHASES_NAMED[activePhaseIdx] : null;
  const phaseRange = activePhaseIdx >= 0 ? getPhaseDateRange(activePhaseIdx) : null;

  // Collect and filter news
  let allItems = news.map(n => ({...n}));
  if (newsCatFilter !== 'all') allItems = allItems.filter(n => n.cat === newsCatFilter);
  if (hasFilter()) allItems = allItems.filter(n => newsMatchesCo(n.tags));

  // Milestone keyword filter — when a milestone chip is selected
  const activeMilestone = selMilestoneIdx != null ? MILESTONES[selMilestoneIdx] : null;
  if (activeMilestone) {
    allItems = allItems.filter(n => {
      if (n.d !== activeMilestone.d) return false;
      const title = n.t.toLowerCase();
      return activeMilestone.kw.some(k => title.includes(k.toLowerCase()));
    });
  }

  if (isPhaseMode && phaseRange) {
    // Phase mode: show all news in the selected phase
    allItems = allItems.filter(n => {
      if (n.d < phaseRange.start) return false;
      if (phaseRange.end && n.d >= phaseRange.end) return false;
      return true;
    });
  } else if (!isPhaseMode && selDay >= '2026-02-28') {
    // Day mode (conflict): show only the selected day
    allItems = allItems.filter(n => n.d === selDay);
  } else {
    // Pre-conflict: show only selDay
    allItems = allItems.filter(n => n.d === selDay);
  }

  if (!allItems.length) {
    nb.innerHTML = '<div style="font-size:.8rem;color:var(--text3);padding:12px 0">No news for this selection.</div>';
    return;
  }

  // Group by date
  const byDate = {};
  allItems.forEach(n => { (byDate[n.d] = byDate[n.d] || []).push(n); });
  const sortedDates = Object.keys(byDate).sort().reverse();

  const wrap = document.createElement('div');
  wrap.className = 'news-paper';

  // Impact score for ranking
  const impScore = n => {
    let s = 0;
    if (n.imp === 'e') s += 10; else if (n.imp === 'd') s += 5;
    if (n.cat === 'military') s += 3;
    else if (n.cat === 'diplomatic') s += 2;
    else if (n.cat === 'humanitarian') s += 2;
    else if (n.cat === 'maritime' || n.cat === 'aviation') s += 1;
    return s;
  };

  // Build tag HTML for a news item — now includes phase + milestone context
  const buildNewsTags = n => {
    const catLabel = newsCats[n.cat] || n.cat;
    let html = '<span class="ni-cat">' + catLabel + '</span>';
    // Milestone tag only if this story is relevant to the milestone
    const ms = getNewsItemMilestone(n);
    if (ms) {
      html += '<span class="tg tg-ms">' + ms.icon + ' ' + ms.label + '</span>';
    }
    // Country tags
    html += n.tags.map(tg => {
      const cs = getCStatus(tg, selDay);
      const tc = cs === 'war' ? 'tw' : cs === 'attack' ? 'ta' : 'tp';
      return '<span class="tg ' + tc + '">' + tg + '</span>';
    }).join('');
    return html;
  };

  // Render each date
  sortedDates.forEach(dateStr => {
    const dayItems = byDate[dateStr];
    const dt2 = new Date(dateStr + 'T12:00:00');
    const fd2 = dt2.toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric', year:'numeric'});
    const dayNum = Math.floor((dt2 - new Date('2026-02-28T12:00:00')) / 86400000) + 1;
    const isSelDay = dateStr === selDay;
    // In day mode, all items are expanded; in phase mode, only selected day is expanded
    const isExpanded = isPhaseMode ? isSelDay : true;
    const section = document.createElement('div');
    section.className = 'news-day-section' + (isSelDay ? ' nds-selected' : '');

    // Day header — clickable to jump to that day
    const header = document.createElement('div');
    header.className = 'news-day-header';
    header.style.cursor = 'pointer';
    header.onclick = () => selectDay(dateStr);
    // Milestone marker on day header
    const dayMs = MILESTONES.filter(m => m.d === dateStr);
    const msHtml = dayMs.length ? '<span class="ndh-ms">' + dayMs.map(m => m.icon + ' ' + m.label).join(' \u00b7 ') + '</span>' : '';
    header.innerHTML = '<span class="news-day-date">' + fd2 + '</span>' +
      (dayNum > 0 ? '<span class="news-day-sub">Day ' + dayNum + '</span>' : '') + msHtml;
    section.appendChild(header);

    // Hero: daily headline as top story (only when expanded)
    const hl = DAILY_HEADLINES[dateStr];
    if (hl && isExpanded) {
      const topItem = dayItems.length ? dayItems.slice().sort((a, b) => impScore(b) - impScore(a))[0] : null;
      const hero = document.createElement('div');
      hero.className = 'news-hero';
      const heroTags = topItem ? '<div class="nt">' + buildNewsTags(topItem) + '</div>' : '';
      hero.innerHTML = '<div class="news-hero-label">Top Story</div>' +
        '<h3>' + hl.headline + '</h3>' + heroTags + '<p>' + hl.sub + '</p>' +
        (topItem ? '<a href="' + topItem.l + '" target="_blank">' + topItem.s + ' \u2192</a>' : '');
      section.appendChild(hero);
    }

    // Deduplicate: group items by category + overlapping tags on same day
    const deduped = [];
    const used = new Set();
    const sorted = dayItems.slice().sort((a, b) => impScore(b) - impScore(a));
    sorted.forEach((n, i) => {
      if (used.has(i)) return;
      const group = [n];
      used.add(i);
      sorted.forEach((m, j) => {
        if (used.has(j)) return;
        if (m.cat === n.cat && m.tags.some(t => n.tags.includes(t))) {
          group.push(m);
          used.add(j);
        }
      });
      deduped.push(group);
    });

    // Stories in two-column grid (or condensed when not expanded)
    if (deduped.length) {
      const cols = document.createElement('div');
      cols.className = 'news-cols' + (!isExpanded ? ' news-cols-condensed' : '');
      deduped.forEach(group => {
        const lead = group[0];
        const item = document.createElement('div');
        item.className = 'news-col-item';
        // Merge all tags from the group
        const allGroupTags = [...new Set(group.flatMap(g => g.tags))];
        const tagN = {...lead, tags: allGroupTags};
        let ih = '<h4>' + lead.t + '</h4><div class="nt">' + buildNewsTags(tagN) + '</div>';
        if (isExpanded) ih += '<p>' + lead.tx + '</p>';
        // Sources: show all unique links from the group
        const sources = [];
        const seenUrls = new Set();
        group.forEach(g => {
          if (!seenUrls.has(g.l)) { seenUrls.add(g.l); sources.push({l: g.l, s: g.s}); }
        });
        if (sources.length > 1) {
          ih += '<div class="nci-sources">' + sources.map(src =>
            '<a href="' + src.l + '" target="_blank">' + src.s + ' \u2192</a>'
          ).join('') + '</div>';
        } else {
          ih += '<a href="' + sources[0].l + '" target="_blank">' + sources[0].s + ' \u2192</a>';
        }
        item.innerHTML = ih;
        cols.appendChild(item);
      });
      section.appendChild(cols);
    }

    wrap.appendChild(section);
  });
  nb.appendChild(wrap);
}

let CASUALTY_DATA = {};
// Per-country casualty attribution (for country/faction filtering)
// Approximate % of faction total attributable to each country
const CASUALTY_COUNTRY_SHARE = {
  // Coalition
  'Israel':{faction:'coalition', share:0.54},
  'USA':{faction:'coalition', share:0.34},
  'Saudi Arabia':{faction:'coalition', share:0.06},
  'UAE':{faction:'coalition', share:0.02},
  'Bahrain':{faction:'coalition', share:0.01},
  'UK':{faction:'coalition', share:0.01},
  'France':{faction:'coalition', share:0.01},
  'Kuwait':{faction:'coalition', share:0.005},
  'Jordan':{faction:'coalition', share:0.005},
  // Axis
  'Iran':{faction:'axis', share:0.45},
  'Lebanon':{faction:'axis', share:0.25},
  'Yemen':{faction:'axis', share:0.15},
  'Iraq':{faction:'axis', share:0.08},
  'Syria':{faction:'axis', share:0.07}
};

let DISPLACEMENT_DATA = {};
const DISPLACEMENT_COLORS = {
  Iran:'#ff2d7b', Lebanon:'#ff6b4a', Iraq:'#ffe100', Syria:'#ff9500', UAE:'#00e5ff', Kuwait:'#00ff88'
};

let OIL_PRICE_DATA = {};

let GOLD_PRICE_DATA = {};

let SUEZ_DATA = {};
// ===== WAR RISK INSURANCE PREMIUMS (% of hull value) =====
// Gulf = Strait of Hormuz / Persian Gulf transit. Red Sea = Bab el-Mandeb / southern Red Sea.
// East Med = eastern Mediterranean (Syria/Lebanon/Israel coast).
// Pre-conflict: Gulf ~0.05%, Red Sea ~0.5% (Houthi baseline), East Med ~0.02%.
// Post-conflict: Gulf surges to ~8-10%, Red Sea 3-5%, East Med 1-3%.
let INSURANCE_DATA = {};

// ===== NOTAM / FIR CLOSURE DATA =====
// Counts of active NOTAMs by severity: closed (complete FIR closure), restricted (altitude/time limits).
// total = total active NOTAMs including advisories. Pre-conflict: minimal (1-3 standing NOTAMs).
let NOTAM_DATA = {};

function getShippingData() {
  const data = {};
  days.forEach(d => {
    if (d < '2026-02-25') return;
    const evts = HZ_EVENTS.filter(e => e.d === d && e.type === 'passage');
    const hormuz = evts.filter(e => e.region !== 'redsea').reduce((s,e) => s+e.count, 0);
    const redsea = evts.filter(e => e.region === 'redsea').reduce((s,e) => s+e.count, 0);
    const suez = SUEZ_DATA[d] || 0;
    data[d] = {hormuz, redsea, suez};
  });
  // Fill pre-conflict days with fixed normal baseline (midpoint of realistic range)
  // Hormuz peacetime: ~22–28 transits/day → 25. Red Sea peacetime: ~32–38 → 35.
  for (let i=15; i<=27; i++) {
    const d = '2026-02-' + String(i).padStart(2,'0');
    if (!data[d]) data[d] = {hormuz: 25, redsea: 35, suez: SUEZ_DATA[d] || 52};
    else {
      if (data[d].hormuz === 0 && d < '2026-02-28') data[d].hormuz = 25;
      if (data[d].redsea === 0 && d < '2026-02-28') data[d].redsea = 35;
      if (!data[d].suez) data[d].suez = SUEZ_DATA[d] || 52;
    }
  }
  return data;
}
let SHIPPING_DATA = {};

// ===== FLIGHT STATUS DATA (computed from AP[] + phases[]) =====
function getFlightStatusData() {
  const data = {};
  days.forEach(d => {
    let open=0, restricted=0, closed=0;
    AP.forEach(a => {
      const s = getStat(a.c, d);
      if (s === 'Closed') closed++; else if (s === 'Restricted') restricted++; else open++;
    });
    data[d] = {open, restricted, closed};
  });
  return data;
}
let FLIGHT_STATUS_DATA = {};

let ESCALATION_SCORES = {};
const ESC_LABELS = {1:'LOW',2:'GUARDED',3:'ELEVATED',4:'ELEVATED',5:'HIGH',6:'HIGH',7:'SEVERE',8:'SEVERE',9:'CRITICAL',10:'MAXIMUM'};
let CIVILIAN_INFRA = [];
const INFRA_ICONS = {hospital:'\u{1F3E5}',power:'\u26A1',desal:'\u{1F4A7}',cable:'\u{1F310}'};
const INFRA_COLORS = {hospital:'#ff6b6b',power:'#ffe100',desal:'#00e5ff',cable:'#00ff88'};
let showInfra = false;
function toggleInfra() {
  showInfra = !showInfra;
  const el = document.getElementById('togInfra');
  if (el) el.classList.toggle('al-active', showInfra);
  drawMap();
}

// ===== REFUGEE FLOW DATA =====
// Derived from DISPLACEMENT_DATA — major flow directions
let REFUGEE_FLOWS = [];
let showRefugeeFlows = false;
function toggleRefugeeFlows() {
  showRefugeeFlows = !showRefugeeFlows;
  const el = document.getElementById('togRefugee');
  if (el) el.classList.toggle('al-active', showRefugeeFlows);
  drawMap();
}

// ===== FACTION OVERLAY =====
let showFactions = false;
const FACTION_PATTERN_COLORS = {
  coalition: fcAlpha('coalition', 0.35),
  axis: fcAlpha('axis', 0.35),
  neutral: fcAlpha('neutral', 0.30)
};
// Build diagonal stripe patterns for each faction (cached canvases)
const _factionPatterns = {};
function getFactionPattern(ctx, faction) {
  const key = faction;
  if (_factionPatterns[key]) return _factionPatterns[key];
  const sz = 10;
  const pc = document.createElement('canvas');
  pc.width = sz; pc.height = sz;
  const pctx = pc.getContext('2d');
  pctx.clearRect(0, 0, sz, sz);
  const color = FACTION_PATTERN_COLORS[faction] || 'rgba(255,255,255,0.2)';
  pctx.strokeStyle = color;
  pctx.lineWidth = faction === 'axis' ? 2 : 1.5;
  if (faction === 'axis') {
    // X cross-hatch for axis
    pctx.beginPath();
    pctx.moveTo(0, 0); pctx.lineTo(sz, sz);
    pctx.moveTo(sz, 0); pctx.lineTo(0, sz);
    pctx.stroke();
  } else if (faction === 'coalition') {
    // Forward diagonal for coalition
    pctx.beginPath();
    pctx.moveTo(-2, sz); pctx.lineTo(sz, -2);
    pctx.moveTo(0, sz + 2); pctx.lineTo(sz + 2, 0);
    pctx.stroke();
  } else {
    // Horizontal dashes for neutral
    pctx.setLineDash([3, 3]);
    pctx.beginPath();
    pctx.moveTo(0, sz / 2); pctx.lineTo(sz, sz / 2);
    pctx.stroke();
  }
  const pat = ctx.createPattern(pc, 'repeat');
  _factionPatterns[key] = pat;
  return pat;
}
function toggleFactions() {
  showFactions = !showFactions;
  const el = document.getElementById('togFactions');
  if (el) el.classList.toggle('al-active', showFactions);
  if (typeof mlMap !== 'undefined' && mlMap && mlMap.getLayer('factions-pattern')) {
    mlMap.setLayoutProperty('factions-pattern', 'visibility', showFactions ? 'visible' : 'none');
  }
  drawMap();
}

// ===== COUNTRY ECONOMIC DATA =====
let COUNTRY_ECON = {};

// ===== DATA STORE =====
// Loads time-series and bulky static data from src/data-store/ JSON files.
// Remaining code (map.js, main.js) waits on DataStore.ready before init.

const DataStore = {
  ready: null,

  init() {
    const base = 'src/data-store/';
    const j = f => fetch(base + f).then(r => { if (!r.ok) throw new Error(f + ': ' + r.status); return r.json(); });

    this.ready = Promise.all([
      j('news.json'),
      j('casualty-data.json'),
      j('displacement-data.json'),
      j('suez-data.json'),
      j('oil-prices.json'),
      j('gold-prices.json'),
      j('insurance-data.json'),
      j('notam-data.json'),
      j('escalation-scores.json'),
      j('hz-events.json'),
      j('daily-headlines.json'),
      j('milestones.json'),
      j('country-posture.json'),
      j('key-people.json'),
      j('faction-detail.json'),
      j('country-econ.json'),
      j('civilian-infra.json'),
      j('refugee-flows.json'),
      j('mil-bases.json'),
      j('fleet-pos.json'),
      j('conflict-phases.json'),
    ]).then(([
      newsData, casualtyData, displacementData, suezData,
      oilData, goldData, insuranceData, notamData, escalationData,
      hzEventsData, headlinesData, milestonesData, postureData,
      keyPeopleData, factionDetailData, countryEconData,
      civilianInfraData, refugeeFlowsData, milBasesData,
      fleetPosData, conflictPhasesData,
    ]) => {
      // Time-series
      news               = newsData;
      CASUALTY_DATA      = casualtyData;
      DISPLACEMENT_DATA  = displacementData;
      SUEZ_DATA          = suezData;
      OIL_PRICE_DATA     = oilData;
      GOLD_PRICE_DATA    = goldData;
      INSURANCE_DATA     = insuranceData;
      NOTAM_DATA         = notamData;
      ESCALATION_SCORES  = escalationData;
      HZ_EVENTS          = hzEventsData;
      DAILY_HEADLINES    = headlinesData;
      MILESTONES         = milestonesData;
      countryPosture     = postureData;
      // Static
      KEY_PEOPLE            = keyPeopleData;
      FACTION_DETAIL        = factionDetailData;
      COUNTRY_ECON          = countryEconData;
      CIVILIAN_INFRA        = civilianInfraData;
      REFUGEE_FLOWS         = refugeeFlowsData;
      MIL_BASES             = milBasesData.milBases;
      NAVAL_FACILITIES      = milBasesData.navalFacilities;
      FLEET_POS             = fleetPosData;
      CONFLICT_PHASES_NAMED = conflictPhasesData.named;
      // Derived (must come after data loads)
      SHIPPING_DATA      = getShippingData();
      FLIGHT_STATUS_DATA = getFlightStatusData();
    });
    return this.ready;
  }
};

DataStore.init();
