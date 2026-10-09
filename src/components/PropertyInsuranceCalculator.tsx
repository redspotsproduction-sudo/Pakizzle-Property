import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Home, 
  Building2, 
  ChevronRight, 
  ChevronDown, 
  Loader2, 
  Star, 
  Check, 
  Lock,
  Layers,
  MapPin,
  Sparkles
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { cn, formatPrice } from '../lib/utils';
import { PropertySelector, PropertyTypeSelection } from './PropertySelector/PropertySelector';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface PropertyInsuranceCompany {
  id: string;
  name: string;
  logoUrl: string;
  rate: string; // e.g. "0.15" (% of property value per annum)
  fireEarthquakeCover: string;
  description: string;
  isFeatured: boolean;
  status: 'active' | 'hidden';
}

const FALLBACK_PROPERTY_INSURERS: PropertyInsuranceCompany[] = [
  { 
    id: 'jubilee', 
    name: 'Jubilee General Property Takaful', 
    logoUrl: 'https://jubileegeneral.com.pk/wp-content/uploads/2020/09/JGI-Logo.png', 
    rate: '0.12', 
    fireEarthquakeCover: '100% Comprehensive Structure & Contents', 
    description: 'Pakistan\'s oldest and most trusted insurer for residential villas, apartments, and commercial plazas.', 
    isFeatured: true, 
    status: 'active' 
  },
  { 
    id: 'efu', 
    name: 'EFU General Estate Insurance', 
    logoUrl: 'https://www.igiinsurance.com.pk/wp-content/uploads/2021/04/igi-logo.jpg', 
    rate: '0.14', 
    fireEarthquakeCover: 'Earthquake, Flood, Riot, and Accidental Damage', 
    description: 'Premier risk coverage with fast surveyor deployment across all major Pakistani cities.', 
    isFeatured: false, 
    status: 'active' 
  },
  { 
    id: 'igi', 
    name: 'IGI General Home Protection', 
    logoUrl: 'https://www.igiinsurance.com.pk/wp-content/uploads/2021/04/igi-logo.jpg', 
    rate: '0.15', 
    fireEarthquakeCover: 'Structure + Interior Fixtures & Fittings', 
    description: 'Affordable annual Takaful plans with zero paperwork for LDA/CDA registered properties.', 
    isFeatured: false, 
    status: 'active' 
  },
  { 
    id: 'pakqatar', 
    name: 'Pak Qatar General Takaful (Real Estate)', 
    logoUrl: 'https://www.pakqatar.com.pk/wp-content/uploads/2021/05/pq-logo.png', 
    rate: '0.11', 
    fireEarthquakeCover: '100% Shariah-Compliant Property Takaful', 
    description: 'Islamic Takaful model protecting residential homeowners against unforeseen natural perils.', 
    isFeatured: true, 
    status: 'active' 
  }
];

