"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";
import { unstable_cache } from "next/cache";
import type { Category, ProductWithCategories } from "@/types/index";
import slugify from "slugify";
import { sendMessageWithFallback } from "@/lib/messaging";

// Image upload function
export const uploadImageToSupabase = async (
  formData: FormData,
): Promise<string | null> => {
  try {
    const file = formData.get("file") as File;
    const bucket = formData.get("bucket") as string;

    if (!file || !bucket) {
      throw new Error("File or bucket name is missing.");
    }

    const allowedExtensions = ["jpg", "jpeg", "webp"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      throw new Error(
        "Invalid file type. Only JPG, JPEG, and WEBP are allowed.",
      );
    }

    const uniqueFilename = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(uniqueFilename, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
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
export async function fetchCategoryById(id: string) {
  try {
    // Special case for 'parent-options' - return all categories for dropdown
    if (id === "parent-options") {
      const { data: categories, error } = await supabaseAdmin
        .from("categories")
        .select("*")
        .order("name");

      if (error) {
        console.log(`Failed to fetch categories: ${error.message}`);
        return { success: false, categories: [] };
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
        },
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
    if (id === "new") return null;

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
      throw new Error(`Failed to fetch product: ${error.message}`);
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
        ...data,
        image_url: imageUrl,
        short_description: data.short_description || "",
        description: data.description || "",
        categoryIds, // Add category IDs for the form
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
}

// Create or update product
export async function saveProduct(
  data: Partial<ProductWithCategories>,
  id: string,
) {
  console.log(data);
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

export async function fetchProducts(page: number = 1) {
  const itemsPerPage = 20;

  const getPagedProducts = unstable_cache(
    async (pageNum: number) => {
      const {
        data: products,
        error,
        count,
      } = await supabaseAdmin
        .from("products")
        .select(
          `
          *,
          product_categories (
            category_id,
            categories:category_id (id, name)
          )
        `,
          { count: "exact" },
        )
        .order("created_at", { ascending: false })
        .range((pageNum - 1) * itemsPerPage, pageNum * itemsPerPage - 1);

      if (error) {
        console.error("Error fetching products:", error);
        throw new Error(error.message);
      }

      return {
        products: products || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / itemsPerPage),
      };
    },
    [`products-page-${page}`],
    {
      revalidate: 60,
      tags: ["products"],
    },
  );

  return getPagedProducts(page);
}

// Delete product by ID
export async function deleteProduct(id: string) {
  try {
    const { error } = await supabaseAdmin.from("products").delete().eq(
      "id",
      id,
    );

    if (error) {
      throw new Error(error.message);
    }

    // Revalidate products list
    revalidatePath("/admin/products");

    return { success: true };
  } catch (error) {
    const err = error as Error;
    console.error("Error deleting product:", err);
    return { success: false, error: err.message };
  }
}

export async function sendAdminEmail(
  email: string,
  subject: string,
  message: string,
) {
  try {
    const { error: err } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("role", "admin")
      .single();

    if (err) {
      console.error("Error fetching admin email:", err);
      throw new Error("Failed to fetch admin email");
    }

    const { error } = await sendMessageWithFallback({
      userId: email,
      subject,
      message,
      channel: "email",
      variables: {},
    });

    if (error) {
      console.error("Error sending admin email:", error);
      throw new Error("Failed to send email");
    }

    return { success: true };
  } catch (error) {
    const err = error as Error;
    console.error("Error sending email:", err);
    return { success: false, error: err.message };
  }
}
