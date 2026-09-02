import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PackageDetail } from "@/components/packages/PackageDetail";
import { getTripPackageBySlug, tripPackages } from "@/constants/data/packages";

type PackagePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return tripPackages.map((tripPackage) => ({ slug: tripPackage.slug }));
}

export async function generateMetadata({ params }: PackagePageProps): Promise<Metadata> {
  const { slug } = await params;
  const tripPackage = getTripPackageBySlug(slug);

  if (!tripPackage) return { title: "Trip package" };

  return {
    title: tripPackage.name,
    description: tripPackage.description,
    openGraph: {
      title: tripPackage.name,
      description: tripPackage.description,
      images: [{ url: tripPackage.image, alt: tripPackage.imageAlt }],
    },
  };
}

export default async function PackagePage({ params }: PackagePageProps) {
  const { slug } = await params;
  const tripPackage = getTripPackageBySlug(slug);

  if (!tripPackage) notFound();

  return <PackageDetail tripPackage={tripPackage} />;
}
