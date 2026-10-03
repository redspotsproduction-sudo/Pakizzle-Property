import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { 
  Search, 
  X, 
  MapPin, 
  Building, 
  Home, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Command,
  Bed,
  Bath,
  Layers,
  ChevronRight,
  Hash,
  AlertCircle
} from "lucide-react";
import { useProperties } from "../context/PropertyContext";
import { formatPrice, cn } from "../lib/utils";
import { formatPropertyUrl, extractReferenceId } from "../lib/referenceId";
import { REVEAL_EASE, SPRING_SNAPPY, SPRING_BOUNCY } from "./motion";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_CHIPS = [
  { id: "all", label: "All Properties" },
  { id: "id_search", label: "# Property ID Search" },
  { id: "House", label: "Houses" },
  { id: "Flat / Apartment", label: "Apartments" },
  { id: "Plot", label: "Plots" },
  { id: "Commercial", label: "Commercial" },
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const navigate = useNavigate();
  const { properties, vehicles } = useProperties();
  const shouldReduceMotion = useReducedMotion();

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-extract Property Reference ID from text or full pasted URL
  const extractedId = useMemo(() => {
    return extractReferenceId(query);
  }, [query]);

  // Direct hit match against catalog
  const directHitProperty = useMemo(() => {
    if (!extractedId) return null;
    return vehicles.find(
      (v) => (v.reference_id && v.reference_id === extractedId) || v.id === extractedId
    ) || null;
  }, [vehicles, extractedId]);

  // Check if an ID pattern was entered/pasted but doesn't exist
  const isFailedIdSearch = useMemo(() => {
    if (!extractedId) return false;
    return !directHitProperty;
  }, [extractedId, directHitProperty]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("pakizzle_spotlight_recent");
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // Fallback
    }
  }, []);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Filter listings based on query and category
  const filteredResults = useMemo(() => {
    // If it's an invalid/unmatched reference ID search, return empty array to show dedicated error state
    if (isFailedIdSearch) {
      return [];
    }

    // If direct hit match is found, prioritize it
    if (directHitProperty) {
      return [directHitProperty];
    }

    const q = query.toLowerCase().trim();

    return vehicles.filter((v) => {
      // Category filter
      if (selectedCategory === "id_search") {
        if (!q) return true;
        const ref = (v.reference_id || "").toLowerCase();
        const idStr = (v.id || "").toLowerCase();
        return ref.includes(q) || idStr.includes(q);
      } else if (selectedCategory !== "all") {
        const type = (v.bodyType || v.make || "").toLowerCase();
        if (!type.includes(selectedCategory.toLowerCase())) {
          return false;
        }
      }

      if (!q) return true;

      const searchableText = `${v.reference_id || ""} ${v.make} ${v.model} ${v.variant || ""} ${v.city} ${v.location || ""} ${v.bodyType || ""} ${v.description || ""}`.toLowerCase();
      return searchableText.includes(q);
    }).slice(0, 8); // Top 8 matches
  }, [vehicles, query, selectedCategory, directHitProperty, isFailedIdSearch]);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    try {
      const updated = [term.trim(), ...recentSearches.filter(t => t.toLowerCase() !== term.trim().toLowerCase())].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem("pakizzle_spotlight_recent", JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleSelectVehicle = (id: string, searchTerm?: string) => {
    if (searchTerm) {
      saveRecentSearch(searchTerm);
    }
    onClose();
    const prop = vehicles.find(v => v.id === id || v.reference_id === id);
    if (prop) {
      navigate(formatPropertyUrl(prop));
    } else {
      navigate(`/property/${id}`);
    }
  };

  const handleApplyQuickSearch = (term: string) => {
    setQuery(term);
    saveRecentSearch(term);
    setSelectedIndex(0);
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("pakizzle_spotlight_recent");
    } catch {
      // Ignore
    }
  };

  // Handle ESC and Arrow key navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (filteredResults.length === 0 ? 0 : (prev + 1) % filteredResults.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (filteredResults.length === 0 ? 0 : (prev - 1 + filteredResults.length) % filteredResults.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (directHitProperty) {
          saveRecentSearch(`Property ID #${directHitProperty.reference_id}`);
          onClose();
          navigate(formatPropertyUrl(directHitProperty));
          return;
        }
        if (filteredResults.length > 0) {
          const selected = filteredResults[selectedIndex];
          if (selected) {
            handleSelectVehicle(selected.id, query);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, vehicles, query, selectedCategory, directHitProperty, filteredResults]);

  // Keep highlighted item in view
  useEffect(() => {
    if (resultsContainerRef.current) {
      const activeElement = resultsContainerRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-8 sm:pt-20 px-3 sm:px-4">
          {/* Frosted Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md"
          />

          {/* Spotlight Floating Container */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -24 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -12 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="relative w-full max-w-2xl bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.35)] overflow-hidden z-10 flex flex-col max-h-[85vh]"
          >
            {/* Top Search Input Header */}
            <div className="relative flex items-center px-4 sm:px-6 py-4 border-b border-apple-border/20 dark:border-white/10">
              <Search className="w-5 h-5 text-apple-blue shrink-0 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder={
                  selectedCategory === "id_search"
                    ? "Enter 7-digit ID (e.g. 3421789) or paste WhatsApp link..."
                    : "Search properties, DHA, Clifton, Bahria, 3 Bed, or #ID..."
                }
                className="w-full bg-transparent text-sm sm:text-base font-medium text-apple-text dark:text-white placeholder:text-apple-text-muted outline-none"
              />

              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="p-1 rounded-full text-apple-text-muted hover:text-apple-text dark:hover:text-white hover:bg-apple-gray/60 dark:hover:bg-white/10 transition-colors mr-2 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={onClose}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-apple-gray dark:bg-white/10 text-[10px] font-bold text-apple-text-muted uppercase tracking-wider hover:bg-apple-gray/80 transition-colors cursor-pointer"
              >
                <span>ESC</span>
              </button>
            </div>

            {/* Category Filter Chips Bar */}
            <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 bg-apple-gray/30 dark:bg-white/[0.02] border-b border-apple-border/15 dark:border-white/5 overflow-x-auto scrollbar-hide">
              {CATEGORY_CHIPS.map((chip) => {
                const isActive = selectedCategory === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => {
                      setSelectedCategory(chip.id);
                      setSelectedIndex(0);
                    }}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer relative",
                      isActive
                        ? "text-white"
                        : "text-apple-text-muted hover:text-apple-text dark:hover:text-white"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeCategoryPill"
                        transition={SPRING_SNAPPY}
                        className="absolute inset-0 bg-apple-blue rounded-full -z-10 shadow-sm"
                      />
                    )}
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {/* Scrollable Results / Suggestions */}
            <div 
              ref={resultsContainerRef}
              className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1.5 custom-scrollbar"
            >
              {/* Recent Searches (shown when query is empty) */}
              {!query && recentSearches.length > 0 && (
                <div className="mb-4 px-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-apple-text-muted flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Recent Searches
                    </span>
                    <button
                      onClick={handleClearRecent}
                      className="text-[10px] font-semibold text-apple-blue hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term, i) => (
                      <motion.button
                        key={`${term}-${i}`}
                        whileTap={{ scale: 0.96 }}
                        transition={SPRING_SNAPPY}
                        onClick={() => handleApplyQuickSearch(term)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-apple-gray/50 dark:bg-white/5 hover:bg-apple-gray dark:hover:bg-white/10 text-xs text-apple-text dark:text-zinc-200 transition-colors border border-apple-border/20 dark:border-white/5 cursor-pointer"
                      >
                        <Search className="w-3 h-3 text-apple-text-muted" />
                        <span>{term}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Direct Hit Match Banner (Priority 1: Direct-Hit on Reference ID or URL paste) */}
              {directHitProperty && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={SPRING_SNAPPY}
                  className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-apple-blue/15 via-teal-500/10 to-transparent border border-apple-blue/40 shadow-lg mb-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-apple-blue text-white flex flex-col items-center justify-center font-mono shrink-0 shadow-md">
                        <span className="text-[9px] uppercase font-bold text-white/80">Ref ID</span>
                        <span className="text-xs font-black tracking-tight">{directHitProperty.reference_id}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-apple-blue text-white">
                            Direct Property ID Match
                          </span>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <h4 className="text-sm font-bold text-apple-text dark:text-white truncate">
                          {directHitProperty.model}
                        </h4>
                        <p className="text-xs text-apple-text-muted truncate">
                          {directHitProperty.location} • <span className="font-bold text-apple-blue font-mono">{formatPrice(directHitProperty.price)}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        saveRecentSearch(`Property ID #${directHitProperty.reference_id}`);
                        onClose();
                        navigate(formatPropertyUrl(directHitProperty));
                      }}
                      className="apple-button-primary !py-2.5 !px-4 !text-xs flex items-center gap-1.5 shadow-md shadow-apple-blue/20 shrink-0 cursor-pointer"
                    >
                      <span>Jump to Listing</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Property ID Not Found Error State */}
              {isFailedIdSearch && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 text-center bg-apple-red/5 dark:bg-apple-red/10 border border-apple-red/20 rounded-2xl mb-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-apple-red/10 text-apple-red flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-apple-text dark:text-white mb-1">
                    Property ID #{extractedId} Not Found
                  </h3>
                  <p className="text-xs text-apple-text-muted max-w-sm mx-auto mb-5 leading-relaxed">
                    We couldn't locate any active property with Reference ID <span className="font-mono font-bold text-apple-text dark:text-white">#{extractedId}</span>. The listing may have been sold, archived, or the link/ID was mistyped.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setQuery("");
                        inputRef.current?.focus();
                      }}
                      className="apple-button-secondary !py-2 !px-4 !text-xs cursor-pointer"
                    >
                      Clear & Re-check ID
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        navigate("/marketplace");
                      }}
                      className="apple-button-primary !py-2 !px-4 !text-xs cursor-pointer"
                    >
                      Browse Available Properties
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Matching Listings Count Header */}
              <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold text-apple-text-muted">
                <span>{query ? `Results for "${query}"` : "Suggested Properties"}</span>
                <span>{filteredResults.length} properties</span>
              </div>

              {/* Result List Items */}
              {filteredResults.length > 0 ? (
                <div className="space-y-1.5">
                  {filteredResults.map((vehicle, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <motion.div
                        key={vehicle.id}
                        data-index={idx}
                        whileHover={{ scale: 1.005 }}
                        whileTap={{ scale: 0.99 }}
                        transition={SPRING_SNAPPY}
                        onClick={() => handleSelectVehicle(vehicle.id, query)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={cn(
                          "flex items-center justify-between p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-colors border group",
                          isSelected
                            ? "bg-apple-blue/10 dark:bg-apple-blue/20 border-apple-blue/30 dark:border-apple-blue/40"
                            : "bg-apple-gray/20 dark:bg-white/[0.02] border-transparent hover:bg-apple-gray/40 dark:hover:bg-white/[0.05]"
                        )}
                      >
                        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                          {/* Property Thumbnail */}
                          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 bg-apple-gray">
                            <img
                              src={vehicle.images[0]}
                              alt={`${vehicle.make} ${vehicle.model}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            {vehicle.isVerified && (
                              <div className="absolute top-1 left-1 bg-apple-green text-white p-0.5 rounded-full shadow-sm">
                                <ShieldCheck className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs sm:text-sm font-bold text-apple-text dark:text-white truncate">
                                {vehicle.make} {vehicle.model}
                              </h4>
                              {vehicle.bodyType && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-apple-gray dark:bg-white/10 text-apple-text-muted font-medium">
                                  {vehicle.bodyType}
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-apple-text-muted flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="w-3 h-3 text-apple-blue shrink-0" />
                              <span>{vehicle.location ? `${vehicle.location}, ${vehicle.city}` : vehicle.city}</span>
                            </p>

                            <div className="flex items-center gap-2.5 mt-1 text-[10px] font-medium text-apple-text-muted">
                              {vehicle.mileage ? (
                                <span className="flex items-center gap-0.5">
                                  <Layers className="w-3 h-3" /> {vehicle.mileage.toLocaleString()} Sq. Ft.
                                </span>
                              ) : null}
                              {vehicle.year ? (
                                <span>Built {vehicle.year}</span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div className="text-right shrink-0 pl-2">
                          <span className="text-xs sm:text-sm font-extrabold text-apple-text dark:text-white block">
                            {formatPrice(vehicle.price)} <span className="text-[10px] text-apple-text-muted font-normal">PKR</span>
                          </span>
                          <span className={cn(
                            "inline-flex items-center gap-0.5 text-[10px] font-bold mt-1 transition-colors",
                            isSelected ? "text-apple-blue" : "text-apple-text-muted group-hover:text-apple-text"
                          )}>
                            <span>View</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <div className="w-12 h-12 rounded-2xl bg-apple-blue/10 text-apple-blue flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-apple-text dark:text-white">No properties found</h3>
                  <p className="text-xs text-apple-text-muted mt-1 max-w-xs mx-auto">
                    We couldn't find matches for "{query}". Try checking city names or general terms like "DHA", "Gulberg", or "Apartment".
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Keyboard Controls Footer */}
            <div className="px-4 sm:px-6 py-2.5 bg-apple-gray/40 dark:bg-white/[0.03] border-t border-apple-border/20 dark:border-white/10 flex items-center justify-between text-[11px] text-apple-text-muted">
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-apple-border/30 dark:border-white/10 text-[9px] font-bold">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-apple-border/30 dark:border-white/10 text-[9px] font-bold">↓</kbd>
                  <span className="ml-1">Navigate</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-apple-border/30 dark:border-white/10 text-[9px] font-bold">↵</kbd>
                  <span className="ml-1">Open</span>
                </span>
              </div>

              <button
                onClick={() => {
                  onClose();
                  navigate(`/marketplace?search=${encodeURIComponent(query)}`);
                }}
                className="text-apple-blue font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View all in Marketplace</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
