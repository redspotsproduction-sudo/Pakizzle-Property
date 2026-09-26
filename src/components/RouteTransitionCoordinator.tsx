import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { REVEAL_EASE } from "./motion";

/**
 * Accessible Skip Link for keyboard navigation (WCAG 2.1 AA)
 */
export function SkipToContentLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100000] focus:px-4 focus:py-2.5 focus:bg-apple-blue focus:text-white focus:rounded-xl focus:shadow-2xl focus:font-bold focus:text-xs focus:tracking-wide focus:outline-none focus:ring-4 focus:ring-apple-blue/30 transition-all"
    >
      Skip to main content
    </a>
  );
}

/**
 * Top Route Progress Bar (Apple / Safari Style)
 * Fires a sleek glowing indicator line across the viewport top on route changes.
 */
export function RouteProgressBar() {
  const { pathname, search } = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  const prevLocationRef = useRef(pathname + search);

  useEffect(() => {
    const currentLocation = pathname + search;
    if (prevLocationRef.current !== currentLocation) {
      prevLocationRef.current = currentLocation;
      
      if (shouldReduceMotion) return;

      setIsNavigating(true);
      setProgress(25);

      const t1 = setTimeout(() => setProgress(70), 80);
      const t2 = setTimeout(() => setProgress(100), 200);
      const t3 = setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 450);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [pathname, search, shouldReduceMotion]);

  if (!isNavigating || shouldReduceMotion) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[99999] pointer-events-none bg-transparent overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-apple-blue via-teal-400 to-emerald-400 shadow-[0_0_10px_rgba(15,118,110,0.7)]"
        initial={{ width: "0%", opacity: 1 }}
        animate={{ width: `${progress}%`, opacity: progress === 100 ? 0 : 1 }}
        transition={{
          width: { ease: [0.16, 1, 0.3, 1], duration: 0.25 },
          opacity: { duration: 0.2, delay: progress === 100 ? 0.1 : 0 },
        }}
      />
    </div>
  );
}

/**
 * Page Transition Wrapper
 * Soft Apple fade and micro-float.
 */
export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function PageTransition({ children, className = "", id = "main-content" }: PageTransitionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      id={id}
      tabIndex={-1}
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
      transition={{
        duration: shouldReduceMotion ? 0.1 : 0.32,
        ease: REVEAL_EASE,
      }}
      className={`outline-none focus:outline-none ${className}`}
    >
      {children}
    </motion.div>
  );
}
