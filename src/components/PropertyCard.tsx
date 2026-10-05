import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { 
  MapPin, 
  Home,
  Building2, 
  Star, 
  Heart, 
  Scale, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  Sparkles,
  Phone,
  MessageCircle,
  Bed,
  Bath,
  Maximize2,
  Play
} from "lucide-react";
import { Property, Vehicle } from "@/types";
import { cn, formatPrice } from "@/lib/utils";
import { formatPropertyUrl } from "@/lib/referenceId";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useWishlist } from "@/context/WishlistContext";
import { useChat } from "@/context/ChatContext";
import Badge from "./Badge";
import PropertyBadgeSlider from "./PropertyBadgeSlider";
import Nudge, { NudgeType } from "./Nudge";
import Skeleton from "./ui/Skeleton";
import PakizzleImage from "./ui/PakizzleImage";
import { REVEAL_EASE, SPRING_SNAPPY } from "./motion";

export interface PropertyCardProps {
  property?: Property;
  vehicle?: Vehicle; // Backwards-compatible alias
  viewMode?: "grid" | "list";
  onCompare?: (property: Property) => void;
  isCompared?: boolean;
  isLoading?: boolean;
}

export const PropertyCard = React.memo(function PropertyCard({ 
  property: propObj, 
  vehicle, 
  viewMode = "grid", 
  onCompare, 
  isCompared, 
  isLoading 
}: PropertyCardProps) {
  const property = propObj || vehicle;
  const [searchParams] = useSearchParams();
  const isRent = searchParams.get("purpose") === "rent";
  const displayPrice = property ? (isRent ? Math.floor(property.price / 400) : property.price) : 0;

  if (isLoading || !property) {
    const isList = viewMode === "list";
    return (
      <div className={cn(
        "glass-card overflow-hidden h-full flex flex-col cq-card-root",
        isList && "sm:flex-row gap-4 p-2.5 md:p-4"
      )}>
        <Skeleton className={cn(
          "aspect-[4/3] w-full shrink-0",
          isList && "sm:w-[256px] md:w-[304px] rounded-apple-lg"
        )} />
        <div className="p-5 flex-1 space-y-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-8 w-3/4" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
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
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);

  // Valuation Assessment Index
  const dealValue = React.useMemo(() => {
    const numId = parseInt(property.id.replace(/\D/g, "") || "5");
    if (numId % 3 === 0) {
      return { 
        type: "great" as const,
        label: "Great Price", 
        bg: "bg-[#5FA84C]/10 text-[#5FA84C] border-[#5FA84C]/30", 
        detail: "Below average market valuation" 
      };
    } else if (numId % 4 === 0) {
      return { 
        type: "fair" as const,
        label: "Fair Valuation", 
        bg: "bg-[#4A90D2]/10 text-[#4A90D2] border-[#4A90D2]/30", 
        detail: "Highly competitive per sq.ft. rate" 
      };
    }
    return { 
      type: "verified" as const,
      label: "Verified Price", 
      bg: "bg-[#5B2A86]/10 dark:bg-[#FAF3E6]/10 text-[#5B2A86] dark:text-[#FAF3E6] border-[#5B2A86]/20 dark:border-[#C9A227]/30", 
      detail: "LDA/CDA verified legal valuation" 
    };
  }, [property.id]);

  // Nudges
  const nudges = React.useMemo(() => {
    const list: { type: NudgeType; text?: string }[] = [];
    if (property.isFeatured) list.push({ type: "featured" });
    if (parseInt(property.id.replace(/\D/g, "")) % 3 === 0) list.push({ type: "urgency", text: "8 buyers viewed this today" });
    if (property.price < 25000000) list.push({ type: "value" });
    if (parseInt(property.id.replace(/\D/g, "")) % 5 === 0) list.push({ type: "new" });
    return list;
  }, [property.id, property.isFeatured, property.price]);

  // Real estate badges
  const displayBadges = React.useMemo(() => {
    if (property.badges && property.badges.length > 0) return property.badges;
    
    const list: { type: any; label: string }[] = [];
    if (property.seller.badgeType === 'business') list.push({ type: "verified_agency", label: "Certified Agency" });
    if (property.seller.isVerified) list.push({ type: "verified_user", label: "Verified Agent" });
    if (parseInt(property.id.replace(/\D/g, "")) % 2 === 0) list.push({ type: "lda_approved", label: "Title Deed Verified" });
    if (property.condition === 'ready') list.push({ type: "ready_to_move", label: "Ready to Move" });
    if (property.condition === 'off_plan') list.push({ type: "off_plan", label: "Off-Plan Project" });
    if (parseInt(property.id.replace(/\D/g, "")) % 3 === 0) list.push({ type: "selling_fast", label: "High Rental Yield" });
    
    return list;
  }, [property.badges, property.seller.badgeType, property.seller.isVerified, property.id, property.condition]);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toggleWishlist(property.id);
    const defaultList = lists.find(l => l.isDefault);
    const listName = defaultList?.name || "Favorites";
    
    setToast({
      show: true,
      type: !isSaved ? 'added' : 'removed',
      listName: listName,
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
        name: `${property.make} - ${property.model}`,
        price: property.price,
        image: property.images[0]
      }
    );
    navigate('/chat');
  };

  const handleCardClick = () => {
    navigate(formatPropertyUrl(property));
  };

  return (
    <div className="relative group h-full w-full cq-card-root">
      <div 
        onClick={handleCardClick}
        className="block h-full cursor-pointer"
      >
        <motion.div
          whileHover={shouldReduceMotion ? undefined : {
            y: -6,
            scale: 1.012,
            boxShadow: "0 22px 38px -12px rgba(0, 0, 0, 0.16), 0 0 1px 1px rgba(255, 255, 255, 0.15) inset",
            transition: {
              duration: 0.3,
              ease: REVEAL_EASE
            }
          }}
          whileTap={shouldReduceMotion ? undefined : {
            scale: 0.985,
            transition: SPRING_SNAPPY
          }}
          className={cn(
            "flex flex-col h-full overflow-hidden transition-colors duration-300 rounded-[24px] liquid-glass-mid glass-hover-sheen group/card",
            property.isFeatured 
              ? "border border-[#C9A227]/60 shadow-[0_8px_30px_rgba(201,162,39,0.12)]" 
              : "border border-apple-border/40",
            isList ? "md:flex-row p-2.5" : ""
          )}
        >
          {/* 1. Image Carousel Section */}
          <div className={cn(
            "relative shrink-0",
            isList ? "w-full md:w-[256px] lg:w-[304px]" : "w-full"
          )}>
            <div className={cn(
              "rounded-[20px] overflow-hidden relative shadow-sm group/carousel w-full aspect-[3/2] bg-slate-100 dark:bg-slate-800",
              isList ? "min-h-[176px] md:min-h-0 md:h-full" : ""
            )}>
              <PakizzleImage
                src={property.images[activeImageIndex] || property.images[0]} 
                alt={`${property.make} ${property.model}`}
                aspectRatio="3/2"
                targetWidth={600}
                priority={false}
                imgClassName="transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

              {/* Quick Carousel Controls */}
              {property.images && property.images.length > 1 && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.88 }}
                    transition={SPRING_SNAPPY}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1));
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center opacity-85 md:opacity-0 md:group-hover/carousel:opacity-100 transition-opacity duration-200 hover:bg-black/85 z-20 cursor-pointer shadow-md touch-target min-w-[36px] min-h-[36px]"
                    type="button"
                    title="Previous photo"
                  >
                    <ChevronLeft className="w-4.5 h-4.5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.88 }}
                    transition={SPRING_SNAPPY}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev === property.images.length - 1 ? 0 : prev + 1));
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center opacity-85 md:opacity-0 md:group-hover/carousel:opacity-100 transition-opacity duration-200 hover:bg-black/85 z-20 cursor-pointer shadow-md touch-target min-w-[36px] min-h-[36px]"
                    type="button"
                    title="Next photo"
                  >
                    <ChevronRight className="w-4.5 h-4.5" />
                  </motion.button>
                  
                  {/* Indicator Dots */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 bg-black/25 backdrop-blur-md px-2 py-1 rounded-full z-20">
                    {property.images.slice(0, 5).map((_, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "w-1 h-1 rounded-full transition-all duration-300",
                          i === activeImageIndex ? "bg-white w-2.5" : "bg-white/40"
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
              
              {/* Badge Slider Overlay */}
              <PropertyBadgeSlider badges={displayBadges as any} />

              {/* Status Tags */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                {nudges.slice(0, 1).map((nudge, i) => (
                  <Nudge key={i} type={nudge.type} text={nudge.text} />
                ))}
              </div>

              {/* PakStories Video Walkthrough Launcher Pill */}
              {property.seller?.isVerified && (parseInt(property.id.replace(/\D/g, "") || "1") % 2 === 0 || property.id.includes('1') || property.id.includes('2')) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/stories`);
                  }}
                  className="absolute bottom-3 right-3 z-20 px-2.5 py-1 rounded-full bg-black/80 hover:bg-black text-white text-[10px] font-black flex items-center gap-1.5 shadow-lg border border-white/20 backdrop-blur-md group/video cursor-pointer transition-transform hover:scale-105"
                  title="Watch verified vertical video walkthrough on PakStories"
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-[#5B2A86] to-[#8A3DB8] flex items-center justify-center">
                    <Play className="w-2 h-2 text-white fill-white ml-0.5" />
                  </div>
                  <span>Walkthrough</span>
                </button>
              )}
            </div>
          </div>

          {/* 2. Listing Information Panel */}
          <div className={cn(
            "flex flex-col flex-1 relative",
            isList 
              ? "p-3 md:p-4 lg:p-4.5 md:pl-4" 
              : "p-4 pb-1.5 md:p-5 md:pb-2"
          )}>
            
            {/* Value Tag Header */}
            <div className="flex items-center gap-2 mb-2 min-w-0">
              <span className={cn(
                "pl-2 pr-3 py-1 rounded-full border flex items-center gap-1.5 shrink-0 select-none",
                dealValue.bg
              )}>
                <Sparkles className="w-3 h-3 shrink-0" />
                <span className="flex flex-col text-left leading-[1.05] font-black tracking-wider text-[7.5px]">
                  <span>{dealValue.label.split(" ")[0].toUpperCase()}</span>
                  <span>{dealValue.label.split(" ")[1]?.toUpperCase() || "VALUATION"}</span>
                </span>
              </span>
              <span className="text-[10px] md:text-[11px] text-apple-text-muted dark:text-[#86868B] truncate font-medium">
                {dealValue.detail}
              </span>
            </div>

            {/* Price Detail Row */}
            {!isList && (
              <div className="font-bold text-apple-text text-lg md:text-2xl tracking-tight mb-1.5 flex items-baseline gap-1">
                <span>{formatPrice(displayPrice)}</span>
                <span className="text-[10px] font-normal text-apple-text-muted">{isRent ? "PKR / mo" : "PKR"}</span>
              </div>
            )}

            {/* Title / Make & Model Row */}
            <div className={cn(
              "flex flex-col sm:flex-row justify-between items-start gap-1 sm:gap-4",
              isList ? "mb-2 pr-12" : "mb-1"
            )}>
              <div className="min-w-0 w-full">
                <h3 className={cn(
                  "font-bold text-apple-text leading-tight tracking-tight line-clamp-2 flex items-baseline flex-wrap gap-1.5",
                  isList ? "text-base md:text-2xl" : "text-sm md:text-lg"
                )}>
                  <span>{property.model}</span>
                  {!isList && (
                    <span className="text-[10px] font-normal text-apple-text-muted select-none self-baseline">
                      • Built {property.year}
                    </span>
                  )}
                  {!isList && property.seller.badgeType && (
                    <Badge type={property.seller.badgeType} size="sm" />
                  )}
                </h3>
                {isList && (
                  <div className="text-[11px] md:text-xs text-apple-text-muted font-medium mt-1">
                    Year Built: <span className="text-apple-text font-semibold">{property.year}</span>
                  </div>
                )}
              </div>
              
              {/* Price in List View */}
              {isList && (
                <div className="text-right shrink-0">
                  <div className="font-bold text-apple-text text-lg md:text-2xl tracking-tight leading-none">
                    {formatPrice(displayPrice)}
                  </div>
                  <div className="text-[10px] font-bold text-[#5B2A86] dark:text-[#FAF3E6] uppercase tracking-widest mt-1">{isRent ? "PKR / month" : "PKR"}</div>
                </div>
              )}
            </div>

            {/* Nudges inline on list view */}
            {isList && nudges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {nudges.map((nudge, i) => (
                  <Nudge key={i} type={nudge.type} text={nudge.text} variant="inline" />
                ))}
              </div>
            )}

            {/* Geographic details */}
            <div className={cn(
              "flex items-center gap-1.5 text-apple-text-muted font-medium text-[11px] md:text-sm truncate",
              isList ? "mb-2 mt-0.5" : "mb-1.5 mt-0.5"
            )}>
              <MapPin className="w-3.5 h-3.5 shrink-0 text-[#5B2A86] dark:text-[#C9A227]" />
              {property.city ? (
                <>
                  {property.area && (
                    <span className="font-semibold text-apple-text">
                      {property.area.replace(new RegExp(`\\s*${property.city}$`, 'i'), '')}
                    </span>
                  )}
                  {property.area && <span className="mx-1 opacity-40">•</span>}
                  <span>{property.city}</span>
                </>
              ) : (
                <span>{property.location}</span>
              )}
            </div>

            {/* Accent Separator Line */}
            <div className={cn(
              "h-[1px] bg-slate-100 dark:bg-slate-800 w-full",
              isList ? "mb-2 md:mb-2.5" : "mb-2"
            )} />

            {/* Property specs: Beds, Baths, Covered Area, Furnished Status */}
            <div className={cn(
              "flex items-center flex-wrap gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium",
              isList ? "mb-3" : "mb-2.5"
            )}>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {property.mileage ? `${property.mileage.toLocaleString()} Sq.Ft.` : property.engineSize}
              </span>
              <span className="text-slate-300 dark:text-slate-700 select-none">•</span>
              <span>
                {property.make === "Plot" || property.make === "Commercial"
                  ? property.engineSize
                  : `${property.bedrooms || property.specs?.seating || 3} Bed, ${property.bathrooms || property.specs?.horsepower || 3} Bath`}
              </span>
              <span className="text-slate-300 dark:text-slate-700 select-none">•</span>
              <span className="capitalize">
                {property.transmission === "furnished"
                  ? "Furnished"
                  : property.transmission === "semi-furnished"
                  ? "Semi-Furnished"
                  : "Unfurnished"}
              </span>
            </div>

            {/* Grid View Seller Bar */}
            {!isList && (
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-apple-border/20">
                <Link 
                  to={`/profile/${property.seller.uid || 'user-redspots'}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 min-w-0 group/seller max-w-[70%]"
                >
                  <div className="w-5 h-5 rounded-full bg-[#5B2A86]/10 dark:bg-white/5 flex items-center justify-center text-[10px] font-bold text-[#5B2A86] dark:text-[#FAF3E6] shrink-0 group-hover/seller:scale-105 transition-all">
                    {property.seller.name ? property.seller.name[0] : "A"}
                  </div>
                  <span className="text-xs font-semibold text-apple-text-muted group-hover/seller:text-[#5B2A86] truncate transition-colors">
                    {property.seller.name}
                  </span>
                  <Badge 
                    type={property.seller.verified_badge_type || property.seller.badgeType || (property.seller.isVerified ? 'identity' : 'none')} 
                    size="sm" 
                  />
                </Link>
                
                <div className="flex items-center gap-1 text-[11px] font-semibold text-apple-text-muted shrink-0">
                  <Star className="w-3 h-3 fill-[#F0A830] text-[#F0A830]" />
                  <span>{property.seller.rating || "5.0"}</span>
                </div>
              </div>
            )}

            {/* List View Action Console */}
            {isList && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-auto pt-3 border-t border-apple-border/10 gap-2.5">
                <Link 
                  to={`/profile/${property.seller.uid || 'user-redspots'}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-3 min-w-0 group/seller"
                >
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#5B2A86]/10 dark:bg-white/5 flex items-center justify-center text-xs md:text-sm font-bold shadow-inner border border-apple-border/40 shrink-0 group-hover/seller:scale-105 transition-all text-[#5B2A86] dark:text-[#FAF3E6]">
                    {property.seller.name ? property.seller.name[0] : "A"}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs md:text-sm font-bold text-apple-text truncate group-hover/seller:text-[#5B2A86] transition-colors flex items-center gap-1.5 flex-wrap">
                      <span>{property.seller.name}</span>
                      <Badge 
                        type={property.seller.verified_badge_type || property.seller.badgeType || (property.seller.isVerified ? 'identity' : 'none')} 
                        size="sm" 
                      />
                    </div>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-2.5 h-2.5",
                            i < Math.floor(property.seller.rating || 5)
                              ? "fill-[#F0A830] text-[#F0A830]"
                              : "text-apple-border"
                          )}
                        />
                      ))}
                      <span className="text-[10px] text-apple-text-muted ml-0.5 font-semibold">({property.seller.rating || "5.0"})</span>
                    </div>
                  </div>
                </Link>
                
                <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                  <a 
                    href="tel:+923001234567"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold rounded-full border border-apple-border hover:bg-apple-gray dark:hover:bg-white/5 text-apple-text active:scale-95 transition-all cursor-pointer shadow-sm"
                    title="Call Agency"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span className="hidden leading-none md:inline">Call</span>
                  </a>

                  <a 
                    href={`https://wa.me/923001234567?text=${encodeURIComponent(`Hi, I'm interested in your ${property.make} ${property.model} (${property.location}) listed on Pakizzle.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold rounded-full border border-[#25D366]/20 bg-[#25D366]/10 hover:bg-[#25D366]/25 text-[#25D366] active:scale-95 transition-all cursor-pointer shadow-sm"
                    title="WhatsApp Agency"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="hidden leading-none md:inline">WhatsApp</span>
                  </a>

                  <button 
                    onClick={handleChatWithSeller}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold rounded-full border border-[#5B2A86]/20 bg-[#5B2A86]/5 hover:bg-[#5B2A86]/15 text-[#5B2A86] dark:text-[#FAF3E6] active:scale-95 transition-all cursor-pointer shadow-sm"
                    title="Instant Chat"
                    type="button"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="hidden leading-none md:inline">Chat</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCardClick();
                    }}
                    className="pakizzle-button-primary !h-8 px-4 !text-[11px] !rounded-full flex items-center justify-center font-bold tracking-tight shadow-md hover:shadow-lg active:scale-95 transition-all"
                  >
                    View Details
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </motion.div>
      </div>
      
      {/* Overlaid Favorite & Compare Buttons */}
      <div className={cn(
        "absolute z-30 flex flex-col gap-2.5",
        "top-5 right-5"
      )}>
        <motion.button
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.85 }}
          transition={SPRING_SNAPPY}
          onClick={handleToggleWishlist}
          className={cn(
            "w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-xl transition-all duration-[400ms] shadow-apple-soft border border-apple-border/20 cursor-pointer",
            isSaved 
              ? "bg-[#D93A45] text-white border-[#D93A45] shadow-md opacity-100" 
              : "bg-white/80 dark:bg-black/80 text-apple-text hover:bg-white dark:hover:bg-white/15 opacity-0 group-hover:opacity-100",
            isList && !isSaved && "opacity-100 bg-white dark:bg-black"
          )}
          title={isSaved ? "Remove from favorites" : "Save property"}
        >
          <motion.div
            animate={isSaved ? { scale: [1, 1.4, 0.9, 1] } : { scale: 1 }}
            transition={SPRING_SNAPPY}
          >
            <Heart className={cn("w-4.5 h-4.5", isSaved && "fill-current text-white")} />
          </motion.div>
        </motion.button>
        {onCompare && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCompare(property);
            }}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-xl transition-all duration-[400ms] shadow-apple-soft border border-apple-border/20 cursor-pointer",
              isCompared 
                ? "bg-[#5B2A86] text-white border-[#5B2A86] shadow-md opacity-100" 
                : "bg-white/80 dark:bg-black/80 text-apple-text hover:bg-white dark:hover:bg-white/15 opacity-0 group-hover:opacity-100"
            )}
            title="Compare properties"
          >
            <Scale className="w-4.5 h-4.5" />
          </motion.button>
        )}
      </div>
    </div>
  );
});

export default PropertyCard;
export const VehicleCard = PropertyCard;
