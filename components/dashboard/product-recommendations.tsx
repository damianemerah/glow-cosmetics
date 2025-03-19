"use client";

// import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/dashboard";
import { useState } from "react";

interface ProductRecommendationsProps {
  products: Product[];
  initialError: boolean;
}

export default function ProductRecommendations({
  products,
  initialError,
}: ProductRecommendationsProps) {
  const [error] = useState<boolean>(initialError);

  if (error) {
    return (
      <div className="flex items-center p-4 text-red-800 bg-red-50 rounded-md">
        <AlertCircle className="h-5 w-5 mr-2" />
        <p>Unable to load product recommendations. Please try again.</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">
          No product recommendations available
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <Link
          href={`/products/${product.id}`}
          key={product.id}
          className="group"
        >
          <div className="border rounded-md overflow-hidden transition-all hover:shadow-md">
            <div className="relative h-40 w-full">
              <Image
                src={
                  product.image_url[0] ||
                  "/placeholder.svg?height=160&width=300"
                }
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3">
              <h4 className="font-medium group-hover:text-green-500 transition-colors">
                {product.name}
              </h4>
              <p className="text-green-600 font-semibold mt-1">
                ${product.price.toFixed(2)}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
