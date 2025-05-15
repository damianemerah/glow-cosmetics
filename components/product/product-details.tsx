"use client";

import type { ProductWithCategories, ColorInfo, Product } from "@/types/index";
import { Json } from "@/types/types";
import { Badge } from "@/constants/ui/index";
import EnhancedAddToCart from "./enhanced-add-to-cart";
import { useState, useEffect, useCallback } from "react"; // Added useCallback
import NextImage from "next/image"; // Renamed to avoid conflict with custom Image component if any
import { formatZAR } from "@/utils";
import { SocialShare } from "@/components/social-share";
import { cn } from "@/lib/utils";
import { Check, Heart, Expand } from "lucide-react";

import { useUserStore } from "@/store/authStore";
import { toggleWishlistItem } from "@/actions/wishlistActions";
import { toast } from "sonner";
import { useWishlistStatus } from "@/lib/swr/wishlist";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import ZoomPlugin from "yet-another-react-lightbox/plugins/zoom";
import ThumbnailsPlugin from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";

// ReactImageMagnify is no longer needed
// import ReactImageMagnify from 'react-image-magnify';

interface ProductDetailsProps {
  product: ProductWithCategories;
}

const calculateDiscountPercentage = (product?: Product): number | null => {
  if (
    !product ||
    !product.compare_price ||
    product.compare_price <= product.price
  ) {
    return null;
  }
  if (product.compare_price === 0) return null;
  return Math.round(
    ((product.compare_price - product.price) / product.compare_price) * 100
  );
};

