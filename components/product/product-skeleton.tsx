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

export function ProductGridSkeletonWrapper() {
  return (
    <section className="py-8 md:py-12 bg-background">
      <div className="container mx-auto px-4 relative">
        <Skeleton className="h-6 w-1/4 mb-4" />
        <Skeleton className="h-12 w-full mb-8" />
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function LoyaltyProgramSkeleton() {
  return (
    <section className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <Skeleton className="h-64 w-full max-w-4xl mx-auto rounded-lg" />
      </div>
    </section>
  );
}

export function ProductCTASkeleton() {
  return (
    <section className="py-16 bg-[#5a6b47]">
      <div className="container mx-auto px-4 text-center">
        <Skeleton className="h-8 w-1/2 mx-auto mb-6 bg-white/20" />
        <Skeleton className="h-6 w-3/4 mx-auto mb-8 bg-white/20" />
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Skeleton className="h-12 w-32 rounded-md bg-white/30" />
          <Skeleton className="h-12 w-32 rounded-md bg-white/30" />
        </div>
      </div>
    </section>
  );
}

export function RecentlyViewedProductsSkeleton() {
  return (
    <div className="mt-10 md:mt-16 mb-16">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-square w-full rounded-md" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function MobileNavigationSkeleton() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border border-gray-200 z-60">
      <div className="grid grid-cols-5 h-16">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center space-y-1"
          >
            <Skeleton className="w-5 h-5 rounded-md" />
            <Skeleton className="w-10 h-2 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
