import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Check, 
  X, 
  Star, 
  Info, 
  Sliders, 
  Zap, 
  Percent, 
  ShieldCheck, 
  Clock, 
  Compass, 
  Scale, 
  ArrowRight,
  Filter,
  CheckCircle,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { cn, formatPrice } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface FinancingProduct {
  id: string;
  bankName: string;
  logoUrl: string;
  type: 'islamic' | 'conventional';
  apr: string;
  processingFee: string;
  minDownPayment: string;
  approvalSpeed: string;
  rating: number;
  isFeatured: boolean;
  usp: string;
  insuranceRequired: string;
  documentsLevel: 'Minimal Digital' | 'Standard Bank Docs' | 'Heavy Physical Docs';
}

const FINANCING_PRODUCTS: FinancingProduct[] = [
  {
    id: 'pakizzle_capital',
    bankName: 'Pakizzle Instant Capital™',
    logoUrl: 'https://picsum.photos/seed/pakizzlefinance/100/100',
    type: 'islamic',
    apr: '14.9% - 15.5%',
    processingFee: '0% Processing',
    minDownPayment: '30% Down Payment',
    approvalSpeed: 'Instant (12-24 Hours)',
    rating: 4.9,
    isFeatured: true,
    usp: '100% digital, zero physical bank visits, free tracker installation included',
    insuranceRequired: 'Free Takaful Included',
    documentsLevel: 'Minimal Digital'
  },
  {
    id: 'meezan_ijarah',
    bankName: 'Meezan Bank Car Ijarah',
    logoUrl: 'https://picsum.photos/seed/meezan/100/100',
    type: 'islamic',
    apr: '15.75% - 16.5%',
    processingFee: 'PKR 12,000 + Tax',
    minDownPayment: '30% Down Payment',
    approvalSpeed: '4 - 7 Business Days',
    rating: 4.7,
    isFeatured: false,
    usp: 'First & largest Shariah-compliant Islamic auto financing network in Pakistan',
    insuranceRequired: 'Mandatory Takaful Pool',
    documentsLevel: 'Standard Bank Docs'
  },
  {
    id: 'alfalah_auto',
    bankName: 'Bank Alfalah Auto Loan',
    logoUrl: 'https://picsum.photos/seed/alfalah/100/100',
    type: 'conventional',
    apr: '16.0% - 17.5%',
    processingFee: 'PKR 10,000 Flat',
    minDownPayment: '30% Down Payment',
    approvalSpeed: '3 - 5 Business Days',
    rating: 4.5,
    isFeatured: false,
    usp: 'Highly flexible tenures up to 7 years with multi-partner comprehensive insurance options',
    insuranceRequired: 'Commercial Insurance',
    documentsLevel: 'Standard Bank Docs'
  },
  {
    id: 'hbl_auto',
    bankName: 'HBL Car Loan',
    logoUrl: 'https://picsum.photos/seed/hbl/100/100',
    type: 'conventional',
    apr: '16.5% - 18.0%',
    processingFee: 'PKR 15,000 + Tax',
    minDownPayment: '35% Down Payment',
    approvalSpeed: '7 - 10 Business Days',
    rating: 4.3,
    isFeatured: false,
    usp: 'Deep national network stability, preferential pricing for existing HBL account holders',
    insuranceRequired: 'Commercial Insurance',
    documentsLevel: 'Heavy Physical Docs'
  }
];

