import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Search, 
  Filter, 
  Calendar,
  AlertCircle,
  FileText,
  TrendingUp,
  CreditCard,
  Briefcase,
  Smartphone,
  ShieldCheck,
  User,
  ArrowUpRight
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { FinancingRequest } from '../types';
import { formatPrice, cn } from '../lib/utils';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function UserFinancing() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<FinancingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<FinancingRequest | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'financing_requests'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FinancingRequest[];
      setRequests(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredRequests = requests.filter(r => 
    r.vehicleMake.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: FinancingRequest['status']) => {
    switch (status) {
      case 'approved': return 'bg-apple-green/10 text-apple-green';
      case 'disbursed': return 'bg-apple-blue/10 text-apple-blue';
      case 'rejected': return 'bg-apple-red/10 text-apple-red';
      case 'documents_requested': return 'bg-[#FF9500]/10 text-[#FF9500]';
      case 'under_review': return 'bg-black/[0.04] dark:bg-white/10 text-[#1D1D1F] dark:text-white';
      default: return 'bg-black/[0.04] dark:bg-white/5 text-[#86868B]';
    }
  };

  const getStatusLabel = (status: FinancingRequest['status']) => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-10 h-10 border-2 border-apple-blue/20 border-t-apple-blue rounded-full animate-spin mb-4" />
        <p className="text-[#86868B] text-xs font-semibold">Retrieving your financing portfolio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header Panel */}
      <div className="bg-white dark:bg-[var(--surface-dark)] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-white">Financing Applications</h2>
          <p className="text-xs font-semibold text-[#86868B] mt-1">Monitor credit scores, active monthly EMIs, and document statuses.</p>
        </div>
        
        <div className="flex gap-4 self-start md:self-center">
           <div className="text-left md:text-right">
              <p className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider mb-0.5">Active Requests</p>
              <p className="text-base font-bold text-[#1D1D1F] dark:text-white">{requests.length}</p>
           </div>
           <div className="w-px h-8 bg-black/[0.08] dark:bg-white/[0.08]" />
           <div className="text-left md:text-right">
              <p className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider mb-0.5">Credit Limit</p>
              <p className="text-base font-bold text-apple-green">Rs 4.5M*</p>
           </div>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white dark:bg-[var(--surface-dark)] rounded-3xl p-12 text-center border border-black/[0.04] dark:border-white/[0.04]">
          <div className="w-16 h-16 bg-[#F5F5F7] dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <DollarSign className="w-7 h-7 text-[#86868B]" />
          </div>
          <h3 className="text-lg font-bold tracking-tight text-[#1D1D1F] dark:text-white mb-2">No Active Financing</h3>
          <p className="text-[#86868B] text-xs font-medium mb-6 max-w-xs mx-auto leading-relaxed">
            You haven't submitted any financing requests yet. Apply now for fast-track credit approval.
          </p>
          <Link to="/financing" className="px-5 py-2.5 bg-apple-blue hover:bg-blue-600 text-white rounded-full text-xs font-semibold shadow-sm transition-all inline-block border-none">
            Apply for Financing
          </Link>
        </div>
      ) : (
        <>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
              <input
                type="text"
                placeholder="Search requests by asset..."
                className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[var(--surface-dark)] border border-black/[0.04] dark:border-white/[0.04] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-apple-blue"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Requests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRequests.map((request) => (
              <motion.div
                key={request.id}
                layoutId={request.id}
                onClick={() => setSelectedRequest(request)}
                className="bg-white dark:bg-[var(--surface-dark)] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-5 cursor-pointer hover:shadow-md transition-all duration-300 group relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4 gap-2">
                      <div className="space-y-0.5 min-w-0">
                          <p className="text-[9px] font-mono text-[#86868B] truncate max-w-[120px]">ID: {request.id.slice(0, 8)}</p>
                          <h3 className="text-base font-bold tracking-tight text-[#1D1D1F] dark:text-white group-hover:text-apple-blue transition-colors truncate">
                              {request.vehicleMake} {request.vehicleModel}
                          </h3>
                      </div>
                      <div className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0",
                          getStatusColor(request.status)
                      )}>
                          {getStatusLabel(request.status)}
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 my-4">
                      <div className="p-3 bg-[#F5F5F7] dark:bg-white/5 rounded-2xl">
                          <p className="text-[8px] font-bold text-[#86868B] uppercase tracking-wider mb-0.5">Monthly EMI</p>
                          <p className="text-xs font-bold text-[#1D1D1F] dark:text-white">{request.monthlyInstallment ? formatPrice(request.monthlyInstallment) : 'Pending'}</p>
                      </div>
                      <div className="p-3 bg-[#F5F5F7] dark:bg-white/5 rounded-2xl">
                          <p className="text-[8px] font-bold text-[#86868B] uppercase tracking-wider mb-0.5">Total Loan</p>
                          <p className="text-xs font-bold text-[#1D1D1F] dark:text-white">{formatPrice(request.vehiclePrice - request.downPayment)}</p>
                      </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3.5 border-t border-black/[0.04] dark:border-white/[0.04]">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#86868B]">
                        <Calendar className="w-3.5 h-3.5" />
                        {request.createdAt?.seconds ? format(new Date(request.createdAt.seconds * 1000), 'MMM d, yyyy') : 'Recently'}
                    </div>
                    <div className="flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider text-apple-blue group-hover:translate-x-0.5 transition-transform">
                        Details <ChevronRight className="w-3 h-3" />
                    </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
            <motion.div
              layoutId={selectedRequest.id}
              className="bg-white dark:bg-[#1C1C1E] w-full max-w-lg rounded-3xl border border-black/[0.04] dark:border-white/[0.04] shadow-xl overflow-hidden flex flex-col"
            >
              <div className="p-6 space-y-6 overflow-y-auto max-h-[85vh] custom-scrollbar">
                <div className="flex justify-between items-start">
                   <div className="space-y-0.5">
                      <div className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mb-2 inline-block",
                          getStatusColor(selectedRequest.status)
                      )}>
                          {getStatusLabel(selectedRequest.status)}
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-white">
                          {selectedRequest.vehicleYear} {selectedRequest.vehicleMake} {selectedRequest.vehicleModel}
                      </h2>
                      <p className="text-[10px] font-semibold text-[#86868B] font-mono mt-1">APPLICATION ID: {selectedRequest.id}</p>
                   </div>
                   <button 
                      onClick={() => setSelectedRequest(null)}
                      className="p-1.5 rounded-full hover:bg-[#F5F5F7] dark:hover:bg-white/5 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-all bg-transparent border-none"
                   >
                      <XCircle className="w-5 h-5" />
                   </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                   <div className="space-y-0.5">
                      <p className="text-[8px] font-bold text-[#86868B] uppercase tracking-wider">Market Price</p>
                      <p className="text-xs font-bold text-[#1D1D1F] dark:text-white">{formatPrice(selectedRequest.vehiclePrice)}</p>
                   </div>
                   <div className="space-y-0.5">
                      <p className="text-[8px] font-bold text-[#86868B] uppercase tracking-wider">Down Payment</p>
                      <p className="text-xs font-bold text-[#1D1D1F] dark:text-white">{formatPrice(selectedRequest.downPayment)} ({Math.round((selectedRequest.downPayment / selectedRequest.vehiclePrice) * 100)}%)</p>
                   </div>
                   <div className="space-y-0.5">
                      <p className="text-[8px] font-bold text-[#86868B] uppercase tracking-wider">Net EMI</p>
                      <p className="text-xs font-bold text-apple-blue">
                        {selectedRequest.monthlyInstallment ? formatPrice(selectedRequest.monthlyInstallment) : 'TBD'}
                      </p>
                   </div>
                   <div className="space-y-0.5">
                      <p className="text-[8px] font-bold text-[#86868B] uppercase tracking-wider">Rate (APR)</p>
                      <p className="text-xs font-bold text-[#1D1D1F] dark:text-white">{selectedRequest.interestRate || '15.5'}%*</p>
                   </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5F5F7] dark:bg-white/5 border border-black/[0.04] dark:border-white/[0.04] space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-2.5">
                         <CreditCard className="w-4 h-4 text-apple-blue shrink-0 mt-0.5" />
                         <div>
                            <p className="text-[8px] font-bold text-[#86868B] uppercase tracking-wider">Plan</p>
                            <p className="text-xs font-bold text-[#1D1D1F] dark:text-white">{selectedRequest.loanTerm.replace('_', ' ').toUpperCase()}</p>
                         </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                         <Briefcase className="w-4 h-4 text-apple-blue shrink-0 mt-0.5" />
                         <div>
                            <p className="text-[8px] font-bold text-[#86868B] uppercase tracking-wider">Employment</p>
                            <p className="text-xs font-bold text-[#1D1D1F] dark:text-white capitalize">{selectedRequest.employmentStatus}</p>
                         </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                         <Smartphone className="w-4 h-4 text-apple-blue shrink-0 mt-0.5" />
                         <div>
                            <p className="text-[8px] font-bold text-[#86868B] uppercase tracking-wider">Phone</p>
                            <p className="text-xs font-bold text-[#1D1D1F] dark:text-white font-mono">{selectedRequest.phone}</p>
                         </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                         <ShieldCheck className="w-4 h-4 text-apple-blue shrink-0 mt-0.5" />
                         <div>
                            <p className="text-[8px] font-bold text-[#86868B] uppercase tracking-wider">Income</p>
                            <p className="text-xs font-bold text-[#1D1D1F] dark:text-white">{formatPrice(selectedRequest.monthlyIncome)}/mo</p>
                         </div>
                      </div>
                   </div>

                   {selectedRequest.adminNotes && (
                     <div className="p-3 bg-apple-blue/5 rounded-xl border border-apple-blue/10">
                        <p className="text-[9px] font-bold text-apple-blue uppercase tracking-wider mb-1 flex items-center gap-1">
                           <AlertCircle className="w-3.5 h-3.5" /> Underwriter Note
                        </p>
                        <p className="text-xs text-[#1D1D1F] dark:text-white font-medium leading-relaxed italic">
                           "{selectedRequest.adminNotes}"
                        </p>
                     </div>
                   )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button className="flex-1 px-4 py-2.5 bg-apple-blue hover:bg-blue-600 text-white rounded-full text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 border-none">
                        Download NOC <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button className="flex-1 px-4 py-2.5 rounded-full bg-[#F5F5F7] dark:bg-white/5 border border-black/[0.04] dark:border-white/[0.04] text-[#1D1D1F] dark:text-white font-semibold text-xs hover:bg-black/[0.08] dark:hover:bg-white/10 transition-all flex items-center justify-center gap-1.5">
                        Support Terminal <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
