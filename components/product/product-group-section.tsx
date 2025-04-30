// @/components/product/product-group-section.tsx
import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { ProductWithCategories } from "@/types";
import { Button } from "@/constants/ui"; // Assuming you have a Button component
import { ArrowRight } from "lucide-react";

interface ProductGroupSectionProps {
  title: string;
  products: ProductWithCategories[];
  viewAllHref: string;
  className?: string;
}

export function ProductGroupSection({
  title,
  products,
  viewAllHref,
  className = "",
}: ProductGroupSectionProps) {
  if (!products || products.length === 0) {
    // Optionally render nothing or a placeholder if a group is empty
    return null;
  }

  return (
    <section className={`py-8 md:py-12 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {title}
          </h2>
          <Button variant="outline" size="sm" asChild>
            <Link href={viewAllHref} className="flex items-center gap-1">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
