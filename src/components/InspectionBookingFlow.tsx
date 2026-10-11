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
  DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { db, auth } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

type Step = 'vehicle' | 'location' | 'schedule' | 'payment' | 'confirmation';

export default function InspectionBookingFlow() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('vehicle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    address: '',
    city: '',
    date: '',
    time: '',
    phone: '',
    email: ''
  });

  const steps: { id: Step; label: string; icon: any }[] = [
    { id: 'vehicle', label: 'Vehicle Details', icon: Car },
    { id: 'location', label: 'Location Hub', icon: MapPin },
    { id: 'schedule', label: 'Schedule Sweep', icon: Calendar },
    { id: 'payment', label: 'Summary Manifest', icon: CreditCard },
  ];

  // Dynamic date generation for the schedule screen starting tomorrow (from local current time)
  const upcomingDates = useMemo(() => {
    const dates = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Start tomorrow
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i + 1);
      dates.push({
        dayName: days[d.getDay()],
        label: `${months[d.getMonth()]} ${d.getDate()}`,
        id: `${months[d.getMonth()]} ${d.getDate()}`
      });
    }
    return dates;
  }, []);

  // Pre-fill default date on load
  React.useEffect(() => {
    if (upcomingDates.length > 0 && !formData.date) {
      setFormData(prev => ({ ...prev, date: upcomingDates[0].id }));
    }
  }, [upcomingDates]);

  const handleNext = async () => {
    if (currentStep === 'vehicle') {
      if (!formData.vehicleMake || !formData.vehicleModel || !formData.vehicleYear) {
        toast.error('Please fill in all vehicle details');
        return;
      }
      setCurrentStep('location');
    }
    else if (currentStep === 'location') {
      if (!formData.address || !formData.city) {
        toast.error('Please provide an address and select a city hub');
        return;
      }
      setCurrentStep('schedule');
    }
    else if (currentStep === 'schedule') {
      if (!formData.date || !formData.time) {
        toast.error('Please select a date and time slot');
        return;
      }
      setCurrentStep('payment');
    }
    else if (currentStep === 'payment') {
      if (!formData.phone) {
        toast.error('Please provide a contact number');
        return;
      }
      
      if (!user) {
        toast.error('You must be signed in to book an inspection');
        return;
      }

      setIsSubmitting(true);
      try {
        const requestId = `INSP-${Date.now()}`;
        await setDoc(doc(db, 'inspection_requests', requestId), {
          id: requestId,
          userId: user.uid,
          ...formData,
          email: user.email || formData.email || '',
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setCurrentStep('confirmation');
      } catch (error) {
        console.error('Error saving inspection request:', error);
        toast.error('Failed to book inspection. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 'location') setCurrentStep('vehicle');
    else if (currentStep === 'schedule') setCurrentStep('location');
    else if (currentStep === 'payment') setCurrentStep('schedule');
    else if (currentStep === 'confirmation') navigate('/inspection');
  };

  // Diagnostic Hotspots coordinates matched on the red vehicle side profile
  const sidebarHotspots = [
    { id: 'engine', name: 'Compression Scan', x: '78%', y: '52%', activeOn: ['vehicle', 'payment', 'confirmation'] },
    { id: 'chassis', name: 'Underbody Sweep', x: '45%', y: '68%', activeOn: ['location', 'payment', 'confirmation'] },
    { id: 'ecu', name: 'CANbus Diagnostics', x: '60%', y: '50%', activeOn: ['schedule', 'payment', 'confirmation'] },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[var(--text-primary)] dark:bg-[var(--bg-page)] flex flex-col md:flex-row overflow-hidden text-[var(--text-primary)] dark:text-[var(--text-primary)] antialiased">
      
      {/* Sidebar - Desktop Only with Luxury Red Grid & Live Hotspot HUD */}
      <div className="hidden md:flex w-[400px] bg-white dark:bg-[var(--bg-surface)] border-r border-black/[0.05] dark:border-white/[0.05] flex-col p-8 relative overflow-hidden select-none shrink-0">
        
        {/* Subtle background pink/red grid exactly like the landing page */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.4] dark:opacity-[0.2]" style={{
          backgroundImage: `linear-gradient(to right, rgba(239, 68, 68, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(239, 68, 68, 0.08) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }} />

        {/* Brand header */}
        <div className="flex items-center gap-3 mb-10 relative z-10">
          <div className="w-9 h-9 bg-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight block leading-none text-[var(--text-primary)] dark:text-white">PAKIZZLE</span>
            <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest block mt-0.5">Verification Node</span>
          </div>
        </div>

        {/* Live Step HUD Display */}
        <div className="mb-8 relative z-10 bg-[var(--bg-surface)] dark:bg-[var(--bg-raised)] rounded-2xl p-4 border border-black/[0.03] dark:border-white/[0.03]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-wider">Dynamic Vehicle HUD</span>
            <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse uppercase">
              {currentStep === 'confirmation' ? 'Calibration Completed' : 'Active Telemetry'}
            </span>
          </div>
          
          {/* Miniature side profile red sedan with responsive blips */}
          <div className="relative py-4 bg-[var(--bg-surface)] dark:bg-[var(--bg-surface)] rounded-xl overflow-hidden border border-red-500/10 flex justify-center items-center">
            
            {/* Grid pattern inner */}
            <div className="absolute inset-0 pointer-events-none opacity-50" style={{
              backgroundImage: `linear-gradient(to right, rgba(239, 68, 68, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(239, 68, 68, 0.06) 1px, transparent 1px)`,
              backgroundSize: '16px 16px'
            }} />

            <div className="relative w-full max-w-[240px]">
              <img 
                src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1000" 
                alt="Luxury Red Car HUD" 
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
                          : "bg-red-500/20 border border-red-500 animate-ping" 
                        : "bg-transparent"
                    )} />
                    <div className={cn(
                      "w-3 h-3 rounded-full border flex items-center justify-center transition-all duration-500 shadow-md",
                      isGlowing 
                        ? currentStep === 'confirmation'
                          ? "bg-apple-green border-white text-white"
                          : "bg-red-500 border-white text-white scale-110" 
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
              {currentStep === 'vehicle' && '📡 Initializing engine compression telemetry profile...'}
              {currentStep === 'location' && '📍 Locking rendezvous coordinates with doorstep dispatch nodes...'}
              {currentStep === 'schedule' && '⏳ Querying available certified engineer time-slots...'}
              {currentStep === 'payment' && '🛡️ Ready to synchronize 240+ point verification suit.'}
              {currentStep === 'confirmation' && '✅ Inspection node logged in database! Dispatch active.'}
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
                    isCompleted ? "bg-red-500" : "bg-black/[0.08] dark:bg-white/[0.08]"
                  )} />
                )}
                
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-500 z-10 shrink-0",
                  isActive 
                    ? "border-red-500 text-red-500 bg-red-500/5 scale-110 ring-4 ring-red-500/10" 
                    : isCompleted 
                      ? "bg-red-500 border-red-500 text-white" 
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
                  <p className="text-[8px] font-black uppercase tracking-widest text-red-500 font-mono">Step 0{idx + 1}</p>
                  <h4 className="text-xs font-bold text-[var(--text-primary)] dark:text-white">{step.label}</h4>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Security Badge */}
        <div className="mt-auto relative z-10 pt-4 border-t border-black/[0.05] dark:border-white/[0.05]">
          <div className="bg-[var(--bg-surface)] dark:bg-[var(--bg-surface)] p-4 rounded-2xl border border-red-500/10 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-[var(--text-primary)] dark:text-white">Military-Grade Encryption</p>
              <p className="text-[9px] text-[var(--text-secondary)] leading-relaxed mt-0.5">
                All coordinates, telephone nodes, and engine parameter hashes are stored with 256-bit encryption.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-y-auto custom-scrollbar bg-[var(--text-primary)] dark:bg-[var(--bg-page)]">
        
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/[0.04] dark:border-white/[0.04] px-6 h-16 flex items-center justify-between z-20">
          <button onClick={() => navigate('/inspection')} className="p-1.5 text-[var(--text-primary)] dark:text-white">
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex gap-1.5">
            {steps.map((step, idx) => (
              <div key={idx} className={cn(
                "h-1 rounded-full transition-all duration-500",
                currentStep === step.id ? "w-6 bg-red-500" : "w-1 bg-black/10 dark:bg-white/15"
              )} />
            ))}
          </div>
          
          <div className="w-5 h-5" /> {/* Spacer */}
        </div>

        {/* Desktop Exit Pill */}
        <button 
           onClick={() => navigate('/inspection')}
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
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/5 dark:bg-red-500/10 border border-red-500/15 text-[9px] font-black text-red-500 uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" />
                    Diagnostics Suite
                  </div>
                  <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-[1.15]">
                    Identify Your <span className="text-red-500 font-bold">Machine</span>
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Provide the core vehicle parameters. Pakizzle calibrates its active sensors and OBD-II multi-system CANbus scan profiles according to the manufacturer’s genuine factory guidelines.
                  </p>
                </div>

                <div className="space-y-4 bg-white dark:bg-[var(--bg-surface)] p-6 rounded-3xl border border-black/[0.03] dark:border-white/[0.03] shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Manufacturer / Make</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Porsche, Honda, Toyota" 
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
                            placeholder="e.g. 911, Civic, Land Cruiser" 
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
                </div>

                <div className="flex items-center gap-3 p-4 bg-[var(--bg-surface)] dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.03] dark:border-white/[0.03] text-[10px] text-[var(--text-secondary)]">
                  <Cpu className="w-4 h-4 text-red-500 shrink-0" />
                  <span>The database will dynamically load paint thickness tolerances for this model.</span>
                </div>
              </motion.div>
            )}

            {currentStep === 'location' && (
              <motion.div
                key="location"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/5 dark:bg-red-500/10 border border-red-500/15 text-[9px] font-black text-red-500 uppercase tracking-widest">
                    <Compass className="w-3 h-3" />
                    Rendezvous Node
                  </div>
                  <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-[1.15]">
                    Deployment <span className="text-red-500 font-bold">Coordinates</span>
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Where is the vehicle located? Our mobile dispatch networks have active engineer teams waiting to sweep major city hubs at the seller's doorstep.
                  </p>
                </div>

                <div className="space-y-5 bg-white dark:bg-[var(--bg-surface)] p-6 rounded-3xl border border-black/[0.03] dark:border-white/[0.03] shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
                  
                  {/* Select City Hub */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Select City Hub Node</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi'].map(city => {
                        const isSelected = formData.city === city;
                        return (
                          <button
                            key={city}
                            onClick={() => setFormData({...formData, city})}
                            className={cn(
                              "h-12 rounded-xl border font-bold text-xs flex items-center justify-between px-4 transition-all duration-300 relative overflow-hidden active:scale-[0.98]",
                              isSelected 
                                ? "bg-red-500/5 border-red-500 text-[var(--text-primary)] dark:text-white shadow-sm font-semibold" 
                                : "bg-white dark:bg-black/30 border-black/[0.06] dark:border-white/[0.06] text-[var(--text-secondary)] hover:border-[var(--text-primary)] dark:hover:border-white/25"
                            )}
                          >
                            <span>{city}</span>
                            {isSelected ? (
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-black/10 dark:bg-white/10" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Street Address / Specific Locality</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <input 
                        type="text" 
                        placeholder="e.g. DHA Phase 6, Block H, House 42" 
                        className="apple-input w-full pl-11 dark:bg-black/40"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-[var(--bg-surface)] dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.03] dark:border-white/[0.03]">
                  <Navigation className="w-4 h-4 text-red-500 shrink-0 mt-0.5 animate-pulse" />
                  <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                    Our real-time dispatch map allocates the closest certified node automatically. Surcharge includes doorstep travel.
                  </p>
                </div>
              </motion.div>
            )}

            {currentStep === 'schedule' && (
              <motion.div
                key="schedule"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/5 dark:bg-red-500/10 border border-red-500/15 text-[9px] font-black text-red-500 uppercase tracking-widest">
                    <Clock className="w-3 h-3" />
                    Temporal Slot
                  </div>
                  <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-[1.15]">
                    Temporal <span className="text-red-500 font-bold">Alignment</span>
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Select a dedicated calendar window and time-slot for our engineering team to carry out the active 240+ point verification sweep.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Calendar Dates Grid */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Available Dates</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {upcomingDates.map(date => {
                        const isSelected = formData.date === date.id;
                        return (
                          <button
                            key={date.id}
                            onClick={() => setFormData({...formData, date: date.id})}
                            className={cn(
                              "p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-0.5 transition-all duration-300 active:scale-95",
                              isSelected 
                                ? "bg-red-500/5 border-red-500 text-red-500 shadow-sm" 
                                : "bg-white dark:bg-[var(--bg-surface)] border-black/[0.04] dark:border-white/[0.04] text-[var(--text-secondary)] hover:border-[var(--text-primary)] dark:hover:border-white/20"
                            )}
                          >
                            <span className="text-[8px] font-bold uppercase tracking-widest opacity-60 font-mono">{date.dayName}</span>
                            <span className="text-xs font-black">{date.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Available Hours */}
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Available Hours</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'].map(time => {
                        const isSelected = formData.time === time;
                        return (
                          <button
                            key={time}
                            onClick={() => setFormData({...formData, time})}
                            className={cn(
                              "h-11 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all duration-300 active:scale-95",
                              isSelected 
                                ? "bg-black text-white dark:bg-white dark:text-black border-transparent shadow-md" 
                                : "bg-white dark:bg-[var(--bg-surface)] border-black/[0.04] dark:border-white/[0.04] text-[var(--text-secondary)] hover:border-[var(--text-primary)] dark:hover:border-white/20"
                            )}
                          >
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/5 dark:bg-red-500/10 border border-red-500/15 text-[9px] font-black text-red-500 uppercase tracking-widest">
                    <ClipboardList className="w-3 h-3" />
                    Service Ticket
                  </div>
                  <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-[1.15]">
                    Service <span className="text-red-500 font-bold">Manifest</span>
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Verify the digital manifest details, diagnostic calibration specs, and total doorstep surcharge before scheduling engineer dispatch.
                  </p>
                </div>

                {/* Elegant Digital Invoice Box */}
                <div className="bg-white dark:bg-[var(--bg-surface)] border border-black/[0.04] dark:border-white/[0.04] p-6 rounded-3xl relative overflow-hidden shadow-[0_10px_35px_rgba(0,0,0,0.02)] space-y-6">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-2xl rounded-full" />
                    
                    <div className="grid grid-cols-2 gap-6 pb-6 border-b border-black/[0.04] dark:border-white/[0.04]">
                        <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-wider">Target Car</p>
                            <p className="text-sm font-bold text-[var(--text-primary)] dark:text-white">
                              {formData.vehicleYear} {formData.vehicleMake} {formData.vehicleModel}
                            </p>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-wider">Temporal Slot</p>
                            <p className="text-sm font-bold text-[var(--text-primary)] dark:text-white">
                              {formData.date} at {formData.time || 'Pending'}
                            </p>
                        </div>
                        <div className="col-span-2 space-y-0.5">
                            <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-wider">Rendezvous Coordinates</p>
                            <p className="text-sm font-bold text-[var(--text-primary)] dark:text-white capitalize">
                              {formData.address}, {formData.city} Node
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2 text-[11px] pb-6 border-b border-black/[0.04] dark:border-white/[0.04]">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Pakizzle Base 240-Point Suite</span>
                        <span className="font-mono font-semibold text-[var(--text-primary)] dark:text-white">PKR 6,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Step Doorstep Mobile Dispatch</span>
                        <span className="font-mono font-semibold text-[var(--text-primary)] dark:text-white">PKR 1,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">ECU CANbus ODB-II System Handshake</span>
                        <span className="font-mono font-bold text-apple-green uppercase text-[9px]">Included</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end">
                        <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-wider">Estimated Surcharge</p>
                            <p className="text-2xl font-black text-red-500 font-mono">PKR 7,500</p>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-apple-green/10 text-apple-green border border-apple-green/10">
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-[8px] font-bold uppercase tracking-wider font-mono">Price Protected</span>
                        </div>
                    </div>
                </div>

                {/* Contact information inputs */}
                <div className="space-y-3">
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
                </div>
              </motion.div>
            )}

            {currentStep === 'confirmation' && (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
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
                    <span className="text-[9px] font-black uppercase tracking-widest text-apple-green font-mono">CALIBRATION ONLINE</span>
                    <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-[1.2]">
                      Inspection Node <br /> <span className="text-apple-green font-bold">Successfully Logged</span>
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-sm mx-auto">
                      Your doorstep rendezvous ticket is locked. Our lead diagnostic engineer will initiate contact via telephone exactly 60 minutes prior to arrival.
                    </p>
                </div>

                {/* Simulated Digital Receipt Pin */}
                <div className="bg-white dark:bg-[var(--bg-surface)] border border-black/[0.04] dark:border-white/[0.04] p-5 rounded-3xl inline-block shadow-[0_4px_24px_rgba(0,0,0,0.01)] text-left min-w-[300px]">
                    <div className="flex items-center justify-between gap-6">
                        <div>
                            <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-wider">Verification ID</p>
                            <p className="text-sm font-bold font-mono text-[var(--text-primary)] dark:text-white tracking-tight uppercase">PKZ-INSP-{Math.floor(100000 + Math.random() * 900000)}</p>
                        </div>
                        <div className="w-px h-8 bg-black/[0.06] dark:bg-white/[0.06]" />
                        <button 
                          onClick={() => toast.success("Receipt downloaded to files")}
                          className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:text-red-600 font-mono flex items-center gap-1 active:scale-95 transition-transform"
                        >
                            RECEIPT
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                <div className="pt-4">
                    <button 
                        onClick={() => navigate('/settings?section=inspections')}
                        className="px-8 h-12 rounded-full text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition-all shadow-md active:scale-95"
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
                className="px-6 h-12 rounded-full text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition-all shadow-md active:scale-95 flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{currentStep === 'payment' ? 'Confirm Deployment' : 'Continue'}</span>
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
