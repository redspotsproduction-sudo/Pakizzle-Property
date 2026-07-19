import React from "react";
import { motion } from "motion/react";
import { 
  MapPin, 
  Gauge, 
  Star, 
  Car, 
  Eye, 
  Heart, 
  Scale, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  Sparkles,
  Zap,
  Info,
  Phone,
  MessageCircle
} from "lucide-react";
import { Vehicle } from "@/types";
import { cn, formatPrice } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "@/context/WishlistContext";
import { useChat } from "@/context/ChatContext";
import Badge from "./Badge";
import CarBadgeSlider, { BadgeType } from "./CarBadgeSlider";
import Nudge, { NudgeType } from "./Nudge";
import Skeleton from "./ui/Skeleton";

interface VehicleCardProps {
  vehicle: Vehicle;
  viewMode?: "grid" | "list";
  onCompare?: (vehicle: Vehicle) => void;
  isCompared?: boolean;
  isLoading?: boolean;
}

export default React.memo(function VehicleCard({ vehicle, viewMode = "grid", onCompare, isCompared, isLoading }: VehicleCardProps) {
  if (isLoading) {
    const isList = viewMode === "list";
    return (
      <div className={cn(
        "glass-card overflow-hidden h-full flex flex-col",
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
  const { toggleWishlist, isInWishlist, setToast, lists } = useWishlist();
  const { startConversation } = useChat();
  const isSaved = isInWishlist(vehicle.id);
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);

  // Mock value index deal analysis for premium UX
  const dealValue = React.useMemo(() => {
    // Generate organic feel valuation assessment based on ID
    const numId = parseInt(vehicle.id.replace(/\D/g, "") || "5");
    if (numId % 3 === 0) {
      return { 
        type: "great" as const,
        label: "Great Price", 
        bg: "bg-emerald-500/10 dark:bg-emerald-950/25 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 dark:border-emerald-500/20", 
        detail: "Below average market value" 
      };
    } else if (numId % 4 === 0) {
      return { 
        type: "fair" as const,
        label: "Fair Price", 
        bg: "bg-teal-500/10 dark:bg-teal-950/25 text-teal-600 dark:text-teal-400 border-teal-500/30 dark:border-teal-500/20", 
        detail: "Highly competitive valuation" 
      };
    }
    return { 
      type: "verified" as const,
      label: "Verified Price", 
      bg: "bg-apple-gray/50 dark:bg-[#1C1C1E] text-apple-text-muted dark:text-[#86868B] border-apple-border/10 dark:border-white/5", 
      detail: "Accurate relative to condition" 
    };
  }, [vehicle.id]);

  // Mock nudges based on vehicle ID for demo purposes
  const nudges = React.useMemo(() => {
    const list: { type: NudgeType; text?: string }[] = [];
    if (vehicle.isFeatured) list.push({ type: "featured" });
    if (parseInt(vehicle.id.replace(/\D/g, "")) % 3 === 0) list.push({ type: "urgency", text: "5 people viewed this today" });
    if (vehicle.price < 5000000) list.push({ type: "value" });
    if (parseInt(vehicle.id.replace(/\D/g, "")) % 5 === 0) list.push({ type: "new" });
    return list;
  }, [vehicle.id, vehicle.isFeatured, vehicle.price]);

  // Mock badges based on vehicle data for demo
  const displayBadges = React.useMemo(() => {
    if (vehicle.badges && vehicle.badges.length > 0) return vehicle.badges;
    
    // Generate some mock badges if none exist
    const list: { type: any; label: string }[] = [];
    if (vehicle.seller.badgeType === 'business') list.push({ type: "verified_business", label: "Verified Business" });
    if (vehicle.seller.isVerified) list.push({ type: "verified_user", label: "Verified User" });
    if (parseInt(vehicle.id.replace(/\D/g, "")) % 2 === 0) list.push({ type: "auction_verified", label: "Auction Sheet Verified" });
    if (vehicle.condition === 'new') list.push({ type: "new_car", label: "New Car" });
    if (vehicle.condition === 'used') list.push({ type: "used_car", label: "Used Car" });
    if (parseInt(vehicle.id.replace(/\D/g, "")) % 3 === 0) list.push({ type: "selling_fast", label: "Selling Fast" });
    if (vehicle.price < 4000000) list.push({ type: "great_price", label: "Great Price" });
    
    return list;
  }, [vehicle.badges, vehicle.seller.badgeType, vehicle.seller.isVerified, vehicle.id, vehicle.condition, vehicle.price]);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toggleWishlist(vehicle.id);
    
    const defaultList = lists.find(l => l.isDefault);
    const listName = defaultList?.name || "Favorites";
    
    if (!isSaved) {
       setToast({
        show: true,
        type: 'added',
        listName: listName,
        vehicleId: vehicle.id
      });
    } else {
      setToast({
        show: true,
        type: 'removed',
        listName: listName,
        vehicleId: vehicle.id
      });
    }
  };

  const handleChatWithSeller = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const handleCardClick = () => {
    navigate(`/vehicle/${vehicle.id}`);
  };

  return (
    <div className="relative group h-full w-full">
      <div 
        onClick={handleCardClick}
        className="block h-full cursor-pointer"
      >
        <motion.div
          className={cn(
            "glass-card flex flex-col h-full overflow-hidden border border-apple-border/40 hover:border-apple-blue/30 hover:shadow-apple-soft transition-all duration-[400ms] bg-white/70 dark:bg-black/40 backdrop-blur-md rounded-3xl",
            isList ? "md:flex-row p-1.5" : ""
          )}
        >
          {/* 1. Image Carousel Section */}
          <div className={cn(
            "relative shrink-0 p-1",
            isList ? "w-full md:w-[256px] lg:w-[304px]" : "w-full"
          )}>
            <div className={cn(
              "rounded-[22px] overflow-hidden relative shadow-sm group/carousel w-full aspect-[3/2]",
              isList ? "min-h-[176px] md:min-h-0 md:h-full" : ""
            )}>
              <motion.img 
                key={activeImageIndex}
                initial={{ opacity: 0.1 }}
                animate={{ opacity: 1 }}
                src={vehicle.images[activeImageIndex] || vehicle.images[0]} 
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

              {/* Quick Carousel Controls */}
              {vehicle.images && vehicle.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev === 0 ? vehicle.images.length - 1 : prev - 1));
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 hover:bg-black/70 active:scale-90 z-20"
                    type="button"
                  >
                    <ChevronLeft className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev === vehicle.images.length - 1 ? 0 : prev + 1));
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 hover:bg-black/70 active:scale-90 z-20"
                    type="button"
                  >
                    <ChevronRight className="w-4.5 h-4.5" />
                  </button>
                  
                  {/* Indicator Micro Dots */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 bg-black/25 backdrop-blur-md px-2 py-1 rounded-full z-20">
                    {vehicle.images.slice(0, 5).map((_, i) => (
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
              <CarBadgeSlider badges={displayBadges as any} />

              {/* Left Side Status Tags */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                {nudges.slice(0, 1).map((nudge, i) => (
                  <Nudge key={i} type={nudge.type} text={nudge.text} />
                ))}
              </div>
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
                  <span>{dealValue.label.split(" ")[1].toUpperCase()}</span>
                </span>
              </span>
              <span className="text-[10px] md:text-[11px] text-apple-text-muted dark:text-[#86868B] truncate font-medium">
                {dealValue.detail}
              </span>
            </div>

            {/* Price Detail Row */}
            {!isList && (
              <div className="font-bold text-apple-text text-lg md:text-2xl tracking-tight mb-1.5 flex items-baseline gap-1">
                <span>{formatPrice(vehicle.price)}</span>
                <span className="text-[10px] font-normal text-apple-text-muted">PKR</span>
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
                  <span>{vehicle.make} {vehicle.model}</span>
                  {!isList && (
                    <span className="text-[10px] font-normal text-apple-text-muted select-none self-baseline">
                      • {vehicle.year}
                    </span>
                  )}
                  {!isList && vehicle.seller.badgeType && (
                    <Badge type={vehicle.seller.badgeType} size="sm" />
                  )}
                </h3>
                {isList && (
                  <div className="text-[11px] md:text-xs text-apple-text-muted font-medium mt-1">
                    Model Year: <span className="text-apple-text font-semibold">{vehicle.year}</span>
                  </div>
                )}
              </div>
              
              {/* Price in List View */}
              {isList && (
                <div className="text-right shrink-0">
                  <div className="font-bold text-apple-text text-lg md:text-2xl tracking-tight leading-none">
                    {formatPrice(vehicle.price)}
                  </div>
                  <div className="text-[10px] font-bold text-apple-blue uppercase tracking-widest mt-1">PKR</div>
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
              <MapPin className="w-3.5 h-3.5 shrink-0 text-apple-blue" />
              {vehicle.city ? (
                <>
                  {vehicle.area && (
                    <span className="font-semibold text-apple-text">
                      {vehicle.area.replace(new RegExp(`\\s*${vehicle.city}$`, 'i'), '')}
                    </span>
                  )}
                  {vehicle.area && <span className="mx-1 opacity-40">•</span>}
                  <span>{vehicle.city}</span>
                </>
              ) : (
                <span>{vehicle.location}</span>
              )}
            </div>

            {/* Accent Separator Line */}
            <div className={cn(
              "h-[1px] bg-gradient-to-r from-apple-border/50 via-apple-border/20 to-transparent w-full",
              isList ? "mb-2 md:mb-2.5" : "mb-1.5"
            )} />

            {/* Key Specs Pill Badges (Grid layout on desktop, touch horizontal scroll track on mobile/tablet mimicking Sharjah Dubizzle standard) */}
            <div className={cn(
              isList 
                ? "grid grid-cols-3 gap-2 mb-3" 
                : "flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-visible gap-2 snap-x snap-mandatory scrollbar-none pb-1 md:pb-0 mb-0 -mx-1 px-1"
            )}>
              {/* Mileage Pill */}
              <div className={cn(
                "flex items-center justify-center py-1.5 px-2.5 bg-apple-gray/50 dark:bg-[#1C1C1E] rounded-full border border-apple-border/10 dark:border-white/5 transition-all duration-300 hover:border-apple-blue/30 text-center",
                !isList && "snap-align-start min-w-[95px] xs:min-w-[105px] sm:min-w-[115px] md:min-w-0 shrink-0 md:shrink flex-1"
              )}>
                <span className="text-xs sm:text-[13px] font-normal text-apple-text truncate font-sans">
                  {vehicle.mileage.toLocaleString()} km
                </span>
              </div>
              
              {/* Engine Pill */}
              <div className={cn(
                "flex items-center justify-center py-1.5 px-2.5 bg-apple-gray/50 dark:bg-[#1C1C1E] rounded-full border border-apple-border/10 dark:border-white/5 transition-all duration-300 hover:border-apple-blue/30 text-center",
                !isList && "snap-align-start min-w-[95px] xs:min-w-[105px] sm:min-w-[115px] md:min-w-0 shrink-0 md:shrink flex-1"
              )}>
                <span className="text-xs sm:text-[13px] font-normal text-apple-text truncate font-sans">
                  {vehicle.engineSize ? vehicle.engineSize.replace(/\s*cc/i, " cc") : "1.5L Turb"}
                </span>
              </div>

              {/* Drive Pill */}
              <div className={cn(
                "flex items-center justify-center py-1.5 px-2.5 bg-apple-gray/50 dark:bg-[#1C1C1E] rounded-full border border-apple-border/10 dark:border-white/5 transition-all duration-300 hover:border-apple-blue/30 text-center",
                !isList && "snap-align-start min-w-[95px] xs:min-w-[105px] sm:min-w-[115px] md:min-w-0 shrink-0 md:shrink flex-1"
              )}>
                <span className="text-xs sm:text-[13px] font-normal text-apple-text truncate capitalize font-sans">
                  {vehicle.transmission ? (vehicle.transmission.length > 7 ? vehicle.transmission.substring(0, 7) + ".." : vehicle.transmission) : "Automat"}
                </span>
              </div>
            </div>

            {/* Bottom Premium Action Console */}
            {isList && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-auto pt-3 border-t border-apple-border/10 gap-2.5">
                {/* Seller details with subtle link action */}
                <Link 
                  to={`/profile/${vehicle.seller.uid}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-3 min-w-0 group/seller"
                >
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-apple-blue/10 dark:bg-white/5 flex items-center justify-center text-xs md:text-sm font-bold shadow-inner border border-apple-border/40 shrink-0 group-hover/seller:scale-105 transition-all text-apple-blue">
                    {vehicle.seller.name ? vehicle.seller.name[0] : "S"}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs md:text-sm font-bold text-apple-text truncate group-hover/seller:text-apple-blue transition-colors flex items-center gap-1.5 flex-wrap">
                      <span>{vehicle.seller.name}</span>
                      {vehicle.seller.badgeType && vehicle.seller.badgeType !== 'none' && (
                        <Badge type={vehicle.seller.badgeType} size="sm" />
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-2.5 h-2.5",
                            i < Math.floor(vehicle.seller.rating || 5)
                              ? "fill-apple-orange text-apple-orange"
                              : "text-apple-border"
                          )}
                        />
                      ))}
                      <span className="text-[10px] text-apple-text-muted ml-0.5 font-semibold">({vehicle.seller.rating || "5.0"})</span>
                    </div>
                  </div>
                </Link>
                
                {/* Dynamic Premium CTA Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                  {/* Call Seller CTA */}
                  <a 
                    href="tel:+923001234567"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold rounded-full border border-apple-border hover:bg-apple-gray dark:hover:bg-white/5 text-apple-text active:scale-95 transition-all cursor-pointer shadow-sm"
                    title="Call Seller"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span className="hidden leading-none md:inline">Call</span>
                  </a>

                  {/* WhatsApp CTA */}
                  <a 
                    href={`https://wa.me/923001234567?text=${encodeURIComponent(`Hi, I'm interested in your ${vehicle.make} ${vehicle.model} (${vehicle.year}) listed on Pakizzle.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold rounded-full border border-[#25D366]/20 bg-[#25D366]/10 hover:bg-[#25D366]/25 text-[#25D366] active:scale-95 transition-all cursor-pointer shadow-sm"
                    title="WhatsApp Seller"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="hidden leading-none md:inline">WhatsApp</span>
                  </a>

                  {/* Instant In-App Chat */}
                  <button 
                    onClick={handleChatWithSeller}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold rounded-full border border-apple-blue/20 bg-apple-blue/5 hover:bg-apple-blue/15 text-apple-blue active:scale-95 transition-all cursor-pointer shadow-sm"
                    title="Instant Chat"
                    type="button"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="hidden leading-none md:inline">Chat</span>
                  </button>

                  {/* View Details clickable button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCardClick();
                    }}
                    className="apple-button-primary !h-8 px-4 !text-[11px] !rounded-full flex items-center justify-center font-bold tracking-tight shadow-md hover:shadow-lg active:scale-95 transition-all"
                  >
                    View Detail
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </motion.div>
      </div>
      
      {/* Absolute Overlaid Quick Feature Controllers (Favorite + Compare Buttons) */}
      <div className={cn(
        "absolute z-30 flex flex-col gap-2.5",
        isList ? "top-5 right-5" : "top-5 right-5"
      )}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleToggleWishlist}
          className={cn(
            "w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-xl transition-all duration-[400ms] shadow-apple-soft border border-apple-border/20 cursor-pointer",
            isSaved 
              ? "bg-apple-red text-white border-apple-red shadow-md opacity-100" 
              : "bg-white/80 dark:bg-black/80 text-apple-text hover:bg-white dark:hover:bg-white/15 opacity-0 group-hover:opacity-100",
            isList && !isSaved && "opacity-100 bg-white dark:bg-black" // Keep on in list
          )}
        >
          <Heart className={cn("w-4.5 h-4.5", isSaved && "fill-current")} />
        </motion.button>
        {onCompare && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCompare(vehicle);
            }}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-xl transition-all duration-[400ms] shadow-apple-soft border border-apple-border/20 cursor-pointer",
              isCompared 
                ? "bg-apple-blue text-white border-apple-blue shadow-md opacity-100" 
                : "bg-white/80 dark:bg-black/80 text-apple-text hover:bg-white dark:hover:bg-white/15 opacity-0 group-hover:opacity-100"
            )}
          >
            <Scale className="w-4.5 h-4.5" />
          </motion.button>
        )}
      </div>
    </div>
  );
});

