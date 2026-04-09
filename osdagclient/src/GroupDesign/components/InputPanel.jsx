import React, { useEffect } from "react";
import useGroupDesign from "../hooks/useGroupDesign";

function first(v) {
  if (!v) return "";
  if (Array.isArray(v)) return v[0];
  if (typeof v === "string") return v;
  return "";
}

function pick(obj, path) {
  let cur = obj;
  for (const p of path) {
    if (!cur || typeof cur !== "object") return "";
    cur = cur[p];
  }
  return first(cur);
}

function friendly(msg, fieldLabel = "") {
  if (!msg) return "";
  const m = String(msg).trim();
  if (m === "This field may not be null.") return `${fieldLabel || "This field"} is required.`;
  if (m === "This field is required.") return `${fieldLabel || "This field"} is required.`;
  return m;
}

function ErrorText({ msg, label }) {
  const t = friendly(msg, label);
  if (!t) return null;
  return <div className="gd-error">{t}</div>;
}

export default function InputPanel() {
  const {
    form,
    masterData,
    loadingMaster,
    loadingLocation,
    checkingGeometry,
    submitting,
    submitErrors,
    geometryErrors,
    globalErrors,
    geometryResult,
    submitResult,
    isLookupMode,
    setField,
    setMode,
    fetchLocation,
    checkGeometry,
    submit,
  } = useGroupDesign();

  useEffect(() => {
    if (isLookupMode && form.city) fetchLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.city, isLookupMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submit();
  };

  if (loadingMaster) {
    return <div className="gd-tab-content">Loading master data...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="gd-tab-content">
      {globalErrors?.map((g, i) => (
        <div key={i} className="gd-error" style={{ marginBottom: 8 }}>
          {friendly(g)}
        </div>
      ))}

      <div className="gd-section">
        <div className="gd-section-title">Type of Structure</div>
        <div className="gd-field">
          <label className="gd-label">Structure Type</label>
          <select
            className="gd-select"
            value={form.structure_type}
            onChange={(e) => setField("structure_type", e.target.value)}
          >
            {(masterData.structure_types || []).map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <ErrorText msg={pick(submitErrors, ["structure_type"])} label="Structure Type" />
        </div>
      </div>

      <div className="gd-section">
        <div className="gd-section-title">Project Location</div>

        <div className="gd-location-mode-row" style={{ marginBottom: 10 }}>
          {(masterData.location_modes || []).map((m) => (
            <label key={m.value} className="gd-checkbox-label" style={{ marginBottom: 6 }}>
              <input
                className="gd-checkbox"
                type="radio"
                name="location_mode"
                checked={form.mode === m.value}
                onChange={() => setMode(m.value)}
              />
              {m.label}
            </label>
          ))}
        </div>

        <div className="gd-field">
          <label className="gd-label">City</label>
          <div className="gd-location-row">
            <select
              className="gd-select"
              value={form.city}
              onChange={(e) => setField("city", e.target.value)}
              disabled={!isLookupMode}
            >
              <option value="">Select city</option>
              {(masterData.cities || []).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="gd-btn gd-btn-sm gd-btn-orange"
              onClick={fetchLocation}
              disabled={!isLookupMode || !form.city || loadingLocation}
            >
              {loadingLocation ? "Fetching..." : "Fetch"}
            </button>
          </div>
          <ErrorText msg={pick(submitErrors, ["project_location", "city"])} label="City" />
        </div>

        <div className="gd-field">
          <label className="gd-label">Wind Speed</label>
          <input
            className="gd-input"
            value={form.wind_speed}
            onChange={(e) => setField("wind_speed", e.target.value)}
            disabled={isLookupMode}
            placeholder={isLookupMode ? "Auto-filled from city" : "Enter wind speed"}
          />
          <ErrorText msg={pick(submitErrors, ["project_location", "wind_speed"])} label="Wind Speed" />
        </div>

        <div className="gd-field">
          <label className="gd-label">Seismic Zone</label>
          <input
            className="gd-input"
            value={form.seismic_zone}
            onChange={(e) => setField("seismic_zone", e.target.value)}
            disabled={isLookupMode}
            placeholder={isLookupMode ? "Auto-filled from city" : "e.g., III"}
          />
          <ErrorText msg={pick(submitErrors, ["project_location", "seismic_zone"])} label="Seismic Zone" />
        </div>

        <div className="gd-field">
          <label className="gd-label">Zone Factor</label>
          <input
            className="gd-input"
            value={form.zone_factor}
            onChange={(e) => setField("zone_factor", e.target.value)}
            disabled={isLookupMode}
            placeholder={isLookupMode ? "Auto-filled from city" : "Enter zone factor"}
          />
          <ErrorText msg={pick(submitErrors, ["project_location", "zone_factor"])} label="Zone Factor" />
        </div>

        <div className="gd-field">
          <label className="gd-label">Shade Air Temp Max</label>
          <input
            className="gd-input"
            value={form.shade_air_temp_max}
            onChange={(e) => setField("shade_air_temp_max", e.target.value)}
            disabled={isLookupMode}
            placeholder={isLookupMode ? "Auto-filled from city" : "Enter max temperature"}
          />
          <ErrorText msg={pick(submitErrors, ["project_location", "shade_air_temp_max"])} label="Shade Air Temp Max" />
        </div>

        <div className="gd-field">
          <label className="gd-label">Shade Air Temp Min</label>
          <input
            className="gd-input"
            value={form.shade_air_temp_min}
            onChange={(e) => setField("shade_air_temp_min", e.target.value)}
            disabled={isLookupMode}
            placeholder={isLookupMode ? "Auto-filled from city" : "Enter min temperature"}
          />
          <ErrorText msg={pick(submitErrors, ["project_location", "shade_air_temp_min"])} label="Shade Air Temp Min" />
        </div>
      </div>

      <div className="gd-section">
        <div className="gd-section-title">Geometric Inputs</div>

        <div className="gd-field">
          <label className="gd-label">Span (m)</label>
          <input className="gd-input" value={form.span} onChange={(e) => setField("span", e.target.value)} />
          <ErrorText msg={pick(submitErrors, ["geometric_inputs", "span"])} label="Span" />
        </div>

        <div className="gd-field">
          <label className="gd-label">Carriageway Width (m)</label>
          <input className="gd-input" value={form.carriageway_width} onChange={(e) => setField("carriageway_width", e.target.value)} />
          <ErrorText msg={pick(submitErrors, ["geometric_inputs", "carriageway_width"])} label="Carriageway Width" />
        </div>

        <div className="gd-field">
          <label className="gd-label">Footpath</label>
          <select className="gd-select" value={form.footpath} onChange={(e) => setField("footpath", e.target.value)}>
            {(masterData.footpath_options || []).map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <ErrorText msg={pick(submitErrors, ["geometric_inputs", "footpath"])} label="Footpath" />
        </div>

        <div className="gd-field">
          <label className="gd-label">Skew Angle (°)</label>
          <input className="gd-input" value={form.skew_angle} onChange={(e) => setField("skew_angle", e.target.value)} />
          <ErrorText msg={pick(submitErrors, ["geometric_inputs", "skew_angle"])} label="Skew Angle" />
        </div>
      </div>

      <div className="gd-section">
        <div className="gd-section-header-row">
          <div className="gd-section-title">Modify Additional Geometry</div>
          <button
            type="button"
            className="gd-btn gd-btn-sm gd-btn-yellow"
            onClick={checkGeometry}
            disabled={checkingGeometry}
          >
            {checkingGeometry ? "Checking..." : "Check Geometry"}
          </button>
        </div>

        <div className="gd-field">
          <label className="gd-label">Girder Spacing (m)</label>
          <input className="gd-input" value={form.girder_spacing} onChange={(e) => setField("girder_spacing", e.target.value)} />
          <ErrorText
            msg={first(geometryErrors.girder_spacing) || pick(submitErrors, ["geometric_inputs", "girder_spacing"])}
            label="Girder Spacing"
          />
        </div>

        <div className="gd-field">
          <label className="gd-label">Number of Girders</label>
          <input className="gd-input" value={form.number_of_girders} onChange={(e) => setField("number_of_girders", e.target.value)} />
          <ErrorText
            msg={first(geometryErrors.number_of_girders) || pick(submitErrors, ["geometric_inputs", "number_of_girders"])}
            label="Number of Girders"
          />
        </div>

        <div className="gd-field">
          <label className="gd-label">Deck Overhang Width (m)</label>
          <input className="gd-input" value={form.deck_overhang_width} onChange={(e) => setField("deck_overhang_width", e.target.value)} />
          <ErrorText
            msg={first(geometryErrors.deck_overhang_width) || pick(submitErrors, ["geometric_inputs", "deck_overhang_width"])}
            label="Deck Overhang Width"
          />
        </div>

        <ErrorText msg={first(geometryErrors.non_field_errors)} />
        {geometryResult?.formula_check && (
          <div className="gd-modal-note">{geometryResult.formula_check}</div>
        )}
      </div>

      <div className="gd-section">
        <div className="gd-section-title">Material Inputs</div>

        <div className="gd-field">
          <label className="gd-label">Girder Steel</label>
          <select className="gd-select" value={form.girder_steel} onChange={(e) => setField("girder_steel", e.target.value)}>
            <option value="">Select</option>
            {(masterData.steel_grades || []).map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <ErrorText msg={pick(submitErrors, ["material_inputs", "girder_steel"])} label="Girder Steel" />
        </div>

        <div className="gd-field">
          <label className="gd-label">Cross Bracing Steel</label>
          <select className="gd-select" value={form.cross_bracing_steel} onChange={(e) => setField("cross_bracing_steel", e.target.value)}>
            <option value="">Select</option>
            {(masterData.steel_grades || []).map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <ErrorText msg={pick(submitErrors, ["material_inputs", "cross_bracing_steel"])} label="Cross Bracing Steel" />
        </div>

        <div className="gd-field">
          <label className="gd-label">Deck Concrete</label>
          <select className="gd-select" value={form.deck_concrete} onChange={(e) => setField("deck_concrete", e.target.value)}>
            <option value="">Select</option>
            {(masterData.concrete_grades || []).map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <ErrorText msg={pick(submitErrors, ["material_inputs", "deck_concrete"])} label="Deck Concrete" />
        </div>
      </div>

      <button type="submit" className="gd-btn gd-btn-green" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit"}
      </button>

      {submitResult?.success && (
        <div className="gd-modal-info" style={{ marginTop: 10 }}>
          {submitResult.message || "Group Design inputs validated successfully."}
        </div>
      )}
    </form>
  );
}