export default function FinancingComparisonTable() {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<'all' | 'islamic' | 'conventional'>('all');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return FINANCING_PRODUCTS.filter(p => {
      if (filterType === 'all') return true;
      return p.type === filterType;
    });
  }, [filterType]);

  const handleApplyNow = (product: FinancingProduct) => {
    toast.success(`Lease plan lock achieved!`, {
      description: `Redirecting to financing portal configured for ${product.bankName}`
    });
    navigate(`/financing/apply/${product.id === 'pakizzle_capital' ? 'personal' : 'business'}`);
  };

  return (
    <div className="max-w-[1024px] mx-auto px-6 sm:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold text-apple-blue uppercase tracking-[0.2em] block">
            MARKET COMPARISON PORTAL
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-tight">
            Compare Pakizzle Capital vs Top Banks
          </h2>
          <p className="text-xs text-apple-text-muted max-w-2xl leading-relaxed">
            Choose from Pakistan's leading auto leasing products. Select and lock preferred rates instantly.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 bg-[#F5F5F7] dark:bg-black/35 p-1 rounded-full border border-black/[0.03] dark:border-white/[0.02] shrink-0 self-start md:self-auto">
          <button
            onClick={() => setFilterType('all')}
            className={cn(
              "px-4 py-1.5 text-[10px] font-bold rounded-full transition-all",
              filterType === 'all'
                ? "bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white shadow-sm"
                : "text-apple-text-muted hover:text-[#1D1D1F] dark:hover:text-white"
            )}
          >
            All Products
          </button>
          <button
            onClick={() => setFilterType('islamic')}
            className={cn(
              "px-4 py-1.5 text-[10px] font-bold rounded-full transition-all",
              filterType === 'islamic'
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-apple-text-muted hover:text-emerald-500"
            )}
          >
            Islamic (Ijarah)
          </button>
          <button
            onClick={() => setFilterType('conventional')}
            className={cn(
              "px-4 py-1.5 text-[10px] font-bold rounded-full transition-all",
              filterType === 'conventional'
                ? "bg-apple-blue text-white shadow-sm"
                : "text-apple-text-muted hover:text-apple-blue"
            )}
          >
            Conventional
          </button>
        </div>
      </div>

      {/* 1. Desktop & Tablet Full Table (>=768px) */}
      <div className="hidden md:block overflow-x-auto rounded-3xl border border-black/[0.04] dark:border-white/[0.04] bg-white dark:bg-[var(--surface-dark)] shadow-[0_4px_30px_rgba(0,0,0,0.01)] transition-colors duration-300">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-black/[0.03] dark:border-white/[0.02] bg-[#F5F5F7]/50 dark:bg-black/20 text-[10px] font-black uppercase text-apple-text-muted tracking-wider">
              <th className="py-5 px-6">Financing Solution</th>
              <th className="py-5 px-4">Type / Markup</th>
              <th className="py-5 px-4">Processing Fee</th>
              <th className="py-5 px-4">Approval Speed</th>
              <th className="py-5 px-4">Documentation</th>
              <th className="py-5 px-6 text-right">Commitment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.02]">
            {filteredProducts.map((prod) => {
              const isSelected = selectedProductId === prod.id;
              return (
                <tr 
                  key={prod.id}
                  onClick={() => setSelectedProductId(isSelected ? null : prod.id)}
                  className={cn(
                    "hover:bg-[#F5F5F7]/30 dark:hover:bg-white/[0.01] transition-colors cursor-pointer text-xs",
                    prod.isFeatured ? "bg-amber-500/[0.01] dark:bg-amber-500/[0.005]" : "",
                    isSelected ? "bg-black/[0.01] dark:bg-white/[0.01]" : ""
                  )}
                >
                  {/* Name and logo */}
                  <td className="py-6 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#F5F5F7] dark:bg-white/5 border border-black/[0.05] dark:border-white/10 shrink-0 flex items-center justify-center font-bold text-apple-text-muted text-[10px]">
                        <Building2 className="w-5 h-5 text-apple-text-muted" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#1D1D1F] dark:text-white">{prod.bankName}</span>
                          {prod.isFeatured && (
                            <span className="bg-amber-500/10 text-amber-500 border border-amber-500/15 text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Star className="w-2 h-2 fill-current" />
                              Best Value
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-apple-text-muted mt-0.5 line-clamp-1 max-w-[280px]">{prod.usp}</p>
                      </div>
                    </div>
                  </td>

                  {/* Markup rate */}
                  <td className="py-6 px-4">
                    <div>
                      <span className="font-extrabold font-mono text-[#1D1D1F] dark:text-white block">{prod.apr}</span>
                      <span className={cn(
                        "text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border tracking-wider inline-block mt-1",
                        prod.type === 'islamic'
                          ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/10"
                          : "bg-apple-blue/5 text-apple-blue border-apple-blue/10"
                      )}>
                        {prod.type === 'islamic' ? 'Islamic (Ijarah)' : 'Conventional'}
                      </span>
                    </div>
                  </td>

                  {/* Processing Fee */}
                  <td className="py-6 px-4">
                    <div className="space-y-0.5">
                      <span className="font-bold text-[#1D1D1F] dark:text-white block">{prod.processingFee}</span>
                      <span className="text-[9px] text-apple-text-muted">{prod.minDownPayment}</span>
                    </div>
                  </td>

                  {/* Speed */}
                  <td className="py-6 px-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className={cn("w-3.5 h-3.5 shrink-0", prod.id === 'pakizzle_capital' ? "text-amber-500" : "text-apple-text-muted")} />
                      <span className="font-semibold text-[#1D1D1F] dark:text-white">{prod.approvalSpeed}</span>
                    </div>
                  </td>

                  {/* Documents required */}
                  <td className="py-6 px-4">
                    <span className={cn(
                      "text-[9px] font-bold px-2 py-1 rounded-full border uppercase tracking-wider",
                      prod.documentsLevel === 'Minimal Digital' 
                        ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/10" 
                        : prod.documentsLevel === 'Standard Bank Docs'
                        ? "bg-apple-blue/5 text-apple-blue border-apple-blue/10"
                        : "bg-amber-500/5 text-amber-500 border-amber-500/10"
                    )}>
                      {prod.documentsLevel}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-6 px-6 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyNow(prod);
                      }}
                      className={cn(
                        "px-4 py-2 text-[10px] font-bold rounded-full transition-all flex items-center gap-1.5 ml-auto shadow-sm hover:scale-105 active:scale-95",
                        prod.id === 'pakizzle_capital'
                          ? "bg-apple-blue text-white hover:bg-blue-600"
                          : "bg-[#F5F5F7] dark:bg-white/5 text-[#1D1D1F] dark:text-white border border-transparent hover:border-black/10 dark:hover:border-white/10"
                      )}
                    >
                      Apply Now
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 2. Mobile Touch Cards (<768px, NEVER raw horizontal scroll) */}
      <div className="md:hidden space-y-3">
        {filteredProducts.map((prod) => {
          const isSelected = selectedProductId === prod.id;
          return (
            <motion.div
              key={`mobile-${prod.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "rounded-2xl border p-4 bg-white dark:bg-[var(--surface-dark)] shadow-xs transition-all",
                prod.isFeatured ? "border-amber-500/30 bg-amber-500/[0.015]" : "border-black/[0.06] dark:border-white/[0.06]"
              )}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] dark:bg-white/5 border border-black/5 dark:border-white/10 shrink-0 flex items-center justify-center font-bold text-apple-text-muted">
                    <Building2 className="w-5 h-5 text-apple-text-muted" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-[#1D1D1F] dark:text-white truncate">{prod.bankName}</h4>
                      {prod.isFeatured && (
                        <span className="bg-amber-500/10 text-amber-500 text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                          <Star className="w-2 h-2 fill-current" />
                          Best Value
                        </span>
                      )}
                    </div>
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-wider inline-block mt-0.5",
                      prod.type === 'islamic' ? "text-emerald-500" : "text-apple-blue"
                    )}>
                      {prod.type === 'islamic' ? 'Islamic (Ijarah)' : 'Conventional'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3-Column Key Spec Matrix */}
              <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-[#F5F5F7]/70 dark:bg-white/[0.02] border border-black/[0.03] dark:border-white/[0.03] mb-3">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-apple-text-muted block">Markup</span>
                  <span className="font-extrabold font-mono text-xs text-[#1D1D1F] dark:text-white mt-0.5 block truncate">{prod.apr}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-apple-text-muted block">Processing</span>
                  <span className="font-bold text-xs text-[#1D1D1F] dark:text-white mt-0.5 block truncate">{prod.processingFee}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-apple-text-muted block">Speed</span>
                  <span className="font-semibold text-xs text-[#1D1D1F] dark:text-white mt-0.5 block truncate">{prod.approvalSpeed}</span>
                </div>
              </div>

              {/* Tap to expand details */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedProductId(isSelected ? null : prod.id)}
                  className="w-full text-left text-[11px] font-medium text-apple-text-muted hover:text-apple-blue flex items-center justify-between py-1 cursor-pointer touch-target min-h-[36px]"
                >
                  <span>{isSelected ? "Hide details" : "View documentation & details"}</span>
                  <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", isSelected ? "rotate-90" : "")} />
                </button>

                {isSelected && (
                  <div className="pt-2 pb-1 border-t border-black/[0.04] dark:border-white/[0.04] space-y-2 text-xs">
                    <p className="text-[11px] text-apple-text-muted leading-relaxed">{prod.usp}</p>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-apple-text-muted">Documentation:</span>
                      <span className="font-semibold text-[#1D1D1F] dark:text-white">{prod.documentsLevel}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-apple-text-muted">Down Payment:</span>
                      <span className="font-semibold text-[#1D1D1F] dark:text-white">{prod.minDownPayment}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-apple-text-muted">Insurance/Takaful:</span>
                      <span className="font-semibold text-[#1D1D1F] dark:text-white">{prod.insuranceRequired}</span>
                    </div>
                  </div>
                )}

                {/* Primary Touch Action Button */}
                <button
                  onClick={() => handleApplyNow(prod)}
                  className={cn(
                    "w-full h-11 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer touch-target min-h-[44px] shadow-sm",
                    prod.id === 'pakizzle_capital'
                      ? "bg-apple-blue text-white shadow-apple-blue/20"
                      : "bg-[#F5F5F7] dark:bg-white/10 text-[#1D1D1F] dark:text-white border border-apple-border/50"
                  )}
                >
                  <span>Apply Now</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Accordion Note / Expansion */}
      <div className="mt-6 bg-white dark:bg-[var(--surface-dark)] rounded-3xl border border-black/[0.04] dark:border-white/[0.04] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-300">
        <div className="flex gap-3 items-center text-center sm:text-left">
          <div className="w-9 h-9 rounded-full bg-apple-blue/5 dark:bg-apple-blue/10 flex items-center justify-center text-apple-blue shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-apple-text-muted max-w-xl leading-relaxed">
            <strong>Regulatory Guidelines Note:</strong> Under current prudential regulations of Pakistan, the maximum loan amount for locally assembled vehicles is subject to salary limits, and some imported cars might carry restriction thresholds. Our credit team handles full verification for you.
          </p>
        </div>
        <button 
          onClick={() => navigate('/financing/apply/personal')}
          className="text-[10px] font-bold text-apple-blue hover:underline shrink-0 flex items-center gap-1"
        >
          Check Specific Constraints
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
