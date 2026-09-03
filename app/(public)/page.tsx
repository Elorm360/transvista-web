import { Hero } from "@/components/sections/home/hero/Hero";
import { TrustBar } from "@/components/sections/home/trust-bar/TrustBar";
import { Experiences } from "@/components/sections/home/experiences";
import { FeaturedTrip } from "@/components/sections/home/featured-trip/FeaturedTrip";
import { Services } from "@/components/sections/home/services/Services";
import { HowItWorks } from "@/components/sections/home/how-it-works";
import { WhyTransVista } from "@/components/sections/home/why-transvista";
import { Testimonials } from "@/components/sections/home/testimonials";
import { PlanTrip } from "@/components/sections/home/plan-trip/PlanTrip";
import { Waitlist } from "@/components/sections/home/waitlist";

export default function HomePage() {
  return (
    <main id="main-content">
      <Hero />
      <TrustBar />
      <Experiences />
      <FeaturedTrip />
      <Services />
      <HowItWorks />
      <WhyTransVista />
      <Testimonials />
      <PlanTrip />
      <Waitlist />
    </main>
  );
}
