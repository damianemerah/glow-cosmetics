import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
      {/* Product Images Skeleton */}
      <div className="flex flex-col">
        <div className="aspect-square mb-4">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>
        <div className="flex space-x-2 overflow-x-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-20 h-20 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Product Info Skeleton */}
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-6 w-20" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

export function ProductDescriptionSkeleton() {
  return (
    <div className="mb-16">
      <Skeleton className="h-8 w-48 mb-4" />
      <div className="p-6 bg-gray-50 rounded-lg space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

export function RelatedProductsSkeleton() {
  return (
    <div>
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
