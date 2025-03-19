import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Skeleton className="h-8 w-48 mb-8" />

      <div className="grid md:grid-cols-12 gap-8">
        {/* Checkout Form Skeleton */}
        <div className="md:col-span-7">
          <div className="border rounded-lg p-6 mb-6">
            <Skeleton className="h-6 w-40 mb-6" />

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <Skeleton className="h-6 w-40 mb-6" />

            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-12 w-full rounded-md" />
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary Skeleton */}
        <div className="md:col-span-5">
          <div className="border rounded-lg overflow-hidden sticky top-8">
            <div className="bg-secondary p-4 border-b">
              <Skeleton className="h-6 w-32" />
            </div>

            <div className="divide-y">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-4 flex items-center">
                  <Skeleton className="h-16 w-16 rounded-md mr-4" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-1" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4">
              <div className="space-y-3 mb-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>

              <div className="mt-6">
                <Skeleton className="h-12 w-full rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
