import React, { useMemo, useState } from "react";
import bridgeImage from "../assets/bridge_cross_section.jpg";
import { estimateBridgeBOM } from "../utils/bomEstimator";

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

function Pill({ children, color, style = {} }) {
  return (
    <div
      style={{
        position: "absolute",
        background: color,
        color: "#fff",
        fontSize: 10,
        fontWeight: 700,
        padding: "3px 8px",
        borderRadius: 3,
        whiteSpace: "nowrap",
        boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
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
          left: `${leftPct}%`,
          right: `${rightPct}%`,
          top: `${topPct}%`,
          height: 1.5,
          background: color,
        }}
      />
      <div
        style={{
          ...b,
          left: `${leftPct}%`,
          top: `calc(${topPct}% - 7px)`,
          width: 1.5,
          height: 14,
          background: color,
        }}
      />
      <div
        style={{
          ...b,
          right: `${rightPct}%`,
          top: `calc(${topPct}% - 7px)`,
          width: 1.5,
          height: 14,
          background: color,
        }}
      />
      <div
        style={{
          ...b,
          left: `${leftPct}%`,
          top: `calc(${topPct}% - 3px)`,
          width: 0,
          height: 0,
          borderTop: "4px solid transparent",
          borderBottom: "4px solid transparent",
          borderRight: `6px solid ${color}`,
          transform: "translateX(-6px)",
        }}
      />
      <div
        style={{
          ...b,
          right: `${rightPct}%`,
          top: `calc(${topPct}% - 3px)`,
          width: 0,
          height: 0,
          borderTop: "4px solid transparent",
          borderBottom: "4px solid transparent",
          borderLeft: `6px solid ${color}`,
          transform: "translateX(6px)",
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

  if (cw === 0 && ng === 0 && dow === 0) return null;

  return (
    <>
      {cw > 0 && (
        <>
          <DimBar leftPct={22} rightPct={22} topPct={11.5} color={CLR.dimBlue} />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "10.1%",
              transform: "translateX(-50%)",
              color: CLR.dimBlue,
              fontSize: 12,
              fontWeight: 700,
              background: "rgba(255,255,255,0.86)",
              padding: "1px 6px",
              borderRadius: 3,
            }}
          >
            Carriageway Width
          </div>

          <Pill
            color={CLR.dimGreen}
            style={{ left: "50%", top: "18.5%", transform: "translateX(-50%)" }}
          >
            {`Carriageway Width = ${cw.toFixed(2)} m`}
          </Pill>
        </>
      )}

      {dow > 0 && (
        <>
          <DimBar leftPct={9.8} rightPct={78.5} topPct={61.8} color={CLR.dimBlue} />
          <DimBar leftPct={78.5} rightPct={10.2} topPct={61.8} color={CLR.dimBlue} />

          <div
            style={{
              position: "absolute",
              left: "13%",
              top: "65.3%",
              color: CLR.dimBlue,
              fontSize: 11,
              fontWeight: 700,
              background: "rgba(255,255,255,0.86)",
              padding: "1px 5px",
              borderRadius: 3,
            }}
          >
            Overhang Width
          </div>

          <div
            style={{
              position: "absolute",
              right: "13%",
              top: "65.3%",
              color: CLR.dimBlue,
              fontSize: 11,
              fontWeight: 700,
              background: "rgba(255,255,255,0.86)",
              padding: "1px 5px",
              borderRadius: 3,
            }}
          >
            Overhang Width
          </div>

          <Pill color={CLR.dimPurple} style={{ left: "5.5%", top: "41%" }}>
            {`${dow.toFixed(1)} m`}
          </Pill>

          <Pill color={CLR.dimPurple} style={{ right: "5.5%", top: "41%" }}>
            {`${dow.toFixed(1)} m`}
          </Pill>
        </>
      )}

      {ng > 0 && gs > 0 && (
        <>
          <DimBar leftPct={19.5} rightPct={19.5} topPct={78.4} color={CLR.dimBlue} />
          <Pill
            color={CLR.dimBlue}
            style={{ left: "50%", top: "73%", transform: "translateX(-50%)" }}
          >
            {`${ng} Girders Spaced at ${gs.toFixed(1)} m`}
          </Pill>

          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "79.5%",
              transform: "translateX(-50%)",
              color: CLR.dimBlue,
              fontSize: 11,
              fontWeight: 700,
              background: "rgba(255,255,255,0.86)",
              padding: "1px 6px",
              borderRadius: 3,
              textAlign: "center",
            }}
          >
            {`“N” Girders Spaced at Distance “S”`}
            <br />
            <span style={{ fontWeight: 600, fontSize: 10 }}>
              (4 girders shown for clarity)
            </span>
          </div>
        </>
      )}
    </>
  );
}

