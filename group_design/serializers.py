# ============================================================
# serializers.py — Group Design validation
# Updated from your previous version
# - keeps old city lookup support
# - adds state/district lookup support
# - aligns validation with current frontend + screening task
# ============================================================

from rest_framework import serializers


def _validate_geometry_rule(cw, gs, ng, dow):
    """
    Screening-task geometry rule:
    Overall Bridge Width = Carriageway Width + 5
    (Overall Width - Overhang) / Spacing = No. of Girders
    """
    overall_width = round(cw + 5.0, 1)
    errors = {}

    if gs <= 0:
        errors["girder_spacing"] = ["Girder spacing must be greater than 0."]
    elif gs >= overall_width:
        errors["girder_spacing"] = ["Girder spacing must be less than the overall bridge width."]

    if dow < 0:
        errors["deck_overhang_width"] = ["Deck overhang width cannot be negative."]
    elif dow >= overall_width:
        errors["deck_overhang_width"] = ["Deck overhang width must be less than the overall bridge width."]

    if ng < 2:
        errors["number_of_girders"] = ["No. of Girders must be at least 2."]

    if errors:
        raise serializers.ValidationError(errors)

    expected = (overall_width - dow) / gs

    if abs(expected - ng) > 0.15:
        raise serializers.ValidationError({
            "non_field_errors": [
                f"Geometry mismatch. ({overall_width:.1f} - {dow:.1f}) / {gs:.1f} must equal No. of Girders."
            ]
        })

    return overall_width


# ------------------------------------------------------------
# 1) Location lookup query serializer (existing endpoint)
# GET /api/group-design/location/?city=Mumbai
# ------------------------------------------------------------
class LocationLookupSerializer(serializers.Serializer):
    city = serializers.CharField(required=True, allow_blank=False)


# ------------------------------------------------------------
# 2) Additional Geometry check serializer
# POST /api/group-design/check-geometry/
# ------------------------------------------------------------
class AdditionalGeometrySerializer(serializers.Serializer):
    carriageway_width = serializers.FloatField(required=True, min_value=0.1)
    girder_spacing = serializers.FloatField(required=True, min_value=0.1)
    number_of_girders = serializers.IntegerField(required=True, min_value=2)
    deck_overhang_width = serializers.FloatField(required=True, min_value=0.0)

    def validate(self, attrs):
        cw = attrs.get("carriageway_width")
        gs = round(attrs.get("girder_spacing"), 1)
        ng = attrs.get("number_of_girders")
        dow = round(attrs.get("deck_overhang_width"), 1)

        _validate_geometry_rule(cw, gs, ng, dow)

        attrs["girder_spacing"] = gs
        attrs["deck_overhang_width"] = dow
        return attrs


# ------------------------------------------------------------
# 3) Nested serializers for full submit
# POST /api/group-design/submit/
# ------------------------------------------------------------
class ProjectLocationSerializer(serializers.Serializer):
    mode = serializers.ChoiceField(choices=["location_lookup", "custom_loading"])

    # new frontend lookup mode
    state = serializers.CharField(required=False, allow_blank=True)
    district = serializers.CharField(required=False, allow_blank=True)

    # backward-compatible old city lookup mode
    city = serializers.CharField(required=False, allow_blank=True)

    # custom mode fields
    wind_speed = serializers.FloatField(required=False, allow_null=True)
    seismic_zone = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    zone_factor = serializers.FloatField(required=False, allow_null=True)
    shade_air_temp_max = serializers.FloatField(required=False, allow_null=True)
    shade_air_temp_min = serializers.FloatField(required=False, allow_null=True)

    def validate(self, attrs):
        mode = attrs.get("mode")

        if mode == "location_lookup":
            state = (attrs.get("state") or "").strip()
            district = (attrs.get("district") or "").strip()
            city = (attrs.get("city") or "").strip()

            # accept either state+district or city
            if (state and district) or city:
                return attrs

            raise serializers.ValidationError({
                "district": ["District is required."]
            })

        elif mode == "custom_loading":
            required_custom = {
                "wind_speed": "Basic Wind Speed is required.",
                "seismic_zone": "Seismic Zone is required.",
                "zone_factor": "Zone Factor is required.",
                "shade_air_temp_max": "Shade Air Temp Max is required.",
                "shade_air_temp_min": "Shade Air Temp Min is required.",
            }

            errors = {}
            for field, message in required_custom.items():
                value = attrs.get(field, None)
                if value is None or (isinstance(value, str) and value.strip() == ""):
                    errors[field] = [message]

            if errors:
                raise serializers.ValidationError(errors)

        return attrs


class GeometricInputsSerializer(serializers.Serializer):
    span = serializers.FloatField(required=True, min_value=0.1)
    carriageway_width = serializers.FloatField(required=True, min_value=0.1)
    footpath = serializers.ChoiceField(choices=["none", "single", "both"])
    skew_angle = serializers.FloatField(required=True)

    girder_spacing = serializers.FloatField(required=True, min_value=0.1)
    number_of_girders = serializers.IntegerField(required=True, min_value=2)
    deck_overhang_width = serializers.FloatField(required=True, min_value=0.0)

    def validate_span(self, value):
        if value < 20 or value > 45:
            raise serializers.ValidationError("Outside the software range.")
        return value

    def validate_carriageway_width(self, value):
        if value < 4.25 or value >= 24:
            raise serializers.ValidationError("Carriageway Width must be ≥ 4.25 m and < 24 m.")
        return value

    def validate_skew_angle(self, value):
        if value < -15 or value > 15:
            raise serializers.ValidationError("IRC 24 (2010) requires detailed analysis.")
        return value

    def validate(self, attrs):
        cw = attrs.get("carriageway_width")
        gs = round(attrs.get("girder_spacing"), 1)
        ng = attrs.get("number_of_girders")
        dow = round(attrs.get("deck_overhang_width"), 1)

        _validate_geometry_rule(cw, gs, ng, dow)

        attrs["girder_spacing"] = gs
        attrs["deck_overhang_width"] = dow
        return attrs


class MaterialInputsSerializer(serializers.Serializer):
    girder_steel = serializers.ChoiceField(choices=["E250", "E350", "E450"])
    cross_bracing_steel = serializers.ChoiceField(choices=["E250", "E350", "E450"])
    deck_concrete = serializers.ChoiceField(choices=[f"M{g}" for g in range(25, 65, 5)])


class GroupDesignSubmitSerializer(serializers.Serializer):
    structure_type = serializers.ChoiceField(choices=["highway", "other"])
    project_location = ProjectLocationSerializer()
    geometric_inputs = GeometricInputsSerializer()
    material_inputs = MaterialInputsSerializer()

    def validate(self, attrs):
        if attrs["structure_type"] == "other":
            raise serializers.ValidationError({
                "structure_type": ["Other structures not included."]
            })
        return attrs
    
    