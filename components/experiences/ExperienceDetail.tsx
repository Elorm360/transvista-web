import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PlanTripButton } from "@/components/layout/PlanTripButton";
import { PhotoPlaceholder } from "@/components/media/PhotoPlaceholder";
import type { Experience } from "@/constants/data/experiences";
import type { Destination } from "@/constants/data/destinations";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ExperienceDetailProps = {
  experience: Experience;
  destination?: Destination;
};

export function ExperienceDetail({
  experience,
  destination,
}: ExperienceDetailProps) {
  return (
    <main id="main-content" className="bg-[#fffdfa]">
      <section className="border-b border-slate-200 bg-white pt-10 pb-14 lg:pt-14 lg:pb-20">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange-700">
            {destination ? (
              <Link
                href={`/destinations/${destination.slug}`}
                className="hover:underline"
              >
                {destination.name}
              </Link>
            ) : (
              "Experience"
            )}
            <span className="mx-2 text-slate-300">/</span>
            {experience.category}
          </p>

          <h1 className="font-display mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            {experience.name}
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            {experience.tagline}
          </p>
        </Container>
      </section>

      <section className="py-12 lg:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-start">
            <div className="overflow-hidden rounded-[28px] border border-slate-200">
              {experience.image ? (
                <div className="relative aspect-[4/3]">
                  <Image
                    src={experience.image}
                    alt={experience.imageAlt}
                    fill
                    priority
                    quality={75}
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <PhotoPlaceholder caption="TransVista experience photography" />
              )}
              <p className="border-t border-slate-200 bg-white px-5 py-3 text-xs text-slate-500">
                {experience.photoNote}
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-900">
                What to expect
              </h2>
              <ul className="mt-5 space-y-3">
                {experience.whatToExpect.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm leading-6 text-slate-700"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange-500" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-[24px] border border-slate-200 bg-white p-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-orange-700">
                  Best for
                </h3>
                <ul className="mt-4 space-y-2">
                  {experience.bestFor.map((item) => (
                    <li key={item} className="text-sm leading-6 text-slate-600">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 max-w-3xl space-y-5">
            {experience.story.map((paragraph) => (
              <p key={paragraph} className="text-base leading-7 text-slate-600">
                {paragraph}
              </p>
            ))}
          </div>

          {destination && (
            <p className="mt-10 text-sm text-slate-500">
              Based in{" "}
              <Link
                href={`/destinations/${destination.slug}`}
                className="font-semibold text-brand-blue-800 hover:underline"
              >
                {destination.name}
              </Link>
              , {destination.region}.
            </p>
          )}
        </Container>
      </section>

      <section className="pb-16">
        <Container>
          <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-brand-blue-950 via-brand-blue-900 to-slate-950 px-8 py-12 text-center sm:px-12">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-white">
              Build this experience into your trip
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-300">
              Share your dates, budget, and preferences. TransVista will coordinate
              the request first, then introduce the confirmed provider.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <PlanTripButton
                href={`/plan?destination=${experience.destinationId}`}
                className="rounded-full"
              />
              {destination && (
                <Link
                  href={`/destinations/${destination.slug}`}
                  className={cn(
                    buttonVariants({ variant: "outline-white", size: "default" }),
                    "rounded-full",
                  )}
                >
                  Back to {destination.name}
                </Link>
              )}
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
