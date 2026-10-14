import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/pageMetadata";
import { DestinationGrid } from "@/components/destinations/DestinationGrid";

export const metadata: Metadata = pageMetadata({
  title: "Ghana Destinations",
  description:
    "Explore Accra, Cape Coast, Kumasi, the Volta Region, Mole and Kakum National Parks, then let TransVista plan the journey around you.",
  path: "/destinations",
});

export default function DestinationsPage() {
  return (
    <main id="main-content" className="bg-[#fffdfa]">
      <DestinationGrid />
    </main>
  );
}
