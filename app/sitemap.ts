import type { MetadataRoute } from "next";
import { seoConfig } from "@/constants/config/seo";
import { destinations } from "@/constants/data/destinations";
import { experiences } from "@/constants/data/experiences";
import { createPublicClient } from "@/lib/supabase/public";

// Rebuilt hourly; publishing or editing an event refreshes it immediately.
export const revalidate = 3600;

/** Slugs with their own hand-built pages (already listed below). */
const HAND_BUILT_EVENT_SLUGS = new Set(["central-region-heritage-adventure-2026"]);

type PublicEventRow = { slug: string; status: string; updated_at: string | null };

async function getPublicEvents(): Promise<PublicEventRow[]> {
  const { data, error } = await createPublicClient()
    .from("travel_events")
    .select("slug,status,updated_at")
    .in("status", ["published", "registration_closed", "completed"]);
  if (error) {
    console.error("[sitemap] travel_events", error);
    return [];
  }
  return (data ?? []) as PublicEventRow[];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const events = (await getPublicEvents()).filter(
    (event) => !HAND_BUILT_EVENT_SLUGS.has(event.slug),
  );

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
    ...["/destinations", "/experiences", "/trips", "/contact", "/privacy", "/terms"].map(
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
    ...experiences.map((experience) => ({
      url: `${seoConfig.url}/experiences/${experience.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...events.map((event) => ({
      url:
        event.status === "completed"
          ? `${seoConfig.url}/past-events/${event.slug}`
          : `${seoConfig.url}/trips/${event.slug}`,
      lastModified: event.updated_at ? new Date(event.updated_at) : lastModified,
      changeFrequency: "weekly" as const,
      priority: event.status === "completed" ? 0.6 : 0.85,
    })),
  ];
}
