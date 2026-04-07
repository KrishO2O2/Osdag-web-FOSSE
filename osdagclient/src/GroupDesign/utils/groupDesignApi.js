// ============================================================
// groupDesignApi.js — Group Design Module
// All API calls to the Django backend at localhost:8000
// ============================================================

const BASE_URL = 'http://localhost:8000';

/**
 * Submits the Group Design basic inputs to the Django backend.
 * @param {object} payload - The form data to submit
 * @returns {Promise<object>} - The JSON response from the server
 */
export async function submitGroupDesign(payload) {
  const response = await fetch(`${BASE_URL}/api/group-design/calculate/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Server error: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetches location-based IRC data (wind speed, seismic zone, temperature)
 * from the backend given a state and district.
 * @param {string} state
 * @param {string} district
 * @returns {Promise<object>} - { windSpeed, seismicZone, zoneFactor, shadeAirTemp }
 */
export async function fetchLocationData(state, district) {
  const params = new URLSearchParams({ state, district });
  const response = await fetch(`${BASE_URL}/api/group-design/location/?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Could not fetch location data: ${response.status}`);
  }

  return response.json();
}