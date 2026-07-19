import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Banknote, 
  User, 
  Building2, 
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
  Info,
  FileText,
  Briefcase,
  TrendingUp,
  Wallet,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { useVehicles } from '../context/VehicleContext';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

type FinanceStep = 'type' | 'amount' | 'employment' | 'documents' | 'result';

export default function FinancingApplicationFlow() {
  const { type: urlType } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { setNotification } = useChat();
  
  const [step, setStep] = useState<FinanceStep>('type');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    type: urlType || 'personal',
    amount: '2500000',
    tenure: '36',
    employment: 'salaried',
    income: '150000',
    hasDocuments: false
  });

  const steps: FinanceStep[] = ['type', 'amount', 'employment', 'documents', 'result'];
  const currentStepIndex = steps.indexOf(step);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setStep(steps[currentStepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setStep(steps[currentStepIndex - 1]);
    } else {
      navigate('/financing');
    }
  };

  const submitApplication = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('result');
    }, 2500);
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
            <h1 className="text-sm font-black uppercase tracking-[0.2em]">Finance Application</h1>
            <p className="text-[10px] font-bold text-apple-text-muted">Step {currentStepIndex + 1} of {steps.length}</p>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>
        
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-apple-gray">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            className="h-full bg-purple-500"
          />
        </div>
      </header>

      <main className="pt-24 pb-32 px-6">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 'type' && (
              <motion.div
                key="type"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-black tracking-tight mb-3">Application Type</h2>
                  <p className="text-apple-text-muted font-medium">What kind of financing do you need?</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {[
                    { id: 'personal', label: 'Personal Loan', desc: 'Individual car financing.', icon: User },
                    { id: 'business', label: 'Business Lease', desc: 'Corporate fleet solutions.', icon: Building2 },
                    { id: 'refinance', label: 'Refinancing', desc: 'Lower your current EMI.', icon: TrendingUp }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setFormData({...formData, type: item.id})}
                      className={cn(
                        "flex items-center gap-6 p-6 rounded-[32px] border-2 transition-all text-left active:scale-[0.98]",
                        formData.type === item.id 
                          ? "border-purple-500 bg-purple-500/5 shadow-apple-soft" 
                          : "border-apple-border bg-apple-card-bg hover:border-purple-500/30"
                      )}
                    >
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center",
                        formData.type === item.id ? "bg-purple-500 text-white" : "bg-apple-gray dark:bg-white/10 text-apple-text-muted"
                      )}>
                        <item.icon className="w-7 h-7" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-black text-lg">{item.label}</h3>
                        <p className="text-sm text-apple-text-muted font-medium">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'amount' && (
              <motion.div
                key="amount"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-black tracking-tight mb-3">Loan Details</h2>
                  <p className="text-apple-text-muted font-medium">How much do you want to borrow?</p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end px-2">
                      <label className="text-xs font-black text-apple-text-muted uppercase tracking-widest">Requested Amount</label>
                      <span className="text-2xl font-black text-purple-600">Rs. {parseInt(formData.amount).toLocaleString()}</span>
                    </div>
                    <input 
                      type="range" 
                      min="500000" 
                      max="10000000" 
                      step="100000"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full h-2 bg-apple-gray rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-apple-text-muted px-2">
                      <span>Rs. 500,000</span>
                      <span>Rs. 10,000,000</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black text-apple-text-muted uppercase tracking-widest px-2">Tenure (Months)</label>
                    <div className="grid grid-cols-4 gap-3">
                      {['12', '24', '36', '48', '60', '72', '84'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setFormData({...formData, tenure: t})}
                          className={cn(
                            "py-4 rounded-2xl border-2 font-black text-xs transition-all",
                            formData.tenure === t ? "border-purple-500 bg-purple-500/5 text-purple-600" : "border-apple-border bg-apple-card-bg"
                          )}
                        >
                          {t} mo
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-apple-gray/30 dark:bg-white/5 p-8 rounded-[32px] border border-apple-border/50">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-bold text-apple-text-muted">Estimated Monthly EMI</span>
                      <span className="text-xl font-black text-apple-text">Rs. {Math.round(parseInt(formData.amount) / parseInt(formData.tenure) * 1.15).toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-apple-text-muted font-medium leading-relaxed">
                      *Estimated at 15% APR. Final rates depend on credit assessment and bank approval.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'employment' && (
              <motion.div
                key="employment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-black tracking-tight mb-3">Employment Info</h2>
                  <p className="text-apple-text-muted font-medium">Tell us about your source of income.</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'salaried', label: 'Salaried', icon: Briefcase },
                      { id: 'self-employed', label: 'Self-Employed', icon: TrendingUp }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setFormData({...formData, employment: item.id})}
                        className={cn(
                          "flex flex-col items-center gap-4 p-8 rounded-[32px] border-2 transition-all text-center",
                          formData.employment === item.id 
                            ? "border-purple-500 bg-purple-500/5 shadow-apple-soft" 
                            : "border-apple-border bg-apple-card-bg hover:border-purple-500/30"
                        )}
                      >
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center",
                          formData.employment === item.id ? "bg-purple-500 text-white" : "bg-apple-gray dark:bg-white/10 text-apple-text-muted"
                        )}>
                          <item.icon className="w-7 h-7" />
                        </div>
                        <h3 className="font-black text-sm">{item.label}</h3>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black text-apple-text-muted uppercase tracking-widest px-2">Monthly Net Income</label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-apple-text-muted">Rs.</span>
                      <input 
                        type="number" 
                        value={formData.income}
                        onChange={(e) => setFormData({...formData, income: e.target.value})}
                        className="w-full pl-14 pr-6 py-5 bg-apple-card-bg rounded-[24px] border-2 border-apple-border focus:border-purple-500 outline-none font-black text-lg transition-all"
                        placeholder="e.g. 150,000"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'documents' && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-black tracking-tight mb-3">Digital Documents</h2>
                  <p className="text-apple-text-muted font-medium">Upload basic documents for instant verification.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'CNIC (Front & Back)', icon: FileText, status: 'Required' },
                    { label: 'Salary Slips (Last 3 Mo)', icon: Banknote, status: 'Required' },
                    { label: 'Bank Statement (6 Mo)', icon: TrendingUp, status: 'Required' }
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center gap-4 p-6 bg-apple-card-bg rounded-[32px] border border-apple-border shadow-sm">
                      <div className="w-12 h-12 bg-apple-gray dark:bg-white/10 rounded-2xl flex items-center justify-center text-apple-text-muted">
                        <doc.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-sm">{doc.label}</h4>
                        <p className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest">{doc.status}</p>
                      </div>
                      <button className="px-4 py-2 bg-apple-blue/10 text-apple-blue rounded-full text-xs font-black hover:bg-apple-blue/20 transition-colors">
                        Upload
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-purple-500/5 p-6 rounded-[32px] border border-purple-500/20 flex items-start gap-4">
                  <div className="w-10 h-10 bg-apple-card-bg rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    <ShieldCheck className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-xs text-apple-text-muted font-medium leading-relaxed">
                    Your documents are encrypted and only shared with our banking partners for credit assessment.
                  </p>
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
                <div className="w-24 h-24 bg-purple-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-8">
                  <Sparkles className="w-12 h-12 text-purple-600" />
                </div>

                <div>
                  <h2 className="text-4xl font-black tracking-tight mb-4">Application Submitted!</h2>
                  <p className="text-apple-text-muted font-medium max-w-md mx-auto">
                    Your application for Rs. {parseInt(formData.amount).toLocaleString()} has been received. 
                    Our AI is reviewing your profile.
                  </p>
                </div>

                <div className="bg-apple-card-bg rounded-[48px] p-10 shadow-apple-card border border-apple-border/50 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-apple-blue" />
                  
                  <div className="space-y-6 mb-10">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-apple-text-muted">Application ID</span>
                      <span className="text-sm font-black">PKZ-FIN-88291</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-apple-text-muted">Status</span>
                      <span className="px-3 py-1 bg-apple-blue/10 text-apple-blue rounded-full text-[10px] font-black uppercase tracking-widest">In Review</span>
                    </div>
                    <div className="h-[1px] bg-apple-border" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-apple-text-muted">Expected Decision</span>
                      <span className="text-sm font-black">Within 24 Hours</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={() => navigate('/financing')}
                      className="w-full bg-apple-text text-apple-bg py-6 rounded-full font-black text-lg shadow-2xl hover:bg-purple-600 hover:text-white transition-all active:scale-95"
                    >
                      Go to Dashboard
                    </button>
                    <p className="text-[10px] text-apple-text-muted font-medium">
                      We will notify you via email and SMS once a decision is made.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-apple-gray/30 dark:bg-white/5 p-6 rounded-[32px] flex items-center gap-4 text-left">
                    <div className="w-12 h-12 bg-apple-card-bg rounded-2xl flex items-center justify-center shadow-sm">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm">Track Status</h4>
                      <p className="text-xs text-apple-text-muted font-medium">Real-time updates</p>
                    </div>
                  </div>
                  <div className="bg-apple-gray/30 dark:bg-white/5 p-6 rounded-[32px] flex items-center gap-4 text-left">
                    <div className="w-12 h-12 bg-apple-card-bg rounded-2xl flex items-center justify-center shadow-sm">
                      <Building2 className="w-6 h-6 text-apple-blue" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm">Partner Banks</h4>
                      <p className="text-xs text-apple-text-muted font-medium">12+ Leading institutions</p>
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
              onClick={step === 'documents' ? submitApplication : handleNext}
              disabled={loading}
              className="flex-1 bg-apple-text text-apple-bg py-5 rounded-full font-black text-lg shadow-xl hover:bg-purple-600 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {step === 'documents' ? 'Submit Application' : 'Continue'}
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
