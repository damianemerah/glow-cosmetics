"use client";

import type { ProductWithCategories, ColorInfo, Product } from "@/types/index";
import { Json } from "@/types/supabase";
import { Badge } from "@/constants/ui/index";
import EnhancedAddToCart from "./enhanced-add-to-cart";
import { useState, useEffect, useCallback } from "react"; // Added useCallback
import NextImage from "next/image"; // Renamed to avoid conflict with custom Image component if any
import { formatZAR } from "@/utils";
import { SocialShare } from "@/components/social-share";
import { cn } from "@/lib/utils";
import { Check, Heart, Expand } from "lucide-react";
import HtmlDescription from "@/components/common/html-description";

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
      return {
        backgroundColor: "var(--muted)",
        border: "1px solid var(--border)",
      };
    }
    const isWhite = hexCode.toLowerCase() === "#ffffff";
    return {
      backgroundColor: hexCode,
      border: isWhite ? "1px solid var(--border)" : undefined,
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
    <div className="space-y-5 py-2 md:py-0 lg:sticky lg:top-24 lg:self-start">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {categoryDisplay && (
          <span className="eyebrow text-primary">{categoryDisplay}</span>
        )}
        {product.is_bestseller && <Badge variant="highlight">Bestseller</Badge>}
        {discountPercentage !== null && (
          <Badge className="border-transparent bg-destructive/10 text-destructive hover:bg-destructive/10">
            {discountPercentage}% off
          </Badge>
        )}
      </div>
      <h1 className="font-heading text-3xl font-medium capitalize leading-tight text-foreground md:text-4xl">
        {product.name}
      </h1>
      {hasColorOptions && (
        <div className="mb-4">
          <p className="text-sm font-medium text-foreground mb-2">
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
                    : "border-transparent hover:border-input"
                )}
                style={getColorStyle(colorInfo.hex)}
              >
                {selectedColor?.name === colorInfo.name && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Check
                      className={`h-4 w-4 ${colorInfo.hex && ["#000000", "#755237"].includes(colorInfo.hex.toLowerCase()) ? "text-primary-foreground" : "text-foreground"} mix-blend-difference`}
                    />
                  </span>
                )}
              </button>
            ))}
          </div>
          {hasColorOptions && !selectedColor && (
            <p className="text-xs text-destructive mt-1.5">Selection required</p>
          )}
        </div>
      )}
      <div className="flex items-baseline gap-3 border-b pb-5">
        <span className="font-heading text-3xl text-primary md:text-4xl">
          {formatZAR(product.price)}
        </span>
        {product.compare_price && product.compare_price > product.price && (
          <span className="text-lg text-muted-foreground line-through">
            {formatZAR(product.compare_price)}
          </span>
        )}
      </div>
      <div className="flex items-start gap-2">
        <EnhancedAddToCart
          product={product}
          selectedColor={selectedColor}
          className="flex-1"
        />
        <button
          onClick={handleToggleWishlist}
          disabled={isWishlistLoading || !user?.id}
          className={cn(
            "flex h-10 w-10 shrink-0 self-end items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary",
            isWishlistLoading && "cursor-wait opacity-50"
          )}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-5 w-5 ${isInWishlist ? "fill-destructive text-destructive" : "text-foreground"}`}
          />
        </button>
      </div>
      {product.short_description && (
        <HtmlDescription description={product.short_description} />
      )}
      <div className="text-sm pt-2">
        {product.stock_quantity > 5 ? (
          <Badge variant="success">
            <Check className="mr-1 h-3.5 w-3.5" /> In stock
          </Badge>
        ) : product.stock_quantity > 0 ? (
          <Badge variant="warning">
            Only {product.stock_quantity} left
          </Badge>
        ) : (
          <Badge className="border-transparent bg-destructive/10 text-destructive hover:bg-destructive/10">
            Out of stock
          </Badge>
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
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-4">
          {/* Main Image Display Container with Manual Zoom */}
          <div
            className="group relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-xl bg-secondary"
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
              <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                No image available
              </div>
            )}

            {/* Overlays: Badges and Expand Icon (should be on top) */}
            {product.is_bestseller && (
              <Badge
                variant="highlight"
                className="pointer-events-none absolute left-4 top-4 z-10 shadow-sm"
              >
                Bestseller
              </Badge>
            )}
            {calculateDiscountPercentage(product) !== null && (
              <Badge
                variant="destructive"
                className="pointer-events-none absolute right-4 top-4 z-10 shadow-sm"
              >
                {calculateDiscountPercentage(product)}% off
              </Badge>
            )}
            {hasImages && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenLightbox(selectedImage);
                }}
                className="absolute bottom-4 right-4 z-10 rounded-full bg-card/90 p-2.5 text-foreground shadow-soft backdrop-blur transition-colors hover:bg-card"
                aria-label="View image in full screen"
              >
                <Expand size={18} />
              </button>
            )}
          </div>

          {/* Thumbnail Navigation */}
          {hasImages && product.image_url.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.image_url.map((url, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`View image ${index + 1}`}
                  className={cn(
                    "relative block h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-secondary transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-20 sm:w-20",
                    url === selectedImage
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "opacity-70 hover:opacity-100"
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
