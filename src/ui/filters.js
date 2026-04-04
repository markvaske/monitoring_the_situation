// ===== MTS FILTERS =====
// Country/faction filter helpers

function sideCountries(side) {
  // 'US/Qatar' → ['USA','Qatar'], 'Iran' → ['Iran']
  return side.split('/').map(s => SIDE_TO_COUNTRY[s.trim()] || s.trim());
}
// Canonical name for a country (handles short aliases)
function canonCo(co) { return SIDE_TO_COUNTRY[co] || co; }
function itemMatchesCo(side) {
  if (!selCo.size && !selFactions.size) return true;
  const countries = sideCountries(side);
  // Direct match: any selected country matches
  if (selCo.size && countries.some(c => selCo.has(c))) return true;
  // Short-name match
  if (selCo.size) {
    for (const sc of selCo) {
      const canon = canonCo(sc);
      if (countries.includes(canon)) return true;
      if (canon !== sc && countries.includes(sc)) return true;
    }
  }
  // Faction match
  if (selFactions.size) {
    return countries.some(c => {
      const cf = countryFaction[c];
      return cf && selFactions.has(cf.faction);
    });
  }
  return false;
}
function newsMatchesCo(tags) {
  if (!selCo.size && !selFactions.size) return true;
  // Country match
  if (selCo.size) {
    for (const sc of selCo) {
      if (tags.includes(sc)) return true;
      const canon = canonCo(sc);
      if (canon !== sc && tags.includes(canon)) return true;
    }
  }
  // Faction match
  if (selFactions.size) {
    return tags.some(t => {
      const key = canonCo(t);
      const fi = countryFaction[key] || countryFaction[t];
      return fi && selFactions.has(fi.faction);
    });
  }
  return false;
}
// Check if a specific country is in the active filter
function isCoSelected(co) {
  if (!selCo.size && !selFactions.size) return false;
  if (selCo.has(co)) return true;
  const canon = canonCo(co);
  if (selCo.has(canon)) return true;
  if (selFactions.size) {
    const fi = countryFaction[co] || countryFaction[canon];
    return fi && selFactions.has(fi.faction);
  }
  return false;
}
// Check if any filter is active
function hasFilter() { return selCo.size > 0 || selFactions.size > 0; }
// Check if a country passes the filter (for map items with .co field)
function coPassesFilter(co) {
  if (!hasFilter()) return true;
  return isCoSelected(co);
}
