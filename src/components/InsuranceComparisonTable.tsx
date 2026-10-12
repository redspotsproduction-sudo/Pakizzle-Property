import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  ChevronRight, 
  ArrowRight, 
  Building2, 
  Star,
  Info,
  Check,
  X,
  Zap,
  Activity,
  History,
  Shield,
  Loader2,
  Lock,
  Sliders,
  DollarSign,
  Compass,
  CheckCircle,
  HelpCircle,
  Filter,
  Layers,
  Scale
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface InsuranceCompany {
  id: string;
  name: string;
  logoUrl: string;
  rate: string;
  trackerFee: string;
  isFeatured: boolean;
  order: number;
  status: 'active' | 'hidden';
  description?: string;
  // Advanced features
  claimRatio?: string;
  workshopNetwork?: string;
  deductible?: string;
  recoveryRate?: string;
  usp?: string;
  baseRateValue?: number; // numerical rate e.g. 1.45
}

const FALLBACK_COMPANIES: InsuranceCompany[] = [
  { 
    id: 'igi', 
    name: 'IGI Insurance', 
    logoUrl: 'https://www.igiinsurance.com.pk/wp-content/uploads/2021/04/igi-logo.jpg', 
    rate: 'Starting from 1.4%', 
    trackerFee: '12,000', 
    isFeatured: false, 
    order: 1, 
    status: 'active',
    claimRatio: '96.5%',
    workshopNetwork: '45+ 3S Certified Dealers',
    deductible: '0.5% or PKR 10,000 min',
    recoveryRate: '97.5% Recovery Rate',
    usp: 'Fastest digital claims & instant survey',
    baseRateValue: 1.45
  },
  { 
    id: 'tpl', 
    name: 'TPL Insurance', 
    logoUrl: 'https://tplinsurance.com/wp-content/uploads/2019/08/logo.png', 
    rate: '1.8%', 
    trackerFee: 'Free Tracker', 
    isFeatured: true, 
    order: 2, 
    status: 'active',
    claimRatio: '98.2%',
    workshopNetwork: '60+ Nationwide Network',
    deductible: '0.5% or PKR 12,000 min',
    recoveryRate: '99.1% (High-End Tracking)',
    usp: 'Best-in-class GPS tracker terminal',
    baseRateValue: 1.80
  },
  { 
    id: 'jubilee', 
    name: 'Jubilee General Insurance', 
    logoUrl: 'https://jubileegeneral.com.pk/wp-content/uploads/2020/09/JGI-Logo.png', 
    rate: '1.75%', 
    trackerFee: '11,000', 
    isFeatured: false, 
    order: 3, 
    status: 'active',
    claimRatio: '95.8%',
    workshopNetwork: '55+ Certified Workshops',
    deductible: '0.6% or PKR 10,000 min',
    recoveryRate: '98.0% Recovery Rate',
    usp: 'Most experienced insurance network',
    baseRateValue: 1.75
  },
  { 
    id: 'united', 
    name: 'United Insurance', 
    logoUrl: 'https://www.theunitedinsurance.com/images/uic-logo.png', 
    rate: 'Starting from 1.35%', 
    trackerFee: '10,000', 
    isFeatured: false, 
    order: 4, 
    status: 'active',
    claimRatio: '94.2%',
    workshopNetwork: '30+ Certified Workshops',
    deductible: '0.5% or PKR 8,000 min',
    recoveryRate: '95.0% Recovery Rate',
    usp: 'Highly economical annual premiums',
    baseRateValue: 1.35
  },
  { 
    id: 'efu', 
    name: 'EFU General Insurance Ltd', 
    logoUrl: 'https://efuinsurance.com/wp-content/uploads/2020/12/efu-logo.png', 
    rate: '1.95%', 
    trackerFee: 'Free Tracker', 
    isFeatured: false, 
    order: 5, 
    status: 'active',
    claimRatio: '97.4%',
    workshopNetwork: '70+ Premium Workshops',
    deductible: '0.5% or PKR 15,000 min',
    recoveryRate: '98.5% Recovery Rate',
    usp: 'Excellent premium claim size dispatch',
    baseRateValue: 1.95
  },
  { 
    id: 'pakqatar', 
    name: 'Pak Qatar Takaful', 
    logoUrl: 'https://www.pakqatar.com.pk/wp-content/uploads/2021/05/pq-logo.png', 
    rate: '1.4%', 
    trackerFee: '9,000', 
    isFeatured: true, 
    order: 6, 
    status: 'active',
    claimRatio: '96.1%',
    workshopNetwork: '40+ Takaful 3S Dealers',
    deductible: '0.4% or PKR 10,000 min',
    recoveryRate: '97.2% Recovery Rate',
    usp: '100% Shariah-Compliant Takaful Pool',
    baseRateValue: 1.40
  },
  { 
    id: 'ubl', 
    name: 'UBL Insurers Limited', 
    logoUrl: 'https://ublinsurers.com/wp-content/uploads/2020/12/ubl-logo.png', 
    rate: '1.65%', 
    trackerFee: '12,000', 
    isFeatured: false, 
    order: 7, 
    status: 'active',
    claimRatio: '95.2%',
    workshopNetwork: '35+ Nationwide Dealers',
    deductible: '0.5% or PKR 10,000 min',
    recoveryRate: '96.8% Recovery Rate',
    usp: 'Flexible zero-interest credit terms',
    baseRateValue: 1.65
  },
  { 
    id: 'alfalah', 
    name: 'Alfalah Insurance', 
    logoUrl: 'https://www.alfalahinsurance.com/wp-content/uploads/2021/04/alfalah-logo.png', 
    rate: '1.5%', 
    trackerFee: 'Free Tracker', 
    isFeatured: false, 
    order: 8, 
    status: 'active',
    claimRatio: '96.8%',
    workshopNetwork: '50+ Certified Dealers',
    deductible: '0.5% or PKR 10,000 min',
    recoveryRate: '97.9% Recovery Rate',
    usp: 'Seamless Bank Alfalah integration',
    baseRateValue: 1.50
  }
];

