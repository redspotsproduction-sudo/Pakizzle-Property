import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Mail, 
  Smartphone, 
  Apple, 
  ArrowRight, 
  ChevronLeft, 
  Lock, 
  Eye,
  EyeOff,
  User, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Store,
  Building2,
  Calendar,
  MapPin,
  UploadCloud,
  Globe,
  Check,
  Camera,
  FileText,
  Sparkles,
  Award,
  Users,
  Briefcase,
  Share2,
  ChevronRight,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { signInWithPhoneNumber } from '../firebase';
import { getAuth, RecaptchaVerifier as FirebaseRecaptchaVerifier } from 'firebase/auth';
import { toast } from 'sonner';
import { SignUpCard } from './Auth/SignUpCard';
import { SignInCard } from './Auth/SignInCard';
import { ForgotPasswordCard } from './Auth/ForgotPasswordCard';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'signup' | 'forgot-password';
}

type AuthView = 
  | 'selection' 
  | 'email-login' 
  | 'email-signup' 
  | 'phone-entry' 
  | 'otp-verify' 
  | 'forgot-password'
  | 'onboarding-type'
  | 'onboarding-form-user'
  | 'onboarding-form-dealer'
  | 'onboarding-form-company';

// Premium high-contrast vector search icon for Google
const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" width="24" height="24">
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

// High quality preset avatars for Users
const USER_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
];

