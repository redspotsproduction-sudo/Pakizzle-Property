import { useState, useEffect, type RefObject } from "react";

/**
 * Centrally defined breakpoint scale for Pakizzle-Property
 * Scale matches real content breakpoints from 360px small phones to 2560px+ ultra-wides:
 * - 360–479px   → Small phone (iPhone SE, budget Android)
 * - 480–767px   → Large phone / phone landscape
 * - 768–1023px  → Tablet portrait (iPad Mini/Air portrait)
 * - 1024–1279px → Tablet landscape / small laptop
 * - 1280–1599px → Standard desktop
 * - 1600px+     → Large/wide desktop monitor
 */
export const BREAKPOINTS = {
  xs: 360,    // Small phone minimum
  sm: 480,    // Large phone / landscape phone
  md: 768,    // Tablet portrait
  lg: 1024,   // Tablet landscape / small laptop
  xl: 1280,   // Standard desktop
  '2xl': 1600 // Wide desktop / 4K
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

export type DeviceType =
  | "small-phone"       // 360–479px
  | "large-phone"       // 480–767px
  | "tablet-portrait"   // 768–1023px
  | "tablet-landscape"  // 1024–1279px
  | "desktop"           // 1280–1599px
  | "desktop-wide";     // 1600px+

/**
 * Determine device type based on viewport width
 */
export function getDeviceType(width: number): DeviceType {
  if (width < BREAKPOINTS.sm) return "small-phone";
  if (width < BREAKPOINTS.md) return "large-phone";
  if (width < BREAKPOINTS.lg) return "tablet-portrait";
  if (width < BREAKPOINTS.xl) return "tablet-landscape";
  if (width < BREAKPOINTS['2xl']) return "desktop";
  return "desktop-wide";
}

/**
 * Centrally defined fluid clamp tokens for CSS-in-JS or dynamic inline styling
 */
export const FLUID_TYPOGRAPHY = {
  hero: "clamp(2rem, 5vw + 0.75rem, 4.25rem)",
  display: "clamp(1.75rem, 4vw + 1rem, 3.5rem)",
  h1: "clamp(1.5rem, 3.2vw + 0.6rem, 2.5rem)",
  h2: "clamp(1.25rem, 2.2vw + 0.5rem, 1.875rem)",
  h3: "clamp(1.1rem, 1.4vw + 0.45rem, 1.4rem)",
  h4: "clamp(1rem, 0.8vw + 0.4rem, 1.15rem)",
  body: "clamp(0.875rem, 0.25vw + 0.8rem, 1.05rem)",
  small: "clamp(0.75rem, 0.2vw + 0.7rem, 0.875rem)",
  caption: "clamp(0.6875rem, 0.15vw + 0.65rem, 0.75rem)",
} as const;

export const FLUID_SPACING = {
  pageX: "clamp(1rem, 3.5vw, 3rem)",
  sectionY: "clamp(2.5rem, 6vw, 5.5rem)",
  cardPadding: "clamp(0.875rem, 2vw, 1.5rem)",
  gridGap: "clamp(0.875rem, 2vw, 1.5rem)",
  stackGap: "clamp(0.75rem, 1.5vw, 1.25rem)",
} as const;

/**
 * Touch target constants following Apple Human Interface Guidelines (HIG)
 */
export const TOUCH_TARGET = {
  minSize: 44, // 44x44px minimum touch target
  minGap: 8,   // 8px minimum spacing between adjacent tap targets
} as const;

/**
 * Safe area inset defaults for mobile devices (iPhone dynamic island / notch / gesture bar)
 */
export const SAFE_AREA = {
  top: "env(safe-area-inset-top, 0px)",
  bottom: "env(safe-area-inset-bottom, 0px)",
  left: "env(safe-area-inset-left, 0px)",
  right: "env(safe-area-inset-right, 0px)",
} as const;

/**
 * Hook to subscribe to media queries cleanly
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/**
 * Comprehensive hook providing current viewport responsive stats
 */
export function useBreakpoint() {
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window === "undefined") {
      return { width: 1280, height: 800 };
    }
    return { width: window.innerWidth, height: window.innerHeight };
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeoutId: number;
    const handleResize = () => {
      // Debounce slightly to prevent thrashing
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 50);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const { width, height } = dimensions;
  const deviceType = getDeviceType(width);

  return {
    width,
    height,
    deviceType,
    // Convenient boolean flags
    isSmallPhone: width < BREAKPOINTS.sm,
    isPhone: width < BREAKPOINTS.md,
    isTabletPortrait: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isTabletLandscape: width >= BREAKPOINTS.lg && width < BREAKPOINTS.xl,
    isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.xl,
    isDesktop: width >= BREAKPOINTS.xl,
    isDesktopWide: width >= BREAKPOINTS['2xl'],
    // Touch vs cursor heuristic
    isTouchDevice: typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0),
  };
}

/**
 * Hook to track container dimensions via ResizeObserver (CSS Container Query companion)
 */
export function useContainerQuery<T extends HTMLElement = HTMLDivElement>(ref: RefObject<T | null>) {
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentBoxSize) {
          const inlineSize = Array.isArray(entry.contentBoxSize)
            ? entry.contentBoxSize[0].inlineSize
            : (entry.contentBoxSize as any).inlineSize;
          setContainerWidth(inlineSize);
        } else {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return {
    containerWidth,
    isCompactContainer: containerWidth > 0 && containerWidth < 380,
    isMediumContainer: containerWidth >= 380 && containerWidth < 600,
    isWideContainer: containerWidth >= 600,
  };
}
