import React, { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LocationButtonProps {
  onLocationFetched: (location: { lat: number; lng: number; accuracy: number }) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export default function LocationButton({ onLocationFetched, onError, disabled }: LocationButtonProps) {
  const [isFetching, setIsFetching] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      onError("Geolocation is not supported by your browser");
      return;
    }

    setIsFetching(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsFetching(false);
        onLocationFetched({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        setIsFetching(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            onError("Permission denied. Please allow location access in your browser settings. If you're in the preview, try opening the app in a new tab.");
            break;
          case error.POSITION_UNAVAILABLE:
            onError("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            onError("The request to get user location timed out.");
            break;
          default:
            onError("An unknown error occurred while fetching location.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <button 
      onClick={handleGetLocation}
      disabled={disabled || isFetching}
      className={cn(
        "p-3 hover:bg-apple-gray rounded-full text-apple-text-muted transition-all active:scale-90 relative",
        isFetching && "text-apple-blue"
      )}
      title="Share Location"
    >
      {isFetching ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <MapPin className="w-5 h-5" />
      )}
    </button>
  );
}
