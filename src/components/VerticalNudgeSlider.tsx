import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Nudge, { NudgeType } from "./Nudge";
import { cn } from "@/lib/utils";

interface VerticalNudgeSliderProps {
  nudges: { type: NudgeType; text?: string }[];
  interval?: number;
  className?: string;
}

export default function VerticalNudgeSlider({ nudges, interval = 3000, className }: VerticalNudgeSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!nudges || nudges.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % nudges.length);
    }, interval);

    return () => clearInterval(timer);
  }, [nudges?.length, interval]);

  if (!nudges || nudges.length === 0) return null;

  return (
    <div className={cn(
      "relative h-20 overflow-hidden",
      className
    )}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ 
            duration: 0.5, 
            ease: [0.16, 1, 0.3, 1] 
          }}
          className="absolute inset-0 flex items-center px-5"
        >
          <div className="w-full">
            <Nudge 
              type={nudges[currentIndex].type} 
              text={nudges[currentIndex].text} 
              variant="banner" 
              noAnimate={true}
              className="!border-none !bg-transparent !shadow-none !px-0 !py-0 !transition-none"
            />
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Progress Indicators */}
      <div className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-10">
        {nudges.map((_, i) => (
          <motion.div 
            key={i}
            initial={false}
            animate={{ 
              height: i === currentIndex ? 16 : 4,
              backgroundColor: i === currentIndex ? "var(--apple-blue)" : "var(--apple-gray)"
            }}
            className="w-1 rounded-full transition-colors duration-500"
          />
        ))}
      </div>
    </div>
  );
}
