"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { getProductsByIds } from "@/actions/productActions";
import { ProductGroupSection } from "./product-group-section";
import type { ProductWithCategories } from "@/types";
import { RecentlyViewedProductsSkeleton } from "./product-skeleton";

const MAX_RECENT_PRODUCTS = 4;
const STORAGE_KEY = "recentlyViewedProducts";

interface RecentlyViewedProductsProps {
  currentProduct: ProductWithCategories;
}

export default function RecentlyViewedProducts({
  currentProduct,
}: RecentlyViewedProductsProps) {
  const [productIds, setProductIds] = useState<string[]>([]);

  useEffect(() => {
    if (!currentProduct?.id) return;

    try {
      const recentlyViewedJson = localStorage.getItem(STORAGE_KEY);
      let recentlyViewed: { id: string; timestamp: number }[] =
        recentlyViewedJson ? JSON.parse(recentlyViewedJson) : [];

      recentlyViewed = recentlyViewed.filter(
        (item) => item.id !== currentProduct.id
      );

      recentlyViewed.unshift({
        id: currentProduct.id,
        timestamp: Date.now(),
      });

      recentlyViewed = recentlyViewed.slice(0, MAX_RECENT_PRODUCTS + 1);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));

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
    return null;
  }

  return (
    <ProductGroupSection
      title="Recently Viewed"
      products={data.products as ProductWithCategories[]}
      className="mt-10"
    />
  );
}
