import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketInsightItem, propertySchemaService } from "@/services/propertySchemaService";
import { TopFilterBarState } from "./TopFilterBar";

interface MarketInsightBannerProps {
  currentCity?: string;
  onApplyInsight: (query: {
    city?: string;
    area?: string;
    propertyType?: string;
    verifiedOnly?: boolean;
    minArea?: number;
    maxArea?: number;
    areaUnit?: "marla" | "kanal" | "sqft" | "sqyd";
  }) => void;
  className?: string;
}

export default function MarketInsightBanner({
  currentCity = "Lahore",
  onApplyInsight,
  className
}: MarketInsightBannerProps) {
  const [insights, setInsights] = useState<MarketInsightItem[]>([]);
  const [hasRealData, setHasRealData] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const effectiveCity = currentCity && currentCity.trim() && currentCity !== "Pakistan" 
    ? currentCity.trim() 
    : "Lahore";

  // Fetch real aggregate market insights
  useEffect(() => {
    let isMounted = true;
    propertySchemaService.getMarketInsights(effectiveCity).then((res) => {
      if (!isMounted) return;
      if (res && res.insights && res.insights.length > 0) {
        setInsights(res.insights);
        setHasRealData(res.hasRealData ?? true);
        setCurrentIndex(0);
      } else {
        // Honest handling: No real data yet, hide banner
        setInsights([]);
        setHasRealData(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [effectiveCity]);

  // Auto-advancing rotating carousel every 6 seconds, pauses on hover
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (isPaused || insights.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % insights.length);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, insights.length]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % insights.length);
  }, [insights.length]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + insights.length) % insights.length);
  }, [insights.length]);

  // Honest handling: If no real data is available, do not fabricate numbers
  if (!hasRealData || insights.length === 0) {
    return null;
  }

  const currentInsight = insights[currentIndex];

  const getMetricBadge = (type: MarketInsightItem["metricType"], change: string) => {
    switch (type) {
      case "price_index":
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Price Trend {change}</span>
          </span>
        );
      case "demand_signal":
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-brand-primary/15 text-brand-primary dark:text-amber-400 border border-brand-primary/20">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Demand Surge {change}</span>
          </span>
        );
      case "new_listings":
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Fresh Inventory</span>
          </span>
        );
      default:
        return null;
    }
  };

  const handleClick = () => {
    if (!currentInsight) return;
    const q = currentInsight.filterQuery;
    
    // Parse plot or unit presets if mentioned in the title
    let minArea: number | undefined;
    let maxArea: number | undefined;
    let areaUnit: "marla" | "kanal" | "sqft" | "sqyd" | undefined;

    if (currentInsight.title.includes("10-Marla")) {
      minArea = 10;
      maxArea = 10;
      areaUnit = "marla";
    } else if (currentInsight.title.includes("5-Marla")) {
      minArea = 5;
      maxArea = 5;
      areaUnit = "marla";
    } else if (currentInsight.title.includes("1-Kanal")) {
      minArea = 1;
      maxArea = 1;
      areaUnit = "kanal";
    }

    onApplyInsight({
      city: q.city || effectiveCity,
      area: q.area,
      propertyType: (q as any).propertyType || q.make,
      verifiedOnly: q.verifiedOnly,
      minArea,
      maxArea,
      areaUnit
    });
  };

  return (
    <div 
      className={cn("w-full mb-6 relative group", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <motion.div
        layout
        onClick={handleClick}
        className="w-full p-4 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-brand-primary/5 to-emerald-500/5 dark:from-emerald-950/30 dark:via-slate-900/60 dark:to-emerald-950/20 border border-emerald-500/20 dark:border-emerald-500/30 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all cursor-pointer overflow-hidden backdrop-blur-md"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left section: Icon + Content */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              {currentInsight.metricType === "new_listings" ? (
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
              ) : currentInsight.metricType === "demand_signal" ? (
                <Flame className="w-6 h-6 text-amber-500" />
              ) : (
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span>Market Pulse</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </span>

                {getMetricBadge(currentInsight.metricType, currentInsight.change)}

                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                  <Info className="w-3 h-3" />
                  <span>Real Aggregate Data</span>
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentInsight.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-0.5"
                >
                  <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                    {currentInsight.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {currentInsight.subtitle} · <span className="text-brand-primary dark:text-amber-400 font-semibold underline underline-offset-2">Tap to view matching properties</span>
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right section: Navigation & Call to Action */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-500/10">
            {/* Carousel navigation pills */}
            {insights.length > 1 && (
              <div className="flex items-center gap-1 bg-white/70 dark:bg-slate-800/70 p-1 rounded-2xl border border-slate-200/60 dark:border-white/5">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Previous insight"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1 px-1.5">
                  {insights.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(i);
                      }}
                      className={cn(
                        "h-1.5 rounded-full transition-all cursor-pointer",
                        currentIndex === i 
                          ? "w-4 bg-brand-primary" 
                          : "w-1.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400"
                      )}
                      title={`Insight ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Next insight"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Direct Action Link Pill */}
            <div className="px-3.5 py-1.5 rounded-2xl bg-brand-primary text-white text-xs font-bold flex items-center gap-1.5 shadow-sm group-hover:bg-brand-primary/90 transition-all">
              <span>View Results</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
