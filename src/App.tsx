import ScrollToTop from "./components/ScrollToTop";
// Deployment Trigger: 2026-04-29-18-05
import { SkipToContentLink, RouteProgressBar, PageTransition } from "./components/RouteTransitionCoordinator";
import { WishlistToast, AddToListModal } from "./components/WishlistNotifications";
import LocationSlider from "./components/LocationSlider";
import { useProperties } from "./context/PropertyContext";
import { useAuth } from "./context/AuthContext";
import { useChat } from "./context/ChatContext";
import { useLocation as useAppLocation } from "./context/LocationContext";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Loader2, Car, Check, Settings, Lock, Sparkles, ShieldCheck, Home, Building2 } from "lucide-react";
import React, { useState, lazy, Suspense } from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { formatPrice } from "./lib/utils";
import { Toaster } from "sonner";
import { useTheme } from "./context/ThemeContext";

import Header from "./components/Header";
import MobileNav from "./components/MobileNav";
import Hero from "./components/Hero";
import BrowseByCity from "./components/BrowseByCity";
import SocialProofSection from "./components/SocialProofSection";
import CategoryShowcase from "./components/CategoryShowcase";
import PopularPropertyStyles from "./components/PopularPropertyStyles";
import ZameenAdvantageSection from "./components/ZameenAdvantageSection";
import { CardGridSkeleton } from "./components/ui/LoadingSkeleton";
import HomeCTA from "./components/HomeCTA";
import PropertyCard, { VehicleCard } from "./components/PropertyCard";
import FeaturedNews from "./components/FeaturedNews";
import RecentlyViewed from "./components/RecentlyViewed";
const ValuationModal = lazy(() => import("./components/ValuationModal"));
const PropertyDetails = lazy(() => import("./components/PropertyDetails"));
const SellerDashboard = lazy(() => import("./components/SellerDashboard"));
const Marketplace = lazy(() => import("./components/Marketplace"));
const Wishlist = lazy(() => import("./components/Wishlist"));
const SellPropertyForm = lazy(() => import("./components/SellPropertyForm"));
const ListingWizard = lazy(() => import("./components/ListingWizard"));
const UserProfile = lazy(() => import("./components/UserProfile"));
const ProfileSettings = lazy(() => import("./components/ProfileSettings"));
const OtpVerification = lazy(() => import("./components/OtpVerification"));
const CloneAnalysis = lazy(() => import("./components/CloneAnalysis"));
const CityPortal = lazy(() => import("./components/CityPortal"));

// User Dashboard Components
const UserLayout = lazy(() => import('./components/User/UserLayout'));
const UserOverview = lazy(() => import('./components/User/UserOverview'));
const UserAds = lazy(() => import('./components/User/UserAds'));
const UserMessages = lazy(() => import('./components/User/UserMessages'));
const UserWatchers = lazy(() => import('./components/User/UserWatchers'));
const UserWishlist = lazy(() => import('./components/User/UserWishlist'));
const UserCredits = lazy(() => import('./components/User/UserCredits'));
const UserAnalytics = lazy(() => import('./components/User/UserAnalytics'));
const UserReels = lazy(() => import('./components/User/UserReels'));
const UserInspections = lazy(() => import('./components/UserInspections'));
const UserInsurance = lazy(() => import('./components/UserInsurance'));
const UserFinancing = lazy(() => import('./components/UserFinancing'));
const ForgotPasswordPage = lazy(() => import('./components/Auth/ForgotPasswordPage'));

const DashboardPlaceholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center">
    <div className="w-20 h-20 bg-apple-blue/10 rounded-3xl flex items-center justify-center mb-6">
      <Settings className="w-10 h-10 text-apple-blue animate-spin-slow" />
    </div>
    <h2 className="text-3xl font-bold tracking-tight mb-2">{title} Module Deployed</h2>
    <p className="text-apple-text-muted font-medium max-w-md">Neural integration in progress. This specific management terminal is being optimized for your portfolio.</p>
  </div>
);

const ProfileRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] dark:bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-apple-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (user?.uid) {
    return <Navigate to={`/profile/${user.uid}`} replace />;
  }
  
  return <Navigate to="/" replace />;
};

const AuctionVerification = lazy(() => import("./components/AuctionVerification"));
const VerificationPage = lazy(() => import("./components/VerificationPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const SignInPage = lazy(() => import("./pages/SignInPage"));
const UploadIdentityForm = lazy(() => import("./components/UploadIdentityForm"));
const UploadBusinessForm = lazy(() => import("./components/UploadBusinessForm"));
const InsuranceLanding = lazy(() => import("./components/InsuranceLanding"));
const CarInsurancePage = lazy(() => import("./components/CarInsurancePage"));
const InsuranceBookingFlow = lazy(() => import("./components/InsuranceBookingFlow"));
const InsuranceQuoteFlow = lazy(() => import("./components/InsuranceQuoteFlow"));
const InspectionLanding = lazy(() => import("./components/InspectionLanding"));
const InspectionBookingFlow = lazy(() => import("./components/InspectionBookingFlow"));
const FinancingLanding = lazy(() => import("./components/FinancingLanding"));
const FinancingBookingFlow = lazy(() => import("./components/FinancingBookingFlow"));
import Footer from "./components/Footer";
const Pricing = lazy(() => import("./components/Pricing"));
import AuthModal from "./components/AuthModal";

// Chat Container still lazy as it's separate
const ChatContainer = lazy(() => import("./components/Chat/ChatContainer"));

// Admin Components
const AdminLayout = lazy(() => import('./components/Admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));
const ApprovalCenter = lazy(() => import('./components/Admin/ApprovalCenter'));
const AuditLog = lazy(() => import('./components/Admin/AuditLog'));
const UserManagement = lazy(() => import('./components/Admin/UserManagement'));
const ListingManagement = lazy(() => import('./components/Admin/ListingManagement'));
const CategoryManagement = lazy(() => import('./components/Admin/Categories/CategoryManagement'));
const CustomFieldManagement = lazy(() => import('./components/Admin/CustomFields/CustomFieldManagement'));
const DealerManagement = lazy(() => import('./components/Admin/DealerManagement'));
const CompanyManagement = lazy(() => import('./components/Admin/CompanyManagement'));
const AuctionVerificationAdmin = lazy(() => import('./components/Admin/AuctionVerification'));
const Moderation = lazy(() => import('./components/Admin/Moderation'));
const PaymentManagement = lazy(() => import('./components/Admin/PaymentManagement'));
const ReportManagement = lazy(() => import('./components/Admin/ReportManagement'));
const ContentManagement = lazy(() => import('./components/Admin/ContentManagement'));
const BannerManagement = lazy(() => import('./components/Admin/BannerManagement'));
const AdManagement = lazy(() => import('./components/Admin/AdManagement'));
const PopularVehicleStylesManagement = lazy(() => import('./components/Admin/PopularVehicleStylesManagement'));
const AdminSettings = lazy(() => import('./components/Admin/AdminSettings'));
const VehicleDataManagement = lazy(() => import('./components/Admin/VehicleDataManagement'));
const InsuranceManagement = lazy(() => import('./components/Admin/InsuranceManagement'));
const FinancingManagement = lazy(() => import('./components/Admin/FinancingManagement'));
const PricingManagement = lazy(() => import('./components/Admin/PricingManagement'));
const InspectionManagement = lazy(() => import('./components/Admin/InspectionManagement'));
const ReelsFeed = lazy(() => import('./components/Reels/ReelsFeed'));
const ReelsManagement = lazy(() => import('./components/Admin/ReelsManagement'));
const SeoAeoGeoHub = lazy(() => import('./components/Admin/SeoAeoGeoHub'));
const AdminLogin = lazy(() => import('./components/Admin/AdminLogin'));

// Admin Route Guard
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] dark:bg-[#000000]">
      <div className="w-10 h-10 border-4 border-apple-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );
  
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  
  return <>{children}</>;
};

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, isAdmin } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) return null;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-apple-gray dark:bg-black">
        <div className="glass-panel p-12 rounded-[40px] text-center max-w-md mx-auto shadow-apple-hover border border-apple-border/50 backdrop-blur-3xl">
          <div className="w-20 h-20 bg-apple-blue/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Lock className="w-10 h-10 text-apple-blue" />
          </div>
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Access Protocol</h2>
          <p className="text-apple-text-muted mb-10 font-medium leading-relaxed">
            Please authenticate to view this high-security module or manage your elite assets.
          </p>
          <button 
            onClick={() => setShowAuthModal(true)}
            className="apple-button-primary w-full shadow-apple-soft"
          >
            Authenticate Identity
          </button>
          <Link to="/" className="block mt-8 text-xs font-black uppercase tracking-widest text-apple-text-muted hover:text-apple-text transition-colors">
            Exit to Commons
          </Link>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  if (!profile?.isOtpVerified && !isAdmin) {
    return <OtpVerification onVerified={() => window.location.reload()} />;
  }

  return <>{children}</>;
}

