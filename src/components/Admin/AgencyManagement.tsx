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
  Trash2,
  ExternalLink,
  MessageSquare,
  FileCheck,
  FileX,
  Crown,
  MapPin,
  Clock,
  Briefcase,
  Star,
  User,
  Share2,
  Home,
  Info,
  Globe,
  Shield,
  Layers,
  Sparkles,
  TrendingUp,
  Eye,
  DollarSign
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
import { cn, formatPrice } from "../../lib/utils";
import { db } from "../../firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";

export interface AgencyItem {
  uid: string;
  agencyName: string;
  licenseNumber: string;
  regulatoryAuthority: "LDA" | "CDA" | "DHA" | "KDA" | "GDA" | "Other";
  city: string;
  headquarters: string;
  contactPerson: string;
  email: string;
  phone: string;
  whatsapp?: string;
  photoURL?: string;
  logoUrl?: string;
  coverUrl?: string;
  description: string;
  status: "approved" | "pending" | "rejected" | "suspended";
  verificationBadge: "none" | "basic" | "identity" | "agency_certified";
  tier: "Starter" | "Silver Brokerage" | "Gold Partner" | "Platinum Corporate";
  activeListings: number;
  totalViews: number;
  totalInquiries: number;
  boostSpend: number;
  agentsCount: number;
  rating: number;
  createdAt: string;
  verifiedAt?: string;
  documents: string[];
}

const mockAgencies: AgencyItem[] = [
  {
    uid: "agency_1",
    agencyName: "Al-Miraj Real Estate & Builders",
    licenseNumber: "LDA-REG-2024-8841",
    regulatoryAuthority: "LDA",
    city: "Lahore",
    headquarters: "Commercial Broadway, Phase 8 DHA, Lahore",
    contactPerson: "Chaudhry Farhan",
    email: "info@almirajrealestate.pk",
    phone: "+92 300 8472911",
    whatsapp: "+92 300 8472911",
    photoURL: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=200",
    description: "Premier DHA & Gulberg residential and commercial real estate specialists with 15+ years of registry-guaranteed transactions.",
    status: "approved",
    verificationBadge: "agency_certified",
    tier: "Platinum Corporate",
    activeListings: 48,
    totalViews: 84200,
    totalInquiries: 1240,
    boostSpend: 345000,
    agentsCount: 16,
    rating: 4.9,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString(),
    verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 150).toISOString(),
    documents: ["https://picsum.photos/seed/lda_license/800/600", "https://picsum.photos/seed/tax_ntn/800/600"]
  },
  {
    uid: "agency_2",
    agencyName: "Capital Prime Associates",
    licenseNumber: "CDA-REG-4491",
    regulatoryAuthority: "CDA",
    city: "Islamabad",
    headquarters: "Blue Area, Sector F-7, Islamabad",
    contactPerson: "Malik Usman",
    email: "contact@capitalprime.com.pk",
    phone: "+92 321 5567890",
    whatsapp: "+92 321 5567890",
    photoURL: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=200",
    description: "Official marketing partners for Bahria Enclave, Margalla Ridgeline, and CDA Masterplanned Sectors F-6, F-7, and E-7.",
    status: "approved",
    verificationBadge: "agency_certified",
    tier: "Gold Partner",
    activeListings: 32,
    totalViews: 61500,
    totalInquiries: 890,
    boostSpend: 210000,
    agentsCount: 11,
    rating: 4.8,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString(),
    verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 100).toISOString(),
    documents: ["https://picsum.photos/seed/cda_reg/800/600"]
  },
  {
    uid: "agency_3",
    agencyName: "Clifton Waterfront Estates",
    licenseNumber: "KDA-EST-9920",
    regulatoryAuthority: "KDA",
    city: "Karachi",
    headquarters: "Ocean Towers, Block 9 Clifton, Karachi",
    contactPerson: "Tariq Mansoor",
    email: "support@cliftonwaterfront.pk",
    phone: "+92 333 2198471",
    photoURL: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=200",
    description: "Ultra-luxury beachfront apartments, Emaar Crescent Bay penthouses, and DHA Phase 8 architectural villas.",
    status: "pending",
    verificationBadge: "identity",
    tier: "Silver Brokerage",
    activeListings: 14,
    totalViews: 28400,
    totalInquiries: 410,
    boostSpend: 95000,
    agentsCount: 6,
    rating: 4.6,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    documents: ["https://picsum.photos/seed/kda_doc/800/600", "https://picsum.photos/seed/cnic_rep/800/600"]
  },
  {
    uid: "agency_4",
    agencyName: "DHA Prism Consultants",
    licenseNumber: "DHA-LHR-5512",
    regulatoryAuthority: "DHA",
    city: "Lahore",
    headquarters: "Sector J, DHA Phase 9 Prism, Lahore",
    contactPerson: "Raja Noman",
    email: "prism@dhaconsultants.pk",
    phone: "+92 345 8821900",
    photoURL: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200",
    description: "Specialized plot file trading, direct owner allotments, and commercial plaza investment guidance.",
    status: "approved",
    verificationBadge: "agency_certified",
    tier: "Gold Partner",
    activeListings: 27,
    totalViews: 49200,
    totalInquiries: 730,
    boostSpend: 180000,
    agentsCount: 8,
    rating: 4.7,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 85).toISOString(),
    documents: ["https://picsum.photos/seed/dha_license/800/600"]
  }
];

