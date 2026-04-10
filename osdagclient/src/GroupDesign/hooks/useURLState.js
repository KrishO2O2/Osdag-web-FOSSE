// ============================================================
// useURLState.js — Group Design Module
// On mount: reads URL params and calls setField for each one.
// Exposes copyShareURL and clearURLState for buttons.
// ============================================================

import { useEffect, useState } from "react";
import {
  readStateFromURL,
  copyShareURL,
  clearURLState,
} from "../utils/urlState";

export function useURLState(setField, setMode) {
  const [loadedFromURL, setLoadedFromURL] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const partial = readStateFromURL();
    const keys = Object.keys(partial);
    if (keys.length === 0) return;

    for (const key of keys) {
      if (key === "mode") {
        setMode(partial[key]);
      } else {
        setField(key, partial[key]);
      }
    }

    setLoadedFromURL(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopyShareURL = async (form) => {
    const ok = await copyShareURL(form);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleClearURLState = () => {
    clearURLState();
    setLoadedFromURL(false);
  };

  return {
    loadedFromURL,
    copied,
    handleCopyShareURL,
    handleClearURLState,
  };
}