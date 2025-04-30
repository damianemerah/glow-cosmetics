"use client";
import type { ProductWithCategories, ColorInfo, Product } from "@/types/index";
import { Json } from "@/types/types";
import { Badge } from "@/constants/ui/index";
import EnhancedAddToCart from "./enhanced-add-to-cart";
import { useState, useEffect } from "react";
import Image from "next/image";
import { formatZAR } from "@/utils";
import { SocialShare } from "@/components/social-share";
import { cn } from "@/lib/utils";
import { Check, Heart } from "lucide-react";
import { useUserStore } from "@/store/authStore";
import { toggleWishlistItem } from "@/actions/wishlistActions";
import { toast } from "sonner";
import { useWishlistStatus } from "@/lib/swr/wishlist";

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
        mutate(); // Revalidate the wishlist status
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

  const isColorInfo = (colorJson: Json): colorJson is ColorInfo => {
    return (
      typeof colorJson === "object" &&
      colorJson !== null &&
      !Array.isArray(colorJson) &&
      "name" in colorJson &&
      typeof colorJson.name === "string" &&
      "hex" in colorJson &&
      typeof colorJson.hex === "string"
    );
  };

  return (
    <div className="space-y-4 md:space-y-5 py-4 md:py-0">
      {/* Top Meta: Categories & Badges */}
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

      {/* Product Name */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-montserrat capitalize">
        {product.name}
      </h1>

      {/* Color Selection UI */}
      {hasColorOptions && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Select Color:{" "}
            <span className="font-semibold text-primary">
              {selectedColor?.name || ""}
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

      {/* Price Display */}
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

      {/* Add to Cart Component with Wishlist Button */}
      <div className="flex items-center gap-2 pt-2">
        <EnhancedAddToCart
          product={product}
          selectedColor={selectedColor}
          className="flex-1"
        />

        <button
          onClick={handleToggleWishlist}
          disabled={isWishlistLoading}
          className={`flex items-center justify-center p-3 h-11 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors ${
            isWishlistLoading ? "opacity-50 cursor-wait" : ""
          }`}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-5 w-5 ${isInWishlist ? "fill-red-500 text-red-500" : "text-gray-700"}`}
          />
        </button>
      </div>

      {/* Short Description */}
      {product.short_description && (
        <div
          className="prose prose-sm max-w-none text-gray-700 link:text-primary"
          dangerouslySetInnerHTML={{ __html: product.short_description }}
        />
      )}

      {/* Stock Status */}
      <div className="text-sm pt-2">
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
          <Badge variant="destructive">Out of stock</Badge>
        )}
      </div>

      {/* Social Sharing */}
      <div className="pt-2">
        <SocialShare url={productUrl} title={`Check out ${product.name}!`} />
      </div>
    </div>
  );
}

// --- Main ProductDetails component (Parent) ---
export default function ProductDetails({ product }: ProductDetailsProps) {
  // --- HOOKS MUST BE CALLED AT THE TOP ---
  const [selectedImage, setSelectedImage] = useState(
    // Initialize safely, checking product and image_url
    product?.image_url &&
      Array.isArray(product.image_url) &&
      product.image_url.length > 0
      ? product.image_url[0]
      : "/placeholder.svg"
  );
  const [selectedColor, setSelectedColor] = useState<ColorInfo | null>(null);

  // Type guard for ColorInfo (can be defined here or imported)
  const isColorInfo = (colorJson: Json): colorJson is ColorInfo => {
    return (
      typeof colorJson === "object" &&
      colorJson !== null &&
      !Array.isArray(colorJson) &&
      "name" in colorJson &&
      typeof colorJson.name === "string" &&
      "hex" in colorJson &&
      typeof colorJson.hex === "string"
    );
  };

  // --- SIDE EFFECTS AFTER RENDER (use useEffect) ---
  useEffect(() => {
    // Auto-select color if only one valid option exists and none is selected yet
    // Run only if product data is available
    if (product && !selectedColor) {
      // Only run if no color is selected yet
      const hasColorOptions =
        Array.isArray(product.color) && product.color.length > 0;
      if (hasColorOptions) {
        const validColors = (product.color || []).filter(isColorInfo);
        if (validColors.length === 1) {
          // console.log("Auto-selecting single color:", validColors[0]); // Debug log
          setSelectedColor(validColors[0]);
        }
      }
    }
    // Depend on product and whether a color is already selected
  }, [product, selectedColor]);

  // Update selectedImage if product changes or image_url becomes available
  useEffect(() => {
    if (
      product?.image_url &&
      Array.isArray(product.image_url) &&
      product.image_url.length > 0
    ) {
      // Only update if the current selectedImage is the placeholder or not in the new list
      if (
        selectedImage === "/placeholder.svg" ||
        !product.image_url.includes(selectedImage)
      ) {
        setSelectedImage(product.image_url[0]);
      }
    } else if (!product?.image_url || product.image_url.length === 0) {
      // Reset to placeholder if product loses images
      setSelectedImage("/placeholder.svg");
    }
  }, [product?.image_url, selectedImage]); // Rerun when image_url array changes

  // --- EARLY RETURN (AFTER HOOKS) ---
  if (!product) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Loading product data or product not found... {/* Improved message */}
      </div>
    );
  }

  // --- DERIVED STATE & LOGIC (AFTER HOOKS & EARLY RETURN) ---
  const hasImages =
    Array.isArray(product.image_url) && product.image_url.length > 0;
  // No need for hasColorOptions here as it's handled in ProductDetailsText

  // --- RENDER ---
  return (
    <div className="mb-8 md:mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column: Image Gallery */}
        <div className="flex flex-col gap-4">
          {/* Main Image Display */}
          <div className="aspect-square w-full bg-gray-50 rounded-lg border overflow-hidden relative group">
            {product.is_bestseller && (
              <Badge
                variant="outline"
                className="absolute top-2 left-2 z-10 bg-white/80 border-yellow-500 text-yellow-700 shadow-sm"
              >
                Bestseller
              </Badge>
            )}
            {calculateDiscountPercentage(product) !== null && (
              <Badge
                variant="destructive"
                className="absolute top-2 right-2 z-10 shadow-sm"
              >
                {calculateDiscountPercentage(product)}% OFF
              </Badge>
            )}
            {hasImages ? (
              <Image
                key={selectedImage}
                src={selectedImage}
                alt={`${product.name} - Main Image`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority
                onError={(e) =>
                  console.warn(
                    "Failed to load main product image:",
                    selectedImage,
                    e
                  )
                }
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gray-100">
                No image available
              </div>
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
                  onClick={() => setSelectedImage(url)}
                >
                  <Image
                    src={url}
                    alt={`${product.name} - Thumbnail ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 64px, 80px"
                    className="object-cover"
                    onError={(e) =>
                      console.warn("Failed to load thumbnail image:", url, e)
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

        {/* Right Column: Product Text & Actions */}
        <ProductDetailsText
          product={product}
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor} // Pass the state setter
        />
      </div>
    </div>
  );
}
