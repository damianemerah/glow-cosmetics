"use client";
import type { Product } from "@/types/dashboard";
import { Badge } from "@/components/ui/badge";
import AddToCartButton from "./add-to-cart-button";
import { useState } from "react";
import Image from "next/image";

// interface ProductGalleryProps {
//   images: string[];
//   productName: string;
// }

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  // Default to the first image if available, otherwise use a placeholder
  const [selectedImage, setSelectedImage] = useState(
    product.image_url && product.image_url.length > 0
      ? product.image_url[0]
      : "/placeholder.svg"
  );

  if (!product.image_url || product.image_url.length === 0) {
    // If no images are available
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">No image available</p>
      </div>
    );
  }

  return (
    <div className="mb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
        {/* Main / Big Image */}
        <div className="aspect-square">
          <Image
            src={selectedImage}
            alt={`${product.name} - Main Image`}
            width={500}
            height={500}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <ProductDetailsText product={product} />
      </div>

      {/* Thumbnail Images */}
      <div className="flex space-x-2 overflow-x-auto items-center">
        {product.image_url.map((url, index) => (
          <div
            key={index}
            className={
              url === selectedImage
                ? "border-2 border-primary p-1 rounded-lg transition-all duration-200"
                : "transition-all duration-200"
            }
          >
            <button
              type="button"
              className="relative w-20 h-20 rounded-lg overflow-hidden block"
              onClick={() => setSelectedImage(url)}
            >
              <Image
                src={url}
                alt={`${product.name} - Thumbnail ${index + 1}`}
                fill
                className="object-cover transition-transform duration-200 hover:scale-105"
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductDetailsText({ product }: ProductDetailsProps) {
  // Format category for display
  const categoryDisplay = product.category.replace("_", " ");

  return (
    <div className="space-y-6 mt-4 sticky top-21 h-[fit-content]">
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600 capitalize">
          Category: {categoryDisplay}
        </span>
        {product.is_bestseller && (
          <Badge className="bg-yellow-100 text-yellow-800">Bestseller</Badge>
        )}
      </div>
      <h1 className="text-3xl font-bold text-gray-800 font-montserrat capitalize">
        {product.name}
      </h1>

      <p className="text-2xl font-semibold text-green-600">
        ${product.price ? product.price.toFixed(2) : "0.00"}
      </p>

      {product.short_description && (
        <div
          className="prose max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: product.short_description }}
        />
      )}

      <div>
        <span className="text-sm text-gray-600">
          {product.stock_quantity > 0
            ? `${product.stock_quantity} in stock`
            : "Out of stock"}
        </span>
      </div>

      <AddToCartButton product={product} />
    </div>
  );
}
