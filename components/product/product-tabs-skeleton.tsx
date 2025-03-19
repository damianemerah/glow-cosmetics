import { Skeleton } from "@/components/ui/skeleton";

export default function ProductTabsSkeleton() {
  return (
    <div>
      {/* Tabs Header Skeleton */}
      <div className="flex overflow-x-auto overflow-y-hidden items-center gap-2 mb-8 sticky top-20 z-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-md flex-shrink-0" />
        ))}
      </div>

      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 lg:gap-10">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden border-none shadow-lg flex flex-row sm:block h-full"
          >
            <div className="relative w-[45%] sm:w-full aspect-square">
              <Skeleton className="w-full h-full" />
              {/* Bestseller badge skeleton (randomly shown) */}
              {Math.random() > 0.7 && (
                <Skeleton className="absolute top-4 right-4 h-6 w-20 rounded-full" />
              )}
            </div>
            <div className="flex-1 md:text-center sm:text-left p-4 md:p-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-5 w-16 mb-4" />
              <Skeleton className="h-10 w-full rounded-lg mt-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
