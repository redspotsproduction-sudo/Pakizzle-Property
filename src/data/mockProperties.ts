import { Property } from "../types";
import { PAKISTAN_LOCATIONS } from "../constants/locations";

const AGENCIES = [
  { uid: "user-redspots", name: "Redspots Real Estate", isVerified: true, rating: 4.9, badgeType: "business" as const, verified_badge_type: "business" as const },
  { uid: "agency-emaar", name: "Emaar Pakistan Properties", isVerified: true, rating: 5.0, badgeType: "business" as const, verified_badge_type: "business" as const },
  { uid: "seller-tariq", name: "Tariq Mahmood (Verified Seller)", isVerified: true, rating: 4.8, badgeType: "identity" as const, verified_badge_type: "identity" as const },
  { uid: "seller-ahmed", name: "Ahmed Malik (Private Owner)", isVerified: true, rating: 4.7, badgeType: "basic" as const, verified_badge_type: "basic" as const },
  { uid: "agency-dha", name: "DHA Estates Official", isVerified: true, rating: 4.9, badgeType: "business" as const, verified_badge_type: "business" as const },
  { uid: "seller-new", name: "Usman Builders & Homes", isVerified: false, rating: 4.5, badgeType: "none" as const, verified_badge_type: "none" as const }
];

const LOCATIONS = Object.keys(PAKISTAN_LOCATIONS);

const PROPERTY_TEMPLATES = [
  { make: "House", model: "Luxury Contemporary Villa", type: "residential", engine: "5 Beds", transmission: "furnished", fuel: "house", beds: 5, baths: 6, unit: "1 Kanal" },
  { make: "Apartment", model: "Elite Executive Apartment", type: "residential", engine: "3 Beds", transmission: "semi-furnished", fuel: "apartment", beds: 3, baths: 3, unit: "2000 Sq. Ft." },
  { make: "Commercial", model: "Premium Corporate Office Space", type: "commercial", engine: "Office Space", transmission: "unfurnished", fuel: "commercial", beds: 0, baths: 4, unit: "4500 Sq. Ft." },
  { make: "Plot", model: "DHA Phase 6 Residential Land Plot", type: "plot", engine: "1 Kanal", transmission: "unfurnished", fuel: "plot", beds: 0, baths: 0, unit: "1 Kanal" },
  { make: "Penthouse", model: "Grand Horizon Duplex Penthouse", type: "residential", engine: "4 Beds", transmission: "furnished", fuel: "penthouse", beds: 4, baths: 5, unit: "3800 Sq. Ft." },
  { make: "House", model: "Spanish Design Luxury Bungalow", type: "residential", engine: "6 Beds", transmission: "unfurnished", fuel: "house", beds: 6, baths: 7, unit: "2 Kanal" },
  { make: "Apartment", model: "HMR Waterfront Residence Flat", type: "residential", engine: "2 Beds", transmission: "unfurnished", fuel: "apartment", beds: 2, baths: 2, unit: "1450 Sq. Ft." },
  { make: "Plot", model: "Bahria Town Elite Land Plot", type: "plot", engine: "10 Marla", transmission: "unfurnished", fuel: "plot", beds: 0, baths: 0, unit: "10 Marla" },
  { make: "Commercial", model: "Main Boulevard Commercial Retail Plaza", type: "commercial", engine: "Plaza Floor", transmission: "unfurnished", fuel: "commercial", beds: 0, baths: 2, unit: "3200 Sq. Ft." },
  { make: "House", model: "Architectural Masterpiece Mansion", type: "residential", engine: "7 Beds", transmission: "furnished", fuel: "house", beds: 7, baths: 8, unit: "4 Kanal" }
];

const IMAGES = [
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200", // Mansion Exterior
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200", // Apartment High-Rise
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200", // Villa Exterior
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200", // Luxury Living Room
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200", // Corporate Glass Tower
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200", // Modern Kitchen
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200", // Penthouse Patio/Pool
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200", // Corporate Office
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200", // Green Plot/Land
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200"  // Villa Poolside
];

const AREAS = PAKISTAN_LOCATIONS;

