import { Hero } from "@/components/sections/home/hero/Hero";
import { TrustBar } from "@/components/sections/home/trust-bar/TrustBar";
import { WhyTransVista } from "@/components/sections/home/why-transvista";
import { Experiences } from "@/components/sections/home/experiences";
import { HowItWorks } from "@/components/sections/home/how-it-works";
import { Waitlist } from "@/components/sections/home/waitlist";
import { FeaturedPackage } from "@/components/sections/home/featured-package/FeaturedPackage";

export default function HomePage() {
  return (
    <main id="main-content">
      <Hero />
      <TrustBar />
      <WhyTransVista />
      <FeaturedPackage />
      <Experiences />
      <HowItWorks />
      <Waitlist />
    </main>
  );
}
