import type { MetadataRoute } from "next";
import { seoConfig } from "@/constants/config/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: seoConfig.url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}

