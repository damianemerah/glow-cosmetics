import React, { Suspense } from "react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ProductWithCategories } from "@/types/index";

import ProductHero from "@/components/product/product-hero";
import ProductsGrid from "@/components/product/products-grid";
import ProductCTA from "@/components/product/product-cta";

import {
  ProductGridSkeletonWrapper,
  ProductCTASkeleton,
} from "@/components/product/product-skeleton";
import { Breadcrumbs, BreadcrumSkeleton } from "@/components/Breadcrumbs";

import { getCachedCategories } from "@/actions/productActions";
import ProductNavigation from "@/components/product/product-navigation";

async function getProductsByCategory(categorySlug: string) {
  const { data: category, error: categoryError } = await supabaseAdmin
    .from("categories")
    .select("id, name, slug")
    .eq("slug", categorySlug)
    .single();

  if (categoryError || !category) {
    console.warn(
      `Category not found for slug "${categorySlug}":`,
      categoryError
    );
    notFound();
  }

  const { data: categoryHierarchy, error: hierarchyError } = await supabaseAdmin
    .rpc("get_child_categories", { parent_slug: categorySlug })
    .select("id, name, slug");

  if (hierarchyError || !categoryHierarchy?.length) {
    console.warn(
      `Category hierarchy not found for slug "${categorySlug}":`,
      hierarchyError
    );
    notFound();
  }

  const categoryIds = categoryHierarchy.map((c) => c.id);

  const {
    data: products,
    error: productsError,
    count,
  } = await supabaseAdmin
    .from("products")
    .select(
      `*,
       product_categories!inner (
        category_id
       )`,
      { count: "exact" }
    )
    .in("product_categories.category_id", categoryIds)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (productsError) {
    return { products: [], count: 0, categoryName: category.name };
  }

  const productIds = products.map((p) => p.id);
  if (productIds.length === 0) {
    return { products: [], count: 0, categoryName: category.name };
  }

  const { data: productsWithFullCategories, error: detailsError } =
    await supabaseAdmin
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
    categoryId: category.id,
  };
}
const getCachedProductsByCategory = unstable_cache(
  async (categorySlug: string) => getProductsByCategory(categorySlug),
  ["products_by_category", "category_tree"],
  { revalidate: 3600, tags: ["products", "categories"] }
);

interface CategoryPageProps {
  params: Promise<{ cat: string[] }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { cat } = await params;
  const categorySlug = cat[cat.length - 1];

  const { data: categoryHierarchy } = await supabaseAdmin
    .rpc("get_child_categories", { parent_slug: categorySlug })
    .select("name, slug");

  if (!categoryHierarchy?.length) {
    return {
      title: "Category Not Found | Glow by UgoSylvia",
      description: "Sorry, we couldn't find the category you're looking for.",
    };
  }

  // Use the root category name for metadata
  const rootCategory = categoryHierarchy.find((c) => c.slug === categorySlug);
  const title = `${rootCategory?.name} | Shop Glow by UgoSylvia`;
  const description = `Explore our complete range of ${rootCategory?.name.toLowerCase()} products including all sub-categories. Find the best deals and latest arrivals.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { cat } = await params;
  const categorySlug = cat[cat.length - 1];

  const [{ categories }, { products, count: productsCount, categoryId }] =
    await Promise.all([
      getCachedCategories(),
      getCachedProductsByCategory(categorySlug),
    ]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ProductHero />

      <ProductNavigation categoryData={categories} />

      <div className="container mx-auto px-4">
        <div className="mt-4">
          <Suspense fallback={<BreadcrumSkeleton />}>
            <Breadcrumbs categoryId={categoryId} />
          </Suspense>
        </div>

        <Suspense fallback={<ProductGridSkeletonWrapper />}>
          <ProductsGrid products={products} productCount={productsCount} />
        </Suspense>
      </div>

      <Suspense fallback={<ProductCTASkeleton />}>
        <ProductCTA />
      </Suspense>
    </div>
  );
}