export default function App() {
  const [isValuationOpen, setIsValuationOpen] = useState(false);
  const { properties, loading: propertiesLoading, loading: vehiclesLoading } = useProperties();
  const { location: userLocation } = useAppLocation();
  const { loading: authLoading } = useAuth();
  const { notification, activeConversationId } = useChat();
  const { theme } = useTheme();
  const location = useLocation();

  const curatedFeatured = React.useMemo(() => {
    if (!properties || properties.length === 0) return [];
    return [...properties]
      .filter(v => v.status !== 'inactive')
      .sort((a, b) => {
        const aVerified = a.seller?.isVerified || (a.seller?.verified_badge_type && a.seller?.verified_badge_type !== 'none') ? 1 : 0;
        const bVerified = b.seller?.isVerified || (b.seller?.verified_badge_type && b.seller?.verified_badge_type !== 'none') ? 1 : 0;
        if (bVerified !== aVerified) return bVerified - aVerified;
        const aPhotos = a.images?.length || 0;
        const bPhotos = b.images?.length || 0;
        if (bPhotos !== aPhotos) return bPhotos - aPhotos;
        return (b.price || 0) - (a.price || 0);
      })
      .slice(0, 4);
  }, [properties]);

  // Pages that have a back icon and should hide the mobile footer menu
  const hideMobileNav = 
    location.pathname.startsWith('/property/') ||
    location.pathname.startsWith('/vehicle/') || 
    location.pathname.startsWith('/edit/') ||
    location.pathname.startsWith('/profile/') ||
    location.pathname.startsWith('/verification') ||
    location.pathname.startsWith('/insurance/quote') ||
    location.pathname.startsWith('/financing/apply') ||
    location.pathname === '/sell' ||
    location.pathname === '/settings' ||
    (location.pathname === '/chat' && activeConversationId !== null);

  const LoadingScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-apple-bg text-apple-text overflow-hidden">
      <div className="relative">
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
           className="flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[#5B2A86] to-[#1A1526] rounded-2xl shadow-[0_20px_50px_rgba(91,42,134,0.3)] flex items-center justify-center mb-8 border border-[#C9A227]/30">
            <Home className="w-8 h-8 text-white stroke-[2]" />
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="text-sm font-semibold tracking-tight text-apple-text">Pakizzle Property</div>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  className="w-1.5 h-1.5 rounded-full bg-[#F0A830]"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  if (authLoading || vehiclesLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <SkipToContentLink />
      <RouteProgressBar />
      <ScrollToTop />
      <Suspense fallback={<LoadingScreen />}>
        {/* Notification Toast */}
      <AnimatePresence mode="wait">
        {notification && (
          <div className="fixed top-8 left-0 right-0 flex justify-center z-[200] pointer-events-none px-4">
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="pointer-events-auto bg-apple-card-bg backdrop-blur-xl border border-apple-border/50 px-6 py-3 rounded-full shadow-apple-soft flex items-center gap-3 min-w-[280px] max-w-md"
            >
              <div className="w-6 h-6 bg-apple-green rounded-full flex items-center justify-center shrink-0 shadow-sm">
                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
              </div>
              <p className="text-sm font-semibold text-apple-text tracking-tight flex-1 truncate">
                {notification}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Routes>
        <Route path="/pakizzle" element={<CityPortal />} />
        <Route path="/pakizzle.com" element={<CityPortal />} />
        <Route path="/" element={
          userLocation === null ? (
            <CityPortal />
          ) : (
            <PageTransition>
              <div className="min-h-screen overflow-x-hidden pb-20 md:pb-0">
                <Header />
                <main id="main-content">
                <Hero />
              <BrowseByCity />
              <PopularPropertyStyles />

              {userLocation && userLocation.city !== "Pakistan" && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <h2 className="type-h2 font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                        Properties near you in {userLocation.city}
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Discover verified listings in your immediate vicinity.
                      </p>
                    </div>
                    <Link to={`/marketplace?city=${encodeURIComponent(userLocation.city)}`} className="text-sm font-semibold text-[#5B2A86] dark:text-[#F0A830] hover:underline hidden md:block">
                      View all in {userLocation.city}
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {properties
                      ?.filter(v => v.status !== 'inactive' && v.city === userLocation.city)
                      ?.slice(0, 4)
                      ?.map((property, index) => (
                        <motion.div
                          key={property.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 0.08 }}
                        >
                          <PropertyCard property={property} />
                        </motion.div>
                      ))}
                  </div>
                  {properties.filter(v => v.status !== 'inactive' && v.city === userLocation.city).length === 0 && (
                    <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-8 text-center border border-slate-200 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                        No properties found in {userLocation.city} yet. Try expanding your search to Islamabad or Lahore.
                      </p>
                    </div>
                  )}
                </section>
              )}
              
              {/* Curated Featured Masterpieces with Algorithmic Ranking & Loading Skeletons */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0A830]/10 text-[#F0A830] text-xs font-semibold uppercase tracking-wider mb-2 border border-[#C9A227]/30">
                      <Sparkles className="w-3.5 h-3.5" />
                      Algorithmic Ranking
                    </div>
                    <h2 className="type-h2 font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                      Curated Featured Masterpieces
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Ranked by Shanakht™ title-cleared status, high-resolution documentation, and certified market valuation.
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <Link to="/marketplace" className="text-sm font-semibold text-[#5B2A86] dark:text-[#F0A830] hover:underline">
                      View All Marketplace →
                    </Link>
                  </div>
                </div>

                {vehiclesLoading ? (
                  <CardGridSkeleton count={4} />
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {curatedFeatured.map((vehicle, index) => (
                      <motion.div
                        key={vehicle.id}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.08 }}
                      >
                        <VehicleCard vehicle={vehicle} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>

              {/* Social Proof Section (Live Market Activity & Customer Reviews) */}
              <SocialProofSection />

              {/* Recently Viewed Series */}
              <RecentlyViewed />

              {/* Bento Categories Showcase */}
              <CategoryShowcase />

              {/* Zameen Competitor Advantage Section */}
              <ZameenAdvantageSection />

              {/* AI Valuation Section */}
              <section className="bg-apple-gray/50 py-4 md:py-6 border-t border-apple-border/30">
                <div className="max-w-7xl mx-auto px-6">
                  <div className="glass-panel p-8 md:p-12 rounded-apple-2xl flex flex-col md:flex-row items-center gap-10 md:gap-12">
                    <div className="flex-1 text-center md:text-left">
                      <span className="text-apple-blue font-bold text-[10px] md:text-xs uppercase tracking-widest mb-4 block">
                        AI Powered
                      </span>
                      <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                        Know the real market value <br className="hidden md:block" />
                        of your property.
                      </h2>
                      <p className="text-apple-text-muted mb-8 text-base md:text-lg">
                        Our advanced valuation model analyzes micro-location market data across Pakistan 
                        to give you certified market valuation, rental yield forecasts, and FBR tax impact.
                      </p>
                      <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
                        <button 
                          onClick={() => setIsValuationOpen(true)}
                          className="apple-button-primary w-full sm:w-auto"
                        >
                          Get Free Property Valuation
                        </button>
                        <button 
                          onClick={() => setIsValuationOpen(true)}
                          className="apple-button-secondary w-full sm:w-auto"
                        >
                          Explore Valuation Hub
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 relative">
                      <div className="aspect-square w-full max-w-sm mx-auto bg-gradient-to-br from-apple-blue/20 to-purple-500/20 rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="relative z-10 glass-panel p-8 rounded-apple-lg shadow-apple-soft"
                      >
                        <div className="text-sm font-bold text-apple-text-muted mb-4">Estimated Property Value</div>
                        <div className="text-5xl font-bold text-apple-blue mb-2">{formatPrice(48500000)}</div>
                        <div className="text-xs text-green-500 font-bold flex items-center gap-1">
                          ↑ 3.8% appreciation this quarter
                        </div>
                        <div className="mt-8 space-y-3">
                          <div className="h-2 w-full bg-apple-gray rounded-full overflow-hidden">
                            <div className="h-full w-[78%] bg-apple-blue" />
                          </div>
                          <div className="flex justify-between text-[10px] font-bold text-apple-text-muted uppercase tracking-wider">
                            <span>Sector Base</span>
                            <span>Market Average</span>
                            <span>Prime Corner</span>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </section>

              <HomeCTA />
              <FeaturedNews />

              {/* Sell Your Property CTA */}
              <section className="py-4 md:py-6 bg-apple-bg border-t border-apple-border/30 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                  <div className="relative glass-panel bg-[#1D1D1F] p-10 md:p-20 rounded-apple-2xl text-white overflow-hidden border-none shadow-2xl">
                    <div className="absolute top-0 right-0 w-1/2 h-full opacity-15 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-l from-apple-blue to-transparent" />
                      <Building2 className="w-full h-full scale-150 rotate-12 translate-x-1/4" />
                    </div>
                    
                    <div className="relative z-10 max-w-2xl text-center md:text-left">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                      >
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                          Turn your property into <br className="hidden md:block" />
                          generational wealth.
                        </h2>
                        <p className="text-white/60 text-base md:text-lg mb-10 leading-relaxed">
                          Join Pakistan's premier real estate ecosystem. 
                          Get the highest valuation for your house, plot, or commercial asset 
                          with verified buyers, zero spam calls, and full title security.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
                          <Link to="/sell" className="apple-button-primary !bg-white !text-[#1D1D1F] hover:!bg-apple-gray w-full sm:w-auto">
                            List Your Property
                          </Link>
                          <Link to="/dashboard" className="apple-button-secondary !border-white/20 !text-white hover:!bg-white/10 w-full sm:w-auto">
                            View Seller Dashboard
                          </Link>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </section>
            </main>

            <ValuationModal 
              isOpen={isValuationOpen} 
              onClose={() => setIsValuationOpen(false)} 
            />

            <Footer onValuationClick={() => setIsValuationOpen(true)} />
          </div>
          </PageTransition>
          )
        } />
        <Route path="/property/:id" element={<PageTransition><PropertyDetails /></PageTransition>} />
        <Route path="/vehicle/:id" element={<PageTransition><PropertyDetails /></PageTransition>} />
        
        {/* User Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <UserLayout>
              <UserOverview />
            </UserLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/seller" element={
          <ProtectedRoute>
            <UserLayout>
              <SellerDashboard />
            </UserLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/ads" element={
          <ProtectedRoute>
            <UserLayout>
              <UserAds />
            </UserLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/reels" element={
          <ProtectedRoute>
            <UserLayout>
              <UserReels />
            </UserLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/messages" element={
          <ProtectedRoute>
            <UserLayout>
              <UserMessages />
            </UserLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/watchers" element={
          <ProtectedRoute>
            <UserLayout>
              <UserWatchers />
            </UserLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/credits" element={
          <ProtectedRoute>
            <UserLayout>
              <UserCredits />
            </UserLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/wishlist" element={
          <ProtectedRoute>
            <UserLayout>
              <UserWishlist />
            </UserLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/analytics" element={
          <ProtectedRoute>
            <UserLayout>
              <UserAnalytics />
            </UserLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/inspections" element={
          <ProtectedRoute>
            <UserLayout>
              <UserInspections />
            </UserLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/insurance" element={
          <ProtectedRoute>
            <UserLayout>
              <UserInsurance />
            </UserLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/financing" element={
          <ProtectedRoute>
            <UserLayout>
              <UserFinancing />
            </UserLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/help" element={
          <ProtectedRoute>
            <UserLayout>
              <DashboardPlaceholder title="Support Protocol" />
            </UserLayout>
          </ProtectedRoute>
        } />

        <Route path="/marketplace" element={<PageTransition><Marketplace /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><SignUpPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><SignInPage /></PageTransition>} />
        <Route path="/signin" element={<PageTransition><SignInPage /></PageTransition>} />
        <Route path="/reels" element={<PageTransition><ReelsFeed /></PageTransition>} />
        <Route path="/clone" element={<PageTransition><CloneAnalysis /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
        <Route path="/wishlist" element={<PageTransition><Wishlist /></PageTransition>} />
        <Route path="/sell" element={
          <ProtectedRoute>
            <PageTransition>
              <ListingWizard />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/post-ad" element={
          <ProtectedRoute>
            <PageTransition>
              <ListingWizard />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <ChatContainer />
          </ProtectedRoute>
        } />
        <Route path="/edit/:id" element={
          <ProtectedRoute>
            <PageTransition>
              <SellPropertyForm />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/auction-verification" element={<PageTransition><AuctionVerification /></PageTransition>} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfileRedirect />
          </ProtectedRoute>
        } />
        <Route path="/profile/:userId" element={<UserProfile />} />
        <Route path="/settings" element={
          <ProtectedRoute>
            <ProfileSettings />
          </ProtectedRoute>
        } />
        <Route path="/verification" element={
          <ProtectedRoute>
            <VerificationPage />
          </ProtectedRoute>
        } />
        <Route path="/verification/identity" element={
          <ProtectedRoute>
            <UploadIdentityForm />
          </ProtectedRoute>
        } />
        <Route path="/verification/business" element={
          <ProtectedRoute>
            <UploadBusinessForm />
          </ProtectedRoute>
        } />
        <Route path="/insurance" element={<InsuranceLanding />} />
        <Route path="/insurance/car" element={<CarInsurancePage />} />
        <Route path="/insurance/book/:type" element={
          <ProtectedRoute>
            <InsuranceBookingFlow />
          </ProtectedRoute>
        } />
        <Route path="/insurance/quote/:type" element={
          <ProtectedRoute>
            <InsuranceQuoteFlow />
          </ProtectedRoute>
        } />
        <Route path="/inspection" element={<InspectionLanding />} />
        <Route path="/inspection/book" element={
          <ProtectedRoute>
            <InspectionBookingFlow />
          </ProtectedRoute>
        } />
        <Route path="/financing" element={<FinancingLanding />} />
        <Route path="/financing/apply/:type" element={
          <ProtectedRoute>
            <FinancingBookingFlow />
          </ProtectedRoute>
        } />

        <Route path="/forgot" element={
          <Suspense fallback={<div className="min-h-screen bg-[#F5F5F7] dark:bg-black" />}>
            <PageTransition>
              <ForgotPasswordPage />
            </PageTransition>
          </Suspense>
        } />
        <Route path="/reset-password" element={
          <Suspense fallback={<div className="min-h-screen bg-[#F5F5F7] dark:bg-black" />}>
            <PageTransition>
              <ForgotPasswordPage />
            </PageTransition>
          </Suspense>
        } />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/approvals" element={
          <AdminRoute>
            <AdminLayout>
              <ApprovalCenter />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/listings" element={
          <AdminRoute>
            <AdminLayout>
              <ListingManagement />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/reels" element={
          <AdminRoute>
            <AdminLayout>
              <ReelsManagement />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/vehicle-data" element={
          <AdminRoute>
            <AdminLayout>
              <VehicleDataManagement />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/categories" element={
          <AdminRoute>
            <AdminLayout>
              <CategoryManagement />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/custom-fields" element={
          <AdminRoute>
            <AdminLayout>
              <CustomFieldManagement />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/audit" element={
          <AdminRoute>
            <AdminLayout>
              <AuditLog />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute>
            <AdminLayout>
              <UserManagement />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/dealers" element={
          <AdminRoute>
            <AdminLayout>
              <DealerManagement />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/companies" element={
          <AdminRoute>
            <AdminLayout>
              <CompanyManagement />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/verifications" element={
          <AdminRoute>
            <AdminLayout>
              <AuctionVerificationAdmin />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/inspections" element={
          <AdminRoute>
            <AdminLayout>
              <InspectionManagement />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/insurance" element={
          <AdminRoute>
            <AdminLayout>
              <InsuranceManagement />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/financing" element={
          <AdminRoute>
            <AdminLayout>
              <FinancingManagement />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/chats" element={
          <AdminRoute>
            <AdminLayout>
              <Moderation />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/pricing" element={
          <AdminRoute>
            <AdminLayout>
              <PricingManagement />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/payments" element={
          <AdminRoute>
            <AdminLayout>
              <PaymentManagement />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/reports" element={
          <AdminRoute>
            <AdminLayout>
              <ReportManagement />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/content" element={
          <AdminRoute>
            <AdminLayout>
              <ContentManagement />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/banners" element={
          <AdminRoute>
            <AdminLayout>
              <BannerManagement />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/ads" element={
          <AdminRoute>
            <AdminLayout>
              <AdManagement />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/popular-styles" element={
          <AdminRoute>
            <AdminLayout>
              <CategoryManagement />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/seo-aeo-geo" element={
          <AdminRoute>
            <AdminLayout>
              <SeoAeoGeoHub />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/settings" element={
          <AdminRoute>
            <AdminLayout>
              <AdminSettings />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/:section" element={
          <AdminRoute>
            <AdminLayout>
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="w-20 h-20 bg-apple-blue/10 rounded-3xl flex items-center justify-center mb-6">
                  <Settings className="w-10 h-10 text-apple-blue animate-spin-slow" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Module Under Construction</h2>
                <p className="text-apple-text-muted font-medium max-w-md">We're building this enterprise module with Apple-level precision. Check back soon.</p>
              </div>
            </AdminLayout>
          </AdminRoute>
        } />
      </Routes>
      
        {!hideMobileNav && <MobileNav />}
      </Suspense>
      
      <Toaster 
        expand={false} 
        position="top-right" 
        richColors 
        theme={theme === 'dark' ? 'dark' : 'light'}
        toastOptions={{
          style: {
            background: 'var(--apple-card-bg)',
            backdropFilter: 'blur(30px)',
            border: '1px solid var(--apple-border)',
            borderRadius: '24px',
            color: 'var(--apple-text)',
            padding: '16px 20px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
          },
          className: 'font-sans font-bold text-sm tracking-tight',
        }}
      />
      
      <WishlistToast />
      <AddToListModal />
    </>
  );
}
