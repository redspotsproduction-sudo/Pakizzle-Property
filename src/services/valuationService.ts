export interface PropertyValuationResult {
  estimatedValue: number;
  marketRange: {
    low: number;
    high: number;
  };
  confidence: number;
  analysis: string;
  investmentYield: {
    estimatedRent: number;
    grossYield: number;
  };
  priceTrend: "rising" | "stable" | "declining";
  comparableProperties: Array<{
    title: string;
    price: number;
    size: string;
    source: string;
  }>;
  taxBreakdown: {
    filerFbrTax: number;
    nonFilerFbrTax: number;
    stampDuty: number;
    transferFee: number;
  };
}

export interface ValuationQueryParams {
  propertyType: string;
  city: string;
  areaName: string;
  size: number;
  sizeUnit: "Marla" | "Kanal" | "Sq. Yards" | "Sq. Ft.";
  beds: number;
  baths: number;
  condition: string;
  floors: string;
  features: string[];
}

export async function getPropertyValuation(
  params: ValuationQueryParams
): Promise<PropertyValuationResult> {
  try {
    const response = await fetch("/api/valuation/property", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Valuation server returned status ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error("Failed to fetch property valuation from server:", err);
    throw err;
  }
}
