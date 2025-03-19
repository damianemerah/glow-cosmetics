import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Image Skeleton */}
        <div className="relative">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="mt-4 grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-md" />
            ))}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="flex flex-col space-y-6">
          <div>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2 mb-4" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <div className="pt-4">
            <Skeleton className="h-6 w-1/3 mb-2" />
            <div className="flex space-x-2 mb-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-10 rounded-full" />
              ))}
            </div>

            <div className="flex items-center space-x-3 mb-6">
              <div className="flex border rounded-md overflow-hidden">
                <Skeleton className="h-12 w-12" />
                <Skeleton className="h-12 w-16" />
                <Skeleton className="h-12 w-12" />
              </div>
            </div>

            <div className="space-y-3">
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          </div>

          <div className="space-y-4 pt-6">
            <Skeleton className="h-5 w-1/4" />
            <div className="space-y-2">
              <div className="flex items-center">
                <Skeleton className="h-5 w-5 mr-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="flex items-center">
                <Skeleton className="h-5 w-5 mr-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs Skeleton */}
      <div className="mt-16">
        <div className="border-b">
          <div className="flex gap-8">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        <div className="py-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        </div>
      </div>

      {/* Related Products Skeleton */}
      <div className="mt-16">
        <Skeleton className="h-8 w-1/3 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <div className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
