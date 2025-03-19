import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section Skeleton */}
      <div className="mb-16">
        <div className="max-w-4xl mx-auto text-center">
          <Skeleton className="h-10 w-2/3 mx-auto mb-4" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-5/6 mx-auto mb-2" />
          <Skeleton className="h-5 w-4/6 mx-auto mb-8" />
          <Skeleton className="h-10 w-40 mx-auto rounded-md" />
        </div>
      </div>

      {/* Services Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-6">
              <Skeleton className="h-6 w-3/4 mb-3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-9 w-28 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Service Process Skeleton */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <Skeleton className="h-8 w-56 mx-auto mb-4" />
          <Skeleton className="h-5 w-full max-w-2xl mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <Skeleton className="h-16 w-16 rounded-full" />
              </div>
              <Skeleton className="h-6 w-40 mx-auto mb-3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Skeleton */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <Skeleton className="h-8 w-56 mx-auto mb-4" />
          <Skeleton className="h-5 w-full max-w-2xl mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Skeleton className="h-12 w-12 rounded-full mr-4" />
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 w-4 mr-1" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Skeleton */}
      <div className="bg-secondary rounded-lg p-8">
        <div className="max-w-4xl mx-auto text-center">
          <Skeleton className="h-8 w-2/3 mx-auto mb-4" />
          <Skeleton className="h-5 w-full mb-2 max-w-2xl mx-auto" />
          <Skeleton className="h-5 w-5/6 mx-auto mb-6 max-w-xl" />
          <Skeleton className="h-12 w-48 mx-auto rounded-md" />
        </div>
      </div>
    </div>
  );
}
