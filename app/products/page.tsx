import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { unstable_cache } from "next/cache";
import type { Metadata } from "next";
import type { Product } from "@/types/dashboard";
import type { SupabaseClient } from "@supabase/supabase-js";

// Import components
import ProductHero from "@/components/product/product-hero";
import ProductsGrid from "@/components/product/products-grid";
import LoyaltyProgram from "@/components/product/loyalty-program";
import ProductCTA from "@/components/product/product-cta";

// Import skeletons
import { Skeleton } from "@/components/ui/skeleton";
import ProductTabsSkeleton from "@/components/product/product-tabs-skeleton";

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

// Function to fetch all products without using createClient inside the cached function
async function getAllProducts(client: SupabaseClient) {
  const { data, error } = await client
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data as Product[];
}

// Cache the products data, passing the client as an argument
const getCachedProducts = unstable_cache(
  async (client: SupabaseClient) => getAllProducts(client),
  ["products-list"],
  { revalidate: 60, tags: ["products"] }
);

// ProductsGridSection Component with its own data fetching
async function ProductsGridSection() {
  // Create client here for data fetching
  const supabase = await createClient();
  const products = await getCachedProducts(supabase);

  return <ProductsGrid products={products} />;
}

// Simple skeletons for lower-priority sections
function LoyaltyProgramSkeleton() {
  return (
    <section className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <Skeleton className="h-64 w-full max-w-4xl mx-auto rounded-lg" />
      </div>
    </section>
  );
}

function ProductCTASkeleton() {
  return (
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
  );
}

export default async function ProductsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Top priority, no Suspense */}
      <ProductHero />

      {/* Products Grid - High priority with Suspense */}
      <Suspense
        fallback={
          <section className="py-24 bg-white">
            <div className="container mx-auto px-4 relative">
              <ProductTabsSkeleton />
            </div>
          </section>
        }
      >
        <ProductsGridSection />
      </Suspense>

      {/* Loyalty Program - Lower priority with Suspense */}
      <Suspense fallback={<LoyaltyProgramSkeleton />}>
        <LoyaltyProgram />
      </Suspense>

      {/* CTA Section - Lowest priority with Suspense */}
      <Suspense fallback={<ProductCTASkeleton />}>
        <ProductCTA />
      </Suspense>
    </div>
  );
}
