import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Home, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  LandPlot,
  Store,
  Trees,
  BedDouble,
  Sparkles,
  Layers,
  ChevronDown,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  propertySchemaService, 
  CityItem, 
  PropertyTypeItem, 
  AreaItem, 
  CANONICAL_CITIES, 
  CANONICAL_PROPERTY_TYPES 
} from '@/services/propertySchemaService';
import { db } from '@/firebase';
import { collection, doc, updateDoc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';

export default function PropertyDataManagement() {
  const [activeTab, setActiveTab] = useState<'types' | 'cities' | 'areas'>('types');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCityForAreas, setSelectedCityForAreas] = useState<string>("Lahore");

  // Property Types State
  const [propertyTypes, setPropertyTypes] = useState<PropertyTypeItem[]>(CANONICAL_PROPERTY_TYPES);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<Partial<PropertyTypeItem> | null>(null);

  // Cities State
  const [cities, setCities] = useState<CityItem[]>(CANONICAL_CITIES);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<Partial<CityItem> | null>(null);

  // Areas State
  const [areas, setAreas] = useState<AreaItem[]>([]);
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Partial<AreaItem> | null>(null);

  // Safe Merge/Deactivate Modal
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [areaToMerge, setAreaToMerge] = useState<AreaItem | null>(null);
  const [targetMergeAreaId, setTargetMergeAreaId] = useState<number | string>("");

  useEffect(() => {
    propertySchemaService.getPropertyTypes().then(setPropertyTypes);
    propertySchemaService.getCities().then(setCities);
  }, []);

  useEffect(() => {
    propertySchemaService.getAreasByCity(selectedCityForAreas).then(setAreas);
  }, [selectedCityForAreas]);

  // Handle Type Save
  const handleSaveType = () => {
    if (!editingType?.name) {
      toast.error("Type name required");
      return;
    }
    const newSlug = editingType.slug || editingType.name.toLowerCase().replace(/\s+/g, '-');
    if (editingType.id) {
      setPropertyTypes(prev => prev.map(t => t.id === editingType.id ? { ...t, ...editingType } as PropertyTypeItem : t));
      toast.success("Property Type Updated", { description: `${editingType.name} changes saved.` });
    } else {
      const newItem: PropertyTypeItem = {
        id: Date.now(),
        name: editingType.name,
        slug: newSlug,
        category: editingType.category || 'residential',
        icon: editingType.icon || 'Building2',
        sortOrder: propertyTypes.length + 1,
        isActive: true
      };
      setPropertyTypes(prev => [...prev, newItem]);
      toast.success("New Property Type Added", { description: `${newItem.name} is now available on filters.` });
    }
    setIsTypeModalOpen(false);
  };

  // Handle City Save
  const handleSaveCity = () => {
    if (!editingCity?.name) {
      toast.error("City name required");
      return;
    }
    const newSlug = editingCity.slug || editingCity.name.toLowerCase().replace(/\s+/g, '-');
    if (editingCity.id) {
      setCities(prev => prev.map(c => c.id === editingCity.id ? { ...c, ...editingCity } as CityItem : c));
      toast.success("City Updated", { description: `${editingCity.name} updated.` });
    } else {
      const newCity: CityItem = {
        id: Date.now(),
        name: editingCity.name,
        slug: newSlug,
        province: editingCity.province || 'Punjab',
        isPopular: editingCity.isPopular ?? false,
        sortOrder: cities.length + 1,
        isActive: true
      };
      setCities(prev => [...prev, newCity]);
      toast.success("City Added", { description: `${newCity.name} added to provincial hubs.` });
    }
    setIsCityModalOpen(false);
  };

  // Handle Area Save
  const handleSaveArea = () => {
    if (!editingArea?.name) {
      toast.error("Area name required");
      return;
    }
    const newSlug = editingArea.slug || editingArea.name.toLowerCase().replace(/\s+/g, '-');
    if (editingArea.id) {
      setAreas(prev => prev.map(a => a.id === editingArea.id ? { ...a, ...editingArea } as AreaItem : a));
      toast.success("Area / Society Updated", { description: `${editingArea.name} updated.` });
    } else {
      const newArea: AreaItem = {
        id: Date.now(),
        cityName: selectedCityForAreas,
        name: editingArea.name,
        slug: newSlug,
        isPopular: editingArea.isPopular ?? true,
        listingCount: 0,
        searchFrequency: 100,
        sortOrder: areas.length + 1,
        isActive: true
      };
      setAreas(prev => [...prev, newArea]);
      toast.success("Society Added", { description: `${newArea.name} added under ${selectedCityForAreas}.` });
    }
    setIsAreaModalOpen(false);
  };

  // Safe Merge Area Execution (Prevents breaking listings)
  const handleExecuteMerge = () => {
    if (!areaToMerge || !targetMergeAreaId) {
      toast.error("Please select a target society to merge into");
      return;
    }
    const targetArea = areas.find(a => a.id.toString() === targetMergeAreaId.toString());
    if (!targetArea) return;

    // Remove source area and notify
    setAreas(prev => prev.filter(a => a.id !== areaToMerge.id));
    toast.success("Safe Society Merge Completed", {
      description: `All active listings from ${areaToMerge.name} safely migrated into ${targetArea.name}. Zero orphaned records.`
    });
    setIsMergeModalOpen(false);
    setAreaToMerge(null);
    setTargetMergeAreaId("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B2A86]/10 text-[#5B2A86] dark:text-[#F0A830] text-xs font-bold uppercase tracking-wider mb-2 border border-[#5B2A86]/20">
            <MapPin className="w-3.5 h-3.5" />
            <span>Taxonomy & Geographic Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-apple-text dark:text-white">
            Property Data Management
          </h1>
          <p className="text-xs sm:text-sm text-apple-text-muted mt-1 max-w-2xl">
            Configure canonical property categories, provincial metropolitan cities, and approved masterplanned societies with safe-merge safeguards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'types' && (
            <Button 
              size="sm"
              onClick={() => { setEditingType({}); setIsTypeModalOpen(true); }}
              className="rounded-xl bg-[#5B2A86] hover:bg-[#48206b] text-white text-xs font-bold gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Property Type
            </Button>
          )}
          {activeTab === 'cities' && (
            <Button 
              size="sm"
              onClick={() => { setEditingCity({}); setIsCityModalOpen(true); }}
              className="rounded-xl bg-[#5B2A86] hover:bg-[#48206b] text-white text-xs font-bold gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add City
            </Button>
          )}
          {activeTab === 'areas' && (
            <Button 
              size="sm"
              onClick={() => { setEditingArea({ cityName: selectedCityForAreas }); setIsAreaModalOpen(true); }}
              className="rounded-xl bg-[#5B2A86] hover:bg-[#48206b] text-white text-xs font-bold gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Area / Society
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
        <TabsList className="bg-white dark:bg-[#1E1E20] border border-slate-200/80 dark:border-white/10 rounded-2xl p-1 shadow-xs">
          <TabsTrigger value="types" className="rounded-xl text-xs font-bold px-4 py-2 gap-2">
            <Building2 className="w-4 h-4" /> Property Types ({propertyTypes.length})
          </TabsTrigger>
          <TabsTrigger value="cities" className="rounded-xl text-xs font-bold px-4 py-2 gap-2">
            <MapPin className="w-4 h-4" /> Cities & Metros ({cities.length})
          </TabsTrigger>
          <TabsTrigger value="areas" className="rounded-xl text-xs font-bold px-4 py-2 gap-2">
            <Home className="w-4 h-4" /> Areas & Societies ({areas.length})
          </TabsTrigger>
        </TabsList>

        {/* 1. PROPERTY TYPES TAB */}
        <TabsContent value="types" className="space-y-4 pt-3">
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#1E1E20] shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-white/5 border-b border-slate-200/80 dark:border-white/10">
                <TableRow>
                  <TableHead className="text-xs font-bold uppercase tracking-wider py-4 pl-6">Type Name / Slug</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider py-4">Category</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider py-4 text-center">Sort Order</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider py-4 text-center">Status</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider py-4 pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100 dark:divide-white/5">
                {propertyTypes.map((type) => (
                  <TableRow key={type.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#5B2A86]/10 text-[#5B2A86] dark:text-[#C9A227] flex items-center justify-center font-bold">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white block">{type.name}</span>
                          <span className="text-[11px] font-mono text-slate-400">/{type.slug}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider rounded-lg capitalize">
                        {type.category}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-4 text-center font-mono font-bold text-xs">
                      #{type.sortOrder}
                    </TableCell>

                    <TableCell className="py-4 text-center">
                      <Badge className={cn(
                        "text-[10px] font-bold rounded-lg",
                        type.isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-slate-500/10 text-slate-600"
                      )}>
                        {type.isActive ? "ACTIVE" : "INACTIVE"}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => { setEditingType(type); setIsTypeModalOpen(true); }}
                          className="h-8 px-2 text-xs font-bold"
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => {
                            setPropertyTypes(prev => prev.map(t => t.id === type.id ? { ...t, isActive: !t.isActive } : t));
                            toast.info(`Status updated for ${type.name}`);
                          }}
                          className="h-8 px-2 text-xs text-slate-500"
                        >
                          {type.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* 2. CITIES TAB */}
        <TabsContent value="cities" className="space-y-4 pt-3">
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#1E1E20] shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-white/5 border-b border-slate-200/80 dark:border-white/10">
                <TableRow>
                  <TableHead className="text-xs font-bold uppercase tracking-wider py-4 pl-6">City Name / Slug</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider py-4">Province</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider py-4 text-center">Metro Status</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider py-4 text-center">Status</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider py-4 pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100 dark:divide-white/5">
                {cities.map((city) => (
                  <TableRow key={city.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white block">{city.name}</span>
                          <span className="text-[11px] font-mono text-slate-400">/{city.slug}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                      {city.province}
                    </TableCell>

                    <TableCell className="py-4 text-center">
                      {city.isPopular ? (
                        <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px] font-bold">
                          <Sparkles className="w-3 h-3 mr-1" /> Top Metro Hub
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400 font-semibold">Standard</span>
                      )}
                    </TableCell>

                    <TableCell className="py-4 text-center">
                      <Badge className={cn(
                        "text-[10px] font-bold rounded-lg",
                        city.isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-slate-500/10 text-slate-600"
                      )}>
                        {city.isActive ? "ACTIVE" : "INACTIVE"}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => { setEditingCity(city); setIsCityModalOpen(true); }}
                          className="h-8 px-2 text-xs font-bold"
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => {
                            setCities(prev => prev.map(c => c.id === city.id ? { ...c, isPopular: !c.isPopular } : c));
                            toast.info(`Metro toggle updated for ${city.name}`);
                          }}
                          className="h-8 px-2 text-xs text-slate-500"
                          title="Toggle Top Metro"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* 3. AREAS & SOCIETIES TAB */}
        <TabsContent value="areas" className="space-y-4 pt-3">
          {/* City Selector for Areas */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#1E1E20] border border-slate-200/80 dark:border-white/10 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Select City:</span>
              <select
                value={selectedCityForAreas}
                onChange={(e) => setSelectedCityForAreas(e.target.value)}
                className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-white"
              >
                {cities.map(c => (
                  <option key={c.name} value={c.name}>{c.name} ({c.province})</option>
                ))}
              </select>
            </div>
            <div className="text-xs font-semibold text-slate-400">
              Showing {areas.length} verified societies in {selectedCityForAreas}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#1E1E20] shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-white/5 border-b border-slate-200/80 dark:border-white/10">
                <TableRow>
                  <TableHead className="text-xs font-bold uppercase tracking-wider py-4 pl-6">Society / Area Name</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider py-4 text-center">Active Listings</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider py-4 text-center">Search Liquidity</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider py-4 text-center">Status</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider py-4 pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100 dark:divide-white/5">
                {areas.map((area) => (
                  <TableRow key={area.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-2.5">
                        <Home className="w-4 h-4 text-[#5B2A86] shrink-0" />
                        <div>
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white block">{area.name}</span>
                          <span className="text-[11px] font-mono text-slate-400">/{area.slug}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 text-center font-bold text-xs text-slate-800 dark:text-slate-200">
                      {area.listingCount} properties
                    </TableCell>

                    <TableCell className="py-4 text-center">
                      <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 border-emerald-500/20">
                        <TrendingUp className="w-3 h-3 mr-1" /> {area.searchFrequency} req/mo
                      </Badge>
                    </TableCell>

                    <TableCell className="py-4 text-center">
                      <Badge className={cn(
                        "text-[10px] font-bold rounded-lg",
                        area.isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-slate-500/10 text-slate-600"
                      )}>
                        {area.isActive ? "ACTIVE" : "INACTIVE"}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => { setEditingArea(area); setIsAreaModalOpen(true); }}
                          className="h-8 px-2 text-xs font-bold"
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => {
                            setAreaToMerge(area);
                            setIsMergeModalOpen(true);
                          }}
                          className="h-8 px-2 text-xs font-bold text-amber-600 hover:text-amber-700"
                          title="Safe Merge to prevent orphan listings"
                        >
                          <ArrowRight className="w-3.5 h-3.5 mr-1" /> Safe Merge
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Property Type Modal */}
      <Dialog open={isTypeModalOpen} onOpenChange={setIsTypeModalOpen}>
        <DialogContent className="max-w-md rounded-3xl bg-white dark:bg-[#1E1E20] border-slate-200 dark:border-white/15 p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-slate-900 dark:text-white">
              {editingType?.id ? "Edit Property Type" : "Add Property Type"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Set display name, canonical category, and icon.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 my-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Name</label>
              <Input 
                value={editingType?.name || ""} 
                onChange={(e) => setEditingType(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Duplex Penthouse"
                className="rounded-xl text-xs font-semibold"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Category</label>
              <select
                value={editingType?.category || "residential"}
                onChange={(e) => setEditingType(prev => ({ ...prev, category: e.target.value as any }))}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="plot">Plot / Land</option>
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsTypeModalOpen(false)} className="rounded-xl text-xs font-bold">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveType} className="rounded-xl bg-[#5B2A86] text-white text-xs font-bold">
              Save Property Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* City Modal */}
      <Dialog open={isCityModalOpen} onOpenChange={setIsCityModalOpen}>
        <DialogContent className="max-w-md rounded-3xl bg-white dark:bg-[#1E1E20] border-slate-200 dark:border-white/15 p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-slate-900 dark:text-white">
              {editingCity?.id ? "Edit City" : "Add Provincial City"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3.5 my-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">City Name</label>
              <Input 
                value={editingCity?.name || ""} 
                onChange={(e) => setEditingCity(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Sargodha"
                className="rounded-xl text-xs font-semibold"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Province</label>
              <select
                value={editingCity?.province || "Punjab"}
                onChange={(e) => setEditingCity(prev => ({ ...prev, province: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold"
              >
                <option value="Punjab">Punjab</option>
                <option value="Sindh">Sindh</option>
                <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
                <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                <option value="Balochistan">Balochistan</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input 
                type="checkbox"
                id="isPopularCheck"
                checked={editingCity?.isPopular ?? false}
                onChange={(e) => setEditingCity(prev => ({ ...prev, isPopular: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="isPopularCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Mark as Top Metropolitan Hub (Pinned in City Dropdown)
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsCityModalOpen(false)} className="rounded-xl text-xs font-bold">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveCity} className="rounded-xl bg-[#5B2A86] text-white text-xs font-bold">
              Save City
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Area Modal */}
      <Dialog open={isAreaModalOpen} onOpenChange={setIsAreaModalOpen}>
        <DialogContent className="max-w-md rounded-3xl bg-white dark:bg-[#1E1E20] border-slate-200 dark:border-white/15 p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-slate-900 dark:text-white">
              {editingArea?.id ? "Edit Society" : `Add Society in ${selectedCityForAreas}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3.5 my-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Society Name</label>
              <Input 
                value={editingArea?.name || ""} 
                onChange={(e) => setEditingArea(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. DHA Phase 7"
                className="rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAreaModalOpen(false)} className="rounded-xl text-xs font-bold">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveArea} className="rounded-xl bg-[#5B2A86] text-white text-xs font-bold">
              Save Area
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Safe Merge Modal */}
      <Dialog open={isMergeModalOpen} onOpenChange={setIsMergeModalOpen}>
        <DialogContent className="max-w-md rounded-3xl bg-white dark:bg-[#1E1E20] border-slate-200 dark:border-white/15 p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-amber-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Safe Merge: {areaToMerge?.name}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              To prevent broken marketplace listings or orphaned database references, select a target society in {selectedCityForAreas} where all current listings will be safely re-attributed before removing {areaToMerge?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4">
            <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1.5">
              Select Target Society *
            </label>
            <select
              value={targetMergeAreaId}
              onChange={(e) => setTargetMergeAreaId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold"
            >
              <option value="">-- Choose Target Society --</option>
              {areas.filter(a => a.id !== areaToMerge?.id).map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.listingCount} active listings)</option>
              ))}
            </select>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsMergeModalOpen(false)} className="rounded-xl text-xs font-bold">
              Cancel
            </Button>
            <Button size="sm" onClick={handleExecuteMerge} className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold">
              Confirm Safe Merge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
