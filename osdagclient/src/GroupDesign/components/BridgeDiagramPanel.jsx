import React, { useState, useMemo } from "react";
import bridgeImage from "../assets/bridge_cross_section.jpg";

const CLR = {
  deck: "#2b5f98",
  deckS: "#5d8fc5",
  deckTop: "#214f80",

  fp: "#2a4f78",
  fpS: "#4e7fb0",
  fpTxt: "#eaf6ff",

  gdr: "#1e3f66",
  gdrS: "#3d6b9a",
  web: "#24496f",

  dimGreen: "#39a96b",
  dimBlue: "#5aa6e8",
  dimPurple: "#9c8ee6",
  dimGray: "#6f8fae",

  muted: "#54708a",
  iText: "#234c73",
  iLegend: "#1d466d",
  iDisclaimer: "#143a5c",
};

const ML = 48;
const MR = 48;
const MT = 48;
const VW = 580;
const UW = VW - ML - MR;

const DECK_H = 22;
const FP_H = 14;
const FL_H = 7;
const WEB_H = 54;
const WEB_W = 7;

// ----------------------- Reference overlay -----------------------
function Pill({ children, color, style = {} }) {
  return (
    <div
      style={{
        position: "absolute",
        background: "rgba(8,20,48,0.88)",
        border: `1px solid ${color}`,
        borderRadius: 3,
        color,
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 8px",
        pointerEvents: "none",
        whiteSpace: "nowrap",
        letterSpacing: "0.2px",
        transform: "translateX(-50%)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function DimBar({ leftPct, rightPct, topPct, color }) {
  const b = { position: "absolute", pointerEvents: "none" };
  return (
    <>
      <div
        style={{
          ...b,
          left: leftPct,
          right: `calc(100% - ${rightPct})`,
          top: topPct,
          height: 1,
          background: color,
          transform: "translateY(-50%)",
        }}
      />
      <div
        style={{
          ...b,
          left: leftPct,
          top: topPct,
          width: 1,
          height: 8,
          background: color,
          transform: "translate(0,-50%)",
        }}
      />
      <div
        style={{
          ...b,
          left: rightPct,
          top: topPct,
          width: 1,
          height: 8,
          background: color,
          transform: "translate(-1px,-50%)",
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
  const cw = parseFloat(carriageway_width) || 0;
  const ng = parseInt(number_of_girders, 10) || 0;
  const gs = parseFloat(girder_spacing) || 0;
  const dow = parseFloat(deck_overhang_width) || 0;

  if (cw === 0 && ng === 0) return null;

  return (
    <>
      {cw > 0 && (
        <>
          <DimBar leftPct="21%" rightPct="79%" topPct="27%" color="#4caf50" />
          <Pill color="#4caf50" style={{ left: "50%", top: "17%" }}>
            Carriageway Width = {cw.toFixed(2)} m
          </Pill>
        </>
      )}

      {dow > 0 && (
        <>
          <DimBar leftPct="7%" rightPct="21%" topPct="47%" color="#9a8ad8" />
          <div
            style={{
              position: "absolute",
              left: "3%",
              top: "39%",
              background: "rgba(8,20,48,0.88)",
              border: "1px solid #9a8ad8",
              borderRadius: 3,
              color: "#9a8ad8",
              fontSize: 10,
              fontWeight: 600,
              padding: "2px 6px",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            {dow.toFixed(1)} m
          </div>

          <DimBar leftPct="79%" rightPct="93%" topPct="47%" color="#9a8ad8" />
          <div
            style={{
              position: "absolute",
              right: "3%",
              top: "39%",
              background: "rgba(8,20,48,0.88)",
              border: "1px solid #9a8ad8",
              borderRadius: 3,
              color: "#9a8ad8",
              fontSize: 10,
              fontWeight: 600,
              padding: "2px 6px",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            {dow.toFixed(1)} m
          </div>
        </>
      )}

      {ng > 0 && gs > 0 && (
        <Pill color="#5a9ad8" style={{ left: "50%", top: "63%" }}>
          {ng} Girders Spaced at {gs.toFixed(1)} m
        </Pill>
      )}
    </>
  );
}

// ----------------------- Interactive SVG -----------------------
function DimLine({ x1, x2, y, label, color, small }) {
  const cx = (x1 + x2) / 2;
  const tk = small ? 4 : 5;
  const fs = small ? 10 : 12;
  const lw = label.length * fs * 0.62 + 10;

  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={0.7} />
      <line x1={x1} y1={y - tk} x2={x1} y2={y + tk} stroke={color} strokeWidth={0.7} />
      <line x1={x2} y1={y - tk} x2={x2} y2={y + tk} stroke={color} strokeWidth={0.7} />
      <rect x={cx - lw / 2} y={y - 9} width={lw} height={16} fill="#eaf6ff" opacity={0.9} rx={2} />
      <text
        x={cx}
        y={y + 1}
        fontSize={fs}
        fill={color}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="system-ui,sans-serif"
        fontWeight={700}
      >
        {label}
      </text>
    </g>
  );
}

function IBeam({ cx, flangeW, deckBot }) {
  const wT = deckBot + FL_H;
  const wB = wT + WEB_H;
  return (
    <g>
      <rect x={cx - flangeW / 2} y={deckBot} width={flangeW} height={FL_H} fill={CLR.gdr} stroke={CLR.gdrS} strokeWidth={0.5} rx={1} />
      <rect x={cx - WEB_W / 2} y={wT} width={WEB_W} height={WEB_H} fill={CLR.web} stroke={CLR.gdrS} strokeWidth={0.5} />
      <rect x={cx - flangeW / 2} y={wB} width={flangeW} height={FL_H} fill={CLR.gdr} stroke={CLR.gdrS} strokeWidth={0.5} rx={1} />
    </g>
  );
}

function MaterialBadge({ x, y, label }) {
  if (!label) return null;
  const txt = String(label);
  const w = Math.max(52, txt.length * 6.2 + 14);
  return (
    <g>
      <rect x={x - w / 2} y={y - 9} width={w} height={18} rx={9} fill="#0d1b3e" stroke="#4caf50" strokeWidth={1.1} />
      <text
        x={x}
        y={y + 0.5}
        fontSize={9}
        fill="#7dffac"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="system-ui,sans-serif"
        fontWeight={700}
      >
        {txt}
      </text>
    </g>
  );
}

function InteractiveSVG({
  carriageway_width,
  number_of_girders,
  girder_spacing,
  deck_overhang_width,
  footpath,
  span,
  girder_steel,
  cross_bracing_steel,
  deck_concrete,
}) {
  const g = useMemo(() => {
    const cw = Math.max(4.25, parseFloat(carriageway_width) || 7.5);
    const gs = Math.max(0.5, parseFloat(girder_spacing) || 2.5);
    const dow = Math.max(0, parseFloat(deck_overhang_width) || 0);
    const ng = Math.max(2, Math.round(parseFloat(number_of_girders) || 4));

    const ow = cw + 5;
    const sc = UW / ow;
    const dL = ML;
    const dR = ML + ow * sc;
    const fpW = 2.5 * sc;
    const cwL = dL + fpW;
    const cwR = dR - fpW;
    const centers = Array.from({ length: ng }, (_, i) => dL + dow * sc + i * gs * sc);
    const flangeW = Math.min(gs * sc * 0.72, 52);

    const deckY = MT;
    const deckBot = deckY + DECK_H;
    const botBot = deckBot + FL_H + WEB_H + FL_H;

    return { cw, gs, dow, ng, ow, sc, dL, dR, fpW, cwL, cwR, centers, flangeW, deckY, deckBot, botBot };
  }, [carriageway_width, number_of_girders, girder_spacing, deck_overhang_width]);

  const { cw, gs, dow, ng, ow, dL, dR, fpW, cwL, cwR, centers, flangeW, deckY, deckBot, botBot } = g;

  const hasFpL = footpath === "both" || footpath === "single" || footpath === "single-sided";
  const hasFpR = footpath === "both";

  const gsY = botBot + 18;
  const lblY = gsY + 30;
  const VH = lblY + 22;

  const deckBadgeX = (dL + dR) / 2;
  const deckBadgeY = deckY + DECK_H / 2 + 0.5;

  const girderBadgeX = centers.length ? centers[Math.floor(centers.length / 2)] : deckBadgeX;
  const girderBadgeY = botBot + 13;

  const bracingBadgeX = centers.length >= 2 ? (centers[0] + centers[1]) / 2 : deckBadgeX;
  const bracingBadgeY = deckBot + WEB_H / 2 + 7;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${VW} ${VH}`}
      role="img"
      aria-label={`Live bridge cross-section: ${ow.toFixed(1)} m overall, ${ng} girders`}
      style={{ display: "block" }}
    >
      <DimLine x1={dL} x2={dR} y={deckY - 34} label={`${ow.toFixed(1)} m overall`} color="#1e8f5f" />
      <DimLine x1={cwL} x2={cwR} y={deckY - 18} label={`${cw.toFixed(1)} m carriageway`} color="#2f76b8" />
      {dow > 0.05 && (
        <DimLine x1={dL} x2={dL + dow * g.sc} y={deckY - 6} label={`${dow.toFixed(1)} m`} color="#6f5ec7" small />
      )}

      {hasFpL && (
        <>
          <rect x={dL} y={deckY - FP_H} width={fpW} height={FP_H} fill={CLR.fp} stroke={CLR.fpS} strokeWidth={0.5} />
          <text x={dL + fpW / 2} y={deckY - FP_H / 2 + 1} fontSize={10} fill={CLR.fpTxt} textAnchor="middle" dominantBaseline="central" fontFamily="system-ui,sans-serif" fontWeight={700}>
            FP
          </text>
        </>
      )}

      {hasFpR && (
        <>
          <rect x={dR - fpW} y={deckY - FP_H} width={fpW} height={FP_H} fill={CLR.fp} stroke={CLR.fpS} strokeWidth={0.5} />
          <text x={dR - fpW / 2} y={deckY - FP_H / 2 + 1} fontSize={10} fill={CLR.fpTxt} textAnchor="middle" dominantBaseline="central" fontFamily="system-ui,sans-serif" fontWeight={700}>
            FP
          </text>
        </>
      )}

      <rect x={dL} y={deckY} width={dR - dL} height={DECK_H} fill={CLR.deck} stroke={CLR.deckS} strokeWidth={0.5} />
      <rect x={cwL} y={deckY} width={cwR - cwL} height={3} fill={CLR.deckTop} opacity={0.65} />

      {centers.map((cx, i) => (
        <IBeam key={i} cx={cx} flangeW={flangeW} deckBot={deckBot} />
      ))}

      {centers.length >= 2 && (
        <>
          <DimLine x1={centers[0]} x2={centers[1]} y={gsY} label={`${gs.toFixed(1)} m`} color="#52779a" small />
          {centers.length > 2 && (
            <line x1={centers[1]} y1={gsY} x2={centers[centers.length - 1]} y2={gsY} stroke="#6b8dad" strokeWidth={0.6} strokeDasharray="3 3" />
          )}
          <text x={VW / 2} y={gsY + 14} fontSize={10} fill={CLR.iText} textAnchor="middle" fontFamily="system-ui,sans-serif" fontWeight={600}>
            {ng} girders @ {gs.toFixed(1)} m spacing
          </text>
        </>
      )}

      {/* Material badges (new) */}
      <MaterialBadge x={deckBadgeX} y={deckBadgeY} label={deck_concrete ? `Deck: ${deck_concrete}` : ""} />
      <MaterialBadge x={girderBadgeX} y={girderBadgeY} label={girder_steel ? `Girder: ${girder_steel}` : ""} />
      <MaterialBadge x={bracingBadgeX} y={bracingBadgeY} label={cross_bracing_steel ? `Bracing: ${cross_bracing_steel}` : ""} />

      <circle cx={ML} cy={lblY} r={3} fill="#1e8f5f" />
      <text x={ML + 8} y={lblY + 1} fontSize={10} fill={CLR.iLegend} dominantBaseline="central" fontFamily="system-ui,sans-serif" fontWeight={700}>
        overall
      </text>

      <circle cx={ML + 72} cy={lblY} r={3} fill="#2f76b8" />
      <text x={ML + 80} y={lblY + 1} fontSize={10} fill={CLR.iLegend} dominantBaseline="central" fontFamily="system-ui,sans-serif" fontWeight={700}>
        carriageway
      </text>

      <circle cx={ML + 178} cy={lblY} r={3} fill="#6f5ec7" />
      <text x={ML + 186} y={lblY + 1} fontSize={10} fill={CLR.iLegend} dominantBaseline="central" fontFamily="system-ui,sans-serif" fontWeight={700}>
        overhang
      </text>

      {parseFloat(span) > 0 && (
        <text x={VW - MR} y={lblY + 1} fontSize={10} fill={CLR.iText} textAnchor="end" dominantBaseline="central" fontFamily="system-ui,sans-serif" fontWeight={600}>
          span: {span} m
        </text>
      )}
    </svg>
  );
}

export default function BridgeDiagramPanel({
  carriageway_width = "",
  number_of_girders = "",
  girder_spacing = "",
  deck_overhang_width = "",
  footpath = "none",
  span = "",
  girder_steel = "",
  cross_bracing_steel = "",
  deck_concrete = "",
}) {
  const [view, setView] = useState("reference");
  const hasValues = parseFloat(carriageway_width) > 0;
  const isInteractive = view === "interactive";

  // icy blue theme for interactive only
  const panelBg = isInteractive ? "#dff1ff" : "#1a1a2e";
  const headerBg = isInteractive ? "#b9dcf7" : "#0f3460";
  const headerBorder = isInteractive ? "#8cbfe6" : "#1a4080";
  const titleColor = isInteractive ? "#1d4f7a" : "#4caf50";
  const contentBg = isInteractive ? "#cfe9fb" : "transparent";

  const btnBase = {
    padding: "3px 11px",
    fontSize: 11,
    fontWeight: 700,
    border: `1px solid ${isInteractive ? "#7eb4de" : "#2a4a8a"}`,
    borderRadius: 3,
    cursor: "pointer",
    letterSpacing: "0.2px",
    transition: "background 0.15s, color 0.15s, border-color 0.15s",
    background: "transparent",
    color: isInteractive ? "#1d4f7a" : "#8aaccf",
  };

  const btnActive = {
    ...btnBase,
    background: "#4caf50",
    color: "#fff",
    border: "1px solid #4caf50",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        minWidth: 0,
        flex: 1,
        background: panelBg,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 12px",
          background: headerBg,
          borderBottom: `1px solid ${headerBorder}`,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: titleColor, letterSpacing: "1px", textTransform: "uppercase" }}>
          Bridge Cross Section (For Nomenclature Only)
        </span>

        <div style={{ display: "flex", gap: 4 }}>
          <button type="button" style={view === "reference" ? btnActive : btnBase} onClick={() => setView("reference")}>
            Reference
          </button>
          <button type="button" style={view === "interactive" ? btnActive : btnBase} onClick={() => setView("interactive")}>
            Interactive (Beta)
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          width: "100%",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "center",
          padding: "10px",
          overflow: "auto",
          boxSizing: "border-box",
        }}
      >
        {view === "reference" ? (
          <div style={{ position: "relative", width: "100%" }}>
            <img
              src={bridgeImage}
              alt="Bridge cross-section reference diagram"
              style={{ width: "100%", height: "auto", display: "block", borderRadius: 3 }}
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
                  bottom: 10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(8,20,48,0.80)",
                  border: "1px solid #2a4a8a",
                  borderRadius: 3,
                  color: "#6a9ad8",
                  fontSize: 10,
                  padding: "3px 12px",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                }}
              >
                Fill in the form to see live dimension annotations
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: contentBg,
              border: "1px solid #8fa7d6",
              borderRadius: 6,
              padding: 10,
            }}
          >
            <InteractiveSVG
              carriageway_width={carriageway_width}
              number_of_girders={number_of_girders}
              girder_spacing={girder_spacing}
              deck_overhang_width={deck_overhang_width}
              footpath={footpath}
              span={span}
              girder_steel={girder_steel}
              cross_bracing_steel={cross_bracing_steel}
              deck_concrete={deck_concrete}
            />
            <div
              style={{
                textAlign: "center",
                fontSize: 12,
                color: CLR.iDisclaimer,
                marginTop: 8,
                borderTop: "1px solid rgba(20,58,92,0.25)",
                paddingTop: 7,
                fontWeight: 600,
              }}
            >
              Schematic — proportions are approximate
            </div>
          </div>
        )}
      </div>
    </div>
  );
}