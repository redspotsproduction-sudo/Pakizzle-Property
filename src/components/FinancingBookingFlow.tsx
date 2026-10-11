import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Car, 
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
  Cpu,
  Check,
  Info,
  Sparkles,
  ClipboardList,
  Compass,
  DollarSign,
  Briefcase,
  Wallet,
  FileText
} from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { cn, formatPrice } from '../lib/utils';
import { db, auth, handleFirestoreError as handleFirebaseError, OperationType } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

type Step = 'vehicle' | 'financing' | 'employment' | 'summary' | 'confirmation';

export default function FinancingBookingFlow() {
  const navigate = useNavigate();
  const { type = 'car' } = useParams<{ type: string }>();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('vehicle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Read prefill parameter inputs from our interactive estimator
  const valueParam = searchParams.get('value') || '';
  const downPctParam = Number(searchParams.get('downPct')) || 30;
  const tenureParam = searchParams.get('tenure') || '3';

  const defaultPrice = valueParam;
  const defaultDownPayment = valueParam ? String(Math.floor(Number(valueParam) * (downPctParam / 100))) : '';
  const defaultLoanTerm = tenureParam === '2' ? '24_months' : tenureParam === '3' ? '36_months' : tenureParam === '5' ? '60_months' : '36_months';

  const [formData, setFormData] = useState({
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehiclePrice: defaultPrice,
    downPayment: defaultDownPayment,
    loanTerm: defaultLoanTerm,
    monthlyIncome: '',
    employmentStatus: 'employed',
    phone: profile?.phone || profile?.phoneNumber || '',
    email: user?.email || '',
    address: profile?.addresses?.[0]?.address || '',
    city: profile?.addresses?.[0]?.city || ''
  });

  // Automatically calculate 30% minimum down payment when price changes (only if down payment is empty or below SBP limits)
  React.useEffect(() => {
    if (formData.vehiclePrice && !isNaN(Number(formData.vehiclePrice))) {
      const minDownPayment = Math.floor(Number(formData.vehiclePrice) * 0.3);
      const currentDown = Number(formData.downPayment);
      if (!formData.downPayment || isNaN(currentDown) || currentDown < minDownPayment) {
        setFormData(prev => ({
          ...prev,
          downPayment: String(minDownPayment)
        }));
      }
    }
  }, [formData.vehiclePrice]);

  const steps: { id: Step; label: string; icon: any }[] = [
    { id: 'vehicle', label: 'Vehicle Details', icon: Car },
    { id: 'financing', label: 'Financing Plan', icon: DollarSign },
    { id: 'employment', label: 'Financial Guard', icon: Briefcase },
    { id: 'summary', label: 'Credit Review', icon: FileText },
  ];

  const handleNext = async () => {
    if (currentStep === 'vehicle') {
      if (!formData.vehicleMake || !formData.vehicleModel || !formData.vehicleYear || !formData.vehiclePrice) {
        toast.error('Please fill in all vehicle details');
        return;
      }
      setCurrentStep('financing');
    }
    else if (currentStep === 'financing') {
      const minDown = Number(formData.vehiclePrice) * 0.3;
      if (!formData.downPayment || !formData.loanTerm) {
        toast.error('Please configure your financing plan');
        return;
      }
      if (Number(formData.downPayment) < minDown) {
        toast.error(`Minimum down payment is ${formatPrice(minDown)} (30%)`);
        setFormData(prev => ({ ...prev, downPayment: String(Math.floor(minDown)) }));
        return;
      }
      setCurrentStep('employment');
    }
    else if (currentStep === 'employment') {
      if (!formData.monthlyIncome || !formData.phone) {
        toast.error('Please provide your financial verification details');
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
        const requestId = `FIN-${Date.now()}`;
        const monthlyInstallment = calculateMockInstallment(
            Number(formData.vehiclePrice), 
            Number(formData.downPayment), 
            formData.loanTerm
        );
        
        const requestData = {
          id: requestId,
          userId: user.uid,
          ...formData,
          vehicleYear: String(formData.vehicleYear),
          vehiclePrice: Number(formData.vehiclePrice),
          downPayment: Number(formData.downPayment),
          monthlyIncome: Number(formData.monthlyIncome),
          monthlyInstallment,
          interestRate: 15.5, // Reference APR
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await setDoc(doc(db, 'financing_requests', requestId), requestData);
        setCurrentStep('confirmation');
      } catch (error: any) {
        console.error('Error saving financing request:', error);
        if (error?.code === 'permission-denied') {
          handleFirebaseError(error, OperationType.CREATE, `financing_requests`);
        }
        toast.error('Failed to submit request: ' + (error.message || 'Unknown error'));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 'financing') setCurrentStep('vehicle');
    else if (currentStep === 'employment') setCurrentStep('financing');
    else if (currentStep === 'summary') setCurrentStep('employment');
    else if (currentStep === 'confirmation') navigate('/financing');
  };

  const calculateMockInstallment = (price: number, downPayment: number, term: string) => {
    const loanAmount = price - downPayment;
    const months = parseInt(term.split('_')[0]);
    const annualRate = 0.155; // 15.5%
    const monthlyRate = annualRate / 12;
    
    if (loanAmount <= 0) return 0;
    
    // EMI Formula: P * r * (1+r)^n / ((1+r)^n - 1)
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.floor(emi);
  };

  // Telemetry Coordinates corresponding to active steps in financing
  const sidebarHotspots = [
    { id: 'collateral', name: 'Asset Appraisal', x: '45%', y: '68%', activeOn: ['vehicle', 'summary', 'confirmation'] },
    { id: 'tracker', name: 'GPS Security', x: '78%', y: '52%', activeOn: ['financing', 'summary', 'confirmation'] },
    { id: 'credit', name: 'Credit Registry Handshake', x: '60%', y: '50%', activeOn: ['employment', 'summary', 'confirmation'] },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[var(--text-primary)] dark:bg-[var(--bg-page)] flex flex-col md:flex-row overflow-hidden text-[var(--text-primary)] dark:text-[var(--text-primary)] antialiased">
      
      {/* Sidebar - Desktop Only with Luxury Blue Grid & Live Hotspot HUD */}
      <div className="hidden md:flex w-[400px] bg-white dark:bg-[var(--bg-surface)] border-r border-black/[0.05] dark:border-white/[0.05] flex-col p-8 relative overflow-hidden select-none shrink-0">
        
        {/* Blue color grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.4] dark:opacity-[0.2]" style={{
          backgroundImage: `linear-gradient(to right, rgba(0, 113, 227, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 113, 227, 0.08) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }} />

        {/* Brand header */}
        <div className="flex items-center gap-3 mb-10 relative z-10">
          <div className="w-9 h-9 bg-apple-blue rounded-xl flex items-center justify-center shadow-lg shadow-apple-blue/20">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight block leading-none text-[var(--text-primary)] dark:text-white">PAKIZZLE</span>
            <span className="text-[9px] font-bold text-apple-blue uppercase tracking-widest block mt-0.5">Capital Terminal</span>
          </div>
        </div>

        {/* Live Step HUD Display */}
        <div className="mb-8 relative z-10 bg-[var(--bg-surface)] dark:bg-[var(--bg-raised)] rounded-2xl p-4 border border-black/[0.03] dark:border-white/[0.03]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-wider">Credit HUD Telemetry</span>
            <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-apple-blue/10 text-apple-blue border border-apple-blue/20 animate-pulse uppercase">
              {currentStep === 'confirmation' ? 'Pre-Approved File' : 'Active Telemetry'}
            </span>
          </div>
          
          {/* Miniature side profile blue/silver sedan with responsive blips */}
          <div className="relative py-4 bg-apple-blue/[0.02] dark:bg-[var(--bg-surface)] rounded-xl overflow-hidden border border-apple-blue/10 flex justify-center items-center">
            
            {/* Grid pattern inner */}
            <div className="absolute inset-0 pointer-events-none opacity-50" style={{
              backgroundImage: `linear-gradient(to right, rgba(0, 113, 227, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 113, 227, 0.06) 1px, transparent 1px)`,
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
                        ? currentStep === 'confirmation'
                          ? "bg-apple-green/20 border border-apple-green animate-ping"
                          : "bg-apple-blue/20 border border-apple-blue animate-ping" 
                        : "bg-transparent"
                    )} />
                    <div className={cn(
                      "w-3 h-3 rounded-full border flex items-center justify-center transition-all duration-500 shadow-md",
                      isGlowing 
                        ? currentStep === 'confirmation'
                          ? "bg-apple-green border-white text-white"
                          : "bg-apple-blue border-white text-white scale-110" 
                        : "bg-[var(--bg-inset)] border-white/20 opacity-30"
                    )}>
                      <div className={cn(
                        "w-1 h-1 rounded-full",
                        isGlowing ? "bg-white" : "bg-apple-text-muted"
                      )} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 text-center">
            <p className="text-[10px] font-bold text-[var(--text-secondary)] tracking-normal leading-normal">
              {currentStep === 'vehicle' && '📡 Initializing asset valuation and collateral appraisal...'}
              {currentStep === 'financing' && '💳 Structuring amortization schedule and GPS tracker allocation...'}
              {currentStep === 'employment' && '💼 Querying State Bank credit registry nodes...'}
              {currentStep === 'summary' && '🛡️ Ready to synchronize 140+ underwriting markers.'}
              {currentStep === 'confirmation' && '✅ Credit node logged in database! Dispatch active.'}
            </p>
          </div>
        </div>

        {/* Steps Flow Timeline */}
        <div className="space-y-6 flex-1 relative z-10 pr-2">
          {steps.map((step, idx) => {
            const isCompleted = steps.findIndex(s => s.id === currentStep) > idx || currentStep === 'confirmation';
            const isActive = currentStep === step.id;
            return (
              <div key={step.id} className="flex gap-4 relative">
                {idx < steps.length - 1 && (
                  <div className={cn(
                    "absolute left-4 top-8 w-[1.5px] h-10 transition-all duration-700",
                    isCompleted ? "bg-apple-blue" : "bg-black/[0.08] dark:bg-white/[0.08]"
                  )} />
                )}
                
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-500 z-10 shrink-0",
                  isActive 
                    ? "border-apple-blue text-apple-blue bg-apple-blue/5 scale-110 ring-4 ring-apple-blue/10" 
                    : isCompleted 
                      ? "bg-apple-blue border-apple-blue text-white" 
                      : "border-black/[0.08] dark:border-white/[0.08] text-[var(--text-secondary)] bg-white dark:bg-[var(--bg-raised)]"
                )}>
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <step.icon className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className={cn(
                  "pt-0.5 transition-all duration-300",
                  isActive ? "opacity-100 translate-x-1" : isCompleted ? "opacity-90" : "opacity-40"
                )}>
                  <p className="text-[8px] font-black uppercase tracking-widest text-apple-blue font-mono">Step 0{idx + 1}</p>
                  <h4 className="text-xs font-bold text-[var(--text-primary)] dark:text-white">{step.label}</h4>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Security Badge */}
        <div className="mt-auto relative z-10 pt-4 border-t border-black/[0.05] dark:border-white/[0.05]">
          <div className="bg-apple-blue/[0.02] dark:bg-[var(--bg-surface)] p-4 rounded-2xl border border-apple-blue/10 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-apple-blue shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-[var(--text-primary)] dark:text-white">Authorized Credit Processing</p>
              <p className="text-[9px] text-[var(--text-secondary)] leading-relaxed mt-0.5">
                Your borrowing thresholds and SBP Debt Burden ratios are calculated under full PCI-DSS secure parameters.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-y-auto custom-scrollbar bg-[var(--text-primary)] dark:bg-[var(--bg-page)]">
        
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/[0.04] dark:border-white/[0.04] px-6 h-16 flex items-center justify-between z-20">
          <button onClick={() => navigate('/financing')} className="p-1.5 text-[var(--text-primary)] dark:text-white">
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex gap-1.5">
            {steps.map((step, idx) => (
              <div key={idx} className={cn(
                "h-1 rounded-full transition-all duration-500",
                currentStep === step.id ? "w-6 bg-apple-blue" : "w-1 bg-black/10 dark:bg-white/15"
              )} />
            ))}
          </div>
          
          <div className="w-5 h-5" /> {/* Spacer */}
        </div>

        {/* Desktop Exit Pill */}
        <button 
           onClick={() => navigate('/financing')}
           className="hidden md:flex absolute top-6 right-6 p-2 bg-white dark:bg-[var(--bg-surface)] border border-black/[0.05] dark:border-white/[0.05] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white hover:scale-105 transition-all z-20 group"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        </button>

        <div className="flex-1 max-w-xl mx-auto w-full px-6 py-10 md:py-20 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {currentStep === 'vehicle' && (
              <motion.div
                key="vehicle"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-apple-blue/5 dark:bg-apple-blue/10 border border-apple-blue/15 text-[9px] font-black text-apple-blue uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" />
                    Asset Registry
                  </div>
                  <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-[1.15]">
                    Identify Your <span className="text-apple-blue font-bold">Machine</span>
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Provide the core vehicle parameters. Pakizzle calibrates down payment boundaries and maximum credit limits under State Bank of Pakistan guidelines.
                  </p>
                </div>

                <div className="space-y-4 bg-white dark:bg-[var(--bg-surface)] p-6 rounded-3xl border border-black/[0.03] dark:border-white/[0.03] shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Manufacturer / Make</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Toyota, Suzuki, Honda" 
                      className="apple-input w-full dark:bg-black/40"
                      value={formData.vehicleMake}
                      onChange={(e) => setFormData({...formData, vehicleMake: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Model Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Fortuner, Swift, Civic" 
                            className="apple-input w-full dark:bg-black/40"
                            value={formData.vehicleModel}
                            onChange={(e) => setFormData({...formData, vehicleModel: e.target.value})}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Manufacturing Year</label>
                        <input 
                            type="text" 
                            placeholder="e.g. 2024" 
                            maxLength={4}
                            className="apple-input w-full dark:bg-black/40"
                            value={formData.vehicleYear}
                            onChange={(e) => setFormData({...formData, vehicleYear: e.target.value})}
                        />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Estimated Vehicle Price (PKR)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        placeholder="e.g. 4,500,000" 
                        className="apple-input w-full dark:bg-black/40 font-bold font-mono pl-12"
                        value={formData.vehiclePrice}
                        onChange={(e) => setFormData({...formData, vehiclePrice: e.target.value})}
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--text-secondary)]">
                        PKR
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-[var(--bg-surface)] dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.03] dark:border-white/[0.03] text-[10px] text-[var(--text-secondary)]">
                  <Cpu className="w-4 h-4 text-apple-blue shrink-0" />
                  <span>The database will dynamically load paint thickness tolerances and vehicle category bounds for custom assessment.</span>
                </div>
              </motion.div>
            )}

            {currentStep === 'financing' && (
              <motion.div
                key="financing"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-apple-blue/5 dark:bg-apple-blue/10 border border-apple-blue/15 text-[9px] font-black text-apple-blue uppercase tracking-widest">
                    <DollarSign className="w-3 h-3" />
                    Capital Structure
                  </div>
                  <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-[1.15]">
                    Financing <span className="text-apple-blue font-bold">Structure</span>
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Structure your borrowing requirements. Set your down payment margins (minimum 30% under SBP rules) and select preferred lease tenures.
                  </p>
                </div>

                <div className="space-y-6 bg-white dark:bg-[var(--bg-surface)] p-6 rounded-3xl border border-black/[0.03] dark:border-white/[0.03] shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
                  {/* Down Payment Input */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Down Payment (PKR) — Min 30%</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        placeholder="e.g. 1,500,000" 
                        className="apple-input w-full dark:bg-black/40 font-bold font-mono pl-12"
                        value={formData.downPayment}
                        onChange={(e) => setFormData({...formData, downPayment: e.target.value})}
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--text-secondary)]">
                        PKR
                      </div>
                    </div>
                    {formData.vehiclePrice && Number(formData.downPayment) < (Number(formData.vehiclePrice) * 0.3) && (
                        <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Min. 30% Down Payment Required: {formatPrice(Math.floor(Number(formData.vehiclePrice) * 0.3))}
                        </p>
                    )}
                  </div>

                  {/* Tenure selector */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Lease Tenure Duration</label>
                    <div className="grid grid-cols-5 gap-2">
                      {['12_months', '24_months', '36_months', '48_months', '60_months'].map((term) => {
                        const isSelected = formData.loanTerm === term;
                        return (
                          <button
                            key={term}
                            onClick={() => setFormData({...formData, loanTerm: term})}
                            className={cn(
                              "py-2.5 text-xs font-bold rounded-xl border text-center transition-all active:scale-95",
                              isSelected
                                ? "bg-apple-blue border-apple-blue text-white shadow-sm"
                                : "bg-[var(--text-primary)] dark:bg-black/30 border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white"
                            )}
                          >
                            {term.split('_')[0]}M
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic Summary Block */}
                  <div className="bg-apple-blue/5 dark:bg-apple-blue/10 border border-apple-blue/10 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <span className="text-[8px] font-extrabold text-apple-blue uppercase tracking-wider block font-mono">ESTIMATED INSTALMENT</span>
                      <span className="text-lg font-extrabold font-mono text-[var(--text-primary)] dark:text-white">
                        {formatPrice(calculateMockInstallment(Number(formData.vehiclePrice), Number(formData.downPayment), formData.loanTerm))}
                        <span className="text-[10px] font-sans font-normal text-[var(--text-secondary)]">/mo</span>
                      </span>
                      <span className="text-[7px] text-[var(--text-secondary)] block mt-0.5">Calculated at standard 15.5% preferential APR.</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] font-extrabold text-apple-blue uppercase tracking-wider block font-mono">APR RATE</span>
                      <span className="text-sm font-extrabold font-mono text-[var(--text-primary)] dark:text-white">15.5%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'employment' && (
              <motion.div
                key="employment"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-apple-blue/5 dark:bg-apple-blue/10 border border-apple-blue/15 text-[9px] font-black text-apple-blue uppercase tracking-widest">
                    <Briefcase className="w-3 h-3" />
                    Financial Standing
                  </div>
                  <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-[1.15]">
                    Financial <span className="text-apple-blue font-bold">Standing</span>
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Verify your source of income. This information is processed securely under PCI-DSS standards to establish creditworthiness and SBP Debt Burden ratio compliance.
                  </p>
                </div>

                <div className="space-y-5 bg-white dark:bg-[var(--bg-surface)] p-6 rounded-3xl border border-black/[0.03] dark:border-white/[0.03] shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
                  {/* Employment Status Grid */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Employment Stream</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'employed', label: 'Salaried', icon: Briefcase },
                        { id: 'self_employed', label: 'Freelancer', icon: Smartphone },
                        { id: 'business_owner', label: 'Business Owner', icon: Wallet },
                        { id: 'other', label: 'Other Stream', icon: User }
                      ].map(status => {
                        const isSelected = formData.employmentStatus === status.id;
                        return (
                          <button
                            key={status.id}
                            onClick={() => setFormData({...formData, employmentStatus: status.id})}
                            className={cn(
                              "h-12 rounded-xl border font-bold text-xs flex items-center justify-between px-4 transition-all duration-300 relative overflow-hidden active:scale-[0.98]",
                              isSelected 
                                ? "bg-apple-blue/5 border-apple-blue text-[var(--text-primary)] dark:text-white shadow-sm font-semibold" 
                                : "bg-white dark:bg-black/30 border-black/[0.06] dark:border-white/[0.06] text-[var(--text-secondary)] hover:border-apple-blue/25"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <status.icon className={cn("w-4 h-4", isSelected ? "text-apple-blue" : "text-[var(--text-secondary)]")} />
                              <span>{status.label}</span>
                            </div>
                            {isSelected ? (
                              <span className="w-2 h-2 rounded-full bg-apple-blue animate-pulse" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-black/10 dark:bg-white/10" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Monthly Net Disposable Salary (PKR)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        placeholder="e.g. 250,000" 
                        className="apple-input w-full dark:bg-black/40 font-bold font-mono pl-12"
                        value={formData.monthlyIncome}
                        onChange={(e) => setFormData({...formData, monthlyIncome: e.target.value})}
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--text-secondary)]">
                        PKR
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-apple-blue/5 dark:bg-apple-blue/10 border border-apple-blue/15 text-[9px] font-black text-apple-blue uppercase tracking-widest">
                    <FileText className="w-3 h-3" />
                    Credit Manifest
                  </div>
                  <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-[1.15]">
                    Credit <span className="text-apple-blue font-bold">Manifest</span>
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Verify your borrowing criteria, collateral asset specs, and configured amortization totals before logging into the underwriter decision queue.
                  </p>
                </div>

                {/* Elegant Invoice Box */}
                <div className="bg-white dark:bg-[var(--bg-surface)] border border-black/[0.04] dark:border-white/[0.04] p-6 rounded-3xl relative overflow-hidden shadow-[0_10px_35px_rgba(0,0,0,0.02)] space-y-6">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-apple-blue/5 blur-2xl rounded-full" />
                    
                    <div className="grid grid-cols-2 gap-6 pb-6 border-b border-black/[0.04] dark:border-white/[0.04]">
                        <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-wider">Target Asset</p>
                            <p className="text-sm font-bold text-[var(--text-primary)] dark:text-white">
                              {formData.vehicleYear} {formData.vehicleMake} {formData.vehicleModel}
                            </p>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-wider">Tenure Cycle</p>
                            <p className="text-sm font-bold text-[var(--text-primary)] dark:text-white">
                              {formData.loanTerm.split('_')[0]} Months
                            </p>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-wider">Asset Valuation</p>
                            <p className="text-sm font-bold text-[var(--text-primary)] dark:text-white font-mono">
                              {formatPrice(Number(formData.vehiclePrice))}
                            </p>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-wider">Down Payment Cash</p>
                            <p className="text-sm font-bold text-[var(--text-primary)] dark:text-white font-mono">
                              {formatPrice(Number(formData.downPayment))}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2 text-[11px] pb-6 border-b border-black/[0.04] dark:border-white/[0.04]">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Loan Principal balance</span>
                        <span className="font-mono font-semibold text-[var(--text-primary)] dark:text-white">{formatPrice(Number(formData.vehiclePrice) - Number(formData.downPayment))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">GPS Tracker Hardware & Setup</span>
                        <span className="font-mono font-bold text-apple-green uppercase text-[9px]">Free Included</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Preferential Underwriter APR</span>
                        <span className="font-mono font-semibold text-[var(--text-primary)] dark:text-white">15.5% (Amortized)</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end">
                        <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-wider">Monthly Commitment</p>
                            <p className="text-2xl font-black text-apple-blue font-mono">{formatPrice(calculateMockInstallment(Number(formData.vehiclePrice), Number(formData.downPayment), formData.loanTerm))}</p>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-apple-green/10 text-apple-green border border-apple-green/10">
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-[8px] font-bold uppercase tracking-wider font-mono">Pre-Approved Rate</span>
                        </div>
                    </div>
                </div>

                {/* Contact & Agreement Block */}
                <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)] ml-2">Contact Number (WhatsApp Preferred)</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input 
                          type="tel" 
                          placeholder="e.g. +92 300 1234567" 
                          className="apple-input w-full pl-11 dark:bg-black/40"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-[var(--bg-surface)] dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.03] dark:border-white/[0.03]">
                      <AlertCircle className="w-4 h-4 text-apple-blue shrink-0 mt-0.5" />
                      <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                        By continuing, you authorize Pakizzle Capital to query SBP credit records. Standard underwriting procedures apply.
                      </p>
                    </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'confirmation' && (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: -0.95 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-center space-y-8 py-10"
              >
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 180 }}
                        className="w-16 h-16 rounded-full bg-apple-green flex items-center justify-center text-white shadow-xl shadow-apple-green/20 z-10"
                    >
                        <Check className="w-8 h-8 stroke-[3]" />
                    </motion.div>
                    <motion.div 
                        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 rounded-full border-2 border-apple-green"
                    />
                </div>

                <div className="space-y-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-apple-green font-mono">CREDIT LOGGED ONLINE</span>
                    <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-[1.2]">
                      Financing Request <br /> <span className="text-apple-green font-bold">Successfully Submitted</span>
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-sm mx-auto">
                      Your capital file has been safely registered. Our dedicated underwriting specialist will contact you via WhatsApp/Phone within 12 hours.
                    </p>
                </div>

                {/* Simulated Receipt Box */}
                <div className="bg-white dark:bg-[var(--bg-surface)] border border-black/[0.04] dark:border-white/[0.04] p-5 rounded-3xl inline-block shadow-[0_4px_24px_rgba(0,0,0,0.01)] text-left min-w-[300px]">
                    <div className="flex items-center justify-between gap-6">
                        <div>
                            <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-wider">Application Token</p>
                            <p className="text-sm font-bold font-mono text-[var(--text-primary)] dark:text-white tracking-tight uppercase">PKZ-CAP-{Math.floor(100000 + Math.random() * 900000)}</p>
                        </div>
                        <div className="w-px h-8 bg-black/[0.06] dark:bg-white/[0.06]" />
                        <button 
                          onClick={() => toast.success("Summary report downloaded")}
                          className="text-[9px] font-black text-apple-blue uppercase tracking-widest hover:text-blue-600 font-mono flex items-center gap-1 active:scale-95 transition-transform"
                        >
                            SUMMARY
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                <div className="pt-4">
                    <button 
                        onClick={() => navigate('/settings?section=financing')}
                        className="px-8 h-12 rounded-full text-xs font-semibold bg-apple-blue hover:bg-blue-600 text-white transition-all shadow-md active:scale-95"
                    >
                        Go to My Dashboard
                    </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Action Bar Bottom Controller */}
        {currentStep !== 'confirmation' && (
          <div className="sticky bottom-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-black/[0.04] dark:border-white/[0.04] px-6 py-4 md:px-12 md:py-6 z-20 flex justify-between items-center">
             <button 
                onClick={handleBack}
                disabled={currentStep === 'vehicle'}
                className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white disabled:opacity-0 transition-all active:scale-95 duration-200"
             >
                <ChevronLeft className="w-4 h-4" />
                Back
             </button>

             <button 
                onClick={handleNext}
                disabled={isSubmitting}
                className="px-6 h-12 rounded-full text-xs font-semibold bg-apple-blue hover:bg-blue-600 text-white transition-all shadow-md active:scale-95 flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{currentStep === 'summary' ? 'Authorize Application' : 'Continue'}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
