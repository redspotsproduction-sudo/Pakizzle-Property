import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  RefreshCcw, 
  Sliders, 
  Car, 
  Layers, 
  Eye, 
  EyeOff, 
  Sparkles,
  Info,
  CheckCircle,
  Hash,
  UploadCloud
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
import { popularStylesService, BODY_STYLE_PRESETS } from "@/services/popularStylesService";
import { PopularStyle } from "@/types";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function PopularVehicleStylesManagement() {
  const [styles, setStyles] = useState<PopularStyle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // File Upload State & Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<PopularStyle>>({
    name: '',
    iconPreset: 'suv',
    imageUrl: '',
    customSvgPath: '',
    filterKey: 'bodyType',
    filterValue: '',
    order: 0,
    status: 'active'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Load all styles
  const fetchStyles = async () => {
    setIsLoading(true);
    try {
      const data = await popularStylesService.getAll();
      setStyles(data);
    } catch (error) {
      console.error("Error fetching popular styles:", error);
      toast.error("Failed to load vehicle styles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStyles();
  }, []);

  // Sync filterValue automatically based on name or preset to assist the admin
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => {
      const next: Partial<PopularStyle> = { ...prev, name: value };
      // Auto-fill filterValue if it is currently empty or matches the old name
      if (!prev.filterValue || prev.filterValue === prev.name) {
        next.filterValue = value;
      }
      return next;
    });
  };

  // Preset Selection Auto Setup
  const handlePresetSelect = (preset: string) => {
    setFormData(prev => {
      const next: Partial<PopularStyle> = { ...prev, iconPreset: preset };
      
      // Auto-fill name if name is empty
      if (!prev.name && BODY_STYLE_PRESETS[preset]) {
        next.name = BODY_STYLE_PRESETS[preset].name;
        // Auto fill filterValue as well
        if (!prev.filterValue) {
          next.filterValue = BODY_STYLE_PRESETS[preset].name;
        }
      }
      return next;
    });
  };

  const handleFileUpload = async (file: File) => {
    setIsUploadingImage(true);
    toast.loading("Optimizing image and converting to AVIF...", { id: "uploading-style-img" });
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);
      
      const response = await fetch('/api/utils/optimize-to-avif', {
        method: 'POST',
        body: uploadFormData
      });
      
      if (response.ok) {
        const resJson = await response.json();
        if (resJson.success && resJson.dataUrl) {
          setFormData(prev => ({ 
            ...prev, 
            imageUrl: resJson.dataUrl,
            customSvgPath: '' 
          }));
          toast.success(`Success! Image optimized using AVIF format (Reduced size: ${resJson.reduction})`, { id: "uploading-style-img" });
          return;
        }
      }
      
      // Fallback: Read locally as Base64 in case of backend optimization error
      throw new Error("API failed to optimize");
    } catch (err) {
      console.warn("API optimization failed or offline, reading as raw base64 instead...", err);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setFormData(prev => ({ 
            ...prev, 
            imageUrl: e.target!.result as string,
            customSvgPath: '' 
          }));
          toast.success("Image loaded successfully (Local Base64 fallback used)", { id: "uploading-style-img" });
        } else {
          toast.error("Failed to read the local image file", { id: "uploading-style-img" });
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("Only images can be uploaded for style graphics.");
        return;
      }
      handleFileUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFileUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Style name is required');
      return;
    }
    if (!formData.filterValue) {
      toast.error('Filter Value is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const stylePayload = {
        name: formData.name,
        iconPreset: formData.iconPreset || 'suv',
        imageUrl: formData.imageUrl || '',
        customSvgPath: formData.customSvgPath || '',
        filterKey: formData.filterKey || 'bodyType',
        filterValue: formData.filterValue,
        order: Number(formData.order) || 0,
        status: formData.status as 'active' | 'hidden' || 'active'
      };

      if (formData.id) {
        await popularStylesService.update(formData.id, stylePayload);
        toast.success('Vehicle style updated successfully');
      } else {
        await popularStylesService.create(stylePayload);
        toast.success('New vehicle style created successfully');
      }
      resetForm();
      fetchStyles();
    } catch (error) {
      console.error('Error saving popular style:', error);
      toast.error('Failed to save vehicle style');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (style: PopularStyle) => {
    setFormData({
      id: style.id,
      name: style.name,
      iconPreset: style.iconPreset,
      imageUrl: style.imageUrl || '',
      customSvgPath: style.customSvgPath || '',
      filterKey: style.filterKey || 'bodyType',
      filterValue: style.filterValue,
      order: style.order,
      status: style.status
    });
    toast.info(`Editing style: ${style.name}`);
  };

  const handleToggleStatus = async (style: PopularStyle) => {
    const nextStatus = style.status === 'active' ? 'hidden' : 'active';
    try {
      await popularStylesService.update(style.id, { status: nextStatus });
      toast.success(`${style.name} is now ${nextStatus}`);
      fetchStyles();
    } catch (err) {
      toast.error("Failed to toggle status");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? Customers won't see it on the homepage.`)) return;
    try {
      await popularStylesService.delete(id);
      toast.success(`Deleted ${name}`);
      fetchStyles();
    } catch (err) {
      toast.error('Failed to delete popular style');
    }
  };

  const handleResetToPresets = async () => {
    if (!confirm("WARNING: This will delete ALL current entries and reset them back to the original Carvana pristine style templates. Do you wish to proceed?")) return;
    setIsResetting(true);
    try {
      await popularStylesService.resetToDefaults();
      toast.success("Successfully reset database to pristine Carvana styles");
      resetForm();
      fetchStyles();
    } catch (e) {
      console.error("Reset failed:", e);
      toast.error("Reset encountered an error");
    } finally {
      setIsResetting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      iconPreset: 'suv',
      imageUrl: '',
      customSvgPath: '',
      filterKey: 'bodyType',
      filterValue: '',
      order: styles.length + 1,
      status: 'active'
    });
  };

  // Preview the active icon preset or custom svg path
  const renderFormPreview = () => {
    if (formData.imageUrl) {
      return (
        <div className="w-24 h-16 border border-apple-border/40 bg-apple-gray/20 dark:bg-zinc-800/40 flex flex-col items-center justify-end p-2 rounded-xl">
          <span className="text-[10px] font-bold text-apple-text mb-1 truncate max-w-full">
            {formData.name || "Preview"}
          </span>
          <img 
            src={formData.imageUrl} 
            alt="Preview" 
            className="w-full h-auto max-h-[30px] object-contain" 
            referrerPolicy="no-referrer"
            onError={() => toast.error("Invalid image URL provided")}
          />
        </div>
      );
    }

    let path = formData.customSvgPath || '';
    if (!path && formData.iconPreset) {
      path = BODY_STYLE_PRESETS[formData.iconPreset.toLowerCase()]?.svgPath || '';
    }

    return (
      <div className="w-24 h-16 border border-apple-border/40 bg-apple-gray/20 dark:bg-zinc-800/40 flex flex-col items-center justify-end p-2 rounded-xl">
        <span className="text-[10px] font-bold text-apple-text mb-1 truncate max-w-full">
          {formData.name || "Preview"}
        </span>
        <svg 
          viewBox="0 0 24 24" 
          className="w-12 h-6 text-apple-blue stroke-current fill-none"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={path || "M2 15h3l1.5-4h11L19 15h3v3h-20z"} />
        </svg>
      </div>
    );
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 py-4 animate-in fade-in duration-500">
      
      {/* Left Workspace Panel Form */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full xl:w-[460px] shrink-0"
      >
        <Card className="border-none shadow-apple-soft dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] bg-white/80 dark:bg-[#1D1D1F]/80 backdrop-blur-xl overflow-hidden rounded-3xl">
          <CardHeader className="p-8 pb-5 border-b border-apple-border/20">
            <div className="w-12 h-12 bg-apple-blue/10 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-apple-blue" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-apple-text">
              {formData.id ? 'Edit Style Config' : 'Create Body Style'}
            </CardTitle>
            <CardDescription className="text-apple-text-muted text-sm mt-1">
              Assemble, style, and fine-tune Carvana-inspired body style showcase with precision.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8 pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Profile Visual Simulator */}
              <div className="rounded-2xl bg-apple-gray/40 dark:bg-zinc-800/20 p-5 flex items-center gap-5 border border-apple-border/10 justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-apple-text">Style Simulator</h4>
                  <p className="text-[11px] text-apple-text-muted mt-1 max-w-[240px]">This represents the live Carvana-style rendering on the home dashboard.</p>
                </div>
                {renderFormPreview()}
              </div>

              {/* Basic Meta fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-apple-text">Public Name</label>
                  <Input 
                    placeholder="e.g., Compact SUV, Midsize Sedan..." 
                    value={formData.name || ''} 
                    onChange={handleNameChange}
                    className="rounded-xl border-apple-border/40 focus-visible:ring-apple-blue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text">Preset Vector</label>
                    <Select value={formData.iconPreset} onValueChange={handlePresetSelect}>
                      <SelectTrigger className="rounded-xl border-apple-border/40 focus:ring-apple-blue bg-white dark:bg-zinc-900">
                        <SelectValue placeholder="Preset Car Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(BODY_STYLE_PRESETS).map(key => (
                          <SelectItem key={key} value={key} className="capitalize">
                            {key} Template
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom Svg/Image</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text">Display Order</label>
                    <Input 
                      type="number"
                      placeholder="e.g., 1, 2" 
                      value={formData.order !== undefined ? formData.order : ''} 
                      onChange={e => setFormData(prev => ({ ...prev, order: Number(e.target.value) }))}
                      className="rounded-xl border-apple-border/40 focus-visible:ring-apple-blue"
                    />
                  </div>
                </div>
              </div>

              {/* Data Pipeline / Query Mapping */}
              <div className="space-y-4 pt-1 border-t border-apple-border/10">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-apple-blue">
                  <Sliders className="w-3.5 h-3.5" />
                  Market Filter Rules
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text">Query Key</label>
                    <Input 
                      placeholder="bodyType" 
                      value={formData.filterKey || 'bodyType'} 
                      onChange={e => setFormData(prev => ({ ...prev, filterKey: e.target.value }))}
                      className="rounded-xl border-apple-border/40 font-mono text-xs focus-visible:ring-apple-blue"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-apple-text">Query Value</label>
                    <Input 
                      placeholder="e.g., SUV, Sedan" 
                      value={formData.filterValue || ''} 
                      onChange={e => setFormData(prev => ({ ...prev, filterValue: e.target.value }))}
                      className="rounded-xl border-apple-border/40 font-mono text-xs focus-visible:ring-apple-blue"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-apple-text">Visibility Status</label>
                  <Select value={formData.status} onValueChange={val => setFormData(prev => ({ ...prev, status: val as 'active' | 'hidden' }))}>
                    <SelectTrigger className="rounded-xl border-apple-border/40 focus:ring-apple-blue bg-white dark:bg-zinc-900">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active (On Main Board)</SelectItem>
                      <SelectItem value="hidden">Hidden (Archived)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

               {/* Advanced Custom Pipeline SVG / PNG */}
              <div className="space-y-4 pt-1 border-t border-apple-border/10">
                <label className="text-[10px] font-black uppercase tracking-widest text-apple-text flex items-center justify-between">
                  <span>Custom Graphics Payload</span>
                  <Badge variant="outline" className="text-[9px] uppercase tracking-normal">Direct Upload</Badge>
                </label>

                {/* Highly Polished Drag & Drop/Click Upload Area */}
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center min-h-[140px]",
                    isDragActive 
                      ? "border-apple-blue bg-apple-blue/5 scale-[0.99] shadow-inner" 
                      : "border-apple-border hover:border-apple-blue/60 hover:bg-apple-gray/5 dark:border-white/10 dark:hover:bg-zinc-800/20"
                  )}
                >
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  {isUploadingImage ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-apple-blue border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-bold text-apple-blue animate-pulse">Running AVIF compression...</p>
                    </div>
                  ) : formData.imageUrl ? (
                    <div className="flex flex-col items-center gap-2 w-full">
                      <img 
                        src={formData.imageUrl} 
                        alt="Uploaded profile" 
                        className="h-[55px] object-contain mb-1 transition-transform" 
                      />
                      <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Uploaded & optimized. Click to drop a new image.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-apple-gray dark:bg-zinc-800 flex items-center justify-center mb-3 text-apple-text-muted group-hover:text-apple-blue transition-colors">
                        <UploadCloud className="w-5 h-5 text-apple-text-muted" />
                      </div>
                      <p className="text-xs font-semibold text-apple-text">Drag vehicle style image here</p>
                      <p className="text-[10px] text-apple-text-muted mt-1">or click to browse your computer (PNG/JPG)</p>
                    </div>
                  )}
                </div>
                
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-apple-border/10"></div>
                  <span className="flex-shrink mx-3 text-[10px] font-bold text-apple-text-muted uppercase tracking-widest">Or fallback methods</span>
                  <div className="flex-grow border-t border-apple-border/10"></div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] text-apple-text-muted font-bold">Paste Direct Photographic Asset URL</label>
                  <Input 
                    placeholder="https://images.unsplash.com/... or raw image URL" 
                    value={formData.imageUrl || ''} 
                    onChange={e => setFormData(prev => ({ ...prev, imageUrl: e.target.value, customSvgPath: '' }))}
                    className="rounded-xl border-apple-border/40 text-xs focus-visible:ring-apple-blue font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] text-apple-text-muted font-bold">Raw Vector SVG Path (Fallback Outline)</label>
                  <textarea 
                    placeholder="e.g., M2 15h3l1.5-4h11L19 15h3v3h-20z" 
                    value={formData.customSvgPath || ''} 
                    onChange={e => setFormData(prev => ({ ...prev, customSvgPath: e.target.value, imageUrl: '' }))}
                    rows={2}
                    className="w-full text-xs font-mono rounded-xl border border-apple-border/40 bg-transparent p-3 focus:outline-none focus:ring-2 focus:ring-apple-blue text-apple-text"
                  />
                </div>
              </div>

              {/* Form Operations Buttons */}
              <div className="flex gap-3 pt-4 justify-between border-t border-apple-border/10">
                {formData.id && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm}
                    className="rounded-xl h-11 text-xs uppercase tracking-wider font-extrabold"
                  >
                    Cancel
                  </Button>
                )}
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="rounded-xl h-11 flex-1 bg-apple-blue text-white font-extrabold uppercase tracking-widest text-xs shadow-md shadow-apple-blue/20"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {formData.id ? 'Update Style' : 'Deploy style'}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Right List Panel */}
      <div className="flex-1 space-y-6">
        
        {/* Quick actions top card */}
        <Card className="border-none shadow-apple-soft dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] bg-white/70 dark:bg-[#1D1D1F]/70 backdrop-blur-xl rounded-3xl p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-apple-blue/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-apple-blue" />
              </div>
              <div>
                <h3 className="font-bold text-apple-text">Carvana Style Registry</h3>
                <p className="text-xs text-apple-text-muted">Total active styles configured: {styles.length}</p>
              </div>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              {/* Reset to system presets button */}
              <Button 
                variant="outline"
                disabled={isResetting}
                onClick={handleResetToPresets}
                className="text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 dark:hover:bg-amber-500/20 rounded-xl flex-1 sm:flex-initial h-11 border-amber-500/20 text-xs font-bold uppercase tracking-wider"
              >
                <RefreshCcw className={cn("w-4 h-4 mr-2", isResetting && "animate-spin")} />
                Reset Presets
              </Button>
            </div>
          </div>
        </Card>

        {/* List Card representation */}
        <Card className="border-none shadow-apple-soft dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] bg-white/94 dark:bg-[#1D1D1F]/94 backdrop-blur-xl rounded-3xl overflow-hidden">
          {isLoading ? (
            <div className="p-20 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-apple-blue border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-bold text-apple-text-muted">Loading registered styles...</p>
            </div>
          ) : styles.length === 0 ? (
            <div className="p-20 text-center">
              <Car className="w-16 h-16 text-apple-text-muted/40 mx-auto mb-4" />
              <h3 className="font-bold text-lg text-apple-text mb-1">No popular styles found</h3>
              <p className="text-sm text-apple-text-muted mb-6 max-w-sm mx-auto">Build your first Carvana-style landing filter or reset back to default preset body types.</p>
              <Button 
                onClick={handleResetToPresets}
                className="bg-apple-blue rounded-xl uppercase tracking-wider text-xs font-bold"
              >
                Reset to Standard Types
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-apple-border/20">
                    <TableHead className="w-[100px] text-[10px] font-black uppercase tracking-widest text-zinc-400 py-5">Visual Badge</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400 py-5">Style Meta</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400 py-5">Query Filters</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400 py-5 text-center">Sequence</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400 py-5">Status</TableHead>
                    <TableHead className="w-[120px] text-right text-[10px] font-black uppercase tracking-widest text-zinc-400 py-5">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                
                <TableBody>
                  {styles.map((style) => {
                    // Fetch preset path
                    let path = style.customSvgPath || '';
                    if (!path && style.iconPreset) {
                      path = BODY_STYLE_PRESETS[style.iconPreset.toLowerCase()]?.svgPath || '';
                    }

                    return (
                      <TableRow key={style.id} className="group/row hover:bg-apple-gray/30 dark:hover:bg-zinc-800/10 border-apple-border/10">
                        
                        {/* Visual Card Preview */}
                        <TableCell className="align-middle py-4">
                          <div className="w-16 h-12 rounded-xl border border-apple-border/55 bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-center p-2 relative group-hover/row:border-apple-blue/50 duration-300">
                            {style.imageUrl ? (
                              <img src={style.imageUrl} alt={style.name} className="w-full h-auto max-h-[32px] object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <svg viewBox="0 0 24 24" className="w-10 h-6 text-apple-text-muted group-hover/row:text-apple-blue duration-300 stroke-current fill-none" strokeWidth="1.3">
                                <path d={path} />
                              </svg>
                            )}
                          </div>
                        </TableCell>

                        {/* Name and template type */}
                        <TableCell className="py-4 font-sans">
                          <p className="font-bold text-apple-text text-sm">{style.name}</p>
                          <p className="text-[10px] text-apple-text-muted mt-0.5 capitalize">
                            Asset: {style.imageUrl ? 'Photo Override' : `${style.iconPreset} preset`}
                          </p>
                        </TableCell>

                        {/* Direct Filter Parameter mapped */}
                        <TableCell className="py-4 font-mono text-xs">
                          <div className="inline-flex flex-col gap-0.5 bg-apple-gray/60 dark:bg-zinc-800/20 px-2 py-1 rounded-lg border border-apple-border/10">
                            <span className="text-[10px] text-apple-text-muted">Key: {style.filterKey || 'bodyType'}</span>
                            <span className="font-bold text-apple-text text-[11px]">Value: {style.filterValue}</span>
                          </div>
                        </TableCell>

                        {/* Ordering Order */}
                        <TableCell className="py-4 text-center">
                          <Badge variant="secondary" className="px-2.5 py-1 text-xs font-mono rounded-lg gap-1">
                            <Hash className="w-3_0 h-3 text-apple-text-muted" style={{ width: '10px', height: '10px' }} />
                            {style.order}
                          </Badge>
                        </TableCell>

                        {/* Toggle Status */}
                        <TableCell className="py-4">
                          <button 
                            onClick={() => handleToggleStatus(style)}
                            className="flex items-center gap-1.5 focus:outline-none"
                          >
                            {style.status === 'active' ? (
                              <Badge className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 font-bold text-[10px] uppercase rounded-full tracking-wide">
                                <Eye className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge className="bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-500 border border-zinc-500/20 font-bold text-[10px] uppercase rounded-full tracking-wide">
                                <EyeOff className="w-3 h-3 mr-1" />
                                Hidden
                              </Badge>
                            )}
                          </button>
                        </TableCell>

                        {/* Operations Control */}
                        <TableCell className="text-right py-4">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEdit(style)}
                              className="h-8 w-8 text-apple-text-muted hover:text-apple-blue hover:bg-apple-blue/10 rounded-lg"
                              title="Edit Configuration"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(style.id, style.name)}
                              className="h-8 w-8 text-apple-text-muted hover:text-apple-red hover:bg-apple-red/10 rounded-lg"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>

                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Tip section */}
        <div className="flex gap-3 rounded-2xl bg-sky-500/5 text-sky-600 p-4 border border-sky-500/10 text-xs items-start leading-relaxed font-sans">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold uppercase tracking-wide text-[10px] text-sky-500 mb-1">Carvana ProTip for Administrators</p>
            You can dynamically change the filtering parameter mapped to each circle. For example, if you change Query Key to <code className="font-mono bg-sky-500/10 px-1 py-0.5 rounded text-[11px] text-sky-700">fuelType</code> and Query Value to <code className="font-mono bg-sky-500/10 px-1 py-0.5 rounded text-[11px] text-sky-700">hybrid</code>, clicking that circle on the homepage will immediately browse electric hybrid models for the customer.
          </div>
        </div>

      </div>

    </div>
  );
}
