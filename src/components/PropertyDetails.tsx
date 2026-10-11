import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { REVEAL_EASE, SPRING_SNAPPY, AnimatedCounter } from "./motion";
import SEO from "./SEO";
import ImageLightbox from "./ImageLightbox";
import { 
  ChevronLeft, 
  MapPin, 
  ShieldCheck, 
  Star, 
  Calendar, 
  Phone, 
  MessageCircle, 
  Heart, 
  Share2,
  CheckCircle2,
  Info,
  Maximize2,
  ChevronRight,
  MessageSquare,
  Home,
  Building2,
  Layers,
  Sparkles,
  Bed,
  Bath,
  Compass,
  FileCheck,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { useProperties } from "@/context/PropertyContext";
import { useAuth } from "@/context/AuthContext";
import { listingFreshnessService } from "@/services/listingFreshnessService";
import { parsePropertyUrlParam, formatPropertyUrl } from "@/lib/referenceId";
import RecentlyViewed from "./RecentlyViewed";
import { useChat } from "@/context/ChatContext";
import { cn, formatPrice } from "@/lib/utils";
import Header from "./Header";
import PropertyCard from "./PropertyCard";
import Badge from "./Badge";
import Nudge from "./Nudge";
import VerticalNudgeSlider from "./VerticalNudgeSlider";
import { GoogleAdSenseSlot } from "./GoogleAdSenseSlot";
import { useWishlist } from "@/context/WishlistContext";
import { useIntelligence } from "@/hooks/useIntelligence";
import React, { useEffect, useState, useRef } from "react";
import Skeleton from "./ui/Skeleton";

const FEATURE_ICONS: Record<string, any> = {
  "Smart Security Systems": ShieldCheck,
  "Backup Power Setup": Sparkles,
  "Smart Home Automation": Sparkles,
  "Designer Modular Kitchen": Sparkles,
  "LDA / CDA / RDA Approved": FileCheck,
  "Imported Italian Marble": Layers,
  "24/7 Gated Security": ShieldCheck,
  "Corner Plot Advantage": Compass
};

export default function PropertyDetails() {
  const { id: routeParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { properties, addToRecentlyViewed, confirmListingActive, reactivateListing } = useProperties();
  const { user, isAdmin } = useAuth();
  const { startConversation, setNotification } = useChat();

  // Extract reference_id and cosmetic slug from the route parameter
  const { reference_id: extractedRefId } = parsePropertyUrlParam(routeParam || "");

  // Resolve primarily off the reference_id, treating the slug portion as cosmetic/SEO only
  const property = React.useMemo(() => {
    if (!properties || properties.length === 0) return undefined;
    return properties.find((p) => {
      if (extractedRefId && p.reference_id === extractedRefId) return true;
      if (p.reference_id === routeParam) return true;
      if (p.id === routeParam) return true;
      if (extractedRefId && p.id === extractedRefId) return true;
      return false;
    });
  }, [properties, extractedRefId, routeParam]);

  // Synchronize browser address bar to canonical [slug]-[reference_id] without page reload
  useEffect(() => {
    if (property && property.reference_id) {
      const canonicalUrl = formatPropertyUrl(property);
      if (window.location.pathname !== canonicalUrl && !window.location.pathname.startsWith("/vehicle/")) {
        window.history.replaceState(null, "", canonicalUrl);
      }
    }
  }, [property]);

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
      const newIndex = Math.round(container.scrollLeft / width);
      if (newIndex !== activeImageIndex && newIndex >= 0 && newIndex < (property?.images?.length || 0)) {
        setActiveImageIndex(newIndex);
      }
    }
  };

  useEffect(() => {
    if (property) {
      addToRecentlyViewed(property.reference_id || property.id);
      trackView(property);
    }
  }, [property, addToRecentlyViewed, trackView]);

  const nudges = React.useMemo(() => {
    if (!property) return [];
    const insights = getInsights(property);
    return insights
      .filter(insight => insight.type !== 'trust')
      .map(insight => ({
        type: insight.type,
        text: insight.message
      }));
  }, [property, getInsights]);

  useEffect(() => {
    if (property) {
      addToRecentlyViewed(property.id);
    }
  }, [property, addToRecentlyViewed]);

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
    if (!property) return;
    await startConversation(
      { 
        uid: property.seller.uid || 'unknown', 
        name: property.seller.name,
        photoURL: `https://picsum.photos/seed/${property.seller.name}/100/100`
      },
      { 
        id: property.id, 
        name: `${property.make} - ${property.model}`,
        price: property.price,
        image: property.images[0]
      }
    );
    navigate('/chat');
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: `${property?.make} - ${property?.model} on Pakizzle`,
      text: `Check out this prime property on Pakizzle: ${property?.model} in ${property?.location}`,
      url: url
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setNotification("Property link copied to clipboard");
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error('Error sharing property:', err);
    }
  };

  const [copiedId, setCopiedId] = useState(false);

  // Freshness & Availability Trust Signals
  const freshness = React.useMemo(() => {
    return property ? listingFreshnessService.getFreshness(property) : null;
  }, [property]);

  const isOwner = Boolean(
    user && property && (
      user.uid === property.seller.uid ||
      isAdmin ||
      user.email === 'redspotsproduction@gmail.com' ||
      property.seller.name === "Redspots Productions"
    )
  );

  const handleConfirmActive = async () => {
    if (!property) return;
    try {
      await confirmListingActive(property.id);
      toast.success("Listing Availability Confirmed! 🏡", {
        description: "Freshness timestamp updated. Buyers see this property is actively verified."
      });
    } catch {
      toast.error("Failed to update freshness");
    }
  };

  const handleReactivate = async () => {
    if (!property) return;
    try {
      await reactivateListing(property.id);
      toast.success("Listing Reactivated! ✨", {
        description: "Your listing has been restored to the live marketplace catalog and search results."
      });
    } catch {
      toast.error("Failed to reactivate listing");
    }
  };

  const handleCopyId = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!property) return;
    const refId = property.reference_id || property.id;
    try {
      await navigator.clipboard.writeText(refId);
      setCopiedId(true);
      toast.success(`Property ID ${refId} copied! Ready to share via WhatsApp or call.`);
      setTimeout(() => setCopiedId(false), 2500);
    } catch {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  const [isDataLoaded, setIsDataLoaded] = useState(!!property);

  useEffect(() => {
    if (property) {
      setIsDataLoaded(true);
    }
  }, [property]);

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

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-apple-bg px-4">
        <div className="text-center p-8 bg-apple-card-bg rounded-apple-2xl shadow-xl max-w-md border border-apple-border/40">
          <Building2 className="w-16 h-16 text-apple-blue mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-apple-text">Property Not Found</h2>
          {extractedRefId ? (
            <p className="text-apple-text-muted text-sm mb-6">
              No active listing was found matching Property Reference ID <span className="font-mono font-bold text-apple-blue">#{extractedRefId}</span>. The listing may have been sold, archived, or the ID was mistyped.
            </p>
          ) : (
            <p className="text-apple-text-muted text-sm mb-6">The listing you are searching for might have been sold or removed.</p>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/marketplace" className="apple-button-primary w-full sm:w-auto">Browse Available Properties</Link>
            <Link to="/" className="apple-button-secondary w-full sm:w-auto">Return Home</Link>
          </div>
        </div>
      </div>
    );
  }

  const isSaved = isInWishlist(property.id);

  return (
    <div className="min-h-screen bg-apple-bg">
      <SEO 
        title={`${property.model} for Sale in ${property.city}`}
        description={`Explore ${property.model} in ${property.location} on Pakizzle for ${formatPrice(property.price)}. Complete legal title check, LDA/CDA verification, certified agency representation.`}
        keywords={[property.make, property.model, `${property.make} in ${property.city}`, "real estate pakistan", "luxury house for sale", "commercial property"]}
        ogImage={property.images[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&h=630&q=80"}
        ogType="website"
        canonicalPath={formatPropertyUrl(property)}
      />
      <Header />

      {/* Mobile Fixed Sticky Bottom CTA Bar (<768px) */}
      <div 
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-[#141824]/95 backdrop-blur-2xl border-t border-black/10 dark:border-white/10 px-4 py-2.5 flex items-center justify-between gap-3 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-apple-text-muted dark:text-apple-text-muted uppercase tracking-wider truncate">
              {property.make} • {property.city}
            </span>
            <button 
              onClick={handleCopyId} 
              className="text-[9px] font-mono font-bold text-apple-blue bg-apple-blue/10 dark:bg-white/10 px-1.5 py-0.5 rounded flex items-center gap-0.5 cursor-pointer"
              title="Copy Property ID"
            >
              #{property.reference_id || property.id}
              {copiedId ? <Check className="w-2.5 h-2.5 text-apple-green" /> : <Copy className="w-2.5 h-2.5" />}
            </button>
          </div>
          <span className="text-base font-extrabold font-mono text-apple-blue dark:text-teal-400 truncate">
            {formatPrice(property.price)}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a 
            href="tel:+923001234567"
            className="w-11 h-11 rounded-full border border-apple-border dark:border-white/10 bg-apple-gray dark:bg-white/5 flex items-center justify-center text-apple-text dark:text-white cursor-pointer touch-target shrink-0"
            title="Call Agency"
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
            <span>Contact Agency</span>
          </motion.button>
        </div>
      </div>

      {/* Tablet & Desktop Sticky Quick Bar (Scroll-triggered, >=768px) */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: isStickyHeaderVisible ? 0 : 100 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="hidden md:flex fixed bottom-0 left-0 right-0 z-50 bg-apple-card-bg backdrop-blur-2xl border-t border-apple-border/50 h-16 md:h-20 items-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
      >
        <div className="max-w-[1440px] mx-auto w-full px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-xs md:text-base font-bold text-apple-text tracking-tight truncate max-w-md">
                  {property.model}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-apple-gray dark:bg-white/10 text-[10px] font-mono font-bold text-apple-blue shrink-0">
                  ID: {property.reference_id || property.id}
                  <button onClick={handleCopyId} className="hover:text-apple-text text-apple-text-muted transition-colors cursor-pointer" title="Copy Property ID">
                    {copiedId ? <Check className="w-2.5 h-2.5 text-apple-green" /> : <Copy className="w-2.5 h-2.5" />}
                  </button>
                </span>
              </div>
              <p className="text-[9px] md:text-xs font-bold text-apple-blue uppercase tracking-widest">
                {formatPrice(property.price)} • {property.location}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={handleShare}
              className="w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center border border-apple-border bg-apple-card-bg text-apple-text hover:bg-apple-gray transition-all shadow-sm cursor-pointer touch-target"
              title="Share Property"
            >
              <Share2 className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button 
              onClick={handleChatWithSeller}
              className="w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center border border-apple-border bg-apple-card-bg text-apple-text hover:bg-apple-gray transition-all shadow-sm cursor-pointer touch-target"
              title="Chat with Agency"
            >
              <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <a 
              href="tel:+923001234567"
              className="apple-button-primary !h-9 md:!h-12 !px-4 md:!px-8 !text-[10px] md:!text-sm flex items-center gap-2 shadow-xl shadow-apple-blue/20"
            >
              <Phone className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span>Call Agency</span>
            </a>
            <button 
              onClick={() => toggleWishlist(property.id)}
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
          
          {/* Left Column: Carousel Gallery (Golden Ratio: 61.8% of viewport container) */}
          <div className="w-full lg:w-[61.8%] bg-apple-gray relative group/gallery">
            <div className="lg:sticky lg:top-28 h-[44vh] sm:h-[55vh] md:h-[65vh] lg:h-[calc(100vh-140px)] w-full overflow-hidden">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={SPRING_SNAPPY}
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 z-30 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/50 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 text-xs font-semibold shadow-lg transition-colors cursor-pointer"
                title="Back to marketplace"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </motion.button>

              <div 
                ref={scrollRef}
                onScroll={handleGalleryScroll}
                className="flex overflow-x-auto h-full w-full snap-x snap-mandatory scrollbar-none scroll-smooth bg-black"
              >
                {property.images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="w-full h-full shrink-0 snap-align-center cursor-zoom-in relative"
                    onClick={() => setIsGalleryOpen(true)}
                  >
                    <motion.img 
                      layoutId={shouldReduceMotion || idx !== 0 ? undefined : `property-hero-image-${property.id}`}
                      transition={{ duration: 0.45, ease: REVEAL_EASE }}
                      src={imgUrl} 
                      alt={`${property.model} - View ${idx + 1}`} 
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
                    const newIndex = activeImageIndex === 0 ? property.images.length - 1 : activeImageIndex - 1;
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
                    const newIndex = activeImageIndex === property.images.length - 1 ? 0 : activeImageIndex + 1;
                    scrollToImage(newIndex);
                  }}
                  className="w-12 h-12 rounded-full bg-black/40 hover:bg-black/65 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-colors pointer-events-auto shadow-xl cursor-pointer"
                  title="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Full Gallery Action Pill */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 z-20">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={SPRING_SNAPPY}
                  onClick={() => setIsGalleryOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/75 backdrop-blur-xl rounded-full border border-white/20 text-white text-[11px] font-bold tracking-wide shadow-2xl cursor-pointer transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>{activeImageIndex + 1} / {property.images.length} • View Architectural Gallery</span>
                </motion.button>
                
                <div className="flex gap-1.5 p-1 rounded-full bg-black/30 backdrop-blur-md">
                  {property.images.map((_, idx) => (
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

          {/* Right Column: Sticky Configuration Glass Panel (Golden Ratio: 38.2% of viewport container) */}
          <div className="w-full lg:w-[38.2%] relative">
            <div className="lg:sticky lg:top-28 lg:h-[calc(100vh-140px)] overflow-y-auto scrollbar-hide px-6 md:px-8 py-5 md:py-7 flex flex-col liquid-glass-foreground rounded-[32px] m-3 lg:m-4 shadow-2xl">
              
              {/* Header Info */}
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Trust Signal Header: Property Reference ID & Verified Badge Paired Together */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-apple-border/40">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Property ID Pill with 1-Tap Copy */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-apple-gray/80 dark:bg-white/10 border border-apple-border/60 text-apple-text text-xs font-semibold backdrop-blur-md shadow-xs transition-all hover:border-apple-blue/50">
                      <span className="text-[11px] font-medium text-apple-text-muted">Property ID:</span>
                      <span className="font-mono font-bold tracking-wider text-apple-blue dark:text-teal-400">
                        {property.reference_id || property.id}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={handleCopyId}
                        className="p-1 -mr-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-apple-text-muted hover:text-apple-blue transition-colors cursor-pointer touch-target"
                        title="Copy Property ID for WhatsApp / Call sharing"
                        aria-label="Copy Property ID"
                      >
                        {copiedId ? (
                          <Check className="w-3.5 h-3.5 text-apple-green animate-in zoom-in-50 duration-200" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </motion.button>
                      {copiedId && (
                        <span className="text-[10px] font-bold text-apple-green dark:text-emerald-400 animate-in fade-in duration-200">
                          Copied!
                        </span>
                      )}
                    </div>

                    {/* Seller Trust Badge */}
                    <div className="inline-flex items-center">
                      {property.seller?.badgeType && property.seller.badgeType !== "none" ? (
                        <Badge 
                          type={property.seller.badgeType} 
                          size="sm" 
                          showText={true} 
                        />
                      ) : (
                        <span className="text-[11px] text-apple-text-muted px-2.5 py-0.5 rounded-full bg-apple-gray/60 dark:bg-white/5 border border-apple-border/40 font-medium">
                          Not verified
                        </span>
                      )}
                    </div>

                    {/* Verified Title Deed Badge: Only displayed when admin has approved title deed verification */}
                    {((property as any).title_deed_status === 'verified' || 
                      (property as any).titleDeedStatus === 'verified' || 
                      (property as any).title_deed_verified === true || 
                      (property as any).isTitleDeedVerified === true) && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-apple-green/10 border border-apple-green/20 text-apple-green dark:text-emerald-400 text-[11px] font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 text-apple-green shrink-0" />
                        <span>Verified Title Deed</span>
                      </div>
                    )}

                    {/* Listing Freshness Trust Pill */}
                    {freshness && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-apple-gray/80 dark:bg-white/10 border border-apple-border/60 text-xs font-semibold text-apple-text shadow-xs">
                        <span className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          freshness.status === 'expired' ? "bg-apple-red" :
                          freshness.status === 'stale_pending_confirmation' ? "bg-apple-orange animate-pulse" :
                          freshness.status === 'approaching_stale' ? "bg-apple-orange" : "bg-apple-green"
                        )} />
                        <Clock className="w-3 h-3 text-apple-text-muted shrink-0" />
                        <span>{freshness.displayText}</span>
                      </div>
                    )}

                    {/* Owner Confirm Active Action */}
                    {isOwner && !freshness?.isExpired && (
                      <button
                        onClick={handleConfirmActive}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-apple-green/10 hover:bg-apple-green/20 text-apple-green dark:text-emerald-300 border border-apple-green/20 text-[11px] font-bold transition-all cursor-pointer"
                        title="Confirm this listing is still actively available today"
                      >
                        <Check className="w-3 h-3" />
                        <span>Confirm Active</span>
                      </button>
                    )}
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
                      onClick={() => toggleWishlist(property.id)}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer",
                        isSaved ? "bg-apple-red text-white border-apple-red" : "border-apple-border text-apple-text hover:bg-apple-gray"
                      )}
                      title={isSaved ? "Remove from favorites" : "Save property"}
                    >
                      <Heart className={cn("w-4 h-4", isSaved && "fill-current text-white")} />
                    </motion.button>
                  </div>
                </div>

                {/* Zameen-Pattern Stale/Expired Listing Warning Banner */}
                {freshness?.isExpired && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 p-4 rounded-2xl bg-apple-orange/10 dark:bg-apple-orange/15 border border-gold-decoration/30 text-amber-900 dark:text-amber-200 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-apple-orange/20 flex items-center justify-center shrink-0 text-apple-orange dark:text-amber-300 mt-0.5">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-bold tracking-tight">This listing may no longer be available</h4>
                          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-apple-orange/20 text-apple-orange dark:text-amber-300">
                            Stale Listing
                          </span>
                        </div>
                        <p className="text-xs text-apple-orange/90 dark:text-amber-300/90 leading-relaxed">
                          This property was last confirmed active {freshness.daysSinceConfirmed} days ago. Contact the agency to confirm current availability before planning a site visit.
                        </p>
                        {isOwner && (
                          <div className="pt-2">
                            <button
                              onClick={handleReactivate}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-apple-orange hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Confirm Still Available & Reactivate Listing</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                <h1 className="fluid-h1 font-bold tracking-tight text-apple-text mb-2 leading-[1.1] text-balance">
                  {property.model}
                </h1>
                
                <div className="flex items-center gap-2 text-apple-text-muted text-xs md:text-sm mb-4">
                  <MapPin className="w-4 h-4 text-apple-blue shrink-0" />
                  <span>{property.location}</span>
                </div>

                {/* Price Display */}
                <div className="p-4 rounded-apple-xl bg-apple-gray/50 dark:bg-white/5 border border-apple-border/30 mb-6">
                  <div className="text-xs text-apple-text-muted font-medium mb-1">Asking Price</div>
                  <div className="text-2xl md:text-3xl font-extrabold text-apple-text">
                    {formatPrice(property.price)}
                    <span className="text-xs font-normal text-apple-text-muted ml-2">PKR</span>
                  </div>
                </div>

                {/* Key Property Specs Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-apple-border/20 text-center">
                    <Maximize2 className="w-5 h-5 mx-auto mb-1.5 text-apple-blue" />
                    <div className="text-[10px] text-apple-text-muted font-semibold">Covered Area</div>
                    <div className="text-xs font-bold text-apple-text mt-0.5">
                      {property.mileage ? `${property.mileage.toLocaleString()} Sq.Ft.` : property.engineSize}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-apple-border/20 text-center">
                    <Bed className="w-5 h-5 mx-auto mb-1.5 text-apple-blue" />
                    <div className="text-[10px] text-apple-text-muted font-semibold">Bedrooms</div>
                    <div className="text-xs font-bold text-apple-text mt-0.5">
                      {property.bedrooms || property.specs?.seating || 3} Beds
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-apple-border/20 text-center">
                    <Bath className="w-5 h-5 mx-auto mb-1.5 text-apple-blue" />
                    <div className="text-[10px] text-apple-text-muted font-semibold">Baths</div>
                    <div className="text-xs font-bold text-apple-text mt-0.5">
                      {property.bathrooms || property.specs?.horsepower || 3} Baths
                    </div>
                  </div>
                </div>

                {/* Agency / Agent Card */}
                <div className="p-4 rounded-apple-xl border border-apple-border/30 bg-apple-card-bg mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-apple-blue/10 flex items-center justify-center text-apple-blue font-bold text-sm">
                        {property.seller.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-apple-text flex items-center gap-1.5">
                          <span>{property.seller.name}</span>
                          {property.seller.badgeType && property.seller.badgeType !== "none" ? (
                            <Badge type={property.seller.badgeType} size="sm" />
                          ) : (
                            <span className="text-[10px] text-apple-text-muted font-medium px-1.5 py-0.5 rounded bg-apple-gray/50 border border-apple-border/40">
                              Not verified
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-apple-text-muted flex items-center gap-1">
                          <Star className="w-3 h-3 fill-apple-orange text-apple-orange" />
                          <span>{property.seller.rating || "5.0"} Rating</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <a
                      href="tel:+923001234567"
                      className="apple-button-secondary !py-2.5 !text-xs flex items-center justify-center gap-1.5 font-bold"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Agency</span>
                    </a>
                    <button
                      onClick={handleChatWithSeller}
                      className="apple-button-primary !py-2.5 !text-xs flex items-center justify-center gap-1.5 font-bold"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat Directly</span>
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-apple-text mb-2">Property Overview</h3>
                  <p className="text-xs md:text-sm text-apple-text-muted leading-relaxed">
                    {property.description}
                  </p>
                </div>

                {/* Amenities / Features */}
                {property.features && property.features.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-apple-text mb-3">Amenities & Features</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {property.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-apple-text font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-apple-green shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.section>
            </div>
          </div>
        </div>

        {/* Similar Properties Section */}
        <section className="max-w-[1440px] mx-auto px-4 md:px-8 mt-16">
          <h2 className="text-2xl font-bold mb-6">Similar Properties in {property.city}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties
              .filter(p => p.id !== property.id && (p.city === property.city || p.make === property.make))
              .slice(0, 3)
              .map(similar => (
                <PropertyCard key={similar.id} property={similar} />
              ))}
          </div>
        </section>
      </main>

      <ImageLightbox
        isOpen={isGalleryOpen}
        images={property.images}
        initialIndex={activeImageIndex}
        onClose={() => setIsGalleryOpen(false)}
      />
    </div>
  );
}

export const VehicleDetails = PropertyDetails;
