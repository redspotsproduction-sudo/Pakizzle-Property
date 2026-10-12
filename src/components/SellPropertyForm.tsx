import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronRight, 
  ChevronLeft, 
  Home, 
  Camera, 
  ShieldCheck, 
  CheckCircle2, 
  Info, 
  DollarSign, 
  MapPin, 
  Maximize2, 
  Settings, 
  Plus, 
  Sparkles, 
  Building2,
  Bed,
  Bath,
  Compass,
  FileCheck
} from "lucide-react";
import { toast } from "sonner";
import Header from "./Header";
import { cn, formatPrice } from "@/lib/utils";
import { formatPropertyUrl } from "@/lib/referenceId";
import { useNavigate, useParams } from "react-router-dom";
import { useProperties } from "../context/PropertyContext";
import { useAuth } from "../context/AuthContext";
import { Property } from "../types";
import { PAKISTAN_LOCATIONS } from "../constants/locations";

const STEPS = [
  { id: "basics", title: "Property Basics", icon: Home },
  { id: "specs", title: "Specs & Layout", icon: Settings },
  { id: "photos", title: "Visuals", icon: Camera },
  { id: "pricing", title: "Price & Title", icon: DollarSign },
  { id: "review", title: "Review & Publish", icon: CheckCircle2 },
];

const PROPERTY_TYPES = [
  { name: "House", icon: Home, desc: "Bungalows, villas, duplex homes" },
  { name: "Apartment", icon: Building2, desc: "Flats, high-rises, studio apartments" },
  { name: "Plot", icon: Compass, desc: "Residential or commercial land" },
  { name: "Commercial", icon: Building2, desc: "Offices, plazas, retail shops" },
  { name: "Penthouse", icon: Sparkles, desc: "Luxury top-floor sky residences" }
];

const CITIES = Object.keys(PAKISTAN_LOCATIONS);

