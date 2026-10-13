import {
  ProductDetailSkeleton,
  ProductDescriptionSkeleton,
  RelatedProductsSkeleton,
} from "@/components/product/product-skeleton";
import { BreadcrumSkeleton } from "@/components/Breadcrumbs";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumSkeleton />
      <ProductDetailSkeleton />
      <ProductDescriptionSkeleton />
      <RelatedProductsSkeleton />
    </div>
  );
}
