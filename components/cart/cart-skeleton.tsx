import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors the cart list + order summary in components/cart/cart-client.tsx. */
export default function CartSkeleton() {
  return (
    <div className="grid items-start gap-8 lg:grid-cols-3 lg:gap-12">
      <div className="lg:col-span-2">
        <div className="mb-2 hidden grid-cols-[1fr_auto_7rem] gap-6 border-b pb-3 md:grid">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mx-auto h-3 w-16" />
          <Skeleton className="ml-auto h-3 w-12" />
        </div>
        <ul className="divide-y">
          {Array.from({ length: 3 }).map((_, index) => (
            <li
              key={index}
              className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 py-6 md:grid-cols-[1fr_auto_7rem] md:items-center md:gap-6"
            >
              <div className="flex min-w-0 items-center gap-4 max-md:contents">
                <Skeleton className="h-24 w-20 shrink-0 rounded-lg md:h-28 md:w-24" />
                <div className="min-w-0 space-y-2">
                  <Skeleton className="h-4 w-48 max-w-full" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="col-start-2 flex items-center justify-between gap-4 md:col-start-auto md:contents">
                <Skeleton className="h-9 w-28 rounded-full" />
                <Skeleton className="h-5 w-20 md:ml-auto" />
              </div>
            </li>
          ))}
        </ul>
        <Skeleton className="mt-4 h-4 w-36" />
      </div>

      <aside className="rounded-xl border bg-card p-6 shadow-soft">
        <Skeleton className="h-7 w-40" />
        <div className="mt-6 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="mt-6 flex items-baseline justify-between border-t pt-6">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-28" />
        </div>
        <div className="mt-6 space-y-3">
          <Skeleton className="h-12 w-full rounded-full" />
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </aside>
    </div>
  );
}
