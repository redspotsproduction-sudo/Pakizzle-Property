import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Gem, 
  CreditCard, 
  BadgePercent, 
  DollarSign, 
  CheckCircle2, 
  Sparkles, 
  ArrowUpRight, 
  TrendingUp, 
  Flame, 
  ShieldCheck, 
  Info, 
  Layers, 
  Zap, 
  Check, 
  AlertCircle,
  HelpCircle,
  Clock,
  Car
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useVehicles } from "../../context/VehicleContext";
import { db } from "../../firebase";
import { doc, updateDoc, collection, addDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { formatPrice, cn } from "../../lib/utils";

const CREDIT_PACKAGES = [
  {
    id: "pkg_single",
    name: "Single Ad Upload Slot",
    description: "Ideal for individual private sellers listing in a restricted category.",
    price: 3500, // PKR
    credits: 1,
    featuredCredits: 0,
    features: [
      "1 Ad upload in any category",
      "Bypasses Crowded Category fees",
      "30-day listing duration",
      "Standard support"
    ],
    badge: "Basic Slot",
    icon: Car,
    color: "from-blue-500 to-cyan-500",
    accentColor: "bg-blue-500/10 text-apple-blue"
  },
  {
    id: "pkg_bronze",
    name: "Bronze Prestige Package",
    description: "Designed for small importers and luxury car swappers seeking momentum.",
    price: 9500, // PKR
    credits: 3,
    featuredCredits: 1,
    features: [
      "3 Ad uploads in any category",
      "1 Top Featured Spotlight (7 Days)",
      "Bypasses Crowded Category fees",
      "Standard Priority Support",
      "WhatsApp Instant Contact Button"
    ],
    badge: "Value Pack",
    isPopular: true,
    icon: Gem,
    color: "from-purple-500 to-pink-500",
    accentColor: "bg-purple-500/10 text-purple-500"
  },
  {
    id: "pkg_silver",
    name: "Platinum Ultimate Dealer",
    description: "Maximize sales volume with unlimited category clearance and extreme visibility.",
    price: 24500, // PKR
    credits: 10,
    featuredCredits: 4,
    features: [
      "10 Ad uploads in any category",
      "4 Top Featured Spotlights (7 Days)",
      "Bypasses Crowded Category fees",
      "VIP Dedicated Support Manager",
      "Interactive WhatsApp & Call Leads Stats",
      "Verified Dealer Profile Premium Badge"
    ],
    badge: "Dealer Best",
    icon: Sparkles,
    color: "from-amber-500 to-orange-500",
    accentColor: "bg-amber-500/10 text-amber-500"
  }
];

export default function UserCredits() {
  const { user, profile } = useAuth();
  const { vehicles, updateVehicle } = useVehicles();
  
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1 = input, 2 = animation, 3 = success
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");

  const userVehicles = useMemo(() => {
    if (!vehicles || !user) return [];
    return vehicles.filter(v => 
      v.seller?.uid === user.uid || 
      (v.seller?.name === "Redspots Productions" && user.email === "redspotsproduction@gmail.com")
    );
  }, [vehicles, user]);

  const activeCredits = profile?.credits ?? 3;
  const activeFeatured = profile?.featuredCredits ?? 0;

  const handleOpenCheckout = (pkg: any) => {
    setSelectedPackage(pkg);
    setCardName(profile?.displayName || "");
    setCheckoutStep(1);
    setIsCheckoutOpen(true);
  };

  const executePurchase = async () => {
    if (!selectedPackage || !user) return;
    setIsProcessing(true);
    setCheckoutStep(2);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const userDocRef = doc(db, "users", user.uid);
      const newCredits = activeCredits + selectedPackage.credits;
      const newFeatured = activeFeatured + selectedPackage.featuredCredits;

      await updateDoc(userDocRef, {
        credits: newCredits,
        featuredCredits: newFeatured
      });

      await addDoc(collection(db, "transactions"), {
        id: `TXN_${Date.now().toString().slice(-6)}`,
        userId: user.uid,
        userName: profile?.displayName || "Ecosystem Member",
        amount: selectedPackage.price,
        currency: 'PKR',
        status: 'completed',
        type: 'ad_credits_purchase',
        paymentMethod: { type: 'card', details: `**** ${cardNumber.slice(-4) || '4242'}` },
        createdAt: new Date().toISOString(),
        packageId: selectedPackage.id,
        packageName: selectedPackage.name
      });

      setCheckoutStep(3);
      toast.success(`Allocated +${selectedPackage.credits} Credits and +${selectedPackage.featuredCredits} featured slots!`);
    } catch (err: any) {
      console.error(err);
      toast.error("Security Gateway settlement failure. Please retry.");
      setCheckoutStep(1);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePromoteVehicle = async (vehicleId: string) => {
    if (activeFeatured <= 0) {
      toast.error("Purchase Featured Ad Credits to promote your vehicle.");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user!.uid);
      await updateDoc(userDocRef, {
        featuredCredits: activeFeatured - 1
      });

      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 7);

      await updateVehicle(vehicleId, {
        isFeatured: true,
        featuredUntil: expireDate.toISOString()
      } as any);

      toast.success("Ecosystem Match: Listing elevated to Featured Spotlight!");
    } catch (err: any) {
      console.error(err);
      toast.error("Elevation error. Contact terminal master.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <Sparkles className="w-3.5 h-3.5" />
            Seller Upgrades & Monetization
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-tight">
            Credits & Upgrades
          </h1>
          <p className="text-xs text-[#86868B] dark:text-[#86868B] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            Enhance ad visibility, manage token credits, and secure top rankings across Pakistan.
          </p>
        </div>
      </div>

      {/* Credit Balances Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ad Upload Credits */}
        <div className="relative overflow-hidden bg-white dark:bg-[#161617] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
          <div className="flex justify-between items-start mb-4">
            <div className="w-9 h-9 bg-blue-500/5 dark:bg-blue-500/10 text-apple-blue rounded-xl flex items-center justify-center shrink-0">
              <Car className="w-4.5 h-4.5" />
            </div>
            <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/5 dark:bg-blue-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Standard Slots
            </span>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-[#1D1D1F] dark:text-white">{activeCredits}</div>
            <div className="text-xs font-semibold text-[#1D1D1F] dark:text-white mt-1">Available Post Credits</div>
            <p className="text-[11px] text-[#86868B] mt-1.5 leading-relaxed font-normal">
              Required to list cars. Standard categories consume 1 credit, crowded high-volume categories consume 1 slot credit.
            </p>
          </div>
        </div>

        {/* Featured Ad Credits */}
        <div className="relative overflow-hidden bg-white dark:bg-[#161617] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
          <div className="flex justify-between items-start mb-4">
            <div className="w-9 h-9 bg-purple-500/5 dark:bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center shrink-0">
              <Flame className="w-4.5 h-4.5" />
            </div>
            <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/5 dark:bg-purple-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Premium Tokens
            </span>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-[#1D1D1F] dark:text-white">{activeFeatured}</div>
            <div className="text-xs font-semibold text-[#1D1D1F] dark:text-white mt-1">Available Top Banners</div>
            <p className="text-[11px] text-[#86868B] mt-1.5 leading-relaxed font-normal">
              Deduct 1 featured token to push your car to the home banner carousel and marketplace top search indexes for 7 days.
            </p>
          </div>
        </div>
      </div>

      {/* Crowded Categories Info Banner */}
      <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 rounded-2xl p-4.5 flex gap-3.5 items-start">
        <Info className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <h4 className="font-semibold text-amber-700 dark:text-amber-400 text-xs mb-0.5">
            Crowd-Control Category Rules Active
          </h4>
          <p className="text-amber-700/80 dark:text-amber-300/80 text-[11px] leading-relaxed font-normal">
            In order to preserve ecosystem clarity and prevent spam listings, highly competitive or crowded categories (such as Luxury Sports, SUVs, EVs) require paid credits or verified single-upload packages. Standard accounts require 1 credit to authorize listings in these categories.
          </p>
        </div>
      </div>

      {/* Select Upgrades / Bundles section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.08em] text-[#1D1D1F] dark:text-white">
            Purchase High-Velocity Credits
          </h2>
          <p className="text-[11px] text-[#86868B] font-normal mt-0.5">
            Acquire slots instantly via our premium simulated gateway. No actual funds are charged.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {CREDIT_PACKAGES.map((pkg) => {
            const Icon = pkg.icon;
            return (
              <div 
                key={pkg.id}
                className={cn(
                  "relative flex flex-col bg-white dark:bg-[#161617] border rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.01)] transition-all duration-300 hover:shadow-[0_12px_30px_rgba(0,0,0,0.02)]",
                  pkg.isPopular ? "border-apple-blue/30" : "border-black/[0.04] dark:border-white/[0.04]"
                )}
              >
                {pkg.isPopular && (
                  <div className="absolute top-4 right-4 bg-apple-blue text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    {pkg.badge}
                  </div>
                )}
                
                <div className="p-5 pb-3">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mb-4", pkg.accentColor)}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="text-sm font-semibold text-[#1D1D1F] dark:text-white mb-0.5">{pkg.name}</h4>
                  <p className="text-[11px] text-[#86868B] font-normal leading-relaxed min-h-[36px]">{pkg.description}</p>
                </div>

                <div className="px-5 py-3 bg-[#F5F5F7] dark:bg-white/[0.02] border-y border-black/[0.04] dark:border-white/[0.04] flex items-baseline gap-1">
                  <span className="text-[10px] font-bold text-[#86868B]">PKR</span>
                  <span className="text-xl font-bold text-[#1D1D1F] dark:text-white font-mono tracking-tight">
                    {pkg.price.toLocaleString()}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#86868B] ml-1">one-time</span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between gap-6">
                  <ul className="space-y-2.5">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex gap-2 text-[11px] font-medium text-[#1D1D1F] dark:text-white/95">
                        <CheckCircle2 className="w-3.5 h-3.5 text-apple-green mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleOpenCheckout(pkg)}
                    className={cn(
                      "w-full py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all active:scale-95 border-none",
                      pkg.isPopular 
                        ? "bg-apple-blue hover:bg-blue-600 text-white" 
                        : "bg-[#F5F5F7] dark:bg-white/5 hover:bg-black/10 text-[#1D1D1F] dark:text-white"
                    )}
                  >
                    Select Upgrade
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upgrade Active Listings Sections */}
      <div className="border-t border-black/[0.06] dark:border-white/[0.06] pt-6 space-y-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.08em] text-[#1D1D1F] dark:text-white">Promote My Active Ads</h2>
          <p className="text-[11px] text-[#86868B] font-normal mt-0.5">
            Pin listings to the home page spotlight banner instantly. Requires 1 Featured Token.
          </p>
        </div>

        {userVehicles.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-black/[0.06] dark:border-white/[0.06] rounded-2xl bg-[#F5F5F7]/30 dark:bg-white/[0.005]">
            <Car className="w-10 h-10 text-[#86868B] mx-auto mb-3" />
            <p className="text-xs font-semibold text-[#86868B]">No active vehicles registered to this seller account yet.</p>
            <Link to="/sell" className="inline-flex items-center gap-1.5 text-apple-blue font-bold text-[10px] uppercase tracking-wider mt-3 hover:underline">
              List Vehicle Now <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userVehicles.map((car) => (
              <div 
                key={car.id}
                className="bg-white dark:bg-[#161617] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between"
              >
                <div className="relative w-full aspect-[16/10] bg-[#1C1C1E] overflow-hidden">
                  {car.images?.[0] ? (
                    <img src={car.images[0]} alt={car.make} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="w-6 h-6 text-white/40" />
                    </div>
                  )}
                  {car.isFeatured && (
                    <span className="absolute top-3 left-3 bg-purple-600 text-white text-[8px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Flame className="w-3 h-3" /> Featured Spotlight
                    </span>
                  )}
                </div>

                <div className="p-4 flex-1">
                  <h4 className="text-xs font-semibold text-[#1D1D1F] dark:text-white truncate">
                    {car.year} {car.make} {car.model}
                  </h4>
                  <p className="text-xs font-bold font-mono text-apple-blue mt-0.5">
                    {formatPrice(car.price)}
                  </p>
                </div>

                <div className="p-4 border-t border-black/[0.04] dark:border-white/[0.04] bg-[#F5F5F7]/30 dark:bg-white/[0.005]">
                  {car.isFeatured ? (
                    <div className="w-full text-center py-2 bg-purple-500/5 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-[10px] rounded-lg tracking-wider uppercase">
                      Spotlight Enabled
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePromoteVehicle(car.id)}
                      disabled={car.isFeatured || activeFeatured <= 0}
                      className={cn(
                        "w-full py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all border-none shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                        activeFeatured > 0 
                          ? "bg-purple-600 hover:bg-purple-700 text-white" 
                          : "bg-[#F5F5F7] dark:bg-white/5 text-[#86868B]"
                      )}
                    >
                      {activeFeatured > 0 ? "Upgrade to Featured" : "Need Featured Token"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checkout Portal modal */}
      <AnimatePresence>
        {isCheckoutOpen && selectedPackage && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isProcessing && setIsCheckoutOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl z-15 flex flex-col outline-none"
            >
              {checkoutStep === 1 && (
                <div className="p-6">
                  <div className="text-center mb-5">
                    <span className="text-[8px] font-bold text-apple-blue uppercase tracking-widest bg-apple-blue/5 dark:bg-apple-blue/10 px-2.5 py-1 rounded-full">
                      PRESTIGE PAYMENT BRIDGE
                    </span>
                    <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-white mt-3">Authorized Ledger Transfer</h3>
                    <p className="text-xs text-[#86868B] mt-0.5">
                      Finalizing selection: <span className="font-semibold text-[#1D1D1F] dark:text-white">{selectedPackage.name}</span>
                    </p>
                  </div>

                  {/* Pricing Overview */}
                  <div className="bg-[#F5F5F7] dark:bg-white/[0.02] p-4 rounded-xl border border-black/[0.02] dark:border-white/[0.02] mb-5 flex justify-between items-center">
                    <div className="min-w-0">
                      <div className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Subtotal Value</div>
                      <div className="text-xs font-semibold text-[#1D1D1F] dark:text-white truncate">{selectedPackage.name}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">PKR</div>
                      <div className="text-lg font-bold text-apple-blue tracking-tight font-mono">
                        {selectedPackage.price.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Simulated Card Forms */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Holder Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 bg-[#F5F5F7] dark:bg-white/[0.02] text-xs outline-none focus:border-apple-blue"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Card Number</label>
                      <input 
                        type="text" 
                        maxLength={19}
                        className="w-full border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 bg-[#F5F5F7] dark:bg-white/[0.02] text-xs outline-none focus:border-apple-blue font-mono"
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Expiration Date</label>
                        <input 
                          type="text" 
                          maxLength={5}
                          className="w-full border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 bg-[#F5F5F7] dark:bg-white/[0.02] text-xs outline-none focus:border-apple-blue font-mono text-center"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">CVC Sign</label>
                        <input 
                          type="password" 
                          maxLength={3}
                          className="w-full border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 bg-[#F5F5F7] dark:bg-white/[0.02] text-xs outline-none focus:border-apple-blue font-mono text-center"
                          placeholder="***"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 mt-6 pt-5 border-t border-black/[0.06] dark:border-white/[0.06]">
                    <button
                      onClick={() => setIsCheckoutOpen(false)}
                      className="flex-1 py-2.5 bg-[#F5F5F7] dark:bg-white/5 hover:bg-black/10 text-[#1D1D1F] dark:text-white font-bold text-[10px] uppercase tracking-wider rounded-xl border-none"
                    >
                      Abort
                    </button>
                    <button
                      onClick={executePurchase}
                      disabled={!cardName}
                      className="flex-1 py-2.5 bg-apple-blue hover:bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl shadow-lg shadow-apple-blue/20 border-none active:scale-95 disabled:opacity-50"
                    >
                      Authorize Funds
                    </button>
                  </div>
                </div>
              )}

              {checkoutStep === 2 && (
                <div className="p-8 text-center flex flex-col items-center justify-center min-h-[280px]">
                  <div className="relative w-16 h-16 mb-4">
                    <div className="absolute inset-0 border-3 border-apple-blue/20 rounded-full" />
                    <div className="absolute inset-0 border-3 border-t-apple-blue rounded-full animate-spin" />
                    <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-apple-blue animate-pulse" />
                  </div>
                  <h4 className="text-sm font-semibold text-[#1D1D1F] dark:text-white mb-1.5">Resolving Ledger State</h4>
                  <p className="text-xs text-[#86868B] max-w-xs leading-relaxed font-normal">
                    Clearing funds through simulated prestige bridge and minting tokens reactive. Please hold connection.
                  </p>
                </div>
              )}

              {checkoutStep === 3 && (
                <div className="p-8 text-center flex flex-col items-center justify-center min-h-[280px]">
                  <div className="w-12 h-12 bg-apple-green/10 text-apple-green rounded-full flex items-center justify-center mb-4">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-semibold text-[#1D1D1F] dark:text-white mb-1.5">Settlement Consolidated</h4>
                  <p className="text-xs text-[#86868B] mb-6 max-w-xs leading-relaxed font-normal">
                    Authority matching success. Standard upload slots and Premium tokens are loaded to your seller credentials instantly.
                  </p>
                  <button
                    onClick={() => setIsCheckoutOpen(false)}
                    className="w-full py-2.5 bg-apple-blue text-white font-bold text-[10px] uppercase tracking-widest rounded-xl shadow-lg border-none active:scale-95"
                  >
                    View Status Ledger
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
