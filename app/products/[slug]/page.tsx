import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createStaticClient } from "@/utils/supabase/static";
import { unstable_cache } from "next/cache";
import type { Product } from "@/types/dashboard";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { Suspense } from "react";

// Import components
import ProductDetails from "@/components/product/product-details";
import ProductDescription from "@/components/product/product-description";
import RelatedProducts from "@/components/product/related-products";

// Import skeleton components
import {
  ProductDetailSkeleton,
  ProductDescriptionSkeleton,
  RelatedProductsSkeleton,
} from "@/components/product/product-skeleton";

// Function to fetch product by slug - accept the client as a parameter
async function getProductBySlug(
  client: SupabaseClient,
  slug: string
): Promise<Product | null> {
  const { data, error } = await client
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    console.error("Error fetching product:", error);
    return null;
  }

  return data as Product;
}

// Function to get related products - accept the client as a parameter
async function getRelatedProducts(
  client: SupabaseClient,
  productId: string,
  category: string
): Promise<Product[]> {
  const { data, error } = await client
    .from("products")
    .select("*")
    .eq("category", category)
    .eq("is_active", true)
    .neq("id", productId)
    .limit(4);

  if (error) {
    console.error("Error fetching related products:", error);
    return [];
  }

  return data as Product[];
}

// Function to fetch all product slugs for static generation
async function getAllProductSlugs(client: SupabaseClient) {
  const { data, error } = await client
    .from("products")
    .select("slug")
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching product slugs:", error);
    return [];
  }

  return data;
}

// Cache the product data - pass client as first parameter
const getCachedProduct = unstable_cache(
  async (client: SupabaseClient, slug: string) =>
    getProductBySlug(client, slug),
  ["product-detail"],
  { revalidate: 60, tags: ["products"] }
);

// Cache the related products - pass client as first parameter
const getCachedRelatedProducts = unstable_cache(
  async (client: SupabaseClient, productId: string, category: string) =>
    getRelatedProducts(client, productId, category),
  ["related-products"],
  { revalidate: 60, tags: ["products"] }
);

// Generate static params for product detail pages
export async function generateStaticParams() {
  // Use static client for generateStaticParams to avoid cookies issue
  const supabase = createStaticClient();
  const products = await getAllProductSlugs(supabase);

  return products.map((product) => ({
    slug: product.slug,
  }));
}

// Add metadata export
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  // Create client here outside cached function
  const { slug } = await params;
  const supabase = await createClient();
  const product = await getCachedProduct(supabase, slug);

  if (!product) {
    return {
      title: "Product Not Found | Glow by UgoSylvia",
      description: "The requested product could not be found",
    };
  }

  // Create a safe description that handles undefined short_description
  const description = product.short_description
    ? product.short_description.replace(/<[^>]*>?/gm, "").substring(0, 160)
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

// Product Details Component with Suspense
async function ProductInfo({ slug }: { slug: string }) {
  const supabase = await createClient();
  const product = await getCachedProduct(supabase, slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <ProductDetails product={product} />
      <Suspense fallback={<ProductDescriptionSkeleton />}>
        <ProductDescription description={product.description} />
      </Suspense>
      <Suspense fallback={<RelatedProductsSkeleton />}>
        <RelatedProductsSection
          productId={product.id}
          category={product.category}
        />
      </Suspense>
    </>
  );
}

// Related Products Component with its own data fetching
async function RelatedProductsSection({
  productId,
  category,
}: {
  productId: string;
  category: string;
}) {
  const supabase = await createClient();
  const relatedProducts = await getCachedRelatedProducts(
    supabase,
    productId,
    category
  );

  return <RelatedProducts products={relatedProducts} />;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="bg-white min-h-screen p-4.5 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <Suspense fallback={<ProductDetailSkeleton />}>
          <ProductInfo slug={slug} />
        </Suspense>
      </div>
    </div>
  );
}
