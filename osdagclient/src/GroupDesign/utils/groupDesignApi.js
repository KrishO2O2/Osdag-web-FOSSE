// ============================================================
// groupDesignApi.js — Group Design Module
// All API calls to the Django backend.
// 4 endpoints matching views.py exactly.
// ============================================================

const BASE_URL = 'http://localhost:8000/api/group-design';

// Helper — throws a descriptive error on non-2xx responses
async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.error || err.detail || JSON.stringify(err) || `Server error: ${res.status}`
    );
  }
  return res.json();
}

/**
 * GET /api/group-design/master-data/
 * Returns all static dropdown options the frontend needs.
 */
export async function fetchMasterData() {
  const res = await fetch(`${BASE_URL}/master-data/`);
  return handleResponse(res);
}

/**
 * GET /api/group-design/location/?city=Mumbai
 * Returns IRC 6 (2017) values for the selected city.
 */
export async function fetchLocationData(city) {
  const params = new URLSearchParams({ city });
  const res = await fetch(`${BASE_URL}/location/?${params}`);
  return handleResponse(res);
}

/**
 * POST /api/group-design/check-geometry/
 * Validates interdependent Additional Geometry fields server-side.
 */
export async function checkGeometry({ carriageway_width, girder_spacing, number_of_girders, deck_overhang_width }) {
  const res = await fetch(`${BASE_URL}/check-geometry/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      carriageway_width,
      girder_spacing,
      number_of_girders,
      deck_overhang_width,
    }),
  });
  return handleResponse(res);
}

/**
 * POST /api/group-design/submit/
 * Submits the full validated form to the backend.
 * Builds the exact JSON payload the backend expects.
 */
export async function submitGroupDesign(formState, locationMode, locationIrcData) {
  const payload = buildPayload(formState, locationMode, locationIrcData);
  const res = await fetch(`${BASE_URL}/submit/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/**
 * Builds the exact JSON structure the backend serializer expects.
 * Exported separately so it can be unit-tested independently.
 *
 * @param {object} formState     - React form state from useFormState
 * @param {string} locationMode  - 'lookup' | 'custom' | null
 * @param {object} locationIrcData - IRC values from whichever mode is active
 */
export function buildPayload(formState, locationMode, locationIrcData) {
  const {
    structureType,
    locationName,
    span,
    carriageway,
    footpath,
    skewAngle,
    girderSpacing,
    numberOfGirders,
    deckOverhangWidth,
    girder,
    crossBracing,
    deck,
  } = formState;

  // Build project_location based on active mode
  let projectLocation;

  if (locationMode === 'lookup') {
    projectLocation = {
      mode: 'location_lookup',
      city: locationName,
    };
  } else if (locationMode === 'custom' && locationIrcData) {
    projectLocation = {
      mode:               'custom_loading',
      wind_speed:         Number(locationIrcData.windSpeed),
      seismic_zone:       locationIrcData.seismicZone,
      zone_factor:        Number(locationIrcData.zoneFactor),
      shade_air_temp_max: Number(locationIrcData.shadeAirTempMax),
      shade_air_temp_min: Number(locationIrcData.shadeAirTempMin),
    };
  } else {
    projectLocation = { mode: 'location_lookup', city: '' };
  }

  return {
    structure_type: structureType,

    project_location: projectLocation,

    geometric_inputs: {
      span:                Number(span),
      carriageway_width:   Number(carriageway),
      footpath:            footpath,
      skew_angle:          Number(skewAngle),
      girder_spacing:      Number(girderSpacing),
      number_of_girders:   Number(numberOfGirders),
      deck_overhang_width: Number(deckOverhangWidth),
    },

    material_inputs: {
      girder_steel:        girder,
      cross_bracing_steel: crossBracing,
      deck_concrete:       deck,
    },
  };
}