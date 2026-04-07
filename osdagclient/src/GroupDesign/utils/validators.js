// ============================================================
// validators.js — Group Design Module
// Exact error messages per task spec.
// ============================================================

import { GEOMETRIC_LIMITS } from './constants';

export function validateStructureType(value) {
  if (!value) return 'Please select a type of structure.';
  if (value === 'other') return 'Other structures not included.';
  return null;
}

export function validateSpan(value) {
  const num = parseFloat(value);
  if (value === '' || value === null || value === undefined) return 'Span is required.';
  if (isNaN(num)) return 'Span must be a number.';
  if (num < GEOMETRIC_LIMITS.span.min || num > GEOMETRIC_LIMITS.span.max) {
    return 'Outside the software range.';
  }
  return null;
}

export function validateCarriageway(value) {
  const num = parseFloat(value);
  if (value === '' || value === null || value === undefined) return 'Carriageway width is required.';
  if (isNaN(num)) return 'Carriageway width must be a number.';
  if (num < GEOMETRIC_LIMITS.carriageway.min || num >= GEOMETRIC_LIMITS.carriageway.max) {
    return `Must be ≥ ${GEOMETRIC_LIMITS.carriageway.min} m and < ${GEOMETRIC_LIMITS.carriageway.max} m.`;
  }
  return null;
}

export function validateSkewAngle(value) {
  const num = parseFloat(value);
  if (value === '' || value === null || value === undefined) return 'Skew angle is required.';
  if (isNaN(num)) return 'Skew angle must be a number.';
  if (num < GEOMETRIC_LIMITS.skewAngle.min || num > GEOMETRIC_LIMITS.skewAngle.max) {
    return 'IRC 24 (2010) requires detailed analysis.';
  }
  return null;
}

export function validateAdditionalGeometry(girderSpacing, numberOfGirders, deckOverhangWidth, carriageway) {
  const errors = {
    girderSpacing: null,
    numberOfGirders: null,
    deckOverhangWidth: null,
    general: null,
  };

  const gs = parseFloat(Number(girderSpacing).toFixed(1));
  const ng = parseInt(numberOfGirders, 10);
  const dow = parseFloat(Number(deckOverhangWidth).toFixed(1));
  const cw = parseFloat(carriageway);

  if (isNaN(gs) || gs <= 0) errors.girderSpacing = 'Girder spacing must be a positive number.';
  if (isNaN(ng) || ng < 2 || !Number.isInteger(ng)) errors.numberOfGirders = 'Number of girders must be an integer ≥ 2.';
  if (isNaN(dow) || dow < 0) errors.deckOverhangWidth = 'Deck overhang width must be zero or positive.';

  if (!isNaN(gs) && !isNaN(ng) && !isNaN(dow) && !isNaN(cw)) {
    const overallWidth = cw + 5;
    if (gs >= overallWidth) errors.girderSpacing = 'Spacing must be less than overall bridge width.';
    if (dow >= overallWidth) errors.deckOverhangWidth = 'Overhang must be less than overall bridge width.';
    const computedGirders = (overallWidth - dow) / gs;
    if (Math.abs(computedGirders - ng) > 0.5) {
      errors.general = `Inconsistent values. For overall width ${overallWidth.toFixed(2)} m, overhang ${dow} m, spacing ${gs} m → girders should be ${Math.round(computedGirders)}.`;
    }
  }

  return errors;
}

export function validateAllBasicInputs(formState) {
  return {
    structureType: validateStructureType(formState.structureType),
    span: validateSpan(formState.span),
    carriageway: validateCarriageway(formState.carriageway),
    skewAngle: validateSkewAngle(formState.skewAngle),
    girder: formState.girder ? null : 'Please select a girder material grade.',
    crossBracing: formState.crossBracing ? null : 'Please select a cross bracing material grade.',
    deck: formState.deck ? null : 'Please select a deck concrete grade.',
  };
}

export function hasErrors(errors) {
  return Object.values(errors).some((v) => v !== null);
}