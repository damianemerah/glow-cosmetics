import type React from "react";
import type { Metadata } from "next";
import { Open_Sans, Libre_Bodoni } from "next/font/google";
// import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import { MessageCircle } from "lucide-react";

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
        <Navbar />
        <Toaster />
        <main>{children}</main>
        <Footer />
        <a
          href="https://wa.me/+2347066765698"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition"
          aria-label="Chat with us on WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />{" "}
        </a>
      </body>
    </html>
  );
}
