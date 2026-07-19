import { useEffect, useCallback } from "react";
import { intelligenceEngine } from "../services/intelligence/IntelligenceEngine";
import { UserAction } from "../services/intelligence/types";
import { Vehicle } from "../types";

/**
 * useIntelligence Hook
 * Provides a bridge between the React UI and the AMIE Intelligence Engine.
 */
export function useIntelligence() {
  const trackAction = useCallback((action: UserAction) => {
    intelligenceEngine.trackBehavior(action);
  }, []);

  const trackView = useCallback((vehicle: Vehicle | string) => {
    const isString = typeof vehicle === "string";
    const itemId = isString ? vehicle : vehicle.id;
    trackAction({
      type: "view",
      itemId,
      metadata: !isString ? { vehicle } : undefined,
      timestamp: Date.now()
    });
  }, [trackAction]);

  const trackSearch = useCallback((query: string) => {
    trackAction({
      type: "search",
      metadata: { query },
      timestamp: Date.now()
    });
  }, [trackAction]);

  const getInsights = useCallback((vehicle?: Vehicle) => {
    return intelligenceEngine.getInsights(vehicle);
  }, []);

  return {
    trackAction,
    trackView,
    trackSearch,
    getInsights
  };
}
