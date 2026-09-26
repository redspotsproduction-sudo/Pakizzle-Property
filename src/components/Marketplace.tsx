import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  ChevronDown, 
  ArrowUpDown, 
  LayoutGrid, 
  List, 
  Zap, 
  TrendingUp, 
  History,
  Scale,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Bell,
  ShieldCheck
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useVehicles } from "@/context/VehicleContext";
import { useLocation } from "@/context/LocationContext";
import { Vehicle, CategoryField } from "@/types";
import { PAKISTAN_LOCATIONS } from "../constants/locations";
import VehicleCard from "./VehicleCard";
import Header from "./Header";
import { cn, formatPrice } from "@/lib/utils";
import { useIntelligence } from "@/hooks/useIntelligence";
import { featureStore } from "@/services/intelligence/FeatureStore";
import { intelligenceEngine } from "@/services/intelligence/IntelligenceEngine";
import { categoryService } from "@/services/categoryService";

import { CarSelector } from "./CarSelector/CarSelector";
import ComparisonModal from "./Marketplace/ComparisonModal";
import ComparisonDrawer from "./Marketplace/ComparisonDrawer";
import SaveSearchModal from "./Marketplace/SaveSearchModal";
import { GoogleAdSenseSlot } from "./GoogleAdSenseSlot";
import SEO from "./SEO";
import { AnimatedCounter, SPRING_SNAPPY } from "./motion";

