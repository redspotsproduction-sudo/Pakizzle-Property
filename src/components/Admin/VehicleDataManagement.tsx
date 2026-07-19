import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Database,
  Trash2,
  ChevronRight,
  MoreVertical,
  Activity,
  ArrowLeft,
  X,
  PlusCircle,
  AlertCircle,
  Filter,
  CheckCircle2,
  Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { CarMake, CarModel, CarVariant } from '@/types';
import { vehicleAdminService } from '@/services/vehicleAdminService';
import { toast } from 'sonner';

type ViewMode = 'makes' | 'models' | 'variants';

export default function VehicleDataManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>('makes');
  const [makes, setMakes] = useState<CarMake[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [variants, setVariants] = useState<CarVariant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedMake, setSelectedMake] = useState<CarMake | null>(null);
  const [selectedModel, setSelectedModel] = useState<CarModel | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [viewMode, selectedMake, selectedModel]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (viewMode === 'makes') {
        const data = await vehicleAdminService.getMakes();
        setMakes(data);
      } else if (viewMode === 'models') {
        const data = await vehicleAdminService.getModels(selectedMake?.id);
        setModels(data);
      } else {
        const data = await vehicleAdminService.getVariants(selectedModel?.id);
        setVariants(data);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('Are you sure? This action is permanent.')) return;
    try {
      if (viewMode === 'makes') await vehicleAdminService.deleteMake(id);
      else if (viewMode === 'models') await vehicleAdminService.deleteModel(id);
      else await vehicleAdminService.deleteVariant(id);
      
      toast.success('Deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = Object.fromEntries(formData.entries());
    
    try {
      if (viewMode === 'makes') {
        if (editItem) await vehicleAdminService.updateMake(editItem.id, data);
        else await vehicleAdminService.createMake(data);
      } else if (viewMode === 'models') {
        data.makeId = selectedMake?.id;
        if (editItem) await vehicleAdminService.updateModel(editItem.id, data);
        else await vehicleAdminService.createModel(data);
      } else {
        data.modelId = selectedModel?.id;
        if (editItem) await vehicleAdminService.updateVariant(editItem.id, data);
        else await vehicleAdminService.createVariant(data);
      }
      
      toast.success('Saved successfully');
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Save failed');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header with Search and Actions - EXACT match with Approval Center layout and sizing */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <Database className="w-3.5 h-3.5 animate-pulse" />
            Verified Specifications Engine
          </div>
          <div className="flex items-center gap-2">
            {viewMode !== 'makes' && (
              <button 
                onClick={() => setViewMode(viewMode === 'variants' ? 'models' : 'makes')}
                className="p-1.5 bg-[#F5F5F7] hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-full transition-colors text-apple-blue"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-tight capitalize">
              {viewMode} Registry
            </h1>
          </div>
          <p className="text-xs text-[#86868B] dark:text-[#86868B] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            {selectedMake && `Make: ${selectedMake.name}`}
            {selectedModel && ` > Model: ${selectedModel.name}`}
            {!selectedMake && "Manage global car makes, models, variants and technical parameters."}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start md:self-end">
          <Button 
            className="apple-button-primary rounded-xl text-xs font-semibold h-10 px-5 text-white"
            onClick={() => {
              setEditItem(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-3.5 h-3.5 mr-2" /> Add {viewMode.slice(0, -1)}
          </Button>
          <Button 
            variant="outline" 
            className="rounded-xl border-black/[0.08] dark:border-white/[0.08] bg-white/50 dark:bg-white/5 backdrop-blur-sm text-xs font-semibold h-10 px-4"
          >
            <Database className="w-3.5 h-3.5 mr-2 text-apple-blue" /> Sync Database
          </Button>
        </div>
      </div>

      {/* Tabs Row and Search Block - EXACT match with Seller Console/Approval Center layout */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0" style={{ WebkitOverflowScrolling: 'touch' }}>
          {(['makes', 'models', 'variants'] as ViewMode[]).map((m) => {
            const count = m === 'makes' ? makes.length : m === 'models' ? models.length : variants.length;
            const isActive = viewMode === m;
            return (
              <button
                key={m}
                onClick={() => {
                  setViewMode(m);
                  if (m === 'makes') { setSelectedMake(null); setSelectedModel(null); }
                  if (m === 'models') setSelectedModel(null);
                }}
                disabled={(m === 'models' && !selectedMake) || (m === 'variants' && !selectedModel)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border capitalize",
                  isActive
                    ? "bg-apple-blue text-white border-apple-blue shadow-sm"
                    : "bg-white dark:bg-[#161617] border-black/[0.04] dark:border-white/[0.04] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white disabled:opacity-35"
                )}
              >
                {m} <span className={cn("ml-1 py-0.5 px-1.5 rounded-full text-[9px] font-bold font-mono", isActive ? "bg-white/25 text-white" : "bg-[#F5F5F7] dark:bg-white/5 text-[#86868B]")}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="relative group min-w-[200px] sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] group-focus-within:text-apple-blue transition-colors duration-300" />
          <input
            type="text"
            placeholder={`Search ${viewMode}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F5F5F7] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 rounded-xl text-xs font-medium focus:ring-0 outline-none transition-all duration-300 shadow-inner"
          />
        </div>
      </div>

      {/* Content Area - Rounded, custom layout, exact match to Approval Center's custom styles */}
      <div className="bg-white dark:bg-[#161617] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/[0.04] dark:border-white/[0.04] bg-[#F5F5F7]/40 dark:bg-white/[0.02]">
                <th className="px-8 py-4.5 text-[10px] font-bold uppercase tracking-wider text-[#86868B]">Name & Slug</th>
                <th className="px-6 py-4.5 text-[10px] font-bold uppercase tracking-wider text-[#86868B]">Audit Status</th>
                {viewMode === 'variants' && <th className="px-6 py-4.5 text-[10px] font-bold uppercase tracking-wider text-[#86868B]">Transmission / Fuel</th>}
                <th className="px-8 py-4.5 text-[10px] font-bold uppercase tracking-wider text-[#86868B] text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04] text-xs font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={viewMode === 'variants' ? 4 : 3} className="px-8 py-16 text-center font-semibold text-[#86868B]">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-apple-blue border-t-transparent rounded-full animate-spin" />
                      Loading specification engine logs...
                    </div>
                  </td>
                </tr>
              ) : (
                (() => {
                  const list = (viewMode === 'makes' ? makes : viewMode === 'models' ? models : variants)
                    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

                  if (list.length === 0) {
                    return (
                      <tr>
                        <td colSpan={viewMode === 'variants' ? 4 : 3} className="px-8 py-16 text-center text-[#86868B] font-normal">
                          No matching records found in this category database.
                        </td>
                      </tr>
                    );
                  }

                  return list.map((item) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group hover:bg-[#F5F5F7]/30 dark:hover:bg-white/[0.01] transition-colors cursor-pointer"
                      onClick={() => {
                        if (viewMode === 'makes') {
                          setSelectedMake(item as CarMake);
                          setViewMode('models');
                        } else if (viewMode === 'models') {
                          setSelectedModel(item as CarModel);
                          setViewMode('variants');
                        }
                      }}
                    >
                      <td className="px-8 py-5.5">
                        <div className="flex items-center gap-4">
                          {viewMode === 'makes' && (item as CarMake).logoUrl ? (
                            <img src={(item as CarMake).logoUrl} className="w-10 h-10 object-contain rounded-xl bg-[#F5F5F7] dark:bg-white/5 border border-black/5 p-1" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-apple-blue/5 dark:bg-apple-blue/10 flex items-center justify-center text-apple-blue">
                              <Database className="w-5 h-5 text-apple-blue" />
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-[#1D1D1F] dark:text-white block">{item.name}</span>
                            <span className="text-[10px] text-[#86868B] font-mono tracking-wider uppercase mt-0.5 block">{item.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5.5">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                          item.isActive 
                            ? "bg-apple-green/15 text-apple-green border-apple-green/20" 
                            : "bg-apple-red/15 text-apple-red border-apple-red/20"
                        )}>
                          {item.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      {viewMode === 'variants' && (
                        <td className="px-6 py-5.5">
                          <div className="flex gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-[#F5F5F7] dark:bg-white/5 border border-black/[0.02] text-[9px] font-bold uppercase tracking-wide text-[#86868B]">
                              {(item as CarVariant).transmission}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[#F5F5F7] dark:bg-white/5 border border-black/[0.02] text-[9px] font-bold uppercase tracking-wide text-[#86868B]">
                              {(item as CarVariant).fuelType}
                            </span>
                          </div>
                        </td>
                      )}
                      <td className="px-8 py-5.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-8.5 h-8.5 rounded-lg hover:bg-apple-blue/10 hover:text-apple-blue transition-all text-[#86868B]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditItem(item);
                              setIsModalOpen(true);
                            }}
                          >
                            <Settings2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-8.5 h-8.5 rounded-lg hover:bg-apple-red/10 hover:text-apple-red transition-all text-[#86868B]"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <ChevronRight className="w-4 h-4 text-[#86868B] group-hover:translate-x-1 transition-transform ml-1" />
                        </div>
                      </td>
                    </motion.tr>
                  ));
                })()
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md rounded-[32px] border-apple-border/10 overflow-hidden p-0">
          <form onSubmit={handleSave} className="flex flex-col">
            <div className="p-8 space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
                  {editItem ? 'Edit' : 'Add'} {viewMode.slice(0, -1)}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">Name</label>
                  <Input name="name" defaultValue={editItem?.name} required className="apple-input" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">Slug</label>
                  <Input name="slug" defaultValue={editItem?.slug} required className="apple-input" />
                </div>
                
                {viewMode === 'makes' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">Logo URL</label>
                    <Input name="logoUrl" defaultValue={editItem?.logo_url} className="apple-input" />
                  </div>
                )}
                
                {viewMode === 'variants' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">Fuel</label>
                      <select name="fuelType" defaultValue={editItem?.fuel_type} className="apple-input w-full">
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="electric">Electric</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">Transmission</label>
                      <select name="transmission" defaultValue={editItem?.transmission} className="apple-input w-full">
                        <option value="automatic">Automatic</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-4 bg-apple-gray dark:bg-white/5 rounded-2xl">
                  <input 
                    type="checkbox" 
                    name="isActive" 
                    defaultChecked={editItem?.is_active ?? true}
                    id="is_active"
                    className="w-5 h-5 rounded-lg accent-apple-blue"
                  />
                  <label htmlFor="is_active" className="text-xs font-bold text-apple-text">Visible to Public</label>
                </div>
              </div>
            </div>

            <div className="p-6 bg-apple-gray dark:bg-white/5 flex gap-3 justify-end border-t border-apple-border">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="font-bold">Cancel</Button>
              <Button type="submit" className="apple-button-primary px-8">Save Master Data</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
