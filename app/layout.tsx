import React, { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import MobileNavigation from "@/components/MobileNavigation";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import "react-phone-input-2/lib/style.css";
import { Skeleton } from "@/components/ui/skeleton";
import TawkChat from "@/components/tawkChat";
import { CategoryListServer } from "@/components/navbar/CategoryListServer";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
});

export const viewport: Viewport = {
  themeColor: "#4CAF50",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://ugosylviacosmetics.co.za"
  ),
  title: {
    default: "Glow by UgoSylvia | Beauty & Wellness",
    template: "%s | Glow by UgoSylvia",
  },
  description:
    "Your premier destination for expert permanent makeup (Microblading, Ombre, Eyeliner, Lip Blush), stunning lash extensions, and professional makeup services. Discover our curated collection of high-quality skincare, makeup, beauty supplements, and unique jewellery.",
  manifest: "/manifest.json",
  keywords: [
    "permanent makeup",
    "microblading",
    "ombre brows",
    "eyeliner",
    "lip blush",
    "lash extensions",
    "makeup services",
    "skincare",
    "beauty supplements",
    "jewellery",
    "beauty salon",
    "acne treatment",
    "anti-aging",
    "skin rejuvenation",
    "beauty products",
    "beauty services",
    "beauty and wellness",
    "Glow by UgoSylvia",
    "UgoSylvia",
  ],
  authors: [{ name: "Glow by UgoSylvia" }],
  creator: "Glow by UgoSylvia",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Glow by UgoSylvia",
    title: "Glow by UgoSylvia | Beauty & Wellness",
    description:
      "Premium beauty services including permanent makeup, lash extensions, and professional makeup. Shop our quality skincare and beauty products.",
    images: [
      {
        url: "/assets/og-image.png",
        width: 1200,
        height: 630,
        alt: "Glow by UgoSylvia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@GlowByUgoSylvia",
    creator: "@GlowByUgoSylvia",
    title: "Glow by UgoSylvia | Beauty & Wellness",
    description:
      "Premium beauty services including permanent makeup, lash extensions, and professional makeup. Shop our quality skincare and beauty products.",
    images: ["/assets/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    title: "Glow by Sylvia",
    capable: true,
    statusBarStyle: "default",
  },
  applicationName: "Glow by Sylvia",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  icons: {
    icon: [
      {
        url: "/app-icons/android/android-launchericon-192-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/app-icons/ios/180.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  verification: {
    google: "dEt5Z3Db-gUUXbyOqdCwP_NktWwfdKxNE7YM0MsuPKE",
    // yandex: 'YOUR_YANDEX_VERIFICATION_CODE',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch categories for mobile navigation
  const { categories } = await CategoryListServer();

  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${openSans.variable} font-sans`}>
        <Suspense
          fallback={
            <div className="flex justify-center items-center h-16 md:h-20">
              <Skeleton className="w-full h-16 animate-pulse" />
            </div>
          }
        >
          <Navbar />
        </Suspense>
        <Toaster />
        <main>{children}</main>
        <Footer />
        <TawkChat />
        <MobileNavigation productCategories={categories} />
      </body>
    </html>
  );
}
