import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger"
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-apple-card-bg rounded-[32px] shadow-2xl overflow-hidden p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                variant === 'danger' ? 'bg-apple-red/10 text-apple-red' : 
                variant === 'warning' ? 'bg-apple-orange/10 text-apple-orange' : 
                'bg-apple-blue/10 text-apple-blue'
              }`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-apple-gray/50 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-apple-text-muted" />
              </button>
            </div>

            <h3 className="text-2xl font-bold text-apple-text mb-2 tracking-tight">{title}</h3>
            <p className="text-apple-text-muted mb-8 leading-relaxed">
              {message}
            </p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 h-12 rounded-full bg-apple-gray/50 text-apple-text font-bold text-sm hover:bg-apple-border transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 h-12 rounded-full text-white font-bold text-sm transition-all shadow-lg ${
                  variant === 'danger' ? 'bg-apple-red shadow-apple-red/20 hover:bg-red-600' : 
                  variant === 'warning' ? 'bg-apple-orange shadow-apple-orange/20 hover:bg-orange-600' : 
                  'bg-apple-blue shadow-apple-blue/20 hover:bg-blue-600'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
