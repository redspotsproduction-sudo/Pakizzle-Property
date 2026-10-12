import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, Pin, ShieldAlert, Check, ChevronLeft } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { cn, formatPrice } from '../../lib/utils';

interface ChatListProps {
  isDashboardView?: boolean;
}

export default function ChatList({ isDashboardView = false }: ChatListProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversations, activeConversationId, setActiveConversationId, togglePin, toggleBlock } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'buying' | 'selling' | 'unread'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.participants.find(p => p.uid !== user?.uid) || conv.participants[0];
    const matchesSearch = otherParticipant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.vehicleName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'buying' && conv.type === 'buying') ||
                         (filter === 'selling' && conv.type === 'selling') ||
                         (filter === 'unread' && conv.unreadCount > 0);

    return matchesSearch && matchesFilter;
  }).sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1));

  const pinnedConversations = conversations.filter(c => c.isPinned);
  const unpinnedConversations = filteredConversations.filter(c => !c.isPinned);

  return (
    <div className={cn("w-full flex flex-col h-full", isDashboardView ? "bg-white dark:bg-[var(--surface-dark)]" : "bg-apple-bg")}>
      {/* Header */}
      <div className={cn(
        "sticky top-0 z-20 border-b",
        isDashboardView 
          ? "p-2 md:p-2.5 border-black/[0.04] dark:border-white/[0.04] bg-white dark:bg-[var(--surface-dark)]" 
          : "p-3 md:p-4 border-apple-border bg-apple-card-bg backdrop-blur-md"
      )}>
        <div className={cn("flex items-center justify-between", isDashboardView ? "mb-2" : "mb-4 md:mb-6")}>
          <div className="flex items-center gap-3">
            {!isDashboardView && (
              <button 
                onClick={() => navigate('/marketplace')}
                className="p-2 -ml-2 hover:bg-apple-gray rounded-full transition-colors text-apple-text-muted"
                title="Back to Marketplace"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            <h1 className={cn(
              "font-bold tracking-tight text-apple-text",
              isDashboardView ? "text-base" : "text-2xl md:text-3xl"
            )}>Messages</h1>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "rounded-full transition-colors",
                isDashboardView ? "p-1.5" : "p-2",
                showFilters ? "bg-apple-blue/10 text-apple-blue" : (isDashboardView ? "hover:bg-black/[0.04] dark:hover:bg-white/5 text-apple-text-muted" : "hover:bg-apple-gray text-apple-text-muted")
              )}
              title="Toggle Filters"
            >
              <Filter className={isDashboardView ? "w-4 h-4" : "w-5 h-5"} />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className={cn("relative", isDashboardView ? "mb-1.5" : "mb-4 md:mb-6")}>
          <Search className={cn("absolute top-1/2 -translate-y-1/2 text-apple-text-muted", isDashboardView ? "left-3 w-3.5 h-3.5" : "left-4 w-4 h-4")} />
          <input
            type="text"
            placeholder="Search messages..."
            className={cn(
              "w-full outline-none transition-all border font-medium",
              isDashboardView
                ? "pl-8 pr-3 py-1.5 rounded-xl text-xs bg-[#F5F5F7] dark:bg-white/5 text-[#1D1D1F] dark:text-white placeholder-[#86868B]/70 border-transparent focus:border-apple-blue/20 focus:bg-white dark:focus:bg-[#1C1C1E]"
                : "pl-11 pr-4 py-3 rounded-2xl text-sm bg-apple-gray text-apple-text border-transparent focus:border-apple-blue/20 focus:ring-2 focus:ring-apple-blue/10"
            )}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Favorites Section */}
        {pinnedConversations.length > 0 && (
          <div className={cn(isDashboardView ? "mb-2.5" : "mb-4 md:mb-6")}>
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className={cn("font-bold text-apple-text-muted uppercase tracking-widest", isDashboardView ? "text-[9px]" : "text-[11px]")}>Favorites</h2>
            </div>
            <div className={cn("flex overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1", isDashboardView ? "gap-2.5" : "gap-4")} style={{ WebkitOverflowScrolling: 'touch' }}>
              {pinnedConversations.map((conv) => {
                const otherParticipant = conv.participants.find(p => p.uid !== user?.uid) || conv.participants[0];
                return (
                  <div
                    key={conv.id}
                    className="flex flex-col items-center gap-1.5 shrink-0 group relative outline-none"
                  >
                    <div
                      className={cn(
                        "relative p-0.5 rounded-full transition-all duration-300",
                        conv.isBlocked 
                          ? "ring-2 ring-apple-red ring-offset-2" 
                          : (activeConversationId === conv.id ? "ring-2 ring-apple-blue ring-offset-2" : "group-hover:scale-105")
                      )}
                      onClick={() => setActiveConversationId(conv.id)}
                    >
                      <div className={cn(
                        "rounded-full overflow-hidden shadow-apple-soft border-2 border-apple-card-bg cursor-pointer",
                        isDashboardView ? "w-10 h-10 md:w-11 md:h-11" : "w-14 h-14 md:w-16 md:h-16"
                      )}>
                        {otherParticipant.photoURL ? (
                          <img 
                            src={otherParticipant.photoURL} 
                            alt={otherParticipant.name}
                            className={cn(
                              "w-full h-full object-cover",
                              conv.isBlocked && "grayscale-[0.5] opacity-80"
                            )}
                          />
                        ) : (
                          <div className="w-full h-full bg-teal-500/15 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-sm md:text-base">
                            {otherParticipant.name?.[0] || 'U'}
                          </div>
                        )}
                      </div>
                      {conv.unreadCount > 0 && (
                        <div className={cn(
                          "absolute -top-1 -right-1 bg-apple-blue text-white font-bold rounded-full flex items-center justify-center border-2 border-apple-card-bg shadow-sm",
                          isDashboardView ? "w-4 h-4 text-[8px]" : "w-5 h-5 text-[10px]"
                        )}>
                          {conv.unreadCount}
                        </div>
                      )}
                      {/* Unpin Button for Favorites */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePin(conv.id);
                        }}
                        className={cn(
                          "absolute -bottom-1 -right-1 bg-apple-card-bg rounded-full shadow-apple-card border border-apple-border flex items-center justify-center text-apple-blue opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 z-10",
                          isDashboardView ? "w-5 h-5" : "w-6 h-6"
                        )}
                        title="Unpin from Favorites"
                      >
                        <Pin className={cn(isDashboardView ? "w-2.5 h-2.5" : "w-3 h-3", "fill-apple-blue")} />
                      </button>
                    </div>
                    <span className={cn(
                      "font-bold truncate text-center",
                      isDashboardView ? "text-[8px] w-12" : "text-[10px] w-16",
                      conv.isBlocked ? "text-apple-red" : "text-apple-text"
                    )}>
                      {otherParticipant.name.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 overflow-x-auto pb-3 pt-1 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
                {['all', 'buying', 'selling', 'unread'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={cn(
                      "px-5 py-2 rounded-full text-[11px] font-bold capitalize whitespace-nowrap transition-all border",
                      filter === f 
                        ? (isDashboardView ? "bg-apple-blue text-white border-apple-blue shadow-sm" : "bg-apple-text text-white border-apple-text shadow-sm")
                        : (isDashboardView 
                            ? "bg-[#F5F5F7] dark:bg-white/5 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white border-transparent hover:bg-black/[0.04] dark:hover:bg-white/10"
                            : "bg-apple-card-bg text-apple-text-muted border-apple-border hover:bg-apple-gray")
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className={cn(isDashboardView ? "px-1.5 py-2" : "px-2 py-4")}>
          <h2 className={cn("font-bold text-apple-text-muted uppercase tracking-widest px-2", isDashboardView ? "text-[9px] mb-2" : "text-[11px] mb-4")}>All Messages</h2>
          <div className="space-y-1">
            {unpinnedConversations.map((conv) => {
              const otherParticipant = conv.participants.find(p => p.uid !== user?.uid) || conv.participants[0];
              return (
                <motion.div
                  layout
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={cn(
                    "w-full flex transition-all relative group cursor-pointer",
                    isDashboardView ? "p-2 gap-2.5 rounded-xl" : "p-3 gap-4 rounded-2xl",
                    conv.isBlocked 
                      ? "bg-apple-red/5 hover:bg-apple-red/10 border border-apple-red/10" 
                      : (isDashboardView ? "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]" : "hover:bg-apple-gray/50"),
                    activeConversationId === conv.id && !conv.isBlocked && (isDashboardView ? "bg-apple-blue/5 dark:bg-apple-blue/10 shadow-sm" : "bg-apple-blue/5 shadow-sm"),
                    activeConversationId === conv.id && conv.isBlocked && "bg-apple-red/10 shadow-sm"
                  )}
                >
                  <div className="relative shrink-0">
                    {otherParticipant.photoURL ? (
                      <img 
                        src={otherParticipant.photoURL} 
                        alt={otherParticipant.name}
                        className={cn(
                          "object-cover shadow-apple-soft",
                          isDashboardView ? "w-10 h-10 rounded-xl" : "w-12 h-12 md:w-14 md:h-14 rounded-2xl",
                          conv.isBlocked && "grayscale-[0.5] opacity-80"
                        )}
                      />
                    ) : (
                      <div className={cn(
                        "bg-teal-500/15 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center shadow-apple-soft",
                        isDashboardView ? "w-10 h-10 rounded-xl text-xs" : "w-12 h-12 md:w-14 md:h-14 rounded-2xl text-base"
                      )}>
                        {otherParticipant.name?.[0] || 'U'}
                      </div>
                    )}
                    {conv.unreadCount > 0 && (
                      <div className={cn(
                        "absolute -top-1.5 -right-1.5 bg-apple-blue text-white font-bold rounded-full flex items-center justify-center border-2 border-apple-card-bg shadow-sm",
                        isDashboardView ? "w-4 h-4 text-[8px]" : "w-5 h-5 text-[10px]"
                      )}>
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-left py-0.5">
                    <div className="flex justify-between items-start mb-0.5">
                      <h3 className={cn(
                        "font-bold truncate pr-2",
                        isDashboardView ? "text-xs" : "text-[15px]",
                        conv.isBlocked ? "text-apple-red" : "text-apple-text"
                      )}>
                        {otherParticipant.name}
                        {conv.isBlocked && <span className="ml-2 text-[10px] font-bold uppercase tracking-widest opacity-60">(Blocked)</span>}
                      </h3>
                      <span className={cn(
                        "font-medium",
                        isDashboardView ? "text-[9px]" : "text-[11px]",
                        conv.isBlocked ? "text-apple-red/60" : "text-apple-text-muted"
                      )}>
                        {conv.lastMessage ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    
                    <div className={cn(
                      "font-bold truncate",
                      isDashboardView ? "text-[10px] mb-0.5" : "text-[13px] mb-1.5",
                      conv.isBlocked ? "text-apple-red/80" : "text-apple-blue"
                    )}>
                      {conv.vehicleName}
                    </div>
                    
                    <p className={cn(
                      "truncate leading-relaxed",
                      isDashboardView ? "text-[10px]" : "text-xs",
                      conv.isBlocked ? "text-apple-red/60" : (conv.unreadCount > 0 ? "text-apple-text font-bold" : "text-apple-text-muted")
                    )}>
                      {conv.isBlocked ? "This user is blocked" : conv.lastMessage?.text}
                    </p>
                  </div>

                  {/* Actions overlay */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <button 
                      onClick={(e) => { e.stopPropagation(); togglePin(conv.id); }}
                      className={cn(
                        "rounded-full bg-apple-card-bg shadow-apple-card border border-apple-border transition-all hover:scale-110",
                        isDashboardView ? "p-1.5" : "p-2.5",
                        conv.isPinned ? "text-apple-blue" : "text-apple-text-muted hover:text-apple-blue"
                      )}
                    >
                      <Pin className={isDashboardView ? "w-3 h-3" : "w-3.5 h-3.5"} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleBlock(conv.id); }}
                      className={cn(
                        "rounded-full bg-apple-card-bg shadow-apple-card border border-apple-border transition-all hover:scale-110",
                        isDashboardView ? "p-1.5" : "p-2.5",
                        conv.isBlocked ? "text-apple-red" : "text-apple-text-muted hover:text-apple-red"
                      )}
                    >
                      <ShieldAlert className={isDashboardView ? "w-3 h-3" : "w-3.5 h-3.5"} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
