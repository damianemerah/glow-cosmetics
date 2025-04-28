"use client";
import type { ProductWithCategories, ColorInfo } from "@/types/index";
import { Badge } from "@/constants/ui/index";
import EnhancedAddToCart from "./enhanced-add-to-cart";
import { useState } from "react";
import Image from "next/image";
import { formatZAR } from "@/utils";
import { SocialShare } from "@/components/social-share";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ProductDetailsProps {
  product: ProductWithCategories;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(
    product.image_url && product.image_url.length > 0
      ? product.image_url[0]
      : "/placeholder.svg"
  );

  if (!product) {
    return (
      <div className="text-center py-10">Product data is unavailable.</div>
    );
  }

  const hasImages = product.image_url && product.image_url.length > 0;

  return (
    <div className="mb-8 md:mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="flex flex-col gap-4">
          <div className="aspect-square w-full bg-gray-50 rounded-lg border overflow-hidden">
            {hasImages ? (
              <Image
                key={selectedImage}
                src={selectedImage}
                alt={`${product.name}- Main Image`}
                width={600}
                height={600}
                className="w-full h-full object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>
          {hasImages && product.image_url.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {product.image_url.map((url, index) => (
                <button
                  key={index}
                  type="button"
                  className={cn(
                    "relative w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden block border-2 transition-all duration-200 flex-shrink-0",
                    url === selectedImage
                      ? "border-primary"
                      : "border-transparent hover:border-gray-300"
                  )}
                  onClick={() => setSelectedImage(url)}
                >
                  <Image
                    src={url}
                    alt={`${product.name} - Thumbnail ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 64px, 80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <ProductDetailsText product={product} />
      </div>
    </div>
  );
}

function ProductDetailsText({ product }: ProductDetailsProps) {
  const categoryDisplay = product.product_categories
    ?.map((pc) => pc?.categories?.name)
    .filter(Boolean)
    .join(", ");

  const calculateDiscountPercentage = () => {
    if (!product.compare_price || product.compare_price <= product.price)
      return null;
    return Math.round(
      ((product.compare_price - product.price) / product.compare_price) * 100
    );
  };

  const discountPercentage = calculateDiscountPercentage();

  const getColorStyle = (
    hexCode: string | null | undefined
  ): React.CSSProperties => {
    if (!hexCode)
      return { backgroundColor: "#e5e7eb", border: "1px solid #d1d5db" };
    const isWhite = hexCode.toLowerCase() === "#ffffff";
    return {
      backgroundColor: hexCode,
      border: isWhite ? "1px solid #d1d5db" : undefined,
    };
  };

  const productUrl = `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`;

  return (
    <div className="space-y-4 md:space-y-5 py-4 md:py-0">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        {categoryDisplay && (
          <span className="text-gray-600 capitalize">{categoryDisplay}</span>
        )}
        {product.is_bestseller && (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-700"
          >
            Bestseller
          </Badge>
        )}
        {discountPercentage && (
          <Badge variant="destructive">{discountPercentage}% OFF</Badge>
        )}
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-montserrat capitalize">
        {product.name}
      </h1>

      {Array.isArray(product.color) && product.color.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-600 mb-1.5">
            Available Colors:
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {product.color
              .filter((colorInfo): colorInfo is ColorInfo => !!colorInfo)
              .map((colorInfo) => (
                <span
                  key={colorInfo.name}
                  className="block w-6 h-6 rounded-full border transition-transform hover:scale-110 cursor-default"
                  style={getColorStyle(colorInfo.hex)}
                  title={colorInfo.name}
                />
              ))}
          </div>
        </div>
      )}

      <div className="flex items-baseline space-x-3">
        <span className="text-2xl md:text-3xl font-semibold text-primary">
          {formatZAR(product.price)}
        </span>
        {product.compare_price && product.compare_price > product.price && (
          <span className="text-lg text-gray-500 line-through">
            {formatZAR(product.compare_price)}
          </span>
        )}
      </div>

      <EnhancedAddToCart product={product} className="pt-2" />

      {product.short_description && (
        <div
          className="prose prose-sm max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: product.short_description }}
        />
      )}

      <div className="text-sm">
        {product.stock_quantity > 5 ? (
          <Badge
            variant="outline"
            className="border-green-300 bg-green-50 text-green-700"
          >
            <Check className="w-3.5 h-3.5 mr-1" />
            In Stock
          </Badge>
        ) : product.stock_quantity > 0 ? (
          <span className="text-orange-600 font-medium">
            Low stock ({product.stock_quantity} left)
          </span>
        ) : (
          <span className="text-red-600 font-medium">Out of stock</span>
        )}
      </div>
      <SocialShare url={productUrl} title={`Check out ${product.name}!`} />
    </div>
  );
}
