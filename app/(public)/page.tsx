import { Hero } from "@/components/sections/home/hero/Hero";
import { TrustBar } from "@/components/sections/home/trust-bar/TrustBar";
import { Experiences } from "@/components/sections/home/experiences";
import { Services } from "@/components/sections/home/services/Services";
import { HowItWorks } from "@/components/sections/home/how-it-works";
import { WhyTransVista } from "@/components/sections/home/why-transvista";
import { PlanTrip } from "@/components/sections/home/plan-trip/PlanTrip";
import { Waitlist } from "@/components/sections/home/waitlist";

export default function HomePage() {
  return (
    <main id="main-content">
      <Hero />
      <TrustBar />
      <Experiences />
      <Services />
      <HowItWorks />
      <WhyTransVista />
      <PlanTrip />
      <Waitlist />
    </main>
  );
}
