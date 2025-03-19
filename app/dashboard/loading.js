import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Tabs Skeleton */}
      <div className="mb-8">
        <div className="flex border-b">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="mr-4">
              <Skeleton className="h-10 w-28" />
            </div>
          ))}
        </div>
      </div>

      {/* Profile Section Skeleton */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <div className="border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Skeleton className="h-16 w-16 rounded-full mr-4" />
                <div>
                  <Skeleton className="h-6 w-36 mb-1" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Skeleton className="h-5 w-5 mr-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex items-center">
                  <Skeleton className="h-5 w-5 mr-2" />
                  <Skeleton className="h-4 w-36" />
                </div>
                <div className="flex items-center">
                  <Skeleton className="h-5 w-5 mr-2" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </div>
          </div>
          <div className="md:w-2/3">
            <div className="border rounded-lg p-6">
              <Skeleton className="h-6 w-40 mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Bookings Skeleton */}
      <div className="mb-10">
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-secondary p-4 border-b flex justify-between items-center">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
          <div className="p-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="mb-4 last:mb-0 p-4 border rounded-lg">
                <div className="flex flex-col sm:flex-row justify-between mb-4">
                  <div>
                    <Skeleton className="h-5 w-36 mb-1" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <Skeleton className="h-7 w-24 rounded-full" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Skeleton className="h-9 w-28 rounded-md mr-2" />
                  <Skeleton className="h-9 w-28 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order History Skeleton */}
      <div className="mb-10">
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-secondary p-4 border-b">
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="divide-y">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-48 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="text-right sm:text-left flex-shrink-0">
                  <Skeleton className="h-5 w-20 mb-1 sm:ml-auto" />
                  <Skeleton className="h-7 w-24 rounded-full sm:ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Recommendations Skeleton */}
      <div>
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-secondary p-4 border-b">
            <Skeleton className="h-6 w-56" />
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-3">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-3" />
                    <Skeleton className="h-9 w-full rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
