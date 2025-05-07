import { Suspense } from "react";
import { Skeleton } from "@/constants/ui/index";
import CategoryForm from "./category-form";
import { fetchCategoryById } from "@/actions/adminActions";
import { notFound } from "next/navigation";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <CategoryDetail id={id} />
    </Suspense>
  );
}

async function CategoryDetail({ id }: { id: string }) {
  const initialData =
    id?.toLowerCase() !== "new" ? await fetchCategoryById(id) : null;
  if (id?.toLowerCase() !== "new" && (!initialData || !initialData.success)) {
    notFound();
  }

  const parentCategoriesResult = await fetchCategoryById("parent-options");
  const parentCategories =
    parentCategoriesResult.success &&
    Array.isArray(parentCategoriesResult.categories)
      ? parentCategoriesResult.categories
      : [];

  // Extract just what the form needs from Category
  const formData =
    initialData?.success && !Array.isArray(initialData.categories)
      ? {
          name: initialData.categories.name,
          parent_id: initialData.categories.parent_id,
          pinned: initialData.categories.pinned,
          images: initialData.categories.images || [],
        }
      : null;

  return (
    <CategoryForm
      id={id}
      initialData={formData}
      categoryData={parentCategories}
    />
  );
}
