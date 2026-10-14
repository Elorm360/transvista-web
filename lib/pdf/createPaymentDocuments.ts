type DocumentLine = {
  text: string;
  bold?: boolean;
  size?: number;
  color?: [number, number, number];
  gapAfter?: number;
};

type PaymentDocumentInput = {
  fullName: string;
  reference: string;
  bookingSummary: string;
  travellers: number;
  currency: string;
  quotedAmount: number;
  amountPaid: number;
  amountDue: number;
  paymentType: string;
  dueDate: string;
  itinerary: string;
};

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 48;

function ascii(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\x20-\x7E\n]/g, "")
    .replaceAll("–", "-")
    .replaceAll("—", "-");
}

function escapePdf(value: string) {
  return ascii(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
}

function wrap(value: string, width = 82) {
  const paragraphs = ascii(value).split(/\r?\n/);
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }
    const words = paragraph.trim().split(/\s+/);
    let line = "";
    for (const word of words) {
      const next = line ? line + " " + word : word;
      if (next.length > width && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function section(title: string, values: string[]): DocumentLine[] {
  return [
    { text: title.toUpperCase(), bold: true, size: 11, color: [0.12, 0.25, 0.55], gapAfter: 4 },
    ...values.flatMap((value) =>
      wrap(value).map((text) => ({ text, size: 10, gapAfter: text ? 1 : 4 })),
    ),
    { text: "", size: 7, gapAfter: 5 },
  ];
}

function createPdf(title: string, reference: string, lines: DocumentLine[]) {
  const pageLines: DocumentLine[][] = [];
  let current: DocumentLine[] = [];
  let y = 664;

  for (const line of lines) {
    const height = (line.size ?? 10) + (line.gapAfter ?? 3);
    if (y - height < 72 && current.length) {
      pageLines.push(current);
      current = [];
      y = 664;
    }
    current.push(line);
    y -= height;
  }
  pageLines.push(current);

  const pageCount = pageLines.length;
  const regularFontObject = 3 + pageCount * 2;
  const boldFontObject = regularFontObject + 1;
  const objects: string[] = [];
  const pageObjectNumbers = pageLines.map((_, index) => 3 + index * 2);

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] =
    "<< /Type /Pages /Kids [" +
    pageObjectNumbers.map((number) => number + " 0 R").join(" ") +
    "] /Count " +
    pageCount +
    " >>";

  pageLines.forEach((page, index) => {
    const pageObject = 3 + index * 2;
    const contentObject = pageObject + 1;
    const commands: string[] = [
      "q",
      "0.965 0.973 0.988 rg",
      "0 714 612 78 re f",
      "Q",
      "BT",
      "/F2 19 Tf",
      "0.956 0.369 0.125 rg",
      "1 0 0 1 " + MARGIN + " 750 Tm",
      "(TRANSVISTA AFRICA LTD) Tj",
      "/F2 15 Tf",
      "0.058 0.090 0.165 rg",
      "1 0 0 1 " + MARGIN + " 724 Tm",
      "(" + escapePdf(title) + ") Tj",
      "/F1 8 Tf",
      "0.392 0.455 0.545 rg",
      "1 0 0 1 " + MARGIN + " 698 Tm",
      "(Reference: " + escapePdf(reference) + ") Tj",
      "ET",
    ];

    let lineY = 664;
    for (const line of page) {
      const size = line.size ?? 10;
      const color = line.color ?? [0.18, 0.23, 0.31];
      if (line.text) {
        commands.push(
          "BT",
          "/" + (line.bold ? "F2" : "F1") + " " + size + " Tf",
          color.join(" ") + " rg",
          "1 0 0 1 " + MARGIN + " " + lineY + " Tm",
          "(" + escapePdf(line.text) + ") Tj",
          "ET",
        );
      }
      lineY -= size + (line.gapAfter ?? 3);
    }

    commands.push(
      "BT",
      "/F1 8 Tf",
      "0.392 0.455 0.545 rg",
      "1 0 0 1 " + MARGIN + " 38 Tm",
      "(Accra, Ghana | Payment support: 0248442916 | Page " +
        (index + 1) +
        " of " +
        pageCount +
        ") Tj",
      "ET",
    );
    const stream = commands.join("\n");
    objects[pageObject] =
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " +
      PAGE_WIDTH +
      " " +
      PAGE_HEIGHT +
      "] /Resources << /Font << /F1 " +
      regularFontObject +
      " 0 R /F2 " +
      boldFontObject +
      " 0 R >> >> /Contents " +
      contentObject +
      " 0 R >>";
    objects[contentObject] =
      "<< /Length " +
      Buffer.byteLength(stream, "ascii") +
      " >>\nstream\n" +
      stream +
      "\nendstream";
  });

  objects[regularFontObject] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[boldFontObject] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = Buffer.byteLength(pdf, "ascii");
    pdf += index + " 0 obj\n" + objects[index] + "\nendobj\n";
  }
  const xrefOffset = Buffer.byteLength(pdf, "ascii");
  pdf += "xref\n0 " + objects.length + "\n0000000000 65535 f \n";
  for (let index = 1; index < objects.length; index += 1) {
    pdf += String(offsets[index]).padStart(10, "0") + " 00000 n \n";
  }
  pdf +=
    "trailer\n<< /Size " +
    objects.length +
    " /Root 1 0 R >>\nstartxref\n" +
    xrefOffset +
    "\n%%EOF\n";
  return Buffer.from(pdf, "ascii");
}

function money(currency: string, amount: number) {
  return currency + " " + amount.toFixed(2);
}

export function createPaymentDocuments(input: PaymentDocumentInput) {
  const balance = Math.max(0, input.quotedAmount - input.amountPaid);
  const invoiceLines: DocumentLine[] = [
    ...section("Bill to", [input.fullName]),
    ...section("Booking", [
      input.bookingSummary,
      "Travellers: " + input.travellers,
      "Payment request: " + input.paymentType.replaceAll("-", " "),
    ]),
    ...section("Account summary", [
      "Total quoted: " + money(input.currency, input.quotedAmount),
      "Previously recorded: " + money(input.currency, input.amountPaid),
      "Outstanding balance: " + money(input.currency, balance),
      "Amount now due: " + money(input.currency, input.amountDue),
      "Payment deadline: " + input.dueDate,
    ]),
    ...section("Payment instructions", [
      "MTN MoMo: 0248442916 - TRANSVISTA AFRICA LTD",
      "Telecel Cash: 0506191365 - TRANSVISTA AFRICA LTD",
      "Use " + input.reference + " as the payment reference.",
      "Retain your proof of payment until TransVista confirms receipt.",
    ]),
    ...section("Policy summary", [
      "Standard deposit: 30%-50% depending on the trip; this request uses the amount shown above.",
      "Full payment is normally due 7-14 days before departure unless an earlier trip-specific deadline is communicated.",
      "A booking is provisional after the required deposit and fully confirmed after total payment.",
    ]),
  ];

  const itineraryLines: DocumentLine[] = [
    ...section("Traveller", [input.fullName]),
    ...section("Booking summary", [
      input.bookingSummary,
      "Travellers: " + input.travellers,
    ]),
    ...section("Confirmed itinerary", [input.itinerary]),
    ...section("Payment milestone", [
      money(input.currency, input.amountDue) + " due by " + input.dueDate + ".",
      "Payment reference: " + input.reference,
    ]),
    ...section("Support", [
      "For itinerary or payment questions, call or WhatsApp 0248442916.",
    ]),
  ];

  return {
    invoice: createPdf("PAYMENT INVOICE", input.reference, invoiceLines),
    itinerary: createPdf("CONFIRMED ITINERARY", input.reference, itineraryLines),
  };
}
