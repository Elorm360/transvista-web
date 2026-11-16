import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/pageMetadata";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/shared/PageHeader";
import { EventFeedbackForm } from "@/components/events/EventFeedbackForm";

export const metadata: Metadata = pageMetadata({
  title: "Central Region Event Feedback",
  description: "Share private feedback about the TransVista Central Region Heritage & Adventure Day Trip.",
  path: "/event-feedback/central-region-heritage-adventure-2026",
});

export default function CentralRegionEventFeedbackPage() {
  return (
    <main id="main-content" className="bg-[#fffdfa]">
      <PageHeader
        eyebrow="Your feedback matters"
        title="Help us make the next journey better."
        lead="Thank you for joining the Central Region Heritage & Adventure Day Trip. Tell us what worked, what could improve and what you would like to experience in future."
      />
      <section className="py-12 lg:py-16">
        <Container>
          <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            <EventFeedbackForm />
          </div>
        </Container>
      </section>
    </main>
  );
}
