import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Category } from "@/types";

/**
 * Fetches all product categories
 */
export async function fetchProductCategories(): Promise<Category[]> {
    const { data, error } = await supabaseAdmin
        .from("categories")
        .select("*")
        .order("name");

    if (error) {
        console.error("Error fetching product categories:", error);
        return [];
    }

    return data as Category[];
}

/**
 * Cached version of fetchProductCategories with unstable_cache
 */
export const getCachedProductCategories = unstable_cache(
    async () => fetchProductCategories(),
    ["product_categories_for_nav"],
    {
        revalidate: 3600, // Revalidate every hour
        tags: ["categories"],
    },
);
