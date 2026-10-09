import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  Home, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  Download, 
  Activity, 
  Trash2, 
  ExternalLink, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Eye, 
  Sparkles, 
  SlidersHorizontal, 
  DollarSign, 
  Layers, 
  Tag, 
  Bed, 
  Bath, 
  Maximize2, 
  ShieldAlert, 
  Flame, 
  Check, 
  X,
  FileCheck,
  Building,
  LandPlot,
  Store,
  Trees,
  BedDouble,
  UserCheck
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
import StaleListingsWidget from "./StaleListingsWidget";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator,
  DropdownMenuLabel 
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
import { cn, formatPrice } from "../../lib/utils";
import { db } from "../../firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

export interface PropertyListing {
  id: string;
  referenceId: string; // e.g. PK-849102
  title: string;
  purpose: "buy" | "rent" | "plots";
  propertyType: string;
  price: number;
  city: string;
  area: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  areaSize: number;
  areaUnit: "Marla" | "Kanal" | "Sq. Yd." | "Sq. Ft.";
  status: "active" | "pending" | "sold" | "expired" | "rejected";
  titleStatus: "registry_verified" | "lda_approved" | "pending" | "rejected";
  qualityScore: number; // 0 - 100
  isFraudFlagged: boolean;
  fraudReason?: string;
  isFeatured: boolean;
  isBoosted: boolean;
  views: number;
  favorites: number;
  inquiries: number;
  agencyName?: string;
  sellerName: string;
  sellerBadge: "none" | "basic" | "identity" | "agency_certified";
  images: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

const mockPropertyListings: PropertyListing[] = [
  {
    id: "prop_101",
    referenceId: "PK-109482",
    title: "The Glass Pavilion Villa · 1 Kanal Luxury Estate",
    purpose: "buy",
    propertyType: "House",
    price: 145000000,
    city: "Lahore",
    area: "DHA Phase 6",
    address: "Block K, Phase 6 DHA, Lahore",
    bedrooms: 5,
    bathrooms: 6,
    areaSize: 1,
    areaUnit: "Kanal",
    status: "active",
    titleStatus: "registry_verified",
    qualityScore: 98,
    isFraudFlagged: false,
    isFeatured: true,
    isBoosted: true,
    views: 3410,
    favorites: 142,
    inquiries: 38,
    agencyName: "Al-Miraj Real Estate & Builders",
    sellerName: "Chaudhry Farhan",
    sellerBadge: "agency_certified",
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800"],
    description: "Architectural masterpiece with Italian marble floors, bespoke imported kitchen, swimming pool, and pristine LDA title warranty.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prop_102",
    referenceId: "PK-109483",
    title: "Margalla Ridgeline Panoramic Residence",
    purpose: "buy",
    propertyType: "House",
    price: 280000000,
    city: "Islamabad",
    area: "Sector F-7/3",
    address: "Street 14, Sector F-7/3, Islamabad",
    bedrooms: 6,
    bathrooms: 7,
    areaSize: 2,
    areaUnit: "Kanal",
    status: "active",
    titleStatus: "lda_approved",
    qualityScore: 96,
    isFraudFlagged: false,
    isFeatured: true,
    isBoosted: false,
    views: 2890,
    favorites: 110,
    inquiries: 24,
    agencyName: "Capital Prime Associates",
    sellerName: "Malik Usman",
    sellerBadge: "agency_certified",
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800"],
    description: "Diplomatic enclave adjacent luxury estate with Margalla hill facing terraces, smart home automation, and heated pool.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prop_103",
    referenceId: "PK-109484",
    title: "Panoramic Oceanfront Sky Penthouse",
    purpose: "buy",
    propertyType: "Flat / Apartment",
    price: 182000000,
    city: "Karachi",
    area: "Clifton Block 4",
    address: "Emaar Crescent Bay, Karachi",
    bedrooms: 4,
    bathrooms: 5,
    areaSize: 5400,
    areaUnit: "Sq. Ft.",
    status: "active",
    titleStatus: "registry_verified",
    qualityScore: 94,
    isFraudFlagged: false,
    isFeatured: true,
    isBoosted: true,
    views: 4120,
    favorites: 195,
    inquiries: 46,
    agencyName: "Clifton Waterfront Estates",
    sellerName: "Tariq Mansoor",
    sellerBadge: "agency_certified",
    images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800"],
    description: "Direct sea-facing duplex penthouse with double-height glass facade, wraparound viewing balcony, and 3 dedicated parking bays.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prop_104",
    referenceId: "PK-109485",
    title: "Prime Commercial Corner Plot · Sector J",
    purpose: "plots",
    propertyType: "Plot",
    price: 87500000,
    city: "Lahore",
    area: "DHA Phase 9 Prism",
    address: "Commercial Broadway, DHA Phase 9 Prism",
    bedrooms: 0,
    bathrooms: 0,
    areaSize: 10,
    areaUnit: "Marla",
    status: "pending",
    titleStatus: "pending",
    qualityScore: 82,
    isFraudFlagged: false,
    isFeatured: false,
    isBoosted: false,
    views: 640,
    favorites: 28,
    inquiries: 9,
    agencyName: "DHA Prism Consultants",
    sellerName: "Raja Noman",
    sellerBadge: "identity",
    images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800"],
    description: "Direct owner corner plot with 100ft road access. Ideal for 5-storey mixed commercial building development.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prop_105",
    referenceId: "PK-109486",
    title: "Duplicate Suspicious 5 Marla Listing",
    purpose: "buy",
    propertyType: "House",
    price: 6500000,
    city: "Lahore",
    area: "Johar Town",
    address: "Block G, Johar Town, Lahore",
    bedrooms: 3,
    bathrooms: 3,
    areaSize: 5,
    areaUnit: "Marla",
    status: "pending",
    titleStatus: "pending",
    qualityScore: 42,
    isFraudFlagged: true,
    fraudReason: "Duplicate photos detected matching active listing PK-104921 with 40% under-market price anomaly.",
    isFeatured: false,
    isBoosted: false,
    views: 120,
    favorites: 2,
    inquiries: 1,
    sellerName: "Anonymous Poster",
    sellerBadge: "none",
    images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800"],
    description: "Urgent distress sale. Contact on private number immediately.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default function ListingManagement() {
  const [listings, setListings] = useState<PropertyListing[]>(mockPropertyListings);
  const [selectedListing, setSelectedListing] = useState<PropertyListing | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [fraudFilterOnly, setFraudFilterOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Real-time Firestore sync
  useEffect(() => {
    try {
      const q = query(collection(db, "properties"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: PropertyListing[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              referenceId: data.referenceId || `PK-${doc.id.substring(0, 6).toUpperCase()}`,
              title: data.title || "Untitled Property",
              purpose: data.purpose || "buy",
              propertyType: data.propertyType || data.make || "House",
              price: data.price || 0,
              city: data.city || "Lahore",
              area: data.area || data.location || "Central",
              address: data.address || `${data.area || ''}, ${data.city || ''}`,
              bedrooms: data.bedrooms || data.specs?.beds || 0,
              bathrooms: data.bathrooms || data.specs?.baths || 0,
              areaSize: data.areaSize || 1,
              areaUnit: data.areaUnit || "Kanal",
              status: data.status || "active",
              titleStatus: data.titleStatus || "pending",
              qualityScore: data.qualityScore || 85,
              isFraudFlagged: data.isFraudFlagged || false,
              fraudReason: data.fraudReason,
              isFeatured: data.isFeatured || false,
              isBoosted: data.isBoosted || false,
              views: data.views || 0,
              favorites: data.favorites || 0,
              inquiries: data.inquiries || 0,
              agencyName: data.agencyName || data.dealerName,
              sellerName: data.seller?.name || data.sellerName || "Private Seller",
              sellerBadge: data.seller?.badgeType || "identity",
              images: data.images && data.images.length > 0 ? data.images : ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800"],
              description: data.description || "",
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString()
            };
          });
          setListings(list);
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Using fallback real estate listings data", e);
    }
  }, []);

  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchSearch = item.title.toLowerCase().includes(q) || 
                          item.referenceId.toLowerCase().includes(q) || 
                          item.city.toLowerCase().includes(q) ||
                          item.area.toLowerCase().includes(q) ||
                          item.sellerName.toLowerCase().includes(q);

      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      const matchCity = cityFilter === "all" || item.city.toLowerCase() === cityFilter.toLowerCase();
      const matchType = typeFilter === "all" || item.propertyType.toLowerCase() === typeFilter.toLowerCase();
      const matchFraud = !fraudFilterOnly || item.isFraudFlagged;

      return matchSearch && matchStatus && matchCity && matchType && matchFraud;
    });
  }, [listings, searchQuery, statusFilter, cityFilter, typeFilter, fraudFilterOnly]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredListings.map(l => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Bulk Status Updates
  const handleBulkAction = (action: "approve" | "reject" | "boost" | "expire" | "delete") => {
    if (selectedIds.length === 0) return;
    if (action === "delete") {
      setListings(prev => prev.filter(l => !selectedIds.includes(l.id)));
      toast.success(`Deleted ${selectedIds.length} listings`);
    } else if (action === "approve") {
      setListings(prev => prev.map(l => selectedIds.includes(l.id) ? { ...l, status: "active" } : l));
      toast.success(`Approved ${selectedIds.length} listings`);
    } else if (action === "boost") {
      setListings(prev => prev.map(l => selectedIds.includes(l.id) ? { ...l, isBoosted: true, isFeatured: true } : l));
      toast.success(`Elevated & Boosted ${selectedIds.length} listings`);
    } else if (action === "expire") {
      setListings(prev => prev.map(l => selectedIds.includes(l.id) ? { ...l, status: "expired" } : l));
      toast.info(`Marked ${selectedIds.length} listings as expired`);
    }
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B2A86]/10 text-[#5B2A86] dark:text-[#F0A830] text-xs font-bold uppercase tracking-wider mb-2 border border-[#5B2A86]/20">
            <Building2 className="w-3.5 h-3.5" />
            <span>Master Inventory Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-apple-text dark:text-white">
            Listings Management
          </h1>
          <p className="text-xs sm:text-sm text-apple-text-muted mt-1 max-w-2xl">
            Supervise real estate listings, inspect title verification credentials, manage pricing benchmarks, and monitor AI duplicate/fraud signals.
          </p>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 p-1.5 bg-slate-900 text-white rounded-2xl shadow-xl px-3 border border-white/10 animate-fade-in">
            <span className="text-xs font-bold mr-2 text-amber-400">{selectedIds.length} selected</span>
            <Button size="sm" onClick={() => handleBulkAction("approve")} className="h-7 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
              Approve
            </Button>
            <Button size="sm" onClick={() => handleBulkAction("boost")} className="h-7 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
              Boost
            </Button>
            <Button size="sm" onClick={() => handleBulkAction("expire")} className="h-7 text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white rounded-xl">
              Expire
            </Button>
            <Button size="sm" onClick={() => handleBulkAction("delete")} className="h-7 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl">
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-2xl border-slate-200/80 dark:border-white/10 shadow-xs bg-white dark:bg-[#1E1E20]">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-apple-text-muted">Total Properties</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-2 text-slate-900 dark:text-white">
              {listings.length}
            </div>
            <span className="text-[11px] font-semibold text-slate-400 mt-1 block">
              Active & Pending Submissions
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 dark:border-white/10 shadow-xs bg-white dark:bg-[#1E1E20]">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-apple-text-muted">Title Guaranteed</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-2 text-slate-900 dark:text-white">
              {listings.filter(l => l.titleStatus === "registry_verified" || l.titleStatus === "lda_approved").length}
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 block">
              LDA / CDA Registry Validated
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 dark:border-white/10 shadow-xs bg-white dark:bg-[#1E1E20]">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-apple-text-muted">Fraud / Duplicate Flags</span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-2 text-rose-600 dark:text-rose-400">
              {listings.filter(l => l.isFraudFlagged).length}
            </div>
            <span className="text-[11px] font-semibold text-rose-500 mt-1 block">
              Requires Admin Intervention
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 dark:border-white/10 shadow-xs bg-white dark:bg-[#1E1E20]">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-apple-text-muted">Active Boosts</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-2 text-slate-900 dark:text-white">
              {listings.filter(l => l.isBoosted || l.isFeatured).length}
            </div>
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-1 block">
              High-Visibility Placements
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Freshness & Auto-Expiry Monitor */}
      <StaleListingsWidget />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#1E1E20] border border-slate-200/80 dark:border-white/10 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, Property ID (PK-...), city, society, or agency..."
            className="pl-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-transparent text-xs font-semibold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-[#F5F5F7] outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="sold">Sold</option>
            <option value="expired">Expired</option>
            <option value="rejected">Rejected</option>
          </select>

          <select 
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-[#F5F5F7] outline-none"
          >
            <option value="all">All Cities</option>
            <option value="lahore">Lahore</option>
            <option value="islamabad">Islamabad</option>
            <option value="karachi">Karachi</option>
            <option value="rawalpindi">Rawalpindi</option>
          </select>

          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-[#F5F5F7] outline-none"
          >
            <option value="all">All Types</option>
            <option value="house">House</option>
            <option value="flat / apartment">Flat / Apartment</option>
            <option value="plot">Plot</option>
            <option value="commercial">Commercial</option>
          </select>

          <Button 
            variant={fraudFilterOnly ? "destructive" : "outline"}
            size="sm"
            onClick={() => setFraudFilterOnly(!fraudFilterOnly)}
            className={cn("h-10 rounded-xl text-xs font-bold gap-1.5 cursor-pointer", fraudFilterOnly && "bg-rose-600 text-white")}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Fraud Flags Only</span>
          </Button>
        </div>
      </div>

      {/* Main Properties Table */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#1E1E20] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-white/5 border-b border-slate-200/80 dark:border-white/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 text-center py-4 pl-4">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === filteredListings.length && filteredListings.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded"
                  />
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider py-4">Property / Ref ID</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider py-4">Location</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider py-4">Specs & Size</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider py-4">Price</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider py-4 text-center">Quality / Title</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider py-4">Status</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider py-4 pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredListings.map((prop) => (
                <TableRow key={prop.id} className={cn("hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors", prop.isFraudFlagged && "bg-rose-50/20 dark:bg-rose-950/10")}>
                  <TableCell className="text-center py-4 pl-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(prop.id)}
                      onChange={() => handleToggleSelect(prop.id)}
                      className="rounded"
                    />
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-slate-200 dark:border-white/10">
                        <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover" />
                        {prop.isFeatured && (
                          <div className="absolute top-1 left-1 bg-amber-500 text-black text-[8px] font-black px-1 rounded-sm">
                            BOOST
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 max-w-[260px]">
                        <div className="font-extrabold text-xs text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                          <span>{prop.title}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5 flex items-center gap-1">
                          <span className="font-bold text-[#5B2A86] dark:text-[#C9A227]">{prop.referenceId}</span>
                          <span>·</span>
                          <span className="uppercase">{prop.purpose}</span>
                          <span>·</span>
                          <span>{prop.propertyType}</span>
                        </div>
                        {prop.agencyName && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>{prop.agencyName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {prop.area}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                      {prop.city}
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {prop.areaSize} {prop.areaUnit}
                    </div>
                    {prop.bedrooms > 0 && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 font-medium">
                        <span>{prop.bedrooms} Beds</span>
                        <span>·</span>
                        <span>{prop.bathrooms} Baths</span>
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="text-xs font-black font-mono text-slate-900 dark:text-[#F0A830]">
                      {formatPrice(prop.price)}
                    </div>
                  </TableCell>

                  <TableCell className="py-4 text-center">
                    <div className="inline-flex flex-col items-center gap-1">
                      <Badge className={cn(
                        "text-[9px] font-bold rounded-md px-1.5",
                        prop.qualityScore >= 90 ? "bg-emerald-500/10 text-emerald-600" :
                        prop.qualityScore >= 70 ? "bg-amber-500/10 text-amber-600" : "bg-rose-500/10 text-rose-600"
                      )}>
                        Score: {prop.qualityScore}%
                      </Badge>
                      {prop.titleStatus === "registry_verified" && (
                        <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Title Verified
                        </span>
                      )}
                      {prop.isFraudFlagged && (
                        <span className="text-[9px] font-bold text-rose-600 flex items-center gap-0.5">
                          <AlertTriangle className="w-3 h-3" /> Flagged
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold",
                      prop.status === "active" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
                      prop.status === "pending" && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
                      prop.status === "sold" && "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
                      prop.status === "expired" && "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20",
                      prop.status === "rejected" && "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                    )}>
                      {prop.status.toUpperCase()}
                    </span>
                  </TableCell>

                  <TableCell className="py-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setSelectedListing(prop); setIsDetailOpen(true); }}
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
                          {prop.status === "pending" && (
                            <DropdownMenuItem 
                              onClick={() => {
                                setListings(prev => prev.map(l => l.id === prop.id ? { ...l, status: "active" } : l));
                                toast.success(`Listing ${prop.referenceId} Approved`);
                              }}
                              className="text-emerald-600 font-bold text-xs cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Approve Listing
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => {
                              setListings(prev => prev.map(l => l.id === prop.id ? { ...l, isBoosted: !l.isBoosted, isFeatured: !l.isFeatured } : l));
                              toast.success(prop.isBoosted ? "Boost Removed" : "Listing Promoted to Boost & Featured Showcase");
                            }}
                            className="text-purple-600 font-bold text-xs cursor-pointer"
                          >
                            <Flame className="w-3.5 h-3.5 mr-2" /> {prop.isBoosted ? "Remove Boost" : "Boost & Feature"}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => window.open(`/property/${prop.id}`, "_blank")}
                            className="text-xs font-semibold cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5 mr-2" /> View on Site
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              setListings(prev => prev.filter(l => l.id !== prop.id));
                              toast.success(`Listing ${prop.referenceId} Deleted`);
                            }}
                            className="text-rose-600 font-bold text-xs cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Listing
                          </DropdownMenuItem>
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

      {/* Property Detail Drawer */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl rounded-3xl bg-white dark:bg-[#1E1E20] border-slate-200 dark:border-white/15 p-6 max-h-[90vh] overflow-y-auto">
          {selectedListing && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-[#5B2A86] dark:text-[#F0A830]">
                        {selectedListing.referenceId}
                      </span>
                      <Badge className="text-[10px]">{selectedListing.propertyType}</Badge>
                      <Badge variant="outline" className="text-[10px] uppercase">{selectedListing.purpose}</Badge>
                    </div>
                    <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {selectedListing.title}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      <span>{selectedListing.address}</span>
                    </DialogDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black font-mono text-[#5B2A86] dark:text-[#F0A830]">
                      {formatPrice(selectedListing.price)}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              {/* Photos Gallery */}
              <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden">
                {selectedListing.images.map((img, i) => (
                  <div key={i} className="aspect-video relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              {/* Fraud Warning Box if Flagged */}
              {selectedListing.isFraudFlagged && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300">Fraud & Anomaly Warning</h4>
                      <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5 leading-relaxed">{selectedListing.fraudReason}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Size</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">{selectedListing.areaSize} {selectedListing.areaUnit}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Bedrooms</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">{selectedListing.bedrooms} Beds</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Bathrooms</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">{selectedListing.bathrooms} Baths</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Quality Score</span>
                  <span className="text-sm font-bold text-emerald-600 mt-1 block">{selectedListing.qualityScore}% High Grade</span>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Description</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{selectedListing.description}</p>
              </div>

              {/* Seller / Agency */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Listed By</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">{selectedListing.sellerName}</span>
                  {selectedListing.agencyName && (
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">{selectedListing.agencyName}</span>
                  )}
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs">
                  {selectedListing.sellerBadge.toUpperCase()}
                </Badge>
              </div>

              <DialogFooter className="flex items-center justify-between border-t border-slate-100 dark:border-white/10 pt-4">
                <Button variant="outline" size="sm" onClick={() => setIsDetailOpen(false)} className="rounded-xl text-xs font-bold">
                  Close
                </Button>
                <div className="flex items-center gap-2">
                  {selectedListing.status === "pending" && (
                    <Button 
                      size="sm"
                      onClick={() => {
                        setListings(prev => prev.map(l => l.id === selectedListing.id ? { ...l, status: "active" } : l));
                        toast.success("Listing Approved");
                        setIsDetailOpen(false);
                      }}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                    >
                      Approve Listing
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
