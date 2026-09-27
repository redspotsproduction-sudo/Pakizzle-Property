import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Fingerprint, 
  KeyRound, 
  Smartphone, 
  Mail, 
  Lock, 
  X, 
  Loader2, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  ChevronLeft,
  LifeBuoy
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { SPRING_SNAPPY } from '../motion';
import { InlineOtpVerification } from './InlineOtpVerification';
import { authenticateWithPasskey } from '../../lib/passkey';
import { toast } from 'sonner';

export type SensitiveActionType = 
  | 'phone_change'
  | 'payout_update'
  | 'account_deletion'
  | 'property_unlisting'
  | 'first_listing';

interface StepUpVerificationModalProps {
  isOpen: boolean;
  action: SensitiveActionType;
  onSuccess: () => void;
  onClose: () => void;
  customTitle?: string;
  customContext?: string;
}

export const StepUpVerificationModal: React.FC<StepUpVerificationModalProps> = ({
  isOpen,
  action,
  onSuccess,
  onClose,
  customTitle,
  customContext,
}) => {
  // Method selection: 'menu' | 'password' | 'phone_otp' | 'email_otp' | 'passkey'
  const [method, setMethod] = useState<'menu' | 'password' | 'phone_otp' | 'email_otp'>('menu');

  // Loading & server states
  const [isCheckingElevation, setIsCheckingElevation] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Challenge metadata from server
  const [challengeData, setChallengeData] = useState<{
    alreadyElevated: boolean;
    title: string;
    context: string;
    options: {
      hasPasskey: boolean;
      phone: string | null;
      email: string | null;
      allowPassword: boolean;
    };
  } | null>(null);

  // Form states
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Initialize and check if already elevated
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsCheckingElevation(true);
    setErrorMessage(null);
    setMethod('menu');
    setPassword('');

    const token = localStorage.getItem('pakizzle_token');
    fetch('/api/auth/step-up/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ action }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.alreadyElevated) {
          // Already within 10-min elevation window
          toast.success('Session already elevated for sensitive actions.');
          onSuccess();
          return;
        }
        setChallengeData(data);
      })
      .catch((err) => {
        console.warn('Step-up initiate error:', err);
      })
      .finally(() => {
        if (isMounted) setIsCheckingElevation(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, action]);

  if (!isOpen) return null;

  // 1. Password Verification
  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem('pakizzle_token');
      const res = await fetch('/api/auth/step-up/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Incorrect password.');
      }

      toast.success('Identity confirmed. Session elevated.');
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Incorrect password. Please verify and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Dispatch OTP (Phone or Email)
  const handleSendOtp = async (targetMethod: 'phone' | 'email') => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem('pakizzle_token');
      const res = await fetch('/api/auth/step-up/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action, method: targetMethod }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Unable to send ${targetMethod} code.`);
      }

      setMethod(targetMethod === 'phone' ? 'phone_otp' : 'email_otp');
      toast.success(`Verification code dispatched to ${targetMethod === 'phone' ? challengeData?.options.phone : challengeData?.options.email}`);
    } catch (err: any) {
      setErrorMessage(err.message || `Unable to send code right now.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Verify OTP
  const handleVerifyOtp = async (code: string) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem('pakizzle_token');
      const otpType = method === 'phone_otp' ? 'phone' : 'email';
      const res = await fetch('/api/auth/step-up/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action, method: otpType, code }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid verification code.');
      }

      toast.success('Identity confirmed. Session elevated.');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Invalid code.');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Biometric Passkey Step-Up
  const handlePasskeyStepUp = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await authenticateWithPasskey();
      if (!result.success) {
        throw new Error(result.error || 'Passkey verification was cancelled.');
      }

      // Elevate on server
      const token = localStorage.getItem('pakizzle_token');
      const res = await fetch('/api/auth/step-up/verify-passkey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          action,
          credential: { id: result.user?.id || 'cred_verified' },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Passkey elevation failed on server.');
      }

      toast.success('Biometric identity confirmed. Session elevated.');
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Passkey verification failed. Please try another method.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = customTitle || challengeData?.title || 'Security Confirmation';
  const context = customContext || challengeData?.context || 'Secondary identity confirmation required for this sensitive action.';

  return (
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.96 }}
        transition={SPRING_SNAPPY}
        className={cn(
          'w-full sm:max-w-[460px] bg-white dark:bg-[#141824] rounded-t-[32px] sm:rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto',
          'pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]'
        )}
      >
        {/* Top bar with security badge & dismiss */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Step-Up Security Protocol
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-apple-gray dark:bg-white/5 flex items-center justify-center text-apple-text-muted hover:text-apple-text transition-colors cursor-pointer touch-target min-h-[36px]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Header Icon & Context */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-apple-text">
            {title}
          </h3>
          <p className="text-xs text-apple-text-muted leading-relaxed max-w-sm mx-auto">
            {context}
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* Loading state while checking elevation */}
        {isCheckingElevation ? (
          <div className="py-8 text-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-apple-blue mx-auto" />
            <p className="text-xs text-apple-text-muted">Verifying current security clearance...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* VIEW 1: METHOD SELECTION MENU */}
            {method === 'menu' && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={SPRING_SNAPPY}
                className="space-y-3"
              >
                <p className="text-[11px] font-bold uppercase tracking-wider text-apple-text-muted px-1">
                  Choose Confirmation Method
                </p>

                {/* 1. Biometric Passkey (Fastest) */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handlePasskeyStepUp}
                  className="w-full p-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-left flex items-center justify-between gap-3 transition-all cursor-pointer touch-target min-h-[52px]"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Fingerprint className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-emerald-950 dark:text-emerald-300">
                        Face ID / Touch ID (Passkey)
                      </h4>
                      <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400">
                        1-touch verification on this device
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
                </button>

                {/* 2. Registered Phone SMS OTP */}
                {challengeData?.options.phone && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSendOtp('phone')}
                    className="w-full p-4 rounded-2xl bg-white dark:bg-[#141824] hover:bg-apple-gray/50 dark:hover:bg-white/5 border border-black/10 dark:border-white/10 text-left flex items-center justify-between gap-3 transition-all cursor-pointer touch-target min-h-[52px]"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-apple-blue/10 text-apple-blue flex items-center justify-center shrink-0">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-apple-text">
                          SMS Verification Code
                        </h4>
                        <p className="text-[10px] text-apple-text-muted font-mono">
                          Send to {challengeData.options.phone}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-apple-text-muted shrink-0" />
                  </button>
                )}

                {/* 3. Account Password Re-entry */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setMethod('password')}
                  className="w-full p-4 rounded-2xl bg-white dark:bg-[#141824] hover:bg-apple-gray/50 dark:hover:bg-white/5 border border-black/10 dark:border-white/10 text-left flex items-center justify-between gap-3 transition-all cursor-pointer touch-target min-h-[52px]"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-apple-text">
                        Account Password
                      </h4>
                      <p className="text-[10px] text-apple-text-muted">
                        Re-enter your account password
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-apple-text-muted shrink-0" />
                </button>

                {/* 4. Lost Phone Fallback (Email Verification) */}
                {challengeData?.options.email && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSendOtp('email')}
                      className="text-xs font-semibold text-apple-text-muted hover:text-apple-blue inline-flex items-center gap-1.5 cursor-pointer touch-target min-h-[36px]"
                    >
                      <LifeBuoy className="w-3.5 h-3.5" />
                      <span>Lost access to phone? Verify with email ({challengeData.options.email})</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* VIEW 2: PASSWORD RE-ENTRY */}
            {method === 'password' && (
              <motion.form
                key="password"
                onSubmit={handleVerifyPassword}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={SPRING_SNAPPY}
                className="space-y-4"
              >
                <button
                  type="button"
                  onClick={() => setMethod('menu')}
                  className="text-xs font-bold text-apple-text-muted hover:text-apple-text inline-flex items-center gap-1 cursor-pointer touch-target min-h-[32px]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Choose another method</span>
                </button>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-apple-text">
                      Account Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] font-semibold text-apple-blue hover:underline cursor-pointer"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-text-muted" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoFocus
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password to confirm"
                      className="w-full h-12 pl-10 pr-10 rounded-xl bg-apple-gray/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm font-medium focus:border-apple-blue outline-none touch-target min-h-[44px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!password || isSubmitting}
                  className="w-full h-12 rounded-xl bg-apple-blue text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-apple-blue/20 hover:bg-apple-blue/90 cursor-pointer touch-target min-h-[44px] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Confirming...</span>
                    </>
                  ) : (
                    <span>Confirm & Elevate Session</span>
                  )}
                </button>
              </motion.form>
            )}

            {/* VIEW 3: OTP VERIFICATION (PHONE OR EMAIL) */}
            {(method === 'phone_otp' || method === 'email_otp') && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={SPRING_SNAPPY}
              >
                <InlineOtpVerification
                  destination={method === 'phone_otp' ? (challengeData?.options.phone || 'Phone') : (challengeData?.options.email || 'Email')}
                  isPhone={method === 'phone_otp'}
                  onVerify={handleVerifyOtp}
                  onResend={() => handleSendOtp(method === 'phone_otp' ? 'phone' : 'email')}
                  onBackToEdit={() => setMethod('menu')}
                  isLoading={isSubmitting}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Temporary Elevation Note */}
        <div className="pt-2 border-t border-black/5 dark:border-white/5 text-center">
          <p className="text-[10px] text-apple-text-muted flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Elevation remains active for 10 minutes to prevent repeated prompts.</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
