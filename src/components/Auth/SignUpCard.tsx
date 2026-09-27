import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Loader2, 
  ArrowRight, 
  Sparkles, 
  Check, 
  ShieldCheck,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { SPRING_SNAPPY } from '../motion';
import { SmartIdentifierInput, parseAndValidateIdentifier, IdentifierType } from './SmartIdentifierInput';
import { PasswordStrengthMeter, calculatePasswordEntropy } from './PasswordStrengthMeter';
import { InlineOtpVerification } from './InlineOtpVerification';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

// High-contrast Google Logo
const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 170 170">
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.83-11.71-14.36-5.65-8.91-10.15-19.12-13.5-30.63-3.35-11.51-5.03-22.38-5.03-32.61 0-14.24 3.63-26.06 10.88-35.46 7.25-9.4 16.59-14.24 28.02-14.53 4.89 0 10.27 1.3 16.14 3.91 5.87 2.61 9.78 3.97 11.74 4.08 1.52-.11 5.6-1.52 12.23-4.24 6.63-2.72 12.39-3.91 17.28-3.59 13.04.87 23.48 5.65 31.3 14.35-11.3 6.85-16.85 16.41-16.63 28.69.22 9.57 3.86 17.61 10.93 24.13 7.07 6.52 15.43 10.22 25.11 11.09-2.07 6.52-4.45 13.15-7.17 19.89zM119.22 31.84c0-7.39 2.66-14.46 7.99-21.2C132.53 3.9 139.11.22 146.94 0c.22 1.3.33 2.5.33 3.59 0 7.39-2.83 14.67-8.48 21.85-5.65 7.17-12.55 11.03-20.71 11.57-.43-1.74-.66-3.47-.66-5.17z" />
  </svg>
);

interface SignUpCardProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
  className?: string;
}

