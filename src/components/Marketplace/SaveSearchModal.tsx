import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Bell, 
  Mail, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle,
  Eye, 
  Clock, 
  Sparkles,
  Zap,
  DollarSign,
  Tag,
  MapPin,
  ListFilter
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { savedSearchService } from "../../services/savedSearchService";
import { useVehicles } from "../../context/VehicleContext";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface SaveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    searchQuery: string;
    make: string;
    model: string;
    variant: string;
    bodyType: string[];
    fuelType: string[];
    condition: string[];
    cities: string[];
    minPrice: number | null;
    maxPrice: number | null;
    minYear: number | null;
    maxYear: number | null;
    minMileage: number | null;
    maxMileage: number | null;
  };
}

export default function SaveSearchModal({ isOpen, onClose, filters }: SaveSearchModalProps) {
  const { user } = useAuth();
  const { vehicles } = useVehicles();
  const [watcherName, setWatcherName] = useState("");
  const [frequency, setFrequency] = useState<"instant" | "daily">("instant");
  const [alertMethods, setAlertMethods] = useState({
    inApp: true,
    email: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [matchingCount, setMatchingCount] = useState(0);

  // Auto-generate a beautiful descriptive name
  useEffect(() => {
    if (isOpen) {
      const parts: string[] = [];
      if (filters.condition && filters.condition.length > 0) {
        parts.push(filters.condition.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join("/"));
      }
      if (filters.make) parts.push(filters.make);
      if (filters.model) parts.push(filters.model);
      if (filters.searchQuery) parts.push(`"${filters.searchQuery}"`);
      
      if (filters.bodyType && filters.bodyType.length > 0) {
        parts.push(filters.bodyType.map(b => b.toUpperCase()).join("/"));
      }

      if (filters.maxPrice) {
        parts.push(`< $${(filters.maxPrice / 1000).toFixed(0)}k`);
      }

      const generatedName = parts.length > 0 ? `${parts.join(" ")} Watcher` : "All Vehicles Watcher";
      setWatcherName(generatedName);

      // Compute matching active listings
      const count = vehicles.filter(v => {
        return savedSearchService.doesVehicleMatch(v, {
          searchQuery: filters.searchQuery,
          make: filters.make,
          model: filters.model,
          variant: filters.variant,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          minYear: filters.minYear,
          maxYear: filters.maxYear,
          minMileage: filters.minMileage,
          maxMileage: filters.maxMileage,
          bodyType: filters.bodyType,
          fuelType: filters.fuelType,
          cities: filters.cities,
          condition: filters.condition
        });
      }).length;
      setMatchingCount(count);
    }
  }, [isOpen, filters, vehicles]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!user) {
      toast.error("Auth Signature Required", {
        description: "Please sign in to configure AI Search Watchers and receive real-time push signals."
      });
      return;
    }

    if (!watcherName.trim()) {
      toast.error("Invalid Configuration", {
        description: "Please enter a distinctive name for this search watcher."
      });
      return;
    }

    setIsSaving(true);
    try {
      await savedSearchService.createSavedSearch(user.uid, {
        name: watcherName,
        filters: {
          searchQuery: filters.searchQuery || undefined,
          make: filters.make || undefined,
          model: filters.model || undefined,
          variant: filters.variant || undefined,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          minYear: filters.minYear,
          maxYear: filters.maxYear,
          minMileage: filters.minMileage,
          maxMileage: filters.maxMileage,
          bodyType: filters.bodyType.length > 0 ? filters.bodyType : undefined,
          fuelType: filters.fuelType.length > 0 ? filters.fuelType : undefined,
          cities: filters.cities.length > 0 ? filters.cities : undefined,
          condition: filters.condition.length > 0 ? filters.condition : undefined,
        },
        frequency,
        alertMethods
      });

      toast.success("Watcher Matrix Deployed 🚀", {
        description: `"${watcherName}" is now active. Real-time listing scans running on the background ledger.`
      });
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("System Error", {
        description: "Failed to save search parameters. Please try again."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasFilters = 
    filters.searchQuery || 
    filters.make || 
    filters.model || 
    filters.bodyType.length > 0 || 
    filters.fuelType.length > 0 || 
    filters.condition.length > 0 || 
    filters.cities.length > 0 || 
    filters.maxPrice || 
    filters.minPrice ||
    filters.minYear ||
    filters.maxYear;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto flex items-start sm:items-center justify-center p-4">
          {/* Backdrop with elegant blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/65 backdrop-blur-md"
          />

          {/* Modal Card Structure */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", damping: 26, stiffness: 360 }}
            className="relative my-auto w-full max-w-md bg-white dark:bg-[#121214] border border-gray-100 dark:border-zinc-800/85 rounded-[28px] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden z-[10000]"
          >
            {/* Apple-style gradient bar accent at the top */}
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-apple-blue via-indigo-500 to-purple-600" />

            {/* Absolute close button */}
            <div className="absolute top-4 right-4 z-[10010]">
              <motion.button 
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800/60 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-zinc-700/80 transition-colors border border-gray-200/50 dark:border-zinc-700/50 text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Scrollable Layout Context */}
            <div className="p-6 sm:p-8 pt-8 overflow-y-auto flex-1 max-h-[calc(100vh-4rem)] custom-scrollbar">
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 bg-apple-blue/10 rounded-xl flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-apple-blue animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-apple-text-muted uppercase tracking-wider block">Watcher Configuration</span>
                  <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white mt-0.5">Configure Watcher</h3>
                  <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-0.5 leading-relaxed">Get notified automatically when a matching vehicle is listed.</p>
                </div>
              </div>

              {/* Filter Summary Matrix */}
              <div className="mb-6 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <ListFilter className="w-3.5 h-3.5 text-apple-blue" /> Criteria
                  </span>
                  <span className="text-[10px] font-semibold text-apple-blue flex items-center gap-1 bg-apple-blue/10 px-2 py-0.5 rounded-full">
                    <Eye className="w-3 h-3" /> {matchingCount} Matches
                  </span>
                </div>

                {hasFilters ? (
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto custom-scrollbar pr-1">
                    {filters.searchQuery && (
                      <div className="flex items-center gap-1 text-[11px] bg-white dark:bg-zinc-800 text-neutral-700 dark:text-neutral-300 px-2.5 py-1 rounded-lg border border-gray-100 dark:border-zinc-700/50 font-medium">
                        <Tag className="w-3 h-3 text-neutral-400" /> "{filters.searchQuery}"
                      </div>
                    )}
                    {filters.make && (
                      <div className="flex items-center gap-1 text-[11px] bg-white dark:bg-zinc-800 text-neutral-700 dark:text-neutral-300 px-2.5 py-1 rounded-lg border border-gray-100 dark:border-zinc-700/50 font-medium">
                        <span className="font-bold">{filters.make}</span>
                      </div>
                    )}
                    {filters.model && (
                      <div className="flex items-center gap-1 text-[11px] bg-white dark:bg-zinc-800 text-neutral-700 dark:text-neutral-300 px-2.5 py-1 rounded-lg border border-gray-100 dark:border-zinc-700/50 font-medium">
                        <span className="font-medium text-neutral-500">Model:</span> <span className="font-bold">{filters.model}</span>
                      </div>
                    )}
                    {filters.bodyType.map(b => (
                      <div key={`body-${b}`} className="flex items-center gap-1 text-[11px] bg-white dark:bg-zinc-800 text-neutral-700 dark:text-neutral-300 px-2.5 py-1 rounded-lg border border-gray-100 dark:border-zinc-700/50 font-medium">
                        <span className="font-bold uppercase text-[9px]">{b}</span>
                      </div>
                    ))}
                    {filters.fuelType.map(f => (
                      <div key={`fuel-${f}`} className="flex items-center gap-1 text-[11px] bg-white dark:bg-zinc-800 text-neutral-700 dark:text-neutral-300 px-2.5 py-1 rounded-lg border border-gray-100 dark:border-zinc-700/50 font-medium">
                        <span className="font-bold capitalize">{f}</span>
                      </div>
                    ))}
                    {filters.condition.map(c => (
                      <div key={`cond-${c}`} className="flex items-center gap-1 text-[11px] bg-white dark:bg-zinc-800 text-neutral-700 dark:text-neutral-300 px-2.5 py-1 rounded-lg border border-gray-100 dark:border-zinc-700/50 font-medium font-mono">
                        <span className="capitalize">{c}</span>
                      </div>
                    ))}
                    {filters.cities.map(c => (
                      <div key={`city-${c}`} className="flex items-center gap-1 text-[11px] bg-white dark:bg-zinc-800 text-neutral-700 dark:text-neutral-300 px-2.5 py-1 rounded-lg border border-gray-100 dark:border-zinc-700/50 font-medium">
                        <MapPin className="w-3 h-3 text-apple-blue" /> <span>{c}</span>
                      </div>
                    ))}
                    {(filters.minPrice || filters.maxPrice) && (
                      <div className="flex items-center gap-1 text-[11px] bg-white dark:bg-zinc-800 text-neutral-700 dark:text-neutral-300 px-2.5 py-1 rounded-lg border border-gray-100 dark:border-zinc-700/50 font-medium">
                        <DollarSign className="w-2.5 h-2.5 text-emerald-500" />
                        <span>
                          {filters.minPrice ? `$${(filters.minPrice/1000).toFixed(0)}k` : "$0"}-
                          {filters.maxPrice ? `$${(filters.maxPrice/1000).toFixed(0)}k` : "Any"}
                        </span>
                      </div>
                    )}
                    {(filters.minYear || filters.maxYear) && (
                      <div className="flex items-center gap-1 text-[11px] bg-white dark:bg-zinc-800 text-neutral-700 dark:text-neutral-300 px-2.5 py-1 rounded-lg border border-gray-100 dark:border-zinc-700/50 font-medium">
                        <span>{filters.minYear || "Any"}-{filters.maxYear || "Any"}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-neutral-400 italic">No filters. Watching entire inventory matrix.</p>
                )}
              </div>

              {/* Configurations Form */}
              <div className="space-y-5">
                {/* Watcher Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 ml-0.5">Watcher Name</label>
                  <input 
                    type="text"
                    required
                    value={watcherName}
                    onChange={(e) => setWatcherName(e.target.value)}
                    placeholder="e.g. Budget SUVs Watcher"
                    className="w-full text-sm font-semibold bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all outline-none rounded-xl px-4 py-2.5 text-neutral-900 dark:text-white"
                  />
                </div>

                {/* Trigger Frequency */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 ml-0.5 block">Alert Interval</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFrequency("instant")}
                      className={`flex flex-col items-center p-3.5 rounded-2xl border text-center transition-all duration-300 ${
                        frequency === "instant" 
                          ? "border-apple-blue bg-apple-blue/5 dark:bg-apple-blue/10 text-apple-blue" 
                          : "border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-850/50"
                      }`}
                    >
                      <Zap className={`w-4 h-4 mb-1 ${frequency === "instant" ? "text-apple-blue" : "text-neutral-400"}`} />
                      <span className="text-[13px] font-bold text-neutral-900 dark:text-white">Real-time</span>
                      <span className="text-[9px] text-neutral-400 mt-0.5">Instant alerts</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFrequency("daily")}
                      className={`flex flex-col items-center p-3.5 rounded-2xl border text-center transition-all duration-300 ${
                        frequency === "daily" 
                          ? "border-apple-blue bg-apple-blue/5 dark:bg-apple-blue/10 text-apple-blue" 
                          : "border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-850/50"
                      }`}
                    >
                      <Clock className={`w-4 h-4 mb-1 ${frequency === "daily" ? "text-apple-blue" : "text-neutral-400"}`} />
                      <span className="text-[13px] font-bold text-neutral-900 dark:text-white">Daily Digest</span>
                      <span className="text-[9px] text-neutral-400 mt-0.5">Summary at 09:00 AM</span>
                    </button>
                  </div>
                </div>

                {/* Alert Transmission Methods */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 ml-0.5 block">Alert Channels</label>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-indigo-550/10 flex items-center justify-center text-indigo-500">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-950 dark:text-white">In-App Alerts</p>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Receive alerts inside Pakizzle app</p>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={alertMethods.inApp}
                        onChange={(e) => setAlertMethods(prev => ({ ...prev, inApp: e.target.checked }))}
                        className="w-4.5 h-4.5 rounded text-apple-blue focus:ring-0 cursor-pointer accent-apple-blue"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-emerald-550/10 flex items-center justify-center text-emerald-500">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-950 dark:text-white">Email Dispatch</p>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Receive summary emails</p>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={alertMethods.email}
                        onChange={(e) => setAlertMethods(prev => ({ ...prev, email: e.target.checked }))}
                        className="w-4.5 h-4.5 rounded text-apple-blue focus:ring-0 cursor-pointer accent-apple-blue"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="mt-8 pt-5 border-t border-gray-100 dark:border-zinc-800/80 flex flex-col gap-3">
                {!user ? (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                    <span>Identity missing. Connect session on top header.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-apple-blue" />
                    <span>Configured for profile: <span className="text-neutral-700 dark:text-neutral-300 font-bold">{user.email?.split("@")[0]}</span></span>
                  </div>
                )}

                <div className="flex gap-2.5 mt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border-gray-200 dark:border-zinc-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 hover:bg-gray-50 text-xs font-bold bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving || !user}
                    className="flex-1 py-2.5 rounded-xl bg-apple-blue hover:bg-apple-blue-hover text-white text-xs font-bold shadow-md shadow-apple-blue/15"
                  >
                    {isSaving ? "Activating..." : "Activate Watcher"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
