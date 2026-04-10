import React from "react";

export default function Accordion({
  id,
  title,
  isComplete = false,
  open = false,
  onToggle,
  children,
}) {
  return (
    <div
      style={{
        border: "1px solid",
        borderColor: isComplete ? "#2a6a3a" : "#2a4a8a",
        borderRadius: 6,
        marginBottom: 10,
        overflow: "hidden",
        transition: "border-color 0.2s ease",
        background: "#132448",
      }}
    >
      <button
        type="button"
        onClick={() => onToggle?.(id)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          background: isComplete ? "#0f2b1d" : "#0d1b3e",
          border: "none",
          cursor: "pointer",
          transition: "background 0.2s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              border: `1.5px solid ${isComplete ? "#4caf50" : "#2a4a8a"}`,
              background: isComplete ? "#4caf50" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.2s ease",
            }}
          >
            {isComplete && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <polyline
                  points="2,5 4,7.5 8,2.5"
                  stroke="#fff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>

          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: isComplete ? "#6dff97" : "#b0c4de",
              letterSpacing: "0.3px",
            }}
          >
            {title}
          </span>
        </div>

        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            flexShrink: 0,
          }}
        >
          <polyline
            points="2,4 6,8 10,4"
            fill="none"
            stroke={isComplete ? "#4caf50" : "#4a7fd8"}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          style={{
            padding: "10px 12px",
            background: "#0d1933",
            borderTop: `1px solid ${isComplete ? "#2a6a3a" : "#1a3060"}`,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}