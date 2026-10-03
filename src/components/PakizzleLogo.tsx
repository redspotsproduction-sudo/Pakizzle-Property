import React from 'react';
import { cn } from '@/lib/utils';

interface PakizzleLogoProps {
  className?: string;
  variant?: 'auto' | 'light' | 'dark' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function PakizzleLogo({ 
  className = '', 
  variant = 'auto', 
  size = 'md' 
}: PakizzleLogoProps) {
  const heightClasses = {
    sm: 'h-7',
    md: 'h-8 sm:h-9 lg:h-10',
    lg: 'h-11 lg:h-12',
    xl: 'h-14 lg:h-16',
  }[size];

  if (variant === 'white' || variant === 'dark') {
    return (
      <img
        src="/pakizzle_logo_white.svg"
        alt="Pakizzle - Real Estate Portal"
        className={cn("w-auto object-contain select-none", heightClasses, className)}
      />
    );
  }

  if (variant === 'light') {
    return (
      <img
        src="/pakizzle_logo.svg"
        alt="Pakizzle - Real Estate Portal"
        className={cn("w-auto object-contain select-none", heightClasses, className)}
      />
    );
  }

  // Auto variant: switches seamlessly between light and dark mode
  return (
    <div className={cn("inline-flex items-center", className)}>
      <img
        src="/pakizzle_logo.svg"
        alt="Pakizzle - Real Estate Portal"
        className={cn("w-auto object-contain select-none dark:hidden", heightClasses)}
      />
      <img
        src="/pakizzle_logo_white.svg"
        alt="Pakizzle - Real Estate Portal"
        className={cn("w-auto object-contain select-none hidden dark:block", heightClasses)}
      />
    </div>
  );
}
