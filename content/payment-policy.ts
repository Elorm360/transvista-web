export type PolicySection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export const paymentPolicy: {
  effectiveLabel: string;
  introduction: string;
  sections: PolicySection[];
} = {
  effectiveLabel: "Policy version: August 7, 2026",
  introduction:
    "This policy applies to all TransVista Africa Ltd tours, trips, travel experiences, events, packages, and related services. By making a payment, a client confirms that they have read, understood, and accepted these terms.",
  sections: [
    {
      title: "1. Purpose",
      paragraphs: [
        "The policy governs payments, bookings, deposits, cancellations, refunds, transfers, travel credits, and related financial arrangements. It is designed to support transparency, accountability, proper planning, and a smooth client experience.",
      ],
    },
    {
      title: "2. Payment options",
      bullets: [
        "Full payment: clients may pay the full advertised amount at booking.",
        "Deposit payment: a package may require a minimum deposit of 30%–50% of its total cost. The package page will state the exact amount.",
        "Flexible savings: smaller payments may be made through the TransVista Travel Wallet, but they do not secure a specific trip until the required deposit has been reached.",
      ],
    },
    {
      title: "3. Booking confirmation",
      paragraphs: [
        "A booking is provisionally reserved after the required deposit has been received and verified. It becomes fully confirmed only after the total required payment has been completed. TransVista may release an incomplete reservation after its payment deadline.",
      ],
    },
    {
      title: "4. Payment deadlines",
      paragraphs: [
        "Unless a package states otherwise, full payment is due 7–14 days before travel. Earlier deadlines may apply where accommodation, transportation, ticketing, venues, or other third-party commitments require them.",
      ],
      bullets: [
        "Late payment may result in loss of the reserved space.",
        "The reservation may be released to another client.",
        "Booking benefits or prices may change where applicable.",
        "The booking may be cancelled under this policy.",
      ],
    },
    {
      title: "5. Installments",
      paragraphs: [
        "Where installments are permitted, clients must follow the schedule communicated by TransVista. Missing an agreed or revised deadline may cause the booking to be released under the applicable cancellation and refund terms.",
      ],
    },
    {
      title: "6. TransVista Travel Wallet",
      bullets: [
        "Wallet funds may be deposited at any time and used for eligible future services.",
        "Wallet funds do not automatically confirm a booking.",
        "Funds are generally valid for 6–12 months, subject to the communicated wallet arrangement.",
        "Clients may be asked for references or transaction details when confirming a wallet balance.",
      ],
    },
    {
      title: "7. Refunds and client cancellations",
      bullets: [
        "7 or more days before travel: eligible for a full refund, less non-refundable third-party costs already incurred.",
        "3–7 days before travel: eligible for a partial refund of approximately 50%–70%, depending on committed costs and circumstances.",
        "Less than 3 days before travel: payments are generally non-refundable.",
        "Package-specific cancellation terms take precedence when clearly communicated.",
      ],
    },
    {
      title: "8. Non-refundable third-party costs",
      paragraphs: [
        "Amounts already committed to transport providers, hotels, venues, guides, attraction sites, ticketing agencies, and other suppliers may be deducted from an eligible refund. TransVista will explain relevant deductions.",
      ],
    },
    {
      title: "9. Travel credit",
      paragraphs: [
        "An eligible payment may be converted into TransVista Travel Credit instead of a cash refund. The credit is recorded against the client or booking, has a communicated validity period, and may be applied to an eligible future trip. Any price difference remains payable.",
      ],
    },
    {
      title: "10. Booking transfers",
      paragraphs: [
        "A client may request to transfer a booking to another person before the applicable deadline. TransVista must approve the transfer, the replacement traveller must provide the required information, and any additional supplier costs remain payable.",
      ],
    },
    {
      title: "11. Price protection",
      paragraphs: [
        "An early deposit may protect the advertised booking price. Delayed payments may be affected by changes in transport, accommodation, fuel, entrance fees, exchange rates, supplier costs, government charges, or other operating expenses.",
      ],
    },
    {
      title: "12. Group bookings",
      paragraphs: [
        "Group rates are not automatic. Any discount depends on participant numbers, trip type, destination, transport, accommodation, and operating requirements, and must be confirmed before payment.",
      ],
    },
    {
      title: "13. Approved payment channels",
      bullets: [
        "Mobile Money",
        "Bank transfer",
        "Approved digital payment platforms",
        "Other channels officially designated by TransVista",
      ],
      paragraphs: [
        "Do not pay an unauthorized person or personal account unless an authorized TransVista representative has expressly instructed you to do so. Keep proof of payment.",
      ],
    },
    {
      title: "14. Payment confirmation",
      paragraphs: [
        "Payment is received only after it reflects in the designated TransVista account or system and has been verified. A screenshot or receipt alone is not confirmation of payment or booking.",
      ],
    },
    {
      title: "15. Payment records",
      paragraphs: [
        "TransVista records deposits, balances, wallet contributions, refunds, and credits to support financial accountability and reconciliation. Clients should report any payment they believe has not been reflected correctly.",
      ],
    },
    {
      title: "16. Changes or cancellation by TransVista",
      paragraphs: [
        "Where safety, weather, insufficient participation, supplier issues, restrictions, or other unforeseen circumstances require a cancellation, postponement, reschedule, or material change, TransVista will notify affected clients as soon as reasonably possible.",
      ],
      bullets: [
        "A new date may be offered.",
        "The booking may be transferred to another eligible trip.",
        "Travel Credit may be offered.",
        "A refund may be offered where applicable, subject to the circumstances and committed costs.",
      ],
    },
    {
      title: "17. Client responsibilities",
      bullets: [
        "Provide accurate personal, booking, emergency, and travel information.",
        "Meet communicated payment deadlines and retain proof of payment.",
        "Read the terms that apply to the booking.",
        "Report relevant changes promptly.",
        "Follow trip-specific requirements and safety instructions.",
      ],
    },
    {
      title: "18. Payment disputes",
      paragraphs: [
        "Report discrepancies promptly with the client name, trip, payment date, amount, channel, transaction reference, and proof of payment. TransVista will review the matter and provide clarification or resolution within a reasonable period.",
      ],
    },
    {
      title: "19. Policy acknowledgement",
      paragraphs: [
        "Making a payment confirms acceptance of the applicable payment, booking, cancellation, and refund terms.",
      ],
    },
    {
      title: "20. Policy updates",
      paragraphs: [
        "TransVista may update this policy to reflect operational, supplier, payment-system, or regulatory changes. Material changes affecting an existing booking will be communicated where reasonably practicable.",
      ],
    },
  ],
};
