import { Skeleton } from "@/components/ui/skeleton";

function Field({ label = "w-20" }: { label?: string }) {
  return (
    <div className="space-y-1.5">
      <Skeleton className={`h-4 ${label}`} />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

function StepCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-soft md:p-7">
      <div className="mb-5 flex items-center gap-3">
        <Skeleton className="h-7 w-7 rounded-full" />
        <Skeleton className="h-7 w-48" />
      </div>
      {children}
    </div>
  );
}

/**
 * Mirrors components/checkout/checkout-form.tsx: numbered step cards on the
 * left, delivery options and order summary on the right.
 */
export default function CheckoutSkeleton() {
  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3 lg:gap-12">
      <div className="space-y-6 lg:col-span-2">
        <StepCard>
          <div className="space-y-4">
            <Field />
            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="h-4 w-4 rounded-sm" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </StepCard>

        <StepCard>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field />
              <Field />
            </div>
            <Field label="w-24" />
            <Field label="w-40" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="w-12" />
              <Field label="w-16" />
              <Field label="w-20" />
            </div>
            <Field label="w-16" />
          </div>
        </StepCard>

        <StepCard>
          <Skeleton className="mb-3 h-4 w-64 max-w-full" />
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </StepCard>

        <div className="pt-2">
          <Skeleton className="h-12 w-full rounded-full" />
          <Skeleton className="mx-auto mt-4 h-3 w-64 max-w-full" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4 rounded-xl border bg-card p-5 shadow-soft md:p-6">
          <Skeleton className="h-6 w-40" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-14" />
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-secondary/50 p-5 md:p-6">
          <Skeleton className="mb-4 h-6 w-36" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center border-b py-2 last:border-b-0">
              <Skeleton className="mr-4 h-16 w-16 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-4 w-14" />
            </div>
          ))}
          <div className="mt-4 space-y-3 border-t pt-4">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex justify-between border-t pt-3">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
