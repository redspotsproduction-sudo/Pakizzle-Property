import React from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";
import { STEP_DEFINITIONS } from "./types";

interface StepperNavProps {
  currentStep: number;
  completedSteps: number[];
  onStepClick: (stepIndex: number) => void;
}

export const StepperNav: React.FC<StepperNavProps> = ({
  currentStep,
  completedSteps,
  onStepClick,
}) => {
  return (
    <nav
      aria-label="Listing creation steps"
      className="w-full overflow-x-auto py-2 scrollbar-none"
    >
      <ol className="flex items-center gap-2 sm:gap-3 min-w-max px-1">
        {STEP_DEFINITIONS.map((step, idx) => {
          const isCurrent = currentStep === idx;
          const isCompleted = completedSteps.includes(idx);
          const isClickable = isCompleted && !isCurrent;

          return (
            <li key={step.id} className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => isClickable && onStepClick(idx)}
                disabled={!isClickable && !isCurrent}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Step ${step.stepNumber}: ${step.label}${isCompleted ? " (Completed)" : ""}`}
                className={cn(
                  "group flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold transition-all duration-300 select-none",
                  isCurrent &&
                    "pakizzle-button-primary text-white shadow-md scale-102 cursor-default",
                  isCompleted &&
                    !isCurrent &&
                    "bg-[#5B2A86]/10 text-[#5B2A86] dark:text-[#FAF3E6] border border-[#5B2A86]/20 hover:bg-[#5B2A86]/20 cursor-pointer",
                  !isCurrent &&
                    !isCompleted &&
                    "bg-black/5 dark:bg-white/5 text-apple-text-muted/60 border border-transparent cursor-not-allowed opacity-60"
                )}
              >
                {/* Number / Check circle */}
                <span
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors",
                    isCurrent && "bg-white/20 text-white",
                    isCompleted && !isCurrent && "bg-[#5FA84C] text-white",
                    !isCurrent && !isCompleted && "bg-black/10 dark:bg-white/10 text-apple-text-muted"
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="w-3 h-3 stroke-[3]" />
                  ) : (
                    step.stepNumber
                  )}
                </span>

                {/* Step label */}
                <span className="hidden sm:inline tracking-tight font-medium">
                  {step.label}
                </span>
                <span className="sm:hidden font-medium">
                  {step.shortLabel}
                </span>
              </button>

              {/* Connecting hairline */}
              {idx < STEP_DEFINITIONS.length - 1 && (
                <div
                  className={cn(
                    "w-3 sm:w-6 h-[1.5px] rounded-full transition-colors",
                    isCompleted ? "bg-[#5B2A86]/40 dark:bg-[#C9A227]/40" : "bg-black/10 dark:bg-white/10"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default StepperNav;
