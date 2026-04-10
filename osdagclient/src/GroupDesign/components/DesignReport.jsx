// ============================================================
// DesignReport.jsx — Group Design Module
// PDF report generated client-side via @react-pdf/renderer
// ============================================================

import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";

const S = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a2e",
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    backgroundColor: "#ffffff",
  },

  headerBlock: {
    borderBottomWidth: 2,
    borderBottomColor: "#1a4080",
    paddingBottom: 8,
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#1a4080",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 10,
    color: "#50687a",
  },
  headerMeta: {
    fontSize: 9,
    color: "#888888",
    marginTop: 4,
  },

  sectionHeading: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#1a4080",
    backgroundColor: "#e8f0fb",
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginBottom: 6,
    marginTop: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#4caf50",
  },

  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#d0dae8",
    paddingVertical: 5,
    paddingHorizontal: 2,
  },
  rowAlt: {
    backgroundColor: "#f4f7fb",
  },
  label: {
    width: "45%",
    color: "#50687a",
    fontSize: 10,
  },
  value: {
    width: "55%",
    fontFamily: "Helvetica-Bold",
    color: "#1a1a2e",
    fontSize: 10,
  },
  valueGreen: {
    width: "55%",
    fontFamily: "Helvetica-Bold",
    color: "#2e7d32",
    fontSize: 10,
  },

  badgePass: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 3,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    alignSelf: "flex-start",
  },
  badgeFail: {
    backgroundColor: "#ffebee",
    color: "#c62828",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 3,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    alignSelf: "flex-start",
  },

  formulaBox: {
    backgroundColor: "#f4f7fb",
    borderWidth: 0.5,
    borderColor: "#c0cfe0",
    borderRadius: 3,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 6,
    fontSize: 9,
    color: "#1a4080",
    fontFamily: "Helvetica-Oblique",
    lineHeight: 1.4,
  },

  imageBlock: {
    marginTop: 10,
    alignItems: "center",
  },
  bridgeImage: {
    width: "100%",
    maxHeight: 180,
    objectFit: "contain",
  },
  imageCaption: {
    fontSize: 8,
    color: "#888888",
    textAlign: "center",
    marginTop: 4,
  },

  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    borderTopWidth: 0.5,
    borderTopColor: "#c0cfe0",
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: "#888888",
  },
});

function Row({ label, value, alt = false, green = false }) {
  return (
    <View style={[S.row, alt && S.rowAlt]}>
      <Text style={S.label}>{label}</Text>
      <Text style={green ? S.valueGreen : S.value}>{value}</Text>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View wrap={false}>
      <Text style={S.sectionHeading}>{title}</Text>
      {children}
    </View>
  );
}

function na(v) {
  return v !== undefined && v !== null && String(v).trim() !== "" ? String(v) : "—";
}

