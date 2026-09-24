import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  X, 
  Building, 
  Percent, 
  Calendar, 
  Wallet, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck,
  FileCheck,
  DollarSign
} from "lucide-react";
import { formatPrice } from "../lib/utils";
import { toast } from "sonner";

interface HomeFinancingStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPrice?: number;
}

const BANKS = [
  { id: "meezan", name: "Meezan Bank", product: "Easy Home (Diminishing Musharakah)", type: "islamic", rate: 16.5, maxTenor: 25 },
  { id: "alfalah", name: "Bank Alfalah Islamic", product: "Ghar Aasan Scheme", type: "islamic", rate: 16.8, maxTenor: 20 },
  { id: "hbl", name: "HBL Islamic", product: "HBL Islamic HomeFinance", type: "islamic", rate: 17.2, maxTenor: 25 },
  { id: "faysal", name: "Faysal Islamic", product: "Tawawoq Home Financing", type: "islamic", rate: 16.9, maxTenor: 20 },
  { id: "mcb", name: "MCB Conventional", product: "MCB Home Loan", type: "conventional", rate: 17.5, maxTenor: 25 }
];

export default function HomeFinancingStudioModal({ isOpen, onClose, defaultPrice = 45000000 }: HomeFinancingStudioModalProps) {
  const [propertyPrice, setPropertyPrice] = useState<number>(defaultPrice);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(30);
  const [tenorYears, setTenorYears] = useState<number>(15);
  const [selectedBankId, setSelectedBankId] = useState("meezan");
  const [monthlyIncome, setMonthlyIncome] = useState<number>(650000);
  const [showPreApprovalSuccess, setShowPreApprovalSuccess] = useState(false);

  const selectedBank = BANKS.find(b => b.id === selectedBankId) || BANKS[0];

  // Mathematical Calculation
  const downPaymentAmount = Math.round(propertyPrice * (downPaymentPercent / 100));
  const loanPrincipal = propertyPrice - downPaymentAmount;

  // Monthly Rate & Installment (EMI) Formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const annualRate = selectedBank.rate / 100;
  const monthlyRate = annualRate / 12;
  const totalMonths = tenorYears * 12;

  const monthlyInstallment = Math.round(
    (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );

  const totalRepayment = monthlyInstallment * totalMonths;
  const totalProfitBank = totalRepayment - loanPrincipal;

  // Debt-to-Burden Ratio (DBR) Check: Monthly installment should ideally be < 50% of monthly income in Pakistan
  const dbrRatio = (monthlyInstallment / (monthlyIncome || 1)) * 100;
  const isEligible = dbrRatio <= 50;

  const handleRequestPreApproval = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPreApprovalSuccess(true);
    toast.success("Pre-Approval Application generated successfully!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-4xl bg-white dark:bg-[#12131A] rounded-[32px] shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-apple-gray/20 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Building className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-apple-text tracking-tight">
                  Islamic Home Financing Studio
                </h3>
                <span className="text-[10px] font-bold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  Shariah Compliant (Diminishing Musharakah)
                </span>
              </div>
              <p className="text-xs text-apple-text-muted mt-0.5">
                Calculate monthly installment, down payment % & pre-qualify instantly with top Pakistani banks.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-apple-gray dark:bg-white/10 flex items-center justify-center text-apple-text-muted hover:text-apple-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0">
          {/* Sliders & Bank Selector */}
          <div className="md:col-span-6 space-y-5">
            {/* Bank Selector */}
            <div>
              <label className="text-xs font-bold text-apple-text uppercase tracking-wider block mb-2">
                Financing Institution & Structure
              </label>
              <div className="space-y-1.5">
                {BANKS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBankId(b.id)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      selectedBankId === b.id
                        ? "bg-purple-50 dark:bg-purple-950/20 border-purple-500 text-apple-text"
                        : "bg-apple-gray/40 dark:bg-white/5 border-black/5 dark:border-white/5 text-apple-text hover:bg-apple-gray"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{b.name}</div>
                      <div className="text-[11px] text-apple-text-muted">{b.product}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                        {b.rate}% p.a.
                      </div>
                      <div className="text-[9px] font-mono text-apple-text-muted uppercase">
                        {b.type}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Property Price Slider */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <label className="text-xs font-bold text-apple-text uppercase tracking-wider">
                  Property Value
                </label>
                <span className="text-sm font-bold font-mono text-apple-text">
                  {formatPrice(propertyPrice)}
                </span>
              </div>
              <input
                type="range"
                min={5000000}
                max={200000000}
                step={2500000}
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-apple-gray rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Down Payment % Slider */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <label className="text-xs font-bold text-apple-text uppercase tracking-wider">
                  Down Payment ({downPaymentPercent}%)
                </label>
                <span className="text-sm font-bold font-mono text-apple-text">
                  {formatPrice(downPaymentAmount)}
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={75}
                step={5}
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                className="w-full h-1.5 bg-apple-gray rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Tenor (Years) Slider */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <label className="text-xs font-bold text-apple-text uppercase tracking-wider">
                  Financing Tenor ({tenorYears} Years)
                </label>
                <span className="text-xs font-mono text-apple-text-muted">
                  {totalMonths} Monthly Installments
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={selectedBank.maxTenor}
                step={1}
                value={tenorYears}
                onChange={(e) => setTenorYears(Number(e.target.value))}
                className="w-full h-1.5 bg-apple-gray rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Monthly Household Income Check */}
            <div>
              <label className="text-xs font-bold text-apple-text uppercase tracking-wider block mb-1">
                Net Monthly Household Income (PKR)
              </label>
              <input
                type="number"
                min={100000}
                step={25000}
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                className="w-full bg-apple-gray/40 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-2.5 text-xs font-mono font-bold text-apple-text outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>

          {/* Results & Pre-Approval Box */}
          <div className="md:col-span-6 bg-apple-gray/30 dark:bg-white/[0.02] rounded-3xl p-6 border border-black/5 dark:border-white/10 flex flex-col justify-between space-y-6">
            {!showPreApprovalSuccess ? (
              <>
                <div className="space-y-5">
                  <div className="border-b border-black/5 dark:border-white/10 pb-4">
                    <span className="text-xs font-bold text-apple-text-muted uppercase tracking-wider font-mono">
                      Estimated Monthly Installment
                    </span>
                    <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 font-mono mt-1">
                      PKR {monthlyInstallment.toLocaleString()}
                      <span className="text-xs font-normal text-apple-text-muted"> / mo</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                      <span className="text-apple-text-muted">Bank Principal Funded</span>
                      <span className="font-mono font-bold text-apple-text">{formatPrice(loanPrincipal)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                      <span className="text-apple-text-muted">Down Payment Equity</span>
                      <span className="font-mono font-bold text-apple-text">{formatPrice(downPaymentAmount)} ({downPaymentPercent}%)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                      <span className="text-apple-text-muted">Estimated Total Profit Share</span>
                      <span className="font-mono font-bold text-apple-text">{formatPrice(totalProfitBank)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                      <span className="text-apple-text-muted">Debt-to-Burden Ratio (DBR)</span>
                      <span className={`font-mono font-bold ${isEligible ? "text-emerald-500" : "text-amber-500"}`}>
                        {dbrRatio.toFixed(1)}% {isEligible ? "(Pre-Qualified)" : "(High Burden)"}
                      </span>
                    </div>
                  </div>

                  {/* Pre-qualification status badge */}
                  <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                    isEligible 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300"
                  }`}>
                    <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">
                        {isEligible ? "Eligible for Fast-Track Digital Issuance" : "Income Optimization Recommended"}
                      </div>
                      <div className="text-[11px] mt-0.5 opacity-90 leading-relaxed">
                        {isEligible 
                          ? `Your installment is under 50% of your household income. You meet SBP prudential regulations for ${selectedBank.name}.`
                          : "Consider increasing down payment or tenor to bring installment within 50% of monthly income."
                        }
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRequestPreApproval}
                  className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <FileCheck className="w-4 h-4" />
                  Request Verified Bank Pre-Approval Letter
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-apple-text">Pre-Approval Letter Generated!</h4>
                  <p className="text-xs text-apple-text-muted max-w-sm mt-1">
                    Your preliminary eligibility for {selectedBank.name} has been certified. Reference ID: <span className="font-mono font-bold text-apple-text">PKZ-FIN-2026-9812</span>
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-[#1A1C24] border border-black/5 dark:border-white/10 text-xs w-full text-left font-mono space-y-1">
                  <div>Bank: {selectedBank.name}</div>
                  <div>Eligible Principal: PKR {loanPrincipal.toLocaleString()}</div>
                  <div>Tenor: {tenorYears} Years</div>
                  <div>Estimated Installment: PKR {monthlyInstallment.toLocaleString()} / mo</div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreApprovalSuccess(false)}
                  className="px-6 py-2.5 rounded-xl bg-apple-gray dark:bg-white/10 text-xs font-semibold text-apple-text hover:bg-apple-gray/80"
                >
                  Recalculate or Change Bank
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
