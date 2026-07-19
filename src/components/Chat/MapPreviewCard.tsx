import React from 'react';
import { MapPin, ExternalLink, CheckCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MapPreviewCardProps {
  lat: number;
  lng: number;
  address?: string;
  isMe?: boolean;
  timestamp: string;
  status?: string;
}

export default function MapPreviewCard({ lat, lng, timestamp, isMe, status }: MapPreviewCardProps) {
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  
  return (
    <a 
      href={googleMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block group cursor-pointer overflow-hidden rounded-[22px] bg-apple-card-bg shadow-apple-soft border border-apple-border/30 transition-all duration-500 hover:shadow-apple-hover hover:-translate-y-1"
    >
      {/* Map Preview Container */}
      <div className="w-full aspect-[4/3] md:w-[300px] md:h-[220px] relative flex items-center justify-center overflow-hidden">
        {/* The Map Iframe */}
        <iframe
          title="Location Preview"
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src={`https://www.google.com/maps/embed/v1/view?key=${(import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || ''}&center=${lat},${lng}&zoom=15&maptype=roadmap`}
          allowFullScreen
          className="opacity-95 group-hover:opacity-100 transition-opacity duration-700"
        />
        
        {/* Elegant Pin Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            <div className="w-14 h-14 bg-apple-red rounded-full flex items-center justify-center shadow-2xl shadow-apple-red/50 animate-bounce-slow">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <div className="w-4 h-1.5 bg-black/20 rounded-full blur-[4px] mx-auto mt-2 scale-x-150" />
          </div>
        </div>

        {/* Apple-style Glassmorphism Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-apple-card-bg backdrop-blur-[20px] border-t border-apple-border/40 flex items-center justify-between transition-all duration-500 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-apple-blue tracking-tight hover:underline">
              View on map
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-apple-blue" />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-apple-text/50 uppercase tracking-tighter">
              {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}
            </span>
            {isMe && (
              <CheckCheck className={cn(
                "w-4 h-4 transition-colors",
                status === 'read' ? "text-apple-blue" : "text-apple-text/20"
              )} />
            )}
          </div>
        </div>

        {/* Static Timestamp for non-hover state */}
        <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/20 backdrop-blur-md rounded-full group-hover:opacity-0 transition-opacity duration-300">
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}
          </span>
        </div>
      </div>
    </a>
  );
}
