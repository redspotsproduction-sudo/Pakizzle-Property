import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Car, 
  Shield, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Zap,
  Smartphone,
  Navigation,
  CreditCard,
  User,
  Phone,
  Loader2,
  FileText,
  Star,
  Compass
} from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { cn, formatPrice } from '../lib/utils';
import { db, auth, handleFirestoreError as handleFirebaseError, OperationType } from '../firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

type Step = 'vehicle' | 'coverage' | 'contact' | 'summary' | 'confirmation';

interface SelectedProvider {
  id: string;
  name: string;
  rate: string;
  trackerFee: string;
  logoUrl: string;
}

export default function InsuranceBookingFlow() {
  const navigate = useNavigate();
  const { type = 'car' } = useParams<{ type: string }>();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('vehicle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<SelectedProvider | null>(null);
  
  const [formData, setFormData] = useState({
    vehicleMake: searchParams.get('make') || '',
    vehicleModel: searchParams.get('model') || '',
    vehicleVariant: searchParams.get('variant') || '',
    vehicleYear: searchParams.get('year') || '',
    vehicleValue: searchParams.get('value') || '',
    insuranceType: type === 'car' ? 'comprehensive' : type,
    coveragePeriod: '1_year',
    address: profile?.addresses?.[0]?.address || '',
    city: searchParams.get('city') || profile?.addresses?.[0]?.city || '',
    phone: profile?.phone || profile?.phoneNumber || '',
    email: user?.email || ''
  });

  // Fetch provider info if ID is present
  useEffect(() => {
    const providerId = searchParams.get('provider');
    if (providerId) {
      getDoc(doc(db, 'insurance_companies', providerId)).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSelectedProvider({
            id: docSnap.id,
            name: data.name,
            rate: data.rate,
            trackerFee: data.trackerFee,
            logoUrl: data.logoUrl
          });
        }
      });
    }
  }, [searchParams]);

  const steps: { id: Step; label: string; icon: any }[] = [
    { id: 'vehicle', label: 'Vehicle Details', icon: Car },
    { id: 'coverage', label: 'Coverage Options', icon: Shield },
    { id: 'contact', label: 'Contact Info', icon: Smartphone },
    { id: 'summary', label: 'Policy Review', icon: CreditCard },
  ];

  // Defensive Hotspots coordinates matched on the red vehicle side profile
  const sidebarHotspots = [
    { id: 'collision', name: 'Collision Shield', x: '15%', y: '55%', activeOn: ['vehicle', 'summary', 'confirmation'] },
    { id: 'force_majeure', name: 'Act of God Shield', x: '48%', y: '15%', activeOn: ['coverage', 'summary', 'confirmation'] },
    { id: 'theft', name: 'Satellite GPS Tracker', x: '50%', y: '48%', activeOn: ['contact', 'summary', 'confirmation'] },
  ];

  const parseRate = (rateStr: string) => {
    const match = rateStr.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[0]) : 1.5;
  };

  const parseTrackerFee = (feeStr: string) => {
    if (!feeStr) return 0;
    if (feeStr.toLowerCase().includes('free')) return 0;
    const match = feeStr.replace(/,/g, '').match(/(\d+)/);
    return match ? parseInt(match[0]) : 0;
  };

  const calculateTotalPremium = () => {
    const value = Number(formData.vehicleValue);
    if (!value) return { yearlyPremium: 0, trackerFee: 0, total: 0 };

    let rate = 2.5; // Default rate
    let trackerFee = 0;

    if (selectedProvider) {
      rate = parseRate(selectedProvider.rate);
      trackerFee = parseTrackerFee(selectedProvider.trackerFee);
    } else {
      rate = formData.insuranceType === 'comprehensive' ? 2.5 : 1.0;
    }

    const yearlyPremium = (value * (rate / 100));
    const total = yearlyPremium + trackerFee;

    return { yearlyPremium, trackerFee, total };
  };

  const totals = calculateTotalPremium();

  const handleNext = async () => {
    if (currentStep === 'vehicle') {
      if (!formData.vehicleMake || !formData.vehicleModel || !formData.vehicleYear || !formData.vehicleValue) {
        toast.error('Please provide all vehicle details');
        return;
      }
      setCurrentStep('coverage');
    }
    else if (currentStep === 'coverage') {
      setCurrentStep('contact');
    }
    else if (currentStep === 'contact') {
      if (!formData.address || !formData.city || !formData.phone) {
        toast.error('Please fill in your contact information');
        return;
      }
      setCurrentStep('summary');
    }
    else if (currentStep === 'summary') {
      if (!user) {
        toast.error('Session expired. Please sign in again.');
        return;
      }

      setIsSubmitting(true);
      try {
        const requestId = `INS-${Date.now()}`;
        const deploymentId = `PKZ-SECURE-${Math.floor(Date.now()/1000)}`;
        
        const requestData = {
          id: requestId,
          deploymentId,
          userId: user.uid,
          ...formData,
          vehicleYear: String(formData.vehicleYear),
          vehicleValue: Number(formData.vehicleValue),
          providerId: selectedProvider?.id || null,
          providerName: selectedProvider?.name || 'Custom Quote',
          basePremium: totals.yearlyPremium,
          trackerFee: totals.trackerFee,
          quoteAmount: totals.total,
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await setDoc(doc(db, 'insurance_requests', requestId), requestData);
        setCurrentStep('confirmation');
      } catch (error: any) {
        console.error('Error saving insurance request:', error);
        if (error?.code === 'permission-denied') {
          handleFirebaseError(error, OperationType.CREATE, `insurance_requests`);
        }
        toast.error('Failed to submit request: ' + (error.message || 'Unknown error'));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 'coverage') setCurrentStep('vehicle');
    else if (currentStep === 'contact') setCurrentStep('coverage');
    else if (currentStep === 'summary') setCurrentStep('contact');
    else if (currentStep === 'confirmation') navigate('/insurance');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[var(--text-primary)] dark:bg-[var(--bg-page)] flex flex-col md:flex-row overflow-hidden text-[var(--text-primary)] dark:text-[var(--text-primary)] antialiased">
      
      {/* Sidebar - Desktop Only with Luxury Blue Grid & Live Hotspot HUD */}
      <div className="hidden md:flex w-[400px] bg-white dark:bg-[var(--bg-surface)] border-r border-black/[0.05] dark:border-white/[0.05] flex-col p-8 relative overflow-hidden select-none shrink-0">
        
        {/* Subtle background blue grid matching the insurance theme */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.4] dark:opacity-[0.2]" style={{
          backgroundImage: `linear-gradient(to right, rgba(0, 102, 204, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 102, 204, 0.08) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }} />

        {/* Brand header */}
        <div className="flex items-center gap-3 mb-10 relative z-10">
          <div className="w-9 h-9 bg-apple-blue rounded-xl flex items-center justify-center shadow-lg shadow-apple-blue/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight block leading-none text-[var(--text-primary)] dark:text-white">PAKIZZLE</span>
            <span className="text-[9px] font-bold text-apple-blue uppercase tracking-widest block mt-0.5">Secure™ Terminal</span>
          </div>
        </div>

        {/* Live Step HUD Display */}
        <div className="mb-8 relative z-10 bg-[var(--bg-surface)] dark:bg-[var(--bg-raised)] rounded-2xl p-4 border border-black/[0.03] dark:border-white/[0.03]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-wider">Dynamic Vehicle HUD</span>
            <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-apple-blue/10 text-apple-blue border border-apple-blue/20 animate-pulse uppercase">
              {currentStep === 'confirmation' ? 'Policy Approved' : 'Active Telemetry'}
            </span>
          </div>
          
          {/* Miniature side profile vehicle with responsive blips */}
          <div className="relative py-4 bg-[var(--bg-surface)] dark:bg-[var(--bg-surface)] rounded-xl overflow-hidden border border-apple-blue/10 flex justify-center items-center">
            
            {/* Grid pattern inner */}
            <div className="absolute inset-0 pointer-events-none opacity-50" style={{
              backgroundImage: `linear-gradient(to right, rgba(0, 102, 204, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 102, 204, 0.06) 1px, transparent 1px)`,
              backgroundSize: '16px 16px'
            }} />

            <div className="relative w-full max-w-[240px]">
              <img 
                src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1000" 
                alt="Luxury Car HUD" 
                className={cn(
                  "w-full h-auto object-contain transition-all duration-700 filter drop-shadow-md",
                  currentStep === 'confirmation' ? "brightness-105 saturate-110" : ""
                )}
                referrerPolicy="no-referrer"
              />

              {/* Hotspots corresponding to the active step */}
              {sidebarHotspots.map((hs) => {
                const isGlowing = hs.activeOn.includes(currentStep);
                return (
                  <div
                    key={hs.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
                    style={{ left: hs.x, top: hs.y }}
                  >
                    <span className={cn(
                      "absolute inset-0 rounded-full w-6 h-6 -left-3 -top-3 transition-all duration-1000 scale-100",
                      isGlowing 
                        ? "bg-apple-blue/30 border border-apple-blue/50 animate-ping" 
                        : "bg-transparent"
                    )} />
                    <div className={cn(
                      "w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all duration-500 shadow-[0_2px_10px_rgba(0,0,0,0.15)]",
                      isGlowing 
                        ? "bg-apple-blue border-white scale-125" 
                        : "bg-neutral-800 border-neutral-600 scale-90"
                    )}>
                      <div className={cn("w-1 h-1 rounded-full", isGlowing ? "bg-white" : "bg-neutral-400")} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[9px] font-bold text-[var(--text-secondary)] font-mono">
            <span>ACTIVE SECURITY LAYER:</span>
            <span className="text-apple-blue font-extrabold uppercase tracking-wide">
              {currentStep === 'vehicle' && 'ACCIDENTAL RISK CALIBRATION'}
              {currentStep === 'coverage' && 'ZERO-DEPRECIATION MATRIX'}
              {currentStep === 'contact' && 'GPS TERMINAL DISPATCH'}
              {currentStep === 'summary' && 'SIGNATURE SEAL ENCRYPTION'}
              {currentStep === 'confirmation' && 'DEPLOYMENT SUCCESSFUL'}
            </span>
          </div>
        </div>

        {/* Phase steps */}
        <div className="space-y-6 relative z-10">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex gap-4 relative">
              {idx < steps.length - 1 && (
                <div className={cn(
                  "absolute left-[15px] top-8 w-[1.5px] h-8 transition-all duration-700",
                  steps.findIndex(s => s.id === currentStep) > idx ? "bg-apple-blue" : "bg-black/[0.08] dark:bg-white/[0.08]"
                )} />
              )}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-700 z-10 shrink-0 text-xs",
                currentStep === step.id 
                  ? "border-apple-blue text-apple-blue bg-apple-blue/5 dark:bg-apple-blue/10 scale-110 font-bold" 
                  : steps.findIndex(s => s.id === currentStep) > idx 
                    ? "bg-apple-blue border-apple-blue text-white shadow-md shadow-apple-blue/10" 
                    : "border-black/[0.08] dark:border-white/[0.08] text-[var(--text-secondary)]"
              )}>
                {steps.findIndex(s => s.id === currentStep) > idx ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-4 h-4" />}
              </div>
              <div className={cn(
                "pt-0.5 transition-all duration-500",
                currentStep === step.id ? "opacity-100 translate-x-1" : "opacity-40"
              )}>
                <p className="text-[8px] font-black uppercase tracking-widest mb-0.5 text-apple-blue font-mono">Phase 0{idx + 1}</p>
                <h4 className="text-xs font-bold tracking-tight text-[var(--text-primary)] dark:text-white">{step.label}</h4>
              </div>
            </div>
          ))}
        </div>

        {/* Secure end-to-end policy notice */}
        <div className="mt-auto relative z-10">
          <div className="bg-[var(--bg-surface)] dark:bg-[var(--bg-raised)] border border-black/[0.04] dark:border-white/[0.04] p-5 rounded-2xl space-y-3.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-apple-green" />
              <p className="text-xs font-bold text-[var(--text-primary)] dark:text-white">Bank-Grade Policy Shield</p>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] font-medium leading-relaxed">
              Your sensitive data is protected by military-grade end-to-end encryption. Risk assessment factors and dynamic GPS node telemetry are kept confidential.
            </p>
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-y-auto custom-scrollbar bg-white dark:bg-black">
        
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/[0.05] dark:border-white/[0.05] px-6 h-16 flex items-center justify-between z-20">
          <button onClick={() => navigate('/insurance')} className="p-2">
            <X className="w-6 h-6" />
          </button>
          <div className="flex gap-1.5">
            {steps.map((step, idx) => (
              <div key={idx} className={cn(
                "h-1 rounded-full transition-all duration-500",
                currentStep === step.id ? "w-6 bg-apple-blue" : "w-1 bg-black/[0.1] dark:bg-white/[0.1]"
              )} />
            ))}
          </div>
          <div className="w-6 h-6" />
        </div>

        {/* Desktop Close Button */}
        <button 
           onClick={() => navigate('/insurance')}
           className="hidden md:flex absolute top-6 right-6 p-2 bg-[var(--text-primary)] dark:bg-[var(--bg-raised)] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white transition-all z-20 group"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
        </button>

        <div className="flex-1 max-w-[560px] mx-auto w-full px-6 py-12 md:py-16 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {currentStep === 'vehicle' && (
              <motion.div
                key="vehicle"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, y: -15 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-tight">Asset Identification</h2>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Define the vehicle you wish to secure. Precision in technical specifications ensures 100% accurate underwriter premium rates.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-2">Manufacturer / Brand</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Honda, Toyota, Suzuki" 
                      className="w-full px-4 py-3 bg-[var(--text-primary)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 focus:bg-white dark:focus:bg-black rounded-2xl text-xs font-semibold outline-none transition-all shadow-inner text-[var(--text-primary)] dark:text-white"
                      value={formData.vehicleMake}
                      onChange={(e) => setFormData({...formData, vehicleMake: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-2">Model</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Civic, Corolla" 
                        className="w-full px-4 py-3 bg-[var(--text-primary)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 focus:bg-white dark:focus:bg-black rounded-2xl text-xs font-semibold outline-none transition-all shadow-inner text-[var(--text-primary)] dark:text-white"
                        value={formData.vehicleModel}
                        onChange={(e) => setFormData({...formData, vehicleModel: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-2">Variant</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Oriel, Altis" 
                        className="w-full px-4 py-3 bg-[var(--text-primary)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 focus:bg-white dark:focus:bg-black rounded-2xl text-xs font-semibold outline-none transition-all shadow-inner text-[var(--text-primary)] dark:text-white"
                        value={formData.vehicleVariant}
                        onChange={(e) => setFormData({...formData, vehicleVariant: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-2">Manufacture Year</label>
                      <input 
                        type="number" 
                        placeholder="2024" 
                        className="w-full px-4 py-3 bg-[var(--text-primary)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 focus:bg-white dark:focus:bg-black rounded-2xl text-xs font-semibold outline-none transition-all shadow-inner text-[var(--text-primary)] dark:text-white"
                        value={formData.vehicleYear}
                        onChange={(e) => setFormData({...formData, vehicleYear: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-2">Car Value (PKR)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 3,500,000" 
                        className="w-full px-4 py-3 bg-[var(--text-primary)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 focus:bg-white dark:focus:bg-black rounded-2xl text-xs font-bold outline-none transition-all shadow-inner text-[var(--text-primary)] dark:text-white font-mono"
                        value={formData.vehicleValue}
                        onChange={(e) => setFormData({...formData, vehicleValue: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'coverage' && (
              <motion.div
                key="coverage"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, y: -15 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-tight">Risk Mitigation</h2>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Select your desired level of protection. Comprehensive policies include a free satellite tracking device unit and full accident damage recovery.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { 
                      id: 'comprehensive', 
                      label: 'Comprehensive Autoshield', 
                      desc: 'Full-spectrum protection covering accidental crash, spontaneous fire, vehicle theft, and weather-related disasters.',
                      tags: ['Total Loss', 'Fire & Theft', 'Act of God', 'Free Tracker Unit']
                    },
                    { 
                      id: 'third_party', 
                      label: 'Third-Party Compliant', 
                      desc: 'Essential legal compliance safeguarding you from massive lawsuits and properties damage liabilities.',
                      tags: ['Legal Standard', 'Third-Party Liability']
                    }
                  ].map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setFormData({...formData, insuranceType: plan.id})}
                      className={cn(
                        "w-full p-5 rounded-2xl border transition-all text-left relative overflow-hidden group active:scale-[0.99] flex flex-col gap-3",
                        formData.insuranceType === plan.id 
                          ? "border-apple-blue bg-apple-blue/5 dark:bg-apple-blue/10 shadow-sm ring-2 ring-apple-blue/10" 
                          : "border-black/[0.06] dark:border-white/[0.06] bg-transparent hover:border-apple-blue/30"
                      )}
                    >
                      <div className="flex justify-between items-start w-full">
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-[var(--text-primary)] dark:text-white">{plan.label}</h3>
                          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed pr-6">{plan.desc}</p>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 mt-0.5",
                          formData.insuranceType === plan.id ? "bg-apple-blue border-apple-blue text-white" : "border-black/[0.1] dark:border-white/[0.1]"
                        )}>
                          {formData.insuranceType === plan.id && <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5px] text-white" />}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {plan.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-black/[0.03] dark:bg-white/[0.04] rounded-md text-[8px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 'contact' && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, y: -15 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-tight">Human Coordinates</h2>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Provide precise communication credentials for tracker installation and policy dispatch.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-2">Residency Address</label>
                    <input 
                      type="text" 
                      placeholder="e.g. House #10, Street 2, Sector DHA" 
                      className="w-full px-4 py-3 bg-[var(--text-primary)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 focus:bg-white dark:focus:bg-black rounded-2xl text-xs font-semibold outline-none transition-all shadow-inner text-[var(--text-primary)] dark:text-white"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-2">City</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Lahore, Karachi, Islamabad" 
                        className="w-full px-4 py-3 bg-[var(--text-primary)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 focus:bg-white dark:focus:bg-black rounded-2xl text-xs font-bold outline-none transition-all shadow-inner text-[var(--text-primary)] dark:text-white"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-2">Target Phone</label>
                      <input 
                        type="tel" 
                        placeholder="+92 300 1234567" 
                        className="w-full px-4 py-3 bg-[var(--text-primary)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 focus:bg-white dark:focus:bg-black rounded-2xl text-xs font-bold outline-none transition-all shadow-inner text-[var(--text-primary)] dark:text-white font-mono"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, y: -15 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-tight">Policy Manifest</h2>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Verify coverage parameters prior to deployment of active risk coverage.
                  </p>
                </div>

                <div className="bg-[var(--text-primary)] dark:bg-[var(--bg-surface)] p-6 rounded-3xl space-y-6 border border-black/[0.04] dark:border-white/[0.04] shadow-sm relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-48 h-48 bg-apple-blue/5 blur-[80px] rounded-full pointer-events-none" />
                     
                     {selectedProvider && (
                        <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/5 pb-4">
                           <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-white rounded-xl p-1.5 shadow-sm border border-black/[0.05] flex items-center justify-center">
                                 {selectedProvider.logoUrl ? (
                                   <img src={selectedProvider.logoUrl} alt={selectedProvider.name} className="w-full h-full object-contain" />
                                 ) : (
                                   <span className="font-bold text-xs text-apple-text-muted">{selectedProvider.name?.[0] || 'I'}</span>
                                 )}
                              </div>
                              <div>
                                 <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-wider">Underwriter Node</p>
                                 <p className="text-sm font-bold text-[var(--text-primary)] dark:text-white leading-tight">{selectedProvider.name}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-wider">Plan Layer</p>
                              <p className="text-sm font-bold text-apple-blue capitalize">{formData.insuranceType.replace('_', ' ')}</p>
                           </div>
                        </div>
                     )}

                     <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                        <div>
                            <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-wider mb-0.5">Asset Spec</p>
                            <p className="text-sm font-bold text-[var(--text-primary)] dark:text-white leading-tight">{formData.vehicleYear} {formData.vehicleMake} {formData.vehicleModel}</p>
                            <span className="text-[10px] text-[var(--text-secondary)]">{formData.vehicleVariant || 'Standard Trim'}</span>
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-wider mb-0.5">Car Value Weight</p>
                            <p className="text-sm font-black text-[var(--text-primary)] dark:text-white font-mono">{formatPrice(Number(formData.vehicleValue))}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-wider mb-0.5">Physical Node Destination</p>
                            <p className="text-xs font-semibold text-[var(--text-primary)] dark:text-white/85 leading-relaxed">{formData.address}, {formData.city}</p>
                        </div>
                     </div>

                     <div className="h-[1px] bg-black/[0.05] dark:bg-white/5" />

                     <div className="space-y-2.5 text-xs text-[var(--text-secondary)]">
                        <div className="flex justify-between items-center font-medium">
                           <span>Annual Comprehensive Premium</span>
                           <span className="font-bold text-[var(--text-primary)] dark:text-white font-mono">{formatPrice(totals.yearlyPremium)}</span>
                        </div>
                        <div className="flex justify-between items-center font-medium">
                           <span>GPS Telemetry Tracker Hardware</span>
                           <span className="font-bold text-apple-green">{totals.trackerFee > 0 ? formatPrice(totals.trackerFee) : 'Complimentary'}</span>
                        </div>
                     </div>

                     <div className="h-[1px] bg-black/[0.05] dark:bg-white/5" />

                     <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-wider">Total Policy Amount (PKR)</p>
                            <p className="text-3xl font-black text-apple-blue tracking-tight leading-none font-mono">{formatPrice(totals.total)}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-[9px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider block">Billed Annually</span>
                            <span className="text-[8px] text-apple-green block mt-0.5 font-bold">Installment options available</span>
                        </div>
                     </div>
                </div>

                <p className="text-[9px] text-center text-[var(--text-secondary)] font-medium leading-relaxed px-6">
                  By executing this form, you authorize Pakizzle underwriter nodes to initiate verification loops and agree to our standard <span className="underline cursor-pointer hover:text-apple-blue">Terms of Service</span>.
                </p>
              </motion.div>
            )}

            {currentStep === 'confirmation' && (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-center space-y-8 py-10"
              >
                <div className="relative w-24 h-24 mx-auto">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-full h-full rounded-full bg-apple-blue flex items-center justify-center text-white shadow-xl shadow-apple-blue/20"
                    >
                        <ShieldCheck className="w-12 h-12 stroke-[1.5]" />
                    </motion.div>
                </div>

                <div className="space-y-3">
                    <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white">Request Dispatched</h2>
                    <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                       Your car insurance request is successfully logged. Pakizzle agents are locking with underwriters to issue your final coverage certificate.
                    </p>
                </div>

                <div className="bg-[var(--text-primary)] dark:bg-[var(--bg-surface)] border border-black/[0.04] dark:border-white/[0.04] p-5 rounded-2xl inline-block">
                    <div className="flex items-center gap-4 text-xs">
                        <div className="text-left">
                            <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-wider mb-0.5">Security Token ID</p>
                            <p className="text-sm font-black font-mono uppercase text-apple-blue">{`PKZ-SECURE-${Math.floor(Date.now()/1000)}`}</p>
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button 
                        onClick={() => navigate('/settings?section=insurance')}
                        className="px-8 py-3 bg-apple-blue hover:bg-blue-600 text-white text-xs font-semibold rounded-full transition-colors shadow-sm"
                    >
                        Open Insurance Dashboard
                    </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Action Bar Footer */}
        {currentStep !== 'confirmation' && (
          <div className="sticky bottom-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-black/[0.05] dark:border-white/[0.05] px-6 py-4 md:px-10 md:py-5 z-20 flex justify-between items-center">
             <button 
                onClick={handleBack}
                disabled={currentStep === 'vehicle'}
                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white disabled:opacity-0 transition-all active:scale-95"
             >
                <div className="w-7 h-7 rounded-full border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center">
                    <ChevronLeft className="w-3.5 h-3.5" />
                </div>
                Back
             </button>

             <button 
                onClick={handleNext}
                disabled={isSubmitting}
                className="bg-apple-blue hover:bg-blue-600 text-white flex items-center gap-2 px-8 h-12 rounded-full font-semibold text-xs disabled:opacity-50 transition-all active:scale-95 shadow-sm"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span className="font-bold uppercase tracking-wider text-[9px]">
                        {currentStep === 'summary' ? 'Authorize Coverage' : 'Continue Phase'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
             </button>
          </div>
        )}

      </div>
    </div>
  );
}
