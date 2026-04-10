import React from "react";
import InputPanel from "../components/InputPanel";
import BridgeDiagramPanel from "../components/BridgeDiagramPanel";
import useGroupDesign from "../hooks/useGroupDesign";
import "../styles/GroupDesign.css";

export default function GroupDesignPage() {
  const gd = useGroupDesign();

  return (
    <div className="gd-root">
      <div className="gd-left-panel">
        <InputPanel gd={gd} />
      </div>

      <div className="gd-right-panel" style={{ flex: 1, minWidth: 0 }}>
        <BridgeDiagramPanel
          carriageway_width={gd.form.carriageway_width}
          number_of_girders={gd.form.number_of_girders}
          girder_spacing={gd.form.girder_spacing}
          deck_overhang_width={gd.form.deck_overhang_width}
          footpath={gd.form.footpath}
          span={gd.form.span}
          girder_steel={gd.form.girder_steel}
          cross_bracing_steel={gd.form.cross_bracing_steel}
          deck_concrete={gd.form.deck_concrete}
          recentChangeKey={gd.recentChangeKey}
          flashToken={gd.flashToken}
        />
      </div>
    </div>
  );
}