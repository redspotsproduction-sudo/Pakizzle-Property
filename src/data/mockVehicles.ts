import { Vehicle } from "../types";
import { PAKISTAN_LOCATIONS } from "../constants/locations";

const AGENCIES = [
  { uid: "user-redspots", name: "Redspots Real Estate", isVerified: true, rating: 4.9, badgeType: "business" },
  { uid: "agency-emaar", name: "Emaar Pakistan Properties", isVerified: true, rating: 5.0, badgeType: "business" },
  { uid: "agency-dha", name: "DHA Estates Official", isVerified: true, rating: 4.8, badgeType: "business" },
  { uid: "agency-zameen", name: "Pakizzle Heights Brokers", isVerified: true, rating: 4.9, badgeType: "business" }
];

const LOCATIONS = Object.keys(PAKISTAN_LOCATIONS);

const PROPERTY_TEMPLATES = [
  { make: "House", model: "Luxury Contemporary Villa", type: "residential", engine: "5 Beds", transmission: "furnished", fuel: "house" },
  { make: "Apartment", model: "Elite Executive Apartment", type: "residential", engine: "3 Beds", transmission: "semi-furnished", fuel: "apartment" },
  { make: "Commercial", model: "Premium Corporate Office Space", type: "commercial", engine: "Office Space", transmission: "unfurnished", fuel: "commercial" },
  { make: "Plot", model: "DHA Phase 6 Residential Land Plot", type: "plot", engine: "1 Kanal", transmission: "unfurnished", fuel: "plot" },
  { make: "Penthouse", model: "Grand Horizon Duplex Penthouse", type: "residential", engine: "4 Beds", transmission: "furnished", fuel: "penthouse" },
  { make: "House", model: "Spanish Design Luxury Bungalow", type: "residential", engine: "6 Beds", transmission: "unfurnished", fuel: "house" },
  { make: "Apartment", model: "HMR Waterfront Residence Flat", type: "residential", engine: "2 Beds", transmission: "unfurnished", fuel: "apartment" },
  { make: "Plot", model: "Bahria Town Elite Land Plot", type: "plot", engine: "10 Marla", transmission: "unfurnished", fuel: "plot" },
  { make: "Commercial", model: "Main Boulevard Commercial Retail Plaza", type: "commercial", engine: "Plaza Floor", transmission: "unfurnished", fuel: "commercial" },
  { make: "House", model: "Architectural Masterpiece Mansion", type: "residential", engine: "7 Beds", transmission: "furnished", fuel: "house" }
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

const generateProperties = (count: number): Vehicle[] => {
  const properties: Vehicle[] = [];
  for (let i = 1; i <= count; i++) {
    const base = PROPERTY_TEMPLATES[i % PROPERTY_TEMPLATES.length];
    const city = LOCATIONS[i % LOCATIONS.length];
    const cityAreas = AREAS[city] || ["Main Area"];
    const area = cityAreas[i % cityAreas.length];
    const yearBuilt = 2021 + (i % 6);
    
    // Sensible real estate pricing (PKR 1.2 Crore to PKR 45 Crore)
    const price = 12000000 + (Math.random() * 438000000);
    
    // Area Size in square feet (e.g. 10 Marla is ~2250, 1 Kanal is ~4500, etc.)
    const areaSizeSqFt = base.engine === "1 Kanal" ? 4500 : (base.engine === "10 Marla" ? 2250 : 1200 + (Math.random() * 6000));
    
    // Select an agency
    const agency = AGENCIES[i % AGENCIES.length];
    
    // Construct real-estate-specific descriptions
    const description = `This pristine ${base.make} located in ${area}, ${city} is a premier offering. Exclusively managed by ${agency.name}. Featuring high-quality finishes, spacious layouts, a modern structural design, and robust utility setups. Perfect for investors and premium home seekers. Built in ${yearBuilt} with double-height lobby, modern structural framing, and complete security integrations.`;
    
    properties.push({
      id: `v-${i}`,
      make: base.make, // E.g., "House", "Apartment", "Plot"
      model: base.model, // E.g., "Luxury Contemporary Villa"
      year: yearBuilt,
      price: Math.floor(price / 50000) * 50000,
      mileage: Math.floor(areaSizeSqFt), // Storing area size in square feet
      location: `${area}, ${city}`,
      city: city,
      area: area,
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
      createdAt: new Date(Date.now() - (i * 3600000)).toISOString(),
      status: "active",
      description: description,
      features: ["Premium Flooring", "24/7 Security", "Backup Generator", "Fitted Kitchen", "Boundary Wall", "Lawn/Garden"],
      specs: {
        horsepower: base.make === "Plot" ? 0 : 3 + (i % 5), // Will use this as "Baths"
        seating: base.make === "Plot" ? 0 : 2 + (i % 4), // Will use this as "Beds" or rooms
        driveTrain: i % 2 === 0 ? "FWD" : "AWD"
      }
    });
  }
  return properties;
};

export const MOCK_VEHICLES: Vehicle[] = generateProperties(55);
