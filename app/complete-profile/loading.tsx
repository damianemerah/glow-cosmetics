import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <section className="bg-background px-4 py-14 md:py-20">
      <div className="mx-auto w-full max-w-xl">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-11 w-72 max-w-full" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="mt-10 space-y-6 rounded-2xl border bg-card p-6 shadow-soft md:p-8">
          {/* Name fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Phone field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Date field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Submit button */}
          <Skeleton className="h-11 w-full rounded-full" />
        </div>
      </div>
    </section>
  );
}
