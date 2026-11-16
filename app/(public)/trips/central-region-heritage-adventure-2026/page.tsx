import { permanentRedirect } from "next/navigation";

// The trip has finished: send visitors (and search engines) permanently to its archive page.
export default function ArchivedCentralRegionTripRedirect() {
  permanentRedirect("/past-events/central-region-heritage-adventure-2026");
}
