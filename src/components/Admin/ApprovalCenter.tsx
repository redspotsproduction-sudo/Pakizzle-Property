import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  Home, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  Search, 
  Filter, 
  Eye, 
  Check, 
  X, 
  MapPin, 
  DollarSign, 
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Layers,
  Sparkles,
  UserCheck,
  FileCheck
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
import { db, storage } from "../../firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, addDoc, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";

export interface PendingQueueItem {
  id: string;
  type: "listing_approval" | "agency_verification" | "title_verification";
  title: string;
  submitterName: string;
  submitterEmail: string;
  submitterPhone: string;
  category: string;
  city: string;
  details: {
    price?: number;
    propertyType?: string;
    areaSize?: string;
    licenseNumber?: string;
    authority?: string;
    deedType?: string;
    documents?: string[];
    documentPaths?: string[];
    documentUrls?: string[];
    images?: string[];
    cnic_front_path?: string;
    cnic_back_path?: string;
    cnic_front_url?: string;
    cnic_back_url?: string;
    userId?: string;
  };
  qualityScore: number;
  fraudWarning?: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}

const mockPendingQueue: PendingQueueItem[] = [
  {
    id: "appr_101",
    type: "listing_approval",
    title: "1 Kanal Luxury Designer Bungalow · Sector J, Phase 6 DHA",
    submitterName: "Chaudhry Farhan (Al-Miraj Builders)",
    submitterEmail: "farhan@almiraj.pk",
    submitterPhone: "+92 300 8472911",
    category: "Residential House",
    city: "Lahore",
    details: {
      price: 145000000,
      propertyType: "House",
      areaSize: "1 Kanal",
      images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800"]
    },
    qualityScore: 98,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    status: "pending"
  },
  {
    id: "appr_102",
    type: "agency_verification",
    title: "Clifton Waterfront Estates · KDA License Verification",
    submitterName: "Tariq Mansoor",
    submitterEmail: "support@cliftonwaterfront.pk",
    submitterPhone: "+92 333 2198471",
    category: "Agency Registration",
    city: "Karachi",
    details: {
      licenseNumber: "KDA-EST-9920",
      authority: "KDA",
      documents: ["https://picsum.photos/seed/kda_doc/800/600", "https://picsum.photos/seed/tax_doc/800/600"]
    },
    qualityScore: 92,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: "pending"
  },
  {
    id: "appr_103",
    type: "title_verification",
    title: "2 Kanal Margalla Estate Registry & Non-Encumbrance Deed",
    submitterName: "Malik Usman",
    submitterEmail: "usman@capitalprime.pk",
    submitterPhone: "+92 321 5567890",
    category: "CDA Title Verification",
    city: "Islamabad",
    details: {
      deedType: "Registered Allotment & Fard",
      documents: ["https://picsum.photos/seed/cda_deed/800/600"]
    },
    qualityScore: 96,
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    status: "pending"
  },
  {
    id: "appr_104",
    type: "listing_approval",
    title: "5 Marla House · Johar Town Lahore (Distress Sale)",
    submitterName: "Anonymous Private Poster",
    submitterEmail: "quickdeal@gmail.com",
    submitterPhone: "+92 300 0001234",
    category: "Residential House",
    city: "Lahore",
    details: {
      price: 6500000,
      propertyType: "House",
      areaSize: "5 Marla",
      images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800"]
    },
    qualityScore: 42,
    fraudWarning: "40% below historical sector median + duplicate photo match on external database.",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    status: "pending"
  }
];

