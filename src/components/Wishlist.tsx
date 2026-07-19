import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  ChevronLeft, 
  Car, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Lock, 
  Globe, 
  Trash2, 
  Edit3,
  ArrowUpDown,
  LayoutGrid,
  List as ListIcon,
  X,
  Check,
  Share2,
  Copy,
  Mail,
  Facebook,
  Twitter,
  Send,
  MessageCircle,
  UserPlus,
  ChevronRight,
  Link as LinkIcon
} from "lucide-react";
import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "@/context/WishlistContext";
import { MOCK_VEHICLES } from "@/data/mockVehicles";
import VehicleCard from "./VehicleCard";
import Header from "./Header";
import { cn } from "@/lib/utils";

type SortOption = 
  | 'default' 
  | 'price_low_high' 
  | 'price_high_low' 
  | 'oldest_newest' 
  | 'newest_oldest' 
  | 'fav_oldest_newest' 
  | 'fav_newest_oldest';

const SORT_LABELS: Record<SortOption, string> = {
  default: 'Default',
  price_low_high: 'Price Lowest to Highest',
  price_high_low: 'Price Highest to Lowest',
  oldest_newest: 'Oldest to Newest',
  newest_oldest: 'Newest to Oldest',
  fav_oldest_newest: 'Favorite Oldest to Newest',
  fav_newest_oldest: 'Favorite Newest to Oldest'
};

