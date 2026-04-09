# ============================================================
# urls.py — Group Design App
# ============================================================

from django.urls import path
from .views import (
    MasterDataView,
    LocationLookupView,
    CheckGeometryView,
    GroupDesignSubmitView,
)

urlpatterns = [
    # GET  — static dropdown options
    path("master-data/",     MasterDataView.as_view(),      name="gd-master-data"),

    # GET  — IRC values for a city (?city=Mumbai)
    path("location/",        LocationLookupView.as_view(),  name="gd-location"),

    # POST — validate additional geometry fields
    path("check-geometry/",  CheckGeometryView.as_view(),   name="gd-check-geometry"),

    # POST — full form submission and validation
    path("submit/",          GroupDesignSubmitView.as_view(), name="gd-submit"),
]
