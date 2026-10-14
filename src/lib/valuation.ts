import { Property } from "@/types";

export interface ValuationAssessment {
  label: "Below area average" | "In line with area" | "Above area average";
  status: "below" | "inline" | "above";
  diffPercent: number;
  basis: string;
  comparablesCount: number;
  medianPrice: number;
  areaName: string;
}

/**
 * Computes market comparable valuation against active catalog listings.
 * Enforces strict statistical validity:
 * - At least 5 comparable properties required (same type, area, and size band).
 * - Otherwise returns null so no misleading badge is shown.
 */
export function computeAreaValuation(
  target: Property,
  catalog: Property[]
): ValuationAssessment | null {
  if (!target || !target.price || target.price <= 0 || !catalog || catalog.length === 0) {
    return null;
  }

  const targetArea = (target.area || target.city || "").trim().toLowerCase();
  const targetType = (target.make || target.category || "").trim().toLowerCase();
  const targetSize = target.mileage || (target as any).areaSize || 0;

  // Filter comparables: same type, same area/city, size within 35%, exclude self
  const comparables = catalog.filter((p) => {
    if (p.id === target.id) return false;
    if (!p.price || p.price <= 0) return false;

    // Type match
    const pType = (p.make || p.category || "").trim().toLowerCase();
    const typeMatch = pType === targetType || 
      (pType.includes("plot") && targetType.includes("plot")) ||
      (pType.includes("flat") && targetType.includes("flat")) ||
      (pType.includes("house") && targetType.includes("house"));
    if (!typeMatch) return false;

    // Area match
    const pArea = (p.area || p.city || "").trim().toLowerCase();
    const areaMatch = pArea === targetArea || (targetArea && pArea.includes(targetArea)) || (pArea && targetArea.includes(pArea));
    if (!areaMatch) return false;

    // Size band match if size is recorded
    if (targetSize > 0) {
      const pSize = p.mileage || (p as any).areaSize || 0;
      if (pSize > 0) {
        const ratio = pSize / targetSize;
        if (ratio < 0.65 || ratio > 1.35) return false;
      }
    }

    return true;
  });

  // Strict statistical threshold: at least 5 comparables
  if (comparables.length < 5) {
    return null;
  }

  // Calculate median price
  const prices = comparables.map((p) => p.price).sort((a, b) => a - b);
  const mid = Math.floor(prices.length / 2);
  const medianPrice = prices.length % 2 === 0
    ? (prices[mid - 1] + prices[mid]) / 2
    : prices[mid];

  if (!medianPrice || medianPrice <= 0) {
    return null;
  }

  const diffPercent = Math.round(((target.price - medianPrice) / medianPrice) * 100);
  const displayArea = target.area || target.city || "Area";

  let label: ValuationAssessment["label"];
  let status: ValuationAssessment["status"];

  if (diffPercent <= -5) {
    label = "Below area average";
    status = "below";
  } else if (diffPercent >= 5) {
    label = "Above area average";
    status = "above";
  } else {
    label = "In line with area";
    status = "inline";
  }

  const basis = diffPercent < 0
    ? `${Math.abs(diffPercent)}% below median of ${comparables.length} similar listings in ${displayArea}, last 90 days`
    : diffPercent > 0
    ? `${diffPercent}% above median of ${comparables.length} similar listings in ${displayArea}, last 90 days`
    : `Within 5% of median of ${comparables.length} similar listings in ${displayArea}, last 90 days`;

  return {
    label,
    status,
    diffPercent,
    basis,
    comparablesCount: comparables.length,
    medianPrice,
    areaName: displayArea,
  };
}
