import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Bell, 
  Trash2, 
  Clock, 
  Zap, 
  ExternalLink, 
  Play, 
  CheckCircle,
  Sparkles,
  RefreshCw,
  Mail,
  Smartphone,
  Shield,
  Layers,
  ArrowRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useVehicles } from "../../context/VehicleContext";
import { savedSearchService } from "../../services/savedSearchService";
import { SavedSearch } from "../../types";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function UserWatchers() {
  const { user } = useAuth();
  const { vehicles } = useVehicles();
  const [watchers, setWatchers] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setWatchers([]);
      setLoading(false);
      return;
    }

    const unsubscribe = savedSearchService.subscribeToSavedSearches(user.uid, (data) => {
      setWatchers(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id: string, name: string) => {
    try {
      await savedSearchService.deleteSavedSearch(id);
      toast.success("Watcher Decommissioned", {
        description: `"${name}" search watcher has been safely deleted from the neural link.`
      });
    } catch (error) {
      console.error(error);
      toast.error("Decommission Failed", {
        description: "Unable to delete search watcher at this time."
      });
    }
  };

  const handleToggleChannel = async (watcher: SavedSearch, type: 'inApp' | 'email') => {
    const updatedMethods = {
      ...watcher.alertMethods,
      [type]: !watcher.alertMethods[type]
    };

    try {
      await savedSearchService.updateSavedSearch(watcher.id, {
        alertMethods: updatedMethods
      });
      toast.success("Preferences Synchronized", {
        description: `Alert channels updated for "${watcher.name}".`
      });
    } catch (error) {
      console.error(error);
      toast.error("Sync Failure", {
        description: "Failed to update alert transmission channels."
      });
    }
  };

  const handleToggleFrequency = async (watcher: SavedSearch) => {
    const nextFreq = watcher.frequency === 'instant' ? 'daily' : 'instant';
    try {
      await savedSearchService.updateSavedSearch(watcher.id, {
        frequency: nextFreq
      });
      toast.success("Sensor Rate Modulated", {
        description: `Alert frequency for "${watcher.name}" set to ${nextFreq === 'instant' ? 'Real-time' : 'Daily Digest'}.`
      });
    } catch (error) {
      console.error(error);
      toast.error("Frequency Shift Failed", {
        description: "Failed to update notification cadence."
      });
    }
  };

  const handleSimulateMatch = async (watcher: SavedSearch) => {
    if (!user) return;
    
    const make = watcher.filters.make || "Tesla";
    const model = watcher.filters.model || "Model S";
    const price = watcher.filters.maxPrice ? watcher.filters.maxPrice - 2000 : 45000;
    const year = watcher.filters.minYear || 2024;
    
    const simulatedVehicle = {
      id: "sim-" + Math.random().toString(36).substring(4, 10),
      make,
      model,
      year,
      price,
      mileage: 12000,
      location: "Lahore, Pakistan",
      city: watcher.filters.cities?.[0] || "Lahore",
      images: ["https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800"],
      type: 'car' as const,
      condition: 'used' as const,
      transmission: 'automatic' as const,
      fuelType: 'electric' as const,
      engineSize: "Dual Motor",
      seller: {
        uid: "seller-test",
        name: "Zenith Automotive Dealer",
        isVerified: true,
        rating: 4.9
      },
      createdAt: new Date().toISOString()
    };

    toast.info("Simulating Engine Signal...", {
      description: `Injecting a mock matching listing for "${watcher.name}" into the active registry.`
    });

    setTimeout(async () => {
      await savedSearchService.checkAllSavedSearchesAgainstVehicle(simulatedVehicle);
    }, 1500);
  };

  const handleViewInMarketplace = (watcher: SavedSearch) => {
    const params = new URLSearchParams();
    if (watcher.filters.searchQuery) params.set("q", watcher.filters.searchQuery);
    if (watcher.filters.make) params.set("make", watcher.filters.make);
    if (watcher.filters.model) params.set("model", watcher.filters.model);
    if (watcher.filters.variant) params.set("variant", watcher.filters.variant);
    if (watcher.filters.minPrice) params.set("priceMin", watcher.filters.minPrice.toString());
    if (watcher.filters.maxPrice) params.set("priceMax", watcher.filters.maxPrice.toString());
    if (watcher.filters.minYear) params.set("minYear", watcher.filters.minYear.toString());
    if (watcher.filters.maxYear) params.set("maxYear", watcher.filters.maxYear.toString());
    if (watcher.filters.minMileage) params.set("minMileage", watcher.filters.minMileage.toString());
    if (watcher.filters.maxMileage) params.set("maxMileage", watcher.filters.maxMileage.toString());
    
    if (watcher.filters.cities && watcher.filters.cities.length > 0) {
      params.set("city", watcher.filters.cities[0]);
    }
    if (watcher.filters.bodyType && watcher.filters.bodyType.length > 0) {
      params.set("bodyType", watcher.filters.bodyType[0]);
    }
    
    navigate(`/marketplace?${params.toString()}`);
  };

  const handleScanInventory = async (watcher: SavedSearch) => {
    const matching = vehicles.filter(v => savedSearchService.doesVehicleMatch(v, watcher.filters));
    
    if (matching.length === 0) {
      toast.info("Active Scan Complete", {
        description: `Verified 0 matching records currently in the marketplace ledger.`
      });
      return;
    }

    toast.success("Scan Complete", {
      description: `Discovered ${matching.length} matching listings. Broadcasting match alert signals...`
    });

    for (const v of matching) {
      await savedSearchService.checkAllSavedSearchesAgainstVehicle(v);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <Bell className="w-3.5 h-3.5 animate-pulse" />
            Saved Search Sensors
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-tight">
            Search Watchers
          </h1>
          <p className="text-xs text-[#86868B] dark:text-[#86868B] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            Safeguard your ideal configurations. Watchers run continuous background scans for new vehicle listings.
          </p>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-[#161617] border border-black/[0.04] dark:border-white/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.01)] shrink-0 self-start md:self-end">
           <div className="w-8 h-8 bg-apple-blue/5 rounded-lg flex items-center justify-center">
              <Layers className="w-4 h-4 text-apple-blue" />
           </div>
           <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#86868B]">Active Watchers</p>
              <p className="text-xs font-semibold text-[#1D1D1F] dark:text-white font-mono">{watchers.length} Watchers</p>
           </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#161617] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl">
          <RefreshCw className="w-6 h-6 text-apple-blue animate-spin mb-3" />
          <p className="text-xs text-[#86868B] font-medium">Synchronizing watcher registry with the cloud matrix...</p>
        </div>
      ) : watchers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {watchers.map((watcher, idx) => {
              const matchedCount = vehicles.filter(v => savedSearchService.doesVehicleMatch(v, watcher.filters)).length;

              return (
                <motion.div
                  key={watcher.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, delay: idx * 0.02 }}
                  className="group relative bg-white dark:bg-[#161617] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.02)] transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white leading-tight truncate">
                          {watcher.name}
                        </h3>
                        <p className="text-[10px] text-[#86868B] font-normal mt-0.5">
                          Deployed {new Date(watcher.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          title="Force Watcher Manual Scan"
                          onClick={() => handleScanInventory(watcher)}
                          className="w-7 h-7 rounded-lg bg-[#F5F5F7] dark:bg-white/5 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white flex items-center justify-center border-none transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          title="Simulate Matching Listing (Trigger Toast)"
                          onClick={() => handleSimulateMatch(watcher)}
                          className="w-7 h-7 rounded-lg bg-apple-blue/5 dark:bg-apple-blue/10 hover:bg-apple-blue/20 text-apple-blue flex items-center justify-center border-none transition-colors"
                        >
                          <Play className="w-3 h-3" />
                        </button>

                        <button
                          title="Delete Search Sensor"
                          onClick={() => handleDelete(watcher.id, watcher.name)}
                          className="w-7 h-7 rounded-lg bg-[#F5F5F7] hover:bg-apple-red/10 dark:bg-white/5 text-[#86868B] hover:text-apple-red flex items-center justify-center border-none transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Active filters summary */}
                    <div className="my-4 p-3 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02] flex flex-wrap gap-1.5 max-h-20 overflow-y-auto custom-scrollbar">
                      {watcher.filters.searchQuery && (
                        <span className="text-[9px] font-bold bg-white dark:bg-zinc-800 text-[#1D1D1F] dark:text-white px-2 py-0.5 rounded border border-black/[0.04] dark:border-white/[0.04]">
                          Query: <span className="font-bold text-apple-blue">"{watcher.filters.searchQuery}"</span>
                        </span>
                      )}
                      {watcher.filters.make && (
                        <span className="text-[9px] font-bold bg-white dark:bg-zinc-800 text-[#1D1D1F] dark:text-white px-2 py-0.5 rounded border border-black/[0.04] dark:border-white/[0.04]">
                          Make: <span className="font-bold text-apple-blue">{watcher.filters.make}</span>
                        </span>
                      )}
                      {watcher.filters.model && (
                        <span className="text-[9px] font-bold bg-white dark:bg-zinc-800 text-[#1D1D1F] dark:text-white px-2 py-0.5 rounded border border-black/[0.04] dark:border-white/[0.04]">
                          Model: <span className="font-bold text-apple-blue">{watcher.filters.model}</span>
                        </span>
                      )}
                      {watcher.filters.variant && (
                        <span className="text-[9px] font-bold bg-white dark:bg-zinc-800 text-[#1D1D1F] dark:text-white px-2 py-0.5 rounded border border-black/[0.04] dark:border-white/[0.04]">
                          Variant: <span className="font-bold">{watcher.filters.variant}</span>
                        </span>
                      )}
                      {watcher.filters.bodyType?.map(bt => (
                        <span key={`widget-body-${bt}`} className="text-[9px] font-bold uppercase tracking-wider bg-white dark:bg-zinc-800 text-[#1D1D1F] dark:text-white px-2 py-0.5 rounded border border-black/[0.04] dark:border-white/[0.04]">
                          {bt}
                        </span>
                      ))}
                      {watcher.filters.fuelType?.map(ft => (
                        <span key={`widget-fuel-${ft}`} className="text-[9px] font-bold capitalize bg-white dark:bg-zinc-800 text-[#1D1D1F] dark:text-white px-2 py-0.5 rounded border border-black/[0.04] dark:border-white/[0.04]">
                          {ft}
                        </span>
                      ))}
                      {(watcher.filters.minPrice !== undefined || watcher.filters.maxPrice !== undefined) && (
                        <span className="text-[9px] font-bold bg-white dark:bg-zinc-800 text-[#1D1D1F] dark:text-white px-2 py-0.5 rounded border border-black/[0.04] dark:border-white/[0.04]">
                          Price: {watcher.filters.minPrice ? `Rs. ${(watcher.filters.minPrice / 100000).toFixed(0)}L` : "0"} - {watcher.filters.maxPrice ? `Rs. ${(watcher.filters.maxPrice / 100000).toFixed(0)}L` : "Any"}
                        </span>
                      )}
                      {watcher.filters.cities?.map(c => (
                        <span key={`widget-city-${c}`} className="text-[9px] font-bold bg-white dark:bg-zinc-800 text-[#1D1D1F] dark:text-white px-2 py-0.5 rounded border border-black/[0.04] dark:border-white/[0.04]">
                          📍 {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Sub-configurations and controls */}
                  <div className="space-y-3.5 pt-3.5 border-t border-black/[0.04] dark:border-white/[0.04]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#86868B] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-apple-blue" /> Alert Period
                      </span>
                      <button
                        onClick={() => handleToggleFrequency(watcher)}
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border-none transition-colors ${
                          watcher.frequency === 'instant' 
                            ? "bg-apple-blue/5 text-apple-blue" 
                            : "bg-amber-500/5 text-amber-500"
                        }`}
                      >
                        {watcher.frequency === 'instant' ? (
                          <>
                            <Zap className="w-2.5 h-2.5 animate-pulse" />
                            Real-time Matches
                          </>
                        ) : (
                          <>
                            <Clock className="w-2.5 h-2.5" />
                            Daily Digests
                          </>
                        )}
                      </button>
                    </div>

                    {/* Channels toggles */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleChannel(watcher, 'inApp')}
                        className={`flex-1 py-1.5 px-3 rounded-lg border text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors ${
                          watcher.alertMethods?.inApp 
                            ? "border-apple-blue/20 bg-apple-blue/5 text-apple-blue" 
                            : "border-black/[0.06] dark:border-white/[0.06] text-[#86868B] hover:bg-black/5 dark:hover:bg-white/5"
                        }`}
                      >
                        <Smartphone className="w-3 h-3" />
                        In-App Alert
                      </button>

                      <button
                        onClick={() => handleToggleChannel(watcher, 'email')}
                        className={`flex-1 py-1.5 px-3 rounded-lg border text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors ${
                          watcher.alertMethods?.email 
                            ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-500" 
                            : "border-black/[0.06] dark:border-white/[0.06] text-[#86868B] hover:bg-black/5 dark:hover:bg-white/5"
                        }`}
                      >
                        <Mail className="w-3 h-3" />
                        Email Dispatch
                      </button>
                    </div>

                    {/* Bottom row metrics / links */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-semibold text-[#86868B] flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-apple-blue" />
                        {matchedCount} Live matching units
                      </span>
                      
                      <button
                        onClick={() => handleViewInMarketplace(watcher)}
                        className="text-[10px] font-bold text-apple-blue hover:text-blue-600 flex items-center gap-1 border-none bg-transparent"
                      >
                        Launch Search Matrix
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-[#F5F5F7]/30 dark:bg-white/[0.005] rounded-2xl border border-dashed border-black/[0.06] dark:border-white/[0.06]">
          <div className="w-10 h-10 bg-apple-blue/10 rounded-xl flex items-center justify-center mb-4 text-apple-blue">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white mb-1">No active search watchers</h3>
          <p className="max-w-xs text-xs text-[#86868B] leading-relaxed font-normal mb-4">Deploy automated search watchers in the marketplace to listen for new vehicle lists in real-time.</p>
          <button
            onClick={() => navigate("/marketplace")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-apple-blue hover:bg-blue-600 text-white text-xs font-semibold shadow-sm border-none cursor-pointer"
          >
            Launch Marketplace
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
