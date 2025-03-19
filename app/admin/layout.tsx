import type React from "react";
import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminFooter from "@/components/admin/admin-footer";
import "../globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Glow Admin | Beauty & Wellness Management",
  description:
    "Admin dashboard for Glow by UgoSylvia beauty and wellness services",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${montserrat.variable} ${openSans.variable} font-sans flex min-h-screen bg-background`}
    >
      <div className="flex flex-col flex-1">
        <AdminSidebar />
        <main className="flex-1 p-6 md:ml-[240px]">{children}</main>
        <AdminFooter />
      </div>
    </div>
  );
}
