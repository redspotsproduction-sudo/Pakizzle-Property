import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Building, 
  Map, 
  Building2, 
  Trees, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const PROPERTY_STYLES = [
  {
    id: "villa",
    name: "Luxury Villa",
    subtitle: "5, 10 Marla & 1 Kanal",
    icon: Home,
    tag: "Most Popular",
    filter: "make=House",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "apartment",
    name: "High-Rise Flat",
    subtitle: "2 & 3 Bed Oceanfront",
    icon: Building,
    tag: "High Yield",
    filter: "make=Apartment",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "penthouse",
    name: "Sky Penthouse",
    subtitle: "Panoramic City Views",
    icon: Building2,
    tag: "Ultra Luxury",
    filter: "make=Penthouse",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "plot",
    name: "Residential Plot",
    subtitle: "On-Ground Possession",
    icon: Map,
    tag: "Capital Growth",
    filter: "propertyType=Plot",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "commercial",
    name: "Commercial Plaza",
    subtitle: "Main Boulevard Retail",
    icon: Building2,
    tag: "8%+ Rental Yield",
    filter: "propertyType=Commercial",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "farmhouse",
    name: "Scenic Farmhouse",
    subtitle: "4-8 Kanal Green Retreats",
    icon: Trees,
    tag: "Serene Living",
    filter: "q=Farmhouse",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600"
  }
];

export default function PopularPropertyStyles() {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 10);
      const remainingScroll = container.scrollWidth - container.clientWidth - container.scrollLeft;
      setShowRightArrow(remainingScroll > 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const offset = direction === "left" ? -350 : 350;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <section className="py-12 max-w-7xl mx-auto px-6 relative border-t border-apple-border/20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-[10px] font-mono font-bold text-apple-blue uppercase tracking-widest block mb-1">
            Curated Typologies
          </span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-apple-text">
            Explore by Property Style
          </h2>
        </div>
        <button
          onClick={() => navigate("/marketplace")}
          className="text-xs font-semibold text-apple-blue hover:underline hidden sm:flex items-center gap-1"
        >
          View All Inventory
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="relative">
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 bg-white/95 dark:bg-[#1D1D1F]/95 text-apple-text w-10 h-10 rounded-full flex items-center justify-center shadow-lg border border-apple-border/40 z-10 transition-all hover:scale-105"
            aria-label="Previous styles"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 bg-white/95 dark:bg-[#1D1D1F]/95 text-apple-text w-10 h-10 rounded-full flex items-center justify-center shadow-lg border border-apple-border/40 z-10 transition-all hover:scale-105"
            aria-label="Next styles"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none select-none px-1"
        >
          {PROPERTY_STYLES.map((style) => (
            <motion.div
              key={style.id}
              onClick={() => navigate(`/marketplace?${style.filter}`)}
              whileHover={{ y: -4 }}
              className="flex-shrink-0 snap-start w-[240px] md:w-[270px] rounded-3xl overflow-hidden border border-black/5 dark:border-white/10 bg-white dark:bg-[#15161E] group cursor-pointer shadow-sm hover:shadow-apple-soft transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img 
                  src={style.image} 
                  alt={style.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 text-[10px] font-mono font-bold bg-white/90 dark:bg-black/80 text-apple-text px-2.5 py-1 rounded-full backdrop-blur-md">
                  {style.tag}
                </span>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-apple-text group-hover:text-apple-blue transition-colors">
                    {style.name}
                  </h4>
                  <p className="text-xs text-apple-text-muted mt-0.5">
                    {style.subtitle}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-apple-gray dark:bg-white/5 flex items-center justify-center text-apple-text group-hover:bg-apple-blue group-hover:text-white transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
