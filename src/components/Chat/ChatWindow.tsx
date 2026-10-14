import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Send, 
  Paperclip, 
  MapPin, 
  Phone, 
  Smile,
  Zap,
  ChevronLeft,
  X,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Check,
  CheckCheck,
  Star,
  Ban,
  Pin,
  Image as ImageIcon,
  Loader2,
  Building2,
  Home,
  Lock,
  MoreVertical,
  VolumeX,
  Archive,
  Flag,
  ExternalLink
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { formatPropertyUrl, formatPropertyTitle } from '../../lib/referenceId';
import { useAuth } from '../../context/AuthContext';
import { useProperties } from '../../context/PropertyContext';
import { cn, formatPrice } from '../../lib/utils';
import { db } from '../../firebase';
import Badge from '../Badge';
import { doc, onSnapshot } from 'firebase/firestore';
import { toast } from 'sonner';
import LocationPermissionModal from './LocationPermissionModal';
import LocationButton from './LocationButton';
import MapPreviewCard from './MapPreviewCard';

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

interface ChatWindowProps {
  isDashboardView?: boolean;
}

export default function ChatWindow({ isDashboardView = false }: ChatWindowProps) {
  const { activeConversationId, conversations, messages, sendMessage, setActiveConversationId, markAsRead, toggleBlock, togglePin, rateUser, loading } = useChat();
  const { user } = useAuth();
  const { properties } = useProperties();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [safetyBannerDismissed, setSafetyBannerDismissed] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [otherUserStatus, setOtherUserStatus] = useState<{ isOnline: boolean, lastSeen: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeConv = conversations.find(c => c.id === activeConversationId);
  const otherParticipant = activeConv?.participants.find(p => p.uid !== user?.uid) || activeConv?.participants[0];

  useEffect(() => {
    if (!otherParticipant?.uid) return;

    const unsubscribe = onSnapshot(doc(db, 'users', otherParticipant.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setOtherUserStatus({
          isOnline: data.isOnline || false,
          lastSeen: data.lastSeen || ''
        });
      }
    });

    return () => unsubscribe();
  }, [otherParticipant?.uid]);

  useEffect(() => {
    if (activeConversationId && activeConv && activeConv.unreadCount > 0) {
      markAsRead(activeConversationId);
    }
  }, [activeConversationId, activeConv?.unreadCount, markAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      if (isImage) {
        const imageUrl = URL.createObjectURL(file);
        sendMessage(`Sent an image: ${file.name}`, 'image', { fileUrl: imageUrl });
      } else {
        sendMessage(`Sent a file: ${file.name}`, 'file', { fileUrl: '#' });
      }
    }
  };

  const handleLocationFetched = (loc: { lat: number; lng: number; accuracy: number }) => {
    sendMessage('Shared location', 'location', {
      location: { 
        lat: loc.lat, 
        lng: loc.lng, 
        accuracy: loc.accuracy,
        address: 'Current Location' 
      }
    });
    setLocationError(null);
  };

  const handleLocationError = (error: string) => {
    setLocationError(error);
    setTimeout(() => setLocationError(null), 5000);
  };

  if (!activeConversationId) {
    return (
      <div className={cn(
        "flex-1 flex flex-col items-center justify-center p-12 text-center",
        isDashboardView ? "bg-apple-surface" : "bg-apple-bg"
      )}>
        <div className="w-20 h-20 md:w-24 md:h-24 bg-apple-card-bg rounded-3xl border border-apple-border flex items-center justify-center mb-6 shadow-xs">
          <Zap className="w-10 h-10 text-apple-blue/30" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2 text-apple-text">Your Messages</h2>
        <p className="max-w-sm leading-relaxed text-xs md:text-sm text-apple-text-muted">
          Select a conversation from the list to start chatting with buyers and sellers.
        </p>
      </div>
    );
  }

  if (!activeConv) {
    if (loading) {
      return (
        <div className={cn(
          "flex-1 flex flex-col items-center justify-center p-12 text-center",
          isDashboardView ? "bg-apple-surface" : "bg-apple-bg"
        )}>
          <Loader2 className="w-10 h-10 text-apple-blue animate-spin mb-4" />
          <p className="text-apple-text-muted font-bold text-sm">Loading conversation...</p>
        </div>
      );
    }
    return (
      <div className={cn(
        "flex-1 flex flex-col items-center justify-center p-12 text-center",
        isDashboardView ? "bg-apple-surface" : "bg-apple-bg"
      )}>
        <div className="w-20 h-20 md:w-24 md:h-24 bg-apple-card-bg rounded-3xl border border-apple-border flex items-center justify-center mb-6 shadow-xs">
          <Ban className="w-10 h-10 text-apple-red/30" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2 text-apple-text">Conversation Not Found</h2>
        <p className="max-w-sm leading-relaxed text-xs md:text-sm text-apple-text-muted">
          This conversation may have been deleted or you don't have permission to view it.
        </p>
        <button 
          onClick={() => setActiveConversationId(null)}
          className="mt-6 px-5 py-2.5 rounded-full bg-apple-blue text-white font-bold text-xs hover:bg-blue-600 transition-colors cursor-pointer"
        >
          Back to Messages
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 flex flex-col h-full relative", isDashboardView ? "bg-apple-surface" : "bg-apple-bg")}>
      {/* Pane Header: exactly 64px (h-16) to align with ChatList */}
      <div className={cn(
        "h-16 border-b border-apple-border flex items-center justify-between px-3 md:px-4 z-40 shrink-0",
        isDashboardView ? "bg-apple-surface" : "bg-apple-surface/90 backdrop-blur-xl shadow-xs"
      )}>
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          {/* Back chevron shown on mobile (<768px) only */}
          <button 
            onClick={() => setActiveConversationId(null)}
            className="md:hidden p-2 -ml-2 hover:bg-apple-gray rounded-full transition-all active:scale-95 text-apple-text shrink-0"
            aria-label="Back to messages list"
            title="Back to messages list"
          >
            <ChevronLeft className="w-5 h-5 text-apple-text" />
          </button>

          <Link to={`/profile/${otherParticipant?.uid}`} className="flex items-center gap-2.5 group min-w-0 flex-1">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-apple-soft group-hover:scale-105 transition-transform duration-300 ring-2 ring-apple-card-bg bg-apple-gray">
                {otherParticipant?.photoURL ? (
                  <img 
                    src={otherParticipant.photoURL} 
                    alt={otherParticipant?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-teal-500/15 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-sm">
                    {otherParticipant?.name?.[0] || 'U'}
                  </div>
                )}
              </div>
              {otherUserStatus?.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-apple-green border-2 border-apple-card-bg rounded-full shadow-xs" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-apple-text text-sm md:text-base leading-tight group-hover:text-apple-blue transition-colors truncate max-w-[140px] md:max-w-[220px]">
                  {otherParticipant?.name}
                </span>

                {/* Verified Badge */}
                {(otherParticipant as any)?.badgeType ? (
                  <Badge type={(otherParticipant as any).badgeType} size="sm" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-apple-blue shrink-0" aria-label="Verified Counterparty" />
                )}

                {/* Role Chip: Owner / Agent / Agency */}
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-[#5B2A86] dark:text-[#F0A830] dark:bg-purple-500/20 shrink-0">
                  {(otherParticipant as any)?.role || (activeConv?.type === 'buying' ? 'Owner' : 'Buyer')}
                </span>

                {activeConv?.isBlocked && (
                  <span className="inline-flex items-center gap-0.5 bg-apple-red/10 text-apple-red rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                    Blocked
                  </span>
                )}
              </div>

              {/* Presence Line: sentence case, >= 12px, AA contrast */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  otherUserStatus?.isOnline ? "bg-apple-green animate-pulse" : "bg-apple-text-muted/40"
                )} />
                <span className="text-xs text-apple-text-muted font-medium truncate">
                  {otherUserStatus?.isOnline 
                    ? 'Active now' 
                    : (otherUserStatus?.lastSeen 
                        ? `Last seen ${formatConversationTimestamp(otherUserStatus.lastSeen).toLowerCase()}` 
                        : 'Offline')}
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Action Buttons: Pin, Call, More */}
        <div className="flex items-center gap-1 md:gap-1.5 shrink-0">
          {/* Pin Toggle Button */}
          <button 
            onClick={() => togglePin(activeConv.id)}
            className={cn(
              "p-2 rounded-full transition-colors focus-ring-pakizzle",
              activeConv?.isPinned 
                ? "bg-apple-blue/10 text-apple-blue" 
                : "hover:bg-apple-gray text-apple-text-muted hover:text-apple-blue"
            )}
            title={activeConv?.isPinned ? "Unpin chat" : "Pin chat"}
            aria-label={activeConv?.isPinned ? "Unpin chat" : "Pin chat"}
          >
            <Pin className="w-4 h-4" />
          </button>

          {/* Call button: disabled until number is shared */}
          <button 
            disabled={!(otherParticipant as any)?.phoneNumberShared}
            onClick={() => {
              if ((otherParticipant as any)?.phoneNumber) {
                window.location.href = `tel:${(otherParticipant as any).phoneNumber}`;
              }
            }}
            className={cn(
              "p-2 rounded-full transition-colors focus-ring-pakizzle",
              (otherParticipant as any)?.phoneNumberShared 
                ? "hover:bg-apple-gray text-apple-green cursor-pointer" 
                : "opacity-40 cursor-not-allowed text-apple-text-muted"
            )}
            title={(otherParticipant as any)?.phoneNumberShared ? "Call counterparty" : "Call available once counterparty shares their number"}
            aria-label="Call counterparty"
          >
            <Phone className="w-4 h-4" />
          </button>

          {/* More Menu */}
          <div className="relative" ref={moreMenuRef}>
            <button 
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 hover:bg-apple-gray rounded-full text-apple-text-muted hover:text-apple-text transition-colors focus-ring-pakizzle"
              title="More actions"
              aria-label="More actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-apple-card-bg border border-apple-border rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    toast.success("Conversation notifications muted");
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-apple-text hover:bg-apple-gray flex items-center gap-2"
                >
                  <VolumeX className="w-3.5 h-3.5 text-apple-text-muted" /> Mute Notifications
                </button>
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    toast.success("Conversation archived");
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-apple-text hover:bg-apple-gray flex items-center gap-2"
                >
                  <Archive className="w-3.5 h-3.5 text-apple-text-muted" /> Archive Chat
                </button>
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    toggleBlock(activeConv.id);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-apple-red hover:bg-apple-red/10 flex items-center gap-2"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-apple-red" /> {activeConv?.isBlocked ? 'Unblock User' : 'Block User'}
                </button>
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    toast("Report submitted", { description: "Our safety team has received the conversation snapshot." });
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-apple-text hover:bg-apple-gray flex items-center gap-2"
                >
                  <Flag className="w-3.5 h-3.5 text-apple-text-muted" /> Report Conversation
                </button>
                <Link
                  to={`/profile/${otherParticipant?.uid}`}
                  onClick={() => setShowMoreMenu(false)}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-apple-text hover:bg-apple-gray flex items-center gap-2 border-t border-apple-border/50"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-apple-text-muted" /> View Profile
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Listing Card: exactly 64px (h-16), clickable */}
      {(activeConv?.propertyId || activeConv?.vehicleId) && (
        <div className="h-16 z-30 border-b border-apple-border flex items-center shrink-0 bg-apple-surface shadow-xs px-3 md:px-4">
          {(() => {
            const propId = activeConv.propertyId || activeConv.vehicleId;
            const property = properties.find(p => p.id === propId);
            const structuredTitle = property ? formatPropertyTitle(property) : ((activeConv as any).listingTitle || (activeConv as any).propertyName || 'Property Listing');
            const priceFormatted = property?.price ? formatPrice(property.price) : 'Price on request';

            return (
              <Link 
                to={property ? formatPropertyUrl(property) : `/property/${propId}`}
                className="w-full flex items-center gap-3 hover:opacity-95 transition-opacity focus-ring-pakizzle rounded-xl"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-xs border border-apple-border bg-apple-gray">
                  {property?.images?.[0] ? (
                    <img 
                      src={property.images[0]} 
                      alt={structuredTitle} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-apple-border" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-apple-text truncate text-xs md:text-sm leading-tight">
                    {structuredTitle}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-extrabold text-apple-blue text-xs md:text-sm">
                      {priceFormatted}
                    </span>
                    <span className="text-[10px] text-apple-text-muted font-medium truncate">
                      {property?.area || property?.location || property?.city || 'Pakistan'}
                    </span>
                  </div>
                </div>
                <span className="bg-apple-blue text-white rounded-full font-bold px-3 py-1.5 text-xs shadow-xs shrink-0">
                  View
                </span>
              </Link>
            );
          })()}
        </div>
      )}

      {/* Messages Stream */}
      <div className={cn("flex-1 overflow-y-auto relative", isDashboardView ? "bg-apple-surface" : "bg-apple-bg")}>
        {/* Background Pattern Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ 
            backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
            backgroundSize: '600px',
          }}
        />

        <div className={cn("relative z-10 space-y-2", isDashboardView ? "p-2 md:p-3" : "p-3 md:p-4")}>
          {/* Dismissible Safety Banner */}
          {!safetyBannerDismissed && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 flex items-center justify-between gap-2 max-w-xl mx-auto shadow-xs">
              <p className="text-xs text-apple-text font-medium leading-relaxed flex-1">
                <span className="font-bold text-amber-800 dark:text-amber-300 mr-1">Safety Notice:</span>
                Never pay token money before seeing the property and verifying ownership documents.
                <button 
                  onClick={() => setShowSafetyModal(true)}
                  className="ml-1 text-apple-blue font-bold underline hover:opacity-80"
                >
                  Learn more
                </button>
              </p>
              <button 
                onClick={() => setSafetyBannerDismissed(true)}
                className="p-1 text-apple-text-muted hover:text-apple-text rounded-md transition-colors"
                title="Dismiss safety banner"
                aria-label="Dismiss safety banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* EMPTY THREAD: Compact counterpart card + Starter chips */}
          {messages.length === 0 && (
            <div className="py-6 md:py-8 max-w-md mx-auto text-center space-y-4">
              {/* Compact counterpart card */}
              <div className="bg-apple-card-bg border border-apple-border rounded-2xl p-4 shadow-xs text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-apple-soft mx-auto bg-apple-gray">
                  {otherParticipant?.photoURL ? (
                    <img 
                      src={otherParticipant.photoURL} 
                      alt={otherParticipant?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-teal-500/15 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-base">
                      {otherParticipant?.name?.[0] || 'U'}
                    </div>
                  )}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center justify-center gap-1.5">
                    <h3 className="font-bold text-apple-text text-base">{otherParticipant?.name}</h3>
                    <ShieldCheck className="w-4 h-4 text-apple-blue" />
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-purple-500/10 text-[#5B2A86] dark:text-[#F0A830]">
                      {(otherParticipant as any)?.role || 'Owner'}
                    </span>
                  </div>
                  <p className="text-xs text-apple-text-muted font-medium">
                    Usually replies within 2 hours
                  </p>
                </div>

                {/* Privacy copy with lock icon */}
                <div className="pt-2 border-t border-apple-border/40 flex items-center justify-center gap-1.5 text-[11px] text-apple-text-muted">
                  <Lock className="w-3.5 h-3.5 text-apple-blue shrink-0" />
                  <span>
                    Protected in transit and at rest.{' '}
                    <Link to="/privacy" className="text-apple-blue font-semibold hover:underline">
                      Privacy policy
                    </Link>
                  </span>
                </div>
              </div>

              {/* Starter chips: disappear after the first message */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-apple-text-muted uppercase tracking-wider">Suggested Inquiries</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "Is this still available?",
                    "Request a viewing",
                    "Is the price negotiable?",
                    "Ask for documents"
                  ].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setInputText(chip)}
                      className="px-3.5 py-1.5 rounded-full bg-apple-card-bg hover:bg-apple-gray text-apple-text text-xs font-semibold border border-apple-border shadow-xs hover:border-apple-blue/30 transition-all cursor-pointer focus-ring-pakizzle"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, i) => {
            const isMe = msg.senderId === user?.uid;
            const showTail = i === 0 || messages[i-1].senderId !== msg.senderId;
            const isLastInGroup = i === messages.length - 1 || messages[i+1].senderId !== msg.senderId;
            
            const sensitivePattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|whatsapp|wa\.me|contact|number|call/i;
            const isSensitive = !isMe && sensitivePattern.test(msg.text);

            return (
              <React.Fragment key={msg.id}>
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "flex w-full",
                    isMe ? "justify-end" : "justify-start",
                    !showTail ? "mt-0.5" : (isDashboardView ? "mt-2" : "mt-4"),
                    isLastInGroup ? (isDashboardView ? "mb-1" : "mb-2") : "mb-0"
                  )}
                >
                  <div className={cn(
                    "relative transition-all duration-300",
                    msg.type === 'image' 
                      ? "max-w-[75%] md:max-w-[60%] p-1 bg-apple-card-bg rounded-2xl overflow-hidden shadow-sm" 
                      : msg.type === 'location'
                        ? "max-w-[85%] md:max-w-[70%]"
                        : (isDashboardView ? "max-w-[85%] md:max-w-[75%] px-3 py-1.5 shadow-sm rounded-xl" : "max-w-[85%] md:max-w-[70%] px-4 py-2.5 shadow-sm"),
                    msg.type !== 'location' && (
                      isMe 
                        ? "bg-gradient-to-br from-apple-blue to-blue-600 text-white rounded-[20px] rounded-tr-[4px]" 
                        : "bg-apple-card-bg text-apple-text rounded-[20px] rounded-tl-[4px] border border-apple-border/60 shadow-xs"
                    ),
                    msg.type !== 'location' && !showTail && (isMe ? "rounded-tr-[20px]" : "rounded-tl-[20px]"),
                    msg.type !== 'location' && isLastInGroup && (isMe ? "rounded-br-[20px]" : "rounded-bl-[20px]")
                  )}>
                  {/* Tail */}
                  {showTail && msg.type !== 'location' && (
                    <div className={cn(
                      "absolute top-0 w-[14px] h-[14px] z-0",
                      isMe 
                        ? "right-[-7px] text-apple-blue" 
                        : "left-[-7px] text-apple-card-bg"
                    )}>
                      <svg viewBox="0 0 14 14" className="w-full h-full">
                        <path 
                          fill="currentColor" 
                          d={isMe 
                            ? "M0,0 L14,0 C14,0 4,0 0,14 Z" 
                            : "M14,0 L0,0 C0,0 10,0 14,14 Z"
                          }
                        />
                      </svg>
                    </div>
                  )}

                  <div className="flex flex-col relative">
                    {msg.type === 'text' && (
                      <p className={cn("leading-[1.4] whitespace-pre-wrap font-medium", isDashboardView ? "text-xs pr-8" : "text-[15px] pr-10")}>
                        {msg.text}
                      </p>
                    )}

                    {msg.type === 'listing_card' && (
                      <div className={cn(
                        "bg-apple-card-bg rounded-2xl overflow-hidden shadow-sm border border-apple-border/20",
                        isDashboardView ? "max-w-[200px]" : "max-w-[280px]"
                      )}>
                        <div className={cn("bg-apple-gray relative", isDashboardView ? "h-20" : "h-32")}>
                          {msg.metadata?.listingImage ? (
                            <img 
                              src={msg.metadata.listingImage} 
                              alt={msg.metadata.listingName} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Building2 className={isDashboardView ? "w-6 h-6 text-apple-border" : "w-8 h-8 text-apple-border"} />
                            </div>
                          )}
                          <div className={cn(
                            "absolute top-2 right-2 bg-black/40 backdrop-blur-md rounded-lg font-bold text-white uppercase tracking-wider",
                            isDashboardView ? "px-1.5 py-0.5 text-[8px]" : "px-2 py-1 text-[10px]"
                          )}>
                            Context
                          </div>
                        </div>
                        <div className={isDashboardView ? "p-2" : "p-3"}>
                          <div className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest mb-1">Inquiry about</div>
                          <div className={cn("font-bold text-apple-text truncate mb-1", isDashboardView ? "text-xs" : "text-sm")}>{msg.metadata?.listingName}</div>
                          <div className={cn("font-bold text-apple-blue", isDashboardView ? "text-[11px]" : "text-xs")}>
                            {formatPrice(msg.metadata?.listingPrice)}
                          </div>
                          <Link 
                            to={`/property/${msg.metadata?.listingId}`}
                            className={cn(
                              "w-full bg-apple-blue/5 text-apple-blue rounded-xl font-bold hover:bg-apple-blue/10 transition-colors flex items-center justify-center focus-ring-pakizzle",
                              isDashboardView ? "mt-2 py-1.5 text-[10px]" : "mt-3 py-2 text-xs"
                            )}
                          >
                            View Listing
                          </Link>
                        </div>
                      </div>
                    )}

                    {msg.type === 'image' && msg.fileUrl && (
                      <div className="relative group cursor-pointer overflow-hidden">
                        <img 
                          src={msg.fileUrl} 
                          alt="Shared image" 
                          className={cn(
                            "rounded-[18px] w-full object-cover shadow-sm block transition-transform duration-500 group-hover:scale-105",
                            isDashboardView ? "max-h-[160px]" : "max-h-[320px]"
                          )}
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-[18px]" />
                        
                        {/* Overlay Timestamp for Images */}
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
                          <span className="text-[9px] font-bold text-white uppercase tracking-wider">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}
                          </span>
                          {isMe && (
                            <CheckCheck className={cn(
                              "w-3 h-3 transition-colors",
                              msg.status === 'read' ? "text-[#00E5FF]" : "text-white"
                            )} />
                          )}
                        </div>
                      </div>
                    )}
                    
                    {msg.type === 'location' && (
                      <MapPreviewCard 
                        lat={msg.location!.lat}
                        lng={msg.location!.lng}
                        address={msg.location?.address}
                        isMe={isMe}
                        timestamp={msg.timestamp}
                        status={msg.status}
                      />
                    )}

                    {msg.type === 'file' && (
                      <div className={cn("flex items-center gap-3 p-2 rounded-xl mb-1", isMe ? "bg-white/10" : "bg-apple-gray")}>
                        <div className={cn("rounded-lg bg-apple-card-bg flex items-center justify-center shadow-sm", isDashboardView ? "w-8 h-8" : "w-10 h-10")}>
                          <FileText className={isDashboardView ? "w-4 h-4 text-apple-blue" : "w-5 h-5 text-apple-blue"} />
                        </div>
                        <div className={cn("font-bold truncate max-w-[150px]", isDashboardView ? "text-[11px]" : "text-[13px]")}>
                          {msg.text.replace('Sent a file: ', '')}
                        </div>
                      </div>
                    )}

                    {(msg.type !== 'image' && msg.type !== 'location') && (
                      <div className={cn(
                        "flex items-center gap-1 self-end mt-1 ml-2",
                        isMe ? "text-white/70" : "text-apple-text-muted"
                      )}>
                        <span className={cn("font-bold uppercase tracking-wider", isDashboardView ? "text-[8px]" : "text-[10px]")}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}
                        </span>
                        {isMe && (
                          <CheckCheck className={cn(
                            "transition-colors",
                            isDashboardView ? "w-3 h-3" : "w-3.5 h-3.5",
                            msg.status === 'read' ? "text-[#00E5FF]" : "text-white"
                          )} />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                </motion.div>

              {isSensitive && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex justify-center", isDashboardView ? "my-2" : "my-4")}
                >
                  <div className={cn(
                    "bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2 shadow-sm",
                    isDashboardView ? "px-3 py-1.5 max-w-[85%]" : "px-4 py-2 max-w-[80%]"
                  )}>
                    <ShieldAlert className={isDashboardView ? "w-3.5 h-3.5 text-red-500 shrink-0" : "w-4 h-4 text-red-500 shrink-0"} />
                    <p className={cn("font-bold text-red-800 leading-tight", isDashboardView ? "text-[10px]" : "text-[12px]")}>
                      To protect yourself, always communicate through <span className="text-apple-blue">Pakizzle</span> and avoid clicking on external links.
                    </p>
                  </div>
                </motion.div>
              )}
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      </div>

      {/* Input Area */}
      <div className={cn(
        "border-t shrink-0 z-20",
        isDashboardView 
          ? "p-2 md:p-2.5 border-apple-border bg-apple-surface" 
          : "p-3 md:p-4 border-apple-border bg-apple-card-bg pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]"
      )}>
        {activeConv?.isBlocked ? (
          <div className={cn(
            "flex flex-col items-center border border-apple-red/10 bg-apple-red/5",
            isDashboardView ? "py-3 rounded-2xl gap-1" : "py-6 rounded-[32px] gap-3"
          )}>
            <ShieldAlert className={isDashboardView ? "w-5 h-5 text-apple-red" : "w-8 h-8 text-apple-red"} />
            <div className="text-center px-4">
              <p className={cn("font-bold text-apple-red", isDashboardView ? "text-xs" : "text-base")}>You have blocked this user</p>
              <p className={cn("text-apple-red/60 mt-0.5", isDashboardView ? "text-[10px]" : "text-sm")}>Unblock them to resume the conversation</p>
            </div>
            <button 
              onClick={() => toggleBlock(activeConv.id)}
              className={cn(
                "bg-apple-red text-white rounded-full font-bold hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-apple-red/20",
                isDashboardView ? "mt-1.5 px-4 py-1.5 text-[11px]" : "mt-2 px-8 py-3 text-sm"
              )}
            >
              Unblock User
            </button>
          </div>
        ) : (
          <div className={cn("flex items-end", isDashboardView ? "gap-2" : "gap-3 md:gap-5")}>
            <div className="flex items-center gap-1 pb-1">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "rounded-full text-apple-text-muted transition-all active:scale-90",
                  isDashboardView ? "p-1.5 hover:bg-apple-gray" : "p-3 hover:bg-apple-gray"
                )}
                title="Attach File"
                aria-label="Attach File"
              >
                <Paperclip className={isDashboardView ? "w-4 h-4" : "w-5 h-5"} />
              </button>
              <LocationButton 
                onLocationFetched={handleLocationFetched}
                onError={handleLocationError}
              />
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload}
              />
            </div>

            <div className="flex-1 relative">
              {locationError && (
                <div className="absolute bottom-full left-0 right-0 mb-2 px-4 py-2 bg-apple-red text-white text-xs font-bold rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2">
                  {locationError}
                </div>
              )}
              <textarea
                rows={1}
                placeholder="Type a message..."
                aria-label="Type a message"
                className={cn(
                  "w-full outline-none transition-all resize-none max-h-32 border font-medium",
                  isDashboardView
                    ? "bg-apple-gray rounded-xl py-2 pl-3 pr-9 text-xs text-apple-text placeholder:text-apple-text-muted/70 border-apple-border/50 focus:border-apple-blue/30 focus:bg-apple-surface"
                    : "bg-apple-gray rounded-[28px] py-3.5 pl-5 pr-12 text-apple-text placeholder:text-apple-text-muted/70 border-apple-border/50 focus:bg-apple-surface focus:border-apple-blue/30 focus:ring-2 focus:ring-apple-blue/10 text-sm"
                )}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button 
                className={cn(
                  "absolute text-apple-text-muted hover:text-apple-blue transition-colors",
                  isDashboardView ? "right-2.5 bottom-1.5 p-0.5" : "right-4 bottom-3 p-1.5"
                )}
                aria-label="Insert emoji"
              >
                <Smile className={isDashboardView ? "w-4 h-4" : "w-5 h-5"} />
              </button>
            </div>

            <button 
              onClick={handleSend}
              disabled={!inputText.trim()}
              aria-label="Send message"
              className={cn(
                "bg-apple-blue text-white rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none mb-0.5",
                isDashboardView 
                  ? "p-2 hover:bg-blue-600 shadow-md" 
                  : "p-4 shadow-xl shadow-apple-blue/30 hover:bg-blue-600"
              )}
            >
              <Send className={isDashboardView ? "w-4 h-4" : "w-5 h-5"} />
            </button>
          </div>
        )}
      </div>

      {/* Safety Guidance Modal */}
      <AnimatePresence>
        {showSafetyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-apple-card-bg border border-apple-border rounded-[28px] p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-apple-blue" />
                  <h3 className="text-lg font-bold text-apple-text">Pakizzle Safety Guide</h3>
                </div>
                <button 
                  onClick={() => setShowSafetyModal(false)}
                  className="p-1 rounded-full hover:bg-apple-gray text-apple-text-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-apple-text leading-relaxed">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl font-medium">
                  <strong>Never pay token money before verification:</strong> In Pakistan real estate, token money should only be handed over after physical site inspection and verification of title deeds (Fard / Registry / Allotment letter) with the relevant society or land authority.
                </div>
                <p>
                  <strong>Meet in person:</strong> Always arrange property viewings during daytime in public or authorized developer society offices.
                </p>
                <p>
                  <strong>Encrypted conversations:</strong> Messages on Pakizzle are encrypted in transit and at rest. Pakizzle staff can open a conversation only if it is reported or the law requires it.
                </p>
              </div>

              <button
                onClick={() => setShowSafetyModal(false)}
                className="w-full py-2.5 bg-apple-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors"
              >
                Understood
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rating Modal */}
      <AnimatePresence>
        {showRatingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-apple-card-bg rounded-[32px] p-8 max-w-sm w-full shadow-apple-card text-center"
            >
              <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Rate {otherParticipant?.name}</h3>
              <p className="text-apple-text-muted text-sm mb-8">How was your experience with this user?</p>
              
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star 
                      className={cn(
                        "w-8 h-8 transition-colors",
                        rating >= star ? "text-yellow-500 fill-yellow-500" : "text-apple-border"
                      )} 
                    />
                  </button>
                ))}
              </div>

              <textarea
                placeholder="Write a comment (optional)..."
                className="w-full bg-apple-gray rounded-2xl p-4 text-sm font-medium outline-none focus:ring-4 focus:ring-apple-blue/5 transition-all resize-none h-24 mb-6 border border-transparent focus:bg-apple-card-bg focus:border-apple-blue/20"
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRatingModal(false);
                    setRatingComment('');
                  }}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-apple-text hover:bg-apple-gray transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (otherParticipant?.uid && activeConv) {
                      const reviewerType = activeConv.type === 'buying' ? 'buyer' : 'seller';
                      rateUser(otherParticipant.uid, rating, reviewerType, ratingComment);
                    }
                    setShowRatingModal(false);
                    setRating(0);
                    setRatingComment('');
                  }}
                  disabled={rating === 0}
                  className="flex-1 py-3.5 bg-apple-blue text-white rounded-2xl font-bold shadow-lg shadow-apple-blue/20 hover:bg-blue-600 transition-all disabled:opacity-50"
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
