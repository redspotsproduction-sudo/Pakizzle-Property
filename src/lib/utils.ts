import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Rounding mode configuration for Pakistani price formatting.
 * 'floor' (truncation): per Zameen.com spec (e.g. 16,36,50,000 -> 16.36 Crore, 10,50,50,000 -> 10.5 Crore).
 * 'round-half-up': standard arithmetic rounding (e.g. 16.365 -> 16.37 Crore).
 */
export type PriceRoundingMode = 'floor' | 'round-half-up';
export const PRICE_ROUNDING_MODE: PriceRoundingMode = 'floor';

/**
 * Decimal-safe formatting to at most 2 decimal places with trailing zero stripping.
 * Avoids IEEE 754 floating-point inaccuracies (e.g. Number.toFixed misrounding).
 */
function formatTwoDecimals(num: number, divisor: number, mode: PriceRoundingMode = PRICE_ROUNDING_MODE): string {
  // Scaled integer arithmetic for 2 decimal places
  const scaled = mode === 'floor'
    ? Math.floor((num * 100) / divisor)
    : Math.round((num * 100) / divisor);

  const whole = Math.floor(scaled / 100);
  const fraction = scaled % 100;

  if (fraction === 0) {
    return `${whole}`;
  }
  if (fraction % 10 === 0) {
    return `${whole}.${fraction / 10}`;
  }
  return `${whole}.${fraction < 10 ? '0' : ''}${fraction}`;
}

/**
 * Pure utility formatting Pakistani Rupee (PKR) amounts Zameen-style.
 * Rules:
 *   >= 1 Crore (10,000,000): amount / 10,000,000 + " Crore"
 *   >= 1 Lakh (100,000): amount / 100,000 + " Lakh"
 *   >= 1,000: amount / 1,000 + " Thousand"
 *   below 1,000: plain number
 *   Prefix: "Rs " with a space.
 *   Drop redundant "PKR" suffix.
 *   Maximum 2 decimal places with trailing zeros stripped.
 *   Edge cases: null, undefined, 0, NaN, negative -> "Price on request".
 */
export function formatPrice(
  amountPKR: number | string | null | undefined, 
  mode: PriceRoundingMode = PRICE_ROUNDING_MODE
): string {
  if (amountPKR === null || amountPKR === undefined) {
    return "Price on request";
  }

  let num: number;
  if (typeof amountPKR === "string") {
    const cleaned = amountPKR.replace(/,/g, "").trim();
    if (!cleaned) return "Price on request";
    num = Number(cleaned);
  } else {
    num = amountPKR;
  }

  if (isNaN(num) || num <= 0) {
    return "Price on request";
  }

  const prefix = "Rs ";

  if (num >= 10000000) {
    // 1 Crore = 10,000,000
    const formatted = formatTwoDecimals(num, 10000000, mode);
    return `${prefix}${formatted} Crore`;
  }

  if (num >= 100000) {
    // 1 Lakh = 100,000
    // Edge case: if rounding mode is 'round-half-up' and value rounds up to 100 Lakh (1 Crore),
    // promote to 1 Crore instead of displaying invalid "100 Lakh".
    if (mode === 'round-half-up' && Math.round((num * 100) / 100000) >= 10000) {
      return `${prefix}1 Crore`;
    }
    const formatted = formatTwoDecimals(num, 100000, mode);
    return `${prefix}${formatted} Lakh`;
  }

  if (num >= 1000) {
    // 1 Thousand = 1,000
    // Edge case: if rounding mode is 'round-half-up' and value rounds up to 100 Thousand (1 Lakh)
    if (mode === 'round-half-up' && Math.round((num * 100) / 1000) >= 10000) {
      return `${prefix}1 Lakh`;
    }
    const formatted = formatTwoDecimals(num, 1000, mode);
    return `${prefix}${formatted} Thousand`;
  }

  return `${prefix}${Math.floor(num)}`;
}

/**
 * Returns exact full price with Indian/South Asian numbering convention
 * for tooltips and screen reader accessibility (e.g. "Rs 16,36,50,000").
 */
export function formatExactPrice(amountPKR: number | string | null | undefined): string {
  if (amountPKR === null || amountPKR === undefined) {
    return "Price on request";
  }

  let num: number;
  if (typeof amountPKR === "string") {
    const cleaned = amountPKR.replace(/,/g, "").trim();
    if (!cleaned) return "Price on request";
    num = Number(cleaned);
  } else {
    num = amountPKR;
  }

  if (isNaN(num) || num <= 0) {
    return "Price on request";
  }

  try {
    const grouped = Math.round(num).toLocaleString("en-IN", {
      maximumFractionDigits: 0
    });
    return `Rs ${grouped}`;
  } catch {
    return `Rs ${num}`;
  }
}

/**
 * Backward compatibility alias for formatPrice
 */
export function formatPKR(amount: number | null | undefined, options?: { compact?: boolean; prefix?: string }): string {
  if (options?.compact) {
    return formatPrice(amount);
  }
  return formatExactPrice(amount);
}

export const TITLE_MAX_CHARS = 28;

/**
 * Unicode-safe single-line text truncation with trailing whitespace & punctuation cleanup.
 * Uses Intl.Segmenter (grapheme clusters) where available so Urdu and emoji never break mid-character.
 */
export function truncateText(text: string | null | undefined, max: number = TITLE_MAX_CHARS): string {
  if (!text) return "";

  // Segment by grapheme clusters for Unicode safety (e.g. Urdu, complex scripts, emojis)
  let graphemes: string[];
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new (Intl as any).Segmenter("en", { granularity: "grapheme" });
    graphemes = Array.from(segmenter.segment(text), (s: any) => s.segment);
  } else {
    graphemes = Array.from(text);
  }

  if (graphemes.length <= max) {
    return text;
  }

  const truncated = graphemes.slice(0, max).join("");
  // Trim trailing whitespace and punctuation before adding ellipsis so "Land ..." never occurs
  const cleaned = truncated.replace(/[\s\p{P}]+$/u, "");
  return `${cleaned}...`;
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

export function handleFirestoreError(error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null, auth: any): never {
  if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
    const user = auth.currentUser;
    const errorInfo: FirestoreErrorInfo = {
      error: error.message || 'Permission denied',
      operationType,
      path,
      authInfo: {
        userId: user?.uid || 'anonymous',
        email: user?.email || 'none',
        emailVerified: user?.emailVerified || false,
        isAnonymous: user?.isAnonymous || true,
        providerInfo: user?.providerData?.map((p: any) => ({
          providerId: p.providerId,
          displayName: p.displayName || '',
          email: p.email || '',
        })) || [],
      },
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
}
