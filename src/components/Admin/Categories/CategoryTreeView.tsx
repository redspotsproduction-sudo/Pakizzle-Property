import React, { useState, useMemo } from 'react';
import { 
  ChevronRight, 
  MoreVertical, 
  FolderOpen, 
  LayoutGrid, 
  Search, 
  Plus, 
  ArrowLeft,
  ChevronDown,
  Activity,
  Layers,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Category } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryTreeViewProps {
  categories: Category[];
  onSelect: (category: Category) => void;
  isLoading: boolean;
  onAdd: (parentId: string | null, level: number) => void;
}

export default function CategoryTreeView({ categories, onSelect, isLoading, onAdd }: CategoryTreeViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [activeColumn, setActiveColumn] = useState<'parents' | 'children' | 'subchildren'>('parents');

  const parents = useMemo(() => 
    categories.filter(c => c.level === 1 && c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.order - b.order),
  [categories, searchQuery]);

  const children = useMemo(() => 
    categories.filter(c => c.parentId === selectedParentId && c.level === 2)
    .sort((a, b) => a.order - b.order),
  [categories, selectedParentId]);

  const subChildren = useMemo(() => 
    categories.filter(c => c.parentId === selectedChildId && c.level === 3)
    .sort((a, b) => a.order - b.order),
  [categories, selectedChildId]);

  return (
    <div className="flex-1 min-h-0 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-[40px] border border-apple-border/50 overflow-hidden flex flex-col md:flex-row shadow-2xl shadow-black/5">
      
      {/* Column 1: Core Dimensions */}
      <div className={cn(
        "flex-1 border-r border-apple-border/50 flex flex-col transition-all duration-700",
        activeColumn !== 'parents' && "hidden md:flex"
      )}>
        <header className="p-6 border-b border-apple-border/30 bg-apple-gray/50 dark:bg-white/[0.02]">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[14px] bg-apple-blue/10 flex items-center justify-center text-apple-blue font-bold">
                   <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-apple-text-muted">Core Taxonomy</h3>
             </div>
             <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => onAdd(null, 1)}>
                <Plus className="w-4 h-4" />
             </Button>
          </div>
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-text-muted opacity-40" />
             <Input 
                className="pl-10 h-11 rounded-2xl border-apple-border/50 bg-white dark:bg-white/5 font-medium text-sm"
                placeholder="Search matrix..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
        </header>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {parents.map((cat, idx) => (
                <motion.div
                  layout
                  key={`parent-${cat.id}-${idx}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "group p-4 rounded-[2rem] border transition-all cursor-pointer flex items-center gap-4 relative",
                    selectedParentId === cat.id 
                      ? "bg-apple-blue border-apple-blue shadow-2xl shadow-apple-blue/30" 
                      : "bg-white dark:bg-white/5 border-apple-border hover:border-apple-blue/50"
                  )}
                  onClick={() => {
                    setSelectedParentId(cat.id);
                    setSelectedChildId(null);
                    setActiveColumn('children');
                  }}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                    selectedParentId === cat.id ? "bg-white/20 text-white" : "bg-apple-gray dark:bg-white/10 text-apple-text"
                  )}>
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "font-bold text-sm tracking-tight truncate mb-0.5",
                      selectedParentId === cat.id ? "text-white" : "text-apple-text"
                    )}>
                      {cat.name}
                    </div>
                    <div className={cn(
                      "text-[9px] font-black tracking-widest uppercase",
                      selectedParentId === cat.id ? "text-white/60" : "text-apple-text-muted"
                    )}>
                      {cat.itemCount} Objects
                    </div>
                  </div>

                  <ChevronRight className={cn("w-4 h-4", selectedParentId === cat.id ? "text-white" : "text-apple-text-muted opacity-40")} />
                  
                  {selectedParentId === cat.id && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="absolute -right-[1px] top-1/2 -translate-y-1/2 w-1.5 h-12 bg-white rounded-l-full shadow-lg"
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>

      {/* Column 2: Structural Elements */}
      <div className={cn(
        "flex-1 border-r border-apple-border/50 flex flex-col transition-all duration-700",
        activeColumn !== 'children' && "hidden md:flex",
        !selectedParentId && "opacity-40 grayscale pointer-events-none"
      )}>
        <header className="p-6 border-b border-apple-border/30 bg-apple-gray/50 dark:bg-white/[0.02]">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setActiveColumn('parents')}>
                    <ArrowLeft className="w-4 h-4" />
                 </Button>
                 <div className="w-10 h-10 rounded-[14px] bg-apple-green/10 flex items-center justify-center text-apple-green">
                    <LayoutGrid className="w-5 h-5" />
                 </div>
                 <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-apple-text-muted">Structural Nodes</h3>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => onAdd(selectedParentId, 2)}>
                <Plus className="w-4 h-4" />
              </Button>
           </div>
        </header>
        
        <ScrollArea className="flex-1 p-4">
           {!selectedParentId ? (
              <EmptyState icon={Layers} text="Select a core dimension to visualize structural hierarchy." />
           ) : (
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {children.map((cat, idx) => (
                    <motion.div
                      layout
                      key={`child-${cat.id}-${idx}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        "group p-4 rounded-[2rem] border transition-all cursor-pointer flex items-center justify-between",
                        selectedChildId === cat.id 
                          ? "bg-apple-green border-apple-green shadow-2xl shadow-apple-green/30" 
                          : "bg-white dark:bg-white/5 border-apple-border hover:border-apple-green/50"
                      )}
                      onClick={() => {
                        setSelectedChildId(cat.id);
                        setActiveColumn('subchildren');
                      }}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          selectedChildId === cat.id ? "bg-white/20 text-white" : "bg-apple-green/10 text-apple-green"
                        )}>
                          <Activity className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <div className={cn(
                            "font-bold text-sm tracking-tight truncate",
                            selectedChildId === cat.id ? "text-white" : "text-apple-text"
                          )}>
                            {cat.name}
                          </div>
                          <div className={cn(
                            "text-[9px] font-black tracking-widest uppercase opacity-60",
                            selectedChildId === cat.id ? "text-white" : "text-apple-text-muted"
                          )}>
                             {cat.metadata?.itemCount || 0} Assets
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={cn("w-4 h-4", selectedChildId === cat.id ? "text-white" : "text-apple-text-muted opacity-40")} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {children.length === 0 && <EmptyState text="No structural nodes identified for this dimension." italic />}
              </div>
           )}
        </ScrollArea>
      </div>

      {/* Column 3: Leaf Assets */}
      <div className={cn(
        "flex-1.5 flex flex-col transition-all duration-500",
        activeColumn !== 'subchildren' && "hidden md:flex",
        !selectedChildId && "opacity-40 grayscale pointer-events-none"
      )}>
        <header className="p-6 border-b border-apple-border/30 bg-apple-gray/50 dark:bg-white/[0.02]">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setActiveColumn('children')}>
                    <ArrowLeft className="w-4 h-4" />
                 </Button>
                 <div className="w-10 h-10 rounded-[14px] bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Database className="w-5 h-5" />
                 </div>
                 <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-apple-text-muted">Terminal Attributes</h3>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => onAdd(selectedChildId, 3)}>
                <Plus className="w-4 h-4" />
              </Button>
           </div>
        </header>

        <ScrollArea className="flex-1 p-6">
           {!selectedChildId ? (
              <EmptyState icon={Database} text="Examine terminal leaves within the selected structural node." />
           ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                 <AnimatePresence mode="popLayout">
                    {subChildren.map((cat, idx) => (
                       <motion.div
                          key={`sub-${cat.id}-${idx}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-6 rounded-[2.5rem] bg-white dark:bg-white/5 border border-apple-border hover:border-purple-500/50 transition-all group flex flex-col justify-between min-h-[160px] shadow-sm hover:shadow-xl cursor-pointer"
                          onClick={() => onSelect(cat)}
                       >
                          <div className="flex items-start justify-between">
                             <div className="space-y-1">
                                <h4 className="font-black text-lg tracking-tight text-apple-text">{cat.name}</h4>
                                <div className="text-[10px] font-bold text-apple-text-muted uppercase tracking-[0.2em]">{cat.slug}</div>
                             </div>
                             <div className="w-8 h-8 rounded-full bg-apple-gray dark:bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                <ChevronRight className="w-4 h-4" />
                             </div>
                          </div>
                          <div className="mt-8 flex items-center justify-between">
                             <Badge variant="outline" className="rounded-full px-3 py-0.5 font-bold text-[9px] uppercase tracking-widest border-apple-border/50 bg-apple-gray/30">Leaf Node</Badge>
                             <div className="text-[10px] font-black text-purple-500 uppercase tracking-widest">{cat.metadata?.itemCount || 0} Records</div>
                          </div>
                       </motion.div>
                    ))}
                 </AnimatePresence>
                 
                 <button 
                  className="p-6 rounded-[2.5rem] border-2 border-dashed border-apple-border/50 hover:border-apple-blue/50 bg-apple-gray/10 hover:bg-apple-blue/5 transition-all group flex flex-col items-center justify-center gap-3 min-h-[160px]"
                  onClick={() => onAdd(selectedChildId, 3)}
                 >
                    <div className="w-12 h-12 rounded-full bg-white dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                       <Plus className="w-6 h-6 text-apple-text-muted" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">Append Terminal Leaf</span>
                 </button>
              </div>
           )}
        </ScrollArea>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, text, italic }: { icon?: any, text: string, italic?: boolean }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      {Icon && (
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-apple-border/50 flex items-center justify-center mb-6 opacity-20">
          <Icon className="w-8 h-8 text-apple-text-muted" />
        </div>
      )}
      <p className={cn(
        "text-sm font-bold text-apple-text-muted max-w-[200px] leading-relaxed",
        italic && "italic-serif font-medium"
      )}>
        {text}
      </p>
    </div>
  );
}
