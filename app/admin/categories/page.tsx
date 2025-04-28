import { Suspense } from "react";
import Link from "next/link";
import DataTable from "@/components/admin/data-table";
import PageHeader from "@/components/admin/page-header";
import { fetchCategories } from "@/actions/adminActions";
import type { Category } from "@/types/index";
import { Badge, Button, Skeleton } from "@/constants/ui/index";

async function CategoriesTable() {
  const { categories, productsCount } = await fetchCategories();

  // Category columns definition
  const categoryColumns = [
    { key: "name", title: "Name" },
    {
      key: "slug",
      title: "Slug",
      render: (row: Category) => row.name.toLowerCase().replace(/\s+/g, "-"),
    },
    {
      key: "productCount",
      title: "Products",
      render: (row: Category) => (
        <Badge variant="outline" className="font-normal">
          {productsCount[row.id] || 0}
        </Badge>
      ),
    },
    {
      key: "parent",
      title: "Parent Category",
      render: (row: Category) => {
        if (!row.parent_id) return "None";
        const parent = categories.find((c) => c.id === row.parent_id);
        return parent ? parent.name : "Unknown";
      },
    },
    {
      key: "actions",
      title: "Actions",
      render: (row: Category) => (
        <div className="flex gap-2">
          <Link href={`/admin/categories/${row.id}`}>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div>
      <DataTable
        columns={categoryColumns}
        data={categories}
        emptyState={
          <div className="text-center py-8">
            <p className="text-muted-foreground">No categories found</p>
            <Link href="/admin/categories/new" className="mt-4 inline-block">
              <Button>Add Your First Category</Button>
            </Link>
          </div>
        }
      />
    </div>
  );
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
        <CategoriesTable />
      </Suspense>
    </div>
  );
}
