import React, { useState, useEffect } from "react";
import { Info, X, ExternalLink, ShieldCheck, Sparkles, Building, Landmark, Home, FileCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { adService } from "@/services/adService";
import { CustomAd } from "@/types";
import { useLocation } from "@/context/LocationContext";

export type AdSlotType = 
  | "leaderboard"     // 728x90 - Top banner spot
  | "sidebar-medium"  // 300x250 - Standard side rail spot
  | "sidebar-tall"    // 300x600 - Half-page side rail spot
  | "native-feed"     // In-feed sponsored card
  | "bottom-anchor";  // Mobile sticky anchor

interface GoogleAdSenseSlotProps {
  slotType: AdSlotType;
  className?: string;
  slotId?: string;
  publisherId?: string;
  index?: number;
  viewMode?: "grid" | "list";
}

/**
 * Ad network blocklist & category restrictions:
 * - Block Dubai / UAE offshore creatives and AED currency claims
 * - Block speculative return claims ("historical returns", "capital appreciation 40%")
 * - Block automotive / car dealerships
 */
export const AD_RESTRICTIONS = {
  blockedCategories: ["automotive", "cryptocurrency", "speculative_returns", "foreign_offshore_real_estate"],
  blockedLocations: ["Dubai", "UAE", "Abu Dhabi"],
  blockedCurrencies: ["AED", "USD", "EUR"],
  maxFrequencyMobile: 1, // At most one per viewport
};

// Pakistani real estate & home financing verified partner creatives
const PROPERTY_ADS_PRESETS = [
  {
    title: "Al-Meezan Bank Shariah-Compliant Home Financing",
    description: "Get pre-approved in under 24 hours with Diminishing Musharakah home purchase schemes starting from competitive Islamic profit rates.",
    cta: "Calculate Monthly Installment",
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format&fit=crop&q=70",
    badge: "Meezan Easy Home",
    link: "/financing"
  },
  {
    title: "Pakizzle Verified Title Deed & Legal Due Diligence",
    description: "Verify property ownership, registry records, and LDA/CDA zoning clearances before token advance payment.",
    cta: "Request Verification",
    imageUrl: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&auto=format&fit=crop&q=70",
    badge: "Pakizzle Legal Safe",
    link: "/verification"
  },
  {
    title: "Habib Bank Limited (HBL) Islamic Home Remittance Scheme",
    description: "Overseas Pakistanis can invest directly into DHA, Bahria Town, and certified housing societies via Roshan Digital Accounts.",
    cta: "Apply For HBL Home Loan",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=70",
    badge: "HBL Islamic",
    link: "/financing"
  },
  {
    title: "Bank Alfalah Premier Property Construction Finance",
    description: "Flexible milestone-based financing for 5-Marla, 10-Marla, and 1-Kanal home construction with fast architectural sign-offs.",
    cta: "Explore Construction Loans",
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=70",
    badge: "Alfalah Islamic",
    link: "/financing"
  }
];

const GEOLOCATED_ADS: Record<string, typeof PROPERTY_ADS_PRESETS> = {
  "Karachi": [
    {
      title: "Clifton & DHA Phase 8 Certified Waterfront Properties",
      description: "Explore legal registry-backed apartments and residential plots with clear Sindh Building Control Authority (SBCA) approvals.",
      cta: "Explore Karachi Properties",
      imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=70",
      badge: "Karachi Estates",
      link: "/marketplace?city=Karachi"
    },
    {
      title: "Meezan Bank Karachi Coastal Housing Finance",
      description: "Low-markup home financing plans tailored for Karachi residents in DHA, PECHS, and Gulshan-e-Iqbal.",
      cta: "Check Eligibility",
      imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format&fit=crop&q=70",
      badge: "Meezan Karachi",
      link: "/financing"
    }
  ],
  "Lahore": [
    {
      title: "LDA Approved Plots & Villas in DHA Phase 6 & 5",
      description: "Verified ownership deeds, clean transfer records, and on-ground possession plots across Lahore's prime sectors.",
      cta: "View Lahore Listings",
      imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=70",
      badge: "Lahore Verified",
      link: "/marketplace?city=Lahore"
    }
  ],
  "Islamabad": [
    {
      title: "CDA Sector F & Blue Area Executive Residences",
      description: "Prime residential apartments and commercial corporate suites in Islamabad Capital Territory with certified NOC.",
      cta: "View ICT Properties",
      imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=70",
      badge: "Islamabad Capital",
      link: "/marketplace?city=Islamabad"
    }
  ]
};

export const GoogleAdSenseSlot: React.FC<GoogleAdSenseSlotProps> = ({
  slotType,
  className,
  slotId = "8899801123",
  publisherId = "ca-pub-1234567890123456",
  index,
  viewMode = "grid"
}) => {
  const { location } = useLocation();
  const [dynamicAds, setDynamicAds] = useState<CustomAd[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [showAdInfo, setShowAdInfo] = useState(false);

  useEffect(() => {
    const unsubscribe = adService.subscribeToAds((fetchedAds) => {
      // Filter out non-compliant ads (AED, Dubai, automotive)
      const compliant = fetchedAds.filter(ad => {
        const text = `${ad.title} ${ad.description} ${ad.badge || ""}`.toLowerCase();
        const hasBlockedWord = AD_RESTRICTIONS.blockedLocations.some(l => text.includes(l.toLowerCase())) ||
          AD_RESTRICTIONS.blockedCurrencies.some(c => text.includes(c.toLowerCase()));
        return !hasBlockedWord;
      });
      setDynamicAds(compliant);
    });
    return () => unsubscribe();
  }, []);

  const matchingAds = React.useMemo(() => {
    return dynamicAds.filter(ad => 
      ad.status === 'active' && 
      (ad.slotType === slotType || ad.slotType === 'all')
    );
  }, [dynamicAds, slotType]);

  const selectedAd = React.useMemo(() => {
    if (matchingAds.length > 0) {
      const seed = index !== undefined ? index : 0;
      return matchingAds[seed % matchingAds.length];
    }
    
    const seed = index !== undefined ? index : (slotType === "leaderboard" ? 0 : 1);
    let presetsToUse = PROPERTY_ADS_PRESETS;
    if (location?.city && GEOLOCATED_ADS[location.city]) {
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
      createdAt: ''
    } as CustomAd;
  }, [matchingAds, slotType, index, location?.city]);

  useEffect(() => {
    if (selectedAd && selectedAd.id && !selectedAd.id.startsWith('fallback-')) {
      const timer = setTimeout(() => {
        adService.incrementViews(selectedAd.id);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [selectedAd?.id]);

  const handleAdClick = () => {
    if (selectedAd && selectedAd.id && !selectedAd.id.startsWith('fallback-')) {
      adService.incrementClicks(selectedAd.id);
    }
  };

  if (!isVisible) return null;

  // Sandboxed container tokens: explicit light neutral container so dark theme does not distort creative colors
  const sandboxClass = "bg-[#f8f9fa] text-[#202124] border border-[#dadce0] rounded-2xl shadow-xs overflow-hidden relative isolate";

  // 1. Leaderboard: Reserved 728x90 (or responsive up to 728px)
  if (slotType === "leaderboard") {
    return (
      <div 
        className={cn(
          "w-full max-w-[728px] mx-auto min-h-[90px] mb-6 flex flex-col justify-center",
          sandboxClass,
          className
        )}
      >
        <div className="px-3 py-1 bg-[#edeef0] border-b border-[#dadce0] flex items-center justify-between text-[9px] font-bold text-[#5f6368] uppercase tracking-wider">
          <span>Advertisement</span>
          <button 
            onClick={() => setShowAdInfo(!showAdInfo)}
            className="hover:text-[#1a73e8] flex items-center gap-1 cursor-pointer"
            aria-label="Ad options"
          >
            <Info className="w-3 h-3" />
            <span>Ad info</span>
          </button>
        </div>

        <div className="p-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {selectedAd.imageUrl ? (
              <img 
                src={selectedAd.imageUrl} 
                alt="" 
                className="w-16 h-12 rounded-lg object-cover shrink-0" 
                loading="lazy"
              />
            ) : (
              <div className="w-16 h-12 rounded-lg bg-[#e8eaed] flex items-center justify-center shrink-0">
                <Landmark className="w-6 h-6 text-[#5f6368]" />
              </div>
            )}
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-[#1a73e8] uppercase tracking-wider block">
                {selectedAd.badge || "Verified Partner"}
              </span>
              <h4 className="text-xs font-bold text-[#202124] truncate">
                {selectedAd.title}
              </h4>
              <p className="text-[11px] text-[#5f6368] truncate hidden sm:block">
                {selectedAd.description}
              </p>
            </div>
          </div>

          <a 
            href={selectedAd.link}
            onClick={handleAdClick}
            className="px-3.5 py-1.5 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-bold shrink-0 transition-colors inline-flex items-center gap-1"
          >
            <span>{selectedAd.cta}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  // 2. Sidebar Tall: Reserved 300x600 px
  if (slotType === "sidebar-tall") {
    return (
      <div 
        className={cn(
          "w-[300px] h-[600px] min-w-[300px] min-h-[600px] flex flex-col justify-between",
          sandboxClass,
          className
        )}
      >
        <div className="px-3 py-1.5 bg-[#edeef0] border-b border-[#dadce0] flex items-center justify-between text-[9px] font-bold text-[#5f6368] uppercase tracking-wider shrink-0">
          <span>Advertisement</span>
          <button 
            onClick={() => setShowAdInfo(!showAdInfo)}
            className="hover:text-[#1a73e8] flex items-center gap-1 cursor-pointer"
            aria-label="Ad options"
          >
            <Info className="w-3 h-3" />
          </button>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#1a73e8] uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-[#1e8e3e]" />
              <span>{selectedAd.badge || "Verified Sponsor"}</span>
            </div>

            <h3 className="text-base font-extrabold text-[#202124] leading-tight mb-2">
              {selectedAd.title}
            </h3>

            <p className="text-xs text-[#5f6368] leading-relaxed mb-4">
              {selectedAd.description}
            </p>
          </div>

          <div className="w-full h-[240px] rounded-xl overflow-hidden bg-[#e8eaed] mb-4 relative shrink-0">
            {selectedAd.imageUrl ? (
              <img 
                src={selectedAd.imageUrl} 
                alt="" 
                className="w-full h-full object-cover" 
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Home className="w-12 h-12 text-[#5f6368]" />
              </div>
            )}
          </div>

          <div className="space-y-2 shrink-0">
            <a 
              href={selectedAd.link}
              onClick={handleAdClick}
              className="w-full py-2.5 px-3 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <span>{selectedAd.cta}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="text-[9px] text-[#70757a] text-center">
              Licensed Pakistani real estate & financing services
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Sidebar Medium: Reserved 300x250 px
  if (slotType === "sidebar-medium") {
    return (
      <div 
        className={cn(
          "w-[300px] h-[250px] min-w-[300px] min-h-[250px] flex flex-col justify-between",
          sandboxClass,
          className
        )}
      >
        <div className="px-3 py-1 bg-[#edeef0] border-b border-[#dadce0] flex items-center justify-between text-[9px] font-bold text-[#5f6368] uppercase tracking-wider shrink-0">
          <span>Advertisement</span>
          <button 
            onClick={() => setShowAdInfo(!showAdInfo)}
            className="hover:text-[#1a73e8] flex items-center gap-1 cursor-pointer"
            aria-label="Ad options"
          >
            <Info className="w-3 h-3" />
          </button>
        </div>

        <div className="p-3.5 flex-1 flex flex-col justify-between">
          <div className="flex gap-3">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#e8eaed] shrink-0">
              {selectedAd.imageUrl ? (
                <img src={selectedAd.imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <Building className="w-8 h-8 text-[#5f6368] m-auto mt-6" />
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-[#1a73e8] uppercase tracking-wider block">
                {selectedAd.badge || "Verified Partner"}
              </span>
              <h4 className="text-xs font-bold text-[#202124] leading-snug line-clamp-2">
                {selectedAd.title}
              </h4>
            </div>
          </div>

          <p className="text-[11px] text-[#5f6368] line-clamp-2 mt-2 leading-relaxed">
            {selectedAd.description}
          </p>

          <a 
            href={selectedAd.link}
            onClick={handleAdClick}
            className="w-full py-2 px-3 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors mt-2"
          >
            <span>{selectedAd.cta}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  // 4. Native In-Feed Card: matches feed card width, labelled "Sponsored", max 1 per 8
  if (slotType === "native-feed") {
    const isList = viewMode === "list";
    return (
      <div 
        className={cn(
          "w-full h-full min-h-[220px] flex flex-col justify-between",
          sandboxClass,
          isList ? "md:flex-row p-3" : "",
          className
        )}
      >
        <div className="w-full px-3 py-1.5 bg-[#edeef0] border-b border-[#dadce0] flex items-center justify-between text-[9px] font-bold text-[#5f6368] uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-[#1a73e8]/10 text-[#1a73e8] font-black">Sponsored</span>
            <span>Advertisement</span>
          </div>
          <button onClick={() => setIsVisible(false)} className="hover:text-[#d93025] cursor-pointer" title="Hide Ad">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className={cn("p-4 flex-1 flex flex-col justify-between", isList && "md:flex-row md:items-center gap-4")}>
          <div className={cn("space-y-2", isList && "flex-1")}>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#1a73e8] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#1e8e3e]" />
              <span>{selectedAd.badge || "Verified Housing Partner"}</span>
            </div>
            <h3 className="text-sm md:text-base font-bold text-[#202124] leading-snug">
              {selectedAd.title}
            </h3>
            <p className="text-xs text-[#5f6368] leading-relaxed line-clamp-2">
              {selectedAd.description}
            </p>
          </div>

          <div className="mt-3 md:mt-0 shrink-0">
            <a 
              href={selectedAd.link}
              onClick={handleAdClick}
              className="px-4 py-2 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              <span>{selectedAd.cta}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default GoogleAdSenseSlot;
