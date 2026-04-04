// ===== MTS TREND =====
// TREND_FACTORS registry, getGroupTrend, updateTrend

// --- TREND FACTOR REGISTRY (pluggable — add new factors here) ---
// Each factor: { name, weight, fn(ctx) → {score: -1..1, detail: string} | null }
// ctx = { selDay, pd (lookback day), windowStart, windowEnd, priorStart, co (selCo or null) }
// Return null to skip this factor for the current scope (e.g. maritime is theater-only)
const TREND_FACTORS = [

  // 1. AIRPORT CLOSURES (weight 15)
  { name:'Airports', weight:15, fn(ctx) {
    const airports = ctx.co ? AP.filter(a => a.co === ctx.co) : AP;
    if (!airports.length) return null;
    let cN=0, cT=0, rN=0, rT=0;
    airports.forEach(a => {
      const sN = getStat(a.c, ctx.selDay), sT = getStat(a.c, ctx.pd);
      if (sN==='Closed') cN++; if (sT==='Closed') cT++;
      if (sN==='Restricted') rN++; if (sT==='Restricted') rT++;
    });
    const scoreNow = cN*2 + rN, scoreThen = cT*2 + rT;
    const delta = scoreThen - scoreNow;
    const mx = airports.length * 2;
    return { score: mx > 0 ? delta / mx : 0,
      detail: delta > 0 ? (cT-cN)+' fewer closed' : delta < 0 ? (cN-cT)+' more closed' : 'No change' };
  }},

  // 2. CONFLICT STATUS (weight 30)
  { name:'Conflict', weight:30, fn(ctx) {
    const sv = {war:3, attack:2, peace:1};
    const countries = ctx.co ? [ctx.co] : ['Iran','Israel','Syria','Iraq','UAE','Qatar','Saudi Arabia','Jordan','Lebanon','Bahrain','Kuwait','Oman','Egypt','Turkey','Yemen'];
    let csNow=0, csThen=0;
    countries.forEach(co => { csNow += sv[getCStatus(co, ctx.selDay)]||1; csThen += sv[getCStatus(co, ctx.pd)]||1; });
    const delta = csThen - csNow;
    const mx = countries.length * 2;
    if (ctx.co) {
      const sNow = getCStatus(ctx.co, ctx.selDay), sThen = getCStatus(ctx.co, ctx.pd);
      const word = sNow === sThen ? (sNow==='war'?'At war':'At '+sNow) : (delta>0?'De-escalating':'Escalating');
      return { score: mx > 0 ? delta / mx : 0, detail: word };
    }
    return { score: mx > 0 ? delta / mx : 0, detail: delta>0?'De-escalating':delta<0?'Escalating':'Unchanged' };
  }},

  // 3. MARITIME ACTIVITY (weight 10) — theater-level only, skip for single country
  { name:'Maritime', weight:10, fn(ctx) {
    if (ctx.co) return null; // no per-country maritime data
    const hzNow = getHormuzDayData(ctx.selDay), hzThen = getHormuzDayData(ctx.pd);
    const svMap = {open:0, contested:1, blocked:2};
    const statNow = svMap[getHormuzStatus(ctx.selDay)]||0, statThen = svMap[getHormuzStatus(ctx.pd)]||0;
    const mineDelta = hzThen.activeMines - hzNow.activeMines;
    const passDelta = hzNow.todayPassages - hzThen.todayPassages;
    const statusDelta = statThen - statNow;
    const raw = mineDelta*0.3 + (passDelta>0?0.3:passDelta<0?-0.3:0) + statusDelta*0.4;
    const norm = Math.max(-1, Math.min(1, raw));
    return { score: norm, detail: norm>0.1?'Easing':norm<-0.1?'Tightening':'Stalled' };
  }},

  // 4. NEWS SENTIMENT (weight 20)
  { name:'Sentiment', weight:20, fn(ctx) {
    const matchCo = n => !ctx.co || (n.tags && n.tags.includes(ctx.co));
    let sentNow=0, sentPrior=0, cntNow=0, cntPrior=0;
    news.forEach(n => {
      if (!matchCo(n)) return;
      const dip = n.cat==='diplomatic' ? 2 : 1;
      if (n.d >= ctx.windowStart && n.d <= ctx.windowEnd) {
        cntNow++;
        if (n.imp==='e') sentNow -= 1*dip; else if (n.imp==='d') sentNow += 1.5*dip;
      }
      if (n.d >= ctx.priorStart && n.d < ctx.windowStart) {
        cntPrior++;
        if (n.imp==='e') sentPrior -= 1*dip; else if (n.imp==='d') sentPrior += 1.5*dip;
      }
    });
    if (!cntNow && !cntPrior && ctx.co) return null; // no news for this country
    const avgNow = cntNow>0 ? sentNow/cntNow : 0;
    const avgPrior = cntPrior>0 ? sentPrior/cntPrior : 0;
    const delta = Math.max(-1, Math.min(1, avgNow - avgPrior));
    return { score: delta, detail: delta>0.1?'More hopeful':delta<-0.1?'More hostile':'Mixed' };
  }},

  // 5. CASUALTIES / MILITARY ACTIVITY (weight 25) — with rate-of-change momentum
  { name:'Casualties', weight:25, fn(ctx) {
    const matchCo = n => !ctx.co || (n.tags && n.tags.includes(ctx.co));
    // Count escalation events in current and prior windows
    const casNewsNow = news.filter(n => n.d>=ctx.windowStart && n.d<=ctx.windowEnd && (n.cat==='military'||n.cat==='general') && n.imp==='e' && matchCo(n)).length;
    const casNewsPrior = news.filter(n => n.d>=ctx.priorStart && n.d<ctx.windowStart && (n.cat==='military'||n.cat==='general') && n.imp==='e' && matchCo(n)).length;
    // HZ_EVENTS only if theater-wide
    let milNow=0, milPrior=0;
    if (!ctx.co) {
      milNow = HZ_EVENTS.filter(e => e.d>=ctx.windowStart && e.d<=ctx.windowEnd && (e.type==='mine'||e.type==='houthi')).reduce((s,e)=>s+e.count,0);
      milPrior = HZ_EVENTS.filter(e => e.d>=ctx.priorStart && e.d<ctx.windowStart && (e.type==='mine'||e.type==='houthi')).reduce((s,e)=>s+e.count,0);
    }
    const totalNow = milNow+casNewsNow, totalPrior = milPrior+casNewsPrior;
    if (!totalNow && !totalPrior && ctx.co) return null;
    // Level component: fewer events = improving
    const levelDelta = totalPrior - totalNow;
    const mx = Math.max(totalNow, totalPrior, 1);
    const levelScore = levelDelta / mx;
    // Momentum component: rate of change (daily rate current vs prior)
    const windowDays = Math.max(1, days.indexOf(ctx.windowEnd) - days.indexOf(ctx.windowStart) + 1);
    const priorDays = Math.max(1, days.indexOf(ctx.windowStart) - days.indexOf(ctx.priorStart));
    const rateNow = totalNow / windowDays;
    const ratePrior = totalPrior / priorDays;
    const rateDelta = ratePrior - rateNow;
    const rateMax = Math.max(rateNow, ratePrior, 0.5);
    const momentumScore = rateDelta / rateMax;
    // Blend: 40% level, 60% momentum (momentum is leading indicator)
    const blended = levelScore * 0.4 + momentumScore * 0.6;
    const norm = Math.max(-1, Math.min(1, blended));
    const detail = norm > 0.1 ? 'Decelerating' : norm < -0.1 ? 'Accelerating' : 'Sustained';
    return { score: norm, detail };
  }}
];

