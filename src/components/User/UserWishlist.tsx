import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Search, ShoppingBag, ArrowRight, Trash2, Zap, Building2, Home } from "lucide-react";
import { useProperties } from "../../context/PropertyContext";
import { useWishlist } from "../../context/WishlistContext";
import { formatPrice, cn } from "../../lib/utils";
import { Link } from "react-router-dom";

export default function UserWishlist() {
  const { properties: vehicles } = useProperties();
  const { wishlist, removeFromWishlist } = useWishlist();

  const wishlistedItems = wishlist.map(id => vehicles.find(v => v.id === id)).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <Heart className="w-3.5 h-3.5 animate-pulse" />
            Saved Collection & Watchlist
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-tight">
            Neural Collection
          </h1>
          <p className="text-xs text-[#86868B] dark:text-[#86868B] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            Curated high-affinity assets monitored across the neural network.
          </p>
        </div>
        
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-[#161617] border border-black/[0.04] dark:border-white/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.01)] shrink-0 self-start md:self-end">
           <div className="w-8 h-8 bg-apple-red/5 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-apple-red fill-apple-red" />
           </div>
           <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#86868B]">Selection Count</p>
              <p className="text-xs font-semibold text-[#1D1D1F] dark:text-white font-mono">{wishlist.length} Assets</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {wishlistedItems.length > 0 ? (
            wishlistedItems.map((v, i) => (
              <motion.div
                key={v!.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.02 }}
                className="group relative bg-white dark:bg-[#161617] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden hover:shadow-[0_12px_30px_rgba(0,0,0,0.02)] transition-all duration-300"
              >
                {/* Remove Button */}
                <button 
                  onClick={() => removeFromWishlist(v!.id)}
                  className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-apple-red hover:border-apple-red"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <Link to={`/property/${v!.id}`} className="block">
                  <div className="aspect-[4/3] overflow-hidden relative bg-[#1C1C1E] border-b border-black/[0.04] dark:border-white/[0.04] flex items-center justify-center">
                    {v!.images?.[0] ? (
                      <img 
                        src={v!.images[0]} 
                        alt={v!.model} 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Building2 className="w-10 h-10 text-white/30" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    
                    <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-end justify-between">
                       <div className="min-w-0 pr-2">
                         <div className="text-[8px] font-bold text-white/60 uppercase tracking-wider mb-0.5">{v!.year} Built</div>
                         <h3 className="text-sm font-semibold text-white tracking-tight leading-none group-hover:text-apple-red transition-colors truncate">{v!.make} {v!.model}</h3>
                       </div>
                       <Zap className="w-4 h-4 text-apple-blue shrink-0" />
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-base font-bold text-apple-blue font-mono">{formatPrice(v!.price)}</span>
                       <div className="px-2 py-0.5 bg-[#F5F5F7] dark:bg-white/10 rounded-full text-[9px] font-bold uppercase tracking-wider text-[#86868B] dark:text-white/60">
                         {v!.status?.replace('_', ' ') || 'Live'}
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pb-3.5 border-b border-black/[0.04] dark:border-white/[0.04]">
                       <div className="space-y-0.5">
                          <p className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Area</p>
                          <p className="text-xs font-semibold text-[#1D1D1F] dark:text-white font-mono">{v!.mileage.toLocaleString()} Sq.Ft.</p>
                       </div>
                       <div className="space-y-0.5">
                          <p className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Location</p>
                          <p className="text-xs font-semibold text-[#1D1D1F] dark:text-white truncate">{v!.location}</p>
                       </div>
                    </div>

                    <div className="flex items-center justify-between text-apple-blue font-bold uppercase tracking-wider text-[10px]">
                       <span>View Property Details</span>
                       <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center bg-[#F5F5F7]/30 dark:bg-white/[0.005] rounded-2xl border border-dashed border-black/[0.06] dark:border-white/[0.06]">
               <div className="w-10 h-10 bg-apple-red/5 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-5 h-5 text-apple-red/40 animate-pulse" />
               </div>
               <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white mb-1">Affinity Node Empty</h3>
               <p className="text-xs text-[#86868B] max-w-xs mx-auto mb-4 leading-relaxed font-normal">
                 No assets have been bookmarked for neural tracking. Start exploring the marketplace to build your collection.
               </p>
               <Link to="/marketplace" className="inline-flex items-center gap-1.5 px-4 py-2 bg-apple-blue hover:bg-blue-600 text-white rounded-full text-xs font-semibold transition-all shadow-sm border-none">
                 <Search className="w-3.5 h-3.5" />
                 Initialize Scan
               </Link>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Recommended for you curated from wishlist */}
      {wishlistedItems.length > 0 && (
         <section className="pt-6">
            <div className="rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 p-5 flex flex-col md:flex-row items-center gap-4 relative overflow-hidden">
               <div className="w-10 h-10 bg-apple-blue rounded-xl flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-white" />
               </div>
               <div className="flex-1 text-center md:text-left min-w-0">
                  <h3 className="text-xs font-semibold text-[#1D1D1F] dark:text-white mb-0.5">Expansion Protocol Identified</h3>
                  <p className="text-[11px] text-[#86868B] font-normal leading-relaxed">
                    Based on your saved affinity for <span className="text-apple-blue font-bold">{wishlistedItems[0]?.make}</span>, we've identified 4 new high-velocity listings that match your acquisition strategy.
                  </p>
               </div>
               <Link to="/marketplace" className="px-3.5 py-1.5 bg-apple-blue hover:bg-blue-600 text-white rounded-full text-xs font-semibold transition-all border-none shadow-sm shrink-0">
                  Show Matching Units
               </Link>
            </div>
         </section>
      )}
    </div>
  );
}
