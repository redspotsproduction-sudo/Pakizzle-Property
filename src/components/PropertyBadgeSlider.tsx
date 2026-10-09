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
  Building2,
  Home,
  CheckCircle2,
  MapPin
} from "lucide-react";
import { cn } from "../lib/utils";
import { RosetteCheckIcon } from "./Badge";

/**
 * Real Estate Badge Types & Priorities
 */
export type BadgeType = 
  | "verified_business" 
  | "verified_agency"
  | "verified_user" 
  | "auction_verified" 
  | "title_verified"
  | "lda_approved"
  | "ready_to_move"
  | "off_plan"
  | "new_car" 
  | "used_car" 
  | "video" 
  | "photos" 
  | "selling_fast" 
  | "high_demand" 
  | "great_price";

export interface BadgeData {
  type: BadgeType | string;
  label: string;
}

const BADGE_CONFIG: Record<string, { icon: any; priority: number; colorClass: string }> = {
  verified_business: { icon: ShieldCheck, priority: 100, colorClass: "text-apple-blue" },
  verified_agency: { icon: ShieldCheck, priority: 100, colorClass: "text-apple-blue" },
  lda_approved: { icon: FileCheck, priority: 95, colorClass: "text-emerald-500" },
  title_verified: { icon: CheckCircle2, priority: 90, colorClass: "text-emerald-500" },
  verified_user: { icon: UserCheck, priority: 85, colorClass: "text-apple-blue" },
  auction_verified: { icon: FileCheck, priority: 80, colorClass: "text-apple-green" },
  ready_to_move: { icon: Home, priority: 75, colorClass: "text-amber-500" },
  off_plan: { icon: Building2, priority: 70, colorClass: "text-purple-500" },
  new_car: { icon: Sparkles, priority: 65, colorClass: "text-apple-orange" },
  used_car: { icon: History, priority: 60, colorClass: "text-apple-text-muted" },
  video: { icon: PlayCircle, priority: 50, colorClass: "text-apple-blue" },
  photos: { icon: Camera, priority: 40, colorClass: "text-apple-text-muted" },
  selling_fast: { icon: Flame, priority: 30, colorClass: "text-apple-red" },
  high_demand: { icon: TrendingUp, priority: 20, colorClass: "text-apple-orange" },
  great_price: { icon: Tag, priority: 10, colorClass: "text-apple-green" },
};

interface PropertyBadgeSliderProps {
  badges: BadgeData[];
  className?: string;
}

export default function PropertyBadgeSlider({ badges, className }: PropertyBadgeSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { ref, inView } = useInView({ threshold: 0.1 });

  const sortedBadges = useMemo(() => {
    if (!badges || badges.length === 0) return [];
    return [...badges].sort((a, b) => {
      const pA = BADGE_CONFIG[a.type]?.priority || 0;
      const pB = BADGE_CONFIG[b.type]?.priority || 0;
      return pB - pA;
    });
  }, [badges]);

  useEffect(() => {
    if (!inView || sortedBadges.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sortedBadges.length);
    }, 3200);

    return () => clearInterval(interval);
  }, [inView, sortedBadges.length]);

  if (!sortedBadges || sortedBadges.length === 0) return null;

  const currentBadge = sortedBadges[currentIndex] || sortedBadges[0];
  const config = BADGE_CONFIG[currentBadge.type] || {
    icon: Sparkles,
    priority: 0,
    colorClass: "text-apple-blue",
  };
  const IconComponent = config.icon;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute bottom-3 start-3 z-20 pointer-events-none flex items-center justify-start select-none max-w-[calc(100%-84px)] h-7",
        className
      )}
    >
      <div className="relative overflow-hidden bg-black/75 backdrop-blur-md border border-white/20 px-2.5 h-7 rounded-full shadow-lg flex items-center gap-1.5 max-w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBadge.label + currentIndex}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-1.5 min-w-0"
          >
            <IconComponent className={cn("w-3.5 h-3.5 shrink-0", config.colorClass)} />
            <span className="text-[11px] font-semibold text-white tracking-wide truncate">
              {currentBadge.label}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export const CarBadgeSlider = PropertyBadgeSlider;
