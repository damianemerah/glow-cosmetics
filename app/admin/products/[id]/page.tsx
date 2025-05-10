import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { fetchCategoryById, fetchProductById } from "@/actions/adminActions";
import ProductForm from "./product-form";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ProductDetail id={id} />
    </Suspense>
  );
}

async function ProductDetail({ id }: { id: string }) {
  const productResult =
    id?.toLowerCase() !== "new"
      ? await fetchProductById(id)
      : { success: true, data: null };
  const result = await fetchCategoryById("parent-options");
  const categories =
    result.success && result.categories
      ? Array.isArray(result.categories)
        ? result.categories
        : []
      : [];

  if (!productResult.success) {
    console.error("Failed to fetch product:", productResult.error);
    // Provide some fallback to avoid breaking the UI
  }

  return (
    <ProductForm
      id={id}
      initialData={productResult.data}
      categoryData={categories}
    />
  );
}
