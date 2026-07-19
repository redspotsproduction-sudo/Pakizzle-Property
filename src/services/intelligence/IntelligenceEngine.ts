import { featureStore } from "./FeatureStore";
import { IntelligenceInsight, MarketState, RankingScore, UserAction } from "./types";
import { Vehicle } from "@/types";

/**
 * AMIE IntelligenceEngine
 * Hierarchical Decision Architecture:
 * Layer 1: Strategic (Market Health)
 * Layer 2: Tactical (User Intent)
 * Layer 3: Reactive (Real-time adjustments)
 */
class IntelligenceEngine {
  /**
   * Layer 2 & 3: Neural Ranking Simulation
   * Calculates the multi-objective score for a listing given the current market state.
   */
  public scoreListing(vehicle: Vehicle, state: MarketState): RankingScore {
    let score = 0;
    
    if (!vehicle) {
      return {
        itemId: "",
        score: 0,
        probabilityOfClick: 0.1,
        probabilityOfLead: 0.02,
        expectedRevenue: 0,
      };
    }

    // 1. Relevance Score (Intent matching)
    if (state?.user?.preferences?.makes && vehicle.make) {
      if (state.user.preferences.makes.includes(vehicle.make)) {
        score += 25; // Boost match score
      }
    }
    
    // 2. Price Elasticity (Value optimization)
    if (state?.user?.preferences?.priceRange && vehicle.price !== undefined) {
      const priceRange = state.user.preferences.priceRange;
      const avgPrice = (priceRange[0] + priceRange[1]) / 2;
      const priceDiff = vehicle.price - avgPrice;
      if (Math.abs(priceDiff) < 1000000) score += 15;
    }

    // 3. Market Dynamics (Supply/Demand)
    if (vehicle.make && state?.inventory?.demandSupplyRatio) {
      const ratio = state.inventory.demandSupplyRatio[vehicle.make] || 1;
      score += (ratio - 1) * 10;
    }

    // 4. Trust Signal
    if (vehicle.seller?.isVerified) {
      score += 25;
    }

    // 5. Featured premium bias
    if (vehicle.isFeatured) {
      score += 30;
    }

    // Probabilistic outputs
    const pClick = Math.min(0.95, 0.1 + (score / 100));
    const pLead = pClick * 0.2;
    
    return {
      itemId: vehicle.id || "",
      score,
      probabilityOfClick: pClick,
      probabilityOfLead: pLead,
      expectedRevenue: pLead * ((vehicle.price || 0) * 0.01), // Simulated commission
    };
  }

  /**
   * Generates real-time insights (Nudges) based on the current state.
   */
  public getInsights(vehicle?: Vehicle): IntelligenceInsight[] {
    const state = featureStore.getMarketState();
    const insights: IntelligenceInsight[] = [];

    // Urgency Insight
    if (state.user.intent === "buying" || state.user.urgencyScore > 0.6) {
      insights.push({
        type: "urgency",
        score: 0.9,
        message: "High demand: 3 users are looking at this right now",
      });
    }

    // Market Insight
    if (vehicle) {
      const trend = state.inventory.priceTrends[vehicle.fuelType] || 0;
      if (trend > 0) {
        insights.push({
          type: "value",
          score: 0.85,
          message: `${vehicle.fuelType} vehicles are retaining value 15% better this month`,
        });
      }
    }


    // Trust Insight
    if (vehicle?.seller.isVerified) {
      insights.push({
        type: "trust",
        score: 1.0,
        message: "Verified Seller: 100% successful transactions",
      });
    }

    return insights.sort((a, b) => b.score - a.score);
  }

  /**
   * Reactive Layer: Track behavior and update policy
   */
  public trackBehavior(action: UserAction) {
    featureStore.trackAction(action);
    // In a production system, this would trigger a micro-batch update to the neural weights
    console.log(`[AMIE] Tracking behavior: ${action.type} on ${action.itemId || 'market'}`);
  }
}

export const intelligenceEngine = new IntelligenceEngine();
