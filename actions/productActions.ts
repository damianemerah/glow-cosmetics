"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type {
  CartItemInputData,
  Category,
  ProductWithCategories,
} from "@/types";
import { unstable_cache } from "next/cache";

const DEFAULT_GROUP_LIMIT = 8;

async function fetchProductGroup(
  options: {
    limit?: number;
    orderBy?: keyof ProductWithCategories;
    ascending?: boolean;
    filter?:
      | { key: "is_bestseller"; value: boolean }
      | { key: "compare_price"; operator: "not.is"; value: null }
      | { key: "random"; value: true };
  } = {},
): Promise<ProductWithCategories[]> {
  const limit = options.limit ?? DEFAULT_GROUP_LIMIT;
  if (options.filter?.key === "random") {
    const { data, error } = await supabaseAdmin.rpc("get_random_products", {
      count: limit,
    });

    if (error) {
      console.error("Error fetching random products via RPC:", error);
      return []; // Return empty on error
    }
    if (!data || data.length === 0) {
      console.log("No random products returned from RPC.");
      return [];
    }

    const productIds = data.map((p: ProductWithCategories) => p.id);
    const { data: detailedProducts, error: detailError } = await supabaseAdmin
      .from("products")
      .select(`*, product_categories ( categories ( id, name, slug ) )`)
      .in("id", productIds)
      .eq("is_active", true); // Ensure fetched products are active

    if (detailError) {
      console.error("Error fetching detailed random products:", detailError);
      return []; // Return empty on error
    }

    return (detailedProducts as ProductWithCategories[]) ?? [];
  } else {
    let query = supabaseAdmin
      .from("products")
      .select(
        `*,
               product_categories (
                categories ( id, name, slug )
              )`,
      )
      .eq("is_active", true);

    // Apply specific filters if options.filter exists (it won't be 'random' here)
    if (options.filter) {
      // Type guards correctly narrow the filter type here
      if ("operator" in options.filter) { // This implies key is 'compare_price'
        query = query.filter(
          options.filter.key,
          options.filter.operator,
          options.filter.value,
        );
      } else { // This implies key is 'is_bestseller'
        query = query.eq(
          options.filter.key,
          options.filter.value,
        );
      }
    } else {
      console.log("No specific filter applied.");
    }

    // Apply ordering
    if (options.orderBy) {
      query = query.order(options.orderBy, {
        ascending: options.ascending ?? false,
      });
    }

    // Apply limit
    query = query.limit(limit);

    // Execute query
    const { data: fetchedProducts, error } = await query;

    if (error) {
      console.error(
        `Error fetching product group (Filter: ${options.filter?.key}, Order: ${options.orderBy}):`,
        error,
      );
      return []; // Return empty on error
    }
    return (fetchedProducts as ProductWithCategories[]) ?? [];
  }
}

// --- Rest of the file (fetchNewlyAddedProducts, etc.) remains the same ---

// --- Specific Fetch Functions ---

export const fetchNewlyAddedProducts = unstable_cache(
  async (limit: number = DEFAULT_GROUP_LIMIT) =>
    fetchProductGroup({ limit, orderBy: "created_at", ascending: false }),
  ["products", "newly-added"],
  { revalidate: 300, tags: ["products"] },
);

export const fetchDealsOfTheWeek = unstable_cache(
  async (limit: number = DEFAULT_GROUP_LIMIT) =>
    fetchProductGroup({
      limit,
      filter: { key: "compare_price", operator: "not.is", value: null },
      orderBy: "created_at", // Optional: sort deals by newest first
      ascending: false,
    }),
  ["products", "deals"],
  { revalidate: 3600, tags: ["products"] },
);

export const fetchBestSellingProducts = unstable_cache(
  async (limit: number = DEFAULT_GROUP_LIMIT) =>
    fetchProductGroup({
      limit,
      filter: { key: "is_bestseller", value: true },
      orderBy: "created_at", // Optional: sort bestsellers by newest first
      ascending: false,
    }),
  ["products", "bestsellers"],
  { revalidate: 3600, tags: ["products"] },
);

export const fetchRecommendedProducts = unstable_cache(
  async (limit: number = DEFAULT_GROUP_LIMIT) =>
    // Use the 'random' filter handled in the helper
    fetchProductGroup({ limit, filter: { key: "random", value: true } }),
  ["products", "recommended"],
  { revalidate: 86400, tags: ["products"] }, // Revalidate less often for random
);

// --- Fetch All/Filtered Products (for the "View All" pages) ---
export type ProductSortOption =
  | "latest"
  | "price-asc"
  | "price-desc"
  | "popularity";
export type ProductFilterOption = "all" | "deals" | "bestseller";

export interface FetchProductsParams {
  sort?: ProductSortOption;
  filter?: ProductFilterOption;
  categorySlug?: string; // Added for category filtering
  subCategorySlug?: string; // Added for sub-category filtering
  page?: number;
  limit?: number;
}

const PRODUCTS_PER_PAGE = 12; // Or your desired page size

