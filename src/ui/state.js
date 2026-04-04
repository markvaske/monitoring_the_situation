// ===== MTS UI STATE =====
// Top-level mutable state variables shared across UI modules

let selDay = null; // initialized after DataStore.ready
let selSt = null;
let selCo = new Set();       // selected countries (empty = all)
let selFactions = new Set(); // selected factions (empty = all)
let hoveredCountry = null;
let hzHoveredCountry = null; // hovered country on maritime map
let showNFZ = false, showRoutes = false, showJamming = false;
let showOpen = false, showRestricted = false, showClosed = false;
let showCoalitionBases = false, showIranBases = false;
let showFleet = false;
// Airways map zoom/pan state (now managed by MapLibre — vars kept for compatibility)
let aZoom = 1;
const hzShow = {mine:false, cleared:false, patrol:false, passage:false, houthi:false, lanes:false, corridors:false, naval:false, chokepoints:false};
// OPSEC (dark) is DEFAULT
let filtersOpen = false;

// Calendar popup state
let calPopupOpen = false;
let calWeekOffset = 0;

// Key people popup state
let peoplePopupOpen = false;

// News filter state
let newsCatFilter = 'all';

// Daily summary tab state
let activeDsTab = 'conflict';

// Gantt state
let highlightedNewsIdx = -1;
let ganttSelPhase = null; // null = auto-derive from selDay
let selMilestoneIdx = null; // null = no milestone filter; number = index into MILESTONES[]

// Casualty chart state
let casMode = 'all'; // 'all', 'deaths', 'injuries'
let casShowCoalition = true, casShowAxis = true, casShowCivilian = true;

// Displacement chart state
const dispShowCountries = {};
