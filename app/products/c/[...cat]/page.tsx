import React, { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ProductWithCategories } from "@/types/index";
import type { SupabaseClient } from "@supabase/supabase-js";

import ProductHero from "@/components/product/product-hero";
import ProductsGrid from "@/components/product/products-grid";
import LoyaltyProgram from "@/components/product/loyalty-program";
import ProductCTA from "@/components/product/product-cta";

import {
  ProductGridSkeletonWrapper,
  LoyaltyProgramSkeleton,
  ProductCTASkeleton,
} from "@/components/product/product-skeleton";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/constants/ui/index";
import { Slash } from "lucide-react";

import { fetchCategories } from "@/actions/adminActions";

const getCachedCategories = unstable_cache(
  async () => fetchCategories(),
  ["categories"],
  { revalidate: 3600, tags: ["categories", "products"] }
);

async function getProductsByCategory(
  client: SupabaseClient,
  categorySlug: string
) {
  const { data: category, error: categoryError } = await client
    .from("categories")
    .select("id, name")
    .eq("slug", categorySlug)
    .single();

  if (categoryError || !category) {
    console.warn(
      `Category not found for slug "${categorySlug}":`,
      categoryError
    );
    notFound();
  }
  const {
    data: products,
    error: productsError,
    count,
  } = await client
    .from("products")
    .select(
      `*,
       product_categories!inner (
        category_id
      )`,
      { count: "exact" }
    )
    .eq("product_categories.category_id", category.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (productsError) {
    console.error(
      `Error fetching products for category ${category.id} (${categorySlug}):`,
      productsError
    );
    return { products: [], count: 0, categoryName: category.name };
  }

  const productIds = products.map((p) => p.id);
  if (productIds.length === 0) {
    return { products: [], count: 0, categoryName: category.name };
  }

  const { data: productsWithFullCategories, error: detailsError } = await client
    .from("products")
    .select(
      `
          *,
          product_categories (
              categories ( id, name, slug )
          )
      `
    )
    .in("id", productIds)
    .eq("is_active", true);

  if (detailsError) {
    console.error(
      `Error fetching full category details for products in category ${category.id} (${categorySlug}):`,
      detailsError
    );
    return {
      products: products as ProductWithCategories[],
      count: count ?? 0,
      categoryName: category.name,
    };
  }

  return {
    products: productsWithFullCategories as ProductWithCategories[],
    count: count ?? 0,
    categoryName: category.name,
  };
}

// Cache the category-specific products data
const getCachedProductsByCategory = unstable_cache(
  async (client: SupabaseClient, categorySlug: string) =>
    getProductsByCategory(client, categorySlug),
  ["products_by_category"], // Base key
  { revalidate: 300, tags: ["products"] }
);

interface CategoryPageProps {
  params: Promise<{ cat: string[] }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const supabase = await createClient();
  const { cat } = await params;

  const categorySlug = cat[cat.length - 1];

  const { data: category } = await supabase
    .from("categories")
    .select("name")
    .eq("slug", categorySlug)
    .single();

  if (!category) {
    return {
      title: "Category Not Found | Glow by UgoSylvia",
      description: "Sorry, we couldn't find the category you're looking for.",
    };
  }

  const title = `${category.name} | Glow by UgoSylvia`;
  const description = `Shop our collection of ${category.name.toLowerCase()} beauty and wellness products.`;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      type: "website",
      // Add image URL if available/desired
      // images: [ { url: '...' } ],
    },
  };
}

async function CategoryProductsGridSection({
  categorySlug,
  cat,
}: {
  categorySlug: string;
  cat: string[];
}) {
  const supabase = await createClient();

  const [{ products, count: productsCount }, { categories }] =
    await Promise.all([
      getCachedProductsByCategory(supabase, categorySlug),
      getCachedCategories(),
    ]);

  return (
    <>
      <div className="container mx-auto px-4 pt-4">
        <Breadcrumbs cat={cat} />
      </div>
      <ProductsGrid
        products={products}
        categories={categories}
        productCount={productsCount}
      />
    </>
  );
}

function Breadcrumbs({ cat }: { cat: string[] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/products">All Products</BreadcrumbLink>
        </BreadcrumbItem>

        {cat.map((category, index) => (
          <React.Fragment key={category + index}>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/products/c/${cat.slice(0, index + 1).join("/")}`}
              >
                {decodeURIComponent(category)}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { cat } = await params;
  const categorySlug = cat[cat.length - 1];

  console.log(cat, "💎💎");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ProductHero />
      <Suspense fallback={<ProductGridSkeletonWrapper />}>
        <CategoryProductsGridSection categorySlug={categorySlug} cat={cat} />
      </Suspense>
      <Suspense fallback={<LoyaltyProgramSkeleton />}>
        <LoyaltyProgram />
      </Suspense>
      <Suspense fallback={<ProductCTASkeleton />}>
        <ProductCTA />
      </Suspense>
    </div>
  );
}
