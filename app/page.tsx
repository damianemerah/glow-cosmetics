import Link from "next/link";
import { Suspense } from "react";
import { Button, Skeleton } from "@/constants/ui/index";
import { services } from "@/constants/data";
import type { ProductWithCategories, Category } from "@/types/index";
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ProductCard } from "@/components/product/product-card";
import { RelatedProductsSkeleton } from "@/components/product/product-skeleton";
import SignatureServices from "@/components/signature-services";
import HomeHero from "@/components/home-hero";
import HomeCategory from "@/components/home-categories";
import CustomerReviews from "@/components/customer-reviews";
import { ProductGroupSection } from "@/components/product/product-group-section";
import SectionHeading from "@/components/common/section-heading";
import {
  filterVisibleCategories,
  isCategoryHidden,
} from "@/lib/visible-categories";

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
      // Skip the query while the jewellery category is hidden from the UI.
      isCategoryHidden("jewellers")
        ? Promise.resolve([])
        : getCachedJewelleryRecommendations(),
      getCachedCategories(),
    ]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Suspense fallback={<Skeleton className="min-h-[65vh]"></Skeleton>}>
        <HomeHero />
      </Suspense>

      {/* Home Category  */}
      <HomeCategory
        categories={filterVisibleCategories(categoryData.categories)}
      />

      <SignatureServices services={services} />

      {beautyRecommendations.length > 0 && (
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 ">
            <SectionHeading
              eyebrow="Curated for You"
              title="Beauty Essentials"
              description="Skincare, makeup and wellness favourites, hand-picked by our experts."
            />

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
        <section className="py-16 md:py-24 bg-secondary/60">
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

      <section className="py-16 md:py-24">
        <div className="container mx-auto">
          <div className="relative isolate overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground md:px-16 md:py-24">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--highlight)_28%,transparent),transparent_65%)]"
            />
            <p className="eyebrow mb-4 text-highlight">Your Glow Awaits</p>
            <h2 className="text-3xl md:text-5xl font-medium mb-5">
              Ready for Transformation?
            </h2>
            <p className="text-base md:text-lg mb-10 max-w-2xl mx-auto text-primary-foreground/80">
              Book your personalised consultation or appointment today and step
              into your most radiant self.
            </p>
            <Button asChild size="lg" variant="highlight">
              <Link href="/booking">Schedule Your Visit</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
