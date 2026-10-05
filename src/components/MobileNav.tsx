import { motion } from "motion/react";
import { Home, Search, PlusCircle, Heart, User, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { useWishlist } from "../context/WishlistContext";
import { SPRING_SNAPPY } from "./motion";

interface MobileNavItem {
  name: string;
  icon: any;
  path: string;
  highlight?: boolean;
}

const NAV_ITEMS: MobileNavItem[] = [
  { name: "Home", icon: Home, path: "/" },
  { name: "Search", icon: Search, path: "/marketplace" },
  { name: "Stories", icon: Sparkles, path: "/stories", highlight: false },
  { name: "Saved", icon: Heart, path: "/wishlist" },
  { name: "Profile", icon: User, path: "/dashboard" },
];

export default function MobileNav() {
  const location = useLocation();
  const { wishlist } = useWishlist();
  const savedCount = wishlist?.length || 0;

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.25rem)] max-w-md pointer-events-auto"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="relative h-15 sm:h-16 bg-white/90 dark:bg-[#141824]/95 backdrop-blur-2xl rounded-2xl sm:rounded-full border border-black/10 dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.55)] grid grid-cols-5 items-center px-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path));
          const isSaved = item.name === "Saved";

          return (
            <Link 
              key={item.name} 
              to={item.path}
              className="relative flex flex-col items-center justify-center min-h-[44px] h-full py-1 text-center touch-target"
            >
              {isActive && (
                <motion.div
                  layoutId="mobileNavActivePill"
                  className="absolute inset-x-1.5 inset-y-1 bg-apple-blue/10 dark:bg-apple-blue/20 rounded-xl sm:rounded-full -z-10"
                  transition={SPRING_SNAPPY}
                />
              )}
              
              <div className="relative flex flex-col items-center justify-center">
                {item.highlight ? (
                  <div className="w-8 h-8 rounded-full bg-apple-blue text-white flex items-center justify-center shadow-md shadow-apple-blue/30 -mt-1">
                    <item.icon className="w-4 h-4 stroke-[2.5]" />
                  </div>
                ) : (
                  <item.icon 
                    strokeWidth={isActive ? 2.4 : 1.8} 
                    className={cn(
                      "w-5 h-5 transition-transform duration-200",
                      isActive ? "text-apple-blue scale-105" : "text-apple-text-muted dark:text-slate-400"
                    )} 
                  />
                )}

                {isSaved && savedCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[15px] h-3.5 px-1 bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-white dark:border-black shadow-xs">
                    {savedCount}
                  </span>
                )}

                <span 
                  className={cn(
                    "text-[10px] tracking-tight mt-0.5 font-medium transition-colors leading-tight",
                    isActive ? "text-apple-blue font-bold" : "text-apple-text-muted dark:text-slate-400",
                    item.highlight && "text-apple-blue font-bold"
                  )}
                >
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
