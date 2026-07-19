import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from '../context/LocationContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Gauge, 
  ShieldCheck, 
  Sparkles, 
  ArrowUpRight,
  Zap,
  Car,
  Mountain,
  Gem
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Link, useNavigate } from 'react-router-dom';

const QUICK_CATEGORIES = [
  { id: "hybrid", label: "Hybrid", icon: Zap, color: "text-apple-green", filter: "fuelType=Hybrid" },
  { id: "sedan", label: "Sedan", icon: Car, color: "text-apple-blue", filter: "bodyType=Sedan" },
  { id: "suv", label: "SUV", icon: Mountain, color: "text-orange-500", filter: "bodyType=SUV" },
  { id: "luxury", label: "Premium", icon: Gem, color: "text-purple-500", filter: "priceMin=10000000" },
];

interface BannerData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  color: string;
  accent: string;
  tag: string;
  stats: { label: string; value: string }[];
}

const GENERAL_BANNERS: BannerData[] = [
  {
    id: 'gen-1',
    title: 'The Future of Automotive.',
    subtitle: 'PREMIUM SELECTION',
    description: 'Explore the most exquisite collection of masterpieces across Pakistan. Every machine is meticulously verified by our elite engineering squad.',
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=2070&auto=format&fit=crop',
    color: 'from-apple-blue/10 to-transparent',
    accent: 'text-apple-blue',
    tag: 'National Edition',
    stats: [{ label: 'Verified', value: '1,200+' }, { label: 'Dealers', value: '85' }]
  },
  {
    id: 'gen-2',
    title: 'Precision Valuations.',
    subtitle: 'AI INTELLIGENCE',
    description: 'Get surgical-grade market valuations powered by our proprietary neural network. Know the exact worth of your asset in a heartbeat.',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop',
    color: 'from-purple-500/10 to-transparent',
    accent: 'text-purple-500',
    tag: 'Neural Engine',
    stats: [{ label: 'Accuracy', value: '99.2%' }, { label: 'Data Points', value: '5M+' }]
  }
];

const LOCATION_BANNERS: Record<string, BannerData[]> = {
  'Lahore': [
    {
      id: 'lhr-1',
      title: 'The Heart of Punjab.',
      subtitle: 'LAHORE EXCLUSIVE',
      description: 'Discover specialized inventory from Gulberg to DHA. Our Lahore network offers the most resilient service coverage in the province.',
      image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2070&auto=format&fit=crop',
      color: 'from-apple-green/10 to-transparent',
      accent: 'text-apple-green',
      tag: 'Lahore Hub',
      stats: [{ label: 'Center', value: 'Gulberg III' }, { label: 'Active', value: '450+' }]
    }
  ],
  'Karachi': [
    {
      id: 'khi-1',
      title: 'Vibrance of the Coast.',
      subtitle: 'KARACHI SELECTION',
      description: 'The largest marketplace for port-city inventory. From imported luxury to reliable city cruisers, explore the depth of the Karachi portal.',
      image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2070&auto=format&fit=crop',
      color: 'from-orange-500/10 to-transparent',
      accent: 'text-orange-500',
      tag: 'Coastal Hub',
      stats: [{ label: 'Center', value: 'Clifton' }, { label: 'Active', value: '800+' }]
    }
  ],
  'Islamabad': [
    {
      id: 'isb-1',
      title: 'Capital Precision.',
      subtitle: 'ISLAMABAD SELECTION',
      description: 'High-specifications for the capital city. Discover pristine vehicles with uncompromised histories in Islamabad and Rawalpindi.',
      image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=2070&auto=format&fit=crop',
      color: 'from-apple-blue/10 to-transparent',
      accent: 'text-apple-blue',
      tag: 'Capital Hub',
      stats: [{ label: 'Center', value: 'F-7' }, { label: 'Active', value: '300+' }]
    }
  ]
};

import { bannerService } from '../services/bannerService';
import { Banner } from '../types';

