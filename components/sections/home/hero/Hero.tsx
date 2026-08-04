import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";

import { HeroBadge } from "./HeroBadge";
import { HeroContent } from "./HeroContent";
import { HeroActions } from "./HeroActions";
import { HeroVisual } from "./HeroVisual";

export function Hero() {
  return (
    <Section id="discover" className="overflow-hidden pt-10 pb-8 lg:pt-16 lg:pb-12">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[48%_52%] lg:gap-10">
          <Reveal>
            <div>
              <HeroBadge />
              <HeroContent />
              <HeroActions />
            </div>
          </Reveal>

          <Reveal delay={120} direction="right">
            <HeroVisual />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
