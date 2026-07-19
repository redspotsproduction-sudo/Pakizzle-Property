import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Settings, X, ChevronRight } from 'lucide-react';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAllow: () => void;
}

export default function LocationPermissionModal({ isOpen, onClose, onAllow }: LocationPermissionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
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
            className="relative w-full max-w-sm bg-apple-bg rounded-[24px] shadow-2xl overflow-hidden border border-apple-border"
          >
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-apple-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-apple-blue" />
              </div>
              
              <h3 className="text-xl font-bold mb-3 tracking-tight">Allow Pakizzle to access your location?</h3>
              <p className="text-sm text-apple-text-muted leading-relaxed mb-8">
                Pakizzle uses your location to show local content, improve recommendations, and more.
              </p>

              <div className="space-y-3 mb-8 text-left bg-apple-gray/50 p-5 rounded-2xl">
                <div className="flex items-center gap-3 text-xs font-bold text-apple-text-muted uppercase tracking-widest mb-2">
                  <Settings className="w-3 h-3" />
                  How to enable
                </div>
                <ul className="space-y-2 text-xs font-medium text-apple-text">
                  <li className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-apple-blue/10 text-apple-blue flex items-center justify-center text-[10px]">1</span>
                    Open Settings
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-apple-blue/10 text-apple-blue flex items-center justify-center text-[10px]">2</span>
                    Tap Privacy
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-apple-blue/10 text-apple-blue flex items-center justify-center text-[10px]">3</span>
                    Tap Location Services
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-apple-blue/10 text-apple-blue flex items-center justify-center text-[10px]">4</span>
                    Set Pakizzle to On
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onClose}
                  className="py-4 rounded-2xl font-bold text-sm text-apple-text-muted hover:bg-apple-gray transition-colors"
                >
                  Don't Allow
                </button>
                <button
                  onClick={onAllow}
                  className="py-4 rounded-2xl font-bold text-sm bg-apple-blue text-white shadow-lg shadow-apple-blue/20 hover:bg-blue-600 transition-colors"
                >
                  Allow
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