export default function LocationSlider() {
  const { location: userLocation } = useLocation();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    const unsubscribe = bannerService.subscribeToBanners((data) => {
      const activeBanners = data.filter(b => b.status === 'active');
      
      const filtered = activeBanners.filter(banner => {
        if (banner.city && banner.city.toLowerCase() !== userLocation?.city?.toLowerCase()) return false;
        if (banner.state && banner.state.toLowerCase() !== userLocation?.province?.toLowerCase()) return false;
        if (banner.country && 
            banner.country.toLowerCase() !== 'all' && 
            banner.country.toLowerCase() !== 'global' && 
            banner.country.toLowerCase() !== 'pakistan') return false;
        return true;
      });

      setBanners(filtered);
    });
    return () => unsubscribe();
  }, [userLocation?.city, userLocation?.province]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 12000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const currentBanner = banners[currentIndex];

  return (
    <section className="relative w-full overflow-hidden bg-apple-bg dark:bg-black pt-20 lg:pt-24 px-4 md:px-8">
      <div className="max-w-7xl lg:max-w-[1440px] mx-auto relative h-[400px] sm:h-[500px] md:h-[700px] rounded-[48px] md:rounded-[60px] overflow-hidden group shadow-[0_48px_100px_rgba(0,0,0,0.3)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            {/* Background Image with sophisticated parallax-like zoom */}
            <motion.div 
              initial={{ scale: 1.1, filter: 'blur(10px)' }}
              animate={{ scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <img 
                src={currentBanner.image} 
                className="w-full h-full object-cover" 
                alt={currentBanner.name} 
                referrerPolicy="no-referrer"
              />
              <div className={cn("absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent", "from-apple-blue/10 to-transparent")} />
            </motion.div>

            {/* Content Layer (Empty but kept for structure) */}
            <div className="absolute inset-0 flex items-center p-8 md:p-16 lg:p-24">
              <div className="max-w-3xl">
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                "h-1.5 transition-all duration-700 rounded-full",
                i === currentIndex ? "w-16 bg-white" : "w-6 bg-white/20 hover:bg-white/40"
              )}
            />
          ))}
        </div>

        {/* Global Navigation Arrows */}
        <div className="absolute inset-y-0 left-0 w-32 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-40 bg-gradient-to-r from-black/20 to-transparent">
          <button 
            onClick={() => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)}
            className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 text-white transition-all transform hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 w-32 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-40 bg-gradient-to-l from-black/20 to-transparent">
          <button 
            onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
            className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 text-white transition-all transform hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      </div>

      {/* Categories Bar - Floating Aesthetic */}
      <div className="max-w-6xl mx-auto mt-12 md:mt-20">
        <div className="flex items-center justify-start md:justify-center gap-6 md:gap-12 overflow-x-auto pb-10 no-scrollbar -mx-4 px-4 scroll-smooth md:mx-0 md:px-0 snap-x snap-mandatory scroll-pl-4" style={{ WebkitOverflowScrolling: 'touch' }}>
          {QUICK_CATEGORIES.map((cat, idx) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + (idx * 0.1), ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/marketplace?${cat.filter}`)}
              className="flex flex-col items-center gap-5 group shrink-0 snap-start"
            >
              <div className={cn(
                "w-24 h-24 md:w-32 md:h-32 rounded-[32px] md:rounded-[44px] bg-white dark:bg-white/5 backdrop-blur-xl border border-apple-border/50 shadow-apple-soft group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all flex items-center justify-center relative overflow-hidden",
                "after:absolute after:inset-0 after:bg-gradient-to-br after:from-white/10 after:to-transparent after:opacity-0 group-hover:after:opacity-100 transition-opacity"
              )}>
                <cat.icon className={cn("w-10 h-10 md:w-14 md:h-14 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6", cat.color)} />
                <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700" />
              </div>
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-apple-text-muted group-hover:text-apple-blue transition-colors">{cat.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Visual Weight Balancer */}
      <div className="h-px w-2/3 mx-auto bg-gradient-to-r from-transparent via-apple-border/20 to-transparent mb-12" />
    </section>
  );
}
