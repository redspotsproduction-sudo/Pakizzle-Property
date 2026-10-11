import React, { useState } from "react";
import { 
  Home, 
  Building2, 
  LandPlot, 
  Store, 
  Trees, 
  Layers, 
  Check,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PropertyTypeOption {
  id: string;
  name: string;
  category: "residential" | "plot" | "commercial";
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const PROPERTY_CATEGORIES = [
  { id: "residential", label: "Residential", icon: Home, count: "7 Types" },
  { id: "plot", label: "Plots & Land", icon: LandPlot, count: "5 Types" },
  { id: "commercial", label: "Commercial", icon: Store, count: "5 Types" },
] as const;

export const PROPERTY_TYPES_BY_CATEGORY: Record<"residential" | "plot" | "commercial", PropertyTypeOption[]> = {
  residential: [
    { id: "house", name: "House / Villa", category: "residential", icon: Home, description: "Independent bungalow or luxury house" },
    { id: "flat", name: "Flat / Apartment", category: "residential", icon: Building2, description: "Multi-storey residential apartment" },
    { id: "upper-portion", name: "Upper Portion", category: "residential", icon: Layers, description: "Independent upper floor living" },
    { id: "lower-portion", name: "Lower Portion", category: "residential", icon: Layers, description: "Independent ground floor living" },
    { id: "penthouse", name: "Penthouse", category: "residential", icon: Sparkles, description: "Luxury rooftop residence" },
    { id: "farmhouse", name: "Farm House", category: "residential", icon: Trees, description: "Country residence with acreage" },
    { id: "room", name: "Room / Studio", category: "residential", icon: Home, description: "Single room or studio unit" },
  ],
  plot: [
    { id: "residential-plot", name: "Residential Plot", category: "plot", icon: LandPlot, description: "Zoned residential land ready to build" },
    { id: "commercial-plot", name: "Commercial Plot", category: "plot", icon: Store, description: "High-yield commercial development plot" },
    { id: "agricultural-land", name: "Agricultural Land", category: "plot", icon: Trees, description: "Farmland, orchards, and rural acreage" },
    { id: "industrial-land", name: "Industrial Land", category: "plot", icon: Building2, description: "Factory and warehouse development land" },
    { id: "plot-file", name: "Plot File", category: "plot", icon: Layers, description: "Affidavit / ballot file in approved societies" },
  ],
  commercial: [
    { id: "office", name: "Office Space", category: "commercial", icon: Building2, description: "Corporate office floor or executive suite" },
    { id: "shop", name: "Retail Shop", category: "commercial", icon: Store, description: "High-footfall ground floor retail shop" },
    { id: "plaza", name: "Commercial Plaza", category: "commercial", icon: Building2, description: "Full commercial building or multi-floor plaza" },
    { id: "warehouse", name: "Warehouse / Godown", category: "commercial", icon: Building2, description: "Storage and logistics facility" },
    { id: "factory", name: "Factory / Industrial Unit", category: "commercial", icon: Building2, description: "Operational industrial manufacturing unit" },
  ],
};

export interface PropertyTypeSelection {
  category: "residential" | "plot" | "commercial";
  typeName: string;
  typeId: string;
}

export interface PropertySelectorProps {
  onSelect: (selection: PropertyTypeSelection) => void;
  selectedType?: string;
  initialCategory?: "residential" | "plot" | "commercial";
  orientation?: "vertical" | "horizontal";
  className?: string;
}

export function PropertySelector({
  onSelect,
  selectedType,
  initialCategory = "residential",
  orientation = "vertical",
  className,
}: PropertySelectorProps) {
  const [activeCategory, setActiveCategory] = useState<"residential" | "plot" | "commercial">(initialCategory);

  const handleSelect = (item: PropertyTypeOption) => {
    onSelect({
      category: item.category,
      typeName: item.name,
      typeId: item.id,
    });
  };

  const currentTypes = PROPERTY_TYPES_BY_CATEGORY[activeCategory];

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06]">
        {PROPERTY_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer",
                isActive
                  ? "bg-white dark:bg-[#2C2C2E] text-apple-text dark:text-white shadow-xs"
                  : "text-apple-text-muted dark:text-apple-text-muted hover:text-apple-text dark:hover:text-white"
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", isActive ? "text-apple-blue" : "text-apple-text-muted")} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid of Sub-Types */}
      <div
        className={cn(
          "grid gap-2",
          orientation === "horizontal"
            ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
            : "grid-cols-1 sm:grid-cols-2"
        )}
      >
        {currentTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType?.toLowerCase() === type.name.toLowerCase() || selectedType?.toLowerCase() === type.id.toLowerCase();
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => handleSelect(type)}
              className={cn(
                "flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer group",
                isSelected
                  ? "bg-apple-blue/10 border-apple-blue text-apple-blue dark:bg-apple-blue/20 dark:border-apple-blue shadow-xs"
                  : "bg-white dark:bg-[#1C1C1E] border-black/[0.06] dark:border-white/[0.06] text-apple-text dark:text-apple-text hover:border-black/20 dark:hover:border-white/20"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                    isSelected
                      ? "bg-apple-blue text-white"
                      : "bg-black/[0.04] dark:bg-white/[0.06] text-apple-text-muted dark:text-apple-text group-hover:text-apple-blue"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">{type.name}</div>
                  <div className="text-[10px] text-apple-text-muted dark:text-apple-text-muted truncate max-w-[170px]">
                    {type.description}
                  </div>
                </div>
              </div>
              <div className="shrink-0 pl-2">
                {isSelected ? (
                  <div className="w-5 h-5 rounded-full bg-apple-blue text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : (
                  <ChevronRight className="w-4 h-4 text-apple-border dark:text-apple-text-muted group-hover:text-apple-text-muted transition-colors" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PropertySelector;
