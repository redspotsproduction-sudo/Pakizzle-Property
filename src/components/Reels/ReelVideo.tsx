import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Loader2, AlertCircle } from 'lucide-react';

interface ReelVideoProps {
  id: string;
  videoUrl: string;
  isActive: boolean;
  isMuted: boolean;
  onDoubleTap: (event: React.MouseEvent<HTMLDivElement>) => void;
  coverImage?: string;
  shouldLoad: boolean;
}

const isPlayableUrl = (url: string) => {
  if (!url) return false;
  return url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') || url.startsWith('./');
};

const getFallbackVideo = (id: string) => {
  const FALLBACK_VIDEOS = [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % FALLBACK_VIDEOS.length;
  return FALLBACK_VIDEOS[index];
};

const FALLBACK_CAR_IMAGES = [
  "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=85", // Porsche GT3
  "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=85", // Audi R8
  "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=85", // Ferrari
  "https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&w=1200&q=85", // Lamborghini
  "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=85", // McLaren
  "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=85", // Aston Martin DBS
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85", // Chevrolet Corvette C8
  "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1200&q=85", // Mercedes AMG GT
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=85", // BMW M4
  "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=85", // Tesla Roadster
  "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1200&q=85", // Range Rover
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85"  // Porsche Sunset
];

const getFallbackCarImage = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % FALLBACK_CAR_IMAGES.length;
  return FALLBACK_CAR_IMAGES[index];
};

