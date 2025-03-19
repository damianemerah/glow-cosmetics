"use server";

import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";
import { unstable_cache } from "next/cache";
import { SupabaseClient } from "@supabase/supabase-js";
import type { Product } from "@/types/dashboard";
import slugify from "slugify";

// Image upload function
export const uploadImageToSupabase = async (
  formData: FormData
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
        "Invalid file type. Only JPG, JPEG, and WEBP are allowed."
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

// Fetch product by ID
export async function fetchProductById(id: string) {
  try {
    if (id === "new") return null;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    // Ensure image_url is an array
    if (data) {
      const imageUrl = data.image_url
        ? Array.isArray(data.image_url)
          ? data.image_url
          : data.image_url
          ? [data.image_url]
          : []
        : [];

      return {
        ...data,
        image_url: imageUrl,
        short_description: data.short_description || "",
        description: data.description || "",
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
}

// Create or update product
export async function saveProduct(data: Partial<Product>, id: string) {
  try {
    const supabase = await createClient();

    // Generate slug from product name
    const slug = slugify(data.name as string, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });

    // Add slug to data
    const productData = {
      ...data,
      slug,
    };

    const { error } =
      id === "new"
        ? await supabase.from("products").insert(productData)
        : await supabase.from("products").update(productData).eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    // Revalidate product data
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    revalidatePath("/products");

    // Also revalidate the product detail page
    revalidatePath(`/products/${slug}`);

    return { success: true };
  } catch (error) {
    const err = error as Error;
    console.error("Error saving product:", err);
    return { success: false, error: err.message };
  }
}

export async function fetchProducts(page: number = 1) {
  const supabase = await createClient();
  const itemsPerPage = 1;

  const getPagedProducts = unstable_cache(
    async (client: SupabaseClient, pageNum: number) => {
      const {
        data: products,
        error,
        count,
      } = await client
        .from("products")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((pageNum - 1) * itemsPerPage, pageNum * itemsPerPage - 1);

      console.log("products", products);

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
    }
  );

  return getPagedProducts(supabase, page);
}

// Delete product by ID
export async function deleteProduct(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);

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
