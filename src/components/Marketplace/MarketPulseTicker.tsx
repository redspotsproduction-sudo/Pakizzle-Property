import React from "react";
import { TrendingUp } from "lucide-react";

interface MarketPulseTickerProps {
  locationCity?: string;
}

const MarketPulseTicker = React.memo(({ locationCity }: MarketPulseTickerProps) => {
  const tickerItems = [
    `Average price in DHA Phase 6, ${locationCity || 'Lahore'}: ↑ 6% this month`,
    "Searches for 10-Marla plots in Bahria Town ↑ 18% this week",
    `New listing: 1 Kanal Luxury House in Clifton, ${locationCity === 'Karachi' ? 'Karachi' : 'Lahore'}`,
    "State Bank of Pakistan Home Finance policy update: Fixed rates certified",
    "Trending: Commercial Plaza in Blue Area, Islamabad",
    "32 new LDA/CDA verified properties added today"
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
