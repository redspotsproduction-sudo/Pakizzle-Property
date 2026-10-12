import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Database, 
  Activity, 
  CheckSquare, 
  Trash2, 
  Edit3, 
  ChevronDown,
  Layout,
  Type,
  Hash,
  List as ListIcon,
  Calendar,
  ToggleLeft,
  Image as ImageIcon,
  MapPin,
  Tag,
  X,
  RefreshCcw,
  AlertTriangle,
  Layers,
  Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Category, CategoryField, CategoryFieldType } from '@/types';
import { categoryAdminService } from '@/services/categoryAdminService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import CustomFieldForm from '@/components/Admin/Categories/CustomFieldForm';

const FIELD_TYPE_ICONS: Record<string, any> = {
  text: Type,
  number: Hash,
  range: Layout,
  dropdown: ChevronDown,
  'multi-select': ListIcon,
  radio: CheckSquare,
  checkbox: CheckSquare,
  date: Calendar,
  toggle: ToggleLeft,
  location: MapPin,
  file: Database,
  image: ImageIcon,
  tags: Tag,
  'dependent-dropdown': ChevronDown
};

export default function CustomFieldManagement() {
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get('categoryId') || 'all';
  
  const [fields, setFields] = useState<CategoryField[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFieldIds, setSelectedFieldIds] = useState<Set<string>>(new Set());
  const [mgmtView, setMgmtView] = useState<'list' | 'editor'>('list');
  const [editingField, setEditingField] = useState<CategoryField | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [allCats, allFields] = await Promise.all([
        categoryAdminService.getAllCategories(),
        categoryAdminService.getAllFields()
      ]);
      setCategories(allCats);
      setFields(allFields);
    } catch (error) {
      toast.error('Failed to load metadata architecture');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFields = fields.filter(f => {
    const matchesCategory = selectedCategory === 'all' || (f.categoryIds && f.categoryIds.includes(selectedCategory));
    const matchesType = selectedType === 'all' || f.type === selectedType;
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          f.key.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesType && matchesSearch;
  });

  const getCategoryNames = (catIds: string[]) => {
    if (!catIds || catIds.length === 0) return 'Global/None';
    return catIds
      .map(id => categories.find(c => c.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const handleDelete = async (id: string) => {
    try {
      await categoryAdminService.deleteField(id);
      setFields(prev => prev.filter(f => f.id !== id));
      toast.success('Field deleted');
    } catch (error) {
      toast.error('Deletion failed');
    }
  };

  const handleSave = async (data: CategoryField) => {
    try {
      await categoryAdminService.saveField(data);
      setMgmtView('list');
      fetchData();
      toast.success('Field configuration saved');
    } catch (error) {
      toast.error('Save failed');
    }
  };

  if (mgmtView === 'editor' && editingField) {
    return (
      <CustomFieldForm 
        field={editingField}
        allCategories={categories}
        onSave={handleSave}
        onCancel={() => setMgmtView('list')}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header with Search and Actions - EXACT match with Approval Center layout and sizing */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <Database className="w-3.5 h-3.5 animate-pulse" />
            Verified Enterprise Metadata Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-tight">
            Custom Fields
          </h1>
          <p className="text-xs text-[#86868B] dark:text-[#86868B] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            Manage global listing parameters, specifications, validations, and dynamic vehicle entry schemas.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start md:self-end">
          <Button 
            className="apple-button-primary rounded-xl text-xs font-semibold h-10 px-5 text-white"
            onClick={() => {
              const newField: CategoryField = {
                id: `new_${Date.now()}`,
                categoryIds: selectedCategory === 'all' ? [] : [selectedCategory],
                name: '',
                key: '',
                type: 'text',
                required: false,
                searchable: true,
                filterable: true,
                status: 'active',
                order: fields.length,
                showOnCard: true,
                showOnListingPage: true,
                showInAdminTable: true,
                groupName: 'General'
              };
              setEditingField(newField);
              setMgmtView('editor');
            }}
          >
            <Plus className="w-3.5 h-3.5 mr-2" /> Create Custom Field
          </Button>
          <Button 
            variant="outline" 
            className="rounded-xl border-black/[0.08] dark:border-white/[0.08] bg-white/50 dark:bg-white/5 backdrop-blur-sm text-xs font-semibold h-10 px-4"
          >
            <Database className="w-3.5 h-3.5 mr-2 text-apple-blue" /> Bulk Import
          </Button>
        </div>
      </div>

      {/* Filters and Search - EXACT match with Seller Console/Approval Center layout */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-48">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-white/5 border-black/[0.06] dark:border-white/[0.06] font-semibold text-xs text-[#1D1D1F] dark:text-white">
                <div className="flex items-center gap-2">
                  <Filter className="w-3 h-3 text-[#86868B]" />
                  <SelectValue placeholder="All Categories" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl p-1.5 bg-white/95 dark:bg-[#1D1D1F]/95 backdrop-blur-xl border-black/[0.06] dark:border-white/[0.06]">
                <SelectItem value="all" className="rounded-lg text-xs font-medium">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id} className="rounded-lg text-xs">
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-40">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-white/5 border-black/[0.06] dark:border-white/[0.06] font-semibold text-xs text-[#1D1D1F] dark:text-white">
                <div className="flex items-center gap-2">
                  <Layout className="w-3 h-3 text-[#86868B]" />
                  <SelectValue placeholder="All Types" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl p-1.5 bg-white/95 dark:bg-[#1D1D1F]/95 backdrop-blur-xl border-black/[0.06] dark:border-white/[0.06]">
                <SelectItem value="all" className="rounded-lg text-xs font-medium">All Types</SelectItem>
                {['text', 'number', 'dropdown', 'multi-select', 'radio', 'checkbox', 'range', 'date', 'toggle', 'location', 'image', 'tags', 'dependent-dropdown'].map(type => (
                  <SelectItem key={type} value={type} className="rounded-lg text-xs capitalize">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <span className="text-[11px] text-[#86868B] font-medium bg-[#F5F5F7] dark:bg-white/5 py-1 px-3 rounded-full border border-black/[0.04] dark:border-white/[0.04]">
            Total Fields: <span className="font-bold font-mono text-[#1D1D1F] dark:text-white">{filteredFields.length}</span>
          </span>
        </div>

        <div className="relative group min-w-[200px] sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] group-focus-within:text-apple-blue transition-colors duration-300" />
          <input
            type="text"
            placeholder="Search custom fields..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F5F5F7] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 rounded-xl text-xs font-medium focus:ring-0 outline-none transition-all duration-300 shadow-inner"
          />
        </div>
      </div>

      {/* Fields Table Container - EXACT match to Approval Center's custom styles */}
      <div className="bg-white dark:bg-[var(--surface-dark)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/[0.04] dark:border-white/[0.04] bg-[#F5F5F7]/40 dark:bg-white/[0.02]">
                <th className="px-8 py-4.5 text-[10px] font-bold uppercase tracking-wider text-[#86868B]">Type & Key</th>
                <th className="px-6 py-4.5 text-[10px] font-bold uppercase tracking-wider text-[#86868B]">Display Name</th>
                <th className="px-6 py-4.5 text-[10px] font-bold uppercase tracking-wider text-[#86868B] w-1/4">Scope / Categories</th>
                <th className="px-6 py-4.5 text-[10px] font-bold uppercase tracking-wider text-[#86868B]">Attributes</th>
                <th className="px-8 py-4.5 text-[10px] font-bold uppercase tracking-wider text-[#86868B] text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04] text-xs font-medium">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`loading-row-${i}`} className="animate-pulse border-b border-black/[0.04] dark:border-white/[0.04]">
                    <td colSpan={5} className="p-6">
                      <div className="h-10 bg-[#F5F5F7] dark:bg-white/5 rounded-xl w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredFields.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-[#86868B] font-normal">
                    <div className="flex flex-col items-center gap-2">
                      <Settings2 className="w-8 h-8 opacity-45" />
                      <span>No Field Configuration Found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredFields.map((field, idx) => {
                    const Icon = FIELD_TYPE_ICONS[field.type] || Type;
                    return (
                      <motion.tr 
                        key={`custom-field-${field.id}-${idx}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.02 }}
                        className="group hover:bg-[#F5F5F7]/30 dark:hover:bg-white/[0.01] transition-colors cursor-pointer"
                        onClick={() => {
                          setEditingField(field);
                          setMgmtView('editor');
                        }}
                      >
                        <td className="px-8 py-5.5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-apple-blue/10 dark:bg-apple-blue/15 flex items-center justify-center text-apple-blue shrink-0">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-apple-blue block mb-0.5">{field.type}</span>
                              <span className="text-[11px] font-mono font-bold text-[#86868B]">{field.key}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5.5">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#1D1D1F] dark:text-white group-hover:text-apple-blue transition-colors text-sm">{field.name}</span>
                            <span className="text-[10px] text-[#86868B] mt-0.5">{field.groupName || 'General'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5.5">
                          <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                            {field.categoryIds?.length ? (
                              field.categoryIds.slice(0, 3).map(cid => (
                                <span key={`field-cat-${field.id}-${cid}`} className="px-2 py-0.5 rounded border border-black/[0.04] dark:border-white/[0.04] bg-[#F5F5F7] dark:bg-white/5 text-[9px] font-bold text-[#86868B] h-5 flex items-center">
                                  {categories.find(c => c.id === cid)?.name || 'Unknown'}
                                </span>
                              ))
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-apple-blue/10 text-apple-blue text-[9px] font-bold uppercase tracking-wider">Global</span>
                            )}
                            {field.categoryIds && field.categoryIds.length > 3 && (
                              <span className="text-[9px] font-bold text-[#86868B] self-center">+{field.categoryIds.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5.5">
                          <div className="flex items-center gap-3">
                            <div className={cn("flex flex-col items-center gap-1", field.required ? "text-apple-red" : "text-apple-text-muted opacity-40")}>
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span className="text-[8px] font-bold uppercase tracking-tighter">Req</span>
                            </div>
                            <div className={cn("flex flex-col items-center gap-1", field.filterable ? "text-apple-blue" : "text-apple-text-muted opacity-40")}>
                              <Filter className="w-3.5 h-3.5" />
                              <span className="text-[8px] font-bold uppercase tracking-tighter">Filt</span>
                            </div>
                            <div className={cn("flex flex-col items-center gap-1", field.searchable ? "text-apple-green" : "text-apple-text-muted opacity-40")}>
                              <Search className="w-3.5 h-3.5" />
                              <span className="text-[8px] font-bold uppercase tracking-tighter">Srch</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="w-8.5 h-8.5 rounded-lg hover:bg-apple-blue/10 hover:text-apple-blue transition-all text-[#86868B]"
                              onClick={() => {
                                setEditingField(field);
                                setMgmtView('editor');
                              }}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="w-8.5 h-8.5 rounded-lg hover:bg-apple-red/10 hover:text-apple-red transition-all text-[#86868B]"
                              onClick={() => handleDelete(field.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
