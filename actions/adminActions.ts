"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";
import { unstable_cache } from "next/cache";
import type { Category, ProductWithCategories } from "@/types/index";
import slugify from "slugify";
import { sanitizeTitle } from "@/utils";

// Image upload function
export const uploadImageToSupabase = async (
  formData: FormData,
): Promise<
  { success: boolean; data?: string; error?: string; errorCode?: string }
> => {
  try {
    const file = formData.get("file") as File;
    const bucket = formData.get("bucket") as string;
    const title = sanitizeTitle(formData.get("title") as string || "");

    if (!file || !bucket) {
      return {
        success: false,
        error: "File or bucket name is missing.",
        errorCode: "MISSING_PARAMETERS",
      };
    }

    const allowedExtensions = ["jpg", "jpeg", "webp", "png"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return {
        success: false,
        error: "Invalid file type. Only JPG, JPEG, PNG and WEBP are allowed.",
        errorCode: "INVALID_FILE_TYPE",
      };
    }

    const shortTs = Date.now().toString().slice(-5);
    const safeOriginal = file.name.replace(/\s+/g, "_");
    const uniqueFilename = title
      ? `${title}_${shortTs}_${safeOriginal}`
      : `${shortTs}_${safeOriginal}`;

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(uniqueFilename, file, {
        cacheControl: "3600",
        upsert: false,
        metadata: { title },
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      return {
        success: false,
        error: "Failed to upload image to storage.",
        errorCode: "STORAGE_UPLOAD_ERROR",
      };
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      success: true,
      data: urlData.publicUrl,
    };
  } catch (err) {
    console.error("Error uploading image:", err);
    return {
      success: false,
      error: "An unexpected error occurred during image upload.",
      errorCode: "UNKNOWN_ERROR",
    };
  }
};

// CATEGORY FUNCTIONS

// Fetch all categories with product counts
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

    // Count products in each category using the join table
    const productsCount: Record<string, number> = {};

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

    return {
      categories: categories as Category[],
      productsCount,
    };
  } catch (error) {
    console.error("Error in fetchCategories:", error);
    return { categories: [], productsCount: {} };
  }
}

// Fetch category by ID
export async function fetchCategoryById(id: string): Promise<
  | { success: true; categories: Category[] }
  | { success: true; categories: Category }
  | { success: false; error: string }
> {
  try {
    // Special case for 'all' - return all categories for dropdown
    if (id === "all") {
      const { data: categories, error } = await supabaseAdmin
        .from("categories")
        .select("*")
        .order("name");

      if (error) {
        console.log(`Failed to fetch categories: ${error.message}`);
        return { success: false, error: error.message };
      }

      return { success: true, categories: categories as Category[] };
    }

    if (id === "parent-only") {
      const { data: categories, error } = await supabaseAdmin
        .from("categories")
        .select("*")
        .is("parent_id", null)
        .order("name");

      if (error) {
        console.log(`Failed to fetch categories: ${error.message}`);
        return { success: false, error: error.message };
      }

      return { success: true, categories: categories as Category[] };
    }

    // Regular category fetch by ID
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch category: ${error.message}`);
    }

    // Convert images format if needed
    if (data) {
      const images = data.images
        ? Array.isArray(data.images) ? data.images : [data.images]
        : [];

      return {
        success: true,
        categories: {
          ...data,
          images,
        } as Category,
      };
    }

    return { success: false, error: "Category not found" };
  } catch (error) {
    console.error("Error fetching category:", error);
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

// Create or update category
export async function saveCategory(data: Partial<Category>, id: string) {
  try {
    // Generate slug from category name
    const slug = slugify(data.name as string, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });

    // Add slug to data
    const categoryData = {
      ...data,
      slug,
    };

    const { error } = id === "new"
      ? await supabaseAdmin.from("categories").insert(categoryData)
      : await supabaseAdmin.from("categories").update(categoryData).eq(
        "id",
        id,
      );

    if (error) {
      console.error("Error saving category:", error);
      throw new Error(error.message);
    }

    // Revalidate category data
    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${id}`);
    revalidatePath("/products");
    revalidateTag("categories");

    return { success: true };
  } catch (error) {
    const err = error as Error;
    console.error("Error saving category:", err);
    return { success: false, error: err.message };
  }
}

