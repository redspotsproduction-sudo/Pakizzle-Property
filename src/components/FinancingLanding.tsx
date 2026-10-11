import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Banknote, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  ChevronDown,
  ArrowRight, 
  Calculator, 
  Percent, 
  FileText,
  CheckCircle2,
  Sparkles,
  Wallet,
  Building2,
  Info,
  Sliders,
  AlertCircle,
  Award,
  Zap,
  Check,
  Scale
} from 'lucide-react';
import { cn, formatPrice } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { toast } from 'sonner';

// Import our advanced modules
import { 
  FinancingEligibilityExplorer, 
  AmortizationVisualizer, 
  IslamicVsConventionalFinancing 
} from './AdvancedFinancingWidgets';
import FinancingComparisonTable from './FinancingComparisonTable';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "What is the minimum down payment required by SBP regulations?",
    answer: "Under the State Bank of Pakistan auto-Prudential regulations, the minimum down payment is 30% of the vehicle value for passenger cars. For commercial vehicles or specific clean-energy EVs, the requirements may vary, but 30% remains the industry standard."
  },
  {
    question: "Can I finance used cars or is it only for brand new cars?",
    answer: "Yes, you can finance both brand new and used vehicles up to 9 years old at the time of loan maturity. Our certified inspection team handles the physical condition audit to lock down the vehicle's actual market valuation."
  },
  {
    question: "Are there any hidden charges like tracker activation fees?",
    answer: "No. Pakizzle Capital includes a free high-end satellite tracker device and installation. Subsidized comprehensive insurance (or Takaful) is pre-factored directly into your monthly installment schedule, with zero hidden setup charges."
  },
  {
    question: "Is my debt-to-burden ratio (DBR) audited?",
    answer: "Yes. Under SBP auto regulations, your combined monthly loan repayments must not exceed 40% of your net monthly salary. You can verify your standing using our interactive State Bank Eligibility Assessor widget below."
  },
  {
    question: "Can overseas Pakistanis apply for car financing?",
    answer: "Yes, overseas Pakistanis can easily apply under a customized co-borrower structure. A resident immediate family member acts as the primary borrower, while the overseas Pakistani serves as the co-guarantor with foreign income verification."
  },
  {
    question: "What is Islamic Car Ijarah and how does it differ?",
    answer: "Islamic Car Ijarah is a lease agreement based on Shariah principles. The bank purchases the vehicle and rents it to you. You pay monthly rentals, and ownership is transferred once the lease completes. Unlike conventional loans, there are zero compounding late interest penalties; any penalty is donated to charity."
  }
];

