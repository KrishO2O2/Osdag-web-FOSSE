// ============================================================
// GroupDesignPage.jsx — Group Design Module
// Top-level page component. Composes:
//   - Left panel (InputPanel with tabs)
//   - Right panel (Bridge Cross-Section reference image)
// Owns shared state: form values, validation errors.
// ============================================================

import React, { useState } from 'react';
import InputPanel from '../components/InputPanel';
import { useFormState } from '../hooks/useFormState';
import { useGroupDesign } from '../hooks/useGroupDesign';
import { validateAllBasicInputs, hasErrors } from '../utils/validators';
import '../styles/GroupDesign.css';
import bridgeImage from '../assets/bridge_cross_section.jpg';
// Import the bridge cross-section image.
// Place the image at: osdagclient/src/GroupDesign/assets/bridge_cross_section.png
// (The task spec says to add the provided image file here.)



export default function GroupDesignPage() {
  const { formState, handleChange, resetForm } = useFormState();
  const {
    locationData,
    locationLoading,
    locationError,
    lookupLocationData,
    submitDesign,
    isLoading,
    result,
    apiError,
  } = useGroupDesign();

  const [errors, setErrors] = useState({
    structureType: null,
    span: null,
    carriageway: null,
    skewAngle: null,
    girder: null,
    crossBracing: null,
    deck: null,
  });

  const handleDesign = () => {
    const allErrors = validateAllBasicInputs(formState);
    setErrors(allErrors);
    if (hasErrors(allErrors)) return;
    submitDesign(formState);
  };

  return (
    <div className="gd-root">

      {/* ---- Left Panel ---- */}
      <InputPanel
        formState={formState}
        onChange={handleChange}
        errors={errors}
        setErrors={setErrors}
        locationData={locationData}
        locationLoading={locationLoading}
        locationError={locationError}
        lookupLocationData={lookupLocationData}
      />

      {/* ---- Right Panel: Bridge Cross-Section Image ---- */}
      <div className="gd-right-panel">
        <div className="gd-right-panel-label">
          Bridge Cross Section (For Nomenclature only)
        </div>

        <img src={bridgeImage} alt="Bridge Cross Section" className="gd-bridge-image" draggable="false" />
      </div>

    </div>
  );
}