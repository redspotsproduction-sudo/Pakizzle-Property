import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Car, 
  ChevronRight, 
  Zap, 
  Activity, 
  CheckCircle2, 
  ArrowRight,
  Calculator,
  Search,
  ChevronDown,
  Info,
  Loader2,
  ShieldCheck,
  Star,
  Check,
  Lock
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { cn, formatPrice } from '../lib/utils';
import { CarMake, CarModel, CarVariant } from '../types';
import AdvancedCarSelector from './CarSelector/AdvancedCarSelector';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';

interface InsuranceCompany {
  id: string;
  name: string;
  logoUrl: string;
  rate: string;
  trackerFee: string;
  description: string;
  isFeatured: boolean;
  status: 'active' | 'hidden';
}

const FALLBACK_COMPANIES: InsuranceCompany[] = [
  { id: 'igi', name: 'IGI Insurance', logoUrl: 'https://www.igiinsurance.com.pk/wp-content/uploads/2021/04/igi-logo.jpg', rate: '1.4', trackerFee: '0', description: 'Comprehensive coverage with rapid claim processing.', isFeatured: false, status: 'active' },
  { id: 'tpl', name: 'TPL Insurance', logoUrl: 'https://tplinsurance.com/wp-content/uploads/2019/08/logo.png', rate: '1.8', trackerFee: '12500', description: 'Advanced tracking features and 24/7 roadside assistance.', isFeatured: false, status: 'active' },
  { id: 'jubilee', name: 'Jubilee General Insurance', logoUrl: 'https://jubileegeneral.com.pk/wp-content/uploads/2020/09/JGI-Logo.png', rate: '1.75', trackerFee: '11000', description: 'Pakistan\'s oldest and most trusted insurer.', isFeatured: false, status: 'active' },
  { id: 'pakqatar', name: 'Pak Qatar General Takaful', logoUrl: 'https://www.pakqatar.com.pk/wp-content/uploads/2021/05/pq-logo.png', rate: '1.4', trackerFee: '9000', description: 'Shariah-compliant takaful protection for your vehicle.', isFeatured: true, status: 'active' }
];

