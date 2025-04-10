"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { categories } from "@/constants/data";
import type { Product } from "@/types/dashboard";
import { useState, useTransition } from "react";
import AddToCartButton from "@/components/product/add-to-cart-button";

export default function ProductTabs({ products }: { products: Product[] }) {
  // Add transition state for tab switching
  const [isPending, startTransition] = useTransition();
  const [currentTab, setCurrentTab] = useState("all");

  // Handle tab change with transition
  const handleTabChange = (value: string) => {
    startTransition(() => {
      setCurrentTab(value);
    });
  };

  return (
    <Tabs
      defaultValue="all"
      value={currentTab}
      onValueChange={handleTabChange}
      className="w-full"
    >
      <TabsList className="flex overflow-x-auto overflow-y-hidden items-center gap-2 mb-8 sticky top-20 z-10">
        {categories.map((category) => (
          <TabsTrigger
            key={category.id}
            value={category.id}
            className="text-sm md:text-base text-green-500"
            disabled={isPending}
          >
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Apply opacity during transitions for smoother experience */}
      <div className={isPending ? "opacity-70 transition-opacity" : ""}>
        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 lg:gap-10">
              {products
                .filter((product) => {
                  if (category.id === "all") return true;
                  if (!product.category) return false;
                  return product.category.replace("_", "-") === category.id;
                })
                .map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${
                      product.slug ||
                      product.name.toLowerCase().replace(/\s+/g, "-")
                    }`}
                  >
                    <Card className="overflow-hidden border-none shadow-lg flex flex-row sm:block h-full hover:shadow-xl transition-shadow">
                      <div className="relative w-[45%] sm:w-full sm:pt-[100%]">
                        <Image
                          src={
                            product.image_url && product.image_url.length > 0
                              ? product.image_url[0]
                              : "/placeholder.svg"
                          }
                          alt={product.name}
                          fill
                          className="object-cover object-center"
                          loading="lazy" // Add lazy loading for images
                          sizes="(max-width: 640px) 45vw, (max-width: 768px) 50vw, 33vw" // Add sizes for better performance
                        />
                        {product.is_bestseller && (
                          <Badge className="absolute top-4 right-4 bg-green-500">
                            Bestseller
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 md:text-center sm:text-left">
                        <CardContent className="p-4 md:p-6">
                          <h3 className="font-semibold text-lg md:text-xl mb-2 font-montserrat">
                            {product.name}
                          </h3>
                          <p className="text-green-500 font-bold text-base md:text-lg">
                            ${product.price.toFixed(2)}
                          </p>
                        </CardContent>
                        <CardFooter className="pb-4 md:pb-6 pt-0 w-full">
                          <AddToCartButton
                            product={product}
                            className="!w-full bg-green-500 hover:bg-green-600 rounded-lg py-2 md:py-3 text-base md:text-lg"
                          />
                        </CardFooter>
                      </div>
                    </Card>
                  </Link>
                ))}
            </div>
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
