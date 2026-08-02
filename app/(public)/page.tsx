import { Hero } from "@/components/sections/home/hero/Hero";
import { WhyTransVista } from "@/components/sections/home/why-transvista";
import { Experiences } from "@/components/sections/home/experiences";
import { ExploreByExperience } from "@/components/sections/home/explore-by-experience";
import { HowItWorks } from "@/components/sections/home/how-it-works";
import { Ecosystem } from "@/components/sections/home/ecosystem";
import { Waitlist } from "@/components/sections/home/waitlist";

export default function HomePage() {
  return (
    <main id="main-content">
      <Hero />
      <WhyTransVista />
      <Experiences />
      <ExploreByExperience />
      <HowItWorks />
      <Ecosystem />
      <Waitlist />
    </main>
  );
}
