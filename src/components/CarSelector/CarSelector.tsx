import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CarMake, CarModel, CarVariant } from "@/types";

interface CarSelectorProps {
  onSelect: (data: { make?: CarMake; model?: CarModel; variant?: CarVariant }) => void;
  initialValues?: {
    makeId?: string | number;
    modelId?: string | number;
    variantId?: string | number;
  };
  orientation?: 'vertical' | 'horizontal';
  hideVariant?: boolean;
}

export function CarSelector({ onSelect, initialValues, orientation = 'vertical', hideVariant = false }: CarSelectorProps) {
  const [makes, setMakes] = useState<CarMake[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [variants, setVariants] = useState<CarVariant[]>([]);

  const [selectedMake, setSelectedMake] = useState<CarMake | null>(null);
  const [selectedModel, setSelectedModel] = useState<CarModel | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<CarVariant | null>(null);

  const [loading, setLoading] = useState({ makes: false, models: false, variants: false });
  const [open, setOpen] = useState({ make: false, model: false, variant: false });

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
    if (!selectedModel || hideVariant) {
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
          setSelectedVariant(null);
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
      variant: selectedVariant || undefined
    });
  }, [selectedMake, selectedModel, selectedVariant]);

  const Selector = ({ 
    items, 
    value, 
    onChange, 
    label, 
    placeholder, 
    disabled, 
    loading, 
    isOpen, 
    setIsOpen 
  }: any) => (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-xs font-bold text-apple-text-muted uppercase tracking-wider">{label}</label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger 
          disabled={disabled}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "w-full justify-between h-12 bg-apple-gray/5 border-apple-gray/10 hover:bg-apple-gray/10 text-apple-text font-medium flex items-center transition-all active:scale-[0.98]"
          )}
          aria-expanded={isOpen}
          role="combobox"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-apple-blue" />
              <span>Loading...</span>
            </div>
          ) : value ? (
            items.find((item: any) => item.id == value.id)?.name
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[--radix-popover-trigger-width] pointer-events-auto" align="start">
          <Command>
            <CommandInput placeholder={`Search ${label}...`} className="h-10" />
            <CommandList className="max-h-[300px]">
              <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
              <CommandGroup>
                {items.map((item: any) => (
                  <CommandItem
                    key={item.id}
                    value={item.name}
                    onSelect={() => {
                      onChange(item);
                      setIsOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 text-apple-blue",
                        value?.id == item.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex items-center gap-3">
                      {item.logoUrl && <img src={item.logoUrl} className="w-5 h-5 object-contain" alt={item.name} />}
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <div className={cn(
      "grid gap-4",
      orientation === 'horizontal' ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1"
    )}>
      <Selector
        label="Make"
        placeholder="Select Make"
        items={makes}
        value={selectedMake}
        onChange={(make: CarMake) => {
          setSelectedMake(make);
          setSelectedModel(null);
          setSelectedVariant(null);
        }}
        loading={loading.makes}
        isOpen={open.make}
        setIsOpen={(o: boolean) => setOpen(prev => ({ ...prev, make: o }))}
      />

      <Selector
        label="Model"
        placeholder={selectedMake ? "Select Model" : "Select Make First"}
        items={models}
        value={selectedModel}
        onChange={(model: CarModel) => {
          setSelectedModel(model);
          setSelectedVariant(null);
        }}
        disabled={!selectedMake}
        loading={loading.models}
        isOpen={open.model}
        setIsOpen={(o: boolean) => setOpen(prev => ({ ...prev, model: o }))}
      />

      {(!hideVariant || (variants.length > 0)) && (
        <Selector
          label="Variant"
          placeholder={selectedModel ? "Select Variant" : "Select Model First"}
          items={variants}
          value={selectedVariant}
          onChange={setSelectedVariant}
          disabled={!selectedModel || variants.length === 0}
          loading={loading.variants}
          isOpen={open.variant}
          setIsOpen={(o: boolean) => setOpen(prev => ({ ...prev, variant: o }))}
        />
      )}
    </div>
  );
}
