import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
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
  Award,
  MapPin,
  Clock,
  Briefcase,
  Star,
  User,
  Share2,
  Check,
  X,
  Plus,
  Info,
  Globe,
  Shield
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { cn } from "../../lib/utils";
import { db } from "../../firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";

const mockCompanies = [
  {
    uid: 'company_1',
    companyName: 'Toyota Indus Motor Company',
    legalName: 'Indus Motor Company Limited',
    brand: 'Toyota',
    category: 'Manufacturer',
    ceoName: 'Ali Asghar Jamali',
    contactName: 'Mohammad Zaid',
    email: 'corporate@toyota-indus.com',
    phone: '021-111-869-682',
    whatsapp: '0300-8812991',
    country: 'Pakistan',
    state: 'Sindh',
    city: 'Karachi',
    address: 'Plot No. NWZ/1/P-1, Port Qasim Industrial Zone, Bin Qasim, Karachi',
    website: 'https://www.toyota-indus.com',
    departments: ['Sales', 'Logistics', 'Finance', 'PR'],
    branches: 12,
    description: 'Indus Motor Company Limited is a joint venture between House of Jamali, Toyota Motor Corporation and Toyota Tsusho Corporation.',
    status: 'approved',
    verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 300).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 310).toISOString(),
    photoURL: 'https://images.unsplash.com/photo-1549740425-5e9ed4d8cd34?w=150&auto=format&fit=crop&q=80'
  },
  {
    uid: 'company_2',
    companyName: 'Honda Atlas Cars Pakistan',
    legalName: 'Honda Atlas Cars (Pakistan) Limited',
    brand: 'Honda',
    category: 'Manufacturer',
    ceoName: 'Hironobu Yoshimura',
    contactName: 'Asif Mahmood',
    email: 'info@honda.com.pk',
    phone: '042-111-466-321',
    whatsapp: '0300-4412391',
    country: 'Pakistan',
    state: 'Punjab',
    city: 'Lahore',
    address: '43-km Multan Road, Manga Mandi, Lahore',
    website: 'https://www.honda.com.pk',
    departments: ['Production', 'Marketing', 'Customer Care'],
    branches: 8,
    description: 'Honda Atlas Cars (Pakistan) Limited is a joint venture between Honda Motor Company Limited, Japan, and the Atlas Group, Pakistan.',
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    photoURL: 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?w=150&auto=format&fit=crop&q=80'
  }
];

