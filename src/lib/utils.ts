import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  try {
    if (price >= 10000000) {
      const crores = price / 10000000;
      return `${crores.toFixed(2).replace(/\.00$/, "")} Crore`;
    } else if (price >= 100000) {
      const lacs = price / 100000;
      return `${lacs.toFixed(2).replace(/\.00$/, "")} Lac`;
    }
    return `${price.toLocaleString("en-IN")}`;
  } catch (err) {
    console.error("formatPrice error:", err);
    return `${price}`;
  }
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
