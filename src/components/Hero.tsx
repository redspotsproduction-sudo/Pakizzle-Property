import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  MapPin, 
  Search, 
  Building2, 
  Home, 
  Layers, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Filter, 
  ArrowRight,
  ChevronDown
} from "lucide-react";
import { cn } from "../lib/utils";
import { bannerService } from "../services/bannerService";
import { Banner } from "../types";
import { useLocation as useAppLocation } from "../context/LocationContext";
import { PAKISTAN_LOCATIONS } from "../constants/locations";
import ValuationModal from "./ValuationModal";

import villaImg from "../assets/images/pakizzle_villa_hero_1790252631072.jpg";
import penthouseImg from "../assets/images/pakizzle_penthouse_waterfront_1790252648589.jpg";
import mansionImg from "../assets/images/pakizzle_islamabad_mansion_1790252663307.jpg";
import plotImg from "../assets/images/pakizzle_plot_masterplan_1790252681010.jpg";

const DEFAULT_BANNERS: Banner[] = [
  {
    id: "default-1",
    type: "category",
    image: villaImg,
    name: "Architectural Contemporary Villa · DHA Phase 6 Lahore",
    status: "active",
    displayOrder: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: "default-2",
    type: "category",
    image: penthouseImg,
    name: "Emaar Oceanfront Panoramic Penthouse · Crescent Bay Karachi",
    status: "active",
    displayOrder: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: "default-3",
    type: "category",
    image: mansionImg,
    name: "Margalla Ridge Modern Sanctuary · Sector F-7 Islamabad",
    status: "active",
    displayOrder: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: "default-4",
    type: "category",
    image: plotImg,
    name: "Masterplanned Possession Plots · DHA Phase 9 Prism Lahore",
    status: "active",
    displayOrder: 3,
    createdAt: new Date().toISOString()
  }
];

const MAJOR_CITIES = [
  "All Pakistan",
  "Islamabad",
  "Lahore",
  "Karachi",
  "Rawalpindi",
  "Peshawar",
  "Multan",
  "Faisalabad"
];

const PROPERTY_TYPES = [
  { label: "All Property Types", value: "" },
  { label: "Houses & Villas", value: "House" },
  { label: "Apartments & Flats", value: "Apartment" },
  { label: "Residential Plots", value: "Plot" },
  { label: "Commercial Plazas & Retail", value: "Commercial" },
  { label: "Sky Penthouses", value: "Penthouse" }
];

const BUY_BUDGET_PRESETS = [
  { label: "Any Budget", min: null, max: null },
  { label: "Under Rs 1.5 Crore", min: null, max: 15000000 },
  { label: "Rs 1.5 - 3.5 Crore", min: 15000000, max: 35000000 },
  { label: "Rs 3.5 - 7.5 Crore", min: 35000000, max: 75000000 },
  { label: "Rs 7.5 - 15 Crore", min: 75000000, max: 150000000 },
  { label: "Rs 15 Crore +", min: 150000000, max: null }
];

const RENT_BUDGET_PRESETS = [
  { label: "Any Rent", min: null, max: null },
  { label: "Under Rs 60,000 / mo", min: null, max: 60000 },
  { label: "Rs 60,000 - 1.5 Lac / mo", min: 60000, max: 150000 },
  { label: "Rs 1.5 - 3 Lac / mo", min: 150000, max: 300000 },
  { label: "Rs 3 Lac + / mo", min: 300000, max: null }
];

