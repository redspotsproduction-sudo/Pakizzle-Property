import { 
  collection, 
  doc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  increment, 
  query, 
  orderBy, 
  onSnapshot, 
  getDocs, 
  getDoc,
  where 
} from 'firebase/firestore';
import { db, auth } from '../firebase';

export interface Reel {
  id: string;
  videoUrl: string;
  caption: string;
  listingId: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  createdAt: any;
  make?: string;
  model?: string;
  price?: number;
  year?: number;
  coverImage?: string;
}

export interface ReelComment {
  id: string;
  reelId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: any;
}

export interface AIReelCaptionResponse {
  hook: string;
  caption: string;
  hashtags: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const reelsService = {
  // Subscribe to all reels in real-time
  subscribeToReels(callback: (reels: Reel[]) => void) {
    const q = query(collection(db, 'reels'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const reelsList: Reel[] = [];
      snapshot.forEach((doc) => {
        reelsList.push({ id: doc.id, ...doc.data() } as Reel);
      });
      callback(reelsList);
    }, (error) => {
      console.error("Firestore onSnapshot reels failure:", error);
      handleFirestoreError(error, OperationType.GET, 'reels');
    });
  },

  // Add a new video showcasing reel
  async createReel(reelData: Omit<Reel, 'id' | 'likesCount' | 'commentsCount' | 'viewsCount' | 'createdAt'>) {
    const colRef = collection(db, 'reels');
    const newDocRef = doc(colRef);
    const id = newDocRef.id;

    // Fetch listing info so we cache vital display parameters in the reel itself
    let make = '';
    let model = '';
    let price = 0;
    let year = 2024;
    try {
      const vehicleDoc = await getDoc(doc(db, 'vehicles', reelData.listingId));
      if (vehicleDoc.exists()) {
        const vData = vehicleDoc.data();
        make = vData.make || '';
        model = vData.model || '';
        price = vData.price || 0;
        year = vData.year || 2024;
      }
    } catch (e) {
      console.warn("Could not cache listing info for reel link:", e);
    }

    const completeReel: Reel = {
      ...reelData,
      id,
      likesCount: 0,
      commentsCount: 0,
      viewsCount: 0,
      make,
      model,
      price,
      year,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(newDocRef, completeReel);
      return completeReel;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `reels/${id}`);
    }
  },

  // Handle high-velocity immersive double-tap like status
  async toggleLikeReel(reelId: string, userId: string, userName: string): Promise<boolean> {
    const likeDocId = `${userId}_${reelId}`;
    const likeDocRef = doc(db, 'reels_likes', likeDocId);
    const reelDocRef = doc(db, 'reels', reelId);

    try {
      const snapshot = await getDoc(likeDocRef);
      const isLiked = snapshot.exists();

      if (isLiked) {
        // Unlike
        await deleteDoc(likeDocRef);
        await updateDoc(reelDocRef, {
          likesCount: increment(-1)
        });
        return false;
      } else {
        // Like
        await setDoc(likeDocRef, {
          reelId,
          userId,
          userName,
          createdAt: new Date().toISOString()
        });
        await updateDoc(reelDocRef, {
          likesCount: increment(1)
        });
        return true;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `reels/${reelId}/like`);
    }
  },

