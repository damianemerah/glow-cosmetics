import { Skeleton } from "@/constants/ui/index";

export default function CategoryLoadingPage() {
  return (
    <div className="min-h-screen bg-gray-50 sm:py-6">
      <div className="max-w-3xl mx-auto">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-8 w-40" />
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-md" />
            ))}
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
