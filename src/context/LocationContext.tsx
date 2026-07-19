import React, { createContext, useContext, useState, useEffect } from 'react';
import { PAKISTAN_LOCATIONS, CITY_PROVINCE_MAP } from '../constants/locations';

export interface UserLocation {
  city: string;
  area?: string;
  province?: string;
  lat?: number;
  lng?: number;
  isAutoDetected: boolean;
}

interface LocationContextType {
  location: UserLocation | null;
  setLocation: (location: UserLocation) => void;
  availableCities: string[];
  areasByCity: Record<string, string[]>;
  detectLocation: () => Promise<void>;
  isLoading: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const CITIES = Object.keys(PAKISTAN_LOCATIONS);

const AREAS = PAKISTAN_LOCATIONS;

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<UserLocation | null>(() => {
    const saved = localStorage.getItem('user_location');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const setLocation = (newLoc: UserLocation) => {
    setLocationState(newLoc);
    localStorage.setItem('user_location', JSON.stringify(newLoc));
  };

  const detectLocation = async () => {
    setIsLoading(true);
    try {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            // In a real app, we'd use reverse geocoding here
            // For now, let's simulate detecting a city based on coordinates
            // or just default to a city for the demo
            const detectedCity = "Lahore";
            const detectedLocation: UserLocation = {
              city: detectedCity,
              area: "Gulberg III",
              province: CITY_PROVINCE_MAP[detectedCity],
              lat: latitude,
              lng: longitude,
              isAutoDetected: true
            };
            setLocation(detectedLocation);
            setIsLoading(false);
          },
          (error) => {
            console.error("Error detecting location:", error);
            setIsLoading(false);
          }
        );
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <LocationContext.Provider value={{ 
      location, 
      setLocation, 
      availableCities: CITIES, 
      areasByCity: AREAS,
      detectLocation,
      isLoading
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
