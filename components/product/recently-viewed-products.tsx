"use client";

// This component displays a "Recently Viewed" product section for the user.
// It tracks recently viewed products using localStorage and syncs them to Supabase for logged-in users.
// The component fetches product details for the recently viewed product IDs and displays them in a group section.

import { useEffect, useState } from "react";
import useSWR from "swr";
import { getProductsByIds } from "@/actions/productActions";
import { ProductGroupSection } from "./product-group-section";
import type { ProductWithCategories } from "@/types";
import { RecentlyViewedProductsSkeleton } from "./product-skeleton";
import { createClient } from "@/utils/supabase/client";

const MAX_RECENT_PRODUCTS = 8; // Maximum number of recently viewed products to track/display
const STORAGE_KEY = "recentlyViewedProducts"; // Key for localStorage

interface RecentlyViewedProductsProps {
  currentProduct: ProductWithCategories;
}

export default function RecentlyViewedProducts({
  currentProduct,
}: RecentlyViewedProductsProps) {
  // State to hold the IDs of recently viewed products (excluding the current one)
  const [productIds, setProductIds] = useState<string[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // Only run if there is a current product
    if (!currentProduct?.id) return;

    try {
      // Get the current list of recently viewed products from localStorage
      const raw = localStorage.getItem(STORAGE_KEY);
      let list: { id: string; timestamp: number }[] = raw
        ? JSON.parse(raw)
        : [];

      // Remove the current product if it already exists in the list
      list = list.filter((item) => item.id !== currentProduct.id);

      // Add the current product to the front of the list with a timestamp
      list.unshift({ id: currentProduct.id, timestamp: Date.now() });

      // Limit the list to MAX_RECENT_PRODUCTS + 1 (to allow exclusion of the current product)
      list = list.slice(0, MAX_RECENT_PRODUCTS + 1);

      // Save the updated list back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

      // Prepare the list of product IDs to display (excluding the current product)
      const displayIds = list
        .filter((item) => item.id !== currentProduct.id)
        .slice(0, MAX_RECENT_PRODUCTS)
        .map((item) => item.id);

      setProductIds(displayIds);

      // If the user is logged in, sync the recently viewed list to Supabase via RPC
      (async () => {
        const { data: { session } = {} } = await supabase.auth.getSession();
        const userId = session?.user.id;
        if (userId) {
          const uuidList = displayIds;
          // Call the Supabase RPC to update the user's recently viewed products
          const { error } = await supabase.rpc("set_recently_viewed", {
            p_user_id: userId,
            p_recent_list: uuidList,
          });
          if (error) console.error("set_recently_viewed RPC error:", error);
        }
      })();
    } catch (err) {
      console.error("Error handling recently viewed:", err);
    }
  }, [currentProduct, supabase]);

  // Fetch product details for the recently viewed product IDs using SWR
  const { data, error, isLoading } = useSWR(
    productIds.length > 0 ? ["recently-viewed", productIds.join(",")] : null,
    () => getProductsByIds(productIds),
    { revalidateOnFocus: false }
  );

  // Show skeleton while loading, or if no products are found yet but still potentially loading
  if (isLoading || (productIds.length === 0 && currentProduct?.id)) {
    return <RecentlyViewedProductsSkeleton />;
  }

  // If there is an error or no products to show, render nothing
  if (error || !data?.products || data.products.length === 0) {
    return null;
  }

  // Render the recently viewed products section
  return (
    <ProductGroupSection
      title="Recently Viewed"
      products={data.products as ProductWithCategories[]}
      className="mt-10"
    />
  );
}
