import { Vehicle } from "../types";
import { PAKISTAN_LOCATIONS } from "../constants/locations";

const SELLER_INFO = { 
  uid: "user-redspots", 
  name: "Redspots Productions", 
  isVerified: true, 
  rating: 5.0 
};

const LOCATIONS = Object.keys(PAKISTAN_LOCATIONS);

const MAKES_MODELS = [
  { make: "Toyota", model: "Corolla Altis", type: "car", engine: "1.6L", transmission: "automatic", fuel: "petrol" },
  { make: "Honda", model: "Civic RS", type: "car", engine: "1.5L Turbo", transmission: "automatic", fuel: "petrol" },
  { make: "Suzuki", model: "Swift", type: "car", engine: "1.2L", transmission: "automatic", fuel: "petrol" },
  { make: "Audi", model: "A6", type: "car", engine: "2.0L", transmission: "automatic", fuel: "petrol" },
  { make: "BMW", model: "5 Series", type: "car", engine: "2.0L", transmission: "automatic", fuel: "petrol" },
  { make: "Mercedes-Benz", model: "C-Class", type: "car", engine: "1.5L Turbo", transmission: "automatic", fuel: "petrol" },
  { make: "Hyundai", model: "Tucson", type: "car", engine: "2.0L", transmission: "automatic", fuel: "petrol" },
  { make: "Kia", model: "Sportage", type: "car", engine: "2.0L", transmission: "automatic", fuel: "petrol" },
  { make: "MG", model: "HS", type: "car", engine: "1.5L Turbo", transmission: "automatic", fuel: "petrol" },
  { make: "Changan", model: "Alsvin", type: "car", engine: "1.5L", transmission: "automatic", fuel: "petrol" },
  { make: "Toyota", model: "Fortuner", type: "car", engine: "2.8L Sigma 4", transmission: "automatic", fuel: "diesel" },
  { make: "Toyota", model: "Land Cruiser", type: "car", engine: "3.5L V6", transmission: "automatic", fuel: "petrol" },
  { make: "Honda", model: "City", type: "car", engine: "1.5L", transmission: "automatic", fuel: "petrol" },
  { make: "Suzuki", model: "Alto", type: "car", engine: "660cc", transmission: "manual", fuel: "petrol" },
  { make: "Suzuki", model: "Cultus", type: "car", engine: "1.0L", transmission: "automatic", fuel: "petrol" },
  { make: "Tesla", model: "Model 3", type: "car", engine: "Electric", transmission: "automatic", fuel: "electric" },
  { make: "Porsche", model: "Taycan", type: "car", engine: "Electric", transmission: "automatic", fuel: "electric" },
  { make: "Range Rover", model: "Vogue", type: "car", engine: "3.0L", transmission: "automatic", fuel: "hybrid" },
  { make: "Lexus", model: "LX570", type: "car", engine: "5.7L V8", transmission: "automatic", fuel: "petrol" },
  { make: "Ford", model: "Mustang", type: "car", engine: "5.0L V8", transmission: "automatic", fuel: "petrol" }
];

const IMAGES = [
  "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1606611013016-969c19ba27bb?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1525609004556-c46c7d6cf048?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=1200"
];

const AREAS = PAKISTAN_LOCATIONS;

const generateVehicles = (count: number): Vehicle[] => {
  const vehicles: Vehicle[] = [];
  for (let i = 1; i <= count; i++) {
    const base = MAKES_MODELS[i % MAKES_MODELS.length];
    const city = LOCATIONS[i % LOCATIONS.length];
    const cityAreas = AREAS[city] || ["Main Area"];
    const area = cityAreas[i % cityAreas.length];
    const year = 2020 + (i % 5);
    const price = 2000000 + (Math.random() * 80000000);
    const mileage = Math.floor(Math.random() * 50000);
    
    vehicles.push({
      id: `v-${i}`,
      make: base.make,
      model: base.model,
      year: year,
      price: Math.floor(price / 10000) * 10000,
      mileage: mileage,
      location: `${area}, ${city}`,
      city: city,
      area: area,
      images: [
        IMAGES[i % IMAGES.length],
        IMAGES[(i + 1) % IMAGES.length],
        IMAGES[(i + 2) % IMAGES.length]
      ],
      type: base.type as any,
      condition: i % 3 === 0 ? "new" : "used",
      transmission: base.transmission as any,
      fuelType: base.fuel as any,
      engineSize: base.engine,
      seller: SELLER_INFO,
      isFeatured: i % 4 === 0,
      createdAt: new Date(Date.now() - (i * 3600000)).toISOString(),
      status: "active",
      description: `This ${year} ${base.make} ${base.model} is in excellent condition. Maintained by Redspots Productions. Features include ${base.engine} engine, ${base.transmission} transmission, and premium interior.`,
      features: ["Power Windows", "ABS", "Airbags", "Alloy Rims", "Navigation"],
      specs: {
        horsepower: 150 + (i % 100),
        seating: 5,
        driveTrain: i % 2 === 0 ? "FWD" : "AWD"
      }
    });
  }
  return vehicles;
};

export const MOCK_VEHICLES: Vehicle[] = generateVehicles(55);