export default function ReelVideo({ id, videoUrl, isActive, isMuted, onDoubleTap, coverImage, shouldLoad }: ReelVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [progress, setProgress] = useState(0);
  const [playError, setPlayError] = useState(false);
  const [showPlayStateIndicator, setShowPlayStateIndicator] = useState<'play' | 'pause' | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [activeUrl, setActiveUrl] = useState(videoUrl);
  const [hasFallbackUsed, setHasFallbackUsed] = useState(false);

  useEffect(() => {
    setActiveUrl(videoUrl);
    setHasFallbackUsed(false);
  }, [videoUrl]);

  const playable = shouldLoad && isPlayableUrl(activeUrl);

  // Progress Simulation Effect for fallback walkthrough slideshow loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (playError && isActive) {
      setProgress(0);
      const startTime = Date.now();
      const duration = 12000; // 12 seconds loop
      interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) % duration;
        setProgress((elapsed / duration) * 100);
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [playError, isActive]);

  // Playback control effect
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playable) {
      setIsBuffering(true);
      setIsPlaying(false);
      return;
    }

    if (isActive) {
      video.muted = isMuted;
      setIsBuffering(true);
      setPlayError(false);

      // Force video component to reload high performance buffer when source shifts
      video.load();

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsBuffering(false);
          })
          .catch((error) => {
            console.warn("Autoplay block detected or playback interrupted:", error);
            setIsPlaying(false);
            setIsBuffering(false);
            setPlayError(true);
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
      setIsBuffering(false);
    }
  }, [isActive, isMuted, activeUrl, playable]);

  // Support central keyboard-space play/pause toggles or direct window calls
  useEffect(() => {
    const handleToggleEvent = (e: Event) => {
      if (!isActive) return;
      const video = videoRef.current;
      if (video && playable) {
        if (isPlaying) {
          video.pause();
          setIsPlaying(false);
          setShowPlayStateIndicator('pause');
        } else {
          setPlayError(false);
          video.muted = isMuted;
          video.play()
            .then(() => {
              setIsPlaying(true);
              setShowPlayStateIndicator('play');
            })
            .catch(() => {
              setShowPlayStateIndicator('pause');
            });
        }
        setTimeout(() => setShowPlayStateIndicator(null), 700);
      }
    };

    window.addEventListener('reels-toggle-play', handleToggleEvent);
    return () => {
      window.removeEventListener('reels-toggle-play', handleToggleEvent);
    };
  }, [isActive, isPlaying, isMuted, playable]);

  // Handle play/pause toggle with micro double-click distinction
  const handleSingleOrDoubleTap = (event: React.MouseEvent<HTMLDivElement>) => {
    if (clickTimeoutRef.current) {
      // Double tap detected!
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      onDoubleTap(event);
    } else {
      // Setup window for single tap
      clickTimeoutRef.current = setTimeout(() => {
        // Single tap confirmed! Toggle Play/Pause
        const video = videoRef.current;
        if (video && playable) {
          if (isPlaying) {
            video.pause();
            setIsPlaying(false);
            setShowPlayStateIndicator('pause');
          } else {
            setPlayError(false);
            video.muted = isMuted;
            video.play()
              .then(() => {
                setIsPlaying(true);
                setShowPlayStateIndicator('play');
              })
              .catch(() => {
                setShowPlayStateIndicator('pause');
              });
          }
          setTimeout(() => setShowPlayStateIndicator(null), 700);
        }
        clickTimeoutRef.current = null;
      }, 220); // Quick responsiveness
    }
  };

  // Clean timeouts on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className="absolute inset-0 w-full h-full cursor-pointer select-none overflow-hidden"
      onClick={handleSingleOrDoubleTap}
    >
      {/* Cinematic Ken Burns Fallback Walkthrough when codec or video loading fails */}
      {playError && (
        <div className="absolute inset-0 w-full h-full overflow-hidden select-none z-0">
          <img
            src={coverImage || getFallbackCarImage(id)}
            alt="Showcase Walkthrough fallback"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover animate-ken-burns"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85 pointer-events-none" />
          
          {/* Subtle premium cinematic active status indicator */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-mono font-extrabold tracking-widest text-emerald-400 uppercase">Cinema Walkthrough</span>
          </div>
        </div>
      )}

      {playable && activeUrl ? (
        <video
          ref={videoRef}
          src={activeUrl}
          preload={isActive ? "auto" : (shouldLoad ? "auto" : "none")}
          poster={coverImage || undefined}
          className={playError ? "hidden" : "w-full h-full object-cover"}
          loop
          muted={isMuted}
          playsInline
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => {
            setIsBuffering(false);
            setIsPlaying(true);
          }}
          onCanPlay={() => setIsBuffering(false)}
          onTimeUpdate={(e) => {
            const video = e.currentTarget;
            const percentage = (video.currentTime / video.duration) * 100 || 0;
            setProgress(percentage);
          }}
          onError={(e) => {
            if (playable) {
              const errorCode = e.currentTarget?.error?.code;
              const errorMsg = e.currentTarget?.error?.message;
              console.warn("Video element reported loading failure:", activeUrl, `Code: ${errorCode}, Message: ${errorMsg}`);
              
              if (!hasFallbackUsed) {
                const fallback = getFallbackVideo(id);
                console.warn("Attempting high-availability hot-swap fallback URL:", fallback);
                setHasFallbackUsed(true);
                setActiveUrl(fallback);
                setPlayError(false);
                setIsBuffering(true);
              } else {
                setIsBuffering(false);
                setPlayError(true);
              }
            }
          }}
        />
      ) : null}

      {/* Floating Center Feedback Animations */}
      {isBuffering && !playError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[2px] z-20 pointer-events-none">
          <div className="bg-black/60 p-4 rounded-2xl border border-white/10 flex flex-col items-center gap-2 shadow-xl">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <span className="text-[10px] font-mono tracking-widest uppercase font-extrabold text-blue-400">CONNECTING STREAM</span>
          </div>
        </div>
      )}

      {playError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/35 backdrop-blur-[1.5px] z-20 animate-fade-in pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-16 h-16 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl transition-all">
              <div className="absolute inset-0 bg-white/5 rounded-full animate-ping opacity-20" />
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Tap to play cinematic showcase</span>
          </div>
        </div>
      )}

      {showPlayStateIndicator && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none animate-ping">
          <div className="w-16 h-16 rounded-full bg-black/65 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
            {showPlayStateIndicator === 'play' ? (
              <Play className="w-6 h-6 text-emerald-400 fill-emerald-400 ml-1" />
            ) : (
              <Pause className="w-6 h-6 text-orange-400 fill-orange-400" />
            )}
          </div>
        </div>
      )}

      {/* Micro Progress Line Tracker */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-30 pointer-events-none">
        <div 
          className="h-full bg-gradient-to-r from-red-500 via-[#0071e3] to-blue-400 transition-all duration-150 ease-linear shadow-[0_0_8px_#0071e3]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