  // Check if current user likes a specific reel
  async checkIsLiked(reelId: string, userId: string): Promise<boolean> {
    if (!userId) return false;
    const likeDocId = `${userId}_${reelId}`;
    try {
      const snap = await getDoc(doc(db, 'reels_likes', likeDocId));
      return snap.exists();
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `reels_likes/${likeDocId}`);
    }
  },

  // Toggle saving/bookmarking a reel for collectors
  async toggleSaveReel(reelId: string, userId: string): Promise<boolean> {
    const saveDocId = `${userId}_${reelId}`;
    const saveDocRef = doc(db, 'reels_saves', saveDocId);
    
    try {
      const snapshot = await getDoc(saveDocRef);
      if (snapshot.exists()) {
        await deleteDoc(saveDocRef);
        return false;
      } else {
        await setDoc(saveDocRef, {
          reelId,
          userId,
          createdAt: new Date().toISOString()
        });
        return true;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `reels_saves/${saveDocId}`);
    }
  },

  // Check if current user has saved this reel
  async checkIsSaved(reelId: string, userId: string): Promise<boolean> {
    if (!userId) return false;
    const saveDocId = `${userId}_${reelId}`;
    try {
      const snap = await getDoc(doc(db, 'reels_saves', saveDocId));
      return snap.exists();
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `reels_saves/${saveDocId}`);
    }
  },

  // Dispatch interactive bid/offer directly from the viewer card
  async submitReelOffer(reelId: string, userId: string, userName: string, priceOffer: number, notes: string): Promise<any> {
    const offerRef = doc(collection(db, 'reels_offers'));
    const offer = {
      id: offerRef.id,
      reelId,
      userId,
      userName,
      priceOffer,
      notes,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(offerRef, offer);
      return offer;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `reels_offers/${offerRef.id}`);
    }
  },

  // Increment view counts on scroll focus
  async incrementViewCount(reelId: string) {
    try {
      const reelRef = doc(db, 'reels', reelId);
      await updateDoc(reelRef, {
        viewsCount: increment(1)
      });
    } catch (e) {
      console.error("View increment error:", e);
    }
  },

  // Grab comments for a reel in real-time
  subscribeToComments(reelId: string, callback: (comments: ReelComment[]) => void) {
    const commentsRef = collection(db, 'reels_comments');
    const q = query(
      commentsRef, 
      where('reelId', '==', reelId), 
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const list: ReelComment[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as ReelComment);
      });
      callback(list);
    }, (error) => {
      console.error("Error subscribing to comments:", error);
      handleFirestoreError(error, OperationType.GET, `reels_comments/${reelId}`);
    });
  },

  // Write a high-end luxury viewer comment
  async addComment(reelId: string, text: string, userId: string, userName: string, userAvatar?: string): Promise<ReelComment> {
    const commentRef = doc(collection(db, 'reels_comments'));
    const comment: ReelComment = {
      id: commentRef.id,
      reelId,
      userId,
      userName,
      userAvatar: userAvatar || '',
      text,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(commentRef, comment);
      
      // Increment comments numerical count in parent Reel
      await updateDoc(doc(db, 'reels', reelId), {
        commentsCount: increment(1)
      });

      return comment;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `reels_comments/${commentRef.id}`);
    }
  },

  // Delete an existing reel
  async deleteReel(reelId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'reels', reelId));
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `reels/${reelId}`);
    }
  },

  // Update specific reel details
  async updateReel(reelId: string, data: Partial<Reel>): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'reels', reelId), data);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reels/${reelId}`);
    }
  },

  // Call proxy to generate Gemini AI script
  async generateAICaption(vehicleDetails: any): Promise<AIReelCaptionResponse> {
    try {
      const response = await fetch('/api/generate-reel-caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vehicleDetails)
      });

      if (!response.ok) {
        throw new Error("Caption generation API failed");
      }

      return await response.json();
    } catch (error) {
      console.error("AI Caption service offline:", error);
      return {
        hook: `Introducing the ultimate ${vehicleDetails.year || '2024'} ${vehicleDetails.make || 'Toyota'} ${vehicleDetails.model || 'model'}!`,
        caption: `🔥 Feast your eyes on this immaculate ${vehicleDetails.year} ${vehicleDetails.make} ${vehicleDetails.model}. Perfect condition, premium specs, and fully verified for performance. Must see! Send an instant offer today! 🏎️✨`,
        hashtags: "#Pakizzle #PerformanceRedefined #CarCommunity #TikTokPakistan"
      };
    }
  }
};
