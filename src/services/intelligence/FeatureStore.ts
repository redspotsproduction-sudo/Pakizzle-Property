import { MarketState, UserAction, UserState } from "./types";

/**
 * FeatureStore: Manages the state representation (S) of the marketplace.
 * Operates with <10ms retrieval latency for session-level features.
 */
class FeatureStore {
  private sessionState: UserState | null = null;
  private marketCache: any = {};

  constructor() {
    this.initializeSession();
  }

  private initializeSession() {
    this.sessionState = {
      id: Math.random().toString(36).substring(7),
      intent: "browsing",
      priceSensitivity: 0.5,
      urgencyScore: 0.1,
      preferences: {
        makes: [],
        models: [],
        bodyTypes: [],
        priceRange: [0, 100000000],
      },
      recentActions: [],
    };
  }

  public trackAction(action: UserAction) {
    if (!this.sessionState) return;

    this.sessionState.recentActions.push(action);
    
    // Limit history for session performance
    if (this.sessionState.recentActions.length > 50) {
      this.sessionState.recentActions.shift();
    }

    // Dynamic preference learning from search queries
    if (action.type === "search" && action.metadata?.query) {
      const q = action.metadata.query.toLowerCase();
      const defaultBrands = ["toyota", "honda", "suzuki", "audi", "bmw", "mercedes-benz", "hyundai", "kia", "mg", "changan", "tesla"];
      const matchedBrand = defaultBrands.find(b => q.includes(b));
      if (matchedBrand) {
        const formatted = matchedBrand.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-');
        if (!this.sessionState.preferences.makes.includes(formatted)) {
          this.sessionState.preferences.makes.push(formatted);
        }
      }
    }

    // Dynamic preference learning from viewed listings
    if (action.type === "view" && action.metadata?.vehicle) {
      const vehicle = action.metadata.vehicle;
      if (vehicle.make && !this.sessionState.preferences.makes.includes(vehicle.make)) {
        this.sessionState.preferences.makes.push(vehicle.make);
      }
      if (vehicle.model && !this.sessionState.preferences.models.includes(vehicle.model)) {
        this.sessionState.preferences.models.push(vehicle.model);
      }
    }

    this.updateIntent();
  }

  private updateIntent() {
    if (!this.sessionState) return;

    const actions = this.sessionState.recentActions;
    const recentViews = actions.filter(a => a.type === "view").length;
    const recentLeads = actions.filter(a => a.type === "lead").length;

    if (recentLeads > 0) {
      this.sessionState.intent = "buying";
      this.sessionState.urgencyScore = Math.min(1, this.sessionState.urgencyScore + 0.2);
    } else if (recentViews > 5) {
      this.sessionState.intent = "comparing";
    }
  }

  public getMarketState(): MarketState {
    return {
      user: this.sessionState!,
      inventory: {
        totalListings: 1250,
        demandSupplyRatio: { "Toyota": 1.2, "Honda": 0.9, "Suzuki": 1.5 },
        priceTrends: { "Hybrid": 0.05, "Electric": 0.08 },
      },
      context: {
        location: { city: "Karachi", region: "Sindh" },
        device: "desktop",
        timeOfDay: new Date().getHours(),
      },
      macro: {
        fuelPriceTrend: "up",
        interestRates: 18.5,
      },
    };
  }

  public getSessionFeatures() {
    return this.sessionState;
  }
}

export const featureStore = new FeatureStore();
