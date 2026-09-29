import { initializeApp } from 'firebase/app';
import { toast } from 'sonner';
import { 
  getAuth, 
  GoogleAuthProvider, 
  OAuthProvider,
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  EmailAuthProvider,
  linkWithCredential,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail
} from 'firebase/auth';
import { initializeFirestore, getFirestore, doc, getDoc, setDoc, collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, getDocFromServer, Timestamp } from 'firebase/firestore';

export { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  EmailAuthProvider,
  OAuthProvider,
  GoogleAuthProvider,
  sendPasswordResetEmail
};
export type { FirebaseUser };

// Import the Firebase configuration
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);

// Use the specific firestoreDatabaseId from the config if available
// This is critical for AI Studio shared databases
const databaseId = firebaseConfig.firestoreDatabaseId || "(default)";
console.log(`[Firebase] Initializing Firestore with Database ID: ${databaseId}`);

// Use initializeFirestore with auto-detect long-polling for resilient connectivity
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  ignoreUndefinedProperties: true
}, databaseId);

export const auth = getAuth(app);

// Lazy initialization of providers to avoid early instantiation issues
let _googleProvider: GoogleAuthProvider | null = null;
let _appleProvider: OAuthProvider | null = null;

export const getGoogleProvider = () => {
  if (!_googleProvider) {
    _googleProvider = new GoogleAuthProvider();
    _googleProvider.setCustomParameters({ prompt: 'select_account' });
  }
  return _googleProvider;
};

export const getAppleProvider = () => {
  if (!_appleProvider) {
    _appleProvider = new OAuthProvider('apple.com');
  }
  return _appleProvider;
};

// Error handling helper
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

// Global state to track if we've hit a quota error to prevent infinite write loops
let _quotaExceeded = false;
export const isFirestoreQuotaExceeded = () => _quotaExceeded;

export function handleFirestoreError(error: any, operationType: OperationType, path: string | null): never {
  // Check if it's an offline error
  const errorMessage = error?.message?.toLowerCase() || '';
  const isQuota = errorMessage.includes('quota') || error?.code === 'resource-exhausted';
  const isOffline = errorMessage.includes('offline') || error?.code === 'unavailable' || isQuota;
  
  if (isQuota) {
    _quotaExceeded = true;
    console.error('CRITICAL: Firestore Quota Exceeded. Writes are disabled.');
  }

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isOffline
    },
    operationType,
    path
  }
  
  // Professional mapping for users
  if (error?.code === 'permission-denied') {
    toast.error('Security Protocol: Checksum Mismatch', {
      description: 'Your identity signature does not match the required authorization level for this matrix update.'
    });
  } else if (isQuota) {
    toast.error('Platform Constraint', {
      description: 'The ecosystem has reached its maximum capacity. Energy cycles will reset soon.'
    });
  }

  if (isOffline) {
    console.warn(`[Firebase] Firestore operating in offline/cache mode for ${operationType} on ${path || 'unknown'}`);
    return null as never;
  }

  throw new Error(JSON.stringify(errInfo));
}

// Validate Connection to Firestore per Skill specification
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("[Firebase] Successfully connected to Firestore backend.");
  } catch (error) {
    if (error instanceof Error && (error.message.includes('the client is offline') || (error as any)?.code === 'unavailable')) {
      console.warn("[Firebase] Client is operating in offline mode. Local cache active.");
    }
  }
}
testConnection();
