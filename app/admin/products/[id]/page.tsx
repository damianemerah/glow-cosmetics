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
  const product = id?.toLowerCase() !== "new" && (await fetchProductById(id));
  const result = await fetchCategoryById("parent-options");

  return (
    <ProductForm
      id={id}
      initialData={product}
      categoryData={result.categories || []}
    />
  );
}
