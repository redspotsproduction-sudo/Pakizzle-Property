import React, { useRef, useState, useEffect } from "react";
import { 
  motion, 
  useInView, 
  useReducedMotion, 
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
  type HTMLMotionProps,
  type Transition
} from "motion/react";
import { cn } from "@/lib/utils";

// ============================================================================
// 1. Core Physics & Easing Constants
// ============================================================================

/**
 * Reveal easing: fast initial acceleration with soft, premium deceleration settle.
 * Equivalent to CSS cubic-bezier(0.16, 1, 0.3, 1)
 */
export const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;

/**
 * State transition easing: for shifting between view states, slides, tabs.
 * Equivalent to CSS cubic-bezier(0.65, 0, 0.35, 1)
 */
export const TRANSITION_EASE = [0.65, 0, 0.35, 1] as const;

/**
 * Tactile spring for buttons, micro-interactions, toggles.
 */
export const SPRING_TACTILE: Transition = {
  type: "spring",
  stiffness: 480,
  damping: 30,
  mass: 0.8
};

/**
 * Snappy spring for quick releases (100ms feel)
 */
export const SPRING_SNAPPY: Transition = {
  type: "spring",
  stiffness: 550,
  damping: 26,
  duration: 0.12
};

/**
 * Bouncy spring for drawers, sheets, modals, notifications
 */
export const SPRING_BOUNCY: Transition = {
  type: "spring",
  stiffness: 350,
  damping: 22,
  mass: 1
};

/**
 * Gentle floating spring for cards and modal sheets
 */
export const SPRING_GENTLE: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 24
};

// ============================================================================
// 2. RevealOnScroll Wrapper
// ============================================================================

export interface RevealOnScrollProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "fade" | "scale";
  distance?: number;
  delay?: number;
  duration?: number;
  staggerIndex?: number;
  staggerInterval?: number;
  once?: boolean;
  viewportMargin?: string;
  className?: string;
  as?: "div" | "section" | "article" | "aside" | "header" | "footer";
}

/**
 * Scroll-driven reveal container.
 * Elements start slightly offset (translateY 40-60px, opacity 0, subtle scale)
 * and animate into place once triggered by the viewport intersection observer.
 * Triggered once by default to eliminate flicker on reverse scrolling.
 */
export const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  direction = "up",
  distance = 50,
  delay = 0,
  duration = 0.65,
  staggerIndex = 0,
  staggerInterval = 0.06,
  once = true,
  viewportMargin = "-50px",
  className,
  as: Component = "div",
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();
  const effectiveDelay = delay + staggerIndex * staggerInterval;

  if (shouldReduceMotion) {
    return (
      <div className={className} {...(props as any)}>
        {children}
      </div>
    );
  }

  const getInitialOffsets = () => {
    switch (direction) {
      case "up":
        return { y: distance, x: 0, scale: 0.98 };
      case "down":
        return { y: -distance, x: 0, scale: 0.98 };
      case "left":
        return { x: distance, y: 0, scale: 0.98 };
      case "right":
        return { x: -distance, y: 0, scale: 0.98 };
      case "scale":
        return { x: 0, y: distance * 0.3, scale: 0.94 };
      case "fade":
      default:
        return { x: 0, y: 0, scale: 1 };
    }
  };

  const initial = {
    opacity: 0,
    ...getInitialOffsets(),
  };

  const MotionComponent = (motion as any)[Component] || motion.div;

  return (
    <MotionComponent
      initial={initial}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
      }}
      viewport={{ once, margin: viewportMargin }}
      transition={{
        duration,
        delay: effectiveDelay,
        ease: REVEAL_EASE,
      }}
      className={className}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};

// ============================================================================
// 3. Stagger Parent & Item Primitives
// ============================================================================

export interface StaggerGroupProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  staggerDuration?: number;
  delayChildren?: number;
  className?: string;
}

