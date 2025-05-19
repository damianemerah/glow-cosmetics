import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { unstable_cache } from "next/cache";
import type { ProductWithCategories } from "@/types/index";
import type { Metadata } from "next";
import { Suspense } from "react";
import { htmlToText } from "html-to-text";

import ProductDetails from "@/components/product/product-details";
import ProductDescriptionAndDetails from "@/components/product/product-description";
import RelatedProducts from "@/components/product/related-products";
import RecentlyViewedProducts from "@/components/product/recently-viewed-products";

import {
  ProductDescriptionSkeleton,
  RelatedProductsSkeleton,
  RecentlyViewedProductsSkeleton,
} from "@/components/product/product-skeleton";

import { transformToAdditionalDetails } from "@/utils";
import { Breadcrumbs, BreadcrumSkeleton } from "@/components/Breadcrumbs";

// Use Next.js ISR: revalidate this page every 60 seconds
export const revalidate = 60;

const getCachedProduct = unstable_cache(getProductBySlug, ["product-detail"]);

async function getProductBySlug(
  slug: string
): Promise<ProductWithCategories | null> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*, product_categories(*, categories(*))")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    console.error("Error fetching product:", error);
    return null;
  }
  return data as ProductWithCategories;
}

// Generate static params for product detail pages
export async function generateStaticParams() {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("slug")
    .eq("is_active", true);
  if (error) {
    console.error("Error fetching product slugs:", error);
    return [];
  }

  return data.map((product) => ({
    slug: product.slug,
  }));
}

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCachedProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found | Glow by UgoSylvia",
      description: "The requested product or its variations could not be found",
    };
  }

  const description = product.short_description
    ? htmlToText(product.short_description).substring(0, 160)
    : `${product.name} - Glow by UgoSylvia beauty product`;

  return {
    title: `${product.name} | Glow by UgoSylvia`,
    description,
    openGraph: {
      images:
        product.image_url && product.image_url.length > 0
          ? [product.image_url[0]]
          : [],
    },
  };
}

// Main page component
export default async function ProductInfo({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getCachedProduct(slug);

  if (!product) {
    notFound();
  }
  const safeAdditionalDetails = transformToAdditionalDetails(
    product.additional_details
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<BreadcrumSkeleton />}>
        <Breadcrumbs
          categoryId={product.product_categories[0]?.category_id}
          productName={product.name}
        />
      </Suspense>
      <ProductDetails product={product} />

      <Suspense fallback={<ProductDescriptionSkeleton />}>
        <ProductDescriptionAndDetails
          description={product.description}
          additionalDetails={safeAdditionalDetails}
        />
      </Suspense>

      <Suspense fallback={<RelatedProductsSkeleton />}>
        <RelatedProducts
          productId={product.product_categories[0].category_id}
        />
      </Suspense>

      <Suspense fallback={<RecentlyViewedProductsSkeleton />}>
        <RecentlyViewedProducts currentProduct={product} />
      </Suspense>
    </div>
  );
}
