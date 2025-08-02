"use client";
import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { ProductWithCategories } from "@/types";
import { Button } from "@/constants/ui"; // Assuming you have a Button component
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
  products: ProductWithCategories[];
  viewAllHref?: string;
  className?: string;
}

export function ProductGroupSection({
  title,
  products,
  viewAllHref,
  className = "",
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
    <section className={`py-8 md:py-12 ${className}`}>
      <div className=" mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {title}
          </h2>
          {viewAllHref && (
            <Button variant="outline" size="sm" asChild>
              <Link href={viewAllHref} className="flex items-center gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
        <Carousel
          opts={{
            align: "start",
          }}
          setApi={setApi}
          className="w-full relative group"
        >
          <CarouselContent className="-ml-4">
            {products.map((product) => (
              <CarouselItem
                key={product.id}
                className="basis-[70%] md:basis-1/2 lg:basis-1/4 pl-4"
              >
                <ProductCard key={product.id} product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* Custom Navigation Buttons */}
          {canScrollPrev && (
            <div className="absolute inset-y-0 left-0 flex items-center">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => api?.scrollPrev()}
                className="p-2"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </div>
          )}
          {canScrollNext && (
            <div className="absolute inset-y-0 right-0 flex items-center">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => api?.scrollNext()}
                className="p-2"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          )}
        </Carousel>
      </div>
    </section>
  );
}

// Optional: Create a Skeleton Loader for this section
export function ProductGroupSkeleton({ title }: { title: string }) {
  return (
    <section className="py-8 md:py-12 animate-pulse">
      <h1>{title}</h1>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-8 bg-muted rounded w-24"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border rounded-lg overflow-hidden bg-card">
              <div className="h-48 bg-muted"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-6 bg-muted rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
