import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Check, 
  ChevronRight, 
  Coins, 
  HelpCircle, 
  Info, 
  Scale, 
  ShieldCheck, 
  Sliders, 
  Sparkles, 
  TrendingUp, 
  Percent, 
  DollarSign, 
  UserCheck, 
  Briefcase, 
  Wallet,
  AlertCircle,
  Clock,
  Gauge
} from 'lucide-react';
import { cn, formatPrice } from '../lib/utils';

// ==========================================
// WIDGET 1: FINANCING ELIGIBILITY EXPLORER
// ==========================================
export function FinancingEligibilityExplorer() {
  const [salary, setSalary] = useState<number>(250000); // Default 2.5 Lacs
  const [currentEmi, setCurrentEmi] = useState<number>(20000); // Other commitments
  const [targetCarPrice, setTargetCarPrice] = useState<number>(4500000); // 45 Lacs

  // State Bank of Pakistan regulation: Debt Burden Ratio (DBR) should generally not exceed 40% of net disposable income.
  const dbrLimit = 0.40;

  const { dbr, maxAllowableEmi, eligibilityStatus, ratingColor, explanation, activeOffer } = useMemo(() => {
    // Estimating a standard EMI for the target car under a 3-year term, 30% down payment (70% loan) at 15.5% APR
    const loanAmount = targetCarPrice * 0.7;
    const rate = 0.155 / 12;
    const months = 36;
    const estimatedEmi = (loanAmount * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);

    const totalCommittedExpenses = currentEmi + estimatedEmi;
    const dbrRatio = totalCommittedExpenses / salary;
    const maxEmi = (salary * dbrLimit) - currentEmi;

    let status = 'Excellent';
    let color = 'text-apple-green bg-apple-green/10 border-apple-green/20';
    let desc = 'You are highly eligible! Your income strongly covers the estimated installments with minimal debt burden.';
    let offer = 'Pre-approved for instant 0% processing fees.';

    if (dbrRatio <= 0.25) {
      status = 'A+ Pristine';
      color = 'text-apple-green bg-apple-green/10 border-apple-green/20';
      desc = 'Premium class eligibility. You qualify for our lowest preferential markup rates starting from 14.9% APR.';
      offer = 'Eligible for Fast-Track 12-hour dispatch.';
    } else if (dbrRatio <= 0.40) {
      status = 'A Standard';
      color = 'text-apple-blue bg-apple-blue/5 border-apple-blue/15';
      desc = 'Healthy debt profile. Well within State Bank thresholds. Approval probability is extremely high.';
      offer = 'Complimentary first-year tracker subscription.';
    } else if (dbrRatio <= 0.50) {
      status = 'B Borderline';
      color = 'text-gold-decoration bg-gold-decoration/10 border-gold-decoration/20';
      desc = 'Approval is possible, but underwriters may ask for a co-borrower or request a higher down payment (e.g. 40%).';
      offer = 'Needs co-guarantor declaration.';
    } else {
      status = 'Overleveraged';
      color = 'text-red-500 bg-red-500/10 border-red-500/20';
      desc = 'Exceeds standard DBR limits. We highly recommend selecting a lower-priced car or increasing your down payment to reduce loan exposure.';
      offer = 'Increase down payment to unlock approval.';
    }

    return {
      dbr: Math.round(dbrRatio * 100),
      maxAllowableEmi: Math.max(0, Math.round(maxEmi)),
      eligibilityStatus: status,
      ratingColor: color,
      explanation: desc,
      activeOffer: offer
    };
  }, [salary, currentEmi, targetCarPrice]);

  return (
    <div className="bg-white dark:bg-[var(--bg-surface)] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-6 sm:p-8 relative overflow-hidden shadow-sm transition-colors duration-300">
      <div className="absolute top-0 right-0 w-80 h-80 bg-apple-blue/5 rounded-full blur-[80px] pointer-events-none -mr-24 -mt-24" />
      
      <div className="relative z-10 space-y-2 mb-8">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-apple-blue bg-apple-blue/5 dark:bg-apple-blue/10 rounded-full border border-apple-blue/15">
            Credit Analytics Node
          </span>
          <span className="text-[10px] text-apple-green font-bold uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-apple-green rounded-full animate-ping" />
            SBP Guidelines Engine v2.4
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white">
          State Bank Eligibility Assessor
        </h2>
        <p className="text-xs text-[var(--text-secondary)] max-w-2xl leading-relaxed">
          Estimate your borrowing eligibility instantly based on Debt Burden Ratio (DBR) calculations set by national regulatory guidelines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Sliders Container (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Salary Slider */}
          <div className="space-y-2 bg-[var(--text-primary)] dark:bg-black/35 p-5 rounded-2xl border border-black/[0.02] dark:border-white/[0.01]">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-wider block">Net Monthly Salary</label>
              <span className="text-xs font-bold text-apple-blue font-mono">{formatPrice(salary)}</span>
            </div>
            <input 
              type="range" 
              min="50000" 
              max="1500000" 
              step="10000"
              value={salary}
              onChange={(e) => setSalary(Number(e.target.value))}
              className="w-full accent-apple-blue cursor-pointer h-1 bg-black/10 dark:bg-white/10 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[8px] text-[var(--text-secondary)] font-mono">
              <span>PKR 50K</span>
              <span>PKR 750K</span>
              <span>PKR 1.5M</span>
            </div>
          </div>

          {/* Existing Liabilities Slider */}
          <div className="space-y-2 bg-[var(--text-primary)] dark:bg-black/35 p-5 rounded-2xl border border-black/[0.02] dark:border-white/[0.01]">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-wider block">Existing Monthly Loan EMIs</label>
              <span className="text-xs font-bold text-[var(--text-primary)] dark:text-white font-mono">{formatPrice(currentEmi)}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="300000" 
              step="5000"
              value={currentEmi}
              onChange={(e) => setCurrentEmi(Number(e.target.value))}
              className="w-full accent-apple-blue cursor-pointer h-1 bg-black/10 dark:bg-white/10 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[8px] text-[var(--text-secondary)] font-mono">
              <span>PKR 0</span>
              <span>PKR 150K</span>
              <span>PKR 300K</span>
            </div>
          </div>

          {/* Target Car Price */}
          <div className="space-y-2 bg-[var(--text-primary)] dark:bg-black/35 p-5 rounded-2xl border border-black/[0.02] dark:border-white/[0.01]">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-wider block">Intended Car Price</label>
              <span className="text-xs font-bold text-apple-green font-mono">{formatPrice(targetCarPrice)}</span>
            </div>
            <input 
              type="range" 
              min="1000000" 
              max="25000000" 
              step="100000"
              value={targetCarPrice}
              onChange={(e) => setTargetCarPrice(Number(e.target.value))}
              className="w-full accent-apple-blue cursor-pointer h-1 bg-black/10 dark:bg-white/10 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[8px] text-[var(--text-secondary)] font-mono">
              <span>PKR 1.0M</span>
              <span>PKR 13M</span>
              <span>PKR 25M</span>
            </div>
          </div>
        </div>

        {/* Results Container (5 cols) */}
        <div className="lg:col-span-5 bg-[var(--text-primary)] dark:bg-[var(--bg-raised)] rounded-2xl border border-black/[0.03] dark:border-white/[0.02] p-5 sm:p-6 space-y-6">
          <div className="space-y-2">
            <span className="text-[8px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider block">CALCULATED CREDIT RATING</span>
            <div className="flex justify-between items-center">
              <span className={cn("px-3 py-1.5 rounded-full text-xs font-extrabold uppercase border tracking-wider", ratingColor)}>
                {eligibilityStatus}
              </span>
              <span className="text-xl font-bold font-mono text-[var(--text-primary)] dark:text-white">DBR: {dbr}%</span>
            </div>
          </div>

          <div className="h-px bg-black/[0.05] dark:bg-white/5" />

          {/* Progress Bar Gauge */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[9px] font-bold text-[var(--text-secondary)]">
              <span>Debt Burden Ratio (Max Limit: 40%)</span>
              <span className={cn("font-mono font-bold", dbr > 40 ? "text-red-500" : "text-apple-green")}>
                {dbr}% / 40%
              </span>
            </div>
            <div className="h-2 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  dbr > 40 ? "bg-red-500" : dbr > 25 ? "bg-apple-blue" : "bg-apple-green"
                )}
                style={{ width: `${Math.min(100, dbr)}%` }}
              />
            </div>
          </div>

          <div className="space-y-2 bg-white dark:bg-black/20 border border-black/[0.03] dark:border-white/[0.02] p-4 rounded-xl">
            <div className="flex gap-2 items-start text-[10px] text-[var(--text-secondary)] leading-relaxed">
              <Info className="w-3.5 h-3.5 text-apple-blue shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-[var(--text-primary)] dark:text-white block mb-0.5">Max Allowable Monthly EMI</span>
                <span className="text-sm font-extrabold font-mono text-[var(--text-primary)] dark:text-white block">{formatPrice(maxAllowableEmi)}</span>
                <p className="mt-1">{explanation}</p>
              </div>
            </div>
          </div>

          {dbr <= 40 && (
            <div className="p-3 bg-apple-green/5 dark:bg-apple-green/10 border border-apple-green/10 rounded-xl flex items-center gap-2 text-[9px] font-bold text-apple-green dark:text-apple-green">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{activeOffer}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ==========================================
// WIDGET 2: AMORTIZATION VISUALIZER
// ==========================================
export function AmortizationVisualizer() {
  const [carPrice, setCarPrice] = useState<number>(5500000); // Default 55 Lacs
  const [downPaymentPct, setDownPaymentPct] = useState<number>(30); // 30% min
  const [tenureYears, setTenureYears] = useState<number>(3); // 3 years (36 months)

  const aprRate = 0.155; // 15.5%

  const calcDetails = useMemo(() => {
    const downPayment = carPrice * (downPaymentPct / 100);
    const principalLoanAmount = carPrice - downPayment;
    const months = tenureYears * 12;
    const monthlyRate = aprRate / 12;

    const emi = (principalLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayments = emi * months;
    const totalInterest = totalPayments - principalLoanAmount;
    const totalOwnershipCost = downPayment + totalPayments;

    return {
      downPayment: Math.round(downPayment),
      loanAmount: Math.round(principalLoanAmount),
      monthlyEmi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalCost: Math.round(totalOwnershipCost),
      markupPercentOfCar: Math.round((totalInterest / carPrice) * 100)
    };
  }, [carPrice, downPaymentPct, tenureYears]);

  return (
    <div className="bg-white dark:bg-[var(--bg-surface)] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-6 sm:p-8 relative overflow-hidden shadow-sm transition-colors duration-300">
      <div className="absolute top-0 left-0 w-80 h-80 bg-gold-decoration/5 rounded-full blur-[80px] pointer-events-none -ml-24 -mt-24" />

      <div className="relative z-10 space-y-2 mb-8">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-gold-decoration bg-gold-decoration/5 dark:bg-gold-decoration/10 rounded-full border border-gold-decoration/15">
            Amortization Engine
          </span>
          <span className="text-[10px] text-gold-decoration font-bold uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Flexible Tenure Grid
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white">
          Interactive Amortization Simulator
        </h2>
        <p className="text-xs text-[var(--text-secondary)] max-w-2xl leading-relaxed">
          Manipulate down payment margins and loan durations. See the true cost break-up of your premium lease package over time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
        
        {/* Left Interactive Side (6 cols) */}
        <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Price Selection */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Vehicle Capital Value (PKR)</label>
              <div className="relative">
                <input 
                  type="number"
                  placeholder="e.g. 5,500,000"
                  value={carPrice}
                  onChange={(e) => setCarPrice(Math.max(0, Number(e.target.value)))}
                  className="w-full px-4 py-3 bg-[var(--text-primary)] dark:bg-black/30 border border-transparent focus:border-apple-blue/30 focus:bg-white dark:focus:bg-black rounded-xl text-xs font-bold outline-none transition-all text-[var(--text-primary)] dark:text-white font-mono"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                  PKR
                </div>
              </div>
            </div>

            {/* Down Payment % Slider */}
            <div className="space-y-2 bg-[var(--text-primary)] dark:bg-black/35 p-5 rounded-2xl border border-black/[0.02] dark:border-white/[0.01]">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-wider block">Down Payment: <span className="text-apple-blue font-mono">{downPaymentPct}%</span></label>
                <span className="text-xs font-bold text-apple-blue font-mono">{formatPrice(calcDetails.downPayment)}</span>
              </div>
              <input 
                type="range" 
                min="30" 
                max="80" 
                step="5"
                value={downPaymentPct}
                onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                className="w-full accent-apple-blue cursor-pointer h-1 bg-black/10 dark:bg-white/10 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[8px] text-[var(--text-secondary)] font-mono">
                <span>30% (Min)</span>
                <span>55%</span>
                <span>80% (Max)</span>
              </div>
            </div>

            {/* Tenure Selectors */}
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Loan Tenure Duration</label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((years) => (
                  <button
                    key={years}
                    onClick={() => setTenureYears(years)}
                    className={cn(
                      "py-2.5 text-xs font-bold rounded-xl border text-center transition-all",
                      tenureYears === years
                        ? "bg-apple-blue border-apple-blue text-white shadow-sm"
                        : "bg-[var(--text-primary)] dark:bg-white/5 border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white"
                    )}
                  >
                    {years} Yr
                    <span className="block text-[7px] font-medium opacity-70">{years * 12}M</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gold-decoration/5 border border-gold-decoration/10 p-4 rounded-xl flex items-start gap-3 mt-4">
            <Info className="w-4 h-4 text-gold-decoration shrink-0 mt-0.5" />
            <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
              *Calculated with a standardized reference rate of <span className="font-bold text-[var(--text-primary)] dark:text-white font-mono">15.5% APR</span>. Your final underwriting rate may fluctuate between 14.5% and 18% based on security score.
            </p>
          </div>
        </div>

        {/* Right Output Visual Chart Block (6 cols) */}
        <div className="lg:col-span-6 bg-[var(--text-primary)] dark:bg-[var(--bg-raised)] rounded-2xl border border-black/[0.03] dark:border-white/[0.02] p-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div>
              <span className="text-[8px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider block">MONTHLY BUDGET REQUIREMENT</span>
              <span className="text-3xl font-extrabold font-mono text-[var(--text-primary)] dark:text-white block mt-1 tracking-tight">
                {formatPrice(calcDetails.monthlyEmi)}
                <span className="text-xs font-bold text-[var(--text-secondary)] tracking-normal font-sans ml-1">/ Month</span>
              </span>
            </div>

            <div className="h-px bg-black/[0.05] dark:bg-white/5" />

            {/* Visual Segmented Stack bar */}
            <div className="space-y-2">
              <span className="text-[8px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider block">LOAN DEPLOYMENT BALANCE</span>
              <div className="h-4 w-full bg-black/10 dark:bg-white/10 rounded-md overflow-hidden flex font-mono text-[8px] text-white font-bold">
                <div 
                  className="bg-apple-blue h-full flex items-center justify-center transition-all duration-500"
                  style={{ width: `${downPaymentPct}%` }}
                  title="Down Payment"
                >
                  {downPaymentPct >= 15 && `${downPaymentPct}%`}
                </div>
                <div 
                  className="bg-apple-green h-full flex items-center justify-center transition-all duration-500"
                  style={{ width: `${(calcDetails.loanAmount / calcDetails.totalCost) * 100}%` }}
                  title="Principal Loan"
                >
                  Principal
                </div>
                <div 
                  className="bg-purple-500 h-full flex items-center justify-center transition-all duration-500"
                  style={{ width: `${(calcDetails.totalInterest / calcDetails.totalCost) * 100}%` }}
                  title="Lease Mark-up"
                >
                  Mark-up
                </div>
              </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-0.5">
                <span className="text-[8px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider block">LOAN PRINCIPAL</span>
                <span className="text-sm font-extrabold text-[var(--text-primary)] dark:text-white font-mono">{formatPrice(calcDetails.loanAmount)}</span>
              </div>
              <div className="space-y-0.5 text-right">
                <span className="text-[8px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider block">CUMULATIVE MARK-UP</span>
                <span className="text-sm font-extrabold text-purple-500 font-mono">+{formatPrice(calcDetails.totalInterest)}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider block">DOWN PAYMENT CASH</span>
                <span className="text-sm font-extrabold text-apple-blue font-mono">{formatPrice(calcDetails.downPayment)}</span>
              </div>
              <div className="space-y-0.5 text-right">
                <span className="text-[8px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider block">TOTAL OWNERSHIP COST</span>
                <span className="text-sm font-extrabold text-apple-green font-mono">{formatPrice(calcDetails.totalCost)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-black/[0.05] dark:border-white/5 flex justify-between items-center text-[10px] text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400">
              <Percent className="w-3.5 h-3.5" />
              Markup equals {calcDetails.markupPercentOfCar}% of car value
            </span>
            <span className="text-[8px] uppercase tracking-wider bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full font-mono font-bold">
              {tenureYears * 12} Cycles
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

// ==========================================
// WIDGET 3: ISLAMIC VS CONVENTIONAL FINANCING
// ==========================================
export function IslamicVsConventionalFinancing() {
  const [activeTab, setActiveTab] = useState<'islamic' | 'conventional'>('islamic');

  const differences = [
    {
      title: "Core Transaction Structure",
      islamic: "Based on Ijarah (Islamic Lease). The bank purchases the car and rents it to the customer. Once the rental tenure finishes, the car is gifted or sold at a nominal rate.",
      conventional: "Based on Interest Loan. The bank lends cash to the customer to purchase the car. The customer repays the loan principal with a pre-set compound interest rate.",
    },
    {
      title: "Vehicle Ownership Status",
      islamic: "The vehicle remains in the absolute legal ownership of the bank throughout the leasing term. Customer acts purely as a renter or temporary user.",
      conventional: "The vehicle is owned by the customer, but under hypothecation/lien to the bank as security until the loan is fully paid off.",
    },
    {
      title: "Late Payment Penalties",
      islamic: "No interest compound penalties allowed. Late fees are strictly sent as a donation to charity by the bank and do not become part of bank earnings.",
      conventional: "Late fees are added as a percentage of the overdue installment and compound onto the outstanding loan balance, increasing bank earnings.",
    },
    {
      title: "Insurance Coverage Mode",
      islamic: "The vehicle must be covered by Shariah-compliant Takaful (Mutual Pool system) paid by the bank as the owner, or factored into the rentals.",
      conventional: "The vehicle is covered by commercial insurance, paid and maintained directly by the customer as the absolute owner.",
    },
    {
      title: "Repayment Risk Allocation",
      islamic: "If the vehicle is completely destroyed or stolen (force majeure), the rental ceases instantly. The bank bears the loss and recovers from Takaful.",
      conventional: "If the vehicle is destroyed, the customer is still legally obliged to repay the remaining loan balance entirely to the bank.",
    }
  ];

  return (
    <div className="bg-white dark:bg-[var(--bg-surface)] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-6 sm:p-8 relative overflow-hidden shadow-sm transition-colors duration-300">
      <div className="absolute top-0 right-0 w-80 h-80 bg-apple-green/5 rounded-full blur-[80px] pointer-events-none -mr-24 -mt-24" />

      <div className="relative z-10 space-y-2 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-apple-green bg-apple-green/5 dark:bg-apple-green/10 rounded-full border border-apple-green/15">
              100% Shariah Compliance Guide
            </span>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white">
              Islamic Car Ijarah vs Conventional Lease
            </h2>
          </div>
          
          {/* Custom Tabs */}
          <div className="bg-[var(--text-primary)] dark:bg-black/35 p-1 rounded-full border border-black/[0.03] dark:border-white/[0.02] flex">
            <button
              onClick={() => setActiveTab('islamic')}
              className={cn(
                "px-4 py-1.5 text-[10px] font-bold rounded-full transition-all",
                activeTab === 'islamic'
                  ? "bg-apple-green text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white"
              )}
            >
              Islamic (Ijarah)
            </button>
            <button
              onClick={() => setActiveTab('conventional')}
              className={cn(
                "px-4 py-1.5 text-[10px] font-bold rounded-full transition-all",
                activeTab === 'conventional'
                  ? "bg-apple-blue text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white"
              )}
            >
              Conventional Lease
            </button>
          </div>
        </div>
        <p className="text-xs text-[var(--text-secondary)] max-w-2xl leading-relaxed">
          Understanding compliance pathways is critical for ethical financial planning. Explore how Islamic and conventional structures operate under State Bank mandates.
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {differences.map((diff, index) => (
          <div 
            key={index}
            className={cn(
              "p-5 rounded-2xl border transition-all space-y-3",
              activeTab === 'islamic'
                ? "bg-apple-green/[0.02] border-apple-green/10 dark:bg-apple-green/[0.01]"
                : "bg-apple-blue/[0.02] border-apple-blue/10 dark:bg-apple-blue/[0.01]"
            )}
          >
            <div className="flex gap-2.5 items-center">
              <div 
                className={cn(
                  "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-white",
                  activeTab === 'islamic' ? "bg-apple-green" : "bg-apple-blue"
                )}
              >
                <Scale className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-[var(--text-primary)] dark:text-white tracking-tight">
                {diff.title}
              </h3>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {activeTab === 'islamic' ? diff.islamic : diff.conventional}
            </p>
          </div>
        ))}

        {/* Shariah Certificate Callout */}
        <div className="md:col-span-2 bg-[var(--text-primary)] dark:bg-black/30 border border-black/[0.03] dark:border-white/[0.02] p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="flex gap-3 items-center text-center sm:text-left">
            <div className="w-10 h-10 rounded-full bg-apple-green/10 flex items-center justify-center text-apple-green">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[var(--text-primary)] dark:text-white">Fatwa Certified Islamic Financing</h4>
              <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Approved by independent Shariah boards of Meezan Bank and BankIslam.</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab(activeTab === 'islamic' ? 'conventional' : 'islamic')}
            className="px-4 py-2 text-[10px] font-bold bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-[var(--text-primary)] dark:text-white transition-all shrink-0"
          >
            Toggle Structural Rules
          </button>
        </div>
      </div>
    </div>
  );
}
