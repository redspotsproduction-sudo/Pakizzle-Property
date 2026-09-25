import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { MapPin, ArrowRight, Building, Building2, Trees, Compass } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { RevealOnScroll, REVEAL_EASE, SPRING_SNAPPY } from "./motion";

interface CityCardData {
  city: string;
  tagline: string;
  topAreas: string[];
  propertyCount: string;
  avgPrice: string;
  image: string;
  featured?: boolean;
}

const TOP_CITIES: CityCardData[] = [
  {
    city: "Islamabad",
    tagline: "Margalla Hills & CDA Masterplanned Sectors",
    topAreas: ["Sector F-6 & F-7", "Sector E-7", "DHA Phase 2", "Bahria Enclave"],
    propertyCount: "3,840+",
    avgPrice: "Rs 18,500 / Sq.Ft.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    city: "Lahore",
    tagline: "Heart of Punjab: DHA, Gulberg & Cantt",
    topAreas: ["DHA Phase 5 & 6", "Gulberg III", "Model Town", "Bahria Town"],
    propertyCount: "5,120+",
    avgPrice: "Rs 15,200 / Sq.Ft.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    city: "Karachi",
    tagline: "Coastal Metropolis & Oceanfront Living",
    topAreas: ["Clifton Blocks 1-9", "DHA Phases 5-8", "Emaar Crescent Bay", "PECHS"],
    propertyCount: "4,290+",
    avgPrice: "Rs 22,000 / Sq.Ft.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    city: "Rawalpindi",
    tagline: "Twin City Growth Corridor & Cantonments",
    topAreas: ["Bahria Town Phase 7-8", "Chaklala Scheme 3", "Saddar", "Askari 14"],
    propertyCount: "1,680+",
    avgPrice: "Rs 11,400 / Sq.Ft.",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800"
  },
  {
    city: "Peshawar",
    tagline: "Khyber Gateway & Modern Enclaves",
    topAreas: ["Hayatabad Phases 1-7", "DHA Peshawar", "University Town", "Warsak Road"],
    propertyCount: "920+",
    avgPrice: "Rs 10,200 / Sq.Ft.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800"
  },
  {
    city: "Multan",
    tagline: "Southern Punjab Hub & Gated Communities",
    topAreas: ["Buch Villas", "DHA Multan", "Bosan Road", "WAPDA Town"],
    propertyCount: "740+",
    avgPrice: "Rs 8,800 / Sq.Ft.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800"
  }
];

const POPULAR_AREAS = [
  { name: "DHA Phase 6, Lahore", city: "Lahore", query: "DHA Phase 6" },
  { name: "Sector F-7, Islamabad", city: "Islamabad", query: "F-7" },
  { name: "Clifton Block 4, Karachi", city: "Karachi", query: "Clifton" },
  { name: "Bahria Town, Karachi", city: "Karachi", query: "Bahria Town" },
  { name: "Gulberg III, Lahore", city: "Lahore", query: "Gulberg III" },
  { name: "Bahria Town Phase 8, Rawalpindi", city: "Rawalpindi", query: "Bahria Town Phase 8" },
  { name: "DHA Phase 2, Islamabad", city: "Islamabad", query: "DHA Phase 2" },
  { name: "Hayatabad, Peshawar", city: "Peshawar", query: "Hayatabad" }
];

export default function BrowseByCity() {
  const navigate = useNavigate();

  const handleCityClick = (city: string) => {
    navigate(`/marketplace?city=${encodeURIComponent(city)}`);
  };

  const handleAreaClick = (city: string, area: string) => {
    navigate(`/marketplace?city=${encodeURIComponent(city)}&q=${encodeURIComponent(area)}`);
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800">
      {/* Header */}
      <RevealOnScroll direction="up" distance={30} duration={0.6}>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 text-[#0F766E] dark:text-teal-400 text-xs font-semibold uppercase tracking-wider mb-2 border border-teal-200 dark:border-teal-800">
              <Compass className="w-3.5 h-3.5" />
              Location-First Discovery
            </div>
            <h2 className="type-h2 font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              Explore Properties by City & Prime Sectors
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
              Real estate in Pakistan is hyperlocal. Browse masterplanned housing authorities, registered CDA/LDA sectors, and coastal high-rises.
            </p>
          </div>

          <Link 
            to="/marketplace" 
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F766E] dark:text-teal-400 hover:underline shrink-0"
          >
            <span>All 18+ Cities</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </RevealOnScroll>

      {/* Quick Society Shortcuts */}
      <RevealOnScroll direction="up" distance={20} delay={0.1} duration={0.5}>
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Top Sectors:
          </span>
          {POPULAR_AREAS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleAreaClick(item.city, item.query)}
              className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-[#0F766E] dark:hover:text-teal-400 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors whitespace-nowrap cursor-pointer active:scale-95"
            >
              {item.name}
            </button>
          ))}
        </div>
      </RevealOnScroll>

      {/* City Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {TOP_CITIES.map((c, index) => (
          <RevealOnScroll
            key={c.city}
            direction="up"
            distance={45}
            staggerIndex={index}
            staggerInterval={0.07}
            duration={0.6}
          >
            <motion.div
              whileHover={{ 
                y: -6, 
                scale: 1.015,
                boxShadow: "0 20px 32px -8px rgba(0, 0, 0, 0.14)" 
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.28, ease: REVEAL_EASE }}
              onClick={() => handleCityClick(c.city)}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors duration-300 cursor-pointer flex flex-col h-[280px]"
            >
            {/* Image Backdrop */}
            <div className="absolute inset-0 z-0">
              <img
                src={c.image}
                alt={c.city}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-slate-950/20" />
            </div>

            {/* Top Bar with Badge */}
            <div className="relative z-10 p-4 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white backdrop-blur-md">
                <MapPin className="w-3 h-3 text-[#0F766E]" />
                {c.propertyCount} Verified Listings
              </span>
              <span className="text-xs font-medium text-white/80 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
                {c.avgPrice}
              </span>
            </div>

            {/* Bottom Content */}
            <div className="relative z-10 mt-auto p-5 text-white">
              <h3 className="text-2xl font-bold tracking-tight text-white group-hover:text-teal-300 transition-colors">
                {c.city}
              </h3>
              <p className="text-xs text-white/80 font-normal mt-1 line-clamp-1">
                {c.tagline}
              </p>

              {/* Top Sectors in this city */}
              <div className="mt-3 flex items-center flex-wrap gap-1.5">
                {c.topAreas.map((area, aIdx) => (
                  <span 
                    key={aIdx} 
                    className="text-[11px] font-medium text-white/90 bg-white/15 backdrop-blur-sm px-2 py-0.5 rounded"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}
