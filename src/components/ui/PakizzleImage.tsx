import React, { useState } from "react";
import { cn } from "../../lib/utils";

export interface PakizzleImageProps {
  src: string;
  alt: string;
  aspectRatio?: "16/10" | "4/3" | "3/2" | "1/1" | "16/9" | "auto";
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  targetWidth?: number; // Capped width parameter (e.g. 600 for card, 1200 for hero)
  objectFit?: "cover" | "contain";
}

/**
 * Optimizes external URLs (Cloudinary, Unsplash) by appending responsive
 * format-negotiation (f_auto, q_auto:eco) and width bounds.
 */
function getOptimizedUrl(url: string, width?: number): string {
  if (!url) return "";

  // 1. Cloudinary URL optimization
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    const wParam = width ? `w_${width},` : "w_800,";
    const transform = `f_auto,q_auto:eco,c_fill,${wParam}`;
    return url.replace("/upload/", `/upload/${transform}/`);
  }

  // 2. Unsplash URL optimization
  if (url.includes("images.unsplash.com")) {
    const hasParams = url.includes("?");
    const wParam = width ? `&w=${width}` : "&w=800";
    if (hasParams) {
      // Replace existing w parameter if present, or append
      return url.replace(/&w=\d+/, "") + `${wParam}&auto=format&fit=crop&q=75`;
    }
    return `${url}?auto=format&fit=crop&q=75${wParam}`;
  }

  return url;
}

export const PakizzleImage: React.FC<PakizzleImageProps> = ({
  src,
  alt,
  aspectRatio = "3/2",
  priority = false,
  className,
  imgClassName,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  targetWidth,
  objectFit = "cover",
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const optimizedSrc = getOptimizedUrl(src, targetWidth);

  // Aspect ratio classes ensuring strict geometry reservation before download
  const aspectClass =
    aspectRatio === "16/10"
      ? "aspect-[16/10]"
      : aspectRatio === "4/3"
      ? "aspect-[4/3]"
      : aspectRatio === "3/2"
      ? "aspect-[3/2]"
      : aspectRatio === "1/1"
      ? "aspect-square"
      : aspectRatio === "16/9"
      ? "aspect-video"
      : "";

  return (
    <div
      className={cn(
        "relative overflow-hidden w-full bg-slate-100 dark:bg-[#1A1526]",
        aspectClass,
        className
      )}
    >
      {/* LQIP / Shimmer Skeleton placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-black/10 to-black/5 dark:from-white/5 dark:via-white/10 dark:to-white/5 animate-pulse" />
      )}

      <img
        src={optimizedSrc}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
        sizes={sizes}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "w-full h-full select-none transition-all duration-500",
          objectFit === "cover" ? "object-cover object-center" : "object-contain",
          !isLoaded ? "opacity-0 scale-[1.02] blur-xs" : "opacity-100 scale-100 blur-0",
          imgClassName
        )}
      />
    </div>
  );
};

export default PakizzleImage;
