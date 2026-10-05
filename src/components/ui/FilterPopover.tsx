import React, { useEffect, useState, useRef, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPRING_SNAPPY } from "../motion";

export interface FilterPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  title?: string;
  headerAction?: React.ReactNode;
  width?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  align?: "start" | "end" | "center";
  showBackdrop?: boolean;
  className?: string;
  contentClassName?: string;
}

interface Coords {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: "bottom" | "top";
}

export default function FilterPopover({
  isOpen,
  onClose,
  triggerRef,
  children,
  title,
  headerAction,
  width = 340,
  maxWidth = "calc(100vw - 32px)",
  maxHeight = 480,
  align = "start",
  showBackdrop = true,
  className,
  contentClassName,
}: FilterPopoverProps) {
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Ensure portal target is ready on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute collision-detected placement and viewport coordinates
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Numerical target width
    const targetWidth = typeof width === "number" ? width : Math.min(340, vw - 32);
    const popoverWidth = Math.min(targetWidth, vw - 32);

    // Collision detection: check space above vs below
    const gap = 8;
    const spaceBelow = vh - triggerRect.bottom - gap - 16;
    const spaceAbove = triggerRect.top - gap - 16;
    const desiredHeight = typeof maxHeight === "number" ? maxHeight : 460;

    let placement: "bottom" | "top" = "bottom";
    let availableHeight = spaceBelow;

    if (spaceBelow < 280 && spaceAbove > spaceBelow) {
      placement = "top";
      availableHeight = spaceAbove;
    }

    const calculatedMaxHeight = Math.min(desiredHeight, Math.max(availableHeight, 220));

    // Calculate vertical top
    let top = 0;
    if (placement === "bottom") {
      top = triggerRect.bottom + gap;
    } else {
      top = Math.max(16, triggerRect.top - gap - calculatedMaxHeight);
    }

    // Calculate horizontal left based on align & clamp to viewport boundaries
    let left = triggerRect.left;
    if (align === "end") {
      left = triggerRect.right - popoverWidth;
    } else if (align === "center") {
      left = triggerRect.left + (triggerRect.width - popoverWidth) / 2;
    }

    // Horizontal viewport collision boundary padding (16px from each edge)
    const minLeft = 16;
    const maxLeft = Math.max(minLeft, vw - popoverWidth - 16);
    const clampedLeft = Math.max(minLeft, Math.min(left, maxLeft));

    setCoords({
      top: Math.round(top),
      left: Math.round(clampedLeft),
      width: popoverWidth,
      maxHeight: Math.round(calculatedMaxHeight),
      placement,
    });
  }, [triggerRef, width, maxHeight, align]);

  // Update position on open, scroll, resize
  useLayoutEffect(() => {
    if (!isOpen) return;
    updatePosition();

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener("scroll", handleScrollOrResize, { passive: true, capture: true });
    window.addEventListener("resize", handleScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, { capture: true });
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, updatePosition]);

  // Keyboard navigation: Escape key closes the popover
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && coords && (
        <div className="fixed inset-0 pointer-events-none z-[9990]" role="dialog" aria-modal="true">
          {/* Backdrop Scrim: Dims page completely and establishes unambiguous visual elevation */}
          {showBackdrop && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/65 backdrop-blur-[4px] pointer-events-auto cursor-pointer z-[9990]"
              aria-hidden="true"
            />
          )}

          {/* Elevated Popover Panel Container: Solid Opaque Background, High Elevation */}
          <motion.div
            ref={popoverRef}
            initial={{ 
              opacity: 0, 
              y: coords.placement === "bottom" ? -8 : 8, 
              scale: 0.98 
            }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1 
            }}
            exit={{ 
              opacity: 0, 
              y: coords.placement === "bottom" ? -6 : 6, 
              scale: 0.98 
            }}
            transition={SPRING_SNAPPY}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              maxHeight: `${coords.maxHeight}px`,
              backgroundColor: undefined, // Handled via opaque classes
            }}
            className={cn(
              // True Neutral Apple Elevation & Containment: 100% Solid Fill
              "pointer-events-auto flex flex-col rounded-3xl overflow-hidden z-[9995]",
              "bg-white dark:bg-[#1E1E20] opacity-100",
              "border border-slate-300 dark:border-white/15",
              "shadow-[0_25px_70px_rgba(0,0,0,0.3)] dark:shadow-[0_35px_90px_rgba(0,0,0,0.9)]",
              "text-slate-900 dark:text-[#F5F5F7]",
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Optional Clean Header */}
            {(title || headerAction) && (
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/80 dark:border-white/10 shrink-0 bg-slate-50 dark:bg-[#1A1A1C]">
                {title ? (
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-[#8E8E93]">
                    {title}
                  </span>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2">
                  {headerAction}
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:text-[#8E8E93] dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Scrollable Contained Content - NEVER expands into page flow */}
            <div 
              className={cn(
                "flex-1 p-4 min-h-0",
                contentClassName ? contentClassName : "overflow-y-auto"
              )}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
