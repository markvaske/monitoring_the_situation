// ===== MTS GANTT CHART =====
// Category swim lanes with indicator dots + hover popups.
// Each lane = one news category. Dots color-coded by impact (e/d/n).
// Multi-day stories render as connecting lines between start and end dots.
// Hover any dot for a rich popup with story details.

const catIcons = {military:'\u{1F3AF}',aviation:'\u2708',maritime:'\u2693',stocks:'\u{1F4C8}',diplomatic:'\u{1F30D}',general:'\u{1F4CB}'};
const impLabels = {e:'Escalation',d:'De-escalation',n:'Neutral'};

// Named conflict phases for the timeline phase bar
// Colors are computed dynamically from average ESCALATION_SCORES via getEscColor()
function getMilestonesForDay(d) {
  return MILESTONES.filter(ms => ms.d === d);
}

function selectPhase(pi) {
  ganttSelPhase = pi;
  selMilestoneIdx = null;
  buildGantt();
  renderNews();
}

function selectMilestone(gi) {
  const ms = MILESTONES[gi];
  if (!ms) return;
  // Toggle off if already selected
  if (selMilestoneIdx === gi) { selMilestoneIdx = null; }
  else { selMilestoneIdx = gi; }
  // Set day to milestone's date and enter phase mode for that phase
  selDay = ms.d;
  ganttSelPhase = getPhaseForDay(ms.d);
  buildCal(); refresh(); drawMap(); updateTrend(); buildGantt(); updateDayNav();
}