export const SignUpCard: React.FC<SignUpCardProps> = ({
  onSuccess,
  onSwitchToSignIn,
  className,
}) => {
  const { 
    signIn: signInWithGoogle, 
    signInWithApple, 
    signUpWithEmail, 
    sendOtp, 
    verifyOtp,
    sendPhoneOtp,
    verifyPhoneOtp,
    setOtpVerified
  } = useAuth();

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [parsedIdentifier, setParsedIdentifier] = useState(parseAndValidateIdentifier(''));
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSocialSubmitting, setIsSocialSubmitting] = useState<'google' | 'apple' | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Step state: 'details' -> 'inline-otp' -> 'complete'
  const [authStep, setAuthStep] = useState<'details' | 'inline-otp'>('details');

  // Password entropy analysis
  const passwordAnalysis = useMemo(() => calculatePasswordEntropy(password), [password]);

  // Form validity
  const isFormValid = useMemo(() => {
    return (
      fullName.trim().length >= 2 &&
      parsedIdentifier.isValid &&
      password.length >= 8 &&
      passwordAnalysis.score >= 2 &&
      agreedToTerms
    );
  }, [fullName, parsedIdentifier, password, passwordAnalysis, agreedToTerms]);

  // Handle Social Sign-in
  const handleGoogleSignIn = async () => {
    try {
      setIsSocialSubmitting('google');
      setGeneralError(null);
      await signInWithGoogle();
      toast.success('Successfully connected with Google');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setGeneralError(err?.message || 'Unable to connect with Google. Please try again.');
    } finally {
      setIsSocialSubmitting(null);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsSocialSubmitting('apple');
      setGeneralError(null);
      await signInWithApple();
      toast.success('Successfully connected with Apple ID');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setGeneralError(err?.message || 'Unable to connect with Apple. Please try again.');
    } finally {
      setIsSocialSubmitting(null);
    }
  };

  // Handle Form Submission -> Transitions to Inline OTP
  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setGeneralError(null);

    try {
      if (parsedIdentifier.type === 'email') {
        // Create basic user record and dispatch email OTP
        await signUpWithEmail(parsedIdentifier.normalized, password, fullName.trim());
        await sendOtp(parsedIdentifier.normalized);
        setAuthStep('inline-otp');
      } else if (parsedIdentifier.type === 'phone') {
        // Dispatches Phone OTP via SMS Gateway
        await sendPhoneOtp(parsedIdentifier.normalized);
        setAuthStep('inline-otp');
      }
    } catch (err: any) {
      const msg = err?.message || 'Unable to create account. Please check your details.';
      if (msg.includes('email-already-in-use') || msg.includes('already exists')) {
        setGeneralError('An account with this email or phone already exists. Please sign in instead.');
      } else {
        setGeneralError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Inline OTP Verification
  const handleVerifyOtp = async (code: string) => {
    setIsSubmitting(true);
    try {
      if (parsedIdentifier.type === 'email') {
        const success = await verifyOtp(parsedIdentifier.normalized, code);
        if (!success) {
          throw new Error('That code expired or was entered incorrectly. We have sent a fresh code.');
        }
      } else {
        const success = await verifyPhoneOtp(parsedIdentifier.normalized, code);
        if (!success) {
          throw new Error('Invalid SMS verification code. Please check your messages.');
        }
      }

      await setOtpVerified(parsedIdentifier.normalized);
      toast.success('Account verified successfully! Welcome to Pakizzle.');
      if (onSuccess) onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (parsedIdentifier.type === 'email') {
      await sendOtp(parsedIdentifier.normalized);
      toast.success(`Fresh verification code sent to ${parsedIdentifier.normalized}`);
    } else {
      await sendPhoneOtp(parsedIdentifier.normalized);
      toast.success(`Fresh SMS code sent to ${parsedIdentifier.normalized}`);
    }
  };

  return (
    <div
      className={cn(
        'w-full max-w-[440px] mx-auto bg-white/95 dark:bg-[#141824]/95 backdrop-blur-2xl rounded-3xl border border-black/10 dark:border-white/10 p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-all',
        className
      )}
    >
      <AnimatePresence mode="wait">
        {authStep === 'details' ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={SPRING_SNAPPY}
            className="space-y-6"
          >
            {/* Header branding */}
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-[#0F766E]/10 text-[#0F766E] dark:text-teal-400 flex items-center justify-center mx-auto mb-2.5">
                <Building2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-apple-text">
                Create Account
              </h2>
              <p className="text-xs text-apple-text-muted">
                One secure identity for verified luxury properties in Pakistan
              </p>
            </div>

            {/* 1. Fast Social Sign-In Buttons (Prominently Above Form) */}
            <div className="space-y-2.5">
              <button
                type="button"
                disabled={!!isSocialSubmitting}
                onClick={handleGoogleSignIn}
                className={cn(
                  'w-full h-12 rounded-xl bg-apple-gray/60 dark:bg-white/5 hover:bg-apple-gray dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-apple-text text-xs font-bold flex items-center justify-center gap-3 transition-all cursor-pointer touch-target min-h-[44px]',
                  'focus:ring-2 focus:ring-apple-blue/20'
                )}
              >
                {isSocialSubmitting === 'google' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-apple-blue" />
                ) : (
                  <GoogleIcon />
                )}
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                disabled={!!isSocialSubmitting}
                onClick={handleAppleSignIn}
                className={cn(
                  'w-full h-12 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer touch-target min-h-[44px]',
                  'hover:opacity-90'
                )}
              >
                {isSocialSubmitting === 'apple' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <AppleIcon />
                )}
                <span>Continue with Apple</span>
              </button>
            </div>

            {/* Visual Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-black/10 dark:bg-white/10" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-apple-text-muted">
                or with email / mobile
              </span>
              <div className="flex-1 h-[1px] bg-black/10 dark:bg-white/10" />
            </div>

            {/* Error Message */}
            {generalError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2 animate-fadeIn">
                <span className="leading-snug">{generalError}</span>
              </div>
            )}

            {/* Single Clean Sign-Up Form */}
            <form onSubmit={handleSubmitDetails} className="space-y-4" noValidate>
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-apple-text tracking-tight">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-text-muted" />
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Tariq Mansoor"
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-apple-gray/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm font-medium focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/15 outline-none touch-target min-h-[44px]"
                  />
                </div>
              </div>

              {/* Smart Identifier: Auto-detects Email vs Phone */}
              <SmartIdentifierInput
                value={identifier}
                onChange={(val, parsed) => {
                  setIdentifier(val);
                  setParsedIdentifier(parsed);
                }}
                label="Email or Mobile Phone"
                placeholder="name@gmail.com or 0300 1234567"
              />

              {/* Password with Real-Time Strength Entropy Indicator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-apple-text tracking-tight">
                    Create Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-semibold text-apple-blue hover:underline flex items-center gap-1 cursor-pointer touch-target min-h-[32px]"
                  >
                    {showPassword ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Show</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full h-12 pl-10 pr-10 rounded-xl bg-apple-gray/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm font-medium focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/15 outline-none touch-target min-h-[44px]"
                  />
                </div>

                {/* Password Entropy Analysis */}
                <PasswordStrengthMeter
                  analysis={passwordAnalysis}
                  visible={password.length > 0}
                />
              </div>

              {/* Explicit Consent Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-4.5 h-4.5 mt-0.5 rounded border-black/20 dark:border-white/20 text-apple-blue focus:ring-apple-blue/20 cursor-pointer"
                  />
                  <span className="text-[11px] text-apple-text-muted leading-relaxed">
                    I agree to the{' '}
                    <a href="#" className="font-semibold text-apple-text underline">
                      Terms of Service
                    </a>{' '}
                    and acknowledge the{' '}
                    <a href="#" className="font-semibold text-apple-text underline">
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>
              </div>

              {/* Primary Submit Button */}
              <motion.button
                type="submit"
                whileTap={{ scale: 0.98 }}
                transition={SPRING_SNAPPY}
                disabled={!isFormValid || isSubmitting}
                className={cn(
                  'w-full h-12 rounded-xl bg-apple-blue text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-apple-blue/25 transition-all cursor-pointer touch-target min-h-[44px]',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Preparing Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Switch to Sign In */}
            <div className="text-center pt-2 border-t border-black/5 dark:border-white/5">
              <p className="text-xs text-apple-text-muted">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToSignIn}
                  className="font-bold text-apple-blue hover:underline cursor-pointer touch-target min-h-[36px]"
                >
                  Sign In
                </button>
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="inline-otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={SPRING_SNAPPY}
          >
            <InlineOtpVerification
              destination={parsedIdentifier.normalized}
              isPhone={parsedIdentifier.type === 'phone'}
              onVerify={handleVerifyOtp}
              onResend={handleResendOtp}
              onBackToEdit={() => setAuthStep('details')}
              isLoading={isSubmitting}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
