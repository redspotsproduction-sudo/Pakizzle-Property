import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronRight, 
  Search, 
  Database,
  Check,
  ChevronLeft
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { CarMake, CarModel, CarVariant } from '../../types';
import { vehicleAdminService } from '../../services/vehicleAdminService';

interface AdvancedCarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (data: { year: number; make: CarMake; model: CarModel; variant: CarVariant }) => void;
  initialYear?: number;
}

export default function AdvancedCarSelector({ isOpen, onClose, onSelect, initialYear }: AdvancedCarSelectorProps) {
  const [step, setStep] = useState<'year' | 'make' | 'model' | 'variant'>('year');
  const [selectedYear, setSelectedYear] = useState<number | null>(initialYear || null);
  const [selectedMake, setSelectedMake] = useState<CarMake | null>(null);
  const [selectedModel, setSelectedModel] = useState<CarModel | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<CarVariant | null>(null);

  const [makes, setMakes] = useState<CarMake[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [variants, setVariants] = useState<CarVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1990 + 2 }, (_, i) => currentYear + 1 - i);

  useEffect(() => {
    if (isOpen) {
      fetchMakes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedMake) {
      fetchModels(selectedMake.id);
    }
  }, [selectedMake]);

  useEffect(() => {
    if (selectedModel) {
      fetchVariants(selectedModel.id);
    }
  }, [selectedModel]);

  const fetchMakes = async () => {
    setLoading(true);
    try {
      const data = await vehicleAdminService.getMakes();
      setMakes(data.filter(m => m.isActive));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async (makeId: string | number) => {
    setLoading(true);
    try {
      const data = await vehicleAdminService.getModels(makeId);
      setModels(data.filter(m => m.isActive));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVariants = async (modelId: string | number) => {
    setLoading(true);
    try {
      const data = await vehicleAdminService.getVariants(modelId);
      setVariants(data.filter(v => v.isActive));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setSearchQuery('');
    setStep('make');
  };

  const handleMakeSelect = (make: CarMake) => {
    setSelectedMake(make);
    setSearchQuery('');
    setStep('model');
  };

  const handleModelSelect = (model: CarModel) => {
    setSelectedModel(model);
    setSearchQuery('');
    setStep('variant');
  };

  const handleVariantSelect = (variant: CarVariant) => {
    setSelectedVariant(variant);
  };

  const handleDone = () => {
    if (selectedYear && selectedMake && selectedModel && selectedVariant) {
      onSelect({
        year: selectedYear,
        make: selectedMake,
        model: selectedModel,
        variant: selectedVariant
      });
      onClose();
    }
  };

  const reset = () => {
    setStep('year');
    setSelectedYear(null);
    setSelectedMake(null);
    setSelectedModel(null);
    setSelectedVariant(null);
    setSearchQuery('');
  };

  if (!isOpen) return null;

  const steps = [
    { id: 'year', label: 'Model Year' },
    { id: 'make', label: 'Make' },
    { id: 'model', label: 'Model' },
    { id: 'variant', label: 'Version' }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        className="relative w-full max-w-5xl bg-white/90 dark:bg-black/90 backdrop-blur-[50px] rounded-[40px] shadow-apple-hover border border-white/40 dark:border-white/10 overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header with Breadcrumbs */}
        <div className={cn(
          "px-10 py-8 border-b transition-colors duration-700",
          step === 'variant' 
            ? "bg-black/5 border-white/5" 
            : "border-apple-border/30"
        )}>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-apple-text">Configure Asset</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-apple-gray dark:hover:bg-white/5 transition-colors text-apple-text-muted">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-0 overflow-x-auto no-scrollbar">
            {steps.map((s, idx) => (
              <React.Fragment key={s.id}>
                <button 
                  onClick={() => {
                    if (s.id === 'year') setStep('year');
                    if (s.id === 'make' && selectedYear) setStep('make');
                    if (s.id === 'model' && selectedMake) setStep('model');
                    if (s.id === 'variant' && selectedModel) setStep('variant');
                  }}
                  className={cn(
                    "flex flex-col py-3 transition-all shrink-0 min-w-[140px] relative",
                    step === s.id ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-apple-blue after:rounded-full" : ""
                  )}
                >
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5 transition-colors",
                    step === s.id ? "text-apple-blue" : "text-apple-text-muted"
                  )}>
                    {s.label}
                  </span>
                  <span className={cn(
                    "font-bold text-base transition-colors",
                    step === s.id ? "text-apple-text" : "text-apple-text-muted/40"
                  )}>
                    {s.id === 'year' && (selectedYear || '—')}
                    {s.id === 'make' && (selectedMake?.name || '—')}
                    {s.id === 'model' && (selectedModel?.name || '—')}
                    {s.id === 'variant' && (selectedVariant?.name || '—')}
                  </span>
                </button>
                {idx < steps.length - 1 && (
                  <div className="px-6 text-apple-text-muted/20">
                    <ChevronRight className="w-5 h-5 translate-y-4" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        {(step === 'make' || step === 'model') && (
           <div className="px-10 py-6 border-b border-apple-border/20 bg-apple-gray/30 dark:bg-white/5">
             <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-text-muted group-focus-within:text-apple-blue transition-colors" />
                <input 
                  type="text" 
                  placeholder={`Search ${step}...`}
                  className="apple-input-premium w-full pl-14 h-14 !rounded-2xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
           </div>
        )}

        {/* Selection Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {step === 'year' && (
              <motion.div 
                key={step} 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4"
              >
                {years.map((year) => (
                  <button 
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    className={cn(
                      "h-16 rounded-2xl border-2 font-bold text-lg transition-all active:scale-95 duration-300",
                      selectedYear === year 
                        ? "border-apple-blue bg-apple-blue/5 text-apple-blue shadow-lg shadow-apple-blue/10" 
                        : "border-apple-border hover:border-apple-blue/30"
                    )}
                  >
                    {year}
                  </button>
                ))}
              </motion.div>
            )}

            {step === 'make' && (
              <motion.div 
                key={step} 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6"
              >
                {makes
                  .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((make) => (
                  <button 
                    key={make.id}
                    onClick={() => handleMakeSelect(make)}
                    className={cn(
                      "p-8 rounded-[32px] border-2 flex flex-col items-center gap-6 transition-all active:scale-95 group duration-500 hover:-translate-y-1",
                      selectedMake?.id === make.id 
                        ? "border-apple-blue bg-apple-blue/5" 
                        : "border-apple-border hover:border-apple-blue/30"
                    )}
                  >
                    <div className="w-20 h-20 rounded-3xl bg-white p-3 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                      {make.logoUrl ? (
                        <img src={make.logoUrl} alt={make.name} className="w-full h-full object-contain" />
                      ) : (
                        <Database className="w-10 h-10 text-apple-text-muted" />
                      )}
                    </div>
                    <span className="font-bold text-base tracking-tight text-apple-text">{make.name}</span>
                  </button>
                ))}
              </motion.div>
            )}

            {step === 'model' && (
              <motion.div 
                key={step} 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {models
                  .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((model) => (
                  <button 
                    key={model.id}
                    onClick={() => handleModelSelect(model)}
                    className={cn(
                      "flex items-center justify-between p-6 rounded-2xl border-2 transition-all active:scale-[0.98] text-left group duration-300 hover:bg-apple-blue/5",
                      selectedModel?.id === model.id 
                        ? "border-apple-blue bg-apple-blue/5" 
                        : "border-apple-border hover:border-apple-blue/30"
                    )}
                  >
                    <span className="font-bold text-lg group-hover:translate-x-1 transition-transform duration-300">{model.name}</span>
                    <ChevronRight className="w-5 h-5 text-apple-blue opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
              </motion.div>
            )}

            {step === 'variant' && (
              <motion.div 
                key={step} 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 gap-4 max-w-2xl mx-auto w-full"
              >
                <div className="space-y-6">
                  <div className="relative group">
                    <input 
                      type="text" 
                      placeholder="Type car version..."
                      className="apple-input-premium w-full h-[72px] !rounded-3xl text-xl font-bold pr-20"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2">
                      <div className="w-10 h-10 bg-apple-blue rounded-full flex items-center justify-center text-white shadow-lg animate-pulse">
                         <Search className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {variants
                      .filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((variant) => (
                      <button 
                        key={variant.id}
                        onClick={() => {
                          handleVariantSelect(variant);
                          setSearchQuery(variant.name);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-7 rounded-[28px] border transition-all active:scale-[0.99] text-left group duration-300",
                          selectedVariant?.id === variant.id 
                            ? "border-apple-blue bg-apple-blue/10" 
                            : "border-apple-border/50 bg-apple-surface/30 hover:bg-apple-surface/60 hover:border-apple-border"
                        )}
                      >
                        <div>
                          <h5 className="font-bold text-[19px] mb-1.5 text-apple-text">{variant.name}</h5>
                          <div className="flex gap-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-apple-text-muted bg-apple-gray dark:bg-white/10 px-2.5 py-1 rounded-lg">{variant.engineCc}CC</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-apple-text-muted bg-apple-gray dark:bg-white/10 px-2.5 py-1 rounded-lg">{variant.transmission}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-apple-text-muted bg-apple-gray dark:bg-white/10 px-2.5 py-1 rounded-lg">{variant.fuelType}</span>
                          </div>
                        </div>
                        {selectedVariant?.id === variant.id && (
                           <div className="bg-apple-blue text-white p-2.5 rounded-full shadow-lg shadow-apple-blue/20">
                              <Check className="w-5 h-5" />
                           </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-10 border-t border-apple-border/20 bg-apple-gray/30 dark:bg-white/5 backdrop-blur-xl flex justify-between items-center">
            <button 
              onClick={reset}
              className="text-[11px] font-bold uppercase tracking-[0.2em] text-apple-text-muted hover:text-red-500 transition-colors"
            >
              Reset All
            </button>
            <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="apple-button-glass h-14 !px-10 text-[11px] font-bold uppercase tracking-widest !rounded-2xl"
              >
                Back
              </button>
              <button 
                onClick={handleDone}
                disabled={!selectedYear || !selectedMake || !selectedModel || !selectedVariant}
                className="apple-button-primary h-14 !px-12 text-[11px] font-bold uppercase tracking-widest shadow-xl !rounded-2xl"
              >
                Continue
              </button>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
