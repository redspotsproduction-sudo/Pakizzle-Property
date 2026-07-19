import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Megaphone,
  Search,
  ExternalLink,
  MoreVertical,
  Upload,
  X,
  Sparkles,
  ShieldCheck,
  Award,
  Eye,
  MousePointerClick,
  Percent,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { adService } from "@/services/adService";
import { CustomAd } from "@/types";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Core pre-populated automotive native partner ads for automatic bootstrapping
const PRESETS_FOR_BOOTSTRAP = [
  {
    title: "Premium Car Financing by Al-Meezan Bank",
    description: "Get pre-approved in under 24 hours with competitive lease rates starting from 14.5% markup. Calculate your monthly installment now.",
    cta: "Calculate Installment",
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&auto=format&fit=crop&q=60",
    badge: "Meezan Auto",
    link: "/financing",
    slotType: "native-feed" as const,
    isCertifiedPartner: true,
    status: "active" as const
  },
  {
    title: "Pakizzle Ultimate 200+ Point Inspection",
    description: "Don't buy a blind lemon! Book our professional engineers for full engine check, paint thickness analysis, and computer diagnostics.",
    cta: "Book Inspection (Rs. 4,500)",
    imageUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=500&auto=format&fit=crop&q=60",
    badge: "Pakizzle Safe",
    link: "/inspection",
    slotType: "native-feed" as const,
    isCertifiedPartner: true,
    status: "active" as const
  },
  {
    title: "Comprehensive Car Insurance Options",
    description: "Secure third-party liability and full collateral write-off damages. 3 Quote comparisons in 2 minutes with top insurers.",
    cta: "Get Instant Quote",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=60",
    badge: "Adamjee Auto",
    link: "/insurance",
    slotType: "native-feed" as const,
    isCertifiedPartner: true,
    status: "active" as const
  },
  {
    title: "DAMAC Lagoon Luxury High-Rise Residences Dubai",
    description: "Exclusive May Offer. Villas & Apartments with 4% DLD Fee Waiver, Private Beach Access and dual-currency options.",
    cta: "Explore Offers",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&auto=format&fit=crop&q=80",
    badge: "DAMAC Properties",
    link: "https://www.damacproperties.com",
    slotType: "sidebar-tall" as const,
    isCertifiedPartner: true,
    status: "active" as const,
    highlightPill: "4% DLD Fee Waiver",
    startPriceText: "Villas Starting From",
    startPriceValue: "AED 2.99 MILLION*",
    spec1Title: "Capital Appr.",
    spec1Value: "Up To 40%",
    spec2Title: "Rental Returns",
    spec2Value: "Up To 10%",
    spec3Title: "Golden Visa",
    spec3Value: "Perks",
    disclaimer: "*T&C APPLY | RERA NO: 1816177030 | HISTORICAL RETURNS"
  }
];

