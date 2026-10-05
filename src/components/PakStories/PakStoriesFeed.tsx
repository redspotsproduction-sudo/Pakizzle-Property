import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  Upload,
  Sparkles,
  MapPin,
  Building2,
  SlidersHorizontal,
  X,
  AlertTriangle,
  RefreshCw,
  Film
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PropertyVideo, VideoReport } from '../../types/video';
import { videoService, FALLBACK_VERIFIED_VIDEOS } from '../../services/videoService';
import PakStoryPlayer from './PakStoryPlayer';
import PakStoriesUploadModal from './PakStoriesUploadModal';
import { toast } from 'sonner';

export default function PakStoriesFeed() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialVideoId = searchParams.get('video');

  const [videos, setVideos] = useState<PropertyVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true); // Autoplay muted by default per platform principle
  const [selectedQuality, setSelectedQuality] = useState<'auto' | '360p' | '480p' | '720p'>('auto');

  // Filter Bar
  const [selectedCity, setSelectedCity] = useState<string>('All Pakistan');
  const [selectedType, setSelectedType] = useState<string>('');

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [reportingVideo, setReportingVideo] = useState<PropertyVideo | null>(null);
  const [reportReason, setReportReason] = useState<VideoReport['reason']>('misleading_property');
  const [reportDesc, setReportDesc] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch feed
  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      const res = await videoService.getFeed({
        city: selectedCity,
        propertyType: selectedType,
        quality: selectedQuality
      });

      const list = res.videos.length > 0 ? res.videos : FALLBACK_VERIFIED_VIDEOS;
      setVideos(list);

      // Deep link to specific video if requested in URL
      if (initialVideoId) {
        const foundIdx = list.findIndex(v => v.id === initialVideoId);
        if (foundIdx !== -1) {
          setCurrentIndex(foundIdx);
        }
      }
    } catch (e) {
      console.error(e);
      setVideos(FALLBACK_VERIFIED_VIDEOS);
    } finally {
      setLoading(false);
    }
  }, [selectedCity, selectedType, selectedQuality, initialVideoId]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // Keyboard navigation (Arrow keys + Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'm') {
        e.preventDefault();
        setIsMuted(prev => !prev);
      } else if (e.key === 'Escape') {
        navigate(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, videos.length]);

  const goToNext = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Wheel scrolling throttled
  const isScrollingRef = useRef(false);
  const handleWheel = (e: React.WheelEvent) => {
    if (isScrollingRef.current) return;
    if (Math.abs(e.deltaY) < 30) return;

    isScrollingRef.current = true;
    if (e.deltaY > 0) {
      goToNext();
    } else {
      goToPrev();
    }

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 600);
  };

  // Submit Video Report
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingVideo) return;

    try {
      setSubmittingReport(true);
      await videoService.reportVideo(
        reportingVideo.id,
        reportReason,
        reportDesc,
        reportingVideo.listingId
      );
      toast.success('Report submitted to moderation for immediate review');
      setReportingVideo(null);
      setReportDesc('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit report');
    } finally {
      setSubmittingReport(false);
    }
  };

  const currentVideo = videos[currentIndex];

  return (
    <div 
      ref={containerRef}
      onWheel={handleWheel}
      className="fixed inset-0 bg-[#0B0B0E] text-white flex flex-col z-[80] overflow-hidden select-none font-sans"
    >
      {/* Top Floating Navigation Header */}
      <header className="absolute top-0 inset-x-0 h-16 px-4 md:px-8 flex items-center justify-between z-30 pointer-events-none">
        {/* Back Button & Logo */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => navigate('/')}
            className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 hover:bg-black/80 transition-colors text-white cursor-pointer"
            title="Exit feed back to portal"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-white/90 to-[#F0A830] bg-clip-text text-transparent">
              PakStories™
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Verified Walkthroughs
            </span>
          </div>
        </div>

        {/* City Filter Pills (Quick switcher) */}
        <div className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 pointer-events-auto">
          {['All Pakistan', 'Lahore', 'Islamabad', 'Karachi'].map(city => (
            <button
              key={city}
              onClick={() => {
                setSelectedCity(city);
                setCurrentIndex(0);
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCity === city
                  ? 'bg-[#5B2A86] text-white shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Upload Walkthrough Action Button (Gated to verified sellers) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-3.5 py-2 rounded-full bg-gradient-to-r from-[#5B2A86] to-[#8A3DB8] hover:opacity-95 text-white text-xs font-black shadow-lg shadow-[#5B2A86]/30 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload Walkthrough</span>
            <span className="sm:hidden">Upload</span>
          </button>
        </div>
      </header>

      {/* Main Full-Screen Player Canvas */}
      <main className="flex-1 flex items-center justify-center relative w-full h-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-10 h-10 text-[#5B2A86] animate-spin" />
            <p className="text-xs font-bold text-white/70 uppercase tracking-widest">
              Buffering verified walkthroughs...
            </p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center p-8 max-w-md">
            <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-1">No Walkthroughs in {selectedCity}</h3>
            <p className="text-xs text-white/60 mb-4">
              Be the first verified agency or seller to upload a 9:16 walkthrough for this market.
            </p>
            <button
              onClick={() => setSelectedCity('All Pakistan')}
              className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold"
            >
              Show All Pakistan
            </button>
          </div>
        ) : (
          <div className="relative w-full max-w-[440px] h-full sm:h-[calc(100vh-32px)] sm:my-auto sm:rounded-[36px] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.8)] border border-white/10">
            {/* Slide Animator */}
            <AnimatePresence mode="wait">
              {currentVideo && (
                <motion.div
                  key={currentVideo.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full"
                >
                  <PakStoryPlayer
                    video={currentVideo}
                    isActive={true}
                    isMuted={isMuted}
                    onToggleMute={() => setIsMuted(prev => !prev)}
                    onOpenReport={(v) => setReportingVideo(v)}
                    onListingDeepLink={(listingId, refId) => {
                      navigate(`/property/${refId || listingId}`);
                    }}
                    selectedQuality={selectedQuality}
                    onSelectQuality={setSelectedQuality}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Performance Safeguard: Lazy preloader for immediately-next video ONLY */}
            {currentIndex + 1 < videos.length && (
              <video
                src={videos[currentIndex + 1].videoUrl}
                preload="metadata"
                className="hidden"
                aria-hidden="true"
              />
            )}
          </div>
        )}

        {/* Desktop Vertical Navigation Up/Down Chevrons */}
        <div className="hidden lg:flex flex-col gap-3 absolute right-8 top-1/2 -translate-y-1/2 z-30">
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/15 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer text-white shadow-xl hover:scale-105"
            title="Previous walkthrough (Up arrow)"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
          <div className="text-center font-mono text-[11px] font-bold text-white/60">
            {currentIndex + 1} / {videos.length}
          </div>
          <button
            onClick={goToNext}
            disabled={currentIndex === videos.length - 1}
            className="w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/15 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer text-white shadow-xl hover:scale-105"
            title="Next walkthrough (Down arrow)"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      </main>

      {/* Creator Upload Modal */}
      <PakStoriesUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          loadFeed();
          toast.success('Your walkthrough is now in the Shanakht™ moderation queue.');
        }}
      />

      {/* Flag / Report Video Modal */}
      <AnimatePresence>
        {reportingVideo && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReportingVideo(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#1C1C1E] rounded-3xl p-6 border border-white/15 text-white shadow-2xl z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold">Report Walkthrough</h3>
                </div>
                <button
                  onClick={() => setReportingVideo(null)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">
                    Reason for report
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-xs font-bold text-white outline-none"
                  >
                    <option value="misleading_property" className="text-black">Misleading property details or specs</option>
                    <option value="wrong_location" className="text-black">Incorrect location or society</option>
                    <option value="inappropriate_content" className="text-black">Inappropriate or non-property content</option>
                    <option value="spam_watermark" className="text-black">Spam, unapproved watermarks, or copyright issue</option>
                    <option value="other" className="text-black">Other violation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">
                    Additional notes for administration
                  </label>
                  <textarea
                    rows={3}
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    placeholder="Provide details about the issue..."
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportingVideo(null)}
                    className="px-4 py-2 rounded-xl bg-white/10 text-xs font-bold text-white hover:bg-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReport}
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white disabled:opacity-50"
                  >
                    {submittingReport ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
