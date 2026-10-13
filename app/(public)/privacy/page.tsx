import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/pageMetadata";
import { PolicyDocument } from "@/components/policies/PolicyDocument";
import { privacyPolicy } from "@/content/legal";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How TransVista Africa collects, uses and protects your personal data under Ghana’s Data Protection Act, 2012 (Act 843).",
  path: "/privacy",
});

export default function PrivacyPolicyPage() {
  return (
    <PolicyDocument
      title="Privacy Policy"
      effectiveLabel={privacyPolicy.effectiveLabel}
      introduction={privacyPolicy.introduction}
      sections={privacyPolicy.sections}
    />
  );
}
