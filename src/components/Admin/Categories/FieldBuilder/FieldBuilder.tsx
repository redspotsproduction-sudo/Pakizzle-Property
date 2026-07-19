import React, { useState } from 'react';
import { 
  Plus, 
  GripVertical, 
  X, 
  Settings2, 
  Eye, 
  Copy, 
  Trash2, 
  Type, 
  Hash, 
  ChevronDown, 
  Layout, 
  CheckSquare, 
  ListOrdered, 
  ToggleLeft,
  Calendar,
  Image as ImageIcon,
  MapPin,
  Tag,
  Link
} from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { CategoryField, CategoryFieldType } from '@/types';
import { cn } from '@/lib/utils';

interface FieldBuilderProps {
  categoryId: string;
  fields: CategoryField[];
  onChange: (fields: CategoryField[]) => void;
}

const FIELD_TYPES: { type: CategoryFieldType; label: string; icon: any; description: string }[] = [
  { type: 'text', label: 'Plain Text', icon: Type, description: 'Basic text input for names, titles, etc.' },
  { type: 'number', label: 'Numeric', icon: Hash, description: 'Numbers only, with unit support (PKR, CC).' },
  { type: 'dropdown', label: 'Dropdown', icon: ChevronDown, description: 'Single selection from a list of options.' },
  { type: 'multi-select', label: 'Multi-select', icon: ListOrdered, description: 'Multiple selection from a list.' },
  { type: 'radio', label: 'Radio Button', icon: CheckSquare, description: 'Exclusive choice between options.' },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, description: 'Boolean option or multiple choice.' },
  { type: 'range', label: 'Range', icon: Layout, description: 'Min/Max number range selector.' },
  { type: 'date', label: 'Date Picker', icon: Calendar, description: 'Specific date or year selection.' },
  { type: 'toggle', label: 'Toggle Switch', icon: ToggleLeft, description: 'Simple yes/no or on/off switch.' },
  { type: 'location', label: 'Location', icon: MapPin, description: 'City or region selection.' },
  { type: 'image', label: 'Image Upload', icon: ImageIcon, description: 'Single or multiple image upload.' },
  { type: 'tags', label: 'Tags Input', icon: Tag, description: 'Comma separated keyword tags.' },
  { type: 'dependent-dropdown', label: 'Dependent Select', icon: Link, description: 'Options change based on another field.' },
];

