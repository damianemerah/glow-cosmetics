import { Skeleton } from "@/components/ui/skeleton";
import {
  ProductCTASkeleton,
  RelatedProductsSkeleton,
} from "@/components/product/product-skeleton";

/** Mirrors app/products/page.tsx: hero, category bar, product rows, CTA. */
export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero (PageHero) */}
      <section className="flex min-h-[320px] items-end bg-primary md:min-h-[420px]">
        <div className="container mx-auto px-4 pb-12 pt-24 md:pb-16">
          <div className="max-w-2xl space-y-4">
            <Skeleton className="h-3 w-32 bg-primary-foreground/20" />
            <Skeleton className="h-12 w-3/4 bg-primary-foreground/20 md:h-16" />
            <Skeleton className="h-5 w-full max-w-md bg-primary-foreground/15" />
          </div>
        </div>
      </section>

      {/* Category bar (desktop only, as in ProductNavigation) */}
      <div className="hidden border-b md:block">
        <div className="container mx-auto flex h-14 items-center gap-6 px-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4">
        <RelatedProductsSkeleton />
        <RelatedProductsSkeleton />
        <RelatedProductsSkeleton />
      </div>

      <ProductCTASkeleton />
    </div>
  );
}
