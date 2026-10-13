import React, { Suspense } from "react";
import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/admin-sidebar";
import "../globals.css";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
  SidebarMenuSkeleton,
} from "@/constants/ui";
import "react-phone-input-2/lib/style.css";

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
      className="font-sans flex min-h-screen bg-background"
    >
      <SidebarProvider>
        <Suspense fallback={<SidebarMenuSkeleton />}>
          <AdminSidebar />
        </Suspense>
        <SidebarRail />
        <SidebarInset>
          <div className="p-6">
            <SidebarTrigger
              className="fixed top-4 left-4 z-50"
              variant={"default"}
            />
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
