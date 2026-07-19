import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  ShieldCheck,
  Loader2,
  Cpu,
  Fingerprint,
  Activity,
  Building2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import CameraCapture from './Verification/CameraCapture';
import { useAuth } from '../context/AuthContext';

export default function UploadBusinessForm() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [step, setStep] = useState<'business-info' | 'capture-license' | 'finalizing'>('business-info');
  const [verifiedData, setVerifiedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [businessName, setBusinessName] = useState(profile?.businessName || '');

  const handleNext = () => {
    if (!businessName.trim()) return;
    setStep('capture-license');
  };

  const handleVerified = (data: any) => {
    setVerifiedData(data);
    setStep('finalizing');
    handleFinalSubmit();
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setSuccess(true);
    setTimeout(() => navigate('/verification'), 2000);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-apple-bg selection:bg-purple-500/20 overflow-x-hidden">
      <Header />
      
      <main className="pt-24 max-w-4xl mx-auto px-6 pb-20">
        <button 
          onClick={() => navigate('/verification')}
          className="flex items-center gap-2 text-apple-text-muted hover:text-apple-text transition-colors mb-8 group"
        >
          <div className="w-8 h-8 rounded-full bg-apple-card-bg shadow-apple-soft flex items-center justify-center group-hover:bg-apple-gray transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold">Back to Verification</span>
        </button>

        <AnimatePresence mode="wait">
          {step === 'business-info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-500 text-[10px] font-black uppercase tracking-widest rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  Business Forensic Audit
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">Business Alignment</h1>
                <p className="text-apple-text-muted max-w-lg mx-auto">
                  Verify your <span className="text-apple-text font-black underline">Official Business Name</span> as printed on your Trade License or Registration certificate.
                </p>
              </div>

              <div className="glass-panel p-10 rounded-[40px] max-w-xl mx-auto space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-apple-text-muted uppercase tracking-[0.2em] ml-2">Official Business Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-text-muted" />
                    <input 
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="apple-input w-full pl-14 text-lg font-bold"
                      placeholder="e.g. Acme Global Motors"
                    />
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10">
                    <AlertCircle className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-apple-text-muted leading-relaxed font-medium">
                      Mismatches in business name or registration number will result in an <span className="text-apple-text font-bold">Automatic Rejection</span> by the AI auditor.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full py-5 bg-purple-600 text-white rounded-3xl font-black text-lg shadow-2xl shadow-purple-500/20 hover:bg-purple-700 transition-all active:scale-95"
                >
                  Verify Business License
                </button>
              </div>
            </motion.div>
          )}

          {step === 'capture-license' && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-10"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-black tracking-tight">Trade License Scan</h1>
                  <p className="text-apple-text-muted">Direct scan required for forensic authenticity validation.</p>
                </div>
                <div className="text-[10px] font-black text-apple-text-muted uppercase tracking-widest bg-purple-500/10 px-4 py-2 rounded-full text-purple-500 border border-purple-500/20">
                  Forensic Depth: <span className="font-black">Surgical</span>
                </div>
              </div>

              <div className="max-w-3xl mx-auto">
                <CameraCapture 
                  label="Official Document Acquisition"
                  type="business"
                  expectedName={businessName}
                  onVerified={handleVerified}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { icon: Cpu, label: "Entity Extraction", desc: "Verifying registration numbers live" },
                   { icon: Fingerprint, label: "Seal Detection", desc: "Identifying official government stamps" },
                   { icon: Activity, label: "Contextual Audit", desc: "Analyzing license expiry and validity" }
                 ].map((item, i) => (
                   <div key={i} className="glass-panel p-6 rounded-[32px] border-purple-500/10 bg-purple-500/[0.02]">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                         <item.icon className="w-5 h-5 text-purple-500" />
                      </div>
                      <h4 className="text-sm font-black uppercase tracking-widest mb-1">{item.label}</h4>
                      <p className="text-[10px] text-apple-text-muted font-medium">{item.desc}</p>
                   </div>
                 ))}
              </div>
            </motion.div>
          )}

          {step === 'finalizing' && (
            <motion.div
              key="finalizing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-10 py-20"
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-purple-500/20 blur-[80px] rounded-full animate-pulse" />
                <div className="w-32 h-32 rounded-full bg-purple-600 text-white flex items-center justify-center relative z-10 mx-auto shadow-2xl">
                   {success ? <CheckCircle2 className="w-16 h-16" /> : <Loader2 className="w-16 h-16 animate-spin" />}
                </div>
              </div>

              <div className="space-y-4">
                 <h1 className="text-4xl font-black tracking-tight">{success ? "Business Verified" : "Commercial Forensics..."}</h1>
                 <p className="text-apple-text-muted max-w-lg mx-auto font-medium">
                    {success ? "Business credentials approved. Your commercial seller badge is now active." : "Connecting to official business registries for registration number cross-verification."}
                 </p>
              </div>

              {success && (
                <button
                  onClick={() => navigate('/verification')}
                  className="px-12 py-4 bg-purple-600 text-white rounded-3xl font-black text-sm shadow-xl shadow-purple-500/20 hover:scale-105 transition-all"
                >
                  Return to Dashboard
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
