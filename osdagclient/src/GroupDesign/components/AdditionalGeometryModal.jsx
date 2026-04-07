// ============================================================
// AdditionalGeometryModal.jsx — Group Design Module
// Pop-up for Girder Spacing (float, 1dp), No. of Girders
// (integer), Deck Overhang Width (float, 1dp).
// All three fields are interdependent and auto-update.
// ============================================================

import React, { useState } from 'react';

// Round to 1 decimal place
const r1 = (n) => Math.round(n * 10) / 10;

function validate(gs, ng, dow, carriageway) {
  const errors = { girderSpacing: null, numberOfGirders: null, deckOverhangWidth: null, general: null };
  const gsN  = parseFloat(gs);
  const ngN  = parseInt(ng, 10);
  const dowN = parseFloat(dow);
  const cw   = parseFloat(carriageway);
  const ow   = cw + 5; // Overall Bridge Width = CW + 5 m

  if (isNaN(gsN) || gsN <= 0)
    errors.girderSpacing = 'Girder spacing must be a positive number.';

  if (isNaN(ngN) || ngN < 2 || String(ng).includes('.'))
    errors.numberOfGirders = 'Number of girders must be an integer ≥ 2.';

  if (isNaN(dowN) || dowN < 0)
    errors.deckOverhangWidth = 'Deck overhang width must be ≥ 0.';

  if (!errors.girderSpacing && !isNaN(gsN) && !isNaN(ow) && gsN >= ow)
    errors.girderSpacing = `Spacing must be < overall width (${ow.toFixed(1)} m).`;

  if (!errors.deckOverhangWidth && !isNaN(dowN) && !isNaN(ow) && dowN >= ow)
    errors.deckOverhangWidth = `Overhang must be < overall width (${ow.toFixed(1)} m).`;

  if (!errors.girderSpacing && !errors.numberOfGirders && !errors.deckOverhangWidth
      && !isNaN(gsN) && !isNaN(ngN) && !isNaN(dowN) && !isNaN(cw)) {
    const expected = (ow - dowN) / gsN;
    if (Math.abs(expected - ngN) > 0.5) {
      errors.general =
        `Values inconsistent. With overall width ${ow.toFixed(1)} m, overhang ${dowN.toFixed(1)} m, `
        + `spacing ${gsN.toFixed(1)} m → girders should be ${Math.round(expected)}.`;
    }
  }
  return errors;
}

export default function AdditionalGeometryModal({ formState, onChange, onClose, carriageway }) {
  const cw = parseFloat(carriageway) || 0;
  const ow = cw + 5;

  const [gs,  setGs]  = useState(String(formState.girderSpacing));
  const [ng,  setNg]  = useState(String(formState.numberOfGirders));
  const [dow, setDow] = useState(String(formState.deckOverhangWidth));
  const [errors, setErrors] = useState({ girderSpacing: null, numberOfGirders: null, deckOverhangWidth: null, general: null });

  // Auto-update the OTHER two fields when one changes
  const handleGs = (val) => {
    setGs(val);
    const gsN = parseFloat(val);
    const dowN = parseFloat(dow);
    if (!isNaN(gsN) && gsN > 0 && !isNaN(dowN)) {
      const computed = Math.round((ow - dowN) / gsN);
      if (computed >= 2) setNg(String(computed));
    }
    setErrors(validate(val, ng, dow, carriageway));
  };

  const handleNg = (val) => {
    // Reject non-integer input immediately
    if (val.includes('.')) return;
    setNg(val);
    const ngN = parseInt(val, 10);
    const gsN = parseFloat(gs);
    if (!isNaN(ngN) && ngN >= 2 && !isNaN(gsN) && gsN > 0) {
      const computed = r1(ow - ngN * gsN);
      if (computed >= 0) setDow(String(computed));
    }
    setErrors(validate(gs, val, dow, carriageway));
  };

  const handleDow = (val) => {
    setDow(val);
    const dowN = parseFloat(val);
    const gsN  = parseFloat(gs);
    if (!isNaN(dowN) && dowN >= 0 && !isNaN(gsN) && gsN > 0) {
      const computed = Math.round((ow - dowN) / gsN);
      if (computed >= 2) setNg(String(computed));
    }
    setErrors(validate(gs, ng, val, carriageway));
  };

  const hasError = Object.values(errors).some(Boolean);

  const handleApply = () => {
    const e = validate(gs, ng, dow, carriageway);
    setErrors(e);
    if (Object.values(e).some(Boolean)) return;
    onChange('girderSpacing',    r1(parseFloat(gs)));
    onChange('numberOfGirders',  parseInt(ng, 10));
    onChange('deckOverhangWidth', r1(parseFloat(dow)));
    onClose();
  };

  return (
    <div className="gd-modal-overlay" onClick={onClose}>
      <div className="gd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gd-modal-title">Modify Additional Geometry</div>

        <div className="gd-modal-info">
          Overall Bridge Width = {cw > 0 ? `${cw} + 5 = ${ow.toFixed(1)} m` : '(enter carriageway width first)'}
        </div>

        {/* Girder Spacing — float, 1 decimal */}
        <div className="gd-field">
          <label className="gd-label">Girder Spacing (m) — float, 1 decimal</label>
          <input
            type="number"
            className="gd-input"
            step="0.1"
            min="0.1"
            value={gs}
            onChange={(e) => handleGs(e.target.value)}
            onBlur={() => { const v = r1(parseFloat(gs)); if (!isNaN(v)) setGs(String(v)); }}
          />
          {errors.girderSpacing && <div className="gd-error">{errors.girderSpacing}</div>}
        </div>

        {/* No. of Girders — integer only */}
        <div className="gd-field">
          <label className="gd-label">No. of Girders — integer</label>
          <input
            type="number"
            className="gd-input"
            step="1"
            min="2"
            value={ng}
            onChange={(e) => handleNg(e.target.value)}
          />
          {errors.numberOfGirders && <div className="gd-error">{errors.numberOfGirders}</div>}
        </div>

        {/* Deck Overhang Width — float, 1 decimal */}
        <div className="gd-field">
          <label className="gd-label">Deck Overhang Width (m) — float, 1 decimal</label>
          <input
            type="number"
            className="gd-input"
            step="0.1"
            min="0"
            value={dow}
            onChange={(e) => handleDow(e.target.value)}
            onBlur={() => { const v = r1(parseFloat(dow)); if (!isNaN(v)) setDow(String(v)); }}
          />
          {errors.deckOverhangWidth && <div className="gd-error">{errors.deckOverhangWidth}</div>}
        </div>

        {errors.general && <div className="gd-error" style={{ marginBottom: 8 }}>{errors.general}</div>}

        <div className="gd-modal-note">
          Formula: (Overall Width − Overhang) ÷ Spacing = No. of Girders<br />
          Changing any field auto-updates the other two.
        </div>

        <div className="gd-modal-footer">
          <button className="gd-btn gd-btn-sm" style={{ background: '#555', color: '#fff' }} onClick={onClose}>
            Cancel
          </button>
          <button
            className="gd-btn gd-btn-sm gd-btn-green"
            style={{ width: 'auto' }}
            onClick={handleApply}
            disabled={hasError}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}