export async function fetchFilteredProducts(params: FetchProductsParams) {
  const {
    sort = "latest",
    filter = "all",
    categorySlug,
    subCategorySlug,
    page = 1,
    limit = PRODUCTS_PER_PAGE,
  } = params;
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from("products")
    .select(
      `*,
             product_categories!inner (
                categories!inner ( id, name, slug, parent_id )
             )`,
      { count: "exact" }, // Get total count for pagination
    )
    .eq("is_active", true)
    .range(offset, offset + limit - 1); // Apply pagination range

  // Apply Filters
  if (filter === "deals") {
    query = query.not("compare_price", "is", null);
  } else if (filter === "bestseller") {
    query = query.eq("is_bestseller", true);
  }

  // Apply Category Filters
  if (subCategorySlug && categorySlug) {
    // Filter by sub-category (which implies parent category)
    query = query.eq("product_categories.categories.slug", subCategorySlug);
    // We might need an additional check for the parent slug if slugs aren't unique globally
    // This requires joining categories twice or adjusting the query structure.
    // For simplicity here, assuming subCategorySlug is sufficient if provided.
    // A safer approach involves filtering on category ID after fetching the category ID from the slug.
    // Let's refine this: Fetch category IDs first.
    const { data: subCategoryData } = await supabaseAdmin.from("categories")
      .select("id, parent_id").eq("slug", subCategorySlug).single();
    if (subCategoryData) {
      const { data: parentCategoryData } = await supabaseAdmin.from(
        "categories",
      ).select("id").eq("slug", categorySlug).eq(
        "id",
        subCategoryData.parent_id,
      ).single();
      if (parentCategoryData) {
        // Now we are sure the hierarchy is correct
        query = query.eq("product_categories.category_id", subCategoryData.id);
      } else {
        // Subcategory slug found, but parent slug doesn't match hierarchy -> return empty
        console.warn(
          `Subcategory ${subCategorySlug} found, but parent ${categorySlug} mismatch.`,
        );
        return { products: [], count: 0 };
      }
    } else {
      // Subcategory slug not found -> return empty
      console.warn(`Subcategory slug ${subCategorySlug} not found.`);
      return { products: [], count: 0 };
    }
  } else if (categorySlug) {
    // Filter by top-level category (including products in its sub-categories)
    const { data: parentCategory } = await supabaseAdmin
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .is("parent_id", null) // Ensure it's a top-level category slug
      .single();

    if (parentCategory) {
      // Find all child category IDs
      const { data: childCategories } = await supabaseAdmin
        .from("categories")
        .select("id")
        .eq("parent_id", parentCategory.id);

      const categoryIds = [
        parentCategory.id,
        ...(childCategories?.map((c) => c.id) || []),
      ];
      query = query.in("product_categories.category_id", categoryIds);
    } else {
      // Parent category slug not found or not top-level -> return empty
      console.warn(`Top-level category slug ${categorySlug} not found.`);
      return { products: [], count: 0 };
    }
  }

  // Apply Sorting
  switch (sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "popularity":
      query = query.order("is_bestseller", { ascending: false })
        .order("created_at", { ascending: false }); // Example popularity: bestseller then newest
      break;
    case "latest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching filtered products:", error);
    return { products: [], count: 0 };
  }

  // Process results to fit ProductWithCategories structure if needed
  // The select already includes categories, but we might need to flatten/remap
  const products = data?.map((p) => ({
    ...p,
    product_categories: p.product_categories
      ? (Array.isArray(p.product_categories)
        ? p.product_categories
        : [p.product_categories])
      : [], // Ensure it's an array
  })) as ProductWithCategories[];

  return { products: products ?? [], count: count ?? 0 };
}

// You might still need fetchCategories if ProductNavigation is used elsewhere
// or if you need the full category tree for filtering UI.
export async function fetchCategories() {
  try {
    // Fetch all categories
    const { data: categories, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error);
      throw new Error(error.message);
    }
    // Note: Product counts per category are not strictly needed for the main product page grouping
    // but might be useful for the navigation/filter UI if you display counts there.
    // If not needed, you can remove the count logic for performance.
    const productsCount: Record<string, number> = {};
    if (categories) { // only count if categories were fetched
      await Promise.all(
        (categories as Category[]).map(async (category) => {
          const { count, error: countError } = await supabaseAdmin
            .from("product_categories")
            .select("product_id", { count: "exact", head: true })
            .eq("category_id", category.id);

          if (countError) {
            console.error(
              `Error counting products for category ${category.id}:`,
              countError,
            );
          } else {
            productsCount[category.id] = count || 0;
          }
        }),
      );
    }

    return {
      categories: (categories as Category[]) ?? [],
      productsCount,
    };
  } catch (error) {
    console.error("Error in fetchCategories:", error);
    return { categories: [], productsCount: {} };
  }
}

// Cache the categories data
export const getCachedCategories = unstable_cache(
  async () => fetchCategories(),
  ["categories"],
  { revalidate: 3600, tags: ["categories", "products"] }, // Revalidate less often, tag appropriately
);

export async function getProductsByIds(
  productIds: string[],
): Promise<{ products: CartItemInputData[]; error?: string }> {
  if (!productIds || productIds.length === 0) {
    return { products: [] };
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("id, name, price, image_url, stock_quantity, color")
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
