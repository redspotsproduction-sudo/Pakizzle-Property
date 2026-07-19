import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product' | 'video.other';
  canonicalPath?: string;
  schema?: Record<string, any>;
}

export default function SEO({
  title,
  description = "Pakizzle is the premier elite automotive marketplace. Buy & sell certified luxury sports cars, supercars, and hypercars with dynamic reels, secure wallet transactions, and expert verify protocols.",
  keywords = [
    "luxury cars", "pakizzle", "buy supercars", "sell sports cars", 
    "certified pre-owned", "vehicle auction check", "premium car marketplace",
    "pakistan automotive", "verify vehicle history"
  ],
  ogImage = "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&h=630&q=80",
  ogType = "website",
  canonicalPath,
  schema
}: SEOProps) {

  const siteUrl = "https://pakizzle.com"; // Default production domain reference

  useEffect(() => {
    // 1. Title Management
    const fullTitle = title 
      ? `${title} | Pakizzle Premium Automotive Matrix` 
      : 'Pakizzle | Premium Automotive Matrix';
    
    document.title = fullTitle;

    // Helper to get or create a meta tag
    const getOrCreateMeta = (attributeName: string, attributeValue: string, attributeKey: 'name' | 'property' = 'name') => {
      let element = document.querySelector(`meta[${attributeKey}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeKey, attributeValue);
        document.head.appendChild(element);
      }
      return element;
    };

    // 2. Standard Metadata
    getOrCreateMeta('name', 'description').setAttribute('content', description);
    getOrCreateMeta('name', 'keywords').setAttribute('content', keywords.join(', '));
    getOrCreateMeta('name', 'robots').setAttribute('content', 'index, follow, max-image-preview:large');

    // 3. Open Graph (OG) tags
    const currentUrl = canonicalPath ? `${siteUrl}${canonicalPath}` : window.location.href;
    getOrCreateMeta('property', 'og:title', 'property').setAttribute('content', fullTitle);
    getOrCreateMeta('property', 'og:description', 'property').setAttribute('content', description);
    getOrCreateMeta('property', 'og:image', 'property').setAttribute('content', ogImage);
    getOrCreateMeta('property', 'og:url', 'property').setAttribute('content', currentUrl);
    getOrCreateMeta('property', 'og:type', 'property').setAttribute('content', ogType);
    getOrCreateMeta('property', 'og:site_name', 'property').setAttribute('content', 'Pakizzle');

    // 4. Twitter Cards
    getOrCreateMeta('name', 'twitter:card').setAttribute('content', 'summary_large_image');
    getOrCreateMeta('name', 'twitter:title').setAttribute('content', fullTitle);
    getOrCreateMeta('name', 'twitter:description').setAttribute('content', description);
    getOrCreateMeta('name', 'twitter:image').setAttribute('content', ogImage);

    // 5. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentUrl);

    // 6. JSON-LD Schema integration
    let schemaScript = document.getElementById('pakizzle-seo-schema') as HTMLScriptElement;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'pakizzle-seo-schema';
      schemaScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(schemaScript);
    }

    // Standard business schema if not custom provided
    const defaultSchema = {
      "@context": "https://schema.org",
      "@type": "AutoDealer",
      "name": "Pakizzle",
      "url": siteUrl,
      "logo": "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=300&q=80",
      "image": ogImage,
      "description": "Pakizzle Premium Automotive Matrix provides high-speed video reels, live luxury car listings, professional vehicle history evaluation, and unified billing solutions.",
      "telephone": "+923000000000",
      "priceRange": "$$$$",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Lahore",
        "addressCountry": "PK"
      }
    };

    const finalSchema = schema ? { ...schema, "@context": "https://schema.org" } : defaultSchema;
    schemaScript.innerHTML = JSON.stringify(finalSchema, null, 2);

    return () => {
      // Keep state clean on unmount
      // Schedulers can transition titles/schema smoothly between page views, so we don't clear instantly to avoid flashes
    };

  }, [title, description, keywords, ogImage, ogType, canonicalPath, schema]);

  return null; // Side-effect only component
}
