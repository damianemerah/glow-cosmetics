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
import { SearchX } from "lucide-react";
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
      <div className="relative">
        <div className="sticky top-0 z-20 -mx-4 border-b border-border bg-background/95 px-4 backdrop-blur md:top-14">
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
            <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-10 lg:grid-cols-4">
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
          <div className="mx-auto mt-12 flex max-w-md flex-col items-center rounded-xl border border-dashed bg-secondary/40 px-6 py-14 text-center">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <SearchX className="h-6 w-6" />
            </span>
            <h3 className="font-heading text-xl font-medium text-foreground">
              {initialFilter || currentSort !== "latest"
                ? "No products match these filters"
                : "No products available yet"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a different sort or browse the full collection.
            </p>
            <Link
              href="/products"
              className="mt-6 text-sm font-medium text-primary hover:underline"
              onClick={(e) => {
                e.preventDefault();
                router.push("/products");
              }}
            >
              View all products
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
