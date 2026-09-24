import React, { useState } from 'react';
import { ShieldCheck, Building2, Check, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export type VerifiedBadgeType = 'none' | 'basic' | 'identity' | 'business' | 'dealer';
export type BadgeType = VerifiedBadgeType;

interface BadgeProps {
  type?: VerifiedBadgeType | string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

// 1. Identity Tier: Filled Apple Blue Rosette with crisp white checkmark
export function IdentityBadgeIcon({ className, size = 18 }: { className?: string; size?: number }) {
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
        fill="#0071E3"
      />
      <path 
        d="M8.8 12.2l2.2 2.2 4.4-4.5"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 2. Business Tier: Filled Warm Gold Rosette with distinct white Agency/Building icon
export function BusinessBadgeIcon({ className, size = 18 }: { className?: string; size?: number }) {
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
        fill="#EAB308"
      />
      {/* Distinct Agency / Corporate Building Architectural Motif */}
      <path 
        d="M7.5 17.2V8.5L12 6.5L16.5 8.5V17.2H7.5Z" 
        fill="#FFFFFF"
      />
      <rect x="9.5" y="10" width="1.6" height="1.6" rx="0.3" fill="#B45309" />
      <rect x="12.9" y="10" width="1.6" height="1.6" rx="0.3" fill="#B45309" />
      <rect x="9.5" y="12.5" width="1.6" height="1.6" rx="0.3" fill="#B45309" />
      <rect x="12.9" y="12.5" width="1.6" height="1.6" rx="0.3" fill="#B45309" />
      <path d="M11 17.2V15H13V17.2" fill="#B45309" />
    </svg>
  );
}

// 3. Basic Tier: Subtle outline badge with clean emerald check
export function BasicBadgeIcon({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      width={size} 
      height={size} 
      className={cn("inline-block shrink-0 select-none text-emerald-600 dark:text-emerald-400", className)}
      style={{ verticalAlign: 'middle' }}
    >
      <circle 
        cx="12" 
        cy="12" 
        r="9" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.75" 
      />
      <path 
        d="M8.5 12l2.3 2.3 4.7-4.7" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}

// Backward-compatible export
export const RosetteCheckIcon = ({ isBusiness, className, size = 18 }: { isBusiness: boolean; className?: string; size?: number }) => {
  return isBusiness ? <BusinessBadgeIcon className={className} size={size} /> : <IdentityBadgeIcon className={className} size={size} />;
};

export default function Badge({ type, size = 'md', className, showText = false }: BadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Normalize type
  const normalizedType: VerifiedBadgeType = 
    type === 'dealer' ? 'business' : 
    (type === 'basic' || type === 'identity' || type === 'business') ? type : 'none';

  // 1. None (hidden)
  if (normalizedType === 'none' || !type) {
    return null;
  }

  const badgeConfigs = {
    basic: {
      color: 'text-emerald-600 dark:text-emerald-400',
      pillBg: 'bg-emerald-500/[0.06] border border-emerald-500/35 hover:bg-emerald-500/10',
      tooltipBg: 'border-emerald-500/30 shadow-emerald-500/5',
      label: 'Verified Contact',
      tag: 'Basic Tier',
      description: 'Phone number and primary email verified via SMS & email OTP security.',
      accentText: 'Verified Contact Record',
      icon: (s: number) => <BasicBadgeIcon size={s} />
    },
    identity: {
      color: 'text-apple-blue',
      pillBg: 'bg-apple-blue/[0.08] border border-apple-blue/25 hover:bg-apple-blue/15',
      tooltipBg: 'border-apple-blue/30 shadow-apple-blue/10',
      label: 'CNIC Verified',
      tag: 'Identity Tier',
      description: 'Government CNIC / National Identity verified and cross-checked by Pakizzle.',
      accentText: 'Verified Individual Seller',
      icon: (s: number) => <IdentityBadgeIcon size={s} />
    },
    business: {
      color: 'text-amber-600 dark:text-amber-400',
      pillBg: 'bg-amber-500/[0.08] border border-amber-500/30 hover:bg-amber-500/15',
      tooltipBg: 'border-amber-500/30 shadow-amber-500/10',
      label: 'Verified Agency',
      tag: 'Business Tier',
      description: 'Corporate business license, NTN tax certificate, and agency credentials verified.',
      accentText: 'Authorized Agency & Brokerage',
      icon: (s: number) => <BusinessBadgeIcon size={s} />
    }
  };

  const config = badgeConfigs[normalizedType];
  if (!config) return null;

  const sizeMetrics = {
    sm: { icon: 14, text: 'text-[9.5px]', py: 'py-0.5', px: 'px-1.5' },
    md: { icon: 17, text: 'text-[10.5px]', py: 'py-1', px: 'px-2' },
    lg: { icon: 20, text: 'text-xs', py: 'py-1.5', px: 'px-2.5' }
  }[size];

  return (
    <div className={cn("relative inline-flex items-center align-middle select-none", className)}>
      <div 
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={cn(
          "flex items-center gap-1 rounded-full transition-all duration-200 cursor-help",
          showText 
            ? cn(sizeMetrics.py, sizeMetrics.px, config.pillBg) 
            : "p-0.5 hover:scale-105 active:scale-95"
        )}
        title={config.label}
      >
        {config.icon(sizeMetrics.icon)}
        
        {showText && (
          <span className={cn("font-bold tracking-tight leading-none whitespace-nowrap", sizeMetrics.text, config.color)}>
            {config.label}
          </span>
        )}
      </div>

      {/* Apple-grade frosted glass tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 3, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl border rounded-2xl shadow-xl z-[150] pointer-events-none text-left",
              config.tooltipBg
            )}
          >
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <div className="flex items-center gap-1.5">
                {config.icon(16)}
                <span className="text-xs font-bold text-apple-text tracking-tight">{config.label}</span>
              </div>
              <span className={cn("text-[8.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-apple-gray dark:bg-white/10", config.color)}>
                {config.tag}
              </span>
            </div>

            <p className="text-[11px] text-apple-text-muted leading-relaxed font-normal">
              {config.description}
            </p>

            <div className="mt-2.5 pt-2 border-t border-apple-border/40 flex items-center justify-between text-[9px] font-semibold text-apple-text-muted">
              <span>{config.accentText}</span>
              <span className="text-apple-blue font-bold">Pakizzle™</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { Badge as VerifiedBadge };

