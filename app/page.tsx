import Link from "next/link";
import { Suspense } from "react";
import { Button, Separator, Skeleton } from "@/constants/ui/index";
import { services } from "@/constants/data";
import type { ProductWithCategories, Category } from "@/types/index";
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ProductCard } from "@/components/product/product-card";
import { LoyaltyProgramSkeleton } from "@/components/product/product-skeleton";
import LoyaltyProgram from "@/components/product/loyalty-program";
import SignatureServices from "@/components/signature-services";
import HomeHero from "@/components/home-hero";
import HomeCategory from "@/components/home-categories";
import CustomerReviews from "@/components/customer-reviews";

export interface FetchCategoriesResult {
  categories: Category[];
}

async function getRecommendationsData() {
  const getRecommendations = unstable_cache(
    async () => {
      const { data: recommendations, error } = await supabaseAdmin.rpc(
        "get_random_products",
        { count: 6 }
      );
      if (error) {
        return [];
      }
      return recommendations || [];
    },
    ["product-recommendations"],
    {
      revalidate: 300, // 5 minutes
      tags: ["products"],
    }
  );
  return getRecommendations();
}

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
  const [recommendations, categoryData] = await Promise.all([
    getRecommendationsData(),
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

      {recommendations.length > 0 && (
        <section className="py-16 md:py-20 bg-secondary">
          <div className="container mx-auto px-4 ">
            <h2 className="text-3xl md:text-4xl uppercase font-bold mb-10 md:mb-12 md:text-start text-center font-montserrat">
              Curated For You
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recommendations.map((product: ProductWithCategories) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Button asChild variant="default" size="lg">
                <Link href="/products">Shop All Products</Link>
              </Button>
            </div>
          </div>
        </section>
      )}
      <Separator className=" block mx-4rem" />

      <CustomerReviews />
      <Suspense fallback={<LoyaltyProgramSkeleton />}>
        <LoyaltyProgram />
      </Suspense>

      <section className="py-16 md:py-20 bg-gradient-to-t from-[#4a5a3a] to-[#5a6b47]/80 text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl  font-bold mb-4 font-montserrat">
            Ready for Transformation?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-primary-foreground/90">
            Book your personalized consultation or appointment today and step
            into your most radiant self.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="text-secondary-foreground hover:bg-secondary/90"
          >
            <Link href="/booking">Schedule Your Visit</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
