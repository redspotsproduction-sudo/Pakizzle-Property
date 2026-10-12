import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  Search, 
  Plus, 
  MoreVertical, 
  Edit3, 
  Eye, 
  Trash2, 
  Globe, 
  Lock, 
  Clock, 
  TrendingUp, 
  Users, 
  BarChart3, 
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  Settings2,
  ArrowRight,
  Filter,
  Layers,
  Sparkles,
  ChevronRight,
  Monitor,
  Smartphone,
  Tablet,
  Layout,
  Type,
  Maximize2
} from "lucide-react";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "../../lib/utils";
import { ContentItem } from "../../types";

const mockContent: ContentItem[] = [
  {
    id: 'art_101',
    title: 'Rising Trends in Pakistans Luxury SUV Market',
    summary: 'An in-depth analysis of why premium SUVs are dominating the urban landscape in 2024.',
    content: 'Full content here...',
    category: 'news',
    image: 'https://picsum.photos/seed/suv/1000/600',
    author: 'Admin Zeeshan',
    status: 'published',
    isFeatured: true,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'art_102',
    title: 'Electric Vehicle Infrastructure: A Roadmap',
    summary: 'A comprehensive guide to the current state of EV charging stations across major highways.',
    content: 'Full content here...',
    category: 'guide',
    image: 'https://picsum.photos/seed/ev/1000/600',
    author: 'Irtiza Ahmed',
    status: 'draft',
    isFeatured: false,
    publishedAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'art_103',
    title: 'Spring Festival Car Maintenance Tips',
    summary: 'Prepare your vehicle for the changing seasons with these expert maintenance protocols.',
    content: 'Full content here...',
    category: 'announcement',
    image: 'https://picsum.photos/seed/tips/1000/600',
    author: 'Admin Zeeshan',
    status: 'published',
    isFeatured: false,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  }
];

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  const filtered = mockContent.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'published') return matchesSearch && item.status === 'published';
    if (activeTab === 'draft') return matchesSearch && item.status === 'draft';
    return matchesSearch;
  });

  const handleAction = (type: string, data: any) => {
    switch(type) {
      case 'preview':
        setSelectedItem(data);
        setIsPreviewOpen(true);
        break;
      case 'feature':
        toast.success(data.isFeatured ? "Removed from Featured" : "Added to Featured", {
          description: `Article "${data.title}" visibility updated on home screen.`,
          icon: <Sparkles className="w-4 h-4 text-purple-500" />
        });
        break;
      case 'delete':
        toast.error("Content Removed", {
          description: "This article and its associated assets have been purged.",
          icon: <Trash2 className="w-4 h-4" />
        });
        break;
      case 'publish':
        toast.success("Content Live", {
          description: "Article is now visible to the global marketplace audience.",
          icon: <Globe className="w-4 h-4 text-apple-green" />
        });
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Unified Admin Header - EXACT layout and sizing match */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <FileText className="w-3.5 h-3.5" />
            Global Editorial Shard
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-tight">
            Editorial Suite
          </h1>
          <p className="text-xs text-[#86868B] dark:text-[#86868B] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            Orchestrate platform narratives, press releases, marketplace blogs, and guide publications.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start md:self-end">
          {/* Segment controls */}
          <div className="flex p-0.5 bg-[#F5F5F7] dark:bg-white/5 rounded-xl border border-black/[0.04] dark:border-white/[0.04] self-start">
            {(['all', 'published', 'draft'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize",
                  activeTab === tab
                    ? "bg-white dark:bg-[#1C1C1E] shadow-sm text-[#1D1D1F] dark:text-white"
                    : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <button className="rounded-xl bg-apple-blue hover:bg-apple-blue-hover text-white text-xs font-semibold px-4 h-9 shadow-sm transition-all flex items-center justify-center">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Genesis Narrative
          </button>
        </div>
      </div>

      {/* Narrative Analytics Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Narrative Flux', value: '184', sub: 'Active masterpieces', icon: FileText, color: 'text-apple-blue', bg: 'bg-apple-blue/10' },
          { label: 'Citizen Reach', value: '428K', sub: 'Global impressions', icon: TrendingUp, color: 'text-apple-green', bg: 'bg-apple-green/10' },
          { label: 'Narrative Shard', value: '12.4%', sub: 'Avg engagement depth', icon: BarChart3, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Editor Nodes', value: '18', sub: 'Authoritative entities', icon: Users, color: 'text-apple-orange', bg: 'bg-apple-orange/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[var(--surface-dark)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div className={cn("p-3 rounded-xl group-hover:scale-105 transition-transform duration-500", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                Platform Sync
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-none">{stat.value}</div>
              <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider mt-1.5">{stat.label} — <span className="text-apple-green font-semibold">{stat.sub}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Control Hud with Search */}
      <div className="flex items-center justify-between gap-4 mt-6">
        <div className="relative group min-w-[200px] sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] group-focus-within:text-apple-blue transition-colors duration-300" />
          <input 
            type="text"
            placeholder="Narrative Diagnostic Query..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F5F5F7] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 rounded-xl text-xs font-medium focus:ring-0 outline-none transition-all duration-300 shadow-inner"
          />
        </div>
      </div>

      {/* Narrative Manifest Shard */}
      <div className="bg-white dark:bg-[var(--surface-dark)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300">
        <div className="overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-apple-border/10 h-32">
                <TableHead className="py-10 pl-12 text-[10px] font-black uppercase tracking-[0.3em] text-apple-text-muted">Masterpiece Profile</TableHead>
                <TableHead className="py-10 text-[10px] font-black uppercase tracking-[0.3em] text-apple-text-muted">State & Logical Shard</TableHead>
                <TableHead className="py-10 text-[10px] font-black uppercase tracking-[0.3em] text-apple-text-muted">Citizens Metrics</TableHead>
                <TableHead className="py-10 text-[10px] font-black uppercase tracking-[0.3em] text-apple-text-muted">Last Transmission</TableHead>
                <TableHead className="py-10 text-[10px] font-black uppercase tracking-[0.3em] text-apple-text-muted text-right pr-12">Command</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {filtered.map((item, idx) => (
                  <motion.tr 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleAction('preview', item)}
                    className="group cursor-pointer hover:bg-apple-gray/40 dark:hover:bg-white/[0.03] border-apple-border/5 transition-all h-32"
                  >
                    <TableCell className="pl-12">
                      <div className="flex items-center gap-8">
                        <div className="h-20 w-32 rounded-3xl overflow-hidden shrink-0 border border-apple-border/5 shadow-2xl group-hover:scale-110 transition-transform duration-700 relative">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                        <div className="min-w-0 max-w-[320px]">
                          <div className="font-black text-lg tracking-tighter mb-1.5 truncate text-apple-text group-hover:text-apple-blue transition-colors duration-500">
                            {item.title}
                          </div>
                          <div className="flex items-center gap-3">
                             <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-3 py-0.5 bg-apple-blue/5 text-apple-blue border-apple-blue/20 rounded-full">
                               {item.category}
                             </Badge>
                             <span className="text-[10px] font-black text-apple-text-muted/60 uppercase tracking-widest truncate">Node: {item.author}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-3">
                         <div className="flex items-center gap-2.5">
                            <div className={cn(
                              "w-2 h-2 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]",
                              item.status === 'published' ? "bg-apple-green animate-pulse shadow-apple-green/50" : "bg-apple-orange shadow-apple-orange/50"
                            )} />
                            <span className="text-xs font-black capitalize tracking-tight">{item.status}</span>
                         </div>
                         {item.isFeatured && (
                           <div className="flex items-center gap-2 text-[9px] font-black text-purple-500 uppercase tracking-widest bg-purple-500/10 w-fit px-3 py-1 rounded-full border border-purple-500/10">
                              <Sparkles className="w-3 h-3" /> Featured Shard
                           </div>
                         )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3">
                           <div className="p-1.5 rounded-lg bg-apple-blue/10 text-apple-blue">
                              <Eye className="w-3.5 h-3.5" />
                           </div>
                           <span className="text-xs font-black tracking-tight">1.2K Signal</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
                              <BarChart3 className="w-3.5 h-3.5" />
                           </div>
                           <span className="text-xs font-black tracking-tight text-apple-text-muted">45% Depth</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-apple-gray dark:bg-white/5 flex items-center justify-center text-apple-text-muted">
                             <Clock className="w-5 h-5" />
                          </div>
                          <div>
                             <div className="text-xs font-black tracking-tight">{new Date(item.updatedAt).toLocaleDateString()}</div>
                             <div className="text-[9px] font-black text-apple-text-muted uppercase tracking-widest mt-0.5">Transmission Sync</div>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="pr-12 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" size="icon" className="h-14 w-14 rounded-[22px] hover:bg-apple-gray active:scale-90 transition-all">
                            <MoreVertical className="w-6 h-6 text-apple-text-muted" />
                          </Button>
                        } />
                        <DropdownMenuContent align="end" className="w-72 rounded-[32px] border-apple-border/10 p-3 backdrop-blur-3xl bg-white/95 dark:bg-[#1D1D1F]/95 shadow-2xl">
                          <DropdownMenuItem onClick={() => handleAction('preview', item)} className="rounded-2xl py-4 px-5 font-black text-xs cursor-pointer focus:bg-apple-blue focus:text-white transition-all">
                             <Eye className="w-4 h-4 mr-4" /> Global Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-2xl py-4 px-5 font-black text-xs cursor-pointer hover:bg-purple-500/10">
                             <Edit3 className="w-4 h-4 mr-4 text-purple-500" /> Advanced Shard Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('feature', item)} className="rounded-2xl py-4 px-5 font-black text-xs cursor-pointer">
                             <Sparkles className={cn("w-4 h-4 mr-4", item.isFeatured ? "text-apple-orange" : "text-apple-text-muted")} /> 
                             {item.isFeatured ? "Purge featured Logic" : "Elevate to featured"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-2 bg-apple-border/10" />
                          {item.status === 'draft' && (
                             <DropdownMenuItem onClick={() => handleAction('publish', item)} className="rounded-2xl py-4 px-5 font-black text-xs cursor-pointer text-apple-green">
                                <Globe className="w-4 h-4 mr-4" /> Push to Production
                             </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleAction('delete', item)} className="rounded-2xl py-4 px-5 font-black text-xs cursor-pointer text-apple-red focus:bg-apple-red/10">
                             <Trash2 className="w-4 h-4 mr-4" /> Terminal Purge
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Narrative Preview Modal - Advanced Evolution */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[95vw] lg:max-w-4xl h-[85vh] max-h-[85vh] p-0 overflow-hidden border-none rounded-[2.5rem] bg-white dark:bg-[#1D1D1F] shadow-2xl flex flex-col">
          {selectedItem && (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Image Banner Shard */}
              <div className="h-[30vh] relative group overflow-hidden shrink-0">
                <img src={selectedItem.image} alt={selectedItem.title} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent flex flex-col justify-end p-8 lg:p-10">
                   <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                   >
                     <div className="flex items-center gap-2">
                        <Badge className="bg-apple-blue border-none text-[9px] font-black uppercase tracking-[0.2em] px-4 h-7 rounded-full shadow-lg shadow-apple-blue/10">{selectedItem.category}</Badge>
                     </div>
                     <h2 className="text-3xl lg:text-4xl font-black tracking-tighter text-white max-w-4xl leading-[0.9]">
                       {selectedItem.title}
                     </h2>
                   </motion.div>
                </div>
                <div className="absolute top-5 right-5 flex items-center gap-2 bg-black/20 backdrop-blur-2xl p-1.5 rounded-xl border border-white/10">
                   {[
                     { id: 'mobile', icon: Smartphone },
                     { id: 'tablet', icon: Tablet },
                     { id: 'desktop', icon: Monitor },
                   ].map((device) => (
                     <button
                       key={device.id}
                       onClick={() => setPreviewDevice(device.id as any)}
                       className={cn(
                         "p-1.5 rounded-md transition-all duration-500",
                         previewDevice === device.id ? "bg-white text-black shadow-xl scale-95" : "text-white/60 hover:text-white"
                       )}
                     >
                       <device.icon className="w-3.5 h-3.5" />
                     </button>
                   ))}
                </div>
              </div>

              {/* Responsive Frame Shard */}
              <div className="flex-1 overflow-hidden bg-apple-gray/20 dark:bg-black/20 relative">
                 <ScrollArea className="h-full w-full">
                    <div className="flex justify-center py-8 px-4">
                       <motion.div 
                        layout
                        animate={{ 
                          width: previewDevice === 'mobile' ? 280 : previewDevice === 'tablet' ? 450 : '100%',
                          maxWidth: previewDevice === 'desktop' ? 600 : 'none'
                        }}
                        className="bg-white dark:bg-[#1D1D1F] rounded-[24px] shadow-2xl overflow-hidden border border-apple-border/5"
                       >
                          {/* Inner Mock Navigation */}
                          <div className="h-10 border-b border-apple-border/10 flex items-center justify-between px-6">
                             <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-lg bg-apple-blue" />
                                <span className="font-black text-[9px] uppercase tracking-widest">AutoAlpha</span>
                             </div>
                          </div>

                          <div className={cn(
                            "p-6 lg:p-8 space-y-6",
                            previewDevice === 'mobile' ? 'p-4 lg:p-4' : ''
                          )}>
                             <div className="space-y-4">
                               <div className="flex items-center gap-2 text-apple-blue">
                                  <Type className="w-4 h-4" />
                                  <h4 className="text-[9px] font-black uppercase tracking-[0.4em]">Protocol</h4>
                                </div>
                                <p className="text-lg lg:text-xl font-black leading-[1.1] tracking-tighter text-apple-text/90">
                                  The automotive landscape is undergoing a systemic reset. Shifting from ownership to utility.
                                </p>
                             </div>

                             <p className="text-xs font-semibold leading-relaxed text-apple-text/70">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at porttitor sem. Aliquam erat volutpat. Donec varius metus id erat elementum, eu imperdiet turpis sodales.
                             </p>
                          </div>
                       </motion.div>
                    </div>
                 </ScrollArea>

                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 w-full max-w-[90%] lg:w-auto px-4 z-10">
                    <Button 
                      variant="outline" 
                      className="flex-1 lg:flex-none h-10 rounded-xl border border-white/20 bg-black/60 backdrop-blur-3xl text-white font-black text-[8px] uppercase tracking-widest px-4 hover:bg-black/80 active:scale-95 transition-all outline-none"
                      onClick={() => setIsPreviewOpen(false)}
                    >
                       Edit
                    </Button>
                    <Button 
                      className="flex-1 lg:flex-none h-10 rounded-xl apple-button-primary font-black text-[8px] uppercase tracking-widest px-6 shadow-lg active:scale-90 transition-all border-none"
                      onClick={() => setIsPreviewOpen(false)}
                    >
                       Deploy Protocol
                    </Button>
                 </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
