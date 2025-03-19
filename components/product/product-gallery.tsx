"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  // Default to the first image if available, otherwise use a placeholder
  const [selectedImage, setSelectedImage] = useState(
    images && images.length > 0 ? images[0] : "/placeholder.svg"
  );

  if (!images || images.length === 0) {
    // If no images are available
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">No image available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Main / Big Image */}
      <div className="aspect-square mb-4">
        <Image
          src={selectedImage}
          alt={`${productName} - Main Image`}
          width={500}
          height={500}
          className="w-full h-full object-cover rounded-lg shadow-md"
        />
      </div>

      {/* Thumbnail Images */}
      <div className="flex space-x-2 overflow-x-auto items-center">
        {images.map((url, index) => (
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
                alt={`${productName} - Thumbnail ${index + 1}`}
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
