import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Globe, 
  Layers, 
  Megaphone,
  Search,
  ExternalLink,
  ChevronRight,
  MoreVertical,
  GripVertical,
  Upload,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { bannerService } from "@/services/bannerService";
import { categoryAdminService } from "@/services/categoryAdminService";
import { Banner, Category } from "@/types";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Banner>>({
    type: 'external',
    name: '',
    image: '',
    status: 'active',
    displayOrder: 0,
    country: '',
    state: '',
    city: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const unsubscribeBanners = bannerService.subscribeToBanners(setBanners);
    
    // Fetch categories for dropdown
    categoryAdminService.getAllCategories().then(setCategories).catch(err => {
      console.error('Error fetching categories:', err);
    }).finally(() => setIsLoading(false));

    return () => unsubscribeBanners();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Creative asset must be less than 10MB');
      return;
    }

    const toastId = toast.loading('Uploading banner creative asset to Storage CDN...');
    try {
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storageRef = ref(storage, `banners/banner_${Date.now()}_${cleanName}`);
      await uploadBytes(storageRef, file, { contentType: file.type || 'image/jpeg' });
      const cdnUrl = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, image: cdnUrl }));
      setImageError(false);
      toast.success('Asset uploaded to CDN Storage successfully', { id: toastId });
    } catch (uploadErr: any) {
      console.error('Storage upload error for banner:', uploadErr);
      toast.error(uploadErr.message || 'Failed to upload creative to Storage', { id: toastId });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.image) {
      toast.error('Name and Image are required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (formData.id) {
        await bannerService.updateBanner(formData.id, formData);
        toast.success('Banner updated successfully');
      } else {
        await bannerService.createBanner({
          ...formData as any,
          displayOrder: banners.length
        });
        toast.success('Banner created successfully');
      }
      resetForm();
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('Failed to save banner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'external',
      name: '',
      image: '',
      status: 'active',
      displayOrder: 0,
      country: '',
      state: '',
      city: ''
    });
    setImageError(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      await bannerService.deleteBanner(id);
      toast.success('Banner deleted');
    } catch (err) {
      toast.error('Failed to delete banner');
    }
  };

  const filteredBanners = banners.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Unified Admin Header - EXACT layout and sizing match */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-7 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-apple-blue uppercase tracking-[0.18em]">
            <Megaphone className="w-3.5 h-3.5" />
            Media & Graphics Shard
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)] dark:text-white leading-tight">
            Banner Management
          </h1>
          <p className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-secondary)] mt-1 max-w-xl leading-relaxed font-normal tracking-wide">
            Deploy promotional assets, organize home screen sliders, and customize geo-targeted graphics campaigns.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start md:self-end">
          <Badge className="rounded-lg h-8 px-3 text-[10px] font-bold uppercase tracking-wider bg-[var(--bg-inset)] dark:bg-white/5 text-[var(--text-secondary)] border-none shadow-sm">
            {banners.length} Active Nodes
          </Badge>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Panel: Creator Workspace */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-[450px] shrink-0"
        >
          <div className="bg-white dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300 p-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-apple-blue/10 rounded-2xl flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-apple-blue" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-apple-text dark:text-apple-gray">
                {formData.id ? 'Edit Banner' : 'Create Banner'}
              </h2>
              <p className="text-apple-text-muted text-xs">
                Configure your promotional canvas with high-precision targeting.
              </p>
            </div>
            
            <div className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Image Pipeline */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">Banner Asset</label>
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] font-black uppercase tracking-widest text-apple-blue hover:underline flex items-center gap-1.5"
                  >
                    <Upload className="w-3 h-3" />
                    Upload Image
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                
                <div className="group relative">
                  <div className={cn(
                    "w-full aspect-[21/9] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all duration-500 overflow-hidden",
                    formData.image && !imageError ? "border-transparent" : "border-apple-border dark:border-apple-surface bg-apple-surface dark:bg-apple-text"
                  )}>
                    {formData.image && !imageError ? (
                      <>
                        <img 
                          src={formData.image} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          onError={() => setImageError(true)}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button 
                            type="button"
                            variant="secondary"
                            className="rounded-full h-10 w-10 p-0 bg-white/20 backdrop-blur-md border-white/20 text-white hover:bg-white hover:text-black"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="w-4 h-4" />
                          </Button>
                          <Button 
                            type="button"
                            variant="secondary"
                            className="rounded-full h-10 w-10 p-0 bg-white/20 backdrop-blur-md border-white/20 text-white hover:bg-red-500 hover:border-red-500"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, image: '' }));
                              setImageError(false);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-3 p-4 text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-12 h-12 bg-apple-gray dark:bg-apple-surface rounded-2xl flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-apple-text-muted" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-apple-text-muted dark:text-apple-text-muted">
                            {imageError ? 'Invalid format/URL' : 'Drop creative asset or click to upload'}
                          </p>
                          <p className="text-[10px] text-apple-text-muted mt-1">Recommended: 21:9 ratio</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <LinkIcon className="w-3.5 h-3.5 text-apple-text-muted" />
                  </div>
                  <Input 
                    placeholder="Or paste external URL..." 
                    value={formData.image && !formData.image.startsWith('data:') ? formData.image : ''}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, image: e.target.value }));
                      setImageError(false);
                    }}
                    className="pl-10 h-11 rounded-xl bg-apple-surface dark:bg-apple-text border-apple-border dark:border-apple-surface"
                  />
                </div>
              </div>

              {/* Identity & Logic */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">Creative Name</label>
                  <Input 
                    placeholder="E.g. Summer Collection 2024" 
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="h-12 rounded-xl bg-apple-surface dark:bg-apple-text border-apple-border dark:border-apple-surface"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">Interaction Type</label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(v: any) => setFormData(prev => ({ ...prev, type: v, targetId: '', externalLink: '' }))}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-apple-border dark:border-apple-surface">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="advertisement">Advertisement</SelectItem>
                        <SelectItem value="external">External Link</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">Status</label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(v: any) => setFormData(prev => ({ ...prev, status: v }))}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-apple-border dark:border-apple-surface">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Conditional Destination Select */}
                <AnimatePresence mode="wait">
                  {formData.type === 'category' && (
                    <motion.div 
                      key="category"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">Target Category</label>
                      <Select 
                        value={formData.targetId} 
                        onValueChange={(v) => setFormData(prev => ({ ...prev, targetId: v }))}
                      >
                        <SelectTrigger className="h-12 rounded-xl border-apple-border dark:border-apple-surface">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}

                  {formData.type === 'external' && (
                    <motion.div 
                      key="external"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">Destination URL</label>
                      <Input 
                        placeholder="https://example.com" 
                        value={formData.externalLink}
                        onChange={(e) => setFormData(prev => ({ ...prev, externalLink: e.target.value }))}
                        className="h-12 rounded-xl border-apple-border dark:border-apple-surface"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Geo-Targeting */}
                <div className="p-4 rounded-2xl bg-apple-surface dark:bg-apple-text/50 border border-apple-border dark:border-apple-surface space-y-4">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-apple-text-muted" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">Geo-Targeting Engine</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <Input 
                      placeholder="Country" 
                      value={formData.country}
                      onChange={(e) => setFormData(p => ({ ...p, country: e.target.value }))}
                      className="h-10 rounded-xl border-transparent focus:border-apple-border bg-white dark:bg-apple-text"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input 
                        placeholder="State" 
                        value={formData.state}
                        onChange={(e) => setFormData(p => ({ ...p, state: e.target.value }))}
                        className="h-10 rounded-xl border-transparent focus:border-apple-border bg-white dark:bg-apple-text"
                      />
                      <Input 
                        placeholder="City" 
                        value={formData.city}
                        onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
                        className="h-10 rounded-xl border-transparent focus:border-apple-border bg-white dark:bg-apple-text"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 h-14 rounded-2xl bg-apple-blue hover:bg-apple-blue-hover text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-apple-blue/20"
                >
                  {isSubmitting ? 'Protocol Executing...' : formData.id ? 'Update Strategy' : 'Deploy Creative'}
                </Button>
                {formData.id && (
                  <Button 
                    type="button"
                    variant="outline"
                    className="h-14 w-14 p-0 rounded-2xl border-apple-border dark:border-apple-surface"
                    onClick={resetForm}
                  >
                    <X className="w-5 h-5 text-apple-text-muted" />
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </motion.div>

        {/* Right Panel: Deployment Terminal */}
        <div className="flex-1 space-y-6">
          {/* Search bar for banners */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative group min-w-[200px] sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] group-focus-within:text-apple-blue transition-colors duration-300" />
              <input 
                type="text"
                placeholder="Search creative..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--bg-inset)] dark:bg-white/5 border border-transparent focus:border-apple-blue/30 rounded-xl text-xs font-medium focus:ring-0 outline-none transition-all duration-300 shadow-inner"
              />
            </div>
          </div>

        {/* Banners Grid/Table */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredBanners.map((banner, index) => (
                <motion.div
                  key={banner.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative"
                >
                  <div className="bg-white dark:bg-[var(--bg-surface)] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.015)] transition-all duration-300 group">
                    <div className="aspect-[21/9] relative overflow-hidden">
                      <img 
                        src={banner.image} 
                        alt={banner.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                        <div className="flex justify-between items-center">
                          <div className="space-y-1">
                            <Badge variant="secondary" className={cn(
                              "text-[9px] font-black uppercase tracking-widest h-5 px-1.5 border-none",
                              banner.type === 'category' ? "bg-purple-500 text-white" : 
                              banner.type === 'advertisement' ? "bg-orange-500 text-white" : 
                              "bg-apple-blue text-white"
                            )}>
                              {banner.type}
                            </Badge>
                            <h3 className="text-white font-bold tracking-tight truncate max-w-[200px]">{banner.name}</h3>
                          </div>
                          <div className="flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                            <Button 
                              variant="secondary" 
                              className="h-10 w-10 p-0 rounded-xl bg-white/20 backdrop-blur-md border-white/20 text-white hover:bg-white hover:text-black"
                              onClick={() => {
                                setFormData(banner);
                                setImageError(false);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              className="h-10 w-10 p-0 rounded-xl bg-red-500/20 backdrop-blur-md border-red-500/20 text-white hover:bg-red-500"
                              onClick={() => handleDelete(banner.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="absolute top-4 right-4 flex gap-2">
                        {banner.status === 'active' ? (
                          <Badge className="bg-apple-green/10 text-apple-green border-none rounded-lg text-[9px] font-black uppercase">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="text-apple-text-muted border-apple-border dark:border-apple-surface rounded-lg text-[9px] font-black uppercase">Inactive</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5 text-apple-text-muted">
                          <GripVertical className="w-4 h-4" />
                          <span className="font-mono">#{banner.displayOrder}</span>
                        </div>
                        {banner.country && (
                          <div className="flex items-center gap-1.5 text-apple-text-muted">
                            <Globe className="w-3.5 h-3.5" />
                            <span>{banner.country}</span>
                          </div>
                        )}
                        {banner.externalLink && (
                          <div className="flex items-center gap-1.5 text-apple-blue">
                            <LinkIcon className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[150px]">{banner.externalLink}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredBanners.length === 0 && !isLoading && (
              <div className="col-span-full py-24 text-center">
                <div className="w-20 h-20 bg-apple-surface dark:bg-apple-text rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Megaphone className="w-8 h-8 text-apple-border" />
                </div>
                <h3 className="text-xl font-bold text-apple-text-muted">The stage is empty.</h3>
                <p className="text-apple-text-muted mt-2">Start by creating your first promotional narrative.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  </div>
  );
}

