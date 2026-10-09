import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  ChevronDown, 
  X, 
  MapPin, 
  Home, 
  DollarSign, 
  Sparkles, 
  SlidersHorizontal,
  Bed, 
  Bath, 
  Layers, 
  Maximize2, 
  RotateCcw,
  Check,
  Building,
  Key,
  ShieldCheck,
  History
} from "lucide-react";
import { cn, formatPrice } from "../lib/utils";
import { PAKISTAN_LOCATIONS } from "../constants/locations";
import { useProperties } from "../context/PropertyContext";
import { useLocation } from "../context/LocationContext";
import ValuationModal from "./ValuationModal";

export default function SearchBar() {
  const navigate = useNavigate();
  const { properties, vehicles } = useProperties();
  const { location: globalLocation } = useLocation();

  // Primary Tabs Mode
  const [activeTab, setActiveTab] = useState<"buy" | "rent" | "sell" | "pre-approval" | "valuation">("buy");
  const [isValuationOpen, setIsValuationOpen] = useState(false);

  // Search input & Suggestions State
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Filter States
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [beds, setBeds] = useState<number | null>(null);
  const [baths, setBaths] = useState<number | null>(null);
  const [minSize, setMinSize] = useState<number | null>(null);
  const [maxSize, setMaxSize] = useState<number | null>(null);

  // Advanced Drawer Filter States
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [constructionState, setConstructionState] = useState<string>("");
  const [furnishing, setFurnishing] = useState<string>("");
  const [onlyVerified, setOnlyVerified] = useState(false);

  // Active Dropdown state (controls which inline pill is open)
  const [openDropdown, setOpenDropdown] = useState<"type" | "price" | "beds" | "size" | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Synchronize with global location
  useEffect(() => {
    if (globalLocation && globalLocation.city && globalLocation.city !== "Pakistan") {
      setSelectedCities([globalLocation.city]);
    } else {
      setSelectedCities([]);
    }
  }, [globalLocation]);

  // Load Recent Searches
  useEffect(() => {
    const loaded = JSON.parse(localStorage.getItem("pakizzle_recent_searches") || "[]");
    setRecentSearches(loaded);
  }, []);

  // Close dropdowns on outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Popular Neighborhoods / Areas in Pakistan
  const POPULAR_NEIGHBORHOODS = [
    { name: "Clifton", city: "Karachi" },
    { name: "DHA Phase 6", city: "Lahore" },
    { name: "G-11", city: "Islamabad" },
    { name: "Gulberg III", city: "Lahore" },
    { name: "Bahria Town", city: "Karachi" }
  ];

  // Property Types Definition
  const PROPERTY_TYPES = ["House", "Apartment", "Penthouse", "Plot", "Commercial"];

  // Handle Autocomplete Suggestions matching cities & sectors
  const autocompleteSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    
    const citiesMatched: { type: "city"; name: string; info: string }[] = [];
    const areasMatched: { type: "area"; name: string; city: string }[] = [];

    // Match Cities
    Object.keys(PAKISTAN_LOCATIONS).forEach(city => {
      if (city.toLowerCase().includes(q)) {
        citiesMatched.push({
          type: "city",
          name: city,
          info: "City in Pakistan"
        });
      }

      // Match Areas
      PAKISTAN_LOCATIONS[city].forEach(area => {
        if (area.toLowerCase().includes(q) && area !== "All over " + city) {
          areasMatched.push({
            type: "area",
            name: area,
            city: city
          });
        }
      });
    });

    return [...citiesMatched.slice(0, 3), ...areasMatched.slice(0, 5)];
  }, [searchQuery]);

  // Handle Tab Switch
  const handleTabClick = (tab: "buy" | "rent" | "sell" | "pre-approval" | "valuation") => {
    if (tab === "sell") {
      navigate("/sell");
      return;
    }
    if (tab === "pre-approval") {
      navigate("/financing");
      return;
    }
    if (tab === "valuation") {
      setIsValuationOpen(true);
      return;
    }
    setActiveTab(tab);
    setOpenDropdown(null);
    // Reset prices between Rent and Buy due to different orders of magnitude
    setMinPrice(null);
    setMaxPrice(null);
  };

  // Execute Search Search Submit
  const handleSearchSubmit = () => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set("q", searchQuery);
    params.set("purpose", activeTab);

    if (selectedCities.length > 0) {
      params.set("city", selectedCities.join(","));
    }
    if (selectedPropertyTypes.length > 0) {
      params.set("make", selectedPropertyTypes.join(","));
    }
    if (minPrice !== null) params.set("minPrice", minPrice.toString());
    if (maxPrice !== null) params.set("maxPrice", maxPrice.toString());
    if (beds !== null) params.set("beds", beds.toString());
    if (baths !== null) params.set("baths", baths.toString());
    if (minSize !== null) params.set("minMileage", minSize.toString());
    if (maxSize !== null) params.set("maxMileage", maxSize.toString());

    if (constructionState) params.set("condition", constructionState);
    if (furnishing) params.set("transmission", furnishing);
    if (onlyVerified) params.set("verified", "true");

    // Save recent searches
    const cleanSearch = searchQuery.trim();
    if (cleanSearch) {
      const updated = [cleanSearch, ...recentSearches.filter(s => s !== cleanSearch)].slice(0, 5);
      localStorage.setItem("pakizzle_recent_searches", JSON.stringify(updated));
      setRecentSearches(updated);
    }

    setShowSuggestions(false);
    setOpenDropdown(null);
    navigate(`/marketplace?${params.toString()}`);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedPropertyTypes([]);
    setMinPrice(null);
    setMaxPrice(null);
    setBeds(null);
    setBaths(null);
    setMinSize(null);
    setMaxSize(null);
    setConstructionState("");
    setFurnishing("");
    setOnlyVerified(false);
    setSelectedCities([]);
  };

  // Price presets depending on active tab (Rent prices are smaller)
  const pricePresets = activeTab === "rent" 
    ? [20000, 40000, 60000, 100000, 200000, 500000] 
    : [2000000, 5000000, 10000000, 25000000, 50000000, 100000000];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-5xl mx-auto px-4 relative z-40 -mt-16 sm:-mt-24 md:-mt-32"
      ref={containerRef}
    >
      {/* Realtor.com-Style Primary Tab Header Bar */}
      <div className="flex items-center gap-1 sm:gap-2 mb-3 bg-white/70 dark:bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-apple-border/30 dark:border-white/5 w-fit shadow-lg">
        {[
          { id: "buy", label: "Buy" },
          { id: "rent", label: "Rent" },
          { id: "sell", label: "Sell" },
          { id: "pre-approval", label: "Pre-Approval" },
          { id: "valuation", label: "AI Valuation", icon: Sparkles }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id as any)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                isActive 
                  ? "bg-apple-blue text-white shadow-md shadow-apple-blue/20" 
                  : "text-apple-text-muted hover:text-apple-text hover:bg-apple-gray/55 dark:hover:bg-white/5"
              )}
            >
              {tab.icon && <tab.icon className={cn("w-3.5 h-3.5", isActive ? "animate-pulse" : "text-apple-blue")} />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Consolidated Search & Filter Panel Container */}
      <div className="bg-white/95 dark:bg-apple-card-bg/95 backdrop-blur-2xl rounded-[32px] shadow-apple-soft border border-apple-border/40 dark:border-white/5 p-4 sm:p-5">
        
        {/* Core Address / Search Input bar & Autocomplete Trigger */}
        <div className="relative flex flex-col md:flex-row items-center gap-3 w-full">
          <div className="relative flex-1 w-full">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-apple-blue">
              <MapPin className="w-5 h-5 shrink-0" />
            </div>
            
            <input
              type="text"
              placeholder={
                activeTab === "rent"
                  ? "Enter City, Neighborhood, or Sector for Rent... (e.g. Clifton, DHA, Gulberg)"
                  : "Enter City, Neighborhood, or Sector... (e.g. Clifton Karachi, DHA Lahore, G-11 Islamabad)"
              }
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full pl-11 pr-10 py-4 border border-apple-border/20 dark:border-white/5 rounded-2xl bg-apple-gray/30 dark:bg-white/5 text-sm md:text-base outline-none text-apple-text focus:border-apple-blue focus:ring-4 focus:ring-apple-blue/10 transition-all font-medium placeholder:text-apple-text-muted"
            />

            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowSuggestions(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-apple-text-muted hover:text-apple-text hover:bg-apple-gray/60 dark:hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Large Action Search Button */}
          <button
            onClick={handleSearchSubmit}
            className="w-full md:w-auto px-8 py-4 bg-apple-blue hover:bg-apple-blue-hover text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-apple-blue/25 hover:shadow-apple-blue/35 transition-all duration-300 transform active:scale-95 group cursor-pointer"
          >
            <Search className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="text-sm md:text-base">Search Properties</span>
          </button>
        </div>

        {/* Dynamic Autocomplete Suggestions Overlay */}
        <AnimatePresence>
          {showSuggestions && (searchQuery || recentSearches.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 4 }}
              exit={{ opacity: 0 }}
              className="absolute left-4 right-4 md:left-8 md:right-8 top-[140px] md:top-[124px] z-50 bg-white dark:bg-apple-card-bg border border-apple-border/30 dark:border-white/10 shadow-2xl rounded-2xl overflow-hidden p-4 max-h-[380px] overflow-y-auto custom-scrollbar"
              ref={suggestionsRef}
            >
              {/* Typeahead Suggestions */}
              {searchQuery.trim() !== "" ? (
                <div className="space-y-4">
                  {autocompleteSuggestions.length === 0 ? (
                    <div className="text-center p-6 text-apple-text-muted text-sm font-medium">
                      No matching cities or neighborhoods found. Try "Karachi", "DHA", "Clifton", etc.
                    </div>
                  ) : (
                    <>
                      {/* Cities Section */}
                      {autocompleteSuggestions.some(s => s.type === "city") && (
                        <div>
                          <span className="text-[10px] font-extrabold text-apple-text-muted uppercase tracking-widest flex items-center gap-1.5 mb-2">
                            <Building className="w-3 h-3 text-apple-blue" />
                            Cities
                          </span>
                          <div className="space-y-1">
                            {autocompleteSuggestions
                              .filter(s => s.type === "city")
                              .map(s => (
                                <button
                                  key={`city-${s.name}`}
                                  onClick={() => {
                                    setSearchQuery(s.name);
                                    setSelectedCities([s.name]);
                                    setShowSuggestions(false);
                                  }}
                                  className="w-full text-left p-2.5 rounded-xl hover:bg-apple-gray/50 dark:hover:bg-white/5 flex items-center justify-between text-sm font-semibold text-apple-text transition-colors cursor-pointer"
                                >
                                  <span>{s.name}</span>
                                  <span className="text-[10px] font-medium text-apple-blue bg-apple-blue/10 px-2 py-0.5 rounded-full">Explore City</span>
                                </button>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Areas Section */}
                      {autocompleteSuggestions.some(s => s.type === "area") && (
                        <div>
                          <span className="text-[10px] font-extrabold text-apple-text-muted uppercase tracking-widest flex items-center gap-1.5 mb-2 mt-2">
                            <MapPin className="w-3 h-3 text-apple-blue" />
                            Neighborhoods & Sectors
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                            {autocompleteSuggestions
                              .filter(s => s.type === "area")
                              .map(s => (
                                <button
                                  key={`area-${s.name}-${s.city}`}
                                  onClick={() => {
                                    setSearchQuery(`${s.name}, ${s.city}`);
                                    setSelectedCities([s.city]);
                                    setShowSuggestions(false);
                                  }}
                                  className="w-full text-left p-2.5 rounded-xl hover:bg-apple-gray/50 dark:hover:bg-white/5 flex items-center justify-between text-sm font-medium text-apple-text transition-colors cursor-pointer"
                                >
                                  <div className="truncate">
                                    <span className="font-bold">{s.name}</span>
                                    <span className="text-apple-text-muted text-xs ml-1.5">• {s.city}</span>
                                  </div>
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                /* Default focus panel: Recent searches & popular areas */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recent searches */}
                  <div>
                    <span className="text-[10px] font-extrabold text-apple-text-muted uppercase tracking-widest flex items-center gap-1.5 mb-3">
                      <History className="w-3.5 h-3.5 text-apple-blue" />
                      Recent Searches
                    </span>
                    {recentSearches.length === 0 ? (
                      <p className="text-xs text-apple-text-muted italic pl-1">No recent searches yet.</p>
                    ) : (
                      <div className="space-y-1">
                        {recentSearches.map((term, i) => (
                          <div key={i} className="flex items-center justify-between group">
                            <button
                              onClick={() => {
                                setSearchQuery(term);
                                setShowSuggestions(false);
                              }}
                              className="flex-1 text-left py-2 px-2.5 rounded-lg hover:bg-apple-gray/40 dark:hover:bg-white/5 text-xs sm:text-sm font-medium text-apple-text truncate cursor-pointer"
                            >
                              {term}
                            </button>
                            <button
                              onClick={() => {
                                const filtered = recentSearches.filter(s => s !== term);
                                setRecentSearches(filtered);
                                localStorage.setItem("pakizzle_recent_searches", JSON.stringify(filtered));
                              }}
                              className="p-1 text-apple-text-muted hover:text-apple-red rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Popular areas */}
                  <div>
                    <span className="text-[10px] font-extrabold text-apple-text-muted uppercase tracking-widest flex items-center gap-1.5 mb-3">
                      <Sparkles className="w-3.5 h-3.5 text-apple-blue animate-pulse" />
                      Popular Neighborhoods
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {POPULAR_NEIGHBORHOODS.map((hood, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSearchQuery(`${hood.name}, ${hood.city}`);
                            setSelectedCities([hood.city]);
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-apple-gray/50 dark:hover:bg-white/5 flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-apple-text transition-colors cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5 text-apple-blue shrink-0" />
                          <div className="truncate">
                            <span>{hood.name}</span>
                            <span className="text-apple-text-muted font-normal text-[11px] ml-1.5">in {hood.city}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Realtor.com-Style Inline Dropdown Filter Pill Row */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-apple-border/20 dark:border-white/5">
          
          {/* 1. Property Type Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === "type" ? null : "type")}
              className={cn(
                "px-4 py-2.5 rounded-full border border-apple-border/35 dark:border-white/10 text-xs font-semibold text-apple-text flex items-center gap-1.5 transition-all hover:bg-apple-gray/30 dark:hover:bg-white/5 cursor-pointer",
                selectedPropertyTypes.length > 0 && "border-apple-blue bg-apple-blue/10 text-apple-blue"
              )}
            >
              <Home className="w-3.5 h-3.5" />
              <span>
                {selectedPropertyTypes.length === 0 
                  ? "Property Type" 
                  : selectedPropertyTypes.length === 1 
                  ? selectedPropertyTypes[0] 
                  : `${selectedPropertyTypes.length} Types`
                }
              </span>
              <ChevronDown className="w-3 h-3 text-apple-text-muted" />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {openDropdown === "type" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 4 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-0 mt-1 z-50 w-56 bg-white dark:bg-apple-card-bg border border-apple-border/30 dark:border-white/10 shadow-2xl rounded-2xl p-3 space-y-2.5"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted px-1.5">Select Types</p>
                  <div className="space-y-1">
                    {PROPERTY_TYPES.map(type => {
                      const isSelected = selectedPropertyTypes.includes(type);
                      return (
                        <button
                          key={type}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedPropertyTypes(selectedPropertyTypes.filter(t => t !== type));
                            } else {
                              setSelectedPropertyTypes([...selectedPropertyTypes, type]);
                            }
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-apple-text hover:bg-apple-gray/50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                        >
                          <span>{type}</span>
                          <div className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center transition-all",
                            isSelected ? "bg-apple-blue border-apple-blue text-white" : "border-apple-border/40"
                          )}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. Price Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === "price" ? null : "price")}
              className={cn(
                "px-4 py-2.5 rounded-full border border-apple-border/35 dark:border-white/10 text-xs font-semibold text-apple-text flex items-center gap-1.5 transition-all hover:bg-apple-gray/30 dark:hover:bg-white/5 cursor-pointer",
                (minPrice !== null || maxPrice !== null) && "border-apple-blue bg-apple-blue/10 text-apple-blue"
              )}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>
                {minPrice !== null && maxPrice !== null 
                  ? `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
                  : minPrice !== null 
                  ? `${formatPrice(minPrice)}+`
                  : maxPrice !== null 
                  ? `Under ${formatPrice(maxPrice)}`
                  : "Any Price"
                }
              </span>
              <ChevronDown className="w-3 h-3 text-apple-text-muted" />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {openDropdown === "price" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 4 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-0 mt-1 z-50 w-72 bg-white dark:bg-apple-card-bg border border-apple-border/30 dark:border-white/10 shadow-2xl rounded-2xl p-4 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-apple-border/10 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">Price Range</span>
                    <button 
                      onClick={() => { setMinPrice(null); setMaxPrice(null); }} 
                      className="text-[10px] text-apple-blue font-bold hover:underline"
                    >
                      Reset Price
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[9px] font-black text-apple-text-muted uppercase tracking-wider block mb-1">Min Price</label>
                      <input 
                        type="number"
                        placeholder="Any"
                        value={minPrice || ""}
                        onChange={(e) => setMinPrice(e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full p-2 border border-apple-border/30 rounded-xl bg-apple-gray/40 dark:bg-white/5 text-xs outline-none text-apple-text focus:border-apple-blue"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-apple-text-muted uppercase tracking-wider block mb-1">Max Price</label>
                      <input 
                        type="number"
                        placeholder="Any"
                        value={maxPrice || ""}
                        onChange={(e) => setMaxPrice(e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full p-2 border border-apple-border/30 rounded-xl bg-apple-gray/40 dark:bg-white/5 text-xs outline-none text-apple-text focus:border-apple-blue"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-black text-apple-text-muted uppercase tracking-wider block mb-2">Price Presets</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {pricePresets.map(preset => (
                        <button
                          key={preset}
                          onClick={() => {
                            if (minPrice === null) {
                              setMinPrice(preset);
                            } else if (preset > minPrice) {
                              setMaxPrice(preset);
                              setOpenDropdown(null);
                            } else {
                              setMinPrice(preset);
                              setMaxPrice(null);
                            }
                          }}
                          className={cn(
                            "p-2 text-left text-[11px] font-semibold border rounded-xl transition-all truncate cursor-pointer",
                            (minPrice === preset || maxPrice === preset)
                              ? "bg-apple-blue text-white border-apple-blue" 
                              : "bg-apple-gray/30 dark:bg-white/5 border-apple-border/10 text-apple-text hover:bg-apple-gray"
                          )}
                        >
                          {formatPrice(preset)} PKR
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Beds & Baths Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === "beds" ? null : "beds")}
              className={cn(
                "px-4 py-2.5 rounded-full border border-apple-border/35 dark:border-white/10 text-xs font-semibold text-apple-text flex items-center gap-1.5 transition-all hover:bg-apple-gray/30 dark:hover:bg-white/5 cursor-pointer",
                (beds !== null || baths !== null) && "border-apple-blue bg-apple-blue/10 text-apple-blue"
              )}
            >
              <Bed className="w-3.5 h-3.5" />
              <span>
                {beds !== null && baths !== null 
                  ? `${beds}+ Bed / ${baths}+ Bath`
                  : beds !== null 
                  ? `${beds}+ Bed`
                  : baths !== null 
                  ? `${baths}+ Bath`
                  : "Beds / Baths"
                }
              </span>
              <ChevronDown className="w-3 h-3 text-apple-text-muted" />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {openDropdown === "beds" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 4 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-0 mt-1 z-50 w-64 bg-white dark:bg-apple-card-bg border border-apple-border/30 dark:border-white/10 shadow-2xl rounded-2xl p-4 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-apple-border/10 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">Beds & Baths</span>
                    <button 
                      onClick={() => { setBeds(null); setBaths(null); }} 
                      className="text-[10px] text-apple-blue font-bold hover:underline"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Bedrooms */}
                  <div>
                    <span className="text-[10px] font-black text-apple-text-muted uppercase tracking-wider block mb-2">Bedrooms</span>
                    <div className="flex items-center gap-1.5">
                      {[null, 1, 2, 3, 4, 5].map(val => (
                        <button
                          key={val === null ? "any" : val}
                          onClick={() => setBeds(val)}
                          className={cn(
                            "w-9 h-9 text-xs font-bold rounded-xl flex items-center justify-center transition-all cursor-pointer border",
                            beds === val 
                              ? "bg-apple-blue border-apple-blue text-white shadow-sm"
                              : "bg-apple-gray/40 dark:bg-white/5 border-apple-border/10 text-apple-text hover:bg-apple-gray"
                          )}
                        >
                          {val === null ? "Any" : val + "+"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bathrooms */}
                  <div>
                    <span className="text-[10px] font-black text-apple-text-muted uppercase tracking-wider block mb-2">Bathrooms</span>
                    <div className="flex items-center gap-1.5">
                      {[null, 1, 2, 3, 4].map(val => (
                        <button
                          key={val === null ? "any" : val}
                          onClick={() => setBaths(val)}
                          className={cn(
                            "w-10 h-9 text-xs font-bold rounded-xl flex items-center justify-center transition-all cursor-pointer border",
                            baths === val 
                              ? "bg-apple-blue border-apple-blue text-white shadow-sm"
                              : "bg-apple-gray/40 dark:bg-white/5 border-apple-border/10 text-apple-text hover:bg-apple-gray"
                          )}
                        >
                          {val === null ? "Any" : val + "+"}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. Area Size (Sq. Ft.) Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === "size" ? null : "size")}
              className={cn(
                "px-4 py-2.5 rounded-full border border-apple-border/35 dark:border-white/10 text-xs font-semibold text-apple-text flex items-center gap-1.5 transition-all hover:bg-apple-gray/30 dark:hover:bg-white/5 cursor-pointer",
                (minSize !== null || maxSize !== null) && "border-apple-blue bg-apple-blue/10 text-apple-blue"
              )}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>
                {minSize !== null && maxSize !== null 
                  ? `${minSize} - ${maxSize} Sq. Ft.`
                  : minSize !== null 
                  ? `${minSize}+ Sq. Ft.`
                  : maxSize !== null 
                  ? `Under ${maxSize} Sq. Ft.`
                  : "Area Size"
                }
              </span>
              <ChevronDown className="w-3 h-3 text-apple-text-muted" />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {openDropdown === "size" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 4 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-0 mt-1 z-50 w-72 bg-white dark:bg-apple-card-bg border border-apple-border/30 dark:border-white/10 shadow-2xl rounded-2xl p-4 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-apple-border/10 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">Area Size (Sq. Ft.)</span>
                    <button 
                      onClick={() => { setMinSize(null); setMaxSize(null); }} 
                      className="text-[10px] text-apple-blue font-bold hover:underline"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[9px] font-black text-apple-text-muted uppercase tracking-wider block mb-1">Min Size</label>
                      <input 
                        type="number"
                        placeholder="Any"
                        value={minSize || ""}
                        onChange={(e) => setMinSize(e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full p-2 border border-apple-border/30 rounded-xl bg-apple-gray/40 dark:bg-white/5 text-xs outline-none text-apple-text focus:border-apple-blue"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-apple-text-muted uppercase tracking-wider block mb-1">Max Size</label>
                      <input 
                        type="number"
                        placeholder="Any"
                        value={maxSize || ""}
                        onChange={(e) => setMaxSize(e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full p-2 border border-apple-border/30 rounded-xl bg-apple-gray/40 dark:bg-white/5 text-xs outline-none text-apple-text focus:border-apple-blue"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-black text-apple-text-muted uppercase tracking-wider block mb-2">Popular Sizes</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { label: "5 Marla (~1,125)", sq: 1125 },
                        { label: "10 Marla (~2,250)", sq: 2250 },
                        { label: "1 Kanal (~4,500)", sq: 4500 },
                        { label: "2 Kanal (~9,000)", sq: 9000 }
                      ].map(item => (
                        <button
                          key={item.sq}
                          onClick={() => {
                            if (minSize === null) {
                              setMinSize(item.sq);
                            } else {
                              setMaxSize(item.sq);
                              setOpenDropdown(null);
                            }
                          }}
                          className={cn(
                            "p-2 text-left text-[10px] font-semibold border rounded-xl transition-all truncate cursor-pointer",
                            (minSize === item.sq || maxSize === item.sq)
                              ? "bg-apple-blue text-white border-apple-blue" 
                              : "bg-apple-gray/30 dark:bg-white/5 border-apple-border/10 text-apple-text hover:bg-apple-gray"
                          )}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 5. More / Advanced Filters Panel Toggle button */}
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className={cn(
              "px-4 py-2.5 rounded-full border border-apple-border/35 dark:border-white/10 text-xs font-semibold text-apple-text flex items-center gap-1.5 transition-all hover:bg-apple-gray/30 dark:hover:bg-white/5 cursor-pointer ml-auto",
              (constructionState || furnishing || onlyVerified) && "border-apple-blue bg-apple-blue/10 text-apple-blue"
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>More Filters</span>
          </button>

          {/* Reset Action Button if filters are active */}
          {(selectedCities.length > 0 || selectedPropertyTypes.length > 0 || minPrice !== null || maxPrice !== null || beds !== null || baths !== null || minSize !== null || maxSize !== null || constructionState || furnishing || onlyVerified) && (
            <button
              onClick={handleResetFilters}
              className="px-3.5 py-2.5 hover:bg-apple-red/15 text-apple-red text-xs font-bold rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

        </div>

        {/* Collapsible Realtor.com More Filters Drawer/Card Area */}
        <AnimatePresence>
          {isAdvancedOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-5 mt-4 border-t border-apple-border/20 dark:border-white/5">
                
                {/* Construction State */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-apple-text-muted uppercase tracking-wider block">Construction State</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: "ready", label: "Ready to Move" },
                      { id: "under_construction", label: "Under Construction" },
                      { id: "off_plan", label: "Off-Plan" }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setConstructionState(constructionState === opt.id ? "" : opt.id)}
                        className={cn(
                          "px-3 py-2 text-xs font-semibold border rounded-xl transition-all cursor-pointer",
                          constructionState === opt.id
                            ? "bg-apple-blue border-apple-blue text-white shadow-sm"
                            : "bg-apple-gray/30 dark:bg-apple-card-bg border-apple-border/10 text-apple-text hover:bg-apple-gray"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Furnishing Status */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-apple-text-muted uppercase tracking-wider block">Furnishing Status</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: "furnished", label: "Furnished" },
                      { id: "semi-furnished", label: "Semi-Furnished" },
                      { id: "unfurnished", label: "Unfurnished" }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setFurnishing(furnishing === opt.id ? "" : opt.id)}
                        className={cn(
                          "px-3 py-2 text-xs font-semibold border rounded-xl transition-all cursor-pointer",
                          furnishing === opt.id
                            ? "bg-apple-blue border-apple-blue text-white shadow-sm"
                            : "bg-apple-gray/30 dark:bg-apple-card-bg border-apple-border/10 text-apple-text hover:bg-apple-gray"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Verification Check & Stats */}
                <div className="space-y-3 flex flex-col justify-center">
                  <div className="flex items-center justify-between p-3.5 bg-apple-gray/30 dark:bg-white/5 rounded-2xl border border-apple-border/10">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-apple-green/10 rounded-full text-apple-green">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-apple-text">Verified Listings Only</p>
                        <p className="text-[10px] text-apple-text-muted">Show properties authenticated by Pakizzle</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setOnlyVerified(!onlyVerified)}
                      className={cn(
                        "w-11 h-6 rounded-full transition-all relative flex items-center p-1 cursor-pointer",
                        onlyVerified ? "bg-apple-green" : "bg-apple-gray"
                      )}
                    >
                      <motion.div 
                        layout
                        className="w-4.5 h-4.5 rounded-full bg-white shadow-md"
                      />
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Embedded High-Fidelity Smart AI Valuation Modal */}
      <ValuationModal isOpen={isValuationOpen} onClose={() => setIsValuationOpen(false)} />
    </motion.div>
  );
}
