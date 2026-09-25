import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats currency in PKR using South Asian numbering convention (e.g. Rs 4,50,000)
 * Supports compact display (e.g. Rs 1.5 Crore or Rs 45 Lac) where space is tight.
 */
export function formatPKR(amount: number | null | undefined, options?: { compact?: boolean; prefix?: string }): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "Rs 0";
  const prefix = options?.prefix ?? "Rs ";

  if (options?.compact) {
    if (Math.abs(amount) >= 10000000) {
      const crores = amount / 10000000;
      return `${prefix}${crores.toFixed(2).replace(/\.?0+$/, "")} Crore`;
    } else if (Math.abs(amount) >= 100000) {
      const lacs = amount / 100000;
      return `${prefix}${lacs.toFixed(2).replace(/\.?0+$/, "")} Lac`;
    }
  }

  try {
    const formatted = Math.round(amount).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    });
    return `${prefix}${formatted}`;
  } catch {
    return `${prefix}${amount}`;
  }
}

export function formatPrice(price: number, compact = false): string {
  return formatPKR(price, { compact });
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
