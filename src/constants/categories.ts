import { 
  Car, 
  Zap, 
  Shield, 
  TrendingUp, 
  Gem, 
  Clock, 
  MapPin, 
  Fuel,
  Settings2,
  Users,
  Briefcase,
  Mountain
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
    id: "suv-adventure",
    title: "SUVs",
    subtitle: "Explore Any Terrain",
    icon: Mountain,
    color: "text-apple-orange",
    gradient: "from-apple-orange/20 to-amber-500/10",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800",
    filter: { key: "bodyType", value: "SUV" },
    size: "large"
  },
  {
    id: "luxury-sedans",
    title: "Sedans",
    subtitle: "Unmatched Smooth Comfort",
    icon: Car,
    color: "text-apple-blue",
    gradient: "from-apple-blue/20 to-indigo-500/10",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800",
    filter: { key: "bodyType", value: "Sedan" },
    size: "medium"
  },
  {
    id: "trucks-utility",
    title: "Trucks",
    subtitle: "Pure Power & Capability",
    icon: Mountain,
    color: "text-amber-600",
    gradient: "from-amber-600/20 to-yellow-600/10",
    image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800",
    filter: { key: "bodyType", value: "Truck" },
    size: "medium"
  },
  {
    id: "ev-future",
    title: "EVs",
    subtitle: "Smarter Electric Intelligence",
    icon: Zap,
    color: "text-apple-green",
    gradient: "from-apple-green/20 to-emerald-500/10",
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800",
    filter: { key: "fuelType", value: "Electric" },
    size: "small"
  },
  {
    id: "hybrid-eco",
    title: "Hybrids",
    subtitle: "Optimal Eco Performance",
    icon: Zap,
    color: "text-emerald-500",
    gradient: "from-emerald-500/20 to-teal-500/10",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800",
    filter: { key: "fuelType", value: "Hybrid" },
    size: "small"
  },
  {
    id: "sleek-coupes",
    title: "Coupes",
    subtitle: "Sleek Aerodynamics",
    icon: Gem,
    color: "text-purple-500",
    gradient: "from-purple-500/20 to-pink-500/10",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800",
    filter: { key: "bodyType", value: "Coupe" },
    size: "small"
  },
  {
    id: "city-hatchbacks",
    title: "Hatchbacks",
    subtitle: "Compact & City Agile",
    icon: Car,
    color: "text-rose-500",
    gradient: "from-rose-500/20 to-pink-500/10",
    image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800",
    filter: { key: "bodyType", value: "Hatchback" },
    size: "small"
  }
];
