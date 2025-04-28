import { Suspense } from "react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { unstable_cache } from "next/cache";
import type { Metadata } from "next";
import type { ProductWithCategories } from "@/types/index";

// Import components
import ProductHero from "@/components/product/product-hero";
import ProductsGrid from "@/components/product/products-grid";
import LoyaltyProgram from "@/components/product/loyalty-program";
import ProductCTA from "@/components/product/product-cta";

import {
  ProductGridSkeletonWrapper,
  LoyaltyProgramSkeleton,
  ProductCTASkeleton,
} from "@/components/product/product-skeleton";

import { fetchCategories } from "@/actions/adminActions";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Shop Beauty Products | Glow by UgoSylvia",
    description:
      "Discover our curated collection of premium beauty and wellness products.",
    openGraph: {
      title: "Shop Beauty Products | Glow by UgoSylvia",
      description:
        "Discover our curated collection of premium beauty and wellness products.",
      type: "website",
    },
  };
}

async function getAllProducts() {
  const {
    data: products,
    error,
    count,
  } = await supabaseAdmin
    .from("products")
    .select(
      `*,
       product_categories (
        categories ( id, name, slug )
      )`,
      { count: "exact" }
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return { products: [], count: 0 };
  }

  return { products: products as ProductWithCategories[], count: count ?? 0 };
}

// Cache the products data
const getCachedProducts = unstable_cache(
  async () => getAllProducts(),
  ["products"],
  { revalidate: 300, tags: ["products"] }
);

// Cache the categories data (using the assumed action)
const getCachedCategories = unstable_cache(
  async () => fetchCategories(),
  ["categories"],
  { revalidate: 3600, tags: ["categories", "products"] } // Revalidate less often, tag appropriately
);

async function ProductsGridSection() {
  const [{ products, count: productsCountFromQuery }, { categories }] =
    await Promise.all([getCachedProducts(), getCachedCategories()]);

  const displayCount = productsCountFromQuery;

  return (
    <ProductsGrid
      products={products}
      categories={categories}
      productCount={displayCount}
    />
  );
}

// MAIN PAGE COMPONENT
export default async function ProductsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Ensure consistent background */}
      <ProductHero />
      <Suspense fallback={<ProductGridSkeletonWrapper />}>
        <ProductsGridSection />
      </Suspense>
      {/* Other sections with Suspense */}
      <Suspense fallback={<LoyaltyProgramSkeleton />}>
        <LoyaltyProgram />
      </Suspense>
      <Suspense fallback={<ProductCTASkeleton />}>
        <ProductCTA />
      </Suspense>
    </div>
  );
}
