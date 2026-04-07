// ============================================================
// useGroupDesign.js — Group Design Module
// Manages API call state: loading, error, result
// Also handles location IRC data lookup
// ============================================================

import { useState } from 'react';
import { submitGroupDesign, fetchLocationData } from '../utils/groupDesignApi';
import { CITY_IRC_DATA } from '../utils/constants';

export function useGroupDesign() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState(null);

  // Location IRC values populated after Project Location is confirmed
  const [locationData, setLocationData] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  /**
   * Submits the full form to the backend for calculation.
   */
  const submitDesign = async (formState) => {
    setIsLoading(true);
    setApiError(null);
    setResult(null);
    try {
      const data = await submitGroupDesign(formState);
      setResult(data);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Looks up IRC location data. First checks the hardcoded CITY_DATA
   * for the 5 major cities; falls back to backend API for others.
   */
  
  const clearResult = () => {
    setResult(null);
    setApiError(null);
  };

  return {
    // Submission
    isLoading,
    result,
    apiError,
    submitDesign,
    clearResult,

    // Location lookup
    locationData,
    locationLoading,
    locationError,
  };
}