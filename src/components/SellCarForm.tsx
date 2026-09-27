import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronRight, 
  ChevronLeft, 
  Car, 
  Camera, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Info,
  DollarSign,
  MapPin,
  Gauge,
  Settings,
  Plus,
  Fuel,
  Sparkles,
  Flame,
  TrendingUp,
  ArrowUpRight,
  Check
} from "lucide-react";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import Header from "./Header";
import { cn, formatPrice } from "@/lib/utils";
import { useNavigate, Link, useParams } from "react-router-dom";
import { GoogleGenAI } from "@google/genai";
import { useVehicles } from "../context/VehicleContext";
import { useAuth } from "../context/AuthContext";
import { Vehicle, Category } from "../types";
import { PAKISTAN_LOCATIONS } from "../constants/locations";
import { categoryService } from "../services/categoryService";

const STEPS = [
  { id: "basics", title: "Basics", icon: Car },
  { id: "specs", title: "Specs", icon: Settings },
  { id: "photos", title: "Photos", icon: Camera },
  { id: "pricing", title: "Pricing", icon: DollarSign },
  { id: "review", title: "Review", icon: CheckCircle2 },
];

import AdvancedInlineCarSelector from "./CarSelector/AdvancedInlineCarSelector";

const AREAS = PAKISTAN_LOCATIONS;

import { optimizeImages } from "../lib/imageOptimizer";

