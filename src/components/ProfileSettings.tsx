import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  MapPin, 
  ShieldCheck, 
  Lock, 
  ChevronRight, 
  Camera, 
  CheckCircle2, 
  Globe, 
  Calendar, 
  UserCircle,
  ArrowLeft,
  Save,
  Bell,
  CreditCard,
  Smartphone,
  Plus,
  Trash2,
  ExternalLink,
  CreditCard as CardIcon,
  History,
  Settings2,
  Check,
  Loader2,
  X,
  Home,
  Briefcase,
  MoreVertical,
  Map,
  RefreshCw,
  LogOut,
  Key,
  Fingerprint,
  AlertTriangle,
  Shield,
  Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { cn } from '../lib/utils';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import VerificationModal from './VerificationModal';
import { Address, PaymentMethod, UserProfile } from '../types';
import { toast } from 'sonner';

import UserInspections from './UserInspections';
import UserInsurance from './UserInsurance';
import UserFinancing from './UserFinancing';
import { SessionManager } from './Auth/SessionManager';
import { PasskeyManagementCard } from './Auth/PasskeyManagementCard';
import { StepUpVerificationModal, SensitiveActionType } from './Auth/StepUpVerificationModal';

type SettingsSection = 'profile' | 'addresses' | 'account' | 'security' | 'sessions' | 'notifications' | 'billing' | 'inspections' | 'insurance' | 'financing';

import { optimizeImage } from '../lib/imageOptimizer';