// 22+ Top-notch high CTR monetization templates across Auto, Finance, Property and Accessories
const PREMIUM_AD_TEMPLATES = [
  {
    category: "Finance",
    title: "Premium Car Financing by Meezan Bank",
    description: "Enjoy quick approval and easy monthly installments starting from 14.5% profit rates. Shariah-compliant solutions for your next car purchase.",
    cta: "Calculate Lease",
    imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80",
    badge: "Meezan Bank",
    link: "/financing",
    slotType: "native-feed" as const,
    isCertifiedPartner: true,
    status: "active" as const,
    highlightPill: "No Hidden Costs",
    disclaimer: "*Subject to Bank terms and credit checks"
  },
  {
    category: "Finance",
    title: "Habib Bank Islamic Auto Loan Tracker",
    description: "Get up to 70% financing for brand new or imported vehicles with swift digital documentation and minimum deposit constraints.",
    cta: "Apply for Loan",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80",
    badge: "HBL Islamic MT",
    link: "/financing",
    slotType: "leaderboard" as const,
    isCertifiedPartner: true,
    status: "active" as const
  },
  {
    category: "Finance",
    title: "Alfa Flexi-Lease Digital Rates",
    description: "Exclusive vehicle financing rates for certified buyers. Live calculator with zero processing overhead fee.",
    cta: "Apply in 2 Min",
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80",
    badge: "Bank Alfalah",
    link: "/financing",
    slotType: "sidebar-medium" as const,
    isCertifiedPartner: true,
    status: "active" as const
  },
  {
    category: "Finance",
    title: "Standard Chartered Elite Auto Plus",
    description: "Premium rates for working professionals. Hassle-free documentation, fixed markups, and flexible tenure scaling up to 5 years.",
    cta: "Check Eligibility",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
    badge: "SCB Auto",
    link: "/financing",
    slotType: "sidebar-tall" as const,
    isCertifiedPartner: true,
    status: "active" as const,
    highlightPill: "Elite Tier Rates",
    startPriceText: "Financing Rates From",
    startPriceValue: "12.99% FIXED APR",
    spec1Title: "Processing Fee",
    spec1Value: "0% Initial",
    spec2Title: "Max Tenure",
    spec2Value: "5 Years",
    spec3Title: "Est. Approval",
    spec3Value: "48 Hours",
    disclaimer: "*Terms & conditions apply. For tier-1 credit scores."
  },
  {
    category: "Real Estate",
    title: "DAMAC Lagoons Resort-Style Living Dubai",
    description: "Mediterranean-inspired villas themed around elite beaches, crystal lagoons, and yacht access. 4% DLD Fee fully waived for instant buyers.",
    cta: "Get Brochure",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80",
    badge: "DAMAC Properties",
    link: "https://www.damacproperties.com",
    slotType: "sidebar-tall" as const,
    isCertifiedPartner: true,
    status: "active" as const,
    highlightPill: "4% DLD Waiver",
    startPriceText: "Villas Starting From",
    startPriceValue: "AED 1.99M*",
    spec1Title: "Capital Gain",
    spec1Value: "Up to 35%",
    spec2Title: "Rental Yield",
    spec2Value: "Up to 9%",
    spec3Title: "Golden Visa",
    spec3Value: "Confirmed",
    disclaimer: "*RERA Reg 1819 | Custom financing options available"
  },
  {
    category: "Real Estate",
    title: "Emaar Beachfront Premium Marina Residences",
    description: "Stellar waterfront sunrise views, isolated white sand corridor, and gourmet hubs. Configurable payment timelines.",
    cta: "Book Beach Condo",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=80",
    badge: "Emaar Beachfront",
    link: "https://www.emaar.com",
    slotType: "sidebar-tall" as const,
    isCertifiedPartner: true,
    status: "active" as const,
    highlightPill: "10% Booking deposit",
    startPriceText: "Penthouses From",
    startPriceValue: "AED 2.49 MILLION*",
    spec1Title: "Water Access",
    spec1Value: "Private Cove",
    spec2Title: "Payment Plan",
    spec2Value: "80/20 Payment",
    spec3Title: "Est. Handover",
    spec3Value: "Q4 2027",
    disclaimer: "*Exquisite limited inventory. Verified Emaar broker allocation."
  },
  {
    category: "Real Estate",
    title: "Nakheel Palm Jebel Ali Waterfront Castles",
    description: "The crown jewel of sand beach expansions. Massive mansions featuring architectural floorplan personalization options.",
    cta: "Reserve Estate",
    imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&auto=format&fit=crop&q=80",
    badge: "Nakheel Properties",
    link: "https://www.nakheel.com",
    slotType: "native-feed" as const,
    isCertifiedPartner: true,
    status: "active" as const
  },
  {
    category: "Services",
    title: "Verified 200+ Point Mechanical Auto Inspection",
    description: "Don't buy a used car blindly. Secure certified mechanics with engine compression logs, OBD diagnostics, and crash rebuild indicators.",
    cta: "Schedule Inspection",
    imageUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80",
    badge: "Pakizzle Inspector",
    link: "/inspection",
    slotType: "native-feed" as const,
    isCertifiedPartner: true,
    status: "active" as const
  },
  {
    category: "Services",
    title: "Shell Helix Ultra Luxury Synthetic Oil Service",
    description: "Maximize mechanical engine longevity. Premium fully synthetic oils optimized for low friction and maximum thermal cooling. Reserve at any Shell service point.",
    cta: "Locate Nearest Station",
    imageUrl: "https://images.unsplash.com/photo-1487014679447-9f8336841d58?w=600&auto=format&fit=crop&q=80",
    badge: "Shell Pakistan",
    link: "/maintenance",
    slotType: "native-feed" as const,
    isCertifiedPartner: true,
    status: "active" as const
  },
  {
    category: "Services",
    title: "Elite Car Ceramic Detailing & Surface Shielding",
    description: "Authorized 9H hardness nano-grade formulations. Gloss guarantee up to 5 years with extreme waterproofing and UV ray shielding warranty.",
    cta: "Claim 15% Detailing Off",
    imageUrl: "https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?w=600&auto=format&fit=crop&q=80",
    badge: "Cerashield Expert",
    link: "/maintenance",
    slotType: "sidebar-medium" as const,
    isCertifiedPartner: true,
    status: "active" as const
  },
  {
    category: "Services",
    title: "Suzuki Authorized Mechanical Engine Overhaul",
    description: "Breathe new compression into your daily commuter. Factory specialists handling engine swaps, injector resets and dynamic wheel balancing tests.",
    cta: "Book Authorized Diagnostic",
    imageUrl: "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=600&auto=format&fit=crop&q=80",
    badge: "Suzuki Care Labs",
    link: "/maintenance",
    slotType: "leaderboard" as const,
    isCertifiedPartner: true,
    status: "active" as const
  },
  {
    category: "Insurance",
    title: "Instant Car Insurance Quotes - Save Up To 20%",
    description: "Compare authentic policies from Adamjee, Jubilee, and EFU instantly. Get complete damage, theft, and third-party protection cover in 3 minutes.",
    cta: "Compare Rates Now",
    imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=80",
    badge: "Adamjee Motor Cover",
    link: "/insurance",
    slotType: "native-feed" as const,
    isCertifiedPartner: true,
    status: "active" as const
  },
  {
    category: "Insurance",
    title: "EFU Premium Comprehensive Bumper Cover",
    description: "Comprehensive highway protection suite. Total collision coverage with rapid towing, zero processing deductibles, and direct dealer payouts.",
    cta: "Get Instant Quote",
    imageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop&q=80",
    badge: "EFU General Auto",
    link: "/insurance",
    slotType: "sidebar-medium" as const,
    isCertifiedPartner: true,
    status: "active" as const
  },
  {
    category: "Insurance",
    title: "Jubilee Islamic Motor Takaful Advantage",
    description: "Purely ethical Shariah-compliant auto pool protection. High annual rebate potential with quick cash transfer for parts reimbursement.",
    cta: "Calculate Shariah Premium",
    imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&auto=format&fit=crop&q=80",
    badge: "Jubilee Takaful",
    link: "/insurance",
    slotType: "leaderboard" as const,
    isCertifiedPartner: true,
    status: "active" as const
  },
  {
    category: "Rental",
    title: "Hertz Corporate Monthly Car Rentals",
    description: "Lease executive crossovers and sedans with zero registration maintenance, zero engine repair overheads, and immediate roadside tyre drop-offs.",
    cta: "Browse Active Fleet",
    imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&auto=format&fit=crop&q=80",
    badge: "Hertz Pakistan VIP",
    link: "/rentals",
    slotType: "native-feed" as const,
    isCertifiedPartner: true,
    status: "active" as const
  },
  {
    category: "Rental",
    title: "Sixt Executive Luxury Chauffeur Travel",
    description: "Pre-book bulletproof SUVs or Mercedes Benz luxury cruisers driven by English-fluent professional, screen-verified drivers for business.",
    cta: "Book Chauffeur Now",
    imageUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=80",
    badge: "Sixt Executive Class",
    link: "/rentals",
    slotType: "sidebar-medium" as const,
    isCertifiedPartner: true,
    status: "active" as const
  },
  {
    category: "Accessories",
    title: "NightVision Ultra LED Beam Upgrades",
    description: "Instantly multiply highway visual reach by 400%. High speed dual-cooling fan kits compatible with all domestic automotive setups.",
    cta: "Order Direct (Rs. 4,500)",
    imageUrl: "https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=600&auto=format&fit=crop&q=80",
    badge: "BeamMax Auto LED",
    link: "/accessories",
    slotType: "native-feed" as const,
    isCertifiedPartner: false,
    status: "active" as const
  },
  {
    category: "Accessories",
    title: "Smart Android 9-inch Infotainment Dash Screen",
    description: "Support for Apple CarPlay, Android Auto, and offline satellite maps. Free installation at any authorized dealership hub across cities.",
    cta: "Claim Install Special",
    imageUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop&q=80",
    badge: "Gizmo Pro Car",
    link: "/accessories",
    slotType: "sidebar-medium" as const,
    isCertifiedPartner: true,
    status: "active" as const
  },
  {
    category: "Accessories",
    title: "Michelin Pilot Sport 5 Premium Track Tyres",
    description: "Maximum road traction and wet grip braking performance. High-stability carbon sidewall tech. Get a set of 4 with free balancing.",
    cta: "Michelin Tyre Deals",
    imageUrl: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=600&auto=format&fit=crop&q=80",
    badge: "Michelin Official Partner",
    link: "/accessories",
    slotType: "leaderboard" as const,
    isCertifiedPartner: true,
    status: "active" as const
  },
  {
    category: "Motorsports",
    title: "Red Bull Karting Arena Speed League",
    description: "Fastest amateur racing tournament. Compete against city-wide champions for elite formula racing training scholarships.",
    cta: "Claim Racing Spot",
    imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80",
    badge: "Red Bull Arena",
    link: "https://www.redbull.com",
    slotType: "native-feed" as const,
    isCertifiedPartner: true,
    status: "active" as const
  },
  {
    category: "Sponsorships",
    title: "Carbon Fiber Anti-Scratch Premium Covers",
    description: "Multi-layered water resistance with soft microfiber cotton interiors to safeguard paint against parking dust and extreme daylight.",
    cta: "Purchase Smart Cover",
    imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80",
    badge: "Chariot Materials",
    link: "/accessories",
    slotType: "sidebar-tall" as const,
    isCertifiedPartner: true,
    status: "active" as const,
    highlightPill: "All-Weather Guard",
    startPriceText: "Custom Car Covers From",
    startPriceValue: "PKR 8,500 ONLY",
    spec1Title: "Material Thick.",
    spec1Value: "4-Layer Ultra",
    spec2Title: "Weather Rating",
    spec2Value: "100% Waterproof",
    spec3Title: "Safe Warranty",
    spec3Value: "2 Years Spec",
    disclaimer: "*Custom tailored layout options available."
  },
  {
    category: "Sponsorships",
    title: "Total Energies Quartz Elite Protection Oil",
    description: "Bespoke high performance engine formulas built to reduce frictional wear and stabilize internal core temps during heatwaves.",
    cta: "Explore Oils catalog",
    imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
    badge: "Total Energies Quartz",
    link: "/maintenance",
    slotType: "sidebar-medium" as const,
    isCertifiedPartner: true,
    status: "active" as const
  }
];

