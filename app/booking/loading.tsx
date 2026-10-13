import { Skeleton } from "@/components/ui/skeleton";

function StepSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft md:p-8">
      <div className="mb-6 flex gap-4">
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
      </div>
      {children}
    </div>
  );
}

export default function BookingLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <section className="flex min-h-[320px] items-end bg-primary md:min-h-[420px]">
        <div className="container mx-auto space-y-4 pb-12 md:pb-16">
          <Skeleton className="h-3 w-32 bg-primary-foreground/20" />
          <Skeleton className="h-12 w-80 max-w-full bg-primary-foreground/20" />
          <Skeleton className="h-5 w-96 max-w-full bg-primary-foreground/15" />
        </div>
      </section>

      <section className="bg-background py-12 md:py-20">
        <div className="container mx-auto grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
          <div className="flex flex-col gap-8">
            <StepSkeleton>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex gap-4 rounded-xl border p-3">
                    <Skeleton className="h-20 w-20 shrink-0 rounded-lg" />
                    <div className="flex-1 space-y-2 py-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </StepSkeleton>
            <StepSkeleton>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto_minmax(0,1fr)]">
                <Skeleton className="h-[320px] w-[300px] max-w-full rounded-xl" />
                <div className="grid grid-cols-3 gap-2 self-start">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 rounded-full" />
                  ))}
                </div>
              </div>
            </StepSkeleton>
          </div>

          <div className="overflow-hidden rounded-xl border bg-card shadow-soft">
            <div className="space-y-2 bg-primary px-6 py-5">
              <Skeleton className="h-3 w-20 bg-primary-foreground/20" />
              <Skeleton className="h-7 w-40 bg-primary-foreground/20" />
            </div>
            <div className="space-y-4 p-6">
              <Skeleton className="mx-auto h-12 w-12 rounded-full" />
              <Skeleton className="mx-auto h-4 w-40" />
              <Skeleton className="h-px w-full" />
              <Skeleton className="h-12 w-full rounded-full" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
