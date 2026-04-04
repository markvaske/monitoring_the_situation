// ===== MTS CALENDAR =====
// Calendar widget, day selection, day navigation

const CONFLICT_START = conflictPhases[0][0];
let PRESENT_DAY = days[days.length - 1];

function getCalDays() {
  const baseEnd = new Date(PRESENT_DAY + 'T12:00:00');
  const shifted = new Date(baseEnd);
  shifted.setDate(shifted.getDate() + calWeekOffset * 7);
  const endD = new Date(shifted);
  const startD = new Date(shifted);
  startD.setDate(startD.getDate() - 27);
  const result = [];
  for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1))
    result.push(d.toISOString().slice(0, 10));
  return result;
}

function buildCal(cf) {
  const g = document.getElementById('calG');
  g.innerHTML = '';
  ['S','M','T','W','T','F','S'].forEach(h => {
    const e = document.createElement('div');
    e.className = 'ch'; e.textContent = h; g.appendChild(e);
  });
  const calDays = getCalDays();
  const sd = new Date(calDays[0] + 'T12:00:00');
  for (let i = 0; i < sd.getDay(); i++) {
    const e = document.createElement('div');
    e.className = 'cd empty'; g.appendChild(e);
  }
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let lastMonth = sd.getMonth();

  // Precompute trend for each day from Feb 28 onward
  function getDayTrend(ds, co) {
    const di = days.indexOf(ds);
    if (di < 1 || ds < CONFLICT_START) return null;
    const lb = Math.min(di, 7), pd = days[di - lb];
    const windowStart = pd, windowEnd = ds;
    const priorStart = days[Math.max(0, di - lb * 2)];
    const ctx = { selDay: ds, pd, windowStart, windowEnd, priorStart, co: co || null };
    let tw = 0, ts = 0;
    TREND_FACTORS.forEach(f => {
      const result = f.fn(ctx);
      if (result) { ts += result.score * f.weight; tw += f.weight; }
    });
    const composite = tw > 0 ? ts / tw : 0;
    return composite; // returns numeric score for spectrum coloring
  }

  calDays.forEach(ds => {
    const dt = new Date(ds + 'T12:00:00');
    // Month divider
    if (dt.getMonth() !== lastMonth) {
      // Fill remaining cells in the row before divider
      const currentChildren = g.children.length;
      const cellsInRow = (currentChildren - 7) % 7; // subtract header row
      if (cellsInRow > 0) {
        for (let p = cellsInRow; p < 7; p++) {
          const pad = document.createElement('div');
          pad.className = 'cd empty'; g.appendChild(pad);
        }
      }
      const divider = document.createElement('div');
      divider.className = 'cal-month-divider';
      divider.innerHTML = '<span>' + monthNames[dt.getMonth()] + '</span>';
      g.appendChild(divider);
      // Add day-of-week padding for the new month's first day
      for (let i = 0; i < dt.getDay(); i++) {
        const pad = document.createElement('div');
        pad.className = 'cd empty'; g.appendChild(pad);
      }
      lastMonth = dt.getMonth();
    }
    const e = document.createElement('div');
    e.className = 'cd';
    e.textContent = dt.getDate();
    const isPreConflict = ds < CONFLICT_START;

    // Apply trend-based coloring from Feb 28 onward
    if (!isPreConflict && ds >= CONFLICT_START) {
      const trend = getDayTrend(ds, cf || null);
      if (trend !== null) {
        const tc = getTrendColor(trend);
        const r = parseInt(tc.slice(1,3),16), g = parseInt(tc.slice(3,5),16), b = parseInt(tc.slice(5,7),16);
        e.style.background = 'rgba(' + r + ',' + g + ',' + b + ',.15)';
        e.style.color = '#fff';
      } else {
        e.classList.add('peace-day');
      }
    } else {
      e.classList.add('peace-day');
    }

    if (isPreConflict) e.classList.add('pre-conflict');
    if (ds === CONFLICT_START || ds === PRESENT_DAY) e.classList.add('bold-date');
    if (ds === selDay) e.classList.add('selected');
    if (daysSet.has(ds)) {
      e.addEventListener('click', () => selectDay(ds));
    } else {
      e.style.cursor = 'default'; e.style.opacity = '0.25';
    }
    g.appendChild(e);
  });
  const upEl = document.getElementById('calUp'), dnEl = document.getElementById('calDown');
  upEl.className = calWeekOffset <= -4 ? 'disabled' : '';
  dnEl.className = calWeekOffset >= 4 ? 'disabled' : '';
}

function calNav(dir) {
  const g = document.getElementById('calG');
  g.classList.add('cal-transition', 'slide-out');
  setTimeout(() => {
    calWeekOffset += dir;
    buildCal();
    g.classList.remove('slide-out'); g.classList.add('slide-in');
    setTimeout(() => { g.classList.remove('cal-transition', 'slide-in'); }, 20);
  }, 180);
}

function toggleCalPopup() {
  calPopupOpen = !calPopupOpen;
  document.getElementById('calPopup').classList.toggle('open', calPopupOpen);
  document.getElementById('calPopupBtn').classList.toggle('active', calPopupOpen);
}

// ===== SELECT DAY =====
function selectDay(ds) { selDay = ds; ganttSelPhase = null; selMilestoneIdx = null; buildCal(); refresh(); drawMap(); updateTrend(); buildGantt(); closePopup(); updateDayNav(); }
function updateDayNav() {
  const d = new Date(selDay + 'T12:00:00');
  document.getElementById('dayLabel').textContent = d.toLocaleDateString('en-US', {month:'short', day:'numeric'});
  document.getElementById('dayPrev').disabled = (selDay === days[0]);
  document.getElementById('dayNext').disabled = (selDay === days[days.length - 1]);
}
function stepDay(dir) {
  const idx = days.indexOf(selDay);
  const next = idx + dir;
  if (next >= 0 && next < days.length) selectDay(days[next]);
}