function safeNum(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

function toTitleCase(s) {
  if (!s) return "—";
  return String(s)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function DesignReport({ gd, bridgeImageSrc }) {
  const f = gd?.form || {};
  const irc = gd?.ircValues || {};
  const geo = gd?.geometryResult || {};
  const sub = gd?.submitResult || {};

  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const cw = safeNum(f.carriageway_width);
  const span = safeNum(f.span);
  const skew = safeNum(f.skew_angle);
  const gs = safeNum(f.girder_spacing);
  const ng = safeNum(f.number_of_girders);
  const dow = safeNum(f.deck_overhang_width);
  const overallWidth = cw !== null ? cw + 5 : null;

  const geometryComputedValue =
    overallWidth !== null && dow !== null && gs !== null && gs !== 0
      ? (overallWidth - dow) / gs
      : null;

  const geoPassFromBackend =
    typeof geo?.valid === "boolean"
      ? geo.valid
      : typeof geo?.is_valid === "boolean"
      ? geo.is_valid
      : null;

  const structureTypeLabel =
    f.structure_type === "highway" ? "Highway" : toTitleCase(f.structure_type);

  return (
    <Document title="Group Design Report — Osdag Web" author="Osdag Web Group Design Module">
      <Page size="A4" style={S.page}>
        <View style={S.headerBlock}>
          <Text style={S.headerTitle}>Osdag Group Design Report</Text>
          <Text style={S.headerSubtitle}>
            Bridge Module — IRC 6 (2017) / IRC 24 (2010) reference values
          </Text>
          <Text style={S.headerMeta}>Generated: {today}</Text>
        </View>

        <Section title="1. Project Header">
          <Row label="Structure Type" value={na(structureTypeLabel)} />
          <Row label="Date" value={today} alt />
          <Row label="Mode" value={f.mode === "lookup" ? "Location Lookup" : "Custom Loading"} />
        </Section>

        <Section title="2. Project Location">
          <Row label="State" value={na(f.state)} />
          <Row label="District / City" value={na(f.district || f.city || f.location_name)} alt />
          <Row
            label="Wind Speed"
            value={na(irc.wind_speed ?? f.wind_speed) !== "—" ? `${na(irc.wind_speed ?? f.wind_speed)} m/s` : "—"}
            green
          />
          <Row label="Seismic Zone" value={na(irc.seismic_zone ?? f.seismic_zone)} alt green />
          <Row label="Zone Factor" value={na(irc.zone_factor ?? f.zone_factor)} green />
          <Row
            label="Shade Air Temp Max"
            value={
              na(irc.shade_air_temp_max ?? f.shade_air_temp_max) !== "—"
                ? `${na(irc.shade_air_temp_max ?? f.shade_air_temp_max)} °C`
                : "—"
            }
            alt
            green
          />
          <Row
            label="Shade Air Temp Min"
            value={
              na(irc.shade_air_temp_min ?? f.shade_air_temp_min) !== "—"
                ? `${na(irc.shade_air_temp_min ?? f.shade_air_temp_min)} °C`
                : "—"
            }
            green
          />
        </Section>

        <Section title="3. Geometric Inputs">
          <Row label="Span" value={span !== null ? `${span} m` : "—"} />
          <Row label="Carriageway Width" value={cw !== null ? `${cw} m` : "—"} alt />
          <Row
            label="Footpath"
            value={f.footpath ? toTitleCase(f.footpath) : "—"}
          />
          <Row label="Skew Angle" value={skew !== null ? `${skew} °` : "—"} alt />
        </Section>

        <Section title="4. Additional Geometry">
          <Row label="Girder Spacing" value={gs !== null ? `${gs} m` : "—"} />
          <Row label="Number of Girders" value={ng !== null ? `${ng}` : "—"} alt />
          <Row label="Deck Overhang Width" value={dow !== null ? `${dow} m` : "—"} />

          {overallWidth !== null && (
            <Row
              label="Overall Width"
              value={`${overallWidth.toFixed(2)} m (Carriageway + 5.0 m)`}
              alt
            />
          )}

          {geometryComputedValue !== null && (
            <Text style={S.formulaBox}>
              Formula check: (Overall Width − Deck Overhang Width) ÷ Girder Spacing{"\n"}
              ({overallWidth.toFixed(2)} − {dow}) ÷ {gs} = {geometryComputedValue.toFixed(2)}
              {ng !== null ? ` (input girders: ${ng})` : ""}
            </Text>
          )}
        </Section>

        <Section title="5. Material Inputs">
          <Row label="Girder Steel" value={na(f.girder_steel)} />
          <Row label="Cross Bracing Steel" value={na(f.cross_bracing_steel)} alt />
          <Row label="Deck Concrete" value={na(f.deck_concrete)} />
        </Section>

        <Section title="6. Geometry Validation Result">
          {geoPassFromBackend !== null ? (
            <Text style={geoPassFromBackend ? S.badgePass : S.badgeFail}>
              {geoPassFromBackend ? "Geometry check: PASS" : "Geometry check: FAIL"}
            </Text>
          ) : (
            <Text style={S.value}>Geometry check not run.</Text>
          )}

          {!!geo?.formula_check && <Text style={S.formulaBox}>{geo.formula_check}</Text>}
          {!!geo?.message && <Text style={S.formulaBox}>{geo.message}</Text>}
        </Section>

        <Section title="7. Reference Diagram">
          {bridgeImageSrc ? (
            <View style={S.imageBlock}>
              <Image src={bridgeImageSrc} style={S.bridgeImage} />
              <Text style={S.imageCaption}>
                Bridge cross-section — reference diagram used in UI
              </Text>
            </View>
          ) : (
            <Text style={S.value}>Image unavailable.</Text>
          )}
        </Section>

        {!!sub?.success && (
          <Section title="Validation Summary">
            <Text style={S.badgePass}>
              {sub.message || "All inputs validated successfully by backend."}
            </Text>
          </Section>
        )}

        <View style={S.footer} fixed>
          <Text style={S.footerText}>Generated by Osdag Web Group Design Module</Text>
          <Text
            style={S.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}