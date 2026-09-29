import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  ChevronLeft, 
  RotateCcw, 
  Smartphone, 
  Mail, 
  ShieldCheck,
  Check,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { SPRING_SNAPPY } from '../motion';
import { SmartIdentifierInput, parseAndValidateIdentifier, IdentifierType } from './SmartIdentifierInput';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ForgotPasswordCardProps {
  initialIdentifier?: string;
  onSuccess?: () => void;
  onBackToSignIn?: () => void;
  className?: string;
}

type ForgotStep = 'request' | 'verify' | 'new_password' | 'success';

export const ForgotPasswordCard: React.FC<ForgotPasswordCardProps> = ({
  initialIdentifier = '',
  onSuccess,
  onBackToSignIn,
  className,
}) => {
  const navigate = useNavigate();

  // Step state
  const [step, setStep] = useState<ForgotStep>('request');

  // Step 1: Identifier Entry
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [parsedIdentifier, setParsedIdentifier] = useState(() => parseAndValidateIdentifier(initialIdentifier));
  const [maskedIdentifier, setMaskedIdentifier] = useState('');
  const [preferredMethod, setPreferredMethod] = useState<'email' | 'sms'>('email');
  const [hasAlternativeMethod, setHasAlternativeMethod] = useState(false);

  // Step 2: 6-Digit OTP Verification
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [codeTtlSeconds, setCodeTtlSeconds] = useState<number>(900); // 15:00
  const [resendCooldown, setResendCooldown] = useState<number>(30);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isLockedOut, setIsLockedOut] = useState<boolean>(false);
  const [lockoutMinutes, setLockoutMinutes] = useState<number>(0);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Step 3: New Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // General loading & feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 15-Minute Expiry Countdown Timer
  useEffect(() => {
    if (step !== 'verify') return;
    if (codeTtlSeconds <= 0) {
      setIsExpired(true);
      return;
    }
    const timer = setInterval(() => {
      setCodeTtlSeconds((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step, codeTtlSeconds]);

  // 30-Second Resend Cooldown Timer
  useEffect(() => {
    if (step !== 'verify' || resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  // WebOTP API auto-read for SMS on mobile browsers
  useEffect(() => {
    if (step !== 'verify') return;
    if (typeof window !== 'undefined' && 'OTPCredential' in window) {
      const abortController = new AbortController();
      (navigator.credentials as any)
        ?.get({
          otp: { transport: ['sms'] },
          signal: abortController.signal,
        })
        .then((otpCredential: any) => {
          if (otpCredential && otpCredential.code) {
            const rawCode = otpCredential.code.trim();
            if (/^\d{6}$/.test(rawCode)) {
              const newDigits = rawCode.split('');
              setDigits(newDigits);
              submitOtpCode(rawCode);
            }
          }
        })
        .catch(() => {});

      return () => {
        abortController.abort();
      };
    }
  }, [step]);

  // Password Strength Checklist Calculation
  const hasLength = newPassword.length >= 8;
  const hasNumber = /[0-9]/.test(newPassword);
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isPasswordValid = hasLength && hasNumber && hasUpper && hasLower && isMatch;

  // Format mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // ==========================================
  // STEP 1: INITIATE RESET REQUEST
  // ==========================================
  const handleRequestCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!parsedIdentifier.isValid || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/forgot/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: parsedIdentifier.normalized,
          preferredMethod,
        }),
      });

      const data = await res.json();

      if (res.status === 429) {
        if (data.code === 'account_locked') {
          setIsLockedOut(true);
          setLockoutMinutes(data.retryAfterMinutes || 60);
        }
        throw new Error(data.error || 'Too many requests. Please wait a few minutes.');
      }

      if (!res.ok) {
        throw new Error(data.error || 'Unable to send recovery code.');
      }

      setMaskedIdentifier(data.masked || parsedIdentifier.normalized);
      setCodeTtlSeconds(data.ttlSeconds || 900);
      setResendCooldown(30);
      setIsExpired(false);
      setAttemptsRemaining(null);
      setDigits(['', '', '', '', '', '']);
      setHasAlternativeMethod(Boolean(data.hasAlternativeMethod));

      if (data.channel === 'sms') {
        setPreferredMethod('sms');
      }

      setStep('verify');
      toast.success(data.message || 'Verification code sent!');
      
      // Auto-focus first digit input on next tick
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to send reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // STEP 2: VERIFY 6-DIGIT OTP
  // ==========================================
  const handleDigitChange = (index: number, value: string) => {
    const char = value.slice(-1);
    if (!/^\d*$/.test(char)) return;

    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = newDigits.join('');
    if (fullCode.length === 6 && !newDigits.includes('')) {
      submitOtpCode(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const pasteDigits = pasteData.split('');
      setDigits(pasteDigits);
      inputRefs.current[5]?.focus();
      submitOtpCode(pasteData);
    }
  };

  const submitOtpCode = async (code: string) => {
    if (isLoading || isExpired || isLockedOut) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/forgot/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: parsedIdentifier.normalized,
          code,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'account_locked') {
          setIsLockedOut(true);
          setLockoutMinutes(data.retryAfterMinutes || 60);
        } else if (data.expired) {
          setIsExpired(true);
        } else if (typeof data.attemptsRemaining === 'number') {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        throw new Error(data.error || 'Verification code failed.');
      }

      setResetToken(data.resetToken);
      setStep('new_password');
      toast.success('Code confirmed! Create your new password.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/forgot/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: parsedIdentifier.normalized,
          preferredMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to resend code.');
      }

      setCodeTtlSeconds(data.ttlSeconds || 900);
      setResendCooldown(30);
      setIsExpired(false);
      setAttemptsRemaining(null);
      setDigits(['', '', '', '', '', '']);
      toast.success('Fresh verification code sent!');
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // STEP 3: SUBMIT NEW PASSWORD
  // ==========================================
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid || isLoading || !resetToken) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/forgot/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetToken,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'token_expired') {
          // Token expired, restart flow
          setStep('request');
        }
        throw new Error(data.error || 'Password update failed.');
      }

      // Store fresh JWT token
      if (data.token) {
        try {
          localStorage.setItem('pakizzle_token', data.token);
        } catch (e) {}
      }

      setStep('success');
      toast.success('Password reset successfully!');

      // Redirect to dashboard after brief meaningful animation
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/dashboard');
        }
      }, 1600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to set new password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        'w-full max-w-[440px] mx-auto bg-white/95 dark:bg-[#141824]/95 backdrop-blur-2xl rounded-3xl border border-black/10 dark:border-white/10 p-5 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-all',
        className
      )}
    >
      <AnimatePresence mode="wait">
        {/* ==================================================== */}
        {/* STEP 1: IDENTIFIER-FIRST RECOVERY REQUEST            */}
        {/* ==================================================== */}
        {step === 'request' && (
          <motion.div
            key="step-request"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={SPRING_SNAPPY}
            className="space-y-4 sm:space-y-6"
          >
            {/* Header */}
            <div className="text-center space-y-1">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-apple-text">
                Reset Password
              </h2>
              <p className="text-[11px] sm:text-xs text-apple-text-muted leading-relaxed max-w-xs mx-auto">
                Enter your email address or mobile number to receive a secure 6-digit recovery code.
              </p>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Account Lockout Banner */}
            {isLockedOut && (
              <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  <span>Account Temporarily Protected</span>
                </div>
                <p className="leading-relaxed">
                  Multiple failed recovery cycles detected. For your protection, password reset is paused for {lockoutMinutes} minutes.
                </p>
              </div>
            )}

            <form onSubmit={handleRequestCode} className="space-y-4">
              <SmartIdentifierInput
                value={identifier}
                onChange={(val, res) => {
                  setIdentifier(val);
                  setParsedIdentifier(res);
                  setErrorMessage(null);
                }}
                disabled={isLoading || isLockedOut}
                placeholder="Email or phone (e.g. 0300 1234567)"
                autoFocus
              />

              {/* Delivery method preference if phone entered */}
              {parsedIdentifier.type === 'phone' && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-apple-gray/50 dark:bg-white/5 border border-black/5 dark:border-white/5 text-xs">
                  <span className="text-apple-text-muted">Send code via:</span>
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => setPreferredMethod('sms')}
                      className={cn(
                        'px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer touch-target min-h-[32px]',
                        preferredMethod === 'sms'
                          ? 'bg-apple-blue text-white shadow-xs'
                          : 'text-apple-text-muted hover:text-apple-text'
                      )}
                    >
                      SMS
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreferredMethod('email')}
                      className={cn(
                        'px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer touch-target min-h-[32px]',
                        preferredMethod === 'email'
                          ? 'bg-apple-blue text-white shadow-xs'
                          : 'text-apple-text-muted hover:text-apple-text'
                      )}
                    >
                      Email
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!parsedIdentifier.isValid || isLoading || isLockedOut}
                className={cn(
                  'w-full h-12 rounded-xl bg-apple-blue text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer touch-target min-h-[44px]',
                  'shadow-lg shadow-apple-blue/20 hover:bg-apple-blue/90 disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Back to Sign-in */}
            <div className="pt-2 text-center border-t border-black/5 dark:border-white/5">
              <button
                type="button"
                onClick={onBackToSignIn || (() => navigate('/login'))}
                className="text-xs font-bold text-apple-text-muted hover:text-apple-text inline-flex items-center gap-1.5 cursor-pointer touch-target min-h-[36px]"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Return to Sign In</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ==================================================== */}
        {/* STEP 2: 6-DIGIT OTP VERIFICATION                     */}
        {/* ==================================================== */}
        {step === 'verify' && (
          <motion.div
            key="step-verify"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={SPRING_SNAPPY}
            className="space-y-3.5 sm:space-y-6"
          >
            {/* Top Navigation */}
            <div className="flex items-center justify-between pb-1.5 sm:pb-2 border-b border-black/5 dark:border-white/5">
              <button
                type="button"
                onClick={() => setStep('request')}
                className="text-xs font-bold text-apple-text-muted hover:text-apple-text inline-flex items-center gap-1 cursor-pointer touch-target min-h-[32px]"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Edit address</span>
              </button>

              <span className="text-[11px] font-mono font-bold text-apple-text-muted">
                Expires in {formatTime(codeTtlSeconds)}
              </span>
            </div>

            {/* Header */}
            <div className="text-center space-y-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-apple-blue/10 text-apple-blue flex items-center justify-center mx-auto mb-1.5 sm:mb-2.5">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-apple-text">
                Enter 6-Digit Code
              </h2>
              <p className="text-[11px] sm:text-xs text-apple-text-muted leading-relaxed">
                If an account exists for <span className="font-semibold text-apple-text font-mono">{maskedIdentifier}</span>, we've dispatched a recovery code.
              </p>
            </div>

            {/* Error or Attempt Count Banner */}
            {errorMessage && (
              <div className="p-3 sm:p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="leading-snug block">{errorMessage}</span>
                  {isExpired && (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="text-xs font-bold text-apple-blue hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Request a fresh code now</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 6 Digit Inputs */}
            <div className="flex items-center justify-between gap-1.5 sm:gap-2">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  autoComplete="one-time-code"
                  disabled={isLoading || isExpired || isLockedOut}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={idx === 0 ? handlePaste : undefined}
                  className={cn(
                    'w-10 h-13 sm:w-13 sm:h-16 text-center text-lg sm:text-2xl font-bold font-mono rounded-xl sm:rounded-2xl transition-all outline-none',
                    'bg-apple-gray/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-apple-text',
                    'focus:border-apple-blue focus:ring-4 focus:ring-apple-blue/10 dark:focus:ring-apple-blue/20',
                    digit ? 'border-apple-blue/50 dark:border-apple-blue/50' : ''
                  )}
                />
              ))}
            </div>

            {/* Verify CTA */}
            <button
              type="button"
              disabled={digits.join('').length !== 6 || isLoading || isExpired || isLockedOut}
              onClick={() => submitOtpCode(digits.join(''))}
              className={cn(
                'w-full h-12 rounded-xl bg-apple-blue text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer touch-target min-h-[44px]',
                'shadow-lg shadow-apple-blue/20 hover:bg-apple-blue/90 disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying code...</span>
                </>
              ) : (
                <span>Verify Code</span>
              )}
            </button>

            {/* Resend Logic with Cooldown */}
            <div className="pt-2 text-center space-y-1">
              {resendCooldown > 0 ? (
                <p className="text-xs text-apple-text-muted">
                  Resend code available in{' '}
                  <span className="font-mono font-bold text-apple-text">
                    {resendCooldown}s
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleResendCode}
                  className="text-xs font-bold text-apple-blue hover:underline inline-flex items-center gap-1.5 cursor-pointer touch-target min-h-[36px]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Resend 6-digit code</span>
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ==================================================== */}
        {/* STEP 3: SET NEW PASSWORD                             */}
        {/* ==================================================== */}
        {step === 'new_password' && (
          <motion.div
            key="step-password"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={SPRING_SNAPPY}
            className="space-y-6"
          >
            {/* Header */}
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2.5">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-apple-text">
                Create New Password
              </h2>
              <p className="text-xs text-apple-text-muted leading-relaxed max-w-xs mx-auto">
                Choose a strong password to protect your verified portfolio. All previous sessions will be signed out.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* Field 1: New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-apple-text">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    autoFocus
                    required
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="Enter 8+ characters"
                    className="w-full h-12 pl-4 pr-11 rounded-xl bg-apple-gray/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs text-apple-text outline-none focus:border-apple-blue touch-target min-h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-apple-text-muted hover:text-apple-text transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Field 2: Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-apple-text">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="Re-type password"
                    className="w-full h-12 pl-4 pr-11 rounded-xl bg-apple-gray/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs text-apple-text outline-none focus:border-apple-blue touch-target min-h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-apple-text-muted hover:text-apple-text transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Live Password Strength Checklist */}
              <div className="p-3.5 rounded-2xl bg-apple-gray/40 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-apple-text-muted mb-2">
                  Password Requirements
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className={cn('flex items-center gap-1.5 transition-colors', hasLength ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-apple-text-muted')}>
                    {hasLength ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-apple-text-muted" />}
                    <span>8+ characters</span>
                  </div>

                  <div className={cn('flex items-center gap-1.5 transition-colors', hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-apple-text-muted')}>
                    {hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-apple-text-muted" />}
                    <span>At least one number</span>
                  </div>

                  <div className={cn('flex items-center gap-1.5 transition-colors', hasUpper && hasLower ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-apple-text-muted')}>
                    {hasUpper && hasLower ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-apple-text-muted" />}
                    <span>Upper & lower case</span>
                  </div>

                  <div className={cn('flex items-center gap-1.5 transition-colors', isMatch ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-apple-text-muted')}>
                    {isMatch ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-apple-text-muted" />}
                    <span>Passwords match</span>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={!isPasswordValid || isLoading}
                className={cn(
                  'w-full h-12 rounded-xl bg-apple-blue text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer touch-target min-h-[44px]',
                  'shadow-lg shadow-apple-blue/20 hover:bg-apple-blue/90 disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating password...</span>
                  </>
                ) : (
                  <span>Set New Password & Sign In</span>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* ==================================================== */}
        {/* STEP 4: SUCCESS WITH MEANINGFUL COMPLETION ANIMATION */}
        {/* ==================================================== */}
        {step === 'success' && (
          <motion.div
            key="step-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={SPRING_SNAPPY}
            className="py-8 text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-bold tracking-tight text-apple-text">
                Password Updated!
              </h3>
              <p className="text-xs text-apple-text-muted max-w-xs mx-auto leading-relaxed">
                All other active sessions have been signed out. Redirecting you to your portfolio...
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2 text-xs font-semibold text-apple-blue">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Launching dashboard session...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
