import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Check, 
  Trash2, 
  Clock, 
  ExternalLink, 
  X, 
  Car, 
  MessageSquare, 
  RefreshCw, 
  ShieldAlert,
  Zap,
  Info
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

interface NotificationCenterProps {
  onClose?: () => void;
}

const typeConfig = {
  listing: { icon: Car, color: 'text-apple-blue', bg: 'bg-apple-blue/10' },
  message: { icon: MessageSquare, color: 'text-apple-purple', bg: 'bg-apple-purple/10' },
  update: { icon: RefreshCw, color: 'text-apple-green', bg: 'bg-apple-green/10' },
  security: { icon: ShieldAlert, color: 'text-apple-red', bg: 'bg-apple-red/10' },
  auction: { icon: Zap, color: 'text-apple-orange', bg: 'bg-apple-orange/10' },
  system: { icon: Info, color: 'text-apple-text-muted', bg: 'bg-apple-gray/10' }
};

export default function NotificationCenter({ onClose }: NotificationCenterProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' ? true : n.status === 'unread'
  );

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-apple-border/10 flex items-center justify-between shrink-0 bg-white/40 dark:bg-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-6 h-6 text-apple-text" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-apple-red text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-[#1D1D1F] animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-apple-text">Alerts & Notifications</h3>
            <p className="text-xs text-apple-text-muted font-medium mt-0.5">Real-time alerts & updates</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button 
              onClick={() => markAllAsRead()}
              className="text-[11px] font-bold text-apple-blue hover:text-apple-blue/80 px-3 py-1 bg-apple-blue/5 rounded-full transition-all"
            >
              Clear All
            </button>
          )}
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-apple-gray dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-apple-text-muted" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 py-4 flex gap-4 border-b border-apple-border/5 bg-apple-gray/20 dark:bg-white/[0.02]">
        <button 
          onClick={() => setFilter('all')}
          className={cn(
            "text-[11px] font-bold tracking-wide transition-all relative pb-1",
            filter === 'all' ? "text-apple-text" : "text-apple-text-muted opacity-50 hover:opacity-100"
          )}
        >
          All Alerts
          {filter === 'all' && <motion.div layoutId="notif-filter" className="absolute bottom-0 left-0 w-full h-0.5 bg-apple-blue rounded-full" />}
        </button>
        <button 
          onClick={() => setFilter('unread')}
          className={cn(
            "text-[11px] font-bold tracking-wide transition-all relative pb-1",
            filter === 'unread' ? "text-apple-text" : "text-apple-text-muted opacity-50 hover:opacity-100"
          )}
        >
          Unread ({unreadCount})
          {filter === 'unread' && <motion.div layoutId="notif-filter" className="absolute bottom-0 left-0 w-full h-0.5 bg-apple-blue rounded-full" />}
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification, idx) => {
              const config = typeConfig[notification.type as keyof typeof typeConfig] || typeConfig.system;
              return (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "p-6 border-b border-apple-border/5 transition-all group hover:bg-white dark:hover:bg-white/[0.01]",
                    notification.status === 'unread' ? "bg-apple-blue/5 dark:bg-apple-blue/[0.02]" : ""
                  )}
                >
                  <div className="flex gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500",
                      config.bg, config.color
                    )}>
                      <config.icon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-apple-text-muted flex items-center gap-2">
                          {notification.type}
                          <span className="w-1 h-1 rounded-full bg-apple-border/50" />
                          <Clock className="w-3 h-3" />
                          {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {notification.status === 'unread' && (
                          <button 
                            onClick={() => markAsRead(notification.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-apple-green/10 text-apple-green transition-all"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <h4 className="text-[15px] font-bold text-apple-text tracking-tight">{notification.title}</h4>
                      <p className="text-[13px] text-apple-text-muted font-medium leading-[1.4]">
                        {notification.message}
                      </p>

                      {notification.link && (
                        <Link 
                          to={notification.link}
                          onClick={() => {
                            markAsRead(notification.id);
                            onClose?.();
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-apple-blue mt-2 group/link hover:underline"
                        >
                          View Details
                          <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-center px-10">
              <div className="w-16 h-16 rounded-[2rem] bg-apple-gray/50 dark:bg-white/5 flex items-center justify-center mb-6">
                <Bell className="w-8 h-8 text-apple-text-muted opacity-20" />
              </div>
              <h4 className="text-sm font-bold text-apple-text mb-1">All Caught Up</h4>
              <p className="text-xs text-apple-text-muted font-medium">All notifications are up to date. You are performing at peak efficiency.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Branding */}
      <div className="p-6 border-t border-apple-border/10 bg-apple-gray/10 dark:bg-white/[0.02] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-apple-blue" />
          <span className="text-[10px] font-semibold text-apple-text-muted">Alert System Hub</span>
        </div>
        <button className="text-[10px] font-bold text-apple-text-muted opacity-60 hover:opacity-100 transition-opacity">
          Preferences
        </button>
      </div>
    </div>
  );
}
