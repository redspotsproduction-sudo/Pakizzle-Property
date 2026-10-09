import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  Shield, 
  Ban, 
  CheckCircle2, 
  AlertTriangle,
  UserPlus,
  ArrowUpRight,
  Download,
  Activity,
  Key,
  Trash2,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Smartphone,
  Info,
  Clock,
  History,
  Circle,
  Eye,
  Zap,
  Globe,
  Fingerprint,
  Lock,
  Flag,
  FileText,
  BadgeAlert,
  Loader2,
  ShieldAlert,
  BrainCircuit,
  Radar,
  RefreshCcw,
  User,
  Calendar,
  MapPin,
  Briefcase,
  Crown,
  Star,
  X,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatPrice } from "../../lib/utils";
import { UserProfile, UserRole, SecurityAlert, ActivityLog } from "../../types";
import { analyzeUserSecurity } from "../../services/securityAiService";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { collection, doc, updateDoc, onSnapshot, query, orderBy, where, addDoc, getDocs } from "firebase/firestore";

const mockUsers: UserProfile[] = [
  {
    uid: 'user_1',
    email: 'ali.khan@example.com',
    displayName: 'Ali Khan',
    photoURL: 'https://i.pravatar.cc/150?u=user_1',
    role: 'user',
    status: 'active',
    isPhoneVerified: true,
    isEmailVerified: true,
    trustScore: 92,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    phoneNumber: '+92 300 1234567',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    riskScore: 8,
    riskLevel: 'low',
    suspiciousActivityCount: 0,
    lastKnownIp: '182.180.12.34',
    ipHistory: [{ ip: '182.180.12.34', timestamp: new Date().toISOString(), location: 'Karachi, Pakistan' }],
    verificationLevel: 3,
    fraudTags: [],
  },
  {
    uid: 'user_3',
    email: 'scammer@bad.com',
    displayName: 'Suspicious Account',
    photoURL: 'https://i.pravatar.cc/150?u=user_3',
    role: 'user',
    status: 'suspended',
    isPhoneVerified: false,
    isEmailVerified: true,
    trustScore: 15,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    phoneNumber: '+92 400 0000000',
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    riskScore: 85,
    riskLevel: 'high',
    suspiciousActivityCount: 12,
    lastKnownIp: '45.12.34.56',
    ipHistory: [
      { ip: '45.12.34.56', timestamp: new Date().toISOString(), location: 'Frankfurt, Germany' },
      { ip: '109.23.45.12', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), location: 'Moscow, Russia' }
    ],
    verificationLevel: 1,
    fraudTags: ['vpn_detected', 'multiple_ip_locs', 'high_frequency'],
    isProxyDetected: true,
    isVpnDetected: true,
  }
];

const mockAlerts: SecurityAlert[] = [
  {
    id: 'alt_1',
    userId: 'user_3',
    userEmail: 'scammer@bad.com',
    userName: 'Suspicious Account',
    type: 'vpn_detected',
    severity: 'high',
    description: 'VPN/Proxy connection detected from Frankfurt, Germany.',
    status: 'new',
    aiAgentNotes: 'High-risk node detected. Connection originates from a known data-center IP range used for automated scraping and bulk account creation.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'alt_2',
    userId: 'user_3',
    userEmail: 'scammer@bad.com',
    userName: 'Suspicious Account',
    type: 'fake_activity',
    severity: 'medium',
    description: 'Rapid creation of 10 mock listings within 2 minutes.',
    status: 'investigating',
    aiAgentNotes: 'User behavior patterns match automated bot activity. Suggest immediate KYC verification.',
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  }
];