export default function Wishlist() {
  const { lists, activeListId, setActiveListId, createList, deleteList } = useWishlist();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [newListName, setNewListName] = useState("");
  const [renameListName, setRenameListName] = useState("");
  const [createdListName, setCreatedListName] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [copied, setCopied] = useState(false);
  const { updateList } = useWishlist(); // I need to add this to context

  const activeList = useMemo(() => 
    lists.find(l => l.id === activeListId) || lists[0],
  [lists, activeListId]);

  const handleRenameList = (e: React.FormEvent) => {
    e.preventDefault();
    if (renameListName.trim()) {
      updateList(activeListId, { name: renameListName.trim() });
      setIsRenameModalOpen(false);
    }
  };

  const filteredVehicles = useMemo(() => {
    let items = MOCK_VEHICLES.filter(v => activeList.itemIds.includes(v.id));
    
    // Search filter
    if (searchQuery) {
      items = items.filter(v => 
        v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sorting
    switch (sortOption) {
      case 'price_low_high':
        items.sort((a, b) => a.price - b.price);
        break;
      case 'price_high_low':
        items.sort((a, b) => b.price - a.price);
        break;
      case 'oldest_newest':
        items.sort((a, b) => a.year - b.year);
        break;
      case 'newest_oldest':
        items.sort((a, b) => b.year - a.year);
        break;
      case 'fav_oldest_newest':
        // Order in activeList.itemIds is the order they were added
        items.sort((a, b) => activeList.itemIds.indexOf(a.id) - activeList.itemIds.indexOf(b.id));
        break;
      case 'fav_newest_oldest':
        items.sort((a, b) => activeList.itemIds.indexOf(b.id) - activeList.itemIds.indexOf(a.id));
        break;
      default:
        // Default is usually the order in the mock data or added order
        break;
    }

    return items;
  }, [activeList, searchQuery, sortOption]);

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      const newId = createList(newListName.trim());
      setActiveListId(newId);
      setCreatedListName(newListName.trim());
      setNewListName("");
      setIsCreateModalOpen(false);
      // Show success modal after a small delay for smoother transition
      setTimeout(() => {
        setIsSuccessModalOpen(true);
      }, 300);
    }
  };

  const handleCopyLink = () => {
    const listId = activeList.id;
    navigator.clipboard.writeText(`https://pakizzle.com/mywishlist/${listId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDirectShare = (platform: 'whatsapp' | 'facebook' | 'twitter' | 'email') => {
    const shareUrl = `https://pakizzle.com/mywishlist/${activeList.id}`;
    const shareText = `Check out my wishlist "${activeList.name}" on Pakizzle!`;
    const shareSubject = `My Wishlist: ${activeList.name}`;

    let url = '';
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(shareSubject)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
        break;
    }

    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-apple-bg">
      <Header />
      
      <main className="pt-24 md:pt-28 pb-20 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* Mobile Lists Navigation - Horizontal Scroll */}
          <div className="lg:hidden -mx-4 px-4 pb-2 overflow-x-auto scrollbar-hide flex items-center gap-3" style={{ WebkitOverflowScrolling: 'touch' }}>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex-shrink-0 w-12 h-12 rounded-2xl bg-apple-card-bg border border-apple-border/50 shadow-sm flex items-center justify-center text-apple-blue"
            >
              <Plus className="w-6 h-6" />
            </button>
            {lists.map((list) => (
              <button
                key={list.id}
                onClick={() => setActiveListId(list.id)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-3 px-4 h-12 rounded-2xl transition-all duration-300 border",
                  activeListId === list.id 
                    ? "bg-apple-blue text-white border-apple-blue shadow-lg shadow-apple-blue/20" 
                    : "bg-apple-card-bg text-apple-text-muted border-apple-border/50 shadow-sm"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden",
                  activeListId === list.id ? "bg-apple-card-bg/20" : "bg-apple-gray/30"
                )}>
                  {list.itemIds.length > 0 ? (
                    <img 
                      src={MOCK_VEHICLES.find(v => v.id === list.itemIds[0])?.images[0]} 
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  ) : (
                    <Heart className={cn("w-4 h-4", activeListId === list.id ? "text-white" : "text-apple-text-muted/40")} />
                  )}
                </div>
                <span className="font-bold text-sm whitespace-nowrap">{list.name}</span>
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  activeListId === list.id ? "bg-apple-card-bg/20 text-white" : "bg-apple-gray text-apple-text-muted"
                )}>
                  {list.itemIds.length}
                </span>
              </button>
            ))}
          </div>

          {/* Sidebar - Desktop Only */}
          <aside className="hidden lg:block w-80 shrink-0 space-y-6">
            <div className="glass-panel rounded-apple-2xl p-6 border border-apple-border/50 shadow-apple-soft">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold tracking-tight">Favorite Lists</h2>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="p-2 hover:bg-apple-blue/10 text-apple-blue rounded-full transition-colors group"
                  title="Create new list"
                >
                  <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>

              <div className="space-y-2">
                {lists.map((list) => (
                  <div
                    key={list.id}
                    onClick={() => setActiveListId(list.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-3 rounded-apple-xl transition-all duration-300 group cursor-pointer",
                      activeListId === list.id 
                        ? "bg-apple-blue text-white shadow-lg shadow-apple-blue/20" 
                        : "hover:bg-apple-card-bg text-apple-text-muted hover:text-apple-text"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center shrink-0 overflow-hidden",
                      activeListId === list.id ? "bg-apple-card-bg/20" : "bg-apple-gray/30"
                    )}>
                      {list.itemIds.length > 0 ? (
                        <img 
                          src={MOCK_VEHICLES.find(v => v.id === list.itemIds[0])?.images[0]} 
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      ) : (
                        <Heart className={cn("w-5 h-5", activeListId === list.id ? "text-white" : "text-apple-text-muted/40")} />
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-bold text-sm truncate">{list.name}</div>
                      <div className={cn(
                        "text-[11px] font-medium flex items-center gap-1.5",
                        activeListId === list.id ? "text-white/70" : "text-apple-text-muted/60"
                      )}>
                        {list.itemIds.length} Saved Ads
                        <span className="w-1 h-1 rounded-full bg-current opacity-40" />
                        {list.isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                      </div>
                    </div>
                    {activeListId === list.id && !list.isDefault && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteList(list.id);
                        }}
                        className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Promo Card */}
              <div className="mt-8 p-5 rounded-apple-2xl bg-gradient-to-br from-apple-blue to-apple-blue-dark text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <Heart className="w-8 h-8 mb-3 opacity-80" />
                  <h3 className="font-bold text-sm mb-1">Personalized Lists</h3>
                  <p className="text-[11px] text-white/70 leading-relaxed mb-4">
                    Organize your dream cars into custom collections for easy tracking.
                  </p>
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full py-2 bg-white text-apple-blue text-[11px] font-bold rounded-lg hover:bg-apple-gray transition-colors"
                  >
                    Create a List
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-4 md:space-y-6">
            <div className="glass-panel rounded-[24px] md:rounded-apple-2xl p-4 md:p-6 border border-apple-border/50 shadow-apple-soft">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-apple-text">{activeList.name}</h1>
                      {!activeList.isDefault && (
                        <button 
                          onClick={() => {
                            setRenameListName(activeList.name);
                            setIsRenameModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-apple-card-bg rounded-md text-apple-text-muted transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-apple-text-muted font-medium">
                      Manage and organize your favorite vehicle listings
                    </p>
                  </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => {
                      setCreatedListName(activeList.name);
                      setIsShareModalOpen(true);
                    }}
                    className="flex-1 md:flex-none apple-button-secondary !h-10 md:!h-9 !px-4 text-xs flex items-center justify-center gap-2 !rounded-full"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Share List
                  </button>
                  <div className="flex bg-apple-card-bg p-1 rounded-xl border border-apple-border/50">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={cn(
                        "p-1.5 rounded-md transition-all",
                        viewMode === 'grid' ? "bg-apple-card-bg shadow-sm text-apple-blue" : "text-apple-text-muted hover:text-apple-text"
                      )}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={cn(
                        "p-1.5 rounded-md transition-all",
                        viewMode === 'list' ? "bg-apple-card-bg shadow-sm text-apple-blue" : "text-apple-text-muted hover:text-apple-text"
                      )}
                    >
                      <ListIcon className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="relative flex-1 md:flex-none">
                    <button 
                      onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                      className="w-full md:w-auto apple-button-secondary !h-10 md:!h-9 !px-4 text-xs flex items-center justify-center gap-2 !rounded-full"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[100px] md:max-w-none">Sort: {SORT_LABELS[sortOption]}</span>
                    </button>

                    <AnimatePresence>
                      {isSortDropdownOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-[60]" 
                            onClick={() => setIsSortDropdownOpen(false)} 
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-64 bg-apple-card-bg rounded-xl shadow-apple-hover border border-apple-border/50 py-1 z-[70] overflow-hidden"
                          >
                            {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
                              <button
                                key={option}
                                onClick={() => {
                                  setSortOption(option);
                                  setIsSortDropdownOpen(false);
                                }}
                                className={cn(
                                  "w-full text-left px-4 py-2.5 text-sm transition-colors",
                                  sortOption === option 
                                    ? "bg-apple-blue/5 text-apple-blue font-bold" 
                                    : "text-apple-text hover:bg-apple-card-bg"
                                )}
                              >
                                {SORT_LABELS[option]}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-text-muted group-focus-within:text-apple-blue transition-colors" />
                  <input 
                    type="text"
                    placeholder="Search in favorites..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 bg-apple-card-bg rounded-2xl border border-apple-border/50 focus:ring-2 focus:ring-apple-blue/20 transition-all text-sm font-medium"
                  />
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 sm:flex-none apple-button-secondary !h-12 !px-5 text-sm flex items-center justify-center gap-2 !rounded-2xl">
                    <Filter className="w-4 h-4" />
                    Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Vehicle Grid */}
            <AnimatePresence mode="wait">
              {filteredVehicles.length > 0 ? (
                <motion.div 
                  key={activeListId + searchQuery}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "grid gap-4 sm:gap-6",
                    viewMode === 'grid' 
                      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" 
                      : "grid-cols-1"
                  )}
                >
                  {filteredVehicles.map((vehicle, index) => (
                    <motion.div
                      key={vehicle.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="h-full"
                    >
                      <VehicleCard vehicle={vehicle} viewMode={viewMode} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-panel rounded-apple-2xl p-20 text-center border border-apple-border/50 shadow-apple-soft"
                >
                  <div className="relative w-32 h-32 mx-auto mb-8">
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="w-full h-full bg-apple-blue/5 rounded-full flex items-center justify-center"
                    >
                      <Heart className="w-16 h-16 text-apple-blue/20" />
                    </motion.div>
                    <motion.div 
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -top-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-apple-soft flex items-center justify-center border border-apple-border/50"
                    >
                      <Car className="w-6 h-6 text-apple-blue" />
                    </motion.div>
                  </div>
                  <h2 className="text-2xl font-bold mb-3 tracking-tight">You have no favorites yet</h2>
                  <p className="text-apple-text-muted mb-10 max-w-sm mx-auto font-medium leading-relaxed">
                    Use the favorite icon to save ads that you want to check later. We'll even notify you if the price drops!
                  </p>
                  <Link to="/marketplace" className="apple-button-primary !h-12 !px-8 inline-flex items-center gap-2 text-sm">
                    Continue Searching
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Create List Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-apple-text/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-md bg-apple-card-bg rounded-[18px] shadow-2xl border border-apple-border/30 overflow-hidden"
            >
              <div className="p-6 border-b border-apple-border/30 flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-apple-text">
                  Create a List
                </h2>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 hover:bg-apple-card-bg rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-apple-text-muted" />
                </button>
              </div>

              <form onSubmit={handleCreateList}>
                <div className="p-8 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-apple-blue/10 rounded-xl flex items-center justify-center shrink-0">
                      <Plus className="w-6 h-6 text-apple-blue" />
                    </div>
                    <div>
                      <p className="text-[15px] text-apple-text-muted font-medium leading-relaxed">
                        Give your new collection a name to stay organized.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-apple-text-muted ml-1">
                      List Name
                    </label>
                    <input 
                      autoFocus
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      placeholder="e.g. Dream SUVs, Family Cars..."
                      className="w-full h-12 px-4 bg-apple-card-bg rounded-xl border-2 border-transparent focus:border-apple-text focus:ring-0 transition-all font-medium outline-none"
                    />
                  </div>
                </div>

                <div className="p-6 bg-apple-card-bg/30 border-t border-apple-border/30 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-8 h-12 rounded-xl border border-apple-border/60 font-bold text-apple-text hover:bg-apple-card-bg transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={!newListName.trim()}
                    className="px-8 h-12 rounded-xl bg-apple-text text-apple-bg font-bold hover:bg-apple-text/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create List
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Rename List Modal */}
      <AnimatePresence>
        {isRenameModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRenameModalOpen(false)}
              className="absolute inset-0 bg-apple-text/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-md bg-apple-card-bg rounded-[18px] shadow-2xl border border-apple-border/30 overflow-hidden"
            >
              <div className="p-6 border-b border-apple-border/30 flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-apple-text">
                  Rename List
                </h2>
                <button 
                  onClick={() => setIsRenameModalOpen(false)}
                  className="p-2 hover:bg-apple-card-bg rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-apple-text-muted" />
                </button>
              </div>

              <form onSubmit={handleRenameList}>
                <div className="p-8 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-apple-blue/10 rounded-xl flex items-center justify-center shrink-0">
                      <Edit3 className="w-6 h-6 text-apple-blue" />
                    </div>
                    <div>
                      <p className="text-[15px] text-apple-text-muted font-medium leading-relaxed">
                        Choose a new name for your collection.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-apple-text-muted ml-1">
                      New Name
                    </label>
                    <input 
                      autoFocus
                      type="text"
                      value={renameListName}
                      onChange={(e) => setRenameListName(e.target.value)}
                      className="w-full h-12 px-4 bg-apple-card-bg rounded-xl border-2 border-transparent focus:border-apple-text focus:ring-0 transition-all font-medium outline-none"
                    />
                  </div>
                </div>

                <div className="p-6 bg-apple-card-bg/30 border-t border-apple-border/30 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsRenameModalOpen(false)}
                    className="px-8 h-12 rounded-xl border border-apple-border/60 font-bold text-apple-text hover:bg-apple-card-bg transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={!renameListName.trim() || renameListName === activeList.name}
                    className="px-8 h-12 rounded-xl bg-apple-text text-apple-bg font-bold hover:bg-apple-text/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Creation Success Modal (Dubizzle Style) */}
      <AnimatePresence>
        {isSuccessModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSuccessModalOpen(false)}
              className="absolute inset-0 bg-apple-text/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-md bg-apple-card-bg rounded-[32px] p-10 shadow-2xl border border-apple-border/30 text-center"
            >
              <button 
                onClick={() => setIsSuccessModalOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-apple-card-bg rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-apple-text-muted" />
              </button>

              <div className="relative w-24 h-24 mx-auto mb-8">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                  className="w-full h-full bg-apple-blue/10 rounded-full flex items-center justify-center"
                >
                  <div className="relative">
                    <div className="w-16 h-12 bg-apple-blue/20 rounded-lg flex items-center justify-center">
                      <Check className="w-8 h-8 text-apple-blue" strokeWidth={3} />
                    </div>
                    <motion.div 
                      initial={{ scale: 0, x: -10, y: -10 }}
                      animate={{ scale: 1, x: -10, y: -10 }}
                      transition={{ delay: 0.5 }}
                      className="absolute top-0 left-0 w-8 h-8 bg-apple-red rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Heart className="w-4 h-4 text-white fill-current" />
                    </motion.div>
                  </div>
                </motion.div>
                {/* Decorative Sparkles */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="absolute w-2 h-2 bg-apple-blue/30 rounded-full"
                    style={{ 
                      top: i === 0 ? '10%' : i === 1 ? '20%' : '70%',
                      right: i === 0 ? '10%' : i === 1 ? '-5%' : '5%'
                    }}
                  />
                ))}
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-apple-text mb-4">
                Your list <span className="text-apple-blue">{createdListName}</span> is created
              </h2>
              
              <div className="h-px bg-apple-border/50 w-full my-8" />

              <div className="bg-apple-card-bg/50 rounded-2xl p-6 mb-8 flex items-center gap-4">
                <div className="w-16 h-16 bg-apple-card-bg rounded-xl flex items-center justify-center shrink-0">
                  <LayoutGrid className="w-8 h-8 text-apple-text-muted/30" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 bg-apple-text-muted/10 rounded-full" />
                  <div className="h-3 w-1/2 bg-apple-text-muted/10 rounded-full" />
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-sm text-apple-text-muted font-medium leading-relaxed">
                  You can share and invite friends to collaborate or view your list
                </p>
                
                <button 
                  onClick={() => {
                    setIsSuccessModalOpen(false);
                    setTimeout(() => setIsShareModalOpen(true), 300);
                  }}
                  className="text-apple-blue font-bold text-sm hover:underline transition-all"
                >
                  Invite collaborators on this list
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal (Dubizzle Style) */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="absolute inset-0 bg-apple-text/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-md bg-apple-card-bg rounded-[18px] shadow-2xl border border-apple-border/30 overflow-hidden"
            >
              <div className="p-6 border-b border-apple-border/30 flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-apple-text">
                  Invite others to collaborate
                </h2>
                <button 
                  onClick={() => setIsShareModalOpen(false)}
                  className="p-2 hover:bg-apple-card-bg rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-apple-text-muted" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                {/* Collaboration Banner */}
                <button 
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-4 p-4 bg-apple-blue/5 rounded-xl border border-apple-blue/10 group hover:bg-apple-blue/10 transition-all text-left"
                >
                  <div className="w-12 h-12 bg-apple-card-bg rounded-xl flex items-center justify-center shadow-sm">
                    <UserPlus className="w-6 h-6 text-apple-blue" />
                  </div>
                  <div className="flex-1">
                    <div className="text-apple-blue font-bold text-sm">Invite others to collaborate</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-apple-blue opacity-60 group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-[15px] text-apple-text-muted font-medium leading-relaxed">
                  Invited members can add or delete ads in your list. And they can invite more people to the list as well
                </p>

                <button 
                  onClick={handleCopyLink}
                  className="flex items-center gap-3 text-apple-text font-bold hover:text-apple-blue transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-apple-card-bg flex items-center justify-center group-hover:bg-apple-blue/10 transition-colors">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <span className="text-sm">{copied ? 'Link copied to clipboard!' : 'Share a view only link'}</span>
                </button>

                <div className="pt-4">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-apple-text-muted mb-4 ml-1">
                    Direct Share
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleDirectShare('whatsapp')}
                      className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                    >
                      <MessageCircle className="w-5 h-5 fill-current" />
                    </button>
                    <button 
                      onClick={() => handleDirectShare('facebook')}
                      className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                    >
                      <Facebook className="w-5 h-5 fill-current" />
                    </button>
                    <button 
                      onClick={() => handleDirectShare('twitter')}
                      className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                    >
                      <Twitter className="w-5 h-5 fill-current" />
                    </button>
                    <button 
                      onClick={() => handleDirectShare('email')}
                      className="w-10 h-10 rounded-full bg-apple-blue text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                    >
                      <Mail className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-apple-card-bg/30 border-t border-apple-border/30 flex justify-end gap-3">
                <button 
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-8 h-12 rounded-xl border border-apple-border/60 font-bold text-apple-text hover:bg-apple-card-bg transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    handleCopyLink();
                    // In a real app, this might open an email/invite flow
                  }}
                  className="px-8 h-12 rounded-xl bg-apple-text text-apple-bg font-bold hover:bg-apple-text/90 transition-all"
                >
                  Invite
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
