import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Property, Vehicle } from '../types';
import { MOCK_PROPERTIES } from '../data/mockProperties';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, setDoc, doc, query, orderBy, deleteDoc, getDocs } from 'firebase/firestore';
import { notificationService } from '../services/notificationService';
import { generateReferenceId, extractReferenceIdFromInput } from '../lib/referenceId';

export interface PropertyContextType {
  properties: Property[];
  vehicles: Property[]; // Backward-compatibility alias
  addProperty: (property: Property) => Promise<void>;
  addVehicle: (property: Property) => Promise<void>; // Backward-compatibility alias
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
  updateVehicle: (id: string, updates: Partial<Property>) => Promise<void>; // Backward-compatibility alias
  deleteProperty: (id: string) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>; // Backward-compatibility alias
  getPropertyByReferenceId: (refId: string) => Property | undefined;
  searchByReferenceId: (query: string) => Property | undefined;
  generateUniqueReferenceId: () => string;
  confirmListingActive: (id: string) => Promise<void>;
  reactivateListing: (id: string) => Promise<void>;
  markListingSold: (id: string) => Promise<void>;
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
  const reservedReferenceIdsRef = useRef<Set<string>>(new Set());

  // Helper to generate an immutable, unique 7-digit reference ID
  const generateUniqueReferenceId = useCallback(() => {
    const existing = new Set<string>();
    properties.forEach(p => {
      if (p.reference_id) existing.add(p.reference_id);
    });
    reservedReferenceIdsRef.current.forEach(id => existing.add(id));
    const newId = generateReferenceId(existing);
    reservedReferenceIdsRef.current.add(newId);
    return newId;
  }, [properties]);

