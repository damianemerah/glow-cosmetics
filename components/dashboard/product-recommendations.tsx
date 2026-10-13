"use client";

import { AlertCircle, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/index";
import { useState } from "react";
import { formatZAR } from "@/utils";
import EmptyState from "./empty-state";

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
      <div className="flex items-center rounded-lg bg-destructive/5 p-4 text-destructive">
        <AlertCircle className="mr-2 h-5 w-5" />
        <p>Unable to load product recommendations. Please try again.</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No recommendations yet"
        action={{ label: "Browse products", href: "/products" }}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
      {products.map((product) => (
        <Link
          href={`/products/${product.slug}`}
          key={product.id}
          className="group block"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-secondary">
            <Image
              src={product.image_url?.[0] || "/placeholder.svg"}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 300px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {product.is_bestseller && (
              <span className="absolute left-3 top-3 rounded-full bg-highlight px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wider text-highlight-foreground">
                Bestseller
              </span>
            )}
          </div>
          <div className="pt-3">
            <h4 className="line-clamp-2 text-sm font-medium capitalize text-foreground transition-colors group-hover:text-primary md:text-base">
              {product.name}
            </h4>
            <p className="mt-1 font-semibold text-primary">
              {formatZAR(product.price)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