export default function SellCarForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addVehicle, updateVehicle, vehicles } = useVehicles();
  const { user, profile, isAdmin } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    variant: "",
    makeId: undefined as string | number | undefined,
    modelId: undefined as string | number | undefined,
    variantId: undefined as string | number | undefined,
    year: "2024",
    condition: "new",
    mileage: "",
    transmission: "automatic",
    fuelType: "petrol",
    location: "Gulberg III, Lahore",
    city: "Lahore",
    area: "Gulberg III",
    price: "",
    description: "",
    seoDescription: "",
    images: [] as string[],
    category: {
      parentId: "",
      childId: "",
      subChildId: ""
    },
    bodyType: "Sedan",
    engineSize: "1300",
    color: "White",
    assembly: "Local",
    registrationCity: "Lahore",
    features: [] as string[]
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [wantsFeatured, setWantsFeatured] = useState(false);
  useEffect(() => {
    categoryService.getAll().then(setCategories);
  }, []);

  useEffect(() => {
    if (id) {
      const vehicle = vehicles.find(v => v.id === id);
      if (vehicle) {
        setFormData(prev => ({
          ...prev,
          make: vehicle.make || "",
          model: vehicle.model || "",
          variant: (vehicle as any).variant || "",
          year: vehicle.year?.toString() || "2024",
          condition: vehicle.condition || "used",
          mileage: vehicle.mileage?.toString() || "",
          transmission: (vehicle.transmission as any) || "automatic",
          fuelType: (vehicle.fuelType as any) || "petrol",
          location: vehicle.location || "",
          city: vehicle.city || vehicle.location?.split(', ')?.[1] || "Lahore",
          area: vehicle.area || vehicle.location?.split(', ')?.[0] || "Gulberg III",
          price: vehicle.price?.toString() || "",
          description: vehicle.description || "",
          seoDescription: vehicle.seoDescription || "",
          images: vehicle.images || [],
          category: vehicle.category || prev.category,
          bodyType: vehicle.bodyType || "Sedan",
          engineSize: vehicle.engineSize?.replace(/\s*cc/i, "") || "1300",
          color: vehicle.customFields?.color || "White",
          assembly: vehicle.customFields?.assembly || "Local",
          registrationCity: vehicle.customFields?.registrationCity || "Lahore",
          features: vehicle.features || []
        }));
      }
    }
  }, [id, vehicles]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files) as File[];
      const optimized = await optimizeImages(fileArray);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...optimized.map(o => o.dataUrl)].slice(0, 10)
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const [isValuating, setIsValuating] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);

  const fetchLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Using a simple reverse geocoding approach or just updating with coordinates
          // For this app, we'll simulate the city detection from coordinates
          // In a real app, you'd call a geocoding API here
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.village || data.address.state || "Lahore";
          
          setFormData(prev => ({ ...prev, location: city }));
        } catch (error) {
          console.error("Error reverse geocoding:", error);
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        console.error("Error fetching location:", error);
        setIsFetchingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleNext = () => {
    if (currentStep === 2 && formData.images.length === 0) {
      // Don't proceed if no images uploaded
      return;
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePublish = async () => {
    const selectedCategoryId = formData.category.subChildId || formData.category.childId || formData.category.parentId;
    const selectedCategory = categories.find(c => c.id === selectedCategoryId);
    const isCategoryCrowded = selectedCategory?.isCrowded || false;
    const creditCost = selectedCategory?.creditCost ?? (isCategoryCrowded ? 1 : 0);
    const userCredits = profile?.credits ?? 3;
    const userFeaturedCredits = profile?.featuredCredits ?? 0;

    // Validation
    if (!id) {
      if (creditCost > 0 && userCredits < creditCost) {
        toast.error(`Protected Classification Room: Selected category "${selectedCategory?.name || "restricted sector"}" is flagged crowded. Posting requires ${creditCost} upload credit, but your wallet holds ${userCredits}. Please purchase standard upload packages.`);
        return;
      }
      if (wantsFeatured && userFeaturedCredits < 1) {
        toast.error(`Insufficient Balance: Upgrading to Featured Spotlight requires 1 Promotion Token, but your wallet holds ${userFeaturedCredits}. Please select standard submission or buy package bundles.`);
        return;
      }
    }

    // Process Deduction securely
    if (!id && user) {
      try {
        const userRef = doc(db, "users", user.uid);
        const updatedCredits = Math.max(0, userCredits - creditCost);
        const updatedFeatured = Math.max(0, wantsFeatured ? userFeaturedCredits - 1 : userFeaturedCredits);
        await updateDoc(userRef, {
          credits: updatedCredits,
          featuredCredits: updatedFeatured
        });
        toast.success(`Deducted ${creditCost} posting slot credit(s) and ${wantsFeatured ? 1 : 0} featured token(s).`);
      } catch (err) {
        console.error("Ledger deduction error:", err);
      }
    }

    const resolvedSeo = formData.seoDescription || `
<h3>🎯 Key SEO Selling Points</h3>
<ul>
  <li>Pristine ${formData.year} ${formData.make} ${formData.model} ${formData.variant ? formData.variant : ''} for Sale in ${formData.city}</li>
  <li>Authentic ${formData.assembly} assembly spec, registered in ${formData.registrationCity}</li>
  <li>Beautifully maintained dealer-certified state with high performance specifications</li>
</ul>

<h3>📋 Vehicle Specs & Condition</h3>
<p>${formData.description || "Excellent machinery in top condition. Genuine driven, well kept exterior and pristine cabin space."}</p>

<h3>💎 Premium Features Highlight</h3>
<ul>
  ${formData.features && formData.features.length > 0
    ? formData.features.map(f => `<li><strong>${f}:</strong> Installed, fully functional high-grade accessory.</li>`).join("")
    : "<li>Full original factory stock features included.</li>"}
</ul>

<h3>🔍 Google Search Keyword Rich Phrases</h3>
<p><em>used ${formData.make} ${formData.model} ${formData.city}, buy ${formData.make} ${formData.model} ${formData.year} pakistan, best used cars under budget, used ${formData.make} ${formData.engineSize}cc price, Pakwheels alternative car listings</em></p>
    `;

    if (id) {
      const updates: Partial<Vehicle> = {
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        price: parseInt(formData.price),
        mileage: parseInt(formData.mileage),
        location: `${formData.area}, ${formData.city}`,
        city: formData.city,
        area: formData.area,
        images: formData.images,
        category: formData.category,
        condition: formData.condition as any,
        transmission: formData.transmission as any,
        fuelType: formData.fuelType as any,
        description: formData.description,
        seoDescription: resolvedSeo,
        bodyType: formData.bodyType,
        engineSize: formData.engineSize + " cc",
        features: formData.features,
        customFields: {
          color: formData.color,
          assembly: formData.assembly,
          registrationCity: formData.registrationCity,
          variant: formData.variant
        },
        isFeatured: wantsFeatured || false,
        featuredUntil: wantsFeatured ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined
      };
      await updateVehicle(id, updates);
    } else {
      const newVehicle: Vehicle = {
        id: `v-${Date.now()}`,
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        price: parseInt(formData.price),
        mileage: parseInt(formData.mileage),
        location: `${formData.area}, ${formData.city}`,
        city: formData.city,
        area: formData.area,
        images: formData.images,
        category: formData.category,
        type: 'car',
        condition: formData.condition as any,
        transmission: formData.transmission as any,
        fuelType: formData.fuelType as any,
        bodyType: formData.bodyType,
        engineSize: formData.engineSize + " cc",
        seller: {
          uid: user?.uid || "anonymous",
          name: profile?.displayName || user?.displayName || "Anonymous Seller",
          username: profile?.username || (profile?.displayName || user?.displayName || "user").toLowerCase().replace(/\s+/g, '_'),
          isVerified: isAdmin,
          badgeType: profile?.badgeType || 'none',
          rating: 5.0
        },
        createdAt: new Date().toISOString(),
        features: formData.features,
        customFields: {
          color: formData.color,
          assembly: formData.assembly,
          registrationCity: formData.registrationCity,
          variant: formData.variant
        },
        description: formData.description,
        seoDescription: resolvedSeo,
        status: 'active',
        specs: {
          driveTrain: 'AWD',
          seating: 5
        },
        isFeatured: wantsFeatured || false,
        featuredUntil: wantsFeatured ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined
      } as any;
      await addVehicle(newVehicle);
    }
    navigate("/dashboard");
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const simulateAIValuation = () => {
    if (!formData.make || !formData.model) return;
    setIsValuating(true);
    setTimeout(() => {
      const basePrice = 15000000;
      const randomVariation = Math.random() * 2000000;
      setSuggestedPrice(basePrice + randomVariation);
      setIsValuating(false);
    }, 2000);
  };

  const generateAIDescription = async () => {
    if (!formData.make || !formData.model) return;
    
    setIsGeneratingDescription(true);
    try {
      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: formData.year,
          make: formData.make,
          model: formData.model,
          variant: formData.variant,
          condition: formData.condition,
          mileage: formData.mileage,
          transmission: formData.transmission,
          fuelType: formData.fuelType,
          bodyType: formData.bodyType,
          engineSize: formData.engineSize,
          color: formData.color,
          assembly: formData.assembly,
          registrationCity: formData.registrationCity,
          features: formData.features
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate description on server");
      }

      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        description: data.simpleText || "Pristine vehicle, highly maintained.",
        seoDescription: data.seoHtml || ""
      }));
    } catch (error) {
      console.warn("AI Description failed, using local copywriter fallback:", error);
      const transmissionLabel = formData.transmission === 'automatic' ? 'Automatic' : 'Manual';
      const featuresText = formData.features && formData.features.length > 0 
        ? `, fully loaded with premium features including ${formData.features.join(", ")}` 
        : '';
      
      const simpleText = `Selling an exceptionally well-kept ${formData.year} ${formData.make} ${formData.model} ${formData.variant ? formData.variant : ''} in ${formData.city}. This car is in clean ${formData.condition} condition overall. Driven moderately at ${formData.mileage ? parseInt(formData.mileage).toLocaleString() : '0'} KM genuine mileage. Equipped with a reliable ${formData.engineSize} cc engine and incredibly smooth ${transmissionLabel} transmission. Extremely neat interior and exterior, fully functional components with tax cleared. Original documents are readily available.`;

      const fallbackSeo = `
<h3>🎯 Key SEO Selling Points</h3>
<ul>
  <li>Pristine ${formData.year} ${formData.make} ${formData.model} ${formData.variant ? formData.variant : ''} for Sale in ${formData.city}</li>
  <li>Only ${formData.mileage ? parseInt(formData.mileage).toLocaleString() : '0'} KM genuine mileage driven</li>
  <li>Authentic ${formData.assembly} assembly with gorgeous ${formData.color} exterior coat</li>
</ul>

<h3>📋 Vehicle Specs & Condition</h3>
<p>Selling an extraordinarily well-kept ${formData.year} ${formData.make} ${formData.model}. Driven highly occasionally as a daily commute around ${formData.city} with full documents complete and tax up-grid. The fuel-efficient ${formData.engineSize} cc engine operates flawlessly on ${formData.fuelType}, paired directly with a super smooth ${transmissionLabel} transmission.</p>

<h3>💎 Installed Highlights</h3>
<p>Condition is pristine (interior score 9.5/10, exterior score 9/10)${featuresText}. Suspensions, brakes, and tires are in excellent condition. Guaranteed no work needed—just buy and drive!</p>

<h3>🔍 Search Keywords</h3>
<p><em>used ${formData.make} ${formData.model} ${formData.city}, buy ${formData.make} ${formData.model} ${formData.year} pakistan, best used sedan ${formData.city}, used ${formData.make} ${formData.engineSize}cc price</em></p>
      `;
      setFormData(prev => ({ ...prev, description: simpleText, seoDescription: fallbackSeo }));
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  useEffect(() => {
    if (currentStep === 3 && !suggestedPrice) {
      simulateAIValuation();
    }
  }, [currentStep]);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Category Selection Hierarchy */}
            <div className="space-y-6 pb-8 border-b border-apple-border/50">
              <h3 className="text-xl font-bold tracking-tight">Select Classification</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Parent Category */}
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-text-muted">Master Category</label>
                    <select 
                      className="apple-input w-full h-12 bg-white"
                      value={formData.category.parentId}
                      onChange={(e) => setFormData({
                        ...formData,
                        category: { ...formData.category, parentId: e.target.value, childId: "", subChildId: "" }
                      })}
                    >
                       <option value="">Select Category</option>
                       {categories.filter(c => c.level === 1).map(c => (
                         <option key={c.id} value={c.id}>{c.name}</option>
                       ))}
                    </select>
                 </div>

                 {/* Child Category */}
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-text-muted">Direct Secondary</label>
                    <select 
                      className="apple-input w-full h-12 bg-white disabled:opacity-50"
                      disabled={!formData.category.parentId}
                      value={formData.category.childId}
                      onChange={(e) => setFormData({
                        ...formData,
                        category: { ...formData.category, childId: e.target.value, subChildId: "" }
                      })}
                    >
                       <option value="">Select Sub-Category</option>
                       {categories.filter(c => c.parentId === formData.category.parentId).map(c => (
                         <option key={c.id} value={c.id}>{c.name}</option>
                       ))}
                    </select>
                 </div>

                 {/* Sub-Child Category */}
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-apple-text-muted">Terminal Node</label>
                    <select 
                      className="apple-input w-full h-12 bg-white disabled:opacity-50"
                      disabled={!formData.category.childId}
                      value={formData.category.subChildId}
                      onChange={(e) => setFormData({
                        ...formData,
                        category: { ...formData.category, subChildId: e.target.value }
                      })}
                    >
                       <option value="">Select Specific</option>
                       {categories.filter(c => c.parentId === formData.category.childId).map(c => (
                         <option key={c.id} value={c.id}>{c.name}</option>
                       ))}
                    </select>
                 </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-apple-text-muted uppercase tracking-widest">Identify Vehicle</label>
                  <span className="text-[10px] font-bold text-apple-blue uppercase tracking-widest bg-apple-blue/5 px-2 py-1 rounded">Smart Dependent Logic</span>
                </div>
                <AdvancedInlineCarSelector 
                  initialValues={{
                    makeId: formData.makeId,
                    modelId: formData.modelId,
                    variantId: formData.variantId,
                    variantName: formData.variant
                  }}
                  onSelect={(data) => {
                    setFormData(prev => ({
                      ...prev,
                      make: data.make?.name || "",
                      makeId: data.makeId,
                      model: data.model?.name || "",
                      modelId: data.modelId,
                      variant: data.variant?.name || data.variantName || "",
                      variantId: data.variantId,
                      // Auto-update fuel and transmission if variant has them
                      fuelType: (data.variant?.fuelType as any) || prev.fuelType,
                      transmission: (data.variant?.transmission as any) || prev.transmission
                    }));
                  }}
                  orientation="horizontal"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-sm font-bold text-apple-text-muted uppercase tracking-widest">Year</label>
                <select 
                  className="apple-input w-full"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                >
                  {["2024", "2023", "2022", "2021", "2020"].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-apple-text-muted uppercase tracking-widest">Condition</label>
                <div className="flex gap-4">
                  {["new", "used"].map(c => (
                    <button
                      key={`sell-condition-${c}`}
                      onClick={() => setFormData({ ...formData, condition: c })}
                      className={cn(
                        "flex-1 py-4 rounded-apple-lg border-2 font-bold capitalize transition-all",
                        formData.condition === c 
                          ? "border-apple-blue bg-apple-blue/5 text-apple-blue" 
                          : "border-apple-border hover:border-apple-text-muted"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        );
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-sm font-bold text-apple-text-muted uppercase tracking-widest">Mileage (km)</label>
                <div className="relative">
                  <Gauge className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-text-muted" />
                  <input 
                    type="number" 
                    className="apple-input w-full pl-12"
                    placeholder="e.g. 15000"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-apple-text-muted uppercase tracking-widest">Transmission</label>
                <div className="flex gap-4">
                  {["automatic", "manual"].map(t => (
                    <button
                      key={t}
                      onClick={() => setFormData({ ...formData, transmission: t })}
                      className={cn(
                        "flex-1 py-4 rounded-apple-lg border-2 font-bold capitalize transition-all",
                        formData.transmission === t 
                          ? "border-apple-blue bg-apple-blue/5 text-apple-blue" 
                          : "border-apple-border hover:border-apple-text-muted"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-apple-text-muted uppercase tracking-widest">Fuel Type</label>
                <select 
                  className="apple-input w-full shadow-sm"
                  value={formData.fuelType}
                  onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                >
                  {["electric", "hybrid", "petrol", "diesel"].map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-apple-text-muted uppercase tracking-widest">Vehicle Style / Type</label>
                <select 
                  className="apple-input w-full shadow-sm"
                  value={formData.bodyType}
                  onChange={(e) => setFormData({ ...formData, bodyType: e.target.value })}
                >
                  {["Sedan", "SUV", "Truck", "Hatchback", "Coupe", "Convertible", "Minivan", "Wagon", "Crossover", "Van"].map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>

              {/* Advanced PakWheels-style specs */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-apple-text-muted uppercase tracking-widest">Engine Engine Size (cc)</label>
                <input 
                  type="number" 
                  className="apple-input w-full"
                  placeholder="e.g. 1300"
                  value={formData.engineSize}
                  onChange={(e) => setFormData({ ...formData, engineSize: e.target.value })}
                />
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-apple-text-muted uppercase tracking-widest">Exterior Color</label>
                <select 
                  className="apple-input w-full"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                >
                  {["White", "Black", "Silver", "Grey", "Blue", "Red", "Gold", "Green", "Beige", "Other"].map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-apple-text-muted uppercase tracking-widest">Assembly</label>
                <div className="flex gap-4">
                  {["Local", "Imported"].map(asm => (
                    <button
                      key={asm}
                      type="button"
                      onClick={() => setFormData({ ...formData, assembly: asm })}
                      className={cn(
                        "flex-1 py-3.5 rounded-apple-lg border-2 font-bold transition-all text-sm",
                        formData.assembly === asm 
                          ? "border-apple-blue bg-apple-blue/5 text-apple-blue" 
                          : "border-apple-border hover:border-apple-text-muted"
                      )}
                    >
                      {asm}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-apple-text-muted uppercase tracking-widest">Registration City</label>
                <select 
                  className="apple-input w-full"
                  value={formData.registrationCity}
                  onChange={(e) => setFormData({ ...formData, registrationCity: e.target.value })}
                >
                  {["Lahore", "Karachi", "Islamabad", "Peshawar", "Quetta", "Faisalabad", "Un-Registered"].map(rc => (
                    <option key={rc} value={rc}>{rc}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4 md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-apple-text-muted uppercase tracking-widest">Seller's City</label>
                    <select
                      className="apple-input w-full"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value, area: AREAS[e.target.value][0] })}
                    >
                      {Object.keys(AREAS).map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-apple-text-muted uppercase tracking-widest">Sellers's Area</label>
                    <select
                      className="apple-input w-full"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    >
                      {AREAS[formData.city]?.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Dynamic Key Features Checklist */}
              <div className="space-y-4 col-span-1 md:col-span-2 pt-4 border-t border-apple-border/40">
                <div className="flex justify-between items-center sm:grid sm:grid-cols-2 gap-2">
                  <label className="text-sm font-bold text-apple-text-muted uppercase tracking-widest text-left">Key Features & Accessories</label>
                  <div className="text-right sm:text-right">
                    <span className="text-[10px] bg-apple-blue/10 text-apple-blue font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block">
                      Helps AI Generate High SEO Rankings
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {[
                    "Sunroof",
                    "Alloy Rims",
                    "Push Start",
                    "Keyless Entry",
                    "ABS Brakes",
                    "Airbags",
                    "Cruise Control",
                    "Navigation Screen",
                    "Back Camera",
                    "Leather Seats",
                    "Led Headlights",
                    "Climate Control"
                  ].map(f => {
                    const isSelected = formData.features?.includes(f);
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => {
                          const currentFeatures = formData.features || [];
                          if (currentFeatures.includes(f)) {
                            setFormData({
                              ...formData,
                              features: currentFeatures.filter(item => item !== f)
                            });
                          } else {
                            setFormData({
                              ...formData,
                              features: [...currentFeatures, f]
                            });
                          }
                        }}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-bold text-left transition-all",
                          isSelected 
                            ? "border-apple-blue bg-apple-blue/10 text-apple-blue shadow-sm" 
                            : "border-apple-border bg-apple-bg/50 hover:bg-apple-bg text-apple-text hover:border-apple-text-muted"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all",
                          isSelected ? "border-apple-blue bg-apple-blue text-white" : "border-apple-border"
                        )}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        {f}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 md:col-span-2">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-bold text-apple-text-muted uppercase tracking-widest">SEO Optimized Vehicle Description</label>
                  <button 
                    onClick={generateAIDescription}
                    disabled={isGeneratingDescription || !formData.make || !formData.model}
                    className="flex items-center gap-2 text-xs font-bold text-apple-blue hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-apple-blue/10 px-3 py-1.5 rounded-full"
                  >
                    {isGeneratingDescription ? (
                      <>
                        <div className="w-3 h-3 border-2 border-apple-blue border-t-transparent rounded-full animate-spin" />
                        Generating SEO Text...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-apple-blue stroke-[2.5]" />
                        Generate with AI
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <textarea 
                    className="apple-input w-full min-h-[220px] py-4 resize-y font-normal text-sm leading-relaxed"
                    placeholder="Describe your vehicle's condition, features, and modifications or click the Generate with AI button for a professional, top-tier SEO description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  <div className="absolute bottom-3 right-3 text-[10px] text-apple-text-muted font-bold uppercase pointer-events-none">
                    HTML Supported
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-4 border-dashed border-apple-border rounded-apple-xl p-12 text-center hover:border-apple-blue transition-colors cursor-pointer group"
            >
              <div className="w-20 h-20 bg-apple-gray rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Camera className="w-10 h-10 text-apple-text-muted" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Upload High-Res Photos</h3>
              <p className="text-apple-text-muted mb-8 max-w-md mx-auto">
                Listings with 10+ high-quality photos sell 3x faster. Drag and drop or click to browse.
              </p>
              <button className="apple-button-secondary">Select Photos</button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
              {formData.images.filter(Boolean).map((img, i) => (
                <div key={i} className="w-full aspect-square bg-apple-gray rounded-apple-lg relative group overflow-hidden border border-apple-border">
                  <img src={img} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(i);
                    }}
                    className="absolute top-1.5 right-1.5 w-7 h-7 bg-red-500/90 text-white rounded-full flex items-center justify-center opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-opacity touch-target cursor-pointer shadow-md font-bold text-sm"
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
              {formData.images.length < 10 && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-square bg-apple-gray rounded-apple-lg flex items-center justify-center border border-apple-border border-dashed hover:border-apple-blue transition-colors cursor-pointer min-h-[44px]"
                >
                  <Plus className="w-6 h-6 text-apple-border" />
                </button>
              )}
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div className="glass-panel p-8 rounded-apple-xl bg-gradient-to-br from-apple-blue/5 to-purple-500/5 border border-apple-blue/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-apple-blue text-white rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">AI Price Estimation</h3>
                  <p className="text-sm text-apple-text-muted">Analyzing market data for {formData.make} {formData.model}...</p>
                </div>
              </div>

              {isValuating ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-apple-blue border-t-transparent rounded-full animate-spin mb-4" />
                  <div className="text-sm font-bold text-apple-blue animate-pulse uppercase tracking-widest">Calculating Value</div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="text-sm font-bold text-apple-text-muted uppercase tracking-widest mb-2">Suggested Market Price</div>
                    <div className="text-6xl font-bold text-apple-blue mb-4">
                      {suggestedPrice ? formatPrice(suggestedPrice) : "---"}
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-full text-xs font-bold uppercase tracking-wider">
                      <TrendingUp className="w-3 h-3" />
                      High Demand in {formData.location}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-bold text-apple-text-muted uppercase tracking-widest">Your Asking Price</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-apple-text-muted">Rs</div>
                      <input 
                        type="number" 
                        className="apple-input w-full pl-12 text-2xl font-bold"
                        placeholder="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="bg-apple-card-bg rounded-apple-xl border border-apple-border overflow-hidden shadow-apple-soft">
              <div className="w-full aspect-video bg-apple-gray relative overflow-hidden">
                {formData.images?.[0] ? (
                  <img src={formData.images[0]} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Car className="w-20 h-20 text-apple-border" />
                  </div>
                )}
                <div className="absolute top-6 left-6 flex gap-2">
                  <div className="glass-panel px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-apple-blue">
                    Preview Mode
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{formData.year} {formData.make} {formData.model}</h2>
                    <div className="flex items-center gap-4 text-apple-text-muted text-sm">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {formData.location}</span>
                      <span className="flex items-center gap-1"><Gauge className="w-4 h-4" /> {formData.mileage} km</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-apple-blue">
                    {formatPrice(Number(formData.price))}
                  </div>
                </div>
                
                {formData.description && (
                  <div className="mb-8 p-6 bg-apple-gray rounded-apple-lg border border-apple-border/50">
                    <h4 className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest mb-3 flex items-center justify-between">
                      <span>Listing Description</span>
                      {(formData.seoDescription || formData.description.includes("<")) && (
                        <span className="text-[9px] text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          ACTIVE SEO PACK AT BACKEND
                        </span>
                      )}
                    </h4>
                    <p className="text-sm leading-relaxed text-apple-text whitespace-pre-line select-text font-normal">
                      {formData.description.includes("<") 
                        ? formData.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() 
                        : formData.description}
                    </p>
                  </div>
                )}
                 <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-6 border-y border-apple-border">
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest mb-1">Fuel</div>
                    <div className="font-bold text-sm capitalize">{formData.fuelType}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest mb-1">Trans</div>
                    <div className="font-bold text-sm capitalize">{formData.transmission}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest mb-1">Cond</div>
                    <div className="font-bold text-sm capitalize">{formData.condition}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest mb-1">Style</div>
                    <div className="font-bold text-sm capitalize">{formData.bodyType}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-apple-text-muted uppercase tracking-widest mb-1">Engine</div>
                    <div className="font-bold text-sm">N/A</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Crowd Congestion Sentry and Premium Boost Center */}
            <div className="space-y-6">
              {/* Crowded Category Warning Pillar */}
              {(() => {
                const selectedCategoryId = formData.category.subChildId || formData.category.childId || formData.category.parentId;
                const selectedCategory = categories.find(c => c.id === selectedCategoryId);
                const isLocalCrowded = selectedCategory?.isCrowded || false;
                const localCost = selectedCategory?.creditCost ?? (isLocalCrowded ? 1 : 0);
                const localBalance = profile?.credits ?? 3;

                if (localCost > 0) {
                  return (
                    <div className={cn(
                      "p-6 rounded-3xl border flex gap-4 transition-all shadow-sm",
                      localBalance >= localCost 
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200" 
                        : "bg-apple-red/10 border-apple-red/20 text-apple-red"
                    )}>
                      <ShieldCheck className="w-6 h-6 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-extrabold text-base mb-1">
                          Crowded Category Policy Restriction Active
                        </h4>
                        <p className="text-xs leading-relaxed opacity-90 mb-3">
                          The chosen classification <strong>"{selectedCategory?.name || "restricted sector"}"</strong> is currently marked highly congested. Upload checks require <strong>{localCost} Credit(s)</strong>.
                          Your profile standard balance: <span className="underline font-bold text-sm">{localBalance} Credits Available</span>.
                        </p>
                        {localBalance < localCost && (
                          <Link 
                            to="/dashboard/credits" 
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl hover:bg-red-600 shadow-sm"
                          >
                            Purchase Credits First <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="p-6 bg-apple-green/10 rounded-2xl border border-apple-green/20 flex gap-4 text-apple-green">
                    <ShieldCheck className="w-6 h-6 shrink-0" />
                    <div>
                      <h4 className="font-bold mb-1 col-span-2">Standard Segment Cleared</h4>
                      <p className="text-xs opacity-90">
                        This category has stable traffic density. Standard free account allowance has authorized this post for zero credits.
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Promotional Featured Check Card */}
              {(() => {
                const localFeaturedBalance = profile?.featuredCredits ?? 0;
                return (
                  <div className={cn(
                    "p-6 rounded-3xl border flex gap-5 transition-all shadow-sm bg-gradient-to-br",
                    wantsFeatured 
                      ? "from-purple-500/10 to-pink-500/5 border-purple-500/30" 
                      : "from-white/50 to-white/20 dark:from-white/[0.01] border-apple-border/50"
                  )}>
                    <input 
                      type="checkbox" 
                      id="optFeaturedBoost" 
                      className="w-6 h-6 rounded-lg my-auto accent-purple-600 text-white shrink-0 cursor-pointer"
                      checked={wantsFeatured}
                      onChange={(e) => setWantsFeatured(e.target.checked)}
                    />
                    <div className="flex-1">
                      <label htmlFor="optFeaturedBoost" className="font-extrabold text-base mb-1 cursor-pointer flex items-center gap-2 text-apple-text">
                        <Flame className={cn("w-5 h-5", wantsFeatured ? "text-purple-600 animate-pulse" : "text-apple-text-muted")} />
                        Upgrade to Premium Featured Spotlight (Rs 1,500 value)
                      </label>
                      <p className="text-xs text-apple-text-muted leading-relaxed mt-2">
                        Pin your vehicle to the home page spotlight banner carousel and get boosted ranking placements in listings search for 7 days. 
                        <strong> Consumes 1 Promotion Token.</strong> Available on your account: <span className="font-bold text-purple-600 dark:text-purple-400">{localFeaturedBalance} Tokens.</span>
                      </p>
                      
                      {wantsFeatured && localFeaturedBalance <= 0 && (
                        <div className="mt-4 p-4 bg-red-500/10 text-apple-red border border-red-500/20 rounded-2xl flex items-center justify-between gap-4">
                          <span className="text-xs font-bold">You don't have premium promotion tokens. Please top up your ledger profile.</span>
                          <Link 
                            to="/dashboard/credits" 
                            className="px-3 py-1.5 bg-red-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl flex items-center gap-1 shrink-0"
                          >
                            Buy Pack <ArrowUpRight className="w-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-apple-bg">
      <Header />
      
      <main className="pt-20 sm:pt-24 pb-12 max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back Link */}
        <Link to="/dashboard" className="flex items-center gap-3 text-sm font-bold text-apple-text-muted hover:text-apple-text transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group mb-4 w-fit touch-target min-h-[36px]">
          <div className="w-8 h-8 rounded-full bg-apple-card-bg backdrop-blur-md flex items-center justify-center shadow-apple-soft border border-apple-border group-hover:scale-110 transition-transform">
            <ChevronLeft className="w-5 h-5" />
          </div>
          <span>Back to Dashboard</span>
        </Link>

        {/* Progress Stepper: Responsive Conversion */}
        <div className="mb-6">
          {/* Mobile Step Indicator (<640px): Compact "Step X of Y" + slim progress bar */}
          <div className="sm:hidden flex flex-col gap-2.5 p-4 bg-apple-card-bg rounded-2xl border border-apple-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-apple-text-muted">
                Step <span className="text-apple-blue font-extrabold">{currentStep + 1}</span> of {STEPS.length}
              </span>
              <span className="text-xs font-extrabold text-apple-text flex items-center gap-1.5">
                {React.createElement(STEPS[currentStep].icon, { className: "w-3.5 h-3.5 text-apple-blue" })}
                <span>{STEPS[currentStep].title}</span>
              </span>
            </div>
            <div className="w-full h-2 bg-apple-gray dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-apple-blue rounded-full"
                initial={false}
                animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Desktop & Tablet Progress Stepper (>=640px) */}
          <div className="hidden sm:block">
            <div className="flex justify-between relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-apple-border -translate-y-1/2 -z-10" />
              <div 
                className="absolute top-1/2 left-0 h-0.5 bg-apple-blue -translate-y-1/2 -z-10 transition-all duration-500" 
                style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
              />
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center gap-2.5">
                  <div 
                    className={cn(
                      "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-500 border-4",
                      index < currentStep ? "bg-apple-blue border-apple-blue text-white" :
                      index === currentStep ? "bg-apple-card-bg border-apple-blue text-apple-blue shadow-lg scale-110" :
                      "bg-apple-card-bg border-apple-border text-apple-text-muted"
                    )}
                  >
                    {index < currentStep ? <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" /> : <step.icon className="w-4 h-4 md:w-5 md:h-5" />}
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider transition-colors",
                    index === currentStep ? "text-apple-blue" : "text-apple-text-muted"
                  )}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-apple-card-bg rounded-2xl sm:rounded-apple-2xl shadow-apple-soft border border-apple-border p-5 sm:p-8 md:p-12">
          <div className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              {id ? "Edit Listing" : STEPS[currentStep].title}
            </h2>
            <p className="text-xs sm:text-sm text-apple-text-muted">
              {id ? `Updating your ${formData.year} ${formData.make} ${formData.model}` : "Please provide the necessary details to list your vehicle."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          <div className="mt-10 sm:mt-16 pt-6 sm:pt-8 border-t border-apple-border flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <button 
              onClick={currentStep === 0 ? () => navigate("/dashboard") : handleBack}
              className="flex items-center justify-center gap-2 font-bold text-sm transition-all text-apple-text-muted hover:text-apple-text cursor-pointer min-h-[44px] touch-target py-2 px-4 rounded-xl hover:bg-apple-gray"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>{currentStep === 0 ? "Cancel" : "Back"}</span>
            </button>
            
            <div className="flex flex-col items-stretch sm:items-end gap-2">
              <div className="flex gap-4">
                {currentStep === STEPS.length - 1 ? (
                  <button 
                    onClick={handlePublish}
                    className="apple-button-primary w-full sm:w-auto !px-8 sm:!px-12 !h-12 min-h-[44px] flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>{id ? "Save Changes" : "Publish Listing"}</span>
                    <Zap className="w-4 h-4 group-hover:fill-current" />
                  </button>
                ) : (
                  <button 
                    onClick={handleNext}
                    disabled={currentStep === 2 && formData.images.length === 0}
                    className="apple-button-primary w-full sm:w-auto !px-8 sm:!px-12 !h-12 min-h-[44px] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>Continue</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
              {currentStep === 2 && formData.images.length === 0 && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest text-center sm:text-right animate-pulse">
                  Upload at least one photo to continue
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Help Tip */}
        <div className="mt-12 flex items-start gap-4 p-6 bg-apple-card-bg rounded-apple-xl border border-apple-border shadow-apple-soft">
          <div className="w-10 h-10 rounded-full bg-apple-gray flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-apple-blue" />
          </div>
          <div>
            <h4 className="font-bold text-sm mb-1">Need help?</h4>
            <p className="text-xs text-apple-text-muted leading-relaxed">
              Our support team is available 24/7 to help you with your listing. 
              Call us at <span className="font-bold text-apple-text">0800-PAKIZZLE</span> for assistance.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