export const StaggerGroup: React.FC<StaggerGroupProps> = ({
  children,
  staggerDuration = 0.06,
  delayChildren = 0.05,
  className,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDuration,
            delayChildren,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export interface StaggerItemProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  distance?: number;
  className?: string;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  distance = 36,
  className,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: distance, scale: 0.98 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.55,
            ease: REVEAL_EASE,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// 4. Tactile Animated Button
// ============================================================================

export interface MotionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "glass" | "ghost" | "danger" | "emerald";
  size?: "sm" | "md" | "lg" | "icon";
  children: React.ReactNode;
  className?: string;
}

/**
 * Tactile button with physical scale(0.97) compression on press,
 * fast 100ms spring-back on release, and subtle hover elevation.
 */
export const MotionButton = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ variant = "primary", size = "md", children, className, disabled, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    const sizeClasses = {
      sm: "h-9 px-3.5 text-xs font-semibold rounded-xl gap-1.5",
      md: "h-11 px-5 text-sm font-semibold rounded-2xl gap-2",
      lg: "h-13 px-7 text-base font-bold rounded-2xl gap-2.5",
      icon: "w-10 h-10 rounded-2xl flex items-center justify-center p-0",
    }[size];

    const variantClasses = {
      primary: "bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] shadow-sm hover:shadow-md",
      secondary: "bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-white/15",
      glass: "liquid-glass-mid text-slate-800 dark:text-white border border-slate-200/60 dark:border-white/15 shadow-sm hover:shadow-md",
      ghost: "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5",
      danger: "bg-rose-500 text-white shadow-sm hover:bg-rose-600",
      emerald: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:shadow-emerald-500/20",
    }[variant];

    return (
      <motion.button
        ref={ref}
        whileTap={disabled || shouldReduceMotion ? undefined : { scale: 0.97 }}
        whileHover={disabled || shouldReduceMotion ? undefined : { scale: 1.015, y: -1 }}
        transition={SPRING_SNAPPY}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer",
          sizeClasses,
          variantClasses,
          className
        )}
        {...(props as any)}
      >
        {children}
      </motion.button>
    );
  }
);
MotionButton.displayName = "MotionButton";

// ============================================================================
// 5. Physics-Eased Animated Counter
// ============================================================================

export interface AnimatedCounterProps {
  value: number;
  from?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  formatThousands?: boolean;
  className?: string;
  once?: boolean;
}

/**
 * Counts up from 0 to value over ~1.2s when entering viewport using an eased curve
 * (fast start, soft finish cubic ease-out) rather than a linear tick.
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  from = 0,
  duration = 1.2,
  decimals = 0,
  prefix = "",
  suffix = "",
  formatThousands = true,
  className,
  once = true,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, margin: "-30px" });
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState<number>(shouldReduceMotion ? value : from);
  const prevValueRef = useRef<number>(from);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    if (!isInView) return;

    const startVal = prevValueRef.current;
    const targetVal = value;
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = (timestamp - startTimestamp) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      // Fast start, soft finish (cubic-bezier out approximation)
      const easeProgress = 1 - Math.pow(1 - progress, 3.2);
      const current = startVal + (targetVal - startVal) * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(targetVal);
        prevValueRef.current = targetVal;
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isInView, value, duration, shouldReduceMotion]);

  const formattedNumber = () => {
    let numStr = displayValue.toFixed(decimals);
    if (formatThousands) {
      const parts = numStr.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    }
    return numStr;
  };

  return (
    <span ref={ref} className={cn("tabular-nums inline-block font-sans", className)}>
      {prefix}
      {formattedNumber()}
      {suffix}
    </span>
  );
};

// ============================================================================
// 6. Premium Animated Card (Combined Hover Physics)
// ============================================================================

export interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  liftDistance?: number;
  scaleAmount?: number;
}

/**
 * Premium card hover interaction:
 * Combines translateY(-6px) + enhanced shadow depth + subtle scale(1.015) in a single spring.
 */
