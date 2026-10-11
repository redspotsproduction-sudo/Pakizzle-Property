import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  ChevronRight, 
  ChevronDown,
  CheckCircle2, 
  AlertTriangle,
  ClipboardList, 
  Search, 
  Car, 
  ArrowRight,
  Zap,
  Activity,
  Award,
  Star,
  FileText,
  Smartphone,
  Calendar,
  Filter,
  Eye,
  MessageSquare,
  Sparkles,
  Sliders,
  AlertCircle,
  HelpCircle,
  UserCheck,
  ThumbsUp,
  X,
  Gauge,
  Cpu,
  Check,
  Shield,
  Coins,
  Compass
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import {
  InsuranceCoverageExplorer,
  LiveClaimsRadar,
  ClaimSettlementSimulator
} from './AdvancedInsuranceWidgets';
import InsuranceComparisonTable from './InsuranceComparisonTable';

// FAQ Structure for Insurance
interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "How fast is a claim authorized and approved?",
    answer: "With our AI-assisted claims terminal, minor accidents can be processed in under 120 seconds. Simply snap a photo of the panel damage and upload it along with an elcometer scan. For major incidents, our emergency mobile nodes arrive on-site within 15–30 minutes to facilitate towing and authorize on-spot repairs."
  },
  {
    question: "Do I have to pay for the satellite tracker installation?",
    answer: "No. For all comprehensive policies issued through Pakizzle, we provide and install a state-of-the-art satellite tracking unit free of charge. Our certified technicians can schedule the installation at your home or office within 48 hours of policy issuance."
  },
  {
    question: "Can I pay my premium in monthly installments?",
    answer: "Yes, absolutely! We partner with leading financial nodes to offer interest-free, split-payment plans. You can choose to divide your annual comprehensive premium into 3, 6, or 12 convenient monthly auto-debit payments."
  },
  {
    question: "What is zero-depreciation coverage (bumper-to-bumper)?",
    answer: "Zero-depreciation means that in the event of an accident, the insurance company pays 100% of the replacement parts cost without deducting any percentage for depreciation due to the age of the car. It ensures you pay practically PKR 0 out-of-pocket."
  },
  {
    question: "How is my car's market value determined?",
    answer: "We query live market data, recent listing trends, and historical Pakizzle valuation reports to calibrate a highly accurate market value range for your specific make, model, and condition. This guarantees your vehicle is neither under-insured nor over-charged."
  },
  {
    question: "Is third-party insurance legally mandatory in Pakistan?",
    answer: "Yes. Under the Motor Vehicles Act, having at least basic third-party liability coverage is a legal requirement to drive on public roads. Our Third-Party Shield provides high-limit compliance and saves you from massive legal liabilities."
  }
];

