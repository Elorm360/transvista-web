import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

import { HeroBadge } from "./HeroBadge";
import { HeroContent } from "./HeroContent";
import { HeroActions } from "./HeroActions";
import { HeroVisual } from "./HeroVisual";

export function Hero() {
  return (
    <Section className="overflow-hidden pt-20 pb-16 lg:pt-28 lg:pb-24">
      <Container>
        <div className="grid items-center gap-20 lg:grid-cols-[45%_55%]">
          <div>
            <HeroBadge />
            <HeroContent />
            <HeroActions />
          </div>

          <HeroVisual />
        </div>
      </Container>
    </Section>
  );
}