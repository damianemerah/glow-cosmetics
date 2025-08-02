import Link from "next/link";
import { Suspense } from "react";
import { Button, Skeleton } from "@/constants/ui/index";
import { services } from "@/constants/data";
import type { ProductWithCategories, Category } from "@/types/index";
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ProductCard } from "@/components/product/product-card";
import {
  LoyaltyProgramSkeleton,
  RelatedProductsSkeleton,
} from "@/components/product/product-skeleton";
import LoyaltyProgram from "@/components/product/loyalty-program";
import SignatureServices from "@/components/signature-services";
import HomeHero from "@/components/home-hero";
import HomeCategory from "@/components/home-categories";
import CustomerReviews from "@/components/customer-reviews";
import { ProductGroupSection } from "@/components/product/product-group-section";

export interface FetchCategoriesResult {
  categories: Category[];
}

async function getRecommendationsData(categoryFilter: string | null = null) {
  const getRecommendations = unstable_cache(
    async () => {
      const {
        data: { user },
      } = await supabaseAdmin.auth.getUser();

      const { data: recommendations, error } = await supabaseAdmin.rpc(
        "get_recommended_products",
        {
          p_user_id: user?.id || null,
          p_count: 8,
          p_category_filter: categoryFilter,
        }
      );

      if (error) {
        console.error(
          `Error fetching recommended products for ${categoryFilter || "all"} categories:`,
          error
        );
        return [];
      }
      return recommendations || [];
    },
    [`product-recommendations-${categoryFilter || "all"}`],
    {
      revalidate: 300, // 5 minutes
      tags: ["products"],
    }
  );
  return getRecommendations();
}

const getCachedBeautyRecommendations = () => getRecommendationsData("Beauty");
const getCachedJewelleryRecommendations = () =>
  getRecommendationsData("Jewellers");

const getCachedCategories = unstable_cache(
  async (): Promise<FetchCategoriesResult> => {
    try {
      return await supabaseAdmin
        .from("categories")
        .select("*")
        .eq("pinned", true)
        .order("name", { ascending: true })
        .then(({ data, error }) => {
          if (error) {
            throw new Error(error.message);
          }
          return { categories: data || [] };
        });
    } catch (error) {
      console.error("Error fetching categories:", error);
      return { categories: [] };
    }
  },
  ["categories"],
  { revalidate: 3600, tags: ["categories", "products"] }
);

export default async function Home() {
  const [beautyRecommendations, jewelleryRecommendations, categoryData] =
    await Promise.all([
      getCachedBeautyRecommendations(),
      getCachedJewelleryRecommendations(),
      getCachedCategories(),
    ]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Suspense fallback={<Skeleton className="min-h-[65vh]"></Skeleton>}>
        <HomeHero />
      </Suspense>

      {/* Home Category  */}
      <HomeCategory categories={categoryData.categories} />

      <SignatureServices services={services} />

      {beautyRecommendations.length > 0 && (
        <section className="py-16 md:py-20 bg-secondary  inset-shadow-sm">
          <div className="container mx-auto px-4 ">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-8">
              Beauty Products
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6">
              {beautyRecommendations.map((product: ProductWithCategories) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Button asChild variant="default" size="lg">
                <Link href="/products?filter=all">Shop All Products</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {jewelleryRecommendations.length > 0 && (
        <section className=" py-16 md:py-20 inset-shadow-sm bg-accent-foreground">
          <div className="container mx-auto px-4 ">
            <Suspense fallback={<RelatedProductsSkeleton />}>
              <ProductGroupSection
                title="Jewellery"
                products={jewelleryRecommendations}
              />
            </Suspense>
          </div>
        </section>
      )}

      <CustomerReviews />
      <Suspense fallback={<LoyaltyProgramSkeleton />}>
        <LoyaltyProgram />
      </Suspense>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Inner wrapper: border + shadow around only the heading/text/button */}
          <div className="inline-block border rounded-md shadow-lg p-8 bg-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-montserrat">
              Ready for Transformation?
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto text-secondary-foreground/90">
              Book your personalized consultation or appointment today and step
              into your most radiant self.
            </p>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="text-secondary bg-primary"
            >
              <Link href="/booking">Schedule Your Visit</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
