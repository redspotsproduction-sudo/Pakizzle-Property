import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, 
  User, 
  Shield, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Zap, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { useVehicles } from '../context/VehicleContext';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError as handleFirebaseError, OperationType } from '../firebase';
import { toast } from 'sonner';

type QuoteStep = 'vehicle' | 'usage' | 'driver' | 'coverage' | 'result';

export default function InsuranceQuoteFlow() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { vehicles } = useVehicles();
  const { user, profile } = useAuth();
  const { setNotification } = useChat();
  
  const [step, setStep] = useState<QuoteStep>('vehicle');
  const [loading, setLoading] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    usage: 'personal',
    mileage: '10000',
    experience: '5',
    claims: 'none',
    coverage: 'comprehensive'
  });

  const steps: QuoteStep[] = ['vehicle', 'usage', 'driver', 'coverage', 'result'];
  const currentStepIndex = steps.indexOf(step);

  const handleNext = () => {
    if (step === 'vehicle' && !selectedVehicleId) {
      setNotification?.('Please select a vehicle to continue.');
      return;
    }
    
    if (currentStepIndex < steps.length - 1) {
      setStep(steps[currentStepIndex + 1]);
    }
  };

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  const handleBuyPolicy = async () => {
    if (!user || !selectedVehicle) return;

    setIsSubmitting(true);
    try {
      const requestId = `INS-${Date.now()}`;
      const requestData = {
        id: requestId,
        userId: user.uid,
        vehicleMake: selectedVehicle.make,
        vehicleModel: selectedVehicle.model,
        vehicleYear: selectedVehicle.year.toString(),
        vehicleValue: Number(selectedVehicle.price),
        insuranceType: formData.coverage === 'comprehensive' ? 'comprehensive' : 'third_party',
        coveragePeriod: '1_year',
        address: profile?.addresses?.[0]?.address || 'Not provided',
        city: selectedVehicle.city,
        phone: profile?.phone || profile?.phoneNumber || 'Not provided',
        email: user.email || '',
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        quoteAmount: 42850
      };

      await setDoc(doc(db, 'insurance_requests', requestId), requestData);

      toast.success('Insurance request submitted successfully!');
      navigate('/settings?section=insurance');
    } catch (error: any) {
      console.error('Error submitting insurance request:', error);
      if (error?.code === 'permission-denied') {
        handleFirebaseError(error, OperationType.CREATE, `insurance_requests`);
      }
      toast.error('Failed to submit request: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setStep(steps[currentStepIndex - 1]);
    } else {
      navigate('/insurance');
    }
  };

  const calculateQuote = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('result');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-apple-bg text-apple-text font-sans selection:bg-apple-blue/20">
      {/* Native-like Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-apple-card-bg backdrop-blur-xl border-b border-apple-border/50 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={handleBack} className="p-2 -ml-2 hover:bg-apple-gray dark:hover:bg-white/5 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h1 className="text-sm font-black uppercase tracking-[0.2em]">Insurance Quote</h1>
            <p className="text-[10px] font-bold text-apple-text-muted">Step {currentStepIndex + 1} of {steps.length}</p>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>
        
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-apple-gray">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            className="h-full bg-apple-blue"
          />
        </div>
      </header>

      <main className="pt-24 pb-32 px-6">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 'vehicle' && (
              <motion.div
                key="vehicle"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-black tracking-tight mb-3">Select Vehicle</h2>
                  <p className="text-apple-text-muted font-medium">Which vehicle would you like to insure?</p>
                </div>

                <div className="space-y-4">
                  {vehicles.length > 0 ? (
                    vehicles.map((vehicle) => (
                      <button
                        key={vehicle.id}
                        onClick={() => setSelectedVehicleId(vehicle.id)}
                        className={cn(
                          "w-full flex items-center gap-4 p-6 rounded-[32px] border-2 transition-all text-left group active:scale-[0.98]",
                          selectedVehicleId === vehicle.id 
                            ? "border-apple-blue bg-apple-blue/5 shadow-apple-soft" 
                            : "border-apple-border bg-apple-card-bg hover:border-apple-blue/30"
                        )}
                      >
                        <div className={cn(
                          "w-16 h-16 rounded-2xl overflow-hidden shadow-inner",
                          selectedVehicleId === vehicle.id ? "ring-2 ring-apple-blue" : ""
                        )}>
                          <img 
                            src={vehicle.images[0]} 
                            alt={vehicle.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-black text-lg">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                          <p className="text-sm text-apple-text-muted font-medium">{vehicle.variant} • {vehicle.city}</p>
                        </div>
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                          selectedVehicleId === vehicle.id ? "bg-apple-blue border-apple-blue" : "border-apple-border"
                        )}>
                          {selectedVehicleId === vehicle.id && <Check className="w-4 h-4 text-white" />}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="bg-apple-card-bg p-12 rounded-[40px] border border-apple-border border-dashed text-center">
                      <Car className="w-12 h-12 text-apple-text-muted mx-auto mb-4" />
                      <p className="text-apple-text-muted font-bold mb-6">No vehicles found in your account.</p>
                      <button 
                        onClick={() => navigate('/sell')}
                        className="apple-button-primary"
                      >
                        Add a Vehicle
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 'usage' && (
              <motion.div
                key="usage"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-black tracking-tight mb-3">Vehicle Usage</h2>
                  <p className="text-apple-text-muted font-medium">How do you primarily use this vehicle?</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {[
                    { id: 'personal', label: 'Personal Use', desc: 'Commuting, shopping, and leisure.', icon: User },
                    { id: 'business', label: 'Business Use', desc: 'Client visits, deliveries, or commercial use.', icon: Zap },
                    { id: 'rideshare', label: 'Rideshare', desc: 'Uber, Careem, or similar services.', icon: Clock }
                  ].map((usage) => (
                    <button
                      key={usage.id}
                      onClick={() => setFormData({...formData, usage: usage.id})}
                      className={cn(
                        "flex items-center gap-6 p-6 rounded-[32px] border-2 transition-all text-left active:scale-[0.98]",
                        formData.usage === usage.id 
                          ? "border-apple-blue bg-apple-blue/5 shadow-apple-soft" 
                          : "border-apple-border bg-apple-card-bg hover:border-apple-blue/30"
                      )}
                    >
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center",
                        formData.usage === usage.id ? "bg-apple-blue text-white" : "bg-apple-gray dark:bg-white/10 text-apple-text-muted"
                      )}>
                        <usage.icon className="w-7 h-7" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-black text-lg">{usage.label}</h3>
                        <p className="text-sm text-apple-text-muted font-medium">{usage.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="space-y-4 pt-4">
                  <label className="text-xs font-black text-apple-text-muted uppercase tracking-widest px-2">Annual Mileage</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['< 5,000', '5,000 - 15,000', '> 15,000'].map((m) => (
                      <button
                        key={m}
                        onClick={() => setFormData({...formData, mileage: m})}
                        className={cn(
                          "py-4 rounded-2xl border-2 font-black text-xs transition-all",
                          formData.mileage === m ? "border-apple-blue bg-apple-blue/5 text-apple-blue" : "border-apple-border bg-apple-card-bg"
                        )}
                      >
                        {m} km
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'driver' && (
              <motion.div
                key="driver"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-black tracking-tight mb-3">Driver Profile</h2>
                  <p className="text-apple-text-muted font-medium">Tell us about your driving experience.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-apple-text-muted uppercase tracking-widest px-2">Years of Experience</label>
                    <div className="grid grid-cols-4 gap-3">
                      {['1-2', '3-5', '6-10', '10+'].map((exp) => (
                        <button
                          key={exp}
                          onClick={() => setFormData({...formData, experience: exp})}
                          className={cn(
                            "py-4 rounded-2xl border-2 font-black text-xs transition-all",
                            formData.experience === exp ? "border-apple-blue bg-apple-blue/5 text-apple-blue" : "border-apple-border bg-apple-card-bg"
                          )}
                        >
                          {exp} yrs
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black text-apple-text-muted uppercase tracking-widest px-2">Recent Claims (Last 3 Years)</label>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { id: 'none', label: 'No Claims', desc: 'Clean driving record.' },
                        { id: '1', label: '1 Claim', desc: 'Minor incident or theft.' },
                        { id: '2+', label: '2+ Claims', desc: 'Multiple incidents.' }
                      ].map((claim) => (
                        <button
                          key={claim.id}
                          onClick={() => setFormData({...formData, claims: claim.id})}
                          className={cn(
                            "flex items-center justify-between p-6 rounded-[32px] border-2 transition-all text-left",
                            formData.claims === claim.id 
                              ? "border-apple-blue bg-apple-blue/5 shadow-apple-soft" 
                              : "border-apple-border bg-apple-card-bg hover:border-apple-blue/30"
                          )}
                        >
                          <div>
                            <h3 className="font-black text-lg">{claim.label}</h3>
                            <p className="text-sm text-apple-text-muted font-medium">{claim.desc}</p>
                          </div>
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                            formData.claims === claim.id ? "bg-apple-blue border-apple-blue" : "border-apple-border"
                          )}>
                            {formData.claims === claim.id && <Check className="w-4 h-4 text-white" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'coverage' && (
              <motion.div
                key="coverage"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-black tracking-tight mb-3">Coverage Level</h2>
                  <p className="text-apple-text-muted font-medium">Choose the protection that fits your needs.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { 
                      id: 'comprehensive', 
                      label: 'Comprehensive', 
                      price: 'Rs. 45,000/yr',
                      desc: 'Full protection including theft, accidental damage, and natural disasters.',
                      features: ['Theft & Total Loss', 'Accidental Damage', 'Third Party Liability', 'Natural Disasters']
                    },
                    { 
                      id: 'third-party', 
                      label: 'Third Party Only', 
                      price: 'Rs. 12,000/yr',
                      desc: 'Basic legal requirement. Covers damage to other vehicles and property.',
                      features: ['Third Party Liability', 'Legal Compliance']
                    }
                  ].map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setFormData({...formData, coverage: plan.id})}
                      className={cn(
                        "w-full p-8 rounded-[40px] border-2 transition-all text-left relative overflow-hidden group active:scale-[0.98]",
                        formData.coverage === plan.id 
                          ? "border-apple-blue bg-apple-blue/5 shadow-apple-soft" 
                          : "border-apple-border bg-apple-card-bg hover:border-apple-blue/30"
                      )}
                    >
                      {plan.id === 'comprehensive' && (
                        <div className="absolute top-0 right-0 bg-apple-blue text-white px-6 py-2 rounded-bl-[24px] text-[10px] font-black uppercase tracking-widest">
                          Most Popular
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-2xl font-black mb-1">{plan.label}</h3>
                          <p className="text-sm text-apple-text-muted font-medium">{plan.desc}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-apple-blue">{plan.price}</p>
                          <p className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest">Estimated</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {plan.features.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs font-bold text-apple-text-muted">
                            <CheckCircle2 className="w-4 h-4 text-apple-green" />
                            {f}
                          </div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'result' && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8 text-center"
              >
                <div className="w-24 h-24 bg-apple-green/10 rounded-[32px] flex items-center justify-center mx-auto mb-8">
                  <ShieldCheck className="w-12 h-12 text-apple-green" />
                </div>

                <div>
                  <h2 className="text-4xl font-black tracking-tight mb-4">Your Quote is Ready!</h2>
                  <p className="text-apple-text-muted font-medium max-w-md mx-auto">
                    Based on your profile and {selectedVehicle?.make} {selectedVehicle?.model}, 
                    we've calculated your personalized premium.
                  </p>
                </div>

                <div className="bg-apple-card-bg rounded-[48px] p-10 shadow-apple-card border border-apple-border/50 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-apple-blue to-purple-500" />
                  
                  <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-10">
                    <div className="text-center md:text-left">
                      <p className="text-xs font-black text-apple-text-muted uppercase tracking-[0.2em] mb-2">Annual Premium</p>
                      <h3 className="text-5xl font-black text-apple-text tracking-tighter">Rs. 42,850</h3>
                      <p className="text-sm text-apple-green font-bold mt-2 flex items-center justify-center md:justify-start gap-1">
                        <Zap className="w-4 h-4 fill-current" />
                        Save Rs. 5,200 with Pakizzle Secure™
                      </p>
                    </div>
                    <div className="h-20 w-[1px] bg-apple-border hidden md:block" />
                    <div className="text-center md:text-right">
                      <p className="text-xs font-black text-apple-text-muted uppercase tracking-[0.2em] mb-2">Monthly Option</p>
                      <h3 className="text-3xl font-black text-apple-text">Rs. 3,950</h3>
                      <p className="text-sm text-apple-text-muted font-medium mt-2">Interest-free installments</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={handleBuyPolicy}
                      disabled={isSubmitting}
                      className="w-full bg-apple-text text-apple-bg py-6 rounded-full font-black text-lg shadow-2xl hover:bg-apple-blue hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <CreditCard className="w-6 h-6" />
                          Buy Policy Now
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-apple-text-muted font-medium">
                      By clicking Buy Policy, you agree to our <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-apple-gray/30 dark:bg-white/5 p-6 rounded-[32px] flex items-center gap-4 text-left">
                    <div className="w-12 h-12 bg-apple-card-bg rounded-2xl flex items-center justify-center shadow-sm">
                      <Info className="w-6 h-6 text-apple-blue" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm">Policy Summary</h4>
                      <p className="text-xs text-apple-text-muted font-medium">Download PDF overview</p>
                    </div>
                  </div>
                  <div className="bg-apple-gray/30 dark:bg-white/5 p-6 rounded-[32px] flex items-center gap-4 text-left">
                    <div className="w-12 h-12 bg-apple-card-bg rounded-2xl flex items-center justify-center shadow-sm">
                      <Shield className="w-6 h-6 text-apple-green" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm">Claims Support</h4>
                      <p className="text-xs text-apple-text-muted font-medium">24/7 Priority assistance</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Fixed Footer Actions */}
      {step !== 'result' && (
        <footer className="fixed bottom-0 left-0 right-0 z-50 bg-apple-card-bg backdrop-blur-xl border-t border-apple-border/50 p-6">
          <div className="max-w-2xl mx-auto flex gap-4">
            <button 
              onClick={handleBack}
              className="px-8 py-5 rounded-full border border-apple-border font-bold hover:bg-apple-gray dark:hover:bg-white/5 transition-colors"
            >
              Back
            </button>
            <button 
              onClick={step === 'coverage' ? calculateQuote : handleNext}
              disabled={loading}
              className="flex-1 bg-apple-text text-apple-bg py-5 rounded-full font-black text-lg shadow-xl hover:bg-apple-blue hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {step === 'coverage' ? 'Calculate Quote' : 'Continue'}
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin", className)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
