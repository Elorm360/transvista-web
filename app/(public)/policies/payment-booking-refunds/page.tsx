import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/pageMetadata";
import { PolicyDocument } from "@/components/policies/PolicyDocument";
import { paymentPolicy } from "@/content/payment-policy";

export const metadata: Metadata = pageMetadata({
  title: "Payment, Booking & Refund Policy",
  description:
    "Payment, deposit, booking, cancellation, refund, transfer, and travel-credit terms for TransVista Africa trips and services.",
  path: "/policies/payment-booking-refunds",
});

export default function PaymentPolicyPage() {
  return (
    <PolicyDocument
      title="Payment, Booking & Refund Policy"
      effectiveLabel={paymentPolicy.effectiveLabel}
      introduction={paymentPolicy.introduction}
      sections={paymentPolicy.sections}
    />
  );
}
