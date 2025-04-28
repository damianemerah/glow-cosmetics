"use client";

import { useState, useEffect } from "react";
import type { ProductWithCategories, Category } from "@/types/index";
import { ProductCard } from "@/components/product/product-card";
import { ProductCardList } from "@/components/product/product-card-list";
import ProductNavigation from "./product-navigation";
import ProductSortView, {
  type SortOption,
  type ViewMode,
} from "./product-sort-view";
import Link from "next/link";

interface ProductsGridProps {
  products: ProductWithCategories[];
  categories: Category[];
  productCount: number;
}

export default function ProductsGrid({
  products: initialProducts,
  categories,
  productCount,
}: ProductsGridProps) {
  const [currentSort, setCurrentSort] = useState<SortOption>("latest");
  const [currentView, setCurrentView] = useState<ViewMode>("grid");
  const [products, setProducts] =
    useState<ProductWithCategories[]>(initialProducts);

  // Apply sorting whenever currentSort or initialProducts change
  useEffect(() => {
    const sortedProducts = [...initialProducts].sort((a, b) => {
      switch (currentSort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "popularity":
          // Sort by bestseller first, then by most recent
          if (a.is_bestseller && !b.is_bestseller) return -1;
          if (!a.is_bestseller && b.is_bestseller) return 1;
          return (
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
          );
        case "latest":
        default:
          // Sort by most recent
          return (
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
          );
      }
    });

    setProducts(sortedProducts);
  }, [currentSort, initialProducts]);

  const handleSortChange = (sort: SortOption) => {
    setCurrentSort(sort);
  };

  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view);
  };

  return (
    <section className="pb-8 md:pb-12 pt-4 bg-background">
      <div className="container mx-auto px-4 relative">
        <p className="mb-4 text-sm text-muted-foreground">
          Showing {products.length} of {productCount} total result
          {productCount !== 1 ? "s" : ""}
        </p>

        {/* Sticky Navigation */}
        <div className="sticky top-[60px] md:top-[72px] z-20 -mx-4 px-4 bg-background border-b border-border">
          {/* Add negative margin and padding to make background span full width */}
          <ProductNavigation categoryData={categories} />

          <ProductSortView
            currentSort={currentSort}
            currentView={currentView}
            onSortChange={handleSortChange}
            onViewChange={handleViewChange}
            productCount={productCount}
            displayCount={products.length}
            className="border-t border-border"
          />
        </div>

        {/* Product Grid */}
        {products.length > 0 ? (
          currentView === "grid" ? (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
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
            <p>No products found.</p>
            <Link
              href="/products"
              className="text-primary hover:underline mt-2 inline-block"
            >
              View All Products
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
