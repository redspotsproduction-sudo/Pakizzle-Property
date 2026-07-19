import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  Shield, 
  Car, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Clock4, 
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  ClipboardList,
  Zap,
  CreditCard,
  FileText
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { InsuranceRequest } from '../types';
import { cn, formatPrice } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function UserInsurance() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<InsuranceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'insurance_requests'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const today = new Date().toISOString().split('T')[0];
      const fetched = snapshot.docs.map(docSnap => {
        const data = docSnap.data() as InsuranceRequest;
        const id = docSnap.id;

        // Auto-expire check
        if (data.status === 'active' && data.expiryDate && data.expiryDate < today) {
          updateDoc(doc(db, 'insurance_requests', id), {
            status: 'expired',
            updatedAt: serverTimestamp()
          }).catch(console.error);

          return { ...data, id, status: 'expired' } as InsuranceRequest;
        }

        return {
          ...data,
          id
        } as InsuranceRequest;
      });
      setRequests(fetched);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to insurance requests:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const getStatusIcon = (status: InsuranceRequest['status']) => {
    switch (status) {
      case 'active': return <ShieldCheck className="w-3 h-3 text-apple-green" />;
      case 'cancelled': return <XCircle className="w-3 h-3 text-apple-red" />;
      case 'expired': return <AlertCircle className="w-3 h-3 text-apple-red" />;
      case 'payment_received': return <CreditCard className="w-3 h-3 text-[#1D1D1F] dark:text-white" />;
      case 'quote_sent': return <FileText className="w-3 h-3 text-apple-blue" />;
      default: return <Clock4 className="w-3 h-3 text-[#86868B]" />;
    }
  };

  const getStatusColor = (status: InsuranceRequest['status']) => {
    switch (status) {
      case 'active': return 'bg-apple-green/10 text-apple-green';
      case 'cancelled': return 'bg-apple-red/10 text-apple-red';
      case 'expired': return 'bg-apple-red/10 text-apple-red';
      case 'payment_received': return 'bg-black/[0.04] dark:bg-white/10 text-[#1D1D1F] dark:text-white';
      case 'quote_sent': return 'bg-apple-blue/10 text-apple-blue';
      default: return 'bg-black/[0.04] dark:bg-white/5 text-[#86868B]';
    }
  };

  const statusSteps = ['pending', 'quote_sent', 'payment_received', 'active'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-10 h-10 border-2 border-apple-blue/20 border-t-apple-blue rounded-full animate-spin mb-4" />
        <p className="text-[#86868B] text-xs font-semibold">Retrieving your insurance portfolio...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white dark:bg-[#161617] rounded-3xl p-12 text-center border border-black/[0.04] dark:border-white/[0.04]">
        <div className="w-16 h-16 bg-[#F5F5F7] dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Shield className="w-7 h-7 text-[#86868B]" />
        </div>
        <h3 className="text-lg font-bold tracking-tight text-[#1D1D1F] dark:text-white mb-2">No Policies Found</h3>
        <p className="text-[#86868B] text-xs font-medium mb-6 max-w-xs mx-auto leading-relaxed">
          Protect your assets with Pakizzle Secure. Get instant quotes and real-time policy management.
        </p>
        <Link to="/insurance" className="px-5 py-2.5 bg-apple-blue hover:bg-blue-600 text-white rounded-full text-xs font-semibold shadow-sm transition-all inline-block border-none">Secure a Vehicle</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-white">Insurance Policies</h2>
          <p className="text-xs font-semibold text-[#86868B] mt-1">Manage your active coverages, premium schedules, and underwriters.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center px-4 py-1.5 rounded-full border border-black/[0.04] dark:border-white/[0.04] bg-[#F5F5F7]/50 dark:bg-white/[0.02]">
          <div className="w-1.5 h-1.5 rounded-full bg-apple-green animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#86868B]">Real-Time Sync</span>
        </div>
      </div>

      <div className="space-y-4">
        {requests.map((request, index) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "bg-white dark:bg-[#161617] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden transition-all duration-300",
              expandedId === request.id ? "shadow-md bg-[#FAFAFC] dark:bg-[#1C1C1E]" : "hover:bg-[#FAFAFC] dark:hover:bg-[#1C1C1E]"
            )}
          >
            {/* Header / Summary */}
            <div 
              onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
              className="p-5 md:p-6 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-apple-blue/5 border border-apple-blue/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className={cn("w-6 h-6", request.status === 'active' ? 'text-apple-green' : 'text-apple-blue')} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-[#1D1D1F] dark:text-white">
                      {request.vehicleYear} {request.vehicleMake} {request.vehicleModel}
                    </h3>
                    <div className={cn(
                        "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1",
                        getStatusColor(request.status)
                    )}>
                        {getStatusIcon(request.status)}
                        {request.status.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] font-semibold text-[#86868B]">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      {request.insuranceType.replace('_', ' ')}
                    </div>
                    <span className="w-1 h-1 rounded-full bg-[#86868B]/30" />
                    <div className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      Policy: {request.policyNumber || 'Pending'}
                    </div>
                    <span className="w-1 h-1 rounded-full bg-[#86868B]/30" />
                    <span className="font-mono text-[9px] opacity-60">ID: {request.id.slice(0, 8)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-none border-black/[0.04] dark:border-white/[0.04]">
                <div className="flex-1 md:flex-none">
                  {request.status === 'active' ? (
                    <div className="text-left md:text-right">
                       <p className="text-[8px] font-bold text-[#86868B] uppercase tracking-wider mb-0.5">Expires On</p>
                       <p className="text-xs font-bold text-apple-red">{request.expiryDate ? new Date(request.expiryDate).toLocaleDateString() : 'TBD'}</p>
                    </div>
                  ) : request.status === 'quote_sent' ? (
                    <button className="w-full md:w-auto px-4 py-2 bg-apple-blue text-white rounded-full text-xs font-semibold shadow-sm hover:bg-blue-600 transition-all flex items-center justify-center gap-1 border-none">
                       <CreditCard className="w-3.5 h-3.5" />
                       Pay Premium
                    </button>
                  ) : (
                    <div className="text-left md:text-right">
                       <p className="text-[8px] font-bold text-[#86868B] uppercase tracking-wider mb-0.5">Estimated Premium</p>
                       <p className="text-xs font-bold text-[#1D1D1F] dark:text-white">{formatPrice(request.quoteAmount || 0)}</p>
                    </div>
                  )}
                </div>
                <button className={cn(
                  "p-2 bg-[#F5F5F7] dark:bg-white/5 rounded-xl transition-all duration-300 border-none",
                  expandedId === request.id ? "rotate-180 bg-apple-blue/10 text-apple-blue" : "text-[#86868B]"
                )}>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expanded Content: Tracking & Details */}
            <AnimatePresence>
              {expandedId === request.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="px-5 pb-5 pt-4 border-t border-black/[0.04] dark:border-white/[0.04] space-y-6">
                    
                    {/* Status Tracking Timeline */}
                    {request.status !== 'cancelled' && request.status !== 'expired' && (
                       <div className="relative pt-6 pb-2">
                          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-black/[0.04] dark:bg-white/[0.04] rounded-full overflow-hidden">
                             <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(statusSteps.indexOf(request.status) + 1) * 33.3}%` }}
                                transition={{ duration: 1.2, ease: "circOut" }}
                                className="h-full bg-apple-blue shadow-[0_0_20px_rgba(0,122,255,0.2)]" 
                             />
                          </div>
                          
                          <div className="relative flex justify-between">
                             {statusSteps.map((step, idx) => {
                                const isCompleted = statusSteps.indexOf(request.status) >= idx;
                                const isCurrent = request.status === step;

                                return (
                                   <div key={step} className="flex flex-col items-center">
                                      <div className={cn(
                                         "w-5 h-5 rounded-full border transition-all duration-700 z-10 flex items-center justify-center text-[10px]",
                                         isCompleted ? "bg-apple-blue border-apple-blue text-white" : "bg-white dark:bg-[#161617] border-black/[0.08] dark:border-white/[0.08] text-[#86868B]"
                                      )}>
                                         {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5px]" />}
                                      </div>
                                      <span className={cn(
                                         "absolute top-7 text-[9px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-500",
                                         isCurrent ? "text-apple-blue" : isCompleted ? "text-[#1D1D1F] dark:text-white" : "text-[#86868B] opacity-40 text-[9px]"
                                      )}>
                                         {step.replace('_', ' ')}
                                      </span>
                                   </div>
                                );
                             })}
                          </div>
                       </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                       {/* Details Section */}
                       <div className="space-y-6">
                          <h4 className="text-[10px] font-bold text-[#86868B] uppercase tracking-[0.15em] flex items-center gap-1.5">
                             <CreditCard className="w-3.5 h-3.5 text-apple-blue" />
                             Policy Breakdown
                          </h4>
                          <div className="space-y-4">
                             <div className="flex justify-between items-center py-1.5 border-b border-black/[0.04] dark:border-white/[0.04]">
                               <span className="text-xs font-medium text-[#86868B]">Vehicle Value</span>
                               <span className="text-xs font-semibold text-[#1D1D1F] dark:text-white">{formatPrice(request.vehicleValue)}</span>
                             </div>
                             <div className="flex justify-between items-center py-1.5 border-b border-black/[0.04] dark:border-white/[0.04]">
                               <span className="text-xs font-medium text-[#86868B]">Coverage Period</span>
                               <span className="text-xs font-semibold text-[#1D1D1F] dark:text-white">{request.coveragePeriod.replace('_', ' ')}</span>
                             </div>
                             <div className="flex justify-between items-center py-1.5 border-b border-black/[0.04] dark:border-white/[0.04]">
                               <span className="text-xs font-medium text-[#86868B]">City of Registration</span>
                               <span className="text-xs font-semibold text-[#1D1D1F] dark:text-white">{request.city}</span>
                             </div>
                          </div>
                       </div>

                       {/* Admin Notes Section */}
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-bold text-[#86868B] uppercase tracking-[0.15em] flex items-center gap-1.5">
                             <AlertCircle className="w-3.5 h-3.5 text-apple-blue" />
                             Underwriter Memo
                          </h4>
                          <div className="p-4 rounded-2xl bg-[#F5F5F7] dark:bg-white/5 border border-black/[0.04] dark:border-white/[0.04] min-h-[100px] flex items-start">
                             {request.adminNotes ? (
                                <p className="text-xs font-semibold text-[#1D1D1F] dark:text-white leading-relaxed">
                                   {request.adminNotes}
                                </p>
                             ) : (
                                <p className="text-xs italic text-[#86868B] font-semibold leading-relaxed">
                                   Your profile is undergoing risk assessment. We will update this memo with technical details shortly.
                                </p>
                             )}
                          </div>
                       </div>

                       {/* Action Section */}
                       <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-[#86868B] uppercase tracking-[0.15em] flex items-center gap-1.5">
                             <Zap className="w-3.5 h-3.5 text-apple-blue" />
                             Policy Actions
                          </h4>
                          <div className="space-y-2.5">
                             {request.status === 'pending' && (
                                <button className="w-full px-4 py-2.5 rounded-xl border border-apple-red/10 text-apple-red font-semibold text-xs hover:bg-apple-red/5 transition-all">
                                   Withdraw Request
                                </button>
                             )}
                             {request.status === 'active' && (
                                <button className="w-full px-4 py-2.5 rounded-xl bg-apple-green/10 text-apple-green font-semibold text-xs hover:bg-apple-green/20 transition-all flex items-center justify-center gap-1.5">
                                   <Zap className="w-3.5 h-3.5" />
                                   Lodge a Claim
                                </button>
                             )}
                             <button className="w-full px-4 py-2.5 rounded-xl bg-[#F5F5F7] dark:bg-white/5 border border-black/[0.04] dark:border-white/[0.04] text-[#1D1D1F] dark:text-white font-semibold text-xs hover:bg-black/[0.08] dark:hover:bg-white/10 transition-all flex items-center justify-center gap-1.5">
                                <ExternalLink className="w-3.5 h-3.5" />
                                Support Terminal
                             </button>
                             <p className="text-[10px] text-center text-[#86868B] font-medium mt-3 leading-relaxed">
                                Questions about your coverage? <br /> Our priority support line is encrypted and active.
                             </p>
                          </div>
                       </div>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
