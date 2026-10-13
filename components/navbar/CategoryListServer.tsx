import { getCachedProductCategories } from "@/lib/categories";
import { filterVisibleCategories } from "@/lib/visible-categories";

export async function CategoryListServer() {
  const categories = await getCachedProductCategories();

  // Serialize the data to pass to client components
  return {
    categories: filterVisibleCategories(categories || []),
  };
}
