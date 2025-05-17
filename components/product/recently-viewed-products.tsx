"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { getProductsByIds } from "@/actions/productActions";
import { ProductGroupSection } from "./product-group-section";
import type { ProductWithCategories } from "@/types";
import { RecentlyViewedProductsSkeleton } from "./product-skeleton";
import { createClient } from "@/utils/supabase/client";

const MAX_RECENT_PRODUCTS = 4;
const STORAGE_KEY = "recentlyViewedProducts";

interface RecentlyViewedProductsProps {
  currentProduct: ProductWithCategories;
}

export default function RecentlyViewedProducts({
  currentProduct,
}: RecentlyViewedProductsProps) {
  const [productIds, setProductIds] = useState<string[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!currentProduct?.id) return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      let list: { id: string; timestamp: number }[] = raw
        ? JSON.parse(raw)
        : [];

      // Remove existing, prepend current
      list = list.filter((item) => item.id !== currentProduct.id);
      list.unshift({ id: currentProduct.id, timestamp: Date.now() });
      list = list.slice(0, MAX_RECENT_PRODUCTS + 1);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

      // Update display list (excluding current)
      const displayIds = list
        .filter((item) => item.id !== currentProduct.id)
        .slice(0, MAX_RECENT_PRODUCTS)
        .map((item) => item.id);
      setProductIds(displayIds);

      // Sync to Supabase RPC
      (async () => {
        const { data: { session } = {} } = await supabase.auth.getSession();
        const userId = session?.user.id;
        if (userId) {
          const uuidList = displayIds;
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

  const { data, error, isLoading } = useSWR(
    productIds.length > 0 ? ["recently-viewed", productIds.join(",")] : null,
    () => getProductsByIds(productIds),
    { revalidateOnFocus: false }
  );

  if (isLoading) {
    return <RecentlyViewedProductsSkeleton />;
  }

  if (error || !data?.products || data.products.length === 0) {
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
