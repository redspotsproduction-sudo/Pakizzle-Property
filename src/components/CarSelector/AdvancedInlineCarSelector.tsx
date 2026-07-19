import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Loader2, Search, Plus, Car } from "lucide-react";
import { cn } from "../../lib/utils";
import { CarMake, CarModel, CarVariant } from "../../types";
import { motion, AnimatePresence } from 'motion/react';

interface AdvancedInlineCarSelectorProps {
  onSelect: (data: { 
    make?: CarMake; 
    model?: CarModel; 
    variant?: CarVariant; 
    variantName?: string;
    makeId?: string | number;
    modelId?: string | number;
    variantId?: string | number;
  }) => void;
  initialValues?: {
    makeId?: string | number;
    modelId?: string | number;
    variantId?: string | number;
    variantName?: string;
  };
  orientation?: 'vertical' | 'horizontal';
}

export default function AdvancedInlineCarSelector({ 
  onSelect, 
  initialValues, 
  orientation = 'vertical' 
}: AdvancedInlineCarSelectorProps) {
  const [makes, setMakes] = useState<CarMake[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [variants, setVariants] = useState<CarVariant[]>([]);

  const [selectedMake, setSelectedMake] = useState<CarMake | null>(null);
  const [selectedModel, setSelectedModel] = useState<CarModel | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<CarVariant | null>(null);
  const [customVariantName, setCustomVariantName] = useState(initialValues?.variantName || '');

  const [loading, setLoading] = useState({ makes: false, models: false, variants: false });
  const [open, setOpen] = useState({ make: false, model: false });

  // Initial fetch: Makes
  useEffect(() => {
    const fetchMakes = async () => {
      setLoading(prev => ({ ...prev, makes: true }));
      try {
        const res = await fetch('/api/makes');
        const data = await res.json();
        setMakes(data);
        
        if (initialValues?.makeId) {
          const make = data.find((m: any) => m.id == initialValues.makeId);
          if (make) setSelectedMake(make);
        }
      } catch (err) {
        console.error("Failed to fetch makes", err);
      } finally {
        setLoading(prev => ({ ...prev, makes: false }));
      }
    };
    fetchMakes();
  }, []);

  // Fetch Models when Make changes
  useEffect(() => {
    if (!selectedMake) {
      setModels([]);
      setSelectedModel(null);
      return;
    }

    const fetchModels = async () => {
      setLoading(prev => ({ ...prev, models: true }));
      try {
        const res = await fetch(`/api/models?makeId=${selectedMake.id}`);
        const data = await res.json();
        setModels(data);
        
        if (initialValues?.modelId && data.some((m: any) => m.id == initialValues.modelId)) {
          const model = data.find((m: any) => m.id == initialValues.modelId);
          setSelectedModel(model);
        } else {
          setSelectedModel(null);
        }
      } catch (err) {
        console.error("Failed to fetch models", err);
      } finally {
        setLoading(prev => ({ ...prev, models: false }));
      }
    };
    fetchModels();
  }, [selectedMake]);

  // Fetch Variants when Model changes
  useEffect(() => {
    if (!selectedModel) {
      setVariants([]);
      setSelectedVariant(null);
      return;
    }

    const fetchVariants = async () => {
      setLoading(prev => ({ ...prev, variants: true }));
      try {
        const res = await fetch(`/api/variants?modelId=${selectedModel.id}`);
        const data = await res.json();
        setVariants(data);
        
        if (initialValues?.variantId && data.some((v: any) => v.id == initialValues.variantId)) {
          const variant = data.find((v: any) => v.id == initialValues.variantId);
          setSelectedVariant(variant);
        } else {
          // If we have a custom name but no initial ID, keep the custom name
          if (!initialValues?.variantId && initialValues?.variantName) {
              setCustomVariantName(initialValues.variantName);
          }
        }
      } catch (err) {
        console.error("Failed to fetch variants", err);
      } finally {
        setLoading(prev => ({ ...prev, variants: false }));
      }
    };
    fetchVariants();
  }, [selectedModel]);

  // Update parent when selections change
  useEffect(() => {
    onSelect({
      make: selectedMake || undefined,
      model: selectedModel || undefined,
      variant: selectedVariant || undefined,
      variantName: customVariantName,
      makeId: selectedMake?.id,
      modelId: selectedModel?.id,
      variantId: selectedVariant?.id
    });
  }, [selectedMake, selectedModel, selectedVariant, customVariantName]);

  return (
    <div className={cn(
      "grid gap-6",
      orientation === 'horizontal' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
    )}>
      {/* Make Selection */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-text-muted ml-1">Master Manufacturer</label>
        <div className="relative">
          <select 
            className="apple-input w-full h-14 bg-white dark:bg-white/5 border-2 border-apple-border appearance-none font-bold"
            value={selectedMake?.id || ''}
            onChange={(e) => {
              const make = makes.find(m => m.id.toString() === e.target.value);
              setSelectedMake(make || null);
              setSelectedModel(null);
              setSelectedVariant(null);
              setCustomVariantName('');
            }}
          >
            <option value="">Select Manufacturer</option>
            {makes.map(make => (
              <option key={make.id} value={make.id}>{make.name}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            {loading.makes ? <Loader2 className="w-5 h-5 animate-spin text-apple-blue" /> : <ChevronsUpDown className="w-5 h-5 text-apple-text-muted" />}
          </div>
        </div>
      </div>

      {/* Model Selection */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-text-muted ml-1">Series Lineup</label>
        <div className="relative">
          <select 
            className="apple-input w-full h-14 bg-white dark:bg-white/5 border-2 border-apple-border appearance-none font-bold disabled:opacity-50"
            disabled={!selectedMake}
            value={selectedModel?.id || ''}
            onChange={(e) => {
              const model = models.find(m => m.id.toString() === e.target.value);
              setSelectedModel(model || null);
              setSelectedVariant(null);
              setCustomVariantName('');
            }}
          >
            <option value="">{selectedMake ? "Select Model" : "Define Make First"}</option>
            {models.map(model => (
              <option key={model.id} value={model.id}>{model.name}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            {loading.models ? <Loader2 className="w-5 h-5 animate-spin text-apple-blue" /> : <ChevronsUpDown className="w-5 h-5 text-apple-text-muted" />}
          </div>
        </div>
      </div>

      {/* Variant Selection - Black Style with Typing */}
      <div className={cn(
        "space-y-2",
        orientation === 'horizontal' ? "md:col-span-2 lg:col-span-1" : ""
      )}>
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-text-muted ml-1">Specific Variant Configuration</label>
        <div className="relative group">
          <input 
            type="text"
            disabled={!selectedModel}
            placeholder={selectedModel ? "Type variant (e.g. VXR, Altis 1.6...)" : "Define Model First"}
            className="apple-input w-full h-14 bg-black text-white border-none !rounded-[1rem] px-6 font-black tracking-tight placeholder:text-white/20 focus:ring-2 focus:ring-apple-blue/50 transition-all disabled:opacity-30"
            value={customVariantName}
            onChange={(e) => {
                setCustomVariantName(e.target.value);
                // Check if it matches a database variant
                const match = variants.find(v => v.name.toLowerCase() === e.target.value.toLowerCase());
                if (match) setSelectedVariant(match);
                else setSelectedVariant(null);
            }}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest hidden sm:block">Manual Entry</span>
            <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center transition-all",
                customVariantName ? "bg-apple-blue text-white" : "bg-white/10 text-white/20"
            )}>
              <Plus className="w-4 h-4" />
            </div>
          </div>

          {/* Database Suggestions Dropdown */}
          <AnimatePresence>
            {customVariantName && selectedModel && variants.length > 0 && !selectedVariant && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-black border border-white/10 rounded-2xl shadow-2xl z-[100] max-h-60 overflow-y-auto p-2 scrollbar-hide"
                >
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest p-3">Database Suggestions</p>
                    {variants
                        .filter(v => v.name.toLowerCase().includes(customVariantName.toLowerCase()))
                        .map(variant => (
                        <button
                            key={variant.id}
                            onClick={() => {
                                setSelectedVariant(variant);
                                setCustomVariantName(variant.name);
                            }}
                            className="w-full text-left p-4 hover:bg-white/5 rounded-xl transition-colors flex items-center justify-between group"
                        >
                            <span className="text-white font-bold">{variant.name}</span>
                            <Check className="w-4 h-4 text-apple-blue opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    ))}
                    {variants.filter(v => v.name.toLowerCase().includes(customVariantName.toLowerCase())).length === 0 && (
                        <div className="p-4 text-center">
                            <p className="text-xs text-white/40 font-medium">No results found in database. Using custom: "{customVariantName}"</p>
                        </div>
                    )}
                </motion.div>
            )}
          </AnimatePresence>
        </div>
        {selectedVariant && (
            <p className="text-[10px] font-black text-apple-blue px-2 uppercase tracking-widest flex items-center gap-2">
                <Check className="w-3 h-3" />
                Database Verified: {selectedVariant.fuelType} • {selectedVariant.transmission}
            </p>
        )}
      </div>
    </div>
  );
}
