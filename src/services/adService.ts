import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  onSnapshot,
  setDoc,
  increment
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { CustomAd } from '../types';

const ADS_COLLECTION = 'ads_configurations';

export const adService = {
  subscribeToAds: (callback: (ads: CustomAd[]) => void) => {
    const q = query(collection(db, ADS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      const ads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CustomAd[];
      
      const sortedAds = [...ads].sort((a, b) => {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
      
      callback(sortedAds);
    }, (error) => {
      console.error('Error fetching ads in onSnapshot subscription: ', error);
      handleFirestoreError(error, OperationType.GET, ADS_COLLECTION);
    });
  },

  getAllAds: async (): Promise<CustomAd[]> => {
    try {
      const q = query(collection(db, ADS_COLLECTION));
      const snapshot = await getDocs(q);
      const ads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CustomAd[];

      return [...ads].sort((a, b) => {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, ADS_COLLECTION);
    }
  },

  createAd: async (ad: Omit<CustomAd, 'id' | 'views' | 'clicks' | 'createdAt'>): Promise<string> => {
    try {
      const docRef = doc(collection(db, ADS_COLLECTION));
      const id = docRef.id;
      await setDoc(docRef, {
        ...ad,
        id,
        views: 0,
        clicks: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, ADS_COLLECTION);
    }
  },

  updateAd: async (id: string, ad: Partial<CustomAd>): Promise<void> => {
    try {
      const docRef = doc(db, ADS_COLLECTION, id);
      await updateDoc(docRef, {
        ...ad,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${ADS_COLLECTION}/${id}`);
    }
  },

  deleteAd: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, ADS_COLLECTION, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${ADS_COLLECTION}/${id}`);
    }
  },

  incrementViews: async (id: string): Promise<void> => {
    try {
      const docRef = doc(db, ADS_COLLECTION, id);
      await updateDoc(docRef, {
        views: increment(1)
      });
    } catch (error) {
      console.warn('Silent failure on incrementing ad views', error);
      // For increment tracking we can warn and continue, as counters can be soft on errors
    }
  },

  incrementClicks: async (id: string): Promise<void> => {
    try {
      const docRef = doc(db, ADS_COLLECTION, id);
      await updateDoc(docRef, {
        clicks: increment(1)
      });
    } catch (error) {
      console.warn('Silent failure on incrementing ad clicks', error);
    }
  }
};
