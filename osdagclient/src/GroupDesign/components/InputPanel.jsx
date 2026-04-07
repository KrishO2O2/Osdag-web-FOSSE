// ============================================================
// InputPanel.jsx — Group Design Module
// Spec-compliant Project Location:
//   Mode 1 (checkbox): inline State + city dropdown → auto IRC
//   Mode 2 (checkbox + button): spreadsheet popup
// "Other" disables all remaining inputs.
// ============================================================

import React, { useState } from 'react';
import {
  STRUCTURE_TYPES,
  FOOTPATH_OPTIONS,
  STEEL_GRADES,
  CONCRETE_GRADES,
  TABS,
  CITY_IRC_DATA,
  CITY_OPTIONS,
} from '../utils/constants';
import {
  validateStructureType,
  validateSpan,
  validateCarriageway,
  validateSkewAngle,
} from '../utils/validators';
import AdditionalGeometryModal from './AdditionalGeometryModal';
import CustomLoadingModal from './CustomLoadingModal';

export default function InputPanel({
  formState,
  onChange,
  errors,
  setErrors,
}) {
  const [activeTab, setActiveTab]         = useState(TABS.BASIC);
  const [showGeomModal, setShowGeomModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Mode 1 state
  const [locationMode, setLocationMode]       = useState(null); // 'lookup' | 'custom'
  const [selectedCity, setSelectedCity]       = useState('');
  const [cityIrcData, setCityIrcData]         = useState(null);

  // Mode 2 state
  const [customIrcData, setCustomIrcData]     = useState(null);

  const isDisabled = formState.structureType === 'other';

  const handleBlur = (field, validatorFn, value) => {
    if (value === '' || value === null || value === undefined) return;
    setErrors((prev) => ({ ...prev, [field]: validatorFn(value) }));
  };

  // Mutually exclusive mode toggle
  const handleModeToggle = (mode) => {
    setLocationMode((prev) => (prev === mode ? null : mode));
    if (mode === 'custom' && locationMode !== 'custom') {
      setShowCustomModal(true);
    }
  };

  // Mode 1: city selected → auto-populate IRC values
  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setCityIrcData(city ? CITY_IRC_DATA[city] : null);
    onChange('locationName', city);
  };

  // Which IRC data to display in the panel
  const displayIrc = locationMode === 'lookup' ? cityIrcData
                   : locationMode === 'custom' ? customIrcData
                   : null;

  return (
    <div className="gd-left-panel">

      {/* ---- Tabs ---- */}
      <div className="gd-tabs">
        <button
          className={`gd-tab${activeTab === TABS.BASIC ? ' active' : ''}`}
          onClick={() => setActiveTab(TABS.BASIC)}
        >
          Basic Inputs
        </button>
        <button
          className={`gd-tab${activeTab === TABS.ADDITIONAL ? ' active' : ''}`}
          onClick={() => setActiveTab(TABS.ADDITIONAL)}
        >
          Additional Inputs
        </button>
      </div>

      {/* ==================================================
          BASIC INPUTS
      ================================================== */}
      {activeTab === TABS.BASIC && (
        <div className="gd-tab-content">

          {/* Type of Structure */}
          <div className="gd-field">
            <label className="gd-label">Type of Structure</label>
            <select
              className="gd-select"
              value={formState.structureType}
              onChange={(e) => {
                onChange('structureType', e.target.value);
                setErrors((p) => ({ ...p, structureType: validateStructureType(e.target.value) }));
              }}
            >
              <option value="">— Select —</option>
              {STRUCTURE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {errors.structureType && (
              <div className="gd-error">{errors.structureType}</div>
            )}
          </div>

          {/* Remaining inputs — disabled when "Other" is selected */}
          <div style={{
            opacity: isDisabled ? 0.38 : 1,
            pointerEvents: isDisabled ? 'none' : 'auto',
            transition: 'opacity 0.2s',
          }}>

            {/* ---- Project Location ---- */}
            <div className="gd-section">
              <div className="gd-section-title">Project Location</div>

              {/* Mode 1 */}
              <div className="gd-location-mode-row">
                <label className="gd-checkbox-label">
                  <input
                    type="checkbox"
                    className="gd-checkbox"
                    checked={locationMode === 'lookup'}
                    onChange={() => handleModeToggle('lookup')}
                  />
                  Enter Location Name
                </label>
              </div>

              {/* Mode 1 expanded: city dropdown appears inline */}
              {locationMode === 'lookup' && (
                <div style={{ marginTop: 8, marginLeft: 22 }}>
                  <div className="gd-field">
                    <label className="gd-label">City</label>
                    <select
                      className="gd-select"
                      value={selectedCity}
                      onChange={(e) => handleCitySelect(e.target.value)}
                    >
                      <option value="">— Select City —</option>
                      {CITY_OPTIONS.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  {selectedCity && (
                    <div className="gd-field">
                      <label className="gd-label" style={{ color: '#888' }}>State</label>
                      <div className="gd-static-value">
                        {CITY_IRC_DATA[selectedCity].state}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mode 2 */}
              <div className="gd-location-mode-row" style={{ marginTop: 10 }}>
                <label className="gd-checkbox-label">
                  <input
                    type="checkbox"
                    className="gd-checkbox"
                    checked={locationMode === 'custom'}
                    onChange={() => handleModeToggle('custom')}
                  />
                  Tabulate Custom Loading Parameters
                </label>
              </div>

              {locationMode === 'custom' && (
                <div style={{ marginTop: 6, marginLeft: 22 }}>
                  <button
                    className="gd-btn gd-btn-orange gd-btn-sm"
                    style={{ width: '100%' }}
                    onClick={() => setShowCustomModal(true)}
                  >
                    {customIrcData ? 'Edit Custom Values' : 'Open Spreadsheet'}
                  </button>
                </div>
              )}

              {/* IRC values in green — shown after either mode provides data */}
              {displayIrc && (
                <div className="gd-irc-panel" style={{ marginTop: 10 }}>
                  <div className="gd-irc-title">IRC 6 (2017) Resulting Values</div>
                  <div className="gd-irc-row">
                    <span>Basic Wind Speed (m/s)</span>
                    <span className="gd-irc-value">{displayIrc.windSpeed}</span>
                  </div>
                  <div className="gd-irc-row">
                    <span>Seismic Zone &amp; Factor</span>
                    <span className="gd-irc-value">
                      {displayIrc.seismicZone} / {displayIrc.zoneFactor}
                    </span>
                  </div>
                  <div className="gd-irc-row">
                    <span>Max Shade Air Temp (°C)</span>
                    <span className="gd-irc-value">{displayIrc.shadeAirTempMax}</span>
                  </div>
                  <div className="gd-irc-row">
                    <span>Min Shade Air Temp (°C)</span>
                    <span className="gd-irc-value">{displayIrc.shadeAirTempMin}</span>
                  </div>
                </div>
              )}
            </div>

            {/* ---- Geometric Details ---- */}
            <div className="gd-section">
              <div className="gd-section-header-row">
                <span className="gd-section-title">Geometric Details</span>
                <button
                  className="gd-btn gd-btn-yellow gd-btn-sm"
                  onClick={() => setShowGeomModal(true)}
                >
                  Modify Additional Geometry
                </button>
              </div>

              <div className="gd-field">
                <label className="gd-label">Span (m)</label>
                <input
                  type="number" className="gd-input" placeholder="20 – 45"
                  value={formState.span} autoComplete="off"
                  onChange={(e) => {
                    onChange('span', e.target.value);
                    if (errors.span) setErrors((p) => ({ ...p, span: null }));
                  }}
                  onBlur={(e) => handleBlur('span', validateSpan, e.target.value)}
                />
                {errors.span && <div className="gd-error">{errors.span}</div>}
              </div>

              <div className="gd-field">
                <label className="gd-label">Carriageway Width (m)</label>
                <input
                  type="number" className="gd-input" placeholder="4.25 – 24"
                  value={formState.carriageway} autoComplete="off"
                  onChange={(e) => {
                    onChange('carriageway', e.target.value);
                    if (errors.carriageway) setErrors((p) => ({ ...p, carriageway: null }));
                  }}
                  onBlur={(e) => handleBlur('carriageway', validateCarriageway, e.target.value)}
                />
                {errors.carriageway && <div className="gd-error">{errors.carriageway}</div>}
              </div>

              <div className="gd-field">
                <label className="gd-label">Footpath</label>
                <select
                  className="gd-select"
                  value={formState.footpath}
                  onChange={(e) => onChange('footpath', e.target.value)}
                >
                  {FOOTPATH_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>

              <div className="gd-field">
                <label className="gd-label">Skew Angle (degrees)</label>
                <input
                  type="number" className="gd-input" placeholder="-15 to +15"
                  value={formState.skewAngle} autoComplete="off"
                  onChange={(e) => {
                    onChange('skewAngle', e.target.value);
                    if (errors.skewAngle) setErrors((p) => ({ ...p, skewAngle: null }));
                  }}
                  onBlur={(e) => handleBlur('skewAngle', validateSkewAngle, e.target.value)}
                />
                {errors.skewAngle && <div className="gd-error">{errors.skewAngle}</div>}
              </div>
            </div>

            {/* ---- Material Inputs ---- */}
            <div className="gd-section">
              <div className="gd-section-title">Material Inputs</div>

              <div className="gd-field">
                <label className="gd-label">Girder</label>
                <select className="gd-select" value={formState.girder}
                  onChange={(e) => {
                    onChange('girder', e.target.value);
                    setErrors((p) => ({ ...p, girder: e.target.value ? null : 'Required.' }));
                  }}>
                  <option value="">— Select Grade —</option>
                  {STEEL_GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
                {errors.girder && <div className="gd-error">{errors.girder}</div>}
              </div>

              <div className="gd-field">
                <label className="gd-label">Cross Bracing</label>
                <select className="gd-select" value={formState.crossBracing}
                  onChange={(e) => {
                    onChange('crossBracing', e.target.value);
                    setErrors((p) => ({ ...p, crossBracing: e.target.value ? null : 'Required.' }));
                  }}>
                  <option value="">— Select Grade —</option>
                  {STEEL_GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
                {errors.crossBracing && <div className="gd-error">{errors.crossBracing}</div>}
              </div>

              <div className="gd-field">
                <label className="gd-label">Deck</label>
                <select className="gd-select" value={formState.deck}
                  onChange={(e) => {
                    onChange('deck', e.target.value);
                    setErrors((p) => ({ ...p, deck: e.target.value ? null : 'Required.' }));
                  }}>
                  <option value="">— Select Grade —</option>
                  {CONCRETE_GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
                {errors.deck && <div className="gd-error">{errors.deck}</div>}
              </div>
            </div>

          </div>{/* end disabled wrapper */}
        </div>
      )}

      {/* ==================================================
          ADDITIONAL INPUTS (placeholder)
      ================================================== */}
      {activeTab === TABS.ADDITIONAL && (
        <div className="gd-tab-content">
          <div className="gd-additional-placeholder">
            Additional Inputs — coming soon
          </div>
        </div>
      )}

      {/* ---- Modals ---- */}
      {showGeomModal && (
        <AdditionalGeometryModal
          formState={formState}
          onChange={onChange}
          onClose={() => setShowGeomModal(false)}
          carriageway={formState.carriageway}
        />
      )}

      {showCustomModal && (
        <CustomLoadingModal
          initialData={customIrcData}
          onApply={(data) => {
            setCustomIrcData(data);
            setShowCustomModal(false);
          }}
          onClose={() => setShowCustomModal(false)}
        />
      )}
    </div>
  );
}