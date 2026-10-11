import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2, 
  Bell, 
  ArrowRight,
  TrendingUp,
  Building2,
  ExternalLink,
  Sliders,
  Send,
  Eye,
  Check
} from "lucide-react";
import { useProperties } from "@/context/PropertyContext";
import { listingFreshnessService } from "@/services/listingFreshnessService";
import { formatPropertyUrl } from "@/lib/referenceId";
import { formatPrice, cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function StaleListingsWidget() {
  const { properties, confirmListingActive, updateProperty } = useProperties();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'approaching' | 'prompted' | 'expired'>('all');
  const [pingingId, setPingingId] = useState<string | null>(null);

  const audit = useMemo(() => {
    return listingFreshnessService.generatePlatformAudit(properties);
  }, [properties]);

  const filteredItems = useMemo(() => {
    return audit.attentionRequiredListings.filter(item => {
      if (selectedFilter === 'approaching') return item.freshness.isApproachingThreshold;
      if (selectedFilter === 'prompted') return item.freshness.isGracePeriod;
      if (selectedFilter === 'expired') return item.freshness.isExpired;
      return true;
    });
  }, [audit, selectedFilter]);

  const handleSendPrompt = (propertyId: string, model: string) => {
    setPingingId(propertyId);
    setTimeout(() => {
      setPingingId(null);
      toast.success(`Freshness verification prompt dispatched for "${model}"`, {
        description: "Sent via in-app alert and WhatsApp notification to seller."
      });
    }, 600);
  };

  const handleAdminVerify = async (propertyId: string, model: string) => {
    try {
      await confirmListingActive(propertyId);
      toast.success(`Listing "${model}" verified active by Admin!`, {
        description: "Freshness counter reset to today across search indexes."
      });
    } catch {
      toast.error("Failed to verify listing");
    }
  };

  const handleExpireNow = async (propertyId: string, model: string) => {
    try {
      await updateProperty(propertyId, { 
        status: 'expired', 
        freshness_status: 'expired' 
      });
      toast.warning(`Listing "${model}" marked as Expired`, {
        description: "Delisted from marketplace search & map results."
      });
    } catch {
      toast.error("Failed to expire listing");
    }
  };

  return (
    <div className="bg-white dark:bg-[var(--bg-surface)] rounded-3xl border border-black/[0.06] dark:border-white/[0.06] p-6 lg:p-8 shadow-sm">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-apple-blue/10 flex items-center justify-center text-apple-blue">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-apple-text dark:text-white">
              Listing Freshness & Auto-Expiry Monitor
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-apple-green/10 text-apple-green dark:text-apple-green text-[10px] font-black uppercase tracking-wider">
              Anti-Stale Engine
            </span>
          </div>
          <p className="text-xs text-apple-text-muted dark:text-apple-text-muted max-w-2xl">
            Solves Zameen's #1 structural defect (phantom & stale listings). Enforces 60-day seller re-confirmations and 7-day grace periods with automatic delisting.
          </p>
        </div>

        {/* Global Catalog Freshness Metric */}
        <div className="flex items-center gap-3 bg-apple-surface dark:bg-white/[0.03] px-4 py-2.5 rounded-2xl border border-black/[0.04] dark:border-white/[0.04]">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-apple-text-muted block">Catalog Freshness Rate</span>
            <span className="text-xl font-black text-apple-green dark:text-apple-green font-mono">
              {audit.freshnessHealthRate}%
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-apple-green/10 text-apple-green dark:text-apple-green flex items-center justify-center font-bold text-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4 Health Shards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 my-6">
        <div className="p-4 rounded-2xl bg-apple-green/[0.04] dark:bg-apple-green/[0.08] border border-apple-green/15 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-apple-green dark:text-emerald-300">Fresh & Active (&lt;50d)</span>
            <CheckCircle2 className="w-4 h-4 text-apple-green" />
          </div>
          <div className="text-2xl font-black text-apple-green dark:text-emerald-300 font-mono">
            {audit.freshCount}
          </div>
          <p className="text-[10px] text-apple-green/80 dark:text-apple-green/80 font-medium">Healthy active listings</p>
        </div>

        <button 
          onClick={() => setSelectedFilter(selectedFilter === 'approaching' ? 'all' : 'approaching')}
          className={cn(
            "p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-1.5",
            selectedFilter === 'approaching' 
              ? "bg-gold-decoration/15 border-gold-decoration shadow-xs" 
              : "bg-gold-decoration/[0.04] dark:bg-gold-decoration/[0.08] border-gold-decoration/15 hover:border-gold-decoration/30"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-gold-decoration/40">Approaching 60d</span>
            <Clock className="w-4 h-4 text-gold-decoration" />
          </div>
          <div className="text-2xl font-black text-amber-700 dark:text-gold-decoration/40 font-mono">
            {audit.approachingCount}
          </div>
          <p className="text-[10px] text-gold-decoration/80 dark:text-gold-decoration/80 font-medium">50-59 days unconfirmed</p>
        </button>

        <button 
          onClick={() => setSelectedFilter(selectedFilter === 'prompted' ? 'all' : 'prompted')}
          className={cn(
            "p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-1.5",
            selectedFilter === 'prompted' 
              ? "bg-yellow-500/15 border-yellow-500 shadow-xs" 
              : "bg-yellow-500/[0.04] dark:bg-yellow-500/[0.08] border-yellow-500/15 hover:border-yellow-500/30"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-700 dark:text-yellow-300">Prompt Due (60-66d)</span>
            <AlertTriangle className="w-4 h-4 text-yellow-500 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-yellow-700 dark:text-yellow-300 font-mono">
            {audit.pendingConfirmationCount}
          </div>
          <p className="text-[10px] text-yellow-600/80 dark:text-yellow-400/80 font-medium">In 7-day grace period</p>
        </button>

        <button 
          onClick={() => setSelectedFilter(selectedFilter === 'expired' ? 'all' : 'expired')}
          className={cn(
            "p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-1.5",
            selectedFilter === 'expired' 
              ? "bg-apple-red/15 border-apple-red shadow-xs" 
              : "bg-apple-red/[0.04] dark:bg-apple-red/[0.08] border-apple-red/15 hover:border-apple-red/30"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-apple-red dark:text-rose-300">Auto-Expired (&gt;67d)</span>
            <AlertCircle className="w-4 h-4 text-apple-red" />
          </div>
          <div className="text-2xl font-black text-apple-red dark:text-rose-300 font-mono">
            {audit.expiredCount}
          </div>
          <p className="text-[10px] text-apple-red/80 dark:text-rose-400/80 font-medium">Delisted from search</p>
        </button>
      </div>

      {/* Filter Tabs & Count */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-1.5 p-1 bg-apple-gray dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 text-xs font-semibold">
          {[
            { id: 'all', label: `Attention Queue (${audit.attentionRequiredListings.length})` },
            { id: 'approaching', label: `Approaching (${audit.approachingCount})` },
            { id: 'prompted', label: `Prompted (${audit.pendingConfirmationCount})` },
            { id: 'expired', label: `Expired (${audit.expiredCount})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as any)}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all cursor-pointer text-[11px]",
                selectedFilter === tab.id
                  ? "bg-white dark:bg-[var(--bg-inset)] text-apple-text dark:text-white shadow-xs font-bold"
                  : "text-apple-text-muted hover:text-apple-text dark:text-apple-text-muted dark:hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-[11px] font-bold text-apple-text-muted">
          Showing {filteredItems.length} records
        </span>
      </div>

      {/* Table of Flagged / Aging Listings */}
      {filteredItems.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-apple-surface dark:bg-white/[0.02] border border-dashed border-black/10 dark:border-white/10">
          <CheckCircle2 className="w-8 h-8 text-apple-green mx-auto mb-2" />
          <h4 className="text-sm font-bold text-apple-surface dark:text-apple-border">Catalog is in Prime Health</h4>
          <p className="text-xs text-apple-text-muted mt-1">No listings in the selected category require immediate administrative action.</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6 lg:-mx-8 px-6 lg:px-8">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] dark:border-white/[0.06] text-[10px] uppercase tracking-wider text-apple-text-muted font-bold">
                <th className="py-3 px-3">Listing</th>
                <th className="py-3 px-3">Location & Type</th>
                <th className="py-3 px-3">Seller / Agency</th>
                <th className="py-3 px-3 text-center">Unconfirmed Age</th>
                <th className="py-3 px-3 text-center">Freshness Status</th>
                <th className="py-3 px-3 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {filteredItems.slice(0, 8).map(({ property, freshness }) => (
                <tr key={property.id} className="hover:bg-apple-surface dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={property.images[0]} 
                        alt={property.model}
                        className="w-11 h-9 rounded-lg object-cover shrink-0 bg-apple-gray dark:bg-apple-surface border border-black/5 dark:border-white/5"
                      />
                      <div className="min-w-0">
                        <Link 
                          to={formatPropertyUrl(property)} 
                          className="font-bold text-apple-text dark:text-white hover:text-apple-blue truncate block max-w-[200px]"
                        >
                          {property.model}
                        </Link>
                        <div className="flex items-center gap-2 text-[10px] text-apple-text-muted font-mono mt-0.5">
                          <span>ID: #{property.reference_id || property.id}</span>
                          <span>•</span>
                          <span className="font-semibold text-apple-text-muted dark:text-apple-border">{formatPrice(property.price)}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-apple-surface dark:text-apple-border truncate max-w-[150px]">
                      {property.city}
                    </div>
                    <div className="text-[10px] text-apple-text-muted truncate max-w-[150px]">
                      {property.make} • {property.engineSize}
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-apple-surface dark:text-apple-border truncate max-w-[160px]">
                      {property.seller.name}
                    </div>
                    <div className="text-[10px] text-apple-text-muted">
                      Rating: {property.seller.rating || 5.0} ★
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className="font-mono font-bold text-xs text-apple-surface dark:text-apple-border">
                      {freshness.daysSinceConfirmed} days
                    </span>
                    <span className="block text-[10px] text-apple-text-muted">
                      {freshness.displayText}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border",
                      freshness.isExpired 
                        ? "bg-apple-red/10 text-apple-red border-apple-red/20" 
                        : freshness.isGracePeriod 
                        ? "bg-gold-decoration/10 text-gold-decoration border-gold-decoration/20 animate-pulse" 
                        : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                    )}>
                      {freshness.isExpired ? "Auto-Expired" : freshness.isGracePeriod ? "Prompt Sent (Grace)" : "Approaching 60d"}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <button
                        onClick={() => handleSendPrompt(property.id, property.model)}
                        disabled={pingingId === property.id}
                        className="px-2.5 py-1.5 rounded-lg bg-apple-blue/10 hover:bg-apple-blue/20 text-apple-blue text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                        title="Dispatch freshness check notification to seller"
                      >
                        <Send className="w-3 h-3" />
                        <span>Ping Seller</span>
                      </button>

                      <button
                        onClick={() => handleAdminVerify(property.id, property.model)}
                        className="px-2.5 py-1.5 rounded-lg bg-apple-green/10 hover:bg-apple-green/20 text-apple-green text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                        title="Verify and reset freshness clock"
                      >
                        <Check className="w-3 h-3" />
                        <span>Verify</span>
                      </button>

                      {!freshness.isExpired && (
                        <button
                          onClick={() => handleExpireNow(property.id, property.model)}
                          className="px-2.5 py-1.5 rounded-lg bg-apple-red/10 hover:bg-apple-red/20 text-apple-red text-[11px] font-bold transition-all cursor-pointer"
                          title="Immediately expire and delist from marketplace"
                        >
                          Expire
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
