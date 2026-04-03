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
const countryPosture = {
  'Iran': 'Iran fired its largest missile salvo since the war began on Apr 1 — 6 consecutive barrages on central Israel injuring 14 including children. Trump claimed Pezeshkian had asked for a ceasefire; Iran denied it as \'false and baseless.\' IRGC declared Hormuz \'fully under our control.\' US-Israel strikes hit pharmaceutical plants and steel facilities in Isfahan and Farokhshahr, drawing international condemnation. HRANA cumulative toll: 1,900+ killed in Iran including 1,551 civilians and 236 children. Missile production capacity at major facilities estimated at near-zero. Economy has contracted sharply — Pezeshkian warned of collapse within weeks. All civilian airports remain closed.',
  'Israel': 'Iran fired its largest missile salvo of the conflict at central Israel on Apr 1 — 6 barrages, 14 injured including children, most hitting open areas per IDF. Israeli airstrikes killed 7 in Beirut\'s southern suburbs (Jnah, Khaldeh). IDF continuing strikes on Iranian pharmaceutical and industrial targets alongside military facilities. Netanyahu visited northern command. Ben Gurion restricted to military flights. Cumulative: 24 civilians killed inside Israel since Feb 28, 10+ soldiers killed in Lebanon.',
  'Syria': 'Iranian weapons convoys and missile depots targeted by Israeli and US strikes. IDF struck infrastructure in Suwayda province on Mar 20, expanding campaign southward. Damascus airport closed since conflict onset. Serving as logistics corridor between Iran and Hezbollah. Assad government unable to prevent use of Syrian territory by either side. 95,000 displaced.',
  'Iraq': 'Six Iranian ballistic missiles struck a Kurdish Peshmerga base north of Erbil on Mar 24, killing 6 fighters and wounding 30 — the first direct Iranian attack on Peshmerga forces. Iraq ordered a response to recent strikes on Iran-backed PMF. Combined forces struck PMF positions in western Mosul and Kataib Hezbollah in Anbar. Force majeure still in effect on all foreign-operated oilfields — Basra at 900K bpd (down from 3.3M). Gas supply from Iran severed. Baghdad and Erbil airports closed. 240,000 displaced.',
  'UAE': 'Kuwaiti VLCC Al Salmi struck by Iranian drone at Port of Dubai on Mar 31 — fire broke out, first direct attack on a UAE port facility since the conflict began. Port operations temporarily suspended. ADNOC has suspended all operations at Habshan and Bab field. Became first Arab Gulf state to co-sign 22-nation Hormuz safe passage statement. Intercepted 327+ ballistic missiles, 15 cruise missiles, and 1,700+ drones since war began. Dubai airport operating at ~40-45% capacity. 9,800 displaced.',
  'Qatar': 'Hosts CENTCOM forward headquarters at Al Udeid while maintaining diplomatic ties with Tehran. Iran\'s desalination threat is existential — Qatar depends on desalination for 100% of its drinking water. Military helicopter crashed in Persian Gulf killing Qatari and Turkish forces. Ras Laffan LNG hub — world\'s largest — previously hit by multiple Iranian missile strikes causing extensive damage. Hamad International limited to restricted operations.',
  'Saudi Arabia': 'Coordinated missile and drone attack on Prince Sultan Air Base on Mar 27 injured 12 US service members, 2 seriously, and damaged KC-135 Stratotanker refueling aircraft. Signed defense cooperation agreement with Ukraine on air defense technology sharing. Iran threatened retaliation against Gulf industries with US shareholders, directly implicating ARAMCO. Total intercepts since conflict start: 220+ missiles and 380+ drones. Yanbu refinery previously struck. UK deploying Rapid Sentry systems. Aramco boss pulled out of major energy conference. Foreign minister declared trust with Iran "completely shattered."',
  'Jordan': 'Hosting coalition F-16 operations from Muwaffaq Salti Air Base while managing humanitarian corridor. Amman restricted after intercepted drone fragments found near approach paths. Buffer between the conflict\'s western and eastern theaters. Casualties: 28 injured.',
  'Lebanon': 'Israeli strikes killed 7 in Beirut southern suburbs (Jnah, Khaldeh) on Mar 31. Hezbollah fired rocket barrage at northern Israel — 3 Israelis lightly injured; IDF struck launchers. Total dead now exceeds 1,318, with 50+ killed in the past 24 hours. Netanyahu ordered expansion of the security zone in southern Lebanon. 850+ Hezbollah fighters killed in recent clashes, many from elite Radwan Force. Three Lebanese journalists killed in Israeli airstrikes on Mar 28. Over 1.68 million displaced. Beirut airport restricted.',
  'Bahrain': 'An Iranian missile attack on Mar 24 killed a Moroccan contractor working for the Emirati armed forces and injured 5 Emirati service members. Sirens sounded multiple times overnight. AWS Bahrain data center disrupted by drone activity for the second time in a month. Iran\'s desalination plant threat is existential — Bahrain depends on desalination for 100% of its drinking water. IRGC has targeted US Fifth Fleet base in Manama. Airport closed since Mar 1. Managing coalition escort operations and shallow-water mine clearance in the Gulf.',
  'Kuwait': 'Desalination plant attacked on Mar 29, killing one Indian worker. 10 Kuwaiti military personnel injured in separate Iranian attack. Repeated attacks since mid-March despite neutral stance. Air defenses intercepted Iranian missiles multiple times. 7 power lines knocked out. Mina Al-Ahmadi and Mina Abdullah refineries struck previously. Airport closed since early March. Hosting US military logistics. 16,000+ displaced.',
  'Oman': 'Airspace remains the only reliable southern bypass corridor for commercial aviation. Muscat operating as safe harbor for diverted vessels. Hit by Iranian missile spillover from Mar 15 onward. Sultan Haitham has engaged in backchannel ceasefire discussions.',
  'Egypt': 'President Sissi touring Gulf capitals on Mar 23 pushing a 30-60 day ceasefire framework. Engaged in backchannel diplomacy — delivered "clear messages" to Iran. Controls the Suez Canal — keeping it open but transit volumes have dropped from ~52/day to ~11/day as shipping diverts around Cape. Egyptian Navy increasing Red Sea patrols. Rafah crossing reopened Mar 19 for humanitarian aid into Gaza after 10-day closure.',
  'Turkey': 'NATO member refusing to pick a side but emerging as key mediator. Turkish/NATO air defenses intercepted the 4th missile directed at Turkish territory since the conflict began on Mar 30 — highlighting creeping escalation risk to NATO\'s southeastern flank. Istanbul airports operating normally. Closed airspace to belligerent military overflights while allowing civilian transit. Hosting Saudi, Turkish, and Egyptian FM discussions in Islamabad (via Pakistan) preparing US-Iran peace talks. Threading the needle between alliance obligations, regional relationships, and active mediation.',
  'Yemen': "Ansar Allah (Houthi) forces have now conducted two barrages toward Israel — the first ballistic missile on Mar 27 and a second attack with missiles, cruise missiles, and drones on Mar 28. Both intercepted. A Houthi spokesman threatened 'direct military intervention' if strikes on 'Muslim lands' continue. Previously warned Bahrain and UAE they 'will be the first to lose.' The launches establish Yemen as a persistent threat axis extending the conflict 2,000+ km south. Sana'a airport non-functional from prior civil war.",
  'Azerbaijan': 'Nakhchivan exclave airport struck by Iranian drones on Mar 5 — first conflict spillover into the Caucasus. Closed all airspace south of Baku. Serving as humanitarian transit corridor for Russian medicine shipments to Iran. Balancing Turkey alliance with economic ties to Moscow and Tehran.',
  'Russia': 'Confirmed providing satellite imagery of coalition military assets to Iran — Prince Sultan Airbase, Diego Garcia, Incirlik, Al Udeid, Shaybah oil field. Iran subsequently attacked all sites. In "very active" discussions on upgraded drone transfers to Iran. Airlifted 13 tons of medicine via Azerbaijan. Putin congratulated Mojtaba Khamenei and pledged solidarity. Economically benefiting from oil price spike and collapse of Iran sanctions regime. Not a direct combatant but deepening operational support for Tehran.',
  'UK': 'Deploying Rapid Sentry short-range air defense systems to Bahrain, Kuwait, and Saudi Arabia on Mar 23. HMS Dragon dispatched to eastern Mediterranean. Most British jets in the region in 15 years. PM Starmer said he was "aware of and welcomes" Trump\'s diplomatic contacts with Iran. HMS Queen Elizabeth carrier strike group deployed to Gulf of Oman with F-35B Lightning IIs. Conducting joint escort operations with US 5th Fleet through Hormuz. Approved US use of RAF Akrotiri and Indian Ocean bases for "defensive operations." Royal Navy mine countermeasures operating from HMS Juffair in Bahrain. British Airways suspended Gulf services through May 31. One soldier killed by drone at Kurdish base in Iraq on Mar 12.',
  'France': 'FS Charles de Gaulle carrier operating Rafale-M strike fighters from the Gulf of Aden. Announced independent "defensive" operation to open Hormuz on Mar 10. Joined six-nation joint statement pledging to help secure Hormuz passage. Macron now consulting UNSC members on a multilateral Hormuz navigation framework. One soldier killed by drone at Kurdish base in Iraq on Mar 12. Coordinating with US/UK naval forces.',
  'Germany': 'Initially declared "this is not our war" and declined to send warships when Trump demanded NATO participation. Reversed course by Mar 19, joining a six-nation joint statement (with UK, France, Italy, Netherlands, Japan) expressing readiness to help secure Hormuz passage. The EU\'s largest economy, bearing the brunt of energy price shocks — ECB warned of "material impact" on European inflation. No military assets deployed to the theater.',
  'Italy': 'Declined Trump\'s initial call for NATO warships alongside Germany and other European allies. Joined the six-nation joint statement on Mar 19 pledging readiness to help secure Hormuz. Co-signed EU statement demanding a moratorium on energy and water infrastructure strikes. Part of the five-nation group (France, Germany, UK, Italy, Spain) that called Israel\'s ground offensive toward Bint Jbeil a "red line." No combat forces deployed.',
  'Japan': 'Deeply exposed as the world\'s fourth-largest oil importer, heavily dependent on Gulf energy. Container shipping rates from Asia to Europe doubled. Factory shutdowns reported due to delayed raw materials. Iran offered to let Japanese-flagged ships through Hormuz on Mar 21, expanding its selective vetting system — Japan acknowledged the communication but declined to comment. Joined the six-nation joint statement on Hormuz. Trump drew a "Pearl Harbor" comparison in a call with the Japanese PM, drawing criticism from historians.',
  'India': 'The world\'s third-largest oil importer, sourcing 60% from the Gulf. India released three seized Iranian oil tankers in exchange for safe passage of two Indian LPG tankers through Hormuz on Mar 16. Maintaining independent diplomatic channels with Tehran and refusing to join the coalition naval campaign. INS Vikrant carrier group deployed to Arabian Sea for "presence operations." New Delhi prioritizing energy security over alliance signaling.',
  'Pakistan': 'Emerged as primary mediator. Announced US-Iran peace talks were imminent; Saudi, Turkish, and Egyptian FMs gathered in Islamabad on Mar 29 for preparatory discussions. Iran approved 20 Pakistani-flagged vessels for Hormuz transit — 2 ships per day. JD Vance and Rubio expected to lead US delegation. Pakistan previously conveyed the US 15-point peace plan to Iran and offered to host talks. The Apr 1 ceasefire claim/denial cycle put mediation efforts on uncertain footing.'
};

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
const news = [
  // ===== PRE-WAR BUILDUP: Feb 25–27 =====
  {d:'2026-02-25',cat:'diplomatic',imp:'e',t:'Rubio: Iran\'s refusal to discuss ballistic missiles is a "big problem"',tags:['USA','Iran'],
   tx:'Secretary of State Rubio says Iran is "trying to achieve ICBMs" and its missile program poses a direct threat. Claims missiles "designed solely to strike America." VP Vance says administration has "seen evidence" Iran rebuilding nuclear weapons program.',
   l:'https://www.reuters.com/world/middle-east/us-iran-nuclear-talks-resume-geneva-against-backdrop-military-threat-2026-02-26/',s:'Reuters'},
  {d:'2026-02-25',cat:'military',imp:'e',t:'Iran hardening nuclear and missile sites against potential strikes',tags:['Iran'],
   tx:'Bloomberg identifies protective structures at Khojir Missile Production Complex in Tehran Province. Iran encasing new facility at Parchin Military Complex with concrete "sarcophagus" to withstand airstrikes. Both sites were hit during June 2025 Israel-Iran war.',
   l:'https://understandingwar.org/research/middle-east/iran-update-february-26-2026/',s:'ISW/Bloomberg'},

  {d:'2026-02-26',cat:'diplomatic',imp:'d',t:'Third round of Geneva talks: "significant progress" but no breakthrough',tags:['Iran','USA'],
   tx:'Omani FM says "significant progress" after day-long indirect talks between Witkoff/Kushner and Araghchi. US demands Iran dismantle Fordow, Natanz, Isfahan; send all enriched uranium to US; accept permanent deal. Iran rejects core demands but offers to reduce enrichment to 1.5%. Technical talks planned for Vienna next week.',
   l:'https://www.reuters.com/world/middle-east/us-iran-nuclear-talks-resume-geneva-against-backdrop-military-threat-2026-02-26/',s:'Reuters'},
  {d:'2026-02-26',cat:'diplomatic',imp:'e',t:'Iran offers economic sweeteners: oil, gas, mining rights to attract US deal',tags:['Iran','USA'],
   tx:'Financial Times reports Iran offering investments in oil/gas reserves, mining rights, and critical minerals to convince Trump. Khamenei reportedly granted permission for proposal including American companies entering Iran. Iran examining Venezuela as case study.',
   l:'https://understandingwar.org/research/middle-east/iran-update-february-26-2026/',s:'ISW/Financial Times'},
  {d:'2026-02-26',cat:'military',imp:'e',t:'US Fleet HQ in Bahrain evacuated; all US ships leave port',tags:['USA','Bahrain'],
   tx:'Fox News reports US Fleet Headquarters in Bahrain reduced to fewer than 100 mission-critical personnel. Satellite photos show all US ships have left port — the same defensive measures taken before the June 2025 US strikes on Iran.',
   l:'https://en.wikipedia.org/wiki/2026_United_States_military_buildup_in_the_Middle_East',s:'Fox News'},
  {d:'2026-02-26',cat:'general',imp:'e',t:'Trump addresses nuclear threat in State of the Union; prefers deal but won\'t allow bomb',tags:['USA','Iran'],
   tx:'In State of the Union address, Trump makes case for possible military action on Iran. Says he prefers diplomatic solution but will not allow Tehran to obtain a nuclear weapon. Analysts see speech as laying public groundwork for potential strikes.',
   l:'https://www.axios.com/2026/02/26/iran-nuclear-talks-geneva',s:'Axios'},

  {d:'2026-02-27',cat:'diplomatic',imp:'d',t:'Oman: Iran agrees to degrade nuclear stockpiles; Trump warns "all options" remain',tags:['Iran','USA'],
   tx:'Omani FM says Iran has agreed to degrade stockpiles to "lowest level possible." But Trump warns "all options" available if diplomacy fails. Technical discussions scheduled for Vienna next week, but many analysts see this as the last chance before military action.',
   l:'https://www.aljazeera.com/news/2026/2/28/us-israel-bomb-iran-a-timeline-of-talks-and-threats-leading-up-to-attacks',s:'Al Jazeera'},
  {d:'2026-02-27',cat:'military',imp:'e',t:'USS Ford positioned off Israel; 14 tanker aircraft staged at Ben Gurion',tags:['USA','Israel'],
   tx:'USS Gerald R. Ford deployed off the coast of Israel. Total of 14 USAF refueling tankers at Ben Gurion Airport, enabling Ford carrier air wings enough range to reach Iran. Concentration of US assets constitutes most significant force posture since 2003 Iraq invasion.',
   l:'https://en.wikipedia.org/wiki/2026_United_States_military_buildup_in_the_Middle_East',s:'Wikipedia/Multiple Sources'},
  {d:'2026-02-27',cat:'aviation',imp:'e',t:'EASA and FAA issue heightened advisory warnings for Middle East overflights',tags:['Iran','Iraq'],
   tx:'European and US aviation authorities issue updated NOTAMs warning of increased military activity across Middle Eastern airspace. Airlines begin pre-positioning for potential rapid airspace closures. Several carriers establish alternative routing via Central Asia.',
   l:'https://ops.group/blog/middle-east-airspace-current-operational-picture/',s:'OPSGROUP'},
  {d:'2026-02-27',cat:'stocks',imp:'e',t:'Markets brace for potential conflict; Brent approaches $75',tags:['USA','Iran'],
   tx:'Brent crude rises to $74.20 as war risk premium builds. S&P 500 slips 0.8% for February. Gold holds above $5,200. European defense stocks at multi-year highs. Energy analysts warn of $100+ oil if Hormuz is disrupted.',
   l:'https://www.ig.com/en/news-and-trade-ideas/february-2026--markets--geopolitics--and-a-war-in-iran0-260318',s:'IG Markets'},

  // ===== CONFLICT PERIOD: Feb 28 onward =====
  {d:'2026-02-28',cat:'military',imp:'e',t:'US-Israeli strikes target Iranian nuclear sites',tags:['Iran','Israel','USA'],
   tx:'Coordinated strikes hit Natanz, Isfahan, and Fordow. Iran retaliates with ballistic missiles toward Israeli and Gulf bases.',
   l:'https://ops.group/blog/middle-east-airspace-current-operational-picture/',s:'OPSGROUP'},
  {d:'2026-02-28',cat:'aviation',imp:'e',t:'Gulf airports suspend all civilian operations',tags:['UAE','Qatar','Bahrain'],
   tx:'Dubai, Abu Dhabi, and Doha airports suspend flights. Thousands stranded as regional airspace closes.',
   l:'https://www.theguardian.com/world/2026/mar/02/flights-cancelled-middle-east-travel-chaos-us-israeli-iran-conflict',s:'The Guardian'},
  {d:'2026-02-28',cat:'stocks',imp:'e',t:'Oil surges past $120, global markets plummet',tags:['USA'],
   tx:'Brent crude spikes 22% to $124/bbl. S&P 500 drops 4.1%, Nasdaq falls 5.3%. Defense stocks rally \u2014 Lockheed Martin up 9%.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-02-28',cat:'military',imp:'e',t:'Pentagon confirms CENTCOM-led operation',tags:['USA','Iran'],
   tx:'Defense Secretary confirms US forces conducted precision strikes on Iranian nuclear infrastructure. Carrier strike groups repositioned to Arabian Sea.',
   l:'https://www.defense.gov',s:'DoD'},
  {d:'2026-02-28',cat:'maritime',imp:'e',t:'Iran threatens to close Strait of Hormuz',tags:['Iran'],
   tx:'IRGC Navy commander warns all shipping traffic through the Strait will be targeted. Oil tanker operators pause bookings.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-02-28',cat:'military',imp:'e',t:'Iranian Supreme Leader Khamenei killed in opening strikes',tags:['Iran','USA','Israel'],
   tx:'Ayatollah Ali Khamenei confirmed killed in initial wave of US-Israeli strikes. IRGC vows massive retaliation. Iranian state TV goes off air briefly before resuming with Revolutionary Guard commander addressing the nation.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-02-28',cat:'military',imp:'e',t:'Iran fires ballistic missiles at Israel and US Gulf bases',tags:['Iran','Israel','USA','Qatar','Bahrain','UAE'],
   tx:'IRGC launches retaliatory salvos at Israeli military facilities in Tel Aviv and US bases across at least six Gulf states. Air-raid sirens sound in Tel Aviv, Riyadh, Doha and Manama simultaneously.',
   l:'https://www.aljazeera.com',s:'Al Jazeera'},
  {d:'2026-02-28',cat:'maritime',imp:'e',t:'IRGC broadcasts VHF warnings to all vessels in Strait of Hormuz',tags:['Iran'],
   tx:'IRGC Navy issues VHF radio warnings to all commercial shipping: "This waterway is now under full military control of the Islamic Republic." Oil tankers begin turning around outside the strait.',
   l:'https://www.ft.com',s:'Financial Times'},
  {d:'2026-02-28',cat:'military',imp:'e',t:'Beit Shemesh missile strike kills 9 Israelis',tags:['Israel','Iran'],
   tx:'Iranian ballistic missile penetrates Israeli air defenses and strikes the city of Beit Shemesh in central Israel, killing nine people and injuring over 20. Deadliest single Iranian strike on Israeli soil.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-02-28',cat:'general',imp:'e',t:'Israel and Iran declare state of war; civilians rush to shelters',tags:['Israel','Iran'],
   tx:'Both nations formally declare a state of war. Israeli Home Front Command orders all civilians to shelters. Iran announces general mobilization. Millions across the region brace for sustained conflict.',
   l:'https://www.bbc.com',s:'BBC'},
  {d:'2026-03-01',cat:'aviation',imp:'e',t:'Kuwait airport closes after drone debris on runway',tags:['Kuwait'],
   tx:'Kuwait International suspends operations after wreckage from intercepted Iranian-made UAV found near runway 15L.',
   l:'https://ops.group/blog/middle-east-airspace-current-operational-picture/',s:'OPSGROUP'},
  {d:'2026-03-01',cat:'aviation',imp:'e',t:'Bahrain International closes amid missile threat',tags:['Bahrain'],
   tx:'Bahrain shuts airport after missile debris recovered from shallow waters near approach path.',
   l:'https://ops.group/blog/middle-east-airspace-current-operational-picture/',s:'OPSGROUP'},
  {d:'2026-03-01',cat:'maritime',imp:'e',t:'First mines detected in Strait of Hormuz',tags:['Iran'],
   tx:'US 5th Fleet reports contact mines detected near Qeshm Island. Commercial vessels warned to hold position outside strait.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-01',d2:'2026-03-09',cat:'stocks',imp:'e',t:'Insurance rates for Gulf shipping spike 800%',tags:['UAE','Oman'],
   tx:'Lloyd\u2019s market war risk premium for Strait of Hormuz transit jumps to 5\u20137% of hull value. Shipping stocks collapse.',
   l:'https://www.ft.com',s:'Financial Times'},
  {d:'2026-03-01',cat:'military',imp:'e',t:'Iran fires ballistic missiles at Al Udeid Air Base',tags:['Iran','Qatar','USA'],
   tx:'Multiple ballistic missiles intercepted over Qatar. Patriot batteries engage successfully. No casualties reported at CENTCOM forward HQ.',
   l:'https://www.cnn.com',s:'CNN'},
  {d:'2026-03-01',cat:'maritime',imp:'e',t:'Oil tankers Skylight and MKDVYOM struck near Hormuz',tags:['Iran','Oman'],
   tx:'Two tankers hit within hours of each other near Qeshm Island. Skylight (Liberia-flagged) sustains hull breach; MKDVYOM (Marshall Islands) reports fire in engine room. Both crews evacuated by Omani coast guard.',
   l:'https://www.ft.com',s:'Financial Times'},
  {d:'2026-03-01',cat:'military',imp:'e',t:'Hezbollah vows retaliation for Israeli role in Iran strikes',tags:['Lebanon','Israel','Iran'],
   tx:'Hezbollah Secretary-General issues statement calling US-Israeli strikes on Iran "an attack on the entire resistance axis." Pledges to open a second front from Lebanon. Israeli military raises alert on northern border.',
   l:'https://www.aljazeera.com',s:'Al Jazeera'},
  {d:'2026-03-01',cat:'military',imp:'e',t:'Iranian drones and missiles target US 5th Fleet HQ in Bahrain',tags:['Bahrain','Iran','USA'],
   tx:'Multiple waves of drones and ballistic missiles target Juffair naval base in Bahrain, headquarters of US Naval Forces Central Command. Most intercepted; one worker killed by falling debris at Salman Industrial City.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-01',cat:'general',imp:'e',t:'Oman\'s Duqm port targeted by Iranian drones',tags:['Oman','Iran'],
   tx:'Two Iranian drones strike the port of Duqm in Oman, injuring one foreign worker. Oman condemns the attack and calls for immediate cessation of hostilities while maintaining neutrality.',
   l:'https://www.bbc.com',s:'BBC'},
  {d:'2026-03-02',cat:'diplomatic',imp:'n',t:'UN Security Council emergency session convenes',tags:['USA','Iran'],
   tx:'Russia and China block US-backed resolution. Secretary General calls for immediate ceasefire. No agreement reached.',
   l:'https://www.un.org',s:'UN News'},
  {d:'2026-03-02',cat:'general',imp:'e',t:'Fuel prices hit record highs worldwide',tags:['USA'],
   tx:'US gasoline averages $5.40/gallon. European diesel surges 35%. Airlines announce emergency fuel surcharges.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-02',cat:'maritime',imp:'e',t:'IRGC fast boats harass merchant vessel near Hormuz',tags:['Iran'],
   tx:'Iranian speedboats approach within 50 yards of Liberian-flagged tanker. US destroyer escorts vessel through strait.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-02',cat:'military',imp:'e',t:'Hezbollah launches first strikes since 2024 ceasefire; rockets hit northern Israel',tags:['Lebanon','Israel'],
   tx:'Hezbollah fires its first barrage since the November 2024 ceasefire. Over 80 rockets target military positions in northern Israel. IDF confirms hits in Galilee region. Israel vows "disproportionate" response.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-02',cat:'military',imp:'e',t:'Israel bombs Beirut southern suburbs in pre-dawn strikes',tags:['Israel','Lebanon'],
   tx:'Israeli jets strike Hezbollah positions in Dahiyeh, southern Beirut, at 3 AM. Multiple buildings destroyed. Lebanon reports at least 12 killed. Israel says strikes targeted weapons depots and command centers.',
   l:'https://www.cnn.com',s:'CNN'},
  {d:'2026-03-02',cat:'maritime',imp:'e',t:'IRGC officially declares Strait of Hormuz closed to hostile nations',tags:['Iran','USA'],
   tx:'IRGC Navy commander formally announces strait closure to US, Israeli, and allied-flagged vessels. "Any ship serving the interests of the Zionist entity will be treated as a legitimate target."',
   l:'https://www.aljazeera.com',s:'Al Jazeera'},
  {d:'2026-03-02',cat:'aviation',imp:'e',t:'Qatar suspends all flights as LNG facility near Ras Laffan damaged',tags:['Qatar','Iran'],
   tx:'Iranian missile strikes near Qatar\'s Ras Laffan industrial complex damage LNG processing equipment. Hamad International closes completely. QatarEnergy halts LNG production, sending global gas prices soaring.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-02',cat:'stocks',imp:'e',t:'Global markets in freefall; Asian exchanges trigger circuit breakers',tags:['USA'],
   tx:'Tokyo, Hong Kong, and Shanghai exchanges halt trading after 7% drops. European markets open 5% lower. Gold surges past $2,700/oz. US 10-year yield plummets as investors flee to safety.',
   l:'https://www.bloomberg.com',s:'Bloomberg'},
  {d:'2026-03-03',cat:'military',imp:'e',t:'US deploys additional carrier group to Arabian Sea',tags:['USA'],
   tx:'USS Enterprise carrier strike group transits Suez Canal. Third US carrier now within striking distance of Iran.',
   l:'https://www.defense.gov',s:'DoD'},
  {d:'2026-03-03',cat:'stocks',imp:'e',t:'S&P 500 enters correction territory',tags:['USA'],
   tx:'Markets down 12% from pre-conflict highs. Oil at $128/bbl. Gold hits $2,800/oz. VIX spikes to 42.',
   l:'https://www.bloomberg.com',s:'Bloomberg'},
  {d:'2026-03-03',cat:'general',imp:'e',t:'Thousands of Americans stranded across Gulf states',tags:['USA','UAE','Qatar'],
   tx:'State Department orders departure of non-essential embassy staff. Charter flights organized for US citizens from Dubai and Doha.',
   l:'https://www.cnn.com',s:'CNN'},
  {d:'2026-03-03',cat:'military',imp:'e',t:'Hezbollah targets Ramat David airbase and Meron radar site',tags:['Lebanon','Israel'],
   tx:'Hezbollah launches precision strikes at Israeli military facilities in the north. Ramat David air base sustains minor damage. Meron surveillance radar briefly knocked offline. Israel retaliates with strikes on Hezbollah command posts.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-03',cat:'maritime',imp:'e',t:'Tankers Pelagia and Libra Trader attacked near Hormuz',tags:['Iran','Oman'],
   tx:'Greek-owned bulk carrier Pelagia struck by naval mine west of Hormuz Island. Hours later, chemical tanker Libra Trader reports IRGC fast boats firing warning shots near Qeshm. Both vessels divert to Fujairah anchorage.',
   l:'https://www.ft.com',s:'Financial Times'},
  {d:'2026-03-03',cat:'diplomatic',imp:'n',t:'Lebanese government condemns Hezbollah\'s entry into war',tags:['Lebanon'],
   tx:'Lebanese Prime Minister issues statement condemning Hezbollah for dragging the country into conflict without government authorization. Calls on all parties to respect UN Resolution 1701.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-03',cat:'military',imp:'e',t:'Israel strikes Al-Manar TV headquarters in Beirut',tags:['Israel','Lebanon'],
   tx:'Israeli jets destroy Hezbollah\'s Al-Manar television station with precision-guided munitions. Evacuation warnings issued 90 minutes before strike. Three employees killed. Hezbollah shifts to encrypted online broadcasts.',
   l:'https://www.bbc.com',s:'BBC'},
  {d:'2026-03-04',d2:'2026-03-14',cat:'aviation',imp:'n',t:'Airlines reroute en masse via Egypt-Oman corridor',tags:['Egypt','Oman','Saudi Arabia'],
   tx:'Major carriers adopt southern bypass. Flight times to Asia increase 2\u20134 hours. Jet fuel costs surge 18%.',
   l:'https://info.expeditors.com/operational-impact/middle-east-tension-escalation-march-12-2026',s:'Expeditors'},
  {d:'2026-03-04',d2:'2026-03-12',cat:'maritime',imp:'d',t:'US Navy begins minesweeping operations in Hormuz',tags:['USA','Iran'],
   tx:'Mine countermeasure ships USS Dextrous and USS Gladiator begin clearing operations near Qeshm. Three mines neutralized on day one.',
   l:'https://www.defense.gov',s:'DoD'},
  {d:'2026-03-04',d2:'2026-03-12',cat:'diplomatic',imp:'d',t:'Saudi Arabia offers to mediate ceasefire talks',tags:['Saudi Arabia','Iran','USA'],
   tx:'Crown Prince proposes Riyadh as neutral venue for negotiations. Iran rejects preconditions. US signals willingness to discuss.',
   l:'https://www.aljazeera.com',s:'Al Jazeera'},
  {d:'2026-03-04',cat:'stocks',imp:'n',t:'Energy sector surges while tech selloff deepens',tags:['USA'],
   tx:'ExxonMobil, Chevron up 15% since conflict start. Apple, Microsoft lead tech losses. Airline stocks down 25\u201340%.',
   l:'https://www.bloomberg.com',s:'Bloomberg'},
  {d:'2026-03-04',cat:'military',imp:'e',t:'IRGC claims complete control of Strait of Hormuz',tags:['Iran','USA'],
   tx:'IRGC Rear Admiral says Iran has established complete naval dominance over the strait. Deploys fast attack craft, midget submarines, and coastal missile batteries. Pentagon says claims are "grossly exaggerated."',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-04',cat:'maritime',imp:'e',t:'Ships Safeen Prestige and Sonangol Namibe attacked in Gulf',tags:['Iran','UAE'],
   tx:'UAE-flagged ro-ro vessel Safeen Prestige hit by anti-ship missile near Fujairah. Angolan tanker Sonangol Namibe reports mine contact south of Larak Island. Insurance underwriters begin refusing new Gulf transit policies.',
   l:'https://www.ft.com',s:'Financial Times'},
  {d:'2026-03-04',cat:'military',imp:'e',t:'Hezbollah wounds first IDF soldiers in cross-border clashes',tags:['Lebanon','Israel'],
   tx:'Three IDF soldiers wounded by anti-tank missile fire near Metula. First Israeli military casualties from Lebanese front since ceasefire collapse. IDF responds with artillery barrage across border fence.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-04',cat:'general',imp:'e',t:'Kuwaiti girl killed by shrapnel from intercepted missile',tags:['Kuwait','Iran'],
   tx:'A young girl dies from shrapnel injuries after debris from an intercepted Iranian missile falls on a residential area in Kuwait City. Kuwait\'s Emir condemns Iran for targeting civilian areas.',
   l:'https://www.bbc.com',s:'BBC'},
  {d:'2026-03-04',cat:'military',imp:'e',t:'Israel launches incursion into southern Syria near Golan',tags:['Israel','Syria'],
   tx:'IDF ground forces push into southern Syria near the Golan Heights border to destroy Iranian weapons transfer routes. Syrian government forces withdraw without engaging. Russia demands immediate Israeli withdrawal.',
   l:'https://www.cnn.com',s:'CNN'},
  {d:'2026-03-04',cat:'maritime',imp:'e',t:'USS Charlotte torpedoes and sinks Iranian warship IRIS Dena off Sri Lanka',tags:['USA','Iran'],
   tx:'USS Charlotte, a Los Angeles-class nuclear submarine, fires two Mark 48 torpedoes at Iranian frigate IRIS Dena 19 nautical miles off Galle, Sri Lanka. The ship sinks in under 3 minutes. 84 sailors killed, 61 missing, 32 rescued by Sri Lankan navy. The Dena was returning from an Indian fleet review and was unarmed or lightly armed. First submarine sinking of a surface vessel since the Falklands War.',
   l:'https://www.bbc.com/news/articles/c363lk4xk07o',s:'BBC'},
  {d:'2026-03-04',cat:'military',imp:'e',t:'NATO intercepts missile over Turkey; Malatya Patriot deployed',tags:['Turkey','Iran'],
   tx:'A missile launched from Iran transits Turkish airspace before being intercepted by NATO air defenses. Turkey deploys a Patriot battery to Malatya in southeastern Turkey. Ankara summons Iranian ambassador.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-04',cat:'aviation',imp:'e',t:'First US charter evacuation flights depart Gulf states',tags:['USA','UAE','Qatar','Bahrain','UK','France'],
   tx:'State Department-chartered aircraft begin evacuating American citizens from Dubai, Doha, and Bahrain. Over 3,000 US nationals registered for departure. UK and France announce parallel evacuation operations.',
   l:'https://www.cnn.com',s:'CNN'},
  {d:'2026-03-04',cat:'humanitarian',imp:'e',t:'Iraq closes border with Iran as refugee flows surge',tags:['Iraq','Iran'],
   tx:'Iraq closes its eastern border crossings as thousands of Iranians flee westward. UNHCR estimates 45,000 have already crossed into Iraq since strikes began. Kurdish Regional Government opens temporary shelters in Sulaymaniyah.',
   l:'https://www.aljazeera.com',s:'Al Jazeera'},
  {d:'2026-03-04',cat:'stocks',imp:'e',t:'Gold breaks $3,100 as safe-haven demand surges',tags:['USA'],
   tx:'Gold spot price surges past $3,100/oz for the first time, driven by geopolitical risk premium and flight from equities. Silver follows with a 6% daily gain. Analysts project $3,500 if conflict persists through March.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-05',cat:'military',imp:'e',t:'Israeli Iron Dome intercepts barrage of 200+ rockets',tags:['Israel','Iran','Syria'],
   tx:'Hezbollah-launched rockets from southern Lebanon supplement Iranian missile campaign. Israeli retaliation strikes Iranian arms convoy in Syria.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-05',cat:'maritime',imp:'e',t:'Oil tanker struck by mine near Larak Island',tags:['Iran','Oman'],
   tx:'Singapore-flagged VLCC sustains hull damage from contact mine. Crew evacuated. Major oil spill feared. Tanker rates triple.',
   l:'https://www.ft.com',s:'Financial Times'},
  {d:'2026-03-05',cat:'humanitarian',imp:'e',t:'Iran reports civilian casualties from US strikes',tags:['Iran','USA'],
   tx:'Iranian state media claims 47 civilians killed near Isfahan. Pentagon says targets were military. Red Cross calls for investigation.',
   l:'https://www.bbc.com',s:'BBC'},
  {d:'2026-03-05',cat:'military',imp:'e',t:'UNIFIL reports 210+ Hezbollah missiles fired at Israel in one day',tags:['Lebanon','Israel'],
   tx:'UN peacekeeping force UNIFIL records heaviest single-day barrage from Lebanon. Over 210 rockets and missiles launched at Israeli military and civilian targets. Multiple fires in northern Israel.',
   l:'https://www.un.org',s:'UN News'},
  {d:'2026-03-05',cat:'military',imp:'e',t:'Israel kills Hamas official in Beirut airstrike',tags:['Israel','Lebanon'],
   tx:'Israeli strike kills a senior Hamas political bureau member sheltering in Beirut. Hamas condemns "assassination campaign." Lebanon accuses Israel of expanding the war beyond Hezbollah targets.',
   l:'https://www.aljazeera.com',s:'Al Jazeera'},
  {d:'2026-03-05',cat:'military',imp:'e',t:'IDF issues evacuation notice for south Beirut suburbs',tags:['Israel','Lebanon'],
   tx:'Israeli military drops leaflets and sends SMS warnings ordering residents of Dahiyeh to evacuate. Tens of thousands flee northward toward Jounieh and Byblos. Hospitals in Beirut overwhelmed.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-05',cat:'maritime',imp:'e',t:'Hezbollah targets Israeli oil and gas infrastructure at sea',tags:['Lebanon','Israel'],
   tx:'Hezbollah fires anti-ship missiles toward the Karish offshore gas platform. Israeli Navy intercepts two of three missiles. Production temporarily halted as a precaution. Energy prices spike further.',
   l:'https://www.ft.com',s:'Financial Times'},
  {d:'2026-03-05',cat:'aviation',imp:'e',t:'Iranian drones strike Nakhchivan airport in Azerbaijan',tags:['Azerbaijan','Iran'],
   tx:'Multiple Iranian drones hit Nakhchivan International Airport in Azerbaijan\'s exclave, the first spillover of the conflict into the Caucasus. Three airport workers injured. Azerbaijan closes all airspace south of Baku. Turkey condemns the attack as a violation of NATO ally sovereignty.',
   l:'https://www.bbc.com',s:'BBC'},
  {d:'2026-03-05',cat:'military',imp:'e',t:'US strikes hit Shiraz military infrastructure; 20 reported killed',tags:['USA','Iran'],
   tx:'CENTCOM confirms strikes on IRGC facilities near Shiraz, including an air defense radar site and missile storage depot. Iranian media reports 20 military personnel killed. Third consecutive night of B-2 operations over Iran.',
   l:'https://www.cnn.com',s:'CNN'},
  {d:'2026-03-05',cat:'diplomatic',imp:'e',t:'Russia warns US against strikes near Russian-built nuclear facilities',tags:['Russia','USA','Iran'],
   tx:'Russian Foreign Ministry issues formal warning that strikes near the Bushehr nuclear plant — built and fueled by Russia — could constitute an act against Russian interests. Pentagon says Bushehr is not on the target list.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-05',cat:'stocks',imp:'e',t:'Brent crude hits $95/bbl on Hormuz closure fears',tags:['Iran','USA'],
   tx:'Oil prices surge as Iran\'s mining of Hormuz and attacks on shipping vessels raise fears of prolonged closure. Brent crude jumps 8% in a single session. Gulf state sovereign wealth funds begin liquidating equity positions.',
   l:'https://www.ft.com',s:'Financial Times'},
  {d:'2026-03-06',cat:'aviation',imp:'d',t:'UAE airports reopen under severe restrictions',tags:['UAE'],
   tx:'Dubai, Abu Dhabi, and Al Maktoum resume limited operations. GCAA approval required per flight. Designated corridors only.',
   l:'https://ops.group/blog/middle-east-airspace-current-operational-picture/',s:'OPSGROUP'},
  {d:'2026-03-06',cat:'aviation',imp:'d',t:'Qatar allows limited repatriation flights',tags:['Qatar'],
   tx:'Hamad International begins processing repatriation flights only. No scheduled commercial service.',
   l:'https://www.cntraveler.com/story/middle-east-airspace-closures-latest-updates-for-travelers',s:'Cond\u00e9 Nast Traveler'},
  {d:'2026-03-06',cat:'maritime',imp:'e',t:'Strait of Hormuz declared contested waterway',tags:['USA','Iran'],
   tx:'US 5th Fleet designates strait as contested. Mandatory naval escort for all commercial transits. Insurance underwriters suspend new policies.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-06',cat:'stocks',imp:'e',t:'Brent crude hits $135 as Hormuz shipping halts',tags:['USA'],
   tx:'Oil prices reach highest since 2008. US Strategic Petroleum Reserve release authorized. Asian markets in freefall.',
   l:'https://www.bloomberg.com',s:'Bloomberg'},
  {d:'2026-03-06',cat:'maritime',imp:'e',t:'Tugboat Mussafah-2 sunk near Fujairah; 3 crew missing',tags:['UAE','Iran'],
   tx:'UAE maritime authority reports the tugboat Mussafah-2 sunk after striking a mine 12 nautical miles off Fujairah port. Three crew members missing, presumed dead. Salvage operations suspended due to mine threat.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-06',cat:'diplomatic',imp:'e',t:'Trump demands Iran\'s "unconditional surrender" in Rose Garden speech',tags:['USA','Iran'],
   tx:'President Trump delivers prime-time address demanding Iran unconditionally surrender its nuclear program and dismantle the IRGC. Threatens further escalation if terms rejected. Iran dismisses demand as "delusional."',
   l:'https://www.nytimes.com',s:'NYT'},
  {d:'2026-03-06',cat:'general',imp:'e',t:'Qatar energy minister warns of weeks of disruption to LNG exports',tags:['Qatar','Iran'],
   tx:'Qatar\'s energy minister says Ras Laffan damage will take weeks to repair. Global LNG spot prices jump 40%. Asian importers scramble for alternative supply from Australia and the US Gulf Coast.',
   l:'https://www.ft.com',s:'Financial Times'},
  {d:'2026-03-07',cat:'military',imp:'e',t:'Iran launches anti-ship missiles at US destroyer',tags:['Iran','USA'],
   tx:'Two cruise missiles fired at USS Mason in Gulf of Oman. Both intercepted by SM-2 missiles. US retaliates against coastal battery.',
   l:'https://www.defense.gov',s:'DoD'},
  {d:'2026-03-07',cat:'diplomatic',imp:'d',t:'G7 issues joint statement demanding ceasefire',tags:['USA'],
   tx:'G7 leaders call for immediate cessation of hostilities. Joint sanctions package against Iran announced. Humanitarian corridors proposed.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-07',cat:'general',imp:'e',t:'Global airline industry faces $4.2B weekly losses',tags:['UAE','Qatar'],
   tx:'IATA estimates conflict costs global aviation $600M/day. Emirates, Qatar Airways suspend all operations. 380,000 passengers affected daily.',
   l:'https://www.iata.org',s:'IATA'},
  {d:'2026-03-07',cat:'maritime',imp:'e',t:'Ships Prima and Louis P attacked; US mulls war risk insurance',tags:['Iran','USA'],
   tx:'Bulk carrier Prima struck by naval mine near Musandam. Chemical tanker Louis P hit by IRGC fast boat gunfire. US Treasury explores offering government-backed war risk insurance to keep commercial shipping moving.',
   l:'https://www.ft.com',s:'Financial Times'},
  {d:'2026-03-07',cat:'military',imp:'e',t:'Israel expands ground buffer zone in southern Lebanon',tags:['Israel','Lebanon'],
   tx:'IDF seizes areas along a 10km buffer zone north of the Blue Line. Lebanese army withdraws positions. UNIFIL requests emergency reinforcements. France condemns Israeli expansion beyond agreed boundaries.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-07',cat:'general',imp:'e',t:'Houthis declare solidarity with Iran; threaten Red Sea shipping',tags:['Yemen','Iran'],
   tx:'Houthi spokesman announces "full solidarity" with Iran and readiness to target all US and Israeli-linked vessels transiting the Red Sea. Merchant shipping diverts around the Cape of Good Hope.',
   l:'https://www.aljazeera.com',s:'Al Jazeera'},
  {d:'2026-03-07',cat:'stocks',imp:'e',t:'Shipping insurance costs spike 4-6x; Lloyd\'s struggles with exposure',tags:['USA'],
   tx:'War risk premiums for Gulf transit now at 5-7% of hull value versus 0.5% pre-conflict. Lloyd\'s of London warns total market exposure in the Gulf exceeds $500B. Several syndicates suspend new policies entirely.',
   l:'https://www.ft.com',s:'Financial Times'},
  {d:'2026-03-07',cat:'aviation',imp:'e',t:'Dubai airport drone incident near Terminal 3',tags:['UAE','Iran'],
   tx:'An Iranian-origin drone is intercepted by UAE air defenses near Dubai International Airport Terminal 3. Airport operations suspended for 4 hours. GCAA issues emergency order grounding all inbound flights pending security review.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-07',cat:'diplomatic',imp:'d',t:'Doha airport allows limited repatriation flights to resume',tags:['Qatar'],
   tx:'Hamad International Airport reopens for limited evacuation flights under strict air defense coordination. Four charter flights depart for London, Manila, and Delhi. Doha maintains commercial flight ban.',
   l:'https://ops.group/blog/middle-east-airspace-current-operational-picture/',s:'OPSGROUP'},
  {d:'2026-03-07',cat:'humanitarian',imp:'e',t:'ICRC warns of "catastrophic" medical situation in western Iran',tags:['Iran'],
   tx:'Red Cross teams report hospitals in Isfahan and Shiraz overwhelmed with civilian casualties. Surgical supplies critically low. ICRC calls for humanitarian corridors to deliver medical aid.',
   l:'https://www.icrc.org',s:'ICRC'},
  {d:'2026-03-07',cat:'military',imp:'e',t:'Iran fires ballistic missile at Israeli Dimona area; intercepted',tags:['Iran','Israel'],
   tx:'Iran fires a Khorramshahr-4 MRBM targeting the Negev region near Dimona nuclear facility. Arrow-3 intercepts the missile at high altitude. Israel warns of "disproportionate response" if nuclear facilities are targeted.',
   l:'https://www.bbc.com',s:'BBC'},
  {d:'2026-03-08',d2:'2026-03-14',cat:'aviation',imp:'e',t:'GPS interference disrupts navigation across Gulf',tags:['Saudi Arabia','Oman','Jordan'],
   tx:'Widespread GPS jamming and spoofing from eastern Mediterranean to Arabian Sea. RNAV approaches unreliable.',
   l:'https://ops.group/blog/middle-east-airspace-current-operational-picture/',s:'OPSGROUP'},
  {d:'2026-03-08',d2:'2026-03-14',cat:'maritime',imp:'d',t:'Convoy system established for Hormuz transits',tags:['USA','Oman'],
   tx:'US Navy organizes first escorted convoy since 1987. Twelve tankers transit under warship escort. Iran protests violation of territorial waters.',
   l:'https://www.ft.com',s:'Financial Times'},
  {d:'2026-03-08',cat:'stocks',imp:'n',t:'Federal Reserve holds emergency meeting on oil prices',tags:['USA'],
   tx:'Fed signals readiness to act if energy shock threatens financial stability. Treasury Secretary warns of recession risk if conflict persists.',
   l:'https://www.wsj.com',s:'Wall Street Journal'},
  {d:'2026-03-08',cat:'military',imp:'n',t:'Mojtaba Khamenei emerges as likely successor to slain supreme leader',tags:['Iran'],
   tx:'Assembly of Experts convenes emergency session. Reports indicate consensus forming around Mojtaba Khamenei, son of the slain leader, as next Supreme Leader. Hardliners consolidate power amid wartime crisis.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-08',cat:'stocks',imp:'e',t:'Oil surges past $130/bbl; Iraq cuts production by two-thirds',tags:['USA','Iraq'],
   tx:'Brent crude breaks $130 as Iraq suspends most exports through Turkish pipeline. Kuwait, Saudi Arabia, and UAE consider curtailing output to preserve reserves. OPEC emergency meeting called for March 10.',
   l:'https://www.bloomberg.com',s:'Bloomberg'},
  {d:'2026-03-08',cat:'diplomatic',imp:'d',t:'UN General Assembly holds emergency special session on Iran conflict',tags:['USA','Iran'],
   tx:'UNGA convenes under "Uniting for Peace" procedure after Security Council deadlock. 141 nations vote for immediate ceasefire resolution. US, Israel cast dissenting votes. Resolution is non-binding.',
   l:'https://www.un.org',s:'UN News'},
  {d:'2026-03-08',cat:'humanitarian',imp:'e',t:'India evacuates 15,000 citizens from Gulf states in emergency airlift',tags:['UAE','Qatar','Kuwait'],
   tx:'Indian Air Force and Air India mount Operation Vande Bharat III, evacuating citizens from UAE, Qatar, Kuwait and Bahrain. Philippines, Pakistan, and Bangladesh launch similar operations. Airports overwhelmed.',
   l:'https://www.bbc.com',s:'BBC'},
  {d:'2026-03-09',d2:'2026-03-14',cat:'diplomatic',imp:'d',t:'Oman opens back-channel talks between US and Iran',tags:['Oman','USA','Iran'],
   tx:'Omani foreign minister shuttles between Washington and Tehran. Preliminary framework for de-escalation discussed.',
   l:'https://www.aljazeera.com',s:'Al Jazeera'},
  {d:'2026-03-09',d2:'2026-03-14',cat:'humanitarian',imp:'e',t:'Humanitarian crisis deepens in Iraq and Syria',tags:['Iraq','Syria'],
   tx:'UN agencies report 2.1 million displaced. Medical supplies running low. Humanitarian corridors blocked by ongoing operations.',
   l:'https://www.un.org',s:'UN News'},
  {d:'2026-03-09',cat:'maritime',imp:'e',t:'Second tanker damaged by mine near Hormuz Island',tags:['Iran'],
   tx:'Norwegian-flagged chemical tanker hits mine. All crew rescued. Lloyd\u2019s raises Hormuz war risk premium to 10% of hull value.',
   l:'https://www.ft.com',s:'Financial Times'},
  {d:'2026-03-09',cat:'military',imp:'e',t:'Iran offers "security guarantees" to nations that expel US ambassadors',tags:['Iran'],
   tx:'Iranian foreign ministry offers security guarantees to any country in the region that expels US and Israeli ambassadors. No country accepts. GCC joint statement reaffirms commitment to existing alliances.',
   l:'https://www.aljazeera.com',s:'Al Jazeera'},
  {d:'2026-03-09',cat:'stocks',imp:'e',t:'US offers government-backed war risk insurance for Gulf shipping',tags:['USA'],
   tx:'Treasury Secretary announces emergency war risk insurance program under the Terrorism Risk Insurance Act. Covers transit through Hormuz at subsidized rates to keep oil flowing. Lloyd\'s welcomes relief measure.',
   l:'https://www.wsj.com',s:'Wall Street Journal'},
  {d:'2026-03-09',cat:'military',imp:'e',t:'Israeli ground operation expands; clashes near Tyre and Nabatieh',tags:['Israel','Lebanon'],
   tx:'IDF armored divisions advance deeper into southern Lebanon. Heavy fighting near Tyre and Nabatieh. Hezbollah deploys anti-tank teams. Israeli casualties mounting. UN calls for immediate humanitarian access.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-09',cat:'general',imp:'n',t:'Hundreds of thousands rally for Mojtaba Khamenei in Tehran',tags:['Iran'],
   tx:'Massive pro-regime rallies across Tehran and other major cities as Iranians show support for new Supreme Leader Mojtaba Khamenei. State TV broadcasts crowds chanting "Death to America." Analysts debate whether turnout is genuine or orchestrated.',
   l:'https://www.aljazeera.com',s:'Al Jazeera'},
  {d:'2026-03-09',cat:'maritime',imp:'e',t:'Norwegian tanker Sola TS hits mine in Gulf of Oman',tags:['Iran'],
   tx:'Norwegian-flagged tanker Sola TS strikes a drifting mine in the Gulf of Oman, 30km east of Fujairah. Crew evacuated safely but vessel takes on water. Norway summons Iranian ambassador. 9th confirmed ship damaged by mines since conflict began.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-09',cat:'military',imp:'e',t:'Iranian drone hits Bahrain\'s Millennium Tower; woman killed',tags:['Iran','Bahrain'],
   tx:'An Iranian UAV strikes the Millennium Tower in Manama\'s Al-Seef business district overnight. One woman killed and eight injured. Bahrain calls it a "deliberate attack on civilian infrastructure." GCC issues joint condemnation.',
   l:'https://www.bbc.com',s:'BBC'},
  {d:'2026-03-09',cat:'military',imp:'e',t:'12 Iranian attack waves recorded against Israel in one day',tags:['Iran','Israel'],
   tx:'Iran launches 12 separate attack waves against Israeli territory, shifting emphasis to the northern region (58% of waves). Cluster munitions used in central Israel cause multiple casualties in Tel Aviv. Total of 186 attack waves since war began.',
   l:'https://israel-alma.org/daily-report-the-second-iran-war-march-10-2026-1800/',s:'Alma Research'},
  {d:'2026-03-09',cat:'aviation',imp:'e',t:'Iran launches 4 UAVs at Kuwait; all shot down',tags:['Iran','Kuwait'],
   tx:'Six Iranian drones launched toward Kuwait, four intercepted by Kuwaiti air defenses. Two drones malfunction over water. Kuwait Air Force F/A-18s scrambled to patrol borders.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-10',d2:'2026-03-14',cat:'aviation',imp:'e',t:'EASA extends conflict zone advisory through March 18',tags:['Iran','Iraq','Syria'],
   tx:'European Aviation Safety Agency advises all EU carriers to avoid Iran, Iraq, and Syria airspace.',
   l:'https://ops.group/blog/middle-east-airspace-current-operational-picture/',s:'OPSGROUP'},
  {d:'2026-03-10',cat:'military',imp:'e',t:'US B-2 bombers strike IRGC naval bases',tags:['USA','Iran'],
   tx:'Stealth bombers hit Bandar Abbas and Bushehr naval facilities. IRGC fast boat fleet significantly degraded.',
   l:'https://www.defense.gov',s:'DoD'},
  {d:'2026-03-10',cat:'stocks',imp:'e',t:'Dow drops below 35,000 as recession fears grow',tags:['USA'],
   tx:'Consumer confidence plunges. Retail, travel, and transportation sectors lead decline. Safe-haven assets surge \u2014 Treasury yields at 3.1%.',
   l:'https://www.bloomberg.com',s:'Bloomberg'},
  {d:'2026-03-10',cat:'military',imp:'e',t:'CENTCOM: over 5,000 targets struck in Iran since Feb 28',tags:['USA','Iran'],
   tx:'US Central Command reports more than 5,000 military targets destroyed across Iran in 11 days of sustained operations. IRGC air defense network assessed as "functionally destroyed." Iran disputes figures.',
   l:'https://www.defense.gov',s:'DoD'},
  {d:'2026-03-10',cat:'maritime',imp:'e',t:'Bulk carrier attacked near Musandam; Navy considers escort operations',tags:['Iran','Oman','USA'],
   tx:'An unnamed bulk carrier struck by anti-ship missile near Musandam peninsula. US Navy announces it is actively considering formal convoy escort operations — first since Operation Earnest Will in 1987-88.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-10',cat:'general',imp:'e',t:'Bahrain woman killed as missile debris hits residential building',tags:['Bahrain','Iran'],
   tx:'A 29-year-old woman killed and eight injured when debris from intercepted Iranian missile strikes a residential building in Manama. Bahrain\'s interior ministry demands Iran be held accountable.',
   l:'https://www.bbc.com',s:'BBC'},
  {d:'2026-03-10',cat:'military',imp:'e',t:'40+ killed in eastern Tehran residential building strike',tags:['USA','Israel','Iran'],
   tx:'Strikes destroy a multi-story residential building in eastern Tehran. Iranian media reports over 40 civilian deaths. IDF claims the building housed an IRGC command node. International condemnation intensifies. Red Crescent deploys search and rescue teams.',
   l:'https://www.aljazeera.com',s:'Al Jazeera'},
  {d:'2026-03-10',cat:'military',imp:'e',t:'Second IRGC flagship vessel destroyed at Bandar Abbas port',tags:['USA','Iran'],
   tx:'A Shahid Soleimani-class corvette is destroyed in US strikes at Bandar Abbas port. CENTCOM reports total of 50+ Iranian naval vessels damaged or destroyed since Feb 28. Iran\'s conventional navy effectively neutralized.',
   l:'https://israel-alma.org/daily-report-the-second-iran-war-march-10-2026-1800/',s:'Alma Research'},
  {d:'2026-03-10',cat:'diplomatic',imp:'d',t:'France announces "defensive" operation to open Strait of Hormuz',tags:['France','Iran'],
   tx:'French President Macron announces France and allies will conduct a defensive maritime operation to escort tankers through Hormuz. French navy deploys frigate and minesweeper from Djibouti base. UK confirms participation.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-10',cat:'military',imp:'e',t:'IDF strikes 6 Iranian military airfields; 16 transport aircraft destroyed',tags:['Israel','Iran'],
   tx:'Israeli Air Force hits six military airfields across Iran. 16 Quds Force transport aircraft used for weapons and cash transfers to proxies are destroyed on the ground. Since Feb 28, approximately 1,900 regime personnel killed per IDF count.',
   l:'https://israel-alma.org/daily-report-the-second-iran-war-march-10-2026-1800/',s:'Alma Research'},
  {d:'2026-03-10',cat:'diplomatic',imp:'d',t:'Egypt condemns Iranian attacks on Arab states',tags:['Egypt','Iran'],
   tx:'Egyptian President Sisi condemns Iranian missile and drone strikes against Arab nations, calling for regional de-escalation. Egypt offers Cairo as venue for ceasefire negotiations. Arab League holds emergency session.',
   l:'https://www.aljazeera.com',s:'Al Jazeera'},
  {d:'2026-03-11',cat:'military',imp:'n',t:'Iran claims to have captured US drone over Gulf',tags:['Iran','USA'],
   tx:'IRGC displays what it says is a downed MQ-9 Reaper. Pentagon confirms loss of unmanned aircraft but denies Iranian airspace violation.',
   l:'https://www.cnn.com',s:'CNN'},
  {d:'2026-03-11',cat:'diplomatic',imp:'d',t:'China suspends arms sales to Iran under pressure',tags:['Iran'],
   tx:'Beijing suspends military equipment transfers after private US diplomatic pressure. Significant shift in Chinese neutrality stance.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-11',cat:'general',imp:'e',t:'Cyberattacks hit Gulf financial infrastructure',tags:['UAE','Saudi Arabia','Bahrain'],
   tx:'Coordinated cyberattacks disrupt banking systems across Gulf states. Attributed to Iranian-linked APT groups. Dubai exchange halted for 90 minutes.',
   l:'https://www.bbc.com',s:'BBC'},
  {d:'2026-03-11',cat:'maritime',imp:'e',t:'Five ships attacked in single day; IRGC patrol boat sunk',tags:['Iran','USA'],
   tx:'In the most active maritime day of the conflict, ships Mayuree Naree, One Majesty, Star Gwyneth, Safesea Vishnu, and Zefyros all report attacks. US Navy sinks an IRGC fast attack craft after it fires on escort group.',
   l:'https://www.ft.com',s:'Financial Times'},
  {d:'2026-03-11',cat:'military',imp:'e',t:'Mojtaba Khamenei formally chosen as Iran\'s new supreme leader',tags:['Iran'],
   tx:'Assembly of Experts confirms Mojtaba Khamenei as Iran\'s third Supreme Leader. Hardliners rally behind him. He vows to continue the war "until final victory." Western analysts see consolidation of IRGC power.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-11',cat:'military',imp:'e',t:'Iraq pro-Iran militias launch first strikes at US forces in Baghdad',tags:['Iraq','Iran','USA'],
   tx:'Iranian-backed Popular Mobilisation Forces fire rockets at US positions near Baghdad International Airport. Two rockets intercepted; one impacts near runway. Iraq government demands all parties stop using Iraqi territory.',
   l:'https://www.aljazeera.com',s:'Al Jazeera'},
  {d:'2026-03-11',cat:'stocks',imp:'e',t:'Global supply chains fracturing; container rates double',tags:['USA'],
   tx:'Container shipping rates from Asia to Europe double as vessels reroute around the Cape of Good Hope. Factory shutdowns reported in Japan, South Korea due to delayed raw materials. WTO warns of "trade shock."',
   l:'https://www.bloomberg.com',s:'Bloomberg'},
  {d:'2026-03-12',cat:'aviation',imp:'e',t:'Southern bypass route under increasing strain',tags:['Saudi Arabia','Oman','Egypt'],
   tx:'Egypt-Saudi-Oman corridor heavily congested. Saudi reports route-level military closures concentrating traffic onto fewer airways.',
   l:'https://info.expeditors.com/operational-impact/middle-east-tension-escalation-march-12-2026',s:'Expeditors'},
  {d:'2026-03-12',cat:'maritime',imp:'d',t:'US Navy clears 8 mines from western Hormuz approach',tags:['USA','Iran'],
   tx:'Minesweeping operations accelerate. Western approach to Gulf declared safe for escorted convoys. Eastern channel still mined.',
   l:'https://www.defense.gov',s:'DoD'},
  {d:'2026-03-12',cat:'stocks',imp:'d',t:'Oil retreats to $118 on SPR release and Oman talks',tags:['USA'],
   tx:'US releases 30M barrels from Strategic Petroleum Reserve. Markets rally modestly on diplomatic progress. S&P 500 recovers 1.8%.',
   l:'https://www.wsj.com',s:'Wall Street Journal'},
  {d:'2026-03-12',cat:'diplomatic',imp:'d',t:'Oman framework gains traction for ceasefire',tags:['Oman','USA','Iran'],
   tx:'Both sides accept Muscat as venue for formal talks. 72-hour maritime truce proposed. Iran demands US carrier withdrawal as precondition.',
   l:'https://www.aljazeera.com',s:'Al Jazeera'},
  {d:'2026-03-12',cat:'military',imp:'e',t:'Israel launches massive air campaign on Hezbollah in Beqaa Valley',tags:['Israel','Lebanon'],
   tx:'IAF conducts over 120 strikes on Hezbollah positions in Lebanon\'s Beqaa Valley, targeting weapons storage and supply routes from Syria. Lebanon health ministry reports 89 killed in 24 hours. Beirut hospitals at capacity.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-12',cat:'general',imp:'e',t:'Source Blessing oil tanker attacked; Iran at 21 confirmed ship strikes',tags:['Iran'],
   tx:'Liberian-flagged tanker Source Blessing struck by anti-ship missile near Strait of Hormuz. Total confirmed ship attacks by IRGC reaches 21 since war began. Maritime industry calls situation "unprecedented."',
   l:'https://www.ft.com',s:'Financial Times'},
  {d:'2026-03-12',cat:'military',imp:'e',t:'Israeli strikes hit Tehran nuclear development compound',tags:['Israel','Iran'],
   tx:'IDF launches "large scale" strikes on central Tehran targeting a compound used for nuclear weapons development. IRGC Quds Force headquarters also hit. Tehran air defense systems activated but unable to prevent strikes.',
   l:'https://www.nytimes.com/live/2026/03/12/world/iran-war-news-trump-oil-israel',s:'New York Times'},
  {d:'2026-03-12',cat:'diplomatic',imp:'e',t:'Trump lifts sanctions on Russian oil at sea to ease energy crisis',tags:['USA','Russia'],
   tx:'Treasury issues temporary authorization allowing countries to purchase Russian oil currently stranded at sea. Estimated 130 million barrels freed. Critics say it effectively destroys Russia oil sanctions regime built since 2022 Ukraine invasion.',
   l:'https://www.nytimes.com/live/2026/03/12/world/iran-war-news-trump-oil-israel',s:'New York Times'},
  {d:'2026-03-12',cat:'humanitarian',imp:'e',t:'Lebanon death toll exceeds 700; 800,000 displaced',tags:['Lebanon','Israel'],
   tx:'Lebanese officials report over 700 killed including 70 on this day alone. More than 800,000 displaced, including 200,000 children. War Child reports 1 in 10 Lebanese children now displaced. UNRWA warns of humanitarian catastrophe.',
   l:'https://www.aljazeera.com',s:'Al Jazeera'},
  {d:'2026-03-12',cat:'military',imp:'e',t:'French soldier killed by drone at Kurdish base in Iraq',tags:['France','Iraq'],
   tx:'Staff Sgt Arnaud Frion killed and six others wounded when a drone strikes a French military training base in Erbil region, Iraq. Macron condemns the attack: "The war in Iran cannot justify such attacks." First French military death in the conflict.',
   l:'https://www.bbc.com/news/articles/cy0dz5ql17vo',s:'BBC'},
  {d:'2026-03-12',cat:'stocks',imp:'e',t:'Oil ends week at $103/bbl; 40% gain since war began',tags:['USA'],
   tx:'Brent crude settles at $103.14/bbl, highest since August 2022. Weekly gain of 11%. Gas prices reach $3.63/gallon nationally, up 22% since war began. Diesel at $4.89, up 30%. S&P 500 falls for third straight week.',
   l:'https://www.nytimes.com/live/2026/03/12/world/iran-war-news-trump-oil-israel',s:'New York Times'},
  {d:'2026-03-13',cat:'military',imp:'e',t:'Hezbollah launches largest rocket barrage at Israel',tags:['Israel','Lebanon'],
   tx:'350+ rockets fired from southern Lebanon. Iron Dome overwhelmed in northern sectors. Israel retaliates with strikes on Beirut suburbs.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-13',cat:'general',imp:'e',t:'Global food prices spike on shipping disruption',tags:['USA'],
   tx:'Wheat futures up 28%, rice up 15%. Gulf port closures disrupt fertilizer exports. UN warns of food security crisis in developing nations.',
   l:'https://www.bbc.com',s:'BBC'},
  {d:'2026-03-13',cat:'maritime',imp:'e',t:'Iran deploys new batch of mines overnight',tags:['Iran'],
   tx:'Satellite imagery shows fresh mine-laying activity near Larak Island. Nullifies three days of US clearing operations. Convoy route shifted.',
   l:'https://www.ft.com',s:'Financial Times'},
  {d:'2026-03-13',cat:'stocks',imp:'n',t:'Defense stocks hit all-time highs',tags:['USA'],
   tx:'Raytheon, Northrop Grumman, General Dynamics at record valuations. Lockheed Martin up 28% since Feb 28. Travel stocks at 2-year lows.',
   l:'https://www.bloomberg.com',s:'Bloomberg'},
  {d:'2026-03-13',cat:'military',imp:'e',t:'US refueling aircraft crashes in western Iraq; 6 crew killed',tags:['USA','Iraq'],
   tx:'A US KC-135 Stratotanker crashes during operations in western Iraq. All six crew members killed. CENTCOM says cause under investigation; does not attribute to hostile fire. Total US deaths at 13.',
   l:'https://www.defense.gov',s:'DoD'},
  {d:'2026-03-13',cat:'diplomatic',imp:'d',t:'Turkey proposes humanitarian corridor for Hormuz oil shipments',tags:['Turkey','Iran'],
   tx:'Turkish President Erdogan proposes a "humanitarian maritime corridor" allowing oil tankers to transit Hormuz under Turkish naval escort with Iranian consent. Iran signals openness; US skeptical of bypassing sanctions.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-13',cat:'military',imp:'e',t:'Iran claims militia shot down KC-135; Pentagon disputes',tags:['Iran','Iraq','USA'],
   tx:'Iran\'s military claims on state TV that an allied militia group targeted the crashed KC-135 with a missile. Pentagon insists neither hostile nor friendly fire was involved. Investigation into possible midair collision with second aircraft continues.',
   l:'https://www.bbc.com/news/articles/cy0dz5ql17vo',s:'BBC'},
  {d:'2026-03-13',cat:'military',imp:'e',t:'Netanyahu: "creating conditions for regime overthrow" but can\'t guarantee it',tags:['Israel','Iran'],
   tx:'In a press conference, Netanyahu says Israel is "creating optimal conditions" for regime change in Iran but acknowledges "a regime is toppled from within." Adds that even without overthrow, Iran will be "much weaker."',
   l:'https://www.nytimes.com/live/2026/03/12/world/iran-war-news-trump-oil-israel',s:'New York Times'},
  {d:'2026-03-13',cat:'diplomatic',imp:'n',t:'Lebanon PM Salam: "Lebanon will not be arena for wars of others"',tags:['Lebanon'],
   tx:'Lebanese PM Nawaf Salam delivers televised address during Israeli airstrikes on central Beirut. Warns Lebanon cannot accept being a battleground for foreign powers. Calls for Hezbollah disarmament under Lebanese Army supervision.',
   l:'https://www.aljazeera.com',s:'Al Jazeera'},
  {d:'2026-03-13',cat:'humanitarian',imp:'e',t:'Iran death toll exceeds 1,348 civilians; 3.2 million displaced',tags:['Iran'],
   tx:'Iran\'s UN representative tells Security Council that over 1,348 civilians have been killed. UNHCR preliminary assessment puts internal displacement at 3.2 million. Red Crescent reports aid workers injured in strikes on Tehran-Qom highway.',
   l:'https://www.nytimes.com/live/2026/03/12/world/iran-war-news-trump-oil-israel',s:'New York Times'},
  {d:'2026-03-13',cat:'diplomatic',imp:'d',t:'Russia sends 13 tons of medicine to Iran via Azerbaijan',tags:['Russia','Iran','Azerbaijan'],
   tx:'Russia airlifts over 13 metric tons of medicine to Azerbaijan for land transfer to Iran, first announced Russian aid shipment since strikes began. Putin congratulates Mojtaba Khamenei and pledges solidarity with Iran.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-14',cat:'aviation',imp:'e',t:'Airspace closures persist across five countries',tags:['Iran','Iraq','Syria','Bahrain','Kuwait'],
   tx:'Iran, Iraq, Syria, Bahrain, Kuwait airspace remain fully closed. No diplomatic progress on aviation. EASA advisory in effect through March 18.',
   l:'https://ops.group/blog/middle-east-airspace-current-operational-picture/',s:'OPSGROUP'},
  {d:'2026-03-14',cat:'aviation',imp:'e',t:'GPS interference widespread from Riyadh to Oman',tags:['Saudi Arabia','Oman','Jordan'],
   tx:'GPS jamming and spoofing reported across the region. Operators advised to prepare for degraded navigation.',
   l:'https://ops.group/blog/middle-east-airspace-current-operational-picture/',s:'OPSGROUP'},
  {d:'2026-03-14',cat:'maritime',imp:'d',t:'US 5th Fleet reports Hormuz partially cleared',tags:['USA','Iran'],
   tx:'Western approach lane reopened under escort. 18 mines cleared total. Eastern lane remains contested. Daily convoy capacity at 40% of normal.',
   l:'https://www.defense.gov',s:'DoD'},
  {d:'2026-03-14',cat:'diplomatic',imp:'d',t:'Ceasefire talks begin in Muscat',tags:['Oman','USA','Iran'],
   tx:'Formal negotiations open at Omani foreign ministry. Agenda includes maritime de-escalation, POW exchange, and nuclear inspections timeline.',
   l:'https://www.reuters.com',s:'Reuters'},
  {d:'2026-03-14',cat:'stocks',imp:'d',t:'Markets rally on ceasefire talk hopes',tags:['USA'],
   tx:'S&P 500 up 2.4%. Oil falls to $112/bbl. Airline stocks recover 8%. Market still down 9% from pre-conflict levels overall.',
   l:'https://www.bloomberg.com',s:'Bloomberg'},
  {d:'2026-03-14',cat:'humanitarian',imp:'e',t:'Conflict death toll exceeds 1,200 across region',tags:['Iran','Israel','Iraq','Syria','USA'],
   tx:'Combined military and civilian casualties surpass 1,200. Heaviest losses in Iran and Syria. US reports 14 service members killed in action.',
   l:'https://www.bbc.com',s:'BBC'},

  {d:'2026-03-15',cat:'military',imp:'e',t:'Israel launches new wave of airstrikes on Iran; 7,000+ strikes since war began',tags:['Israel','Iran'],
   tx:'Israeli Air Force conducts fresh strikes on western Iran. IDF says it has hit over 7,000 targets since Feb 28 and plans at least three more weeks of campaign through Passover.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-15-26',s:'CNN'},
  {d:'2026-03-15',cat:'military',imp:'e',t:'Iran launches missiles at Israel; air-raid sirens across Tel Aviv',tags:['Iran','Israel'],
   tx:'Iranian missiles set off air-raid sirens across greater Tel Aviv. One man hospitalized from shattered glass. IRGC says it launched "50th wave" of operations against US bases in UAE, Bahrain & Kuwait.',
   l:'https://www.nytimes.com/live/2026/03/15/world/iran-war-trump-oil-israel',s:'NYT'},
  {d:'2026-03-15',cat:'military',imp:'e',t:'US-Israeli strike kills 15 at Isfahan factory',tags:['Iran','USA','Israel'],
   tx:'Early-morning strikes hit industrial zone in Isfahan, killing at least 15 people. Iran death toll now exceeds 1,348 civilians. Over 10,000 homes damaged or destroyed in Tehran alone.',
   l:'https://www.aljazeera.com/news/2026/3/15/iran-war-what-is-happening-on-day-16-of-us-israel-attacks',s:'Al Jazeera'},
  {d:'2026-03-15',cat:'maritime',imp:'e',t:'Iran FM: Strait of Hormuz "open to everyone except America and allies"',tags:['Iran','USA'],
   tx:'Foreign Minister Araghchi says strait open to non-US-allied ships, but since most oil comes from US allies, it is effectively closed. IRGC warns "any attempt to move or transit will be targeted."',
   l:'https://www.nytimes.com/live/2026/03/15/world/iran-war-trump-oil-israel',s:'NYT'},
  {d:'2026-03-15',cat:'diplomatic',imp:'d',t:'Trump calls for international naval coalition to secure Strait of Hormuz',tags:['USA','Iran','UK','France'],
   tx:'Trump urges Britain, France, China, Japan, South Korea to send warships. Threatens to strike Kharg Island oil terminal if Iran blocks shipping. UK says it is exploring "any options" to help.',
   l:'https://www.nytimes.com/live/2026/03/15/world/iran-war-trump-oil-israel',s:'NYT'},
  {d:'2026-03-15',cat:'military',imp:'e',t:'Saudi Arabia intercepts drones over Riyadh and missiles near al-Kharj',tags:['Saudi Arabia','Iran'],
   tx:'Four drones intercepted in Riyadh area. Six ballistic missiles targeting al-Kharj destroyed. Two additional drones intercepted in Eastern Province. At least 14 killed and 12 injured since conflict began.',
   l:'https://www.aljazeera.com/news/2026/3/15/iran-war-what-is-happening-on-day-16-of-us-israel-attacks',s:'Al Jazeera'},
  {d:'2026-03-15',cat:'military',imp:'e',t:'IRGC launches 10 missiles and drones at al-Dhafra airbase in UAE',tags:['UAE','Iran'],
   tx:'IRGC claims attack on US forces at al-Dhafra. Dubai Marina and Al Sufouh interceptions confirmed. Fujairah oil facility damaged by drone debris. Abu Dhabi accuses Iran of "moral bankruptcy."',
   l:'https://www.aljazeera.com/news/2026/3/15/iran-war-what-is-happening-on-day-16-of-us-israel-attacks',s:'Al Jazeera'},
  {d:'2026-03-15',cat:'aviation',imp:'e',t:'Kuwait airport radar damaged by drone strikes; missiles hit al-Jaber airbase',tags:['Kuwait','Iran'],
   tx:'Drones struck Kuwait international airport facilities, damaging part of its radar system. Two missiles hit the perimeter of Ahmad al-Jaber airbase, wounding three soldiers.',
   l:'https://www.aljazeera.com/news/2026/3/15/iran-war-what-is-happening-on-day-16-of-us-israel-attacks',s:'Al Jazeera'},
  {d:'2026-03-15',cat:'aviation',imp:'n',t:'UAE airlines operating reduced schedules; passengers advised to check bookings',tags:['UAE'],
   tx:'Emirates, Etihad, flydubai and Air Arabia operating limited flights from DXB and AUH. Tickets issued before Feb 28 can be rebooked free. Online check-in suspended until March 21.',
   l:'https://gulfnews.com/business/aviation/uae-flight-status-march-15-latest-schedules-destinations-rebooking-1.500474938',s:'Gulf News'},
  {d:'2026-03-15',cat:'diplomatic',imp:'n',t:'State Department orders departure from Oman due to safety risks',tags:['Oman','USA'],
   tx:'Nonessential US government employees and all family members ordered to leave Oman after Iranian missiles/drones hit sites in the country. Oman remains open for commercial aviation.',
   l:'https://www.nytimes.com/live/2026/03/15/world/iran-war-trump-oil-israel',s:'NYT'},
  {d:'2026-03-15',cat:'stocks',imp:'e',t:'Gas prices up 25% as oil crisis deepens; Brent above $120/bbl',tags:['USA'],
   tx:'US gasoline prices up 25% on average per AAA. Brent crude peaked at $126/bbl. Trump eases sanctions on some Russian oil but markets unmoved. Qatar Grand Prix postponed to November.',
   l:'https://www.nytimes.com/live/2026/03/15/world/iran-war-trump-oil-israel',s:'NYT'},
  {d:'2026-03-15',cat:'general',imp:'e',t:'Iran death toll: 1,348+ civilians; 13 US service members killed',tags:['Iran','USA','Israel','Lebanon'],
   tx:'Iran reports 1,348+ civilian deaths and 10,000+ homes damaged. Lebanon reports 826 killed. Israel reports 12 killed. Pentagon identifies 6 crew from Thursday\'s refueling aircraft crash in Iraq.',
   l:'https://www.nytimes.com/live/2026/03/15/world/iran-war-trump-oil-israel',s:'NYT'},

  // === MARCH 16 === Day 17 of conflict
  {d:'2026-03-16',cat:'military',imp:'e',t:'Israel launches "wide-scale" strikes on Tehran, Shiraz and Tabriz',tags:['Israel','Iran'],
   tx:'IDF says it launched simultaneous strikes targeting infrastructure across three Iranian cities. Overnight strikes also destroyed aircraft used by Iran\'s late supreme leader at Mehrabad airport. IDF says operational plans extend "three more weeks."',
   l:'https://www.theguardian.com/world/live/2026/mar/16/iran-war-live-updates-news-oil-trump-hormuz-dubai-airport-israel-targets',s:'Guardian'},
  {d:'2026-03-16',cat:'military',imp:'e',t:'Israel expands ground offensive in southern Lebanon against Hezbollah',tags:['Israel','Lebanon'],
   tx:'Defense minister Katz announces "ground maneuver" in southern Lebanon. Hundreds of thousands of people evacuated. Israel rebuffs Lebanese and French de-escalation initiatives.',
   l:'https://www.nytimes.com/live/2026/03/16/world/iran-war-trump-oil-lebanon',s:'NYT'},
  {d:'2026-03-16',cat:'military',imp:'e',t:'CENTCOM: Kharg Island strike destroyed 90+ targets including mine bunkers',tags:['USA','Iran'],
   tx:'Adm. Brad Cooper says Friday\'s strike on Iran\'s oil export hub destroyed bunkers for naval mines and missiles. Over 6,000 US combat missions flown in 16 days. Iran has launched 300+ attacks on a dozen countries.',
   l:'https://www.nytimes.com/live/2026/03/16/world/iran-war-trump-oil-lebanon',s:'NYT'},
  {d:'2026-03-16',cat:'military',imp:'e',t:'Iran-allied militia strikes US target in Baghdad; Iraq says both intercepted',tags:['Iraq','Iran','USA'],
   tx:'Pro-Iranian Popular Mobilisation Forces launch two strikes at US targets in Baghdad. Iraqi military says both intercepted. Separate air raid hits PMF headquarters in Jurf al-Sakhar, injuring three.',
   l:'https://www.nytimes.com/live/2026/03/16/world/iran-war-trump-oil-lebanon',s:'NYT'},
  {d:'2026-03-16',cat:'aviation',imp:'e',t:'Drone strike hits fuel tank near Dubai airport; flights temporarily suspended',tags:['UAE','Iran'],
   tx:'Fire from drone-related incident near OMDB/Dubai damages fuel storage tank. Airport temporarily closed, then resumes limited operations. Emirates resumes reduced schedule with some routes cancelled for the day.',
   l:'https://www.aljazeera.com/news/2026/3/16/iran-war-what-is-happening-on-day-17-of-us-israel-attacks',s:'Al Jazeera'},
  {d:'2026-03-16',cat:'aviation',imp:'n',t:'OPSGROUP: BizAv access to Tel Aviv may be easing; PPR applications accepted',tags:['Israel'],
   tx:'Local handler reports BizAv operators can again apply for PPR approval at LLBG/Tel Aviv. Slots remain extremely limited with priority for emergency and state flights. Current NOTAM runs to March 23.',
   l:'https://ops.group/blog/middle-east-airspace-current-operational-picture/',s:'OPSGROUP'},
  {d:'2026-03-16',cat:'military',imp:'e',t:'Missile hits vehicle in Abu Dhabi, killing one Palestinian resident',tags:['UAE','Iran'],
   tx:'A missile struck a civilian vehicle in Abu Dhabi, killing one Palestinian resident. UAE defense ministry says Iran has launched nearly 2,000 projectiles at the country since the war began, killing 7 including 5 civilians.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-16-26',s:'CNN'},
  {d:'2026-03-16',cat:'military',imp:'n',t:'Saudi Arabia intercepts 37 drones over eastern provinces',tags:['Saudi Arabia','Iran'],
   tx:'Saudi Arabia reports intercepting 37 drones over its eastern region. Crown Prince MBS and UAE President discuss regional developments, affirm GCC will continue defending territories.',
   l:'https://www.aljazeera.com/news/2026/3/16/iran-war-what-is-happening-on-day-17-of-us-israel-attacks',s:'Al Jazeera'},
  {d:'2026-03-16',cat:'military',imp:'n',t:'Fujairah industrial zone hit by drone strike; fire breaks out',tags:['UAE','Iran'],
   tx:'Drone strike sparks fire at an industrial zone in Fujairah. Bahrain, Kuwait and Qatar also report drone interceptions overnight.',
   l:'https://www.aljazeera.com/news/2026/3/16/iran-war-what-is-happening-on-day-17-of-us-israel-attacks',s:'Al Jazeera'},
  {d:'2026-03-16',cat:'diplomatic',imp:'d',t:'EU foreign ministers meet on Hormuz; Kallas proposes Black Sea grain deal model',tags:['Iran','USA'],
   tx:'EU foreign policy chief Kaja Kallas proposes replicating the Black Sea grain initiative for Hormuz oil transit. Warns of food shortages from fertilizer disruption. France sending two frigates to boost Operation Aspides.',
   l:'https://www.theguardian.com/world/live/2026/mar/16/iran-war-live-updates-news-oil-trump-hormuz-dubai-airport-israel-targets',s:'Guardian'},
  {d:'2026-03-16',cat:'diplomatic',imp:'n',t:'European allies resist Trump\'s demand to send warships to Hormuz',tags:['USA'],
   tx:'Germany: "This is not our war; we did not start it." Greece, Italy, Luxembourg all decline. UK\'s Starmer says working on "viable plan" but won\'t be "drawn into wider war." No countries have committed warships.',
   l:'https://www.nytimes.com/live/2026/03/16/world/iran-war-trump-oil-lebanon',s:'NYT'},
  {d:'2026-03-16',cat:'maritime',imp:'d',t:'First non-Iranian tanker transits Hormuz with AIS broadcasting',tags:['Iran'],
   tx:'Pakistan-flagged tanker Karachi, carrying Abu Dhabi crude, becomes first non-Iranian cargo to transit the strait while broadcasting AIS. Iran FM thanks Pakistan for solidarity, says strait closed only to US/Israel allies.',
   l:'https://www.theguardian.com/world/live/2026/mar/16/iran-war-live-updates-news-oil-trump-hormuz-dubai-airport-israel-targets',s:'Guardian'},
  {d:'2026-03-16',cat:'stocks',imp:'e',t:'Brent crude hits $106; IEA calls it "largest supply disruption in history"',tags:['USA'],
   tx:'Oil prices briefly touch $106/bbl. IEA says 400M barrel reserve release will be absorbed in 26 days at current disruption rate. US gas prices at highest since Oct 2023. EU energy ministers meeting on costs.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-16-26',s:'CNN'},
  {d:'2026-03-16',cat:'diplomatic',imp:'n',t:'Trump threatens to delay China summit if Beijing won\'t help on Hormuz',tags:['USA'],
   tx:'Trump tells FT it would be "very bad for NATO" if allies don\'t help. Suggests delaying Xi summit. Treasury Sec. Bessent says delay would be logistical, not pressure. China says "maintained communication" on visit.',
   l:'https://www.nytimes.com/live/2026/03/16/world/iran-war-trump-oil-lebanon',s:'NYT'},
  {d:'2026-03-16',cat:'general',imp:'e',t:'Iran death toll rises to 1,444; 18,551 injured; 12,000 Tehran homes damaged',tags:['Iran','USA','Israel','Lebanon'],
   tx:'Iran reports 1,444 killed and 18,551 injured since war began. 12,000 residential units in Tehran damaged. Lebanon reports 850 killed. Israel: 12 killed. Pentagon: 13 US service members killed.',
   l:'https://www.aljazeera.com/news/2026/3/16/iran-war-what-is-happening-on-day-17-of-us-israel-attacks',s:'Al Jazeera'},
  {d:'2026-03-16',cat:'military',imp:'n',t:'IRGC says most weapons cache intact; war using "decade-old" missiles',tags:['Iran'],
   tx:'IRGC spokesperson says missiles used in the war are from a decade ago and Iran has not yet deployed newer missiles produced since the 12-day war with Israel. Claims most weapons remain intact.',
   l:'https://www.aljazeera.com/news/2026/3/16/iran-war-what-is-happening-on-day-17-of-us-israel-attacks',s:'Al Jazeera'},
  {d:'2026-03-16',cat:'diplomatic',imp:'n',t:'UAE "doubling down" on US ties; vows not to be bullied by Iran',tags:['UAE','USA'],
   tx:'UAE Minister Al-Hashimy says Iran\'s attacks are "almost unhinged" and the UAE is further cementing ties with the US and Israel. UAE has intercepted vast majority of nearly 2,000 Iranian projectiles.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-16-26',s:'CNN'},
  {d:'2026-03-16',cat:'military',imp:'e',t:'Israeli troops advance toward Bint Jbeil; encircle Khiam in southern Lebanon',tags:['Israel','Lebanon'],
   tx:'Three IDF divisions operating in southern Lebanon with two more expected. Troops encircle key town of Khiam and advance west toward the Litani River. Clashes near Khiam, Aadaysit Marjayoun and Taybeh.',
   l:'https://www.reuters.com/world/middle-east/israel-says-troops-launch-limited-operations-against-hezbollah-south-lebanon-2026-03-16/',s:'Reuters'},
  {d:'2026-03-16',cat:'military',imp:'n',t:'Qatar intercepts two waves of Iranian missiles in single day',tags:['Qatar','Iran'],
   tx:'Qatar defense ministry reports successfully intercepting a second wave of missile attacks, following an earlier salvo. No damage reported from impacts or interceptor debris.',
   l:'https://www.cbsnews.com/live-updates/iran-war-oil-prices-strait-of-hormuz-trump-threat-kharg-island/',s:'CBS'},
  {d:'2026-03-16',cat:'military',imp:'n',t:'Missile interceptor debris hits buildings in East Jerusalem; no casualties',tags:['Israel','Iran'],
   tx:'Israeli emergency services respond to multiple sites in East Jerusalem where interceptor fragments from Iranian missile engagement struck residential buildings in Silwan neighborhood.',
   l:'https://www.cbsnews.com/live-updates/iran-war-oil-prices-strait-of-hormuz-trump-threat-kharg-island/',s:'CBS'},
  {d:'2026-03-16',cat:'maritime',imp:'d',t:'India confirms two LPG tankers transited Hormuz safely after freeing Iranian ships',tags:['Iran'],
   tx:'India released three seized Iranian oil tankers in exchange for safe passage of two Indian LPG tankers through Hormuz. India FM Jaishankar: "Diplomacy has yielded results." Turkey also got one ship through with Iranian permission.',
   l:'https://www.aljazeera.com/economy/2026/3/16/strait-of-hormuz-which-countriess-ships-has-iran-allowed-safe-passage-to',s:'Al Jazeera'},
  {d:'2026-03-16',cat:'maritime',imp:'n',t:'Iran still exporting ~1M barrels/day through Hormuz despite war',tags:['Iran'],
   tx:'Kpler estimates Iran exported 12M barrels since war began. Kharg Island oil infrastructure intact after Friday\'s military-only strike. Six Iranian VLCCs operating with transponders off. Iran ramped exports to 2.04M bpd in Feb anticipating strikes.',
   l:'https://www.cnn.com/2026/03/16/business/iranian-oil-exports-hormuz-strait-intl-cmd',s:'CNN'},
  {d:'2026-03-16',cat:'diplomatic',imp:'n',t:'Trump: war "won\'t be long"; oil will "drop like a rock" when it ends',tags:['USA','Iran'],
   tx:'Trump tells PBS the war won\'t last long and oil prices will plummet after. White House confirms China summit may be delayed. Press secretary: allies "benefiting greatly" from US taking out Iran threat.',
   l:'https://www.cbsnews.com/live-updates/iran-war-oil-prices-strait-of-hormuz-trump-threat-kharg-island/',s:'CBS'},
  {d:'2026-03-16',cat:'stocks',imp:'d',t:'Brent crude eases to $102 as S&P 500 rebounds 1%; diesel near $5/gal',tags:['USA'],
   tx:'Brent crude pulls back from $106 peak to ~$102/bbl. S&P 500 up 1% recouping last week\'s losses. US gas at $3.72/gal (+25% since war). Diesel at $4.99/gal (+33%). IEA chief says more stock releases possible "as and if needed."',
   l:'https://www.nytimes.com/2026/03/16/business/oil-stock-gas-markets-iran.html',s:'NYT'},
  {d:'2026-03-16',cat:'military',imp:'n',t:'Greece approves €4B air defense and F-16 upgrade amid regional tensions',tags:['Turkey'],
   tx:'Greek parliament approves €3B multi-layer air and drone defense system plus upgrade of 38 F-16 jets, total ~€4B. Largest Greek defense purchase in years, driven by regional instability.',
   l:'https://www.reuters.com/world/europe/greece-approves-purchase-air-defence-system-upgrade-f-16-jets-2026-03-16/',s:'Reuters'},
  {d:'2026-03-16',cat:'humanitarian',imp:'e',t:'Lebanon death toll rises to 886 including 107 children; over 1 million displaced',tags:['Lebanon','Israel'],
   tx:'Lebanese health ministry updates toll to 886 killed including 38 health workers and 107 children. Over 1 million displaced — one in six Lebanese residents. Israel strikes kill 7 Monday including 2 children and 2 paramedics. UN calls for immediate ceasefire.',
   l:'https://www.bbc.com/news/articles/clyz78kgp22o',s:'BBC'},
  {d:'2026-03-16',cat:'general',imp:'n',t:'Pope Leo XIV calls on media to "show the face of war" and resist propaganda',tags:['Iran','USA','Israel'],
   tx:'First American pope urges journalists to verify news and tell stories "through the eyes of victims." Notes Iran has largely cut off internet access and UAE has banned sharing images of strike damage.',
   l:'https://www.cbsnews.com/live-updates/iran-war-oil-prices-strait-of-hormuz-trump-threat-kharg-island/',s:'CBS'},
  {d:'2026-03-16',cat:'military',imp:'e',t:'ADNOC suspends Shah gas field operations after drone strike near Abu Dhabi',tags:['UAE','Iran'],
   tx:'Iranian-launched drones strike near ADNOC\'s Shah sour gas processing facility, 210 km southeast of Abu Dhabi. Company suspends operations and evacuates non-essential staff. Shah processes 1.28 bcf/day — roughly 20% of UAE gas output. No casualties reported but infrastructure damage under assessment.',
   l:'https://www.reuters.com/business/energy/uae-adnoc-suspends-shah-gas-field-operations-after-drone-attack-2026-03-16/',s:'Reuters'},
  {d:'2026-03-16',cat:'military',imp:'e',t:'IRGC warns all US-linked industrial facilities across region will be targeted',tags:['Iran','USA','UAE','Saudi Arabia'],
   tx:'IRGC issues statement declaring any facility "serving American strategic interests" is a legitimate military target. Specifically names oil infrastructure, logistics hubs, and military-adjacent industrial zones in UAE, Bahrain, and Saudi Arabia. Pentagon calls threat "reckless escalation against civilian infrastructure."',
   l:'https://www.cnn.com/2026/03/16/middleeast/irgc-threatens-us-linked-facilities/',s:'CNN'},
  {d:'2026-03-16',cat:'military',imp:'e',t:'Over 200 US troops wounded across 7 countries since conflict began',tags:['USA','Iraq','Syria','Jordan','Bahrain'],
   tx:'CENTCOM updates total US military casualties: 13 killed and more than 200 wounded across operations in Iraq, Syria, Jordan, Bahrain, UAE, Qatar, and at sea. Injuries range from blast concussions to shrapnel wounds. Pentagon restricts uniformed personnel from wearing military attire off-base in Gulf countries.',
   l:'https://www.washingtonpost.com/national-security/2026/03/16/us-troops-wounded-iran-war/',s:'Washington Post'},
  {d:'2026-03-16',cat:'military',imp:'e',t:'US-Israeli strikes knock out Tehran electricity distribution center',tags:['Iran','USA','Israel'],
   tx:'Coordinated strike hits a major electricity distribution hub in southern Tehran, cutting power to approximately 3 million residents. Iranian officials call it "deliberate targeting of civilian infrastructure." CENTCOM says the facility was dual-use, routing power to IRGC command networks.',
   l:'https://www.nytimes.com/2026/03/16/world/middleeast/tehran-power-grid-strike.html',s:'NYT'},
  {d:'2026-03-16',cat:'diplomatic',imp:'d',t:'Iran "not prepared for talks" — Pezeshkian tells Macron assurances needed first',tags:['Iran'],
   tx:'In phone call with French President Macron, Iranian President Pezeshkian says Tehran will not enter negotiations while under bombardment. Demands written security guarantees and partial lifting of new sanctions before any talks. Macron reportedly urges 72-hour humanitarian pause.',
   l:'https://abcnews.go.com/International/iran-not-prepared-talks-pezeshkian-macron/story',s:'ABC News'},
  {d:'2026-03-16',cat:'diplomatic',imp:'d',t:'G5 leaders warn Israeli ground offensive in Lebanon "must be averted"',tags:['Israel','Lebanon','UK','France'],
   tx:'Leaders of France, Germany, UK, Italy, and Spain issue joint statement expressing "grave concern" at IDF advances toward Bint Jbeil and Khiam. Call ground offensive "a red line that risks regional conflagration." Israel responds that it will "do whatever is necessary" to eliminate Hezbollah threat.',
   l:'https://www.bbc.com/news/world-middle-east-68543210',s:'BBC'},
  {d:'2026-03-16',cat:'humanitarian',imp:'e',t:'Lebanon displacement tops 1 million as one in six residents flee homes',tags:['Lebanon','Israel'],
   tx:'UNHCR reports over 1 million Lebanese displaced — more than double the figure from one week ago. Tyre, Nabatieh, and Baalbek districts nearly emptied. Beirut schools converted to shelters at capacity. Lebanese Red Cross reports 886 confirmed dead including 107 children and 38 health workers.',
   l:'https://www.nytimes.com/2026/03/16/world/middleeast/lebanon-displacement-million.html',s:'NYT'},
  {d:'2026-03-16',cat:'military',imp:'n',t:'Trump on Mojtaba Khamenei: "We don\'t know if he\'s dead or not"',tags:['Iran','USA'],
   tx:'President Trump tells reporters the status of newly appointed Supreme Leader Mojtaba Khamenei is unclear after days of silence. "He could be alive, he could be dead — frankly, we don\'t know." Iranian state media last showed Mojtaba on March 14. US intelligence assessing whether he has gone into hiding or was hit.',
   l:'https://www.cbsnews.com/news/trump-mojtaba-khamenei-status-unknown/',s:'CBS'},
  {d:'2026-03-16',cat:'maritime',imp:'e',t:'Iraq\'s Majnoon oil field struck; southern export capacity threatened',tags:['Iraq','USA'],
   tx:'Coalition strikes hit near Majnoon oil field in Basra province after intelligence links IRGC Quds Force logistics to the area. Iraq\'s Oil Ministry condemns the strike as violation of sovereignty. Basra oil terminal operations continue but security forces placed on high alert.',
   l:'https://www.worldoil.com/news/2026/3/16/coalition-strikes-near-iraq-majnoon-oil-field/',s:'World Oil'},

  // === MARCH 17 ===
  {d:'2026-03-17',cat:'military',imp:'e',t:'Israel says it killed Ali Larijani, Iran\'s de facto leader, in overnight strike',tags:['Iran','Israel'],
   tx:'Israeli military announces it killed Ali Larijani, head of Iran\'s Supreme National Security Council, in airstrike near Tehran. Also killed: Gholamreza Soleimani, commander of the Basij paramilitary. Larijani was seen as the pragmatist with clout to negotiate — his death raises questions about Trump\'s endgame.',
   l:'https://www.nytimes.com/live/2026/03/17/world/iran-war-trump-oil-lebanon',s:'NYT'},
  {d:'2026-03-17',cat:'military',imp:'e',t:'Basij militia commander Gholamreza Soleimani killed alongside Larijani',tags:['Iran','Israel'],
   tx:'Israel confirms killing Basij commander Soleimani, who led the 1-million-strong plainclothes paramilitary force since 2019. Basij played central role in suppressing Iranian protests. IDF subsequently strikes Basij checkpoints across Tehran. Netanyahu says strikes aimed at "giving the Iranian people an opportunity to remove" the regime.',
   l:'https://www.nytimes.com/live/2026/03/17/world/iran-war-trump-oil-lebanon',s:'NYT'},
  {d:'2026-03-17',cat:'diplomatic',imp:'e',t:'Joe Kent resigns as counterterrorism chief over Iran war — first senior Trump official to quit',tags:['USA'],
   tx:'National Counterterrorism Center director Joe Kent resigns, writing "Iran posed no imminent threat to our nation" and blaming Israeli lobby pressure. First Trump administration official to quit over the war. Trump calls him "weak on security." Tucker Carlson praises Kent as "the bravest man I know."',
   l:'https://www.nytimes.com/live/2026/03/17/world/iran-war-trump-oil-lebanon',s:'NYT'},
  {d:'2026-03-17',cat:'diplomatic',imp:'n',t:'Trump: "I\'m disappointed in NATO" — most allies refuse Hormuz escort role',tags:['USA','UK','France'],
   tx:'Trump acknowledges most NATO allies have informed the US they won\'t help secure the Strait of Hormuz. Germany: "This is not our war." UK: "We will not be drawn into wider war." France, Japan, Italy, Australia, Spain all decline. Trump frames it as a "loyalty test" he expected them to fail. Only Estonia signals willingness.',
   l:'https://www.nytimes.com/live/2026/03/17/world/iran-war-trump-oil-lebanon',s:'NYT'},
  {d:'2026-03-17',cat:'diplomatic',imp:'d',t:'Macron begins talks with India, Arab states on Hormuz escort coalition — without US',tags:['Iran'],
   tx:'French President Macron says France has begun discussions with India, European and Arab countries about marshaling an independent coalition to secure the Strait of Hormuz. Macron insists any such effort "will require discussions and de-escalation with Iran, because under no circumstances can this be a military operation."',
   l:'https://www.nytimes.com/live/2026/03/17/world/iran-war-trump-oil-lebanon',s:'NYT'},
  {d:'2026-03-17',cat:'military',imp:'e',t:'UAE temporarily closes airspace after fresh Iranian drone and missile wave',tags:['UAE','Iran'],
   tx:'UAE aviation authority announces "temporary and full closure" of airspace after defense ministry says air defenses responding to incoming missiles and drones from Iran. Shah gas field fire at ADNOC facility continues. Fujairah Oil Industry Zone also struck by drone. Airspace reopened hours later after all-clear.',
   l:'https://www.theguardian.com/world/live/2026/mar/16/iran-war-live-updates-news-oil-trump-hormuz-dubai-airport-israel-targets',s:'The Guardian'},
  {d:'2026-03-17',cat:'maritime',imp:'e',t:'Tanker struck near Fujairah — first Hormuz-area ship attack in five days',tags:['UAE','Iran'],
   tx:'Unknown projectile strikes tanker anchored 23 nautical miles east of Fujairah in Gulf of Oman, causing minor structural damage. No injuries reported. UKMTO investigating. First vessel strike since March 12 — at least 17 ships attacked since war began. Iran has not attacked vessels in the Strait itself since March 12.',
   l:'https://www.cnbc.com/2026/03/17/iran-war-uae-energy-gas-field-oil-fujairah-strait-of-hormuz.html',s:'CNBC'},
  {d:'2026-03-17',cat:'military',imp:'e',t:'Drone and rocket attacks target US Embassy in Baghdad — most intense assault yet',tags:['Iraq','USA'],
   tx:'At least five drones and four rockets target US Embassy compound in Baghdad\'s Green Zone in the most intense assault since the war began. Black smoke rises from embassy complex. Two airstrikes hit a nearby PMF headquarters in Jadiriya, killing at least two. Iraqi hotel in Green Zone also struck by drone.',
   l:'https://www.theguardian.com/world/live/2026/mar/16/iran-war-live-updates-news-oil-trump-hormuz-dubai-airport-israel-targets',s:'The Guardian'},
  {d:'2026-03-17',cat:'military',imp:'e',t:'Lebanon death toll reaches 912; Israel issues new evacuation warning south of Zahrani River',tags:['Lebanon','Israel'],
   tx:'Lebanese health ministry updates toll to 912 killed and 2,220 wounded since March 2. Over 1 million displaced — one in six residents. IDF tells residents south of the Zahrani River to flee ahead of new operation. Five Lebanese soldiers wounded in IDF strikes; one dies. Hezbollah fires ~100 rockets daily into Israel.',
   l:'https://www.aljazeera.com/news/2026/3/17/israeli-strikes-target-beirut-southern-lebanon-one-million-displaced',s:'Al Jazeera'},
  {d:'2026-03-17',cat:'military',imp:'e',t:'Israel launches simultaneous "extensive strikes" on Tehran and Beirut overnight',tags:['Iran','Israel','Lebanon'],
   tx:'IDF announces simultaneous waves of strikes targeting Iranian regime infrastructure throughout Tehran and Hezbollah infrastructure in Beirut. Targets include Basij checkpoints at Enghelab Square and other potential gathering points. Footage shows strikes on busy Tehran roads. Comes on eve of Nowruz celebrations.',
   l:'https://www.theguardian.com/world/live/2026/mar/16/iran-war-live-updates-news-oil-trump-hormuz-dubai-airport-israel-targets',s:'The Guardian'},
  {d:'2026-03-17',cat:'stocks',imp:'n',t:'Oil settles at $103.42; Brent up 3.2% on day, 42% since war began',tags:['USA'],
   tx:'Brent crude up 2.2% at $102.36/barrel; WTI up 2.2% at $95.55. Prices have surged ~40% during the war, reaching highest levels since 2022. Markets largely shrug off Trump\'s comments. S&P 500 up 0.3%. Australian petrol prices push past A$2.30/litre; government consumer watchdog summons BP, Chevron, Ampol to emergency meeting.',
   l:'https://www.cnbc.com/2026/03/17/iran-war-uae-energy-gas-field-oil-fujairah-strait-of-hormuz.html',s:'CNBC'},
  {d:'2026-03-17',cat:'general',imp:'e',t:'Iran death toll at 1,348 civilians; regional total over 2,200 killed',tags:['Iran','Lebanon','Israel','USA'],
   tx:'Iran\'s UN representative tells Security Council 1,348 Iranian civilians killed since war began. Lebanon: 912 dead. Israel: 12 killed. US: 13 service members killed, ~200 wounded. Pakistan national killed in Abu Dhabi from falling shrapnel during missile interception. UN warns health systems under growing strain.',
   l:'https://www.npr.org/2026/03/17/nx-s1-5750253/israel-kills-two-top-iranian-commanders',s:'NPR'},
  {d:'2026-03-17',cat:'military',imp:'n',t:'Trump: "I\'m not afraid of another Vietnam" — considers ground operations at Kharg Island and Isfahan',tags:['USA','Iran'],
   tx:'Trump tells reporters he is "not afraid" of sending ground troops into Iran and dismisses Vietnam comparisons. Considers two operations requiring ground forces: seizing Kharg Island (Iran\'s main oil export terminal) and the underground Isfahan site storing 970 lbs of near-bomb-grade nuclear fuel.',
   l:'https://www.nytimes.com/live/2026/03/17/world/iran-war-trump-oil-lebanon',s:'NYT'},
  {d:'2026-03-17',cat:'diplomatic',imp:'n',t:'UK Foreign Secretary: Iran "seeking to hijack the global economy" via Hormuz',tags:['UK','Iran'],
   tx:'UK Foreign Secretary Yvette Cooper tells Parliament that Iran is "holding hostage supplies of oil, gas and fertilizer affecting prices and supply chains across the world." Calls for "swiftest possible resolution" but says any solution requires a "negotiated agreement" covering missiles, drones, proxies, and nuclear program.',
   l:'https://www.nytimes.com/live/2026/03/17/world/iran-war-trump-oil-lebanon',s:'NYT'},
  {d:'2026-03-17',cat:'general',imp:'n',t:'Iran tightens crackdown ahead of Nowruz — Starlink users targeted, checkpoints expand',tags:['Iran'],
   tx:'Iranian regime further restricts internet; NetBlocks reports connectivity collapse. BBC says regime targeting individuals with Starlink access and reducing VPN availability. New checkpoints across Tehran ahead of Nowruz celebrations. Government warns citizens to stay indoors, claiming Israeli agents plan to incite unrest.',
   l:'https://understandingwar.org/research/middle-east/iran-update-evening-special-report-march-16-2026/',s:'ISW'},
  {d:'2026-03-17',cat:'military',imp:'e',t:'IRGC confirms Basij commander Soleimani killed — vows retribution against Israel',tags:['Iran','Israel'],
   tx:'Fars news agency, affiliated with the Revolutionary Guards, publishes statement confirming death of Gholamreza Soleimani, the Basij paramilitary commander. IRGC vows retribution. The Basij, estimated at one million members, has been a central force in domestic repression and internal security.',
   l:'https://www.timesofisrael.com/liveblog_entry/irgc-confirms-soleimani-killed/',s:'Times of Israel'},
  {d:'2026-03-17',cat:'military',imp:'n',t:'USS Gerald Ford heading to Crete for repairs after fire — 600+ sailors lost their beds',tags:['USA'],
   tx:'Aircraft carrier USS Gerald Ford, supporting operations in the Iran war, will sail to Souda Bay in Crete for at least a week of repairs after a laundry-room fire on March 12 took 30+ hours to extinguish. More than 600 sailors lost sleeping quarters. Three sailors injured. The Ford is approaching its 10th month of deployment.',
   l:'https://www.navytimes.com/news/your-navy/2026/03/17/sailors-aboard-uss-gerald-r-ford-reportedly-lost-their-beds-amid-fire/',s:'Navy Times'},
  {d:'2026-03-17',cat:'diplomatic',imp:'e',t:'Trump: US should "rethink" NATO membership — says alliance is "one-way street"',tags:['USA'],
   tx:'President Trump escalates rhetoric against NATO allies, saying the US should rethink its membership and that allies made "a very foolish mistake" refusing to help reopen Hormuz. Speaking alongside Irish PM, Trump says he is "not afraid" to put US troops on the ground in Iran and doesn\'t "need or desire" allied help.',
   l:'https://www.nytimes.com/live/2026/03/17/world/iran-war-trump-oil-lebanon',s:'New York Times'},
  {d:'2026-03-17',cat:'maritime',imp:'d',t:'White House: tankers "starting to dribble through" Hormuz — Iran controls new route',tags:['Iran','USA'],
   tx:'WH economic adviser Kevin Hassett says tankers are beginning to cross the Strait of Hormuz. Shipping data shows vessels navigating a narrow Iran-controlled gap between Larak and Qeshm islands, hugging the Iranian coast — suggesting Tehran is imposing a traffic control system. Pakistani, Indian, and Turkish ships have transited; far fewer than normal flow.',
   l:'https://www.reuters.com/business/energy/oil-tankers-starting-dribble-through-strait-hormuz-says-white-house-2026-03-17/',s:'Reuters'},
  {d:'2026-03-17',cat:'diplomatic',imp:'d',t:'UAE signals willingness to join US-led Hormuz coalition — first Gulf state to do so',tags:['UAE','USA'],
   tx:'A senior UAE official says Abu Dhabi could participate in any US-led effort to secure the Strait of Hormuz, the first Gulf state to express such willingness. The statement comes as UAE faces ongoing Iranian strikes and Fujairah port attacks. UAE has been one of the hardest-hit Gulf states, with eight killed since the conflict began.',
   l:'https://www.reuters.com/world/middle-east/uae-could-join-any-us-led-effort-secure-strait-hormuz-says-senior-official-2026-03-17/',s:'Reuters'},
  {d:'2026-03-17',cat:'military',imp:'e',t:'200+ Ukrainian drone experts deployed to Gulf states to counter Iranian Shaheds',tags:['Iran','UAE'],
   tx:'President Zelensky confirms 201 Ukrainian military specialists are now operating in the UAE, Qatar, and Saudi Arabia, with 34 more ready to deploy. Teams heading to Kuwait. Ukraine offers to supply 1,000 interceptor drones daily to allies. Ukraine developed layered anti-Shahed defenses during the Russia war, shooting down 87% of incoming drones.',
   l:'https://www.kyivpost.com/post/72116',s:'Kyiv Post'},
  {d:'2026-03-17',cat:'military',imp:'e',t:'Russia sharing satellite imagery and drone technology with Iran — WSJ',tags:['Iran'],
   tx:'Russia has expanded intelligence sharing and military cooperation with Iran, providing satellite imagery and improved drone technology to aid Tehran\'s targeting of US forces, the Wall Street Journal reports. Moscow is trying to keep its closest Middle Eastern partner in the fight and prolong a war that benefits Russia militarily and economically.',
   l:'https://www.wsj.com/world/russia-is-sharing-satellite-imagery-and-drone-technology-with-iran-0dd95e49',s:'Wall Street Journal'},
  {d:'2026-03-17',cat:'general',imp:'e',t:'UN: Iran war could push 45 million more people into acute hunger worldwide',tags:['Iran'],
   tx:'The World Food Programme says the war threatens record global hunger levels. Shipping disruptions delay food aid deliveries, shipping costs up 18%, and Gulf fertilizer supply disruptions could raise food prices next year. If the war continues through June, 45 million more people face acute hunger — on top of 319 million already suffering.',
   l:'https://www.nytimes.com/live/2026/03/17/world/iran-war-trump-oil-lebanon',s:'New York Times'},
  {d:'2026-03-17',cat:'military',imp:'e',t:'IDF vows to "pursue, find and neutralize" Iran\'s new supreme leader Mojtaba Khamenei',tags:['Iran','Israel'],
   tx:'IDF spokesperson Effie Defrin says Israel will continue targeting anyone who "poses a threat to the state of Israel," including Mojtaba Khamenei, who has not appeared publicly since his appointment. IDF says it is preparing for a "prolonged campaign, including during Passover." Khamenei reportedly may have been injured; whereabouts unknown.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-17-26',s:'CNN'},
  {d:'2026-03-17',cat:'aviation',imp:'e',t:'Global airlines face $400M+ fuel cost surge — Delta, American Airlines warn; SAS cuts flights',tags:['UAE'],
   tx:'Delta Air Lines says soaring jet fuel prices have added $400M in costs in March alone. American Airlines expects similar first-quarter hit. SAS announces route cuts due to fuel price shock. European jet fuel prices have doubled since the war began; Asian prices up 80%. Frankfurt Airport lost 86,000 passengers in first two weeks of conflict.',
   l:'https://www.reuters.com/world/middle-east/uae-temporarily-closes-its-airspace-an-exceptional-precautionary-measure-2026-03-17/',s:'Reuters'},
  {d:'2026-03-17',cat:'humanitarian',imp:'e',t:'Iran Red Crescent: 236 health sites severely damaged, 498 schools struck in two weeks',tags:['Iran'],
   tx:'Iranian Red Crescent Society reports 236 healthcare facilities "severely damaged" and 498 schools struck since the war began. 17 Red Crescent centers hit, 35 ambulances taken out of service, one relief worker killed. HRANA separately puts civilian death toll at 1,351 including 207 children, plus 1,126 military personnel.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-17-26',s:'CNN'},
  {d:'2026-03-17',cat:'diplomatic',imp:'d',t:'Iraq and Kurdistan reach deal to resume oil exports to Turkey\'s Ceyhan port',tags:['Iraq'],
   tx:'Iraqi government and Kurdish authorities sign agreement to resume oil exports via pipeline to Turkey\'s Ceyhan port, a deal that had stalled for years. The agreement comes as Iraq faces pressure from both sides of the conflict and seeks to maintain economic stability. Pipeline can carry 450,000 barrels per day.',
   l:'https://www.reuters.com/world/middle-east/iraqi-government-kurdish-authorities-reach-deal-resume-oil-exports-turkeys-ceyhan-port-2026-03-17/',s:'Reuters'},
  {d:'2026-03-17',cat:'maritime',imp:'n',t:'Iraq asks Iran for oil tanker safe passage through Strait of Hormuz',tags:['Iraq','Iran'],
   tx:'Iraqi government formally requests Iran allow passage of oil tankers through the Strait of Hormuz, joining Pakistan, India, Turkey, and China in seeking access. The request reflects growing pressure on Baghdad to maintain oil revenues amid the conflict disruption.',
   l:'https://www.timesofisrael.com/liveblog_entry/iraq-asks-iran-for-oil-tanker-passage-through-strait-of-hormuz/',s:'Times of Israel'},

  // === MARCH 18 ===
  {d:'2026-03-18',cat:'military',imp:'e',t:'Israel says it killed Iran\'s intelligence minister Esmaeil Khatib in airstrike',tags:['Iran','Israel'],
   tx:'Israeli defense minister announced the killing of Iran\'s intelligence minister Esmaeil Khatib, the latest in a string of high-profile assassinations targeting Iran\'s leadership since the war began. Khatib\'s ministry had overseen covert operations against Israeli and American targets worldwide. Tehran did not immediately confirm.',
   l:'https://www.nytimes.com/live/2026/03/18/world/iran-war-news-trump-oil',s:'NYT'},
  {d:'2026-03-18',cat:'military',imp:'e',t:'Iran fires cluster missiles at central Israel in "revenge" for Larijani killing — 2 dead in Ramat Gan',tags:['Iran','Israel'],
   tx:'IRGC launched multiple-warhead cluster missiles at central Israel, killing a couple in their 70s in Ramat Gan who could not reach their safe room in time. Falling shrapnel caused significant property damage including at a Tel Aviv train station. A second wave struck later Wednesday.',
   l:'https://www.aljazeera.com/news/2026/3/18/iran-launches-revenge-missile-attack-on-israel-after-assassinations',s:'Al Jazeera'},
  {d:'2026-03-18',cat:'military',imp:'e',t:'US and Israeli strikes hit South Pars gas field and Asaluyeh refineries — shared with Qatar',tags:['Iran','Qatar'],
   tx:'Iranian state media reported US-Israeli airstrikes struck facilities at the South Pars gas field and petrochemical facilities in Asaluyeh. South Pars is the world\'s largest gas field, shared with Qatar. Qatar condemned the strikes as "dangerous and irresponsible." Oil jumped $5 to $108/bbl on the news.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-18-26',s:'CNN'},
  {d:'2026-03-18',cat:'military',imp:'e',t:'IRGC warns people to evacuate Saudi, UAE, Qatar oil and gas facilities — threatens imminent strikes',tags:['Iran','Saudi Arabia','UAE','Qatar'],
   tx:'Iran\'s Revolutionary Guards warned civilians to stay away from major energy facilities in Saudi Arabia, UAE, and Qatar, saying they would be targeted "in coming hours" in retaliation for South Pars strikes. The threat raises fears of a widening confrontation targeting Gulf energy infrastructure.',
   l:'https://www.nytimes.com/live/2026/03/18/world/iran-war-news-trump-oil',s:'NYT'},
  {d:'2026-03-18',cat:'military',imp:'e',t:'Israeli strikes across Lebanon kill 10+ in central Beirut — strikes hit without warning',tags:['Lebanon','Israel'],
   tx:'Israeli warplanes struck Zuqaq al-Blat and Basta neighborhoods of central Beirut without evacuation warnings, killing at least 10 and injuring 27. A Bachoura building collapsed after a warned strike. Israeli ground troops continued deeper invasion in southern Lebanon targeting Hezbollah. A civil defense worker was among those killed.',
   l:'https://www.nytimes.com/live/2026/03/18/world/iran-war-news-trump-oil',s:'NYT'},
  {d:'2026-03-18',cat:'military',imp:'e',t:'Large crowds gather in Tehran for Larijani funeral — IRGC vows "devastating" response',tags:['Iran','Israel'],
   tx:'Tens of thousands gathered at Tehran\'s Enghelab Square for the funeral of Ali Larijani and Basij commander Soleimani. Coffins of dozens of Iranian sailors killed when their vessel was torpedoed off Sri Lanka were also carried. IRGC commanders vowed responses "more devastating than the enemy\'s imagination."',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-18-26',s:'CNN'},
  {d:'2026-03-18',cat:'military',imp:'e',t:'US drops new 5,000-lb GBU-72 bunker-buster bombs on Iranian missile sites along Hormuz coast',tags:['USA','Iran'],
   tx:'US Central Command announced it employed multiple GBU-72 Advanced 5K Penetrator munitions — a GPS-guided bomb designed for hardened underground targets — against Iranian anti-ship cruise missile sites along the Strait of Hormuz coastline. First operational use of this munition class in combat.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-17-26',s:'CNN'},
  {d:'2026-03-18',cat:'military',imp:'n',t:'UAE says it has intercepted 327 ballistic missiles, 15 cruise missiles, 1,700 drones since war began',tags:['UAE','Iran'],
   tx:'UAE defense ministry disclosed the scale of Iranian attacks: 327 ballistic missiles, 15 cruise missiles, and nearly 1,700 drones intercepted since Feb 28. Eight people killed including two military personnel. On Wednesday alone, 13 ballistic missiles and 27 drones were intercepted.',
   l:'https://www.nytimes.com/live/2026/03/18/world/iran-war-news-trump-oil',s:'NYT'},
  {d:'2026-03-18',cat:'military',imp:'e',t:'Iranian projectile lands near UAE base hosting Australian troops',tags:['UAE','Iran'],
   tx:'An Iranian projectile struck near a military base in the UAE that hosts Australian troops. The incident raises concerns about the conflict pulling in additional Western nations beyond the US-Israeli coalition.',
   l:'https://www.nytimes.com/live/2026/03/18/world/iran-war-news-trump-oil',s:'NYT'},
  {d:'2026-03-18',cat:'military',imp:'e',t:'11 killed in Israeli strikes on western Iran — Dorud and Chegeni hit; judiciary facility struck',tags:['Iran','Israel'],
   tx:'Israeli strikes killed 7 people and injured 56 in Dorud city in a densely populated area, and 4 more in rural Chegeni. A separate strike hit a judiciary facility in Larestan, killing civilians and judicial staff. Iran says 1,348 civilians have been killed since Feb 28.',
   l:'https://www.aljazeera.com/news/2026/3/18/iran-launches-revenge-missile-attack-on-israel-after-assassinations',s:'Al Jazeera'},
  {d:'2026-03-18',cat:'military',imp:'n',t:'IAEA: projectile hit Bushehr Nuclear Power Plant premises — no damage to reactor',tags:['Iran'],
   tx:'The International Atomic Energy Agency confirmed Iran reported a projectile struck the premises of the Bushehr Nuclear Power Plant on Tuesday, though there was no damage to the facility or injuries. The incident heightens nuclear safety concerns in the conflict.',
   l:'https://news.un.org/en/story/2026/03/1167154',s:'UN News'},
  {d:'2026-03-18',cat:'stocks',imp:'e',t:'Oil spikes past $110/bbl after South Pars and Gulf energy strikes — biggest daily surge of war',tags:['USA'],
   tx:'Brent crude settled above $107 on Wednesday, then surged past $110 in international trading after Iran struck Gulf energy infrastructure in retaliation for South Pars. WTI rose to $97. Biggest daily gain since the war began as markets priced in a prolonged energy infrastructure war.',
   tx:'Brent crude leapt to $108.78, up $5.80 (+5.6%) after strikes on South Pars gas field. The divergence between Brent ($108) and WTI ($95) reflects Brent\'s role as a global benchmark vs WTI\'s US focus. Oil is up 61% from a month ago. US gas prices rose to $3.84/gallon, highest since 2023.',
   l:'https://fortune.com/article/price-of-oil-03-18-2026/',s:'Fortune'},
  {d:'2026-03-18',cat:'diplomatic',imp:'n',t:'Trump suggests allies should police Hormuz alone once Iran regime "finished off"',tags:['USA','Iran'],
   tx:'Trump posted on Truth Social that American allies should take sole responsibility for the Strait of Hormuz if the US causes the Iranian regime to collapse, further escalating his rhetoric against European allies who refused to send warships. He wrote: "That would get some of our non-responsive \'Allies\' in gear, and fast!"',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-18-26',s:'CNN'},
  {d:'2026-03-18',cat:'diplomatic',imp:'e',t:'Qatar condemns South Pars strikes as "dangerous and irresponsible" — shared gas field threatened',tags:['Qatar','Iran'],
   tx:'Qatar\'s foreign ministry warned that targeting shared energy infrastructure was a "dangerous and irresponsible step" threatening global energy security. South Pars/North Dome is the world\'s largest gas field, straddling the Iran-Qatar maritime boundary.',
   l:'https://www.nytimes.com/live/2026/03/18/world/iran-war-news-trump-oil',s:'NYT'},
  {d:'2026-03-18',cat:'general',imp:'e',t:'Iran death toll: 1,348 civilians; Lebanon over 900; Israel 14; US 13 service members killed',tags:['Iran','Lebanon','Israel','USA'],
   tx:'Iran\'s UN representative told the Security Council that at least 1,348 Iranian civilians have been killed since Feb 28. Lebanon reports over 900 dead and 2,100+ wounded. Israel reports 14 civilian deaths. Pentagon confirms 13 US service members killed including 6 in Iraq refueling crash.',
   l:'https://www.nytimes.com/live/2026/03/18/world/iran-war-news-trump-oil',s:'NYT'},
  {d:'2026-03-18',cat:'humanitarian',imp:'e',t:'UN: Lebanon displacement tops 1 million; health system under growing strain',tags:['Lebanon'],
   tx:'UN agencies report that more than 1 million Lebanese have been internally displaced since the conflict began. Health workers have been attacked more than 50 times, with 38 killed and 69 wounded since March 2. The health system is struggling to care for over 2,100 wounded.',
   l:'https://news.un.org/en/story/2026/03/1167154',s:'UN News'},
  {d:'2026-03-18',cat:'aviation',imp:'e',t:'Global airlines extend cancellations — Dubai, Doha, Abu Dhabi services suspended through April+',tags:['UAE','Qatar'],
   tx:'Reuters survey: British Airways extended Gulf cancellations to May 31, Cathay Pacific to April 30, United Airlines to June 15 for Tel Aviv. Emirates and Etihad operating reduced schedules. Qatar Airways running limited flights from March 18-28. Most foreign carriers suspended entirely.',
   l:'https://www.jpost.com/international/article-890389',s:'Jerusalem Post'},
  {d:'2026-03-18',cat:'aviation',imp:'n',t:'OPSGROUP: Iran, Iraq, Bahrain, Kuwait, Syria airspace remain closed; central corridor shut',tags:['Iran','Iraq'],
   tx:'OPSGROUP 18 March update: the central Middle East corridor remains shut. Iran, Iraq, Bahrain, Kuwait, Syria closed by NOTAM. Israel FIR closed to most traffic. UAE and Qatar partially open with restricted corridors. Two routing options: north via Caucasus-Afghanistan or south via Egypt-Saudi-Oman.',
   l:'https://ops.group/blog/middle-east-airspace-current-operational-picture/',s:'OPSGROUP'},
  {d:'2026-03-18',cat:'maritime',imp:'n',t:'About 90 ships have crossed Hormuz since war began — most Iran-linked; 16 oil tankers',tags:['Iran'],
   tx:'AP reports 89 ships crossed the Strait of Hormuz between March 1-15, including 16 oil tankers, down from 100-135 daily pre-war. Over one-fifth were Iran-affiliated. Pakistan, India, and Turkey ships also transited via negotiated safe passages. Iran exported 16M+ barrels since March 1.',
   l:'https://www.wafb.com/2026/03/18/about-90-ships-cross-strait-hormuz-iran-exports-millions-barrels-oil-despite-war/',s:'AP'},
  {d:'2026-03-18',cat:'maritime',imp:'n',t:'Iraq resumes pipeline oil exports to Turkey\'s Ceyhan port after Baghdad-KRG deal',tags:['Iraq'],
   tx:'Iraq\'s North Oil Company resumed pipeline exports to Turkey\'s Ceyhan port after Baghdad and Kurdistan Regional Government reached an agreement. Despite the resumption, supply relief remains limited with Iraq producing at roughly one-third of pre-crisis levels.',
   l:'https://www.detroitnews.com/story/business/2026/03/18/global-oil/89207666007/',s:'Reuters'},
  {d:'2026-03-18',cat:'general',imp:'e',t:'Iran executes alleged Mossad spy amid wartime crackdown on collaborators',tags:['Iran'],
   tx:'Iranian authorities executed a man accused of spying for Israel\'s Mossad intelligence agency, as part of a declared crackdown on alleged collaborators during the war. The execution was reported by the semi-official Tasnim news agency.',
   l:'https://www.aljazeera.com/news/2026/3/18/iran-launches-revenge-missile-attack-on-israel-after-assassinations',s:'Al Jazeera'},
  {d:'2026-03-18',cat:'military',imp:'n',t:'Zelensky: 200+ Ukrainian drone experts now in UAE, Qatar, Saudi Arabia, heading to Kuwait',tags:['UAE','UK'],
   tx:'Zelensky told UK Parliament that Ukrainian experts are already deployed in the Emirates, Qatar, and Saudi Arabia to help counter Iranian Shahed drones. He warned the Iran war will cause a shortage of US Patriot interceptor missiles, creating "a challenge" for Ukraine\'s defense.',
   l:'https://www.nytimes.com/live/2026/03/18/world/iran-war-news-trump-oil',s:'NYT'},
  {d:'2026-03-18',cat:'general',imp:'e',t:'India scrambles for cooking gas alternatives as LPG imports via Hormuz disrupted',tags:['Iran'],
   tx:'Fears of cooking gas shortages in India are fueling protests and panic-buying of induction stoves. Much of India\'s LPG imports pass through the Strait of Hormuz, and households and restaurants are scrambling as the government works diplomatic channels for supply access.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-18-26',s:'CNN'},
  {d:'2026-03-18',cat:'military',imp:'e',t:'Renewed drone and rocket attacks on US Embassy in Baghdad continue through night',tags:['Iraq','USA'],
   tx:'Drone and rocket attacks resumed around the US Embassy in Baghdad\'s Green Zone early Wednesday. Two rockets were intercepted. The embassy has faced near-daily attacks since the war began and ordered all non-essential staff to leave in early March.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-17-26',s:'CNN'},
  {d:'2026-03-18',cat:'military',imp:'e',t:'Iranian missiles cause extensive damage to Qatar\'s Ras Laffan LNG hub',tags:['Qatar','Iran'],
   tx:'Iran\'s IRGC struck Qatar\'s Ras Laffan LNG facility — the world\'s largest LNG export hub — causing what officials described as "extensive damage." The attack came hours after Iran published a list of Gulf energy targets it considered "legitimate" in retaliation for South Pars strikes. Qatar evacuated workers.',
   l:'https://www.wsj.com/livecoverage/iran-us-israel-war-news-2026',s:'WSJ'},
  {d:'2026-03-18',cat:'military',imp:'e',t:'Saudi Arabia intercepts 4 ballistic missiles headed toward Riyadh',tags:['Saudi Arabia','Iran'],
   tx:'Saudi Arabia said it intercepted four Iranian ballistic missiles targeting Riyadh. The Saudi defense ministry confirmed no casualties. Aramco evacuated personnel from the Samref refinery after Iran\'s published target list named it as a potential strike site.',
   l:'https://www.wsj.com/livecoverage/iran-us-israel-war-news-2026',s:'WSJ'},
  {d:'2026-03-18',cat:'diplomatic',imp:'e',t:'Iran FM Araghchi rejects ceasefire: "We are not seeking a ceasefire"',tags:['Iran'],
   tx:'Iran\'s foreign minister Mohammad Javad Araghchi told Al Jazeera that Tehran is "not seeking a ceasefire" and would continue retaliatory operations until coalition strikes on Iranian soil cease. The rejection dampened diplomatic hopes and contradicted earlier Omani mediation efforts.',
   l:'https://www.aljazeera.com/news/2026/3/18/iran-launches-revenge-missile-attack-on-israel-after-assassinations',s:'Al Jazeera'},
  {d:'2026-03-18',cat:'diplomatic',imp:'d',t:'France proposes 4-stage Lebanon-Israel peace plan to UN Security Council',tags:['France','Lebanon','Israel'],
   tx:'France presented a four-stage peace plan for Lebanon to the UN Security Council: immediate ceasefire, Hezbollah withdrawal north of the Litani, deployment of expanded UNIFIL forces, and negotiations on a permanent border agreement. The proposal received lukewarm support from the US.',
   l:'https://www.reuters.com/world/middle-east/',s:'Reuters'},
  {d:'2026-03-18',cat:'diplomatic',imp:'n',t:'DNI Gabbard: Iran regime "largely degraded" but "appears intact" — disagrees with Trump on ICBM timeline',tags:['USA','Iran'],
   tx:'Director of National Intelligence Tulsi Gabbard told Congress that Iran\'s command structure is "largely degraded" but the regime "appears intact." She publicly disagreed with Trump\'s claim about Iran\'s ICBM capability, saying intelligence shows Iran could not develop ICBMs capable of reaching the US until 2035.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-18-26',s:'CNN'},
  {d:'2026-03-18',cat:'stocks',imp:'n',t:'Fed holds interest rates steady citing war-driven economic uncertainty',tags:['USA'],
   tx:'The Federal Reserve held interest rates unchanged, citing heightened economic uncertainty from the Middle East conflict. Chair Powell warned that sustained oil prices above $100 could push inflation higher and raise recession risk, but said the Fed would wait for more data before acting.',
   l:'https://www.reuters.com/markets/',s:'Reuters'},
  {d:'2026-03-18',cat:'stocks',imp:'e',t:'US diesel prices top $5/gallon for first time since 2022 — trucking costs surge',tags:['USA'],
   tx:'Average US diesel prices crossed $5 per gallon as the Hormuz disruption continues to squeeze global fuel supply. Trucking companies warned of rate increases. Regular gasoline at $3.84/gallon, highest since 2023. Analysts project $4.50+ gasoline if disruption lasts through April.',
   l:'https://fortune.com/article/price-of-oil-03-18-2026/',s:'Fortune'},
  {d:'2026-03-18',cat:'diplomatic',imp:'e',t:'Qatar expels Iran\'s military and security attachés as "persona non grata"',tags:['Qatar','Iran'],
   tx:'Qatar\'s foreign ministry delivered an official note to the Iranian embassy declaring its military attaché, security attaché and their staff persona non grata, demanding departure within 24 hours. The decision followed "repeated Iranian targeting and blatant aggression against the State of Qatar."',
   l:'https://www.nytimes.com/live/2026/03/18/world/iran-war-news-trump-oil',s:'NYT'},
  {d:'2026-03-18',cat:'diplomatic',imp:'e',t:'Trump denies US role in South Pars strike — threatens to "massively blow up" field if Qatar hit again',tags:['USA','Iran','Qatar'],
   tx:'Trump posted that Israel struck South Pars "out of anger" and the US "knew nothing." He threatened that if Iran attacks Qatar again, the US "will massively blow up the entirety of the South Pars Gas Field at an amount of strength and power that Iran has never seen."',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-18-26',s:'CNN'},
  {d:'2026-03-18',cat:'military',imp:'e',t:'UAE: Habshan gas facilities and Bab oil field hit by interception debris — operations suspended',tags:['UAE','Iran'],
   tx:'Abu Dhabi Media Office said debris from missile interceptions struck Habshan gas facilities (one of the world\'s largest gas processing plants) and the Bab oil field. Gas operations suspended. No injuries. UAE foreign ministry condemned the attack as "a dangerous escalation."',
   l:'https://www.nytimes.com/live/2026/03/18/world/iran-war-news-trump-oil',s:'NYT'},
  {d:'2026-03-18',cat:'maritime',imp:'e',t:'Vessel struck by "unknown projectile" 11nm east of Khor Fakkan — fire onboard',tags:['UAE','Iran'],
   tx:'UKMTO reported a vessel hit by an unknown projectile in the Gulf of Oman, 11 nautical miles east of Khor Fakkan, UAE. Fire broke out onboard. Over 20 vessels have reported incidents in and around the Arabian Gulf and Strait of Hormuz since the war began.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-18-26',s:'CNN'},
  {d:'2026-03-18',cat:'stocks',imp:'e',t:'Oil surges past $110/bbl after Gulf energy strikes — Asian markets slide 2%+',tags:['USA','Iran','Qatar'],
   tx:'Brent crude rose above $110/bbl in international trading after Iranian strikes on Gulf energy infrastructure. Asian markets fell sharply: Nikkei -2.7%, Kospi -2.6%, Hang Seng -1.4%, Taiex -1.4%. Economies heavily dependent on oil imports particularly exposed.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-18-26',s:'CNN'},
  {d:'2026-03-18',cat:'humanitarian',imp:'e',t:'Iranian missile kills 3 Palestinian women in Beit Awwa, West Bank — first WB fatalities of war',tags:['Iran','Israel'],
   tx:'A missile struck a makeshift beauty parlor in Beit Awwa, southern West Bank, killing three Palestinian women preparing for Eid al-Fitr. Israel blamed an Iranian missile; Palestinians blamed an errant interceptor. First fatal attack on Palestinians in the West Bank since the war began.',
   l:'https://www.nytimes.com/live/2026/03/18/world/iran-war-news-trump-oil',s:'NYT'},
  {d:'2026-03-18',cat:'diplomatic',imp:'e',t:'12 Arab and Islamic foreign ministers demand Iran "immediately halt attacks" — Riyadh meeting',tags:['Saudi Arabia','Iran','Qatar','UAE'],
   tx:'Foreign ministers of 12 states met in Riyadh and condemned Iran\'s attacks on Gulf states, Jordan, Azerbaijan and Turkey, which targeted "residential areas, civilian infrastructure, oil facilities, desalination plants, airports and diplomatic premises." Also condemned Israeli attacks on Lebanon.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-18-26',s:'CNN'},
  {d:'2026-03-18',cat:'diplomatic',imp:'e',t:'Saudi FM: Kingdom "reserves right to take military action" against Iran — "trust completely shattered"',tags:['Saudi Arabia','Iran'],
   tx:'Saudi Foreign Minister Prince Faisal bin Farhan said Iran\'s targeting of Riyadh during a diplomatic meeting "cannot be coincidental." Two Riyadh refineries were struck. He declared "the little trust that remained in Iran has been completely shattered" and Saudi Arabia would not shy away from protecting its resources.',
   l:'https://www.aljazeera.com/news/liveblog/2026/3/19/iran-war-live-qatar-saudi-energy-sites-attacked-riyadh-says-trust-gone',s:'Al Jazeera'},
  {d:'2026-03-18',cat:'diplomatic',imp:'d',t:'Macron calls for moratorium on strikes targeting energy and water infrastructure',tags:['Iran','Qatar'],
   tx:'French President Macron spoke with Trump and Qatari Emir, calling for "without delay, a moratorium on strikes targeting civilian infrastructure, particularly energy and water supply facilities." Said civilian populations and energy security must be protected from military escalation.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-18-26',s:'CNN'},
  {d:'2026-03-18',cat:'diplomatic',imp:'n',t:'Former counterterrorism chief Joe Kent resigns — says "no intelligence" of imminent Iranian mega-attack',tags:['USA','Iran'],
   tx:'A day after resigning as National Counterterrorism Center director, Joe Kent said there was "no intelligence" that Iran planned a major attack akin to 9/11 or Pearl Harbor. His departure added to concerns about intelligence assessments being overridden by political pressure.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-18-26',s:'CNN'},
  {d:'2026-03-18',cat:'general',imp:'e',t:'Iraq gas supply from Iran completely cut off — large part of electric grid down',tags:['Iraq','Iran'],
   tx:'Iraq, which normally gets one-third of its natural gas from Iran, reported that flow had been completely severed by strikes on South Pars and related infrastructure. A large portion of Iraq\'s electric power supply was knocked out, deepening the humanitarian crisis.',
   l:'https://www.nytimes.com/live/2026/03/18/world/iran-war-news-trump-oil',s:'NYT'},
  {d:'2026-03-18',cat:'maritime',imp:'n',t:'Iran allowing more ships through Hormuz — 8 non-Iranian vessels detected Monday, nearly double recent days',tags:['Iran'],
   tx:'Maritime intelligence firm Windward detected 8 non-Iranian vessels transiting Hormuz on Monday, nearly double recent days. Ships rerouting through Iranian territorial waters suggest "permission-based transits to friendly countries." Analyst: Western-affiliated vessels won\'t enter Iranian waters but Chinese, Indian and others will.',
   l:'https://www.aljazeera.com/economy/2026/3/18/iran-allowing-more-ships-through-strait-of-hormuz-data-shows',s:'Al Jazeera'},

  // ===== DAY 20: Mar 19 =====
  {d:'2026-03-19',cat:'military',imp:'e',t:'IDF strikes South Pars gas field again — second raid in 24 hours targets Iran\'s largest energy asset',tags:['Iran','Israel','Qatar'],
   tx:'Israeli aircraft struck South Pars gas field installations for the second time, targeting processing units and pipeline junctions. The field, shared with Qatar\'s North Dome, produces ~40% of Iran\'s natural gas. Massive fires visible from Qatari coast. Iran condemned "economic warfare targeting civilian energy supply."',
   l:'https://www.reuters.com/world/middle-east/',s:'Reuters'},
  {d:'2026-03-19',cat:'military',imp:'e',t:'Iran retaliates with missiles on Kuwait\'s Mina Al-Ahmadi and Mina Abdullah refineries — fires reported',tags:['Iran','Kuwait'],
   tx:'IRGC launched ballistic missiles at Kuwait\'s two largest refinery complexes, Mina Al-Ahmadi and Mina Abdullah, which together process ~700,000 bbl/day. Multiple fires reported. Kuwait activated civil defense protocols and called it "an unprovoked act of war against a neutral state." First direct Iranian strikes on Kuwaiti territory.',
   l:'https://www.reuters.com/world/middle-east/',s:'Reuters'},
  {d:'2026-03-19',cat:'military',imp:'e',t:'Iranian missiles hit UAE\'s Habshan gas complex and Bab oil field — operations suspended',tags:['Iran','UAE'],
   tx:'Follow-up strikes on UAE\'s Habshan-Bab gas and oil complex caused further damage to processing facilities. ADNOC suspended all operations at the site, which produces ~1.5M bbl/day equivalent. Abu Dhabi confirmed interception of 3 additional missiles aimed at Jebel Ali port.',
   l:'https://www.aljazeera.com/news/',s:'Al Jazeera'},
  {d:'2026-03-19',cat:'military',imp:'e',t:'Iranian missiles hit Saudi Arabia\'s Yanbu refinery complex on Red Sea coast',tags:['Iran','Saudi Arabia'],
   tx:'IRGC Aerospace Force launched medium-range ballistic missiles at Saudi Aramco\'s Yanbu refinery, the kingdom\'s largest Red Sea coast petroleum facility processing ~400,000 bbl/day. Saudi air defenses intercepted most projectiles but debris caused fires at storage tanks. First Iranian strike on Saudi\'s western coast.',
   l:'https://www.reuters.com/world/middle-east/',s:'Reuters'},
  {d:'2026-03-19',cat:'military',imp:'e',t:'IDF strikes IRGC helicopter at Sanandaj airport; Caspian Sea installations also hit',tags:['Iran','Israel'],
   tx:'Israel expanded its strike envelope, hitting an IRGC military helicopter on the ground at Sanandaj airport in western Iran and striking installations along the Caspian Sea coast. The Caspian strikes targeted radar installations and a suspected drone storage facility near Bandar-e Anzali.',
   l:'https://www.nytimes.com/live/2026/03/19/world/iran-war-news',s:'NYT'},
  {d:'2026-03-19',cat:'military',imp:'e',t:'IDF kills 20+ Hezbollah fighters in Lebanon strikes — deadliest single day for group since war began',tags:['Lebanon','Israel'],
   tx:'Israeli Air Force conducted intensive strikes across southern Lebanon and the Bekaa Valley, killing more than 20 Hezbollah operatives including mid-level commanders. The strikes targeted weapons storage, tunnel entrances, and command posts. Hezbollah fired 80+ rockets into northern Israel in response.',
   l:'https://www.timesofisrael.com/',s:'Times of Israel'},
  {d:'2026-03-19',cat:'military',imp:'e',t:'4 killed in overnight Iranian missile barrage on central Israel — Iron Dome intercepts record 94%',tags:['Iran','Israel'],
   tx:'Iran launched 35+ ballistic missiles at central Israel overnight. Iron Dome and Arrow-3 intercepted ~94% but several warheads penetrated, killing 4 in Rishon LeZion and wounding 22. IDF reported this was the 6th mass missile attack on Israeli population centers since the war began.',
   l:'https://www.timesofisrael.com/',s:'Times of Israel'},
  {d:'2026-03-19',cat:'diplomatic',imp:'e',t:'Trump threatens to "massively blow up" South Pars if Iran attacks Qatar energy infrastructure again',tags:['USA','Iran','Qatar'],
   tx:'President Trump warned Iran that any further strikes on Qatari energy assets would result in the complete destruction of South Pars. "If they hit Qatar one more time, we will massively blow up that gas field — it won\'t exist anymore." Qatar\'s emir called for restraint on all sides.',
   l:'https://www.bbc.com/news/',s:'BBC'},
  {d:'2026-03-19',cat:'diplomatic',imp:'e',t:'Saudi FM Prince Faisal: Kingdom "reserves right to take military action" — trust with Iran "completely shattered"',tags:['Saudi Arabia','Iran'],
   tx:'Saudi Foreign Minister Prince Faisal bin Farhan Al Saud said the strikes on Yanbu have "completely shattered" any remaining trust with Tehran. He warned that the Kingdom reserves the right to take direct military action and is consulting with GCC partners on a coordinated response.',
   l:'https://www.reuters.com/world/middle-east/',s:'Reuters'},
  {d:'2026-03-19',cat:'diplomatic',imp:'e',t:'Pentagon seeks $200B supplemental for Iran war — largest military funding request since Iraq 2003',tags:['USA','Iran'],
   tx:'The Department of Defense submitted a $200 billion supplemental budget request to Congress for ongoing operations against Iran. The request covers munition replenishment, carrier group sustainment, missile defense, and force protection across CENTCOM. Bipartisan support expected but progressives object.',
   l:'https://www.nytimes.com/',s:'NYT'},
  {d:'2026-03-19',cat:'stocks',imp:'e',t:'Brent crude spikes to $118/bbl intraday — settles at $111 as energy infrastructure attacks rattle markets',tags:['USA','Iran','Saudi Arabia'],
   tx:'Oil prices surged ~10% intraday to $118/bbl Brent as Iranian retaliatory strikes on Kuwait, UAE, and Saudi energy infrastructure deepened fears of prolonged supply disruption. Settled at ~$111 as Trump waived Jones Act and Treasury floated unsanctioning Iranian oil at sea. WTI at $97. European natural gas prices surged 30%. QatarEnergy CEO said Ras Laffan damage would take 3-5 years to repair, knocking out ~20% of LNG export capacity.',
   l:'https://tradingeconomics.com/commodity/brent-crude-oil',s:'Trading Economics'},
  {d:'2026-03-19',cat:'aviation',imp:'e',t:'Cathay Pacific extends Middle East cancellations through April 30; BA suspends to May 31',tags:['UAE','Qatar','UK'],
   tx:'Cathay Pacific extended its cancellation of all Middle East-bound flights through April 30, citing "no prospect of safe airspace reopening." British Airways went further, suspending Gulf services through May 31. DXB operating at roughly 40-45% capacity with only westbound and southbound routes available.',
   l:'https://ops.group/',s:'OPSGROUP'},
  {d:'2026-03-19',cat:'aviation',imp:'n',t:'OPSGROUP: All eastern airways remain closed — no change to Iranian, Iraqi, Kuwaiti, Bahraini airspace',tags:['Iran','Iraq','Kuwait','Bahrain'],
   tx:'No material change to airspace closures. Iran (OIIX), Iraq (ORBB), Kuwait (OKAC), Syria (OSTT), and Bahrain TMA remain closed. Israel (LLLL) restricted to military. Southern bypass and Caucasus corridor handling all commercial traffic. Airlines reporting fuel cost surcharges up 30% from rerouting.',
   l:'https://ops.group/',s:'OPSGROUP'},
  {d:'2026-03-19',cat:'maritime',imp:'e',t:'Two vessels struck near Ras Laffan and off Khor Fakkan — UKMTO warns mariners to avoid area',tags:['Qatar','UAE','Iran'],
   tx:'UKMTO reported two commercial vessels hit by "unknown projectiles" — one near Qatar\'s Ras Laffan LNG terminal and another 15nm off Khor Fakkan, UAE. Both vessels sustained damage; one taking on water. UKMTO issued emergency advisory warning all commercial shipping to avoid the central Gulf until further notice.',
   l:'https://www.ukmto.org/',s:'UKMTO'},
  {d:'2026-03-19',cat:'diplomatic',imp:'d',t:'Macron calls for immediate moratorium on strikes targeting energy and water infrastructure',tags:['France','Iran','Qatar'],
   tx:'French President Macron proposed an immediate moratorium on all strikes targeting energy, water, and civilian infrastructure, calling the escalation "a danger to the entire global economy." He urged the UN Security Council to adopt a binding resolution. Russia and China signaled potential support.',
   l:'https://www.france24.com/',s:'France 24'},
  {d:'2026-03-19',cat:'humanitarian',imp:'d',t:'Rafah Crossing reopens — first humanitarian corridor into Gaza in 10 days',tags:['Egypt','Israel'],
   tx:'Egypt and Israel agreed to reopen the Rafah border crossing for humanitarian aid deliveries after a 10-day closure. UN agencies began moving medical supplies and food into Gaza, where hospitals reported critical shortages. The crossing had been closed since Iranian missile debris struck near the border area.',
   l:'https://www.bbc.com/news/',s:'BBC'},
  {d:'2026-03-19',cat:'general',imp:'e',t:'Iran parliament debates Hormuz "transit fee" bill — $5/bbl surcharge on all oil passing through strait',tags:['Iran'],
   tx:'Iran\'s Majlis introduced emergency legislation to impose a $5/barrel transit fee on all oil shipments through the Strait of Hormuz, framing it as "compensation for environmental damage." The move is widely seen as an attempt to monetize Iran\'s chokepoint leverage. Western nations called it "piracy by legislation."',
   l:'https://www.aljazeera.com/news/',s:'Al Jazeera'},
  {d:'2026-03-19',cat:'diplomatic',imp:'n',t:'Gabbard tells Congress US and Israeli war objectives "are different" — Iran maintained nuclear rebuild intention',tags:['USA','Iran','Israel'],
   tx:'DNI Tulsi Gabbard testified before House Intelligence Committee that US and Israeli war aims diverge — Israel focused on decapitating Iranian leadership while Trump aims to destroy ballistic missile and IRGC naval capabilities. Gabbard said Iran "maintained the intention" to rebuild nuclear enrichment, walking back her prepared testimony that capabilities were "obliterated." Also disclosed Mojtaba Khamenei badly injured in Israeli attack.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-19-26',s:'CNN'},
  {d:'2026-03-19',cat:'diplomatic',imp:'d',t:'UK, France, Germany, Italy, Netherlands, Japan issue joint statement — ready to help secure Strait of Hormuz',tags:['UK','France','Germany','Italy','Japan','Iran'],
   tx:'Six nations condemned Iran\'s attacks on commercial vessels and de facto closure of the Strait, calling for Iran to "cease immediately" mine-laying, drone and missile attacks. Expressed readiness to "contribute to appropriate efforts to ensure safe passage." Also backed IEA coordinated strategic reserve release and pledged to work with producers to increase output.',
   l:'https://www.reuters.com/world/asia-pacific/joint-statement-strait-hormuz-by-european-nations-japan-2026-03-19/',s:'Reuters'},
  {d:'2026-03-19',cat:'stocks',imp:'d',t:'Treasury Sec. Bessent: US could "unsanction" Iranian oil on the water — may release more from SPR',tags:['USA','Iran'],
   tx:'Treasury Secretary Scott Bessent told Fox Business the US could unsanction ~140 million barrels of Iranian oil currently being shipped, allowing it to be sold openly to Europe and other regions. Also floated another Strategic Petroleum Reserve release. Last week, the US already removed sanctions on Russian oil at sea and allowed Iranian-linked ships to transport Russian crude.',
   l:'https://fortune.com/article/price-of-oil-03-19-2026/',s:'Fortune'},
  {d:'2026-03-19',cat:'military',imp:'e',t:'IDF struck Iranian naval vessels at military port on Caspian Sea — expanding theater beyond Gulf',tags:['Iran','Israel'],
   tx:'Israeli military confirmed strikes against Iranian naval vessels including missile ships at a military port on the Caspian Sea, expanding operations to a theater far from the Persian Gulf. The strikes add to sustained US targeting of Iranian naval forces, whose destruction is a top stated American military objective.',
   l:'https://www.reuters.com/world/asia-pacific/joint-statement-strait-hormuz-by-european-nations-japan-2026-03-19/',s:'Reuters'},
  {d:'2026-03-19',cat:'humanitarian',imp:'e',t:'Lebanon death toll passes 1,000 since March 2 — 118 children among dead, 1M+ displaced',tags:['Lebanon','Israel'],
   tx:'Lebanese health ministry confirmed more than 1,000 people killed since fighting erupted between Israel and Hezbollah on March 2. At least 118 children among the dead. Over one million internally displaced. Israel\'s Defense Minister Katz greenlit Lebanon reinforcements against Hezbollah.',
   l:'https://www.nytimes.com/live/2026/03/19/world/iran-war-news-trump-oil',s:'New York Times'},
  {d:'2026-03-19',cat:'military',imp:'n',t:'Hegseth acknowledges US troop fatalities for first time — 13 US soldiers killed in action to date',tags:['USA','Iran'],
   tx:'Defense Secretary Pete Hegseth opened Pentagon briefing by honoring six of 13 US troops killed in action, reflecting on his Dover AFB trip with Trump. A notable shift in tone after he previously suggested media covered casualties to "make the president look bad." Said US is "winning decisively and on our terms" but declined to offer war timeline.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-19-26',s:'CNN'},
  {d:'2026-03-19',cat:'stocks',imp:'e',t:'ECB holds rates, warns war will have "material impact" on European inflation via energy prices',tags:['France','Germany','Italy'],
   tx:'European Central Bank kept interest rates on hold, citing "significantly more uncertain" economic outlook. ECB President Christine Lagarde said the bank was "well-positioned and well-equipped" to deal with the "major shock." Bank of Japan and Bank of England also held rates with hawkish tones. Markets now delay Fed easing expectations to 2027.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-19-26',s:'CNN'},
  {d:'2026-03-19',cat:'diplomatic',imp:'e',t:'Iran FM Araghchi warns: countries helping reopen Hormuz risk "complicity" in war crimes',tags:['Iran','Japan','UK','France'],
   tx:'In call with Japanese FM, Iranian Foreign Minister Araghchi asserted the Hormuz situation was caused by the US and Israel, and warned that any country participating in breaking the Iranian blockade would constitute "complicity in the aggression and heinous crimes committed by the aggressors." Separately posted that Iran showed "ZERO restraint" if infrastructure struck again.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-19-26',s:'CNN'},
  {d:'2026-03-19',cat:'stocks',imp:'e',t:'Gold crashes 5% to $4,551/oz — seventh straight decline as central banks turn hawkish',tags:['USA'],
   tx:'Gold fell to its lowest level since early January as investors sold to meet margin calls and recalibrated rate expectations. Fed held rates at 3.5-3.75%, signaling no cuts until inflation eases. Powell acknowledged rate hike remains possible. Despite war safe-haven appeal, hawkish central bank consensus across Fed, ECB, BoJ, and BoE dimmed gold\'s non-yielding appeal.',
   l:'https://tradingeconomics.com/commodity/gold',s:'Trading Economics'},
  {d:'2026-03-19',cat:'general',imp:'e',t:'WTO warns Middle East war could cut global trade growth by 0.5% — supply chain disruptions mounting',tags:['Iran'],
   tx:'World Trade Organization said the war could slow global trade and economic growth more than expected. Had forecast goods trade growth of 1.9% in 2026 (down from 4.6% in 2025), but warned of another 0.5 percentage point drop if elevated oil and gas prices persist. Transport disruptions putting pressure on food supplies and trade.',
   l:'https://www.nytimes.com/live/2026/03/19/world/iran-war-news-trump-oil',s:'New York Times'},
  {d:'2026-03-19',cat:'general',imp:'n',t:'Trump waives Jones Act for 60 days — allows foreign vessels to transport oil between US ports',tags:['USA'],
   tx:'President Trump temporarily waived the Jones Act to help reduce domestic energy transport costs, allowing foreign-flagged vessels to operate between US ports. The waiver aims to ease the cost of moving oil, gas, and other commodities across the US as Gulf supply disruptions tighten markets.',
   l:'https://tradingeconomics.com/commodity/brent-crude-oil',s:'Trading Economics'},
  {d:'2026-03-19',cat:'military',imp:'n',t:'Russia calls for "safety island" around Iran\'s Bushehr nuclear plant amid ongoing strikes',tags:['Iran'],
   tx:'Russia called for establishing a protective "safety island" around Iran\'s Bushehr nuclear power plant after a projectile struck the site area. The IAEA had previously raised concerns about strikes near nuclear facilities. Russia, which built the Bushehr reactor, seeks to prevent a nuclear incident.',
   l:'https://www.jpost.com/middle-east/iran-news/2026-03-19/live-updates-890483',s:'Jerusalem Post'},
  {d:'2026-03-19',cat:'maritime',imp:'e',t:'UKMTO reports vessel hit by projectile 4nm east of Ras Laffan — expanding maritime threat zone',tags:['Qatar','Iran'],
   tx:'United Kingdom Maritime Trade Operations Centre reported a vessel struck by an "unknown projectile" just 4 nautical miles east of Ras Laffan in Qatar, marking expansion of maritime attacks to waters directly adjacent to the world\'s largest LNG terminal. The incident followed UKMTO\'s earlier advisory for all commercial shipping to avoid the central Gulf.',
   l:'https://www.aljazeera.com/news/2026/3/19/wrap-iran-ratchets-up-pressure-on-gulf-states',s:'Al Jazeera'},
  // ===== DAY 21: Mar 20 — Nowruz / Eid; Bandar Lengeh struck; IRGC spokesman killed; F-35 emergency =====
  {d:'2026-03-20',cat:'military',imp:'e',t:'Israel strikes Nur facility east of Tehran — largest strike on Iranian soil since war began',tags:['Iran','Israel'],
   tx:'The IDF struck a major military-industrial complex near the city of Nur, east of Tehran, in what Iranian state media called the largest single aerial assault on Iranian territory since the conflict began. Multiple buildings destroyed; casualty figures not yet confirmed. The strike occurred on Nowruz, Persian New Year, which Iran\'s government had asked citizens to observe in defiance.',
   l:'https://www.cnn.com/2026/03/20/middleeast/israel-strikes-nur-iran-nowruz',s:'CNN'},
  {d:'2026-03-20',cat:'military',imp:'e',t:'IDF hits Bandar Lengeh naval port — 16 boats on fire, key Hormuz staging point destroyed',tags:['Iran','Israel'],
   tx:'Israeli warplanes struck the IRGCN port at Bandar Lengeh on the Strait of Hormuz, destroying at least 16 fast-attack craft and setting the facility ablaze. Bandar Lengeh served as a primary staging point for IRGCN operations harassing commercial shipping and laying mines in the strait. The strike significantly degrades Iran\'s ability to enforce its Hormuz blockade.',
   l:'https://www.aljazeera.com/news/2026/3/20/bandar-lengeh-naval-port-struck-boats-on-fire',s:'Al Jazeera'},
  {d:'2026-03-20',cat:'military',imp:'e',t:'IRGC spokesman killed in airstrike hours after defiant statement on missile production',tags:['Iran','Israel'],
   tx:'An Israeli airstrike killed the IRGC\'s chief spokesman shortly after he appeared on state television declaring that Iran\'s missile production "has not slowed for one second." The precision strike, likely guided by signals intelligence, underscored the coalition\'s ability to track and eliminate Iranian military officials in near-real time.',
   l:'https://www.reuters.com/world/middle-east/irgc-spokesman-killed-airstrike-iran-2026-03-20',s:'Reuters'},
  {d:'2026-03-20',cat:'military',imp:'e',t:'Kuwait\'s Mina Al-Ahmadi refinery hit again by two drone waves — fires reignited',tags:['Iran','Kuwait'],
   tx:'Iran launched two successive waves of attack drones at Kuwait\'s Mina Al-Ahmadi refinery complex, reigniting fires that had been partially contained from the March 19 strikes. Kuwait\'s defense ministry said air defenses intercepted most but not all incoming munitions. The strikes occurred on Eid al-Fitr.',
   l:'https://apnews.com/article/kuwait-refinery-drone-attack-eid-2026',s:'AP'},
  {d:'2026-03-20',cat:'military',imp:'e',t:'Heavy explosions reported in Dubai during Eid — air defense intercepts over Al Minhad',tags:['Iran','UAE'],
   tx:'Residents across Dubai reported heavy explosions in the early hours of Eid al-Fitr as UAE air defenses engaged incoming projectiles over Al Minhad Air Base. The UAE\'s national emergency authority issued shelter-in-place orders. No civilian casualties reported but the attacks shattered what many had hoped would be a ceasefire for the holiday.',
   l:'https://www.cnn.com/2026/03/20/middleeast/dubai-explosions-eid-air-defense',s:'CNN'},
  {d:'2026-03-20',cat:'military',imp:'n',t:'US F-35 makes emergency landing — possibly struck by Iranian fire, first if confirmed',tags:['USA','Iran'],
   tx:'A US Air Force F-35A Lightning II made an emergency landing at an undisclosed Gulf base after sustaining damage during a sortie over Iranian airspace. Pentagon officials declined to confirm whether the aircraft was hit by Iranian air defenses, but if confirmed it would be the first US fifth-generation fighter struck in combat. The pilot was uninjured.',
   l:'https://www.reuters.com/world/middle-east/us-f35-emergency-landing-gulf-base-2026-03-20',s:'Reuters'},
  {d:'2026-03-20',cat:'military',imp:'e',t:'Saudi Arabia intercepts 10 drones from east, 1 from north — Bahrain warehouse fire from shrapnel',tags:['Saudi Arabia','Bahrain','Iran'],
   tx:'Saudi air defenses intercepted 10 attack drones approaching from the east and one from the north in a sustained barrage. Interception debris struck a warehouse in neighboring Bahrain, causing a significant fire. The attack demonstrated Iran\'s continued ability to threaten the entire western Gulf coast simultaneously.',
   l:'https://apnews.com/article/saudi-drone-intercepts-bahrain-fire-2026',s:'AP'},
  {d:'2026-03-20',cat:'military',imp:'e',t:'Israel strikes Syrian infrastructure in Suwayda province — expanding Lebanon campaign southward',tags:['Israel','Syria'],
   tx:'IDF strikes hit military infrastructure in Syria\'s Suwayda province, targeting what Israel described as an Iranian weapons transfer point. The strikes marked a further geographic expansion of Israel\'s air campaign, which now extends from the Caspian Sea to southern Syria.',
   l:'https://www.timesofisrael.com/idf-strikes-suwayda-syria-iranian-weapons-2026-03-20',s:'Times of Israel'},
  {d:'2026-03-20',cat:'diplomatic',imp:'n',t:'Trump: "Pearl Harbor" comparison in call with Japan PM — rules out ground troops in Iran',tags:['USA','Japan','Iran'],
   tx:'President Trump compared the conflict to "Pearl Harbor" in a phone call with Japanese Prime Minister, stating the US had been "forced to respond to Iranian aggression." He explicitly ruled out deploying ground troops to Iran, saying the war would be won "from the air and the sea." The Pearl Harbor analogy drew criticism from historians and diplomats.',
   l:'https://www.cnn.com/2026/03/20/politics/trump-pearl-harbor-japan-iran',s:'CNN'},
  {d:'2026-03-20',cat:'diplomatic',imp:'d',t:'Macron consulting UNSC members on Hormuz navigation framework — French carrier on station',tags:['France','Iran'],
   tx:'French President Macron began formal consultations with UN Security Council members on a multilateral framework for guaranteed navigation through the Strait of Hormuz. The FS Charles de Gaulle carrier strike group remained on station in the Gulf of Aden, providing operational backing to the diplomatic initiative.',
   l:'https://www.france24.com/en/diplomacy/20260320-macron-hormuz-unsc-framework',s:'France 24'},
  {d:'2026-03-20',cat:'diplomatic',imp:'n',t:'Netanyahu says Iran "decimated" — war ending "faster than people think"',tags:['Israel','Iran'],
   tx:'Israeli Prime Minister Netanyahu told reporters that Iran\'s military capabilities had been "decimated" and predicted the war would end "faster than people think." Military analysts noted the contrast between Netanyahu\'s optimism and the continuing expansion of the conflict into new theaters and countries.',
   l:'https://www.timesofisrael.com/netanyahu-iran-decimated-war-ending-fast-2026-03-20',s:'Times of Israel'},
  {d:'2026-03-20',cat:'maritime',imp:'d',t:'Iran developing "vetting system" for selective Hormuz passage — ~9 ships through safe corridor',tags:['Iran'],
   tx:'Iran announced it was developing a vetting system to selectively allow commercial vessels through the Strait of Hormuz, marking a shift from total blockade to conditional passage. Approximately 9 ships transited through an Iran-designated "safe corridor" on March 20, up from 3 the previous day. The move appeared designed to reduce international pressure while maintaining leverage.',
   l:'https://www.reuters.com/business/energy/iran-hormuz-vetting-system-selective-passage-2026-03-20',s:'Reuters'},
  {d:'2026-03-20',cat:'stocks',imp:'e',t:'Brent crude settles at $112.19 — highest close since war began and highest since July 2022',tags:['USA','Iran'],
   tx:'Oil markets whipsawed as Brent crude spiked to $112.30/bbl during trading before settling at $107 after Iran announced a vetting system for limited vessel passage through the Strait. WTI settled at $94.50. The Dallas Fed warned oil could reach $120 if Hormuz remains effectively closed.',
   l:'https://www.bloomberg.com/news/articles/2026-03-20/oil-retreats-from-111-as-iran-hormuz-passage-signals',s:'Bloomberg'},
  {d:'2026-03-20',cat:'humanitarian',imp:'e',t:'Iran Red Crescent: 18,000+ civilians injured, 204 children killed, 1,400+ total killed',tags:['Iran'],
   tx:'The Iranian Red Crescent Society released updated casualty figures showing more than 18,000 civilians injured and at least 1,400 killed since the conflict began, including 204 children. The organization appealed for international humanitarian assistance, saying medical supplies were running critically low in several provinces.',
   l:'https://www.aljazeera.com/news/2026/3/20/iran-red-crescent-18000-injured-204-children-killed',s:'Al Jazeera'},
  {d:'2026-03-20',cat:'humanitarian',imp:'e',t:'Lebanon evacuations south of Zahrani River — death toll exceeds 1,000',tags:['Lebanon','Israel'],
   tx:'Lebanese authorities ordered mass evacuations south of the Zahrani River as Israeli bombardment intensified. The country\'s death toll surpassed 1,000 with over 1 million displaced. UN agencies warned that Lebanon\'s health system had effectively collapsed in the south, with hospitals operating without electricity or supplies.',
   l:'https://apnews.com/article/lebanon-zahrani-evacuation-death-toll-2026',s:'AP'},
  {d:'2026-03-20',cat:'general',imp:'e',t:'UAE arrests 5 Iran/Hezbollah network members — intelligence cooperation with Mossad suspected',tags:['UAE','Iran','Lebanon'],
   tx:'UAE security forces arrested five individuals linked to an Iranian intelligence and Hezbollah network operating within the country. The arrests followed weeks of heightened counterintelligence activity. Regional media reported suspected Mossad cooperation in identifying the cell, though both governments declined comment.',
   l:'https://www.reuters.com/world/middle-east/uae-arrests-iran-hezbollah-network-2026-03-20',s:'Reuters'},
  {d:'2026-03-20',cat:'aviation',imp:'n',t:'All eastern airways remain closed — Nowruz/Eid brings no operational change to Middle East airspace',tags:['Iran','Iraq','Kuwait','Bahrain'],
   tx:'Despite hopes that the Nowruz and Eid holidays might produce a temporary de-escalation, all NOTAMs restricting Iranian, Iraqi, Kuwaiti, and Bahraini airspace remained in force. OPSGROUP reported no change to the airspace situation and advised carriers to continue using southern bypass routes through Omani airspace.',
   l:'https://ops.group/blog/middle-east-airspace-update-march-20-2026',s:'OPSGROUP'},
  {d:'2026-03-20',cat:'stocks',imp:'n',t:'Gold crashes to $4,489/oz — biggest weekly plunge since 1983 as margin calls force liquidation',tags:['USA'],
   tx:'Gold prices fell 1.1% to $4,501 per ounce, extending losses for an eighth consecutive session as central banks maintained hawkish stances despite the ongoing conflict. The decline reflected profit-taking and expectations that interest rates would remain elevated to combat war-driven inflation.',
   l:'https://www.kitco.com/news/2026-03-20/gold-declines-4501-hawkish-central-banks',s:'Kitco'},
  {d:'2026-03-20',cat:'diplomatic',imp:'e',t:'UN Security Council adopts Bahrain-led resolution condemning Iran — Russia and China veto competing text',tags:['USA','Iran','France','UK'],
   tx:'The UN Security Council adopted a Bahrain-led resolution condemning Iranian attacks on neighboring states and obstructing navigation through the Strait of Hormuz, while a competing Russian-Chinese draft calling for a ceasefire was vetoed. The resolution marked the Council\'s first formal action on the conflict. Russia\'s envoy accused the adopted text of ignoring coalition strikes on Iran.',
   l:'https://www.passblue.com/2026/03/20/un-security-council-iran-resolution',s:'PassBlue'},
  {d:'2026-03-20',cat:'military',imp:'e',t:'IDF strikes Bandar Anzali on Caspian Sea — IRIS Deylaman frigate and dozens of vessels destroyed',tags:['Iran','Israel'],
   tx:'Israeli warplanes struck Iran\'s Bandar Anzali naval port on the Caspian Sea coast, destroying dozens of vessels including the IRIS Deylaman frigate. The strike cut a key Iran-Russia supply line and marked the furthest north Israeli operations have reached into Iranian territory.',
   l:'https://www.nbcnews.com/news/world/israel-strikes-iran-caspian-bandar-anzali-2026',s:'NBC News'},
  {d:'2026-03-20',cat:'military',imp:'e',t:'Coalition forces have destroyed approximately 85% of Iran\'s surface-to-air missile systems',tags:['USA','Israel','Iran'],
   tx:'Combined US and Israeli strikes have neutralized an estimated 85% of Iran\'s SAM batteries. Key strikes hit the Shahroud Missile Facility, Khorgu Missile Base, and Borazjan sites. The degradation of Iran\'s air defenses has enabled deeper penetration of Iranian airspace with reduced risk.',
   l:'https://www.isw.pub/2026-iran-air-defense-assessment',s:'ISW'},
  {d:'2026-03-20',cat:'military',imp:'e',t:'Hezbollah fires long-range missile at Ashkelon — 200km range marks new escalation from Lebanon',tags:['Lebanon','Israel'],
   tx:'Hezbollah launched a long-range missile that struck the Ashkelon area, roughly 200 kilometers from the Lebanese border. The strike represented a significant increase in Hezbollah\'s demonstrated range capability and prompted Israel to expand its evacuation orders in southern communities.',
   l:'https://www.timesofisrael.com/hezbollah-ashkelon-long-range-2026',s:'Times of Israel'},
  {d:'2026-03-20',cat:'military',imp:'n',t:'USS Boxer Amphibious Ready Group deploying from California; USS Tripoli arriving from Japan',tags:['USA'],
   tx:'The Pentagon confirmed deployment of the USS Boxer Amphibious Ready Group with the 11th Marine Expeditionary Unit from California, while the USS Tripoli was arriving from its forward base in Japan. The deployments add to the growing US naval presence in the theater.',
   l:'https://www.defense.gov/News/Releases/Release/Article/2026-boxer-tripoli-deployment',s:'DoD'},
  {d:'2026-03-20',cat:'diplomatic',imp:'d',t:'Trump tells Netanyahu to stop targeting energy infrastructure — Netanyahu agrees to hold off',tags:['USA','Israel','Iran'],
   tx:'In a call reported by multiple outlets, President Trump urged Israeli PM Netanyahu to cease strikes on Iranian energy infrastructure, citing global market disruption. Netanyahu reportedly agreed to pause energy-targeted operations, though strikes on military targets continued unabated.',
   l:'https://www.axios.com/2026/03/20/trump-netanyahu-energy-infrastructure-iran',s:'Axios'},
  {d:'2026-03-20',cat:'diplomatic',imp:'e',t:'US bypasses Congress for $23B weapons sales to UAE, Kuwait, and Jordan',tags:['USA','UAE','Kuwait','Jordan'],
   tx:'The State Department invoked emergency authority to bypass congressional review for $23 billion in arms sales to three coalition partners: UAE, Kuwait, and Jordan. The package includes air defense systems, precision munitions, and spare parts for F-16 fleets.',
   l:'https://www.reuters.com/world/middle-east/us-weapons-sales-uae-kuwait-jordan-2026-03-20',s:'Reuters'},
  {d:'2026-03-20',cat:'diplomatic',imp:'d',t:'EU calls for de-escalation — demands moratorium on energy and water infrastructure strikes',tags:['France','Germany','Italy'],
   tx:'The European Union issued a formal statement calling for immediate de-escalation and a moratorium on strikes targeting energy and water infrastructure on all sides. The EU also called for the reopening of the Strait of Hormuz to commercial navigation.',
   l:'https://www.consilium.europa.eu/en/press/press-releases/2026/03/20/iran-statement/',s:'EU Council'},
  {d:'2026-03-20',cat:'diplomatic',imp:'n',t:'UK condemns Iran\'s targeting of commercial shipping — calls for freedom of navigation',tags:['UK','Iran'],
   tx:'The UK Foreign Secretary issued a statement condemning Iran\'s targeting of commercial shipping in the Persian Gulf and Strait of Hormuz, calling it a violation of international maritime law and reaffirming the UK\'s commitment to freedom of navigation.',
   l:'https://www.gov.uk/government/news/uk-statement-iran-commercial-shipping-2026',s:'UK Gov'},
  {d:'2026-03-20',cat:'humanitarian',imp:'e',t:'Iran in "digital darkness" — internet blackout enters 21st day with 480+ hours of disruption',tags:['Iran'],
   tx:'Iran\'s internet blackout has now lasted 21 days and over 480 hours, cutting off tens of millions from digital communication. The blackout, imposed shortly after coalition strikes began, has hampered humanitarian coordination, media reporting, and civilian access to banking and emergency services.',
   l:'https://netblocks.org/reports/iran-internet-shutdown-2026-march',s:'NetBlocks'},
  {d:'2026-03-20',cat:'general',imp:'n',t:'Supreme Leader Mojtaba Khamenei delivers Nowruz message — vows "resistance until victory"',tags:['Iran'],
   tx:'Iran\'s new Supreme Leader Mojtaba Khamenei, who assumed the role after his father\'s death, delivered a Nowruz address vowing that Iran would continue its resistance against the "Zionist-American aggression" and that the Islamic Republic would emerge stronger from the conflict.',
   l:'https://www.aljazeera.com/news/2026/3/20/iran-khamenei-nowruz-address',s:'Al Jazeera'},
  {d:'2026-03-20',cat:'diplomatic',imp:'d',t:'Zelenskyy: Ukraine peace talks resuming after pause caused by Iran war',tags:['USA','Iran'],
   tx:'Ukrainian President Zelenskyy said peace negotiations between Ukraine and Russia, which had stalled after the eruption of the Iran conflict drew US attention away, were set to resume. The development suggested the US was attempting to manage two simultaneous diplomatic tracks.',
   l:'https://www.bbc.co.uk/news/world-europe-2026-zelenskyy-peace-talks',s:'BBC'},
  {d:'2026-03-20',cat:'humanitarian',imp:'e',t:'WFP warns 45 million could face acute hunger — Hormuz closure disrupting food supply chains',tags:['Iran','Yemen','Lebanon'],
   tx:'The World Food Programme warned that up to 45 million people across the Middle East and Horn of Africa could face acute hunger due to the disruption of food supply chains caused by the Strait of Hormuz closure and ongoing military operations. Yemen and Lebanon were identified as most at risk.',
   l:'https://www.wfp.org/news/middle-east-hunger-crisis-2026',s:'WFP'},
  {d:'2026-03-20',cat:'stocks',imp:'e',t:'S&P 500 heads for 4th straight weekly loss — down 1.63% on energy volatility and war fears',tags:['USA'],
   tx:'The S&P 500 fell 1.63% to 6,498.80, heading for a fourth consecutive weekly decline as energy market volatility and escalating military operations weighed on investor sentiment. Defense stocks outperformed while airlines and energy-intensive sectors lagged.',
   l:'https://www.cnbc.com/2026/03/20/stock-market-today-sp-500-weekly-loss.html',s:'CNBC'},
  {d:'2026-03-20',cat:'diplomatic',imp:'d',t:'Trump says US "considering winding down" military efforts — claims US has "won" the war',tags:['USA','Iran'],
   tx:'President Trump posted on Truth Social that the US is "very close to meeting our objectives." He told reporters the US has won. Iran dismissed the claim as "psychological operations to control the markets," noting no reduction in military activity. Thousands more Marines are deploying to the region even as Trump suggests winding down.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-20-26',s:'CNN'},
  {d:'2026-03-20',cat:'stocks',imp:'d',t:'US lifts sanctions on 140 million barrels of Iranian oil afloat to ease global prices',tags:['USA','Iran'],
   tx:'The Trump administration granted a temporary one-month license allowing purchase of 140 million barrels of Iranian oil sitting on tankers at sea. The paradox: financing the enemy to fight rising energy prices. Iran was already selling to China through the blocked Strait. The move aims to redirect supply to Western allies.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-20-26',s:'CNN'},
  {d:'2026-03-20',cat:'diplomatic',imp:'d',t:'Bahrain joins multinational effort to reopen Strait of Hormuz — first regional country to commit',tags:['Bahrain','Iran','USA','UK'],
   tx:'Bahrain joined EU nations, Japan, and Canada in expressing readiness to help reopen the Strait of Hormuz. It is the first regional country to publicly commit. The UK separately announced it will allow the US to use its military bases to strike Iranian missile sites targeting ships in the waterway.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-20-26',s:'CNN'},
  {d:'2026-03-20',cat:'military',imp:'e',t:'Iran threatens "heavy strikes" on UAE\'s Ras al-Khaimah if Iranian islands attacked again',tags:['Iran','UAE'],
   tx:'Iran warned the UAE that any renewed aggression against the Iranian islands of Abu Musa and Greater Tunb in the Gulf would result in heavy strikes on the port city of Ras al-Khaimah. The warning came from an IRGC spokesperson via state broadcaster IRIB.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-20-26',s:'CNN'},
  {d:'2026-03-20',cat:'military',imp:'e',t:'US Embassy Baghdad logistics base targeted three times — Embassy urges all US citizens to leave Iraq',tags:['Iraq','Iran','USA'],
   tx:'Iran claims it targeted the US Embassy logistics base in Baghdad three times on Friday. The Embassy issued a security notice urging all US citizens to leave immediately, warning that Iran-aligned militias have encouraged widespread attacks throughout Iraq.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-20-26',s:'CNN'},
  {d:'2026-03-20',cat:'military',imp:'n',t:'Hezbollah missile fragment strikes Jerusalem\'s Old City near holy sites during Iranian attack wave',tags:['Israel','Iran','Lebanon'],
   tx:'Part of a falling missile struck Jerusalem\'s Old City near holy sites during an Iranian missile barrage. A fire broke out in Haifa and interception fragments fell in Jerusalem. No casualties reported. Israeli military says Hezbollah missile stocks reduced to one-sixth of pre-2023 Gaza war levels.',
   l:'https://www.nytimes.com/2026/03/20/world/middleeast/iran-war-middle-east-recap.html',s:'NYT'},
  {d:'2026-03-20',cat:'stocks',imp:'e',t:'Russell 2000 enters correction territory — Dow falls 447 points as war ripples through markets',tags:['USA'],
   tx:'The Russell 2000 index fell 2.7% and entered correction territory, down 10%+ from its January peak. The Dow dropped 447 points (0.97%). The Nasdaq slumped 2.01%. Ten-year Treasury yields jumped to 4.39%, highest since July. Goldman Sachs warned high oil prices could persist through 2027.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-20-26',s:'CNN'},
  {d:'2026-03-20',cat:'general',imp:'n',t:'US gas prices hit $3.91/gallon — Georgia suspends gas tax for two months',tags:['USA'],
   tx:'The national average gas price reached $3.91 per gallon, highest since October 2022. Americans have spent $4.5 billion more at the pump since the war began. Georgia Gov. Kemp signed a two-month gas tax holiday suspending 33.3 cents per gallon. A typical two-car household is spending $20-40/week more on gas.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-20-26',s:'CNN'},
  {d:'2026-03-20',cat:'military',imp:'e',t:'2,500 additional US Marines deploying on three warships — Trump declares second wartime emergency',tags:['USA','Iran'],
   tx:'The US is sending approximately 2,500 additional Marines aboard three warships to the Middle East. They will replace Marines deployed from Japan last week. The Trump administration also declared a wartime emergency for the second time, bypassing congressional approval for over $23 billion in weapons sales to regional allies.',
   l:'https://www.nytimes.com/2026/03/20/world/middleeast/iran-war-middle-east-recap.html',s:'NYT'},
  {d:'2026-03-20',cat:'humanitarian',imp:'e',t:'Death toll surpasses 2,300 — Iran 1,444 killed, Lebanon 1,001, 13 US service members',tags:['Iran','Lebanon','USA','Israel'],
   tx:'More than 2,300 people have been killed since the war began. Iran\'s Health Ministry reports 1,444 dead and 18,551 injured, including 168 children killed in a school bombing in Minab and 200 women. Lebanon\'s Health Ministry reports 1,001 killed including 118 children, with over 1 million displaced. 13 US service members killed. Israeli death toll at 18.',
   l:'https://www.aljazeera.com/news/2026/3/1/us-israel-attacks-on-iran-death-toll-and-injuries-live-tracker',s:'Al Jazeera'},

  {d:'2026-03-21',cat:'military',imp:'e',t:'Iran fires 2 IRBMs at Diego Garcia — reveals 4,000km range capability; neither missile hits',tags:['Iran','USA','UK'],
   tx:'Iran launched two intermediate-range ballistic missiles at the US/UK military base on Diego Garcia in the Indian Ocean, approximately 4,000 km from Iranian territory. The strike revealed a previously unknown range capability — Iran had previously claimed a maximum missile range of 2,000 km. Neither missile struck the base. The Pentagon confirmed the attack and said no casualties or damage were sustained.',
   l:'https://www.reuters.com/world/middle-east/iran-fires-missiles-diego-garcia-2026-03-21',s:'Reuters'},
  {d:'2026-03-21',cat:'military',imp:'e',t:'Israel launches overnight strikes on "regime targets" in Tehran and Hezbollah targets in Beirut',tags:['Israel','Iran','Lebanon'],
   tx:'The IDF conducted a wave of overnight airstrikes hitting what it described as "regime infrastructure targets" in Tehran and Hezbollah command facilities in southern Beirut. In Lebanon, 1 person was killed and 2 wounded in an Israeli airstrike on the village of Ghandouriyeh, according to state media. Iran\'s air defense forces attempted intercepts but multiple explosions were reported across eastern Tehran.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-21-26',s:'CNN'},
  {d:'2026-03-21',cat:'military',imp:'e',t:'Iran fires missiles at Israel 3 times in 6 hours — air raid sirens sound across the country',tags:['Iran','Israel'],
   tx:'Iran launched three separate missile salvos at Israel within a six-hour period overnight, triggering air raid sirens across the country. The IDF said most incoming projectiles were intercepted by the Arrow and Iron Dome systems. At least two projectiles impacted in open areas in the Negev. No casualties were reported.',
   l:'https://www.timesofisrael.com/liveblog-march-21-2026',s:'Times of Israel'},
  {d:'2026-03-21',cat:'military',imp:'e',t:'Saudi Arabia intercepts 22+ drones overnight in eastern region — UAE and Kuwait also under attack',tags:['Saudi Arabia','UAE','Kuwait','Iran'],
   tx:'The Saudi defense ministry said it intercepted more than 22 drones targeting eastern Saudi Arabia overnight, with some debris falling near residential areas. The UAE also reported intercepting multiple projectiles over Abu Dhabi and Dubai. Kuwait said its air defense systems engaged an unspecified number of incoming threats targeting the Al-Ahmadi area.',
   l:'https://www.reuters.com/world/middle-east/saudi-intercepts-drones-2026-03-21',s:'Reuters'},
  {d:'2026-03-21',cat:'stocks',imp:'e',t:'Iraq declares force majeure on all foreign-operated oilfields — Basra output crashes from 3.3M to 900K bpd',tags:['Iraq'],
   tx:'Iraq declared force majeure on all contracts with foreign oil companies, effective immediately via a letter dated March 17. Basra production fell from 3.3 million barrels per day to approximately 900,000 bpd. The Iraqi Oil Ministry cited "ongoing hostilities and infrastructure damage" rendering normal operations impossible. BP, Shell, ExxonMobil, and TotalEnergies all confirmed receiving force majeure notices.',
   l:'https://www.reuters.com/business/energy/iraq-force-majeure-oilfields-2026-03-21',s:'Reuters'},
  {d:'2026-03-21',cat:'diplomatic',imp:'d',t:'Iran offers to let Japanese ships through Hormuz — FM Araghchi signals selective opening',tags:['Iran','Japan'],
   tx:'Iranian Foreign Minister Abbas Araghchi told Kyodo News that Iran was willing to allow Japanese-flagged vessels safe passage through the Strait of Hormuz, expanding the selective "vetting system" beyond Chinese-flagged ships. Araghchi said Iran had "no quarrel with Japan" and that the offer was contingent on Japan not joining coalition military operations. Japan\'s Foreign Ministry acknowledged the communication but declined to comment further.',
   l:'https://english.kyodonews.net/news/2026/03/iran-hormuz-japan-passage.html',s:'Kyodo'},
  {d:'2026-03-21',cat:'general',imp:'e',t:'IEA urges work-from-home and reduced highway speeds to ease fuel crisis',tags:['USA','UK','France'],
   tx:'The International Energy Agency published emergency recommendations urging governments and citizens to reduce fuel consumption in response to the largest oil supply disruption in history. Recommendations include mandatory work-from-home policies, reducing highway speed limits by at least 6 mph, and prioritizing public transport. IEA chief Fatih Birol warned it could take months or years to restore Middle East oil and gas flows.',
   l:'https://www.iea.org/reports/oil-market-emergency-measures-2026',s:'IEA'},
  {d:'2026-03-21',cat:'aviation',imp:'e',t:'United Airlines cancels 5% of flights citing $11B extra annual fuel cost — F-35 emergency landing confirmed',tags:['USA'],
   tx:'United Airlines announced it would cancel approximately 5% of flights system-wide due to soaring jet fuel costs, which the airline estimated at $11 billion in additional annual expenses. Separately, the Pentagon confirmed an F-35A Lightning II made an emergency landing at an undisclosed Gulf airfield after sustaining damage from what officials described as "hostile fire" — potentially the first fifth-generation fighter hit in combat.',
   l:'https://www.cnbc.com/2026/03/21/united-airlines-cuts-flights-fuel-costs.html',s:'CNBC'},
  {d:'2026-03-21',cat:'diplomatic',imp:'e',t:'Trump says "no ceasefire" and calls NATO allies "cowards" and "paper tiger without the US"',tags:['USA'],
   tx:'President Trump told reporters there would be "no ceasefire" and that the US military operation would continue until Iran\'s military capabilities were fully neutralized. He called NATO allies "cowards" for not joining the campaign and described the alliance as "a paper tiger without the United States." He also said he would not send ground troops but "would certainly not tell you if I were."',
   l:'https://www.nytimes.com/2026/03/21/world/middleeast/trump-no-ceasefire-nato.html',s:'NYT'},
  {d:'2026-03-21',cat:'diplomatic',imp:'n',t:'UK approves US use of bases for "defensive operations" degrading Hormuz missile sites — Trump criticizes delay',tags:['UK','USA'],
   tx:'The UK government approved US use of British military bases including RAF Akrotiri in Cyprus and facilities in the Indian Ocean for "defensive operations" aimed at degrading Iranian missile sites threatening the Strait of Hormuz. President Trump criticized London for acting "a lot slower" than necessary in granting access, saying the delay "cost lives."',
   l:'https://www.bbc.com/news/uk-politics-67890123',s:'BBC'},
  {d:'2026-03-21',cat:'military',imp:'e',t:'IRGC Gen Shekarchi threatens strikes on "parks, recreational areas and tourist destinations" globally',tags:['Iran'],
   tx:'IRGC spokesman Brigadier General Abolfazl Shekarchi issued a statement threatening that Iran would target "parks, recreational areas and tourist destinations" of enemy nations if attacks on Iranian civilian areas continued. Western intelligence agencies assessed the threat as serious and several European nations raised their domestic terror threat levels in response.',
   l:'https://www.reuters.com/world/middle-east/iran-general-threatens-tourist-sites-2026-03-21',s:'Reuters'},
  {d:'2026-03-21',cat:'humanitarian',imp:'e',t:'Lebanon: 1 killed, 2 wounded in Israeli airstrike on Ghandouriyeh — cumulative death toll nearing 1,050',tags:['Lebanon','Israel'],
   tx:'Lebanese state media reported that an Israeli airstrike on the village of Ghandouriyeh in southern Lebanon killed one person and wounded two others. The cumulative Lebanese death toll since the start of the conflict is nearing 1,050, with displacement now exceeding 1.29 million people. Hospitals in southern Lebanon report critical shortages of blood supplies and surgical equipment.',
   l:'https://www.aljazeera.com/news/2026/3/21/lebanon-ghandouriyeh-strike',s:'Al Jazeera'},
  {d:'2026-03-21',cat:'maritime',imp:'d',t:'Iran developing expanded Hormuz vetting — ~10 ships through corridor as Japan offer widens access',tags:['Iran','Japan'],
   tx:'Iran\'s selective Hormuz "vetting system" continued to evolve, with approximately 10 ships transiting the safe corridor on Saturday — up from 9 the previous day. The offer to Japanese vessels could significantly increase traffic if formalized. Coalition naval forces continued mine clearance operations but reported no major incidents.',
   l:'https://www.bloomberg.com/news/articles/2026-03-21/hormuz-passage-japan-ships',s:'Bloomberg'},
  {d:'2026-03-21',cat:'diplomatic',imp:'e',t:'Saudi Arabia condemns Israeli strikes on Syrian army camps in Suwayda as "aggression against a sovereign state"',tags:['Saudi Arabia','Syria','Israel'],
   tx:'The Saudi Foreign Ministry condemned Israeli strikes on Syrian Army camps in Suwayda province as "aggression against a sovereign state" and called on Israel to cease operations beyond Iranian territory. The statement marked a rare Saudi criticism of Israeli military action during the conflict, reflecting Riyadh\'s concern about the war\'s geographic expansion.',
   l:'https://www.reuters.com/world/middle-east/saudi-condemns-israel-syria-strikes-2026-03-21',s:'Reuters'},
  {d:'2026-03-22',cat:'military',imp:'e',t:'US/Israeli strikes hit Natanz nuclear enrichment facility — IAEA confirms no radioactive leaks',tags:['USA','Israel','Iran'],
   tx:'Overnight coalition strikes targeted Iran\'s Natanz uranium enrichment complex, the first direct strike on Iranian nuclear infrastructure since the conflict began. IAEA inspectors confirmed no radioactive material was released but called for "immediate restraint." Iran called it "crossing the ultimate red line" and vowed retaliation. The strike destroyed above-ground centrifuge halls but left deep underground facilities intact.',
   l:'https://www.nytimes.com/2026/03/22/world/middleeast/natanz-nuclear-strike-iran.html',s:'New York Times'},
  {d:'2026-03-22',cat:'military',imp:'e',t:'CENTCOM: 8,000+ targets struck since Feb 28 — "Iran\'s Navy is not sailing, their fighters not flying"',tags:['USA','Iran'],
   tx:'Admiral Brad Cooper released a video statement declaring that coalition forces had struck over 8,000 targets and destroyed 130 Iranian naval vessels since operations began. "Their Navy is not sailing. Their tactical fighters are not flying," Cooper said. The Pentagon assessed that Iran\'s conventional military capacity had been degraded by approximately 60%.',
   l:'https://www.cnn.com/2026/03/22/politics/centcom-8000-targets-iran-military/index.html',s:'CNN'},
  {d:'2026-03-22',cat:'diplomatic',imp:'d',t:'22 countries sign Hormuz safe passage statement — UAE first Arab Gulf state to join',tags:['UAE','UK','France','Germany','Japan','Bahrain'],
   tx:'A coalition of 22 nations including the UK, France, Germany, Japan, South Korea, and Bahrain signed a joint statement demanding unimpeded passage through the Strait of Hormuz. The UAE became the first Arab Gulf state to co-sign, marking a significant diplomatic shift. Iran\'s FM Araghchi called the statement "irrelevant posturing" while parliament debated Hormuz transit fees.',
   l:'https://www.reuters.com/world/middle-east/22-nations-hormuz-passage-statement-2026-03-22',s:'Reuters'},
  {d:'2026-03-22',cat:'military',imp:'e',t:'Israel Defense Minister Katz vows strikes will "escalate significantly" next week',tags:['Israel','Iran'],
   tx:'Defense Minister Israel Katz declared that Israeli military operations would "escalate significantly" in the coming week, warning that "no target in Iran is off limits." The statement came hours after the Natanz strike and was interpreted as signaling potential strikes on additional nuclear facilities or senior leadership targets.',
   l:'https://www.timesofisrael.com/katz-vows-escalation-iran-strikes-2026-03-22/',s:'Times of Israel'},
  {d:'2026-03-22',cat:'military',imp:'e',t:'ISW: Mojtaba Khamenei likely incapacitated — no public appearance in 3 weeks',tags:['Iran'],
   tx:'The Institute for the Study of War assessed with "moderate-to-high confidence" that Iranian Supreme Leader Mojtaba Khamenei had been incapacitated, possibly in an Israeli strike. No public appearances in three weeks; only written statements and recycled imagery released. A senior Israeli official told Axios: "We have no evidence that he is really the one giving orders." IRGC command structure appeared to be operating autonomously.',
   l:'https://www.understandingwar.org/backgrounder/iran-crisis-update-march-22-2026',s:'ISW'},
  {d:'2026-03-22',cat:'military',imp:'e',t:'IDF kills Basij Intelligence Chief Esmail Ahmadi in targeted strike',tags:['Israel','Iran'],
   tx:'The Israeli Air Force confirmed killing Esmail Ahmadi, head of Basij intelligence operations, in a precision strike on a command facility in Isfahan. Ahmadi was the most senior Basij official killed since the conflict began and was believed to coordinate domestic surveillance and militia mobilization across Iran.',
   l:'https://www.jpost.com/breaking-news/article-basij-intelligence-chief-killed-2026-03-22',s:'Jerusalem Post'},
  {d:'2026-03-22',cat:'military',imp:'e',t:'Saudi intercepts 47+ drones overnight — 38 in concentrated 3-hour barrage targeting Aramco facilities',tags:['Saudi Arabia','Iran'],
   tx:'Saudi air defenses intercepted over 47 drones targeting eastern oil infrastructure, including 38 in a concentrated three-hour overnight barrage aimed at Aramco\'s Ras Tanura export terminal. Several drone fragments fell within the Dhahran residential compound. Total intercepted since conflict start: 143 missiles, 242+ drones across Gulf coalition states.',
   l:'https://www.aljazeera.com/news/2026/3/22/saudi-intercepts-47-drones-aramco-barrage',s:'Al Jazeera'},
  {d:'2026-03-22',cat:'military',imp:'e',t:'Hezbollah 4-hour ground clash with IDF at Khiam — heaviest infantry engagement of conflict',tags:['Lebanon','Israel'],
   tx:'Hezbollah fighters engaged IDF forces in a four-hour ground battle near the southern Lebanese town of Khiam, the heaviest infantry engagement since the conflict began. The IDF reported 3 soldiers wounded. Hezbollah claimed to have destroyed two Merkava tanks with Kornet ATGMs. Heavy storms in Beirut complicated Israeli air operations but strikes continued on 7 areas of southern Beirut.',
   l:'https://www.reuters.com/world/middle-east/hezbollah-idf-ground-clash-khiam-2026-03-22',s:'Reuters'},
  {d:'2026-03-22',cat:'humanitarian',imp:'e',t:'Lebanon death toll surpasses 1,000 killed — fresh evacuation warnings for 7 areas of southern Beirut',tags:['Lebanon','Israel'],
   tx:'Lebanon\'s Health Ministry confirmed the cumulative death toll had surpassed 1,000, with over 2,600 injured since Israeli operations intensified. Fresh evacuation warnings were issued for seven areas of southern Beirut amid heavy storms. UNHCR reported approximately 200,000 internally displaced within Lebanon, with shelters at 140% capacity.',
   l:'https://www.bbc.com/news/world-middle-east-lebanon-death-toll-1000-2026-03-22',s:'BBC'},
  {d:'2026-03-22',cat:'maritime',imp:'n',t:'Iran parliament debates Hormuz transit fees — Ghalibaf: "Hormuz won\'t return to pre-war status"',tags:['Iran'],
   tx:'Iranian parliament speaker Mohammad Bagher Ghalibaf declared that "the Hormuz situation will not return to pre-war status" as lawmakers debated legislation to impose transit fees on vessels passing through the strait. The proposed fees ranged from $50,000 to $500,000 per vessel depending on flag state and cargo type. An estimated 2,000 ships and 20,000 seafarers remained trapped in the region according to the IMO.',
   l:'https://www.ft.com/content/iran-hormuz-transit-fees-parliament-2026-03-22',s:'Financial Times'},
  {d:'2026-03-22',cat:'stocks',imp:'n',t:'Markets closed Sunday — Brent $112.19, WTI $98.23 carry-forward; Panama Canal at max capacity',tags:['USA'],
   tx:'Global energy and commodity markets were closed for Sunday trading. Friday\'s closing prices carried forward: Brent crude $112.19/bbl, WTI $98.23/bbl, gold $4,489/oz. The Panama Canal reached maximum operating capacity of 36-38 vessels per day as LNG tanker traffic surged due to rerouting around the Middle East conflict zone. IEA had released 400 million barrels from strategic reserves.',
   l:'https://www.tradingeconomics.com/commodity/crude-oil',s:'Trading Economics'},
  {d:'2026-03-22',cat:'diplomatic',imp:'e',t:'Axios: Washington considering plans to blockade or occupy Iran\'s Kharg Island oil terminal',tags:['USA','Iran'],
   tx:'Axios reported that senior Pentagon and NSC officials were actively considering plans to blockade or physically occupy Kharg Island, through which 90% of Iran\'s oil exports flow. The proposal aimed to eliminate Iran\'s remaining revenue stream. Critics warned it could trigger direct Iranian retaliation against US naval forces and potentially draw China into the conflict, given Beijing\'s dependence on Iranian crude.',
   l:'https://www.axios.com/2026/03/22/us-kharg-island-blockade-plan-iran',s:'Axios'},
  {d:'2026-03-22',cat:'military',imp:'e',t:'Iraq intelligence HQ in Baghdad hit by drone — 1 officer killed, 1 wounded',tags:['Iraq','Iran'],
   tx:'A drone struck the Iraqi National Intelligence Service headquarters in central Baghdad, killing one officer and wounding another. No faction claimed responsibility, though Iraqi officials suspected an Iran-aligned militia. The attack underscored the collapse of Iraqi sovereignty as the country became a secondary theater in the Iran-coalition conflict.',
   l:'https://www.aljazeera.com/news/2026/3/22/iraq-intelligence-hq-baghdad-drone-strike',s:'Al Jazeera'},
  {d:'2026-03-22',cat:'aviation',imp:'n',t:'Bahrain air raid sirens sound as missile fragments land 350m from Al-Aqsa Mosque compound',tags:['Bahrain','Israel','Iran'],
   tx:'Air raid sirens sounded across Bahrain as Iranian-launched projectiles were intercepted overhead. Separately, missile fragments from Iranian strikes on Israel landed approximately 350 meters from the Al-Aqsa Mosque compound in Jerusalem, prompting international condemnation. Jordan\'s King Abdullah called the near-miss "an unconscionable threat to one of Islam\'s holiest sites."',
   l:'https://www.bbc.com/news/world-middle-east-bahrain-sirens-al-aqsa-2026-03-22',s:'BBC'},
  {d:'2026-03-22',cat:'general',imp:'n',t:'13 European countries + Canada condemn West Bank settler violence — 6 Palestinians killed this month',tags:['Israel'],
   tx:'Thirteen European countries and Canada issued a joint statement condemning "settler terror" in the West Bank, where six Palestinians had been killed in settler attacks during March. The statement called on Israel to "immediately disarm and prosecute violent settlers." Two people were also charged in the UK for attempting to enter the Trident submarine base in Scotland, in an incident linked to anti-war protests.',
   l:'https://www.theguardian.com/world/2026/mar/22/european-countries-condemn-west-bank-settler-violence',s:'The Guardian'},
  {d:'2026-03-23',cat:'diplomatic',imp:'e',t:'Trump issues 48-hour ultimatum: open Hormuz or US will "obliterate" Iran\'s power plants',tags:['USA','Iran'],
   tx:'President Trump posted on Truth Social late Saturday demanding Iran "FULLY OPEN, WITHOUT THREAT, the Strait of Hormuz, within 48 HOURS" or face strikes on power plants "STARTING WITH THE BIGGEST ONE FIRST." Treasury Secretary Bessent told Fox News: "Sometimes you have to escalate to de-escalate." Trump claimed Iran\'s "leadership is gone, their navy and air force are dead, they have absolutely no defense."',
   l:'https://www.aljazeera.com/news/2026/3/23/trump-48-hour-hormuz-ultimatum',s:'Al Jazeera'},
  {d:'2026-03-23',cat:'military',imp:'e',t:'IRGC counter-threat: will "completely close" Hormuz if power plants hit — targets regional energy infrastructure',tags:['Iran','UAE','Saudi Arabia','Kuwait','Qatar'],
   tx:'The IRGC declared it would "completely close" the Strait of Hormuz if power plants are struck and not reopen "until our destroyed power plants are rebuilt." Iran also threatened to target power plants and energy infrastructure in Israel and "any similar companies in the region" with American shareholders. IRGC-affiliated Mehr News released a map showing power plants across UAE, Saudi Arabia, Qatar, and Kuwait captioned "Say goodbye to electricity!"',
   l:'https://www.bbc.com/news/world-middle-east-irgc-hormuz-counter-threat-2026-03-23',s:'BBC'},
  {d:'2026-03-23',cat:'military',imp:'e',t:'Iranian missiles strike Dimona and Arad — 160+ injured near Israeli nuclear facility',tags:['Iran','Israel'],
   tx:'Iranian missiles broke through Israeli air defenses in southern Israel, making direct impacts in the cities of Dimona and Arad, injuring more than 160 people (84 in Arad, 78 in Dimona). The IRGC said it targeted military installations in Arad, Dimona, Eilat, Beersheba, and Kiryat Gat. The IAEA confirmed no damage to the Negev nuclear research center. Netanyahu visited Arad and called it "a miracle" no one was killed. Israel canceled all in-person classes and banned gatherings >50 in the south.',
   l:'https://www.aljazeera.com/news/2026/3/23/iranian-missiles-dimona-arad-israel',s:'Al Jazeera'},
  {d:'2026-03-23',cat:'military',imp:'e',t:'IDF kills IRGC Drone Commander BG Saeed Agha Jani — directed drone ops for Russia and proxies',tags:['Israel','Iran'],
   tx:'Israeli forces killed Brigadier General Saeed Agha Jani, commander of the IRGC Aerospace Force Drone Unit. Agha Jani had directed planning for Iran\'s drone operations, overseen drone provision to Russia for its war in Ukraine, and coordinated drone transfers to allied proxy forces. The US had offered a $10 million reward for information leading to his capture.',
   l:'https://www.bbc.com/news/world-middle-east-idf-kills-irgc-drone-commander-2026-03-23',s:'BBC'},
  {d:'2026-03-23',cat:'military',imp:'e',t:'US strikes Natanz nuclear facility again with bunker busters — second strike in 48 hours',tags:['USA','Iran'],
   tx:'US forces conducted a second round of bunker-buster strikes on the Natanz nuclear enrichment facility, following the initial strike on March 22. CENTCOM confirmed multiple 5,000-pound bombs also hit an underground antiship cruise missile storage facility along Iran\'s coast, undermining Iran\'s ability to threaten the Strait of Hormuz.',
   l:'https://www.reuters.com/world/middle-east/us-strikes-natanz-second-time-2026-03-23',s:'Reuters'},
  {d:'2026-03-23',cat:'military',imp:'e',t:'Saudi intercepts ~60 Iranian drones + 3 ballistic missiles; expels Iranian diplomats',tags:['Saudi Arabia','Iran'],
   tx:'Saudi Arabia intercepted nearly 60 drones, a majority targeting the Eastern Province\'s energy facilities, and three ballistic missiles launched toward Riyadh province. Saudi Arabia declared many Iranian diplomatic staff, including the military attaché, persona non grata, ordering them to leave within 24 hours. Qatar had taken similar action the previous day.',
   l:'https://www.aljazeera.com/news/2026/3/23/saudi-intercepts-60-drones-expels-diplomats',s:'Al Jazeera'},
  {d:'2026-03-23',cat:'military',imp:'e',t:'IDF destroying bridges over Litani River — Lebanese president calls it "prelude to ground invasion"',tags:['Israel','Lebanon'],
   tx:'Israeli forces systematically destroyed bridges over the Litani River in southern Lebanon. Lebanese President Joseph Aoun called the destruction a "prelude to a ground invasion." Four people were killed in strikes on Sultaniyeh and Marjeyoun. Hezbollah claimed 45 attacks on Israeli positions, and the IDF reported killing 9 Hezbollah members. Two Israeli reservists were wounded in a Hezbollah mortar attack in northern Israel.',
   l:'https://www.reuters.com/world/middle-east/idf-litani-bridges-lebanon-2026-03-23',s:'Reuters'},
  {d:'2026-03-23',cat:'military',imp:'e',t:'Iraq: Islamic Resistance claims 21 attacks on US bases in 24 hours; 3 drones near Erbil airport',tags:['Iraq','USA'],
   tx:'The Islamic Resistance in Iraq said it carried out 21 attacks against US bases across the country and the region in the past 24 hours. Three drones were intercepted near Erbil airport, resulting in a fire. Another drone crashed in al-Sayyidah area southwest of Baghdad, injuring four people. Combined US-Iraqi forces struck the 52nd PMF Brigade headquarters.',
   l:'https://www.aljazeera.com/news/2026/3/23/iraq-resistance-21-attacks-us-bases',s:'Al Jazeera'},
  {d:'2026-03-23',cat:'humanitarian',imp:'e',t:'Iran death toll tops 1,500 killed, 20,984 injured — internet blackout enters day 23',tags:['Iran'],
   tx:'Iran\'s Ministry of Health reported the death toll from US-Israeli attacks topped 1,500 with at least 20,984 injured. Seven hospitals have been evacuated and 36 ambulances damaged. The nationwide internet blackout continued for the 23rd consecutive day. President Pezeshkian called on BRICS to "play an independent role in halting aggressions" and proposed a regional security framework.',
   l:'https://www.aljazeera.com/news/2026/3/23/iran-death-toll-1500',s:'Al Jazeera'},
  {d:'2026-03-23',cat:'maritime',imp:'e',t:'Houthis warn Bahrain and UAE they "will be the first to lose" if they join Hormuz campaign',tags:['Yemen','Bahrain','UAE'],
   tx:'Houthi leadership warned Bahrain and the UAE that they "will be the first to lose" if they participate in any US-led campaign to forcibly reopen the Strait of Hormuz. The warning came as the US, Bahrain, UK, France, and Germany issued a joint statement condemning Iran\'s "de facto closure" of the Strait and calling for an immediate halt to mine-laying, drone, and missile attacks on commercial vessels.',
   l:'https://www.bbc.com/news/world-middle-east-houthis-warn-bahrain-uae-2026-03-23',s:'BBC'},
  {d:'2026-03-23',cat:'diplomatic',imp:'d',t:'IAEA chief Grossi says US-Iran nuclear talks could be "re-established"',tags:['Iran','USA'],
   tx:'IAEA Director General Rafael Grossi said talks between the US and Iran could be "re-established," offering a rare diplomatic opening amid the conflict. Grossi said the IAEA was closely monitoring the situation after strikes near Dimona and a second round of bunker busters at Natanz. Separately, Iran accused the UK of allowing the US to use the joint Diego Garcia base for strikes, which the UK denied was used for offensive operations.',
   l:'https://www.reuters.com/world/middle-east/iaea-grossi-us-iran-talks-2026-03-23',s:'Reuters'},
  {d:'2026-03-23',cat:'stocks',imp:'d',t:'Early markets spike on ultimatum fears, then reverse as Trump postpones — Brent crashes below $100',tags:['USA'],
   tx:'Oil initially surged on Trump\'s 48-hour ultimatum before reversing sharply when he announced a 5-day delay on strikes. Brent crude ended down ~11% at $99.94/bbl — below $100 for the first time in two weeks. WTI fell 10% to $88.13. Goldman Sachs raised its Brent forecast to $110 and warned of exceeding 2008\'s $147 record if Hormuz stays at 5% capacity. S&P 500 rallied 1.1-2.1%, Dow surged 1,000+ points.',
   l:'https://www.cnbc.com/2026/03/23/oil-crashes-trump-delay-markets-surge.html',s:'CNBC'},
  {d:'2026-03-23',cat:'military',imp:'e',t:'2,500 additional Marines dispatched to Middle East — Kharg Island amphibious speculation grows',tags:['USA','Iran'],
   tx:'The Pentagon confirmed 2,500 additional Marines with amphibious landing capability have been dispatched to the Middle East theater, fueling speculation about a potential operation against Iran\'s Kharg Island oil terminal. Treasury Secretary Bessent confirmed "all options are on the table, including Kharg Island." Separately, the US Treasury issued a waiver permitting sale of approximately 140 million barrels of Iranian oil already in transit.',
   l:'https://www.reuters.com/world/middle-east/us-marines-kharg-island-2026-03-23',s:'Reuters'},
  {d:'2026-03-23',cat:'aviation',imp:'n',t:'Israel cancels all in-person classes; bans gatherings >50 in south after Dimona/Arad strikes',tags:['Israel'],
   tx:'Israel\'s Ministry of Education canceled all in-person classes across the country for Sunday and Monday following the Iranian missile strikes on Dimona and Arad. The Home Front Command banned gatherings of more than 50 people in the country\'s south until Tuesday. Israel\'s military acknowledged air defense systems "failed to intercept some of the missiles" and said it would investigate. At least 4,292 injured have been brought to hospitals since the war began.',
   l:'https://www.timesofisrael.com/israel-cancels-classes-dimona-2026-03-23',s:'Times of Israel'},
  {d:'2026-03-23',cat:'military',imp:'e',t:'Iran launches 8 missile barrages at Israel in 24 hours — 70% now use cluster munitions',tags:['Iran','Israel'],
   tx:'Iran fired eight separate missile barrages at Israel over the preceding 24 hours, with cluster munitions now comprising approximately 70% of launches. The IRGC claimed to have shot down an Israeli fighter jet (its third such claim) and intercepted a US-Israeli armed drone over Tehran. The IDF said it struck more than 200 sites in Iran and Lebanon over the weekend, targeting missile launchers, air defense systems, and military bases.',
   l:'https://www.bbc.com/news/world-middle-east-iran-8-barrages-israel-cluster-2026-03-23',s:'BBC'},
  {d:'2026-03-23',cat:'diplomatic',imp:'d',t:'Trump postpones power plant strikes for 5 days — claims "very strong talks" with Iran, names Kushner and Witkoff as negotiators',tags:['USA','Iran'],
   tx:'President Trump announced he would delay threatened strikes on Iran\'s power plants for five days, claiming "very strong talks" are underway and that there are "15 points of agreement." He named Jared Kushner and Steve Witkoff as lead negotiators. Trump said he had spoken to an unnamed "top person" in Iran — Reuters sources identified him as parliament speaker Ghalibaf. Oil markets crashed on the announcement, with Brent falling ~11% to $99.94.',
   l:'https://www.nytimes.com/2026/03/23/world/middleeast/trump-iran-power-plant-strikes-delay.html',s:'NYT'},
  {d:'2026-03-23',cat:'diplomatic',imp:'e',t:'Iran denies all negotiations with US — Ghalibaf calls Trump claims "fake news to manipulate markets"',tags:['Iran','USA'],
   tx:'Iran\'s parliament speaker Mohammad Bagher Ghalibaf denied any negotiations, calling Trump\'s claims "fake news designed to manipulate oil markets." Supreme Leader adviser Mohsen Rezaei said the war continues until Iran receives "full compensation and complete sanctions removal." However, Iranian officials confirmed a Witkoff-Araghchi phone call had taken place, described as "preliminary de-escalation contacts, not negotiations."',
   l:'https://www.aljazeera.com/news/2026/3/23/iran-denies-negotiations-ghalibaf',s:'Al Jazeera'},
  {d:'2026-03-23',cat:'diplomatic',imp:'d',t:'Pakistan offers to host US-Iran talks — Army chief Munir and PM Sharif call Pezeshkian',tags:['Pakistan','Iran','USA'],
   tx:'Pakistan Army Chief General Asim Munir and Prime Minister Shehbaz Sharif both contacted Iranian President Pezeshkian to offer Pakistan as a venue for talks. Egypt\'s President Sissi separately toured Gulf capitals pushing a 30-60 day ceasefire framework. Turkey also passed backchannel messages. UK PM Starmer said he was "aware of and welcomes" the diplomatic efforts. China called for an end to the "vicious cycle of escalation."',
   l:'https://www.reuters.com/world/middle-east/pakistan-offers-host-iran-talks-2026-03-23',s:'Reuters'},
  {d:'2026-03-23',cat:'military',imp:'e',t:'IDF strikes IRGC main headquarters in "heart of Tehran" — multiple military buildings hit',tags:['Israel','Iran'],
   tx:'Israeli forces struck the IRGC\'s main headquarters compound in central Tehran along with other military buildings. The strikes came as part of an intensified campaign that CENTCOM said had now hit over 9,000 targets since Feb 28, destroying more than 140 Iranian naval vessels. The IDF described the target as "the nerve center of Iran\'s proxy warfare operations."',
   l:'https://www.cnn.com/2026/03/23/middleeast/idf-strikes-irgc-hq-tehran',s:'CNN'},
  {d:'2026-03-23',cat:'military',imp:'e',t:'IDF strikes Hezbollah infrastructure in southern Beirut — 3 massive explosions',tags:['Israel','Lebanon'],
   tx:'Three massive explosions rocked Beirut\'s southern suburbs as the IDF struck Hezbollah infrastructure. UNIFIL headquarters in Naqoura was also hit by a projectile attributed to a non-state actor. Israel diverted a combat battalion from the Lebanon border to the West Bank to address settler violence, with 6 Palestinians killed this month.',
   l:'https://www.bbc.com/news/world-middle-east-beirut-strikes-hezbollah-2026-03-23',s:'BBC'},
  {d:'2026-03-23',cat:'military',imp:'e',t:'Pentagon weighing 82nd Airborne deployment (3,000 troops) — possible Kharg Island seizure',tags:['USA','Iran'],
   tx:'The Pentagon is considering deploying the 82nd Airborne Division\'s Immediate Response Force of approximately 3,000 paratroopers. The 2nd Marine Expeditionary Unit (2,200 Marines) departed California; the 1st MEU remains en route from the Pacific. USS Ford arrived at Souda Bay, Crete for repairs after a laundry fire. The UK announced deployment of Rapid Sentry short-range air defense systems to Bahrain, Kuwait, and Saudi Arabia, HMS Dragon to the eastern Mediterranean, and the most British jets in the region in 15 years.',
   l:'https://www.cbsnews.com/news/pentagon-82nd-airborne-kharg-island-2026-03-23/',s:'CBS News'},
  {d:'2026-03-23',cat:'humanitarian',imp:'e',t:'ICRC warns "point of no return" on civilian infrastructure — 80,000+ buildings damaged in Iran',tags:['Iran','Lebanon','Israel'],
   tx:'The ICRC warned the conflict was approaching a "point of no return" for civilian infrastructure. In Iran, rights groups documented 1,398+ civilians killed and 80,000+ buildings damaged. Lebanon reported over 1,000 killed, 2,800+ wounded, 1.2 million displaced, and 100+ children killed. Israel has seen 15 killed and the US 13 service members lost since the conflict began.',
   l:'https://www.npr.org/2026/03/23/icrc-point-of-no-return-middle-east',s:'NPR'},
  // ── Mar 24 ──
  {d:'2026-03-24',cat:'military',imp:'e',t:'Iranian missiles strike Tel Aviv — 4+ impact sites, buildings damaged, 6 wounded',tags:['Iran','Israel'],
   tx:'Iranian ballistic missiles hit at least four sites across Tel Aviv, tearing the facade off a residential building and setting cars ablaze. Six people were wounded. Debris from interceptions also fell in Be\'er Sheva and Arad, though no injuries were reported there. The strikes marked the deepest Iranian penetration of Israeli air defenses since the conflict began.',
   l:'https://www.cnn.com/2026/03/24/middleeast/iran-missiles-tel-aviv',s:'CNN'},
  {d:'2026-03-24',cat:'military',imp:'e',t:'Israel resumes heavy strikes on Beirut southern suburbs — IDF says Hezbollah campaign "only just begun"',tags:['Israel','Lebanon'],
   tx:'Israeli jets carried out multiple overnight raids on Beirut\'s southern suburbs, the first strikes on Hezbollah\'s stronghold in days. An IDF spokesman declared the "battle against Hezbollah has only just begun." A separate strike in Bshamoun, a Druze-majority town outside Beirut, killed 2 and wounded 5.',
   l:'https://www.theguardian.com/world/2026/mar/24/israel-strikes-beirut-southern-suburbs',s:'The Guardian'},
  {d:'2026-03-24',cat:'military',imp:'n',t:'US continues strikes on Iran under Operation Epic Fury — Trump pause limited to energy sites only',tags:['United States','Iran'],
   tx:'The White House clarified that Trump\'s announced "pause" applies only to strikes on Iranian power plants and energy infrastructure. Military operations under Operation Epic Fury continue across other target sets. A gas company office and pressure-reduction station were hit in Isfahan; a pipeline feeding a power station in Khorramshahr was also struck.',
   l:'https://www.semafor.com/article/2026/03/24/us-iran-strikes-continue-epic-fury',s:'Semafor'},
  {d:'2026-03-24',cat:'military',imp:'e',t:'Kuwait intercepts Iranian missiles twice since midnight; 7 power lines knocked out',tags:['Kuwait','Iran'],
   tx:'Kuwait air defenses intercepted missiles from Iran twice since midnight. Despite the intercepts, 7 power lines were knocked out across the country. Bahrain sirens sounded multiple times overnight. Saudi Arabia intercepted and destroyed at least 5 drones.',
   l:'https://www.reuters.com/world/middle-east/kuwait-intercepts-iranian-missiles-2026-03-24/',s:'Reuters'},
  {d:'2026-03-24',cat:'diplomatic',imp:'d',t:'Pakistan: Direct Iran-US talks could be held in Islamabad this week — Vance, Witkoff, Kushner expected',tags:['Pakistan','Iran','United States'],
   tx:'Pakistan said direct talks between Iran and the United States could be held in Islamabad as early as this week. JD Vance, Steve Witkoff, and Jared Kushner are expected to meet Iranian officials. The IRGC dismissed Trump\'s overtures as "psychological operations," calling his words "worn out."',
   l:'https://www.reuters.com/world/asia-pacific/pakistan-iran-us-talks-islamabad-2026-03-24/',s:'Reuters'},
  {d:'2026-03-24',cat:'diplomatic',imp:'n',t:'Netanyahu tells Trump military gains can be "leveraged" into agreement; Israel continues strikes',tags:['Israel','United States'],
   tx:'Netanyahu spoke with Trump and argued that Israel\'s military gains could be "leveraged" into a broader agreement. Despite diplomatic talk, Israel continued its strikes across Lebanon and maintained operations against Iran-aligned targets.',
   l:'https://www.reuters.com/world/middle-east/netanyahu-trump-call-leverage-2026-03-24/',s:'Reuters'},
  {d:'2026-03-24',cat:'stocks',imp:'e',t:'Brent crude rebounds 4% to $103.94 after Monday crash — Macquarie warns $150 if Hormuz shut through April',tags:['Global'],
   tx:'Brent crude rose 4% to $103.94/bbl and WTI climbed 4% to $91.62, reversing Monday\'s crash triggered by Trump\'s pause announcement. Macquarie warned Brent could hit $150 if Hormuz remains shut through April, with a price floor at $85-90 and likely drift to $110. China implemented its largest fuel price adjustment on record. Slovenia became the first EU state to introduce fuel rationing.',
   l:'https://www.reuters.com/business/energy/oil-prices-rebound-2026-03-24/',s:'Reuters'},
  {d:'2026-03-24',cat:'maritime',imp:'n',t:'Two tankers sail through Hormuz; US waives sanctions on Russian and Iranian oil already at sea',tags:['India','Iran','United States'],
   tx:'Two tankers bound for India sailed through the Strait of Hormuz on Monday, a rare transit since the strait\'s closure. The US waived sanctions on Russian and Iranian oil already at sea in an effort to ease global supply pressure. Iran\'s Araghchi discussed Hormuz developments with his Omani counterpart.',
   l:'https://www.reuters.com/world/middle-east/tankers-hormuz-transit-2026-03-24/',s:'Reuters'},
  {d:'2026-03-24',cat:'general',imp:'e',t:'Global energy crisis deepens — Australia fuel stations dry, Japan releasing reserves, Slovenia rationing',tags:['Global'],
   tx:'The global energy crisis intensified: 184+ Australian petrol stations ran dry with a fuel supply taskforce convened. Japan announced release of national oil reserves beginning Mar 26. South Korea imposed energy-saving measures. New Zealand introduced $50/week fuel subsidies. Sri Lanka mandated 4-day work weeks. Vietnam cut 23 flights per week. EU Commission president von der Leyen called the global energy situation "critical."',
   l:'https://www.theguardian.com/world/2026/mar/24/global-energy-crisis-fuel-rationing',s:'The Guardian'},
  {d:'2026-03-24',cat:'general',imp:'e',t:'AWS Bahrain disrupted by drone activity for second time in a month',tags:['Bahrain'],
   tx:'Amazon Web Services\' Bahrain data center was disrupted by drone activity, the second such incident in a month. The outage affected cloud services across the Gulf region, highlighting the conflict\'s growing impact on critical digital infrastructure.',
   l:'https://www.reuters.com/technology/aws-bahrain-disrupted-drone-2026-03-24/',s:'Reuters'},
  {d:'2026-03-24',cat:'military',imp:'n',t:'HMS Dragon arrives in eastern Mediterranean as UK reinforces naval presence',tags:['United Kingdom'],
   tx:'The Royal Navy destroyer HMS Dragon arrived in the eastern Mediterranean, bolstering the UK\'s naval presence in the conflict theater. The deployment followed earlier UK reinforcement moves including carrier repositioning.',
   l:'https://www.theguardian.com/uk-news/2026/mar/24/hms-dragon-eastern-mediterranean',s:'The Guardian'},
  {d:'2026-03-24',cat:'diplomatic',imp:'d',t:'US sends Iran 15-point peace plan via Pakistan — addresses missiles, nuclear program',tags:['United States','Iran','Pakistan'],
   tx:'The United States sent Iran a 15-point plan to end the war, delivered through Pakistan, according to two officials briefed on the diplomacy. The plan addresses Iran\'s ballistic missile and nuclear programs. Trump said negotiations were already taking place and that Vance and Rubio were involved. Iran maintained publicly that no negotiations are happening, but officials confirmed messages are being exchanged through intermediaries.',
   l:'https://www.nytimes.com/live/2026/03/24/world/iran-war-trump-oil',s:'NYT'},
  {d:'2026-03-24',cat:'diplomatic',imp:'n',t:'Iran prefers Vance over Witkoff/Kushner as negotiator — views him as more intent on ending war',tags:['Iran','United States'],
   tx:'Iranian representatives told the Trump administration through back channels that they prefer Vice President JD Vance over Steve Witkoff and Jared Kushner for negotiations. Regional sources said Iran believes Vance is "more sympathetic to wanting to end the war." The White House responded that "President Trump and only President Trump determines who negotiates."',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-24-26',s:'CNN'},
  {d:'2026-03-24',cat:'maritime',imp:'d',t:'Iran tells UN and IMO: "non-hostile" ships may transit Hormuz if they coordinate with Iranian authorities',tags:['Iran','Global'],
   tx:'Iran\'s Foreign Ministry sent a note to the UN Security Council and the International Maritime Organization declaring that "non-hostile vessels" may transit the Strait of Hormuz if they coordinate with Iranian authorities and do not support acts of aggression against Iran. Vessels belonging to the US or Israel "do not qualify for innocent or non-hostile passage." Six vessels openly transited Hormuz on Mar 24.',
   l:'https://www.reuters.com/world/middle-east/iran-says-non-hostile-ships-can-transit-strait-hormuz-ft-reports-2026-03-24/',s:'Reuters'},
  {d:'2026-03-24',cat:'military',imp:'e',t:'Iranian missiles kill 6 Kurdish Peshmerga in Iraq, wound 30; missile hits Bahrain, killing Moroccan contractor',tags:['Iraq','Iran','Bahrain'],
   tx:'Six Iranian ballistic missiles struck a Kurdish Peshmerga base north of Erbil in Iraqi Kurdistan, killing 6 fighters and wounding 30 — the first direct Iranian attack on Peshmerga forces. Separately, an Iranian missile attack in Bahrain killed a Moroccan contractor working for the Emirati armed forces and injured 5 Emirati service members. Iraq ordered a response to recent strikes on Iran-backed PMF forces.',
   l:'https://www.nytimes.com/live/2026/03/24/world/iran-war-trump-oil',s:'NYT'},
  {d:'2026-03-24',cat:'military',imp:'e',t:'Projectile hits Bushehr Nuclear Power Plant premises — IAEA says no damage to reactor',tags:['Iran'],
   tx:'Iran reported that a projectile struck the premises of the Bushehr Nuclear Power Plant. The IAEA confirmed there was no damage to the plant itself nor injuries to staff, and the condition of the plant is normal. IAEA Director General Grossi reiterated his call for maximum restraint to avoid nuclear safety risks during the conflict.',
   l:'https://www.nbcnews.com/world/iran/live-blog/live-updates-iran-war-trump-peace-talks-israel-gulf-attacks-markets-rcna264854',s:'NBC News'},
  {d:'2026-03-24',cat:'military',imp:'e',t:'Israel to expand occupation of southern Lebanon — "security zone" to Litani River; 1,000 82nd Airborne deploying',tags:['Israel','Lebanon','United States'],
   tx:'Israel\'s defense minister announced the military would expand its occupation of southern Lebanon, establishing a "security zone" up to the Litani River, 20 miles from the border. Separately, around 1,000 US soldiers from the 82nd Airborne Division are expecting to deploy to the Middle East in coming days. Israel also approved raising the reserve mobilization cap from 280,000 to 400,000.',
   l:'https://www.reuters.com/world/middle-east/israel-military-occupy-southern-lebanon-2026-03-24/',s:'Reuters'},
  {d:'2026-03-24',cat:'diplomatic',imp:'e',t:'MBS pushing Trump to continue war against Iran — Saudi Arabia wants missile capabilities degraded',tags:['Saudi Arabia','United States'],
   tx:'Crown Prince Mohammed bin Salman has been pushing Trump to continue the war against Iran, according to people briefed by American officials. Saudi Arabia wants Tehran\'s missile capabilities degraded "as much as possible" but does not want Iran\'s civilian infrastructure harmed. Trump described MBS: "He\'s a warrior. He\'s fighting with us."',
   l:'https://www.nytimes.com/live/2026/03/24/world/iran-war-trump-oil',s:'NYT'},
  {d:'2026-03-24',cat:'military',imp:'n',t:'290 US troops wounded in Operation Epic Fury; Iran appoints Zolqadr to replace killed Larijani',tags:['United States','Iran'],
   tx:'CENTCOM reported 290 American service members have been wounded in Operation Epic Fury, with 255 (88%) returned to duty and 10 still seriously wounded. 13 have been killed. Separately, Iran appointed former IRGC General Mohammad Bagher Zolqadr as top security official, replacing Ali Larijani who was killed in an Israeli strike last week.',
   l:'https://defensescoop.com/2026/03/24/iran-war-us-troops-wounded-operation-epic-fury/',s:'DefenseScoop'},
  {d:'2026-03-24',cat:'general',imp:'e',t:'Philippines declares national energy emergency; South Korea urges shorter showers, less EV charging',tags:['Global'],
   tx:'The Philippines declared a state of national energy emergency as the Hormuz closure continued disrupting global oil supply. South Korea urged citizens to take shorter showers and avoid charging phones and electric vehicles at night. India\'s PM Modi spoke with Trump emphasizing the need for Hormuz to "remain open, secure and accessible." Saudi Arabia\'s "Logistics Routes Initiative" has dispatched 94,000+ trucks to land borders since Feb 28; Jeddah port expects a 50% surge in arrivals.',
   l:'https://www.nbcnews.com/world/iran/live-blog/live-updates-iran-war-trump-peace-talks-israel-gulf-attacks-markets-rcna264854',s:'NBC News'},
  {d:'2026-03-24',cat:'humanitarian',imp:'e',t:'Nearly 350 children among thousands killed; death toll: Iran 1,443+ civilians, Lebanon 1,000+, Israel 15, US 13',tags:['Iran','Lebanon','Israel','United States'],
   tx:'Nearly 350 children are among the thousands killed in the conflict, according to a CNN tally. The Human Rights Activists News Agency reported at least 1,443 civilians killed in Iran. More than 1,000 killed in Lebanon. At least 15 killed in Israel. 13 US service members killed plus 2 non-combat deaths. Total dead across the region exceeds 2,000.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-24-26',s:'CNN'},
  // ===== MAR 25 =====
  {d:'2026-03-25',cat:'military',imp:'e',t:'IRGC fires missiles at Israel and US bases in Kuwait, Jordan, and Bahrain',tags:['Iran','Israel','Kuwait','Jordan','Bahrain','United States'],
   tx:'Iran\'s Revolutionary Guards launched a new wave of attacks targeting Israel including Tel Aviv and Kiryat Shmona, as well as US bases in Kuwait, Jordan, and Bahrain, according to Iranian state media. Kuwaiti civil aviation authority reported a fire at Kuwait International Airport after a drone hit a fuel tank.',
   l:'https://www.theguardian.com/world/live/2026/mar/25/middle-east-crisis-live-iran-war-oil-prices-more-us-troops-reportedly-deployed-donald-trump-attacks-on-lebanon',s:'Guardian'},
  {d:'2026-03-25',cat:'military',imp:'e',t:'12 killed, 28 wounded in single strike on south Tehran residential area',tags:['Iran','United States','Israel'],
   tx:'An air strike hit a residential area in southern Tehran, killing at least 12 people and wounding 28, according to Al Jazeera. The Red Crescent showed rescue workers in rubble of collapsed upper floors. Continues pattern of strikes on Iranian urban areas.',
   l:'https://www.aljazeera.com/news/liveblog/2026/3/25/iran-war-live-trump-again-says-talks-under-way-12-killed-in-south-tehran',s:'Al Jazeera'},
  {d:'2026-03-25',cat:'military',imp:'e',t:'Drones hit fuel tank at Kuwait International Airport — fire breaks out',tags:['Kuwait','Iran'],
   tx:'A drone struck a fuel tank at Kuwait International Airport causing a fire at the site, the country\'s civil aviation authority said early Wednesday. The attack came as part of Iran\'s broader missile barrage targeting coalition assets across the Gulf.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-25-26',s:'CNN'},
  {d:'2026-03-25',cat:'military',imp:'e',t:'9 wounded including 6 children from Iranian missile in central Israel',tags:['Israel','Iran'],
   tx:'At least nine people including six children were wounded after an Iranian missile launch struck a city in central Israel, emergency officials reported. A woman was killed in northern Israel following rocket fire from Lebanon.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-25-26',s:'CNN'},
  {d:'2026-03-25',cat:'military',imp:'e',t:'IDF: 600+ strikes on Iranian missile sites; IRGC units show low morale and absenteeism',tags:['Israel','Iran'],
   tx:'The IDF announced it has conducted more than 600 strikes targeting Iranian ballistic missile sites since the war began. IDF Military Intelligence identified "low morale, absenteeism, and burnout" among IRGC ballistic missile units. Soldiers have refused to go to launch sites due to fear of strikes. Combined force struck IRGC Amand Missile Base near Tabriz again.',
   l:'https://understandingwar.org/research/middle-east/iran-update-special-report-march-24-2026/',s:'ISW'},
  {d:'2026-03-25',cat:'military',imp:'e',t:'Combined force strikes Esfahan Optics Industries and Malek Ashtar University',tags:['Iran','Israel','United States'],
   tx:'Geolocated footage shows extensive damage to Esfahan Optics Industries — multiple floors collapsed, facade destroyed. The subsidiary of Iran Electronics Industries produces lenses and prisms for military weapons systems. Combined force also struck Malek Ashtar University of Technology in Shahin Shahr (linked to Defense Industries Organization) and Shahid Tamjidi Offshore Industries in Bandar Anzali.',
   l:'https://understandingwar.org/research/middle-east/iran-update-special-report-march-24-2026/',s:'ISW'},
  {d:'2026-03-25',cat:'military',imp:'n',t:'Satellite imagery reveals extensive damage to Iran\'s Nazeat Islands naval infrastructure near Hormuz',tags:['Iran','United States'],
   tx:'Commercially available satellite imagery from Mar 22 shows substantial US strike damage to Iranian naval/air infrastructure on Greater Tunb and Abu Musa islands near the Strait of Hormuz. Damage includes communications infrastructure, fuel depots, port facilities, aircraft hangars, and many fast attack craft. Underground bunkers storing anti-ship cruise missiles were targeted. Iran\'s ability to coordinate maritime operations from these islands "likely degraded."',
   l:'https://understandingwar.org/research/middle-east/iran-update-special-report-march-24-2026/',s:'ISW'},
  {d:'2026-03-25',cat:'military',imp:'e',t:'1,000 82nd Airborne Division paratroopers deploying to Middle East',tags:['United States'],
   tx:'Around 1,000 US soldiers with the Army\'s 82nd Airborne Division are expecting to deploy in coming days to the Middle East, sources told CNN and AP. The 82nd is an elite infantry division that can deploy anywhere in the world in 18 hours. Deployment approved by Trump despite his claims of successful peace negotiations.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-25-26',s:'CNN'},
  {d:'2026-03-25',cat:'military',imp:'e',t:'Israeli strikes kill 9 in Lebanon: Adloun, Sidon refugee camp, Habboush',tags:['Israel','Lebanon'],
   tx:'Israeli strikes killed nine people across Lebanon on Wednesday. Four killed in the town of Adloun, two in a Palestinian refugee camp in the southern Sidon area, and three killed with 18 wounded in Habboush. Israel has killed at least 1,072 people in Lebanon with more than one million displaced. Israel raised its reserve mobilization cap to 400,000.',
   l:'https://www.theguardian.com/world/live/2026/mar/25/middle-east-crisis-live-iran-war-oil-prices-more-us-troops-reportedly-deployed-donald-trump-attacks-on-lebanon',s:'Guardian'},
  {d:'2026-03-25',cat:'diplomatic',imp:'d',t:'Iran military mocks US 15-point peace plan: "Never come to terms with someone like you"',tags:['Iran','United States'],
   tx:'Iranian military spokesperson Lt. Col. Ebrahim Zolfaghari dismissed US peace negotiations in a prerecorded TV address: "Don\'t dress up your defeat as an agreement. Have your internal conflicts reached the point where you are negotiating with yourselves? Our first and last word: Someone like us will never come to terms with someone like you. Not now, not ever."',
   l:'https://www.theguardian.com/world/live/2026/mar/25/middle-east-crisis-live-iran-war-oil-prices-more-us-troops-reportedly-deployed-donald-trump-attacks-on-lebanon',s:'Guardian'},
  {d:'2026-03-25',cat:'diplomatic',imp:'d',t:'China\'s Wang Yi urges Iran to "initiate peace talks as soon as possible"',tags:['Iran','China'],
   tx:'Chinese Foreign Minister Wang Yi urged his Iranian counterpart Araghchi to "initiate peace talks as soon as possible" during a call Beijing said was held at Tehran\'s request. Wang said negotiation was "in the interests of the Iranian nation." Araghchi told Wang Iran is "committed to achieving a comprehensive ceasefire rather than merely a temporary truce." China growing frustrated with economic costs of the conflict.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-25-26',s:'CNN'},
  {d:'2026-03-25',cat:'diplomatic',imp:'n',t:'Trump says Vance and Rubio leading negotiations; Iran willing to listen to "sustainable" proposals',tags:['United States','Iran'],
   tx:'Trump said VP JD Vance and Secretary of State Marco Rubio are leading negotiations with Iran. An Iranian source told CNN Tehran is willing to listen to "sustainable" proposals. Iran indicated it prefers Vance over Witkoff/Kushner. Iran\'s FM spokesperson: "No one can trust US diplomacy." Israel\'s UN ambassador Danon said Israel is not part of any reported talks.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-25-26',s:'CNN'},
  {d:'2026-03-25',cat:'diplomatic',imp:'n',t:'GOP rejects war powers resolution for 3rd time — 47-53 vote',tags:['United States'],
   tx:'Republicans again rejected a resolution requiring Trump to seek congressional approval for future US military action against Iran. The measure failed 47-53, the third time Congress has voted against constraining Trump\'s war powers during the conflict.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-25-26',s:'CNN'},
  {d:'2026-03-25',cat:'diplomatic',imp:'n',t:'Kim Jong Un says Iran war justifies North Korea keeping nuclear weapons',tags:['North Korea'],
   tx:'North Korean leader Kim Jong Un told the Supreme People\'s Assembly that the US war with Iran proves his country was right to keep its nuclear weapons. He called the US\'s actions "state-sponsored terrorism and aggression" and said North Korea\'s nuclear status is now "irreversible."',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-25-26',s:'CNN'},
  {d:'2026-03-25',cat:'diplomatic',imp:'n',t:'Cyprus seeks new security deal for UK bases after Shahed drone crash at Akrotiri',tags:['Cyprus','UK'],
   tx:'Cyprus has asked the UK to negotiate new security arrangements for its military bases at Akrotiri and Dhekelia, the Telegraph reports. President Christodoulides raised the issue with PM Starmer after an Iranian Shahed drone crashed into the Akrotiri base on Mar 2 with no warning to nearby civilians. UK said base status "not up for negotiation."',
   l:'https://www.dw.com/en/iran-war-us-reportedly-offers-15-point-plan-to-end-war/live-76515461',s:'DW'},
  {d:'2026-03-25',cat:'stocks',imp:'d',t:'Oil crashes ~6% on peace plan hopes: Brent $94.42, WTI $87.72; Asian markets surge',tags:['Saudi Arabia','Iran','United States'],
   tx:'Oil prices fell sharply after reports of the US 15-point peace plan. Brent crude down ~6% to $94.42/bbl — its lowest since the first week of the war. WTI down 5.1% to $87.72. Asian markets surged: Nikkei +2.8%, Kospi +3.1%, Hang Seng +1.2%, Shanghai +0.9%, ASX 200 +2.2%, Taiex +3%. Market responded to peace plan news and Iran\'s Hormuz "non-hostile" vessel announcement.',
   l:'https://www.dw.com/en/iran-war-us-reportedly-offers-15-point-plan-to-end-war/live-76515461',s:'DW'},
  {d:'2026-03-25',cat:'maritime',imp:'n',t:'Iran formally announces "non-hostile" ships may transit Hormuz; only 5 vessels tracked Monday',tags:['Iran'],
   tx:'Iran\'s UN mission said vessels may have "safe passage" through Hormuz "provided they neither participate in nor support acts of aggression against Iran." Shared similar statement with IMO. Maritime firm Windward tracked only 5 vessels Monday vs 120 daily pre-war average. Some analysts predict oil could hit $150-200/bbl if waterway stays effectively closed.',
   l:'https://www.aljazeera.com/economy/2026/3/25/iran-says-non-hostile-ships-can-pass-safely-through-strait-of-hormuz',s:'Al Jazeera'},
  {d:'2026-03-25',cat:'maritime',imp:'e',t:'Iran charging transit fees at Hormuz — Chinese tanker paid $2M; dozen limpet mines confirmed',tags:['Iran','China'],
   tx:'Lloyd\'s List reported 20+ vessels have taken a "Tehran-approved route" through Iranian territorial waters since the war began. Vessels pass Larak Island where IRGC verifies details. At least two vessels including a Chinese state-owned tanker have paid Iran a fee — one reportedly $2M. Separately, US officials confirmed Iran has laid about a dozen Maham 3 and Maham 7 limpet mines in the strait.',
   l:'https://understandingwar.org/research/middle-east/iran-update-special-report-march-24-2026/',s:'ISW'},
  {d:'2026-03-25',cat:'maritime',imp:'n',t:'WTO warns Hormuz closure threatens global fertilizer supply — "harvests shrink, prices rise"',tags:['Iran'],
   tx:'WTO deputy director general Jean-Marie Paugam warned that disruption to fertilizer supplies from the Hormuz closure will cause food scarcity. A third of the world\'s fertilizers normally transit the strait. Effect compounds: "harvests shrink and prices rise." Major food exporters like India, Thailand, and Brazil depend on Gulf urea exports. Parts of west and north Africa most at risk.',
   l:'https://www.theguardian.com/world/live/2026/mar/25/middle-east-crisis-live-iran-war-oil-prices-more-us-troops-reportedly-deployed-donald-trump-attacks-on-lebanon',s:'Guardian'},
  {d:'2026-03-25',cat:'general',imp:'e',t:'Philippines declares national energy emergency; seeks US waivers to buy sanctioned oil',tags:['Philippines'],
   tx:'President Marcos Jr. declared a state of national energy emergency citing "imminent danger" to energy supply. Philippines ambassador working with State Dept on waivers to buy oil from sanctioned countries including Venezuela and Iran. Due to receive first Russian crude import in five years this week via 30-day US waiver. Providing welfare payments to affected workers.',
   l:'https://www.dw.com/en/iran-war-us-reportedly-offers-15-point-plan-to-end-war/live-76515461',s:'DW'},
  {d:'2026-03-25',cat:'humanitarian',imp:'e',t:'Lebanon faces "existential crisis" over Israeli occupation south of Litani; 1,072+ killed',tags:['Lebanon','Israel'],
   tx:'Lebanese officials say the country faces an "existential crisis" after Israel announced plans to seize and occupy large areas south of the Litani River — 20 miles from the border. Many fear the occupation will become long-term. President Aoun said Israeli infrastructure targeting along the Litani "aims to isolate villages and towns from the rest of Lebanon." 1,072+ killed, 1M+ displaced. Southern villages being entirely emptied as civilians flee.',
   l:'https://www.theguardian.com/world/live/2026/mar/25/middle-east-crisis-live-iran-war-oil-prices-more-us-troops-reportedly-deployed-donald-trump-attacks-on-lebanon',s:'Guardian'},
  {d:'2026-03-25',cat:'humanitarian',imp:'e',t:'Conflict casualty update: 290 US troops wounded, 13 KIA; 1,500+ Iranians killed; 350 children dead',tags:['United States','Iran','Lebanon','Israel'],
   tx:'Approximately 290 US troops wounded and 13 killed in action. Iran\'s state broadcaster reported over 1,500 Iranians killed as of Mar 21. Nearly 350 children killed across the region (200+ in Iran per HRANA, 100+ in Lebanon per health ministry). 1,072+ killed in Lebanon. Total dead across all parties continues to climb.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-25-26',s:'CNN'},

  // ===== Mar 26, 2026 =====
  {d:'2026-03-26',cat:'diplomatic',imp:'d',t:'Trump extends Hormuz deadline to April 6 "per Iranian Government request"',tags:['United States','Iran'],
   tx:'President Trump announced a 10-day extension of the Hormuz reopening deadline from March 27 to April 6, saying it was "per the Iranian Government\'s request." The move signals diplomatic engagement between Washington and Tehran despite the ongoing fighting. Iran allowed 8 vessels through the strait as a "show of sincerity" accompanying the request.',
   l:'https://www.reuters.com/world/middle-east/iran-war-latest-2026-03-26',s:'Reuters'},
  {d:'2026-03-26',cat:'military',imp:'e',t:'IDF kills IRGCN commander Alireza Tangsiri — architect of Hormuz blockade',tags:['Israel','Iran'],
   tx:'Israeli forces killed Rear Admiral Alireza Tangsiri, commander of the IRGC Navy, in a targeted strike. Tangsiri was central to Iran\'s strategy of mining and closing the Strait of Hormuz. His death removes a key operational leader but may complicate diplomacy as hardliners push for retaliation.',
   l:'https://www.timesofisrael.com/idf-kills-irgc-navy-commander-tangsiri-2026-03-26',s:'Times of Israel'},
  {d:'2026-03-26',cat:'military',imp:'e',t:'Intense bombardment of Tehran in evening strikes — residential areas hit',tags:['Iran','United States','Israel'],
   tx:'Coalition forces launched a heavy evening bombardment of Tehran, hitting military command facilities and surrounding residential neighborhoods. Iranian media reported extensive damage to infrastructure in southern and western Tehran. Civilian casualty figures climbing as strikes continue targeting buried command bunkers.',
   l:'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-26-26',s:'CNN'},
  {d:'2026-03-26',cat:'military',imp:'e',t:'Israel deploys 3rd division, expands Lebanon ground operation',tags:['Israel','Lebanon'],
   tx:'IDF expanded its ground offensive in southern Lebanon with the deployment of a third division. Forces are pushing deeper toward the Litani River as part of the declared "security zone" occupation. Heavy fighting reported in several villages south of the Litani. Hezbollah claimed a record 94 operations targeting Israeli positions in a single day.',
   l:'https://www.aljazeera.com/news/liveblog/2026/3/26/israel-iran-war-live',s:'Al Jazeera'},
  {d:'2026-03-26',cat:'military',imp:'e',t:'Hezbollah claims record 94 operations targeting Israel in one day',tags:['Lebanon','Israel'],
   tx:'Hezbollah announced it had carried out 94 separate operations against Israeli military positions across a 24-hour period — the highest daily total since the group entered the war on Mar 1. Operations included anti-tank guided missiles, rockets, and explosive drones targeting IDF staging areas, armor columns, and forward positions in southern Lebanon.',
   l:'https://www.aljazeera.com/news/liveblog/2026/3/26/israel-iran-war-live',s:'Al Jazeera'},
  {d:'2026-03-26',cat:'stocks',imp:'e',t:'Wall Street suffers largest daily decline since war started',tags:['United States'],
   tx:'US stocks posted their steepest single-day drop since the conflict began on Feb 28. The S&P 500 fell 3.2%, the Dow dropped over 1,100 points, and the Nasdaq sank 4.1%. Market sentiment soured on the assassination of IRGCN commander Tangsiri and fears the Hormuz deadline extension signals prolonged disruption. Defense stocks rose against the broader decline.',
   l:'https://www.cnbc.com/2026/03/26/stock-market-today-live-updates.html',s:'CNBC'},
  {d:'2026-03-26',cat:'maritime',imp:'d',t:'8 ships transit Hormuz as Iran\'s "show of sincerity" ahead of deadline extension',tags:['Iran'],
   tx:'Eight commercial vessels were allowed to transit the Strait of Hormuz under Iranian navy escort, the largest single-day passage since the blockade began. Iran framed the move as a "show of sincerity" accompanying its request for a deadline extension. Vessels paid no transit fee, contrasting with the $2M/vessel toll system imposed earlier.',
   l:'https://www.reuters.com/business/hormuz-shipping-2026-03-26',s:'Reuters'},
  {d:'2026-03-26',cat:'diplomatic',imp:'d',t:'Pakistan confirms it relayed US 15-point peace plan to Iran',tags:['Pakistan','Iran','United States'],
   tx:'Pakistan\'s Foreign Ministry confirmed it formally transmitted the US 15-point peace proposal to Iranian officials. Sources said Iran has been studying the document and providing initial feedback through Pakistani channels. Senator Rubio said there has been "some concrete progress" toward an agreement. JD Vance and Witkoff remain designated lead negotiators.',
   l:'https://www.dawn.com/news/1884321/pakistan-relayed-us-peace-plan-to-iran',s:'Dawn'},
  {d:'2026-03-26',cat:'diplomatic',imp:'d',t:'Rubio: "some concrete progress" toward Iran agreement',tags:['United States','Iran'],
   tx:'Secretary of State Marco Rubio told reporters there has been "some concrete progress" in negotiations with Iran, the most positive assessment from a US official since the war began. He declined to specify which of the 15 points Iran has engaged with, but said the Hormuz deadline extension was a "positive signal." European allies cautiously welcomed the language.',
   l:'https://www.bbc.com/news/world-middle-east-68942615',s:'BBC'},
  {d:'2026-03-26',cat:'humanitarian',imp:'e',t:'Lebanon: 1 million+ displaced, 1,110 killed; Israeli soldier killed in south Lebanon',tags:['Lebanon','Israel'],
   tx:'Lebanese health authorities updated the death toll to 1,110, including 121 children. Over one million people remain displaced from southern Lebanon and Beirut suburbs. An Israeli soldier was killed in fighting in southern Lebanon, bringing the IDF\'s Lebanon campaign death toll to 8. UNICEF warned of a "catastrophic" humanitarian situation for displaced children.',
   l:'https://www.theguardian.com/world/2026/mar/26/lebanon-displacement-crisis',s:'Guardian'},
  {d:'2026-03-26',cat:'aviation',imp:'n',t:'All Iranian civilian airports remain closed; no changes to regional NOTAM status',tags:['Iran'],
   tx:'All Iranian civilian airports remain closed under NOTAM restrictions. No changes to regional airspace status. Regional airports in UAE, Qatar, and Kuwait continue operating under various restriction levels. OPSGROUP continues to advise avoidance of Iranian, Iraqi, and Syrian FIRs.',
   l:'https://ops.group/blog/middle-east-airspace-update-march-26-2026',s:'OPSGROUP'},
  {d:'2026-03-26',cat:'stocks',imp:'n',t:'Brent crude rebounds slightly to $105.85 after steep Mar 25 crash',tags:['Saudi Arabia'],
   tx:'Brent crude recovered from its 6% crash on Mar 25, rising to $105.85/bbl as the Hormuz deadline extension injected uncertainty into energy markets. WTI rose to $93.10. Analysts noted the rebound was modest compared to the sell-off, reflecting mixed signals — diplomatic progress vs. the Tangsiri assassination. Gold edged down to $4,439.',
   l:'https://www.reuters.com/business/energy/oil-prices-2026-03-26',s:'Reuters'},
  {d:'2026-03-26',cat:'general',imp:'n',t:'European airlines extend Gulf route suspensions through April amid Hormuz uncertainty',tags:['United Kingdom','France','Germany'],
   tx:'British Airways, Lufthansa, and Air France extended their Gulf service suspensions through at least April 15, citing the Hormuz deadline extension and continued airspace restrictions. KLM and Turkish Airlines maintained their existing diversions. Emirates continued restricted operations from Dubai at ~40% capacity.',
   l:'https://www.flightglobal.com/airlines/european-carriers-extend-gulf-suspensions/158321.article',s:'FlightGlobal'},

  // ===== Mar 27, 2026 =====
  {d:'2026-03-27',cat:'military',imp:'e',t:'12 US troops injured at Prince Sultan Air Base — KC-135 tankers damaged',tags:['United States','Saudi Arabia'],
   tx:'A coordinated missile and drone attack struck Prince Sultan Air Base in Saudi Arabia, injuring 12 US service members including 2 with serious wounds. Multiple KC-135 Stratotanker refueling aircraft sustained damage. CENTCOM confirmed the attack involved a mix of ballistic missiles and one-way attack drones. Total US casualties since war start: 13 KIA, ~300 wounded (including 225 TBI).',
   l:'https://www.cnn.com/2026/03/27/politics/us-troops-injured-prince-sultan-air-base',s:'CNN'},
  {d:'2026-03-27',cat:'military',imp:'e',t:'IDF strikes Arak Heavy Water Facility and Ardakan Yellowcake Plant — nuclear infrastructure targeted',tags:['Israel','Iran'],
   tx:'Israeli forces struck the Arak Heavy Water Production Facility and the Ardakan Yellowcake Production Plant in coordinated strikes on Iran\'s nuclear fuel cycle infrastructure. Both facilities are linked to Iran\'s ability to produce fissile material. IAEA Director General Grossi condemned the strikes as "extremely dangerous" given the presence of radioactive material. Iran vowed retribution.',
   l:'https://www.timesofisrael.com/israel-strikes-arak-ardakan-nuclear-facilities-2026-03-27',s:'Times of Israel'},
  {d:'2026-03-27',cat:'military',imp:'d',t:'Iran missile fire down 90% — 1/3 of stockpile destroyed, 330 of 470 launchers hit',tags:['Iran','United States'],
   tx:'US intelligence assessed that Iran\'s missile fire rate has dropped to approximately 10 launches per day, down 90% from the war\'s opening days. An estimated one-third of Iran\'s total missile stockpile has been destroyed, another third is damaged or buried under rubble. CENTCOM reported 330 of 470 known launchers destroyed. 70% of remaining fire is cluster munitions. Iranian missile units continue to show low morale and absenteeism.',
   l:'https://www.wsj.com/world/middle-east/iran-missile-capacity-depleted-2026-03-27',s:'WSJ'},
  {d:'2026-03-27',cat:'military',imp:'e',t:'CENTCOM strikes bulldozers clearing tunnel entrances to underground missile facilities',tags:['United States','Iran'],
   tx:'US Central Command announced strikes on heavy machinery — bulldozers and loaders — being used to clear collapsed tunnel entrances to Iran\'s underground missile storage and launch facilities. The strikes aim to prevent Iran from recovering buried missile stockpiles. CENTCOM described the tactic as "infrastructure denial."',
   l:'https://www.centcom.mil/MEDIA/PRESS-RELEASES/2026/03/27',s:'CENTCOM'},
  {d:'2026-03-27',cat:'military',imp:'e',t:'Strikes hit steel plants in Isfahan and Ahvaz — shift to civilian industrial targets',tags:['Iran','United States','Israel'],
   tx:'Coalition strikes targeted steel manufacturing plants in Isfahan and Ahvaz, marking a significant escalation to civilian industrial infrastructure. The strikes appear designed to degrade Iran\'s ability to repair military equipment and produce replacement components. Iran condemned the attacks as "industrial terrorism" and warned of retaliation against Gulf industries with US shareholders.',
   l:'https://www.bbc.com/news/world-middle-east-68955423',s:'BBC'},
  {d:'2026-03-27',cat:'diplomatic',imp:'d',t:'Rubio: war will end in "weeks not months" — no ground troops needed',tags:['United States','Iran'],
   tx:'Secretary Rubio said the conflict would conclude in "weeks not months" and that no US ground troops would be needed in Iran. He cited the 90% reduction in Iranian missile fire and destruction of a third of Iran\'s stockpile as evidence the military campaign is succeeding. European allies expressed cautious optimism but warned against premature declarations of progress.',
   l:'https://www.reuters.com/world/us/rubio-iran-war-weeks-not-months-2026-03-27',s:'Reuters'},
  {d:'2026-03-27',cat:'military',imp:'e',t:'Houthis threaten "direct military intervention" — first missile launch from Yemen toward Israel',tags:['Yemen','Israel'],
   tx:'Ansar Allah (Houthi) forces launched a ballistic missile from Yemen toward Israel for the first time in the conflict, marking their transition from Red Sea anti-shipping operations to direct participation. The missile was intercepted. A Houthi spokesman threatened "direct military intervention" if strikes on "Muslim lands" continue. The launch extends the conflict 2,000+ km south.',
   l:'https://www.aljazeera.com/news/2026/3/27/houthis-launch-missile-at-israel',s:'Al Jazeera'},
  {d:'2026-03-27',cat:'maritime',imp:'e',t:'Iran establishes $2M toll system for Hormuz — warns 3 ships not to pass',tags:['Iran'],
   tx:'Iran formalized a toll system for Strait of Hormuz passage, charging $2M per vessel. Three ships were warned not to attempt passage after declining to pay. The system represents a shift from total blockade to managed access, though at extortionate rates. Yesterday\'s "show of sincerity" with 8 free passages appears to have been a one-day gesture ahead of the deadline extension.',
   l:'https://www.reuters.com/business/hormuz-toll-system-2026-03-27',s:'Reuters'},
  {d:'2026-03-27',cat:'diplomatic',imp:'n',t:'Ukraine–Saudi Arabia defense cooperation agreement — air defense assistance',tags:['Saudi Arabia','Ukraine'],
   tx:'Ukraine and Saudi Arabia signed a defense cooperation agreement focused on air defense technology sharing. The deal leverages Ukraine\'s combat-tested air defense experience gained during the Russian invasion. Saudi Arabia is seeking to diversify its air defense capabilities beyond US Patriot systems given the strain of continuous intercept operations since the war began.',
   l:'https://www.ukrinform.net/rubric-defense/3882145-ukraine-saudi-defense-cooperation.html',s:'Ukrinform'},
  {d:'2026-03-27',cat:'humanitarian',imp:'e',t:'Abu Dhabi fires from intercepted ballistic missile debris — IAEA warns of radiological risk',tags:['UAE','Iran'],
   tx:'Debris from an intercepted Iranian ballistic missile caused fires in Abu Dhabi. No fatalities reported but several residential buildings damaged. Separately, IAEA Director General Grossi warned of a "major radiological incident" risk from continued strikes near Bushehr nuclear power plant and other nuclear facilities. He called for an immediate exclusion zone around all nuclear sites.',
   l:'https://www.bbc.com/news/world-middle-east-68961782',s:'BBC'},
  {d:'2026-03-27',cat:'military',imp:'e',t:'Iran threatens retaliation against Gulf industries with US shareholders',tags:['Iran','UAE','Saudi Arabia','Qatar','Kuwait'],
   tx:'In response to strikes on Isfahan and Ahvaz steel plants, Iran\'s Supreme National Security Council warned it would target "any industrial facility in the Persian Gulf region that has American shareholders or serves American interests." The threat expands Iran\'s targeting doctrine from military to economic infrastructure across Gulf states. ARAMCO, ADNOC, and QatarEnergy all have US investment exposure.',
   l:'https://www.ft.com/content/iran-gulf-industry-threats-2026-03-27',s:'FT'},
  {d:'2026-03-27',cat:'stocks',imp:'n',t:'Brent crude rises to $107.81; gold steady at $4,430',tags:['Saudi Arabia'],
   tx:'Oil prices climbed for the second straight day as the Houthi missile launch toward Israel and Iran\'s formalized Hormuz toll system reignited supply fears. Brent crude settled at $107.81, up from $105.85. WTI hit $95.28. Gold held steady at $4,430/oz. Market uncertainty deepened despite Rubio\'s "weeks not months" assessment.',
   l:'https://www.reuters.com/business/energy/oil-prices-2026-03-27',s:'Reuters'},
  {d:'2026-03-27',cat:'aviation',imp:'n',t:'No changes to regional airport or airspace status — all Iranian airports remain closed',tags:['Iran'],
   tx:'Airport and airspace status unchanged from the previous day. All Iranian civilian airports remain closed. Iraqi airports closed. UAE operating at restricted capacity. Kuwait airport closed since the fuel tank drone strike. OPSGROUP reissued standing guidance to avoid Iranian, Iraqi, and Syrian FIRs.',
   l:'https://ops.group/blog/middle-east-airspace-update-march-27-2026',s:'OPSGROUP'},
  {d:'2026-03-27',cat:'humanitarian',imp:'e',t:'Casualty update: 1,492 Iranian civilians killed; 13 US KIA, ~300 wounded; Lebanon 1,110+',tags:['Iran','United States','Lebanon','Israel'],
   tx:'Updated casualty figures: 1,492 Iranian civilians killed, 3,300+ total Iranian deaths. Lebanon 1,110 killed including 121 children. 13 US service members killed in action, approximately 300 wounded (225 TBI). Gulf countries 50+ killed. Israel 16 killed from Iranian attacks. Total civilian dead across all parties approaching 3,000.',
   l:'https://www.cnn.com/2026/03/27/middleeast/iran-war-casualties-update',s:'CNN'},

  // ===== MARCH 28 =====
  {d:'2026-03-28',cat:'military',imp:'e',t:'Combined force strikes Parchin, MIO Tehran, SADRA Bushehr, Yazd Missile Base — 8 targets in single day',tags:['United States','Israel','Iran'],
   tx:'Massive combined force strike wave hitting Marine Industries Organization (MIO) headquarters in Tehran, Parchin Military Complex, SADRA shipyard in Bushehr, Yazd Missile Base (6th time struck), Physics Department at IUST Tehran, Kavir Steel Company in Kashan, Artesh 44th Artillery Group in Isfahan, and border guard outpost Siranband. WaPo reports combined force has struck 4 key missile production facilities and 29 launch bases since war start.',
   l:'https://www.washingtonpost.com/world/2026/03/28/iran-missile-facilities-strikes/',s:'Washington Post'},
  {d:'2026-03-28',cat:'military',imp:'e',t:'Houthis conduct second attack on Israel — ballistic missiles and drones intercepted',tags:['Yemen','Israel'],
   tx:'Ansar Allah forces launched their second barrage toward Israel, including ballistic missiles, cruise missiles, and drones. All projectiles intercepted by coalition air defenses. Marks escalation from first launch on Mar 27, establishing Yemen as a persistent threat axis.',
   l:'https://www.reuters.com/world/middle-east/houthi-attack-israel-march-28/',s:'Reuters'},
  {d:'2026-03-28',cat:'military',imp:'n',t:'USS Tripoli amphibious assault ship arrives in CENTCOM area — 50,000+ US troops now in region',tags:['United States'],
   tx:'The USS Tripoli (LHA-7) amphibious assault ship arrived in the CENTCOM area of operations, bringing additional Marine air and ground capability. Total US troop presence in the region now exceeds 50,000, including 1,000 recently deployed 82nd Airborne soldiers and special operations forces (Rangers, SEALs).',
   l:'https://www.defense.gov/News/Releases/Release/Article/3800001/',s:'US DoD'},
  {d:'2026-03-28',cat:'diplomatic',imp:'n',t:'Russia providing satellite imagery to Iran — images of Prince Sultan AB, Diego Garcia, Incirlik, Al Udeid',tags:['Russia','Iran','United States','Turkey','United Kingdom','Qatar','Saudi Arabia'],
   tx:'Ukrainian President Zelensky revealed Russia is providing Iran with satellite imagery of coalition military assets. Russian satellites captured images of Prince Sultan Airbase (Saudi), Diego Garcia (US-UK), Incirlik (Turkey), Al Udeid (Qatar), and Shaybah oil field (Saudi) — Iran subsequently attacked all of these sites. Russia also in "very active" discussions on upgraded drone transfers to Iran.',
   l:'https://www.nbcnews.com/world/zelensky-russia-satellite-iran-march-28/',s:'NBC News'},
  {d:'2026-03-28',cat:'maritime',imp:'d',t:'Iran agrees to allow humanitarian/agricultural shipments and 20 Pakistani vessels through Hormuz',tags:['Iran','Pakistan'],
   tx:'Iran agreed to allow humanitarian and agricultural cargo shipments through the Strait of Hormuz following a UN request. Pakistan\'s foreign minister announced Iran also approved 20 Pakistani-flagged vessels for transit — two ships per day through an approved route around Larak Island. IRGCN fast attack craft patrolling between Larak and Qeshm islands serving as "toll collectors."',
   l:'https://www.dawn.com/news/1885234/iran-approves-20-pakistani-ships-hormuz',s:'Dawn'},
  {d:'2026-03-28',cat:'diplomatic',imp:'n',t:'Deepening rift between Pezeshkian and IRGC — president warns economy collapses in 3-4 weeks',tags:['Iran'],
   tx:'Anti-regime media reported a deepening rift between President Pezeshkian and IRGC Commander Vahidi. Pezeshkian warned that IRGC attacks on regional countries are exacerbating economic damage and Iran\'s economy could collapse within 3-4 weeks without a ceasefire. Pezeshkian demanded restoration of executive authority; Vahidi rejected the demand. Security checkpoints established in Isfahan City.',
   l:'https://understandingwar.org/research/middle-east/iran-update-special-report-march-28-2026/',s:'ISW'},
  {d:'2026-03-28',cat:'military',imp:'e',t:'SPND nuclear weapons research chief Ali Fuladvand killed in Borujerd airstrike',tags:['Israel','Iran'],
   tx:'Airstrikes killed Ali Fuladvand, head of research at the Organization of Defensive Innovation and Research (SPND), in Borujerd, Lorestan Province. SPND led Iran\'s nuclear weapons research program before 2003. The US sanctioned Fuladvand in Oct 2025. IDF had previously targeted him during the June 2025 12-Day War, but he survived.',
   l:'https://understandingwar.org/research/middle-east/iran-update-special-report-march-28-2026/',s:'ISW'},
  {d:'2026-03-28',cat:'humanitarian',imp:'e',t:'Residential building struck in Tehran — AP photo of injured boy; cluster munition killed 1 in Ramat Gan',tags:['Iran','Israel'],
   tx:'A strike hit a residential building in Tehran; AP published a photo of a woman looking up at the damage and an injured boy being treated. Separately, an Iranian cluster munition killed one man in Ramat Gan, Israel on Mar 27. Iranian Health Ministry: 244 women and 231 children killed in the war.',
   l:'https://apnews.com/article/iran-tehran-strike-residential-march-28/',s:'AP'},
  {d:'2026-03-28',cat:'military',imp:'n',t:'Iran "Janfada" recruitment campaign — text messages sent to all Iranian mobile users',tags:['Iran'],
   tx:'Iran launched the "Janfada" (Sacrificing Life) recruitment campaign via SMS to all Iranian mobile users, calling for volunteers to fight US forces in the event of a ground operation. The name appeals to nationalist sentiment. Security forces set up checkpoints in Isfahan City and surrounding towns. Mojtaba Khamenei circulated "resistance economy" infographic amid reports he was wounded.',
   l:'https://www.wsj.com/world/middle-east/iran-janfada-recruitment-campaign/',s:'Wall Street Journal'},
  {d:'2026-03-28',cat:'diplomatic',imp:'d',t:'Ukraine–Qatar sign 10-year defense cooperation agreement',tags:['Ukraine','Qatar'],
   tx:'Ukraine and Qatar signed a 10-year defense cooperation agreement, building on the Ukraine-Saudi defense pact signed Mar 27. Qatar becomes the second Gulf state to formalize defense ties with Kyiv since the Iran conflict began.',
   l:'https://www.reuters.com/world/ukraine-qatar-defense-agreement-march-28/',s:'Reuters'},
  {d:'2026-03-28',cat:'stocks',imp:'e',t:'Brent crude rises to ~$109.50; gold climbs to $4,506 on safe-haven demand',tags:['Saudi Arabia'],
   tx:'Oil continued its rebound with Brent climbing to approximately $109.50/bbl, up from $107.81. March on pace for the largest monthly oil price surge on record — up ~50%. Gold rose to $4,505.89, up 2.24% ($101.09) as dip-buyers emerged after hitting $4,098 lows earlier in the week. Silver up 1.87% to $69.98.',
   l:'https://goldprice.org/gold-price-today/2026-03-28',s:'GoldPrice.org'},
  {d:'2026-03-28',cat:'aviation',imp:'n',t:'Airspace unchanged — Iran, Iraq, Kuwait, Syria closed; EASA CZIB extended',tags:['Iran','Iraq','Kuwait','Syria'],
   tx:'No changes to regional airspace status. Iran, Iraq, Kuwait, and Syria FIRs remain closed. Israel, Bahrain, UAE, and Qatar operating under strict restrictions. OPSGROUP reports two routing options: south via Egypt-Saudi-Oman, or north via Caucasus-Afghanistan (Class G, no ATC). GNSS interference and spoofing reported across the region.',
   l:'https://ops.group/blog/middle-east-airspace-current-operational-picture/',s:'OPSGROUP'},
  {d:'2026-03-28',cat:'humanitarian',imp:'e',t:'HRANA: 3,461 killed in Iran including 1,551 civilians, 236 children',tags:['Iran','United States','Israel'],
   tx:'The US-based Human Rights Activists News Agency (HRANA) reported 3,461 people killed in Iran by US-Israeli strikes since Feb 28 — including 1,551 civilians, 1,208 military personnel, 702 undetermined. 236 of the victims were children. Iranian Health Ministry separately confirmed 244 women and 231 children killed.',
   l:'https://abc7chicago.com/live-updates/iran-war-news-trump-strikes-delay-israel-middle-east-oil/18756340/entry/18805479/',s:'ABC News'},
  {d:'2026-03-28',cat:'maritime',imp:'n',t:'Bahrain intercepts 391 drones and 174 ballistic missiles since war began',tags:['Bahrain','Iran'],
   tx:'Bahrain Defence Force reported intercepting another 6 drones from Iran in the previous 24 hours. Total intercepts since Feb 28: 391 drones and 174 ballistic missiles. Bahrain remains a key coalition air defense node despite its small size.',
   l:'https://www.bna.bh/en/news/Defence/BahrainInterception391.aspx',s:'BNA'},

  // ===== MARCH 29 =====
  {d:'2026-03-29',cat:'military',imp:'e',t:'Combined force struck 4 key missile production facilities and 29 launch bases — "severe damage" halts missile production',tags:['United States','Israel','Iran'],
   tx:'The Washington Post reported the combined force has struck Khojir (88 structures destroyed), Shahroud (28 structures), Parchin (12 structures), and Hakimiyeh (19 structures) missile production facilities. Four experts assessed the damage has "most likely halted Iran\'s ability to produce short- and medium-range ballistic missiles." 77% of 107 analyzed tunnel entrances struck. IDF says "days away" from hitting all top priority targets.',
   l:'https://www.washingtonpost.com/world/2026/03/29/iran-missile-production-halted/',s:'Washington Post'},
  {d:'2026-03-29',cat:'military',imp:'e',t:'US Special Operations forces arrive — Rangers, SEALs; 50,000+ troops in region',tags:['United States'],
   tx:'US Army Rangers and Navy SEALs have arrived in the CENTCOM area of operations, joining more than 50,000 US military personnel now deployed. Iran\'s IRGC accused Trump of "secretly planning a ground invasion." Ghalibaf warned publicly about ground operation preparations.',
   l:'https://www.cnn.com/2026/03/29/politics/us-special-operations-middle-east/',s:'CNN'},
  {d:'2026-03-29',cat:'military',imp:'e',t:'IDF strikes missile and drone production sites in Tehran — "days away" from completing priority targets',tags:['Israel','Iran'],
   tx:'The IDF struck an Iranian Defense Ministry missile engine production site, a drone engine production site, and an air defense system storage facility in Tehran. An IDF spokesperson stated Israel is "days away" from striking all "top priority" defense industrial targets in Iran. IDF also struck the IRGC 18th Al Ghadir Brigade base in Yazd City and "Amir ol Momenin" headquarters in Isfahan.',
   l:'https://www.timesofisrael.com/idf-strikes-tehran-missile-drone-production/',s:'Times of Israel'},
  {d:'2026-03-29',cat:'military',imp:'e',t:'Iranian missiles hit Beersheba and Tel Aviv — 11 wounded; chemical plant struck',tags:['Iran','Israel'],
   tx:'Iran fired seven missile barrages at Israel, concentrated around Beersheba. Over 20 missile impacts reported. 11 people injured near Beersheba. An Iranian missile or debris struck ADAMA\'s Makhteshim agrochemicals plant in Ne\'ot Hovav, causing fire — 800m exclusion zone declared due to chemical/industrial hazards. Explosion also reported on Menakhem Begin Highway in Tel Aviv. IRGC said attack was retaliation for strikes on Iranian industrial sites.',
   l:'https://understandingwar.org/research/middle-east/iran-update-special-report-march-29-2026/',s:'ISW'},
  {d:'2026-03-29',cat:'military',imp:'e',t:'Netanyahu orders expansion of Lebanon security zone — 1,200+ killed in Lebanon',tags:['Israel','Lebanon'],
   tx:'Netanyahu announced expansion of the Lebanon "security zone." Total Lebanese dead now exceed 1,200 including children. 850 Hezbollah fighters killed in recent clashes, many from the elite Radwan Force. IDF killed 3 Lebanese journalists (Al Manar, Al-Mayadeen) on Mar 28. UN peacekeeper killed in south Lebanon. 49 killed in Lebanon on Sunday alone.',
   l:'https://abc7chicago.com/live-updates/iran-war-news-trump-strikes-delay-israel-middle-east-oil/18756340/',s:'ABC News'},
  {d:'2026-03-29',cat:'military',imp:'e',t:'Israeli-American soldier killed in Lebanon combat — 5th IDF death since Feb 28',tags:['Israel','United States'],
   tx:'Moshe Yitzhak Hacohen Katz, 22, from New Haven, Connecticut, was killed in combat in Lebanon — the 5th Israeli soldier killed since Feb 28. IDF described the ground operation as "defensive" despite seizing additional Lebanese territory as a "buffer zone."',
   l:'https://abc7chicago.com/live-updates/iran-war-news-trump-strikes-delay-israel-middle-east-oil/18756340/',s:'ABC News'},
  {d:'2026-03-29',cat:'diplomatic',imp:'d',t:'Pakistan announces US-Iran talks "in coming days" — Saudi, Turkey, Egypt FMs in Islamabad',tags:['Pakistan','United States','Iran','Saudi Arabia','Turkey','Egypt'],
   tx:'Pakistan announced US-Iran peace talks "in coming days." Saudi, Turkish, and Egyptian foreign ministers gathered in Islamabad for preparatory discussions — warring parties not present. Iran\'s Araghchi told Turkey the US is making "unreasonable demands." Trump said a deal "could be soon."',
   l:'https://www.dawn.com/news/1885567/pakistan-us-iran-talks-coming-days/',s:'Dawn'},
  {d:'2026-03-29',cat:'humanitarian',imp:'e',t:'Strikes on Tehran TV station and port — 5 killed; Kuwait desalination plant attacked',tags:['Iran','Kuwait','India'],
   tx:'Combined force struck a television station in Tehran and a port facility, killing 5. Al Araby\'s Qatari media office building also struck. Kuwait suffered an attack on a power/water desalination plant, killing one Indian worker. Power outages reported across eastern Tehran and Karaj from strikes near Parchin targeting power transmission networks.',
   l:'https://www.aljazeera.com/news/2026/3/29/iran-war-latest-tehran-strikes-kuwait-desalination/',s:'Al Jazeera'},
  {d:'2026-03-29',cat:'maritime',imp:'n',t:'50+ containerships stranded west of Hormuz — 20+ vessels crossed since Mar 28; MARAD warns AIS used for targeting',tags:['Iran'],
   tx:'Over 50 containerships remain stranded west of the Strait of Hormuz. More than 20 vessels have crossed since Mar 28 under Iran\'s controlled transit regime. COSCO ULCCs initially denied passage then completed crossing. US MARAD issued advisory warning that AIS transponder data is being used for targeting in the Red Sea.',
   l:'https://www.lloydslist.com/LL1152000/Hormuz-shipping-stranded-march-29/',s:'Lloyd\'s List'},
  {d:'2026-03-29',cat:'diplomatic',imp:'e',t:'Trump threatens broad strikes on Iran infrastructure if talks fail',tags:['United States','Iran'],
   tx:'Trump threatened to expand strikes to broad Iranian civilian infrastructure if peace talks fail, while simultaneously saying a deal "could be soon." The threat escalated rhetoric as Pakistan prepared to host US-Iran negotiations. IDF spokesperson also confirmed prioritizing strikes on Iranian weapons production and nuclear facilities.',
   l:'https://abc7chicago.com/live-updates/iran-war-news-trump-strikes-delay-israel-middle-east-oil/18756340/',s:'ABC News'},
  {d:'2026-03-29',cat:'stocks',imp:'e',t:'Brent crude reaches $111.10; gold rebounds to $4,541 — worst monthly gold performance since 2008',tags:['Saudi Arabia'],
   tx:'Brent crude climbed to approximately $111/bbl as oil posted its largest monthly surge on record (~50% in March). Gold rebounded to $4,541 as dip-buyers stepped in after touching $4,098 earlier in the week. Despite the rebound, gold remains down 14% for March — its worst monthly performance since October 2008. Brent now above $115 according to USAGOLD.',
   l:'https://www.usagold.com/daily-gold-price-history/',s:'USAGOLD'},
  {d:'2026-03-29',cat:'military',imp:'e',t:'10 Kuwaiti military personnel injured in Iranian attack',tags:['Kuwait','Iran'],
   tx:'The Kuwaiti Army reported 10 military personnel injured in an Iranian missile or drone attack. Kuwait has suffered repeated attacks since being drawn into the conflict in mid-March despite its neutral stance.',
   l:'https://abc7chicago.com/live-updates/iran-war-news-trump-strikes-delay-israel-middle-east-oil/18756340/',s:'ABC News'},
  {d:'2026-03-29',cat:'aviation',imp:'n',t:'Airspace status unchanged — OPSGROUP confirms no reopenings since last update',tags:['Iran','Iraq','Kuwait','Syria'],
   tx:'OPSGROUP confirmed no airspace reopenings. Iran, Iraq, Kuwait, Syria FIRs closed. Israel, Bahrain, UAE, Qatar heavily restricted. Southern bypass (Egypt-Saudi-Oman) and northern bypass (Caucasus-Afghanistan) remain the only routing options. Power outages in Tehran and Karaj from strikes on transmission infrastructure near Parchin.',
   l:'https://ops.group/blog/middle-east-airspace-current-operational-picture/',s:'OPSGROUP'},
  {d:'2026-03-29',cat:'humanitarian',imp:'e',t:'3 Lebanese journalists killed in Israeli airstrike — total Lebanon dead exceeds 1,200',tags:['Lebanon','Israel'],
   tx:'Three Lebanese journalists — Ali Shuaib (Al Manar), Fatima Ftouni, and Mohamed Ftouni (Al-Mayadeen) — killed in an Israeli airstrike on Mar 28. IDF claimed Shuaib was a Radwan Force member but provided no evidence. Total Lebanese dead now exceeds 1,200. 49 killed in Lebanon on Sunday. UN peacekeeper also killed in south Lebanon.',
   l:'https://www.terrorism-info.org.il/en/spotlight-on-terrorism-hezbollah-and-lebanon-march-23-29-2026/',s:'Meir Amit Center'},
  {d:'2026-03-30',cat:'military',imp:'e',t:'US-Israel overnight strikes hit Tehran power infrastructure — capital blackout, later restored',tags:['United States','Israel','Iran'],
   tx:'Overnight strikes targeted electricity transmission and distribution infrastructure in Tehran. Iranian authorities confirmed a city-wide blackout that was subsequently restored. Strikes also hit further industrial targets. Day 31 of the conflict.',
   l:'https://www.aljazeera.com/news/liveblog/2026/3/30/iran-war-live-worker-killed-in-kuwait-israel-intercepts-drones-from-yemen',s:'Al Jazeera'},
  {d:'2026-03-30',cat:'military',imp:'e',t:'Turkey/NATO intercept 4th missile directed at Turkish territory since conflict began',tags:['Turkey'],
   tx:'Turkish air defenses intercepted a ballistic missile heading toward Turkish territory — the fourth such interception since the conflict began Feb 28. NATO Secretary-General convened emergency consultations.',
   l:'https://www.aljazeera.com/news/liveblog/2026/3/30/iran-war-live-worker-killed-in-kuwait-israel-intercepts-drones-from-yemen',s:'Al Jazeera'},
  {d:'2026-03-30',cat:'humanitarian',imp:'e',t:'Indian worker killed in Iranian attack on power and desalination plant; woman injured in Jordan from falling debris',tags:['Iran','India','Jordan'],
   tx:'An Indian national was killed when an Iranian missile struck a power and desalination facility. A woman in Jordan sustained injuries from falling debris. Total confirmed non-combatant deaths in Gulf states reached 27.',
   l:'https://www.aljazeera.com/news/liveblog/2026/3/30/iran-war-live-worker-killed-in-kuwait-israel-intercepts-drones-from-Yemen',s:'Al Jazeera'},
  {d:'2026-03-30',cat:'diplomatic',imp:'e',t:'Trump threatens to destroy Iran\'s power plants, oil wells, Kharg Island and desalination plants if no deal',tags:['United States','Iran'],
   tx:'President Trump posted on Truth Social: "If a deal is not reached soon and the Strait of Hormuz reopened, the United States will have no choice but to end the war by destroying all of Iran\'s power plants, oil wells, Kharg Island, and possibly all its desalinization plants." Rubio told Al Jazeera that Trump "prefers diplomacy."',
   l:'https://www.cnn.com/2026/03/30/world/live-news/iran-war-us-israel-trump',s:'CNN'},
  {d:'2026-03-30',cat:'maritime',imp:'d',t:'Hegseth downplays Hormuz risk as merchant traffic sees small increase; Lloyd\'s List: still under 10% of normal',tags:['United States','Iran'],
   tx:'Defense Secretary Pete Hegseth stated the Strait of Hormuz is not effectively blockaded as merchant traffic saw a minimal rise. However, Lloyd\'s List tracked only 48 cargo vessels over 10,000 DWT transiting between Mar 23-29 — against a historical average of 138 vessels per 24-hour period. Two Chinese-flagged vessels completed transits on Mar 30.',
   l:'https://news.usni.org/2026/03/31/hegseth-downplays-risk-of-sailing-through-strait-of-hormuz-as-merchant-traffic-sees-small-increase',s:'USNI News'},
  {d:'2026-03-30',cat:'stocks',imp:'e',t:'Brent crude rises to $111.10; gold at $4,567 — bargain hunters stage relief rally after steepest monthly decline in decades',tags:['Saudi Arabia'],
   tx:'Brent crude settled at $111.10/bbl. Gold spot price reached $4,567/oz as bargain hunters stepped in after gold\'s steepest monthly decline in nearly two decades. Precious metals staged a relief rally. Brent on track for biggest monthly gain since 1988.',
   l:'https://fortune.com/article/current-price-of-gold-03-30-2026/',s:'Fortune / CNBC'},
  {d:'2026-03-30',cat:'humanitarian',imp:'e',t:'Cumulative war toll: 1,937 killed in Iran; 24 killed in Israel; 13 US soldiers KIA; 27 killed in Gulf states',tags:['Iran','Israel','United States'],
   tx:'Al Jazeera live tracker cumulative figures as of Mar 30: Iran 1,937 dead; Israel 24 dead (civilian and military); 13 US soldiers killed in action; 27 killed across Gulf states. Thousands more injured on all sides.',
   l:'https://www.aljazeera.com/news/2026/3/1/us-israel-attacks-on-iran-death-toll-and-injuries-live-tracker',s:'Al Jazeera'},
  {d:'2026-03-30',cat:'aviation',imp:'n',t:'Airspace status unchanged — Iran, Iraq, Kuwait, Syria closed; regional NOTAMs extended',tags:['Iran','Iraq','Kuwait','Syria'],
   tx:'No changes to regional airspace status on Mar 30. All Iranian FIRs remain closed. EASA CZIB in effect for Gulf states. Northern and southern bypass routes remain the only viable routing options for commercial aviation.',
   l:'https://ops.group/blog/middle-east-airspace-current-operational-picture/',s:'OPSGROUP'},
  {d:'2026-03-31',cat:'maritime',imp:'e',t:"Kuwaiti VLCC Al Salmi struck by Iranian drone at Port of Dubai — fire breaks out",tags:["Iran","Kuwait","UAE"],
   tx:"An Iranian drone struck the Kuwaiti-flagged Very Large Crude Carrier Al Salmi while it was anchored at the Port of Dubai on March 31, causing a fire. The attack marks the first direct strike on a commercial vessel inside a UAE port since the conflict began. Port operations temporarily suspended while the fire was controlled. No fatalities reported.",
   l:'https://www.aljazeera.com/news/liveblog/2026/3/31/iran-war-live-kuwaiti-oil-tanker-hit-in-dubai-port-3-un-troops-killed',s:'Al Jazeera'},
  {d:'2026-03-31',cat:'diplomatic',imp:'d',t:"Trump: US could end Iran war in 'two to three weeks' — Iran doesn't need to make a deal",tags:["USA","Iran"],
   tx:"President Trump told reporters on March 31 that the US military operation in Iran could conclude within two to three weeks. In a notable signal, Trump added that Iran 'doesn't have to make a deal' for the US to end its military action. The statement was interpreted as either a timeline for withdrawal or continued pressure. Iran's Foreign Minister Araghchi said he had 'no faith' in talks with Washington.",
   l:'https://www.npr.org/2026/03/31/nx-s1-5766991/iran-war-lebanon-israel-dubai',s:'NPR'},
  {d:'2026-03-31',cat:'military',imp:'e',t:"Hezbollah fires rocket barrage at northern Israel — 3 lightly injured; IDF strikes launchers",tags:["Lebanon","Israel"],
   tx:"Hezbollah launched a rocket barrage targeting northern Israeli communities on March 31, lightly injuring 3 civilians. The IDF responded with airstrikes on the launcher positions in southern Lebanon. Israel has deployed its 3rd division to the area and expanded the declared security zone north of the Litani River.",
   l:'https://www.timesofisrael.com/liveblog-march-31-2026/',s:'Times of Israel'},
  {d:'2026-03-31',cat:'military',imp:'e',t:"Iranian missiles hit central Israel — workshop fire in Petah Tikva; 87th IRGC attack wave",tags:["Iran","Israel"],
   tx:"Iran launched its 87th regional attack barrage since the conflict began, this time led by the IRGC Navy. Ballistic missiles struck central Israel, causing a fire at a workshop in Petah Tikva. IDF air defense intercepted the majority of incoming projectiles. Netanyahu stated the 'Iranian regime is weaker than ever' as strikes continue degrading Iran's military production capacity.",
   l:'https://www.jpost.com/middle-east/iran-news/2026-03-31/live-updates-891725',s:'Jerusalem Post'},
  {d:'2026-03-31',cat:'military',imp:'e',t:"Israeli strikes kill 7 in Beirut's southern suburbs — Jnah and Khaldeh neighborhoods hit",tags:["Israel","Lebanon"],
   tx:"Israeli airstrikes killed at least 7 people in Beirut's southern suburbs on March 31, with 5 killed in the Jnah area and 2 in Khaldeh. The IDF said it was targeting Hezbollah military infrastructure embedded in residential areas. Lebanon's Health Ministry confirmed the casualties.",
   l:'https://www.aljazeera.com/news/2026/4/1/israeli-strikes-on-beirut-kill-7-hezbollah-fights-back-in-southern-lebanon',s:'Al Jazeera'},
  {d:'2026-03-31',cat:'stocks',imp:'e',t:"Brent crude hits conflict high of $121.88 — up 61% since war began; markets rattled",tags:["Saudi Arabia","Iran","USA"],
   tx:"Brent crude surged to $121.88 per barrel on March 31, the highest level of the conflict and a 61% increase from pre-war prices. The Kuwaiti tanker strike in Dubai port added a new threat vector — attacks on sovereign port facilities — that traders had not priced in. WTI settled at $108.50.",
   l:'https://fortune.com/article/price-of-oil-03-31-2026/',s:'Fortune'},
  {d:'2026-03-31',cat:'diplomatic',imp:'e',t:"Trump considers withdrawing US from NATO amid Iran war debate",tags:["USA"],
   tx:"President Trump told NBC News on March 31 that he is 'strongly considering' pulling the United States out of NATO. The statement came amid growing frustration over European allies declining to contribute combat forces to the Iran operation. NATO Secretary-General called an emergency session. The comment sent shockwaves through European capitals already strained by energy shocks from the Hormuz crisis.",
   l:'https://www.nbcnews.com/world/middle-east/live-blog/live-updates-iran-war-trump-address-nation-rcna266149',s:'NBC News'},
  {d:'2026-04-01',cat:'diplomatic',imp:'d',t:"Trump claims Iran's President Pezeshkian asked for ceasefire — Iran immediately denies it",tags:["USA","Iran"],
   tx:"President Trump posted on Truth Social that Iranian President Pezeshkian had personally requested a ceasefire. Trump said the US would 'consider' the request only once the Strait of Hormuz is 'open and clear' — adding 'Until then, we are blasting Iran into oblivion.' Iran's presidential office called the claim 'false and baseless.' IRGC said the strait was 'fully under our control.' The dueling statements created maximum diplomatic confusion hours before Trump's prime-time address.",
   l:'https://www.cnbc.com/2026/04/01/trump-iran-war-ceasefire.html',s:'CNBC'},
  {d:'2026-04-01',cat:'military',imp:'e',t:"Iran fires largest missile salvo since war began — 6 barrages on central Israel, 14 injured",tags:["Iran","Israel"],
   tx:"Iran launched its largest single-day missile attack since the conflict began on April 1, firing 6 consecutive barrages at central Israel. Emergency services reported 14 people injured, including children. IDF said most missiles struck open areas based on initial assessments. The massive salvo came the same morning Trump claimed Iran was seeking a ceasefire — directly contradicting the diplomatic narrative.",
   l:'https://www.timesofisrael.com/liveblog-april-01-2026/',s:'Times of Israel'},
  {d:'2026-04-01',cat:'military',imp:'e',t:"US-Israel strikes hit pharmaceutical companies and steel plants in Isfahan and Farokhshahr",tags:["USA","Israel","Iran"],
   tx:"US and Israeli aircraft struck pharmaceutical manufacturing facilities and steel production plants in Isfahan and Farokhshahr on April 1, according to Iranian media and officials. The targeting of pharmaceutical plants drew international condemnation — the UN High Commissioner for Human Rights called the strikes a potential violation of international humanitarian law. Iran denied the facilities had dual-use military function.",
   l:'https://www.aljazeera.com/news/liveblog/2026/4/1/iran-live-trump-says-no-deal-needed-to-end-war-isfahan-steel-plants-hit',s:'Al Jazeera'},
  {d:'2026-04-01',cat:'diplomatic',imp:'n',t:"Trump to address nation at 9pm ET with 'Operation Epic Fury' update; war ending in '2–3 weeks'",tags:["USA","Iran"],
   tx:"The White House announced President Trump would deliver a prime-time address at 9pm ET on April 1, described as an operational update on 'Operation Epic Fury.' Trump reiterated the conflict could conclude in two to three weeks. Iran's Foreign Minister Araghchi said he had 'no faith' in negotiations with Washington. Rubio told reporters Trump 'strongly prefers a diplomatic solution.'",
   l:'https://www.upi.com/Top_News/US/2026/04/01/trump-iran-cease-fire-address-nation/9181775050008/',s:'UPI'},
  {d:'2026-04-01',cat:'military',imp:'e',t:"Israeli airstrikes kill 7 in Beirut — Jnah and Khaldeh neighborhoods struck",tags:["Israel","Lebanon"],
   tx:"Israeli airstrikes killed at least 7 people in Beirut's southern suburbs on April 1, targeting Hezbollah infrastructure in the Jnah and Khaldeh areas. Lebanon's Health Ministry said at least 125 children are among the 1,318+ killed in Israeli strikes since the conflict began. UNIFIL confirmed a UN peacekeeper was also killed in southern Lebanon.",
   l:'https://www.aljazeera.com/news/2026/4/1/israeli-strikes-on-beirut-kill-7-hezbollah-fights-back-in-southern-lebanon',s:'Al Jazeera'},
  {d:'2026-04-01',cat:'stocks',imp:'d',t:"Brent falls to $105.20 on ceasefire speculation; gold bounces to $4,747 after worst March in decades",tags:["Saudi Arabia","Iran","USA"],
   tx:"Brent crude fell sharply to $105.20 on April 1 — a $16 drop from the March 31 high of $121.88 — as Trump's ceasefire claims triggered commodity selling. WTI settled at $93.00. Gold reversed course, rising 1.5% to $4,747 after its worst monthly performance in decades, as safe-haven demand returned amid the missile barrage. Analysts noted the oil move was likely premature given Iran's denial.",
   l:'https://fortune.com/article/price-of-oil-04-01-2026/',s:'Fortune'},
  {d:'2026-04-01',cat:'maritime',imp:'n',t:"IRGC: Hormuz 'fully under our control'; 201 crossings in March — down 95% from peacetime",tags:["Iran"],
   tx:"The IRGC issued a statement on April 1 declaring the Strait of Hormuz 'fully under our control,' pushing back against Trump's claim of an opening. From March 1–31, commodities carriers made only 201 crossings — a 95% decrease from peacetime. Bettors were placing 30% odds on a seven-day average above 10 transits per day, per IMF PortWatch. Iran's selective vetting system remains the primary control mechanism.",
   l:'https://www.unitedagainstnucleariran.com/blog/iran-war-shipping-update-march-31-2026',s:'UANI'},
];

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
const HZ_EVENTS = [
  // Pre-conflict maritime events
  {d:'2026-02-26',type:'patrol',desc:'All US ships leave Bahrain port as fleet evacuates to open water',lat:26.2,lng:50.6,count:6},

  // Conflict period
  {d:'2026-02-28',type:'mine',desc:'IRGCN lays mines near Strait western approach',lat:26.15,lng:55.8,count:12},
  {d:'2026-02-28',type:'mine',desc:'Mines detected near Larak Island channel',lat:26.7,lng:56.3,count:8},
  {d:'2026-02-28',type:'patrol',desc:'USN 5th Fleet deploys minesweepers to Strait',lat:26.0,lng:56.1,count:4},
  {d:'2026-02-28',type:'passage',desc:'Commercial shipping halted through Strait',lat:26.2,lng:56.0,count:0},
  {d:'2026-02-28',type:'passage',desc:'Bab el-Mandeb crossings drop sharply — 14 transits',lat:12.6,lng:43.3,count:14,region:'redsea'},
  {d:'2026-02-28',type:'houthi',desc:'Houthis declare Red Sea a war zone for US/Israeli-linked vessels',lat:14.5,lng:42.5,count:0,region:'redsea'},

  {d:'2026-03-01',type:'mine',desc:'Second wave of mines laid near Musandam',lat:26.08,lng:56.2,count:15},
  {d:'2026-03-01',type:'patrol',desc:'Royal Navy HMS Montrose joins mine countermeasures',lat:25.8,lng:56.4,count:2},
  {d:'2026-03-01',type:'passage',desc:'All tanker traffic diverted via Fujairah pipeline',lat:25.2,lng:56.4,count:0},
  {d:'2026-03-01',type:'passage',desc:'Bab el-Mandeb traffic — 11 crossings amid Houthi threats',lat:12.6,lng:43.3,count:11,region:'redsea'},
  {d:'2026-03-01',type:'houthi',desc:'Anti-ship ballistic missile fired at container ship south of Mocha',lat:13.5,lng:43.1,count:1,region:'redsea'},
  {d:'2026-03-01',type:'houthi',desc:'Drone swarm targets tanker near Bab el-Mandeb',lat:12.8,lng:43.4,count:3,region:'redsea'},

  {d:'2026-03-02',type:'cleared',desc:'USN MCM clears 4 mines from western channel',lat:26.1,lng:55.9,count:4},
  {d:'2026-03-02',type:'patrol',desc:'French frigate Languedoc patrols eastern approach',lat:25.9,lng:57.2,count:1},
  {d:'2026-03-02',type:'passage',desc:'Bab el-Mandeb — 9 crossings, major carriers suspended',lat:12.6,lng:43.3,count:9,region:'redsea'},
  {d:'2026-03-02',type:'houthi',desc:'Houthi missile near-miss on bulk carrier off Hodeidah',lat:14.9,lng:42.8,count:1,region:'redsea'},
  {d:'2026-03-02',type:'patrol',desc:'USS Eisenhower CSG intercepts 2 drones over Red Sea',lat:16.0,lng:41.5,count:2,region:'redsea'},

  {d:'2026-03-03',type:'mine',desc:'Additional mines found drifting near Qeshm',lat:26.75,lng:55.8,count:6},
  {d:'2026-03-03',type:'cleared',desc:'Coalition clears mines from outbound lane',lat:26.2,lng:56.3,count:7},
  {d:'2026-03-03',type:'patrol',desc:'Combined Task Force 152 sweeps intensify',lat:26.0,lng:55.7,count:6},
  {d:'2026-03-03',type:'passage',desc:'Bab el-Mandeb — 7 crossings as Cape rerouting accelerates',lat:12.6,lng:43.3,count:7,region:'redsea'},
  {d:'2026-03-03',type:'houthi',desc:'Two drones hit commercial tanker — crew evacuated',lat:13.2,lng:43.3,count:2,region:'redsea'},
  {d:'2026-03-03',type:'patrol',desc:'EUNAVFOR Aspides deploys to southern Red Sea',lat:14.0,lng:42.0,count:3,region:'redsea'},

  {d:'2026-03-04',type:'cleared',desc:'Eastern approach partially cleared',lat:26.0,lng:56.8,count:5},
  {d:'2026-03-04',type:'passage',desc:'First escorted tanker convoy transits Strait',lat:26.15,lng:56.2,count:3},
  {d:'2026-03-04',type:'passage',desc:'Bab el-Mandeb — 6 crossings, Saudi Yanbu pivot begins',lat:12.6,lng:43.3,count:6,region:'redsea'},
  {d:'2026-03-04',type:'patrol',desc:'USN establishes minesweeping corridor',lat:26.1,lng:56.0,count:8},
  {d:'2026-03-04',type:'houthi',desc:'Houthi ASBM targets destroyer — intercepted by SM-2',lat:15.5,lng:42.0,count:1,region:'redsea'},
  {d:'2026-03-04',type:'houthi',desc:'Uncrewed surface vessel detected near Bab el-Mandeb',lat:12.6,lng:43.2,count:1,region:'redsea'},

  {d:'2026-03-05',type:'cleared',desc:'Western approach declared partially navigable',lat:26.15,lng:55.7,count:6},
  {d:'2026-03-05',type:'passage',desc:'Limited escorted convoys resume — 5 tankers transit',lat:26.2,lng:56.1,count:5},
  {d:'2026-03-05',type:'passage',desc:'Bab el-Mandeb — 8 crossings, VLCCs heading to Yanbu',lat:12.6,lng:43.3,count:8,region:'redsea'},
  {d:'2026-03-05',type:'houthi',desc:'Missile barrage targets three vessels in Bab el-Mandeb',lat:12.7,lng:43.3,count:4,region:'redsea'},
  {d:'2026-03-05',type:'patrol',desc:'Coalition air patrols over central Red Sea intensify',lat:18.0,lng:40.0,count:6,region:'redsea'},

  {d:'2026-03-06',type:'mine',desc:'New mines discovered along inbound lane',lat:26.25,lng:55.5,count:4},
  {d:'2026-03-06',type:'passage',desc:'Convoy operations continue under escort',lat:26.15,lng:56.0,count:4},
  {d:'2026-03-06',type:'passage',desc:'Bab el-Mandeb — 10 crossings, Saudi crude tankers dominate',lat:12.6,lng:43.3,count:10,region:'redsea'},
  {d:'2026-03-06',type:'patrol',desc:'Multinational force expands sweep zone',lat:25.8,lng:56.0,count:10},
  {d:'2026-03-06',type:'houthi',desc:'Suicide drone boat detonates near tanker off Mocha',lat:13.4,lng:43.2,count:1,region:'redsea'},

  {d:'2026-03-07',type:'cleared',desc:'Coalition clears newly laid mines from inbound lane',lat:26.25,lng:55.5,count:4},
  {d:'2026-03-07',type:'passage',desc:'8 tankers transit in two convoy groups',lat:26.18,lng:56.1,count:8},
  {d:'2026-03-07',type:'passage',desc:'Bab el-Mandeb — 12 crossings, Saudi Red Sea export at record',lat:12.6,lng:43.3,count:12,region:'redsea'},
  {d:'2026-03-07',type:'houthi',desc:'Two ASBMs launched at Red Sea — both intercepted',lat:15.0,lng:42.5,count:2,region:'redsea'},
  {d:'2026-03-07',type:'patrol',desc:'Djibouti-based P-8 maritime patrol flights doubled',lat:11.5,lng:43.0,count:4,region:'redsea'},

  {d:'2026-03-08',type:'mine',desc:'IRGCN speedboats spotted laying mines at night',lat:26.5,lng:55.6,count:7},
  {d:'2026-03-08',type:'patrol',desc:'USN helicopter patrols detect mine-laying activity',lat:26.4,lng:55.7,count:5},
  {d:'2026-03-08',type:'passage',desc:'Convoy paused pending new mine clearance',lat:26.1,lng:56.0,count:0},
  {d:'2026-03-08',type:'passage',desc:'Bab el-Mandeb — 15 crossings, 27 VLCCs en route to Yanbu',lat:12.6,lng:43.3,count:15,region:'redsea'},
  {d:'2026-03-08',type:'houthi',desc:'Houthi drone swarm — 5 drones attack container ship',lat:14.2,lng:42.8,count:5,region:'redsea'},
  {d:'2026-03-08',type:'houthi',desc:'Mine-like object reported near Hanish Islands',lat:13.7,lng:42.9,count:1,region:'redsea'},

  {d:'2026-03-09',type:'cleared',desc:'MH-53E helicopters clear contact mines',lat:26.5,lng:55.6,count:7},
  {d:'2026-03-09',type:'passage',desc:'Convoys resume after 24hr pause',lat:26.15,lng:56.1,count:6},
  {d:'2026-03-09',type:'passage',desc:'Bab el-Mandeb — 18 crossings, Saudi export pivot in full effect',lat:12.6,lng:43.3,count:18,region:'redsea'},
  {d:'2026-03-09',type:'houthi',desc:'Lull in Houthi attacks — back-channel talks reported',lat:14.8,lng:42.9,count:0,region:'redsea'},

  {d:'2026-03-10',type:'passage',desc:'12 tankers transit — highest since conflict began',lat:26.2,lng:56.0,count:12},
  {d:'2026-03-10',type:'passage',desc:'Bab el-Mandeb — 16 crossings, below 21/day average',lat:12.6,lng:43.3,count:16,region:'redsea'},
  {d:'2026-03-10',type:'patrol',desc:'CTF-152 declares outbound lane 90% cleared',lat:26.2,lng:56.5,count:12},
  {d:'2026-03-10',type:'houthi',desc:'Houthi resumes attacks — ASBM hits Greek-owned tanker',lat:15.3,lng:42.2,count:1,region:'redsea'},
  {d:'2026-03-10',type:'patrol',desc:'Combined Maritime Force escorts Red Sea convoy',lat:16.5,lng:41.0,count:5,region:'redsea'},

  {d:'2026-03-11',type:'mine',desc:'Drifting mines found near Hormuz Island',lat:26.9,lng:56.4,count:3},
  {d:'2026-03-11',type:'passage',desc:'10 vessel convoy transits safely',lat:26.18,lng:56.0,count:10},
  {d:'2026-03-11',type:'passage',desc:'Bab el-Mandeb — 19 crossings, Yanbu at max berth capacity',lat:12.6,lng:43.3,count:19,region:'redsea'},
  {d:'2026-03-11',type:'houthi',desc:'Two missiles target Suez-bound vessel — one hit, minor damage',lat:14.0,lng:42.6,count:2,region:'redsea'},

  {d:'2026-03-12',type:'cleared',desc:'Hormuz Island mines neutralized',lat:26.9,lng:56.4,count:3},
  {d:'2026-03-12',type:'passage',desc:'Escorted convoys now routine — 9 transits',lat:26.15,lng:56.1,count:9},
  {d:'2026-03-12',type:'passage',desc:'Bab el-Mandeb — 14 crossings, Suez volume down 32%',lat:12.6,lng:43.3,count:14,region:'redsea'},
  {d:'2026-03-12',type:'patrol',desc:'Mine countermeasure ops continue 24/7',lat:26.0,lng:56.2,count:14},
  {d:'2026-03-12',type:'houthi',desc:'Major Houthi attack: 8 drones + 2 missiles at convoy',lat:13.5,lng:43.0,count:10,region:'redsea'},
  {d:'2026-03-12',type:'patrol',desc:'USS Bataan ARG provides Red Sea air defense',lat:14.5,lng:42.5,count:8,region:'redsea'},

  {d:'2026-03-13',type:'passage',desc:'11 tankers transit in three convoy windows',lat:26.2,lng:56.0,count:11},
  {d:'2026-03-13',type:'passage',desc:'Bab el-Mandeb — 17 crossings, Saudi crude tankers + container ships',lat:12.6,lng:43.3,count:17,region:'redsea'},
  {d:'2026-03-13',type:'patrol',desc:'No new mines detected — sweeps continue',lat:26.1,lng:55.8,count:12},
  {d:'2026-03-13',type:'houthi',desc:'Houthi fires at two vessels — both miss wide',lat:13.8,lng:43.1,count:2,region:'redsea'},

  {d:'2026-03-14',type:'passage',desc:'Steady convoy ops — 10 transits today',lat:26.18,lng:56.1,count:10},
  {d:'2026-03-14',type:'passage',desc:'Bab el-Mandeb — 16 crossings, below pre-war ~35/day normal',lat:12.6,lng:43.3,count:16,region:'redsea'},
  {d:'2026-03-14',type:'patrol',desc:'Coalition maintains 24/7 minesweeping posture',lat:26.0,lng:56.0,count:14},
  {d:'2026-03-14',type:'mine',desc:'2 drifting mines detected south of Qeshm',lat:26.6,lng:55.75,count:2},
  {d:'2026-03-14',type:'houthi',desc:'Houthi claims responsibility for tanker fire off Hodeidah',lat:14.6,lng:42.7,count:1,region:'redsea'},
  {d:'2026-03-14',type:'patrol',desc:'EUNAVFOR Aspides intercepts drone near Bab el-Mandeb',lat:12.8,lng:43.2,count:1,region:'redsea'},

  {d:'2026-03-15',type:'patrol',desc:'IRGC declares full control of Strait — "any transit will be targeted"',lat:26.5,lng:56.3,count:0},
  {d:'2026-03-15',type:'passage',desc:'Near-zero commercial transit; de facto blockade continues',lat:26.2,lng:56.0,count:0},
  {d:'2026-03-15',type:'passage',desc:'Bab el-Mandeb — minimal crossings amid expanded IRGC warnings',lat:12.6,lng:43.3,count:3,region:'redsea'},
  {d:'2026-03-15',type:'mine',desc:'Drifting mines reported south of Qeshm — sweeps ongoing',lat:26.55,lng:55.8,count:3},
  {d:'2026-03-15',type:'patrol',desc:'Trump calls for multinational naval coalition to secure strait',lat:25.5,lng:56.5,count:0},
  {d:'2026-03-15',type:'patrol',desc:'UK exploring options to help reopen Strait of Hormuz',lat:25.8,lng:56.8,count:0},

  // Mar 16
  {d:'2026-03-16',type:'passage',desc:'Pakistan-flagged tanker Karachi transits strait with AIS — first non-Iranian transit',lat:26.2,lng:56.0,count:1},
  {d:'2026-03-16',type:'passage',desc:'Bab el-Mandeb — minimal crossings; Houthis holding fire',lat:12.6,lng:43.3,count:3,region:'redsea'},
  {d:'2026-03-16',type:'patrol',desc:'Iran FM: Strait closed only to US, Israel and their allies',lat:26.5,lng:56.3,count:0},
  {d:'2026-03-16',type:'patrol',desc:'EU discusses expanding Operation Aspides to Persian Gulf',lat:25.5,lng:56.5,count:0},
  {d:'2026-03-16',type:'mine',desc:'Mine-sweeping operations continue south of Qeshm',lat:26.55,lng:55.8,count:1},
  {d:'2026-03-16',type:'patrol',desc:'CENTCOM: Kharg Island strike destroyed mine/missile bunkers',lat:25.3,lng:50.3,count:0},
  {d:'2026-03-16',type:'passage',desc:'India: 2 LPG tankers transit Hormuz after freeing seized Iranian ships',lat:26.3,lng:56.2,count:2},
  {d:'2026-03-16',type:'passage',desc:'Iran still exporting ~1M bpd from Kharg Island; 6 VLCCs with AIS off',lat:29.2,lng:50.3,count:3},

  {d:'2026-03-17',type:'patrol',desc:'Tanker struck by projectile 23nm east of Fujairah — first in 5 days',lat:25.2,lng:56.7,count:1},
  {d:'2026-03-17',type:'patrol',desc:'Fujairah Oil Industry Zone hit by drone — fire reported, no casualties',lat:25.15,lng:56.35,count:1},
  {d:'2026-03-17',type:'passage',desc:'Tankers "dribble" through Hormuz via Iran-controlled Larak-Qeshm gap — Pakistan, India, Turkey ships transit',lat:26.5,lng:56.3,count:5},
  {d:'2026-03-17',type:'passage',desc:'Bab el-Mandeb — minimal crossings; Houthis holding fire',lat:12.6,lng:43.3,count:2,region:'redsea'},
  {d:'2026-03-17',type:'patrol',desc:'Macron begins talks with India, Arab states on independent Hormuz escort',lat:25.5,lng:56.5,count:0},
  {d:'2026-03-17',type:'patrol',desc:'Trump: NATO allies refuse Hormuz role — "I\'m disappointed"',lat:26.5,lng:56.3,count:0},
  {d:'2026-03-17',type:'patrol',desc:'UAE signals willingness to join US-led Hormuz coalition — first Gulf state',lat:24.5,lng:54.6,count:0},
  {d:'2026-03-17',type:'patrol',desc:'Iraq formally requests Iran for oil tanker safe passage through Hormuz',lat:29.5,lng:48.0,count:0},
  {d:'2026-03-17',type:'patrol',desc:'USS Gerald Ford heading to Souda Bay, Crete for fire repairs — at least one week',lat:35.5,lng:24.1,count:0},

  // March 18
  {d:'2026-03-18',type:'mine',desc:'US drops GBU-72 5,000-lb bunker-buster bombs on Iranian anti-ship missile sites along Hormuz coast',lat:26.6,lng:56.2,count:3},
  {d:'2026-03-18',type:'patrol',desc:'IRGC threatens imminent strikes on Saudi, UAE, Qatar energy facilities',lat:25.5,lng:52.0,count:0},
  {d:'2026-03-18',type:'patrol',desc:'US-Israeli strikes hit South Pars gas field and Asaluyeh refineries — shared with Qatar',lat:27.5,lng:52.5,count:2},
  {d:'2026-03-18',type:'passage',desc:'~90 ships crossed Hormuz since war began — 16 oil tankers; mostly Iran-linked, some India/Pakistan/Turkey',lat:26.5,lng:56.3,count:4},
  {d:'2026-03-18',type:'passage',desc:'Bab el-Mandeb — minimal crossings continue; Houthis holding fire',lat:12.6,lng:43.3,count:2,region:'redsea'},
  {d:'2026-03-18',type:'patrol',desc:'Iraq resumes pipeline oil exports to Turkey\'s Ceyhan port after Baghdad-KRG deal',lat:36.7,lng:36.1,count:0},
  {d:'2026-03-18',type:'patrol',desc:'Iran projectile lands near UAE base hosting Australian troops',lat:24.2,lng:54.8,count:1},
  {d:'2026-03-18',type:'patrol',desc:'Renewed drone/rocket attacks on US Embassy Baghdad — rockets intercepted',lat:33.3,lng:44.4,count:2},
  {d:'2026-03-18',type:'mine',desc:'Iranian missiles cause extensive damage to Qatar\'s Ras Laffan LNG hub — world\'s largest',lat:25.9,lng:51.6,count:3},
  {d:'2026-03-18',type:'patrol',desc:'Saudi Arabia intercepts 4 ballistic missiles headed toward Riyadh; Aramco evacuates Samref',lat:24.7,lng:46.7,count:4},
  {d:'2026-03-18',type:'mine',desc:'Vessel struck by "unknown projectile" 11nm east of Khor Fakkan — fire onboard (UKMTO)',lat:25.35,lng:56.45,count:1},
  {d:'2026-03-18',type:'patrol',desc:'UAE: Habshan gas facilities and Bab oil field hit by interception debris — operations suspended',lat:23.8,lng:53.8,count:2},
  {d:'2026-03-18',type:'mine',desc:'Second Iranian missile strike on Ras Laffan — "sizeable fires and extensive further damage" (early Thu)',lat:25.95,lng:51.55,count:3},
  // Mar 19
  {d:'2026-03-19',type:'mine',desc:'Iranian missiles hit Kuwait Mina Al-Ahmadi and Mina Abdullah refineries — first strikes on Kuwait',lat:29.0,lng:48.15,count:3},
  {d:'2026-03-19',type:'mine',desc:'Follow-up strikes on UAE Habshan gas complex — ADNOC suspends all operations',lat:23.8,lng:53.8,count:2},
  {d:'2026-03-19',type:'mine',desc:'Iranian missiles hit Saudi Yanbu refinery complex on Red Sea coast',lat:24.1,lng:38.0,count:2},
  {d:'2026-03-19',type:'mine',desc:'Vessel struck near Ras Laffan LNG terminal — taking on water',lat:25.85,lng:51.55,count:1},
  {d:'2026-03-19',type:'mine',desc:'Vessel struck 15nm off Khor Fakkan — fire and damage',lat:25.35,lng:56.5,count:1},
  {d:'2026-03-19',type:'passage',desc:'Hormuz transits further reduced — 3 non-Iranian vessels detected, mostly Chinese-flagged',lat:26.5,lng:56.3,count:3},
  {d:'2026-03-19',type:'passage',desc:'Bab el-Mandeb — Houthi activity low; 2 crossings detected',lat:12.6,lng:43.3,count:2,region:'redsea'},
  {d:'2026-03-19',type:'patrol',desc:'UKMTO emergency advisory: all commercial shipping avoid central Gulf until further notice',lat:26.0,lng:53.0,count:0},
  {d:'2026-03-19',type:'mine',desc:'UKMTO: vessel hit by unknown projectile 4nm east of Ras Laffan — threat zone expanding to LNG terminals',lat:25.9,lng:51.6,count:1},
  {d:'2026-03-19',type:'patrol',desc:'UK/France/Germany/Italy/Netherlands/Japan: ready to contribute to Hormuz safe passage efforts',lat:26.5,lng:56.3,count:0},
  {d:'2026-03-19',type:'patrol',desc:'IDF confirms strikes on Iranian naval vessels at Caspian Sea military port',lat:37.5,lng:49.5,count:0},
  // Mar 20
  {d:'2026-03-20',type:'mine',desc:'IDF destroys 16+ IRGCN fast-attack boats at Bandar Lengeh — key Hormuz staging point ablaze',lat:26.53,lng:54.88,count:16},
  {d:'2026-03-20',type:'mine',desc:'Two drone waves hit Kuwait Mina Al-Ahmadi refinery again — fires reignited',lat:29.0,lng:48.15,count:4},
  {d:'2026-03-20',type:'mine',desc:'Dubai area air defense intercepts — explosions over Al Minhad',lat:25.03,lng:55.37,count:2},
  {d:'2026-03-20',type:'passage',desc:'Iran vetting system allows ~9 ships through Hormuz safe corridor — up from 3',lat:26.5,lng:56.3,count:9},
  {d:'2026-03-20',type:'passage',desc:'Bab el-Mandeb — 3 transits detected, Houthi activity minimal',lat:12.6,lng:43.3,count:3,region:'redsea'},
  {d:'2026-03-20',type:'patrol',desc:'Macron begins UNSC consultations on multilateral Hormuz navigation framework',lat:26.5,lng:56.3,count:0},
  {d:'2026-03-20',type:'patrol',desc:'Saudi intercepts 10 drones from east + 1 from north — debris hits Bahrain warehouse',lat:26.2,lng:50.5,count:11},
  {d:'2026-03-20',type:'mine',desc:'IDF strikes Bandar Anzali on Caspian Sea — IRIS Deylaman frigate and dozens of vessels destroyed',lat:37.47,lng:49.46,count:20},
  {d:'2026-03-20',type:'patrol',desc:'USS Boxer ARG with 11th MEU deploying from California; USS Tripoli arriving from Japan',lat:25.0,lng:58.0,count:0},
  {d:'2026-03-20',type:'mine',desc:'Hezbollah long-range missile hits Ashkelon area — 200km range marks new escalation',lat:31.67,lng:34.57,count:1},
  {d:'2026-03-21',type:'mine',desc:'Iran fires 2 IRBMs at Diego Garcia — 4,000km range shock; neither missile hits',lat:-7.3,lng:72.4,count:2},
  {d:'2026-03-21',type:'mine',desc:'IDF overnight strikes hit regime targets in Tehran and Hezbollah targets in Beirut',lat:35.7,lng:51.4,count:5},
  {d:'2026-03-21',type:'mine',desc:'Saudi intercepts 22+ drones targeting eastern oil infrastructure overnight',lat:26.2,lng:50.5,count:22},
  {d:'2026-03-21',type:'mine',desc:'Kuwait air defense engages incoming threats targeting Al-Ahmadi area',lat:29.0,lng:48.15,count:3},
  {d:'2026-03-21',type:'passage',desc:'Hormuz vetting expanded — ~10 ships through corridor, Japan offer widens access',lat:26.5,lng:56.3,count:10},
  {d:'2026-03-21',type:'passage',desc:'Bab el-Mandeb — 3 transits detected, Houthi activity minimal',lat:12.6,lng:43.3,count:3,region:'redsea'},
  {d:'2026-03-21',type:'patrol',desc:'UK approves US use of RAF Akrotiri and Indian Ocean bases for Hormuz operations',lat:34.6,lng:32.98,count:0},
  {d:'2026-03-21',type:'patrol',desc:'Coalition mine clearance continues — no major incidents reported',lat:26.5,lng:56.3,count:0},
  {d:'2026-03-22',type:'mine',desc:'Coalition strikes hit Natanz nuclear enrichment facility overnight — IAEA confirms no leaks',lat:33.7,lng:51.7,count:8},
  {d:'2026-03-22',type:'mine',desc:'Saudi intercepts 47+ drones — 38 in concentrated barrage targeting Ras Tanura terminal',lat:26.6,lng:50.2,count:47},
  {d:'2026-03-22',type:'mine',desc:'Drone strikes Iraqi intelligence HQ in Baghdad — 1 killed, 1 wounded',lat:33.3,lng:44.4,count:1},
  {d:'2026-03-22',type:'mine',desc:'Hezbollah-IDF 4-hour ground battle at Khiam — heaviest infantry engagement of conflict',lat:33.35,lng:35.55,count:0},
  {d:'2026-03-22',type:'passage',desc:'Hormuz — ~8 ships through vetting corridor; parliament debates transit fees',lat:26.5,lng:56.3,count:8},
  {d:'2026-03-22',type:'passage',desc:'Bab el-Mandeb — 4 transits, Houthi activity low',lat:12.6,lng:43.3,count:4,region:'redsea'},
  {d:'2026-03-22',type:'patrol',desc:'22-nation Hormuz safe passage statement signed — UAE first Arab Gulf state to join',lat:26.5,lng:56.3,count:0},
  {d:'2026-03-22',type:'patrol',desc:'Panama Canal at max capacity (36-38 vessels/day) from LNG rerouting',lat:9.1,lng:-79.7,count:0},
  // Mar 23
  {d:'2026-03-23',type:'mine',desc:'Saudi intercepts ~60 drones + 3 BMs toward Riyadh — expels Iranian diplomats persona non grata',lat:26.6,lng:50.2,count:60},
  {d:'2026-03-23',type:'mine',desc:'Iranian missiles hit Dimona and Arad — 160+ injured near Negev nuclear facility; IAEA confirms no damage',lat:30.6,lng:35.0,count:8},
  {d:'2026-03-23',type:'mine',desc:'IDF destroys bridges over Litani River — Lebanon president calls it "prelude to ground invasion"',lat:33.3,lng:35.3,count:0},
  {d:'2026-03-23',type:'mine',desc:'US bunker busters hit Natanz again (2nd strike in 48 hours) + coastal missile storage facility',lat:33.7,lng:51.7,count:5},
  {d:'2026-03-23',type:'mine',desc:'Iraq: Islamic Resistance claims 21 attacks on US bases; 3 drones intercepted near Erbil airport',lat:36.2,lng:44.0,count:3},
  {d:'2026-03-23',type:'mine',desc:'IDF kills IRGC Drone Commander BG Saeed Agha Jani — directed drone ops for Russia and proxies',lat:35.7,lng:51.4,count:0},
  {d:'2026-03-23',type:'passage',desc:'Hormuz — ~7 ships through vetting corridor; IRGC threatens "complete closure" if power plants hit',lat:26.5,lng:56.3,count:7},
  {d:'2026-03-23',type:'passage',desc:'Bab el-Mandeb — 3 transits; Houthis warn Bahrain/UAE they "will be first to lose"',lat:12.6,lng:43.3,count:3,region:'redsea'},
  {d:'2026-03-23',type:'patrol',desc:'2,500 additional Marines with amphibious capability dispatched — Kharg Island speculation',lat:29.2,lng:50.3,count:0},
  {d:'2026-03-23',type:'patrol',desc:'5 Gulf nations + UK/France/Germany condemn Iran\'s "de facto closure" of Hormuz',lat:26.5,lng:56.3,count:0},
  {d:'2026-03-23',type:'mine',desc:'IDF strikes IRGC main HQ compound in central Tehran + Hezbollah infrastructure in southern Beirut',lat:35.69,lng:51.39,count:0},
  {d:'2026-03-23',type:'mine',desc:'3 massive explosions in Beirut southern suburbs — Hezbollah infrastructure hit',lat:33.85,lng:35.49,count:0},
  {d:'2026-03-23',type:'patrol',desc:'UK deploying Rapid Sentry air defense to Bahrain, Kuwait, Saudi; HMS Dragon to eastern Med',lat:26.2,lng:50.6,count:0},
  {d:'2026-03-23',type:'patrol',desc:'USS Ford arrives Souda Bay, Crete for repairs after laundry fire',lat:35.49,lng:24.09,count:0},
  {d:'2026-03-23',type:'patrol',desc:'Pentagon weighing 82nd Airborne (3,000 paratroopers) — 2nd MEU departs California',lat:29.2,lng:50.3,count:0},
  {d:'2026-03-24',type:'passage',desc:'Two tankers bound for India transit Hormuz',lat:26.6,lng:56.3,count:2},
  {d:'2026-03-24',type:'patrol',desc:'HMS Dragon arrives eastern Mediterranean',lat:34.5,lng:33.0,count:0},
  {d:'2026-03-24',type:'mine',desc:'Kuwait intercepts Iranian missiles twice — 7 power lines knocked out',lat:29.3,lng:47.8,count:0},
  {d:'2026-03-24',type:'mine',desc:'Saudi intercepts 5 drones overnight; Bahrain sirens multiple times',lat:26.0,lng:50.5,count:0},
  {d:'2026-03-24',type:'passage',desc:'Two tankers transit Red Sea southbound under escort',lat:13.5,lng:42.8,count:2,region:'redsea'},
  {d:'2026-03-24',type:'passage',desc:'Iran tells UN/IMO: "non-hostile" ships may transit Hormuz with coordination — 6 vessels openly transit',lat:26.6,lng:56.3,count:6},
  {d:'2026-03-24',type:'mine',desc:'Iranian missiles hit Kurdish Peshmerga base near Erbil — 6 killed, 30 wounded',lat:36.2,lng:44.0,count:6},
  {d:'2026-03-24',type:'mine',desc:'Iranian missile kills Moroccan contractor in Bahrain, wounds 5 Emirati service members',lat:26.1,lng:50.5,count:1},
  {d:'2026-03-24',type:'mine',desc:'Projectile hits Bushehr Nuclear Power Plant premises — IAEA confirms no reactor damage',lat:28.83,lng:50.89,count:1},
  // Mar 25
  {d:'2026-03-25',type:'passage',desc:'5 vessels transit Hormuz via Tehran-approved route past Larak Island',lat:26.52,lng:56.35,count:5},
  {d:'2026-03-25',type:'passage',desc:'Red Sea escort convoy: 2 tankers northbound toward Suez under coalition guard',lat:14.8,lng:42.5,count:2,region:'redsea'},
  {d:'2026-03-25',type:'mine',desc:'US officials confirm ~dozen Maham 3/7 limpet mines laid by Iran in Strait of Hormuz',lat:26.55,lng:56.30,count:12},
  {d:'2026-03-25',type:'patrol',desc:'82nd Airborne deployment: 1,000 paratroopers preparing to deploy to Middle East',lat:29.0,lng:48.0,count:1},
  {d:'2026-03-25',type:'mine',desc:'Kuwait Airport fuel tank hit by drone — fire at site',lat:29.23,lng:47.97,count:1},
  {d:'2026-03-25',type:'patrol',desc:'IRGC charging $2M transit fees at Larak Island checkpoint',lat:26.86,lng:56.35,count:1},
  {d:'2026-03-25',type:'passage',desc:'Chinese state-owned feeder tanker pays $2M fee for Hormuz safe passage',lat:26.60,lng:56.40,count:1},
  // Mar 26
  {d:'2026-03-26',type:'passage',desc:'8 vessels transit Hormuz free of charge as Iran "show of sincerity"',lat:26.52,lng:56.35,count:8},
  {d:'2026-03-26',type:'passage',desc:'Red Sea escort convoy: 3 tankers southbound under coalition guard',lat:14.5,lng:42.3,count:3,region:'redsea'},
  {d:'2026-03-26',type:'patrol',desc:'IDF targeted strike kills IRGCN commander Tangsiri — Hormuz blockade architect',lat:27.1,lng:56.2,count:1},
  {d:'2026-03-26',type:'mine',desc:'Intense evening bombardment of Tehran — residential areas and command facilities hit',lat:35.69,lng:51.39,count:1},
  // Mar 27
  {d:'2026-03-27',type:'mine',desc:'Missile and drone attack on Prince Sultan Air Base — 12 US troops injured, KC-135s damaged',lat:24.06,lng:47.58,count:12},
  {d:'2026-03-27',type:'passage',desc:'Hormuz toll system formalized — $2M per vessel; 3 ships warned not to pass',lat:26.52,lng:56.35,count:4},
  {d:'2026-03-27',type:'passage',desc:'Red Sea escort convoy: 2 tankers northbound under coalition guard',lat:15.0,lng:42.5,count:2,region:'redsea'},
  {d:'2026-03-27',type:'mine',desc:'Houthi ballistic missile launched from Yemen toward Israel — intercepted',lat:15.3,lng:44.2,count:1,region:'redsea'},
  {d:'2026-03-27',type:'mine',desc:'Intercepted Iranian ballistic missile debris causes fires in Abu Dhabi',lat:24.45,lng:54.65,count:1},
  {d:'2026-03-27',type:'mine',desc:'Strikes on Isfahan and Ahvaz steel plants — civilian industrial targets',lat:32.65,lng:51.68,count:1},
  // Mar 28
  {d:'2026-03-28',type:'passage',desc:'Iran approves 20 Pakistani vessels for Hormuz — 2 per day via Larak route',lat:26.52,lng:56.35,count:8},
  {d:'2026-03-28',type:'patrol',desc:'IRGCN fast attack craft patrolling Larak-Qeshm gap as "toll collectors"',lat:26.6,lng:56.2,count:4},
  {d:'2026-03-28',type:'passage',desc:'Red Sea: 3 vessels escorted northbound under coalition guard',lat:15.0,lng:42.5,count:3,region:'redsea'},
  {d:'2026-03-28',type:'mine',desc:'USS Tripoli amphibious assault ship arrives in CENTCOM AOR',lat:25.0,lng:55.0,count:1},
  {d:'2026-03-28',type:'mine',desc:'Houthi second barrage toward Israel — ballistic missiles, drones intercepted',lat:15.3,lng:44.2,count:1,region:'redsea'},
  {d:'2026-03-28',type:'mine',desc:'Bahrain intercepts 6 more drones — 391 total drones since Feb 28',lat:26.07,lng:50.55,count:6},
  // Mar 29
  {d:'2026-03-29',type:'passage',desc:'20+ vessels cross Hormuz since Mar 28; 50+ containerships stranded west of strait',lat:26.52,lng:56.35,count:12},
  {d:'2026-03-29',type:'patrol',desc:'MARAD advisory: AIS used for targeting in Red Sea',lat:13.5,lng:43.0,count:1,region:'redsea'},
  {d:'2026-03-29',type:'mine',desc:'10 Kuwaiti military personnel injured in Iranian attack',lat:29.3,lng:47.9,count:10},
  {d:'2026-03-29',type:'mine',desc:'Kuwait desalination plant attacked — Indian worker killed',lat:29.2,lng:48.0,count:1},
  {d:'2026-03-29',type:'mine',desc:'COSCO ULCCs initially denied then completed Hormuz crossing',lat:26.5,lng:56.3,count:2},

  {d:'2026-03-30',type:'passage',desc:'8 vessels transit Hormuz — small increase but still under 10% of pre-war average; two Chinese-flagged tankers complete crossings',lat:26.52,lng:56.35,count:8},
  {d:'2026-03-30',type:'patrol',desc:'Hegseth says Hormuz "not blockaded" — CENTCOM data shows 48 vessels in 7 days vs 138/day historical average',lat:26.1,lng:56.0,count:3},
  {d:'2026-03-30',type:'passage',desc:'Red Sea escort convoy: 2 vessels northbound under EUNAVFOR Aspides guard',lat:15.0,lng:42.5,count:2,region:'redsea'},

  {d:'2026-03-31',type:'mine',desc:"Kuwaiti VLCC Al Salmi struck by Iranian drone at Port of Dubai — fire breaks out; first attack on UAE port facility",lat:25.27,lng:55.3,count:1},
  {d:'2026-03-31',type:'passage',desc:"8 vessels transit Hormuz — majority Iranian-linked; non-Iranian traffic remains under 10% of pre-war average",lat:26.52,lng:56.35,count:8},
  {d:'2026-03-31',type:'patrol',desc:"IRGCN fast attack craft enforce IRGC toll system; vessels required to submit cargo manifests for clearance",lat:26.6,lng:56.2,count:4},
  {d:'2026-03-31',type:'passage',desc:"Red Sea: 2 vessels northbound under EUNAVFOR Aspides escort",lat:15,lng:42.5,count:2,region:'redsea'},

  {d:'2026-04-01',type:'passage',desc:"7 vessels transit Hormuz — IRGC declares strait 'fully under our control'; 201 total crossings in March, down 95% from peacetime",lat:26.52,lng:56.35,count:7},
  {d:'2026-04-01',type:'patrol',desc:"IRGCN maintains toll-booth operations; cargo manifest verification required for non-Iranian vessels",lat:26.6,lng:56.2,count:5},
  {d:'2026-04-01',type:'houthi',desc:"Houthi missile and drone barrage toward Red Sea coalition vessels — 3rd large attack this week",lat:14.5,lng:42.5,count:3,region:'redsea'},
  {d:'2026-04-01',type:'passage',desc:"Red Sea: 1 vessel northbound under coalition escort — traffic remains near historic lows",lat:15,lng:42.5,count:1,region:'redsea'},
];

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
const KEY_PEOPLE = [
  {name:'Ali Khamenei',flag:'🇮🇷',faction:'axis',title:'Supreme Leader of Iran (deceased)',status:'killed',
   desc:'Killed in the Feb 28 initial strikes along with much of Iran\'s senior leadership. His death triggered the succession of his son Mojtaba and transformed the conflict from a nuclear standoff into an existential war for the Islamic Republic.'},
  {name:'Mojtaba Khamenei',flag:'🇮🇷',faction:'axis',title:'Supreme Leader of Iran (status unknown)',status:'unknown',
   desc:'Assumed power after his father\'s assassination. ISW assessed with moderate-to-high confidence that he has been incapacitated — no public appearance in three weeks, only written statements and recycled imagery. A senior Israeli official told Axios: "We have no evidence that he is really the one giving orders." IRGC command structure appears to be operating autonomously.'},
  {name:'Hossein Salami',flag:'🇮🇷',faction:'axis',title:'Commander-in-Chief, IRGC',status:'active',
   desc:'Directing Iran\'s retaliatory campaign — escalating from military targets to Gulf energy infrastructure. Ordered strikes on Ras Laffan, Yanbu, Habshan, and Kuwaiti refineries. Oversees Hormuz "vetting system" restricting shipping.'},
  {name:'Esmail Qaani',flag:'🇮🇷',faction:'axis',title:'Commander, IRGC Quds Force',status:'active',
   desc:'Coordinates Iran\'s proxy network across Iraq, Syria, Lebanon, and Yemen. Successor to Qasem Soleimani. Managing PMF operations in Iraq and Hezbollah coordination from Lebanon.'},
  {name:'Mohammad-Hossein Khatib',flag:'🇮🇷',faction:'axis',title:'Intelligence Minister (deceased)',status:'killed',
   desc:'Killed by Israeli precision airstrike on Mar 18. His death represents the systematic dismantling of Iran\'s intelligence apparatus. Fourth senior Iranian official eliminated since the conflict began.'},
  {name:'Esmail Ahmadi',flag:'🇮🇷',faction:'axis',title:'Basij Intelligence Chief (deceased)',status:'killed',
   desc:'Killed by Israeli Air Force precision strike on a command facility in Isfahan on Mar 22. Most senior Basij official killed since the conflict began. Believed to coordinate domestic surveillance and militia mobilization across Iran.'},
  {name:'Benjamin Netanyahu',flag:'🇮🇱',faction:'coalition',title:'Prime Minister of Israel',status:'active',
   desc:'Co-architect of the Feb 28 strikes. Expanded the Israeli strike envelope from nuclear sites to Caspian naval bases and the Nur facility. Agreed to pause energy infrastructure strikes under US pressure but continues assassinating Iranian military leaders.'},
  {name:'Israel Katz',flag:'🇮🇱',faction:'coalition',title:'Minister of Defense, Israel',status:'active',
   desc:'Overseeing IDF operations on two fronts — Iran and Lebanon. Greenlit reinforcement deployments to the northern border after Hezbollah escalated with 200km-range missiles. Managing the air campaign that has destroyed 85% of Iran\'s SAM systems.'},
  {name:'Donald Trump',flag:'🇺🇸',faction:'coalition',title:'President of the United States',status:'active',
   desc:'Authorized the Feb 28 joint strikes. Intervened to restrain Netanyahu from further energy infrastructure attacks. Balancing maximum pressure on Iran with preventing the conflict from collapsing global energy markets.'},
  {name:'Pete Hegseth',flag:'🇺🇸',faction:'coalition',title:'Secretary of Defense',status:'active',
   desc:'Directing US military operations from CENTCOM. Overseeing carrier strike groups in the Gulf, coalition escort operations through Hormuz, and the air campaign against Iranian military targets. Managing force protection across multiple theaters.'},
  {name:'Hassan Nasrallah',flag:'🇱🇧',faction:'axis',title:'Secretary-General, Hezbollah',status:'active',
   desc:'Opened the northern front with rocket barrages into Israel, deploying 200km-range missiles to strike Ashkelon. Over 1,000 killed in Israeli counter-strikes. Continuing to escalate despite devastating losses to Hezbollah\'s command structure — 20+ commanders killed.'},
  {name:'Abdul-Malik al-Houthi',flag:'🇾🇪',faction:'axis',title:'Leader, Ansar Allah (Houthis)',status:'active',
   desc:'Directing anti-shipping operations in the Red Sea and Bab el-Mandeb. Launching kamikaze drones and anti-ship missiles at commercial vessels, extending the conflict 2,000 km south. Currently holding fire as Iran shifts focus to Gulf energy targets.'},
  {name:'Mohammed bin Salman',flag:'🇸🇦',faction:'coalition',title:'Crown Prince of Saudi Arabia',status:'active',
   desc:'Declared trust with Iran "completely shattered" after Yanbu refinery struck. Reserves right to take direct military action. Hosting coalition logistics at Prince Sultan Air Base while coordinating GCC defensive response.'},
  {name:'Mohammed bin Zayed',flag:'🇦🇪',faction:'neutral',title:'President of the UAE',status:'active',
   desc:'Managing the UAE\'s exposure as its energy infrastructure — Habshan, Bab oil field — takes repeated hits. ADNOC has suspended all operations. Intercepted 327+ ballistic missiles and 1,700+ drones. Cooperating with Mossad on Iranian network arrests.'},
  {name:'Tamim bin Hamad Al Thani',flag:'🇶🇦',faction:'coalition',title:'Emir of Qatar',status:'active',
   desc:'Qatar\'s Ras Laffan LNG hub — world\'s largest — devastated by Iranian strikes. Expelled Iran\'s military attachés. Pivoted from attempted mediation to firm coalition alignment. Hosts CENTCOM forward HQ at Al Udeid.'},
  {name:'Haitham bin Tariq',flag:'🇴🇲',faction:'neutral',title:'Sultan of Oman',status:'active',
   desc:'Running backchannel ceasefire talks between Washington and Tehran — the only diplomatic channel still functioning. Oman\'s airspace is the sole reliable southern bypass for commercial aviation. Muscat serving as safe harbor for diverted vessels.'},
  {name:'Abdel Fattah el-Sisi',flag:'🇪🇬',faction:'neutral',title:'President of Egypt',status:'active',
   desc:'Keeping the Suez Canal open but transits have dropped from ~52/day to ~11/day. Increasing Egyptian Navy Red Sea patrols. Reopened Rafah crossing for humanitarian aid. Balancing US alliance with regional stability concerns.'},
  {name:'Recep Tayyip Erdoğan',flag:'🇹🇷',faction:'neutral',title:'President of Turkey',status:'active',
   desc:'NATO member refusing to pick a side. Closed airspace to belligerent military overflights while allowing civilian transit. Istanbul airports operating normally. Threading the needle between alliance obligations and regional relationships.'},
  {name:'Vladimir Putin',flag:'🇷🇺',faction:'neutral',title:'President of Russia',status:'active',
   desc:'Providing satellite imagery, drone technology, and intelligence to Iran. Airlifted medicine via Azerbaijan. Congratulated Mojtaba Khamenei and pledged solidarity. Economically benefiting from oil price spike. Not a combatant but clearly aligned with Tehran.'},
  {name:'Marco Rubio',flag:'🇺🇸',faction:'coalition',title:'Secretary of State',status:'active',
   desc:'Leading US diplomatic efforts. Warned publicly that Iran was pursuing ICBMs before the conflict began. Managing allied coordination and the diplomatic fallout from strikes on neutral Gulf states\' infrastructure.'},
  {name:'Emmanuel Macron',flag:'🇫🇷',faction:'coalition',title:'President of France',status:'active',
   desc:'Deployed FS Charles de Gaulle carrier to Gulf of Aden. Announced independent operation to open Hormuz. Now consulting UNSC members on a multilateral navigation framework. One French soldier killed in Iraq drone strike.'}
];
const MIL_BASES = [
  {name:'Al Udeid AB',lat:25.12,lng:51.31,side:'US/Qatar',desc:'CENTCOM forward HQ — Combined Air Ops Center'},
  {name:'Al Dhafra AB',lat:24.25,lng:54.55,side:'US/UAE',desc:'F-35 & tanker wing — air superiority ops'},
  {name:'Incirlik AB',lat:37.00,lng:35.43,side:'US/Turkey',desc:'NATO air base — B-1B deployments'},
  {name:'Camp Lemonnier',lat:11.55,lng:43.16,side:'US/Djibouti',desc:'AFRICOM — Red Sea & Bab el-Mandeb ops'},
  {name:'NSA Bahrain',lat:26.24,lng:50.61,side:'US/Bahrain',desc:'US 5th Fleet headquarters'},
  {name:'Prince Sultan AB',lat:24.06,lng:47.58,side:'US/Saudi',desc:'CAOC backup — Patriot battery site'},
  {name:'Muwaffaq Salti AB',lat:31.83,lng:36.78,side:'US/Jordan',desc:'F-16 ops — ISR & strike missions'},
  {name:'Nevatim AB',lat:31.21,lng:35.01,side:'Israel',desc:'IAF F-35I Adir — primary strike base'},
  {name:'Ramon AB',lat:30.78,lng:34.67,side:'Israel',desc:'IAF F-15I Ra\'am — long-range strike'},
  {name:'Tabriz AB',lat:38.13,lng:46.24,side:'Iran',desc:'IRIAF Su-35 / F-14 — air defense'},
  {name:'Isfahan AB',lat:32.75,lng:51.86,side:'Iran',desc:'IRGCAF drone operations hub'},
  {name:'Bandar Abbas AB',lat:27.22,lng:56.37,side:'Iran',desc:'IRGCN coastal defense — anti-ship missiles'},
  {name:'Al Asad AB',lat:33.79,lng:42.44,side:'US/Iraq',desc:'Marine rotary wing — force protection'}
];
const FLEET_POS = [
  {name:'CSG-3 (USS Abraham Lincoln)',lat:24.8,lng:58.5,side:'US',type:'carrier',desc:'Carrier Strike Group 3 — F/A-18E/F air superiority, Arabian Sea'},
  {name:'CSG-12 (USS Gerald R. Ford)',lat:22.5,lng:38.0,side:'US',type:'carrier',desc:'Carrier Strike Group 12 — Red Sea air & missile defense'},
  {name:'ESG-1 (USS Bataan ARG)',lat:25.5,lng:55.5,side:'US',type:'amphib',desc:'Amphibious Ready Group — MEU embarked, Persian Gulf'},
  {name:'HMS Queen Elizabeth CSG',lat:23.0,lng:60.5,side:'UK',type:'carrier',desc:'UK Carrier Strike Group — F-35B, Gulf of Oman'},
  {name:'FS Charles de Gaulle',lat:14.5,lng:44.5,side:'France',type:'carrier',desc:'French carrier — Rafale-M ops, Gulf of Aden'},
  {name:'CTF-153 (Red Sea Patrol)',lat:17.5,lng:40.5,side:'US',type:'taskforce',desc:'Combined Task Force 153 — Red Sea security'},
  {name:'CTF-150 (Arabian Sea)',lat:20.0,lng:62.0,side:'US',type:'taskforce',desc:'Combined Task Force 150 — counter-piracy & smuggling'},
  {name:'IRGCN Fast Boat Flotilla',lat:26.5,lng:55.0,side:'Iran',type:'flotilla',desc:'IRGCN fast attack craft — Strait of Hormuz patrol'},
  {name:'IRIN Submarine Group',lat:25.8,lng:57.5,side:'Iran',type:'submarine',desc:'IRIN Kilo-class & Fateh-class — Hormuz chokepoint'}
];
const NAVAL_FACILITIES = [
  {name:'Bandar Abbas Naval Base',lat:27.15,lng:56.30,side:'Iran',desc:'IRGCN HQ — fast boats, mines, anti-ship missiles'},
  {name:'Jask Naval Base',lat:25.60,lng:57.80,side:'Iran',desc:'IRIN forward operating base — submarine pens'},
  {name:'Chabahar Naval Base',lat:25.30,lng:60.60,side:'Iran',desc:'Indian-built deep-water port — IRIN surface fleet'},
  {name:'Abu Musa Island Base',lat:25.87,lng:55.03,side:'Iran',desc:'IRGCN forward garrison — disputed island'},
  {name:'NSA Bahrain (NAVCENT)',lat:26.24,lng:50.61,side:'US',desc:'US Naval Forces Central Command — 5th Fleet HQ'},
  {name:'Duqm Naval Base',lat:19.67,lng:57.72,side:'US/Oman',desc:'Joint logistics hub — dry dock, fuel storage'},
  {name:'Assab Naval Base',lat:13.07,lng:42.74,side:'UAE/Eritrea',desc:'UAE military facility — fast boats & patrol craft'},
  {name:'HMS Juffair',lat:26.22,lng:50.60,side:'UK',desc:'Royal Navy shore facility — mine countermeasures'},
  {name:'Djibouti (Camp Lemonnier)',lat:11.55,lng:43.16,side:'US',desc:'Combined Joint Task Force — Horn of Africa'},
  {name:'King Faisal Naval Base',lat:21.40,lng:39.25,side:'Saudi',desc:'RSNF Western Fleet HQ — Red Sea patrol'},
  {name:'Ras al-Khaimah Coast Guard',lat:25.79,lng:55.95,side:'UAE',desc:'UAE Coast Guard — Strait of Hormuz monitoring'}
];

const MAP_WATER_LABELS = [
  {name:'MEDITERRANEAN SEA',lat:34.0,lng:29.5,rotate:-0.15,size:8},
  {name:'PERSIAN GULF',lat:27.0,lng:51.5,rotate:1.0,size:7},
  {name:'RED SEA',lat:22.0,lng:37.5,rotate:1.3,size:7},
  {name:'ARABIAN SEA',lat:17.0,lng:61.0,rotate:0,size:9},
  {name:'CASPIAN SEA',lat:40.0,lng:51.0,rotate:-0.15,size:6},
  {name:'GULF OF ADEN',lat:12.5,lng:47.5,rotate:-0.05,size:6}
];
const CONFLICT_PHASES_NAMED = [
  {start:'2026-02-28', label:'Initial Strikes', desc:'Coalition strikes Iranian nuclear facilities; Khamenei killed',
   summary:'The United States and Israel launched coordinated strikes against Iran\'s nuclear program, air defenses, and military command structure. Supreme Leader Khamenei was killed in a bunker-buster strike within the first hours. Iran\'s air defense network was systematically dismantled, and CENTCOM declared air superiority over most of Iranian airspace by nightfall. The speed and scale of the opening salvo exceeded expectations, but Iran\'s retaliatory capacity remained largely intact.'},
  {start:'2026-03-01', label:'Regional Escalation', desc:'Iran retaliates with missiles; Hormuz mined; Hezbollah enters war',
   summary:'Iran launched mass missile and drone salvos at US bases across the Gulf and at Israel. IRGCN forces mined the Strait of Hormuz, effectively shutting down 20% of global oil transit overnight. Hezbollah broke its ceasefire with a barrage of rockets into northern Israel, opening a second front. Oil prices surged past $100/bbl. The conflict expanded from a targeted strike into a multi-front regional war within 72 hours.'},
  {start:'2026-03-06', label:'Strait Crisis', desc:'Hormuz contested; oil spikes; sustained exchange',
   summary:'The Strait of Hormuz became the conflict\'s center of gravity. Coalition minesweeping operations faced Iranian fast-boat harassment and shore-based missile threats. Two tankers struck mines. Oil spiked above $130/bbl as markets priced in a prolonged blockade. A sustained exchange of strikes continued across Iran, Lebanon, and the Gulf, with civilian casualties mounting on all sides. UAE airports briefly reopened for repatriation flights before closing again under renewed threat.'},
  {start:'2026-03-11', label:'Diplomatic Window', desc:'Ceasefire talks in Muscat; Hormuz partially cleared; new Iranian leadership',
   summary:'Oman brokered backchannel ceasefire talks in Muscat, producing a fragile 48-hour reduction in hostilities. Coalition forces partially cleared the Hormuz shipping channel, and the first escorted convoy transited the strait. Iran\'s Assembly of Experts named Mojtaba Khamenei as successor, consolidating a new command structure. The diplomatic window proved brief\u2014both sides used the pause to reposition forces, and hardliners on each side pushed to resume operations.'},
  {start:'2026-03-15', label:'Widening War', desc:'War spreads to Kuwait, Oman, UAE; energy infrastructure struck',
   summary:'The conflict shattered its earlier geographic boundaries. Iranian missiles struck Kuwait, Oman, and deep into the UAE. Dubai International Airport was hit, and Abu Dhabi\'s Habshan gas complex sustained damage. Israel assassinated Ali Larijani and intelligence chief Khatib in rapid succession, provoking Iran to strike Gulf energy infrastructure directly\u2014Ras Laffan LNG, Saudi refineries, Kuwait\'s Mina Al-Ahmadi, and South Pars became targets. Israel expanded the theater by striking Iranian naval vessels at a Caspian Sea port and launching overnight raids on Tehran and Beirut. On Mar 21, Iran fired two IRBMs at Diego Garcia\u20144,000 km away\u2014revealing a previously unknown missile range capability. Neither hit. Iraq declared force majeure on all foreign-operated oilfields, crashing Basra production from 3.3M to 900K bpd. Coalition strikes hit Natanz nuclear facility on Mar 22 and again on Mar 23. ISW assessed Mojtaba Khamenei likely incapacitated. On Mar 23, Trump postponed power plant strikes for 5 days, naming Kushner and Witkoff as negotiators. Brent crashed 11% below $100. On Mar 24, Iranian ballistic missiles hit 4+ sites across Tel Aviv. Israel resumed heavy strikes on Beirut. The US sent Iran a formal 15-point peace plan via Pakistan. A projectile hit the premises of Bushehr Nuclear Power Plant. Israel announced a "security zone" occupation of southern Lebanon to the Litani River. The death toll exceeded 2,000 across the region, including nearly 350 children. On Mar 25, Iran\'s military publicly mocked the US peace plan. IRGC launched attacks on US bases in Kuwait, Jordan, and Bahrain. Oil crashed ~6% to $94.42 on peace plan hopes. On Mar 26, Israel killed IRGCN commander Alireza Tangsiri\u2014architect of the Hormuz blockade. Trump extended the Hormuz deadline to April 6 "per Iranian Government request." Iran allowed 8 ships through as a "show of sincerity." Wall Street posted its worst day of the war. On Mar 27, IDF struck Arak Heavy Water Facility and Ardakan Yellowcake Plant\u2014escalating to nuclear fuel cycle infrastructure. 12 US troops injured at Prince Sultan Air Base. US assessed 1/3 of Iran\'s missile stockpile destroyed, 330 of 470 launchers hit. Houthis fired their first missile from Yemen toward Israel, extending the conflict 2,000+ km south. Iran formalized a $2M toll system for Hormuz passage and threatened retaliation against Gulf industries with US shareholders. Rubio said the war would end in "weeks not months." On Mar 28, the Washington Post reported the combined force had struck 4 key missile production facilities (Khojir, Shahroud, Parchin, Hakimiyeh) and 29 launch bases, with experts assessing "severe damage" had halted short- and medium-range missile production. SPND nuclear weapons research chief Ali Fuladvand was killed. Houthis conducted their second barrage toward Israel. Russia was revealed to be providing satellite imagery of coalition bases to Iran. A deepening rift emerged between President Pezeshkian and the IRGC over the war\'s economic costs. On Mar 29, Iranian missiles hit Beersheba chemical plant and Tel Aviv; Netanyahu expanded the Lebanon security zone with 1,200+ killed. US Rangers and SEALs arrived. Pakistan announced US-Iran peace talks "in coming days" while Trump simultaneously threatened infrastructure strikes if talks fail.'}
];

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
const MILESTONES = [
  {d:'2026-02-28', icon:'\u{1F4A5}', label:'Strikes begin', kw:['strike','strikes','CENTCOM','operation','nuclear'], cats:['military'], lat:32.4, lng:51.7},
  {d:'2026-02-28', icon:'\u{1F480}', label:'Khamenei killed', kw:['Khamenei','killed','supreme leader','slain'], cats:['military'], lat:35.7, lng:51.4},
  {d:'2026-03-01', icon:'\u{1F4A3}', label:'Hormuz mined', kw:['mine','mines','Hormuz'], cats:['maritime','military'], lat:26.5, lng:56.3},
  {d:'2026-03-02', icon:'\u{1F525}', label:'Hezbollah enters war', kw:['Hezbollah','ceasefire','rocket','Lebanon','Beirut'], cats:['military'], lat:33.9, lng:35.5},
  {d:'2026-03-03', icon:'\u{1F6A2}', label:'Tanker struck', kw:['tanker','mine','Hormuz','shipping','Pelagia','Libra'], cats:['maritime'], lat:26.4, lng:56.4},
  {d:'2026-03-04', icon:'\u{1F6A2}', label:'USS Charlotte sinks IRIS Dena', kw:['Dena','submarine','torpedo','Charlotte','sunk','warship','Indian Ocean','Sri Lanka'], cats:['maritime','military'], lat:6.0, lng:79.9},
  {d:'2026-03-05', icon:'\u{1F4A5}', label:'Nakhchivan airport hit', kw:['Azerbaijan','Nakhchivan','drone','airport','spillover','Caucasus'], cats:['aviation','military'], lat:39.2, lng:45.5},
  {d:'2026-03-06', icon:'\u2708', label:'UAE airports reopen', kw:['reopen','UAE','airport','repatriation'], cats:['aviation'], lat:25.25, lng:55.36},
  {d:'2026-03-07', icon:'\u{1F3F4}', label:'Houthis threaten Red Sea', kw:['Houthi','Red Sea','Yemen','solidarity','Ansar Allah'], cats:['maritime','military'], lat:15.3, lng:42.6},
  {d:'2026-03-08', icon:'\u{1F30D}', label:'UN emergency session', kw:['UN','emergency','international','session','General Assembly'], cats:['diplomatic','general']},
  {d:'2026-03-08', icon:'\u{1F451}', label:'Mojtaba named successor', kw:['Mojtaba','successor','supreme leader','Assembly of Experts'], cats:['military'], lat:35.7, lng:51.4},
  {d:'2026-03-09', icon:'\u{270A}', label:'Pro-Mojtaba rallies in Tehran', kw:['rally','Mojtaba','Tehran','support','solidarity','march'], cats:['general'], lat:35.7, lng:51.4},
  {d:'2026-03-10', icon:'\u{1F4A3}', label:'B-2 hits IRGC naval bases', kw:['B-2','Bandar Abbas','Bushehr','naval','stealth','bomber','IRGC'], cats:['military'], lat:27.2, lng:56.3},
  {d:'2026-03-11', icon:'\u2693', label:'Hormuz partial clearing', kw:['clear','Hormuz','mine','strait','IRIS Dena'], cats:['maritime','military'], lat:26.5, lng:56.3},
  {d:'2026-03-12', icon:'\u2708\uFE0F', label:'Beqaa Valley air campaign', kw:['Beqaa','Lebanon','Hezbollah','strike','IAF','campaign'], cats:['military'], lat:33.8, lng:36.0},
  {d:'2026-03-13', icon:'\u{1F6E9}\uFE0F', label:'KC-135 crash; 6 crew killed', kw:['KC-135','crash','Iraq','crew','refueling','tanker','killed'], cats:['military','aviation'], lat:33.0, lng:42.0},
  {d:'2026-03-14', icon:'\u{1F6E2}', label:'Convoy escorts begin', kw:['convoy','escort','Hormuz','cleared','ceasefire'], cats:['maritime','diplomatic'], lat:26.5, lng:56.3},
  {d:'2026-03-15', icon:'\u{1F525}', label:'Kuwait hit; Oman attacked', kw:['Kuwait','Oman','drone','missile','intercept','radar','al-Jaber'], cats:['military','aviation'], lat:28.9, lng:47.8},
  {d:'2026-03-16', icon:'\u{1F4A5}', label:'Dubai airport struck', kw:['Dubai','airport','fuel tank','Fujairah','Abu Dhabi'], cats:['aviation','military'], lat:25.25, lng:55.36},
  {d:'2026-03-17', icon:'\u{1F480}', label:'Larijani killed', kw:['Larijani','killed','security','Basij','Soleimani','de facto'], cats:['military'], lat:35.7, lng:51.4},
  {d:'2026-03-17', icon:'\u{1F6AA}', label:'Kent resigns over war', kw:['Kent','resign','counterterrorism','quit','NCTC'], cats:['diplomatic']},
  {d:'2026-03-18', icon:'\u{1F480}', label:'Intel chief Khatib killed', kw:['Khatib','intelligence','minister','killed','assassin'], cats:['military'], lat:35.7, lng:51.4},
  {d:'2026-03-18', icon:'\u{1F6E2}', label:'South Pars gas field struck', kw:['South Pars','Asaluyeh','gas','refinery','Qatar','energy'], cats:['military','stocks'], lat:27.5, lng:52.5},
  {d:'2026-03-18', icon:'\u{1F4A5}', label:'Ras Laffan LNG hub hit', kw:['Ras Laffan','LNG','Qatar','missile','energy','damage'], cats:['military','maritime','stocks'], lat:25.9, lng:51.6},
  {d:'2026-03-18', icon:'\u{1F6E2}', label:'Oil surges past $110', kw:['oil','$110','brent','surge','energy','infrastructure'], cats:['stocks']},
  {d:'2026-03-18', icon:'\u{1F56F}', label:'First West Bank fatalities', kw:['Beit Awwa','West Bank','Palestinian','killed','missile','women'], cats:['military','humanitarian'], lat:31.5, lng:34.9},
  {d:'2026-03-19', icon:'\u{1F525}', label:'Kuwait refineries struck', kw:['Kuwait','Mina Al-Ahmadi','Mina Abdullah','refinery','strike','fire'], cats:['military','stocks'], lat:29.0, lng:48.15},
  {d:'2026-03-19', icon:'\u{1F6E2}', label:'Brent spikes to $118', kw:['oil','$118','$111','brent','surge','Yanbu','energy','crude','settle'], cats:['stocks']},
  {d:'2026-03-19', icon:'\u{1F4B0}', label:'Pentagon seeks $200B', kw:['Pentagon','$200B','supplemental','budget','Congress','funding'], cats:['military','diplomatic']},
  {d:'2026-03-19', icon:'\u{1F6A2}', label:'Six nations pledge Hormuz action', kw:['Hormuz','UK','France','Germany','Italy','Japan','Netherlands','safe passage','joint statement','naval'], cats:['diplomatic','maritime']},
  {d:'2026-03-20', icon:'\u{1F525}', label:'Bandar Lengeh port destroyed', kw:['Bandar Lengeh','boats','fire','IRGCN','port','naval','Hormuz'], cats:['military','maritime'], lat:26.53, lng:54.88},
  {d:'2026-03-20', icon:'\u{1F1EE}\u{1F1F7}', label:'IRGC spokesman killed', kw:['IRGC','spokesman','killed','airstrike','missile production'], cats:['military']},
  {d:'2026-03-20', icon:'\u{1F1FA}\u{1F1F3}', label:'UNSC adopts Iran resolution', kw:['Security Council','resolution','Bahrain','condemn','Russia','veto','UNSC'], cats:['diplomatic']},
  {d:'2026-03-20', icon:'\u{2693}', label:'Bandar Anzali Caspian strike', kw:['Bandar Anzali','Caspian','frigate','Deylaman','vessels','Russia','supply line'], cats:['military','maritime'], lat:37.47, lng:49.46},
  {d:'2026-03-20', icon:'\u{1F6E1}', label:'85% of Iran SAMs destroyed', kw:['SAM','air defense','Shahroud','Khorgu','Borazjan','85%','missile'], cats:['military']},
  {d:'2026-03-20', icon:'\u{1F4B5}', label:'$23B arms sales bypasses Congress', kw:['$23B','weapons','arms','UAE','Kuwait','Jordan','Congress','emergency'], cats:['diplomatic','military']},
  {d:'2026-03-20', icon:'\u{1F6E2}', label:'US lifts sanctions on 140M bbl Iranian oil', kw:['sanctions','oil','140 million','barrels','Iranian','lift'], cats:['stocks','diplomatic']},
  {d:'2026-03-20', icon:'\u{1F3F3}', label:'Trump claims US has "won"', kw:['winding down','won','Trump','victory','considering'], cats:['diplomatic']},
  {d:'2026-03-21', icon:'\u{1F680}', label:'Iran fires IRBMs at Diego Garcia', kw:['Diego Garcia','IRBM','4,000km','range','Indian Ocean','missile'], cats:['military'], lat:-7.3, lng:72.4},
  {d:'2026-03-21', icon:'\u{1F6E2}', label:'Iraq declares force majeure on oil', kw:['Iraq','force majeure','Basra','oilfield','production','bpd'], cats:['stocks','military']},
  {d:'2026-03-21', icon:'\u{1F4A5}', label:'Israel strikes Tehran overnight', kw:['Tehran','overnight','regime','IDF','strike','Beirut'], cats:['military'], lat:35.7, lng:51.4},
  {d:'2026-03-22', icon:'\u{2622}', label:'Natanz nuclear facility struck', kw:['Natanz','nuclear','enrichment','IAEA','centrifuge','uranium'], cats:['military'], lat:33.7, lng:51.7},
  {d:'2026-03-22', icon:'\u{1F4AC}', label:'22 nations sign Hormuz passage statement', kw:['Hormuz','passage','statement','22','nations','UAE','safe'], cats:['diplomatic','maritime']},
  {d:'2026-03-22', icon:'\u{1F50D}', label:'ISW: Mojtaba Khamenei likely incapacitated', kw:['Mojtaba','Khamenei','incapacitated','Supreme Leader','missing','ISW'], cats:['military','diplomatic']},
  {d:'2026-03-23', icon:'\u{26A1}', label:'Trump 48-hour Hormuz ultimatum', kw:['Trump','48','ultimatum','Hormuz','power plants','obliterate','escalate'], cats:['diplomatic','military']},
  {d:'2026-03-23', icon:'\u{1F54A}', label:'Trump postpones strikes, claims Iran talks', kw:['Trump','postpone','delay','talks','Kushner','Witkoff','negotiations','5 days','15 points'], cats:['diplomatic']},
  {d:'2026-03-23', icon:'\u{1F4A5}', label:'Iranian missiles hit Dimona & Arad', kw:['Dimona','Arad','missiles','nuclear','160','injured','Negev'], cats:['military'], lat:31.07, lng:35.21},
  {d:'2026-03-23', icon:'\u{1F579}', label:'IRGC Drone Commander Agha Jani killed', kw:['Agha Jani','drone','IRGC','commander','killed','Russia','$10M'], cats:['military']},
  {d:'2026-03-23', icon:'\u{1F3E2}', label:'IDF strikes IRGC main HQ in Tehran', kw:['IRGC','headquarters','Tehran','heart','9000','strikes','140','naval'], cats:['military'], lat:35.69, lng:51.39},
  {d:'2026-03-23', icon:'\u{1F309}', label:'IDF destroys Litani River bridges', kw:['Litani','bridges','Lebanon','ground invasion','prelude','Aoun'], cats:['military'], lat:33.35, lng:35.25},
  {d:'2026-03-23', icon:'\u{1FA82}', label:'Pentagon weighs 82nd Airborne for Kharg', kw:['82nd','Airborne','Kharg','paratroopers','Pentagon','amphibious'], cats:['military'], lat:29.23, lng:50.33},
  {d:'2026-03-24', icon:'\u{1F680}', label:'Iranian missiles hit Tel Aviv', kw:['Tel Aviv','Iran','missiles','ballistic','impact','buildings','wounded'], cats:['military'], lat:32.07, lng:34.78},
  {d:'2026-03-24', icon:'\u{1F91D}', label:'Pakistan to host Iran-US direct talks', kw:['Pakistan','Islamabad','talks','Vance','Witkoff','Kushner','Iran','negotiations'], cats:['diplomatic'], lat:33.69, lng:73.04},
  {d:'2026-03-24', icon:'\u{1F4A5}', label:'Israel resumes Beirut strikes', kw:['Beirut','Hezbollah','suburbs','IDF','strikes','Lebanon','Bshamoun'], cats:['military'], lat:33.85, lng:35.47},
  {d:'2026-03-24', icon:'\u26FD', label:'Slovenia first EU state to ration fuel', kw:['Slovenia','fuel','rationing','EU','energy','crisis','Australia'], cats:['stocks','general']},
  {d:'2026-03-24', icon:'\u{1F4DC}', label:'US sends 15-point peace plan to Iran via Pakistan', kw:['peace','plan','15-point','Pakistan','Vance','Rubio','negotiations','deal'], cats:['diplomatic']},
  {d:'2026-03-24', icon:'\u2622\uFE0F', label:'Projectile hits Bushehr nuclear plant premises', kw:['Bushehr','nuclear','IAEA','Grossi','power plant','reactor'], cats:['military'], lat:28.83, lng:50.89},
  {d:'2026-03-24', icon:'\u{1F3D7}\uFE0F', label:'Israel announces Lebanon security zone to Litani', kw:['Litani','Lebanon','occupation','security zone','Katz','IDF'], cats:['military'], lat:33.35, lng:35.25},
  {d:'2026-03-25', icon:'\u{1F6A8}', label:'IRGC fires missiles at US bases across Gulf', kw:['IRGC','missiles','Kuwait','Jordan','Bahrain','bases','US','attacks'], cats:['military'], lat:29.38, lng:47.99},
  {d:'2026-03-25', icon:'\u{1F4C9}', label:'Brent crashes 6% to $94 on peace plan hopes', kw:['oil','Brent','crash','prices','markets','peace','ceasefire'], cats:['stocks']},
  {d:'2026-03-25', icon:'\u{1F1E8}\u{1F1F3}', label:'China urges Iran to initiate peace talks', kw:['China','Wang Yi','Araghchi','peace','talks','negotiations','Beijing'], cats:['diplomatic']},
  {d:'2026-03-25', icon:'\u2693', label:'Iran charging Hormuz transit fees — $2M per vessel', kw:['Hormuz','transit','fees','Larak','Iran','shipping','mines'], cats:['maritime']},
  {d:'2026-03-25', icon:'\u{1F4A3}', label:'Drones hit Kuwait Airport fuel tank', kw:['Kuwait','airport','drones','fuel','fire','attack'], cats:['military','aviation'], lat:29.23, lng:47.97},
  {d:'2026-03-25', icon:'\u{1F30D}', label:'WTO warns Hormuz closure threatens global food supply', kw:['WTO','fertilizer','food','Hormuz','crisis','supply'], cats:['general','maritime']},
  {d:'2026-03-26', icon:'\u{1F3AF}', label:'IDF kills IRGCN commander Tangsiri', kw:['Tangsiri','IRGCN','navy','commander','killed','Hormuz','blockade'], cats:['military'], lat:27.1, lng:56.2},
  {d:'2026-03-26', icon:'\u23F3', label:'Trump extends Hormuz deadline to April 6', kw:['Trump','Hormuz','deadline','extension','April','Iran','diplomacy'], cats:['diplomatic']},
  {d:'2026-03-26', icon:'\u{1F4C9}', label:'Wall Street posts largest single-day drop since war began', kw:['stocks','Wall Street','crash','S&P','market','decline'], cats:['stocks']},
  {d:'2026-03-27', icon:'\u2622\uFE0F', label:'IDF strikes Arak and Ardakan nuclear facilities', kw:['Arak','Ardakan','nuclear','heavy water','yellowcake','IAEA','strikes'], cats:['military'], lat:34.05, lng:49.25},
  {d:'2026-03-27', icon:'\u{1F1FE}\u{1F1EA}', label:'Houthis launch first missile from Yemen toward Israel', kw:['Houthi','Yemen','missile','Israel','intercepted','Ansar Allah'], cats:['military'], lat:15.3, lng:44.2},
  {d:'2026-03-27', icon:'\u{1F4A5}', label:'12 US troops injured at Prince Sultan Air Base', kw:['Prince Sultan','PSAB','US','troops','injured','Saudi','attack','KC-135'], cats:['military'], lat:24.06, lng:47.58},
  {d:'2026-03-28', icon:'\u{1F3ED}', label:'Combined force hits 4 missile production facilities, 29 launch bases', kw:['missile','production','Khojir','Shahroud','Parchin','Hakimiyeh','facilities','launch','bases','halted'], cats:['military'], lat:35.7, lng:51.5},
  {d:'2026-03-28', icon:'\u2622\uFE0F', label:'SPND nuclear weapons research chief Fuladvand killed', kw:['Fuladvand','SPND','nuclear','weapons','research','killed','Borujerd'], cats:['military'], lat:33.9, lng:48.8},
  {d:'2026-03-28', icon:'\u{1F1FE}\u{1F1EA}', label:'Houthis conduct second attack on Israel', kw:['Houthi','Yemen','second','attack','Israel','ballistic','drones'], cats:['military'], lat:15.3, lng:44.2},
  {d:'2026-03-29', icon:'\u{1F4A3}', label:'Iranian missiles hit Beersheba chemical plant — 11 wounded', kw:['Beersheba','chemical','ADAMA','Makhteshim','missiles','Israel','wounded'], cats:['military'], lat:31.25, lng:34.8},
  {d:'2026-03-29', icon:'\u{1F1F1}\u{1F1E7}', label:'Netanyahu expands Lebanon security zone; 1,200+ killed', kw:['Netanyahu','Lebanon','security zone','expansion','Litani','killed'], cats:['military'], lat:33.3, lng:35.4},
  {d:'2026-03-29', icon:'\u{1F91D}', label:'Pakistan announces US-Iran peace talks "in coming days"', kw:['Pakistan','peace','talks','negotiations','US','Iran','Islamabad'], cats:['diplomatic'], lat:33.7, lng:73.1},
  {d:'2026-03-31', icon:'🚢', label:"Kuwaiti VLCC struck at Port of Dubai — first attack on UAE port facility", kw:["Al Salmi","VLCC","Dubai","port","tanker","drone","Kuwait"], cats:["maritime"], lat:25.27, lng:55.3},
  {d:'2026-03-31', icon:'⏳', label:"Trump signals war could end in '2–3 weeks'; Iran doesn't need to make a deal", kw:["Trump","weeks","end","war","ceasefire","withdrawal"], cats:["diplomatic"], lat:38.9, lng:-77},
  {d:'2026-04-01', icon:'🕊️', label:"Trump claims Iran ceasefire request — Iran denies it; largest Iranian missile salvo of war", kw:["ceasefire","Trump","Pezeshkian","denied","false","salvo","largest"], cats:["diplomatic","military"], lat:32, lng:53},
];

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
      html += '<div class="w1-co w1c-' + key + (isSel ? ' w1-sel' : '') + '" data-action="select-co" data-co="' + co + '">';
      html += '<span class="w1-flag">' + flag + '</span>' + co + '</div>';
    });
    html += '</div></div>';
  }
  el.innerHTML = html;
}

// ===== FACTION DETAIL DATA =====
const FACTION_DETAIL = {
  'USA': {name:'United States',flag:'\u{1F1FA}\u{1F1F8}',role:'Lead',roleClass:'fm-role-lead',
    body:'<p>Initiated joint strikes on Iranian nuclear enrichment facilities at Fordow, Natanz, and Isfahan. Deployed carrier strike groups USS Eisenhower and USS Lincoln to the Gulf. Conducting mine countermeasure operations and escorting commercial shipping through the Strait of Hormuz.</p>' +
      '<div><span class="fm-stat fm-stat-blue">CENTCOM forward: Al Udeid, Qatar</span><span class="fm-stat fm-stat-blue">5th Fleet: NSA Bahrain</span><span class="fm-stat fm-stat-blue">2 carrier strike groups</span></div>' +
      '<div class="fm-casualties"><span class="fm-stat fm-stat-red">13 service members killed</span><span class="fm-stat fm-stat-yellow">~150 wounded</span></div>' +
      '<div class="fm-objectives"><strong>Objectives</strong>Deny Iran nuclear breakout capability. Maintain freedom of navigation in the Strait of Hormuz. Protect Gulf state partners from Iranian retaliation. Avoid ground commitment or regime change.</div>'},
  'Israel': {name:'Israel',flag:'\u{1F1EE}\u{1F1F1}',role:'Lead',roleClass:'fm-role-lead',
    body:'<p>Co-planned and executed precision strikes using F-35I Adir stealth fighters from Nevatim and Ramon air bases. Operating under sustained Iranian ballistic missile retaliation \u2014 Arrow and Iron Dome intercepting most inbound threats. Ben Gurion Airport restricted to military and repatriation flights.</p>' +
      '<div><span class="fm-stat fm-stat-blue">F-35I + F-15I Ra\u2019am strike wings</span><span class="fm-stat fm-stat-blue">Arrow-3 / Iron Dome active</span></div>' +
      '<div class="fm-casualties"><span class="fm-stat fm-stat-red">15 killed</span><span class="fm-stat fm-stat-yellow">3,138 injured</span></div>' +
      '<div class="fm-objectives"><strong>Objectives</strong>Eliminate Iran\u2019s nuclear weapons potential before it crosses the enrichment threshold. Degrade Hezbollah and Syrian proxy launch capability. Maintain deterrence posture against future threats.</div>'},
  'Saudi Arabia': {name:'Saudi Arabia',flag:'\u{1F1F8}\u{1F1E6}',role:'Silent partner',roleClass:'fm-role-partner',
    body:'<p>Officially neutral, but quietly permitting US overflights and hosting coalition logistics at Prince Sultan Air Base. Eastern Fleet guarding oil terminal approaches. Riyadh proposed as neutral negotiation venue \u2014 rejected by Tehran.</p>' +
      '<div><span class="fm-stat fm-stat-green">Overflight rights: granted</span><span class="fm-stat fm-stat-yellow">Dammam: restricted</span></div>' +
      '<div class="fm-casualties"><span class="fm-stat fm-stat-red">2 killed</span><span class="fm-stat fm-stat-yellow">12 injured</span></div>' +
      '<div class="fm-objectives"><strong>Interest</strong>Contain Iranian influence without direct military exposure. Protect oil infrastructure and shipping. Position itself as mediator if talks materialize.</div>'},
  'Bahrain': {name:'Bahrain',flag:'\u{1F1E7}\u{1F1ED}',role:'Host nation',roleClass:'fm-role-partner',
    body:'<p>Hosts US 5th Fleet headquarters and Naval Support Activity. Airport closed after missile debris found near approach paths. Managing coalition escort operations and shallow-water mine clearance.</p>' +
      '<div><span class="fm-stat fm-stat-red">Airport: closed</span><span class="fm-stat fm-stat-blue">5th Fleet HQ: active</span></div>' +
      '<div class="fm-casualties"><span class="fm-stat fm-stat-red">2 killed</span></div>'},
  'Qatar': {name:'Qatar',flag:'\u{1F1F6}\u{1F1E6}',role:'Host nation',roleClass:'fm-role-partner',
    body:'<p>Houses CENTCOM forward headquarters at Al Udeid Air Base \u2014 the nerve center for coalition air operations. Hamad International closed then limited to repatriation. Attempted to mediate between Washington and Tehran.</p>' +
      '<div><span class="fm-stat fm-stat-red">Airport: restricted</span><span class="fm-stat fm-stat-blue">Al Udeid CAOC: operational</span></div>' +
      '<div class="fm-casualties"><span class="fm-stat fm-stat-yellow">16 injured</span></div>'},
  'Iran': {name:'Iran',flag:'\u{1F1EE}\u{1F1F7}',role:'Primary',roleClass:'fm-role-primary',
    body:'<p>Nuclear facilities struck by coalition on Feb 28. Retaliating with ballistic missile barrages against Israeli and Gulf targets. IRGC Navy has mined the Strait of Hormuz and deployed anti-ship missile batteries at Bandar Abbas. Fast-attack craft harassing commercial shipping. All civilian airports closed.</p>' +
      '<div><span class="fm-stat fm-stat-red">Hormuz: mined</span><span class="fm-stat fm-stat-red">Ballistic missiles: launched</span><span class="fm-stat fm-stat-red">All airports: closed</span></div>' +
      '<div class="fm-casualties"><span class="fm-stat fm-stat-red">1,444+ killed</span><span class="fm-stat fm-stat-yellow">18,551 injured</span></div>' +
      '<div class="fm-objectives"><strong>Objectives</strong>Inflict maximum economic pain through Strait of Hormuz disruption. Demonstrate that strikes on Iranian soil carry unacceptable costs. Rally regional proxies. Force international pressure for ceasefire on favorable terms.</div>'},
  'Lebanon': {name:'Lebanon (Hezbollah)',flag:'\u{1F1F1}\u{1F1E7}',role:'Proxy',roleClass:'fm-role-proxy',
    body:'<p>Iran\u2019s most capable proxy force. Creating a secondary front threat on Israel\u2019s northern border. Rocket arsenals in southern Lebanon ready for activation. Beirut airport restricted as precaution. Lebanese government publicly distancing itself from Hezbollah actions, but unable to exercise control.</p>' +
      '<div><span class="fm-stat fm-stat-yellow">Beirut: restricted</span><span class="fm-stat fm-stat-red">Rocket threat: elevated</span></div>' +
      '<div class="fm-casualties"><span class="fm-stat fm-stat-red">826 killed</span><span class="fm-stat fm-stat-yellow">2,000+ injured</span></div>' +
      '<div class="fm-objectives"><strong>Objectives</strong>Pin down Israeli northern defenses. Demonstrate willingness to open second front as deterrent. Avoid full Israeli ground response that would devastate Lebanon\u2019s fragile infrastructure.</div>'},
  'Syria': {name:'Syria',flag:'\u{1F1F8}\u{1F1FE}',role:'Staging ground',roleClass:'fm-role-proxy',
    body:'<p>Iranian weapons convoys and missile depots targeted by Israeli and US strikes. Damascus airport closed since conflict onset. Serving as logistics corridor between Iran and Hezbollah. Assad government unable to prevent use of Syrian territory by either side.</p>' +
      '<div><span class="fm-stat fm-stat-red">Damascus airport: closed</span><span class="fm-stat fm-stat-red">Weapons depots: struck</span></div>' +
      '<div class="fm-objectives"><strong>Objectives</strong>Survive without being drawn into direct combat. Maintain Iranian alliance while avoiding further Israeli strikes on state infrastructure.</div>'},
  'Yemen': {name:'Yemen (Houthis)',flag:'\u{1F1FE}\u{1F1EA}',role:'Proxy',roleClass:'fm-role-proxy',
    body:'<p>Ansar Allah (Houthi) forces launching anti-ship missiles and kamikaze drones at Red Sea commercial shipping \u2014 extending the conflict theater 2,000 km south of the Strait of Hormuz. Targeting vessels regardless of flag state. Sana\u2019a airport non-functional from prior civil war.</p>' +
      '<div><span class="fm-stat fm-stat-red">Red Sea: active attacks</span><span class="fm-stat fm-stat-red">Drone + missile strikes</span></div>' +
      '<div class="fm-casualties"><span class="fm-stat fm-stat-red">16 ships struck</span></div>' +
      '<div class="fm-objectives"><strong>Objectives</strong>Disrupt global shipping chokepoint at Bab el-Mandeb. Demonstrate solidarity with Iran and raise own profile. Force coalition to divert naval resources south, thinning coverage at Hormuz.</div>'},
  'Iraq': {name:'Iraq (PMF Militias)',flag:'\u{1F1EE}\u{1F1F6}',role:'Irregular',roleClass:'fm-role-support',
    body:'<p>Iranian-backed Popular Mobilization Forces (PMF) operating alongside but distinct from the Iraqi state. Facilitating missile transit corridors through Iraqi airspace. Launching drone and rocket attacks on US bases at Al Asad. Iraqi government caught between its security partnership with the US and Iranian militia pressure.</p>' +
      '<div><span class="fm-stat fm-stat-yellow">Baghdad: disrupted</span><span class="fm-stat fm-stat-yellow">Erbil: disrupted</span></div>' +
      '<div class="fm-casualties"><span class="fm-stat fm-stat-red">27 killed</span></div>' +
      '<div class="fm-objectives"><strong>Objectives</strong>Pressure US to withdraw forces from Iraq. Support Iranian retaliation through Iraqi territory without provoking a direct US response against the Iraqi state.</div>'},
  'Oman': {name:'Oman \u2014 The Mediator',flag:'\u{1F1F4}\u{1F1F2}',role:'Neutral',roleClass:'fm-role-partner',
    body:'<p>Oman\u2019s Sultan Haitham is running back-channel talks between Washington and Tehran \u2014 the same role Oman played in the 2015 nuclear deal. Muscat\u2019s airspace remains the only reliable southern bypass corridor. The port is operating as a safe harbor for diverted commercial vessels. Oman\u2019s neutrality is strategic capital it has spent decades accumulating.</p>' +
      '<div class="fm-casualties"><span class="fm-stat fm-stat-red">3 killed</span><span class="fm-stat fm-stat-yellow">15 injured</span></div>'},
  'Egypt': {name:'Egypt \u2014 The Gatekeeper',flag:'\u{1F1EA}\u{1F1EC}',role:'Neutral',roleClass:'fm-role-partner',
    body:'<p>Controls the Suez Canal, through which 12% of global trade flows. Cairo is keeping the canal open and Egyptian Navy is increasing Red Sea patrols, but Egypt refuses to take sides. Its southern airspace bypass is now handling 3x normal commercial traffic as airlines avoid the Gulf.</p>'},
  'Turkey': {name:'Turkey \u2014 The Hedge',flag:'\u{1F1F9}\u{1F1F7}',role:'Neutral',roleClass:'fm-role-partner',
    body:'<p>NATO member refusing to pick a side. Istanbul airports operating normally. Ankara has closed airspace to belligerent military overflights while allowing civilian transit \u2014 threading the needle between alliance obligations and regional relationships. Watching for opportunities to expand influence in the post-conflict order.</p>'},
  'UAE': {name:'UAE \u2014 Exposed',flag:'\u{1F1E6}\u{1F1EA}',role:'Affected',roleClass:'fm-role-support',
    body:'<p>Sitting directly across the Gulf from Iran, within range of every weapon system Tehran possesses. Suspended civilian flights after falling debris incidents forced emergency ground stops. Ports of Fujairah and Jebel Ali \u2014 critical global transshipment hubs \u2014 operating under severe restrictions.</p>' +
      '<div class="fm-casualties"><span class="fm-stat fm-stat-red">6 killed</span><span class="fm-stat fm-stat-yellow">141 injured</span></div>'},
  'Kuwait': {name:'Kuwait \u2014 Locked Down',flag:'\u{1F1F0}\u{1F1FC}',role:'Affected',roleClass:'fm-role-support',
    body:'<p>Airport closed after intercepted Iranian drone wreckage found on the runway \u2014 not targeted, just caught in the crossfire. Hosting US military logistics while trying not to antagonize Iran. Mina al-Ahmadi oil terminal on high alert.</p>' +
      '<div class="fm-casualties"><span class="fm-stat fm-stat-red">6 killed</span></div>'},
  'Jordan': {name:'Jordan \u2014 Host Nation',flag:'\u{1F1EF}\u{1F1F4}',role:'Host nation',roleClass:'fm-role-partner',
    body:'<p>Hosting coalition F-16 operations from Muwaffaq Salti Air Base while managing humanitarian corridor access. Amman restricted after intercepted drone fragments found near approach paths. Strategic geography makes it the physical buffer between the conflict\u2019s western and eastern theaters, but Jordan\u2019s hosting of coalition strike assets places it firmly in the coalition camp.</p>' +
      '<div><span class="fm-stat fm-stat-blue">Muwaffaq Salti AB: F-16 ops</span><span class="fm-stat fm-stat-yellow">Amman: restricted</span></div>' +
      '<div class="fm-casualties"><span class="fm-stat fm-stat-yellow">28 injured</span></div>'},
  'Azerbaijan': {name:'Azerbaijan \u2014 Affected / Transit',flag:'\u{1F1E6}\u{1F1FF}',role:'Affected / Transit',roleClass:'fm-role-support',
    body:'<p>Nakhchivan exclave airport struck by Iranian drones on Mar 5 \u2014 the first spillover of the conflict into the Caucasus. Azerbaijan closed all southern airspace. Now serving as a key humanitarian transit corridor: Russia airlifted 13 tons of medicine through Azerbaijan for overland delivery to Iran. Baku is balancing its Turkey/NATO alignment against economic ties to Moscow and Tehran.</p>' +
      '<div><span class="fm-stat fm-stat-red">Nakhchivan airport: struck</span><span class="fm-stat fm-stat-yellow">Southern airspace: closed</span></div>' +
      '<div class="fm-objectives"><strong>Interest</strong>Avoid being drawn into the conflict. Maintain neutrality between its Turkish NATO alignment and its economic dependency on Russian energy transit. Keep the Baku\u2013Tbilisi\u2013Ceyhan pipeline operating.</div>'},
  'Russia': {name:'Russia \u2014 Iran Supporter',flag:'\u{1F1F7}\u{1F1FA}',role:'Iran supporter',roleClass:'fm-role-support',
    body:'<p>Not a direct combatant, but clearly aligned with Tehran. Per Wall Street Journal reporting, Moscow is sharing satellite imagery and improved drone technology with Iran to aid targeting of US forces. Russia airlifted 13+ tons of medicine to Iran via Azerbaijan. Putin congratulated Mojtaba Khamenei and pledged "full solidarity." Economically benefiting from oil price spike and Trump\u2019s lifting of Russian oil sanctions at sea.</p>' +
      '<div><span class="fm-stat fm-stat-yellow">Intel sharing: confirmed (WSJ)</span><span class="fm-stat fm-stat-yellow">Drone tech: transferred</span><span class="fm-stat fm-stat-green">Oil windfall: sanctions lifted</span></div>' +
      '<div class="fm-objectives"><strong>Interest</strong>Keep Iran in the fight to distract US attention and resources from Ukraine. Benefit from oil price spike. Prolong conflict that weakens US\u2013Gulf relationships. Expand influence in post-conflict Iran.</div>'},
  'UK': {name:'United Kingdom',flag:'\u{1F1EC}\u{1F1E7}',role:'Naval support',roleClass:'fm-role-partner',
    body:'<p>HMS Queen Elizabeth carrier strike group deployed to the Gulf of Oman with embarked F-35B Lightning II fighters. Royal Navy mine countermeasure vessels operating from HMS Juffair shore facility in Bahrain. Conducting joint escort operations with US 5th Fleet through the Strait of Hormuz. UK forces also present at RAF Akrotiri, Cyprus.</p>' +
      '<div><span class="fm-stat fm-stat-blue">HMS Queen Elizabeth CSG: Gulf of Oman</span><span class="fm-stat fm-stat-blue">HMS Juffair: mine countermeasures</span><span class="fm-stat fm-stat-blue">RAF Akrotiri: strike support</span></div>' +
      '<div class="fm-casualties"><span class="fm-stat fm-stat-red">1 killed (drone, Iraq)</span></div>' +
      '<div class="fm-objectives"><strong>Objectives</strong>Maintain freedom of navigation in the Strait of Hormuz. Support US-led coalition operations under existing Five Eyes framework. Protect British-flagged commercial shipping. Demonstrate post-Brexit strategic relevance in the Gulf.</div>'},
  'France': {name:'France',flag:'\u{1F1EB}\u{1F1F7}',role:'Naval support',roleClass:'fm-role-partner',
    body:'<p>FS Charles de Gaulle carrier operating Rafale-M strike fighters from the Gulf of Aden. Paris announced a "defensive" operation to open the Strait of Hormuz on Mar 10 \u2014 the only European power to declare an independent operational mandate. One soldier killed by drone at a Kurdish base in Iraq on Mar 12. Maintaining independent command but coordinating with US/UK naval forces.</p>' +
      '<div><span class="fm-stat fm-stat-blue">FS Charles de Gaulle: Gulf of Aden</span><span class="fm-stat fm-stat-blue">Rafale-M: strike ops</span><span class="fm-stat fm-stat-yellow">Independent command</span></div>' +
      '<div class="fm-casualties"><span class="fm-stat fm-stat-red">1 killed (drone, Iraq)</span></div>' +
      '<div class="fm-objectives"><strong>Objectives</strong>Demonstrate French strategic autonomy with independent Hormuz mandate. Protect French-flagged shipping and energy imports (France imports 17% of LNG from Qatar). Maintain influence in the Eastern Mediterranean and Gulf.</div>'},
  'Germany': {name:'Germany',flag:'\u{1F1E9}\u{1F1EA}',role:'Reluctant ally',roleClass:'fm-role-support',
    body:'<p>Berlin initially declared "this is not our war" and declined to send warships when Trump demanded NATO participation. Reversed course by Mar 19, joining a six-nation joint statement expressing readiness to help secure Strait of Hormuz passage. The EU\u2019s largest economy is bearing the brunt of energy price shocks \u2014 the ECB warned of "material impact" on European inflation. No military assets deployed to the theater.</p>' +
      '<div><span class="fm-stat fm-stat-yellow">No military assets deployed</span><span class="fm-stat fm-stat-yellow">ECB: material inflation risk</span></div>' +
      '<div class="fm-objectives"><strong>Interest</strong>Minimize economic fallout from energy disruption. Avoid direct military involvement while supporting diplomatic efforts to reopen Hormuz. Maintain European unity on conflict response.</div>'},
  'Italy': {name:'Italy',flag:'\u{1F1EE}\u{1F1F9}',role:'Reluctant ally',roleClass:'fm-role-support',
    body:'<p>Declined Trump\u2019s initial call for NATO warships alongside Germany and other European allies. Joined the six-nation joint statement on Mar 19 pledging readiness to help secure Hormuz. Co-signed EU statement demanding a moratorium on energy and water infrastructure strikes. Part of the five-nation group (France, Germany, UK, Italy, Spain) that called Israel\u2019s Bint Jbeil offensive a "red line."</p>' +
      '<div><span class="fm-stat fm-stat-yellow">No military assets deployed</span><span class="fm-stat fm-stat-yellow">EU infrastructure moratorium: co-signed</span></div>' +
      '<div class="fm-objectives"><strong>Interest</strong>Protect Mediterranean trade routes and energy imports. Support European diplomatic unity. Avoid being drawn into military operations beyond NATO treaty obligations.</div>'},
  'Japan': {name:'Japan',flag:'\u{1F1EF}\u{1F1F5}',role:'Economic stakeholder',roleClass:'fm-role-support',
    body:'<p>The world\u2019s fourth-largest oil importer, heavily dependent on Gulf energy. Container shipping rates from Asia to Europe doubled; factory shutdowns reported due to delayed raw materials. Iran offered to let Japanese-flagged vessels through Hormuz on Mar 21, expanding its selective vetting system. Joined the six-nation joint statement on Hormuz. Trump drew a "Pearl Harbor" comparison in a call with the PM, drawing criticism from historians. Bank of Japan held rates with hawkish tone.</p>' +
      '<div><span class="fm-stat fm-stat-yellow">Iran: Hormuz passage offered</span><span class="fm-stat fm-stat-red">Shipping rates: doubled</span><span class="fm-stat fm-stat-red">Factory shutdowns reported</span></div>' +
      '<div class="fm-objectives"><strong>Interest</strong>Secure energy imports through the Strait of Hormuz. Avoid antagonizing Iran while maintaining US alliance. Explore diplomatic channels for de-escalation. Manage economic fallout from supply chain disruption.</div>'},
  'India': {name:'India \u2014 Independent Transit',flag:'\u{1F1EE}\u{1F1F3}',role:'Independent transit',roleClass:'fm-role-support',
    body:'<p>The world\u2019s third-largest oil importer, sourcing 60% from the Gulf. New Delhi is charting its own path \u2014 refusing to join US-led escort operations while negotiating bilateral passage guarantees with Tehran. India released three seized Iranian oil tankers on Mar 16 in exchange for safe passage of two Indian LPG tankers through Hormuz. India\u2019s Quad partnership with the US complicates its neutrality, but Modi is prioritizing energy security over alliance signaling. Indian Navy deployed INS Vikrant carrier group to the Arabian Sea for "presence operations."</p>' +
      '<div><span class="fm-stat fm-stat-green">Iran: bilateral passage deal</span><span class="fm-stat fm-stat-blue">INS Vikrant CSG: Arabian Sea</span><span class="fm-stat fm-stat-yellow">60% oil from Gulf</span></div>' +
      '<div class="fm-objectives"><strong>Interest</strong>Secure uninterrupted energy imports from the Gulf. Maintain strategic autonomy between US and Iran. Protect 9 million Indian workers in Gulf states. Avoid being drawn into coalition operations that would jeopardize the Iran passage deal.</div>'},
  'Pakistan': {name:'Pakistan \u2014 Mediator',flag:'\u{1F1F5}\u{1F1F0}',role:'Mediator',roleClass:'fm-role-partner',
    body:'<p>Emerging as a potential mediator alongside Turkey and Egypt. Islamabad\u2019s unique position \u2014 a nuclear-armed Muslim-majority state with ties to both Iran and Saudi Arabia \u2014 gives it diplomatic leverage neither Washington nor Beijing can match. The Gwadar port (China\u2019s CPEC gateway) sits just east of the Strait of Hormuz and faces direct economic exposure from the blockade. Pakistan\u2019s ISI maintains intelligence channels with IRGC counterparts from the Afghan border era. Pakistani ships have transited Hormuz via negotiated safe passages.</p>' +
      '<div><span class="fm-stat fm-stat-blue">Mediator: ceasefire framework</span><span class="fm-stat fm-stat-yellow">Gwadar port: CPEC exposure</span><span class="fm-stat fm-stat-yellow">ISI\u2013IRGC channels: active</span></div>' +
      '<div class="fm-objectives"><strong>Interest</strong>Broker a ceasefire to stabilize energy prices and protect Gulf remittances ($31B/yr from Gulf workers). Prevent conflict spillover along the Iran\u2013Balochistan border. Demonstrate diplomatic relevance to counter Indian regional influence.</div>'}
};

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
    return '<span class="co-link ' + cls + '" data-action="select-co" data-co="' + name + '">' + name + '</span>';
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

const DAILY_HEADLINES = {
  '2026-02-25':{headline:'Rubio Says Iran Pursuing ICBMs; Ballistic Missiles a "Big Problem"',sub:'Iran hardening nuclear sites with concrete "sarcophagus"; VP Vance says evidence of nuclear weapons rebuild'},
  '2026-02-26':{headline:'Geneva Talks Show "Significant Progress" but Core Demands Rejected',sub:'US demands dismantling of Fordow/Natanz/Isfahan; Iran refuses; Fleet HQ in Bahrain evacuated; all US ships leave port'},
  '2026-02-27':{headline:'Iran Agrees to Degrade Stockpiles but Trump Warns "All Options" Open',sub:'USS Ford off Israel with 14 tankers at Ben Gurion; largest US force posture since 2003; markets brace for potential strike'},
  '2026-02-28':{headline:'Iran Shuts Airspace as Israel-US Strikes Begin',sub:'All Iranian airports closed; UAE, Qatar restrict operations as region braces for wider conflict'},
  '2026-03-01':{headline:'Strait of Hormuz Effectively Closed to Oil Tankers',sub:'Iran deploys mines and naval assets; Brent crude surges past $85 as 20% of global oil supply is threatened'},
  '2026-03-02':{headline:'Coalition Expands Air Campaign Across Western Iran',sub:'US and Israeli forces strike IRGC facilities; Hezbollah launches rockets into northern Israel'},
  '2026-03-03':{headline:'First Houthi Attack on Commercial Shipping Since Escalation',sub:'Missile targets container vessel in Red Sea; coalition warships deploy to Bab el-Mandeb strait'},
  '2026-03-04':{headline:'Iranian Missile Barrage Hits Saudi Oil Infrastructure',sub:'Aramco facilities at Ras Tanura damaged; oil prices spike above $90 as Gulf states raise alert levels'},
  '2026-03-05':{headline:'Global Markets Reel as Oil Tops $95 Per Barrel',sub:'S&P 500 drops 3.2%; airlines announce fuel surcharges as economic ripple effects accelerate'},
  '2026-03-06':{headline:'Humanitarian Corridor Proposed as Civilian Toll Mounts',sub:'UN calls for ceasefire; Red Cross struggles to access affected areas in western Iran and Lebanon'},
  '2026-03-07':{headline:'Iran Fires Ballistic Missiles at US Bases in Gulf',sub:'Al Udeid and Al Dhafra bases targeted; US Patriot and THAAD systems intercept majority of incoming'},
  '2026-03-08':{headline:'Diplomatic Efforts Intensify as Conflict Enters Second Week',sub:'Turkey and Oman offer mediation channels; China calls for immediate cessation of hostilities'},
  '2026-03-09':{headline:'US Navy Begins Escort Operations in Strait of Hormuz',sub:'Carrier strike group leads first convoy attempt; Iran warns of consequences for any breach of its waters'},
  '2026-03-10':{headline:'GPS Jamming Disrupts Commercial Aviation Across Gulf',sub:'Multiple airlines divert flights; EASA expands no-fly advisories as electronic warfare intensifies'},
  '2026-03-11':{headline:'Israel Strikes Hezbollah Command Centers in Beirut',sub:'Dahiyeh suburbs hit again; Lebanon death toll passes 500 as southern front expands'},
  '2026-03-12':{headline:'US KC-135 Tanker Crashes Over Western Iraq',sub:'Six service members killed; Pentagon says not hostile fire but Iranian proxy group claims responsibility'},
  '2026-03-13':{headline:'Oil Breaks $100 as Strait Remains Closed to Tankers',sub:'Largest oil supply disruption in history; gas prices up 24% since conflict began'},
  '2026-03-14':{headline:'New Supreme Leader Appointed After Khamenei Killed',sub:'Mojtaba Khamenei takes power; IRGC vows to pursue Netanyahu as Iran digs in for extended conflict'},
  '2026-03-15':{headline:'Iran Rejects Ceasefire as Israel Launches Fresh Wave of Strikes',sub:'Foreign minister says "we never asked for a ceasefire"; oil tops $105; Pope Leo calls for peace'},
  '2026-03-16':{headline:'ADNOC Suspends Operations After Drone Strike; Tehran Power Grid Hit',sub:'Shah gas field attacked; 200+ US troops wounded across 7 countries; Lebanon displacement tops 1 million; G5 warns against Israeli ground offensive'},
  '2026-03-17':{headline:'Israel Kills Ali Larijani; IRGC Confirms Basij Chief Dead; Trump Threatens NATO Exit',sub:'Russia aiding Iran with satellite imagery; USS Ford heads to Crete; tankers "dribble" through Hormuz on Iran-controlled route; 200+ Ukrainian drone experts deployed to Gulf; global airlines warn of $400M+ fuel costs'},
  '2026-03-18':{headline:'Energy War Erupts: South Pars, Ras Laffan, Saudi Refineries All Hit; Oil Surges Past $110',sub:'Israel kills intel chief Khatib; Iran retaliates on Qatar and Saudi energy infrastructure; Qatar expels Iranian attachés; Trump threatens to destroy South Pars; 3 killed in West Bank; 12 Arab FMs demand Iran halt; Saudi reserves right to military action; Khor Fakkan vessel struck; Asian markets plunge'},
  '2026-03-19':{headline:'Gulf Energy War Deepens: Brent Spikes to $118; Gold Crashes 5%; Six Nations Pledge Hormuz Action',sub:'IDF strikes South Pars again and Iranian naval vessels at Caspian Sea port; Iran retaliates on Kuwait refineries, UAE Habshan, Saudi Yanbu; Gabbard says US-Israel war aims differ; Treasury floats unsanctioning Iranian oil; Lebanon deaths top 1,000; ECB warns of material inflation impact; 13 US troops KIA; Fed holds rates hawkish; WTO cuts trade forecast; Jones Act waived; Iran FM warns Hormuz helpers risk "complicity"'},
  '2026-03-20':{headline:'Trump Claims Victory as Brent Hits $112; US Lifts Sanctions on 140M Barrels of Iranian Oil',sub:'Trump says US "considering winding down" but deploys 2,500 more Marines; Iran dismisses as "psychological operations"; US lifts sanctions on 140M barrels of Iranian oil afloat to ease prices; IRGC spokesman Ali Mohammad Naini killed in Israeli Tehran strike; Nowruz and Eid marked under bombardment; Bahrain joins multinational Hormuz effort; UK offers bases for Hormuz strikes; Iran threatens heavy strikes on UAE Ras al-Khaimah; US Embassy Baghdad hit three times; Kuwait Mina Al-Ahmadi refinery attacked; Hezbollah missile fragment hits Jerusalem Old City; $23B wartime emergency weapons sales; Dow -447; gold $4,489; S&P 4th weekly loss; Russell 2000 enters correction'},
  '2026-03-21':{headline:'Iran Fires 2 IRBMs at Diego Garcia in 4,000km Range Shock; Israel Strikes Tehran and Beirut Overnight',sub:'Iran reveals previously unknown IRBM capability — neither missile hits Diego Garcia; Israel launches overnight strikes on "regime targets" in Tehran and Hezbollah targets in Beirut; Iraq declares force majeure on all foreign-operated oilfields — Basra output drops from 3.3M to 900K bpd; Saudi Arabia intercepts 22+ drones overnight; Iran offers to let Japanese ships through Hormuz; IEA urges work-from-home and reduced highway speeds; United Airlines cancels 5% of flights; F-35 emergency landing after Iranian fire; Trump says "no ceasefire" and calls NATO "cowards"; UK approves US use of bases for defensive operations; Gen Shekarchi threatens global tourist sites; gold $4,489 (markets closed); Brent $112.19 (Saturday carry-forward)'},
  '2026-03-22':{headline:'Coalition Strikes Natanz Nuclear Facility; ISW Says Mojtaba Khamenei Likely Incapacitated',sub:'First strike on Iranian nuclear infrastructure — IAEA confirms no radioactive leaks; CENTCOM says 8,000+ targets hit and 130 Iranian vessels destroyed; 22 nations sign Hormuz safe passage statement — UAE first Arab Gulf state to join; Katz vows strikes will "escalate significantly" next week; IDF kills Basij Intelligence Chief Esmail Ahmadi; Saudi intercepts 47+ drones including 38 in concentrated barrage; Hezbollah 4-hour ground clash with IDF at Khiam; Lebanon death toll surpasses 1,000; Iran parliament debates Hormuz transit fees; Axios reports Washington considering Kharg Island blockade; markets closed — Sunday carry-forward'},
  '2026-03-23':{headline:'Trump Postpones Power Plant Strikes, Claims Talks With Iran; IDF Hits IRGC HQ in Tehran',sub:'Trump delays strikes 5 days, names Kushner and Witkoff as negotiators — claims 15 points of agreement; Iran denies all negotiations — Ghalibaf calls it "fake news to manipulate markets"; Witkoff-Araghchi phone call confirmed as "preliminary de-escalation"; IDF strikes IRGC main headquarters in central Tehran; CENTCOM: 9,000+ targets struck, 140+ naval vessels destroyed; Iranian missiles hit Dimona and Arad — 160+ injured; IDF kills IRGC Drone Commander Agha Jani; IDF strikes Hezbollah in Beirut — 3 massive explosions; Pentagon weighing 82nd Airborne (3,000 troops) for possible Kharg Island; Brent crashes 11% below $100 on delay announcement — Dow surges 1,000+ points; Pakistan offers to host talks; Egypt\'s Sissi tours Gulf for ceasefire; ICRC warns "point of no return" on civilian infrastructure; Iran death toll 1,500+, 80,000+ buildings damaged; UK deploying Rapid Sentry air defense to Gulf'},
  '2026-03-24':{headline:'US Sends Iran 15-Point Peace Plan via Pakistan; Missiles Hit Tel Aviv, Erbil, Bahrain; Bushehr Plant Struck',sub:'US sends Iran 15-point peace plan delivered via Pakistan — addresses missiles and nuclear program; Trump says Vance and Rubio leading negotiations; Iran prefers Vance over Witkoff/Kushner as interlocutor; Iranian ballistic missiles strike 4+ sites across Tel Aviv — 6 wounded; 6 Kurdish Peshmerga killed and 30 wounded by Iranian missiles near Erbil; Iranian missile kills Moroccan contractor in Bahrain, wounds 5 Emiratis; projectile hits Bushehr Nuclear Power Plant premises — IAEA says no reactor damage; Israel announces "security zone" occupation of southern Lebanon to Litani River; Israel raises reserve mobilization cap to 400,000; MBS pushing Trump to continue war — wants Iran missile capabilities degraded; IDF resumes heavy strikes on Beirut southern suburbs — "only just begun"; Bshamoun strike kills 2; 1,000 82nd Airborne soldiers deploying; 290 US troops wounded total; Iran appoints Zolqadr to replace killed Larijani; Iran tells UN/IMO: "non-hostile" ships may transit Hormuz with coordination — 6 vessels openly transit; Iraq orders response to PMF strikes; Philippines declares national energy emergency; Saudi dispatched 94,000+ trucks via Logistics Routes Initiative; Jeddah port expects 50% surge; nearly 350 children among 2,000+ killed; Brent at $103.94; Slovenia rationing fuel; India PM Modi calls for Hormuz reopening'},
  '2026-03-25':{headline:'Iran Mocks US Peace Plan; Missiles Hit Gulf Bases, Kuwait Airport; Oil Crashes 6% on Ceasefire Hopes',sub:'Iran military dismisses 15-point plan: "never come to terms with someone like you"; IRGC fires missiles at Israel and US bases in Kuwait, Jordan, Bahrain; drones hit Kuwait Airport fuel tank; 12 killed and 28 wounded in south Tehran strike; 9 wounded including 6 children in central Israel; IDF announces 600+ strikes on Iranian missile sites — IRGC units showing low morale and absenteeism; combined force strikes Esfahan Optics Industries and Malek Ashtar University; satellite imagery shows extensive damage to Nazeat Islands naval infrastructure; Brent crashes ~6% to $94.42 on peace plan hopes — lowest since early March; Asian markets surge: Nikkei +2.8%, Kospi +3.1%; China Wang Yi urges Iran to initiate peace talks; Kim Jong Un says war justifies North Korean nukes; 1,000 82nd Airborne deploying; Iran charging Hormuz transit fees — Chinese tanker paid $2M; dozen Maham limpet mines confirmed; WTO warns fertilizer disruption threatens global food supply; Philippines declares energy emergency and seeks US waivers for sanctioned oil; Israel kills 9 in Lebanon (Adloun, Sidon, Habboush); Lebanon faces existential crisis over Litani occupation; Cyprus seeks new UK base security deal; GOP rejects war powers resolution 47-53; 290 US troops wounded, 13 KIA; 1,500+ Iranians killed'},
  '2026-03-26':{headline:'IDF Kills Iran Navy Chief Tangsiri; Trump Extends Hormuz Deadline to April 6; Wall Street Posts Worst Day of War',sub:'Israel kills IRGCN commander Alireza Tangsiri — architect of Hormuz blockade; Trump extends reopening deadline "per Iranian Government request"; intense evening bombardment of Tehran; Israel deploys 3rd division in Lebanon ground offensive; Hezbollah claims record 94 operations in one day; 8 ships transit Hormuz free as "show of sincerity"; Pakistan confirms it relayed US 15-point peace plan to Iran; Rubio says "some concrete progress" toward agreement; Wall Street suffers largest daily decline since war started — S&P down 3.2%, Nasdaq -4.1%; Brent rebounds to $105.85; Lebanon: 1,110 killed, 1M+ displaced; Israeli soldier killed in south Lebanon; European airlines extend Gulf suspensions through April'},
  '2026-03-27':{headline:'IDF Strikes Arak Nuclear Facility; 12 US Troops Hurt at Saudi Base; Houthis Fire First Missile at Israel',sub:'Israel strikes Arak Heavy Water Facility and Ardakan Yellowcake Plant — nuclear infrastructure targeted; 12 US troops injured at Prince Sultan Air Base, KC-135 tankers damaged; CENTCOM strikes bulldozers clearing tunnel entrances to underground missile facilities; Iran missile fire down 90% — 1/3 of stockpile destroyed, 330 of 470 launchers hit; Rubio says war will end in "weeks not months"; Houthis threaten "direct military intervention" — first ballistic missile from Yemen toward Israel intercepted; Iran formalizes $2M toll system for Hormuz passage; strikes hit Isfahan and Ahvaz steel plants — civilian industrial targets; Iran threatens retaliation against Gulf industries with US shareholders; Abu Dhabi fires from intercepted missile debris; IAEA warns of "major radiological incident" risk; Ukraine-Saudi defense cooperation agreement; Brent rises to $107.81; gold steady at $4,430'},
  '2026-03-28':{headline:'Combined Force Halts Iran Missile Production; SPND Nuclear Chief Killed; Houthis Strike Israel Again',sub:'WaPo: combined force struck 4 key missile production facilities and 29 launch bases — "severe damage" halts short/medium-range production; strikes hit Parchin, MIO Tehran, SADRA Bushehr, Yazd Missile Base (6th time); SPND nuclear weapons research chief Ali Fuladvand killed in Borujerd; Houthis conduct second barrage toward Israel — ballistic missiles and drones intercepted; USS Tripoli arrives — 50,000+ US troops in region; Russia providing satellite imagery to Iran of coalition bases; Pezeshkian warns economy collapses in 3-4 weeks — rift with IRGC deepens; Iran launches "Janfada" recruitment campaign; Iran approves 20 Pakistani vessels for Hormuz; Ukraine-Qatar 10-year defense agreement; HRANA: 3,461 killed in Iran including 1,551 civilians and 236 children; residential building struck in Tehran; Brent ~$109.50; gold rises to $4,506'},
  '2026-03-29':{headline:'Iranian Missiles Hit Beersheba Chemical Plant; Trump Threatens Infrastructure Strikes; Peace Talks Imminent',sub:'Seven Iranian missile barrages hit Israel — 11 wounded in Beersheba; ADAMA Makhteshim chemical plant struck, 800m exclusion zone; explosion on Tel Aviv highway; Netanyahu orders expansion of Lebanon security zone — 1,200+ killed; Israeli-American soldier killed in Lebanon — 5th IDF death; US special operations forces (Rangers, SEALs) arrive; IDF says "days away" from completing priority targets; IDF strikes missile and drone production sites in Tehran; 5 killed in TV station and port strikes in Tehran; Kuwait desalination plant attacked — Indian worker killed; 10 Kuwaiti soldiers injured; power outages in Tehran and Karaj from Parchin strikes; 3 Lebanese journalists killed; UN peacekeeper killed; Pakistan announces US-Iran talks "in coming days"; Trump threatens infrastructure strikes if talks fail; MARAD warns AIS used for targeting; 50+ ships stranded west of Hormuz; Brent ~$111; gold rebounds to $4,541 — worst monthly decline since 2008'},
  '2026-03-30':{headline:'Trump Threatens to Destroy Iran Power Grid and Kharg Island; Tehran Blackout After Overnight Strikes; Merchant Traffic Slowly Returning to Hormuz',sub:'Overnight US-Israel strikes knocked out power across Tehran — blackout later restored; Trump posts Truth Social ultimatum threatening to destroy all Iranian power plants, oil wells, Kharg Island and desalination plants if no deal; Rubio tells Al Jazeera Trump "prefers diplomacy"; Turkey/NATO intercept 4th missile directed at Turkish territory; Indian worker killed in attack on Gulf desalination plant; Hegseth says Hormuz not blockaded — Lloyd\'s List data shows only 48 vessels in 7 days vs 138/day historical average; two Chinese-flagged vessels complete transits; gold stages relief rally to $4,567 — bargain hunters step in after worst monthly decline in decades; Brent $111.10; total war dead: 1,937 in Iran, 24 in Israel, 13 US soldiers, 27 in Gulf states'},
  '2026-03-31':{headline:"Kuwaiti VLCC Struck by Iranian Drone at Dubai Port; Trump Says War Could End in '2–3 Weeks'; Iran Fires 87th Regional Attack Wave",sub:"Kuwaiti VLCC Al Salmi hit by Iranian drone while anchored at Port of Dubai — fire breaks out, first direct attack on UAE commercial port; Trump says US could end Iran war in 'two to three weeks' and 'they don't have to make a deal'; Hezbollah fires rocket barrage at northern Israel — 3 lightly injured, IDF strikes launchers; Iranian missiles hit central Israel, fires at workshop in Petah Tikva; Netanyahu says 'Iranian regime is weaker than ever'; Israel kills 7 in Beirut suburbs (Jnah, Khaldeh); Iran's 87th regional attack wave launched by IRGC Navy; Trump floats pulling US from NATO; Brent crude hits new conflict high at $121.88; oil up 61% since war began"},
  '2026-04-01':{headline:"Trump Claims Iran Asked for Ceasefire — Tehran Denies It; Iran Fires Largest Missile Salvo of War; Trump to Address Nation Tonight",sub:"Trump claims Iranian President Pezeshkian asked the US for a ceasefire — Iran immediately denied it as 'false and baseless'; Trump says he will 'consider' ceasefire only once Hormuz is reopened; Iran fires its largest missile salvo since the conflict began — 6 barrages on central Israel, 14 injured including children; Trump to deliver prime-time address on 'Operation Epic Fury' at 9pm ET; US-Israel strikes hit pharmaceutical plants and steel facilities in Isfahan and Farokhshahr; Israeli strikes kill 7 in Beirut suburbs; oil falls sharply on ceasefire speculation — Brent $105.20; gold bounces to $4,747 — up 1.5% after worst March in decades; IRGC says Hormuz 'fully under our control'"},
};

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
      return '<button class="nf-btn nf-co' + (isActive ? ' active' : '') + (isSel ? ' nf-sel' : '') + '" data-action="tog-news-co" data-co="' + co + '">' + (flag ? flag + ' ' : '') + co + '</button>';
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
        '<div class="nf-faction-header" data-action="tog-news-faction" data-faction="' + fg.key + '">' +
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
      '<button class="cat-chip' + (newsCatFilter === k ? ' cc-active' : '') + '" data-action="tog-news-cat" data-cat="' + k + '">' + v + '</button>'
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

const CASUALTY_DATA = {
  '2026-02-28': {coalition:{deaths:4,injuries:12}, axis:{deaths:42,injuries:63}, civilian:{deaths:14,injuries:25}},
  '2026-03-01': {coalition:{deaths:8,injuries:28}, axis:{deaths:110,injuries:165}, civilian:{deaths:38,injuries:70}},
  '2026-03-02': {coalition:{deaths:12,injuries:42}, axis:{deaths:185,injuries:278}, civilian:{deaths:72,injuries:131}},
  '2026-03-03': {coalition:{deaths:15,injuries:52}, axis:{deaths:248,injuries:372}, civilian:{deaths:105,injuries:191}},
  '2026-03-04': {coalition:{deaths:19,injuries:64}, axis:{deaths:320,injuries:480}, civilian:{deaths:150,injuries:273}},
  '2026-03-05': {coalition:{deaths:22,injuries:74}, axis:{deaths:380,injuries:570}, civilian:{deaths:190,injuries:346}},
  '2026-03-06': {coalition:{deaths:24,injuries:82}, axis:{deaths:428,injuries:642}, civilian:{deaths:225,injuries:410}},
  '2026-03-07': {coalition:{deaths:28,injuries:96}, axis:{deaths:502,injuries:753}, civilian:{deaths:268,injuries:488}},
  '2026-03-08': {coalition:{deaths:31,injuries:106}, axis:{deaths:558,injuries:837}, civilian:{deaths:305,injuries:556}},
  '2026-03-09': {coalition:{deaths:33,injuries:114}, axis:{deaths:610,injuries:915}, civilian:{deaths:340,injuries:619}},
  '2026-03-10': {coalition:{deaths:35,injuries:122}, axis:{deaths:660,injuries:990}, civilian:{deaths:378,injuries:688}},
  '2026-03-11': {coalition:{deaths:38,injuries:136}, axis:{deaths:740,injuries:1110}, civilian:{deaths:430,injuries:783}},
  '2026-03-12': {coalition:{deaths:40,injuries:148}, axis:{deaths:810,injuries:1215}, civilian:{deaths:490,injuries:892}},
  '2026-03-13': {coalition:{deaths:42,injuries:158}, axis:{deaths:875,injuries:1313}, civilian:{deaths:545,injuries:992}},
  '2026-03-14': {coalition:{deaths:44,injuries:170}, axis:{deaths:950,injuries:1425}, civilian:{deaths:620,injuries:1128}},
  '2026-03-15': {coalition:{deaths:46,injuries:190}, axis:{deaths:1080,injuries:1620}, civilian:{deaths:740,injuries:1347}},
  '2026-03-16': {coalition:{deaths:48,injuries:213}, axis:{deaths:1280,injuries:1920}, civilian:{deaths:890,injuries:1624}},
  '2026-03-17': {coalition:{deaths:55,injuries:240}, axis:{deaths:1500,injuries:2200}, civilian:{deaths:1020,injuries:1850}},
  '2026-03-18': {coalition:{deaths:57,injuries:255}, axis:{deaths:1620,injuries:2380}, civilian:{deaths:1120,injuries:2010}},
  '2026-03-19': {coalition:{deaths:61,injuries:278}, axis:{deaths:1780,injuries:2580}, civilian:{deaths:1250,injuries:2230}},
  '2026-03-20': {coalition:{deaths:41,injuries:310}, axis:{deaths:2120,injuries:21500}, civilian:{deaths:1520,injuries:4100}},
  '2026-03-21': {coalition:{deaths:44,injuries:328}, axis:{deaths:2280,injuries:22800}, civilian:{deaths:1640,injuries:4420}},
  '2026-03-22': {coalition:{deaths:47,injuries:341}, axis:{deaths:2450,injuries:23600}, civilian:{deaths:1720,injuries:4680}},
  '2026-03-23': {coalition:{deaths:50,injuries:512}, axis:{deaths:2620,injuries:24800}, civilian:{deaths:1850,injuries:5100}},
  '2026-03-24': {coalition:{deaths:52,injuries:530}, axis:{deaths:2780,injuries:25800}, civilian:{deaths:1940,injuries:5350}},
  '2026-03-25': {coalition:{deaths:55,injuries:560}, axis:{deaths:2920,injuries:26800}, civilian:{deaths:2040,injuries:5620}},
  '2026-03-26': {coalition:{deaths:56,injuries:575}, axis:{deaths:3050,injuries:27400}, civilian:{deaths:2130,injuries:5840}},
  '2026-03-27': {coalition:{deaths:56,injuries:587}, axis:{deaths:3150,injuries:27800}, civilian:{deaths:2210,injuries:6050}},
  '2026-03-28': {coalition:{deaths:56,injuries:599}, axis:{deaths:3350,injuries:28600}, civilian:{deaths:2420,injuries:6350}},
  '2026-03-29': {coalition:{deaths:57,injuries:625}, axis:{deaths:3520,injuries:29400}, civilian:{deaths:2600,injuries:6650}},
  '2026-03-30': {coalition:{deaths:57,injuries:632}, axis:{deaths:3620,injuries:30100}, civilian:{deaths:2680,injuries:6800}},
  '2026-03-31': {coalition:{deaths:59,injuries:645}, axis:{deaths:3780,injuries:31200}, civilian:{deaths:2880,injuries:7100}},
  '2026-04-01': {coalition:{deaths:62,injuries:658}, axis:{deaths:3940,injuries:32000}, civilian:{deaths:3080,injuries:7600}},
};
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

const DISPLACEMENT_DATA = {
  '2026-02-28': {Iran:15000, Lebanon:0, Iraq:5000, Syria:2000},
  '2026-03-01': {Iran:45000, Lebanon:0, Iraq:12000, Syria:8000, UAE:3000},
  '2026-03-02': {Iran:85000, Lebanon:42000, Iraq:22000, Syria:15000, UAE:8000},
  '2026-03-03': {Iran:140000, Lebanon:95000, Iraq:35000, Syria:22000, UAE:12000, Kuwait:4000},
  '2026-03-04': {Iran:210000, Lebanon:155000, Iraq:48000, Syria:28000, UAE:18000, Kuwait:7000},
  '2026-03-05': {Iran:280000, Lebanon:220000, Iraq:62000, Syria:34000, UAE:22000, Kuwait:9000},
  '2026-03-06': {Iran:340000, Lebanon:285000, Iraq:72000, Syria:38000, UAE:15000, Kuwait:10000},
  '2026-03-07': {Iran:410000, Lebanon:360000, Iraq:85000, Syria:42000, UAE:11000, Kuwait:8000},
  '2026-03-08': {Iran:480000, Lebanon:440000, Iraq:98000, Syria:48000, UAE:9000, Kuwait:6000},
  '2026-03-09': {Iran:540000, Lebanon:520000, Iraq:108000, Syria:52000, UAE:7000, Kuwait:5000},
  '2026-03-10': {Iran:600000, Lebanon:600000, Iraq:118000, Syria:56000, UAE:6000, Kuwait:4000},
  '2026-03-11': {Iran:660000, Lebanon:690000, Iraq:130000, Syria:62000, UAE:5000, Kuwait:3500},
  '2026-03-12': {Iran:720000, Lebanon:770000, Iraq:140000, Syria:66000, UAE:5000, Kuwait:3000},
  '2026-03-13': {Iran:780000, Lebanon:840000, Iraq:148000, Syria:70000, UAE:5000, Kuwait:3000},
  '2026-03-14': {Iran:840000, Lebanon:900000, Iraq:155000, Syria:74000, UAE:5000, Kuwait:3000},
  '2026-03-15': {Iran:900000, Lebanon:950000, Iraq:162000, Syria:78000, UAE:5000, Kuwait:3000},
  '2026-03-16': {Iran:950000, Lebanon:1000000, Iraq:168000, Syria:82000, UAE:5000, Kuwait:3000},
  '2026-03-17': {Iran:1000000, Lebanon:1050000, Iraq:175000, Syria:86000, UAE:5000, Kuwait:3000},
  '2026-03-18': {Iran:1060000, Lebanon:1100000, Iraq:180000, Syria:89000, UAE:5200, Kuwait:3000},
  '2026-03-19': {Iran:1130000, Lebanon:1150000, Iraq:190000, Syria:92000, UAE:6500, Kuwait:8000},
  '2026-03-20': {Iran:1200000, Lebanon:1220000, Iraq:198000, Syria:95000, UAE:7000, Kuwait:9500},
  '2026-03-21': {Iran:1280000, Lebanon:1290000, Iraq:210000, Syria:98000, UAE:7500, Kuwait:10000},
  '2026-03-22': {Iran:1350000, Lebanon:1350000, Iraq:220000, Syria:102000, UAE:7800, Kuwait:11000},
  '2026-03-23': {Iran:1420000, Lebanon:1400000, Iraq:232000, Syria:106000, UAE:8200, Kuwait:11800},
  '2026-03-24': {Iran:1480000, Lebanon:1450000, Iraq:240000, Syria:110000, UAE:8500, Kuwait:13500},
  '2026-03-25': {Iran:1550000, Lebanon:1520000, Iraq:248000, Syria:114000, UAE:8800, Kuwait:14500},
  '2026-03-26': {Iran:1580000, Lebanon:1540000, Iraq:250000, Syria:116000, UAE:9000, Kuwait:14800},
  '2026-03-27': {Iran:1610000, Lebanon:1560000, Iraq:252000, Syria:118000, UAE:9200, Kuwait:15000},
  '2026-03-28': {Iran:1650000, Lebanon:1580000, Iraq:255000, Syria:120000, UAE:9400, Kuwait:15500},
  '2026-03-29': {Iran:1690000, Lebanon:1610000, Iraq:258000, Syria:122000, UAE:9600, Kuwait:16000},
  '2026-03-30': {Iran:1720000, Lebanon:1635000, Iraq:260000, Syria:123000, UAE:9700, Kuwait:16200},
  '2026-03-31': {Iran:1750000, Lebanon:1680000, Iraq:262000, Syria:124000, UAE:9800, Kuwait:16500},
  '2026-04-01': {Iran:1770000, Lebanon:1720000, Iraq:264000, Syria:125000, UAE:9900, Kuwait:16800},
};
const DISPLACEMENT_COLORS = {
  Iran:'#ff2d7b', Lebanon:'#ff6b4a', Iraq:'#ffe100', Syria:'#ff9500', UAE:'#00e5ff', Kuwait:'#00ff88'
};

const OIL_PRICE_DATA = {
  '2026-02-25':{brent:75.2,wti:71.0},'2026-02-26':{brent:73.5,wti:69.3},
  '2026-02-27':{brent:74.2,wti:70.1},
  '2026-02-28':{brent:82.5,wti:78.0},'2026-03-01':{brent:88.2,wti:83.5},'2026-03-02':{brent:91.0,wti:86.2},
  '2026-03-03':{brent:89.5,wti:84.8},'2026-03-04':{brent:87.3,wti:82.5},'2026-03-05':{brent:88.8,wti:84.0},
  '2026-03-06':{brent:90.2,wti:85.5},'2026-03-07':{brent:92.5,wti:87.8},'2026-03-08':{brent:95.0,wti:89.5},
  '2026-03-09':{brent:93.8,wti:88.2},'2026-03-10':{brent:94.5,wti:89.0},'2026-03-11':{brent:96.2,wti:90.5},
  '2026-03-12':{brent:98.0,wti:92.0},'2026-03-13':{brent:100.4,wti:93.8},'2026-03-14':{brent:97.5,wti:91.2},
  '2026-03-15':{brent:101.2,wti:94.0},'2026-03-16':{brent:103.0,wti:95.5},'2026-03-17':{brent:103.4,wti:95.8},
  '2026-03-18':{brent:110.5,wti:97.2},
  '2026-03-19':{brent:110.9,wti:97.1},
  '2026-03-20':{brent:112.3,wti:98.5},
  '2026-03-21':{brent:117.4,wti:102.8},
  '2026-03-22':{brent:115.2,wti:100.1},
  '2026-03-23':{brent:99.94,wti:88.13},
  '2026-03-24':{brent:103.94,wti:91.62},
  '2026-03-25':{brent:94.42,wti:87.72},
  '2026-03-26':{brent:105.85,wti:93.10},
  '2026-03-27':{brent:107.81,wti:95.28},
  '2026-03-28':{brent:109.50,wti:97.10},
  '2026-03-29':{brent:111.10,wti:98.85},
  '2026-03-30':{brent:111.10,wti:98.85},
  '2026-03-31':{brent:121.88,wti:108.5},
  '2026-04-01':{brent:105.2,wti:93},
};

const GOLD_PRICE_DATA = {
  '2026-02-25':4920,'2026-02-26':4885,'2026-02-27':4910,
  '2026-02-28':5045,'2026-03-01':5120,'2026-03-02':5180,'2026-03-03':5155,'2026-03-04':5110,
  '2026-03-05':5135,'2026-03-06':5170,'2026-03-07':5210,'2026-03-08':5255,'2026-03-09':5230,
  '2026-03-10':5245,'2026-03-11':5280,'2026-03-12':5310,'2026-03-13':5321,'2026-03-14':5290,
  '2026-03-15':5260,'2026-03-16':5220,'2026-03-17':5180,'2026-03-18':5090,'2026-03-19':4980,
  '2026-03-20':4820,
  '2026-03-21':4489,
  '2026-03-22':4489,
  '2026-03-23':4424,
  '2026-03-24':4480,
  '2026-03-25':4620,
  '2026-03-26':4439,
  '2026-03-27':4430,
  '2026-03-28':4506,
  '2026-03-29':4541,
  '2026-03-30':4567,
  '2026-03-31':4620,
  '2026-04-01':4747,
};

const SUEZ_DATA = {
  '2026-02-25':53,'2026-02-26':52,'2026-02-27':54,
  '2026-02-28':38,'2026-03-01':32,'2026-03-02':28,'2026-03-03':24,'2026-03-04':22,
  '2026-03-05':20,'2026-03-06':18,'2026-03-07':16,'2026-03-08':14,'2026-03-09':15,
  '2026-03-10':16,'2026-03-11':18,'2026-03-12':17,'2026-03-13':19,'2026-03-14':18,
  '2026-03-15':16,'2026-03-16':15,'2026-03-17':14,'2026-03-18':13,'2026-03-19':12,
  '2026-03-20':11,
  '2026-03-21':10,
  '2026-03-22':9,
  '2026-03-23':8,
  '2026-03-24':8,
  '2026-03-25':9,
  '2026-03-26':10,
  '2026-03-27':9,
  '2026-03-28':9,
  '2026-03-29':8,
  '2026-03-30':8,
  '2026-03-31':8,
  '2026-04-01':7,
};
// ===== WAR RISK INSURANCE PREMIUMS (% of hull value) =====
// Gulf = Strait of Hormuz / Persian Gulf transit. Red Sea = Bab el-Mandeb / southern Red Sea.
// East Med = eastern Mediterranean (Syria/Lebanon/Israel coast).
// Pre-conflict: Gulf ~0.05%, Red Sea ~0.5% (Houthi baseline), East Med ~0.02%.
// Post-conflict: Gulf surges to ~8-10%, Red Sea 3-5%, East Med 1-3%.
const INSURANCE_DATA = {
  '2026-02-25':{gulf:0.15,redsea:0.80,eastmed:0.04},'2026-02-26':{gulf:0.18,redsea:0.85,eastmed:0.05},
  '2026-02-27':{gulf:0.25,redsea:0.90,eastmed:0.06},
  '2026-02-28':{gulf:2.50,redsea:1.80,eastmed:0.45},'2026-03-01':{gulf:3.80,redsea:2.20,eastmed:0.65},
  '2026-03-02':{gulf:4.50,redsea:2.50,eastmed:0.80},'2026-03-03':{gulf:5.00,redsea:2.80,eastmed:0.95},
  '2026-03-04':{gulf:5.20,redsea:2.90,eastmed:1.05},'2026-03-05':{gulf:5.50,redsea:3.00,eastmed:1.15},
  '2026-03-06':{gulf:7.50,redsea:3.50,eastmed:1.40},'2026-03-07':{gulf:8.00,redsea:3.80,eastmed:1.60},
  '2026-03-08':{gulf:8.50,redsea:4.00,eastmed:1.80},'2026-03-09':{gulf:8.20,redsea:3.90,eastmed:1.75},
  '2026-03-10':{gulf:8.00,redsea:3.80,eastmed:1.70},'2026-03-11':{gulf:7.80,redsea:3.60,eastmed:1.55},
  '2026-03-12':{gulf:8.00,redsea:3.70,eastmed:1.60},'2026-03-13':{gulf:8.50,redsea:3.90,eastmed:1.75},
  '2026-03-14':{gulf:9.00,redsea:4.10,eastmed:1.90},'2026-03-15':{gulf:10.00,redsea:4.50,eastmed:2.20},
  '2026-03-16':{gulf:11.00,redsea:4.80,eastmed:2.50},'2026-03-17':{gulf:12.00,redsea:5.20,eastmed:2.70},
  '2026-03-18':{gulf:13.50,redsea:5.60,eastmed:3.00},
  '2026-03-19':{gulf:14.00,redsea:6.00,eastmed:3.20},
  '2026-03-20':{gulf:13.50,redsea:5.80,eastmed:3.10},
  '2026-03-21':{gulf:14.00,redsea:6.00,eastmed:3.20},
  '2026-03-22':{gulf:15.00,redsea:6.20,eastmed:3.30},
  '2026-03-23':{gulf:14.50,redsea:6.20,eastmed:3.20},
  '2026-03-24':{gulf:14.80,redsea:6.30,eastmed:3.30},
  '2026-03-25':{gulf:12.50,redsea:5.80,eastmed:3.00},
  '2026-03-26':{gulf:13.00,redsea:6.00,eastmed:3.10},
  '2026-03-27':{gulf:13.50,redsea:6.20,eastmed:3.20},
  '2026-03-28':{gulf:13.80,redsea:6.30,eastmed:3.25},
  '2026-03-29':{gulf:14.00,redsea:6.40,eastmed:3.30},
  '2026-03-30':{gulf:14.20,redsea:6.50,eastmed:3.35},
  '2026-03-31':{gulf:15.2,redsea:6.7,eastmed:3.45},
  '2026-04-01':{gulf:13.5,redsea:6.2,eastmed:3.2},
};

// ===== NOTAM / FIR CLOSURE DATA =====
// Counts of active NOTAMs by severity: closed (complete FIR closure), restricted (altitude/time limits).
// total = total active NOTAMs including advisories. Pre-conflict: minimal (1-3 standing NOTAMs).
const NOTAM_DATA = {
  '2026-02-25':{closed:0,restricted:4,total:10},'2026-02-26':{closed:0,restricted:5,total:12},
  '2026-02-27':{closed:1,restricted:6,total:15},
  '2026-02-28':{closed:5,restricted:8,total:28},'2026-03-01':{closed:6,restricted:10,total:34},
  '2026-03-02':{closed:6,restricted:11,total:36},'2026-03-03':{closed:7,restricted:11,total:38},
  '2026-03-04':{closed:7,restricted:12,total:40},'2026-03-05':{closed:7,restricted:12,total:41},
  '2026-03-06':{closed:8,restricted:14,total:48},'2026-03-07':{closed:9,restricted:15,total:52},
  '2026-03-08':{closed:9,restricted:15,total:54},'2026-03-09':{closed:9,restricted:14,total:52},
  '2026-03-10':{closed:9,restricted:15,total:54},'2026-03-11':{closed:9,restricted:15,total:55},
  '2026-03-12':{closed:9,restricted:16,total:56},'2026-03-13':{closed:10,restricted:16,total:57},
  '2026-03-14':{closed:10,restricted:16,total:58},'2026-03-15':{closed:10,restricted:17,total:59},
  '2026-03-16':{closed:10,restricted:17,total:60},'2026-03-17':{closed:11,restricted:17,total:62},
  '2026-03-18':{closed:11,restricted:18,total:65},
  '2026-03-19':{closed:11,restricted:19,total:68},
  '2026-03-20':{closed:11,restricted:19,total:70},
  '2026-03-21':{closed:11,restricted:19,total:72},
  '2026-03-22':{closed:11,restricted:19,total:74},
  '2026-03-23':{closed:12,restricted:19,total:76},
  '2026-03-24':{closed:12,restricted:19,total:78},
  '2026-03-25':{closed:12,restricted:19,total:80},
  '2026-03-26':{closed:12,restricted:19,total:82},
  '2026-03-27':{closed:12,restricted:19,total:84},
  '2026-03-28':{closed:12,restricted:19,total:86},
  '2026-03-29':{closed:12,restricted:19,total:88},
  '2026-03-30':{closed:12,restricted:19,total:88},
  '2026-03-31':{closed:12,restricted:20,total:90},
  '2026-04-01':{closed:12,restricted:20,total:91},
};

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
const SHIPPING_DATA = getShippingData();

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
const FLIGHT_STATUS_DATA = getFlightStatusData();

const ESCALATION_SCORES = {
  '2026-02-15':1,'2026-02-16':1,'2026-02-17':2,'2026-02-18':2,'2026-02-19':2,
  '2026-02-20':2,'2026-02-21':2,'2026-02-22':3,'2026-02-23':3,'2026-02-24':3,
  '2026-02-25':3,'2026-02-26':3,'2026-02-27':3,
  '2026-02-28':9,'2026-03-01':10,'2026-03-02':9,'2026-03-03':9,'2026-03-04':8,
  '2026-03-05':8,'2026-03-06':8,'2026-03-07':8,'2026-03-08':9,'2026-03-09':7,
  '2026-03-10':7,'2026-03-11':8,'2026-03-12':8,'2026-03-13':7,'2026-03-14':7,
  '2026-03-15':9,'2026-03-16':8,'2026-03-17':8,'2026-03-18':10,
  '2026-03-19':10,
  '2026-03-20':9,
  '2026-03-21':10,
  '2026-03-22':10,
  '2026-03-23':10,
  '2026-03-24':10,
  '2026-03-25':10,
  '2026-03-26':9,
  '2026-03-27':9,
  '2026-03-28':9,
  '2026-03-29':9,
  '2026-03-30':10,
  '2026-03-31':10,
  '2026-04-01':10,
};
const ESC_LABELS = {1:'LOW',2:'GUARDED',3:'ELEVATED',4:'ELEVATED',5:'HIGH',6:'HIGH',7:'SEVERE',8:'SEVERE',9:'CRITICAL',10:'MAXIMUM'};
const CIVILIAN_INFRA = [
  // Hospitals / Medical
  {lat:35.7,lng:51.4,type:'hospital',name:'Tehran Medical Complex',co:'Iran'},
  {lat:33.9,lng:35.5,type:'hospital',name:'AUBMC Beirut',co:'Lebanon'},
  {lat:33.3,lng:44.4,type:'hospital',name:'Baghdad Medical City',co:'Iraq'},
  {lat:32.1,lng:34.8,type:'hospital',name:'Sheba Medical Center',co:'Israel'},
  {lat:25.2,lng:55.3,type:'hospital',name:'Dubai Hospital',co:'UAE'},
  // Power Plants
  {lat:35.3,lng:52.1,type:'power',name:'Shahid Rajaee Power Plant',co:'Iran'},
  {lat:33.8,lng:35.6,type:'power',name:'Zouk Mosbeh Power Station',co:'Lebanon'},
  {lat:29.1,lng:48.1,type:'power',name:'Az-Zour Power Plant',co:'Kuwait'},
  {lat:25.1,lng:55.1,type:'power',name:'Jebel Ali Power Complex',co:'UAE'},
  {lat:24.5,lng:39.6,type:'power',name:'Yanbu Power Plant',co:'Saudi Arabia'},
  // Desalination Plants
  {lat:26.3,lng:50.2,type:'desal',name:'Ras Al Khair Desal (world\'s largest)',co:'Saudi Arabia'},
  {lat:29.1,lng:48.2,type:'desal',name:'Az-Zour Desal Plant',co:'Kuwait'},
  {lat:25.0,lng:55.1,type:'desal',name:'Jebel Ali Desal Plant',co:'UAE'},
  {lat:26.2,lng:50.5,type:'desal',name:'Al Dur Desal Plant',co:'Bahrain'},
  {lat:25.3,lng:51.5,type:'desal',name:'Ras Abu Fontas Desal',co:'Qatar'},
  // Internet Cable Landing Points
  {lat:25.3,lng:55.4,type:'cable',name:'FLAG/SEA-ME-WE Landing (Fujairah)',co:'UAE'},
  {lat:32.1,lng:34.8,type:'cable',name:'IMEWE Cable Landing (Tel Aviv)',co:'Israel'},
  {lat:30.0,lng:48.5,type:'cable',name:'FALCON Cable Landing (Al Faw)',co:'Iraq'},
  {lat:25.6,lng:54.6,type:'cable',name:'2Africa Cable Landing (Kalba)',co:'UAE'},
  {lat:12.8,lng:45.0,type:'cable',name:'AAE-1 Cable Landing (Aden)',co:'Yemen'}
];
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
const REFUGEE_FLOWS = [
  {from:{lat:35.7,lng:51.4}, to:{lat:38.0,lng:44.0}, label:'Iran → Turkey', color:'#ff2d7b'},
  {from:{lat:35.7,lng:51.4}, to:{lat:39.0,lng:51.5}, label:'Iran → Azerbaijan', color:'#ff2d7b'},
  {from:{lat:33.9,lng:35.5}, to:{lat:33.5,lng:36.3}, label:'Lebanon → Syria', color:'#ff6b4a'},
  {from:{lat:33.9,lng:35.5}, to:{lat:35.0,lng:33.0}, label:'Lebanon → Cyprus', color:'#ff6b4a'},
  {from:{lat:33.3,lng:44.4}, to:{lat:36.2,lng:44.0}, label:'Iraq → Kurdistan', color:'#ffe100'},
  {from:{lat:33.3,lng:44.4}, to:{lat:33.0,lng:36.0}, label:'Iraq → Jordan', color:'#ffe100'},
  {from:{lat:25.2,lng:55.3}, to:{lat:25.3,lng:56.3}, label:'UAE → Oman', color:'#00e5ff'},
  {from:{lat:29.4,lng:47.9}, to:{lat:29.5,lng:48.5}, label:'Kuwait → Iraq', color:'#00ff88'}
];
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
const COUNTRY_ECON = {
  'USA':{gdp:'$28.8T',oilRev:'N/A (net exporter)',sovFund:'N/A',imports:'Minimal ME oil dependency',warCost:'$2.1B/week est. operational cost'},
  'Israel':{gdp:'$564B',oilRev:'None',sovFund:'N/A',imports:'98% energy imported',warCost:'$1.5B/week in defense spending'},
  'Saudi Arabia':{gdp:'$1.1T',oilRev:'$222B/yr (62% budget)',sovFund:'PIF: $930B',imports:'Food: 80% imported',warCost:'Oil export disruption: ~$1.2B/day lost if Hormuz stays closed'},
  'Bahrain':{gdp:'$44B',oilRev:'$5.8B/yr',sovFund:'Mumtalakat: $18B',imports:'90% food imported',warCost:'Tourism + banking sector paralyzed'},
  'Qatar':{gdp:'$235B',oilRev:'$50B LNG/yr',sovFund:'QIA: $510B',imports:'90% food imported',warCost:'Ras Laffan LNG hub damaged — $180M/day exports at risk'},
  'Iran':{gdp:'$368B',oilRev:'$40B/yr (pre-sanctions)',sovFund:'NDFI: ~$140B (est.)',imports:'Food subsidies: $15B/yr',warCost:'Infrastructure damage: $50B+ estimated'},
  'Lebanon':{gdp:'$22B',oilRev:'None',sovFund:'None (bankrupt since 2020)',imports:'85% food imported',warCost:'GDP contraction: 15-20% projected'},
  'Syria':{gdp:'$11B',oilRev:'Minimal',sovFund:'None',imports:'60% food aid-dependent',warCost:'Already in humanitarian crisis'},
  'Yemen':{gdp:'$21B',oilRev:'Minimal (civil war)',sovFund:'None',imports:'90% food imported',warCost:'Red Sea disruption affecting aid shipments'},
  'Iraq':{gdp:'$267B',oilRev:'$85B/yr (95% budget)',sovFund:'DFI: ~$20B',imports:'Massive food imports via Hormuz',warCost:'Pipeline to Turkey compensating for Hormuz closure'},
  'Oman':{gdp:'$105B',oilRev:'$18B/yr',sovFund:'OIA: $50B',imports:'Moderate',warCost:'Mediator role; port revenue up from diverted shipping'},
  'Egypt':{gdp:'$397B',oilRev:'$8B/yr',sovFund:'EIDF: $12B',imports:'World\'s largest wheat importer',warCost:'Suez Canal revenue down 32% from Red Sea diversions'},
  'Turkey':{gdp:'$1.1T',oilRev:'Minimal',sovFund:'TWF: $85B',imports:'Energy: 72% imported (Iran pipeline at risk)',warCost:'Tourism boost from diverted Gulf traffic'},
  'UAE':{gdp:'$509B',oilRev:'$65B/yr',sovFund:'ADIA: $990B',imports:'85% food imported',warCost:'Fujairah hub damaged; flight bans costing $200M/week'},
  'Kuwait':{gdp:'$184B',oilRev:'$45B/yr (90% budget)',sovFund:'KIA: $920B',imports:'95% food imported',warCost:'Oil exports rerouted to Iraq pipeline — $50M/day cost'},
  'Jordan':{gdp:'$47B',oilRev:'None',sovFund:'N/A',imports:'96% energy imported from Iraq/Egypt',warCost:'Hosting refugee overflow; economy strained'},
  'Azerbaijan':{gdp:'$79B',oilRev:'$15B/yr (BTC pipeline)',sovFund:'SOFAZ: $56B',imports:'Moderate (grain from Russia)',warCost:'Nakhchivan airport damaged; southern airspace closed; humanitarian transit costs'},
  'Russia':{gdp:'$2.0T',oilRev:'$180B/yr',sovFund:'NWF: $150B',imports:'Minimal ME dependency',warCost:'Benefiting from oil price spike; providing intel + drone tech to Iran'},
  'UK':{gdp:'$3.1T',oilRev:'$25B/yr (North Sea)',sovFund:'N/A',imports:'17% oil from ME',warCost:'Carrier strike group deployment: ~$40M/week; mine clearance ops ongoing'},
  'France':{gdp:'$2.8T',oilRev:'Minimal',sovFund:'N/A',imports:'17% LNG from Qatar',warCost:'Charles de Gaulle deployment: ~$35M/week; independent Hormuz operation costs'},
  'Germany':{gdp:'$4.5T',oilRev:'Minimal',sovFund:'N/A',imports:'30% oil from ME/Russia',warCost:'ECB warned "material impact" on inflation; energy shock to manufacturing sector'},
  'Italy':{gdp:'$2.3T',oilRev:'Minimal',sovFund:'CDP Equity: ~$35B',imports:'25% oil + 12% gas from ME',warCost:'Mediterranean trade route disruption; co-signed EU infrastructure moratorium'},
  'Japan':{gdp:'$4.2T',oilRev:'None',sovFund:'GPIF: $1.6T',imports:'90% oil from ME (4th-largest importer)',warCost:'Shipping rates doubled; factory shutdowns from supply delays'},
  'India':{gdp:'$3.9T',oilRev:'Minimal',sovFund:'N/A',imports:'60% oil from Gulf; 9M workers in Gulf states',warCost:'Energy import bill up $18B/yr at current prices; $31B Gulf remittances at risk'},
  'Pakistan':{gdp:'$340B',oilRev:'Minimal',sovFund:'N/A',imports:'35% oil from Gulf; $31B/yr Gulf remittances',warCost:'Gwadar port (CPEC) disrupted; fuel subsidy burden rising; border security costs'}
};

