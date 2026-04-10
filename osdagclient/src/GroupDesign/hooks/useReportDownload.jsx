// ============================================================
// useReportDownload.js — Group Design Module
// Hook that generates PDF blob and triggers browser download.
// Usage: const { generateReport, generating, error } = useReportDownload();
//        generateReport(gd)
// ============================================================

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import DesignReport from "../components/DesignReport";
import bridgeImageSrc from "../assets/bridge_cross_section.jpg";

export function useReportDownload() {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateReport = async (gd) => {
    setGenerating(true);
    setError(null);

    try {
      const docElement = <DesignReport gd={gd} bridgeImageSrc={bridgeImageSrc} />;
      const blob = await pdf(docElement).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);

      link.href = url;
      link.download = `GroupDesign_Report_${dateStr}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setError("Could not generate report. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return { generateReport, generating, error };
}