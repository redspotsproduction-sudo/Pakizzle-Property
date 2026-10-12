import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  MapPin,
  Search,
  Building2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  ChevronDown,
  Bed,
  Bath,
  Maximize2,
  CheckCircle2,
  SlidersHorizontal,
  Home,
  Compass,
  MessageSquare,
  User,
  Bell,
  Sun,
  Moon,
  ArrowUpRight,
  Check,
  X
} from "lucide-react";
import { cn, formatPrice, formatExactPrice } from "../lib/utils";
import FilterPopover from "./ui/FilterPopover";
import { propertySchemaService, CityItem, PropertyTypeItem, CANONICAL_CITIES, CANONICAL_PROPERTY_TYPES } from "../services/propertySchemaService";
import { bannerService } from "../services/bannerService";
import { Banner } from "../types";
import { useLocation as useAppLocation } from "../context/LocationContext";
import { useTheme } from "../context/ThemeContext";
import { PAKISTAN_LOCATIONS } from "../constants/locations";
import ValuationModal from "./ValuationModal";
import { AnimatedCounter, REVEAL_EASE, SPRING_TACTILE, SPRING_SNAPPY } from "./motion";
import { GlassPanel, GlassCapsule, GlassButton, GlassCard } from "./ui/GlassPrimitives";

import villaImg from "../assets/images/pakizzle_villa_hero_1790252631072.webp";
import penthouseImg from "../assets/images/pakizzle_penthouse_waterfront_1790252648589.webp";
import mansionImg from "../assets/images/pakizzle_islamabad_mansion_1790252663307.webp";
import plotImg from "../assets/images/pakizzle_plot_masterplan_1790252681010.webp";

const HERO_HEROES = [
  {
    id: "h-1",
    image: villaImg,
    title: "The Glass Pavilion Villa",
    subtitle: "Phase 6 DHA, Lahore",
    price: "Rs 14.5 Crore",
    numericPrice: 145000000,
    specs: { beds: 5, baths: 6, area: "1 Kanal" },
    tag: "LDA Registry Clear",
    tagColor: "emerald"
  },
  {
    id: "h-2",
    image: penthouseImg,
    title: "Panoramic Sky Penthouse",
    subtitle: "Crescent Bay, Karachi",
    price: "Rs 18.2 Crore",
    numericPrice: 182000000,
    specs: { beds: 4, baths: 5, area: "5,400 sq.ft" },
    tag: "Emaar Direct Title",
    tagColor: "teal"
  },
  {
    id: "h-3",
    image: mansionImg,
    title: "Margalla Ridgeline Estate",
    subtitle: "Sector F-7/3, Islamabad",
    price: "Rs 28 Crore",
    numericPrice: 280000000,
    specs: { beds: 6, baths: 7, area: "2 Kanal" },
    tag: "CDA Non-Encumbrance",
    tagColor: "amber"
  },
  {
    id: "h-4",
    image: plotImg,
    title: "Prime Commercial Corner Plot",
    subtitle: "DHA Phase 9 Prism, Lahore",
    price: "Rs 8.75 Crore",
    numericPrice: 87500000,
    specs: { beds: 0, baths: 0, area: "10 Marla" },
    tag: "DHA Possession Verified",
    tagColor: "indigo"
  }
];

const MAJOR_CITIES = [
  "All Pakistan",
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Peshawar",
  "Multan",
  "Faisalabad"
];

const PROPERTY_TYPES = [
  { label: "All Properties", value: "" },
  { label: "Villas & Houses", value: "House" },
  { label: "Penthouses & Flats", value: "Apartment" },
  { label: "Possession Plots", value: "Plot" },
  { label: "Commercial Plazas", value: "Commercial" }
];

const PRICE_PRESETS = [
  { label: "Any Price", min: null, max: null },
  { label: "Under 2 Crore", min: null, max: 20000000 },
  { label: "2 - 5 Crore", min: 20000000, max: 50000000 },
  { label: "5 - 12 Crore", min: 50000000, max: 120000000 },
  { label: "12 Crore +", min: 120000000, max: null }
];

