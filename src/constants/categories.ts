import { 
  Home, 
  Building2, 
  Building, 
  Layers, 
  Briefcase, 
  MapPin, 
  TrendingUp,
  Sparkles,
  Shield,
  HelpCircle
} from "lucide-react";

export interface Category {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  gradient: string;
  image: string;
  filter: {
    key: string;
    value: string;
  };
  size: "small" | "medium" | "large"; // For Bento Grid
}

export const CATEGORIES: Category[] = [
  {
    id: "villas-houses",
    title: "Houses & Villas",
    subtitle: "Luxury Independent Living",
    icon: Home,
    color: "text-apple-orange",
    gradient: "from-apple-orange/20 to-amber-500/10",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
    filter: { key: "bodyType", value: "House" },
    size: "large"
  },
  {
    id: "apartments-flats",
    title: "Apartments",
    subtitle: "Modern High-Rise Comfort",
    icon: Building2,
    color: "text-apple-blue",
    gradient: "from-apple-blue/20 to-indigo-500/10",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800",
    filter: { key: "bodyType", value: "Apartment" },
    size: "medium"
  },
  {
    id: "commercial-spaces",
    title: "Commercial Spaces",
    subtitle: "Premium Offices & Shops",
    icon: Building,
    color: "text-amber-600",
    gradient: "from-amber-600/20 to-yellow-600/10",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
    filter: { key: "bodyType", value: "Commercial" },
    size: "medium"
  },
  {
    id: "residential-plots",
    title: "Residential Plots",
    subtitle: "Build Your Dream Home",
    icon: Layers,
    color: "text-apple-green",
    gradient: "from-apple-green/20 to-emerald-500/10",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800",
    filter: { key: "fuelType", value: "Plot" },
    size: "small"
  },
  {
    id: "elite-penthouses",
    title: "Penthouses",
    subtitle: "Exclusive Sky Residences",
    icon: Sparkles,
    color: "text-purple-500",
    gradient: "from-purple-500/20 to-pink-500/10",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
    filter: { key: "bodyType", value: "Penthouse" },
    size: "small"
  },
  {
    id: "commercial-plots",
    title: "Commercial Land",
    subtitle: "High-ROI Development Sites",
    icon: MapPin,
    color: "text-rose-500",
    gradient: "from-rose-500/20 to-pink-500/10",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=800",
    filter: { key: "bodyType", value: "CommercialPlot" },
    size: "small"
  }
];;
