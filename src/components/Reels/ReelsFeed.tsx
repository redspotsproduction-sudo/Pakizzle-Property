import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Volume2, 
  VolumeX, 
  Plus, 
  ArrowLeft, 
  Sparkles, 
  ExternalLink, 
  Check, 
  Send, 
  X,
  PlusCircle,
  User,
  Activity,
  UserCheck,
  Bookmark,
  Copy,
  DollarSign,
  Award,
  Star,
  Compass,
  FileText,
  MessageSquare,
  QrCode,
  MapPin,
  Music,

  ThumbsUp,
  ThumbsDown,
  ChevronUp,
  ChevronDown,
  ListFilter,
  RefreshCw,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../../firebase';
import { reelsService, Reel, ReelComment } from '../../services/reelsService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import ReelsUpload from './ReelsUpload';
import ReelVideo from './ReelVideo';
import SEO from '../SEO';
import { getLocalVideo } from '../../utils/videoDb';

// Multi-video high frame rate cinematic loops for premium aesthetic fallback
const MOCK_REELS: (Omit<Reel, 'id' | 'coverImage'> & { id: string; coverImage?: string })[] = [
  {
    id: 'demo_1',
    videoUrl: '/videos/walkthrough_villa.mp4',
    caption: "⭐ Pakistan's ONLY 2024 Nissan GT-R Nismo Carbon Pack has landed! 🇯🇵 🔥 The Godzilla of tracks with active titanium exhaust! Check full profile. #NissanGTR #Nismo",
    listingId: 'demo_1',
    sellerId: 'demo_seller_1',
    sellerName: 'redspots',
    sellerAvatar: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=150&q=80',
    likesCount: 2400,
    commentsCount: 120,
    viewsCount: 3200000,
    make: 'Nissan',
    model: 'GT-R Nismo',
    price: 35000000,
    year: 2024,
    createdAt: new Date().toISOString(),
    coverImage: '/src/assets/images/carbon_fiber_nissan_gtr_nismo_1781605394974.jpg'
  },
  {
    id: 'demo_2',
    videoUrl: '/videos/walkthrough_penthouse.mp4',
    caption: 'Neon lights reflecting on pristine crimson metallic paint. Built to move, designed to command respect on every street. #911Carrera #TrackReady #Stuttgart',
    listingId: 'demo_2',
    sellerId: 'demo_seller_2',
    sellerName: 'Elite Motors Karachi',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    likesCount: 5120,
    commentsCount: 342,
    viewsCount: 31200,
    make: 'Porsche',
    model: '911 Carrera',
    price: 85000000,
    year: 2023,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo_3',
    videoUrl: '/videos/walkthrough_mansion.mp4',
    caption: 'Rainy night aesthetics. Custom carbon fiber spoiler, active aero aerodynamics, and true track performance. Hear that V10 song! #AudiR8 #SupercarsOfPakistan',
    listingId: 'demo_3',
    sellerId: 'demo_seller_3',
    sellerName: 'Pak Premium Garage',
    sellerAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80',
    likesCount: 3890,
    commentsCount: 228,
    viewsCount: 24050,
    make: 'Audi',
    model: 'R8 V10',
    price: 72000000,
    year: 2021,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo_4',
    videoUrl: '/videos/walkthrough_smart_home.mp4',
    caption: 'Italian absolute perfection. 986 HP petrol-hybrid beast screaming through the highway. Double tap for pure exhaust sounds! 🏎️🇮🇹 #FerrariSF90 #SF90Stradale',
    listingId: 'demo_4',
    sellerId: 'demo_seller_4',
    sellerName: 'Cavallino Imports Lahore',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    likesCount: 8430,
    commentsCount: 512,
    viewsCount: 154000,
    make: 'Ferrari',
    model: 'SF90 Stradale',
    price: 185000000,
    year: 2024,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo_5',
    videoUrl: '/videos/walkthrough_villa.mp4',
    caption: 'Adrenaline on demand. The STO is a direct street-legal descendant of Squadra Corse. Raw. Uncompromising. Screaming V10 power. #Lamborghini #HuracanSTO',
    listingId: 'demo_5',
    sellerId: 'demo_seller_5',
    sellerName: 'Lambo Hub Islamabad',
    sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    likesCount: 9320,
    commentsCount: 478,
    viewsCount: 189300,
    make: 'Lamborghini',
    model: 'Huracán STO',
    price: 195000000,
    year: 2023,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo_6',
    videoUrl: '/videos/walkthrough_penthouse.mp4',
    caption: 'Piercing the dark with adaptive laser-matrix lights. The twin-turbo McLaren carbon chassis is a true aerospace engineering triumph. 🚀🛸 #McLaren720S #WokingMagic',
    listingId: 'demo_6',
    sellerId: 'demo_seller_6',
    sellerName: 'Apex Apex Motors',
    sellerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    likesCount: 6510,
    commentsCount: 299,
    viewsCount: 98400,
    make: 'McLaren',
    model: '720S Spider',
    price: 110000000,
    year: 2022,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo_7',
    videoUrl: '/videos/walkthrough_mansion.mp4',
    caption: 'Classic British luxury muscle at dusk. Superleggera represents the ultimate flagship grand tourer. 715 Horsepower brute in a tuxedo. 🇬🇧🕶️ #AstonMartin #DBS',
    listingId: 'demo_7',
    sellerId: 'demo_seller_7',
    sellerName: 'V12 Syndicate',
    sellerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    likesCount: 4322,
    commentsCount: 198,
    viewsCount: 78900,
    make: 'Aston Martin',
    model: 'DBS Superleggera',
    price: 135000000,
    year: 2023,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo_8',
    videoUrl: '/videos/walkthrough_smart_home.mp4',
    caption: 'Hear that flat-plane crank scream up to 8,600 RPM! The LT6 V8 in the Corvette C8 Z06 is the most powerful naturally aspirated V8 in production. 🇺🇸🔥 #C8Z06 #Corvette',
    listingId: 'demo_8',
    sellerId: 'demo_seller_8',
    sellerName: 'Americana Customs',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    likesCount: 7120,
    commentsCount: 310,
    viewsCount: 112000,
    make: 'Chevrolet',
    model: 'Corvette C8 Z06',
    price: 64000000,
    year: 2024,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo_9',
    videoUrl: '/videos/walkthrough_villa.mp4',
    caption: 'Basking in absolute luxury. The Affalterbach flagship Black Series pushing limits on the coast. Active rear wing and flat-plane raw power. #AMG #GTBlackSeries',
    listingId: 'demo_9',
    sellerId: 'demo_seller_9',
    sellerName: 'Affalterbach Auto Lahore',
    sellerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    likesCount: 9780,
    commentsCount: 580,
    viewsCount: 220100,
    make: 'Mercedes-AMG',
    model: 'GT Black Series',
    price: 190000000,
    year: 2022,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo_10',
    videoUrl: '/videos/walkthrough_penthouse.mp4',
    caption: 'Attacking corners on a beautiful mountain pass. Pure rear-wheel-drive drama with the S58 twin-turbo engine. Perfect balance. 🇩🇪⛰️ #BMWM4 #MCompetition',
    listingId: 'demo_10',
    sellerId: 'demo_seller_10',
    sellerName: 'Bavarian Performance',
    sellerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    likesCount: 4980,
    commentsCount: 187,
    viewsCount: 65400,
    make: 'BMW',
    model: 'M4 Competition',
    price: 48000000,
    year: 2023,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo_11',
    videoUrl: '/videos/walkthrough_mansion.mp4',
    caption: 'Stepping into the future. Cruising into the sunset on a test run of the hyper electric roadster. 0-100 km/h in 2.1s is not acceleration, it is a launch! ⚡🌌 #Tesla #Roadster',
    listingId: 'demo_11',
    sellerId: 'demo_seller_11',
    sellerName: 'Volt Premium',
    sellerAvatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=150&q=80',
    likesCount: 12050,
    commentsCount: 840,
    viewsCount: 450000,
    make: 'Tesla',
    model: 'Roadster',
    price: 95000000,
    year: 2024,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo_12',
    videoUrl: '/videos/walkthrough_smart_home.mp4',
    caption: 'The absolute king of luxury sports SUVs. Carbon-ceramic brakes, 626 HP hybrid power, and dynamic active air suspension. Perfect daily cruiser. 👑⛰️ #RangeRover #SportSV',
    listingId: 'demo_12',
    sellerId: 'demo_seller_12',
    sellerName: 'Landmark Motors',
    sellerAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    likesCount: 3100,
    commentsCount: 145,
    viewsCount: 51000,
    make: 'Range Rover',
    model: 'Sport SV',
    price: 68000000,
    year: 2024,
    createdAt: new Date().toISOString()
  }
];

