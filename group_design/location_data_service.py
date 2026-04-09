import json
from pathlib import Path
from functools import lru_cache


DATA_FILE = Path(__file__).resolve().parent / "data" / "location_data.json"


@lru_cache(maxsize=1)
def _load_rows():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        rows = json.load(f)

    # basic normalization
    cleaned = []
    for r in rows:
        cleaned.append({
            "state": str(r["state"]).strip(),
            "district": str(r["district"]).strip(),
            "wind_speed": float(r["wind_speed"]),
            "seismic_zone": str(r["seismic_zone"]).strip(),
            "zone_factor": float(r["zone_factor"]),
            "shade_air_temp_max": float(r["shade_air_temp_max"]),
            "shade_air_temp_min": float(r["shade_air_temp_min"]),
        })
    return cleaned


def list_states():
    rows = _load_rows()
    return sorted({r["state"] for r in rows})


def list_districts_for_state(state: str):
    rows = _load_rows()
    state = state.strip().lower()
    districts = sorted({r["district"] for r in rows if r["state"].lower() == state})
    return districts


def get_location_values(state: str, district: str):
    rows = _load_rows()
    s = state.strip().lower()
    d = district.strip().lower()
    for r in rows:
        if r["state"].lower() == s and r["district"].lower() == d:
            return r
    return None