export default function ProfileSettings() {
  const { 
    user, 
    profile, 
    updateProfile, 
    sendPhoneOtp, 
    verifyPhoneOtp, 
    setPhoneVerified,
    sendOtp,
    verifyOtp,
    setOtpVerified,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod
  } = useAuth();
  const { setNotification } = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Phone Verification State
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isEditPhoneModalOpen, setIsEditPhoneModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [newPhone, setNewPhone] = useState(profile?.phone || '');
  const [phoneOtp, setPhoneOtp] = useState(["", "", "", "", "", ""]);
  const [phoneOtpError, setPhoneOtpError] = useState("");
  const [isPhoneOtpSending, setIsPhoneOtpSending] = useState(false);
  const [isPhoneOtpVerifying, setIsPhoneOtpVerifying] = useState(false);
  const [phoneOtpTimer, setPhoneOtpTimer] = useState(0);
  const [phoneDemoCode, setPhoneDemoCode] = useState<string | null>(null);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [isRefreshingDevices, setIsRefreshingDevices] = useState(false);

  // Step-Up Verification state for sensitive account actions
  const [stepUpAction, setStepUpAction] = useState<SensitiveActionType | null>(null);
  const [pendingActionCallback, setPendingActionCallback] = useState<(() => void) | null>(null);

  const executeWithStepUp = (action: SensitiveActionType, callback: () => void) => {
    setPendingActionCallback(() => callback);
    setStepUpAction(action);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section') as SettingsSection;
    if (section && ['profile', 'addresses', 'account', 'security', 'sessions', 'notifications', 'billing', 'inspections', 'insurance', 'financing'].includes(section)) {
      setActiveSection(section);
    }
  }, [location.search]);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
  const [emailOtpError, setEmailOtpError] = useState("");
  const [isEmailOtpSending, setIsEmailOtpSending] = useState(false);
  const [isEmailOtpVerifying, setIsEmailOtpVerifying] = useState(false);
  const [emailDemoCode, setEmailDemoCode] = useState<string | null>(null);

  const handleSendEmailOtp = async () => {
    setIsEmailOtpSending(true);
    setEmailOtpError("");
    try {
      const code = await sendOtp(user?.email || "");
      if (code) {
        setEmailDemoCode(code);
        setIsEmailModalOpen(true);
      } else {
        setEmailOtpError("Failed to send OTP.");
      }
    } catch (error) {
      setEmailOtpError("An error occurred.");
    } finally {
      setIsEmailOtpSending(false);
    }
  };

  const handleVerifyEmail = async () => {
    const code = emailOtp.join("");
    if (code.length !== 6) {
      setEmailOtpError("Please enter the 6-digit code.");
      return;
    }
    setIsEmailOtpVerifying(true);
    setEmailOtpError("");
    try {
      const success = await verifyOtp(user?.email || "", code);
      if (success) {
        await setOtpVerified();
        setIsEmailModalOpen(false);
        setNotification?.('Email verified successfully!');
      } else {
        setEmailOtpError("Invalid code.");
      }
    } catch (error) {
      setEmailOtpError("Verification failed.");
    } finally {
      setIsEmailOtpVerifying(false);
    }
  };

  const handleEmailOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...emailOtp];
    newOtp[index] = value;
    setEmailOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`email-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleEmailOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !emailOtp[index] && index > 0) {
      const prevInput = document.getElementById(`email-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleUpdateNotificationSettings = async (key: keyof typeof notificationSettings) => {
    const newSettings = { ...notificationSettings, [key]: !notificationSettings[key] };
    setNotificationSettings(newSettings);
    try {
      await updateProfile({ notificationSettings: newSettings });
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  const handleRefreshDevices = () => {
    setIsRefreshingDevices(true);
    setTimeout(() => {
      setIsRefreshingDevices(false);
      setNotification?.('Device sessions updated in real-time.');
    }, 1500);
  };
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [notificationSettings, setNotificationSettings] = useState({
    messages: profile?.notificationSettings?.messages ?? true,
    listings: profile?.notificationSettings?.listings ?? true,
    offers: profile?.notificationSettings?.offers ?? false,
    security: profile?.notificationSettings?.security ?? true
  });
  
  const [cardForm, setCardForm] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    isDefault: false
  });
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [addressForm, setAddressForm] = useState({
    type: 'Home' as 'Home' | 'Office' | 'Other',
    label: '',
    address: '',
    city: 'Lahore',
    isDefault: false
  });

  // Form State
  const [formData, setFormData] = useState({
    firstName: profile?.displayName?.split(' ')[0] || '',
    lastName: profile?.displayName?.split(' ')[1] || '',
    username: profile?.username || '',
    dob: profile?.dob || '',
    nationality: profile?.nationality || 'Pakistan',
    gender: profile?.gender || 'Prefer not to say'
  });

  const [trustedDevices, setTrustedDevices] = useState([
    { id: '1', name: 'iPhone 15 Pro', location: 'Lahore, Pakistan', lastActive: 'Active Now', isCurrent: true, type: 'mobile' },
    { id: '2', name: 'MacBook Pro 14"', location: 'Lahore, Pakistan', lastActive: '2 hours ago', isCurrent: false, type: 'laptop' },
    { id: '3', name: 'iPad Air', location: 'Karachi, Pakistan', lastActive: 'Yesterday', isCurrent: false, type: 'tablet' },
  ]);

  const handleSignOutDevice = (deviceId: string) => {
    setTrustedDevices(prev => prev.filter(d => d.id !== deviceId));
    setNotification?.('Device signed out successfully.');
    setIsDeviceModalOpen(false);
  };

  const handleSignOutAllDevices = () => {
    setTrustedDevices(prev => prev.filter(d => d.isCurrent));
    setNotification?.('All other devices signed out successfully.');
  };

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.displayName?.split(' ')[0] || '',
        lastName: profile.displayName?.split(' ')[1] || '',
        username: profile.username || '',
        dob: profile.dob || '',
        nationality: profile.nationality || 'Pakistan',
        gender: profile.gender || 'Prefer not to say'
      });
    }
  }, [profile]);

  useEffect(() => {
    let interval: any;
    if (phoneOtpTimer > 0) {
      interval = setInterval(() => {
        setPhoneOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phoneOtpTimer]);

  const handleSendPhoneOtp = async () => {
    if (!profile?.phone) {
      setNotification?.('Please add a phone number first.');
      return;
    }
    setIsPhoneOtpSending(true);
    setPhoneOtpError("");
    const code = await sendPhoneOtp(profile.phone);
    if (code) {
      setPhoneDemoCode(code);
      setPhoneOtpTimer(60);
      setIsPhoneModalOpen(true);
    } else {
      setPhoneOtpError("Failed to send OTP. Please try again.");
    }
    setIsPhoneOtpSending(false);
  };

  const handleVerifyPhoneOtp = async () => {
    const code = phoneOtp.join("");
    if (code.length !== 6) {
      setPhoneOtpError("Please enter the 6-digit code.");
      return;
    }

    setIsPhoneOtpVerifying(true);
    setPhoneOtpError("");
    const success = await verifyPhoneOtp(profile?.phone || "", code);
    
    if (success) {
      await setPhoneVerified();
      setIsPhoneModalOpen(false);
      setNotification?.('Phone number verified successfully!');
    } else {
      setPhoneOtpError("Invalid or expired OTP code.");
    }
    setIsPhoneOtpVerifying(false);
  };

  const handleUpdatePhone = async () => {
    if (!newPhone.trim()) return;
    setIsSaving(true);
    try {
      await updateProfile({ phone: newPhone, isPhoneVerified: false });
      setIsEditPhoneModalOpen(false);
      setNotification?.('Phone number updated. Please verify it.');
    } catch (error) {
      setNotification?.('Failed to update phone number.');
    }
    setIsSaving(false);
  };

  const handlePhoneOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...phoneOtp];
    newOtp[index] = value;
    setPhoneOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`phone-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePhoneOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !phoneOtp[index] && index > 0) {
      const prevInput = document.getElementById(`phone-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      await updateProfile({
        displayName: fullName || profile?.displayName || 'User',
        username: formData.username,
        dob: formData.dob,
        nationality: formData.nationality,
        gender: formData.gender
      });
      setNotification?.('Profile updated successfully!');
    } catch (error) {
      setNotification?.('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      setNotification?.('Please select an image file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setNotification?.('Image size should be less than 10MB.');
      return;
    }

    setIsUploading(true);
    try {
      const optimized = await optimizeImage(file);
      if (optimized) {
        await updateProfile({ photoURL: optimized.dataUrl });
        setNotification?.(`Profile picture updated (Optimized: ${optimized.reduction} smaller)`);
      }
      setIsUploading(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      setNotification?.('Failed to upload image.');
      setIsUploading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      type: 'Home',
      label: '',
      address: '',
      city: 'Lahore',
      isDefault: (profile?.addresses?.length || 0) === 0
    });
    setIsAddressModalOpen(true);
  };

  const handleEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({
      type: addr.type,
      label: addr.label || '',
      address: addr.address,
      city: addr.city,
      isDefault: addr.isDefault
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async () => {
    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, addressForm);
        setNotification?.('Address updated!');
      } else {
        await addAddress(addressForm);
        setNotification?.('Address added!');
      }
      setIsAddressModalOpen(false);
    } catch (error) {
      setNotification?.('Failed to save address.');
    }
  };

  const handleDeleteAddress = (id: string) => {
    setAddressToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;
    try {
      await deleteAddress(addressToDelete);
      setNotification?.('Address deleted!');
      setIsDeleteConfirmOpen(false);
      setAddressToDelete(null);
    } catch (error) {
      setNotification?.('Failed to delete address.');
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await setDefaultAddress(id);
      setNotification?.('Default address updated.');
    } catch (error) {
      setNotification?.('Failed to update default address.');
    }
  };

  const toggleNotification = (id: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    const idStr = String(id);
    setNotification?.(`${idStr.charAt(0).toUpperCase() + idStr.slice(1)} preference updated!`);
  };

  const handleAddCard = async () => {
    try {
      const brand = cardForm.number.startsWith('4') ? 'Visa' : 'Mastercard';
      const last4 = cardForm.number.slice(-4);
      
      await addPaymentMethod({
        brand,
        last4,
        expiry: cardForm.expiry,
        isDefault: (profile?.paymentMethods?.length || 0) === 0 || cardForm.isDefault
      });
      
      setIsAddCardModalOpen(false);
      setCardForm({ number: '', expiry: '', cvc: '', name: '', isDefault: false });
      setNotification?.('Payment method added!');
    } catch (error) {
      setNotification?.('Failed to add payment method.');
    }
  };

  const handleRemoveCard = async (id: string) => {
    try {
      await removePaymentMethod(id);
      setNotification?.('Payment method removed.');
    } catch (error) {
      setNotification?.('Failed to remove card.');
    }
  };

  const handleSetDefaultCard = async (id: string) => {
    try {
      await setDefaultPaymentMethod(id);
      setNotification?.('Default payment method updated.');
    } catch (error) {
      setNotification?.('Failed to update default payment method.');
    }
  };

  const handlePasswordChange = () => {
    if (passwordForm.new !== passwordForm.confirm) {
      setNotification?.('Passwords do not match.');
      return;
    }
    setIsPasswordModalOpen(false);
    setPasswordForm({ current: '', new: '', confirm: '' });
    setNotification?.('Password updated successfully!');
  };

  const handleSectionChange = (id: SettingsSection) => {
    setActiveSection(id);
    setIsMobileMenuOpen(false);
  };

  const sections = [
    { id: 'profile', label: 'Basic Info', icon: User, category: 'Profile' },
    { id: 'addresses', label: 'My Addresses', icon: MapPin, category: 'Profile' },
    { id: 'account', label: 'Account Details', icon: UserCircle, category: 'Account' },
    { id: 'notifications', label: 'Notifications', icon: Bell, category: 'Account' },
    { id: 'security', label: 'Security', icon: Lock, category: 'Security' },
    { id: 'sessions', label: 'Active Sessions', icon: Smartphone, category: 'Security' },
    { id: 'billing', label: 'Billing & Payments', icon: CreditCard, category: 'Security' },
    { id: 'inspections', label: 'My Inspections', icon: History, category: 'Account' },
    { id: 'insurance', label: 'My Insurance', icon: Shield, category: 'Account' },
    { id: 'financing', label: 'My Financing', icon: CreditCard, category: 'Account' },
  ];

  return (
    <div className="min-h-screen bg-apple-bg text-apple-text font-sans selection:bg-apple-blue/20">
      <div className="max-w-[1440px] mx-auto flex h-screen overflow-hidden relative">
        
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex flex-col w-[320px] bg-apple-card-bg/80 backdrop-blur-xl border-r border-apple-border/50 p-8 shrink-0">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-apple-blue rounded-xl flex items-center justify-center shadow-lg shadow-apple-blue/20">
              <User className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Settings</h1>
          </div>

          <nav className="space-y-8">
            {['Profile', 'Account', 'Security'].map((category) => (
              <div key={category}>
                <h2 className="text-[11px] font-bold text-apple-text-muted uppercase tracking-widest mb-4 px-4">
                  {category}
                </h2>
                <div className="space-y-1">
                  {sections.filter(s => s.category === category).map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id as SettingsSection)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group",
                        activeSection === section.id 
                          ? "bg-apple-blue text-white shadow-lg shadow-apple-blue/20" 
                          : "hover:bg-apple-gray text-apple-text-muted hover:text-apple-text"
                      )}
                    >
                      <section.icon className={cn(
                        "w-5 h-5 transition-colors",
                        activeSection === section.id ? "text-white" : "text-apple-text-muted group-hover:text-apple-blue"
                      )} />
                      <span className="text-sm font-semibold">{section.label}</span>
                      {activeSection === section.id && (
                        <motion.div layoutId="active-pill" className="ml-auto">
                          <ChevronRight className="w-4 h-4 opacity-50" />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-auto pt-8 border-t border-apple-border/50">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm font-bold text-apple-text-muted hover:text-apple-text transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to App
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-apple-bg relative">
          
          {/* Mobile Navigation Overlay */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="lg:hidden fixed inset-0 z-50 bg-apple-card-bg p-6 overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                  <button onClick={() => navigate('/')} className="p-2 bg-apple-gray rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-8">
                  {['Profile', 'Account', 'Security'].map((category) => (
                    <div key={category}>
                      <h2 className="text-xs font-bold text-apple-text-muted uppercase tracking-widest mb-4">
                        {category}
                      </h2>
                      <div className="bg-apple-card-bg/30 rounded-3xl overflow-hidden border border-apple-border/30">
                        {sections.filter(s => s.category === category).map((section, idx, arr) => (
                          <button
                            key={section.id}
                            onClick={() => handleSectionChange(section.id as SettingsSection)}
                            className={cn(
                              "w-full flex items-center gap-4 p-5 transition-colors active:bg-apple-gray/50",
                              idx !== arr.length - 1 && "border-b border-apple-border/30"
                            )}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center",
                              activeSection === section.id ? "bg-apple-blue text-white" : "bg-apple-card-bg text-apple-text-muted"
                            )}>
                              <section.icon className="w-5 h-5" />
                            </div>
                            <span className="text-base font-bold">{section.label}</span>
                            <ChevronRight className="ml-auto w-5 h-5 text-apple-text-muted/30" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Section Content */}
          <div className="p-6 md:p-12 lg:p-16 max-w-4xl mx-auto">
            
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center gap-4 mb-8">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 bg-apple-card-bg rounded-xl shadow-sm border border-apple-border/50"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold capitalize">{activeSection.replace('-', ' ')}</h2>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {activeSection === 'profile' && (
                  <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                      <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">My Profile</h1>
                        <p className="text-apple-text-muted font-medium">Manage your public presence and personal details.</p>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => navigate(`/profile/${user?.uid}`)}
                          className="px-5 py-2.5 bg-apple-card-bg border border-apple-border rounded-full text-sm font-bold hover:bg-apple-gray transition-colors flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Public Profile
                        </button>
                        <button 
                          onClick={handleSave}
                          disabled={isSaving}
                          className="px-5 py-2.5 bg-apple-blue text-white rounded-full text-sm font-bold shadow-lg shadow-apple-blue/20 hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSaving ? <Loader2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>

                    {/* Profile Header Card */}
                    <div className="bg-apple-card-bg rounded-[32px] p-8 shadow-apple-soft border border-apple-border/50 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-apple-blue/5 rounded-full blur-3xl -mr-32 -mt-32" />
                      
                      <div className="relative group">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-[40px] overflow-hidden ring-4 ring-apple-gray/30 shadow-2xl transition-transform duration-500 group-hover:scale-105 bg-apple-card-bg flex items-center justify-center">
                          {isUploading ? (
                            <Loader2 className="w-10 h-10 text-apple-blue animate-spin" />
                          ) : (
                            <img 
                              src={profile?.photoURL || user?.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'} 
                              alt={profile?.displayName || ''} 
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <button 
                          onClick={handleImageClick}
                          disabled={isUploading}
                          className="absolute bottom-2 right-2 p-3 bg-apple-blue text-white rounded-2xl shadow-xl hover:scale-110 transition-transform disabled:opacity-50"
                        >
                          <Camera className="w-5 h-5" />
                        </button>
                        <input 
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          accept="image/*"
                        />
                      </div>

                      <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                          <h2 className="text-2xl font-bold">{profile?.displayName || user?.displayName || 'User Name'}</h2>
                          <CheckCircle2 className="w-6 h-6 text-apple-blue" />
                        </div>
                        <p className="text-apple-blue font-bold text-sm mb-2">@{profile?.username || 'username'}</p>
                        <p className="text-apple-text-muted font-medium mb-6">Joined on {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '...'}</p>
                        
                        {/* Verification Banner */}
                        <div className="bg-apple-blue/5 border border-apple-blue/10 rounded-2xl p-4 flex items-center gap-4">
                          <div className="w-12 h-12 bg-apple-card-bg rounded-xl flex items-center justify-center shadow-sm">
                            <ShieldCheck className="w-6 h-6 text-apple-blue" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-bold">Get a verified badge</h4>
                            <p className="text-xs text-apple-text-muted font-medium">Enhance your credibility and visibility.</p>
                          </div>
                          <button 
                            onClick={() => navigate('/verification')}
                            className="px-4 py-2 bg-apple-card-bg border border-apple-border rounded-lg text-xs font-bold hover:bg-apple-gray transition-colors"
                          >
                            Get Started
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Form Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Personal Info */}
                      <div className="bg-apple-card-bg rounded-[32px] p-8 shadow-apple-soft border border-apple-border/50 space-y-6">
                        <h3 className="text-lg font-bold mb-4">Personal Information</h3>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-apple-text-muted uppercase tracking-widest px-1">App Username</label>
                            <div className="relative">
                              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-apple-text-muted font-bold">@</span>
                              <input 
                                type="text" 
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                                className="w-full pl-10 pr-5 py-4 bg-apple-gray/50 rounded-2xl border border-transparent focus:border-apple-blue/30 focus:bg-white outline-none transition-all font-bold text-apple-blue"
                                placeholder="unique_username"
                              />
                            </div>
                            <p className="text-[10px] text-apple-text-muted font-bold px-1">This will be your unique identifier on Pakizzle. Must match your ID for verification.</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-apple-text-muted uppercase tracking-widest px-1">First Name</label>
                            <input 
                              type="text" 
                              value={formData.firstName}
                              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                              className="w-full px-5 py-4 bg-apple-gray/50 rounded-2xl border border-transparent focus:border-apple-blue/30 focus:bg-white outline-none transition-all font-medium"
                              placeholder="Enter first name"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-apple-text-muted uppercase tracking-widest px-1">Last Name</label>
                            <input 
                              type="text" 
                              value={formData.lastName}
                              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                              className="w-full px-5 py-4 bg-apple-gray/50 rounded-2xl border border-transparent focus:border-apple-blue/30 focus:bg-white outline-none transition-all font-medium"
                              placeholder="Enter last name"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Account Details */}
                      <div className="bg-apple-card-bg rounded-[32px] p-8 shadow-apple-soft border border-apple-border/50 space-y-6">
                        <h3 className="text-lg font-bold mb-4">Account Details</h3>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-apple-text-muted uppercase tracking-widest px-1 flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              Date of Birth
                            </label>
                            <input 
                              type="date" 
                              value={formData.dob}
                              onChange={(e) => setFormData({...formData, dob: e.target.value})}
                              className="w-full px-5 py-4 bg-apple-gray/50 rounded-2xl border border-transparent focus:border-apple-blue/30 focus:bg-white outline-none transition-all font-medium"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-apple-text-muted uppercase tracking-widest px-1 flex items-center gap-2">
                              <Globe className="w-3 h-3" />
                              Nationality
                            </label>
                            <select 
                              value={formData.nationality}
                              onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                              className="w-full px-5 py-4 bg-apple-gray/50 rounded-2xl border border-transparent focus:border-apple-blue/30 focus:bg-white outline-none transition-all font-medium appearance-none"
                            >
                              <option>Pakistan</option>
                              <option>United Arab Emirates</option>
                              <option>United Kingdom</option>
                              <option>United States</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Gender Selection - Full Width */}
                      <div className="md:col-span-2 bg-apple-card-bg rounded-[32px] p-8 shadow-apple-soft border border-apple-border/50">
                        <h3 className="text-lg font-bold mb-6">Gender</h3>
                        <div className="flex flex-wrap gap-4">
                          {['Male', 'Female', 'Prefer not to say'].map((gender) => (
                            <button 
                              key={gender}
                              onClick={() => setFormData({...formData, gender})}
                              className={cn(
                                "px-8 py-4 rounded-2xl border font-bold text-sm transition-all active:scale-95",
                                formData.gender === gender 
                                  ? "border-apple-blue bg-apple-blue/5 text-apple-blue shadow-sm" 
                                  : "border-apple-border hover:border-apple-blue hover:text-apple-blue"
                              )}
                            >
                              {gender}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'addresses' && (
                  <div className="space-y-8">
                    <div className="flex items-end justify-between">
                      <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">My Addresses</h1>
                        <p className="text-apple-text-muted font-medium">Manage your delivery and billing locations.</p>
                      </div>
                      <button 
                        onClick={handleAddAddress}
                        className="flex items-center gap-2 px-6 py-3 bg-apple-blue text-white rounded-2xl font-bold shadow-lg shadow-apple-blue/20 hover:scale-105 transition-all active:scale-95"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Add New</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
                      {profile?.addresses?.map((addr) => (
                        <motion.div 
                          layout
                          key={addr.id} 
                          className={cn(
                            "bg-apple-card-bg rounded-[32px] p-8 shadow-apple-soft border transition-all relative overflow-hidden group",
                            addr.isDefault ? "border-apple-blue/30 ring-1 ring-apple-blue/10" : "border-apple-border/50 hover:border-apple-blue/30"
                          )}
                        >
                          {addr.isDefault && (
                            <div className="absolute top-0 right-0 px-4 py-1.5 bg-apple-blue text-white text-[10px] font-bold uppercase tracking-widest rounded-bl-2xl">
                              Default
                            </div>
                          )}
                          
                          <div className="flex items-start gap-6">
                            <div className={cn(
                              "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                              addr.type === 'Home' ? "bg-blue-50 text-apple-blue" : 
                              addr.type === 'Office' ? "bg-orange-50 text-orange-500" : 
                              "bg-purple-50 text-purple-500"
                            )}>
                              {addr.type === 'Home' ? <Home className="w-7 h-7" /> : 
                               addr.type === 'Office' ? <Briefcase className="w-7 h-7" /> : 
                               <MapPin className="w-7 h-7" />}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-lg font-bold truncate">{addr.label || addr.type}</h4>
                              </div>
                              <p className="text-apple-text-muted font-medium text-sm leading-relaxed mb-6 line-clamp-2">
                                {addr.address}, {addr.city}
                              </p>
                              
                              <div className="flex items-center gap-4">
                                <button 
                                  onClick={() => handleEditAddress(addr)}
                                  className="text-xs font-bold text-apple-blue hover:underline"
                                >
                                  Edit
                                </button>
                                {!addr.isDefault && (
                                  <button 
                                    onClick={() => handleSetDefaultAddress(addr.id)}
                                    className="text-xs font-bold text-apple-text-muted hover:text-apple-blue transition-colors"
                                  >
                                    Set as Default
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleDeleteAddress(addr.id)}
                                  className="text-xs font-bold text-apple-red hover:underline ml-auto"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {(!profile?.addresses || profile.addresses.length === 0) && (
                        <div className="col-span-full py-20 text-center bg-apple-card-bg rounded-[32px] border-2 border-dashed border-apple-border flex flex-col items-center">
                          <div className="w-20 h-20 bg-apple-card-bg rounded-[30px] flex items-center justify-center mb-6">
                            <Map className="w-10 h-10 text-apple-text-muted/30" />
                          </div>
                          <h3 className="text-xl font-bold mb-2">No addresses yet</h3>
                          <p className="text-apple-text-muted font-medium mb-8 max-w-xs">Add your delivery addresses for a faster checkout experience.</p>
                          <button 
                            onClick={handleAddAddress}
                            className="px-8 py-3 bg-apple-blue text-white rounded-2xl font-bold shadow-lg shadow-apple-blue/20 hover:scale-105 transition-all active:scale-95"
                          >
                            Add your first address
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeSection === 'notifications' && (
                  <div className="space-y-8">
                    <div className="flex items-end justify-between">
                      <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Notifications</h1>
                        <p className="text-apple-text-muted font-medium">Choose what you want to be notified about.</p>
                      </div>
                      <button 
                        onClick={() => {
                          const allOn = Object.values(notificationSettings).every(v => v);
                          const nextValue = !allOn;
                          setNotificationSettings({
                            messages: nextValue,
                            listings: nextValue,
                            offers: nextValue,
                            security: nextValue
                          });
                          setNotification?.(nextValue ? 'All notifications enabled' : 'All notifications disabled');
                        }}
                        className="text-sm font-bold text-apple-blue hover:underline"
                      >
                        {Object.values(notificationSettings).every(v => v) ? 'Disable All' : 'Enable All'}
                      </button>
                    </div>

                    <div className="bg-apple-card-bg rounded-[32px] overflow-hidden shadow-apple-soft border border-apple-border/50">
                      {[
                        { id: 'messages', title: 'New Messages', desc: 'Get notified when someone sends you a message.' },
                        { id: 'listings', title: 'Listing Updates', desc: 'Alerts for price drops or status changes on your wishlist.' },
                        { id: 'offers', title: 'Offers & Promotions', desc: 'Receive special deals and marketing emails.' },
                        { id: 'security', title: 'Security Alerts', desc: 'Important notifications about your account security.' },
                      ].map((item, idx, arr) => (
                        <div key={item.id} className={cn(
                          "flex items-center justify-between p-8 group transition-colors hover:bg-apple-gray/20",
                          idx !== arr.length - 1 && "border-b border-apple-border/50"
                        )}>
                          <div className="flex-1 pr-8">
                            <h4 className="font-bold mb-1 group-hover:text-apple-blue transition-colors">{item.title}</h4>
                            <p className="text-sm text-apple-text-muted font-medium">{item.desc}</p>
                          </div>
                          <button 
                            onClick={() => toggleNotification(item.id as keyof typeof notificationSettings)}
                            className={cn(
                              "w-14 h-8 rounded-full transition-all relative p-1 outline-none ring-offset-2 focus:ring-2 ring-apple-blue/50",
                              notificationSettings[item.id as keyof typeof notificationSettings] ? "bg-apple-blue" : "bg-apple-card-bg"
                            )}
                          >
                            <motion.div 
                              animate={{ x: notificationSettings[item.id as keyof typeof notificationSettings] ? 24 : 0 }}
                              className="w-6 h-6 bg-apple-card-bg rounded-full shadow-sm"
                            />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="bg-apple-blue/5 rounded-[32px] p-8 border border-apple-blue/10 flex items-center gap-6">
                      <div className="w-14 h-14 bg-apple-card-bg rounded-2xl flex items-center justify-center shadow-sm">
                        <Smartphone className="w-7 h-7 text-apple-blue" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold mb-1">Push Notifications</h4>
                        <p className="text-sm text-apple-text-muted font-medium">Enable push notifications on this device for real-time alerts.</p>
                      </div>
                      <button className="px-6 py-3 bg-apple-card-bg border border-apple-border rounded-xl text-sm font-bold hover:bg-apple-gray transition-colors">
                        Enable
                      </button>
                    </div>
                  </div>
                )}

                {activeSection === 'sessions' && (
                  <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                      <div>
                        <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">Device Sessions</h1>
                        <p className="text-sm md:text-base text-apple-text-muted font-medium">
                          Review, manage, and remotely revoke active devices authorized to access your account.
                        </p>
                      </div>
                    </div>
                    <div className="bg-apple-card-bg rounded-[32px] md:rounded-[40px] p-6 md:p-8 shadow-apple-soft border border-apple-border/50">
                      <SessionManager />
                    </div>
                  </div>
                )}

                {activeSection === 'financing' && (
                  <UserFinancing />
                )}

                {activeSection === 'inspections' && (
                  <UserInspections />
                )}

                {activeSection === 'insurance' && (
                  <UserInsurance />
                )}

                {activeSection === 'billing' && (
                  <div className="space-y-8">
                    <div className="flex items-end justify-between">
                      <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Billing & Payments</h1>
                        <p className="text-apple-text-muted font-medium">Manage your payment methods and transaction history.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                      {/* Payment Methods */}
                      <div className="bg-apple-card-bg rounded-[32px] p-8 shadow-apple-soft border border-apple-border/50">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="text-lg font-bold">Payment Methods</h3>
                          <button 
                            onClick={() => executeWithStepUp('payout_update', () => setIsAddCardModalOpen(true))}
                            className="flex items-center gap-2 px-4 py-2 bg-apple-blue/10 text-apple-blue rounded-xl font-bold text-sm hover:bg-apple-blue hover:text-white transition-all"
                          >
                            <Plus className="w-4 h-4" />
                            Add Card
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {profile?.paymentMethods?.map((card) => (
                            <motion.div 
                              layout
                              key={card.id} 
                              className={cn(
                                "p-6 rounded-[24px] border transition-all relative overflow-hidden group",
                                card.isDefault ? "bg-apple-text text-white border-apple-text" : "bg-apple-card-bg border-apple-border/50 hover:border-apple-blue/30"
                              )}
                            >
                              <div className="flex justify-between items-start mb-8">
                                <div className={cn(
                                  "w-12 h-8 rounded-lg flex items-center justify-center shadow-sm",
                                  card.isDefault ? "bg-white/10" : "bg-apple-card-bg"
                                )}>
                                  <CardIcon className={cn("w-6 h-6", card.isDefault ? "text-white" : "text-apple-text-muted")} />
                                </div>
                                <div className="flex items-center gap-2">
                                  {!card.isDefault && (
                                    <button 
                                      onClick={() => handleSetDefaultCard(card.id)}
                                      className={cn("p-2 rounded-full transition-colors", card.isDefault ? "hover:bg-white/10 text-white/50" : "hover:bg-apple-blue/10 text-apple-text-muted hover:text-apple-blue")}
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => handleRemoveCard(card.id)}
                                    className={cn("p-2 rounded-full transition-colors", card.isDefault ? "hover:bg-white/10 text-white/50 hover:text-white" : "hover:bg-apple-red/10 text-apple-text-muted hover:text-apple-red")}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold tracking-wider">•••• •••• •••• {card.last4}</h4>
                                </div>
                                <div className="flex justify-between items-center">
                                  <p className={cn("text-[10px] font-bold uppercase tracking-widest", card.isDefault ? "text-white/60" : "text-apple-text-muted")}>
                                    Expires {card.expiry}
                                  </p>
                                  {card.isDefault && (
                                    <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-md uppercase tracking-widest">Default</span>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                          
                          {(!profile?.paymentMethods || profile.paymentMethods.length === 0) && (
                            <div className="col-span-full py-12 text-center bg-apple-gray/20 rounded-[24px] border border-dashed border-apple-border">
                              <p className="text-sm text-apple-text-muted font-medium">No payment methods added.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Recent Transactions */}
                      <div className="bg-apple-card-bg rounded-[32px] p-8 shadow-apple-soft border border-apple-border/50">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="text-lg font-bold">Recent Transactions</h3>
                          <button className="text-sm font-bold text-apple-blue hover:underline flex items-center gap-1">
                            View All <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          {[
                            { id: 'TXN-001', date: 'Oct 12, 2023', amount: 'Rs 5,000', desc: 'Featured Listing - Honda Civic', status: 'Completed', type: 'Listing' },
                            { id: 'TXN-002', date: 'Sep 28, 2023', amount: 'Rs 2,500', desc: 'Verification Fee', status: 'Completed', type: 'Service' },
                            { id: 'TXN-003', date: 'Sep 15, 2023', amount: 'Rs 1,200', desc: 'Boost Package', status: 'Refunded', type: 'Ads' },
                          ].map((txn) => (
                            <div key={txn.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-apple-gray/30 transition-colors group">
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                                  txn.status === 'Completed' ? "bg-green-50 text-apple-green" : "bg-red-50 text-apple-red"
                                )}>
                                  {txn.type === 'Listing' ? <CardIcon className="w-6 h-6" /> : <History className="w-6 h-6" />}
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold">{txn.desc}</h4>
                                  <p className="text-xs text-apple-text-muted font-medium">{txn.date} • {txn.id}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-sm">{txn.amount}</div>
                                <div className={cn(
                                  "text-[10px] font-bold uppercase tracking-wider",
                                  txn.status === 'Completed' ? "text-apple-green" : "text-apple-red"
                                )}>
                                  {txn.status}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'account' && (
                  <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                      <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Account</h1>
                        <p className="text-apple-text-muted font-medium">Manage your Apple-level security and sign-in preferences.</p>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-apple-green/10 text-apple-green rounded-full text-xs font-bold">
                        <ShieldCheck className="w-4 h-4" />
                        Account Secure
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                      {/* Sign-In & Security Card */}
                      <div className="bg-apple-card-bg rounded-[40px] p-8 md:p-10 shadow-apple-soft border border-apple-border/50">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 bg-apple-blue/10 rounded-2xl flex items-center justify-center">
                            <Lock className="w-6 h-6 text-apple-blue" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">Sign-In & Security</h3>
                            <p className="text-sm text-apple-text-muted font-medium">Manage how you sign in and keep your account safe.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest px-1">Primary Email</label>
                            <div className="flex items-center gap-3 px-6 py-5 bg-apple-gray/30 rounded-[24px] border border-transparent text-apple-text font-medium transition-all hover:bg-apple-gray/50">
                              <Globe className="w-4 h-4 text-apple-text-muted" />
                              <span className="flex-1 truncate">{user?.email}</span>
                              <div className="flex items-center gap-3">
                                {profile?.isEmailVerified ? (
                                  <span className="text-[10px] font-bold text-apple-green bg-apple-green/10 px-2 py-1 rounded-md uppercase">Verified</span>
                                ) : (
                                  <button 
                                    onClick={handleSendEmailOtp}
                                    disabled={isEmailOtpSending}
                                    className="text-xs text-apple-blue font-bold hover:underline"
                                  >
                                    Verify
                                  </button>
                                )}
                                <button 
                                  onClick={() => setNotification?.('Email change is currently disabled for security.')}
                                  className="p-2 hover:bg-apple-border rounded-full transition-colors"
                                >
                                  <ChevronRight className="w-4 h-4 text-apple-text-muted" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest px-1">Trusted Phone Number</label>
                            <div className="flex items-center gap-3 px-6 py-5 bg-apple-gray/30 rounded-[24px] border border-transparent text-apple-text font-medium transition-all hover:bg-apple-gray/50">
                              <Smartphone className="w-4 h-4 text-apple-text-muted" />
                              <span className="flex-1 truncate">{profile?.phone || '+92 300 1234567'}</span>
                              <div className="flex items-center gap-3">
                                {profile?.isPhoneVerified ? (
                                  <span className="text-[10px] font-bold text-apple-green bg-apple-green/10 px-2 py-1 rounded-md uppercase">Verified</span>
                                ) : (
                                  <button 
                                    onClick={handleSendPhoneOtp}
                                    disabled={isPhoneOtpSending}
                                    className="text-xs text-apple-blue font-bold hover:underline"
                                  >
                                    Verify
                                  </button>
                                )}
                                <button 
                                  onClick={() => {
                                    executeWithStepUp('phone_change', () => {
                                      setNewPhone(profile?.phone || '');
                                      setIsEditPhoneModalOpen(true);
                                    });
                                  }}
                                  className="p-2 hover:bg-apple-border rounded-full transition-colors"
                                >
                                  <ChevronRight className="w-4 h-4 text-apple-text-muted" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-10 pt-10 border-t border-apple-border/50">
                          <PasskeyManagementCard />
                        </div>

                        <div className="mt-10 pt-10 border-t border-apple-border/50">
                          <SessionManager />
                        </div>
                      </div>

                      {/* Danger Zone */}
                      <div className="bg-red-50/30 rounded-[40px] p-8 border border-apple-red/10">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-apple-red font-bold">Danger Zone</h4>
                          <Trash2 className="w-5 h-5 text-apple-red/30" />
                        </div>
                        <p className="text-sm text-apple-text-muted font-medium mb-6 leading-relaxed">
                          Once you delete your account, all of your listings, messages, and personal data will be permanently removed. This action cannot be undone.
                        </p>
                        <button 
                          onClick={() => {
                            executeWithStepUp('account_deletion', () => {
                              toast.success('Identity verified. Account deletion request submitted.');
                            });
                          }}
                          className="px-8 py-4 bg-apple-red text-white rounded-2xl text-sm font-bold shadow-lg shadow-apple-red/20 hover:bg-red-600 transition-all active:scale-95"
                        >
                          Delete My Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'security' && (
                  <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                      <div className="text-center md:text-left">
                        <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">Security</h1>
                        <p className="text-sm md:text-base text-apple-text-muted font-medium">Manage your account protection and sign-in security.</p>
                      </div>
                      <div className="flex items-center justify-center md:justify-start gap-2 px-4 py-2 bg-apple-blue/10 text-apple-blue rounded-full text-[10px] md:text-xs font-bold self-center md:self-auto">
                        <Shield className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        Advanced Protection Active
                      </div>
                    </div>

                    {/* Security Recommendations */}
                    <div className="bg-apple-gray/30 rounded-[32px] md:rounded-[40px] p-6 md:p-8 border border-apple-blue/10">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
                        <div className="w-12 h-12 bg-apple-blue rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-apple-blue/20">
                          <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base md:text-lg font-bold mb-1">Security Recommendations</h3>
                          <p className="text-xs md:text-sm text-apple-text-muted font-medium mb-4 leading-relaxed">
                            Review your trusted phone number and recovery email to ensure your account remains accessible if you lose your password.
                          </p>
                          <button className="text-sm text-apple-blue font-bold hover:underline flex items-center gap-1 mx-auto sm:mx-0">
                            Review Now <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:gap-8">
                      {/* Sign-In Security Card */}
                      <div className="bg-apple-card-bg rounded-[32px] md:rounded-[40px] p-6 md:p-10 shadow-apple-soft border border-apple-border/50">
                        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 md:mb-10 text-center sm:text-left">
                          <div className="w-12 h-12 bg-apple-green/10 rounded-2xl flex items-center justify-center">
                            <Fingerprint className="w-6 h-6 text-apple-green" />
                          </div>
                          <div>
                            <h3 className="text-lg md:text-xl font-bold">Sign-In Security</h3>
                            <p className="text-xs md:text-sm text-apple-text-muted font-medium">Manage how you access your Pakizzle account.</p>
                          </div>
                        </div>

                        <div className="space-y-4 md:space-y-6">
                          <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 p-5 md:p-6 bg-apple-gray/30 rounded-[24px] md:rounded-[32px] group hover:bg-apple-gray/50 transition-all text-center sm:text-left">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-apple-card-bg rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                              <Smartphone className="w-6 h-6 md:w-7 md:h-7 text-apple-text" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm md:text-base font-bold mb-0.5">Two-Factor Authentication</h4>
                              <p className="text-xs md:text-sm text-apple-text-muted font-medium">Your account is protected with 2FA using your trusted devices.</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="px-3 py-1 bg-apple-green/10 text-apple-green text-[10px] font-bold uppercase rounded-full">On</span>
                              <button className="p-2 hover:bg-apple-border rounded-full transition-colors">
                                <ChevronRight className="w-5 h-5 text-apple-text-muted" />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 p-5 md:p-6 bg-apple-gray/30 rounded-[24px] md:rounded-[32px] group hover:bg-apple-gray/50 transition-all text-center sm:text-left">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-apple-card-bg rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                              <Lock className="w-6 h-6 md:w-7 md:h-7 text-apple-text" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm md:text-base font-bold mb-0.5">Password</h4>
                              <p className="text-xs md:text-sm text-apple-text-muted font-medium">Last updated 3 months ago. Strong and unique.</p>
                            </div>
                            <button 
                              onClick={() => setIsPasswordModalOpen(true)}
                              className="w-full sm:w-auto px-6 py-3 bg-apple-card-bg rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
                            >
                              Change
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Advanced Security Card */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="bg-apple-card-bg rounded-[32px] md:rounded-[40px] p-6 md:p-8 shadow-apple-soft border border-apple-border/50 text-center sm:text-left">
                          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-apple-blue/10 rounded-xl flex items-center justify-center">
                              <Key className="w-5 h-5 text-apple-blue" />
                            </div>
                            <h4 className="font-bold">App-Specific Passwords</h4>
                          </div>
                          <p className="text-xs md:text-sm text-apple-text-muted font-medium mb-6 leading-relaxed">
                            Generate unique passwords to sign in to third-party apps that don't support Pakizzle natively.
                          </p>
                          <button className="text-sm text-apple-blue font-bold hover:underline flex items-center gap-1 mx-auto sm:mx-0">
                            Generate Password <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="bg-apple-card-bg rounded-[32px] md:rounded-[40px] p-6 md:p-8 shadow-apple-soft border border-apple-border/50 text-center sm:text-left">
                          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-apple-card-bg rounded-xl flex items-center justify-center">
                              <ShieldCheck className="w-5 h-5 text-apple-text" />
                            </div>
                            <h4 className="font-bold">Security Keys</h4>
                          </div>
                          <p className="text-xs md:text-sm text-apple-text-muted font-medium mb-6 leading-relaxed">
                            Use physical security keys as an additional factor for the highest level of account protection.
                          </p>
                          <button className="text-sm text-apple-blue font-bold hover:underline flex items-center gap-1 mx-auto sm:mx-0">
                            Add Security Key <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Session Management & Login Activity Console */}
                      <div className="bg-apple-card-bg rounded-[32px] md:rounded-[40px] p-6 md:p-10 shadow-apple-soft border border-apple-border/50">
                        <SessionManager />
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
      {/* Address Modal */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddressModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-apple-card-bg rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 sm:p-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold tracking-tight">
                    {editingAddress ? 'Edit Address' : 'New Address'}
                  </h2>
                  <button 
                    onClick={() => setIsAddressModalOpen(false)}
                    className="w-10 h-10 rounded-full bg-apple-card-bg flex items-center justify-center hover:bg-apple-border transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Type Selector */}
                  <div className="flex p-1 bg-apple-card-bg rounded-2xl">
                    {(['Home', 'Office', 'Other'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setAddressForm({ ...addressForm, type })}
                        className={cn(
                          "flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                          addressForm.type === type 
                            ? "bg-apple-card-bg text-apple-text shadow-apple-soft" 
                            : "text-apple-text-muted hover:text-apple-text"
                        )}
                      >
                        {type === 'Home' ? <Home className="w-4 h-4" /> : 
                         type === 'Office' ? <Briefcase className="w-4 h-4" /> : 
                         <MapPin className="w-4 h-4" />}
                        {type}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest px-1">Label (Optional)</label>
                      <input 
                        type="text" 
                        value={addressForm.label}
                        onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                        placeholder="e.g. My Apartment, Parent's House"
                        className="w-full px-5 py-4 bg-apple-gray/50 rounded-2xl border border-transparent focus:border-apple-blue/30 focus:bg-apple-card-bg outline-none transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest px-1">Full Address</label>
                      <textarea 
                        value={addressForm.address}
                        onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                        placeholder="Street address, apartment, suite, etc."
                        rows={3}
                        className="w-full px-5 py-4 bg-apple-gray/50 rounded-2xl border border-transparent focus:border-apple-blue/30 focus:bg-apple-card-bg outline-none transition-all font-medium resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest px-1">City</label>
                        <select 
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          className="w-full px-5 py-4 bg-apple-gray/50 rounded-2xl border border-transparent focus:border-apple-blue/30 focus:bg-apple-card-bg outline-none transition-all font-medium appearance-none"
                        >
                          <option>Lahore</option>
                          <option>Karachi</option>
                          <option>Islamabad</option>
                          <option>Rawalpindi</option>
                        </select>
                      </div>
                      <div className="flex items-end pb-1">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div 
                            onClick={() => setAddressForm({ ...addressForm, isDefault: !addressForm.isDefault })}
                            className={cn(
                              "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                              addressForm.isDefault ? "bg-apple-blue border-apple-blue" : "border-apple-border group-hover:border-apple-blue"
                            )}
                          >
                            {addressForm.isDefault && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <span className="text-xs font-bold text-apple-text-muted">Set as Default</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveAddress}
                    disabled={!addressForm.address}
                    className="w-full py-5 bg-apple-blue text-white rounded-[24px] font-bold shadow-xl shadow-apple-blue/20 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  >
                    {editingAddress ? 'Update Address' : 'Save Address'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Password Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-apple-card-bg rounded-[40px] shadow-2xl overflow-hidden p-8 sm:p-10"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold tracking-tight">Change Password</h2>
                <button 
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-apple-card-bg flex items-center justify-center hover:bg-apple-border transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest px-1">Current Password</label>
                  <input 
                    type="password" 
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    className="w-full px-5 py-4 bg-apple-gray/50 rounded-2xl border border-transparent focus:border-apple-blue/30 focus:bg-white outline-none transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest px-1">New Password</label>
                  <input 
                    type="password" 
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    className="w-full px-5 py-4 bg-apple-gray/50 rounded-2xl border border-transparent focus:border-apple-blue/30 focus:bg-white outline-none transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest px-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    className="w-full px-5 py-4 bg-apple-gray/50 rounded-2xl border border-transparent focus:border-apple-blue/30 focus:bg-white outline-none transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>

                <button 
                  onClick={handlePasswordChange}
                  className="w-full py-5 bg-apple-blue text-white rounded-[24px] font-bold shadow-xl shadow-apple-blue/20 hover:bg-blue-600 transition-all active:scale-95 mt-4"
                >
                  Update Password
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Card Modal */}
      <AnimatePresence>
        {isAddCardModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddCardModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-apple-card-bg rounded-[40px] shadow-2xl overflow-hidden p-8 sm:p-10"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold tracking-tight">Add Payment Method</h2>
                <button 
                  onClick={() => setIsAddCardModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-apple-card-bg flex items-center justify-center hover:bg-apple-border transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest px-1">Cardholder Name</label>
                  <input 
                    type="text" 
                    value={cardForm.name}
                    onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                    className="w-full px-5 py-4 bg-apple-gray/50 rounded-2xl border border-transparent focus:border-apple-blue/30 focus:bg-white outline-none transition-all font-medium"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest px-1">Card Number</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={cardForm.number}
                      onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                      className="w-full px-5 py-4 bg-apple-gray/50 rounded-2xl border border-transparent focus:border-apple-blue/30 focus:bg-white outline-none transition-all font-medium"
                      placeholder="0000 0000 0000 0000"
                    />
                    <CardIcon className="absolute right-5 top-1/2 -translate-y-1/2 text-apple-text-muted w-5 h-5" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest px-1">Expiry Date</label>
                    <input 
                      type="text" 
                      value={cardForm.expiry}
                      onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                      className="w-full px-5 py-4 bg-apple-gray/50 rounded-2xl border border-transparent focus:border-apple-blue/30 focus:bg-white outline-none transition-all font-medium"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest px-1">CVC</label>
                    <input 
                      type="text" 
                      value={cardForm.cvc}
                      onChange={(e) => setCardForm({ ...cardForm, cvc: e.target.value })}
                      className="w-full px-5 py-4 bg-apple-gray/50 rounded-2xl border border-transparent focus:border-apple-blue/30 focus:bg-white outline-none transition-all font-medium"
                      placeholder="123"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleAddCard}
                  className="w-full py-5 bg-apple-blue text-white rounded-[24px] font-bold shadow-xl shadow-apple-blue/20 hover:bg-blue-600 transition-all active:scale-95 mt-4"
                >
                  Add Card
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Device Details Modal */}
      <AnimatePresence>
        {isDeviceModalOpen && selectedDevice && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeviceModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-apple-card-bg rounded-[40px] shadow-2xl overflow-hidden p-8 sm:p-10"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="w-16 h-16 bg-apple-card-bg rounded-3xl flex items-center justify-center">
                  {selectedDevice.type === 'mobile' ? <Smartphone className="w-8 h-8 text-apple-text" /> : 
                   selectedDevice.type === 'laptop' ? <Settings2 className="w-8 h-8 text-apple-text" /> : 
                   <Map className="w-8 h-8 text-apple-text" />}
                </div>
                <button 
                  onClick={() => setIsDeviceModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-apple-card-bg flex items-center justify-center hover:bg-apple-border transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold tracking-tight mb-1">{selectedDevice.name}</h2>
                <p className="text-sm text-apple-text-muted font-medium">{selectedDevice.isCurrent ? 'Current Pakizzle Session' : 'Active Session'}</p>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-apple-gray/30 rounded-[28px] space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-apple-text-muted uppercase tracking-widest">Device</span>
                    <span className="text-sm font-bold">{selectedDevice.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-apple-text-muted uppercase tracking-widest">Location</span>
                    <span className="text-sm font-bold">{selectedDevice.location}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-apple-text-muted uppercase tracking-widest">Last Activity</span>
                    <span className="text-sm font-bold">{selectedDevice.lastActive}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {!selectedDevice.isCurrent && (
                    <button 
                      onClick={() => handleSignOutDevice(selectedDevice.id)}
                      className="w-full py-5 bg-apple-red text-white rounded-[24px] font-bold shadow-xl shadow-apple-red/20 hover:bg-red-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      Sign Out of Device
                      <LogOut className="w-4 h-4" />
                    </button>
                  )}
                  {selectedDevice.isCurrent && (
                    <p className="text-xs text-apple-text-muted text-center font-medium px-4">
                      This is your current session. To sign out, use the main sign out button in the sidebar.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Phone Modal */}
      <AnimatePresence>
        {isEditPhoneModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditPhoneModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-apple-card-bg rounded-[40px] shadow-2xl overflow-hidden p-8 sm:p-10"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 bg-apple-blue/10 rounded-2xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-apple-blue" />
                </div>
                <button 
                  onClick={() => setIsEditPhoneModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-apple-card-bg flex items-center justify-center hover:bg-apple-border transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 className="text-2xl font-bold tracking-tight mb-2">Update Phone Number</h2>
              <p className="text-apple-text-muted font-medium mb-8">
                Enter your new phone number below. You will need to verify it after updating.
              </p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest px-1">New Phone Number</label>
                  <input 
                    type="tel" 
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-5 py-4 bg-apple-gray/50 rounded-2xl border border-transparent focus:border-apple-blue/30 focus:bg-white outline-none transition-all font-medium"
                    placeholder="+92 300 1234567"
                  />
                </div>

                <button
                  onClick={handleUpdatePhone}
                  disabled={isSaving || !newPhone.trim()}
                  className="w-full py-5 bg-apple-text text-white rounded-[24px] font-bold shadow-xl shadow-apple-text/20 hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Update Number
                      <Check className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Email Verification Modal */}
      <AnimatePresence>
        {isEmailModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEmailModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-apple-card-bg rounded-[40px] shadow-2xl overflow-hidden p-8 sm:p-10 text-center"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 bg-apple-green/10 rounded-2xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-apple-green" />
                </div>
                <button 
                  onClick={() => setIsEmailModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-apple-card-bg flex items-center justify-center hover:bg-apple-border transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 className="text-2xl font-bold tracking-tight mb-2">Verify Email Address</h2>
              <p className="text-apple-text-muted font-medium mb-8">
                We've sent a 6-digit code to <br />
                <span className="text-apple-text font-bold">{user?.email}</span>
              </p>

              {emailDemoCode && (
                <div className="mb-8 p-4 bg-apple-blue/5 border border-apple-blue/10 rounded-2xl text-sm text-apple-blue font-bold">
                  Demo Mode: Your code is <span className="text-xl">{emailDemoCode}</span>
                </div>
              )}

              <div className="flex justify-between gap-2 mb-8">
                {emailOtp.map((digit, index) => (
                  <input
                    key={index}
                    id={`email-otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleEmailOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleEmailOtpKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-apple-gray/50 border border-transparent rounded-2xl focus:border-apple-blue/30 focus:bg-white outline-none transition-all"
                  />
                ))}
              </div>

              {emailOtpError && (
                <p className="text-apple-red text-sm font-bold mb-6">{emailOtpError}</p>
              )}

              <button
                onClick={handleVerifyEmail}
                disabled={isEmailOtpVerifying || emailOtp.some(d => !d)}
                className="w-full py-5 bg-apple-text text-white rounded-[24px] font-bold shadow-xl shadow-apple-text/20 hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isEmailOtpVerifying ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Verify Email'
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Phone Verification Modal */}
      <AnimatePresence>
        {isPhoneModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPhoneModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-apple-card-bg rounded-[40px] shadow-2xl overflow-hidden p-8 sm:p-10 text-center"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 bg-apple-blue/10 rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-apple-blue" />
                </div>
                <button 
                  onClick={() => setIsPhoneModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-apple-card-bg flex items-center justify-center hover:bg-apple-border transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 className="text-2xl font-bold tracking-tight mb-2">Verify Phone Number</h2>
              <p className="text-apple-text-muted font-medium mb-8">
                We've sent a 6-digit code to <br />
                <span className="text-apple-text font-bold">{profile?.phone}</span>
              </p>

              {phoneDemoCode && (
                <div className="mb-8 p-4 bg-apple-blue/5 border border-apple-blue/10 rounded-2xl text-sm text-apple-blue font-bold">
                  Demo Mode: Your code is <span className="text-xl">{phoneDemoCode}</span>
                </div>
              )}

              <div className="flex justify-between gap-2 mb-8">
                {phoneOtp.map((digit, index) => (
                  <input
                    key={index}
                    id={`phone-otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePhoneOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handlePhoneOtpKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-apple-gray/50 border border-transparent rounded-2xl focus:border-apple-blue/30 focus:bg-white outline-none transition-all"
                  />
                ))}
              </div>

              {phoneOtpError && (
                <p className="text-apple-red text-sm font-bold mb-6">{phoneOtpError}</p>
              )}

              <button
                onClick={handleVerifyPhoneOtp}
                disabled={isPhoneOtpVerifying || phoneOtp.some(d => !d)}
                className="w-full py-5 bg-apple-text text-white rounded-[24px] font-bold shadow-xl shadow-apple-text/20 hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPhoneOtpVerifying ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Verify Number
                    <CheckCircle2 className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="mt-8">
                <button
                  onClick={handleSendPhoneOtp}
                  disabled={phoneOtpTimer > 0 || isPhoneOtpSending}
                  className="text-sm font-bold text-apple-blue hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  {phoneOtpTimer > 0 ? `Resend code in ${phoneOtpTimer}s` : 'Resend Code'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-apple-card-bg rounded-[32px] shadow-2xl overflow-hidden p-8 text-center"
            >
              <div className="w-16 h-16 bg-apple-red/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-apple-red" />
              </div>
              
              <h3 className="text-xl font-bold mb-2">Remove Address?</h3>
              <p className="text-apple-text-muted font-medium text-sm mb-8 leading-relaxed">
                Are you sure you want to remove this address? This action cannot be undone.
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmDeleteAddress}
                  className="w-full py-4 bg-apple-red text-white rounded-2xl font-bold shadow-lg shadow-apple-red/20 hover:bg-red-600 transition-all active:scale-95"
                >
                  Remove Address
                </button>
                <button 
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="w-full py-4 bg-apple-card-bg text-apple-text rounded-2xl font-bold hover:bg-apple-border transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <VerificationModal 
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onConfirm={() => {
          setIsVerificationModalOpen(false);
          setNotification?.('Verification process started!');
        }}
      />

      {stepUpAction && (
        <StepUpVerificationModal
          isOpen={!!stepUpAction}
          action={stepUpAction}
          onSuccess={() => {
            const cb = pendingActionCallback;
            setStepUpAction(null);
            setPendingActionCallback(null);
            if (cb) cb();
          }}
          onClose={() => {
            setStepUpAction(null);
            setPendingActionCallback(null);
          }}
        />
      )}
    </div>
  );
}
