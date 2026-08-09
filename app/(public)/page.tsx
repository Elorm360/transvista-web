import { Hero } from "@/components/sections/home/hero/Hero";
import { TrustBar } from "@/components/sections/home/trust-bar/TrustBar";
import { Services } from "@/components/sections/home/services/Services";
import { WhyTransVista } from "@/components/sections/home/why-transvista";
import { Experiences } from "@/components/sections/home/experiences";
import { ExploreByExperience } from "@/components/sections/home/explore-by-experience";
import { HowItWorks } from "@/components/sections/home/how-it-works";
import { Ecosystem } from "@/components/sections/home/ecosystem";
import { ImpactNumbers } from "@/components/sections/home/impact/ImpactNumbers";
import { Waitlist } from "@/components/sections/home/waitlist";

export default function HomePage() {
  return (
    <main id="main-content">
      <Hero />
      <TrustBar />
      <Services />
      <WhyTransVista />
      <Experiences />
      <ExploreByExperience />
      <HowItWorks />
      <Ecosystem />
      <ImpactNumbers />
      <Waitlist />
    </main>
  );
}
