// ============================================================
// useFormState.js — Group Design Module
// Manages all controlled form field values and change handlers
// ============================================================

import { useState } from 'react';
import { ADDITIONAL_GEOMETRY_DEFAULTS } from '../utils/constants';

const INITIAL_FORM_STATE = {
  // Basic
  structureType: '',

  // Project Location
  locationName: '',
  state: '',
  district: '',

  // Geometric Details
  span: '',
  carriageway: '',
  footpath: 'none',
  skewAngle: '',

  // Additional Geometry (inside popup)
  girderSpacing: ADDITIONAL_GEOMETRY_DEFAULTS.girderSpacing,
  numberOfGirders: ADDITIONAL_GEOMETRY_DEFAULTS.numberOfGirders,
  deckOverhangWidth: ADDITIONAL_GEOMETRY_DEFAULTS.deckOverhangWidth,

  // Material Inputs
  girder: '',
  crossBracing: '',
  deck: '',
};

export function useFormState() {
  const [formState, setFormState] = useState(INITIAL_FORM_STATE);

  // Generic change handler for all simple fields
  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  // Resets the entire form to initial state
  const resetForm = () => {
    setFormState(INITIAL_FORM_STATE);
  };

  return {
    formState,
    handleChange,
    resetForm,
  };
}