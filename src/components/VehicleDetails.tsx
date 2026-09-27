import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence, useReducedMotion } from "motion/react";
import { REVEAL_EASE, SPRING_SNAPPY, AnimatedCounter } from "./motion";
import SEO from "./SEO";
import ImageLightbox from "./ImageLightbox";
import { 
  ChevronLeft, 
  MapPin, 
  Gauge, 
  ShieldCheck, 
  Star, 
  Calendar, 
  Fuel, 
  Settings, 
  Zap, 
  Phone, 
  MessageCircle, 
  Heart, 
  Share2,
  CheckCircle2,
  Info,
  ArrowRight,
  Wind,
  Sun,
  Eye,
  Music,
  Lightbulb,
  Key,
  Camera,
  MessageSquare,
  Maximize2,
  ChevronRight,
  ShieldAlert,
  Clock,
  UserCheck,
  X,
  Home,
  Building2,
  Layers,
  Sparkles
} from "lucide-react";
import { useVehicles } from "@/context/VehicleContext";
import RecentlyViewed from "./RecentlyViewed";
import { useChat } from "@/context/ChatContext";
import { cn, formatPrice } from "@/lib/utils";
import Header from "./Header";
import VehicleCard from "./VehicleCard";
import Badge from "./Badge";
import Nudge, { NudgeType } from "./Nudge";
import VerticalNudgeSlider from "./VerticalNudgeSlider";
import { GoogleAdSenseSlot } from "./GoogleAdSenseSlot";
import { useWishlist } from "@/context/WishlistContext";
import { useIntelligence } from "@/hooks/useIntelligence";
import React, { useEffect, useState, useRef } from "react";
import Skeleton from "./ui/Skeleton";

