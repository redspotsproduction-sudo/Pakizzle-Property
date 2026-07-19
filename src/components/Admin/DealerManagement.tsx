import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Store, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Ban, 
  CheckCircle2, 
  AlertTriangle,
  UserPlus,
  ArrowUpRight,
  Download,
  Activity,
  Key,
  Trash2,
  ExternalLink,
  MessageSquare,
  Building2,
  FileCheck,
  FileX,
  Crown,
  MapPin,
  Clock,
  Briefcase,
  Star,
  User,
  Share2,
  Car,
  Info,
  Globe,
  Shield
} from "lucide-react";
import { toast } from "sonner";
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "../../lib/utils";
import { DealerProfile } from "../../types";
import { db } from "../../firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";

const mockDealers: any[] = [
  {
    uid: 'dealer_1',
    businessName: 'Premium Motors Lahore',
    licenseNumber: 'LHR-DLR-9921',
    documents: ['https://picsum.photos/seed/doc1/800/600', 'https://picsum.photos/seed/doc2/800/600'],
    status: 'approved',
    subscriptionPlan: 'Platinum',
    verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    email: 'contact@premiummotors.pk',
    photoURL: 'https://i.pravatar.cc/150?u=dealer_1',
    rating: 4.8,
    activeListings: 24,
  },
  {
    uid: 'dealer_2',
    businessName: 'Karachi Auto Hub',
    licenseNumber: 'KHI-DLR-4412',
    documents: ['https://picsum.photos/seed/doc3/800/600'],
    status: 'pending',
    subscriptionPlan: 'Professional',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    email: 'info@khiautohub.com',
    photoURL: 'https://i.pravatar.cc/150?u=dealer_2',
    rating: 0,
    activeListings: 0,
  },
  {
    uid: 'dealer_3',
    businessName: 'Islamabad Luxury Wheels',
    licenseNumber: 'ISB-DLR-1002',
    documents: ['https://picsum.photos/seed/doc4/800/600', 'https://picsum.photos/seed/doc5/800/600'],
    status: 'rejected',
    subscriptionPlan: 'Basic',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    email: 'sales@isbluxury.pk',
    photoURL: 'https://i.pravatar.cc/150?u=dealer_3',
    rating: 3.2,
    activeListings: 5,
  },
  {
    uid: 'dealer_4',
    businessName: 'Zaid & Sons Enterprises',
    licenseNumber: 'PJK-DLR-7723',
    documents: ['https://picsum.photos/seed/doc6/800/600'],
    status: 'approved',
    subscriptionPlan: 'Professional',
    verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 200).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 250).toISOString(),
    email: 'zaid@zaidsons.com',
    photoURL: 'https://i.pravatar.cc/150?u=dealer_4',
    rating: 4.5,
    activeListings: 12,
  }
];

