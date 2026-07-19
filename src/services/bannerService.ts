import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot,
  setDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Banner } from '../types';

const BANNERS_COLLECTION = 'banners';

export const bannerService = {
  subscribeToBanners: (callback: (banners: Banner[]) => void) => {
    // Query without orderBy to ensure we get all banners even if some fields are missing
    const q = query(collection(db, BANNERS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      const banners = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Banner[];
      
      // Sort client-side for robustness
      const sortedBanners = [...banners].sort((a, b) => {
        const orderA = a.displayOrder ?? 0;
        const orderB = b.displayOrder ?? 0;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
      
      callback(sortedBanners);
    });
  },

  getAllBanners: async (): Promise<Banner[]> => {
    const q = query(collection(db, BANNERS_COLLECTION));
    const snapshot = await getDocs(q);
    const banners = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Banner[];

    return [...banners].sort((a, b) => {
      const orderA = a.displayOrder ?? 0;
      const orderB = b.displayOrder ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  },

  createBanner: async (banner: Omit<Banner, 'id'>): Promise<string> => {
    const docRef = doc(collection(db, BANNERS_COLLECTION));
    const id = docRef.id;
    await setDoc(docRef, {
      ...banner,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return id;
  },

  updateBanner: async (id: string, banner: Partial<Banner>): Promise<void> => {
    const docRef = doc(db, BANNERS_COLLECTION, id);
    await updateDoc(docRef, {
      ...banner,
      updatedAt: new Date().toISOString(),
    });
  },

  deleteBanner: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, BANNERS_COLLECTION, id));
  },

  reorderBanners: async (reorderedBanners: Banner[]): Promise<void> => {
    const batchPromises = reorderedBanners.map((banner, index) => {
      return updateDoc(doc(db, BANNERS_COLLECTION, banner.id), {
        displayOrder: index,
        updatedAt: new Date().toISOString(),
      });
    });
    await Promise.all(batchPromises);
  }
};
