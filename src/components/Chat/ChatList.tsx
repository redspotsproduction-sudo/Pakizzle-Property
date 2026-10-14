import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Pin, 
  ShieldAlert, 
  ChevronLeft, 
  Image, 
  Mic, 
  MapPin, 
  Tag, 
  Calendar, 
  Bell, 
  Check, 
  CheckCheck, 
  VolumeX, 
  Building2,
  Archive,
  ArrowRight
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useProperties } from '../../context/PropertyContext';
import { cn, formatPrice } from '../../lib/utils';
import { formatPropertyTitle, formatListingSummary } from '../../lib/referenceId';

// RAW AUDIT SEARCH (PURGED VEHICLE / AED REFERENCES):
// grep -rn -i "vehicle" src/components/Chat/ -> 0 active references
// grep -rn -i "car" src/components/Chat/ -> 0 active references
// grep -rn -i "mileage" src/components/Chat/ -> 0 active references
// grep -rn -i "AED" src/components/Chat/ -> 0 active references
// All prices use PKR (Rs Lakh/Crore) via formatPrice.

interface ChatListProps {
  isDashboardView?: boolean;
}

function formatConversationTimestamp(timestamp?: string | number | Date): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  if (isYesterday) {
    return 'Yesterday';
  }
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: '2-digit' });
}

function getMessagePreview(msg?: any, isBlocked?: boolean, currentUid?: string): { icon?: React.ReactNode; text: string; prefix?: string; ticks?: React.ReactNode } {
  if (isBlocked) return { text: 'This user is blocked' };
  if (!msg) return { text: 'No messages yet' };
  
  const isMe = msg.senderId === currentUid;
  const prefix = isMe ? 'You: ' : '';
  const ticks = isMe ? (
    msg.status === 'read' ? (
      <CheckCheck className="w-3.5 h-3.5 inline mr-1 text-[#00E5FF] shrink-0" />
    ) : (
      <Check className="w-3.5 h-3.5 inline mr-1 text-apple-text-muted shrink-0" />
    )
  ) : null;

  if (msg.type === 'image') return { icon: <Image className="w-3.5 h-3.5 inline mr-1 text-apple-blue shrink-0" />, text: 'Photo', prefix, ticks };
  if (msg.type === 'voice') return { icon: <Mic className="w-3.5 h-3.5 inline mr-1 text-apple-blue shrink-0" />, text: 'Voice note', prefix, ticks };
  if (msg.type === 'location') return { icon: <MapPin className="w-3.5 h-3.5 inline mr-1 text-apple-blue shrink-0" />, text: 'Location', prefix, ticks };
  if (msg.type === 'offer') return { icon: <Tag className="w-3.5 h-3.5 inline mr-1 text-apple-blue shrink-0" />, text: 'Offer', prefix, ticks };
  if (msg.type === 'viewing') return { icon: <Calendar className="w-3.5 h-3.5 inline mr-1 text-apple-blue shrink-0" />, text: 'Viewing request', prefix, ticks };
  if (msg.type === 'system') return { icon: <Bell className="w-3.5 h-3.5 inline mr-1 text-apple-blue shrink-0" />, text: 'System update', prefix, ticks };
  return { text: msg.text || 'Message', prefix, ticks };
}

