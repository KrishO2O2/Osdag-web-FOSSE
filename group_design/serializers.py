# ============================================================
# serializers.py — Group Design App
# All validation mirrors the frontend validators.js exactly.
# Exact error messages match the FOSSEE spec.
# ============================================================

from rest_framework import serializers


# ── Constants ──────────────────────────────────────────────
SPAN_MIN, SPAN_MAX               = 20, 45
CARRIAGEWAY_MIN, CARRIAGEWAY_MAX = 4.25, 24
SKEW_MIN, SKEW_MAX               = -15, 15
STEEL_GRADES                     = ["E250", "E350", "E450"]
CONCRETE_GRADES                  = [f"M{g}" for g in range(25, 65, 5)]  # M25..M60
FOOTPATH_CHOICES                 = ["none", "single", "both"]
LOCATION_MODES                   = ["location_lookup", "custom_loading"]


# ── 1. Master Data ─────────────────────────────────────────
# (No serializer needed — view returns static data directly)


# ── 2. Location Lookup ─────────────────────────────────────
class LocationLookupSerializer(serializers.Serializer):
    city = serializers.CharField(max_length=100)


# ── 3. Additional Geometry ─────────────────────────────────
class AdditionalGeometrySerializer(serializers.Serializer):
    girder_spacing     = serializers.FloatField(min_value=0.01)
    number_of_girders  = serializers.IntegerField(min_value=2)
    deck_overhang_width = serializers.FloatField(min_value=0)
    carriageway_width  = serializers.FloatField()   # needed for OW calculation

    def validate(self, data):
        cw  = data["carriageway_width"]
        gs  = round(data["girder_spacing"], 1)
        ng  = data["number_of_girders"]
        dow = round(data["deck_overhang_width"], 1)
        ow  = cw + 5  # Overall Bridge Width

        errors = {}

        if gs >= ow:
            errors["girder_spacing"] = (
                f"Spacing must be < overall width ({ow:.1f} m)."
            )
        if dow >= ow:
            errors["deck_overhang_width"] = (
                f"Overhang must be < overall width ({ow:.1f} m)."
            )

        if not errors:
            expected = (ow - dow) / gs
            if abs(expected - ng) > 0.5:
                errors["non_field_errors"] = (
                    f"Values inconsistent. With overall width {ow:.1f} m, "
                    f"overhang {dow:.1f} m, spacing {gs:.1f} m — "
                    f"girders should be {round(expected)}."
                )

        if errors:
            raise serializers.ValidationError(errors)

        # Return rounded values
        data["girder_spacing"]      = gs
        data["deck_overhang_width"] = dow
        return data


# ── 4. Project Location (nested inside main form) ──────────
class ProjectLocationSerializer(serializers.Serializer):
    mode = serializers.ChoiceField(choices=LOCATION_MODES)

    # Mode 1 fields
    city  = serializers.CharField(max_length=100, required=False, allow_blank=True)

    # Mode 2 fields (custom loading)
    wind_speed         = serializers.FloatField(required=False, min_value=0)
    seismic_zone       = serializers.CharField(max_length=5, required=False)
    zone_factor        = serializers.FloatField(required=False, min_value=0)
    shade_air_temp_max = serializers.FloatField(required=False)
    shade_air_temp_min = serializers.FloatField(required=False)

    def validate(self, data):
        mode = data["mode"]

        if mode == "location_lookup":
            if not data.get("city"):
                raise serializers.ValidationError(
                    {"city": "City is required for location lookup mode."}
                )

        elif mode == "custom_loading":
            required = ["wind_speed", "seismic_zone", "zone_factor",
                        "shade_air_temp_max", "shade_air_temp_min"]
            missing = [f for f in required if data.get(f) is None]
            if missing:
                raise serializers.ValidationError(
                    {f: "Required for custom loading mode." for f in missing}
                )
            if (data.get("shade_air_temp_min") is not None and
                    data.get("shade_air_temp_max") is not None and
                    data["shade_air_temp_min"] >= data["shade_air_temp_max"]):
                raise serializers.ValidationError(
                    {"shade_air_temp_min": "Min temperature must be less than Max."}
                )

        return data


# ── 5. Full Form Submission ─────────────────────────────────
class GeometricInputsSerializer(serializers.Serializer):
    span               = serializers.FloatField()
    carriageway_width  = serializers.FloatField()
    footpath           = serializers.ChoiceField(choices=FOOTPATH_CHOICES)
    skew_angle         = serializers.FloatField()
    girder_spacing     = serializers.FloatField(min_value=0.01)
    number_of_girders  = serializers.IntegerField(min_value=2)
    deck_overhang_width = serializers.FloatField(min_value=0)

    def validate_span(self, value):
        if value < SPAN_MIN or value > SPAN_MAX:
            raise serializers.ValidationError("Outside the software range.")
        return value

    def validate_carriageway_width(self, value):
        if value < CARRIAGEWAY_MIN or value >= CARRIAGEWAY_MAX:
            raise serializers.ValidationError(
                f"Must be \u2265 {CARRIAGEWAY_MIN} m and < {CARRIAGEWAY_MAX} m."
            )
        return value

    def validate_skew_angle(self, value):
        if value < SKEW_MIN or value > SKEW_MAX:
            raise serializers.ValidationError(
                "IRC 24 (2010) requires detailed analysis."
            )
        return value

    def validate(self, data):
        cw  = data.get("carriageway_width", 0)
        gs  = round(data.get("girder_spacing", 0), 1)
        ng  = data.get("number_of_girders", 0)
        dow = round(data.get("deck_overhang_width", 0), 1)
        ow  = cw + 5

        errors = {}
        if gs >= ow:
            errors["girder_spacing"] = f"Spacing must be < overall width ({ow:.1f} m)."
        if dow >= ow:
            errors["deck_overhang_width"] = f"Overhang must be < overall width ({ow:.1f} m)."
        if not errors:
            expected = (ow - dow) / gs if gs > 0 else 0
            if abs(expected - ng) > 0.5:
                errors["number_of_girders"] = (
                    f"Inconsistent. Expected ~{round(expected)} girders."
                )
        if errors:
            raise serializers.ValidationError(errors)

        data["girder_spacing"]      = gs
        data["deck_overhang_width"] = dow
        return data


class MaterialInputsSerializer(serializers.Serializer):
    girder_steel        = serializers.ChoiceField(choices=STEEL_GRADES)
    cross_bracing_steel = serializers.ChoiceField(choices=STEEL_GRADES)
    deck_concrete       = serializers.ChoiceField(choices=CONCRETE_GRADES)


class GroupDesignSubmitSerializer(serializers.Serializer):
    structure_type   = serializers.ChoiceField(choices=["highway", "other"])
    project_location = ProjectLocationSerializer()
    geometric_inputs = GeometricInputsSerializer()
    material_inputs  = MaterialInputsSerializer()

    def validate_structure_type(self, value):
        if value == "other":
            raise serializers.ValidationError("Other structures not included.")
        return value
