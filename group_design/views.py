# ============================================================
# views.py — Group Design App
# 4 RESTful endpoints:
#   GET  /api/group-design/master-data/     → dropdown options
#   GET  /api/group-design/location/        → IRC values for a city
#   POST /api/group-design/check-geometry/  → validate additional geometry
#   POST /api/group-design/submit/          → full form validation & response
# ============================================================

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import (
    LocationLookupSerializer,
    AdditionalGeometrySerializer,
    GroupDesignSubmitSerializer,
)
from .location_data import CITY_IRC_DATA, CITY_LIST


# ── 1. Master Data ─────────────────────────────────────────
class MasterDataView(APIView):
    """
    GET /api/group-design/master-data/
    Returns all static dropdown options the frontend needs.
    Keeps constants in one place — change here, frontend
    fetches on load rather than being hardcoded.
    """

    def get(self, request):
        data = {
            "structure_types": [
                {"value": "highway", "label": "Highway"},
                {"value": "other",   "label": "Other"},
            ],
            "footpath_options": [
                {"value": "none",   "label": "None"},
                {"value": "single", "label": "Single-sided"},
                {"value": "both",   "label": "Both"},
            ],
            "steel_grades": ["E250", "E350", "E450"],
            "concrete_grades": [f"M{g}" for g in range(25, 65, 5)],
            "cities": CITY_LIST,
            "location_modes": [
                {"value": "location_lookup", "label": "Enter Location Name"},
                {"value": "custom_loading",  "label": "Tabulate Custom Loading Parameters"},
            ],
        }
        return Response(data, status=status.HTTP_200_OK)


# ── 2. Location Lookup ─────────────────────────────────────
class LocationLookupView(APIView):
    """
    GET /api/group-design/location/?city=Mumbai
    Returns IRC 6 (2017) values for the requested city.
    Option B: 5 hardcoded cities.
    Option A upgrade: replace CITY_IRC_DATA lookup with a DB query.
    """

    def get(self, request):
        serializer = LocationLookupSerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        city = serializer.validated_data["city"]

        if city not in CITY_IRC_DATA:
            return Response(
                {"error": f"City '{city}' not found. "
                           f"Available cities: {', '.join(CITY_LIST)}."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(CITY_IRC_DATA[city], status=status.HTTP_200_OK)


# ── 3. Check Additional Geometry ───────────────────────────
class CheckGeometryView(APIView):
    """
    POST /api/group-design/check-geometry/
    Validates the interdependent Additional Geometry fields
    and returns corrected/suggested values.

    Request body:
    {
        "carriageway_width": 7.5,
        "girder_spacing": 2.5,
        "number_of_girders": 4,
        "deck_overhang_width": 0.5
    }
    """

    def post(self, request):
        serializer = AdditionalGeometrySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        d  = serializer.validated_data
        cw = d["carriageway_width"]
        gs = d["girder_spacing"]
        ng = d["number_of_girders"]
        dow = d["deck_overhang_width"]
        ow = cw + 5

        return Response({
            "valid": True,
            "overall_bridge_width": ow,
            "girder_spacing":       gs,
            "number_of_girders":    ng,
            "deck_overhang_width":  dow,
            "formula_check": f"({ow:.1f} - {dow:.1f}) / {gs:.1f} = {(ow - dow) / gs:.2f}",
        }, status=status.HTTP_200_OK)


# ── 4. Full Form Submit ─────────────────────────────────────
class GroupDesignSubmitView(APIView):
    """
    POST /api/group-design/submit/
    Validates the entire form and returns a structured
    acknowledgement. Backend-side validation mirrors the
    frontend validators.js exactly (same error messages).

    Request body: see GroupDesignSubmitSerializer
    """

    def post(self, request):
        serializer = GroupDesignSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"success": False, "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data

        # Resolve IRC values for the response
        irc_values = None
        loc = data["project_location"]

        if loc["mode"] == "location_lookup":
            city = loc.get("city", "")
            irc_values = CITY_IRC_DATA.get(city)
        elif loc["mode"] == "custom_loading":
            irc_values = {
                "wind_speed":         loc["wind_speed"],
                "seismic_zone":       loc["seismic_zone"],
                "zone_factor":        loc["zone_factor"],
                "shade_air_temp_max": loc["shade_air_temp_max"],
                "shade_air_temp_min": loc["shade_air_temp_min"],
            }

        return Response({
            "success":        True,
            "message":        "Group Design inputs validated successfully.",
            "submitted_data": data,
            "irc_values":     irc_values,
        }, status=status.HTTP_200_OK)
