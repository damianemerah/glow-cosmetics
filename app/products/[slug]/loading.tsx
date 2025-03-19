import {
  ProductDetailSkeleton,
  ProductDescriptionSkeleton,
  RelatedProductsSkeleton,
} from "@/components/product/product-skeleton";

export default function Loading() {
  return (
    <div className="bg-white min-h-screen p-4.5 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <ProductDetailSkeleton />
        <ProductDescriptionSkeleton />
        <RelatedProductsSkeleton />
      </div>
    </div>
  );
}
