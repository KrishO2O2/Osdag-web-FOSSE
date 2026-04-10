import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchMasterData,
  fetchStates,
  fetchDistrictsByState,
  fetchLocationByStateDistrict,
  checkGeometryApi,
  submitGroupDesignApi,
  normalizeApiError,
} from "../utils/groupDesignApi";

const INITIAL_FORM = {
  structure_type: "highway",
  mode: "location_lookup",

  state: "",
  district: "",
  city: "",

  wind_speed: "",
  seismic_zone: "",
  zone_factor: "",
  shade_air_temp_max: "",
  shade_air_temp_min: "",

  span: "",
  carriageway_width: "",
  footpath: "none",
  skew_angle: "",

  girder_spacing: "",
  number_of_girders: "",
  deck_overhang_width: "",

  girder_steel: "",
  cross_bracing_steel: "",
  deck_concrete: "",
};

const SAMPLE_FORM = {
  structure_type: "highway",
  mode: "custom_loading",

  state: "",
  district: "",
  city: "",

  wind_speed: "44",
  seismic_zone: "III",
  zone_factor: "0.16",
  shade_air_temp_max: "38",
  shade_air_temp_min: "12",

  span: "30",
  carriageway_width: "7.5",
  footpath: "both",
  skew_angle: "8",

  girder_spacing: "2.5",
  number_of_girders: "4",
  deck_overhang_width: "2.5",

  girder_steel: "E350",
  cross_bracing_steel: "E250",
  deck_concrete: "M35",
};

function toNumberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function toIntegerOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const num = parseInt(value, 10);
  return Number.isFinite(num) ? num : null;
}

function buildPayload(form) {
  return {
    structure_type: form.structure_type,
    project_location: {
      mode: form.mode,
      state: form.state || "",
      district: form.district || "",
      city: form.city || "",
      wind_speed: toNumberOrNull(form.wind_speed),
      seismic_zone: form.seismic_zone || "",
      zone_factor: toNumberOrNull(form.zone_factor),
      shade_air_temp_max: toNumberOrNull(form.shade_air_temp_max),
      shade_air_temp_min: toNumberOrNull(form.shade_air_temp_min),
    },
    geometric_inputs: {
      span: toNumberOrNull(form.span),
      carriageway_width: toNumberOrNull(form.carriageway_width),
      footpath: form.footpath,
      skew_angle: toNumberOrNull(form.skew_angle),
      girder_spacing: toNumberOrNull(form.girder_spacing),
      number_of_girders: toIntegerOrNull(form.number_of_girders),
      deck_overhang_width: toNumberOrNull(form.deck_overhang_width),
    },
    material_inputs: {
      girder_steel: form.girder_steel || "",
      cross_bracing_steel: form.cross_bracing_steel || "",
      deck_concrete: form.deck_concrete || "",
    },
  };
}

