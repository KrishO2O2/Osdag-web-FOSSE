from rest_framework import serializers

STEEL_GRADES = ["E250", "E350", "E450"]
CONCRETE_GRADES = [f"M{i}" for i in range(25, 65, 5)]


class ProjectLocationSerializer(serializers.Serializer):
    mode = serializers.ChoiceField(choices=["location_lookup", "custom_loading"])
    state = serializers.CharField(required=False, allow_blank=True)
    district = serializers.CharField(required=False, allow_blank=True)

    wind_speed = serializers.FloatField(required=False, allow_null=True)
    seismic_zone = serializers.CharField(required=False, allow_blank=True)
    zone_factor = serializers.FloatField(required=False, allow_null=True)
    shade_air_temp_max = serializers.FloatField(required=False, allow_null=True)
    shade_air_temp_min = serializers.FloatField(required=False, allow_null=True)

    def validate(self, attrs):
        mode = attrs.get("mode")

        if mode == "location_lookup":
            if not attrs.get("state"):
                raise serializers.ValidationError({"state": ["State is required."]})
            if not attrs.get("district"):
                raise serializers.ValidationError({"city": ["District is required."]})

        if mode == "custom_loading":
            required_map = {
                "wind_speed": "Basic Wind Speed is required.",
                "seismic_zone": "Seismic Zone is required.",
                "zone_factor": "Zone Factor is required.",
                "shade_air_temp_max": "Shade Air Temp Max is required.",
                "shade_air_temp_min": "Shade Air Temp Min is required.",
            }
            errors = {}
            for key, msg in required_map.items():
                v = attrs.get(key)
                if v in ("", None):
                    errors[key] = [msg]
            if errors:
                raise serializers.ValidationError(errors)

        return attrs


class GeometricInputsSerializer(serializers.Serializer):
    span = serializers.FloatField(required=True)
    carriageway_width = serializers.FloatField(required=True)
    footpath = serializers.ChoiceField(choices=["single", "both", "none"])
    skew_angle = serializers.FloatField(required=True)

    girder_spacing = serializers.FloatField(required=True)
    number_of_girders = serializers.IntegerField(required=True)
    deck_overhang_width = serializers.FloatField(required=True)

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

    def validate_girder_spacing(self, value):
        return round(value, 1)

    def validate_deck_overhang_width(self, value):
        return round(value, 1)

    def validate_number_of_girders(self, value):
        if value < 1:
            raise serializers.ValidationError("No. of Girders must be at least 1.")
        return value

    def validate(self, attrs):
        cw = attrs["carriageway_width"]
        gs = attrs["girder_spacing"]
        ng = attrs["number_of_girders"]
        dow = attrs["deck_overhang_width"]

        overall_width = round(cw + 5.0, 1)

        errors = {}

        if gs >= overall_width:
            errors["girder_spacing"] = ["Girder spacing must be less than the overall bridge width."]
        if dow >= overall_width:
            errors["deck_overhang_width"] = ["Deck overhang width must be less than the overall bridge width."]
        if gs <= 0:
            errors["girder_spacing"] = ["Girder spacing must be greater than 0."]
        if dow < 0:
            errors["deck_overhang_width"] = ["Deck overhang width cannot be negative."]

        if errors:
            raise serializers.ValidationError(errors)

        expected = (overall_width - dow) / gs

        if abs(expected - ng) > 0.15:
            raise serializers.ValidationError(
                {
                    "non_field_errors": [
                        f"Geometry mismatch. ({overall_width:.1f} - {dow:.1f}) / {gs:.1f} must equal No. of Girders."
                    ]
                }
            )

        attrs["girder_spacing"] = round(gs, 1)
        attrs["deck_overhang_width"] = round(dow, 1)
        return attrs


class MaterialInputsSerializer(serializers.Serializer):
    girder_steel = serializers.ChoiceField(choices=STEEL_GRADES)
    cross_bracing_steel = serializers.ChoiceField(choices=STEEL_GRADES)
    deck_concrete = serializers.ChoiceField(choices=CONCRETE_GRADES)


class GroupDesignSubmitSerializer(serializers.Serializer):
    structure_type = serializers.ChoiceField(choices=["highway", "other"])
    project_location = ProjectLocationSerializer()
    geometric_inputs = GeometricInputsSerializer()
    material_inputs = MaterialInputsSerializer()

    def validate(self, attrs):
        if attrs["structure_type"] == "other":
            raise serializers.ValidationError(
                {"structure_type": ["Other structures not included."]}
            )
        return attrs