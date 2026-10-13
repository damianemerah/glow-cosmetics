import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Mirrors components/product/product-details.tsx (gallery + buy box). */
export function ProductDetailSkeleton() {
  return (
    <div className="mb-8 md:mb-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <div className="flex flex-col gap-4">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-16 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Buy box */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-9 w-4/5" />
            <Skeleton className="h-9 w-1/2" />
          </div>
          <Skeleton className="h-8 w-28" />
          <div className="flex items-center gap-3 border-t pt-6">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-9 w-28 rounded-full" />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex flex-1 flex-wrap gap-3">
              <Skeleton className="h-12 min-w-[150px] flex-1 rounded-full" />
              <Skeleton className="h-12 min-w-[150px] flex-1 rounded-full" />
            </div>
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          </div>
          <div className="space-y-2 rounded-lg border p-4 md:p-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Mirrors components/product/product-description.tsx (tab + panel). */
export function ProductDescriptionSkeleton() {
  return (
    <div className="mb-16 mt-12 md:mt-20">
      <div className="mb-6 flex gap-6 border-b pb-3">
        <Skeleton className="h-6 w-28" />
      </div>
      <div className="space-y-3 rounded-xl border bg-card p-4 md:p-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}

/** Mirrors the header + carousel of components/product/product-group-section.tsx. */
function ProductGroupRowSkeleton({ className }: { className?: string }) {
  return (
    <section className={cn("py-10 md:py-16", className)} aria-busy="true">
      <div className="mb-8 flex items-end justify-between gap-4 md:mb-10">
        <div className="space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-9 w-56" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="overflow-hidden">
        <div className="-ml-4 flex md:-ml-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 basis-[70%] pl-4 sm:basis-1/2 md:pl-6 lg:basis-1/4"
            >
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RelatedProductsSkeleton() {
  return <ProductGroupRowSkeleton />;
}

export function RecentlyViewedProductsSkeleton() {
  return <ProductGroupRowSkeleton className="border-t" />;
}

/** Mirrors components/product/products-grid.tsx (toolbar + 2/3/4-col grid). */
export function ProductGridSkeletonWrapper() {
  return (
    <section className="bg-background pb-8 md:pb-12" aria-busy="true">
      <div className="-mx-4 flex items-center justify-between gap-4 border-b px-4 py-4">
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="hidden h-9 w-20 rounded-md sm:block" />
        </div>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-10 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

/** Mirrors the inset green card in components/product/product-cta.tsx. */
export function ProductCTASkeleton() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center rounded-3xl bg-primary px-6 py-16 md:px-16 md:py-24">
          <Skeleton className="mb-4 h-3 w-32 bg-primary-foreground/20" />
          <Skeleton className="h-10 w-full max-w-md bg-primary-foreground/20" />
          <Skeleton className="mt-4 mb-10 h-5 w-full max-w-sm bg-primary-foreground/15" />
          <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <Skeleton className="h-12 w-full rounded-full bg-primary-foreground/30 sm:w-36" />
            <Skeleton className="h-12 w-full rounded-full bg-primary-foreground/20 sm:w-48" />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Mirrors components/product/product-card.tsx. */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-card shadow-soft ring-1 ring-border/60">
      <Skeleton className="aspect-[10/11] w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="mt-3 h-10 w-full rounded-full" />
      </div>
    </div>
  );
}

export function MobileNavigationSkeleton() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-60">
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
