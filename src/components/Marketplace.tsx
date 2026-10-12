import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
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
  Check,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Bell,
  ShieldCheck,
  Hash,
  AlertCircle
} from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useProperties } from "@/context/PropertyContext";
import { useLocation } from "@/context/LocationContext";
import { Property, CategoryField } from "@/types";
import { PAKISTAN_LOCATIONS } from "../constants/locations";
import PropertyCard from "./PropertyCard";
import Header from "./Header";
import { cn, formatPrice } from "@/lib/utils";
import { extractReferenceId, formatPropertyUrl } from "@/lib/referenceId";
import { useIntelligence } from "@/hooks/useIntelligence";
import { featureStore } from "@/services/intelligence/FeatureStore";
import { intelligenceEngine } from "@/services/intelligence/IntelligenceEngine";
import { categoryService } from "@/services/categoryService";
import { listingFreshnessService } from "@/services/listingFreshnessService";

import PropertySelector from "./PropertySelector/PropertySelector";
import ComparisonModal from "./Marketplace/ComparisonModal";
import ComparisonDrawer from "./Marketplace/ComparisonDrawer";
import SaveSearchModal from "./Marketplace/SaveSearchModal";
import TopFilterBar, { TopFilterBarState, AREA_UNITS } from "./Marketplace/TopFilterBar";
import QuickAccessRow from "./Marketplace/QuickAccessRow";
import SidebarFilters, { ListingFreshness } from "./Marketplace/SidebarFilters";
import MarketInsightBanner from "./Marketplace/MarketInsightBanner";
import FilterPopover from "./ui/FilterPopover";
import { GoogleAdSenseSlot } from "./GoogleAdSenseSlot";
import SEO from "./SEO";
import { AnimatedCounter, SPRING_SNAPPY } from "./motion";

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Redirect legacy ?make=Plot or ?make=Commercial to ?propertyType=...
  useEffect(() => {
    const legacyMake = searchParams.get("make");
    if (legacyMake) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("make");
      if (!newParams.has("propertyType")) {
        newParams.set("propertyType", legacyMake);
      }
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const { properties } = useProperties();
  const { location: userLocation } = useLocation();
  const { trackSearch } = useIntelligence();
  const initialQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [idSearchInput, setIdSearchInput] = useState("");
  const [idSearchError, setIdSearchError] = useState("");

  const handleIdSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!idSearchInput.trim()) return;

    const extracted = extractReferenceId(idSearchInput);
    if (!extracted) {
      setIdSearchError("Please enter a valid 6-8 digit Property ID or paste a property link");
      return;
    }

    const matched = properties.find(
      (v) => (v.reference_id && v.reference_id === extracted) || v.id === extracted
    );

    if (matched) {
      setIdSearchError("");
      setIsFilterOpen(false);
      navigate(formatPropertyUrl(matched));
    } else {
      setIdSearchError(`Property ID #${extracted} was not found. Please verify the ID.`);
    }
  };
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Real Estate Top Filter Bar State (Zameen Architecture)
  const [topFilters, setTopFilters] = useState<TopFilterBarState>({
    purpose: (searchParams.get("purpose") as any) === "rent" ? "for-rent" : "for-sale",
    city: searchParams.get("city") || "",
    propertyType: searchParams.get("propertyType") || searchParams.get("type") || searchParams.get("make") || "",
    minPrice: searchParams.get("priceMin") ? parseInt(searchParams.get("priceMin")!) : null,
    maxPrice: searchParams.get("priceMax") ? parseInt(searchParams.get("priceMax")!) : null,
    beds: searchParams.get("beds") || null,
    baths: searchParams.get("baths") || null,
    minArea: searchParams.get("minArea") ? parseInt(searchParams.get("minArea")!) : null,
    maxArea: searchParams.get("maxArea") ? parseInt(searchParams.get("maxArea")!) : null,
    areaUnit: "marla",
    furnishedStatus: undefined,
    cornerPlot: false,
    parkFacing: false,
    boundaryWall: false,
    parkingAvailable: false,
  });

  const handleTopFilterChange = useCallback((updated: Partial<TopFilterBarState>) => {
    setTopFilters(prev => ({ ...prev, ...updated }));
  }, []);

  const handleResetTopFilters = useCallback(() => {
    setTopFilters({
      purpose: "for-sale",
      city: "",
      propertyType: "",
      minPrice: null,
      maxPrice: null,
      beds: null,
      baths: null,
      minArea: null,
      maxArea: null,
      areaUnit: "marla",
      furnishedStatus: undefined,
      cornerPlot: false,
      parkFacing: false,
      boundaryWall: false,
      parkingAvailable: false,
    });
  }, []);

  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [freshness, setFreshness] = useState<ListingFreshness>("any");
  const [electricityBackup, setElectricityBackup] = useState<boolean>(false);

  const handleTogglePropertyType = useCallback((typeName: string) => {
    setSelectedPropertyTypes(prev => {
      const exists = prev.includes(typeName);
      const next = exists ? prev.filter(t => t !== typeName) : [...prev, typeName];
      if (next.length === 1) {
        setTopFilters(f => ({ ...f, propertyType: next[0] }));
      } else if (next.length === 0) {
        setTopFilters(f => ({ ...f, propertyType: "" }));
      }
      return next;
    });
  }, []);

  const handleResetAllFilters = useCallback(() => {
    handleResetTopFilters();
    setSelectedPropertyTypes([]);
    setSelectedLocations([]);
    setFreshness("any");
    setElectricityBackup(false);
    setOnlyVerified(false);
  }, [handleResetTopFilters]);

  const handleApplyInsight = useCallback((query: {
    city?: string;
    area?: string;
    make?: string;
    verifiedOnly?: boolean;
    minArea?: number;
    maxArea?: number;
    areaUnit?: "marla" | "kanal" | "sqft" | "sqyd";
  }) => {
    setTopFilters(prev => ({
      ...prev,
      city: query.city !== undefined ? query.city : prev.city,
      propertyType: query.make !== undefined ? query.make : prev.propertyType,
      minArea: query.minArea !== undefined ? query.minArea : prev.minArea,
      maxArea: query.maxArea !== undefined ? query.maxArea : prev.maxArea,
      areaUnit: query.areaUnit !== undefined ? query.areaUnit : prev.areaUnit,
    }));
    if (query.area) {
      setSelectedLocations([query.area]);
    }
    if (query.verifiedOnly !== undefined) {
      setOnlyVerified(query.verifiedOnly);
    }
  }, []);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "price-low" | "price-high" | "mileage" | "mileage-low" | "mileage-high" | "year-high" | "year-low" | "ai">("ai");
  const [compareList, setCompareList] = useState<Property[]>([]);
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
    if (topFilters.city) count++;
    if (topFilters.propertyType) count++;
    if (topFilters.minPrice || topFilters.maxPrice) count++;
    if (topFilters.beds) count++;
    if (topFilters.baths) count++;
    if (topFilters.minArea || topFilters.maxArea) count++;
    if (topFilters.furnishedStatus) count++;
    if (topFilters.cornerPlot) count++;
    if (topFilters.parkFacing) count++;
    if (topFilters.boundaryWall) count++;
    if (topFilters.parkingAvailable) count++;
    if (searchQuery) count++;
    if (onlyVerified) count++;
    return count;
  }, [topFilters, searchQuery, onlyVerified]);

  const handleDirectIdSearch = useCallback((idQuery: string) => {
    if (!idQuery.trim()) return;
    const extracted = extractReferenceId(idQuery);
    if (!extracted) {
      setIdSearchError("Please enter a valid 6-8 digit Property ID");
      return;
    }
    const matched = properties.find(
      (v) => (v.reference_id && v.reference_id === extracted) || v.id === extracted
    );
    if (matched) {
      setIdSearchError("");
      setIsFilterOpen(false);
      navigate(formatPropertyUrl(matched));
    } else {
      setIdSearchError(`Property ID #${extracted} was not found. Please verify the ID.`);
    }
  }, [properties, navigate]);

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
    if (properties.length > 0) {
      setIsDataLoaded(true);
    }
  }, [properties]);

  const filteredProperties = useMemo(() => {
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
      let result = properties.filter((v) => {
        if (!v) return false;
        // Only show active listings in marketplace (exclude inactive, expired, drafts, or >67 days unconfirmed)
        if (v.status === 'inactive' || v.status === 'expired' || v.status === 'draft' || v.status === 'rejected') return false;
        if (listingFreshnessService.getFreshness(v).isExpired) return false;

        const queryRefId = extractReferenceId(searchQuery);
        const matchesSearch = !searchQuery ||
          (queryRefId && ((v.reference_id && v.reference_id === queryRefId) || v.id === queryRefId)) ||
          (v.reference_id && v.reference_id.toLowerCase().includes(searchQuery.trim().toLowerCase())) ||
          (v.make && v.make.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (v.model && v.model.toLowerCase().includes(searchQuery.toLowerCase()));
        
        // 1. Purpose Filter (Buy vs Rent)
        const isRent = topFilters.purpose === "for-rent";
        const matchesPurpose = isRent 
          ? (v.purpose === "for-rent" || v.purpose === "rent" || (v.price && v.price < 5000000))
          : (v.purpose !== "for-rent" && v.purpose !== "rent");

        // 2. City Filter
        const matchesCity = !topFilters.city || 
          v.city?.toLowerCase() === topFilters.city.toLowerCase() ||
          (selectedCities.length > 0 && selectedCities.includes(v.city || ""));

        // 3. Property Type Filter (using clean propertyType field)
        const targetType = topFilters.propertyType?.toLowerCase();
        const matchesType = (selectedPropertyTypes.length === 0 && !targetType) ||
          (selectedPropertyTypes.length > 0 && selectedPropertyTypes.some(t => {
            const tl = t.toLowerCase();
            const pType = (v.propertyType || v.type || "").toLowerCase();
            return pType.includes(tl) ||
                   (tl === "plot" && pType.includes("plot")) ||
                   (tl === "commercial" && pType.includes("commercial"));
          })) ||
          (targetType && (
            (v.propertyType || v.type || "").toLowerCase().includes(targetType) ||
            (targetType === "plot" && (v.propertyType || v.type || "").toLowerCase().includes("plot")) ||
            (targetType === "commercial" && (v.propertyType || v.type || "").toLowerCase().includes("commercial"))
          ));

        // 4. Price Filter (Scaled based on Buy vs Rent)
        const displayPrice = isRent && v.price !== undefined ? Math.floor(v.price / 400) : v.price;
        const matchesMaxPrice = !topFilters.maxPrice || (displayPrice !== undefined && displayPrice <= topFilters.maxPrice);
        const matchesMinPrice = !topFilters.minPrice || (displayPrice !== undefined && displayPrice >= topFilters.minPrice);

        // 5. Beds & Baths (Ignored for Plot/Commercial)
        let matchesBeds = true;
        const pt = topFilters.propertyType.toLowerCase();
        if (topFilters.beds && pt !== "plot" && pt !== "commercial") {
          const pBeds = v.bedrooms ?? v.specs?.bedrooms ?? v.specs?.seating ?? 0;
          if (topFilters.beds === "studio") {
            matchesBeds = pBeds === 0;
          } else if (topFilters.beds === "5+") {
            matchesBeds = pBeds >= 5;
          } else {
            matchesBeds = pBeds >= parseInt(topFilters.beds);
          }
        }

        let matchesBaths = true;
        if (topFilters.baths && pt !== "plot" && pt !== "commercial") {
          const pBaths = v.bathrooms ?? v.specs?.bathrooms ?? v.specs?.horsepower ?? 0;
          if (topFilters.baths === "5+") {
            matchesBaths = pBaths >= 5;
          } else {
            matchesBaths = pBaths >= parseInt(topFilters.baths);
          }
        }

        // 6. Area / Size Filter with Pakistani Unit Multipliers
        const unitMultiplier = AREA_UNITS.find(u => u.id === topFilters.areaUnit)?.sqftMultiplier || 225;
        const pAreaSqft = v.mileage || v.areaSize || 0;
        const matchesMinArea = !topFilters.minArea || (pAreaSqft >= topFilters.minArea * unitMultiplier);
        const matchesMaxArea = !topFilters.maxArea || (pAreaSqft <= topFilters.maxArea * unitMultiplier);

        // 7. More Filters Overflow Attributes
        const matchesFurnished = !topFilters.furnishedStatus || 
          v.transmission === topFilters.furnishedStatus || 
          v.specs?.furnishedStatus === topFilters.furnishedStatus;
        const matchesCorner = !topFilters.cornerPlot || v.features?.includes("Corner Plot") || v.specs?.facing === "Corner";
        const matchesPark = !topFilters.parkFacing || v.features?.includes("Park Facing") || v.specs?.facing === "Park Facing";
        const matchesBoundary = !topFilters.boundaryWall || v.features?.includes("Boundary Wall");
        const matchesParking = !topFilters.parkingAvailable || v.features?.includes("Parking Available") || (v.specs?.parkingSpaces && v.specs.parkingSpaces > 0);

        const matchesVerified = !onlyVerified || !!v.seller?.isVerified;

        // 8. Listing Freshness Filter (Zameen Date of Addition)
        let matchesFreshness = true;
        if (freshness !== "any") {
          const createdTime = new Date(v.createdAt || 0).getTime();
          const now = Date.now();
          if (freshness === "24h") matchesFreshness = now - createdTime <= 24 * 3600 * 1000;
          else if (freshness === "week") matchesFreshness = now - createdTime <= 7 * 24 * 3600 * 1000;
          else if (freshness === "month") matchesFreshness = now - createdTime <= 30 * 24 * 3600 * 1000;
        }

        // 9. Electricity Backup Feature
        const matchesElectricity = !electricityBackup || 
          (v.features && v.features.some(f => /electricity|solar|ups|generator/i.test(f)));

        const matchesLocation = selectedLocations.length === 0 || 
          selectedLocations.some(loc => 
            (v.area && v.area.toLowerCase().includes(loc.toLowerCase())) ||
            (v.location && v.location.toLowerCase().includes(loc.toLowerCase())) ||
            (v.model && v.model.toLowerCase().includes(loc.toLowerCase()))
          );

        const matchesCustomFilters = Object.entries(customFilters).every(([key, value]) => {
          if (!value || (Array.isArray(value) && value.length === 0)) return true;
          const vehicleValue = v.customFields?.[key];
          if (Array.isArray(value)) {
            return value.includes(vehicleValue);
          }
          return vehicleValue === value;
        });

        return matchesSearch && matchesPurpose && matchesCity && matchesType && 
               matchesMinPrice && matchesMaxPrice && matchesBeds && matchesBaths && 
               matchesMinArea && matchesMaxArea && matchesFurnished && matchesCorner && 
               matchesPark && matchesBoundary && matchesParking && matchesVerified && 
               matchesFreshness && matchesElectricity && matchesLocation && matchesCustomFilters;
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
      console.error("Error in filteredProperties useMemo:", e);
      return properties; // Guarded fallback path
    }
  }, [searchQuery, selectedCondition, selectedFuel, selectedBodyType, onlyVerified, maxPrice, minPrice, minYear, maxYear, minMileage, maxMileage, selectedCities, userLocation, sortBy, properties, trackSearch, customFilters, selectedMake, selectedModel, selectedVariant, isDataLoaded, minBeds, minBaths, searchParams]);

  const toggleCompare = useCallback((property: Property) => {
    setCompareList(prev => {
      if (prev.find(v => v.id === property.id)) {
        return prev.filter(v => v.id !== property.id);
      }
      if (prev.length >= 3) return prev;
      return [...prev, property];
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
                      {properties
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
                  className="w-full px-3 py-2.5 border border-apple-border/20 rounded-xl bg-apple-gray/50 dark:bg-apple-card-bg text-sm outline-none text-apple-text focus:border-apple-blue cursor-pointer"
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
                  className="w-full px-3 py-2.5 border border-apple-border/20 rounded-xl bg-apple-gray/50 dark:bg-apple-card-bg text-sm outline-none text-apple-text focus:border-apple-blue cursor-pointer"
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
      {/* Dedicated Search by Property ID Section (Mobile Sheet & Desktop Sidebar) */}
      <section className="p-4 rounded-2xl bg-gradient-to-br from-apple-blue/5 via-teal-500/5 to-transparent border border-apple-blue/20">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-bold text-apple-blue uppercase tracking-[0.18em] flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5" />
            <span>Search by Property ID</span>
          </h3>
          <span className="text-[9px] font-semibold text-apple-text-muted bg-white/70 dark:bg-white/10 px-2 py-0.5 rounded-full border border-apple-border/20">
            Direct Hit
          </span>
        </div>
        <p className="text-[11px] text-apple-text-muted mb-3 leading-tight">
          Received a reference ID or link on WhatsApp / Call? Jump straight to the property.
        </p>
        <form onSubmit={handleIdSearchSubmit} className="space-y-2">
          <div className="relative flex items-center">
            <Hash className="absolute left-3 w-3.5 h-3.5 text-apple-blue shrink-0 pointer-events-none" />
            <input
              type="text"
              value={idSearchInput}
              onChange={(e) => {
                setIdSearchInput(e.target.value);
                if (idSearchError) setIdSearchError("");
              }}
              placeholder="e.g. 3421789 or paste URL"
              className="w-full pl-8 pr-18 py-2 text-xs font-mono font-medium rounded-xl border border-apple-border/30 dark:border-white/10 bg-white/90 dark:bg-white/5 text-apple-text dark:text-white placeholder:text-apple-text-muted placeholder:font-sans focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/10 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!idSearchInput.trim()}
              className="absolute right-1 px-3 py-1 text-[11px] font-bold rounded-lg bg-apple-blue text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
            >
              Jump ↵
            </button>
          </div>
          {idSearchError && (
            <div className="flex items-start gap-1.5 text-[11px] text-apple-red font-medium px-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{idSearchError}</span>
            </div>
          )}
        </form>
      </section>

      <section>
        <h3 className="text-[11px] font-semibold text-apple-text-muted uppercase tracking-[0.2em] mb-4">Property Category & Type</h3>
        <PropertySelector 
          selectedType={selectedMake || topFilters.propertyType}
          onSelect={(selection) => {
            handleTopFilterChange({ propertyType: selection.typeName });
            setSelectedMake(selection.typeName);
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
        <h3 className="text-[11px] font-semibold text-apple-text-muted uppercase tracking-[0.2em] mb-6">Property Style</h3>
        <div className="space-y-4 max-h-52 overflow-y-auto pr-1">
          {["House", "Apartment", "Plot", "Commercial", "Penthouse", "Villa", "Bungalow", "Upper Portion", "Lower Portion"].map((styleOpt) => (
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
        title={selectedMake ? `Buy & Sell ${selectedMake} ${selectedModel || ""} in Pakistan` : "Verified Real Estate & Property Marketplace | Pakizzle"}
        description={selectedMake 
          ? `Discover premium and certified ${selectedMake} ${selectedModel || ""} properties on Pakizzle. Compare prices, inspect title scores, and connect directly with verified agencies.` 
          : "Discover the elite collection of luxury houses, apartments, plots, and commercial spaces on Pakizzle. Filter by city, price range, property style, and check verified LDA/CDA legal status."}
        keywords={[
          selectedMake ? selectedMake.toLowerCase() : "luxury properties",
          selectedModel ? `${selectedMake?.toLowerCase()} ${selectedModel.toLowerCase()}` : "real estate",
          "pakizzle property", "properties for sale Pakistan", "verified property listings", "zameen luxury homes"
        ]}
        canonicalPath="/marketplace"
        ogType="website"
        schema={{
          "@type": "SearchResultsPage",
          "name": selectedMake ? `Verified ${selectedMake} Properties on Pakizzle` : "Elite Property Marketplace - Pakizzle",
          "description": "Live directory of luxury villas, apartments, plots, and commercial spaces with verified legal records.",
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

          {/* 1. TOP FILTER BAR (Zameen Proven Architecture & 2026 Enhanced) */}
          <TopFilterBar
            filters={topFilters}
            onChange={handleTopFilterChange}
            onReset={handleResetTopFilters}
            resultCount={filteredProperties.length}
            activeCount={activeFiltersCount}
            onOpenMobileFilters={() => setIsFilterOpen(true)}
            onDirectIdSearch={handleDirectIdSearch}
            idSearchError={idSearchError}
            isSticky={isSticky}
          />

          {/* 2. QUICK-ACCESS ROW (Property Types + Dynamic Popular Societies per City) */}
          <QuickAccessRow
            activePropertyType={topFilters.propertyType}
            onSelectPropertyType={(pt) => {
              handleTopFilterChange({ propertyType: pt });
            }}
            activeArea={selectedLocations.length > 0 ? selectedLocations[0] : ""}
            onSelectArea={(area) => {
              if (area) {
                setSelectedLocations([area]);
              } else {
                setSelectedLocations([]);
              }
            }}
            currentCity={topFilters.city || (userLocation?.city !== "Pakistan" ? userLocation?.city : "Lahore")}
          />

          <div className="flex gap-6 lg:gap-8 xl:gap-10 items-start">
            {/* 1. PERSISTENT FILTER SIDEBAR FOR DESKTOP (Golden Ratio 1:φ² ≈ 23.6% supporting element) */}
            <aside className="hidden xl:block w-[23.6%] shrink-0 sticky top-28 self-start max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pr-1">
              <div className="glass-card p-5 bg-apple-card-bg backdrop-blur-md rounded-2xl border border-apple-border/30">
                <div className="flex items-center justify-between pb-3.5 border-b border-apple-border/20 mb-4">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-brand-primary" />
                    <h3 className="font-bold text-sm text-apple-text">Refine Properties</h3>
                  </div>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={handleResetAllFilters}
                      className="text-[11px] font-bold text-red-500 hover:underline cursor-pointer"
                    >
                      Clear all ({activeFiltersCount})
                    </button>
                  )}
                </div>
                <SidebarFilters
                  filters={topFilters}
                  onChange={handleTopFilterChange}
                  selectedTypes={selectedPropertyTypes}
                  onToggleType={handleTogglePropertyType}
                  selectedArea={selectedLocations.length > 0 ? selectedLocations[0] : ""}
                  onSelectArea={(area) => setSelectedLocations(area ? [area] : [])}
                  freshness={freshness}
                  onChangeFreshness={setFreshness}
                  onlyVerified={onlyVerified}
                  onToggleVerified={setOnlyVerified}
                  electricityBackup={electricityBackup}
                  onToggleElectricityBackup={setElectricityBackup}
                  onResetAll={handleResetAllFilters}
                  activeCount={activeFiltersCount}
                />
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
                    className="fixed inset-x-0 bottom-0 max-h-[88vh] bg-white dark:bg-apple-card-bg rounded-t-[32px] md:max-w-xl md:mx-auto md:bottom-6 md:rounded-[32px] shadow-[0_-25px_60px_rgba(0,0,0,0.35)] z-[90] flex flex-col overflow-hidden border border-black/10 dark:border-white/10 xl:hidden"
                    style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
                  >
                    {/* Grab handle indicator */}
                    <div className="pt-3 pb-1 cursor-grab active:cursor-grabbing flex justify-center shrink-0">
                      <div className="w-12 h-1.5 rounded-full bg-apple-border" />
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-apple-border/20 dark:border-white/10 shrink-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-apple-text dark:text-white">Refine Properties</h2>
                        {activeFiltersCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold">
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
                      <SidebarFilters
                        filters={topFilters}
                        onChange={handleTopFilterChange}
                        selectedTypes={selectedPropertyTypes}
                        onToggleType={handleTogglePropertyType}
                        selectedArea={selectedLocations.length > 0 ? selectedLocations[0] : ""}
                        onSelectArea={(area) => setSelectedLocations(area ? [area] : [])}
                        freshness={freshness}
                        onChangeFreshness={setFreshness}
                        onlyVerified={onlyVerified}
                        onToggleVerified={setOnlyVerified}
                        electricityBackup={electricityBackup}
                        onToggleElectricityBackup={setElectricityBackup}
                        onResetAll={handleResetAllFilters}
                        activeCount={activeFiltersCount}
                      />
                    </div>

                    {/* Sticky Bottom Actions Bar */}
                    <div className="p-4 bg-white/90 dark:bg-apple-card-bg/90 backdrop-blur-xl border-t border-apple-border/20 dark:border-white/10 flex items-center gap-3 shrink-0">
                      <button
                        onClick={handleResetAllFilters}
                        className="px-4 py-3 rounded-2xl text-xs font-bold text-apple-text-muted hover:text-apple-red hover:bg-apple-red/10 transition-colors cursor-pointer min-h-[44px]"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={() => setIsFilterOpen(false)}
                        className="flex-1 apple-button-primary !h-12 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 cursor-pointer active:scale-98 transition-transform min-h-[48px]"
                      >
                        Show Properties ({filteredProperties.length})
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Main Results Grid Container (Golden Ratio Dominant Canvas: 76.4%) */}
            <div className="flex-1 w-full xl:w-[76.4%] min-w-0">
              {/* 4. MARKET INSIGHT MODULE (Rotating aggregate signals & 1-tap filtered search) */}
              <MarketInsightBanner
                currentCity={topFilters.city || (userLocation?.city !== "Pakistan" ? userLocation?.city : "Lahore")}
                onApplyInsight={handleApplyInsight}
              />

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
                    Showing <span className="text-apple-text font-bold"><AnimatedCounter value={filteredProperties.length} duration={0.6} once={false} /></span> Results
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
                        : "bg-white dark:bg-apple-surface/95 border-apple-border/40 text-apple-text hover:bg-apple-gray/50"
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

                  <div className="relative">
                    <button
                      ref={sortRef as any}
                      onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                      className={cn(
                        "flex items-center justify-between gap-3 px-5 py-2.5 bg-white dark:bg-apple-card-bg border border-apple-border/40 dark:border-white/10 shadow-md hover:shadow-apple-soft transition-all duration-300 relative group cursor-pointer text-left focus:outline-none rounded-full text-xs font-semibold h-[38px]",
                        isSortDropdownOpen ? "ring-2 ring-brand-primary/20 bg-apple-gray/50 dark:bg-white/10" : ""
                      )}
                    >
                      <span className="text-apple-text text-apple-text truncate selection-none">
                        Sort: <span className="font-extrabold text-brand-primary">{([
                          { id: "ai", label: "Recommended" },
                          { id: "newest", label: "Newest First" },
                          { id: "oldest", label: "Oldest First" },
                          { id: "price-low", label: "Price: Low to High" },
                          { id: "price-high", label: "Price: High to Low" },
                        ].find(option => option.id === sortBy)?.label) || "Recommended"}</span>
                      </span>
                      <ChevronDown className={cn("w-3.5 h-3.5 text-apple-text-muted text-apple-text-muted transition-transform duration-300 shrink-0", isSortDropdownOpen ? "rotate-180 text-brand-primary" : "group-hover:translate-y-0.5")} />
                    </button>

                    <FilterPopover
                      isOpen={isSortDropdownOpen}
                      onClose={() => setIsSortDropdownOpen(false)}
                      triggerRef={sortRef as any}
                      title="Sort Properties"
                      align="end"
                      width={230}
                      maxHeight={320}
                    >
                      <div className="space-y-1">
                        {[
                          { id: "ai", label: "Recommended" },
                          { id: "newest", label: "Newest First" },
                          { id: "oldest", label: "Oldest First" },
                          { id: "price-low", label: "Price: Low to High" },
                          { id: "price-high", label: "Price: High to Low" },
                        ].map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              setSortBy(option.id as any);
                              setIsSortDropdownOpen(false);
                            }}
                            className={cn(
                              "w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-between",
                              sortBy === option.id 
                                ? "bg-brand-primary text-white shadow-xs" 
                                : "text-apple-text text-apple-text hover:bg-apple-gray dark:hover:bg-white/5"
                            )}
                          >
                            <span>{option.label}</span>
                            {sortBy === option.id && (
                              <Check className="w-3.5 h-3.5 text-white" />
                            )}
                          </button>
                        ))}
                      </div>
                    </FilterPopover>
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
              {isDataLoaded && filteredProperties.length > 0 && (
                <GoogleAdSenseSlot slotType="leaderboard" />
              )}

              <div className={cn(
                "grid items-stretch gap-3 sm:gap-4 lg:gap-5",
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" 
                  : "grid-cols-1"
              )}>
                {!isDataLoaded ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <PropertyCard key={`skeleton-${i}`} property={{} as any} viewMode={viewMode} isLoading={true} />
                  ))
                ) : filteredProperties.length > 0 ? (
                  filteredProperties.flatMap((property, index) => {
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
                        key={property.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (index % 4) * 0.05 }}
                        className="h-full"
                      >
                        <PropertyCard 
                          property={property} 
                          viewMode={viewMode} 
                          onCompare={toggleCompare}
                          isCompared={!!compareList.find(v => v.id === property.id)}
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
                    <h3 className="text-xl font-bold text-apple-text mb-2">No properties found</h3>
                    <p className="text-apple-text-muted max-w-xs mx-auto">
                      Try adjusting your filters or location search to find the ideal property.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Right Skyscraper Google Display Ad (just like dubizzle.com) */}
            {isDataLoaded && filteredProperties.length > 0 && (
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
          className="h-11 px-5 rounded-full bg-apple-blue text-white shadow-[0_8px_25px_rgba(15,118,110,0.45)] border border-apple-blue/30/40 flex items-center gap-2 font-bold text-xs cursor-pointer backdrop-blur-md min-h-[44px] touch-target"
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
