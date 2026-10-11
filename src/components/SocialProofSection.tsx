import React from "react";
import { motion } from "motion/react";
import { ShieldCheck, CheckCircle2, TrendingUp, Star, Building2, Award, Clock } from "lucide-react";
import { RevealOnScroll, AnimatedCounter, REVEAL_EASE } from "./motion";

interface ActivityItem {
  id: string;
  type: "sold" | "rented" | "verified";
  title: string;
  location: string;
  amount: string;
  timeAgo: string;
}

const RECENT_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    type: "sold",
    title: "1 Kanal Designer Villa",
    location: "DHA Phase 6, Lahore",
    amount: "Rs 7.85 Crore",
    timeAgo: "2 hours ago"
  },
  {
    id: "act-2",
    type: "verified",
    title: "10 Marla Possession Plot",
    location: "Sector B-17, Islamabad",
    amount: "CDA Registered",
    timeAgo: "4 hours ago"
  },
  {
    id: "act-3",
    type: "rented",
    title: "3-Bed Panoramic Ocean Flat",
    location: "Clifton Block 4, Karachi",
    amount: "Rs 2,80,000 / mo",
    timeAgo: "6 hours ago"
  },
  {
    id: "act-4",
    type: "sold",
    title: "Commercial Corner Plaza Floor",
    location: "Gulberg III, Lahore",
    amount: "Rs 14.2 Crore",
    timeAgo: "9 hours ago"
  },
  {
    id: "act-5",
    type: "verified",
    title: "500 Sq.Yd Architect Bungalow",
    location: "DHA Phase 5, Karachi",
    amount: "Shanakht™ Title Cleared",
    timeAgo: "11 hours ago"
  }
];

const TESTIMONIALS = [
  {
    quote: "Living in London, investing in Pakistan was always a nightmare of endless broker calls and disputed plot files. Pakizzle's Shanakht title check let us verify the DHA registry online and close with total peace of mind.",
    name: "Dr. Farhan Qureshi",
    role: "Overseas Buyer (UK)",
    verified: true,
    property: "Purchased 1 Kanal in DHA Phase 6 Lahore"
  },
  {
    quote: "No fake prices, no bait-and-switch. The valuation model estimated our Clifton apartment within 2% of the final sale price. Direct agency messaging without middleman spam is how real estate should work.",
    name: "Ayesha Jahangir",
    role: "Property Seller",
    verified: true,
    property: "Sold 3-Bed Ocean Residence in Karachi"
  },
  {
    quote: "The interactive plot map and FBR Section 236K tax calculator saved us Rs 1.4M in unexpected registry fees. The absolute gold standard for transparent real estate in Islamabad.",
    name: "Brigadier (R) Tariq Niazi",
    role: "Investor",
    verified: true,
    property: "Acquired Sector F-7 Master Residence"
  }
];

export default function SocialProofSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-apple-border dark:border-apple-surface">
      {/* 1. Live Market Activity Stream */}
      <RevealOnScroll direction="up" distance={30} duration={0.6} className="mb-14">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--apple-green)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--apple-green)]"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-apple-surface dark:text-apple-border">
              Live Verified Market Activity
            </span>
          </div>
          <span className="text-xs text-apple-text-muted font-medium">Real-time registry updates</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {RECENT_ACTIVITIES.map((act, index) => (
            <motion.div
              key={act.id}
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ duration: 0.2, ease: REVEAL_EASE }}
              className="p-3 rounded-xl border border-apple-border dark:border-apple-surface bg-white dark:bg-apple-text shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    act.type === "sold"
                      ? "bg-apple-green/10 dark:bg-apple-surface/40 text-apple-green dark:text-apple-green border border-apple-green/30 dark:border-apple-green"
                      : act.type === "rented"
                      ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                      : "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-apple-green border border-teal-200 dark:border-teal-800"
                  }`}>
                    {act.type === "sold" ? "Sold" : act.type === "rented" ? "Rented" : "Title Verified"}
                  </span>
                  <span className="text-[10px] text-apple-text-muted font-medium">{act.timeAgo}</span>
                </div>
                <h4 className="text-xs font-semibold text-apple-text dark:text-apple-gray line-clamp-1">
                  {act.title}
                </h4>
                <p className="text-[11px] text-apple-text-muted line-clamp-1 mt-0.5">
                  {act.location}
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-apple-gray dark:border-apple-surface flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--apple-green)] dark:text-apple-green">
                  {act.amount}
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--apple-green)]" />
              </div>
            </motion.div>
          ))}
        </div>
      </RevealOnScroll>

      {/* 2. Scale Credentials Banner with Eased Animated Counters */}
      <RevealOnScroll direction="up" distance={40} duration={0.65}>
        <div className="rounded-2xl bg-apple-text text-white p-6 md:p-8 mb-14 shadow-lg border border-white/5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-apple-surface">
            <div className="pt-4 md:pt-0">
              <div className="text-2xl md:text-3xl font-extrabold text-apple-green font-mono">
                <AnimatedCounter value={180} prefix="Rs " suffix="+ Cr" duration={1.2} />
              </div>
              <div className="text-xs text-apple-text-muted font-medium mt-1">
                Title-Verified Volume Facilitated
              </div>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-2xl md:text-3xl font-extrabold text-white font-mono">
                <AnimatedCounter value={14500} suffix="+" duration={1.2} />
              </div>
              <div className="text-xs text-apple-text-muted font-medium mt-1">
                Genuine Active Properties
              </div>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-2xl md:text-3xl font-extrabold text-white font-mono">
                <AnimatedCounter value={1450} suffix="+" duration={1.2} />
              </div>
              <div className="text-xs text-apple-text-muted font-medium mt-1">
                Certified Owners & Licensed Agencies
              </div>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-2xl md:text-3xl font-extrabold text-gold-decoration font-mono">
                0%
              </div>
              <div className="text-xs text-apple-text-muted font-medium mt-1">
                Tolerated Duplicate / Spam Listings
              </div>
            </div>
          </div>
        </div>
      </RevealOnScroll>

      {/* 3. Verified Buyer & Seller Testimonials */}
      <div>
        <RevealOnScroll direction="up" distance={30} duration={0.6}>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-decoration/10 dark:bg-amber-950/40 text-amber-700 dark:text-gold-decoration text-xs font-semibold uppercase tracking-wider mb-2 border border-gold-decoration/30 dark:border-amber-800">
              <Award className="w-3.5 h-3.5" />
              Verified Customer Experiences
            </div>
            <h3 className="type-h3 font-semibold text-apple-text dark:text-apple-gray">
              Trusted by Overseas Pakistanis & Domestic Investors
            </h3>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <RevealOnScroll 
              key={idx}
              direction="up" 
              distance={40} 
              staggerIndex={idx}
              staggerInterval={0.08}
              duration={0.6}
            >
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.25, ease: REVEAL_EASE }}
                className="p-6 rounded-2xl border border-apple-border dark:border-apple-surface bg-white dark:bg-apple-text shadow-sm flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex items-center gap-1 text-gold-decoration mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-apple-text-muted dark:text-apple-border leading-relaxed italic mb-4">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-4 border-t border-apple-gray dark:border-apple-surface">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-apple-green/20 dark:bg-apple-green/30 text-[var(--apple-green)] dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                      {t.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-apple-text dark:text-apple-gray">{t.name}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--apple-green)]" />
                      </div>
                      <span className="text-[11px] text-apple-text-muted block">{t.role}</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-apple-text-muted mt-2 font-medium">
                    {t.property}
                  </div>
                </div>
              </motion.div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
