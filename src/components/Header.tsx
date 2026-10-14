import { motion, AnimatePresence } from "motion/react";
import { Search, User, Menu, Car, Plus, Heart, LogOut, LayoutDashboard, ShieldCheck, MessageSquare, CheckCircle2, MoreHorizontal, Settings, MapPin, ChevronDown, Sun, Moon, Monitor, Bell, Sparkles, Video, Home } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation as useRouterLocation } from "react-router-dom";
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
  const routerLocation = useRouterLocation();
  const isMessagesActive = routerLocation.pathname === '/chat' || routerLocation.pathname === '/messages' || routerLocation.pathname.startsWith('/dashboard/messages');
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
  const { themeMode, setThemeMode, theme } = useTheme();
  const navigate = useNavigate();

  // Global Cmd+K / Ctrl+K shortcut listener and one-tap custom search listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
    };
    const handleOpenSearch = () => {
      setShowSearchModal(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pakizzle:open-search", handleOpenSearch);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pakizzle:open-search", handleOpenSearch);
    };
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
        <div className="flex items-center shrink-0">
          <Link to="/" className="flex items-center gap-2 group shrink-0 focus-ring-pakizzle rounded-full" title="Pakizzle Home">
            <PakizzleLogo variant="auto" size="md" />
          </Link>
        </div>

        <div className="flex items-center justify-center shrink-0">
          {/* Main Navigation or Sticky Search */}
          {isScrolled ? (
            <button 
              onClick={() => setShowSearchModal(true)}
              className="hidden lg:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-apple-surface/90 border border-apple-border text-xs text-apple-text-muted hover:text-apple-text cursor-pointer transition-all hover:border-apple-blue shadow-xs group focus-ring-pakizzle"
            >
              <Search className="w-3.5 h-3.5 text-apple-blue group-hover:scale-110 transition-transform" />
              <span className="font-medium">Search DHA, Clifton, Sector F-7...</span>
              <kbd className="hidden sm:inline-block ml-1 text-[10px] bg-apple-gray border border-apple-border px-1.5 py-0.5 rounded font-bold text-apple-text-muted shadow-xs">
                ⌘K
              </kbd>
            </button>
          ) : (
            <nav 
              aria-label="Main Navigation"
              className="hidden lg:flex items-center gap-0.5 xl:gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-full border border-black/5 dark:border-white/10 shrink-0"
            >
              <Link
                to="/marketplace?purpose=buy"
                className="px-2.5 xl:px-3 py-1.5 text-xs font-semibold text-apple-text hover:text-apple-blue hover:bg-apple-surface rounded-full transition-all focus-ring-pakizzle"
              >
                Buy
              </Link>
              <Link
                to="/marketplace?purpose=rent"
                className="px-2.5 xl:px-3 py-1.5 text-xs font-semibold text-apple-text hover:text-apple-blue hover:bg-apple-surface rounded-full transition-all focus-ring-pakizzle"
              >
                Rent
              </Link>
              <Link
                to="/marketplace?propertyType=Plot"
                className="px-2.5 xl:px-3 py-1.5 text-xs font-semibold text-apple-text hover:text-apple-blue hover:bg-apple-surface rounded-full transition-all focus-ring-pakizzle"
              >
                Plots
              </Link>
              <Link
                to="/marketplace?propertyType=Commercial"
                className="px-2.5 xl:px-3 py-1.5 text-xs font-semibold text-apple-text hover:text-apple-blue hover:bg-apple-surface rounded-full transition-all focus-ring-pakizzle"
              >
                Commercial
              </Link>
              <Link
                to="/verification"
                className="px-2.5 xl:px-3 py-1.5 text-xs font-semibold text-apple-text hover:text-apple-blue hover:bg-apple-surface rounded-full transition-all flex items-center gap-1 focus-ring-pakizzle"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-apple-green" />
                <span>Verification</span>
              </Link>
              <Link
                to="/stories"
                className="px-2.5 xl:px-3 py-1.5 text-xs font-bold text-white bg-apple-blue hover:opacity-90 rounded-full transition-all flex items-center gap-1.5 shadow-xs focus-ring-pakizzle"
              >
                <Sparkles className="w-3.5 h-3.5 text-white/90" />
                <span>PakStories</span>
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 shrink-0">
          {/* Spotlight Search Trigger Button */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="p-2.5 hover:bg-apple-card-bg rounded-full transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group flex flex-col items-center text-apple-text-muted hover:text-apple-blue cursor-pointer focus-ring-pakizzle"
            title="Search Properties (⌘K)"
          >
            <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold mt-0.5 hidden lg:block">Search</span>
          </button>

          {/* Single Header Theme Control: Light / Dark / System segmented toggle */}
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

          {/* Notifications Dropdown */}
          <div className="relative hidden xl:block" ref={notificationsRef}>
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

          {/* Messages Dropdown - Hidden on mobile and tablet portrait */}
          <div className="relative hidden xl:block" ref={messagesRef}>
            <button 
              onClick={() => setShowMessagesDropdown(!showMessagesDropdown)}
              className={cn(
                "relative p-2.5 rounded-full transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group flex flex-col items-center",
                (showMessagesDropdown || isMessagesActive) 
                  ? "bg-apple-blue/15 text-apple-blue" 
                  : "hover:bg-apple-card-bg text-apple-text-muted hover:text-apple-text"
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
                                <div className="w-12 h-12 rounded-full bg-apple-blue/10 text-apple-blue font-bold flex items-center justify-center text-sm">
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
                    className="absolute right-0 mt-3 w-64 bg-apple-surface rounded-2xl shadow-apple-card border border-apple-border py-2 overflow-hidden z-[100]"
                  >
                    <div className="px-4 py-2.5 border-b border-apple-border/50 mb-1">
                      <div className="font-semibold text-sm truncate text-apple-text">{profile?.displayName || user.displayName}</div>
                      <div className="text-[10px] font-medium text-apple-text-muted uppercase tracking-wider truncate mb-0.5">@{profile?.username || (profile?.displayName || user.displayName || 'user').toLowerCase().replace(/\s+/g, '_')}</div>
                      <div className="text-xs text-apple-text-muted truncate">{user.email || user.phoneNumber}</div>
                    </div>
                    <Link 
                      to={`/profile/${user.uid}`} 
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-apple-text hover:bg-apple-gray transition-colors"
                    >
                      <User className="w-4 h-4 text-apple-text-muted" />
                      My Profile
                    </Link>
                    <Link 
                      to="/dashboard/ads" 
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-apple-text hover:bg-apple-gray transition-colors"
                    >
                      <Home className="w-4 h-4 text-apple-text-muted" />
                      My Properties
                    </Link>
                    <Link 
                      to="/dashboard/reels" 
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-apple-text hover:bg-apple-gray transition-colors"
                    >
                      <Video className="w-4 h-4 text-apple-text-muted" />
                      Property Reels
                    </Link>
                    <Link 
                      to="/dashboard" 
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-apple-text hover:bg-apple-gray transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-apple-text-muted" />
                      Dashboard
                    </Link>
                    {isAdmin ? (
                      <Link 
                        to="/admin" 
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-apple-blue hover:bg-apple-blue/10 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-apple-blue" />
                        Admin Panel
                      </Link>
                    ) : (
                      <Link 
                        to="/admin/login" 
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-apple-text hover:bg-apple-gray transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-apple-text-muted" />
                        Admin Portal
                      </Link>
                    )}
                    <Link 
                      to="/settings" 
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-apple-text hover:bg-apple-gray transition-colors"
                    >
                      <Settings className="w-4 h-4 text-apple-text-muted" />
                      Settings
                    </Link>
                    <div className="h-[1px] bg-apple-border/50 my-1" />
                    <button 
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-apple-red hover:bg-apple-red/10 transition-colors text-left"
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
