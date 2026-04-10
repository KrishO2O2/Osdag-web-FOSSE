export function estimateBridgeBOM(form) {
    const span = Number(form?.span || 0);
    const carriagewayWidth = Number(form?.carriageway_width || 0);
    const numberOfGirders = parseInt(form?.number_of_girders || 0, 10);
    const deckOverhangWidth = Number(form?.deck_overhang_width || 0);
  
    const overallBridgeWidth =
      carriagewayWidth > 0 ? carriagewayWidth + 5 : 0;
  
    // ---- Approximate engineering assumptions for demo ----
    const deckThicknessM = 0.22;          // 220 mm deck slab
    const steelKgPerGirderPerMeter = 185; // demo estimate
    const bracingKgPerMeter = 22;         // demo estimate
    const railingKgPerMeter = 18;         // demo estimate
  
    const concreteVolume =
      span > 0 && overallBridgeWidth > 0
        ? overallBridgeWidth * span * deckThicknessM
        : 0;
  
    const mainGirderSteel =
      span > 0 && numberOfGirders > 0
        ? numberOfGirders * span * steelKgPerGirderPerMeter
        : 0;
  
    const crossBracingSteel =
      span > 0 && numberOfGirders > 1
        ? (numberOfGirders - 1) * span * bracingKgPerMeter
        : 0;
  
    const railingSteel =
      span > 0 ? 2 * span * railingKgPerMeter : 0;
  
    const steelWeightKg = mainGirderSteel + crossBracingSteel + railingSteel;
    const steelWeightTon = steelWeightKg / 1000;
  
    return {
      overallBridgeWidth,
      deckThicknessM,
      concreteVolume,
      steelWeightKg,
      steelWeightTon,
      deckArea: span * overallBridgeWidth,
      estimatedMainGirderLength:
        span > 0 && numberOfGirders > 0 ? span * numberOfGirders : 0,
      clearValues:
        span > 0 &&
        carriagewayWidth > 0 &&
        numberOfGirders > 0 &&
        deckOverhangWidth >= 0,
    };
  }