import { seoConfig } from "@/constants/config/seo";

/**
 * OrganizationSchema
 *
 * Injects JSON-LD structured data so search engines understand
 * that TransVista is a travel organization based in Ghana.
 *
 * This improves semantic understanding and prepares the site
 * for richer search results (knowledge panel, rich snippets).
 *
 * @see https://schema.org/Organization
 *
 * @todo — Add WebsiteSchema, BreadcrumbSchema, FAQSchema,
 *         TouristDestinationSchema as the platform grows.
 */
export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",

    name: seoConfig.name,

    url: seoConfig.url,

    logo: `${seoConfig.url}/images/TransVista logo.jpeg`,

    description: seoConfig.description,

    email: "info@transvistaafrica.com",

    telephone: "+233248442916",

    address: {
      "@type": "PostalAddress",
      addressLocality: "Accra",
      addressCountry: "GH",
    },

    areaServed: {
      "@type": "Country",
      name: "Ghana",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

