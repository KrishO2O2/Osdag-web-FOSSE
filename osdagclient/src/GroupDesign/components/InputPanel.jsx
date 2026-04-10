import React, { useEffect, useMemo, useRef, useState } from "react";
import { useReportDownload } from "../hooks/useReportDownload";
import { useURLState } from "../hooks/useURLState";
import Accordion from "./Accordion";
import {
  isLocationComplete,
  isGeometryComplete,
  isAdditionalGeometryComplete,
  isMaterialComplete,
} from "../utils/accordionCompletion";

const ACCORDION_STORAGE_KEY = "gd_accordion_open_state_v1";

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
  if (m === "This field may not be null." || m === "This field is required.") {
    return `${fieldLabel || "This field"} is required.`;
  }
  if (m.includes('"" is not a valid choice')) {
    return `${fieldLabel || "This field"} is required.`;
  }
  return m;
}

function ErrorText({ msg, label }) {
  const t = friendly(msg, label);
  if (!t) return null;
  return <div className="gd-error">{t}</div>;
}

function getInitialAccordionState() {
  const fallback = {
    location: true,
    geometry: false,
    material: false,
  };

  try {
    const raw = localStorage.getItem(ACCORDION_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      location: Boolean(parsed?.location),
      geometry: Boolean(parsed?.geometry),
      material: Boolean(parsed?.material),
    };
  } catch {
    return fallback;
  }
}

