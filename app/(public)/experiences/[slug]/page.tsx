import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExperienceDetail } from "@/components/experiences/ExperienceDetail";
import {
  experiences,
  getExperienceBySlug,
} from "@/constants/data/experiences";
import { getDestinationById } from "@/constants/data/destinations";

type ExperiencePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return experiences.map((experience) => ({ slug: experience.slug }));
}

export async function generateMetadata({
  params,
}: ExperiencePageProps): Promise<Metadata> {
  const { slug } = await params;
  const experience = getExperienceBySlug(slug);

  if (!experience) {
    return { title: "Experience" };
  }

  return {
    title: experience.name,
    description: experience.description,
  };
}

export default async function ExperiencePage({
  params,
}: ExperiencePageProps) {
  const { slug } = await params;
  const experience = getExperienceBySlug(slug);

  if (!experience) {
    notFound();
  }

  const destination = getDestinationById(experience.destinationId);

  return (
    <ExperienceDetail experience={experience} destination={destination} />
  );
}
