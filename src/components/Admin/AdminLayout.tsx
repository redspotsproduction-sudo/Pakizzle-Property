import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Users, 
  Store, 
  Car, 
  MessageSquare, 
  CreditCard, 
  DollarSign,
  AlertTriangle, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  Bell,
  Search,
  ShieldCheck,
  Tag,
  FileText,
  Activity,
  Database,
  Sliders,
  Megaphone,
  Video,
  Building2,
  Home,
  Sparkles,
  Sun,
  Moon,
  Monitor
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { db } from "@/firebase";
import { collection, query, orderBy, limit, onSnapshot, where } from "firebase/firestore";
import SearchModal from "@/components/SearchModal";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  badge?: number | string;
  category: 'Console' | 'Inventory' | 'Community' | 'Services' | 'Operations';
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin', category: 'Console' },
  { id: 'approvals', label: 'Approval Center', icon: CheckCircle2, path: '/admin/approvals', badge: 5, category: 'Console' },
  { id: 'reports', label: 'Reports', icon: AlertTriangle, path: '/admin/reports', badge: 2, category: 'Console' },
  { id: 'audit', label: 'Audit Logs', icon: Activity, path: '/admin/audit', category: 'Console' },

  { id: 'listings', label: 'Listings', icon: Car, path: '/admin/listings', category: 'Inventory' },
  { id: 'videos', label: 'PakStories Videos', icon: Video, path: '/admin/videos', badge: 'New', category: 'Inventory' },
  { id: 'vehicle-data', label: 'Vehicle Data', icon: Database, path: '/admin/vehicle-data', category: 'Inventory' },
  { id: 'categories', label: 'Categories', icon: LayoutDashboard, path: '/admin/categories', category: 'Inventory' },
  { id: 'popular-styles', label: 'Popular Vehicle Styles', icon: Sliders, path: '/admin/popular-styles', category: 'Inventory' },
  { id: 'custom-fields', label: 'Custom Fields', icon: FileText, path: '/admin/custom-fields', category: 'Inventory' },

  { id: 'users', label: 'Users', icon: Users, path: '/admin/users', category: 'Community' },
  { id: 'dealers', label: 'Dealers', icon: Store, path: '/admin/dealers', category: 'Community' },
  { id: 'companies', label: 'Companies', icon: Building2, path: '/admin/companies', category: 'Community' },
  { id: 'verifications', label: 'Verifications Review', icon: ShieldCheck, path: '/admin/verifications', category: 'Community' },

  { id: 'inspections', label: 'Inspections CRM', icon: Activity, path: '/admin/inspections', category: 'Services' },
  { id: 'insurance', label: 'Insurance Terminal', icon: ShieldCheck, path: '/admin/insurance', category: 'Services' },
  { id: 'financing', label: 'Financing Capital', icon: DollarSign, path: '/admin/financing', category: 'Services' },
  { id: 'chats', label: 'Moderation', icon: MessageSquare, path: '/admin/chats', category: 'Services' },

  { id: 'pricing', label: 'Pricing Plans', icon: Tag, path: '/admin/pricing', category: 'Operations' },
  { id: 'payments', label: 'Payments', icon: CreditCard, path: '/admin/payments', category: 'Operations' },
  { id: 'content', label: 'Content', icon: FileText, path: '/admin/content', category: 'Operations' },
  { id: 'banners', label: 'Banners & Sliders', icon: Tag, path: '/admin/banners', category: 'Operations' },
  { id: 'seo-aeo-geo', label: 'SEO & Generative AI', icon: Sparkles, path: '/admin/seo-aeo-geo', category: 'Operations' },
  { id: 'ads', label: 'Featured Ads', icon: Megaphone, path: '/admin/ads', category: 'Operations' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings', category: 'Operations' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { profile, logout, isAdmin, isModerator } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingInspectionsCount, setPendingInspectionsCount] = useState(0);
  const [pendingInsuranceCount, setPendingInsuranceCount] = useState(0);
  const [pendingFinancingCount, setPendingFinancingCount] = useState(0);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Global 1-Tap Search & Cmd+K listeners for Admin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
    };
    const handleOpenSearch = () => setShowSearchModal(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pakizzle:open-search", handleOpenSearch);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pakizzle:open-search", handleOpenSearch);
    };
  }, []);

  // Real-time listener for new requests
  React.useEffect(() => {
    if (!isAdmin && !isModerator) return;
    setIsAuthReady(true);

    const startTime = Date.now();

    // Inspection Listeners
    const qInspNotification = query(collection(db, 'inspection_requests'), orderBy('createdAt', 'desc'), limit(1));
    const unsubscribeInspNotif = onSnapshot(qInspNotification, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          const createdAt = data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now();
          if (createdAt > startTime) {
            toast("New Inspection Request", {
              description: `${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel}`,
              action: { label: "View", onClick: () => navigate('/admin/inspections') },
              icon: <Activity className="w-4 h-4 text-apple-blue" />
            });
          }
        }
      });
    });

    const unsubscribeInspCount = onSnapshot(query(collection(db, 'inspection_requests'), where('status', '==', 'pending')), (snap) => {
      setPendingInspectionsCount(snap.size);
    });

    // Insurance Listeners
    const qInsNotification = query(collection(db, 'insurance_requests'), orderBy('createdAt', 'desc'), limit(1));
    const unsubscribeInsNotif = onSnapshot(qInsNotification, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          const createdAt = data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now();
          if (createdAt > startTime) {
            toast("New Insurance Request", {
              description: `${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel}`,
              action: { label: "View Terminal", onClick: () => navigate('/admin/insurance') },
              icon: <ShieldCheck className="w-4 h-4 text-apple-green" />
            });
          }
        }
      });
    });

    const unsubscribeInsCount = onSnapshot(query(collection(db, 'insurance_requests'), where('status', '==', 'pending')), (snap) => {
      setPendingInsuranceCount(snap.size);
    });

    // Financing Listeners
    const qFinNotification = query(collection(db, 'financing_requests'), orderBy('createdAt', 'desc'), limit(1));
    const unsubscribeFinNotif = onSnapshot(qFinNotification, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          const createdAt = data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now();
          if (createdAt > startTime) {
            toast("New Financing Request", {
              description: `${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel}`,
              action: { label: "View Capital", onClick: () => navigate('/admin/financing') },
              icon: <DollarSign className="w-4 h-4 text-apple-blue" />
            });
          }
        }
      });
    });

    const unsubscribeFinCount = onSnapshot(query(collection(db, 'financing_requests'), where('status', '==', 'pending')), (snap) => {
      setPendingFinancingCount(snap.size);
    });

    return () => {
      unsubscribeInspNotif();
      unsubscribeInspCount();
      unsubscribeInsNotif();
      unsubscribeInsCount();
      unsubscribeFinNotif();
      unsubscribeFinCount();
    };
  }, [isAdmin, isModerator, navigate]);

  const updatedNavItems = navItems.map(item => {
    if (item.id === 'inspections') return { ...item, badge: pendingInspectionsCount > 0 ? pendingInspectionsCount : undefined };
    if (item.id === 'insurance') return { ...item, badge: pendingInsuranceCount > 0 ? pendingInsuranceCount : undefined };
    if (item.id === 'financing') return { ...item, badge: pendingFinancingCount > 0 ? pendingFinancingCount : undefined };
    return item;
  });

  const activeItem = updatedNavItems.find(item => item.path === location.pathname) || updatedNavItems[0];

  return (
    <div className="h-screen w-screen bg-apple-bg dark:bg-black text-apple-text flex font-sans selection:bg-apple-blue/20 overflow-hidden">
      {/* Desktop Sidebar with Restrained Glass Styling */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 96 : 300 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className={cn(
          "hidden lg:flex flex-col liquid-glass-restrained border-r border-slate-200/80 dark:border-white/10 h-full z-50 shrink-0",
          isSidebarCollapsed ? "items-center" : ""
        )}
      >
        <div className="p-8 flex items-center justify-between shrink-0">
          <AnimatePresence mode="wait">
            {!isSidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => navigate('/')}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-10 h-10 bg-apple-blue rounded-[12px] flex items-center justify-center shadow-lg shadow-apple-blue/30 group-hover:scale-105 transition-transform duration-500">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-apple-text to-apple-text/50">Pakizzle</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-10 h-10 flex items-center justify-center hover:bg-apple-gray dark:hover:bg-white/5 rounded-xl transition-all duration-300 text-apple-text-muted hover:text-apple-text hover:rotate-180"
          >
            <ChevronLeft className={cn("w-5 h-5 transition-transform duration-500", isSidebarCollapsed && "rotate-180")} />
          </button>
        </div>

        {!isSidebarCollapsed && (
          <div className="px-8 py-3 mb-2 border-b border-apple-border/10 dark:border-white/[0.05] shrink-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-apple-text-muted/60">Admin Control Room</p>
          </div>
        )}

        <ScrollArea className="flex-1 px-4 min-h-0 custom-scrollbar">
          <nav className="space-y-8 py-2">
            {['Console', 'Inventory', 'Community', 'Services', 'Operations'].map((category) => (
              <div key={category} className="space-y-3">
                {!isSidebarCollapsed && (
                  <h2 className="text-[11px] font-bold text-apple-text-muted/60 uppercase tracking-widest px-4">
                    {category === 'Console' ? 'Dashboard & Terminal' :
                     category === 'Inventory' ? 'Inventory & Data' :
                     category === 'Community' ? 'Users & Partners' :
                     category === 'Services' ? 'Integrations & CRM' : 'Operations & Settings'}
                  </h2>
                )}
                <div className="space-y-1">
                  {updatedNavItems.filter(s => s.category === category).map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        className={cn(
                          "w-full flex items-center gap-3 transition-all duration-300 group relative overflow-hidden",
                          isSidebarCollapsed ? "justify-center p-3.5 rounded-[18px]" : "px-4 py-3 rounded-2xl",
                          isActive 
                            ? "bg-apple-blue text-white shadow-lg shadow-apple-blue/20" 
                            : "hover:bg-apple-gray dark:hover:bg-white/5 text-apple-text-muted hover:text-apple-text"
                        )}
                      >
                        <item.icon className={cn(
                          "w-5 h-5 transition-all duration-300",
                          isActive ? "text-white" : "text-apple-text-muted group-hover:text-apple-blue group-hover:scale-110"
                        )} />
                        {!isSidebarCollapsed && (
                          <span className="text-sm font-semibold tracking-tight">{item.label}</span>
                        )}
                        {!isSidebarCollapsed && item.badge && (
                          <span className={cn(
                            "ml-auto px-2 py-0.5 rounded-full text-[10px] font-semibold animate-pulse",
                            isActive ? "bg-white text-apple-blue" : "bg-apple-blue text-white"
                          )}>
                            {item.badge}
                          </span>
                        )}
                        {isSidebarCollapsed && item.badge && (
                          <div className="absolute top-2 right-2 w-2 h-2 bg-apple-blue rounded-full border-2 border-white dark:border-[#1D1D1F] animate-ping" />
                        )}
                        {!isSidebarCollapsed && isActive && (
                          <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-3 border-t border-apple-border/50">
          <button
            className={cn(
              "w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-apple-red hover:bg-apple-red/10 transition-all duration-500 group",
              isSidebarCollapsed ? "justify-center" : "justify-start"
            )}
            onClick={logout}
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            {!isSidebarCollapsed && <span className="font-bold text-[13px] tracking-tight">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-apple-blue/5 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* Top Header */}
        <header className="h-[88px] bg-white/40 dark:bg-[#000000]/40 backdrop-blur-2xl border-b border-apple-border/30 flex items-center justify-between px-8 lg:px-12 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <button
              className="lg:hidden w-12 h-12 flex items-center justify-center bg-apple-gray dark:bg-white/5 rounded-2xl transition-all hover:scale-105 active:scale-95"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-apple-blue shadow-[0_0_10px_rgba(0,125,255,0.5)]" />
              <h1 className="text-xl font-bold tracking-tight text-apple-text">{activeItem.label}</h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div 
              onClick={() => setShowSearchModal(true)}
              className="relative hidden sm:block group cursor-pointer"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-text-muted group-hover:text-apple-blue transition-colors duration-500" />
              <input
                type="text"
                readOnly
                placeholder="Search anything... (⌘K)"
                className="pl-11 pr-4 py-3 bg-apple-gray/50 dark:bg-white/5 border border-transparent hover:border-apple-blue/30 rounded-2xl text-[13px] font-medium focus:ring-0 outline-none w-64 lg:w-96 transition-all duration-500 shadow-inner cursor-pointer"
              />
            </div>

            <button 
              onClick={() => setShowSearchModal(true)}
              className="sm:hidden w-11 h-11 flex items-center justify-center bg-apple-gray/50 dark:bg-white/5 rounded-2xl hover:scale-105 transition-all text-apple-text-muted hover:text-apple-blue cursor-pointer" 
              title="Search (1-Tap)"
            >
              <Search className="w-5 h-5" />
            </button>
            
            {/* Theme Toggle in Admin Header */}
            <div 
              className="flex items-center p-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 shrink-0"
              role="radiogroup"
              aria-label="Theme selection"
            >
              <button
                type="button"
                onClick={() => setThemeMode("light")}
                className={cn(
                  "p-1.5 rounded-full transition-all cursor-pointer focus-ring-pakizzle",
                  themeMode === "light" 
                    ? "bg-white text-apple-text shadow-xs" 
                    : "text-apple-text-muted hover:text-apple-text"
                )}
                title="Light Theme"
                aria-label="Light Theme"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setThemeMode("dark")}
                className={cn(
                  "p-1.5 rounded-full transition-all cursor-pointer focus-ring-pakizzle",
                  themeMode === "dark" 
                    ? "bg-white/20 text-white shadow-xs" 
                    : "text-apple-text-muted hover:text-apple-text"
                )}
                title="Dark Theme"
                aria-label="Dark Theme"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setThemeMode("system")}
                className={cn(
                  "p-1.5 rounded-full transition-all cursor-pointer focus-ring-pakizzle",
                  themeMode === "system" 
                    ? "bg-white dark:bg-white/20 text-apple-text shadow-xs" 
                    : "text-apple-text-muted hover:text-apple-text"
                )}
                title="System Theme"
                aria-label="System Theme"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button className="relative w-11 h-11 flex items-center justify-center bg-apple-gray/50 dark:bg-white/5 rounded-2xl hover:scale-105 transition-all group overflow-hidden">
                <Bell className="w-5 h-5 text-apple-text-muted group-hover:text-apple-text transition-colors duration-500" />
                <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-apple-red rounded-full border-2 border-white dark:border-[#000000]" />
              </button>
            </div>

            <div className="h-8 w-px bg-apple-border/50 mx-2" />

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold leading-none mb-1">{profile?.displayName}</div>
                <div className="flex items-center justify-end gap-1.5">
                  <div className="text-[10px] text-apple-text-muted font-bold uppercase tracking-wider">{profile?.role || "Administrator"}</div>
                  {profile?.isVerified && <CheckCircle2 className="w-3 h-3 text-apple-blue" />}
                </div>
              </div>
              <Link to="/settings" className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-apple-blue to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-700" />
                <Avatar className="h-11 w-11 border-2 border-white dark:border-black shadow-apple-card relative transition-transform duration-500 group-hover:scale-105">
                  <AvatarImage src={profile?.photoURL} />
                  <AvatarFallback className="bg-apple-gray text-[13px] font-bold">{profile?.displayName?.[0]}</AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className={cn(
            "mx-auto min-h-full flex flex-col",
            location.pathname === '/admin/chats'
              ? "p-2 md:p-3 lg:p-4 max-w-full" 
              : "p-8 md:p-12 lg:p-16 max-w-[1600px]"
          )}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1"
            >
              {children}
            </motion.div>
            
            {/* Footer Watermark */}
            {location.pathname !== '/admin/chats' && (
              <footer className="mt-20 pt-8 border-t border-apple-border/20 flex items-center justify-between opacity-30 select-none pointer-events-none">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Pakizzle Real Estate Portal</span>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-right">
                  Authorized: {profile?.displayName?.toUpperCase()}
                </div>
              </footer>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-[320px] bg-white dark:bg-[#1D1D1F] z-[110] lg:hidden flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="p-8 flex items-center justify-between border-b border-apple-border/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-apple-blue rounded-[12px] flex items-center justify-center shadow-lg shadow-apple-blue/20">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold tracking-tight">Pakizzle</span>
                </div>
                <Button variant="ghost" size="icon" className="rounded-2xl w-12 h-12" onClick={() => setIsMobileMenuOpen(false)}>
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              </div>

              <ScrollArea className="flex-1 px-4 min-h-0 custom-scrollbar">
                <nav className="space-y-8 py-6">
                  {['Console', 'Inventory', 'Community', 'Services', 'Operations'].map((category) => (
                    <div key={category} className="space-y-3">
                      <h2 className="text-[11px] font-bold text-apple-text-muted/60 uppercase tracking-widest px-4">
                        {category === 'Console' ? 'Dashboard & Terminal' :
                         category === 'Inventory' ? 'Inventory & Data' :
                         category === 'Community' ? 'Users & Partners' :
                         category === 'Services' ? 'Integrations & CRM' : 'Operations & Settings'}
                      </h2>
                      <div className="space-y-1">
                        {updatedNavItems.filter(s => s.category === category).map((item) => {
                          const isActive = location.pathname === item.path;
                          return (
                            <Link
                              key={item.id}
                              to={item.path}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                                isActive 
                                  ? "bg-apple-blue text-white shadow-lg" 
                                  : "hover:bg-apple-gray dark:hover:bg-white/5 text-apple-text-muted hover:text-apple-text"
                              )}
                            >
                              <item.icon className="w-5 h-5 shrink-0" />
                              <span className="font-semibold text-sm">{item.label}</span>
                              {item.badge && (
                                <span className={cn(
                                  "ml-auto px-2 py-0.5 rounded-full text-[10px] font-semibold animate-pulse",
                                  isActive ? "bg-white text-apple-blue" : "bg-apple-blue text-white"
                                )}>
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>
              </ScrollArea>

              <div className="p-3 border-t border-apple-border/50 bg-apple-gray/20 dark:bg-black/20">
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-start gap-3 h-10 rounded-xl text-apple-red hover:bg-apple-red/10 active:bg-apple-red/20 transition-all px-4"
                  onClick={logout}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-bold text-sm tracking-tight">Sign Out</span>
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Global 1-Tap Search Modal */}
      <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />
    </div>
  );
}
