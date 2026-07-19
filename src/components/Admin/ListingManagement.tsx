import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Car, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  MapPin,
  ChevronRight,
  Download,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert,
  Info,
  Zap,
  Gauge,
  Activity,
  Settings,
  Shield
} from "lucide-react";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatPrice } from "../../lib/utils";
import { Vehicle } from "../../types";

// Mock data based on Vehicle type
const mockListings: Vehicle[] = [
  {
    id: 'veh_101',
    make: 'Audi',
    model: 'e-tron GT',
    year: 2024,
    price: 34500000,
    mileage: 1200,
    fuelType: 'electric',
    transmission: 'automatic',
    city: 'Lahore',
    location: 'Gulberg III, Lahore',
    type: 'car',
    condition: 'used',
    engineSize: '350kW',
    seller: {
      name: 'Ali Khan',
      isVerified: true,
      rating: 4.8,
      badgeType: 'identity'
    },
    description: 'Pristine condition Audi e-tron GT. Fully loaded with premium options.',
    images: ['https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800'],
    status: 'active',
    isAuctionVerified: true,
    isFeatured: true,
    views: 1240,
    favorites: 45,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    features: ['Panoramic Roof', 'Matrix LED', 'Bang & Olufsen Sound']
  },
  {
    id: 'veh_102',
    make: 'Toyota',
    model: 'Land Cruiser ZX',
    year: 2023,
    price: 89000000,
    mileage: 5000,
    fuelType: 'diesel',
    transmission: 'automatic',
    city: 'Islamabad',
    location: 'F-7, Islamabad',
    type: 'car',
    condition: 'used',
    engineSize: '3300cc',
    seller: {
      name: 'Capital Motors',
      isVerified: true,
      rating: 4.9,
      badgeType: 'business'
    },
    description: 'Black edition LC300. Immaculate condition.',
    images: ['https://images.unsplash.com/photo-1594568284297-7c64464062b1?auto=format&fit=crop&q=80&w=800'],
    status: 'pending',
    isFeatured: false,
    views: 89,
    favorites: 12,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updatedAt: new Date().toISOString(),
    features: ['Sunroof', 'Leather Seats', 'Cool Box']
  },
  {
    id: 'veh_103',
    make: 'Honda',
    model: 'Civic RS',
    year: 2022,
    price: 8200000,
    mileage: 15000,
    fuelType: 'petrol',
    transmission: 'automatic',
    city: 'Karachi',
    location: 'DHA Phase 6, Karachi',
    type: 'car',
    condition: 'used',
    engineSize: '1500cc',
    seller: {
      name: 'Owner Name',
      isVerified: false,
      rating: 4.5
    },
    description: 'Single owner, maintained by Honda dealership.',
    images: ['https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800'],
    status: 'sold',
    isFeatured: false,
    views: 4500,
    favorites: 120,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    updatedAt: new Date().toISOString(),
    features: ['Honda Sensing', 'Apple CarPlay']
  }
];