// Fetch product by ID
export async function fetchProductById(id: string) {
  try {
    if (id === "new") return { success: true, data: null };

    const { data, error } = await supabaseAdmin
      .from("products")
      .select(`
        *,
        product_categories (
          category_id,
          categories:category_id (id, name)
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Failed to fetch product: ${error.message}`);
      return {
        success: false,
        error: `Failed to fetch product: ${error.message}`,
        errorCode: "DB_ERROR",
      };
    }

    // Ensure image_url is an array and extract categories
    if (data) {
      const imageUrl = data.image_url
        ? Array.isArray(data.image_url)
          ? data.image_url
          : data.image_url
          ? [data.image_url]
          : []
        : [];

      // Extract category IDs from product_categories
      const categoryIds =
        data.product_categories?.map((pc: { category_id: string }) =>
          pc.category_id
        ) || [];

      return {
        success: true,
        data: {
          ...data,
          image_url: imageUrl,
          short_description: data.short_description || "",
          description: data.description || "",
          categoryIds, // Add category IDs for the form
        },
      };
    }

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching product data",
      errorCode: "UNKNOWN_ERROR",
    };
  }
}

// Create or update product
export async function saveProduct(
  data: Partial<ProductWithCategories>,
  id: string,
) {
  try {
    const { categoryIds = [], ...productData } = data;

    // Generate slug from product name
    const slug = slugify(data.name as string, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });

    // Prepare product data without categories
    const finalProductData = {
      ...productData,
      slug,
    };

    const isNewProduct = id === "new";

    // Step 1: Create or update product
    let productId = id;

    if (isNewProduct) {
      const { data: newProduct, error } = await supabaseAdmin
        .from("products")
        .insert(finalProductData)
        .select("id")
        .single();

      if (error) {
        console.error("Error creating product:", error);
        throw new Error(error.message);
      }

      productId = newProduct.id;
    } else {
      const { error } = await supabaseAdmin
        .from("products")
        .update(finalProductData)
        .eq("id", id);

      if (error) {
        console.error("Error updating product:", error);
        throw new Error(error.message);
      }
    }

    // Step 2: If it's an existing product, delete existing category relationships
    if (!isNewProduct) {
      const { error: deleteError } = await supabaseAdmin
        .from("product_categories")
        .delete()
        .eq("product_id", productId);

      if (deleteError) {
        console.error("Error deleting product categories:", deleteError);
        throw new Error(deleteError.message);
      }
    }

    // Step 3: Insert new category relationships
    if (categoryIds.length > 0) {
      const categoryRelations = categoryIds.map((categoryId: string) => ({
        product_id: productId,
        category_id: categoryId,
      }));

      const { error: insertError } = await supabaseAdmin
        .from("product_categories")
        .insert(categoryRelations);

      if (insertError) {
        console.error("Error inserting product categories:", insertError);
        throw new Error(insertError.message);
      }
    }

    // Revalidate paths
    revalidateTag("products");
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    revalidatePath("/products");
    revalidatePath(`/products/${slug}`);

    return { success: true };
  } catch (error) {
    const err = error as Error;
    console.error("Error saving product:", err);
    return { success: false, error: err.message };
  }
}

