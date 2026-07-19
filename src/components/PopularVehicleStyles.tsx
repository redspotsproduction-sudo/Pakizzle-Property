import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { popularStylesService, BODY_STYLE_PRESETS } from "../services/popularStylesService";
import { PopularStyle } from "../types";
import { cn } from "../lib/utils";

export default function PopularVehicleStyles() {
  const navigate = useNavigate();
  
  // Retrieve cached / default styles instantly for sub-millisecond initial render
  const [styles, setStyles] = useState<PopularStyle[]>(() => {
    return popularStylesService.getCached().filter(s => s.status === 'active');
  });
  
  // Only fallback to skeleton if cache is totally empty
  const [loading, setLoading] = useState(() => {
    const cachedActive = popularStylesService.getCached().filter(s => s.status === 'active');
    return cachedActive.length === 0;
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  useEffect(() => {
    // 1. Trigger service load which retrieves from cache if present (with fallback background refresh)
    popularStylesService.getAll()
      .then(fetchedStyles => {
        setStyles(fetchedStyles.filter(s => s.status === 'active'));
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load popular styles:", err);
        setLoading(false);
      });

    // 2. Register for real-time background revalidation updates
    const handleBackgroundRefresh = (e: Event) => {
      const customEvent = e as CustomEvent<PopularStyle[]>;
      if (customEvent.detail) {
        setStyles(customEvent.detail.filter(s => s.status === 'active'));
      }
    };

    window.addEventListener("popular-styles-refreshed", handleBackgroundRefresh);
    return () => {
      window.removeEventListener("popular-styles-refreshed", handleBackgroundRefresh);
    };
  }, []);

  // Handle arrows visibility during scroll
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 10);
      const remainingScroll = container.scrollWidth - container.clientWidth - container.scrollLeft;
      setShowRightArrow(remainingScroll > 10);
    }
  };

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const handleStyleClick = (style: PopularStyle) => {
    const params = new URLSearchParams();
    params.set(style.filterKey || "bodyType", style.filterValue);
    navigate(`/marketplace?${params.toString()}`);
  };

  // Render the vehicle silhouette using fallback SVG path or Custom SVG path
  const renderSilhouette = (style: PopularStyle) => {
    // If we have an image URL, render it
    if (style.imageUrl) {
      return (
        <img 
          src={style.imageUrl} 
          alt={style.name} 
          className="w-full h-auto max-h-[72px] object-contain transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      );
    }

    // Determine the SVG path
    let path = style.customSvgPath || "";
    if (!path && style.iconPreset) {
      path = BODY_STYLE_PRESETS[style.iconPreset.toLowerCase()]?.svgPath || "";
    }

    // Default SVG if nothing exists
    if (!path) {
      path = "M2 15h3l1.5-4h11L19 15h3v3h-20z"; // simple sedan shape
    }

    return (
      <svg 
        viewBox="0 0 24 24" 
        className="w-20 h-14 text-apple-text-muted transition-colors duration-500 group-hover:text-apple-blue fill-none stroke-current"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={path} />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="pt-4 pb-6 md:pt-5 md:pb-8 max-w-7xl mx-auto px-6">
        <div className="h-6 w-48 bg-apple-gray dark:bg-zinc-800 animate-pulse rounded-lg mb-4" />
        <div className="flex gap-6 overflow-x-auto py-4">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="flex-shrink-0 flex flex-col items-center w-[140px] px-2">
              <div className="h-4 w-12 bg-apple-gray dark:bg-zinc-800 animate-pulse rounded mb-4" />
              <div className="w-full h-16 bg-apple-gray dark:bg-zinc-800 animate-pulse rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (styles.length === 0) return null;

  return (
    <section className="pt-4 pb-5 md:pt-5 md:pb-7 max-w-7xl mx-auto px-6 relative group/section border-t border-apple-border/20">
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-apple-text leading-none">
          Popular vehicle styles
        </h2>
      </div>

      {/* Slide Arrow Navigation Buttons */}
      <div className="relative">
        {showLeftArrow && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 bg-white/95 dark:bg-[#1D1D1F]/95 hover:bg-white dark:hover:bg-[#1D1D1F] text-apple-text w-9 h-9 rounded-full flex items-center justify-center shadow-md border border-apple-border/40 z-10 transition-all duration-300"
            aria-label="Previous styles"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {showRightArrow && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 bg-white/95 dark:bg-[#1D1D1F]/95 hover:bg-white dark:hover:bg-[#1D1D1F] text-apple-text w-9 h-9 rounded-full flex items-center justify-center shadow-md border border-apple-border/40 z-10 transition-all duration-300"
            aria-label="Next styles"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Scrollable style lists */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-4 md:gap-8 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin scrollbar-hide select-none px-1"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {styles.map((style) => (
            <motion.div
              key={style.id}
              onClick={() => handleStyleClick(style)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="flex-shrink-0 snap-start flex flex-col items-center group cursor-pointer w-[130px] md:w-[150px] text-center"
            >
              {/* 1. Category label at the top */}
              <span className="text-sm md:text-base font-semibold tracking-tight text-slate-800 dark:text-zinc-200 group-hover:text-apple-blue duration-300 transition-colors mb-3">
                {style.name}
              </span>

              {/* 2. Side-profile vehicle image/SVG at the bottom (plain background, no circles etc) */}
              <div className="w-full h-[60px] md:h-[75px] flex items-end justify-center relative overflow-hidden">
                {renderSilhouette(style)}
              </div>
              
              {/* Subtle Carvana-style floor reflection/shadow hint */}
              <div className="w-[85%] h-[4px] bg-black/[0.04] dark:bg-white/[0.02] rounded-[50%] blur-[1px] mt-1 transition-opacity duration-300 group-hover:opacity-75" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
