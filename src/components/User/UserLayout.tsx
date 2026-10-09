import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  Car, 
  MessageSquare, 
  Heart, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  Bell,
  Search,
  Activity,
  History,
  CreditCard,
  Plus,
  HelpCircle,
  Gem,
  CheckCircle2,
  Lock,
  Video,
  BarChart3
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useChat } from "../../context/ChatContext";
import SearchModal from "../SearchModal";

interface UserLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  badge?: number | string;
  category: 'Console' | 'Portfolio' | 'Services' | 'System';
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/dashboard', category: 'Console' },
  { id: 'seller', label: 'Seller Console', icon: BarChart3, path: '/dashboard/seller', category: 'Console' },
  { id: 'verification', label: 'Identity Verification', icon: ShieldCheck, path: '/dashboard/verification', category: 'Console' },
  { id: 'analytics', label: 'Performance', icon: Activity, path: '/dashboard/analytics', category: 'Console' },
  { id: 'credits', label: 'Credits & Upgrades', icon: Gem, path: '/dashboard/credits', category: 'Console' },

  { id: 'ads', label: 'My Ads', icon: Car, path: '/dashboard/ads', category: 'Portfolio' },
  { id: 'reels', label: 'My Reels', icon: Video, path: '/dashboard/reels', category: 'Portfolio' },
  { id: 'wishlist', label: 'My Wishlist', icon: Heart, path: '/dashboard/wishlist', category: 'Portfolio' },
  { id: 'watchers', label: 'Search Watchers', icon: Search, path: '/dashboard/watchers', category: 'Portfolio' },

  { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/dashboard/messages', category: 'Services' },
  { id: 'inspections', label: 'Inspections', icon: History, path: '/dashboard/inspections', category: 'Services' },
  { id: 'insurance', label: 'Insurance', icon: ShieldCheck, path: '/dashboard/insurance', category: 'Services' },
  { id: 'financing', label: 'Financing', icon: CreditCard, path: '/dashboard/financing', category: 'Services' },

  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', category: 'System' },
  { id: 'help', label: 'Support', icon: HelpCircle, path: '/dashboard/help', category: 'System' },
];

export default function UserLayout({ children }: UserLayoutProps) {
  const { profile, logout, user } = useAuth();
  const { conversations } = useChat();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Global 1-Tap Search & Cmd+K listeners for Dashboard
  React.useEffect(() => {
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

  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const updatedNavItems = navItems.map(item => {
    if (item.id === 'messages' && unreadMessagesCount > 0) {
      return { ...item, badge: unreadMessagesCount };
    }
    return item;
  });

  const activeItem = updatedNavItems.find(item => item.path === location.pathname) || updatedNavItems[0];

  return (
    <div className="h-screen w-screen bg-apple-bg dark:bg-black text-apple-text flex font-sans selection:bg-apple-blue/20 overflow-hidden">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 96 : 300 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className={cn(
          "hidden lg:flex flex-col bg-white/70 dark:bg-[#1D1D1F]/70 backdrop-blur-3xl border-r border-apple-border/50 h-full z-50 shrink-0",
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
                  <Car className="w-6 h-6 text-white" />
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
            <p className="text-[11px] font-bold uppercase tracking-wider text-apple-text-muted/60">Personal Terminal</p>
          </div>
        )}

        <ScrollArea className="flex-1 px-4 min-h-0 custom-scrollbar">
          <nav className="space-y-8 py-2">
            {['Console', 'Portfolio', 'Services', 'System'].map((category) => (
              <div key={category} className="space-y-3">
                {!isSidebarCollapsed && (
                  <h2 className="text-[11px] font-bold text-apple-text-muted/60 uppercase tracking-widest px-4">
                    {category === 'Console' ? 'Dashboard & Terminal' :
                     category === 'Portfolio' ? 'My Assets' :
                     category === 'Services' ? 'Integrations' : 'Preferences'}
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
               {/* Breadcrumbs or active section indicator */}
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
                placeholder="Search properties, areas, IDs... (⌘K)"
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
            
            <div className="flex items-center gap-2">
              <button className="relative w-11 h-11 flex items-center justify-center bg-apple-gray/50 dark:bg-white/5 rounded-2xl hover:scale-105 transition-all group overflow-hidden">
                <Bell className="w-5 h-5 text-apple-text-muted group-hover:text-apple-text transition-colors duration-500" />
                <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-apple-red rounded-full border-2 border-white dark:border-[#000000]" />
              </button>
              
              <Link to="/sell" className="hidden lg:flex items-center gap-2 px-5 py-3 bg-apple-blue/10 hover:bg-apple-blue text-apple-blue hover:text-white rounded-2xl font-bold text-[13px] transition-all duration-500 group shadow-lg shadow-apple-blue/5">
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
                List Vehicle
              </Link>
            </div>

            <div className="h-8 w-px bg-apple-border/50 mx-2" />

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold leading-none mb-1">{profile?.displayName}</div>
                <div className="flex items-center justify-end gap-1.5">
                  <div className="text-[10px] text-apple-text-muted font-bold uppercase tracking-wider">Member</div>
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
            location.pathname === '/dashboard/messages'
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
            {location.pathname !== '/dashboard/messages' && (
              <footer className="mt-20 pt-8 border-t border-apple-border/20 flex items-center justify-between opacity-30 select-none pointer-events-none">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Neural Terminal V2.4.0</span>
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
              <div className="p-8 flex items-center justify-between border-b border-apple-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-apple-blue rounded-[12px] flex items-center justify-center shadow-lg shadow-apple-blue/20">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold tracking-tight">Pakizzle</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-2xl w-12 h-12"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              </div>
              
              <ScrollArea className="flex-1 px-4 min-h-0">
                <nav className="space-y-6 py-8">
                  {['Console', 'Portfolio', 'Services', 'System'].map((category) => (
                    <div key={category} className="space-y-3">
                      <h2 className="text-xs font-bold text-apple-text-muted/60 uppercase tracking-widest px-4">
                        {category === 'Console' ? 'Dashboard & Terminal' :
                         category === 'Portfolio' ? 'My Assets' :
                         category === 'Services' ? 'Integrations' : 'Preferences'}
                      </h2>
                      <div className="bg-apple-gray/10 dark:bg-white/5 rounded-3xl overflow-hidden border border-apple-border/20">
                        {updatedNavItems.filter(s => s.category === category).map((item, idx, arr) => (
                          <Link
                            key={item.id}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                              "w-full flex items-center gap-4 p-4 transition-all duration-300",
                              location.pathname === item.path
                                ? "bg-apple-blue text-white shadow-xl shadow-apple-blue/20"
                                : "text-apple-text-muted hover:bg-apple-gray dark:hover:bg-white/5 active:bg-apple-gray",
                              idx !== arr.length - 1 && "border-b border-apple-border/10"
                            )}
                          >
                            <item.icon className="w-5 h-5 shrink-0" />
                            <span className="font-bold text-[15px] tracking-tight">{item.label}</span>
                            {item.badge && (
                              <span className={cn(
                                "ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold",
                                location.pathname === item.path ? "bg-white text-apple-blue" : "bg-apple-blue text-white"
                              )}>
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        ))}
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
