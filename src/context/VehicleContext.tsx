import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Vehicle } from '../types';
import { MOCK_VEHICLES } from '../data/mockVehicles';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, setDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { notificationService } from '../services/notificationService';

interface VehicleContextType {
  vehicles: Vehicle[];
  addVehicle: (vehicle: Vehicle) => Promise<void>;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  loading: boolean;
  recentlyViewed: string[]; // Stores vehicle IDs
  addToRecentlyViewed: (vehicleId: string) => void;
  clearRecentlyViewed: () => void;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export function VehicleProvider({ children }: { children: React.ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [loading, setLoading] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  // Safely migrate or load recently viewed items
  useEffect(() => {
    if (loading || vehicles.length === 0) return;
    
    const saved = localStorage.getItem('recentlyViewed');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const processedIds = parsed.map(item => {
            if (typeof item !== 'string') return null;
            // Check if it's already an ID
            const existsDirectly = vehicles.some(v => v.id === item);
            if (existsDirectly) return item;
            
            // Otherwise, try to find matching vehicle by string matching if saved as description name
            const foundVehicle = vehicles.find(v => {
              const fullName = `${v.year} ${v.make} ${v.model}`.toLowerCase();
              return fullName === item.toLowerCase() || item.toLowerCase().includes(v.model.toLowerCase());
            });
            return foundVehicle ? foundVehicle.id : null;
          }).filter((id): id is string => id !== null);

          // Update state and save clean IDs
          setRecentlyViewed(processedIds);
          localStorage.setItem('recentlyViewed', JSON.stringify(processedIds));
        }
      } catch (e) {
        console.error('Failed to parse or migrate recentlyViewed:', e);
      }
    }
  }, [loading, vehicles]);

  const addToRecentlyViewed = useCallback((vehicleId: string) => {
    setRecentlyViewed(prev => {
      if (prev[0] === vehicleId) return prev; // Avoid update if already at top
      const filtered = prev.filter(id => id !== vehicleId);
      const updated = [vehicleId, ...filtered].slice(0, 10); // Store up to 10 vehicles
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    localStorage.removeItem('recentlyViewed');
  }, []);

  useEffect(() => {
    console.log('VehicleContext: Initializing with', MOCK_VEHICLES.length, 'mock vehicles');
    const q = query(collection(db, 'vehicles'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreVehicles = snapshot.docs.map(doc => doc.data() as Vehicle);
      
      // Merge mock vehicles with firestore vehicles, avoiding duplicates
      const merged = [...firestoreVehicles];
      MOCK_VEHICLES.forEach(mock => {
        if (!merged.find(v => v.id === mock.id)) {
          merged.push(mock);
        }
      });
      
      setVehicles(merged);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'vehicles');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addVehicle = useCallback(async (vehicle: Vehicle) => {
    try {
      await setDoc(doc(db, 'vehicles', vehicle.id), vehicle);
      if (vehicle.status === 'active' || !vehicle.status) {
        import('../services/savedSearchService').then(({ savedSearchService }) => {
          savedSearchService.checkAllSavedSearchesAgainstVehicle(vehicle);
        }).catch(err => console.error("Error checking saved searches against vehicle:", err));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `vehicles/${vehicle.id}`);
    }
  }, []);

  const updateVehicle = useCallback(async (id: string, updates: Partial<Vehicle>) => {
    try {
      const currentVehicle = vehicles.find(v => v.id === id);
      if (currentVehicle) {
        // Handle notifications for status changes
        if (updates.status && updates.status !== currentVehicle.status && currentVehicle.seller.uid) {
          let title = '';
          let message = '';
          let type: 'listing' | 'update' | 'auction' = 'listing';

          if (updates.status === 'active') {
            title = 'Listing Approved! 🚀';
            message = `Your ${currentVehicle.make} ${currentVehicle.model} is now live and visible to buyers.`;
            type = 'listing';
          } else if (updates.status === 'rejected') {
            title = 'Listing Action Required';
            message = `Your ${currentVehicle.make} ${currentVehicle.model} requires revisions before it can go live.`;
            type = 'update';
          }

          if (title) {
            await notificationService.sendNotification({
              userId: currentVehicle.seller.uid,
              title,
              message,
              type,
              link: `/vehicle/${id}`,
              metadata: { vehicleId: id, oldStatus: currentVehicle.status, newStatus: updates.status }
            });
          }

          if (updates.status === 'active') {
            const mergedVehicle = { ...currentVehicle, ...updates };
            import('../services/savedSearchService').then(({ savedSearchService }) => {
              savedSearchService.checkAllSavedSearchesAgainstVehicle(mergedVehicle);
            }).catch(err => console.error("Error checking saved searches against vehicle:", err));
          }
        }

        // If we have the vehicle in state (mock or firestore), send the full merged object
        // to ensure it passes schema validation, especially for mock vehicles being saved for the first time.
        await setDoc(doc(db, 'vehicles', id), { ...currentVehicle, ...updates });
      } else {
        // Fallback to partial update with merge if not in state
        await setDoc(doc(db, 'vehicles', id), updates, { merge: true });
        
        if (updates.status === 'active') {
          import('../services/savedSearchService').then(({ savedSearchService }) => {
            savedSearchService.checkAllSavedSearchesAgainstVehicle(updates as Vehicle);
          }).catch(err => console.error("Error checking saved searches against vehicle:", err));
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `vehicles/${id}`);
    }
  }, [vehicles]);

  const deleteVehicle = useCallback(async (id: string) => {
    try {
      // For mock vehicles, we just update the local state
      setVehicles(prev => prev.filter(v => v.id !== id));
      
      // If it's in Firestore, delete it there too
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'vehicles', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `vehicles/${id}`);
    }
  }, []);

  const value = useMemo(() => ({
    vehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    loading,
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed
  }), [vehicles, addVehicle, updateVehicle, deleteVehicle, loading, recentlyViewed, addToRecentlyViewed, clearRecentlyViewed]);

  return (
    <VehicleContext.Provider value={value}>
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehicles() {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error('useVehicles must be used within a VehicleProvider');
  }
  return context;
}
