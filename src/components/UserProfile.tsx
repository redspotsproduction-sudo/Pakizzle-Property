import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Star, 
  Share2, 
  Calendar, 
  ShieldCheck, 
  ChevronRight, 
  MessageCircle, 
  ThumbsUp, 
  Clock, 
  User as UserIcon,
  Filter,
  ArrowLeft,
  Cpu,
  Globe,
  Activity,
  CheckCircle2,
  Zap,
  ChevronDown,
  Check,
  Mail,
  Phone,
  Sparkles,
  Lock,
  Award,
  Building2
} from "lucide-react";
import { db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Vehicle, Review } from "../types";
import { cn, formatPrice } from "../lib/utils";
import Header from "./Header";
import Footer from "./Footer";
import Badge from "./Badge";
import { toast } from "sonner";

import { useProperties } from "../context/PropertyContext";
import { useChat } from "../context/ChatContext";

type Tab = "Ads" | "Ratings" | "Security";
type RatingFilter = "All" | "Buyer" | "Seller";

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { properties: allVehicles } = useProperties();
  const { startConversation } = useChat();
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>("Ads");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("All");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Use useMemo for vehicles to ensure reactivity and performance
  const sellerVehicles = useMemo(() => {
    if (!userId) return [];
    
    const filtered = allVehicles.filter(v => {
      // Match by UID
      const isUidMatch = v.seller.uid === userId;
      
      // Special case: if this is the mock seller profile or the logged-in mock user
      // match by name to ensure mock ads show up
      const isMockMatch = (userId === "user-redspots" || profile?.displayName?.toLowerCase() === "redspots productions") && 
                         v.seller.name === "Redspots Productions";
      
      return (isUidMatch || isMockMatch) && v.status === "active";
    });

    return filtered;
  }, [allVehicles, userId, profile]);

  useEffect(() => {
    if (!userId) return;

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, "users", userId));
        
        if (userDoc.exists()) {
          setProfile(userDoc.data());
        } else if (userId === "user-redspots") {
          // Fallback for mock seller
          setProfile({
            uid: "user-redspots",
            displayName: "Redspots Productions",
            isVerified: true,
            rating: 5.0,
            createdAt: new Date("2024-01-01").toISOString(),
            photoURL: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200",
            isOnline: true,
            badgeType: "dealer",
            username: "redspots_productions",
            isEmailVerified: true,
            isPhoneVerified: true,
            isIdentityVerified: true,
            nationality: "Pakistan",
            gender: "Corporate"
          });
        }

        // Fetch reviews
        const rQuery = query(
          collection(db, "reviews"),
          where("targetUserId", "==", userId)
        );
        const rSnapshot = await getDocs(rQuery);
        const fetchedReviews = rSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        // Sort client-side to avoid index requirement
        setReviews(fetchedReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  const filteredReviews = reviews.filter(r => {
    if (ratingFilter === "All") return true;
    return r.type === ratingFilter.toLowerCase();
  });

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : (profile?.rating || 5.0);

  const trustScore = useMemo(() => {
    let score = 70; // Base baseline
    if (profile?.isEmailVerified) score += 10;
    if (profile?.isPhoneVerified || profile?.isOtpVerified) score += 10;
    if (profile?.isIdentityVerified || profile?.isVerified) score += 10;
    if (averageRating >= 4.5) score += 5;
    if (sellerVehicles.length > 0) score += 5;
    return Math.min(score, 100);
  }, [profile, averageRating, sellerVehicles]);

  const handleContactSeller = async () => {
    if (!profile) return;
    
    const contextVehicle = sellerVehicles[0] || {
      id: "general",
      name: "General Inquiry",
      price: 0,
      image: profile.photoURL
    };

    try {
      await startConversation(
        { 
          uid: profile.uid || "user-redspots", 
          name: profile.displayName,
          photoURL: profile.photoURL
        },
        { 
          id: contextVehicle.id, 
          name: contextVehicle.name,
          price: contextVehicle.price,
          image: contextVehicle.images?.[0] || contextVehicle.image
        }
      );
      navigate("/chat");
    } catch (err) {
      console.error(err);
      toast.error("Failed to establish secure chat handshake.");
    }
  };

  const handleShareProfile = async () => {
    const url = window.location.href;
    const shareData = {
      title: `${profile?.displayName} on Pakizzle`,
      text: `Check out ${profile?.displayName}'s profile on Pakizzle`,
      url: url
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Profile link copied to digital clipboard.");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] dark:bg-black flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-apple-blue border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="text-[#1D1D1F] dark:text-[#F5F5F7] antialiased min-h-screen bg-[#F5F5F7] dark:bg-black transition-colors duration-500 selection:bg-apple-blue/10 selection:text-apple-blue">
      <Header />
      
      <main className="max-w-[1280px] mx-auto px-6 sm:px-8 pt-32 pb-24 relative z-10">
        
        {/* Back navigation */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white group transition-colors duration-200 mb-10"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Marketplace</span>
        </Link>

        {/* HUD Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: User Identity & Telemetry HUD */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Core Card: Identity Capsule */}
            <div className="bg-white dark:bg-[#161617] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-apple-blue via-indigo-500 to-cyan-500" />
              
              {/* Profile Image & Badge structure */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4 group">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white dark:border-[#1C1C1E] shadow-md relative"
                  >
                    <img 
                      src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile?.displayName || 'user')}`} 
                      alt={profile?.displayName || 'User'}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  {profile?.isOnline && (
                    <span className="absolute bottom-1 right-1 w-5 h-5 bg-apple-green border-2 border-white dark:border-[#161617] rounded-full shadow-md animate-pulse" />
                  )}
                </div>

                <div className="space-y-1">
                  <h1 className="text-xl font-bold tracking-tight text-[#1D1D1F] dark:text-white flex items-center justify-center gap-2 flex-wrap">
                    <span>{profile?.displayName}</span>
                    <Badge 
                      type={profile?.verified_badge_type || profile?.badgeType || (profile?.isVerified ? 'identity' : 'none')} 
                      size="md" 
                    />
                  </h1>
                  <p className="text-xs font-bold text-apple-blue font-mono">
                    @{profile?.username || (profile?.displayName || "user").toLowerCase().replace(/\s+/g, "_")}
                  </p>
                </div>

                {/* Badge tags */}
                <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
                  {(profile?.verified_badge_type || profile?.badgeType) && (
                    <Badge 
                      type={profile?.verified_badge_type || profile?.badgeType} 
                      size="sm" 
                      showText={true} 
                    />
                  )}
                  {profile?.isOnline && (
                    <span className="px-2 py-0.5 rounded-full bg-apple-green/5 border border-apple-green/15 text-[8px] font-black uppercase tracking-wider text-apple-green">
                      Active Node
                    </span>
                  )}
                </div>

                {/* Primary Action Buttons */}
                <div className="mt-6 w-full grid grid-cols-2 gap-2">
                  <button 
                    onClick={handleContactSeller}
                    className="w-full h-10 rounded-xl text-xs font-bold bg-apple-blue hover:bg-blue-600 text-white transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Contact</span>
                  </button>
                  <button 
                    onClick={handleShareProfile}
                    className="w-full h-10 rounded-xl text-xs font-bold bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/[0.06] dark:hover:bg-white/10 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Personal metadata breakdown */}
              {(profile?.dob || profile?.nationality || profile?.gender) && (
                <div className="mt-6 pt-6 border-t border-black/[0.04] dark:border-white/5 space-y-3 font-mono text-[10px]">
                  {profile.dob && (
                    <div className="flex justify-between">
                      <span className="text-[#86868B] font-bold uppercase tracking-wider">Date of Birth</span>
                      <span className="text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold">
                        {new Date(profile.dob).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  )}
                  {profile.nationality && (
                    <div className="flex justify-between">
                      <span className="text-[#86868B] font-bold uppercase tracking-wider">Nationality</span>
                      <span className="text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold">{profile.nationality}</span>
                    </div>
                  )}
                  {profile.gender && (
                    <div className="flex justify-between">
                      <span className="text-[#86868B] font-bold uppercase tracking-wider">Gender Identity</span>
                      <span className="text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold">{profile.gender}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Circular Trust Gauge HUD */}
            <div className="bg-white dark:bg-[#161617] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">
                  Reputation Diagnostics
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-apple-blue animate-pulse" />
              </div>

              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative w-36 h-36 rounded-full border border-black/[0.04] dark:border-white/[0.04] flex flex-col items-center justify-center bg-[#FAFAFA]/50 dark:bg-[#1C1C1E]/30 backdrop-blur-md">
                  
                  {/* Gauge background graphic */}
                  <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.15] pointer-events-none">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#007AFF" strokeWidth="3" strokeDasharray={`${trustScore * 2.64} 264`} strokeLinecap="round" />
                    </svg>
                  </div>

                  <span className="text-3xl font-black text-apple-blue font-mono tracking-tighter">
                    {trustScore}%
                  </span>
                  <div className="w-8 h-[1px] bg-apple-blue/15 my-1" />
                  <span className="text-[8px] font-extrabold text-[#86868B] uppercase tracking-widest font-mono">
                    TRUST COEFFICIENT
                  </span>

                  {/* Laser effect */}
                  <motion.div 
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-apple-blue to-transparent opacity-30 shadow-[0_0_8px_rgba(0,122,255,0.3)]"
                  />
                </div>

                <div className="mt-5 text-center space-y-1">
                  <div className="flex items-center gap-1 justify-center text-xs font-bold text-[#1D1D1F] dark:text-white">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span>{averageRating.toFixed(1)} Average Star Rating</span>
                  </div>
                  <p className="text-[10px] text-[#86868B] font-medium">
                    Aggregated across {reviews.length} authentic client audits
                  </p>
                </div>
              </div>
            </div>



          </div>

          {/* RIGHT COLUMN: Interactive Segmented Workspace */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Sliding Pill Tab Navigation */}
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/10 pb-4">
              <div className="flex items-center gap-1 p-1 bg-black/[0.03] dark:bg-white/[0.03] rounded-2xl">
                {(["Ads", "Ratings", "Security"] as Tab[]).map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 relative",
                        isActive 
                          ? "text-[#1D1D1F] dark:text-white" 
                          : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]"
                      )}
                    >
                      {isActive && (
                        <motion.div 
                          layoutId="activeWorkspaceTab"
                          className="absolute inset-0 bg-white dark:bg-[#2C2C2E] rounded-xl shadow-sm border border-black/[0.04] dark:border-white/10"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        {tab === "Ads" && `Active Listings (${sellerVehicles.length})`}
                        {tab === "Ratings" && `Reviews (${reviews.length})`}
                        {tab === "Security" && "Trust Diagnostics"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Workspace Views */}
            <AnimatePresence mode="wait">
              {activeTab === "Ads" && (
                <motion.div
                  key="listings"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {sellerVehicles.map((vehicle) => (
                    <motion.div
                      key={vehicle.id}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Link 
                        to={`/vehicle/${vehicle.id}`}
                        className="group flex flex-col h-full bg-white dark:bg-[#161617] rounded-3xl overflow-hidden border border-black/[0.04] dark:border-white/[0.04] shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="aspect-[16/10] overflow-hidden relative shrink-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                          {vehicle.images?.[0] ? (
                            <img 
                              src={vehicle.images[0]} 
                              alt={`${vehicle.make} ${vehicle.model}`}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Building2 className="w-10 h-10 text-slate-400" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                          
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md rounded-lg text-[9px] font-extrabold uppercase tracking-widest shadow-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                              {vehicle.condition}
                            </span>
                          </div>
                          
                          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                            <p className="text-lg md:text-xl font-black font-mono tracking-tight text-white drop-shadow-sm">
                              {formatPrice(vehicle.price)}
                            </p>
                          </div>
                        </div>

                        <div className="p-5 flex flex-col flex-1">
                          <div className="mb-4">
                            <span className="text-[10px] text-apple-blue font-extrabold uppercase tracking-widest block mb-1">
                              {vehicle.year} MODEL
                            </span>
                            <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white line-clamp-1 group-hover:text-apple-blue transition-colors">
                              {vehicle.make} {vehicle.model}
                            </h3>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-[#86868B] uppercase tracking-wider border-t border-black/[0.04] dark:border-white/5 pt-4 mt-auto">
                            <div className="flex items-center gap-1">
                              <Zap className="w-3.5 h-3.5 text-apple-blue shrink-0" />
                              <span>{vehicle.mileage.toLocaleString()} KM</span>
                            </div>
                            <div className="flex items-center gap-1 justify-end">
                              <Globe className="w-3.5 h-3.5 text-[#86868B] shrink-0" />
                              <span className="truncate">{vehicle.location}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}

                  {sellerVehicles.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white dark:bg-[#161617] rounded-3xl border border-dashed border-black/[0.08] dark:border-white/10 p-8">
                      <UserIcon className="w-12 h-12 text-[#86868B] mx-auto mb-4 opacity-55" />
                      <h3 className="text-sm font-bold text-[#1D1D1F] dark:text-white mb-1">No Active Listings</h3>
                      <p className="text-xs text-[#86868B] max-w-xs mx-auto">
                        This seller does not currently hold any public inventory bindings.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "Ratings" && (
                <motion.div
                  key="ratings"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Rating Filters */}
                  <div className="flex items-center gap-2 p-1 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/5 rounded-2xl w-fit">
                    {(["All", "Buyer", "Seller"] as RatingFilter[]).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setRatingFilter(filter)}
                        className={cn(
                          "px-4 py-1.5 rounded-xl text-[10px] font-bold transition-all uppercase tracking-wider",
                          ratingFilter === filter 
                            ? "bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-sm border border-black/[0.04] dark:border-white/10" 
                            : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]"
                        )}
                      >
                        {filter === "All" ? "All Feedback" : `From ${filter}s`}
                      </button>
                    ))}
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {filteredReviews.map((review) => (
                      <div 
                        key={review.id}
                        className="bg-white dark:bg-[#161617] rounded-3xl p-6 border border-black/[0.04] dark:border-white/[0.04] shadow-sm hover:shadow-md transition-shadow duration-300"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={review.reviewerPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.reviewerName}`}
                              alt={review.reviewerName}
                              className="w-10 h-10 rounded-xl object-cover shadow-sm border border-black/[0.04] dark:border-white/10"
                            />
                            <div>
                              <h4 className="font-semibold text-xs text-[#1D1D1F] dark:text-white">{review.reviewerName}</h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] font-bold text-apple-blue uppercase tracking-widest font-mono">
                                  {review.type} AUDIT
                                </span>
                                <span className="w-1 h-1 rounded-full bg-black/10 dark:bg-white/10" />
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={cn(
                                        "w-3 h-3 stroke-1",
                                        i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-black/10 dark:text-white/10"
                                      )} 
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#86868B] uppercase tracking-wider font-mono bg-black/[0.02] dark:bg-white/[0.02] px-2 py-1 rounded-lg border border-black/[0.04] dark:border-white/5">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <p className="text-[#1D1D1F] dark:text-[#F5F5F7] text-xs leading-relaxed font-medium pl-13 mb-4">
                          {review.comment}
                        </p>

                        <div className="flex flex-wrap gap-1.5 pl-13">
                          {review.tags && review.tags.map((tag) => (
                            <span 
                              key={tag}
                              className="px-2.5 py-1 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/5 rounded-lg text-[9px] font-bold text-[#86868B] uppercase tracking-wider font-mono"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}

                    {filteredReviews.length === 0 && (
                      <div className="py-20 text-center bg-white dark:bg-[#161617] rounded-3xl border border-dashed border-black/[0.08] dark:border-white/10 p-8">
                        <Star className="w-12 h-12 text-[#86868B] mx-auto mb-4 opacity-55" />
                        <h3 className="text-sm font-bold text-[#1D1D1F] dark:text-white mb-1">No Reviews Identified</h3>
                        <p className="text-xs text-[#86868B] max-w-xs mx-auto">
                          This seller is yet to build an archival review index in our decentralized feedback node.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "Security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Verified Criteria Checklist */}
                  <div className="bg-white dark:bg-[#161617] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-6 space-y-6">
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-apple-blue uppercase tracking-[0.2em] block">
                        AUDIT SCOPE
                      </span>
                      <h2 className="text-lg font-semibold text-[#1D1D1F] dark:text-white">
                        Verified Credentials & Compliance
                      </h2>
                      <p className="text-xs text-[#86868B]">
                        Pakizzle credentials verify physical and digital authenticity to eliminate marketplace fraud.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-black/[0.04] dark:border-white/5">
                      
                      {/* Email Verification Checkbox */}
                      <div className={cn(
                        "p-4 rounded-2xl border flex items-center justify-between transition-all",
                        profile?.isEmailVerified 
                          ? "bg-emerald-500/[0.02] border-emerald-500/10" 
                          : "bg-black/[0.01] dark:bg-white/[0.01] border-black/[0.05] dark:border-white/5"
                      )}>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border",
                            profile?.isEmailVerified 
                              ? "bg-emerald-500/5 border-emerald-500/15 text-emerald-500" 
                              : "bg-black/5 dark:bg-white/5 border-black/[0.05] dark:border-white/10 text-[#86868B]"
                          )}>
                            <Mail className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#1D1D1F] dark:text-white">Email Integration</h4>
                            <span className="text-[9px] text-[#86868B] font-medium uppercase tracking-wider font-mono">
                              {profile?.isEmailVerified ? "Verified Handshake" : "Pending Check"}
                            </span>
                          </div>
                        </div>
                        {profile?.isEmailVerified ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/5 stroke-[2.5]" />
                        ) : (
                          <span className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider font-mono">NOT LINKED</span>
                        )}
                      </div>

                      {/* Phone & OTP Check */}
                      <div className={cn(
                        "p-4 rounded-2xl border flex items-center justify-between transition-all",
                        profile?.isPhoneVerified || profile?.isOtpVerified 
                          ? "bg-emerald-500/[0.02] border-emerald-500/10" 
                          : "bg-black/[0.01] dark:bg-white/[0.01] border-black/[0.05] dark:border-white/5"
                      )}>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border",
                            profile?.isPhoneVerified || profile?.isOtpVerified 
                              ? "bg-emerald-500/5 border-emerald-500/15 text-emerald-500" 
                              : "bg-black/5 dark:bg-white/5 border-black/[0.05] dark:border-white/10 text-[#86868B]"
                          )}>
                            <Phone className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#1D1D1F] dark:text-white">OTP Secure Bypass</h4>
                            <span className="text-[9px] text-[#86868B] font-medium uppercase tracking-wider font-mono">
                              {profile?.isPhoneVerified || profile?.isOtpVerified ? "200% Certified SMS" : "Bypass Mode"}
                            </span>
                          </div>
                        </div>
                        {profile?.isPhoneVerified || profile?.isOtpVerified ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/5 stroke-[2.5]" />
                        ) : (
                          <span className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider font-mono">NOT LINKED</span>
                        )}
                      </div>

                      {/* National ID / CNIC verification */}
                      <div className={cn(
                        "p-4 rounded-2xl border flex items-center justify-between transition-all",
                        profile?.isIdentityVerified || profile?.isVerified
                          ? "bg-emerald-500/[0.02] border-emerald-500/10" 
                          : "bg-black/[0.01] dark:bg-white/[0.01] border-black/[0.05] dark:border-white/5"
                      )}>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border",
                            profile?.isIdentityVerified || profile?.isVerified
                              ? "bg-emerald-500/5 border-emerald-500/15 text-emerald-500" 
                              : "bg-black/5 dark:bg-white/5 border-black/[0.05] dark:border-white/10 text-[#86868B]"
                          )}>
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#1D1D1F] dark:text-white">CNIC Identity Audit</h4>
                            <span className="text-[9px] text-[#86868B] font-medium uppercase tracking-wider font-mono">
                              {profile?.isIdentityVerified || profile?.isVerified ? "Biometric ID Match" : "Standard Tier"}
                            </span>
                          </div>
                        </div>
                        {profile?.isIdentityVerified || profile?.isVerified ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/5 stroke-[2.5]" />
                        ) : (
                          <span className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider font-mono">UNVERIFIED</span>
                        )}
                      </div>

                      {/* Premium Badge check */}
                      <div className={cn(
                        "p-4 rounded-2xl border flex items-center justify-between transition-all",
                        profile?.badgeType && profile.badgeType !== "none"
                          ? "bg-emerald-500/[0.02] border-emerald-500/10" 
                          : "bg-black/[0.01] dark:bg-white/[0.01] border-black/[0.05] dark:border-white/5"
                      )}>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border",
                            profile?.badgeType && profile.badgeType !== "none"
                              ? "bg-emerald-500/5 border-emerald-500/15 text-emerald-500" 
                              : "bg-black/5 dark:bg-white/5 border-black/[0.05] dark:border-white/10 text-[#86868B]"
                          )}>
                            <Award className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#1D1D1F] dark:text-white">Authorized Seal</h4>
                            <span className="text-[9px] text-[#86868B] font-medium uppercase tracking-wider font-mono">
                              {profile?.badgeType && profile.badgeType !== "none" ? `${profile.badgeType.toUpperCase()} LEVEL` : "BASIC SEAL"}
                            </span>
                          </div>
                        </div>
                        {profile?.badgeType && profile.badgeType !== "none" ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/5 stroke-[2.5]" />
                        ) : (
                          <span className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider font-mono">NONE</span>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Trust Standards Card */}
                  <div className="bg-[#1D1D1F] text-white rounded-3xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-apple-blue/15 to-transparent blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-apple-blue" />
                      <span className="font-extrabold text-[9px] uppercase tracking-wider font-mono text-apple-blue">
                        Authentic Escrow Compliance
                      </span>
                    </div>

                    <h3 className="text-base font-semibold mb-2">
                      Pakizzle Verified Buyer & Seller Protection
                    </h3>
                    <p className="text-xs text-white/70 leading-relaxed max-w-xl">
                      Every transaction managed under Pakizzle features automated credit validation, transparent chassis mapping alerts, and verified rating pings. This protects against odometer manipulation, fraudulent structural claims, or escrow failures.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </main>

      <Footer onValuationClick={() => {}} />
    </div>
  );
}
