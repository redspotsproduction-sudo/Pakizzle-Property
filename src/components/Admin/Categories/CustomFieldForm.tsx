import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Save, 
  Upload, 
  X,
  Plus,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Category, CategoryField, CategoryFieldType, PopularStyle } from '@/types';
import { popularStylesService, BODY_STYLE_PRESETS } from "@/services/popularStylesService";
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CustomFieldFormProps {
  field: CategoryField;
  allCategories: Category[];
  onSave: (data: CategoryField) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const FIELD_TYPES: { value: CategoryFieldType; label: string }[] = [
  { value: 'text', label: 'Text Input' },
  { value: 'number', label: 'Number' },
  { value: 'range', label: 'Range' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'multi-select', label: 'Multi-Select' },
  { value: 'radio', label: 'Radio Button' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'date', label: 'Date' },
  { value: 'toggle', label: 'Toggle/Switch' },
  { value: 'location', label: 'Location' },
  { value: 'file', label: 'File Upload' },
  { value: 'image', label: 'Image Upload' },
];

export default function CustomFieldForm({ field, allCategories, onSave, onCancel, isLoading }: CustomFieldFormProps) {
  const [formData, setFormData] = useState<CategoryField>(field);
  const [activeLang, setActiveLang] = useState('en');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [popularStyles, setPopularStyles] = useState<PopularStyle[]>([]);

  useEffect(() => {
    setFormData(field);
  }, [field]);

  useEffect(() => {
    popularStylesService.getAll().then(styles => {
      setPopularStyles(styles);
    }).catch(err => {
      console.error("Failed to load popular styles meta reference:", err);
    });
  }, []);

  const handleChange = (key: keyof CategoryField, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTranslationChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      nameTranslations: {
        ...(prev.nameTranslations || {}),
        [activeLang]: value
      }
    }));
    if (activeLang === 'en') {
      setFormData(prev => ({ ...prev, name: value }));
    }
  };

  const getTranslationValue = (field: string) => {
    return formData.nameTranslations?.[activeLang] || '';
  };

  const toggleCategory = (categoryId: string) => {
    const current = new Set(formData.categoryIds || []);
    if (current.has(categoryId)) {
      current.delete(categoryId);
    } else {
      current.add(categoryId);
    }
    handleChange('categoryIds', Array.from(current));
  };

  const togglePopularStyle = (styleId: string) => {
    const current = new Set(formData.popularStyleIds || []);
    if (current.has(styleId)) {
      current.delete(styleId);
    } else {
      current.add(styleId);
    }
    handleChange('popularStyleIds', Array.from(current));
  };

  const toggleExpand = (categoryId: string) => {
    const next = new Set(expandedCategories);
    if (next.has(categoryId)) {
      next.delete(categoryId);
    } else {
      next.add(categoryId);
    }
    setExpandedCategories(next);
  };

  const renderCategoryTree = (parentId: string | null = null, level = 0) => {
    const children = allCategories.filter(c => c.parentId === parentId);
    if (children.length === 0) return null;

    return (
      <div className={cn("space-y-1", level > 0 && "ml-4 border-l border-apple-border/10 pl-2")}>
        {children.map((cat, idx) => {
          const hasChildren = allCategories.some(c => c.parentId === cat.id);
          const isExpanded = expandedCategories.has(cat.id);
          const isSelected = (formData.categoryIds || []).includes(cat.id);

          return (
            <div key={`field-cat-select-${cat.id}-${idx}`} className="space-y-1">
              <div className="flex items-center gap-2 group p-1 rounded-lg hover:bg-apple-gray/50 dark:hover:bg-white/5 transition-colors">
                <button 
                  onClick={() => toggleExpand(cat.id)}
                  className={cn(
                    "w-5 h-5 flex items-center justify-center rounded transition-transform",
                    !hasChildren && "invisible"
                  )}
                >
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                
                <div 
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all",
                    isSelected ? "bg-apple-blue border-apple-blue text-white" : "border-apple-border/50 bg-white dark:bg-black/20"
                  )}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                </div>

                <span 
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    "text-xs font-medium cursor-pointer transition-colors",
                    isSelected ? "text-apple-blue font-bold" : "text-apple-text-muted"
                  )}
                >
                  {cat.name}
                  {hasChildren && <ArrowLeft className={cn("w-3 h-3 inline ml-1 rotate-180 transition-opacity", isExpanded ? "opacity-100" : "opacity-0")} />}
                </span>
              </div>
              
              {isExpanded && renderCategoryTree(cat.id, level + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-apple-text">Custom Fields</h1>
        <div className="flex items-center gap-4">
           {/* Add language switcher here if needed at top level */}
        </div>
      </div>

      <div className="">
        <Button 
          variant="ghost" 
          onClick={onCancel}
          className="bg-[#00bcd4] hover:bg-[#00acc1] text-white rounded-md h-10 px-4 text-xs font-bold gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Custom Fields
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Field Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-white/[0.02] border border-apple-border/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-apple-border/5 bg-gray-50/50 dark:bg-white/5">
              <h2 className="text-sm font-bold text-apple-text-muted">
                {field.id.startsWith('new_') ? 'Create' : 'Edit'} Custom Field
              </h2>
            </div>

            <div className="p-8 space-y-8">
              <Tabs value={activeLang} onValueChange={setActiveLang} className="w-full">
                <TabsList className="bg-transparent h-auto p-0 gap-6 border-b rounded-none w-full justify-start border-apple-border/10">
                  {[
                    { id: 'en', label: 'English' },
                    { id: 'fr', label: 'Français' },
                    { id: 'ar', label: 'عربي' },
                    { id: 'ru', label: 'Русский' }
                  ].map(lang => (
                    <TabsTrigger 
                      key={lang.id} 
                      value={lang.id}
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-apple-blue data-[state=active]:bg-transparent data-[state=active]:text-apple-blue px-0 pb-4 text-sm font-medium transition-all"
                    >
                      {lang.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="pt-8">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-apple-text">
                      Field Name ({activeLang === 'en' ? 'English' : activeLang.charAt(0).toUpperCase() + activeLang.slice(1)})
                    </Label>
                    <Input 
                      value={getTranslationValue('name')}
                      onChange={(e) => handleTranslationChange('name', e.target.value)}
                      className="h-12 bg-white dark:bg-black/20 border-apple-border/20 rounded-lg focus:ring-apple-blue/20"
                    />
                  </div>
                </div>
              </Tabs>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-apple-text">Field Type</Label>
                <select 
                  className="w-full h-12 bg-white dark:bg-black/20 border border-apple-border/20 rounded-lg px-4 text-sm outline-none focus:ring-2 focus:ring-apple-blue/20 disabled:opacity-50"
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                >
                  <option value="">Select Field Type</option>
                  {FIELD_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <p className="text-[10px] text-apple-text-muted">Field type cannot be changed after creation.</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-apple-text">Field Length (Min)</Label>
                  <Input 
                    type="number"
                    value={formData.validation?.minLength || ''}
                    onChange={(e) => handleChange('validation', { ...formData.validation, minLength: Number(e.target.value) })}
                    className="h-12 bg-white dark:bg-black/20 border-apple-border/20 rounded-lg"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-apple-text">Field Length (Max)</Label>
                  <Input 
                    type="number"
                    value={formData.validation?.maxLength || ''}
                    onChange={(e) => handleChange('validation', { ...formData.validation, maxLength: Number(e.target.value) })}
                    className="h-12 bg-white dark:bg-black/20 border-apple-border/20 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-apple-text">Icon</Label>
                <div className="flex bg-white dark:bg-black/20 border border-apple-border/20 rounded-lg overflow-hidden group">
                   <button className="h-12 px-6 bg-gray-100 dark:bg-white/5 border-r border-apple-border/20 text-xs font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                      Choose file
                   </button>
                   <div className="flex-1 px-4 flex items-center text-xs text-apple-text-muted">
                      No file chosen
                   </div>
                </div>
                <p className="text-[10px] text-apple-text-muted">(use 256 x 256 size for better view)</p>
              </div>

              {formData.icon && (
                <div className="w-48 h-48 bg-apple-gray dark:bg-white/5 rounded-2xl border border-apple-border/10 flex items-center justify-center p-4">
                  <img src={formData.icon} alt="Field preview" className="max-w-full max-h-full object-contain" />
                </div>
              )}

              <div className="flex items-center gap-12 pt-4">
                <div className="flex items-center gap-3">
                  <Switch 
                    checked={!!formData.required}
                    onCheckedChange={(checked) => handleChange('required', checked)}
                  />
                  <Label className="text-xs font-medium text-apple-text-muted">Required</Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch 
                    checked={formData.status === 'active'}
                    onCheckedChange={(checked) => handleChange('status', checked ? 'active' : 'inactive')}
                  />
                  <Label className="text-xs font-medium text-apple-text-muted">Active</Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch 
                    checked={!!formData.filterable}
                    onCheckedChange={(checked) => handleChange('filterable', checked)}
                  />
                  <Label className="text-xs font-medium text-apple-text-muted">Filterable</Label>
                </div>
              </div>

              {(formData.type === 'dropdown' || formData.type === 'multi-select' || formData.type === 'radio' || formData.type === 'checkbox') && (
                <div className="space-y-4 pt-4 border-t border-apple-border/10">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold text-apple-text">Field Options</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        const current = formData.options || [];
                        handleChange('options', [...current, { id: `opt_${Date.now()}`, value: '', label: '' }]);
                      }}
                      className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest gap-2"
                    >
                      <Plus className="w-3 h-3" /> Add Option
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {(formData.options || []).map((opt, idx) => (
                      <motion.div 
                        key={opt.id || `opt-${idx}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                      >
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <Input 
                            placeholder="Value (Technical)"
                            value={opt.value}
                            onChange={(e) => {
                              const next = [...(formData.options || [])];
                              next[idx] = { ...next[idx], value: e.target.value };
                              handleChange('options', next);
                            }}
                            className="h-10 bg-white dark:bg-black/20 border-apple-border/20 rounded-lg text-xs"
                          />
                          <Input 
                            placeholder="Label (Display)"
                            value={opt.label}
                            onChange={(e) => {
                              const next = [...(formData.options || [])];
                              next[idx] = { ...next[idx], label: e.target.value };
                              handleChange('options', next);
                            }}
                            className="h-10 bg-white dark:bg-black/20 border-apple-border/20 rounded-lg text-xs"
                          />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            const next = (formData.options || []).filter((_, i) => i !== idx);
                            handleChange('options', next);
                          }}
                          className="h-10 w-10 text-apple-red hover:bg-apple-red/10 rounded-xl"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                    {(formData.options || []).length === 0 && (
                      <div className="py-8 text-center border-2 border-dashed border-apple-border/10 rounded-2xl">
                        <p className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest">No options defined yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Category Mapping & Popular Vehicle Styles Reference */}
        <div className="space-y-6 flex flex-col">
          <div className="bg-white dark:bg-white/[0.02] border border-apple-border/10 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[350px]">
            <div className="px-6 py-4 border-b border-apple-border/5 bg-gray-50/50 dark:bg-white/5">
              <h2 className="text-sm font-bold text-apple-text-muted">Category</h2>
            </div>
            
            <ScrollArea className="flex-1 p-6">
               {renderCategoryTree()}
            </ScrollArea>
          </div>

          <div className="bg-white dark:bg-white/[0.02] border border-apple-border/10 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[380px]">
            <div className="px-6 py-4 border-b border-apple-border/5 bg-gray-50/50 dark:bg-white/5 flex items-center justify-between">
              <h2 className="text-sm font-bold text-apple-text-muted flex items-center gap-1.5">
                <span>Popular Styles</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-apple-blue/10 text-apple-blue font-mono font-bold">
                  {popularStyles.length}
                </span>
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider text-apple-blue">Style Meta</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 pr-3 space-y-3 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 scrollbar-track-transparent">
              <div className="space-y-3">
                {popularStyles.map((style, idx) => {
                  let path = style.customSvgPath || '';
                  if (!path && style.iconPreset) {
                    path = BODY_STYLE_PRESETS[style.iconPreset.toLowerCase()]?.svgPath || '';
                  }
                  const isChecked = (formData.popularStyleIds || []).includes(style.id);

                  return (
                    <div 
                      key={`ref-style-${style.id}-${idx}`} 
                      onClick={() => togglePopularStyle(style.id)}
                      className={cn(
                        "p-3 bg-apple-gray/30 dark:bg-white/[0.01] border rounded-xl flex items-center justify-between gap-3 group cursor-pointer transition-all duration-300",
                        isChecked 
                          ? "border-apple-blue/40 bg-apple-blue/[0.03] dark:bg-apple-blue/[0.05]" 
                          : "border-apple-border/10 hover:bg-apple-blue/5 dark:hover:bg-apple-blue/10 hover:border-apple-blue/20"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* Checkbox (Same style as category selection) */}
                        <div 
                          className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all",
                            isChecked ? "bg-apple-blue border-apple-blue text-white" : "border-apple-border/50 bg-white dark:bg-black/20"
                          )}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>

                        <div className="w-12 h-9 rounded-lg border border-apple-border/40 bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-center p-1.5 shrink-0 group-hover:border-apple-blue/30 duration-300">
                          {style.imageUrl ? (
                            <img src={style.imageUrl} alt={style.name} className="w-full h-auto max-h-[22px] object-contain" referrerPolicy="no-referrer" />
                          ) : (
                            <svg viewBox="0 0 24 24" className={cn("w-8 h-4 duration-300 stroke-current fill-none", isChecked ? "text-apple-blue" : "text-apple-text-muted group-hover:text-apple-blue")} strokeWidth="1.3">
                              <path d={path} />
                            </svg>
                          )}
                        </div>
                        <div>
                          <span className={cn("text-xs block transition-all", isChecked ? "font-bold text-apple-blue animate-pulse" : "font-semibold text-apple-text")}>
                            {style.name}
                          </span>
                          <span className="text-[9px] text-apple-text-muted capitalize block">
                            Icon: {style.imageUrl ? 'Photo' : `${style.iconPreset}`}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1">
                        <div className="font-mono text-[9px] bg-apple-gray/80 dark:bg-zinc-800/80 px-2 py-1 rounded border border-apple-border/10 flex flex-col gap-0.5 items-end">
                          <span className="text-apple-text-muted text-[8px] scale-90 origin-right">Key: {style.filterKey || 'bodyType'}</span>
                          <span className={cn("font-bold text-[9px] truncate max-w-[80px]", isChecked ? "text-apple-blue" : "text-apple-text")}>Val: {style.filterValue}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {popularStyles.length === 0 && (
                  <div className="text-center py-12 text-xs text-apple-text-muted italic">
                    No popular vehicle styles found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={() => onSave(formData)}
          disabled={isLoading}
          className="bg-[#00bcd4] hover:bg-[#00acc1] text-white rounded-md h-12 px-8 font-bold text-sm shadow-lg shadow-cyan-500/20"
        >
          {isLoading ? 'Saving...' : 'Save and Back'}
        </Button>
      </div>
    </div>
  );
}