const REACTION_PILLS = [
  "🔥 Absolute Masterpiece!",
  "🚀 Sound is madness",
  "💎 Clean stance!",
  "🤩 Ready to sign check"
];

// High-fidelity car specifications matching active vehicle
const VEHICLE_SPECS: Record<string, { power: string; acceleration: string; engine: string; transmission: string }> = {
  'Nissan-GT-R Nismo': {
    power: '600 Horsepower @6800 RPM',
    acceleration: '0-100 km/h in 2.5 seconds',
    engine: '3.8L Twin-Turbocharged V6 VR38DETT',
    transmission: '6-Speed Dual-Clutch Sequential Manual'
  },
  'Ford-Mustang GT': {
    power: '460 Horsepower @7000 RPM',
    acceleration: '0-100 km/h in 4.2 seconds',
    engine: '5.0L Coyote Naturally Aspirated V8',
    transmission: '10-Speed SelectShift Automatic'
  },
  'Porsche-911 Carrera': {
    power: '379 Horsepower @6500 RPM',
    acceleration: '0-100 km/h in 4.0 seconds',
    engine: '3.0L Twin-Turbo Flat-6 German Block',
    transmission: '8-Speed Porsche Doppelkupplung (PDK)'
  },
  'Audi-R8 V10': {
    power: '602 Horsepower (Performance Variant)',
    acceleration: '0-100 km/h in 3.2 seconds',
    engine: '5.2L Naturally Aspirated FSI V10',
    transmission: '7-Speed S-Tronic Dual-Clutch'
  },
  'Ferrari-SF90 Stradale': {
    power: '986 Horsepower (PHEV Combined)',
    acceleration: '0-100 km/h in 2.5 seconds',
    engine: '4.0L Twin-Turbo V8 with 3 Electric Motors',
    transmission: '8-Speed Dual-Clutch F1 Sequential'
  },
  'Lamborghini-Huracán STO': {
    power: '631 Horsepower @8000 RPM',
    acceleration: '0-100 km/h in 3.0 seconds',
    engine: '5.2L Naturally Aspirated V10 (Odd-firing)',
    transmission: '7-Speed Dual-Clutch LDF'
  },
  'McLaren-720S Spider': {
    power: '710 Horsepower @7500 RPM',
    acceleration: '0-100 km/h in 2.9 seconds',
    engine: '4.0L Twin-Turbocharged V8 M840T',
    transmission: '7-Speed Seamless Shift Gearbox'
  },
  'Aston Martin-DBS Superleggera': {
    power: '715 Horsepower @6500 RPM',
    acceleration: '0-100 km/h in 3.4 seconds',
    engine: '5.2L Twin-Turbocharged V12 AM11',
    transmission: '8-Speed ZF Automatic transmission'
  },
  'Chevrolet-Corvette C8 Z06': {
    power: '670 Horsepower @8400 RPM',
    acceleration: '0-100 km/h in 2.6 seconds',
    engine: '5.5L Naturally Aspirated V8 Flat-Plane LT6',
    transmission: '8-Speed Dual-Clutch automatic'
  },
  'Mercedes-AMG-GT Black Series': {
    power: '720 Horsepower @6900 RPM',
    acceleration: '0-100 km/h in 3.2 seconds',
    engine: '4.0L Twin-Turbo dry-sump flat-plane V8',
    transmission: '7-Speed AMG SPEEDSHIFT DCT'
  },
  'BMW-M4 Competition': {
    power: '503 Horsepower @6250 RPM',
    acceleration: '0-100 km/h in 3.4 seconds',
    engine: '3.0L Twin-Turbo S58 Inline-6',
    transmission: '8-Speed M Steptronic with Drivelogic'
  },
  'Tesla-Roadster': {
    power: '10,000 Nm Wheel Torque (Tri-Motor System)',
    acceleration: '0-100 km/h in 2.1 seconds',
    engine: 'Three Electric Motors (1 Front, 2 Rear)',
    transmission: 'Single-Speed Direct Drive'
  },
  'Range Rover-Sport SV': {
    power: '626 Horsepower MHEV',
    acceleration: '0-100 km/h in 3.6 seconds',
    engine: '4.4L Twin-Turbocharged V8 Hybrid',
    transmission: '8-Speed Automatic with Carbon Paddles'
  }
};

