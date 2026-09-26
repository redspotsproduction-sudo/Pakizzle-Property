import React, { useState, useEffect, useRef } from "react";
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
  X
} from "lucide-react";
import { cn } from "../lib/utils";
import { bannerService } from "../services/bannerService";
import { Banner } from "../types";
import { useLocation as useAppLocation } from "../context/LocationContext";
import { useTheme } from "../context/ThemeContext";
import { PAKISTAN_LOCATIONS } from "../constants/locations";
import ValuationModal from "./ValuationModal";
import { AnimatedCounter, REVEAL_EASE, SPRING_TACTILE, SPRING_SNAPPY } from "./motion";
import { GlassPanel, GlassCapsule, GlassButton, GlassCard } from "./ui/GlassPrimitives";

import villaImg from "../assets/images/pakizzle_villa_hero_1790252631072.jpg";
import penthouseImg from "../assets/images/pakizzle_penthouse_waterfront_1790252648589.jpg";
import mansionImg from "../assets/images/pakizzle_islamabad_mansion_1790252663307.jpg";
import plotImg from "../assets/images/pakizzle_plot_masterplan_1790252681010.jpg";

const HERO_HEROES = [
  {
    id: "h-1",
    image: villaImg,
    title: "The Glass Pavilion Villa",
    subtitle: "Phase 6 DHA, Lahore",
    price: "PKR 14.5 Crore",
    specs: { beds: 5, baths: 6, area: "1 Kanal" },
    tag: "LDA Registry Clear",
    tagColor: "emerald"
  },
  {
    id: "h-2",
    image: penthouseImg,
    title: "Panoramic Sky Penthouse",
    subtitle: "Crescent Bay, Karachi",
    price: "PKR 18.2 Crore",
    specs: { beds: 4, baths: 5, area: "5,400 sq.ft" },
    tag: "Emaar Direct Title",
    tagColor: "teal"
  },
  {
    id: "h-3",
    image: mansionImg,
    title: "Margalla Ridgeline Estate",
    subtitle: "Sector F-7/3, Islamabad",
    price: "PKR 28.0 Crore",
    specs: { beds: 6, baths: 7, area: "2 Kanal" },
    tag: "CDA Non-Encumbrance",
    tagColor: "amber"
  },
  {
    id: "h-4",
    image: plotImg,
    title: "Prime Commercial Corner Plot",
    subtitle: "DHA Phase 9 Prism, Lahore",
    price: "PKR 8.75 Crore",
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

  const heroSectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { location: userLocation } = useAppLocation();
  const { theme, toggleTheme } = useTheme();

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
    else if (activeTab === "plots") params.set("make", "Plot");
    else params.set("purpose", "buy");

    if (selectedCity && selectedCity !== "All Pakistan") params.set("city", selectedCity);
    if (selectedType) params.set("make", selectedType);

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
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: REVEAL_EASE }}
              className="w-full h-full object-cover object-center animate-ken-burns"
            />
          </AnimatePresence>
          {/* Subtle gradient vignette to guarantee text legibility while preserving photographic transparency */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-slate-950/50 pointer-events-none" />
        </motion.div>

        {/* 
          FLOATING GLASS RAIL (Left Vertical Stack)
          OS-style floating circular glass controls rail 
        */}
        <aside className="absolute left-4 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-center gap-3 p-2.5 rounded-full liquid-glass-subtle shadow-xl">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            transition={SPRING_SNAPPY}
            onClick={() => navigate("/")}
            title="Home" 
            className="w-11 h-11 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
          >
            <Home className="w-5 h-5" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            transition={SPRING_SNAPPY}
            onClick={() => navigate("/marketplace")}
            title="Explore Properties" 
            className="w-11 h-11 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
          >
            <Compass className="w-5 h-5" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            transition={SPRING_SNAPPY}
            onClick={() => setIsValuationOpen(true)}
            title="AI Valuation" 
            className="w-11 h-11 rounded-full flex items-center justify-center text-amber-300 hover:text-amber-200 hover:bg-white/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-5 h-5" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            transition={SPRING_SNAPPY}
            onClick={() => navigate("/chat")}
            title="Chat & Concierge" 
            className="w-11 h-11 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
          >
            <MessageSquare className="w-5 h-5" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            transition={SPRING_SNAPPY}
            onClick={() => navigate("/notifications")}
            title="Notifications" 
            className="w-11 h-11 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
          >
            <Bell className="w-5 h-5" />
          </motion.button>
          <div className="w-6 h-[1px] bg-white/20 my-1" />
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            transition={SPRING_SNAPPY}
            onClick={toggleTheme}
            title="Toggle Light / Dark" 
            className="w-11 h-11 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
          >
            {theme === "dark" ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5 text-teal-300" />}
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            transition={SPRING_SNAPPY}
            onClick={() => navigate("/profile")}
            title="Account Profile" 
            className="w-11 h-11 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
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
              className="w-full max-w-md h-13 px-4 rounded-full liquid-glass-mid flex items-center justify-between text-white shadow-xl border border-white/25 cursor-pointer touch-target"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-full bg-teal-500/25 flex items-center justify-center shrink-0 border border-teal-300/30">
                  <Search className="w-4 h-4 text-teal-300" />
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
                <SlidersHorizontal className="w-3.5 h-3.5 text-teal-300" />
              </div>
            </motion.button>
          </div>

          {/* 2. TABLET PORTRAIT (768px–1023px): Two-tier Clean Wrapped Cockpit */}
          <div className="hidden md:flex lg:hidden w-full max-w-2xl liquid-glass-mid rounded-3xl p-3 flex-col gap-2.5 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between gap-2">
              {/* Buy / Rent / Plots Segmented Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-full bg-black/30 backdrop-blur-md border border-white/10 shrink-0">
                {(["buy", "rent", "plots"] as const).map((tab) => {
                  const isSelected = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "relative px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors duration-200 cursor-pointer min-h-[36px] flex items-center",
                        isSelected ? "text-slate-900 font-bold" : "text-white/80 hover:text-white"
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
                className="h-10 px-5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg border border-teal-300/40 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Explore Homes</span>
              </motion.button>
            </div>

            {/* Row 2: Selectors */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/15">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/20 border border-white/10">
                <MapPin className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-transparent text-white text-xs font-semibold focus:outline-none appearance-none cursor-pointer w-full"
                >
                  {MAJOR_CITIES.map((c) => (
                    <option key={c} value={c} className="bg-slate-900 text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/20 border border-white/10">
                <Building2 className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-transparent text-white text-xs font-semibold focus:outline-none appearance-none cursor-pointer w-full"
                >
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t.label} value={t.value} className="bg-slate-900 text-white">
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/20 border border-white/10">
                <span className="text-[11px] font-bold text-white/60">PKR</span>
                <select
                  value={selectedPriceIdx}
                  onChange={(e) => setSelectedPriceIdx(Number(e.target.value))}
                  className="bg-transparent text-white text-xs font-semibold focus:outline-none appearance-none cursor-pointer w-full"
                >
                  {PRICE_PRESETS.map((p, idx) => (
                    <option key={idx} value={idx} className="bg-slate-900 text-white">
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 3. DESKTOP (1024px+): Full Floating Capsule Cockpit */}
          <div className="hidden lg:flex w-full max-w-4xl liquid-glass-mid rounded-full p-2 pl-4 pr-2 items-center justify-between gap-2 shadow-2xl border border-white/20">
            {/* Buy / Rent / Plots Segmented Toggle with layoutId Glide */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-black/25 backdrop-blur-md border border-white/10 shrink-0 relative">
              {(["buy", "rent", "plots"] as const).map((tab) => {
                const isSelected = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "relative px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors duration-200 z-10 cursor-pointer min-h-[36px] flex items-center",
                      isSelected ? "text-slate-900 font-bold" : "text-white/80 hover:text-white"
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

            {/* City Segment */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 border-l border-white/20 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-teal-300 shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none appearance-none cursor-pointer pr-4"
              >
                {MAJOR_CITIES.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-white/60 pointer-events-none -ml-3" />
            </div>

            {/* Property Type Segment */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 border-l border-white/20 shrink-0">
              <Building2 className="w-3.5 h-3.5 text-teal-300 shrink-0" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none appearance-none cursor-pointer pr-4"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.label} value={t.value} className="bg-slate-900 text-white">
                    {t.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-white/60 pointer-events-none -ml-3" />
            </div>

            {/* Price Range Segment */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 border-l border-white/20 shrink-0">
              <span className="text-[11px] font-bold text-white/60">PKR</span>
              <select
                value={selectedPriceIdx}
                onChange={(e) => setSelectedPriceIdx(Number(e.target.value))}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none appearance-none cursor-pointer pr-4"
              >
                {PRICE_PRESETS.map((p, idx) => (
                  <option key={idx} value={idx} className="bg-slate-900 text-white">
                    {p.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-white/60 pointer-events-none -ml-3" />
            </div>

            {/* Execute Search Capsule Button with Tactile Press Spring */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              transition={SPRING_SNAPPY}
              onClick={handleSearchSubmit}
              className="h-10 px-5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-teal-950/40 border border-teal-300/40 transition-colors cursor-pointer glass-hover-sheen shrink-0 ml-auto"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Explore Homes</span>
            </motion.button>
          </div>
        </motion.div>

        {/* 
          CENTERPIECE: FLUID DISPLAY HEADLINE DIRECTLY OVER IMAGERY
          Scales continuously with CSS clamp() from 32px on 360px phones to 68px on desktops
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
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full liquid-glass-subtle text-teal-300 text-[11px] sm:text-xs font-semibold tracking-wide mb-3 sm:mb-4">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
            <span className="truncate">Pakistan's 100% Registry-Verified Land Portal</span>
          </div>

          <h1 className="fluid-hero font-extrabold text-white tracking-tight leading-[1.05] drop-shadow-md text-balance">
            Architectural Sanctuaries. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-100 to-teal-300">
              Title Guaranteed.
            </span>
          </h1>

          <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-white/85 max-w-xl font-normal leading-relaxed drop-shadow">
            Experience Pakistan's most refined residential estates. Each property is pre-vetted against LDA, CDA & DHA land deeds with zero broker manipulation.
          </p>
        </motion.div>

        {/* 
          BOTTOM ROW: ASYMMETRICAL DUAL GLASS PANELS (RESPONSIVE STACK)
          - Mobile (<768px): Full-width stacked cards (Featured property card stacked on top of liquidity card)
          - Tablet portrait (768-1023px): 2-column side-by-side cards
          - Desktop (1024px+): Asymmetric dual cards (left 4 cols, right 5 cols)
        */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.3, ease: REVEAL_EASE }}
          className="relative z-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3.5 sm:gap-4 lg:gap-6 items-end lg:pl-16 w-full"
        >
          {/* Bottom-Left: Value Metric & Verification Guarantee Glass Panel */}
          <div className="order-2 md:order-1 md:col-span-1 lg:col-span-4 liquid-glass-foreground rounded-2xl sm:rounded-[28px] p-4 sm:p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-2.5 border-b border-white/20 mb-2.5">
              <span className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-white/70">
                Network Liquidity
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
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
                className="text-xs font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px]"
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
                      i === currentIdx ? "w-5 sm:w-6 bg-teal-300" : "w-1.5 bg-white/40"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Spacer */}
          <div className="hidden lg:block lg:col-span-3" />

          {/* Bottom-Right (or Mobile Stack Top): Featured Property Glass Card */}
          <div className="order-1 md:order-2 md:col-span-1 lg:col-span-5 liquid-glass-foreground rounded-2xl sm:rounded-[28px] p-3.5 sm:p-5 text-white shadow-2xl glass-hover-sheen group w-full">
            <div className="flex gap-3 sm:gap-4 items-center">
              {/* Thumbnail with floating badge */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl sm:rounded-[20px] overflow-hidden shrink-0 border border-white/40 shadow-inner">
                <img
                  src={activeHero.image}
                  alt={activeHero.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[8px] sm:text-[9px] font-bold text-teal-300">
                  Featured
                </div>
              </div>

              {/* Information Cluster */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] sm:text-[11px] font-semibold text-teal-300 truncate">
                    {activeHero.tag}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsLiked(!isLiked)}
                      className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white/90 cursor-pointer touch-target min-w-[36px] min-h-[36px]"
                      title="Save property"
                    >
                      <Heart className={cn("w-3.5 h-3.5", isLiked ? "fill-rose-500 text-rose-500" : "")} />
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
                <p className="text-[11px] sm:text-xs text-white/70 truncate flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                  <span>{activeHero.subtitle}</span>
                </p>

                <div className="mt-1.5 sm:mt-2 flex items-center justify-between pt-1.5 sm:pt-2 border-t border-white/15">
                  <div className="text-xs sm:text-sm md:text-base font-extrabold font-mono text-emerald-300">
                    {activeHero.price}
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
              className="absolute bottom-0 inset-x-0 max-h-[92vh] bg-white dark:bg-[#121622] rounded-t-[32px] border-t border-black/10 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden"
              style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom, 0px))" }}
            >
              {/* Drag Handle */}
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-3 shrink-0" />

              {/* Sheet Header */}
              <div className="flex items-center justify-between px-6 pb-3 border-b border-black/5 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <h3 className="text-base font-bold text-apple-text dark:text-white">
                    Search Properties
                  </h3>
                </div>
                <button
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer touch-target"
                  title="Close search modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sheet Scrollable Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* 1. Purpose: Buy / Rent / Plots */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2.5">
                    Property Purpose
                  </label>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-black/5 dark:border-white/5">
                    {(["buy", "rent", "plots"] as const).map((tab) => {
                      const isSelected = activeTab === tab;
                      return (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={cn(
                            "py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer min-h-[44px] flex items-center justify-center",
                            isSelected
                              ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm"
                              : "text-slate-600 dark:text-slate-400"
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
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2.5">
                    Location / City
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full h-12 pl-11 pr-10 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 appearance-none cursor-pointer"
                    >
                      {MAJOR_CITIES.map((c) => (
                        <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 3. Property Type */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2.5">
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
                              ? "bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-800 dark:text-teal-300 shadow-xs"
                              : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                          )}
                        >
                          <span className="truncate">{t.label}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Price Presets */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2.5">
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
                              ? "bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-800 dark:text-teal-300 shadow-xs"
                              : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
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
              <div className="p-5 border-t border-black/5 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  transition={SPRING_SNAPPY}
                  onClick={() => {
                    setIsMobileSearchOpen(false);
                    handleSearchSubmit();
                  }}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-900/20 cursor-pointer min-h-[48px]"
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
