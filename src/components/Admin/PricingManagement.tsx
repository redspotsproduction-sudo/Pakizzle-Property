import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X,
  DollarSign,
  Calendar,
  Layers,
  ShieldCheck,
  Zap,
  Star,
  Flame,
  User,
  Shield,
  Check,
  Building2,
  Image,
  Video,
  Database,
  Users,
  MessageSquare,
  Sparkles,
  HelpCircle,
  TrendingUp,
  Sliders,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { pricingService } from "@/services/pricingService";
import { PricingPlan, Category, UserProfile } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { db } from "@/firebase";
import { collection, query, getDocs, updateDoc, doc } from "firebase/firestore";

export default function PricingManagement() {
  const [activeSubTab, setActiveSubTab] = useState<'plans' | 'categories' | 'balances'>('plans');
  const [segmentFilter, setSegmentFilter] = useState<'all' | 'user' | 'dealer' | 'company'>('all');
  
  // Plans States
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);

  // Live Modal Preview States (Updates as admin edits form)
  const [prevName, setPrevName] = useState("");
  const [prevPrice, setPrevPrice] = useState(0);
  const [prevDescription, setPrevDescription] = useState("");
  const [prevBilling, setPrevBilling] = useState<'once' | 'monthly' | 'yearly'>('monthly');
  const [prevSegment, setPrevSegment] = useState<'user' | 'dealer' | 'company'>('user');
  const [prevValidity, setPrevValidity] = useState(30);
  const [prevListingLimit, setPrevListingLimit] = useState(5);
  const [prevFeaturedLimit, setPrevFeaturedLimit] = useState(0);
  const [prevImageLimit, setPrevImageLimit] = useState(10);
  const [prevVideoAllowed, setPrevVideoAllowed] = useState(false);
  const [prevBoostInterval, setPrevBoostInterval] = useState(7);
  const [prevApiSync, setPrevApiSync] = useState(false);
  const [prevCrm, setPrevCrm] = useState(false);
  const [prevWhatsApp, setPrevWhatsApp] = useState(true);
  const [prevBanner, setPrevBanner] = useState(false);
  const [prevSla, setPrevSla] = useState<'none' | '24h' | '4h' | '1h'>('none');
  const [prevTeamSlots, setPrevTeamSlots] = useState(1);
  const [prevColorTheme, setPrevColorTheme] = useState("var(--accent)");
  const [prevIsPopular, setPrevIsPopular] = useState(false);
  const [prevBadgeText, setPrevBadgeText] = useState("");
  const [prevFeaturesText, setPrevFeaturesText] = useState("");

  // Simulated live projection states
  const [simulatedUsers, setSimulatedUsers] = useState<number>(150);

  // Categories States
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [catSearch, setCatSearch] = useState("");

  // User Balance States
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [newCredits, setNewCredits] = useState<number>(0);
  const [newFeatured, setNewFeatured] = useState<number>(0);

  useEffect(() => {
    fetchPlans();
    fetchCategories();
    fetchUsers();
  }, []);

  // Sync state for preview when modal editingPlan changes
  useEffect(() => {
    if (editingPlan) {
      setPrevName(editingPlan.name || "");
      setPrevPrice(editingPlan.price || 0);
      setPrevDescription(editingPlan.description || "");
      setPrevBilling(editingPlan.billingCycle || 'monthly');
      setPrevSegment(editingPlan.targetUserSegment || (editingPlan.type as any) || 'user');
      setPrevValidity(editingPlan.validityDays || 30);
      setPrevListingLimit(editingPlan.listingLimit || 0);
      setPrevFeaturedLimit(editingPlan.featuredLimit || 0);
      setPrevImageLimit(editingPlan.imageLimit || 10);
      setPrevVideoAllowed(editingPlan.isVideoAllowed || false);
      setPrevBoostInterval(editingPlan.boostIntervalDays || 7);
      setPrevApiSync(editingPlan.isApiSyncAllowed || false);
      setPrevCrm(editingPlan.isCrmIntegrationAllowed || false);
      setPrevWhatsApp(editingPlan.isWhatsAppCtaAllowed || false);
      setPrevBanner(editingPlan.isSponsoredBannerAllowed || false);
      setPrevSla(editingPlan.supportSla || 'none');
      setPrevTeamSlots(editingPlan.teamSlotsCount || 1);
      setPrevColorTheme(editingPlan.colorTheme || "var(--accent)");
      setPrevIsPopular(editingPlan.isPopular || false);
      setPrevBadgeText(editingPlan.badgeText || "");
      setPrevFeaturesText(editingPlan.features ? editingPlan.features.join('\n') : "");
    } else {
      // Clear out to default premium values
      setPrevName("Premium Custom Enterprise");
      setPrevPrice(29900);
      setPrevDescription("The definitive package for scale, analytics, and custom CRM mapping.");
      setPrevBilling('monthly');
      setPrevSegment('dealer');
      setPrevValidity(30);
      setPrevListingLimit(100);
      setPrevFeaturedLimit(20);
      setPrevImageLimit(30);
      setPrevVideoAllowed(true);
      setPrevBoostInterval(3);
      setPrevApiSync(true);
      setPrevCrm(true);
      setPrevWhatsApp(true);
      setPrevBanner(false);
      setPrevSla('4h');
      setPrevTeamSlots(8);
      setPrevColorTheme("var(--success)");
      setPrevIsPopular(true);
      setPrevBadgeText("Best Value");
      setPrevFeaturesText("Unlimited inventory sync\nDynamic Leads CRM Dashboard\nPriority Premium Boosts\nDedicated Account Manager");
    }
  }, [editingPlan, isModalOpen]);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const data = await pricingService.getPlans();
      setPlans(data.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (e) {
      toast.error("Failed to load pricing plans");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    setLoadingCats(true);
    try {
      const q = query(collection(db, "categories"));
      const snap = await getDocs(q);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
      setCategories(items.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load categories catalog");
    } finally {
      setLoadingCats(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const q = query(collection(db, "users"));
      const snap = await getDocs(q);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as UserProfile));
      setUsers(items);
    } catch (e) {
      console.error(e);
      toast.error("Failed to acquire user profiles database");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const planData: any = {
      name: prevName,
      description: prevDescription,
      price: Number(prevPrice),
      currency: 'PKR',
      billingCycle: prevBilling,
      type: prevSegment,
      targetUserSegment: prevSegment,
      validityDays: Number(prevValidity),
      listingLimit: Number(prevListingLimit),
      featuredLimit: Number(prevFeaturedLimit),
      sortOrder: editingPlan ? editingPlan.sortOrder : plans.length + 1,
      badgeText: prevBadgeText,
      isPopular: prevIsPopular,
      status: 'active',
      
      // Extended dynamic premium fields
      imageLimit: Number(prevImageLimit),
      isVideoAllowed: prevVideoAllowed,
      boostIntervalDays: Number(prevBoostInterval),
      isApiSyncAllowed: prevApiSync,
      isCrmIntegrationAllowed: prevCrm,
      isWhatsAppCtaAllowed: prevWhatsApp,
      isSponsoredBannerAllowed: prevBanner,
      supportSla: prevSla,
      teamSlotsCount: Number(prevTeamSlots),
      colorTheme: prevColorTheme,
      features: prevFeaturesText.split('\n').filter(f => f.trim())
    };

    try {
      if (editingPlan) {
        await pricingService.updatePlan(editingPlan.id, planData);
        toast.success("Pricing plan configured and updated reactively");
      } else {
        await pricingService.addPlan(planData);
        toast.success("New premium subscription tier initialized successfully");
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (e) {
      toast.error("Command failed");
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm("Are you sure you want to permanently purge this pricing tier? This will affect any subscribers.")) return;
    try {
      await pricingService.deletePlan(id);
      toast.success("Monetization template redacted successfully");
      fetchPlans();
    } catch (e) {
      toast.error("Purge failure");
    }
  };

  const handleUpdateCategoryRule = async (catId: string, isCrowded: boolean, creditCost: number) => {
    try {
      const catRef = doc(db, "categories", catId);
      await updateDoc(catRef, {
        isCrowded,
        creditCost
      });
      setCategories(prev => prev.map(c => c.id === catId ? { ...c, isCrowded, creditCost } : c));
      toast.success("Dynamic category congestion index updated");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update dynamic category registers");
    }
  };

  const handleUserBalanceSave = async () => {
    if (!editingUser) return;
    try {
      const userRef = doc(db, "users", editingUser.uid);
      await updateDoc(userRef, {
        credits: newCredits,
        featuredCredits: newFeatured
      });
      setUsers(prev => prev.map(u => u.uid === editingUser.uid ? { ...u, credits: newCredits, featuredCredits: newFeatured } : u));
      toast.success(`Adjusted balance registers for: ${editingUser.displayName}`);
      setEditingUser(null);
    } catch (e) {
      console.error(e);
      toast.error("Failed to commit balance changes");
    }
  };

  // Filters
  const filteredPlans = plans.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const segment = p.targetUserSegment || p.type;
    const matchesSegment = segmentFilter === 'all' || segment === segmentFilter;
    return matchesSearch && matchesSegment;
  });

  const filteredCats = categories.filter(c => 
    c.name.toLowerCase().includes(catSearch.toLowerCase()) ||
    c.slug.toLowerCase().includes(catSearch.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    (u.displayName || "").toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <Layers className="w-3.5 h-3.5" />
            Verified Administration Console
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-tight font-sans">
            Economy & Plans Manager
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            Configure enterprise monetization layers, customized target user-segments (Individual, Dealer, Corporate), dynamic crowded categories, and live credits ledgers.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start md:self-end">
          {/* Main SubTab togglers */}
          <div className="flex p-0.5 bg-[var(--text-primary)] dark:bg-white/5 rounded-xl border border-black/[0.04] dark:border-white/[0.04] self-start">
            <button
              onClick={() => setActiveSubTab('plans')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                activeSubTab === 'plans'
                  ? "bg-white dark:bg-[var(--bg-raised)] shadow-sm text-[var(--text-primary)] dark:text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white"
              )}
            >
              Monetization Plans
            </button>
            <button
              onClick={() => setActiveSubTab('categories')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                activeSubTab === 'categories'
                  ? "bg-white dark:bg-[var(--bg-raised)] shadow-sm text-[var(--text-primary)] dark:text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white"
              )}
            >
              Crowded Protection
            </button>
            <button
              onClick={() => setActiveSubTab('balances')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                activeSubTab === 'balances'
                  ? "bg-white dark:bg-[var(--bg-raised)] shadow-sm text-[var(--text-primary)] dark:text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white"
              )}
            >
              Ecosystem Balances
            </button>
          </div>

          {activeSubTab === 'plans' && (
            <button
              onClick={() => {
                setEditingPlan(null);
                setIsModalOpen(true);
              }}
              className="apple-button-primary bg-apple-blue hover:bg-apple-blue/90 text-white rounded-xl h-9 px-4 text-xs font-semibold shadow-sm border-none transition-all flex items-center justify-center whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Initialize Tier
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Statistics Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Service Tiers', value: plans.length.toString(), desc: `${plans.filter(p => p.type === 'user').length} Individual, ${plans.filter(p => p.type === 'dealer').length} Dealer, ${plans.filter(p => p.type === 'company').length} Corp`, icon: Zap, color: 'text-apple-blue', bg: 'bg-apple-blue/10' },
          { label: 'Sectors Under Watch', value: categories.filter(c => c.isCrowded).length.toString(), desc: 'Congestion pricing active', icon: Flame, color: 'text-apple-orange', bg: 'bg-apple-orange/10' },
          { label: 'Registered Members', value: users.length.toString(), desc: 'Active wallets on platform', icon: User, color: 'text-apple-green', bg: 'bg-apple-green/10' },
          { label: 'Total Circulation', value: users.reduce((acc, curr) => acc + (curr.credits || 0), 0).toLocaleString() + ' Credits', desc: 'Active transactional fuel', icon: ShieldCheck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div className={cn("p-2.5 rounded-xl group-hover:scale-105 transition-transform duration-500", stat.bg)}>
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
              <div className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                System Status
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-none">{stat.value}</div>
              <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mt-1">{stat.label}</div>
              <p className="text-[10px] text-[var(--text-secondary)] mt-1.5 leading-none font-medium">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'plans' && (
          <motion.div 
            key="plans"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Filter segments & search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative group min-w-[200px] sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] group-focus-within:text-apple-blue transition-colors duration-300" />
                <input 
                  type="text"
                  placeholder="Search Tiers, Descriptions..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[var(--text-primary)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 rounded-xl text-xs font-medium focus:ring-0 outline-none transition-all duration-300 shadow-inner"
                />
              </div>

              {/* Segment Segment filters */}
              <div className="flex p-0.5 bg-[var(--text-primary)] dark:bg-white/5 rounded-xl border border-black/[0.04] dark:border-white/[0.04] self-start sm:self-auto">
                {[
                  { id: 'all', label: 'All Segments' },
                  { id: 'user', label: '👤 Users' },
                  { id: 'dealer', label: '💼 Dealers' },
                  { id: 'company', label: '🏢 Companies' }
                ].map((seg) => (
                  <button
                    key={seg.id}
                    onClick={() => setSegmentFilter(seg.id as any)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all",
                      segmentFilter === seg.id
                        ? "bg-white dark:bg-[var(--bg-raised)] shadow-sm text-apple-blue"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white"
                    )}
                  >
                    {seg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Comprehensive Plans Display */}
            <div className="grid grid-cols-1 gap-6">
              {isLoading ? (
                <div className="bg-white dark:bg-[var(--bg-surface)] p-12 text-center rounded-2xl border border-black/[0.04] dark:border-white/[0.04]">
                  Awaiting monetization registry responses...
                </div>
              ) : filteredPlans.length === 0 ? (
                <div className="bg-white dark:bg-[var(--bg-surface)] p-12 text-center rounded-2xl border border-black/[0.04] dark:border-white/[0.04] text-[var(--text-secondary)]">
                  No pricing templates matched your selection. Click "Initialize Tier" to start.
                </div>
              ) : (
                <div className="bg-white dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-apple-border/10 bg-[var(--text-primary)] dark:bg-white/[0.02]">
                        <TableHead className="font-bold text-[var(--text-secondary)] uppercase tracking-[0.1em] text-[9px] py-4 pl-6 w-[200px]">Tier Info & Target</TableHead>
                        <TableHead className="font-bold text-[var(--text-secondary)] uppercase tracking-[0.1em] text-[9px] py-4 w-[120px]">Monetization Rate</TableHead>
                        <TableHead className="font-bold text-[var(--text-secondary)] uppercase tracking-[0.1em] text-[9px] py-4">Listing & Featured Limits</TableHead>
                        <TableHead className="font-bold text-[var(--text-secondary)] uppercase tracking-[0.1em] text-[9px] py-4">Advanced Attributes & SLA</TableHead>
                        <TableHead className="font-bold text-[var(--text-secondary)] uppercase tracking-[0.1em] text-[9px] py-4 text-center w-[100px]">Status</TableHead>
                        <TableHead className="font-bold text-[var(--text-secondary)] uppercase tracking-[0.1em] text-[9px] py-4 text-right pr-6 w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPlans.map((plan) => {
                        const segment = plan.targetUserSegment || plan.type;
                        const themeColor = plan.colorTheme || "var(--accent)";
                        return (
                          <TableRow key={plan.id} className="group hover:bg-black/[0.01] dark:hover:bg-white/[0.01] border-black/[0.04] dark:border-white/[0.04]">
                            {/* Tier and Segment */}
                            <TableCell className="py-4 pl-6">
                              <div className="flex items-start gap-2.5">
                                <div className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: themeColor }} />
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-xs text-[var(--text-primary)] dark:text-white leading-tight">{plan.name}</span>
                                    {plan.isPopular && (
                                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-apple-orange/10 text-apple-orange uppercase">
                                        Popular
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase">
                                    {segment === 'user' && <span className="text-apple-blue">👤 Individual User</span>}
                                    {segment === 'dealer' && <span className="text-apple-green">💼 Dealer Subscription</span>}
                                    {segment === 'company' && <span className="text-purple-500">🏢 Corporate Fleet</span>}
                                    {!['user', 'dealer', 'company'].includes(segment as string) && <span className="text-[var(--text-secondary)]">Boost Module</span>}
                                  </div>
                                  <p className="text-[10px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed max-w-[220px]">{plan.description}</p>
                                </div>
                              </div>
                            </TableCell>

                            {/* Price */}
                            <TableCell className="py-4">
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold text-[var(--text-primary)] dark:text-white">
                                  PKR {plan.price.toLocaleString()}
                                </span>
                                <span className="text-[9px] text-[var(--text-secondary)] block font-semibold uppercase tracking-wider">
                                  {plan.billingCycle === 'once' ? 'One-time Post' : `${plan.billingCycle} charge`}
                                </span>
                                <span className="text-[9px] text-[var(--text-secondary)] block">
                                  Valid for {plan.validityDays} Days
                                </span>
                              </div>
                            </TableCell>

                            {/* Limits */}
                            <TableCell className="py-4">
                              <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                                <Badge variant="outline" className="text-[9px] border-black/[0.06] dark:border-white/[0.06] bg-[var(--text-primary)] dark:bg-white/5 py-0.5 px-2 font-medium">
                                  Listings: {plan.listingLimit === 9999 ? "Unlimited" : plan.listingLimit ?? 1}
                                </Badge>
                                <Badge variant="outline" className="text-[9px] border-black/[0.06] dark:border-white/[0.06] bg-[var(--text-primary)] dark:bg-white/5 py-0.5 px-2 font-medium">
                                  Featured Boosts: {plan.featuredLimit ?? 0}
                                </Badge>
                                <Badge variant="outline" className="text-[9px] border-black/[0.06] dark:border-white/[0.06] bg-[var(--text-primary)] dark:bg-white/5 py-0.5 px-2 font-medium">
                                  Images Max: {plan.imageLimit ?? 10}
                                </Badge>
                                <Badge variant="outline" className={cn(
                                  "text-[9px] border-black/[0.06] dark:border-white/[0.06] py-0.5 px-2 font-medium",
                                  plan.isVideoAllowed ? "bg-apple-green/10 text-apple-green border-apple-green/20" : "bg-[var(--text-primary)] dark:bg-white/5 opacity-50"
                                )}>
                                  Video Uploads: {plan.isVideoAllowed ? "Allowed" : "No"}
                                </Badge>
                                <Badge variant="outline" className="text-[9px] border-black/[0.06] dark:border-white/[0.06] bg-[var(--text-primary)] dark:bg-white/5 py-0.5 px-2 font-medium">
                                  Bump: Every {plan.boostIntervalDays ?? 7} Days
                                </Badge>
                              </div>
                            </TableCell>

                            {/* Systems & SLA */}
                            <TableCell className="py-4">
                              <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                                {plan.isApiSyncAllowed && (
                                  <span className="inline-flex items-center gap-1 text-[8px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                    REST API FEED
                                  </span>
                                )}
                                {plan.isCrmIntegrationAllowed && (
                                  <span className="inline-flex items-center gap-1 text-[8px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded-md bg-apple-blue/10 text-apple-blue border border-apple-blue/20">
                                    CRM DASHBOARD
                                  </span>
                                )}
                                {plan.isWhatsAppCtaAllowed && (
                                  <span className="inline-flex items-center gap-1 text-[8px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded-md bg-apple-green/10 text-apple-green border border-apple-green/20">
                                    Direct WhatsApp CTA
                                  </span>
                                )}
                                {plan.isSponsoredBannerAllowed && (
                                  <span className="inline-flex items-center gap-1 text-[8px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded-md bg-apple-orange/10 text-apple-orange border border-apple-orange/20">
                                    Home Banner Ads
                                  </span>
                                )}
                                <span className="inline-flex items-center gap-1 text-[8px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-[var(--text-secondary)]">
                                  SLA: {plan.supportSla === 'none' || !plan.supportSla ? "No SLA" : `${plan.supportSla} support`}
                                </span>
                                {plan.teamSlotsCount && plan.teamSlotsCount > 1 ? (
                                  <span className="inline-flex items-center gap-1 text-[8px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-[var(--text-secondary)]">
                                    Team Slots: {plan.teamSlotsCount}
                                  </span>
                                ) : null}
                              </div>
                            </TableCell>

                            {/* Status */}
                            <TableCell className="py-4 text-center">
                              <Badge className="bg-apple-green text-white border-none text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                                {plan.status}
                              </Badge>
                            </TableCell>

                            {/* Commands */}
                            <TableCell className="py-4 pr-6 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-apple-blue hover:bg-apple-blue/10 rounded-xl h-8 w-8" 
                                  onClick={() => { setEditingPlan(plan); setIsModalOpen(true); }}
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-apple-red hover:bg-apple-red/10 rounded-xl h-8 w-8" 
                                  onClick={() => handleDeletePlan(plan.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeSubTab === 'categories' && (
          <motion.div 
            key="categories"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Search Categories */}
            <div className="relative group min-w-[200px] sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] group-focus-within:text-apple-blue transition-colors duration-300" />
              <input 
                type="text"
                placeholder="Search Categories, Slugs..." 
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--text-primary)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 rounded-xl text-xs font-medium focus:ring-0 outline-none transition-all duration-300 shadow-inner"
              />
            </div>

            {/* Categories Table */}
            <div className="bg-white dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300">
              <Table>
                <TableHeader>
                  <TableRow className="border-apple-border/10 bg-[var(--text-primary)] dark:bg-white/[0.02]">
                    <TableHead className="font-bold text-[var(--text-secondary)] uppercase tracking-[0.1em] text-[9px] py-4 pl-6">Classification Node</TableHead>
                    <TableHead className="font-bold text-[var(--text-secondary)] uppercase tracking-[0.1em] text-[9px] py-4 text-center w-[180px]">Congestion State</TableHead>
                    <TableHead className="font-bold text-[var(--text-secondary)] uppercase tracking-[0.1em] text-[9px] py-4 text-center w-[200px]">Deduction Price (Token)</TableHead>
                    <TableHead className="font-bold text-[var(--text-secondary)] uppercase tracking-[0.1em] text-[9px] py-4 text-right pr-6 w-[150px]">Commit Overrides</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingCats ? (
                    <TableRow><TableCell colSpan={4} className="p-8 text-center text-xs">Querying classification directory...</TableCell></TableRow>
                  ) : filteredCats.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="p-8 text-center text-xs text-[var(--text-secondary)]">No classifiers matched.</TableCell></TableRow>
                  ) : filteredCats.map((cat) => {
                    const localIsCrowded = cat.isCrowded || false;
                    const localCost = cat.creditCost ?? 0;
                    return (
                      <TableRow key={cat.id} className="group hover:bg-black/[0.01] dark:hover:bg-white/[0.01] border-black/[0.04] dark:border-white/[0.04] h-16">
                        <TableCell className="pl-6">
                          <div>
                            <span className="font-semibold text-xs text-[var(--text-primary)] dark:text-white">{cat.name}</span>
                            <span className="text-[10px] block font-mono text-[var(--text-secondary)]">SLUG: {cat.slug} • LEVEL: {cat.level}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <button
                            onClick={() => handleUpdateCategoryRule(cat.id, !localIsCrowded, localCost)}
                            className={cn(
                              "px-3 py-1 text-[8px] font-bold uppercase tracking-wider rounded-full border-none shadow-sm transition-all duration-300",
                              localIsCrowded ? "bg-red-500 text-white animate-pulse" : "bg-[var(--text-primary)] dark:bg-white/5 text-[var(--text-secondary)] dark:text-white/60 hover:bg-black/[0.04]"
                            )}
                          >
                            {localIsCrowded ? "CROWDED - Dynamic Penalty" : "CLEAR - Standard"}
                          </button>
                        </TableCell>
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <input 
                              type="number" 
                              className="w-16 h-8 rounded-lg bg-[var(--text-primary)] dark:bg-white/5 border border-black/[0.06] dark:border-white/[0.06] text-center font-bold text-xs outline-none focus:border-apple-blue/40"
                              defaultValue={localCost}
                              onBlur={(e) => {
                                const newval = parseInt(e.target.value) || 0;
                                if (newval !== localCost) {
                                  handleUpdateCategoryRule(cat.id, localIsCrowded, newval);
                                }
                              }}
                            />
                            <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">Credits</span>
                          </div>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <span className="text-[9px] font-semibold text-[var(--text-secondary)] select-none pointer-events-none">Saved on Change</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'balances' && (
          <motion.div 
            key="balances"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Search Users */}
            <div className="relative group min-w-[200px] sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] group-focus-within:text-apple-blue transition-colors duration-300" />
              <input 
                type="text"
                placeholder="Lookup user by display name or email..." 
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--text-primary)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 rounded-xl text-xs font-medium focus:ring-0 outline-none transition-all duration-300 shadow-inner"
              />
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300">
              <Table>
                <TableHeader>
                  <TableRow className="border-apple-border/10 bg-[var(--text-primary)] dark:bg-white/[0.02]">
                    <TableHead className="font-bold text-[var(--text-secondary)] uppercase tracking-[0.1em] text-[9px] py-4 pl-6">User Identity</TableHead>
                    <TableHead className="font-bold text-[var(--text-secondary)] uppercase tracking-[0.1em] text-[9px] py-4 text-center">Regular Credits Balance</TableHead>
                    <TableHead className="font-bold text-[var(--text-secondary)] uppercase tracking-[0.1em] text-[9px] py-4 text-center">Featured Token Balance</TableHead>
                    <TableHead className="font-bold text-[var(--text-secondary)] uppercase tracking-[0.1em] text-[9px] py-4 text-right pr-6 w-[180px]">Adjust Matrix</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingUsers ? (
                    <TableRow><TableCell colSpan={4} className="p-8 text-center text-xs">Querying active user wallets...</TableCell></TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="p-8 text-center text-xs text-[var(--text-secondary)]">No users found matching query.</TableCell></TableRow>
                  ) : filteredUsers.map((u) => {
                    const isCurrentUserEditing = editingUser?.uid === u.uid;
                    return (
                      <TableRow key={u.uid} className="group hover:bg-black/[0.01] dark:hover:bg-white/[0.01] border-black/[0.04] dark:border-white/[0.04] h-16">
                        <TableCell className="pl-6">
                          <div>
                            <span className="font-semibold text-xs text-[var(--text-primary)] dark:text-white block leading-tight">{u.displayName || "Anonymous Account"}</span>
                            <span className="text-[10px] font-mono text-[var(--text-secondary)]">{u.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold text-xs text-[var(--text-primary)] dark:text-white">
                          {isCurrentUserEditing ? (
                            <input 
                              type="number" 
                              className="w-16 h-8 rounded-lg bg-[var(--text-primary)] dark:bg-white/5 border border-black/[0.06] dark:border-white/[0.06] text-center font-bold text-xs outline-none"
                              value={newCredits}
                              onChange={(e) => setNewCredits(parseInt(e.target.value) || 0)}
                            />
                          ) : (
                            u.credits ?? 3
                          )}
                        </TableCell>
                        <TableCell className="text-center font-bold text-xs text-[var(--text-primary)] dark:text-white">
                          {isCurrentUserEditing ? (
                            <input 
                              type="number" 
                              className="w-16 h-8 rounded-lg bg-[var(--text-primary)] dark:bg-white/5 border border-black/[0.06] dark:border-white/[0.06] text-center font-bold text-xs outline-none"
                              value={newFeatured}
                              onChange={(e) => setNewFeatured(parseInt(e.target.value) || 0)}
                            />
                          ) : (
                            u.featuredCredits ?? 0
                          )}
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          {isCurrentUserEditing ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button variant="ghost" size="icon" className="text-apple-red hover:bg-apple-red/10 rounded-xl h-8 w-8" onClick={() => setEditingUser(null)}><X className="w-3.5 h-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="text-apple-green hover:bg-apple-green/10 rounded-xl h-8 w-8" onClick={handleUserBalanceSave}><Check className="w-3.5 h-3.5" /></Button>
                            </div>
                          ) : (
                            <Button 
                              variant="ghost" 
                              className="font-bold text-[10px] text-apple-blue hover:bg-apple-blue/10 rounded-lg py-1 h-7 px-3 uppercase tracking-wider transition-all"
                              onClick={() => {
                                setEditingUser(u);
                                setNewCredits(u.credits ?? 3);
                                setNewFeatured(u.featuredCredits ?? 0);
                              }}
                            >
                              Edit Balances
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced pricing configuration modal with dynamic interactive live preview */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[92vw] lg:max-w-5xl h-[85vh] max-h-[85vh] p-0 overflow-hidden border-none rounded-[2.5rem] bg-white dark:bg-[var(--text-primary)] shadow-2xl flex flex-col">
          <Tabs defaultValue="configure" className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <header className="p-6 border-b border-apple-border/10 flex items-center justify-between bg-neutral-50 dark:bg-white/[0.02] shrink-0">
              <div className="flex items-center gap-4">
                <div 
                  className="h-16 w-16 rounded-2xl border border-apple-border/10 shadow-sm shrink-0 flex items-center justify-center text-white text-2xl font-black transition-colors duration-500"
                  style={{ backgroundColor: prevColorTheme || 'var(--accent)' }}
                >
                  {prevSegment === 'company' ? (
                    <Building2 className="w-7 h-7 text-white animate-pulse" />
                  ) : prevSegment === 'dealer' ? (
                    <Briefcase className="w-7 h-7 text-white" />
                  ) : (
                    <User className="w-7 h-7 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white leading-tight flex items-center gap-2">
                    {prevName || "Configure Service Plan"}
                    {prevIsPopular && <Sparkles className="w-5 h-5 text-apple-orange animate-pulse" />}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <Badge className="px-2 py-0.5 rounded-full border-none text-[8px] uppercase font-black tracking-widest text-white bg-apple-blue shadow-none">
                      {prevSegment === 'user' ? "👤 Individual" : prevSegment === 'dealer' ? "💼 Dealer" : "🏢 Company"} Segment
                    </Badge>
                    <Badge className="bg-purple-600 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border-none">
                      {prevBilling === 'once' ? 'One-time investment' : `${prevBilling} cycle`}
                    </Badge>
                    {prevBadgeText && (
                      <Badge className="bg-apple-orange text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border-none">
                        {prevBadgeText}
                      </Badge>
                    )}
                    <Badge className="bg-apple-green text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border-none">
                      PKR {prevPrice.toLocaleString()}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <TabsList className="bg-[var(--text-primary)] dark:bg-white/5 p-1 rounded-xl">
                  <TabsTrigger value="configure" className="rounded-lg text-xs font-bold px-3 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-apple-surface data-[state=active]:text-apple-blue flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" /> Plan Configurations
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="rounded-lg text-xs font-bold px-3 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-apple-surface data-[state=active]:text-apple-blue flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Sandbox & Economics
                  </TabsTrigger>
                </TabsList>
                <Button variant="ghost" className="rounded-full h-8 w-8 p-0 hover:bg-[var(--text-primary)] dark:hover:bg-white/5 flex items-center justify-center text-xs" onClick={() => setIsModalOpen(false)}>
                  ✕
                </Button>
              </div>
            </header>

            {/* Tab 1: Configuration Form */}
            <TabsContent value="configure" className="flex-1 overflow-hidden m-0 outline-none flex flex-col">
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
                {/* Upper description / help banner matching User Dossier style */}
                <div className="bg-[var(--text-primary)] dark:bg-white/[0.02] p-6 rounded-3xl border border-apple-border/5 space-y-2">
                  <h3 className="text-sm font-bold flex items-center gap-1.5 text-apple-blue">
                    <Sliders className="w-4 h-4" /> Comprehensive Service Plan Architect
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                    Modify the attributes of this monetization template. Adjust price rates, validity parameters, direct WhatsApp routing, Rest API sync states, image upload buffers, and custom CSS brand colors. These settings deploy reactively across the live client ecosystem.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Column 1: Core Parameters & Aesthetics */}
                  <div className="space-y-6">
                    <div className="p-6 rounded-[2rem] bg-[var(--text-primary)] dark:bg-white/[0.02] border border-apple-border/5 space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-text-muted flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5 text-apple-blue" /> Core Identity & Branding
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1 pl-0.5">Tier Name</label>
                          <Input 
                            value={prevName}
                            onChange={(e) => setPrevName(e.target.value)}
                            className="bg-white dark:bg-apple-text border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-medium" 
                            placeholder="e.g. Dealer Elite Pro" 
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1 pl-0.5">Price (PKR)</label>
                            <Input 
                              type="number"
                              value={prevPrice}
                              onChange={(e) => setPrevPrice(Number(e.target.value))}
                              className="bg-white dark:bg-apple-text border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-bold" 
                              placeholder="0 for Free" 
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1 pl-0.5">Theme Color Accent</label>
                            <div className="flex gap-2">
                              <input 
                                type="color" 
                                value={prevColorTheme}
                                onChange={(e) => setPrevColorTheme(e.target.value)}
                                className="w-10 h-9 p-0 rounded-lg border border-apple-border/15 cursor-pointer overflow-hidden outline-none bg-transparent" 
                              />
                              <Input 
                                value={prevColorTheme}
                                onChange={(e) => setPrevColorTheme(e.target.value)}
                                className="bg-white dark:bg-apple-text border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-mono text-xs font-bold flex-1" 
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1 pl-0.5">Badge Ribbon Message</label>
                            <Input 
                              value={prevBadgeText}
                              onChange={(e) => setPrevBadgeText(e.target.value)}
                              className="bg-white dark:bg-apple-text border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-medium" 
                              placeholder="e.g. Most Popular" 
                            />
                          </div>
                          <div className="flex items-center">
                            <label className="flex items-center gap-2 p-2.5 bg-white dark:bg-apple-text border border-apple-border/10 rounded-xl cursor-pointer select-none w-full h-[38px] mt-4">
                              <input 
                                type="checkbox" 
                                checked={prevIsPopular} 
                                onChange={(e) => setPrevIsPopular(e.target.checked)} 
                                className="accent-apple-blue w-4 h-4 rounded-md"
                              />
                              <span className="text-[10px] font-bold text-stone-800 dark:text-apple-gray">Promote Popular</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1 pl-0.5">Description Statement</label>
                          <textarea 
                            value={prevDescription}
                            onChange={(e) => setPrevDescription(e.target.value)}
                            rows={2}
                            className="w-full bg-white dark:bg-apple-text border border-apple-border/10 p-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-apple-blue/30 text-stone-900 dark:text-apple-gray placeholder:text-[var(--text-secondary)]/60 h-20 outline-none transition-all resize-none"
                            placeholder="Provide a detailed sales pitch / descriptive highlight..."
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-[2rem] bg-[var(--text-primary)] dark:bg-white/[0.02] border border-apple-border/5 space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-text-muted flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-apple-orange" /> Segment & Billing Terms
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1 pl-0.5">Target Audience</label>
                          <select 
                            value={prevSegment}
                            onChange={(e: any) => setPrevSegment(e.target.value)}
                            className="w-full bg-white dark:bg-apple-text border border-apple-border/10 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-apple-blue/30 h-10 text-stone-900 dark:text-apple-gray outline-none"
                          >
                            <option value="user">Individual User</option>
                            <option value="dealer">Automotive Dealer</option>
                            <option value="company">Corporate Enterprise</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1 pl-0.5">Billing Schedule</label>
                          <select 
                            value={prevBilling}
                            onChange={(e: any) => setPrevBilling(e.target.value)}
                            className="w-full bg-white dark:bg-apple-text border border-apple-border/10 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-apple-blue/30 h-10 text-stone-900 dark:text-apple-gray outline-none"
                          >
                            <option value="once">One-time Payment</option>
                            <option value="monthly">Monthly Subscription</option>
                            <option value="yearly">Yearly Commitment</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1 pl-0.5">Validity Days</label>
                          <Input 
                            type="number"
                            value={prevValidity}
                            onChange={(e) => setPrevValidity(Number(e.target.value))}
                            className="bg-white dark:bg-apple-text border-apple-border/10 h-10 focus-visible:ring-apple-blue/20 rounded-xl font-bold" 
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Allocations, SLA & Advanced Switches */}
                  <div className="space-y-6">
                    <div className="p-6 rounded-[2rem] bg-[var(--text-primary)] dark:bg-white/[0.02] border border-apple-border/5 space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-text-muted flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-apple-green" /> Performance Limits & Allocations
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1 pl-0.5">Listings Limit</label>
                          <Input 
                            type="number"
                            value={prevListingLimit}
                            onChange={(e) => setPrevListingLimit(Number(e.target.value))}
                            className="bg-white dark:bg-apple-text border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-bold" 
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1 pl-0.5">Featured Tokens</label>
                          <Input 
                            type="number"
                            value={prevFeaturedLimit}
                            onChange={(e) => setPrevFeaturedLimit(Number(e.target.value))}
                            className="bg-white dark:bg-apple-text border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-bold" 
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1 pl-0.5">Image Limit/Listing</label>
                          <Input 
                            type="number"
                            value={prevImageLimit}
                            onChange={(e) => setPrevImageLimit(Number(e.target.value))}
                            className="bg-white dark:bg-apple-text border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-bold" 
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1 pl-0.5">Auto-Bump (Days)</label>
                          <Input 
                            type="number"
                            value={prevBoostInterval}
                            onChange={(e) => setPrevBoostInterval(Number(e.target.value))}
                            className="bg-white dark:bg-apple-text border-apple-border/10 focus-visible:ring-apple-blue/20 rounded-xl font-bold" 
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-[2rem] bg-[var(--text-primary)] dark:bg-white/[0.02] border border-apple-border/5 space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-text-muted flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-500" /> Enterprise SLA & Integrations
                      </h4>
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1 pl-0.5">Support SLA Level</label>
                          <select 
                            value={prevSla}
                            onChange={(e: any) => setPrevSla(e.target.value)}
                            className="w-full bg-white dark:bg-apple-text border border-apple-border/10 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-apple-blue/30 h-10 text-stone-900 dark:text-apple-gray outline-none"
                          >
                            <option value="none">Standard (No SLA)</option>
                            <option value="24h">24-Hour SLA Response</option>
                            <option value="4h">4-Hour Priority Response</option>
                            <option value="1h">1-Hour Enterprise Response</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1 pl-0.5">Team Slots Count</label>
                          <Input 
                            type="number"
                            value={prevTeamSlots}
                            onChange={(e) => setPrevTeamSlots(Number(e.target.value))}
                            className="bg-white dark:bg-apple-text border-apple-border/10 h-10 focus-visible:ring-apple-blue/20 rounded-xl font-bold" 
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-apple-border/5">
                        <span className="text-[8px] font-black uppercase text-[var(--text-secondary)] block tracking-wider">Communication & Tech Overrides</span>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {[
                            { state: prevVideoAllowed, setter: setPrevVideoAllowed, label: "Videos Allowed" },
                            { state: prevApiSync, setter: setPrevApiSync, label: "REST API Sync" },
                            { state: prevCrm, setter: setPrevCrm, label: "Leads CRM Sync" },
                            { state: prevWhatsApp, setter: setPrevWhatsApp, label: "WhatsApp CTA" },
                            { state: prevBanner, setter: setPrevBanner, label: "Sponsored Ads" }
                          ].map((item, idx) => (
                            <label key={idx} className="flex items-center gap-2 p-2 bg-white dark:bg-apple-text border border-apple-border/10 rounded-xl cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={item.state} 
                                onChange={(e) => item.setter(e.target.checked)} 
                                className="accent-apple-blue w-3.5 h-3.5 rounded"
                              />
                              <span className="text-[9px] font-bold text-stone-800 dark:text-apple-gray whitespace-nowrap leading-none">{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-[2rem] bg-[var(--text-primary)] dark:bg-white/[0.02] border border-apple-border/5 space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-apple-text-muted px-1 block">Custom Highlight Bullet Points (One Per Line)</label>
                      <textarea 
                        value={prevFeaturesText}
                        onChange={(e) => setPrevFeaturesText(e.target.value)}
                        placeholder="Unlimited Listings&#10;Direct WhatsApp CRM Connectivity&#10;Priority Front Row Placements"
                        className="w-full h-24 p-4 bg-white dark:bg-apple-text border border-apple-border/10 focus:border-apple-blue/30 rounded-3xl text-xs font-mono font-semibold focus:ring-0 outline-none text-stone-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Configure Save Footer */}
              <footer className="p-6 border-t border-apple-border/10 bg-neutral-50 dark:bg-white/[0.02] flex justify-end gap-3 shrink-0 flex-wrap">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="rounded-xl px-5 font-bold text-xs hover:bg-[var(--text-primary)] dark:hover:bg-white/5" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  className="rounded-xl px-5 font-bold text-xs bg-apple-blue hover:bg-apple-blue/90 text-white border-none shadow-lg shadow-apple-blue/15 active:scale-95" 
                  onClick={handleSavePlan}
                >
                  {editingPlan ? "Save Overrule Changes" : "Create Monitored Tier"}
                </Button>
              </footer>
            </TabsContent>

            {/* Tab 2: Sandbox & Economics */}
            <TabsContent value="preview" className="flex-1 overflow-hidden m-0 outline-none flex flex-col">
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
                {/* Upper description */}
                <div className="bg-[var(--text-primary)] dark:bg-white/[0.02] p-6 rounded-3xl border border-apple-border/5 space-y-2">
                  <h3 className="text-sm font-bold flex items-center gap-1.5 text-apple-orange">
                    <Sparkles className="w-4 h-4 animate-spin text-apple-orange" style={{ animationDuration: '4s' }} /> Real-Time Economy & Financial Simulator
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                    Simulate how this service plan behaves inside the live ecosystem. Adjust subscribers and observe projected Monthly Recurring Revenue (MRR), Annual Recurring Revenue (ARR), total listings volume managed, and SLA support burdens.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {/* Left Column: Plan Card Preview */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-apple-text-muted px-1">Customer-Facing Plan Card Visualizer</h4>
                    
                    <div className="relative bg-white dark:bg-[var(--bg-raised)] rounded-[2rem] p-8 border border-apple-border/10 shadow-xl overflow-hidden group">
                      {/* Accent light flare */}
                      <div 
                        className="absolute -top-16 -right-16 w-32 h-32 rounded-full filter blur-3xl opacity-15 transition-all duration-700" 
                        style={{ backgroundColor: prevColorTheme }} 
                      />

                      {/* Popular ribbon */}
                      {prevBadgeText && (
                        <div className="flex justify-end mb-4">
                          <span 
                            className="text-[8px] font-black tracking-widest uppercase px-3 py-1 rounded-full text-white shadow-sm animate-pulse" 
                            style={{ backgroundColor: prevColorTheme }}
                          >
                            {prevBadgeText}
                          </span>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <h4 className="text-lg font-black text-[var(--text-primary)] dark:text-white flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full shrink-0 animate-bounce" style={{ backgroundColor: prevColorTheme }} />
                          {prevName || "Premium Tier Template"}
                        </h4>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-apple-text-muted block">
                          {prevSegment === 'user' ? "👤 seller plan" : prevSegment === 'dealer' ? "💼 dealer license" : "🏢 enterprise fleet"}
                        </span>
                        <p className="text-xs leading-relaxed text-[var(--text-secondary)] dark:text-apple-text-muted font-medium pt-1">
                          {prevDescription || "Provide description statement..."}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="mt-6 space-y-0.5">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black tracking-tight text-[var(--text-primary)] dark:text-white">
                            PKR {prevPrice.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold text-apple-text-muted uppercase tracking-wider block">
                          {prevBilling === 'once' ? 'One-time Payment' : `Billed ${prevBilling}`}
                        </span>
                        <span className="text-[9px] text-[var(--text-secondary)] block mt-0.5">
                          Ecosystem Validity: {prevValidity} Days
                        </span>
                      </div>

                      {/* Limits Grid */}
                      <div className="mt-6 pt-5 border-t border-apple-border/5 grid grid-cols-2 gap-3.5 text-xs font-semibold text-[var(--text-primary)] dark:text-apple-border">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-apple-blue shrink-0" />
                          <span>{prevListingLimit === 9999 ? "Unlimited" : prevListingLimit} Ads Limit</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-apple-orange shrink-0 animate-pulse" />
                          <span>{prevFeaturedLimit} Featured Tkns</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Image className="w-4 h-4 text-apple-green shrink-0" />
                          <span>{prevImageLimit} Image Buffer</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-purple-500 shrink-0" />
                          <span>{prevVideoAllowed ? "HD Video Slides" : "Static Images"}</span>
                        </div>
                      </div>

                      {/* Feature Bullet Checklist */}
                      <div className="mt-6 pt-5 border-t border-apple-border/5 space-y-2.5">
                        {prevFeaturesText ? prevFeaturesText.split('\n').filter(Boolean).map((feat, fidx) => (
                          <div key={fidx} className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] dark:text-apple-text-muted font-medium">
                            <CheckCircle2 className="w-4 h-4 text-apple-green shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        )) : (
                          <div className="text-[10px] text-[var(--text-secondary)] italic">No active custom points configured.</div>
                        )}
                      </div>

                      {/* Integrations checklist */}
                      <div className="mt-6 pt-5 border-t border-apple-border/5 space-y-2">
                        {prevApiSync && (
                          <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-purple-500 uppercase animate-pulse">
                            <Database className="w-4 h-4 shrink-0" /> API Synchronizer Active
                          </div>
                        )}
                        {prevCrm && (
                          <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-apple-blue uppercase">
                            <TrendingUp className="w-4 h-4 shrink-0" /> Analytical Leads CRM
                          </div>
                        )}
                        {prevWhatsApp && (
                          <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-apple-green uppercase">
                            <MessageSquare className="w-4 h-4 shrink-0" /> Click-to-WhatsApp Leads
                          </div>
                        )}
                        {prevBanner && (
                          <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-apple-orange uppercase">
                            <Sparkles className="w-4 h-4 shrink-0 animate-pulse" /> Sponsored Carousel Banner
                          </div>
                        )}
                        {prevSla !== 'none' && (
                          <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-[var(--text-secondary)] uppercase">
                            <ShieldCheck className="w-4 h-4 shrink-0" /> Dedicated SLA Response: {prevSla}
                          </div>
                        )}
                        {prevTeamSlots > 1 && (
                          <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-[var(--text-secondary)] uppercase">
                            <Users className="w-4 h-4 shrink-0" /> {prevTeamSlots} Shared Team Seats
                          </div>
                        )}
                      </div>

                      <button 
                        className="w-full mt-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-black/10 transition-transform active:scale-95 cursor-not-allowed" 
                        style={{ backgroundColor: prevColorTheme }}
                        disabled
                      >
                        Subscribe to Tier
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Simulator panel */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-apple-text-muted px-1">Interactive Economic Simulator</h4>
                    
                    <div className="p-6 rounded-[2rem] bg-[var(--text-primary)] dark:bg-white/[0.02] border border-apple-border/5 space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center pl-0.5">
                          <label className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-wider">Simulated Subscribers</label>
                          <span className="text-sm font-black text-apple-blue">{simulatedUsers.toLocaleString()} Active</span>
                        </div>
                        <div className="flex items-center gap-4 bg-white dark:bg-apple-text p-3 rounded-2xl border border-apple-border/10">
                          <input 
                            type="range" 
                            min="0" 
                            max="2500" 
                            step="10"
                            value={simulatedUsers} 
                            onChange={(e) => setSimulatedUsers(Number(e.target.value))}
                            className="flex-1 accent-apple-blue h-1 cursor-pointer"
                          />
                          <input 
                            type="number" 
                            min="0" 
                            max="50000" 
                            value={simulatedUsers} 
                            onChange={(e) => setSimulatedUsers(Math.max(0, Number(e.target.value)))}
                            className="w-16 text-center text-xs font-bold bg-transparent border-b border-apple-border/10 focus:outline-none text-stone-800 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-apple-border/5">
                        <span className="text-[8px] font-black uppercase text-[var(--text-secondary)] tracking-widest block">Monetization Projection Registers</span>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-4 rounded-2xl bg-white dark:bg-apple-text border border-apple-border/10">
                            <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase block">Monthly Revenue (MRR)</span>
                            <span className="text-sm font-extrabold text-[var(--text-primary)] dark:text-white mt-1.5 block">
                              PKR {(simulatedUsers * prevPrice).toLocaleString()}
                            </span>
                          </div>

                          <div className="p-4 rounded-2xl bg-white dark:bg-apple-text border border-apple-border/10">
                            <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase block">Annual Run Rate (ARR)</span>
                            <span className="text-sm font-extrabold text-apple-green mt-1.5 block">
                              PKR {(simulatedUsers * prevPrice * 12).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-4 rounded-2xl bg-white dark:bg-apple-text border border-apple-border/10">
                            <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase block">Platform Ad Load Limit</span>
                            <span className="text-sm font-bold text-stone-800 dark:text-apple-border mt-1.5 block">
                              {prevListingLimit === 9999 ? "Infinite" : (simulatedUsers * prevListingLimit).toLocaleString()} listings
                            </span>
                          </div>

                          <div className="p-4 rounded-2xl bg-white dark:bg-apple-text border border-apple-border/10">
                            <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase block">Image Assets Server Load</span>
                            <span className="text-sm font-bold text-stone-800 dark:text-apple-border mt-1.5 block">
                              {(simulatedUsers * (prevListingLimit === 9999 ? 100 : prevListingLimit) * prevImageLimit).toLocaleString()} files
                            </span>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white dark:bg-apple-text border border-apple-border/10 flex justify-between items-center">
                          <div>
                            <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase block">Support SLA Load Level</span>
                            <span className="text-xs font-bold text-[var(--text-primary)] dark:text-white mt-1 block">
                              {prevSla === 'none' ? 'Standard Queue (No SLA)' : `${prevSla} Priority SLA`}
                            </span>
                          </div>
                          <Badge className={cn(
                            "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border-none text-white",
                            prevSla === '1h' ? "bg-apple-red" :
                            prevSla === '4h' ? "bg-apple-orange" :
                            prevSla === '24h' ? "bg-apple-blue" : "bg-[var(--text-secondary)]"
                          )}>
                            {prevSla === 'none' ? 'Standard' : 'Escalated'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Tab Save Footer */}
              <footer className="p-6 border-t border-apple-border/10 bg-neutral-50 dark:bg-white/[0.02] flex justify-end gap-3 shrink-0 flex-wrap">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="rounded-xl px-5 font-bold text-xs hover:bg-[var(--text-primary)] dark:hover:bg-white/5" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Close Sandbox
                </Button>
                <Button 
                  type="button"
                  className="rounded-xl px-5 font-bold text-xs bg-apple-blue hover:bg-apple-blue/90 text-white border-none shadow-lg shadow-apple-blue/15 active:scale-95" 
                  onClick={handleSavePlan}
                >
                  {editingPlan ? "Commit Sandbox Overrides" : "Create Monitored Tier"}
                </Button>
              </footer>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
