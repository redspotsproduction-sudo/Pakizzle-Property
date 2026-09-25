import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Sparkles, LayoutGrid, Home, Building2, Building, Layers, ShieldCheck } from "lucide-react";
import { CATEGORIES as STATIC_CATEGORIES } from "../constants/categories";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import { categoryService } from "../services/categoryService";
import { Category } from "../types";

type CategoryTab = "all" | "residential" | "plots" | "commercial";

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
    if (activeTab === "residential") return ["House", "Apartment", "Penthouse"].includes(cat.filter?.value);
    if (activeTab === "plots") return cat.filter?.value === "Plot";
    if (activeTab === "commercial") return cat.filter?.value === "Commercial";
    return true;
  });

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div className="max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 text-[#0F766E] dark:text-teal-400 text-xs font-semibold uppercase tracking-wider mb-4 border border-teal-200 dark:border-teal-800"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Curated Typologies
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="type-h2 font-semibold text-slate-900 dark:text-slate-100 tracking-tight mb-4"
          >
            Browse by Property Typology
          </motion.h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mb-6">
            From LDA & CDA-approved residential plots to bespoke modern villas and high-yield commercial floors.
          </p>

          {/* Native-like Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800/70 p-1 rounded-lg w-fit border border-slate-200 dark:border-slate-700">
            {[
              { id: "all", label: "All Properties", icon: LayoutGrid },
              { id: "residential", label: "Residential", icon: Home },
              { id: "plots", label: "Plots & Land", icon: Layers },
              { id: "commercial", label: "Commercial", icon: Building }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as CategoryTab)}
                className={cn(
                  "relative px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5",
                  activeTab === tab.id 
                    ? "bg-white dark:bg-slate-900 text-[#0F766E] dark:text-teal-400 shadow-sm" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        <button
          onClick={() => navigate("/marketplace")}
          className="group flex items-center gap-2 text-[#0F766E] dark:text-teal-400 font-semibold text-sm hover:underline"
        >
          Explore All Categories
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Bento Grid Layout with AnimatePresence */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 min-h-[480px]">
        <AnimatePresence mode="popLayout">
          {filteredCategories.map((category, index) => (
            <motion.div
              key={`${category.id}-${index}`}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCategoryClick(category)}
              className={cn(
                "group relative overflow-hidden rounded-lg cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_24px_-4px_rgba(0,0,0,0.12)] transition-all duration-300",
                category.size === "large" ? "col-span-2 row-span-2 h-[340px] md:h-[500px]" : 
                category.size === "medium" ? "col-span-2 h-[160px] md:h-[240px]" : 
                "col-span-1 h-[160px] md:h-[240px]"
              )}
            >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              <img 
                src={category.image} 
                alt={category.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
            </div>

            {/* Content Container */}
            <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end text-white z-10">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold text-teal-300">
                  {category.subtitle}
                </span>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white group-hover:text-teal-200 transition-colors">
                {category.title}
              </h3>
            </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