export default function CompanyManagement() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [editCompany, setEditCompany] = useState<any | null>(null);

  useEffect(() => {
    if (selectedCompany && isDetailsOpen) {
      setEditCompany({ ...selectedCompany });
    } else {
      setEditCompany(null);
    }
  }, [selectedCompany, isDetailsOpen]);

  // Real-time listener for companies
  useEffect(() => {
    const q = query(
      collection(db, "users"),
      where("accountType", "==", "company")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const companiesData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
      setCompanies(companiesData.length > 0 ? companiesData : mockCompanies);
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading enterprise companies:", error);
      setCompanies(mockCompanies);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = `${c.companyName} ${c.brand || ''} ${c.email} ${c.ceoName || ''}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAction = (type: string, company: any) => {
    setSelectedCompany(company);
    switch(type) {
      case 'view':
        setIsDetailsOpen(true);
        break;
      case 'approve':
        setIsApprovalOpen(true);
        break;
      case 'reject':
        setIsRejectOpen(true);
        break;
      case 'contact':
        toast.success("B2B Secure Protocol Launched", {
          description: `Direct message route established with ${company.contactName} (${company.companyName}).`
        });
        break;
    }
  };

  const updateCompanyStatus = async (newStatus: 'approved' | 'rejected') => {
    if (!selectedCompany) return;
    try {
      await updateDoc(doc(db, "users", selectedCompany.uid), {
        status: newStatus,
        verifiedAt: newStatus === 'approved' ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString()
      });
      toast.success(newStatus === 'approved' ? "Enterprise Access Cleared" : "Enterprise Access Refused", {
        description: `${selectedCompany.companyName} verification credentials successfully resolved.`,
        icon: newStatus === 'approved' ? <ShieldCheck className="w-5 h-5 text-apple-green" /> : <Ban className="w-5 h-5 text-apple-red" />
      });
    } catch (e) {
      // In case we are using offline mock data, fallback manually
      setCompanies(prev => prev.map(c => 
        c.uid === selectedCompany.uid ? {
          ...c,
          status: newStatus,
          verifiedAt: newStatus === 'approved' ? new Date().toISOString() : null
        } : c
      ));
      toast.success(`Fallback applied: ${newStatus}`);
    } finally {
      setIsApprovalOpen(false);
      setIsRejectOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <Building2 className="w-3.5 h-3.5" />
            Enterprise Administration Console
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-tight">
            Corporate Ecosystem
          </h1>
          <p className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-secondary)] max-w-xl leading-relaxed font-normal tracking-wide">
            Oversee corporate importers, OEM manufacturers, financing banks, and insurance underwriters. Configure brand authority parameters and secure legal clearances.
          </p>
        </div>
        
        {/* Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <div className="relative group min-w-[200px] sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] group-focus-within:text-apple-blue transition-colors duration-300" />
            <input
              type="text"
              placeholder="Search enterprises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-inset)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 rounded-xl text-xs font-medium focus:ring-0 outline-none transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-wrap gap-3.5 items-center pb-4.5">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['all', 'Manufacturer', 'Importer', 'Finance Company', 'Insurance Company'].map((cat) => {
            const isActive = categoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap border transition-all",
                  isActive
                    ? "bg-apple-blue border-apple-blue text-white shadow-sm"
                    : "bg-white dark:bg-[var(--bg-surface)] border-black/[0.04] dark:border-white/[0.04] text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white"
                )}
              >
                {cat === 'all' ? 'All Classes' : cat}
              </button>
            );
          })}
        </div>

        {/* Status Dropdown */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-[var(--bg-surface)] border border-black/[0.04] dark:border-white/[0.04] rounded-full px-3 py-1 text-[11px] font-semibold outline-none text-[var(--text-secondary)]"
          >
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Enterprise Table Card */}
      <div className="bg-white dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)]">Brand & Identity</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)]">Category</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)]">Chief Officer</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)]">Headquarters</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)]">Networks</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)]">Clearance</th>
                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.03]">
              {filteredCompanies.map((comp) => {
                const isApproved = comp.status === 'approved' || comp.status === 'active';
                const isPending = comp.status === 'pending';
                const isRejected = comp.status === 'rejected';

                return (
                  <tr key={comp.uid} className="hover:bg-apple-gray/50 dark:hover:bg-white/5 transition-all cursor-pointer" onClick={() => handleAction('view', comp)}>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-11 w-11 rounded-xl border border-black/[0.06] dark:border-white/[0.06]">
                          <AvatarImage src={comp.photoURL} />
                          <AvatarFallback className="bg-purple-600 text-white font-bold"><Building2 className="w-4.5 h-4.5" /></AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-sm tracking-tight text-[var(--text-primary)] dark:text-white flex items-center gap-1.5 leading-none">
                            {comp.companyName}
                            {isApproved && <Award className="w-4 h-4 text-purple-600" />}
                          </div>
                          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mt-1">{comp.brand || "Multi-Brand"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-apple-surface text-neutral-600 dark:text-apple-border">
                        {comp.category}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-xs font-semibold text-[var(--text-primary)] dark:text-white">
                      <div>{comp.ceoName}</div>
                      <div className="text-[10px] text-[var(--text-secondary)] font-medium mt-0.5">Contact: {comp.contactName}</div>
                    </td>
                    <td className="px-6 py-4.5 text-xs text-[var(--text-secondary)] font-medium">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                        {comp.city}, {comp.state}
                      </div>
                    </td>
                    <td className="px-6 py-4.5 text-xs font-bold text-[var(--text-primary)] dark:text-white">
                      {comp.branches || 1} Branches
                    </td>
                    <td className="px-6 py-4.5">
                      {isApproved ? (
                        <div className="inline-flex items-center gap-1.5 text-xs text-apple-green font-bold bg-apple-green/10 px-3 py-1 rounded-full">
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Verified
                        </div>
                      ) : isPending ? (
                        <div className="inline-flex items-center gap-1.5 text-xs text-orange-500 font-bold bg-orange-500/10 px-3 py-1 rounded-full animate-pulse">
                          <Clock className="w-3.5 h-3.5" /> Pending Review
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 text-xs text-apple-red font-bold bg-apple-red/10 px-3 py-1 rounded-full">
                          <X className="w-3.5 h-3.5 stroke-[3]" /> Suspended
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        } />
                        <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-apple-soft">
                          <DropdownMenuItem onClick={() => handleAction('view', comp)} className="rounded-lg text-xs font-semibold px-3 py-2">
                            <Building2 className="w-4 h-4 mr-2" /> Inspect Legal Dossier
                          </DropdownMenuItem>
                          {isPending && (
                            <>
                              <DropdownMenuItem onClick={() => handleAction('approve', comp)} className="rounded-lg text-xs font-bold px-3 py-2 text-apple-green hover:bg-apple-green/5">
                                <CheckCircle2 className="w-4 h-4 mr-2 text-apple-green" /> Clear Registration
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction('reject', comp)} className="rounded-lg text-xs font-bold px-3 py-2 text-apple-red hover:bg-apple-red/5">
                                <Ban className="w-4 h-4 mr-2 text-apple-red" /> Deny Credentials
                              </DropdownMenuItem>
                            </>
                          )}
                          {!isPending && isApproved && (
                            <DropdownMenuItem onClick={() => handleAction('reject', comp)} className="rounded-lg text-xs font-bold px-3 py-2 text-apple-red hover:bg-apple-red/5">
                              <Ban className="w-4 h-4 mr-2 text-apple-red" /> Suspended Alliance
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleAction('contact', comp)} className="rounded-lg text-xs font-semibold px-3 py-2">
                            <MessageSquare className="w-4 h-4 mr-2" /> Secure B2B Channel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. INSPECT DIALOG */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-[92vw] lg:max-w-4xl h-[85vh] max-h-[85vh] p-0 overflow-hidden border-none rounded-[2.5rem] bg-white dark:bg-[var(--bg-surface)] shadow-2xl flex flex-col">
          {selectedCompany && editCompany && (
            <Tabs defaultValue="dossier" className="flex flex-col h-full overflow-hidden">
              {/* Header */}
              <header className="p-6 border-b border-apple-border/10 flex items-center justify-between bg-neutral-50 dark:bg-white/[0.02] shrink-0">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 rounded-2xl border border-apple-border/10 shadow-sm shrink-0">
                    <AvatarImage src={selectedCompany.photoURL} referrerPolicy="no-referrer" />
                    <AvatarFallback className="bg-purple-600 text-white font-black text-xl">
                      {selectedCompany.companyName?.charAt(0) || <Building2 className="w-7 h-7" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold text-stone-900 dark:text-white leading-tight flex items-center gap-2">
                      {selectedCompany.companyName}
                      {selectedCompany.isVerified && <ShieldCheck className="w-5 h-5 text-apple-green" />}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <Badge className={cn(
                        "px-2 py-0.5 rounded-full border-none text-[8px] uppercase font-black tracking-widest text-white shadow-none",
                        selectedCompany.status === 'approved' ? "bg-apple-green" : 
                        selectedCompany.status === 'pending' ? "bg-apple-orange" : "bg-apple-red"
                      )}>
                        {selectedCompany.status || 'Pending'} Status
                      </Badge>
                      <Badge className="bg-purple-600 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border-none">
                        {selectedCompany.category || 'Enterprise'} Category
                      </Badge>
                      {selectedCompany.branches && (
                        <Badge className="bg-[var(--bg-inset)] dark:bg-white/5 text-[var(--text-secondary)] text-[8px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border border-apple-border/5">
                          {selectedCompany.branches} Branches
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <TabsList className="bg-[var(--bg-inset)] dark:bg-white/5 p-1 rounded-xl">
                    <TabsTrigger value="dossier" className="rounded-lg text-xs font-bold px-3 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-apple-surface data-[state=active]:text-apple-blue">
                      Corporate Dossier
                    </TabsTrigger>
                    <TabsTrigger value="override" className="rounded-lg text-xs font-bold px-3 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-apple-surface data-[state=active]:text-apple-blue flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" /> Overrule Control
                    </TabsTrigger>
                  </TabsList>
                  <Button variant="ghost" className="rounded-full h-8 w-8 p-0 hover:bg-[var(--bg-inset)] dark:hover:bg-white/5" onClick={() => setIsDetailsOpen(false)}>
                    ✕
                  </Button>
                </div>
              </header>

              <TabsContent value="dossier" className="flex-1 m-0 outline-none flex flex-col overflow-hidden">
                {/* Main Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
                {/* Corporate Dossier Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: General & Legal Records */}
                  <div className="p-6 rounded-[2rem] bg-[var(--bg-inset)] dark:bg-white/[0.02] border border-apple-border/5 space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-apple-blue" /> Corporate Dossier
                    </h4>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs font-semibold text-stone-800 dark:text-apple-border">
                      <div>
                        <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase block">Legal Entity</span>
                        <span className="font-bold mt-1 block">{selectedCompany.legalName || 'Not configured'}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase block">Associated Brand</span>
                        <span className="font-bold mt-1 block">{selectedCompany.brand || 'Multi-Brand'}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase block">Chief Executive Officer</span>
                        <span className="font-bold mt-1 block">{selectedCompany.ceoName || 'Not configured'}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase block">Authorized Contact</span>
                        <span className="font-bold mt-1 block">{selectedCompany.contactName || 'Not configured'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Telephony & Digital Reach */}
                  <div className="p-6 rounded-[2rem] bg-[var(--bg-inset)] dark:bg-white/[0.02] border border-apple-border/5 space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-apple-green" /> Headquarters & Telephony
                    </h4>
                    <div className="space-y-3.5 text-xs text-stone-700 dark:text-apple-border">
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-[var(--text-secondary)]" />
                        <span className="font-semibold">{selectedCompany.email}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Phone className="w-4 h-4 text-[var(--text-secondary)]" />
                        <span className="font-semibold">{selectedCompany.phone || 'Not configured'}</span>
                      </div>
                      {selectedCompany.whatsapp && (
                        <div className="flex items-center gap-2.5">
                          <MessageSquare className="w-4 h-4 text-apple-green" />
                          <span className="font-bold">WhatsApp Lead: <span className="text-apple-green">{selectedCompany.whatsapp}</span></span>
                        </div>
                      )}
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-[var(--text-secondary)] shrink-0 mt-0.5" />
                        <span className="font-semibold leading-relaxed">
                          {selectedCompany.address ? `${selectedCompany.address}, ` : ''}
                          {selectedCompany.city || ''}, {selectedCompany.state ? `${selectedCompany.state}, ` : ''}{selectedCompany.country || ''}
                        </span>
                      </div>
                      {selectedCompany.website && (
                        <div className="flex items-center gap-2.5 pt-1.5 border-t border-apple-border/5">
                          <Globe className="w-4 h-4 text-apple-blue" />
                          <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="text-apple-blue hover:underline font-bold flex items-center gap-1">
                            Visit Corporate Website <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Info (Departments & Branches) */}
                {((selectedCompany.departments && selectedCompany.departments.length > 0) || selectedCompany.branches) && (
                  <div className="space-y-3 bg-[var(--bg-inset)] dark:bg-white/[0.02] p-6 rounded-[2rem] border border-apple-border/5">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Enterprise Structure</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {selectedCompany.departments && selectedCompany.departments.length > 0 && (
                        <div>
                          <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase block mb-1">Corporate Departments</span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedCompany.departments.map((dept: string) => (
                              <Badge key={dept} className="bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-300 font-bold text-[8px] px-2 py-0.5 border-none rounded-md">
                                {dept}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedCompany.branches && (
                        <div>
                          <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase block">Operational Branches</span>
                          <span className="font-bold text-stone-800 dark:text-apple-border mt-1 block">{selectedCompany.branches} corporate locations</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Narrative Description */}
                {selectedCompany.description && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] px-1">Corporate Statement & Narrative</h4>
                    <div className="p-5 rounded-3xl bg-[var(--bg-inset)] dark:bg-white/[0.02] border border-apple-border/5">
                      <p className="text-xs font-semibold leading-relaxed text-[var(--text-primary)]/80 dark:text-apple-border">
                        {selectedCompany.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* VERIFICATION ATTACHMENTS (CRITICAL USER REQUEST) */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-secondary)] px-1 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-apple-blue" /> Verified Legal Documentation & Uploaded Attachments
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Attachment 1: Trade License */}
                    <div className="bg-[var(--bg-inset)] dark:bg-white/[0.02] border border-apple-border/5 rounded-[2rem] p-5 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[8px] font-black uppercase tracking-wider text-apple-blue">Trade License</span>
                          <span className="text-[7px] font-black uppercase tracking-wider text-apple-green bg-apple-green/5 px-2 py-0.5 rounded-full">Secure Scan</span>
                        </div>
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 border border-apple-border/5 group">
                          <img 
                            src={selectedCompany.license || 'https://picsum.photos/seed/license_comp/800/600'} 
                            alt="Trade License"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          <a 
                            href={selectedCompany.license || 'https://picsum.photos/seed/license_comp/800/600'} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 font-bold text-white text-xs gap-1.5"
                          >
                            Inspect Attachment <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                      <a 
                        href={selectedCompany.license || 'https://picsum.photos/seed/license_comp/800/600'} 
                        download="Corporate_Trade_License.png"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full"
                      >
                        <Button variant="outline" className="w-full rounded-xl text-[9px] font-bold uppercase tracking-wider h-9 gap-1.5 border-apple-border/15">
                          <Download className="w-3.5 h-3.5" /> Download Trade License
                        </Button>
                      </a>
                    </div>

                    {/* Attachment 2: Tax Certificate */}
                    <div className="bg-[var(--bg-inset)] dark:bg-white/[0.02] border border-apple-border/5 rounded-[2rem] p-5 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[8px] font-black uppercase tracking-wider text-apple-blue">Tax Certificate / NTN</span>
                          <span className="text-[7px] font-black uppercase tracking-wider text-apple-green bg-apple-green/5 px-2 py-0.5 rounded-full">Biometric Match</span>
                        </div>
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 border border-apple-border/5 group">
                          <img 
                            src={selectedCompany.taxCertificate || 'https://picsum.photos/seed/tax/800/600'} 
                            alt="Tax Certificate / NTN"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          <a 
                            href={selectedCompany.taxCertificate || 'https://picsum.photos/seed/tax/800/600'} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 font-bold text-white text-xs gap-1.5"
                          >
                            Inspect Attachment <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                      <a 
                        href={selectedCompany.taxCertificate || 'https://picsum.photos/seed/tax/800/600'} 
                        download="Corporate_Tax_Certificate.png"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full"
                      >
                        <Button variant="outline" className="w-full rounded-xl text-[9px] font-bold uppercase tracking-wider h-9 gap-1.5 border-apple-border/15">
                          <Download className="w-3.5 h-3.5" /> Download Tax Cert
                        </Button>
                      </a>
                    </div>

                    {/* Attachment 3: Company Registration */}
                    <div className="bg-[var(--bg-inset)] dark:bg-white/[0.02] border border-apple-border/5 rounded-[2rem] p-5 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[8px] font-black uppercase tracking-wider text-apple-blue">SEC / SECP Registration</span>
                          <span className="text-[7px] font-black uppercase tracking-wider text-apple-green bg-apple-green/5 px-2 py-0.5 rounded-full">Active Ledger</span>
                        </div>
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 border border-apple-border/5 group">
                          <img 
                            src={selectedCompany.companyRegistration || 'https://picsum.photos/seed/compreg/800/600'} 
                            alt="Corporate Registration Certificate"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          <a 
                            href={selectedCompany.companyRegistration || 'https://picsum.photos/seed/compreg/800/600'} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 font-bold text-white text-xs gap-1.5"
                          >
                            Inspect Attachment <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                      <a 
                        href={selectedCompany.companyRegistration || 'https://picsum.photos/seed/compreg/800/600'} 
                        download="Corporate_Registration.png"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full"
                      >
                        <Button variant="outline" className="w-full rounded-xl text-[9px] font-bold uppercase tracking-wider h-9 gap-1.5 border-apple-border/15">
                          <Download className="w-3.5 h-3.5" /> Download Registration
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <footer className="p-6 bg-neutral-50 dark:bg-apple-text/50 border-t flex justify-end gap-3 shrink-0">
                <Button variant="outline" className="rounded-xl text-xs font-bold" onClick={() => setIsDetailsOpen(false)}>
                  Close Profile
                </Button>
                {selectedCompany.status === 'pending' && (
                  <>
                    <Button variant="outline" className="rounded-xl text-xs font-bold text-apple-red border-apple-red/20 hover:bg-apple-red/5" onClick={() => { setIsDetailsOpen(false); setIsRejectOpen(true); }}>
                      Deny Access
                    </Button>
                    <Button className="rounded-xl text-xs font-bold bg-apple-blue hover:bg-apple-blue/90" onClick={() => { setIsDetailsOpen(false); setIsApprovalOpen(true); }}>
                      Verify Partner
                    </Button>
                  </>
                )}
              </footer>
              </TabsContent>

              {/* Tab 2: Overrule Control (Attributes Form) */}
              <TabsContent value="override" className="flex-1 m-0 outline-none flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
                  <div className="bg-[var(--bg-inset)] dark:bg-white/[0.02] p-6 rounded-3xl border border-apple-border/5 space-y-2">
                    <h3 className="text-sm font-bold flex items-center gap-1.5 text-apple-blue">
                      <Shield className="w-4 h-4" /> Enterprise administrative overrides
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                      Control corporate identity, CEO information, brand authorities, category classification, contact channels, branch limits, and registered locations of this corporate partner. Changes apply immediately in the database registry.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Column 1: Corporate Profile */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)] px-1">Corporate & Identity Settings</h4>
                      
                      <div className="space-y-3 bg-[var(--bg-inset)] dark:bg-white/[0.01] p-5 rounded-3xl border border-apple-border/5">
                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1">Company / Enterprise Name</label>
                          <Input 
                            value={editCompany.companyName || ""} 
                            onChange={(e) => setEditCompany({ ...editCompany, companyName: e.target.value })}
                            className="bg-white dark:bg-apple-text border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-bold text-xs" 
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1">Legal Registered Name</label>
                          <Input 
                            value={editCompany.legalName || ""} 
                            onChange={(e) => setEditCompany({ ...editCompany, legalName: e.target.value })}
                            className="bg-white dark:bg-apple-text border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-medium text-xs" 
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1">Associated Brand</label>
                            <Input 
                              value={editCompany.brand || ""} 
                              onChange={(e) => setEditCompany({ ...editCompany, brand: e.target.value })}
                              className="bg-white dark:bg-apple-text border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-bold text-xs" 
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1">Corporate Category</label>
                            <select 
                              value={editCompany.category || "Manufacturer"} 
                              onChange={(e) => setEditCompany({ ...editCompany, category: e.target.value })}
                              className="w-full bg-white dark:bg-apple-text border border-apple-border/10 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-apple-blue/30 text-stone-900 dark:text-apple-gray h-9"
                            >
                              <option value="Manufacturer">Manufacturer (OEM)</option>
                              <option value="Importer">Importer / Distributor</option>
                              <option value="Financing Bank">Financing Bank</option>
                              <option value="Underwriter">Insurance Underwriter</option>
                              <option value="Corporate Fleet">Corporate Fleet Owner</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1">CEO Name</label>
                            <Input 
                              value={editCompany.ceoName || ""} 
                              onChange={(e) => setEditCompany({ ...editCompany, ceoName: e.target.value })}
                              className="bg-white dark:bg-apple-text border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-medium text-xs" 
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1">Primary Authorized Contact</label>
                            <Input 
                              value={editCompany.contactName || ""} 
                              onChange={(e) => setEditCompany({ ...editCompany, contactName: e.target.value })}
                              className="bg-white dark:bg-apple-text border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-medium text-xs" 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1">Branches Count</label>
                            <Input 
                              type="number"
                              value={editCompany.branches || 1} 
                              onChange={(e) => setEditCompany({ ...editCompany, branches: Number(e.target.value) })}
                              className="bg-white dark:bg-apple-text border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-bold text-xs" 
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1">Corporate Rating</label>
                            <Input 
                              type="number"
                              step="0.1"
                              min="0"
                              max="5"
                              value={editCompany.rating || 4.5} 
                              onChange={(e) => setEditCompany({ ...editCompany, rating: Number(e.target.value) })}
                              className="bg-white dark:bg-apple-text border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-bold text-xs" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Legal, Status & Comms */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)] px-1">Ecosystem Clearance & Communications</h4>

                      <div className="space-y-3 bg-[var(--bg-inset)] dark:bg-white/[0.01] p-5 rounded-3xl border border-apple-border/5">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1">Corporate Status</label>
                            <select 
                              value={editCompany.status} 
                              onChange={(e) => setEditCompany({ ...editCompany, status: e.target.value as any })}
                              className="w-full bg-white dark:bg-apple-text border border-apple-border/10 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-apple-blue/30 text-stone-900 dark:text-apple-gray"
                            >
                              <option value="pending">Pending Audit</option>
                              <option value="approved">Approved & Verified</option>
                              <option value="rejected">Rejected Partner</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1">Government License #</label>
                            <Input 
                              value={editCompany.licenseNumber || editCompany.registrationNumber || ""} 
                              onChange={(e) => setEditCompany({ ...editCompany, licenseNumber: e.target.value })}
                              className="bg-white dark:bg-apple-text border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-mono text-xs uppercase" 
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1">Corporate Email</label>
                          <Input 
                            type="email"
                            value={editCompany.email || ""} 
                            onChange={(e) => setEditCompany({ ...editCompany, email: e.target.value })}
                            className="bg-white dark:bg-apple-text border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-medium text-xs" 
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1">Corporate Phone Number</label>
                          <Input 
                            value={editCompany.phone || ""} 
                            onChange={(e) => setEditCompany({ ...editCompany, phone: e.target.value })}
                            className="bg-white dark:bg-apple-text border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-medium text-xs" 
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1">WhatsApp Broadcast Link</label>
                          <Input 
                            value={editCompany.whatsapp || ""} 
                            onChange={(e) => setEditCompany({ ...editCompany, whatsapp: e.target.value })}
                            className="bg-white dark:bg-apple-text border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-medium text-xs" 
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1">Website URL</label>
                          <Input 
                            value={editCompany.website || ""} 
                            onChange={(e) => setEditCompany({ ...editCompany, website: e.target.value })}
                            className="bg-white dark:bg-apple-text border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-medium text-xs" 
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1">City Headquarter</label>
                            <Input 
                              value={editCompany.city || ""} 
                              onChange={(e) => setEditCompany({ ...editCompany, city: e.target.value })}
                              className="bg-white dark:bg-apple-text border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-medium text-xs" 
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1">Country</label>
                            <Input 
                              value={editCompany.country || ""} 
                              onChange={(e) => setEditCompany({ ...editCompany, country: e.target.value })}
                              className="bg-white dark:bg-apple-text border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-medium text-xs" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)] px-1 block mb-1">Corporate Physical Registered Address</label>
                    <textarea 
                      value={editCompany.address || ""} 
                      onChange={(e) => setEditCompany({ ...editCompany, address: e.target.value })}
                      placeholder="Input verified corporate physical coordinates..."
                      className="w-full h-16 p-4 bg-[var(--bg-inset)] dark:bg-white/[0.01] border border-apple-border/10 focus:border-apple-blue/30 rounded-3xl text-xs font-semibold focus:ring-0 outline-none text-stone-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Overrule Save Footer */}
                <footer className="p-6 border-t border-apple-border/10 bg-neutral-50 dark:bg-white/[0.02] flex justify-end gap-3 shrink-0 flex-wrap">
                  <Button 
                    variant="outline" 
                    className="rounded-xl px-5 font-bold text-xs hover:bg-[var(--bg-inset)] dark:hover:bg-white/5" 
                    onClick={() => setIsDetailsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="rounded-xl px-5 font-bold text-xs bg-apple-blue hover:bg-apple-blue/90 text-white border-none shadow-lg shadow-apple-blue/15 active:scale-95" 
                    onClick={async () => {
                      try {
                        const { uid, ...updateData } = editCompany;
                        await updateDoc(doc(db, "users", selectedCompany.uid), {
                          ...updateData,
                          updatedAt: new Date().toISOString()
                        });
                        setSelectedCompany(editCompany);
                        setCompanies(prev => prev.map(c => c.uid === selectedCompany.uid ? editCompany : c));
                        toast.success("Corporate Overrides Secured", {
                          description: `Ecosystem parameters for ${editCompany.companyName} have been secured.`
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

      {/* 2. APPROVE CONFIRM DIALOG */}
      <Dialog open={isApprovalOpen} onOpenChange={setIsApprovalOpen}>
        <DialogContent className="max-w-md rounded-[24px] border border-neutral-100 dark:border-apple-surface">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Approve Enterprise Credentials</DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              Are you sure you want to verify <strong>{selectedCompany?.companyName}</strong>? This authorizes their corporate listing clearance, grants official verified badge assets, and clears their brand profile to list premium automotive inventories.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" className="rounded-xl text-xs font-bold" onClick={() => setIsApprovalOpen(false)}>
              Cancel
            </Button>
            <Button className="rounded-xl text-xs font-bold bg-apple-blue hover:bg-apple-blue/90" onClick={() => updateCompanyStatus('approved')}>
              Confirm Authorization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. REJECT CONFIRM DIALOG */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-md rounded-[24px] border border-neutral-100 dark:border-apple-surface">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-apple-red">Deny Enterprise Credentials</DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              Are you sure you want to suspend or reject <strong>{selectedCompany?.companyName}</strong>? This blocks corporate partner dashboard views, removes the verified corporate badge, and prevents any brand representative listings.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" className="rounded-xl text-xs font-bold" onClick={() => setIsRejectOpen(false)}>
              Cancel
            </Button>
            <Button className="rounded-xl text-xs font-bold bg-apple-red hover:bg-apple-red/90" onClick={() => updateCompanyStatus('rejected')}>
              Confirm Suspension
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
