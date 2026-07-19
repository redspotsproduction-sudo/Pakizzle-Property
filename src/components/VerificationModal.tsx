import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Zap, 
  Lock, 
  ArrowRight, 
  X, 
  CheckCircle2, 
  User, 
  Camera, 
  Lightbulb, 
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

type Step = 'intro' | 'front' | 'back' | 'success';

export default function VerificationModal({ isOpen, onClose, onConfirm }: VerificationModalProps) {
  const [step, setStep] = React.useState<Step>('intro');

  const handleNext = () => {
    if (step === 'intro') setStep('front');
    else if (step === 'front') setStep('back');
    else if (step === 'back') setStep('success');
    else onConfirm();
  };

  const handleClose = () => {
    setStep('intro');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop with deep blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-[12px]"
          />

          {/* Modal Content - Geometric Square Box Design */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative w-full max-w-[480px] bg-apple-bg rounded-[32px] shadow-[0_40px_80px_rgba(0,0,0,0.4)] overflow-hidden border border-apple-border/50 flex flex-col min-h-[520px]"
          >
            {step === 'intro' ? (
              <>
                {/* Advanced Illustration Area - Premium ID Card Feel */}
                <div className="relative h-52 bg-gradient-to-br from-apple-blue/10 via-apple-blue/5 to-transparent flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,113,227,0.08)_0%,transparent_70%)]" />
                  </div>
                  
                  <div className="relative">
                    {/* Mock ID Card */}
                    <motion.div
                      initial={{ y: 20, opacity: 0, rotate: -2 }}
                      animate={{ y: 0, opacity: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="w-56 h-32 bg-white dark:bg-apple-card-bg rounded-2xl shadow-2xl border border-white/20 p-4 flex flex-col justify-between relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-apple-blue/5 rounded-full blur-2xl -mr-12 -mt-12" />
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-apple-gray flex items-center justify-center overflow-hidden">
                          <User className="w-6 h-6 text-apple-text-muted" />
                        </div>
                        <div className="space-y-1">
                          <div className="w-20 h-2 bg-apple-gray rounded-full" />
                          <div className="w-12 h-1.5 bg-apple-gray/50 rounded-full" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="w-full h-1.5 bg-apple-gray/30 rounded-full" />
                        <div className="w-2/3 h-1.5 bg-apple-gray/30 rounded-full" />
                      </div>

                      {/* Verified Badge Overlay */}
                      <motion.div
                        initial={{ scale: 0, rotate: 45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.6, type: "spring", damping: 12 }}
                        className="absolute top-4 right-4 w-10 h-10 bg-apple-blue rounded-full flex items-center justify-center border-[4px] border-apple-bg shadow-xl"
                      >
                        <CheckCircle2 className="w-5 h-5 text-white stroke-[3]" />
                      </motion.div>
                    </motion.div>
                    
                    {/* Background Card */}
                    <div className="absolute -z-10 top-2 left-4 w-56 h-32 bg-apple-gray/20 rounded-2xl border border-apple-border/30 rotate-3" />
                  </div>
                </div>

                <div className="p-8 sm:p-10">
                  <div className="text-center mb-6">
                    <motion.h2 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-2xl sm:text-3xl font-black tracking-tight text-apple-text mb-3"
                    >
                      Get verified on <span className="text-apple-blue">Pakizzle!</span>
                    </motion.h2>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center justify-center gap-2 text-xs font-bold text-apple-text-muted"
                    >
                      <span>Build Trust</span>
                      <div className="w-1 h-1 rounded-full bg-apple-text-muted/40" />
                      <span>Gain Visibility</span>
                      <div className="w-1 h-1 rounded-full bg-apple-text-muted/40" />
                      <span>Unlock Rewards</span>
                    </motion.div>
                  </div>

                  <div className="h-px bg-apple-border/50 w-full mb-8" />

                  <div className="space-y-6 mb-8">
                    {[
                      { 
                        icon: Zap, 
                        title: "Quick & Simple", 
                        desc: "It only takes a few minutes",
                        color: "text-orange-500",
                        bg: "bg-orange-500/10"
                      },
                      { 
                        icon: ShieldCheck, 
                        title: "Secure", 
                        desc: "Your ID information stays private",
                        color: "text-apple-blue",
                        bg: "bg-apple-blue/10"
                      }
                    ].map((item, i) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + (i * 0.1) }}
                        className="flex items-center gap-5 group"
                      >
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform", item.bg)}>
                          <item.icon className={cn("w-7 h-7 stroke-[1.5]", item.color)} />
                        </div>
                        <div>
                          <h4 className="font-bold text-apple-text text-lg leading-tight mb-0.5">{item.title}</h4>
                          <p className="text-apple-text-muted text-sm font-medium">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-center mb-10"
                  >
                    <button className="text-apple-blue font-bold text-sm hover:underline underline-offset-4 decoration-2 transition-all">
                      Learn more of verification on Pakizzle
                    </button>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex items-center justify-end gap-4"
                  >
                    <button 
                      onClick={handleClose}
                      className="px-8 py-3.5 rounded-xl font-bold text-apple-text bg-white dark:bg-apple-card-bg border border-apple-border hover:bg-apple-gray transition-all active:scale-[0.98] text-sm"
                    >
                      Later
                    </button>
                    <button 
                      onClick={handleNext}
                      className="px-8 py-3.5 rounded-xl font-bold text-white bg-apple-text hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2 group"
                    >
                      Get Verified
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                </div>
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col h-full"
              >
                {/* Header */}
                <div className="p-6 border-b border-apple-border flex items-center justify-between">
                  <h3 className="text-lg font-bold text-apple-text">
                    {step === 'front' ? 'Take the first photo - front of the Emirates ID' : 'Take the second photo - back of the Emirates ID'}
                  </h3>
                  <button onClick={handleClose} className="p-2 hover:bg-apple-gray rounded-full transition-colors">
                    <X className="w-5 h-5 text-apple-text-muted" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="px-6 py-4 flex gap-2">
                  <div className={cn("h-1 flex-1 rounded-full transition-colors", step === 'front' || step === 'back' || step === 'success' ? "bg-apple-red" : "bg-apple-gray")} />
                  <div className={cn("h-1 flex-1 rounded-full transition-colors", step === 'back' || step === 'success' ? "bg-apple-red" : "bg-apple-gray")} />
                  <div className={cn("h-1 flex-1 rounded-full transition-colors", step === 'success' ? "bg-apple-red" : "bg-apple-gray")} />
                </div>

                {/* Step Indicators */}
                <div className="px-6 py-2 flex items-center justify-between relative">
                  <div className="absolute left-6 right-6 top-1/2 h-px bg-apple-border -z-10" />
                  <div className="flex items-center gap-3 bg-apple-bg pr-4">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors", step === 'front' ? "bg-black text-white" : "bg-apple-gray text-apple-text-muted")}>1</div>
                    <span className={cn("text-sm font-bold", step === 'front' ? "text-apple-text" : "text-apple-text-muted")}>Front of ID</span>
                  </div>
                  <div className="flex items-center gap-3 bg-apple-bg pl-4">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors", step === 'back' ? "bg-black text-white" : "bg-apple-gray text-apple-text-muted")}>2</div>
                    <span className={cn("text-sm font-bold", step === 'back' ? "text-apple-text" : "text-apple-text-muted")}>Back of ID</span>
                  </div>
                </div>

                {/* Illustration Area */}
                <div className="flex-1 p-8 flex flex-col items-center justify-center">
                  <div className="relative w-full max-w-[320px] aspect-[1.6/1] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-apple-blue/5 dark:to-purple-500/5 rounded-2xl shadow-xl border border-apple-border/50 p-6 flex flex-col justify-between overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-apple-blue/5 rounded-full blur-3xl -mr-16 -mt-16" />
                    
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-apple-gray/50 flex items-center justify-center overflow-hidden border-2 border-white/50">
                        <User className="w-8 h-8 text-apple-text-muted" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="w-24 h-2.5 bg-apple-gray/60 rounded-full" />
                        <div className="w-16 h-2 bg-apple-gray/40 rounded-full" />
                      </div>
                    </div>

                    <div className="text-center space-y-1">
                      <div className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest">ID Number</div>
                      <div className="text-sm font-mono font-bold text-apple-text tracking-wider">000-0000-000000-0</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="w-full h-2 bg-apple-gray/30 rounded-full" />
                      <div className="w-3/4 h-2 bg-apple-gray/30 rounded-full" />
                    </div>

                    <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-apple-gray/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-apple-text-muted/50" />
                    </div>
                  </div>
                </div>

                {/* Footer Tips */}
                <div className="px-8 py-6 space-y-4">
                  <div className="flex items-start gap-3 text-apple-text-muted">
                    <Lightbulb className="w-5 h-5 text-apple-blue shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">Ensure the details are clear, and ID is not expired</p>
                  </div>
                  <button className="flex items-center gap-2 text-sm font-bold text-apple-text hover:text-apple-blue transition-colors group">
                    Try the app
                    <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                  </button>
                </div>

                {/* Action Footer */}
                <div className="p-6 border-t border-apple-border flex justify-end">
                  <button 
                    onClick={handleNext}
                    className="px-8 py-3.5 rounded-xl font-bold text-white bg-apple-red hover:bg-red-700 transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2 group"
                  >
                    Take Photo
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
