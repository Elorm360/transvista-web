import { Button } from "@/components/ui/button";
import { TrustBadge } from "@/components/shared/TrustBadge";
import { heroTrustItems } from "@/constants/data/hero";

export function HeroActions() {
  return (
    <div className="mt-12 flex flex-col gap-4 sm:flex-row">
      <Button size="lg">
        Join Waitlist
      </Button>

      <Button
        variant="outline"
        size="lg"
      >
        Explore Ghana
      </Button>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-6">
        {heroTrustItems.map((item) => (
          <TrustBadge key={item} text={item} />
        ))}
      </div>
    </div>
  );
}
