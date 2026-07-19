import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Save, 
  Upload, 
  X,
  Plus,
  ArrowLeft,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Category } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryFormProps {
  category: Category;
  allCategories: Category[];
  onSave: (data: Category) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CategoryForm({ category, allCategories, onSave, onCancel, isLoading }: CategoryFormProps) {
  const [formData, setFormData] = useState<Category>(category);
  const [activeLang, setActiveLang] = useState('en');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    setFormData(category);
  }, [category]);

  const handleChange = (field: keyof Category, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLangChange = (field: string, value: string) => {
    const langKey = activeLang === 'en' ? field : `${field}${activeLang.charAt(0).toUpperCase()}${activeLang.slice(1)}`;
    setFormData(prev => ({
      ...prev,
      [langKey]: value
    }));
  };

  const getLangValue = (field: string) => {
    const langKey = activeLang === 'en' ? field : `${field}${activeLang.charAt(0).toUpperCase()}${activeLang.slice(1)}`;
    return (formData as any)[langKey] || '';
  };

  const handleSave = () => {
    onSave(formData);
  };

  const toggleExpand = (categoryId: string) => {
    const next = new Set(expandedCategories);
    if (next.has(categoryId)) {
      next.delete(categoryId);
    } else {
      next.add(categoryId);
    }
    setExpandedCategories(next);
  };

  const renderCategoryTree = (parentId: string | null = null, level = 0) => {
    const children = allCategories.filter(c => c.parentId === parentId && c.id !== formData.id);
    if (children.length === 0) return null;

    return (
      <div className={cn("space-y-1", level > 0 && "ml-4 border-l border-apple-border/10 pl-2")}>
        {children.map((cat, idx) => {
          const hasChildren = allCategories.some(c => c.parentId === cat.id && c.id !== formData.id);
          const isExpanded = expandedCategories.has(cat.id);
          const isSelected = formData.parentId === cat.id;

          return (
            <div key={`form-cat-${cat.id}-${idx}`} className="space-y-1">
              <div className="flex items-center gap-2 group p-1 rounded-lg hover:bg-apple-gray/50 dark:hover:bg-white/5 transition-colors">
                <button 
                  onClick={() => toggleExpand(cat.id)}
                  className={cn(
                    "w-5 h-5 flex items-center justify-center rounded transition-transform",
                    !hasChildren && "invisible"
                  )}
                >
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                
                <div 
                  onClick={() => handleChange('parentId', cat.id)}
                  className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center cursor-pointer transition-all",
                    isSelected ? "bg-apple-blue border-apple-blue shadow-lg shadow-apple-blue/20" : "border-apple-border/50 bg-white dark:bg-black/20"
                  )}
                >
                  {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>

                <span 
                  onClick={() => handleChange('parentId', cat.id)}
                  className={cn(
                    "text-xs font-medium cursor-pointer transition-colors",
                    isSelected ? "text-apple-blue font-bold" : "text-apple-text-muted"
                  )}
                >
                  {cat.name}
                </span>
              </div>
              
              {isExpanded && renderCategoryTree(cat.id, level + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-apple-text">Category Management</h1>
      </div>

      <div className="">
        <Button 
          variant="ghost" 
          onClick={onCancel}
          className="bg-[#00bcd4] hover:bg-[#00acc1] text-white rounded-md h-10 px-4 text-xs font-bold gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Categories
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-white/[0.02] border border-apple-border/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-apple-border/5 bg-gray-50/50 dark:bg-white/5">
              <h2 className="text-sm font-bold text-apple-text-muted">
                {category.id.startsWith('new_') ? 'Add Category' : 'Edit Category'}
              </h2>
            </div>

            <div className="p-8 space-y-8">
              <Tabs value={activeLang} onValueChange={setActiveLang} className="w-full">
                <TabsList className="bg-transparent h-auto p-0 gap-6 border-b rounded-none w-full justify-start border-apple-border/10">
                  {[
                    { id: 'en', label: 'English' },
                    { id: 'fr', label: 'Français' },
                    { id: 'ar', label: 'عربي' },
                    { id: 'ru', label: 'Русский' }
                  ].map(lang => (
                    <TabsTrigger 
                      key={lang.id} 
                      value={lang.id}
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-apple-blue data-[state=active]:bg-transparent data-[state=active]:text-apple-blue px-0 pb-4 text-sm font-medium transition-all"
                    >
                      {lang.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="pt-8 space-y-8">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-apple-text">
                      Name ({activeLang === 'en' ? 'English' : activeLang.charAt(0).toUpperCase() + activeLang.slice(1)})
                    </Label>
                    <Input 
                      value={getLangValue('name')}
                      onChange={(e) => handleLangChange('name', e.target.value)}
                      className="h-12 bg-white dark:bg-black/20 border-apple-border/20 rounded-lg"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-apple-text">
                      Description ({activeLang === 'en' ? 'English' : activeLang.charAt(0).toUpperCase() + activeLang.slice(1)})
                    </Label>
                    <Textarea 
                      value={getLangValue('description')}
                      onChange={(e) => handleLangChange('description', e.target.value)}
                      className="min-h-[160px] bg-white dark:bg-black/20 border-apple-border/20 rounded-lg resize-none"
                    />
                  </div>
                </div>
              </Tabs>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-apple-text">Slug (English Only)</Label>
                <Input 
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  placeholder="auto-generated if blank"
                  className="h-12 bg-white dark:bg-black/20 border-apple-border/20 rounded-lg"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-apple-text">Image</Label>
                <div className="flex bg-white dark:bg-black/20 border border-apple-border/20 rounded-lg overflow-hidden group">
                   <button className="h-12 px-6 bg-gray-100 dark:bg-white/5 border-r border-apple-border/20 text-xs font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                      Choose file
                   </button>
                   <div className="flex-1 px-4 flex items-center text-xs text-apple-text-muted">
                      No file chosen
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                <div className="flex items-center gap-3">
                  <Switch 
                    checked={formData.status === 'active'}
                    onCheckedChange={(checked) => handleChange('status', checked ? 'active' : 'disabled')}
                  />
                  <Label className="text-xs font-medium text-apple-text-muted">Active</Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch 
                    checked={!!formData.jobCategory}
                    onCheckedChange={(checked) => handleChange('jobCategory', checked)}
                  />
                  <Label className="text-xs font-medium text-apple-text-muted">Job Category</Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch 
                    checked={!!formData.priceOptional}
                    onCheckedChange={(checked) => handleChange('priceOptional', checked)}
                  />
                  <Label className="text-xs font-medium text-apple-text-muted">Price Optional</Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch 
                    checked={!!formData.isFeatured}
                    onCheckedChange={(checked) => handleChange('isFeatured', checked)}
                  />
                  <Label className="text-xs font-medium text-apple-text-muted">Featured</Label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-white/[0.02] border border-apple-border/10 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[600px]">
             <div className="px-6 py-4 border-b border-apple-border/5 bg-gray-50/50 dark:bg-white/5 flex items-center justify-between">
                <h2 className="text-sm font-bold text-apple-text-muted">Parent Category</h2>
                {formData.parentId && (
                  <button 
                    onClick={() => handleChange('parentId', null)}
                    className="text-[10px] font-bold text-rose-500 hover:rose-600"
                  >
                    Clear Parent
                  </button>
                )}
             </div>
             <ScrollArea className="flex-1 p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-2 group p-1 rounded-lg hover:bg-apple-gray/50 dark:hover:bg-white/5 transition-colors">
                    <div 
                      onClick={() => handleChange('parentId', null)}
                      className={cn(
                        "w-4 h-4 rounded-full border flex items-center justify-center cursor-pointer transition-all",
                        formData.parentId === null ? "bg-apple-blue border-apple-blue shadow-lg shadow-apple-blue/20" : "border-apple-border/50 bg-white dark:bg-black/20"
                      )}
                    >
                      {formData.parentId === null && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span onClick={() => handleChange('parentId', null)} className="text-xs font-bold cursor-pointer">Root (No Parent)</span>
                  </div>
                </div>
                {renderCategoryTree()}
             </ScrollArea>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleSave}
          disabled={isLoading}
          className="bg-[#00bcd4] hover:bg-[#00acc1] text-white rounded-md h-12 px-8 font-bold text-sm shadow-lg shadow-cyan-500/20"
        >
          {isLoading ? 'Saving...' : 'Save and Back'}
        </Button>
      </div>
    </div>
  );
}