export default function ListingManagement() {
  const [listings, setListings] = useState<Vehicle[]>(mockListings);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedListing, setSelectedListing] = useState<Vehicle | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [statusFilter]);

  const filteredListings = listings.filter(l => {
    const matchesSearch = `${l.make} ${l.model} ${l.id}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleQuickView = (listing: Vehicle) => {
    setSelectedListing(listing);
    setIsDetailsOpen(true);
  };

  const handleModify = (listing: Vehicle) => {
    toast.info(`Redirecting to edit mode for ${listing.make} ${listing.model}`, {
      description: "Admin edit permission granted.",
      icon: <Edit3 className="w-4 h-4" />
    });
  };

  const handleViewOnSite = (listing: Vehicle) => {
    toast.success(`Opening public view for ${listing.id}`, {
      description: "Redirecting to marketplace frontend.",
      icon: <ExternalLink className="w-4 h-4" />
    });
  };

  const promptDelete = (listing: Vehicle) => {
    setSelectedListing(listing);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedListing) return;
    setListings(prev => prev.filter(l => l.id !== selectedListing.id));
    toast.error("Inventory Removed", {
      description: `${selectedListing.make} ${selectedListing.model} has been purged from inventory.`,
      icon: <Trash2 className="w-4 h-4" />
    });
    setIsDeleteDialogOpen(false);
    setSelectedListing(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions - EXACT match with Approval Center layout and sizing */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <Car className="w-3.5 h-3.5 animate-pulse" />
            Verified Listings Console
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-tight">
            Listings Inventory
          </h1>
          <p className="text-xs text-[#86868B] dark:text-[#86868B] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            Monitor, edit, elevate, and moderate all active vehicle listings across the platform.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start md:self-end">
          <Button 
            variant="outline" 
            className="rounded-xl border-black/[0.08] dark:border-white/[0.08] bg-white/50 dark:bg-white/5 backdrop-blur-sm text-xs font-semibold h-10 px-4"
            onClick={() => toast.success("Export Initialized", { description: "Generating encrypted CSV of marketplace inventory." })}
          >
            <Download className="w-3.5 h-3.5 mr-2 text-apple-blue" /> Export
          </Button>
          <Button 
            className="apple-button-primary rounded-xl text-xs font-semibold h-10 px-5 text-white"
            onClick={() => toast.info("New Inventory Entry", { description: "Opening listing creation wizard..." })}
          >
            <Plus className="w-3.5 h-3.5 mr-2" /> Add Listing
          </Button>
        </div>
      </div>

      {/* High-Velocity Metrics Shard - Sized perfectly like Approval Center bento elements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-apple-text">
        {[
          { label: 'Total Inventory', value: '4,289', change: '+12%', description: 'Active vehicle listings', icon: Car, color: 'blue' },
          { label: 'Market Value', value: '₨ 1.2B', change: '+8%', description: 'Aggregate marketplace value', icon: DollarSign, color: 'green' },
          { label: 'Total Views', value: '1.2M', change: '+24%', description: 'Cumulative page interactions', icon: TrendingUp, color: 'purple' },
          { label: 'Pending Audit', value: '54', change: '-5', description: 'Queued validation checks', icon: Clock, color: 'orange' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-[#161617] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-5 flex flex-col justify-between hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300 relative group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md",
                stat.color === 'blue' && "bg-apple-blue shadow-apple-blue/10",
                stat.color === 'orange' && "bg-apple-orange shadow-apple-orange/10",
                stat.color === 'green' && "bg-apple-green shadow-apple-green/10",
                stat.color === 'purple' && "bg-[#AF52DE] shadow-purple-500/10"
              )}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                stat.change.startsWith('+') ? "text-apple-green bg-apple-green/10" : "text-apple-red bg-apple-red/10"
              )}>
                {stat.change}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-white font-sans">{stat.value}</h3>
              <p className="text-[10px] text-[#86868B] font-normal leading-relaxed">{stat.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs Row and Search Block - EXACT match with Seller Console/Approval Center layout */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0" style={{ WebkitOverflowScrolling: 'touch' }}>
          {['all', 'active', 'pending', 'sold', 'inactive'].map((status) => {
            const count = status === 'all' ? listings.length : listings.filter(l => l.status === status).length;
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border",
                  isActive
                    ? "bg-apple-blue text-white border-apple-blue shadow-sm"
                    : "bg-white dark:bg-[#161617] border-black/[0.04] dark:border-white/[0.04] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                )}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} <span className={cn("ml-1 py-0.5 px-1.5 rounded-full text-[9px] font-bold font-mono", isActive ? "bg-white/25 text-white" : "bg-[#F5F5F7] dark:bg-white/5 text-[#86868B]")}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="relative group min-w-[200px] sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] group-focus-within:text-apple-blue transition-colors duration-300" />
          <input
            type="text"
            placeholder="Search make, model, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F5F5F7] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 rounded-xl text-xs font-medium focus:ring-0 outline-none transition-all duration-300 shadow-inner"
          />
        </div>
      </div>

      {/* Listings List Cards - EXACT card format, padding and hover from Seller Console / Approval Center layout */}
      <div className="space-y-3.5">
        <AnimatePresence mode="popLayout">
          {filteredListings.length > 0 ? (
            filteredListings.map((listing, idx) => {
              return (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, delay: idx * 0.02 }}
                  className="bg-white dark:bg-[#161617] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-4.5 flex flex-col md:flex-row items-stretch md:items-center gap-5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300"
                >
                  {/* Category Image */}
                  <div className="relative w-full md:w-36 aspect-[4/3] rounded-xl overflow-hidden shrink-0 bg-[#1C1C1E] border border-black/5 dark:border-white/10 group flex items-center justify-center">
                    <img 
                      src={listing.images[0]} 
                      alt={listing.model} 
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                      referrerPolicy="no-referrer" 
                    />
                    
                    <div className="absolute top-2.5 left-2.5">
                       <span className={cn(
                        "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider backdrop-blur-md border",
                        listing.status === 'active' && "bg-apple-green/15 text-apple-green border-apple-green/20",
                        listing.status === 'pending' && "bg-apple-orange/15 text-apple-orange border-apple-orange/20",
                        listing.status === 'sold' && "bg-apple-blue/15 text-apple-blue border-apple-blue/20",
                        listing.status === 'inactive' && "bg-gray-500/15 text-gray-400 border-gray-500/20"
                       )}>
                         {listing.status}
                       </span>
                    </div>
                  </div>

                  {/* Listings Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#86868B] uppercase tracking-wider mb-1">
                         <Zap className="w-3 h-3 text-apple-blue" />
                         Asset ID #{listing.id.toUpperCase()}
                         <span className="opacity-30">•</span>
                         <span>{listing.year} model</span>
                         <span className="opacity-30">•</span>
                         <span>{listing.city}</span>
                      </div>
                      
                      <h2 className="text-sm font-semibold text-[#1D1D1F] dark:text-white truncate block">
                        {listing.make} {listing.model} <span className="font-mono text-xs font-bold text-apple-blue ml-2">{formatPrice(listing.price)}</span>
                      </h2>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#86868B] font-normal">
                         <span className="font-semibold text-purple-500">Transmission: {listing.transmission}</span>
                         <span className="opacity-30">/</span>
                         <span className="font-semibold text-apple-orange">Fuel: {listing.fuelType}</span>
                         <span className="opacity-30">/</span>
                         <span className="truncate max-w-[300px]">{listing.description}</span>
                      </div>
                    </div>

                    {/* Bento Micro-Stats box matrix */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3.5">
                       <div className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02]">
                          <p className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Odometer</p>
                          <p className="text-xs font-bold text-[#1D1D1F] dark:text-white font-mono mt-0.5">
                            {listing.mileage.toLocaleString()} km
                          </p>
                       </div>
                       <div className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02]">
                          <p className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Engine core</p>
                          <p className="text-xs font-bold text-apple-blue truncate mt-0.5">
                            {listing.engineSize || 'N/A'}
                          </p>
                       </div>
                       <div className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02]">
                          <p className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Engagement</p>
                          <p className="text-xs font-bold text-apple-green font-mono mt-0.5">{(listing.views || 0).toLocaleString()} Views</p>
                       </div>
                       <div className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02]">
                          <p className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Verification</p>
                          <p className="text-xs font-bold text-apple-green font-mono mt-0.5">
                            {listing.isAuctionVerified ? 'Verified' : 'Pending'}
                          </p>
                       </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex md:flex-col justify-end items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-black/[0.04] dark:border-white/[0.04] md:pl-5 shrink-0">
                    <div className="flex flex-wrap items-center gap-1.5 justify-end">
                      <button 
                        onClick={() => handleQuickView(listing)}
                        className="px-4.5 py-2 rounded-xl bg-apple-blue hover:bg-blue-600 text-white flex items-center justify-center font-semibold text-xs transition-colors"
                        title="Investigate details"
                      >
                        Investigate
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger className={cn(
                          "w-8.5 h-8.5 rounded-lg bg-[#F5F5F7] hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-apple-blue transition-colors"
                        )}>
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-2xl border-apple-border/50 bg-white/95 dark:bg-[#1D1D1F]/95 backdrop-blur-xl shadow-2xl p-2">
                          <DropdownMenuItem 
                            onClick={() => handleModify(listing)}
                            className="rounded-xl py-3 px-4 font-bold text-xs"
                          >
                            <Edit3 className="w-4 h-4 mr-3 text-apple-orange" /> Modify Listing
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleViewOnSite(listing)}
                            className="rounded-xl py-3 px-4 font-bold text-xs"
                          >
                            <ExternalLink className="w-4 h-4 mr-3 text-purple-500" /> View on Site
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-apple-border/50 my-2 mx-2" />
                          <DropdownMenuItem 
                            onClick={() => promptDelete(listing)}
                            className="rounded-xl py-3 px-4 font-bold text-xs text-apple-red focus:bg-apple-red/10 focus:text-apple-red"
                          >
                            <Trash2 className="w-4 h-4 mr-3" /> Remove Inventory
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center bg-[#F5F5F7]/30 dark:bg-white/[0.005] rounded-2xl border border-dashed border-black/[0.06] dark:border-white/[0.06]"
            >
              <CheckCircle2 className="w-10 h-10 text-apple-green/60 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white mb-1">No Listings Found</h3>
              <p className="text-xs text-[#86868B] max-w-xs mx-auto mb-4 leading-relaxed font-normal">
                No vehicles match your status filter or search parameters.
              </p>
              <button 
                onClick={() => {
                  setStatusFilter('all');
                  setSearchQuery("");
                }}
                className="px-3.5 py-1.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-semibold bg-white dark:bg-[#2C2C2E] hover:bg-black/5"
              >
                Reset Filter
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
        <p className="text-xs font-bold text-[#86868B]">Showing 1 to {filteredListings.length} of {listings.length} items</p>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" className="rounded-xl h-8.5 text-[11px] font-semibold border-black/[0.08] dark:border-white/[0.08]" disabled>Previous</Button>
          <Button size="sm" className="w-8.5 h-8.5 rounded-xl bg-apple-blue text-white text-xs font-bold shadow-md shadow-apple-blue/20">1</Button>
          <Button variant="outline" className="rounded-xl h-8.5 text-[11px] font-semibold border-black/[0.08] dark:border-white/[0.08]">Next</Button>
        </div>
      </div>

      {/* Vehicle Archive Detail Shard */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-[95vw] lg:max-w-4xl h-[85vh] max-h-[85vh] p-0 overflow-hidden border-none rounded-[2.5rem] bg-white dark:bg-[#1D1D1F] shadow-2xl flex flex-col">
          {selectedListing && (
            <div className="flex flex-col lg:flex-row h-full overflow-hidden">
              {/* Visual Shard Sidebar */}
              <aside className="w-full lg:w-[280px] border-r border-apple-border/10 flex flex-col bg-apple-gray/40 dark:bg-white/[0.02] overflow-y-auto custom-scrollbar shrink-0">
                 <div className="relative aspect-video group overflow-hidden bg-black">
                    <img 
                      src={selectedListing.images[0]} 
                      alt={selectedListing.model}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 space-y-0.5">
                       <Badge className="bg-apple-blue/20 backdrop-blur-xl text-apple-blue border-apple-blue/30 text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full mb-1">
                          {selectedListing.condition} • {selectedListing.year}
                       </Badge>
                       <h3 className="text-base font-black text-white tracking-tighter leading-tight">
                         {selectedListing.make} <br/> {selectedListing.model}
                       </h3>
                    </div>
                 </div>

                 <div className="p-5 space-y-4 flex-1">
                    <section className="space-y-3">
                       <h4 className="text-[8px] font-black uppercase tracking-[0.3em] text-apple-text-muted px-1">Identity</h4>
                       <div className="p-4 rounded-[18px] bg-white/60 dark:bg-white/5 backdrop-blur-3xl border border-apple-border/10 space-y-3 shadow-sm">
                          <div className="flex items-center justify-between">
                             <span className="text-[9px] font-bold text-apple-text-muted">Asset ID</span>
                             <span className="text-[10px] font-black text-apple-blue uppercase tracking-tighter">{selectedListing.id}</span>
                          </div>
                          <div className="flex items-center justify-between">
                             <span className="text-[9px] font-bold text-apple-text-muted">Valuation</span>
                             <span className="text-base font-black tracking-tighter">{formatPrice(selectedListing.price)}</span>
                          </div>
                       </div>
                    </section>

                    <section className="space-y-3">
                       <h4 className="text-[8px] font-black uppercase tracking-[0.3em] text-apple-text-muted px-1">Owner</h4>
                       <div className="flex items-center gap-3 p-4 rounded-[18px] bg-white/60 dark:bg-white/5 border border-apple-border/5 group cursor-pointer hover:bg-apple-blue/5 transition-all duration-500">
                          <div className="w-8 h-8 rounded-lg bg-apple-gray dark:bg-white/10 flex items-center justify-center font-black text-[11px] text-apple-text shadow-sm group-hover:scale-110 transition-transform">
                             {selectedListing.seller.name[0]}
                          </div>
                          <div className="min-w-0">
                             <div className="text-[12px] font-black tracking-tight truncate">{selectedListing.seller.name}</div>
                             <div className="flex items-center gap-1 mt-0.5">
                                <ShieldCheck className="w-2.5 h-2.5 text-apple-blue" />
                                <span className="text-[7px] font-black text-apple-blue uppercase tracking-widest leading-none">{selectedListing.seller.isVerified ? 'Authoritative' : 'Citizen'}</span>
                             </div>
                          </div>
                       </div>
                    </section>

                    <Button variant="outline" className="w-full h-11 rounded-xl border-apple-border/20 font-black text-[9px] uppercase tracking-widest hover:bg-apple-gray dark:hover:bg-white/5 transition-all group overflow-hidden outline-none" onClick={() => handleViewOnSite(selectedListing)}>
                       <span className="relative z-10 flex items-center gap-2"><ExternalLink className="w-3.5 h-3.5" /> Public View</span>
                    </Button>
                 </div>
              </aside>

              {/* Specification Shard Area */}
              <div className="flex-1 flex flex-col min-w-0 bg-transparent relative">
                 <header className="p-5 lg:p-6 border-b border-apple-border/10 flex items-center justify-between bg-white/40 dark:bg-white/5 backdrop-blur-xl">
                    <div className="space-y-0">
                       <h3 className="text-lg font-black tracking-tight">Specifications</h3>
                       <div className="flex items-center gap-1.5 opacity-60">
                          <div className="w-1.5 h-1.5 rounded-full bg-apple-blue animate-pulse" />
                          <span className="text-[8px] font-black uppercase tracking-[0.3em]">Exposure Active</span>
                       </div>
                    </div>
                 </header>

                 <div className="flex-1 overflow-y-auto p-5 lg:p-6 custom-scrollbar space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                       {[
                          { label: 'Transmission', value: selectedListing.transmission, icon: Gauge },
                          { label: 'Fuel Matrix', value: selectedListing.fuelType, icon: Zap },
                          { label: 'Odometer', value: `${selectedListing.mileage}km`, icon: Activity },
                          { label: 'Engine Core', value: selectedListing.engineSize, icon: Settings },
                       ].map((spec, i) => (
                          <div key={i} className="p-4 rounded-[18px] bg-apple-gray dark:bg-white/[0.02] border border-apple-border/5 group hover:border-apple-blue/30 transition-all duration-700">
                             <spec.icon className="w-4 h-4 text-apple-text-muted/40 mb-2 group-hover:scale-110 group-hover:text-apple-blue transition-all" />
                             <div className="text-[7px] font-black uppercase tracking-[0.2em] text-apple-text-muted mb-0.5">{spec.label}</div>
                             <div className="font-black text-[11px] tracking-tight uppercase leading-none truncate capitalize">{spec.value}</div>
                          </div>
                       ))}
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-[8px] font-black uppercase tracking-[0.3em] text-apple-text-muted px-1">Context</h4>
                       <div className="p-6 rounded-[24px] bg-apple-gray dark:bg-white/[0.02] border border-apple-border/5 relative group">
                          <p className="text-sm lg:text-base font-bold leading-tight tracking-tight text-apple-text/90">
                             "{selectedListing.description}"
                          </p>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <h4 className="text-[8px] font-black uppercase tracking-[0.3em] text-apple-text-muted px-1">Shards</h4>
                       <div className="flex flex-wrap gap-2">
                          {selectedListing.features.map((feature, i) => (
                             <Badge key={i} variant="outline" className="px-2 py-0.5 rounded-lg border-apple-border/10 bg-white dark:bg-white/5 font-black text-[8px] tracking-tight">
                                {feature}
                             </Badge>
                          ))}
                       </div>
                    </div>
                 </div>

                 <footer className="p-5 lg:p-6 border-t border-apple-border/10 bg-white/40 dark:bg-white/5 backdrop-blur-2xl grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button 
                      variant="outline" 
                      className="h-11 rounded-xl border-apple-border/20 font-black text-[8px] uppercase tracking-[0.2em] hover:bg-apple-gray dark:hover:bg-white/10 transition-all active:scale-95 outline-none" 
                      onClick={() => handleModify(selectedListing)}
                    >
                       Modify
                    </Button>
                    <Button 
                      className="apple-button-primary h-11 rounded-xl font-black text-[8px] uppercase tracking-[0.2em] shadow-xl shadow-apple-blue/20 active:scale-90 transition-all outline-none"
                      onClick={() => toast.success(`Performance Boost initiated`)}
                    >
                       Elevate
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="h-11 rounded-xl bg-apple-red shadow-xl shadow-apple-red/10 font-black text-[8px] uppercase tracking-[0.2em] active:scale-95 transition-all border-none text-white outline-none" 
                      onClick={() => { setIsDetailsOpen(false); setIsDeleteDialogOpen(true); }}
                    >
                       Purge
                    </Button>
                 </footer>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm rounded-[24px] border-apple-border/50 bg-white dark:bg-[#1D1D1F] p-6">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 bg-apple-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-apple-red" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">Purge Listing?</DialogTitle>
            <DialogDescription className="text-xs font-medium text-apple-text-muted pb-2">
              You are about to remove <span className="text-apple-text font-bold">"{selectedListing?.year} {selectedListing?.make} {selectedListing?.model}"</span> from the global directory.
            </DialogDescription>
            <DialogFooter className="flex-col gap-2 pt-2">
              <Button className="bg-apple-red hover:bg-apple-red/90 text-white rounded-xl w-full h-11 font-bold shadow-lg shadow-apple-red/20 border-none" onClick={confirmDelete}>
                Delete Permanently
              </Button>
              <Button variant="ghost" className="rounded-xl w-full h-11 font-bold text-xs" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
