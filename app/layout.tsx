import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist, Fraunces } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { OrganizationSchema } from "@/components/seo/OrganizationSchema";
import { seoConfig } from "@/constants/config/seo";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(seoConfig.url),

  title: {
    default: seoConfig.title,
    template: `%s | ${seoConfig.shortTitle}`,
  },

  description: seoConfig.description,

  keywords: seoConfig.keywords,

  authors: [
    {
      name: seoConfig.author,
    },
  ],

  creator: seoConfig.author,

  publisher: seoConfig.author,

  applicationName: seoConfig.shortTitle,

  alternates: {
    canonical: "/",
  },

  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },

  openGraph: {
    type: "website",
    locale: seoConfig.locale,
    url: seoConfig.url,
    siteName: seoConfig.name,
    title: seoConfig.title,
    description: seoConfig.description,
    images: [
      {
        url: seoConfig.openGraphImage,
        width: 1200,
        height: 630,
        alt: "TransVista Africa",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: seoConfig.title,
    description: seoConfig.description,
    images: [seoConfig.openGraphImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${jakarta.variable} ${fraunces.variable} antialiased`}>
        <OrganizationSchema />
        {children}
      </body>
    </html>
  );
}