export default function Hero() {
  const [banners, setBanners] = useState<Banner[]>(DEFAULT_BANNERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();
  const { location: userLocation } = useAppLocation();

  // Search Bar States
  const [activePurpose, setActivePurpose] = useState<"buy" | "rent" | "plots" | "commercial">("buy");
  const [selectedCity, setSelectedCity] = useState("All Pakistan");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedBudgetIndex, setSelectedBudgetIndex] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [isValuationOpen, setIsValuationOpen] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Sync with global userLocation
  useEffect(() => {
    if (userLocation?.city && userLocation.city !== "Pakistan") {
      setSelectedCity(userLocation.city);
    }
  }, [userLocation]);

  // Handle outside click for location suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowLocationSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch or filter targeted banners
  useEffect(() => {
    const unsubscribe = bannerService.subscribeToBanners((data) => {
      const activeBanners = data.filter((b) => b.status === "active");
      if (activeBanners.length > 0) {
        setBanners(activeBanners);
      }
    });
    return () => unsubscribe();
  }, []);

  // Banner rotation interval
  useEffect(() => {
    if (isPaused || banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, banners.length]);

  const currentBanner = banners[currentIndex] || DEFAULT_BANNERS[0];

  // Location suggestions filtered by selected city and typed query
  const suggestions = React.useMemo(() => {
    if (!searchLocation.trim()) return [];
    const q = searchLocation.toLowerCase();
    const cityList = selectedCity !== "All Pakistan" ? [selectedCity] : Object.keys(PAKISTAN_LOCATIONS);
    const matches: { area: string; city: string }[] = [];

    for (const c of cityList) {
      const areas = PAKISTAN_LOCATIONS[c] || [];
      for (const a of areas) {
        if (a.toLowerCase().includes(q) && !a.toLowerCase().startsWith("all over")) {
          matches.push({ area: a, city: c });
          if (matches.length >= 6) break;
        }
      }
      if (matches.length >= 6) break;
    }
    return matches;
  }, [searchLocation, selectedCity]);

  // Execute Search Navigation
  const handleSearch = () => {
    const params = new URLSearchParams();

    if (activePurpose === "rent") {
      params.set("purpose", "rent");
    } else if (activePurpose === "plots") {
      params.set("make", "Plot");
    } else if (activePurpose === "commercial") {
      params.set("make", "Commercial");
    } else {
      params.set("purpose", "buy");
    }

    if (selectedCity && selectedCity !== "All Pakistan") {
      params.set("city", selectedCity);
    }

    if (searchLocation.trim()) {
      params.set("q", searchLocation.trim());
    }

    if (selectedType) {
      params.set("make", selectedType);
    }

    const budgetList = activePurpose === "rent" ? RENT_BUDGET_PRESETS : BUY_BUDGET_PRESETS;
    const currentBudget = budgetList[selectedBudgetIndex];
    if (currentBudget?.min) {
      params.set("priceMin", currentBudget.min.toString());
    }
    if (currentBudget?.max) {
      params.set("priceMax", currentBudget.max.toString());
    }

    if (verifiedOnly) {
      params.set("verified", "true");
    }

    navigate(`/marketplace?${params.toString()}`);
  };

  const budgetOptions = activePurpose === "rent" ? RENT_BUDGET_PRESETS : BUY_BUDGET_PRESETS;

  return (
    <section className="relative pt-20 sm:pt-24 md:pt-28 pb-10 overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Background Ambience */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-teal-500/5 via-teal-500/0 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* 1. Portal Headline & Value Proposition (Unmistakable & Distinctive) */}
        <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/80 text-[#0F766E] dark:text-teal-400 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-[#0F766E] dark:text-teal-400" />
            <span>Pakistan's 100% Title-Verified Property Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-[1.15]">
            Pakistan's Verified <br className="hidden sm:inline" />
            <span className="text-[#0F766E] dark:text-teal-400">Real Estate Ecosystem.</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Search 14,500+ genuine properties across Lahore, Karachi, Islamabad & beyond. 
            Every listing verified against LDA, CDA & DHA land registries with zero broker spam.
          </p>
        </div>

        {/* 2. Unified Functional Search Console Directly inside Hero */}
        <div 
          ref={searchBoxRef}
          className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-lg shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-slate-200 dark:border-slate-800 p-3 sm:p-5 mb-8 relative z-30"
        >
          {/* Purpose Tabs: Buy, Rent, Plots, Commercial + Valuation Hub */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-lg">
              {[
                { id: "buy", label: "Buy Homes" },
                { id: "rent", label: "Rent" },
                { id: "plots", label: "Plots & Land" },
                { id: "commercial", label: "Commercial" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActivePurpose(tab.id as any);
                    setSelectedBudgetIndex(0);
                  }}
                  className={cn(
                    "px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer",
                    activePurpose === tab.id
                      ? "bg-[#0F766E] text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* AI Valuation Hub Quick Trigger */}
            <button
              onClick={() => setIsValuationOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Instant AI Valuation</span>
            </button>
          </div>

          {/* Core Search Inputs Row: City + Location + Type + Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            
            {/* City Selector (3 cols) */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                City
              </label>
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setSearchLocation("");
                  }}
                  className="w-full h-10 px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0F766E] appearance-none pr-8 cursor-pointer"
                >
                  {MAJOR_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Location / Sector Input (3 cols) */}
            <div className="lg:col-span-3 relative">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Sector / Society
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => {
                    setSearchLocation(e.target.value);
                    setShowLocationSuggestions(true);
                  }}
                  onFocus={() => setShowLocationSuggestions(true)}
                  placeholder={selectedCity === "All Pakistan" ? "e.g. DHA, Clifton, F-7" : `Societies in ${selectedCity}`}
                  className="w-full h-10 pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              {/* Suggestions Dropdown */}
              {showLocationSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-50">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearchLocation(s.area);
                        setSelectedCity(s.city);
                        setShowLocationSuggestions(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{s.area}</span>
                      <span className="text-[11px] text-slate-500">{s.city}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Type (3 cols) */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Property Type
              </label>
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full h-10 px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0F766E] appearance-none pr-8 cursor-pointer"
                >
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t.label} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Budget Range (3 cols) */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Budget (PKR)
              </label>
              <div className="relative">
                <select
                  value={selectedBudgetIndex}
                  onChange={(e) => setSelectedBudgetIndex(Number(e.target.value))}
                  className="w-full h-10 px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0F766E] appearance-none pr-8 cursor-pointer"
                >
                  {budgetOptions.map((b, idx) => (
                    <option key={idx} value={idx}>
                      {b.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Action Row: Verified Toggle + Search CTA Button */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer w-full sm:w-auto justify-center sm:justify-start",
                verifiedOnly
                  ? "bg-teal-50 dark:bg-teal-950/50 text-[#0F766E] dark:text-teal-400 border-teal-300 dark:border-teal-700"
                  : "bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900"
              )}
            >
              <ShieldCheck className={cn("w-4 h-4", verifiedOnly ? "text-[#0F766E]" : "text-slate-400")} />
              <span>Shanakht™ Verified Only</span>
              {verifiedOnly && <span className="text-[10px] bg-[#0F766E] text-white px-1.5 py-0.2 rounded-full">Active</span>}
            </button>

            <button
              onClick={handleSearch}
              className="w-full sm:w-auto h-10 px-6 rounded-lg bg-[#0F766E] hover:bg-[#0D9488] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Search 14,500+ Properties</span>
            </button>
          </div>
        </div>

        {/* 3. Trust Signals Strip Above The Fold */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                number: "14,500+",
                label: "Verified Listings",
                desc: "100% checked inventory",
                icon: Building2
              },
              {
                number: "18+ Cities",
                label: "Nationwide Coverage",
                desc: "Lahore, Karachi, Isb & more",
                icon: MapPin
              },
              {
                number: "100% Shanakht™",
                label: "LDA, CDA & DHA Cleared",
                desc: "Zero title disputes",
                icon: ShieldCheck
              },
              {
                number: "Rs 180+ Cr",
                label: "Volume Facilitated",
                desc: "Safe real estate trades",
                icon: CheckCircle2
              }
            ].map((stat, idx) => (
              <div 
                key={idx}
                className="p-3 sm:p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#0F766E] dark:text-teal-400 flex items-center justify-center shrink-0">
                  <stat.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 font-mono leading-tight">
                    {stat.number}
                  </div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {stat.label}
                  </div>
                  <div className="text-[10px] text-slate-400 hidden sm:block">
                    {stat.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Shanakht Guarantee Seal */}
          <div className="mt-3 p-3 rounded-lg bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 flex items-center justify-between text-xs text-teal-900 dark:text-teal-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0F766E] shrink-0" />
              <span>
                <strong className="font-semibold">Pakizzle Shanakht™ Guarantee:</strong> All verified properties are cross-checked against official municipal records (LDA, CDA, DHA) to eliminate title fraud.
              </span>
            </div>
            <Link to="/auction-verification" className="hidden md:inline-flex items-center gap-1 font-semibold text-[#0F766E] dark:text-teal-400 hover:underline shrink-0 text-xs ml-4">
              Learn about Verification
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4. Curated Architectural Showcase Carousel */}
        <div 
          className="max-w-5xl mx-auto relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md group h-56 sm:h-72 md:h-80"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 cursor-pointer"
              onClick={() => {
                if (currentBanner.type === "category" && currentBanner.targetId) {
                  navigate(`/marketplace?categoryId=${currentBanner.targetId}`);
                } else {
                  navigate("/marketplace");
                }
              }}
            >
              <img
                src={currentBanner.image}
                alt={currentBanner.name}
                className="w-full h-full object-cover transition-transform duration-7000 group-hover:scale-105"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-6 text-white z-10">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-medium tracking-wide mb-1.5">
                  <Sparkles className="w-3 h-3 text-teal-300" />
                  <span>Curated Architectural Showcase</span>
                </div>
                <h3 className="text-base sm:text-xl md:text-2xl font-bold tracking-tight text-white line-clamp-1">
                  {currentBanner.name}
                </h3>
                <p className="text-xs text-white/80 mt-1 hidden sm:block">
                  Verified land demarcation · 100% Non-Encumbrance Certified · Direct Agency Listing
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 z-20"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % banners.length);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 z-20"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-3 right-5 flex gap-1.5 z-20">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(i);
                }}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  i === currentIndex ? "w-6 bg-teal-400" : "w-1.5 bg-white/40"
                )}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Instant Valuation Modal */}
      {isValuationOpen && (
        <ValuationModal isOpen={isValuationOpen} onClose={() => setIsValuationOpen(false)} />
      )}
    </section>
  );
}
