import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  ArrowUpRight
} from "lucide-react";
import { cn } from "../lib/utils";
import { bannerService } from "../services/bannerService";
import { Banner } from "../types";
import { useLocation as useAppLocation } from "../context/LocationContext";
import { useTheme } from "../context/ThemeContext";
import { PAKISTAN_LOCATIONS } from "../constants/locations";
import ValuationModal from "./ValuationModal";
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

  const navigate = useNavigate();
  const { location: userLocation } = useAppLocation();
  const { theme, toggleTheme } = useTheme();

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
    <section className="relative w-full min-h-[92vh] flex items-center justify-center p-3 sm:p-5 md:p-8 pt-20 md:pt-24 overflow-hidden">
      {/* 
        DEVICE FRAME CONTAINER:
        Large rounded container gives the entire viewport a futuristic, continuous OS-level device window feeling
      */}
      <div className="relative w-full max-w-[1440px] min-h-[82vh] rounded-[32px] sm:rounded-[40px] md:rounded-[48px] overflow-hidden border border-white/30 dark:border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.25)] flex flex-col justify-between p-4 sm:p-8 md:p-12">
        
        {/* Full-bleed rich cinematic photographic layer with slow Ken Burns effect */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeHero.id}
              src={activeHero.image}
              alt={activeHero.title}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full object-cover object-center animate-ken-burns"
            />
          </AnimatePresence>
          {/* Subtle gradient vignette to guarantee text legibility while preserving photographic transparency */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-slate-950/50 pointer-events-none" />
        </div>

        {/* 
          FLOATING GLASS RAIL (Left Vertical Stack)
          OS-style floating circular glass controls rail 
        */}
        <aside className="absolute left-4 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-center gap-3 p-2.5 rounded-full liquid-glass-subtle shadow-xl">
          <button 
            onClick={() => navigate("/")}
            title="Home" 
            className="w-11 h-11 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/20 transition-all active:scale-90"
          >
            <Home className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate("/marketplace")}
            title="Explore Properties" 
            className="w-11 h-11 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/20 transition-all active:scale-90"
          >
            <Compass className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsValuationOpen(true)}
            title="AI Valuation" 
            className="w-11 h-11 rounded-full flex items-center justify-center text-amber-300 hover:text-amber-200 hover:bg-white/20 transition-all active:scale-90"
          >
            <Sparkles className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate("/chat")}
            title="Chat & Concierge" 
            className="w-11 h-11 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/20 transition-all active:scale-90"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate("/notifications")}
            title="Notifications" 
            className="w-11 h-11 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/20 transition-all active:scale-90"
          >
            <Bell className="w-5 h-5" />
          </button>
          <div className="w-6 h-[1px] bg-white/20 my-1" />
          <button 
            onClick={toggleTheme}
            title="Toggle Light / Dark" 
            className="w-11 h-11 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/20 transition-all active:scale-90"
          >
            {theme === "dark" ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5 text-teal-300" />}
          </button>
          <button 
            onClick={() => navigate("/profile")}
            title="Account Profile" 
            className="w-11 h-11 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/20 transition-all active:scale-90"
          >
            <User className="w-5 h-5" />
          </button>
        </aside>

        {/* 
          TOP ROW: FLOATING CAPSULE SEARCH COCKPIT 
          Segmented floating glass capsule matching reference OS aesthetics
        */}
        <div className="relative z-20 w-full flex justify-center">
          <div className="w-full max-w-4xl liquid-glass-mid rounded-full p-2 pl-3 sm:pl-5 pr-2 flex flex-wrap lg:flex-nowrap items-center justify-between gap-2 shadow-2xl">
            {/* Buy / Rent / Plots Segmented Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-black/20 backdrop-blur-md border border-white/10 shrink-0">
              {(["buy", "rent", "plots"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300",
                    activeTab === tab
                      ? "bg-white text-slate-900 shadow-md font-bold scale-102"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  {tab === "plots" ? "Plots" : tab}
                </button>
              ))}
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
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border-l border-white/20 shrink-0">
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
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 border-l border-white/20 shrink-0">
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

            {/* Execute Search Capsule Button */}
            <button
              onClick={handleSearchSubmit}
              className="h-10 px-5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-teal-950/40 border border-teal-300/40 transition-all active:scale-95 cursor-pointer glass-hover-sheen shrink-0 ml-auto"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Explore Homes</span>
            </button>
          </div>
        </div>

        {/* 
          CENTERPIECE: OVERSIZED DISPLAY HEADLINE DIRECTLY OVER IMAGERY
          Clean, confident typography floating on the scenery without card backing
        */}
        <div className="relative z-10 max-w-3xl my-auto py-8 sm:py-12 lg:pl-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-subtle text-teal-300 text-xs font-semibold tracking-wide mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Pakistan's 100% Registry-Verified Land Portal</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.05] drop-shadow-md">
            Architectural Sanctuaries. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-100 to-teal-300">
              Title Guaranteed.
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base md:text-lg text-white/85 max-w-xl font-normal leading-relaxed drop-shadow">
            Experience Pakistan's most refined residential estates. Each property is pre-vetted against LDA, CDA & DHA land deeds with zero broker manipulation.
          </p>
        </div>

        {/* 
          BOTTOM ROW: ASYMMETRICAL DUAL GLASS PANELS
          Bottom-Left Value Prop Card + Bottom-Right Featured Architectural Masterpiece Card
        */}
        <div className="relative z-20 grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 items-end lg:pl-16">
          
          {/* Bottom-Left: Value Metric & Verification Guarantee Glass Panel */}
          <div className="md:col-span-5 lg:col-span-4 liquid-glass-foreground rounded-[28px] p-5 sm:p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/20 mb-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-white/70">
                Network Liquidity
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Live Audited
              </span>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white">
                15,200+
              </span>
              <span className="text-xs font-medium text-white/80">Verified Deeds</span>
            </div>

            <p className="text-xs text-white/75 mt-2 leading-relaxed">
              Every home undergoes 4-tier title verification including non-encumbrance certificates and biometric seller validation.
            </p>

            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between">
              <button 
                onClick={() => setIsValuationOpen(true)}
                className="text-xs font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 transition-colors"
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
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === currentIdx ? "w-6 bg-teal-300" : "w-1.5 bg-white/40"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-1 lg:col-span-3" />

          {/* Bottom-Right: Single Featured Property Glass Spotlight (Matching Reference "Lunar Oasis" Card) */}
          <div className="md:col-span-6 lg:col-span-5 liquid-glass-foreground rounded-[28px] p-4 sm:p-5 text-white shadow-2xl glass-hover-sheen group">
            <div className="flex gap-4 items-center">
              {/* Thumbnail with floating badge */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[20px] overflow-hidden shrink-0 border border-white/40 shadow-inner">
                <img
                  src={activeHero.image}
                  alt={activeHero.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-bold text-teal-300">
                  Featured
                </div>
              </div>

              {/* Information Cluster */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-semibold text-teal-300 truncate">
                    {activeHero.tag}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsLiked(!isLiked)}
                      className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white/90"
                      title="Save"
                    >
                      <Heart className={cn("w-3.5 h-3.5", isLiked ? "fill-rose-500 text-rose-500" : "")} />
                    </button>
                    <button 
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: activeHero.title, url: window.location.href });
                        }
                      }}
                      className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white/90"
                      title="Share"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-white tracking-tight truncate mt-0.5">
                  {activeHero.title}
                </h4>
                <p className="text-xs text-white/70 truncate flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                  <span>{activeHero.subtitle}</span>
                </p>

                <div className="mt-2 flex items-center justify-between pt-2 border-t border-white/15">
                  <div className="text-sm sm:text-base font-extrabold font-mono text-emerald-300">
                    {activeHero.price}
                  </div>

                  {activeHero.specs.beds > 0 && (
                    <div className="flex items-center gap-2 text-[11px] text-white/80">
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

        </div>

      </div>

      {/* Valuation Modal Integration */}
      {isValuationOpen && (
        <ValuationModal isOpen={isValuationOpen} onClose={() => setIsValuationOpen(false)} />
      )}
    </section>
  );
}
