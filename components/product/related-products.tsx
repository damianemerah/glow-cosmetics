"use client";

import type { ProductWithCategories } from "@/types/index";
import useSWR from "swr";
import { createClient } from "@/utils/supabase/client";
import { RelatedProductsSkeleton } from "./product-skeleton";
import { ProductCard } from "@/components/product/product-card";

type CategoryHierarchy = {
  id: string;
  name: string;
  slug: string;
  is_last: boolean;
};

export const fetchRelatedProductsByCategory = async (
  categoryId: string,
  limit = 4
): Promise<ProductWithCategories[]> => {
  if (!categoryId) return [];

  const supabase = createClient();

  // 1) Get all ancestors of this category
  const { data: hierarchy, error: hierErr } = await supabase.rpc(
    "get_category_hierarchy",
    { cat_id: categoryId }
  );

  if (hierErr) {
    console.error("Error loading category hierarchy:", hierErr.message);
    return [];
  }
  const ancestorIds = hierarchy?.map((r: CategoryHierarchy) => r.id) ?? [];

  // 2) Get all descendants (children, grandchildren, …) of these ancestors
  //    We'll do this via a single SQL query rather than client‐side recursion:
  const { data: descRows, error: descErr } = await supabase
    .from("categories")
    .select("id")
    .in("parent_id", ancestorIds);

  if (descErr) {
    console.error("Error loading descendant categories:", descErr.message);
    return [];
  }
  const descendantIds = descRows?.map((c) => c.id) ?? [];

  // 3) Combine original + ancestors + descendants
  const allCatIds = Array.from(
    new Set([categoryId, ...ancestorIds, ...descendantIds])
  );

  if (allCatIds.length === 0) {
    return [];
  }

  // 4) Fetch up to `limit` products in any of these categories
  //    including their product_categories join so we get ProductWithCategories[]
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select(`*, product_categories(category_id)`)
    .in("product_categories.category_id", allCatIds)
    .eq("is_active", true)
    .limit(limit);

  if (prodErr) {
    console.error("Error fetching related products:", prodErr.message);
    return [];
  }

  return (products as ProductWithCategories[]) ?? [];
};

interface RelatedProductsProps {
  productId: string;
}

export default function RelatedProducts({ productId }: RelatedProductsProps) {
  const {
    data: products,
    error,
    isLoading,
  } = useSWR(
    productId ? ["related-products", productId] : null,
    () => fetchRelatedProductsByCategory(productId),
    {
      revalidateOnFocus: false,
    }
  );

  if (isLoading) {
    return <RelatedProductsSkeleton />;
  }

  if (error) {
    console.error("SWR Error fetching related products:", error);
    return (
      <div className="text-red-600 text-center py-4">
        Could not load related products.
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 md:mt-16 mb-16">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 font-montserrat">
        You May Also Like
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard product={product} key={product.id} />
        ))}
      </div>
    </div>
  );
}
