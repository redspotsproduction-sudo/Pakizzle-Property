import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Film, 
  Trash2, 
  Edit2, 
  Search, 
  Heart, 
  MessageSquare, 
  Eye, 
  PlusCircle, 
  Save, 
  X, 
  Filter, 
  ExternalLink,
  Sliders,
  TrendingUp,
  Award,
  Users,
  Car,
  Loader2,
  Zap
} from 'lucide-react';
import { db } from '../../firebase';
import { reelsService, Reel } from '../../services/reelsService';
import { collection, query, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { getLocalVideo } from '../../utils/videoDb';
import { Button } from "@/components/ui/button";
import { cn } from "../../lib/utils";

export default function ReelsManagement() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [localUrls, setLocalUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Resolve local IndexedDB video URLs
  useEffect(() => {
    let active = true;
    const fetchLocalVideos = async () => {
      for (const reel of reels) {
        const url = reel.videoUrl;
        if (url && url.startsWith('local-reel-') && !localUrls[url]) {
          try {
            const blob = await getLocalVideo(url);
            if (!active) return;
            if (blob) {
              const objUrl = URL.createObjectURL(blob);
              setLocalUrls(prev => ({ ...prev, [url]: objUrl }));
            } else {
              setLocalUrls(prev => ({ 
                ...prev, 
                [url]: '/videos/walkthrough_villa.mp4' 
              }));
            }
          } catch (e) {
            console.error("Local resolution failed inside ReelsManagement", e);
          }
        }
      }
    };
    fetchLocalVideos();
    return () => {
      active = false;
    };
  }, [reels, localUrls]);

  // Edit State
  const [editingReel, setEditingReel] = useState<Reel | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editListingId, setEditListingId] = useState('');
  const [editLikesCount, setEditLikesCount] = useState<number>(0);
  const [editViewsCount, setEditViewsCount] = useState<number>(0);
  const [editCommentsCount, setEditCommentsCount] = useState<number>(0);
  const [editMake, setEditMake] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editYear, setEditYear] = useState<number>(2024);
  const [editSellerName, setEditSellerName] = useState('');
  const [editSellerAvatar, setEditSellerAvatar] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);

  // Stats Counters
  const [stats, setStats] = useState({
    totalCount: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0
  });

  useEffect(() => {
    setLoading(true);
    // Realtime subscribe to all reels
    const unsub = reelsService.subscribeToReels((loadedReels) => {
      setReels(loadedReels);
      setLoading(false);

      // Compute stats indicators
      const counts = loadedReels.reduce((acc, r) => {
        acc.views += (r.viewsCount || 0);
        acc.likes += (r.likesCount || 0);
        acc.comments += (r.commentsCount || 0);
        return acc;
      }, { views: 0, likes: 0, comments: 0 });

      setStats({
        totalCount: loadedReels.length,
        totalViews: counts.views,
        totalLikes: counts.likes,
        totalComments: counts.comments
      });
    });

    return () => unsub();
  }, []);

  const handleEditClick = (reel: Reel) => {
    setEditingReel(reel);
    setEditCaption(reel.caption || '');
    setEditVideoUrl(reel.videoUrl || '');
    setEditListingId(reel.listingId || '');
    setEditLikesCount(reel.likesCount || 0);
    setEditViewsCount(reel.viewsCount || 0);
    setEditCommentsCount(reel.commentsCount || 0);
    setEditMake(reel.make || '');
    setEditModel(reel.model || '');
    setEditPrice(reel.price || 0);
    setEditYear(reel.year || 2024);
    setEditSellerName(reel.sellerName || '');
    setEditSellerAvatar(reel.sellerAvatar || '');
  };

  const handleSaveEdit = async () => {
    if (!editingReel) return;
    if (!editVideoUrl.trim()) {
      toast.error("Video URL is mandatory.");
      return;
    }

    setIsSaving(true);
    try {
      const parentReelRef = doc(db, 'reels', editingReel.id);
      
      const updateData = {
        caption: editCaption,
        videoUrl: editVideoUrl,
        listingId: editListingId,
        likesCount: Number(editLikesCount),
        viewsCount: Number(editViewsCount),
        commentsCount: Number(editCommentsCount),
        make: editMake,
        model: editModel,
        price: Number(editPrice),
        year: Number(editYear),
        sellerName: editSellerName,
        sellerAvatar: editSellerAvatar
      };

      await updateDoc(parentReelRef, updateData);
      toast.success(`Reel ${editingReel.id} successfully updated! 🎬`);
      setEditingReel(null);
    } catch (e: any) {
      toast.error(`Admin error updating reel data: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteReel = async (id: string) => {
    if (!window.confirm(`[ADMIN] WARNING: Are you sure you want to delete Reel with ID "${id}" permanently?`)) return;

    try {
      await reelsService.deleteReel(id);
      toast.success("Reel deleted permanently from Pakizzle Cloud Node.");
    } catch (e: any) {
      toast.error(`Failed to delete reel: ${e.message}`);
    }
  };

  // Filter and Search logic
  const filteredReels = reels.filter(reel => {
    const matchesSearch = 
      reel.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reel.sellerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reel.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reel.make && `${reel.make} ${reel.model}`.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterCategory === 'all') return matchesSearch;
    if (filterCategory === 'high_interaction') return matchesSearch && (reel.likesCount > 50 || reel.viewsCount > 500);
    if (filterCategory === 'linked_car') return matchesSearch && !!reel.listingId;
    if (filterCategory === 'no_listing') return matchesSearch && (!reel.listingId || reel.listingId === 'demo_link_1');
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions - EXACT match with Approval Center layout and sizing */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <Film className="w-3.5 h-3.5 animate-pulse" />
            Verified Reels Console
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-tight">
            Reels Management
          </h1>
          <p className="text-xs text-[#86868B] dark:text-[#86868B] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            Supervise, edit metadata, audit interactions, and moderate immersive vertical video feeds.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start md:self-end">
          <Button 
            variant="outline" 
            className="rounded-xl border-black/[0.08] dark:border-white/[0.08] bg-white/50 dark:bg-white/5 backdrop-blur-sm text-xs font-semibold h-10 px-4"
            onClick={() => toast.success("Export Initialized", { description: "Generating database dump of active reel stats." })}
          >
            Export Stats
          </Button>
          <Button 
            className="apple-button-primary rounded-xl text-xs font-semibold h-10 px-5 text-white"
            onClick={() => toast.info("New Reel Flow", { description: "Open mobile app to record immersive reels." })}
          >
            Create Reel
          </Button>
        </div>
      </div>

      {/* High-Velocity Metrics Shard - Sized perfectly like Approval Center bento elements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-apple-text">
        {[
          { label: 'Total Reels Deployed', value: stats.totalCount, change: '+5%', description: 'Active immersive feeds', icon: Film, color: 'blue' },
          { label: 'Immersive Views', value: stats.totalViews.toLocaleString(), change: '+28%', description: 'Aggregated impressions', icon: Eye, color: 'green' },
          { label: 'Dynamic Likes', value: stats.totalLikes.toLocaleString(), change: '+14%', description: 'Interactive appreciation clicks', icon: Heart, color: 'purple' },
          { label: 'Active Comments', value: stats.totalComments.toLocaleString(), change: '+9%', description: 'User conversation trails', icon: MessageSquare, color: 'orange' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-[var(--surface-dark)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-5 flex flex-col justify-between hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300 relative group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md",
                stat.color === 'blue' && "bg-apple-blue shadow-apple-blue/10",
                stat.color === 'orange' && "bg-apple-orange shadow-apple-orange/10",
                stat.color === 'green' && "bg-apple-green shadow-apple-green/10",
                stat.color === 'purple' && "bg-[#AF52DE] shadow-purple-500/10"
              )}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                stat.change.startsWith('+') ? "text-apple-green bg-apple-green/10" : "text-apple-red bg-apple-red/10"
              )}>
                {stat.change}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-white font-sans">{stat.value}</h3>
              <p className="text-[10px] text-[#86868B] font-normal leading-relaxed">{stat.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs Row and Search Block - EXACT match with Seller Console/Approval Center layout */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0" style={{ WebkitOverflowScrolling: 'touch' }}>
          {[
            { id: 'all', label: 'All Reels' },
            { id: 'high_interaction', label: 'High Interaction' },
            { id: 'linked_car', label: 'Linked Vehicles' },
            { id: 'no_listing', label: 'Template Fallbacks' }
          ].map((cat) => {
            const isActive = filterCategory === cat.id;
            const count = cat.id === 'all' 
              ? reels.length 
              : cat.id === 'high_interaction' 
                ? reels.filter(r => r.likesCount > 50 || r.viewsCount > 500).length
                : cat.id === 'linked_car' 
                  ? reels.filter(r => !!r.listingId).length
                  : reels.filter(r => !r.listingId || r.listingId === 'demo_link_1').length;

            return (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border",
                  isActive
                    ? "bg-apple-blue text-white border-apple-blue shadow-sm"
                    : "bg-white dark:bg-[var(--surface-dark)] border-black/[0.04] dark:border-white/[0.04] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                )}
              >
                {cat.label} <span className={cn("ml-1 py-0.5 px-1.5 rounded-full text-[9px] font-bold font-mono", isActive ? "bg-white/25 text-white" : "bg-[#F5F5F7] dark:bg-white/5 text-[#86868B]")}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="relative group min-w-[200px] sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] group-focus-within:text-apple-blue transition-colors duration-300" />
          <input
            type="text"
            placeholder="Search captions or publisher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F5F5F7] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 rounded-xl text-xs font-medium focus:ring-0 outline-none transition-all duration-300 shadow-inner"
          />
        </div>
      </div>

      {/* Primary database view */}
      {loading ? (
        <div className="flex items-center justify-center p-20">
          <div className="w-8 h-8 border-4 border-apple-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredReels.length === 0 ? (
        <div className="p-16 border border-dashed border-black/[0.06] dark:border-white/[0.06] text-center rounded-[32px] bg-[#F5F5F7]/30 dark:bg-white/[0.005]">
          <Film className="w-12 h-12 text-[#86868B]/40 mx-auto mb-4" />
          <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white mb-1">No Reels Match the Filter</h3>
          <p className="text-xs text-[#86868B] max-w-xs mx-auto mb-4 leading-relaxed font-normal">
            Adjust your search queries or switch filter categories to view items.
          </p>
          <button 
            onClick={() => {
              setFilterCategory('all');
              setSearchQuery("");
            }}
            className="px-3.5 py-1.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-semibold bg-white dark:bg-[#2C2C2E] hover:bg-black/5"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        /* Reels List Cards - EXACT card format, padding and hover from Seller Console / Approval Center layout */
        <div className="space-y-3.5">
          <AnimatePresence mode="popLayout">
            {filteredReels.map((reel, idx) => {
              const resolvedUrl = localUrls[reel.videoUrl] || reel.videoUrl;
              return (
                <motion.div
                  key={reel.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, delay: idx * 0.02 }}
                  className="bg-white dark:bg-[var(--surface-dark)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-4.5 flex flex-col md:flex-row items-stretch md:items-center gap-5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300"
                >
                  {/* Portrait Media Preview Column */}
                  <div className="relative w-full md:w-28 aspect-[9/16] max-h-[160px] md:max-h-[190px] rounded-xl overflow-hidden shrink-0 bg-[#0C0C0D] border border-black/5 dark:border-white/10 group flex items-center justify-center">
                    {resolvedUrl && (resolvedUrl.startsWith('blob:') || resolvedUrl.startsWith('http') || resolvedUrl.startsWith('/') || resolvedUrl.startsWith('./')) ? (
                      <video 
                        src={resolvedUrl} 
                        muted 
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src && !target.src.includes('/videos/walkthrough_')) {
                            target.src = '/videos/walkthrough_villa.mp4';
                          }
                        }}
                        className="w-full h-full object-cover pointer-events-none" 
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0C0C0D] font-mono text-[8px] text-blue-400">
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-4 h-4 text-white" />
                    </div>

                    <div className="absolute top-2.5 left-2.5">
                       <span className={cn(
                        "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider backdrop-blur-md border bg-black/40 text-white border-white/20"
                       )}>
                         Portrait Feed
                       </span>
                    </div>
                  </div>

                  {/* Reel Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#86868B] uppercase tracking-wider mb-1">
                         <Zap className="w-3 h-3 text-apple-blue" />
                         Reel ID #{reel.id.slice(-8).toUpperCase()}
                         <span className="opacity-30">•</span>
                         <span className="text-apple-blue font-bold">BY {reel.sellerName || 'Anonymous Seller'}</span>
                      </div>
                      
                      {/* Caption Snippet */}
                      <p className="text-sm font-semibold text-[#1D1D1F] dark:text-white line-clamp-2 leading-relaxed max-w-2xl">
                        {reel.caption || <span className="italic text-apple-text-muted font-normal text-[10px]">No caption</span>}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px] text-[#86868B] font-normal">
                         {reel.make ? (
                           <div className="flex items-center gap-1 bg-apple-blue/5 dark:bg-apple-blue/10 border border-apple-blue/10 px-2.5 py-0.5 rounded-lg text-apple-blue font-bold text-[10px]">
                             <Car className="w-3 h-3" /> Linked: {reel.year} {reel.make} {reel.model}
                           </div>
                         ) : (
                           <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 px-2.5 py-0.5 rounded-lg text-amber-500 font-bold text-[10px] uppercase font-mono">
                             Demo No Link
                           </div>
                         )}
                         {reel.price ? (
                           <span className="font-semibold text-apple-green">₨ {reel.price.toLocaleString()}</span>
                         ) : null}
                      </div>
                    </div>

                    {/* Bento Micro-Stats box matrix */}
                    <div className="grid grid-cols-3 gap-2 mt-3.5 max-w-md">
                       <div className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02]">
                          <p className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Impressions</p>
                          <p className="text-xs font-bold text-apple-green font-mono mt-0.5">
                            {(reel.viewsCount || 0).toLocaleString()} Views
                          </p>
                       </div>
                       <div className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02]">
                          <p className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Favorites</p>
                          <p className="text-xs font-bold text-red-500 font-mono mt-0.5">
                            {(reel.likesCount || 0).toLocaleString()} Likes
                          </p>
                       </div>
                       <div className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.02] border border-black/[0.02] dark:border-white/[0.02]">
                          <p className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Comments</p>
                          <p className="text-xs font-bold text-apple-blue font-mono mt-0.5">
                            {(reel.commentsCount || 0).toLocaleString()}
                          </p>
                       </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex md:flex-col justify-end items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-black/[0.04] dark:border-white/[0.04] md:pl-5 shrink-0">
                    <button 
                      onClick={() => handleEditClick(reel)}
                      className="px-4.5 py-2 rounded-xl bg-apple-blue hover:bg-blue-600 text-white flex items-center justify-center font-semibold text-xs transition-colors"
                      title="Override attributes"
                    >
                      Override Attributes
                    </button>

                    <button 
                      onClick={() => handleDeleteReel(reel.id)}
                      className="w-8.5 h-8.5 rounded-lg bg-[#F5F5F7] hover:bg-red-500/10 text-[#86868B] hover:text-red-500 dark:bg-white/5 flex items-center justify-center transition-colors border border-black/[0.02] dark:border-white/[0.02]"
                      title="Purge record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Admin overriding edit dialouge block */}
      <AnimatePresence>
        {editingReel && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingReel(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#1D1D1F] rounded-[36px] overflow-hidden border border-apple-border/50 shadow-2xl z-10 p-8 flex flex-col gap-6 text-left max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-apple-text flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-apple-blue" /> [ADMIN MODE] Override Reel Attributes
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider font-mono text-apple-text-muted mt-0.5 block">Reel ID: {editingReel.id}</span>
                </div>
                <button
                  onClick={() => setEditingReel(null)}
                  className="w-10 h-10 rounded-full bg-apple-gray dark:bg-white/5 flex items-center justify-center text-apple-text-muted hover:text-apple-text transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Visual Video source preview */}
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-apple-border/20 relative">
                  {(() => {
                    const resolvedUrl = localUrls[editVideoUrl] || editVideoUrl;
                    const isPlayable = resolvedUrl && (resolvedUrl.startsWith('blob:') || resolvedUrl.startsWith('http') || resolvedUrl.startsWith('/') || resolvedUrl.startsWith('./'));
                    if (!isPlayable) {
                      return (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 font-mono gap-2 text-[10px] text-blue-400">
                          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                          <span className="opacity-60 scale-90">RESOLVING STREAM</span>
                        </div>
                      );
                    }
                    return (
                      <video 
                        src={resolvedUrl} 
                        muted 
                        playsInline 
                        controls 
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src && !target.src.includes('/videos/walkthrough_')) {
                            target.src = '/videos/walkthrough_villa.mp4';
                          }
                        }}
                        className="w-full h-full object-cover" 
                      />
                    );
                  })()}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Caption input */}
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-apple-text-muted/80 block mb-1">Caption</label>
                    <textarea
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      rows={3}
                      className="w-full bg-apple-gray/50 dark:bg-white/5 p-4 rounded-xl text-xs focus:ring-1 focus:ring-apple-blue border border-apple-border/20 text-apple-text"
                    />
                  </div>

                  {/* Stream source Link */}
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-apple-text-muted/80 block mb-1">Source Video Stream URL</label>
                    <input
                      type="text"
                      value={editVideoUrl}
                      onChange={(e) => setEditVideoUrl(e.target.value)}
                      className="w-full bg-apple-gray/50 dark:bg-white/5 p-3 rounded-xl text-xs focus:ring-1 focus:ring-apple-blue border border-apple-border/20 text-apple-text"
                    />
                  </div>

                  {/* Interaction state stats overrides */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-apple-text-muted/80 block mb-1">Override Views Count</label>
                    <input
                      type="number"
                      value={editViewsCount}
                      onChange={(e) => setEditViewsCount(Number(e.target.value))}
                      className="w-full bg-apple-gray/50 dark:bg-white/5 p-3 rounded-xl text-xs focus:ring-1 focus:ring-apple-blue border border-apple-border/20 text-apple-text font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-apple-text-muted/80 block mb-1">Override Likes Count</label>
                    <input
                      type="number"
                      value={editLikesCount}
                      onChange={(e) => setEditLikesCount(Number(e.target.value))}
                      className="w-full bg-apple-gray/50 dark:bg-white/5 p-3 rounded-xl text-xs focus:ring-1 focus:ring-apple-blue border border-apple-border/20 text-apple-text font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-apple-text-muted/80 block mb-1 font-mono">Comments Count</label>
                    <input
                      type="number"
                      value={editCommentsCount}
                      onChange={(e) => setEditCommentsCount(Number(e.target.value))}
                      className="w-full bg-apple-gray/50 dark:bg-white/5 p-3 rounded-xl text-xs focus:ring-1 focus:ring-apple-blue border border-apple-border/20 text-apple-text font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-apple-text-muted/80 block mb-1">Listing reference ID</label>
                    <input
                      type="text"
                      value={editListingId}
                      onChange={(e) => setEditListingId(e.target.value)}
                      className="w-full bg-apple-gray/50 dark:bg-white/5 p-3 rounded-xl text-xs focus:ring-1 focus:ring-apple-blue border border-apple-border/20 text-apple-text font-mono"
                    />
                  </div>
                </div>

                {/* Overrides of cached listing metadata */}
                <div className="p-5 border border-apple-border/40 rounded-2xl bg-apple-gray/20 dark:bg-white/3 space-y-4">
                  <span className="text-[10px] uppercase tracking-widest font-mono text-apple-blue font-bold">Overriding Cached Vehicle Specs</span>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[9px] text-apple-text-muted font-bold block mb-1">Make</label>
                      <input
                        type="text"
                        value={editMake}
                        onChange={(e) => setEditMake(e.target.value)}
                        className="w-full bg-white dark:bg-black/60 p-2.5 rounded-lg text-xs border border-apple-border/20 text-apple-text"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-apple-text-muted font-bold block mb-1">Model</label>
                      <input
                        type="text"
                        value={editModel}
                        onChange={(e) => setEditModel(e.target.value)}
                        className="w-full bg-white dark:bg-black/60 p-2.5 rounded-lg text-xs border border-apple-border/20 text-apple-text"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-apple-text-muted font-bold block mb-1">Year</label>
                      <input
                        type="number"
                        value={editYear}
                        onChange={(e) => setEditYear(Number(e.target.value))}
                        className="w-full bg-white dark:bg-black/60 p-2.5 rounded-lg text-xs border border-apple-border/20 text-apple-text font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-apple-text-muted font-bold block mb-1">Price</label>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(Number(e.target.value))}
                        className="w-full bg-white dark:bg-black/60 p-2.5 rounded-lg text-xs border border-apple-border/20 text-apple-text font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Overrides of seller information */}
                <div className="p-5 border border-apple-border/40 rounded-2xl bg-apple-gray/20 dark:bg-white/3 space-y-4">
                  <span className="text-[10px] uppercase tracking-widest font-mono text-apple-green font-bold">Overriding Publisher Info</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] text-apple-text-muted font-bold block mb-1">Seller Display Name</label>
                      <input
                        type="text"
                        value={editSellerName}
                        onChange={(e) => setEditSellerName(e.target.value)}
                        className="w-full bg-white dark:bg-black/60 p-2.5 rounded-lg text-xs border border-apple-border/20 text-apple-text"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-apple-text-muted font-bold block mb-1">Seller Photo/Avatar URL</label>
                      <input
                        type="text"
                        value={editSellerAvatar}
                        onChange={(e) => setEditSellerAvatar(e.target.value)}
                        className="w-full bg-white dark:bg-black/60 p-2.5 rounded-lg text-xs border border-apple-border/20 text-apple-text"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action operations controls */}
              <div className="flex gap-3 pt-3 border-t border-apple-border/30">
                <button
                  type="button"
                  onClick={() => setEditingReel(null)}
                  className="flex-1 py-4 border border-apple-border/50 text-apple-text rounded-2xl font-bold text-xs hover:bg-apple-gray dark:hover:bg-white/5 transition-all"
                >
                  Cancel Override
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="flex-1 py-4 bg-apple-blue text-white rounded-2xl font-bold text-xs hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-apple-blue/20"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Apply Overrides & Database Write
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