export default function AuthModal({ isOpen, onClose, initialView = 'login' }: AuthModalProps) {
  const { 
    user,
    profile,
    signIn: signInWithGoogle, 
    signInWithApple, 
    signInWithEmail, 
    signUpWithEmail,
    resetPassword,
    completeOnboarding
  } = useAuth();
  
  const [view, setView] = useState<AuthView>('selection');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Base Sign-In Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [forgotPasswordEmailSent, setForgotPasswordEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  
  // Real-time Validation States for Sign-Up
  const [signupErrors, setSignupErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [showSignupValidation, setShowSignupValidation] = useState(false);
  
  // Onboarding Hub States
  const [accountType, setAccountType] = useState<'user' | 'dealer' | 'company' | null>(null);
  const [usernameSuggestion, setUsernameSuggestion] = useState('');
  
  // 1. Onboarding User Fields
  const [userFirstName, setUserFirstName] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userDob, setUserDob] = useState('');
  const [userGender, setUserGender] = useState('rather_not_say');
  const [userCountry, setUserCountry] = useState('Pakistan');
  const [userCity, setUserCity] = useState('');
  const [userReferralCode, setUserReferralCode] = useState('');
  const [userNewsletter, setUserNewsletter] = useState(true);
  const [userTerms, setUserTerms] = useState(false);
  const [userPhoto, setUserPhoto] = useState(USER_AVATARS[0]);

  // 2. Onboarding Dealer Fields
  const [dealerBusinessName, setDealerBusinessName] = useState('');
  const [dealerName, setDealerName] = useState('');
  const [dealerOwnerName, setDealerOwnerName] = useState('');
  const [dealerTypes, setDealerTypes] = useState<string[]>([]);
  const [dealerRegNumber, setDealerRegNumber] = useState('');
  const [dealerTaxNumber, setDealerTaxNumber] = useState('');
  const [dealerEmail, setDealerEmail] = useState('');
  const [dealerPhone, setDealerPhone] = useState('');
  const [dealerWhatsapp, setDealerWhatsapp] = useState('');
  const [dealerCountry, setDealerCountry] = useState('Pakistan');
  const [dealerCity, setDealerCity] = useState('');
  const [dealerAddress, setDealerAddress] = useState('');
  const [dealerWebsite, setDealerWebsite] = useState('');
  const [dealerSocialFacebook, setDealerSocialFacebook] = useState('');
  const [dealerSocialInstagram, setDealerSocialInstagram] = useState('');
  const [dealerSocialLinkedin, setDealerSocialLinkedin] = useState('');
  const [dealerYearsInBusiness, setDealerYearsInBusiness] = useState('1');
  const [dealerEmployeesCount, setDealerEmployeesCount] = useState('5');
  const [dealerInventorySize, setDealerInventorySize] = useState('10');
  const [dealerDescription, setDealerDescription] = useState('');
  const [dealerTradeLicense, setDealerTradeLicense] = useState<any>(null);
  const [dealerNationalId, setDealerNationalId] = useState<any>(null);
  const [dealerBizDocs, setDealerBizDocs] = useState<any>(null);

  // 3. Onboarding Company Fields
  const [companyName, setCompanyName] = useState('');
  const [companyLegalName, setCompanyLegalName] = useState('');
  const [companyBrand, setCompanyBrand] = useState('');
  const [companyCategory, setCompanyCategory] = useState('Manufacturer');
  const [companyCountry, setCompanyCountry] = useState('Pakistan');
  const [companyState, setCompanyState] = useState('');
  const [companyCity, setCompanyCity] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyWhatsapp, setCompanyWhatsapp] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyCeoName, setCompanyCeoName] = useState('');
  const [companyContactName, setCompanyContactName] = useState('');
  const [companyDepartments, setCompanyDepartments] = useState('');
  const [companyBranches, setCompanyBranches] = useState('1');
  const [companyDescription, setCompanyDescription] = useState('');
  const [companyLicense, setCompanyLicense] = useState<any>(null);
  const [companyTaxCertificate, setCompanyTaxCertificate] = useState<any>(null);
  const [companyRegistrationDoc, setCompanyRegistrationDoc] = useState<any>(null);

  const recaptchaVerifier = useRef<any>(null);

  // Auto transition to Onboarding Type selection screen if user is logged in but profile says "isPendingOnboarding"
  useEffect(() => {
    if (user && profile?.isPendingOnboarding) {
      setView('onboarding-type');
      
      // Pre-fill onboarding name fields automatically from signup input or Google/Apple name
      const targetName = name || profile?.displayName || user?.displayName || '';
      if (targetName) {
        const parts = targetName.trim().split(/\s+/);
        if (parts.length > 0) {
          setUserFirstName(parts[0]);
          if (parts.length > 1) {
            setUserLastName(parts.slice(1).join(' '));
          } else {
            setUserLastName('');
          }
        }
      }
    }
  }, [user, profile, name]);

  // Handle typing username suggestion based on display name or Email prefix
  useEffect(() => {
    const baseName = name || userFirstName || user?.displayName || user?.email?.split('@')[0] || 'user';
    const cleaned = baseName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    setUsernameSuggestion(`${cleaned}_${Math.floor(100 + Math.random() * 900)}`);
  }, [name, userFirstName, user]);

  useEffect(() => {
    if (isOpen) {
      if (user) {
        if (profile) {
          if (profile.isPendingOnboarding) {
            // Only set view to onboarding-type if not already on an onboarding subview
            if (view !== 'onboarding-type' && 
                view !== 'onboarding-form-user' && 
                view !== 'onboarding-form-dealer' && 
                view !== 'onboarding-form-company') {
              setView('onboarding-type');
            }
          } else {
            // Onboarding completed - close the modal automatically!
            onClose();
          }
        } else {
          // Profile is still loading. Do NOT reset the view, as it would cause flickering.
        }
      } else {
        // User is logged out. Respect initialView if opening fresh
        if (initialView === 'signup') {
          setView('email-signup');
        } else if (initialView === 'forgot-password') {
          setView('forgot-password');
        } else if (
          view !== 'email-login' && 
          view !== 'email-signup' && 
          view !== 'phone-entry' && 
          view !== 'otp-verify' && 
          view !== 'forgot-password'
        ) {
          setView('selection');
        }
      }
      setError(null);
      setLoading(false);
      setForgotPasswordEmailSent(false);
    }
    
    return () => {
      if (recaptchaVerifier.current) {
        try { recaptchaVerifier.current.clear(); } catch (e) {}
        recaptchaVerifier.current = null;
      }
    };
  }, [isOpen, user, profile, view, onClose]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      // If profile is already authenticated, the global onSnapshot will verify and onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithApple();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Apple');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
      toast.success('Welcome back!');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSignupValidation(true);

    const nameTrimmed = name.trim();
    const nameParts = nameTrimmed.split(/\s+/).filter(Boolean);
    const hasFirstAndLastName = nameParts.length >= 2;
    const isNameValid = nameTrimmed.length >= 3 && hasFirstAndLastName;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordValid = password.length >= 6;

    const newErrors: { name?: string; email?: string; password?: string } = {};
    if (!isNameValid) {
      if (nameTrimmed.length < 3) {
        newErrors.name = "Full name must be at least 3 characters.";
      } else {
        newErrors.name = "Please enter both your first and last name.";
      }
    }
    if (!isEmailValid) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!isPasswordValid) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setSignupErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signUpWithEmail(email, password, name);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!recaptchaVerifier.current) {
      const container = document.getElementById('recaptcha-container');
      if (!container) return;
      try {
        const auth = getAuth();
        recaptchaVerifier.current = new FirebaseRecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('Recaptcha verified');
          },
          'expired-callback': () => {
             if (recaptchaVerifier.current) {
               recaptchaVerifier.current.clear();
               recaptchaVerifier.current = null;
             }
          }
        });
      } catch (err) {
        console.error('Error creating RecaptchaVerifier:', err);
      }
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      setupRecaptcha();
      const appVerifier = recaptchaVerifier.current;
      if (!appVerifier) {
        throw new Error('Verification system initialization failed. Please try again.');
      }
      const formattedPhone = phone.startsWith('+') ? phone : `+92${phone.replace(/^0/, '')}`;
      const auth = getAuth();
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setView('otp-verify');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
      if (recaptchaVerifier.current) {
        try { recaptchaVerifier.current.clear(); } catch(e){}
        recaptchaVerifier.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await confirmationResult.confirm(otp);
      toast.success('Phone verified!');
    } catch (err: any) {
      setError('Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  // Submit onboarding details
  const submitOnboardingUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userTerms) {
      toast.error("Please accept the Terms of Service to continue.");
      return;
    }
    setLoading(true);
    try {
      await completeOnboarding({
        accountType: 'user',
        firstName: userFirstName,
        lastName: userLastName,
        displayName: `${userFirstName} ${userLastName}`.trim(),
        username: userUsername || usernameSuggestion,
        photoURL: userPhoto,
        dob: userDob,
        gender: userGender,
        country: userCountry,
        city: userCity,
        referralCode: userReferralCode,
        newsletter: userNewsletter,
        onboardingCompletedAt: new Date().toISOString()
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to complete onboarding.");
    } finally {
      setLoading(false);
    }
  };

  const submitOnboardingDealer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dealerTypes.length === 0) {
      toast.error("Please select at least one dealer specialization.");
      return;
    }
    setLoading(true);
    try {
      await completeOnboarding({
        accountType: 'dealer',
        businessName: dealerBusinessName,
        dealerName: dealerName,
        displayName: dealerBusinessName,
        ownerName: dealerOwnerName,
        dealerTypes,
        registrationNumber: dealerRegNumber,
        taxNumber: dealerTaxNumber,
        email: dealerEmail,
        phone: dealerPhone,
        whatsapp: dealerWhatsapp,
        country: dealerCountry,
        city: dealerCity,
        address: dealerAddress,
        website: dealerWebsite,
        socialLinks: {
          facebook: dealerSocialFacebook,
          instagram: dealerSocialInstagram,
          linkedin: dealerSocialLinkedin
        },
        yearsInBusiness: parseInt(dealerYearsInBusiness) || 1,
        employeesCount: parseInt(dealerEmployeesCount) || 5,
        inventorySize: parseInt(dealerInventorySize) || 10,
        description: dealerDescription,
        tradeLicense: "https://picsum.photos/seed/license/800/600",
        nationalId: "https://picsum.photos/seed/id/800/600",
        businessDocuments: ["https://picsum.photos/seed/biz/800/600"],
        onboardingCompletedAt: new Date().toISOString()
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to complete dealer onboarding.");
    } finally {
      setLoading(false);
    }
  };

  const submitOnboardingCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await completeOnboarding({
        accountType: 'company',
        companyName,
        legalName: companyLegalName,
        displayName: companyName,
        brand: companyBrand,
        category: companyCategory,
        country: companyCountry,
        state: companyState,
        city: companyCity,
        address: companyAddress,
        email: companyEmail,
        phone: companyPhone,
        whatsapp: companyWhatsapp,
        website: companyWebsite,
        ceoName: companyCeoName,
        contactName: companyContactName,
        departments: companyDepartments.split(',').map(d => d.trim()).filter(Boolean),
        branches: parseInt(companyBranches) || 1,
        description: companyDescription,
        license: "https://picsum.photos/seed/license_comp/800/600",
        taxCertificate: "https://picsum.photos/seed/tax/800/600",
        companyRegistration: "https://picsum.photos/seed/compreg/800/600",
        onboardingCompletedAt: new Date().toISOString()
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to complete company onboarding.");
    } finally {
      setLoading(false);
    }
  };

  const renderErrorBanner = () => {
    if (!error) return null;

    const isOperationNotAllowed = error.toLowerCase().includes('operation-not-allowed') || 
                                  error.toLowerCase().includes('auth/operation-not-allowed');

    if (isOperationNotAllowed) {
      return (
        <div className="p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 text-neutral-800 dark:text-neutral-200 text-sm flex flex-col gap-4 shadow-md leading-relaxed mb-6 animate-fadeIn">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="space-y-1">
              <h4 className="font-bold text-amber-800 dark:text-amber-300 text-sm">
                Firebase Authentication Setup Required
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                This app is pre-configured with secure email & SMS verification, but the <strong>Email/Password</strong> and <strong>Phone</strong> sign-in providers must be enabled in your Firebase Project Console.
              </p>
            </div>
          </div>

          <div className="bg-white/50 dark:bg-zinc-900/60 rounded-xl p-3.5 border border-neutral-100 dark:border-zinc-800 space-y-2.5 text-xs">
            <p className="font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider text-[9px]">
              How to enable in 30 seconds:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-neutral-600 dark:text-neutral-450 font-medium">
              <li>Click the button below to open your secure Firebase Authentication page.</li>
              <li>Under the <span className="font-bold text-neutral-800 dark:text-neutral-200">Sign-in method</span> tab, click <span className="font-bold text-neutral-800 dark:text-neutral-200">Add new provider</span> (or "Get Started").</li>
              <li>Select and enable <span className="font-bold text-neutral-800 dark:text-neutral-200">Email/Password</span> and <span className="font-bold text-neutral-800 dark:text-neutral-200">Phone</span>, then click Save.</li>
            </ol>
          </div>

          <a
            href="https://console.firebase.google.com/project/gen-lang-client-0545637581/authentication/providers"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer active:scale-[0.99] hover:shadow-md"
          >
            Open Firebase Console
            <Globe className="w-4 h-4" />
          </a>

          <p className="text-[10px] text-center text-neutral-450 dark:text-neutral-500 font-semibold leading-normal">
            No code changes are needed! Once saved, close this modal and try signing up again.
          </p>
        </div>
      );
    }

    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex flex-col gap-1 shadow-sm leading-relaxed mb-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-500" />
          <div className="space-y-1">
            <h4 className="font-bold text-red-700 dark:text-red-300">Authentication Alert</h4>
            <p className="text-xs opacity-90">{error}</p>
          </div>
        </div>
      </div>
    );
  };

  // Render views for primary sign in / signup
  const renderSelection = () => (
    <div className="space-y-6 text-center">
      <div className="flex flex-col items-center">
        {/* Apple style logo or indicator */}
        <div className="w-12 h-12 bg-black dark:bg-white rounded-[15px] flex items-center justify-center mb-6 shadow-md">
          <svg className="w-6 h-6 text-white dark:text-black fill-current" viewBox="0 0 170 170">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.13-1.92-14.34-6.15-2.89-2.38-6.69-6.9-11.39-13.56-7.85-11.05-14.15-25.04-18.91-41.97-4.75-16.92-7.13-31.91-7.13-44.97 0-14.83 3.42-26.68 10.24-35.55 6.83-8.88 15.28-13.37 25.33-13.49 4.34 0 9.28 1.35 14.81 4.05 5.53 2.7 9.1 4.05 10.71 4.05 1.48 0 5.23-1.42 11.22-4.25 5.99-2.83 10.97-4.18 14.94-4.05 10.91.51 19.6 4.7 26.08 12.54 6.47 7.85 9.87 17.23 10.2 28.15-8.88 5.34-15.34 11.83-19.38 19.46-4.05 7.63-6.08 15.82-6.08 24.57 0 10.38 2.89 19.29 8.67 26.74 5.79 7.46 13.12 11.89 22 13.32-1.54 4.5-3.92 9.51-7.13 15.01zM119.22 30.15c0-7.85 2.77-15 8.29-21.43 5.53-6.43 12.19-10.03 19.98-10.8 1.16 8.35-1.74 16.14-8.71 23.35-6.97 7.21-14.34 11.12-22.12 11.73-.84-.57-1.44-1.61-1.44-2.85z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
          Sign In to Pakizzle
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-xs">
          Access your premium dashboard, secure negotiations, and customized vehicle analytics.
        </p>
      </div>

      <div className="space-y-2.5 pt-4">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-neutral-800 dark:text-white hover:bg-neutral-50 dark:hover:bg-zinc-800/80 transition-all h-12 shadow-sm"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><GoogleIcon /> Continue with Google</>}
        </button>

        <button
          type="button"
          onClick={handleAppleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-black text-white dark:bg-white dark:text-black py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black/90 dark:hover:bg-white/90 transition-all h-12 shadow-sm"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Apple className="w-5 h-5" /> Continue with Apple</>}
        </button>

        <button
          type="button"
          onClick={() => setView('email-login')}
          className="w-full flex items-center justify-center gap-3 bg-neutral-100 dark:bg-zinc-800/50 text-neutral-700 dark:text-zinc-200 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 dark:hover:bg-zinc-800 transition-all h-12"
        >
          <Mail className="w-4.5 h-4.5" /> Continue with Email
        </button>

        <button
          type="button"
          onClick={() => setView('phone-entry')}
          className="w-full flex items-center justify-center gap-3 bg-neutral-100 dark:bg-zinc-800/50 text-neutral-700 dark:text-zinc-200 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 dark:hover:bg-zinc-800 transition-all h-12"
        >
          <Smartphone className="w-4.5 h-4.5" /> Continue with Phone
        </button>
      </div>

      <div className="pt-5 border-t border-neutral-100 dark:border-zinc-800/80 space-y-2 text-center">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Forgot your password?{' '}
          <button
            type="button"
            onClick={() => setView('forgot-password')}
            className="text-apple-blue font-bold hover:underline cursor-pointer"
          >
            Reset Password
          </button>
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          New to Pakizzle?{' '}
          <button
            type="button"
            onClick={() => setView('email-signup')}
            className="text-apple-blue font-bold hover:underline cursor-pointer"
          >
            Create Your Account
          </button>
        </p>
      </div>
    </div>
  );

  const renderEmailLogin = () => (
    <form onSubmit={handleEmailLogin} className="space-y-4 pt-1">
      <div className="flex items-center gap-3 pb-3 border-b border-neutral-100 dark:border-zinc-800/80">
        <button type="button" onClick={() => setView('selection')} className="w-8.5 h-8.5 rounded-full bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center text-neutral-600 dark:text-zinc-350 hover:bg-neutral-200">
          <ChevronLeft className="w-4.5 h-4.5" />
        </button>
        <div>
          <h2 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">Sign In with Email</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Please provide your credentials.</p>
        </div>
      </div>

      <div className="space-y-3.5">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 outline-none text-sm text-stone-900 dark:text-white"
            placeholder="john@example.com"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Password</label>
            <button
              type="button"
              onClick={() => setView('forgot-password')}
              className="text-[10px] font-bold text-apple-blue hover:underline"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 outline-none text-sm text-stone-900 dark:text-white"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-zinc-200 p-1 rounded-md transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-apple-blue hover:bg-apple-blue/90 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50 transition-all uppercase tracking-widest text-xs h-12"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Access Showroom <ArrowRight className="w-4 h-4" /></>}
      </button>
    </form>
  );

  const renderEmailSignup = () => {
    // 1. Real-time Full Name assessment
    const nameTrimmed = name.trim();
    const nameParts = nameTrimmed.split(/\s+/).filter(Boolean);
    const hasFirstAndLastName = nameParts.length >= 2;
    const isNameValid = nameTrimmed.length >= 3 && hasFirstAndLastName;

    // 2. Real-time Email Assessment
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // 3. Real-time Password Checklist & Strength calculation
    const hasMinLength = password.length >= 6;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    let strengthScore = 0;
    if (password.length > 0) {
      if (hasMinLength) strengthScore += 1;
      if (hasUppercase && hasLowercase) strengthScore += 1;
      if (hasNumber) strengthScore += 1;
      if (hasSpecial || password.length >= 10) strengthScore += 1;
    }

    // Determine strength tier labels & tailwind coloring
    let strengthLabel = "Not Entered";
    let strengthColorClass = "bg-neutral-200 dark:bg-zinc-800";
    let strengthTextClass = "text-neutral-400 dark:text-zinc-500";

    if (strengthScore === 1) {
      strengthLabel = "Weak";
      strengthColorClass = "bg-rose-500";
      strengthTextClass = "text-rose-500 font-bold";
    } else if (strengthScore === 2) {
      strengthLabel = "Fair";
      strengthColorClass = "bg-amber-500";
      strengthTextClass = "text-amber-500 font-bold";
    } else if (strengthScore === 3) {
      strengthLabel = "Strong";
      strengthColorClass = "bg-apple-blue";
      strengthTextClass = "text-apple-blue font-bold";
    } else if (strengthScore === 4) {
      strengthLabel = "Apple Secure";
      strengthColorClass = "bg-emerald-500 animate-pulse";
      strengthTextClass = "text-emerald-500 font-bold";
    }

    // Determine button state
    const canSubmit = isNameValid && isEmailValid && hasMinLength && (password.length >= 6);

    return (
      <form onSubmit={handleEmailSignup} className="space-y-4 pt-1">
        <div className="flex items-center gap-3 pb-3 border-b border-neutral-100 dark:border-zinc-800/80">
          <button 
            type="button" 
            onClick={() => setView('selection')} 
            className="w-8.5 h-8.5 rounded-full bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center text-neutral-600 dark:text-zinc-350 hover:bg-neutral-200 transition-colors"
          >
            <ChevronLeft className="w-4.5 h-4.5" />
          </button>
          <div>
            <h2 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">Create Account</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Set up your premium credential profile.</p>
          </div>
        </div>

        {renderErrorBanner()}

        <div className="space-y-3.5">
          {/* Full Name Input */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Full Name
              </label>
              {nameTrimmed.length > 0 && !signupErrors.name && (
                <span className={`text-[10px] font-semibold transition-all ${isNameValid ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {isNameValid ? 'Perfect format' : 'Enter first & last name'}
                </span>
              )}
            </div>
            <div className="relative">
              <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                signupErrors.name && showSignupValidation
                  ? 'text-rose-500' 
                  : isNameValid 
                    ? 'text-emerald-500' 
                    : 'text-neutral-400'
              }`} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (signupErrors.name) {
                    setSignupErrors(prev => ({ ...prev, name: undefined }));
                  }
                }}
                className={`w-full pl-10 pr-10 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border outline-none text-sm text-stone-900 dark:text-white transition-all ${
                  signupErrors.name && showSignupValidation
                    ? 'border-rose-500/70 focus:border-rose-500 ring-1 ring-rose-500/15'
                    : nameTrimmed.length === 0 
                      ? 'border-gray-200 dark:border-zinc-800 focus:border-apple-blue' 
                      : isNameValid 
                        ? 'border-emerald-500/50 dark:border-emerald-500/35 focus:border-emerald-500' 
                        : 'border-amber-400/70 dark:border-amber-400/40 focus:border-amber-500'
                }`}
                placeholder="John Doe"
              />
              {isNameValid && !signupErrors.name && (
                <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
              )}
            </div>
            {showSignupValidation && signupErrors.name && (
              <p className="text-[11px] text-rose-500 font-semibold mt-1 flex items-center gap-1.5 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" /> {signupErrors.name}
              </p>
            )}
          </div>

          {/* Email Address Input */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Email Address
              </label>
              {email.length > 0 && !signupErrors.email && (
                <span className={`text-[10px] font-semibold transition-all ${isEmailValid ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {isEmailValid ? 'Valid format' : 'Invalid email structure'}
                </span>
              )}
            </div>
            <div className="relative">
              <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                signupErrors.email && showSignupValidation
                  ? 'text-rose-500'
                  : isEmailValid 
                    ? 'text-emerald-500' 
                    : 'text-neutral-400'
              }`} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (signupErrors.email) {
                    setSignupErrors(prev => ({ ...prev, email: undefined }));
                  }
                }}
                className={`w-full pl-10 pr-10 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border outline-none text-sm text-stone-900 dark:text-white transition-all ${
                  signupErrors.email && showSignupValidation
                    ? 'border-rose-500/70 focus:border-rose-500 ring-1 ring-rose-500/15'
                    : email.length === 0 
                      ? 'border-gray-200 dark:border-zinc-800 focus:border-apple-blue' 
                      : isEmailValid 
                        ? 'border-emerald-500/50 dark:border-emerald-500/35 focus:border-emerald-500' 
                        : 'border-rose-400/70 dark:border-rose-400/40 focus:border-rose-500'
                }`}
                placeholder="john@example.com"
              />
              {isEmailValid && !signupErrors.email && (
                <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
              )}
            </div>
            {showSignupValidation && signupErrors.email && (
              <p className="text-[11px] text-rose-500 font-semibold mt-1 flex items-center gap-1.5 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" /> {signupErrors.email}
              </p>
            )}
          </div>

          {/* Choose Secure Password Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Choose Secure Password
              </label>
              {password.length > 0 && !signupErrors.password && (
                <span className={`text-[10px] transition-all uppercase tracking-wider ${strengthTextClass}`}>
                  Strength: {strengthLabel}
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                signupErrors.password && showSignupValidation
                  ? 'text-rose-500'
                  : strengthScore >= 3 
                    ? 'text-emerald-500' 
                    : 'text-neutral-400'
              }`} />
              <input
                type={showSignupPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (signupErrors.password) {
                    setSignupErrors(prev => ({ ...prev, password: undefined }));
                  }
                }}
                className={`w-full pl-10 pr-10 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border outline-none text-sm text-stone-900 dark:text-white transition-all ${
                  signupErrors.password && showSignupValidation
                    ? 'border-rose-500/70 focus:border-rose-500 ring-1 ring-rose-500/15'
                    : password.length === 0 
                      ? 'border-gray-200 dark:border-zinc-800 focus:border-apple-blue' 
                      : strengthScore >= 3 
                        ? 'border-emerald-500/50 dark:border-emerald-500/35 focus:border-emerald-500' 
                        : 'border-amber-400/70 dark:border-amber-400/40 focus:border-amber-500'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowSignupPassword(prev => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-zinc-200 p-1 rounded-md transition-colors"
              >
                {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {showSignupValidation && signupErrors.password && (
              <p className="text-[11px] text-rose-500 font-semibold mt-1 flex items-center gap-1.5 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" /> {signupErrors.password}
              </p>
            )}

            {/* Password Segmented Strength Indicator */}
            {password.length > 0 && (
              <div className="space-y-2 mt-2 p-3 rounded-xl bg-neutral-50 dark:bg-zinc-900/40 border border-neutral-100 dark:border-zinc-800/50">
                {/* 4 horizontal bars representing password strength */}
                <div className="grid grid-cols-4 gap-1.5 h-1">
                  {[1, 2, 3, 4].map((index) => (
                    <div 
                      key={index}
                      className={`h-full rounded-full transition-all duration-300 ${
                        strengthScore >= index ? strengthColorClass : 'bg-neutral-200 dark:bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>

                {/* Password Criteria Checklist */}
                <div className="space-y-1.5 pt-1 text-[11px]">
                  <div className="flex items-center gap-1.5 text-neutral-600 dark:text-zinc-400">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                      hasMinLength ? 'bg-emerald-500 text-white' : 'bg-neutral-200 dark:bg-zinc-800 text-neutral-500'
                    }`}>
                      {hasMinLength ? '✓' : '●'}
                    </span>
                    <span className={hasMinLength ? 'text-emerald-500 font-medium' : ''}>At least 6 characters</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-neutral-600 dark:text-zinc-400">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                      (hasUppercase && hasLowercase) ? 'bg-emerald-500 text-white' : 'bg-neutral-200 dark:bg-zinc-800 text-neutral-500'
                    }`}>
                      {(hasUppercase && hasLowercase) ? '✓' : '●'}
                    </span>
                    <span className={(hasUppercase && hasLowercase) ? 'text-emerald-500 font-medium' : ''}>Mix of uppercase & lowercase letters</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-neutral-600 dark:text-zinc-400">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                      hasNumber ? 'bg-emerald-500 text-white' : 'bg-neutral-200 dark:bg-zinc-800 text-neutral-500'
                    }`}>
                      {hasNumber ? '✓' : '●'}
                    </span>
                    <span className={hasNumber ? 'text-emerald-500 font-medium' : ''}>Contains at least 1 number</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-xs h-12 shadow-sm bg-apple-blue hover:bg-apple-blue/90 hover:shadow-md cursor-pointer active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Initialize Profile <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    );
  };

  const renderPhoneEntry = () => (
    <form onSubmit={handlePhoneSubmit} className="space-y-4 pt-1">
      <div className="flex items-center gap-3 pb-3 border-b border-neutral-100 dark:border-zinc-800/80">
        <button type="button" onClick={() => setView('selection')} className="w-8.5 h-8.5 rounded-full bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center text-neutral-600 dark:text-zinc-350 hover:bg-neutral-200">
          <ChevronLeft className="w-4.5 h-4.5" />
        </button>
        <div>
          <h2 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">Sign In with Phone</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Instant OTP access via SMS.</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Mobile Phone Number</label>
          <div className="relative">
            <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-400" />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 outline-none text-sm text-stone-900 dark:text-white"
              placeholder="03XXXXXXXXX or +92XXXXXXXXX"
            />
          </div>
          <p className="text-[10px] text-neutral-400 mt-1 font-semibold">Standard network Carrier charges may apply for SMS delivery.</p>
        </div>
        
        {/* Invisible ReCAPTCHA placeholder */}
        <div id="recaptcha-container" className="invisible"></div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-apple-blue hover:bg-apple-blue/90 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50 transition-all uppercase tracking-widest text-xs h-12"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Request Secure OTP <ArrowRight className="w-4 h-4" /></>}
      </button>
    </form>
  );

  const renderOtpVerify = () => (
    <form onSubmit={handleOtpVerify} className="space-y-4 pt-1">
      <div className="flex items-center gap-3 pb-3 border-b border-neutral-100 dark:border-zinc-800/80">
        <button type="button" onClick={() => setView('phone-entry')} className="w-8.5 h-8.5 rounded-full bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center text-neutral-600 dark:text-zinc-350 hover:bg-neutral-200">
          <ChevronLeft className="w-4.5 h-4.5" />
        </button>
        <div>
          <h2 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">Verify SMS OTP</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Please check your messages and provide the 6-digit code.</p>
        </div>
      </div>

      <div className="space-y-3 text-center">
        <div className="space-y-1 text-left">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">One-Time Password Code</label>
          <input
            type="text"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 outline-none text-base text-stone-900 dark:text-white font-mono tracking-[0.6em] text-center"
            placeholder="123456"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || otp.length !== 6}
        className="w-full bg-apple-blue hover:bg-apple-blue/90 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50 transition-all uppercase tracking-widest text-xs h-12"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify Credentials <CheckCircle2 className="w-5 h-5" /></>}
      </button>
    </form>
  );

  const renderForgotPassword = () => (
    <div className="pt-1">
      <div className="flex items-center gap-3 pb-3 mb-4 border-b border-neutral-100 dark:border-zinc-800/80">
        <button 
          type="button" 
          onClick={() => setView('selection')} 
          className="w-8.5 h-8.5 rounded-full bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center text-neutral-600 dark:text-zinc-350 hover:bg-neutral-200 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4.5 h-4.5" />
        </button>
        <div>
          <h2 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">Reset Password</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Recover access to your account securely.</p>
        </div>
      </div>
      <ForgotPasswordCard
        initialIdentifier={email || ''}
        onSuccess={onClose}
        onBackToSignIn={() => setView('selection')}
        className="!p-0 !border-0 !shadow-none !bg-transparent !max-w-none"
      />
    </div>
  );

  // 1. CHOOSE ACCOUNT TYPE
  const renderOnboardingType = () => (
    <div className="space-y-6 pt-2">
      <div className="flex flex-col items-center text-center">
        <div className="w-14 h-14 bg-apple-blue/10 text-apple-blue rounded-[18px] flex items-center justify-center mb-4">
          <Sparkles className="w-7 h-7" />
        </div>
        <h2 className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white leading-none">
          Choose Account Type
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 max-w-sm">
          Select how you want to interact within Pakizzle's luxury classifieds ecosystem. This cannot be changed easily.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3.5 pt-2">
        {[
          {
            type: 'user',
            title: 'Individual User',
            icon: User,
            desc: 'Buy, sell, negotiate, and view elite automotive masterpieces.',
            color: 'from-apple-blue to-blue-600',
            features: ['Unlimited Save Listings', 'Direct Seller Negotiations', 'Immersive Video Reels', 'Custom Comparisons']
          },
          {
            type: 'dealer',
            title: 'Professional Dealer',
            icon: Store,
            desc: 'Secured portal for verified dealers & fleet partners.',
            color: 'from-[#FF9500] to-[#FFCC00]',
            features: ['Live Dealer Dashboard', 'Inventory CRM Sync', 'Trade License Verification', 'Premium Showcase Badges']
          },
          {
            type: 'company',
            title: 'Automotive Enterprise',
            icon: Building2,
            desc: 'Manufacturers, importers, insurance brokers, auto banks.',
            color: 'from-purple-500 to-indigo-600',
            features: ['Corporate Administration Panel', 'Brand Page Customization', 'Department routing', 'Official Industry Verification Badge']
          }
        ].map((item) => {
          const isSelected = accountType === item.type;
          return (
            <motion.div
              key={item.type}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setAccountType(item.type as any)}
              className={`p-5 rounded-[24px] border cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                isSelected 
                  ? 'border-apple-blue bg-apple-blue/[0.03] dark:bg-apple-blue/[0.05] shadow-[0_12px_32px_rgba(0,122,255,0.12)]' 
                  : 'border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-neutral-350 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center text-white bg-gradient-to-br ${item.color} shadow-lg shrink-0`}>
                  <item.icon className="w-5.5 h-5.5" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-1.5 leading-none">
                      {item.title}
                    </h3>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'border-apple-blue bg-apple-blue text-white' : 'border-neutral-300 dark:border-zinc-700'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                    {item.desc}
                  </p>
                  
                  {/* Subtle hover detail */}
                  <div className="flex flex-wrap gap-1.5 pt-3">
                    {item.features.map((feat, idx) => (
                      <span key={idx} className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-zinc-800 text-neutral-500 dark:text-neutral-400">
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="pt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            const auth = getAuth();
            auth.signOut();
            setView('selection');
          }}
          className="px-6 py-4 rounded-xl border border-neutral-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:bg-neutral-50 dark:hover:bg-zinc-800/50 transition-colors"
        >
          Sign Out
        </button>
        <button
          type="button"
          disabled={!accountType}
          onClick={() => {
            if (accountType === 'user') setView('onboarding-form-user');
            else if (accountType === 'dealer') setView('onboarding-form-dealer');
            else if (accountType === 'company') setView('onboarding-form-company');
          }}
          className="flex-1 bg-apple-blue text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-apple-blue/90 disabled:opacity-40 shadow-lg shadow-apple-blue/15 transition-all text-xs uppercase tracking-widest active:scale-98"
        >
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // 2. USER ONBOARDING FORM
  const renderOnboardingFormUser = () => (
    <form onSubmit={submitOnboardingUser} className="space-y-6 pt-1">
      <div className="flex items-center gap-3 pb-3 border-b border-neutral-100 dark:border-zinc-800/80">
        <button type="button" onClick={() => setView('onboarding-type')} className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center text-neutral-600 dark:text-zinc-300 hover:bg-neutral-200">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">Profile Identity</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Let's refine your presence in Pakistan's premium network.</p>
        </div>
      </div>

      {renderErrorBanner()}

      {/* Profile Picture Grid */}
      <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-zinc-900/50 border border-neutral-200/50 dark:border-zinc-800/50 space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Select Profile Picture Preset</span>
        <div className="flex flex-wrap items-center gap-3">
          {USER_AVATARS.map((av, idx) => (
            <div key={idx} className="relative cursor-pointer" onClick={() => setUserPhoto(av)}>
              <img 
                src={av} 
                alt="avatar" 
                className={`w-14 h-14 rounded-full object-cover transition-all duration-300 ${
                  userPhoto === av ? 'ring-4 ring-apple-blue scale-105 shadow-md' : 'opacity-70 hover:opacity-100'
                }`} 
              />
              {userPhoto === av && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-apple-blue text-white flex items-center justify-center border border-white dark:border-[#121214]">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </div>
          ))}
          <div className="relative w-14 h-14 rounded-full border border-dashed border-neutral-350 dark:border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:border-apple-blue transition-all bg-white dark:bg-zinc-900 group">
            <Camera className="w-5.5 h-5.5 text-neutral-400 group-hover:text-apple-blue transition-colors" />
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
              if (e.target.files?.[0]) {
                const url = URL.createObjectURL(e.target.files[0]);
                setUserPhoto(url);
                toast.success("Profile avatar attached!");
              }
            }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">First Name</label>
          <input
            type="text"
            required
            value={userFirstName}
            onChange={(e) => setUserFirstName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all outline-none text-sm text-stone-900 dark:text-white"
            placeholder="Mohammad"
          />
        </div>

        {/* Last Name */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Last Name</label>
          <input
            type="text"
            required
            value={userLastName}
            onChange={(e) => setUserLastName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all outline-none text-sm text-stone-900 dark:text-white"
            placeholder="Zaid"
          />
        </div>

        {/* Username */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Username Identifier</label>
          <div className="relative">
            <input
              type="text"
              required
              value={userUsername}
              onChange={(e) => setUserUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all outline-none text-sm text-stone-900 dark:text-white font-mono"
              placeholder="zaid_pkizzle"
            />
          </div>
          <div className="flex items-center gap-1.5 pt-1.5">
            <Sparkles className="w-3.5 h-3.5 text-apple-blue" />
            <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Suggested:</span>
            <button
              type="button"
              onClick={() => setUserUsername(usernameSuggestion)}
              className="text-[10px] font-mono font-bold text-apple-blue hover:underline bg-apple-blue/5 dark:bg-apple-blue/10 px-2 py-0.5 rounded-full"
            >
              {usernameSuggestion}
            </button>
          </div>
        </div>

        {/* Dob */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Date of Birth</label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-400 pointer-events-none" />
            <input
              type="date"
              required
              value={userDob}
              onChange={(e) => setUserDob(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all outline-none text-sm text-stone-900 dark:text-white"
            />
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Gender</label>
          <select
            value={userGender}
            onChange={(e) => setUserGender(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all outline-none text-sm text-stone-900 dark:text-white"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="rather_not_say">Rather Not Say</option>
          </select>
        </div>

        {/* Country */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Country</label>
          <div className="relative">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-400" />
            <input
              type="text"
              readOnly
              value={userCountry}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-zinc-800/80 border border-transparent outline-none text-sm text-stone-600 dark:text-stone-400"
            />
          </div>
        </div>

        {/* City */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">City</label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-400" />
            <input
              type="text"
              required
              value={userCity}
              onChange={(e) => setUserCity(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all outline-none text-sm text-stone-900 dark:text-white"
              placeholder="Karachi, Lahore, Islamabad"
            />
          </div>
        </div>

        {/* Referral Code */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Referral Code (Optional)</label>
          <input
            type="text"
            value={userReferralCode}
            onChange={(e) => setUserReferralCode(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all outline-none text-sm text-stone-900 dark:text-white font-mono tracking-widest uppercase"
            placeholder="PKZ-9921"
          />
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={userTerms}
            onChange={(e) => setUserTerms(e.target.checked)}
            className="mt-0.5 rounded text-apple-blue focus:ring-apple-blue focus:ring-offset-0"
          />
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
            I certify that all details specified are authentic and I accept Pakizzle's secure Identity Verification Protocol and Marketplace Integrity Terms.
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={userNewsletter}
            onChange={(e) => setUserNewsletter(e.target.checked)}
            className="mt-0.5 rounded text-apple-blue focus:ring-apple-blue focus:ring-offset-0"
          />
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
            Notify me via weekly newsletter of new luxury vehicle launches, custom inspections, and VIP events.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || !userTerms}
        className="w-full bg-apple-blue hover:bg-apple-blue/90 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50 transition-all uppercase tracking-widest text-xs h-13"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Finalize Integration <CheckCircle2 className="w-5 h-5" /></>}
      </button>
    </form>
  );

  // 3. DEALER ONBOARDING FORM
  const renderOnboardingFormDealer = () => (
    <form onSubmit={submitOnboardingDealer} className="space-y-6 pt-1 max-h-[75vh] overflow-y-auto px-1 custom-scrollbar">
      <div className="flex items-center gap-3 pb-3 border-b border-neutral-100 dark:border-zinc-800/80 sticky top-0 bg-white dark:bg-[#121214] z-10">
        <button type="button" onClick={() => setView('onboarding-type')} className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center text-neutral-600 dark:text-zinc-300 hover:bg-neutral-200">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">Dealer Registration</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Let's connect your showroom records with the global classifieds system.</p>
        </div>
      </div>

      {renderErrorBanner()}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2 p-5 rounded-2xl bg-orange-500/5 border border-orange-500/10 flex items-start gap-3.5">
          <Info className="w-5.5 h-5.5 text-orange-500 shrink-0 mt-0.5" />
          <p className="text-xs text-orange-600 dark:text-orange-400 leading-relaxed font-semibold">
            SECURED BUSINESS ACCOUNT: Dealer profiles are kept as "Pending Approval" until our Field Security Analysts manually verify your Trade License and National identity documents. Approvals usually resolve in under 2 hours.
          </p>
        </div>

        {/* Business Name */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Business Showcase Name</label>
          <div className="relative">
            <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-400" />
            <input
              type="text"
              required
              value={dealerBusinessName}
              onChange={(e) => setDealerBusinessName(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent outline-none text-sm text-stone-900 dark:text-white"
              placeholder="Showroom Name (e.g. Premium Motors Lahore)"
            />
          </div>
        </div>

        {/* Dealer Name */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Commercial Contact Person</label>
          <input
            type="text"
            required
            value={dealerName}
            onChange={(e) => setDealerName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent outline-none text-sm text-stone-900 dark:text-white"
            placeholder="Zaid Butt"
          />
        </div>

        {/* Owner Name */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Business Owner Name</label>
          <input
            type="text"
            required
            value={dealerOwnerName}
            onChange={(e) => setDealerOwnerName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent outline-none text-sm text-stone-900 dark:text-white"
            placeholder="Al-Haj Mohammad Zaid"
          />
        </div>

        {/* Dealer Specialization Checkboxes */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Showroom Specializations</label>
          <div className="flex flex-wrap gap-2">
            {['Used Cars', 'New Cars', 'Motorcycles', 'Trucks', 'Heavy Equipment'].map((type) => {
              const isChecked = dealerTypes.includes(type);
              return (
                <button
                  type="button"
                  key={type}
                  onClick={() => {
                    setDealerTypes(prev => 
                      isChecked ? prev.filter(t => t !== type) : [...prev, type]
                    );
                  }}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                    isChecked 
                      ? 'bg-apple-blue border-apple-blue text-white shadow-md' 
                      : 'border-neutral-200 dark:border-zinc-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Business Registration */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Trade License Number</label>
          <input
            type="text"
            required
            value={dealerRegNumber}
            onChange={(e) => setDealerRegNumber(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent outline-none text-sm text-stone-900 dark:text-white font-mono"
            placeholder="LHR-DLR-9921"
          />
        </div>

        {/* Tax Number */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Business NTN / Tax Number</label>
          <input
            type="text"
            required
            value={dealerTaxNumber}
            onChange={(e) => setDealerTaxNumber(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent outline-none text-sm text-stone-900 dark:text-white font-mono"
            placeholder="NTN-77239-1"
          />
        </div>

        {/* Business Email */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Showroom Public Email</label>
          <input
            type="email"
            required
            value={dealerEmail}
            onChange={(e) => setDealerEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent outline-none text-sm text-stone-900 dark:text-white"
            placeholder="showroom@domain.pk"
          />
        </div>

        {/* Business Phone */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Showroom Landline / Mobile</label>
          <input
            type="tel"
            required
            value={dealerPhone}
            onChange={(e) => setDealerPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent outline-none text-sm text-stone-900 dark:text-white"
            placeholder="0213-XXXXXXX"
          />
        </div>

        {/* WhatsApp */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">WhatsApp Lead Receiver</label>
          <input
            type="tel"
            required
            value={dealerWhatsapp}
            onChange={(e) => setDealerWhatsapp(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent outline-none text-sm text-stone-900 dark:text-white"
            placeholder="03XXXXXXXXX"
          />
        </div>

        {/* City */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Primary Hub City</label>
          <input
            type="text"
            required
            value={dealerCity}
            onChange={(e) => setDealerCity(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent outline-none text-sm text-stone-900 dark:text-white"
            placeholder="Lahore, Karachi, Rawalpindi"
          />
        </div>

        {/* Address */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Showroom Floor Physical Address</label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-neutral-400" />
            <textarea
              required
              rows={2}
              value={dealerAddress}
              onChange={(e) => setDealerAddress(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent outline-none text-sm text-stone-900 dark:text-white"
              placeholder="Main Jail Road, Opposite FC College, Lahore"
            />
          </div>
        </div>

        {/* Google Map coordinates */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Google Map Coordinates (Optional)</label>
          <div className="relative">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-400" />
            <input
              type="text"
              value={dealerWebsite}
              onChange={(e) => setDealerWebsite(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent outline-none text-sm text-stone-900 dark:text-white"
              placeholder="31.5204, 74.3587"
            />
          </div>
        </div>

        {/* Business Stats Grid */}
        <div className="grid grid-cols-3 gap-3 md:col-span-2">
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Years Active</label>
            <input
              type="number"
              min={1}
              value={dealerYearsInBusiness}
              onChange={(e) => setDealerYearsInBusiness(e.target.value)}
              className="w-full px-3 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 outline-none text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Staff Count</label>
            <input
              type="number"
              min={1}
              value={dealerEmployeesCount}
              onChange={(e) => setDealerEmployeesCount(e.target.value)}
              className="w-full px-3 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 outline-none text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Avg Fleet Size</label>
            <input
              type="number"
              min={1}
              value={dealerInventorySize}
              onChange={(e) => setDealerInventorySize(e.target.value)}
              className="w-full px-3 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 outline-none text-sm"
            />
          </div>
        </div>

        {/* Interactive Drag and Drop Document Upload */}
        <div className="md:col-span-2 space-y-3.5 p-5 rounded-[22px] bg-neutral-50 dark:bg-zinc-900/40 border border-neutral-200/60 dark:border-zinc-800/80">
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Commercial Verification Dossier</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Trade License", state: dealerTradeLicense, setter: setDealerTradeLicense },
              { label: "Owner National ID", state: dealerNationalId, setter: setDealerNationalId },
              { label: "Business Docs", state: dealerBizDocs, setter: setDealerBizDocs }
            ].map((docItem, idx) => (
              <div key={idx} className="relative p-4 rounded-xl border border-dashed border-neutral-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col items-center justify-center text-center cursor-pointer group hover:border-apple-blue transition-all">
                <UploadCloud className={`w-6 h-6 mb-1.5 ${docItem.state ? 'text-apple-green' : 'text-neutral-400 group-hover:text-apple-blue'} transition-colors`} />
                <span className="text-[10px] font-bold text-neutral-800 dark:text-zinc-300 leading-none">{docItem.label}</span>
                <span className="text-[8px] text-neutral-400 mt-1 font-semibold">{docItem.state ? "Dossier Attached" : "Drag & Drop PDF/JPG"}</span>
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      docItem.setter(e.target.files[0]);
                      toast.success(`${docItem.label} secure payload configured!`);
                    }
                  }} 
                />
                {docItem.state && (
                  <div className="absolute top-2 right-2 w-4.5 h-4.5 rounded-full bg-apple-green text-white flex items-center justify-center border border-white dark:border-[#121214]">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Showroom Brand Narrative</label>
          <textarea
            rows={3}
            value={dealerDescription}
            onChange={(e) => setDealerDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent outline-none text-sm text-stone-900 dark:text-white"
            placeholder="Describe your showroom, customer philosophy, premium warranties, etc."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-apple-blue hover:bg-apple-blue/90 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50 transition-all uppercase tracking-widest text-xs h-13 mt-4"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Request Showroom Licensing <CheckCircle2 className="w-5 h-5" /></>}
      </button>
    </form>
  );

  // 4. COMPANY ONBOARDING FORM
  const renderOnboardingFormCompany = () => (
    <form onSubmit={submitOnboardingCompany} className="space-y-6 pt-1 max-h-[75vh] overflow-y-auto px-1 custom-scrollbar">
      <div className="flex items-center gap-3 pb-3 border-b border-neutral-100 dark:border-zinc-800/80 sticky top-0 bg-white dark:bg-[#121214] z-10">
        <button type="button" onClick={() => setView('onboarding-type')} className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center text-neutral-600 dark:text-zinc-300 hover:bg-neutral-200">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">Enterprise Hub Onboarding</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Let's set up your brand and corporate administration terminal.</p>
        </div>
      </div>

      {renderErrorBanner()}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2 p-5 rounded-2xl bg-purple-500/5 border border-purple-500/10 flex items-start gap-3.5">
          <Award className="w-5.5 h-5.5 text-purple-600 shrink-0 mt-0.5" />
          <p className="text-xs text-purple-700 dark:text-purple-400 leading-relaxed font-semibold">
            SECURED ENTERPRISE PROFILE: Corporate records are kept in review mode until the legal team verifies your business license, corporate registrations, and CEO authorization dossiers. Real-time updates push automatically on completion.
          </p>
        </div>

        {/* Company Name */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Enterprise Public Name</label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-400" />
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent outline-none text-sm text-stone-900 dark:text-white"
              placeholder="Toyota Indus Motors Pakistan"
            />
          </div>
        </div>

        {/* Legal Legal Name */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Registered Legal Name</label>
          <input
            type="text"
            required
            value={companyLegalName}
            onChange={(e) => setCompanyLegalName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent outline-none text-sm text-stone-900 dark:text-white"
            placeholder="Indus Motor Company Limited"
          />
        </div>

        {/* Brand Represented */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Manufacturer Brand represented</label>
          <input
            type="text"
            required
            value={companyBrand}
            onChange={(e) => setCompanyBrand(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent outline-none text-sm text-stone-900 dark:text-white"
            placeholder="Toyota"
          />
        </div>

        {/* Business Category Dropdown */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Business Category</label>
          <select
            value={companyCategory}
            onChange={(e) => setCompanyCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent outline-none text-sm text-stone-900 dark:text-white"
          >
            <option value="Manufacturer">OEM Manufacturer</option>
            <option value="Importer">Official Importer</option>
            <option value="Exporter">Exporter</option>
            <option value="Dealer Group">Automotive Dealer Group</option>
            <option value="Finance Company">Financing Bank</option>
            <option value="Insurance Company">Insurance Underwriter</option>
            <option value="Auto Parts Company">Aftermarket Auto Parts Manufacturer</option>
          </select>
        </div>

        {/* CEO Name */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Chief Executive Officer (CEO)</label>
          <input
            type="text"
            required
            value={companyCeoName}
            onChange={(e) => setCompanyCeoName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent outline-none text-sm text-stone-900 dark:text-white"
            placeholder="Ali Asghar Jamali"
          />
        </div>

        {/* Contact Name */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Authorized Contact Officer</label>
          <input
            type="text"
            required
            value={companyContactName}
            onChange={(e) => setCompanyContactName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent outline-none text-sm text-stone-900 dark:text-white"
            placeholder="Mohammad Zaid"
          />
        </div>

        {/* Corporate Email */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Corporate Domain Email</label>
          <input
            type="email"
            required
            value={companyEmail}
            onChange={(e) => setCompanyEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent outline-none text-sm text-stone-900 dark:text-white"
            placeholder="corporate@toyota-indus.com"
          />
        </div>

        {/* Office Phone */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Enterprise Office Phone</label>
          <input
            type="tel"
            required
            value={companyPhone}
            onChange={(e) => setCompanyPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent outline-none text-sm text-stone-900 dark:text-white"
            placeholder="021-111-869-682"
          />
        </div>

        {/* WhatsApp Line */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">WhatsApp Lead Channel</label>
          <input
            type="tel"
            required
            value={companyWhatsapp}
            onChange={(e) => setCompanyWhatsapp(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent outline-none text-sm text-stone-900 dark:text-white"
            placeholder="03XXXXXXXXX"
          />
        </div>

        {/* Corporate Web Site */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Official Web Portal</label>
          <div className="relative">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-400" />
            <input
              type="url"
              required
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent outline-none text-sm text-stone-900 dark:text-white"
              placeholder="https://www.toyota-indus.com"
            />
          </div>
        </div>

        {/* City and State */}
        <div className="grid grid-cols-2 gap-3 md:col-span-2">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Corporate Head City</label>
            <input
              type="text"
              required
              value={companyCity}
              onChange={(e) => setCompanyCity(e.target.value)}
              className="w-full px-3 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 outline-none text-sm"
              placeholder="Karachi"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Province / State</label>
            <input
              type="text"
              required
              value={companyState}
              onChange={(e) => setCompanyState(e.target.value)}
              className="w-full px-3 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 outline-none text-sm"
              placeholder="Sindh"
            />
          </div>
        </div>

        {/* Corporate Address */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Headquarters Registered Address</label>
          <textarea
            required
            rows={2}
            value={companyAddress}
            onChange={(e) => setCompanyAddress(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent outline-none text-sm text-stone-900 dark:text-white"
            placeholder="Plot No. NWZ/1/P-1, Port Qasim Industrial Zone, Bin Qasim, Karachi"
          />
        </div>

        {/* Departments and Branches count */}
        <div className="grid grid-cols-2 gap-3 md:col-span-2">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Corporate Divisions</label>
            <input
              type="text"
              value={companyDepartments}
              onChange={(e) => setCompanyDepartments(e.target.value)}
              className="w-full px-3 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 outline-none text-sm"
              placeholder="Sales, Marketing, Logistics, CSR"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Branch Offices Count</label>
            <input
              type="number"
              min={1}
              value={companyBranches}
              onChange={(e) => setCompanyBranches(e.target.value)}
              className="w-full px-3 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 outline-none text-sm"
            />
          </div>
        </div>

        {/* Enterprise Dossier Uploads */}
        <div className="md:col-span-2 space-y-3.5 p-5 rounded-[22px] bg-neutral-50 dark:bg-zinc-900/40 border border-neutral-200/60 dark:border-zinc-800/80">
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Legal Enterprise Dossier</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Business License", state: companyLicense, setter: setCompanyLicense },
              { label: "NTN Certificate", state: companyTaxCertificate, setter: setCompanyTaxCertificate },
              { label: "Registration Doc", state: companyRegistrationDoc, setter: setCompanyRegistrationDoc }
            ].map((docItem, idx) => (
              <div key={idx} className="relative p-4 rounded-xl border border-dashed border-neutral-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col items-center justify-center text-center cursor-pointer group hover:border-apple-blue transition-all">
                <FileText className={`w-6 h-6 mb-1.5 ${docItem.state ? 'text-apple-green' : 'text-neutral-400 group-hover:text-apple-blue'} transition-colors`} />
                <span className="text-[10px] font-bold text-neutral-800 dark:text-zinc-300 leading-none">{docItem.label}</span>
                <span className="text-[8px] text-neutral-400 mt-1 font-semibold">{docItem.state ? "Credentials Configured" : "Attach Legal PDF"}</span>
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      docItem.setter(e.target.files[0]);
                      toast.success(`${docItem.label} secure payload configured!`);
                    }
                  }} 
                />
                {docItem.state && (
                  <div className="absolute top-2 right-2 w-4.5 h-4.5 rounded-full bg-apple-green text-white flex items-center justify-center border border-white dark:border-[#121214]">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Company Description */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Enterprise Brand Narrative</label>
          <textarea
            rows={3}
            value={companyDescription}
            onChange={(e) => setCompanyDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-apple-blue focus:border-transparent outline-none text-sm text-stone-900 dark:text-white"
            placeholder="Official OEM brand bio, national market goals, custom automotive developments."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-apple-blue hover:bg-apple-blue/90 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50 transition-all uppercase tracking-widest text-xs h-13 mt-4"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Request Corporate Listing Clearance <CheckCircle2 className="w-5 h-5" /></>}
      </button>
    </form>
  );

  const isOnboardingView = view === 'onboarding-type' || 
                           view === 'onboarding-form-user' || 
                           view === 'onboarding-form-dealer' || 
                           view === 'onboarding-form-company';

  const renderOnboardingSteps = (currentStep: number) => {
    const steps = [
      { label: "Account Tier", desc: "Select structure" },
      { label: "Registry Details", desc: "Configure identity" },
      { label: "Ecosystem Access", desc: "Finalize credentials" }
    ];
    return (
      <div className="px-6 py-4 bg-neutral-50/60 dark:bg-zinc-900/30 border-b border-neutral-100 dark:border-zinc-850">
        <div className="flex items-center justify-between max-w-lg mx-auto relative">
          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isCompleted = currentStep > stepNum;
            const isActive = currentStep === stepNum;
            return (
              <div key={idx} className="flex items-center gap-2.5 relative z-10 flex-1 last:flex-none">
                <div className="flex items-center gap-2">
                  <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/15' 
                      : isActive 
                        ? 'bg-apple-blue text-white ring-4 ring-apple-blue/15 shadow-sm' 
                        : 'bg-neutral-200 dark:bg-zinc-800 text-neutral-500 dark:text-zinc-450'
                  }`}>
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : stepNum}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className={`text-[10px] font-black uppercase tracking-wider leading-none ${
                      isActive ? 'text-apple-blue' : isCompleted ? 'text-emerald-500' : 'text-neutral-400 dark:text-zinc-500'
                    }`}>
                      {step.label}
                    </p>
                    <p className="text-[8.5px] text-neutral-450 dark:text-neutral-500 font-semibold mt-0.5 leading-none">
                      {step.desc}
                    </p>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className="flex-1 h-[2px] mx-2 hidden sm:block">
                    <div className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-neutral-250 dark:bg-zinc-800'
                    }`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (typeof document === 'undefined') return null;

  // Determine modal width based on active view for smooth fluid width layout transitions
  const getModalSizeClass = () => {
    if (view === 'onboarding-form-dealer' || view === 'onboarding-form-company') {
      return 'max-w-4xl';
    }
    if (view === 'onboarding-form-user' || view === 'onboarding-type') {
      return 'max-w-2xl';
    }
    return 'max-w-md';
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto flex items-start sm:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              // Only let user close the modal if they are NOT in a mandatory onboarding flow
              if (user && profile?.isPendingOnboarding) {
                toast.warning("Mandatory Onboarding Required", {
                  description: "You must complete profile activation to access Pakizzle."
                });
                return;
              }
              onClose();
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 28, stiffness: 380 }}
            className={`relative my-auto w-full ${getModalSizeClass()} bg-white dark:bg-[#121214] border border-neutral-100 dark:border-zinc-800/80 rounded-[32px] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden z-[10000]`}
          >
            {/* Close Button (Hidden during mandatory onboarding to protect ecosystem flow integrity) */}
            {(!user || !profile?.isPendingOnboarding) && (
              <div className="absolute top-5 right-5 z-[10010]">
                <button 
                  onClick={onClose}
                  className="w-8.5 h-8.5 rounded-full bg-neutral-100 dark:bg-zinc-800/60 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-zinc-700/80 transition-colors border border-neutral-200/40 dark:border-zinc-700/40 text-neutral-500 dark:text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Google / Apple-Style Interactive Steps Progress Bar */}
            {isOnboardingView && renderOnboardingSteps(
              view === 'onboarding-type' ? 1 : (loading ? 3 : 2)
            )}

            <div className="p-6 sm:p-9 pt-9 overflow-y-auto flex-1 max-h-[85vh] custom-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                >
                  {view === 'selection' && renderSelection()}
                  {view === 'email-login' && (
                    <div className="pt-1">
                      <div className="flex items-center gap-3 pb-3 mb-4 border-b border-neutral-100 dark:border-zinc-800/80">
                        <button 
                          type="button" 
                          onClick={() => setView('selection')} 
                          className="w-8.5 h-8.5 rounded-full bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center text-neutral-600 dark:text-zinc-350 hover:bg-neutral-200 transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4.5 h-4.5" />
                        </button>
                        <div>
                          <h2 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">Sign In</h2>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Access verified listings & portfolios.</p>
                        </div>
                      </div>
                      <SignInCard 
                        className="!p-0 !bg-transparent !border-0 !shadow-none !max-w-none"
                        onSuccess={onClose}
                        onSwitchToSignUp={() => setView('email-signup')}
                        onForgotPassword={() => setView('forgot-password')}
                      />
                    </div>
                  )}
                  {view === 'email-signup' && (
                    <div className="pt-1">
                      <div className="flex items-center gap-3 pb-3 mb-4 border-b border-neutral-100 dark:border-zinc-800/80">
                        <button 
                          type="button" 
                          onClick={() => setView('selection')} 
                          className="w-8.5 h-8.5 rounded-full bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center text-neutral-600 dark:text-zinc-350 hover:bg-neutral-200 transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4.5 h-4.5" />
                        </button>
                        <div>
                          <h2 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">Create Account</h2>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Single secure identity for Pakizzle.</p>
                        </div>
                      </div>
                      <SignUpCard 
                        className="!p-0 !bg-transparent !border-0 !shadow-none !max-w-none"
                        onSuccess={onClose}
                        onSwitchToSignIn={() => setView('email-login')}
                      />
                    </div>
                  )}
                  {view === 'phone-entry' && renderPhoneEntry()}
                  {view === 'otp-verify' && renderOtpVerify()}
                  {view === 'forgot-password' && renderForgotPassword()}
                  {view === 'onboarding-type' && renderOnboardingType()}
                  {view === 'onboarding-form-user' && renderOnboardingFormUser()}
                  {view === 'onboarding-form-dealer' && renderOnboardingFormDealer()}
                  {view === 'onboarding-form-company' && renderOnboardingFormCompany()}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
