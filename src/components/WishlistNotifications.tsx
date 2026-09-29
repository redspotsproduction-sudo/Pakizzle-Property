import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, Plus, Heart, Lock, Globe, LayoutGrid, ChevronRight } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useProperties } from "@/context/PropertyContext";
import { cn } from "@/lib/utils";
import { SPRING_SNAPPY, SPRING_BOUNCY } from "./motion";

export function WishlistToast() {
  const { toast, setToast, setIsAddToListModalOpen, setModalVehicleId } = useWishlist();
  const { properties, vehicles } = useProperties();

  React.useEffect(() => {
    if (toast?.show) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, setToast]);

  const vehicle = toast?.vehicleId ? vehicles.find(v => v.id === toast.vehicleId) : null;

  return (
    <AnimatePresence>
      {toast?.show && vehicle && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.94 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="fixed bottom-6 left-4 right-4 md:left-8 md:right-auto z-[200] flex items-center gap-3 md:gap-4 p-2.5 md:p-3 pr-4 md:pr-6 bg-white/90 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl text-apple-text dark:text-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-black/10 dark:border-white/10 md:min-w-[320px]"
        >
          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-apple-gray shadow-xs">
            <img src={vehicle.images[0]} alt="" className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium truncate">
              {toast.type === 'added' ? (
                <>Added to <span className="font-bold text-apple-blue">{toast.listName}</span></>
              ) : (
                <>Removed from <span className="font-bold">{toast.listName}</span></>
              )}
            </p>
          </div>

          {toast.type === 'added' && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              transition={SPRING_SNAPPY}
              onClick={() => {
                setModalVehicleId(toast.vehicleId);
                setIsAddToListModalOpen(true);
                setToast(null);
              }}
              className="text-xs font-bold text-apple-blue hover:underline transition-colors ml-2 cursor-pointer shrink-0"
            >
              Change
            </motion.button>
          )}
          
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.88 }}
            transition={SPRING_SNAPPY}
            onClick={() => setToast(null)}
            className="p-1 hover:bg-apple-gray/60 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer shrink-0"
            title="Dismiss notification"
          >
            <X className="w-4 h-4 text-apple-text-muted" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AddToListModal() {
  const { 
    isAddToListModalOpen, 
    setIsAddToListModalOpen, 
    modalVehicleId, 
    lists, 
    toggleWishlist,
    createList
  } = useWishlist();
  const { properties, vehicles } = useProperties();
  const [newListName, setNewListName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  if (!isAddToListModalOpen || !modalVehicleId) return null;

  const vehicle = vehicles.find(v => v.id === modalVehicleId);
  if (!vehicle) return null;

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      const newId = createList(newListName.trim());
      toggleWishlist(modalVehicleId, newId);
      setNewListName("");
      setIsCreating(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsAddToListModalOpen(false)}
          className="absolute inset-0 bg-apple-text/40 backdrop-blur-md"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          className="relative w-full max-w-md bg-apple-card-bg rounded-[24px] shadow-2xl border border-apple-border/30 overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-apple-border/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight text-apple-text">
                Saved to "All Favorites"
              </h2>
              <button 
                onClick={() => setIsAddToListModalOpen(false)}
                className="p-2 hover:bg-apple-card-bg rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-apple-text-muted" />
              </button>
            </div>

            {/* Default List Preview */}
            <div className="bg-apple-card-bg/30 rounded-2xl p-4 flex items-center gap-4 border border-apple-border/20">
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm">
                <img src={vehicle.images[0]} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-apple-blue text-white text-[10px] font-bold rounded-full uppercase tracking-wider">Default</span>
                  <h3 className="font-bold text-apple-text">All Favorites</h3>
                </div>
                <p className="text-xs text-apple-text-muted font-medium">
                  {lists.find(l => l.isDefault)?.itemIds.length || 0} Saved
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-apple-red/10 flex items-center justify-center">
                <Heart className="w-4 h-4 text-apple-red fill-current" />
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[400px] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-apple-text">Add to a list</h3>
              <button 
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-1.5 text-apple-text font-bold text-sm hover:text-apple-blue transition-colors"
              >
                <Plus className="w-4 h-4" />
                New List
              </button>
            </div>

            {isCreating && (
              <motion.form 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleCreateList}
                className="flex gap-2"
              >
                <input 
                  autoFocus
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="List name..."
                  className="flex-1 h-10 px-4 bg-apple-card-bg rounded-xl border border-apple-border/50 focus:ring-2 focus:ring-apple-blue/20 text-sm font-medium outline-none"
                />
                <button 
                  type="submit"
                  disabled={!newListName.trim()}
                  className="px-4 h-10 bg-apple-blue text-white font-bold text-xs rounded-xl disabled:opacity-50"
                >
                  Create
                </button>
                <button 
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 h-10 bg-apple-card-bg border border-apple-border/50 text-apple-text font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
              </motion.form>
            )}

            <div className="space-y-3">
              {lists.filter(l => !l.isDefault).map((list) => {
                const isItemInList = list.itemIds.includes(modalVehicleId);
                return (
                  <button
                    key={list.id}
                    onClick={() => toggleWishlist(modalVehicleId, list.id)}
                    className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-apple-card-bg/50 transition-all group text-left"
                  >
                    <div className="w-12 h-12 rounded-xl bg-apple-card-bg flex items-center justify-center shrink-0 overflow-hidden border border-apple-border/50">
                      {list.itemIds.length > 0 && vehicles.find(v => v.id === list.itemIds[0])?.images?.[0] ? (
                        <img 
                          src={vehicles.find(v => v.id === list.itemIds[0])!.images[0]} 
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      ) : (
                        <LayoutGrid className="w-5 h-5 text-apple-text-muted/30" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-apple-text text-sm">{list.name}</div>
                      <div className="flex items-center gap-2 text-[11px] text-apple-text-muted font-medium">
                        <span>{list.itemIds.length} Saved Ads</span>
                        <span className="w-1 h-1 rounded-full bg-current opacity-30" />
                        <span className="capitalize">{list.isPrivate ? 'Private' : 'Public'}</span>
                      </div>
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                      isItemInList ? "bg-apple-blue text-white" : "bg-apple-card-bg border border-apple-border/50 text-apple-text-muted/30 group-hover:bg-apple-gray/50"
                    )}>
                      {isItemInList ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-apple-card-bg/30 border-t border-apple-border/30 flex justify-end gap-3">
            <button 
              onClick={() => setIsAddToListModalOpen(false)}
              className="px-8 h-12 rounded-xl border border-apple-border/60 font-bold text-apple-text hover:bg-apple-card-bg transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={() => setIsAddToListModalOpen(false)}
              className="px-8 h-12 rounded-xl bg-apple-text text-apple-bg font-bold hover:bg-apple-text/90 transition-all"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
