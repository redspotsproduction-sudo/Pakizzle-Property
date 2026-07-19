import React from "react";
import { TrendingUp } from "lucide-react";

interface MarketPulseTickerProps {
  locationCity?: string;
}

const MarketPulseTicker = React.memo(({ locationCity }: MarketPulseTickerProps) => {
  const tickerItems = [
    "Audi e-tron GT demand ↑ 12%",
    `Average price in ${locationCity || 'Lahore'}: Rs 14.2M`,
    "New listing: Porsche 911 in Karachi",
    "EV imports tax update: 0% duty extended",
    "Trending: Hybrid SUVs in Islamabad",
    "Japanese Auction volume ↑ 18% this week"
  ];

  return (
    <div className="bg-apple-card-bg backdrop-blur-md border-y border-apple-border/20 py-4 overflow-hidden shadow-apple-soft">
      <div className="max-w-7xl mx-auto px-6 flex items-center gap-10 whitespace-nowrap">
        <div className="flex items-center gap-3 text-[11px] font-semibold text-apple-blue uppercase tracking-[0.2em] shrink-0">
          <TrendingUp className="w-4 h-4" />
          Neural Market Pulse
        </div>
        <div className="flex items-center gap-12 animate-marquee">
          {tickerItems.map((item, i) => (
            <span key={i} className="text-[13px] font-medium text-apple-text flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-apple-blue/30" />
              {item}
            </span>
          ))}
          {/* Duplicate for infinite effect if needed, though simple animation works */}
          {tickerItems.map((item, i) => (
            <span key={`dup-${i}`} className="text-[13px] font-medium text-apple-text flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-apple-blue/30" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});

MarketPulseTicker.displayName = "MarketPulseTicker";

export default MarketPulseTicker;
