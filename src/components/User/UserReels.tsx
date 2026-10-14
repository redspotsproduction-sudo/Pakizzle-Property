import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Edit2, 
  Trash2, 
  Heart, 
  MessageSquare, 
  Eye, 
  PlusCircle, 
  Save, 
  X, 
  Check, 
  Film, 
  Sparkles,
  ExternalLink,
  Car,
  Loader2
} from 'lucide-react';
import { auth, db } from '../../firebase';
import { reelsService, Reel } from '../../services/reelsService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';
import ReelsUpload from '../Reels/ReelsUpload';
import { getLocalVideo } from '../../utils/videoDb';

interface VehicleDropdownItem {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
}

export default function UserReels() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [localUrls, setLocalUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Edit states
  const [editingReel, setEditingReel] = useState<Reel | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editListingId, setEditListingId] = useState('');
  const [userVehicles, setUserVehicles] = useState<VehicleDropdownItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const currentUser = auth.currentUser;

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
            console.error("Local resolution failed inside UserReels", e);
          }
        }
      }
    };
    fetchLocalVideos();
    return () => {
      active = false;
    };
  }, [reels, localUrls]);

  // Load and subscribe to user-specific reels
  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    const unsub = reelsService.subscribeToReels((allReels) => {
      const userSpecific = allReels.filter(r => r.sellerId === currentUser.uid);
      setReels(userSpecific);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser]);

  // Load user listings for reel dropdown linkage
  useEffect(() => {
    async function fetchUserVehicles() {
      if (!currentUser) return;
      try {
        const q = query(
          collection(db, 'properties'),
          where('seller.uid', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const list: VehicleDropdownItem[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            make: data.make || '',
            model: data.model || '',
            price: data.price || 0,
            year: data.year || 2024
          });
        });
        setUserVehicles(list);
      } catch (e) {
        console.error("Error loading user vehicles for dropdown:", e);
      }
    }
    fetchUserVehicles();
  }, [currentUser]);

  const handleEditClick = (reel: Reel) => {
    setEditingReel(reel);
    setEditCaption(reel.caption || '');
    setEditVideoUrl(reel.videoUrl || '');
    setEditListingId(reel.listingId || '');
  };

  const handleSaveEdit = async () => {
    if (!editingReel) return;
    if (!editVideoUrl.trim()) {
      toast.error("Video URL is required.");
      return;
    }

    setIsSaving(true);
    try {
      const linkedVehicle = userVehicles.find(v => v.id === editListingId);
      const updateData: Partial<Reel> = {
        caption: editCaption,
        videoUrl: editVideoUrl,
        listingId: editListingId,
      };

      if (linkedVehicle) {
        updateData.make = linkedVehicle.make;
        updateData.model = linkedVehicle.model;
        updateData.price = linkedVehicle.price;
        updateData.year = linkedVehicle.year;
      }

      await reelsService.updateReel(editingReel.id, updateData);
      toast.success("Reel updated successfully!");
      setEditingReel(null);
    } catch (e) {
      toast.error("Failed to update reel details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteReel = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete this Reel? ("${name.slice(0, 30)}...")`)) return;

    try {
      await reelsService.deleteReel(id);
      toast.success("Reel deleted successfully!");
    } catch (e) {
      toast.error("Failed to delete reel.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <Film className="w-3.5 h-3.5" />
            Reels Loop Controller
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-tight">
            Reels Dashboard
          </h1>
          <p className="text-xs text-[#86868B] dark:text-[#86868B] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            Manage your high-performance immersive video loops and interactive showcases.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4.5 py-2 bg-apple-blue hover:bg-blue-600 text-white rounded-full text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5 border-none self-start md:self-end"
        >
          <PlusCircle className="w-3.5 h-3.5 stroke-[2.5px]" />
          Create Reel Loop
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-apple-blue animate-spin" />
        </div>
      ) : reels.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-black/[0.06] dark:border-white/[0.06] rounded-2xl bg-[#F5F5F7]/30 dark:bg-white/[0.005]">
          <div className="w-10 h-10 bg-apple-blue/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Film className="w-5 h-5 text-apple-blue animate-pulse" />
          </div>
          <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white mb-1">No Reels Created Yet</h3>
          <p className="text-xs text-[#86868B] max-w-xs mx-auto mb-4 leading-relaxed font-normal">
            Link high-velocity immersive portrait videos to your vehicle fleet and experience extreme viewer interaction.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-apple-blue hover:bg-blue-600 text-white rounded-full text-xs font-semibold transition-all border-none"
          >
            Deploy First Reel Loop
          </button>
        </div>
      ) : (
        /* Grid list of reels */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reels.map((reel) => (
            <div 
              key={reel.id}
              className="bg-white dark:bg-[var(--surface-dark)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-4 flex flex-col justify-between group shadow-[0_4px_24px_rgba(0,0,0,0.01)]"
            >
              {/* Media Preview Area */}
              <div className="relative aspect-[4/5] w-full bg-black rounded-xl overflow-hidden border border-black/5 dark:border-white/10">
                {(() => {
                  const resolvedUrl = localUrls[reel.videoUrl] || reel.videoUrl;
                  const isPlayable = resolvedUrl && (resolvedUrl.startsWith('blob:') || resolvedUrl.startsWith('http') || resolvedUrl.startsWith('/') || resolvedUrl.startsWith('./'));
                  if (!isPlayable) {
                    return (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 font-mono gap-1.5 text-[10px] text-blue-400">
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                        <span className="opacity-60 scale-90 uppercase font-bold tracking-wider">Resolving Reel</span>
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
                
                {/* Overlay details */}
                <div className="absolute top-2.5 left-2.5 flex gap-1.5 pointer-events-none">
                  <span className="bg-black/80 px-2 py-0.5 rounded-full text-[8px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                    <Film className="w-2.5 h-2.5 text-apple-blue" /> Interactive Reel
                  </span>
                </div>

                {reel.make && (
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/85 backdrop-blur-md border border-white/10 px-2.5 py-1.5 rounded-lg flex items-center gap-2 pointer-events-none">
                    <Car className="w-3.5 h-3.5 text-apple-blue shrink-0" />
                    <span className="text-[10px] font-bold text-white truncate">
                      {reel.year} {reel.make} {reel.model}
                    </span>
                  </div>
                )}
              </div>

              {/* Stats & Description Section */}
              <div className="pt-3.5 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-[#86868B] font-mono mb-2">
                    <span className="flex items-center gap-1 hover:text-red-500 transition-colors">
                      <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> {reel.likesCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-apple-blue" /> {reel.commentsCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-apple-green" /> {reel.viewsCount || 0}
                    </span>
                  </div>

                  <p className="text-[11px] font-normal text-[#1D1D1F] dark:text-white line-clamp-2 leading-relaxed bg-[#F5F5F7] dark:bg-white/[0.02] px-3 py-2 rounded-xl border border-black/[0.02] dark:border-white/[0.02]">
                    {reel.caption || <span className="italic text-[#86868B]">No caption provided.</span>}
                  </p>
                </div>

                {/* Operations */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.04]">
                  <button
                    onClick={() => handleEditClick(reel)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-black/10 dark:border-white/10 text-[#1D1D1F] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors"
                  >
                    <Edit2 className="w-3 h-3" /> Edit Reel
                  </button>

                  <button
                    onClick={() => handleDeleteReel(reel.id, reel.caption)}
                    className="p-2 border border-red-500/20 text-red-500 hover:bg-red-500/5 rounded-xl transition-colors shrink-0"
                    title="Delete Reel"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialogue Modal */}
      <AnimatePresence>
        {editingReel && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingReel(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl z-15 flex flex-col p-5 gap-4 text-left outline-none"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-white flex items-center gap-1.5">
                    <Edit2 className="w-4 h-4 text-apple-blue" /> Edit Reel Attributes
                  </h3>
                  <span className="text-[8px] uppercase tracking-wider font-mono text-[#86868B] mt-0.5 block">Reel ID: {editingReel.id.slice(0, 8)}</span>
                </div>
                <button
                  onClick={() => setEditingReel(null)}
                  className="w-7 h-7 rounded-full bg-[#F5F5F7] dark:bg-white/5 flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-colors border-none"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Caption input */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#86868B] block">Caption & Tags</label>
                  <textarea
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    rows={3}
                    placeholder="Describe your vehicle loop or add trending tags..."
                    className="w-full bg-[#F5F5F7] dark:bg-white/5 p-2.5 rounded-xl text-xs outline-none border border-black/10 dark:border-white/10 text-[#1D1D1F] dark:text-white"
                  />
                </div>

                {/* Video URL input */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#86868B] block">Video URL</label>
                  <input
                    type="text"
                    value={editVideoUrl}
                    onChange={(e) => setEditVideoUrl(e.target.value)}
                    placeholder="Enter absolute MP4 video link"
                    className="w-full bg-[#F5F5F7] dark:bg-white/5 p-2.5 rounded-xl text-xs outline-none border border-black/10 dark:border-white/10 text-[#1D1D1F] dark:text-white font-mono"
                  />
                </div>

                {/* Link Listing selection */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-[#86868B] block">Linked Listing Car</label>
                  <select
                    value={editListingId}
                    onChange={(e) => setEditListingId(e.target.value)}
                    className="w-full bg-[#F5F5F7] dark:bg-white/5 p-2.5 rounded-xl text-xs outline-none border border-black/10 dark:border-white/10 text-[#1D1D1F] dark:text-white font-semibold"
                  >
                    <option value="demo_link_1" className="bg-white dark:bg-[#1D1D1F]">Demo Car Showcase (Fallback)</option>
                    {userVehicles.map((vehicle) => (
                      <option 
                        key={vehicle.id} 
                        value={vehicle.id}
                        className="bg-white dark:bg-[#1D1D1F]"
                      >
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Footer controls */}
              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingReel(null)}
                  className="flex-1 py-2.5 border border-black/10 dark:border-white/10 text-[#1D1D1F] dark:text-white rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-apple-blue text-white rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-blue-600 transition-all flex items-center justify-center gap-1.5 border-none shadow-md shadow-apple-blue/10"
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-3 h-3" /> Save Specs
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Loop overlay component */}
      <AnimatePresence>
        {showUploadModal && (
          <ReelsUpload onClose={() => setShowUploadModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
