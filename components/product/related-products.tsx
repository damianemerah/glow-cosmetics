"use client";

import type { ProductWithCategories } from "@/types/index";
import useSWR from "swr";
import { createClient } from "@/utils/supabase/client";
import { RelatedProductsSkeleton } from "./product-skeleton";
import { ProductCard } from "@/components/product/product-card";

const fetchRelatedProducts = async (
  productId: string
): Promise<ProductWithCategories[]> => {
  if (!productId) return [];

  const supabase = createClient();

  try {
    const { data: productCategoryData, error: categoryError } = await supabase
      .from("product_categories")
      .select("category_id")
      .eq("product_id", productId);

    if (
      categoryError ||
      !productCategoryData ||
      productCategoryData.length === 0
    ) {
      console.error(
        "Error fetching product categories:",
        categoryError?.message || "No categories found"
      );
      return [];
    }

    const categoryIds = productCategoryData.map((item) => item.category_id);

    const { data: relatedProductLinks, error: relatedLinksError } =
      await supabase
        .from("product_categories")
        .select("product_id")
        .in("category_id", categoryIds)
        .neq("product_id", productId)
        .limit(6);

    if (
      relatedLinksError ||
      !relatedProductLinks ||
      relatedProductLinks.length === 0
    ) {
      console.error(
        "Error fetching related product links:",
        relatedLinksError?.message || "No related links found"
      );
      return [];
    }

    const relatedProductIds = [
      ...new Set(relatedProductLinks.map((item) => item.product_id)),
    ];

    if (relatedProductIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .in("id", relatedProductIds)
      .eq("is_active", true)
      .limit(4);

    if (error) {
      console.error("Error fetching related products:", error.message);
      throw new Error("Failed to fetch related products.");
    }

    return (data as ProductWithCategories[]) || [];
  } catch (err) {
    console.error("An error occurred in fetchRelatedProducts:", err);
    throw err;
  }
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
    () => fetchRelatedProducts(productId),
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard product={product} key={product.id} />
        ))}
      </div>
    </div>
  );
}