export default function SellPropertyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addProperty, updateProperty, properties, generateUniqueReferenceId } = useProperties();
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState({
    make: "House",
    model: "",
    type: "residential" as "residential" | "commercial" | "plot",
    year: "2024",
    condition: "ready" as "ready" | "under_construction" | "off_plan",
    mileage: "2250", // Sq. ft.
    engineSize: "5 Beds", // Summary display
    bedrooms: 4,
    bathrooms: 4,
    areaUnit: "marla" as "marla" | "kanal" | "sqft",
    areaSize: 10,
    transmission: "furnished" as "furnished" | "unfurnished" | "semi-furnished",
    fuelType: "house" as "house" | "apartment" | "penthouse" | "plot" | "commercial",
    city: "Lahore",
    area: "DHA Phase 6",
    location: "DHA Phase 6, Lahore",
    price: "45000000",
    description: "",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200"
    ] as string[],
    features: ["LDA / CDA / RDA Approved", "Imported Marble", "24/7 Security", "Backup Generator Ready"]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      const existing = properties.find(p => p.id === id);
      if (existing) {
        setFormData({
          make: existing.make || "House",
          model: existing.model || "",
          type: (existing.type as any) || "residential",
          year: existing.year?.toString() || "2024",
          condition: (existing.condition as any) || "ready",
          mileage: existing.mileage?.toString() || "2250",
          engineSize: existing.engineSize || "5 Beds",
          bedrooms: existing.bedrooms || existing.specs?.seating || 4,
          bathrooms: existing.bathrooms || existing.specs?.horsepower || 4,
          areaUnit: existing.areaUnit || "marla",
          areaSize: existing.areaSize || 10,
          transmission: (existing.transmission as any) || "furnished",
          fuelType: (existing.fuelType as any) || "house",
          city: existing.city || "Lahore",
          area: existing.area || "DHA Phase 6",
          location: existing.location || "DHA Phase 6, Lahore",
          price: existing.price?.toString() || "45000000",
          description: existing.description || "",
          images: existing.images || [],
          features: existing.features || ["LDA / CDA / RDA Approved", "Imported Marble", "24/7 Security"]
        });
      }
    }
  }, [id, properties]);

  const handleNext = () => {
    if (currentStep === 0 && !formData.model) {
      toast.error("Please enter a property title or headline");
      return;
    }
    if (currentStep === 3 && (!formData.price || Number(formData.price) <= 0)) {
      toast.error("Please enter a valid asking price");
      return;
    }
    setCurrentStep(prev => Math.min(STEPS.length - 1, prev + 1));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const propertyId = id || `prop-${Date.now()}`;
      const existing = properties.find(p => p.id === id);
      const refId = existing?.reference_id || generateUniqueReferenceId();

      const payload: Property = {
        id: propertyId,
        reference_id: refId,
        purpose: "for-sale",
        propertyType: formData.make,
        make: formData.make,
        model: formData.model || `${formData.areaSize} ${formData.areaUnit} ${formData.make}`,
        type: formData.make === "Commercial" ? "commercial" : (formData.make === "Plot" ? "plot" : "residential"),
        year: Number(formData.year) || 2024,
        price: Number(formData.price) || 0,
        mileage: Number(formData.mileage) || 2250,
        location: `${formData.area}, ${formData.city}`,
        city: formData.city,
        area: formData.area,
        bedrooms: Number(formData.bedrooms) || 0,
        bathrooms: Number(formData.bathrooms) || 0,
        areaUnit: formData.areaUnit,
        areaSize: Number(formData.areaSize) || 0,
        condition: formData.condition,
        transmission: formData.transmission,
        fuelType: formData.fuelType,
        engineSize: `${formData.bedrooms} Beds, ${formData.areaSize} ${formData.areaUnit}`,
        images: formData.images.length > 0 ? formData.images : ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200"],
        features: formData.features,
        description: formData.description || `Exceptional ${formData.make} in prime ${formData.area}, ${formData.city}. Complete title security, top-tier construction, and immediate possession.`,
        seller: {
          uid: user?.uid || "user-seller",
          name: profile?.displayName || user?.email?.split("@")[0] || "Authorized Real Estate Agent",
          isVerified: true,
          badgeType: (profile?.verified_badge_type as any) || "business",
          rating: 4.9
        },
        status: "active",
        createdAt: new Date().toISOString(),
        specs: {
          bedrooms: Number(formData.bedrooms) || 0,
          bathrooms: Number(formData.bathrooms) || 0,
          parkingSpaces: 2,
          furnishedStatus: formData.transmission
        }
      };

      if (id) {
        await updateProperty(id, payload);
        toast.success("Property listing updated successfully! 🏡✨");
      } else {
        await addProperty(payload);
        toast.success("Property listing published successfully! 🚀");
      }

      navigate(formatPropertyUrl(payload));
    } catch (err: any) {
      console.error("Listing submission error:", err);
      toast.error(err.message || "Failed to submit property listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-apple-bg">
      <Header />
      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-28 pb-20">
        
        {/* Step Indicator Header */}
        <div className="mb-10 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-apple-blue bg-apple-blue/10 px-3 py-1 rounded-full border border-apple-blue/20">
            Real Estate Listing Engine
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-apple-text mt-3">
            {id ? "Edit Property Listing" : "List Your Property"}
          </h1>
          <p className="text-apple-text-muted text-sm mt-1 max-w-lg mx-auto">
            Reach thousands of pre-qualified buyers and verified corporate investors nationwide.
          </p>
        </div>

        {/* Progress Navigation Steps */}
        <div className="flex items-center justify-between max-w-2xl mx-auto mb-10 overflow-x-auto pb-2">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = currentStep > idx;
            const isCurrent = currentStep === idx;
            return (
              <div key={step.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => idx < currentStep && setCurrentStep(idx)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                    isCurrent && "bg-apple-blue text-white shadow-md shadow-apple-blue/20",
                    isCompleted && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 cursor-pointer",
                    !isCurrent && !isCompleted && "bg-apple-gray text-apple-text-muted cursor-not-allowed"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{step.title}</span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className="w-4 h-[1px] bg-apple-border/40" />
                )}
              </div>
            );
          })}
        </div>

        {/* Main Step Body */}
        <div className="bg-apple-card-bg p-6 md:p-10 rounded-apple-2xl border border-apple-border/30 shadow-xl">
          <AnimatePresence mode="wait">
            {/* Step 0: Basics */}
            {currentStep === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-apple-text-muted mb-3">
                    Select Property Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PROPERTY_TYPES.map((pt) => {
                      const Icon = pt.icon;
                      const isSelected = formData.make === pt.name;
                      return (
                        <button
                          key={pt.name}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, make: pt.name, fuelType: pt.name.toLowerCase() as any }))}
                          className={cn(
                            "p-4 rounded-apple-xl border text-left transition-all cursor-pointer",
                            isSelected 
                              ? "border-apple-blue bg-apple-blue/5 dark:bg-apple-blue/10 ring-2 ring-apple-blue/20" 
                              : "border-apple-border hover:bg-apple-gray"
                          )}
                        >
                          <Icon className={cn("w-6 h-6 mb-2", isSelected ? "text-apple-blue" : "text-apple-text-muted")} />
                          <div className="text-sm font-bold text-apple-text">{pt.name}</div>
                          <div className="text-[11px] text-apple-text-muted mt-0.5">{pt.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-apple-text-muted mb-2">
                    Property Headline / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1 Kanal Modern Architectural Bungalow with Basement"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    className="apple-input w-full"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-apple-text-muted mb-2">
                      City
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="apple-input w-full"
                    >
                      {CITIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-apple-text-muted mb-2">
                      Locality / Phase / Sector
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. DHA Phase 6, Sector C"
                      value={formData.area}
                      onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value, location: `${e.target.value}, ${formData.city}` }))}
                      className="apple-input w-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 1: Specs & Layout */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-apple-text-muted mb-2">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={formData.bedrooms}
                      onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: Number(e.target.value) }))}
                      className="apple-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-apple-text-muted mb-2">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={formData.bathrooms}
                      onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: Number(e.target.value) }))}
                      className="apple-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-apple-text-muted mb-2">
                      Furnishing Status
                    </label>
                    <select
                      value={formData.transmission}
                      onChange={(e) => setFormData(prev => ({ ...prev, transmission: e.target.value as any }))}
                      className="apple-input w-full"
                    >
                      <option value="furnished">Furnished</option>
                      <option value="semi-furnished">Semi-Furnished</option>
                      <option value="unfurnished">Unfurnished</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-apple-text-muted mb-2">
                      Area Unit
                    </label>
                    <select
                      value={formData.areaUnit}
                      onChange={(e) => setFormData(prev => ({ ...prev, areaUnit: e.target.value as any }))}
                      className="apple-input w-full"
                    >
                      <option value="marla">Marla</option>
                      <option value="kanal">Kanal</option>
                      <option value="sqft">Sq. Ft.</option>
                      <option value="sqyd">Sq. Yards</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-apple-text-muted mb-2">
                      Total Area Size
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.areaSize}
                      onChange={(e) => {
                        const sz = Number(e.target.value);
                        const sqft = formData.areaUnit === "kanal" ? sz * 4500 : (formData.areaUnit === "marla" ? sz * 225 : sz);
                        setFormData(prev => ({ ...prev, areaSize: sz, mileage: sqft.toString() }));
                      }}
                      className="apple-input w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-apple-text-muted mb-2">
                    Property Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe architectural highlights, interior finishes, sunlight exposure, basement details, and location perks..."
                    className="apple-input w-full resize-none"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Visuals */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-apple-text-muted mb-2">
                    Property Images (URLs)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative rounded-apple-xl overflow-hidden aspect-[4/3] group border border-apple-border">
                        <img src={img} alt={`Property view ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                          className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    id="newImgUrl"
                    placeholder="Enter direct image URL (Unsplash or hosted CDN)"
                    className="apple-input flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = (e.currentTarget as HTMLInputElement).value.trim();
                        if (val) {
                          setFormData(prev => ({ ...prev, images: [...prev.images, val] }));
                          (e.currentTarget as HTMLInputElement).value = "";
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById("newImgUrl") as HTMLInputElement;
                      if (input && input.value.trim()) {
                        setFormData(prev => ({ ...prev, images: [...prev.images, input.value.trim()] }));
                        input.value = "";
                      }
                    }}
                    className="apple-button-secondary !py-2 !px-4"
                  >
                    Add Photo
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Pricing & Title */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-apple-text-muted mb-2">
                    Asking Price (PKR)
                  </label>
                  <input
                    type="number"
                    min={100000}
                    step={50000}
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="apple-input w-full text-xl font-bold"
                  />
                  <div className="text-xs font-semibold text-apple-blue mt-2">
                    Formatted: {formatPrice(Number(formData.price) || 0)} PKR
                  </div>
                </div>

                <div className="p-4 rounded-apple-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-1">
                    <FileCheck className="w-4 h-4" />
                    <span>Title Deed & Registry Assurance</span>
                  </div>
                  <p className="text-xs text-apple-text-muted leading-relaxed">
                    By submitting your property on Pakizzle, you confirm that you hold legal ownership or authorized agency representation with valid registry documentation.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 4: Review & Publish */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="p-6 rounded-apple-xl bg-apple-gray/50 border border-apple-border/30">
                  <h3 className="text-xl font-bold text-apple-text mb-1">{formData.model || "Untitled Listing"}</h3>
                  <div className="text-sm text-apple-text-muted mb-4">{formData.location}</div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
                    <div>
                      <span className="text-apple-text-muted block">Category:</span>
                      <span className="text-apple-text">{formData.make}</span>
                    </div>
                    <div>
                      <span className="text-apple-text-muted block">Layout:</span>
                      <span className="text-apple-text">{formData.bedrooms} Bed, {formData.bathrooms} Bath</span>
                    </div>
                    <div>
                      <span className="text-apple-text-muted block">Size:</span>
                      <span className="text-apple-text">{formData.areaSize} {formData.areaUnit}</span>
                    </div>
                    <div>
                      <span className="text-apple-text-muted block">Asking:</span>
                      <span className="text-apple-blue font-bold">{formatPrice(Number(formData.price) || 0)} PKR</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-apple-border/30">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                className="apple-button-secondary !py-2.5 !px-5 flex items-center gap-2 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            ) : <div />}

            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="apple-button-primary !py-2.5 !px-6 flex items-center gap-2 cursor-pointer"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="apple-button-primary !py-2.5 !px-8 flex items-center gap-2 cursor-pointer shadow-xl shadow-apple-blue/25"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? "Publishing..." : "Publish Listing"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const SellCarForm = SellPropertyForm;
