import { useEffect, useMemo, useState } from "react";
import {
  fetchMasterData,
  fetchStates,
  fetchDistrictsByState,
  fetchLocationByStateDistrict,
  checkGeometryApi,
  submitGroupDesignApi,
  normalizeApiError,
} from "../utils/groupDesignApi";

const initialForm = {
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

const toFloatOrNull = (v) => (v === "" || v == null ? null : parseFloat(v));
const toIntOrNull = (v) => (v === "" || v == null ? null : parseInt(v, 10));

export default function useGroupDesign() {
  const [form, setForm] = useState(initialForm);
  const [masterData, setMasterData] = useState({
    structure_types: [],
    footpath_options: [],
    steel_grades: [],
    concrete_grades: [],
    cities: [],
    location_modes: [],
  });

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loadingMaster, setLoadingMaster] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [checkingGeometry, setCheckingGeometry] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitErrors, setSubmitErrors] = useState({});
  const [geometryErrors, setGeometryErrors] = useState({});
  const [globalErrors, setGlobalErrors] = useState([]);
  const [geometryResult, setGeometryResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);

  const isLookupMode = form.mode === "location_lookup";
  const isCustomMode = form.mode === "custom_loading";

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingMaster(true);
        const [md, st] = await Promise.all([fetchMasterData(), fetchStates()]);
        if (!active) return;
        setMasterData(md);
        setStates(st || []);
      } catch (e) {
        const err = normalizeApiError(e);
        if (active) setGlobalErrors(err.non_field_errors || ["Failed to load initial data."]);
      } finally {
        if (active) setLoadingMaster(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  const setMode = (mode) => {
    setSubmitErrors({});
    setGeometryErrors({});
    setGlobalErrors([]);
    setGeometryResult(null);
    setSubmitResult(null);

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
      return { ...prev, mode, state: "", district: "", city: "" };
    });
    setDistricts([]);
  };

  const onStateChange = async (stateVal) => {
    setForm((prev) => ({
      ...prev,
      state: stateVal,
      district: "",
      city: "",
      wind_speed: "",
      seismic_zone: "",
      zone_factor: "",
      shade_air_temp_max: "",
      shade_air_temp_min: "",
    }));
    setDistricts([]);
    if (!stateVal) return;

    try {
      setLoadingLocation(true);
      const ds = await fetchDistrictsByState(stateVal);
      setDistricts(ds || []);
    } catch (e) {
      const err = normalizeApiError(e);
      setGlobalErrors(err.non_field_errors || ["Failed to fetch districts."]);
    } finally {
      setLoadingLocation(false);
    }
  };

  const onDistrictChange = async (districtVal) => {
    setForm((prev) => ({ ...prev, district: districtVal, city: districtVal }));
    if (!form.state || !districtVal) return;

    try {
      setLoadingLocation(true);
      const data = await fetchLocationByStateDistrict(form.state, districtVal);
      setForm((prev) => ({
        ...prev,
        district: districtVal,
        city: districtVal,
        wind_speed: data.wind_speed ?? "",
        seismic_zone: data.seismic_zone ?? "",
        zone_factor: data.zone_factor ?? "",
        shade_air_temp_max: data.shade_air_temp_max ?? "",
        shade_air_temp_min: data.shade_air_temp_min ?? "",
      }));
    } catch (e) {
      const err = normalizeApiError(e);
      setGlobalErrors(err.non_field_errors || ["Failed to fetch district values."]);
    } finally {
      setLoadingLocation(false);
    }
  };

  const geometryPayload = useMemo(
    () => ({
      carriageway_width: toFloatOrNull(form.carriageway_width),
      girder_spacing: toFloatOrNull(form.girder_spacing),
      number_of_girders: toIntOrNull(form.number_of_girders),
      deck_overhang_width: toFloatOrNull(form.deck_overhang_width),
    }),
    [form.carriageway_width, form.girder_spacing, form.number_of_girders, form.deck_overhang_width]
  );

  const checkGeometry = async () => {
    try {
      setCheckingGeometry(true);
      setGeometryErrors({});
      setGlobalErrors([]);
      const data = await checkGeometryApi(geometryPayload);
      setGeometryResult(data);
      setForm((prev) => ({
        ...prev,
        girder_spacing: data.girder_spacing !== undefined ? String(data.girder_spacing) : prev.girder_spacing,
        number_of_girders: data.number_of_girders !== undefined ? String(data.number_of_girders) : prev.number_of_girders,
        deck_overhang_width: data.deck_overhang_width !== undefined ? String(data.deck_overhang_width) : prev.deck_overhang_width,
      }));
    } catch (e) {
      const err = normalizeApiError(e);
      setGeometryErrors(err);
      if (err.non_field_errors) setGlobalErrors(err.non_field_errors);
    } finally {
      setCheckingGeometry(false);
    }
  };

  const buildSubmitPayload = () => ({
    structure_type: form.structure_type,
    project_location:
      form.mode === "location_lookup"
        ? { mode: "location_lookup", city: form.city || form.district }
        : {
            mode: "custom_loading",
            wind_speed: toFloatOrNull(form.wind_speed),
            seismic_zone: form.seismic_zone || null,
            zone_factor: toFloatOrNull(form.zone_factor),
            shade_air_temp_max: toFloatOrNull(form.shade_air_temp_max),
            shade_air_temp_min: toFloatOrNull(form.shade_air_temp_min),
          },
    geometric_inputs: {
      span: toFloatOrNull(form.span),
      carriageway_width: toFloatOrNull(form.carriageway_width),
      footpath: form.footpath,
      skew_angle: toFloatOrNull(form.skew_angle),
      girder_spacing: toFloatOrNull(form.girder_spacing),
      number_of_girders: toIntOrNull(form.number_of_girders),
      deck_overhang_width: toFloatOrNull(form.deck_overhang_width),
    },
    material_inputs: {
      girder_steel: form.girder_steel || null,
      cross_bracing_steel: form.cross_bracing_steel || null,
      deck_concrete: form.deck_concrete || null,
    },
  });

  const submit = async () => {
    try {
      setSubmitting(true);
      setSubmitErrors({});
      setGlobalErrors([]);
      const data = await submitGroupDesignApi(buildSubmitPayload());
      setSubmitResult(data);
      return { ok: true, data };
    } catch (e) {
      const err = normalizeApiError(e);
      setSubmitErrors(err);
      if (err.non_field_errors) setGlobalErrors(err.non_field_errors);
      return { ok: false, errors: err };
    } finally {
      setSubmitting(false);
    }
  };

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
    setField,
    setMode,
    onStateChange,
    onDistrictChange,
    checkGeometry,
    submit,
  };
}