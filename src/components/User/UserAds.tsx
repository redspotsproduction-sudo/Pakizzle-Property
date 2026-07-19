import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Car, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Power, 
  PowerOff, 
  ChevronRight, 
  ChevronLeft,
  Eye,
  MessageSquare,
  Heart,
  Clock,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  BarChart3,
  ExternalLink
} from "lucide-react";
import { useVehicles } from "../../context/VehicleContext";
import { useAuth } from "../../context/AuthContext";
import { formatPrice, cn } from "../../lib/utils";
import { Link } from "react-router-dom";
import ConfirmationModal from "../ConfirmationModal";

const ITEMS_PER_PAGE = 6;

export default function UserAds() {
  const { vehicles, updateVehicle, deleteVehicle } = useVehicles();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive' | 'draft' | 'under_review'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);

  const myVehicles = useMemo(() => {
    return vehicles.filter(v => 
      v.seller.uid === user?.uid || 
      (v.seller.name === "Redspots Productions")
    );
  }, [vehicles, user]);

  const filteredVehicles = useMemo(() => {
    let result = myVehicles;
    if (activeTab !== 'all') {
      result = result.filter(v => v.status === activeTab);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(v => 
        v.make.toLowerCase().includes(query) || 
        v.model.toLowerCase().includes(query) ||
        v.year.toString().includes(query)
      );
    }
    return result;
  }, [myVehicles, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE);
  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVehicles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredVehicles, currentPage]);

  const tabs = [
    { id: 'all', label: 'All Units' },
    { id: 'active', label: 'Active Service' },
    { id: 'under_review', label: 'Processing' },
    { id: 'inactive', label: 'Decommissioned' },
    { id: 'draft', label: 'Blueprints' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <Car className="w-3.5 h-3.5" />
            Inventory & Showroom
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-tight">
            Inventory Matrix
          </h1>
          <p className="text-xs text-[#86868B] dark:text-[#86868B] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            Manage, optimize, and scale your active automotive listings in Pakistan.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start md:self-end">
          <div className="relative group min-w-[200px] sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] group-focus-within:text-apple-blue transition-colors duration-300" />
            <input
              type="text"
              placeholder="Query vehicle archives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F5F5F7] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 rounded-xl text-xs font-medium focus:ring-0 outline-none transition-all duration-300 shadow-inner"
            />
          </div>

          <Link to="/sell" className="shrink-0">
            <motion.button
              whileHover={{ scale: 1.02, y: -0.5 }}
              whileTap={{ scale: 0.98 }}
              className="px-4.5 py-2 bg-apple-blue hover:bg-blue-600 text-white rounded-full text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5 border-none"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5px]" />
              Add New Unit
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0" style={{ WebkitOverflowScrolling: 'touch' }}>
        {tabs.map((tab) => {
          const count = tab.id === 'all' ? myVehicles.length : myVehicles.filter(v => v.status === tab.id).length;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border",
                isActive
                  ? "bg-apple-blue text-white border-apple-blue shadow-sm"
                  : "bg-white dark:bg-[#161617] border-black/[0.04] dark:border-white/[0.04] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
              )}
            >
              {tab.label} <span className={cn("ml-1 py-0.5 px-1.5 rounded-full text-[9px] font-bold font-mono", isActive ? "bg-white/25 text-white" : "bg-[#F5F5F7] dark:bg-white/5 text-[#86868B]")}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Listings Grid/Table */}
      <div className="space-y-3.5">
        <AnimatePresence mode="popLayout">
          {paginatedVehicles.length > 0 ? (
            paginatedVehicles.map((vehicle, idx) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, delay: idx * 0.02 }}
                className="bg-white dark:bg-[#161617] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-4 flex flex-col md:flex-row items-stretch md:items-center gap-5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300"
              >
                {/* Vehicle Image with Stats Overlay */}
                <div className="relative w-full md:w-36 aspect-[4/3] rounded-xl overflow-hidden shrink-0 bg-[#1C1C1E] border border-black/5 dark:border-white/10 group">
                  {vehicle.images?.[0] ? (
                    <img 
                      src={vehicle.images[0]} 
                      alt={vehicle.model} 
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="w-8 h-8 text-white/40" />
                    </div>
                  )}
                  
                  <div className="absolute top-2.5 left-2.5">
                     <span className={cn(
                      "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider backdrop-blur-md border",
                      vehicle.status === 'active' ? "bg-apple-green/15 text-apple-green border-apple-green/20" :
                      vehicle.status === 'under_review' ? "bg-apple-blue/15 text-apple-blue border-apple-blue/20" :
                      "bg-[#86868B]/15 text-[#86868B] border-[#86868B]/20"
                     )}>
                       {vehicle.status?.replace('_', ' ') || 'Active'}
                     </span>
                  </div>
                </div>

                {/* Vehicle Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#86868B] uppercase tracking-wider mb-1">
                       <Zap className="w-3 h-3 text-apple-blue" />
                       Asset Log #{vehicle.id.slice(-8).toUpperCase()}
                    </div>
                    <h2 className="text-sm font-semibold text-[#1D1D1F] dark:text-white truncate block">
                       {vehicle.year} {vehicle.make} {vehicle.model}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#86868B] font-normal">
                       <span className="font-semibold font-mono text-apple-blue">{formatPrice(vehicle.price)}</span>
                       <span className="opacity-30">/</span>
                       <span className="font-mono">{vehicle.mileage.toLocaleString()} km</span>
                       <span className="opacity-30">/</span>
                       <span className="truncate">{vehicle.location}</span>
                    </div>
                  </div>

                  {/* Microengagement Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3.5">
                     <div className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02]">
                        <p className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Views (7d)</p>
                        <p className="text-xs font-bold text-[#1D1D1F] dark:text-white font-mono mt-0.5">428 <span className="text-[9px] text-apple-green font-semibold font-sans ml-0.5">↑ 12%</span></p>
                     </div>
                     <div className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02]">
                        <p className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Inquiries</p>
                        <p className="text-xs font-bold text-[#1D1D1F] dark:text-white font-mono mt-0.5">14 <span className="text-[9px] text-apple-green font-semibold font-sans ml-0.5">↑ 2</span></p>
                     </div>
                     <div className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02] sm:block hidden">
                        <p className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Conversion</p>
                        <p className="text-xs font-bold text-[#1D1D1F] dark:text-white font-mono mt-0.5">3.2% <span className="text-[9px] text-apple-red font-semibold font-sans ml-0.5">↓ 0.4%</span></p>
                     </div>
                     <div className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02] sm:block hidden">
                        <p className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Market Rank</p>
                        <p className="text-xs font-bold text-apple-blue font-mono mt-0.5">#4 <span className="text-[9px] font-semibold text-[#86868B] font-sans ml-0.5">High</span></p>
                     </div>
                  </div>
                </div>

                {/* Actions Row/Column */}
                <div className="flex md:flex-col justify-end items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-black/[0.04] dark:border-white/[0.04] md:pl-5 shrink-0">
                  <div className="flex flex-wrap items-center gap-1.5 justify-end">
                    <Link 
                      to={`/edit/${vehicle.id}`}
                      className="w-8.5 h-8.5 rounded-lg bg-[#F5F5F7] hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-[#1D1D1F] dark:text-white transition-colors"
                      title="Edit Deployment"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => updateVehicle(vehicle.id, { status: vehicle.status === 'inactive' ? 'active' : 'inactive' })}
                      className={cn(
                        "w-8.5 h-8.5 rounded-lg bg-[#F5F5F7] dark:bg-white/5 flex items-center justify-center transition-colors",
                        vehicle.status === 'inactive' ? "text-apple-green hover:bg-apple-green/10" : "text-apple-red hover:bg-apple-red/10"
                      )}
                      title={vehicle.status === 'inactive' ? "Initiate Terminal" : "Abort Transaction"}
                    >
                      {vehicle.status === 'inactive' ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => setVehicleToDelete(vehicle.id)}
                      className="w-8.5 h-8.5 rounded-lg bg-[#F5F5F7] hover:bg-apple-red/10 dark:bg-white/5 text-apple-red flex items-center justify-center transition-colors"
                      title="Delete Permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <Link 
                      to={`/vehicle/${vehicle.id}`}
                      className="w-8.5 h-8.5 rounded-lg bg-apple-blue text-white flex items-center justify-center hover:bg-blue-600 transition-colors"
                      title="View Live"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center bg-[#F5F5F7]/30 dark:bg-white/[0.005] rounded-2xl border border-dashed border-black/[0.06] dark:border-white/[0.06]"
            >
              <BarChart3 className="w-10 h-10 text-[#86868B]/40 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white mb-1">No Matching Entities</h3>
              <p className="text-xs text-[#86868B] max-w-xs mx-auto mb-4 leading-relaxed font-normal">
                Archive query returned zero results under the current filter protocol. Consider adjusting parameters.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button 
                  onClick={() => {
                    setActiveTab('all');
                    setSearchQuery("");
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-semibold bg-white dark:bg-[#2C2C2E] hover:bg-black/5"
                >
                  Reset Protocols
                </button>
                <Link to="/sell" className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-apple-blue hover:bg-blue-600 text-white">New Deployment</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global Control Terminal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="md:col-span-2 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 p-5 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-10 h-10 bg-apple-blue rounded-xl flex items-center justify-center shrink-0">
               <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-center sm:text-left min-w-0">
               <h4 className="text-xs font-semibold text-[#1D1D1F] dark:text-white mb-0.5">Automated Fraud Detection Active</h4>
               <p className="text-[11px] text-[#86868B] font-normal leading-relaxed">Your listings are currently protected by our high-level neural security protocols. Every inquiry is verified before decryption.</p>
               <div className="flex items-center justify-center sm:justify-start gap-3 mt-2">
                  <div className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-apple-green animate-pulse" />
                     <span className="text-[9px] font-bold uppercase tracking-wider text-[#86868B]">Active Scan</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-apple-blue" />
                     <span className="text-[9px] font-bold uppercase tracking-wider text-apple-blue">Elite Tier</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="bg-white dark:bg-[#161617] p-5 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] flex flex-col justify-center items-center text-center shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
            <TrendingUp className="w-6 h-6 text-apple-green mb-2" />
            <h4 className="text-xs font-semibold text-[#1D1D1F] dark:text-white">Inventory Velocity</h4>
            <div className="text-2xl font-bold text-[#1D1D1F] dark:text-white font-mono mt-1 mb-0.5">4.2x</div>
            <p className="text-[9px] font-bold text-apple-green uppercase tracking-widest">Target Met</p>
         </div>
      </div>

      {/* Pagination Matrix */}
      {totalPages > 1 && (
        <div className="pt-4 flex items-center justify-between gap-4">
          <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
            Sector {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCurrentPage(prev => Math.max(1, prev - 1));
              }}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg border border-black/10 dark:border-white/10 flex items-center justify-center disabled:opacity-20 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentPage(i + 1);
                  }}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-bold font-mono transition-all",
                    currentPage === i + 1 
                      ? "bg-apple-blue text-white" 
                      : "hover:bg-black/5 dark:hover:bg-white/5 text-[#86868B]"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setCurrentPage(prev => Math.min(totalPages, prev + 1));
              }}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg border border-black/10 dark:border-white/10 flex items-center justify-center disabled:opacity-20 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={!!vehicleToDelete}
        onClose={() => setVehicleToDelete(null)}
        onConfirm={() => {
          if (vehicleToDelete) {
            deleteVehicle(vehicleToDelete);
            setVehicleToDelete(null);
          }
        }}
        title="Listing Termination"
        message="Initiate irreversible data wipe for selected entity? This action permanently removes all diagnostic data and marketplace presence for this asset."
        confirmLabel="Execute Wipe"
      />
    </div>
  );
}
