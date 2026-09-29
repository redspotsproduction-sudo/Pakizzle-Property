import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Property, Vehicle } from '../types';
import { MOCK_PROPERTIES } from '../data/mockProperties';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, setDoc, doc, query, orderBy, deleteDoc } from 'firebase/firestore';
import { notificationService } from '../services/notificationService';

export interface PropertyContextType {
  properties: Property[];
  vehicles: Property[]; // Backward-compatibility alias
  addProperty: (property: Property) => Promise<void>;
  addVehicle: (property: Property) => Promise<void>; // Backward-compatibility alias
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
  updateVehicle: (id: string, updates: Partial<Property>) => Promise<void>; // Backward-compatibility alias
  deleteProperty: (id: string) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>; // Backward-compatibility alias
  loading: boolean;
  recentlyViewed: string[]; // Stores property IDs
  addToRecentlyViewed: (propertyId: string) => void;
  clearRecentlyViewed: () => void;
}

export const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export function PropertyProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [loading, setLoading] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  // Safely migrate or load recently viewed items
  useEffect(() => {
    if (loading || properties.length === 0) return;
    
    const saved = localStorage.getItem('recentlyViewedProperties') || localStorage.getItem('recentlyViewed');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const processedIds = parsed.map(item => {
            if (typeof item !== 'string') return null;
            const existsDirectly = properties.some(p => p.id === item);
            if (existsDirectly) return item;
            
            const foundProp = properties.find(p => {
              const fullName = `${p.year} ${p.make} ${p.model}`.toLowerCase();
              return fullName === item.toLowerCase() || item.toLowerCase().includes(p.model.toLowerCase());
            });
            return foundProp ? foundProp.id : null;
          }).filter((id): id is string => id !== null);

          setRecentlyViewed(processedIds);
          localStorage.setItem('recentlyViewedProperties', JSON.stringify(processedIds));
        }
      } catch (e) {
        console.error('Failed to parse recentlyViewed properties:', e);
      }
    }
  }, [loading, properties]);

  const addToRecentlyViewed = useCallback((propertyId: string) => {
    setRecentlyViewed(prev => {
      if (prev[0] === propertyId) return prev;
      const filtered = prev.filter(id => id !== propertyId);
      const updated = [propertyId, ...filtered].slice(0, 10);
      localStorage.setItem('recentlyViewedProperties', JSON.stringify(updated));
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    localStorage.removeItem('recentlyViewedProperties');
    localStorage.removeItem('recentlyViewed');
  }, []);

  useEffect(() => {
    console.log('PropertyContext: Initializing with', MOCK_PROPERTIES.length, 'mock properties');
    const q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreProperties = snapshot.docs.map(doc => doc.data() as Property);
      
      const merged = [...firestoreProperties];
      MOCK_PROPERTIES.forEach(mock => {
        if (!merged.find(p => p.id === mock.id)) {
          merged.push(mock);
        }
      });
      
      setProperties(merged);
      setLoading(false);
    }, (error) => {
      if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
        console.warn('[PropertyContext] Operating in offline mode. Serving cached catalog.');
      } else {
        // Fallback to checking 'vehicles' legacy collection if 'properties' is not provisioned
        const legacyQ = query(collection(db, 'vehicles'), orderBy('createdAt', 'desc'));
        const legUnsub = onSnapshot(legacyQ, (legSnap) => {
          const legProps = legSnap.docs.map(doc => doc.data() as Property);
          const merged = [...legProps];
          MOCK_PROPERTIES.forEach(mock => {
            if (!merged.find(p => p.id === mock.id)) {
              merged.push(mock);
            }
          });
          setProperties(merged);
          setLoading(false);
        }, (err) => {
          console.warn('[PropertyContext] Legacy snapshot error:', err.message);
          setLoading(false);
        });
        return () => legUnsub();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addProperty = useCallback(async (property: Property) => {
    try {
      await setDoc(doc(db, 'properties', property.id), property);
      // Dual-sync to legacy collection for backwards-compat queries
      try {
        await setDoc(doc(db, 'vehicles', property.id), property);
      } catch (_) {}

      if (property.status === 'active' || !property.status) {
        import('../services/savedSearchService').then(({ savedSearchService }) => {
          savedSearchService.checkAllSavedSearchesAgainstVehicle(property);
        }).catch(err => console.error("Error checking saved searches against property:", err));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `properties/${property.id}`);
    }
  }, []);

  const updateProperty = useCallback(async (id: string, updates: Partial<Property>) => {
    try {
      const currentProperty = properties.find(p => p.id === id);
      if (currentProperty) {
        if (updates.status && updates.status !== currentProperty.status && currentProperty.seller.uid) {
          let title = '';
          let message = '';
          let type: 'listing' | 'update' | 'auction' = 'listing';

          if (updates.status === 'active') {
            title = 'Property Listing Approved! 🏡✨';
            message = `Your ${currentProperty.make} "${currentProperty.model}" is now live and visible to buyers.`;
            type = 'listing';
          } else if (updates.status === 'rejected') {
            title = 'Property Listing Action Required';
            message = `Your ${currentProperty.make} "${currentProperty.model}" requires revisions before it can go live.`;
            type = 'update';
          }

          if (title) {
            await notificationService.sendNotification({
              userId: currentProperty.seller.uid,
              title,
              message,
              type,
              link: `/property/${id}`,
              metadata: { propertyId: id, oldStatus: currentProperty.status, newStatus: updates.status }
            });
          }

          if (updates.status === 'active') {
            const mergedProperty = { ...currentProperty, ...updates };
            import('../services/savedSearchService').then(({ savedSearchService }) => {
              savedSearchService.checkAllSavedSearchesAgainstVehicle(mergedProperty);
            }).catch(err => console.error("Error checking saved searches against property:", err));
          }
        }

        const merged = { ...currentProperty, ...updates };
        await setDoc(doc(db, 'properties', id), merged);
        try {
          await setDoc(doc(db, 'vehicles', id), merged);
        } catch (_) {}
      } else {
        await setDoc(doc(db, 'properties', id), updates, { merge: true });
        try {
          await setDoc(doc(db, 'vehicles', id), updates, { merge: true });
        } catch (_) {}
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `properties/${id}`);
    }
  }, [properties]);

  const deleteProperty = useCallback(async (id: string) => {
    try {
      setProperties(prev => prev.filter(p => p.id !== id));
      await deleteDoc(doc(db, 'properties', id));
      try {
        await deleteDoc(doc(db, 'vehicles', id));
      } catch (_) {}
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `properties/${id}`);
    }
  }, []);

  const value = useMemo<PropertyContextType>(() => ({
    properties,
    vehicles: properties, // Backward compatibility alias
    addProperty,
    addVehicle: addProperty, // Backward compatibility alias
    updateProperty,
    updateVehicle: updateProperty, // Backward compatibility alias
    deleteProperty,
    deleteVehicle: deleteProperty, // Backward compatibility alias
    loading,
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed
  }), [properties, addProperty, updateProperty, deleteProperty, loading, recentlyViewed, addToRecentlyViewed, clearRecentlyViewed]);

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperties() {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperties must be used within a PropertyProvider');
  }
  return context;
}

// Aliases for seamless drop-in backwards compatibility
export const useVehicles = useProperties;
export const VehicleProvider = PropertyProvider;
export const VehicleContext = PropertyContext;