export default function InsuranceComparisonTable() {
  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDetails, setSelectedDetails] = useState<InsuranceCompany | null>(null);
  const navigate = useNavigate();

  // COMPARATOR USER STATES (Dynamic quote calculation)
  const [propertyCategory, setPropertyCategory] = useState<string>('House');
  const [propertyType, setPropertyType] = useState<string>('Luxury Villa');
  const [carValue, setCarValue] = useState<number>(350); // in Lakhs (e.g. 3.5 Crore)
  const [cityNode, setCityNode] = useState<'lhe' | 'khi' | 'isb'>('lhe');

  // Interactive Add-ons
  const [zeroDepreciation, setZeroDepreciation] = useState<boolean>(true);
  const [dealer3SRepair, setDealer3SRepair] = useState<boolean>(true);
  const [personalAccident, setPersonalAccident] = useState<boolean>(false);
  const [terrorismCover, setTerrorismCover] = useState<boolean>(false);

  // Filter list states
  const [filterTracker, setFilterTracker] = useState<'all' | 'free' | 'paid'>('all');
  const [minClaimRatio, setMinClaimRatio] = useState<number>(90);

  // Multi-plan compare states
  const [comparedPlanIds, setComparedPlanIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  // Presets of properties in Pakistan
  const CAR_PRESETS = [
    { label: '5-Marla Villa', make: 'House', model: '5-Marla Luxury Villa', value: 180 },
    { label: '10-Marla House', make: 'House', model: '10-Marla Contemporary House', value: 380 },
    { label: '1-Kanal Mansion', make: 'House', model: '1-Kanal Designer Mansion', value: 750 },
    { label: 'Luxury Flat', make: 'Apartment', model: '3-Bed Executive Flat', value: 240 },
    { label: 'Commercial Plaza', make: 'Commercial', model: 'Multi-Story Plaza', value: 1500 }
  ];

  useEffect(() => {
    const q = query(
      collection(db, 'insurance_companies'), 
      where('status', '==', 'active'),
      orderBy('order', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => {
        const data = doc.data();
        const fallback = FALLBACK_COMPANIES.find(c => c.id === doc.id);
        return { 
          id: doc.id, 
          ...data,
          claimRatio: data.claimRatio || fallback?.claimRatio || '96.0%',
          workshopNetwork: data.workshopNetwork || fallback?.workshopNetwork || '40+ Certified Workshops',
          deductible: data.deductible || fallback?.deductible || '0.5% min',
          recoveryRate: data.recoveryRate || fallback?.recoveryRate || '97.0%',
          usp: data.usp || fallback?.usp || 'Fast digital support',
          baseRateValue: data.baseRateValue || fallback?.baseRateValue || parseFloat(data.rate) || 1.5
        } as InsuranceCompany;
      });

      if (docs.length === 0) {
        setCompanies(FALLBACK_COMPANIES);
      } else {
        setCompanies(docs);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching companies:", error);
      setCompanies(FALLBACK_COMPANIES);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Preset click handler
  const applyPreset = (preset: typeof CAR_PRESETS[0]) => {
    setPropertyCategory(preset.make);
    setPropertyType(preset.model);
    setCarValue(preset.value);
    toast.success(`${preset.label} selected!`, {
      description: `Calibrated valuation to PKR ${preset.value} Lakhs.`
    });
  };

  // Helper to calculate custom rate per company
  const calculateCompanyPremium = (company: InsuranceCompany) => {
    const valuePKR = carValue * 100000;
    const baseRate = company.baseRateValue || 1.5;
    
    // Add-on modifiers
    let rateModifier = 0;
    if (zeroDepreciation) rateModifier += 0.15; // Nil-depreciation cover adds e.g. 0.15% to rate
    if (dealer3SRepair) rateModifier += 0.25;    // 3S dealership repair network adds e.g. 0.25% to rate

    const finalRate = baseRate + rateModifier;
    let premium = valuePKR * (finalRate / 100);

    // Fixed add-on values
    if (personalAccident) premium += 1500;
    if (terrorismCover) premium += 2500;

    // Tracker fees
    const isTrackerFree = company.trackerFee.toLowerCase().includes('free') || company.trackerFee === '-';
    const trackerCost = isTrackerFree ? 0 : parseInt(company.trackerFee.replace(/,/g, '')) || 0;

    const totalPremium = premium + trackerCost;
    const monthlyPremium = totalPremium / 12;

    return {
      rate: finalRate,
      premium: totalPremium,
      monthly: monthlyPremium,
      trackerFee: isTrackerFree ? 0 : trackerCost
    };
  };

  // Filter & sort companies dynamically
  const processedCompanies = useMemo(() => {
    let list = [...companies];

    // Tracker Filter
    if (filterTracker === 'free') {
      list = list.filter(c => c.trackerFee.toLowerCase().includes('free'));
    } else if (filterTracker === 'paid') {
      list = list.filter(c => !c.trackerFee.toLowerCase().includes('free') && c.trackerFee !== '-');
    }

    // Claim Ratio Filter
    list = list.filter(c => {
      const ratio = parseFloat(c.claimRatio?.replace(/%/g, '') || '90');
      return ratio >= minClaimRatio;
    });

    return list;
  }, [companies, filterTracker, minClaimRatio]);

  // Handle checking a plan for comparison
  const toggleComparePlan = (id: string) => {
    if (comparedPlanIds.includes(id)) {
      setComparedPlanIds(prev => prev.filter(pId => pId !== id));
    } else {
      if (comparedPlanIds.length >= 3) {
        toast.warning("Maximum comparison reached", {
          description: "You can compare up to 3 car insurance plans side-by-side."
        });
        return;
      }
      setComparedPlanIds(prev => [...prev, id]);
    }
  };

  // Route to quote booking
  const handleRequestQuote = (company: InsuranceCompany) => {
    navigate(`/insurance/book/property?provider=${company.id}&value=${carValue * 100000}&city=${cityNode}&category=${propertyCategory}&type=${propertyType}`);
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-apple-blue animate-spin" />
      </div>
    );
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12" id="comparison-table">
      
      {/* Section Headline */}
      <div className="mb-12 text-center md:text-left space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-apple-blue/5 dark:bg-apple-blue/10 border border-apple-blue/15 rounded-full text-[10px] font-black uppercase tracking-widest text-apple-blue">
          <Scale className="w-3.5 h-3.5" /> Direct Underwriter Matrix
        </div>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white">
          Compare Live Car Insurance Quotes
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
          Input your vehicle specifications below. Our central routing engine queries premium rates across Pakistan’s top underwriters in real time to secure custom quotes.
        </p>
      </div>

      {/* DYNAMIC COST MODELER & CONTROL CENTER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        
        {/* Left Control Panel (7 columns) */}
        <div className="lg:col-span-7 bg-white dark:bg-[var(--bg-surface)] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/5 pb-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-apple-blue" />
              1. Calibrate Vehicle Value
            </h3>
            <span className="font-mono text-xs font-black text-apple-blue">
              PKR {(carValue).toFixed(1)} Lakhs ({carValue >= 100 ? `${(carValue / 10).toFixed(2)} Crore` : `${carValue} Lacs`})
            </span>
          </div>

          {/* Quick presets row */}
          <div className="flex flex-wrap gap-2">
            {CAR_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className="px-3 py-1.5 bg-[var(--text-primary)] dark:bg-white/5 hover:bg-apple-blue/5 dark:hover:bg-apple-blue/10 text-[10px] font-bold rounded-lg border border-transparent hover:border-apple-blue/20 transition-all"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Range Slider */}
          <div className="space-y-2">
            <input
              type="range"
              min="8"
              max="180"
              step="2"
              value={carValue}
              onChange={(e) => setCarValue(parseInt(e.target.value))}
              className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-apple-blue focus:outline-none"
            />
            <div className="flex justify-between text-[8px] text-[var(--text-secondary)] font-mono">
              <span>PKR 8 Lacs (Hatchback)</span>
              <span>PKR 50 Lacs (Sedan)</span>
              <span>PKR 1.8 Crore (Luxury EV / SUV)</span>
            </div>
          </div>

          {/* Property Specs Input */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-[var(--text-secondary)] tracking-wider ml-1">Property Category</label>
              <input
                type="text"
                value={propertyCategory}
                onChange={(e) => setPropertyCategory(e.target.value)}
                placeholder="e.g. House, Flat, Commercial"
                className="w-full px-3.5 py-2 bg-[var(--text-primary)] dark:bg-white/5 border border-transparent rounded-xl text-xs font-bold outline-none focus:border-apple-blue/30 focus:bg-white dark:focus:bg-black text-[var(--text-primary)] dark:text-white transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-[var(--text-secondary)] tracking-wider ml-1">Property Sub-Type</label>
              <input
                type="text"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                placeholder="e.g. Luxury Villa, Penthouse"
                className="w-full px-3.5 py-2 bg-[var(--text-primary)] dark:bg-white/5 border border-transparent rounded-xl text-xs font-bold outline-none focus:border-apple-blue/30 focus:bg-white dark:focus:bg-black text-[var(--text-primary)] dark:text-white transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-[var(--text-secondary)] tracking-wider ml-1">City Node</label>
              <select
                value={cityNode}
                onChange={(e) => setCityNode(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-[var(--text-primary)] dark:bg-white/5 border border-transparent rounded-xl text-xs font-bold outline-none focus:border-apple-blue/30 focus:bg-white dark:focus:bg-black text-[var(--text-primary)] dark:text-white transition-all"
              >
                <option value="lhe">Lahore</option>
                <option value="khi">Karachi</option>
                <option value="isb">Islamabad</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Add-ons Panel (5 columns) */}
        <div className="lg:col-span-5 bg-white dark:bg-[var(--bg-surface)] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-6 sm:p-8 space-y-5 shadow-sm">
          <h3 className="text-sm font-bold text-[var(--text-primary)] dark:text-white border-b border-black/[0.04] dark:border-white/5 pb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-apple-blue" />
            2. Policy Add-on Layers
          </h3>

          <div className="space-y-3">
            {[
              {
                id: 'zeroDep',
                label: 'Nil-Depreciation Cover',
                desc: '100% parts cost claim payout with 0% deduction weight.',
                checked: zeroDepreciation,
                setter: setZeroDepreciation
              },
              {
                id: 'dealer3S',
                label: 'Authorized 3S Dealership Repairs',
                desc: 'Fix at premium manufacturer shops instead of local garages.',
                checked: dealer3SRepair,
                setter: setDealer3SRepair
              },
              {
                id: 'accCover',
                label: 'Personal Accident Cover',
                desc: 'Add PKR 500,000 emergency medical insurance for driver.',
                checked: personalAccident,
                setter: setPersonalAccident
              },
              {
                id: 'terrorism',
                label: 'Terrorism & Riots Shield',
                desc: 'Secure vehicle from accidental bomb/protest structural loss.',
                checked: terrorismCover,
                setter: setTerrorismCover
              }
            ].map((addon) => (
              <button
                key={addon.id}
                onClick={() => addon.setter(!addon.checked)}
                className={cn(
                  "w-full p-3 rounded-2xl border transition-all text-left flex items-start gap-3 active:scale-[0.99]",
                  addon.checked 
                    ? "border-apple-blue/25 bg-apple-blue/5 dark:bg-apple-blue/10" 
                    : "border-black/[0.04] dark:border-white/[0.04] hover:border-apple-blue/20 bg-transparent"
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                  addon.checked ? "bg-apple-blue border-apple-blue text-white" : "border-black/20 dark:border-white/20"
                )}>
                  {addon.checked && <Check className="w-3 h-3 stroke-[2.5]" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)] dark:text-white leading-tight">{addon.label}</h4>
                  <p className="text-[9px] text-[var(--text-secondary)] leading-relaxed mt-0.5">{addon.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* FILTERS & DYNAMIC MATCHING SUMMARY BAR */}
      <div className="bg-[var(--text-primary)] dark:bg-black/35 rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-bold text-[var(--text-secondary)] uppercase tracking-wider text-[9px] font-mono flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-apple-blue" /> FILTERS:
          </span>
          
          {/* Tracker selector */}
          <div className="flex bg-white dark:bg-[var(--bg-raised)] p-1 rounded-xl border border-black/[0.02] dark:border-white/5">
            {[
              { id: 'all', label: 'All Trackers' },
              { id: 'free', label: 'Free Tracker' },
              { id: 'paid', label: 'Paid/Optional' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setFilterTracker(t.id as any)}
                className={cn(
                  "px-3 py-1 text-[9px] font-bold rounded-lg transition-all",
                  filterTracker === t.id
                    ? "bg-apple-blue text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Claim ratio range selector */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">Claim Ratio:</span>
            <select
              value={minClaimRatio}
              onChange={(e) => setMinClaimRatio(parseInt(e.target.value))}
              className="px-2 py-1 bg-white dark:bg-[var(--bg-raised)] border border-black/[0.04] dark:border-white/5 rounded-xl text-[10px] font-bold outline-none text-[var(--text-primary)] dark:text-white"
            >
              <option value={90}>&gt;= 90%</option>
              <option value={95}>&gt;= 95%</option>
              <option value={97}>&gt;= 97%</option>
            </select>
          </div>
        </div>

        <div className="text-[10px] text-[var(--text-secondary)] font-mono font-bold uppercase tracking-wider">
          <span className="text-apple-blue font-black">{processedCompanies.length}</span> companies locked matching specs
        </div>
      </div>

      {/* COMPARISON RESULTS GRID/LIST */}
      <div className="space-y-4">
        {processedCompanies.map((company) => {
          const stats = calculateCompanyPremium(company);
          const isCompared = comparedPlanIds.includes(company.id);

          return (
            <motion.div
              key={company.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "bg-white dark:bg-[var(--bg-surface)] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-5 sm:p-6 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-6 items-center",
                company.isFeatured && "ring-1.5 ring-apple-blue/20 dark:ring-apple-blue/15"
              )}
            >
              {/* Featured ribbon label top right corner */}
              {company.isFeatured && (
                <div className="absolute top-0 right-0">
                  <span className="px-3 py-1 bg-apple-blue text-white text-[8px] font-black uppercase tracking-widest rounded-bl-xl inline-block">
                    ★ Preferred Underwriter
                  </span>
                </div>
              )}

              {/* Column 1: Selector checkbox + Insurer branding (4 columns) */}
              <div className="md:col-span-4 flex items-center gap-4">
                {/* Checkbox for Compare comparison list */}
                <button
                  onClick={() => toggleComparePlan(company.id)}
                  className="group flex flex-col items-center justify-center shrink-0 border border-black/[0.08] dark:border-white/[0.08] hover:border-apple-blue/40 w-11 h-11 rounded-2xl transition-all"
                  title="Select to compare side-by-side"
                >
                  <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                    isCompared ? "bg-apple-blue border-apple-blue text-white" : "border-black/20 dark:border-white/20 group-hover:border-apple-blue"
                  )}>
                    {isCompared && <Check className="w-3 h-3 stroke-[2.5]" />}
                  </div>
                  <span className="text-[7px] font-black text-[var(--text-secondary)] uppercase tracking-tighter mt-1 group-hover:text-apple-blue">
                    Compare
                  </span>
                </button>

                {/* Brand Logo & Name */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-black/[0.04] p-2 flex items-center justify-center shrink-0 shadow-inner">
                    {company.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt={company.name}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="font-bold text-sm text-apple-text-muted">{company.name?.[0] || 'I'}</span>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <button
                      onClick={() => setSelectedDetails(company)}
                      className="text-base font-black text-[var(--text-primary)] dark:text-white hover:text-apple-blue text-left leading-tight block"
                    >
                      {company.name}
                    </button>
                    <span className="text-[10px] text-[var(--text-secondary)] font-mono block">
                      {company.claimRatio} Claim Ratio • {company.workshopNetwork?.split(' ')[0]} network
                    </span>
                  </div>
                </div>
              </div>

              {/* Column 2: Key Policy Features list (3 columns) */}
              <div className="md:col-span-3 space-y-1.5 border-t md:border-t-0 md:border-x border-black/[0.04] dark:border-white/5 pt-4 md:pt-0 md:px-5">
                <span className="text-[8px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider block">KEY HIGHLIGHTS</span>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-primary)] dark:text-white/80">
                    <CheckCircle className="w-3.5 h-3.5 text-apple-green shrink-0" />
                    <span className="truncate leading-none">{company.usp}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-primary)] dark:text-white/80">
                    <Compass className="w-3.5 h-3.5 text-apple-blue shrink-0" />
                    <span className="truncate leading-none">{company.trackerFee.toLowerCase().includes('free') ? 'Free GPS Satellite Tracker' : `PKR ${company.trackerFee} tracker fee`}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-primary)] dark:text-white/80">
                    <ShieldCheck className="w-3.5 h-3.5 text-apple-green shrink-0" />
                    <span className="truncate leading-none">Deductible: {company.deductible}</span>
                  </div>
                </div>
              </div>

              {/* Column 3: Premium Premium rates (3 columns) */}
              <div className="md:col-span-3 text-left md:text-right space-y-1">
                <span className="text-[8px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider block">PREMIUM CALCULATION</span>
                <div className="flex md:flex-col items-baseline md:items-end gap-2 md:gap-0">
                  <p className="text-xl font-black text-apple-blue font-mono">
                    PKR {Math.round(stats.premium).toLocaleString()} <span className="text-[10px] font-bold text-[var(--text-secondary)] font-sans">/yr</span>
                  </p>
                  <p className="text-xs font-black text-apple-green font-mono">
                    PKR {Math.round(stats.monthly).toLocaleString()} <span className="text-[9px] font-bold text-[var(--text-secondary)] font-sans">/mo (12x)</span>
                  </p>
                </div>
                <span className="text-[8px] text-[var(--text-secondary)] block">
                  Based on {stats.rate.toFixed(2)}% dynamic coverage rate
                </span>
              </div>

              {/* Column 4: Quick quotes actions (2 columns) */}
              <div className="md:col-span-2 flex flex-col gap-2 w-full">
                <button
                  onClick={() => handleRequestQuote(company)}
                  className="w-full py-2.5 bg-apple-blue hover:bg-blue-600 text-white text-[11px] font-extrabold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1"
                >
                  Request Quote <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setSelectedDetails(company)}
                  className="w-full py-2 bg-[var(--text-primary)] dark:bg-white/5 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-[10px] font-bold rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white transition-all border border-transparent hover:border-black/[0.02]"
                >
                  View Details
                </button>
              </div>

            </motion.div>
          );
        })}

        {processedCompanies.length === 0 && (
          <div className="py-24 text-center bg-white dark:bg-[var(--bg-surface)] rounded-3xl border border-black/[0.04] dark:border-white/[0.04]">
            <Building2 className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4 opacity-30" />
            <h4 className="text-base font-bold text-[var(--text-primary)] dark:text-white">No active matches found</h4>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto mt-1 leading-relaxed">
              We couldn’t find underwriters meeting your extremely strict filters. Adjust the tracker filters or claim ratio parameters to fetch active plans.
            </p>
          </div>
        )}
      </div>

      {/* FLOAT COMPENSATING COMPARISON DRAWER */}
      <AnimatePresence>
        {comparedPlanIds.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-lg bg-black dark:bg-[var(--bg-raised)] text-white rounded-3xl px-6 py-4 flex items-center justify-between border border-white/10 shadow-2xl z-40"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-apple-blue/20 flex items-center justify-center text-apple-blue shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-none">Side-by-Side Matrix</h4>
                <p className="text-[10px] text-[var(--text-secondary)] block mt-1">
                  You have selected <span className="text-white font-bold">{comparedPlanIds.length}</span> plan{comparedPlanIds.length > 1 ? 's' : ''} to analyze.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setComparedPlanIds([])}
                className="text-[10px] text-[var(--text-secondary)] hover:text-white font-extrabold uppercase tracking-wider"
              >
                Clear
              </button>
              <button
                onClick={() => setShowCompareModal(true)}
                className="px-4 py-2 bg-apple-blue hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-apple-blue/25"
              >
                Compare Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADVANCED SIDE-BY-SIDE MATRIX DIALOG MODAL */}
      <AnimatePresence>
        {showCompareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCompareModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-white dark:bg-[var(--bg-surface)] rounded-[32px] border border-black/[0.04] dark:border-white/[0.04] w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl relative z-10 flex flex-col text-[var(--text-primary)] dark:text-[var(--text-primary)]"
            >
              {/* Header */}
              <div className="p-6 border-b border-black/[0.05] dark:border-white/5 flex justify-between items-center bg-[var(--text-primary)] dark:bg-black/35">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-apple-blue flex items-center justify-center text-white shadow-md">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Insurance Coverage Matrix</h3>
                    <p className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-wider">
                      {propertyCategory} {propertyType} • PKR {carValue} Lacs Valuation Weight
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowCompareModal(false)}
                  className="p-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] rounded-full transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Table Body & Mobile Cards */}
              <div className="flex-1 overflow-auto p-4 sm:p-6 custom-scrollbar">
                {/* 1. Desktop Comparison Table (>=768px) */}
                <div className="hidden md:block">
                  <table className="w-full border-collapse text-left text-xs min-w-[650px]">
                    <thead>
                      <tr className="border-b border-black/[0.06] dark:border-white/5 text-[9px] font-black uppercase text-[var(--text-secondary)] tracking-wider">
                        <th className="pb-4 font-bold w-[25%]">Policy Attributes</th>
                        {comparedPlanIds.map(pId => {
                          const comp = companies.find(c => c.id === pId);
                          return (
                            <th key={pId} className="pb-4 font-black text-center w-[25%]">
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-10 h-10 rounded-xl bg-white p-1.5 border border-black/[0.04] flex items-center justify-center shadow-inner">
                                  {comp?.logoUrl ? (
                                    <img src={comp.logoUrl} alt={comp?.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                  ) : (
                                    <span className="font-bold text-xs text-apple-text-muted">{comp?.name?.[0] || 'I'}</span>
                                  )}
                                </div>
                                <span className="text-xs font-black text-[var(--text-primary)] dark:text-white block">{comp?.name}</span>
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.04] dark:divide-white/5 text-[11px] font-medium text-[var(--text-primary)] dark:text-white/90">
                      {/* Attribute: Premium */}
                      <tr>
                        <td className="py-4 font-black uppercase text-[8px] text-[var(--text-secondary)] tracking-wider">Annual Premium</td>
                        {comparedPlanIds.map(pId => {
                          const comp = companies.find(c => c.id === pId)!;
                          const stats = calculateCompanyPremium(comp);
                          return (
                            <td key={pId} className="py-4 text-center">
                              <p className="text-sm font-black text-apple-blue font-mono">
                                PKR {Math.round(stats.premium).toLocaleString()}
                              </p>
                              <span className="text-[9px] text-[var(--text-secondary)]">({stats.rate.toFixed(2)}% Flat Rate)</span>
                            </td>
                          );
                        })}
                      </tr>

                      {/* Attribute: Installments */}
                      <tr>
                        <td className="py-4 font-black uppercase text-[8px] text-[var(--text-secondary)] tracking-wider">Monthly Installment</td>
                        {comparedPlanIds.map(pId => {
                          const comp = companies.find(c => c.id === pId)!;
                          const stats = calculateCompanyPremium(comp);
                          return (
                            <td key={pId} className="py-4 text-center font-bold text-apple-green font-mono text-xs">
                              PKR {Math.round(stats.monthly).toLocaleString()} /mo (12x)
                            </td>
                          );
                        })}
                      </tr>

                      {/* Attribute: Claim Ratio */}
                      <tr>
                        <td className="py-4 font-black uppercase text-[8px] text-[var(--text-secondary)] tracking-wider">Claim Approval Ratio</td>
                        {comparedPlanIds.map(pId => {
                          const comp = companies.find(c => c.id === pId)!;
                          return (
                            <td key={pId} className="py-4 text-center font-bold font-mono text-apple-blue">
                              {comp.claimRatio}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Attribute: Workshop network */}
                      <tr>
                        <td className="py-4 font-black uppercase text-[8px] text-[var(--text-secondary)] tracking-wider">Repair Workshops Network</td>
                        {comparedPlanIds.map(pId => {
                          const comp = companies.find(c => c.id === pId)!;
                          return (
                            <td key={pId} className="py-4 text-center text-[var(--text-secondary)] text-[10px]">
                              {comp.workshopNetwork}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Attribute: Tracker fee */}
                      <tr>
                        <td className="py-4 font-black uppercase text-[8px] text-[var(--text-secondary)] tracking-wider">GPS Satellite Tracker Unit</td>
                        {comparedPlanIds.map(pId => {
                          const comp = companies.find(c => c.id === pId)!;
                          const isFree = comp.trackerFee.toLowerCase().includes('free') || comp.trackerFee === '-';
                          return (
                            <td key={pId} className="py-4 text-center font-bold text-apple-green">
                              {isFree ? 'Complimentary (0 PKR)' : `PKR ${comp.trackerFee}`}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Attribute: Deductible */}
                      <tr>
                        <td className="py-4 font-black uppercase text-[8px] text-[var(--text-secondary)] tracking-wider">Policy Deductible / Excess</td>
                        {comparedPlanIds.map(pId => {
                          const comp = companies.find(c => c.id === pId)!;
                          return (
                            <td key={pId} className="py-4 text-center text-[var(--text-secondary)] text-[10px]">
                              {comp.deductible}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Attribute: Theft Recovery Rate */}
                      <tr>
                        <td className="py-4 font-black uppercase text-[8px] text-[var(--text-secondary)] tracking-wider">Theft Recovery Success</td>
                        {comparedPlanIds.map(pId => {
                          const comp = companies.find(c => c.id === pId)!;
                          return (
                            <td key={pId} className="py-4 text-center text-apple-orange font-bold">
                              {comp.recoveryRate}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Attribute: USP */}
                      <tr>
                        <td className="py-4 font-black uppercase text-[8px] text-[var(--text-secondary)] tracking-wider">Primary USP Benefit</td>
                        {comparedPlanIds.map(pId => {
                          const comp = companies.find(c => c.id === pId)!;
                          return (
                            <td key={pId} className="py-4 text-center font-bold text-apple-green">
                              {comp.usp}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Actions row */}
                      <tr>
                        <td className="py-4 font-black uppercase text-[8px] text-[var(--text-secondary)] tracking-wider">Actions</td>
                        {comparedPlanIds.map(pId => {
                          const comp = companies.find(c => c.id === pId)!;
                          return (
                            <td key={pId} className="py-4 text-center">
                              <button
                                onClick={() => {
                                  setShowCompareModal(false);
                                  handleRequestQuote(comp);
                                }}
                                className="px-4 py-2 bg-apple-blue hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-colors shadow-sm"
                              >
                                Request Quote
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 2. Mobile Comparison Cards (<768px, Never raw horizontal scroll) */}
                <div className="md:hidden space-y-4">
                  {comparedPlanIds.map(pId => {
                    const comp = companies.find(c => c.id === pId);
                    if (!comp) return null;
                    const stats = calculateCompanyPremium(comp);
                    const isFreeTracker = comp.trackerFee.toLowerCase().includes('free') || comp.trackerFee === '-';

                    return (
                      <div key={`compare-mobile-${pId}`} className="p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-[var(--text-primary)]/40 dark:bg-white/5 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white p-1 border border-black/[0.06] flex items-center justify-center shrink-0">
                            {comp.logoUrl ? (
                              <img src={comp.logoUrl} alt={comp.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="font-bold text-xs text-apple-text-muted">{comp.name[0]}</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[var(--text-primary)] dark:text-white">{comp.name}</h4>
                            <p className="text-[10px] text-apple-green font-semibold">{comp.usp}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-white dark:bg-black/20 border border-black/5 dark:border-white/5">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] font-bold block">Annual Premium</span>
                            <span className="text-sm font-extrabold text-apple-blue font-mono">PKR {Math.round(stats.premium).toLocaleString()}</span>
                            <span className="text-[9px] text-[var(--text-secondary)] block">({stats.rate.toFixed(2)}%)</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] font-bold block">Monthly (12x)</span>
                            <span className="text-sm font-bold text-apple-green font-mono">PKR {Math.round(stats.monthly).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                            <span className="text-[var(--text-secondary)]">Approval Ratio:</span>
                            <span className="font-bold text-apple-blue font-mono">{comp.claimRatio}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                            <span className="text-[var(--text-secondary)]">Satellite Tracker:</span>
                            <span className="font-bold text-apple-green">{isFreeTracker ? 'Complimentary' : `PKR ${comp.trackerFee}`}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                            <span className="text-[var(--text-secondary)]">Deductible:</span>
                            <span className="font-medium text-[var(--text-primary)] dark:text-white">{comp.deductible}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-[var(--text-secondary)]">Theft Recovery:</span>
                            <span className="font-bold text-apple-orange">{comp.recoveryRate}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setShowCompareModal(false);
                            handleRequestQuote(comp);
                          }}
                          className="w-full h-11 rounded-xl bg-apple-blue text-white font-bold text-xs flex items-center justify-center gap-1.5 touch-target min-h-[44px] cursor-pointer shadow-md shadow-apple-blue/20"
                        >
                          <span>Select Policy</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAILED EXPANDABLE MODAL FROM DETAILS BTN */}
      <AnimatePresence>
        {selectedDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDetails(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white dark:bg-[var(--bg-surface)] rounded-[32px] border border-black/[0.04] dark:border-white/[0.04] w-full max-w-2xl overflow-hidden shadow-2xl relative z-10 flex flex-col text-[var(--text-primary)] dark:text-[var(--text-primary)]"
            >
              <div className="p-6 border-b border-black/[0.05] dark:border-white/5 flex items-center justify-between bg-[var(--text-primary)] dark:bg-black/35">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl p-2 border border-black/[0.04] flex items-center justify-center shadow-inner shrink-0">
                    {selectedDetails.logoUrl ? (
                      <img src={selectedDetails.logoUrl} alt={selectedDetails.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="font-bold text-sm text-apple-text-muted">{selectedDetails.name?.[0] || 'I'}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-tight">{selectedDetails.name}</h3>
                    <p className="text-[10px] text-[var(--text-secondary)] font-mono uppercase">Comprehensive Auto Coverage Matrix</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDetails(null)}
                  className="p-1.5 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] rounded-full transition-colors text-[var(--text-secondary)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-apple-blue/5 dark:bg-apple-blue/10 border border-apple-blue/15 p-4 rounded-2xl">
                    <span className="text-[8px] font-extrabold text-apple-blue uppercase tracking-widest block font-mono">CALCULATED ANNUAL PREMIUM</span>
                    <span className="text-2xl font-black font-mono text-[var(--text-primary)] dark:text-white leading-none block mt-1">
                      PKR {Math.round(calculateCompanyPremium(selectedDetails).premium).toLocaleString()}
                    </span>
                    <span className="text-[8px] text-[var(--text-secondary)] block mt-1">Includes your selected add-ons.</span>
                  </div>

                  <div className="bg-apple-green/5 dark:bg-apple-green/10 border border-apple-green/15 p-4 rounded-2xl">
                    <span className="text-[8px] font-extrabold text-apple-green uppercase tracking-widest block font-mono">CLAIM APPROVAL RATIO</span>
                    <span className="text-2xl font-black font-mono text-apple-green leading-none block mt-1">
                      {selectedDetails.claimRatio}
                    </span>
                    <span className="text-[8px] text-[var(--text-secondary)] block mt-1">Verifiable audit on actual claims.</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider block">PLAN SPECIFICATION BREAKDOWN</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { label: "Bumper-to-Bumper Accident Damage", val: "100% Market Value Protection" },
                      { label: "Workshop Network Limit", val: selectedDetails.workshopNetwork },
                      { label: "Satellite Tracking unit", val: selectedDetails.trackerFee.toLowerCase().includes('free') ? 'Free Installation Included' : `PKR ${selectedDetails.trackerFee} hardware cost` },
                      { label: "Claim Survey Dispatch speed", val: "Average 120-second digital auto" },
                      { label: "Theft / Snatching Payout Recovery", val: selectedDetails.recoveryRate },
                      { label: "Deductible / Excess Limit", val: selectedDetails.deductible },
                      { label: "Free Emergency Towing assistance", val: "Up to PKR 15,000 allowance" },
                      { label: "Primary Key Policy USP", val: selectedDetails.usp }
                    ].map((feat, idx) => (
                      <div key={idx} className="p-3 bg-[var(--text-primary)] dark:bg-black/25 rounded-xl border border-black/[0.02] dark:border-white/[0.02] flex flex-col gap-0.5">
                        <span className="text-[8px] text-[var(--text-secondary)] uppercase tracking-wider font-bold block">{feat.label}</span>
                        <span className="font-bold text-[var(--text-primary)] dark:text-white/90">{feat.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-black/[0.05] dark:border-white/5 bg-[var(--text-primary)] dark:bg-black/35 flex gap-4">
                <button
                  onClick={() => {
                    setSelectedDetails(null);
                    handleRequestQuote(selectedDetails);
                  }}
                  className="flex-1 py-3 bg-apple-blue hover:bg-blue-600 text-white text-xs font-extrabold rounded-full transition-colors shadow-sm uppercase tracking-wider"
                >
                  Request Dynamic Quote
                </button>
                <button
                  onClick={() => setSelectedDetails(null)}
                  className="px-6 py-3 bg-white dark:bg-[var(--bg-raised)] hover:bg-black/[0.02] dark:hover:bg-white/[0.04] text-[11px] font-black rounded-full border border-black/[0.1] dark:border-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white transition-all"
                >
                  Close Panel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QUICK INFO VALUE BLOCKS */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-6 rounded-3xl border border-black/[0.04] dark:border-white/[0.04] bg-apple-green/[0.02] dark:bg-apple-green/[0.04] space-y-4">
            <div className="w-9 h-9 rounded-xl bg-apple-green/10 flex items-center justify-center text-apple-green shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">Claim Settlement Oath</h4>
              <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                Direct integration with underwriters bypasses third-party friction pools, allowing 48h emergency claim payouts or instant authorized workshop restoration.
              </p>
            </div>
         </div>
         
         <div className="p-6 rounded-3xl border border-black/[0.04] dark:border-white/[0.04] bg-apple-blue/[0.02] dark:bg-apple-blue/[0.04] space-y-4">
            <div className="w-9 h-9 rounded-xl bg-apple-blue/10 flex items-center justify-center text-apple-blue shadow-sm">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">Smart Underwriting Nodes</h4>
              <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                Underwriters dynamically push live price points through Centralized secure handshake channels, ensuring quotes are strictly calibrated with real-time market rates.
              </p>
            </div>
         </div>

         <div className="p-6 rounded-3xl border border-black/[0.04] dark:border-white/[0.04] bg-gold-decoration/[0.02] dark:bg-gold-decoration/[0.04] space-y-4">
            <div className="w-9 h-9 rounded-xl bg-gold-decoration/10 flex items-center justify-center text-gold-decoration shadow-sm">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">Transparency Shield Act</h4>
              <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                All tracker charges, excess clauses, and dealership network files are manually verified weekly by our transparency board for ultimate security.
              </p>
            </div>
         </div>
      </div>

    </section>
  );
}