function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null;

  return (
    <div className="gd-modal-backdrop" onClick={onClose}>
      <div
        className="gd-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="gd-modal-header">
          <div className="gd-modal-title">{title}</div>
          <button type="button" className="gd-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="gd-modal-body">{children}</div>

        {footer ? <div className="gd-modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}

function SummaryItem({ label, value, green = false }) {
  return (
    <div className="gd-summary-item">
      <div className="gd-summary-label">{label}</div>
      <div className={`gd-summary-value ${green ? "is-green" : ""}`}>
        {value !== "" && value !== null && value !== undefined ? String(value) : "—"}
      </div>
    </div>
  );
}

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

const round1 = (n) => Number(n.toFixed(1));

export default function InputPanel({ gd }) {
  const { generateReport, generating, error: reportError } = useReportDownload();

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
    isCustomMode,
    setField,
    setMode,
    onStateChange,
    onDistrictChange,
    checkGeometry,
    submit,
    resetForm,
    loadSampleData,
  } = gd;

  const {
    loadedFromURL,
    copied,
    handleCopyShareURL,
    handleClearURLState,
  } = useURLState(setField, setMode);

  const canDownloadReport = submitResult?.success === true || geometryResult != null;

  const locationDone = isLocationComplete(form);
  const geometryDone = isGeometryComplete(form);
  const additionalDone = isAdditionalGeometryComplete(form, geometryResult);
  const materialDone = isMaterialComplete(form);

  const completionCount = useMemo(() => {
    return [locationDone, geometryDone, additionalDone, materialDone].filter(Boolean).length;
  }, [locationDone, geometryDone, additionalDone, materialDone]);

  const [openMap, setOpenMap] = useState(getInitialAccordionState);
  const [activeTab, setActiveTab] = useState("basic");
  const [showCustomLoadingModal, setShowCustomLoadingModal] = useState(false);
  const [showGeometryModal, setShowGeometryModal] = useState(false);

  const isOtherStructure = String(form.structure_type).toLowerCase() === "other";

  const toggleAccordion = (id) => {
    if (isOtherStructure) return;
    setOpenMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    try {
      localStorage.setItem(ACCORDION_STORAGE_KEY, JSON.stringify(openMap));
    } catch {
      // ignore
    }
  }, [openMap]);

  const prevRef = useRef({
    locationDone: false,
    geometryDone: false,
    additionalDone: false,
  });

  useEffect(() => {
    setOpenMap((prev) => {
      let next = prev;
      let changed = false;

      if (locationDone && !prevRef.current.locationDone && !prev.geometry) {
        next = { ...next, geometry: true };
        changed = true;
      }

      if (additionalDone && !prevRef.current.additionalDone && !prev.material) {
        next = { ...next, material: true };
        changed = true;
      }

      return changed ? next : prev;
    });

    prevRef.current = { locationDone, geometryDone, additionalDone };
  }, [locationDone, geometryDone, additionalDone]);

  useEffect(() => {
    if (isOtherStructure) {
      setActiveTab("basic");
      setShowCustomLoadingModal(false);
      setShowGeometryModal(false);
    }
  }, [isOtherStructure]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submit();
  };

  const overallBridgeWidth = useMemo(() => {
    const cw = toNum(form.carriageway_width);
    return Number.isFinite(cw) && cw > 0 ? cw + 5 : NaN;
  }, [form.carriageway_width]);

  const currentSpacing = toNum(form.girder_spacing);
  const currentGirders = Number.isFinite(Number(form.number_of_girders))
    ? parseInt(form.number_of_girders, 10)
    : NaN;
  const currentOverhang = toNum(form.deck_overhang_width);

  const geometryPreview = useMemo(() => {
    if (
      !Number.isFinite(overallBridgeWidth) ||
      !Number.isFinite(currentSpacing) ||
      currentSpacing <= 0 ||
      !Number.isFinite(currentOverhang)
    ) {
      return "";
    }
    return `(${overallBridgeWidth.toFixed(1)} - ${currentOverhang.toFixed(1)}) / ${currentSpacing.toFixed(1)} = ${(
      (overallBridgeWidth - currentOverhang) /
      currentSpacing
    ).toFixed(2)}`;
  }, [overallBridgeWidth, currentSpacing, currentOverhang]);

  const geometryPopupError = useMemo(() => {
    if (!Number.isFinite(overallBridgeWidth)) {
      return "Enter Carriageway Width first. Overall Bridge Width = Carriageway Width + 5 m.";
    }
    if (Number.isFinite(currentSpacing) && currentSpacing >= overallBridgeWidth) {
      return "Girder spacing must be less than the overall bridge width.";
    }
    if (Number.isFinite(currentOverhang) && currentOverhang >= overallBridgeWidth) {
      return "Deck overhang width must be less than the overall bridge width.";
    }
    if (Number.isFinite(currentSpacing) && currentSpacing <= 0) {
      return "Girder spacing must be greater than 0.";
    }
    if (Number.isFinite(currentGirders) && currentGirders < 2) {
      return "Number of girders must be at least 2.";
    }
    return "";
  }, [overallBridgeWidth, currentSpacing, currentGirders, currentOverhang]);

  const setAdditionalGeometry = (field, rawValue) => {
    setField(field, rawValue);

    if (!Number.isFinite(overallBridgeWidth)) return;

    let spacing = field === "girder_spacing" ? toNum(rawValue) : toNum(form.girder_spacing);
    let girders =
      field === "number_of_girders"
        ? parseInt(rawValue || "", 10)
        : parseInt(form.number_of_girders || "", 10);
    let overhang =
      field === "deck_overhang_width" ? toNum(rawValue) : toNum(form.deck_overhang_width);

    const setFloatField = (name, value) => {
      if (!Number.isFinite(value)) return;
      if (value < 0 || value >= overallBridgeWidth) return;
      setField(name, String(round1(value)));
    };

    const setIntField = (name, value) => {
      if (!Number.isFinite(value)) return;
      const next = Math.max(2, Math.round(value));
      setField(name, String(next));
    };

    if (field === "girder_spacing") {
      if (Number.isFinite(spacing) && spacing > 0 && Number.isFinite(girders) && girders >= 2) {
        const nextOverhang = overallBridgeWidth - spacing * girders;
        setFloatField("deck_overhang_width", nextOverhang);
      }
    } else if (field === "number_of_girders") {
      if (Number.isFinite(spacing) && spacing > 0 && Number.isFinite(girders) && girders >= 2) {
        const nextOverhang = overallBridgeWidth - spacing * girders;
        setFloatField("deck_overhang_width", nextOverhang);
      }
    } else if (field === "deck_overhang_width") {
      if (Number.isFinite(overhang) && overhang >= 0) {
        if (Number.isFinite(girders) && girders >= 2) {
          const nextSpacing = (overallBridgeWidth - overhang) / girders;
          if (nextSpacing > 0) setFloatField("girder_spacing", nextSpacing);
        } else if (Number.isFinite(spacing) && spacing > 0) {
          const nextGirders = (overallBridgeWidth - overhang) / spacing;
          if (nextGirders > 0) setIntField("number_of_girders", nextGirders);
        }
      }
    }
  };

  if (loadingMaster) return <div className="gd-tab-content">Loading master data...</div>;

  const locationSummary =
    form.mode === "custom_loading"
      ? "Custom loading parameters"
      : [form.state, form.district].filter(Boolean).join(" / ") || "Location lookup";

  return (
    <>
      <form onSubmit={handleSubmit} className="gd-tab-content">
        {globalErrors?.map((g, i) => (
          <div key={i} className="gd-error" style={{ marginBottom: 8 }}>
            {friendly(g)}
          </div>
        ))}

        {loadedFromURL && (
          <div
            style={{
              background: "#0a2a1a",
              border: "1px solid #4caf50",
              borderRadius: 4,
              color: "#6dff97",
              fontSize: 11,
              padding: "6px 10px",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="#4caf50" strokeWidth="1.2" />
              <polyline
                points="4,7 6,9.5 10,4.5"
                stroke="#4caf50"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Form loaded from shared link.
            <button
              type="button"
              onClick={handleClearURLState}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: "#4caf50",
                cursor: "pointer",
                fontSize: 11,
                padding: 0,
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="gd-tabs">
          <button
            type="button"
            className={`gd-tab ${activeTab === "basic" ? "is-active" : ""}`}
            onClick={() => setActiveTab("basic")}
          >
            Basic Inputs
          </button>
          <button
            type="button"
            className={`gd-tab ${activeTab === "additional" ? "is-active" : ""}`}
            onClick={() => setActiveTab("additional")}
          >
            Additional Inputs
          </button>
        </div>

        {activeTab === "additional" ? (
          <div className="gd-section">
            <div className="gd-section-title">Additional Inputs</div>
            <div className="gd-modal-note">
              Placeholder only for this screening task. No functionality is required here yet.
            </div>
          </div>
        ) : (
          <>
            <div className="gd-section">
              <div
                className="gd-section-header-row"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}
              >
                <div className="gd-section-title" style={{ marginBottom: 0 }}>
                  Type of Structure
                </div>

                <div
                  className="gd-modal-note"
                  style={{
                    marginTop: 0,
                    fontWeight: 700,
                    color: completionCount === 4 ? "#6dff97" : "#9db0d8",
                    whiteSpace: "nowrap",
                  }}
                >
                  {completionCount}/4 complete
                </div>
              </div>

              <div className="gd-field" style={{ marginTop: 10 }}>
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

              {isOtherStructure && <div className="gd-disabled-note">Other structures not included.</div>}
            </div>

            {!isOtherStructure && (
              <>
                <Accordion
                  id="location"
                  title="Project Location"
                  isComplete={locationDone}
                  open={openMap.location}
                  onToggle={toggleAccordion}
                >
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

                  {isLookupMode ? (
                    <>
                      <div className="gd-field" style={{ marginTop: 8 }}>
                        <label className="gd-label">State</label>
                        <select
                          className="gd-select"
                          value={form.state}
                          onChange={(e) => onStateChange(e.target.value)}
                        >
                          <option value="">Select state</option>
                          {(states || []).map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <ErrorText msg={pick(submitErrors, ["project_location", "state"])} label="State" />
                      </div>

                      <div className="gd-field">
                        <label className="gd-label">District</label>
                        <select
                          className="gd-select"
                          value={form.district}
                          onChange={(e) => onDistrictChange(e.target.value)}
                          disabled={!form.state || loadingLocation}
                        >
                          <option value="">{loadingLocation ? "Loading districts..." : "Select district"}</option>
                          {(districts || []).map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                        <ErrorText msg={pick(submitErrors, ["project_location", "district"])} label="District" />
                      </div>
                    </>
                  ) : (
                    <div className="gd-inline-card">
                      <div className="gd-inline-card-title">Custom Loading Parameters</div>
                      <div className="gd-modal-note" style={{ marginBottom: 10 }}>
                        Open the popup and enter user-defined wind, seismic, and temperature values.
                      </div>
                      <button
                        type="button"
                        className="gd-btn gd-btn-yellow"
                        onClick={() => setShowCustomLoadingModal(true)}
                      >
                        Tabulate Custom Loading Parameters
                      </button>
                    </div>
                  )}

                  <div className="gd-summary-grid" style={{ marginTop: 12 }}>
                    <SummaryItem label="Basic Wind Speed (m/s)" value={form.wind_speed} green />
                    <SummaryItem label="Seismic Zone" value={form.seismic_zone} green />
                    <SummaryItem label="Zone Factor" value={form.zone_factor} green />
                    <SummaryItem label="Shade Air Temp Max" value={form.shade_air_temp_max} green />
                    <SummaryItem label="Shade Air Temp Min" value={form.shade_air_temp_min} green />
                  </div>
                </Accordion>

                <Accordion
                  id="geometry"
                  title="Geometric Inputs"
                  isComplete={geometryDone}
                  open={openMap.geometry}
                  onToggle={toggleAccordion}
                >
                  <div className="gd-field">
                    <label className="gd-label">Span (m)</label>
                    <input className="gd-input" value={form.span} onChange={(e) => setField("span", e.target.value)} />
                    <ErrorText msg={pick(submitErrors, ["geometric_inputs", "span"])} label="Span" />
                  </div>

                  <div className="gd-field">
                    <label className="gd-label">Carriageway Width (m)</label>
                    <input
                      className="gd-input"
                      value={form.carriageway_width}
                      onChange={(e) => setField("carriageway_width", e.target.value)}
                    />
                    <ErrorText
                      msg={pick(submitErrors, ["geometric_inputs", "carriageway_width"])}
                      label="Carriageway Width"
                    />
                  </div>

                  <div className="gd-field">
                    <label className="gd-label">Footpath</label>
                    <select className="gd-select" value={form.footpath} onChange={(e) => setField("footpath", e.target.value)}>
                      {(masterData.footpath_options || []).map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="gd-field">
                    <label className="gd-label">Skew Angle (°)</label>
                    <input
                      className="gd-input"
                      value={form.skew_angle}
                      onChange={(e) => setField("skew_angle", e.target.value)}
                    />
                    <ErrorText msg={pick(submitErrors, ["geometric_inputs", "skew_angle"])} label="Skew Angle" />
                  </div>

                  <div className="gd-inline-card">
                    <div className="gd-section-header-row" style={{ alignItems: "center" }}>
                      <div className="gd-inline-card-title">Additional Geometry</div>
                      <button
                        type="button"
                        className="gd-btn gd-btn-yellow"
                        onClick={() => setShowGeometryModal(true)}
                      >
                        Modify Additional Geometry
                      </button>
                    </div>

                    <div className="gd-summary-grid" style={{ marginTop: 10 }}>
                      <SummaryItem label="Girder Spacing (m)" value={form.girder_spacing} />
                      <SummaryItem label="No. of Girders" value={form.number_of_girders} />
                      <SummaryItem label="Deck Overhang Width (m)" value={form.deck_overhang_width} />
                      <SummaryItem
                        label="Overall Bridge Width (m)"
                        value={Number.isFinite(overallBridgeWidth) ? overallBridgeWidth.toFixed(1) : ""}
                      />
                    </div>

                    <button
                      type="button"
                      className="gd-btn gd-btn-yellow"
                      style={{ marginTop: 10 }}
                      onClick={checkGeometry}
                      disabled={checkingGeometry}
                    >
                      {checkingGeometry ? "Checking..." : "Check Geometry"}
                    </button>

                    <ErrorText msg={first(geometryErrors.girder_spacing)} label="Girder Spacing" />
                    <ErrorText msg={first(geometryErrors.number_of_girders)} label="Number of Girders" />
                    <ErrorText msg={first(geometryErrors.deck_overhang_width)} label="Deck Overhang Width" />
                    <ErrorText msg={first(geometryErrors.non_field_errors)} label="Additional Geometry" />

                    {geometryResult?.formula_check ? (
                      <div className="gd-modal-note" style={{ marginTop: 10 }}>
                        {geometryResult.formula_check}
                      </div>
                    ) : null}
                  </div>
                </Accordion>

                <Accordion
                  id="material"
                  title="Material Inputs"
                  isComplete={materialDone}
                  open={openMap.material}
                  onToggle={toggleAccordion}
                >
                  <div className="gd-field">
                    <label className="gd-label">Girder Steel</label>
                    <select className="gd-select" value={form.girder_steel} onChange={(e) => setField("girder_steel", e.target.value)}>
                      <option value="" disabled>
                        Select
                      </option>
                      {(masterData.steel_grades || []).map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="gd-field">
                    <label className="gd-label">Cross Bracing Steel</label>
                    <select
                      className="gd-select"
                      value={form.cross_bracing_steel}
                      onChange={(e) => setField("cross_bracing_steel", e.target.value)}
                    >
                      <option value="" disabled>
                        Select
                      </option>
                      {(masterData.steel_grades || []).map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="gd-field">
                    <label className="gd-label">Deck Concrete</label>
                    <select className="gd-select" value={form.deck_concrete} onChange={(e) => setField("deck_concrete", e.target.value)}>
                      <option value="" disabled>
                        Select
                      </option>
                      {(masterData.concrete_grades || []).map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </Accordion>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
                  <button type="button" className="gd-btn gd-btn-yellow" onClick={loadSampleData}>
                    Load Sample Example
                  </button>

                  <button
                    type="button"
                    className="gd-btn gd-btn-orange"
                    onClick={() => {
                      resetForm();
                      handleClearURLState();
                    }}
                    style={{ background: "#533019", borderColor: "#a95d1c", color: "#ffd8b0" }}
                  >
                    Reset Form
                  </button>
                </div>

                <button
                  type="button"
                  className="gd-btn"
                  style={{
                    marginTop: 8,
                    width: "100%",
                    background: copied ? "#1a4a2a" : "#1a3a6e",
                    color: copied ? "#6dff97" : "#7ab3f0",
                    border: `1px solid ${copied ? "#4caf50" : "#2a5a9a"}`,
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => handleCopyShareURL(form)}
                >
                  {copied ? "Link Copied!" : "Copy Share Link"}
                </button>

                <button type="submit" className="gd-btn gd-btn-green" disabled={submitting} style={{ marginTop: 10 }}>
                  {submitting ? "Submitting..." : "Submit"}
                </button>

                <button
                  type="button"
                  className="gd-btn gd-btn-green"
                  onClick={() => generateReport(gd)}
                  disabled={generating || !canDownloadReport}
                  style={{ marginTop: 8 }}
                  title={canDownloadReport ? "Download Design Report" : "Run Check Geometry or successful Submit first"}
                >
                  {generating ? "Generating PDF..." : "Download Design Report"}
                </button>

                {!canDownloadReport && (
                  <div className="gd-modal-note">
                    Run Check Geometry or complete a successful Submit to enable PDF download.
                  </div>
                )}

                {reportError && <div className="gd-error">{reportError}</div>}

                {submitResult?.success && (
                  <div
                    style={{
                      marginTop: 12,
                      border: "1px solid #2f7a45",
                      background: "#10281a",
                      borderRadius: 8,
                      padding: 12,
                    }}
                  >
                    <div style={{ color: "#76ffa4", fontWeight: 800, fontSize: 14, marginBottom: 6 }}>
                      Inputs validated successfully
                    </div>
                    <div style={{ color: "#c9f7d8", fontSize: 13, marginBottom: 10 }}>
                      {submitResult.message || "Group Design inputs validated successfully."}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                      <SummaryItem
                        label="Location Mode"
                        value={form.mode === "custom_loading" ? "Custom loading" : "Location lookup"}
                        green
                      />
                      <SummaryItem label="Location / Source" value={locationSummary} green />
                      <SummaryItem label="Span / Width" value={`${form.span || "—"} m / ${form.carriageway_width || "—"} m`} />
                      <SummaryItem label="Geometry Checked" value={geometryResult ? "Yes" : "Not yet"} />
                      <SummaryItem
                        label="Materials"
                        value={`${form.girder_steel || "—"}, ${form.cross_bracing_steel || "—"}, ${form.deck_concrete || "—"}`}
                      />
                      <SummaryItem label="Ready for next stage" value="Yes" green />
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </form>

      <Modal
        open={showCustomLoadingModal}
        title="Tabulate Custom Loading Parameters"
        onClose={() => setShowCustomLoadingModal(false)}
        footer={
          <>
            <button type="button" className="gd-btn gd-btn-orange" onClick={() => setShowCustomLoadingModal(false)}>
              Close
            </button>
            <button type="button" className="gd-btn gd-btn-yellow" onClick={() => setShowCustomLoadingModal(false)}>
              Apply
            </button>
          </>
        }
      >
        <div className="gd-field">
          <label className="gd-label">Basic Wind Speed (m/s)</label>
          <input className="gd-input" value={form.wind_speed} onChange={(e) => setField("wind_speed", e.target.value)} />
        </div>

        <div className="gd-field">
          <label className="gd-label">Seismic Zone</label>
          <input className="gd-input" value={form.seismic_zone} onChange={(e) => setField("seismic_zone", e.target.value)} />
        </div>

        <div className="gd-field">
          <label className="gd-label">Zone Factor</label>
          <input className="gd-input" value={form.zone_factor} onChange={(e) => setField("zone_factor", e.target.value)} />
        </div>

        <div className="gd-field">
          <label className="gd-label">Shade Air Temp Max</label>
          <input
            className="gd-input"
            value={form.shade_air_temp_max}
            onChange={(e) => setField("shade_air_temp_max", e.target.value)}
          />
        </div>

        <div className="gd-field">
          <label className="gd-label">Shade Air Temp Min</label>
          <input
            className="gd-input"
            value={form.shade_air_temp_min}
            onChange={(e) => setField("shade_air_temp_min", e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        open={showGeometryModal}
        title="Modify Additional Geometry"
        onClose={() => setShowGeometryModal(false)}
        footer={
          <>
            <button type="button" className="gd-btn gd-btn-orange" onClick={() => setShowGeometryModal(false)}>
              Close
            </button>
            <button type="button" className="gd-btn gd-btn-yellow" onClick={checkGeometry} disabled={checkingGeometry}>
              {checkingGeometry ? "Checking..." : "Run Check Geometry"}
            </button>
          </>
        }
      >
        <div className="gd-modal-note" style={{ marginBottom: 10 }}>
          Overall Bridge Width = Carriageway Width + 5 m
        </div>

        <div className="gd-field">
          <label className="gd-label">Girder Spacing (m)</label>
          <input
            className="gd-input"
            value={form.girder_spacing}
            onChange={(e) => setAdditionalGeometry("girder_spacing", e.target.value)}
          />
          <ErrorText msg={first(geometryErrors.girder_spacing)} label="Girder Spacing" />
        </div>

        <div className="gd-field">
          <label className="gd-label">No. of Girders</label>
          <input
            className="gd-input"
            value={form.number_of_girders}
            onChange={(e) => setAdditionalGeometry("number_of_girders", e.target.value)}
          />
          <ErrorText msg={first(geometryErrors.number_of_girders)} label="No. of Girders" />
        </div>

        <div className="gd-field">
          <label className="gd-label">Deck Overhang Width (m)</label>
          <input
            className="gd-input"
            value={form.deck_overhang_width}
            onChange={(e) => setAdditionalGeometry("deck_overhang_width", e.target.value)}
          />
          <ErrorText msg={first(geometryErrors.deck_overhang_width)} label="Deck Overhang Width" />
        </div>

        <div className="gd-summary-grid">
          <SummaryItem
            label="Overall Bridge Width (m)"
            value={Number.isFinite(overallBridgeWidth) ? overallBridgeWidth.toFixed(1) : ""}
          />
          <SummaryItem label="Equation Preview" value={geometryPreview || "—"} />
        </div>

        {geometryPopupError ? (
          <div className="gd-error" style={{ marginTop: 10 }}>
            {geometryPopupError}
          </div>
        ) : null}

        {first(geometryErrors.non_field_errors) ? (
          <div className="gd-error" style={{ marginTop: 10 }}>
            {friendly(first(geometryErrors.non_field_errors), "Additional Geometry")}
          </div>
        ) : null}

        {geometryResult?.formula_check ? (
          <div className="gd-modal-note" style={{ marginTop: 10 }}>
            {geometryResult.formula_check}
          </div>
        ) : null}
      </Modal>
    </>
  );
}