export default function Hero() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<"buy" | "rent" | "plots">("buy");
  const [selectedCity, setSelectedCity] = useState("All Pakistan");
  const [selectedType, setSelectedType] = useState("");
  const [selectedPriceIdx, setSelectedPriceIdx] = useState(0);
  const [isValuationOpen, setIsValuationOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Cockpit popover state & trigger refs for shared FilterPopover
  const [activeDropdown, setActiveDropdown] = useState<"city" | "type" | "price" | "tablet-city" | "tablet-type" | "tablet-price" | null>(null);
  const [heroCitySearch, setHeroCitySearch] = useState("");
  const heroCityTriggerRef = useRef<HTMLButtonElement>(null);
  const heroTypeTriggerRef = useRef<HTMLButtonElement>(null);
  const heroPriceTriggerRef = useRef<HTMLButtonElement>(null);
  const tabletCityTriggerRef = useRef<HTMLButtonElement>(null);
  const tabletTypeTriggerRef = useRef<HTMLButtonElement>(null);
  const tabletPriceTriggerRef = useRef<HTMLButtonElement>(null);

  const [schemaCities, setSchemaCities] = useState<CityItem[]>(CANONICAL_CITIES);
  const [schemaTypes, setSchemaTypes] = useState<PropertyTypeItem[]>(CANONICAL_PROPERTY_TYPES);

  useEffect(() => {
    propertySchemaService.getCities().then(setSchemaCities);
    propertySchemaService.getPropertyTypes().then(setSchemaTypes);
  }, []);

  const heroPopularCities = useMemo(() => schemaCities.filter(c => c.isPopular), [schemaCities]);
  const heroOtherCities = useMemo(() => {
    return schemaCities
      .filter(c => !c.isPopular)
      .filter(c => c.name.toLowerCase().includes(heroCitySearch.toLowerCase()));
  }, [schemaCities, heroCitySearch]);

  const heroFilteredPopular = useMemo(() => {
    return heroPopularCities.filter(c => c.name.toLowerCase().includes(heroCitySearch.toLowerCase()));
  }, [heroPopularCities, heroCitySearch]);

  const heroSectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { location: userLocation } = useAppLocation();
  const { theme } = useTheme();

  // Scroll-linked cinematic parallax:
  // Background moves at ~0.5x scroll speed, foreground content moves at ~1x speed
  const { scrollYProgress } = useScroll({
    target: heroSectionRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const fgY = useTransform(scrollYProgress, [0, 1], ["0%", "42%"]);
  const fgOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.2]);

  // Sync user location city if present
  useEffect(() => {
    if (userLocation?.city && userLocation.city !== "Pakistan") {
      setSelectedCity(userLocation.city);
    }
  }, [userLocation]);

  // Background slow auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % HERO_HEROES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const activeHero = HERO_HEROES[currentIdx];

  const handleSearchSubmit = () => {
    const params = new URLSearchParams();
    if (activeTab === "rent") params.set("purpose", "rent");
    else if (activeTab === "plots") params.set("propertyType", "Plot");
    else params.set("purpose", "buy");

    if (selectedCity && selectedCity !== "All Pakistan") params.set("city", selectedCity);
    if (selectedType) params.set("propertyType", selectedType);

    const price = PRICE_PRESETS[selectedPriceIdx];
    if (price.min) params.set("priceMin", price.min.toString());
    if (price.max) params.set("priceMax", price.max.toString());

    navigate(`/marketplace?${params.toString()}`);
  };

  return (
    <section 
      ref={heroSectionRef}
      className="relative w-full min-h-[92vh] flex items-center justify-center p-3 sm:p-5 md:p-8 pt-20 md:pt-24 overflow-hidden"
    >
      {/* 
        DEVICE FRAME CONTAINER:
        Large rounded container gives the entire viewport a futuristic, continuous OS-level device window feeling
      */}
      <div className="relative w-full max-w-[1440px] min-h-[82vh] rounded-[32px] sm:rounded-[40px] md:rounded-[48px] overflow-hidden border border-white/30 dark:border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.25)] flex flex-col justify-between p-4 sm:p-8 md:p-12">
        
        {/* Full-bleed rich cinematic photographic layer with scroll parallax depth */}
        <motion.div 
          style={{ 
            y: shouldReduceMotion ? 0 : bgY,
            scale: shouldReduceMotion ? 1 : bgScale
          }}
          className="absolute inset-0 z-0 will-change-transform"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={activeHero.id}
              src={activeHero.image}
              alt={activeHero.title}
              loading="eager"
              fetchPriority="high"
              decoding="sync"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: REVEAL_EASE }}
              className="w-full h-full object-cover object-center animate-ken-burns"
            />
          </AnimatePresence>
          {/* Calibrated single photo gradient overlay: ~50% black over text column to ~46% across, easing smoothly to 25% by ~70% across */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.50)_0%,rgba(0,0,0,0.50)_46%,rgba(0,0,0,0.38)_58%,rgba(0,0,0,0.25)_70%,rgba(0,0,0,0.25)_100%)] pointer-events-none" />
        </motion.div>

        {/* 
          FLOATING GLASS RAIL (Left Vertical Stack)
          Part 6: Neutral icons by default, primary on hover, accent pill for active, no gold icons, single theme toggle in header.
        */}
        <aside className="absolute left-4 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-center gap-3 p-2.5 rounded-full photo-glass-panel shadow-2xl">
          <motion.button 
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            transition={SPRING_SNAPPY}
            onClick={() => navigate("/")}
            title="Home" 
            className="w-11 h-11 rounded-full flex items-center justify-center bg-apple-blue text-white transition-all cursor-pointer shadow-xs"
          >
            <Home className="w-5 h-5" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            transition={SPRING_SNAPPY}
            onClick={() => navigate("/marketplace")}
            title="Explore Properties" 
            className="w-11 h-11 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
          >
            <Compass className="w-5 h-5" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            transition={SPRING_SNAPPY}
            onClick={() => setIsValuationOpen(true)}
            title="AI Valuation" 
            className="w-11 h-11 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
          >
            <Sparkles className="w-5 h-5" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            transition={SPRING_SNAPPY}
            onClick={() => navigate("/chat")}
            title="Chat & Concierge" 
            className="w-11 h-11 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
          >
            <MessageSquare className="w-5 h-5" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            transition={SPRING_SNAPPY}
            onClick={() => navigate("/notifications")}
            title="Notifications" 
            className="w-11 h-11 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
          >
            <Bell className="w-5 h-5" />
          </motion.button>
          <div className="w-6 h-[1px] bg-white/20 my-1" />
          <motion.button 
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            transition={SPRING_SNAPPY}
            onClick={() => navigate("/profile")}
            title="Account Profile" 
            className="w-11 h-11 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
          >
            <User className="w-5 h-5" />
          </motion.button>
        </aside>

        {/* 
          TOP ROW: ADAPTIVE SEARCH COCKPIT
          - Mobile (<768px): Single tappable glass pill trigger ("Search properties in Karachi...")
          - Tablet portrait (768–1023px): Two-tier wrapped layout
          - Desktop (1024px+): Full floating capsule spanning the top
        */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: REVEAL_EASE }}
          className="relative z-20 w-full flex justify-center"
        >
          {/* 1. MOBILE (<768px): Single Tappable Glass Pill Search Trigger */}
          <div className="md:hidden w-full flex justify-center">
            <motion.button
              whileTap={{ scale: 0.97 }}
              transition={SPRING_SNAPPY}
              onClick={() => setIsMobileSearchOpen(true)}
              className="w-full max-w-md h-13 px-4 rounded-full photo-glass-panel flex items-center justify-between text-white shadow-xl cursor-pointer touch-target min-h-[44px]"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-full bg-apple-blue/40 flex items-center justify-center shrink-0 border border-white/20">
                  <Search className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col text-left truncate">
                  <span className="text-xs font-bold text-white truncate">
                    {selectedCity === "All Pakistan" ? "Search properties in Pakistan..." : `Search in ${selectedCity}...`}
                  </span>
                  <span className="text-[10px] text-white/70 font-medium truncate">
                    {activeTab.toUpperCase()} · {selectedType || "All Properties"} · {PRICE_PRESETS[selectedPriceIdx].label}
                  </span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 ml-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-white/80" />
              </div>
            </motion.button>
          </div>

          {/* 2. TABLET PORTRAIT (768px–1023px): Two-tier Clean Wrapped Cockpit */}
          <div className="hidden md:flex lg:hidden w-full max-w-2xl photo-glass-panel rounded-3xl p-3 flex-col gap-2.5 shadow-2xl">
            <div className="flex items-center justify-between gap-2">
              {/* Buy / Rent / Plots Segmented Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shrink-0">
                {(["buy", "rent", "plots"] as const).map((tab) => {
                  const isSelected = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "relative px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors duration-200 cursor-pointer min-h-[44px] flex items-center",
                        isSelected ? "text-black font-bold" : "text-white/80 hover:text-white"
                      )}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="tablet-active-tab-pill"
                          transition={SPRING_TACTILE}
                          className="absolute inset-0 bg-white rounded-full shadow-md -z-10"
                        />
                      )}
                      {tab === "plots" ? "Plots" : tab}
                    </button>
                  );
                })}
              </div>

              {/* Execute Search CTA */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.02 }}
                transition={SPRING_SNAPPY}
                onClick={handleSearchSubmit}
                className="h-11 px-5 rounded-full pakizzle-button-primary !text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 min-h-[44px]"
              >
                <Search className="w-3.5 h-3.5 text-white" />
                <span>Explore Homes</span>
              </motion.button>
            </div>

            {/* Row 2: Selectors with portal FilterPopover */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/15">
              {/* Tablet City Selector */}
              <div className="relative">
                <button
                  ref={tabletCityTriggerRef}
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === "tablet-city" ? null : "tablet-city")}
                  className={cn(
                    "w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl bg-black/40 border text-white text-xs font-semibold cursor-pointer transition-colors min-h-[44px]",
                    activeDropdown === "tablet-city" ? "border-apple-blue bg-black/60 ring-1 ring-apple-blue" : "border-white/15 hover:bg-black/50"
                  )}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-white/70 shrink-0" />
                    <span className="truncate">{selectedCity || "All Pakistan"}</span>
                  </div>
                  <ChevronDown className={cn("w-3 h-3 text-white/60 shrink-0 transition-transform", activeDropdown === "tablet-city" && "rotate-180")} />
                </button>

                <FilterPopover
                  isOpen={activeDropdown === "tablet-city"}
                  onClose={() => setActiveDropdown(null)}
                  triggerRef={tabletCityTriggerRef}
                  title="Select City"
                  headerAction={
                    selectedCity && selectedCity !== "All Pakistan" ? (
                      <button
                        type="button"
                        onClick={() => { setSelectedCity("All Pakistan"); setActiveDropdown(null); }}
                        className="text-[10px] font-bold text-apple-blue hover:underline cursor-pointer"
                      >
                        Reset
                      </button>
                    ) : undefined
                  }
                  width={340}
                  maxHeight={460}
                  contentClassName="p-4 flex flex-col min-h-0 overflow-hidden"
                >
                  <div className="relative mb-3">
                    <Search className="w-3.5 h-3.5 text-apple-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search Pakistan city..."
                      value={heroCitySearch}
                      onChange={(e) => setHeroCitySearch(e.target.value)}
                      className="w-full pl-8.5 pr-3 py-2 rounded-xl bg-apple-gray text-xs font-semibold text-apple-text border border-transparent focus:border-apple-blue outline-none"
                    />
                  </div>

                  <div className="mb-3">
                    <span className="text-[10px] font-bold text-apple-text-muted uppercase tracking-wider block mb-1.5">Top Metros</span>
                    <div className="flex flex-wrap gap-1.5">
                      {heroFilteredPopular.map((c) => {
                        const isSelected = selectedCity === c.name;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setSelectedCity(c.name);
                              setActiveDropdown(null);
                            }}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer",
                              isSelected
                                ? "bg-apple-blue text-white border-transparent shadow-xs font-bold"
                                : "bg-apple-surface text-apple-text border-apple-border hover:border-apple-blue/50"
                            )}
                          >
                            {c.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div 
                    className="max-h-60 overflow-y-auto space-y-1 pr-1.5 border-t border-apple-border pt-2 custom-scrollbar"
                  >
                    <button
                      type="button"
                      onClick={() => { setSelectedCity("All Pakistan"); setActiveDropdown(null); }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors",
                        selectedCity === "All Pakistan" 
                          ? "bg-apple-blue/10 text-apple-blue font-bold" 
                          : "text-apple-text hover:bg-apple-gray"
                      )}
                    >
                      <span>All over Pakistan</span>
                      {selectedCity === "All Pakistan" && <Check className="w-3.5 h-3.5 text-apple-blue" />}
                    </button>

                    {heroOtherCities.map((c) => {
                      const isSelected = selectedCity === c.name;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedCity(c.name);
                            setActiveDropdown(null);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between cursor-pointer transition-colors",
                            isSelected 
                              ? "bg-apple-blue/10 text-apple-blue font-bold" 
                              : "text-apple-text hover:bg-apple-gray"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-apple-text-muted" />
                            <span>{c.name}</span>
                          </div>
                          <span className="text-[10px] text-apple-text-muted font-normal">{c.province}</span>
                        </button>
                      );
                    })}

                    <div className="pt-2 pb-1 text-center border-t border-apple-border mt-2">
                      <span className="text-[10px] font-bold text-apple-text-muted block">
                        ✓ All 15 metropolitan hubs available · End of list
                      </span>
                    </div>
                  </div>
                </FilterPopover>
              </div>

              {/* Tablet Property Type */}
              <div className="relative">
                <button
                  ref={tabletTypeTriggerRef}
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === "tablet-type" ? null : "tablet-type")}
                  className={cn(
                    "w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl bg-black/40 border text-white text-xs font-semibold cursor-pointer transition-colors min-h-[44px]",
                    activeDropdown === "tablet-type" ? "border-apple-blue bg-black/60 ring-1 ring-apple-blue" : "border-white/15 hover:bg-black/50"
                  )}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Building2 className="w-3.5 h-3.5 text-white/70 shrink-0" />
                    <span className="truncate">{selectedType || "All Types"}</span>
                  </div>
                  <ChevronDown className={cn("w-3 h-3 text-white/60 shrink-0 transition-transform", activeDropdown === "tablet-type" && "rotate-180")} />
                </button>

                <FilterPopover
                  isOpen={activeDropdown === "tablet-type"}
                  onClose={() => setActiveDropdown(null)}
                  triggerRef={tabletTypeTriggerRef}
                  title="Property Type"
                  headerAction={
                    selectedType ? (
                      <button
                        type="button"
                        onClick={() => { setSelectedType(""); setActiveDropdown(null); }}
                        className="text-[10px] font-bold text-apple-blue hover:underline cursor-pointer"
                      >
                        Reset
                      </button>
                    ) : undefined
                  }
                  width={280}
                  maxHeight={420}
                >
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => { setSelectedType(""); setActiveDropdown(null); }}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors",
                        !selectedType 
                          ? "bg-apple-blue/15 text-apple-blue font-bold" 
                          : "text-apple-text hover:bg-apple-gray"
                      )}
                    >
                      <span>All Property Types</span>
                      {!selectedType && <Check className="w-3.5 h-3.5 text-apple-blue" />}
                    </button>
                    {schemaTypes.map((t) => {
                      const isSelected = selectedType.toLowerCase() === t.slug.toLowerCase() || selectedType.toLowerCase() === t.name.toLowerCase();
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setSelectedType(t.name);
                            setActiveDropdown(null);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors",
                            isSelected
                              ? "bg-apple-blue/15 text-apple-blue font-bold"
                              : "text-apple-text hover:bg-apple-gray"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-apple-text-muted" />
                            <span>{t.name}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-apple-blue" />}
                        </button>
                      );
                    })}
                  </div>
                </FilterPopover>
              </div>

              {/* Tablet Price Range */}
              <div className="relative">
                <button
                  ref={tabletPriceTriggerRef}
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === "tablet-price" ? null : "tablet-price")}
                  className={cn(
                    "w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl bg-black/40 border text-white text-xs font-semibold cursor-pointer transition-colors min-h-[44px]",
                    activeDropdown === "tablet-price" ? "border-apple-blue bg-black/60 ring-1 ring-apple-blue" : "border-white/15 hover:bg-black/50"
                  )}
                >
                  <div className="flex items-center gap-1 truncate">
                    <span className="text-[10px] font-bold text-white/70">PKR</span>
                    <span className="truncate">{PRICE_PRESETS[selectedPriceIdx].label}</span>
                  </div>
                  <ChevronDown className={cn("w-3 h-3 text-white/60 shrink-0 transition-transform", activeDropdown === "tablet-price" && "rotate-180")} />
                </button>

                <FilterPopover
                  isOpen={activeDropdown === "tablet-price"}
                  onClose={() => setActiveDropdown(null)}
                  triggerRef={tabletPriceTriggerRef}
                  title="Price Range (PKR)"
                  headerAction={
                    selectedPriceIdx !== 0 ? (
                      <button
                        type="button"
                        onClick={() => { setSelectedPriceIdx(0); setActiveDropdown(null); }}
                        className="text-[10px] font-bold text-apple-blue hover:underline cursor-pointer"
                      >
                        Reset
                      </button>
                    ) : undefined
                  }
                  width={280}
                  maxHeight={420}
                >
                  <div className="space-y-1">
                    {PRICE_PRESETS.map((p, idx) => {
                      const isSelected = selectedPriceIdx === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedPriceIdx(idx);
                            setActiveDropdown(null);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors",
                            isSelected
                              ? "bg-apple-blue/15 text-apple-blue font-bold"
                              : "text-apple-text hover:bg-apple-gray"
                          )}
                        >
                          <span>{p.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-apple-blue" />}
                        </button>
                      );
                    })}
                  </div>
                </FilterPopover>
              </div>
            </div>
          </div>

          {/* 3. DESKTOP (1024px+): Full Floating Capsule Cockpit (photo-glass-panel, min-h-[44px] controls) */}
          <div className="hidden lg:flex w-full max-w-4xl photo-glass-panel rounded-full p-2 pl-4 pr-2 items-center justify-between gap-2 shadow-2xl min-h-[52px]">
            {/* Buy / Rent / Plots Segmented Toggle with layoutId Glide */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shrink-0 relative">
              {(["buy", "rent", "plots"] as const).map((tab) => {
                const isSelected = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "relative px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors duration-200 z-10 cursor-pointer min-h-[44px] flex items-center",
                      isSelected ? "text-black font-bold" : "text-white/80 hover:text-white"
                    )}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="hero-active-tab-pill"
                        transition={SPRING_TACTILE}
                        className="absolute inset-0 bg-white rounded-full shadow-md z-[-1]"
                      />
                    )}
                    {tab === "plots" ? "Plots" : tab}
                  </button>
                );
              })}
            </div>

            {/* City Segment - Connected to portal FilterPopover */}
            <div className="relative shrink-0">
              <button
                ref={heroCityTriggerRef}
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "city" ? null : "city")}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-l border-white/20 transition-all cursor-pointer text-xs font-semibold text-white hover:bg-white/10 min-h-[44px]",
                  activeDropdown === "city" && "bg-white/15 ring-1 ring-white/30"
                )}
              >
                <MapPin className="w-3.5 h-3.5 text-white/70 shrink-0" />
                <span className="truncate max-w-[120px]">{selectedCity || "All Pakistan"}</span>
                <ChevronDown className={cn("w-3 h-3 text-white/60 transition-transform", activeDropdown === "city" && "rotate-180")} />
              </button>

              <FilterPopover
                isOpen={activeDropdown === "city"}
                onClose={() => setActiveDropdown(null)}
                triggerRef={heroCityTriggerRef}
                title="Select City"
                headerAction={
                  selectedCity && selectedCity !== "All Pakistan" ? (
                    <button
                      type="button"
                      onClick={() => { setSelectedCity("All Pakistan"); setActiveDropdown(null); }}
                      className="text-[10px] font-bold text-apple-blue hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  ) : undefined
                }
                width={360}
                maxHeight={480}
                contentClassName="p-4 flex flex-col min-h-0 overflow-hidden"
              >
                {/* Search input for cities */}
                <div className="relative mb-3">
                  <Search className="w-3.5 h-3.5 text-apple-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search Pakistan city..."
                    value={heroCitySearch}
                    onChange={(e) => setHeroCitySearch(e.target.value)}
                    className="w-full pl-8.5 pr-3 py-2 rounded-xl bg-apple-gray text-xs font-semibold text-apple-text border border-transparent focus:border-apple-blue outline-none"
                  />
                </div>

                {/* Pinned Most-Searched Cities */}
                <div className="mb-3">
                  <span className="text-[10px] font-bold text-apple-text-muted uppercase tracking-wider block mb-1.5">Top Metros</span>
                  <div className="flex flex-wrap gap-1.5">
                    {heroFilteredPopular.map((c) => {
                      const isSelected = selectedCity === c.name;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedCity(c.name);
                            setActiveDropdown(null);
                          }}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer",
                            isSelected
                              ? "bg-apple-blue text-white border-transparent shadow-xs font-bold"
                              : "bg-apple-surface text-apple-text border-apple-border hover:border-apple-blue/50"
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
                  className="max-h-64 overflow-y-auto space-y-1 pr-1.5 border-t border-apple-border pt-2 custom-scrollbar"
                >
                  <button
                    type="button"
                    onClick={() => { setSelectedCity("All Pakistan"); setActiveDropdown(null); }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors",
                      selectedCity === "All Pakistan" 
                        ? "bg-apple-blue/10 text-apple-blue font-bold" 
                        : "text-apple-text hover:bg-apple-gray"
                    )}
                  >
                    <span>All over Pakistan</span>
                    {selectedCity === "All Pakistan" && <Check className="w-3.5 h-3.5 text-apple-blue" />}
                  </button>

                  {heroOtherCities.map((c) => {
                    const isSelected = selectedCity === c.name;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedCity(c.name);
                          setActiveDropdown(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between cursor-pointer transition-colors",
                          isSelected 
                            ? "bg-apple-blue/10 text-apple-blue font-bold" 
                            : "text-apple-text hover:bg-apple-gray"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-apple-text-muted" />
                          <span>{c.name}</span>
                        </div>
                        <span className="text-[10px] text-apple-text-muted font-normal">{c.province}</span>
                      </button>
                    );
                  })}

                  {/* Explicit End-of-List Indicator: Confirms full list is accessible and scrolled */}
                  <div className="pt-2.5 pb-1 text-center border-t border-apple-border mt-2">
                    <span className="text-[10px] font-bold text-apple-text-muted block">
                      ✓ All 15 metropolitan hubs available · End of list
                    </span>
                  </div>
                </div>
              </FilterPopover>
            </div>

            {/* Property Type Segment - Connected to portal FilterPopover */}
            <div className="relative shrink-0">
              <button
                ref={heroTypeTriggerRef}
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "type" ? null : "type")}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-l border-white/20 transition-all cursor-pointer text-xs font-semibold text-white hover:bg-white/10 min-h-[44px]",
                  activeDropdown === "type" && "bg-white/15 ring-1 ring-white/30"
                )}
              >
                <Building2 className="w-3.5 h-3.5 text-white/70 shrink-0" />
                <span className="truncate max-w-[120px]">{selectedType || "All Properties"}</span>
                <ChevronDown className={cn("w-3 h-3 text-white/60 transition-transform", activeDropdown === "type" && "rotate-180")} />
              </button>

              <FilterPopover
                isOpen={activeDropdown === "type"}
                onClose={() => setActiveDropdown(null)}
                triggerRef={heroTypeTriggerRef}
                title="Property Type"
                headerAction={
                  selectedType ? (
                    <button
                      type="button"
                      onClick={() => { setSelectedType(""); setActiveDropdown(null); }}
                      className="text-[10px] font-bold text-apple-blue hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  ) : undefined
                }
                width={300}
                maxHeight={440}
              >
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => { setSelectedType(""); setActiveDropdown(null); }}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors",
                      !selectedType 
                        ? "bg-apple-blue/15 text-apple-blue font-bold" 
                        : "text-apple-text hover:bg-apple-gray"
                    )}
                  >
                    <span>All Property Types</span>
                    {!selectedType && <Check className="w-3.5 h-3.5 text-apple-blue" />}
                  </button>
                  {schemaTypes.map((t) => {
                    const isSelected = selectedType.toLowerCase() === t.slug.toLowerCase() || selectedType.toLowerCase() === t.name.toLowerCase();
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setSelectedType(t.name);
                          setActiveDropdown(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors",
                          isSelected
                            ? "bg-apple-blue/15 text-apple-blue font-bold"
                            : "text-apple-text hover:bg-apple-gray"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-apple-text-muted" />
                          <span>{t.name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-apple-blue" />}
                      </button>
                    );
                  })}
                </div>
              </FilterPopover>
            </div>

            {/* Price Range Segment - Connected to portal FilterPopover */}
            <div className="relative shrink-0">
              <button
                ref={heroPriceTriggerRef}
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "price" ? null : "price")}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-l border-white/20 transition-all cursor-pointer text-xs font-semibold text-white hover:bg-white/10 min-h-[44px]",
                  activeDropdown === "price" && "bg-white/15 ring-1 ring-white/30"
                )}
              >
                <span className="text-[11px] font-bold text-white/70">PKR</span>
                <span className="truncate max-w-[120px]">{PRICE_PRESETS[selectedPriceIdx].label}</span>
                <ChevronDown className={cn("w-3 h-3 text-white/60 transition-transform", activeDropdown === "price" && "rotate-180")} />
              </button>

              <FilterPopover
                isOpen={activeDropdown === "price"}
                onClose={() => setActiveDropdown(null)}
                triggerRef={heroPriceTriggerRef}
                title="Price Range (PKR)"
                headerAction={
                  selectedPriceIdx !== 0 ? (
                    <button
                      type="button"
                      onClick={() => { setSelectedPriceIdx(0); setActiveDropdown(null); }}
                      className="text-[10px] font-bold text-apple-blue hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  ) : undefined
                }
                width={300}
                maxHeight={440}
              >
                <div className="space-y-1">
                  {PRICE_PRESETS.map((p, idx) => {
                    const isSelected = selectedPriceIdx === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedPriceIdx(idx);
                          setActiveDropdown(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors",
                          isSelected
                            ? "bg-apple-blue/15 text-apple-blue font-bold"
                            : "text-apple-text hover:bg-apple-gray"
                        )}
                      >
                        <span>{p.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-apple-blue" />}
                      </button>
                    );
                  })}
                </div>
              </FilterPopover>
            </div>

            {/* Execute Search Capsule Button with Tactile Press Spring */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              transition={SPRING_SNAPPY}
              onClick={handleSearchSubmit}
              className="h-11 px-6 rounded-full pakizzle-button-primary !text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 ml-auto min-h-[44px]"
            >
              <Search className="w-3.5 h-3.5 text-white" />
              <span>Explore Homes</span>
            </motion.button>
          </div>
        </motion.div>

        {/* 
          CENTERPIECE: FLUID DISPLAY HEADLINE DIRECTLY OVER IMAGERY
          Part 4: Single gold highlight word (#C9A227 >= 3:1 on scrim), rest neutral white.
        */}
        <motion.div 
          style={{
            y: shouldReduceMotion ? 0 : fgY,
            opacity: shouldReduceMotion ? 1 : fgOpacity
          }}
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: REVEAL_EASE }}
          className="relative z-10 max-w-3xl my-auto py-6 sm:py-10 lg:pl-16 will-change-transform"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full photo-glass-panel text-white text-[11px] sm:text-xs font-semibold tracking-wide mb-3 sm:mb-4">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-apple-green shrink-0" />
            <span className="truncate">Pakistan's 100% Registry-Verified Land Portal</span>
          </div>

          <h1 className="phi-h1 font-extrabold text-white tracking-tight drop-shadow-md text-balance">
            Architectural Sanctuaries. <br />
            <span className="text-white drop-shadow-sm font-extrabold">
              Title Guaranteed.
            </span>
          </h1>

          <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-white/90 max-w-xl font-normal leading-relaxed drop-shadow">
            Experience Pakistan's most refined residential estates. Each property is pre-vetted against LDA, CDA & DHA land deeds with zero broker manipulation.
          </p>
        </motion.div>

        {/* 
          BOTTOM ROW: GOLDEN RATIO 61.8% / 38.2% ASYMMETRICAL DUAL GLASS PANELS
          - Desktop (1024px+): Exact Golden Split (Right Showcase Card: 61.8%, Left Metric Panel: 38.2%)
          - Mobile / Tablet: Responsive ergonomic stack
        */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.3, ease: REVEAL_EASE }}
          className="relative z-20 flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch lg:items-end lg:pl-16 w-full"
        >
          {/* Bottom-Left: Value Metric & Verification Guarantee Glass Panel (Golden Ratio: 38.2%) */}
          <div className="order-2 lg:order-1 w-full lg:w-[38.2%] shrink-0 photo-glass-panel rounded-2xl sm:rounded-[28px] p-4 sm:p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-2.5 border-b border-white/20 mb-2.5">
              <span className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-white/70">
                Network Liquidity
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-apple-green bg-apple-green/15 px-2 py-0.5 rounded-full border border-apple-green/30">
                Live Audited
              </span>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-mono tracking-tight text-white">
                <AnimatedCounter value={15200} suffix="+" duration={1.2} />
              </span>
              <span className="text-xs font-medium text-white/80">Verified Deeds</span>
            </div>

            <p className="text-[11px] sm:text-xs text-white/75 mt-1.5 sm:mt-2 leading-relaxed">
              Every home undergoes 4-tier title verification including non-encumbrance certificates and biometric seller validation.
            </p>

            <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-white/15 flex items-center justify-between">
              <button 
                onClick={() => setIsValuationOpen(true)}
                className="text-xs font-semibold text-white/80 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Property Valuation</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>

              <div className="flex items-center gap-1">
                {HERO_HEROES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    aria-label={`Slide ${i + 1}`}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300 cursor-pointer min-w-[6px]",
                      i === currentIdx ? "w-5 sm:w-6 bg-white" : "w-1.5 bg-white/40"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom-Right: Active Hero Property Showcase Card (Golden Ratio: 61.8% container & 1.618:1 showcase aspect ratio) */}
          <div className="order-1 lg:order-2 w-full lg:w-[61.8%] shrink-0 photo-glass-panel rounded-2xl sm:rounded-[28px] p-3.5 sm:p-5 text-white shadow-2xl glass-hover-sheen group border border-[#C9A227]/50">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
              {/* Thumbnail with Golden Ratio (1:1.618) aspect ratio container */}
              <div className="relative w-full sm:w-44 md:w-52 aspect-[1.618/1] rounded-xl sm:rounded-[20px] overflow-hidden shrink-0 border border-white/40 shadow-inner">
                <img
                  src={activeHero.image}
                  alt={activeHero.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[8px] sm:text-[9px] font-bold text-[#C9A227] border border-[#C9A227]/40">
                  Featured
                </div>
              </div>

              {/* Information Cluster */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] sm:text-[11px] font-semibold text-white/90 truncate">
                    {activeHero.tag}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsLiked(!isLiked)}
                      className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white/90 cursor-pointer touch-target min-w-[36px] min-h-[36px]"
                      title="Save property"
                    >
                      <Heart className={cn("w-3.5 h-3.5", isLiked ? "fill-apple-red text-apple-red" : "")} />
                    </button>
                    <button 
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: activeHero.title, url: window.location.href });
                        }
                      }}
                      className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white/90 cursor-pointer touch-target min-w-[36px] min-h-[36px]"
                      title="Share property"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-xs sm:text-sm md:text-base font-bold text-white tracking-tight truncate mt-0.5">
                  {activeHero.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-white/80 truncate flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-white/70 shrink-0" />
                  <span>{activeHero.subtitle}</span>
                </p>

                <div className="mt-1.5 sm:mt-2 flex items-center justify-between pt-1.5 sm:pt-2 border-t border-white/15">
                  <div 
                    className="text-xs sm:text-sm md:text-base font-extrabold text-white whitespace-nowrap [font-variant-numeric:tabular-nums]"
                    title={formatExactPrice(activeHero.numericPrice || activeHero.price)}
                    aria-label={`Price: ${formatExactPrice(activeHero.numericPrice || activeHero.price)}`}
                  >
                    <span className="sr-only">{formatExactPrice(activeHero.numericPrice || activeHero.price)}</span>
                    <span aria-hidden="true">{formatPrice(activeHero.numericPrice || activeHero.price)}</span>
                  </div>

                  {activeHero.specs.beds > 0 && (
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-white/80">
                      <span className="flex items-center gap-0.5">
                        <Bed className="w-3 h-3 text-white/60" /> {activeHero.specs.beds}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <Bath className="w-3 h-3 text-white/60" /> {activeHero.specs.baths}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <Maximize2 className="w-3 h-3 text-white/60" /> {activeHero.specs.area}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Valuation Modal Integration */}
      {isValuationOpen && (
        <ValuationModal isOpen={isValuationOpen} onClose={() => setIsValuationOpen(false)} />
      )}

      {/* FULL-SCREEN MOBILE SEARCH GLASS SHEET MODAL (<768px) */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <div className="fixed inset-0 z-[120] md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSearchOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Bottom Sheet Container */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className="absolute bottom-0 inset-x-0 max-h-[92vh] bg-apple-surface rounded-t-[32px] border-t border-apple-border shadow-2xl flex flex-col overflow-hidden"
              style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom, 0px))" }}
            >
              {/* Drag Handle */}
              <div className="w-12 h-1.5 bg-apple-border rounded-full mx-auto my-3 shrink-0" />

              {/* Sheet Header */}
              <div className="flex items-center justify-between px-6 pb-3 border-b border-apple-border">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-apple-blue" />
                  <h3 className="text-base font-bold text-apple-text">
                    Search Properties
                  </h3>
                </div>
                <button
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-apple-gray transition-colors text-apple-text-muted hover:text-apple-text cursor-pointer touch-target"
                  title="Close search modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sheet Scrollable Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* 1. Purpose: Buy / Rent / Plots */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-apple-text-muted block mb-2.5">
                    Property Purpose
                  </label>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-apple-gray rounded-2xl border border-black/5 dark:border-white/5">
                    {(["buy", "rent", "plots"] as const).map((tab) => {
                      const isSelected = activeTab === tab;
                      return (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={cn(
                            "py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer min-h-[44px] flex items-center justify-center",
                            isSelected
                              ? "bg-apple-surface text-apple-blue shadow-sm font-bold"
                              : "text-apple-text-muted"
                          )}
                        >
                          {tab === "plots" ? "Plots" : tab}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. City Selection */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-apple-text-muted block mb-2.5">
                    Location / City
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-apple-blue absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full h-12 pl-11 pr-10 rounded-2xl bg-apple-surface border border-apple-border text-sm font-semibold text-apple-text focus:outline-none focus:border-apple-blue appearance-none cursor-pointer"
                    >
                      {MAJOR_CITIES.map((c) => (
                        <option key={c} value={c} className="bg-apple-surface text-apple-text">
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-apple-text-muted absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 3. Property Type */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-apple-text-muted block mb-2.5">
                    Property Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PROPERTY_TYPES.map((t) => {
                      const isSelected = selectedType === t.value;
                      return (
                        <button
                          key={t.label}
                          onClick={() => setSelectedType(isSelected ? "" : t.value)}
                          className={cn(
                            "px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all min-h-[44px] flex items-center justify-between cursor-pointer",
                            isSelected
                              ? "bg-apple-blue/10 border-apple-blue text-apple-blue shadow-xs font-bold"
                              : "bg-apple-surface border-apple-border text-apple-text"
                          )}
                        >
                          <span className="truncate">{t.label}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-apple-blue shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Price Presets */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-apple-text-muted block mb-2.5">
                    Price Range (PKR)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRICE_PRESETS.map((p, idx) => {
                      const isSelected = selectedPriceIdx === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedPriceIdx(idx)}
                          className={cn(
                            "px-3 py-2.5 rounded-xl border text-xs font-semibold text-center transition-all min-h-[44px] flex items-center justify-center cursor-pointer",
                            isSelected
                              ? "bg-apple-blue/10 border-apple-blue text-apple-blue shadow-xs font-bold"
                              : "bg-apple-surface border-apple-border text-apple-text"
                          )}
                        >
                          <span>{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sheet Bottom Sticky Action CTA */}
              <div className="p-5 border-t border-apple-border bg-apple-surface/90 backdrop-blur-md">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  transition={SPRING_SNAPPY}
                  onClick={() => {
                    setIsMobileSearchOpen(false);
                    handleSearchSubmit();
                  }}
                  className="w-full h-12 rounded-2xl pakizzle-button-primary text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer min-h-[48px]"
                >
                  <Search className="w-4 h-4" />
                  <span>Explore Verified Properties</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
