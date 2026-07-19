import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";

interface WishlistList {
  id: string;
  name: string;
  isDefault?: boolean;
  isPrivate?: boolean;
  itemIds: string[];
}

interface WishlistContextType {
  lists: WishlistList[];
  activeListId: string;
  setActiveListId: (id: string) => void;
  toggleWishlist: (vehicleId: string, listId?: string) => void;
  isInWishlist: (vehicleId: string) => boolean;
  createList: (name: string) => string;
  updateList: (id: string, updates: Partial<WishlistList>) => void;
  deleteList: (id: string) => void;
  wishlist: string[]; // For backward compatibility/simpler access
  
  // New notification/modal states
  toast: {
    show: boolean;
    type: 'added' | 'removed';
    listName: string;
    vehicleId: string;
  } | null;
  setToast: (toast: any) => void;
  isAddToListModalOpen: boolean;
  setIsAddToListModalOpen: (open: boolean) => void;
  modalVehicleId: string | null;
  setModalVehicleId: (id: string | null) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useState<WishlistList[]>(() => {
    const saved = localStorage.getItem("pakauto_wishlist_v2");
    if (saved) return JSON.parse(saved);
    
    // Migrate from v1 if exists
    const oldSaved = localStorage.getItem("pakauto_wishlist");
    const oldItems = oldSaved ? JSON.parse(oldSaved) : [];
    
    return [{
      id: "default",
      name: "All Favorites",
      isDefault: true,
      isPrivate: true,
      itemIds: oldItems
    }];
  });

  const [activeListId, setActiveListId] = useState<string>("default");
  const [toast, setToast] = useState<{ show: boolean; type: 'added' | 'removed'; listName: string; vehicleId: string } | null>(null);
  const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false);
  const [modalVehicleId, setModalVehicleId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("pakauto_wishlist_v2", JSON.stringify(lists));
    // Also update v1 for backward compatibility if needed by other components
    const allItems = Array.from(new Set(lists.flatMap(l => l.itemIds)));
    localStorage.setItem("pakauto_wishlist", JSON.stringify(allItems));
  }, [lists]);

  const toggleWishlist = useCallback((vehicleId: string, listId: string = "default") => {
    setLists((prev) => {
      const targetList = prev.find(l => l.id === listId);
      if (!targetList) return prev;

      const exists = targetList.itemIds.includes(vehicleId);
      
      // Set toast notification
      setToast({
        show: true,
        type: exists ? 'removed' : 'added',
        listName: targetList.name,
        vehicleId: vehicleId
      });

      return prev.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            itemIds: exists 
              ? list.itemIds.filter(id => id !== vehicleId)
              : [...list.itemIds, vehicleId]
          };
        }
        return list;
      });
    });
  }, []);

  const isInWishlist = useCallback((vehicleId: string) => {
    return lists.some(list => list.itemIds.includes(vehicleId));
  }, [lists]);

  const createList = useCallback((name: string) => {
    const id = crypto.randomUUID();
    const newList: WishlistList = {
      id,
      name,
      isPrivate: true,
      itemIds: []
    };
    setLists(prev => [...prev, newList]);
    return id;
  }, []);

  const updateList = useCallback((id: string, updates: Partial<WishlistList>) => {
    setLists(prev => prev.map(list => 
      list.id === id ? { ...list, ...updates } : list
    ));
  }, []);

  const deleteList = useCallback((id: string) => {
    setLists(prev => {
      const listToDelete = prev.find(l => l.id === id);
      if (listToDelete?.isDefault) return prev;
      return prev.filter(l => l.id !== id);
    });
    if (activeListId === id) setActiveListId("default");
  }, [activeListId]);

  const wishlist = useMemo(() => 
    Array.from(new Set(lists.flatMap(l => l.itemIds))),
  [lists]);

  const value = useMemo(() => ({ 
    lists,
    activeListId,
    setActiveListId,
    toggleWishlist, 
    isInWishlist,
    createList,
    updateList,
    deleteList,
    wishlist,
    toast,
    setToast,
    isAddToListModalOpen,
    setIsAddToListModalOpen,
    modalVehicleId,
    setModalVehicleId
  }), [lists, activeListId, toggleWishlist, isInWishlist, createList, updateList, deleteList, wishlist, toast, isAddToListModalOpen, modalVehicleId]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