// Compute trend for a group of countries (used for faction trend indicators)
// Returns {arrow, cls, label} or null if insufficient data
function getGroupTrend(countries) {
  const di = days.indexOf(selDay);
  if (di < 1 || !countries.length) return null;
  const lb = Math.min(di, 7), pd = days[di - lb];
  const windowStart = pd, windowEnd = selDay;
  const priorStart = days[Math.max(0, di - lb * 2)];

  // Run each TREND_FACTOR with a synthetic co=null but filtering to group countries
  const factors = [];
  TREND_FACTORS.forEach(f => {
    // Build a context that pretends no single country is selected
    // but we'll evaluate per-country and average
    if (f.name === 'Maritime') return; // theater-level only, skip for faction subsets

    // Evaluate per-country and average
    let totalScore = 0, count = 0;
    countries.forEach(co => {
      const ctx = { selDay, pd, windowStart, windowEnd, priorStart, co };
      const result = f.fn(ctx);
      if (result) { totalScore += result.score; count++; }
    });
    if (count > 0) {
      const avgScore = totalScore / count;
      factors.push({ name: f.name, weight: f.weight, score: avgScore });
    }
  });

  if (!factors.length) return null;

  let tw = 0, ts = 0;
  factors.forEach(f => { ts += f.score * f.weight; tw += f.weight; });
  const composite = tw > 0 ? ts / tw : 0;

  if (composite > 0.05) return { arrow:'\u2197', cls:'ft-improving', label:'Improving', score:composite };
  if (composite < -0.05) return { arrow:'\u2198', cls:'ft-worsening', label:'Worsening', score:composite };
  return { arrow:'\u2192', cls:'ft-steady', label:'Steady', score:composite };
}

