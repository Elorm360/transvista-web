import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo/pageMetadata";
import { JsonLd, breadcrumbSchema, destinationSchema } from "@/lib/seo/jsonLd";
import { DestinationDetail } from "@/components/destinations/DestinationDetail";
import {
  destinations,
  getDestinationBySlug,
} from "@/constants/data/destinations";

type DestinationPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return destinations.map((destination) => ({ slug: destination.slug }));
}

export async function generateMetadata({
  params,
}: DestinationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const destination = getDestinationBySlug(slug);

  if (!destination) {
    return { title: "Destination" };
  }

  return pageMetadata({
    title: `${destination.name}, Ghana`,
    description: destination.description,
    path: `/destinations/${destination.slug}`,
    image: destination.image,
    imageAlt: destination.imageAlt,
  });
}

export default async function DestinationPage({
  params,
}: DestinationPageProps) {
  const { slug } = await params;
  const destination = getDestinationBySlug(slug);

  if (!destination) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={[
          destinationSchema(destination),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Destinations", path: "/destinations" },
            { name: destination.name, path: `/destinations/${destination.slug}` },
          ]),
        ]}
      />
      <DestinationDetail destination={destination} />
    </>
  );
}
