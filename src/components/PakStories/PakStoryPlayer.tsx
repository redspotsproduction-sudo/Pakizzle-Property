import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Bookmark,
  Share2,
  Volume2,
  VolumeX,
  MapPin,
  Building2,
  ExternalLink,
  ShieldCheck,
  Flag,
  ChevronRight,
  Sparkles,
  Info,
  Check,
  Play,
  Pause,
  SlidersHorizontal,
  RefreshCw,
  Eye
} from 'lucide-react';
import { PropertyVideo } from '../../types/video';
import { videoService } from '../../services/videoService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface PakStoryPlayerProps {
  video: PropertyVideo;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenReport: (video: PropertyVideo) => void;
  onListingDeepLink: (listingId: string, referenceId?: string) => void;
  selectedQuality: 'auto' | '360p' | '480p' | '720p';
  onSelectQuality: (q: 'auto' | '360p' | '480p' | '720p') => void;
}

export default function PakStoryPlayer({
  video,
  isActive,
  isMuted,
  onToggleMute,
  onOpenReport,
  onListingDeepLink,
  selectedQuality,
  onSelectQuality
}: PakStoryPlayerProps) {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(video.stats?.likesCount || 0);
  const [hasSaved, setHasSaved] = useState(false);
  const [savesCount, setSavesCount] = useState(video.stats?.savesCount || 0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showFormulaTooltip, setShowFormulaTooltip] = useState(false);
  const [videoLoadError, setVideoLoadError] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);

  // Play / Pause handling with prefers-reduced-motion check
  useEffect(() => {
    if (!videoRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isActive) {
      setVideoLoadError(false);
      setIsLoadingVideo(true);

      if (prefersReducedMotion) {
        setIsPlaying(false);
        videoRef.current.pause();
      } else {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
          setIsLoadingVideo(false);
          // Track view interaction
          videoService.interact(video.id, 'view');
        }).catch(err => {
          console.warn('[PakStoryPlayer] Autoplay prevented:', err);
          setIsPlaying(false);
          setIsLoadingVideo(false);
        });
      }
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isActive, video.id]);

  // Track watch time upon leaving active slide
  useEffect(() => {
    let watchStart = Date.now();
    return () => {
      if (isActive && watchStart) {
        const sec = Math.round((Date.now() - watchStart) / 1000);
        if (sec > 1) {
          videoService.interact(video.id, 'watch_time', { watchTimeSec: sec });
        }
      }
    };
  }, [isActive, video.id]);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleLike = () => {
    if (hasLiked) {
      setHasLiked(false);
      setLikesCount(prev => Math.max(0, prev - 1));
    } else {
      setHasLiked(true);
      setLikesCount(prev => prev + 1);
      videoService.interact(video.id, 'like');
      toast.success('Added to your liked walkthroughs');
    }
  };

  const handleSave = () => {
    if (hasSaved) {
      setHasSaved(false);
      setSavesCount(prev => Math.max(0, prev - 1));
    } else {
      setHasSaved(true);
      setSavesCount(prev => prev + 1);
      videoService.interact(video.id, 'save');
      toast.success('Saved walkthrough to your collection');
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/stories?video=${video.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: `Check out this verified walkthrough on PakStories: ${video.title}`,
          url
        });
        videoService.interact(video.id, 'share');
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      videoService.interact(video.id, 'share');
      toast.success('Walkthrough link copied to clipboard');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      toast.error('Could not copy link');
    }
  };

  const handleDeepLinkClick = () => {
    videoService.interact(video.id, 'listing_click');
    onListingDeepLink(video.listingId, video.listingReferenceId);
  };

  // Determine effective stream source based on quality selection
  const fallbackUrl = '/videos/walkthrough_villa.mp4';
  const effectiveUrl =
    (selectedQuality === '360p' && video.renditions?.['360p'])
      ? video.renditions['360p']
      : (selectedQuality === '480p' && video.renditions?.['480p'])
      ? video.renditions['480p']
      : (selectedQuality === '720p' && video.renditions?.['720p'])
      ? video.renditions['720p']
      : (video.videoUrl || fallbackUrl);

  return (
    <div className="relative w-full h-full bg-black select-none overflow-hidden flex items-center justify-center">
      {/* Video Stream Element */}
      <video
        ref={videoRef}
        src={effectiveUrl}
        loop
        playsInline
        muted={isMuted}
        onClick={togglePlayPause}
        onLoadedData={() => {
          setIsLoadingVideo(false);
          setVideoLoadError(false);
        }}
        onError={(e) => {
          // If remote url failed, gracefully try local fallback video before giving up
          const target = e.currentTarget;
          if (target && target.src && !target.src.includes('/videos/walkthrough_')) {
            target.src = fallbackUrl;
            target.load();
            target.play().catch(() => {});
          } else {
            setVideoLoadError(true);
            setIsLoadingVideo(false);
          }
        }}
        className="w-full h-full object-cover cursor-pointer"
        poster={video.thumbnailUrl}
      />

      {/* Loading Skeleton Indicator */}
      {isLoadingVideo && isActive && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center pointer-events-none">
          <RefreshCw className="w-8 h-8 text-white/80 animate-spin" />
        </div>
      )}

      {/* Graceful Degradation / Retry State */}
      {videoLoadError && (
        <div className="absolute inset-0 bg-neutral-900 flex flex-col items-center justify-center p-6 text-center text-white z-20">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-3">
            <RefreshCw className="w-6 h-6 text-white" />
          </div>
          <h4 className="text-base font-bold mb-1">Video Stream Interrupted</h4>
          <p className="text-xs text-white/70 max-w-xs mb-4">
            Unable to stream video rendition over this connection. The listing details remain fully accessible.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setVideoLoadError(false);
                setIsLoadingVideo(true);
                if (videoRef.current) {
                  videoRef.current.load();
                  videoRef.current.play();
                }
              }}
              className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold"
            >
              Retry Video
            </button>
            <button
              onClick={handleDeepLinkClick}
              className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold"
            >
              View Listing
            </button>
          </div>
        </div>
      )}

      {/* Dark Readability Scrims */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50 pointer-events-none" />

      {/* Play / Pause Tap Splash Indicator */}
      {!isPlaying && !isLoadingVideo && (
        <div 
          onClick={togglePlayPause}
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
        >
          <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* ================= TOP CONTROLS ROW ================= */}
      <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20 text-white">
        {/* Brand Tag & Ranking Boost Badge */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/15 text-[#F0A830] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#F0A830]" />
            <span>PakStories™</span>
          </span>

          {video.isFeatured && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#5B2A86]/80 backdrop-blur-md border border-white/20 text-white">
              Featured Walkthrough
            </span>
          )}

          {/* Explainable Sorting Formula Pill */}
          <div className="relative">
            <button
              onClick={() => setShowFormulaTooltip(!showFormulaTooltip)}
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1 text-white/80"
              title="View discovery ranking score details"
            >
              <Info className="w-2.5 h-2.5 text-[#F0A830]" />
              <span>Score: {video.sortBoostScore ? Math.round(video.sortBoostScore) : '85'}</span>
            </button>

            {showFormulaTooltip && (
              <div className="absolute left-0 top-7 w-64 p-3 rounded-2xl bg-black/95 backdrop-blur-xl border border-white/15 text-white shadow-2xl text-[11px] leading-relaxed z-30">
                <span className="font-bold text-[#F0A830] block mb-1">Explainable Ranking Formula:</span>
                <p className="text-white/80 text-[10px]">
                  Score = (45% Recency) + (35% Engagement Likes/Shares) + (20% Listing CTR)
                  {video.isFeatured ? ' + 50 Featured Bonus' : ''}
                </p>
                <div className="mt-2 pt-2 border-t border-white/10 text-[9px] text-white/60">
                  Phase 1 transparent scoring. No black-box algorithms.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Controls: Audio Mute & Adaptive Quality Selector */}
        <div className="flex items-center gap-2">
          {/* Quality Selector */}
          <div className="relative">
            <button
              onClick={() => setShowQualityMenu(!showQualityMenu)}
              className="px-2 py-1 rounded-xl bg-black/50 backdrop-blur-md border border-white/15 text-[10px] font-bold uppercase tracking-wider hover:bg-black/70 flex items-center gap-1"
            >
              <SlidersHorizontal className="w-3 h-3 text-[#F0A830]" />
              <span>{selectedQuality}</span>
            </button>

            {showQualityMenu && (
              <div className="absolute right-0 top-8 w-28 p-1.5 rounded-xl bg-black/95 backdrop-blur-xl border border-white/20 shadow-xl space-y-1 z-30">
                {(['auto', '360p', '480p', '720p'] as const).map(q => (
                  <button
                    key={q}
                    onClick={() => {
                      onSelectQuality(q);
                      setShowQualityMenu(false);
                      toast.success(`Playback set to ${q.toUpperCase()}`);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold capitalize flex items-center justify-between ${
                      selectedQuality === q ? 'bg-[#5B2A86] text-white' : 'hover:bg-white/10 text-white/80'
                    }`}
                  >
                    <span>{q}</span>
                    {selectedQuality === q && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sound Mute Toggle Button */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/15 hover:bg-black/70 transition-colors"
            title={isMuted ? 'Unmute (sound on)' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-white" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        </div>
      </div>

      {/* ================= RIGHT ACTION SIDEBAR ================= */}
      <div className="absolute right-3.5 bottom-28 flex flex-col items-center gap-4 z-20">
        {/* Like Button */}
        <button
          onClick={handleLike}
          className="flex flex-col items-center gap-1 group cursor-pointer"
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all backdrop-blur-md border ${
            hasLiked
              ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/30 scale-105'
              : 'bg-black/50 border-white/15 text-white hover:bg-black/70'
          }`}>
            <Heart className={`w-5 h-5 ${hasLiked ? 'fill-white' : ''}`} />
          </div>
          <span className="text-[11px] font-black text-white drop-shadow">
            {likesCount}
          </span>
        </button>

        {/* Save / Bookmark Button */}
        <button
          onClick={handleSave}
          className="flex flex-col items-center gap-1 group cursor-pointer"
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all backdrop-blur-md border ${
            hasSaved
              ? 'bg-[#5B2A86] border-[#8A3DB8] text-white shadow-lg scale-105'
              : 'bg-black/50 border-white/15 text-white hover:bg-black/70'
          }`}>
            <Bookmark className={`w-5 h-5 ${hasSaved ? 'fill-white' : ''}`} />
          </div>
          <span className="text-[11px] font-black text-white drop-shadow">
            {savesCount}
          </span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1 group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
            {copiedLink ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
          </div>
          <span className="text-[11px] font-black text-white drop-shadow">
            {video.stats?.sharesCount || 0}
          </span>
        </button>

        {/* Report Flag Button */}
        <button
          onClick={() => onOpenReport(video)}
          className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-red-400 hover:bg-black/60 transition-colors"
          title="Report inappropriate or misleading walkthrough"
        >
          <Flag className="w-4 h-4" />
        </button>
      </div>

      {/* ================= BOTTOM DETAILS OVERLAY ================= */}
      <div className="absolute bottom-5 inset-x-4 pr-16 z-20 text-white pointer-events-auto space-y-2">
        {/* Creator Info with Verified Badge */}
        <div className="flex items-center gap-2">
          <img
            src={video.creatorAvatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80'}
            alt={video.creatorName}
            className="w-9 h-9 rounded-full object-cover border-2 border-white/30 shadow-md"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-white drop-shadow-md">
                {video.creatorName}
              </span>
              {/* Shanakht Verified Badge */}
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-blue-500 text-white shadow-xs"
                title="Shanakht™ Verified Seller / Agency"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>{video.creatorBadge === 'business' ? 'Verified Agency' : 'Verified ID'}</span>
              </span>
            </div>
            <span className="text-[10px] text-white/70 font-semibold">
              Listing #{video.listingReferenceId || '3421789'}
            </span>
          </div>
        </div>

        {/* Video Caption */}
        <p className="text-xs text-white/90 font-medium line-clamp-2 leading-relaxed drop-shadow-md">
          {video.caption || video.title}
        </p>

        {/* Baked On-Screen Specs Overlay Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {/* Price Pill */}
          <div className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#5B2A86] to-[#7534AB] text-white text-xs font-black shadow-md border border-white/20">
            {video.overlaySpec?.priceText || 'PKR Inquire'}
          </div>

          {/* Location Badge */}
          <div className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-bold text-white flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#F0A830]" />
            <span>{video.overlaySpec?.locationText || 'Prime Location'}</span>
          </div>

          {/* Key Specs */}
          {video.overlaySpec?.keySpecs?.slice(0, 3).map((spec, i) => (
            <div key={i} className="px-2 py-1 rounded-lg bg-white/15 backdrop-blur-md text-[10px] font-bold text-white/90">
              {spec}
            </div>
          ))}
        </div>

        {/* Clear "View Full Listing" Deep-Link Funnel Action */}
        <div className="pt-2">
          <button
            onClick={handleDeepLinkClick}
            className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs flex items-center justify-between shadow-2xl transition-all active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <Building2 className="w-4 h-4 text-[#5B2A86]" />
              <span className="truncate">View Full Verified Property Details</span>
            </div>
            <div className="flex items-center gap-1 text-[#5B2A86] shrink-0 font-black">
              <span>Deep Link</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
