import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, 
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
  Briefcase,
  TrendingUp,
  Percent,
  Star,
  Trash2,
  Plus,
  Image as ImageIcon,
  Building2
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
  deleteDoc
} from 'firebase/firestore';
import { db } from "@/firebase";
import { cn, formatPrice } from "@/lib/utils";
import { toast } from 'sonner';
import { FinancingRequest } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface FinancingCompany {
  id: string;
  name: string;
  logoUrl: string;
  minInterestRate: string;
  maxTenureYears: number;
  minDownPayment: string;
  processingFee: string;
  description: string;
  contactPhone: string;
  contactEmail: string;
  isFeatured: boolean;
  order: number;
  status: 'active' | 'hidden';
  createdAt?: any;
  updatedAt?: any;
}

export default function FinancingManagement() {
  const { isAdmin, isModerator } = useAuth();
  const [requests, setRequests] = useState<FinancingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FinancingRequest['status'] | 'all'>('all');
  const [selectedRequest, setSelectedRequest] = useState<FinancingRequest | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Tabs: 'requests' | 'companies'
  const [activeTab, setActiveTab] = useState<'requests' | 'companies'>('requests');
  
  // Companies lists & states
  const [companies, setCompanies] = useState<FinancingCompany[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<FinancingCompany | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [companyForm, setCompanyForm] = useState<Omit<FinancingCompany, 'id'>>({
    name: '',
    logoUrl: '',
    minInterestRate: '11.5%',
    maxTenureYears: 7,
    minDownPayment: '15%',
    processingFee: 'Rs. 3,000',
    description: '',
    contactPhone: '',
    contactEmail: '',
    isFeatured: false,
    order: 0,
    status: 'active'
  });

  // Edit states for request
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<FinancingRequest['status']>('pending');
  const [editMonthlyInstallment, setEditMonthlyInstallment] = useState<number>(0);
  const [editInterestRate, setEditInterestRate] = useState<number>(0);

  useEffect(() => {
    if (!isAdmin && !isModerator) return;

    const q = query(collection(db, 'financing_requests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinancingRequest));
      setRequests(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching financing requests:", error);
      toast.error("Failed to load financing requests");
      setLoading(false);
    });

    const qc = query(collection(db, 'financing_companies'), orderBy('order', 'asc'));
    const unsubscribeCompanies = onSnapshot(qc, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinancingCompany));
      setCompanies(docs);
      setCompaniesLoading(false);
    }, (error) => {
      console.error("Error fetching financing companies:", error);
      toast.error("Error loading credit partners");
      setCompaniesLoading(false);
    });

    return () => {
      unsubscribe();
      unsubscribeCompanies();
    };
  }, [isAdmin, isModerator]);

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
        await updateDoc(doc(db, 'financing_companies', editingCompany.id), {
          ...companyForm,
          updatedAt: serverTimestamp()
        });
        toast.success("Capital Partner updated successfully");
      } else {
        await addDoc(collection(db, 'financing_companies'), {
          ...companyForm,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        toast.success("Capital Partner added successfully");
      }
      setIsCompanyModalOpen(false);
      setEditingCompany(null);
      resetCompanyForm();
    } catch (error) {
      console.error("Error saving credit company:", error);
      toast.error("Failed to save provider");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this financial partner?")) return;
    try {
      await deleteDoc(doc(db, 'financing_companies', id));
      toast.success("Capital Partner removed");
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error("Failed to remove financial partner");
    }
  };

  const resetCompanyForm = () => {
    setCompanyForm({
      name: '',
      logoUrl: '',
      minInterestRate: '11.5%',
      maxTenureYears: 7,
      minDownPayment: '15%',
      processingFee: 'Rs. 3,000',
      description: '',
      contactPhone: '',
      contactEmail: '',
      isFeatured: false,
      order: 0,
      status: 'active'
    });
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.vehicleMake.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.phone.includes(searchQuery) ||
      request.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: FinancingRequest['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      case 'under_review': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'documents_requested': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
      case 'disbursed': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      case 'rejected': return 'bg-red-500/10 text-red-600 dark:text-red-400';
      default: return 'bg-apple-text-muted/10 text-apple-text-muted dark:text-apple-text-muted';
    }
  };

  const handleUpdateRequest = async () => {
    if (!selectedRequest) return;
    
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'financing_requests', selectedRequest.id), {
        status: editStatus,
        adminNotes: editNotes,
        monthlyInstallment: editMonthlyInstallment,
        interestRate: editInterestRate,
        updatedAt: serverTimestamp()
      });
      toast.success("Financing record updated successfully");
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error updating financing request:", error);
      toast.error("Failed to update record");
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditModal = (request: FinancingRequest) => {
    setSelectedRequest(request);
    setEditStatus(request.status);
    setEditNotes(request.adminNotes || '');
    setEditMonthlyInstallment(request.monthlyInstallment || 0);
    setEditInterestRate(request.interestRate || 15.5);
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions - EXACT match with Approval Center layout and sizing */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 pb-6 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <DollarSign className="w-3.5 h-3.5" />
            Verified Administration Console
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-tight">
            Capital Terminal
          </h1>
          <p className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-secondary)] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            Manage risk assessment, credit profiles, debt ratios, and disbursement status.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start md:self-end">
          {activeTab === 'requests' ? (
            <div className="relative group min-w-[200px] sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] group-focus-within:text-apple-blue transition-colors duration-300" />
              <input
                type="text"
                placeholder="Search credits, applicants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--text-primary)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 rounded-xl text-xs font-medium focus:ring-0 outline-none transition-all duration-300 shadow-inner"
              />
            </div>
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
              : "border-transparent text-apple-text-muted hover:text-[var(--text-primary)] dark:hover:text-white"
          )}
        >
          Credit Requests
        </button>
        <button
          onClick={() => setActiveTab('companies')}
          className={cn(
            "pb-3.5 px-6 text-xs font-bold uppercase tracking-wider border-b-2 transition-all",
            activeTab === 'companies' 
              ? "border-apple-blue text-apple-blue" 
              : "border-transparent text-apple-text-muted hover:text-[var(--text-primary)] dark:hover:text-white"
          )}
        >
          Capital Providers
        </button>
      </div>

      {activeTab === 'requests' ? (
        <>
          {/* Stats - EXACT match with Approval Center card format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Requests', value: requests.length.toString(), change: 'Disbursement Hub', icon: Briefcase, color: 'text-apple-blue', bg: 'bg-apple-blue/10' },
              { label: 'Under Review', value: requests.filter(r => r.status === 'under_review').length.toString(), change: 'Risk Check', icon: Clock3, color: 'text-apple-orange', bg: 'bg-apple-orange/10' },
              { label: 'Approved Lines', value: requests.filter(r => r.status === 'approved').length.toString(), change: 'Ready for Issuance', icon: CheckCircle2, color: 'text-apple-green', bg: 'bg-apple-green/10' },
              { label: 'Disbursed Capital', value: requests.filter(r => r.status === 'disbursed').length.toString(), change: 'Funds Released', icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-500/10' },
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
            {['all', 'pending', 'under_review', 'documents_requested', 'approved', 'disbursed', 'rejected'].map((status) => {
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
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)] pl-6">Target Asset</th>
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)]">Applicant</th>
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)]">Loan Metrics</th>
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)]">Credit Status</th>
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)] text-right pr-6">Command</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.03]">
                  {loading ? (
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
                        No credit applications found in the encrypted silo.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request, idx) => (
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
                                {request.vehicleModel}
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
                              <TrendingUp className="w-3.5 h-3.5 text-apple-blue" />
                              {formatPrice(request.vehiclePrice - request.downPayment)}
                            </div>
                            <div className="text-[10px] font-medium text-[var(--text-secondary)]">
                              {request.interestRate || '15.5'}% Rate | {request.loanTerm.split('_')[0]}M
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4.5">
                          <span className={cn(
                            "px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border-none shadow-none",
                            getStatusColor(request.status)
                          )}>
                            {request.status.replace(/_/g, ' ')}
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
        </>
      ) : (
        /* Capital Providers Management Panel */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companiesLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-white dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] h-64 animate-pulse" />
              ))
            ) : companies.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04]">
                <p className="text-[var(--text-secondary)] font-medium text-xs">No financing partners registered.</p>
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
                            <Star className="w-3.5 h-3.5 fill-current text-yellow-500" />
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
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[var(--text-secondary)]">Min APR Rate:</span>
                          <span className="font-semibold text-apple-green">{company.minInterestRate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-secondary)]">Max Tenure:</span>
                          <span className="font-semibold text-[var(--text-primary)] dark:text-white">{company.maxTenureYears} Years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-secondary)]">Min Down Payment:</span>
                          <span className="font-semibold text-[var(--text-primary)] dark:text-white">{company.minDownPayment}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-secondary)]">Processing Fee:</span>
                          <span className="font-semibold text-apple-blue">{company.processingFee}</span>
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
                          minInterestRate: company.minInterestRate || '11.5%',
                          maxTenureYears: company.maxTenureYears || 7,
                          minDownPayment: company.minDownPayment || '15%',
                          processingFee: company.processingFee || 'Rs. 3,000',
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

      {/* Edit Modal */}
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
              className="relative w-full max-w-4xl bg-apple-bg border border-apple-border rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-10 border-b border-apple-border flex items-center justify-between bg-apple-gray/30 dark:bg-white/5">
                <div>
                  <h2 className="text-3xl font-black tracking-tight tracking-[-0.03em]">Credit Reassessment</h2>
                  <p className="text-[11px] text-apple-text-muted mt-1 uppercase font-black tracking-[0.2em]">Application ID: {selectedRequest.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 rounded-full hover:bg-apple-border transition-all active:scale-95"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-10 space-y-10 overflow-y-auto max-h-[75vh] custom-scrollbar">
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted ml-2">Applicant Profile</p>
                    <div className="glass-panel p-6 rounded-2xl space-y-4 border-apple-border/50">
                      <div className="flex items-center gap-4 text-sm font-bold">
                        <Phone className="w-4 h-4 text-apple-blue" />
                        {selectedRequest.phone}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-apple-text-muted font-medium">
                        <Briefcase className="w-4 h-4 text-apple-blue" />
                        {selectedRequest.employmentStatus.toUpperCase()} | {formatPrice(selectedRequest.monthlyIncome)}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted ml-2">Asset Intelligence</p>
                    <div className="glass-panel p-6 rounded-2xl space-y-4 border-apple-border/50">
                      <div className="flex items-center gap-4 text-sm font-bold">
                        <Car className="w-4 h-4 text-apple-blue" />
                        {selectedRequest.vehicleYear} {selectedRequest.vehicleMake}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-apple-text-muted font-medium">
                        <DollarSign className="w-4 h-4 text-apple-blue" />
                        {formatPrice(selectedRequest.vehiclePrice)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-[0.2em] text-apple-text-muted ml-6">Deployment Status</label>
                        <select 
                        className="apple-input w-full h-14 bg-apple-card-bg font-bold text-sm"
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as any)}
                        >
                            <option value="pending">Awaiting Risk Gate</option>
                            <option value="under_review">Manual Underwriting</option>
                            <option value="documents_requested">Docs Incomplete</option>
                            <option value="approved">Credit Authorized</option>
                            <option value="disbursed">Capital Deployed</option>
                            <option value="rejected">Application Declined</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-[0.2em] text-apple-text-muted ml-6">Quantified Installment</label>
                        <input 
                        type="number" 
                        placeholder="Set monthly EMI..."
                        className="apple-input w-full h-14 font-bold text-sm"
                        value={editMonthlyInstallment}
                        onChange={(e) => setEditMonthlyInstallment(Number(e.target.value))}
                        />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-[0.2em] text-apple-text-muted ml-6">Rate (APR %)</label>
                        <div className="relative">
                            <Percent className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-text-muted" />
                            <input 
                            type="number" 
                            step="0.1"
                            placeholder="e.g. 15.5"
                            className="apple-input w-full h-14 text-sm"
                            value={editInterestRate}
                            onChange={(e) => setEditInterestRate(Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <div className="space-y-2 h-full flex flex-col justify-end">
                        <div className="p-4 bg-apple-blue/5 rounded-2xl border border-apple-blue/10">
                            <p className="text-[10px] font-black text-apple-blue uppercase tracking-widest mb-1 text-center">Net Loan Value</p>
                            <p className="text-lg font-black text-center">{formatPrice(selectedRequest.vehiclePrice - selectedRequest.downPayment)}</p>
                        </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-apple-text-muted ml-6">Underwriter Memo (Financial Audit)</label>
                    <textarea 
                      rows={4}
                      placeholder="Findings..."
                      className="apple-input w-full py-6 resize-none leading-relaxed text-sm h-auto"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="p-10 border-t border-apple-border bg-apple-gray/50 dark:bg-white/5 flex gap-6">
                <button 
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 h-14 rounded-2xl border-2 border-apple-border font-black uppercase tracking-[0.2em] text-[10px] hover:bg-apple-border transition-all active:scale-95"
                >
                  Discard
                </button>
                <button 
                  onClick={handleUpdateRequest}
                  disabled={isUpdating}
                  className="flex-[2] apple-button-primary h-14 flex items-center justify-center gap-4 disabled:opacity-50 rounded-2xl"
                >
                  {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  <span className="font-black uppercase tracking-[0.2em] text-xs">Authorize Disbursement</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Capital Provider Registration/Edit Dialog */}
      <Dialog open={isCompanyModalOpen} onOpenChange={setIsCompanyModalOpen}>
        <DialogContent className="max-w-2xl rounded-[40px] border-apple-border/10 bg-white dark:bg-[var(--text-primary)] p-8 overflow-hidden max-h-[90vh] flex flex-col gap-0 shadow-2xl">
          <div className="text-center pb-6 shrink-0 relative">
            <div className="w-20 h-20 rounded-[28px] bg-apple-blue/10 dark:bg-apple-blue/20 flex items-center justify-center mx-auto mb-4 transition-transform hover:scale-105">
              <Building2 className="w-10 h-10 text-apple-blue" />
            </div>
            <DialogTitle className="text-3xl font-black tracking-tighter text-[var(--text-primary)] dark:text-white">
              {editingCompany ? 'Configure Capital Partner' : 'Register Capital Partner'}
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-apple-text-muted dark:text-apple-text-muted/80 uppercase tracking-widest opacity-80 mt-2 max-w-md mx-auto leading-relaxed">
              Manage loan protocols, interest parameters, and provider criteria.
            </DialogDescription>
          </div>

          <form onSubmit={handleUpdateCompany} className="flex flex-col flex-1 overflow-hidden">
            <ScrollArea className="flex-1 pr-2">
              <div className="space-y-6 py-2 px-1">
                {/* Logo Upload */}
                <div className="flex items-center gap-6 p-5 bg-[var(--text-primary)]/50 dark:bg-white/[0.02] rounded-3xl border border-black/[0.04] dark:border-white/[0.04]">
                  <div className="w-18 h-18 rounded-2xl bg-white dark:bg-[var(--bg-surface)] p-3 border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center shrink-0 overflow-hidden relative shadow-sm">
                    {companyForm.logoUrl ? (
                      <img src={companyForm.logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <Building2 className="w-8 h-8 text-[var(--text-secondary)]" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[var(--text-primary)] dark:text-white uppercase tracking-wider">Institution Logo</p>
                    <p className="text-[10px] text-[var(--text-secondary)] font-semibold">PNG or SVG format under 2MB preferred.</p>
                    <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-[var(--bg-surface)] border border-black/[0.08] dark:border-white/[0.08] rounded-xl text-[10px] font-black uppercase tracking-wider text-[var(--text-primary)] dark:text-white cursor-pointer hover:bg-apple-gray dark:hover:bg-white/5 transition-all shadow-sm mt-1.5 active:scale-95">
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
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted dark:text-apple-text-muted/80 ml-1">Partner Institution Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Chase Commercial, Standard Chartered"
                      className="w-full h-12 px-4 rounded-2xl bg-[var(--text-primary)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 text-xs font-bold text-[var(--text-primary)] dark:text-white outline-none transition-all focus:bg-white dark:focus:bg-[var(--bg-surface)] focus:ring-2 focus:ring-apple-blue/20"
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted dark:text-apple-text-muted/80 ml-1">Min APR Rate</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 11.5%"
                      className="w-full h-12 px-4 rounded-2xl bg-[var(--text-primary)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 text-xs font-bold text-[var(--text-primary)] dark:text-white outline-none transition-all focus:bg-white dark:focus:bg-[var(--bg-surface)] focus:ring-2 focus:ring-apple-blue/20"
                      value={companyForm.minInterestRate}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, minInterestRate: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted dark:text-apple-text-muted/80 ml-1">Max Tenure (Years)</label>
                    <input 
                      type="number" 
                      required
                      min={1}
                      max={20}
                      className="w-full h-12 px-4 rounded-2xl bg-[var(--text-primary)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 text-xs font-bold text-[var(--text-primary)] dark:text-white outline-none transition-all focus:bg-white dark:focus:bg-[var(--bg-surface)] focus:ring-2 focus:ring-apple-blue/20"
                      value={companyForm.maxTenureYears}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, maxTenureYears: Number(e.target.value) }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted dark:text-apple-text-muted/80 ml-1">Min Down Payment</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 15%"
                      className="w-full h-12 px-4 rounded-2xl bg-[var(--text-primary)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 text-xs font-bold text-[var(--text-primary)] dark:text-white outline-none transition-all focus:bg-white dark:focus:bg-[var(--bg-surface)] focus:ring-2 focus:ring-apple-blue/20"
                      value={companyForm.minDownPayment}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, minDownPayment: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted dark:text-apple-text-muted/80 ml-1">Processing Fee</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Rs. 3,000"
                      className="w-full h-12 px-4 rounded-2xl bg-[var(--text-primary)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 text-xs font-bold text-[var(--text-primary)] dark:text-white outline-none transition-all focus:bg-white dark:focus:bg-[var(--bg-surface)] focus:ring-2 focus:ring-apple-blue/20"
                      value={companyForm.processingFee}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, processingFee: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted dark:text-apple-text-muted/80 ml-1">Description & Target Criteria</label>
                    <textarea 
                      rows={3}
                      placeholder="Describe target customer profiles, requirements or advantages."
                      className="w-full p-4 rounded-2xl bg-[var(--text-primary)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 text-xs font-bold text-[var(--text-primary)] dark:text-white outline-none transition-all resize-none focus:bg-white dark:focus:bg-[var(--bg-surface)] focus:ring-2 focus:ring-apple-blue/20"
                      value={companyForm.description}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted dark:text-apple-text-muted/80 ml-1">Contact Phone</label>
                    <input 
                      type="text" 
                      placeholder="+1 (555) 019-2834"
                      className="w-full h-12 px-4 rounded-2xl bg-[var(--text-primary)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 text-xs font-bold text-[var(--text-primary)] dark:text-white outline-none transition-all focus:bg-white dark:focus:bg-[var(--bg-surface)] focus:ring-2 focus:ring-apple-blue/20"
                      value={companyForm.contactPhone}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted dark:text-apple-text-muted/80 ml-1">Contact Email</label>
                    <input 
                      type="email" 
                      placeholder="underwriting@bank.com"
                      className="w-full h-12 px-4 rounded-2xl bg-[var(--text-primary)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 text-xs font-bold text-[var(--text-primary)] dark:text-white outline-none transition-all focus:bg-white dark:focus:bg-[var(--bg-surface)] focus:ring-2 focus:ring-apple-blue/20"
                      value={companyForm.contactEmail}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted dark:text-apple-text-muted/80 ml-1">Sort Order</label>
                    <input 
                      type="number" 
                      className="w-full h-12 px-4 rounded-2xl bg-[var(--text-primary)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 text-xs font-bold text-[var(--text-primary)] dark:text-white outline-none transition-all focus:bg-white dark:focus:bg-[var(--bg-surface)] focus:ring-2 focus:ring-apple-blue/20"
                      value={companyForm.order}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, order: Number(e.target.value) }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted dark:text-apple-text-muted/80 ml-1">Silo Status</label>
                    <select 
                      className="w-full h-12 px-4 rounded-2xl bg-[var(--text-primary)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 text-xs font-bold text-[var(--text-primary)] dark:text-white outline-none transition-all focus:bg-white dark:focus:bg-[var(--bg-surface)] focus:ring-2 focus:ring-apple-blue/20 cursor-pointer"
                      value={companyForm.status}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, status: e.target.value as any }))}
                    >
                      <option value="active">Active & Online</option>
                      <option value="hidden">Hidden from App</option>
                    </select>
                  </div>

                  <div className="col-span-2 mt-2 flex items-center justify-between p-5 bg-[var(--text-primary)]/50 dark:bg-white/[0.02] rounded-3xl border border-black/[0.04] dark:border-white/[0.04]">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-[var(--text-primary)] dark:text-white uppercase tracking-wider">Featured Partner Badge</p>
                      <p className="text-[10px] text-[var(--text-secondary)] font-semibold">Elevates visibility and prioritizes matching on primary search dashboards.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-apple-blue cursor-pointer rounded-lg border-apple-border"
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
                Authorize Partner Node
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsCompanyModalOpen(false)}
                className="w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest text-apple-text-muted hover:bg-[var(--text-primary)] dark:hover:bg-white/5"
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