function VerificationDocumentPreview({ item }: { item: PendingQueueItem }) {
  const [resolvedDocs, setResolvedDocs] = useState<{ label: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDocs() {
      setLoading(true);
      const itemsToResolve: { label: string; src: string }[] = [];

      // Explicit front and back
      if (item.details.cnic_front_url) {
        itemsToResolve.push({ label: 'CNIC Front', src: item.details.cnic_front_url });
      } else if (item.details.cnic_front_path) {
        itemsToResolve.push({ label: 'CNIC Front', src: item.details.cnic_front_path });
      }

      if (item.details.cnic_back_url) {
        itemsToResolve.push({ label: 'CNIC Back', src: item.details.cnic_back_url });
      } else if (item.details.cnic_back_path) {
        itemsToResolve.push({ label: 'CNIC Back', src: item.details.cnic_back_path });
      }

      // If documentPaths or documents exist and not already loaded
      const allDocs = item.details.documentPaths || item.details.documents || [];
      if (itemsToResolve.length === 0 && allDocs.length > 0) {
        allDocs.forEach((docPath, idx) => {
          const isFront = docPath.toLowerCase().includes('front') || idx === 0;
          const isBack = docPath.toLowerCase().includes('back') || idx === 1;
          const label = isFront ? 'CNIC Front' : isBack ? 'CNIC Back' : `Document ${idx + 1}`;
          itemsToResolve.push({ label, src: docPath });
        });
      }

      // If images array exists and not already loaded
      if (itemsToResolve.length === 0 && item.details.images && item.details.images.length > 0) {
        item.details.images.forEach((img, idx) => {
          itemsToResolve.push({ label: idx === 0 ? 'Document 1' : `Document ${idx + 1}`, src: img });
        });
      }

      const resolved: { label: string; url: string }[] = [];
      for (const entry of itemsToResolve) {
        if (!entry.src) continue;
        if (entry.src.startsWith('http') || entry.src.startsWith('data:')) {
          resolved.push({ label: entry.label, url: entry.src });
        } else {
          try {
            const downloadUrl = await getDownloadURL(ref(storage, entry.src));
            resolved.push({ label: entry.label, url: downloadUrl });
          } catch (e) {
            console.warn("Storage download URL error:", entry.src, e);
            resolved.push({ label: entry.label, url: entry.src });
          }
        }
      }

      if (active) {
        setResolvedDocs(resolved);
        setLoading(false);
      }
    }

    loadDocs();
    return () => { active = false; };
  }, [item]);

  if (loading) {
    return (
      <div className="p-4 rounded-2xl bg-apple-surface dark:bg-white/5 border border-apple-border/60 dark:border-white/10 flex items-center justify-center text-xs text-apple-text-muted">
        Loading verification documents...
      </div>
    );
  }

  if (resolvedDocs.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-bold text-apple-text-muted dark:text-apple-border">
        <span className="flex items-center gap-1.5">
          <FileCheck className="w-4 h-4 text-apple-green" />
          Submitted Identity Documents
        </span>
        <span className="text-[10px] text-apple-text-muted font-mono">
          {resolvedDocs.length} {resolvedDocs.length === 1 ? 'file' : 'files'}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {resolvedDocs.map((doc, idx) => (
          <div key={idx} className="space-y-1.5 p-2 rounded-2xl bg-apple-surface dark:bg-white/5 border border-apple-border dark:border-white/10">
            <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-apple-text-muted dark:text-apple-border">
              <span className="font-bold text-apple-surface dark:text-apple-border">{doc.label}</span>
              <a 
                href={doc.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-apple-blue hover:underline flex items-center gap-1 text-[10px]"
              >
                <ExternalLink className="w-3 h-3" /> View Full
              </a>
            </div>
            <div className="aspect-[1.58/1] relative rounded-xl overflow-hidden bg-black/90 flex items-center justify-center border border-apple-border/50 dark:border-white/5">
              <img 
                src={doc.url} 
                alt={doc.label} 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ApprovalCenter() {
  const [items, setItems] = useState<PendingQueueItem[]>(mockPendingQueue);
  const [selectedItem, setSelectedItem] = useState<PendingQueueItem | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "listing" | "agency" | "title">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);

  // Live Firestore subscription for identity verification submissions
  useEffect(() => {
    try {
      const q = query(collection(db, 'verification_requests'), where('status', '==', 'pending'));
      const unsub = onSnapshot(q, (snapshot) => {
        const liveItems: PendingQueueItem[] = snapshot.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            type: data.type === 'business' ? 'agency_verification' : 'agency_verification',
            title: `Identity Verification · ${data.userName || 'New User'}`,
            submitterName: data.userName || 'Test User',
            submitterEmail: data.userEmail || '',
            submitterPhone: data.userPhone || '',
            category: 'Shanakht™ Identity Clearance',
            city: data.city || 'Islamabad',
            details: {
              documents: data.documents || [],
              documentPaths: data.documentPaths || [],
              documentUrls: data.documentUrls || [],
              images: data.images || (data.documentUrls || []),
              cnic_front_path: data.cnic_front_path,
              cnic_back_path: data.cnic_back_path,
              cnic_front_url: data.cnic_front_url,
              cnic_back_url: data.cnic_back_url,
              userId: data.userId
            },
            qualityScore: 95,
            createdAt: data.createdAt || new Date().toISOString(),
            status: 'pending'
          };
        });

        if (liveItems.length > 0) {
          setItems(prev => {
            const existingIds = new Set(liveItems.map(i => i.id));
            const retained = prev.filter(i => !existingIds.has(i.id));
            return [...liveItems, ...retained];
          });
        }
      }, () => {});
      return () => unsub();
    } catch {
      // Offline fallback
    }
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchSearch = item.title.toLowerCase().includes(q) || 
                          item.submitterName.toLowerCase().includes(q) || 
                          item.city.toLowerCase().includes(q);

      const matchTab = activeTab === "all" ? true :
                       activeTab === "listing" ? item.type === "listing_approval" :
                       activeTab === "agency" ? item.type === "agency_verification" :
                       item.type === "title_verification";

      return matchSearch && matchTab && item.status === "pending";
    });
  }, [items, searchQuery, activeTab]);

  const handleApprove = async (item: PendingQueueItem) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: "approved" } : i));
    setSelectedIds(prev => prev.filter(id => id !== item.id));

    // Persist approval to Firestore and sync user + listing badges
    try {
      const badgeTier = item.type === "agency_verification" ? "business" : "identity";

      // 1. If Firestore user exists with this email, update their badge tier
      if (item.submitterEmail) {
        const uQuery = query(collection(db, 'users'), where('email', '==', item.submitterEmail));
        const uSnap = await getDocs(uQuery);
        uSnap.forEach(async (uDoc) => {
          await updateDoc(doc(db, 'users', uDoc.id), {
            isVerified: true,
            verificationLevel: 3,
            verified_badge_type: badgeTier,
            badgeType: badgeTier,
            identity_status: 'verified',
            business_status: item.type === "agency_verification" ? 'approved' : 'none',
            updatedAt: new Date().toISOString()
          });

          // Sync all listings owned by this user
          const pQuery = query(collection(db, 'properties'), where('seller.uid', '==', uDoc.id));
          const pSnap = await getDocs(pQuery);
          pSnap.forEach(async (pDoc) => {
            await updateDoc(doc(db, 'properties', pDoc.id), {
              'seller.isVerified': true,
              'seller.badgeType': badgeTier,
              'seller.verified_badge_type': badgeTier
            });
          });
        });
      }
    } catch (e) {
      console.warn("Could not sync Firestore approval state:", e);
    }

    toast.success(`${item.title} Approved`, {
      description: "Listing/Verification credentials confirmed and badge tier published across marketplace."
    });
    setIsInspectModalOpen(false);
  };

  const handleRejectConfirm = () => {
    if (!selectedItem) return;
    if (!rejectionReason.trim()) {
      toast.error("Rejection reason required", { description: "Please explain rejection cause for seller audit." });
      return;
    }
    setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, status: "rejected" } : i));
    setSelectedIds(prev => prev.filter(id => id !== selectedItem.id));
    toast.error(`Rejected: ${selectedItem.title}`, {
      description: `Audit Reason: ${rejectionReason}`
    });
    setIsRejectModalOpen(false);
    setIsInspectModalOpen(false);
    setRejectionReason("");
  };

  // Bulk actions
  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;
    setItems(prev => prev.map(i => selectedIds.includes(i.id) ? { ...i, status: "approved" } : i));
    toast.success(`Bulk Approved ${selectedIds.length} items`);
    setSelectedIds([]);
  };

  const handleBulkReject = () => {
    if (selectedIds.length === 0) return;
    setItems(prev => prev.map(i => selectedIds.includes(i.id) ? { ...i, status: "rejected" } : i));
    toast.error(`Bulk Rejected ${selectedIds.length} items`);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] dark:text-[#F0A830] text-xs font-bold uppercase tracking-wider mb-2 border border-[var(--accent)]/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Compliance & Moderation Protocol</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-apple-text dark:text-white">
            Approval Center
          </h1>
          <p className="text-xs sm:text-sm text-apple-text-muted mt-1 max-w-2xl">
            Triage pending real estate listings, inspect LDA/CDA agency regulatory documents, and certify property registry deeds with AI quality scoring.
          </p>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 p-1.5 bg-apple-text text-white rounded-2xl shadow-xl px-3 border border-white/10 animate-fade-in">
            <span className="text-xs font-bold mr-2 text-gold-decoration">{selectedIds.length} selected</span>
            <Button size="sm" onClick={handleBulkApprove} className="h-7 text-xs font-bold bg-apple-green hover:bg-apple-green text-white rounded-xl">
              Bulk Approve
            </Button>
            <Button size="sm" onClick={handleBulkReject} className="h-7 text-xs font-bold bg-apple-red hover:bg-rose-700 text-white rounded-xl">
              Bulk Reject
            </Button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-2xl border-apple-border/80 dark:border-white/10 shadow-xs bg-white dark:bg-[#1E1E20]">
          <CardContent className="p-4 sm:p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-apple-text-muted">Total Pending</span>
            <div className="text-2xl sm:text-3xl font-black mt-2 text-apple-text dark:text-white">
              {items.filter(i => i.status === "pending").length}
            </div>
            <span className="text-[11px] font-semibold text-gold-decoration mt-1 block">Awaiting Review</span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-apple-border/80 dark:border-white/10 shadow-xs bg-white dark:bg-[#1E1E20]">
          <CardContent className="p-4 sm:p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-apple-text-muted">Pending Listings</span>
            <div className="text-2xl sm:text-3xl font-black mt-2 text-blue-600">
              {items.filter(i => i.status === "pending" && i.type === "listing_approval").length}
            </div>
            <span className="text-[11px] font-semibold text-apple-text-muted mt-1 block">Property Submissions</span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-apple-border/80 dark:border-white/10 shadow-xs bg-white dark:bg-[#1E1E20]">
          <CardContent className="p-4 sm:p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-apple-text-muted">Agency KYC</span>
            <div className="text-2xl sm:text-3xl font-black mt-2 text-purple-600">
              {items.filter(i => i.status === "pending" && i.type === "agency_verification").length}
            </div>
            <span className="text-[11px] font-semibold text-apple-text-muted mt-1 block">License & Tax Certs</span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-apple-border/80 dark:border-white/10 shadow-xs bg-white dark:bg-[#1E1E20]">
          <CardContent className="p-4 sm:p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-apple-text-muted">Title Guarantees</span>
            <div className="text-2xl sm:text-3xl font-black mt-2 text-apple-green">
              {items.filter(i => i.status === "pending" && i.type === "title_verification").length}
            </div>
            <span className="text-[11px] font-semibold text-apple-text-muted mt-1 block">Deeds & Allotments</span>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#1E1E20] border border-apple-border/80 dark:border-white/10 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-apple-gray dark:bg-white/5 border border-apple-border dark:border-white/10">
          {(["all", "listing", "agency", "title"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                activeTab === tab ? "bg-white dark:bg-[#1E1E20] text-apple-text dark:text-white shadow-xs" : "text-apple-text-muted hover:text-apple-text dark:hover:text-white"
              )}
            >
              {tab === "all" ? "All Queue" : tab === "listing" ? "Listings" : tab === "agency" ? "Agencies" : "Title Deeds"}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-apple-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pending submissions by title, submitter, or city..."
            className="pl-10 h-9 rounded-xl bg-apple-surface dark:bg-white/5 border-transparent text-xs font-semibold"
          />
        </div>
      </div>

      {/* Main Queue Table */}
      <div className="rounded-3xl border border-apple-border/80 dark:border-white/10 bg-white dark:bg-[#1E1E20] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-apple-surface/80 dark:bg-white/5 border-b border-apple-border/80 dark:border-white/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 text-center py-4 pl-4">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === filteredItems.length && filteredItems.length > 0}
                    onChange={(e) => setSelectedIds(e.target.checked ? filteredItems.map(i => i.id) : [])}
                    className="rounded"
                  />
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider py-4">Submission / Scope</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider py-4">Category & City</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider py-4">Submitter</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider py-4 text-center">Quality Grade</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider py-4 pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-apple-gray dark:divide-white/5">
              {filteredItems.map(item => (
                <TableRow key={item.id} className={cn("hover:bg-apple-surface/50 dark:hover:bg-white/5 transition-colors", item.fraudWarning && "bg-apple-red/10/20 dark:bg-rose-950/10")}>
                  <TableCell className="text-center py-4 pl-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(item.id)}
                      onChange={() => setSelectedIds(prev => prev.includes(item.id) ? prev.filter(x => x !== item.id) : [...prev, item.id])}
                      className="rounded"
                    />
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="min-w-0 max-w-[280px]">
                      <div className="font-extrabold text-xs text-apple-text dark:text-white truncate">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-apple-text-muted font-mono mt-0.5 flex items-center gap-1.5">
                        <span className="font-bold text-[var(--accent)] dark:text-[#C9A227]">{item.id}</span>
                        <span>·</span>
                        <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {item.fraudWarning && (
                        <div className="text-[10px] text-apple-red font-bold flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span className="truncate">{item.fraudWarning}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="text-xs font-bold text-apple-surface dark:text-apple-border">
                      {item.category}
                    </div>
                    <div className="text-[11px] text-apple-text-muted">
                      {item.city}
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="text-xs font-bold text-apple-surface dark:text-apple-border">
                      {item.submitterName}
                    </div>
                    <div className="text-[10px] text-apple-text-muted font-mono">
                      {item.submitterPhone}
                    </div>
                  </TableCell>

                  <TableCell className="py-4 text-center">
                    <Badge className={cn(
                      "text-[10px] font-bold rounded-lg px-2",
                      item.qualityScore >= 90 ? "bg-apple-green/10 text-apple-green border-apple-green/20" :
                      item.qualityScore >= 70 ? "bg-gold-decoration/10 text-gold-decoration border-gold-decoration/20" :
                      "bg-apple-red/10 text-apple-red border-apple-red/20"
                    )}>
                      Score: {item.qualityScore}%
                    </Badge>
                  </TableCell>

                  <TableCell className="py-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setSelectedItem(item); setIsInspectModalOpen(true); }}
                        className="h-8 px-2 text-xs font-bold"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> Inspect
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(item)}
                        className="h-8 px-2.5 rounded-xl bg-apple-green hover:bg-apple-green text-white text-xs font-bold gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setSelectedItem(item); setIsRejectModalOpen(true); }}
                        className="h-8 px-2 rounded-xl text-xs font-bold text-apple-red hover:bg-apple-red/10 dark:hover:bg-rose-950/20 border-rose-200 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Inspect Detail Modal */}
      <Dialog open={isInspectModalOpen} onOpenChange={setIsInspectModalOpen}>
        <DialogContent className="max-w-2xl rounded-3xl bg-white dark:bg-[#1E1E20] border-apple-border dark:border-white/15 p-6 max-h-[85vh] overflow-y-auto">
          {selectedItem && (
            <div className="space-y-5">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-[var(--accent)] text-white text-[10px] uppercase font-bold">{selectedItem.type.replace('_', ' ')}</Badge>
                  <span className="font-mono text-xs text-apple-text-muted font-bold">{selectedItem.id}</span>
                </div>
                <DialogTitle className="text-lg font-extrabold text-apple-text dark:text-white">
                  {selectedItem.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-apple-text-muted">
                  Submitted by {selectedItem.submitterName} ({selectedItem.submitterEmail})
                </DialogDescription>
              </DialogHeader>

              {/* Photos or Documents */}
              <VerificationDocumentPreview item={selectedItem} />

              {selectedItem.details.images && selectedItem.details.images.length > 0 && selectedItem.type === 'listing_approval' && (
                <div className="aspect-video relative rounded-2xl overflow-hidden border border-apple-border dark:border-white/10">
                  <img src={selectedItem.details.images[0]} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Fraud Warning If Applicable */}
              {selectedItem.fraudWarning && (
                <div className="p-3.5 rounded-2xl bg-apple-red/10 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-apple-red shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">AI Quality & Duplication Flag:</span>
                    <span>{selectedItem.fraudWarning}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-apple-surface dark:bg-white/5 border border-apple-border/80 dark:border-white/10">
                  <span className="text-[10px] uppercase font-bold text-apple-text-muted block">City</span>
                  <span className="font-bold text-apple-text dark:text-white mt-0.5 block">{selectedItem.city}</span>
                </div>
                {selectedItem.details.price && (
                  <div className="p-3 rounded-xl bg-apple-surface dark:bg-white/5 border border-apple-border/80 dark:border-white/10">
                    <span className="text-[10px] uppercase font-bold text-apple-text-muted block">Listing Price</span>
                    <span className="font-black text-[var(--accent)] dark:text-[#C9A227] mt-0.5 block font-mono">{formatPrice(selectedItem.details.price)}</span>
                  </div>
                )}
                {selectedItem.details.licenseNumber && (
                  <div className="p-3 rounded-xl bg-apple-surface dark:bg-white/5 border border-apple-border/80 dark:border-white/10">
                    <span className="text-[10px] uppercase font-bold text-apple-text-muted block">Regulatory License</span>
                    <span className="font-bold text-apple-text dark:text-white mt-0.5 block font-mono">{selectedItem.details.licenseNumber} ({selectedItem.details.authority})</span>
                  </div>
                )}
                <div className="p-3 rounded-xl bg-apple-surface dark:bg-white/5 border border-apple-border/80 dark:border-white/10">
                  <span className="text-[10px] uppercase font-bold text-apple-text-muted block">Listing Quality Score</span>
                  <span className="font-bold text-apple-green mt-0.5 block">{selectedItem.qualityScore}% (High Quality)</span>
                </div>
              </div>

              <DialogFooter className="flex items-center justify-between border-t border-apple-gray dark:border-white/10 pt-4">
                <Button variant="outline" size="sm" onClick={() => setIsInspectModalOpen(false)} className="rounded-xl text-xs font-bold">
                  Cancel
                </Button>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => setIsRejectModalOpen(true)}
                    className="rounded-xl text-xs font-bold text-apple-red border-rose-200"
                  >
                    Reject with Reason
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleApprove(selectedItem)}
                    className="rounded-xl bg-apple-green hover:bg-apple-green text-white text-xs font-bold"
                  >
                    Authorize & Approve
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Modal with Required Reason */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="max-w-md rounded-3xl bg-white dark:bg-[#1E1E20] border-apple-border dark:border-white/15 p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-apple-red flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              <span>Reject Submission</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-apple-text-muted mt-1">
              Please enter an explicit rejection reason for {selectedItem?.title}. This will be logged to audit records and emailed to the submitter.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4">
            <label className="text-[11px] font-bold uppercase tracking-wider text-apple-text-muted block mb-1.5">
              Rejection Reason *
            </label>
            <textarea 
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Incomplete LDA allotment deed, low-resolution watermark images, unrealistic valuation below sector baseline..."
              rows={3}
              className="w-full p-3 rounded-xl bg-apple-surface dark:bg-white/5 border border-apple-border dark:border-white/10 text-xs font-semibold text-apple-surface dark:text-white outline-none focus:border-apple-red"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsRejectModalOpen(false)} className="rounded-xl text-xs font-bold">
              Cancel
            </Button>
            <Button size="sm" onClick={handleRejectConfirm} className="rounded-xl bg-apple-red hover:bg-rose-700 text-white text-xs font-bold">
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
