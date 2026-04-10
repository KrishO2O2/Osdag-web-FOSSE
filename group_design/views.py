# ============================================================
# views.py — Group Design App
# Existing endpoints:
#   GET  /api/group-design/master-data/
#   GET  /api/group-design/location/
#   POST /api/group-design/check-geometry/
#   POST /api/group-design/submit/
#
# Added extra-credit endpoint:
#   GET  /api/group-design/location-data/
#     - no query params                     -> states
#     - ?state=<state>                      -> districts for state
#     - ?state=<state>&district=<district>  -> engineering values
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

# NEW: utility-backed state/district dataset service
from .location_data_service import (
    list_states,
    list_districts_for_state,
    get_location_values,
)


# ── 1. Master Data ─────────────────────────────────────────
class MasterDataView(APIView):
    """
    GET /api/group-design/master-data/
    Returns all static dropdown options the frontend needs.
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


# ── 2. Location Lookup (existing city-based API) ───────────
class LocationLookupView(APIView):
    """
    GET /api/group-design/location/?city=Mumbai
    Returns IRC values for the requested city.
    """

    def get(self, request):
        serializer = LocationLookupSerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        city = serializer.validated_data["city"]

        if city not in CITY_IRC_DATA:
            return Response(
                {"error": f"City '{city}' not found. Available cities: {', '.join(CITY_LIST)}."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(CITY_IRC_DATA[city], status=status.HTTP_200_OK)


# ── 2B. Extra-Credit State/District Location Data ──────────
class LocationDataView(APIView):
    """
    GET /api/group-design/location-data/
      -> {"states": [...]}

    GET /api/group-design/location-data/?state=Maharashtra
      -> {"state": "Maharashtra", "districts": [...]}

    GET /api/group-design/location-data/?state=Maharashtra&district=Mumbai
      -> {
           "state": "...",
           "district": "...",
           "wind_speed": ...,
           "seismic_zone": "...",
           "zone_factor": ...,
           "shade_air_temp_max": ...,
           "shade_air_temp_min": ...
         }
    """

    def get(self, request):
        state_q = request.query_params.get("state")
        district_q = request.query_params.get("district")

        # 1) list states
        if not state_q:
            return Response({"states": list_states()}, status=status.HTTP_200_OK)

        # 2) list districts for state
        if state_q and not district_q:
            districts = list_districts_for_state(state_q)
            return Response(
                {"state": state_q, "districts": districts},
                status=status.HTTP_200_OK,
            )

        # 3) return values for state + district
        row = get_location_values(state_q, district_q)
        if not row:
            return Response(
                {"error": "No location data found for given state/district."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "state": row["state"],
                "district": row["district"],
                "wind_speed": row["wind_speed"],
                "seismic_zone": row["seismic_zone"],
                "zone_factor": row["zone_factor"],
                "shade_air_temp_max": row["shade_air_temp_max"],
                "shade_air_temp_min": row["shade_air_temp_min"],
            },
            status=status.HTTP_200_OK,
        )


# ── 3. Check Additional Geometry ───────────────────────────
class CheckGeometryView(APIView):
    """
    POST /api/group-design/check-geometry/
    Validates additional geometry and returns computed fields.
    """

    def post(self, request):
        serializer = AdditionalGeometrySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        d = serializer.validated_data
        cw = d["carriageway_width"]
        gs = d["girder_spacing"]
        ng = d["number_of_girders"]
        dow = d["deck_overhang_width"]
        ow = cw + 5

        return Response({
            "valid": True,
            "overall_bridge_width": ow,
            "girder_spacing": gs,
            "number_of_girders": ng,
            "deck_overhang_width": dow,
            "formula_check": f"({ow:.1f} - {dow:.1f}) / {gs:.1f} = {(ow - dow) / gs:.2f}",
        }, status=status.HTTP_200_OK)


# ── 4. Full Form Submit ─────────────────────────────────────
class GroupDesignSubmitView(APIView):
    """
    POST /api/group-design/submit/
    Validates full payload and returns acknowledgement.
    """

    def post(self, request):
        serializer = GroupDesignSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"success": False, "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data

        irc_values = None
        loc = data["project_location"]

        if loc["mode"] == "location_lookup":
            city = loc.get("city", "")
            irc_values = CITY_IRC_DATA.get(city)
        elif loc["mode"] == "custom_loading":
            irc_values = {
                "wind_speed": loc["wind_speed"],
                "seismic_zone": loc["seismic_zone"],
                "zone_factor": loc["zone_factor"],
                "shade_air_temp_max": loc["shade_air_temp_max"],
                "shade_air_temp_min": loc["shade_air_temp_min"],
            }

        return Response({
            "success": True,
            "message": "Group Design inputs validated successfully.",
            "submitted_data": data,
            "irc_values": irc_values,
        }, status=status.HTTP_200_OK)
    