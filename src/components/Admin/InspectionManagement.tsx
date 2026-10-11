import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, 
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
  Zap,
  XCircle,
  Plus,
  Trash2,
  Star,
  Activity,
  Building2,
  Shield,
  FileText,
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
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

type InspectionStatus = 'pending' | 'contacted' | 'assigned' | 'completed' | 'cancelled';

interface InspectionRequest {
  id: string;
  userId: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  address: string;
  city: string;
  date: string;
  time: string;
  phone: string;
  email: string;
  status: InspectionStatus;
  adminNotes?: string;
  assignedEngineer?: string;
  createdAt: any;
  updatedAt: any;
}

interface InspectionCompany {
  id: string;
  name: string;
  logoUrl: string;
  baseFee: string;
  engineersCount: number;
  coverageCities: string;
  description: string;
  contactPhone: string;
  contactEmail: string;
  isFeatured: boolean;
  order: number;
  status: 'active' | 'hidden';
}

export default function InspectionManagement() {
  const { isAdmin, isModerator } = useAuth();
  const [activeTab, setActiveTab] = useState<'requests' | 'companies'>('requests');
  const [requests, setRequests] = useState<InspectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InspectionStatus | 'all'>('all');
  const [selectedRequest, setSelectedRequest] = useState<InspectionRequest | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<InspectionStatus>('pending');
  const [editEngineer, setEditEngineer] = useState('');

  // Service Providers state
  const [companies, setCompanies] = useState<InspectionCompany[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<InspectionCompany | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [companyForm, setCompanyForm] = useState<Omit<InspectionCompany, 'id'>>({
    name: '',
    logoUrl: '',
    baseFee: '',
    engineersCount: 5,
    coverageCities: '',
    description: '',
    contactPhone: '',
    contactEmail: '',
    isFeatured: false,
    order: 0,
    status: 'active'
  });

  useEffect(() => {
    if (!isAdmin && !isModerator) return;

    const q = query(collection(db, 'inspection_requests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InspectionRequest));
      setRequests(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching inspection requests:", error);
      toast.error("Failed to load inspection requests");
      setLoading(false);
    });

    const qCompanies = query(collection(db, 'inspection_companies'), orderBy('order', 'asc'));
    const unsubscribeCompanies = onSnapshot(qCompanies, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InspectionCompany));
      setCompanies(docs);
      setCompaniesLoading(false);
    }, (error) => {
      console.error("Error fetching inspection companies:", error);
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
        await updateDoc(doc(db, 'inspection_companies', editingCompany.id), {
          ...companyForm,
          updatedAt: serverTimestamp()
        });
        toast.success("Service Provider updated successfully");
      } else {
        await addDoc(collection(db, 'inspection_companies'), {
          ...companyForm,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        toast.success("Service Provider added successfully");
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
      baseFee: '',
      engineersCount: 5,
      coverageCities: '',
      description: '',
      contactPhone: '',
      contactEmail: '',
      isFeatured: false,
      order: 0,
      status: 'active'
    });
  };

  const seedCompanies = async () => {
    if (!window.confirm("This will inject 4 major Pakistani inspection service providers. Continue?")) return;
    
    setIsUpdating(true);
    const initialCompanies = [
      {
        name: "CarScan Diagnostic Center",
        logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_xMscTco6WpD_8R5vKq37I_9vL0vI5eWJpQ&s",
        baseFee: "Rs. 4,500",
        engineersCount: 15,
        coverageCities: "Lahore, Karachi, Islamabad",
        description: "Full computerized diagnostics, paint testing, OBD scanning, and road test report with 200+ checklist points.",
        contactEmail: "inspections@carscan.pk",
        contactPhone: "042-111-227-722",
        isFeatured: true,
        order: 1,
        status: "active" as const
      },
      {
        name: "PakWheels Inspection Crew",
        logoUrl: "https://images.crunchbase.com/image/upload/c_pad,h_170,w_170,f_auto,b_white,q_auto:eco,dpr_2/v1447055740/lpxfnd9b17v3tffv53p7.png",
        baseFee: "Rs. 5,500",
        engineersCount: 24,
        coverageCities: "Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan",
        description: "Leading automotive portal inspection service. Real-time digital dashboard report with detailed high-res pictures.",
        contactEmail: "inspections@pakwheels.com",
        contactPhone: "042-111-943-357",
        isFeatured: true,
        order: 2,
        status: "active" as const
      },
      {
        name: "SGS Auto Sweeps",
        logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7v-A_Y8Xf8vCqXW4N6O5zE4y7_o7tV_C7gA&s",
        baseFee: "Rs. 6,000",
        engineersCount: 10,
        coverageCities: "Lahore, Karachi, Islamabad, Peshawar",
        description: "Global inspection and verification giant. Standard ISO-certified physical check with verified document audit.",
        contactEmail: "sgs.pakistan@sgs.com",
        contactPhone: "021-111-747-111",
        isFeatured: false,
        order: 3,
        status: "active" as const
      },
      {
        name: "Veloce Certified Technicians",
        logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7T_0zT3N9S5eF5z0U5y4W6_8r9T0O1P2Q3R&s",
        baseFee: "Rs. 3,500",
        engineersCount: 8,
        coverageCities: "Karachi",
        description: "Specialized diagnostics and paint thickness evaluation, ideal for imported JDM and luxury vehicles.",
        contactEmail: "info@veloce.pk",
        contactPhone: "0300-8254227",
        isFeatured: false,
        order: 4,
        status: "active" as const
      }
    ];

    try {
      for (const company of initialCompanies) {
        await addDoc(collection(db, 'inspection_companies'), {
          ...company,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      toast.success("Ecosystem populated with Tier-1 inspection partners");
    } catch (error) {
      console.error("Error seeding companies:", error);
      toast.error("Failed to seed partners");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (!window.confirm("Are you sure you want to terminate this provider partnership?")) return;
    try {
      await deleteDoc(doc(db, 'inspection_companies', id));
      toast.success("Provider record purged");
    } catch (error) {
      toast.error("Failed to delete record");
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.vehicleMake.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.phone.includes(searchQuery) ||
      request.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: InspectionStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      case 'contacted': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'assigned': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      case 'completed': return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'cancelled': return 'bg-red-500/10 text-red-600 dark:text-red-400';
      default: return 'bg-apple-text-muted/10 text-apple-text-muted dark:text-apple-text-muted';
    }
  };

  const handleUpdateRequest = async () => {
    if (!selectedRequest) return;
    
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'inspection_requests', selectedRequest.id), {
        status: editStatus,
        adminNotes: editNotes,
        assignedEngineer: editEngineer,
        updatedAt: serverTimestamp()
      });
      toast.success("Request updated successfully");
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error("Failed to update request");
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditModal = (request: InspectionRequest) => {
    setSelectedRequest(request);
    setEditStatus(request.status);
    setEditNotes(request.adminNotes || '');
    setEditEngineer(request.assignedEngineer || '');
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions - EXACT match with Approval Center layout and sizing */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <Car className="w-3.5 h-3.5" />
            Verified Administration Console
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-tight">
            Inspection CRM
          </h1>
          <p className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-secondary)] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            Manage technician deployments, coordinate vehicle physical inspections, and check field reports.
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
              Requests
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
                placeholder="Search by vehicle, phone, email..."
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
                  onClick={seedCompanies}
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
        <>
          {/* Stats - EXACT match with Approval Center card format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Requests', value: requests.length.toString(), change: 'Platform Log', icon: Car, color: 'text-apple-blue', bg: 'bg-apple-blue/10' },
              { label: 'Pending Review', value: requests.filter(r => r.status === 'pending').length.toString(), change: 'Immediate Action', icon: Clock, color: 'text-apple-orange', bg: 'bg-apple-orange/10' },
              { label: 'Assigned Engineers', value: requests.filter(r => r.status === 'assigned').length.toString(), change: 'In Field', icon: User, color: 'text-purple-500', bg: 'bg-purple-500/10' },
              { label: 'Completed Sweeps', value: requests.filter(r => r.status === 'completed').length.toString(), change: 'Verified Clean', icon: CheckCircle2, color: 'text-apple-green', bg: 'bg-apple-green/10' },
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
            {['all', 'pending', 'contacted', 'assigned', 'completed', 'cancelled'].map((status) => {
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
                  {status.charAt(0).toUpperCase() + status.slice(1)} <span className={cn("ml-1 py-0.5 px-1.5 rounded-full text-[9px] font-bold font-mono", isActive ? "bg-white/25 text-white" : "bg-[var(--text-primary)] dark:bg-white/5 text-[var(--text-secondary)]")}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Requests List - EXACT card format, padding and hover from Approval Center layout */}
          <div className="space-y-3.5">
            <AnimatePresence mode="popLayout">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse bg-white dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-4.5 flex flex-col md:flex-row items-stretch md:items-center gap-5">
                    <div className="w-full md:w-36 aspect-[4/3] rounded-xl bg-apple-gray dark:bg-white/5 shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-apple-gray dark:bg-white/5 rounded w-1/3" />
                      <div className="h-6 bg-apple-gray dark:bg-white/5 rounded w-2/3" />
                      <div className="h-4 bg-apple-gray dark:bg-white/5 rounded w-1/2" />
                    </div>
                  </div>
                ))
              ) : filteredRequests.length === 0 ? (
                <div className="bg-white dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] py-20 text-center text-[var(--text-secondary)] font-medium text-xs shadow-sm">
                  No deployment logs found matching your criteria.
                </div>
              ) : (
                filteredRequests.map((request, idx) => {
                  const statusColors = {
                    pending: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
                    contacted: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
                    assigned: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20",
                    completed: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20",
                    cancelled: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20"
                  };

                  return (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.4, delay: idx * 0.02 }}
                      onClick={() => openEditModal(request)}
                      className="bg-white dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-4.5 flex flex-col md:flex-row items-stretch md:items-center gap-5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300 cursor-pointer"
                    >
                      {/* Category Image / Custom Shard Icon */}
                      <div className="relative w-full md:w-36 aspect-[4/3] rounded-xl overflow-hidden shrink-0 bg-[var(--bg-raised)] border border-black/5 dark:border-white/10 group flex items-center justify-center">
                        <div className="w-full h-full flex items-center justify-center transition-colors bg-apple-blue/5 dark:bg-apple-blue/10 text-apple-blue">
                          <Car className="w-7 h-7 animate-pulse" />
                        </div>
                        
                        <div className="absolute top-2.5 left-2.5">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider backdrop-blur-md border",
                            statusColors[request.status]
                          )}>
                            {request.status}
                          </span>
                        </div>
                      </div>

                      {/* Request / Target Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                            <Zap className="w-3 h-3 text-apple-blue" />
                            Request ID #{request.id.toUpperCase()}
                            <span className="opacity-30">•</span>
                            <span>{request.email || 'No email'}</span>
                            <span className="opacity-30">•</span>
                            <span>{request.phone}</span>
                          </div>
                          
                          <h2 className="text-sm font-semibold text-[var(--text-primary)] dark:text-white truncate block">
                            {request.vehicleYear} {request.vehicleMake} {request.vehicleModel}
                          </h2>
                          
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[var(--text-secondary)] font-normal">
                            <MapPin className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                            <span className="truncate max-w-[300px]">{request.address}, {request.city}</span>
                            <span className="opacity-30">/</span>
                            <Calendar className="w-3.5 h-3.5 text-apple-blue" />
                            <span>{request.date} @ {request.time}</span>
                          </div>
                        </div>

                        {/* Bento Micro-Stats box matrix matching Seller Console layout precisely */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3.5">
                          <div className="px-3 py-1.5 rounded-xl bg-[var(--text-primary)] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02]">
                            <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Operational Node</p>
                            <p className="text-xs font-bold text-[var(--text-primary)] dark:text-white font-mono mt-0.5">
                              {request.city}
                              <span className="text-[9px] text-apple-green font-semibold font-sans ml-0.5">Active</span>
                            </p>
                          </div>
                          <div className="px-3 py-1.5 rounded-xl bg-[var(--text-primary)] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02]">
                            <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Field Engineer</p>
                            <p className="text-xs font-bold text-apple-blue font-mono mt-0.5 truncate max-w-full">
                              {request.assignedEngineer || 'Assigning...'}
                            </p>
                          </div>
                          <div className="px-3 py-1.5 rounded-xl bg-[var(--text-primary)] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02] sm:block hidden">
                            <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Workflow Phase</p>
                            <p className="text-xs font-bold text-[var(--text-primary)] dark:text-white font-sans mt-0.5 capitalize">{request.status}</p>
                          </div>
                          <div className="px-3 py-1.5 rounded-xl bg-[var(--text-primary)] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02] sm:block hidden">
                            <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Platform Security</p>
                            <p className="text-xs font-bold text-apple-green font-mono mt-0.5">SSL Secured</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions Column */}
                      <div className="flex md:flex-col justify-end items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-black/[0.04] dark:border-white/[0.04] md:pl-5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-wrap items-center gap-1.5 justify-end">
                          <button 
                            onClick={() => openEditModal(request)}
                            className="px-4.5 py-2 rounded-xl bg-apple-blue hover:bg-blue-600 text-white flex items-center justify-center font-semibold text-xs transition-colors"
                            title="Review details"
                          >
                            Review
                          </button>

                          <DropdownMenu>
                            <DropdownMenuTrigger className={cn(
                              "w-8.5 h-8.5 rounded-lg bg-[var(--text-primary)] dark:bg-white/5 flex items-center justify-center transition-all hover:bg-apple-gray dark:hover:bg-white/10 text-apple-text-muted"
                            )}>
                              <MoreVertical className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl border-apple-border/50 backdrop-blur-xl">
                              <DropdownMenuItem 
                                onClick={async () => {
                                  try {
                                    await updateDoc(doc(db, 'inspection_requests', request.id), {
                                      status: 'completed',
                                      updatedAt: serverTimestamp()
                                    });
                                    toast.success("Marked as Completed");
                                  } catch (e) {
                                    toast.error("Failed to update status");
                                  }
                                }}
                                className="font-bold text-xs py-3 px-4 rounded-lg focus:bg-apple-green/10 focus:text-apple-green cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2 text-apple-green" /> Complete Sweep
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={async () => {
                                  try {
                                    await updateDoc(doc(db, 'inspection_requests', request.id), {
                                      status: 'cancelled',
                                      updatedAt: serverTimestamp()
                                    });
                                    toast.error("Marked as Cancelled");
                                  } catch (e) {
                                    toast.error("Failed to update status");
                                  }
                                }}
                                className="font-bold text-xs py-3 px-4 rounded-lg focus:bg-apple-red/10 focus:text-apple-red cursor-pointer"
                              >
                                <XCircle className="w-4 h-4 mr-2 text-apple-red" /> Abort Mission
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </>
      ) : (
        /* Companies Management Panel */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companiesLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-white dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] h-64 animate-pulse" />
              ))
            ) : companies.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04]">
                <p className="text-[var(--text-secondary)] font-medium text-xs">No vehicle inspection partners registered.</p>
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
                          <span className="text-[var(--text-secondary)]">Inspection Fee:</span>
                          <span className="font-semibold text-apple-blue">{company.baseFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-secondary)]">Technicians:</span>
                          <span className="font-semibold text-[var(--text-primary)] dark:text-white">{company.engineersCount} certified</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-secondary)]">Coverage:</span>
                          <span className="font-semibold text-[var(--text-primary)] dark:text-white truncate max-w-[150px]" title={company.coverageCities}>{company.coverageCities}</span>
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
                          baseFee: company.baseFee || '',
                          engineersCount: company.engineersCount || 5,
                          coverageCities: company.coverageCities || '',
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
      <Dialog open={!!selectedRequest} onOpenChange={(open) => { if (!open) setSelectedRequest(null); }}>
        <DialogContent className="max-w-[92vw] lg:max-w-4xl h-[85vh] max-h-[85vh] p-0 overflow-hidden border-none rounded-[2.5rem] bg-white dark:bg-[var(--text-primary)] shadow-2xl flex flex-col">
          {selectedRequest && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-8 border-b border-apple-border flex items-center justify-between bg-apple-gray/10 dark:bg-white/[0.02]">
                <div>
                  <DialogTitle className="text-2xl font-black tracking-tight text-apple-text">Deploy Record Review</DialogTitle>
                  <DialogDescription className="text-xs text-apple-text-muted mt-1 uppercase font-black tracking-widest">Reviewing request {selectedRequest.id}</DialogDescription>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest border",
                  selectedRequest.status === 'completed' 
                    ? "bg-apple-green/10 text-apple-green border-apple-green/20" 
                    : selectedRequest.status === 'cancelled'
                      ? "bg-apple-red/10 text-apple-red border-apple-red/20"
                      : "bg-apple-orange/10 text-apple-orange border-apple-orange/20"
                )}>
                   {selectedRequest.status}
                </span>
              </div>

              <ScrollArea className="flex-1 min-h-0 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted ml-2">Customer Info</p>
                      <div className="glass-panel p-5 rounded-2xl space-y-3.5 shadow-sm">
                        <div className="flex items-center gap-3.5 text-sm font-bold text-apple-text">
                          <Phone className="w-4 h-4 text-apple-blue" />
                          <span>{selectedRequest.phone}</span>
                        </div>
                        <div className="flex items-center gap-3.5 text-sm text-apple-text-muted">
                          <User className="w-4 h-4 text-apple-text-muted" />
                          <span>{selectedRequest.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Location & Schedule */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted ml-2">Location & Schedule</p>
                      <div className="glass-panel p-5 rounded-2xl space-y-3.5 shadow-sm">
                        <div className="flex items-center gap-3.5 text-sm font-bold text-apple-text">
                          <MapPin className="w-4 h-4 text-apple-blue" />
                          <span>{selectedRequest.address}, {selectedRequest.city}</span>
                        </div>
                        <div className="flex items-center gap-3.5 text-sm text-apple-text-muted">
                          <Clock className="w-4 h-4 text-apple-text-muted" />
                          <span>{selectedRequest.date} @ {selectedRequest.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Target Vehicle */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted ml-2">Target Vehicle</p>
                      <div className="p-5 rounded-2xl border border-apple-blue/20 bg-apple-blue/5 dark:bg-apple-blue/10 space-y-3.5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">Model Identity</span>
                          <span className="text-sm font-black text-apple-blue">{selectedRequest.vehicleYear} {selectedRequest.vehicleMake}</span>
                        </div>
                        <div className="h-1 bg-apple-gray dark:bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-apple-blue w-full" />
                        </div>
                        <p className="text-sm text-apple-text-muted leading-relaxed font-bold">
                          {selectedRequest.vehicleModel}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Deployment Control */}
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted ml-2">Deployment Control</p>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted ml-4">Deployment Status</label>
                        <select 
                          className="apple-input w-full"
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as any)}
                        >
                          <option value="pending">Pending Coordination</option>
                          <option value="contacted">Customer Contacted</option>
                          <option value="assigned">Engineer Assigned</option>
                          <option value="completed">Sweep Completed</option>
                          <option value="cancelled">Abort Mission</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted ml-4">Assigned Technician</label>
                        <input 
                          type="text" 
                          placeholder="Technician details..."
                          className="apple-input w-full"
                          value={editEngineer}
                          onChange={(e) => setEditEngineer(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted ml-4">Operational Intelligence</label>
                        <textarea 
                          rows={4}
                          placeholder="Technician notes, findings..."
                          className="apple-input w-full py-4 h-28 resize-none leading-relaxed"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="p-8 border-t border-apple-border bg-apple-gray/30 dark:bg-white/[0.02] flex flex-col md:flex-row gap-4">
                <Button 
                  variant="ghost" 
                  className="flex-1 h-14 rounded-2xl border-2 border-apple-border font-black uppercase tracking-widest text-xs text-apple-text-muted hover:bg-apple-gray dark:hover:bg-white/10 active:scale-95 transition-all"
                  onClick={() => setSelectedRequest(null)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-[2] apple-button-primary h-14 flex items-center justify-center gap-3 disabled:opacity-50 font-black uppercase tracking-widest text-xs text-white"
                  onClick={handleUpdateRequest}
                  disabled={isUpdating}
                >
                  {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Update Log
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Provider Modal */}
      <Dialog open={isCompanyModalOpen} onOpenChange={(open) => { if (!open) { setIsCompanyModalOpen(false); setEditingCompany(null); } }}>
        <DialogContent className="max-w-[92vw] lg:max-w-2xl h-[85vh] max-h-[85vh] p-0 overflow-hidden border-none rounded-[2.5rem] bg-white dark:bg-[var(--text-primary)] shadow-2xl flex flex-col">
          <form onSubmit={handleUpdateCompany} className="flex flex-col h-full overflow-hidden">
            <div className="p-8 border-b border-apple-border flex items-center justify-between bg-apple-gray/10 dark:bg-white/[0.02]">
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight text-apple-text">
                  {editingCompany ? 'Edit Partner Protocol' : 'Add Partner Manifest'}
                </DialogTitle>
                <DialogDescription className="text-xs text-apple-text-muted mt-1 uppercase font-black tracking-widest">
                  {editingCompany ? `Updating partner: ${editingCompany.name}` : 'Registering new automotive inspection partner'}
                </DialogDescription>
              </div>
              <button 
                type="button"
                onClick={() => { setIsCompanyModalOpen(false); setEditingCompany(null); }}
                className="p-2 hover:bg-apple-gray dark:hover:bg-white/10 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ScrollArea className="flex-1 min-h-0 p-8">
              <div className="space-y-6">
                {/* Logo and Identity */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="flex flex-col items-center">
                    <div className="relative group w-28 h-28 rounded-2xl bg-[var(--text-primary)] dark:bg-white/5 p-2 flex items-center justify-center overflow-hidden border border-black/[0.06] dark:border-white/[0.06] shadow-inner">
                      {companyForm.logoUrl ? (
                        <img 
                          src={companyForm.logoUrl} 
                          alt="logo" 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-[var(--text-secondary)]" />
                      )}
                      
                      {isUploadingLogo && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    
                    <label className="mt-2 cursor-pointer text-xs font-semibold text-apple-blue hover:underline">
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

                  <div className="md:col-span-2 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">Partner Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. PakWheels Inspection Crew"
                        className="apple-input w-full"
                        value={companyForm.name}
                        onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Fees and Operational attributes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">Base Inspection Fee</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Rs. 4,500"
                      className="apple-input w-full"
                      value={companyForm.baseFee}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, baseFee: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">Certified Technicians Count</label>
                    <input 
                      type="number" 
                      required
                      min={1}
                      className="apple-input w-full"
                      value={companyForm.engineersCount}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, engineersCount: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">Coverage Cities</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Lahore, Karachi, Islamabad"
                    className="apple-input w-full"
                    value={companyForm.coverageCities}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, coverageCities: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">Service Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Provide a detailed outline of services included..."
                    className="apple-input w-full py-3 h-20 resize-none leading-relaxed"
                    value={companyForm.description}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                {/* Contact Attributes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">Contact Phone</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 042-111-943-357"
                      className="apple-input w-full"
                      value={companyForm.contactPhone}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">Contact Email</label>
                    <input 
                      type="email" 
                      placeholder="e.g. inspections@pakwheels.com"
                      className="apple-input w-full"
                      value={companyForm.contactEmail}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Presentation Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4.5 rounded-2xl bg-[var(--text-primary)] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02]">
                  <div className="flex items-center justify-between sm:justify-start gap-3">
                    <input 
                      type="checkbox" 
                      id="isFeatured"
                      className="rounded text-apple-blue focus:ring-apple-blue h-4 w-4"
                      checked={companyForm.isFeatured}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    />
                    <label htmlFor="isFeatured" className="text-xs font-semibold text-[var(--text-primary)] dark:text-white cursor-pointer select-none">Featured Partner</label>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2 flex items-center gap-3 justify-between sm:justify-end">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Sort Order</label>
                    <input 
                      type="number" 
                      className="apple-input w-24 text-center"
                      value={companyForm.order}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">Partner Visibility Status</label>
                  <select 
                    className="apple-input w-full"
                    value={companyForm.status}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, status: e.target.value as any }))}
                  >
                    <option value="active">Active (Visible to users)</option>
                    <option value="hidden">Hidden (System only)</option>
                  </select>
                </div>
              </div>
            </ScrollArea>

            <div className="p-8 border-t border-apple-border bg-apple-gray/30 dark:bg-white/[0.02] flex flex-col md:flex-row gap-4">
              <Button 
                type="button"
                variant="ghost" 
                className="flex-1 h-14 rounded-2xl border-2 border-apple-border font-black uppercase tracking-widest text-xs text-apple-text-muted hover:bg-apple-gray dark:hover:bg-white/10 active:scale-95 transition-all"
                onClick={() => { setIsCompanyModalOpen(false); setEditingCompany(null); }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="flex-[2] apple-button-primary h-14 flex items-center justify-center gap-3 disabled:opacity-50 font-black uppercase tracking-widest text-xs text-white"
                disabled={isUpdating}
              >
                {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Partner
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
