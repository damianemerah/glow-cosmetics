import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
  Button,
  Card,
  CardContent,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Separator,
} from "@/constants/ui/index";
import { ChevronRight } from "lucide-react";
import { services } from "@/constants/data";
import type { ProductWithCategories, Category } from "@/types/index";
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ProductCard } from "@/components/product/product-card";
import { LoyaltyProgramSkeleton } from "@/components/product/product-skeleton";
import LoyaltyProgram from "@/components/product/loyalty-program";

export interface FetchCategoriesResult {
  categories: Category[];
}

// --- Data Fetching Functions ---

// Recommendation Data Fetching
async function getRecommendationsData() {
  const getRecommendations = unstable_cache(
    async () => {
      const { data: recommendations, error } = await supabaseAdmin.rpc(
        "get_random_products",
        { count: 6 }
      );
      if (error) {
        console.error("Error fetching recommendations:", error);
        return []; // Return empty array on error
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

// Category Data Fetching
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
  // Fetch data concurrently
  const [recommendations, categoryData] = await Promise.all([
    getRecommendationsData(),
    getCachedCategories(),
  ]);

  console.log(categoryData, "categoryData");
  const pinnedCategories = (categoryData?.categories || [])
    .filter((cat) => cat.pinned === true && cat.images && cat.images.length > 0)
    .slice(0, 10);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <section className="relative h-[75vh] md:h-[85vh] text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/pic3.jpg"
            alt="Serene beauty and wellness setting"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center z-10">
          <div className="max-w-xl md:max-w-2xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 tracking-tight font-serif leading-tight">
              Elevate Your Radiance
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-200">
              Discover bespoke beauty treatments and curated wellness products
              designed for your unique glow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Link href="/booking">Book Your Experience</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white bg-white/10 backdrop-blur-sm"
              >
                <Link href="/products">Shop Our Collection</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {pinnedCategories.length > 0 && (
        <section className="py-16 px-11 md:px-16 md:py-20 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-10 md:mb-12 text-center font-serif text-secondary-foreground">
              Explore By Category
            </h2>

            <Carousel
              opts={{ align: "start" }}
              className="w-full max-w-7xl mx-auto"
            >
              <CarouselContent className="gap-4 justify-center">
                {pinnedCategories.map((category) => (
                  <CarouselItem
                    key={category.id}
                    className="flex-none px-2 group"
                  >
                    <Link href={`/products?category=${category.slug}`}>
                      <div className="flex flex-col items-center text-center">
                        <div
                          className="
                            relative
                            w-24 h-24 md:w-28 md:h-28
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
                            sizes="(max-width: 640px) 30vw,
                           (max-width: 1024px) 20vw,
                           10vw"
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

              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </section>
      )}

      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-10 md:mb-12 text-center font-serif text-secondary-foreground">
            Signature Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {services.slice(0, 3).map((service) => (
              <Card
                key={service.id}
                className="overflow-hidden border-none shadow-lg bg-card text-card-foreground flex flex-col"
              >
                <div className="relative h-52 md:h-64">
                  <Image
                    src={service.image || "/images/placeholder-service.svg"}
                    alt={service.name}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <CardContent className="p-5 md:p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold mb-2 font-serif">
                    {service.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-3">
                    {service.description}
                  </p>
                  <Button asChild variant="outline" className="w-full mt-auto">
                    <Link
                      href={`/services#${service.id}`}
                      className="flex items-center justify-center"
                    >
                      Discover More <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="default" size="lg">
              <Link href="/services">Explore All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {recommendations.length > 0 && (
        <section className="py-16 md:py-20 bg-secondary px:11 md:px-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-10 md:mb-12 text-center font-serif">
              Curated For You
            </h2>
            <Carousel
              opts={{ align: "start" }}
              className="w-full max-w-7xl mx-auto"
            >
              {/* the track of items */}
              <CarouselContent className="gap-4 justify-center">
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

      <Suspense fallback={<LoyaltyProgramSkeleton />}>
        <LoyaltyProgram />
      </Suspense>

      <section className="py-16 md:py-20 bg-gradient-to-t from-[#4a5a3a] to-[#5a6b47]/80 text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 font-serif">
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
