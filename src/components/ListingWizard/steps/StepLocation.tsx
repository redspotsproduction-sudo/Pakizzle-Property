import React, { useState, useEffect, useRef } from "react";
import { MapPin, Search, Check, ChevronDown, Building, AlertCircle } from "lucide-react";
import { cn } from "../../../lib/utils";
import { ListingWizardState } from "../types";
import { PAKISTAN_LOCATIONS } from "../../../constants/locations";

interface StepLocationProps {
  state: ListingWizardState;
  updateState: (updates: Partial<ListingWizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const CITIES = Object.keys(PAKISTAN_LOCATIONS);

export const StepLocation: React.FC<StepLocationProps> = ({
  state,
  updateState,
  onNext,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState(state.areaName || "");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Available societies for the current city
  const availableSocieties = PAKISTAN_LOCATIONS[state.city] || [];

  // Filtered autocomplete suggestions based on query
  const suggestions = availableSocieties.filter(
    (area) =>
      area.toLowerCase() !== `all over ${state.city.toLowerCase()}` &&
      area.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCityChange = (city: string) => {
    // When city changes, reset area if not valid in new city
    const newSocieties = PAKISTAN_LOCATIONS[city] || [];
    const firstSociety = newSocieties.find(s => !s.toLowerCase().startsWith("all over")) || "Main Society";
    
    updateState({
      city,
      areaName: firstSociety,
    });
    setSearchQuery(firstSociety);
    setHasError(false);
  };

  const handleSelectArea = (area: string) => {
    setSearchQuery(area);
    updateState({ areaName: area });
    setIsDropdownOpen(false);
    setHasError(false);
  };

  const handleAreaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    updateState({ areaName: val });
    setIsDropdownOpen(true);
    setHasError(val.trim().length < 2);
  };

  const handleContinue = () => {
    if (!state.areaName || state.areaName.trim().length < 2) {
      setHasError(true);
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-apple-text tracking-tight mb-2">
          Where is your property located?
        </h2>
        <p className="text-sm text-apple-text-muted leading-relaxed">
          Accurate society and sector naming ensures your listing is indexed by the Shanakht™ title search engine.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. City Dropdown */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-apple-text-muted">
            City <span className="text-[#D93A45]">*</span>
          </label>
          <div className="relative">
            <select
              value={state.city}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full h-14 pl-4 pr-10 rounded-2xl border border-apple-border/50 bg-white/80 dark:bg-white/5 text-apple-text text-sm font-semibold focus:outline-none focus:border-[#5B2A86] focus:ring-4 focus:ring-[#5B2A86]/10 appearance-none transition-all cursor-pointer"
            >
              {CITIES.map((city) => (
                <option key={city} value={city} className="bg-white dark:bg-slate-900 text-apple-text">
                  {city}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-apple-text-muted absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 2. Area / Society with Searchable Autocomplete */}
        <div className="space-y-2 relative" ref={dropdownRef}>
          <label className="block text-xs font-bold uppercase tracking-wider text-apple-text-muted">
            Society / Sector / Locality <span className="text-[#D93A45]">*</span>
          </label>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <Search className="w-4 h-4 text-[#5B2A86] dark:text-[#F0A830]" />
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={handleAreaInputChange}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder={`Search e.g. DHA, Clifton, Sector F-7 in ${state.city}...`}
              className={cn(
                "w-full h-14 pl-11 pr-10 rounded-2xl border bg-white/80 dark:bg-white/5 text-apple-text text-sm font-semibold focus:outline-none transition-all",
                hasError
                  ? "border-[#D93A45] focus:ring-4 focus:ring-[#D93A45]/10"
                  : "border-apple-border/50 focus:border-[#5B2A86] focus:ring-4 focus:ring-[#5B2A86]/10"
              )}
            />

            {state.areaName && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5FA84C]">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            )}
          </div>

          {hasError && (
            <p className="text-xs font-semibold text-[#D93A45] flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Please specify a valid society or sector name.
            </p>
          )}

          {/* Autocomplete Dropdown Menu */}
          {isDropdownOpen && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-apple-border/50 bg-white/95 dark:bg-[#1A1526]/95 backdrop-blur-xl shadow-2xl z-50 p-2 scrollbar-thin">
              <div className="text-[10px] font-bold uppercase tracking-wider text-apple-text-muted px-3 py-1.5 border-b border-apple-border/20">
                Verified Societies in {state.city}
              </div>
              {suggestions.slice(0, 10).map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => handleSelectArea(area)}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-apple-text hover:bg-[#5B2A86]/10 hover:text-[#5B2A86] dark:hover:text-[#FAF3E6] flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#5B2A86] dark:text-[#F0A830]" />
                    {area}
                  </span>
                  {state.areaName === area && (
                    <span className="text-[10px] font-bold text-[#5FA84C]">Selected</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Street / Block / Plot Number (Optional for privacy) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-apple-text-muted">
              Street, Phase or Block Address (Optional)
            </label>
            <span className="text-[11px] text-apple-text-muted">Exact plot # stays private</span>
          </div>

          <input
            type="text"
            value={state.addressDetail}
            onChange={(e) => updateState({ addressDetail: e.target.value })}
            placeholder="e.g. Block H, Sector 2, Near Central Commercial..."
            className="w-full h-14 px-4 rounded-2xl border border-apple-border/50 bg-white/80 dark:bg-white/5 text-apple-text text-sm font-semibold focus:outline-none focus:border-[#5B2A86] focus:ring-4 focus:ring-[#5B2A86]/10 transition-all"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="h-12 px-6 rounded-full border border-apple-border hover:bg-black/5 dark:hover:bg-white/5 font-semibold text-xs text-apple-text transition-all cursor-pointer"
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={handleContinue}
          className="h-12 px-8 rounded-full pakizzle-button-primary font-bold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer"
        >
          Continue to Details →
        </button>
      </div>
    </div>
  );
};

export default StepLocation;