function DimLine({ x1, x2, y, label, color, small = false }) {
  const cx = (x1 + x2) / 2;
  const tk = small ? 4 : 5;
  const fs = small ? 10 : 12;
  const lw = label.length * fs * 0.62 + 10;

  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth="1.5" />
      <line x1={x1} y1={y - tk} x2={x1} y2={y + tk} stroke={color} strokeWidth="1.3" />
      <line x1={x2} y1={y - tk} x2={x2} y2={y + tk} stroke={color} strokeWidth="1.3" />
      <polygon points={`${x1},${y} ${x1 + 7},${y - 3.5} ${x1 + 7},${y + 3.5}`} fill={color} />
      <polygon points={`${x2},${y} ${x2 - 7},${y - 3.5} ${x2 - 7},${y + 3.5}`} fill={color} />
      <rect
        x={cx - lw / 2}
        y={y - fs - 12}
        rx="4"
        ry="4"
        width={lw}
        height={fs + 8}
        fill="rgba(255,255,255,0.92)"
      />
      <text
        x={cx}
        y={y - 8}
        textAnchor="middle"
        fontSize={fs}
        fontWeight="700"
        fill={color}
      >
        {label}
      </text>
    </g>
  );
}

function IBeam({ cx, flangeW, deckBot }) {
  const topY = deckBot + 2;
  const webTop = topY + FL_H;
  const botY = webTop + WEB_H;

  return (
    <g>
      <rect
        x={cx - flangeW / 2}
        y={topY}
        width={flangeW}
        height={FL_H}
        rx="1.5"
        fill={CLR.gdr}
        stroke={CLR.gdrS}
      />
      <rect
        x={cx - WEB_W / 2}
        y={webTop}
        width={WEB_W}
        height={WEB_H}
        fill={CLR.web}
        stroke={CLR.gdrS}
      />
      <rect
        x={cx - flangeW / 2}
        y={botY}
        width={flangeW}
        height={FL_H}
        rx="1.5"
        fill={CLR.gdr}
        stroke={CLR.gdrS}
      />
    </g>
  );
}

