import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Car, Building, Briefcase, ShoppingBag, ArrowRight, ShieldCheck, HelpCircle, Compass, Globe, Sparkles } from "lucide-react";
import { useLocation } from "../context/LocationContext";
import { CITY_PROVINCE_MAP } from "../constants/locations";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import SEO from "./SEO";

const TOP_CITIES = [
  { id: "karachi", name: "Karachi", province: "Sindh", count: "142k+ active ads", icon: "🌊" },
  { id: "lahore", name: "Lahore", province: "Punjab", count: "128k+ active ads", icon: "🕌" },
  { id: "islamabad", name: "Islamabad", province: "Capital Territory", count: "89k+ active ads", icon: "⛰️" },
  { id: "rawalpindi", name: "Rawalpindi", province: "Punjab", count: "64k+ active ads", icon: "🚉" },
  { id: "faisalabad", name: "Faisalabad", province: "Punjab", count: "48k+ active ads", icon: "⚙️" },
  { id: "multan", name: "Multan", province: "Punjab", count: "39k+ active ads", icon: "🏺" },
  { id: "peshawar", name: "Peshawar", province: "Khyber Pakhtunkhwa", count: "35k+ active ads", icon: "🏔️" },
  { id: "quetta", name: "Quetta", province: "Balochistan", count: "21k+ active ads", icon: "🌋" }
];

type CategoryTab = "motors" | "property-sale" | "property-rent" | "classifieds" | "jobs";

interface CategoryData {
  label: string;
  icon: React.ReactNode;
  links: string[];
  paramCategory: string;
}

