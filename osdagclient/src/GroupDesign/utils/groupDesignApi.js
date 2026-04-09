import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_GROUP_DESIGN_API_BASE ||
  "http://localhost:8000/api/group-design/";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export async function fetchMasterData() {
  const { data } = await api.get("master-data/");
  return data;
}

export async function fetchLocationByCity(city) {
  const { data } = await api.get("location/", { params: { city } });
  return data;
}

export async function checkGeometryApi(payload) {
  const { data } = await api.post("check-geometry/", payload);
  return data;
}

export async function submitGroupDesignApi(payload) {
  const { data } = await api.post("submit/", payload);
  return data;
}

export function normalizeApiError(error) {
  if (!error?.response) {
    return { non_field_errors: ["Network error. Please check backend connection."] };
  }

  const { status, data } = error.response;

  if (status === 400 && data?.errors && typeof data.errors === "object") {
    return data.errors;
  }

  if (status === 400 && data && typeof data === "object") {
    return data;
  }

  if (status === 404 && data?.error) {
    return { non_field_errors: [data.error] };
  }

  if (status >= 500) {
    return { non_field_errors: ["Server error. Please try again."] };
  }

  return { non_field_errors: ["Something went wrong. Please retry."] };
}