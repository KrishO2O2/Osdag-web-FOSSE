# ============================================================
# location_data.py — Group Design App
# Option B: 5 hardcoded cities with IRC 6 (2017) values.
# Structure mirrors what a DB query would return, making
# the upgrade to Option A (extra credit DB) a drop-in swap.
# ============================================================

CITY_IRC_DATA = {
    "Mumbai": {
        "state": "Maharashtra",
        "district": "Mumbai",
        "wind_speed": 44,
        "seismic_zone": "III",
        "zone_factor": 0.16,
        "shade_air_temp_max": 45,
        "shade_air_temp_min": 8,
    },
    "Delhi": {
        "state": "Delhi",
        "district": "New Delhi",
        "wind_speed": 47,
        "seismic_zone": "IV",
        "zone_factor": 0.24,
        "shade_air_temp_max": 48,
        "shade_air_temp_min": 0,
    },
    "Chennai": {
        "state": "Tamil Nadu",
        "district": "Chennai",
        "wind_speed": 50,
        "seismic_zone": "II",
        "zone_factor": 0.10,
        "shade_air_temp_max": 44,
        "shade_air_temp_min": 16,
    },
    "Kolkata": {
        "state": "West Bengal",
        "district": "Kolkata",
        "wind_speed": 50,
        "seismic_zone": "III",
        "zone_factor": 0.16,
        "shade_air_temp_max": 45,
        "shade_air_temp_min": 8,
    },
    "Bangalore": {
        "state": "Karnataka",
        "district": "Bengaluru",
        "wind_speed": 33,
        "seismic_zone": "II",
        "zone_factor": 0.10,
        "shade_air_temp_max": 38,
        "shade_air_temp_min": 8,
    },
}

# Flat list for the /master-data/ endpoint
CITY_LIST = list(CITY_IRC_DATA.keys())
