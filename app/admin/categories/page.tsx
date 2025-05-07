import { Suspense } from "react";
import Link from "next/link";
import PageHeader from "@/components/admin/page-header";
import { fetchCategories } from "@/actions/adminActions";
import { Button, Skeleton } from "@/constants/ui/index";
import CategoryList from "@/components/admin/category-list";

async function CategoriesContent() {
  const { categories, productsCount } = await fetchCategories();
  return <CategoryList categories={categories} productsCount={productsCount} />;
}

function CategoriesTableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <div>
      <PageHeader
        title="Categories"
        description="Manage your product categories"
      />

      <div className="flex justify-end mb-6">
        <Link href="/admin/categories/new">
          <Button className="bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-transform">
            Add Category
          </Button>
        </Link>
      </div>

      <Suspense fallback={<CategoriesTableSkeleton />}>
        <CategoriesContent />
      </Suspense>
    </div>
  );
}
