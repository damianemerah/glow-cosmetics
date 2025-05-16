import React, { Suspense } from "react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ProductWithCategories } from "@/types/index";

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
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/constants/ui/index";
import { Slash } from "lucide-react";

import { getCachedCategories } from "@/actions/productActions";
import ProductNavigation from "@/components/product/product-navigation";

async function getProductsByCategory(categorySlug: string) {
  const { data: category, error: categoryError } = await supabaseAdmin
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
  } = await supabaseAdmin
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
    categoryName: category.name,
  };
}
const getCachedProductsByCategory = unstable_cache(
  async (categorySlug: string) => getProductsByCategory(categorySlug),
  ["products_by_category"],
  { revalidate: 300, tags: ["products"] }
);

interface CategoryPageProps {
  params: Promise<{ cat: string[] }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { cat } = await params;
  const categorySlug = cat[cat.length - 1];

  const { categoryName } = await getCachedProductsByCategory(categorySlug);

  if (!categoryName) {
    return {
      title: "Category Not Found | Glow by UgoSylvia",
      description: "Sorry, we couldn't find the category you're looking for.",
    };
  }

  const title = `${categoryName} | Shop Glow by UgoSylvia`;
  const description = `Shop our collection of ${categoryName.toLowerCase()} beauty and wellness products. Find the best deals and latest arrivals.`;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      type: "website",
    },
  };
}
function Breadcrumbs({
  cat,
  categoryName,
}: {
  cat: string[];
  categoryName: string;
}) {
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const formatSlug = (slug: string) =>
    capitalize(decodeURIComponent(slug).replace(/-/g, " "));

  return (
    <Breadcrumb className="mb-4 text-sm text-muted-foreground">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/products">All Products</BreadcrumbLink>
        </BreadcrumbItem>

        {cat.map((segment, index) => {
          const isLast = index === cat.length - 1;
          const href = `/products/c/${cat.slice(0, index + 1).join("/")}`;
          const name = isLast ? categoryName : formatSlug(segment);

          return (
            <React.Fragment key={segment + index}>
              <BreadcrumbSeparator>
                <Slash className="h-3 w-3" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-medium text-foreground">
                    {name}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{name}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { cat } = await params;
  const categorySlug = cat[cat.length - 1];

  const [{ categories }, { products, count: productsCount, categoryName }] =
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
          <Breadcrumbs cat={cat} categoryName={categoryName} />
        </div>

        <Suspense fallback={<ProductGridSkeletonWrapper />}>
          <ProductsGrid products={products} productCount={productsCount} />
        </Suspense>
      </div>

      <Suspense fallback={<LoyaltyProgramSkeleton />}>
        <LoyaltyProgram />
      </Suspense>
      <Suspense fallback={<ProductCTASkeleton />}>
        <ProductCTA />
      </Suspense>
    </div>
  );
}