export default function PropertyInsuranceCalculator() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<PropertyInsuranceCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyTypeSelection | null>({
    category: 'residential',
    typeName: 'House / Villa',
    typeId: 'house'
  });
  const [propertyValue, setPropertyValue] = useState<string>('35000000'); // 3.5 Crore default
  const [selectedCity, setSelectedCity] = useState<string>('Lahore');
  const [showResults, setShowResults] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<PropertyInsuranceCompany | null>(null);

  useEffect(() => {
    setCompanies(FALLBACK_PROPERTY_INSURERS);
    setLoading(false);
  }, []);

  const handleCalculate = () => {
    if (!selectedProperty || !propertyValue) return;
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      setShowResults(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  };

  const parseRate = (rateStr: string) => {
    const match = rateStr.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[0]) : 0.12;
  };

  return (
    <div className="bg-apple-bg selection:bg-apple-blue selection:text-white overflow-x-hidden min-h-[600px]">
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-4 md:py-6 space-y-12">
        {/* Dynamic Sticky Header on Results */}
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
                    <Home className="w-5 h-5 text-apple-blue" />
                    <div className="text-sm font-bold">{selectedProperty?.typeName} in {selectedCity} (PKR {parseInt(propertyValue || "0").toLocaleString()})</div>
                 </div>
                 <Button 
                   variant="ghost"
                   onClick={() => {
                     setShowResults(false);
                     window.scrollTo({ top: 0, behavior: 'smooth' });
                   }}
                   className="h-9 px-4 rounded-full text-xs cursor-pointer"
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
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-apple-blue/10 text-apple-blue text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Real Estate Protection & Takaful</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-apple-text">
                  Property & Home <br />
                  <span className="text-apple-blue">Insurance Calculator</span>
                </h1>
                
                <p className="text-lg text-apple-text-muted font-medium">
                  Calculate annual Takaful quotes for fire, earthquake, and structural damage on your real estate assets.
                </p>
              </div>

              {/* Input Card */}
              <div className="w-full">
                <Card className="glass-card p-8 md:p-10 text-left border-none shadow-xl">
                  <div className="space-y-8">
                    {/* Property Type Selection */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-apple-text-muted">Select Property Category & Type</label>
                      <PropertySelector 
                        selectedType={selectedProperty?.typeName}
                        onSelect={(selection) => {
                          setSelectedProperty(selection);
                        }}
                      />
                    </div>

                    {/* Value Input */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-apple-text-muted">Estimated Property Value (PKR)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          className="apple-input-premium w-full h-16 !rounded-[18px] text-lg font-bold pl-6"
                          placeholder="e.g. 35000000 (3.5 Crore)"
                          value={propertyValue}
                          onChange={(e) => setPropertyValue(e.target.value)}
                        />
                      </div>
                      <p className="text-xs text-apple-text-muted">
                        Active Value: PKR {propertyValue ? (parseInt(propertyValue) / 100000).toLocaleString() : 0} Lakh
                      </p>
                    </div>

                    {/* City Selector */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-apple-text-muted">City / Location</label>
                      <select 
                        value={selectedCity} 
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full h-14 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 px-4 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none"
                      >
                        <option value="Islamabad">Islamabad</option>
                        <option value="Lahore">Lahore</option>
                        <option value="Karachi">Karachi</option>
                        <option value="Rawalpindi">Rawalpindi</option>
                        <option value="Peshawar">Peshawar</option>
                        <option value="Faisalabad">Faisalabad</option>
                      </select>
                    </div>

                    {/* Calculate Button */}
                    <button 
                      onClick={handleCalculate}
                      disabled={!selectedProperty || !propertyValue || isCalculating}
                      className="apple-button-primary w-full h-16 !rounded-[18px] text-lg font-bold cursor-pointer"
                    >
                       <AnimatePresence mode="wait">
                         {isCalculating ? (
                            <motion.div 
                              key="loading" 
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: 1 }} 
                              className="flex items-center justify-center gap-2"
                            >
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Calculating Quotes...</span>
                            </motion.div>
                         ) : (
                            <motion.div 
                              key="idle" 
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: 1 }} 
                              className="flex items-center justify-center gap-2"
                            >
                              <span>Calculate Annual Premium</span>
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
            /* Results View */
            <motion.section
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Available Property Takaful Plans</h2>
                  <p className="text-sm text-apple-text-muted">Ranked by annual value for {selectedProperty?.typeName} in {selectedCity}</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowResults(false)}
                  className="rounded-full text-xs cursor-pointer"
                >
                  Adjust Parameters
                </Button>
              </div>

              <div className="grid gap-4">
                {companies.map((company) => {
                  const val = parseFloat(propertyValue || "0");
                  const rateNum = parseRate(company.rate);
                  const annualPremium = Math.round((val * rateNum) / 100);
                  const monthlyPremium = Math.round(annualPremium / 12);

                  return (
                    <Card key={company.id} className="p-6 rounded-3xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#1C1C1E] shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-apple-blue/10 flex items-center justify-center text-apple-blue shrink-0">
                            <ShieldCheck className="w-7 h-7" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-slate-900 dark:text-white">{company.name}</h3>
                              {company.isFeatured && (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-apple-blue text-white">Recommended</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{company.description}</p>
                            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">✓ {company.fireEarthquakeCover}</p>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-black/5 shrink-0">
                          <div className="text-right">
                            <div className="text-xs text-apple-text-muted font-bold uppercase tracking-wider">Annual Premium</div>
                            <div className="text-xl font-black text-apple-blue">PKR {annualPremium.toLocaleString()}</div>
                            <div className="text-[10px] text-slate-400">~PKR {monthlyPremium.toLocaleString()}/mo</div>
                          </div>
                          <Button 
                            onClick={() => setSelectedDetails(company)}
                            className="mt-2 apple-button-primary !h-10 !px-5 text-xs rounded-xl cursor-pointer"
                          >
                            View Plan Details
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* Plan Details Dialog */}
      <Dialog open={!!selectedDetails} onOpenChange={() => setSelectedDetails(null)}>
        <DialogContent className="max-w-md bg-white dark:bg-[#1D1D1F] sm:rounded-[28px] p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{selectedDetails?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedDetails?.description}
            </p>
            <div className="p-3 rounded-2xl bg-apple-gray dark:bg-white/5 space-y-2 text-xs">
              <div className="flex justify-between font-bold">
                <span>Coverage Ratio:</span>
                <span className="text-apple-blue">{selectedDetails?.rate}% / Year</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Natural Perils:</span>
                <span className="text-emerald-600">Earthquake & Fire Included</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Surveyor Dispatch:</span>
                <span>Within 24 Hours</span>
              </div>
            </div>
            <Button 
              onClick={() => {
                setSelectedDetails(null);
                navigate('/insurance/book/property');
              }}
              className="w-full apple-button-primary !h-12 text-xs rounded-xl font-bold cursor-pointer"
            >
              Request Formal Policy Quote
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