function buildGantt() {
  const container = document.getElementById('ganttChart');
  const ganttDays = days.filter(d => d >= CONFLICT_START);
  if (!ganttDays.length) { container.innerHTML = '<div style="font-size:.8rem;color:var(--text3);padding:12px">No conflict data.</div>'; return; }

  const numDays = ganttDays.length;
  const lastDay = ganttDays[numDays - 1];

  let html = '';
  // Date header row — clickable dates for scrubbing
  html += '<div class="gantt-header"><div class="gantt-dates">';
  ganttDays.forEach(d => {
    const dt = new Date(d + 'T12:00:00');
    const label = (dt.getMonth()+1) + '/' + dt.getDate();
    const isSel = d === selDay;
    html += '<div class="gantt-dh' + (isSel ? ' sel' : '') + '" onclick="selectDay(\'' + d + '\')" title="' + d + '">' + label + (isSel ? '<div class="gantt-marker"></div>' : '') + '</div>';
  });
  html += '</div></div>';

  // Phase bar — colored segments with milestone markers and day needle
  const curPhase = typeof ganttSelPhase === 'number' ? ganttSelPhase : getPhaseForDay(selDay);
  html += '<div class="gantt-phase-bar-row"><div class="gantt-phase-bar">';
  CONFLICT_PHASES_NAMED.forEach((phase, pi) => {
    const startIdx = ganttDays.indexOf(phase.start);
    if (startIdx === -1) return;
    const nextStart = pi < CONFLICT_PHASES_NAMED.length - 1 ? ganttDays.indexOf(CONFLICT_PHASES_NAMED[pi + 1].start) : numDays;
    const span = nextStart - startIdx;
    const widthPct = (span / numDays * 100).toFixed(2);
    const isSel = pi === curPhase;
    html += '<div class="gantt-phase-seg' + (isSel ? ' gps-selected' : '') + '" style="width:' + widthPct + '%;background:' + getPhaseColor(pi) + '" onclick="selectPhase(' + pi + ')" title="' + phase.label + '">';
    if (span >= 3) html += '<span class="gps-label">' + phase.label + '</span>';
    html += '</div>';
  });
  const selIdx = ganttDays.indexOf(selDay);
  if (selIdx !== -1) {
    const needlePct = ((selIdx + 0.5) / numDays * 100).toFixed(2);
    html += '<div class="gantt-needle" style="left:' + needlePct + '%"></div>';
  }
  html += '</div></div>';

  // Phase detail blocks — only show selected phase
  html += '<div class="phase-details">';
  CONFLICT_PHASES_NAMED.forEach((phase, pi) => {
    const nextStart = pi < CONFLICT_PHASES_NAMED.length - 1 ? CONFLICT_PHASES_NAMED[pi + 1].start : null;
    const endDay = nextStart ? ganttDays[ganttDays.indexOf(nextStart) - 1] || lastDay : lastDay;
    const startDt = new Date(phase.start + 'T12:00:00');
    const endDt = new Date(endDay + 'T12:00:00');
    const fmt = {month:'short',day:'numeric'};
    const dateRange = startDt.toLocaleDateString('en-US', fmt) + ' \u2013 ' + endDt.toLocaleDateString('en-US', fmt);
    const isVisible = pi === curPhase;

    // Milestones in this phase, grouped by day
    const phaseMilestones = MILESTONES.filter(ms => ms.d >= phase.start && (!nextStart || ms.d < nextStart));
    const msByDay = {};
    phaseMilestones.forEach(ms => { (msByDay[ms.d] = msByDay[ms.d] || []).push(ms); });
    const msDays = Object.keys(msByDay).sort().reverse();

    // Escalation stats for this phase
    const phaseDays = ganttDays.filter(d => d >= phase.start && (!nextStart || d < nextStart));
    let escMin = 10, escMax = 1;
    phaseDays.forEach(d => { const e = ESCALATION_SCORES[d] || 1; escMin = Math.min(escMin, e); escMax = Math.max(escMax, e); });

    html += '<div class="phase-block' + (isVisible ? ' phase-visible' : '') + '" style="border-left:3px solid ' + getPhaseColor(pi, 0.8) + '">';
    html += '<div class="pb-header"><span class="pb-label">' + phase.label + '</span><span class="pb-dates">' + dateRange + '</span>' +
      '<span class="pb-esc" style="margin-left:auto;font-size:.58rem;padding:2px 7px;border-radius:4px;background:' + getEscColor(escMax) + '20;color:' + getEscColor(escMax) + '">Threat ' + escMin + '\u2013' + escMax + '</span></div>';
    // Summary paragraph
    if (phase.summary) {
      html += '<div class="pb-summary">' + phase.summary + '</div>';
    }
    // Milestone table grouped by day — faction-style rows
    if (msDays.length) {
      html += '<div class="pb-ms-table">';
      msDays.forEach(d => {
        const dMs = msByDay[d];
        const mdt = new Date(d + 'T12:00:00');
        const dayLabel = mdt.toLocaleDateString('en-US', {weekday:'short', month:'short', day:'numeric'});
        const dayNum = Math.floor((mdt - new Date('2026-02-28T12:00:00')) / 86400000) + 1;
        const isDaySel = d === selDay;
        html += '<div class="pb-ms-day' + (isDaySel ? ' pb-ms-day-sel' : '') + '" onclick="selectDay(\'' + d + '\')">';
        html += '<div class="pb-ms-day-header"><span class="pb-ms-date">' + dayLabel + '</span>' +
          (dayNum > 0 ? '<span class="pb-ms-daynum">Day ' + dayNum + '</span>' : '') + '</div>';
        html += '<div class="pb-ms-events">';
        dMs.forEach(ms => {
          const gi = MILESTONES.indexOf(ms);
          const isActive = selMilestoneIdx === gi;
          const hasGeo = ms.lat != null && ms.lng != null;
          html += '<div class="pb-ms-event' + (isActive ? ' pb-ms-event-active' : '') + (hasGeo ? ' pb-ms-geo' : '') + '" onclick="event.stopPropagation();selectMilestone(' + gi + ')"><span class="pb-ms-icon">' + ms.icon + '</span><span class="pb-ms-label">' + ms.label + '</span>' + (hasGeo ? '<span class="pb-ms-pin">\u{1F4CD}</span>' : '') + '</div>';
        });
        html += '</div></div>';
      });
      html += '</div>';
    }
    html += '</div>';
  });
  html += '</div>';

  container.innerHTML = html;
}

function highlightNews(idx) {
  highlightedNewsIdx = idx;
  const item = news[idx];
  if (item) {
    selDay = item.d;
    buildCal(); refresh(); drawMap(); updateTrend(); buildGantt();
    // Also highlight in news coverage panel
    setTimeout(() => {
      document.querySelectorAll('.ni').forEach(el => el.classList.remove('highlighted'));
      document.querySelectorAll('.ni').forEach(el => {
        if (el.querySelector('h3') && el.querySelector('h3').textContent === item.t) {
          el.classList.add('highlighted');
        }
      });
    }, 50);
  }
}
