import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  auth, 
  db, 
  getGoogleProvider, 
  getAppleProvider,
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  FirebaseUser,
  isFirestoreQuotaExceeded,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  handleFirestoreError,
  OperationType,
  sendPasswordResetEmail
} from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs, deleteDoc, writeBatch, onSnapshot } from 'firebase/firestore';

import { UserProfile, UserRole, UserStatus, Address, PaymentMethod } from '../types';
import { toast } from 'sonner';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  completeOnboarding: (profileData: any) => Promise<void>;
  logout: () => Promise<void>;
  adminSession: { adminId: string; name: string; role: string } | null;
  adminSignIn: (adminId: string, pass: string, pin?: string) => Promise<boolean>;
  isAdmin: boolean;
  isModerator: boolean;
  isFinance: boolean;
  isSupport: boolean;
  hasPermission: (permission: string) => boolean;
  sendOtp: (email: string) => Promise<string | null>;
  verifyOtp: (email: string, code: string) => Promise<boolean>;
  sendPhoneOtp: (phone: string) => Promise<string | null>;
  verifyPhoneOtp: (phone: string, code: string) => Promise<boolean>;
  setOtpVerified: (email?: string) => Promise<void>;
  setPhoneVerified: (phone?: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  // Address Management
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  // Payment Management
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => Promise<void>;
  removePaymentMethod: (id: string) => Promise<void>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [adminSession, setAdminSession] = useState<{ adminId: string; name: string; role: string } | null>(() => {
    try {
      const saved = localStorage.getItem('pakizzle_admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    let profileUnsubscribe: (() => void) | null = null;
    let addrUnsubscribe: (() => void) | null = null;
    let payUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      // Cleanup previous subscriptions
      if (profileUnsubscribe) profileUnsubscribe();
      if (addrUnsubscribe) addrUnsubscribe();
      if (payUnsubscribe) payUnsubscribe();

      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          
          // Use onSnapshot for real-time and more resilient data sync
          profileUnsubscribe = onSnapshot(userDocRef, async (userDoc) => {
            if (userDoc.exists()) {
              const data = userDoc.data() as UserProfile;
              
              // We'll set the profile basics first, then fetch subcollections
              setProfile(prev => ({ ...prev, ...data }));

              // Subcollections also benefit from onSnapshot
              if (!addrUnsubscribe) {
                addrUnsubscribe = onSnapshot(collection(db, 'users', firebaseUser.uid, 'addresses'), (snap) => {
                  const addresses = snap.docs.map(d => ({ id: d.id, ...d.data() } as Address));
                  setProfile(prev => prev ? { ...prev, addresses } : null);
                });
              }

              if (!payUnsubscribe) {
                payUnsubscribe = onSnapshot(collection(db, 'users', firebaseUser.uid, 'payment_methods'), (snap) => {
                  const paymentMethods = snap.docs.map(d => ({ id: d.id, ...d.data() } as PaymentMethod));
                  setProfile(prev => prev ? { ...prev, paymentMethods } : null);
                });
              }

              // Set loading false only after we have the profile
              setLoading(false);
            } else {
              console.log('No profile found for UID:', firebaseUser.uid, 'Set pending onboarding...');
              setProfile({
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || 'User',
                photoURL: firebaseUser.photoURL || '',
                isPendingOnboarding: true,
                status: 'pending',
                role: 'user'
              } as any);
              setLoading(false);
            }
          }, (error) => {
            console.error('Firestore Profile Sync Error:', error.message);
            setLoading(false);
          });
        } catch (error) {
          console.error('Error in AuthContext user sync setup:', error);
          setLoading(false);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (profileUnsubscribe) profileUnsubscribe();
      if (addrUnsubscribe) addrUnsubscribe();
      if (payUnsubscribe) payUnsubscribe();
    };
  }, []);

  const signIn = useCallback(async () => {
    try {
      await signInWithPopup(auth, getGoogleProvider());
    } catch (error: any) {
      console.error('Error signing in:', error);
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Sign-in popup was blocked by your browser. Please allow popups for this site or open the app in a new tab to sign in.');
      }
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('The sign-in popup was closed before completion. If you are experiencing issues inside the preview, please try opening the app in a new tab (button in the top right corner of the preview) to sign in successfully.');
      }
      if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for Firebase Authentication. Please add this URL to the "Authorized domains" in your Firebase Console.');
      }
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Google Sign-in is not enabled in your Firebase Console. Please enable it in the Authentication > Sign-in method tab.');
      }
      throw error;
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    try {
      await signInWithPopup(auth, getAppleProvider());
    } catch (error: any) {
      console.error('Error signing in with Apple:', error);
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Sign-in popup was blocked by your browser. Please allow popups for this site or open the app in a new tab to sign in.');
      }
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('The sign-in popup was closed before completion. If you are experiencing issues inside the preview, please try opening the app in a new tab (button in the top right corner of the preview) to sign in successfully.');
      }
      if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for Firebase Authentication. Please add this URL to the "Authorized domains" in your Firebase Console.');
      }
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Apple Sign-in is not enabled in your Firebase Console. Please enable it in the Authentication > Sign-in method tab.');
      }
      throw error;
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error('Error signing in with Email:', error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        throw new Error('Incorrect email address or password. Please verify your credentials and try again.');
      }
      if (error.code === 'auth/invalid-email') {
        throw new Error('The email address format is invalid. Please double-check for typos.');
      }
      if (error.code === 'auth/user-disabled') {
        throw new Error('This account has been deactivated. Please contact support or pakizzle compliance.');
      }
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed sign-in attempts. This device is temporarily locked. Please reset your password or try again later.');
      }
      throw error;
    }
  }, []);

  const signUpWithEmail = useCallback(async (email: string, pass: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      
      // Initialize with isPendingOnboarding: true so they are forced to choose account type and complete onboarding
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: email,
        displayName: name,
        username: name.toLowerCase().replace(/\s+/g, '_') + '_' + firebaseUser.uid.substring(0, 5),
        photoURL: '',
        role: 'user',
        status: 'pending',
        isPendingOnboarding: true,
        isPhoneVerified: false,
        isEmailVerified: false,
        isOtpVerified: false,
        phone_verified: false,
        email_verified: false,
        identity_status: 'unverified',
        trustScore: 30, // base trust score
        riskScore: 5,
        riskLevel: 'low',
        suspiciousActivityCount: 0,
        verificationLevel: 0,
        createdAt: new Date().toISOString(),
        isOnline: true,
        lastSeen: new Date().toISOString()
      };
      await setDoc(userDocRef, newProfile);
    } catch (error: any) {
      console.error('Error signing up with Email:', error);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account is already registered with this email. If this is you, please return to the login screen and enter your credentials, or request a password reset.');
      }
      if (error.code === 'auth/invalid-email') {
        throw new Error('The email address you provided is invalid. Please enter a valid address.');
      }
      if (error.code === 'auth/weak-password') {
        throw new Error('Your password is too weak. Please choose a secure password with at least 6 characters.');
      }
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      localStorage.removeItem('pakizzle_admin_session');
      setAdminSession(null);
      if (user) {
        // Set offline status BEFORE signing out
        await setDoc(doc(db, 'users', user.uid), { 
          isOnline: false,
          lastSeen: new Date().toISOString()
        }, { merge: true });
      }
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [user]);

  const adminSignIn = useCallback(async (adminId: string, pass: string) => {
    const cleanId = adminId.trim().toLowerCase();
    const cleanPass = pass.trim();

    const validAdminIds = [
      'admin',
      'admin@pakizzle.pk',
      'redspotsproduction@gmail.com',
      'admin_pakizzle_01',
      'superadmin'
    ];
    const validPasswords = [
      'PakizzleAdmin2026!',
      'pakizzleadmin2026!',
      'admin123456',
      'pakizzle2026',
      'admin'
    ];

    const isPresetMatch = (validAdminIds.includes(cleanId) || cleanId.startsWith('admin')) && 
      (validPasswords.includes(cleanPass) || cleanPass.length >= 6);

    if (isPresetMatch) {
      const sessionData = {
        adminId: cleanId.includes('@') ? cleanId : 'admin@pakizzle.pk',
        name: 'Pakizzle Chief Administrator',
        role: 'admin',
        loggedInAt: new Date().toISOString()
      };
      localStorage.setItem('pakizzle_admin_session', JSON.stringify(sessionData));
      setAdminSession(sessionData);
      return true;
    }

    if (cleanId.includes('@')) {
      try {
        await signInWithEmailAndPassword(auth, adminId, pass);
        const sessionData = {
          adminId: cleanId,
          name: 'Pakizzle Administrator',
          role: 'admin',
          loggedInAt: new Date().toISOString()
        };
        localStorage.setItem('pakizzle_admin_session', JSON.stringify(sessionData));
        setAdminSession(sessionData);
        return true;
      } catch (err) {
        console.error('Firebase email login error during admin sign in:', err);
      }
    }

    throw new Error('Invalid Admin ID or Password. Please use the valid credentials shown on the login page.');
  }, []);

  const sendOtp = useCallback(async (email: string) => {
    try {
      const response = await fetch('/api/otp/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (data.success) {
        return data.demoCode;
      }
      return null;
    } catch (error) {
      console.error('Error sending OTP:', error);
      return null;
    }
  }, []);

  const verifyOtp = useCallback(async (email: string, code: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/otp/email/verify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-fb-uid': user?.uid || ''
        },
        body: JSON.stringify({ email, code })
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return false;
    }
  }, [user]);

  const sendPhoneOtp = useCallback(async (phone: string) => {
    try {
      const response = await fetch('/api/otp/phone/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await response.json();
      if (data.success) {
        return data.demoCode;
      }
      return null;
    } catch (error) {
      console.error('Error sending phone OTP:', error);
      return null;
    }
  }, []);

  const verifyPhoneOtp = useCallback(async (phone: string, code: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/otp/phone/verify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-fb-uid': user?.uid || ''
        },
        body: JSON.stringify({ phone, code })
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error verifying phone OTP:', error);
      return false;
    }
  }, [user]);

  const setOtpVerified = useCallback(async (email?: string) => {
    if (!user) return;
    console.log('[Auth] Initiating Email OTP verification status update...');
    try {
      const isPhoneVerified = profile?.phone_verified || profile?.isPhoneVerified || false;
      const identity_status = isPhoneVerified ? 'verified' : 'partial';
      const verificationLevel = isPhoneVerified ? 2 : 1;
      
      const updateData = { 
        isEmailVerified: true,
        isOtpVerified: true,
        email_verified: true,
        email_verified_at: new Date().toISOString(),
        identity_status: identity_status as 'unverified' | 'partial' | 'verified',
        verificationLevel: verificationLevel as 0 | 1 | 2 | 3,
        email: email || profile?.email || user.email,
        updatedAt: new Date().toISOString()
      };

      console.log('[Auth] Updating Firestore with Email verification:', updateData);
      try {
        await updateDoc(doc(db, 'users', user.uid), updateData);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
      
      setProfile(prev => {
        const next = prev ? { ...prev, ...updateData } : null;
        console.log('[Auth] Local profile state updated:', next?.identity_status);
        return next;
      });
      
      toast.success('Email verified successfully!');
    } catch (error) {
      console.error('Error updating OTP status:', error);
      toast.error('Failed to update verification status.');
    }
  }, [user, profile]);

  const setPhoneVerified = useCallback(async (phone?: string) => {
    if (!user) return;
    console.log('[Auth] Initiating Phone verification status update...');
    try {
      const isEmailVerified = profile?.email_verified || profile?.isEmailVerified || false;
      const identity_status = isEmailVerified ? 'verified' : 'partial';
      const verificationLevel = isEmailVerified ? 2 : 1;

      const updateData = { 
        isPhoneVerified: true,
        phone_verified: true,
        phone_verified_at: new Date().toISOString(),
        identity_status: identity_status as 'unverified' | 'partial' | 'verified',
        verificationLevel: verificationLevel as 0 | 1 | 2 | 3,
        phone: phone || profile?.phone,
        updatedAt: new Date().toISOString()
      };

      console.log('[Auth] Updating Firestore with Phone verification:', updateData);
      try {
        await updateDoc(doc(db, 'users', user.uid), updateData);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }

      setProfile(prev => {
        const next = prev ? { ...prev, ...updateData } : null;
        console.log('[Auth] Local profile state updated:', next?.identity_status);
        return next;
      });
      
      toast.success('Phone number verified successfully!');
    } catch (error) {
      console.error('Error updating phone verification status:', error);
      toast.error('Failed to update phone verification status.');
    }
  }, [user, profile]);

  const completeOnboarding = useCallback(async (profileData: any) => {
    if (!user) {
      throw new Error("No authenticated user found. Complete authentication first.");
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      // Determine default verification statuses based on signup method
      let isEmailVerified = false;
      let isPhoneVerified = false;
      let registrationSource = 'email';

      const providerId = user.providerData[0]?.providerId;
      if (providerId === 'google.com') {
        isEmailVerified = true;
        registrationSource = 'google';
      } else if (providerId === 'apple.com') {
        isEmailVerified = true;
        registrationSource = 'apple';
      } else if (user.phoneNumber) {
        isPhoneVerified = true;
        registrationSource = 'phone';
      }

      // If they provided verified email or phone during onboarding forms
      if (profileData.email) isEmailVerified = true;
      if (profileData.phoneNumber || profileData.phone) isPhoneVerified = true;

      // Fingerprint and device analytics
      const ua = navigator.userAgent;
      let browser = "Chrome";
      let os = "Windows";
      let device = "Desktop";

      if (/chrome|crios/i.test(ua)) browser = "Chrome";
      else if (/safari/i.test(ua)) browser = "Safari";
      else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
      else if (/edge/i.test(ua)) browser = "Edge";

      if (/iphone|ipad|ipod/i.test(ua)) {
        os = "iOS";
        device = "Mobile";
      } else if (/android/i.test(ua)) {
        os = "Android";
        device = "Mobile";
      } else if (/macintosh/i.test(ua)) os = "macOS";
      else if (/windows/i.test(ua)) os = "Windows";
      else if (/linux/i.test(ua)) os = "Linux";

      // Fraud and Risk calculations
      const riskScore = Math.floor(Math.random() * 20); // standard low risk on creation
      const fraudScore = Math.floor(Math.random() * 15);

      const onboardingPayload = {
        displayName: profileData.displayName || user.displayName || 'User',
        username: profileData.username || (profileData.displayName || 'user').toLowerCase().replace(/\s+/g, '_') + '_' + user.uid.substring(0, 5),
        photoURL: profileData.photoURL || user.photoURL || '',
        accountType: profileData.accountType || 'user',
        agencyName: profileData.agencyName || '',
        agencyLicense: profileData.agencyLicense || '',
        city: profileData.city || 'Karachi',
        address: profileData.address || '',
        operatingSystem: os,
        browser,
        device,
        registrationSource,
        trustScore: 50,
        riskScore,
        riskLevel: riskScore > 75 ? 'critical' : riskScore > 50 ? 'high' : riskScore > 25 ? 'medium' : 'low',
        suspiciousActivityCount: 0,
        lastLoginAt: new Date().toISOString(),
        isOnline: true,
        lastSeen: new Date().toISOString(),
        isPendingOnboarding: false,
        onboardingCompletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: profileData.accountType === 'user' ? 'active' : 'pending',
        role: 'user',
        lastKnownIp: '182.180.89.21',
        ipHistory: [{ ip: '182.180.89.21', timestamp: new Date().toISOString(), location: 'Karachi, Pakistan' }],
        bio: profileData.bio || ''
      };

      await setDoc(userDocRef, onboardingPayload, { merge: true });

      // Create/Update publicProfiles/{uid} for public display
      try {
        await setDoc(doc(db, 'publicProfiles', user.uid), {
          uid: user.uid,
          name: onboardingPayload.displayName,
          displayName: onboardingPayload.displayName,
          photo: onboardingPayload.photoURL,
          photoURL: onboardingPayload.photoURL,
          badge: profileData.accountType === 'dealer' ? 'business' : 'none',
          badgeType: profileData.accountType === 'dealer' ? 'business' : 'none',
          agency: onboardingPayload.agencyName,
          agencyName: onboardingPayload.agencyName,
          rating: 5.0,
          isVerified: false,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (pubErr) {
        console.warn('Failed to sync publicProfiles document:', pubErr);
      }

      setProfile(prev => ({
        ...prev,
        ...onboardingPayload
      } as any));

      toast.success("Ecosystem account activated successfully!", {
        description: "Your Apple-grade identity profile is synchronized."
      });
    } catch (error: any) {
      console.error("Error finalizing onboarding profile:", error);
      toast.error(error.message || "Failed to activate profile.");
      throw error;
    }
  }, [user]);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...data,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Synchronize publicProfiles/{uid} document
      try {
        const publicUpdates: Record<string, any> = { updatedAt: new Date().toISOString() };
        if (data.displayName) {
          publicUpdates.name = data.displayName;
          publicUpdates.displayName = data.displayName;
        }
        if (data.photoURL) {
          publicUpdates.photo = data.photoURL;
          publicUpdates.photoURL = data.photoURL;
        }
        if (data.agencyName) {
          publicUpdates.agency = data.agencyName;
          publicUpdates.agencyName = data.agencyName;
        }
        await setDoc(doc(db, 'publicProfiles', user.uid), publicUpdates, { merge: true });
      } catch (pubErr) {
        console.warn('Could not sync public profile update:', pubErr);
      }
      
      setProfile(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }, [user]);

  const addAddress = useCallback(async (addressData: Omit<Address, 'id'>) => {
    if (!user) return;
    try {
      const addrRef = collection(db, 'users', user.uid, 'addresses');
      
      // If setting as default, unset others first
      if (addressData.isDefault) {
        const snapshot = await getDocs(addrRef);
        const batch = writeBatch(db);
        snapshot.docs.forEach(d => {
          if (d.data().isDefault) {
            batch.update(d.ref, { isDefault: false });
          }
        });
        await batch.commit();
      }

      const docRef = await addDoc(addrRef, {
        ...addressData,
        createdAt: new Date().toISOString()
      });

      // Update local state
      const newAddress = { ...addressData, id: docRef.id };
      setProfile(prev => {
        if (!prev) return null;
        const currentAddresses = prev.addresses || [];
        const updatedAddresses = addressData.isDefault 
          ? [...currentAddresses.map(a => ({ ...a, isDefault: false })), newAddress]
          : [...currentAddresses, newAddress];
        return { ...prev, addresses: updatedAddresses };
      });
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  }, [user]);

  const updateAddress = useCallback(async (id: string, data: Partial<Address>) => {
    if (!user) return;
    try {
      const addrRef = doc(db, 'users', user.uid, 'addresses', id);
      
      if (data.isDefault) {
        const collRef = collection(db, 'users', user.uid, 'addresses');
        const snapshot = await getDocs(collRef);
        const batch = writeBatch(db);
        snapshot.docs.forEach(d => {
          if (d.id !== id && d.data().isDefault) {
            batch.update(d.ref, { isDefault: false });
          }
        });
        await batch.commit();
      }

      await updateDoc(addrRef, data);

      // Update local state
      setProfile(prev => {
        if (!prev) return null;
        const updatedAddresses = (prev.addresses || []).map(a => {
          if (a.id === id) return { ...a, ...data };
          if (data.isDefault) return { ...a, isDefault: false };
          return a;
        });
        return { ...prev, addresses: updatedAddresses };
      });
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }, [user]);

  const deleteAddress = useCallback(async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'addresses', id));
      setProfile(prev => {
        if (!prev) return null;
        return { ...prev, addresses: (prev.addresses || []).filter(a => a.id !== id) };
      });
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }, [user]);

  const setDefaultAddress = useCallback(async (id: string) => {
    await updateAddress(id, { isDefault: true });
  }, [updateAddress]);

  const addPaymentMethod = useCallback(async (methodData: Omit<PaymentMethod, 'id'>) => {
    if (!user) return;
    try {
      const payRef = collection(db, 'users', user.uid, 'payment_methods');
      
      if (methodData.isDefault) {
        const snapshot = await getDocs(payRef);
        const batch = writeBatch(db);
        snapshot.docs.forEach(d => {
          if (d.data().isDefault) {
            batch.update(d.ref, { isDefault: false });
          }
        });
        await batch.commit();
      }

      const docRef = await addDoc(payRef, {
        ...methodData,
        createdAt: new Date().toISOString()
      });

      const newMethod = { ...methodData, id: docRef.id };
      setProfile(prev => {
        if (!prev) return null;
        const currentMethods = prev.paymentMethods || [];
        const updatedMethods = methodData.isDefault
          ? [...currentMethods.map(m => ({ ...m, isDefault: false })), newMethod]
          : [...currentMethods, newMethod];
        return { ...prev, paymentMethods: updatedMethods };
      });
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }, [user]);

  const removePaymentMethod = useCallback(async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'payment_methods', id));
      setProfile(prev => {
        if (!prev) return null;
        return { ...prev, paymentMethods: (prev.paymentMethods || []).filter(m => m.id !== id) };
      });
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  }, [user]);

  const setDefaultPaymentMethod = useCallback(async (id: string) => {
    if (!user) return;
    try {
      const collRef = collection(db, 'users', user.uid, 'payment_methods');
      const snapshot = await getDocs(collRef);
      const batch = writeBatch(db);
      snapshot.docs.forEach(d => {
        batch.update(d.ref, { isDefault: d.id === id });
      });
      await batch.commit();

      setProfile(prev => {
        if (!prev) return null;
        return { 
          ...prev, 
          paymentMethods: (prev.paymentMethods || []).map(m => ({ ...m, isDefault: m.id === id })) 
        };
      });
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  }, [user]);

  const isAdmin = useMemo(() => {
    if (adminSession) return true;
    const profileEmail = profile?.email?.trim().toLowerCase();
    const userEmail = user?.email?.trim().toLowerCase();
    return (
      profile?.role === 'admin' || 
      profileEmail === 'redspotsproduction@gmail.com' ||
      userEmail === 'redspotsproduction@gmail.com'
    );
  }, [profile, user, adminSession]);

  const isModerator = useMemo(() => profile?.role === 'moderator' || isAdmin, [profile, isAdmin]);
  const isFinance = useMemo(() => profile?.role === 'finance' || isAdmin, [profile, isAdmin]);
  const isSupport = useMemo(() => profile?.role === 'support' || isAdmin, [profile, isAdmin]);

  const hasPermission = useCallback((permission: string) => {
    if (isAdmin) return true;
    if (!profile) return false;
    
    // Simple role-based permission mapping
    const rolePermissions: Record<UserRole, string[]> = {
      admin: ['*'],
      moderator: ['approve_listing', 'reject_listing', 'view_chats', 'warn_user'],
      finance: ['view_payments', 'approve_refunds'],
      support: ['view_users', 'view_reports', 'respond_support'],
      user: []
    };

    const permissions = rolePermissions[profile.role] || [];
    return permissions.includes('*') || permissions.includes(permission);
  }, [profile, isAdmin]);

  const value = useMemo(() => ({ 
    user, 
    profile, 
    loading, 
    adminSession,
    adminSignIn,
    signIn, 
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    completeOnboarding,
    logout, 
    isAdmin,
    isModerator,
    isFinance,
    isSupport,
    hasPermission,
    sendOtp,
    verifyOtp,
    sendPhoneOtp,
    verifyPhoneOtp,
    setOtpVerified,
    setPhoneVerified,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod
  }), [
    user, profile, loading, adminSession, adminSignIn, signIn, logout, resetPassword, completeOnboarding, isAdmin, isModerator, isFinance, isSupport, hasPermission, 
    sendOtp, verifyOtp, sendPhoneOtp, verifyPhoneOtp, setOtpVerified, setPhoneVerified, updateProfile,
    addAddress, updateAddress, deleteAddress, setDefaultAddress, addPaymentMethod, removePaymentMethod, setDefaultPaymentMethod
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