export default function DealerManagement() {
  const [dealers, setDealers] = useState<any[]>(mockDealers);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDealer, setSelectedDealer] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [isRevokeOpen, setIsRevokeOpen] = useState(false);
  const [editDealer, setEditDealer] = useState<any | null>(null);

  useEffect(() => {
    if (selectedDealer) {
      setEditDealer({ ...selectedDealer });
    } else {
      setEditDealer(null);
    }
  }, [selectedDealer, isDetailsOpen]);

  // Real-time listener for dealers
  useEffect(() => {
    const q = query(
      collection(db, "users"),
      where("accountType", "==", "dealer")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dealersData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
      setDealers(dealersData.length > 0 ? dealersData : mockDealers);
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading enterprise dealers:", error);
      setDealers(mockDealers);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const filteredDealers = dealers.filter(d => {
    const matchesSearch = `${d.businessName || ''} ${d.licenseNumber || d.registrationNumber || ''} ${d.email || ''} ${d.ownerName || d.dealerName || ''}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAction = (type: string, dealer: any) => {
    setSelectedDealer(dealer);
    switch(type) {
      case 'inspect':
        setIsDetailsOpen(true);
        break;
      case 'approve':
        setIsApprovalOpen(true);
        break;
      case 'revoke':
        setIsRevokeOpen(true);
        break;
      case 'message':
        toast.info("Opening Business Channel", {
          description: `Switching to B2B support portal for ${dealer.businessName}.`
        });
        break;
      case 'billing':
        toast.success("Billing Overview Dispatched", {
          description: `Subscription details for ${dealer.businessName} sent to admin-finance.`
        });
        break;
    }
  };

  const processDealer = async (newStatus: 'approved' | 'rejected') => {
    if (!selectedDealer) return;
    try {
      await updateDoc(doc(db, "users", selectedDealer.uid), {
        status: newStatus,
        verifiedAt: newStatus === 'approved' ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString()
      });
      toast.success(newStatus === 'approved' ? "Business Partnership Secured" : "Application Rejected", {
        description: newStatus === 'approved'
          ? `${selectedDealer.businessName} is now a verified Pakizzle Dealer.`
          : `Documentation for ${selectedDealer.businessName} did not meet security standards.`,
        icon: newStatus === 'approved' ? <ShieldCheck className="w-5 h-5 text-apple-green" /> : <FileX className="w-5 h-5 text-apple-red" />
      });
    } catch (e) {
      console.error("Firestore update failed, updating local state only:", e);
      setDealers(prev => prev.map(d => 
        d.uid === selectedDealer.uid ? { 
          ...d, 
          status: newStatus,
          verifiedAt: newStatus === 'approved' ? new Date().toISOString() : d.verifiedAt 
        } : d
      ));
      if (newStatus === 'approved') {
        toast.success("Business Partnership Secured (Local State)", {
          description: `${selectedDealer.businessName} is now a verified Pakizzle Dealer.`
        });
      } else {
        toast.error("Application Rejected (Local State)", {
          description: `Documentation for ${selectedDealer.businessName} did not meet security standards.`
        });
      }
    }
    setIsApprovalOpen(false);
    setIsRevokeOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions - EXACT match with Approval Center layout and sizing */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <Store className="w-3.5 h-3.5" />
            Verified Administration Console
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-tight">
            Dealer Ecosystem
          </h1>
          <p className="text-xs text-[#86868B] dark:text-[#86868B] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            Verified businesses, professional license validation, and enterprise merchant fleet partnerships.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start md:self-end">
          <div className="relative group min-w-[200px] sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] group-focus-within:text-apple-blue transition-colors duration-300" />
            <input
              type="text"
              placeholder="Search business records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F5F5F7] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 rounded-xl text-xs font-medium focus:ring-0 outline-none transition-all duration-300 shadow-inner"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="rounded-xl border-black/[0.04] dark:border-white/[0.04] bg-white dark:bg-[#161617] h-9 px-4 text-xs font-bold shadow-sm hover:bg-[#F5F5F7] dark:hover:bg-white/5"
              onClick={() => toast.success("Directory Exported", { description: "Download of all verified dealer profiles has started." })}
            >
              <Download className="w-3.5 h-3.5 mr-2" /> Export Fleet
            </Button>
            <Button 
              className="apple-button-primary bg-apple-blue text-white rounded-xl h-9 px-4 text-xs font-bold shadow-sm"
              onClick={() => toast.info("New Partnership", { description: "Opening the enterprise dealer onboarding wizard." })}
            >
              <UserPlus className="w-3.5 h-3.5 mr-2" /> Register Business
            </Button>
          </div>
        </div>
      </div>

      {/* Stats - EXACT match with Approval Center card format */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Verified Partners', value: '412', change: '+28 New', icon: Building2, color: 'text-apple-blue', bg: 'bg-apple-blue/10' },
          { label: 'Pending Reviews', value: '18', change: 'Priority', icon: Clock, color: 'text-apple-orange', bg: 'bg-apple-orange/10' },
          { label: 'Total Inventory', value: '3,892', change: '8.4 Units/Avg', icon: CheckCircle2, color: 'text-apple-green', bg: 'bg-apple-green/10' },
          { label: 'Premium Tiers', value: '156', change: '38% VIP', icon: Crown, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#161617] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div className={cn("p-3 rounded-xl group-hover:scale-105 transition-transform duration-500", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                 {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-none">{stat.value}</div>
              <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider mt-1.5">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter HUD - EXACT match with Approval Center tabs style */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0" style={{ WebkitOverflowScrolling: 'touch' }}>
        {['all', 'approved', 'pending', 'rejected'].map((status) => {
          const count = status === 'all' 
            ? dealers.length 
            : dealers.filter(d => d.status === status).length;
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

      {/* Enterprise Dealer Table - EXACT border, background and hover transition as Approval Center card */}
      <div className="bg-white dark:bg-[#161617] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B] pl-6">Business Identity</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B]">Verification Status</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B]">Service Tier</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B]">Inventory Health</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B] text-right pr-6">Command</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.03]">
              <AnimatePresence mode="popLayout">
                {filteredDealers.map((dealer, idx) => (
                  <motion.tr 
                    key={dealer.uid}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleAction('inspect', dealer)}
                    className="group border-b border-black/[0.03] dark:border-white/[0.03] last:border-b-0 hover:bg-[#F5F5F7]/40 dark:hover:bg-white/[0.01] transition-all cursor-pointer"
                  >
                    <td className="py-4.5 pl-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 rounded-xl border border-black/[0.06] dark:border-white/[0.06] shadow-none group-hover:scale-105 transition-transform">
                          <AvatarImage src={dealer.photoURL} />
                          <AvatarFallback className="bg-apple-blue text-white font-semibold text-sm">{dealer.businessName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-sm tracking-tight text-[#1D1D1F] dark:text-white flex items-center gap-2">
                             {dealer.businessName}
                             {dealer.rating > 0 && (
                               <div className="flex items-center gap-1 bg-apple-orange/10 text-apple-orange px-2 py-0.5 rounded-lg text-[9px] font-bold">
                                 <Star className="w-2.5 h-2.5 fill-current" /> {dealer.rating}
                               </div>
                             )}
                          </div>
                          <div className="text-[10px] font-medium text-[#86868B] mt-0.5">License: <span className="font-mono text-apple-text/80">{dealer.licenseNumber}</span></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4.5">
                       <div className="flex flex-col gap-1.5">
                          <Badge className={cn(
                            "w-fit px-2 py-0.5 rounded-lg font-bold text-[9px] uppercase tracking-wider border-none shadow-none",
                            dealer.status === 'approved' ? "bg-apple-green/10 text-apple-green" : 
                            dealer.status === 'pending' ? "bg-apple-orange/10 text-apple-orange" : "bg-apple-red/10 text-apple-red"
                          )}>
                            {dealer.status}
                          </Badge>
                          {dealer.verifiedAt ? (
                            <div className="text-[9px] font-medium text-[#86868B] flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-apple-green" /> Verified {new Date(dealer.verifiedAt).toLocaleDateString()}
                            </div>
                          ) : (
                            <div className="text-[9px] font-medium text-[#86868B] flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" /> Awaiting Review
                            </div>
                          )}
                       </div>
                    </td>
                    <td className="py-4.5">
                       <div className="flex items-center gap-2.5">
                          <div className={cn("p-1.5 rounded-lg", dealer.subscriptionPlan === 'Platinum' ? "bg-purple-500/10 text-purple-500" : "bg-apple-blue/10 text-apple-blue")}>
                             <Crown className="w-4 h-4" />
                          </div>
                          <div>
                             <div className="font-semibold text-xs text-[#1D1D1F] dark:text-white">{dealer.subscriptionPlan}</div>
                             <div className="text-[9px] font-medium text-[#86868B]">Enterprise Tier</div>
                          </div>
                       </div>
                    </td>
                    <td className="py-4.5">
                       <div className="flex flex-col gap-2">
                          <div className="text-xs font-semibold text-[#1D1D1F] dark:text-white tracking-tight">{dealer.activeListings} Active Units</div>
                          <div className="flex items-center gap-0.5">
                             {[...Array(5)].map((_, i) => (
                               <div key={i} className={cn("h-1 w-5 rounded-full", i < (dealer.activeListings / 5) ? "bg-apple-green" : "bg-apple-gray dark:bg-white/10")} />
                             ))}
                          </div>
                       </div>
                    </td>
                    <td className="py-4.5 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger className={cn(
                          "h-9 w-9 rounded-xl flex items-center justify-center transition-all hover:bg-apple-gray dark:hover:bg-white/10 text-[#86868B] active:scale-95 shadow-none"
                        )}>
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 rounded-2xl border-apple-border/10 p-2.5 backdrop-blur-2xl bg-white/95 dark:bg-[#1D1D1F]/95 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                          <DropdownMenuItem onClick={() => handleAction('inspect', dealer)} className="rounded-xl py-3 px-4 font-bold text-xs cursor-pointer">
                             <Briefcase className="w-4 h-4 mr-3 text-apple-blue" /> Business Performance
                          </DropdownMenuItem>
                          {dealer.status === 'pending' && (
                             <DropdownMenuItem onClick={() => handleAction('approve', dealer)} className="rounded-xl py-3 px-4 font-bold text-xs cursor-pointer text-apple-green focus:bg-apple-green/10">
                                <FileCheck className="w-4 h-4 mr-3" /> Approve Registration
                             </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleAction('message', dealer)} className="rounded-xl py-3 px-4 font-bold text-xs cursor-pointer">
                             <MessageSquare className="w-4 h-4 mr-3 text-purple-500" /> Professional Bridge
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-2 bg-apple-border/10" />
                          <DropdownMenuItem onClick={() => handleAction('billing', dealer)} className="rounded-xl py-3 px-4 font-bold text-xs cursor-pointer">
                             <ArrowUpRight className="w-4 h-4 mr-3 text-apple-orange" /> Subscription Hub
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('revoke', dealer)} className="rounded-xl py-3 px-4 font-bold text-xs cursor-pointer text-apple-red focus:bg-apple-red/10 focus:text-apple-red">
                             <Ban className="w-4 h-4 mr-3" /> Revoke Business License
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Enterprise Partner Detail Shard */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-[92vw] lg:max-w-5xl h-[85vh] max-h-[85vh] p-0 overflow-hidden border-none rounded-[2.5rem] bg-white dark:bg-[#1D1D1F] shadow-2xl flex flex-col">
          {selectedDealer && editDealer && (
            <Tabs defaultValue="dossier" className="flex flex-col h-full overflow-hidden">
              {/* Header */}
              <header className="p-6 border-b border-apple-border/10 flex items-center justify-between bg-neutral-50 dark:bg-white/[0.02] shrink-0">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 rounded-2xl border border-apple-border/10 shadow-sm shrink-0">
                    <AvatarImage src={selectedDealer.photoURL} referrerPolicy="no-referrer" />
                    <AvatarFallback className="bg-apple-blue text-white font-black text-xl">
                      {selectedDealer.businessName?.charAt(0) || <Store className="w-7 h-7" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold text-[#1D1D1F] dark:text-white leading-tight flex items-center gap-2">
                      {selectedDealer.businessName}
                      {selectedDealer.status === 'approved' && <ShieldCheck className="w-5 h-5 text-apple-green" />}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <Badge className={cn(
                        "px-2 py-0.5 rounded-full border-none text-[8px] uppercase font-black tracking-widest text-white shadow-none",
                        selectedDealer.status === 'approved' ? "bg-apple-green" : 
                        selectedDealer.status === 'pending' ? "bg-apple-orange" : "bg-apple-red"
                      )}>
                        {selectedDealer.status} Status
                      </Badge>
                      <Badge className="bg-purple-600 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border-none">
                        {selectedDealer.subscriptionPlan || 'Platinum'} Plan
                      </Badge>
                      {selectedDealer.dealerTypes && selectedDealer.dealerTypes.map((type: string) => (
                        <Badge key={type} className="bg-[#F5F5F7] dark:bg-white/5 text-[#86868B] text-[8px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border border-apple-border/5">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <TabsList className="bg-[#F5F5F7] dark:bg-white/5 p-1 rounded-xl">
                    <TabsTrigger value="dossier" className="rounded-lg text-xs font-bold px-3 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-apple-blue">
                      Business Dossier
                    </TabsTrigger>
                    <TabsTrigger value="override" className="rounded-lg text-xs font-bold px-3 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-apple-blue flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" /> Overrule Control
                    </TabsTrigger>
                  </TabsList>
                  <Button variant="ghost" className="rounded-full h-8 w-8 p-0 hover:bg-[#F5F5F7] dark:hover:bg-white/5" onClick={() => setIsDetailsOpen(false)}>
                    ✕
                  </Button>
                </div>
              </header>

              <TabsContent value="dossier" className="flex-1 m-0 outline-none flex flex-col overflow-hidden">
                {/* Main Contents (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
                {/* Section 1: Business Profile & Key Statistics */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-apple-text-muted">Business Portfolio & Key Stats</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Merchant Standing', value: selectedDealer.status === 'approved' ? 'Verified Partner' : 'Uncertified', icon: ShieldCheck, color: 'text-apple-green bg-apple-green/5 border-apple-green/10' },
                      { label: 'Subscription Plan', value: selectedDealer.subscriptionPlan || 'Platinum Member', icon: Crown, color: 'text-purple-500 bg-purple-500/5 border-purple-500/10' },
                      { label: 'Staff Strength', value: selectedDealer.employeesCount ? `${selectedDealer.employeesCount} Employees` : '5-10 staff', icon: Briefcase, color: 'text-apple-blue bg-apple-blue/5 border-apple-blue/10' },
                      { label: 'Active Fleet Size', value: selectedDealer.inventorySize ? `${selectedDealer.inventorySize} Vehicles` : '15+ Units', icon: Car, color: 'text-apple-orange bg-apple-orange/5 border-apple-orange/10' },
                    ].map((spec, i) => (
                      <div key={i} className={cn("p-4.5 rounded-2xl border flex flex-col justify-between group", spec.color)}>
                        <spec.icon className="w-5 h-5 mb-3 group-hover:scale-110 transition-transform" />
                        <div>
                          <div className="text-[8px] font-black uppercase tracking-wider opacity-60 mb-1">{spec.label}</div>
                          <div className="font-bold text-xs tracking-tight truncate">{spec.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 2: Detailed Business Dossier Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: General & Legal Records */}
                  <div className="p-6 rounded-[2rem] bg-[#F5F5F7] dark:bg-white/[0.02] border border-apple-border/5 space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-text-muted flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-apple-blue" /> Legal & Corporate Identity
                    </h4>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs font-semibold text-[#1D1D1F] dark:text-zinc-200">
                      <div>
                        <span className="text-[8px] font-bold text-[#86868B] uppercase block">Owner Name</span>
                        <span className="font-bold mt-1 block">{selectedDealer.ownerName || selectedDealer.dealerName || 'Not configured'}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-[#86868B] uppercase block">Years in Business</span>
                        <span className="font-bold mt-1 block">{selectedDealer.yearsInBusiness || '1'} year(s)</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-[#86868B] uppercase block">Business License #</span>
                        <span className="font-bold mt-1 block font-mono">{selectedDealer.licenseNumber || selectedDealer.registrationNumber || 'Not configured'}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-[#86868B] uppercase block">Corporate NTN #</span>
                        <span className="font-bold mt-1 block font-mono">{selectedDealer.taxNumber || 'Not configured'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Telephony & Digital Reach */}
                  <div className="p-6 rounded-[2rem] bg-[#F5F5F7] dark:bg-white/[0.02] border border-apple-border/5 space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-text-muted flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-apple-green" /> Digital Channels & Location
                    </h4>
                    <div className="space-y-3.5 text-xs text-[#1D1D1F] dark:text-zinc-200">
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-[#86868B]" />
                        <span className="font-semibold">{selectedDealer.email}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Phone className="w-4 h-4 text-[#86868B]" />
                        <span className="font-semibold">{selectedDealer.phone || 'Not configured'}</span>
                      </div>
                      {selectedDealer.whatsapp && (
                        <div className="flex items-center gap-2.5">
                          <MessageSquare className="w-4 h-4 text-apple-green" />
                          <span className="font-bold">WhatsApp: <span className="text-apple-green">{selectedDealer.whatsapp}</span></span>
                        </div>
                      )}
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-[#86868B] shrink-0 mt-0.5" />
                        <span className="font-semibold leading-relaxed">
                          {selectedDealer.address ? `${selectedDealer.address}, ` : ''}
                          {selectedDealer.city || ''}, {selectedDealer.country || ''}
                        </span>
                      </div>
                      {selectedDealer.website && (
                        <div className="flex items-center gap-2.5 pt-1.5 border-t border-apple-border/5">
                          <Globe className="w-4 h-4 text-apple-blue" />
                          <a href={selectedDealer.website} target="_blank" rel="noopener noreferrer" className="text-apple-blue hover:underline font-bold flex items-center gap-1">
                            Visit Business Website <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                {selectedDealer.socialLinks && (Object.values(selectedDealer.socialLinks).some(Boolean)) && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-text-muted">Connected Social Platforms</h4>
                    <div className="flex flex-wrap gap-4 text-xs font-bold text-[#1D1D1F] dark:text-white bg-[#F5F5F7] dark:bg-white/[0.02] p-4.5 rounded-2xl border border-apple-border/5">
                      {selectedDealer.socialLinks.facebook && (
                        <a href={selectedDealer.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-apple-blue hover:opacity-80 flex items-center gap-1.5">
                          Facebook ↗
                        </a>
                      )}
                      {selectedDealer.socialLinks.instagram && (
                        <a href={selectedDealer.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:opacity-80 flex items-center gap-1.5">
                          Instagram ↗
                        </a>
                      )}
                      {selectedDealer.socialLinks.linkedin && (
                        <a href={selectedDealer.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#0077B5] hover:opacity-80 flex items-center gap-1.5">
                          LinkedIn ↗
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Section 3: Brand Narrative / Observations */}
                {selectedDealer.description && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-text-muted px-1">Brand Narrative & Operations Statement</h4>
                    <div className="p-5 rounded-3xl bg-[#F5F5F7] dark:bg-white/[0.02] border border-apple-border/5">
                      <p className="text-xs font-semibold leading-relaxed text-[#1D1D1F]/80 dark:text-zinc-300">
                        {selectedDealer.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Section 4: VERIFICATION ATTACHMENTS & SECURE DOCUMENTS (CRITICAL USER REQUEST) */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-apple-text-muted px-1 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-apple-blue" /> Verified Legal Documentation & Uploaded Attachments
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Attachment 1: Trade License */}
                    <div className="bg-[#F5F5F7] dark:bg-white/[0.02] border border-apple-border/5 rounded-[2rem] p-5 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[8px] font-black uppercase tracking-wider text-apple-blue">Trade License</span>
                          <span className="text-[7px] font-black uppercase tracking-wider text-apple-green bg-apple-green/5 px-2 py-0.5 rounded-full">Secure Scan</span>
                        </div>
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 border border-apple-border/5 group">
                          <img 
                            src={selectedDealer.tradeLicense || (selectedDealer.documents && selectedDealer.documents[0]) || 'https://picsum.photos/seed/license/800/600'} 
                            alt="Trade License"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          <a 
                            href={selectedDealer.tradeLicense || (selectedDealer.documents && selectedDealer.documents[0]) || 'https://picsum.photos/seed/license/800/600'} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 font-bold text-white text-xs gap-1.5"
                          >
                            Inspect Attachment <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                      <a 
                        href={selectedDealer.tradeLicense || (selectedDealer.documents && selectedDealer.documents[0]) || 'https://picsum.photos/seed/license/800/600'} 
                        download="Trade_License.png"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full"
                      >
                        <Button variant="outline" className="w-full rounded-xl text-[9px] font-bold uppercase tracking-wider h-9 gap-1.5 border-apple-border/15">
                          <Download className="w-3.5 h-3.5" /> Download Trade License
                        </Button>
                      </a>
                    </div>

                    {/* Attachment 2: Owner ID / National ID */}
                    <div className="bg-[#F5F5F7] dark:bg-white/[0.02] border border-apple-border/5 rounded-[2rem] p-5 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[8px] font-black uppercase tracking-wider text-apple-blue">National ID / CNIC</span>
                          <span className="text-[7px] font-black uppercase tracking-wider text-apple-green bg-apple-green/5 px-2 py-0.5 rounded-full">Biometric Match</span>
                        </div>
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 border border-apple-border/5 group">
                          <img 
                            src={selectedDealer.nationalId || (selectedDealer.documents && selectedDealer.documents[1]) || 'https://picsum.photos/seed/id/800/600'} 
                            alt="National ID / CNIC Scan"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          <a 
                            href={selectedDealer.nationalId || (selectedDealer.documents && selectedDealer.documents[1]) || 'https://picsum.photos/seed/id/800/600'} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 font-bold text-white text-xs gap-1.5"
                          >
                            Inspect Attachment <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                      <a 
                        href={selectedDealer.nationalId || (selectedDealer.documents && selectedDealer.documents[1]) || 'https://picsum.photos/seed/id/800/600'} 
                        download="Owner_ID.png"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full"
                      >
                        <Button variant="outline" className="w-full rounded-xl text-[9px] font-bold uppercase tracking-wider h-9 gap-1.5 border-apple-border/15">
                          <Download className="w-3.5 h-3.5" /> Download ID Card
                        </Button>
                      </a>
                    </div>

                    {/* Attachment 3: Business Documents */}
                    <div className="bg-[#F5F5F7] dark:bg-white/[0.02] border border-apple-border/5 rounded-[2rem] p-5 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[8px] font-black uppercase tracking-wider text-apple-blue">Business Registration</span>
                          <span className="text-[7px] font-black uppercase tracking-wider text-apple-green bg-apple-green/5 px-2 py-0.5 rounded-full">Active Ledger</span>
                        </div>
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 border border-apple-border/5 group">
                          <img 
                            src={selectedDealer.businessDocuments?.[0] || (selectedDealer.documents && selectedDealer.documents[2]) || 'https://picsum.photos/seed/biz/800/600'} 
                            alt="Business Registration Document"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          <a 
                            href={selectedDealer.businessDocuments?.[0] || (selectedDealer.documents && selectedDealer.documents[2]) || 'https://picsum.photos/seed/biz/800/600'} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 font-bold text-white text-xs gap-1.5"
                          >
                            Inspect Attachment <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                      <a 
                        href={selectedDealer.businessDocuments?.[0] || (selectedDealer.documents && selectedDealer.documents[2]) || 'https://picsum.photos/seed/biz/800/600'} 
                        download="Business_Reg.png"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full"
                      >
                        <Button variant="outline" className="w-full rounded-xl text-[9px] font-bold uppercase tracking-wider h-9 gap-1.5 border-apple-border/15">
                          <Download className="w-3.5 h-3.5" /> Download Registry
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <footer className="p-6 border-t border-apple-border/10 bg-neutral-50 dark:bg-white/[0.02] flex justify-end gap-3 shrink-0">
                <Button 
                  variant="outline" 
                  className="rounded-xl px-5 font-bold text-xs hover:bg-[#F5F5F7] dark:hover:bg-white/5" 
                  onClick={() => setIsDetailsOpen(false)}
                >
                  Close Profile
                </Button>
                {selectedDealer.status === 'pending' && (
                  <>
                    <Button 
                      variant="outline"
                      className="rounded-xl px-5 font-bold text-xs text-apple-red border-apple-red/20 hover:bg-apple-red/5"
                      onClick={() => { setIsDetailsOpen(false); setIsRevokeOpen(true); }}
                    >
                      Deny Partnership
                    </Button>
                    <Button 
                      className="rounded-xl px-5 font-bold text-xs bg-apple-blue hover:bg-apple-blue/90 text-white border-none shadow-md"
                      onClick={() => { setIsDetailsOpen(false); setIsApprovalOpen(true); }}
                    >
                      Verify Business Partner
                    </Button>
                  </>
                )}
              </footer>
              </TabsContent>

              {/* Tab 2: Overrule Control (Attributes Form) */}
              <TabsContent value="override" className="flex-1 m-0 outline-none flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
                  <div className="bg-[#F5F5F7] dark:bg-white/[0.02] p-6 rounded-3xl border border-apple-border/5 space-y-2">
                    <h3 className="text-sm font-bold flex items-center gap-1.5 text-apple-blue">
                      <Shield className="w-4 h-4" /> Dealer Partnership administrative overrides
                    </h3>
                    <p className="text-xs text-[#86868B] leading-relaxed font-medium">
                      Control the subscription billing plan, active fleet sizes, corporate standing, license details, and contact coordinates of this verified dealer. Edits here synchronize instantly in the database records.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Column 1: Business Operations */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-[#86868B] px-1">Business Identity Parameters</h4>
                      
                      <div className="space-y-3 bg-[#F5F5F7] dark:bg-white/[0.01] p-5 rounded-3xl border border-apple-border/5">
                        <div>
                          <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">Business / Brand Name</label>
                          <Input 
                            value={editDealer.businessName || ""} 
                            onChange={(e) => setEditDealer({ ...editDealer, businessName: e.target.value })}
                            className="bg-white dark:bg-zinc-900 border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-bold text-xs" 
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">Owner Legal Name</label>
                          <Input 
                            value={editDealer.ownerName || editDealer.displayName || editDealer.dealerName || ""} 
                            onChange={(e) => setEditDealer({ ...editDealer, ownerName: e.target.value, displayName: e.target.value })}
                            className="bg-white dark:bg-zinc-900 border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-medium text-xs" 
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">Years Operational</label>
                            <Input 
                              type="number"
                              value={editDealer.yearsInBusiness || 1} 
                              onChange={(e) => setEditDealer({ ...editDealer, yearsInBusiness: Number(e.target.value) })}
                              className="bg-white dark:bg-zinc-900 border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-bold text-xs" 
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">Staff Count</label>
                            <Input 
                              type="number"
                              value={editDealer.employeesCount || 5} 
                              onChange={(e) => setEditDealer({ ...editDealer, employeesCount: Number(e.target.value) })}
                              className="bg-white dark:bg-zinc-900 border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-bold text-xs" 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">Fleet Inventory Cap</label>
                            <Input 
                              type="number"
                              value={editDealer.inventorySize || 10} 
                              onChange={(e) => setEditDealer({ ...editDealer, inventorySize: Number(e.target.value) })}
                              className="bg-white dark:bg-zinc-900 border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-bold text-xs" 
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">Merchant Rating</label>
                            <Input 
                              type="number"
                              step="0.1"
                              min="0"
                              max="5"
                              value={editDealer.rating || 0} 
                              onChange={(e) => setEditDealer({ ...editDealer, rating: Number(e.target.value) })}
                              className="bg-white dark:bg-zinc-900 border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-bold text-xs" 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">Government License #</label>
                            <Input 
                              value={editDealer.licenseNumber || editDealer.registrationNumber || ""} 
                              onChange={(e) => setEditDealer({ ...editDealer, licenseNumber: e.target.value })}
                              className="bg-white dark:bg-zinc-900 border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-mono text-xs uppercase" 
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">NTN / Tax ID</label>
                            <Input 
                              value={editDealer.taxNumber || editDealer.ntnNumber || ""} 
                              onChange={(e) => setEditDealer({ ...editDealer, taxNumber: e.target.value, ntnNumber: e.target.value })}
                              className="bg-white dark:bg-zinc-900 border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-mono text-xs uppercase" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Governance & Communications */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-[#86868B] px-1">Partnership Levels & Communications</h4>

                      <div className="space-y-3 bg-[#F5F5F7] dark:bg-white/[0.01] p-5 rounded-3xl border border-apple-border/5">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">Partnership Status</label>
                            <select 
                              value={editDealer.status} 
                              onChange={(e) => setEditDealer({ ...editDealer, status: e.target.value as any })}
                              className="w-full bg-white dark:bg-zinc-900 border border-apple-border/10 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-apple-blue/30 text-stone-900 dark:text-zinc-100"
                            >
                              <option value="pending">Pending Partnership</option>
                              <option value="approved">Approved & Verified</option>
                              <option value="rejected">Rejected Application</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">Subscription Plan</label>
                            <select 
                              value={editDealer.subscriptionPlan || "Basic"} 
                              onChange={(e) => setEditDealer({ ...editDealer, subscriptionPlan: e.target.value })}
                              className="w-full bg-white dark:bg-zinc-900 border border-apple-border/10 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-apple-blue/30 text-stone-900 dark:text-zinc-100"
                            >
                              <option value="Basic">Basic Plan</option>
                              <option value="Professional">Professional Plan</option>
                              <option value="Platinum">Platinum Enterprise</option>
                              <option value="Diamond">Diamond Elite</option>
                              <option value="Corporate Custom">Corporate Custom</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">Business Email</label>
                          <Input 
                            type="email"
                            value={editDealer.email || ""} 
                            onChange={(e) => setEditDealer({ ...editDealer, email: e.target.value })}
                            className="bg-white dark:bg-zinc-900 border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-medium text-xs" 
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">Business Phone Number</label>
                          <Input 
                            value={editDealer.phoneNumber || editDealer.phone || ""} 
                            onChange={(e) => setEditDealer({ ...editDealer, phoneNumber: e.target.value, phone: e.target.value })}
                            className="bg-white dark:bg-zinc-900 border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-medium text-xs" 
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">WhatsApp Broadcast Link</label>
                          <Input 
                            value={editDealer.whatsapp || ""} 
                            onChange={(e) => setEditDealer({ ...editDealer, whatsapp: e.target.value })}
                            className="bg-white dark:bg-zinc-900 border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-medium text-xs" 
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">Website URL</label>
                          <Input 
                            value={editDealer.website || ""} 
                            onChange={(e) => setEditDealer({ ...editDealer, website: e.target.value })}
                            className="bg-white dark:bg-zinc-900 border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-medium text-xs" 
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">City Headquarter</label>
                            <Input 
                              value={editDealer.city || ""} 
                              onChange={(e) => setEditDealer({ ...editDealer, city: e.target.value })}
                              className="bg-white dark:bg-zinc-900 border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-medium text-xs" 
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">Country</label>
                            <Input 
                              value={editDealer.country || ""} 
                              onChange={(e) => setEditDealer({ ...editDealer, country: e.target.value })}
                              className="bg-white dark:bg-zinc-900 border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-medium text-xs" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#86868B] px-1 block mb-1">Main Headquarters Physical Address</label>
                    <textarea 
                      value={editDealer.address || ""} 
                      onChange={(e) => setEditDealer({ ...editDealer, address: e.target.value })}
                      placeholder="Input verified corporate physical coordinates..."
                      className="w-full h-16 p-4 bg-[#F5F5F7] dark:bg-white/[0.01] border border-apple-border/10 focus:border-apple-blue/30 rounded-3xl text-xs font-semibold focus:ring-0 outline-none text-stone-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Overrule Save Footer */}
                <footer className="p-6 border-t border-apple-border/10 bg-neutral-50 dark:bg-white/[0.02] flex justify-end gap-3 shrink-0 flex-wrap">
                  <Button 
                    variant="outline" 
                    className="rounded-xl px-5 font-bold text-xs hover:bg-[#F5F5F7] dark:hover:bg-white/5" 
                    onClick={() => setIsDetailsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="rounded-xl px-5 font-bold text-xs bg-apple-blue hover:bg-apple-blue/90 text-white border-none shadow-lg shadow-apple-blue/15 active:scale-95" 
                    onClick={async () => {
                      try {
                        const { uid, ...updateData } = editDealer;
                        await updateDoc(doc(db, "users", selectedDealer.uid), {
                          ...updateData,
                          updatedAt: new Date().toISOString()
                        });
                        setSelectedDealer(editDealer);
                        setDealers(prev => prev.map(d => d.uid === selectedDealer.uid ? editDealer : d));
                        toast.success("Merchant Overrides Secured", {
                          description: `Business specifications for ${editDealer.businessName} have been secured.`
                        });
                      } catch (err) {
                        toast.error("Cloud registry update aborted.");
                      }
                    }}
                  >
                    Save Overrule Changes
                  </Button>
                </footer>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval/Rejection Action */}
      <Dialog open={isApprovalOpen} onOpenChange={setIsApprovalOpen}>
        <DialogContent className="max-w-sm rounded-[28px] border-apple-border/20 bg-white dark:bg-[#1D1D1F] p-6 overflow-hidden">
          <div className="text-center relative">
            <div className="w-12 h-12 rounded-xl bg-apple-blue/10 flex items-center justify-center mx-auto mb-4">
               <Building2 className="w-6 h-6 text-apple-blue" />
            </div>
            <DialogTitle className="text-lg font-bold tracking-tight mb-2">Verification Audit</DialogTitle>
            <DialogDescription className="text-[10px] font-medium text-apple-text-muted mb-6 leading-relaxed">
              Legal standing of <span className="text-apple-text font-bold">{selectedDealer?.businessName}</span>.
            </DialogDescription>
            <div className="grid grid-cols-1 gap-2">
               <Button className="rounded-xl h-10 bg-apple-green text-white font-bold text-xs hover:bg-apple-green/90 shadow-lg border-none active:scale-95 transition-all" onClick={() => processDealer('approved')}>
                  <FileCheck className="w-3.5 h-3.5 mr-2" /> Approve Registration
               </Button>
               <Button variant="outline" className="rounded-xl h-10 border-apple-border/20 text-apple-red font-bold text-xs hover:bg-apple-red/5 hover:text-apple-red active:scale-95 transition-all" onClick={() => processDealer('rejected')}>
                  <FileX className="w-3.5 h-3.5 mr-2" /> Reject Application
               </Button>
               <Button variant="ghost" className="rounded-xl h-9 font-bold text-[10px] text-apple-text-muted active:scale-95 transition-all" onClick={() => setIsApprovalOpen(false)}>
                  Defer Decision
               </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Revocation Confirmation */}
      <Dialog open={isRevokeOpen} onOpenChange={setIsRevokeOpen}>
        <DialogContent className="max-w-[320px] rounded-[32px] border-apple-border/20 bg-white dark:bg-[#1D1D1F] p-8 overflow-hidden">
          <div className="text-center relative">
            <div className="w-16 h-16 rounded-2xl bg-apple-red/10 flex items-center justify-center mx-auto mb-6">
               <Ban className="w-8 h-8 text-apple-red" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight mb-3 text-apple-red">Terminate?</DialogTitle>
            <DialogDescription className="text-[11px] font-medium text-apple-text-muted mb-8 leading-relaxed">
              This will immediately revoke the business license for <span className="text-apple-text font-bold">{selectedDealer?.businessName}</span>.
            </DialogDescription>
            <div className="grid grid-cols-1 gap-3">
               <Button className="rounded-xl h-12 bg-apple-red text-white font-bold text-sm shadow-apple-red/20 shadow-lg border-none active:scale-95 transition-all" onClick={() => processDealer('rejected')}>
                  Confirm Termination
               </Button>
               <Button variant="ghost" className="rounded-xl h-10 font-bold text-xs text-apple-text-muted active:scale-95 transition-all" onClick={() => setIsRevokeOpen(false)}>
                  Cancel Operation
               </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