export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  liftDistance = -6,
  scaleAmount = 1.015,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              y: liftDistance,
              scale: scaleAmount,
              boxShadow: "0 22px 40px -12px rgba(0, 0, 0, 0.16), 0 0 1px 1px rgba(255, 255, 255, 0.2) inset",
              transition: {
                duration: 0.32,
                ease: REVEAL_EASE,
              },
            }
      }
      whileTap={
        shouldReduceMotion
          ? undefined
          : {
              scale: 0.985,
              transition: SPRING_SNAPPY,
            }
      }
      className={cn("transition-colors cursor-pointer", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// 7. Morphing / Sliding Segmented Indicator (layoutId)
// ============================================================================

export interface SlidingSegmentOption<T extends string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface SlidingSegmentedControlProps<T extends string> {
  options: SlidingSegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  layoutId?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Physical sliding pill indicator that morphs between options using Framer Motion's layoutId.
 * Never jump-cuts between positions.
 */
export function SlidingSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  layoutId = "active-pill-indicator",
  className,
  size = "md",
}: SlidingSegmentedControlProps<T>) {
  const shouldReduceMotion = useReducedMotion();

  const sizeClasses = {
    sm: "p-1 gap-1 text-xs",
    md: "p-1.5 gap-1 text-xs md:text-sm",
    lg: "p-2 gap-1.5 text-sm md:text-base",
  }[size];

  const itemPadding = {
    sm: "px-3 py-1 rounded-lg",
    md: "px-4 py-1.5 rounded-xl",
    lg: "px-5 py-2 rounded-xl",
  }[size];

  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center bg-slate-200/70 dark:bg-white/10 backdrop-blur-md rounded-2xl relative select-none border border-slate-300/40 dark:border-white/10",
        sizeClasses,
        className
      )}
    >
      {options.map((opt) => {
        const isSelected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(opt.id)}
            className={cn(
              "relative font-semibold transition-colors duration-200 flex items-center gap-1.5 z-10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
              itemPadding,
              isSelected
                ? "text-slate-900 dark:text-white"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            {isSelected && (
              <motion.div
                layoutId={shouldReduceMotion ? undefined : layoutId}
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 32,
                }}
                className="absolute inset-0 bg-white dark:bg-[#1D1D1F] rounded-xl shadow-md border border-black/5 dark:border-white/10 z-[-1]"
              />
            )}
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            <span>{opt.label}</span>
            {opt.badge !== undefined && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-white/20 font-bold ml-0.5">
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// 8. Animated Success Checkmark (SVG Stroke Animation)
// ============================================================================

export interface SuccessCheckmarkProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const SuccessCheckmark: React.FC<SuccessCheckmarkProps> = ({
  size = 48,
  strokeWidth = 3,
  className,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("text-emerald-500", className)}
      >
        <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth={strokeWidth} />
        <polyline points="14,24 21,31 34,17" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.35, ease: REVEAL_EASE }}
      className={cn("text-emerald-500", className)}
    >
      <motion.circle
        cx="24"
        cy="24"
        r="22"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.45, ease: REVEAL_EASE }}
      />
      <motion.path
        d="M14 24L21 31L34 17"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.25, duration: 0.35, ease: REVEAL_EASE }}
      />
    </motion.svg>
  );
};

// ============================================================================
// 10. 3D Perspective Tilt Card with Specular Sheen (CardHoverTilt)
// ============================================================================

export interface CardHoverTiltProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  scaleAmount?: number;
  liftAmount?: number;
  enableGlare?: boolean;
}

export const CardHoverTilt: React.FC<CardHoverTiltProps> = ({
  children,
  className,
  maxTilt = 7,
  scaleAmount = 1.015,
  liftAmount = -6,
  enableGlare = true,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -maxTilt;
    const rotY = ((x - centerX) / centerX) * maxTilt;

    setRotateX(rotX);
    setRotateY(rotY);

    if (enableGlare) {
      setGlarePosition({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
        opacity: 0.18,
      });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  };

  if (shouldReduceMotion) {
    return (
      <div className={className} {...(props as any)}>
        {children}
      </div>
    );
  }

  return (
    <div style={{ perspective: 1000 }} className="relative">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          y: isHovered ? liftAmount : 0,
          scale: isHovered ? scaleAmount : 1,
        }}
        whileTap={{ scale: 0.985 }}
        transition={{
          type: "spring",
          stiffness: 380,
          damping: 28,
          mass: 0.8,
        }}
        className={cn(
          "relative overflow-hidden transition-shadow duration-300",
          isHovered
            ? "shadow-[0_20px_45px_-12px_rgba(0,0,0,0.18),0_0_1px_1px_rgba(255,255,255,0.2)_inset]"
            : "shadow-sm",
          className
        )}
        {...props}
      >
        {children}

        {/* Specular Glare Overlay */}
        {enableGlare && (
          <div
            className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300 rounded-[inherit]"
            style={{
              opacity: glarePosition.opacity,
              background: `radial-gradient(circle 320px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 80%)`,
            }}
          />
        )}
      </motion.div>
    </div>
  );
};

// ============================================================================
// 11. Skeleton Shimmer Loader (Subtle Gradient Pulse)
// ============================================================================