export default function UserManagement() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("directory");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isSuspendConfirmOpen, setIsSuspendConfirmOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recentlyUpdated, setRecentlyUpdated] = useState<string[]>([]);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (selectedUser) {
      setEditUser({ ...selectedUser });
    } else {
      setEditUser(null);
    }
  }, [selectedUser, isDetailsOpen]);

  useEffect(() => {
    if (!isAdmin) return;
    
    // Auto scroll to top on tab change for professional feel
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Real-time user directory
    const qUsers = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UserProfile[];
      
      setUsers(prevUsers => {
        // Track updated users for flash effect & Debug logging
        if (prevUsers.length > 0) {
          const updatedIds = usersData.filter(newUser => {
            const oldUser = prevUsers.find(u => u.uid === newUser.uid);
            if (!oldUser) return false;
            
            // Check for any verification status change
            const verificationChanged = 
              newUser.email_verified !== oldUser.email_verified ||
              newUser.phone_verified !== oldUser.phone_verified ||
              newUser.isEmailVerified !== oldUser.isEmailVerified ||
              newUser.isPhoneVerified !== oldUser.isPhoneVerified ||
              newUser.identity_status !== oldUser.identity_status ||
              newUser.verificationLevel !== oldUser.verificationLevel ||
              newUser.status !== oldUser.status;

            if (verificationChanged) {
              console.log(`[RealTime] User ${newUser.displayName} updated verification/status:`, {
                email: newUser.isEmailVerified || newUser.email_verified,
                phone: newUser.isPhoneVerified || newUser.phone_verified,
                status: newUser.identity_status,
                accountStatus: newUser.status
              });
              
              // Notify admin of successful verification if it just happened
              if (newUser.identity_status === 'verified' && oldUser.identity_status !== 'verified') {
                toast.success('Identity Verified', {
                  description: `${newUser.displayName} successfully completed all verification stages and is now a trusted node.`
                });
              }
            }
            return verificationChanged;
          }).map(u => u.uid);
          
          if (updatedIds.length > 0) {
            setRecentlyUpdated(prev => [...new Set([...prev, ...updatedIds])]);
            setTimeout(() => {
              setRecentlyUpdated(prev => prev.filter(id => !updatedIds.includes(id)));
            }, 5000); // 5 second flash for better visibility
          }
        }
        return usersData;
      });
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      setIsLoading(false);
    });

    // Real-time security alerts
    const qAlerts = query(collection(db, 'security_alerts'), orderBy('createdAt', 'desc'));
    const unsubscribeAlerts = onSnapshot(qAlerts, (snapshot) => {
      const alertsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SecurityAlert[];
      setAlerts(alertsData.length > 0 ? alertsData : mockAlerts);
    }, (error) => {
      console.error("Error fetching alerts:", error);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeAlerts();
    };
  }, [isAdmin]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    users.forEach(u => u.city && set.add(u.city));
    return Array.from(set);
  }, [users]);

  const countries = useMemo(() => {
    const set = new Set<string>();
    users.forEach(u => u.country && set.add(u.country));
    return Array.from(set);
  }, [users]);

  const sources = useMemo(() => {
    const set = new Set<string>();
    users.forEach(u => u.registrationSource && set.add(u.registrationSource));
    return Array.from(set);
  }, [users]);

  const filteredUsers = users.filter(u => {
    const matchesSearch = `${u.displayName} ${u.email} ${u.uid} ${u.lastKnownIp} ${u.username || ''}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesAccountType = accountTypeFilter === "all" || u.accountType === accountTypeFilter;
    const matchesCity = cityFilter === "all" || u.city === cityFilter;
    const matchesCountry = countryFilter === "all" || u.country === countryFilter;
    const matchesSource = sourceFilter === "all" || u.registrationSource === sourceFilter;
    return matchesSearch && matchesRole && matchesAccountType && matchesCity && matchesCountry && matchesSource;
  });

  const handleAction = (type: string, user: UserProfile) => {
    setSelectedUser(user);
    switch(type) {
      case 'view':
        setIsDetailsOpen(true);
        break;
      case 'suspend':
        setIsSuspendConfirmOpen(true);
        break;
      case 'revoke':
        // Direct revoke action
        confirmSuspend(user);
        break;
    }
  };

  const confirmSuspend = async (userOverride?: UserProfile) => {
    const targetUser = userOverride || selectedUser;
    if (!targetUser) return;
    
    const newStatus = targetUser.status === 'suspended' ? 'active' : 'suspended';
    
    try {
      await updateDoc(doc(db, 'users', targetUser.uid), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      toast.success(newStatus === 'suspended' ? "Access Revoked" : "Access Restored", {
        description: `Identity node ${targetUser.displayName} has been ${newStatus}.`,
        icon: newStatus === 'suspended' ? <Ban className="w-4 h-4 text-apple-red" /> : <ShieldCheck className="w-4 h-4 text-apple-green" />
      });
    } catch (error) {
      toast.error("Protocol execution failed");
    } finally {
      setIsSuspendConfirmOpen(false);
    }
  };

  const handleAdminUpdate = async (uid: string, data: Partial<UserProfile>) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...data,
        updatedAt: new Date().toISOString()
      });

      // Synchronize verified badge across all listings owned by this seller
      try {
        const propsQuery = query(collection(db, 'properties'), where('seller.uid', '==', uid));
        const propSnap = await getDocs(propsQuery);
        const badgeType = data.verified_badge_type || data.badgeType || (data.isVerified ? 'identity' : 'none');
        const isVerifiedVal = data.isVerified !== undefined ? data.isVerified : ((data.verificationLevel ?? 0) >= 2);

        propSnap.forEach(async (pDoc) => {
          await updateDoc(doc(db, 'properties', pDoc.id), {
            'seller.isVerified': isVerifiedVal,
            'seller.badgeType': badgeType,
            'seller.verified_badge_type': badgeType
          });
        });
      } catch (propErr) {
        console.warn("Could not batch update listing badges:", propErr);
      }

      toast.success("Identity Records Updated", {
        description: "Administrative overrule applied successfully."
      });
    } catch (error) {
      console.error("Admin update error:", error);
      toast.error("Authorization check failed or network error.");
    }
  };

  const runAiAnalysis = async (user: UserProfile) => {
    setIsAnalyzing(true);
    toast.promise(analyzeUserSecurity(user, []), {
      loading: 'Analyzing user behavior with Sentinel AI...',
      success: async (newAlerts) => {
        setIsAnalyzing(false);
        if (newAlerts.length > 0) {
          for (const alert of newAlerts) {
            await addDoc(collection(db, 'security_alerts'), {
              userId: user.uid,
              userEmail: user.email,
              userName: user.displayName,
              status: 'new',
              createdAt: new Date().toISOString(),
              ...alert
            });
          }
          return `${newAlerts.length} potential risks flagged by Sentinel AI and logged to terminal.`;
        }
        return "Sentinel AI found no immediate security threats.";
      },
      error: 'AI analysis protocol failed.'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions - EXACT match with Approval Center layout and sizing */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <Users className="w-3.5 h-3.5" />
            Verified Administration Console
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-tight">
            User Management
          </h1>
          <p className="text-xs text-[#86868B] dark:text-[#86868B] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            {activeTab === 'guardian' ? 'AI-Powered Security & Fraud Mitigation Console with advanced behavioral risk scoring.' : 
             activeTab === 'fraud' ? 'Fraud Intelligence terminal & real-time threat detection logs.' :
             'Enterprise User CRM, advanced identity verification status, and real-time security profile analytics.'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start md:self-end">
          {activeTab === 'directory' && (
            <div className="relative group min-w-[200px] sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] group-focus-within:text-apple-blue transition-colors duration-300" />
              <input
                type="text"
                placeholder="Search user profiles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#F5F5F7] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 rounded-xl text-xs font-medium focus:ring-0 outline-none transition-all duration-300 shadow-inner"
              />
            </div>
          )}
          
          <div className="flex items-center gap-2">
            {[
              { id: 'directory', label: 'Directory' },
              { id: 'guardian', label: 'Sentinel Agent' },
              { id: 'fraud', label: 'Fraud Intel' }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border",
                    isActive
                      ? "bg-apple-blue text-white border-apple-blue shadow-sm"
                      : "bg-white dark:bg-[#161617] border-black/[0.04] dark:border-white/[0.04] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'directory' && (
          <motion.div 
            key="directory"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Stats - EXACT match with Approval Center card format */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Platform Population', value: '14,289', change: '+2.4k', icon: Users, color: 'text-apple-blue', bg: 'bg-apple-blue/10' },
                { label: 'Security Grade A+', value: '85%', change: 'Stable', icon: ShieldCheck, color: 'text-apple-green', bg: 'bg-apple-green/10' },
                { label: 'Neural Monitoring', value: 'Live', change: '892 Active', icon: Radar, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                { label: 'Anomalies Detected', value: alerts.length.toString(), change: 'AI Flagged', icon: AlertTriangle, color: 'text-apple-red', bg: 'bg-apple-red/10' },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-[#161617] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300 group">
                  <div className="flex items-start justify-between">
                    <div className={cn("p-3 rounded-xl group-hover:scale-105 transition-transform duration-500", stat.bg)}>
                      <stat.icon className={cn("w-5 h-5", stat.color)} />
                    </div>
                    <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                       {stat.change}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-none">{stat.value}</div>
                    <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider mt-1.5">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Role filter pills - EXACT match with Approval Center tabs style */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0" style={{ WebkitOverflowScrolling: 'touch' }}>
              {['all', 'admin', 'moderator', 'user'].map((role) => {
                const count = role === 'all' 
                  ? users.length 
                  : users.filter(u => u.role === role).length;
                const isActive = roleFilter === role;
                return (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border",
                      isActive
                        ? "bg-apple-blue text-white border-apple-blue shadow-sm"
                        : "bg-white dark:bg-[#161617] border-black/[0.04] dark:border-white/[0.04] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                    )}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}s <span className={cn("ml-1 py-0.5 px-1.5 rounded-full text-[9px] font-bold font-mono", isActive ? "bg-white/25 text-white" : "bg-[#F5F5F7] dark:bg-white/5 text-[#86868B]")}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Advanced Filters Panel */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 bg-[#F5F5F7]/60 dark:bg-white/[0.02] p-4.5 rounded-2xl border border-black/[0.04] dark:border-white/[0.04]">
              {/* Account Type Filter */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-[#86868B]">Account Type</label>
                <select
                  value={accountTypeFilter}
                  onChange={(e) => setAccountTypeFilter(e.target.value)}
                  className="w-full bg-white dark:bg-[#161617] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-apple-blue text-[#1D1D1F] dark:text-white"
                >
                  <option value="all">All Types</option>
                  <option value="user">Individual User</option>
                  <option value="dealer">Showroom Dealer</option>
                  <option value="company">Enterprise Company</option>
                </select>
              </div>

              {/* City Filter */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-[#86868B]">City</label>
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full bg-white dark:bg-[#161617] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-apple-blue text-[#1D1D1F] dark:text-white"
                >
                  <option value="all">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Country Filter */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-[#86868B]">Country</label>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full bg-white dark:bg-[#161617] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-apple-blue text-[#1D1D1F] dark:text-white"
                >
                  <option value="all">All Countries</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* Registration Source Filter */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-[#86868B]">Signup Source</label>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full bg-white dark:bg-[#161617] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-apple-blue text-[#1D1D1F] dark:text-white"
                >
                  <option value="all">All Sources</option>
                  <option value="google">Google OAuth</option>
                  <option value="apple">Apple OAuth</option>
                  <option value="email">Email Signup</option>
                  <option value="phone">Phone / SMS OTP</option>
                  {sources.filter(s => !['google', 'apple', 'email', 'phone'].includes(s)).map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table Container - EXACT border, background and hover transition as Approval Center card */}
            <div className="bg-white dark:bg-[#161617] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/[0.04] dark:border-white/[0.04]">
                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B]">User Identity</th>
                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B]">Verification Status</th>
                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B]">Security Profile</th>
                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B]">Risk Index</th>
                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B]">Origin (Last IP)</th>
                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#86868B] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.03]">
                    {filteredUsers.map((user, idx) => (
                      <tr 
                        key={user.uid}
                        onClick={() => handleAction('view', user)}
                        className={cn(
                          "group transition-all cursor-pointer relative border-b border-black/[0.03] dark:border-white/[0.03] last:border-b-0",
                          recentlyUpdated.includes(user.uid) 
                            ? "bg-apple-blue/10 dark:bg-apple-blue/20 ring-2 ring-inset ring-apple-blue shadow-lg z-10" 
                            : "hover:bg-apple-gray/50 dark:hover:bg-white/5"
                        )}
                      >
                        <td className="px-6 py-4.5">
                           <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12 rounded-xl border border-black/[0.06] dark:border-white/[0.06]">
                                <AvatarImage src={user.photoURL} />
                                <AvatarFallback className="bg-apple-blue text-white font-semibold text-sm">{user.displayName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                 <div className="font-semibold text-sm tracking-tight text-[#1D1D1F] dark:text-white flex items-center gap-2">
                                   {user.displayName}
                                   {(user.email_verified || user.isEmailVerified) && (
                                     <CheckCircle2 className="w-3.5 h-3.5 text-apple-blue" />
                                   )}
                                 </div>
                                 <div className="text-[10px] font-medium text-[#86868B] lowercase mt-0.5">{user.email}</div>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4.5">
                           <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2">
                                <Badge className={cn(
                                  "text-[9px] font-bold px-2 py-0.5 rounded-lg border-none animate-in fade-in zoom-in duration-300 shadow-none",
                                  (user.identity_status === 'verified' || (user.isEmailVerified && user.isPhoneVerified)) ? "bg-apple-green/10 text-apple-green" : 
                                  (user.identity_status === 'partial' || user.isEmailVerified || user.isPhoneVerified) ? "bg-apple-orange/10 text-apple-orange" : 
                                  "bg-[#F5F5F7] dark:bg-white/5 text-[#86868B]"
                                )}>
                                  {user.identity_status === 'verified' || (user.isEmailVerified && user.isPhoneVerified) ? 'Verified' : 
                                   user.identity_status === 'partial' || user.isEmailVerified || user.isPhoneVerified ? 'Partial' : 
                                   'Unverified'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3">
                                 <div className={cn(
                                    "flex items-center gap-1 text-[9px] font-medium transition-colors duration-500",
                                    (user.email_verified || user.isEmailVerified) ? "text-apple-green" : "text-[#86868B] opacity-40"
                                 )}>
                                   <Mail className={cn("w-3 h-3", (user.email_verified || user.isEmailVerified) && "animate-pulse")} /> Email
                                 </div>
                                 <div className={cn(
                                    "flex items-center gap-1 text-[9px] font-medium transition-colors duration-500",
                                    (user.phone_verified || user.isPhoneVerified) ? "text-apple-green" : "text-[#86868B] opacity-40"
                                 )}>
                                   <Smartphone className={cn("w-3 h-3", (user.phone_verified || user.isPhoneVerified) && "animate-pulse")} /> Phone
                                 </div>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4.5">
                           <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2">
                                <Badge className={cn(
                                  "text-[9px] font-bold px-2 py-0.5 rounded-lg border-none shadow-none",
                                  user.role === 'admin' ? "bg-apple-red/10 text-apple-red" : "bg-apple-blue/10 text-apple-blue"
                                )}>
                                  {user.role}
                                </Badge>
                                <Badge className={cn(
                                  "text-[9px] font-bold px-2 py-0.5 rounded-lg border-none shadow-none",
                                  user.status === 'active' ? "bg-apple-green/10 text-apple-green" : "bg-apple-red/10 text-apple-red"
                                )}>
                                  {user.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#86868B]">
                                 <Clock className="w-3 h-3" /> Exp: {new Date(user.createdAt).getFullYear()}
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4.5">
                           <div className="flex flex-col gap-1.5">
                              <div className="flex items-center justify-between w-32 mb-1">
                                 <span className="text-[9px] font-semibold uppercase tracking-wider text-[#86868B]">Risk Stage</span>
                                 <span className={cn(
                                   "text-[10px] font-semibold",
                                   (user.riskScore || 0) > 70 ? "text-apple-red" : (user.riskScore || 0) > 30 ? "text-apple-orange" : "text-apple-green"
                                 )}>{user.riskScore || 0}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-apple-gray dark:bg-white/10 rounded-full overflow-hidden">
                                 <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${user.riskScore || 0}%` }}
                                    className={cn(
                                      "h-full rounded-full transition-all duration-1000",
                                      (user.riskScore || 0) > 70 ? "bg-apple-red" : (user.riskScore || 0) > 30 ? "bg-apple-orange" : "bg-apple-green"
                                    )} 
                                 />
                              </div>
                              {user.fraudTags && user.fraudTags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                   {user.fraudTags.slice(0, 2).map(tag => (
                                     <span key={tag} className="text-[7px] font-bold text-apple-red uppercase tracking-wider bg-apple-red/5 px-1 rounded-sm border border-apple-red/10">! {tag.replace(/_/g, ' ')}</span>
                                   ))}
                                </div>
                              )}
                           </div>
                        </td>
                        <td className="px-6 py-4.5">
                           <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1D1D1F] dark:text-white tracking-tight">
                                 <Globe className="w-3.5 h-3.5 text-apple-blue" />
                                 {user.lastKnownIp || '0.0.0.0'}
                              </div>
                              <div className="text-[9px] font-medium text-[#86868B] uppercase tracking-wider">
                                 {user.ipHistory?.[0]?.location || 'N/A'}
                              </div>
                              {(user.isProxyDetected || user.isVpnDetected) && (
                                <div className="flex items-center gap-1 text-[8px] font-bold text-apple-red uppercase tracking-wider mt-1">
                                   <Zap className="w-2.5 h-2.5 fill-current" /> VPN/Proxy Active
                                 </div>
                              )}
                           </div>
                        </td>
                        <td className="px-6 py-4.5 text-right" onClick={e => e.stopPropagation()}>
                           <DropdownMenu>
                              <DropdownMenuTrigger className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-apple-gray dark:hover:bg-white/10 transition-colors">
                                 <MoreVertical className="w-4 h-4 text-[#86868B]" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl border-apple-border/10 backdrop-blur-xl bg-white/95 dark:bg-[#1D1D1F]/95 shadow-2xl">
                                <DropdownMenuItem onClick={() => handleAction('view', user)} className="rounded-xl py-3 px-4 font-bold text-xs">
                                   <Eye className="w-4 h-4 mr-3 text-apple-blue" /> Inspect Data Matrix
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => window.open(`/profile/${user.uid}`, '_blank')} className="rounded-xl py-3 px-4 font-bold text-xs">
                                   <ExternalLink className="w-4 h-4 mr-3 text-apple-blue" /> Open Public Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => runAiAnalysis(user)} className="rounded-xl py-3 px-4 font-bold text-xs text-purple-600 bg-purple-500/5">
                                   <BrainCircuit className="w-4 h-4 mr-3" /> Run AI Security Audit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-2 bg-apple-border/5" />
                                <DropdownMenuItem onClick={() => handleAction('suspend', user)} className={cn(
                                  "rounded-xl py-3 px-4 font-bold text-xs",
                                  user.status === 'suspended' ? "text-apple-green" : "text-apple-red"
                                )}>
                                   {user.status === 'suspended' ? <CheckCircle2 className="w-4 h-4 mr-3" /> : <Ban className="w-4 h-4 mr-3" />}
                                   {user.status === 'suspended' ? 'Restore User Node' : 'Suspend User Credentials'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                           </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'guardian' && (
          <motion.div 
            key="guardian"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Guardian Logic Column */}
            <div className="lg:col-span-2 space-y-6">
               <div className="glass-panel p-8 bg-apple-blue/5 border-apple-blue/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                     <BrainCircuit className="w-40 h-40" />
                  </div>
                  <div className="flex items-center gap-4 mb-6">
                     <div className="w-12 h-12 rounded-2xl bg-apple-blue shadow-lg shadow-apple-blue/20 flex items-center justify-center">
                        <ShieldAlert className="w-6 h-6 text-white" />
                     </div>
                     <div>
                        <h3 className="text-xl font-black tracking-tight tracking-[-0.03em]">Sentinel Activity Monitoring</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-apple-blue opacity-80">AI Real-time Threat Intelligence</p>
                     </div>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-apple-text/80 max-w-2xl mb-6">
                    Our AI monitoring agent is currently scanning all active sessions for behavioral anomalies, 
                    IP fingerprint mismatches, and coordinated fake listing activities. Flagged nodes are 
                    automatically escalated to this terminal for manual underwriting.
                  </p>
                  <div className="flex gap-3">
                     <div className="px-4 py-2 bg-white/50 dark:bg-white/5 rounded-xl border border-apple-blue/10 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-apple-green animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Model: Gemini Ultra 3.0</span>
                     </div>
                     <div className="px-4 py-2 bg-white/50 dark:bg-white/5 rounded-xl border border-apple-blue/10 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-apple-blue" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Confidence: 98.4%</span>
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-apple-text-muted flex items-center gap-2">
                        <BadgeAlert className="w-3.5 h-3.5" /> Pending Threat List ({alerts.filter(a => a.status === 'new').length})
                     </h4>
                     <Button variant="ghost" className="h-8 text-[9px] font-black uppercase tracking-widest text-apple-blue" onClick={() => setAlerts([])}>Dismiss All Clean</Button>
                  </div>
                  <div className="space-y-4">
                     <AnimatePresence mode="popLayout">
                        {alerts.map((alert) => (
                           <motion.div 
                              key={alert.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="glass-panel p-6 border-l-4 border-l-apple-red bg-apple-red/5 border-apple-border/10 relative group"
                           >
                              <div className="absolute top-6 right-6 flex gap-2">
                                 <Button size="sm" variant="outline" className="h-8 rounded-lg text-[9px] font-black uppercase" onClick={() => {
                                   toast.success("Security status updated", { description: `Investigation protocol started for ${alert.userName}` });
                                   // Update alert status in Firebase
                                   updateDoc(doc(db, 'security_alerts', alert.id), { status: 'investigating' });
                                 }}>Investigate</Button>
                                 <Button size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase bg-apple-red text-white border-none" onClick={() => {
                                   const user = users.find(u => u.uid === alert.userId);
                                   if (user) handleAction('revoke', user);
                                 }}>Revoke Node</Button>
                              </div>
                              <div className="flex gap-5">
                                 <div className="min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                       <Badge className="bg-apple-red text-white border-none text-[8px] font-black px-2 py-0.5 rounded-full">{alert.type.replace(/_/g, ' ')}</Badge>
                                       <span className="text-[10px] font-bold text-apple-text tracking-tight uppercase tracking-widest opacity-40">{new Date(alert.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                    <h5 className="text-base font-black tracking-tight mb-1">{alert.description}</h5>
                                    <div className="flex items-center gap-2 text-[11px] font-medium text-apple-text-muted mb-4">
                                       Ref: <span className="font-bold text-apple-blue">{alert.userName}</span> ({alert.userEmail})
                                    </div>
                                    <div className="p-4 bg-white/40 dark:bg-black/20 rounded-2xl border border-apple-border/5 space-y-2">
                                       <div className="flex items-center gap-2 text-[9px] font-black text-apple-blue uppercase tracking-widest mb-1">
                                          <BrainCircuit className="w-3.5 h-3.5" /> Sentinel Analysis:
                                       </div>
                                       <p className="text-xs font-medium leading-relaxed text-apple-text opacity-80">{alert.aiAgentNotes}</p>
                                    </div>
                                 </div>
                              </div>
                           </motion.div>
                        ))}
                     </AnimatePresence>
                     {alerts.length === 0 && (
                       <div className="py-20 text-center glass-panel bg-apple-green/5 border-apple-green/20">
                          <CheckCircle2 className="w-10 h-10 text-apple-green mx-auto mb-4 opacity-40" />
                          <h5 className="text-sm font-black uppercase tracking-widest text-apple-green">Protocol Zero Threats</h5>
                          <p className="text-[10px] font-bold text-apple-text-muted mt-1 uppercase tracking-widest">Ecosystem scan complete. No critical vulnerabilities.</p>
                       </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Guardian Sidebar Stats */}
            <div className="space-y-6">
               <Card className="border-apple-border/10 bg-apple-gray/50 dark:bg-[#1D1D1F]/50 rounded-[32px] overflow-hidden shadow-2xl">
                  <header className="px-8 py-6 border-b border-apple-border/10 bg-white/50 dark:bg-white/5">
                     <h3 className="text-sm font-black uppercase tracking-widest">Security Configuration</h3>
                  </header>
                  <CardContent className="p-8 space-y-6">
                     <div className="space-y-4">
                        {[
                          { label: 'Auto-Revoke Critical', status: 'enabled', type: 'shield' },
                          { label: 'Proxy Node Blocking', status: 'aggressive', type: 'zap' },
                          { label: 'KYC Verification Gate', status: 'tier-2+', type: 'lock' },
                        ].map((cfg, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-2xl border border-apple-border/5 group hover:border-apple-blue/50 transition-all">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-apple-gray dark:bg-white/5 flex items-center justify-center text-apple-text-muted group-hover:text-apple-blue transition-colors">
                                   {cfg.type === 'shield' && <Shield className="w-4 h-4" />}
                                   {cfg.type === 'zap' && <Zap className="w-4 h-4" />}
                                   {cfg.type === 'lock' && <Lock className="w-4 h-4" />}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest">{cfg.label}</span>
                             </div>
                             <Badge className="bg-apple-blue/10 text-apple-blue border-none text-[8px] font-black uppercase px-2">{cfg.status}</Badge>
                          </div>
                        ))}
                     </div>
                     <Button className="w-full h-14 apple-button-primary rounded-2xl font-black text-xs uppercase tracking-widest">Update AI Protocol</Button>
                  </CardContent>
               </Card>

               <div className="p-8 glass-panel border-apple-red/20 bg-apple-red/5 group hover:bg-apple-red/10 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                     <BadgeAlert className="w-5 h-5 text-apple-red" />
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-apple-red">Critical Directive</h4>
                  </div>
                  <p className="text-xs font-black leading-relaxed text-apple-red/80 uppercase tracking-widest opacity-80">
                    Multiple login signals from Karachi Shard detected on account user_ID_8921. Possible account takeover in progress. Sentinel has auto-queued session termination.
                  </p>
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'fraud' && (
          <motion.div 
            key="fraud"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center h-[50vh] text-center"
          >
             <div className="w-20 h-20 bg-apple-orange/10 rounded-full flex items-center justify-center mb-6">
                <Radar className="w-10 h-10 text-apple-orange animate-pulse" />
             </div>
             <h3 className="text-2xl font-black tracking-tight">Fraud Intelligence Shard</h3>
             <p className="text-apple-text-muted font-bold text-sm max-w-md mt-2">Deep forensic analysis tools coming online. Global identity verification & blacklisted IP database integration in progress.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Modal (Matrix) */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-[92vw] lg:max-w-5xl h-[85vh] max-h-[85vh] p-0 overflow-hidden border-none rounded-[2.5rem] bg-white dark:bg-[#1D1D1F] shadow-2xl flex flex-col">
          {selectedUser && editUser && (
            <Tabs defaultValue="dossier" className="flex flex-col h-full overflow-hidden">
              {/* Header */}
              <header className="p-6 border-b border-apple-border/10 flex items-center justify-between bg-neutral-50 dark:bg-white/[0.02] shrink-0">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 rounded-2xl border border-apple-border/10 shadow-sm shrink-0">
                    <AvatarImage src={selectedUser.photoURL} className="object-cover" referrerPolicy="no-referrer" />
                    <AvatarFallback className="bg-apple-blue text-white font-black text-xl">
                      {selectedUser.displayName?.charAt(0) || <User className="w-7 h-7" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold text-[#1D1D1F] dark:text-white leading-tight flex items-center gap-2">
                      {selectedUser.displayName}
                      {selectedUser.status === 'active' && <ShieldCheck className="w-5 h-5 text-apple-green" />}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <Badge className={cn(
                        "px-2 py-0.5 rounded-full border-none text-[8px] uppercase font-black tracking-widest text-white shadow-none",
                        selectedUser.status === 'active' ? "bg-apple-green" : 
                        selectedUser.status === 'suspended' ? "bg-apple-orange" : "bg-apple-red"
                      )}>
                        {selectedUser.status} Status
                      </Badge>
                      <Badge className="bg-purple-600 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border-none">
                        {selectedUser.role} / {selectedUser.accountType || 'Standard'}
                      </Badge>
                      <Badge className="bg-apple-blue text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border-none">
                        Lvl {selectedUser.verificationLevel ?? 0} Verified
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <TabsList className="bg-[#F5F5F7] dark:bg-white/5 p-1 rounded-xl">
                    <TabsTrigger value="dossier" className="rounded-lg text-xs font-bold px-3 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-apple-blue">
                      Profile Dossier
                    </TabsTrigger>
                    <TabsTrigger value="override" className="rounded-lg text-xs font-bold px-3 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-apple-blue flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" /> Administrative Control
                    </TabsTrigger>
                  </TabsList>
                  <Button variant="ghost" className="rounded-full h-8 w-8 p-0 hover:bg-[#F5F5F7] dark:hover:bg-white/5" onClick={() => setIsDetailsOpen(false)}>
                    ✕
                  </Button>
                </div>
              </header>

              {/* Tab 1: Profile Dossier (Read-Only Specs & Attachments) */}
              <TabsContent value="dossier" className="flex-1 overflow-hidden m-0 outline-none flex flex-col">
                {/* Main Contents (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
                  {/* Section 1: User Profile & Key Statistics */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-apple-text-muted">Identity Portfolio & Key Stats</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Ecosystem Standing', value: selectedUser.status === 'active' ? 'Active Member' : 'Suspended', icon: ShieldCheck, color: 'text-apple-green bg-apple-green/5 border-apple-green/10' },
                        { label: 'Ecosystem Role', value: `${selectedUser.role} (${selectedUser.accountType || 'Standard'})`, icon: Crown, color: 'text-purple-500 bg-purple-500/5 border-purple-500/10' },
                        { label: 'Trust Rating', value: `${selectedUser.trustScore || 0}% Trust`, icon: Activity, color: 'text-apple-blue bg-apple-blue/5 border-apple-blue/10' },
                        { label: 'Suspicious Activity', value: `${selectedUser.suspiciousActivityCount || 0} Infractions`, icon: ShieldAlert, color: selectedUser.suspiciousActivityCount > 0 ? 'text-apple-red bg-apple-red/5 border-apple-red/10 animate-pulse' : 'text-apple-orange bg-apple-orange/5 border-apple-orange/10' },
                      ].map((spec, i) => (
                        <div key={i} className={cn("p-4.5 rounded-2xl border flex flex-col justify-between group", spec.color)}>
                          <spec.icon className="w-5 h-5 mb-3 group-hover:scale-110 transition-transform" />
                          <div>
                            <div className="text-[8px] font-black uppercase tracking-wider opacity-60 mb-1">{spec.label}</div>
                            <div className="font-bold text-xs tracking-tight truncate">{spec.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 2: Detailed User Dossier Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: General & Account Records */}
                    <div className="p-6 rounded-[2rem] bg-[#F5F5F7] dark:bg-white/[0.02] border border-apple-border/5 space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-text-muted flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-apple-blue" /> Legal & Account Records
                      </h4>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs font-semibold text-[#1D1D1F] dark:text-zinc-200">
                        <div>
                          <span className="text-[8px] font-bold text-[#86868B] uppercase block">Legal Name</span>
                          <span className="font-bold mt-1 block">{(selectedUser.firstName && selectedUser.lastName) ? `${selectedUser.firstName} ${selectedUser.lastName}` : (selectedUser.displayName || 'Not configured')}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-bold text-[#86868B] uppercase block">Platform Handle</span>
                          <span className="font-bold mt-1 block">{selectedUser.username ? `@${selectedUser.username}` : 'Not configured'}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-bold text-[#86868B] uppercase block">Ecosystem Entry</span>
                          <span className="font-bold mt-1 block">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'Today'}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-bold text-[#86868B] uppercase block">Account UID</span>
                          <span className="font-bold mt-1 block font-mono truncate max-w-full text-[10px]" title={selectedUser.uid}>{selectedUser.uid}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-bold text-[#86868B] uppercase block">Date of Birth</span>
                          <span className="font-bold mt-1 block">{selectedUser.dob ? new Date(selectedUser.dob).toLocaleDateString() : 'Not configured'}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-bold text-[#86868B] uppercase block">Gender Profile</span>
                          <span className="font-bold mt-1 block">{selectedUser.gender || 'Not configured'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Contact Channels & Location */}
                    <div className="p-6 rounded-[2rem] bg-[#F5F5F7] dark:bg-white/[0.02] border border-apple-border/5 space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-text-muted flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-apple-green" /> Communication Channels
                      </h4>
                      <div className="space-y-3.5 text-xs text-[#1D1D1F] dark:text-zinc-200">
                        <div className="flex items-center gap-2.5">
                          <Mail className="w-4 h-4 text-[#86868B]" />
                          <span className="font-semibold">{selectedUser.email}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Phone className="w-4 h-4 text-[#86868B]" />
                          <span className="font-semibold">{selectedUser.phone || selectedUser.phoneNumber || 'Not configured'}</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <MapPin className="w-4 h-4 text-[#86868B] shrink-0 mt-0.5" />
                          <span className="font-semibold leading-relaxed">
                            {(selectedUser.city || selectedUser.country) ? `${selectedUser.city || ''}, ${selectedUser.country || ''}`.replace(/^,\s*/, '') : 'Not configured'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Globe className="w-4 h-4 text-[#86868B]" />
                          <span className="font-semibold">Last Known IP: {selectedUser.lastKnownIp || '0.0.0.0'}</span>
                        </div>
                        <div className="flex items-center gap-2.5 pt-1.5 border-t border-apple-border/5 justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] font-bold text-[#86868B] uppercase block">Campaign Code: </span>
                            <span className="font-bold text-xs ml-1 block">{selectedUser.referralCode || 'None'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] font-bold text-[#86868B] uppercase block">Tier: </span>
                            <span className="font-bold text-xs ml-1 block text-purple-500">{selectedUser.accountType || 'Standard'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: VERIFICATION ATTACHMENTS & SECURE DOCUMENTS */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-apple-text-muted px-1 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-apple-blue" /> Verified Identity Documentation & Uploaded Attachments
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {/* Attachment 1: ID Card Front */}
                      <div className="bg-[#F5F5F7] dark:bg-white/[0.02] border border-apple-border/5 rounded-[2rem] p-5 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[8px] font-black uppercase tracking-wider text-apple-blue">National ID (Front)</span>
                            <span className="text-[7px] font-black uppercase tracking-wider text-apple-green bg-apple-green/5 px-2 py-0.5 rounded-full">Secure Scan</span>
                          </div>
                          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 border border-apple-border/5 group">
                            <img 
                              src={selectedUser.id_front || selectedUser.identityDocumentFront || 'https://picsum.photos/seed/id_front_user/800/600'} 
                              alt="National ID Front"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            <a 
                              href={selectedUser.id_front || selectedUser.identityDocumentFront || 'https://picsum.photos/seed/id_front_user/800/600'} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 font-bold text-white text-xs gap-1.5"
                            >
                              Inspect Attachment <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                        <a 
                          href={selectedUser.id_front || selectedUser.identityDocumentFront || 'https://picsum.photos/seed/id_front_user/800/600'} 
                          download="User_National_ID_Front.png"
                          target="_blank; noreferrer"
                          className="w-full"
                        >
                          <Button variant="outline" className="w-full rounded-xl text-[9px] font-bold uppercase tracking-wider h-9 gap-1.5 border-apple-border/15">
                            <Download className="w-3.5 h-3.5" /> Download ID Front
                          </Button>
                        </a>
                      </div>

                      {/* Attachment 2: ID Card Back */}
                      <div className="bg-[#F5F5F7] dark:bg-white/[0.02] border border-apple-border/5 rounded-[2rem] p-5 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[8px] font-black uppercase tracking-wider text-apple-blue">National ID (Back)</span>
                            <span className="text-[7px] font-black uppercase tracking-wider text-apple-green bg-apple-green/5 px-2 py-0.5 rounded-full">Secure Scan</span>
                          </div>
                          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 border border-apple-border/5 group">
                            <img 
                              src={selectedUser.id_back || selectedUser.identityDocumentBack || 'https://picsum.photos/seed/id_back_user/800/600'} 
                              alt="National ID Back"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            <a 
                              href={selectedUser.id_back || selectedUser.identityDocumentBack || 'https://picsum.photos/seed/id_back_user/800/600'} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 font-bold text-white text-xs gap-1.5"
                            >
                              Inspect Attachment <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                        <a 
                          href={selectedUser.id_back || selectedUser.identityDocumentBack || 'https://picsum.photos/seed/id_back_user/800/600'} 
                          download="User_National_ID_Back.png"
                          target="_blank; noreferrer"
                          className="w-full"
                        >
                          <Button variant="outline" className="w-full rounded-xl text-[9px] font-bold uppercase tracking-wider h-9 gap-1.5 border-apple-border/15">
                            <Download className="w-3.5 h-3.5" /> Download ID Back
                          </Button>
                        </a>
                      </div>

                      {/* Attachment 3: Biometric Selfie */}
                      <div className="bg-[#F5F5F7] dark:bg-white/[0.02] border border-apple-border/5 rounded-[2rem] p-5 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[8px] font-black uppercase tracking-wider text-apple-blue">Biometric Selfie Match</span>
                            <span className="text-[7px] font-black uppercase tracking-wider text-apple-green bg-apple-green/5 px-2 py-0.5 rounded-full">Liveness Pass</span>
                          </div>
                          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 border border-apple-border/5 group">
                            <img 
                              src={selectedUser.selfieUrl || selectedUser.photoURL || 'https://picsum.photos/seed/user_selfie/800/600'} 
                              alt="Biometric Selfie Scan"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            <a 
                              href={selectedUser.selfieUrl || selectedUser.photoURL || 'https://picsum.photos/seed/user_selfie/800/600'} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 font-bold text-white text-xs gap-1.5"
                            >
                              Inspect Attachment <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                        <a 
                          href={selectedUser.selfieUrl || selectedUser.photoURL || 'https://picsum.photos/seed/user_selfie/800/600'} 
                          download="User_Biometric_Selfie.png"
                          target="_blank; noreferrer"
                          className="w-full"
                        >
                          <Button variant="outline" className="w-full rounded-xl text-[9px] font-bold uppercase tracking-wider h-9 gap-1.5 border-apple-border/15">
                            <Download className="w-3.5 h-3.5" /> Download Selfie
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Activity Forensics */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-apple-text-muted px-1 flex items-center gap-2">
                      <History className="w-4 h-4 text-apple-blue" /> Identity Access Forensics & Geolocation Signals
                    </h3>
                    <div className="space-y-3">
                      {selectedUser.ipHistory && selectedUser.ipHistory.length > 0 ? (
                        selectedUser.ipHistory.map((h, i) => (
                          <div key={i} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-[#F5F5F7] dark:bg-white/[0.02] border border-apple-border/5 group hover:border-apple-blue/30 transition-all duration-300">
                            <div className="flex items-center gap-4">
                              <div className="w-2.5 h-2.5 rounded-full bg-apple-green pulse shadow-lg shadow-apple-green/20" />
                              <div>
                                <div className="font-bold text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">Identity Access from {h.location}</div>
                                <div className="text-[8px] font-bold text-[#86868B] uppercase tracking-wider mt-0.5 font-mono">Verified Node IP: {h.ip}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[9px] font-bold uppercase text-[#86868B]">{new Date(h.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-5 rounded-[1.5rem] bg-[#F5F5F7] dark:bg-white/[0.02] border border-apple-border/5 text-center text-xs text-[#86868B] font-semibold">
                          No verification access history recorded.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <footer className="p-6 border-t border-apple-border/10 bg-neutral-50 dark:bg-white/[0.02] flex justify-end gap-3 shrink-0 flex-wrap">
                  <Button 
                    variant="outline" 
                    className="rounded-xl px-5 font-bold text-xs hover:bg-[#F5F5F7] dark:hover:bg-white/5" 
                    onClick={() => setIsDetailsOpen(false)}
                  >
                    Close Profile
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="rounded-xl px-5 font-bold text-xs hover:bg-[#F5F5F7] dark:hover:bg-white/5"
                    onClick={() => {
                      if (window.confirm("CRITICAL: This will bypass all AI security checks. Proceed?")) {
                        handleAdminUpdate(selectedUser.uid, { 
                          identity_status: 'verified', 
                          isEmailVerified: true, 
                          isPhoneVerified: true,
                          email_verified: true,
                          phone_verified: true,
                          verificationLevel: 3,
                          verified_badge_type: 'identity',
                          badgeType: 'identity',
                          isVerified: true,
                          trustScore: 100
                        }).then(() => {
                          setSelectedUser(prev => prev ? { 
                            ...prev, 
                            identity_status: 'verified', 
                            isEmailVerified: true, 
                            isPhoneVerified: true,
                            email_verified: true,
                            phone_verified: true,
                            verificationLevel: 3,
                            verified_badge_type: 'identity',
                            badgeType: 'identity',
                            isVerified: true,
                            trustScore: 100
                          } : null);
                        });
                      }
                    }}
                  >
                    Force Verification
                  </Button>

                  <Button 
                    variant="outline" 
                    className="rounded-xl px-5 font-bold text-xs text-apple-orange border-apple-orange/20 hover:bg-apple-orange/5"
                    onClick={() => {
                      if (window.confirm("Reset all integrity flags for this node?")) {
                        handleAdminUpdate(selectedUser.uid, { 
                          identity_status: 'unverified',
                          isEmailVerified: false,
                          isPhoneVerified: false,
                          email_verified: false,
                          phone_verified: false,
                          verificationLevel: 0,
                          verified_badge_type: 'none',
                          badgeType: 'none',
                          isVerified: false,
                          trustScore: 0,
                          suspiciousActivityCount: 0
                        }).then(() => {
                          setSelectedUser(prev => prev ? { 
                            ...prev, 
                            identity_status: 'unverified', 
                            isEmailVerified: false, 
                            isPhoneVerified: false,
                            email_verified: false,
                            phone_verified: false,
                            verificationLevel: 0,
                            verified_badge_type: 'none',
                            badgeType: 'none',
                            isVerified: false,
                            trustScore: 0,
                            suspiciousActivityCount: 0
                          } : null);
                        });
                      }
                    }}
                  >
                    Reset Integrity
                  </Button>

                  <Button 
                    className={cn(
                      "rounded-xl px-5 font-bold text-xs text-white border-none shadow-md transition-all active:scale-95", 
                      selectedUser.status === 'suspended' ? 'bg-apple-green hover:bg-apple-green/90' : 'bg-apple-red hover:bg-apple-red/90'
                    )} 
                    onClick={() => setIsSuspendConfirmOpen(true)}
                  >
                    {selectedUser.status === 'suspended' ? 'Restore Account' : 'Suspend Account'}
                  </Button>
                </footer>
              </TabsContent>

              {/* Tab 2: Overrule Control (Full Attributes Editor) */}
              <TabsContent value="override" className="flex-1 overflow-hidden m-0 outline-none flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
                  <div className="bg-[#F5F5F7] dark:bg-white/[0.02] p-6 rounded-3xl border border-apple-border/5 space-y-2">
                    <h3 className="text-sm font-bold flex items-center gap-1.5 text-apple-blue">
                      <Shield className="w-4 h-4" /> Comprehensive Administration Overrule console
                    </h3>
                    <p className="text-xs text-[#86868B] leading-relaxed font-medium">
                      Modify any attribute of this identity. Overrule account types, permissions, verify profiles, change status metrics, reset infractions, and allocate system privileges. These overrides bypass the standard client-side registration checks.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Column 1: Core Identity Fields */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-apple-text-muted px-1">Core Identity Attributes</h4>
                      
                      <div className="space-y-3 bg-[#F5F5F7] dark:bg-white/[0.01] p-5 rounded-3xl border border-apple-border/5">
                        <div>
                          <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">Display Name</label>
                          <Input 
                            value={editUser.displayName || ""} 
                            onChange={(e) => setEditUser({ ...editUser, displayName: e.target.value })}
                            className="bg-white dark:bg-zinc-900 border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-medium" 
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">Username Handle</label>
                          <Input 
                            value={editUser.username || ""} 
                            onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                            className="bg-white dark:bg-zinc-900 border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-mono font-bold" 
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">Email Address</label>
                          <Input 
                            type="email"
                            value={editUser.email || ""} 
                            onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                            className="bg-white dark:bg-zinc-900 border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-medium" 
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">Phone Number</label>
                          <Input 
                            value={editUser.phoneNumber || editUser.phone || ""} 
                            onChange={(e) => setEditUser({ ...editUser, phoneNumber: e.target.value, phone: e.target.value })}
                            className="bg-white dark:bg-zinc-900 border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-medium" 
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">Date of Birth</label>
                            <Input 
                              type="date"
                              value={editUser.dob ? editUser.dob.substring(0, 10) : ""} 
                              onChange={(e) => setEditUser({ ...editUser, dob: e.target.value })}
                              className="bg-white dark:bg-zinc-900 border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-semibold" 
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">Gender Profile</label>
                            <select 
                              value={editUser.gender || "Not configured"} 
                              onChange={(e) => setEditUser({ ...editUser, gender: e.target.value })}
                              className="w-full bg-white dark:bg-zinc-900 border border-apple-border/10 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-apple-blue/30 text-stone-900 dark:text-zinc-100"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                              <option value="Not configured">Not configured</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">City</label>
                            <Input 
                              value={editUser.city || ""} 
                              onChange={(e) => setEditUser({ ...editUser, city: e.target.value })}
                              className="bg-white dark:bg-zinc-900 border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-medium" 
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">Country</label>
                            <Input 
                              value={editUser.country || ""} 
                              onChange={(e) => setEditUser({ ...editUser, country: e.target.value })}
                              className="bg-white dark:bg-zinc-900 border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-medium" 
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">Campaign Referral Code</label>
                          <Input 
                            value={editUser.referralCode || ""} 
                            onChange={(e) => setEditUser({ ...editUser, referralCode: e.target.value })}
                            className="bg-white dark:bg-zinc-900 border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-mono text-xs uppercase" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Governance & Security Parameters */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-apple-text-muted px-1">Ecosystem Rights & Integrity Ratings</h4>

                      <div className="space-y-4 bg-[#F5F5F7] dark:bg-white/[0.01] p-5 rounded-3xl border border-apple-border/5">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">Account Status</label>
                            <select 
                              value={editUser.status} 
                              onChange={(e) => setEditUser({ ...editUser, status: e.target.value as any })}
                              className="w-full bg-white dark:bg-zinc-900 border border-apple-border/10 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-apple-blue/30 text-stone-900 dark:text-zinc-100"
                            >
                              <option value="active">Active</option>
                              <option value="suspended">Suspended</option>
                              <option value="banned">Banned</option>
                              <option value="pending">Pending</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">System Role</label>
                            <select 
                              value={editUser.role} 
                              onChange={(e) => setEditUser({ ...editUser, role: e.target.value as any })}
                              className="w-full bg-white dark:bg-zinc-900 border border-apple-border/10 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-apple-blue/30 text-stone-900 dark:text-zinc-100"
                            >
                              <option value="user">Standard User</option>
                              <option value="moderator">Moderator</option>
                              <option value="admin">System Admin</option>
                              <option value="finance">Finance Specialist</option>
                              <option value="support">Customer Support</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">Account Category</label>
                            <select 
                              value={editUser.accountType || "user"} 
                              onChange={(e) => setEditUser({ ...editUser, accountType: e.target.value })}
                              className="w-full bg-white dark:bg-zinc-900 border border-apple-border/10 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-apple-blue/30 text-stone-900 dark:text-zinc-100"
                            >
                              <option value="user">Standard Member</option>
                              <option value="dealer">Automotive Dealer</option>
                              <option value="company">Corporate Enterprise</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">Verification Level</label>
                            <select 
                              value={editUser.verificationLevel ?? 0} 
                              onChange={(e) => setEditUser({ ...editUser, verificationLevel: Number(e.target.value) as any })}
                              className="w-full bg-white dark:bg-zinc-900 border border-apple-border/10 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-apple-blue/30 text-stone-900 dark:text-zinc-100"
                            >
                              <option value={0}>Lvl 0 (None)</option>
                              <option value={1}>Lvl 1 (Email Linked)</option>
                              <option value={2}>Lvl 2 (Phone & Otp)</option>
                              <option value={3}>Lvl 3 (ID Verified)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-bold text-[#86868B] uppercase block">Trust Rating Index</label>
                            <span className="text-xs font-black text-apple-blue">{editUser.trustScore ?? 0}% Trust</span>
                          </div>
                          <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-apple-border/10">
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              value={editUser.trustScore ?? 0} 
                              onChange={(e) => setEditUser({ ...editUser, trustScore: Number(e.target.value) })}
                              className="flex-1 accent-apple-blue h-1"
                            />
                            <input 
                              type="number" 
                              min="0" 
                              max="100" 
                              value={editUser.trustScore ?? 0} 
                              onChange={(e) => setEditUser({ ...editUser, trustScore: Math.min(100, Math.max(0, Number(e.target.value))) })}
                              className="w-12 text-center text-xs font-bold bg-transparent border-b border-apple-border/10 focus:outline-none text-stone-800 dark:text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">Risk Security Score</label>
                            <Input 
                              type="number" 
                              min="0" 
                              max="100" 
                              value={editUser.riskScore ?? 0} 
                              onChange={(e) => setEditUser({ ...editUser, riskScore: Number(e.target.value) })}
                              className="bg-white dark:bg-zinc-900 border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-bold" 
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">System Risk Tier</label>
                            <select 
                              value={editUser.riskLevel || "low"} 
                              onChange={(e) => setEditUser({ ...editUser, riskLevel: e.target.value as any })}
                              className="w-full bg-white dark:bg-zinc-900 border border-apple-border/10 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-apple-blue/30 text-stone-900 dark:text-zinc-100"
                            >
                              <option value="low">Low Risk</option>
                              <option value="medium">Medium Risk</option>
                              <option value="high">High Risk</option>
                              <option value="critical">Critical Risk</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">Suspicious Infractions Count</label>
                          <Input 
                            type="number" 
                            min="0" 
                            value={editUser.suspiciousActivityCount ?? 0} 
                            onChange={(e) => setEditUser({ ...editUser, suspiciousActivityCount: Number(e.target.value) })}
                            className="bg-white dark:bg-zinc-900 border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-bold" 
                          />
                        </div>

                        <div className="pt-2 border-t border-apple-border/5 space-y-3">
                          <span className="text-[8px] font-black uppercase text-[#86868B] block tracking-wider">Communication Verification Flags</span>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <label className="flex items-center gap-2 p-3 bg-white dark:bg-zinc-900 border border-apple-border/10 rounded-xl cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={editUser.isEmailVerified || false} 
                                onChange={(e) => setEditUser({ ...editUser, isEmailVerified: e.target.checked, email_verified: e.target.checked })}
                                className="accent-apple-blue w-4 h-4 rounded-md"
                              />
                              <span className="text-[10px] font-bold text-stone-800 dark:text-zinc-100">Email Approved</span>
                            </label>

                            <label className="flex items-center gap-2 p-3 bg-white dark:bg-zinc-900 border border-apple-border/10 rounded-xl cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={editUser.isPhoneVerified || false} 
                                onChange={(e) => setEditUser({ ...editUser, isPhoneVerified: e.target.checked, phone_verified: e.target.checked })}
                                className="accent-apple-blue w-4 h-4 rounded-md"
                              />
                              <span className="text-[10px] font-bold text-stone-800 dark:text-zinc-100">Phone Approved</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Audit Memo */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-apple-text-muted px-1 block">Administrative Audit Memo / Notes</label>
                    <textarea 
                      value={editUser.adminNotes || ""} 
                      onChange={(e) => setEditUser({ ...editUser, adminNotes: e.target.value })}
                      placeholder="Input relevant legal clearances, notes, verification logs, or justification of status edits..."
                      className="w-full h-24 p-4 bg-[#F5F5F7] dark:bg-white/[0.01] border border-apple-border/10 focus:border-apple-blue/30 rounded-3xl text-xs font-semibold focus:ring-0 outline-none text-stone-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Overrule Save Footer */}
                <footer className="p-6 border-t border-apple-border/10 bg-neutral-50 dark:bg-white/[0.02] flex justify-end gap-3 shrink-0 flex-wrap">
                  <Button 
                    variant="outline" 
                    className="rounded-xl px-5 font-bold text-xs hover:bg-[#F5F5F7] dark:hover:bg-white/5" 
                    onClick={() => setIsDetailsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="rounded-xl px-5 font-bold text-xs bg-apple-blue hover:bg-apple-blue/90 text-white border-none shadow-lg shadow-apple-blue/15 active:scale-95" 
                    onClick={async () => {
                      try {
                        const { uid, ...updateData } = editUser;
                        await handleAdminUpdate(selectedUser.uid, updateData);
                        setSelectedUser(editUser);
                        toast.success("Administrative Override Completed", {
                          description: `${editUser.displayName}'s credentials successfully overbalanced on cloud registry.`
                        });
                      } catch (err) {
                        toast.error("Cloud registration failed.");
                      }
                    }}
                  >
                    Save Overrule Changes
                  </Button>
                </footer>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Suspension Modal */}
      <Dialog open={isSuspendConfirmOpen} onOpenChange={setIsSuspendConfirmOpen}>
        <DialogContent className="max-w-md rounded-[40px] border-apple-border/10 bg-white dark:bg-[#1D1D1F] p-10">
          <div className="text-center space-y-6">
            <div className={cn(
              "w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-6",
              selectedUser?.status === 'suspended' ? "bg-apple-green/10" : "bg-apple-red/10"
            )}>
              {selectedUser?.status === 'suspended' ? <CheckCircle2 className="w-12 h-12 text-apple-green" /> : <ShieldAlert className="w-12 h-12 text-apple-red" />}
            </div>
            <DialogTitle className="text-3xl font-black tracking-tighter">
              {selectedUser?.status === 'suspended' ? 'Restore Ecosystem?' : 'Suspend Access?'}
            </DialogTitle>
            <p className="font-bold text-sm text-apple-text-muted uppercase tracking-widest opacity-60 leading-relaxed px-8">
              {selectedUser?.status === 'suspended' 
                ? `Authorizing full platform privileges for identity node ${selectedUser.displayName}.`
                : `Initiating immediate revocation of all interactive platform privileges for identity ${selectedUser?.displayName}.`}
            </p>
            <div className="flex flex-col gap-3 pt-4">
              <Button 
                className={cn(
                  "rounded-2xl w-full h-16 font-black uppercase tracking-widest text-xs shadow-2xl transition-all active:scale-95 border-none text-white",
                  selectedUser?.status === 'suspended' ? "bg-apple-green" : "bg-apple-red shadow-apple-red/20"
                )} 
                onClick={confirmSuspend}
              >
                Confirm Security Action
              </Button>
              <Button variant="ghost" className="rounded-2xl w-full h-14 font-black uppercase tracking-widest text-[10px] text-apple-text-muted" onClick={() => setIsSuspendConfirmOpen(false)}>
                Abort Protocol
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
