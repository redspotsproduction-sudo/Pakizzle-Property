import React, { useMemo, useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Eye, 
  MessageSquare, 
  Heart, 
  TrendingUp, 
  ChevronRight, 
  Plus, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles,
  Car,
  Clock,
  Star,
  Activity,
  Award,
  Flame
} from "lucide-react";
import { useProperties } from "../../context/PropertyContext";
import { formatPropertyUrl } from "../../lib/referenceId";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { formatPrice, cn } from "../../lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { Review } from "../../types";

export default function UserOverview() {
  const navigate = useNavigate();
  const { properties: vehicles } = useProperties();
  const { wishlist } = useWishlist();
  const { user, profile } = useAuth();
  const { conversations } = useChat();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const myVehicles = useMemo(() => {
    return vehicles.filter(v => 
      v.seller.uid === user?.uid || 
      (v.seller.name === "Redspots Productions")
    );
  }, [vehicles, user]);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const rQuery = query(
          collection(db, 'reviews'),
          where('targetUserId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const rSnapshot = await getDocs(rQuery);
        setReviews(rSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
      } catch (error) {
        console.error('Error fetching dashboard reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.uid]);

  const stats = [
    { label: "Neural Impressions", value: (myVehicles.length * 1240).toLocaleString(), change: "+14.2%", positive: true, icon: Eye, color: "text-apple-blue", trend: [12, 14, 13, 15, 17, 16, 18], accentColor: "bg-blue-500/10 text-apple-blue" },
    { label: "Active Connections", value: (myVehicles.length * 12).toString(), change: "+5.1%", positive: true, icon: MessageSquare, color: "text-apple-green", trend: [8, 10, 9, 11, 13, 12, 14], accentColor: "bg-apple-green/10 text-apple-green" },
    { label: "Asset Affinity", value: wishlist.length.toString(), change: "-2.4%", positive: false, icon: Heart, color: "text-apple-red", trend: [15, 14, 16, 13, 14, 12, 11], accentColor: "bg-red-500/10 text-apple-red" },
    { label: "Market Resonance", value: "104.2", change: "+1.2%", positive: true, icon: TrendingUp, color: "text-purple-500", trend: [98, 100, 101, 102, 103, 103.5, 104.2], accentColor: "bg-purple-500/10 text-purple-500" },
  ];

  const recentActivity = useMemo(() => {
    const activities: any[] = [];
    conversations
      .filter(c => c.lastMessage && myVehicles.some(v => v.id === c.vehicleId))
      .slice(0, 3)
      .forEach(c => {
        const otherParticipant = c.participants.find(p => p.uid !== user?.uid) || c.participants[0];
        activities.push({
          id: `msg-${c.id}`,
          type: 'message',
          title: c.unreadCount > 0 ? "Priority Intel" : "Inquiry",
          desc: `${otherParticipant.name} connected via ${c.vehicleName}`,
          time: c.lastMessage ? new Date(c.lastMessage.timestamp) : new Date(),
          link: "/dashboard/messages",
          isNew: c.unreadCount > 0
        });
      });

    reviews.forEach(r => {
      activities.push({
        id: `rev-${r.id}`,
        type: 'review',
        title: `Protocol Expansion`,
        desc: `Reputation updated: ${r.rating} stars received from ${r.reviewerName}`,
        time: new Date(r.createdAt),
        link: `/profile/${user?.uid}`
      });
    });

    return activities
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 5);
  }, [conversations, reviews, user?.uid, myVehicles]);

  const activeAds = myVehicles.filter(v => v.status === 'active').slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Apple-style minimalist page header with sophisticated humanist typography */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Merchant Console
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-tight">
            Welcome, <span className="text-apple-text-muted">{profile?.displayName?.split(' ')[0] || 'User'}</span>
          </h1>
          <p className="text-xs text-apple-text-muted mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            Your automotive portfolio is currently performing 12% above market average in Pakistan.
          </p>
        </div>
        
        <Link to="/sell" id="deploy-listing-btn" className="shrink-0 self-start md:self-end">
          <motion.button
            whileHover={{ scale: 1.02, y: -0.5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 450, damping: 24 }}
            className="px-5 py-2.5 text-xs font-semibold bg-apple-blue hover:bg-blue-600 text-white rounded-full transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5px]" />
            List Vehicle
          </motion.button>
        </Link>
      </div>

      {/* Credit allocation status bar */}
      <div className="mb-6 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] bg-white dark:bg-[var(--surface-dark)] p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-apple-blue shrink-0" />
            <h3 className="text-xs font-semibold tracking-tight text-[var(--text-primary)] dark:text-white">Listing Allocation Status</h3>
          </div>
          <p className="text-[11px] text-apple-text-muted max-w-lg leading-relaxed font-normal">
            Optimize your dealership exposure. You have premium post allocation credits and custom featured boosters ready for deployment.
          </p>
          {/* Progress bar */}
          <div className="flex items-center gap-3 pt-1 max-w-xs">
            <div className="flex-1 bg-[#E5E5E7] dark:bg-white/10 h-1 rounded-full overflow-hidden">
              <div className="bg-apple-blue h-full rounded-full w-2/3" />
            </div>
            <span className="text-[9px] font-bold font-mono text-apple-blue shrink-0">{profile?.credits ?? 3} Credits Left</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 flex items-center gap-1.5">
            <Car className="w-3 h-3 text-apple-blue" />
            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">{profile?.credits ?? 3} Posts</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/10 flex items-center gap-1.5">
            <Flame className="w-3 h-3 text-purple-500" />
            <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">{profile?.featuredCredits ?? 0} Boosters</span>
          </div>

          <Link 
            to="/dashboard/credits"
            className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-white/5 border border-black/[0.04] dark:border-white/[0.04] hover:border-apple-blue hover:text-apple-blue transition-colors flex items-center gap-1.5 text-[10px] font-semibold text-apple-text-muted hover:text-[var(--text-primary)] dark:hover:text-white"
          >
            <span>Get Credits</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Dense & Compact Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const colorMapping = [
            { stroke: "var(--brand-blue)", bg: "rgba(0, 113, 227, 0.05)" },
            { stroke: "var(--success)", bg: "rgba(30, 122, 56, 0.05)" },
            { stroke: "var(--danger)", bg: "rgba(197, 48, 48, 0.05)" },
            { stroke: "var(--brand-purple)", bg: "rgba(96, 91, 255, 0.05)" }
          ][i] || { stroke: "var(--brand-blue)", bg: "rgba(0, 113, 227, 0.05)" };

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 140, damping: 15 }}
              className="bg-white dark:bg-[var(--surface-dark)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-4.5 flex flex-col justify-between hover:shadow-[0_12px_30px_rgba(0,0,0,0.02)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:border-black/[0.08] dark:hover:border-white/[0.08] transition-all duration-300 relative overflow-hidden group"
            >
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ backgroundColor: colorMapping.stroke }}
              />

              <div className="flex justify-between items-start mb-3.5">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105", stat.accentColor)}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className={cn(
                  "flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-tight",
                  stat.positive ? "bg-apple-green/5 dark:bg-apple-green/10 text-apple-green" : "bg-apple-red/5 dark:bg-apple-red/10 text-apple-red"
                )}>
                  {stat.positive ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                  {stat.change}
                </div>
              </div>
              
              <div className="space-y-0.5">
                <div className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.1em]">{stat.label}</div>
                <div className="text-2xl sm:text-3xl font-semibold font-mono tracking-tight text-[var(--text-primary)] dark:text-white leading-none">{stat.value}</div>
              </div>

              {/* Micro-sparklines with smooth curves, continuous bezier paths, and area fills */}
              <div className="h-7 mt-4 relative overflow-hidden -mx-4.5 -mb-4.5 flex items-end">
                <svg className="w-full h-6 overflow-visible opacity-50 dark:opacity-30 group-hover:opacity-80 transition-opacity duration-300" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id={`gradient-overview-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={colorMapping.stroke} stopOpacity="0.2" />
                      <stop offset="100%" stopColor={colorMapping.stroke} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M ${stat.trend.map((val, idx) => `${(idx / (stat.trend.length - 1)) * 100} ${20 - ((val - Math.min(...stat.trend)) / (Math.max(...stat.trend) - Math.min(...stat.trend) || 1)) * 14 - 3}`).join(' L ')}`}
                    fill="none"
                    stroke={colorMapping.stroke}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d={`M 0 20 L ${stat.trend.map((val, idx) => `${(idx / (stat.trend.length - 1)) * 100} ${20 - ((val - Math.min(...stat.trend)) / (Math.max(...stat.trend) - Math.min(...stat.trend) || 1)) * 14 - 3}`).join(' L ')} L 100 20 Z`}
                    fill={`url(#gradient-overview-${i})`}
                  />
                </svg>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Neural Visibility Boost card */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--brand-blue)] to-[var(--accent)] p-5 shadow-sm text-white"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0 shadow-sm backdrop-blur-md">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-[9px] font-bold uppercase tracking-wider text-white/90">Elite Status</span>
                  </div>
                  <h3 className="text-sm font-semibold tracking-tight text-white">
                    Neural Visibility Boost Activated
                  </h3>
                  <p className="text-[11px] text-white/80 max-w-md leading-relaxed mt-0.5 font-normal">
                    Your listing priority tier has been updated. Premium postings are optimized to achieve 3x more visibility within major metropolitan sectors.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => navigate('/verification')}
                className="px-4 py-2 bg-white text-apple-blue hover:bg-[#F5F5F7] rounded-xl text-[10px] font-bold uppercase tracking-wider shrink-0 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Optimize
              </button>
            </div>
          </motion.div>

          {/* Active Listings Preview */}
          <section className="bg-white dark:bg-[var(--surface-dark)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-5 sm:p-6 relative overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-bold uppercase tracking-[0.08em] flex items-center gap-2 text-[var(--text-primary)] dark:text-white">
                <Car className="w-3.5 h-3.5 text-apple-blue" />
                Priority Portfolio
              </h2>
              <Link to="/dashboard/ads" className="text-xs font-semibold text-apple-blue hover:underline flex items-center gap-1 transition-colors">
                Command Terminal <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="space-y-3.5">
              {activeAds.length > 0 ? (
                <div className="divide-y divide-[#E5E5E7]/50 dark:divide-white/5">
                  {activeAds.map((v, index) => {
                    const healthScore = v.images.length > 2 ? 98 : 75;
                    const views = 142 + (index * 47);
                    const inquiries = 3 + (index * 2);

                    return (
                      <motion.div 
                        key={v.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 py-4 first:pt-0 last:pb-0 group relative"
                      >
                        <Link to={formatPropertyUrl(v)} className="w-20 h-14 rounded-xl overflow-hidden shadow-sm shrink-0 self-center sm:self-auto relative bg-[var(--bg-raised)] flex items-center justify-center border border-black/5 dark:border-white/10">
                          {v.images?.[0] ? (
                            <img 
                              src={v.images[0]} 
                              alt={v.model} 
                              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                              referrerPolicy="no-referrer" 
                            />
                          ) : (
                            <Car className="w-6 h-6 text-white/40" />
                          )}
                        </Link>
                        
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="flex items-start justify-between gap-3">
                            <Link to={formatPropertyUrl(v)} className="text-sm font-semibold text-[var(--text-primary)] dark:text-white hover:text-apple-blue transition-colors truncate block">
                              {v.year} {v.make} {v.model}
                            </Link>
                            <span className="text-xs font-semibold font-mono text-apple-blue shrink-0">
                              {formatPrice(v.price)}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-apple-text-muted mt-1 font-normal">
                            <span className="font-mono">{v.mileage ? v.mileage.toLocaleString() : "45,000"} km</span>
                            <span className="opacity-30">/</span>
                            <span className="capitalize">{v.transmission || "Automatic"}</span>
                            <span className="opacity-30">/</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-apple-green">
                              {v.status || "active"}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-[10px] font-semibold font-mono text-apple-text-muted mt-2.5">
                            <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-apple-text-muted/70" /> {views} views</span>
                            <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-apple-text-muted/70" /> {inquiries} chats</span>
                            <span className="flex items-center gap-1.5 text-apple-blue"><Sparkles className="w-3.5 h-3.5" /> {healthScore}% ranking</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 px-6 border border-dashed border-[#E5E5E7] dark:border-white/10 rounded-2xl bg-[#F5F5F7]/30 dark:bg-white/[0.005]">
                  <div className="w-14 h-14 rounded-full bg-[#F5F5F7] dark:bg-white/5 flex items-center justify-center mx-auto mb-4 text-apple-text-muted">
                    <Car className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-semibold mb-1 text-[var(--text-primary)] dark:text-white">Launch Your Portfolio</h3>
                  <p className="text-xs text-apple-text-muted max-w-xs mx-auto mb-6 leading-relaxed">
                    No active listings detected. Start selling today to leverage Pakistan's most advanced automotive network.
                  </p>
                  <Link to="/sell" className="px-4.5 py-2 bg-white dark:bg-[#2C2C2E] border border-[#E5E5E7] dark:border-white/10 hover:border-apple-blue rounded-full inline-flex items-center gap-1.5 text-xs font-semibold transition-colors shadow-sm">
                    <Plus className="w-3.5 h-3.5 text-apple-blue" />
                    List Car
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar: Activity & Intelligence */}
        <div className="space-y-6">
          {/* Transmission Log (Activity) */}
          <section className="bg-white dark:bg-[var(--surface-dark)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
            <h2 className="text-xs font-bold uppercase tracking-[0.08em] flex items-center gap-2 mb-4 text-[var(--text-primary)] dark:text-white">
              <Clock className="w-3.5 h-3.5 text-apple-blue" />
              Transmission Log
            </h2>
            <div className="space-y-4 relative">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-apple-border/30" />
              {recentActivity.length > 0 ? (
                recentActivity.map((item) => (
                  <Link key={item.id} to={item.link} className="flex gap-4 relative group">
                    <div className={cn(
                      "w-6 h-6 rounded-[8px] border mt-0.5 transition-all duration-300 shrink-0 flex items-center justify-center z-10 bg-white dark:bg-[#2C2C2E]",
                      item.type === 'message' 
                        ? "border-apple-blue/10 group-hover:bg-apple-blue group-hover:border-apple-blue" 
                        : "border-apple-orange/10 group-hover:bg-apple-orange group-hover:border-apple-orange"
                    )}>
                      {item.type === 'message' ? (
                        <MessageSquare className="w-3 h-3 text-apple-blue group-hover:text-white transition-colors" />
                      ) : (
                        <Star className="w-3 h-3 text-apple-orange group-hover:text-white transition-colors" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className={cn(
                          "text-[9px] font-bold uppercase tracking-wider",
                          item.type === 'message' ? "text-apple-blue" : "text-apple-orange"
                        )}>
                          {item.title}
                        </div>
                        {item.isNew && (
                          <span className="w-1.5 h-1.5 rounded-full bg-apple-blue animate-pulse shadow-sm" />
                        )}
                      </div>
                      <div className="text-xs font-semibold text-[var(--text-primary)] dark:text-white leading-tight group-hover:translate-x-0.5 transition-transform truncate">{item.desc}</div>
                      <div className="text-[9px] text-apple-text-muted uppercase tracking-wider mt-0.5">
                        {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 text-apple-text-muted/40 mx-auto mb-2" />
                  <div className="text-[10px] font-bold text-apple-text-muted uppercase tracking-wider">Zero Latency Detected</div>
                </div>
              )}
            </div>
            
            <Link to="/dashboard/messages" className="mt-4 block w-full py-2 text-center text-[10px] font-bold uppercase tracking-wider text-apple-blue hover:bg-apple-blue/5 border border-apple-blue/15 rounded-xl transition-all">
              Access Communication Matrix
            </Link>
          </section>

          {/* Market Intelligence */}
          <section className="bg-white dark:bg-[var(--surface-dark)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.01)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-125 transition-all duration-700 group-hover:rotate-12">
              <TrendingUp className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-apple-text-muted">Market Intelligence</span>
              </div>
              <h3 className="text-sm font-semibold tracking-tight text-[var(--text-primary)] dark:text-white mb-2">
                Demand Spike: <span className="text-purple-500">Luxury EVs</span>
              </h3>
              <p className="text-[11px] text-apple-text-muted leading-relaxed font-normal mb-4">
                Analytics point to 22% user interest growth in High-End Electric Vehicles within Islamabad sector over current cycle.
              </p>
              <div className="flex items-center gap-4 border-t border-[#E5E5E7]/50 dark:border-white/5 pt-4">
                <div className="flex-1">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-apple-text-muted mb-0.5">Impact Score</p>
                  <p className="text-base font-bold text-apple-green font-mono">+8.4%</p>
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-apple-text-muted mb-0.5">Time Horizon</p>
                  <p className="text-base font-bold text-[var(--text-primary)] dark:text-white font-mono">14 Days</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
