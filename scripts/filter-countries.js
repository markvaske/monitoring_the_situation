// scripts/filter-countries.js
// Filters Natural Earth 10m countries GeoJSON to MTS project countries.
// Input:  src/countries-raw.geojson  (full Natural Earth 10m admin-0 countries)
// Output: src/countries.geojson      (44 project countries, tagged mts_type + faction)
//
// Usage: node scripts/filter-countries.js

const fs = require('fs');
const path = require('path');

// Map: MTS display name → Natural Earth ADMIN field
const ADMIN_MAP = {
  // Conflict countries
  'Turkey':                     'Turkey',
  'Syria':                      'Syria',
  'Iraq':                       'Iraq',
  'Iran':                       'Iran',
  'Saudi Arabia':               'Saudi Arabia',
  'UAE':                        'United Arab Emirates',
  'Oman':                       'Oman',
  'Qatar':                      'Qatar',
  'Bahrain':                    'Bahrain',
  'Kuwait':                     'Kuwait',
  'Jordan':                     'Jordan',
  'Israel':                     'Israel',
  'Lebanon':                    'Lebanon',
  'Egypt':                      'Egypt',
  'Yemen':                      'Yemen',
  'Pakistan':                   'Pakistan',
  'India':                      'India',
  // Context countries
  'Sudan':                      'Sudan',
  'Eritrea':                    'Eritrea',
  'Djibouti':                   'Djibouti',
  'Ethiopia':                   'Ethiopia',
  'Somalia':                    'Somalia',
  'Afghanistan':                'Afghanistan',
  'Turkmenistan':               'Turkmenistan',
  'Armenia':                    'Armenia',
  'Georgia':                    'Georgia',
  'Azerbaijan':                 'Azerbaijan',
  'Russia':                     'Russia',
  'Cyprus':                     'Cyprus',
  'Libya':                      'Libya',
  'Greece':                     'Greece',
  'Nepal':                      'Nepal',
  'Uzbekistan':                 'Uzbekistan',
  'Tajikistan':                 'Tajikistan',
  'Kenya':                      'Kenya',
  'Tanzania':                   'United Republic of Tanzania',
  'Chad':                       'Chad',
  'Niger':                      'Niger',
  'Sri Lanka':                  'Sri Lanka',
  'Myanmar':                    'Myanmar',
  'South Sudan':                'South Sudan',
  'Uganda':                     'Uganda',
  'Central African Republic':   'Central African Republic',
  'Kazakhstan':                 'Kazakhstan',
};

const CONFLICT_SET = new Set([
  'Turkey','Syria','Iraq','Iran','Saudi Arabia','UAE','Oman','Qatar',
  'Bahrain','Kuwait','Jordan','Israel','Lebanon','Egypt','Yemen','Pakistan','India'
]);

const FACTION_MAP = {
  'Iran':         'axis',
  'Israel':       'coalition',
  'Syria':        'axis',
  'Iraq':         'axis',
  'UAE':          'neutral',
  'Qatar':        'coalition',
  'Saudi Arabia': 'coalition',
  'Jordan':       'coalition',
  'Lebanon':      'axis',
  'Bahrain':      'coalition',
  'Kuwait':       'neutral',
  'Oman':         'neutral',
  'Egypt':        'neutral',
  'Turkey':       'neutral',
  'Yemen':        'axis',
  'Pakistan':     'neutral',
  'India':        'neutral',
};

// Build reverse lookup: NE ADMIN name → MTS display name
const adminToMts = {};
for (const [mtsName, adminName] of Object.entries(ADMIN_MAP)) {
  adminToMts[adminName] = mtsName;
}

const rawPath = path.join(__dirname, '../src/countries-raw.geojson');
if (!fs.existsSync(rawPath)) {
  console.error('ERROR: src/countries-raw.geojson not found.');
  console.error('Place the Natural Earth 10m GeoJSON at src/countries-raw.geojson first.');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
const features = [];
const matched = new Set();

for (const feature of raw.features) {
  // Natural Earth uses ADMIN in uppercase properties
  const admin = feature.properties.ADMIN
    || feature.properties.admin
    || feature.properties.name
    || feature.properties.NAME;
  const mtsName = adminToMts[admin];
  if (!mtsName) continue;

  matched.add(mtsName);
  const isConflict = CONFLICT_SET.has(mtsName);

  // Replace all NE properties with minimal MTS properties only
  feature.properties = {
    mts_name: mtsName,
    mts_type: isConflict ? 'conflict' : 'ctx',
    faction:  FACTION_MAP[mtsName] || 'neutral',
  };
  features.push(feature);
}

const out = { type: 'FeatureCollection', features };
fs.writeFileSync(
  path.join(__dirname, '../src/countries.geojson'),
  JSON.stringify(out)
);

console.log(`Done: ${features.length} features written to src/countries.geojson`);

const missing = Object.keys(ADMIN_MAP).filter(n => !matched.has(n));
if (missing.length) {
  console.warn('\nWARNING — these countries were not matched (check NE ADMIN names):');
  missing.forEach(n => console.warn('  ' + n + ' → looking for: ' + ADMIN_MAP[n]));
} else {
  console.log('All 44 countries matched successfully.');
}
