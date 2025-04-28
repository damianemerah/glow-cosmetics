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
    id?.toLowerCase() !== "new" && (await fetchCategoryById(id));
  if (id?.toLowerCase() !== "new" && !initialData) {
    notFound();
  }
  const categoryData = await fetchCategoryById("parent-options");
  return (
    <CategoryForm
      id={id}
      initialData={null}
      categoryData={categoryData.categories}
    />
  );
}
