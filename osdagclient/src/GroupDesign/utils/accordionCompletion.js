export function isLocationComplete(form) {
    const mode = form?.mode || form?.location_mode; // support both
    if (!mode) return false;
  
    if (mode === "location_lookup") {
      // In lookup mode, state + district/city is enough
      return Boolean(form?.state) && Boolean(form?.district || form?.city || form?.location_name);
    }
  
    if (mode === "custom_loading") {
      // In custom mode, these fields must be filled
      return (
        String(form?.wind_speed ?? "").trim() !== "" &&
        String(form?.seismic_zone ?? "").trim() !== "" &&
        String(form?.zone_factor ?? "").trim() !== "" &&
        String(form?.shade_air_temp_max ?? "").trim() !== "" &&
        String(form?.shade_air_temp_min ?? "").trim() !== ""
      );
    }
  
    return false;
  }
  
  export function isGeometryComplete(form) {
    const span = parseFloat(form?.span);
    const cw = parseFloat(form?.carriageway_width);
    const skew = parseFloat(form?.skew_angle);
  
    return (
      !Number.isNaN(span) && span >= 20 && span <= 45 &&
      !Number.isNaN(cw) && cw >= 4.25 && cw < 24 &&
      !Number.isNaN(skew) && skew >= -15 && skew <= 15
    );
  }
  
  export function isAdditionalGeometryComplete(form, geometryResult) {
    if (geometryResult?.valid === true) return true;
  
    return (
      String(form?.girder_spacing ?? "").trim() !== "" &&
      String(form?.number_of_girders ?? "").trim() !== "" &&
      String(form?.deck_overhang_width ?? "").trim() !== ""
    );
  }
  
  export function isMaterialComplete(form) {
    return (
      Boolean(form?.girder_steel) &&
      Boolean(form?.cross_bracing_steel) &&
      Boolean(form?.deck_concrete)
    );
  }