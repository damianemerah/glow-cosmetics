import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section Skeleton */}
      <section className="relative h-[400px] bg-secondary">
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          <div className="max-w-2xl">
            <Skeleton className="h-12 w-2/3 mb-4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4 mt-2" />
          </div>
        </div>
      </section>

      {/* Products Section Skeleton */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 relative">
          {/* Tabs Skeleton */}
          <div className="mb-8">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-10 w-24 rounded-md flex-shrink-0"
                />
              ))}
            </div>
          </div>

          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 lg:gap-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden shadow-lg flex flex-row sm:block h-full"
              >
                <Skeleton className="w-[45%] sm:w-full aspect-square" />
                <div className="flex-1 p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-5 w-16 mb-4" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loyalty Program Section Skeleton */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 p-8">
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="space-y-2 mb-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-start">
                      <Skeleton className="w-5 h-5 mr-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="md:w-1/2 bg-green-500 p-8">
                <Skeleton className="h-6 w-1/2 mb-4 bg-white/30" />
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex">
                      <Skeleton className="w-8 h-8 rounded-full bg-white/50 mr-3" />
                      <div>
                        <Skeleton className="h-5 w-24 mb-1 bg-white/30" />
                        <Skeleton className="h-4 w-full bg-white/20" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section Skeleton */}
      <section className="py-16 bg-[#5a6b47]">
        <div className="container mx-auto px-4 text-center">
          <Skeleton className="h-8 w-1/2 mx-auto mb-6 bg-white/20" />
          <Skeleton className="h-6 w-3/4 mx-auto mb-8 bg-white/20" />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Skeleton className="h-12 w-32 rounded-md bg-white/30" />
            <Skeleton className="h-12 w-32 rounded-md bg-white/30" />
          </div>
        </div>
      </section>
    </div>
  );
}
