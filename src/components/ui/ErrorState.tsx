import React from "react";
import { AlertCircle, RotateCcw, LucideIcon } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps {
  icon?: LucideIcon;
  title?: string;
  message?: string;
  recommendation?: string;
  onRetry?: () => void;
  retryLoading?: boolean;
  className?: string;
}

export function ErrorState({
  icon: Icon = AlertCircle,
  title = "Something went wrong loading this data",
  message = "We encountered a temporary network or server issue while fetching the requested information.",
  recommendation = "Please check your connection and click retry below. If the issue persists, contact support.",
  onRetry,
  retryLoading = false,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/20",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400 mb-4 ring-8 ring-red-100/50 dark:ring-red-900/20">
        <Icon className="w-6 h-6 stroke-[1.75]" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1.5 tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mb-2 leading-relaxed">
        {message}
      </p>
      {recommendation && (
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-5 leading-relaxed">
          {recommendation}
        </p>
      )}
      {onRetry && (
        <Button
          onClick={onRetry}
          isLoading={retryLoading}
          variant="outline"
          size="sm"
          className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Try Again
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
