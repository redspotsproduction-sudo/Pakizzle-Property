import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  ChevronDown, 
  X, 
  MapPin, 
  Car, 
  Banknote, 
  Sparkles, 
  RotateCcw,
  Calendar,
  Gauge,
  SlidersHorizontal
} from "lucide-react";
import { cn, formatPrice } from "../lib/utils";
import { PAKISTAN_LOCATIONS } from "../constants/locations";
import { useVehicles } from "../context/VehicleContext";
import { useLocation } from "../context/LocationContext";

export default function SearchBar() {
  const navigate = useNavigate();
  const { vehicles } = useVehicles();
  const { location } = useLocation();

  // Selected State
  const [selectedCities, setSelectedCities] = useState<string[]>(() => {
    return (location && location.city && location.city !== "Pakistan") ? [location.city] : [];
  });

  // Synchronize with global location
  useEffect(() => {
    if (location && location.city && location.city !== "Pakistan") {
      setSelectedCities([location.city]);
    } else {
      setSelectedCities([]);
    }
  }, [location]);
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minYear, setMinYear] = useState<number | null>(null);
  const [maxYear, setMaxYear] = useState<number | null>(null);
  const [minMileage, setMinMileage] = useState<number | null>(null);
  const [maxMileage, setMaxMileage] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // UI Control
  const [activeDropdown, setActiveDropdown] = useState<'city' | 'makeModel' | 'price' | 'year' | 'km' | null>(null);
  const [citySearch, setCitySearch] = useState("");
  const barRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute Active Filters Count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCities.length > 0) count++;
    if (selectedMake) count++;
    if (selectedModel) count++;
    if (minPrice !== null || maxPrice !== null) count++;
    if (minYear !== null || maxYear !== null) count++;
    if (minMileage !== null || maxMileage !== null) count++;
    if (searchQuery) count++;
    return count;
  }, [selectedCities, selectedMake, selectedModel, minPrice, maxPrice, minYear, maxYear, minMileage, maxMileage, searchQuery]);

  // Execute Search Function
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedCities.length > 0) params.set("city", selectedCities.join(","));
    if (selectedMake) params.set("make", selectedMake);
    if (selectedModel) params.set("model", selectedModel);
    if (minPrice !== null) params.set("minPrice", minPrice.toString());
    if (maxPrice !== null) params.set("maxPrice", maxPrice.toString());
    if (minYear !== null) params.set("minYear", minYear.toString());
    if (maxYear !== null) params.set("maxYear", maxYear.toString());
    if (minMileage !== null) params.set("minMileage", minMileage.toString());
    if (maxMileage !== null) params.set("maxMileage", maxMileage.toString());

    navigate(`/marketplace?${params.toString()}`);
  };

  // Reset function
  const handleReset = () => {
    setSelectedCities([]);
    setSelectedMake("");
    setSelectedModel("");
    setMinPrice(null);
    setMaxPrice(null);
    setMinYear(null);
    setMaxYear(null);
    setMinMileage(null);
    setMaxMileage(null);
    setSearchQuery("");
  };

  const renderDropdownContent = () => {
    switch (activeDropdown) {
      case 'city':
        return (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-apple-border/20 pb-3">
              <span className="text-sm font-bold text-apple-text">Select Cities</span>
              <button 
                onClick={() => setSelectedCities([])} 
                className="text-xs text-apple-blue font-semibold hover:underline"
              >
                Clear All
              </button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-text-muted" />
              <input 
                type="text" 
                placeholder="Search Pakistan cities..." 
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-apple-border/20 rounded-xl bg-apple-gray/50 dark:bg-white/5 text-sm outline-none text-apple-text focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/10 transition-all font-medium"
              />
            </div>

            {/* Quick Popular Cities */}
            <div>
              <span className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest block mb-2">Popular Cities</span>
              <div className="flex flex-wrap gap-2">
                {["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Peshawar", "Faisalabad", "Multan"].map((city) => {
                  const isSelected = selectedCities.includes(city);
                  return (
                    <button
                      key={city}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedCities(selectedCities.filter(c => c !== city));
                        } else {
                          setSelectedCities([...selectedCities, city]);
                        }
                      }}
                      className={cn(
                        "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer",
                        isSelected 
                          ? "bg-apple-blue text-white border-apple-blue shadow-md shadow-apple-blue/15" 
                          : "bg-apple-gray/50 dark:bg-white/5 border-apple-border/10 text-apple-text hover:bg-apple-gray"
                      )}
                    >
                      {city}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="max-h-[220px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {Object.keys(PAKISTAN_LOCATIONS)
                .filter(city => city.toLowerCase().includes(citySearch.toLowerCase()))
                .map((city) => {
                  const isChecked = selectedCities.includes(city);
                  return (
                    <label key={city} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-apple-gray/40 dark:hover:bg-white/5 cursor-pointer transition-colors">
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedCities(selectedCities.filter(c => c !== city));
                          } else {
                            setSelectedCities([...selectedCities, city]);
                          }
                        }}
                        className="w-4.5 h-4.5 rounded border-apple-border/30 text-apple-blue focus:ring-apple-blue/15 cursor-pointer"
                      />
                      <span className="text-sm font-medium text-apple-text">{city}</span>
                    </label>
                  );
                })}
            </div>

            <div className="flex justify-end pt-3 border-t border-apple-border/10">
              <button 
                onClick={() => setActiveDropdown(null)}
                className="px-6 py-2.5 bg-apple-blue text-white rounded-full font-medium text-xs shadow-md shadow-apple-blue/10 hover:opacity-90 cursor-pointer"
              >
                Apply Cities
              </button>
            </div>
          </div>
        );
      case 'makeModel':
        return (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-apple-border/20 pb-3">
              <span className="text-sm font-bold text-apple-text">Select Make & Model</span>
              <button 
                onClick={() => {
                  setSelectedMake("");
                  setSelectedModel("");
                  setSearchQuery("");
                }} 
                className="text-xs text-apple-blue font-semibold hover:underline cursor-pointer"
              >
                Reset
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-text-muted" />
              <input 
                type="text" 
                placeholder="Search brand or make..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-apple-border/20 rounded-xl bg-apple-gray/50 dark:bg-white/5 text-sm outline-none text-apple-text focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/10 transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest block mb-2">Select Brand</span>
                <div className="grid grid-cols-2 gap-1.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                  {["Toyota", "Honda", "Suzuki", "Audi", "BMW", "Mercedes-Benz", "Hyundai", "Kia", "MG", "Changan", "Tesla"].map((brand) => {
                    const isCur = selectedMake === brand;
                    return (
                      <button
                        key={brand}
                        onClick={() => {
                          setSelectedMake(isCur ? "" : brand);
                          setSelectedModel("");
                        }}
                        className={cn(
                          "p-2.5 rounded-xl text-xs font-medium text-left transition-all border cursor-pointer",
                          isCur 
                            ? "bg-apple-blue text-white border-apple-blue shadow-md" 
                            : "bg-apple-gray/50 dark:bg-white/5 border-apple-border/15 text-apple-text hover:bg-apple-gray"
                        )}
                      >
                        {brand}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest block mb-2">Popular Models</span>
                <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                  {!selectedMake ? (
                    <div className="text-xs text-apple-text-muted p-4 text-center">Please select a brand above to explore models.</div>
                  ) : (
                    <>
                      {vehicles
                        .filter(v => v.make === selectedMake)
                        .map(v => v.model)
                        .filter((value, index, self) => self.indexOf(value) === index)
                        .map((model) => {
                          const isCur = selectedModel === model;
                          return (
                            <button
                              key={model}
                              onClick={() => setSelectedModel(isCur ? "" : model)}
                              className={cn(
                                "w-full p-2.5 rounded-xl text-xs font-medium text-left transition-all border flex items-center justify-between cursor-pointer",
                                isCur 
                                  ? "bg-apple-blue/15 text-apple-blue border-apple-blue/30" 
                                  : "bg-apple-gray/50 dark:bg-white/5 border-apple-border/15 text-apple-text hover:bg-apple-gray"
                              )}
                            >
                              <span>{model}</span>
                              {isCur && <div className="w-1.5 h-1.5 bg-apple-blue rounded-full justify-end" />}
                            </button>
                          );
                        })}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-apple-border/10">
              <button 
                onClick={() => setActiveDropdown(null)}
                className="px-6 py-2.5 bg-apple-blue text-white rounded-full font-medium text-xs shadow-md shadow-apple-blue/10 hover:opacity-90 cursor-pointer"
              >
                Apply Make & Model
              </button>
            </div>
          </div>
        );
      case 'price':
        return (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-apple-border/20 pb-3">
              <span className="text-sm font-bold text-apple-text">Price Range (PKR)</span>
              <button 
                onClick={() => {
                  setMinPrice(null);
                  setMaxPrice(null);
                }} 
                className="text-xs text-apple-blue font-semibold hover:underline cursor-pointer"
              >
                Reset
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest block mb-1">Min Price</label>
                <input 
                  type="number" 
                  placeholder="Min PKR" 
                  value={minPrice || ""}
                  onChange={(e) => setMinPrice(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2.5 border border-apple-border/20 rounded-xl bg-apple-gray/50 dark:bg-white/5 text-sm outline-none text-apple-text focus:border-apple-blue"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest block mb-1">Max Price</label>
                <input 
                  type="number" 
                  placeholder="Max PKR" 
                  value={maxPrice || ""}
                  onChange={(e) => setMaxPrice(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2.5 border border-apple-border/20 rounded-xl bg-apple-gray/50 dark:bg-white/5 text-sm outline-none text-apple-text focus:border-apple-blue"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <span className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest block mb-2">Price Presets</span>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { label: "Under 10 Lac", min: null, max: 1000000 },
                  { label: "10-25 Lac", min: 1000000, max: 2500000 },
                  { label: "25-50 Lac", min: 2500000, max: 5000000 },
                  { label: "50-100 Lac", min: 5000000, max: 10000000 },
                  { label: "1 Crore+", min: 10000000, max: null }
                ].map((preset, idx) => {
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setMinPrice(preset.min);
                        setMaxPrice(preset.max);
                      }}
                      className="p-2.5 border border-apple-border/10 bg-apple-gray/40 dark:bg-white/5 text-xs font-medium text-apple-text rounded-xl hover:bg-apple-gray shadow-sm cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-apple-border/10">
              <button 
                onClick={() => setActiveDropdown(null)}
                className="px-6 py-2.5 bg-apple-blue text-white rounded-full font-medium text-xs shadow-md shadow-apple-blue/10 hover:opacity-90 cursor-pointer"
              >
                Apply Price Range
              </button>
            </div>
          </div>
        );
      case 'year':
        return (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-apple-border/20 pb-3">
              <span className="text-sm font-bold text-apple-text">Model Year</span>
              <button 
                onClick={() => {
                  setMinYear(null);
                  setMaxYear(null);
                }} 
                className="text-xs text-apple-blue font-semibold hover:underline cursor-pointer"
              >
                Reset
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest block mb-1">From Year</label>
                <select
                  value={minYear || ""}
                  onChange={(e) => setMinYear(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2.5 border border-apple-border/20 rounded-xl bg-apple-gray/50 dark:bg-[#1C1C1E] text-sm outline-none text-apple-text focus:border-apple-blue cursor-pointer"
                >
                  <option value="">Any Year</option>
                  {Array.from({ length: 37 }, (_, i) => 2026 - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest block mb-1">To Year</label>
                <select
                  value={maxYear || ""}
                  onChange={(e) => setMaxYear(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2.5 border border-apple-border/20 rounded-xl bg-apple-gray/50 dark:bg-[#1C1C1E] text-sm outline-none text-apple-text focus:border-apple-blue cursor-pointer"
                >
                  <option value="">Any Year</option>
                  {Array.from({ length: 37 }, (_, i) => 2026 - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fast Year Selects */}
            <div>
              <span className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest block mb-2">Year Presets</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "New Tech (2022-2026)", min: 2022, max: 2026 },
                  { label: "Modern Classics (2015-2021)", min: 2015, max: 2021 },
                  { label: "Experienced Heroes (2010-2014)", min: 2010, max: 2014 },
                  { label: "Affordable Gems (2000-2009)", min: 2000, max: 2009 }
                ].map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setMinYear(preset.min);
                      setMaxYear(preset.max);
                    }}
                    className="px-3.5 py-1.5 border border-apple-border/10 bg-apple-gray/40 dark:bg-white/5 text-xs font-medium text-apple-text rounded-full hover:bg-apple-gray cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-apple-border/10">
              <button 
                onClick={() => setActiveDropdown(null)}
                className="px-6 py-2.5 bg-apple-blue text-white rounded-full font-medium text-xs shadow-md shadow-apple-blue/10 hover:opacity-90 cursor-pointer"
              >
                Apply Year
              </button>
            </div>
          </div>
        );
      case 'km':
        return (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-apple-border/20 pb-3">
              <span className="text-sm font-bold text-apple-text">Mileage / Kilometers</span>
              <button 
                onClick={() => {
                  setMinMileage(null);
                  setMaxMileage(null);
                }} 
                className="text-xs text-apple-blue font-semibold hover:underline cursor-pointer"
              >
                Reset
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest block mb-1">Min Mileage</label>
                <input 
                  type="number" 
                  placeholder="Min Km" 
                  value={minMileage || ""}
                  onChange={(e) => setMinMileage(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2.5 border border-apple-border/20 rounded-xl bg-apple-gray/50 dark:bg-white/5 text-sm outline-none text-apple-text focus:border-apple-blue"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest block mb-1">Max Mileage</label>
                <input 
                  type="number" 
                  placeholder="Max Km" 
                  value={maxMileage || ""}
                  onChange={(e) => setMaxMileage(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2.5 border border-apple-border/20 rounded-xl bg-apple-gray/50 dark:bg-white/5 text-sm outline-none text-apple-text focus:border-apple-blue"
                />
              </div>
            </div>

            {/* Presets */}
            <div>
              <span className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest block mb-2">Mileage Presets</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Under 10,000 km", min: null, max: 10000 },
                  { label: "10,000 - 50,000 km", min: 10000, max: 50000 },
                  { label: "50,000 - 100,000 km", min: 50000, max: 100000 },
                  { label: "100,000 km+", min: 100000, max: null }
                ].map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setMinMileage(preset.min);
                      setMaxMileage(preset.max);
                    }}
                    className="p-2.5 border border-apple-border/10 bg-apple-gray/40 dark:bg-white/5 text-xs font-medium text-apple-text rounded-xl hover:bg-apple-gray text-center cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-apple-border/10">
              <button 
                onClick={() => setActiveDropdown(null)}
                className="px-6 py-2.5 bg-apple-blue text-white rounded-full font-medium text-xs shadow-md shadow-apple-blue/10 hover:opacity-90 cursor-pointer"
              >
                Apply Mileage
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-40 mb-4 md:mb-6"
      ref={barRef}
    >
      <div className="flex flex-col gap-4">
        {/* The Main Dubizzle Multi-Selector Pill */}
        <div className="w-full bg-white dark:bg-[#161618]/95 border border-apple-border/40 dark:border-white/10 shadow-2xl rounded-[28px] md:rounded-[40px] p-2 transition-all duration-500 hover:shadow-apple-soft relative">
          <div className="grid grid-cols-2 md:grid-cols-6 items-center divide-y md:divide-y-0 md:divide-x divide-apple-border/20 dark:divide-white/5">
            
            {/* 1. City Trigger */}
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'city' ? null : 'city')}
              className={cn(
                "flex flex-col items-start px-5 md:px-7 py-3 md:py-4 transition-all hover:bg-apple-gray/40 dark:hover:bg-white/5 text-left h-full rounded-tl-[24px] rounded-bl-[20px] md:rounded-l-full relative group cursor-pointer",
                activeDropdown === 'city' ? "bg-apple-gray/50 dark:bg-white/10" : ""
              )}
            >
              <div className="flex items-center gap-1.5 w-full">
                <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-apple-text-muted group-hover:text-apple-blue transition-colors">City</span>
                <ChevronDown className="w-3.5 h-3.5 text-apple-text-muted transition-transform group-hover:translate-y-0.5" />
              </div>
              <span className="text-[13px] md:text-[15px] font-medium text-apple-text mt-1 truncate max-w-full">
                {selectedCities.length === 0 ? "Pakistan (All)" : selectedCities.join(", ")}
              </span>
            </button>

            {/* 2. Make and Model Trigger */}
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'makeModel' ? null : 'makeModel')}
              className={cn(
                "flex flex-col items-start px-5 md:px-7 py-3 md:py-4 transition-all hover:bg-apple-gray/40 dark:hover:bg-white/5 text-left h-full group cursor-pointer",
                activeDropdown === 'makeModel' ? "bg-apple-gray/50 dark:bg-white/10" : ""
              )}
            >
              <div className="flex items-center gap-1.5 w-full">
                <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-apple-text-muted group-hover:text-apple-blue transition-colors">Make & Model</span>
                <ChevronDown className="w-3.5 h-3.5 text-apple-text-muted transition-transform group-hover:translate-y-0.5" />
              </div>
              <span className="text-[13px] md:text-[15px] font-medium text-apple-text mt-1 truncate max-w-full">
                {(selectedMake || selectedModel) ? `${selectedMake} ${selectedModel}`.trim() : "Search Make/Model"}
              </span>
            </button>

            {/* 3. Price Range Trigger */}
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'price' ? null : 'price')}
              className={cn(
                "flex flex-col items-start px-5 md:px-7 py-3 md:py-4 transition-all hover:bg-apple-gray/40 dark:hover:bg-white/5 text-left h-full group cursor-pointer",
                activeDropdown === 'price' ? "bg-apple-gray/50 dark:bg-white/10" : ""
              )}
            >
              <div className="flex items-center gap-1.5 w-full">
                <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-apple-text-muted group-hover:text-apple-blue transition-colors">Price Range</span>
                <ChevronDown className="w-3.5 h-3.5 text-apple-text-muted transition-transform group-hover:translate-y-0.5" />
              </div>
              <span className="text-[13px] md:text-[15px] font-medium text-apple-text mt-1 truncate max-w-full">
                {(minPrice !== null || maxPrice !== null) 
                  ? `${minPrice ? formatPrice(minPrice) : "0"} - ${maxPrice ? formatPrice(maxPrice) : "Any"}` 
                  : "Select Range"
                }
              </span>
            </button>

            {/* 4. Year Trigger */}
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'year' ? null : 'year')}
              className={cn(
                "flex flex-col items-start px-5 md:px-7 py-3 md:py-4 transition-all hover:bg-apple-gray/40 dark:hover:bg-white/5 text-left h-full group cursor-pointer",
                activeDropdown === 'year' ? "bg-apple-gray/50 dark:bg-white/10" : ""
              )}
            >
              <div className="flex items-center gap-1.5 w-full">
                <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-apple-text-muted group-hover:text-apple-blue transition-colors">Year</span>
                <ChevronDown className="w-3.5 h-3.5 text-apple-text-muted transition-transform group-hover:translate-y-0.5" />
              </div>
              <span className="text-[13px] md:text-[15px] font-medium text-apple-text mt-1 truncate max-w-full">
                {(minYear !== null || maxYear !== null)
                  ? `${minYear || "Any"} - ${maxYear || "Any"}`
                  : "Select Year"
                }
              </span>
            </button>

            {/* 5. Kilometers Trigger */}
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'km' ? null : 'km')}
              className={cn(
                "flex flex-col items-start px-5 md:px-7 py-3 md:py-4 transition-all hover:bg-apple-gray/40 dark:hover:bg-white/5 text-left h-full group cursor-pointer",
                activeDropdown === 'km' ? "bg-apple-gray/50 dark:bg-white/10" : ""
              )}
            >
              <div className="flex items-center gap-1.5 w-full">
                <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-apple-text-muted group-hover:text-apple-blue transition-colors">Kilometers</span>
                <ChevronDown className="w-3.5 h-3.5 text-apple-text-muted transition-transform group-hover:translate-y-0.5" />
              </div>
              <span className="text-[13px] md:text-[15px] font-medium text-apple-text mt-1 truncate max-w-full">
                {(minMileage !== null || maxMileage !== null)
                  ? `${minMileage !== null ? (minMileage/1000) + 'k' : "0"} - ${maxMileage !== null ? (maxMileage/1000) + 'k km' : "Any"}`
                  : "Select Mileage"
                }
              </span>
            </button>

            {/* 6. Grand Option Filters Indicator & Trigger */}
            <div className="flex items-center justify-between px-5 md:px-7 py-3 md:py-4 rounded-tr-[24px] rounded-br-[20px] md:rounded-r-full transition-all hover:bg-apple-gray/40 dark:hover:bg-white/5 relative group cursor-pointer">
              <button 
                onClick={handleSearch}
                className="flex items-center gap-2 px-5 py-3 bg-apple-blue hover:bg-apple-blue-hover text-white rounded-full font-semibold text-xs shadow-md shadow-apple-blue/20 cursor-pointer w-full justify-center transition-all duration-300 transform active:scale-95 group"
              >
                <Search className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>Search</span>
                {activeFiltersCount > 0 && (
                  <span className="flex items-center justify-center bg-white text-apple-blue text-[9px] font-black w-4.5 h-4.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {activeFiltersCount > 0 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  title="Clear all filters"
                  className="p-1 hover:bg-apple-red/15 text-apple-red rounded-full transition-colors flex items-center justify-center shrink-0 cursor-pointer ml-2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Dropdown Container below the active tab */}
        <AnimatePresence>
          {activeDropdown && (
            <>
              {/* Overlay backdrop to dismiss dropdown when tapping outside */}
              <div 
                className="fixed inset-0 z-40 bg-black/0" 
                onClick={() => setActiveDropdown(null)} 
              />
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 4, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className={cn(
                  "absolute top-full z-50 w-full md:max-w-xl bg-white dark:bg-[#1C1C1E] border border-apple-border/30 dark:border-white/10 shadow-2xl rounded-3xl overflow-hidden",
                  activeDropdown === 'city' && "left-0",
                  activeDropdown === 'makeModel' && "left-0 md:left-[10%]",
                  activeDropdown === 'price' && "left-0 md:left-[20%]",
                  activeDropdown === 'year' && "left-0 md:left-[30%]",
                  activeDropdown === 'km' && "right-0"
                )}
              >
                {renderDropdownContent()}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
