import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  Car, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Clock4, 
  AlertCircle,
  Truck,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  ClipboardList,
  Zap
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { InspectionRequest } from '../types';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function UserInspections() {
  const { user } = useAuth();
  const [inspections, setInspections] = useState<InspectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'inspection_requests'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as InspectionRequest[];
      setInspections(fetched);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to inspections:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const getStatusIcon = (status: InspectionRequest['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-apple-green" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-apple-red" />;
      case 'assigned': return <Truck className="w-5 h-5 text-apple-blue" />;
      case 'contacted': return <ClipboardList className="w-5 h-5 text-apple-blue" />;
      default: return <Clock4 className="w-5 h-5 text-apple-text-muted" />;
    }
  };

  const getStatusColor = (status: InspectionRequest['status']) => {
    switch (status) {
      case 'completed': return 'bg-apple-green/10 text-apple-green';
      case 'cancelled': return 'bg-apple-red/10 text-apple-red';
      case 'assigned': return 'bg-apple-blue/10 text-apple-blue';
      case 'contacted': return 'bg-apple-blue/10 text-apple-blue';
      default: return 'bg-apple-gray text-apple-text-muted text-gray-500';
    }
  };

  const statusSteps = ['pending', 'contacted', 'assigned', 'completed'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[var(--surface-dark)] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl animate-pulse">
        <Clock4 className="w-8 h-8 text-apple-blue animate-spin mb-4" />
        <p className="text-xs text-[#86868B] font-semibold tracking-wide uppercase">Synchronizing inspection portfolio...</p>
      </div>
    );
  }

  if (inspections.length === 0) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
              <ClipboardList className="w-3.5 h-3.5" />
              Machine Audit & Diagnostics
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-tight">
              Car Inspections
            </h1>
            <p className="text-xs text-[#86868B] dark:text-[#86868B] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
              Detailed hardware validation, digital diagnostics, and machine audits for your marketplace vehicles.
            </p>
          </div>
        </div>

        <div className="py-16 text-center bg-[#F5F5F7]/30 dark:bg-white/[0.005] rounded-2xl border border-dashed border-black/[0.06] dark:border-white/[0.06]">
          <div className="w-10 h-10 bg-apple-blue/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <History className="w-5 h-5 text-apple-blue/70 animate-pulse" />
          </div>
          <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white mb-1">No Inspections History</h3>
          <p className="text-xs text-[#86868B] max-w-xs mx-auto mb-4 leading-relaxed font-normal">
            You haven't booked any car inspections yet. Get professional diagnostic reports for your vehicles.
          </p>
          <Link to="/inspection" className="inline-flex items-center gap-1.5 px-4 py-2 bg-apple-blue hover:bg-blue-600 text-white rounded-full text-xs font-semibold transition-all shadow-sm border-none">
            Book Your First Inspection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <ClipboardList className="w-3.5 h-3.5" />
            Machine Audit & Diagnostics
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-tight">
            Car Inspections
          </h1>
          <p className="text-xs text-[#86868B] dark:text-[#86868B] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            Detailed hardware validation, digital diagnostics, and machine audits for your marketplace vehicles.
          </p>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-[var(--surface-dark)] border border-black/[0.04] dark:border-white/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.01)] shrink-0 self-start md:self-end">
           <div className="w-8 h-8 bg-apple-blue/5 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-apple-blue" />
           </div>
           <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#86868B]">Audit Node</p>
              <p className="text-xs font-semibold text-[#1D1D1F] dark:text-white font-mono">{inspections.length} Reports</p>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        {inspections.map((inspection, index) => (
          <motion.div
            key={inspection.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "bg-white dark:bg-[var(--surface-dark)] rounded-2xl border overflow-hidden transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.01)]",
              expandedId === inspection.id ? "border-apple-blue/30 dark:border-apple-blue/30 ring-1 ring-apple-blue/10" : "border-black/[0.04] dark:border-white/[0.04] hover:border-black/[0.08] dark:hover:border-white/[0.08]"
            )}
          >
            {/* Header / Summary */}
            <div 
              onClick={() => setExpandedId(expandedId === inspection.id ? null : inspection.id)}
              className="p-5 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-apple-blue/5 border border-apple-blue/10 flex items-center justify-center shrink-0">
                  <Car className="w-6 h-6 text-apple-blue" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white tracking-tight">
                      {inspection.vehicleYear} {inspection.vehicleMake} {inspection.vehicleModel}
                    </h3>
                    <div className={cn(
                        "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider flex items-center gap-1",
                        getStatusColor(inspection.status)
                    )}>
                        {inspection.status.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold text-[#86868B] uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Clock4 className="w-3 h-3" />
                      {inspection.date} @ {inspection.time}
                    </div>
                    <span className="w-1 h-1 rounded-full bg-[#86868B]/30" />
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {inspection.city}
                    </div>
                    <span className="w-1 h-1 rounded-full bg-[#86868B]/30" />
                    <span className="font-mono text-[9px] opacity-60">ID: {inspection.id.slice(0, 8)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-none border-black/[0.04] dark:border-white/[0.04]">
                <div className="flex-1 md:flex-none">
                  {inspection.status === 'completed' ? (
                    <button className="w-full md:w-auto px-4 py-2 bg-apple-blue text-white rounded-full text-xs font-semibold shadow-sm hover:bg-blue-600 transition-all flex items-center justify-center gap-1 border-none">
                       <ExternalLink className="w-3.5 h-3.5" />
                       View Report
                    </button>
                  ) : (
                    <div className="text-left md:text-right">
                       <p className="text-[8px] font-bold text-[#86868B] uppercase tracking-wider mb-0.5">Technician</p>
                       <p className="text-xs font-semibold text-[#1D1D1F] dark:text-white">{(inspection as any).assignedEngineer || 'Assigning soon...'}</p>
                    </div>
                  )}
                </div>
                <button className={cn(
                  "p-2 bg-[#F5F5F7] dark:bg-white/5 rounded-xl transition-all duration-300 border-none",
                  expandedId === inspection.id ? "rotate-180 bg-apple-blue/10 text-apple-blue" : "text-[#86868B]"
                )}>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expanded Content: Tracking & Details */}
            <AnimatePresence>
              {expandedId === inspection.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="px-5 pb-5 pt-4 border-t border-black/[0.04] dark:border-white/[0.04] space-y-6">
                    
                    {/* Status Tracking Timeline */}
                    {inspection.status !== 'cancelled' && (
                       <div className="relative pt-6 pb-2">
                          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-black/[0.04] dark:bg-white/[0.04] rounded-full overflow-hidden">
                             <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(statusSteps.indexOf(inspection.status) + 1) * 25}%` }}
                                transition={{ duration: 1.2, ease: "circOut" }}
                                className="h-full bg-apple-blue shadow-[0_0_20px_rgba(0,122,255,0.2)]" 
                             />
                          </div>
                          
                          <div className="relative flex justify-between">
                             {statusSteps.map((step, idx) => {
                                const isCompleted = statusSteps.indexOf(inspection.status) >= idx;
                                const isCurrent = inspection.status === step;

                                return (
                                   <div key={step} className="flex flex-col items-center">
                                      <div className={cn(
                                         "w-5 h-5 rounded-full border transition-all duration-500 z-10 flex items-center justify-center text-[10px]",
                                         isCompleted ? "bg-apple-blue border-apple-blue text-white" : "bg-white dark:bg-[var(--surface-dark)] border-black/[0.08] dark:border-white/[0.08] text-[#86868B]"
                                      )}>
                                         {isCompleted && <CheckCircle2 className="w-3 h-3 stroke-[2.5px]" />}
                                      </div>
                                      <span className={cn(
                                         "absolute top-7 text-[9px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-500",
                                         isCurrent ? "text-apple-blue" : isCompleted ? "text-[#1D1D1F] dark:text-white" : "text-[#86868B] opacity-50"
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
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-bold text-[#86868B] uppercase tracking-[0.15em] flex items-center gap-1.5">
                             <ShieldCheck className="w-3.5 h-3.5 text-apple-blue" />
                             Audit Parameters
                          </h4>
                          <div className="space-y-2.5">
                             <div className="flex justify-between items-center py-1.5 border-b border-black/[0.04] dark:border-white/[0.04]">
                                <span className="text-xs font-medium text-[#86868B]">Rendezvous Point</span>
                                <span className="text-xs font-semibold text-[#1D1D1F] dark:text-white">{inspection.address}</span>
                             </div>
                             <div className="flex justify-between items-center py-1.5 border-b border-black/[0.04] dark:border-white/[0.04]">
                                <span className="text-xs font-medium text-[#86868B]">Communication Node</span>
                                <span className="text-xs font-semibold text-[#1D1D1F] dark:text-white">{inspection.phone}</span>
                             </div>
                             <div className="flex justify-between items-center py-1.5 border-b border-black/[0.04] dark:border-white/[0.04]">
                                <span className="text-xs font-medium text-[#86868B]">Diagnostics Fee</span>
                                <span className="text-xs font-semibold text-[#1D1D1F] dark:text-white">PKR 7,500</span>
                             </div>
                          </div>
                       </div>

                       {/* Admin Notes Section */}
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-bold text-[#86868B] uppercase tracking-[0.15em] flex items-center gap-1.5">
                             <AlertCircle className="w-3.5 h-3.5 text-apple-blue" />
                             Technical Memo
                          </h4>
                          <div className="p-4 rounded-xl bg-black/[0.01] dark:bg-white/[0.01] border border-black/[0.04] dark:border-white/[0.04] min-h-[90px]">
                             {inspection.adminNotes ? (
                                <p className="text-xs font-medium text-[#1D1D1F] dark:text-white leading-relaxed">
                                   {inspection.adminNotes}
                                </p>
                             ) : (
                                <p className="text-xs italic text-[#86868B] font-medium leading-relaxed">
                                   No technical notes available yet. Our node is currently processing the deployment request.
                                </p>
                             )}
                          </div>
                       </div>

                       {/* Action Section */}
                       <div className="space-y-6">
                           <h4 className="text-[11px] font-black text-apple-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                             <Zap className="w-4 h-4 text-apple-blue" />
                             Next Steps
                          </h4>
                          <div className="space-y-3">
                             {inspection.status === 'pending' && (
                                <button className="w-full px-4 py-2 rounded-xl border border-apple-red/10 text-apple-red font-semibold text-xs hover:bg-apple-red/5 transition-all">
                                   Cancel Deployment
                                </button>
                             )}
                             <button className="w-full px-4 py-2 rounded-xl bg-[#F5F5F7] dark:bg-white/5 border-none text-[#1D1D1F] dark:text-white font-semibold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-1.5">
                                <MessageSquare className="w-4 h-4" />
                                Support Interface
                             </button>
                             <p className="text-[9px] text-center text-[#86868B] font-medium mt-2 leading-relaxed">
                                Need immediate assistance? <br /> Contact our technical dispatch at +92 300 0000000
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

function MessageSquare({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
