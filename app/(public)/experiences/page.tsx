import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/pageMetadata";
import { ExperienceGrid } from "@/components/experiences/ExperienceGrid";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = pageMetadata({
  title: "Ghana Experiences",
  description:
    "Heritage, rainforest, waterfalls, food and local life. Choose the Ghana experiences you love and let TransVista plan the journey around them.",
  path: "/experiences",
});

export default function ExperiencesPage() {
  return (
    <main id="main-content" className="bg-[#fffdfa]">
      <PageHeader
        eyebrow="Experiences"
        title="Moments worth travelling for."
        lead="Pick the experiences that excite you, then let TransVista shape the transport, stays and timing around them."
      />
      <ExperienceGrid />
    </main>
  );
}
