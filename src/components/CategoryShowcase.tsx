import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Sparkles, LayoutGrid, Car, Zap, Shield, Gem, Mountain, TrendingUp } from "lucide-react";
import { CATEGORIES as STATIC_CATEGORIES, Category as StaticCategory } from "../constants/categories";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import { categoryService } from "../services/categoryService";
import { Category } from "../types";

type CategoryTab = "all" | "body" | "fuel" | "lifestyle";

const iconMap: Record<string, any> = {
  Zap, Car, Shield, Gem, Mountain, TrendingUp, LayoutGrid
};

export default function CategoryShowcase() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CategoryTab>("all");
  const [dynamicCategories, setDynamicCategories] = useState<Category[]>([]);

  useEffect(() => {
    categoryService.getAll()
      .then(cats => {
        setDynamicCategories(cats.filter(c => c.level === 1));
      })
      .catch(err => {
        console.error("CategoryShowcase: Failed to load dynamic categories:", err);
        // Fallback to static categories is handled by displayCategories logic
      });
  }, []);

  const handleCategoryClick = (category: any) => {
    const params = new URLSearchParams();
    if (category.filter) {
      params.set(category.filter.key, category.filter.value);
    } else {
      params.set('categoryId', category.id);
    }
    navigate(`/marketplace?${params.toString()}`);
  };

  const displayCategories = STATIC_CATEGORIES;

  const filteredCategories = displayCategories.filter((cat: any) => {
    if (activeTab === "all") return true;
    if (activeTab === "body") return cat.filter?.key === "bodyType";
    if (activeTab === "fuel") return cat.filter?.key === "fuelType";
    if (activeTab === "lifestyle") {
      return ["suv-adventure", "ev-future", "hybrid-eco", "sleek-coupes"].includes(cat.id);
    }
    return true;
  });

  return (
    <section className="py-20 px-6 md:px-10 max-w-7xl mx-auto overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
        <div className="max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-apple-blue/10 text-apple-blue text-[10px] font-semibold uppercase tracking-[0.2em] mb-6"
          >
            <Sparkles className="w-3 h-3 stroke-[2.2]" />
            AMIE Intelligence Recommended
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="fluid-h1 font-semibold text-apple-text tracking-tighter leading-[0.9] mb-8"
          >
            Browse by <br />
            <span className="text-apple-text-muted">Lifestyle & Need.</span>
          </motion.h2>

          {/* Native-like Tabs */}
          <div className="flex bg-apple-gray/50 p-1.5 rounded-2xl w-fit backdrop-blur-md border border-apple-border/30">
            {[
              { id: "all", label: "All", icon: LayoutGrid },
              { id: "body", label: "Body Type", icon: Car },
              { id: "fuel", label: "Fuel", icon: Zap },
              { id: "lifestyle", label: "Lifestyle", icon: Shield }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as CategoryTab)}
                className={cn(
                  "relative px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-2",
                  activeTab === tab.id ? "text-apple-blue shadow-sm" : "text-apple-text-muted hover:text-apple-text"
                )}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white dark:bg-white/10 rounded-xl z-0"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className="w-3.5 h-3.5 relative z-10 stroke-[2.2]" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        <motion.button
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="group flex items-center gap-2 text-apple-blue font-semibold text-sm tracking-tight"
        >
          Explore All Categories
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 stroke-[2.2]" />
        </motion.button>
      </div>

      {/* Bento Grid Layout with AnimatePresence for smooth filtering */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 min-h-[600px]">
        <AnimatePresence mode="popLayout">
          {filteredCategories.map((category, index) => (
            <motion.div
              key={`${category.id}-${index}`}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCategoryClick(category)}
              className={cn(
                "group relative overflow-hidden rounded-[40px] cursor-pointer bg-apple-card-bg border border-apple-border/50 shadow-apple-soft transition-all duration-500 hover:shadow-apple-card",
                category.size === "large" ? "col-span-2 row-span-2 h-[400px] md:h-[640px]" : 
                category.size === "medium" ? "col-span-2 h-[200px] md:h-[308px]" : 
                "col-span-1 h-[200px] md:h-[308px]"
              )}
            >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              <img 
                src={category.image} 
                alt={category.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-80 transition-opacity duration-500 group-hover:opacity-90",
                category.gradient
              )} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>

            {/* Content */}
            <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between z-10">
              <div className={cn(
                "w-12 h-12 rounded-2xl bg-apple-card-bg backdrop-blur-md flex items-center justify-center shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6",
                category.color
              )}>
                <category.icon className="w-6 h-6" />
              </div>

              <div>
                <p className="text-white/70 text-[10px] font-semibold uppercase tracking-[0.2em] mb-2">
                  {category.subtitle}
                </p>
                <h3 className="text-white text-2xl md:text-3xl font-semibold tracking-tight leading-none">
                  {category.title}
                </h3>
              </div>
            </div>

            {/* Hover Action */}
            <div className="absolute top-6 right-6 opacity-0 translate-x-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-apple-border/30 flex items-center justify-center text-white">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
        </AnimatePresence>
      </div>

      {/* Mobile Horizontal Scroll for Quick Access (Native Feel) */}
      <div className="mt-12 md:hidden">
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory -mx-6 px-6 scroll-pl-6" style={{ WebkitOverflowScrolling: 'touch' }}>
          <AnimatePresence mode="popLayout">
          {filteredCategories.map((category, index) => (
            <motion.div
              key={`mobile-${category.id}-${index}`}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryClick(category)}
              className="flex-shrink-0 w-40 snap-start"
            >
              <div className={cn(
                "w-full aspect-square rounded-3xl mb-3 flex items-center justify-center shadow-sm border border-apple-border/30 bg-gradient-to-br",
                category.gradient
              )}>
                <category.icon className={cn("w-8 h-8", category.color)} />
              </div>
              <p className="text-center text-[11px] font-medium text-apple-text tracking-tight">
                {category.title}
              </p>
            </motion.div>
          ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
