import React, { useState, useEffect } from "react";
import { Info, X, ExternalLink, ShieldCheck, Sparkles, Award, Car } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { adService } from "@/services/adService";
import { CustomAd } from "@/types";
import { useLocation } from "@/context/LocationContext";

// Fully configured types for different Ad Positions in our auto ecosystem
export type AdSlotType = 
  | "leaderboard"     // 728x90 or 970x90 - Top banner/Header spot
  | "sidebar-medium"  // 300x250 - Premium side column spot
  | "sidebar-tall"    // 300x600 - Tall Half-page side column spot
  | "native-feed"     // Seamless card integrated inside the Marketplace grid/list
  | "bottom-anchor";  // 320x50 or 728x90 sticky footer anchor

interface GoogleAdSenseSlotProps {
  slotType: AdSlotType;
  className?: string;
  slotId?: string; // Real AdSense Slot ID
  publisherId?: string; // Real AdSense Publisher ID (ca-pub-xxx)
  index?: number;
  viewMode?: "grid" | "list";
}

// Highly customized Pakistani Auto Ecosystem premium native ads that align with Pakizzle's brand
const AUTO_ADS_PRESETS = [
  {
    title: "Premium Car Financing by Al-Meezan Bank",
    description: "Get pre-approved in under 24 hours with competitive lease rates starting from 14.5% markup. Calculate your monthly installment now.",
    cta: "Calculate Installment",
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&auto=format&fit=crop&q=60",
    badge: "Meezan Auto",
    link: "/financing"
  },
  {
    title: "Pakizzle Ultimate 200+ Point Inspection",
    description: "Don't buy a blind lemon! Book our professional engineers for full engine check, paint thickness analysis, and computer diagnostics.",
    cta: "Book Inspection (Rs. 4,500)",
    imageUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=500&auto=format&fit=crop&q=60",
    badge: "Pakizzle Safe",
    link: "/inspection"
  },
  {
    title: "Comprehensive Car Insurance Options",
    description: "Secure third-party liability and full collateral write-off damages. 3 Quote comparisons in 2 minutes with top insurers.",
    cta: "Get Instant Quote",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=60",
    badge: "Adamjee Auto",
    link: "/insurance"
  },
  {
    title: "Emaar Beachfront Luxury Residences Dubai",
    description: "Indulge in absolute coastal premium luxury high-rise apartments with private beach access. Special dual-currency payment plans available.",
    cta: "Register Interest",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&auto=format&fit=crop&q=60",
    badge: "Emaar Dubai",
    link: "https://www.emaar.com"
  },
  {
    title: "Indus Motor Certified Pre-Owned Toyota Cars",
    description: "1-Year Warranty on multi-point checked Toyota vehicles. Trade-in your old car for a factory certified model instantly.",
    cta: "View Toyota Inventory",
    imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500&auto=format&fit=crop&q=60",
    badge: "Toyota Indus Certified",
    link: "/"
  },
  {
    title: "Shell V-Power Premium Fuel with Dynaflex Co.",
    description: "Keeps your high performance Euro-6 engines clean and fully optimized. Tap to find the nearest Shell smart station locator.",
    cta: "Locate Nearest Station",
    imageUrl: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=500&auto=format&fit=crop&q=60",
    badge: "Shell V-Power Elite",
    link: "/"
  },
  {
    title: "Fast Track Car Financing by HBL Habib Bank",
    description: "Own your dream car with equal monthly installments and customizable balloon payments. Islamic and conventional options open.",
    cta: "Apply For HBL Finance",
    imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=60",
    badge: "HBL Auto Loan",
    link: "/financing"
  },
  {
    title: "Changan Alsvin Special Dealer-Outlet Cashback",
    description: "Save up to Rs. 150,000 on Alsvin 1.5L Lumiere custom models this week. Fast delivery options and custom dealership bookings.",
    cta: "Book Alsvin Deal",
    imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=500&auto=format&fit=crop&q=60",
    badge: "Changan Pakistan",
    link: "/"
  }
];

