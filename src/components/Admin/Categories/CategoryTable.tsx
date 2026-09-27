import React, { useState, useMemo } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Edit3, 
  Trash2, 
  List, 
  MoreVertical, 
  Plus, 
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { Category } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryTableProps {
  categories: Category[];
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
  onManageFields: (cat: Category) => void;
  onToggleStatus: (cat: Category) => void;
  isLoading: boolean;
}

export default function CategoryTable({ 
  categories, 
  onEdit, 
  onDelete, 
  onManageFields, 
  onToggleStatus,
  isLoading 
}: CategoryTableProps) {
  const navigate = useNavigate();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedIds(newSet);
  };

  // Build tree data
  const renderRows = (parentId: string | null = null, level = 0) => {
    const children = categories
      .filter(c => c.parentId === parentId)
      .sort((a, b) => a.order - b.order);

    return children.flatMap((cat, idx) => {
      const isExpanded = expandedIds.has(cat.id);
      const hasChildren = categories.some(c => c.parentId === cat.id);
      
      const rows = [
        <tr 
          key={`row-${cat.id}-${level}-${idx}`} 
          className="group hover:bg-apple-gray/50 dark:hover:bg-white/5 transition-colors border-b border-apple-border/50"
        >
          <td className="p-4 font-mono text-[10px] text-apple-text-muted opacity-60">
            {cat.id.slice(0, 8)}...
          </td>
          <td className="p-4">
            <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
              {hasChildren ? (
                <button 
                  onClick={(e) => toggleExpand(cat.id, e)}
                  className="w-5 h-5 rounded flex items-center justify-center hover:bg-apple-gray dark:hover:bg-white/10 transition-colors"
                >
                  {isExpanded ? (
                    <div className="w-3.5 h-3.5 border border-apple-text-muted/30 rounded flex items-center justify-center text-[10px] font-black group-hover:border-apple-blue transition-colors">−</div>
                  ) : (
                    <div className="w-3.5 h-3.5 border border-apple-text-muted/30 rounded flex items-center justify-center text-[10px] font-black group-hover:border-apple-blue transition-colors">+</div>
                  )}
                </button>
              ) : (
                <div className="w-5" />
              )}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-apple-gray dark:bg-white/10 flex items-center justify-center overflow-hidden">
                   {cat.icon && cat.icon.trim().startsWith('<svg') && !cat.icon.toLowerCase().includes('<script') ? (
                     <div dangerouslySetInnerHTML={{ __html: cat.icon.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '').replace(/\son\w+="[^"]*"/gi, '') }} className="w-4 h-4" />
                   ) : (
                     <ImageIcon className="w-4 h-4 text-apple-text-muted opacity-40" />
                   )}
                </div>
                <span className="font-bold text-sm tracking-tight">{cat.name}</span>
              </div>
            </div>
          </td>
          <td className="p-4">
            <div className="w-10 h-10 rounded-xl bg-apple-gray/50 dark:bg-white/10 border border-apple-border/50 overflow-hidden">
              {cat.thumbnail ? (
                <img src={cat.thumbnail} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-apple-text-muted opacity-20" />
                </div>
              )}
            </div>
          </td>
          <td className="p-4">
            <button 
              className="px-3 py-1 rounded-full bg-apple-blue/5 text-apple-blue font-bold text-[11px] hover:bg-apple-blue/10 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(cat.id, e);
              }}
            >
              {categories.filter(c => c.parentId === cat.id).length} Sub
            </button>
          </td>
          <td className="p-4 text-center">
            <button 
              className="px-3 py-1 rounded-full bg-apple-orange/5 text-apple-orange font-bold text-[11px] hover:bg-apple-orange/10 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/custom-fields?categoryId=${cat.id}`);
              }}
            >
              Fields
            </button>
          </td>
          <td className="p-4 text-center font-bold text-[12px]">
            {cat.itemCount || 0}
          </td>
          <td className="p-4">
            <div className="flex justify-center">
              <button 
                onClick={() => onToggleStatus(cat)}
                className={cn(
                  "w-10 h-5 rounded-full relative p-1 transition-all",
                  cat.status === 'active' ? "bg-apple-blue" : "bg-apple-border"
                )}
              >
                <motion.div 
                  layout
                  className={cn(
                    "w-3 h-3 bg-white rounded-full",
                    cat.status === 'active' ? "ml-auto" : "ml-0"
                  )}
                />
              </button>
            </div>
          </td>
          <td className="p-4">
            <div className="flex items-center justify-end gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full text-apple-blue hover:bg-apple-blue/5"
                onClick={() => onEdit(cat)}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full text-apple-red hover:bg-apple-red/5"
                onClick={() => onDelete(cat)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center transition-colors hover:bg-apple-gray/50 dark:hover:bg-white/10 text-apple-text-muted"
                )}>
                  <MoreVertical className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2">
                  <DropdownMenuItem className="rounded-xl font-bold text-xs gap-2" onClick={() => onManageFields(cat)}>
                    <List className="w-4 h-4" />
                    Custom Fields
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="rounded-xl font-bold text-xs gap-2 text-apple-red">
                    <Trash2 className="w-4 h-4" />
                    Delete Segment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </td>
        </tr>
      ];

      if (isExpanded) {
        rows.push(...renderRows(cat.id, level + 1));
      }

      return rows;
    });
  };

  // Render Mobile Cards (<768px, Never horizontal-scroll desktop table)
  const renderMobileCards = (parentId: string | null = null, level = 0): React.ReactNode[] => {
    const children = categories
      .filter(c => c.parentId === parentId)
      .sort((a, b) => a.order - b.order);

    return children.flatMap((cat) => {
      const isExpanded = expandedIds.has(cat.id);
      const subCats = categories.filter(c => c.parentId === cat.id);
      const hasChildren = subCats.length > 0;

      const card = (
        <div 
          key={`mobile-card-${cat.id}-${level}`}
          className={cn(
            "p-4 rounded-2xl bg-white dark:bg-white/5 border border-apple-border/50 shadow-xs space-y-3",
            level > 0 && "ml-3.5 border-l-2 border-l-apple-blue/50"
          )}
        >
          {/* Header: Icon, Name & Status */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-apple-gray dark:bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                {cat.icon && cat.icon.trim().startsWith('<svg') && !cat.icon.toLowerCase().includes('<script') ? (
                  <div dangerouslySetInnerHTML={{ __html: cat.icon.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '').replace(/\son\w+="[^"]*"/gi, '') }} className="w-4 h-4" />
                ) : (
                  <ImageIcon className="w-4 h-4 text-apple-text-muted opacity-40" />
                )}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm tracking-tight text-[#1D1D1F] dark:text-white truncate">{cat.name}</h4>
                <span className="font-mono text-[9px] text-apple-text-muted block opacity-70 truncate">{cat.id}</span>
              </div>
            </div>
            
            <button
              onClick={() => onToggleStatus(cat)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer touch-target min-h-[32px] flex items-center gap-1 shrink-0",
                cat.status === 'active' 
                  ? "bg-apple-green/10 text-apple-green border border-apple-green/20" 
                  : "bg-apple-red/10 text-apple-red border border-apple-red/20"
              )}
            >
              {cat.status === 'active' ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Active</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3" />
                  <span>Disabled</span>
                </>
              )}
            </button>
          </div>

          {/* Details Row: Subcategories & Fields */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {hasChildren && (
              <button
                onClick={(e) => toggleExpand(cat.id, e)}
                className="px-3 py-1.5 rounded-xl bg-apple-blue/10 text-apple-blue font-bold text-[11px] flex items-center gap-1.5 touch-target min-h-[36px] cursor-pointer"
              >
                <span>{subCats.length} Subcategories</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isExpanded ? "rotate-180" : "")} />
              </button>
            )}
            <button
              onClick={() => navigate(`/admin/custom-fields?categoryId=${cat.id}`)}
              className="px-3 py-1.5 rounded-xl bg-apple-orange/10 text-apple-orange font-bold text-[11px] flex items-center gap-1 touch-target min-h-[36px] cursor-pointer"
            >
              <span>Manage Fields</span>
            </button>
          </div>

          {/* Action Row */}
          <div className="pt-2 border-t border-apple-border/40 flex items-center justify-end gap-2">
            <button
              onClick={() => onEdit(cat)}
              className="px-3 py-1.5 rounded-xl bg-apple-gray dark:bg-white/10 text-apple-text hover:text-apple-blue font-bold text-xs flex items-center gap-1 touch-target min-h-[40px] cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => onDelete(cat)}
              className="px-3 py-1.5 rounded-xl bg-apple-red/10 text-apple-red hover:bg-apple-red/20 font-bold text-xs flex items-center gap-1 touch-target min-h-[40px] cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>

          {/* Expanded Nested Subcategories */}
          {isExpanded && (
            <div className="space-y-2 pt-2 border-t border-dashed border-apple-border/50">
              {renderMobileCards(cat.id, level + 1)}
            </div>
          )}
        </div>
      );

      return [card];
    });
  };

  return (
    <div className="bg-white dark:bg-white/5 rounded-3xl border border-apple-border/50 overflow-hidden shadow-sm">
      {/* 1. Desktop & Tablet Full Table (>=768px) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-apple-gray/50 dark:bg-white/5 border-b border-apple-border/50">
            <tr>
              <th className="p-5 font-black text-[10px] uppercase tracking-[0.2em] text-apple-text-muted">ID</th>
              <th className="p-5 font-black text-[10px] uppercase tracking-[0.2em] text-apple-text-muted">Name</th>
              <th className="p-5 font-black text-[10px] uppercase tracking-[0.2em] text-apple-text-muted">Icon</th>
              <th className="p-5 font-black text-[10px] uppercase tracking-[0.2em] text-apple-text-muted">Subcategories</th>
              <th className="p-5 font-black text-[10px] uppercase tracking-[0.2em] text-apple-text-muted">Fields</th>
              <th className="p-5 font-black text-[10px] uppercase tracking-[0.2em] text-apple-text-muted">Listings</th>
              <th className="p-5 font-black text-[10px] uppercase tracking-[0.2em] text-apple-text-muted text-center">Status</th>
              <th className="p-5 font-black text-[10px] uppercase tracking-[0.2em] text-apple-text-muted text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-apple-border/50">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="p-5">
                      <div className="h-4 bg-apple-gray dark:bg-white/10 rounded-full w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-20 text-center">
                  <div className="flex flex-col items-center justify-center opacity-40">
                    <AlertTriangle className="w-12 h-12 mb-4" />
                    <p className="text-sm font-bold tracking-tight">No taxonomy data found in this matrix.</p>
                  </div>
                </td>
              </tr>
            ) : (
              renderRows()
            )}
          </tbody>
        </table>
      </div>

      {/* 2. Mobile Card Conversion (<768px, Never Horizontal Scroll) */}
      <div className="md:hidden p-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 rounded-2xl bg-apple-gray/40 dark:bg-white/5 border border-apple-border/50 animate-pulse space-y-3">
              <div className="h-5 bg-apple-border/60 rounded-full w-1/2" />
              <div className="h-4 bg-apple-border/40 rounded-full w-3/4" />
            </div>
          ))
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle className="w-10 h-10 mb-3 mx-auto text-apple-text-muted opacity-40" />
            <p className="text-xs font-bold text-apple-text-muted">No taxonomy data found in this matrix.</p>
          </div>
        ) : (
          renderMobileCards()
        )}
      </div>
      
      <div className="p-6 border-t border-apple-border/50 flex flex-col md:flex-row items-center justify-between gap-4 bg-apple-gray/20 dark:bg-white/[0.02]">
        <div className="text-[11px] font-bold text-apple-text-muted uppercase tracking-widest">
          Showing 1 to {categories.length} of {categories.length} segments
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9 px-4 rounded-xl font-bold text-xs" disabled>Previous</Button>
          <div className="flex items-center gap-1">
            <Button className="h-9 w-9 p-0 rounded-xl font-bold bg-apple-blue text-white shadow-sm shadow-apple-blue/20">1</Button>
          </div>
          <Button variant="outline" className="h-9 px-4 rounded-xl font-bold text-xs" disabled>Next</Button>
        </div>
      </div>
    </div>
  );
}