function ProductDetailsText({
  product,
  selectedColor,
  onColorSelect,
}: {
  product: ProductWithCategories;
  selectedColor: ColorInfo | null;
  onColorSelect: (color: ColorInfo) => void;
}) {
  const user = useUserStore((state) => state.user);
  const setShowModal = useUserStore((state) => state.setShowModal);

  const {
    data: isInWishlist,
    mutate,
    isValidating: isWishlistLoading,
  } = useWishlistStatus(user?.id, product.id);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user?.id) {
      setShowModal(true);
      toast.info("Please log in to add items to your wishlist.");
      return;
    }
    try {
      const result = await toggleWishlistItem(user.id, product.id);
      if (result.success) {
        toast.success(result.message);
        mutate();
      } else {
        toast.warning(result.error || "Failed to update wishlist");
      }
    } catch (error) {
      console.error("Wishlist toggle error:", error);
      toast.warning("Could not update wishlist");
    }
  };

  const categoryDisplay =
    product.product_categories
      ?.map((pc) => pc?.categories?.name)
      .filter(Boolean)
      .join(", ") || "";
  const discountPercentage = calculateDiscountPercentage(product);
  const getColorStyle = (
    hexCode: string | null | undefined
  ): React.CSSProperties => {
    if (!hexCode || !/^#[0-9A-F]{6}$/i.test(hexCode)) {
      return { backgroundColor: "#e5e7eb", border: "1px solid #d1d5db" };
    }
    const isWhite = hexCode.toLowerCase() === "#ffffff";
    return {
      backgroundColor: hexCode,
      border: isWhite ? "1px solid #d1d5db" : undefined,
    };
  };
  const productUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/products/${product.slug}`
      : `${process.env.NEXT_PUBLIC_APP_URL || ""}/products/${product.slug}`;
  const hasColorOptions =
    Array.isArray(product.color) && product.color.length > 0;
  const isColorInfo = (colorJson: Json): colorJson is ColorInfo =>
    typeof colorJson === "object" &&
    colorJson !== null &&
    !Array.isArray(colorJson) &&
    "name" in colorJson &&
    typeof colorJson.name === "string" &&
    "hex" in colorJson &&
    typeof colorJson.hex === "string";

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
        {discountPercentage !== null && (
          <Badge variant="destructive">{discountPercentage}% OFF</Badge>
        )}
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-montserrat capitalize">
        {product.name}
      </h1>
      {hasColorOptions && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Select Color:{" "}
            <span className="font-semibold text-primary">
              {selectedColor?.name || "(Not selected)"}
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {(product.color || []).filter(isColorInfo).map((colorInfo) => (
              <button
                key={colorInfo.name}
                type="button"
                aria-label={`Select color ${colorInfo.name}`}
                title={colorInfo.name}
                onClick={() => onColorSelect(colorInfo)}
                className={cn(
                  "relative block w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary",
                  selectedColor?.name === colorInfo.name
                    ? "border-primary ring-1 ring-primary"
                    : "border-transparent hover:border-gray-400"
                )}
                style={getColorStyle(colorInfo.hex)}
              >
                {selectedColor?.name === colorInfo.name && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Check
                      className={`h-4 w-4 ${colorInfo.hex && ["#000000", "#755237"].includes(colorInfo.hex.toLowerCase()) ? "text-white" : "text-black"} mix-blend-difference`}
                    />
                  </span>
                )}
              </button>
            ))}
          </div>
          {hasColorOptions && !selectedColor && (
            <p className="text-xs text-red-600 mt-1.5">Selection required</p>
          )}
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
      <div className="flex items-center gap-2 pt-2">
        <EnhancedAddToCart
          product={product}
          selectedColor={selectedColor}
          className="flex-1"
        />
        <button
          onClick={handleToggleWishlist}
          disabled={isWishlistLoading || !user?.id}
          className={`flex items-center justify-center p-3 h-11 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors ${isWishlistLoading ? "opacity-50 cursor-wait" : ""}`}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-5 w-5 ${isInWishlist ? "fill-red-500 text-red-500" : "text-gray-700"}`}
          />
        </button>
      </div>
      {product.short_description && (
        <div
          className="prose prose-sm max-w-none text-gray-700 link:text-primary"
          dangerouslySetInnerHTML={{ __html: product.short_description }}
        />
      )}
      <div className="text-sm pt-2">
        {product.stock_quantity > 5 ? (
          <Badge
            variant="outline"
            className="border-green-300 bg-green-50 text-green-700"
          >
            <Check className="w-3.5 h-3.5 mr-1" /> In Stock
          </Badge>
        ) : product.stock_quantity > 0 ? (
          <span className="text-orange-600 font-medium">
            Low stock ({product.stock_quantity} left)
          </span>
        ) : (
          <Badge variant="destructive">Out of stock</Badge>
        )}
      </div>
      <div className="pt-2">
        <SocialShare url={productUrl} title={`Check out ${product.name}!`} />
      </div>
    </div>
  );
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(
    product?.image_url &&
      Array.isArray(product.image_url) &&
      product.image_url.length > 0
      ? product.image_url[0]
      : "/placeholder.svg"
  );
  const [selectedColor, setSelectedColor] = useState<ColorInfo | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // --- State for Manual Zoom ---
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0.5, y: 0.5 }); // Default to center
  const zoomLevel = 2; // Adjust zoom level (e.g., 1.5, 2, 2.5)

  const isColorInfo = (colorJson: Json): colorJson is ColorInfo =>
    typeof colorJson === "object" &&
    colorJson !== null &&
    !Array.isArray(colorJson) &&
    "name" in colorJson &&
    typeof colorJson.name === "string" &&
    "hex" in colorJson &&
    typeof colorJson.hex === "string";

  useEffect(() => {
    if (product && !selectedColor) {
      const hasColorOptions =
        Array.isArray(product.color) && product.color.length > 0;
      if (hasColorOptions) {
        const validColors = (product.color || []).filter(isColorInfo);
        if (validColors.length === 1) setSelectedColor(validColors[0]);
      }
    }
  }, [product, selectedColor]);

  useEffect(() => {
    if (
      product?.image_url &&
      Array.isArray(product.image_url) &&
      product.image_url.length > 0
    ) {
      if (
        selectedImage === "/placeholder.svg" ||
        !product.image_url.includes(selectedImage)
      ) {
        setSelectedImage(product.image_url[0]);
      }
    } else if (!product?.image_url || product.image_url.length === 0) {
      setSelectedImage("/placeholder.svg");
    }
  }, [product?.image_url, selectedImage]);

  // --- Handlers for Manual Zoom ---
  const handleMouseMoveForZoom = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isZooming) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      setZoomPosition({ x, y });
    },
    [isZooming]
  );
  const hasImages =
    Array.isArray(product.image_url) && product.image_url.length > 0;

  const lightboxSlides = hasImages
    ? product.image_url.map((url) => ({ src: url }))
    : [{ src: "/placeholder.svg" }];

  const handleMouseEnterForZoom = useCallback(() => {
    if (hasImages) setIsZooming(true);
  }, [hasImages]);

  const handleMouseLeaveForZoom = useCallback(() => {
    setIsZooming(false);
    // Optionally reset zoom position to center when not zooming
    setZoomPosition({ x: 0.5, y: 0.5 });
  }, []);

  if (!product) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Loading product data...
      </div>
    );
  }

  const handleOpenLightbox = (imageSrc: string) => {
    if (!hasImages) return;
    const currentIndex = product.image_url.findIndex((src) => src === imageSrc);
    setLightboxIndex(currentIndex >= 0 ? currentIndex : 0);
    setLightboxOpen(true);
  };

  return (
    <div className="mb-8 md:mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="flex flex-col gap-4">
          {/* Main Image Display Container with Manual Zoom */}
          <div
            className="aspect-square w-full bg-gray-100 rounded-lg border relative group overflow-hidden cursor-zoom-in"
            onMouseMove={handleMouseMoveForZoom}
            onMouseEnter={handleMouseEnterForZoom}
            onMouseLeave={handleMouseLeaveForZoom}
            onClick={() => isZooming && handleOpenLightbox(selectedImage)} // Open lightbox if already zooming, or implement toggle
          >
            {hasImages ? (
              <NextImage
                key={selectedImage} // Re-render if image changes
                src={selectedImage}
                alt={`${product.name} - Main Image`}
                fill // Use fill to cover the container
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-200 ease-out" // Base class
                priority
                style={{
                  transformOrigin: `${zoomPosition.x * 100}% ${zoomPosition.y * 100}%`,
                  transform: isZooming ? `scale(${zoomLevel})` : "scale(1)",
                  // cursor: isZooming ? 'zoom-out' : 'zoom-in', // Optional: change cursor
                }}
                onError={() =>
                  console.warn(
                    "Failed to load main product image:",
                    selectedImage
                  )
                }
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gray-200">
                No image available
              </div>
            )}

            {/* Overlays: Badges and Expand Icon (should be on top) */}
            {product.is_bestseller && (
              <Badge
                variant="outline"
                className="absolute top-3 left-3 z-10 bg-white/80 border-yellow-500 text-yellow-700 shadow-sm pointer-events-none"
              >
                Bestseller
              </Badge>
            )}
            {calculateDiscountPercentage(product) !== null && (
              <Badge
                variant="destructive"
                className="absolute top-3 right-3 z-10 shadow-sm pointer-events-none"
              >
                {calculateDiscountPercentage(product)}% OFF
              </Badge>
            )}
            {hasImages && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenLightbox(selectedImage);
                }}
                className="absolute bottom-3 right-3 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 "
                aria-label="View image in full screen"
              >
                <Expand size={20} />
              </button>
            )}
          </div>

          {/* Thumbnail Navigation */}
          {hasImages && product.image_url.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {product.image_url.map((url, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`View image ${index + 1}`}
                  className={cn(
                    "relative w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden block border-2 transition-all duration-200 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary",
                    url === selectedImage
                      ? "border-primary"
                      : "border-transparent hover:border-gray-400"
                  )}
                  onClick={() => {
                    setSelectedImage(url);
                    setIsZooming(false); /* Reset zoom on thumb click */
                  }}
                >
                  <NextImage
                    src={url}
                    alt={`${product.name} - Thumbnail ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 64px, 80px"
                    className="object-cover"
                    onError={() =>
                      console.warn("Failed to load thumbnail image:", url)
                    }
                  />
                  {url === selectedImage && (
                    <div className="absolute inset-0 bg-black/30 pointer-events-none" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <ProductDetailsText
          product={product}
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
        />
      </div>

      {hasImages && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={lightboxSlides}
          index={lightboxIndex}
          on={{
            view: ({ index: currentIndex }) => setLightboxIndex(currentIndex),
          }}
          plugins={[ZoomPlugin, ThumbnailsPlugin]}
        />
      )}
    </div>
  );
}
