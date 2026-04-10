# ============================================================
# serializers.py — Group Design validation
# Keeps frontend/backend validation messages consistent
# ============================================================

from rest_framework import serializers


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
    number_of_girders = serializers.IntegerField(required=True, min_value=2)  # FIXED: consistent >= 2
    deck_overhang_width = serializers.FloatField(required=True, min_value=0.0)

    def validate(self, attrs):
        cw = attrs.get("carriageway_width")
        gs = attrs.get("girder_spacing")
        ng = attrs.get("number_of_girders")
        dow = attrs.get("deck_overhang_width")

        # same logic as your view uses
        overall_width = cw + 5.0

        # effective width left for girder spacing after both overhangs
        effective_width = overall_width - (2 * dow)

        if effective_width <= 0:
            raise serializers.ValidationError({
                "deck_overhang_width": [
                    f"Deck overhang too large for overall width {overall_width:.1f} m."
                ]
            })

        # expected count from spacing
        # intervals = effective_width / spacing
        # girders = intervals + 1 (rounded to nearest practical integer for this validation)
        expected_girders = int(round((effective_width / gs) + 1))

        if expected_girders < 2:
            expected_girders = 2

        if ng != expected_girders:
            raise serializers.ValidationError({
                "non_field_errors": [
                    (
                        f"Values inconsistent. With overall width {overall_width:.1f} m, "
                        f"overhang {dow:.1f} m, spacing {gs:.1f} m — girders should be {expected_girders}."
                    )
                ]
            })

        return attrs


# ------------------------------------------------------------
# 3) Nested serializers for full submit
# POST /api/group-design/submit/
# ------------------------------------------------------------
class ProjectLocationSerializer(serializers.Serializer):
    mode = serializers.ChoiceField(choices=["location_lookup", "custom_loading"])

    # lookup mode (current backend expects city field)
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
            city = attrs.get("city")
            if not city:
                raise serializers.ValidationError({"city": ["This field is required."]})

        elif mode == "custom_loading":
            required_custom = [
                "wind_speed",
                "seismic_zone",
                "zone_factor",
                "shade_air_temp_max",
                "shade_air_temp_min",
            ]
            errors = {}
            for f in required_custom:
                v = attrs.get(f, None)
                if v is None or (isinstance(v, str) and v.strip() == ""):
                    errors[f] = ["This field is required."]
            if errors:
                raise serializers.ValidationError(errors)

        return attrs


class GeometricInputsSerializer(serializers.Serializer):
    span = serializers.FloatField(required=True, min_value=0.1)
    carriageway_width = serializers.FloatField(required=True, min_value=0.1)
    footpath = serializers.ChoiceField(choices=["none", "single", "both"])
    skew_angle = serializers.FloatField(required=True, min_value=0.0, max_value=90.0)

    girder_spacing = serializers.FloatField(required=True, min_value=0.1)
    number_of_girders = serializers.IntegerField(required=True, min_value=2)  # FIXED: consistent >= 2
    deck_overhang_width = serializers.FloatField(required=True, min_value=0.0)

    def validate(self, attrs):
        cw = attrs.get("carriageway_width")
        gs = attrs.get("girder_spacing")
        ng = attrs.get("number_of_girders")
        dow = attrs.get("deck_overhang_width")

        overall_width = cw + 5.0
        effective_width = overall_width - (2 * dow)

        if effective_width <= 0:
            raise serializers.ValidationError({
                "deck_overhang_width": [
                    f"Deck overhang too large for overall width {overall_width:.1f} m."
                ]
            })

        expected_girders = int(round((effective_width / gs) + 1))
        if expected_girders < 2:
            expected_girders = 2

        if ng != expected_girders:
            raise serializers.ValidationError({
                "non_field_errors": [
                    (
                        f"Values inconsistent. With overall width {overall_width:.1f} m, "
                        f"overhang {dow:.1f} m, spacing {gs:.1f} m — girders should be {expected_girders}."
                    )
                ]
            })

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