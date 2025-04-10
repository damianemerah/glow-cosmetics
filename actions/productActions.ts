"use server";

import { createClient } from "@/utils/supabase/server";
// import { revalidatePath } from "next/cache";
// import { Database } from "@/types/types";

/**
 * Fetch product details by array of product IDs
 */
export async function getProductsByIds(productIds: string[]) {
  if (!productIds || productIds.length === 0) {
    return { products: [] };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, image_url, stock_quantity")
      .in("id", productIds);

    if (error) {
      console.error("Error fetching products by IDs:", error);
      return { products: [], error: error.message };
    }

    return { products: data || [] };
  } catch (error) {
    console.error("Exception in getProductsByIds:", error);
    return { products: [], error: "Failed to fetch products" };
  }
}