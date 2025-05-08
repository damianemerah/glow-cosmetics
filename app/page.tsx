import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
  Button,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Separator,
  Skeleton,
} from "@/constants/ui/index";
import { services } from "@/constants/data";
import type { ProductWithCategories, Category } from "@/types/index";
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ProductCard } from "@/components/product/product-card";
import { LoyaltyProgramSkeleton } from "@/components/product/product-skeleton";
import LoyaltyProgram from "@/components/product/loyalty-program";
import SignatureServices from "@/components/signature-services";
import HomeHero from "@/components/home-hero";
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
        console.error("Error fetching recommendations:", error);
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

  const pinnedCategories = (categoryData?.categories || [])
    .filter((cat) => cat.pinned === true && cat.images && cat.images.length > 0)
    .slice(0, 10);

  const groupedCat = pinnedCategories.reduce(
    (acc, cat) => {
      const key = cat.name[0]; // group by first letter
      acc[key] = acc[key] || [];
      acc[key].push(cat);
      return acc;
    },
    {} as Record<string, typeof pinnedCategories>
  );

  const flattenedGroupedCat = Object.values(groupedCat).flat();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Suspense fallback={<Skeleton className="min-h-[65vh]"></Skeleton>}>
        <HomeHero />
      </Suspense>

      {pinnedCategories.length > 0 && (
        <section className="py-8 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl uppercase font-bold mb-10 md:mb-12 md:text-start text-center font-montserrat text-secondary-foreground">
              Explore By Category
            </h2>

            <Carousel
              opts={{
                align: "start",
                loop: pinnedCategories.length > 8,
              }}
              className="w-full overflow-x-auto mx-auto px-11 md:px-16"
            >
              <CarouselContent>
                {flattenedGroupedCat.map((category) => (
                  <CarouselItem
                    key={category.id}
                    className="flex-none px-2 group"
                  >
                    <Link href={`/products/c/${category.slug}`}>
                      <div className="flex flex-col items-center text-center">
                        <div
                          className="
                            relative
                            w-24 h-24
                            md:w-28 md:h-28
                            lg:w-34 lg:h-34
                            xl:w-40 xl:h-40
                            rounded-full overflow-hidden
                            border-2 border-transparent
                            group-hover:border-primary
                            transition-colors duration-300
                          "
                        >
                          <Image
                            src={
                              category.images?.[0] ??
                              "/images/placeholder-category.svg"
                            }
                            alt={category.name}
                            fill
                            className="
                              object-cover object-center
                              transition-transform duration-300
                              group-hover:scale-105
                            "
                            sizes="
                              (max-width: 640px) 30vw,
                              (max-width: 1024px) 20vw,
                              (max-width: 1280px) 15vw,
                              10vw
                            "
                          />
                        </div>

                        {/* label underneath */}
                        <span className="mt-2 text-sm md:text-base font-medium text-secondary-foreground">
                          {category.name}
                        </span>
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselPrevious className="left-2 z-[1000]" />
              <CarouselNext className="right-2 z-[1000]" />
            </Carousel>
          </div>
        </section>
      )}

      <SignatureServices services={services} />

      {recommendations.length > 0 && (
        <section className="py-16 md:py-20 bg-secondary px:4 md:px-16">
          <div className="container mx-auto px-4 ">
            <h2 className="text-3xl md:text-4xl uppercase font-bold mb-10 md:mb-12 md:text-start text-center font-montserrat">
              Curated For You
            </h2>
            <Carousel
              opts={{ align: "start", loop: recommendations.length > 3 }}
              className="w-full mx-auto"
            >
              {/* the track of items */}
              <CarouselContent className="justify-start px-5">
                {recommendations.map((product: ProductWithCategories) => (
                  <CarouselItem
                    key={product.id}
                    className="pl-1 basis-[85vw] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                  >
                    <ProductCard product={product} />
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Prev/Next arrows */}
              <CarouselPrevious className="left-2 z-[1000]" />
              <CarouselNext className="right-2 z-[1000]" />
            </Carousel>

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