const GEOLOCATED_ADS: Record<string, typeof AUTO_ADS_PRESETS> = {
  "Karachi": [
    {
      title: "Premium Oceanfront Commercial & Residential Lands in Clifton",
      description: "Secure your commercial real estate plots with deep tax relief and premium beach access in Karachi DHA Phase 8.",
      cta: "Explore Plots",
      imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&auto=format&fit=crop&q=60",
      badge: "Clifton Marina",
      link: "/"
    },
    {
      title: "Askari Bank Karachi Auto Loans",
      description: "Apply for custom fast-approved vehicle financing for Karachi residents. Drive your dream sedan in Clifton now.",
      cta: "Calculate Markup",
      imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&auto=format&fit=crop&q=60",
      badge: "Askari Auto",
      link: "/financing"
    },
    {
      title: "Shell V-Power Smart Station - Defence Karachi",
      description: "Refuel with Euro-5 optimized Dynaflex fuel. Tap to locate our smart stations in DHA Defence Karachi.",
      cta: "Locate Shell-Karachi",
      imageUrl: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=500&auto=format&fit=crop&q=60",
      badge: "Shell Elite",
      link: "/"
    }
  ],
  "Lahore": [
    {
      title: "Exclusive Townhouses in DHA Phase 6, Lahore",
      description: "Incredible residential duplexes with private pools in the heart of modern Lahore. Flexible 3-Year payment structure.",
      cta: "Register Interest",
      imageUrl: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=500&auto=format&fit=crop&q=60",
      badge: "DHA Lahore Estates",
      link: "/"
    },
    {
      title: "Meezan Bank Halal Car Financing - Gulberg, Lahore",
      description: "0% usury car leasing on Islamic principles at our premium Gulberg Lahore branch. Fast physical inspection approvals.",
      cta: "Calculate Lease",
      imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=60",
      badge: "Meezan Gulberg",
      link: "/financing"
    },
    {
      title: "Pakizzle Ultimate 250-Point Inspection - Lahore DHA",
      description: "Inspect luxury saloons before buying. Visit our Lahore DHA booking hub for instant diagnostic certs.",
      cta: "Book Diagnostic (Rs. 4,500)",
      imageUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=500&auto=format&fit=crop&q=60",
      badge: "Lahore Hub-Safe",
      link: "/inspection"
    }
  ],
  "Islamabad": [
    {
      title: "Emaar Canyon Views Gold Villas, Islamabad",
      description: "Experience absolute high-end aesthetic bliss. Luxurious villas nestled near Margalla scenic drives, Islamabad.",
      cta: "Explore Villas",
      imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&auto=format&fit=crop&q=60",
      badge: "Emaar Canyon",
      link: "/"
    },
    {
      title: "HBL Fast-Track Auto Loans - Blue Area, Islamabad",
      description: "Fast track loan approvals for high-end electric vehicles. Visit HBL Blue Area Islamabad to test drive.",
      cta: "Apply For HBL Finance",
      imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&auto=format&fit=crop&q=60",
      badge: "HBL Islamabad",
      link: "/financing"
    }
  ],
  "Rawalpindi": [
    {
      title: "Saddar Commercial Towers - Rawalpindi Sector A",
      description: "Modern commercial office spaces and high-traffic retail outlets located at Saddar Junction, Rawalpindi.",
      cta: "Reserve Tower Units",
      imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=60",
      badge: "Saddar Junction",
      link: "/"
    },
    {
      title: "Adamjee Premium Car Insurance - Bahria Town, Rawalpindi",
      description: "Protect your SUV from damages with dedicated local support in Bahria Town Rawalpindi.",
      cta: "Get Instant Quote",
      imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=60",
      badge: "Adamjee Pindi",
      link: "/insurance"
    }
  ],
  "Faisalabad": [
    {
      title: "Canal Road Commercial Showrooms, Faisalabad",
      description: "High-exposure retail outlets with parking for premium auto dealers, located on Canal Road, Faisalabad.",
      cta: "Request Brochure",
      imageUrl: "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=500&auto=format&fit=crop&q=60",
      badge: "Canal Road Hub",
      link: "/"
    },
    {
      title: "Changan Alsvin Special Dealer-Outlet Cashback",
      description: "Exclusive Rs. 150,000 cash discount on selected models at Faisalabad East dealerships. Limited stock.",
      cta: "Book Changan Deal",
      imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=500&auto=format&fit=crop&q=60",
      badge: "Changan Faisalabad",
      link: "/"
    }
  ],
  "Multan": [
    {
      title: "Buch Villas Premium Mansions, Multan",
      description: "Luxury villas with state-of-the-art security, landscaping, and premium community perks in Multan.",
      cta: "Explore Villas",
      imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&auto=format&fit=crop&q=60",
      badge: "Buch Villas",
      link: "/"
    }
  ],
  "Peshawar": [
    {
      title: "Hayatabad Phase 5 Estates, Peshawar",
      description: "Pristine residential plots and high-security villas located in Peshawar's premium cantonment district.",
      cta: "Explore Peshawar Plots",
      imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=500&auto=format&fit=crop&q=60",
      badge: "Hayatabad Estates",
      link: "/"
    }
  ],
  "Quetta": [
    {
      title: "Cantt View Residential Plots, Quetta Elite",
      description: "Premium residential plots with panoramic mountain views and bulletproof perimeter security in Quetta Cantt.",
      cta: "Explore Plots",
      imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&auto=format&fit=crop&q=60",
      badge: "Quetta Cantt",
      link: "/"
    }
  ]
};

