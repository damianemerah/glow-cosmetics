"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { getProductsByIds } from "@/actions/productActions";
import { ProductGroupSection } from "./product-group-section";
import type { ProductWithCategories } from "@/types";
import { RecentlyViewedProductsSkeleton } from "./product-skeleton";

// Maximum number of products to display
const MAX_RECENT_PRODUCTS = 4;
// Key for localStorage
const STORAGE_KEY = "recentlyViewedProducts";

interface RecentlyViewedProductsProps {
  currentProduct: ProductWithCategories;
}

export default function RecentlyViewedProducts({
  currentProduct,
}: RecentlyViewedProductsProps) {
  const [productIds, setProductIds] = useState<string[]>([]);

  // Get and update recently viewed products
  useEffect(() => {
    // Skip if we don't have a current product
    if (!currentProduct?.id) return;

    try {
      // Get existing items from localStorage
      const recentlyViewedJson = localStorage.getItem(STORAGE_KEY);
      let recentlyViewed: { id: string; timestamp: number }[] =
        recentlyViewedJson ? JSON.parse(recentlyViewedJson) : [];

      // Remove current product if it already exists in the list
      recentlyViewed = recentlyViewed.filter(
        (item) => item.id !== currentProduct.id
      );

      // Add current product to the beginning of the list with current timestamp
      recentlyViewed.unshift({
        id: currentProduct.id,
        timestamp: Date.now(),
      });

      // Keep only the most recent MAX_RECENT_PRODUCTS
      recentlyViewed = recentlyViewed.slice(0, MAX_RECENT_PRODUCTS + 1);

      // Save back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));

      // Update state with product IDs for fetching (excluding current product)
      setProductIds(
        recentlyViewed
          .filter((item) => item.id !== currentProduct.id)
          .slice(0, MAX_RECENT_PRODUCTS)
          .map((item) => item.id)
      );
    } catch (error) {
      console.error("Error saving recently viewed products:", error);
    }
  }, [currentProduct]);

  // Fetch product data for the IDs
  const { data, error, isLoading } = useSWR(
    productIds.length > 0 ? ["recently-viewed", productIds.join(",")] : null,
    () => getProductsByIds(productIds),
    { revalidateOnFocus: false }
  );

  if (isLoading) {
    return <RecentlyViewedProductsSkeleton />;
  }

  if (error) {
    console.error("Error fetching recently viewed products:", error);
    return null;
  }

  if (!data?.products || data.products.length === 0) {
    return null; // Don't show anything if no recently viewed products
  }

  return (
    <ProductGroupSection
      title="Recently Viewed"
      products={data.products as ProductWithCategories[]}
      viewAllHref="/products"
      className="mt-10"
    />
  );
}
