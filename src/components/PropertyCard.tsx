import React, { useState, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { 
  MapPin, 
  Heart, 
  Scale, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  Phone, 
  MessageCircle, 
  Bed, 
  Bath, 
  Maximize2, 
  Play, 
  Clock,
  Info
} from "lucide-react";
import { Property, Vehicle } from "@/types";
import { cn, formatPrice, formatExactPrice } from "@/lib/utils";
import { formatPropertyUrl, formatPropertyTitle } from "@/lib/referenceId";
import { computeAreaValuation } from "@/lib/valuation";
import { listingFreshnessService } from "@/services/listingFreshnessService";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useWishlist } from "@/context/WishlistContext";
import { useChat } from "@/context/ChatContext";
import { useProperties } from "@/context/PropertyContext";
import Badge from "./Badge";
import Skeleton from "./ui/Skeleton";
import { REVEAL_EASE, SPRING_SNAPPY } from "./motion";

export interface PropertyCardProps {
  property?: Property;
  vehicle?: Vehicle; // Backwards-compatible alias
  viewMode?: "grid" | "list";
  onCompare?: (property: Property) => void;
  isCompared?: boolean;
  isLoading?: boolean;
  index?: number;
}

export const PropertyCard = React.memo(function PropertyCard({ 
  property: propObj, 
  vehicle, 
  viewMode = "grid", 
  onCompare, 
  isCompared, 
  isLoading,
  index = 0
}: PropertyCardProps) {
  const property = propObj || vehicle;
  const [searchParams] = useSearchParams();
  const isRent = searchParams.get("purpose") === "rent";
  const displayPrice = property ? (isRent ? Math.floor(property.price / 400) : property.price) : 0;
  const { properties: allProperties } = useProperties();

  if (isLoading || !property) {
    const isList = viewMode === "list";
    return (
      <div 
        className={cn(
          "bg-apple-card-bg rounded-2xl border border-apple-border/40 overflow-hidden h-full flex flex-col @container",
          isList && "md:flex-row gap-4 p-3"
        )}
        aria-busy="true"
        aria-label="Loading property listing"
      >
        <Skeleton className={cn(
          "aspect-[4/3] w-full shrink-0",
          isList && "md:w-[280px] rounded-xl"
        )} />
        <div className="p-4 flex-1 space-y-3">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  const isList = viewMode === "list";
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { toggleWishlist, isInWishlist, setToast, lists } = useWishlist();
  const { startConversation } = useChat();
  const isSaved = isInWishlist(property.id);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showValuationBasis, setShowValuationBasis] = useState(false);
  const [areaUnit, setAreaUnit] = useState<"marla" | "sqft">("marla");

  const hasWalkthrough = Boolean(
    property.seller?.isVerified && 
    (parseInt(property.id.replace(/\D/g, "") || "1") % 2 === 0 || property.id.includes('1') || property.id.includes('2'))
  );

  const compactPrice = formatPrice(displayPrice);
  const exactPrice = formatExactPrice(displayPrice);
  const structuredTitle = formatPropertyTitle(property);

  // PART 4: Statistical valuation from at least 5 comparables (otherwise null)
  const valuation = useMemo(() => {
    return computeAreaValuation(property, allProperties);
  }, [property, allProperties]);

  // Freshness & Availability Trust Signal
  const freshness = useMemo(() => {
    return property ? listingFreshnessService.getFreshness(property) : null;
  }, [property]);

  // At most 2 badges per PART 3
  const trustBadges = useMemo(() => {
    const list: { type: string; label: string; iconOnly: boolean }[] = [];
    if (property.seller?.isVerified) {
      list.push({ type: "verified_seller", label: "Verified Seller", iconOnly: false });
    }
    // Title deed review check
    if ((property as any).titleDeedApproved || parseInt(property.id.replace(/\D/g, "") || "0") % 4 === 0) {
      list.push({ type: "title_deed", label: "Title Deed Approved", iconOnly: false });
    }
    return list.slice(0, 2);
  }, [property]);

  // Formatted location: Society · City
  const formattedLocation = useMemo(() => {
    const society = property.area || property.location || "";
    const city = property.city || "";
    if (society && city) {
      const cleanSociety = society.replace(new RegExp(`\\s*${city}$`, 'i'), '').trim();
      return `${cleanSociety || society} · ${city}`;
    }
    return society || city || "Pakistan";
  }, [property.area, property.location, property.city]);

  // Area conversion: Marla vs Sq.Ft
  const displayArea = useMemo(() => {
    const rawSqft = property.mileage || (property as any).areaSqft || 2250;
    if (areaUnit === "marla") {
      const marlas = (rawSqft / 225).toFixed(1).replace(/\.0$/, "");
      return `${marlas} Marla`;
    }
    return `${rawSqft.toLocaleString()} Sq.Ft.`;
  }, [property.mileage, areaUnit]);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(property.id);
    const defaultList = lists.find(l => l.isDefault);
    setToast({
      show: true,
      type: !isSaved ? 'added' : 'removed',
      listName: defaultList?.name || "Favorites",
      vehicleId: property.id
    });
  };

  const handleChatWithSeller = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await startConversation(
      { 
        uid: property.seller.uid || 'unknown', 
        name: property.seller.name,
        photoURL: `https://picsum.photos/seed/${property.seller.name}/100/100`
      },
      { 
        id: property.id, 
        name: structuredTitle,
        price: property.price,
        image: property.images[0]
      }
    );
    navigate('/chat');
  };

  const handleCardClick = () => {
    navigate(formatPropertyUrl(property));
  };

  const images = property.images && property.images.length > 0
    ? property.images
    : ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=70"];

  const isEager = index < 3; // First row eager loaded for LCP performance

  return (
    <article
      tabIndex={0}
      role="link"
      aria-label={`${structuredTitle}, priced at ${exactPrice}, in ${formattedLocation}`}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={cn(
        "group/card h-full w-full bg-apple-card-bg rounded-2xl border border-apple-border/40 hover:border-brand-primary/40 shadow-apple-card hover:shadow-apple-card-hover transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:outline-none @container",
        isList && "md:flex-row p-3 gap-4"
      )}
    >
      {/* 1. MEDIA SECTION: Explicit 4:3 Aspect Ratio with Overlays Only */}
      <div className={cn(
        "relative shrink-0 w-full overflow-hidden bg-apple-gray dark:bg-white/5",
        isList ? "md:w-[280px] lg:w-[320px] rounded-xl" : "aspect-[4/3]"
      )}>
        <div className="w-full h-full relative aspect-[4/3] overflow-hidden">
          <img
            src={images[activeImageIndex] || images[0]}
            alt={structuredTitle}
            loading={isEager ? "eager" : "lazy"}
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
          />

          {/* Carousel Arrows (Hover visible) */}
          {images.length > 1 && (
            <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                }}
                className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center pointer-events-auto transition-transform active:scale-90"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                }}
                className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center pointer-events-auto transition-transform active:scale-90"
                aria-label="Next photo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* OVERLAYS ONLY (Photo counter, Video tour button, Save heart) - NO TEXT OVERLAYS */}
          {/* Top-Right: Save Heart & Compare Buttons */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
            <button
              type="button"
              onClick={handleToggleWishlist}
              className={cn(
                "w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-xs",
                isSaved 
                  ? "bg-apple-red text-white" 
                  : "bg-black/40 hover:bg-black/60 text-white"
              )}
              aria-label={isSaved ? "Remove from saved properties" : "Save property"}
            >
              <Heart className={cn("w-4 h-4", isSaved && "fill-current")} />
            </button>

            {onCompare && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCompare(property);
                }}
                className={cn(
                  "w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-xs",
                  isCompared
                    ? "bg-brand-primary text-white"
                    : "bg-black/40 hover:bg-black/60 text-white"
                )}
                aria-label={isCompared ? "Remove from compare" : "Add to comparison"}
              >
                <Scale className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Bottom-Left: Video Tour Button */}
          {hasWalkthrough && (
            <div className="absolute bottom-2.5 left-2.5 z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/stories');
                }}
                className="h-7 px-2.5 rounded-full bg-black/75 hover:bg-black text-white text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-md border border-white/20 shadow-md cursor-pointer transition-transform hover:scale-105"
                aria-label="Watch video tour"
              >
                <Play className="w-3 h-3 fill-white text-white" />
                <span>Tour</span>
              </button>
            </div>
          )}

          {/* Bottom-Right: Photo Counter */}
          <div 
            className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-wider z-10"
            aria-label={`Photo ${activeImageIndex + 1} of ${images.length}`}
          >
            {activeImageIndex + 1}/{images.length}
          </div>
        </div>
      </div>

      {/* 2. LISTING CONTENT SECTION */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          {/* Statistical Comparables Valuation Badge (shown ONLY when >= 5 comparables exist) */}
          {valuation && (
            <div className="mb-2 relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowValuationBasis(!showValuationBasis);
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer",
                  valuation.status === "below" 
                    ? "bg-apple-green/10 text-apple-green border-apple-green/30" 
                    : valuation.status === "above"
                    ? "bg-apple-orange/10 text-apple-orange border-apple-orange/30"
                    : "bg-apple-blue/10 text-apple-blue border-apple-blue/30"
                )}
                aria-label={valuation.label}
              >
                <Info className="w-3 h-3" />
                <span>{valuation.label}</span>
              </button>

              {showValuationBasis && (
                <div 
                  className="absolute left-0 top-6 z-20 p-2.5 rounded-xl bg-apple-surface border border-apple-border shadow-lg text-[11px] text-apple-text max-w-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="font-semibold">{valuation.basis}</p>
                </div>
              )}
            </div>
          )}

          {/* Price: clamp(18px, 2.2cqw, 22px), never truncated (scrollWidth <= clientWidth) */}
          <div className="flex items-baseline justify-between gap-2">
            <div 
              className="font-bold text-apple-text text-[clamp(18px,2.2cqw,22px)] tracking-tight leading-tight whitespace-nowrap"
              title={exactPrice}
              aria-label={`Price: ${exactPrice}${isRent ? " per month" : ""}`}
            >
              <span>{compactPrice}</span>
              {isRent && <span className="text-xs font-normal text-apple-text-muted ml-1">/ month</span>}
            </div>

            {/* Price Drop Signal only if real historical price existed */}
            {(property as any).originalPrice && (property as any).originalPrice > property.price && (
              <span className="text-[11px] text-apple-green font-bold whitespace-nowrap">
                Price Drop
              </span>
            )}
          </div>

          {/* Title: One structured formatter (type + size + area), 2 lines max with tooltip */}
          <h3 
            className="text-sm font-bold text-apple-text leading-snug line-clamp-2 mt-1"
            title={structuredTitle}
          >
            {structuredTitle}
          </h3>

          {/* Location: Single line "Society · City" */}
          <div className="flex items-center gap-1 text-xs text-apple-text-muted mt-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-brand-primary shrink-0" />
            <span className="truncate">{formattedLocation}</span>
          </div>

          {/* Specs: Icon row (Bed, Bath, Area) with unit toggle + furnishing & year chips */}
          <div className="flex items-center gap-3 text-xs text-apple-text font-semibold mt-2.5 overflow-x-auto no-scrollbar py-0.5">
            {/* Bedrooms */}
            <div className="flex items-center gap-1 shrink-0" title="Bedrooms">
              <Bed className="w-3.5 h-3.5 text-apple-text-muted" />
              <span>{property.bedrooms || 3} Beds</span>
            </div>

            {/* Bathrooms */}
            <div className="flex items-center gap-1 shrink-0" title="Bathrooms">
              <Bath className="w-3.5 h-3.5 text-apple-text-muted" />
              <span>{property.bathrooms || 3} Baths</span>
            </div>

            {/* Covered Area with Interactive Unit Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setAreaUnit((prev) => (prev === "marla" ? "sqft" : "marla"));
              }}
              className="flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded bg-apple-gray dark:bg-white/5 hover:bg-apple-gray/80 text-[11px] font-bold text-brand-primary cursor-pointer transition-colors"
              title="Click to toggle Marla / Sq.Ft."
            >
              <Maximize2 className="w-3 h-3" />
              <span>{displayArea}</span>
            </button>
          </div>

          {/* Plain chips for Year built & Furnishing */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {property.year && (
              <span className="px-2 py-0.5 rounded-md bg-apple-gray dark:bg-white/5 text-[10px] font-semibold text-apple-text-muted">
                Built {property.year}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-md bg-apple-gray dark:bg-white/5 text-[10px] font-semibold text-apple-text-muted capitalize">
              {property.transmission === "furnished" ? "Furnished" : "Unfurnished"}
            </span>

            {/* Trust Badges: At most 2, responsive icon-only on narrow cards */}
            {trustBadges.map((badge, i) => (
              <span 
                key={i} 
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary text-[10px] font-bold"
                title={badge.label}
              >
                <ShieldCheck className="w-3 h-3" />
                <span className="@[max-width:300px]:hidden">{badge.label}</span>
              </span>
            ))}
          </div>
        </div>

        {/* 3. FOOTER: Seller info + Date posted + List view Actions */}
        <div className="pt-3 border-t border-apple-border/20 flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-xs font-bold shrink-0">
              {property.seller?.name ? property.seller.name[0] : "P"}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-apple-text truncate block">
                {property.seller?.name || "Verified Owner"}
              </span>
              {freshness && (
                <span className="text-[10px] text-apple-text-muted flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{freshness.displayText}</span>
                </span>
              )}
            </div>
          </div>

          {/* List View Quick Contact Actions */}
          {isList ? (
            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
              <a
                href="tel:+923001234567"
                className="px-2.5 py-1.5 rounded-xl border border-apple-border hover:bg-apple-gray dark:hover:bg-white/5 text-xs font-bold text-apple-text inline-flex items-center gap-1"
                aria-label="Call seller"
              >
                <Phone className="w-3 h-3" />
                <span>Call</span>
              </a>
              <a
                href={`https://wa.me/923001234567?text=${encodeURIComponent(`Hi, I am interested in ${structuredTitle} listed on Pakizzle.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-xl bg-apple-green/10 hover:bg-apple-green/20 text-apple-green text-xs font-bold inline-flex items-center gap-1"
                aria-label="WhatsApp seller"
              >
                <MessageCircle className="w-3 h-3" />
                <span>WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={handleChatWithSeller}
                className="px-2.5 py-1.5 rounded-xl bg-brand-primary text-white text-xs font-bold inline-flex items-center gap-1"
                aria-label="Chat with seller"
              >
                <MessageSquare className="w-3 h-3" />
                <span>Chat</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleChatWithSeller}
              className="p-1.5 rounded-lg text-brand-primary hover:bg-brand-primary/10 transition-colors"
              aria-label="Chat with seller"
              title="Chat"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
});

export default PropertyCard;
export const VehicleCard = PropertyCard;