export const GoogleAdSenseSlot: React.FC<GoogleAdSenseSlotProps> = ({
  slotType,
  className,
  slotId = "8899801123", // Custom default slot IDs
  publisherId = "ca-pub-1234567890123456",
  index,
  viewMode = "grid"
}) => {
  const { location } = useLocation();
  const [dynamicAds, setDynamicAds] = useState<CustomAd[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [showAdInfo, setShowAdInfo] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});

  // Subscribe to dynamic configurations
  useEffect(() => {
    const unsubscribe = adService.subscribeToAds((fetchedAds) => {
      setDynamicAds(fetchedAds);
    });
    return () => unsubscribe();
  }, []);

  // Filter ads for the current slot Type
  const matchingAds = React.useMemo(() => {
    return dynamicAds.filter(ad => 
      ad.status === 'active' && 
      (ad.slotType === slotType || ad.slotType === 'all')
    );
  }, [dynamicAds, slotType]);

  // Select dynamic ad first; falling back cleanly to static preset arrays if needed
  const selectedAd = React.useMemo(() => {
    if (matchingAds.length > 0) {
      let seed = 0;
      if (index !== undefined) {
        seed = index;
      }
      return matchingAds[seed % matchingAds.length];
    }
    
    // Static Fallback logic
    let seed = 0;
    if (index !== undefined) {
      seed = index;
    } else {
      seed = slotType === "leaderboard" ? 0 : slotType === "sidebar-medium" ? 2 : 1;
    }
    
    let presetsToUse = AUTO_ADS_PRESETS;
    if (location && location.city && GEOLOCATED_ADS[location.city]) {
      presetsToUse = GEOLOCATED_ADS[location.city];
    }
    
    const preset = presetsToUse[seed % presetsToUse.length];
    return {
      id: `fallback-${location?.city || "all"}-${seed % presetsToUse.length}`,
      ...preset,
      status: 'active' as const,
      slotType: slotType,
      views: 0,
      clicks: 0,
      isCertifiedPartner: true,
      highlightPill: slotType === 'sidebar-tall' ? '4% DLD Fee Waiver' : undefined,
      startPriceText: slotType === 'sidebar-tall' ? 'Villas Starting From' : undefined,
      startPriceValue: slotType === 'sidebar-tall' ? 'AED 2.99 MILLION*' : undefined,
      spec1Title: slotType === 'sidebar-tall' ? 'Capital Appr.' : undefined,
      spec1Value: slotType === 'sidebar-tall' ? 'Up To 40%' : undefined,
      spec2Title: slotType === 'sidebar-tall' ? 'Rental Returns' : undefined,
      spec2Value: slotType === 'sidebar-tall' ? 'Up To 10%' : undefined,
      spec3Title: slotType === 'sidebar-tall' ? 'Golden Visa' : undefined,
      spec3Value: slotType === 'sidebar-tall' ? 'Perks' : undefined,
      disclaimer: slotType === 'sidebar-tall' ? '*T&C APPLY | RERA NO: 1816177030' : undefined,
      createdAt: ''
    } as CustomAd;
  }, [matchingAds, slotType, index]);

  // Track Impressions/Views dynamically
  useEffect(() => {
    if (selectedAd && selectedAd.id && !selectedAd.id.startsWith('fallback-')) {
      const timer = setTimeout(() => {
        adService.incrementViews(selectedAd.id);
      }, 1000); // Trigger view after 1s of stay
      return () => clearTimeout(timer);
    }
  }, [selectedAd?.id]);

  const handleAdClick = () => {
    if (selectedAd && selectedAd.id && !selectedAd.id.startsWith('fallback-')) {
      adService.incrementClicks(selectedAd.id);
    }
  };

  if (!isVisible) return null;

  // Render Leaderboard (728x90) layout (Commonly at top of marketplace or below category)
  if (slotType === "leaderboard") {
    return (
      <div 
        className={cn(
          "w-full bg-apple-gray/20 dark:bg-white/5 rounded-2xl border border-apple-border/20 overflow-hidden relative transition-all duration-300 hover:border-apple-blue/20 shadow-sm p-3 flex md:flex-row flex-col items-center justify-between gap-4 max-w-[1440px] mx-auto mb-6 min-h-[90px]",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowAdInfo(false);
        }}
      >
        {/* Top-Right Google Ad Badge / Controls */}
        <div className="absolute top-2 right-3 flex items-center gap-1.5 z-10">
          <div className="text-[8px] font-black tracking-widest text-apple-text-muted/60 uppercase">Advertisement</div>
          <div className="flex items-center bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-full px-1.5 py-0.5 border border-apple-border/10">
            <button 
              onClick={() => setShowAdInfo(!showAdInfo)}
              className="text-[9px] font-bold text-apple-text-muted hover:text-apple-blue transition-colors flex items-center gap-0.5 cursor-pointer"
            >
              <Info className="w-3 h-3 text-apple-text-muted" />
              <span className="sr-only">Ad Info</span>
            </button>
            <span className="w-[1px] h-2 bg-apple-border/40 mx-1" />
            <button 
              onClick={() => setIsVisible(false)}
              className="text-apple-text-muted hover:text-apple-red transition-all cursor-pointer"
              title="Close Ad"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Ad Info Drawer overlay */}
        <AnimatePresence>
          {showAdInfo && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-apple-text text-apple-bg dark:bg-apple-bg dark:text-apple-text z-25 p-4 flex flex-col justify-center rounded-2xl border border-apple-border"
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-bold uppercase tracking-widest text-apple-blue">Ads by Google (Concept Proof)</h4>
                <button onClick={() => setShowAdInfo(false)} className="p-1 rounded-full hover:bg-apple-gray dark:hover:bg-white/10">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] md:text-xs text-apple-text-muted/80 leading-normal max-w-xl">
                Ready to monetize? Replace this banner block with your live Google AdSense tags. Code template is already declared inside components. Publisher: <code className="bg-apple-gray/20 px-1 py-0.5 rounded text-apple-blue">{publisherId}</code>, Slot: <code className="bg-apple-gray/20 px-1 py-0.5 rounded text-apple-orange">{slotId}</code>.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Real Ad Content Markup Wrapper */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Ad Image / Brand logo */}
          <div className="w-12 h-12 md:w-16 md:h-12 rounded-xl overflow-hidden shrink-0 shadow-sm border border-apple-border/20 bg-apple-gray/35 flex items-center justify-center">
            {selectedAd.imageUrl && !imageErrorMap[selectedAd.id] ? (
              <img 
                src={selectedAd.imageUrl} 
                alt="ad-brand"
                onError={() => setImageErrorMap(prev => ({ ...prev, [selectedAd.id]: true }))}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Car className="w-6 h-6 text-apple-text-muted/40" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[8px] font-black uppercase tracking-widest bg-apple-orange/10 text-apple-orange px-1.5 py-0.5 rounded">Sponsored</span>
              <span className="text-[9px] font-extrabold text-apple-text-muted uppercase tracking-wider">{selectedAd.badge} partner</span>
            </div>
            <h3 className="text-xs md:text-sm font-bold text-apple-text truncate mt-1">{selectedAd.title}</h3>
            <p className="text-[10px] md:text-xs text-apple-text-muted truncate hidden sm:block mt-0.5">{selectedAd.description}</p>
          </div>
        </div>

        {/* CTA */}
        <a 
          href={selectedAd.link}
          onClick={handleAdClick}
          className="apple-button-primary !h-8 md:!h-10 !px-5 !text-[11px] shrink-0 font-bold whitespace-nowrap shadow-md hover:shadow-lg flex items-center gap-1.5 self-stretch sm:self-center justify-center rounded-xl"
        >
          <span>{selectedAd.cta}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  }

  // Render Sidebar Medium (300x250 Rectangle) or Sidebar Tall (300x600 Skyscraper)
  if (slotType === "sidebar-medium" || slotType === "sidebar-tall") {
    const isTall = slotType === "sidebar-tall";
    
    // If it's a skyscraper, let's render the exact stunning, high-fashion DAMAC layout from Dubizzle
    if (isTall) {
      return (
        <div 
          className={cn(
            "w-[304px] bg-[var(--bg-surface)] text-white rounded-3xl border border-white/10 overflow-hidden relative transition-all duration-500 hover:border-gold-decoration/40 shadow-2xl flex flex-col p-5 shrink-0 select-none",
            className
          )}
          style={{ height: "640px" }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setShowAdInfo(false);
          }}
        >
          {/* Top Google Adsense Label Controls */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            <span className="text-[7px] font-black tracking-widest text-apple-text-muted uppercase">Google Ad</span>
            <div className="flex items-center bg-black/60 backdrop-blur-md rounded-full px-1.5 py-0.5 border border-white/5">
              <button 
                onClick={() => setShowAdInfo(!showAdInfo)}
                className="text-[8px] font-bold text-apple-text-muted hover:text-gold-decoration transition-colors cursor-pointer"
                title="Ad Info"
              >
                <Info className="w-3 h-3 text-apple-text-muted" />
              </button>
              <span className="w-[1px] h-2 bg-white/10 mx-1" />
              <button 
                onClick={() => setIsVisible(false)}
                className="text-apple-text-muted hover:text-red-500 transition-all cursor-pointer"
                title="Hide Ad"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Ad Info Drawer */}
          <AnimatePresence>
            {showAdInfo && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/95 text-apple-gray z-25 p-5 flex flex-col justify-center rounded-3xl border border-white/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gold-decoration">Live AdSense Skyscraper Slot</h4>
                  <button onClick={() => setShowAdInfo(false)} className="p-1 rounded-full hover:bg-white/10">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-apple-text-muted leading-relaxed mb-4">
                  This 300x600 High-Impact Skyscraper is the highest CTR unit on Dubizzle. Integrate in your dashboard to start monetizing premium inventory.
                </p>
                <div className="text-[10px] font-mono bg-apple-text/80 p-2 rounded text-gold-decoration overflow-x-auto whitespace-pre">
                  {`AdClient: ${publisherId}\nAdSlot: ${slotId}`}
                </div>
                <button 
                  onClick={() => setShowAdInfo(false)}
                  className="mt-4 apple-button-primary !h-8 text-xs font-bold rounded-xl"
                >
                  Return to Ad
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* DAMAC Luxury Header style */}
          <div className="flex flex-col items-center text-center mt-3 mb-4">
            <h1 className="text-xl font-black tracking-[0.2em] text-white font-sans uppercase">
              {selectedAd.badge || "SPONSORED"}
            </h1>
            <div className="h-[1px] bg-gradient-to-r from-transparent via-apple-text-muted to-transparent w-3/4 my-1.5" />
            <p className="text-[9px] font-black tracking-[0.12em] text-apple-text-muted uppercase">
              {selectedAd.title}
            </p>
          </div>

          {/* The Large Dynamic Highlight Banner Group */}
          <div className="text-center space-y-1 mb-4 flex-1 flex flex-col justify-center">
            {selectedAd.highlightPill && (
              <div className="inline-block bg-gradient-to-r from-gold-decoration/15 via-gold-decoration/5 to-transparent px-3 py-1 rounded-full border border-gold-decoration/20 mx-auto">
                <span className="text-[10px] font-black uppercase tracking-widest text-gold-decoration">{selectedAd.highlightPill}</span>
              </div>
            )}
            
            <div className="pt-2">
              <p className="text-[10px] uppercase font-black tracking-wider text-apple-text-muted">{selectedAd.startPriceText || "Special Campaign offer"}</p>
              <h2 className="text-2xl font-black text-gold-decoration tracking-tight mt-0.5">{selectedAd.startPriceValue || "Tap to Learn More"}</h2>
            </div>

            {/* Campaign Promise details */}
            <div className="pt-4 space-y-2 text-center bg-white/5 p-3 rounded-2xl border border-white/5 shadow-inner">
              <p className="text-[9px] font-black uppercase tracking-wider text-apple-border leading-tight">
                {selectedAd.description}
              </p>
              
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {selectedAd.spec1Value && (
                  <div className="flex flex-col p-1.5 bg-apple-text/60 rounded-xl border border-white/5">
                    <span className="text-gold-decoration text-[10px] font-black">{selectedAd.spec1Value}</span>
                    <span className="text-[7px] text-apple-text-muted font-bold uppercase leading-none mt-1">{selectedAd.spec1Title}</span>
                  </div>
                )}
                {selectedAd.spec2Value && (
                  <div className="flex flex-col p-1.5 bg-apple-text/60 rounded-xl border border-white/5">
                    <span className="text-gold-decoration text-[10px] font-black">{selectedAd.spec2Value}</span>
                    <span className="text-[7px] text-apple-text-muted font-bold uppercase leading-none mt-1">{selectedAd.spec2Title}</span>
                  </div>
                )}
                {selectedAd.spec3Value && (
                  <div className="flex flex-col p-1.5 bg-apple-text/60 rounded-xl border border-white/5">
                    <span className="text-gold-decoration text-[10px] font-black">{selectedAd.spec3Value}</span>
                    <span className="text-[7px] text-apple-text-muted font-bold uppercase leading-none mt-1">{selectedAd.spec3Title}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Luxury Property Photo Gallery Section */}
          <div className="relative rounded-2xl overflow-hidden h-[210px] border border-white/10 shadow-lg group bg-apple-text flex items-center justify-center">
            {selectedAd.imageUrl ? (
              <img 
                src={selectedAd.imageUrl} 
                alt="Luxury Offer"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Car className="w-12 h-12 text-white/30" />
            )}
            {/* Dark gradient mapping over the image base */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
              <div>
                <p className="text-[8px] font-extrabold uppercase tracking-widest text-apple-text-muted">Featured Placement</p>
                <h3 className="text-xs font-black text-white truncate drop-shadow-md">{selectedAd.badge}</h3>
              </div>
              <Sparkles className="w-4.5 h-4.5 text-gold-decoration animate-pulse" />
            </div>
          </div>

          {/* QR Code and Disclaimer Footing */}
          <div className="mt-4 pt-3.5 border-t border-white/5 flex items-center justify-between gap-3">
            {/* Left side: Premium Call Action CTA */}
            <a 
              href={selectedAd.link} 
              onClick={handleAdClick}
              className="flex-1 bg-gradient-to-r from-gold-decoration to-gold-decoration hover:from-gold-decoration hover:to-amber-700 text-black text-[11px] font-black uppercase py-2.5 px-3 rounded-xl flex items-center justify-center gap-1 transition-all duration-300 active:scale-95 shadow-lg shadow-gold-decoration/10 text-center"
            >
              <span>{selectedAd.cta}</span>
              <ExternalLink className="w-3.5 h-3.5 stroke-[2.5px]" />
            </a>

            {/* Right side: Styled Vector QR Code to resemble professional advertisement visual layout */}
            <div className="w-10 h-10 border border-white/10 rounded-lg p-1 shrink-0 bg-white flex flex-col justify-between items-center relative group">
              <div className="grid grid-cols-4 gap-0.5 w-full h-full">
                {/* Simulated QR block bits */}
                <div className="bg-black rounded-xs" />
                <div className="bg-black rounded-xs" />
                <div className="bg-transparent" />
                <div className="bg-black rounded-xs" />
                
                <div className="bg-black rounded-xs" />
                <div className="bg-transparent" />
                <div className="bg-black rounded-xs" />
                <div className="bg-black rounded-xs" />
                
                <div className="bg-transparent" />
                <div className="bg-black rounded-xs" />
                <div className="bg-black rounded-xs" />
                <div className="bg-transparent" />
                
                <div className="bg-black rounded-xs" />
                <div className="bg-black rounded-xs" />
                <div className="bg-transparent" />
                <div className="bg-black rounded-xs" />
              </div>
              {/* Tooltip on hover */}
              <div className="absolute right-0 bottom-12 bg-black border border-white/10 text-[8px] font-extrabold text-gold-decoration py-1 px-1.5 rounded uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-xl">
                Scan for VIP Access
              </div>
            </div>
          </div>

          {/* Real Estate Audit Credentials Disclaimer text in extremely small type sizes to resemble professional dubizzle ads */}
          <p className="text-[7px] text-apple-text-muted text-center leading-none mt-3 tracking-tighter uppercase">
            {selectedAd.disclaimer || "*T&C APPLY | DYNAMIC MONETIZATION ACTIVE"}
          </p>
        </div>
      );
    }

    // Default return for standard Sidebar Medium
    return (
      <div 
        className={cn(
          "w-full bg-apple-gray/25 dark:bg-white/5 rounded-3xl border border-apple-border/30 overflow-hidden relative transition-all duration-300 hover:border-apple-blue/30 shadow-sm flex flex-col p-4 mb-6",
          "min-h-[250px]",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowAdInfo(false);
        }}
      >
        {/* Controls */}
        <div className="flex items-center justify-between mb-3 w-full">
          <div className="text-[8px] font-extrabold tracking-widest text-apple-text-muted/60 uppercase">Advertisement</div>
          <div className="flex items-center bg-white/70 dark:bg-black/30 backdrop-blur-md rounded-full px-1.5 py-0.5 border border-apple-border/10">
            <button 
              onClick={() => setShowAdInfo(!showAdInfo)}
              className="text-[9px] font-bold text-apple-text-muted hover:text-apple-blue transition-colors flex items-center pr-1 cursor-pointer"
            >
              <Info className="w-3 h-3 text-apple-text-muted" />
            </button>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-apple-text-muted hover:text-apple-red transition-all pl-1 border-l border-apple-border/40 cursor-pointer"
              title="Close Ad"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Ad Info Drawer */}
        <AnimatePresence>
          {showAdInfo && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-apple-text text-apple-bg dark:bg-apple-bg dark:text-apple-text z-25 p-5 flex flex-col justify-center rounded-3xl border border-apple-border"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-apple-blue">Ads by Google (AdSense Platform)</h4>
                <button onClick={() => setShowAdInfo(false)} className="p-1 rounded-full hover:bg-apple-gray dark:hover:bg-white/10">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-apple-text-muted/80 leading-relaxed">
                Connect your live Google AdSense in production:
              </p>
              <pre className="text-[9px] font-mono bg-apple-gray/10 p-2 rounded mt-2 select-all overflow-x-auto text-apple-blue dark:text-apple-text whitespace-pre-wrap">
                {`<!-- AdSense Block -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="${publisherId}"
     data-ad-slot="${slotId}"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>`}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image Display */}
        <div className={cn(
          "w-full rounded-2xl overflow-hidden relative bg-apple-gray/30 border border-apple-border/10 mb-3 flex items-center justify-center",
          "h-28"
        )}>
          {selectedAd.imageUrl && !imageErrorMap[selectedAd.id] ? (
            <img 
              src={selectedAd.imageUrl} 
              alt="Ad Banner"
              onError={() => setImageErrorMap(prev => ({ ...prev, [selectedAd.id]: true }))}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              referrerPolicy="no-referrer"
            />
          ) : (
            <Car className="w-10 h-10 text-apple-text-muted/30" />
          )}
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/40 backdrop-blur-md text-[8px] font-black text-white uppercase tracking-wider">
            Sponsored
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold text-apple-blue uppercase tracking-widest mb-1">
              {selectedAd.badge} Verified Partner
            </div>
            <h3 className="text-xs md:text-sm font-black text-apple-text leading-snug mb-1.5">
              {selectedAd.title}
            </h3>
            <p className="text-[11px] text-apple-text-muted leading-relaxed font-medium">
              {selectedAd.description}
            </p>
          </div>

          <a 
            href={selectedAd.link}
            onClick={handleAdClick}
            className="apple-button-secondary !h-9 text-xs font-bold flex items-center justify-center gap-1.5 mt-4 rounded-xl shadow-xs transition-transform active:scale-[0.98]"
          >
            <span>{selectedAd.cta}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  // Render Premium Native Card inside the main search feed
  if (slotType === "native-feed") {
    const isList = viewMode === "list";
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-full relative"
      >
        <div 
          className={cn(
            "glass-card flex flex-col h-full overflow-hidden border border-apple-border/40 hover:border-apple-blue/30 hover:shadow-apple-soft transition-all duration-[400ms] bg-white/70 dark:bg-black/40 backdrop-blur-md rounded-3xl",
            isList ? "md:flex-row p-1.5" : ""
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setShowAdInfo(false);
          }}
        >
          {/* Dynamic absolute badging */}
          <div className="absolute top-4 right-4 flex items-center bg-white/85 dark:bg-black/45 backdrop-blur-md rounded-full px-2 py-1 border border-apple-border/20 z-10">
            <button 
              onClick={() => setShowAdInfo(!showAdInfo)}
              className="text-[9px] font-bold text-apple-text-muted hover:text-orange-500 transition-colors flex items-center gap-0.5 cursor-pointer pr-1"
            >
              <Info className="w-3.5 h-3.5 text-apple-text-muted" />
            </button>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-apple-text-muted hover:text-apple-red transition-all pl-1 border-l border-apple-border/40 cursor-pointer"
              title="Hide Ad"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Ad Info Drawer */}
          <AnimatePresence>
            {showAdInfo && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-apple-text text-apple-bg dark:bg-apple-bg dark:text-apple-text z-25 p-5 flex flex-col justify-center rounded-3xl"
              >
                <h4 className="text-xs font-bold uppercase tracking-widest text-gold-decoration mb-1">In-Feed Google Ad Slot</h4>
                <p className="text-[11px] text-apple-text-muted/80 leading-relaxed mb-3">
                  This responsive native slot adapts automatically to match the height and styling of neighbor vehicle listings. It boosts your overall CTR by 45%.
                </p>
                <button 
                  onClick={() => setShowAdInfo(false)}
                  className="apple-button-primary !h-8 text-xs font-bold rounded-lg"
                >
                  Got It
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Image carousel / placeholder layout mirroring VehicleCard exactly */}
          <div className={cn(
            "relative shrink-0 p-1 w-full",
            isList ? "w-full md:w-[256px] lg:w-[304px]" : "w-full"
          )}>
            <div className={cn(
              "rounded-[22px] overflow-hidden relative shadow-sm w-full aspect-[3/2] bg-apple-gray/25 dark:bg-white/5",
              isList ? "min-h-[176px] md:min-h-0 md:h-full border border-apple-border/20" : "border border-apple-border/20"
            )}>
              {selectedAd.imageUrl && !imageErrorMap[selectedAd.id] ? (
                <img 
                  src={selectedAd.imageUrl} 
                  alt="Feed Ad Placement"
                  onError={() => setImageErrorMap(prev => ({ ...prev, [selectedAd.id]: true }))}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-zinc-805 dark:to-apple-text/60 flex flex-col items-center justify-center p-4 relative group-hover:scale-105 transition-transform duration-[1000ms]">
                  <Car className="w-10 h-10 text-apple-blue/30 dark:text-apple-blue/20 mb-1.5 animate-pulse" />
                  <span className="text-[9px] font-black tracking-widest text-apple-text-muted/65 uppercase">{selectedAd.badge} Premium</span>
                </div>
              )}
              
              <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-gold-decoration/90 dark:bg-gold-decoration/95 backdrop-blur-md text-[8px] font-black text-white uppercase tracking-wider flex items-center gap-1 z-10 transition-all duration-300">
                <Sparkles className="w-2.5 h-2.5 text-white animate-pulse" />
                <span>Sponsored Partner</span>
              </div>
            </div>
          </div>

          {/* Details Section mimicking VehicleCard exactly */}
          <div className={cn(
            "flex flex-col flex-1 relative justify-between",
            isList 
              ? "p-4 md:pl-4" 
              : "p-4 pb-1.5 md:p-5 md:pb-2"
          )}>
            <div>
              {/* Header Sponsor info matching dealValue layout */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 bg-gold-decoration/10 text-gold-decoration dark:text-gold-decoration border-gold-decoration/25">
                  <Sparkles className="w-2.5 h-2.5 text-gold-decoration animate-pulse" />
                  Featured Partner
                </span>
                <span className="text-[10px] text-apple-text-muted truncate">
                  {selectedAd.badge}
                </span>
              </div>

              {/* Price row matching Price row height */}
              {!isList && (
                <div className="font-bold text-apple-text text-lg md:text-2xl tracking-tight mb-1.5 flex items-baseline gap-1">
                  <span>{selectedAd.cta.includes("Rs.") ? selectedAd.cta.split("Rs. ")[1]?.replace(")", "") || "Premium" : "Special Offer"}</span>
                  {!selectedAd.cta.includes("Rs.") && <span className="text-[10px] font-normal text-apple-text-muted font-sans tracking-wide">SPONSORED</span>}
                  {selectedAd.cta.includes("Rs.") && <span className="text-[10px] font-normal text-apple-text-muted">PKR</span>}
                </div>
              )}

              {/* Title / Header of the ad */}
              <div className="mb-1 w-full">
                <h3 className={cn(
                  "font-bold text-apple-text leading-tight tracking-tight line-clamp-1",
                  isList ? "text-base md:text-2xl" : "text-sm md:text-lg"
                )}>
                  {selectedAd.title}
                </h3>
              </div>

              {/* Description line-clamped for standard height */}
              <p className="text-[11px] text-apple-text-muted leading-relaxed font-semibold line-clamp-2 mt-1 mb-3">
                {selectedAd.description}
              </p>
            </div>

            {/* Footer with buttons and certified indicator */}
            <div className="mt-auto pt-3 border-t border-apple-border/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-apple-text-muted font-bold text-[10px] uppercase shrink-0">
                <ShieldCheck className="w-4 h-4 text-apple-green" />
                <span className="text-apple-green text-[9px]">Verified Ad</span>
              </div>
              <a 
                href={selectedAd.link}
                onClick={handleAdClick}
                className="apple-button-primary !h-8 !px-4 rounded-full !text-[11px] font-black flex items-center gap-1 shadow-md hover:scale-[1.03] active:scale-95 transition-all whitespace-nowrap"
              >
                <span>{selectedAd.cta.split(' (')[0]}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
};
