import { createClient } from "@/utils/supabase/client";
import type { Category } from "@/types";

const supabase = createClient();

export const fetchProductCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching product categories:", error);
    throw new Error(error.message || "Failed to fetch product categories");
  }
  return data || [];
};
