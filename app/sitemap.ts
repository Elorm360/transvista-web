import type { MetadataRoute } from "next";
import { seoConfig } from "@/constants/config/seo";
import { destinations } from "@/constants/data/destinations";
import { experiences } from "@/constants/data/experiences";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const admin = createAdminClient();
  const { data: events, error } = await admin.from("travel_events")
    .select("slug,status,updated_at")
    .in("status", ["published", "registration_closed", "completed"]);
  if (error) console.error("[sitemap] Event URLs could not be loaded:", error);

  return [
    {
      url: seoConfig.url,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${seoConfig.url}/plan`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${seoConfig.url}/stories`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${seoConfig.url}/past-events`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${seoConfig.url}/past-events/central-region-heritage-adventure-2026`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...["/destinations", "/trips", "/contact", "/privacy", "/terms"].map(
      (path) => ({
        url: `${seoConfig.url}${path}`,
        lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }),
    ),
    {
      url: `${seoConfig.url}/policies/payment-booking-refunds`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...destinations.map((destination) => ({
      url: `${seoConfig.url}/destinations/${destination.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...(events ?? []).filter((event) => event.slug !== "central-region-heritage-adventure-2026").map((event) => ({
      url: `${seoConfig.url}/${event.status === "completed" ? "past-events" : "trips"}/${event.slug}`,
      lastModified: new Date(event.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...experiences.map((experience) => ({
      url: `${seoConfig.url}/experiences/${experience.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
