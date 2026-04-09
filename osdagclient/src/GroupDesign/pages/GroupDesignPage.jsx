import React from "react";
import InputPanel from "../components/InputPanel";
import "../styles/GroupDesign.css";
import bridgeImage from "../assets/bridge_cross_section.jpg"; // change extension if yours is .png

export default function GroupDesignPage() {
  return (
    <div className="gd-root">
      {/* Left panel */}
      <div className="gd-left-panel">
        <InputPanel />
      </div>

      {/* Right panel with static reference image */}
      <div className="gd-right-panel">
        <div className="gd-right-panel-label">
          Bridge Cross Section (For Nomenclature only)
        </div>
        <img
          src={bridgeImage}
          alt="Bridge Cross Section"
          className="gd-bridge-image"
          draggable="false"
        />
      </div>
    </div>
  );
}