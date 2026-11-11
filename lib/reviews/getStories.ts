import { createClient } from "@supabase/supabase-js";
import { travellerTestimonials } from "@/content/testimonials";
import { isAdinkraId, type AdinkraId } from "@/components/reviews/AdinkraAvatars";

/** One story/review card, from either the curated list or a submitted review. */
export type StoryItem = {
  key: string;
  name: string;
  location?: string;
  trip: string;
  date: string;
  quote: string;
  image?: string;
  imageAlt?: string;
  /** True for traveller-uploaded photos served from storage (already optimised). */
  remoteImage?: boolean;
  avatar?: AdinkraId;
  rating?: number;
  verified?: boolean;
};

const monthYear = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: "Africa/Accra",
});

/** Approved reviews from the database (public, safe columns only). */
async function getPublishedReviews(): Promise<StoryItem[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return [];

  try {
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase
      .from("traveller_reviews")
      .select("id, full_name, location, trip_name, rating, review, verified, published_at, avatar_choice, photo_url")
      .eq("status", "approved")
      .order("published_at", { ascending: false })
      .limit(40);

    if (error || !data) {
      if (error) console.error("[getPublishedReviews]", error.message);
      return [];
    }

    return data.map((row) => ({
      key: `review-${row.id}`,
      name: row.full_name,
      location: row.location ?? undefined,
      trip: row.trip_name,
      date: row.published_at ? monthYear.format(new Date(row.published_at)) : "",
      quote: row.review,
      rating: row.rating,
      verified: row.verified,
      image: row.photo_url ?? undefined,
      imageAlt: row.photo_url ? `${row.full_name}, TransVista traveller` : undefined,
      remoteImage: Boolean(row.photo_url),
      avatar: !row.photo_url && isAdinkraId(row.avatar_choice) ? row.avatar_choice : undefined,
    }));
  } catch (error) {
    console.error("[getPublishedReviews]", error);
    return [];
  }
}

/** Newest submitted reviews first, followed by the curated traveller stories. */
export async function getStories(): Promise<StoryItem[]> {
  const reviews = await getPublishedReviews();
  const curated: StoryItem[] = travellerTestimonials.map((story) => ({
    key: story.slug,
    name: story.name,
    location: story.location,
    trip: story.trip,
    date: story.date,
    quote: story.quote,
    image: story.image,
    imageAlt: story.imageAlt,
  }));
  return [...reviews, ...curated];
}
