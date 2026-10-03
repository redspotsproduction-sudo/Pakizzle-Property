import React, { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { 
  Building2, 
  Home, 
  LandPlot, 
  Store, 
  Trees, 
  Sparkles,
  MapPin,
  TrendingUp,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PropertyTypeItem, AreaItem, propertySchemaService } from "@/services/propertySchemaService";

interface QuickAccessRowProps {
  activePropertyType: string;
  onSelectPropertyType: (type: string) => void;
  activeArea?: string;
  onSelectArea: (area: string) => void;
  currentCity?: string;
  className?: string;
}

export default function QuickAccessRow({
  activePropertyType,
  onSelectPropertyType,
  activeArea = "",
  onSelectArea,
  currentCity = "Lahore",
  className
}: QuickAccessRowProps) {
  const [propertyTypes, setPropertyTypes] = useState<PropertyTypeItem[]>([]);
  const [popularSocieties, setPopularSocieties] = useState<AreaItem[]>([]);
  const [activeTab, setActiveTab] = useState<"types" | "societies">("types");

  // Effective city for societies query
  const effectiveCity = useMemo(() => {
    return currentCity && currentCity.trim() ? currentCity.trim() : "Lahore";
  }, [currentCity]);

  // Load property types from schema
  useEffect(() => {
    let isMounted = true;
    propertySchemaService.getPropertyTypes().then((types) => {
      if (isMounted) setPropertyTypes(types);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Dynamically load popular societies for the active city from areas table
  useEffect(() => {
    let isMounted = true;
    propertySchemaService.getPopularSocieties(effectiveCity).then((areas) => {
      if (isMounted) setPopularSocieties(areas);
    });
    return () => {
      isMounted = false;
    };
  }, [effectiveCity]);

  const getTypeIcon = (typeName: string) => {
    const lower = typeName.toLowerCase();
    if (lower.includes("house")) return <Home className="w-3.5 h-3.5" />;
    if (lower.includes("flat") || lower.includes("apartment")) return <Building2 className="w-3.5 h-3.5" />;
    if (lower.includes("plot") || lower.includes("land")) return <LandPlot className="w-3.5 h-3.5" />;
    if (lower.includes("commercial")) return <Store className="w-3.5 h-3.5" />;
    if (lower.includes("farmhouse")) return <Trees className="w-3.5 h-3.5" />;
    return <Sparkles className="w-3.5 h-3.5" />;
  };

  return (
    <div className={cn("w-full mb-6 space-y-2.5", className)}>
      {/* Header with Mode Switcher (Property Types vs Popular Societies) */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab("types")}
            className={cn(
              "px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === "types"
                ? "bg-brand-primary text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <Layers className="w-3 h-3" />
            <span>Property Types</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("societies")}
            className={cn(
              "px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === "societies"
                ? "bg-brand-primary text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <MapPin className="w-3 h-3 text-amber-400" />
            <span>Top Societies in {effectiveCity}</span>
            {popularSocieties.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20 font-black">
                {popularSocieties.length}
              </span>
            )}
          </button>
        </div>

        {/* Live Filter Hint */}
        <span className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-slate-400">
          <TrendingUp className="w-3 h-3 text-emerald-500" />
          <span>Tap to filter instantly</span>
        </span>
      </div>

      {/* Row 1: Property Types Chips */}
      {activeTab === "types" && (
        <div 
          className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none custom-scrollbar"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* "All Types" Chip */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => onSelectPropertyType("")}
            className={cn(
              "px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all border flex items-center gap-2 cursor-pointer shadow-xs",
              !activePropertyType
                ? "bg-brand-primary text-white border-brand-primary shadow-brand-primary/20 ring-2 ring-brand-primary/20"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Properties</span>
          </motion.button>

          {/* Real Property Types from Schema */}
          {propertyTypes.map((pt) => {
            const isSelected = activePropertyType.toLowerCase() === pt.name.toLowerCase() || 
                               activePropertyType.toLowerCase() === pt.slug.toLowerCase();
            return (
              <motion.button
                key={pt.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => onSelectPropertyType(isSelected ? "" : pt.name)}
                className={cn(
                  "px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all border flex items-center gap-2 cursor-pointer shadow-xs",
                  isSelected
                    ? "bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/20 ring-2 ring-brand-primary/20"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300"
                )}
              >
                <span className={cn(
                  "p-1 rounded-lg shrink-0",
                  isSelected ? "bg-white/20 text-white" : "bg-brand-primary/10 text-brand-primary dark:text-amber-400"
                )}>
                  {getTypeIcon(pt.name)}
                </span>
                <span>{pt.name}</span>
              </motion.button>
            );
          })}

          {/* New Projects special chip */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => onSelectPropertyType(activePropertyType === "New Projects" ? "" : "New Projects")}
            className={cn(
              "px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all border flex items-center gap-2 cursor-pointer shadow-xs",
              activePropertyType === "New Projects"
                ? "bg-brand-primary text-white border-brand-primary shadow-brand-primary/20 ring-2 ring-brand-primary/20"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300"
            )}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>New Projects</span>
          </motion.button>
        </div>
      )}

      {/* Row 2: Dynamic Popular Societies Chips (Sourced from areas table ranked by search frequency) */}
      {activeTab === "societies" && (
        <div 
          className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none custom-scrollbar"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* "All Areas" Chip */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => onSelectArea("")}
            className={cn(
              "px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all border flex items-center gap-2 cursor-pointer shadow-xs",
              !activeArea
                ? "bg-brand-primary text-white border-brand-primary shadow-brand-primary/20 ring-2 ring-brand-primary/20"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300"
            )}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>All {effectiveCity} Societies</span>
          </motion.button>

          {/* Dynamic areas from schema */}
          {popularSocieties.map((soc) => {
            const isSelected = activeArea.toLowerCase() === soc.name.toLowerCase();
            return (
              <motion.button
                key={soc.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => onSelectArea(isSelected ? "" : soc.name)}
                className={cn(
                  "px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all border flex items-center gap-2 cursor-pointer shadow-xs",
                  isSelected
                    ? "bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/20 ring-2 ring-brand-primary/20"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300"
                )}
              >
                <MapPin className={cn(
                  "w-3.5 h-3.5",
                  isSelected ? "text-white" : "text-brand-primary dark:text-amber-400"
                )} />
                <span>{soc.name}</span>
                {soc.listingCount > 0 && (
                  <span className={cn(
                    "text-[10px] font-semibold px-1.5 py-0.2 rounded-full",
                    isSelected ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  )}>
                    {soc.listingCount}+
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
