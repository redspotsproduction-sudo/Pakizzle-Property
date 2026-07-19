import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Mail, 
  Phone, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronRight,
  Camera,
  FileText,
  ArrowLeft,
  Lock
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Badge, { BadgeType } from './Badge';
import { useAuth } from '../context/AuthContext';

import ContactVerification from './Verification/ContactVerification';

interface VerificationStatus {
  emailVerified: boolean;
  phoneVerified: boolean;
  identityStatus: 'none' | 'pending' | 'approved' | 'rejected';
  businessStatus: 'none' | 'pending' | 'approved' | 'rejected';
  badge: BadgeType;
  pendingRequest: { type: string; createdAt: string } | null;
}

export default function VerificationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVerification, setActiveVerification] = useState<'email' | 'phone' | null>(null);

  useEffect(() => {
    if (user) {
      fetchStatus();
    }
  }, [user]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, ping the server to ensure it's up
      const pingRes = await fetch('/api/ping');
      if (!pingRes.ok) throw new Error("Server is not responding");
      
      const token = localStorage.getItem('token');
      const res = await fetch('/api/verification/status', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'x-fb-uid': user?.uid || '' // Pass Firebase UID as fallback
        }
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errData.error || `Error ${res.status}`);
      }
      
      const data = await res.json();
      setStatus(data);
    } catch (e: any) {
      console.error("Failed to fetch status", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-apple-bg flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-apple-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-apple-bg pb-20">
      <Header />
      
      <main className="pt-24 max-w-4xl mx-auto px-6">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 text-apple-text-muted hover:text-apple-text transition-colors mb-8 group"
        >
          <div className="w-8 h-8 rounded-full bg-apple-card-bg shadow-apple-soft flex items-center justify-center group-hover:bg-apple-gray transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold">Back to Settings</span>
        </button>

        {/* Header Section */}
        <div className="mb-12">
          {error && (
            <div className="mb-6 p-4 bg-apple-red/10 border border-apple-red/20 rounded-2xl flex items-center gap-3 text-apple-red">
              <AlertCircle className="w-5 h-5" />
              <div className="flex-1">
                <p className="text-sm font-bold">Failed to load verification status</p>
                <p className="text-xs opacity-80">{error}</p>
              </div>
              <button 
                onClick={fetchStatus}
                className="px-4 py-2 bg-apple-red text-white rounded-xl text-xs font-bold"
              >
                Retry
              </button>
            </div>
          )}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-apple-blue/10 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-apple-blue" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Verification Center</h1>
          </div>
          <p className="text-apple-text-muted text-lg max-w-2xl">
            Verify your identity and business to build trust with buyers and unlock premium features on Pakizzle.
          </p>
        </div>

        {/* Current Badge Status */}
        <div className="bg-apple-card-bg rounded-[32px] p-8 md:p-10 shadow-apple-card border border-apple-border/50 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-apple-blue/5 to-transparent pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div>
              <div className="text-xs font-black text-apple-text-muted uppercase tracking-widest mb-2">Current Status</div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">
                  {status?.badge === 'none' ? 'Unverified Account' : 
                   status?.badge === 'basic' ? 'Verified Account' :
                   status?.badge === 'identity' ? 'Verified Seller' : 'Verified Business'}
                </h2>
                <Badge type={status?.badge || 'none'} size="lg" />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveVerification('email')}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all active:scale-95", 
                  status?.emailVerified ? "bg-apple-green/10 text-apple-green cursor-default" : "bg-apple-blue/10 text-apple-blue hover:bg-apple-blue/20"
                )}
              >
                <Mail className="w-3.5 h-3.5" /> {status?.emailVerified ? 'Email Verified' : 'Verify Email'}
              </button>
              <button 
                onClick={() => setActiveVerification('phone')}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all active:scale-95", 
                  status?.phoneVerified ? "bg-apple-green/10 text-apple-green cursor-default" : "bg-apple-blue/10 text-apple-blue hover:bg-apple-blue/20"
                )}
              >
                <Phone className="w-3.5 h-3.5" /> {status?.phoneVerified ? 'Phone Verified' : 'Verify Phone'}
              </button>
            </div>
          </div>
        </div>

        {/* Verification Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identity Verification */}
          <VerificationCard 
            title="Identity Verification"
            description="Verify your personal identity using CNIC, Passport or Driving License."
            icon={Camera}
            status={status?.identityStatus || 'none'}
            onClick={() => navigate('/verification/identity')}
            type="identity"
          />

          {/* Business Verification */}
          <VerificationCard 
            title="Business Verification"
            description="Verify your business with trade license and registration documents."
            icon={Briefcase}
            status={status?.businessStatus || 'none'}
            onClick={() => navigate('/verification/business')}
            type="business"
          />
        </div>

        {/* Security Note */}
        <div className="mt-12 p-6 bg-apple-gray/50 rounded-2xl border border-apple-border/50 flex items-start gap-4">
          <Lock className="w-5 h-5 text-apple-text-muted shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm mb-1">Your data is secure</h4>
            <p className="text-xs text-apple-text-muted leading-relaxed">
              Pakizzle uses industry-standard encryption to protect your sensitive documents. 
              Documents are only used for verification purposes and are never shared with third parties.
            </p>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {activeVerification && (
          <ContactVerification 
            type={activeVerification}
            onClose={() => setActiveVerification(null)}
            onSuccess={() => {
              setActiveVerification(null);
              fetchStatus();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function VerificationCard({ title, description, icon: Icon, status, onClick, type }: any) {
  const statusConfig = {
    none: { label: 'Not Started', color: 'text-apple-text-muted', bg: 'bg-apple-gray', icon: ChevronRight },
    pending: { label: 'Pending Review', color: 'text-orange-500', bg: 'bg-orange-500/10', icon: Clock },
    approved: { label: 'Approved', color: 'text-apple-green', bg: 'bg-apple-green/10', icon: CheckCircle2 },
    rejected: { label: 'Rejected', color: 'text-apple-red', bg: 'bg-apple-red/10', icon: AlertCircle },
  }[status as 'none' | 'pending' | 'approved' | 'rejected'];

  return (
    <button 
      onClick={status === 'none' || status === 'rejected' ? onClick : undefined}
      className={cn(
        "bg-apple-card-bg rounded-[32px] p-8 text-left border border-apple-border/50 shadow-apple-soft transition-all duration-500 group relative overflow-hidden",
        (status === 'none' || status === 'rejected') ? "hover:shadow-apple-hover hover:border-apple-blue/30" : "cursor-default"
      )}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="w-14 h-14 bg-apple-gray rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <Icon className="w-7 h-7 text-apple-text" />
        </div>
        <div className={cn("px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5", statusConfig.bg, statusConfig.color)}>
          <statusConfig.icon className="w-3 h-3" />
          {statusConfig.label}
        </div>
      </div>
      
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-sm text-apple-text-muted leading-relaxed mb-6">
        {description}
      </p>

      {(status === 'none' || status === 'rejected') && (
        <div className="flex items-center gap-2 text-apple-blue font-bold text-sm group-hover:gap-3 transition-all">
          {status === 'rejected' ? 'Try Again' : 'Start Verification'}
          <ChevronRight className="w-4 h-4" />
        </div>
      )}
    </button>
  );
}