export async function fetchProducts(
  page: number = 1,
  search: string = "",
  category: string = "all",
  sortBy: string = "created_at",
  sortDir: "asc" | "desc" = "desc",
) {
  const itemsPerPage = 20;
  const cacheKey = `products-page-${page}-search-${search}-cat-${category}`;

  try {
    const getFilteredPagedProducts = unstable_cache(
      async (pageNum: number, searchTerm: string, categoryId: string) => {
        try {
          let query = supabaseAdmin
            .from("products")
            .select(
              `
              *,
              product_categories!inner(
                category_id,
                categories!inner(
                  id,
                  name,
                  slug
                )
              )
            `,
              { count: "exact" },
            );

          if (searchTerm) {
            query = query.ilike("name", `%${searchTerm.trim()}%`);
          }
          query = query.order(sortBy, { ascending: sortDir === "asc" });

          if (categoryId && categoryId !== "all") {
            query = query.eq("product_categories.category_id", categoryId);
          }

          query = query
            .order("created_at", { ascending: false })
            .range((pageNum - 1) * itemsPerPage, pageNum * itemsPerPage - 1);

          const { data: products, error, count } = await query;

          if (error) {
            console.error(
              `Error fetching products (Page: ${pageNum}, Search: "${searchTerm}", Category: "${categoryId}")`,
              error,
            );
            return {
              success: false,
              error:
                `Database error fetching products: ${error.message}. Check if category relation exists and filtering syntax is correct.`,
              errorCode: "DB_ERROR",
              products: [],
              totalCount: 0,
              totalPages: 0,
            };
          }

          return {
            success: true,
            products: (products || []) as ProductWithCategories[],
            totalCount: count || 0,
            totalPages: Math.ceil((count || 0) / itemsPerPage),
          };
        } catch (error) {
          console.error("Error in getFilteredPagedProducts:", error);
          return {
            success: false,
            error: "An unexpected error occurred while fetching products",
            errorCode: "UNKNOWN_ERROR",
            products: [],
            totalCount: 0,
            totalPages: 0,
          };
        }
      },
      [cacheKey, sortBy, sortDir],
      {
        revalidate: 60,
        tags: [
          "products",
          `products_search_${search}`,
          `products_category_${category}`,
          `products_sort_${sortBy}_${sortDir}`,
        ],
      },
    );

    const result = await getFilteredPagedProducts(page, search, category);
    return result;
  } catch (error) {
    console.error("Error in fetchProducts:", error);
    return {
      success: false,
      error: "An unexpected error occurred while fetching products",
      errorCode: "UNKNOWN_ERROR",
      products: [],
      totalCount: 0,
      totalPages: 0,
    };
  }
}

export async function deleteProduct(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  if (!id) {
    return { success: false, error: "Product ID is required." };
  }

  try {
    const { error: categoryError } = await supabaseAdmin
      .from("product_categories")
      .delete()
      .eq("product_id", id);

    if (categoryError) {
      console.error("Error deleting product categories:", categoryError);
      return {
        success: false,
        error:
          `Failed to delete associated categories: ${categoryError.message}`,
      };
    }

    // Delete the main product
    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting product:", error);
      return { success: false, error: `Database error: ${error.message}` };
    }

    revalidateTag("products");
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    const err = error as Error;
    console.error("Unexpected error deleting product:", err);
    return {
      success: false,
      error: err.message || "An unexpected error occurred.",
    };
  }
}

export async function deleteCategory(id: string) {
  try {
    // First check for child categories
    const { data: childCategories, error: childError } = await supabaseAdmin
      .from("categories")
      .select()
      .eq("parent_id", id);

    if (childError) {
      return { success: false, error: childError.message };
    }

    if (childCategories && childCategories.length > 0) {
      return {
        success: false,
        error:
          `Cannot delete category because it has ${childCategories.length} subcategories. Please move or delete the subcategories first.`,
      };
    }

    // Then check for associated products
    const { data: productCategories, error: productError } = await supabaseAdmin
      .from("product_categories")
      .select()
      .eq("category_id", id);

    if (productError) {
      return { success: false, error: productError.message };
    }

    if (productCategories && productCategories.length > 0) {
      return {
        success: false,
        error:
          `Cannot delete category because it has ${productCategories.length} products associated. Please remove the products first.`,
      };
    }

    // If no child categories or products, proceed with deletion
    const { error } = await supabaseAdmin
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/categories");
    revalidateTag("categories");
    revalidateTag("products");
    revalidatePath(`/admin/categories/${id}`);
    revalidatePath("/products");

    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