export default function InsuranceLanding() {
  const navigate = useNavigate();
  
  // Interactive estimator states
  const [estCity, setEstCity] = useState<'khi' | 'lhe' | 'isb'>('lhe');
  const [estCarType, setEstCarType] = useState<'hatch' | 'sedan' | 'suv'>('sedan');
  const [estValue, setEstValue] = useState<string>('3500000'); // Default 35 Lacs

  // FAQ Expand state
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  // Dynamic premium calculation
  const calculatedPremium = useMemo(() => {
    const numericValue = Number(estValue.replace(/,/g, '')) || 3500000;
    let rate = 1.65; // base rate
    if (estCarType === 'hatch') rate = 1.45;
    if (estCarType === 'suv') rate = 1.85;

    // Slight adjustment for city
    let extra = 0;
    if (estCity === 'isb') extra = 2500;
    if (estCity === 'khi') extra = 1500;

    return Math.round((numericValue * (rate / 100)) + extra);
  }, [estCarType, estCity, estValue]);

  const handleBookNow = () => {
    toast.success("Premium model locked!", {
      description: `Proceeding with custom quote application.`
    });
    navigate(`/insurance/book/car?city=${estCity}&value=${estValue}`);
  };

  return (
    <div className="text-[var(--text-primary)] dark:text-[var(--text-primary)] antialiased min-h-screen bg-[var(--text-primary)] dark:bg-[var(--bg-page)] transition-colors duration-500 selection:bg-apple-blue/10 selection:text-apple-blue">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pb-28 overflow-hidden bg-gradient-to-b from-white to-[var(--text-primary)] dark:from-[var(--bg-surface)] dark:to-[var(--bg-page)] border-b border-black/[0.04] dark:border-white/[0.04]">
        {/* Abstract vector backgrounds */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-apple-blue/5 dark:bg-apple-blue/10 rounded-full blur-[100px] pointer-events-none -mr-40 -mt-20" />
        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-gold-decoration/5 dark:bg-gold-decoration/5 rounded-full blur-[80px] pointer-events-none -ml-40 -mb-20" />

        <div className="max-w-[1024px] mx-auto px-6 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headline and Pitch */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-apple-blue/5 dark:bg-apple-blue/10 border border-apple-blue/15 text-xs font-bold text-apple-blue tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5" />
                Pakistan’s Smartest AI-Assisted Car Insurance
              </div>

              <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-[1.1]">
                Secure your vehicle with <span className="text-apple-blue font-bold">100% peace of mind</span>.
              </h1>
              
              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-xl">
                Protect your masterpiece. Pakizzle partners with leading underwriters to provide zero-depreciation coverage, free satellite tracking, interest-free monthly installments, and 120-second instant claims.
              </p>

              <div className="flex flex-wrap gap-4 items-center pt-2">
                <button
                  onClick={() => navigate('/insurance/book/car')}
                  className="px-6 py-3 text-xs font-semibold bg-apple-blue hover:bg-blue-600 text-white rounded-full transition-all shadow-md flex items-center gap-2 group"
                >
                  Start Car Insurance Quote
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <a 
                  href="#how-it-works"
                  className="text-xs font-bold text-[var(--text-primary)] dark:text-white hover:text-apple-blue transition-colors flex items-center gap-1"
                >
                  See Coverage Breakdown
                  <ChevronDown className="w-4 h-4 animate-bounce" />
                </a>
              </div>

              {/* Trust markers */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-black/[0.05] dark:border-white/5 max-w-lg">
                <div>
                  <span className="block text-xl sm:text-2xl font-bold text-apple-blue font-mono">120s</span>
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">Claim Approvals</span>
                </div>
                <div>
                  <span className="block text-xl sm:text-2xl font-bold text-[var(--text-primary)] dark:text-white font-mono">Free</span>
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">GPS Tracker Unit</span>
                </div>
                <div>
                  <span className="block text-xl sm:text-2xl font-bold text-apple-green font-mono">100%</span>
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">Zero-Depreciation</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Quick Quote Widget */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-[var(--bg-surface)] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-5 sm:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-apple-blue to-cyan-500" />
                
                <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)] mb-1">Get an Instant Premium Quote</h3>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] dark:text-white leading-tight mb-5">Select Policy Parameters</h2>

                <div className="space-y-4">
                  {/* City Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">City Hub Node</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'lhe' as const, label: 'Lahore' },
                        { id: 'khi' as const, label: 'Karachi' },
                        { id: 'isb' as const, label: 'Islamabad' }
                      ].map((city) => (
                        <button
                          key={city.id}
                          onClick={() => setEstCity(city.id)}
                          className={cn(
                            "py-2 text-[10px] font-bold rounded-xl border text-center transition-all",
                            estCity === city.id
                              ? "bg-apple-blue border-apple-blue text-white shadow-sm"
                              : "bg-[var(--text-primary)] dark:bg-white/5 border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white"
                          )}
                        >
                          {city.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Vehicle Class */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Vehicle Category</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'hatch' as const, label: 'Hatchback', desc: 'Alto, Vitz, Picanto' },
                        { id: 'sedan' as const, label: 'Sedan', desc: 'Civic, Corolla, City' },
                        { id: 'suv' as const, label: 'SUV / Luxury', desc: 'Fortuner, Tucson, EV' }
                      ].map((classItem) => (
                        <button
                          key={classItem.id}
                          onClick={() => setEstCarType(classItem.id)}
                          className={cn(
                            "p-2 text-left rounded-xl border transition-all flex flex-col justify-between min-h-[56px]",
                            estCarType === classItem.id
                              ? "bg-apple-blue border-apple-blue text-white shadow-sm"
                              : "bg-[var(--text-primary)] dark:bg-white/5 border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white"
                          )}
                        >
                          <span className="text-[10px] font-bold block">{classItem.label}</span>
                          <span className={cn("text-[7px] block truncate", estCarType === classItem.id ? "text-white/80" : "text-[var(--text-secondary)]")}>
                            {classItem.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Vehicle Value */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Estimated Car Value (PKR)</label>
                    <input 
                      type="number"
                      placeholder="e.g. 3,500,000"
                      value={estValue}
                      onChange={(e) => setEstValue(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[var(--text-primary)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 focus:bg-white dark:focus:bg-black rounded-xl text-xs font-bold outline-none transition-all shadow-inner text-[var(--text-primary)] dark:text-white font-mono"
                    />
                  </div>

                  {/* Dynamic Premium block */}
                  <div className="bg-apple-blue/5 dark:bg-apple-blue/10 border border-apple-blue/15 rounded-2xl p-4 flex justify-between items-center mt-5">
                    <div>
                      <span className="text-[8px] font-extrabold text-apple-blue uppercase tracking-wider block">ESTIMATED ANNUAL PREMIUM</span>
                      <span className="text-xl font-bold font-mono text-[var(--text-primary)] dark:text-white">PKR {calculatedPremium.toLocaleString()}</span>
                      <span className="text-[8px] text-[var(--text-secondary)] block mt-0.5">Free tracker installation included.</span>
                    </div>

                    <button
                      onClick={handleBookNow}
                      className="px-4 py-2.5 bg-apple-blue hover:bg-blue-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Insurance Coverage Explorer */}
      <section id="how-it-works" className="py-12 max-w-[1024px] mx-auto px-6 sm:px-8">
        <InsuranceCoverageExplorer />
      </section>

      {/* Trust & Danger section: "Why get Pakizzle Insurance?" */}
      <section className="py-20 max-w-[1024px] mx-auto px-6 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-[10px] font-extrabold text-apple-blue uppercase tracking-[0.2em] block">
            ACCIDENT RISK INSIGHTS IN PAKISTAN
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-tight">
            Avoid Massive Accident Expense Shockwaves
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            In Pakistan, standard auto repair parts have surged over 250% in cost. A simple fender collision can leave you with hundreds of thousands in immediate repair bills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Free Satellite Tracking Node",
              desc: "Immediate 24/7 localized recovery dispatch coordinates on auto-theft alarms. Restores your mental state with immediate geo-fence breach tracking on your smartphone.",
              icon: Compass,
              metric: "98.9% Recovery Rate"
            },
            {
              title: "120-Second Instant Approvals",
              desc: "Skip long, frustrating survey processing queues. Snap panel damage photographs and upload directly to initiate rapid claim settlements at zero interest.",
              icon: Zap,
              metric: "AI-Powered Survey Engine"
            },
            {
              title: "Authorized Dealership Repairs",
              desc: "No low-quality local workshops. Your car is restored at certified 3S OEM workshops using genuine factory-original spares to maintain paint thickness standards.",
              icon: Award,
              metric: "Factory Genuine Spares"
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-[var(--bg-surface)] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-6 space-y-5 shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
              <div className="w-10 h-10 rounded-xl bg-apple-blue/5 dark:bg-apple-blue/10 border border-apple-blue/10 flex items-center justify-center text-apple-blue">
                <item.icon className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[8px] font-black uppercase text-[var(--text-secondary)] tracking-widest block font-mono">{item.metric}</span>
                <h3 className="text-sm font-bold text-[var(--text-primary)] dark:text-white">{item.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="py-12">
        <InsuranceComparisonTable />
      </section>

      {/* Live Signals & Roadside Rescue Tracker section */}
      <section className="py-16 max-w-[1024px] mx-auto px-6 sm:px-8">
        <LiveClaimsRadar />
      </section>

      {/* Policy Cost Dynamic Simulator */}
      <section className="py-16 max-w-[1024px] mx-auto px-6 sm:px-8">
        <ClaimSettlementSimulator />
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-24 max-w-[768px] mx-auto px-6 sm:px-8 border-t border-black/[0.05] dark:border-white/5">
        <div className="text-center space-y-2 mb-16">
          <span className="text-[10px] font-extrabold text-apple-blue uppercase tracking-[0.2em] block">
            COMMON INQUIRIES
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            All you need to know about our comprehensive insurance shields, tracking devices, and claim dispatch loops.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIdx === idx;
            return (
              <div 
                key={idx} 
                className="bg-white dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex justify-between items-center gap-4 text-sm font-semibold text-[var(--text-primary)] dark:text-white"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={cn("w-4 h-4 text-[var(--text-secondary)] transition-transform duration-300 shrink-0", isOpen ? "rotate-180 text-apple-blue" : "")} />
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-black/[0.02] dark:border-white/[0.02]">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      <Footer onValuationClick={() => {}} />
    </div>
  );
}