function updateTrend() {
  const di = days.indexOf(selDay);
  const aE = document.getElementById('tA'), lE = document.getElementById('tL'), dE = document.getElementById('tD');
  const hE = document.getElementById('tH');

  // Determine scope label
  const factionLabels = {coalition:'Coalition', axis:'Axis of Resistance', neutral:'Neutral'};
  if (selFactions.size) {
    const fLabels = [...selFactions].map(f => factionLabels[f] || f);
    hE.textContent = fLabels.join(', ') + ' Trend';
  } else if (selCo.size) {
    hE.textContent = (selCo.size > 2 ? selCo.size + ' Countries' : [...selCo].join(', ')) + ' Trend';
  } else hE.textContent = '7-Day Trend';

  if (di < 1) {
    aE.textContent = '\u2192'; aE.className = 'trend-arrow steady';
    lE.textContent = 'Not enough data'; dE.textContent = ''; return;
  }

  // If faction is selected, use getGroupTrend for that faction's countries
  if (selFactions.size) {
    let countries = [];
    for (const f of selFactions) {
      const fCos = Object.keys(countryFaction).filter(k => countryFaction[k].faction === f);
      countries.push(...fCos);
    }
    const result = getGroupTrend(countries);
    if (!result) {
      aE.textContent = '\u2192'; aE.className = 'trend-arrow steady';
      lE.textContent = 'No data'; dE.textContent = ''; return;
    }
    aE.textContent = result.arrow;
    aE.style.color = getTrendColor(result.score);
    aE.className = 'trend-arrow';
    lE.textContent = result.label;
    dE.textContent = '';
    return;
  }

  const lb = Math.min(di, 7), pd = days[di - lb];
  const windowStart = pd, windowEnd = selDay;
  const priorStart = days[Math.max(0, di - lb * 2)];
  const ctx = { selDay, pd, windowStart, windowEnd, priorStart, co: selCo.size === 1 ? [...selCo][0] : null };

  // Evaluate all registered factors
  const factors = [];
  TREND_FACTORS.forEach(f => {
    const result = f.fn(ctx);
    if (result) factors.push({ name:f.name, weight:f.weight, score:result.score, detail:result.detail });
  });

  if (!factors.length) {
    aE.textContent = '\u2192'; aE.className = 'trend-arrow steady';
    lE.textContent = 'No data'; dE.textContent = ''; return;
  }

  // Weighted composite (re-normalizes weights to active factors only)
  let totalWeight = 0, totalScore = 0;
  factors.forEach(f => { totalScore += f.score * f.weight; totalWeight += f.weight; });
  const composite = totalWeight > 0 ? totalScore / totalWeight : 0;

  if (composite > 0.05) {
    aE.textContent = '\u2197'; aE.className = 'trend-arrow';
    aE.style.color = getTrendColor(composite);
    lE.textContent = 'Improving';
  } else if (composite < -0.05) {
    aE.textContent = '\u2198'; aE.className = 'trend-arrow';
    aE.style.color = getTrendColor(composite);
    lE.textContent = 'Worsening';
  } else {
    aE.textContent = '\u2192'; aE.className = 'trend-arrow';
    aE.style.color = getTrendColor(composite);
    lE.textContent = 'Holding steady';
  }

  const top = factors.sort((a, b) => Math.abs(b.score * b.weight) - Math.abs(a.score * a.weight));
  const parts = top.slice(0, 3).map(f => f.name + ': ' + f.detail);
  dE.textContent = parts.join(' \u00B7 ');
}
