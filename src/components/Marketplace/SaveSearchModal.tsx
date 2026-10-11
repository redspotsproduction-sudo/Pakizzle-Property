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
import { useProperties } from "../../context/PropertyContext";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface SaveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    searchQuery?: string;
    city?: string;
    propertyType?: string;
    society?: string;
    minPrice?: number | null;
    maxPrice?: number | null;
    minArea?: number | null;
    maxArea?: number | null;
    areaUnit?: string;
    beds?: number | null;
    baths?: number | null;
    furnishedStatus?: string;
    purpose?: string;
    make?: string;
    model?: string;
    variant?: string;
    bodyType?: string[];
    fuelType?: string[];
    condition?: string[];
    cities?: string[];
    minYear?: number | null;
    maxYear?: number | null;
    minMileage?: number | null;
    maxMileage?: number | null;
  };
}

export default function SaveSearchModal({ isOpen, onClose, filters }: SaveSearchModalProps) {
  const { user } = useAuth();
  const { properties } = useProperties();
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
      if (filters.propertyType || filters.make) parts.push(filters.propertyType || filters.make || "");
      if (filters.society) parts.push(filters.society);
      if (filters.city) parts.push(filters.city);
      if (filters.cities && filters.cities.length > 0) parts.push(filters.cities.join("/"));
      if (filters.searchQuery) parts.push(`"${filters.searchQuery}"`);
      
      if (filters.beds) parts.push(`${filters.beds} Beds`);
      if (filters.areaUnit && (filters.minArea || filters.maxArea)) {
        parts.push(`${filters.maxArea || filters.minArea} ${filters.areaUnit}`);
      }

      if (filters.maxPrice) {
        parts.push(`< PKR ${(filters.maxPrice / 100000).toFixed(0)} Lakh`);
      }

      const generatedName = parts.length > 0 ? `${parts.join(" ")} Watcher` : "All Properties Watcher";
      setWatcherName(generatedName);

      // Compute matching active listings
      const count = properties.filter(p => {
        return savedSearchService.doesVehicleMatch(p as any, {
          searchQuery: filters.searchQuery,
          city: filters.city,
          propertyType: filters.propertyType,
          society: filters.society,
          minPrice: filters.minPrice ?? undefined,
          maxPrice: filters.maxPrice ?? undefined,
          beds: filters.beds ?? undefined,
          baths: filters.baths ?? undefined,
          make: filters.make,
          model: filters.model,
          variant: filters.variant,
          minYear: filters.minYear ?? undefined,
          maxYear: filters.maxYear ?? undefined,
          minMileage: filters.minMileage ?? undefined,
          maxMileage: filters.maxMileage ?? undefined,
          bodyType: filters.bodyType,
          fuelType: filters.fuelType,
          cities: filters.cities || (filters.city ? [filters.city] : undefined),
          condition: filters.condition
        } as any);
      }).length;
      setMatchingCount(count);
    }
  }, [isOpen, filters, properties]);

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
            className="relative my-auto w-full max-w-md bg-white dark:bg-[#121214] border border-apple-border dark:border-white/10/85 rounded-[28px] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden z-[10000]"
          >
            {/* Apple-style gradient bar accent at the top */}
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-apple-blue via-indigo-500 to-purple-600" />

            {/* Absolute close button */}
            <div className="absolute top-4 right-4 z-[10010]">
              <motion.button 
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-apple-gray dark:bg-white/5/60 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-zinc-700/80 transition-colors border border-apple-border/50 dark:border-white/10/50 text-apple-text-muted dark:text-apple-text-muted hover:text-apple-text dark:hover:text-apple-text cursor-pointer"
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
                  <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-0.5 leading-relaxed">Get notified automatically when a matching property is listed.</p>
                </div>
              </div>

              {/* Filter Summary Matrix */}
              <div className="mb-6 p-4 rounded-2xl bg-apple-gray dark:bg-white/5/50 border border-apple-border dark:border-white/10">
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
                      <div className="flex items-center gap-1 text-[11px] bg-white dark:bg-white/5 text-neutral-700 dark:text-neutral-300 px-2.5 py-1 rounded-lg border border-apple-border dark:border-white/10/50 font-medium">
                        <Tag className="w-3 h-3 text-neutral-400" /> "{filters.searchQuery}"
                      </div>
                    )}
                    {(filters.propertyType || filters.make) && (
                      <div className="flex items-center gap-1 text-[11px] bg-white dark:bg-white/5 text-neutral-700 dark:text-neutral-300 px-2.5 py-1 rounded-lg border border-apple-border dark:border-white/10/50 font-medium">
                        <span className="font-bold">{filters.propertyType || filters.make}</span>
                      </div>
                    )}
                    {filters.society && (
                      <div className="flex items-center gap-1 text-[11px] bg-white dark:bg-white/5 text-neutral-700 dark:text-neutral-300 px-2.5 py-1 rounded-lg border border-apple-border dark:border-white/10/50 font-medium">
                        <span className="font-medium text-neutral-500">Society:</span> <span className="font-bold">{filters.society}</span>
                      </div>
                    )}
                    {filters.city && (
                      <div className="flex items-center gap-1 text-[11px] bg-white dark:bg-white/5 text-neutral-700 dark:text-neutral-300 px-2.5 py-1 rounded-lg border border-apple-border dark:border-white/10/50 font-medium">
                        <MapPin className="w-3 h-3 text-apple-blue" /> <span>{filters.city}</span>
                      </div>
                    )}
                    {filters.cities && filters.cities.map(c => (
                      <div key={`city-${c}`} className="flex items-center gap-1 text-[11px] bg-white dark:bg-white/5 text-neutral-700 dark:text-neutral-300 px-2.5 py-1 rounded-lg border border-apple-border dark:border-white/10/50 font-medium">
                        <MapPin className="w-3 h-3 text-apple-blue" /> <span>{c}</span>
                      </div>
                    ))}
                    {(filters.minPrice || filters.maxPrice) && (
                      <div className="flex items-center gap-1 text-[11px] bg-white dark:bg-white/5 text-neutral-700 dark:text-neutral-300 px-2.5 py-1 rounded-lg border border-apple-border dark:border-white/10/50 font-medium">
                        <DollarSign className="w-2.5 h-2.5 text-apple-green" />
                        <span>
                          {filters.minPrice ? `PKR ${(filters.minPrice/100000).toFixed(0)}L` : "PKR 0"}-
                          {filters.maxPrice ? `PKR ${(filters.maxPrice/100000).toFixed(0)}L` : "Any"}
                        </span>
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
                    placeholder="e.g. 10-Marla DHA Lahore Watcher"
                    className="w-full text-sm font-semibold bg-apple-gray dark:bg-white/5 border border-apple-border dark:border-white/10 focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all outline-none rounded-xl px-4 py-2.5 text-neutral-900 dark:text-white"
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
                          : "border-apple-border dark:border-white/10 hover:bg-apple-gray dark:hover:bg-zinc-850/50"
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
                          : "border-apple-border dark:border-white/10 hover:bg-apple-gray dark:hover:bg-zinc-850/50"
                      }`}
                    >
                      <Clock className={`w-4 h-4 mb-1 ${frequency === "daily" ? "text-apple-blue" : "text-neutral-400"}`} />
                      <span className="text-[13px] font-bold text-neutral-900 dark:text-white">Daily Digest</span>
                      <span className="text-[9px] text-neutral-400 mt-0.5">Summary at 09:00 AM</span>
                    </button>
                  </div>
                </div>

                {/* Alert Notification Channels */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 ml-0.5 block">Alert Channels</label>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-apple-gray dark:bg-white/5/50 border border-apple-border dark:border-white/10 cursor-pointer hover:bg-apple-gray dark:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-indigo-550/10 flex items-center justify-center text-apple-blue">
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

                    <label className="flex items-center justify-between p-3 rounded-xl bg-apple-gray dark:bg-white/5/50 border border-apple-border dark:border-white/10 cursor-pointer hover:bg-apple-gray dark:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-emerald-550/10 flex items-center justify-center text-apple-green">
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
              <div className="mt-8 pt-5 border-t border-apple-border dark:border-white/10/80 flex flex-col gap-3">
                {!user ? (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-apple-orange/10 border border-apple-orange/30/20 text-apple-orange dark:text-apple-orange text-xs font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-apple-orange" />
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
                    className="flex-1 py-2.5 rounded-xl border-apple-border dark:border-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 hover:bg-apple-gray text-xs font-bold bg-transparent"
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