export default function FinancingLanding() {
  const navigate = useNavigate();

  // Interactive estimator states
  const [estType, setEstType] = useState<'salaried' | 'business'>('salaried');
  const [estValue, setEstValue] = useState<string>('4500000'); // Default 45 Lacs
  const [estDownPct, setEstDownPct] = useState<number>(30); // 30% Down
  const [estTenure, setEstTenure] = useState<number>(3); // 3 Years

  // FAQ Expand state
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  // Dynamic estimate calculation
  const calculatedEmi = useMemo(() => {
    const numericValue = Number(estValue.replace(/,/g, '')) || 4500000;
    const downPayment = numericValue * (estDownPct / 100);
    const loanAmount = numericValue - downPayment;
    const months = estTenure * 12;
    
    // Preferential rates: salaried gets 15.2% APR, business gets 15.8% APR
    const annualRate = estType === 'salaried' ? 0.152 : 0.158;
    const monthlyRate = annualRate / 12;

    if (loanAmount <= 0) return 0;
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi);
  }, [estType, estValue, estDownPct, estTenure]);

  const handleContinueApply = () => {
    toast.success("Installment plan locked!", {
      description: `Proceeding with pre-approval application.`
    });
    // Redirect to apply page with prefilled parameters
    navigate(`/financing/apply/personal?value=${estValue}&downPct=${estDownPct}&tenure=${estTenure}`);
  };

  return (
    <div className="text-[var(--text-primary)] dark:text-[var(--text-primary)] antialiased min-h-screen bg-[var(--text-primary)] dark:bg-[var(--bg-page)] transition-colors duration-500 selection:bg-apple-blue/10 selection:text-apple-blue">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pb-28 overflow-hidden bg-gradient-to-b from-white to-[var(--text-primary)] dark:from-[var(--bg-surface)] dark:to-[var(--bg-page)] border-b border-black/[0.04] dark:border-white/[0.04]">
        {/* Abstract gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[100px] pointer-events-none -mr-40 -mt-20" />
        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-apple-blue/5 dark:bg-apple-blue/5 rounded-full blur-[80px] pointer-events-none -ml-40 -mb-20" />

        <div className="max-w-[1024px] mx-auto px-6 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading and Pitch */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/15 text-xs font-bold text-purple-600 dark:text-purple-400 tracking-wide">
                <Percent className="w-3.5 h-3.5" />
                Pakistan’s Most Transparent Auto Capital Terminal
              </div>

              <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-[1.1]">
                Drive now. <br />
                <span className="text-apple-blue font-bold">Pay monthly at your pace.</span>
              </h1>
              
              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-xl">
                Unlock competitive rates for individual auto loans and corporate fleets. Partnered with Pakistan's premier underwriting pools to offer 12-hour pre-approval, zero hidden fees, and complimentary tracking devices.
              </p>

              <div className="flex flex-wrap gap-4 items-center pt-2">
                <button
                  onClick={() => navigate('/financing/apply/personal')}
                  className="px-6 py-3 text-xs font-semibold bg-apple-blue hover:bg-blue-600 text-white rounded-full transition-all shadow-md flex items-center gap-2 group"
                >
                  Start Pre-Approval File
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <a 
                  href="#assessor-tools"
                  className="text-xs font-bold text-[var(--text-primary)] dark:text-white hover:text-apple-blue transition-colors flex items-center gap-1"
                >
                  Explore Financial Models
                  <ChevronDown className="w-4 h-4 animate-bounce" />
                </a>
              </div>

              {/* Trust markers */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-black/[0.05] dark:border-white/5 max-w-lg">
                <div>
                  <span className="block text-xl sm:text-2xl font-bold text-apple-blue font-mono">12 Hrs</span>
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">Fast Approval</span>
                </div>
                <div>
                  <span className="block text-xl sm:text-2xl font-bold text-[var(--text-primary)] dark:text-white font-mono">0%</span>
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">Hidden Charges</span>
                </div>
                <div>
                  <span className="block text-xl sm:text-2xl font-bold text-apple-green font-mono">Free</span>
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">GPS Tracker Node</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Quick Estimate Widget */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-[var(--bg-surface)] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-5 sm:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 to-apple-blue" />
                
                <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)] mb-1">Interactive Lease Estimator</h3>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] dark:text-white leading-tight mb-5">Configure Installment Plan</h2>

                <div className="space-y-4">
                  {/* Employment Type */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Employment Stream</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'salaried' as const, label: 'Salaried' },
                        { id: 'business' as const, label: 'Self-Employed / Business' }
                      ].map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setEstType(type.id)}
                          className={cn(
                            "py-2 text-[10px] font-bold rounded-xl border text-center transition-all",
                            estType === type.id
                              ? "bg-apple-blue border-apple-blue text-white shadow-sm"
                              : "bg-[var(--text-primary)] dark:bg-white/5 border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white"
                          )}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Vehicle Capital Value */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Estimated Vehicle Price (PKR)</label>
                    <input 
                      type="number"
                      placeholder="e.g. 4,500,000"
                      value={estValue}
                      onChange={(e) => setEstValue(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[var(--text-primary)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 focus:bg-white dark:focus:bg-black rounded-xl text-xs font-bold outline-none transition-all shadow-inner text-[var(--text-primary)] dark:text-white font-mono"
                    />
                  </div>

                  {/* Down Payment & Tenure Double Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Down Payment</label>
                      <select
                        value={estDownPct}
                        onChange={(e) => setEstDownPct(Number(e.target.value))}
                        className="w-full px-3 py-2.5 bg-[var(--text-primary)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 focus:bg-white dark:focus:bg-black rounded-xl text-xs font-bold outline-none transition-all text-[var(--text-primary)] dark:text-white font-mono"
                      >
                        <option value={30}>30% (Min)</option>
                        <option value={40}>40%</option>
                        <option value={50}>50%</option>
                        <option value={60}>60%</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Tenure Plan</label>
                      <select
                        value={estTenure}
                        onChange={(e) => setEstTenure(Number(e.target.value))}
                        className="w-full px-3 py-2.5 bg-[var(--text-primary)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 focus:bg-white dark:focus:bg-black rounded-xl text-xs font-bold outline-none transition-all text-[var(--text-primary)] dark:text-white font-mono"
                      >
                        <option value={2}>24 Months</option>
                        <option value={3}>36 Months</option>
                        <option value={5}>60 Months</option>
                      </select>
                    </div>
                  </div>

                  {/* Dynamic Estimate block */}
                  <div className="bg-apple-blue/5 dark:bg-apple-blue/10 border border-apple-blue/15 rounded-2xl p-4 flex justify-between items-center mt-5">
                    <div>
                      <span className="text-[8px] font-extrabold text-apple-blue uppercase tracking-wider block font-mono">ESTIMATED INSTALMENT</span>
                      <span className="text-lg font-extrabold font-mono text-[var(--text-primary)] dark:text-white">{formatPrice(calculatedEmi)}<span className="text-[10px] font-sans font-normal text-[var(--text-secondary)]">/mo</span></span>
                      <span className="text-[7px] text-[var(--text-secondary)] block mt-0.5">Complimentary tracker subscription.</span>
                    </div>

                    <button
                      onClick={handleContinueApply}
                      className="px-4 py-2.5 bg-apple-blue hover:bg-blue-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm shrink-0"
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

      {/* Interactive Assessor and Explorer Tools */}
      <section id="assessor-tools" className="py-20 max-w-[1024px] mx-auto px-6 sm:px-8 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-extrabold text-apple-blue uppercase tracking-[0.2em] block">
            INTERACTIVE CAPABILITY MATRIX
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-tight">
            Perform Fine-Grained Eligibility Analysis
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Under State Bank rules, auto loans have strict constraints. Use our visual modeling modules below to optimize your credit application.
          </p>
        </div>

        {/* Assessor 1 */}
        <FinancingEligibilityExplorer />

        {/* Assessor 2 */}
        <AmortizationVisualizer />

        {/* Assessor 3 */}
        <IslamicVsConventionalFinancing />
      </section>

      {/* Why Lease Section */}
      <section className="py-20 bg-white dark:bg-[var(--bg-surface)] border-y border-black/[0.04] dark:border-white/[0.04]">
        <div className="max-w-[1024px] mx-auto px-6 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-[10px] font-extrabold text-apple-blue uppercase tracking-[0.2em] block">
              THE PAKIZZLE ADVANTAGE
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-tight">
              The Smoothest Lending Journey Imaginable
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Say goodbye to endless branch visits, hidden markup hikes, and stressful paper trails. 
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "100% Digitized Filing",
                desc: "Scan and upload bank statements and identity documents securely directly from your smartphone. No complex physical paperwork or bank appointments required.",
                icon: FileText,
                metric: "Paperless Streamlining"
              },
              {
                title: "Complimentary Tracking Unit",
                desc: "We supply and install a premium satellite-mapped GPS vehicle tracker node free of setup or activation fees, ensuring immediate security for your financed asset.",
                icon: ShieldCheck,
                metric: "Value Added Safety"
              },
              {
                title: "Accelerated Decisioning",
                desc: "Our automated underwriter algorithms parse credit markers instantly to provide definitive pre-approvals inside 12 to 24 hours.",
                icon: Zap,
                metric: "12-Hour Approvals"
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-[var(--text-primary)] dark:bg-[var(--bg-page)] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-6 space-y-5 shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
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
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="py-12">
        <FinancingComparisonTable />
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-24 max-w-[768px] mx-auto px-6 sm:px-8 border-t border-black/[0.05] dark:border-white/5">
        <div className="text-center space-y-2 mb-16">
          <span className="text-[10px] font-extrabold text-apple-blue uppercase tracking-[0.2em] block">
            REGULATORY & FAQS
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            All you need to know about debt burden ratios, Shariah compliance, tracker installations, and pre-approval procedures.
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