export default function useGroupDesign() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [masterData, setMasterData] = useState({
    structure_types: [],
    footpath_options: [],
    steel_grades: [],
    concrete_grades: [],
    location_modes: [],
  });

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  const [loadingMaster, setLoadingMaster] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [checkingGeometry, setCheckingGeometry] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [submitErrors, setSubmitErrors] = useState({});
  const [geometryErrors, setGeometryErrors] = useState({});
  const [globalErrors, setGlobalErrors] = useState([]);

  const [geometryResult, setGeometryResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);

  const [recentChangeKey, setRecentChangeKey] = useState("");
  const [flashToken, setFlashToken] = useState(0);

  const trackedLiveKeys = useMemo(
    () => new Set(["span", "carriageway_width", "number_of_girders", "deck_overhang_width", "girder_spacing"]),
    []
  );

  const clearTransientFeedback = useCallback(() => {
    setSubmitResult(null);
    setSubmitErrors({});
    setGlobalErrors([]);
  }, []);

  const triggerFlash = useCallback((key) => {
    setRecentChangeKey(key);
    setFlashToken((n) => n + 1);
  }, []);

  const setField = useCallback(
    (field, value) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      clearTransientFeedback();

      if (trackedLiveKeys.has(field)) {
        triggerFlash(field);
      }
    },
    [clearTransientFeedback, trackedLiveKeys, triggerFlash]
  );

  const resetForm = useCallback(() => {
    setForm(INITIAL_FORM);
    setDistricts([]);
    setSubmitErrors({});
    setGeometryErrors({});
    setGlobalErrors([]);
    setGeometryResult(null);
    setSubmitResult(null);
    setRecentChangeKey("");
  }, []);

  const loadSampleData = useCallback(() => {
    setForm(SAMPLE_FORM);
    setDistricts([]);
    setSubmitErrors({});
    setGeometryErrors({});
    setGlobalErrors([]);
    setGeometryResult(null);
    setSubmitResult(null);
    setRecentChangeKey("carriageway_width");
    setFlashToken((n) => n + 1);
  }, []);

  const setMode = useCallback(
    (mode) => {
      clearTransientFeedback();
      setGeometryErrors({});
      setGeometryResult(null);

      setForm((prev) => {
        if (mode === "location_lookup") {
          return {
            ...prev,
            mode,
            wind_speed: "",
            seismic_zone: "",
            zone_factor: "",
            shade_air_temp_max: "",
            shade_air_temp_min: "",
          };
        }

        return {
          ...prev,
          mode,
          state: "",
          district: "",
          city: "",
        };
      });

      if (mode === "custom_loading") {
        setDistricts([]);
      }
    },
    [clearTransientFeedback]
  );

  const onStateChange = useCallback(
    async (stateValue) => {
      clearTransientFeedback();
      setGeometryErrors({});
      setGeometryResult(null);

      setForm((prev) => ({
        ...prev,
        state: stateValue,
        district: "",
        city: "",
        wind_speed: "",
        seismic_zone: "",
        zone_factor: "",
        shade_air_temp_max: "",
        shade_air_temp_min: "",
      }));

      if (!stateValue) {
        setDistricts([]);
        return;
      }

      setLoadingLocation(true);
      try {
        const nextDistricts = await fetchDistrictsByState(stateValue);
        setDistricts(nextDistricts);
      } catch (error) {
        const normalized = normalizeApiError(error);
        setGlobalErrors(normalized.non_field_errors || ["Failed to load districts."]);
        setDistricts([]);
      } finally {
        setLoadingLocation(false);
      }
    },
    [clearTransientFeedback]
  );

  const onDistrictChange = useCallback(
    async (districtValue) => {
      clearTransientFeedback();
      setGeometryErrors({});
      setGeometryResult(null);

      setForm((prev) => ({
        ...prev,
        district: districtValue,
      }));

      if (!form.state || !districtValue) {
        return;
      }

      setLoadingLocation(true);
      try {
        const data = await fetchLocationByStateDistrict(form.state, districtValue);
        setForm((prev) => ({
          ...prev,
          district: districtValue,
          wind_speed: data?.wind_speed != null ? String(data.wind_speed) : "",
          seismic_zone: data?.seismic_zone ?? "",
          zone_factor: data?.zone_factor != null ? String(data.zone_factor) : "",
          shade_air_temp_max: data?.shade_air_temp_max != null ? String(data.shade_air_temp_max) : "",
          shade_air_temp_min: data?.shade_air_temp_min != null ? String(data.shade_air_temp_min) : "",
        }));
      } catch (error) {
        const normalized = normalizeApiError(error);
        setGlobalErrors(normalized.non_field_errors || ["Failed to load location values."]);
      } finally {
        setLoadingLocation(false);
      }
    },
    [clearTransientFeedback, form.state]
  );

  const checkGeometry = useCallback(async () => {
    setCheckingGeometry(true);
    setGeometryErrors({});
    setGlobalErrors([]);

    try {
      const payload = {
        carriageway_width: toNumberOrNull(form.carriageway_width),
        girder_spacing: toNumberOrNull(form.girder_spacing),
        number_of_girders: toIntegerOrNull(form.number_of_girders),
        deck_overhang_width: toNumberOrNull(form.deck_overhang_width),
      };

      const data = await checkGeometryApi(payload);
      setGeometryResult(data);
    } catch (error) {
      setGeometryResult(null);
      setGeometryErrors(normalizeApiError(error));
    } finally {
      setCheckingGeometry(false);
    }
  }, [form]);

  const submit = useCallback(async () => {
    setSubmitting(true);
    setSubmitErrors({});
    setGlobalErrors([]);

    try {
      const payload = buildPayload(form);
      const data = await submitGroupDesignApi(payload);
      setSubmitResult(data);
      return data;
    } catch (error) {
      setSubmitResult(null);
      const normalized = normalizeApiError(error);
      setSubmitErrors(normalized);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [form]);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      setLoadingMaster(true);
      try {
        const [meta, stateList] = await Promise.all([fetchMasterData(), fetchStates()]);

        if (!isMounted) return;
        setMasterData(meta);
        setStates(stateList);
      } catch (error) {
        if (!isMounted) return;
        const normalized = normalizeApiError(error);
        setGlobalErrors(normalized.non_field_errors || ["Failed to load master data."]);
      } finally {
        if (isMounted) {
          setLoadingMaster(false);
        }
      }
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const isLookupMode = form.mode === "location_lookup";
  const isCustomMode = form.mode === "custom_loading";

  return {
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

    recentChangeKey,
    flashToken,

    setField,
    setMode,
    onStateChange,
    onDistrictChange,
    checkGeometry,
    submit,
    resetForm,
    loadSampleData,
  };
}