export default function CarInsuranceCalculator() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<{
    year: number;
    make: CarMake;
    model: CarModel;
    variant: CarVariant;
  } | null>(null);
  const [vehicleValue, setVehicleValue] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<InsuranceCompany | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'insurance_companies'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as InsuranceCompany))
        .filter(c => c.status === 'active');
      
      if (docs.length === 0) {
        setCompanies(FALLBACK_COMPANIES);
      } else {
        setCompanies(docs);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching insurance companies:", error);
      setCompanies(FALLBACK_COMPANIES);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCalculate = () => {
    if (!selectedVehicle || !vehicleValue) return;
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      setShowResults(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2000);
  };

  const parseRate = (rateStr: string) => {
    const match = rateStr.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[0]) : 1.5;
  };

  const parseTrackerFee = (feeStr: string) => {
    if (feeStr.toLowerCase().includes('free')) return 0;
    const match = feeStr.replace(/,/g, '').match(/(\d+)/);
    return match ? parseInt(match[0]) : 0;
  };

  return (
    <div className="bg-apple-bg selection:bg-apple-blue selection:text-white overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] bg-apple-blue/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] bg-apple-orange/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-4 md:py-6 space-y-12">
        {/* Dynamic Header */}
        <AnimatePresence>
          {showResults && !isCalculating && (
            <motion.div 
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="fixed top-0 left-0 right-0 z-[100] bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-apple-border/50 h-16 flex items-center px-6"
            >
              <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <Car className="w-5 h-5 text-apple-blue" />
                    <div className="text-sm font-bold">{selectedVehicle?.year} {selectedVehicle?.make.name} {selectedVehicle?.model.name}</div>
                 </div>
                 <Button 
                   variant="ghost"
                   onClick={() => {
                     setShowResults(false);
                     window.scrollTo({ top: 0, behavior: 'smooth' });
                   }}
                   className="h-9 px-4 rounded-full text-xs"
                 >
                   Edit Details
                 </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!showResults || isCalculating ? (
            <motion.section 
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col items-center text-center space-y-12"
            >
              <div className="space-y-6 max-w-2xl">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-apple-text">
                  Car Insurance <br />
                  <span className="text-apple-blue">Calculator</span>
                </h1>
                
                <p className="text-lg text-apple-text-muted font-medium">
                  Get instant quotes from leading insurance providers based on your vehicle's value.
                </p>
              </div>

              {/* Input Card */}
              <div className="w-full">
                <Card className="glass-card p-8 md:p-10 text-left border-none">
                  <div className="space-y-8">
                    {/* Vehicle Select */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-apple-text-muted">Select Your Vehicle</label>
                      <button 
                        onClick={() => setIsSelectorOpen(true)}
                        className={cn(
                          "w-full flex items-center justify-between px-6 h-16 rounded-[18px] border border-apple-border transition-all text-left",
                          selectedVehicle 
                            ? "bg-apple-blue/5 border-apple-blue/20" 
                            : "bg-apple-gray dark:bg-white/5"
                        )}
                      >
                        <div className="flex items-center gap-4">
                           <Car className={cn("w-5 h-5", selectedVehicle ? "text-apple-blue" : "text-apple-text-muted")} />
                           <span className={cn(
                             "font-semibold",
                             selectedVehicle ? "text-apple-text" : "text-apple-text-muted"
                           )}>
                              {selectedVehicle 
                                ? `${selectedVehicle.year} ${selectedVehicle.make.name} ${selectedVehicle.model.name}` 
                                : "Select Make, Model & Variant"}
                           </span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-apple-text-muted" />
                      </button>
                    </div>

                    {/* Value Input */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-apple-text-muted">Vehicle Value (PKR)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          className="apple-input-premium w-full h-16 !rounded-[18px] text-lg font-bold pl-6"
                          placeholder="Enter current market value"
                          value={vehicleValue}
                          onChange={(e) => setVehicleValue(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Calculate Button */}
                    <button 
                      onClick={handleCalculate}
                      disabled={!selectedVehicle || !vehicleValue || isCalculating}
                      className="apple-button-primary w-full h-16 !rounded-[18px] text-lg font-bold"
                    >
                       <AnimatePresence mode="wait">
                         {isCalculating ? (
                            <motion.div 
                              key="loading" 
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: 1 }} 
                              className="flex items-center gap-2"
                            >
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Calculating Rates...</span>
                            </motion.div>
                         ) : (
                            <motion.div 
                              key="idle" 
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: 1 }}
                              className="flex items-center gap-2"
                            >
                              <span>Calculate Premium</span>
                              <ChevronRight className="w-5 h-5" />
                            </motion.div>
                         )}
                       </AnimatePresence>
                    </button>
                  </div>
                </Card>
              </div>
            </motion.section>
          ) : (
            <motion.section 
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Insurance Estimates</h2>
                <p className="text-apple-text-muted">Rates for {selectedVehicle?.year} {selectedVehicle?.make.name} {selectedVehicle?.model.name}</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {companies.map((company, index) => {
                  const rateValue = parseRate(company.rate);
                  const trackerValue = parseTrackerFee(company.trackerFee);
                  const yearlyPremium = (Number(vehicleValue) * (rateValue / 100));
                  const totalPremium = yearlyPremium + trackerValue;
                  
                  return (
                    <motion.div 
                      key={company.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="glass-card overflow-hidden border-none p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="p-8 border-b md:border-b-0 md:border-r border-apple-border flex flex-col items-center justify-center bg-apple-gray/50 dark:bg-white/5 w-full md:w-56 shrink-0">
                            <img 
                              src={company.logoUrl} 
                              alt={company.name}
                              className="h-16 w-32 object-contain mb-4"
                            />
                            <h3 className="font-bold text-base text-center">{company.name}</h3>
                          </div>
                          
                          <div className="p-8 flex-1 flex flex-col justify-between gap-8">
                            <div className="flex flex-col sm:flex-row justify-between gap-6">
                              <div className="flex-1 space-y-2">
                                <p className="text-sm text-apple-text-muted leading-relaxed">{company.description}</p>
                                <div className="flex gap-2">
                                   <span className="text-[10px] font-bold px-2 py-0.5 bg-apple-green/10 text-apple-green rounded uppercase">Recommended</span>
                                </div>
                              </div>
                              <div className="text-center sm:text-right">
                                <p className="text-xs font-bold text-apple-text-muted uppercase">Annual Rate</p>
                                <p className="text-3xl font-bold text-apple-blue">{company.rate}%</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-apple-border/50">
                               <div>
                                  <p className="text-[10px] font-bold text-apple-text-muted uppercase">Base Premium</p>
                                  <p className="text-xl font-bold">{formatPrice(yearlyPremium)}</p>
                               </div>
                               <div>
                                  <p className="text-[10px] font-bold text-apple-text-muted uppercase">Tracker Fee</p>
                                  <p className="text-xl font-bold">{trackerValue === 0 ? 'Included' : formatPrice(trackerValue)}</p>
                               </div>
                               <div className="sm:text-right">
                                  <p className="text-[10px] font-bold text-apple-green uppercase">Estimated Total</p>
                                  <p className="text-3xl font-bold text-apple-green">{formatPrice(totalPremium)}</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                              <button 
                                onClick={() => navigate(`/insurance/book/car?provider=${company.id}&value=${vehicleValue}&year=${selectedVehicle?.year}&make=${selectedVehicle?.make.name}&model=${selectedVehicle?.model.name}`)}
                                className="apple-button-primary flex-1 h-12"
                              >
                                Apply Now
                              </button>
                             <button 
                               onClick={() => setSelectedDetails(company)}
                               className="apple-button-glass h-12 px-6"
                             >
                                View Details
                             </button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <AdvancedCarSelector 
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelect={(data) => {
          setSelectedVehicle(data);
          setIsSelectorOpen(false);
        }}
      />

      <Dialog open={!!selectedDetails} onOpenChange={() => setSelectedDetails(null)}>
        <DialogContent className="max-w-2xl bg-white dark:bg-[#1D1D1F] border-none shadow-2xl p-0 overflow-hidden sm:rounded-[32px]">
          {selectedDetails && (
            <div className="flex flex-col h-full">
              <div className="p-8 bg-apple-gray dark:bg-white/5 border-b border-apple-border flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-white p-3 border border-apple-border shadow-sm">
                    <img src={selectedDetails.logoUrl} alt={selectedDetails.name} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">{selectedDetails.name}</h2>
                    <p className="text-sm text-apple-text-muted font-medium">Comprehensive Auto Policy</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-5 rounded-2xl bg-apple-blue/5 border border-apple-blue/10">
                    <p className="text-[10px] font-bold text-apple-blue uppercase tracking-widest mb-1">Annual Rate</p>
                    <p className="text-3xl font-bold text-apple-blue">{selectedDetails.rate}%</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-apple-green/5 border border-apple-green/10">
                    <p className="text-[10px] font-bold text-apple-green uppercase tracking-widest mb-1">Tracker Fee</p>
                    <p className="text-3xl font-bold text-apple-green">{selectedDetails.trackerFee === '0' ? 'Included' : selectedDetails.trackerFee}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-apple-blue" />
                    Coverage Breakdown
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      "Accidental Damage to Vehicle",
                      "Theft & Snatching Coverage",
                      "Third Party Liability (RS 500,000+)",
                      "Natural Disaster Protection",
                      "Fire & Explosion Insurance",
                      "Terrorism Damage (Optional Add-on)",
                      "TCS Free Document Delivery",
                      "Instant Online Policy Issuance"
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-apple-gray dark:bg-white/5 text-sm font-medium">
                        <Check className="w-4 h-4 text-apple-green shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                   <h3 className="font-bold text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-apple-orange" />
                    Key Benefits
                  </h3>
                  <div className="space-y-3">
                    <div className="flex gap-4 p-4 rounded-xl border border-apple-border">
                       <Activity className="w-5 h-5 text-apple-blue shrink-0 mt-1" />
                       <div>
                         <p className="font-bold text-sm">24/7 Roadside Assistance</p>
                         <p className="text-xs text-apple-text-muted mt-0.5 font-medium leading-relaxed">Emergency mechanical help and towing services available across Pakistan.</p>
                       </div>
                    </div>
                    <div className="flex gap-4 p-4 rounded-xl border border-apple-border">
                       <Star className="w-5 h-5 text-apple-orange shrink-0 mt-1" />
                       <div>
                         <p className="font-bold text-sm">Nil Depreciation (Add-on)</p>
                         <p className="text-xs text-apple-text-muted mt-0.5 font-medium leading-relaxed">Replace parts with brand new ones without any deduction in claim amount.</p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-apple-border bg-apple-gray/30 dark:bg-white/5 flex gap-4">
                <Button 
                  onClick={() => navigate(`/insurance/book/car?provider=${selectedDetails.id}&value=${vehicleValue}&year=${selectedVehicle?.year}&make=${selectedVehicle?.make.name}&model=${selectedVehicle?.model.name}`)}
                  className="apple-button-primary flex-1 h-14"
                >
                  Confirm & Apply
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedDetails(null)}
                  className="h-14 px-8 rounded-full border border-apple-border font-bold"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
