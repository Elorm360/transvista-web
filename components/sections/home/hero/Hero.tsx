import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";

import { HeroBackground } from "./HeroBackground";
import { HeroBadge } from "./HeroBadge";
import { HeroContent } from "./HeroContent";
import { HeroActions } from "./HeroActions";
import { HeroVisual } from "./HeroVisual";

export function Hero() {
  return (
    <section
      id="discover"
      className="relative isolate flex min-h-[92vh] scroll-mt-24 items-center overflow-hidden pt-28 pb-16 lg:scroll-mt-28 lg:pt-32"
    >
      <HeroBackground />

      <Container className="relative">
        <div className="grid items-start gap-12 lg:grid-cols-[48%_52%] lg:gap-10 lg:items-center">
          <div>
            <Reveal delay={0}>
              <HeroBadge />
            </Reveal>

            <Reveal delay={120}>
              <HeroContent />
            </Reveal>

            <Reveal delay={280}>
              <HeroActions />
            </Reveal>
          </div>

          <Reveal delay={200} direction="right">
            <HeroVisual />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
