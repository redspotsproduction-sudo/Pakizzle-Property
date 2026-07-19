import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Check, 
  Car, 
  ShieldCheck, 
  Zap, 
  Crown, 
  Globe, 
  MessageSquare, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  CreditCard,
  History,
  Lock,
  Star,
  Plus
} from "lucide-react";
import { pricingService } from "../services/pricingService";
import { PricingPlan } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "../lib/utils";
import Header from "./Header";
import Footer from "./Footer";

export default function Pricing() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    fetchPlans();
    window.scrollTo(0, 0);
  }, []);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const data = await pricingService.getPlans();
      setPlans(data.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (e) {
      console.error("Failed to load pricing matrix");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#000000] text-apple-text selection:bg-apple-blue selection:text-white overflow-x-hidden">
      <Header />
      
      <main className="pt-24 pb-32">
        {/* Hero Section */}
        <section className="relative px-6 pt-20 pb-20 md:pt-32 md:pb-40 text-center">
            {/* Background Sophistication */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-apple-blue/10 blur-[120px] rounded-full opacity-50 dark:opacity-20" />
                <div className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Badge className="bg-apple-blue/10 text-apple-blue border-none px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm">PAKIZZLE PRESTIGE</Badge>
                  <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-[0.9] text-apple-text">
                    Choose your <br className="hidden md:block" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-apple-blue via-apple-blue to-purple-500 animate-gradient">trajectory.</span>
                  </h1>
                </motion.div>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="text-xl md:text-2xl text-apple-text-muted max-w-2xl mx-auto font-medium leading-relaxed"
                >
                  Architectural pricing designed for single sellers and enterprise-level dealerships. Transparent, powerful, and built for speed.
                </motion.p>
            </div>
        </section>

        {/* Pricing Matrix */}
        <section className="px-6 max-w-7xl lg:max-w-[1440px] mx-auto">
          {/* Cycle Toggle */}
          <div className="flex justify-center mb-20">
            <div className="bg-apple-gray dark:bg-white/5 p-1.5 rounded-[22px] flex items-center border border-apple-border/10 backdrop-blur-3xl shadow-xl">
              <button 
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  "px-8 py-3 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all duration-500",
                  billingCycle === 'monthly' ? "bg-white dark:bg-white/10 text-apple-text shadow-apple-soft" : "text-apple-text-muted hover:text-apple-text"
                )}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBillingCycle('yearly')}
                className={cn(
                  "px-8 py-3 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2",
                  billingCycle === 'yearly' ? "bg-white dark:bg-white/10 text-apple-text shadow-apple-soft" : "text-apple-text-muted hover:text-apple-text"
                )}
              >
                Annual <span className="bg-apple-green text-white text-[9px] px-2 py-0.5 rounded-full pulse">Save 20%</span>
              </button>
            </div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12"
          >
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                variants={itemVariants}
                className={cn(
                  "relative group flex flex-col h-full",
                  plan.isPopular && "z-10"
                )}
              >
                {plan.isPopular && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gradient-to-r from-apple-blue to-purple-500 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(0,122,255,0.3)] pointer-events-none whitespace-nowrap">
                    <Sparkles className="w-3.5 h-3.5" /> {plan.badgeText || "Most Popular"}
                  </div>
                )}

                <div className={cn(
                  "flex-1 p-10 md:p-14 rounded-[40px] border transition-all duration-700 bg-white dark:bg-[#1D1D1F] flex flex-col group/card relative overflow-hidden",
                  plan.isPopular 
                    ? "border-apple-blue/50 dark:border-apple-blue/20 shadow-[0_50px_100px_rgba(0,0,0,0.05)] scale-105" 
                    : "border-apple-border/10 hover:border-apple-blue/20 shadow-sm"
                )}>
                  {/* Hover Sophistication */}
                  <div className="absolute inset-0 bg-gradient-to-br from-apple-blue/[0.03] to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  
                  <div className="mb-12 relative">
                    <div className={cn(
                      "w-16 h-16 rounded-3xl flex items-center justify-center mb-8 shadow-2xl transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3",
                      plan.isPopular ? "bg-apple-blue text-white shadow-apple-blue/20" : "bg-apple-gray dark:bg-white/5 text-apple-text"
                    )}>
                      {index === 0 ? <Car className="w-8 h-8" /> : index === 1 ? <Zap className="w-8 h-8" /> : <Crown className="w-8 h-8" />}
                    </div>
                    <h3 className="text-3xl font-black tracking-tight mb-4">{plan.name}</h3>
                    <p className="text-apple-text-muted font-medium text-sm leading-relaxed min-h-[48px] line-clamp-2">{plan.description}</p>
                  </div>

                  <div className="mb-12 relative flex items-baseline gap-2">
                    <span className="text-5xl md:text-6xl font-black text-apple-text tracking-tighter">
                       {plan.price === 0 ? "Free" : `${plan.currency} ${Math.round(billingCycle === 'yearly' ? plan.price * 0.8 : plan.price).toLocaleString()}`}
                    </span>
                    {plan.price > 0 && <span className="text-apple-text-muted font-black text-xs uppercase tracking-widest">/ {plan.billingCycle}</span>}
                  </div>

                  <div className="flex-1 space-y-5 mb-14">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-4 group/feature transition-all">
                        <div className="mt-1 w-5 h-5 rounded-full bg-apple-green/10 flex items-center justify-center shrink-0 group-hover/feature:bg-apple-green/20 group-hover/feature:scale-110 transition-all">
                          <Check className="w-3.5 h-3.5 text-apple-green stroke-[4]" />
                        </div>
                        <span className="text-sm font-bold text-apple-text tracking-tight opacity-80 group-hover/feature:opacity-100 transition-opacity">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className={cn(
                      "w-full h-16 rounded-[24px] font-black uppercase tracking-widest text-xs transition-all duration-500 flex items-center justify-center group shadow-2xl",
                      plan.isPopular 
                        ? "apple-button-primary scale-100 group-hover:scale-[1.02] shadow-apple-blue/20" 
                        : "bg-apple-gray dark:bg-white/5 border border-apple-border/20 text-apple-text hover:bg-apple-blue hover:text-white"
                    )}
                  >
                    Select Architecture <ArrowRight className="w-4 h-4 ml-3 opacity-0 group-hover:translate-x-2 group-hover:opacity-100 transition-all duration-500" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Feature Grid - Apple Level */}
        <section className="px-6 py-40 max-w-7xl lg:max-w-[1440px] mx-auto">
           <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8 leading-tight">Built for the <br className="hidden md:block" /> elite economy.</h2>
              <p className="text-apple-text-muted text-lg md:text-xl font-medium max-w-2xl mx-auto">Unmatched performance metrics and architectural stability for every interaction.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: 'Global Identity', desc: 'Secure blockchain-inspired identity verification for every dealer.', icon: Globe, color: 'text-apple-blue', bg: 'bg-apple-blue/5' },
                { title: 'Sentinel Radar', desc: 'Advanced AI monitoring 24/7 to prevent fraudulent listings.', icon: ShieldCheck, color: 'text-apple-green', bg: 'bg-apple-green/5' },
                { title: 'Neural Response', desc: 'Instant chat architecture with integrated WhatsApp shards.', icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-500/5' },
                { title: 'Market Alpha', desc: 'Priority access to trending price fluctuations and deep data.', icon: TrendingUp, color: 'text-apple-orange', bg: 'bg-apple-orange/5' },
              ].map((feat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.8 }}
                  className="p-10 rounded-[32px] bg-apple-gray/30 dark:bg-[#1D1D1F] border border-apple-border/10 hover:border-apple-blue/20 transition-all duration-700"
                >
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-sm", feat.bg)}>
                    <feat.icon className={cn("w-7 h-7", feat.color)} />
                  </div>
                  <h4 className="text-xl font-black tracking-tight mb-4">{feat.title}</h4>
                  <p className="text-sm font-medium text-apple-text-muted leading-relaxed">{feat.desc}</p>
                </motion.div>
              ))}
           </div>
        </section>

        {/* FAQ - Specialized UI */}
        <section className="px-6 py-20 bg-apple-gray/20 dark:bg-white/[0.02] border-t border-apple-border/10">
           <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                 <h2 className="text-3xl md:text-5xl font-black tracking-tight">Protocol Intel</h2>
                 <p className="text-apple-text-muted font-bold text-xs uppercase tracking-widest mt-4">Frequently Asked Questions</p>
              </div>

              <div className="space-y-6">
                 {[
                   { q: "Can I upgrade my tier mid-cycle?", a: "Yes. Our neural billing engine calculates pro-rated consumption automatically." },
                   { q: "Is the identity verification mandatory?", a: "For Dealer Pro accounts, full architectural verification is required to maintain ecosystem trust." },
                   { q: "How do featured listings impact my rank?", a: "They are pushed to the Top Shard, bypassing 90% of standard results for maximum velocity." },
                   { q: "Support protocol response times?", a: "Basic tiers within 24h, Premium within 4h, Dealer Pro has instant satellite access." },
                 ].map((faq, i) => (
                   <div key={i} className="group p-8 rounded-[28px] bg-white dark:bg-[#1D1D1F] border border-apple-border/10 hover:border-apple-blue/20 transition-all duration-700 cursor-default">
                      <div className="flex items-center justify-between mb-4">
                         <h4 className="text-lg font-black tracking-tight">{faq.q}</h4>
                         <div className="w-8 h-8 rounded-full bg-apple-gray dark:bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-apple-blue/10 transition-all">
                            <Plus className="w-4 h-4 text-apple-text-muted group-hover:text-apple-blue" />
                         </div>
                      </div>
                      <p className="text-sm font-medium text-apple-text-muted leading-relaxed opacity-0 group-hover:opacity-100 transition-all duration-700 max-h-0 group-hover:max-h-24 overflow-hidden">
                         {faq.a}
                      </p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 py-32 text-center">
            <div className="max-w-4xl mx-auto rounded-[60px] bg-[#1D1D1F] p-16 md:p-32 text-white relative overflow-hidden shadow-3xl border-none">
                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                    <Sparkles className="w-full h-full scale-110 -rotate-12 translate-x-1/4" />
                </div>
                <div className="relative z-10">
                   <h2 className="text-4xl md:text-7xl font-black tracking-tight mb-8 leading-tight">Ready to <br className="hidden md:block" /> accelerate?</h2>
                   <p className="text-white/60 text-lg md:text-xl font-medium mb-12">Join 150,000+ elite sellers across Pakistan.</p>
                   <Button className="h-20 px-16 rounded-[28px] bg-white text-black font-black uppercase tracking-[0.2em] text-xs hover:bg-apple-gray active:scale-95 transition-all shadow-3xl">Get Started Now</Button>
                </div>
            </div>
        </section>
      </main>

      <Footer onValuationClick={() => {}} />
    </div>
  );
}
