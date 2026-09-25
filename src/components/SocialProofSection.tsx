import React from "react";
import { motion } from "motion/react";
import { ShieldCheck, CheckCircle2, TrendingUp, Star, Building2, Award, Clock } from "lucide-react";

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
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800">
      {/* 1. Live Market Activity Stream */}
      <div className="mb-14">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0F766E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0F766E]"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Live Verified Market Activity
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">Real-time registry updates</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {RECENT_ACTIVITIES.map((act) => (
            <div
              key={act.id}
              className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    act.type === "sold"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                      : act.type === "rented"
                      ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                      : "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800"
                  }`}>
                    {act.type === "sold" ? "Sold" : act.type === "rented" ? "Rented" : "Title Verified"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{act.timeAgo}</span>
                </div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                  {act.title}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {act.location}
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F766E] dark:text-teal-400">
                  {act.amount}
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Scale Credentials Banner */}
      <div className="rounded-lg bg-slate-900 text-white p-6 md:p-8 mb-14 shadow-md">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
          <div className="pt-4 md:pt-0">
            <div className="text-2xl md:text-3xl font-extrabold text-teal-400 font-mono">
              Rs 180+ Cr
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">
              Title-Verified Volume Facilitated
            </div>
          </div>
          <div className="pt-4 md:pt-0">
            <div className="text-2xl md:text-3xl font-extrabold text-white font-mono">
              14,500+
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">
              Genuine Active Properties
            </div>
          </div>
          <div className="pt-4 md:pt-0">
            <div className="text-2xl md:text-3xl font-extrabold text-white font-mono">
              1,450+
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">
              Certified Owners & Licensed Agencies
            </div>
          </div>
          <div className="pt-4 md:pt-0">
            <div className="text-2xl md:text-3xl font-extrabold text-amber-400 font-mono">
              0%
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">
              Tolerated Duplicate / Spam Listings
            </div>
          </div>
        </div>
      </div>

      {/* 3. Verified Buyer & Seller Testimonials */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2 border border-amber-200 dark:border-amber-800">
            <Award className="w-3.5 h-3.5" />
            Verified Customer Experiences
          </div>
          <h3 className="type-h3 font-semibold text-slate-900 dark:text-slate-100">
            Trusted by Overseas Pakistanis & Domestic Investors
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic mb-4">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/60 text-[#0F766E] dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{t.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />
                    </div>
                    <span className="text-[11px] text-slate-500 block">{t.role}</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 mt-2 font-medium">
                  {t.property}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