export default function AdManagement() {
  const [ads, setAds] = useState<CustomAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Custom interactive preset states
  const [activeTab, setActiveTab] = useState<'editor' | 'templates'>('editor');
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [templateCategory, setTemplateCategory] = useState('All');

  // Form State
  const [formData, setFormData] = useState<Partial<CustomAd>>({
    title: '',
    description: '',
    cta: 'Learn More',
    imageUrl: '',
    badge: 'Sponsored',
    link: '#',
    slotType: 'native-feed',
    status: 'active',
    isCertifiedPartner: true,
    highlightPill: '',
    startPriceText: '',
    startPriceValue: '',
    spec1Title: '',
    spec1Value: '',
    spec2Title: '',
    spec2Value: '',
    spec3Title: '',
    spec3Value: '',
    disclaimer: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const unsubscribeAds = adService.subscribeToAds((fetchedAds) => {
      setAds(fetchedAds);
      setIsLoading(false);

      // Bootstrap initial presets if nothing lives in DB
      if (fetchedAds.length === 0 && isLoading) {
        setIsLoading(true);
        const bootstrapDb = async () => {
          try {
            for (const preset of PRESETS_FOR_BOOTSTRAP) {
              await adService.createAd(preset);
            }
            toast.success('Successfully bootstrapped default premium ad templates!');
          } catch (e) {
            console.error('Failed to bootstrap ads presets:', e);
          } finally {
            setIsLoading(false);
          }
        };
        bootstrapDb();
      }
    });

    return () => unsubscribeAds();
  }, [isLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800 * 1024) {
      toast.error('Image size must be less than 800KB for database performance');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      setImageError(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl || !formData.badge || !formData.link) {
      toast.error('Ad Title, Image Asset, Partner Brand and Target link are required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (formData.id) {
        await adService.updateAd(formData.id, formData);
        toast.success('Ad campaign strategy updated successfully');
      } else {
        await adService.createAd(formData as any);
        toast.success('Dynamic campaign ad deployed successfully');
      }
      resetForm();
    } catch (error) {
      console.error('Error saving ad configuration:', error);
      toast.error('Failed to save ad configuration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      cta: 'Learn More',
      imageUrl: '',
      badge: 'Sponsored',
      link: '#',
      slotType: 'native-feed',
      status: 'active',
      isCertifiedPartner: true,
      highlightPill: '',
      startPriceText: '',
      startPriceValue: '',
      spec1Title: '',
      spec1Value: '',
      spec2Title: '',
      spec2Value: '',
      spec3Title: '',
      spec3Value: '',
      disclaimer: ''
    });
    setImageError(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to terminate this active ad campaign?')) return;
    try {
      await adService.deleteAd(id);
      toast.success('Ad campaign terminated');
    } catch (err) {
      toast.error('Failed to terminate campaign');
    }
  };

  const filteredAds = ads.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.badge.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.slotType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // High Stats Orchestration
  const totalViews = ads.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalClicks = ads.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  const avgCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0.00';

  return (
    <div className="space-y-6">
      {/* Unified Admin Header - EXACT layout and sizing match */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-orange uppercase tracking-[0.18em]">
            <Sparkles className="w-3.5 h-3.5 text-apple-orange" />
            Monetization & Ad Console
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F] dark:text-white leading-tight">
            Featured Ads & Campaigns
          </h1>
          <p className="text-xs text-[#86868B] dark:text-[#86868B] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            Orchestrate native feed ads, target high-impact skyscrapers, and deploy certified partner marketing spaces.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start md:self-end">
          <Badge className="rounded-lg h-8 px-3 text-[10px] font-bold uppercase tracking-wider bg-[#F5F5F7] dark:bg-white/5 text-[#86868B] border-none shadow-sm">
            {ads.length} Total Campaigns
          </Badge>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Panel: Creator Workspace with Built-in 22+ Presets Template Tab */}
        <motion.div 
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-[480px] shrink-0"
        >
          <div className="bg-white dark:bg-[#161617] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300 p-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
                </div>
                <Badge className="bg-amber-500/10 text-amber-500 border-none font-black text-[9px] uppercase">
                  Monetization Studio
                </Badge>
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-zinc-100 mt-4">
                {formData.id ? 'Edit Ad Campaign' : 'Ad Campaign Builder'}
              </h2>
              <p className="text-[#86868B] text-xs">
                Create modular campaigns or apply premium templates instantaneously with precise dimension checks.
              </p>

              {/* Seamless Visual Tabs Switcher */}
              <div className="grid grid-cols-2 bg-[#F5F5F7] dark:bg-zinc-950 p-1 rounded-xl border border-black/[0.04] dark:border-white/[0.04] mt-5">
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className={cn(
                    "py-2 px-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all duration-300",
                    activeTab === 'editor' 
                      ? "bg-white dark:bg-[#1D1D1F] text-amber-500 shadow-sm" 
                      : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  )}
                >
                  Creator Form
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('templates')}
                  className={cn(
                    "py-2 px-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5",
                    activeTab === 'templates' 
                      ? "bg-white dark:bg-[#1D1D1F] text-amber-500 shadow-sm" 
                      : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  )}
                >
                  20+ Presets
                  <Badge className="h-4 px-1.5 text-[8px] bg-amber-500/10 text-amber-500 border-none">
                    NEW
                  </Badge>
                </button>
              </div>
            </div>
            
            <div className="mt-6">
              {activeTab === 'editor' ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Dynamic Slot Sizing Helper & Upload block */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ad Creative Image</label>
                      <span className="block text-[8px] text-zinc-400 mt-0.5">
                        {formData.slotType === "native-feed" && "Example: 600x400px (3:2 Grid Listing)"}
                        {formData.slotType === "leaderboard" && "Example: 728x90px or 600x200px (Banner)"}
                        {formData.slotType === "sidebar-medium" && "Example: 300x250px (Ad Box)"}
                        {formData.slotType === "sidebar-tall" && "Example: 300x600px (Skyscraper)"}
                        {formData.slotType === "all" && "Example: 1200x800px (Retina Master)"}
                      </span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] font-black uppercase tracking-widest text-amber-500 hover:underline flex items-center gap-1.5"
                    >
                      <Upload className="w-3 h-3" />
                      Upload File
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                  
                  <div className="group relative">
                    <div className={cn(
                      "w-full aspect-[16/10] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all duration-500 overflow-hidden",
                      formData.imageUrl && !imageError ? "border-transparent" : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900"
                    )}>
                      {formData.imageUrl && !imageError ? (
                        <>
                          <img 
                            src={formData.imageUrl} 
                            alt="Preview Campaign" 
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button 
                              type="button"
                              variant="secondary"
                              className="rounded-full h-10 w-10 p-0 bg-white/20 backdrop-blur-md border-white/20 text-white hover:bg-white hover:text-black"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="w-4 h-4" />
                            </Button>
                            <Button 
                              type="button"
                              variant="secondary"
                              className="rounded-full h-10 w-10 p-0 bg-white/20 backdrop-blur-md border-white/20 text-white hover:bg-amber-500 hover:border-amber-500"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, imageUrl: '' }));
                                setImageError(false);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-3 p-4 text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-zinc-400" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                              {imageError ? 'Invalid format/URL' : 'Browse ad asset file'}
                            </p>
                            <p className="text-[10px] text-zinc-400 mt-1">Accepts PNG, JPG or dynamic Base64 data</p>
                            <p className="text-[9px] text-amber-500 font-bold mt-1">
                              {formData.slotType === 'native-feed' && 'Optimal crop ratio: 3:2 (e.g. 600x400px)'}
                              {formData.slotType === 'leaderboard' && 'Optimal crop ratio: 8:1 (e.g. 600x200px / 728x90px)'}
                              {formData.slotType === 'sidebar-medium' && 'Optimal crop ratio: 6:5 (e.g. 300x250px)'}
                              {formData.slotType === 'sidebar-tall' && 'Optimal crop ratio: 1:2 (e.g. 300x600px)'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <LinkIcon className="w-3.5 h-3.5 text-zinc-400" />
                    </div>
                    <Input 
                      placeholder="Or paste high CTR CDN / Unsplash url image..." 
                      value={formData.imageUrl && !formData.imageUrl.startsWith('data:') ? formData.imageUrl : ''}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, imageUrl: e.target.value }));
                        setImageError(false);
                      }}
                      className="pl-10 h-11 rounded-xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                    />
                  </div>

                  {/* Sizing Advisory Box for UI guidance */}
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2.5">
                    <Megaphone className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-[10px] text-zinc-500 leading-relaxed font-semibold">
                      <span className="text-zinc-800 dark:text-zinc-200 font-black">Proper Asset Dimensions Requirement:</span>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 font-mono text-[9px]">
                        <li>In-Feed: <span className="text-amber-500">600x400px (3:2 Format)</span></li>
                        <li>Leaderboard: <span className="text-amber-500">728x90px / 600x200px (Panoramic)</span></li>
                        <li>Skyscraper: <span className="text-amber-500">300x600px (1:2 Skyscraper)</span></li>
                        <li>Side-box: <span className="text-amber-500">300x250px (6:5 Medium box)</span></li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* General Strategy */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Target Slot Layout</label>
                      <Select 
                        value={formData.slotType} 
                        onValueChange={(v: any) => setFormData(p => ({ ...p, slotType: v }))}
                      >
                        <SelectTrigger className="w-full h-11 rounded-xl border-zinc-200 dark:border-zinc-800">
                          <SelectValue placeholder="Slot Target" />
                        </SelectTrigger>
                        <SelectContent className="min-w-[340px]">
                          <SelectItem value="native-feed">In-Feed Layout (600x400)</SelectItem>
                          <SelectItem value="leaderboard">Leaderboard Banner (600x200 / 728x90)</SelectItem>
                          <SelectItem value="sidebar-medium">Sidebar Rectangle (300x250)</SelectItem>
                          <SelectItem value="sidebar-tall">Sidebar Skyscraper (300x600)</SelectItem>
                          <SelectItem value="all">Fulfill All Layout Paths</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Campaign Status</label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(v: any) => setFormData(p => ({ ...p, status: v }))}
                      >
                        <SelectTrigger className="h-11 rounded-xl border-zinc-200 dark:border-zinc-800">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active (Live In Feed)</SelectItem>
                          <SelectItem value="inactive">Paused (Show Default)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Partner/Brand Badge</label>
                      <Input 
                        placeholder="e.g. Adamjee Auto, Meezan, Shell" 
                        value={formData.badge}
                        onChange={(e) => setFormData(p => ({ ...p, badge: e.target.value }))}
                        className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Certified Partner?</label>
                      <Select 
                        value={formData.isCertifiedPartner ? "yes" : "no"} 
                        onValueChange={(v) => setFormData(p => ({ ...p, isCertifiedPartner: v === "yes" }))}
                      >
                        <SelectTrigger className="h-11 rounded-xl border-zinc-200 dark:border-zinc-800">
                          <SelectValue placeholder="Certified Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes (Show verification badge)</SelectItem>
                          <SelectItem value="no">No (Standard placement)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Creative Ad Title</label>
                    <Input 
                      placeholder="e.g. Own Your Dream Car Instantly!" 
                      value={formData.title}
                      onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                      className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ad Description/Nurture Copy</label>
                    <Textarea 
                      placeholder="Make this value-oriented to ensure user engagement and strong conversion thresholds." 
                      value={formData.description}
                      onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                      className="rounded-xl border-zinc-200 dark:border-zinc-800 min-h-[82px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Action Link URL</label>
                      <Input 
                        placeholder="e.g. /insurance, /financing, or external URL"
                        value={formData.link}
                        onChange={(e) => setFormData(p => ({ ...p, link: e.target.value }))}
                        className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Button CTA Text</label>
                      <Input 
                        placeholder="e.g. Calculate Premium, Book Spot" 
                        value={formData.cta}
                        onChange={(e) => setFormData(p => ({ ...p, cta: e.target.value }))}
                        className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Advanced Skyscraper (300x600) properties */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Exotic High-Impact Skyscraper Options</span>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-zinc-400 uppercase">Campaign Pill Accent</label>
                        <Input 
                          placeholder="e.g. Golden Visa Perks" 
                          value={formData.highlightPill || ''}
                          onChange={(e) => setFormData(p => ({ ...p, highlightPill: e.target.value }))}
                          className="h-9 text-xs rounded-lg border-transparent focus:border-zinc-200 bg-white dark:bg-zinc-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-zinc-400 uppercase">Price Label</label>
                        <Input 
                          placeholder="e.g. Starting From" 
                          value={formData.startPriceText || ''}
                          onChange={(e) => setFormData(p => ({ ...p, startPriceText: e.target.value }))}
                          className="h-9 text-xs rounded-lg border-transparent focus:border-zinc-200 bg-white dark:bg-zinc-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-zinc-400 uppercase">Price Value</label>
                        <Input 
                          placeholder="e.g. AED 2.99M" 
                          value={formData.startPriceValue || ''}
                          onChange={(e) => setFormData(p => ({ ...p, startPriceValue: e.target.value }))}
                          className="h-9 text-xs rounded-lg border-transparent focus:border-zinc-200 bg-white dark:bg-zinc-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-zinc-400 uppercase">Disclaimer Footer</label>
                        <Input 
                          placeholder="e.g. T&C Apply | Rera No..." 
                          value={formData.disclaimer || ''}
                          onChange={(e) => setFormData(p => ({ ...p, disclaimer: e.target.value }))}
                          className="h-9 text-xs rounded-lg border-transparent focus:border-zinc-200 bg-white dark:bg-zinc-900"
                        />
                      </div>
                    </div>

                    <div className="border-t border-zinc-200 dark:border-zinc-800/60 my-2 pt-2">
                      <label className="text-[8px] font-bold text-zinc-400 uppercase block mb-1.5">3-Col Highlights & Analytics</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        <div className="space-y-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                          <Input 
                            placeholder="40%" 
                            value={formData.spec1Value || ''} 
                            onChange={(e) => setFormData(p => ({ ...p, spec1Value: e.target.value }))}
                            className="h-7 text-[10px] px-1 font-bold text-center bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                          />
                          <Input 
                            placeholder="Appr." 
                            value={formData.spec1Title || ''} 
                            onChange={(e) => setFormData(p => ({ ...p, spec1Title: e.target.value }))}
                            className="h-6 text-[8px] px-1 text-center bg-transparent border-none text-zinc-400"
                          />
                        </div>
                        <div className="space-y-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                          <Input 
                            placeholder="10%" 
                            value={formData.spec2Value || ''} 
                            onChange={(e) => setFormData(p => ({ ...p, spec2Value: e.target.value }))}
                            className="h-7 text-[10px] px-1 font-bold text-center bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                          />
                          <Input 
                            placeholder="Rental" 
                            value={formData.spec2Title || ''} 
                            onChange={(e) => setFormData(p => ({ ...p, spec2Title: e.target.value }))}
                            className="h-6 text-[8px] px-1 text-center bg-transparent border-none text-zinc-400"
                          />
                        </div>
                        <div className="space-y-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                          <Input 
                            placeholder="Golden" 
                            value={formData.spec3Value || ''} 
                            onChange={(e) => setFormData(p => ({ ...p, spec3Value: e.target.value }))}
                            className="h-7 text-[10px] px-1 font-bold text-center bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                          />
                          <Input 
                            placeholder="Visa" 
                            value={formData.spec3Title || ''} 
                            onChange={(e) => setFormData(p => ({ ...p, spec3Title: e.target.value }))}
                            className="h-6 text-[8px] px-1 text-center bg-transparent border-none text-zinc-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-amber-500/20"
                  >
                    {isSubmitting ? 'Protocol Executing...' : formData.id ? 'Save Changes' : 'Launch Campaign'}
                  </Button>
                  {formData.id && (
                    <Button 
                      type="button"
                      variant="outline"
                      className="h-14 w-14 p-0 rounded-2xl border-zinc-200 dark:border-zinc-800"
                      onClick={resetForm}
                    >
                      <X className="w-5 h-5 text-zinc-400" />
                    </Button>
                  )}
                </div>
              </form>
            ) : (
              // 22+ Top-Notch Advertisement Presets Library
              <div className="space-y-6">
                
                {/* Search & Category Filter Overlay */}
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input 
                      placeholder="Search 22+ premium presets..." 
                      value={templateSearchQuery}
                      onChange={(e) => setTemplateSearchQuery(e.target.value)}
                      className="pl-9 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-200"
                    />
                  </div>
                  
                  {/* Category Pills Slider */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                    {['All', 'Finance', 'Real Estate', 'Services', 'Insurance', 'Rental', 'Accessories', 'Sponsorships'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setTemplateCategory(cat)}
                        className={cn(
                          "px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg shrink-0 transition-all",
                          templateCategory === cat 
                            ? "bg-amber-500 text-white" 
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sizing Guideline Info Header */}
                <div className="p-3 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent rounded-2xl border border-amber-500/15 text-[10px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-semibold">
                  🚀 Preset assets are hosted on official Unsplash CDN. Applying a template copies all metadata, labels, CTA links, and pricing structures directly to the editor workspace instantly.
                </div>

                {/* Scrollable Presets Grid */}
                <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                  {PREMIUM_AD_TEMPLATES.filter(tpl => {
                    const matchesSearch = tpl.title.toLowerCase().includes(templateSearchQuery.toLowerCase()) || 
                      tpl.description.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
                      tpl.badge.toLowerCase().includes(templateSearchQuery.toLowerCase());
                    const matchesCategory = templateCategory === 'All' || tpl.category === templateCategory;
                    return matchesSearch && matchesCategory;
                  }).map((tpl, i) => {
                    // Match slot layout to optimal sizing string
                    let sizeLabel = "600x400px (3:2 Grid)";
                    if (tpl.slotType === "leaderboard") sizeLabel = "728x90px / 600x200px (Banner)";
                    if (tpl.slotType === "sidebar-medium") sizeLabel = "300x250px (Ad Box)";
                    if (tpl.slotType === "sidebar-tall") sizeLabel = "300x600px (Skyscraper)";

                    return (
                      <div 
                        key={i}
                        className="group p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 hover:border-amber-500/40 transition-all duration-300 relative flex flex-col gap-3 font-sans"
                      >
                        {/* Header Badges */}
                        <div className="flex items-center justify-between gap-1.5 flex-wrap">
                          <span className="text-[8px] font-black bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-md uppercase">
                            {tpl.category}
                          </span>
                          <span className="text-[8px] font-mono text-zinc-400 bg-amber-500/5 dark:bg-amber-500/10 text-amber-500 hover:text-amber-600 px-2 py-0.5 rounded-md font-bold shrink-0">
                            Format: {sizeLabel}
                          </span>
                        </div>

                        {/* Split Preview Grid */}
                        <div className="flex gap-3">
                          <img 
                            src={tpl.imageUrl} 
                            alt={tpl.title} 
                            className="w-16 h-16 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 line-clamp-1 group-hover:text-amber-500 transition-colors">
                              {tpl.title}
                            </h4>
                            <p className="text-[10px] text-zinc-500 line-clamp-2 mt-0.5 leading-relaxed">
                              {tpl.description}
                            </p>
                          </div>
                        </div>

                        {/* Extra skyscraper parameters summary preview tag */}
                        {tpl.slotType === "sidebar-tall" && tpl.startPriceValue && (
                          <div className="grid grid-cols-2 gap-1.5 p-2 bg-white dark:bg-zinc-900 rounded-xl text-[8px] text-zinc-400 font-mono">
                            <div className="truncate">Price: <span className="font-bold text-amber-500">{tpl.startPriceValue}</span></div>
                            <div className="truncate">Pill: <span className="font-bold text-amber-500">{tpl.highlightPill}</span></div>
                          </div>
                        )}

                        {/* Footer Quick Deployment Action button */}
                        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-zinc-200/50 dark:border-zinc-800/40">
                          <span className="text-[9px] font-bold text-zinc-400">
                            Partner tag: {tpl.badge}
                          </span>
                          <Button 
                            type="button"
                            size="sm"
                            onClick={() => {
                              setFormData({
                                ...tpl,
                                status: 'active',
                                highlightPill: tpl.highlightPill || '',
                                startPriceText: tpl.startPriceText || '',
                                startPriceValue: tpl.startPriceValue || '',
                                spec1Title: tpl.spec1Title || '',
                                spec1Value: tpl.spec1Value || '',
                                spec2Title: tpl.spec2Title || '',
                                spec2Value: tpl.spec2Value || '',
                                spec3Title: tpl.spec3Title || '',
                                spec3Value: tpl.spec3Value || '',
                                disclaimer: tpl.disclaimer || '',
                              });
                              setImageError(false);
                              setActiveTab('editor');
                              toast.success(`'${tpl.title}' template loaded! Modify details or launch directly.`);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-white text-[9px] h-7 px-3.5 rounded-xl font-bold uppercase transition-all"
                          >
                            Apply Preset
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {PREMIUM_AD_TEMPLATES.filter(tpl => {
                    const matchesSearch = tpl.title.toLowerCase().includes(templateSearchQuery.toLowerCase()) || 
                      tpl.description.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
                      tpl.badge.toLowerCase().includes(templateSearchQuery.toLowerCase());
                    const matchesCategory = templateCategory === 'All' || tpl.category === templateCategory;
                    return matchesSearch && matchesCategory;
                  }).length === 0 && (
                    <div className="py-12 text-center text-xs text-zinc-400">
                      No matching templates found. Try searching for other tags!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          </div>
        </motion.div>

      {/* Right Panel: Deployment Terminal */}
      <div className="flex-1 space-y-6">
        
        {/* Statistics Headings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#161617] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-5 flex items-center justify-between hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300">
            <div>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Total Impressions</p>
              <h4 className="text-2xl font-black mt-1 text-zinc-900 dark:text-zinc-100">{totalViews.toLocaleString()}</h4>
            </div>
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
              <Eye className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#161617] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-5 flex items-center justify-between hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300">
            <div>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Ad Conversions/Clicks</p>
              <h4 className="text-2xl font-black mt-1 text-zinc-900 dark:text-zinc-100">{totalClicks.toLocaleString()}</h4>
            </div>
            <div className="w-10 h-10 bg-[#0071E3]/10 rounded-xl flex items-center justify-center text-[#0071E3]">
              <MousePointerClick className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#161617] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-5 flex items-center justify-between hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300">
            <div>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Average CTR Rate</p>
              <h4 className="text-2xl font-black mt-1 text-emerald-500">{avgCtr}%</h4>
            </div>
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
              <Percent className="w-5 h-5" />
            </div>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative group min-w-[200px] sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] group-focus-within:text-apple-orange transition-colors duration-300" />
            <input 
              type="text"
              placeholder="Find campaigns..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F5F5F7] dark:bg-white/5 border border-transparent focus:border-apple-orange/30 rounded-xl text-xs font-medium focus:ring-0 outline-none transition-all duration-300 shadow-inner"
            />
          </div>
        </div>

        {/* Ads Grid/Table */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
            <AnimatePresence>
              {filteredAds.map((ad, index) => {
                const ctr = ad.views > 0 ? ((ad.clicks / ad.views) * 100).toFixed(1) : '0.0';
                return (
                  <motion.div
                    key={ad.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative"
                  >
                    <div className="bg-white dark:bg-[#161617] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300 group">
                    <div className="aspect-[16/9] relative overflow-hidden bg-zinc-50 dark:bg-zinc-950">
                      <img 
                        src={ad.imageUrl} 
                        alt={ad.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                        <div className="flex justify-between items-end">
                          <div className="space-y-1 flex-1 min-w-0 pr-4">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <Badge variant="secondary" className="text-[8px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-500 border-none h-4 px-1.5">
                                {ad.slotType}
                              </Badge>
                              {ad.isCertifiedPartner && (
                                <Badge className="text-[7px] font-black uppercase tracking-widest bg-emerald-500 text-white border-none h-4 px-1 flex items-center gap-0.5">
                                  <ShieldCheck className="w-2 h-2" />
                                  Certified
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-white font-bold tracking-tight text-sm truncate">{ad.title}</h3>
                          </div>
                          
                          <div className="flex gap-2 shrink-0">
                            <Button 
                              variant="secondary" 
                              className="h-9 w-9 p-0 rounded-xl bg-white/20 backdrop-blur-md border-white/20 text-white hover:bg-white hover:text-black"
                              onClick={() => {
                                setFormData(ad);
                                setImageError(false);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              className="h-9 w-9 p-0 rounded-xl bg-red-500/20 backdrop-blur-md border-red-500/20 text-white hover:bg-red-500 animate-in fade-in"
                              onClick={() => handleDelete(ad.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="absolute top-4 right-4 flex gap-2">
                        {ad.status === 'active' ? (
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-none rounded-lg text-[9px] font-black uppercase">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="text-zinc-400 border-zinc-200 dark:border-zinc-800 rounded-lg text-[9px] font-black uppercase">Paused</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-full font-medium line-clamp-2">
                        {ad.description}
                      </p>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                        <div className="text-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/40">
                          <span className="text-[9px] uppercase font-black text-zinc-400 tracking-wider">Views</span>
                          <h5 className="font-bold text-sm text-zinc-800 dark:text-zinc-100 mt-0.5">{ad.views || 0}</h5>
                        </div>
                        <div className="text-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/40">
                          <span className="text-[9px] uppercase font-black text-zinc-400 tracking-wider">Clicks</span>
                          <h5 className="font-bold text-sm text-zinc-800 dark:text-zinc-100 mt-0.5">{ad.clicks || 0}</h5>
                        </div>
                        <div className="text-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/40">
                          <span className="text-[9px] uppercase font-black text-zinc-400 tracking-wider">CTR</span>
                          <h5 className="font-bold text-sm text-emerald-500 mt-0.5">{ctr}%</h5>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-[10px] mt-2 pt-1 font-mono text-zinc-400">
                        <div className="flex items-center gap-1">
                          <Megaphone className="w-3 h-3" />
                          <span>{ad.badge}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <span className="shrink-0">CTA:</span>
                          <span className="truncate max-w-[120px]">{ad.cta}</span>
                        </div>
                        <div className="flex items-center gap-1 text-zinc-500 ml-auto">
                          <span>Target:</span>
                          <span className="truncate max-w-[100px]">{ad.link}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredAds.length === 0 && !isLoading && (
              <div className="col-span-full py-24 text-center">
                <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Megaphone className="w-8 h-8 text-zinc-300" />
                </div>
                <h3 className="text-xl font-bold text-zinc-400">No active ads match filter criteria.</h3>
                <p className="text-zinc-500 mt-2">Generate a campaign on the builder panel to launch.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  </div>
  );
}
