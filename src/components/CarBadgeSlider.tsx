import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useInView } from "react-intersection-observer";
import { 
  ShieldCheck, 
  UserCheck, 
  FileCheck, 
  Sparkles, 
  History, 
  PlayCircle, 
  Camera, 
  Flame, 
  TrendingUp, 
  Tag,
  CheckCircle2
} from "lucide-react";
import { cn } from "../lib/utils";
import { RosetteCheckIcon } from "./Badge";

/**
 * Badge Type Definitions & Priority Mapping
 * Higher priority value = shown first in the rotation
 */
export type BadgeType = 
  | "verified_business" 
  | "verified_user" 
  | "auction_verified" 
  | "new_car" 
  | "used_car" 
  | "video" 
  | "photos" 
  | "selling_fast" 
  | "high_demand" 
  | "great_price";

interface BadgeData {
  type: BadgeType;
  label: string;
}

const BADGE_CONFIG: Record<BadgeType, { icon: any; priority: number; colorClass: string }> = {
  verified_business: { icon: ShieldCheck, priority: 100, colorClass: "text-apple-blue" },
  verified_user: { icon: UserCheck, priority: 90, colorClass: "text-apple-blue" },
  auction_verified: { icon: FileCheck, priority: 80, colorClass: "text-apple-green" },
  new_car: { icon: Sparkles, priority: 70, colorClass: "text-apple-orange" },
  used_car: { icon: History, priority: 60, colorClass: "text-apple-text-muted" },
  video: { icon: PlayCircle, priority: 50, colorClass: "text-apple-blue" },
  photos: { icon: Camera, priority: 40, colorClass: "text-apple-text-muted" },
  selling_fast: { icon: Flame, priority: 30, colorClass: "text-apple-red" },
  high_demand: { icon: TrendingUp, priority: 20, colorClass: "text-apple-orange" },
  great_price: { icon: Tag, priority: 10, colorClass: "text-apple-green" },
};

interface CarBadgeSliderProps {
  badges: BadgeData[];
  className?: string;
}

export default function CarBadgeSlider({ badges, className }: CarBadgeSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  // Performance: Only animate when in view
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Filter and sort badges based on priority, limit to top 3
  const activeBadges = useMemo(() => {
    if (!badges || badges.length === 0) return [];
    
    return [...badges]
      .sort((a, b) => (BADGE_CONFIG[b.type]?.priority || 0) - (BADGE_CONFIG[a.type]?.priority || 0))
      .slice(0, 3);
  }, [badges]);

  useEffect(() => {
    if (activeBadges.length <= 1 || isHovered || !inView) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBadges.length);
    }, 2500);

    return () => clearInterval(timer);
  }, [activeBadges.length, isHovered, inView]);

  if (activeBadges.length === 0) return null;

  const currentBadge = activeBadges[currentIndex];
  const config = BADGE_CONFIG[currentBadge.type];
  const Icon = config?.icon || CheckCircle2;

  const isRosette = currentBadge.type === "verified_business" || currentBadge.type === "verified_user";
  const isBusiness = currentBadge.type === "verified_business";

  return (
    <div 
      ref={ref}
      className={cn("absolute bottom-3 left-3 z-10 h-[28px] pointer-events-auto", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBadge.type}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ 
            duration: 0.4, 
            ease: [0.16, 1, 0.3, 1] 
          }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-apple-card-bg/85 backdrop-blur-md border border-apple-border/20 shadow-apple-soft h-full"
          aria-label={currentBadge.label}
        >
          {isRosette ? (
            <RosetteCheckIcon isBusiness={isBusiness} size={15} />
          ) : (
            <Icon className={cn("w-3.5 h-3.5", config?.colorClass)} />
          )}
          <span className="text-[12px] font-bold tracking-tight text-apple-text whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]">
            {currentBadge.label}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
