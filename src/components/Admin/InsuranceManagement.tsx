import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Clock3,
  X,
  ChevronRight,
  ExternalLink,
  Save,
  Loader2,
  FileText,
  CreditCard,
  Target,
  Car,
  Plus,
  Building2,
  Percent,
  Activity,
  Trash2,
  Star,
  Image as ImageIcon
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp,
  addDoc,
  deleteDoc,
  setDoc
} from 'firebase/firestore';
import { db } from "@/firebase";
import { cn, formatPrice } from "@/lib/utils";
import { toast } from 'sonner';
import { InsuranceRequest } from "@/types";
import { useAuth } from "@/context/AuthContext";

interface InsuranceCompany {
  id: string;
  name: string;
  logoUrl: string;
  rate: string;
  trackerFee: string;
  description: string;
  contactPhone: string;
  contactEmail: string;
  isFeatured: boolean;
  order: number;
  status: 'active' | 'hidden';
}

export default function InsuranceManagement() {
  const { isAdmin, isModerator } = useAuth();
  const [activeTab, setActiveTab] = useState<'requests' | 'companies'>('requests');
  
  // Requests State
  const [requests, setRequests] = useState<InsuranceRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InsuranceRequest['status'] | 'all'>('all');
  const [selectedRequest, setSelectedRequest] = useState<InsuranceRequest | null>(null);
  
  // Companies State
  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<InsuranceCompany | null>(null);
  const [companyForm, setCompanyForm] = useState<Omit<InsuranceCompany, 'id'>>({
    name: '',
    logoUrl: '',
    rate: '',
    trackerFee: '',
    description: '',
    contactPhone: '',
    contactEmail: '',
    isFeatured: false,
    order: 0,
    status: 'active'
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  // Edit states for requests
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<InsuranceRequest['status']>('pending');
  const [editPolicyNumber, setEditPolicyNumber] = useState('');
  const [editQuoteAmount, setEditQuoteAmount] = useState<number>(0);
  const [editExpiryDate, setEditExpiryDate] = useState('');

  useEffect(() => {
    if (!isAdmin && !isModerator) return;

    // Listen to requests
    const qRequests = query(collection(db, 'insurance_requests'), orderBy('createdAt', 'desc'));
    const unsubscribeRequests = onSnapshot(qRequests, (snapshot) => {
      const today = new Date().toISOString().split('T')[0];
      const docs = snapshot.docs.map(docSnap => {
        const data = docSnap.data() as InsuranceRequest;
        const id = docSnap.id;

        // Auto-expire logic: If status is 'active' but expiry has passed, update to 'expired'
        if (data.status === 'active' && data.expiryDate && data.expiryDate < today) {
          // Perform background update to sync database
          updateDoc(doc(db, 'insurance_requests', id), {
            status: 'expired',
            deploymentStatus: 'Coverage Terminated',
            updatedAt: serverTimestamp()
          }).catch(console.error);
          
          return { ...data, id, status: 'expired', deploymentStatus: 'Coverage Terminated' } as InsuranceRequest;
        }

        return { id, ...data } as InsuranceRequest;
      });
      setRequests(docs);
      setRequestsLoading(false);
    });

    // Listen to companies
    const qCompanies = query(collection(db, 'insurance_companies'), orderBy('order', 'asc'));
    const unsubscribeCompanies = onSnapshot(qCompanies, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InsuranceCompany));
      setCompanies(docs);
      setCompaniesLoading(false);
    }, (error) => {
      console.error("Error fetching insurance companies:", error);
      toast.error("Error loading insurance partners");
      setCompaniesLoading(false);
    });

    return () => {
      unsubscribeRequests();
      unsubscribeCompanies();
    };
  }, [isAdmin, isModerator]);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.deploymentId && request.deploymentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      request.vehicleMake.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.phone.includes(searchQuery) ||
      request.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.policyNumber && request.policyNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: InsuranceRequest['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      case 'quote_sent': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'payment_received': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      case 'expired': return 'bg-red-500/10 text-red-600 dark:text-red-400';
      case 'cancelled': return 'bg-apple-text-muted/10 text-apple-text-muted dark:text-apple-text-muted';
      default: return 'bg-apple-text-muted/10 text-apple-text-muted dark:text-apple-text-muted';
    }
  };

  const handleUpdateRequest = async () => {
    if (!selectedRequest) return;
    
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'insurance_requests', selectedRequest.id), {
        status: editStatus,
        adminNotes: editNotes,
        policyNumber: editPolicyNumber,
        quoteAmount: editQuoteAmount,
        expiryDate: editExpiryDate || null,
        updatedAt: serverTimestamp()
      });
      toast.success("Insurance record updated successfully");
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error updating insurance request:", error);
      toast.error("Failed to update record");
    } finally {
      setIsUpdating(false);
    }
  };

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
        await updateDoc(doc(db, 'insurance_companies', editingCompany.id), {
          ...companyForm,
          updatedAt: serverTimestamp()
        });
        toast.success("Provider updated successfully");
      } else {
        await addDoc(collection(db, 'insurance_companies'), {
          ...companyForm,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        toast.success("Provider added successfully");
      }
      setIsCompanyModalOpen(false);
      setEditingCompany(null);
      resetCompanyForm();
    } catch (error) {
      console.error("Error managing company:", error);
      toast.error("Failed to save provider");
    } finally {
      setIsUpdating(false);
    }
  };

  const resetCompanyForm = () => {
    setCompanyForm({
      name: '',
      logoUrl: '',
      rate: '',
      trackerFee: '',
      description: '',
      contactPhone: '',
      contactEmail: '',
      isFeatured: false,
      order: 0,
      status: 'active'
    });
  };

  const seedProviders = async () => {
    if (!window.confirm("This will inject 4 major Pakistani insurance providers into your terminal. Continue?")) return;
    
    setIsUpdating(true);
    const initialProviders = [
      {
        name: "Jubilee General Insurance",
        logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6sW0B6H8jQ6k-R8H-vM-S-L_V-B-X-l_V-Q&s",
        rate: "Starting from 1.4%",
        trackerFee: "Rs. 15,000",
        description: "One of the oldest and most trusted names in the industry.",
        contactEmail: "info@jubileegeneral.com.pk",
        contactPhone: "021-111-654-111",
        isFeatured: true,
        order: 1,
        status: "active" as const
      },
      {
        name: "Adamjee Insurance",
        logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-G-G-G-G-G-G-G-G-G-G-G-G-G-G-G-G-G&s",
        rate: "Starting from 1.6%",
        trackerFee: "Rs. 12,500",
        description: "Known for their fast claim settlement and wide network.",
        contactEmail: "contact@adamjeeinsurance.com",
        contactPhone: "021-111-242-111",
        isFeatured: false,
        order: 2,
        status: "active" as const
      },
      {
        name: "EFU General Insurance",
        logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-G-G-G-G-G-G-G-G-G-G-G-G-G-G-G-G-G&s",
        rate: "Starting from 1.5%",
        trackerFee: "Rs. 14,000",
        description: "Large customer base with comprehensive coverage options.",
        contactEmail: "customercare@efuinsurance.com",
        contactPhone: "021-111-338-111",
        isFeatured: true,
        order: 3,
        status: "active" as const
      },
      {
        name: "TPL Insurance",
        logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-G-G-G-G-G-G-G-G-G-G-G-G-G-G-G-G-G&s",
        rate: "Starting from 1.8%",
        trackerFee: "Free with Policy",
        description: "Modern, app-first insurance experience with fast quotes.",
        contactEmail: "info@tplinsurance.com",
        contactPhone: "021-111-000-875",
        isFeatured: false,
        order: 4,
        status: "active" as const
      }
    ];

    try {
      for (const provider of initialProviders) {
        await addDoc(collection(db, 'insurance_companies'), {
          ...provider,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      toast.success("Ecosystem populated with Tier-1 partners");
    } catch (error) {
      console.error("Error seeding providers:", error);
      toast.error("Failed to seed providers");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (!window.confirm("Are you sure you want to terminate this provider partnership?")) return;
    try {
      await deleteDoc(doc(db, 'insurance_companies', id));
      toast.success("Provider record purged");
    } catch (error) {
      toast.error("Failed to delete record");
    }
  };

  const openEditModal = (request: InsuranceRequest) => {
    setSelectedRequest(request);
    setEditStatus(request.status);
    setEditNotes(request.adminNotes || '');
    setEditPolicyNumber(request.policyNumber || '');
    setEditQuoteAmount(request.quoteAmount || 0);
    setEditExpiryDate(request.expiryDate || '');
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions - EXACT match with Approval Center layout and sizing */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <Shield className="w-3.5 h-3.5" />
            Verified Administration Console
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-tight">
            Insurance Protocol
          </h1>
          <p className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-secondary)] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            Manage risk assessment, premium underwriting, and integrated policy providers from this terminal.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start md:self-end">
          {/* Tab Switcher modeled after standard segment controls */}
          <div className="flex p-0.5 bg-[var(--text-primary)] dark:bg-white/5 rounded-xl border border-black/[0.04] dark:border-white/[0.04] self-start">
            <button
              onClick={() => setActiveTab('requests')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                activeTab === 'requests'
                  ? "bg-white dark:bg-[var(--bg-raised)] shadow-sm text-[var(--text-primary)] dark:text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white"
              )}
            >
              Policy Requests
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                activeTab === 'companies'
                  ? "bg-white dark:bg-[var(--bg-raised)] shadow-sm text-[var(--text-primary)] dark:text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white"
              )}
            >
              Providers
            </button>
          </div>

          {activeTab === 'requests' && (
            <div className="relative group min-w-[200px] sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] group-focus-within:text-apple-blue transition-colors duration-300" />
              <input
                type="text"
                placeholder="Search policies, vehicles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--text-primary)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 rounded-xl text-xs font-medium focus:ring-0 outline-none transition-all duration-300 shadow-inner"
              />
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="flex items-center gap-2">
              {companies.length === 0 && (
                <button 
                  onClick={seedProviders}
                  disabled={isUpdating}
                  className="rounded-xl border border-black/[0.04] dark:border-white/[0.04] bg-white dark:bg-[var(--bg-surface)] h-9 px-4 text-xs font-semibold shadow-sm hover:bg-[var(--text-primary)] dark:hover:bg-white/5 text-[var(--text-primary)] dark:text-white transition-all flex items-center justify-center"
                >
                  <Activity className="w-3.5 h-3.5 mr-1.5 text-apple-blue" /> Seed Providers
                </button>
              )}
              <button
                onClick={() => {
                  resetCompanyForm();
                  setEditingCompany(null);
                  setIsCompanyModalOpen(true);
                }}
                className="apple-button-primary bg-apple-blue hover:bg-apple-blue/90 text-white rounded-xl h-9 px-4 text-xs font-semibold shadow-sm border-none transition-all flex items-center justify-center"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Partner
              </button>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'requests' ? (
        <div className="space-y-6">
          {/* Stats - EXACT match with Approval Center card format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Policy Requests', value: requests.length.toString(), change: 'Underwriting Queue', icon: FileText, color: 'text-apple-blue', bg: 'bg-apple-blue/10' },
              { label: 'Pending Review', value: requests.filter(r => r.status === 'pending').length.toString(), change: 'Awaiting Audit', icon: Clock3, color: 'text-apple-orange', bg: 'bg-apple-orange/10' },
              { label: 'Active Coverage', value: requests.filter(r => r.status === 'active').length.toString(), change: 'Active Policies', icon: Shield, color: 'text-apple-green', bg: 'bg-apple-green/10' },
              { label: 'Awaiting Payment', value: requests.filter(r => r.status === 'quote_sent').length.toString(), change: 'Payments Due', icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300 group">
                <div className="flex items-start justify-between">
                  <div className={cn("p-3 rounded-xl group-hover:scale-105 transition-transform duration-500", stat.bg)}>
                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                  </div>
                  <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                     {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-none">{stat.value}</div>
                  <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mt-1.5">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Filter HUD - EXACT match with Approval Center tabs style */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0" style={{ WebkitOverflowScrolling: 'touch' }}>
            {['all', 'pending', 'quote_sent', 'payment_received', 'active', 'expired', 'cancelled'].map((status) => {
              const count = status === 'all' 
                ? requests.length 
                : requests.filter(r => r.status === status).length;
              const isActive = statusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as any)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border",
                    isActive
                      ? "bg-apple-blue text-white border-apple-blue shadow-sm"
                      : "bg-white dark:bg-[var(--bg-surface)] border-black/[0.04] dark:border-white/[0.04] text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white"
                  )}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')} <span className={cn("ml-1 py-0.5 px-1.5 rounded-full text-[9px] font-bold font-mono", isActive ? "bg-white/25 text-white" : "bg-[var(--text-primary)] dark:bg-white/5 text-[var(--text-secondary)]")}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Table List - EXACT border, background and hover transition as Approval Center card */}
          <div className="bg-white dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)] pl-6">Vehicle & Value</th>
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)]">Insured Profile</th>
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)]">Policy Details</th>
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)]">Status</th>
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)] text-right pr-6">Command</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.03]">
                  {requestsLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="px-6 py-6 pl-6">
                          <div className="h-4 bg-apple-gray dark:bg-white/5 rounded-full w-3/4 mb-2"></div>
                          <div className="h-3 bg-apple-gray dark:bg-white/5 rounded-full w-1/2 opacity-50"></div>
                        </td>
                      </tr>
                    ))
                  ) : filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-[var(--text-secondary)] font-medium text-xs">
                        No policy records found in the encrypted database.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request) => (
                      <tr 
                        key={request.id} 
                        onClick={() => openEditModal(request)}
                        className="group border-b border-black/[0.03] dark:border-white/[0.03] last:border-b-0 hover:bg-[var(--text-primary)]/40 dark:hover:bg-white/[0.01] transition-all cursor-pointer"
                      >
                        <td className="px-6 py-4.5 pl-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-apple-blue/10 flex items-center justify-center text-apple-blue shrink-0 border border-black/[0.06] dark:border-white/[0.06]">
                              <Car className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-semibold text-sm tracking-tight text-[var(--text-primary)] dark:text-white">
                                {request.vehicleYear} {request.vehicleMake}
                              </div>
                              <div className="text-[10px] font-medium text-[var(--text-secondary)] mt-0.5">
                                {formatPrice(request.vehicleValue)} Value
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4.5">
                          <div>
                            <div className="font-semibold text-sm text-[var(--text-primary)] dark:text-white">{request.phone}</div>
                            <div className="text-[10px] font-medium text-[var(--text-secondary)] mt-0.5">{request.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4.5">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-primary)] dark:text-white">
                              <Target className="w-3.5 h-3.5 text-apple-blue" />
                              {request.policyNumber || 'NOT ISSUED'}
                            </div>
                            <div className="text-[10px] font-medium text-[var(--text-secondary)]">
                              {request.status === 'active' ? `Exp: ${new Date(request.expiryDate!).toLocaleDateString()}` : 'Awaiting Issue'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4.5">
                          <span className={cn(
                            "px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border-none shadow-none",
                            getStatusColor(request.status)
                          )}>
                            {request.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => openEditModal(request)}
                            className="h-9 w-9 rounded-xl flex items-center justify-center transition-all hover:bg-[var(--text-primary)] dark:hover:bg-white/10 text-[var(--text-secondary)] active:scale-95 shadow-none"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companiesLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-white dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] h-64 animate-pulse" />
              ))
            ) : companies.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04]">
                <p className="text-[var(--text-secondary)] font-medium text-xs">No insurance providers registered.</p>
              </div>
            ) : (
              companies.map((company) => (
                <motion.div
                  key={company.id}
                  layoutId={company.id}
                  className="bg-white dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden flex flex-col hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300 group"
                >
                  <div className="p-6 flex-1 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="w-16 h-16 rounded-xl bg-[var(--text-primary)] dark:bg-white/5 p-2 flex items-center justify-center overflow-hidden border border-black/[0.06] dark:border-white/[0.06]">
                        <img 
                          src={company.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=007AFF&color=fff`} 
                          alt={company.name}
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex gap-2">
                        {company.isFeatured && (
                          <div className="px-2 py-1 bg-yellow-500/10 text-yellow-600 rounded-lg">
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </div>
                        )}
                        <span className={cn(
                          "px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider",
                          company.status === 'active' ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--danger)]/10 text-[var(--danger)]"
                        )}>
                          {company.status}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold tracking-tight text-[var(--text-primary)] dark:text-white mb-1.5">{company.name}</h3>
                      <p className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-secondary)]/80 line-clamp-2 leading-relaxed mb-4">{company.description}</p>
                      <div className="flex items-center gap-4 text-[var(--text-secondary)]">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-apple-blue">
                          <Percent className="w-4 h-4" />
                          {company.rate}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--success)]">
                          <Activity className="w-4 h-4" />
                          Tracker: {company.trackerFee}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--text-primary)]/40 dark:bg-white/[0.02] border-t border-black/[0.04] dark:border-white/[0.04] flex gap-3">
                    <button 
                      onClick={() => {
                        setEditingCompany(company);
                        setCompanyForm({
                          name: company.name || '',
                          logoUrl: company.logoUrl || '',
                          rate: company.rate || '',
                          trackerFee: company.trackerFee || '',
                          description: company.description || '',
                          contactPhone: company.contactPhone || '',
                          contactEmail: company.contactEmail || '',
                          isFeatured: company.isFeatured || false,
                          order: company.order || 0,
                          status: company.status || 'active'
                        });
                        setIsCompanyModalOpen(true);
                      }}
                      className="flex-1 h-9 rounded-xl border border-black/[0.06] dark:border-white/[0.06] text-[10px] font-bold uppercase tracking-wider hover:bg-[var(--text-primary)] dark:hover:bg-white/10 text-[var(--text-primary)] dark:text-white transition-all"
                    >
                      Edit Protocol
                    </button>
                    <button 
                      onClick={() => handleDeleteCompany(company.id)}
                      className="w-9 h-9 rounded-xl border border-black/[0.06] dark:border-white/[0.06] text-red-500 flex items-center justify-center hover:bg-[var(--danger)]/10 hover:text-[var(--danger)] transition-all border-none"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Provider Modal */}
      <AnimatePresence>
        {isCompanyModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCompanyModalOpen(false)}
              className="absolute inset-0 bg-apple-bg/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.95, y: 30, filter: "blur(10px)" }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="relative w-full max-w-2xl bg-white/95 dark:bg-apple-bg/95 backdrop-blur-3xl border border-apple-border/50 rounded-[3rem] shadow-[0_48px_120px_-32px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]"
            >
              <form onSubmit={handleUpdateCompany} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="shrink-0 p-10 pb-6 border-b border-apple-border/20 flex items-center justify-between bg-white/50 dark:bg-black/20">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                       <div className="w-10 h-10 bg-apple-blue rounded-[14px] flex items-center justify-center text-white shadow-lg shadow-apple-blue/20">
                          <Shield className="w-6 h-6" />
                       </div>
                       Partner <span className="text-apple-blue">Manifest</span>
                    </h2>
                    <p className="text-[11px] text-apple-text-muted mt-2 uppercase font-black tracking-[0.25em] pl-1">Provider Intelligence Terminal v2.1</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsCompanyModalOpen(false)}
                    className="p-3 hover:bg-apple-gray dark:hover:bg-white/10 rounded-full transition-all active:scale-90 bg-apple-gray/50 dark:bg-white/5"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden p-10 py-6 min-h-0 custom-scrollbar-thin">
                  <div className="space-y-10">
                    {/* Visual ID Section */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex flex-col items-center justify-center py-10 bg-apple-gray/30 dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-apple-border/40 group hover:border-apple-blue/30 transition-colors"
                    >
                        <div className="relative group/logo">
                            <div className="w-40 h-40 rounded-[2.5rem] bg-white dark:bg-apple-gray shadow-apple-soft border border-apple-border/30 flex items-center justify-center overflow-hidden relative group-hover:scale-105 transition-transform duration-500">
                                {companyForm.logoUrl ? (
                                    <img src={companyForm.logoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-4 text-apple-text-muted/20">
                                        <ImageIcon className="w-12 h-12" />
                                    </div>
                                )}
                                
                                <AnimatePresence>
                                  {isUploadingLogo && (
                                      <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center"
                                      >
                                          <Loader2 className="w-10 h-10 text-white animate-spin" />
                                      </motion.div>
                                  )}
                                </AnimatePresence>
                            </div>
                            
                            <label className="absolute -bottom-3 -right-3 w-12 h-12 bg-apple-blue text-white rounded-[1.2rem] flex items-center justify-center shadow-xl cursor-pointer hover:scale-110 active:scale-95 transition-all z-10 border-4 border-white dark:border-apple-bg">
                                <Plus className="w-6 h-6" />
                                <input 
                                    id="logo-upload"
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                />
                            </label>
                        </div>
                        <div className="mt-6 text-center">
                          <p className="text-[11px] font-black uppercase tracking-widest text-apple-text/80">Corporate Visual Index</p>
                          <p className="text-[10px] text-apple-text-muted mt-1 font-bold">Vector SVG or High-Res PNG preferred</p>
                        </div>
                    </motion.div>

                    <div className="space-y-8">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                      >
                        <div className="space-y-3">
                          <label className="text-[11px] font-black uppercase tracking-[0.15em] text-apple-text-muted ml-1 flex items-center gap-2">
                             <Building2 className="w-3.5 h-3.5" />
                             Provider Designation
                          </label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Jubilee General"
                            className="apple-input w-full bg-apple-gray/50 dark:bg-white/5 border-transparent focus:border-apple-blue/50 !h-14"
                            value={companyForm.name}
                            onChange={e => setCompanyForm({...companyForm, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[11px] font-black uppercase tracking-[0.15em] text-apple-text-muted ml-1 flex items-center gap-2">
                             <Activity className="w-3.5 h-3.5" />
                             Priority Weighting
                          </label>
                          <input 
                            type="number" 
                            className="apple-input w-full bg-apple-gray/50 dark:bg-white/5 border-transparent !h-14"
                            value={companyForm.order}
                            onChange={e => setCompanyForm({...companyForm, order: Number(e.target.value)})}
                          />
                        </div>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-3"
                      >
                        <label className="text-[11px] font-black uppercase tracking-[0.15em] text-apple-text-muted ml-1 flex items-center gap-2">
                           <FileText className="w-3.5 h-3.5" />
                           Strategic Value Proposition
                        </label>
                        <textarea 
                          rows={4}
                          className="apple-input w-full py-5 h-auto bg-apple-gray/50 dark:bg-white/5 border-transparent min-h-[120px] !rounded-[1.5rem] resize-none"
                          value={companyForm.description}
                          onChange={e => setCompanyForm({...companyForm, description: e.target.value})}
                          placeholder="Detail the competitive advantages and policy coverage specifics..."
                        />
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                      >
                        <div className="space-y-3">
                          <label className="text-[11px] font-black uppercase tracking-[0.15em] text-apple-text-muted ml-1 flex items-center gap-2">
                             <Percent className="w-3.5 h-3.5 text-apple-blue" />
                             Premium Rate Ceiling
                          </label>
                          <div className="relative">
                            <input 
                              type="text" 
                              required
                              className="apple-input w-full bg-apple-gray/50 dark:bg-white/5 border-transparent !h-14"
                              placeholder="e.g. 1.4%"
                              value={companyForm.rate}
                              onChange={e => setCompanyForm({...companyForm, rate: e.target.value})}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-apple-blue bg-apple-blue/10 px-2 py-0.5 rounded-full uppercase">Current</div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[11px] font-black uppercase tracking-[0.15em] text-apple-text-muted ml-1 flex items-center gap-2">
                             <Target className="w-3.5 h-3.5 text-apple-green" />
                             Tracking Hardware Fee
                          </label>
                          <div className="relative">
                            <input 
                              type="text" 
                              required
                              className="apple-input w-full bg-apple-gray/50 dark:bg-white/5 border-transparent !h-14"
                              placeholder="e.g. Rs. 15,000"
                              value={companyForm.trackerFee}
                              onChange={e => setCompanyForm({...companyForm, trackerFee: e.target.value})}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-apple-green bg-apple-green/10 px-2 py-0.5 rounded-full uppercase">Global</div>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                      >
                        <div className="space-y-3">
                          <label className="text-[11px] font-black uppercase tracking-[0.15em] text-apple-text-muted ml-1">Underwriter Email</label>
                          <input 
                            type="email" 
                            className="apple-input w-full bg-apple-gray/50 dark:bg-white/5 border-transparent !h-14"
                            placeholder="claims@provider.com"
                            value={companyForm.contactEmail}
                            onChange={e => setCompanyForm({...companyForm, contactEmail: e.target.value})}
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[11px] font-black uppercase tracking-[0.15em] text-apple-text-muted ml-1">Direct Liaison Line</label>
                          <input 
                            type="text" 
                            className="apple-input w-full bg-apple-gray/50 dark:bg-white/5 border-transparent !h-14"
                            placeholder="+92 21..."
                            value={companyForm.contactPhone}
                            onChange={e => setCompanyForm({...companyForm, contactPhone: e.target.value})}
                          />
                        </div>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4"
                      >
                        <label className="flex items-center gap-4 p-6 bg-apple-gray/50 dark:bg-white/5 rounded-[2rem] cursor-pointer hover:bg-apple-border/50 transition-all border border-apple-border/30 group relative overflow-hidden">
                          <motion.div 
                            className={cn(
                              "w-12 h-12 rounded-[1rem] flex items-center justify-center transition-all shadow-lg",
                              companyForm.isFeatured ? "bg-yellow-500 text-white shadow-yellow-500/20" : "bg-apple-gray dark:bg-white/10 text-apple-text-muted"
                            )}
                          >
                             <Star className={cn("w-6 h-6", companyForm.isFeatured && "fill-current")} />
                          </motion.div>
                          <div className="flex-1">
                            <p className="text-xs font-black uppercase tracking-widest text-apple-text">Market Placement</p>
                            <p className="text-[10px] text-apple-text-muted font-bold mt-0.5">Toggle Premium Featured Status</p>
                          </div>
                          <input 
                            type="checkbox" 
                            className="w-6 h-6 rounded-full border-2 border-apple-border accent-apple-blue"
                            checked={companyForm.isFeatured}
                            onChange={e => setCompanyForm({...companyForm, isFeatured: e.target.checked})}
                          />
                        </label>
                        
                        <div className="p-6 bg-apple-gray/50 dark:bg-white/5 rounded-[2rem] border border-apple-border/30 flex flex-col justify-center gap-4">
                          <label className="text-[11px] font-black uppercase tracking-[0.15em] text-apple-text-muted ml-1">Network Permissions</label>
                          <div className="flex items-center p-1.5 bg-apple-gray dark:bg-black/20 rounded-[1.2rem] h-12">
                            {['active', 'hidden'].map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setCompanyForm({ ...companyForm, status: status as any })}
                                    className={cn(
                                        "flex-1 h-full rounded-[0.9rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                        companyForm.status === status 
                                            ? "bg-white text-apple-text dark:bg-white dark:text-black shadow-sm" 
                                            : "text-apple-text-muted hover:text-apple-text"
                                    )}
                                >
                                    {status}
                                </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 p-10 pt-8 border-t border-apple-border/20 bg-white/40 dark:bg-black/10 flex gap-5">
                  <button 
                    type="button"
                    onClick={() => setIsCompanyModalOpen(false)}
                    className="flex-1 h-[68px] rounded-[24px] border-2 border-apple-border font-black uppercase tracking-widest text-[11px] hover:bg-apple-gray dark:hover:bg-white/5 transition-all text-apple-text-muted"
                  >
                    Discard Changes
                  </button>
                  <button 
                    type="submit"
                    disabled={isUpdating || isUploadingLogo}
                    className="flex-[2] apple-button-primary h-[68px] flex items-center justify-center gap-4 !rounded-[24px] shadow-2xl shadow-apple-blue/30 active:scale-[0.98] transition-transform"
                  >
                    {isUpdating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                    <span className="font-black uppercase tracking-[0.2em] text-xs">Commit Provider Updates</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Request Modal (Keep existing logic) */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="absolute inset-0 bg-apple-bg/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2x bg-apple-bg border border-apple-border rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-apple-border flex items-center justify-between bg-apple-gray/30 dark:bg-white/5">
                <div>
                  <h2 className="text-2xl font-black tracking-tight tracking-[-0.03em]">Protocol Overhaul</h2>
                  <p className="text-[10px] text-apple-text-muted mt-1 uppercase font-black tracking-[0.2em]">Deployment ID: {selectedRequest.deploymentId || selectedRequest.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedRequest(null)}
                  className="p-3 hover:bg-apple-border rounded-full transition-all active:scale-95"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-10 overflow-y-auto max-h-[70vh] custom-scrollbar">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted ml-2">Customer Communication</p>
                    <div className="glass-panel p-5 rounded-3xl space-y-3 border-apple-border/50">
                      <div className="flex items-center gap-3 text-sm font-bold">
                        <Phone className="w-4 h-4 text-apple-blue" />
                        {selectedRequest.phone}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-apple-text-muted font-medium">
                        <User className="w-4 h-4" />
                        {selectedRequest.email}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted ml-2">Selected Partner</p>
                    <div className="glass-panel p-5 rounded-3xl space-y-3 border-apple-blue/20 bg-apple-blue/5">
                      <div className="flex items-center gap-3 text-sm font-bold text-apple-blue">
                        <Building2 className="w-4 h-4" />
                        {selectedRequest.providerName || 'No specific provider selected'}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-apple-text-muted font-black uppercase tracking-widest">
                        <Target className="w-3.5 h-3.5" />
                        Type: {selectedRequest.insuranceType.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted ml-2">Asset Intelligence</p>
                    <div className="glass-panel p-5 rounded-3xl space-y-4 border-apple-border/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm font-bold">
                          <Car className="w-4 h-4 text-apple-blue" />
                          {selectedRequest.vehicleYear} {selectedRequest.vehicleMake} {selectedRequest.vehicleModel}
                        </div>
                        <div className="px-3 py-1 bg-apple-blue/10 text-apple-blue rounded-full text-[10px] font-black uppercase tracking-widest">
                          {selectedRequest.vehicleVariant || 'Standard Variant'}
                        </div>
                      </div>
                      
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-apple-border/30">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-apple-text-muted uppercase tracking-widest">Market Value</p>
                          <p className="text-sm font-black text-apple-text">{formatPrice(selectedRequest.vehicleValue)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-apple-text-muted uppercase tracking-widest">Configuration</p>
                          <p className="text-sm font-black text-apple-text uppercase">{selectedRequest.transmission || 'N/A'} • {selectedRequest.fuelType || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-apple-text-muted uppercase tracking-widest">Historical Usage</p>
                          <p className="text-sm font-black text-apple-text">{selectedRequest.mileage ? `${selectedRequest.mileage.toLocaleString()} KM` : 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-apple-text-muted uppercase tracking-widest">Integrity Status</p>
                          <p className="text-sm font-black text-apple-blue uppercase">{selectedRequest.condition || 'Verified'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-apple-border/30">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-apple-text-muted uppercase tracking-widest">Pricing Matrix</p>
                          <p className="text-sm font-black text-apple-text">{formatPrice(selectedRequest.basePremium || 0)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-apple-text-muted uppercase tracking-widest">Tracker Module</p>
                          <p className="text-sm font-black text-apple-text">{formatPrice(selectedRequest.trackerFee || 0)}</p>
                        </div>
                        <div className="col-span-2 space-y-1">
                          <p className="text-[9px] font-black text-apple-blue uppercase tracking-widest">Accumulated Coverage Value</p>
                          <p className="text-lg font-black text-apple-green">{formatPrice(selectedRequest.quoteAmount || 0)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-text-muted ml-4">Deployment Status</label>
                        <select 
                        className="apple-input w-full h-14 bg-apple-card-bg font-bold"
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as any)}
                        >
                            <option value="pending">Awaiting Risk Review</option>
                            <option value="quote_sent">Quote Dispatched</option>
                            <option value="payment_received">Payment Authenticated</option>
                            <option value="active">Policy Operational</option>
                            <option value="expired">Coverage Terminated</option>
                            <option value="cancelled">Protocol Aborted</option>
                        </select>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-text-muted ml-4">Unique Policy ID</label>
                        <input 
                        type="text" 
                        placeholder="Generate ID..."
                        className="apple-input w-full font-mono"
                        value={editPolicyNumber}
                        onChange={(e) => setEditPolicyNumber(e.target.value)}
                        />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-text-muted ml-4">Premium Quantification</label>
                        <input 
                        type="number" 
                        placeholder="Set premium amount..."
                        className="apple-input w-full"
                        value={editQuoteAmount}
                        onChange={(e) => setEditQuoteAmount(Number(e.target.value))}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-text-muted ml-4">Expiraton Coordinate</label>
                        <input 
                        type="date" 
                        className="apple-input w-full"
                        value={editExpiryDate}
                        onChange={(e) => setEditExpiryDate(e.target.value)}
                        />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-text-muted ml-4">Operational Memo (Risk Assessment)</label>
                    <textarea 
                      rows={4}
                      placeholder="Input risk assessment findings, special clauses, or incident logs..."
                      className="apple-input w-full py-5 resize-none leading-relaxed"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="p-10 border-t border-apple-border bg-apple-gray/50 dark:bg-white/5 flex gap-5">
                <button 
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 h-16 rounded-[24px] border-2 border-apple-border font-black uppercase tracking-[0.2em] text-[10px] hover:bg-apple-border transition-all active:scale-95"
                >
                  Discard
                </button>
                <button 
                  onClick={handleUpdateRequest}
                  disabled={isUpdating}
                  className="flex-[2] apple-button-primary h-16 flex items-center justify-center gap-3 disabled:opacity-50 !rounded-[24px]"
                >
                  {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  <span className="font-black uppercase tracking-[0.2em] text-xs">Authorize Update</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
