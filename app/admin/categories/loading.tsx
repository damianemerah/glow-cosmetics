import { Skeleton } from "@/constants/ui/index";
import PageHeader from "@/components/admin/page-header";

export default function CategoriesLoading() {
  return (
    <div>
      <PageHeader
        title="Categories"
        description="Manage your product categories"
      />

      <div className="flex justify-end mb-6">
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
