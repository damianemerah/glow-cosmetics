import { Skeleton } from "@/components/ui/skeleton";

export default function CartPaneSkeleton() {
  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex-grow overflow-y-auto pr-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-4 border-b"
          >
            <div className="flex items-center space-x-4">
              <Skeleton className="w-16 h-16 rounded-md" />
              <div className="flex-grow space-y-2">
                <Skeleton className="h-5 w-32" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            </div>
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        ))}
      </div>

      <div className="pt-4 mt-auto border-t">
        <div className="flex justify-between py-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-4 w-full mb-4" />
        <Skeleton className="h-10 w-full rounded-md mb-2" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}
