// ============================================================
// constants.js — Group Design Module
// ============================================================

export const STRUCTURE_TYPES = [
  { value: 'highway', label: 'Highway' },
  { value: 'other',   label: 'Other'   },
];

export const FOOTPATH_OPTIONS = [
  { value: 'none',   label: 'None'         },
  { value: 'single', label: 'Single-sided' },
  { value: 'both',   label: 'Both'         },
];

export const STEEL_GRADES = [
  { value: 'E250', label: 'E250' },
  { value: 'E350', label: 'E350' },
  { value: 'E450', label: 'E450' },
];

export const CONCRETE_GRADES = [
  { value: 'M25', label: 'M25' },
  { value: 'M30', label: 'M30' },
  { value: 'M35', label: 'M35' },
  { value: 'M40', label: 'M40' },
  { value: 'M45', label: 'M45' },
  { value: 'M50', label: 'M50' },
  { value: 'M55', label: 'M55' },
  { value: 'M60', label: 'M60' },
];

// ---------------------------------------------------------------
// Option B — 5 hardcoded cities with IRC 6 (2017) values.
// These appear directly in the Project Location dropdown.
// windSpeed: m/s | seismicZone | zoneFactor | temps: °C
// ---------------------------------------------------------------
export const CITY_IRC_DATA = {
  Mumbai: {
    state: 'Maharashtra',
    windSpeed: 44,
    seismicZone: 'III',
    zoneFactor: 0.16,
    shadeAirTempMax: 45,
    shadeAirTempMin: 8,
  },
  Delhi: {
    state: 'Delhi',
    windSpeed: 47,
    seismicZone: 'IV',
    zoneFactor: 0.24,
    shadeAirTempMax: 48,
    shadeAirTempMin: 0,
  },
  Chennai: {
    state: 'Tamil Nadu',
    windSpeed: 50,
    seismicZone: 'II',
    zoneFactor: 0.10,
    shadeAirTempMax: 44,
    shadeAirTempMin: 16,
  },
  Kolkata: {
    state: 'West Bengal',
    windSpeed: 50,
    seismicZone: 'III',
    zoneFactor: 0.16,
    shadeAirTempMax: 45,
    shadeAirTempMin: 8,
  },
  Bangalore: {
    state: 'Karnataka',
    windSpeed: 33,
    seismicZone: 'II',
    zoneFactor: 0.10,
    shadeAirTempMax: 38,
    shadeAirTempMin: 8,
  },
};

// Flat list for the dropdown — order matches spec examples
export const CITY_OPTIONS = Object.keys(CITY_IRC_DATA);

export const GEOMETRIC_LIMITS = {
  span:        { min: 20,   max: 45  },   // metres
  carriageway: { min: 4.25, max: 24  },   // metres  (must be < 24)
  skewAngle:   { min: -15,  max: 15  },   // degrees
};

export const ADDITIONAL_GEOMETRY_DEFAULTS = {
  girderSpacing:    2.5,
  numberOfGirders:  4,
  deckOverhangWidth: 0.5,
};

export const TABS = {
  BASIC:      'basic',
  ADDITIONAL: 'additional',
};