const FEATURE_ICONS: Record<string, any> = {
  "Smart Security Systems": ShieldCheck,
  "Backup Power Setup": Zap,
  "Smart Home Automation": Lightbulb,
  "Designer Modular Kitchen": Sparkles
};

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { vehicles, addToRecentlyViewed } = useVehicles();
  const { startConversation, setNotification } = useChat();
  const vehicle = vehicles.find((v) => v.id === id);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { trackView, getInsights } = useIntelligence();
  const [isStickyHeaderVisible, setIsStickyHeaderVisible] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToImage = (index: number) => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const width = container.clientWidth;
      if (width > 0) {
        container.scrollTo({
          left: width * index,
          behavior: "smooth"
        });
        setActiveImageIndex(index);
      }
    }
  };

  // Adjust scroll position during window resize to keep current image centered
  useEffect(() => {
    const handleResize = () => {
      if (scrollRef.current) {
        const width = scrollRef.current.clientWidth;
        scrollRef.current.scrollLeft = width * activeImageIndex;
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeImageIndex]);

  const handleGalleryScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const width = container.clientWidth;
    if (width > 0) {
      // Use floor/ceil or round to determine active slide index from native scroll snap
      const newIndex = Math.round(container.scrollLeft / width);
      if (newIndex !== activeImageIndex && newIndex >= 0 && newIndex < (vehicle?.images?.length || 0)) {
        setActiveImageIndex(newIndex);
      }
    }
  };

  useEffect(() => {
    if (vehicle) {
      trackView(vehicle);
    }
  }, [vehicle, trackView]);

  // Dynamic nudges from AMIE Intelligence Engine
  const nudges = React.useMemo(() => {
    if (!vehicle) return [];
    const insights = getInsights(vehicle);
    
    return insights
      .filter(insight => insight.type !== 'trust')
      .map(insight => ({
        type: insight.type,
        text: insight.message
      }));
  }, [vehicle, getInsights]);

  useEffect(() => {
    if (vehicle) {
      addToRecentlyViewed(vehicle.id);
    }
  }, [vehicle, addToRecentlyViewed]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setIsStickyHeaderVisible(true);
      } else {
        setIsStickyHeaderVisible(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleChatWithSeller = async () => {
    if (!vehicle) return;
    await startConversation(
      { 
        uid: vehicle.seller.uid || 'unknown', 
        name: vehicle.seller.name,
        photoURL: `https://picsum.photos/seed/${vehicle.seller.name}/100/100`
      },
      { 
        id: vehicle.id, 
        name: `${vehicle.make} ${vehicle.model}`,
        price: vehicle.price,
        image: vehicle.images[0]
      }
    );
    navigate('/chat');
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: `${vehicle?.year} ${vehicle?.make} ${vehicle?.model} on Pakizzle`,
      text: `Check out this ${vehicle?.make} ${vehicle?.model} on Pakizzle`,
      url: url
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setNotification("Link copied to clipboard");
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const [isDataLoaded, setIsDataLoaded] = useState(!!vehicle);

  useEffect(() => {
    if (vehicle) {
      setIsDataLoaded(true);
    }
  }, [vehicle]);

  if (!isDataLoaded) {
    return (
      <div className="min-h-screen bg-apple-bg">
        <Header />
        <div className="pt-28 md:pt-32 px-4 md:px-8 max-w-[1440px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="w-full lg:w-[65%]">
              <Skeleton className="aspect-[16/9] w-full rounded-[24px]" />
              <div className="flex gap-4 mt-6">
                <Skeleton className="w-24 h-24 rounded-2xl" />
                <Skeleton className="w-24 h-24 rounded-2xl" />
                <Skeleton className="w-24 h-24 rounded-2xl" />
              </div>
            </div>
            <div className="w-full lg:w-[35%] space-y-8">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
              <Skeleton className="h-16 w-full rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Vehicle not found</h2>
          <Link to="/" className="apple-button-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  const isSaved = isInWishlist(vehicle.id);

  return (
    <div className="min-h-screen bg-apple-bg">
      <SEO 
        title={`${vehicle.year} ${vehicle.make} ${vehicle.model} for Sale`}
        description={`Discover this premium ${vehicle.year} ${vehicle.make} ${vehicle.model} on Pakizzle for ${formatPrice(vehicle.price)}. Clean history check, certified inspection metrics, located in ${vehicle.city}. Get insights and connect directly with verified seller.`}
        keywords={[vehicle.make, vehicle.model, `${vehicle.make} ${vehicle.model}`, `${vehicle.year} ${vehicle.make}`, "certified supercar", "buy luxury car", vehicle.city]}
        ogImage={vehicle.images[0] || "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&h=630&q=80"}
        ogType="product"
        canonicalPath={`/vehicle/${vehicle.id}`}
        schema={{
          "@type": "Car",
          "name": `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          "image": vehicle.images[0] || "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&h=630&q=80",
          "description": `Premium ${vehicle.year} ${vehicle.make} ${vehicle.model} offered on Pakizzle. ${vehicle.specs?.exteriorColor || 'Exquisite'} exterior, automatic ${vehicle.specs?.transmission || 'transmission'} transmission.`,
          "brand": {
            "@type": "Brand",
            "name": vehicle.make
          },
          "model": vehicle.model,
          "vehicleModelDate": vehicle.year,
          "color": vehicle.specs?.exteriorColor || 'Custom',
          "vehicleTransmission": vehicle.specs?.transmission || 'Automatic',
          "offers": {
            "@type": "Offer",
            "price": vehicle.price,
            "priceCurrency": "PKR",
            "itemCondition": "https://schema.org/UsedCondition",
            "availability": "https://schema.org/InStock",
            "url": window.location.href
          }
        }}
      />
      <Header />

      {/* 1. Mobile Fixed Sticky Bottom CTA Bar (<768px, Always Reachable) */}
      <div 
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-[#141824]/95 backdrop-blur-2xl border-t border-black/10 dark:border-white/10 px-4 py-2.5 flex items-center justify-between gap-3 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold text-apple-text-muted dark:text-slate-400 uppercase tracking-wider truncate">
            {vehicle.make}
          </span>
          <span className="text-base font-extrabold font-mono text-apple-blue dark:text-teal-400 truncate">
            {formatPrice(vehicle.price)}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a 
            href="tel:+923001234567"
            className="w-11 h-11 rounded-full border border-apple-border dark:border-white/10 bg-apple-gray dark:bg-white/5 flex items-center justify-center text-apple-text dark:text-white cursor-pointer touch-target shrink-0"
            title="Call seller"
          >
            <Phone className="w-4.5 h-4.5" />
          </a>
          <motion.button 
            whileTap={{ scale: 0.96 }}
            transition={SPRING_SNAPPY}
            onClick={handleChatWithSeller}
            className="h-11 px-5 rounded-full bg-apple-blue text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-apple-blue/25 cursor-pointer touch-target shrink-0 min-h-[44px]"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Contact Seller</span>
          </motion.button>
        </div>
      </div>

      {/* 2. Tablet & Desktop Sticky Quick Bar (Scroll-triggered, >=768px) */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: isStickyHeaderVisible ? 0 : 100 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="hidden md:flex fixed bottom-0 left-0 right-0 z-50 bg-apple-card-bg backdrop-blur-2xl border-t border-apple-border/50 h-16 md:h-20 items-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
      >
        <div className="max-w-[1440px] mx-auto w-full px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <h2 className="text-xs md:text-base font-bold text-apple-text tracking-tight">
                {vehicle.model}
              </h2>
              <p className="text-[9px] md:text-xs font-bold text-apple-blue uppercase tracking-widest">
                {formatPrice(vehicle.price)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={handleShare}
              className="w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center border border-apple-border bg-apple-card-bg text-apple-text hover:bg-apple-gray transition-all shadow-sm cursor-pointer touch-target"
              title="Share Vehicle"
            >
              <Share2 className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button 
              onClick={handleChatWithSeller}
              className="w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center border border-apple-border bg-apple-card-bg text-apple-text hover:bg-apple-gray transition-all shadow-sm cursor-pointer touch-target"
              title="Chat with Seller"
            >
              <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <a 
              href="tel:+923001234567"
              className="apple-button-primary !h-9 md:!h-12 !px-4 md:!px-8 !text-[10px] md:!text-sm flex items-center gap-2 shadow-xl shadow-apple-blue/20"
            >
              <Phone className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span>Call Seller</span>
            </a>
            <button 
              onClick={() => toggleWishlist(vehicle.id)}
              className={cn(
                "w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center border transition-all shadow-sm cursor-pointer touch-target",
                isSaved ? "bg-apple-red text-white border-apple-red" : "bg-apple-gray text-apple-text border-apple-border"
              )}
            >
              <Heart className={cn("w-4 h-4 md:w-5 md:h-5", isSaved && "fill-current")} />
            </button>
          </div>
        </div>
      </motion.div>
      
      <main className="pt-20 sm:pt-22 lg:pt-28 pb-24 md:pb-8">
        <div className="flex flex-col lg:flex-row min-h-[calc(100-80px)]">
          
          {/* Left Column: Immersive Carousel Gallery */}
          <div className="w-full lg:w-[60%] xl:w-[65%] bg-apple-gray relative group/gallery">
            <div className="lg:sticky lg:top-28 h-[44vh] sm:h-[55vh] md:h-[65vh] lg:h-[calc(100vh-140px)] w-full overflow-hidden">
              {/* Floating Back Navigation Button */}
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={SPRING_SNAPPY}
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 z-30 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/50 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 text-xs font-semibold shadow-lg transition-colors cursor-pointer"
                title="Back to previous page"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </motion.button>

              <div 
                ref={scrollRef}
                onScroll={handleGalleryScroll}
                className="flex overflow-x-auto h-full w-full snap-x snap-mandatory scrollbar-none scroll-smooth bg-black"
              >
                {vehicle.images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="w-full h-full shrink-0 snap-align-center cursor-zoom-in relative"
                    onClick={() => setIsGalleryOpen(true)}
                  >
                    <motion.img 
                      layoutId={shouldReduceMotion || idx !== 0 ? undefined : `property-hero-image-${vehicle.id}`}
                      transition={{ duration: 0.45, ease: REVEAL_EASE }}
                      src={imgUrl} 
                      alt={`${vehicle.model} - View ${idx + 1}`} 
                      className="w-full h-full object-cover select-none pointer-events-none"
                      referrerPolicy="no-referrer"
                      fetchPriority={idx === 0 ? "high" : "low"}
                      loading={idx === 0 ? "eager" : "lazy"}
                    />
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              <div className="absolute inset-0 flex items-center justify-between px-4 md:px-8 opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                <motion.button 
                  whileHover={{ scale: 1.1, x: -2 }}
                  whileTap={{ scale: 0.9 }}
                  transition={SPRING_SNAPPY}
                  onClick={(e) => {
                    e.stopPropagation();
                    const newIndex = activeImageIndex === 0 ? vehicle.images.length - 1 : activeImageIndex - 1;
                    scrollToImage(newIndex);
                  }}
                  className="w-12 h-12 rounded-full bg-black/40 hover:bg-black/65 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-colors pointer-events-auto shadow-xl cursor-pointer"
                  title="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1, x: 2 }}
                  whileTap={{ scale: 0.9 }}
                  transition={SPRING_SNAPPY}
                  onClick={(e) => {
                    e.stopPropagation();
                    const newIndex = activeImageIndex === vehicle.images.length - 1 ? 0 : activeImageIndex + 1;
                    scrollToImage(newIndex);
                  }}
                  className="w-12 h-12 rounded-full bg-black/40 hover:bg-black/65 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-colors pointer-events-auto shadow-xl cursor-pointer"
                  title="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Image Counter & Full Gallery Action Pill */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 z-20">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={SPRING_SNAPPY}
                  onClick={() => setIsGalleryOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/75 backdrop-blur-xl rounded-full border border-white/20 text-white text-[11px] font-bold tracking-wide shadow-2xl cursor-pointer transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>{activeImageIndex + 1} / {vehicle.images.length} • View Gallery</span>
                </motion.button>
                
                {/* Indicator Micro Dots */}
                <div className="flex gap-1.5 p-1 rounded-full bg-black/30 backdrop-blur-md">
                  {vehicle.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        scrollToImage(idx);
                      }}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                        activeImageIndex === idx ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Configuration Glass Panel */}
          <div className="w-full lg:w-[40%] xl:w-[35%] relative">
            <div className="lg:sticky lg:top-28 lg:h-[calc(100vh-140px)] overflow-y-auto scrollbar-hide px-6 md:px-8 py-5 md:py-7 flex flex-col liquid-glass-foreground rounded-[32px] m-3 lg:m-4 shadow-2xl">
              
              {/* Header Info */}
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-apple-blue">
                    <ShieldCheck className="w-4 h-4" />
                    Neural Certified
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.85 }}
                      transition={SPRING_SNAPPY}
                      onClick={handleShare}
                      className="w-8 h-8 rounded-full flex items-center justify-center border border-apple-border text-apple-text hover:bg-apple-gray transition-colors cursor-pointer"
                      title="Share property"
                    >
                      <Share2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.85 }}
                      transition={SPRING_SNAPPY}
                      onClick={() => toggleWishlist(vehicle.id)}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer",
                        isSaved ? "bg-apple-red text-white border-apple-red" : "border-apple-border text-apple-text hover:bg-apple-gray"
                      )}
                      title={isSaved ? "Remove from wishlist" : "Save to wishlist"}
                    >
                      <motion.div
                        animate={isSaved ? { scale: [1, 1.35, 0.9, 1] } : { scale: 1 }}
                        transition={SPRING_SNAPPY}
                      >
                        <Heart className={cn("w-4 h-4", isSaved && "fill-current text-white")} />
                      </motion.div>
                    </motion.button>
                  </div>
                </div>

                <h1 className="fluid-h1 font-bold tracking-tight text-apple-text mb-2 leading-[1.1] text-balance">
                  {vehicle.model}
                </h1>
                <div className="text-sm sm:text-base md:text-lg font-medium text-apple-blue mb-6 sm:mb-8 md:mb-10 tracking-tight font-semibold flex items-center gap-1.5">
                  <Home className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span>{vehicle.make} • Verified Listing</span>
                </div>

                <div className="flex flex-col gap-1 mb-3">
                  {nudges.slice(0, 2).map((nudge, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + (i * 0.1) }}
                    >
                      <Nudge type={nudge.type} text={nudge.text} variant="inline" />
                    </motion.div>
                  ))}
                </div>

                {/* Key Specs Row (Tesla Style) */}
                <div className="grid grid-cols-3 gap-4 mb-5 py-3 border-y border-apple-border/30">
                  <div className="text-center group cursor-default">
                    <div className="text-2xl md:text-3xl font-bold text-apple-text tracking-tighter group-hover:text-apple-blue transition-colors">
                      <AnimatedCounter value={vehicle.year || 2024} formatThousands={false} duration={1} />
                    </div>
                    <div className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest mt-2">Year Built</div>
                  </div>
                  <div className="text-center group cursor-default">
                    <div className="text-xl md:text-2xl font-bold text-apple-text tracking-tighter group-hover:text-apple-blue transition-colors truncate">
                      {vehicle.mileage ? (
                        <AnimatedCounter value={vehicle.mileage} formatThousands={true} duration={1.2} />
                      ) : "0"}
                    </div>
                    <div className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest mt-2">Sq. Ft.</div>
                  </div>
                  <div className="text-center group cursor-default">
                    <div className="text-lg md:text-xl font-bold text-apple-text tracking-tighter group-hover:text-apple-blue transition-colors capitalize truncate">{vehicle.transmission === "furnished" ? "Furnished" : vehicle.transmission === "semi-furnished" ? "Semi-Furn" : "Unfurnished"}</div>
                    <div className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest mt-2">Furnishing</div>
                  </div>
                </div>
              </motion.section>

              {/* Pricing & Actions */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mb-5"
              >
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <div className="text-[10px] font-bold text-apple-text-muted uppercase tracking-[0.2em] mb-1.5">Market Valuation</div>
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-mono text-apple-text tracking-tight">
                      {formatPrice(vehicle.price)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="px-3 py-1 bg-apple-green/10 text-apple-green text-[10px] font-bold rounded-full uppercase tracking-widest">
                      Great Deal
                    </div>
                    <div className="text-[9px] font-bold text-apple-text-muted uppercase tracking-widest">Neural Verified</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <motion.button 
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    transition={SPRING_SNAPPY}
                    onClick={handleChatWithSeller}
                    className="apple-button-primary w-full h-16 text-lg flex items-center justify-center gap-3 shadow-2xl shadow-apple-blue/20 group cursor-pointer"
                  >
                    <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Secure Chat</span>
                  </motion.button>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.a 
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      transition={SPRING_SNAPPY}
                      href="tel:+923001234567"
                      className="apple-button-secondary h-16 text-sm flex items-center justify-center gap-2 border-apple-border hover:bg-apple-gray group cursor-pointer"
                    >
                      <Phone className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      <span>Call Seller</span>
                    </motion.a>
                    <motion.button 
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      transition={SPRING_SNAPPY}
                      className="apple-button-secondary h-16 text-sm flex items-center justify-center gap-2 border-apple-green/20 text-apple-green hover:bg-apple-green/5 group cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>WhatsApp</span>
                    </motion.button>
                  </div>
                </div>
              </motion.section>

              {/* Narrative / Description */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mb-10"
              >
                <h2 className="text-sm font-bold text-apple-text uppercase tracking-[0.2em] mb-4">Description</h2>
                <div className="text-base md:text-lg text-apple-text-muted leading-[1.6] font-medium tracking-tight whitespace-pre-line select-text">
                  {vehicle.description ? (
                    vehicle.description.includes("<") 
                      ? vehicle.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() 
                      : vehicle.description
                  ) : (
                    `This ${vehicle.year} ${vehicle.make} ${vehicle.model} represents the pinnacle of automotive engineering. 
                    Maintained with surgical precision at authorized centers, it features a suite of premium upgrades including 
                    an immersive sound stage and advanced driver assistance.`
                  )}
                </div>

                {/* 
                  Advanced Search Engine Indexing Package (Inaudible to human readers, extremely loud to Google's spider algorithms) 
                  This holds our keyword clouds, structured copy lists, and SEO semantic anchors safely without script execution risks.
                */}
                {vehicle.seoDescription && (
                  <div 
                    className="sr-only opacity-0 pointer-events-none absolute h-0 w-0 overflow-hidden"
                    aria-hidden="true"
                  >
                    {vehicle.seoDescription.replace(/<[^>]*>?/gm, ' ')}
                  </div>
                )}
                {/* Safe text fallback description indexing */}
                {!vehicle.seoDescription && vehicle.description && (
                  <div 
                    className="sr-only opacity-0 pointer-events-none absolute h-0 w-0 overflow-hidden"
                    aria-hidden="true"
                  >
                    {vehicle.description.replace(/<[^>]*>?/gm, ' ')}
                  </div>
                )}
              </motion.section>

              {/* Technical Specifications */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="mb-10"
              >
                <h2 className="text-sm font-bold text-apple-text uppercase tracking-[0.2em] mb-4">Property Specifications</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-6 gap-x-8">
                  {[
                    { label: "Property Type", value: vehicle.make },
                    { label: "Area Size", value: vehicle.mileage ? vehicle.mileage.toLocaleString() + " Sq.Ft." : "N/A" },
                    { label: "Beds/Rooms", value: vehicle.make === "Plot" ? "N/A" : vehicle.engineSize },
                    { label: "Furnishing", value: vehicle.transmission === "furnished" ? "Fully Furnished" : vehicle.transmission === "semi-furnished" ? "Semi-Furnished" : "Unfurnished" },
                    { label: "Status", value: vehicle.condition === "ready" ? "Ready to Move" : vehicle.condition === "under_construction" ? "Under Construction" : "Off-Plan Plot" },
                    { label: "Purpose", value: vehicle.transmission === "furnished" ? "For Rent" : "For Sale" },
                    { label: "City", value: vehicle.city },
                    { label: "Sectors/Area", value: vehicle.area || "Main Sector" }
                  ].map((spec, i) => (
                    <div key={i} className="border-l-2 border-apple-blue/20 pl-4 py-1">
                      <div className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest mb-1">{spec.label}</div>
                      <div className="text-sm font-bold text-apple-text capitalize">{spec.value}</div>
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* Advanced Systems (Configurator Style) */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                className="mb-10"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold text-apple-text uppercase tracking-widest">Property Amenities</h2>
                  <div className="text-[10px] font-bold text-apple-blue uppercase tracking-widest cursor-pointer hover:underline">View All</div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { name: "Smart Security Systems", desc: "AI-linked smart security and 24/7 guard patrol" },
                    { name: "Backup Power Setup", desc: "Heavy duty solar net metering and backup generator" },
                    { name: "Smart Home Automation", desc: "Integrated smart lighting, thermostat, and keyless locks" },
                    { name: "Designer Modular Kitchen", desc: "Premium Italian fittings and imported marble countertops" }
                  ].map((feature, i) => {
                    const Icon = FEATURE_ICONS[feature.name] || CheckCircle2;
                    return (
                      <div key={feature.name} className="flex items-center justify-between p-5 rounded-[24px] bg-apple-gray/30 border border-apple-border/30 group hover:bg-apple-card-bg hover:shadow-apple-soft transition-all duration-500">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-apple-card-bg flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-apple-blue/5 transition-all duration-500">
                            <Icon className="w-6 h-6 text-apple-blue" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-apple-text mb-0.5">{feature.name}</div>
                            <div className="text-[10px] font-medium text-apple-text-muted uppercase tracking-wider">{feature.desc}</div>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-apple-gray opacity-0 group-hover:opacity-100 transition-all duration-500">
                          <ChevronRight className="w-4 h-4 text-apple-text-muted" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.section>

              {/* Seller Information */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="mt-auto pt-3 border-t border-apple-border/30"
              >
                <Link to={`/profile/${vehicle.seller.uid}`} className="flex items-center gap-6 group">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-apple-gray flex items-center justify-center text-2xl font-bold text-apple-text shadow-inner border border-white group-hover:scale-105 transition-transform">
                      {vehicle.seller.name[0]}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-apple-blue rounded-full flex items-center justify-center border-2 border-white">
                      <UserCheck className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-apple-text mb-0.5 group-hover:text-apple-blue transition-colors flex items-center gap-2 flex-wrap">
                      <span>{vehicle.seller.name}</span>
                      <Badge 
                        type={vehicle.seller.verified_badge_type || vehicle.seller.badgeType || (vehicle.seller.isVerified ? 'identity' : 'none')} 
                        size="sm" 
                        showText={true} 
                      />
                    </div>
                    <p className="text-xs font-bold text-apple-blue mb-2">@{vehicle.seller.username || (vehicle.seller.name).toLowerCase().replace(/\s+/g, '_')}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={cn("w-3.5 h-3.5", s <= Math.floor(vehicle.seller.rating) ? "fill-apple-orange text-apple-orange" : "text-apple-gray")} />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-apple-text-muted">({vehicle.seller.rating})</span>
                    </div>
                  </div>
                </Link>
              </motion.section>

              {/* Premium Google AdSense Sidebar Slot */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.3 }}
                className="mt-6 pt-5 border-t border-apple-border/20"
              >
                <GoogleAdSenseSlot slotType="sidebar-medium" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Similar Vehicles Section (Full Width) */}
        <section className="mt-2 py-2 bg-apple-gray/50 border-t border-apple-border/30">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-2">
              <div>
                <div className="text-[10px] font-bold text-apple-blue uppercase tracking-[0.4em] mb-1">Curated Selection</div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-apple-text leading-none">
                  Similar <span className="text-apple-text/30">Masterpieces</span>
                </h2>
              </div>
              <Link 
                to="/marketplace" 
                className="group flex items-center gap-3 text-apple-text font-bold text-sm hover:text-apple-blue transition-colors"
              >
                Explore Full Collection 
                <div className="w-10 h-10 rounded-full border border-apple-border flex items-center justify-center group-hover:border-apple-blue group-hover:bg-apple-blue group-hover:text-white transition-all">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {vehicles
                ?.filter(v => v.id !== vehicle.id && (v.make === vehicle.make || v.bodyType === vehicle.bodyType))
                ?.slice(0, 4)
                ?.map((v, idx) => (
                  <motion.div 
                    key={v.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <VehicleCard vehicle={v} />
                  </motion.div>
                ))}
            </div>
          </div>
        </section>

        {/* Recently Viewed (You recently looked at) Section */}
        <div className="bg-apple-gray/30 border-t border-apple-border/20">
          <RecentlyViewed />
        </div>
      </main>

      {/* Full Screen Apple Gestural Lightbox */}
      <ImageLightbox
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={vehicle.images || []}
        initialIndex={activeImageIndex}
        title={`${vehicle.make} ${vehicle.model}`}
        subtitle={vehicle.location ? `${vehicle.location}, ${vehicle.city}` : vehicle.city}
        isVerified={vehicle.isVerified}
      />

      {/* 4. Mobile Bottom Action Bar (Apple Style) - Hidden when sticky is active */}
      {!isStickyHeaderVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-apple-card-bg backdrop-blur-2xl border-t border-apple-border/50 p-2.5 pb-6 flex gap-2.5">
          <button 
            onClick={handleChatWithSeller}
            className="flex-1 apple-button-primary h-12 text-sm flex items-center justify-center gap-2 shadow-xl shadow-apple-blue/20"
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
          <button className="w-12 h-12 rounded-full bg-apple-gray flex items-center justify-center text-apple-text border border-apple-border shadow-sm">
            <Phone className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 rounded-full bg-apple-green/10 flex items-center justify-center text-apple-green border border-apple-green/20 shadow-sm">
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