export default function CityPortal() {
  const { setLocation } = useLocation();
  const [activeTab, setActiveTab] = useState<CategoryTab>("motors");
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const navigate = useNavigate();

  const CATEGORY_MAP: Record<CategoryTab, CategoryData> = {
    "motors": {
      label: "Motors & Automotive",
      icon: <Car className="w-4 h-4" />,
      links: ["Cars for Sale", "Bikes for Sale", "Auto Accessories", "Commercial Vehicles", "Tractors & Heavy Machinery"],
      paramCategory: "motors"
    },
    "property-sale": {
      label: "Property for Sale",
      icon: <Building className="w-4 h-4" />,
      links: ["Apartments for Sale", "Villas & Houses for Sale", "Residential Plots", "Commercial Plots", "Penthouse Suites"],
      paramCategory: "property-sale"
    },
    "property-rent": {
      label: "Property for Rent",
      icon: <Building className="w-4 h-4 text-emerald-500" />,
      links: ["Apartments for Rent", "Houses for Rent", "Rooms for Rent", "Commercial Rentals", "Office Workspaces"],
      paramCategory: "property-rent"
    },
    "classifieds": {
      label: "Premium Classifieds",
      icon: <ShoppingBag className="w-4 h-4" />,
      links: ["Mobile Phones & Tablets", "Computers & Laptops", "Home Furniture & Decor", "Fashion & Cosmetics", "Sports & Hobbies"],
      paramCategory: "classifieds"
    },
    "jobs": {
      label: "Professional Jobs",
      icon: <Briefcase className="w-4 h-4" />,
      links: ["Sales & Marketing", "Software & IT Developers", "Customer Support", "Drivers & Logistics", "Accounting & Audit"],
      paramCategory: "jobs"
    }
  };

  const handleSelectCity = (cityName: string, targetCategory?: string) => {
    setLocation({
      city: cityName,
      area: `All over ${cityName}`,
      province: CITY_PROVINCE_MAP[cityName] || "Punjab",
      isAutoDetected: false
    });

    if (targetCategory) {
      navigate(`/marketplace?city=${encodeURIComponent(cityName)}&category=${encodeURIComponent(targetCategory)}`);
    } else {
      navigate("/");
    }
  };

  const handleSkipToPakistan = () => {
    setLocation({
      city: "Pakistan",
      province: undefined,
      isAutoDetected: false
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] dark:bg-[#070709] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col justify-between overflow-x-hidden antialiased font-sans">
      <SEO 
        title="Pakistan's Premium Classifieds Hub"
        description="Experience the luxury standard in Pakistan. Buy and sell verified luxury motors, sports supercars, high-end commercial property, rent listings, and elite classifieds in Karachi, Lahore, Islamabad, and beyond."
        keywords={["pakistan classifieds", "pakizzle portals", "karachi cars", "lahore luxury marketplace", "islamabad premium motors", "luxury sports cars pakistan"]}
        canonicalPath="/pakizzle"
        ogType="website"
        schema={{
          "@type": "WebSite",
          "name": "Pakizzle Premium Hub",
          "url": "https://pakizzle.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://pakizzle.com/marketplace?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
      
      {/* Immersive Apple-Style Glassmorphic Banner/Hero Section */}
      <div className="relative w-full py-20 md:py-32 px-6 text-center overflow-hidden bg-gradient-to-b from-[#7A1315] via-[#B12226] to-[#88171A] text-white">
        
        {/* Intricate Ambient Backlight Glowing Orbs & Blur Maps */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.15),transparent)] mix-blend-overlay" />
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-[#E53E3E]/20 blur-[100px] animate-pulse duration-[6000ms]" />
        <div className="absolute top-1/3 -right-20 w-[400px] h-[400px] rounded-full bg-amber-500/15 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] rounded-full bg-[#9B1E21]/40 blur-[140px]" />

        {/* Brand visual header styled with sleek positive elements */}
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center gap-8">
          
          {/* Frosted Pill Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4.5 py-2 rounded-full border border-white/15 bg-white/[0.07] backdrop-blur-2xl shadow-xl text-[11px] font-bold tracking-[0.15em] uppercase text-amber-300 select-none cursor-default"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow shrink-0" />
            <span>Pakistan's Premium Classifieds Hub</span>
          </motion.div>
          
          {/* Main Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-[-0.03em] leading-tight select-none">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-white font-black drop-shadow-sm">Pakizzle</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 font-normal tracking-tight max-w-3xl leading-relaxed mx-auto">
              A high-end, secure marketplace designed for modern Pakistan. Effortlessly acquire verified luxury vehicles, premier estates, verified electronics, and commercial talent.
            </p>
          </motion.div>

          <div className="w-full max-w-sm h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-1" />

          <p className="text-xs md:text-sm text-amber-200/90 uppercase font-bold tracking-[0.2em] select-none">
            Choose your regional hub to begin
          </p>

          {/* 8 Premium Cities Glassmorphism Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full mt-2">
            {TOP_CITIES.map((city) => {
              const isHovered = hoveredCity === city.id;
              return (
                <motion.button
                  key={city.id}
                  onMouseEnter={() => setHoveredCity(city.id)}
                  onMouseLeave={() => setHoveredCity(null)}
                  whileHover={{ scale: 1.04, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectCity(city.name)}
                  className="group relative flex flex-col items-center justify-between p-5 rounded-2xl transition-all duration-300 cursor-pointer h-28 border border-white/10 dark:border-white/[0.06] bg-white/[0.08] hover:bg-white/[0.14] dark:bg-black/[0.15] dark:hover:bg-white/[0.06] backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_20px_48px_rgba(0,0,0,0.25)] select-none text-left"
                >
                  {/* Subtle glass gloss highlight inside button */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/[0.01] to-white/[0.07] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/50 tracking-wider uppercase">
                      hub
                    </span>
                    <span className="text-lg group-hover:scale-110 transition-transform duration-300">
                      {city.icon}
                    </span>
                  </div>

                  <div className="w-full text-center mt-2">
                    <span className="block text-lg md:text-xl font-extrabold text-white tracking-tight drop-shadow-sm">
                      {city.name}
                    </span>
                    <span className="block text-[10px] text-white/60 font-semibold tracking-wide transition-colors group-hover:text-amber-200">
                      {city.count}
                    </span>
                  </div>

                  {/* Absolute subtle bottom indicators */}
                  <div className="absolute bottom-1 right-2 w-1.5 h-1.5 rounded-full bg-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              );
            })}
          </div>

          {/* Premium Map Skip Button */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <button 
              onClick={handleSkipToPakistan}
              className="group inline-flex items-center gap-3 px-8 py-3.5 bg-white/10 hover:bg-white/20 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] backdrop-blur-xl rounded-full font-bold text-sm tracking-tight border border-white/20 hover:border-amber-400/40 shadow-lg text-white transition-all cursor-pointer hover:shadow-amber-400/10"
            >
              <Compass className="w-4 h-4 text-amber-300 group-hover:rotate-45 transition-transform duration-500 shrink-0" />
              <span>Explore All Listings in Pakistan National Hub</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Directory Index & Category Selector Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 w-full flex-1">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            Exchange at Scale with Confidence
          </h2>
          <p className="text-slate-500 dark:text-zinc-400 text-base md:text-lg leading-relaxed font-normal">
            Locate localized bargains and vetted products immediately across Pakistan's major metropolitan zones.
          </p>
        </div>

        {/* Elegant Glassmorphic Category Tab List Selector */}
        <div className="flex justify-center mb-14 overflow-x-auto pb-4 scrollbar-none">
          <div className="flex bg-[#EBF0F5]/50 dark:bg-[#161619]/60 p-1.5 rounded-full border border-slate-250/20 dark:border-zinc-800/45 shadow-inner backdrop-blur-md">
            {(Object.keys(CATEGORY_MAP) as CategoryTab[]).map((tab) => {
              const active = activeTab === tab;
              const meta = CATEGORY_MAP[tab];
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center gap-2.5",
                    active 
                      ? "bg-[#D92128] text-white shadow-[0_4px_16px_rgba(217,33,40,0.35)] scale-102" 
                      : "text-slate-600 dark:text-zinc-400 hover:text-[#1D1D1F] dark:hover:text-white"
                  )}
                >
                  <span className="shrink-0">{meta.icon}</span>
                  <span>{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop-First Directory Listings Col Grid with Apple-aesthetic spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
          {TOP_CITIES.map((city) => (
            <div 
              key={city.id} 
              className="p-6 rounded-3xl border border-[#000000]/05 dark:border-white/[0.02] bg-[#FFFFFF] dark:bg-[#121215]/40 hover:bg-[#F2F4F7]/40 dark:hover:bg-[#1A1A1E]/30 transition-all duration-300 group"
            >
              {/* City Title */}
              <button
                onClick={() => handleSelectCity(city.name, CATEGORY_MAP[activeTab].paramCategory)}
                className="text-lg font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight flex items-center gap-2 cursor-pointer text-left focus:outline-none mb-4 group/btn"
              >
                <span className="group-hover/btn:text-red-500 transition-colors">{city.name}</span>
                <span className="text-[10px] text-slate-400 font-normal">({city.province})</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover/btn:translate-x-1 transition-transform" />
              </button>

              {/* Sub-directories links with premium text adjustments */}
              <ul className="space-y-2.5 border-l border-slate-200/60 dark:border-zinc-800/60 pl-3">
                {CATEGORY_MAP[activeTab].links.map((linkName, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => handleSelectCity(city.name, `${CATEGORY_MAP[activeTab].paramCategory}-${linkName.toLowerCase().replace(/\s+/g, '-')}`)}
                      className="text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors text-left focus:outline-none"
                    >
                      {linkName}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Trust & Security Info Footer */}
      <div className="border-t border-[#1D1D1F]/05 dark:border-white/[0.04] bg-white dark:bg-[#070709] py-10 text-center text-xs text-[#86868B] dark:text-[#86868B]">
        <div className="max-w-5xl mx-auto px-6 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="font-semibold text-left max-w-sm md:max-w-none text-[#86868B] dark:text-zinc-500 leading-normal">
              © 2026 Pakizzle.com Global Hub. Fully integrated with secure double-blind verification, regional geolocation engines, and verified auto-bidding algorithms. 
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 font-bold justify-center">
              <button 
                onClick={handleSkipToPakistan} 
                className="hover:text-red-500 dark:hover:text-white transition-colors cursor-pointer"
              >
                All Pakistan Index
              </button>
              <span className="text-slate-300 dark:text-zinc-800">|</span>
              <a href="/insurance" className="hover:text-[#1D1D1F] dark:hover:text-white transition-colors">
                Premium Car Insurance
              </a>
              <span className="text-slate-300 dark:text-zinc-800">|</span>
              <a href="/inspection" className="hover:text-[#1D1D1F] dark:hover:text-white transition-colors font-bold text-red-500">
                200-Point Diagnostic Inspection
              </a>
            </div>
          </div>
          <div className="h-px bg-[#1D1D1F]/05 dark:bg-white/[0.04]" />
          <p className="text-[10px] text-slate-400 dark:text-zinc-600">
            Apple, Apple Watch, and iPad are trademarks of Apple Inc., registered in the U.S. and other countries. Pakizzle is an independent classifieds network optimized to match design aesthetics.
          </p>
        </div>
      </div>

    </div>
  );
}

