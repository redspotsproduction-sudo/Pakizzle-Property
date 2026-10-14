import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Message, Conversation } from '../types';
import { useAuth } from './AuthContext';
import { useProperties } from './PropertyContext';
import { db, handleFirestoreError, OperationType, isFirestoreQuotaExceeded } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  setDoc,
  doc, 
  orderBy, 
  serverTimestamp,
  getDocs,
  increment
} from 'firebase/firestore';
import { notificationService } from '../services/notificationService';
import { toast } from 'sonner';

interface ChatContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (text: string, type?: Message['type'], extra?: any, conversationId?: string) => Promise<void>;
  togglePin: (id: string) => void;
  toggleBlock: (id: string) => void;
  rateUser: (userId: string, rating: number, type: 'buyer' | 'seller') => Promise<void>;
  markAsRead: (id: string) => void;
  startConversation: (participant: { uid: string, name: string, photoURL?: string }, listing: { id: string, name: string, price?: number, image?: string }, initialMessage?: string) => void;
  notification: string | null;
  setNotification: (msg: string | null) => void;
  messages: Message[];
  loading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { properties: vehicles } = useProperties();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const conversationsRef = useRef<Conversation[]>([]);
  
  // Sync ref with state
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [notification, setNotificationState] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(true);
  const prevUnreadRef = useRef<Record<string, number>>({});
  const isFirstLoadRef = useRef(true);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setNotification = useCallback((msg: string | null) => {
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    setNotificationState(msg);
    if (msg) {
      notificationTimeoutRef.current = setTimeout(() => {
        setNotificationState(null);
      }, 3000);
    }
  }, []);

  // Detect new messages for notifications
  useEffect(() => {
    if (!user || conversations.length === 0) return;
    
    if (isFirstLoadRef.current) {
      conversations.forEach(conv => {
        prevUnreadRef.current[conv.id] = conv.unreadCount;
      });
      isFirstLoadRef.current = false;
      return;
    }

    conversations.forEach(conv => {
      const prevUnread = prevUnreadRef.current[conv.id] || 0;
      // If unread count increased and it's not the active conversation
      if (conv.unreadCount > prevUnread && conv.id !== activeConversationId) {
        const otherParticipant = conv.participants.find(p => p.uid !== user.uid);
        if (otherParticipant) {
          if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
          setNotification(`New message from ${otherParticipant.name}`);
        }
      }
      prevUnreadRef.current[conv.id] = conv.unreadCount;
    });

    return () => {
      if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    };
  }, [conversations, activeConversationId, user]);

  // Sync conversations
  useEffect(() => {
    if (!user) {
      setConversations([]);
      return;
    }

    const q = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => {
        const data = doc.data({ serverTimestamps: 'estimate' });
        const metadata = data.metadata?.[user.uid] || {};
        
        // Determine if user is seller for this property listing
        const propId = data.propertyId || data.vehicleId;
        const isSeller = data.sellerUid === user.uid || vehicles.find(v => v.id === propId)?.seller.uid === user.uid;
        
        // Map Firestore data to Conversation type
        return {
          id: doc.id,
          participants: data.participants || [],
          lastMessage: data.lastMessage ? {
            ...data.lastMessage,
            timestamp: data.lastMessage.timestamp?.toDate?.()?.toISOString() || data.lastMessage.timestamp
          } : undefined,
          unreadCount: metadata.unreadCount || 0,
          isPinned: metadata.isPinned || false,
          isBlocked: metadata.isBlocked || false,
          type: isSeller ? 'selling' : 'buying',
          propertyId: propId,
          propertyName: data.propertyName || data.listingTitle || data.vehicleName,
          listingTitle: data.listingTitle || data.propertyName || data.vehicleName,
          listingImage: data.listingImage || data.vehicleImage,
          listingPrice: data.listingPrice || data.price,
          vehicleId: propId,
          vehicleName: data.propertyName || data.listingTitle || data.vehicleName,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString()
        } as any;
      });

      // Sort in memory to avoid composite index requirement
      convs.sort((a, b) => {
        const timeA = new Date(a.updatedAt || 0).getTime();
        const timeB = new Date(b.updatedAt || 0).getTime();
        return timeB - timeA;
      });

      setConversations(convs);
      setLoading(false);
    }, (error) => {
      console.error('Error in conversations listener:', error);
      setLoading(false);
      handleFirestoreError(error, OperationType.LIST, 'conversations');
    });

    return () => unsubscribe();
  }, [user, vehicles]);

  // Sync messages for active conversation
  useEffect(() => {
    if (!activeConversationId || !user) return;

    const q = query(
      collection(db, 'conversations', activeConversationId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data({ serverTimestamps: 'estimate' });
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.()?.toISOString() || data.timestamp || new Date().toISOString()
        } as Message;
      });
      setMessages(prev => ({ ...prev, [activeConversationId]: msgs }));
    }, (error) => {
      console.error('Error in messages listener:', error);
      // Don't throw here to avoid crashing the app, just log
    });

    return () => unsubscribe();
  }, [activeConversationId, user]);

  const sendMessage = useCallback(async (text: string, type: Message['type'] = 'text', extra?: any, conversationId?: string) => {
    const targetId = conversationId || activeConversationId;
    if (!targetId || !user) {
      console.warn('Cannot send message: No target conversation or user');
      return;
    }

    try {
      const conv = conversations.find(c => c.id === targetId);
      if (!conv) {
        console.warn('Cannot send message: Conversation not found in local state', targetId);
        return;
      }

      const otherParticipantId = conv.participants.find(p => p.uid !== user.uid)?.uid;

      const messageData = {
        senderId: user.uid,
        text,
        timestamp: serverTimestamp(),
        type,
        status: 'sent',
        ...extra
      };

      const msgRef = await addDoc(collection(db, 'conversations', targetId, 'messages'), messageData);
      
      const updateData: any = {
        lastMessage: { 
          ...messageData, 
          id: msgRef.id, 
          timestamp: serverTimestamp() 
        },
        updatedAt: serverTimestamp()
      };

      if (otherParticipantId) {
        updateData[`metadata.${otherParticipantId}.unreadCount`] = increment(1);
        
        // Send a separate notification alert
        await notificationService.sendNotification({
          userId: otherParticipantId,
          title: `New Message from ${user.displayName || 'User'}`,
          message: text.length > 60 ? text.substring(0, 60) + '...' : text,
          type: 'message',
          link: `/chat?id=${targetId}`,
          metadata: {
            conversationId: targetId,
            senderId: user.uid
          }
        });
      }

      await updateDoc(doc(db, 'conversations', targetId), updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `conversations/${targetId}/messages`);
    }
  }, [activeConversationId, user, conversations]);

  const togglePin = useCallback(async (id: string) => {
    if (!user) return;
    try {
      const conv = conversations.find(c => c.id === id);
      if (!conv) return;
      await updateDoc(doc(db, 'conversations', id), {
        [`metadata.${user.uid}.isPinned`]: !conv.isPinned
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `conversations/${id}`);
    }
  }, [user, conversations]);

  const toggleBlock = useCallback(async (id: string) => {
    if (!user) return;
    try {
      const conv = conversations.find(c => c.id === id);
      if (!conv) return;
      const nextBlocked = !conv.isBlocked;
      await updateDoc(doc(db, 'conversations', id), {
        [`metadata.${user.uid}.isBlocked`]: nextBlocked
      });
      toast(nextBlocked ? "User blocked" : "User unblocked", {
        action: {
          label: "Undo",
          onClick: async () => {
            try {
              await updateDoc(doc(db, 'conversations', id), {
                [`metadata.${user.uid}.isBlocked`]: !nextBlocked
              });
              toast.success("Action undone");
            } catch (err) {
              console.error("Undo failed:", err);
            }
          }
        }
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `conversations/${id}`);
    }
  }, [user, conversations]);

  const rateUser = useCallback(async (userId: string, rating: number, type: 'buyer' | 'seller', comment: string = "Great experience!", tags: string[] = ["Polite", "Fast Replies"]) => {
    if (!user) return;
    try {
      // Create a review document
      await addDoc(collection(db, 'reviews'), {
        targetUserId: userId,
        reviewerId: user.uid,
        reviewerName: user.displayName || 'Anonymous',
        reviewerPhoto: user.photoURL || '',
        rating,
        comment,
        tags,
        type,
        createdAt: new Date().toISOString()
      });

      // Update the user's aggregate rating
      await updateDoc(doc(db, 'users', userId), {
        rating: increment(rating),
        ratingCount: increment(1)
      });

      setNotification("Rating submitted successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reviews');
    }
  }, [user]);

  const markAsRead = useCallback(async (id: string) => {
    if (!user || isFirestoreQuotaExceeded()) return;
    
    const conv = conversationsRef.current.find(c => c.id === id);
    if (!conv || conv.unreadCount === 0) return;

    // Use a small cooldown to prevent infinite retry loops on failure
    const now = Date.now();
    const lastAttempt = (window as any)._lastReadAttempt || 0;
    // Increase cooldown if failure might be happening
    if (now - lastAttempt < 2000) return;
    (window as any)._lastReadAttempt = now;

    try {
      await updateDoc(doc(db, 'conversations', id), {
        [`metadata.${user.uid}.unreadCount`]: 0
      });
    } catch (error: any) {
      console.error('Error marking as read:', error.message);
      // Silently fail if quota exceeded to prevent UI loops
    }
  }, [user]);

  const startConversation = useCallback(async (participant: { uid: string, name: string, photoURL?: string }, listing: { id: string, name: string, price?: number, image?: string }, initialMessage?: string) => {
    if (!user) return;

    try {
      // 1. Check if conversation already exists between these two users
      const q = query(
        collection(db, 'conversations'),
        where('participantIds', 'array-contains', user.uid)
      );
      
      const snapshot = await getDocs(q);
      const existingDoc = snapshot.docs.find(doc => {
        const data = doc.data();
        return data.participantIds.includes(participant.uid);
      });

      let convId: string;

      if (existingDoc) {
        convId = existingDoc.id;
        const data = existingDoc.data();
        
        // Update context if listing changed, but don't send message automatically
        if ((data.propertyId || data.vehicleId) !== listing.id) {
          await updateDoc(doc(db, 'conversations', convId), {
            propertyId: listing.id,
            propertyName: listing.name,
            listingTitle: listing.name,
            listingPrice: listing.price || null,
            listingImage: listing.image || null,
            vehicleId: listing.id,
            vehicleName: listing.name,
            updatedAt: serverTimestamp()
          });
        }
        setActiveConversationId(convId);
      } else {
        // Create new conversation
        const convRef = doc(collection(db, 'conversations'));
        convId = convRef.id;
        
        const newConvData = {
          id: convId,
          participantIds: [user.uid, participant.uid],
          participants: [
            { uid: user.uid, name: user.displayName || 'User', photoURL: user.photoURL || '' },
            { uid: participant.uid, name: participant.name, photoURL: participant.photoURL || '' }
          ],
          updatedAt: serverTimestamp(),
          propertyId: listing.id,
          propertyName: listing.name,
          listingTitle: listing.name,
          listingPrice: listing.price || null,
          listingImage: listing.image || null,
          vehicleId: listing.id,
          vehicleName: listing.name,
          sellerUid: participant.uid, // The person being contacted is the seller
          metadata: {
            [user.uid]: { unreadCount: 0, isPinned: false, isBlocked: false },
            [participant.uid]: { unreadCount: 0, isPinned: false, isBlocked: false }
          }
        };

        await setDoc(convRef, newConvData);
        setActiveConversationId(convId);
      }

      // Only send message if explicitly provided
      if (initialMessage) {
        const messageData = {
          senderId: user.uid,
          text: initialMessage,
          timestamp: serverTimestamp(),
          type: 'text' as const,
          status: 'sent' as const
        };

        const msgRef = await addDoc(collection(db, 'conversations', convId, 'messages'), messageData);
        
        await updateDoc(doc(db, 'conversations', convId), {
          lastMessage: { 
            ...messageData, 
            id: msgRef.id, 
            timestamp: serverTimestamp() 
          },
          updatedAt: serverTimestamp(),
          [`metadata.${participant.uid}.unreadCount`]: increment(1)
        });

        // Send a notification alert for the first message
        await notificationService.sendNotification({
          userId: participant.uid,
          title: `${user.displayName || 'User'} is interested in: ${listing.name}`,
          message: initialMessage.length > 60 ? initialMessage.substring(0, 60) + '...' : initialMessage,
          type: 'listing',
          link: `/chat?id=${convId}`,
          metadata: {
            conversationId: convId,
            propertyId: listing.id,
            vehicleId: listing.id
          }
        });

        setNotification(`Message sent to ${participant.name}`);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      handleFirestoreError(error, OperationType.CREATE, 'conversations');
    }
  }, [user]);

  const value = useMemo(() => ({
    conversations,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    togglePin,
    toggleBlock,
    markAsRead,
    startConversation,
    notification,
    setNotification,
    rateUser,
    loading,
    messages: activeConversationId ? messages[activeConversationId] || [] : []
  }), [conversations, activeConversationId, sendMessage, togglePin, toggleBlock, rateUser, markAsRead, startConversation, notification, messages, loading]);

  return (
    <ChatContext.Provider value={value as any}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
