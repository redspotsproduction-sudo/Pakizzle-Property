import React from 'react';
import { Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface PasswordAnalysis {
  score: number; // 0 to 4
  entropyBits: number;
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  color: string;
  feedback: string;
  suggestions: string[];
}

export function calculatePasswordEntropy(password: string): PasswordAnalysis {
  if (!password) {
    return {
      score: 0,
      entropyBits: 0,
      label: 'Very Weak',
      color: 'bg-slate-300 dark:bg-slate-700',
      feedback: 'Enter a strong password',
      suggestions: ['At least 8 characters', 'Include numbers & symbols'],
    };
  }

  // Base pool calculation
  let poolSize = 0;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigits = /[0-9]/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);

  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasDigits) poolSize += 10;
  if (hasSymbols) poolSize += 33;

  // Approximate entropy in bits = length * log2(poolSize)
  let entropy = Math.round(password.length * (poolSize > 0 ? Math.log2(poolSize) : 0));

  // Deduct for obvious weak patterns
  const lower = password.toLowerCase();
  const commonPatterns = ['password', '123456', 'qwerty', 'pakistan', 'admin', 'lahore', 'karachi'];
  for (const pat of commonPatterns) {
    if (lower.includes(pat)) {
      entropy = Math.max(10, entropy - 25);
    }
  }

  // Deduct for sequential characters
  if (/012|123|234|345|456|567|678|789|abc|bcd|cde|def/.test(lower)) {
    entropy = Math.max(15, entropy - 15);
  }

  // Determine score
  let score = 0;
  let label: PasswordAnalysis['label'] = 'Very Weak';
  let color = 'bg-rose-500';
  let feedback = 'Easily guessable. Add variety.';
  const suggestions: string[] = [];

  if (entropy < 28 || password.length < 8) {
    score = 1;
    label = 'Weak';
    color = 'bg-rose-500';
    feedback = 'Too short or simple. Expand length.';
    if (password.length < 8) suggestions.push('Make it at least 8 characters');
    if (!hasDigits) suggestions.push('Add a number');
    if (!hasSymbols) suggestions.push('Add a special symbol (!@#$)');
  } else if (entropy < 46) {
    score = 2;
    label = 'Fair';
    color = 'bg-amber-500';
    feedback = 'Moderate strength. Add special characters.';
    if (!hasUpper) suggestions.push('Include uppercase letters');
    if (!hasSymbols) suggestions.push('Add a symbol (e.g. $, %, &)');
  } else if (entropy < 65) {
    score = 3;
    label = 'Strong';
    color = 'bg-blue-500';
    feedback = 'Good password. High entropy resistance.';
  } else {
    score = 4;
    label = 'Very Strong';
    color = 'bg-emerald-500';
    feedback = 'Excellent. High resistance to brute force.';
  }

  return {
    score,
    entropyBits: entropy,
    label,
    color,
    feedback,
    suggestions,
  };
}

interface PasswordStrengthMeterProps {
  analysis: PasswordAnalysis;
  visible: boolean;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ analysis, visible }) => {
  if (!visible) return null;

  return (
    <div className="space-y-2 pt-1 animate-fadeIn">
      {/* 4 Segment Bars */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
        {[1, 2, 3, 4].map((step) => {
          const isActive = step <= analysis.score;
          return (
            <div
              key={step}
              className={cn(
                'h-full rounded-full transition-all duration-300',
                isActive ? analysis.color : 'bg-black/10 dark:bg-white/10'
              )}
            />
          );
        })}
      </div>

      {/* Microcopy & Entropy bits */}
      <div className="flex items-center justify-between text-[11px] leading-tight text-apple-text-muted">
        <span className="flex items-center gap-1 font-medium">
          {analysis.score >= 3 ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 inline" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 inline" />
          )}
          <span>{analysis.feedback}</span>
        </span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {analysis.label} ({analysis.entropyBits} bits)
        </span>
      </div>

      {/* Actionable suggestions */}
      {analysis.suggestions.length > 0 && (
        <ul className="text-[10px] text-apple-text-muted/80 space-y-0.5 pl-4 list-disc">
          {analysis.suggestions.map((s, idx) => (
            <li key={idx}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
