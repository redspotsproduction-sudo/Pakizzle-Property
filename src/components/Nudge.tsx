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
    color: "text-apple-orange",
    bgColor: "bg-apple-orange/10",
    borderColor: "border-apple-orange/20",
    defaultText: "Selling Fast",
  },
  trust: {
    icon: ShieldCheck,
    color: "text-apple-blue",
    bgColor: "bg-apple-blue/10",
    borderColor: "border-apple-blue/20",
    defaultText: "Verified Seller",
  },
  featured: {
    icon: Sparkles,
    color: "text-apple-red",
    bgColor: "bg-apple-red/15 dark:bg-apple-red/10",
    borderColor: "border-apple-red/30 dark:border-apple-red/20",
    defaultText: "Featured",
  },
  value: {
    icon: Sparkles,
    color: "text-apple-green",
    bgColor: "bg-apple-green/10",
    borderColor: "border-apple-green/20",
    defaultText: "Great Deal",
  },
  popularity: {
    icon: TrendingUp,
    color: "text-apple-purple",
    bgColor: "bg-apple-purple/10",
    borderColor: "border-apple-purple/20",
    defaultText: "Trending",
  },
  new: {
    icon: Zap,
    color: "text-apple-blue",
    bgColor: "bg-apple-blue/10",
    borderColor: "border-apple-blue/20",
    defaultText: "Just Listed",
  },
  verified: {
    icon: CheckCircle2,
    color: "text-apple-blue",
    bgColor: "bg-apple-blue/5",
    borderColor: "border-apple-blue/10",
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
