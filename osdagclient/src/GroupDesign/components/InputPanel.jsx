import React from "react";
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
    states,
    districts,
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
    onStateChange,
    onDistrictChange,
    checkGeometry,
    submit,
  } = useGroupDesign();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submit();
  };

  if (loadingMaster) return <div className="gd-tab-content">Loading master data...</div>;

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
          <select className="gd-select" value={form.structure_type} onChange={(e) => setField("structure_type", e.target.value)}>
            {(masterData.structure_types || []).map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="gd-section">
        <div className="gd-section-title">Project Location</div>

        {(masterData.location_modes || []).map((m) => (
          <label key={m.value} className="gd-checkbox-label">
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

        {/* NEW: State dropdown */}
        <div className="gd-field" style={{ marginTop: 8 }}>
          <label className="gd-label">State</label>
          <select
            className="gd-select"
            value={form.state}
            onChange={(e) => onStateChange(e.target.value)}
            disabled={!isLookupMode}
          >
            <option value="">Select state</option>
            {(states || []).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* NEW: District dropdown */}
        <div className="gd-field">
          <label className="gd-label">District</label>
          <select
            className="gd-select"
            value={form.district}
            onChange={(e) => onDistrictChange(e.target.value)}
            disabled={!isLookupMode || !form.state || loadingLocation}
          >
            <option value="">{loadingLocation ? "Loading districts..." : "Select district"}</option>
            {(districts || []).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <ErrorText msg={pick(submitErrors, ["project_location", "city"])} label="District" />
        </div>

        <div className="gd-field">
          <label className="gd-label">Wind Speed</label>
          <input className="gd-input" value={form.wind_speed} onChange={(e) => setField("wind_speed", e.target.value)} disabled={isLookupMode} />
        </div>
        <div className="gd-field">
          <label className="gd-label">Seismic Zone</label>
          <input className="gd-input" value={form.seismic_zone} onChange={(e) => setField("seismic_zone", e.target.value)} disabled={isLookupMode} />
        </div>
        <div className="gd-field">
          <label className="gd-label">Zone Factor</label>
          <input className="gd-input" value={form.zone_factor} onChange={(e) => setField("zone_factor", e.target.value)} disabled={isLookupMode} />
        </div>
        <div className="gd-field">
          <label className="gd-label">Shade Air Temp Max</label>
          <input className="gd-input" value={form.shade_air_temp_max} onChange={(e) => setField("shade_air_temp_max", e.target.value)} disabled={isLookupMode} />
        </div>
        <div className="gd-field">
          <label className="gd-label">Shade Air Temp Min</label>
          <input className="gd-input" value={form.shade_air_temp_min} onChange={(e) => setField("shade_air_temp_min", e.target.value)} disabled={isLookupMode} />
        </div>
      </div>

      <div className="gd-section">
        <div className="gd-section-title">Geometric Inputs</div>
        <div className="gd-field">
          <label className="gd-label">Span (m)</label>
          <input className="gd-input" value={form.span} onChange={(e) => setField("span", e.target.value)} />
        </div>
        <div className="gd-field">
          <label className="gd-label">Carriageway Width (m)</label>
          <input className="gd-input" value={form.carriageway_width} onChange={(e) => setField("carriageway_width", e.target.value)} />
        </div>
        <div className="gd-field">
          <label className="gd-label">Footpath</label>
          <select className="gd-select" value={form.footpath} onChange={(e) => setField("footpath", e.target.value)}>
            {(masterData.footpath_options || []).map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
        <div className="gd-field">
          <label className="gd-label">Skew Angle (°)</label>
          <input className="gd-input" value={form.skew_angle} onChange={(e) => setField("skew_angle", e.target.value)} />
        </div>
      </div>

      <div className="gd-section">
        <div className="gd-section-header-row">
          <div className="gd-section-title">Modify Additional Geometry</div>
          <button type="button" className="gd-btn gd-btn-sm gd-btn-yellow" onClick={checkGeometry} disabled={checkingGeometry}>
            {checkingGeometry ? "Checking..." : "Check Geometry"}
          </button>
        </div>

        <div className="gd-field">
          <label className="gd-label">Girder Spacing (m)</label>
          <input className="gd-input" value={form.girder_spacing} onChange={(e) => setField("girder_spacing", e.target.value)} />
          <ErrorText msg={first(geometryErrors.girder_spacing)} label="Girder Spacing" />
        </div>

        <div className="gd-field">
          <label className="gd-label">Number of Girders</label>
          <input className="gd-input" value={form.number_of_girders} onChange={(e) => setField("number_of_girders", e.target.value)} />
          <ErrorText msg={first(geometryErrors.number_of_girders)} label="Number of Girders" />
        </div>

        <div className="gd-field">
          <label className="gd-label">Deck Overhang Width (m)</label>
          <input className="gd-input" value={form.deck_overhang_width} onChange={(e) => setField("deck_overhang_width", e.target.value)} />
          <ErrorText msg={first(geometryErrors.deck_overhang_width)} label="Deck Overhang Width" />
        </div>

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
        </div>
        <div className="gd-field">
          <label className="gd-label">Cross Bracing Steel</label>
          <select className="gd-select" value={form.cross_bracing_steel} onChange={(e) => setField("cross_bracing_steel", e.target.value)}>
            <option value="">Select</option>
            {(masterData.steel_grades || []).map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="gd-field">
          <label className="gd-label">Deck Concrete</label>
          <select className="gd-select" value={form.deck_concrete} onChange={(e) => setField("deck_concrete", e.target.value)}>
            <option value="">Select</option>
            {(masterData.concrete_grades || []).map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      <button type="submit" className="gd-btn gd-btn-green" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit"}
      </button>

      {submitResult?.success && (
        <div className="gd-modal-info" style={{ marginTop: 10 }}>
          {submitResult.message || "Submitted successfully."}
        </div>
      )}
    </form>
  );
}