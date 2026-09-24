import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Zap, Home, Building2, Map, Gem, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { bannerService } from "../services/bannerService";
import { Banner } from "../types";
import { useLocation as useAppLocation } from "../context/LocationContext";

import villaImg from "../assets/images/pakizzle_villa_hero_1790252631072.jpg";
import penthouseImg from "../assets/images/pakizzle_penthouse_waterfront_1790252648589.jpg";
import mansionImg from "../assets/images/pakizzle_islamabad_mansion_1790252663307.jpg";
import plotImg from "../assets/images/pakizzle_plot_masterplan_1790252681010.jpg";

const DEFAULT_BANNERS: Banner[] = [
  {
    id: 'default-1',
    type: 'category',
    image: villaImg,
    name: "Architectural Contemporary Villa · DHA Phase 6",
    status: 'active',
    displayOrder: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'default-2',
    type: 'category',
    image: penthouseImg,
    name: "Emaar Oceanfront Panoramic Penthouse · Karachi",
    status: 'active',
    displayOrder: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'default-3',
    type: 'category',
    image: mansionImg,
    name: "Margalla Ridge Modern Sanctuary · Sector F-7 Islamabad",
    status: 'active',
    displayOrder: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'default-4',
    type: 'category',
    image: plotImg,
    name: "Masterplanned Possession Plots · DHA Phase 9 Prism",
    status: 'active',
    displayOrder: 3,
    createdAt: new Date().toISOString()
  }
];

export default function Hero() {
  const [banners, setBanners] = useState<Banner[]>(DEFAULT_BANNERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();
  const { location: userLocation } = useAppLocation();

  useEffect(() => {
    const unsubscribe = bannerService.subscribeToBanners((data) => {
      const activeBanners = data.filter(b => b.status === 'active');
      
      // Geo-Targeting Engine
      const filteredBanners = activeBanners.filter(banner => {
        // Rule: If a targeting parameter is set, it MUST match the user's location.
        // If multiple parameters are set, ALL must match (AND logic).
        // If a parameter is NOT set, it matches everyone (OR logic for global/fallback).

        // 1. City Targeting
        if (banner.city && banner.city.toLowerCase() !== userLocation?.city?.toLowerCase()) {
          return false;
        }

        // 2. State/Province Targeting
        if (banner.state && banner.state.toLowerCase() !== userLocation?.province?.toLowerCase()) {
          return false;
        }

        // 3. Country Targeting
        if (banner.country && 
            banner.country.toLowerCase() !== 'all' && 
            banner.country.toLowerCase() !== 'global' && 
            banner.country.toLowerCase() !== 'pakistan') {
          // Note: Since we only support Pakistan for now, we assume user is in Pakistan.
          // If we had userLocation.country, we'd compare it here.
          return false;
        }

        return true;
      });

      const targetBanners = filteredBanners.length > 0 ? filteredBanners : DEFAULT_BANNERS;
      
      setBanners(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(targetBanners)) {
          setCurrentIndex(0);
          return targetBanners;
        }
        return prev;
      });
    });
    return () => unsubscribe();
  }, [userLocation?.city, userLocation?.province]);

  useEffect(() => {
    if (isPaused || banners.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, banners.length]);

  const currentBanner = banners[currentIndex];

  if (!currentBanner) return null;

  return (
    <section className="relative pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-1 overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-apple-blue/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-apple-green/5 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
        <div 
          className="relative group mb-1 sm:mb-2 md:mb-3"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="absolute inset-0 bg-apple-blue/10 blur-[100px] rounded-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="relative aspect-video sm:aspect-[16/10] md:aspect-[21/9] w-full max-w-6xl mx-auto rounded-[32px] md:rounded-[48px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.2)] border border-white/20 dark:border-white/5 bg-apple-gray/10 group cursor-pointer"
            onClick={() => {
              if (currentBanner.type === 'category' && currentBanner.targetId) {
                navigate(`/marketplace?categoryId=${currentBanner.targetId}`);
              } else if (currentBanner.type === 'external' && currentBanner.externalLink) {
                window.open(currentBanner.externalLink, '_blank', 'no-referrer');
              } else if (currentBanner.type === 'advertisement' && currentBanner.targetId) {
                navigate(`/vehicle/${currentBanner.targetId}`);
              }
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBanner.id}
                initial={{ opacity: 0, scale: 1.05, filter: 'blur(20px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <motion.img
                  src={currentBanner.image}
                  alt={currentBanner.name}
                  className="w-full h-full object-cover transition-transform duration-10000 linear group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  loading="eager"
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
                
                {/* Architectural Caption */}
                <div className="absolute bottom-12 md:bottom-16 left-6 md:left-14 right-6 md:right-14 text-left z-20 pointer-events-none">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-medium tracking-wide mb-2.5 border border-white/20">
                    <Sparkles className="w-3.5 h-3.5 text-apple-blue" />
                    <span>Pakizzle Architectural Showcase</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl drop-shadow-md">
                    {currentBanner.name}
                  </h1>
                  <p className="text-white/80 text-xs sm:text-sm md:text-base mt-2 font-normal max-w-2xl hidden sm:block">
                    Verified land demarcation · 100% Non-Encumbrance Certified · Direct Licensed Agency Management
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <div className="absolute inset-y-0 left-0 w-24 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 hidden md:flex">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
                }}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 text-white transition-all transform hover:scale-110 active:scale-95"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
            <div className="absolute inset-y-0 right-0 w-24 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 hidden md:flex">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((prev) => (prev + 1) % banners.length);
                }}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 text-white transition-all transform hover:scale-110 active:scale-95"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2 z-20">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(i);
                  }}
                  className={cn(
                    "h-1 md:h-1.5 rounded-full transition-all duration-500",
                    i === currentIndex ? "w-10 md:w-16 bg-white" : "w-1 md:w-1.5 bg-white/40 hover:bg-white/60"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
