import React, { useState, useEffect, useMemo } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Building2, 
  Home, 
  LandPlot, 
  Store, 
  Trees, 
  BedDouble, 
  MapPin, 
  Search, 
  RotateCcw,
  Zap
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { PropertyTypeItem, CityItem, AreaItem, propertySchemaService } from "@/services/propertySchemaService";
import { TopFilterBarState, AreaUnit, AREA_UNITS } from "./TopFilterBar";

export type ListingFreshness = "any" | "24h" | "week" | "month";

interface SidebarFiltersProps {
  filters: TopFilterBarState;
  onChange: (updated: Partial<TopFilterBarState>) => void;
  selectedTypes: string[];
  onToggleType: (typeName: string) => void;
  selectedArea: string;
  onSelectArea: (area: string) => void;
  freshness: ListingFreshness;
  onChangeFreshness: (val: ListingFreshness) => void;
  onlyVerified: boolean;
  onToggleVerified: (val: boolean) => void;
  electricityBackup: boolean;
  onToggleElectricityBackup: (val: boolean) => void;
  onResetAll: () => void;
  activeCount: number;
}

export default function SidebarFilters({
  filters,
  onChange,
  selectedTypes,
  onToggleType,
  selectedArea,
  onSelectArea,
  freshness,
  onChangeFreshness,
  onlyVerified,
  onToggleVerified,
  electricityBackup,
  onToggleElectricityBackup,
  onResetAll,
  activeCount
}: SidebarFiltersProps) {
  // Real database schemas
  const [propertyTypes, setPropertyTypes] = useState<PropertyTypeItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [areas, setAreas] = useState<AreaItem[]>([]);
  const [areaSearchInput, setAreaSearchInput] = useState("");

  // Collapsible section toggles
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    verified: true,
    categoryType: true,
    cityArea: true,
    price: true,
    bedsBaths: true,
    areaSize: true,
    amenities: true,
    freshness: true
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Load property types and cities on mount
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

  // Cascading City -> Area: Fetch areas whenever filters.city changes
  const activeCity = filters.city || "Lahore";
  useEffect(() => {
    let isMounted = true;
    propertySchemaService.getAreasByCity(activeCity).then((areaList) => {
      if (isMounted) setAreas(areaList);
    });
    return () => {
      isMounted = false;
    };
  }, [activeCity]);

  // Filtered areas based on inline search
  const filteredAreas = useMemo(() => {
    if (!areaSearchInput.trim()) return areas;
    return areas.filter(a => a.name.toLowerCase().includes(areaSearchInput.toLowerCase()));
  }, [areas, areaSearchInput]);

  const isRent = filters.purpose === "for-rent";

  // Check if bed/bath should be de-emphasized
  const isOnlyPlotsOrCommercial = useMemo(() => {
    if (selectedTypes.length === 0 && !filters.propertyType) return false;
    const allSelected = selectedTypes.length > 0 ? selectedTypes : [filters.propertyType];
    return allSelected.every(t => {
      const lower = t.toLowerCase();
      return lower === "plot" || lower === "commercial";
    });
  }, [selectedTypes, filters.propertyType]);

  return (
    <div className="w-full space-y-5 text-apple-text dark:text-apple-text">
      {/* 1. VERIFIED SELLERS ONLY TOGGLE (Pakizzle Competitive Differentiator) */}
      <section className="p-3.5 rounded-2xl bg-gradient-to-br from-apple-green/10 via-brand-primary/5 to-transparent border border-apple-green/30/20">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-apple-green/15 text-apple-green dark:text-apple-green flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-apple-text dark:text-white">Verified Sellers Only</span>
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-apple-green/20 text-apple-green dark:text-apple-green">
                  Trust
                </span>
              </div>
              <p className="text-[10px] text-apple-text-muted dark:text-apple-text-muted">
                LDA/CDA verified title deeds & agencies
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={onlyVerified}
            onChange={(e) => onToggleVerified(e.target.checked)}
            className="w-4.5 h-4.5 rounded-md border-apple-border text-apple-green focus:ring-apple-green/20 cursor-pointer"
          />
        </label>
      </section>

      {/* 2. PROPERTY CATEGORY & TYPE (Multi-select Checkbox List) */}
      <section className="border-b border-apple-border dark:border-white/5 pb-4">
        <button
          type="button"
          onClick={() => toggleSection("categoryType")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-apple-text dark:text-white">
              Property Type
            </span>
            {selectedTypes.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-brand-primary text-white">
                {selectedTypes.length}
              </span>
            )}
          </div>
          {openSections.categoryType ? (
            <ChevronUp className="w-4 h-4 text-apple-text-muted group-hover:text-apple-text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-apple-text-muted group-hover:text-apple-text-muted" />
          )}
        </button>

        {openSections.categoryType && (
          <div className="mt-3 space-y-1.5">
            {propertyTypes.map((pt) => {
              const isChecked = selectedTypes.includes(pt.name) || 
                                (!selectedTypes.length && filters.propertyType.toLowerCase() === pt.name.toLowerCase());
              return (
                <label 
                  key={pt.id} 
                  className={cn(
                    "flex items-center justify-between px-2.5 py-2 rounded-xl cursor-pointer transition-colors text-xs font-medium",
                    isChecked ? "bg-brand-primary/10 text-brand-primary font-bold" : "hover:bg-apple-gray dark:bg-white/5/60"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleType(pt.name)}
                      className="w-4 h-4 rounded border-apple-border text-brand-primary focus:ring-brand-primary/20 cursor-pointer"
                    />
                    <span>{pt.name}</span>
                  </div>
                  <span className="text-[10px] text-apple-text-muted uppercase tracking-widest">{pt.category}</span>
                </label>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. CASCADING CITY -> AREA/SOCIETY FILTER */}
      <section className="border-b border-apple-border dark:border-white/5 pb-4">
        <button
          type="button"
          onClick={() => toggleSection("cityArea")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-apple-text dark:text-white">
              Location & Society
            </span>
            {(filters.city || selectedArea) && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-brand-primary text-white">
                Active
              </span>
            )}
          </div>
          {openSections.cityArea ? (
            <ChevronUp className="w-4 h-4 text-apple-text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-apple-text-muted" />
          )}
        </button>

        {openSections.cityArea && (
          <div className="mt-3 space-y-3">
            {/* City Selector */}
            <div>
              <label className="text-[10px] font-bold text-apple-text-muted uppercase tracking-wider block mb-1">
                Selected City
              </label>
              <select
                value={filters.city || ""}
                onChange={(e) => {
                  onChange({ city: e.target.value });
                  onSelectArea(""); // Reset cascading area on city switch
                }}
                className="w-full px-3 py-2 rounded-xl bg-apple-gray dark:bg-white/5 text-xs font-bold text-apple-text dark:text-white border border-apple-border dark:border-white/10 outline-none cursor-pointer"
              >
                <option value="">All Pakistan</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Cascading Area Search & List */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold text-apple-text-muted uppercase tracking-wider">
                  Named Societies in {activeCity}
                </label>
                {selectedArea && (
                  <button
                    type="button"
                    onClick={() => onSelectArea("")}
                    className="text-[10px] font-bold text-brand-primary hover:underline cursor-pointer"
                  >
                    Clear Area
                  </button>
                )}
              </div>

              {/* Search box for societies */}
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-apple-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Search ${activeCity} societies...`}
                  value={areaSearchInput}
                  onChange={(e) => setAreaSearchInput(e.target.value)}
                  className="w-full pl-7.5 pr-2.5 py-1.5 rounded-lg bg-apple-gray dark:bg-white/5 text-[11px] font-medium border border-transparent focus:border-brand-primary outline-none"
                />
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                <button
                  type="button"
                  onClick={() => onSelectArea("")}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer",
                    !selectedArea ? "bg-brand-primary text-white font-bold" : "hover:bg-apple-gray dark:bg-white/5"
                  )}
                >
                  <span>All {activeCity} Societies</span>
                  {!selectedArea && <Check className="w-3 h-3 text-white" />}
                </button>

                {filteredAreas.map((area) => {
                  const isSelected = selectedArea.toLowerCase() === area.name.toLowerCase();
                  return (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => onSelectArea(isSelected ? "" : area.name)}
                      className={cn(
                        "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer transition-colors",
                        isSelected
                          ? "bg-brand-primary text-white font-bold shadow-xs"
                          : "hover:bg-apple-gray dark:bg-white/5 text-apple-text dark:text-apple-text"
                      )}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3 h-3 text-apple-orange shrink-0" />
                        <span className="truncate">{area.name}</span>
                      </div>
                      {area.listingCount > 0 && (
                        <span className={cn(
                          "text-[10px] shrink-0 font-semibold px-1 rounded",
                          isSelected ? "text-white/80" : "text-apple-text-muted"
                        )}>
                          {area.listingCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 4. PRICE RANGE (Synced with Top Bar in Real-Time) */}
      <section className="border-b border-apple-border dark:border-white/5 pb-4">
        <button
          type="button"
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
        >
          <span className="text-xs font-black uppercase tracking-wider text-apple-text dark:text-white">
            {isRent ? "Monthly Rent (PKR)" : "Price Range (PKR)"}
          </span>
          {openSections.price ? (
            <ChevronUp className="w-4 h-4 text-apple-text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-apple-text-muted" />
          )}
        </button>

        {openSections.price && (
          <div className="mt-3 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-apple-text-muted block mb-1">Min (PKR)</label>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ""}
                  onChange={(e) => onChange({ minPrice: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-apple-gray dark:bg-white/5 text-xs font-semibold border border-apple-border dark:border-white/10 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-apple-text-muted block mb-1">Max (PKR)</label>
                <input
                  type="number"
                  placeholder="Any"
                  value={filters.maxPrice || ""}
                  onChange={(e) => onChange({ maxPrice: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-apple-gray dark:bg-white/5 text-xs font-semibold border border-apple-border dark:border-white/10 outline-none"
                />
              </div>
            </div>

            {/* Quick Price Chips */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {(isRent
                ? [
                    { label: "< 50K", max: 50000 },
                    { label: "50K - 1 Lakh", min: 50000, max: 100000 },
                    { label: "1 - 2.5 Lakh", min: 100000, max: 250000 },
                    { label: "2.5 Lakh +", min: 250000, max: null }
                  ]
                : [
                    { label: "< 1 Crore", max: 10000000 },
                    { label: "1 - 2.5 Crore", min: 10000000, max: 25000000 },
                    { label: "2.5 - 5 Crore", min: 25000000, max: 50000000 },
                    { label: "5 Crore +", min: 50000000, max: null }
                  ]
              ).map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChange({ minPrice: chip.min || null, maxPrice: chip.max || null })}
                  className="px-2 py-1 rounded-lg text-[10px] font-semibold border border-apple-border dark:border-white/10 bg-apple-gray dark:bg-white/5/80 text-apple-text dark:text-apple-text hover:bg-apple-gray cursor-pointer text-center"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 5. BEDROOMS & BATHROOMS (Synced with Top Bar, Auto-hidden on Plots) */}
      {!isOnlyPlotsOrCommercial && (
        <section className="border-b border-apple-border dark:border-white/5 pb-4">
          <button
            type="button"
            onClick={() => toggleSection("bedsBaths")}
            className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
          >
            <span className="text-xs font-black uppercase tracking-wider text-apple-text dark:text-white">
              Beds & Baths
            </span>
            {openSections.bedsBaths ? (
              <ChevronUp className="w-4 h-4 text-apple-text-muted" />
            ) : (
              <ChevronDown className="w-4 h-4 text-apple-text-muted" />
            )}
          </button>

          {openSections.bedsBaths && (
            <div className="mt-3 space-y-3">
              {/* Bedrooms Stepper */}
              <div>
                <label className="text-[10px] font-bold text-apple-text-muted uppercase tracking-wider block mb-1.5">
                  Bedrooms
                </label>
                <div className="flex flex-wrap gap-1">
                  {["any", "studio", "1", "2", "3", "4", "5+"].map((b) => {
                    const isCur = (filters.beds || "any") === b;
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => onChange({ beds: b === "any" ? null : b })}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer",
                          isCur
                            ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                            : "bg-apple-gray dark:bg-white/5 border-apple-border dark:border-white/10 text-apple-text dark:text-apple-text hover:bg-apple-gray"
                        )}
                      >
                        {b === "studio" ? "Studio" : b}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bathrooms Stepper */}
              <div>
                <label className="text-[10px] font-bold text-apple-text-muted uppercase tracking-wider block mb-1.5">
                  Bathrooms
                </label>
                <div className="flex flex-wrap gap-1">
                  {["any", "1", "2", "3", "4", "5+"].map((bt) => {
                    const isCur = (filters.baths || "any") === bt;
                    return (
                      <button
                        key={bt}
                        type="button"
                        onClick={() => onChange({ baths: bt === "any" ? null : bt })}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer",
                          isCur
                            ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                            : "bg-apple-gray dark:bg-white/5 border-apple-border dark:border-white/10 text-apple-text dark:text-apple-text hover:bg-apple-gray"
                        )}
                      >
                        {bt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* 6. AREA / SIZE WITH UNIT TOGGLE (Marla, Kanal, Sq. Ft, Sq. Yd) */}
      <section className="border-b border-apple-border dark:border-white/5 pb-4">
        <button
          type="button"
          onClick={() => toggleSection("areaSize")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
        >
          <span className="text-xs font-black uppercase tracking-wider text-apple-text dark:text-white">
            Area / Size ({AREA_UNITS.find(u => u.id === filters.areaUnit)?.short})
          </span>
          {openSections.areaSize ? (
            <ChevronUp className="w-4 h-4 text-apple-text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-apple-text-muted" />
          )}
        </button>

        {openSections.areaSize && (
          <div className="mt-3 space-y-2.5">
            {/* Unit selector pills */}
            <div className="flex flex-wrap gap-1">
              {AREA_UNITS.map((u) => {
                const isCur = filters.areaUnit === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => onChange({ areaUnit: u.id })}
                    className={cn(
                      "px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer",
                      isCur
                        ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                        : "bg-apple-gray dark:bg-white/5 border-apple-border dark:border-white/10 text-apple-text-muted dark:text-apple-text-muted hover:bg-apple-gray"
                    )}
                  >
                    {u.short}
                  </button>
                );
              })}
            </div>

            {/* Min / Max inputs */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-apple-text-muted block mb-1">Min Area</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minArea || ""}
                  onChange={(e) => onChange({ minArea: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-apple-gray dark:bg-white/5 text-xs font-semibold border border-apple-border dark:border-white/10 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-apple-text-muted block mb-1">Max Area</label>
                <input
                  type="number"
                  placeholder="Any"
                  value={filters.maxArea || ""}
                  onChange={(e) => onChange({ maxArea: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-apple-gray dark:bg-white/5 text-xs font-semibold border border-apple-border dark:border-white/10 outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 7. ADDITIONAL FEATURES & AMENITIES */}
      <section className="border-b border-apple-border dark:border-white/5 pb-4">
        <button
          type="button"
          onClick={() => toggleSection("amenities")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
        >
          <span className="text-xs font-black uppercase tracking-wider text-apple-text dark:text-white">
            Features & Amenities
          </span>
          {openSections.amenities ? (
            <ChevronUp className="w-4 h-4 text-apple-text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-apple-text-muted" />
          )}
        </button>

        {openSections.amenities && (
          <div className="mt-3 space-y-2">
            {[
              { key: "cornerPlot", label: "Corner Plot", checked: !!filters.cornerPlot, onToggle: (val: boolean) => onChange({ cornerPlot: val }) },
              { key: "parkFacing", label: "Park Facing", checked: !!filters.parkFacing, onToggle: (val: boolean) => onChange({ parkFacing: val }) },
              { key: "boundaryWall", label: "Boundary Wall", checked: !!filters.boundaryWall, onToggle: (val: boolean) => onChange({ boundaryWall: val }) },
              { key: "parkingAvailable", label: "Parking Available", checked: !!filters.parkingAvailable, onToggle: (val: boolean) => onChange({ parkingAvailable: val }) },
              { key: "electricityBackup", label: "Electricity Backup (Solar/UPS)", checked: electricityBackup, onToggle: onToggleElectricityBackup },
            ].map(({ key, label, checked, onToggle }) => (
              <label key={key} className="flex items-center justify-between cursor-pointer px-1 py-1 hover:bg-apple-gray dark:bg-white/5/40 rounded-lg">
                <span className="text-xs font-medium text-apple-text dark:text-apple-text">{label}</span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => onToggle(e.target.checked)}
                  className="w-4 h-4 rounded border-apple-border text-brand-primary focus:ring-brand-primary/20 cursor-pointer"
                />
              </label>
            ))}
          </div>
        )}
      </section>

      {/* 8. LISTING FRESHNESS (Zameen Date of Addition Filter) */}
      <section className="pb-2">
        <button
          type="button"
          onClick={() => toggleSection("freshness")}
          className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
        >
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-primary" />
            <span className="text-xs font-black uppercase tracking-wider text-apple-text dark:text-white">
              Date Added
            </span>
          </div>
          {openSections.freshness ? (
            <ChevronUp className="w-4 h-4 text-apple-text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-apple-text-muted" />
          )}
        </button>

        {openSections.freshness && (
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            {[
              { id: "any" as const, label: "Any Time" },
              { id: "24h" as const, label: "Last 24 Hours" },
              { id: "week" as const, label: "Last Week" },
              { id: "month" as const, label: "Last Month" },
            ].map((f) => {
              const isSelected = freshness === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onChangeFreshness(f.id)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center",
                    isSelected
                      ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                      : "bg-apple-gray dark:bg-white/5 border-apple-border dark:border-white/5 text-apple-text dark:text-apple-text hover:bg-apple-gray"
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
