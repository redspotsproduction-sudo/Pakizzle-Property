import React from "react";
import { motion } from "motion/react";
import { Zap, ShieldCheck, TrendingUp, Clock, Eye, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type NudgeType = "urgency" | "trust" | "value" | "popularity" | "new" | "verified" | "featured";

interface NudgeProps {
  type: NudgeType;
  text?: string;
  className?: string;
  variant?: "pill" | "banner" | "inline";
  noAnimate?: boolean;
}

const NUDGE_CONFIG = {
  urgency: {
    icon: Clock,
    color: "text-[#D93A45]",
    bgColor: "bg-[#D93A45]/10",
    borderColor: "border-[#D93A45]/30",
    defaultText: "Selling Fast",
  },
  trust: {
    icon: ShieldCheck,
    color: "text-[#4A90D2]",
    bgColor: "bg-[#4A90D2]/10",
    borderColor: "border-[#4A90D2]/30",
    defaultText: "Verified Seller",
  },
  featured: {
    icon: Sparkles,
    color: "text-[#F0A830]",
    bgColor: "bg-[#F0A830]/15 dark:bg-[#F0A830]/10",
    borderColor: "border-[#C9A227]/40 dark:border-[#C9A227]/30",
    defaultText: "Featured",
  },
  value: {
    icon: Sparkles,
    color: "text-[#5FA84C]",
    bgColor: "bg-[#5FA84C]/10",
    borderColor: "border-[#5FA84C]/30",
    defaultText: "Great Deal",
  },
  popularity: {
    icon: TrendingUp,
    color: "text-[#7A1E5E] dark:text-[#E072B3]",
    bgColor: "bg-[#7A1E5E]/10 dark:bg-[#7A1E5E]/20",
    borderColor: "border-[#7A1E5E]/30",
    defaultText: "Trending",
  },
  new: {
    icon: Zap,
    color: "text-[#4A90D2]",
    bgColor: "bg-[#4A90D2]/10",
    borderColor: "border-[#4A90D2]/30",
    defaultText: "Just Listed",
  },
  verified: {
    icon: CheckCircle2,
    color: "text-[#5FA84C]",
    bgColor: "bg-[#5FA84C]/10",
    borderColor: "border-[#5FA84C]/30",
    defaultText: "Auction Verified",
  }
};

export const Nudge: React.FC<NudgeProps> = ({ type, text, className, variant = "pill", noAnimate = false }) => {
  const config = NUDGE_CONFIG[type];
  const Icon = config.icon;
  const displayText = text || config.defaultText;

  if (variant === "banner") {
    return (
      <motion.div
        initial={noAnimate ? false : { opacity: 0, x: -10 }}
        animate={noAnimate ? false : { opacity: 1, x: 0 }}
        whileHover={noAnimate ? false : { scale: 1.02, x: 5 }}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 cursor-default group/nudge",
          config.bgColor,
          config.borderColor,
          className
        )}
      >
        <div className={cn(
          "w-8 h-8 rounded-full bg-apple-card-bg flex items-center justify-center shadow-sm transition-transform duration-500 group-hover/nudge:rotate-[360deg]",
          config.color
        )}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className={cn("text-[11px] font-black uppercase tracking-[0.15em] leading-none mb-1", config.color)}>
            {type}
          </p>
          <p className="text-[13px] font-bold text-apple-text tracking-tight leading-tight">
            {displayText}
          </p>
        </div>
      </motion.div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-1 px-2 py-1 rounded-md bg-apple-gray/50 border border-apple-border/30", className)}>
        <Icon className={cn("w-2.5 h-2.5", config.color)} />
        <span className="text-[7.5px] font-black uppercase tracking-widest text-apple-text/70 leading-none">
          {displayText}
        </span>
      </div>
    );
  }

  return (
    <motion.div 
      initial={noAnimate ? false : { opacity: 0, scale: 0.9 }}
      animate={noAnimate ? false : { opacity: 1, scale: 1 }}
      className={cn(
        "h-5 px-2 rounded-full flex items-center gap-1 text-[7.5px] font-black uppercase tracking-widest shadow-apple-soft border backdrop-blur-md",
        config.bgColor,
        config.color,
        config.borderColor,
        className
      )}
    >
      <Icon className="w-2.5 h-2.5" />
      <span className="leading-none">{displayText}</span>
    </motion.div>
  );
};

export default Nudge;
