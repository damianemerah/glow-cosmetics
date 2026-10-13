"use client";
import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { ProductWithCategories } from "@/types";
import { Button } from "@/constants/ui";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";

interface ProductGroupSectionProps {
  title: string;
  eyebrow?: string;
  products: ProductWithCategories[];
  viewAllHref?: string;
  className?: string;
}

export function ProductGroupSection({
  title,
  eyebrow,
  products,
  viewAllHref,
  className,
}: ProductGroupSectionProps) {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback((carouselApi: CarouselApi) => {
    if (!carouselApi) return; // Add this line to check if carouselApi is defined
    setCanScrollPrev(carouselApi.canScrollPrev());
    setCanScrollNext(carouselApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }
    onSelect(api);
    api.on("select", onSelect);
    // Clean up event listener on component unmount
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  if (!products || products.length === 0) {
    // Optionally render nothing or a placeholder if a group is empty
    return null;
  }

  return (
    <section className={cn("py-10 md:py-16", className)}>
      <div className="mb-8 flex items-end justify-between gap-4 md:mb-10">
        <div>
          {eyebrow && <p className="eyebrow mb-2 text-primary">{eyebrow}</p>}
          <h2 className="font-heading text-3xl font-medium leading-tight text-foreground md:text-4xl">
            {title}
          </h2>
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary"
          >
            View all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
      <Carousel
        opts={{
          align: "start",
        }}
        setApi={setApi}
        className="group relative w-full"
      >
        <CarouselContent className="-ml-4 md:-ml-6">
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="basis-[70%] pl-4 sm:basis-1/2 md:pl-6 lg:basis-1/4"
            >
              <ProductCard key={product.id} product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Custom Navigation Buttons */}
        {canScrollPrev && (
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous products"
            onClick={() => api?.scrollPrev()}
            className="absolute -left-3 top-[38%] hidden h-11 w-11 -translate-y-1/2 rounded-full bg-card/95 shadow-elevated backdrop-blur md:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        {canScrollNext && (
          <Button
            variant="outline"
            size="icon"
            aria-label="Next products"
            onClick={() => api?.scrollNext()}
            className="absolute -right-3 top-[38%] hidden h-11 w-11 -translate-y-1/2 rounded-full bg-card/95 shadow-elevated backdrop-blur md:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
      </Carousel>
    </section>
  );
}

export function ProductGroupSkeleton({ title }: { title: string }) {
  return (
    <section className="py-10 md:py-16" aria-busy="true" aria-label={title}>
      <div className="mb-8 flex items-end justify-between md:mb-10">
        <div className="h-9 w-56 animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-16 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={cn("space-y-3", i > 1 && "hidden lg:block")}>
            <div className="aspect-[4/5] animate-pulse rounded-xl bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </section>
  );
}