export default function ReelsFeed() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  
  // Interactions State
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({});
  const [dislikedReels, setDislikedReels] = useState<Record<string, boolean>>({});
  const [savedReels, setSavedReels] = useState<Record<string, boolean>>({});
  const [followedShowrooms, setFollowedShowrooms] = useState<Record<string, boolean>>({});
  const [expandedCaptions, setExpandedCaptions] = useState<Record<string, boolean>>({});
  const [translatedReels, setTranslatedReels] = useState<Record<string, boolean>>({});
  const [videoProgress, setVideoProgress] = useState<Record<string, number>>({});
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  
  // Toggle specs overlay inside player card
  const [openSpecsReelId, setOpenSpecsReelId] = useState<string | null>(null);

  // Comments drawer: on desktop this translates into a side-by-side persistent panel!
  const [showCommentDrawer, setShowCommentDrawer] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 768 : false));
  const [activeReelComments, setActiveReelComments] = useState<ReelComment[]>([]);
  const [newComment, setNewComment] = useState('');
  
  // Offer Submissions State
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [offerPriceInput, setOfferPriceInput] = useState<string>('');
  const [offerNotesInput, setOfferNotesInput] = useState<string>('');
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

  // Shares State
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [doubleTapHearts, setDoubleTapHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [userIsVerifiedSeller, setUserIsVerifiedSeller] = useState(true); 

  // Multi-tier video preloading & ultra-fast local Blob cache
  const [cachedBlobs, setCachedBlobs] = useState<Record<string, string>>({});
  const [localUrls, setLocalUrls] = useState<Record<string, string>>({});
  const fetchedUrlsRef = useRef<Set<string>>(new Set());

  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
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
              // Fallback to our high-end walkthrough pre-defined showcase URL on missing DB
              setLocalUrls(prev => ({ 
                ...prev, 
                [url]: '/videos/walkthrough_villa.mp4' 
              }));
            }
          } catch (e) {
            console.warn("Local resolution failed for reel video:", e instanceof Error ? e.message : String(e));
          }
        }
      }
    };
    fetchLocalVideos();
    return () => {
      active = false;
    };
  }, [reels, localUrls]);

  // Load and subscribe to reels from Firestore
  useEffect(() => {
    const unsub = reelsService.subscribeToReels((loadedReels) => {
      if (loadedReels.length === 0) {
        setReels(MOCK_REELS as Reel[]);
      } else {
        setReels(loadedReels);
      }
    });
    return () => unsub();
  }, []);

  // Intelligent pre-fetching scheduler
  useEffect(() => {
    if (reels.length === 0) return;

    // We pre-load the next 2 reels ahead of time
    const nextIndices = [activeIndex + 1, activeIndex + 2];
    
    nextIndices.forEach(index => {
      if (index >= 0 && index < reels.length) {
        const reel = reels[index];
        const url = reel.videoUrl;
        
        if (url && !url.startsWith('local-reel-') && !url.startsWith('blob:') && !fetchedUrlsRef.current.has(url)) {
          // Prevent multiple downloads
          fetchedUrlsRef.current.add(url);
          
          fetch(url)
            .then(res => {
              if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
              return res.blob();
            })
            .then(blob => {
              const blobUrl = URL.createObjectURL(blob);
              setCachedBlobs(prev => ({
                ...prev,
                [url]: blobUrl
              }));
            })
            .catch(err => {
              console.warn(`[VideoCache] Pre-caching failed for ${url}, fallback gracefully.`, err);
            });
        }
      }
    });

    // Cleanup far-away cached blobs to safeguard memory usage on mobile viewports
    const keepUrls = new Set<string>();
    for (let i = Math.max(0, activeIndex - 1); i <= Math.min(reels.length - 1, activeIndex + 2); i++) {
      if (reels[i]) {
        keepUrls.add(reels[i].videoUrl);
      }
    }

    const currentCachedKeys = Object.keys(cachedBlobs);
    let cleaned = false;
    const newBlobs = { ...cachedBlobs };

    currentCachedKeys.forEach(url => {
      if (!keepUrls.has(url)) {
        URL.revokeObjectURL(cachedBlobs[url]);
        delete newBlobs[url];
        fetchedUrlsRef.current.delete(url);
        cleaned = true;
      }
    });

    if (cleaned) {
      setCachedBlobs(newBlobs);
    }
  }, [activeIndex, reels, cachedBlobs]);

  // Sync like and bookmark status for current active reel in real-time
  useEffect(() => {
    if (reels[activeIndex]) {
      const activeId = reels[activeIndex].id;
      if (currentUser) {
        reelsService.checkIsLiked(activeId, currentUser.uid).then((isLiked) => {
          setLikedReels(prev => ({ ...prev, [activeId]: isLiked }));
        });
        reelsService.checkIsSaved(activeId, currentUser.uid).then((isSaved) => {
          setSavedReels(prev => ({ ...prev, [activeId]: isSaved }));
        });
      }
      
      const currentPriceLakh = reels[activeIndex].price ? (reels[activeIndex].price / 100000).toString() : '50';
      setOfferPriceInput(currentPriceLakh);
      setOfferNotesInput("Ready to conclude premium transaction immediately. Please confirm availability.");
    }
  }, [activeIndex, reels, currentUser]);

  // Sync comment stream for active reel dynamically
  useEffect(() => {
    if (reels[activeIndex]) {
      const unsub = reelsService.subscribeToComments(reels[activeIndex].id, (comments) => {
        setActiveReelComments(comments);
      });
      return () => unsub();
    }
  }, [activeIndex, reels]);

  // Keyboard navigation similar to YouTube Shorts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keypresses inside form inputs and active chat boxes
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('reels-toggle-play'));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollReelsToIndex(activeIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollReelsToIndex(activeIndex - 1);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsMuted(prev => !prev);
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        handleLikeClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIndex, reels, isMuted, likedReels, currentUser]);

  // Handle scroll trigger to increment view count and update active index
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const height = e.currentTarget.clientHeight;
    if (height === 0) return;
    const index = Math.round(scrollTop / height);
    if (index !== activeIndex && index >= 0 && index < reels.length) {
      setActiveIndex(index);
      const activeReel = reels[index];
      if (activeReel && activeReel.id) {
        reelsService.incrementViewCount(activeReel.id);
      }
      // Reset specs overlay when shifting reels
      setOpenSpecsReelId(null);
    }
  };

  // Navigating reels using floating Up/Down button selectors
  const scrollReelsToIndex = (index: number) => {
    if (index < 0 || index >= reels.length || !containerRef.current) return;
    const height = containerRef.current.clientHeight;
    containerRef.current.scrollTo({
      top: index * height,
      behavior: 'smooth'
    });
    setActiveIndex(index);
    setOpenSpecsReelId(null);
  };

  // Immersive Double-Click Like handler
  const handleVideoDoubleTap = async (event: React.MouseEvent<HTMLDivElement>) => {
    const activeReel = reels[activeIndex];
    if (!activeReel) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newHeart = {
      id: Date.now(),
      x,
      y
    };
    setDoubleTapHearts(prev => [...prev, newHeart]);

    if (currentUser) {
      const liked = await reelsService.toggleLikeReel(
        activeReel.id, 
        currentUser.uid, 
        currentUser.displayName || currentUser.email || 'Citizen'
      );
      setLikedReels(prev => ({ ...prev, [activeReel.id]: liked }));
    } else {
      setLikedReels(prev => ({ ...prev, [activeReel.id]: !prev[activeReel.id] }));
      toast.success("Loved this cinematic capture!");
    }

    setTimeout(() => {
      setDoubleTapHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1000);
  };

  const handleLikeClick = async () => {
    const activeReel = reels[activeIndex];
    if (!activeReel) return;

    if (currentUser) {
      const liked = await reelsService.toggleLikeReel(
        activeReel.id, 
        currentUser.uid, 
        currentUser.displayName || currentUser.email || 'Citizen'
      );
      setLikedReels(prev => ({ ...prev, [activeReel.id]: liked }));
    } else {
      setLikedReels(prev => ({ ...prev, [activeReel.id]: !prev[activeReel.id] }));
      toast.info("Liked the capture locally!");
    }
  };

  const handleDislikeToggle = () => {
    const activeReel = reels[activeIndex];
    if (!activeReel) return;
    const activeId = activeReel.id;
    const toggled = !dislikedReels[activeId];
    setDislikedReels(prev => ({ ...prev, [activeId]: toggled }));
    
    if (toggled) {
      toast.success("Feedback registered. We will curate fewer of these formats in your spotlight.");
      if (likedReels[activeId]) {
        setLikedReels(prev => ({ ...prev, [activeId]: false }));
      }
    }
  };

  // Bookmark / Save Action
  const handleSaveClick = async () => {
    const activeReel = reels[activeIndex];
    if (!activeReel) return;

    if (currentUser) {
      const saved = await reelsService.toggleSaveReel(activeReel.id, currentUser.uid);
      setSavedReels(prev => ({ ...prev, [activeReel.id]: saved }));
      if (saved) {
        toast.success("Added to Premium Collections Dashboard 📁✨");
      } else {
        toast.info("Removed from collections.");
      }
    } else {
      setSavedReels(prev => ({ ...prev, [activeReel.id]: !prev[activeReel.id] }));
      toast.success("Bookmark updated!");
    }
  };

  // Follow/Subscribe to showroom on nudge button
  const handleFollowShowroomClick = (e: React.MouseEvent, sellerId: string, sellerName: string) => {
    e.stopPropagation();
    const isFollowed = followedShowrooms[sellerId] || false;
    setFollowedShowrooms(prev => ({ ...prev, [sellerId]: !isFollowed }));
    if (!isFollowed) {
      toast.success(`🎉 Now following ${sellerName} on Pakizzle!`);
    } else {
      toast.info(`Stopped following ${sellerName}.`);
    }
  };

  // Submit Offer Action
  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeReel = reels[activeIndex];
    if (!activeReel) return;

    if (!currentUser) {
      toast.error("Authentication required to propose formal vehicle bids.");
      return;
    }

    const offerVal = parseFloat(offerPriceInput);
    if (!offerVal || offerVal <= 0) {
      toast.error("Please specify a genuine numeric bid price.");
      return;
    }

    setIsSubmittingOffer(true);
    try {
      await reelsService.submitReelOffer(
        activeReel.id,
        currentUser.uid,
        currentUser.displayName || currentUser.email || 'Premium Agent',
        offerVal * 100000, 
        offerNotesInput
      );
      toast.success(`🎉 Proposal of PKR ${offerVal.toFixed(1)} Lac sent instantly to the seller showroom!`);
      setShowOfferDialog(false);
    } catch (err) {
      toast.error("Could not register offer.");
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  // Post comment handler
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !reels[activeIndex]) return;

    if (currentUser) {
      await reelsService.addComment(
        reels[activeIndex].id,
        newComment,
        currentUser.uid,
        currentUser.displayName || currentUser.email || 'Showroom Enthusiast',
        currentUser.photoURL || ''
      );
      setNewComment('');
    } else {
      const tempId = Date.now().toString();
      const mockComment: ReelComment = {
        id: tempId,
        reelId: reels[activeIndex].id,
        userId: 'temp_user',
        userName: 'Guest Watcher',
        text: newComment,
        createdAt: new Date().toISOString()
      };
      setActiveReelComments(prev => [...prev, mockComment]);
      setNewComment('');
      toast.success("Guest comment posted to preview stream!");
    }
  };

  // Predefined reaction pills
  const handleReactionPillClick = async (reactionText: string) => {
    const activeReel = reels[activeIndex];
    if (!activeReel) return;

    if (currentUser) {
      await reelsService.addComment(
        activeReel.id,
        reactionText,
        currentUser.uid,
        currentUser.displayName || currentUser.email || 'Showroom VIP',
        currentUser.photoURL || ''
      );
      toast.success("Reaction dispatched instantly!");
    } else {
      const tempId = Date.now().toString();
      const mockComment: ReelComment = {
        id: tempId,
        reelId: activeReel.id,
        userId: 'temp_user',
        userName: 'Quick Guest Reviewer',
        text: reactionText,
        createdAt: new Date().toISOString()
      };
      setActiveReelComments(prev => [...prev, mockComment]);
      toast.success("Guest reaction posted!");
    }
  };

  const handleShareClick = () => {
    setShowShareSheet(true);
  };

  const handleCopyLink = () => {
    const activeReel = reels[activeIndex];
    const targetUrl = window.location.origin + `/marketplace?reel=${activeReel?.id || 'discover'}`;
    navigator.clipboard.writeText(targetUrl);
    setCopiedLink(true);
    toast.success("Showcase link copied to clipboard! 🔗");
    setTimeout(() => {
      setCopiedLink(false);
    }, 2000);
  };

  // Remix Action handler
  const handleRemixClick = () => {
    toast.success("🎵 Multi-track premium audio remix captured! Preset loaded onto your editor dashboard.", {
      icon: <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
    });
  };

  const formatCurrency = (val?: number) => {
    if (!val) return 'PKR Call';
    return `PKR ${(val / 100000).toFixed(1)} Lac`;
  };

  // Custom generated synthetic nested replies matching the comment context or target
  const getSubReplies = (commentId: string, commentText: string) => {
    if (commentText.includes("Masterpiece") || commentText.includes("roaring") || commentText.includes("sound") || commentText.includes("exhaust")) {
      return [
        { id: `${commentId}_r1`, userName: "@MustangIslamabad", text: "Truly wild. That engine block can be heard from a mile away! 🇵🇰", time: "3 days ago", likes: 82 },
        { id: `${commentId}_r2`, userName: "@CarbonVeloce", text: "Is this the stock exhaust setup or catless downpipes?", time: "2 days ago", likes: 31 }
      ];
    }
    if (commentText.includes("stance") || commentText.includes("paint") || commentText.includes("clean") || commentText.includes("neon")) {
      return [
        { id: `${commentId}_r1`, userName: "@EuroSpecKarachi", text: "Yes Carrera lines are unmatched under public neon clusters.", time: "4 days ago", likes: 114 },
        { id: `${commentId}_r2`, userName: "@ShowroomSpotter", text: "Absolute art! Seen Elite Motors park this in DHA, stunning stance.", time: "3 days ago", likes: 52 }
      ];
    }
    return [
      { id: `${commentId}_r1`, userName: "@SupercarCollector", text: "Awesome spec! Appreciating the transparent live bidding on Pakizzle.", time: "1 week ago", likes: 45 },
      { id: `${commentId}_r2`, userName: "@PakGarage", text: "Contact details are listed in showroom profile, ready for inspection.", time: "5 days ago", likes: 19 }
    ];
  };

  return (
    <div className="relative w-full h-[100dvh] bg-black text-white overflow-hidden font-sans select-none">
      <SEO 
        title={reels[activeIndex] ? `${reels[activeIndex].caption?.split('#')[0].trim() || "Luxury Car Reel"}` : "Luxury Auto Immersive Video Reels"}
        description={reels[activeIndex] 
          ? `Watch high-octane premium car showcases on Pakizzle: ${reels[activeIndex].caption}. Connect directly with ${reels[activeIndex].sellerName || 'showroom seller'} for dynamic inquiries.` 
          : "Discover luxury sports cars, supercars, and premium modded builds with high-speed, immersive video reels on Pakizzle."}
        keywords={[
          reels[activeIndex]?.sellerName || "luxury cars",
          "car clips", "pakistan car reels", "tiktok car premium", "pakizzle clips"
        ]}
        canonicalPath="/reels"
        ogType="video.other"
        schema={{
          "@type": "VideoObject",
          "name": reels[activeIndex] ? reels[activeIndex].caption?.substring(0, 60) : "Immersive Car Video Short - Pakizzle",
          "description": reels[activeIndex] ? reels[activeIndex].caption : "Short vertical automotive loop showcasing luxury vehicle specs.",
          "thumbnailUrl": reels[activeIndex]?.sellerAvatar || "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=300&q=50",
          "uploadDate": "2026-06-20",
          "contentUrl": reels[activeIndex]?.videoUrl || "",
          "embedUrl": window.location.href
        }}
      />
      <style>{`
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-100%, 0, 0); }
        }
        .animate-marquee {
          animation: marquee 14s linear infinite;
          padding-left: 100%;
        }
        /* Hide scrollbars for WebKit, Firefox and IE */
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hidden {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
      
      {/* Blurred background atmospheric duplicate for ultra-depth layout */}
      {reels[activeIndex] && (
        <div 
          className="absolute inset-0 hidden md:block bg-cover bg-center filter blur-[100px] opacity-20 scale-105 transition-all duration-1000 z-0 ease-in-out pointer-events-none"
          style={{ backgroundImage: `url(${reels[activeIndex].sellerAvatar || 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=300&q=50'})` }}
        />
      )}

      {/* Top Apple-Inspired Glassmorphic Header Controls */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/95 via-black/40 to-transparent p-5 flex justify-between items-center px-4 md:px-8">
        {/* Left Side: Back button + Majestic Custom Soundwave Play Logo + Search Input bar */}
        <div className="flex items-center gap-2 md:gap-4 flex-1 max-w-[280px] xs:max-w-sm sm:max-w-md md:max-w-lg">
          <button 
            onClick={() => navigate('/marketplace')} 
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-all hover:scale-105 shrink-0"
            title="Back to Marketplace"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1.5 select-none shrink-0">
            {/* Wave bracket left */}
            <div className="hidden sm:flex gap-[2px] items-center text-indigo-400 opacity-80 animate-pulse">
              <span className="w-[2px] h-3.5 bg-gradient-to-t from-blue-500 to-indigo-500 rounded-full" />
              <span className="w-[2.5px] h-5.5 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-full" />
            </div>
            
            {/* Playing triangle button with shiny colorful gradient */}
            <div className="relative w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/10 shrink-0">
              <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8.5px] border-l-white ml-0.5" />
            </div>
            
            {/* Wave bracket right */}
            <div className="hidden sm:flex gap-[2px] items-center text-indigo-400 opacity-80 animate-pulse">
              <span className="w-[2.5px] h-5.5 bg-gradient-to-t from-purple-500 to-indigo-500 rounded-full" />
              <span className="w-[2px] h-3.5 bg-gradient-to-t from-indigo-500 to-blue-500 rounded-full" />
            </div>
          </div>

          {/* Search input bar aligned on the left next to logo/back */}
          <div className="relative flex items-center bg-[#18191c]/90 border border-white/5 rounded-full px-3.5 py-2 w-full max-w-[140px] xs:max-w-[180px] sm:max-w-[220px] md:max-w-[260px] backdrop-blur-md ml-1 md:ml-2">
            <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Search" 
              className="bg-transparent text-xs text-white/95 placeholder-gray-500 focus:outline-none w-full font-medium"
            />
          </div>
        </div>

        {/* Right: Discover link, Upload link, mute toggle, profile avatar */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-5">
            <span className="text-xs font-bold text-white tracking-wide cursor-pointer relative after:absolute after:bottom-[-6px] after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-blue-500 after:rounded-full">
              Discover
            </span>
            <button 
              onClick={() => setIsUploading(true)}
              className="text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              Upload Reel
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Global Mute Toggle */}
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className="flex items-center justify-center w-8.5 h-8.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-all hover:scale-105"
            >
              {isMuted ? <VolumeX className="w-4.5 h-4.5 text-gray-300" /> : <Volume2 className="w-4.5 h-4.5 text-blue-400 animate-pulse" />}
            </button>

            {/* Profile circular avatar placeholder */}
            <button className="w-8.5 h-8.5 rounded-full bg-[#202124] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-zinc-800 transition-all">
              <User className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Snap Vertical Scroll Viewport */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hidden z-10 relative"
        style={{ scrollBehavior: 'smooth' }}
      >
        {reels.map((reel, index) => {
          const isActive = index === activeIndex;
          const isLiked = likedReels[reel.id] || false;
          const isDisliked = dislikedReels[reel.id] || false;
          const isSaved = savedReels[reel.id] || false;
          const isFollowed = followedShowrooms[reel.sellerId] || false;

          return (
            <div 
              key={reel.id || index}
              className="snap-start w-full h-[100dvh] relative flex items-center justify-center overflow-hidden px-0"
            >
              
              {/* Dual-View Flex Layout for Desktop (Side-by-Side Video + Interactive Panel) */}
              <div className="flex flex-row items-center justify-center w-full h-full max-w-7xl mx-auto gap-4 md:gap-6 lg:gap-8 lg:px-6 relative">
                
                {/* 1. Primary Video Player Screen (Aspect Locked/Full-screen Mobile layout) */}
                <div 
                  className="w-full max-w-none md:max-w-[420px] h-[100dvh] md:h-[95vh] max-h-none md:max-h-[960px] aspect-auto md:aspect-[9/16] rounded-none md:rounded-[36px] overflow-hidden border-0 md:border md:border-white/10 relative bg-zinc-950 shadow-none md:shadow-[0_32px_80px_rgba(0,0,0,0.95)] shrink-0 group pointer-events-auto"
                >
                   <ReelVideo
                    id={reel.id}
                    videoUrl={localUrls[reel.videoUrl] || cachedBlobs[reel.videoUrl] || reel.videoUrl}
                    isActive={isActive}
                    isMuted={isMuted}
                    onDoubleTap={handleVideoDoubleTap}
                    coverImage={reel.coverImage}
                    shouldLoad={Math.abs(index - activeIndex) <= 2}
                  />
                  
                  {/* Visual dark radial vignette for text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/75 opacity-90 pointer-events-none" />

                  {/* Single Double-Tap Animated Hearts Flyout */}
                  <AnimatePresence>
                    {doubleTapHearts.map(heart => (
                      <motion.div
                        key={heart.id}
                        initial={{ opacity: 0, scale: 0.3, y: 0 }}
                        animate={{ opacity: 1, scale: [1, 1.4, 1.1], y: -50 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="absolute z-30 pointer-events-none"
                        style={{ left: heart.x - 32, top: heart.y - 32 }}
                      >
                        <Heart className="w-16 h-16 text-red-500 fill-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.85)]" />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Top Location Pill Badge (Floating inside player frame - pushed below glass header on mobile) */}
                  <div className="absolute top-[84px] md:top-5 left-4 right-4 md:left-5 md:right-5 z-20 flex justify-between items-center pointer-events-none">
                    <div className="flex items-center gap-1 bg-black/65 backdrop-blur-md px-3 py-1 md:px-3.5 md:py-1.5 rounded-full text-[9.5px] md:text-[10.5px] font-bold text-white pointer-events-auto cursor-pointer border border-white/10 hover:bg-black/85 transition-all shadow-md">
                      <MapPin className="w-3 md:w-3.5 h-3 md:h-3.5 text-rose-500 fill-rose-500/10" />
                      <span>
                        {reel.sellerId === 'demo_seller_1' ? 'F-7 Markaz - Islamabad' : reel.sellerId === 'demo_seller_2' ? 'DHA Phase 6 - Karachi' : reel.sellerId === 'demo_seller_3' ? 'Gulberg III - Lahore' : 'F-7 Markaz - Islamabad'}
                      </span>
                    </div>

                    <div className="bg-[#1b1c1e]/90 text-white/90 backdrop-blur-md px-2.5 py-1 md:px-3.5 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black tracking-wider border border-white/10 flex items-center gap-1 z-10 select-none shadow-md">
                      <span className="bg-[#605bff] rounded-full p-0.5 inline-flex items-center justify-center w-3 h-3 md:w-3.5 md:h-3.5">
                        <Check className="w-2 md:w-2.5 h-2 md:h-2.5 text-white fill-white stroke-[4]" />
                      </span>
                      VERIFIED
                    </div>
                  </div>

                  {/* Center specifications popup (if triggered from searchsuggestion) */}
                  <AnimatePresence>
                    {openSpecsReelId === reel.id && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute inset-5 z-30 bg-zinc-950/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-5 flex flex-col justify-between text-left shadow-2xl overflow-y-auto"
                      >
                        <div>
                          <div className="flex justify-between items-center border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-blue-400" />
                              <span className="font-mono text-[9px] uppercase tracking-widest text-[#0071e3] font-black">Vehicle Specifications</span>
                            </div>
                            <button 
                              onClick={() => setOpenSpecsReelId(null)}
                              className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="mt-4 space-y-4">
                            <div>
                              <span className="text-[8px] font-mono uppercase tracking-widest text-white/40 block">Showcase Target</span>
                              <span className="text-sm font-extrabold text-white mt-1 block">{reel.year} {reel.make} {reel.model}</span>
                            </div>

                            {(() => {
                              const specKey = `${reel.make}-${reel.model}`;
                              const spec = VEHICLE_SPECS[specKey] || VEHICLE_SPECS['Ford-Mustang GT'];
                              return (
                                <>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                                      <span className="text-[8px] text-white/40 font-mono block">ACCELERATION</span>
                                      <span className="text-xs font-black text-emerald-400 mt-1 block">{spec.acceleration.split(' in ')[1] || '4.0s'}</span>
                                    </div>
                                    <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                                      <span className="text-[8px] text-white/40 font-mono block">RATING POWER</span>
                                      <span className="text-xs font-black text-amber-400 mt-1 block">{spec.power.split(' @')[0] || '450 HP'}</span>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <div>
                                      <span className="text-[8px] text-white/40 font-mono block">ENGINE SPECIFICATION</span>
                                      <span className="text-xs font-semibold text-white/90 mt-0.5 block">{spec.engine}</span>
                                    </div>
                                    <div>
                                      <span className="text-[8px] text-white/40 font-mono block">TRANSMISSION GEARBOX</span>
                                      <span className="text-xs font-semibold text-white/90 mt-0.5 block">{spec.transmission}</span>
                                    </div>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-white/10 flex gap-2">
                          <button
                            onClick={() => {
                              setOpenSpecsReelId(null);
                              setShowOfferDialog(true);
                            }}
                            className="flex-1 py-2 background-glass text-center bg-blue-600 hover:bg-blue-700 rounded-xl text-[10px] font-black tracking-wide text-white uppercase transition-all"
                          >
                            Negotiate Deal
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Inside Frame overlay labels, caption and profile details within a unified rounded context card */}
                  <div className="absolute bottom-[104px] md:bottom-5 left-3.5 right-20 md:right-4 z-20 rounded-2xl md:rounded-[32px] backdrop-blur-md md:backdrop-blur-xl bg-black/45 md:bg-[#131416]/90 border border-white/10 md:border-white/[0.06] p-3.5 md:p-5 flex flex-col gap-2.5 md:gap-4 pointer-events-auto shadow-lg md:shadow-[0_24px_50px_rgba(0,0,0,0.8)] text-left">
                    
                    {/* 1. Profile Header Row */}
                    <div className="flex items-center justify-between w-full">
                      <div 
                        className="flex items-center gap-2 md:gap-3 cursor-pointer" 
                        onClick={() => navigate(`/profile/${reel.sellerId}`)}
                      >
                        {reel.sellerId === 'demo_seller_1' ? (
                          <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-blue-500/60 p-[1.5px] bg-[#0c0d0e] flex-shrink-0 flex items-center justify-center shadow-lg shadow-blue-500/10">
                            <div className="w-full h-full rounded-full bg-black border border-white/10 flex flex-col items-center justify-center p-0.5 font-sans">
                              {/* Sleek lowercase styled text with micro-logo */}
                              <div className="text-[4.5px] md:text-[5.5px] font-black text-white/95 tracking-[0.04em] leading-none mt-0.5 md:mt-1">REDSPOTS</div>
                              
                              {/* High-fidelity car contour SVG */}
                              <svg viewBox="0 0 100 45" className="w-[24px] md:w-[32px] h-auto text-white" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M 5 30 Q 25 8 50 8 T 95 30 L 95 33 L 5 33 Z" strokeLinecap="round" />
                                <circle cx="20" cy="31" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                                <circle cx="80" cy="31" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                                <path d="M 2 33 L 98 33" stroke="currentColor" strokeWidth="1" />
                              </svg>
                              
                              <div className="text-[2.5px] md:text-[3px] font-medium tracking-[0.02em] text-neutral-400 leading-none">CAR SHOWROOM</div>
                            </div>
                          </div>
                        ) : (
                          <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-blue-500/50 p-0.5 bg-black/50 overflow-hidden flex-shrink-0 shadow-md">
                            <img 
                              src={reel.sellerAvatar || 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=150&q=80'} 
                              alt={reel.sellerName}
                              className="w-full h-full object-cover rounded-full"
                            />
                          </div>
                        )}
                        <div className="text-left">
                          <h4 className="text-[13px] md:text-[14.5px] font-extrabold tracking-tight text-white flex items-center gap-1 hover:underline leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                            {reel.sellerId === 'demo_seller_1' ? 'redspots' : reel.sellerName}
                            <span className="bg-[#3b82f6] rounded-full p-0.5 inline-flex items-center justify-center w-3.5 h-3.5 shadow">
                              <Check className="w-2.5 h-2.5 text-white fill-white stroke-[4]" />
                            </span>
                          </h4>
                          <span className="text-[9.5px] md:text-[10px] font-bold text-neutral-300 block mt-1 leading-none drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]">Verified Showroom</span>
                        </div>
                      </div>

                      {/* Follow Pill button */}
                      <button 
                        onClick={(e) => handleFollowShowroomClick(e, reel.sellerId, reel.sellerName)}
                        className={`px-3.5 md:px-5 py-1.5 md:py-2.5 rounded-full text-[9px] md:text-[10px] font-black tracking-widest uppercase transition-all duration-300 border cursor-pointer ${
                          isFollowed 
                            ? 'bg-white/10 text-white/55 border-white/5 hover:bg-white/15' 
                            : 'bg-blue-600 hover:bg-blue-750 text-white border-blue-500 hover:scale-105 active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.35)]'
                        }`}
                      >
                        {isFollowed ? "FOLLOWED" : "FOLLOW"}
                      </button>
                    </div>

                    {/* Showroom Verification & Confidence Index Blueprint */}
                    <div className="p-2.5 md:p-3 rounded-xl md:rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md flex items-center justify-between w-full text-[10px] select-none">
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-emerald-500"></span>
                        </span>
                        <div className="text-left">
                          <span className="text-[7.5px] md:text-[8.5px] font-black uppercase tracking-[0.12em] text-[#86868B] block leading-none mb-0.5">Showroom Audited</span>
                          <span className="text-[9.5px] md:text-[10.5px] font-extrabold text-white leading-none">
                            {reel.sellerId === 'demo_seller_1' ? "REDSPOTS GOLD" : "VERIFIED DEALER"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[7.5px] md:text-[8.5px] font-black uppercase tracking-[0.12em] text-[#86868B] block leading-none mb-0.5">Confidence rating</span>
                        <span className="text-[9.5px] md:text-[10.5px] font-black text-emerald-400 font-mono leading-none">
                          {reel.sellerId === 'demo_seller_1' ? "99.2% EXCELLENCE" : "97.8% COMPLIANT"}
                        </span>
                      </div>
                    </div>

                    {/* 2. Description Block */}
                    <div className="text-left w-full space-y-1.5 md:space-y-2">
                      <p className="text-[11.5px] sm:text-[13px] text-zinc-100 leading-relaxed font-semibold tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                        {(() => {
                           const isExpanded = expandedCaptions[reel.id] || false;
                           const isTranslated = translatedReels[reel.id] || false;
                           
                           let text = reel.caption;
                           if (isTranslated) {
                             if (text.includes("Nissan") || text.includes("nissan") || text.includes("GT-R")) {
                               text = "پاکستان کی واحد 2024 نسان جی ٹی آر نسمو کاربن پیک آ چکی ہے! 🇯🇵 🔥 خدا کا شاہکار۔ #NissanGTR #Nismo";
                             } else if (text.includes("Mustang") || text.includes("mustang")) {
                               text = "فورڈ مستنگ کی دھاڑتی ہوئی تیز رفتار عیش و آرام کا تجربہ حاصل کریں۔ سنسیٹ ہائی وے کروز۔ #FordMustang #PakistanSupercars";
                             } else if (text.includes("Porsche") || text.includes("Carrera")) {
                               text = "شاندار سرخ دھاتی باڈی پینٹ پر منعکس اور رقص کرتی ہوئی نیون روشنیاں۔ وقار اور عظمت کا نشان۔ #911Carrera";
                             } else if (text.includes("Audi") || text.includes("R8")) {
                               text = "بارش والی خوبصورت رات۔ شاندار کاربن فائبر سپائلر اور حقیقی ٹریک ریسنگ کی بے مثال کارکردگی۔ #AudiR8";
                             } else {
                               text = "انتہائی فینسی اسپورٹس کار کا نظارہ۔ مزید تفصیلات اور ڈیلز کے لیے ابھی رابطہ کریں۔ 🇵🇰";
                             }
                           }

                           const isLong = text.length > 80;
                           const displayed = isLong && !isExpanded ? `${text.slice(0, 80)}` : text;

                           return (
                             <span>
                               {displayed}
                               {isLong && !isExpanded && (
                                 <button 
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     setExpandedCaptions(p => ({ ...p, [reel.id]: true }));
                                   }}
                                   className="text-blue-400 font-bold ml-1 hover:underline cursor-pointer"
                                 >
                                   ... [more]
                                 </button>
                               )}
                               {isExpanded && (
                                 <button 
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     setExpandedCaptions(p => ({ ...p, [reel.id]: false }));
                                   }}
                                   className="text-blue-400 font-bold ml-2 hover:underline cursor-pointer"
                                 >
                                   Show less
                                 </button>
                               )}
                             </span>
                           );
                        })()}
                      </p>

                      {/* Scrolling Sound Ticker matching YouTube Shorts and TikTok */}
                      <div className="flex items-center gap-2 overflow-hidden text-white/80 w-full mt-2 max-w-[150px] xs:max-w-[200px] sm:max-w-xs md:max-w-sm pointer-events-none select-none bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-md">
                        <Music className="w-3 h-3 text-white/80 animate-pulse shrink-0" />
                        <div className="text-[9.5px] font-black text-white/90 overflow-hidden relative w-full h-3.5">
                          <div className="animate-marquee whitespace-nowrap absolute leading-none">
                            Original Audio - @{reel.sellerId === 'demo_seller_1' ? 'redspots' : reel.sellerName} • {reel.year} {reel.make} {reel.model} Sound Loop Track ⚡
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>

                {/* 2. Vertically Stacked Mid Reaction Actions Column (Responsive layout: side-stack on desktop, absolute overlap on mobile) */}
                <div className="absolute right-3.5 bottom-[104px] md:relative md:right-auto md:bottom-auto flex flex-col gap-4 items-center shrink-0 z-20">
                  
                  {/* Likes (Heart style) */}
                  <div className="flex flex-col items-center">
                    <button 
                      onClick={handleLikeClick}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all bg-white/10 backdrop-blur-md border hover:scale-110 active:scale-95 shadow-lg pointer-events-auto ${
                        isLiked 
                          ? 'text-red-500 border-red-500/40 bg-red-500/10' 
                          : 'text-white border-white/10 hover:bg-white/20'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
                    </button>
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-white/90 mt-1 font-mono tracking-tight select-none">
                      {isLiked ? '2.5K' : '2.4K'}
                    </span>
                  </div>

                  {/* Dislikes (Thumbs-down style) */}
                  <div className="flex flex-col items-center">
                    <button 
                      onClick={handleDislikeToggle}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all bg-white/10 backdrop-blur-md border hover:scale-110 active:scale-95 shadow-lg pointer-events-auto ${
                        isDisliked 
                          ? 'text-indigo-400 border-indigo-500/40 bg-indigo-500/20' 
                          : 'text-white border-white/10 hover:bg-white/20'
                      }`}
                    >
                      <ThumbsDown className="w-5 h-5" />
                    </button>
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-[#9ca3af] mt-1 font-mono select-none">
                      Dislike
                    </span>
                  </div>

                  {/* Comment Trigger (Speech Bubble style) */}
                  <div className="flex flex-col items-center">
                    <button 
                      onClick={() => setShowCommentDrawer(!showCommentDrawer)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all backdrop-blur-md border hover:scale-110 active:scale-95 shadow-lg pointer-events-auto ${
                        showCommentDrawer 
                          ? 'text-[#0071e3] border-[#0071e3]/40 bg-[#0071e3]/20' 
                          : 'text-white border-white/10 bg-white/10'
                      }`}
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-white/90 mt-1 font-mono select-none">
                      {activeReelComments.length + 120}
                    </span>
                  </div>

                  {/* Share Trigger */}
                  <div className="flex flex-col items-center">
                    <button 
                      onClick={handleShareClick}
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white border border-white/10 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:scale-110 active:scale-95 shadow-lg pointer-events-auto"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-white/90 mt-1 font-mono select-none">
                      Share
                    </span>
                  </div>

                  {/* Remix Trigger */}
                  <div className="flex flex-col items-center">
                    <button 
                      onClick={handleRemixClick}
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white border border-white/10 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:scale-110 active:scale-95 shadow-lg pointer-events-auto"
                    >
                      <RefreshCw className="w-5 h-5 hover:rotate-180 transition-transform duration-500" />
                    </button>
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-white/90 mt-1 font-mono select-none">
                      3.2M
                    </span>
                  </div>

                  {/* Bid Proposal Trigger button (Gold dollar sign design matching image) */}
                  {reel.listingId && (
                    <div className="flex flex-col items-center">
                      <button 
                        onClick={() => setShowOfferDialog(true)}
                        className="w-12 h-12 rounded-full border border-yellow-500/35 bg-yellow-500/10 hover:bg-yellow-500/20 flex items-center justify-center text-yellow-500 hover:scale-110 active:scale-95 shadow-md pointer-events-auto transition-all"
                      >
                        <span className="text-xl font-bold font-mono">$</span>
                      </button>
                      <span className="text-[10px] sm:text-[11px] font-extrabold text-yellow-400 mt-1 font-mono tracking-wide uppercase select-none">
                        OFFER
                      </span>
                    </div>
                  )}

                  {/* Rotating Vinyl Disc Sound helper */}
                  <div className="relative w-12 h-12 flex items-center justify-center cursor-pointer pointer-events-auto active:scale-95 mt-1 flex" onClick={handleRemixClick}>
                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/20 flex items-center justify-center relative overflow-hidden animate-[spin_5s_linear_infinite] shadow-[0_0_15px_rgba(139,92,246,0.25)]">
                      <img 
                        src={reel.sellerId === 'demo_seller_1' ? 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=150&q=80' : reel.sellerAvatar || 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=150&q=80'} 
                        alt="Sound vinyl header" 
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div className="absolute w-1.5 h-1.5 rounded-full bg-black border border-white/40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="absolute -top-1 -right-1 text-blue-400 pointer-events-none animate-bounce">
                      <Music className="w-3 h-3.5" />
                    </div>
                  </div>

                </div>

                {/* 3. The Majestic Advanced Comments & Interaction Console (Persistent split grid or overlay on mobile) */}
                <AnimatePresence>
                  {showCommentDrawer && (
                    <motion.div 
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      className="hidden md:flex flex-col w-[380px] lg:w-[450px] h-[82vh] md:h-[95vh] max-h-[720px] md:max-h-[960px] bg-zinc-950/90 border border-white/10 rounded-[28px] md:rounded-[36px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.85)] backdrop-blur-2xl text-left pointer-events-auto"
                    >
                      {/* Comments Console Header */}
                      <div className="p-5 border-b border-white/15 flex justify-between items-center bg-black/60">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-blue-400" />
                          <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
                            Comments 
                            <span className="text-xs bg-white/10 text-white/70 px-2.5 py-0.5 rounded-full font-mono">
                              {activeReelComments.length + 120}
                            </span>
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => toast.success("Filtered by relevance. Most popular verified discussion placed up top!")}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
                            title="Sort comments"
                          >
                            <ListFilter className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setShowCommentDrawer(false)}
                            className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Showroom Verification & Confidence Index (Design Blueprint element) */}
                      {reels[activeIndex] && (
                        <div className="px-5 py-3 border-b border-white/5 bg-gradient-to-r from-blue-500/5 to-purple-500/5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-[#86868B] block font-extrabold font-mono">Showroom Verification</span>
                              <span className="text-[10px] font-bold text-white block">
                                {reels[activeIndex].sellerId === 'demo_seller_1' ? "REDSPOTS GOLD DEALER" : "VERIFIED AUTO PARTNER"}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] uppercase tracking-wider text-[#86868B] block font-extrabold font-mono">Confidence Rating</span>
                            <span className="text-[10px] font-mono font-bold text-emerald-400 block">
                              {reels[activeIndex].sellerId === 'demo_seller_1' ? "99.2% EXCELLENCE" : "97.8% COMPLIANT"}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Micro reaction badges pill track inside console header */}
                      <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02] flex gap-2 overflow-x-auto scrollbar-hidden">
                        {REACTION_PILLS.map((pill, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleReactionPillClick(pill)}
                            className="shrink-0 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-blue-600/20 hover:border-blue-500/50 text-[10px] font-black text-white/90 transition-all cursor-pointer active:scale-95"
                          >
                            {pill}
                          </button>
                        ))}
                      </div>

                      {/* Comments scroll feed */}
                      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hidden">
                        {activeReelComments.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-blue-400 animate-pulse">
                              <MessageSquare className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-white">No discussion yet</p>
                              <p className="text-[10px] text-white/40 mt-1 max-w-xs leading-normal">Share your feedback, ask about mechanical specifications, or contact the verified showroom.</p>
                            </div>
                          </div>
                        ) : (
                          activeReelComments.map((comment) => {
                            const showReplies = expandedReplies[comment.id] || false;
                            const subreplies = getSubReplies(comment.id, comment.text);

                            return (
                              <div key={comment.id} className="flex flex-col gap-2 border-b border-white/5 pb-3">
                                <div className="flex gap-2.5 text-left items-start">
                                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex-shrink-0 overflow-hidden text-center flex items-center justify-center">
                                    {comment.userAvatar ? (
                                      <img src={comment.userAvatar} alt="user avatar" className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-[10px] font-black text-white/60">{comment.userName.charAt(0).toUpperCase()}</span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-extrabold text-blue-400 tracking-tight block hover:underline cursor-pointer">{comment.userName}</span>
                                      <span className="text-[9px] text-white/30 font-mono">verified</span>
                                    </div>
                                    <p className="text-[11px] text-white/95 leading-normal mt-1 bg-white/5 px-3 py-2.5 rounded-2xl border border-white/5 text-left font-medium">
                                      {comment.text}
                                    </p>

                                    {/* Action replies list tools */}
                                    <div className="flex items-center gap-3 mt-1.5 pl-1.5">
                                      <button 
                                        onClick={() => {
                                          toast.success("Loved this community member review!");
                                        }}
                                        className="text-[9.5px] font-bold text-white/50 hover:text-white flex items-center gap-1.5 transition-all"
                                      >
                                        <ThumbsUp className="w-3 h-3" />
                                        <span>Like</span>
                                      </button>
                                      
                                      <button 
                                        onClick={() => {
                                          setNewComment(`@${comment.userName} `);
                                          toast.info(`Mentioned ${comment.userName}. Reply below!`);
                                        }}
                                        className="text-[9.5px] font-bold text-white/50 hover:text-white transition-all"
                                      >
                                        Reply
                                      </button>
                                    </div>

                                    {/* Expandable replies toggle */}
                                    <button
                                      type="button"
                                      onClick={() => setExpandedReplies(prev => ({ ...prev, [comment.id]: !showReplies }))}
                                      className="mt-2.5 flex items-center gap-1 text-[10px] font-extrabold text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showReplies ? 'rotate-180' : ''}`} />
                                      <span>
                                        {showReplies ? `Hide replies` : `View ${subreplies.length} replies`}
                                      </span>
                                    </button>

                                  </div>
                                </div>

                                {/* Slide down sub-replies container with hierarchical thread line */}
                                <AnimatePresence>
                                  {showReplies && (
                                    <motion.div 
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="overflow-hidden pl-7 mt-1.5 border-l-2 border-white/5 select-text space-y-3"
                                    >
                                      {subreplies.map((rep) => (
                                        <div key={rep.id} className="flex gap-2 text-left">
                                          <div className="w-6 h-6 rounded-full bg-zinc-800 border border-white/5 flex-shrink-0 text-center flex items-center justify-center text-[8.5px] font-bold text-white/40 uppercase">
                                            {rep.userName.charAt(1)}
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-center gap-1.5">
                                              <span className="text-[10px] font-extrabold text-white/70">{rep.userName}</span>
                                              <span className="text-[8px] text-white/30 font-mono">{rep.time}</span>
                                            </div>
                                            <p className="text-[11px] text-white/90 leading-normal mt-0.5 bg-white/[0.02] p-2 rounded-xl border border-white/5">
                                              {rep.text}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Quick Interactive custom user comment composer */}
                      <form 
                        onSubmit={handlePostComment}
                        className="p-4 border-t border-white/10 bg-black/60 flex gap-2 items-center"
                      >
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Type specifications query or trade bid..."
                            className="w-full bg-white/5 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all rounded-xl pl-4 pr-10 py-2.5 text-xs text-white font-medium border border-white/5"
                          />
                          <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none animate-pulse" />
                        </div>
                        <button
                          type="submit"
                          disabled={!newComment.trim()}
                          className="w-9 h-9 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-blue-500 transition-all flex items-center justify-center text-white shadow-lg cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>

                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>
          );
        })}
      </div>

      {/* Floating navigation wheels track controls (Inspired by prompt image right-hand side navigator) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-4">
        <button 
          onClick={() => scrollReelsToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/70 hover:text-white transition-all shadow-xl hover:scale-110 disabled:opacity-30 disabled:scale-90"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <button 
          onClick={() => scrollReelsToIndex(activeIndex + 1)}
          disabled={activeIndex === reels.length - 1}
          className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/70 hover:text-white transition-all shadow-xl hover:scale-110 disabled:opacity-30 disabled:scale-90"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile-only drawers fallback (slides in when Comment is tapped on small screens) */}
      <AnimatePresence>
        {showCommentDrawer && (
          <div className="fixed inset-0 z-50 bg-black/75 md:hidden flex flex-col justify-end">
            <div className="flex-1" onClick={() => setShowCommentDrawer(false)} />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full bg-zinc-950/95 border-t border-white/10 rounded-t-[28px] h-[70vh] flex flex-col overflow-hidden text-left shadow-2xl"
            >
              {/* Comment Header */}
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-black/60">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-black text-white">Spotlight Discussion</h3>
                  <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-mono text-white/70">
                    {activeReelComments.length + 120}
                  </span>
                </div>
                <button 
                  onClick={() => setShowCommentDrawer(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Showroom Verification & Confidence Index (Design Blueprint element - Mobile) */}
              {reels[activeIndex] && (
                <div className="px-5 py-3.5 border-b border-white/5 bg-gradient-to-r from-blue-500/5 to-purple-500/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-[#86868B] block font-extrabold font-mono">Showroom Verification</span>
                      <span className="text-[10px] font-bold text-white block">
                        {reels[activeIndex].sellerId === 'demo_seller_1' ? "REDSPOTS GOLD DEALER" : "VERIFIED AUTO PARTNER"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider text-[#86868B] block font-extrabold font-mono">Confidence Rating</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 block">
                      {reels[activeIndex].sellerId === 'demo_seller_1' ? "99.2% EXCELLENCE" : "97.8% COMPLIANT"}
                    </span>
                  </div>
                </div>
              )}

              {/* Reaction track */}
              <div className="px-5 py-3 border-b border-white/5 bg-white/5 flex gap-2 overflow-x-auto scrollbar-hidden">
                {REACTION_PILLS.map((pill, i) => (
                  <button
                    key={i}
                    onClick={() => handleReactionPillClick(pill)}
                    className="shrink-0 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/90"
                  >
                    {pill}
                  </button>
                ))}
              </div>

              {/* Scroll list */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {activeReelComments.map((comment) => (
                  <div key={comment.id} className="flex gap-2.5 text-left">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 overflow-hidden flex-shrink-0 text-center flex items-center justify-center text-[10px] text-white/40">
                      {comment.userAvatar ? (
                        <img src={comment.userAvatar} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        comment.userName.charAt(0)
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-[11px] font-extrabold text-[#0071e3]">{comment.userName}</span>
                      <p className="text-[11px] text-white/90 leading-relaxed mt-0.5 bg-white/5 px-2.5 py-2 rounded-xl">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom input */}
              <form onSubmit={handlePostComment} className="p-4 border-t border-white/10 bg-black/60 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ask showroom spec details..."
                  className="w-full bg-white/5 focus:bg-white/10 focus:outline-none rounded-xl px-4 py-2 text-xs text-white"
                />
                <button type="submit" className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Extreme Glassmorphic Live Negotiation Bid Offer Dialog */}
      <AnimatePresence>
        {showOfferDialog && reels[activeIndex] && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOfferDialog(false)}
              className="absolute inset-0"
            />

            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-zinc-950/95 backdrop-blur-3xl rounded-[32px] border border-white/15 overflow-hidden shadow-2xl p-8 text-left z-10 flex flex-col gap-6"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                    <DollarSign className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-white">Submit Bid Proposal</h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono mt-0.5">Verified Showroom Direct</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOfferDialog(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Target Car Specifications */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-emerald-400 font-mono uppercase tracking-widest font-black block">Target Vehicle</span>
                  <span className="text-sm font-extrabold text-white mt-1 block">
                    {reels[activeIndex].year} {reels[activeIndex].make} {reels[activeIndex].model}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-white/40 font-mono block">Listing Cost</span>
                  <span className="text-sm font-black text-yellow-400 block mt-1">
                    {formatCurrency(reels[activeIndex].price)}
                  </span>
                </div>
              </div>

              <form onSubmit={handleOfferSubmit} className="space-y-5">
                {/* Proposed price inputs */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-2">Propose Bid Price (PKR in Lacs)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={offerPriceInput}
                      onChange={(e) => setOfferPriceInput(e.target.value)}
                      placeholder="e.g. 320"
                      className="w-full bg-white/5 focus:bg-white/10 focus:outline-none font-mono text-xl font-black text-emerald-400 p-4 rounded-xl border border-white/10 focus:ring-1 focus:ring-emerald-400 text-center"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-white/50">Lakh PKR</div>
                  </div>
                </div>

                {/* Live Value Meter Indicator */}
                {(() => {
                  const proposedLac = parseFloat(offerPriceInput);
                  const listedLac = reels[activeIndex].price ? (reels[activeIndex].price / 100000) : 100;
                  if (!proposedLac) return null;

                  const diffPercent = ((proposedLac - listedLac) / listedLac) * 100;
                  let alertText = "LOWBALL WARNING";
                  let alertColor = "text-red-400 border-red-500/20 bg-red-500/10";
                  if (diffPercent >= 0) {
                    alertText = "👑 PLATINUM VALUE HIGH-TICKET ACTION";
                    alertColor = "text-emerald-400 border-emerald-500/25 bg-emerald-500/15 animate-pulse";
                  } else if (diffPercent >= -10) {
                    alertText = "📈 COMPETITIVE DEALER ESTIMATION";
                    alertColor = "text-blue-400 border-blue-500/20 bg-blue-500/10";
                  } else if (diffPercent >= -22) {
                    alertText = "⚠️ FAIR MARKET BATTLE POSITION";
                    alertColor = "text-amber-400 border-amber-500/20 bg-amber-500/10";
                  }

                  return (
                    <div className={`p-4 rounded-xl border ${alertColor} text-xs flex items-center gap-2.5 font-semibold transition-all`}>
                      <Award className="w-5 h-5 shrink-0" />
                      <div>
                        <span className="block font-black uppercase text-[10px] tracking-widest">{alertText}</span>
                        <span className="block text-[10px] opacity-80 mt-1">This bid is {diffPercent < 0 ? `${Math.abs(diffPercent).toFixed(1)}% below` : `${diffPercent.toFixed(1)}% above`} official listing value.</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Buyer specifications notes */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-2">Bid Transfer Specifications</label>
                  <textarea
                    rows={3}
                    value={offerNotesInput}
                    onChange={(e) => setOfferNotesInput(e.target.value)}
                    placeholder="Provide details on transfer times..."
                    className="w-full bg-white/5 focus:bg-white/10 focus:outline-none p-4 rounded-xl text-xs text-white/90 border border-white/10 font-medium"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowOfferDialog(false)}
                    className="flex-1 py-3 text-xs font-bold border border-white/20 hover:bg-white/5 transition-all text-white rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingOffer}
                    className="flex-1 py-3 text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition-all"
                  >
                    {isSubmittingOffer ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> Submit Proposal
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Extreme Glassmorphic Live Share Sheet Modal */}
      <AnimatePresence>
        {showShareSheet && reels[activeIndex] && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareSheet(false)}
              className="absolute inset-0"
            />

            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              className="relative w-full max-w-sm bg-zinc-950/95 border border-white/15 rounded-[32px] overflow-hidden shadow-2xl p-6 text-center z-10 flex flex-col gap-5 text-left"
            >
              <div className="flex justify-between items-center bg-transparent">
                <span className="text-[9px] uppercase tracking-widest font-mono text-blue-400 font-extrabold">Instant Transmission</span>
                <button
                  onClick={() => setShowShareSheet(false)}
                  className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dynamic QR Badge */}
              <div className="mx-auto w-36 h-36 bg-white/5 border border-white/15 rounded-2xl flex items-center justify-center relative overflow-hidden p-2 shadow-inner">
                <QrCode className="w-20 h-20 text-white hover:scale-105 transition-transform" />
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500" style={{ animation: 'scan 2.5s infinite linear' }} />
                <span className="absolute bottom-2 text-[8px] tracking-wider text-white/40 font-mono">SCAN TO STREAM</span>
              </div>

              <div className="text-center">
                <h4 className="text-xs font-black uppercase text-white tracking-widest">Transmit Loop</h4>
                <p className="text-[10px] text-white/40 mt-1 leading-normal">Share this showroom listing across multi-platform networks instantly.</p>
              </div>

              {/* Quick Platform Triggers */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[11px] font-bold text-white cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-blue-400" />}
                  {copiedLink ? "Copied!" : "Copy Link"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const activeReel = reels[activeIndex];
                    const url = window.location.origin + `/marketplace?reel=${activeReel?.id || 'discover'}`;
                    const customText = `Feast your eyes on this spec: ${activeReel?.make} ${activeReel?.model} at Pakizzle! Check the interactive loop now: ${url}`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(customText)}`, '_blank');
                    toast.success("Ready on WhatsApp!");
                  }}
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[11px] font-bold text-white cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  WhatsApp
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Slide Drawer Overlay */}
      <AnimatePresence>
        {isUploading && (
          <ReelsUpload onClose={() => setIsUploading(false)} />
        )}
      </AnimatePresence>

    </div>
  );
}
