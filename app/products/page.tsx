import { Suspense } from "react";
import type { Metadata } from "next";
import {
  fetchNewlyAddedProducts,
  fetchDealsOfTheWeek,
  fetchBestSellingProducts,
  fetchRecommendedProducts,
  getCachedCategories,
  fetchFilteredProducts,
  type FetchProductsParams,
  type ProductSortOption,
  type ProductFilterOption,
} from "@/actions/productActions";

import ProductHero from "@/components/product/product-hero";
import {
  ProductGroupSection,
  ProductGroupSkeleton,
} from "@/components/product/product-group-section";
import ProductsGrid from "@/components/product/products-grid";
import LoyaltyProgram from "@/components/product/loyalty-program";
import ProductCTA from "@/components/product/product-cta";
import {
  ProductGridSkeletonWrapper,
  LoyaltyProgramSkeleton,
  ProductCTASkeleton,
} from "@/components/product/product-skeleton";
import Pagination from "@/components/common/pagination";
import ProductNavigation from "@/components/product/product-navigation";

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

async function NewlyAddedSection() {
  const products = await fetchNewlyAddedProducts();
  return (
    <ProductGroupSection
      title="Newly Added"
      products={products}
      viewAllHref="/products?sort=latest"
    />
  );
}

async function DealsSection() {
  const products = await fetchDealsOfTheWeek();
  return (
    <ProductGroupSection
      title="Deals of the Week"
      products={products}
      viewAllHref="/products?filter=deals"
    />
  );
}

async function BestSellingSection() {
  const products = await fetchBestSellingProducts();
  return (
    <ProductGroupSection
      title="Best Selling"
      products={products}
      viewAllHref="/products?filter=bestseller"
    />
  );
}

async function RecommendedSection() {
  const products = await fetchRecommendedProducts();
  return (
    <ProductGroupSection
      title="Recommended For You"
      products={products}
      viewAllHref="/products?sort=popularity"
    />
  );
}

interface FilteredProductsGridProps {
  // searchParams: Promise<{
  //   sort?: ProductSortOption;
  //   filter?: ProductFilterOption;
  //   page?: string;
  // }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function FilteredProductsGrid({
  searchParams,
}: FilteredProductsGridProps) {
  const searchParamsObj = await searchParams;
  const { sort, filter, page = 1 } = searchParamsObj;
  const fetchParams: FetchProductsParams = {
    sort: sort as ProductSortOption | undefined,
    filter: filter as ProductFilterOption | undefined,
    page: parseInt(page as string, 10),
  };

  const { products, count } = await fetchFilteredProducts(fetchParams);

  const totalPages = Math.ceil(count / 12);

  return (
    <>
      <ProductsGrid
        products={products}
        productCount={count}
        initialSort={sort as ProductSortOption | undefined}
        initialFilter={filter as ProductFilterOption | undefined}
      />
      {totalPages > 1 && (
        <Pagination
          currentPage={parseInt(page as string, 10)}
          totalPages={totalPages}
          baseUrl="/products"
          searchParams={searchParamsObj}
        />
      )}
    </>
  );
}

export default async function ProductsPage({
  searchParams,
}: FilteredProductsGridProps) {
  const { sort, page, filter } = await searchParams;
  const showFilteredGrid = sort || filter || page;

  const { categories } = await getCachedCategories();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ProductHero />
      <div>
        <ProductNavigation categoryData={categories} />

        {showFilteredGrid ? (
          <Suspense fallback={<ProductGridSkeletonWrapper />}>
            <FilteredProductsGrid searchParams={searchParams} />
          </Suspense>
        ) : (
          <>
            <Suspense fallback={<ProductGroupSkeleton title="Newly Added" />}>
              <NewlyAddedSection />
            </Suspense>
            <Suspense
              fallback={<ProductGroupSkeleton title="Deals of the Week" />}
            >
              <DealsSection />
            </Suspense>
            <Suspense fallback={<ProductGroupSkeleton title="Best Selling" />}>
              <BestSellingSection />
            </Suspense>
            <Suspense
              fallback={<ProductGroupSkeleton title="Recommended For You" />}
            >
              <RecommendedSection />
            </Suspense>
          </>
        )}
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
