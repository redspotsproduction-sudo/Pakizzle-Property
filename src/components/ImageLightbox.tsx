import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  MapPin, 
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SPRING_SNAPPY, SPRING_BOUNCY, REVEAL_EASE } from "./motion";

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  title?: string;
  subtitle?: string;
  isVerified?: boolean;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 350 : -350,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 350 : -350,
    opacity: 0,
    scale: 0.96,
  }),
};

export default function ImageLightbox({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  title,
  subtitle,
  isVerified
}: ImageLightboxProps) {
  const shouldReduceMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [[page, direction], setPage] = useState<[number, number]>([initialIndex, 0]);
  const [isZoomed, setIsZoomed] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);

  // Sync index when initialIndex changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setPage([initialIndex, 0]);
      setIsZoomed(false);
    }
  }, [isOpen, initialIndex]);

  // Keep active thumbnail centered in scroll view
  useEffect(() => {
    if (isOpen && thumbsRef.current) {
      const activeThumb = thumbsRef.current.querySelector(`[data-thumb-index="${currentIndex}"]`) as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [currentIndex, isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        navigateImage(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigateImage(-1);
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setIsZoomed((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  const navigateImage = (newDirection: number) => {
    if (images.length <= 1) return;
    setIsZoomed(false);
    let nextIndex = currentIndex + newDirection;
    if (nextIndex < 0) nextIndex = images.length - 1;
    if (nextIndex >= images.length) nextIndex = 0;
    setCurrentIndex(nextIndex);
    setPage([nextIndex, newDirection]);
  };

  const jumpToIndex = (index: number) => {
    if (index === currentIndex) return;
    setIsZoomed(false);
    const newDirection = index > currentIndex ? 1 : -1;
    setCurrentIndex(index);
    setPage([index, newDirection]);
  };

  if (typeof document === "undefined" || !isOpen || images.length === 0) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex flex-col bg-black/95 backdrop-blur-2xl select-none overflow-hidden">
          {/* Top Control Bar */}
          <div className="relative z-30 flex items-center justify-between px-4 sm:px-8 py-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            {/* Title & Specs */}
            <div className="flex items-center gap-3 min-w-0">
              {isVerified && (
                <div className="p-1 rounded-full bg-apple-green text-white shrink-0 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              )}
              <div className="min-w-0">
                <h3 className="text-white text-sm sm:text-base font-bold truncate">
                  {title || "Property Gallery"}
                </h3>
                {subtitle && (
                  <p className="text-neutral-400 text-xs flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 text-apple-blue shrink-0" />
                    <span>{subtitle}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Actions: Zoom, Counter, Close */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Photo Index Counter Pill */}
              <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-bold tracking-wider">
                <span>{currentIndex + 1}</span>
                <span className="text-white/50 mx-1">/</span>
                <span>{images.length}</span>
              </div>

              {/* Zoom Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                transition={SPRING_SNAPPY}
                onClick={() => setIsZoomed((prev) => !prev)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/10 cursor-pointer"
                title={isZoomed ? "Reset Zoom (Space)" : "Zoom In (Space)"}
              >
                {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
              </motion.button>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                transition={SPRING_SNAPPY}
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/10 cursor-pointer"
                title="Close Lightbox (Esc)"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Central Stage: Gestural Image Viewer */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden p-2 sm:p-6">
            {/* Left Nav Arrow */}
            {images.length > 1 && (
              <motion.button
                whileHover={{ scale: 1.08, x: -2 }}
                whileTap={{ scale: 0.9 }}
                transition={SPRING_SNAPPY}
                onClick={() => navigateImage(-1)}
                className="absolute left-3 sm:left-6 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-md text-white border border-white/15 flex items-center justify-center transition-colors shadow-2xl cursor-pointer"
                title="Previous Image (←)"
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>
            )}

            {/* Slide Image Container */}
            <div className="relative w-full h-full flex items-center justify-center">
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={page}
                  custom={direction}
                  variants={shouldReduceMotion ? undefined : slideVariants}
                  initial={shouldReduceMotion ? { opacity: 0 } : "enter"}
                  animate={shouldReduceMotion ? { opacity: 1 } : "center"}
                  exit={shouldReduceMotion ? { opacity: 0 } : "exit"}
                  transition={{
                    x: { type: "spring", stiffness: 320, damping: 30 },
                    opacity: { duration: 0.25 },
                    scale: { duration: 0.25 }
                  }}
                  drag={!isZoomed ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.3}
                  onDragEnd={(_e, info) => {
                    const swipeThreshold = 50;
                    const swipeVelocity = 250;
                    if (info.offset.x < -swipeThreshold || info.velocity.x < -swipeVelocity) {
                      navigateImage(1);
                    } else if (info.offset.x > swipeThreshold || info.velocity.x > swipeVelocity) {
                      navigateImage(-1);
                    }
                  }}
                  onClick={() => setIsZoomed((prev) => !prev)}
                  className={cn(
                    "w-full h-full flex items-center justify-center p-2 sm:p-4 cursor-zoom-in transition-transform duration-300",
                    isZoomed && "cursor-zoom-out"
                  )}
                >
                  <motion.img
                    src={images[currentIndex]}
                    alt={`Photo ${currentIndex + 1}`}
                    animate={{ scale: isZoomed ? 1.75 : 1 }}
                    transition={{ type: "spring", damping: 25, stiffness: 280 }}
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] select-none pointer-events-none"
                    referrerPolicy="no-referrer"
                    loading="eager"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Nav Arrow */}
            {images.length > 1 && (
              <motion.button
                whileHover={{ scale: 1.08, x: 2 }}
                whileTap={{ scale: 0.9 }}
                transition={SPRING_SNAPPY}
                onClick={() => navigateImage(1)}
                className="absolute right-3 sm:right-6 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-md text-white border border-white/15 flex items-center justify-center transition-colors shadow-2xl cursor-pointer"
                title="Next Image (→)"
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            )}
          </div>

          {/* Bottom Thumbnail Carousel Strip */}
          <div className="relative z-30 px-4 py-3 sm:py-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
            <div 
              ref={thumbsRef}
              className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-hide max-w-5xl mx-auto"
            >
              {images.map((img, idx) => {
                const isActive = currentIndex === idx;
                return (
                  <motion.button
                    key={`lightbox-thumb-${idx}`}
                    data-thumb-index={idx}
                    whileHover={{ scale: 1.06, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={SPRING_SNAPPY}
                    onClick={() => jumpToIndex(idx)}
                    className={cn(
                      "relative shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-xl overflow-hidden cursor-pointer transition-all duration-300",
                      isActive
                        ? "opacity-100 ring-2 ring-apple-blue ring-offset-2 ring-offset-black scale-105"
                        : "opacity-40 hover:opacity-80"
                    )}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {isActive && (
                      <motion.div
                        layoutId="activeLightboxThumb"
                        transition={SPRING_SNAPPY}
                        className="absolute inset-0 border-2 border-apple-blue rounded-xl pointer-events-none"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
