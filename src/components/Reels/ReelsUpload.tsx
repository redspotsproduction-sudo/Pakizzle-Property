import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Upload, 
  Play, 
  Loader2, 
  CheckCircle2, 
  FileText, 
  Tag, 
  Clock, 
  Check, 
  Car, 
  Bookmark,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { motion } from 'motion/react';
import { auth, db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { reelsService } from '../../services/reelsService';
import { toast } from 'sonner';
import { storeLocalVideo } from '../../utils/videoDb';

interface ReelsUploadProps {
  onClose: () => void;
}

interface VehicleDropdownItem {
  id: string;
  make: string;
  model: string;
  price: number;
  year: number;
  condition: string;
  variant?: string;
}

// Stunning public loop videos for selection so users can play with beautiful samples immediately
const LUX_DEMO_VIDEOS = [
  { name: '1 Kanal Luxury Villa Walkthrough', url: '/videos/walkthrough_villa.mp4', category: 'Showroom' },
  { name: 'Margalla View Penthouse Tour', url: '/videos/walkthrough_penthouse.mp4', category: 'Cinematic' },
  { name: 'Seafront Architectural Mansion', url: '/videos/walkthrough_mansion.mp4', category: 'Interior' },
  { name: 'Smart Home Automation Tour', url: '/videos/walkthrough_smart_home.mp4', category: 'Highway' }
];

export default function ReelsUpload({ onClose }: ReelsUploadProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [userVehicles, setUserVehicles] = useState<VehicleDropdownItem[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [videoUrl, setVideoUrl] = useState(LUX_DEMO_VIDEOS[0].url);
  const [customVideoFile, setCustomVideoFile] = useState<File | null>(null);
  
  const [caption, setCaption] = useState('');
  const [hook, setHook] = useState('');
  const [tags, setTags] = useState('#Pakizzle #LuxuryCars #Supra');
  
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  const [customUrlInput, setCustomUrlInput] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 60 * 1024 * 1024) {
        toast.error("Video exceeds 60MB design limit.");
        return;
      }
      setCustomVideoFile(file);
      const objUrl = URL.createObjectURL(file);
      setVideoUrl(objUrl);
      toast.success(`Loaded "${file.name}" for local showcase preview! 🎬`);
    }
  };

  const handleCustomUrlApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    if (!customUrlInput.startsWith('http')) {
      toast.error('Please provide a valid HTTP/HTTPS URL.');
      return;
    }
    setVideoUrl(customUrlInput.trim());
    setCustomVideoFile(null); // Clear local file reference
    toast.success('Applied custom cinematic link!');
  };

  const currentUser = auth.currentUser;

  // Retrieve authorized user listings to link reels directly
  useEffect(() => {
    async function fetchUserVehicles() {
      if (!currentUser) return;
      setIsLoadingVehicles(true);
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
            year: data.year || 2024,
            condition: data.condition || 'Used',
            variant: data.variant || ''
          });
        });

        setUserVehicles(list);
        if (list.length > 0) {
          setSelectedVehicleId(list[0].id);
        }
      } catch (e) {
        console.warn("Error loading listings for reels selector:", e instanceof Error ? e.message : String(e));
      } finally {
        setIsLoadingVehicles(false);
      }
    }

    fetchUserVehicles();
  }, [currentUser]);

  // Hook up server-side Gemini AI script copywriter
  const handleGenerateAICopy = async () => {
    const activeVehicle = userVehicles.find(v => v.id === selectedVehicleId);
    
    // Fallback info if user doesn't have listings yet to guarantee beautiful content regardless
    const vehiclePayload = activeVehicle ? {
      year: activeVehicle.year,
      make: activeVehicle.make,
      model: activeVehicle.model,
      variant: activeVehicle.variant,
      price: activeVehicle.price,
      condition: activeVehicle.condition
    } : {
      year: 2024,
      make: 'Nissan',
      model: 'GT-R Nismo',
      variant: 'Carbon Pack',
      price: 135000000,
      condition: 'Immaculate'
    };

    setIsGeneratingAI(true);
    try {
      const generated = await reelsService.generateAICaption(vehiclePayload);
      setHook(generated.hook);
      setCaption(generated.caption);
      setTags(generated.hashtags);
      toast.success("AI script optimized & loaded instantly! ✨");
    } catch (e) {
      toast.error("AI is busy crafting. Please try in a second.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Publish video Showcase Reel to real-time feed
  const handlePublishReel = async () => {
    if (!currentUser) {
      toast.error("Please sign in to publish active asset reels");
      return;
    }

    const linkedVehicle = userVehicles.find(v => v.id === selectedVehicleId);
    
    setIsPublishing(true);
    try {
      let finalVideoUrl = videoUrl;

      if (customVideoFile) {
        // Generate a clean local-reel identifier
        const localId = `local-reel-${Date.now()}`;
        try {
          await storeLocalVideo(localId, customVideoFile);
          finalVideoUrl = localId;
        } catch (dbErr) {
          console.warn("IndexedDB local storage failed:", dbErr instanceof Error ? dbErr.message : String(dbErr));
          // Fallback if indexedDB fails completely
          finalVideoUrl = LUX_DEMO_VIDEOS[0].url;
        }
      } else if (videoUrl.startsWith('blob:')) {
        finalVideoUrl = LUX_DEMO_VIDEOS[0].url;
      }

      await reelsService.createReel({
        videoUrl: finalVideoUrl,
        caption: `${hook ? `⭐ ${hook}\n\n` : ''}${caption}\n\n${tags}`,
        listingId: selectedVehicleId || 'demo_link_1',
        sellerId: currentUser.uid,
        sellerName: currentUser.displayName || currentUser.email || 'Verified Partner',
        sellerAvatar: currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      });

      toast.success("Your Cinematic Reel has been published globally! 🏎️🎬");
      onClose();
    } catch (e) {
      console.warn("Reel publishing failed:", e instanceof Error ? e.message : String(e));
      toast.error("Could not write showcase reel. Check database connection.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl h-[90vh] bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden flex flex-col sm:flex-row shadow-2xl relative"
      >
        
        {/* Close Button Trigger */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all border border-white/10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* STEP 1: SELECT SOURCE CINEMATIC MEDIA */}
        {step === 1 && (
          <div className="flex-1 flex flex-col sm:flex-row h-full">
            {/* Left side info banner */}
            <div className="w-full sm:w-1/3 bg-zinc-900/40 p-8 border-r border-white/5 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[9px] text-blue-400 tracking-[0.2em] uppercase font-bold">Launchpad Creator</span>
                <h2 className="text-xl font-black text-white tracking-tight mt-2 leading-tight">Elevate Seller Showcase</h2>
                <p className="text-xs text-white/50 leading-relaxed mt-3">
                  Dynamic video reels generate up to <span className="text-emerald-400 font-bold">140% higher buyer intent</span> compared to standard flat photos. Perfect the capture loops.
                </p>

                <div className="space-y-4 mt-8">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-mono text-xs font-bold">01</div>
                    <p className="text-xs text-white/70 leading-relaxed">Choose one of our premium preset loops OR drop your cinematic MP4 file.</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-mono text-xs font-bold">02</div>
                    <p className="text-xs text-white/70 leading-relaxed">Select your active marketplace listing to link buyers directly.</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-mono text-xs font-bold">03</div>
                    <p className="text-xs text-white/70 leading-relaxed">Use AI copywriter to compose high-impact trending captions.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 font-mono text-[8px] text-white/30 tracking-widest uppercase">
                Pakizzle Studio Suite
              </div>
            </div>

            {/* Right side selector space */}
            <div className="flex-1 p-8 flex flex-col justify-between overflow-y-auto w-full md:w-2/3">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 uppercase font-mono text-xs text-white/70">
                  <Play className="w-4 h-4 text-blue-400" /> Select Loop Video
                </h3>

                {/* Preset Loops Grid Showcase with scroll area containing 11 stunning videos */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin">
                  {LUX_DEMO_VIDEOS.map((vid, idx) => (
                    <div 
                      key={vid.url + idx}
                      onClick={() => setVideoUrl(vid.url)}
                      className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer border transition-all ${
                        videoUrl === vid.url 
                          ? 'border-blue-500/50 shadow-lg ring-1 ring-blue-500/20 scale-[1.01]' 
                          : 'border-white/5 hover:border-white/15'
                      }`}
                    >
                      <video 
                        src={vid.url} 
                        muted 
                        playsInline 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="w-full h-full object-cover pointer-events-none" 
                      />
                      <div className="absolute inset-0 bg-black/50 hover:bg-black/20 transition-all flex flex-col justify-between p-2">
                        <span className="self-end px-1.5 py-0.5 rounded bg-black/60 text-[7px] font-bold text-blue-400 uppercase tracking-widest">{vid.category}</span>
                        <span className="text-[10px] font-bold text-white truncate max-w-full">{vid.name}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Custom File Uploader & Link Inputs */}
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-mono text-white/40 font-bold">Or Add Your Own Media</span>
                    {customVideoFile && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-mono font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> {customVideoFile.name}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Real Video File input */}
                    <div 
                      onClick={() => document.getElementById('reel-video-file-input')?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer flex flex-col items-center justify-center group ${
                        customVideoFile 
                          ? 'border-emerald-500/50 bg-emerald-500/5' 
                          : 'border-white/5 bg-white/2 hover:border-blue-500/30'
                      }`}
                    >
                      <input 
                        id="reel-video-file-input"
                        type="file"
                        accept="video/mp4,video/quicktime,video/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Upload className={`w-8 h-8 transition-colors ${customVideoFile ? 'text-emerald-400' : 'text-white/30 group-hover:text-blue-400'}`} />
                      <span className="text-xs font-bold text-white mt-1.5 text-center">
                        {customVideoFile ? 'Replace video' : 'Upload custom video'}
                      </span>
                      <span className="text-[9px] text-white/30 font-mono mt-0.5">supports MP4 & MOV up to 60MB</span>
                    </div>

                    {/* Custom URL Paste Box */}
                    <div className="border border-white/5 rounded-2xl p-5 bg-white/2 flex flex-col justify-between text-left">
                      <div>
                        <span className="text-xs font-bold text-white block">Cinematic Stream URL</span>
                        <span className="text-[9px] text-white/45 leading-tight block mt-1">
                          Paste a hosted premium stream link (e.g. from discord, mixkit or custom CDN) to use globally.
                        </span>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={customUrlInput}
                            onChange={(e) => setCustomUrlInput(e.target.value)}
                            placeholder="e.g. https://cdn.com/drive.mp4"
                            className="flex-1 min-w-0 bg-white/5 focus:bg-white/10 hover:bg-white/7 focus:outline-none border border-white/5 p-2 px-3 rounded-xl text-xs text-white placeholder-white/20 transition-all font-medium"
                          />
                          <button 
                            type="button"
                            onClick={handleCustomUrlApply}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs px-3 py-2 rounded-xl transition-all"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Smart fallback helper banner */}
                  {customVideoFile && (
                    <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl text-[10px] text-blue-300 leading-relaxed text-left">
                      💡 <strong>Browser Preview Active:</strong> Custom local files play and render beautifully inside your browser session. For persistent multi-user playback across other accounts, the cloud feed automatically binds a premium matching preset cover unless you supply a public streaming link.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/5">
                <button 
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-xl text-xs font-bold text-white shadow-lg shadow-blue-500/20 flex items-center gap-2 select-none"
                >
                  Continue to Script Details <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: LINK LISTING, CALL GEMINI AI SCRIPT, PUBLISH */}
        {step === 2 && (
          <div className="flex-1 flex flex-col sm:flex-row h-full">
            
            {/* Left side preview */}
            <div className="hidden sm:flex w-2/5 border-r border-white/5 bg-black p-6 flex-col justify-between items-center relative overflow-hidden">
              <span className="absolute top-4 left-6 z-20 font-mono text-[9px] text-[var(--brand-blue)] tracking-widest font-bold uppercase">Aesthetic Preview</span>
              {videoUrl ? (
                <video 
                  src={videoUrl} 
                  muted 
                  autoPlay 
                  loop 
                  playsInline 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 filter blur-[1px]" 
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/45 pointer-events-none" />

              {/* Simulated Overlay */}
              <div className="w-full h-full flex flex-col justify-end z-10 text-left space-y-3 pointer-events-none">
                <div className="space-y-1.5 bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[9px] font-mono tracking-wider font-bold text-blue-400">Preview Mode</span>
                  </div>
                  {hook && <p className="text-xs font-bold text-yellow-400">🔥 {hook}</p>}
                  <p className="text-[11px] text-white/95 leading-relaxed truncate-3-lines">
                    {caption || "Compose premium text script or tap the sparkling Gemini write icon to the right to load creative copies."}
                  </p>
                  <p className="text-[10px] font-mono text-[var(--brand-blue)]">{tags}</p>
                </div>
              </div>
            </div>

            {/* Right side form and AI Generator */}
            <div className="flex-1 p-8 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-5 text-left">
                
                {/* Vehicle Selection dropdown */}
                <div>
                  <label className="text-xs font-black text-white/50 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <Car className="w-3.5 h-3.5 text-blue-400" /> Link Product Listing
                  </label>
                  
                  {isLoadingVehicles ? (
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> Cataloging user assets...
                    </div>
                  ) : userVehicles.length === 0 ? (
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-white/45 leading-relaxed">
                      You do not have any active vehicle listings under your verified account. Creating demo showcase link.
                    </div>
                  ) : (
                    <select
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="w-full bg-white/5 hover:bg-white/10 pointer-events-auto border border-white/5 p-3 rounded-xl text-xs text-white font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    >
                      {userVehicles.map(veh => (
                        <option key={veh.id} value={veh.id} className="bg-zinc-950">
                          {veh.year} {veh.make} {veh.model} {veh.variant} — PKR {(veh.price / 100000).toFixed(1)} Lac
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* AI-Powered Script Button */}
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-950/20 via-purple-950/10 to-transparent p-4 rounded-2xl border border-blue-500/20 relative group">
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" /> AI Script Generator
                    </h4>
                    <p className="text-[10px] text-white/45 leading-tight mt-1">Compose highly aesthetic, scroll-stopping copy for TikTok and Reels automatically.</p>
                  </div>
                  <button
                    onClick={handleGenerateAICopy}
                    disabled={isGeneratingAI}
                    className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500 border border-blue-500/30 text-blue-400 hover:text-white transition-all rounded-xl text-xs font-bold flex items-center gap-1 px-4 py-2 shadow-lg hover:scale-102"
                  >
                    {isGeneratingAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    Compose
                  </button>
                </div>

                {/* Script details form inputs */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-white/40 uppercase tracking-widest pl-1">Hook Line</label>
                    <input 
                      type="text" 
                      value={hook}
                      onChange={(e) => setHook(e.target.value)}
                      placeholder="e.g. Look at this pristine sleeper build sleeper beast..."
                      className="w-full bg-white/5 focus:bg-white/10 hover:bg-white/7 focus:outline-none border border-white/5 p-3 rounded-xl text-xs text-white font-medium focus:ring-1 focus:ring-blue-500 mt-1 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/40 uppercase tracking-widest pl-1">Description Script</label>
                    <textarea 
                      rows={3}
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Describe the aesthetic modifications, spec profiles, or delivery availability..."
                      className="w-full bg-white/5 focus:bg-white/10 hover:bg-white/7 focus:outline-none border border-white/5 p-3 rounded-xl text-xs text-white font-medium focus:ring-1 focus:ring-blue-500 mt-1 transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/40 uppercase tracking-widest pl-1">Trending Tags</label>
                    <input 
                      type="text" 
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="#Pakizzle #Motorsports #Classic"
                      className="w-full bg-white/5 focus:bg-white/10 hover:bg-white/7 focus:outline-none border border-white/5 p-3 rounded-xl text-xs text-white font-medium focus:ring-1 focus:ring-blue-500 mt-1 transition-all"
                    />
                  </div>
                </div>

              </div>

              {/* Action trigger footer */}
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/5">
                <button 
                  onClick={() => setStep(1)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-xs font-semibold border border-white/5 transition-all"
                >
                  Change Media
                </button>
                <button 
                  onClick={handlePublishReel}
                  disabled={isPublishing}
                  className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-45 rounded-xl text-xs font-bold text-white shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all hover:scale-102"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Digitizing Showcase Stream...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" /> Go Live On Stream
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
}