  // Direct lookup by public reference_id (supports legacy ID fallback)
  const getPropertyByReferenceId = useCallback((refId: string): Property | undefined => {
    if (!refId) return undefined;
    const cleanId = refId.trim().replace(/^#/, "");
    return properties.find(p => p.reference_id === cleanId || p.id === cleanId);
  }, [properties]);

  // Intelligent resolver: accepts raw reference ID, formatted input ("ID: 3421789"), or full URL
  const searchByReferenceId = useCallback((queryStr: string): Property | undefined => {
    if (!queryStr) return undefined;
    const extractedId = extractReferenceIdFromInput(queryStr);
    if (extractedId) {
      const match = properties.find(p => p.reference_id === extractedId || p.id === extractedId);
      if (match) return match;
    }
    // Fallback: check if query matches internal id directly
    const directMatch = properties.find(p => p.id === queryStr.trim());
    return directMatch;
  }, [properties]);

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
            const existsDirectly = properties.some(p => p.id === item || p.reference_id === item);
            if (existsDirectly) return item;
            
            const foundProp = properties.find(p => {
              const fullName = `${p.year} ${p.make} ${p.model}`.toLowerCase();
              return fullName === item.toLowerCase() || item.toLowerCase().includes(p.model.toLowerCase());
            });
            return foundProp ? (foundProp.reference_id || foundProp.id) : null;
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
      
      // Auto-backfill reference_id if missing from legacy records
      const knownIds = new Set<string>();
      merged.forEach(p => {
        if (p.reference_id) {
          knownIds.add(p.reference_id);
          reservedReferenceIdsRef.current.add(p.reference_id);
        }
      });

      const normalized = merged.map(p => {
        const resolvedPropertyType = p.propertyType || p.make || (p.type === 'plot' ? 'Plot' : p.type === 'commercial' ? 'Commercial' : 'House');
        let refId = p.reference_id;
        if (!refId) {
          const generated = generateReferenceId(knownIds);
          knownIds.add(generated);
          reservedReferenceIdsRef.current.add(generated);
          refId = generated;
        }
        return {
          ...p,
          propertyType: resolvedPropertyType,
          make: p.make || resolvedPropertyType,
          reference_id: refId
        };
      });

      setProperties(normalized);
      setLoading(false);
    }, (error) => {
      if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
        console.warn('[PropertyContext] Operating in offline mode. Serving cached catalog.');
      } else {
        console.warn('[PropertyContext] Firestore subscription note:', error?.message);
      }
      setProperties(MOCK_PROPERTIES);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addProperty = useCallback(async (property: Property) => {
    try {
      // Create allowlist: (id, seller, status 'pending', price, createdAt, content fields)
      // Block title_deed_status, titleDeedStatus, title_deed_verified, isTitleDeedVerified, reference_id, views, favorites, isAuctionVerified
      const {
        title_deed_status,
        titleDeedStatus,
        title_deed_verified,
        isTitleDeedVerified,
        reference_id,
        views,
        favorites,
        isAuctionVerified,
        isFeatured,
        featuredUntil,
        badges,
        ...contentFields
      } = property as any;

      const sanitizedProperty = {
        ...contentFields,
        id: property.id,
        seller: {
          uid: property.seller?.uid || 'user',
          name: property.seller?.name || 'Authorized Seller',
          rating: property.seller?.rating || 5.0
        },
        status: 'pending',
        price: Number(property.price) || 0,
        createdAt: property.createdAt || new Date().toISOString()
      };

      await setDoc(doc(db, 'properties', property.id), sanitizedProperty);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `properties/${property.id}`);
    }
  }, []);

  const updateProperty = useCallback(async (id: string, updates: Partial<Property>) => {
    try {
      const currentProperty = properties.find(p => p.id === id);
      if (currentProperty) {
        // Enforce immutability: reference_id cannot be overwritten once assigned
        const safeUpdates = { ...updates };
        if (currentProperty.reference_id) {
          delete safeUpdates.reference_id;
        }

        if (updates.status && updates.status !== currentProperty.status && currentProperty.seller?.uid) {
          let title = '';
          let message = '';
          let type: 'listing' | 'update' | 'auction' = 'listing';

          if (updates.status === 'active') {
            title = 'Property Listing Approved! 🏡✨';
            message = `Your ${currentProperty.make} "${currentProperty.model}" is now live.`;
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
              link: `/property/${currentProperty.reference_id || id}`,
              metadata: { propertyId: id, referenceId: currentProperty.reference_id, oldStatus: currentProperty.status, newStatus: updates.status }
            });
          }
        }

        const merged = { ...currentProperty, ...safeUpdates };
        await setDoc(doc(db, 'properties', id), merged);
      } else {
        await setDoc(doc(db, 'properties', id), updates, { merge: true });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `properties/${id}`);
    }
  }, [properties]);

  const deleteProperty = useCallback(async (id: string) => {
    try {
      const target = properties.find(p => p.id === id);
      if (target?.reference_id) {
        try {
          await setDoc(doc(db, 'reserved_reference_ids', target.reference_id), {
            reference_id: target.reference_id,
            listing_id: id,
            is_deleted: true,
            archived_at: new Date().toISOString()
          }, { merge: true });
        } catch (_) {}
      }

      setProperties(prev => prev.filter(p => p.id !== id));
      await deleteDoc(doc(db, 'properties', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `properties/${id}`);
    }
  }, [properties]);

  const confirmListingActive = useCallback(async (id: string) => {
    const timestamp = new Date().toISOString();
    const updates: Partial<Property> = {
      last_confirmed_active: timestamp,
      status: 'active',
      updatedAt: timestamp
    };
    setProperties(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    await updateProperty(id, updates);
  }, [updateProperty]);

  const reactivateListing = useCallback(async (id: string) => {
    const timestamp = new Date().toISOString();
    const updates: Partial<Property> = {
      last_confirmed_active: timestamp,
      reactivated_at: timestamp,
      status: 'active',
      updatedAt: timestamp
    };
    setProperties(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    await updateProperty(id, updates);
  }, [updateProperty]);

  const markListingSold = useCallback(async (id: string) => {
    const timestamp = new Date().toISOString();
    const updates: Partial<Property> = {
      status: 'sold',
      updatedAt: timestamp
    };
    setProperties(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    await updateProperty(id, updates);
  }, [updateProperty]);

  const value = useMemo<PropertyContextType>(() => ({
    properties,
    vehicles: properties, // Backward compatibility alias
    addProperty,
    addVehicle: addProperty, // Backward compatibility alias
    updateProperty,
    updateVehicle: updateProperty, // Backward compatibility alias
    deleteProperty,
    deleteVehicle: deleteProperty, // Backward compatibility alias
    getPropertyByReferenceId,
    searchByReferenceId,
    generateUniqueReferenceId,
    confirmListingActive,
    reactivateListing,
    markListingSold,
    loading,
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed
  }), [
    properties,
    addProperty,
    updateProperty,
    deleteProperty,
    getPropertyByReferenceId,
    searchByReferenceId,
    generateUniqueReferenceId,
    confirmListingActive,
    reactivateListing,
    markListingSold,
    loading,
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed
  ]);

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
