import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Open_Sans, Libre_Bodoni } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import "react-phone-input-2/lib/style.css";
import { Skeleton } from "@/components/ui/skeleton";
// import TawkChat from "@/components/tawkChat";

const montserrat = Libre_Bodoni({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  title: "Glow by UgoSylvia | Beauty & Wellness",
  description:
    "Professional beauty and wellness services including brow and lash treatments, skincare, and wellness products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${openSans.variable} font-sans`}>
        <Suspense
          fallback={
            <div className="flex justify-center items-center h-screen">
              <Skeleton className="w-full h-16 animate-pulse" />
            </div>
          }
        >
          <Navbar />
        </Suspense>
        <Toaster />
        <main>{children}</main>
        <Footer />
        {/* <TawkChat /> */}
      </body>
    </html>
  );
}
