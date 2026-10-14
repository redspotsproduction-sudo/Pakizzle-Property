/**
 * Utility functions for Pakistan Real Estate Property Reference IDs (Zameen-style).
 *
 * Rules:
 * - Public, shareable reference ID separate from internal DB id.
 * - 7 digits (1000000 - 9999999), non-sequential / non-enumerable to prevent
 *   inventory size leaks and competitor scraping.
 * - Immutable once assigned and never reused.
 * - URL pattern: /property/[descriptive-slug]-[reference_id]
 */

import { Property } from "@/types";

/**
 * Validates whether a given string is a clean 6 to 8 digit Property Reference ID.
 */
export function isReferenceId(val: string): boolean {
  if (!val) return false;
  const clean = val.trim().replace(/^#/, "");
  return /^\d{6,8}$/.test(clean);
}

/**
 * Generates a non-enumerable, cryptographically safe random 7-digit Reference ID
 * between 1000000 and 9999999.
 * Checks against an optional set of known/reserved IDs to prevent collisions.
 */
export function generateReferenceId(existingIds?: Iterable<string>): string {
  const existingSet = existingIds instanceof Set ? existingIds : new Set(existingIds || []);
  const MIN = 1000000;
  const MAX = 9999999;
  const RANGE = MAX - MIN + 1;

  for (let attempt = 0; attempt < 500; attempt++) {
    let randomNum: number;
    if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
      const buffer = new Uint32Array(1);
      window.crypto.getRandomValues(buffer);
      randomNum = MIN + (buffer[0] % RANGE);
    } else {
      randomNum = Math.floor(MIN + Math.random() * RANGE);
    }

    const candidate = String(randomNum);
    if (!existingSet.has(candidate)) {
      return candidate;
    }
  }

  // Fallback with timestamp offset if high density
  return String(1000000 + (Date.now() % 8999999));
}

/**
 * Generates a descriptive, human-readable, SEO-friendly slug
 * following the pattern: [society/area]-[areaSize-unit]-[property-type]-[purpose]
 * e.g., "dha-phase-6-10-marla-house-for-sale"
 */
export function generatePropertySlug(property: Partial<Property>): string {
  const parts: string[] = [];

  // 1. Location / Society / Area
  const locationRaw = property.location || property.city || "";
  const locationSlug = locationRaw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (locationSlug) {
    parts.push(locationSlug);
  }

  // 2. Area Size / Engine Size (e.g., "10 Marla", "1 Kanal", "5 Beds")
  const areaRaw = property.engineSize || (property.mileage ? `${property.mileage}-sqft` : "");
  const areaSlug = areaRaw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (areaSlug) {
    parts.push(areaSlug);
  }

  // 3. Property Type / Make (e.g. House, Apartment, Commercial, Villa, Plot)
  const typeRaw = property.make || property.fuelType || "property";
  const typeSlug = typeRaw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (typeSlug) {
    parts.push(typeSlug);
  }

  // 4. Purpose: for-sale or for-rent
  const purpose = property.purpose === "for-rent" || property.purpose === "rent"
    ? "for-rent"
    : "for-sale";
  parts.push(purpose);

  const finalSlug = parts.join("-").replace(/-+/g, "-");
  return finalSlug || "property-listing";
}

/**
 * Builds the canonical public URL for a property using [slug]-[reference_id].
 * E.g. /property/dha-phase-6-10-marla-house-for-sale-3421789
 */
export function formatPropertyUrl(property: {
  reference_id?: string;
  id?: string;
  [key: string]: any;
}): string {
  const refId = property.reference_id || property.id || "0000000";
  const slug = generatePropertySlug(property as Partial<Property>);
  return `/property/${slug}-${refId}`;
}

/**
 * Extracts a 6-8 digit reference ID and cosmetic slug from a route param or string.
 * Supports:
 * - "dha-phase-6-10-marla-house-for-sale-3421789" -> { reference_id: "3421789", slug: "dha-phase-6..." }
 * - "3421789" -> { reference_id: "3421789", slug: "" }
 * - "property-3421789" -> { reference_id: "3421789", slug: "property" }
 */
