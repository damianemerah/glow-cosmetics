import { Skeleton } from "@/components/ui/skeleton";

export default function CartSkeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* Cart Items Section */}
      <div className="md:col-span-2">
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-secondary p-4 border-b">
            <h2 className="font-semibold">Cart Items</h2>
          </div>

          <div className="divide-y">
            <div className="hidden md:grid md:grid-cols-5 text-sm text-gray-500 p-4">
              <div className="col-span-2">Product</div>
              <div className="text-center">Price</div>
              <div className="text-center">Quantity</div>
              <div className="text-right">Total</div>
            </div>

            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="p-4 md:grid md:grid-cols-5 items-center"
              >
                <div className="col-span-2 flex items-center mb-4 md:mb-0">
                  <Skeleton className="h-20 w-20 rounded-md mr-4 flex-shrink-0" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>

                <div className="md:text-center text-sm mb-3 md:mb-0">
                  <span className="md:hidden inline-block w-24 font-medium">
                    Price:{" "}
                  </span>
                  <Skeleton className="h-4 w-16 md:mx-auto" />
                </div>

                <div className="flex items-center md:justify-center mb-3 md:mb-0">
                  <Skeleton className="h-8 w-24 rounded-md" />
                </div>

                <div className="md:text-right font-medium">
                  <span className="md:hidden inline-block w-24 font-medium">
                    Total:{" "}
                  </span>
                  <Skeleton className="h-4 w-16 md:ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Summary Section */}
      <div className="md:col-span-1">
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-secondary p-4 border-b">
            <h2 className="font-semibold">Order Summary</h2>
          </div>
          <div className="p-4">
            <div className="flex justify-between py-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between py-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between py-2 font-semibold">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <Skeleton className="h-11 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
