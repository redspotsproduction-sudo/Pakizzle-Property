import React from 'react';
import { Info, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export type BadgeType = 'none' | 'basic' | 'identity' | 'business' | 'dealer';

interface BadgeProps {
  type: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

export function RosetteCheckIcon({ isBusiness, className, size = 18 }: { isBusiness: boolean; className?: string; size?: number }) {
  const badgeColor = isBusiness ? "#EAB308" : "#2F9BF7"; // Yellow/Gold vs Twitter/Instagram Deep Blue
  const checkColor = isBusiness ? "#0F172A" : "#FFFFFF"; // Dark slate check for Gold badge vs White check for Blue badge
  
  return (
    <svg 
      viewBox="0 0 24 24" 
      width={size} 
      height={size} 
      className={cn("inline-block shrink-0 select-none", className)}
      style={{ verticalAlign: 'middle' }}
    >
      <path 
        d="M22.25 12c0-1.43-.79-2.67-1.94-3.26.14-.39.21-.82.21-1.27 0-2-1.55-3.61-3.46-3.61-.43 0-.85.09-1.22.24C15.24 2.91 14.05 2 12.69 2s-2.55.91-3.15 2.1c-.37-.15-.79-.24-1.22-.24-1.91 0-3.46 1.61-3.46 3.61 0 .45.07.88.21 1.27-1.15.59-1.94 1.83-1.94 3.26 0 1.43.79 2.67 1.94 3.26-.14.39-.21.82-.21 1.27 0 2 1.55 3.61 3.46 3.61.43 0 .85-.09 1.22-.24.6 1.19 1.79 2.1 3.15 2.1s2.55-.91 3.15-2.1c.37.15.79.24 1.22.24 1.91 0 3.46-1.61 3.46-3.61 0-.45-.07-.88-.21-1.27 1.15-.59 1.94-1.83 1.94-3.26z" 
        fill={badgeColor}
      />
      <path 
        d="M9 12l2.25 2.25 4.5-4.5"
        fill="none"
        stroke={checkColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Badge({ type, size = 'md', className, showText = false }: BadgeProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);

  if (type === 'none' || !type) return null;

  const badgeConfigs = {
    basic: {
      isBusiness: false,
      color: 'text-emerald-600 dark:text-emerald-400', // high-contrast teal-green
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      label: 'Verified Account',
      description: 'Email and phone number verified via OTP.'
    },
    identity: {
      isBusiness: false,
      color: 'text-apple-blue',
      bg: 'bg-apple-blue/10',
      label: 'Verified Seller',
      description: 'Identity documents (CNIC/Passport) verified by Pakizzle.'
    },
    business: {
      isBusiness: true,
      color: 'text-yellow-600 dark:text-yellow-500',
      bg: 'bg-yellow-500/10',
      label: 'Verified Business',
      description: 'Trade license and business documents verified.'
    },
    dealer: {
      isBusiness: true,
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-500/10',
      label: 'Verified Dealer',
      description: 'Authorized automotive dealer verified by Pakizzle.'
    }
  };

  const config = badgeConfigs[type as keyof typeof badgeConfigs];
  if (!config) return null;

  const sizePx = {
    sm: 15,
    md: 18,
    lg: 22
  }[size];

  return (
    <div className={cn("relative inline-flex items-center select-none", className)}>
      <div 
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={cn(
          "flex items-center gap-1.5 rounded-full transition-all duration-300 cursor-help",
          showText ? cn("px-2.5 py-1", config.bg) : ""
        )}
      >
        {type === 'basic' ? (
          <ShieldCheck className={cn("inline-block shrink-0 select-none text-emerald-500 dark:text-emerald-400")} size={sizePx} style={{ verticalAlign: 'middle' }} />
        ) : (
          <RosetteCheckIcon isBusiness={config.isBusiness} size={sizePx} />
        )}
        {showText && (
          <span className={cn("text-[10px] font-black uppercase tracking-widest", config.color)}>
            {config.label}
          </span>
        )}
      </div>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-apple-card-bg backdrop-blur-xl border border-apple-border rounded-xl shadow-apple-card z-[100] pointer-events-none"
          >
            <div className="flex items-center gap-2 mb-1">
              {type === 'basic' ? (
                <ShieldCheck className="text-emerald-500 dark:text-emerald-400 shrink-0 inline-block" size={15} />
              ) : (
                <RosetteCheckIcon isBusiness={config.isBusiness} size={15} />
              )}
              <span className="text-xs font-bold text-apple-text">{config.label}</span>
            </div>
            <p className="text-[10px] text-apple-text-muted leading-relaxed">
              {config.description}
            </p>
            <div className="mt-2 pt-2 border-t border-apple-border/50 flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-apple-blue">Verified by Pakizzle</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
