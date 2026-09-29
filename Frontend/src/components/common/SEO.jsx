import React, { useEffect } from 'react';

/**
 * Reusable Dynamic SEO Component for Roots Classes React SPA
 * Updates document.title, meta tags, canonical link, and JSON-LD schema dynamically
 */
const SEO = ({
  title = "Best JEE & NEET Coaching in Ludhiana | Roots Classes",
  description = "Roots Classes is the premier coaching institute in Ludhiana for IIT JEE, NEET (UG), Foundation (Class 8-10), and Board exam preparation. Expert faculty, high selection rate, and scholarship tests up to 100%.",
  keywords = "Best JEE Coaching in Ludhiana, NEET Coaching Ludhiana, IIT JEE Classes Ludhiana, Best Coaching Institute in Ludhiana, Foundation Classes Ludhiana, Medical Entrance Coaching Ludhiana, Roots Classes Ludhiana",
  canonical = "https://rootsclasses.in/",
  ogType = "website",
  ogImage = "https://rootsclasses.in/logo.svg",
  schema = null
}) => {
  useEffect(() => {
    // 1. Update Title
    document.title = title;

    // Helper to set or create meta tag
    const setMetaTag = (attribute, name, content) => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);
    setMetaTag('name', 'title', title);

    // 3. Open Graph Tags
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonical);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:image', ogImage);

    // 4. Twitter Tags
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);

    // 5. Canonical Link
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonical);

    // 6. Dynamic JSON-LD Schema
    const existingSchemaScript = document.getElementById('page-dynamic-schema');
    if (existingSchemaScript) {
      existingSchemaScript.remove();
    }

    if (schema) {
      const script = document.createElement('script');
      script.id = 'page-dynamic-schema';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    }

    return () => {
      // Clean up dynamic schema on unmount
      const schemaScript = document.getElementById('page-dynamic-schema');
      if (schemaScript) {
        schemaScript.remove();
      }
    };
  }, [title, description, keywords, canonical, ogType, ogImage, schema]);

  return null;
};

export default SEO;
