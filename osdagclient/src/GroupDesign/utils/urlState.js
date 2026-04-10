// ============================================================
// urlState.js — Group Design Module
// Serialize form state → URL params and back.
// No external dependencies. Works with your exact gd.form
// field names. Called on mount to hydrate, and on copy click.
// ============================================================

// Fields to include in the URL — omit sensitive/internal ones
const URL_FIELDS = [
    "structure_type",
    "mode",
    "state",
    "district",
    "city",
    "wind_speed",
    "seismic_zone",
    "zone_factor",
    "shade_air_temp_max",
    "shade_air_temp_min",
    "span",
    "carriageway_width",
    "footpath",
    "skew_angle",
    "girder_spacing",
    "number_of_girders",
    "deck_overhang_width",
    "girder_steel",
    "cross_bracing_steel",
    "deck_concrete",
  ];
  
  /**
   * Reads the current URL search params and returns a partial
   * form state object. Only includes keys that are present in
   * the URL — caller merges with defaults.
   */
  export function readStateFromURL() {
    const params = new URLSearchParams(window.location.search);
    const partial = {};
    for (const key of URL_FIELDS) {
      if (params.has(key)) {
        partial[key] = params.get(key);
      }
    }
    return partial;
  }
  
  /**
   * Returns true if the URL contains any of our state params.
   * Use this to decide whether to show a "Loaded from shared link" banner.
   */
  export function urlHasState() {
    const params = new URLSearchParams(window.location.search);
    return URL_FIELDS.some((k) => params.has(k));
  }
  
  /**
   * Builds a shareable URL from the current form state.
   * Omits empty/default values to keep the URL short.
   */
  export function buildShareURL(form) {
    const params = new URLSearchParams();
    for (const key of URL_FIELDS) {
      const val = form[key];
      if (val !== undefined && val !== null && val !== "") {
        params.set(key, String(val));
      }
    }
    const { origin, pathname } = window.location;
    return `${origin}${pathname}?${params.toString()}`;
  }
  
  /**
   * Copies the shareable URL to the clipboard.
   * Returns a promise that resolves to true on success.
   */
  export async function copyShareURL(form) {
    const url = buildShareURL(form);
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      return true;
    }
  }
  
  /**
   * Clears all our state params from the URL without a page
   * reload. Call this after Reset Form.
   */
  export function clearURLState() {
    const params = new URLSearchParams(window.location.search);
    for (const key of URL_FIELDS) {
      params.delete(key);
    }
    const newSearch = params.toString();
    const newURL = newSearch
      ? `${window.location.pathname}?${newSearch}`
      : window.location.pathname;
    window.history.replaceState({}, "", newURL);
  }