const generateProperties = (count: number): Property[] => {
  const properties: Property[] = [];
  for (let i = 1; i <= count; i++) {
    const base = PROPERTY_TEMPLATES[i % PROPERTY_TEMPLATES.length];
    const city = LOCATIONS[i % LOCATIONS.length];
    const cityAreas = AREAS[city] || ["Main Boulevard", "Sector F", "Phase 5"];
    const area = cityAreas[i % cityAreas.length];
    const yearBuilt = 2021 + (i % 6);
    
    // Sensible real estate pricing (PKR 1.2 Crore to PKR 45 Crore)
    const price = 12000000 + (Math.random() * 438000000);
    
    // Area Size in square feet (e.g. 10 Marla is ~2250, 1 Kanal is ~4500, etc.)
    const areaSizeSqFt = base.engine === "1 Kanal" ? 4500 : (base.engine === "10 Marla" ? 2250 : 1200 + (Math.random() * 6000));
    
    // Select an agency
    const agency = AGENCIES[i % AGENCIES.length];
    
    // Construct real-estate-specific descriptions
    const description = `This pristine ${base.make} located in ${area}, ${city} is a premier offering. Exclusively managed by ${agency.name}. Featuring high-quality architectural finishes, spacious master suites, imported marble flooring, designer open-concept kitchen, and robust utility infrastructure (water filtration, solar back-up readiness, 24/7 security). Perfect for discerning families and institutional property investors. Built in ${yearBuilt} with complete legal title deeds.`;
    
    // Construct authentic non-sequential 7-digit Property Reference ID (Zameen style)
    // First items have iconic reference IDs including 3421789 requested in the specification
    const KNOWN_REF_IDS = ["3421789", "5829104", "7192843", "4839201", "8391024", "9201845", "6482019", "7291840"];
    const referenceId = i <= KNOWN_REF_IDS.length 
      ? KNOWN_REF_IDS[i - 1] 
      : String(1000000 + ((i * 3829471) % 8999999));

    const purpose: "for-sale" | "for-rent" = i % 4 === 0 ? "for-rent" : "for-sale";

    properties.push({
      id: `prop-${i}`,
      reference_id: referenceId,
      purpose: purpose,
      propertyType: base.make, // E.g., "House", "Apartment", "Plot", "Commercial", "Penthouse"
      make: base.make,
      model: base.model, // E.g., "Luxury Contemporary Villa"
      year: yearBuilt,
      price: Math.floor(price / 50000) * 50000,
      mileage: Math.floor(areaSizeSqFt), // Storing covered area in sq. ft.
      location: `${area}, ${city}`,
      city: city,
      area: area,
      bedrooms: base.beds,
      bathrooms: base.baths,
      images: [
        IMAGES[i % IMAGES.length],
        IMAGES[(i + 1) % IMAGES.length],
        IMAGES[(i + 2) % IMAGES.length]
      ],
      type: base.type as any, // 'residential' | 'commercial' | 'plot'
      condition: i % 3 === 0 ? "ready" : (i % 3 === 1 ? "under_construction" : "off_plan"),
      transmission: base.transmission as any, // 'furnished' | 'unfurnished' | 'semi-furnished'
      fuelType: base.fuel as any, // 'house' | 'apartment' | 'penthouse' | 'plot' | 'commercial'
      engineSize: base.engine, // E.g., "5 Beds", "3 Beds", "1 Kanal"
      seller: agency as any,
      isFeatured: i % 4 === 0,
      createdAt: (() => {
        // Stagger creation dates across the past 90 days
        const daysAgo = (i * 2.5) % 85 + 2;
        return new Date(Date.now() - (daysAgo * 86400000)).toISOString();
      })(),
      last_confirmed_active: (() => {
        // Seed specific realistic freshness scenarios for verification:
        if (i === 12) return new Date(Date.now() - (71 * 86400000)).toISOString(); // Expired (>67 days)
        if (i === 15) return new Date(Date.now() - (63 * 86400000)).toISOString(); // Pending confirmation (60-67 days)
        if (i === 18) return new Date(Date.now() - (56 * 86400000)).toISOString(); // Approaching threshold (50-59 days)
        if (i === 24) return new Date(Date.now() - (65 * 86400000)).toISOString(); // Pending confirmation
        if (i === 30) return new Date(Date.now() - (75 * 86400000)).toISOString(); // Expired
        // Standard fresh confirmation: active within the last 1 to 25 days
        const confirmedDaysAgo = (i % 22) + 1;
        return new Date(Date.now() - (confirmedDaysAgo * 86400000)).toISOString();
      })(),
      freshness_status: i === 12 || i === 30 ? "expired" : (i === 15 || i === 24 ? "stale_pending_confirmation" : (i === 18 ? "approaching_stale" : "fresh")),
      status: i === 12 || i === 30 ? "expired" : "active",
      description: description,
      features: [
        "LDA / CDA / RDA Approved",
        "Imported Italian Marble",
        "24/7 Gated Security",
        "Backup Solar / Generator Ready",
        "Fitted Italian Kitchen",
        "Corner Plot Advantage",
        "Lawn / Roof Terrace Garden",
        "Dedicated Basement Parking"
      ],
      specs: {
        bedrooms: base.beds,
        bathrooms: base.baths,
        floors: base.make === "House" ? 2 : 1,
        parkingSpaces: base.make === "House" ? 3 : 1,
        furnishedStatus: base.transmission,
        facing: i % 2 === 0 ? "Park Facing" : "Main Boulevard",
        horsepower: base.baths,
        seating: base.beds,
        driveTrain: "AWD"
      }
    });
  }
  return properties;
};

export const MOCK_PROPERTIES: Property[] = generateProperties(55);
export const MOCK_VEHICLES: Property[] = MOCK_PROPERTIES;
