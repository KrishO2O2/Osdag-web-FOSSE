// ============================================================
// BridgeDiagramPanel.jsx — Group Design Module
// Reference mode only: official FOSSEE image + live text overlay
// Calibrated: carriageway pill moved from top: 20% -> 15%
// ============================================================

import React from "react";
import bridgeImage from "../assets/bridge_cross_section.jpg";

function Pill({ children, color = "#4caf50", style = {} }) {
  return (
    <div
      style={{
        position: "absolute",
        background: "rgba(8, 20, 48, 0.88)",
        border: `1px solid ${color}`,
        borderRadius: "3px",
        color,
        fontSize: "11px",
        fontWeight: 600,
        padding: "2px 8px",
        pointerEvents: "none",
        whiteSpace: "nowrap",
        letterSpacing: "0.2px",
        transform: "translateX(-50%)",
        zIndex: 3,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function DimBar({ leftPct, rightPct, topPct, color = "#4caf50" }) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: leftPct,
          width: `calc(${rightPct} - ${leftPct})`,
          top: topPct,
          height: "1px",
          background: color,
          pointerEvents: "none",
          transform: "translateY(-50%)",
          zIndex: 2,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: leftPct,
          top: topPct,
          width: "1px",
          height: "8px",
          background: color,
          pointerEvents: "none",
          transform: "translate(0, -50%)",
          zIndex: 2,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: rightPct,
          top: topPct,
          width: "1px",
          height: "8px",
          background: color,
          pointerEvents: "none",
          transform: "translate(-1px, -50%)",
          zIndex: 2,
        }}
      />
    </>
  );
}

function ReferenceOverlay({
  carriageway_width,
  number_of_girders,
  girder_spacing,
  deck_overhang_width,
}) {
  const cw = parseFloat(carriageway_width);
  const ng = parseInt(number_of_girders, 10);
  const gs = parseFloat(girder_spacing);
  const dow = parseFloat(deck_overhang_width);

  const hasCW = Number.isFinite(cw) && cw > 0;
  const hasNG = Number.isFinite(ng) && ng > 0;
  const hasGS = Number.isFinite(gs) && gs > 0;
  const hasDOW = Number.isFinite(dow) && dow >= 0;

  if (!hasCW && !hasNG && !hasGS && !hasDOW) return null;

  return (
    <>
      {/* Carriageway Width */}
      {hasCW && (
        <>
          <DimBar leftPct="21%" rightPct="79%" topPct="27%" color="#4caf50" />
          <Pill color="#4caf50" style={{ left: "50%", top: "15%" }}>
            Carriageway Width = {cw.toFixed(2)} m
          </Pill>
        </>
      )}

      {/* Overhang Width left + right */}
      {hasDOW && dow > 0 && (
        <>
          <DimBar leftPct="7%" rightPct="21%" topPct="47%" color="#9a8ad8" />
          <Pill color="#9a8ad8" style={{ left: "14%", top: "40%", fontSize: "10px" }}>
            {dow.toFixed(1)} m
          </Pill>

          <DimBar leftPct="79%" rightPct="93%" topPct="47%" color="#9a8ad8" />
          <Pill color="#9a8ad8" style={{ left: "86%", top: "40%", fontSize: "10px" }}>
            {dow.toFixed(1)} m
          </Pill>
        </>
      )}

      {/* N Girders @ Spacing */}
      {hasNG && hasGS && (
        <Pill color="#5a9ad8" style={{ left: "50%", top: "63%" }}>
          {ng} Girders Spaced at {gs.toFixed(1)} m
        </Pill>
      )}
    </>
  );
}

export default function BridgeDiagramPanel({
  carriageway_width = "",
  number_of_girders = "",
  girder_spacing = "",
  deck_overhang_width = "",
}) {
  const hasValues =
    Number.isFinite(parseFloat(carriageway_width)) && parseFloat(carriageway_width) > 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#1a1a2e",
        border: "1px solid #1a4080",
        borderRadius: "6px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "6px 12px",
          background: "#0f3460",
          borderBottom: "1px solid #1a4080",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#4caf50",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          Bridge Cross Section (For Nomenclature Only)
        </span>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", width: "100%", maxWidth: "100%" }}>
          <img
            src={bridgeImage}
            alt="Bridge cross-section reference diagram"
            style={{ width: "100%", height: "auto", display: "block", borderRadius: "3px" }}
            draggable={false}
          />

          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <ReferenceOverlay
              carriageway_width={carriageway_width}
              number_of_girders={number_of_girders}
              girder_spacing={girder_spacing}
              deck_overhang_width={deck_overhang_width}
            />
          </div>

          {!hasValues && (
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(8,20,48,0.80)",
                border: "1px solid #2a4a8a",
                borderRadius: "3px",
                color: "#6a9ad8",
                fontSize: "10px",
                padding: "3px 12px",
                whiteSpace: "nowrap",
                pointerEvents: "none",
                zIndex: 4,
              }}
            >
              Fill in form values to see live dimension annotations
            </div>
          )}
        </div>
      </div>
    </div>
  );
}