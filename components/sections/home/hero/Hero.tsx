import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/button";
import { heroTrustItems } from "@/constants/data/hero";
import { cn } from "@/lib/utils";
import { HeroSlideshow } from "./HeroSlideshow";
import { HeroTripCard } from "./HeroTripCard";

export function Hero() {
  return (
    <section
      id="discover"
      className="relative isolate -mt-16 flex min-h-[100svh] scroll-mt-24 items-end overflow-hidden pb-14 pt-32 text-white lg:-mt-[72px] lg:min-h-[94vh] lg:scroll-mt-28 lg:pb-20"
    >
      <HeroSlideshow />

      <Container className="relative">
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
          <div className="hero-rise max-w-3xl">
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-white/75">
              Ghana travel, coordinated end to end
            </p>

            <h1 className="font-display mt-5 text-[2.6rem] font-semibold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
              Your Ghana trip,
              <br />
              <span className="italic text-brand-orange-300">thoughtfully</span>{" "}
              planned.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
              Tell us where you want to go—or just the kind of trip you have in
              mind. We coordinate the experiences, transport and stays, and send
              one clear proposal within 48 hours.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/plan"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "rounded-full",
                )}
              >
                Plan my trip
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/destinations"
                className={cn(
                  buttonVariants({ variant: "outline-white", size: "lg" }),
                  "rounded-full",
                )}
              >
                Explore destinations
              </Link>
            </div>

            <ul className="mt-10 flex flex-col gap-2 text-sm text-white/75 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
              {heroTrustItems.map((item, i) => (
                <li key={item} className="flex items-center gap-5">
                  {i > 0 && (
                    <span aria-hidden="true" className="hidden h-1 w-1 rounded-full bg-white/40 sm:block" />
                  )}
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="hero-rise [animation-delay:200ms]">
            <HeroTripCard />
          </div>
        </div>
      </Container>
    </section>
  );
}
