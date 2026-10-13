import type { Metadata } from "next";
import { seoConfig } from "@/constants/config/seo";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  imageAlt?: string;
};

/**
 * Per-page metadata: canonical URL plus Open Graph / Twitter cards that
 * match the page, so shared links (WhatsApp, Facebook, X) preview correctly.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
  imageAlt,
}: PageMetadataInput): Metadata {
  const fullTitle = `${title} | ${seoConfig.shortTitle}`;
  const images = [
    image
      ? { url: image, alt: imageAlt ?? title }
      : {
          url: seoConfig.openGraphImage,
          width: 1200,
          height: 630,
          alt: seoConfig.name,
        },
  ];

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: seoConfig.locale,
      siteName: seoConfig.name,
      url: path,
      title: fullTitle,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: images.map((entry) => entry.url),
    },
  };
}