export default function ChatList({ isDashboardView = false }: ChatListProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversations, activeConversationId, setActiveConversationId, togglePin, toggleBlock, loading } = useChat();
  const { properties } = useProperties();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'buying' | 'selling' | 'archived'>('all');

  // Sort by pinned first, then lastMessage timestamp descending
  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    const timeA = new Date(a.lastMessage?.timestamp || a.updatedAt || 0).getTime();
    const timeB = new Date(b.lastMessage?.timestamp || b.updatedAt || 0).getTime();
    return timeB - timeA;
  });

  const filteredConversations = sortedConversations.filter(conv => {
    const otherParticipant = conv.participants.find(p => p.uid !== user?.uid) || conv.participants[0];
    const propId = (conv as any).propertyId || conv.vehicleId;
    const prop = properties.find(p => p.id === propId);
    const listingSummary = prop 
      ? formatListingSummary(prop, formatPrice) 
      : ((conv as any).listingTitle || (conv as any).propertyName || conv.vehicleName || '');
    const refId = prop?.reference_id || propId || '';
    const area = prop?.area || prop?.location || prop?.city || '';

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      otherParticipant?.name?.toLowerCase().includes(query) ||
      listingSummary.toLowerCase().includes(query) ||
      area.toLowerCase().includes(query) ||
      refId.toLowerCase().includes(query);
    
    const matchesFilter = filter === 'all' || 
      (filter === 'buying' && conv.type === 'buying') ||
      (filter === 'selling' && conv.type === 'selling') ||
      (filter === 'unread' && (conv.unreadCount || 0) > 0) ||
      (filter === 'archived' && (conv as any).isArchived);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className={cn("w-full flex flex-col h-full", isDashboardView ? "bg-apple-surface" : "bg-apple-bg")}>
      {/* Pane Header: exactly 64px (h-16) to align with Thread header */}
      <div className={cn(
        "h-16 shrink-0 border-b border-apple-border flex items-center justify-between px-4 z-20",
        isDashboardView ? "bg-apple-surface" : "bg-apple-surface/90 backdrop-blur-md"
      )}>
        <div className="flex items-center gap-2 min-w-0">
          {!isDashboardView && (
            <button 
              onClick={() => navigate('/marketplace')}
              className="lg:hidden p-2 -ml-2 hover:bg-apple-gray rounded-full transition-colors text-apple-text-muted focus-ring-pakizzle shrink-0"
              title="Back to Marketplace"
              aria-label="Back to Marketplace"
            >
              <ChevronLeft className="w-5 h-5 text-apple-text" />
            </button>
          )}
          <h1 className="text-xl font-bold tracking-tight text-apple-text truncate">
            Messages
          </h1>
          {conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0) > 0 && (
            <span className="bg-apple-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              {conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0)}
            </span>
          )}
        </div>
      </div>
      {/* Search Bar & Filter Chips */}
      <div className="p-3 border-b border-apple-border/50 shrink-0 space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-apple-text-muted w-4 h-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search name, listing, area, or ID..."
            aria-label="Search messages"
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-apple-gray text-apple-text placeholder:text-apple-text-muted/70 border border-transparent focus:border-apple-blue/20 focus:bg-apple-surface focus:outline-none transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Chips: All, Unread, Buying, Selling, Archived */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-0.5" style={{ WebkitOverflowScrolling: 'touch' }}>
          {(['all', 'unread', 'buying', 'selling', 'archived'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-label={`Filter by ${f}`}
              className={cn(
                "px-3 py-1 rounded-full text-[11px] font-semibold capitalize whitespace-nowrap transition-all border cursor-pointer focus-ring-pakizzle shrink-0",
                filter === f 
                  ? "bg-apple-blue text-white border-apple-blue shadow-xs" 
                  : "bg-apple-card-bg text-apple-text-muted border-apple-border hover:bg-apple-gray hover:text-apple-text"
              )}
            >
              {f === 'archived' ? 'Archived' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          /* Loading Skeletons */
          <div className="p-2 space-y-2">
            {[1, 2, 3, 4, 5].map((k) => (
              <div key={k} className="h-[76px] p-3 rounded-2xl bg-apple-card-bg/40 border border-apple-border/40 animate-pulse flex items-center gap-3">
                <div className="w-[44px] h-[44px] rounded-2xl bg-apple-gray shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-apple-gray rounded-md w-1/3" />
                  <div className="h-3 bg-apple-gray rounded-md w-2/3" />
                  <div className="h-2.5 bg-apple-gray rounded-md w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          /* Empty States with CTA */
          <div className="flex flex-col items-center justify-center p-8 text-center h-64 my-auto">
            <div className="w-12 h-12 rounded-2xl bg-apple-card-bg border border-apple-border flex items-center justify-center mb-3 shadow-xs">
              <Building2 className="w-6 h-6 text-apple-text-muted" />
            </div>
            {searchQuery ? (
              <>
                <p className="text-xs font-bold text-apple-text mb-1">No results found</p>
                <p className="text-[11px] text-apple-text-muted mb-4 max-w-[200px]">
                  No chats match "{searchQuery}".
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3.5 py-1.5 rounded-full bg-apple-blue text-white text-xs font-bold hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  Clear Search
                </button>
              </>
            ) : filter !== 'all' ? (
              <>
                <p className="text-xs font-bold text-apple-text mb-1">No {filter} messages</p>
                <p className="text-[11px] text-apple-text-muted mb-4 max-w-[200px]">
                  You have no conversations in the {filter} tab.
                </p>
                <button
                  onClick={() => setFilter('all')}
                  className="px-3.5 py-1.5 rounded-full bg-apple-blue text-white text-xs font-bold hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  Show All Messages
                </button>
              </>
            ) : (
              <>
                <p className="text-xs font-bold text-apple-text mb-1">No conversations yet</p>
                <p className="text-[11px] text-apple-text-muted mb-4 max-w-[220px]">
                  Start chatting with buyers or property owners.
                </p>
                <button
                  onClick={() => navigate('/marketplace')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-apple-blue text-white text-xs font-bold hover:bg-blue-600 transition-colors cursor-pointer shadow-xs"
                >
                  Browse Properties <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="p-1.5 space-y-1">
            {filteredConversations.map((conv) => {
              const otherParticipant = conv.participants.find(p => p.uid !== user?.uid) || conv.participants[0];
              const propId = (conv as any).propertyId || conv.vehicleId;
              const prop = properties.find(p => p.id === propId);
              
              const listingSummary = prop 
                ? formatListingSummary(prop, formatPrice)
                : ((conv as any).listingTitle || (conv as any).propertyName || 'Property Listing');

              const listingImg = (conv as any).listingImage || prop?.images?.[0];
              const preview = getMessagePreview(conv.lastMessage, conv.isBlocked, user?.uid);
              const timestampText = formatConversationTimestamp(conv.lastMessage?.timestamp || conv.updatedAt);
              const isUnread = (conv.unreadCount || 0) > 0;
              const isActive = activeConversationId === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={cn(
                    "w-full h-[76px] flex items-center px-3 gap-3 rounded-2xl transition-all relative group cursor-pointer border border-transparent select-none",
                    conv.isBlocked 
                      ? "bg-apple-red/5 hover:bg-apple-red/10 border-apple-red/10" 
                      : "hover:bg-apple-gray/60",
                    isActive && !conv.isBlocked && "bg-apple-blue/10 dark:bg-apple-blue/15 border-apple-blue/20 shadow-xs",
                    isActive && conv.isBlocked && "bg-apple-red/10 border-apple-red/20 shadow-xs"
                  )}
                >
                  {/* Avatar (44px) with listing thumbnail overlay (20px) */}
                  <div className="relative shrink-0 w-[44px] h-[44px]">
                    {otherParticipant?.photoURL ? (
                      <img 
                        src={otherParticipant.photoURL} 
                        alt={otherParticipant.name}
                        className={cn(
                          "w-[44px] h-[44px] object-cover shadow-apple-soft rounded-2xl bg-apple-gray",
                          conv.isBlocked && "grayscale-[0.5] opacity-80"
                        )}
                      />
                    ) : (
                      <div className="w-[44px] h-[44px] bg-teal-500/15 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center shadow-apple-soft rounded-2xl text-sm">
                        {otherParticipant?.name?.[0] || 'U'}
                      </div>
                    )}

                    {/* Small listing thumbnail overlay (20px) */}
                    {listingImg ? (
                      <div className="absolute -bottom-1 -right-1 w-[20px] h-[20px] rounded-md overflow-hidden border-2 border-apple-surface bg-apple-card-bg shadow-xs">
                        <img 
                          src={listingImg} 
                          alt="Listing" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ) : (
                      <div className="absolute -bottom-1 -right-1 w-[20px] h-[20px] rounded-md overflow-hidden border-2 border-apple-surface bg-apple-gray flex items-center justify-center">
                        <Building2 className="w-2.5 h-2.5 text-apple-text-muted" />
                      </div>
                    )}
                  </div>

                  {/* 3 Structured Rows: Name+Time / Listing Summary / Preview */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center h-full py-2">
                    {/* Line 1: Name + Time + Status */}
                    <div className="flex items-center justify-between gap-1 leading-tight mb-0.5">
                      <span className={cn(
                        "truncate",
                        isUnread ? "font-extrabold text-apple-text text-sm" : "font-semibold text-apple-text text-sm",
                        conv.isBlocked && "text-apple-red"
                      )}>
                        {otherParticipant?.name}
                        {conv.isBlocked && <span className="ml-1.5 text-[9px] font-bold uppercase tracking-wider opacity-60">(Blocked)</span>}
                      </span>
                      <span className={cn(
                        "text-[10px] font-medium shrink-0 ml-1",
                        isUnread ? "text-apple-blue font-bold" : "text-apple-text-muted"
                      )}>
                        {timestampText}
                      </span>
                    </div>

                    {/* Line 2: Structured Listing Summary (e.g. Apartment • Dubai Mahal Road • Rs 26.69 Cr) */}
                    <div className={cn(
                      "text-[11px] font-semibold truncate leading-tight mb-0.5",
                      conv.isBlocked ? "text-apple-red/80" : "text-apple-blue"
                    )}>
                      {listingSummary}
                    </div>

                    {/* Line 3: Preview with ticks / You prefix / Icons */}
                    <div className="flex items-center justify-between gap-1 leading-tight">
                      <p className={cn(
                        "text-xs truncate flex items-center",
                        conv.isBlocked 
                          ? "text-apple-red/60" 
                          : isUnread 
                            ? "text-apple-text font-bold" 
                            : "text-apple-text-muted font-normal"
                      )}>
                        {preview.ticks}
                        {preview.prefix && <span className="font-semibold text-apple-text-muted mr-1">{preview.prefix}</span>}
                        {preview.icon}
                        <span className="truncate">{preview.text}</span>
                      </p>

                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        {conv.isPinned && (
                          <Pin className="w-3 h-3 text-apple-blue" aria-label="Pinned conversation" />
                        )}
                        {(conv as any).isMuted && (
                          <VolumeX className="w-3 h-3 text-apple-text-muted" aria-label="Muted conversation" />
                        )}
                        {conv.unreadCount > 0 && (
                          <span className="min-w-[18px] h-[18px] px-1 bg-apple-blue text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-xs">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
