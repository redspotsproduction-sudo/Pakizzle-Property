import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Search, 
  ChevronDown, 
  SlidersHorizontal, 
  Check, 
  Building2, 
  Home, 
  LandPlot, 
  Store, 
  Trees, 
  BedDouble, 
  Sparkles,
  MapPin,
  Hash,
  ArrowRight,
  RotateCcw
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { PropertyTypeItem, CityItem, propertySchemaService } from "@/services/propertySchemaService";
import FilterPopover from "@/components/ui/FilterPopover";

export type PropertyPurpose = "for-sale" | "for-rent";
export type AreaUnit = "marla" | "kanal" | "sqft" | "sqyd" | "sqm";

export interface TopFilterBarState {
  purpose: PropertyPurpose;
  city: string;
  propertyType: string;
  minPrice: number | null;
  maxPrice: number | null;
  beds: string | null; // 'any', 'studio', '1', '2', '3', '4', '5+'
  baths: string | null; // 'any', '1', '2', '3', '4', '5+'
  minArea: number | null;
  maxArea: number | null;
  areaUnit: AreaUnit;
  // More filters overflow
  yearBuiltMin?: number | null;
  furnishedStatus?: string; // 'all' | 'furnished' | 'semi-furnished' | 'unfurnished'
  cornerPlot?: boolean;
  parkFacing?: boolean;
  boundaryWall?: boolean;
  parkingAvailable?: boolean;
}

interface TopFilterBarProps {
  filters: TopFilterBarState;
  onChange: (updated: Partial<TopFilterBarState>) => void;
  onReset: () => void;
  resultCount: number;
  activeCount: number;
  onOpenMobileFilters: () => void;
  onDirectIdSearch: (id: string) => void;
  idSearchError?: string;
  isSticky?: boolean;
}

export const AREA_UNITS: { id: AreaUnit; label: string; short: string; sqftMultiplier: number }[] = [
  { id: "marla", label: "Marla", short: "Marla", sqftMultiplier: 225 },
  { id: "kanal", label: "Kanal", short: "Kanal", sqftMultiplier: 4500 },
  { id: "sqft", label: "Square Feet", short: "Sq. Ft.", sqftMultiplier: 1 },
  { id: "sqyd", label: "Square Yards", short: "Sq. Yd.", sqftMultiplier: 9 },
  { id: "sqm", label: "Square Meters", short: "Sq. M.", sqftMultiplier: 10.764 },
];

