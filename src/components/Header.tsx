import { motion, AnimatePresence } from "motion/react";
import { Search, User, Menu, Car, Plus, Heart, LogOut, LayoutDashboard, ShieldCheck, MessageSquare, CheckCircle2, MoreHorizontal, Settings, MapPin, ChevronDown, Sun, Moon, Bell, Sparkles, Video, Home } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { useLocation } from "../context/LocationContext";
import { useTheme } from "../context/ThemeContext";
import { useNotifications } from "../context/NotificationContext";
import NotificationCenter from "./NotificationCenter";
import LocationModal from "./LocationModal";
import SearchModal from "./SearchModal";

import AuthModal from "./AuthModal";
import PakizzleLogo from "./PakizzleLogo";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMessagesDropdown, setShowMessagesDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const { wishlist } = useWishlist();
  const { user, profile, logout, isAdmin } = useAuth();
  const { conversations, setActiveConversationId } = useChat();
  const { unreadCount: notificationCount } = useNotifications();
  const { location } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Global Cmd+K / Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (user && profile?.isPendingOnboarding) {
      setShowAuthModal(true);
    }
  }, [user, profile]);

  const displayLocation = location ? (() => {
    let locStr = "";
    if (location.area) {
      if (location.area.toLowerCase().startsWith("all over")) {
        locStr = location.city;
      } else {
        locStr = `${location.area.replace(new RegExp(`\\s*${location.city}$`, 'i'), '')}, ${location.city}`;
      }
    } else {
      locStr = location.city;
    }
    return locStr.length > 12 ? locStr.substring(0, 12) + '...' : locStr;
  })() : 'Select Location';
  const menuRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const totalUnreadCount = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target as Node)) {
        setShowMessagesDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotificationsDropdown(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navItems = ["Marketplace", "Pricing", "Insurance", "Financing", "Services"];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isScrolled 
          ? "top-2 lg:top-4 w-[calc(100%-1.5rem)] max-w-6xl h-14 lg:h-16 rounded-full px-4 lg:px-8 liquid-glass-foreground shadow-2xl" 
          : "top-2 w-[calc(100%-1.5rem)] max-w-7xl h-16 lg:h-18 rounded-full px-5 lg:px-10 liquid-glass-mid shadow-lg"
      )}
    >
      <div className="h-full flex items-center justify-between">
        <div className="flex items-center gap-2 lg:gap-8">
          <Link to="/" className="flex items-center gap-2 group shrink-0" title="Pakizzle Home">
            <PakizzleLogo variant="auto" size="md" />
          </Link>

          <button 
            onClick={() => setShowLocationModal(true)}
            className="group flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-500"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#5B2A86]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#5B2A86] dark:text-[#FAF3E6] stroke-[2.2]" />
            </div>
            <span className="text-[13px] sm:text-sm font-semibold text-apple-text group-hover:text-[#5B2A86] transition-colors">
              {displayLocation}
            </span>
            <ChevronDown className="w-3 h-3 text-apple-text-muted/50 group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Main Navigation or Sticky Search */}
          {isScrolled ? (
            <button 
              onClick={() => setShowSearchModal(true)}
              className="hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 dark:bg-[#1E1E20]/90 border border-[var(--brand-purple-light)]/20 dark:border-white/10 text-xs text-apple-text-muted hover:text-apple-text cursor-pointer transition-all hover:border-[#5B2A86] shadow-sm group"
            >
              <Search className="w-3.5 h-3.5 text-[#5B2A86] dark:text-[#F0A830] group-hover:scale-110 transition-transform" />
              <span className="font-medium">Search DHA, Clifton, Sector F-7...</span>
              <kbd className="hidden sm:inline-block ml-1 text-[10px] bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 px-1.5 py-0.5 rounded font-bold text-slate-500 dark:text-slate-300 shadow-xs">
                ⌘K
              </kbd>
            </button>
          ) : (
            <nav className="hidden lg:flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-full border border-black/5 dark:border-white/10">
              <Link
                to="/marketplace?purpose=buy"
                className="px-3.5 py-1.5 text-xs font-semibold text-apple-text hover:text-[#5B2A86] dark:hover:text-[#F0A830] hover:bg-white dark:hover:bg-white/10 rounded-full transition-all"
              >
                Buy
              </Link>
              <Link
                to="/marketplace?purpose=rent"
                className="px-3.5 py-1.5 text-xs font-semibold text-apple-text hover:text-[#5B2A86] dark:hover:text-[#F0A830] hover:bg-white dark:hover:bg-white/10 rounded-full transition-all"
              >
                Rent
              </Link>
              <Link
                to="/marketplace?make=Plot"
                className="px-3.5 py-1.5 text-xs font-semibold text-apple-text hover:text-[#5B2A86] dark:hover:text-[#F0A830] hover:bg-white dark:hover:bg-white/10 rounded-full transition-all"
              >
                Plots
              </Link>
              <Link
                to="/marketplace?make=Commercial"
                className="px-3.5 py-1.5 text-xs font-semibold text-apple-text hover:text-[#5B2A86] dark:hover:text-[#F0A830] hover:bg-white dark:hover:bg-white/10 rounded-full transition-all"
              >
                Commercial
              </Link>
              <Link
                to="/auction-verification"
                className="px-3.5 py-1.5 text-xs font-semibold text-[#5B2A86] dark:text-[#F0A830] hover:bg-white dark:hover:bg-white/10 rounded-full transition-all flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#5FA84C]" />
                <span>Verification</span>
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-1 lg:gap-2">
          {/* Spotlight Search Trigger Button */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="p-2.5 hover:bg-apple-card-bg rounded-full transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group flex flex-col items-center text-apple-text-muted hover:text-apple-blue cursor-pointer"
            title="Search Properties (⌘K)"
          >
            <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold mt-0.5 hidden lg:block">Search</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 hover:bg-apple-card-bg rounded-full transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group flex flex-col items-center text-apple-text-muted hover:text-apple-text"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
            <span className="text-[10px] font-bold mt-0.5 hidden lg:block">Theme</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative hidden lg:block" ref={notificationsRef}>
            <button 
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className={cn(
                "relative p-2.5 rounded-full transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group flex flex-col items-center",
                showNotificationsDropdown ? "bg-apple-blue/10 text-apple-blue" : "hover:bg-apple-card-bg text-apple-text-muted hover:text-apple-text"
              )}
            >
              <Bell className="w-5 h-5 shadow-sm" />
              <span className="text-[10px] font-semibold mt-0.5 tracking-tight">Alerts</span>
              {notificationCount > 0 && (
                <span className="absolute top-1 right-2 w-4 h-4 bg-apple-red text-white text-[10px] font-semibold flex items-center justify-center rounded-full border-2 border-apple-card-bg shadow-lg animate-pulse">
                  {notificationCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotificationsDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.9, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: 15, scale: 0.9, filter: 'blur(10px)' }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  className="absolute right-0 mt-3 w-[420px] bg-white/80 dark:bg-black/80 backdrop-blur-[40px] rounded-[32px] shadow-[0_40px_100px_rgba(0,0,0,0.15)] border border-white/20 dark:border-white/5 overflow-hidden z-[70]"
                >
                  <NotificationCenter onClose={() => setShowNotificationsDropdown(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Messages Dropdown - Hidden on mobile as it's in bottom nav */}
          <div className="relative hidden lg:block" ref={messagesRef}>
            <button 
              onClick={() => setShowMessagesDropdown(!showMessagesDropdown)}
              className={cn(
                "relative p-2.5 rounded-full transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group flex flex-col items-center",
                showMessagesDropdown ? "bg-apple-blue/10 text-apple-blue" : "hover:bg-apple-card-bg text-apple-text-muted hover:text-apple-text"
              )}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-0.5">Chats</span>
              {totalUnreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-apple-blue text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-apple-card-bg">
                  {totalUnreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showMessagesDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-[360px] bg-apple-card-bg backdrop-blur-xl rounded-[24px] shadow-apple-card border border-apple-border overflow-hidden z-[60]"
                >
                  <div className="p-4 border-b border-apple-border flex items-center justify-between">
                    <h3 className="font-semibold text-lg text-apple-text">Messages</h3>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {conversations.length > 0 ? (
                      conversations.slice(0, 5).map((conv) => {
                        const otherParticipant = conv.participants.find(p => p.uid !== user?.uid) || conv.participants[0];
                        return (
                          <button
                            key={conv.id}
                            onClick={() => {
                              setActiveConversationId(conv.id);
                              setShowMessagesDropdown(false);
                              navigate('/chat');
                            }}
                            className={cn(
                              "w-full p-4 flex gap-3 transition-colors border-b border-apple-border/50 last:border-0 text-left group",
                              conv.isBlocked ? "bg-apple-red/5 hover:bg-apple-red/10" : "hover:bg-apple-gray/50"
                            )}
                          >
                            <div className="relative shrink-0">
                              {otherParticipant.photoURL ? (
                                <img 
                                  src={otherParticipant.photoURL} 
                                  alt={otherParticipant.name}
                                  className={cn(
                                    "w-12 h-12 rounded-full object-cover shadow-sm",
                                    conv.isBlocked && "grayscale-[0.5] opacity-80"
                                  )}
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold flex items-center justify-center text-sm">
                                  {otherParticipant.name?.[0] || 'U'}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-0.5">
                                <h4 className={cn(
                                  "font-semibold text-sm truncate pr-2",
                                  conv.isBlocked ? "text-apple-red" : "text-apple-text"
                                )}>
                                  {conv.vehicleName}
                                  {conv.isBlocked && <span className="ml-2 text-[10px] opacity-60">(Blocked)</span>}
                                </h4>
                              </div>
                              <div className="flex items-center gap-1 mb-1">
                                <span className={cn(
                                  "text-xs font-bold truncate",
                                  conv.isBlocked ? "text-apple-red/80" : "text-apple-text"
                                )}>
                                  {otherParticipant.name}
                                </span>
                                {otherParticipant.isVerified && (
                                  <CheckCircle2 className="w-3 h-3 text-apple-blue fill-apple-blue" />
                                )}
                                <span className="text-xs text-apple-text-muted">:</span>
                                <span className="text-xs text-apple-text-muted truncate ml-1">
                                  {conv.isBlocked ? "User is blocked" : (conv.lastMessage?.text || 'No messages yet')}
                                </span>
                              </div>
                              <div className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest">
                                {conv.lastMessage ? new Date(conv.lastMessage.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                              </div>
                            </div>
                            {conv.lastMessage?.metadata?.listingImage && (
                              <div className="w-14 h-14 rounded-xl overflow-hidden border border-apple-border shrink-0 shadow-sm">
                                <img 
                                  src={conv.lastMessage.metadata.listingImage} 
                                  alt="" 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center">
                        <MessageSquare className="w-10 h-10 text-apple-gray mx-auto mb-3" />
                        <p className="text-sm text-apple-text-muted font-bold">No messages yet</p>
                      </div>
                    )}
                  </div>

                  <Link 
                    to="/chat"
                    onClick={() => setShowMessagesDropdown(false)}
                    className="block w-full py-4 text-center text-apple-red font-bold text-sm hover:bg-apple-card-bg transition-colors border-t border-apple-border"
                  >
                    View All Messages
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/wishlist" className="relative p-2.5 hover:bg-apple-card-bg rounded-full transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group flex flex-col items-center hidden lg:flex">
            <Heart className="w-5 h-5 text-apple-text-muted group-hover:text-apple-text" />
            <span className="text-[10px] font-bold mt-0.5 text-apple-text-muted group-hover:text-apple-text">Wishlist</span>
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-apple-red text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-apple-card-bg">
                {wishlist.length}
              </span>
            )}
          </Link>
          
          <div className="h-6 w-[1px] bg-apple-border/50 mx-2 hidden lg:block" />

          {user ? (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-1 hover:bg-apple-card-bg rounded-full transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] bg-apple-card-bg/20"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-apple-gray shadow-inner border border-apple-border/50">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-apple-text-muted bg-apple-blue/10 text-apple-blue text-xs">
                      {user.displayName?.[0] || 'U'}
                    </div>
                  )}
                </div>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-lg shadow-[0_20px_25px_-5px_rgba(0,0,0,0.15)] border border-slate-200 dark:border-slate-800 py-2 overflow-hidden z-[100]"
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <div className="font-semibold text-sm truncate text-slate-900 dark:text-slate-100">{profile?.displayName || user.displayName}</div>
                      <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider truncate mb-0.5">@{profile?.username || (profile?.displayName || user.displayName || 'user').toLowerCase().replace(/\s+/g, '_')}</div>
                      <div className="text-xs text-slate-500 truncate">{user.email || user.phoneNumber}</div>
                    </div>
                    <Link 
                      to={`/profile/${user.uid}`} 
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      My Profile
                    </Link>
                    <Link 
                      to="/dashboard/ads" 
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Home className="w-4 h-4 text-slate-400" />
                      My Properties
                    </Link>
                    <Link 
                      to="/dashboard/reels" 
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Video className="w-4 h-4 text-slate-400" />
                      Property Reels
                    </Link>
                    <Link 
                      to="/dashboard" 
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      Dashboard
                    </Link>
                    {isAdmin ? (
                      <Link 
                        to="/admin" 
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-[#0F766E] hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
                        Admin Panel
                      </Link>
                    ) : (
                      <Link 
                        to="/admin/login" 
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        Admin Portal
                      </Link>
                    )}
                    <Link 
                      to="/settings" 
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      Settings
                    </Link>
                    <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1" />
                    <button 
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button 
              onClick={() => setShowAuthModal(true)}
              className="hidden lg:flex items-center gap-1.5 h-10 px-4 text-xs font-bold rounded-full pakizzle-button-primary"
            >
              <User className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}

          {/* Post Property CTA with signature purple gradient */}
          <Link
            to="/post-ad"
            className="hidden sm:inline-flex items-center gap-1.5 h-10 px-5 text-xs font-bold rounded-full pakizzle-button-primary"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>List a Property</span>
          </Link>
        </div>
      </div>

      <LocationModal isOpen={showLocationModal} onClose={() => setShowLocationModal(false)} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />
    </motion.header>
  );
}