function MaterialBadge({ x, y, label }) {
  if (!label) return null;

  const txt = String(label);
  const w = Math.max(52, txt.length * 6.2 + 14);

  return (
    <g>
      <rect
        x={x - w / 2}
        y={y - 13}
        width={w}
        height={20}
        rx="10"
        fill="rgba(255,255,255,0.92)"
        stroke="#9bc3e2"
      />
      <text
        x={x}
        y={y + 1}
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill={CLR.iText}
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

    return {
      cw,
      gs,
      dow,
      ng,
      ow,
      sc,
      dL,
      dR,
      fpW,
      cwL,
      cwR,
      centers,
      flangeW,
      deckY,
      deckBot,
      botBot,
    };
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
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      height="auto"
      style={{ display: "block", borderRadius: 4, background: "#edf8ff" }}
    >
      <defs>
        <linearGradient id="deckGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={CLR.deckS} />
          <stop offset="100%" stopColor={CLR.deck} />
        </linearGradient>
        <linearGradient id="fpGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={CLR.fpS} />
          <stop offset="100%" stopColor={CLR.fp} />
        </linearGradient>
      </defs>

      <rect x={dL} y={deckY} width={dR - dL} height={DECK_H} rx="3" fill="url(#deckGrad)" />
      <rect x={dL} y={deckY} width={dR - dL} height="3" fill={CLR.deckTop} opacity="0.75" />

      {hasFpL && (
        <>
          <rect x={dL} y={deckY - FP_H} width={fpW} height={FP_H} rx="2" fill="url(#fpGrad)" />
          <text
            x={dL + fpW / 2}
            y={deckY - FP_H / 2 + 4}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill={CLR.fpTxt}
          >
            FP
          </text>
        </>
      )}

      {hasFpR && (
        <>
          <rect x={dR - fpW} y={deckY - FP_H} width={fpW} height={FP_H} rx="2" fill="url(#fpGrad)" />
          <text
            x={dR - fpW / 2}
            y={deckY - FP_H / 2 + 4}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill={CLR.fpTxt}
          >
            FP
          </text>
        </>
      )}

      {centers.map((cx, i) => (
        <IBeam key={i} cx={cx} flangeW={flangeW} deckBot={deckBot} />
      ))}

      {centers.length >= 2 && (
        <>
          {centers.slice(0, -1).map((c1, i) => {
            const c2 = centers[i + 1];
            return (
              <g key={`br-${i}`}>
                <line x1={c1} y1={deckBot + 14} x2={c2} y2={botBot - 3} stroke={CLR.dimGray} strokeWidth="2" />
                <line x1={c1} y1={botBot - 3} x2={c2} y2={deckBot + 14} stroke={CLR.dimGray} strokeWidth="2" />
              </g>
            );
          })}

          {centers.length > 2 && (
            <line
              x1={centers[0]}
              y1={botBot - 3}
              x2={centers[centers.length - 1]}
              y2={botBot - 3}
              stroke={CLR.dimGray}
              strokeWidth="2.2"
            />
          )}

          <text
            x={(centers[0] + centers[centers.length - 1]) / 2}
            y={lblY}
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill={CLR.iLegend}
          >
            {`${ng} girders @ ${gs.toFixed(1)} m spacing`}
          </text>
        </>
      )}

      <MaterialBadge x={deckBadgeX} y={deckBadgeY} label={deck_concrete} />
      <MaterialBadge x={girderBadgeX} y={girderBadgeY} label={girder_steel} />
      <MaterialBadge x={bracingBadgeX} y={bracingBadgeY} label={cross_bracing_steel} />

      <DimLine x1={dL} x2={dR} y={14} label={`overall ${ow.toFixed(2)} m`} color={CLR.dimBlue} />
      <DimLine x1={cwL} x2={cwR} y={30} label={`carriageway ${cw.toFixed(2)} m`} color={CLR.dimGreen} />

      {dow > 0.05 && centers.length > 0 && (
        <>
          <DimLine x1={dL} x2={centers[0]} y={gsY} label={`overhang ${dow.toFixed(1)} m`} color={CLR.dimPurple} small />
          <DimLine
            x1={centers[centers.length - 1]}
            x2={dR}
            y={gsY}
            label={`overhang ${dow.toFixed(1)} m`}
            color={CLR.dimPurple}
            small
          />
        </>
      )}

      {parseFloat(span) > 0 && (
        <text
          x={VW - 14}
          y={VH - 8}
          textAnchor="end"
          fontSize="11"
          fontWeight="700"
          fill={CLR.iDisclaimer}
        >
          {`span: ${span} m`}
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

  const bom = useMemo(
    () =>
      estimateBridgeBOM({
        span,
        carriageway_width,
        number_of_girders,
        deck_overhang_width,
      }),
    [span, carriageway_width, number_of_girders, deck_overhang_width]
  );

  const hasValues = parseFloat(carriageway_width) > 0;
  const isInteractive = view === "interactive";

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
        background: panelBg,
        borderLeft: `1px solid ${isInteractive ? "#a6cde8" : "#203a62"}`,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <div
        style={{
          padding: "12px 14px",
          background: headerBg,
          borderBottom: `1px solid ${headerBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: titleColor,
          }}
        >
          Bridge Cross Section (For Nomenclature Only)
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            onClick={() => setView("reference")}
            style={view === "reference" ? btnActive : btnBase}
          >
            Reference
          </button>
          <button
            type="button"
            onClick={() => setView("interactive")}
            style={view === "interactive" ? btnActive : btnBase}
          >
            Interactive (Beta)
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          padding: 14,
          background: contentBg,
        }}
      >
        {view === "reference" ? (
          <div style={{ position: "relative", width: "100%" }}>
            <img
              src={bridgeImage}
              alt="Bridge cross-section reference diagram"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                borderRadius: 3,
              }}
              draggable={false}
            />

            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
              }}
            >
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
                }}
              >
                Fill in the form to see live dimension annotations
              </div>
            )}
          </div>
        ) : (
          <div>
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
                marginTop: 8,
                textAlign: "center",
                color: "#1d466d",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              Schematic — proportions are approximate
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: 14,
            padding: 12,
            border: "1px solid #2a4a8a",
            borderRadius: 8,
            background: isInteractive ? "#d7efff" : "#0f1f44",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
              gap: 10,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: isInteractive ? "#1d4f7a" : "#eaf1ff",
              }}
            >
            Estimated Bill of Materials
            </div>

            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 8px",
                borderRadius: 999,
                background: isInteractive ? "#b8e6c2" : "#234d2f",
                color: isInteractive ? "#1f6a34" : "#7dff9a",
              }}
            >
              Approx.
            </div>
          </div>

          {!bom.clearValues ? (
            <div
              style={{
                color: isInteractive ? "#355d7a" : "#b9c8e6",
                fontSize: 13,
                lineHeight: 1.4,
              }}
            >
              Enter span, carriageway width, girder count, and overhang to view estimates.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 10,
              }}
            >
              <div
                style={{
                  padding: 10,
                  border: "1px solid #2a4a8a",
                  borderRadius: 6,
                  background: isInteractive ? "#edf8ff" : "#102247",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isInteractive ? "#587694" : "#9db0d8",
                    marginBottom: 4,
                  }}
                >
                  Total Concrete Volume
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: isInteractive ? "#1f8a4c" : "#6dff97",
                  }}
                >
                  {bom.concreteVolume.toFixed(2)} m³
                </div>
              </div>

              <div
                style={{
                  padding: 10,
                  border: "1px solid #2a4a8a",
                  borderRadius: 6,
                  background: isInteractive ? "#edf8ff" : "#102247",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isInteractive ? "#587694" : "#9db0d8",
                    marginBottom: 4,
                  }}
                >
                  Estimated Steel Weight
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: isInteractive ? "#1f8a4c" : "#6dff97",
                  }}
                >
                  {bom.steelWeightTon.toFixed(2)} t
                </div>
              </div>

              <div
                style={{
                  padding: 10,
                  border: "1px solid #2a4a8a",
                  borderRadius: 6,
                  background: isInteractive ? "#edf8ff" : "#102247",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isInteractive ? "#587694" : "#9db0d8",
                    marginBottom: 4,
                  }}
                >
                  Deck Area
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: isInteractive ? "#1f8a4c" : "#6dff97",
                  }}
                >
                  {bom.deckArea.toFixed(2)} m²
                </div>
              </div>

              <div
                style={{
                  padding: 10,
                  border: "1px solid #2a4a8a",
                  borderRadius: 6,
                  background: isInteractive ? "#edf8ff" : "#102247",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isInteractive ? "#587694" : "#9db0d8",
                    marginBottom: 4,
                  }}
                >
                  Main Girder Length
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: isInteractive ? "#1f8a4c" : "#6dff97",
                  }}
                >
                  {bom.estimatedMainGirderLength.toFixed(2)} m
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}