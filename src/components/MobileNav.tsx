import { motion } from "motion/react";
import { Home, Search, Play, PlusCircle, MessageSquare, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { useChat } from "../context/ChatContext";

const NAV_ITEMS = [
  { name: "Home", icon: Home, path: "/" },
  { name: "Reels", icon: Play, path: "/reels" },
  { name: "Search", icon: Search, path: "/marketplace" },
  { name: "Sell", icon: PlusCircle, path: "/sell" },
  { name: "Messages", icon: MessageSquare, path: "/chat" },
  { name: "Account", icon: User, path: "/dashboard" },
];

export default function MobileNav() {
  const location = useLocation();
  const { conversations } = useChat();
  const totalUnreadCount = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

  return (
    <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2.5rem)] max-w-lg">
      <div className="relative h-14 md:h-16 bg-apple-card-bg/80 backdrop-blur-[30px] rounded-full border border-apple-border/50 shadow-apple-soft flex items-center px-1.5 overflow-hidden">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const isMessages = item.name === "Messages";
          
          return (
            <Link 
              key={item.name} 
              to={item.path}
              className="relative flex-1 h-full flex items-center justify-center"
            >
              {isActive && (
                <motion.div
                  layoutId="activePill"
                  className="absolute inset-y-1.5 inset-x-1 bg-apple-blue/10 rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              
              <div className={cn(
                "relative z-10 flex items-center gap-2 px-3 transition-all duration-300",
                isActive ? "text-apple-blue" : "text-apple-text-muted hover:text-apple-text"
              )}>
                <div className="relative">
                  <item.icon 
                    strokeWidth={isActive ? 2.5 : 1.8} 
                    className={cn(
                      "w-5 h-5 md:w-6 md:h-6 transition-all duration-300",
                      isActive && "scale-110"
                    )} 
                  />
                  {isMessages && totalUnreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 px-1 bg-apple-red text-white text-[8px] font-semibold flex items-center justify-center rounded-full border-2 border-apple-card-bg shadow-sm">
                      {totalUnreadCount}
                    </span>
                  )}
                </div>
                
                {isActive && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[11px] md:text-sm font-semibold tracking-tight"
                  >
                    {item.name}
                  </motion.span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
