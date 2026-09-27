import React, { useState, useEffect, useId } from 'react';
import { Mail, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export type IdentifierType = 'email' | 'phone' | 'unknown';

interface SmartIdentifierResult {
  raw: string;
  normalized: string;
  type: IdentifierType;
  isValid: boolean;
  error?: string;
}

export function parseAndValidateIdentifier(value: string): SmartIdentifierResult {
  const trimmed = value.trim();
  if (!trimmed) {
    return { raw: trimmed, normalized: '', type: 'unknown', isValid: false };
  }

  // Check for email
  if (trimmed.includes('@')) {
    // Basic RFC 5322 compatible email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    const isValid = emailRegex.test(trimmed);
    return {
      raw: trimmed,
      normalized: trimmed.toLowerCase(),
      type: 'email',
      isValid,
      error: isValid ? undefined : 'Enter a valid email address (e.g. name@domain.com)',
    };
  }

  // Check for phone (digits, leading +, dashes, spaces)
  const cleanedDigits = trimmed.replace(/[\s\-\(\)]/g, '');
  const looksLikePhone = /^\+?[0-9]{7,15}$/.test(cleanedDigits);

  if (looksLikePhone) {
    // Pakistani Phone Normalization
    // Formats: 03001234567 -> +923001234567, 3001234567 -> +923001234567, +923001234567
    let normalized = cleanedDigits;
    if (normalized.startsWith('03') && normalized.length === 11) {
      normalized = '+92' + normalized.slice(1);
    } else if (normalized.startsWith('3') && normalized.length === 10) {
      normalized = '+92' + normalized;
    } else if (normalized.startsWith('923') && normalized.length === 12) {
      normalized = '+' + normalized;
    } else if (!normalized.startsWith('+')) {
      normalized = '+' + normalized;
    }

    // Pakistani mobile number validity: +92 3XX XXXXXXX (13 chars total)
    const isPakMobile = /^\+923[0-4][0-9]{8}$/.test(normalized);
    const isGeneralInternational = /^\+[1-9][0-9]{7,14}$/.test(normalized);

    const isValid = isPakMobile || isGeneralInternational;

    return {
      raw: trimmed,
      normalized,
      type: 'phone',
      isValid,
      error: isValid
        ? undefined
        : 'Enter an active 11-digit mobile number (e.g. 0300 1234567)',
    };
  }

  return {
    raw: trimmed,
    normalized: trimmed,
    type: 'unknown',
    isValid: false,
    error: 'Enter a valid email address or mobile phone number',
  };
}

interface SmartIdentifierInputProps {
  value: string;
  onChange: (value: string, parsed: SmartIdentifierResult) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  label?: string;
  placeholder?: string;
}

export const SmartIdentifierInput: React.FC<SmartIdentifierInputProps> = ({
  value,
  onChange,
  disabled = false,
  autoFocus = false,
  label = 'Email or Mobile Number',
  placeholder = 'name@example.com or 0300 1234567',
}) => {
  const id = useId();
  const [touched, setTouched] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, 280);
    return () => clearTimeout(handler);
  }, [value]);

  const parsed = parseAndValidateIdentifier(debouncedValue);
  const immediateParsed = parseAndValidateIdentifier(value);

  const showError = touched && value.length > 2 && !parsed.isValid && !!parsed.error;
  const showSuccess = touched && parsed.isValid;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    onChange(newVal, parseAndValidateIdentifier(newVal));
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-bold text-apple-text tracking-tight">
          {label}
        </label>
        {/* Dynamic type badge */}
        {immediateParsed.type !== 'unknown' && value.length > 2 && (
          <span
            className={cn(
              'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center gap-1 transition-all',
              immediateParsed.type === 'phone'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-apple-blue/10 text-apple-blue'
            )}
          >
            {immediateParsed.type === 'phone' ? (
              <>
                <Phone className="w-2.5 h-2.5" />
                <span>Mobile (+92)</span>
              </>
            ) : (
              <>
                <Mail className="w-2.5 h-2.5" />
                <span>Email</span>
              </>
            )}
          </span>
        )}
      </div>

      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-apple-text-muted pointer-events-none">
          {immediateParsed.type === 'phone' ? (
            <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 transition-colors" />
          ) : (
            <Mail className="w-4 h-4 transition-colors" />
          )}
        </div>

        <input
          id={id}
          type={immediateParsed.type === 'phone' ? 'tel' : 'text'}
          autoComplete={immediateParsed.type === 'phone' ? 'tel' : 'email'}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          autoFocus={autoFocus}
          disabled={disabled}
          value={value}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          aria-invalid={showError ? 'true' : 'false'}
          aria-describedby={showError ? `${id}-error` : undefined}
          className={cn(
            'w-full h-12 pl-10 pr-10 rounded-xl bg-apple-gray/60 dark:bg-white/5 border text-sm font-medium transition-all outline-none',
            showError
              ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-rose-600 dark:text-rose-400'
              : showSuccess
              ? 'border-emerald-500/60 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15'
              : 'border-black/10 dark:border-white/10 focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/15',
            'touch-target min-h-[44px]'
          )}
        />

        {/* State icons */}
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
          {showSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-fadeIn" />}
          {showError && <AlertCircle className="w-4 h-4 text-rose-500 animate-fadeIn" />}
        </div>
      </div>

      {showError && (
        <p id={`${id}-error`} className="text-[11px] text-rose-500 font-medium pl-1 flex items-center gap-1 animate-fadeIn">
          <span>{parsed.error}</span>
        </p>
      )}
    </div>
  );
};
