/**
 * AMIE (Autonomous Marketplace Intelligence Engine) Core Types
 * Mathematical formulation of the marketplace as a POMDP.
 */

export type NudgeType = "urgency" | "trust" | "value" | "popularity" | "new" | "verified";

export interface MarketState {
  user: UserState;
  inventory: InventoryState;
  context: ContextState;
  macro: MacroState;
}

export interface UserState {
  id: string;
  intent: "browsing" | "comparing" | "buying";
  priceSensitivity: number; // 0 to 1
  urgencyScore: number; // 0 to 1
  preferences: {
    makes: string[];
    models: string[];
    bodyTypes: string[];
    priceRange: [number, number];
  };
  recentActions: UserAction[];
}

export interface UserAction {
  type: "view" | "click" | "lead" | "save" | "search";
  itemId?: string;
  timestamp: number;
  metadata?: any;
}

export interface InventoryState {
  totalListings: number;
  demandSupplyRatio: Record<string, number>; // make/model -> ratio
  priceTrends: Record<string, number>; // make/model -> % change
}

export interface ContextState {
  location: {
    city: string;
    region: string;
  };
  device: string;
  timeOfDay: number;
}

export interface MacroState {
  fuelPriceTrend: "up" | "down" | "stable";
  interestRates: number;
}

export interface IntelligenceInsight {
  type: NudgeType;
  score: number; // Confidence/Relevance score
  message: string;
  metadata?: any;
}

export interface RankingScore {
  itemId: string;
  score: number;
  probabilityOfClick: number;
  probabilityOfLead: number;
  expectedRevenue: number;
}
