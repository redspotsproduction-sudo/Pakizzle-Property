import React from "react";
import { useVehicles } from "../context/VehicleContext";
import VehicleCard from "./VehicleCard";
import { motion } from "motion/react";
import { History, Trash2, ArrowRight } from "lucide-react";

export default function RecentlyViewed() {
  const { recentlyViewed, vehicles, clearRecentlyViewed } = useVehicles();

  // Find actual vehicle objects corresponding to viewed IDs
  const viewedVehicles = React.useMemo(() => {
    return recentlyViewed
      .map(id => vehicles.find(v => v.id === id))
      .filter((v): v is typeof vehicles[0] => v !== undefined && v.status !== "inactive");
  }, [recentlyViewed, vehicles]);

  if (viewedVehicles.length === 0) return null;

  return (
    <section className="py-12 md:py-16 max-w-7xl lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 border-t border-apple-border/20 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-2 text-apple-blue font-bold text-[10px] md:text-xs uppercase tracking-widest mb-2">
            <History className="w-3.5 h-3.5 animate-pulse" />
            <span>Search History</span>
          </div>
          <h2 className="text-2xl md:text-3.5xl font-bold tracking-tight text-apple-text">
            You recently looked at
          </h2>
          <p className="text-sm text-apple-text-muted mt-1">
            Pick up right where you left off on these stellar selections.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={clearRecentlyViewed}
          className="flex items-center gap-2 text-[11px] font-bold text-apple-text-muted hover:text-apple-red transition-all uppercase tracking-widest bg-apple-gray dark:bg-white/5 py-2.5 px-4 rounded-full border border-apple-border/10 self-end sm:self-auto shadow-apple-soft hover:shadow-apple-soft-hover"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </motion.button>
      </div>

      {/* Horizontal Scrolling Gallery */}
      <div className="relative">
        <div 
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory -mx-6 px-6 scroll-pl-6"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {viewedVehicles.map((vehicle, index) => (
            <motion.div
              key={`rv-${vehicle.id}`}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="flex-shrink-0 w-[270px] sm:w-[320px] snap-start"
            >
              <VehicleCard vehicle={vehicle} />
            </motion.div>
          ))}
          
          {/* Explore More Card at the end of scroll */}
          {viewedVehicles.length >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex-shrink-0 w-[220px] sm:w-[260px] snap-start flex justify-center items-center"
            >
              <a 
                href="/marketplace"
                className="group flex flex-col items-center justify-center text-center p-8 rounded-[32px] border-2 border-dashed border-apple-border/40 hover:border-apple-blue/40 bg-apple-gray/10 hover:bg-apple-blue/5 h-full w-full transition-all duration-300 min-h-[360px]"
              >
                <div className="w-12 h-12 rounded-full bg-apple-blue/10 flex items-center justify-center text-apple-blue mb-4 group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="font-bold text-lg text-apple-text group-hover:text-apple-blue transition-colors">
                  Explore More
                </h3>
                <p className="text-xs text-apple-text-muted mt-2 max-w-[160px]">
                  Uncover extra neural-verified listings matching your taste.
                </p>
              </a>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
