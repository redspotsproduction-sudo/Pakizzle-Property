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
  Car
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useProperties } from '../../context/PropertyContext';
import { cn } from '../../lib/utils';
import { db } from '../../firebase';
import Badge from '../Badge';
import { doc, onSnapshot } from 'firebase/firestore';
import LocationPermissionModal from './LocationPermissionModal';
import LocationButton from './LocationButton';
import MapPreviewCard from './MapPreviewCard';

interface ChatWindowProps {
  isDashboardView?: boolean;
}

export default function ChatWindow({ isDashboardView = false }: ChatWindowProps) {
  const { activeConversationId, conversations, messages, sendMessage, setActiveConversationId, markAsRead, toggleBlock, togglePin, rateUser, loading } = useChat();
  const { user } = useAuth();
  const { properties: vehicles } = useProperties();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
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
        isDashboardView ? "bg-white dark:bg-[#161617]" : "bg-apple-gray/30"
      )}>
        <div className={cn(
          "flex items-center justify-center mb-8",
          isDashboardView 
            ? "w-20 h-20 bg-[#F5F5F7] dark:bg-white/5 rounded-2xl border border-black/[0.04] dark:border-white/[0.04]"
            : "w-24 h-24 bg-apple-card-bg rounded-[32px] shadow-apple-soft"
        )}>
          <Zap className="w-10 h-10 text-apple-blue/20" />
        </div>
        <h2 className={cn(
          "font-bold tracking-tight mb-3",
          isDashboardView ? "text-lg text-[#1D1D1F] dark:text-white" : "text-2xl"
        )}>Your Messages</h2>
        <p className={cn(
          "max-w-sm leading-relaxed",
          isDashboardView ? "text-xs text-[#86868B] font-medium" : "text-apple-text-muted"
        )}>
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
          isDashboardView ? "bg-white dark:bg-[#161617]" : "bg-apple-gray/30"
        )}>
          <Loader2 className="w-10 h-10 text-apple-blue animate-spin mb-4" />
          <p className="text-apple-text-muted font-bold">Loading conversation...</p>
        </div>
      );
    }
    return (
      <div className={cn(
        "flex-1 flex flex-col items-center justify-center p-12 text-center",
        isDashboardView ? "bg-white dark:bg-[#161617]" : "bg-apple-gray/30"
      )}>
        <div className={cn(
          "flex items-center justify-center mb-8",
          isDashboardView 
            ? "w-20 h-20 bg-[#F5F5F7] dark:bg-white/5 rounded-2xl border border-black/[0.04] dark:border-white/[0.04]"
            : "w-24 h-24 bg-apple-card-bg rounded-[32px] shadow-apple-soft"
        )}>
          <Ban className="w-10 h-10 text-apple-red/20" />
        </div>
        <h2 className={cn(
          "font-bold tracking-tight mb-3",
          isDashboardView ? "text-lg text-[#1D1D1F] dark:text-white" : "text-2xl"
        )}>Conversation Not Found</h2>
        <p className={cn(
          "max-w-sm leading-relaxed",
          isDashboardView ? "text-xs text-[#86868B] font-medium" : "text-apple-text-muted"
        )}>
          This conversation may have been deleted or you don't have permission to view it.
        </p>
        <button 
          onClick={() => setActiveConversationId(null)}
          className="mt-8 text-apple-blue font-bold hover:underline"
        >
          Back to Messages
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 flex flex-col h-full relative", isDashboardView ? "bg-white dark:bg-[#161617]" : "bg-apple-bg")}>
      {/* Header */}
      <div className={cn(
        "border-b flex items-center justify-between z-40 shrink-0",
        isDashboardView 
          ? "px-3 py-1.5 h-[52px] md:h-[56px] border-black/[0.04] dark:border-white/[0.04] bg-white dark:bg-[#161617]" 
          : "p-3 md:p-4 h-[64px] md:h-[80px] border-apple-border bg-apple-card-bg backdrop-blur-xl shadow-sm"
      )}>
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
          <button 
            onClick={() => setActiveConversationId(null)}
            className="md:hidden p-2 -ml-1 hover:bg-apple-gray rounded-full transition-all active:scale-95"
          >
            <ChevronLeft className="w-6 h-6 text-apple-text" />
          </button>
          {!isDashboardView && (
            <button 
              onClick={() => navigate('/marketplace')}
              className="hidden md:flex p-2.5 -ml-2 hover:bg-apple-gray rounded-full transition-all text-apple-text-muted hover:text-apple-text active:scale-95"
              title="Back to Marketplace"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <Link to={`/profile/${otherParticipant?.uid}`} className={cn("flex items-center group min-w-0 flex-1", isDashboardView ? "gap-2" : "gap-3 md:gap-4")}>
            <div className="relative shrink-0">
              <div className={cn(
                "rounded-2xl overflow-hidden shadow-apple-soft group-hover:scale-105 transition-transform duration-500 ring-2 ring-apple-card-bg",
                isDashboardView ? "w-8 h-8 md:w-9 md:h-9" : "w-10 h-10 md:w-12 md:h-12"
              )}>
                {otherParticipant?.photoURL ? (
                  <img 
                    src={otherParticipant.photoURL} 
                    alt={otherParticipant?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-teal-500/15 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-xs md:text-sm">
                    {otherParticipant?.name?.[0] || 'U'}
                  </div>
                )}
              </div>
              {otherUserStatus?.isOnline && (
                <div className={cn(
                  "absolute bg-apple-green border-2 border-apple-card-bg rounded-full shadow-sm",
                  isDashboardView ? "-bottom-0.5 -right-0.5 w-2.5 h-2.5" : "-bottom-1 -right-1 w-3.5 h-3.5"
                )} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className={cn(
                  "font-bold text-apple-text leading-tight group-hover:text-apple-blue transition-colors truncate flex items-center gap-1",
                  isDashboardView ? "text-xs max-w-[110px] md:max-w-[180px]" : "text-base max-w-[120px] md:max-w-[200px]"
                )}>
                  {(otherParticipant as any)?.badgeType === 'basic' && (
                    <Badge type="basic" size="sm" />
                  )}
                  <span>{otherParticipant?.name}</span>
                  {(otherParticipant as any)?.badgeType && (otherParticipant as any).badgeType !== 'basic' && (
                    <Badge type={(otherParticipant as any).badgeType} size="sm" />
                  )}
                </h3>
                {activeConv?.isBlocked && (
                  <span className={cn(
                    "inline-flex items-center gap-0.5 bg-apple-red/10 text-apple-red rounded-md font-bold uppercase tracking-wider",
                    isDashboardView ? "px-1 py-0.5 text-[8px]" : "px-2 py-0.5 text-[10px]"
                  )}>
                    <ShieldAlert className={isDashboardView ? "w-2.5 h-2.5" : "w-3.5 h-3.5"} />
                    Blocked
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <div className={cn(
                  "rounded-full",
                  isDashboardView ? "w-1 h-1" : "w-1.5 h-1.5",
                  otherUserStatus?.isOnline ? "bg-apple-green animate-pulse" : "bg-apple-text-muted/30"
                )} />
                <span className={cn("font-bold text-apple-text-muted uppercase tracking-widest", isDashboardView ? "text-[8px]" : "text-[10px]")}>
                  {otherUserStatus?.isOnline ? 'Active Now' : `Last Seen: ${otherUserStatus?.lastSeen ? new Date(otherUserStatus.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : 'Recently'}`}
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className={cn("flex items-center", isDashboardView ? "gap-1 md:gap-1.5" : "gap-2 md:gap-4")}>
          <button 
            onClick={() => setShowRatingModal(true)}
            className={cn("hover:bg-apple-gray rounded-full text-apple-orange transition-colors", isDashboardView ? "p-1.5" : "p-2.5")}
            title="Rate User"
          >
            <Star className={isDashboardView ? "w-4 h-4" : "w-5 h-5"} />
          </button>
          <button 
            onClick={() => window.location.href = `tel:${otherParticipant?.uid}`}
            className={cn("hover:bg-apple-gray rounded-full text-apple-text-muted transition-colors", isDashboardView ? "p-1.5" : "p-2.5")}
          >
            <Phone className={isDashboardView ? "w-4 h-4" : "w-5 h-5"} />
          </button>
        </div>
      </div>

      {/* Sticky Listing Card */}
      {activeConv?.vehicleId && (
        <div className={cn(
          "z-30 border-b flex items-center shrink-0",
          isDashboardView 
            ? "px-2.5 py-1.5 gap-2 border-black/[0.04] dark:border-white/[0.04] bg-white dark:bg-[#161617]" 
            : "px-3 py-2 md:px-4 md:py-3 gap-3 border-apple-border bg-apple-card-bg backdrop-blur-md shadow-sm"
        )}>
          {(() => {
            const vehicle = vehicles.find(v => v.id === activeConv.vehicleId);
            return (
              <>
                <div className={cn(
                  "rounded-xl overflow-hidden shrink-0 shadow-sm border",
                  isDashboardView 
                    ? "w-9 h-9 border-black/[0.04] dark:border-white/[0.04]" 
                    : "w-12 h-12 md:w-16 md:h-16 border-apple-border/50"
                )}>
                  {vehicle?.images?.[0] ? (
                    <img 
                      src={vehicle.images[0]} 
                      alt={vehicle.make} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-apple-gray flex items-center justify-center">
                      <Car className={isDashboardView ? "w-4 h-4 text-apple-border" : "w-6 h-6 text-apple-border"} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "font-bold text-apple-text truncate leading-snug",
                    isDashboardView ? "text-xs" : "text-[13px] md:text-sm"
                  )}>
                    {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : activeConv.vehicleName}
                  </h4>
                  <div className={cn(
                    "font-extrabold text-apple-text mt-0.5",
                    isDashboardView ? "text-xs" : "text-[14px] md:text-[16px]"
                  )}>
                    {vehicle ? `AED ${vehicle.price.toLocaleString()}` : 'Price on request'}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={cn(
                      "text-apple-text-muted font-medium truncate",
                      isDashboardView ? "text-[9px]" : "text-[10px] md:text-[11px]"
                    )}>
                      {vehicle?.location || 'Location unavailable'} • {vehicle?.createdAt ? new Date(vehicle.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Date unavailable'}
                    </span>
                  </div>
                </div>
                <Link 
                  to={`/vehicle/${activeConv.vehicleId}`}
                  className={cn(
                    "bg-apple-blue text-white rounded-full font-bold hover:bg-blue-600 transition-colors shadow-sm shadow-apple-blue/20",
                    isDashboardView ? "px-2.5 py-1 text-[10px]" : "px-4 py-1.5 text-[11px] md:text-xs"
                  )}
                >
                  View
                </Link>
              </>
            );
          })()}
        </div>
      )}

      {/* Messages */}
      <div className={cn("flex-1 overflow-y-auto relative", isDashboardView ? "bg-white dark:bg-[#161617]" : "bg-apple-bg")}>
        {/* Background Pattern Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{ 
            backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
            backgroundSize: '600px',
          }}
        />

        <div className={cn("relative z-10 space-y-0.5", isDashboardView ? "p-2 md:p-3" : "p-3 md:p-4")}>
          {/* Chat Title Header */}
          <div className={cn("flex flex-col items-center justify-center text-center", isDashboardView ? "py-4 md:py-6" : "py-8 md:py-12")}>
            <div className={cn(
              "overflow-hidden",
              isDashboardView 
                ? "w-12 h-12 rounded-xl ring-2 ring-black/[0.04] dark:ring-white/[0.04] mb-2" 
                : "w-20 h-20 md:w-24 md:h-24 rounded-[32px] shadow-apple-soft ring-4 ring-apple-card-bg mb-4"
            )}>
              {otherParticipant?.photoURL ? (
                <img 
                  src={otherParticipant.photoURL} 
                  alt={otherParticipant?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-teal-500/15 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-lg md:text-2xl">
                  {otherParticipant?.name?.[0] || 'U'}
                </div>
              )}
            </div>
            <h2 className={cn("font-bold text-apple-text", isDashboardView ? "text-sm mb-0.5" : "text-xl md:text-2xl mb-1")}>{otherParticipant?.name}</h2>
            <div className={cn("flex items-center gap-1 font-bold text-apple-text-muted uppercase tracking-widest", isDashboardView ? "text-[8px]" : "text-[11px]")}>
              <ShieldCheck className={isDashboardView ? "w-2.5 h-2.5" : "w-3.5 h-3.5"} />
              End-to-end encrypted
            </div>
          </div>

          {/* Safety Alert - Hidden in Dashboard to save 50% space */}
          {!isDashboardView && (
            <div className="bg-apple-card-bg border border-apple-border/50 rounded-xl p-3 flex items-start gap-2 shadow-apple-soft mb-3 max-w-sm mx-auto text-center">
              <div className="space-y-0.5 w-full">
                <p className="text-[11px] font-semibold text-apple-text leading-relaxed">
                  <ShieldCheck className="w-3 h-3 inline-block mr-1 text-apple-blue" />
                  Messages are end-to-end encrypted. No one outside of this chat, not even Pakizzle, can read or listen to them.
                </p>
              </div>
            </div>
          )}

          <div className={cn(
            "border rounded-xl p-2.5 flex items-start gap-2 max-w-xs mx-auto text-center",
            isDashboardView 
              ? "border-black/[0.04] bg-white dark:bg-white/5 dark:border-white/[0.04] mb-2 shadow-none" 
              : "bg-apple-card-bg border-apple-border/50 shadow-apple-soft mb-4 max-w-sm"
          )}>
            <div className="space-y-0.5 w-full">
              <h4 className={cn("font-bold text-apple-text", isDashboardView ? "text-[10px]" : "text-[12px]")}>Stay safe on Pakizzle!</h4>
              <p className={cn("font-semibold text-apple-text leading-relaxed", isDashboardView ? "text-[9px]" : "text-[11px]")}>
                Don’t open suspicious links or share your details.
              </p>
            </div>
          </div>

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
                        : (isDashboardView 
                            ? "bg-[#F5F5F7] dark:bg-white/5 text-apple-text rounded-[14px] rounded-tl-[4px] border border-black/[0.04] dark:border-white/[0.04]" 
                            : "bg-apple-card-bg text-apple-text rounded-[20px] rounded-tl-[4px] border border-apple-border/30")
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
                        : (isDashboardView ? "left-[-7px] text-[#F5F5F7] dark:text-[#2c2c2e]" : "left-[-7px] text-apple-card-bg")
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
                              <Car className={isDashboardView ? "w-6 h-6 text-apple-border" : "w-8 h-8 text-apple-border"} />
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
                            {msg.metadata?.listingPrice ? `AED ${msg.metadata.listingPrice.toLocaleString()}` : 'Price on request'}
                          </div>
                          <Link 
                            to={`/vehicle/${msg.metadata?.listingId}`}
                            className={cn(
                              "w-full bg-apple-blue/5 text-apple-blue rounded-xl font-bold hover:bg-apple-blue/10 transition-colors flex items-center justify-center",
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
        "border-t",
        isDashboardView 
          ? "p-2 md:p-2.5 border-black/[0.04] dark:border-white/[0.04] bg-white dark:bg-[#161617]" 
          : "p-4 border-apple-border bg-apple-card-bg md:p-6"
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
                  isDashboardView ? "p-1.5 hover:bg-black/[0.04] dark:hover:bg-white/5" : "p-3 hover:bg-apple-gray"
                )}
                title="Attach File"
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
                className={cn(
                  "w-full outline-none transition-all resize-none max-h-32 border",
                  isDashboardView
                    ? "bg-[#F5F5F7] dark:bg-white/5 rounded-xl py-1.5 pl-3 pr-9 text-xs text-[#1D1D1F] dark:text-white placeholder-[#86868B]/70 border-transparent focus:border-apple-blue/20 focus:bg-white dark:focus:bg-[#1C1C1E] font-semibold"
                    : "bg-apple-gray rounded-[28px] py-4 pl-6 pr-14 text-apple-text border-transparent focus:bg-apple-card-bg focus:border-apple-blue/20 focus:ring-4 focus:ring-apple-blue/5 text-sm font-medium"
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
              <button className={cn(
                "absolute text-apple-text-muted hover:text-apple-blue transition-colors",
                isDashboardView ? "right-2.5 bottom-1.5 p-0.5" : "right-4 bottom-3 p-1.5"
              )}>
                <Smile className={isDashboardView ? "w-4 h-4" : "w-5 h-5"} />
              </button>
            </div>

            <button 
              onClick={handleSend}
              disabled={!inputText.trim()}
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
