import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, RotateCcw, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SPRING_SNAPPY } from '../motion';

interface InlineOtpVerificationProps {
  destination: string; // e.g. "j***@gmail.com" or "+92 300 ***4567"
  isPhone?: boolean;
  onVerify: (code: string) => Promise<boolean | void>;
  onResend: () => Promise<void>;
  onBackToEdit?: () => void;
  isLoading?: boolean;
}

export const InlineOtpVerification: React.FC<InlineOtpVerificationProps> = ({
  destination,
  isPhone = false,
  onVerify,
  onResend,
  onBackToEdit,
  isLoading = false,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState<number>(60);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // WebOTP API detection for seamless mobile SMS autofill
  useEffect(() => {
    if (typeof window !== 'undefined' && 'OTPCredential' in window && isPhone) {
      const abortController = new AbortController();
      (navigator.credentials as any)
        .get({
          otp: { transport: ['sms'] },
          signal: abortController.signal,
        })
        .then((otpCredential: any) => {
          if (otpCredential && otpCredential.code) {
            const rawCode = otpCredential.code.trim();
            if (/^\d{6}$/.test(rawCode)) {
              const newDigits = rawCode.split('');
              setDigits(newDigits);
              onVerify(rawCode);
            }
          }
        })
        .catch(() => {
          // WebOTP aborted or unsupported; gracefully fall back to manual input
        });

      return () => {
        abortController.abort();
      };
    }
  }, [isPhone, onVerify]);

  // Focus first input on mount
  useEffect(() => {
    const firstInput = inputRefs.current[0];
    if (firstInput) {
      firstInput.focus();
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleInputChange = (index: number, value: string) => {
    setErrorMessage(null);
    // Allow only numeric characters
    const cleanValue = value.replace(/[^0-9]/g, '');

    if (cleanValue.length > 1) {
      // User pasted or typed multiple digits
      handlePasteCode(cleanValue);
      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = cleanValue;
    setDigits(nextDigits);

    // Auto-advance
    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits are populated
    if (cleanValue && index === 5) {
      const fullCode = nextDigits.join('');
      if (fullCode.length === 6) {
        handleSubmit(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').trim();
    handlePasteCode(pastedText);
  };

  const handlePasteCode = (code: string) => {
    const numeric = code.replace(/[^0-9]/g, '').slice(0, 6);
    if (!numeric) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = numeric[i] || '';
    }
    setDigits(newDigits);

    const targetIndex = Math.min(numeric.length, 5);
    inputRefs.current[targetIndex]?.focus();

    if (numeric.length === 6) {
      handleSubmit(numeric);
    }
  };

  const handleSubmit = async (codeToSubmit?: string) => {
    const code = codeToSubmit || digits.join('');
    if (code.length < 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    try {
      await onVerify(code);
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'That verification code is incorrect or expired. Please check and try again.'
      );
      // Auto-clear last digit for convenience
      const updated = [...digits];
      updated[5] = '';
      setDigits(updated);
      inputRefs.current[5]?.focus();
    }
  };

  const handleResendClick = async () => {
    if (timer > 0 || isResending) return;
    setIsResending(true);
    setErrorMessage(null);
    try {
      await onResend();
      setTimer(60);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMessage('Unable to resend code right now. Please wait a moment and retry.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header Info */}
      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 rounded-2xl bg-apple-blue/10 text-apple-blue flex items-center justify-center mx-auto mb-2">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-apple-text tracking-tight">
          Verify Security Code
        </h3>
        <p className="text-xs text-apple-text-muted max-w-xs mx-auto leading-relaxed">
          We sent a 6-digit confirmation code to{' '}
          <span className="font-semibold text-apple-text font-mono break-all">
            {destination}
          </span>
          {onBackToEdit && (
            <button
              type="button"
              onClick={onBackToEdit}
              className="text-apple-blue font-semibold hover:underline ml-1 inline cursor-pointer"
            >
              (change)
            </button>
          )}
        </p>
      </div>

      {/* 6-Cell Responsive Code Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              value={digit}
              disabled={isLoading}
              onChange={(e) => handleInputChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={cn(
                'w-11 sm:w-12 h-13 sm:h-14 text-center text-xl sm:text-2xl font-mono font-extrabold rounded-xl border bg-apple-gray/40 dark:bg-white/5 transition-all outline-none',
                'touch-target min-w-[42px] min-h-[44px]',
                digit ? 'border-apple-blue bg-apple-blue/5 text-apple-text' : 'border-black/10 dark:border-white/10 text-apple-text',
                'focus:border-apple-blue focus:ring-4 focus:ring-apple-blue/15'
              )}
            />
          ))}
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        transition={SPRING_SNAPPY}
        disabled={isLoading || digits.join('').length < 6}
        onClick={() => handleSubmit()}
        className={cn(
          'w-full h-12 rounded-xl bg-apple-blue text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-apple-blue/25 transition-all cursor-pointer touch-target min-h-[44px]',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Verifying Code...</span>
          </>
        ) : (
          <>
            <span>Verify & Complete</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </motion.button>

      {/* Resend Action */}
      <div className="text-center pt-1">
        {timer > 0 ? (
          <p className="text-xs text-apple-text-muted">
            Didn't receive code? Resend available in{' '}
            <span className="font-mono font-bold text-apple-text">{timer}s</span>
          </p>
        ) : (
          <button
            type="button"
            disabled={isResending}
            onClick={handleResendClick}
            className="text-xs font-bold text-apple-blue hover:text-blue-700 dark:hover:text-blue-400 inline-flex items-center gap-1.5 cursor-pointer touch-target min-h-[36px]"
          >
            {isResending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5" />
            )}
            <span>Resend New Code</span>
          </button>
        )}
      </div>
    </div>
  );
};
