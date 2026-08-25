import type { MetadataRoute } from "next";
import { seoConfig } from "@/constants/config/seo";
import { destinations } from "@/constants/data/destinations";
import { experiences } from "@/constants/data/experiences";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: seoConfig.url,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...destinations.map((destination) => ({
      url: `${seoConfig.url}/destinations/${destination.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...experiences.map((experience) => ({
      url: `${seoConfig.url}/experiences/${experience.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
