// ===== MTS INIT =====
// App initialization, event wiring, toggleFilters

function toggleFilters() {
  filtersOpen = !filtersOpen;
  document.querySelector('.top-row').classList.toggle('open', filtersOpen);
  document.getElementById('filterBtn').classList.toggle('active', filtersOpen);
  if (filtersOpen) { if (peoplePopupOpen) togglePeoplePopup(); setTimeout(() => { drawCasualtyChart(); drawDisplacementChart(); drawOilPriceChart(); drawShippingChart(); drawFlightChart(); drawGoldChart(); drawInsuranceChart(); drawNotamChart(); }, 30); }
}

// ===== GLOBAL KEYBOARD + CLICK LISTENERS =====
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && filtersOpen) toggleFilters();
  if (e.key === 'Escape' && calPopupOpen) toggleCalPopup();
  if (e.key === 'Escape' && peoplePopupOpen) togglePeoplePopup();
});

document.addEventListener('click', e => {
  if (calPopupOpen && !document.getElementById('calPopupBtn').contains(e.target)) toggleCalPopup();
  if (peoplePopupOpen && !document.getElementById('peoplePopupBtn').contains(e.target) && !document.getElementById('peopleOverlay').contains(e.target)) togglePeoplePopup();
});

// ===== INIT =====
DataStore.ready.then(() => {
  // Initialize selDay now that days[] is available
  selDay = days[days.length - 1];

  drawLegendSwatches();
  renderParties();
  buildCal();
  selectDay(days[days.length - 1]);
  renderCountryDetail();
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => {
    drawMap(); buildGantt();
    if (filtersOpen) { drawCasualtyChart(); drawDisplacementChart(); drawOilPriceChart(); drawShippingChart(); drawFlightChart(); drawGoldChart(); drawInsuranceChart(); drawNotamChart(); }
  }, 80); });
});
