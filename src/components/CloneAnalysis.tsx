import React, { useState } from "react";
import { 
  CheckCircle, 
  Check,
  Circle, 
  ArrowRight, 
  Layers, 
  Users, 
  Building, 
  ShieldCheck, 
  Database, 
  Cpu, 
  TrendingUp, 
  BadgeCheck, 
  DollarSign, 
  FileText, 
  Map, 
  ArrowRightLeft,
  ChevronRight,
  Sparkles,
  Search,
  MessageSquare,
  ClipboardCheck,
  PlusCircle,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Header from "./Header";
import Footer from "./Footer";
import ValuationModal from "./ValuationModal";

// Interface for Comparison Items
interface ComparisonItem {
  id: string;
  module: string;
  feature: string;
  dubizzleSpec: string;
  pakwheelsSpec: string;
  pakizzleSpec: string;
  status: "completed" | "pending";
  category: "user" | "seller" | "business" | "admin" | "services";
}

export default function CloneAnalysis() {
  const [activeTab, setActiveTab] = useState<"analysis" | "architecture" | "comparison" | "flowchart">("analysis");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isValuationOpen, setIsValuationOpen] = useState<boolean>(false);

  // Comparison Matrix Data
  const comparisonItems: ComparisonItem[] = [
    // USER MODULE
    {
      id: "u1",
      module: "User Accounts",
      feature: "Authentication & Identity",
      dubizzleSpec: "OTP-based SMS authentication plus email registration, linked profiles, active/saved searches, and notification settings.",
      pakwheelsSpec: "Mobile-based OTP logins alongside classic email registration. Basic dashboard layouts containing saved searches, but lacks advanced verified role hierarchies.",
      pakizzleSpec: "Dual OTP Verification flow fully integrated. Secure multi-state account registration, complete with profile settings.",
      status: "completed",
      category: "user"
    },
    {
      id: "u2",
      module: "Saved Searches & Alerts",
      feature: "Search Watchers",
      dubizzleSpec: "Set custom saved parameters (e.g. SUV, <50k Price) and receive push alerts in real-time or daily digests when matches list.",
      pakwheelsSpec: "Provides traditional email notifications for saved parameters. Minimal reactive push alerts directly inside active browser contexts.",
      pakizzleSpec: "Real-time Saved Search alerts with automatic multi-parameter matching (e.g. Price, Make, Model, Fuel, Body Style) fully operational. Active Firestore queries notify listeners instantly upon list match.",
      status: "completed",
      category: "user"
    },
    {
      id: "u3",
      module: "Location Grounding",
      feature: "Geo-fenced Search",
      dubizzleSpec: "Granular region filtering by UAE Emirate down to local sector (e.g. Dubai Marina, JLT).",
      pakwheelsSpec: "Search filtering grouped by major cities (Lahore, Karachi, Islamabad) with support for standard sub-sectors (e.g. DHA Phase 5). Classic static dropdown maps.",
      pakizzleSpec: "Comprehensive city and area dropdown grids implemented (Islamabad, Karachi, Lahore). Auto detects geo-location filters.",
      status: "completed",
      category: "user"
    },
    // SELLER MODULE
    {
      id: "s1",
      module: "Listing Creation",
      feature: "Multi-Step Ad Posting",
      dubizzleSpec: "Step-by-step forms collecting engine capacities, fuel types, trim packages, and structural limits.",
      pakwheelsSpec: "Excellent highly-detailed forms capture: from manufacturing specs, color codes, registration statuses to custom accessories list. High utility but contains heavy layout densities.",
      pakizzleSpec: "Fully polished Multi-step Sell Vehicle Form wizard specifying year, make, mileage, condition, custom transmission, and now featuring dynamic 'Vehicle Style / Type' & 'Fuel Type' selectors.",
      status: "completed",
      category: "seller"
    },
    {
      id: "s2",
      module: "Ad Enhancement",
      feature: "AI Copywriter Assistant",
      dubizzleSpec: "Simple form parsing. Manual text descriptions entered by sellers.",
      pakwheelsSpec: "Requires manual text entry of vehicle description and highlights; zero supportive artificial intelligence copywriting or auto-suggest engines.",
      pakizzleSpec: "Revolutionary integrated Gemini API auto-description writer that analyzes mileage, brand model, and parameters to output sales-ready descriptions instantly.",
      status: "completed",
      category: "seller"
    },
    {
      id: "s3",
      module: "Seller Monetization",
      feature: "Paid Ad Upgrades",
      dubizzleSpec: "Sellers must purchase paid credits or single upload packages for crowded categories. Premium 'Featured' upgrades for top banner positions.",
      pakwheelsSpec: "Extensive monetization: paid featured carousel sliders, rapid sell tags, package bumps, and dealer catalogs. High barrier of entry for solo sellers seeking exposure.",
      pakizzleSpec: "Fully integrated Ledger and Credits wallet. Multi-tier billing package selection, simulated secure payment checkout, transaction history logging, and active listing promotions to featured tiers fully function.",
      status: "completed",
      category: "seller"
    },
    // BUSINESS/DEALER MODULE
    {
      id: "b1",
      module: "Business Verification",
      feature: "Corporate Onboarding",
      dubizzleSpec: "Manual registration validation requiring Trade License inputs, phone verifications, and dealership documents.",
      pakwheelsSpec: "Relies primarily on physical dealer relations, offline field-sales registration, or manually coordinated customer care queues.",
      pakizzleSpec: "Aesthetic Upload Business Verification form with document attachments and Admin panel dashboard moderation tools.",
      status: "completed",
      category: "business"
    },
    {
      id: "b2",
      module: "Dealer Showrooms",
      feature: "Brand Microsites",
      dubizzleSpec: "B2B dealerships get premium personalized catalog URLs, logo integration, representative cards, and bulk XML feeds uploading.",
      pakwheelsSpec: "Paid 'Dealer Portal' showrooms featuring custom header banners, basic brand inventory lists, and contact counts. Traditional interface frameworks.",
      pakizzleSpec: "Personalized Brand Microsites fully operational. Supports dealer star-rating profiles, custom physical address maps, active virtual fleet catalogs, dynamic verification badges, and direct contact click-ratios.",
      status: "completed",
      category: "business"
    },
    {
      id: "b3",
      module: "Leads Console",
      feature: "Bulk Inventory Analytics",
      dubizzleSpec: "Dedicated business portal highlighting CTR, aggregate phone clicks, premium status reports, and leads pipeline tracker.",
      pakwheelsSpec: "Dealer App tracks total active views, user chats, and phone clicks. Provides simple linear charts with basic lead conversion values.",
      pakizzleSpec: "Dynamic Seller Analytics dashboard implemented displaying profile views, active messages, listings conversion charts, and aggregate pipeline revenue.",
      status: "completed",
      category: "business"
    },
    // ADMIN MODULE
    {
      id: "a1",
      module: "Data Schema Control",
      feature: "Dynamic Custom Fields",
      dubizzleSpec: "Robust master panel to structure subcategories and inject conditional attribute forms per category schema.",
      pakwheelsSpec: "Hardcoded criteria tables locked into the central SQL database files. Field changes require system development/migration releases.",
      pakizzleSpec: "Custom Field and Category Schema management systems designed with fully interactive Admin components and visual tables.",
      status: "completed",
      category: "admin"
    },
    {
      id: "a2",
      module: "Listing Moderation",
      feature: "Manual Ad Moderation",
      dubizzleSpec: "Pending queue reviewed by safety moderators before listing becomes discoverable.",
      pakwheelsSpec: "Substantial offline human workforce auditing ad authenticity, sometimes resulting in 2-12 hours processing delay.",
      pakizzleSpec: "Comprehensive, state-of-the-art Approval Center dashboard constructed to audit/approve vehicle listings and user verification badges.",
      status: "completed",
      category: "admin"
    },
    {
      id: "a3",
      module: "Fraud Mitigation",
      feature: "Report Tracking & Audit Loops",
      dubizzleSpec: "User-generated flags trigger quick database shadow-bans. Security audit logging.",
      pakwheelsSpec: "Standard user-flagging interfaces linking to off-screen review tables. Lacks active real-time administrative trace telemetry boards.",
      pakizzleSpec: "Highly sophisticated Audit Logging track records, custom report ticketing control nodes, and user blacklisting interfaces constructed.",
      status: "completed",
      category: "admin"
    },
    // SERVICES
    {
      id: "sv1",
      module: "Inspections",
      feature: "'Verified by Dubizzle'",
      dubizzleSpec: "Partnership with physical check-up centers. Certified vehicle condition scoring with transparent 240-point logs downloadable.",
      pakwheelsSpec: "Extremely popular 'PakWheels Inspection' service. A physical team checks 200+ points on the vehicle to issue an authoritative digital report.",
      pakizzleSpec: "Pakizzle Inspection booking workflow created, showing diagnostic parameters, mobile/physical slots, and transparent inspection packages.",
      status: "completed",
      category: "services"
    },
    {
      id: "sv2",
      module: "Auto Financing",
      feature: "Interactive Credit Scoring",
      dubizzleSpec: "Direct partnership with major UAE banks offering mock calculations and digital loan application proxy grids.",
      pakwheelsSpec: "Commercial partnerships with premium local banks (e.g. Bank Alfalah). Offers basic monthly EMI calculation fields and request call-back forms.",
      pakizzleSpec: "Capital Loans Matrix terminal fully integrated: contains animated interactive EMI calculators, bank comparisons, and multi-step bank evaluation requests.",
      status: "completed",
      category: "services"
    },
    {
      id: "sv3",
      module: "Auto Insurance",
      feature: "Live Premium Quotes",
      dubizzleSpec: "Instantly compare multiple insurers. Standardized quotation requests triggered on-site.",
      pakwheelsSpec: "Integrates third-party broker links with manual query inputs. Requires off-site manual sales agent callbacks.",
      pakizzleSpec: "Comprehensive, fully custom Auto Insurance premium comparison table, quote generator, and booking engine built from scratch for Pakistan.",
      status: "completed",
      category: "services"
    }
  ];

  // Filtering Logic
  const filteredComparison = comparisonItems.filter(item => {
    const matchesCat = filterCategory === "all" || item.category === filterCategory;
    const matchesStat = filterStatus === "all" || item.status === filterStatus;
    return matchesCat && matchesStat;
  });

  const totalCompleted = comparisonItems.filter(i => i.status === "completed").length;
  const completionPercentage = Math.round((totalCompleted / comparisonItems.length) * 100);

  return (
    <div className="min-h-screen bg-apple-bg text-apple-text overflow-x-hidden">
      <Header />
      
      {/* Hero Header */}
      <section className="relative pt-32 pb-16 bg-[#F5F5F7] dark:bg-[#09090b] border-b border-apple-border/20 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <div className="absolute -top-40 right-10 w-[600px] h-[600px] bg-apple-blue/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-20 left-10 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[80px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-apple-blue/10 text-apple-blue uppercase tracking-widest mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Core Architecture Blueprint
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none mb-4">
                Dubizzle & PakWheels Blueprint
              </h1>
              <p className="text-base md:text-lg text-apple-text-muted font-medium mb-0">
                A system blueprint comparing <span className="text-apple-blue font-bold">Dubizzle UAE</span>, the Pakistani local pioneer <span className="text-rose-500 font-bold">PakWheels</span>, and the next-generation <span className="text-apple-green font-bold">Pakizzle</span> platform. Analyze design choices, feature gaps, and modular service lines.
              </p>
            </div>
            
            {/* Project Completion Radial Widget */}
            <div className="bg-white dark:bg-zinc-900 border border-apple-border/30 px-6 py-5 rounded-[28px] shadow-apple-soft flex items-center gap-4 min-w-[240px] shrink-0">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" className="text-apple-gray dark:text-zinc-800" strokeWidth="5"/>
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" className="text-apple-blue transition-all duration-1000" strokeWidth="5"
                    strokeDasharray={2 * Math.PI * 28}
                    strokeDashoffset={2 * Math.PI * 28 * (1 - completionPercentage / 100)}
                  />
                </svg>
                <span className="absolute text-sm font-black text-apple-text">{completionPercentage}%</span>
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-apple-text-muted">Parity Met</h4>
                <p className="text-sm font-bold text-apple-text">{totalCompleted} / {comparisonItems.length} Key Subsystems</p>
              </div>
            </div>
          </div>

          {/* Tab Selection Navigation */}
          <div className="flex gap-2 p-1.5 bg-apple-gray dark:bg-zinc-900 rounded-2xl max-w-2xl">
            {(["analysis", "architecture", "comparison", "flowchart"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                  activeTab === tab 
                  ? "bg-white dark:bg-zinc-800 text-apple-text shadow-sm" 
                  : "text-apple-text-muted hover:text-apple-text"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <AnimatePresence mode="wait">
          {/* TAB 1: SYSTEM ANALYSIS */}
          {activeTab === "analysis" && (
            <motion.div
              key="analysis-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-12"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Dubizzle card */}
                <div className="glass-panel p-8 md:p-10 rounded-[32px] hover:shadow-apple-hover transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 bg-apple-blue/10 text-apple-blue rounded-2xl flex items-center justify-center mb-6">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-4 text-apple-text">
                      What is Dubizzle?
                    </h3>
                    <p className="text-sm text-apple-text-muted leading-relaxed font-semibold mb-4">
                      The undisputed classifieds leader in Dubai and the surrounding UAE. Built across modular verticals, its success centers on robust schema filters, premium dealer showroom integration, and highly lucrative ancillary features like live quotes, bank partnerships, and direct offline inspection workflows.
                    </p>
                  </div>
                  <p className="text-xs text-apple-text-muted font-bold pt-4 border-t border-apple-border/10">
                    Ecosystem Value: High-margin auto listing fees, single credits upgrade slots, and verified catalog showrooms.
                  </p>
                </div>

                {/* PakWheels Card */}
                <div className="glass-panel p-8 md:p-10 rounded-[32px] hover:shadow-apple-hover transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
                      <Layers className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-4 text-apple-text">
                      What is PakWheels?
                    </h3>
                    <p className="text-sm text-apple-text-muted leading-relaxed font-semibold mb-4">
                      Pakistan's household giant in automotive directories and portals. Recognized for establishing deep-rooted local trust through mobile car inspections and active interactive discussion forums. While extremely dominant, its system interfaces and digital toolsets follow classic architectural layouts.
                    </p>
                  </div>
                  <p className="text-xs text-apple-text-muted font-bold pt-4 border-t border-apple-border/10">
                    Ecosystem Value: Nationwide brand authority, physical inspection report logs, and highly interactive seller networks.
                  </p>
                </div>

                {/* Pakizzle Card */}
                <div className="glass-panel p-8 md:p-10 rounded-[32px] hover:shadow-apple-hover transition-all flex flex-col justify-between border-2 border-apple-blue/10">
                  <div>
                    <div className="w-12 h-12 bg-purple-500/10 text-[#A13FFD] rounded-2xl flex items-center justify-center mb-6">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-4 text-[#A13FFD]">
                      The Pakizzle Vision
                    </h3>
                    <p className="text-sm text-apple-text-muted leading-relaxed font-semibold mb-4">
                      Pakizzle maps Dubizzle's high-margin Dubai blueprint onto Pakistan's automotive market. We take on PakWheels with sleek responsive views, server-side GenAI content writers (Gemini), dynamic trade upload filters, and robust custom pricing matrix tools built for modern sellers.
                    </p>
                  </div>
                  <p className="text-xs text-[#A13FFD] font-bold pt-4 border-t border-purple-500/10">
                    Ecosystem Value: Coprocessor-assisted ad posts, real-time alert matching, integrated credits wallet, and unified banking quotes.
                  </p>
                </div>
              </div>

              {/* Persona Roles Demystified */}
              <div>
                <h3 className="text-2xl font-bold tracking-tight mb-8">System Actor Roles & Permissions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Actor 1: Registered User */}
                  <div className="bg-white dark:bg-zinc-900 border border-apple-border/20 p-6 rounded-2xl">
                    <div className="w-10 h-10 bg-apple-blue/10 text-apple-blue rounded-xl flex items-center justify-center mb-4">
                      <Users className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-apple-text mb-2">Registered Buyers</h4>
                    <p className="text-xs text-apple-text-muted leading-relaxed font-semibold mb-4">
                      Standard user tier focused on discoverability, localized filtering, and securing reliable deals.
                    </p>
                    <ul className="space-y-2 mt-auto pt-2 border-t border-apple-border/10 text-[11px] font-semibold text-apple-text-muted">
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-apple-blue" /> Search & localized filter</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-apple-blue" /> Direct instant seller chats</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-apple-blue" /> Quote insurance/financing</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-apple-blue" /> Submit KYC Identity Badge</li>
                    </ul>
                  </div>

                  {/* Actor 2: Individual Seller */}
                  <div className="bg-white dark:bg-zinc-900 border border-apple-border/20 p-6 rounded-2xl">
                    <div className="w-10 h-10 bg-apple-green/10 text-apple-green rounded-xl flex items-center justify-center mb-4">
                      <PlusCircle className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-apple-text mb-2">Individual Sellers</h4>
                    <p className="text-xs text-apple-text-muted leading-relaxed font-semibold mb-4">
                      Sellers looking to turn assets into capital quickly via structured posting and rapid listings.
                    </p>
                    <ul className="space-y-2 mt-auto pt-2 border-t border-apple-border/10 text-[11px] font-semibold text-apple-text-muted">
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-apple-green" /> Multi-step ad posting portal</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-apple-green" /> Gemini AI dynamic description</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-apple-green" /> Basic ad upload analytics</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-apple-green" /> Edit, refresh or delete ads</li>
                    </ul>
                  </div>

                  {/* Actor 3: Business/Commercial Dealer */}
                  <div className="bg-white dark:bg-zinc-900 border border-apple-border/20 p-6 rounded-2xl">
                    <div className="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center mb-4">
                      <Building className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-apple-text mb-2">Business Dealers</h4>
                    <p className="text-xs text-apple-text-muted leading-relaxed font-semibold mb-4">
                      B2C certified dealer houses managing active inventories, statistics, and high-convert leads.
                    </p>
                    <ul className="space-y-2 mt-auto pt-2 border-t border-apple-border/10 text-[11px] font-semibold text-apple-text-muted">
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-500" /> Upload trade verification logs</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-500" /> Access bulk seller consoles</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-500" /> Prominent Verified Dealer Badge</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-500" /> Enhanced listings conversion metrics</li>
                    </ul>
                  </div>

                  {/* Actor 4: System Moderator/Admin */}
                  <div className="bg-white dark:bg-zinc-900 border border-apple-border/20 p-6 rounded-2xl">
                    <div className="w-10 h-10 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center mb-4">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-apple-text mb-2">Admin Command</h4>
                    <p className="text-xs text-apple-text-muted leading-relaxed font-semibold mb-4">
                      Complete top-tier controls auditing, schemas configuring, and verifying the platform's daily records.
                    </p>
                    <ul className="space-y-2 mt-auto pt-2 border-t border-apple-border/10 text-[11px] font-semibold text-apple-text-muted">
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-orange-500" /> Master Approval check center</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-orange-500" /> Ban users and manage roles</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-orange-500" /> Dynamic customized schema tags</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-orange-500" /> Full structural audit logging</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: TECHNICAL ARCHITECTURE */}
          {activeTab === "architecture" && (
            <motion.div
              key="architecture-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-12"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Database schema design */}
                <div className="glass-panel p-8 rounded-3xl lg:col-span-2">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-apple-blue/10 text-apple-blue rounded-xl flex items-center justify-center">
                      <Database className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">Ecosystem Architecture & Database Schema</h3>
                  </div>
                  <p className="text-xs text-apple-text-muted font-semibold leading-relaxed mb-6">
                    A look inside the foundational schemas powering storage. Dubizzle relies on high-velocity relational and document caches to load millions of listings matching customized fields. Pakizzle leverages Firebase Firestore to store responsive schema documents with structural indexes.
                  </p>

                  <div className="bg-[#1D1D1F] text-[#F5F5F7] p-6 rounded-2xl font-mono text-xs overflow-x-auto space-y-4 shadow-inner max-h-[460px] overflow-y-auto">
                    <div>
                      <span className="text-[#007DFF]"># Schema Collection: vehicles</span>
                      <pre className="text-[11px] mt-1 text-zinc-400">
{`{
  id: "v-xxxxxx",                  // Unique vehicle code
  make: "Toyota",                  // Automotive brand
  model: "Corolla",                // Specific model series
  year: 2024,                      // Manufacture year
  price: 9800000,                  // Demanded currency integer
  mileage: 12000,                  // Odometer readings in km
  bodyType: "Sedan",               // Dynamic style filter option
  transmission: "automatic",       // automatic | manual
  fuelType: "hybrid",              // petrol | hybrid | electric | diesel
  city: "Lahore",                  // Geographic city grouping
  area: "DHA Phase 6",             // Specific neighborhood
  location: "DHA Phase 6, Lahore", // Combined search coordinate
  images: ["https://..."],         // Document cloud URLs
  category: { parentId, childId }, // Category schema link
  status: "active",                // active | pending | inactive | sold
  seller: {                        // Dynamic embedded seller log
    uid: "user-xxxxxx",
    name: "Elite Motors",
    isVerified: true,
    badgeType: "dealer"
  }
}`}
                      </pre>
                    </div>

                    <div className="border-t border-zinc-800 pt-4">
                      <span className="text-[#007DFF]"># Schema Collection: popular_vehicle_styles</span>
                      <pre className="text-[11px] mt-1 text-zinc-400">
{`{
  id: "sedan",                     // Style ID preset
  name: "Sedan",                   // Clear name label
  iconPreset: "car-sedan",         // Icon lookup vector
  order: 1,                        // Sequence for carousel presentation
  status: "active"                 // active | hidden
}`}
                      </pre>
                    </div>

                    <div className="border-t border-zinc-800 pt-4">
                      <span className="text-[#007DFF]"># Schema Collection: users</span>
                      <pre className="text-[11px] mt-1 text-zinc-400">
{`{
  uid: "user_slug_xxxx",
  displayName: "Malik Shahzad",
  email: "shahzad@motors.com",
  isOtpVerified: true,             // Custom OTP access checks
  isVerified: true,                // Manual corporate check flag
  badgeType: "dealer",             // none | verified | dealer
  createdAt: "2026-05-18T..."
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* 2. Intelligent Coprocessor */}
                <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold tracking-tight">AI Coprocessor Integration</h3>
                    </div>
                    <p className="text-xs text-apple-text-muted font-semibold leading-relaxed mb-4">
                      Unlike static Dubizzle post forms, Pakizzle binds a server-side **Google GenAI / Gemini 3.5 API core** into the publishing wizard.
                    </p>
                    <p className="text-xs text-apple-text-muted font-semibold leading-relaxed">
                      Sellers do not need to brainstorm convincing descriptions. Our engine automatically parses properties like transmission, mileage, and condition to output high-converting copy tailor-made for the local market in seconds.
                    </p>

                    <div className="mt-6 border-l-2 border-purple-500 pl-4 py-1.5">
                      <div className="text-[10px] uppercase font-black tracking-widest text-[#007DFF] mb-1">Server Resolution Node</div>
                      <span className="font-mono text-[11px] text-apple-text-muted">gemini-3-flash-preview active</span>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-apple-border/20">
                    <h4 className="text-xs font-black uppercase tracking-wider text-apple-text mb-2">Primary API Routes</h4>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between text-[11px] text-apple-text-muted"><span className="text-apple-green font-bold">GET</span> /api/health</div>
                      <div className="flex items-center justify-between text-[11px] text-apple-text-muted"><span className="text-apple-blue font-bold">POST</span> /api/chat/sync</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: DUBIZZLE VS PAKIZZLE COMPARE MATRIX */}
          {activeTab === "comparison" && (
            <motion.div
              key="comparison-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* Filter Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-apple-gray dark:bg-zinc-900 rounded-2xl">
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setFilterCategory("all")}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${
                      filterCategory === "all" ? "bg-apple-blue text-white" : "bg-white dark:bg-zinc-800 text-apple-text-muted hover:text-apple-text"
                    }`}
                  >
                    All modules
                  </button>
                  <button 
                    onClick={() => setFilterCategory("user")}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${
                      filterCategory === "user" ? "bg-[#007DFF] text-white" : "bg-white dark:bg-zinc-800 text-apple-text-muted hover:text-apple-text"
                    }`}
                  >
                    Buyer
                  </button>
                  <button 
                    onClick={() => setFilterCategory("seller")}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${
                      filterCategory === "seller" ? "bg-apple-green text-white" : "bg-white dark:bg-zinc-800 text-apple-text-muted hover:text-apple-text"
                    }`}
                  >
                    Seller
                  </button>
                  <button 
                    onClick={() => setFilterCategory("business")}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${
                      filterCategory === "business" ? "bg-purple-500 text-white" : "bg-white dark:bg-zinc-800 text-apple-text-muted hover:text-apple-text"
                    }`}
                  >
                    Dealer
                  </button>
                  <button 
                    onClick={() => setFilterCategory("admin")}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${
                      filterCategory === "admin" ? "bg-orange-500 text-white" : "bg-white dark:bg-zinc-800 text-apple-text-muted hover:text-apple-text"
                    }`}
                  >
                    Admin
                  </button>
                  <button 
                    onClick={() => setFilterCategory("services")}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${
                      filterCategory === "services" ? "bg-rose-500 text-white" : "bg-white dark:bg-zinc-800 text-apple-text-muted hover:text-apple-text"
                    }`}
                  >
                    Services
                  </button>
                </div>

                <div className="flex gap-2">
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 border border-apple-border/30"
                  >
                    <option value="all">All States</option>
                    <option value="completed">✔ Completed</option>
                    <option value="pending">⚙ Pending/In Roadmap</option>
                  </select>
                </div>
              </div>

              {/* Responsive Grid Map */}
              <div className="space-y-4">
                {filteredComparison.map((item) => (
                  <motion.div
                    layout
                    key={item.id}
                    className="glass-panel p-6 rounded-[24px] hover:shadow-apple-soft transition-all duration-300 border border-apple-border/20"
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                            item.category === "user" ? "bg-apple-blue/10 text-apple-blue" :
                            item.category === "seller" ? "bg-apple-green/10 text-apple-green" :
                            item.category === "business" ? "bg-purple-500/10 text-purple-500" :
                            item.category === "admin" ? "bg-orange-500/10 text-orange-500" :
                            "bg-rose-500/10 text-rose-500"
                          }`}>
                            {item.module}
                          </span>
                          <span className="text-sm font-black text-apple-text tracking-tight">{item.feature}</span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                          <div className="p-4 bg-apple-gray dark:bg-zinc-900/40 rounded-2xl relative border border-transparent hover:border-apple-border/15 transition-all">
                            <div className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest text-apple-text-muted font-mono">Dubizzle Spec</div>
                            <p className="text-xs text-apple-text font-semibold leading-relaxed mt-4">{item.dubizzleSpec}</p>
                          </div>

                          <div className="p-4 bg-rose-50/10 dark:bg-[#EF4444]/5 rounded-2xl relative border border-rose-500/10 hover:border-rose-500/20 transition-all">
                            <div className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest text-[#EF4444] font-mono">PakWheels Spec</div>
                            <p className="text-xs text-apple-text font-semibold leading-relaxed mt-4">{item.pakwheelsSpec}</p>
                          </div>
                          
                          <div className="p-4 bg-apple-blue/5 dark:bg-apple-blue/10 rounded-2xl relative border border-apple-blue/15 hover:border-apple-blue/25 transition-all">
                            <div className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest text-apple-blue font-mono">Pakizzle Spec</div>
                            <p className="text-xs text-apple-text font-semibold leading-relaxed mt-4">{item.pakizzleSpec}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 w-full sm:w-auto self-stretch pt-2 sm:pt-0 border-t sm:border-t-0 border-apple-border/10">
                        <span className="text-xs font-black uppercase tracking-widest text-apple-text-muted sm:hidden">Status</span>
                        {item.status === "completed" ? (
                          <div className="flex items-center gap-1.5 text-apple-green font-black uppercase tracking-widest text-[10px]">
                            <CheckCircle className="w-4 h-4 fill-apple-green text-white" />
                            Completed
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-yellow-500 dark:text-yellow-400 font-black uppercase tracking-widest text-[10px]">
                            <Circle className="w-4 h-4 text-yellow-500 animate-pulse" />
                            Planned Phase 2
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {filteredComparison.length === 0 && (
                  <div className="py-16 text-center text-apple-text-muted font-bold">
                    No modules match the active queries.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 4: SYSTEM OPERATIONAL FLOWCHARTS */}
          {activeTab === "flowchart" && (
            <motion.div
              key="flowchart-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-12 animate-fade-in"
            >
              {/* SELLER FLOW MAP */}
              <div className="glass-panel p-8 md:p-10 rounded-[32px]">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-apple-green/10 text-apple-green rounded-xl flex items-center justify-center">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold tracking-tight text-apple-text">Seller Listing & AI Enrichment Flow</h3>
                    <p className="text-xs text-apple-text-muted font-semibold tracking-tight">How custom models are captured, processed, and validated</p>
                  </div>
                </div>

                {/* Symmetrical Visual Flowchart Node Set */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
                  {/* Step 1 */}
                  <div className="bg-apple-gray dark:bg-zinc-900 p-5 rounded-2xl relative flex flex-col justify-between border border-apple-border/10">
                    <div>
                      <div className="w-7 h-7 rounded-lg bg-apple-blue text-white flex items-center justify-center text-xs font-black mb-3">1</div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-apple-text mb-2">Form Initiate</h4>
                      <p className="text-[11px] text-apple-text-muted font-semibold leading-relaxed">Inputs core parameters: Price, Make, Model, Fuel, and Body Type style option.</p>
                    </div>
                    <div className="hidden md:absolute md:top-1/2 md:-translate-y-1/2 md:-right-4 md:z-10 text-apple-border"><ChevronRight className="w-5 h-5" /></div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-apple-gray dark:bg-zinc-900 p-5 rounded-2xl relative flex flex-col justify-between border border-apple-border/10">
                    <div>
                      <div className="w-7 h-7 rounded-lg bg-apple-blue text-white flex items-center justify-center text-xs font-black mb-3">2</div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#A13FFD] mb-2">GenAI Synthesis</h4>
                      <p className="text-[11px] text-apple-text-muted font-semibold leading-relaxed">Gemini parses parameters server-side to generate premium local-market descriptions.</p>
                    </div>
                    <div className="hidden md:absolute md:top-1/2 md:-translate-y-1/2 md:-right-4 md:z-10 text-apple-border"><ChevronRight className="w-5 h-5" /></div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-apple-gray dark:bg-zinc-900 p-5 rounded-2xl relative flex flex-col justify-between border border-apple-border/10">
                    <div>
                      <div className="w-7 h-7 rounded-lg bg-apple-blue text-white flex items-center justify-center text-xs font-black mb-3">3</div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-apple-text mb-2">Image Stream</h4>
                      <p className="text-[11px] text-apple-text-muted font-semibold leading-relaxed">Seller uploads multiple images of their vehicle (validated max 10 slots).</p>
                    </div>
                    <div className="hidden md:absolute md:top-1/2 md:-translate-y-1/2 md:-right-4 md:z-10 text-apple-border"><ChevronRight className="w-5 h-5" /></div>
                  </div>

                  {/* Step 4 */}
                  <div className="bg-apple-gray dark:bg-zinc-900 p-5 rounded-2xl relative flex flex-col justify-between border border-apple-border/10">
                    <div>
                      <div className="w-7 h-7 rounded-lg bg-apple-blue text-white flex items-center justify-center text-xs font-black mb-3">4</div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-orange-500 mb-2">Moderate Filter</h4>
                      <p className="text-[11px] text-apple-text-muted font-semibold leading-relaxed">Ad lands in active admin approval dashboard queues before public routing index.</p>
                    </div>
                    <div className="hidden md:absolute md:top-1/2 md:-translate-y-1/2 md:-right-4 md:z-10 text-apple-border"><ChevronRight className="w-5 h-5" /></div>
                  </div>

                  {/* Step 5 */}
                  <div className="bg-apple-blue/5 dark:bg-apple-blue/10 p-5 rounded-2xl border border-apple-blue/20 relative flex flex-col justify-between">
                    <div>
                      <div className="w-7 h-7 rounded-lg bg-apple-green text-white flex items-center justify-center text-xs font-black mb-3">5</div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-apple-green mb-2">Active Index</h4>
                      <p className="text-[11px] text-apple-text-muted font-semibold leading-relaxed">Listing enters Live Marketplace with custom chats and style filters discoverable.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* DEMAND & PROCUREMENT TRANSACTION FLOWS */}
              <div className="glass-panel p-8 md:p-10 rounded-[32px]">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-apple-blue/10 text-apple-blue rounded-xl flex items-center justify-center">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold tracking-tight text-apple-text">Buyer Discovery & Ancillary Integration Flow</h3>
                    <p className="text-xs text-apple-text-muted font-semibold tracking-tight">How platform filters match leads and secure deals</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
                  {/* Step 1 */}
                  <div className="bg-apple-gray dark:bg-zinc-900 p-5 rounded-2xl relative flex flex-col justify-between border border-apple-border/10">
                    <div>
                      <div className="w-7 h-7 rounded-lg bg-zinc-800 text-white flex items-center justify-center text-xs font-black mb-3">1</div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-apple-text mb-2">Smart Discovery</h4>
                      <p className="text-[11px] text-apple-text-muted font-semibold leading-relaxed">Filters via search triggers, exact body styles, fuel classes, or direct pricing average valuation maps.</p>
                    </div>
                    <div className="hidden md:absolute md:top-1/2 md:-translate-y-1/2 md:-right-4 md:z-10 text-apple-border"><ChevronRight className="w-5 h-5" /></div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-apple-gray dark:bg-zinc-900 p-5 rounded-2xl relative flex flex-col justify-between border border-apple-border/10">
                    <div>
                      <div className="w-7 h-7 rounded-lg bg-zinc-800 text-white flex items-center justify-center text-xs font-black mb-3">2</div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-apple-text mb-2">Verification Audit</h4>
                      <p className="text-[11px] text-apple-text-muted font-semibold leading-relaxed">Inspects seller profile indicators, and registers booking checks for official physical inspections.</p>
                    </div>
                    <div className="hidden md:absolute md:top-1/2 md:-translate-y-1/2 md:-right-4 md:z-10 text-apple-border"><ChevronRight className="w-5 h-5" /></div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-apple-gray dark:bg-zinc-900 p-5 rounded-2xl relative flex flex-col justify-between border border-apple-border/10">
                    <div>
                      <div className="w-7 h-7 rounded-lg bg-zinc-800 text-white flex items-center justify-center text-xs font-black mb-3">3</div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#A13FFD] mb-2">Instant Chats</h4>
                      <p className="text-[11px] text-apple-text-muted font-semibold leading-relaxed">Initiates secure real-time message rooms directly inside the browser proxy console.</p>
                    </div>
                    <div className="hidden md:absolute md:top-1/2 md:-translate-y-1/2 md:-right-4 md:z-10 text-apple-border"><ChevronRight className="w-5 h-5" /></div>
                  </div>

                  {/* Step 4 */}
                  <div className="bg-apple-gray dark:bg-zinc-900 p-5 rounded-2xl relative flex flex-col justify-between border border-apple-border/10">
                    <div>
                      <div className="w-7 h-7 rounded-lg bg-zinc-800 text-white flex items-center justify-center text-xs font-black mb-3">4</div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-apple-text mb-2">Quotes Portal</h4>
                      <p className="text-[11px] text-apple-text-muted font-semibold leading-relaxed">Applies calculator formulas comparing regional insurance options & financing loans terms.</p>
                    </div>
                    <div className="hidden md:absolute md:top-1/2 md:-translate-y-1/2 md:-right-4 md:z-10 text-apple-border"><ChevronRight className="w-5 h-5" /></div>
                  </div>

                  {/* Step 5 */}
                  <div className="bg-purple-50 [body-dark]:bg-purple-950/10 p-5 rounded-2xl border border-purple-500/25 relative flex flex-col justify-between">
                    <div>
                      <div className="w-7 h-7 rounded-lg bg-purple-500 text-white flex items-center justify-center text-xs font-black mb-3">5</div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-450 mb-2">Secure Handshake</h4>
                      <p className="text-[11px] text-apple-text-muted font-semibold leading-relaxed">Arranges physical transfer of vehicle titles. Rating system closes standard safety logs.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <ValuationModal isOpen={isValuationOpen} onClose={() => setIsValuationOpen(false)} />
      <Footer onValuationClick={() => setIsValuationOpen(true)} />
    </div>
  );
}