export default function TopFilterBar({
  filters,
  onChange,
  onReset,
  resultCount,
  activeCount,
  onOpenMobileFilters,
  onDirectIdSearch,
  idSearchError,
  isSticky = false,
}: TopFilterBarProps) {
  // Real schema records
  const [propertyTypes, setPropertyTypes] = useState<PropertyTypeItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  
  // Active dropdown state & trigger references for collision-detected portal positioning
  const [activeDropdown, setActiveDropdown] = useState<"city" | "type" | "price" | "beds" | "area" | "more" | null>(null);
  const [citySearchInput, setCitySearchInput] = useState("");
  const [idInput, setIdInput] = useState("");

  const cityTriggerRef = useRef<HTMLButtonElement>(null);
  const typeTriggerRef = useRef<HTMLButtonElement>(null);
  const priceTriggerRef = useRef<HTMLButtonElement>(null);
  const bedsTriggerRef = useRef<HTMLButtonElement>(null);
  const areaTriggerRef = useRef<HTMLButtonElement>(null);
  const moreTriggerRef = useRef<HTMLButtonElement>(null);

  // Fetch real schema from database
  useEffect(() => {
    let isMounted = true;
    propertySchemaService.getPropertyTypes().then((types) => {
      if (isMounted) setPropertyTypes(types);
    });
    propertySchemaService.getCities().then((cList) => {
      if (isMounted) setCities(cList);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Purpose scale adjustments
  const isRent = filters.purpose === "for-rent";

  const maxPricePresetOptions = isRent
    ? [
        { label: "Any Max", val: null },
        { label: "Rs. 50 Thousand", val: 50000 },
        { label: "Rs. 1 Lakh", val: 100000 },
        { label: "Rs. 2.5 Lakh", val: 250000 },
        { label: "Rs. 5 Lakh", val: 500000 },
        { label: "Rs. 15 Lakh", val: 1500000 },
      ]
    : [
        { label: "Any Max", val: null },
        { label: "Rs. 1 Crore", val: 10000000 },
        { label: "Rs. 2.5 Crore", val: 25000000 },
        { label: "Rs. 5 Crore", val: 50000000 },
        { label: "Rs. 10 Crore", val: 100000000 },
        { label: "Rs. 25 Crore", val: 250000000 },
        { label: "Rs. 50 Crore", val: 500000000 },
      ];

  // Plot/Commercial checks (beds/baths meaningless for plots/commercial)
  const isBedBathDisabled = useMemo(() => {
    const pt = filters.propertyType.toLowerCase();
    return pt === "plot" || pt === "commercial";
  }, [filters.propertyType]);

  // City list partitioned: Popular on top, then alphabetical
  const popularCities = useMemo(() => cities.filter(c => c.isPopular), [cities]);
  const otherCities = useMemo(() => {
    return cities
      .filter(c => !c.isPopular)
      .filter(c => c.name.toLowerCase().includes(citySearchInput.toLowerCase()));
  }, [cities, citySearchInput]);

  return (
    <div 
      className={cn(
        "w-full transition-all duration-300 z-30",
        isSticky 
          ? "sticky top-16 md:top-20 bg-white/95 dark:bg-[#141414]/95 backdrop-blur-xl shadow-lg border-y border-apple-border/80 dark:border-white/10 py-3" 
          : "bg-white/90 dark:bg-[#141414]/90 backdrop-blur-md rounded-3xl border border-apple-border/80 dark:border-white/10 shadow-sm p-3.5 md:p-4 my-4"
      )}
    >
      {/* ================= MOBILE VIEW (Single Tap Pill & Live Counter) ================= */}
      <div className="flex md:hidden items-center justify-between gap-2.5">
        {/* Purpose Toggle Mobile */}
        <div className="flex items-center p-1 rounded-2xl bg-apple-gray dark:bg-[#1E1E20] border border-apple-border dark:border-white/10">
          <button
            type="button"
            onClick={() => onChange({ purpose: "for-sale" })}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
              filters.purpose === "for-sale"
                ? "bg-brand-primary text-white shadow-sm"
                : "text-apple-text-muted text-apple-text-muted hover:text-apple-text dark:hover:text-white"
            )}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => onChange({ purpose: "for-rent" })}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
              filters.purpose === "for-rent"
                ? "bg-brand-primary text-white shadow-sm"
                : "text-apple-text-muted text-apple-text-muted hover:text-apple-text dark:hover:text-white"
            )}
          >
            Rent
          </button>
        </div>

        {/* Mobile Full-Screen Filter Launcher Pill */}
        <button
          type="button"
          onClick={onOpenMobileFilters}
          className="flex-1 flex items-center justify-between px-3.5 py-2 rounded-2xl bg-apple-gray dark:bg-[#1E1E20] border border-apple-border dark:border-white/10 text-xs font-bold text-apple-text dark:text-white shadow-xs cursor-pointer active:scale-98 transition-transform"
        >
          <div className="flex items-center gap-2 truncate">
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-primary shrink-0" />
            <span className="truncate">
              {filters.city || "All Pakistan"} · {filters.propertyType || "All Types"}
            </span>
          </div>
          {activeCount > 0 && (
            <span className="ml-2 w-5 h-5 rounded-full bg-brand-primary text-white text-[10px] font-black flex items-center justify-center shrink-0">
              {activeCount}
            </span>
          )}
        </button>

        {/* Live Result Count Indicator Mobile */}
        <div className="text-[11px] font-bold text-brand-primary dark:text-apple-orange px-2 shrink-0">
          {resultCount} {resultCount === 1 ? "Property" : "Properties"}
        </div>
      </div>

      {/* ================= DESKTOP MAIN FILTER BAR (Zameen Architecture) ================= */}
      <div className="hidden md:flex flex-col gap-3">
        <div className="flex items-center gap-2.5 flex-wrap xl:flex-nowrap">
          {/* 1. PURPOSE TOGGLE (Leftmost, Pill-Style, Prominent) */}
          <div className="flex items-center p-1 rounded-2xl bg-apple-gray dark:bg-[#1E1E20] border border-apple-border dark:border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => onChange({ purpose: "for-sale" })}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5",
                filters.purpose === "for-sale"
                  ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20 scale-[1.02]"
                  : "text-apple-text-muted text-apple-text-muted hover:text-apple-text dark:hover:text-white"
              )}
            >
              <span>Buy</span>
            </button>
            <button
              type="button"
              onClick={() => onChange({ purpose: "for-rent" })}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5",
                filters.purpose === "for-rent"
                  ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20 scale-[1.02]"
                  : "text-apple-text-muted text-apple-text-muted hover:text-apple-text dark:hover:text-white"
              )}
            >
              <span>Rent</span>
            </button>
          </div>

          {/* 2. SEARCHABLE CITY DROPDOWN (Migrated to shared FilterPopover) */}
          <div className="relative">
            <button
              ref={cityTriggerRef}
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === "city" ? null : "city")}
              className={cn(
                "h-10.5 px-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer bg-apple-gray/70 dark:bg-apple-card-bg",
                filters.city 
                  ? "border-brand-primary/50 text-brand-primary dark:text-apple-orange font-bold bg-brand-primary/5 dark:bg-brand-primary/10" 
                  : "border-apple-border dark:border-white/10 text-apple-text text-apple-text hover:border-apple-border dark:hover:border-white/20",
                activeDropdown === "city" && "ring-2 ring-brand-primary/20 border-brand-primary"
              )}
            >
              <MapPin className="w-3.5 h-3.5 text-brand-primary shrink-0" />
              <span className="truncate max-w-[110px]">{filters.city || "All Cities"}</span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-apple-text-muted text-apple-text-muted transition-transform", activeDropdown === "city" && "rotate-180")} />
            </button>

            <FilterPopover
              isOpen={activeDropdown === "city"}
              onClose={() => setActiveDropdown(null)}
              triggerRef={cityTriggerRef}
              title="Select City"
              headerAction={
                filters.city ? (
                  <button 
                    type="button"
                    onClick={() => { onChange({ city: "" }); setActiveDropdown(null); }}
                    className="text-[10px] font-bold text-brand-primary hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                ) : undefined
              }
              width={340}
              maxHeight={460}
              contentClassName="p-4 flex flex-col min-h-0 overflow-hidden"
            >
              {/* Search input for cities */}
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 text-apple-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Pakistan city..."
                  value={citySearchInput}
                  onChange={(e) => setCitySearchInput(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-2 rounded-xl bg-apple-gray dark:bg-white/5 text-xs font-semibold text-apple-text text-apple-text border border-transparent focus:border-brand-primary outline-none"
                />
              </div>

              {/* Pinned Most-Searched Cities */}
              <div className="mb-3">
                <span className="text-[10px] font-bold text-apple-text-muted text-apple-text-muted uppercase tracking-wider block mb-1.5">Top Metros</span>
                <div className="flex flex-wrap gap-1.5">
                  {popularCities.map((c) => {
                    const isSelected = filters.city === c.name;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          onChange({ city: isSelected ? "" : c.name });
                          setActiveDropdown(null);
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer",
                          isSelected
                            ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                            : "bg-apple-gray dark:bg-white/5 text-apple-text text-apple-text border-apple-border dark:border-white/10 hover:border-apple-border dark:hover:border-white/20"
                        )}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contained Scrolling City List with Visible Scrollbar & Scroll Affordance */}
              <div 
                className="max-h-72 overflow-y-auto space-y-1 pr-2 border-t border-apple-border/80 dark:border-white/10 pt-2 custom-scrollbar"
              >
                <button
                  type="button"
                  onClick={() => { onChange({ city: "" }); setActiveDropdown(null); }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors",
                    !filters.city ? "bg-brand-primary/10 text-brand-primary font-bold dark:bg-brand-primary/20" : "text-apple-text text-apple-text hover:bg-apple-gray dark:hover:bg-white/5"
                  )}
                >
                  <span>All over Pakistan</span>
                  {!filters.city && <Check className="w-3.5 h-3.5 text-brand-primary" />}
                </button>
                {otherCities.map((c) => {
                  const isSelected = filters.city === c.name;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        onChange({ city: c.name });
                        setActiveDropdown(null);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between cursor-pointer transition-colors",
                        isSelected 
                          ? "bg-brand-primary/10 text-brand-primary font-bold dark:bg-brand-primary/20" 
                          : "text-apple-text text-apple-text hover:bg-apple-gray dark:hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-apple-text-muted text-apple-text-muted" />
                        <span>{c.name}</span>
                      </div>
                      <span className="text-[10px] text-apple-text-muted text-apple-text-muted font-normal">{c.province}</span>
                    </button>
                  );
                })}

                {/* Clear Affordance Footer: Confirms full list is accessible */}
                <div className="pt-2.5 pb-1 text-center border-t border-apple-border dark:border-white/5 mt-2">
                  <span className="text-[10px] font-bold text-apple-text-muted text-apple-text-muted block">
                    ✓ All 15 metropolitan hubs available · End of list
                  </span>
                </div>
              </div>
            </FilterPopover>
          </div>

          {/* 3. PROPERTY TYPE DROPDOWN (Migrated to shared FilterPopover) */}
          <div className="relative">
            <button
              ref={typeTriggerRef}
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === "type" ? null : "type")}
              className={cn(
                "h-10.5 px-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer bg-apple-gray/70 dark:bg-apple-card-bg",
                filters.propertyType 
                  ? "border-brand-primary/50 text-brand-primary dark:text-apple-orange font-bold bg-brand-primary/5 dark:bg-brand-primary/10" 
                  : "border-apple-border dark:border-white/10 text-apple-text text-apple-text hover:border-apple-border dark:hover:border-white/20",
                activeDropdown === "type" && "ring-2 ring-brand-primary/20 border-brand-primary"
              )}
            >
              <Building2 className="w-3.5 h-3.5 text-brand-primary shrink-0" />
              <span className="truncate max-w-[120px]">{filters.propertyType || "Property Type"}</span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-apple-text-muted text-apple-text-muted transition-transform", activeDropdown === "type" && "rotate-180")} />
            </button>

            <FilterPopover
              isOpen={activeDropdown === "type"}
              onClose={() => setActiveDropdown(null)}
              triggerRef={typeTriggerRef}
              title="Property Type"
              headerAction={
                filters.propertyType ? (
                  <button 
                    type="button"
                    onClick={() => { onChange({ propertyType: "" }); setActiveDropdown(null); }}
                    className="text-[10px] font-bold text-brand-primary hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                ) : undefined
              }
              width={280}
              maxHeight={440}
            >
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => { onChange({ propertyType: "" }); setActiveDropdown(null); }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer",
                    !filters.propertyType ? "bg-brand-primary/10 text-brand-primary font-bold dark:bg-brand-primary/20" : "hover:bg-apple-gray dark:hover:bg-white/5"
                  )}
                >
                  <span>All Property Types</span>
                  {!filters.propertyType && <Check className="w-3.5 h-3.5 text-brand-primary" />}
                </button>

                {propertyTypes.map((pt) => {
                  const isSelected = filters.propertyType.toLowerCase() === pt.name.toLowerCase() || filters.propertyType.toLowerCase() === pt.slug.toLowerCase();
                  return (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => {
                        onChange({ propertyType: pt.name });
                        setActiveDropdown(null);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between cursor-pointer transition-colors",
                        isSelected
                          ? "bg-brand-primary text-white font-bold shadow-xs"
                          : "text-apple-text text-apple-text hover:bg-apple-gray dark:hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        {pt.name.includes("House") ? <Home className="w-3.5 h-3.5" /> :
                         pt.name.includes("Plot") ? <LandPlot className="w-3.5 h-3.5" /> :
                         pt.name.includes("Commercial") ? <Store className="w-3.5 h-3.5" /> :
                         pt.name.includes("Farmhouse") ? <Trees className="w-3.5 h-3.5" /> :
                         pt.name.includes("Room") ? <BedDouble className="w-3.5 h-3.5" /> :
                         <Building2 className="w-3.5 h-3.5" />}
                        <span>{pt.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </FilterPopover>
          </div>

          {/* 4. PRICE RANGE (Migrated to shared FilterPopover) */}
          <div className="relative">
            <button
              ref={priceTriggerRef}
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === "price" ? null : "price")}
              className={cn(
                "h-10.5 px-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer bg-apple-gray/70 dark:bg-apple-card-bg",
                filters.minPrice || filters.maxPrice 
                  ? "border-brand-primary/50 text-brand-primary dark:text-apple-orange font-bold bg-brand-primary/5 dark:bg-brand-primary/10" 
                  : "border-apple-border dark:border-white/10 text-apple-text text-apple-text hover:border-apple-border dark:hover:border-white/20",
                activeDropdown === "price" && "ring-2 ring-brand-primary/20 border-brand-primary"
              )}
            >
              <span className="text-brand-primary font-bold text-xs">PKR</span>
              <span className="truncate max-w-[130px]">
                {filters.minPrice && filters.maxPrice
                  ? `${formatPrice(filters.minPrice)} - ${formatPrice(filters.maxPrice)}`
                  : filters.minPrice
                  ? `Min ${formatPrice(filters.minPrice)}`
                  : filters.maxPrice
                  ? `Up to ${formatPrice(filters.maxPrice)}`
                  : isRent ? "Monthly Rent" : "Price Range"}
              </span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-apple-text-muted text-apple-text-muted transition-transform", activeDropdown === "price" && "rotate-180")} />
            </button>

            <FilterPopover
              isOpen={activeDropdown === "price"}
              onClose={() => setActiveDropdown(null)}
              triggerRef={priceTriggerRef}
              title={isRent ? "Monthly Rental Budget" : "Purchase Price Range"}
              headerAction={
                (filters.minPrice || filters.maxPrice) ? (
                  <button 
                    type="button"
                    onClick={() => onChange({ minPrice: null, maxPrice: null })}
                    className="text-[10px] font-bold text-brand-primary hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                ) : undefined
              }
              width={340}
              maxHeight={480}
            >
              {/* Dual Min/Max numeric inputs */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <label className="text-[10px] font-bold text-apple-text-muted text-apple-text-muted block mb-1">Min (PKR)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minPrice || ""}
                    onChange={(e) => onChange({ minPrice: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-3 py-2 rounded-xl bg-apple-gray dark:bg-white/5 text-xs font-semibold text-apple-text text-apple-text border border-apple-border dark:border-white/10 outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-apple-text-muted text-apple-text-muted block mb-1">Max (PKR)</label>
                  <input
                    type="number"
                    placeholder="Any"
                    value={filters.maxPrice || ""}
                    onChange={(e) => onChange({ maxPrice: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-3 py-2 rounded-xl bg-apple-gray dark:bg-white/5 text-xs font-semibold text-apple-text text-apple-text border border-apple-border dark:border-white/10 outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              {/* Quick Preset Chips for Pakistani market */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-apple-text-muted text-apple-text-muted uppercase tracking-wider block">Common Presets</span>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                  {maxPricePresetOptions.slice(1).map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => {
                        onChange({ maxPrice: opt.val });
                      }}
                      className={cn(
                        "px-2.5 py-1.5 rounded-xl text-[11px] font-medium text-left border transition-all cursor-pointer",
                        filters.maxPrice === opt.val
                          ? "bg-brand-primary text-white border-brand-primary font-bold shadow-xs"
                          : "bg-apple-gray dark:bg-white/5 border-apple-border dark:border-white/10 text-apple-text text-apple-text hover:bg-apple-gray dark:hover:bg-white/10"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-apple-border dark:border-white/10 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(null)}
                  className="px-4 py-1.5 rounded-xl bg-brand-primary text-white text-xs font-bold cursor-pointer hover:opacity-90"
                >
                  Done
                </button>
              </div>
            </FilterPopover>
          </div>

          {/* 5. BEDS & BATHS (Migrated to shared FilterPopover) */}
          <div className="relative">
            <button
              ref={bedsTriggerRef}
              type="button"
              disabled={isBedBathDisabled}
              onClick={() => setActiveDropdown(activeDropdown === "beds" ? null : "beds")}
              className={cn(
                "h-10.5 px-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-all bg-apple-gray/70 dark:bg-apple-card-bg",
                isBedBathDisabled 
                  ? "opacity-40 cursor-not-allowed bg-apple-gray dark:bg-white/5 text-apple-text-muted border-dashed"
                  : filters.beds || filters.baths
                  ? "border-brand-primary/50 text-brand-primary dark:text-apple-orange font-bold bg-brand-primary/5 dark:bg-brand-primary/10 cursor-pointer"
                  : "border-apple-border dark:border-white/10 text-apple-text text-apple-text hover:border-apple-border dark:hover:border-white/20 cursor-pointer",
                activeDropdown === "beds" && "ring-2 ring-brand-primary/20 border-brand-primary"
              )}
              title={isBedBathDisabled ? "Beds & Baths not applicable for plots or commercial land" : undefined}
            >
              <BedDouble className="w-3.5 h-3.5 text-brand-primary shrink-0" />
              <span className="truncate max-w-[110px]">
                {isBedBathDisabled 
                  ? "Beds N/A" 
                  : filters.beds 
                  ? `${filters.beds === "studio" ? "Studio" : `${filters.beds} Beds`}`
                  : "Beds & Baths"}
              </span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-apple-text-muted text-apple-text-muted transition-transform", activeDropdown === "beds" && "rotate-180")} />
            </button>

            <FilterPopover
              isOpen={activeDropdown === "beds" && !isBedBathDisabled}
              onClose={() => setActiveDropdown(null)}
              triggerRef={bedsTriggerRef}
              title="Bedrooms & Bathrooms"
              width={340}
              maxHeight={440}
            >
              {/* Bedrooms stepper */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-apple-text-muted text-apple-text-muted">Bedrooms</span>
                  {filters.beds && (
                    <button 
                      type="button"
                      onClick={() => onChange({ beds: null })} 
                      className="text-[10px] font-bold text-brand-primary hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["any", "studio", "1", "2", "3", "4", "5+"].map((bd) => {
                    const isCur = (filters.beds || "any") === bd;
                    return (
                      <button
                        key={bd}
                        type="button"
                        onClick={() => onChange({ beds: bd === "any" ? null : bd })}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer",
                          isCur
                            ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                            : "bg-apple-gray dark:bg-white/5 border-apple-border dark:border-white/10 text-apple-text text-apple-text hover:bg-apple-gray dark:hover:bg-white/10"
                        )}
                      >
                        {bd === "studio" ? "Studio" : bd}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bathrooms stepper */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-apple-text-muted text-apple-text-muted">Bathrooms</span>
                  {filters.baths && (
                    <button 
                      type="button"
                      onClick={() => onChange({ baths: null })} 
                      className="text-[10px] font-bold text-brand-primary hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["any", "1", "2", "3", "4", "5+"].map((bt) => {
                    const isCur = (filters.baths || "any") === bt;
                    return (
                      <button
                        key={bt}
                        type="button"
                        onClick={() => onChange({ baths: bt === "any" ? null : bt })}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer",
                          isCur
                            ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                            : "bg-apple-gray dark:bg-white/5 border-apple-border dark:border-white/10 text-apple-text text-apple-text hover:bg-apple-gray dark:hover:bg-white/10"
                        )}
                      >
                        {bt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </FilterPopover>
          </div>

          {/* 6. AREA / SIZE WITH PAKISTANI UNIT SELECTION (Migrated to shared FilterPopover) */}
          <div className="relative">
            <button
              ref={areaTriggerRef}
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === "area" ? null : "area")}
              className={cn(
                "h-10.5 px-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer bg-apple-gray/70 dark:bg-apple-card-bg",
                filters.minArea || filters.maxArea 
                  ? "border-brand-primary/50 text-brand-primary dark:text-apple-orange font-bold bg-brand-primary/5 dark:bg-brand-primary/10" 
                  : "border-apple-border dark:border-white/10 text-apple-text text-apple-text hover:border-apple-border dark:hover:border-white/20",
                activeDropdown === "area" && "ring-2 ring-brand-primary/20 border-brand-primary"
              )}
            >
              <LandPlot className="w-3.5 h-3.5 text-brand-primary shrink-0" />
              <span className="truncate max-w-[120px]">
                {filters.minArea || filters.maxArea
                  ? `${filters.minArea || 0} - ${filters.maxArea || "Any"} ${AREA_UNITS.find(u => u.id === filters.areaUnit)?.short}`
                  : `Area (${AREA_UNITS.find(u => u.id === filters.areaUnit)?.short})`}
              </span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-apple-text-muted text-apple-text-muted transition-transform", activeDropdown === "area" && "rotate-180")} />
            </button>

            <FilterPopover
              isOpen={activeDropdown === "area"}
              onClose={() => setActiveDropdown(null)}
              triggerRef={areaTriggerRef}
              title="Area & Size"
              headerAction={
                (filters.minArea || filters.maxArea) ? (
                  <button 
                    type="button"
                    onClick={() => onChange({ minArea: null, maxArea: null })}
                    className="text-[10px] font-bold text-brand-primary hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                ) : undefined
              }
              width={340}
              maxHeight={480}
            >
              {/* Unit Selection Pills (Marla, Kanal, Sq. Ft, Sq. Yd, Sq. M) */}
              <div className="mb-3">
                <span className="text-[10px] font-bold text-apple-text-muted text-apple-text-muted uppercase tracking-wider block mb-1.5">Standard Land Unit</span>
                <div className="flex flex-wrap gap-1">
                  {AREA_UNITS.map((u) => {
                    const isCur = filters.areaUnit === u.id;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => onChange({ areaUnit: u.id })}
                        className={cn(
                          "px-2.5 py-1 rounded-xl text-xs font-semibold transition-all border cursor-pointer",
                          isCur
                            ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                            : "bg-apple-gray dark:bg-white/5 border-apple-border dark:border-white/10 text-apple-text text-apple-text hover:bg-apple-gray dark:hover:bg-white/10"
                        )}
                      >
                        {u.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Area Numeric Inputs */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="text-[10px] font-bold text-apple-text-muted text-apple-text-muted block mb-1">
                    Min {AREA_UNITS.find(u => u.id === filters.areaUnit)?.short}
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minArea || ""}
                    onChange={(e) => onChange({ minArea: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-3 py-2 rounded-xl bg-apple-gray dark:bg-white/5 text-xs font-semibold text-apple-text text-apple-text border border-apple-border dark:border-white/10 outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-apple-text-muted text-apple-text-muted block mb-1">
                    Max {AREA_UNITS.find(u => u.id === filters.areaUnit)?.short}
                  </label>
                  <input
                    type="number"
                    placeholder="Any"
                    value={filters.maxArea || ""}
                    onChange={(e) => onChange({ maxArea: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-3 py-2 rounded-xl bg-apple-gray dark:bg-white/5 text-xs font-semibold text-apple-text text-apple-text border border-apple-border dark:border-white/10 outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              {/* Typical Pakistani Plot Presets */}
              <div>
                <span className="text-[10px] font-bold text-apple-text-muted text-apple-text-muted uppercase tracking-wider block mb-1.5">Common Plot Sizes</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: "5 Marla", min: 5, max: 5, unit: "marla" as const },
                    { label: "10 Marla", min: 10, max: 10, unit: "marla" as const },
                    { label: "1 Kanal", min: 1, max: 1, unit: "kanal" as const },
                    { label: "2 Kanal", min: 2, max: 2, unit: "kanal" as const },
                    { label: "120 Sq. Yd.", min: 120, max: 120, unit: "sqyd" as const },
                    { label: "500 Sq. Yd.", min: 500, max: 500, unit: "sqyd" as const },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        onChange({ minArea: preset.min, maxArea: preset.max, areaUnit: preset.unit });
                      }}
                      className="px-2 py-1.5 rounded-lg text-[10px] font-semibold text-center border border-apple-border dark:border-white/10 bg-apple-gray dark:bg-white/5 hover:bg-apple-gray dark:hover:bg-white/10 text-apple-text text-apple-text cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </FilterPopover>
          </div>

          {/* 7. "MORE FILTERS" OVERFLOW PANEL (Migrated to shared FilterPopover) */}
          <div className="relative">
            <button
              ref={moreTriggerRef}
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === "more" ? null : "more")}
              className={cn(
                "h-10.5 px-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer bg-apple-gray/70 dark:bg-apple-card-bg",
                activeDropdown === "more" && "ring-2 ring-brand-primary/20 border-brand-primary"
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-apple-text-muted text-apple-text-muted shrink-0" />
              <span>More Filters</span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-apple-text-muted text-apple-text-muted transition-transform", activeDropdown === "more" && "rotate-180")} />
            </button>

            <FilterPopover
              isOpen={activeDropdown === "more"}
              onClose={() => setActiveDropdown(null)}
              triggerRef={moreTriggerRef}
              title="Additional Features"
              align="end"
              width={320}
              maxHeight={460}
            >
              {/* Furnishing Status */}
              <div className="mb-4">
                <label className="text-[10px] font-bold text-apple-text-muted text-apple-text-muted block mb-1.5 uppercase tracking-wider">Furnishing</label>
                <div className="grid grid-cols-3 gap-1">
                  {["all", "furnished", "unfurnished"].map((status) => {
                    const isCur = (filters.furnishedStatus || "all") === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => onChange({ furnishedStatus: status === "all" ? undefined : status })}
                        className={cn(
                          "px-2 py-1.5 rounded-xl text-xs font-medium capitalize border transition-all cursor-pointer",
                          isCur
                            ? "bg-brand-primary text-white border-brand-primary font-bold shadow-xs"
                            : "bg-apple-gray dark:bg-white/5 border-apple-border dark:border-white/10 text-apple-text text-apple-text hover:bg-apple-gray dark:hover:bg-white/10"
                        )}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Checkbox Amenities */}
              <div className="space-y-2.5 pt-1">
                {[
                  { key: "cornerPlot", label: "Corner Plot" },
                  { key: "parkFacing", label: "Park Facing" },
                  { key: "boundaryWall", label: "Boundary Wall" },
                  { key: "parkingAvailable", label: "Parking Available" },
                ].map(({ key, label }) => {
                  const isChecked = !!(filters as any)[key];
                  return (
                    <label key={key} className="flex items-center justify-between cursor-pointer text-xs font-medium text-apple-text text-apple-text hover:bg-apple-gray dark:hover:bg-white/5 p-1 rounded-lg">
                      <span>{label}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => onChange({ [key]: e.target.checked })}
                        className="w-4 h-4 rounded border-apple-border dark:border-white/20 text-brand-primary focus:ring-brand-primary/20"
                      />
                    </label>
                  );
                })}
              </div>
            </FilterPopover>
          </div>

          {/* 8. DEDICATED PROPERTY ID DIRECT SEARCH FIELD */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (idInput.trim()) onDirectIdSearch(idInput.trim());
            }}
            className="flex-1 min-w-[200px] flex items-center relative"
          >
            <div className="relative w-full">
              <Hash className="w-3.5 h-3.5 text-brand-primary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Property ID (e.g. 3421789)..."
                value={idInput}
                onChange={(e) => setIdInput(e.target.value)}
                className="w-full h-10.5 pl-8.5 pr-8 rounded-2xl bg-apple-gray/70 dark:bg-apple-card-bg border border-apple-border dark:border-white/10 text-xs font-semibold text-apple-text text-apple-text placeholder:text-apple-text-muted dark:placeholder:text-[#8E8E93] focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 outline-none transition-all"
              />
              {idInput && (
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg bg-brand-primary text-white hover:opacity-90 cursor-pointer"
                  title="Search ID"
                >
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </form>

          {/* LIVE RESULT COUNT & RESET ACTION */}
          <div className="flex items-center gap-3 shrink-0 ml-auto">
            <div className="px-3.5 py-2 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-apple-green animate-pulse" />
              <span className="text-xs font-black text-brand-primary dark:text-apple-orange">
                {resultCount} {resultCount === 1 ? "Property" : "Properties"}
              </span>
            </div>

            {activeCount > 0 && (
              <button
                type="button"
                onClick={onReset}
                className="p-2 rounded-2xl border border-apple-border dark:border-white/10 text-apple-text-muted hover:text-red-500 hover:border-red-200 transition-colors cursor-pointer"
                title="Reset All Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {idSearchError && (
          <p className="text-[11px] font-bold text-red-500 mt-1 pl-1">
            {idSearchError}
          </p>
        )}
      </div>
    </div>
  );
}
