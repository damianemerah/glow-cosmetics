import { Suspense } from "react";
import type { Product } from "@/types/dashboard";
import ProductTabs from "@/app/products/product-tabs";
import ProductTabsSkeleton from "@/components/product/product-tabs-skeleton";

interface ProductsGridProps {
  products: Product[];
}

export default function ProductsGrid({ products }: ProductsGridProps) {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 relative">
        <Suspense fallback={<ProductTabsSkeleton />}>
          <ProductTabs products={products} />
        </Suspense>
      </div>
    </section>
  );
}