export default function FieldBuilder({ categoryId, fields, onChange }: FieldBuilderProps) {
  const [isAddingField, setIsAddingField] = useState(false);
  const [selectedField, setSelectedField] = useState<CategoryField | null>(null);

  const addField = (type: CategoryFieldType) => {
    const newField: CategoryField = {
      id: `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      categoryIds: [categoryId],
      name: `New ${type} field`,
      key: `field_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      required: false,
      searchable: true,
      filterable: true,
      showOnCard: false,
      showOnListingPage: true,
      showInAdminTable: true,
      order: fields.length,
      groupName: 'General Information',
      status: 'active'
    };
    onChange([...fields, newField]);
    setIsAddingField(false);
  };

  const removeField = (id: string) => {
    onChange(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<CategoryField>) => {
    onChange(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-xl font-black tracking-tight tracking-tight">Custom Attributes Builder</h3>
          <p className="text-xs text-apple-text-muted font-medium">Define the data architecture for this category with surgical precision.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddingField} onOpenChange={setIsAddingField}>
            <DialogTrigger className={cn(
              "rounded-xl apple-button-primary h-10 px-6 gap-2 font-bold shadow-lg shadow-apple-blue/10 flex items-center justify-center transition-all hover:opacity-90 active:scale-95 text-sm"
            )}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Dimension</span>
              <span className="sm:hidden">Add</span>
            </DialogTrigger>
            <DialogContent className="w-[96%] sm:w-[94%] md:max-w-[700px] h-[85vh] p-0 rounded-[24px] border-apple-border/10 bg-white dark:bg-black overflow-hidden shadow-3xl flex flex-col">
               <header className="shrink-0 p-6 md:p-8 lg:p-10 border-b border-apple-border/10 bg-white/80 dark:bg-black/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-10">
                  <div>
                    <DialogTitle className="text-xl md:text-3xl font-black tracking-tight text-apple-text leading-none">Select Attribute Primitive</DialogTitle>
                    <p className="text-[10px] text-apple-text-muted mt-2 uppercase tracking-[0.3em] font-black opacity-60">Standard Library of Blocks</p>
                  </div>
                  <button onClick={() => setIsAddingField(false)} className="w-8 h-8 rounded-full bg-apple-gray dark:bg-white/10 flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </button>
               </header>
               <ScrollArea className="flex-1 min-h-0">
                  <div className="p-6 md:p-10">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {FIELD_TYPES.map((ft) => (
                         <button
                           key={ft.type}
                           onClick={() => addField(ft.type)}
                           className="flex flex-col items-start p-6 rounded-[2rem] border border-apple-border/50 bg-white dark:bg-white/5 hover:border-apple-blue hover:bg-apple-blue/5 transition-all group text-left shadow-sm active:scale-[0.98]"
                         >
                            <div className="w-12 h-12 rounded-2xl bg-apple-gray dark:bg-white/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-apple-blue/10 transition-all">
                               <ft.icon className="w-6 h-6 text-apple-blue" />
                            </div>
                            <div className="font-bold text-sm tracking-tight mb-1.5">{ft.label}</div>
                            <div className="text-[10px] text-apple-text-muted font-bold leading-relaxed uppercase tracking-wider opacity-60">{ft.description}</div>
                         </button>
                       ))}
                     </div>
                  </div>
               </ScrollArea>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="rounded-xl h-10 px-6 gap-2 font-bold bg-white dark:bg-white/5 shadow-sm border-apple-border/50">
            <Eye className="w-4 h-4" />
            Preview Form
          </Button>
        </div>
      </div>

      <div className="bg-apple-gray/20 dark:bg-white/5 rounded-[32px] p-2 border border-apple-border/50 min-h-[400px]">
        {fields.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 py-24">
             <div className="w-20 h-20 rounded-full border-2 border-dashed border-apple-border/50 flex items-center justify-center mb-6 opacity-40">
                <Layout className="w-10 h-10 text-apple-text-muted" />
             </div>
             <h4 className="text-lg font-black tracking-tighter text-apple-text-muted">No Dimensionality Defined</h4>
             <p className="text-sm text-apple-text-muted max-w-xs mt-2 font-medium">Start by adding custom fields to build a unique experience for this category.</p>
             <Button 
               variant="ghost" 
               className="mt-6 rounded-full font-bold text-apple-blue hover:bg-apple-blue/5"
               onClick={() => setIsAddingField(true)}
             >
               Initialize Attributes
             </Button>
          </div>
        ) : (
          <Reorder.Group axis="y" values={fields} onReorder={onChange} className="space-y-2">
            {fields.map((field) => (
              <Reorder.Item 
                key={field.id} 
                value={field}
                className={cn(
                  "p-4 rounded-[2rem] bg-white dark:bg-[#1D1D1F] border border-apple-border/50 shadow-sm flex items-center gap-4 group hover:border-apple-blue/50 transition-all cursor-default",
                  selectedField?.id === field.id && "border-apple-blue shadow-lg shadow-apple-blue/10"
                )}
              >
                <div className="cursor-grab active:cursor-grabbing p-1">
                  <GripVertical className="w-5 h-5 text-apple-text-muted opacity-40 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className={cn(
                   "w-12 h-12 rounded-2xl bg-apple-gray dark:bg-white/5 flex items-center justify-center shrink-0",
                   selectedField?.id === field.id ? "bg-apple-blue/10 text-apple-blue" : "text-apple-text-muted"
                )}>
                   {(() => {
                      const ft = FIELD_TYPES.find(t => t.type === field.type);
                      const Icon = ft ? ft.icon : Type;
                      return <Icon className="w-6 h-6" />;
                   })()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm tracking-tight truncate">{field.name}</span>
                    {field.required && <Badge className="bg-apple-red/10 text-apple-red border-none text-[8px] font-black uppercase px-1.5 h-4">Required</Badge>}
                    {field.filterable && <Badge className="bg-apple-blue/10 text-apple-blue border-none text-[8px] font-black uppercase px-1.5 h-4">Filterable</Badge>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted opacity-60">KEY: {field.key}</div>
                    <div className="w-1 h-1 rounded-full bg-apple-border" />
                    <div className="text-[10px] font-bold text-apple-text-muted">{field.groupName}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full text-apple-text-muted hover:bg-apple-gray dark:hover:bg-white/10"
                    onClick={() => setSelectedField(field)}
                  >
                    <Settings2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full text-apple-text-muted hover:bg-apple-gray dark:hover:bg-white/10"
                    onClick={() => removeField(field.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>

      <Dialog open={!!selectedField} onOpenChange={(open) => !open && setSelectedField(null)}>
        <DialogContent className="w-[96%] md:w-[94%] lg:max-w-[1000px] h-[92vh] md:h-[85vh] p-0 rounded-[24px] overflow-hidden border-apple-border/10 bg-white dark:bg-black shadow-2xl flex flex-col">
            {selectedField && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Internal Header */}
                <header className="shrink-0 h-20 md:h-24 px-6 md:px-10 border-b border-apple-border/5 bg-white/80 dark:bg-black/80 backdrop-blur-3xl flex items-center justify-between z-20 sticky top-0">
                  <div>
                    <h3 className="text-xl md:text-2xl font-black tracking-tight text-apple-text">Node Configuration</h3>
                    <div className="hidden sm:block text-[10px] font-black text-apple-text-muted uppercase tracking-[0.2em] mt-1 opacity-50">SHARD: {selectedField.id}</div>
                  </div>
                  <button onClick={() => setSelectedField(null)} className="w-10 h-10 rounded-full bg-apple-gray dark:bg-white/10 flex items-center justify-center">
                    <X className="w-5 h-5 text-apple-text-muted" />
                  </button>
                </header>

                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                   {/* Visual Context Sidebar */}
                   <aside className="hidden lg:flex w-[300px] border-r border-apple-border/10 flex flex-col bg-apple-gray/40 dark:bg-black/20 shrink-0 overflow-hidden">
                      <ScrollArea className="flex-1">
                        <div className="p-8 space-y-10">
                           <div className="flex flex-col items-center text-center space-y-4">
                              <div className="w-24 h-24 rounded-[32px] bg-white dark:bg-white/5 border border-apple-border/50 shadow-2xl flex items-center justify-center text-apple-blue group hover:rotate-6 transition-transform duration-500">
                                 {(() => {
                                    const ft = FIELD_TYPES.find(t => t.type === selectedField.type);
                                    const Icon = ft ? ft.icon : Type;
                                    return <Icon className="w-12 h-12" />;
                                 })()}
                              </div>
                              <div>
                                 <h3 className="text-xl font-black tracking-tight text-apple-text">{selectedField.name || 'Untitled Node'}</h3>
                                 <div className="text-[10px] font-black text-apple-text-muted uppercase tracking-[0.2em] mt-2 opacity-60">Type: {selectedField.type}</div>
                              </div>
                           </div>

                         <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-apple-text-muted px-1">Logic Circuits</h4>
                            <div className="grid grid-cols-1 gap-3">
                               {[
                                  { label: 'Mandatory', key: 'required', color: 'text-apple-red' },
                                  { label: 'Searchable', key: 'searchable', color: 'text-apple-blue' },
                                  { label: 'Filterable', key: 'filterable', color: 'text-apple-green' },
                                  { label: 'Preview', key: 'showOnCard', color: 'text-apple-orange' },
                               ].map((opt) => (
                                  <button 
                                    key={opt.key}
                                    onClick={() => updateField(selectedField.id, { [opt.key]: !(selectedField as any)[opt.key] })}
                                    className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-apple-border/5 flex items-center justify-between group hover:scale-[1.02] transition-all shadow-sm"
                                  >
                                     <span className="text-[11px] font-bold text-apple-text-muted uppercase tracking-wider">{opt.label}</span>
                                     <div className={cn(
                                        "w-10 h-5 rounded-full relative p-0.5 transition-all",
                                        (selectedField as any)[opt.key] ? "bg-apple-blue" : "bg-apple-border"
                                     )}>
                                        <div className={cn(
                                           "w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300",
                                           (selectedField as any)[opt.key] ? "translate-x-5" : "translate-x-0"
                                        )} />
                                     </div>
                                  </button>
                               ))}
                            </div>
                         </div>

                         <div className="p-6 rounded-[28px] bg-apple-blue/5 border border-apple-blue/10 space-y-3">
                            <div className="text-[9px] font-black text-apple-blue uppercase tracking-widest mb-1 shadow-sm flex items-center gap-2">
                               <Settings2 className="w-3.5 h-3.5" /> Registry Meta
                            </div>
                            <div className="text-[10px] font-bold text-apple-text-muted leading-relaxed opacity-60">
                               Blueprint ID: {selectedField.id.slice(0, 16)}...<br/>
                               Architectural Key: {selectedField.key}
                            </div>
                         </div>
                      </div>
                    </ScrollArea>
                 </aside>

                 {/* Main Configuration Workspace */}
                 <div className="flex-1 flex flex-col min-w-0 bg-transparent h-full relative overflow-hidden">
                    <ScrollArea className="flex-1 min-h-0">
                      <div className="p-8 lg:p-12 max-w-[1200px] mx-auto w-full space-y-16 pb-24">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="md:col-span-2 space-y-6 bg-apple-gray/10 dark:bg-white/[0.02] p-8 rounded-[32px] border border-apple-border/5">
                               <Tabs defaultValue="en" className="w-full">
                                  <div className="flex items-center justify-between mb-4">
                                     <label className="text-[10px] font-black uppercase tracking-[0.3em] text-apple-text-muted ml-1 opacity-60">Field Identity (Multilingual)</label>
                                     <TabsList className="bg-apple-gray dark:bg-white/5 rounded-xl h-10 p-1">
                                        <TabsTrigger value="en" className="px-4 rounded-lg text-[9px] font-black uppercase tracking-widest h-8 data-[state=active]:bg-white dark:data-[state=active]:bg-apple-blue shadow-sm">English</TabsTrigger>
                                        <TabsTrigger value="ar" className="px-4 rounded-lg text-[9px] font-black uppercase tracking-widest h-8 data-[state=active]:bg-white dark:data-[state=active]:bg-apple-blue shadow-sm">Arabic</TabsTrigger>
                                        <TabsTrigger value="ur" className="px-4 rounded-lg text-[9px] font-black uppercase tracking-widest h-8 data-[state=active]:bg-white dark:data-[state=active]:bg-apple-blue shadow-sm">Urdu</TabsTrigger>
                                        <TabsTrigger value="fr" className="px-4 rounded-lg text-[9px] font-black uppercase tracking-widest h-8 data-[state=active]:bg-white dark:data-[state=active]:bg-apple-blue shadow-sm">French</TabsTrigger>
                                     </TabsList>
                                  </div>

                                  <TabsContent value="en" className="mt-0">
                                     <Input 
                                       className="h-16 rounded-2xl border-apple-border/50 bg-white dark:bg-white/5 font-black text-2xl tracking-tighter px-6" 
                                       value={selectedField.nameTranslations?.en || selectedField.name}
                                       onChange={(e) => updateField(selectedField.id, { 
                                         name: e.target.value,
                                         nameTranslations: { ...(selectedField.nameTranslations || {}), en: e.target.value } 
                                       })}
                                       placeholder="e.g. Engine Displacement"
                                     />
                                  </TabsContent>
                                  <TabsContent value="ar" className="mt-0">
                                     <Input 
                                       dir="rtl"
                                       className="h-16 rounded-2xl border-apple-border/50 bg-white dark:bg-white/5 font-bold text-2xl px-6" 
                                       value={selectedField.nameTranslations?.ar || ''}
                                       onChange={(e) => updateField(selectedField.id, { 
                                         nameTranslations: { ...(selectedField.nameTranslations || {}), ar: e.target.value } 
                                       })}
                                       placeholder="إزاحة المحرك"
                                     />
                                  </TabsContent>
                                  <TabsContent value="ur" className="mt-0">
                                     <Input 
                                       dir="rtl"
                                       className="h-16 rounded-2xl border-apple-border/50 bg-white dark:bg-white/5 font-bold text-2xl px-6" 
                                       value={selectedField.nameTranslations?.ur || ''}
                                       onChange={(e) => updateField(selectedField.id, { 
                                         nameTranslations: { ...(selectedField.nameTranslations || {}), ur: e.target.value } 
                                       })}
                                       placeholder="انجن کی گنجائش"
                                     />
                                  </TabsContent>
                                  <TabsContent value="fr" className="mt-0">
                                     <Input 
                                       className="h-16 rounded-2xl border-apple-border/50 bg-white dark:bg-white/5 font-bold text-2xl px-6" 
                                       value={selectedField.nameTranslations?.fr || ''}
                                       onChange={(e) => updateField(selectedField.id, { 
                                         nameTranslations: { ...(selectedField.nameTranslations || {}), fr: e.target.value } 
                                       })}
                                       placeholder="Cylindrée du moteur"
                                     />
                                  </TabsContent>
                               </Tabs>
                            </div>
                            <div className="space-y-4">
                               <label className="text-[10px] font-black uppercase tracking-[0.3em] text-apple-text-muted ml-1 opacity-60">Architectural Reference Key</label>
                               <Input 
                                 className="h-14 rounded-2xl border-apple-border/50 bg-apple-gray/20 dark:bg-white/5 font-mono text-xs uppercase tracking-[0.2em] disabled:opacity-40" 
                                 value={selectedField.key}
                                 readOnly
                               />
                            </div>
                            
                            <div className="space-y-4">
                               <label className="text-[10px] font-black uppercase tracking-[0.3em] text-apple-text-muted ml-1 opacity-60">Logical Sub-System (Group)</label>
                               <Select 
                                  value={selectedField.groupName}
                                  onValueChange={(val) => updateField(selectedField.id, { groupName: val })}
                               >
                                  <SelectTrigger className="h-14 rounded-2xl border-apple-border/50 bg-apple-gray/20 dark:bg-white/5 font-bold text-sm">
                                     <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-3xl border-apple-border/50 backdrop-blur-3xl p-2 bg-white/95 dark:bg-[#1D1D1F]/95">
                                     {['Basic Info', 'Engine & Tech', 'Ownership', 'Physical Exterior', 'Internal Assets', 'Security Features'].map(group => (
                                        <SelectItem key={group} value={group} className="rounded-xl font-bold text-xs py-3">{group}</SelectItem>
                                     ))}
                                  </SelectContent>
                               </Select>
                            </div>

                            <div className="space-y-4">
                               <label className="text-[10px] font-black uppercase tracking-[0.3em] text-apple-text-muted ml-1 opacity-60">Measurement Primitive (Unit)</label>
                               <Input 
                                 className="h-14 rounded-2xl border-apple-border/50 bg-apple-gray/20 dark:bg-white/5 font-bold" 
                                 placeholder="e.g. KM, CC, HP"
                                 value={selectedField.unit || ''}
                                 onChange={(e) => updateField(selectedField.id, { unit: e.target.value })}
                               />
                            </div>
                         </div>

                         {/* Options Builder for Selectable Types */}
                         {(['dropdown', 'multi-select', 'radio', 'checkbox', 'dependent-dropdown'] as CategoryFieldType[]).includes(selectedField.type) && (
                            <div className="space-y-6 pt-10 border-t border-apple-border/10">
                               <div className="flex items-center justify-between">
                                  <div className="space-y-0.5">
                                     <h4 className="text-xl font-black tracking-tighter uppercase">Interactive Logic Primitives</h4>
                                     <p className="text-[10px] font-black text-apple-text-muted uppercase tracking-widest">Protocol Values & Display Overrides</p>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    className="rounded-xl h-10 px-5 gap-2 font-bold text-[10px] uppercase tracking-widest border-apple-border shadow-sm active:scale-95 transition-all"
                                    onClick={() => {
                                      const newOptions = [...(selectedField.options || []), { label: 'New Option', value: 'new_option' }];
                                      updateField(selectedField.id, { options: newOptions });
                                    }}
                                  >
                                    <Plus className="w-3 h-3" />
                                    Append Value
                                  </Button>
                               </div>
                               
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <AnimatePresence mode="popLayout">
                                     {(selectedField.options || []).map((opt, idx) => (
                                       <motion.div 
                                         layout
                                         initial={{ opacity: 0, scale: 0.95 }}
                                         animate={{ opacity: 1, scale: 1 }}
                                         exit={{ opacity: 0, scale: 0.95 }}
                                         key={`${selectedField.id}-opt-${idx}`}
                                         className="flex items-center gap-3 p-4 rounded-3xl bg-apple-gray/30 dark:bg-white/5 border border-apple-border/5 shadow-inner group"
                                       >
                                          <div className="flex-1 grid grid-cols-2 gap-2">
                                             <div className="space-y-1">
                                                <span className="text-[8px] font-black uppercase tracking-widest opacity-40 ml-1">Label</span>
                                                <Input 
                                                  placeholder="Label" 
                                                  className="h-10 rounded-xl border-none bg-white dark:bg-white/10 text-[11px] font-bold shadow-sm" 
                                                  value={opt.label}
                                                  onChange={(e) => {
                                                    const newOpts = [...(selectedField.options || [])];
                                                    newOpts[idx] = { ...newOpts[idx], label: e.target.value };
                                                    updateField(selectedField.id, { options: newOpts });
                                                  }}
                                                />
                                             </div>
                                             <div className="space-y-1">
                                                <span className="text-[8px] font-black uppercase tracking-widest opacity-40 ml-1">System Value</span>
                                                <Input 
                                                  placeholder="Value" 
                                                  className="h-10 rounded-xl border-none bg-white dark:bg-white/10 text-[10px] font-mono uppercase tracking-widest shadow-sm" 
                                                  value={opt.value}
                                                  onChange={(e) => {
                                                    const newOpts = [...(selectedField.options || [])];
                                                    newOpts[idx] = { ...newOpts[idx], value: e.target.value.toLowerCase().replace(/\s+/g, '_') };
                                                    updateField(selectedField.id, { options: newOpts });
                                                  }}
                                                />
                                             </div>
                                          </div>
                                          <button 
                                            className="w-10 h-10 mt-5 rounded-2xl flex items-center justify-center text-apple-red opacity-0 group-hover:opacity-60 hover:opacity-100 hover:bg-apple-red/10 transition-all active:scale-90"
                                            onClick={() => {
                                              const newOpts = (selectedField.options || []).filter((_, i) => i !== idx);
                                              updateField(selectedField.id, { options: newOpts });
                                            }}
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                       </motion.div>
                                     ))}
                                  </AnimatePresence>
                               </div>
                            </div>
                         )}

                         <div className="space-y-6 pt-10 border-t border-apple-border/10">
                            <div className="space-y-0.5">
                               <h4 className="text-xl font-black tracking-tighter uppercase">Conditional Circuitry</h4>
                               <p className="text-[10px] font-black text-apple-text-muted uppercase tracking-widest">Logic Flow & Dynamic Payload Visibility</p>
                            </div>
                            <div className="p-8 rounded-[2.5rem] bg-apple-blue/5 border border-apple-blue/10 space-y-6 shadow-sm overflow-hidden relative">
                               <div className="flex flex-col md:flex-row items-center gap-4 text-xs font-black uppercase tracking-widest text-apple-text relative z-10">
                                  <Badge className="bg-apple-blue text-white rounded-lg px-2.5 h-7 flex items-center justify-center shadow-lg shadow-apple-blue/20">IF</Badge>
                                  <Select 
                                    value={selectedField.conditionalLogic?.dependantOnFieldId || 'none'}
                                    onValueChange={(val) => updateField(selectedField.id, { 
                                      conditionalLogic: val === 'none' ? undefined : { dependantOnFieldId: val, showIfValue: '' } 
                                    })}
                                  >
                                     <SelectTrigger className="w-full md:w-64 h-12 border-apple-blue/20 bg-white dark:bg-white/10 rounded-[14px] font-bold shadow-sm">
                                        <SelectValue placeholder="Target Node (Field)" />
                                     </SelectTrigger>
                                     <SelectContent className="rounded-xl p-1 border-apple-blue/10 shadow-3xl bg-white dark:bg-[#1D1D1F]">
                                        <SelectItem value="none" className="rounded-lg">None (Always Static)</SelectItem>
                                        {fields.filter(f => f.id !== selectedField.id).map(f => (
                                          <SelectItem key={f.id} value={f.id} className="rounded-lg">{f.name}</SelectItem>
                                        ))}
                                     </SelectContent>
                                  </Select>
                                  <span className="opacity-40">EQUALS</span>
                                  <Input 
                                    placeholder="Value Trigger" 
                                    className="w-full md:w-48 h-12 border-apple-blue/20 bg-white dark:bg-white/10 rounded-[14px] font-bold shadow-sm" 
                                    value={selectedField.conditionalLogic?.showIfValue || ''}
                                    onChange={(e) => updateField(selectedField.id, {
                                      conditionalLogic: { ...selectedField.conditionalLogic!, showIfValue: e.target.value }
                                    })}
                                    disabled={!selectedField.conditionalLogic}
                                  />
                                  <Badge className="bg-apple-blue text-white rounded-lg px-2.5 h-7 flex items-center justify-center shadow-lg shadow-apple-blue/20">THEN UNLOCK NODE</Badge>
                               </div>
                            </div>
                         </div>
                      </div>
                    </ScrollArea>
                 </div> {/* End of main (310) */}
              </div> {/* End of body area (248) */}

              {/* Action Footer */}
              <footer className="shrink-0 h-20 md:h-24 px-6 md:px-10 border-t border-apple-border/5 bg-white/80 dark:bg-black/80 backdrop-blur-3xl z-20 sticky bottom-0 flex items-center justify-end">
                 <Button 
                   className="h-12 px-10 rounded-2xl font-black text-xs uppercase tracking-[0.2em] bg-apple-blue text-white shadow-xl shadow-apple-blue/20 hover:brightness-110 active:scale-95 transition-all"
                   onClick={() => setSelectedField(null)}
                 >
                   Commit Changes
                 </Button>
              </footer>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
