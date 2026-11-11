import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { StorySlideshow } from "@/components/testimonials/StorySlideshow";
import { FeaturedStoryRotator } from "@/components/testimonials/FeaturedStoryRotator";
import { getStories } from "@/lib/reviews/getStories";
import { travellerTestimonials } from "@/content/testimonials";

export async function Testimonials() {
  // Featured story leads the spotlight; every traveller with a photo rotates in turn.
  const spotlight = [
    ...travellerTestimonials.filter((story) => story.featured),
    ...travellerTestimonials.filter((story) => !story.featured),
  ].filter((story) => Boolean(story.image));
  const stories = await getStories();

  return (
    <Section id="traveller-stories" className="bg-[#f7f5f1]">
      <Container>
        <Reveal>
          <FeaturedStoryRotator stories={spotlight} intervalMs={7000} />
        </Reveal>
      </Container>

      <div className="mt-16">
        <StorySlideshow stories={stories} fadeFrom="#f7f5f1" label="More traveller stories" />
      </div>
    </Section>
  );
}