export default function Marketplace() {
  const [searchParams] = useSearchParams();
  const { vehicles } = useVehicles();
  const { location: userLocation } = useLocation();
  const { trackSearch } = useIntelligence();
  const initialQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "price-low" | "price-high" | "mileage" | "mileage-low" | "mileage-high" | "year-high" | "year-low" | "ai">("ai");
  const [compareList, setCompareList] = useState<Vehicle[]>([]);
  const [selectedCondition, setSelectedCondition] = useState<string[]>([]);
  const [selectedFuel, setSelectedFuel] = useState<string[]>([]);
  const [selectedBodyType, setSelectedBodyType] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [minYear, setMinYear] = useState<number | null>(null);
  const [maxYear, setMaxYear] = useState<number | null>(null);
  const [minMileage, setMinMileage] = useState<number | null>(null);
  const [maxMileage, setMaxMileage] = useState<number | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<'city' | 'makeModel' | 'price' | 'year' | 'km' | null>(null);
  const [citySearch, setCitySearch] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [minBeds, setMinBeds] = useState<number | null>(null);
  const [minBaths, setMinBaths] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState({
    categoryId: "",
    parentId: "",
    childId: "",
    subChildId: ""
  });
  const [filterableFields, setFilterableFields] = useState<CategoryField[]>([]);
  const [customFilters, setCustomFilters] = useState<Record<string, any>>({});
  const [isSticky, setIsSticky] = useState(false);
  const [isSaveSearchOpen, setIsSaveSearchOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Dubizzle-like organic scroll threshold
      setIsSticky(window.scrollY > 720);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedMake) count++;
    if (selectedModel) count++;
    if (selectedVariant) count++;
    count += selectedCondition.length;
    count += selectedBodyType.length;
    count += selectedFuel.length;
    if (onlyVerified) count++;
    if (maxPrice) count++;
    if (minPrice) count++;
    if (minYear) count++;
    if (maxYear) count++;
    if (minMileage) count++;
    if (maxMileage) count++;
    count += selectedCities.length;
    count += Object.keys(customFilters).filter(key => {
      const val = customFilters[key];
      return val && (!Array.isArray(val) || val.length > 0);
    }).length;
    return count;
  }, [searchQuery, selectedMake, selectedModel, selectedVariant, selectedCondition, selectedBodyType, selectedFuel, onlyVerified, maxPrice, minPrice, minYear, maxYear, minMileage, maxMileage, selectedCities, customFilters]);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        let fields = [];
        if (categoryFilter.categoryId || categoryFilter.parentId || categoryFilter.childId || categoryFilter.subChildId) {
          const targetId = categoryFilter.subChildId || categoryFilter.childId || categoryFilter.parentId || categoryFilter.categoryId;
          fields = await categoryService.getCategoryFields(targetId);
        } else {
          fields = await categoryService.getAllFields();
        }
        setFilterableFields(fields.filter(f => f.filterable && f.status === 'active'));
      } catch (error) {
        console.error("Error fetching filterable fields:", error);
      }
    };
    fetchFields();
  }, [categoryFilter]);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearchQuery(q);
    if (q) trackSearch(q);

    // Category Deep Linking
    const bodyType = searchParams.get("bodyType");
    if (bodyType) setSelectedBodyType([bodyType]);

    const fuelType = searchParams.get("fuelType");
    if (fuelType) setSelectedFuel([fuelType]);

    const verified = searchParams.get("verified");
    if (verified === "true") setOnlyVerified(true);

    const priceMax = searchParams.get("priceMax");
    if (priceMax) setMaxPrice(parseInt(priceMax));

    const priceMin = searchParams.get("priceMin");
    if (priceMin) setMinPrice(parseInt(priceMin));

    const make = searchParams.get("make");
    if (make) setSelectedMake(make);
    
    const model = searchParams.get("model");
    if (model) setSelectedModel(model);
    
    const variant = searchParams.get("variant");
    if (variant) setSelectedVariant(variant);

    const minP = searchParams.get("minPrice");
    if (minP) setMinPrice(parseInt(minP));

    const maxP = searchParams.get("maxPrice");
    if (maxP) setMaxPrice(parseInt(maxP));

    const city = searchParams.get("city");
    if (city) setSelectedCities(city.split(","));

    const minY = searchParams.get("minYear");
    if (minY) setMinYear(parseInt(minY));

    const maxY = searchParams.get("maxYear");
    if (maxY) setMaxYear(parseInt(maxY));

    const minMil = searchParams.get("minMileage");
    if (minMil) setMinMileage(parseInt(minMil));

    const maxMil = searchParams.get("maxMileage");
    if (maxMil) setMaxMileage(parseInt(maxMil));

    const location = searchParams.get("location");
    if (location && location !== "All Locations") setSelectedLocations([location]);

    const category = searchParams.get("category");
    if (category && category !== "All Categories") setSelectedBodyType([category]);

    const price = searchParams.get("price");
    if (price && price !== "Any Price") {
      if (price === "Under 10 Lac") setMaxPrice(1000000);
      else if (price === "10-25 Lac") { setMinPrice(1000000); setMaxPrice(2500000); }
      else if (price === "25-50 Lac") { setMinPrice(2500000); setMaxPrice(5000000); }
      else if (price === "50-100 Lac") { setMinPrice(5000000); setMaxPrice(10000000); }
      else if (price === "1 Crore+") setMinPrice(10000000);
    }
    const catId = searchParams.get("categoryId");
    const pId = searchParams.get("parentId");
    const cId = searchParams.get("childId");
    const sId = searchParams.get("subChildId");

    if (catId || pId || cId || sId) {
       // Filter by category
       setCategoryFilter({
         categoryId: catId || "",
         parentId: pId || "",
         childId: cId || "",
         subChildId: sId || ""
       });
    }

    if (searchParams.get("filter") === "true") {
      setIsFilterOpen(true);
    }

    const bedsParam = searchParams.get("beds");
    if (bedsParam) setMinBeds(parseInt(bedsParam));

    const bathsParam = searchParams.get("baths");
    if (bathsParam) setMinBaths(parseInt(bathsParam));
  }, [searchParams, trackSearch]);

  // Advanced Filtering & Sorting Logic
  const [isDataLoaded, setIsDataLoaded] = useState(true);

  useEffect(() => {
    if (vehicles.length > 0) {
      setIsDataLoaded(true);
    }
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    if (!isDataLoaded) return [];

    // Track selections in FeatureStore in real-time to enhance AI personalization
    if (selectedMake) {
      featureStore.trackAction({
        type: "search",
        metadata: { query: selectedMake },
        timestamp: Date.now()
      });
    }
    if (searchQuery) {
      featureStore.trackAction({
        type: "search",
        metadata: { query: searchQuery },
        timestamp: Date.now()
      });
    }

    try {
      let result = vehicles.filter((v) => {
        if (!v) return false;
        // Only show active vehicles in marketplace
        if (v.status === 'inactive') return false;

        const matchesSearch = !searchQuery ||
          (v.make && v.make.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (v.model && v.model.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesCondition = selectedCondition.length === 0 || selectedCondition.includes(v.condition || "");
        const matchesFuel = selectedFuel.length === 0 || selectedFuel.includes(v.fuelType || "");
        const matchesBodyType = selectedBodyType.length === 0 || (v.bodyType && selectedBodyType.includes(v.bodyType));
        const matchesVerified = !onlyVerified || !!v.seller?.isVerified;
        const isRentPurpose = searchParams.get("purpose") === "rent";
        const displayPrice = isRentPurpose && v.price !== undefined ? Math.floor(v.price / 400) : v.price;

        const matchesMaxPrice = !maxPrice || (displayPrice !== undefined && displayPrice <= maxPrice);
        const matchesMinPrice = !minPrice || (displayPrice !== undefined && displayPrice >= minPrice);
        
        const matchesMinYear = !minYear || (v.year !== undefined && v.year >= minYear);
        const matchesMaxYear = !maxYear || (v.year !== undefined && v.year <= maxYear);
        
        const matchesMinMileage = !minMileage || (v.mileage !== undefined && v.mileage >= minMileage);
        const matchesMaxMileage = !maxMileage || (v.mileage !== undefined && v.mileage <= maxMileage);
        
        const matchesMake = !selectedMake || selectedMake.split(",").some(mk => v.make?.toLowerCase() === mk.trim().toLowerCase());
        const matchesModel = !selectedModel || v.model === selectedModel;
        const matchesVariant = !selectedVariant || (v.id && v.id.includes(selectedVariant));

        const matchesBeds = !minBeds || (v.specs?.seating !== undefined && v.specs.seating >= minBeds);
        const matchesBaths = !minBaths || (v.specs?.horsepower !== undefined && v.specs.horsepower >= minBaths);

        const matchesLocation = (selectedCities.length === 0 || selectedCities.includes(v.city || "")) &&
                               (selectedLocations.length === 0 || selectedLocations.includes(v.area || "")) &&
                               (!userLocation || userLocation.city === "Pakistan" || v.city === userLocation.city);

        const matchesCategory = 
          (!categoryFilter.categoryId && !categoryFilter.parentId && !categoryFilter.childId && !categoryFilter.subChildId) ||
          (v.category?.parentId === categoryFilter.parentId) ||
          (v.category?.childId === categoryFilter.childId) ||
          (v.category?.subChildId === categoryFilter.subChildId) ||
          (v.category?.parentId === categoryFilter.categoryId);

        const matchesCustomFilters = Object.entries(customFilters).every(([key, value]) => {
          if (!value || (Array.isArray(value) && value.length === 0)) return true;
          const vehicleValue = v.customFields?.[key];
          
          if (Array.isArray(value)) {
            return value.includes(vehicleValue);
          }
          return vehicleValue === value;
        });

        return matchesSearch && matchesCondition && matchesFuel && matchesBodyType && matchesVerified && matchesMaxPrice && matchesMinPrice && matchesMinYear && matchesMaxYear && matchesMinMileage && matchesMaxMileage && matchesLocation && matchesCategory && matchesMake && matchesModel && matchesVariant && matchesCustomFilters && matchesBeds && matchesBaths;
      });

      // Apply Sorting with full clone to avoid mutation side effects
      return [...result].sort((a, b) => {
        switch (sortBy) {
          case "ai": {
            const state = featureStore.getMarketState();
            const scoreA = intelligenceEngine.scoreListing(a, state).score;
            const scoreB = intelligenceEngine.scoreListing(b, state).score;
            return scoreB - scoreA;
          }
          case "newest":
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          case "oldest":
            return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          case "price-low":
            return (a.price || 0) - (b.price || 0);
          case "price-high":
            return (b.price || 0) - (a.price || 0);
          case "mileage-low":
          case "mileage":
            return (a.mileage || 0) - (b.mileage || 0);
          case "mileage-high":
            return (b.mileage || 0) - (a.mileage || 0);
          case "year-high":
            return (b.year || 0) - (a.year || 0);
          case "year-low":
            return (a.year || 0) - (b.year || 0);
          default:
            return 0;
        }
      });
    } catch (e) {
      console.error("Error in filteredVehicles useMemo:", e);
      return vehicles; // Guarded fallback path
    }
  }, [searchQuery, selectedCondition, selectedFuel, selectedBodyType, onlyVerified, maxPrice, minPrice, minYear, maxYear, minMileage, maxMileage, selectedCities, userLocation, sortBy, vehicles, trackSearch, customFilters, selectedMake, selectedModel, selectedVariant, isDataLoaded, minBeds, minBaths, searchParams]);

  const toggleCompare = useCallback((vehicle: Vehicle) => {
    setCompareList(prev => {
      if (prev.find(v => v.id === vehicle.id)) {
        return prev.filter(v => v.id !== vehicle.id);
      }
      if (prev.length >= 3) return prev;
      return [...prev, vehicle];
    });
  }, []);

  const handleClearCompare = useCallback(() => setCompareList([]), []);
  const handleOpenCompareModal = useCallback(() => setIsCompareModalOpen(true), []);
  const handleCloseCompareModal = useCallback(() => setIsCompareModalOpen(false), []);

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
                onClick={() => {
                  setActiveDropdown(null);
                  setViewMode("list");
                }}
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
                  setSelectedVariant("");
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
                placeholder="Search by text..." 
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
                    <div className="text-xs text-apple-text-muted p-4 text-center">Please select a brand list to explore models.</div>
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
                onClick={() => {
                  setActiveDropdown(null);
                  setViewMode("list");
                }}
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
                onClick={() => {
                  setActiveDropdown(null);
                  setViewMode("list");
                }}
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
                onClick={() => {
                  setActiveDropdown(null);
                  setViewMode("list");
                }}
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
                onClick={() => {
                  setActiveDropdown(null);
                  setViewMode("list");
                }}
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

  const renderFilterSections = () => (
    <div className="space-y-10">
      <section>
        <h3 className="text-[11px] font-semibold text-apple-text-muted uppercase tracking-[0.2em] mb-6">Identify Vehicle</h3>
        <CarSelector 
          onSelect={(data) => {
            setSelectedMake(data.make?.name || "");
            setSelectedModel(data.model?.name || "");
            setSelectedVariant(data.variant?.name || "");
            setViewMode("list");
          }}
        />
      </section>

      <section>
        <h3 className="text-[11px] font-semibold text-apple-text-muted uppercase tracking-[0.2em] mb-6">City</h3>
        <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
          {Object.keys(PAKISTAN_LOCATIONS).map((city) => (
            <label key={city} className="flex items-center gap-4 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  className="peer w-6 h-6 rounded-lg border-apple-border text-apple-blue focus:ring-apple-blue/10 transition-all cursor-pointer appearance-none bg-apple-gray"
                  checked={selectedCities.includes(city)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedCities([...selectedCities, city]);
                    else setSelectedCities(selectedCities.filter(x => x !== city));
                    setViewMode("list");
                  }}
                />
                <CheckCircle2 className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                <div className="absolute inset-0 rounded-lg peer-checked:bg-apple-blue -z-10 transition-colors" />
              </div>
              <span className="text-sm font-medium text-apple-text/80 group-hover:text-apple-blue transition-colors">{city}</span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-[11px] font-semibold text-apple-text-muted uppercase tracking-[0.2em] mb-6">Condition</h3>
        <div className="space-y-4">
          {["new", "used", "certified"].map((c) => (
            <label key={`condition-${c}`} className="flex items-center gap-4 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  className="peer w-6 h-6 rounded-lg border-apple-border text-apple-blue focus:ring-apple-blue/10 transition-all cursor-pointer appearance-none bg-apple-gray"
                  checked={selectedCondition.includes(c)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedCondition([...selectedCondition, c]);
                    else setSelectedCondition(selectedCondition.filter(x => x !== c));
                    setViewMode("list");
                  }}
                />
                <CheckCircle2 className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                <div className="absolute inset-0 rounded-lg peer-checked:bg-apple-blue -z-10 transition-colors" />
              </div>
              <span className="text-sm font-medium capitalize text-apple-text/80 group-hover:text-apple-blue transition-colors">{c}</span>
            </label>
          ))}
        </div>
      </section>

      {filterableFields.map((field) => (
        <section key={field.id}>
          <h3 className="text-[11px] font-semibold text-apple-text-muted uppercase tracking-[0.2em] mb-6">{field.name}</h3>
          <div className="space-y-4">
            {field.type === 'dropdown' || field.type === 'multi-select' || field.type === 'radio' ? (
              field.options?.map((option) => (
                <label key={`field-opt-${field.id || field.key}-${option.value}`} className="flex items-center gap-4 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="peer w-6 h-6 rounded-lg border-apple-border text-apple-blue focus:ring-apple-blue/10 transition-all cursor-pointer appearance-none bg-apple-gray"
                      checked={(customFilters[field.key] || []).includes(option.value)}
                      onChange={(e) => {
                        const current = customFilters[field.key] || [];
                        let updated;
                        if (e.target.checked) updated = [...current, option.value];
                        else updated = current.filter((v: any) => v !== option.value);
                        
                        setCustomFilters({
                          ...customFilters,
                          [field.key]: updated
                        });
                        setViewMode("list");
                      }}
                    />
                    <CheckCircle2 className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                    <div className="absolute inset-0 rounded-lg peer-checked:bg-apple-blue -z-10 transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-apple-text/80 group-hover:text-apple-blue transition-colors">{option.label}</span>
                </label>
              ))
            ) : field.type === 'toggle' ? (
              <label className="flex items-center gap-4 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    className="peer w-6 h-6 rounded-lg border-apple-border text-apple-blue focus:ring-apple-blue/10 transition-all cursor-pointer appearance-none bg-apple-gray"
                    checked={!!customFilters[field.key]}
                    onChange={(e) => {
                      setCustomFilters({
                        ...customFilters,
                        [field.key]: e.target.checked
                      });
                      setViewMode("list");
                    }}
                  />
                  <CheckCircle2 className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                  <div className="absolute inset-0 rounded-lg peer-checked:bg-apple-blue -z-10 transition-colors" />
                </div>
                <span className="text-sm font-medium text-apple-text/80 group-hover:text-apple-blue transition-colors">{field.name}</span>
              </label>
            ) : null}
          </div>
        </section>
      ))}

      <section className="border-t border-apple-border/20 pt-6">
        <h3 className="text-[11px] font-semibold text-apple-text-muted uppercase tracking-[0.2em] mb-6">Vehicle Style</h3>
        <div className="space-y-4 max-h-52 overflow-y-auto pr-1">
          {["SUV", "Sedan", "Truck", "Hatchback", "Coupe", "Convertible", "Minivan", "Wagon", "Crossover", "Van"].map((styleOpt) => (
            <label key={`bodytype-side-${styleOpt}`} className="flex items-center gap-4 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  className="peer w-6 h-6 rounded-lg border-apple-border text-apple-blue focus:ring-apple-blue/10 transition-all cursor-pointer appearance-none bg-apple-gray"
                  checked={selectedBodyType.includes(styleOpt)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedBodyType([...selectedBodyType, styleOpt]);
                    else setSelectedBodyType(selectedBodyType.filter(x => x !== styleOpt));
                    setViewMode("list");
                  }}
                />
                <CheckCircle2 className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                <div className="absolute inset-0 rounded-lg peer-checked:bg-apple-blue -z-10 transition-colors" />
              </div>
              <span className="text-sm font-medium text-apple-text/80 group-hover:text-apple-blue transition-colors">{styleOpt}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="border-t border-apple-border/20 pt-6">
        <h3 className="text-[11px] font-semibold text-apple-text-muted uppercase tracking-[0.2em] mb-6">Fuel Type</h3>
        <div className="space-y-4">
          {["petrol", "diesel", "hybrid", "electric"].map((f) => (
            <label key={`fuel-side-${f}`} className="flex items-center gap-4 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  className="peer w-6 h-6 rounded-lg border-apple-border text-apple-blue focus:ring-apple-blue/10 transition-all cursor-pointer appearance-none bg-apple-gray"
                  checked={selectedFuel.includes(f)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedFuel([...selectedFuel, f]);
                    else setSelectedFuel(selectedFuel.filter(x => x !== f));
                    setViewMode("list");
                  }}
                />
                <CheckCircle2 className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                <div className="absolute inset-0 rounded-lg peer-checked:bg-apple-blue -z-10 transition-colors" />
              </div>
              <span className="text-sm font-medium capitalize text-apple-text/80 group-hover:text-apple-blue transition-colors">{f}</span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-[11px] font-semibold text-apple-text-muted uppercase tracking-[0.2em] mb-6">Sellers</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-4 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input 
                type="checkbox" 
                className="peer w-6 h-6 rounded-lg border-apple-border text-apple-blue focus:ring-apple-blue/10 transition-all cursor-pointer appearance-none bg-apple-gray"
                checked={onlyVerified}
                onChange={(e) => {
                  setOnlyVerified(e.target.checked);
                  setViewMode("list");
                }}
              />
              <CheckCircle2 className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
              <div className="absolute inset-0 rounded-lg peer-checked:bg-apple-blue -z-10 transition-colors" />
            </div>
            <span className="text-sm font-medium text-apple-text/80 group-hover:text-apple-blue transition-colors">Verified Sellers Only</span>
          </label>
        </div>
      </section>

      <section>
        <h3 className="text-[11px] font-semibold text-apple-text-muted uppercase tracking-[0.2em] mb-4">Price Range (PKR)</h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <label className="text-[9px] font-bold text-apple-text-muted uppercase tracking-wider block mb-1">Min Price</label>
            <input 
              type="number" 
              placeholder="Min"
              className="w-full px-3 py-2 text-xs bg-apple-gray dark:bg-white/5 rounded-xl border border-apple-border/20 focus:border-apple-blue outline-none font-medium"
              value={minPrice || ""}
              onChange={(e) => {
                const val = e.target.value ? parseInt(e.target.value) : null;
                setMinPrice(val);
              }}
            />
          </div>
          <div>
            <label className="text-[9px] font-bold text-apple-text-muted uppercase tracking-wider block mb-1">Max Price</label>
            <input 
              type="number" 
              placeholder="Max"
              className="w-full px-3 py-2 text-xs bg-apple-gray dark:bg-white/5 rounded-xl border border-apple-border/20 focus:border-apple-blue outline-none font-medium"
              value={maxPrice || ""}
              onChange={(e) => {
                const val = e.target.value ? parseInt(e.target.value) : null;
                setMaxPrice(val);
              }}
            />
          </div>
        </div>
        
        {/* Price Presets */}
        <div className="grid grid-cols-2 gap-1.5 mt-2">
          {[
            { label: "< 25 Lac", min: null, max: 2500000 },
            { label: "25 - 50 Lac", min: 2500000, max: 5000000 },
            { label: "50 Lac - 1 Cr", min: 5000000, max: 10000000 },
            { label: "1 Crore +", min: 10000000, max: null }
          ].map((preset, i) => (
            <button
              key={`preset-${i}`}
              onClick={() => {
                setMinPrice(preset.min);
                setMaxPrice(preset.max);
                setViewMode("list");
              }}
              className={cn(
                "px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer whitespace-nowrap text-center",
                ((preset.min === null ? !minPrice : minPrice === preset.min) && (preset.max === null ? !maxPrice : maxPrice === preset.max))
                  ? "bg-apple-blue border-apple-blue text-white font-bold"
                  : "bg-apple-gray dark:bg-white/5 border-apple-border/20 text-apple-text hover:bg-apple-border/15"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-apple-bg">
      <SEO 
        title={selectedMake ? `Buy & Sell ${selectedMake} ${selectedModel || ""} Cars` : "Verified Luxury Sports & Super Cars Marketplace"}
        description={selectedMake 
          ? `Discover premium and certified pre-owned ${selectedMake} ${selectedModel || ""} cars on Pakizzle. Compare prices, inspect vehicle scores, and purchase safely with active ledger credentials.` 
          : "Discover the elite collection of luxury sports cars, imports, and premium supercars on Pakizzle. Filter by city, price range, body type, fuel engine, and check certified history instantly."}
        keywords={[
          selectedMake ? selectedMake.toLowerCase() : "luxury cars",
          selectedModel ? `${selectedMake?.toLowerCase()} ${selectedModel.toLowerCase()}` : "supercars",
          "pakizzle marketplace", "cars for sale Pakistan", "verified car listings", "dubizzle import cars"
        ]}
        canonicalPath="/marketplace"
        ogType="website"
        schema={{
          "@type": "SearchResultsPage",
          "name": selectedMake ? `Verified ${selectedMake} Listings on Pakizzle` : "Elite Cars Marketplace - Pakizzle",
          "description": "Live directory of luxury, hyper, and supercar models with verified scores.",
          "url": window.location.href
        }}
      />
      <Header />
      <ComparisonModal 
        isOpen={isCompareModalOpen} 
        onClose={handleCloseCompareModal} 
        compareList={compareList} 
      />
      
      <main className="pt-24 pb-20">
        <div className="max-w-7xl lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4">

          {/* Comprehensive Dubizzle.com Premium Sticky Filter Bar */}
          <div className={cn(
            "transition-all duration-300 ease-in-out z-40 mb-8 md:mb-12",
            isSticky 
              ? "sticky top-[68px] lg:top-[84px] py-4 liquid-glass-foreground shadow-2xl -mx-4 px-4 sm:-mx-8 sm:px-8 md:-mx-12 md:px-12 w-[calc(100%+2rem)] sm:w-[calc(100%+4rem)] md:w-[calc(100%+6rem)] rounded-none"
              : "relative"
          )}>
            <div className="max-w-7xl lg:max-w-[1440px] mx-auto relative">
              <div className="flex flex-col gap-4">
                {/* The Main Multi-Selector Glass Capsule */}
                <div className="w-full liquid-glass-mid rounded-[32px] md:rounded-full p-2 transition-all duration-500 hover:shadow-2xl relative shadow-lg">
                  <div className="grid grid-cols-2 md:grid-cols-6 items-center divide-y md:divide-y-0 md:divide-x divide-white/20 dark:divide-white/10">
                    
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
                        onClick={() => {
                          setIsFilterOpen(!isFilterOpen);
                          setActiveDropdown(null);
                        }}
                        className="flex flex-col items-start text-left w-full h-full cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5 w-full">
                          <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-apple-text-muted group-hover:text-apple-blue transition-colors">Filters</span>
                          <ChevronDown className="w-3.5 h-3.5 text-apple-text-muted transition-transform group-hover:translate-y-0.5" />
                        </div>
                        <span className="text-[13px] font-medium text-apple-text-muted mt-1 truncate">
                          {activeFiltersCount > 0 ? `${activeFiltersCount} active` : "Specs, Keywords"}
                        </span>
                      </button>

                      <div className="flex items-center gap-2">
                        {activeFiltersCount > 0 && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCities([]);
                              setSelectedMake("");
                              setSelectedModel("");
                              setSelectedVariant("");
                              setMinPrice(null);
                              setMaxPrice(null);
                              setMinYear(null);
                              setMaxYear(null);
                              setMinMileage(null);
                              setMaxMileage(null);
                              setSearchQuery("");
                              setSelectedCondition([]);
                              setSelectedBodyType([]);
                              setSelectedFuel([]);
                              setOnlyVerified(false);
                              setCustomFilters({});
                            }}
                            title="Clear all filters"
                            className="p-1 hover:bg-apple-red/15 text-apple-red rounded-full transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}

                      </div>
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

              {/* Dynamic scroll-aware Brand Navigation Slider */}
              <div className={cn(
                "overflow-x-auto pb-1 pb-1.5 pt-2 flex items-center gap-3 scrollbar-none",
                isSticky ? "border-t border-apple-border/10 mt-3" : "mt-4"
              )} style={{ WebkitOverflowScrolling: 'touch' }}>
                <span className="text-[10px] uppercase font-black tracking-widest text-apple-text-muted shrink-0 mr-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-apple-blue" /> Quick Brands
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {[
                    { name: "Toyota", label: "Toyota" },
                    { name: "Honda", label: "Honda" },
                    { name: "Suzuki", label: "Suzuki" },
                    { name: "Audi", label: "Audi" },
                    { name: "BMW", label: "BMW" },
                    { name: "Mercedes-Benz", label: "Mercedes" },
                    { name: "Hyundai", label: "Hyundai" },
                    { name: "Kia", label: "Kia" },
                    { name: "MG", label: "MG" },
                    { name: "Changan", label: "Changan" },
                    { name: "Tesla", label: "Tesla" }
                  ].map((brand, i) => (
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      key={`quick-brand-${i}`}
                      onClick={() => {
                        setSelectedMake(selectedMake === brand.name ? "" : brand.name);
                        setViewMode("list");
                      }}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium transition-all duration-300 shadow-sm cursor-pointer",
                        selectedMake === brand.name
                          ? "bg-apple-blue border-apple-blue text-white ring-2 ring-apple-blue/25"
                          : "bg-apple-card-bg/70 dark:bg-black/30 border-apple-border/30 text-apple-text hover:bg-apple-gray dark:hover:bg-white/5"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center font-medium text-[9px] uppercase tracking-wider shrink-0",
                        selectedMake === brand.name
                          ? "bg-white/20 text-white"
                          : "bg-apple-blue/10 text-apple-blue dark:bg-white/10 dark:text-apple-blue"
                      )}>
                        {brand.name[0]}
                      </div>
                      <span className="truncate">{brand.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            {/* 1. PERSISTENT FILTER SIDEBAR FOR DESKTOP (1280px+) */}
            <aside className="hidden xl:block w-[280px] shrink-0 sticky top-28 self-start max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pr-1">
              <div className="glass-card p-5 bg-apple-card-bg backdrop-blur-md rounded-2xl border border-apple-border/30">
                <div className="flex items-center justify-between pb-3.5 border-b border-apple-border/20 mb-4">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-apple-blue" />
                    <h3 className="font-bold text-sm text-apple-text">Refine Properties</h3>
                  </div>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={() => {
                        setSelectedCities([]);
                        setSelectedMake("");
                        setSelectedModel("");
                        setSelectedVariant("");
                        setSelectedCondition([]);
                        setSelectedBodyType([]);
                        setSelectedFuel([]);
                        setMinPrice(null);
                        setMaxPrice(null);
                        setSearchQuery("");
                        setOnlyVerified(false);
                        setCustomFilters({});
                      }}
                      className="text-[11px] font-bold text-apple-red hover:underline cursor-pointer"
                    >
                      Reset ({activeFiltersCount})
                    </button>
                  )}
                </div>
                {renderFilterSections()}
              </div>
            </aside>

            {/* 2. TABLET & MOBILE DRAWER / SHEET (<1280px) */}
            <AnimatePresence>
              {isFilterOpen && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsFilterOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-md z-[80] xl:hidden"
                  />
                  
                  {/* Mobile Apple Bottom Sheet & Tablet Modal with Swipe-down Dismiss */}
                  <motion.div
                    drag="y"
                    dragConstraints={{ top: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_e, info) => {
                      if (info.offset.y > 100 || info.velocity.y > 350) {
                        setIsFilterOpen(false);
                      }
                    }}
                    initial={{ opacity: 0, y: "100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "100%" }}
                    transition={{ type: "spring", damping: 28, stiffness: 300 }}
                    className="fixed inset-x-0 bottom-0 max-h-[88vh] bg-white dark:bg-[#1C1C1E] rounded-t-[32px] md:max-w-xl md:mx-auto md:bottom-6 md:rounded-[32px] shadow-[0_-25px_60px_rgba(0,0,0,0.35)] z-[90] flex flex-col overflow-hidden border border-black/10 dark:border-white/10 xl:hidden"
                    style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
                  >
                    {/* Grab handle indicator */}
                    <div className="pt-3 pb-1 cursor-grab active:cursor-grabbing flex justify-center shrink-0">
                      <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-apple-border/20 dark:border-white/10 shrink-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-apple-text dark:text-white">Filters</h2>
                        {activeFiltersCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-apple-blue/10 text-apple-blue text-xs font-bold">
                            {activeFiltersCount} active
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => setIsFilterOpen(false)} 
                        className="p-2 hover:bg-apple-gray dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer touch-target min-w-[36px] min-h-[36px]"
                        title="Close filters"
                      >
                        <X className="w-5 h-5 text-apple-text dark:text-white" />
                      </button>
                    </div>

                    {/* Scrollable Filters Content */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                      {renderFilterSections()}
                    </div>

                    {/* Sticky Bottom Actions Bar */}
                    <div className="p-4 bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl border-t border-apple-border/20 dark:border-white/10 flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedCities([]);
                          setSelectedMake("");
                          setSelectedModel("");
                          setSelectedVariant("");
                          setSelectedCondition([]);
                          setSelectedBodyType([]);
                          setSelectedFuel([]);
                          setMinPrice(null);
                          setMaxPrice(null);
                        }}
                        className="px-4 py-3 rounded-2xl text-xs font-bold text-apple-text-muted hover:text-apple-red hover:bg-apple-red/10 transition-colors cursor-pointer min-h-[44px]"
                      >
                        Reset All
                      </button>
                      <button
                        onClick={() => setIsFilterOpen(false)}
                        className="flex-1 apple-button-primary !h-12 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-apple-blue/20 cursor-pointer active:scale-98 transition-transform min-h-[48px]"
                      >
                        Apply Filters ({filteredVehicles.length})
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Main Grid */}
            <div className="flex-1">
              {/* Market Insight Nudge Banner */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 bg-apple-blue/5 border border-apple-blue/10 rounded-[24px] flex items-center justify-between gap-4 group cursor-pointer hover:bg-apple-blue/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-apple-card-bg flex items-center justify-center shadow-sm text-apple-blue">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-blue mb-0.5">Market Insight</p>
                    <p className="text-sm font-bold text-apple-text tracking-tight">Demand for Hybrid SUVs in {userLocation?.city || "Pakistan"} is up 24% this week.</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-apple-blue group-hover:translate-x-1 transition-transform" />
              </motion.div>

              {/* Active Filter Chips */}
              {(selectedBodyType.length > 0 || selectedFuel.length > 0 || onlyVerified || maxPrice || searchQuery) && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {searchQuery && (
                    <div className="px-4 py-2 rounded-full bg-apple-gray border border-apple-border/50 flex items-center gap-2 text-[11px] font-bold text-apple-text">
                      <span>Search: {searchQuery}</span>
                      <button onClick={() => setSearchQuery("")} className="p-0.5 hover:bg-apple-border rounded-full"><X className="w-3 h-3" /></button>
                    </div>
                  )}
                  {selectedMake && (
                    <div className="px-4 py-2 rounded-full bg-apple-blue/10 border border-apple-blue/20 flex items-center gap-2 text-[11px] font-bold text-apple-blue">
                      <span>{selectedMake}</span>
                      <button onClick={() => { setSelectedMake(""); setSelectedModel(""); setSelectedVariant(""); }} className="p-0.5 hover:bg-apple-blue/20 rounded-full"><X className="w-3 h-3" /></button>
                    </div>
                  )}
                  {selectedModel && (
                    <div className="px-4 py-2 rounded-full bg-apple-blue/10 border border-apple-blue/20 flex items-center gap-2 text-[11px] font-bold text-apple-blue">
                      <span>{selectedModel}</span>
                      <button onClick={() => { setSelectedModel(""); setSelectedVariant(""); }} className="p-0.5 hover:bg-apple-blue/20 rounded-full"><X className="w-3 h-3" /></button>
                    </div>
                  )}
                  {selectedVariant && (
                    <div className="px-4 py-2 rounded-full bg-apple-blue/10 border border-apple-blue/20 flex items-center gap-2 text-[11px] font-bold text-apple-blue">
                      <span>{selectedVariant}</span>
                      <button onClick={() => setSelectedVariant("")} className="p-0.5 hover:bg-apple-blue/20 rounded-full"><X className="w-3 h-3" /></button>
                    </div>
                  )}
                   {selectedCondition.map(condition => (
                    <div key={`chip-cond-${condition}`} className="px-4 py-2 rounded-full bg-apple-orange/10 border border-apple-orange/20 flex items-center gap-2 text-[11px] font-bold text-apple-orange">
                      <span className="capitalize">{condition}</span>
                      <button onClick={() => setSelectedCondition(prev => prev.filter(c => c !== condition))} className="p-0.5 hover:bg-apple-orange/20 rounded-full"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                  {selectedBodyType.map(type => (
                    <div key={`chip-body-${type}`} className="px-4 py-2 rounded-full bg-apple-blue/10 border border-apple-blue/20 flex items-center gap-2 text-[11px] font-bold text-apple-blue">
                      <span>{type}</span>
                      <button onClick={() => setSelectedBodyType(prev => prev.filter(t => t !== type))} className="p-0.5 hover:bg-apple-blue/20 rounded-full"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                  {selectedFuel.map(fuel => (
                    <div key={`chip-fuel-${fuel}`} className="px-4 py-2 rounded-full bg-apple-green/10 border border-apple-green/20 flex items-center gap-2 text-[11px] font-bold text-apple-green">
                      <span>{fuel}</span>
                      <button onClick={() => setSelectedFuel(prev => prev.filter(f => f !== fuel))} className="p-0.5 hover:bg-apple-green/20 rounded-full"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                  {onlyVerified && (
                    <div className="px-4 py-2 rounded-full bg-apple-blue/10 border border-apple-blue/20 flex items-center gap-2 text-[11px] font-bold text-apple-blue">
                      <span>Verified Only</span>
                      <button onClick={() => setOnlyVerified(false)} className="p-0.5 hover:bg-apple-blue/20 rounded-full"><X className="w-3 h-3" /></button>
                    </div>
                  )}
                  {maxPrice && (
                    <div className="px-4 py-2 rounded-full bg-apple-orange/10 border border-apple-orange/20 flex items-center gap-2 text-[11px] font-bold text-apple-orange">
                      <span>Under {formatPrice(maxPrice)}</span>
                      <button onClick={() => setMaxPrice(null)} className="p-0.5 hover:bg-apple-orange/20 rounded-full"><X className="w-3 h-3" /></button>
                    </div>
                  )}
                  {minPrice && (
                    <div className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center gap-2 text-[11px] font-bold text-purple-500">
                      <span>Above {formatPrice(minPrice)}</span>
                      <button onClick={() => setMinPrice(null)} className="p-0.5 hover:bg-purple-500/20 rounded-full"><X className="w-3 h-3" /></button>
                    </div>
                  )}
                  {Object.entries(customFilters).map(([key, value]) => {
                    if (!value || (Array.isArray(value) && value.length === 0)) return null;
                    const field = filterableFields.find(f => f.key === key);
                    if (!field) return null;

                    if (Array.isArray(value)) {
                      return value.map(val => {
                        const option = field.options?.find(o => o.value === val);
                        return (
                          <div key={`chip-custom-${key}-${val}`} className="px-4 py-2 rounded-full bg-apple-gray border border-apple-border flex items-center gap-2 text-[11px] font-bold text-apple-text">
                            <span>{field.name}: {option?.label || val}</span>
                            <button 
                              onClick={() => {
                                const updated = value.filter(v => v !== val);
                                setCustomFilters({ ...customFilters, [key]: updated });
                              }} 
                              className="p-0.5 hover:bg-apple-border rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      });
                    }

                    return (
                      <div key={`chip-custom-${key}`} className="px-4 py-2 rounded-full bg-apple-gray border border-apple-border flex items-center gap-2 text-[11px] font-bold text-apple-text">
                        <span>{field.name}: {value === true ? 'Yes' : value}</span>
                        <button 
                          onClick={() => {
                            const updated = { ...customFilters };
                            delete updated[key];
                            setCustomFilters(updated);
                          }} 
                          className="p-0.5 hover:bg-apple-border rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                  <button 
                    onClick={() => {
                      setSelectedBodyType([]);
                      setSelectedFuel([]);
                      setOnlyVerified(false);
                      setMaxPrice(null);
                      setMinPrice(null);
                      setSearchQuery("");
                      setSelectedMake("");
                      setSelectedModel("");
                      setSelectedVariant("");
                      setCustomFilters({});
                    }}
                    className="px-4 py-2 text-[11px] font-bold text-apple-text-muted hover:text-apple-text transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-10">
                <div className="flex items-center gap-3">
                  <div className="text-[12px] md:text-[13px] font-medium text-apple-text-muted">
                    Showing <span className="text-apple-text font-bold"><AnimatedCounter value={filteredVehicles.length} duration={0.6} once={false} /></span> Results
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.94 }}
                    transition={SPRING_SNAPPY}
                    onClick={() => setIsSaveSearchOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-apple-blue/10 hover:bg-apple-blue/15 text-[11px] font-black text-apple-blue transition-colors cursor-pointer shadow-xs"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Save Search</span>
                  </motion.button>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Tablet & Mobile Expandable Filter Pill (Hidden on Desktop 1280px+ where sidebar is persistent) */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    transition={SPRING_SNAPPY}
                    onClick={() => setIsFilterOpen(true)}
                    className={cn(
                      "flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full border text-xs font-bold transition-all shadow-sm cursor-pointer h-[38px] xl:hidden touch-target",
                      activeFiltersCount > 0
                        ? "bg-apple-blue text-white border-apple-blue shadow-apple-blue/20"
                        : "bg-white dark:bg-[#161618]/95 border-apple-border/40 text-apple-text hover:bg-apple-gray/50"
                    )}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Filters</span>
                    {activeFiltersCount > 0 && (
                      <span className="min-w-[18px] h-4.5 px-1.5 rounded-full bg-white text-apple-blue text-[10px] font-black flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </motion.button>

                  <div className="relative" ref={sortRef}>
                    <button
                      onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                      className={cn(
                        "flex items-center justify-between gap-3 px-5 py-2.5 bg-white dark:bg-[#161618]/95 border border-apple-border/40 dark:border-white/10 shadow-md hover:shadow-apple-soft transition-all duration-300 relative group cursor-pointer text-left focus:outline-none rounded-full text-xs font-semibold h-[38px]",
                        isSortDropdownOpen ? "ring-2 ring-apple-blue/20 bg-apple-gray/50 dark:bg-white/10" : ""
                      )}
                    >
                      <span className="text-apple-text truncate selection-none">
                        Sort: <span className="font-extrabold text-apple-blue">{([
                          { id: "ai", label: "Default" },
                          { id: "newest", label: "Newest" },
                          { id: "oldest", label: "Oldest" },
                          { id: "price-low", label: "Price: Low" },
                          { id: "price-high", label: "Price: High" },
                          { id: "mileage-low", label: "Mileage: Low" },
                          { id: "mileage-high", label: "Mileage: High" },
                          { id: "year-high", label: "Year: High" },
                          { id: "year-low", label: "Year: Low" }
                        ].find(option => option.id === sortBy)?.label) || "Default"}</span>
                      </span>
                      <ChevronDown className={cn("w-3.5 h-3.5 text-apple-text-muted transition-transform duration-300 shrink-0", isSortDropdownOpen ? "rotate-180 text-apple-blue" : "group-hover:translate-y-0.5")} />
                    </button>
                    <AnimatePresence>
                      {isSortDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute right-0 mt-2 min-w-[200px] w-full bg-white/95 dark:bg-[#161618]/95 backdrop-blur-xl border border-apple-border/20 shadow-2xl rounded-2xl p-1.5 z-40 overflow-hidden max-h-[300px] overflow-y-auto"
                        >
                          {[
                            { id: "ai", label: "Default" },
                            { id: "newest", label: "Newest" },
                            { id: "oldest", label: "Oldest" },
                            { id: "price-low", label: "Price: Low" },
                            { id: "price-high", label: "Price: High" },
                            { id: "mileage-low", label: "Mileage: Low" },
                            { id: "mileage-high", label: "Mileage: High" },
                            { id: "year-high", label: "Year: High" },
                            { id: "year-low", label: "Year: Low" }
                          ].map((option) => (
                            <button
                              key={option.id}
                              onClick={() => {
                                setSortBy(option.id as any);
                                setIsSortDropdownOpen(false);
                              }}
                              className={cn(
                                "w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-between",
                                sortBy === option.id 
                                  ? "bg-apple-blue text-white shadow-md shadow-apple-blue/15" 
                                  : "text-apple-text-muted hover:text-apple-text hover:bg-apple-gray/40 dark:hover:bg-white/5"
                              )}
                            >
                              <span>{option.label}</span>
                              {sortBy === option.id && (
                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Grid/List View Selector pill perfectly styled right after sort */}
                  <div className="flex bg-apple-gray/40 dark:bg-white/5 border border-apple-border/10 dark:border-white/10 rounded-full p-0.5 shadow-inner shrink-0 items-center h-[38px]">
                    <button 
                      onClick={() => setViewMode("grid")}
                      className={cn(
                        "rounded-full transition-all duration-300 flex items-center justify-center w-7.5 h-7.5 cursor-pointer",
                        viewMode === "grid" 
                          ? "bg-white dark:bg-white/15 text-apple-blue font-bold shadow-sm" 
                          : "text-apple-text-muted hover:text-apple-text"
                      )}
                      id="viewmode-grid-btn"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setViewMode("list")}
                      className={cn(
                        "rounded-full transition-all duration-300 flex items-center justify-center w-7.5 h-7.5 cursor-pointer",
                        viewMode === "list" 
                          ? "bg-white dark:bg-white/15 text-apple-blue font-bold shadow-sm" 
                          : "text-apple-text-muted hover:text-apple-text"
                      )}
                      id="viewmode-list-btn"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Premium Google AdSense Leaderboard Slot */}
              {isDataLoaded && filteredVehicles.length > 0 && (
                <GoogleAdSenseSlot slotType="leaderboard" />
              )}

              <div className={cn(
                "grid gap-3 sm:gap-4 lg:gap-5",
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" 
                  : "grid-cols-1"
              )}>
                {!isDataLoaded ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <VehicleCard key={`skeleton-${i}`} vehicle={{} as any} viewMode={viewMode} isLoading={true} />
                  ))
                ) : filteredVehicles.length > 0 ? (
                  filteredVehicles.flatMap((vehicle, index) => {
                    const elements = [];
                    
                    // Inject a Sponsored Full Width Leaderboard Banner Ad every 8th listing card (only in list view to maintain clean grid representation)
                    if (viewMode === "list" && index > 0 && index % 8 === 0) {
                      elements.push(
                        <div 
                          key={`ad-leaderboard-${index}`} 
                          className="col-span-full py-4"
                        >
                          <GoogleAdSenseSlot slotType="leaderboard" index={index + 1} />
                        </div>
                      );
                    }
                    // Or inject a Sponsored In-feed Native Ad Card every 4th listing card
                    else if (index > 0 && index % 4 === 0) {
                      elements.push(
                        <div 
                          key={`ad-feed-${index}`} 
                          className={cn(
                            viewMode === "grid" ? "col-span-1" : "col-span-full"
                          )}
                        >
                          <GoogleAdSenseSlot slotType="native-feed" index={index} viewMode={viewMode} />
                        </div>
                      );
                    }
                    
                    // Core Product Card
                    elements.push(
                      <motion.div 
                        key={vehicle.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (index % 4) * 0.05 }}
                        className="h-full"
                      >
                        <VehicleCard 
                          vehicle={vehicle} 
                          viewMode={viewMode} 
                          onCompare={toggleCompare}
                          isCompared={!!compareList.find(v => v.id === vehicle.id)}
                        />
                      </motion.div>
                    );
                    
                    return elements;
                  })
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-32 text-center">
                    <div className="w-20 h-20 bg-apple-gray rounded-full flex items-center justify-center mb-6">
                      <Search className="w-8 h-8 text-apple-text-muted" />
                    </div>
                    <h3 className="text-xl font-bold text-apple-text mb-2">No vehicles found</h3>
                    <p className="text-apple-text-muted max-w-xs mx-auto">
                      Try adjusting your filters or search terms to find what you're looking for.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Right Skyscraper Google Display Ad (just like dubizzle.com) */}
            {isDataLoaded && filteredVehicles.length > 0 && (
              <div className="hidden xl:block shrink-0 w-[304px]">
                <div className="sticky top-28 space-y-4">
                  <GoogleAdSenseSlot slotType="sidebar-tall" />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Comparison Drawer */}
      <ComparisonDrawer 
        compareList={compareList} 
        onToggleCompare={toggleCompare} 
        onClear={handleClearCompare} 
        onOpenModal={handleOpenCompareModal} 
      />

      {/* Centered Sticky Floating Filter Pill for Mobile (<768px) */}
      <div 
        className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-40 pointer-events-auto"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          transition={SPRING_SNAPPY}
          onClick={() => setIsFilterOpen(true)}
          className="h-11 px-5 rounded-full bg-apple-blue text-white shadow-[0_8px_25px_rgba(15,118,110,0.45)] border border-teal-300/40 flex items-center gap-2 font-bold text-xs cursor-pointer backdrop-blur-md min-h-[44px] touch-target"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="min-w-[18px] h-4.5 px-1.5 rounded-full bg-white text-apple-blue text-[10px] font-black flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </motion.button>
      </div>

      <SaveSearchModal 
        isOpen={isSaveSearchOpen} 
        onClose={() => setIsSaveSearchOpen(false)} 
        filters={{
          searchQuery,
          make: selectedMake,
          model: selectedModel,
          variant: selectedVariant,
          bodyType: selectedBodyType,
          fuelType: selectedFuel,
          condition: selectedCondition,
          cities: selectedCities,
          minPrice,
          maxPrice,
          minYear,
          maxYear,
          minMileage,
          maxMileage
        }}
      />
    </div>
  );
}
