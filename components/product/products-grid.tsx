"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ProductWithCategories } from "@/types/index";
import { ProductCard } from "@/components/product/product-card";
import { ProductCardList } from "@/components/product/product-card-list";
import ProductSortView, {
  type SortOption,
  type ViewMode,
} from "./product-sort-view";
import Link from "next/link";
import { useScrollStore } from "@/store/scrollStore";

interface ProductsGridProps {
  products: ProductWithCategories[];
  productCount: number;
  initialSort?: SortOption;
  initialFilter?: string;
}

export default function ProductsGrid({
  products: initialProducts,
  productCount,
  initialSort = "latest",
  initialFilter,
}: ProductsGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [currentSort, setCurrentSort] = useState<SortOption>(() => {
    const sortParam = searchParams.get("sort") as SortOption | null;
    return sortParam || initialSort;
  });
  const [currentView, setCurrentView] = useState<ViewMode>("grid");
  const [products, setProducts] =
    useState<ProductWithCategories[]>(initialProducts);

  const localFiltersRef = useRef<HTMLDivElement>(null);
  const setFiltersElementRef = useScrollStore(
    (state) => state.setFiltersElementRef
  );
  const clearFiltersElementRef = useScrollStore(
    (state) => state.clearFiltersElementRef
  );

  useEffect(() => {
    if (localFiltersRef.current) {
      setFiltersElementRef(localFiltersRef);
    }

    return () => {
      clearFiltersElementRef(localFiltersRef);
    };
  }, [setFiltersElementRef, clearFiltersElementRef]);

  useEffect(() => {
    const sortParam = searchParams.get("sort") as SortOption | null;
    setCurrentSort(sortParam || initialSort);
    setProducts(initialProducts);
  }, [searchParams, initialSort, initialProducts]);

  const handleSortChange = (sort: SortOption) => {
    setCurrentSort(sort);
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("sort", sort);
    current.delete("page");
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`);
  };

  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view);
  };

  return (
    <section ref={localFiltersRef} className="pb-8 md:pb-12 bg-background">
      <div className=" mx-auto relative">
        <div className="sticky top-0 md:top-14 z-20 -mx-4 px-4 bg-background border-b border-border">
          <ProductSortView
            currentSort={currentSort}
            currentView={currentView}
            onSortChange={handleSortChange}
            onViewChange={handleViewChange}
            productCount={productCount}
            displayCount={products.length}
          />
        </div>

        {/* Product Grid/List */}
        {products.length > 0 ? (
          currentView === "grid" ? (
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              {products.map((product) => (
                <ProductCardList key={product.id} product={product} />
              ))}
            </div>
          )
        ) : (
          <div className="mt-16 text-center text-muted-foreground">
            {initialFilter || currentSort !== "latest" ? (
              <p>No products found matching your criteria.</p>
            ) : (
              <p>No products available yet.</p>
            )}
            <Link
              href="/products"
              className="text-primary hover:underline mt-2 inline-block"
              onClick={(e) => {
                e.preventDefault();
                router.push("/products");
              }}
            >
              View All Products
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
