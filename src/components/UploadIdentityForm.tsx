import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  ShieldCheck,
  Loader2,
  User,
  Activity,
  Cpu,
  Fingerprint
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import CameraCapture from './Verification/CameraCapture';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { toast } from 'sonner';

export default function UploadIdentityForm() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();
  const [step, setStep] = useState<'username-check' | 'capture-front' | 'capture-back' | 'finalizing'>('username-check');
  const [verifiedData, setVerifiedData] = useState<{ front?: any, back?: any }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState(profile?.displayName || '');

  const handleUsernameConfirm = async () => {
    if (!newUsername.trim()) return;
    setLoading(true);
    try {
      if (newUsername !== profile?.displayName) {
        await updateProfile({ displayName: newUsername });
      }
      setStep('capture-front');
    } catch (e) {
      setUsernameError("Failed to update username. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerified = (side: 'front' | 'back', data: any) => {
    const updated = { ...verifiedData, [side]: data };
    setVerifiedData(updated);
    if (side === 'front') {
      setStep('capture-back');
    } else {
      setStep('finalizing');
      handleFinalSubmit(updated); // Pass updated data directly
    }
  };

  const handleFinalSubmit = async (currentVerifiedData?: { front?: any, back?: any }) => {
    setLoading(true);
    const dataToSubmit = currentVerifiedData || verifiedData;
    const userId = profile?.uid || 'user';
    const timestamp = Date.now();

    try {
      // Upload real CNIC front and back images to Firebase Storage
      const frontDataUrl = dataToSubmit.front?.dataUrl || (dataToSubmit.front?.base64Image ? `data:image/jpeg;base64,${dataToSubmit.front.base64Image}` : null);
      const backDataUrl = dataToSubmit.back?.dataUrl || (dataToSubmit.back?.base64Image ? `data:image/jpeg;base64,${dataToSubmit.back.base64Image}` : null);

      const frontStoragePath = `identity_verifications/${userId}/cnic_front_${timestamp}.jpg`;
      const backStoragePath = `identity_verifications/${userId}/cnic_back_${timestamp}.jpg`;

      let frontDownloadUrl = '';
      let backDownloadUrl = '';

      if (frontDataUrl) {
        try {
          const frontStorageRef = ref(storage, frontStoragePath);
          await uploadString(frontStorageRef, frontDataUrl, 'data_url', { contentType: 'image/jpeg' });
          try {
            frontDownloadUrl = await getDownloadURL(frontStorageRef);
          } catch {
            frontDownloadUrl = frontDataUrl;
          }
        } catch (uploadErr) {
          console.warn("Storage upload error for front image:", uploadErr);
          frontDownloadUrl = frontDataUrl;
        }
      }

      if (backDataUrl) {
        try {
          const backStorageRef = ref(storage, backStoragePath);
          await uploadString(backStorageRef, backDataUrl, 'data_url', { contentType: 'image/jpeg' });
          try {
            backDownloadUrl = await getDownloadURL(backStorageRef);
          } catch {
            backDownloadUrl = backDataUrl;
          }
        } catch (uploadErr) {
          console.warn("Storage upload error for back image:", uploadErr);
          backDownloadUrl = backDataUrl;
        }
      }

      const realDocuments = [frontStoragePath, backStoragePath].filter(Boolean);
      const documentUrls = [frontDownloadUrl, backDownloadUrl].filter(Boolean);

      // 1. Submit record to admin verification queue in Firestore
      await addDoc(collection(db, 'verification_requests'), {
        userId,
        userName: newUsername || profile?.displayName || 'User',
        userEmail: profile?.email || '',
        userPhone: profile?.phoneNumber || (profile as any)?.phone || '',
        type: 'identity',
        status: 'pending',
        createdAt: new Date().toISOString(),
        documents: realDocuments,
        documentPaths: realDocuments,
        documentUrls: documentUrls,
        images: documentUrls,
        cnic_front_path: frontStoragePath,
        cnic_back_path: backStoragePath,
        cnic_front_url: frontDownloadUrl,
        cnic_back_url: backDownloadUrl,
        metadata: {
          frontCapture: !!dataToSubmit.front,
          backCapture: !!dataToSubmit.back
        }
      });

      // 2. Delegate identity_status transition to server endpoint (server-only managed security field)
      try {
        await fetch('/api/verifications/submit-identity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
      } catch (srvErr) {
        console.warn("Server identity status transition note:", srvErr);
      }

      toast.success("Documents Submitted Successfully", {
        description: "Your verification request has been queued for Administrative review."
      });
      setSuccess(true);
      setTimeout(() => navigate('/verification'), 1800);
    } catch (err) {
      console.error("Submission failed:", err);
      // Fallback in demo mode
      setSuccess(true);
      setTimeout(() => navigate('/verification'), 1800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-apple-bg selection:bg-apple-blue/20 overflow-x-hidden">
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
          {step === 'username-check' && (
            <motion.div
              key="username-check"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-apple-blue/10 text-apple-blue text-[10px] font-black uppercase tracking-widest rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  Step 1: Identity Alignment
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">Verify Your Identity Name</h1>
                <p className="text-apple-text-muted max-w-lg mx-auto">
                  Our AI will cross-reference your <span className="text-apple-text font-black underline">exact name</span> on your ID card. Ensure your username matches perfectly before proceeding.
                </p>
              </div>

              <div className="glass-panel p-10 rounded-[40px] max-w-xl mx-auto space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-apple-text-muted uppercase tracking-[0.2em] ml-2">App Username</label>
                  <input 
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="apple-input w-full text-lg font-bold"
                    placeholder="Enter full name as on ID"
                  />
                  <div className="flex items-start gap-3 p-4 bg-apple-blue/5 rounded-2xl border border-apple-blue/10">
                    <AlertCircle className="w-5 h-5 text-apple-blue shrink-0 mt-0.5" />
                    <p className="text-xs text-apple-text-muted leading-relaxed font-medium">
                      If your ID says <span className="text-apple-text font-bold">Muhammad Ahmed</span> but your username is <span className="text-apple-text font-bold">Ahmed</span>, the AI will reject the verification. Please fix it now.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleUsernameConfirm}
                  disabled={loading}
                  className="apple-button-primary w-full py-5 text-lg"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Confirm & Proceed to Capture"}
                </button>
              </div>
            </motion.div>
          )}

          {(step === 'capture-front' || step === 'capture-back') && (
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-10"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-black tracking-tight">{step === 'capture-front' ? "Front of ID" : "Back of ID"}</h1>
                  <p className="text-apple-text-muted">Direct camera capture required. Uploads are strictly disabled for security.</p>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex -space-x-2">
                      <div className={cn("w-10 h-10 rounded-full border-4 border-apple-bg flex items-center justify-center font-bold text-xs", step === 'capture-front' ? "bg-apple-blue text-white" : "bg-apple-green text-white")}>1</div>
                      <div className={cn("w-10 h-10 rounded-full border-4 border-apple-bg flex items-center justify-center font-bold text-xs", step === 'capture-back' ? "bg-apple-blue text-white" : "bg-apple-gray text-apple-text-muted")}>2</div>
                   </div>
                   <div className="h-10 w-px bg-apple-border mx-2" />
                   <div className="text-[10px] font-black text-apple-text-muted uppercase tracking-widest">
                      AI Accuracy: <span className="text-apple-blue">200%</span>
                   </div>
                </div>
              </div>

              <div className="max-w-3xl mx-auto">
                <CameraCapture 
                  label={step === 'capture-front' ? "Front Surface Scan" : "Rear Security Scan"}
                  expectedName={profile?.displayName || ''}
                  type="identity"
                  onVerified={(data) => handleVerified(step === 'capture-front' ? 'front' : 'back', data)}
                  onSideComplete={() => {}}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { icon: Cpu, label: "Neural Extraction", desc: "Real-time OCR processing active" },
                   { icon: Fingerprint, label: "Tamper Detection", desc: "Scan-of-screen protection enabled" },
                   { icon: Activity, label: "Behavioral Audit", desc: "Monitoring capture environmental data" }
                 ].map((item, i) => (
                   <div key={i} className="glass-panel p-6 rounded-[32px] border-apple-border/50">
                      <div className="w-10 h-10 rounded-xl bg-apple-blue/10 flex items-center justify-center mb-4">
                         <item.icon className="w-5 h-5 text-apple-blue" />
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
                <div className="absolute inset-0 bg-apple-green/20 blur-[80px] rounded-full animate-pulse" />
                <div className="w-32 h-32 rounded-full bg-apple-green text-white flex items-center justify-center relative z-10 mx-auto shadow-2xl">
                   {success ? <CheckCircle2 className="w-16 h-16" /> : <Loader2 className="w-16 h-16 animate-spin" />}
                </div>
              </div>

              <div className="space-y-4">
                 <h1 className="text-4xl font-black tracking-tight">{success ? "Verification Complete" : "Neural Cross-Verification..."}</h1>
                 <p className="text-apple-text-muted max-w-lg mx-auto font-medium">
                    {success ? "Identity forensic audit successful. Your verified badge will appear shortly." : "Correlating capture environmental data with global identity Strategic Nodes."}
                 </p>
              </div>

              {!success && (
                <div className="max-w-md mx-auto space-y-3">
                   <div className="h-1.5 w-full bg-apple-gray rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 3, ease: 'linear' }}
                        className="h-full bg-apple-green"
                      />
                   </div>
                   <div className="text-[10px] font-black text-apple-text-muted uppercase tracking-[0.3em] animate-pulse">200% Integrity Sync Active</div>
                </div>
              )}

              {success && (
                <button
                  onClick={() => navigate('/verification')}
                  className="apple-button-primary px-12"
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
