import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Plus, 
  ChevronRight, 
  MoreVertical, 
  Folder, 
  FileText, 
  Eye, 
  EyeOff, 
  Trash2, 
  Edit3,
  Search,
  LayoutGrid,
  List,
  Columns,
  RefreshCcw,
  ArrowRight,
  Settings2,
  Zap,
  Upload,
  ChevronDown,
  Layers,
  Database,
  Type,
  Hash,
  CheckSquare,
  Filter,
  AlertTriangle,
  Table as TableIcon,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/firebase';
import { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import CategoryEditor from '@/components/Admin/Categories/CategoryEditor';
import CategoryForm from '@/components/Admin/Categories/CategoryForm';
import CustomFieldForm from '@/components/Admin/Categories/CustomFieldForm';
import { categoryAdminService } from '@/services/categoryAdminService';
import { toast } from 'sonner';
import { CategoryField, CategoryFieldType } from '@/types';

type ViewMode = 'table' | 'grid';
type ManagementView = 'categories' | 'custom-fields' | 'field-editor' | 'editor';

export default function CategoryManagement() {
  const location = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [allFields, setAllFields] = useState<CategoryField[]>([]);
  const [fieldSearchQuery, setFieldSearchQuery] = useState('');
  const [fieldCategoryFilter, setFieldCategoryFilter] = useState('All');
  const [fieldTypeFilter, setFieldTypeFilter] = useState('All');
  
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [mgmtView, setMgmtView] = useState<ManagementView>(() => {
    if (location.pathname.includes('popular-styles')) return 'popular-styles';
    if (location.pathname.includes('custom-fields')) return 'custom-fields';
    return 'categories';
  });

  useEffect(() => {
    if (location.pathname.includes('popular-styles')) {
      setMgmtView('popular-styles');
    } else if (location.pathname.includes('custom-fields')) {
      setMgmtView('custom-fields');
    } else if (location.pathname.includes('categories')) {
      setMgmtView('categories');
    }
  }, [location.pathname]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  
  // Navigation state
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [path, setPath] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  // Modal & Sidebar state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorInitialTab, setEditorInitialTab] = useState('general');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingField, setEditingField] = useState<CategoryField | null>(null);

  useEffect(() => {
    setIsSyncing(true);
    const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
    const unsubscribeCats = onSnapshot(q, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(cats);
    }, (error) => {
      console.error(error);
    });

    const fq = query(collection(db, 'category_fields'), orderBy('order', 'asc'));
    const unsubscribeFields = onSnapshot(fq, (snapshot) => {
      const fields = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CategoryField));
      setAllFields(fields);
      setIsSyncing(false);
    }, (error) => {
      console.error(error);
      setIsSyncing(false);
    });

    return () => {
      unsubscribeCats();
      unsubscribeFields();
    };
  }, []);

  const breadcrumbs = [];
  let tempParentId = currentParentId;
  while (tempParentId) {
    const parent = categories.find(c => c.id === tempParentId);
    if (parent) {
      breadcrumbs.unshift(parent);
      tempParentId = parent.parentId;
    } else {
      break;
    }
  }

  const handleLevelDown = (categoryId: string) => {
    setCurrentParentId(categoryId);
    setPath(prev => [...prev, categoryId]);
    setMgmtView('categories');
  };

  const handleViewFields = (categoryId?: string) => {
    if (categoryId) {
      setFieldCategoryFilter(categoryId);
    }
    setMgmtView('custom-fields');
  };

  const filteredCategories = categories.filter(c => 
    c.parentId === currentParentId && 
    (c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     c.slug.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredFields = allFields.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(fieldSearchQuery.toLowerCase());
    const matchesType = fieldTypeFilter === 'All' || f.type === fieldTypeFilter;
    const matchesCategory = fieldCategoryFilter === 'All' || (f.categoryIds || []).includes(fieldCategoryFilter);
    return matchesSearch && matchesType && matchesCategory;
  });

  const handleToggleStatus = async (category: Category) => {
    try {
      const newStatus = category.status === 'active' ? 'disabled' : 'active';
      await categoryAdminService.updateCategory(category.id, { status: newStatus });
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDeploy = async () => {
    const draftCount = categories.filter(c => c.isDraft).length;
    if (draftCount === 0) {
      toast.info("No modifications detected", {
        description: "Your system is currently in sync with the global state."
      });
      return;
    }

    try {
      setIsDeploying(true);
      const result = await categoryAdminService.publishAllChanges();
      toast.success("Global Deployment Successful", {
        description: `Broadcasted changes for ${result.count} nodes across the marketplace.`
      });
    } catch (error) {
      console.error(error);
      toast.error("Deployment Failed", {
        description: "An architectural error occurred during global broadcast."
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const getSubCategories = (parentId: string | null) => {
    return categories.filter(c => c.parentId === parentId);
  };

  const handleLevelSelect = (levelIndex: number, categoryId: string) => {
    const newPath = path.slice(0, levelIndex);
    newPath.push(categoryId);
    setPath(newPath);
    setSelectedCategoryId(categoryId);
  };

  const handleEdit = (category: Category, tab: string = 'general') => {
    setEditingCategory(category);
    setEditorInitialTab(tab);
    setMgmtView('editor');
  };

  const handleAdd = () => {
    const parent = categories.find(c => c.id === currentParentId);
    const tempId = `new_category_${Date.now()}`;
    setEditingCategory({
      id: tempId,
      name: '',
      slug: '',
      parentId: currentParentId,
      level: parent ? parent.level + 1 : 1,
      status: 'draft',
      showOnHomepage: false,
      isFeatured: false,
      order: categories.length,
      itemCount: 0,
      version: 1,
      isDraft: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Category);
    setMgmtView('editor');
  };

  const handleDelete = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    // Use a toast-based confirmation to avoid window.confirm iframe blocks
    toast.warning(`Permanently delete "${category.name}"?`, {
      description: "This action will purge all associated fields and sub-structures.",
      action: {
        label: "Delete Now",
        onClick: async () => {
          try {
            // Optimistic UI: Filter out the deleted category and ALL its descendants recursively
            const getDescendantIds = (parentId: string): string[] => {
              const children = categories.filter(c => c.parentId === parentId);
              return children.reduce((acc, child) => [...acc, child.id, ...getDescendantIds(child.id)], [] as string[]);
            };
            
            const idsToRemove = [categoryId, ...getDescendantIds(categoryId)];
            setCategories(prev => prev.filter(c => !idsToRemove.includes(c.id)));
            
            // Perform actual deletion
            await categoryAdminService.deleteCategory(categoryId);
            
            toast.success("Category deleted", {
              description: "Technical architecture and nested nodes have been purged."
            });

            // Reset navigation if we are currently inside or viewing the deleted category
            if (idsToRemove.includes(currentParentId || '')) {
              setCurrentParentId(null);
              setPath([]);
            }
            
            if (idsToRemove.includes(selectedCategoryId || '')) {
              setSelectedCategoryId(null);
              if (mgmtView === 'custom-fields') setMgmtView('categories');
            }

            if (editingCategory && idsToRemove.includes(editingCategory.id)) {
              setEditingCategory(null);
              if (mgmtView === 'editor') setMgmtView('categories');
            }
            
            // Remove from path if exists
            const pathToRemoveIdx = path.findIndex(id => idsToRemove.includes(id));
            if (pathToRemoveIdx !== -1) {
              const newPath = path.slice(0, pathToRemoveIdx);
              setPath(newPath);
              setCurrentParentId(newPath.length > 0 ? newPath[newPath.length - 1] : null);
            }
          } catch (error: any) {
            console.error('Delete flow failure:', error);
            toast.error("Deletion failed", {
              description: error.message || "An architectural error occurred."
            });
            // Re-syncing will happen automatically via onSnapshot if the write failed
          }
        }
      },
      cancel: {
        label: "Cancel",
        onClick: () => {}
      }
    });
  };

  const handleRefresh = () => {
    setIsSyncing(true);
    // onSnapshot is already active, but we can nudge it by briefly resetting loading or similar
    // Actually, we'll just wait for the next push, but visually provide feedback
    setTimeout(() => setIsSyncing(false), 800);
  };

  const handleAddField = () => {
    setEditingField({
      id: `new_field_${Date.now()}`,
      categoryIds: selectedCategoryId ? [selectedCategoryId] : [],
      name: '',
      type: 'text',
      required: false,
      searchable: true,
      filterable: true,
      showOnCard: false,
      showOnListingPage: true,
      showInAdminTable: true,
      order: allFields.length,
      groupName: 'General',
      status: 'active'
    } as CategoryField);
    setMgmtView('field-editor');
  };

  const handleEditField = (field: CategoryField) => {
    setEditingField(field);
    setMgmtView('field-editor');
  };

  const handleDeleteField = async (fieldId: string) => {
    toast.warning("Delete custom field?", {
      description: "This will remove this field from all listings in its associated categories.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await categoryAdminService.deleteField(fieldId);
            toast.success("Field deleted");
          } catch (error: any) {
            toast.error("Failed to delete field");
          }
        }
      }
    });
  };

  const handleSaveField = async (data: CategoryField) => {
    try {
      setIsSyncing(true);
      await categoryAdminService.saveField(data);
      toast.success(data.id.startsWith('new_field_') ? "Field created" : "Field updated");
      setMgmtView('custom-fields');
      setEditingField(null);
    } catch (error: any) {
      toast.error("Failed to save field");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveCategory = async (data: Category) => {
    try {
      setIsSyncing(true);
      if (data.id.startsWith('new_category_')) {
        await categoryAdminService.createCategory(data);
        toast.success("Category created");
      } else {
        await categoryAdminService.updateCategory(data.id, data);
        toast.success("Category updated");
      }
      setMgmtView('categories');
      setEditingCategory(null);
    } catch (error: any) {
      toast.error("Failed to save category", {
        description: error.message
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {mgmtView !== 'editor' && (
        <>
          {/* Header with breadcrumbs and actions - EXACT match with Approval Center layout and sizing */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.18em]">
                <button 
                  onClick={() => { setCurrentParentId(null); setPath([]); setMgmtView('categories'); }} 
                  className="hover:text-apple-blue transition-colors uppercase"
                >
                  Categories
                </button>
                {breadcrumbs.map((bc, idx) => (
                  <React.Fragment key={`breadcrumb-${bc.id}-${idx}`}>
                    <ChevronRight className="w-3 h-3 text-[var(--text-secondary)]/60" />
                    <button 
                      onClick={() => { 
                        setCurrentParentId(bc.id); 
                        setPath(path.slice(0, idx + 1));
                        setMgmtView('categories'); 
                      }} 
                      className="hover:text-apple-blue transition-colors uppercase"
                    >
                      {bc.name}
                    </button>
                  </React.Fragment>
                ))}
                {mgmtView === 'custom-fields' && (
                  <>
                    <ChevronRight className="w-3 h-3 text-[var(--text-secondary)]/60" />
                    <span className="text-apple-blue font-bold uppercase">Custom Fields</span>
                  </>
                )}
                {mgmtView === 'popular-styles' && (
                  <>
                    <ChevronRight className="w-3 h-3 text-[var(--text-secondary)]/60" />
                    <span className="text-apple-blue font-bold uppercase">Popular Styles</span>
                  </>
                )}
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-tight flex items-center gap-3">
                {mgmtView === 'custom-fields' ? 'Custom Fields' : mgmtView === 'popular-styles' ? 'Popular Styles' : (currentParentId ? breadcrumbs[breadcrumbs.length-1]?.name : 'Categories')}
                {isSyncing && <RefreshCcw className="w-5 h-5 animate-spin text-apple-blue" />}
              </h1>
              
              <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
                Configure taxonomy nodes, specify required attributes, group dynamic listing forms, and publish production-ready metadata schemas.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start md:self-end">
              {/* Workspace Pill Switcher */}
              <div className="flex bg-[var(--bg-inset)] dark:bg-white/5 p-1 rounded-xl border border-black/[0.04] dark:border-white/[0.04] mr-1.5 h-10 items-center">
                <button
                  onClick={() => { setMgmtView('categories'); setCurrentParentId(null); setPath([]); }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all h-8",
                    mgmtView === 'categories' || mgmtView === 'editor'
                      ? "bg-white dark:bg-[var(--bg-inset)] shadow-sm text-apple-blue dark:text-white"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white"
                  )}
                >
                  <Folder className="w-3.5 h-3.5" />
                  Categories
                </button>
                <button
                  onClick={() => setMgmtView('custom-fields')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all h-8",
                    mgmtView === 'custom-fields' || mgmtView === 'field-editor'
                      ? "bg-white dark:bg-[var(--bg-inset)] shadow-sm text-apple-blue dark:text-white"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white"
                  )}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Custom Fields
                </button>
              </div>

              {mgmtView === 'categories' && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button className="apple-button-primary rounded-xl text-xs font-semibold h-10 px-5 text-white gap-1.5">
                        <Plus className="w-4 h-4" />
                        Add Category
                        <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
                      </Button>
                    } />
                    <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5 border-black/[0.06] dark:border-white/[0.06] bg-white/95 dark:bg-[var(--bg-surface)]/95 backdrop-blur-xl">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Creation Options</DropdownMenuLabel>
                        <DropdownMenuItem onClick={handleAdd} className="rounded-lg py-2.5 px-3 font-semibold text-xs gap-2.5 cursor-pointer">
                          <Plus className="w-4 h-4 text-apple-blue" /> New Root Category
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            if (currentParentId) handleAdd();
                            else toast.error("Select a parent category first");
                          }} 
                          className="rounded-lg py-2.5 px-3 font-semibold text-xs gap-2.5 cursor-pointer"
                        >
                          <Layers className="w-4 h-4 text-apple-green" /> New Sub-category
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator className="bg-black/[0.05] dark:bg-white/[0.05] my-1.5" />
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => setMgmtView('custom-fields')} className="rounded-lg py-2.5 px-3 font-semibold text-xs gap-2.5 cursor-pointer">
                          <Database className="w-4 h-4 text-purple-500" /> Define Custom Field
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}

              {mgmtView === 'custom-fields' && (
                <>
                  <Button onClick={handleAddField} className="apple-button-primary rounded-xl text-xs font-semibold h-10 px-5 text-white gap-1.5">
                    <Plus className="w-4 h-4" /> Create Custom Field
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Filter, Search and View Controls Bar */}
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between mb-6">
            <div className="flex flex-wrap items-center gap-4 flex-1">
              {mgmtView === 'categories' && (
                <>
                  <div className="flex gap-1 p-1 bg-[var(--bg-inset)] dark:bg-white/5 rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
                    <button 
                      onClick={() => setViewMode('table')}
                      className={cn("p-1.5 rounded-lg transition-all", viewMode === 'table' ? "bg-white dark:bg-[var(--bg-inset)] shadow-sm text-apple-blue dark:text-white" : "text-[var(--text-secondary)]")}
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={cn("p-1.5 rounded-lg transition-all", viewMode === 'grid' ? "bg-white dark:bg-[var(--bg-inset)] shadow-sm text-apple-blue dark:text-white" : "text-[var(--text-secondary)]")}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="relative w-full max-w-sm group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] group-focus-within:text-apple-blue transition-colors duration-300" />
                    <input 
                      type="text"
                      placeholder="Search categories..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[var(--bg-inset)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 rounded-xl text-xs font-medium focus:ring-0 outline-none transition-all duration-300 shadow-inner"
                    />
                  </div>
                </>
              )}

              {mgmtView === 'custom-fields' && (
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Category Filter</span>
                    <select 
                      className="h-10 bg-white dark:bg-[var(--bg-surface)] border border-black/[0.06] dark:border-white/[0.06] rounded-xl text-xs font-semibold px-3 w-56 outline-none"
                      value={fieldCategoryFilter}
                      onChange={(e) => setFieldCategoryFilter(e.target.value)}
                    >
                      <option value="All">All Categories</option>
                      {categories.map((c, idx) => (
                        <option key={`cat-option-${c.id}-${idx}`} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Type Filter</span>
                    <select 
                      className="h-10 bg-white dark:bg-[var(--bg-surface)] border border-black/[0.06] dark:border-white/[0.06] rounded-xl text-xs font-semibold px-3 w-48 outline-none"
                      value={fieldTypeFilter}
                      onChange={(e) => setFieldTypeFilter(e.target.value)}
                    >
                      <option value="All">All Types</option>
                      <option value="text">Text Input</option>
                      <option value="number">Number</option>
                      <option value="dropdown">Dropdown</option>
                      <option value="radio">Radio</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Search Key/Name</span>
                    <div className="relative group">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] group-focus-within:text-apple-blue transition-colors duration-300" />
                      <input 
                        type="text"
                        placeholder="Search fields..." 
                        value={fieldSearchQuery}
                        onChange={(e) => setFieldSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-[var(--bg-inset)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 rounded-xl text-xs font-medium focus:ring-0 outline-none transition-all duration-300 shadow-inner"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end">
              <Button 
                variant="outline" 
                onClick={handleRefresh} 
                className="rounded-xl border-black/[0.08] dark:border-white/[0.08] bg-white/50 dark:bg-white/5 backdrop-blur-sm text-xs font-semibold h-10 w-10 p-0"
              >
                <RefreshCcw className="w-4 h-4 text-[var(--text-secondary)] hover:text-apple-blue" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Dynamic Content Surface */}
      <div className="min-h-0">
        <AnimatePresence mode="wait">
          {mgmtView === 'editor' && editingCategory && (
            <motion.div
              key="category-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <CategoryForm 
                category={editingCategory}
                allCategories={categories}
                onSave={handleSaveCategory}
                onCancel={() => { setMgmtView('categories'); setEditingCategory(null); }}
                isLoading={isSyncing}
              />
            </motion.div>
          )}

          {mgmtView === 'categories' && (
            <motion.div 
              key={viewMode}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full"
            >
              {viewMode === 'table' ? (
                <div className="bg-white dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-black/[0.04] dark:border-white/[0.04] bg-[var(--bg-inset)]/40 dark:bg-white/[0.02]">
                        <th className="px-8 py-4.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">ID</th>
                        <th className="px-6 py-4.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Name</th>
                        <th className="px-6 py-4.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Image / Icon</th>
                        <th className="px-6 py-4.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Subcategories</th>
                        <th className="px-6 py-4.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Custom Fields</th>
                        <th className="px-6 py-4.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] text-center">Status</th>
                        <th className="px-8 py-4.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] text-right">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04] text-xs font-medium">
                      {filteredCategories.map((cat, idx) => {
                        const subCount = categories.filter(c => c.parentId === cat.id).length;
                        return (
                          <tr key={`tier-row-${cat.id}-${idx}`} className="group hover:bg-[var(--bg-inset)]/30 dark:hover:bg-white/[0.01] transition-colors cursor-pointer">
                            <td className="px-8 py-5.5 font-mono text-[11px] text-[var(--text-secondary)]">{cat.id.slice(0, 8)}</td>
                            <td className="px-6 py-5.5">
                              <div className="flex items-center gap-3">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleLevelDown(cat.id); }}
                                  className="w-7 h-7 rounded-lg bg-apple-blue/10 text-apple-blue flex items-center justify-center hover:bg-apple-blue hover:text-white transition-all transform active:scale-95"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                                <span className="font-semibold text-[var(--text-primary)] dark:text-white group-hover:text-apple-blue transition-colors text-sm">{cat.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5.5">
                              <div className="w-9 h-9 rounded-xl bg-[var(--bg-inset)] dark:bg-white/5 border border-black/[0.04] dark:border-white/[0.04] flex items-center justify-center text-lg">
                                {cat.icon || "📁"}
                              </div>
                            </td>
                            <td className="px-6 py-5.5 text-[var(--text-secondary)] font-semibold">
                              {subCount} Subcategories
                            </td>
                            <td className="px-6 py-5.5">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleViewFields(cat.id); }}
                                className="text-xs font-bold text-apple-blue hover:underline underline-offset-4"
                              >
                                Manage Fields
                              </button>
                            </td>
                            <td className="px-6 py-5.5">
                              <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  onClick={() => handleToggleStatus(cat)}
                                  className={cn(
                                    "relative w-9 h-5 rounded-full transition-colors",
                                    cat.status === 'active' ? "bg-apple-blue" : "bg-black/10 dark:bg-white/10"
                                  )}
                                >
                                  <div className={cn(
                                    "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm",
                                    cat.status === 'active' ? "translate-x-4" : "translate-x-0"
                                  )} />
                                </button>
                              </div>
                            </td>
                            <td className="px-8 py-5.5 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="w-8.5 h-8.5 rounded-lg hover:bg-apple-blue/10 hover:text-apple-blue transition-all text-[var(--text-secondary)]"
                                  onClick={() => handleEdit(cat)}
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="w-8.5 h-8.5 rounded-lg hover:bg-[var(--bg-inset)] dark:hover:bg-white/5 transition-all text-[var(--text-secondary)]"
                                  onClick={() => handleLevelDown(cat.id)}
                                >
                                  <List className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="w-8.5 h-8.5 rounded-lg hover:bg-apple-red/10 hover:text-apple-red transition-all text-[var(--text-secondary)]"
                                  onClick={() => handleDelete(cat.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredCategories.map((cat, idx) => (
                    <CategoryCard 
                      key={`grid-card-${cat.id}-${idx}`} 
                      category={cat} 
                      mode="grid" 
                      onEdit={() => handleEdit(cat)} 
                      onDelete={() => handleDelete(cat.id)}
                      onViewFields={() => handleViewFields(cat.id)}
                      onLevelDown={() => handleLevelDown(cat.id)}
                    />
                  ))}
                </div>
              )}

              {filteredCategories.length === 0 && (
                <div className="bg-white dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] p-16 text-center">
                  <div className="w-16 h-16 bg-apple-blue/10 rounded-2xl mx-auto flex items-center justify-center mb-4">
                    <Plus className="w-6 h-6 text-apple-blue" />
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] dark:text-white mb-1">No nested structural nodes</h3>
                  <p className="text-xs text-[var(--text-secondary)] mb-5">Create nested category parameters to build the navigation hierarchy.</p>
                  <Button className="apple-button-primary rounded-xl text-xs font-semibold h-9 px-4 text-white" onClick={handleAdd}>
                    Create Node
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {mgmtView === 'custom-fields' && (
            <motion.div 
              key="fields-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full flex flex-col gap-4"
            >
              <div className="bg-white dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/[0.04] dark:border-white/[0.04] bg-[var(--bg-inset)]/40 dark:bg-white/[0.02]">
                      <th className="px-8 py-4.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Type & Key</th>
                      <th className="px-6 py-4.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Display Name</th>
                      <th className="px-6 py-4.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] w-1/4">Scope / Categories</th>
                      <th className="px-6 py-4.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Attributes</th>
                      <th className="px-8 py-4.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] text-right">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04] text-xs font-medium">
                    {filteredFields.length > 0 ? (
                      filteredFields.map((field, idx) => (
                        <tr 
                          key={`field-row-${field.id}-${idx}`}
                          className="group hover:bg-[var(--bg-inset)]/30 dark:hover:bg-white/[0.01] transition-colors cursor-pointer"
                          onClick={() => handleEditField(field)}
                        >
                          <td className="px-8 py-5.5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-apple-blue/10 flex items-center justify-center text-apple-blue shrink-0">
                                {field.type === 'text' && <Type className="w-5 h-5" />}
                                {field.type === 'number' && <Hash className="w-5 h-5" />}
                                {field.type === 'dropdown' && <ChevronDown className="w-5 h-5" />}
                                {(field.type === 'radio' || field.type === 'checkbox') && <CheckSquare className="w-5 h-5" />}
                                {field.type !== 'text' && field.type !== 'number' && field.type !== 'dropdown' && field.type !== 'radio' && field.type !== 'checkbox' && <Database className="w-5 h-5" />}
                              </div>
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-apple-blue block mb-0.5">{field.type}</span>
                                <span className="text-[11px] font-mono font-bold text-[var(--text-secondary)]">{field.key}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5.5">
                            <div className="flex flex-col">
                              <span className="font-semibold text-[var(--text-primary)] dark:text-white group-hover:text-apple-blue transition-colors text-sm">{field.name}</span>
                              <span className="text-[10px] text-[var(--text-secondary)] mt-0.5">{field.groupName || 'General'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5.5">
                            <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                              {field.categoryIds?.length ? (
                                field.categoryIds.slice(0, 3).map(cid => (
                                  <span key={`field-cat-${field.id}-${cid}`} className="px-2 py-0.5 rounded border border-black/[0.04] dark:border-white/[0.04] bg-[var(--bg-inset)] dark:bg-white/5 text-[9px] font-bold text-[var(--text-secondary)] h-5 flex items-center">
                                    {categories.find(c => c.id === cid)?.name || 'Unknown'}
                                  </span>
                                ))
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-apple-blue/10 text-apple-blue text-[9px] font-bold uppercase tracking-wider">Global</span>
                              )}
                              {field.categoryIds && field.categoryIds.length > 3 && (
                                <span className="text-[9px] font-bold text-[var(--text-secondary)] self-center">+{field.categoryIds.length - 3}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5.5">
                            <div className="flex items-center gap-3">
                              <div className={cn("flex flex-col items-center gap-1", field.required ? "text-apple-red" : "text-apple-text-muted opacity-40")}>
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span className="text-[8px] font-bold uppercase tracking-tighter">Req</span>
                              </div>
                              <div className={cn("flex flex-col items-center gap-1", field.filterable ? "text-apple-blue" : "text-apple-text-muted opacity-40")}>
                                <Filter className="w-3.5 h-3.5" />
                                <span className="text-[8px] font-bold uppercase tracking-tighter">Filt</span>
                              </div>
                              <div className={cn("flex flex-col items-center gap-1", field.searchable ? "text-apple-green" : "text-apple-text-muted opacity-40")}>
                                <Search className="w-3.5 h-3.5" />
                                <span className="text-[8px] font-bold uppercase tracking-tighter">Srch</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5.5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="w-8.5 h-8.5 rounded-lg hover:bg-apple-blue/10 hover:text-apple-blue transition-all text-[var(--text-secondary)]"
                                onClick={() => handleEditField(field)}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="w-8.5 h-8.5 rounded-lg hover:bg-apple-red/10 hover:text-apple-red transition-all text-[var(--text-secondary)]"
                                onClick={() => handleDeleteField(field.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-8 py-16 text-center text-[var(--text-secondary)] font-normal">
                          <div className="flex flex-col items-center gap-2">
                            <Settings2 className="w-8 h-8 opacity-45" />
                            <span>No dynamic fields defined</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-semibold">
                <span>Showing {filteredFields.length} of {allFields.length} entries</span>
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs font-semibold">Previous</Button>
                  <Button variant="outline" size="sm" className="h-8 rounded-lg bg-apple-blue/10 text-apple-blue border-apple-blue/20 text-xs font-semibold">1</Button>
                  <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs font-semibold">Next</Button>
                </div>
              </div>
            </motion.div>
          )}

          {mgmtView === 'field-editor' && editingField && (
            <motion.div 
              key="field-editor"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <CustomFieldForm 
                field={editingField}
                allCategories={categories}
                onSave={handleSaveField}
                onCancel={() => setMgmtView('custom-fields')}
                isLoading={isSyncing}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global Publishing Footer - EXACT match layout */}
      {mgmtView !== 'editor' && (
        <div className="pt-6 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-semibold">
            <Zap className="w-4 h-4 text-apple-blue" />
            Taxonomy Engine Active & Synchronized
          </div>
          <Button 
            disabled={isDeploying}
            onClick={handleDeploy}
            className="apple-button-primary rounded-xl text-xs font-semibold h-10 px-5 text-white gap-2"
          >
            {isDeploying ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
            Deploy Global Changes
          </Button>
        </div>
      )}
    </div>
  );
}

function CategoryItem(props: { category: Category, isSelected: boolean, onSelect: () => void, onEdit: () => void, key?: any }) {
  const { category, isSelected, onSelect, onEdit } = props;
  return (
    <div 
      onClick={onSelect}
      className={cn(
        "group h-13 px-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-500",
        isSelected 
          ? "bg-apple-blue text-white shadow-xl shadow-apple-blue/30 scale-[1.02] z-10" 
          : "bg-white/40 dark:bg-white/[0.03] text-apple-text-muted hover:bg-white/80 dark:hover:bg-white/10 hover:text-apple-text border border-transparent hover:border-apple-border/50"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
          isSelected ? "bg-white/20" : "bg-apple-gray dark:bg-white/5"
        )}>
          <Folder className={cn("w-4 h-4", isSelected ? "text-white" : "text-apple-blue")} />
        </div>
        <div>
          <span className="text-xs font-bold block">{category.name}</span>
          <span className={cn("text-[8px] font-black uppercase tracking-widest opacity-60", isSelected ? "text-white/80" : "text-apple-text-muted")}>
            {category.itemCount || 0} listings
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className={cn(
            "p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all",
            isSelected ? "bg-white/20 hover:bg-white/40 text-white" : "hover:bg-apple-gray dark:hover:bg-white/10 text-apple-text-muted"
          )}
        >
          <Settings2 className="w-3.5 h-3.5" />
        </button>
        <ChevronRight className={cn("w-4 h-4 transition-transform duration-300", isSelected ? "text-white" : "text-apple-border group-hover:translate-x-1 group-hover:text-apple-text-muted")} />
      </div>
    </div>
  );
}

function CategoryCard(props: { 
  category: Category, 
  mode: ViewMode, 
  onEdit: () => void, 
  onDelete: () => void | Promise<void>,
  onViewFields: () => void,
  onLevelDown: () => void,
  key?: any
}) {
  const { category, mode, onEdit, onDelete, onViewFields, onLevelDown } = props;
  return (
    <div className={cn(
      "group relative overflow-hidden transition-all duration-500 flex flex-col",
      mode === 'grid' 
        ? "bg-white/40 dark:bg-white/[0.03] border border-apple-border/50 rounded-[32px] p-8 min-h-[300px] hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-2xl hover:shadow-apple-text/5 hover:-translate-y-2" 
        : "bg-white/40 dark:bg-white/[0.03] border border-apple-border/50 rounded-2xl p-4 flex items-center justify-between hover:bg-white/80 dark:hover:bg-white/10"
    )}>
      <div className="flex items-center gap-6 mb-6">
        <div className={cn(
          "rounded-[24px] bg-white dark:bg-black/20 flex items-center justify-center transition-all duration-700 group-hover:rotate-6 shrink-0",
          mode === 'grid' ? "w-20 h-20 shadow-xl border border-apple-border/20" : "w-12 h-12 shadow-md border border-apple-border/10"
        )}>
          {category.icon ? (
            <span className="text-3xl">{category.icon}</span>
          ) : (
            <Folder className="w-8 h-8 text-apple-blue/40" />
          )}
        </div>
        <div className="overflow-hidden">
          <h3 className={cn("font-black tracking-tight text-apple-text truncate", mode === 'grid' ? "text-2xl" : "text-lg")}>{category.name}</h3>
          <p className="text-[10px] font-black text-apple-text-muted uppercase tracking-widest mt-1 truncate">{category.slug}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-3 bg-apple-gray dark:bg-white/5 rounded-2xl border border-apple-border/5">
           <span className="text-[9px] font-black text-apple-text-muted uppercase tracking-widest block mb-1">Hierarchy</span>
           <span className="text-xs font-black text-apple-text">Level {category.level}</span>
        </div>
        <div className="p-3 bg-apple-gray dark:bg-white/5 rounded-2xl border border-apple-border/5">
           <span className="text-[9px] font-black text-apple-text-muted uppercase tracking-widest block mb-1">Listings</span>
           <span className="text-xs font-black text-apple-text">{category.itemCount || 0}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-auto">
        <button 
          onClick={onEdit}
          className="flex-1 h-12 rounded-xl bg-cyan-500 text-white font-bold text-xs uppercase tracking-widest hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
        >
          <Edit3 className="w-4 h-4" />
          Edit
        </button>
        <button 
          onClick={onDelete}
          className="w-12 h-12 rounded-xl bg-apple-red text-white flex items-center justify-center hover:bg-apple-red transition-all shadow-lg shadow-apple-red/20"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button 
          onClick={onLevelDown}
          className="w-12 h-12 rounded-xl bg-apple-text-muted text-white flex items-center justify-center hover:bg-apple-surface transition-all shadow-lg shadow-apple-text/20"
        >
          <List className="w-4 h-4" />
        </button>
      </div>

      <button 
        onClick={onViewFields}
        className="mt-4 text-center text-[10px] font-black text-cyan-600 hover:text-cyan-700 uppercase tracking-widest py-2 border-t border-apple-border/5"
      >
        Manage Dynamic Fields
      </button>
    </div>
  );
}

function NodePreview({ category, onEdit, onDelete }: { category: Category, onEdit: () => void, onDelete: () => void }) {
  return (
    <motion.div 
      key={category.id}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="space-y-12"
    >
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="w-32 h-32 rounded-[40px] bg-white dark:bg-white/5 border border-apple-border flex items-center justify-center text-6xl shadow-2xl shadow-apple-text/5">
            {category.icon || "📁"}
          </div>
          <div className="flex gap-3">
             <Button variant="outline" size="icon" className="w-12 h-12 rounded-2xl border-apple-border" onClick={onEdit}>
                <Settings2 className="w-5 h-5 text-apple-text-muted" />
             </Button>
             <Button 
               variant="outline" 
               size="icon" 
               className="w-12 h-12 rounded-2xl border-apple-border text-apple-red hover:bg-apple-red/10"
               onClick={onDelete}
             >
                <Trash2 className="w-5 h-5" />
             </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-5xl font-black tracking-tighter text-apple-text">{category.name}</h2>
          <div className="flex items-center gap-4">
            <span className="text-xs font-black text-apple-text-muted tracking-widest uppercase">System Reference: {category.id}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-apple-border" />
            <span className="text-xs font-black text-apple-blue tracking-widest uppercase">Permalink: /{category.slug}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="bg-white/50 dark:bg-white/[0.02] rounded-[32px] p-8 border border-apple-border/50">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-apple-text-muted mb-6">Structural Insights</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-apple-text-muted">Hierarchy Tier</span>
              <span className="font-black text-apple-text uppercase">Level {category.level} Node</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-apple-text-muted">Listing Density</span>
              <span className="font-black text-apple-text uppercase">{category.itemCount || 0} Entities</span>
            </div>
            <div className="flex justify-between items-center text-xs">
               <span className="font-bold text-apple-text-muted">Dynamic Fields</span>
               <span className="font-black text-apple-text uppercase">14 Active Schemas</span>
            </div>
            <div className="flex justify-between items-center text-xs">
               <span className="font-bold text-apple-text-muted">Conversion Rate</span>
               <span className="font-black text-apple-blue uppercase opacity-70">Top 15%</span>
            </div>
          </div>
        </div>

        <div className="bg-white/50 dark:bg-white/[0.02] rounded-[32px] p-8 border border-apple-border/50">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-apple-text-muted mb-6">Visibility Matrix</h4>
          <div className="space-y-4">
             <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-apple-text-muted">Landing Page</span>
                <Badge variant="outline" className="rounded-lg text-[9px] font-black uppercase">{category.showOnHomepage ? 'Published' : 'Internal'}</Badge>
             </div>
             <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-apple-text-muted">Global Search</span>
                <Badge variant="outline" className="rounded-lg text-[9px] font-black uppercase">Indexed</Badge>
             </div>
             <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-apple-text-muted">SEO Health</span>
                <div className="flex gap-1">
                   {[1,2,3,4,5].map(i => <div key={i} className={cn("w-2 h-2 rounded-full", i <= 4 ? "bg-apple-green" : "bg-apple-border")} />)}
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-apple-border/50 flex gap-4">
        <Button onClick={onEdit} className="apple-button-primary h-14 px-10 rounded-[20px] font-bold text-xs uppercase tracking-widest gap-2">
          Enter Schema Editor
          <ArrowRight className="w-4 h-4" />
        </Button>
        <Button variant="outline" className="h-14 px-8 rounded-[20px] font-black text-[10px] uppercase tracking-widest border-apple-border">
          View Live Page
          <Eye className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}