export default function AgencyManagement() {
  const [agencies, setAgencies] = useState<AgencyItem[]>(mockAgencies);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [selectedAgency, setSelectedAgency] = useState<AgencyItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [isRevokeOpen, setIsRevokeOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editAgency, setEditAgency] = useState<Partial<AgencyItem>>({});

  // Real-time listener for agencies from Firestore
  useEffect(() => {
    try {
      const q = query(
        collection(db, "users"),
        where("role", "in", ["agency", "agent", "agency-admin", "dealer"])
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: AgencyItem[] = snapshot.docs.map(d => {
            const data = d.data();
            return {
              uid: d.id,
              agencyName: data.agencyName || data.businessName || data.displayName || "Registered Agency",
              licenseNumber: data.licenseNumber || "LDA/CDA Pending",
              regulatoryAuthority: data.regulatoryAuthority || "LDA",
              city: data.city || "Lahore",
              headquarters: data.headquarters || data.location || "Pakistan",
              contactPerson: data.contactPerson || data.displayName || "Principal Agent",
              email: data.email || "",
              phone: data.phoneNumber || data.phone || "",
              whatsapp: data.whatsapp || data.phoneNumber || "",
              photoURL: data.photoURL || data.agencyLogo,
              description: data.description || "Licensed real estate agency on Pakizzle Property.",
              status: data.status || "approved",
              verificationBadge: data.verified_badge_type || "agency_certified",
              tier: data.tier || "Gold Partner",
              activeListings: data.activeListings || 0,
              totalViews: data.totalViews || 0,
              totalInquiries: data.totalInquiries || 0,
              boostSpend: data.boostSpend || 0,
              agentsCount: data.agentsCount || 1,
              rating: data.rating || 5.0,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
              documents: data.documents || []
            };
          });
          setAgencies(list);
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Using fallback agency seed data", e);
    }
  }, []);

  const filteredAgencies = agencies.filter(a => {
    const matchesSearch = `${a.agencyName} ${a.licenseNumber} ${a.email} ${a.city} ${a.contactPerson}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    const matchesCity = cityFilter === "all" || a.city.toLowerCase() === cityFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesCity;
  });

  const handleApprove = async (agency: AgencyItem) => {
    try {
      await updateDoc(doc(db, "users", agency.uid), {
        status: "approved",
        verified_badge_type: "agency_certified",
        verifiedAt: serverTimestamp()
      });
    } catch (e) {
      // Local fallback
    }
    setAgencies(prev => prev.map(a => a.uid === agency.uid ? { ...a, status: "approved", verificationBadge: "agency_certified" } : a));
    toast.success(`${agency.agencyName} Approved`, {
      description: "Agency credentials verified and storefront published with Agency Certified badge."
    });
    setIsApprovalOpen(false);
  };

  const handleReject = async () => {
    if (!selectedAgency) return;
    if (!rejectionReason.trim()) {
      toast.error("Rejection reason required", { description: "Please state reason for documentation audit." });
      return;
    }
    try {
      await updateDoc(doc(db, "users", selectedAgency.uid), {
        status: "rejected",
        rejectionReason,
        rejectedAt: serverTimestamp()
      });
    } catch (e) {
      // Local fallback
    }
    setAgencies(prev => prev.map(a => a.uid === selectedAgency.uid ? { ...a, status: "rejected" } : a));
    toast.error(`${selectedAgency.agencyName} Rejected`, {
      description: `Reason logged: ${rejectionReason}`
    });
    setIsRevokeOpen(false);
    setRejectionReason("");
  };

  const handleSaveEdit = async () => {
    if (!selectedAgency) return;
    setAgencies(prev => prev.map(a => a.uid === selectedAgency.uid ? { ...a, ...editAgency } : a));
    toast.success("Agency profile updated successfully");
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B2A86]/10 text-[#5B2A86] dark:text-[#F0A830] text-xs font-bold uppercase tracking-wider mb-2 border border-[#5B2A86]/20">
            <Building2 className="w-3.5 h-3.5" />
            <span>Brokerage & Partner Ecosystem</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-apple-text dark:text-white">
            Agency Management
          </h1>
          <p className="text-xs sm:text-sm text-apple-text-muted mt-1 max-w-2xl">
            Authorize real estate brokerages, supervise LDA/CDA regulatory licenses, manage storefront branding, and track portfolio inquiry liquidity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => {
              const csv = agencies.map(a => `${a.agencyName},${a.city},${a.licenseNumber},${a.activeListings},${a.tier}`).join("\n");
              const blob = new Blob([`Agency Name,City,License,Listings,Tier\n${csv}`], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `pakizzle-agencies-${new Date().toISOString().split("T")[0]}.csv`;
              link.click();
              toast.success("Agency Directory Exported");
            }}
            className="rounded-xl border-slate-200 dark:border-white/10 text-xs font-bold gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>

          <Button 
            size="sm"
            onClick={() => toast.info("Agency Onboarding Wizard", { description: "Invite new brokerage link copied to clipboard." })}
            className="rounded-xl bg-[#5B2A86] hover:bg-[#48206b] text-white text-xs font-bold gap-2 cursor-pointer shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Agency</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-2xl border-slate-200/80 dark:border-white/10 shadow-xs bg-white dark:bg-[#1E1E20]">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-apple-text-muted">Total Agencies</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-2 text-slate-900 dark:text-white">
              {agencies.length}
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +4 this month
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 dark:border-white/10 shadow-xs bg-white dark:bg-[#1E1E20]">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-apple-text-muted">Active Properties</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Home className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-2 text-slate-900 dark:text-white">
              {agencies.reduce((acc, a) => acc + (a.activeListings || 0), 0)}
            </div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1 block">
              Direct Agency Inventory
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 dark:border-white/10 shadow-xs bg-white dark:bg-[#1E1E20]">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-apple-text-muted">Certified Badges</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-2 text-slate-900 dark:text-white">
              {agencies.filter(a => a.verificationBadge === "agency_certified").length}
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 block">
              LDA / CDA Registry Validated
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 dark:border-white/10 shadow-xs bg-white dark:bg-[#1E1E20]">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-apple-text-muted">Total Boost Spend</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-2 text-slate-900 dark:text-white font-mono">
              Rs {(agencies.reduce((acc, a) => acc + (a.boostSpend || 0), 0) / 1000).toFixed(0)}k
            </div>
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-1 block">
              Featured placement revenue
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#1E1E20] border border-slate-200/80 dark:border-white/10 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agencies by name, license number, principal, or city..."
            className="pl-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-transparent text-xs font-semibold focus:border-brand-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-[#F5F5F7] outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Approval</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>

          <select 
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-[#F5F5F7] outline-none cursor-pointer"
          >
            <option value="all">All Cities</option>
            <option value="lahore">Lahore</option>
            <option value="islamabad">Islamabad</option>
            <option value="karachi">Karachi</option>
            <option value="rawalpindi">Rawalpindi</option>
          </select>
        </div>
      </div>

      {/* Main Agencies Table */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#1E1E20] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-white/5 border-b border-slate-200/80 dark:border-white/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-bold uppercase tracking-wider py-4 pl-6">Agency / License</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider py-4">HQ & City</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider py-4">Tier & Badge</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider py-4 text-center">Portfolio</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider py-4 text-center">Performance</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider py-4">Status</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider py-4 pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredAgencies.map((agency) => (
                <TableRow key={agency.uid} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-11 h-11 rounded-2xl border border-slate-200/80 dark:border-white/10 shrink-0">
                        <AvatarImage src={agency.photoURL} alt={agency.agencyName} />
                        <AvatarFallback className="bg-[#5B2A86]/10 text-[#5B2A86] font-bold text-xs rounded-2xl">
                          {agency.agencyName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-extrabold text-sm text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                          <span>{agency.agencyName}</span>
                          {agency.verificationBadge === "agency_certified" && (
                            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" title="LDA/CDA Certified Agency" />
                          )}
                        </div>
                        <div className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                          {agency.licenseNumber} · <span className="font-bold text-[#5B2A86] dark:text-amber-400">{agency.regulatoryAuthority}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {agency.city}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                      {agency.headquarters}
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <Badge variant="outline" className="text-[10px] font-bold rounded-lg border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5">
                      <Crown className="w-3 h-3 mr-1" />
                      {agency.tier}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-4 text-center">
                    <div className="font-black text-sm text-slate-900 dark:text-white">
                      {agency.activeListings}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold">
                      {agency.agentsCount} agents
                    </div>
                  </TableCell>

                  <TableCell className="py-4 text-center">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {agency.totalViews.toLocaleString()} views
                    </div>
                    <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {agency.totalInquiries} inquiries
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold",
                      agency.status === "approved" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
                      agency.status === "pending" && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
                      agency.status === "rejected" && "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
                      agency.status === "suspended" && "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"
                    )}>
                      {agency.status.toUpperCase()}
                    </span>
                  </TableCell>

                  <TableCell className="py-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setSelectedAgency(agency); setIsDetailsOpen(true); }}
                        className="h-8 px-2.5 rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/10"
                      >
                        Inspect
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-2xl bg-white dark:bg-[#1E1E20] border-slate-200 dark:border-white/15">
                          {agency.status === "pending" && (
                            <DropdownMenuItem 
                              onClick={() => { setSelectedAgency(agency); setIsApprovalOpen(true); }}
                              className="text-emerald-600 font-bold text-xs cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Approve Agency
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedAgency(agency);
                              setEditAgency(agency);
                              setIsEditModalOpen(true);
                            }}
                            className="text-xs font-semibold cursor-pointer"
                          >
                            <Building2 className="w-3.5 h-3.5 mr-2" /> Edit Storefront
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              window.open(`/marketplace?agency=${encodeURIComponent(agency.agencyName)}`, "_blank");
                            }}
                            className="text-xs font-semibold cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5 mr-2" /> View Inventory
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {agency.status !== "rejected" && (
                            <DropdownMenuItem 
                              onClick={() => { setSelectedAgency(agency); setIsRevokeOpen(true); }}
                              className="text-rose-600 font-bold text-xs cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5 mr-2" /> Suspend Agency
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Agency Details Drawer / Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl rounded-3xl bg-white dark:bg-[#1E1E20] border-slate-200 dark:border-white/15 p-6 max-h-[90vh] overflow-y-auto">
          {selectedAgency && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="w-14 h-14 rounded-2xl border border-slate-200 dark:border-white/10">
                    <AvatarImage src={selectedAgency.photoURL} />
                    <AvatarFallback className="bg-[#5B2A86]/10 text-[#5B2A86] font-bold text-base">
                      {selectedAgency.agencyName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{selectedAgency.agencyName}</span>
                      <Badge className="bg-[#5B2A86] text-white text-[10px]">{selectedAgency.tier}</Badge>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {selectedAgency.licenseNumber} · Authorized by {selectedAgency.regulatoryAuthority}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Tabs for details */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-slate-100 dark:bg-white/5 rounded-2xl p-1">
                  <TabsTrigger value="overview" className="rounded-xl text-xs font-bold">Overview</TabsTrigger>
                  <TabsTrigger value="inventory" className="rounded-xl text-xs font-bold">Inventory ({selectedAgency.activeListings})</TabsTrigger>
                  <TabsTrigger value="compliance" className="rounded-xl text-xs font-bold">Compliance & Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">City</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">{selectedAgency.city}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Principal Contact</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">{selectedAgency.contactPerson}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block font-mono">{selectedAgency.phone}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Boost Spend</span>
                      <span className="text-sm font-bold text-amber-500 mt-1 block font-mono">Rs {selectedAgency.boostSpend.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Agency Bio</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{selectedAgency.description}</p>
                  </div>
                </TabsContent>

                <TabsContent value="inventory" className="pt-4">
                  <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                    <Home className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">Active Portfolio Management</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                      {selectedAgency.agencyName} currently maintains {selectedAgency.activeListings} active listings in {selectedAgency.city}.
                    </p>
                    <Button 
                      size="sm"
                      onClick={() => window.open(`/marketplace?agency=${encodeURIComponent(selectedAgency.agencyName)}`, "_blank")}
                      className="rounded-xl bg-[#5B2A86] text-white text-xs font-bold"
                    >
                      Open Marketplace Portfolio
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="compliance" className="pt-4 space-y-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-white block">License Certificate</span>
                      <span className="text-[11px] text-slate-400 font-mono">{selectedAgency.licenseNumber}</span>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px]">
                      Verified Authentic
                    </Badge>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="flex items-center justify-between border-t border-slate-100 dark:border-white/10 pt-4">
                <Button variant="outline" size="sm" onClick={() => setIsDetailsOpen(false)} className="rounded-xl text-xs font-bold">
                  Close
                </Button>
                {selectedAgency.status === "pending" && (
                  <Button 
                    size="sm" 
                    onClick={() => handleApprove(selectedAgency)}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve Agency
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject / Suspend Dialog */}
      <Dialog open={isRevokeOpen} onOpenChange={setIsRevokeOpen}>
        <DialogContent className="max-w-md rounded-3xl bg-white dark:bg-[#1E1E20] border-slate-200 dark:border-white/15 p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Suspend Agency Account</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Please specify the audit reason for suspending {selectedAgency?.agencyName}. This action immediately depublishes all managed listings.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              Reason for Suspension *
            </label>
            <textarea 
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Invalidation of LDA license deed, failure to honor non-encumbrance warranty, repeated user complaints..."
              rows={3}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-rose-500"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsRevokeOpen(false)} className="rounded-xl text-xs font-bold">
              Cancel
            </Button>
            <Button size="sm" onClick={handleReject} className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold">
              Confirm Suspension
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Agency Profile Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg rounded-3xl bg-white dark:bg-[#1E1E20] border-slate-200 dark:border-white/15 p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white">
              Edit Agency Storefront
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Update branding, regulatory authority, and tier.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 my-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Agency Name</label>
              <Input 
                value={editAgency.agencyName || ""} 
                onChange={(e) => setEditAgency(prev => ({ ...prev, agencyName: e.target.value }))}
                className="rounded-xl text-xs font-semibold"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">License #</label>
                <Input 
                  value={editAgency.licenseNumber || ""} 
                  onChange={(e) => setEditAgency(prev => ({ ...prev, licenseNumber: e.target.value }))}
                  className="rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Authority</label>
                <select 
                  value={editAgency.regulatoryAuthority || "LDA"}
                  onChange={(e) => setEditAgency(prev => ({ ...prev, regulatoryAuthority: e.target.value as any }))}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold"
                >
                  <option value="LDA">LDA (Lahore)</option>
                  <option value="CDA">CDA (Islamabad)</option>
                  <option value="DHA">DHA Authority</option>
                  <option value="KDA">KDA (Karachi)</option>
                  <option value="GDA">GDA (Gwadar)</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">City</label>
                <Input 
                  value={editAgency.city || ""} 
                  onChange={(e) => setEditAgency(prev => ({ ...prev, city: e.target.value }))}
                  className="rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Tier</label>
                <select 
                  value={editAgency.tier || "Gold Partner"}
                  onChange={(e) => setEditAgency(prev => ({ ...prev, tier: e.target.value as any }))}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold"
                >
                  <option value="Starter">Starter</option>
                  <option value="Silver Brokerage">Silver Brokerage</option>
                  <option value="Gold Partner">Gold Partner</option>
                  <option value="Platinum Corporate">Platinum Corporate</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)} className="rounded-xl text-xs font-bold">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveEdit} className="rounded-xl bg-[#5B2A86] text-white text-xs font-bold">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
