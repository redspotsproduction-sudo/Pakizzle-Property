import { motion, AnimatePresence } from "motion/react";
import { X, MapPin, Navigation, Search, ChevronRight, Globe, Sparkles } from "lucide-react";
import { useLocation } from "../context/LocationContext";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { CITY_PROVINCE_MAP } from "../constants/locations";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LocationModal({ isOpen, onClose }: LocationModalProps) {
  const { location, setLocation, availableCities, areasByCity, detectLocation, isLoading } = useLocation();
  const [selectedCity, setSelectedCity] = useState<string | null>(location?.city || null);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync selected city with location changes
  useEffect(() => {
    if (location?.city && location.city !== "Pakistan") {
      setSelectedCity(location.city);
    }
  }, [location]);

  const filteredCities = availableCities.filter(city => 
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
  };

  const handleAreaSelect = (area: string) => {
    if (selectedCity) {
      setLocation({
        city: selectedCity,
        area: area,
        province: CITY_PROVINCE_MAP[selectedCity],
        isAutoDetected: false
      });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* High-end glass overlay/backdrop that covers pages and closes on clicks */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-950/40 dark:bg-black/60 backdrop-blur-[12px] cursor-pointer"
          />

          {/* Premium Centered Overlay Card with Apple-aesthetic spacing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-white/95 dark:bg-[#121215]/90 backdrop-blur-[40px] rounded-[32px] shadow-[0_30px_80px_rgba(0,0,0,0.25)] border border-slate-200/50 dark:border-white/[0.06] overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Elegant Header Zone */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-white/[0.04] flex justify-between items-center shrink-0 bg-transparent">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight text-[#1D1D1F] dark:text-white flex items-center gap-1.5">
                    Select Your Market
                  </h2>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Locate verified listings nearby</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-full transition-colors group cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5 text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Sleek, ultra-efficient Control Hub Row */}
              <div className="p-4 bg-slate-50/45 dark:bg-black/10 border-b border-slate-100 dark:border-white/[0.03] space-y-3 shrink-0">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Dynamic Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search Pakistan cities..."
                      className="w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-[#1C1C1E]/70 dark:text-white rounded-xl border border-slate-200/60 dark:border-white/[0.06] focus:border-red-500/50 focus:bg-white dark:focus:bg-[#1C1C1E] transition-all outline-none font-bold text-xs"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Geolocation Trigger */}
                  <button 
                    onClick={detectLocation}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-apple-blue text-white hover:bg-apple-blue/90 disabled:opacity-75 transition-all text-xs font-extrabold shrink-0 active:scale-98 shadow-sm"
                  >
                    <Navigation className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
                    <span>{isLoading ? "Locating..." : "Auto-detect Region"}</span>
                  </button>
                </div>
              </div>

              {/* Responsive Double Column Container with Minimal Heights */}
              <div className="flex-1 min-h-[160px] overflow-hidden flex">
                
                {/* Left: Cities List */}
                <div className="w-1/2 border-r border-slate-100 dark:border-[#2C2C2E]/30 overflow-y-auto p-3 custom-scrollbar">
                  <span className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest block mb-2 px-3">
                    Top Markets
                  </span>
                  <div className="space-y-1">
                    {filteredCities.map(city => (
                      <button
                        key={city}
                        onClick={() => handleCitySelect(city)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all font-bold text-xs text-left",
                          selectedCity === city 
                            ? "bg-red-500/10 text-red-600 dark:text-red-400 border-l-[3px] border-red-500 pl-2" 
                            : "hover:bg-slate-100/50 dark:hover:bg-white/[0.03] text-slate-700 dark:text-zinc-300"
                        )}
                      >
                        <span>{city}</span>
                        {selectedCity === city && <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right: Areas List */}
                <div className="w-1/2 overflow-y-auto p-3 custom-scrollbar bg-slate-50/20 dark:bg-black/05">
                  <span className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest block mb-2 px-3">
                    {selectedCity ? `Sectors in ${selectedCity}` : 'Sector Selection'}
                  </span>
                  <div className="space-y-1">
                    {selectedCity ? (
                      areasByCity[selectedCity]?.map(area => (
                        <button
                          key={area}
                          onClick={() => handleAreaSelect(area)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100/80 dark:hover:bg-white/[0.04] transition-all font-bold text-xs text-slate-600 dark:text-zinc-400 text-left"
                        >
                          <span>{area}</span>
                          <ChevronRight className="w-3 h-3 opacity-50" />
                        </button>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                        <Globe className="w-8 h-8 mb-2 text-slate-300 dark:text-zinc-700 animate-pulse" />
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Select a city first</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Premium action links in bottom glass container */}
            <div className="p-4.5 bg-slate-100/70 dark:bg-[#1E1E22]/50 border-t border-slate-100 dark:border-white/[0.04] flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
              <button 
                onClick={() => {
                  setLocation(null);
                  onClose();
                }}
                className="text-xs font-extrabold text-[#D92128] hover:text-[#B91C1C] transition-colors flex items-center gap-1.5 focus:outline-none"
              >
                ← Back to Portal Landing
              </button>
              
              <button 
                onClick={() => {
                  setLocation({ 
                    city: "Pakistan", 
                    province: undefined,
                    isAutoDetected: false 
                  });
                  onClose();
                }}
                className="px-4 py-2 rounded-lg bg-slate-200/50 hover:bg-slate-250/60 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-xs font-bold text-slate-700 dark:text-zinc-300 transition-all focus:outline-none"
              >
                Show All listings in Pakistan
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
