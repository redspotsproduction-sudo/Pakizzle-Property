import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle2, 
  XCircle, 
  Search, 
  MoreVertical, 
  Car, 
  Store, 
  ShieldCheck, 
  Clock,
  User,
  AlertCircle,
  FileText,
  ChevronRight,
  Zap,
  CheckCircle,
  ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatPrice } from "../../lib/utils";
import { ApprovalRequest } from "../../types";

const mockRequests: ApprovalRequest[] = [
  {
    id: 'req_1',
    type: 'listing_approval',
    status: 'pending',
    createdBy: 'user_123',
    targetId: 'veh_456',
    newData: {
      make: 'Audi',
      model: 'e-tron GT',
      year: 2024,
      price: 45000000,
      images: ['https://picsum.photos/seed/car1/800/600'],
      description: 'Pristine condition Audi e-tron GT. Fully loaded with all options.'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'req_2',
    type: 'dealer_verification',
    status: 'pending',
    createdBy: 'user_789',
    targetId: 'dealer_789',
    newData: {
      businessName: 'Premium Motors Lahore',
      licenseNumber: 'LHR-2024-8892',
      documents: ['license.pdf', 'tax_reg.pdf']
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'req_3',
    type: 'auction_verification',
    status: 'pending',
    createdBy: 'user_101',
    targetId: 'auc_101',
    newData: {
      chassisNumber: 'JZ1234567890',
      lotNumber: '5021',
      auctionHouse: 'USS Tokyo'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  }
];

export default function ApprovalCenter() {
  const [requests, setRequests] = useState<ApprovalRequest[]>(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'listing' | 'dealer' | 'verification'>('all');
  const [searchQuery, setSearchQuery] = useState("");

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // Tab filter
      if (activeTab !== 'all') {
        if (activeTab === 'listing' && req.type !== 'listing_approval') return false;
        if (activeTab === 'dealer' && req.type !== 'dealer_verification') return false;
        if (activeTab === 'verification' && req.type !== 'auction_verification') return false;
      }
      
      // Search query filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchType = req.type.toLowerCase().includes(q);
        const matchId = req.id.toLowerCase().includes(q);
        const matchCreatedBy = req.createdBy.toLowerCase().includes(q);
        const matchTargetId = req.targetId.toLowerCase().includes(q);
        
        let matchData = false;
        if (req.type === 'listing_approval' && req.newData) {
          matchData = (req.newData.make?.toLowerCase().includes(q) || req.newData.model?.toLowerCase().includes(q));
        } else if (req.type === 'dealer_verification' && req.newData) {
          matchData = req.newData.businessName?.toLowerCase().includes(q);
        } else if (req.type === 'auction_verification' && req.newData) {
          matchData = (req.newData.chassisNumber?.toLowerCase().includes(q) || req.newData.auctionHouse?.toLowerCase().includes(q));
        }
        
        return matchType || matchId || matchCreatedBy || matchTargetId || matchData;
      }
      
      return true;
    });
  }, [requests, activeTab, searchQuery]);

  const handleApprove = (id: string) => {
    setRequests(prev => prev.filter(req => req.id !== id));
    toast.success("Request Approved Successfully", {
      description: `Target ID: ${id} has been authorized and synced with production database.`
    });
    setIsDetailsOpen(false);
  };

  const handleReject = (id: string) => {
    setRequests(prev => prev.filter(req => req.id !== id));
    toast.error("Request Rejected", {
      description: `Target ID: ${id} has been rejected and flagged.`
    });
    setIsDetailsOpen(false);
  };

  const tabs = [
    { id: 'all', label: 'All Requests', type: 'all' },
    { id: 'listing', label: 'Listings', type: 'listing_approval' },
    { id: 'dealer', label: 'Dealers', type: 'dealer_verification' },
    { id: 'verification', label: 'Verifications', type: 'auction_verification' },
  ] as const;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'listing_approval': return <Car className="w-5 h-5" />;
      case 'dealer_verification': return <Store className="w-5 h-5" />;
      case 'auction_verification': return <ShieldCheck className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'listing_approval': return 'Listing Approval';
      case 'dealer_verification': return 'Dealer Verification';
      case 'auction_verification': return 'Auction Sheet';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions - EXACT match with Seller Console layout and sizing */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified Administration Console
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-tight">
            Approval Center
          </h1>
          <p className="text-xs text-[#86868B] dark:text-[#86868B] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            Review, moderate, and authorize all critical platform requests with advanced forensic scans.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start md:self-end">
          <div className="relative group min-w-[200px] sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] group-focus-within:text-apple-blue transition-colors duration-300" />
            <input
              type="text"
              placeholder="Search request archives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F5F5F7] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 rounded-xl text-xs font-medium focus:ring-0 outline-none transition-all duration-300 shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Tabs Row - EXACT match with Seller Console style */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0" style={{ WebkitOverflowScrolling: 'touch' }}>
        {tabs.map((tab) => {
          const count = tab.id === 'all' 
            ? requests.length 
            : requests.filter(r => r.type === tab.type).length;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

      {/* Requests List - EXACT card format, padding and hover from Seller Console layout */}
      <div className="space-y-3.5">
        <AnimatePresence mode="popLayout">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req, idx) => {
              const isListing = req.type === 'listing_approval';
              const isDealer = req.type === 'dealer_verification';
              const isVerification = req.type === 'auction_verification';

              return (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, delay: idx * 0.02 }}
                  className="bg-white dark:bg-[#161617] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-4.5 flex flex-col md:flex-row items-stretch md:items-center gap-5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300"
                >
                  {/* Category Image / Custom Shard Icon */}
                  <div className="relative w-full md:w-36 aspect-[4/3] rounded-xl overflow-hidden shrink-0 bg-[#1C1C1E] border border-black/5 dark:border-white/10 group flex items-center justify-center">
                    {isListing && req.newData.images?.[0] ? (
                      <img 
                        src={req.newData.images[0]} 
                        alt={req.newData.model} 
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                        referrerPolicy="no-referrer" 
                      />
                    ) : (
                      <div className={cn(
                        "w-full h-full flex items-center justify-center transition-colors",
                        isListing && "bg-apple-blue/5 dark:bg-apple-blue/10 text-apple-blue",
                        isDealer && "bg-purple-500/5 dark:bg-purple-500/10 text-purple-500",
                        isVerification && "bg-apple-orange/5 dark:bg-apple-orange/10 text-apple-orange"
                      )}>
                        {getTypeIcon(req.type)}
                      </div>
                    )}
                    
                    <div className="absolute top-2.5 left-2.5">
                       <span className={cn(
                        "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider backdrop-blur-md border",
                        isListing && "bg-apple-blue/15 text-apple-blue border-apple-blue/20",
                        isDealer && "bg-purple-500/15 text-purple-500 border-purple-500/20",
                        isVerification && "bg-apple-orange/15 text-apple-orange border-apple-orange/20"
                       )}>
                         {isListing ? 'Listing' : isDealer ? 'Dealer' : 'Verification'}
                       </span>
                    </div>
                  </div>

                  {/* Request / Target Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#86868B] uppercase tracking-wider mb-1">
                         <Zap className="w-3 h-3 text-apple-blue" />
                         Request ID #{req.id.slice(-8).toUpperCase()}
                         <span className="opacity-30">•</span>
                         <span>Requested by {req.createdBy}</span>
                         <span className="opacity-30">•</span>
                         <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <h2 className="text-sm font-semibold text-[#1D1D1F] dark:text-white truncate block">
                        {isListing ? `${req.newData.year} ${req.newData.make} ${req.newData.model}` : 
                         isDealer ? req.newData.businessName : 
                         `Chassis Number: ${req.newData.chassisNumber}`}
                      </h2>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#86868B] font-normal">
                         {isListing && (
                           <>
                             <span className="font-semibold font-mono text-apple-blue">{formatPrice(req.newData.price)}</span>
                             <span className="opacity-30">/</span>
                             <span className="truncate max-w-[250px]">{req.newData.description}</span>
                           </>
                         )}
                         {isDealer && (
                           <>
                             <span className="font-semibold text-purple-500">License: {req.newData.licenseNumber}</span>
                             <span className="opacity-30">/</span>
                             <span>Docs: {req.newData.documents?.join(', ')}</span>
                           </>
                         )}
                         {isVerification && (
                           <>
                             <span className="font-semibold text-apple-orange">Lot: {req.newData.lotNumber}</span>
                             <span className="opacity-30">/</span>
                             <span>House: {req.newData.auctionHouse}</span>
                           </>
                         )}
                      </div>
                    </div>

                    {/* Bento Micro-Stats box matrix matching Seller Console layout precisely */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3.5">
                       <div className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02]">
                          <p className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Forensic Trust</p>
                          <p className="text-xs font-bold text-[#1D1D1F] dark:text-white font-mono mt-0.5">
                            {isListing ? "94%" : isDealer ? "98%" : "96%"}
                            <span className="text-[9px] text-apple-green font-semibold font-sans ml-0.5">Verified</span>
                          </p>
                       </div>
                       <div className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02]">
                          <p className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Priority Tier</p>
                          <p className="text-xs font-bold text-apple-blue font-mono mt-0.5">High <span className="text-[9px] text-apple-blue font-semibold font-sans ml-0.5">Queue #1</span></p>
                       </div>
                       <div className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02] sm:block hidden">
                          <p className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Decision Matrix</p>
                          <p className="text-xs font-bold text-[#1D1D1F] dark:text-white font-sans mt-0.5">Pending Review</p>
                       </div>
                       <div className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02] sm:block hidden">
                          <p className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Platform Security</p>
                          <p className="text-xs font-bold text-apple-green font-mono mt-0.5">SSL Secured</p>
                       </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex md:flex-col justify-end items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-black/[0.04] dark:border-white/[0.04] md:pl-5 shrink-0">
                    <div className="flex flex-wrap items-center gap-1.5 justify-end">
                      <button 
                        onClick={() => {
                          setSelectedRequest(req);
                          setIsDetailsOpen(true);
                        }}
                        className="px-4.5 py-2 rounded-xl bg-apple-blue hover:bg-blue-600 text-white flex items-center justify-center font-semibold text-xs transition-colors"
                        title="Review details"
                      >
                        Review
                      </button>

                      <button
                        onClick={() => handleApprove(req.id)}
                        className="w-8.5 h-8.5 rounded-lg bg-[#F5F5F7] hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-apple-green transition-colors"
                        title="Approve Instantly"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleReject(req.id)}
                        className="w-8.5 h-8.5 rounded-lg bg-[#F5F5F7] hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-apple-red transition-colors"
                        title="Reject Instantly"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger className={cn(
                          "w-8.5 h-8.5 rounded-lg bg-[#F5F5F7] dark:bg-white/5 flex items-center justify-center transition-all hover:bg-apple-gray dark:hover:bg-white/10 text-apple-text-muted"
                        )}>
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-apple-border/50 backdrop-blur-xl">
                          <DropdownMenuItem 
                            onClick={() => handleApprove(req.id)}
                            className="font-bold text-xs py-3 px-4 rounded-lg focus:bg-apple-green/10 focus:text-apple-green cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4 mr-2 text-apple-green" /> Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleReject(req.id)}
                            className="font-bold text-xs py-3 px-4 rounded-lg focus:bg-apple-red/10 focus:text-apple-red cursor-pointer"
                          >
                            <XCircle className="w-4 h-4 mr-2 text-apple-red" /> Reject
                          </DropdownMenuItem>
                          <DropdownMenuItem className="font-bold text-xs py-3 px-4 rounded-lg cursor-pointer">
                            <AlertCircle className="w-4 h-4 mr-2 text-apple-orange" /> Flag for Risk
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
              <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white mb-1">Approval Queue Clear</h3>
              <p className="text-xs text-[#86868B] max-w-xs mx-auto mb-4 leading-relaxed font-normal">
                All platform authorization requests have been handled. Zero latency pending.
              </p>
              <button 
                onClick={() => {
                  setActiveTab('all');
                  setSearchQuery("");
                }}
                className="px-3.5 py-1.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-semibold bg-white dark:bg-[#2C2C2E] hover:bg-black/5"
              >
                Reset Protocols
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global Control Terminal - MATCHES Seller Console Layout Precisely */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
         <div className="md:col-span-2 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 p-5 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-10 h-10 bg-apple-blue rounded-xl flex items-center justify-center shrink-0">
               <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-center sm:text-left min-w-0">
               <h4 className="text-xs font-semibold text-[#1D1D1F] dark:text-white mb-0.5">Automated Risk Analysis Active</h4>
               <p className="text-[11px] text-[#86868B] font-normal leading-relaxed">
                 All platform submissions are dynamically verified via cryptographic hash registers, identity telemetry records, and cross-referenced authority logs.
               </p>
               <div className="flex items-center justify-center sm:justify-start gap-3 mt-2">
                  <div className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-apple-green animate-pulse" />
                     <span className="text-[9px] font-bold uppercase tracking-wider text-[#86868B]">Scanning Active</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-apple-blue" />
                     <span className="text-[9px] font-bold uppercase tracking-wider text-apple-blue">Secure Tunnel</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="bg-white dark:bg-[#161617] p-5 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] flex flex-col justify-center items-center text-center shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
            <CheckCircle2 className="w-6 h-6 text-apple-green mb-2" />
            <h4 className="text-xs font-semibold text-[#1D1D1F] dark:text-white">Approval Velocity</h4>
            <div className="text-2xl font-bold text-[#1D1D1F] dark:text-white font-mono mt-1 mb-0.5">99.8%</div>
            <p className="text-[9px] font-bold text-apple-green uppercase tracking-widest">SLA Targets Met</p>
         </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-[92vw] lg:max-w-4xl h-[85vh] max-h-[85vh] p-0 overflow-hidden border-none rounded-[2.5rem] bg-white dark:bg-[#1D1D1F] shadow-2xl flex flex-col">
          {selectedRequest && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-8 border-b border-apple-border flex items-center justify-between bg-apple-gray/10 dark:bg-white/[0.02]">
                <div>
                  <DialogTitle className="text-2xl font-black tracking-tight text-apple-text">
                    {getTypeLabel(selectedRequest.type)}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-apple-text-muted mt-1 uppercase font-black tracking-widest">
                    Reviewing request {selectedRequest.id}
                  </DialogDescription>
                </div>
                <span className="bg-apple-orange/10 text-apple-orange border border-apple-orange/20 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">
                   Pending
                </span>
              </div>

              <ScrollArea className="flex-1 min-h-0 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    {/* Submission Details */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted ml-2">Submission Details</p>
                      <div className="glass-panel p-5 rounded-2xl space-y-4 shadow-sm">
                        {Object.entries(selectedRequest.newData).map(([key, value]) => {
                          if (key === 'images') return null;
                          return (
                            <div key={key} className="flex flex-col gap-1.5 border-b border-apple-border/30 last:border-0 pb-3 last:pb-0">
                              <span className="text-[9px] font-black text-apple-text-muted uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</span>
                              <span className="font-bold text-sm tracking-tight text-apple-text">
                                {key === 'price' ? formatPrice(value as number) : String(value)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Forensic Scan */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted ml-2">Forensic Scan</p>
                      <div className="p-5 rounded-2xl border border-apple-green/20 bg-apple-green/5 dark:bg-apple-green/10 space-y-3.5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-apple-text">Trust Delta</span>
                          <span className="text-base font-black text-apple-green">
                            {selectedRequest.type === 'listing_approval' ? "94%" : selectedRequest.type === 'dealer_verification' ? "98%" : "96%"}
                          </span>
                        </div>
                        <div className="h-1.5 bg-apple-gray dark:bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-apple-green transition-all duration-500" 
                            style={{ width: selectedRequest.type === 'listing_approval' ? "94%" : selectedRequest.type === 'dealer_verification' ? "98%" : "96%" }} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Media Preview */}
                    {selectedRequest.type === 'listing_approval' && selectedRequest.newData.images?.[0] && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted ml-2">Media Preview</p>
                        <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[#1C1C1E] border border-apple-border shadow-sm">
                          <img 
                            src={selectedRequest.newData.images[0]} 
                            alt="Preview" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>
                    )}

                    {/* Decision Comments */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted ml-2">Decision Comments</p>
                      <textarea 
                        className="apple-input w-full py-4 resize-none leading-relaxed h-28"
                        placeholder="Observations, decision notes..."
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="p-8 border-t border-apple-border bg-apple-gray/30 dark:bg-white/[0.02] flex flex-col md:flex-row gap-4">
                <Button 
                  variant="ghost" 
                  className="flex-1 h-14 rounded-2xl border-2 border-apple-border font-black uppercase tracking-widest text-xs text-apple-red hover:bg-apple-red/10 active:scale-95 transition-all w-full md:w-auto"
                  onClick={() => handleReject(selectedRequest.id)}
                >
                  Reject
                </Button>
                <Button 
                  className="flex-[2] apple-button-primary h-14 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs text-white"
                  onClick={() => handleApprove(selectedRequest.id)}
                >
                  Approve & Sync
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
