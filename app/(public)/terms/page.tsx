import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/pageMetadata";
import { PolicyDocument } from "@/components/policies/PolicyDocument";
import { termsOfService } from "@/content/legal";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description:
    "The terms that govern use of transvistaafrica.com and TransVista Africa trip planning services.",
  path: "/terms",
});

export default function TermsOfServicePage() {
  return (
    <PolicyDocument
      title="Terms of Service"
      effectiveLabel={termsOfService.effectiveLabel}
      introduction={termsOfService.introduction}
      sections={termsOfService.sections}
    />
  );
}