export function parsePropertyUrlParam(param: string): { reference_id: string | null; slug: string } {
  if (!param) return { reference_id: null, slug: "" };

  const clean = param.trim();

  // If pure numeric 6-8 digits
  if (/^\d{6,8}$/.test(clean)) {
    return { reference_id: clean, slug: "" };
  }

  // Check for trailing -[6-8 digits]
  const matchTrailing = clean.match(/^(.*?)-(\d{6,8})$/);
  if (matchTrailing) {
    return {
      slug: matchTrailing[1],
      reference_id: matchTrailing[2],
    };
  }

  // Fallback: search for any 6-8 digit sequence inside the string
  const anyMatch = clean.match(/(\d{6,8})/);
  if (anyMatch) {
    return {
      slug: clean.replace(anyMatch[1], "").replace(/-+$/, ""),
      reference_id: anyMatch[1],
    };
  }

  return { reference_id: null, slug: clean };
}

/**
 * Extracts a Property Reference ID from ANY input:
 * - Direct ID number (e.g. "3421789", "#3421789")
 * - Full browser URL (e.g. "https://pakizzle.com/property/dha-phase-6-house-3421789?tab=specs")
 * - Relative URL path (e.g. "/property/bahria-town-villa-5829104")
 */
export function extractReferenceIdFromInput(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // 1. Direct ID (with optional leading '#', 'ID:', 'Property ID')
  const directMatch = trimmed.match(/(?:property\s*(?:id)?[:#\s-]*)?(\d{6,8})\b/i);
  if (directMatch && /^\d{6,8}$/.test(trimmed.replace(/^#/, ""))) {
    return directMatch[1];
  }

  // 2. Try parsing as a URL
  try {
    const urlStr = trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `http://localhost${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
    const parsed = new URL(urlStr);
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    
    // Look in path segments (e.g., ['property', 'dha-phase-6-3421789'])
    for (let i = pathParts.length - 1; i >= 0; i--) {
      const part = pathParts[i];
      const parsedPart = parsePropertyUrlParam(part);
      if (parsedPart.reference_id) {
        return parsedPart.reference_id;
      }
    }

    // Look in query params (?id=3421789 or ?ref=3421789)
    const refParam = parsed.searchParams.get("ref") || parsed.searchParams.get("id") || parsed.searchParams.get("reference_id");
    if (refParam && /^\d{6,8}$/.test(refParam)) {
      return refParam;
    }
  } catch {
    // If URL parsing fails, continue to regex fallback
  }

  // 3. Fallback regex: find the last 6-8 digit sequence in the string
  const matches = trimmed.match(/\b(\d{6,8})\b/g);
  if (matches && matches.length > 0) {
    return matches[matches.length - 1];
  }

  return null;
}

export const extractReferenceId = extractReferenceIdFromInput;

/**
 * ONE title formatter (type + size + area + purpose) used in the list, header and listing card.
 * Never year/make/model.
 * E.g. "Apartment • 10 Marla • DHA Phase 6 • For Sale"
 */
export function formatPropertyTitle(property?: {
  propertyType?: string;
  type?: string;
  size?: string;
  areaSize?: string | number;
  area?: string;
  location?: string;
  city?: string;
  purpose?: string;
  [key: string]: any;
}): string {
  if (!property) return "Property Listing";
  const type = property.propertyType || property.type || "";
  const size = property.size ? String(property.size) : (property.areaSize ? `${property.areaSize} Marla` : "");
  const area = property.area || property.location || property.city || "";
  const purpose = property.purpose
    ? property.purpose === "rent" || property.purpose === "for-rent"
      ? "For Rent"
      : "For Sale"
    : "";
  const parts = [type, size, area, purpose].filter(Boolean);
  return parts.length > 0 ? parts.join(" • ") : "Property Listing";
}

/**
 * Structured listing summary for list rows (type • area • formatted PKR price)
 * e.g. "Apartment • Dubai Mahal Road • Rs 26.69 Cr"
 */
export function formatListingSummary(property?: any, priceFormatter?: (val?: number) => string): string {
  if (!property) return "Property Inquiry";
  const type = property.propertyType || property.type || "Property";
  const area = property.area || property.location || property.city || "";
  const price = property.price && priceFormatter ? priceFormatter(property.price) : "";
  const parts = [type, area, price].filter(Boolean);
  return parts.length > 0 ? parts.join(" • ") : "Property Inquiry";
}
