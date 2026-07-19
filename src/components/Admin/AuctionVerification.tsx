import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  MoreVertical, 
  Car, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  Download,
  Activity,
  User,
  MapPin,
  Calendar,
  Gauge,
  Zap,
  Shield,
  FileCheck,
  FileX,
  Eye,
  Settings,
  Info,
  History,
  MessageSquare,
  Lock,
  ChevronRight,
  ExternalLink,
  Trash2,
  Plus,
  Star,
  Building2,
  Image as ImageIcon,
  Save,
  Loader2
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
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ApprovalRequest, Vehicle } from "@/types";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/firebase";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AuctionCompany {
  id: string;
  name: string;
  logoUrl: string;
  verificationFee: string;
  reportTurnaround: string;
  coverageAuctions: string;
  description: string;
  contactPhone: string;
  contactEmail: string;
  isFeatured: boolean;
  order: number;
  status: 'active' | 'hidden';
  createdAt?: any;
  updatedAt?: any;
}

// Mock Data for Auction Verifications
const mockRequests: (ApprovalRequest & { vehicle: Vehicle })[] = [
  {
    id: 'req_1',
    type: 'auction_verification',
    status: 'pending',
    createdBy: 'user_101',
    targetId: 'v_001',
    newData: { inspectionType: 'Physical', priority: 'High', inspectorId: 'ins_9' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    vehicle: {
      id: 'v_001',
      make: 'Toyota',
      model: 'Land Cruiser',
      year: 2023,
      price: 65000000,
      mileage: 1200,
      location: 'Lahore',
      city: 'Lahore',
      images: ['https://picsum.photos/seed/lc300/800/600'],
      type: 'car',
      condition: 'used',
      transmission: 'automatic',
      fuelType: 'diesel',
      engineSize: '3300cc',
      seller: { name: 'Ali Ahmed', isVerified: true, rating: 4.8 },
      createdAt: new Date().toISOString(),
    }
  },
  {
    id: 'req_2',
    type: 'auction_verification',
    status: 'approved',
    createdBy: 'user_202',
    targetId: 'v_002',
    newData: { inspectionType: 'Digital', priority: 'Standard', inspectorId: 'ins_4' },
    reviewedBy: 'admin_1',
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    vehicle: {
      id: 'v_002',
      make: 'Honda',
      model: 'Civic RS',
      year: 2022,
      price: 9500000,
      mileage: 15000,
      location: 'Karachi',
      city: 'Karachi',
      images: ['https://picsum.photos/seed/civic/800/600'],
      type: 'car',
      condition: 'used',
      transmission: 'automatic',
      fuelType: 'petrol',
      engineSize: '1500cc',
      seller: { name: 'M. Kashif', isVerified: false, rating: 4.2 },
      createdAt: new Date().toISOString(),
    }
  },
  {
    id: 'req_3',
    type: 'auction_verification',
    status: 'pending',
    createdBy: 'user_303',
    targetId: 'v_003',
    newData: { inspectionType: 'Full Certificate', priority: 'Critical', inspectorId: 'ins_12' },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    vehicle: {
      id: 'v_003',
      make: 'Tesla',
      model: 'Model Y',
      year: 2024,
      price: 28000000,
      mileage: 50,
      location: 'Islamabad',
      city: 'Islamabad',
      images: ['https://picsum.photos/seed/teslay/800/600'],
      type: 'car',
      condition: 'new',
      transmission: 'automatic',
      fuelType: 'electric',
      engineSize: 'Dual Motor',
      seller: { name: 'Electric Hub', isVerified: true, rating: 5.0 },
      createdAt: new Date().toISOString(),
    }
  }
];

export default function AuctionVerification() {
  const [requests, setRequests] = useState(mockRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<typeof mockRequests[0] | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isProcessOpen, setIsProcessOpen] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<"approved" | "rejected" | null>(null);

  // New tab state
  const [activeTab, setActiveTab] = useState<'requests' | 'companies'>('requests');

  // Auction Companies states
  const [companies, setCompanies] = useState<AuctionCompany[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<AuctionCompany | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [companyForm, setCompanyForm] = useState<Omit<AuctionCompany, 'id'>>({
    name: '',
    logoUrl: '',
    verificationFee: 'Rs. 2,500',
    reportTurnaround: '3 Hours',
    coverageAuctions: 'USS Tokyo, JU, CAA, JAA',
    description: '',
    contactPhone: '',
    contactEmail: '',
    isFeatured: false,
    order: 0,
    status: 'active'
  });

  useEffect(() => {
    const q = query(collection(db, 'auction_companies'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuctionCompany));
      setCompanies(docs);
      setCompaniesLoading(false);
    }, (error) => {
      console.error("Error loading auction companies:", error);
      toast.error("Error fetching verification providers");
      setCompaniesLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB");
      return;
    }

    setIsUploadingLogo(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCompanyForm(prev => ({ ...prev, logoUrl: reader.result as string }));
      setIsUploadingLogo(false);
      toast.success("Logo processed successfully");
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
      setIsUploadingLogo(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      if (editingCompany) {
        await updateDoc(doc(db, 'auction_companies', editingCompany.id), {
          ...companyForm,
          updatedAt: serverTimestamp()
        });
        toast.success("Verification provider updated successfully");
      } else {
        await addDoc(collection(db, 'auction_companies'), {
          ...companyForm,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        toast.success("Verification provider added successfully");
      }
      setIsCompanyModalOpen(false);
      setEditingCompany(null);
      resetCompanyForm();
    } catch (error) {
      console.error("Error saving auction provider:", error);
      toast.error("Failed to save provider");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this verification provider?")) return;
    try {
      await deleteDoc(doc(db, 'auction_companies', id));
      toast.success("Verification provider removed");
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error("Failed to remove verification provider");
    }
  };

  const resetCompanyForm = () => {
    setCompanyForm({
      name: '',
      logoUrl: '',
      verificationFee: 'Rs. 2,500',
      reportTurnaround: '3 Hours',
      coverageAuctions: 'USS Tokyo, JU, CAA, JAA',
      description: '',
      contactPhone: '',
      contactEmail: '',
      isFeatured: false,
      order: 0,
      status: 'active'
    });
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = `${r.vehicle.make} ${r.vehicle.model} ${r.vehicle.id} ${r.id}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAction = (type: string, request: typeof mockRequests[0]) => {
    setSelectedRequest(request);
    switch(type) {
      case 'inspect':
        setIsDetailsOpen(true);
        break;
      case 'process':
        setIsProcessOpen(true);
        break;
      case 'view_listing':
        toast.info("Opening Public Listing", {
          description: `Redirecting to live page for ${request.vehicle.year} ${request.vehicle.make} ${request.vehicle.model}.`
        });
        break;
      case 'history':
        toast.info("Verification History", {
          description: `Retrieving audit trail for target ID ${request.targetId}.`
        });
        break;
    }
  };

  const finalizeVerification = (status: "approved" | "rejected") => {
    if (!selectedRequest) return;
    
    setRequests(prev => prev.map(r => 
      r.id === selectedRequest.id 
        ? { ...r, status, reviewedAt: new Date().toISOString(), reviewedBy: 'current_admin' } 
        : r
    ));

    toast(status === 'approved' ? 'Verification Certified' : 'Verification Denied', {
      description: `Target ID ${selectedRequest.targetId} has been ${status}.`,
      icon: status === 'approved' ? <ShieldCheck className="w-5 h-5 text-apple-green" /> : <Shield className="w-5 h-5 text-apple-red" />
    });

    setIsProcessOpen(false);
    setIsDetailsOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions - EXACT match with Approval Center layout and sizing */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 pb-6 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Administration Console
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-tight">
            Auction Verification Hub
          </h1>
          <p className="text-xs text-[#86868B] dark:text-[#86868B] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            Verify vehicle authenticity, auction sheet consistency, and physical inspection reports.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start md:self-end">
          {activeTab === 'requests' ? (
            <>
              <div className="relative group min-w-[200px] sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] group-focus-within:text-apple-blue transition-colors duration-300" />
                <input
                  type="text"
                  placeholder="Search verification records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#F5F5F7] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 rounded-xl text-xs font-medium focus:ring-0 outline-none transition-all duration-300 shadow-inner"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  className="rounded-xl border-black/[0.04] dark:border-white/[0.04] bg-white dark:bg-[#161617] h-9 px-4 text-xs font-bold shadow-sm hover:bg-[#F5F5F7] dark:hover:bg-white/5"
                  onClick={() => toast.success("Exporting Audit Logs", { description: "Current verification cycle data is being packaged." })}
                >
                  <Download className="w-3.5 h-3.5 mr-2" /> Export Audit
                </Button>
                <Button 
                  className="apple-button-primary bg-apple-blue text-white rounded-xl h-9 px-4 text-xs font-bold shadow-sm"
                  onClick={() => toast.info("New Inspection Task", { description: "Opening the manual verification entry wizard." })}
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-2" /> Manual Verify
                </Button>
              </div>
            </>
          ) : (
            <button
              onClick={() => {
                setEditingCompany(null);
                resetCompanyForm();
                setIsCompanyModalOpen(true);
              }}
              className="px-4.5 py-2.5 rounded-xl bg-apple-blue hover:bg-blue-600 text-white flex items-center gap-2 font-semibold text-xs transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Register Provider
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-black/[0.06] dark:border-white/[0.06] -mt-2">
        <button
          onClick={() => setActiveTab('requests')}
          className={cn(
            "pb-3.5 px-6 text-xs font-bold uppercase tracking-wider border-b-2 transition-all",
            activeTab === 'requests' 
              ? "border-apple-blue text-apple-blue" 
              : "border-transparent text-apple-text-muted hover:text-[#1D1D1F] dark:hover:text-white"
          )}
        >
          Verification Requests
        </button>
        <button
          onClick={() => setActiveTab('companies')}
          className={cn(
            "pb-3.5 px-6 text-xs font-bold uppercase tracking-wider border-b-2 transition-all",
            activeTab === 'companies' 
              ? "border-apple-blue text-apple-blue" 
              : "border-transparent text-apple-text-muted hover:text-[#1D1D1F] dark:hover:text-white"
          )}
        >
          Verification Agencies
        </button>
      </div>

      {activeTab === 'requests' ? (
        <div className="space-y-6">
          {/* Stats - EXACT match with Approval Center card format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Active Queue', value: '24', change: '8 Critical', icon: Clock, color: 'text-apple-blue', bg: 'bg-apple-blue/10' },
              { label: 'Verified Today', value: '156', change: '+12% Day', icon: FileCheck, color: 'text-apple-green', bg: 'bg-apple-green/10' },
              { label: 'Failed Checks', value: '12', change: 'Safety Flags', icon: AlertTriangle, color: 'text-apple-red', bg: 'bg-apple-red/10' },
              { label: 'Integrity Score', value: '98.4%', change: 'Excellent', icon: Shield, color: 'text-purple-500', bg: 'bg-purple-500/10' },
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
            {['all', 'pending', 'approved', 'rejected'].map((status) => {
              const count = status === 'all' 
                ? requests.length 
                : requests.filter(r => r.status === status).length;
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

          {/* Verification List Table - EXACT border, background and hover transition as Approval Center card */}
          <div className="bg-white dark:bg-[#161617] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B] pl-6">Target Entity</th>
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B]">Audit Status</th>
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B]">Verification Type</th>
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B]">Priority Level</th>
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B] text-right pr-6">Audit Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.03]">
                  <AnimatePresence mode="popLayout">
                    {filteredRequests.map((req, idx) => (
                      <motion.tr 
                        key={req.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => handleAction('inspect', req)}
                        className="group border-b border-black/[0.03] dark:border-white/[0.03] last:border-b-0 hover:bg-[#F5F5F7]/40 dark:hover:bg-white/[0.01] transition-all cursor-pointer"
                      >
                        <td className="py-4.5 pl-6">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-[#F5F5F7] dark:bg-white/5 flex items-center justify-center overflow-hidden border border-black/[0.06] dark:border-white/[0.06]">
                               <img src={req.vehicle.images[0]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div>
                              <div className="font-semibold text-sm tracking-tight text-[#1D1D1F] dark:text-white">{req.vehicle.year} {req.vehicle.make} {req.vehicle.model}</div>
                              <div className="text-[10px] font-medium text-[#86868B] flex items-center gap-1.5 mt-0.5">
                                 <span className="text-apple-blue">{req.targetId}</span> • {req.vehicle.location}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4.5">
                           <div className="flex flex-col gap-1.5">
                              <Badge className={cn(
                                "w-fit px-2 py-0.5 rounded-lg font-bold text-[9px] uppercase tracking-wider border-none shadow-none",
                                req.status === 'approved' ? "bg-apple-green/10 text-apple-green" : 
                                req.status === 'pending' ? "bg-apple-orange/10 text-apple-orange" : "bg-apple-red/10 text-apple-red"
                              )}>
                                {req.status}
                              </Badge>
                              <div className="text-[9px] font-medium text-[#86868B] flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" /> {new Date(req.createdAt).toLocaleDateString()}
                              </div>
                           </div>
                        </td>
                        <td className="py-4.5">
                           <div className="flex items-center gap-2.5">
                              <div className="p-1.5 rounded-lg bg-apple-blue/10 text-apple-blue">
                                  <ShieldCheck className="w-4 h-4" />
                              </div>
                              <div>
                                 <div className="font-semibold text-xs text-[#1D1D1F] dark:text-white">{req.newData.inspectionType}</div>
                                 <div className="text-[9px] font-medium text-[#86868B] mt-0.5">Audit Protocol</div>
                              </div>
                           </div>
                        </td>
                        <td className="py-4.5">
                           <div className="flex flex-col gap-1.5">
                              <div className={cn(
                                 "text-[9px] font-bold px-2 py-0.5 rounded-lg w-fit",
                                 req.newData.priority === 'Critical' ? "bg-apple-red/10 text-apple-red" :
                                 req.newData.priority === 'High' ? "bg-apple-orange/10 text-apple-orange" : "bg-[#F5F5F7] dark:bg-white/5 text-[#86868B]"
                              )}>
                                 {req.newData.priority}
                              </div>
                              <div className="h-1 w-20 bg-apple-gray dark:bg-white/10 rounded-full overflow-hidden">
                                 <div className={cn(
                                    "h-full rounded-full transition-all duration-1000",
                                    req.newData.priority === 'Critical' ? "bg-apple-red w-full" :
                                    req.newData.priority === 'High' ? "bg-apple-orange w-[70%]" : "bg-apple-blue w-[40%]"
                                 )} />
                              </div>
                           </div>
                        </td>
                        <td className="py-4.5 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger render={
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-apple-gray dark:hover:bg-white/10 active:scale-95 transition-all shadow-none">
                                <MoreVertical className="w-4 h-4 text-[#86868B]" />
                              </Button>
                            } />
                            <DropdownMenuContent align="end" className="w-64 rounded-2xl border-apple-border/10 p-2.5 backdrop-blur-2xl bg-white/95 dark:bg-[#1D1D1F]/95 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                              <DropdownMenuItem onClick={() => handleAction('inspect', req)} className="rounded-xl py-3 px-4 font-bold text-xs cursor-pointer">
                                 <Activity className="w-4 h-4 mr-3 text-apple-blue" /> Full Inspection
                              </DropdownMenuItem>
                              {req.status === 'pending' && (
                                 <DropdownMenuItem onClick={() => handleAction('process', req)} className="rounded-xl py-3 px-4 font-bold text-xs cursor-pointer text-apple-green focus:bg-apple-green/10">
                                    <FileCheck className="w-4 h-4 mr-3" /> Execute Certification
                                 </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleAction('view_listing', req)} className="rounded-xl py-3 px-4 font-bold text-xs cursor-pointer">
                                 <ExternalLink className="w-4 h-4 mr-3 text-purple-500" /> View Public Listing
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="my-2 bg-apple-border/10" />
                              <DropdownMenuItem onClick={() => handleAction('history', req)} className="rounded-xl py-3 px-4 font-bold text-xs cursor-pointer">
                                 <History className="w-4 h-4 mr-3 text-apple-orange" /> Audit History
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction('process', req)} className="rounded-xl py-3 px-4 font-bold text-xs cursor-pointer text-apple-red focus:bg-apple-red/10 focus:text-apple-red">
                                 <Shield className="w-4 h-4 mr-3" /> Flag as Fraud
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
        </div>
      ) : (
        <div className="space-y-6">
          {/* Verification Agency Providers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Licensed Providers', value: companies.length.toString(), change: 'Sovereign Nodes', icon: Building2, color: 'text-apple-blue', bg: 'bg-apple-blue/10' },
              { label: 'Featured Agencies', value: companies.filter(c => c.isFeatured).length.toString(), change: 'Prime Trusted', icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' },
              { label: 'Avg Turnaround', value: '3 Hours', change: 'Real-time SLA', icon: Clock, color: 'text-apple-green', bg: 'bg-apple-green/10' },
              { label: 'Active Coverage', value: '4 Auction Houses', change: 'Nationwide Sync', icon: CheckCircle2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-[#161617] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300 group">
                <div className="flex items-start justify-between">
                  <div className={cn("p-3 rounded-xl group-hover:scale-105 transition-transform duration-500", stat.bg)}>
                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                  </div>
                  <span className="text-[10px] font-bold text-[#86868B] bg-apple-gray dark:bg-white/5 px-2 py-0.5 rounded-full uppercase tracking-wider">{stat.change}</span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-none">{stat.value}</div>
                  <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider mt-1.5">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companiesLoading ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-[#86868B]">
                <Loader2 className="w-8 h-8 animate-spin text-apple-blue mb-4" />
                <p className="text-xs font-bold uppercase tracking-wider">Synchronizing verified verifiers...</p>
              </div>
            ) : companies.length === 0 ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-[#86868B] bg-white dark:bg-[#161617] rounded-3xl border border-black/[0.04] dark:border-white/[0.04]">
                <Building2 className="w-12 h-12 text-apple-border mb-4 opacity-40" />
                <p className="text-sm font-semibold text-[#1D1D1F] dark:text-white">No registered verifiers found</p>
                <p className="text-xs text-[#86868B] mt-1 mb-5">Deploy physical inspection networks and auction sheet verifiers.</p>
                <button
                  onClick={() => {
                    setEditingCompany(null);
                    resetCompanyForm();
                    setIsCompanyModalOpen(true);
                  }}
                  className="px-4.5 py-2 rounded-xl bg-apple-blue hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider"
                >
                  Configure Prime Provider
                </button>
              </div>
            ) : (
              companies.map((company) => (
                <motion.div
                  key={company.id}
                  layout
                  className="bg-white dark:bg-[#161617] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-6 hover:shadow-[0_12px_32px_rgba(0,0,0,0.03)] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 bg-[#F5F5F7] dark:bg-white/5 rounded-xl border border-black/[0.06] dark:border-white/[0.06] p-2 flex items-center justify-center overflow-hidden">
                          {company.logoUrl ? (
                            <img src={company.logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          ) : (
                            <Building2 className="w-6 h-6 text-[#86868B]" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-sm text-[#1D1D1F] dark:text-white tracking-tight">{company.name}</h3>
                            {company.isFeatured && (
                              <span className="p-0.5 rounded bg-amber-500/15 text-amber-500 shrink-0">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#86868B] font-medium mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-apple-blue" /> Verified Partner
                          </p>
                        </div>
                      </div>

                      <Badge className={cn(
                        "px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wider border-none shadow-none",
                        company.status === 'active' ? "bg-apple-green/10 text-apple-green" : "bg-apple-gray text-[#86868B]"
                      )}>
                        {company.status === 'active' ? 'Active' : 'Hidden'}
                      </Badge>
                    </div>

                    <p className="text-xs text-[#86868B] dark:text-[#86868B]/80 leading-relaxed font-normal min-h-[3rem] line-clamp-2">
                      {company.description || "Certified physical inspector and electronic auction log matching network."}
                    </p>

                    <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-[#F5F5F7]/50 dark:bg-white/[0.02] rounded-2xl border border-black/[0.04] dark:border-white/[0.04]">
                      <div>
                        <p className="text-[8px] font-bold text-[#86868B] uppercase tracking-wider">Verification Fee</p>
                        <p className="text-xs font-black mt-0.5 text-[#1D1D1F] dark:text-white">{company.verificationFee}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-[#86868B] uppercase tracking-wider">Turnaround SLA</p>
                        <p className="text-xs font-black mt-0.5 text-apple-blue">{company.reportTurnaround}</p>
                      </div>
                      <div className="col-span-2 pt-1.5 border-t border-black/[0.04] dark:border-white/[0.04] mt-1.5">
                        <p className="text-[8px] font-bold text-[#86868B] uppercase tracking-wider">Covered Auctions</p>
                        <p className="text-[10px] font-bold mt-0.5 text-[#1D1D1F] dark:text-white line-clamp-1">{company.coverageAuctions}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4.5 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between">
                    <button
                      onClick={() => {
                        setEditingCompany(company);
                        setCompanyForm({
                          name: company.name,
                          logoUrl: company.logoUrl,
                          verificationFee: company.verificationFee,
                          reportTurnaround: company.reportTurnaround,
                          coverageAuctions: company.coverageAuctions,
                          description: company.description,
                          contactPhone: company.contactPhone,
                          contactEmail: company.contactEmail,
                          isFeatured: company.isFeatured,
                          order: company.order,
                          status: company.status
                        });
                        setIsCompanyModalOpen(true);
                      }}
                      className="px-4 py-2 bg-[#F5F5F7] dark:bg-white/5 hover:bg-[#E8E8ED] dark:hover:bg-white/10 text-[#1D1D1F] dark:text-white rounded-xl text-xs font-bold transition-all border border-transparent hover:border-black/[0.04]"
                    >
                      Edit Protocol
                    </button>
                    <button
                      onClick={() => handleDeleteCompany(company.id)}
                      className="w-9 h-9 rounded-xl border border-transparent text-red-500 flex items-center justify-center hover:bg-[#FF3B30]/10 hover:text-[#FF3B30] transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}      {/* Advanced Inspection Vault */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-[95vw] lg:max-w-4xl h-[85vh] max-h-[85vh] p-0 overflow-hidden border-none rounded-[2.5rem] bg-white dark:bg-[#1D1D1F] shadow-2xl flex flex-col">
          {selectedRequest && (
            <div className="flex flex-col lg:flex-row h-full overflow-hidden">
              {/* Media & Key Specs Sidebar */}
              <div className="w-full lg:w-[320px] border-r border-apple-border/10 flex flex-col bg-apple-gray/30 dark:bg-white/[0.02] shrink-0">
                <div className="p-7 lg:p-9 space-y-8">
                   <div className="space-y-4">
                      <div className="h-44 w-full rounded-[24px] overflow-hidden shadow-2xl border border-white/10 group relative">
                         <img src={selectedRequest.vehicle.images[0]} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" referrerPolicy="no-referrer" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-5">
                            <span className="text-white/60 text-[8px] font-black uppercase tracking-widest">Target</span>
                            <h3 className="text-white text-base font-bold">{selectedRequest.vehicle.make} {selectedRequest.vehicle.model}</h3>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-apple-text-muted px-1">Verification Matrix</h4>
                      <div className="grid grid-cols-2 gap-3">
                         {[
                            { label: 'Transmission', value: selectedRequest.vehicle.transmission, icon: Settings },
                            { label: 'Fuel', value: selectedRequest.vehicle.fuelType, icon: Zap },
                            { label: 'Odometer', value: `${selectedRequest.vehicle.mileage}km`, icon: Gauge },
                            { label: 'Engine', value: selectedRequest.vehicle.engineSize, icon: Activity },
                         ].map(spec => (
                            <div key={spec.label} className="bg-white dark:bg-white/5 p-4 rounded-[18px] border border-apple-border/10 shadow-sm hover:border-apple-blue/10 transition-colors">
                               <spec.icon className="w-3 h-3 text-apple-blue mb-1.5" />
                               <div className="text-[8px] font-black text-apple-text-muted uppercase tracking-wider mb-0.5">{spec.label}</div>
                               <div className="text-xs font-black capitalize tracking-tight">{spec.value}</div>
                            </div>
                         ))}
                      </div>
                   </div>

                   <div className="p-4 rounded-[22px] bg-apple-orange/10 border border-apple-orange/20 flex gap-3 shadow-sm">
                      <div className="p-2 bg-apple-orange text-white rounded-xl shadow-lg shadow-apple-orange/20 shrink-0 h-fit">
                         <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                         <div className="text-[10px] font-black text-apple-orange uppercase tracking-tight">Priority Audit</div>
                         <div className="text-[8px] font-medium text-apple-orange/70">Requires synchronous clearance.</div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Comprehensive Audit Dashboard */}
              <div className="flex-1 p-7 lg:p-10 overflow-y-auto custom-scrollbar flex flex-col">
                 <div className="space-y-10 flex-1">
                    {/* Header Details */}
                    <div className="flex items-start justify-between">
                       <div className="space-y-2">
                          <div className="flex items-center gap-2.5">
                             <Badge className="bg-apple-blue/10 text-apple-blue border-none font-black text-[8px] px-2 py-0.5 transition-all rounded-full">AUDIT</Badge>
                             <span className="text-apple-text-muted font-bold text-[10px] uppercase tracking-widest opacity-60">LOG: {selectedRequest.id}</span>
                          </div>
                          <DialogTitle className="text-3xl font-black tracking-tight leading-none">
                            Verification Protocol
                          </DialogTitle>
                       </div>
                       <Avatar className="h-12 w-12 rounded-2xl border-2 border-apple-gray shadow-md">
                          <AvatarImage src={`https://i.pravatar.cc/150?u=${selectedRequest.createdBy}`} />
                          <AvatarFallback className="bg-apple-gray">USR</AvatarFallback>
                       </Avatar>
                    </div>

                    {/* Progress & Integrity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-4">
                          <div className="flex items-center justify-between px-1">
                             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-text-muted">Integrity Signals</h4>
                             <ShieldCheck className="w-4 h-4 text-apple-green" />
                          </div>
                          <div className="space-y-4 bg-apple-gray/30 dark:bg-white/[0.03] p-6 rounded-[28px] border border-apple-border/10 shadow-inner">
                             {[
                               { label: 'Chassis Integrity', value: 100, status: 'Verified' },
                               { label: 'Engine Logic', value: 85, status: 'Active' },
                             ].map(scan => (
                               <div key={scan.label} className="space-y-2">
                                  <div className="flex justify-between text-[10px] font-black tracking-tight">
                                     <span className="opacity-60 uppercase">{scan.label}</span>
                                     <span className={cn(scan.value === 100 ? "text-apple-green" : "text-apple-blue")}>{scan.status}</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-apple-gray dark:bg-apple-gray/10 rounded-full overflow-hidden">
                                     <motion.div initial={{ width: 0 }} animate={{ width: `${scan.value}%` }} className={cn("h-full rounded-full", scan.value === 100 ? "bg-apple-green shadow-[0_0_8px_rgba(52,199,89,0.5)]" : "bg-apple-blue shadow-[0_0_8px_rgba(0,122,255,0.5)]")} />
                                  </div>
                                </div>
                             ))}
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div className="flex items-center justify-between px-1">
                             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-text-muted">Review Log</h4>
                             <User className="w-4 h-4 text-apple-blue" />
                          </div>
                          <div className="bg-apple-gray/30 dark:bg-white/[0.03] p-6 rounded-[28px] border border-apple-border/10 space-y-3 shadow-inner h-full">
                             <div className="text-[10px] font-black tracking-tight text-apple-blue uppercase tracking-widest">{selectedRequest.newData.inspectorId}</div>
                             <p className="text-[11px] lg:text-sm font-bold leading-relaxed text-apple-text/80">
                                "Nominal status confirmed. Mechanical signals synchronize with digital records. All shards match perfectly."
                             </p>
                          </div>
                       </div>
                    </div>

                    {/* Action Hub */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                       <Button 
                        variant="outline" 
                        className="rounded-xl h-12 border-apple-border/20 font-black text-[9px] uppercase tracking-[0.2em] active:scale-95 transition-all outline-none" 
                        onClick={() => handleAction('history', selectedRequest)}
                       >
                          Logs
                       </Button>
                       <Button 
                        variant="outline" 
                        className="rounded-xl h-12 border-apple-border/20 font-black text-[9px] uppercase tracking-[0.2em] active:scale-95 transition-all text-apple-blue border-apple-blue/10 hover:bg-apple-blue/5 outline-none" 
                        onClick={() => handleAction('view_listing', selectedRequest)}
                       >
                          Signal
                       </Button>
                       <Button 
                        className="apple-button-primary rounded-xl h-12 font-black text-[9px] uppercase tracking-[0.2em] shadow-2xl active:scale-90 transition-all text-white border-none outline-none" 
                        onClick={() => handleAction('process', selectedRequest)}
                       >
                          Certify
                       </Button>
                    </div>
                 </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Decision Dialog */}
      <Dialog open={isProcessOpen} onOpenChange={setIsProcessOpen}>
        <DialogContent className="max-w-sm rounded-[28px] border-apple-border/20 bg-white dark:bg-[#1D1D1F] p-6 overflow-hidden">
          <div className="text-center relative">
            <div className="w-14 h-14 rounded-2xl bg-apple-blue/10 flex items-center justify-center mx-auto mb-5">
               <ShieldCheck className="w-7 h-7 text-apple-blue" />
            </div>
            <DialogTitle className="text-xl font-black tracking-tight mb-2">Finalize Audit</DialogTitle>
            <DialogDescription className="text-[10px] font-semibold text-apple-text-muted mb-6 leading-relaxed">
              Verify target <span className="text-apple-text font-black">{selectedRequest?.targetId}</span> as Pakizzle Verified.
            </DialogDescription>
            <div className="grid grid-cols-1 gap-2.5">
               <Button className="rounded-xl h-11 bg-apple-green text-white font-black text-[10px] uppercase tracking-widest hover:bg-apple-green/90 shadow-lg border-none active:scale-95 transition-all" onClick={() => finalizeVerification('approved')}>
                  <FileCheck className="w-4 h-4 mr-2" /> Certify Asset
               </Button>
               <Button variant="outline" className="rounded-xl h-11 border-apple-border/20 text-apple-red font-black text-[10px] uppercase tracking-widest hover:bg-apple-red/5 hover:text-apple-red active:scale-95 transition-all" onClick={() => finalizeVerification('rejected')}>
                  <FileX className="w-4 h-4 mr-2" /> Deny Logic
               </Button>
               <Button variant="ghost" className="rounded-xl h-10 font-black text-[9px] text-apple-text-muted active:scale-95 transition-all uppercase tracking-widest" onClick={() => setIsProcessOpen(false)}>
                  Return
               </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auction Company Registration/Edit Dialog */}
      <Dialog open={isCompanyModalOpen} onOpenChange={setIsCompanyModalOpen}>
        <DialogContent className="max-w-2xl rounded-[40px] border-apple-border/10 bg-white dark:bg-[#1D1D1F] p-8 overflow-hidden max-h-[90vh] flex flex-col gap-0 shadow-2xl">
          <div className="text-center pb-6 shrink-0 relative">
            <div className="w-20 h-20 rounded-[28px] bg-apple-blue/10 dark:bg-apple-blue/20 flex items-center justify-center mx-auto mb-4 transition-transform hover:scale-105">
              <Building2 className="w-10 h-10 text-apple-blue" />
            </div>
            <DialogTitle className="text-3xl font-black tracking-tighter text-[#1D1D1F] dark:text-white">
              {editingCompany ? 'Configure Verification Agency' : 'Register Verification Agency'}
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-apple-text-muted dark:text-apple-text-muted/80 uppercase tracking-widest opacity-80 mt-2 max-w-md mx-auto leading-relaxed">
              Manage verification protocols, fee structures, and auction SLA parameters.
            </DialogDescription>
          </div>

          <form onSubmit={handleUpdateCompany} className="flex flex-col flex-1 overflow-hidden">
            <ScrollArea className="flex-1 pr-2">
              <div className="space-y-6 py-2 px-1">
                {/* Logo Upload */}
                <div className="flex items-center gap-6 p-5 bg-[#F5F5F7]/50 dark:bg-white/[0.02] rounded-3xl border border-black/[0.04] dark:border-white/[0.04]">
                  <div className="w-18 h-18 rounded-2xl bg-white dark:bg-[#161617] p-3 border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center shrink-0 overflow-hidden relative shadow-sm">
                    {companyForm.logoUrl ? (
                      <img src={companyForm.logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <Building2 className="w-8 h-8 text-[#86868B]" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[#1D1D1F] dark:text-white uppercase tracking-wider">Agency Logo</p>
                    <p className="text-[10px] text-[#86868B] font-semibold">PNG or SVG format under 2MB preferred.</p>
                    <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-[#161617] border border-black/[0.08] dark:border-white/[0.08] rounded-xl text-[10px] font-black uppercase tracking-wider text-[#1D1D1F] dark:text-white cursor-pointer hover:bg-apple-gray dark:hover:bg-white/5 transition-all shadow-sm mt-1.5 active:scale-95">
                      Upload Logo
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleLogoUpload} 
                        disabled={isUploadingLogo}
                      />
                    </label>
                  </div>
                </div>

                {/* Form Inputs */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted dark:text-apple-text-muted/80 ml-1">Agency/Institution Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. SGS Global, Pakizzle Verified Pro"
                      className="w-full h-12 px-4 rounded-2xl bg-[#F5F5F7] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 text-xs font-bold text-[#1D1D1F] dark:text-white outline-none transition-all focus:bg-white dark:focus:bg-[#161617] focus:ring-2 focus:ring-apple-blue/20"
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted dark:text-apple-text-muted/80 ml-1">Verification Fee</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Rs. 2,500"
                      className="w-full h-12 px-4 rounded-2xl bg-[#F5F5F7] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 text-xs font-bold text-[#1D1D1F] dark:text-white outline-none transition-all focus:bg-white dark:focus:bg-[#161617] focus:ring-2 focus:ring-apple-blue/20"
                      value={companyForm.verificationFee}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, verificationFee: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted dark:text-apple-text-muted/80 ml-1">Turnaround SLA</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 3 Hours, Next Day"
                      className="w-full h-12 px-4 rounded-2xl bg-[#F5F5F7] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 text-xs font-bold text-[#1D1D1F] dark:text-white outline-none transition-all focus:bg-white dark:focus:bg-[#161617] focus:ring-2 focus:ring-apple-blue/20"
                      value={companyForm.reportTurnaround}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, reportTurnaround: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted dark:text-apple-text-muted/80 ml-1">Covered Auction Houses</label>
                    <input 
                      type="text" 
                      placeholder="e.g. USS Tokyo, JU, CAA, JAA"
                      className="w-full h-12 px-4 rounded-2xl bg-[#F5F5F7] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 text-xs font-bold text-[#1D1D1F] dark:text-white outline-none transition-all focus:bg-white dark:focus:bg-[#161617] focus:ring-2 focus:ring-apple-blue/20"
                      value={companyForm.coverageAuctions}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, coverageAuctions: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted dark:text-apple-text-muted/80 ml-1">Agency Profile & Description</label>
                    <textarea 
                      rows={3}
                      placeholder="Describe the agency, its inspection scope or certification standards."
                      className="w-full p-4 rounded-2xl bg-[#F5F5F7] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 text-xs font-bold text-[#1D1D1F] dark:text-white outline-none transition-all resize-none focus:bg-white dark:focus:bg-[#161617] focus:ring-2 focus:ring-apple-blue/20"
                      value={companyForm.description}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted dark:text-apple-text-muted/80 ml-1">Contact Phone</label>
                    <input 
                      type="text" 
                      placeholder="+92 (300) 123-4567"
                      className="w-full h-12 px-4 rounded-2xl bg-[#F5F5F7] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 text-xs font-bold text-[#1D1D1F] dark:text-white outline-none transition-all focus:bg-white dark:focus:bg-[#161617] focus:ring-2 focus:ring-apple-blue/20"
                      value={companyForm.contactPhone}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted dark:text-apple-text-muted/80 ml-1">Contact Email</label>
                    <input 
                      type="email" 
                      placeholder="audit@agency.com"
                      className="w-full h-12 px-4 rounded-2xl bg-[#F5F5F7] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 text-xs font-bold text-[#1D1D1F] dark:text-white outline-none transition-all focus:bg-white dark:focus:bg-[#161617] focus:ring-2 focus:ring-apple-blue/20"
                      value={companyForm.contactEmail}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted dark:text-apple-text-muted/80 ml-1">Sort Order</label>
                    <input 
                      type="number" 
                      className="w-full h-12 px-4 rounded-2xl bg-[#F5F5F7] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 text-xs font-bold text-[#1D1D1F] dark:text-white outline-none transition-all focus:bg-white dark:focus:bg-[#161617] focus:ring-2 focus:ring-apple-blue/20"
                      value={companyForm.order}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, order: Number(e.target.value) }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted dark:text-apple-text-muted/80 ml-1">Silo Status</label>
                    <select 
                      className="w-full h-12 px-4 rounded-2xl bg-[#F5F5F7] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 text-xs font-bold text-[#1D1D1F] dark:text-white outline-none transition-all focus:bg-white dark:focus:bg-[#161617] focus:ring-2 focus:ring-apple-blue/20 cursor-pointer"
                      value={companyForm.status}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, status: e.target.value as any }))}
                    >
                      <option value="active">Active & Online</option>
                      <option value="hidden">Hidden from App</option>
                    </select>
                  </div>

                  <div className="col-span-2 mt-2 flex items-center justify-between p-5 bg-[#F5F5F7]/50 dark:bg-white/[0.02] rounded-3xl border border-black/[0.04] dark:border-white/[0.04]">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-[#1D1D1F] dark:text-white uppercase tracking-wider">Featured Partner Badge</p>
                      <p className="text-[10px] text-[#86868B] font-semibold">Elevates visibility and prioritizes matching on primary search dashboards.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-apple-blue cursor-pointer rounded-lg border-gray-300"
                      checked={companyForm.isFeatured}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="pt-6 border-t border-apple-border/10 flex flex-col sm:flex-row gap-3 mt-4 shrink-0">
              <Button 
                type="submit" 
                disabled={isUpdating}
                className="w-full h-14 bg-apple-blue hover:bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-apple-blue/10 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Authorize Agency Node
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsCompanyModalOpen(false)}
                className="w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest text-apple-text-muted hover:bg-[#F5F5F7] dark:hover:bg-white/5"
              >
                Abort & Return
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
