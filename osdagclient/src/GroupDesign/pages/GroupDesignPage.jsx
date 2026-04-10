import React from "react";
import InputPanel from "../components/InputPanel";
import BridgeDiagramPanel from "../components/BridgeDiagramPanel";
import useGroupDesign from "../hooks/useGroupDesign";
import "../styles/GroupDesign.css";

export default function GroupDesignPage() {
  const gd = useGroupDesign();

  return (
    <div className="gd-root">
      {/* Left panel (scroll container) */}
      <div className="gd-left-panel">
        <InputPanel gd={gd} />
      </div>

      {/* Right panel */}
      <div className="gd-right-panel" style={{ padding: 0 }}>
        <BridgeDiagramPanel
          carriageway_width={gd.form.carriageway_width}
          number_of_girders={gd.form.number_of_girders}
          girder_spacing={gd.form.girder_spacing}
          deck_overhang_width={gd.form.deck_overhang_width}
        />
      </div>
    </div>
  );
}