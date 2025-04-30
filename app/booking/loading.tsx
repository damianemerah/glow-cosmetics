import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Phone, Info, CheckCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section Skeleton */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4 text-center">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
        </div>
        zx
      </section>

      {/* Booking Form and Services Section Skeleton */}
      <section className="py-16 bg-white">
        <div className="px-4 sm:px-8 md:px-16 mx-auto grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
          {/* Booking Form Skeleton */}
          <div className="border rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-5 w-full max-w-md" />
            </div>
            <div className="p-6 space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>

              {/* Contact Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>

              {/* Service Selection */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              {/* Date and Time Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>

              {/* Special Requests */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-32 w-full rounded-md" />
              </div>
            </div>
            <div className="p-6 border-t">
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          </div>

          {/* Services List Skeleton */}
          <div className="border rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <Skeleton className="h-7 w-32 mb-2" />
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 rounded-lg border relative">
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-full mb-3" />
                    <Skeleton className="h-4 w-full mb-3" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Skeleton className="h-8 w-48 mb-4" />
              <ul className="space-y-4">
                <li className="grid grid-cols-[auto_1fr] gap-1">
                  <Clock className="w-5 h-5 text-gray-300 mr-2 mt-0.5" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-48 mb-1" />
                    <Skeleton className="h-4 w-48 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </li>
                <li className="grid grid-cols-[auto_1fr] gap-1">
                  <Phone className="w-5 h-5 text-gray-300 mr-2 mt-0.5" />
                  <div>
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-40 mb-1" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </li>
                <li className="grid grid-cols-[auto_1fr] gap-1">
                  <Info className="w-5 h-5 text-gray-300 mr-2 mt-0.5" />
                  <div>
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <Skeleton className="h-8 w-36 mb-4" />
              <ul className="space-y-4">
                <li className="grid grid-cols-[auto_1fr] gap-1">
                  <CheckCircle className="w-5 h-5 text-gray-300 mr-2 mt-0.5" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </li>
                <li className="grid grid-cols-[auto_1fr] gap-1">
                  <CheckCircle className="w-5 h-5 text-gray-300 mr-2 mt-0.5" />
                  <div>
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </li>
                <li className="grid grid-cols-[auto_1fr] gap-1">
                  <CheckCircle className="w-5 h-5 text-gray-300 mr-2 mt-0.5" />
                  <div>
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
