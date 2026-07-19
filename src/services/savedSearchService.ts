import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, isFirestoreQuotaExceeded } from '../firebase';
import { SavedSearch, Vehicle } from '../types';
import { notificationService } from './notificationService';

const SAVED_SEARCHES_COLLECTION = 'saved_searches';

export const savedSearchService = {
  // Subscribe to real-time saved searches for a user
  subscribeToSavedSearches(userId: string, callback: (searches: SavedSearch[]) => void) {
    const q = query(
      collection(db, SAVED_SEARCHES_COLLECTION),
      where('userId', '==', userId)
    );

    return onSnapshot(q, (snapshot) => {
      const searches = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
          lastCheckedAt: data.lastCheckedAt instanceof Timestamp ? data.lastCheckedAt.toDate().toISOString() : data.lastCheckedAt
        } as SavedSearch;
      });
      
      // Sort in memory by creation time
      searches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      callback(searches);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, SAVED_SEARCHES_COLLECTION);
    });
  },

  // Save a search parameter set
  async createSavedSearch(userId: string, searchData: Omit<SavedSearch, 'id' | 'userId' | 'createdAt' | 'lastCheckedAt'>) {
    if (isFirestoreQuotaExceeded()) return;
    try {
      const docRef = await addDoc(collection(db, SAVED_SEARCHES_COLLECTION), {
        ...searchData,
        userId,
        createdAt: serverTimestamp(),
        lastCheckedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, SAVED_SEARCHES_COLLECTION);
    }
  },

  // Update saved search
  async updateSavedSearch(searchId: string, searchData: Partial<Omit<SavedSearch, 'id' | 'userId' | 'createdAt'>>) {
    if (isFirestoreQuotaExceeded()) return;
    try {
      const docRef = doc(db, SAVED_SEARCHES_COLLECTION, searchId);
      await updateDoc(docRef, {
        ...searchData,
        lastCheckedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${SAVED_SEARCHES_COLLECTION}/${searchId}`);
    }
  },

  // Delete saved search
  async deleteSavedSearch(searchId: string) {
    if (isFirestoreQuotaExceeded()) return;
    try {
      const docRef = doc(db, SAVED_SEARCHES_COLLECTION, searchId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${SAVED_SEARCHES_COLLECTION}/${searchId}`);
    }
  },

  // Checks if a vehicle matches the criteria of a saved search
  doesVehicleMatch(vehicle: Vehicle, filters: SavedSearch['filters']): boolean {
    // 1. Search Query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchQuery = 
        vehicle.make.toLowerCase().includes(q) || 
        vehicle.model.toLowerCase().includes(q) || 
        (vehicle.description && vehicle.description.toLowerCase().includes(q));
      if (!matchQuery) return false;
    }

    // 2. Make
    if (filters.make && vehicle.make.toLowerCase() !== filters.make.toLowerCase()) {
      return false;
    }

    // 3. Model
    if (filters.model && vehicle.model.toLowerCase() !== filters.model.toLowerCase()) {
      return false;
    }

    // 4. Variant
    if (filters.variant && (vehicle as any).variant && (vehicle as any).variant.toLowerCase() !== filters.variant.toLowerCase()) {
      return false;
    }

    // 5. Price bounds
    if (filters.minPrice !== undefined && filters.minPrice !== null && vehicle.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== null && vehicle.price > filters.maxPrice) {
      return false;
    }

    // 6. Year bounds
    if (filters.minYear !== undefined && filters.minYear !== null && vehicle.year < filters.minYear) {
      return false;
    }
    if (filters.maxYear !== undefined && filters.maxYear !== null && vehicle.year > filters.maxYear) {
      return false;
    }

    // 7. Mileage bounds
    if (filters.minMileage !== undefined && filters.minMileage !== null && vehicle.mileage < filters.minMileage) {
      return false;
    }
    if (filters.maxMileage !== undefined && filters.maxMileage !== null && vehicle.mileage > filters.maxMileage) {
      return false;
    }

    // 8. Body type
    if (filters.bodyType && filters.bodyType.length > 0 && vehicle.bodyType) {
      const matchBody = filters.bodyType.some(bt => bt.toLowerCase() === vehicle.bodyType?.toLowerCase() || bt.toLowerCase() === vehicle.type.toLowerCase());
      if (!matchBody) return false;
    }

    // 9. Fuel Type
    if (filters.fuelType && filters.fuelType.length > 0) {
      const matchFuel = filters.fuelType.some(ft => ft.toLowerCase() === vehicle.fuelType.toLowerCase());
      if (!matchFuel) return false;
    }

    // 10. Cities
    if (filters.cities && filters.cities.length > 0) {
      const matchCity = filters.cities.some(c => c.toLowerCase() === vehicle.city.toLowerCase());
      if (!matchCity) return false;
    }

    // 11. Condition
    if (filters.condition && filters.condition.length > 0) {
      const matchCondition = filters.condition.some(cond => cond.toLowerCase() === vehicle.condition.toLowerCase());
      if (!matchCondition) return false;
    }

    return true;
  },

  // Scan all active saved searches and trigger notification if matches are found
  async checkAllSavedSearchesAgainstVehicle(vehicle: Vehicle) {
    if (isFirestoreQuotaExceeded()) return;
    try {
      // Fetch some saved searches
      const allSearchesSnapshot = await getDocs(collection(db, SAVED_SEARCHES_COLLECTION));
      
      for (const d of allSearchesSnapshot.docs) {
        const search = { id: d.id, ...d.data() } as SavedSearch;
        
        // Skip searches belonging to the seller themselves to avoid self-match notifications
        if (search.userId === vehicle.seller.uid) continue;

        if (this.doesVehicleMatch(vehicle, search.filters)) {
          console.log(`[Alert Engine] Match found for search: ${search.name} / user: ${search.userId}`);
          
          await notificationService.sendNotification({
            userId: search.userId,
            title: `🚨 Match Found: ${search.name}`,
            message: `A new match was listed: ${vehicle.year} ${vehicle.make} ${vehicle.model} for $${vehicle.price.toLocaleString()}.`,
            type: 'listing',
            link: `/vehicle/${vehicle.id}`,
            metadata: {
              savedSearchId: search.id,
              vehicleId: vehicle.id,
              make: vehicle.make,
              model: vehicle.model,
              price: vehicle.price,
              image: vehicle.images[0]
            }
          });
        }
      }
    } catch (error) {
      console.error("[Alert Engine] Error checking searches:", error);
    }
  }
};
