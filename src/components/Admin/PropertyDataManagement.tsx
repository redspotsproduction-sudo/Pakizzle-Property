import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Building2,
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
  Settings2,
  Home,
  Compass
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

type ViewMode = 'types' | 'projects' | 'layouts';

export default function PropertyDataManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>('types');
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
      if (viewMode === 'types') {
        const data = await vehicleAdminService.getMakes();
        setMakes(data);
      } else if (viewMode === 'projects') {
        const data = await vehicleAdminService.getModels(selectedMake?.id);
        setModels(data);
      } else {
        const data = await vehicleAdminService.getVariants(selectedModel?.id);
        setVariants(data);
      }
    } catch (error) {
      toast.error('Failed to load real estate taxonomy');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this taxonomy record? This action cannot be undone.')) return;
    try {
      if (viewMode === 'types') await vehicleAdminService.deleteMake(id);
      else if (viewMode === 'projects') await vehicleAdminService.deleteModel(id);
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
      if (viewMode === 'types') {
        if (editItem) await vehicleAdminService.updateMake(editItem.id, data);
        else await vehicleAdminService.createMake(data);
      } else if (viewMode === 'projects') {
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
      
      {/* Header with Search and Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-apple-blue bg-apple-blue/10 px-2.5 py-0.5 rounded-full">
              Real Estate Taxonomy
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Property Database & Taxonomies
          </h1>
          <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Manage hierarchical property categories, housing schemes/societies, and standard architectural layouts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search taxonomy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl text-xs bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-apple-blue/50 w-48 md:w-64"
            />
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => setEditItem(null)}
                className="bg-apple-blue hover:bg-apple-blue/90 text-white rounded-xl text-xs font-semibold h-9 px-4 gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">
                  {editItem ? 'Edit Taxonomy' : 'Add Property Record'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Name / Title
                  </label>
                  <Input 
                    name="name" 
                    defaultValue={editItem?.name || ''} 
                    required 
                    placeholder="e.g. Luxury Bungalow, DHA Sector Y"
                    className="rounded-xl text-xs" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Slug
                  </label>
                  <Input 
                    name="slug" 
                    defaultValue={editItem?.slug || ''} 
                    placeholder="e.g. luxury-bungalow" 
                    className="rounded-xl text-xs" 
                  />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-apple-blue hover:bg-apple-blue/90 text-white rounded-xl text-xs">
                    Save Record
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
        <button
          onClick={() => { setViewMode('types'); setSelectedMake(null); setSelectedModel(null); }}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2",
            viewMode === 'types' 
              ? "bg-apple-blue text-white shadow-md shadow-apple-blue/20" 
              : "bg-black/5 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-black/10"
          )}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Property Types ({makes.length})</span>
        </button>

        <button
          onClick={() => { setViewMode('projects'); setSelectedModel(null); }}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2",
            viewMode === 'projects' 
              ? "bg-apple-blue text-white shadow-md shadow-apple-blue/20" 
              : "bg-black/5 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-black/10"
          )}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Projects & Societies ({models.length})</span>
        </button>

        <button
          onClick={() => setViewMode('layouts')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2",
            viewMode === 'layouts' 
              ? "bg-apple-blue text-white shadow-md shadow-apple-blue/20" 
              : "bg-black/5 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-black/10"
          )}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Standard Layouts ({variants.length})</span>
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-zinc-900/60 rounded-2xl border border-neutral-200 dark:border-zinc-800/80 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-neutral-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider">
          <span>Record Item</span>
          <span>Actions</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-neutral-400">Loading real estate records...</div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-zinc-800/60">
            {(viewMode === 'types' ? makes : (viewMode === 'projects' ? models : variants))
              .filter(item => !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((item: any) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <div>
                    <div className="text-sm font-bold text-neutral-900 dark:text-white">{item.name}</div>
                    <div className="text-xs text-neutral-400 mt-0.5">slug: {item.slug}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setEditItem(item); setIsModalOpen(true); }}
                      className="text-xs font-semibold h-8 rounded-lg"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-xs font-semibold text-rose-500 hover:text-rose-600 h-8 rounded-lg"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const VehicleDataManagement = PropertyDataManagement;
