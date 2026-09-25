import React from 'react';

export type GlassTier = 'foreground' | 'mid' | 'subtle' | 'restrained';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  tier?: GlassTier;
  rounded?: 'card' | 'container' | 'pill' | 'none';
  hasSheen?: boolean;
  highlightTop?: boolean;
  children: React.ReactNode;
  className?: string;
}

const tierClassMap: Record<GlassTier, string> = {
  foreground: 'liquid-glass-foreground',
  mid: 'liquid-glass-mid',
  subtle: 'liquid-glass-subtle',
  restrained: 'liquid-glass-restrained',
};

const roundedClassMap = {
  card: 'rounded-[24px]',
  container: 'rounded-[32px] md:rounded-[40px]',
  pill: 'rounded-full',
  none: 'rounded-none',
};

export const GlassPanel: React.FC<GlassPanelProps> = ({
  tier = 'mid',
  rounded = 'card',
  hasSheen = false,
  highlightTop = true,
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`
        relative
        ${tierClassMap[tier]}
        ${roundedClassMap[rounded]}
        ${hasSheen ? 'glass-hover-sheen' : ''}
        ${highlightTop ? 'before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent before:pointer-events-none' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tier?: GlassTier;
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  tier = 'mid',
  children,
  className = '',
  interactive = true,
  ...props
}) => {
  return (
    <GlassPanel
      tier={tier}
      rounded="card"
      hasSheen={interactive}
      highlightTop={true}
      className={`
        p-6 
        transition-all duration-300
        ${interactive ? 'hover:-translate-y-1 hover:shadow-2xl cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </GlassPanel>
  );
};

interface GlassCapsuleProps extends React.HTMLAttributes<HTMLDivElement> {
  tier?: GlassTier;
  children: React.ReactNode;
  className?: string;
}

export const GlassCapsule: React.FC<GlassCapsuleProps> = ({
  tier = 'mid',
  children,
  className = '',
  ...props
}) => {
  return (
    <GlassPanel
      tier={tier}
      rounded="pill"
      highlightTop={true}
      className={`px-4 py-2 inline-flex items-center gap-2 ${className}`}
      {...props}
    >
      {children}
    </GlassPanel>
  );
};

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tier?: GlassTier;
  variant?: 'primary' | 'subtle' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  tier = 'subtle',
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base font-semibold',
  }[size];

  const variantClasses = {
    primary:
      'bg-brand-primary text-white hover:bg-brand-primary-hover shadow-lg shadow-teal-900/20 border border-teal-400/40',
    subtle:
      'liquid-glass-subtle text-foreground hover:bg-white/30 dark:hover:bg-white/10 border border-white/40 dark:border-white/15',
    ghost:
      'bg-transparent hover:bg-white/20 text-foreground border border-transparent hover:border-white/20',
    icon:
      'liquid-glass-subtle text-foreground hover:bg-white/35 dark:hover:bg-white/15 p-2.5 rounded-full border border-white/40 dark:border-white/15 flex items-center justify-center',
  }[variant];

  return (
    <button
      className={`
        rounded-full font-medium transition-all duration-300
        active:scale-95 disabled:opacity-50 disabled:pointer-events-none
        glass-hover-sheen
        ${variant !== 'icon' ? sizeClasses : ''}
        ${variantClasses}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