export interface SkeletonShimmerProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export const SkeletonShimmer: React.FC<SkeletonShimmerProps> = ({
  className,
  rounded = "2xl",
}) => {
  const shouldReduceMotion = useReducedMotion();

  const roundedClasses = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
  }[rounded];

  if (shouldReduceMotion) {
    return (
      <div
        className={cn("bg-slate-200 dark:bg-slate-800", roundedClasses, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-slate-200/80 dark:bg-slate-800/80",
        roundedClasses,
        className
      )}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent"
        animate={{
          transform: ["translateX(-100%)", "translateX(100%)"],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.6,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

// ============================================================================
// 12. Scroll Parallax Hook & Container
// ============================================================================

export function useParallax(value: MotionValue<number>, distance: number) {
  return useTransform(value, [0, 1], [-distance, distance]);
}

export interface ParallaxContainerProps {
  children: React.ReactNode;
  speed?: number; // e.g. 0.5 for background parallax (slower than foreground)
  className?: string;
}

export const ParallaxContainer: React.FC<ParallaxContainerProps> = ({
  children,
  speed = 0.5,
  className,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-100 * speed, 100 * speed]);
  const smoothY = useSpring(y, { stiffness: 300, damping: 30 });

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.div style={{ y: smoothY }}>{children}</motion.div>
    </div>
  );
};

// ============================================================================
// 13. Pin-and-Reveal Feature Section
// ============================================================================

export interface PinItem {
  id: string | number;
  badge?: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  visual?: React.ReactNode;
}

export interface PinRevealSectionProps {
  items: PinItem[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export const PinRevealSection: React.FC<PinRevealSectionProps> = ({
  items,
  title,
  subtitle,
  className,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    if (shouldReduceMotion) return;
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const step = 1 / items.length;
      const index = Math.min(Math.floor(latest / step), items.length - 1);
      setActiveIndex(index);
    });
    return () => unsubscribe();
  }, [scrollYProgress, items.length, shouldReduceMotion]);

  if (shouldReduceMotion) {
    return (
      <div className={cn("py-16 px-4 max-w-6xl mx-auto space-y-12", className)}>
        {title && <h2 className="text-3xl font-bold tracking-tight">{title}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item) => (
            <div key={item.id} className="p-6 rounded-2xl border border-slate-200 dark:border-white/10">
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-slate-600 dark:text-slate-400">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ height: `${items.length * 100}vh` }}
      className={cn("relative", className)}
    >
      <div className="sticky top-0 h-screen flex flex-col justify-center px-4 md:px-8 max-w-6xl mx-auto overflow-hidden">
        {title && (
          <div className="mb-8">
            {subtitle && (
              <span className="text-xs uppercase font-mono tracking-widest text-emerald-600 dark:text-emerald-400">
                {subtitle}
              </span>
            )}
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mt-1 text-slate-900 dark:text-white">
              {title}
            </h2>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Points List */}
          <div className="space-y-6">
            {items.map((item, idx) => {
              const isActive = activeIndex === idx;
              return (
                <motion.div
                  key={item.id}
                  animate={{
                    opacity: isActive ? 1 : 0.35,
                    x: isActive ? 12 : 0,
                  }}
                  transition={{ duration: 0.35, ease: REVEAL_EASE }}
                  className="p-6 rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {item.icon && (
                      <span className={cn("p-2 rounded-xl text-white", isActive ? "bg-emerald-600" : "bg-slate-400")}>
                        {item.icon}
                      </span>
                    )}
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-sm md:text-base text-slate-600 dark:text-slate-300">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Cross-fading Active Visual */}
          <div className="relative h-80 lg:h-[420px] rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/10 bg-slate-900 shadow-2xl flex items-center justify-center">
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={false}
                animate={{
                  opacity: activeIndex === idx ? 1 : 0,
                  scale: activeIndex === idx ? 1 : 0.94,
                }}
                transition={{ duration: 0.45, ease: REVEAL_EASE }}
                className="absolute inset-0 flex items-center justify-center p-8 text-center"
              >
                {item.visual ? (
                  item.visual
                ) : (
                  <div className="text-white">
                    <div className="text-6xl font-black mb-4 opacity-20">0{idx + 1}</div>
                    <div className="text-2xl font-bold">{item.title}</div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

