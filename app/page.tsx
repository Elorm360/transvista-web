import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export default function HomePage() {
  return (
    <main>
      <Section>
        <Container>
          <h1 className="text-5xl font-bold">
            TransVista Africa
          </h1>

          <p className="mt-6 max-w-xl text-slate-600">
            Discover Ghana with confidence.
          </p>

          <div className="mt-10 flex gap-4">
            <Button>Join Waitlist</Button>

            <Button variant="outline">
              Explore Ghana
            </Button>
          </div>
        </Container>
      </Section>
    </main>
  );
}