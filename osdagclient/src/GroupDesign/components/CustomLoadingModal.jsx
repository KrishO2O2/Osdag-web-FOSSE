// ============================================================
// CustomLoadingModal.jsx — Group Design Module
// Spreadsheet-style pop-up for Mode 2: Tabulate Custom
// Loading Parameters. User manually enters wind speed,
// seismic zone/factor, and shade air temperatures.
// ============================================================

import React, { useState } from 'react';

const SEISMIC_ZONES = ['II', 'III', 'IV', 'V'];

const DEFAULTS = {
  windSpeed: '',
  seismicZone: '',
  zoneFactor: '',
  shadeAirTempMax: '',
  shadeAirTempMin: '',
};

export default function CustomLoadingModal({ initialData, onApply, onClose }) {
  const [values, setValues] = useState(initialData || DEFAULTS);
  const [errors, setErrors] = useState({});

  const set = (field, val) => {
    setValues((p) => ({ ...p, [field]: val }));
    setErrors((p) => ({ ...p, [field]: null }));
  };

  const validate = () => {
    const e = {};
    if (!values.windSpeed || isNaN(values.windSpeed) || Number(values.windSpeed) <= 0)
      e.windSpeed = 'Required — positive number.';
    if (!values.seismicZone)
      e.seismicZone = 'Required.';
    if (!values.zoneFactor || isNaN(values.zoneFactor) || Number(values.zoneFactor) <= 0)
      e.zoneFactor = 'Required — positive number.';
    if (!values.shadeAirTempMax || isNaN(values.shadeAirTempMax))
      e.shadeAirTempMax = 'Required — number.';
    if (!values.shadeAirTempMin || isNaN(values.shadeAirTempMin))
      e.shadeAirTempMin = 'Required — number.';
    if (
      !e.shadeAirTempMax && !e.shadeAirTempMin &&
      Number(values.shadeAirTempMin) >= Number(values.shadeAirTempMax)
    )
      e.shadeAirTempMin = 'Min must be less than Max.';
    return e;
  };

  const handleApply = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onApply({
      windSpeed: Number(values.windSpeed),
      seismicZone: values.seismicZone,
      zoneFactor: Number(values.zoneFactor),
      shadeAirTempMax: Number(values.shadeAirTempMax),
      shadeAirTempMin: Number(values.shadeAirTempMin),
    });
  };

  return (
    <div className="gd-modal-overlay" onClick={onClose}>
      <div className="gd-modal" style={{ width: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="gd-modal-title">Tabulate Custom Loading Parameters</div>

        {/* Spreadsheet-style table */}
        <table className="gd-custom-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>

            <tr>
              <td>Basic Wind Speed (m/s)</td>
              <td>
                <input
                  type="number"
                  className="gd-input gd-table-input"
                  placeholder="e.g. 44"
                  value={values.windSpeed}
                  onChange={(e) => set('windSpeed', e.target.value)}
                />
                {errors.windSpeed && <div className="gd-error">{errors.windSpeed}</div>}
              </td>
            </tr>

            <tr>
              <td>Seismic Zone</td>
              <td>
                <select
                  className="gd-select gd-table-input"
                  value={values.seismicZone}
                  onChange={(e) => set('seismicZone', e.target.value)}
                >
                  <option value="">— Select —</option>
                  {SEISMIC_ZONES.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
                {errors.seismicZone && <div className="gd-error">{errors.seismicZone}</div>}
              </td>
            </tr>

            <tr>
              <td>Zone Factor</td>
              <td>
                <input
                  type="number"
                  className="gd-input gd-table-input"
                  placeholder="e.g. 0.16"
                  step="0.01"
                  value={values.zoneFactor}
                  onChange={(e) => set('zoneFactor', e.target.value)}
                />
                {errors.zoneFactor && <div className="gd-error">{errors.zoneFactor}</div>}
              </td>
            </tr>

            <tr>
              <td>Max Shade Air Temp (°C)</td>
              <td>
                <input
                  type="number"
                  className="gd-input gd-table-input"
                  placeholder="e.g. 48"
                  value={values.shadeAirTempMax}
                  onChange={(e) => set('shadeAirTempMax', e.target.value)}
                />
                {errors.shadeAirTempMax && <div className="gd-error">{errors.shadeAirTempMax}</div>}
              </td>
            </tr>

            <tr>
              <td>Min Shade Air Temp (°C)</td>
              <td>
                <input
                  type="number"
                  className="gd-input gd-table-input"
                  placeholder="e.g. 0"
                  value={values.shadeAirTempMin}
                  onChange={(e) => set('shadeAirTempMin', e.target.value)}
                />
                {errors.shadeAirTempMin && <div className="gd-error">{errors.shadeAirTempMin}</div>}
              </td>
            </tr>

          </tbody>
        </table>

        <div className="gd-modal-footer">
          <button
            className="gd-btn gd-btn-sm"
            style={{ background: '#555', color: '#fff' }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="gd-btn gd-btn-sm gd-btn-green"
            style={{ width: 'auto' }}
            onClick={handleApply}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}