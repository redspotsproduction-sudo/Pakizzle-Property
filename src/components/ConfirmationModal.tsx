import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { Button } from "./ui/button";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isLoading && onClose()}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            role="alertdialog"
            aria-modal="true"
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.15)] overflow-hidden p-6 text-slate-900 dark:text-slate-100"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  variant === "danger"
                    ? "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400"
                    : variant === "warning"
                    ? "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
                    : "bg-teal-50 dark:bg-teal-950/50 text-[#0F766E] dark:text-teal-400"
                }`}
              >
                {variant === "danger" ? (
                  <AlertCircle className="w-5 h-5 stroke-[2]" />
                ) : variant === "warning" ? (
                  <AlertTriangle className="w-5 h-5 stroke-[2]" />
                ) : (
                  <Info className="w-5 h-5 stroke-[2]" />
                )}
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                aria-label="Close dialog"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
              {title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              {message}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                disabled={isLoading}
              >
                {cancelLabel}
              </Button>
              <Button
                variant={variant === "danger" ? "destructive" : "primary"}
                size="sm"
                isLoading={isLoading}
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export { ConfirmationModal as ConfirmDialog };
