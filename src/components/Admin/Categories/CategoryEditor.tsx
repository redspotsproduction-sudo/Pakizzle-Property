import React, { useState, useEffect, useMemo } from 'react';
import { 
  Save, 
  Trash2, 
  Eye, 
  ChevronRight, 
  AlertCircle,
  Globe,
  Settings,
  Database,
  Search,
  History,
  CheckCircle2,
  Clock,
  LayoutGrid,
  Image as ImageIcon,
  Plus,
  X,
  Loader2,
  Sparkles,
  Zap,
  ShieldCheck,
  Smartphone,
  CloudUpload,
  RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Category, CategoryField } from '@/types';
import { categoryAdminService } from '@/services/categoryAdminService';
import FieldBuilder from '@/components/Admin/Categories/FieldBuilder/FieldBuilder';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CategoryEditorProps {
  isOpen: boolean;
  category: Category | null;
  allCategories: Category[];
  onClose: () => void;
  onUpdate: () => void;
  initialTab?: string;
}

export default function CategoryEditor({ isOpen, category, allCategories, onClose, onUpdate, initialTab = 'general' }: CategoryEditorProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [formData, setFormData] = useState<Category | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);
  const [fields, setFields] = useState<CategoryField[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (category) {
      setFormData(category);
      loadFields(category.id);
    }
  }, [category]);

  const loadFields = async (categoryId: string) => {
    if (categoryId.startsWith('new_category_')) {
      setFields([]);
      return;
    }
    try {
      const data = await categoryAdminService.getCategoryFields(categoryId);
      setFields(data);
    } catch (error) {
      console.error('Error loading fields:', error);
    }
  };

  const handleSave = async (silent = false): Promise<string | null> => {
    if (!formData || !category) return null;
    setIsSaving(true);
    try {
      let currentId = category.id;
      
      const payload = {
        ...formData,
        isDraft: true,
        updatedAt: new Date().toISOString()
      };

      if (currentId.startsWith('new_category_')) {
        const newId = await categoryAdminService.createCategory(payload);
        currentId = newId;
      } else {
        await categoryAdminService.updateCategory(currentId, payload);
      }
      
      await categoryAdminService.saveFields(currentId, fields);
      
      await categoryAdminService.logAction(
        category.id.startsWith('new_category_') ? 'ARCH_CREATE' : 'ARCH_UPDATE',
        'Category',
        currentId,
        `Architectural state synchronized for node: ${formData.name}`
      );

      setLastSaved(new Date());
      if (!silent) toast.success('Checkpoint created successfully');
      return currentId;
    } catch (error) {
      if (!silent) toast.error('State synchronization failed');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!formData || !category) return;
    setIsPublishing(true);
    try {
      const currentId = await handleSave(true);
      if (!currentId) throw new Error('Failed to save state before publishing');

      await categoryAdminService.publishCategory(currentId);
      toast.success('Architecture broadcasted to production (V' + (formData.version + 1) + ')');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Global broadcast failed');
      console.error(error);
    } finally {
      setIsPublishing(false);
    }
  };

  const subCategoryCount = useMemo(() => {
    if (!category) return 0;
    return allCategories.filter(c => c.parentId === category.id).length;
  }, [allCategories, category?.id]);

  if (!isOpen || !category || !formData) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-3xl" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ y: 100, scale: 0.9, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 100, scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-[1500px] min-h-[600px] bg-[#F5F5F7] dark:bg-[#000000] rounded-[60px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden flex flex-col"
      >
        {/* Apple Pro Toolbar */}
        <header className="shrink-0 h-24 px-12 border-b border-apple-border/5 flex items-center justify-between bg-white/60 dark:bg-black/60 backdrop-blur-2xl z-20">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-[20px] bg-apple-blue flex items-center justify-center text-white shadow-xl shadow-apple-blue/30 rotate-1 group hover:rotate-6 transition-transform">
               <Zap className="w-6 h-6 fill-current text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                 <h1 className="text-2xl font-black tracking-tight text-apple-text">{formData.name || 'Architecture Blueprint'}</h1>
                 {formData.isDraft && (
                    <Badge className="bg-apple-orange/10 text-apple-orange border-none text-[8px] font-black uppercase tracking-widest h-5 px-2">Staging Zone</Badge>
                 )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                 <div className="text-[10px] font-black text-apple-text-muted uppercase tracking-[0.2em] opacity-40">Build Index: {category.id.slice(0, 8)}</div>
                 <div className="w-1.5 h-1.5 rounded-full bg-apple-border" />
                 <div className="text-[10px] font-black text-apple-blue uppercase tracking-[0.2em]">Revision Core V{formData.version}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3 px-4 py-2 bg-apple-gray dark:bg-white/5 rounded-2xl border border-apple-border/5">
                <RefreshCcw className={cn("w-3.5 h-3.5 text-apple-blue", isSaving && "animate-spin")} />
                <span className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">
                   {isSaving ? 'Syncing...' : lastSaved ? `Last Sync: ${lastSaved.toLocaleTimeString()}` : 'Real-time Linked'}
                </span>
             </div>
             
             <div className="w-[1px] h-8 bg-apple-border/10 mx-2" />
             
             <button 
               onClick={onClose}
               className="w-12 h-12 rounded-full bg-apple-gray dark:bg-white/10 flex items-center justify-center hover:bg-apple-red hover:text-white transition-all group scale-90"
             >
               <X className="w-6 h-6" />
             </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Pro Workspace Sidebar */}
          <aside className="w-[380px] border-r border-apple-border/5 flex flex-col bg-[#FBFBFD] dark:bg-white/[0.01] shrink-0 overflow-hidden min-h-0">
            <ScrollArea className="flex-1 px-8 py-10">
              <div className="space-y-12">
                 <div className="space-y-6">
                    <div className="text-[11px] font-black uppercase tracking-[0.3em] text-apple-text-muted flex items-center gap-2 px-2">
                       <Smartphone className="w-4 h-4" /> Device Context
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 rounded-[32px] bg-white dark:bg-white/5 border border-apple-border/5 shadow-sm text-center space-y-3 hover:scale-[1.02] transition-all cursor-pointer">
                          <div className="text-3xl font-black text-apple-blue">{subCategoryCount}</div>
                          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-apple-text-muted">Child Nodes</div>
                       </div>
                       <div className="p-6 rounded-[32px] bg-white dark:bg-white/5 border border-apple-border/5 shadow-sm text-center space-y-3 hover:scale-[1.02] transition-all cursor-pointer">
                          <div className="text-3xl font-black text-purple-500">{fields.length}</div>
                          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-apple-text-muted">Attributes</div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="text-[11px] font-black uppercase tracking-[0.3em] text-apple-text-muted flex items-center gap-2 px-2">
                       <CloudUpload className="w-4 h-4" /> Global Integrity
                    </div>
                    <div className="space-y-4">
                       {[
                         { label: 'Marketplace Visibility', status: formData.status === 'active' ? 'Broadcast' : 'Restricted', icon: Globe, color: 'bg-apple-blue' },
                         { label: 'Homepage Priority', status: formData.showOnHomepage ? 'Enabled' : 'Disabled', icon: Sparkles, color: 'bg-yellow-500' },
                         { label: 'Data Governance', status: 'Locked', icon: ShieldCheck, color: 'bg-apple-green' }
                       ].map((item, i) => (
                         <div key={i} className="flex items-center justify-between p-5 rounded-[24px] bg-white dark:bg-white/5 border border-apple-border/5">
                            <div className="flex items-center gap-4">
                               <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg", item.color)}>
                                  <item.icon className="w-5 h-5" />
                               </div>
                               <div>
                                  <div className="text-xs font-black text-apple-text">{item.label}</div>
                                  <div className="text-[9px] font-bold text-apple-text-muted uppercase tracking-widest mt-0.5 opacity-60">{item.status}</div>
                               </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-apple-border" />
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="p-8 rounded-[40px] bg-gradient-to-br from-apple-blue/20 via-purple-500/10 to-transparent border border-apple-blue/20">
                    <div className="flex items-center gap-3 mb-4">
                       <Zap className="w-5 h-5 text-apple-blue" />
                       <span className="text-xs font-black uppercase tracking-widest text-apple-text">Real-time Core</span>
                    </div>
                    <p className="text-[11px] font-medium leading-relaxed opacity-70">
                       Any changes to this architectural node will be instantly mirrored across all global instances of the marketplace filter system.
                    </p>
                 </div>
              </div>
            </ScrollArea>
          </aside>

          {/* Configuration Canvas */}
          <div className="flex-1 flex flex-col bg-white dark:bg-[#111112] min-h-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col min-h-0">
              <div className="shrink-0 h-20 px-12 border-b border-apple-border/5 flex items-center justify-center overflow-x-auto no-scrollbar">
                <TabsList className="bg-apple-gray dark:bg-white/5 p-1 rounded-2xl border border-apple-border/5">
                  {[
                    { value: 'general', label: 'Identity', icon: Settings },
                    { value: 'attributes', label: 'Attribute Matrix', icon: Database },
                    { value: 'seo', label: 'Global Directives', icon: Globe },
                    { value: 'history', label: 'Revision Timeline', icon: History },
                  ].map(tab => (
                    <TabsTrigger 
                      key={tab.value} 
                      value={tab.value}
                      className="px-8 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] h-11 data-[state=active]:bg-white dark:data-[state=active]:bg-apple-blue data-[state=active]:text-apple-blue dark:data-[state=active]:text-white transition-all"
                    >
                      <div className="flex items-center gap-3">
                         <tab.icon className="w-4 h-4" />
                         {tab.label}
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                 <div className="p-16 lg:p-24 max-w-[1200px] mx-auto w-full pb-48">
                    <TabsContent value="general" className="mt-0 space-y-20 outline-none">
                       <section className="space-y-10">
                          <div className="grid grid-cols-2 gap-12">
                             <div className="space-y-4">
                                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-apple-text-muted px-2">Primary Node Designation</label>
                                <Input 
                                  value={formData.name}
                                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                                  placeholder="e.g. Electric Off-Roaders"
                                  className="h-16 rounded-3xl bg-apple-gray dark:bg-white/5 border-apple-border/40 font-black text-3xl tracking-tight px-8 focus:ring-apple-blue/20 focus:border-apple-blue/50"
                                />
                             </div>
                             <div className="space-y-4">
                                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-apple-text-muted px-2">Resource Shard (Slug)</label>
                                <Input 
                                   value={formData.slug}
                                   onChange={(e) => setFormData({...formData, slug: e.target.value})}
                                   placeholder="e.g. ELECTRIC-SUV"
                                   className="h-16 rounded-3xl bg-apple-gray dark:bg-white/5 border-apple-border/40 font-mono text-sm uppercase tracking-[0.3em] px-8"
                                />
                             </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                             <div className="space-y-4">
                                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-apple-text-muted px-2">Language: Arabic</label>
                                <Input 
                                   dir="rtl"
                                   value={formData.nameAr || ''}
                                   onChange={(e) => setFormData({...formData, nameAr: e.target.value})}
                                   className="h-14 rounded-2xl bg-apple-gray dark:bg-white/5 border-apple-border/40 font-bold"
                                />
                             </div>
                             <div className="space-y-4">
                                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-apple-text-muted px-2">Language: Urdu</label>
                                <Input 
                                   dir="rtl"
                                   value={formData.nameUr || ''}
                                   onChange={(e) => setFormData({...formData, nameUr: e.target.value})}
                                   className="h-14 rounded-2xl bg-apple-gray dark:bg-white/5 border-apple-border/40 font-bold"
                                />
                             </div>
                             <div className="space-y-4">
                                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-apple-text-muted px-2">Deployment Status</label>
                                <select 
                                   className="w-full h-14 rounded-2xl bg-apple-gray dark:bg-white/5 border border-apple-border/40 font-black text-[10px] uppercase tracking-widest px-6 outline-none appearance-none cursor-pointer hover:border-apple-blue/50 transition-colors"
                                   value={formData.status}
                                   onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                                >
                                   <option value="active">Active Spectrum</option>
                                   <option value="hidden">Hidden Layer</option>
                                   <option value="disabled">Locked/Read-only</option>
                                </select>
                             </div>
                          </div>
                       </section>

                       <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="p-10 rounded-[50px] bg-[#FBFBFD] dark:bg-white/[0.02] border border-apple-border/10 space-y-8">
                             <div>
                                <h3 className="text-xl font-black text-apple-text mb-2">Architectural Logic</h3>
                                <p className="text-xs font-medium text-apple-text-muted">Master visibility & promotional controls for this node.</p>
                             </div>
                             <div className="space-y-6">
                                {[
                                  { label: 'Spotlight on Launchpad', desc: 'Category appears on global homepage.', key: 'showOnHomepage' },
                                  { label: 'Featured Accelerator', desc: 'Increased weight in search relevance.', key: 'isFeatured' }
                                ].map((item) => (
                                  <div key={item.key} className="flex items-center justify-between">
                                     <div className="space-y-1">
                                        <div className="text-sm font-bold">{item.label}</div>
                                        <div className="text-[10px] font-medium text-apple-text-muted opacity-60">{item.desc}</div>
                                     </div>
                                     <button 
                                       onClick={() => setFormData({...formData, [item.key]: !((formData as any)[item.key])})}
                                       className={cn(
                                         "w-12 h-6 rounded-full relative p-1 transition-all duration-300 shadow-inner",
                                         (formData as any)[item.key] ? "bg-apple-blue" : "bg-apple-border/20"
                                       )}
                                     >
                                        <motion.div 
                                          layout
                                          className={cn("w-4 h-4 bg-white rounded-full shadow-lg", (formData as any)[item.key] ? "ml-auto" : "ml-0")}
                                        />
                                     </button>
                                  </div>
                                ))}
                             </div>
                          </div>

                          <div className="p-10 rounded-[50px] bg-[#FBFBFD] dark:bg-white/[0.02] border border-apple-border/10 flex flex-col items-center justify-center text-center space-y-6 group cursor-pointer hover:border-apple-blue transition-all border-dashed">
                             <div className="w-20 h-20 rounded-[30px] bg-white dark:bg-white/5 border border-apple-border/20 shadow-2xl flex items-center justify-center text-apple-blue group-hover:scale-110 transition-transform">
                                <ImageIcon className="w-10 h-10 opacity-30" />
                             </div>
                             <div className="space-y-1">
                                <h4 className="font-black text-apple-text">Brand Asset Manager</h4>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-text-muted opacity-40">SVG or High-Res PNG required</p>
                             </div>
                          </div>
                       </section>
                    </TabsContent>

                    <TabsContent value="attributes" className="mt-0 outline-none">
                       <FieldBuilder categoryId={category.id} fields={fields} onChange={setFields} />
                    </TabsContent>

                    <TabsContent value="history" className="mt-0 space-y-8 outline-none">
                       <div className="space-y-4">
                          {[
                            { v: '1.4', date: 'Just now', action: 'Draft State Modified', by: 'Ahmed Master' },
                            { v: '1.3', date: '2 days ago', action: 'Global Publish (V1.3)', by: 'System' },
                            { v: '1.2', date: 'Oct 24', action: 'Field Schema Expansion', by: 'Sarah Pro' },
                          ].map((log, i) => (
                            <div key={i} className="group p-8 rounded-[36px] bg-[#FBFBFD] dark:bg-white/[0.02] border border-apple-border/10 flex items-center justify-between hover:bg-white hover:dark:bg-white/5 transition-all">
                               <div className="flex items-center gap-6">
                                  <div className="p-4 rounded-2xl bg-apple-blue/5 text-apple-blue border border-apple-blue/10">
                                     <History className="w-5 h-5" />
                                  </div>
                                  <div>
                                     <div className="flex items-center gap-3">
                                        <span className="text-base font-black text-apple-text">{log.action}</span>
                                        <Badge className="bg-apple-blue text-white rounded-lg px-2 text-[9px] font-black h-5 uppercase tracking-widest">PROD {log.v}</Badge>
                                     </div>
                                     <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-bold text-apple-text-muted uppercase tracking-[0.2em]">{log.date}</span>
                                        <div className="w-1 h-1 rounded-full bg-apple-border" />
                                        <span className="text-[10px] font-black text-apple-text uppercase tracking-widest opacity-60">By {log.by}</span>
                                     </div>
                                  </div>
                               </div>
                               <Button variant="ghost" className="rounded-2xl h-12 px-6 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 bg-apple-gray dark:bg-white/10">Log Artifacts</Button>
                            </div>
                          ))}
                       </div>
                    </TabsContent>
                 </div>
              </ScrollArea>

              {/* Pro Action Footer */}
              <footer className="shrink-0 h-24 px-16 border-t border-apple-border/5 bg-white/80 dark:bg-black/80 backdrop-blur-3xl z-20 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-apple-green animate-pulse shadow-lg shadow-apple-green/50" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-apple-text">Universal Sync Ready</span>
                 </div>
                 
                 <div className="flex gap-6">
                    <Button 
                      variant="ghost" 
                      className="h-14 px-10 rounded-[20px] font-black text-[11px] uppercase tracking-widest text-apple-text-muted hover:bg-apple-gray dark:hover:bg-white/10"
                      onClick={onClose}
                    >
                      Surrender Changes
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-14 px-12 rounded-[20px] bg-white dark:bg-white/5 border border-apple-border/50 font-black text-[11px] uppercase tracking-[0.2em] shadow-sm hover:scale-[1.02] active:scale-95 transition-all gap-3"
                      disabled={isSaving || isPublishing}
                      onClick={() => handleSave()}
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 opacity-40" />}
                      Snapshot Checkpoint
                    </Button>
                    <Button 
                      className="h-14 px-14 rounded-[20px] bg-apple-blue text-white font-black text-[11px] uppercase tracking-[0.25em] shadow-[0_20px_40px_-10px_rgba(0,122,255,0.4)] hover:scale-[1.05] active:scale-95 transition-all gap-3"
                      disabled={isSaving || isPublishing}
                      onClick={handlePublish}
                    >
                      {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
                      Global Broadcast
                    </Button>
                 </div>
              </footer>
            </Tabs>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

