"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { X, Check, Heart } from "lucide-react";
import { Badge, DialogTitle } from "@/constants/ui/index";
import type { ProductWithCategories, ColorInfo } from "@/types/index";
import { Json } from "@/types/supabase";
import { formatZAR } from "@/utils";
import EnhancedAddToCart from "./enhanced-add-to-cart";
import { toast } from "sonner";
import { useUserStore } from "@/store/authStore";
import { toggleWishlistItem } from "@/actions/wishlistActions";
import { useWishlistStatus } from "@/lib/swr/wishlist";

interface ProductQuickViewProps {
  product: ProductWithCategories;
  onClose: () => void;
}

export function ProductQuickView({ product, onClose }: ProductQuickViewProps) {
  const [selectedColor, setSelectedColor] = useState<ColorInfo | null>(null);

  const user = useUserStore((state) => state.user);
  const setShowModal = useUserStore((state) => state.setShowModal);

  const {
    data: isInWishlist,
    mutate,
    isValidating: isWishlistLoading,
  } = useWishlistStatus(user?.id, product.id);

  if (!product) {
    return (
      <div className="p-6 text-center text-destructive">
        Product data not available.
      </div>
    );
  }

  const primaryImageUrl =
    product.image_url && product.image_url.length > 0
      ? product.image_url[0]
      : "/placeholder.svg";

  const stockQuantity = product.stock_quantity ?? 0;
  const canAddToCart = stockQuantity > 0;

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

  const getColorStyle = (
    hexCode: string | null | undefined
  ): React.CSSProperties => {
    if (!hexCode)
      return { backgroundColor: "var(--muted)", border: "1px solid var(--border)" };
    const isWhite = hexCode.toLowerCase() === "#ffffff";
    return {
      backgroundColor: hexCode,
      border: isWhite ? "1px solid #d1d5db" : undefined,
    };
  };

  const hasColorOptions =
    Array.isArray(product.color) && product.color.length > 0;

  const handleColorSelect = (color: ColorInfo) => {
    setSelectedColor(color);
  };

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-h-[90vh] overflow-y-auto p-4 md:p-6 max-w-4xl mx-auto">
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted border">
        <Image
          src={primaryImageUrl}
          alt={product.name ?? "Product Image"}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 90vw, 40vw"
          priority={true}
        />
      </div>

      <div className="flex flex-col">
        <DialogTitle className="text-xl md:text-2xl font-semibold capitalize mb-2">
          {product.name}
        </DialogTitle>

        <div className="mb-3">
          {canAddToCart ? (
            <Badge
              variant="outline"
              className="border-success/20 bg-success/5 text-primary"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              In Stock
            </Badge>
          ) : (
            <Badge variant="destructive">
              <X className="w-3.5 h-3.5 mr-1" /> Out of Stock
            </Badge>
          )}
        </div>

        {hasColorOptions && (
          <div className="mb-4">
            <p className="text-sm font-medium text-muted-foreground mb-1.5">
              Select Color:{" "}
              {selectedColor?.name && (
                <span className="font-semibold text-primary">
                  {selectedColor.name}
                </span>
              )}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {product.color &&
                product.color.filter(isColorInfo).map((colorInfo) => (
                  <button
                    key={colorInfo.name}
                    type="button"
                    aria-label={`Select color ${colorInfo.name}`}
                    onClick={() => handleColorSelect(colorInfo)}
                    className={`relative block w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-primary ${
                      selectedColor?.name === colorInfo.name
                        ? "border-primary ring-1 ring-primary"
                        : "border-transparent hover:border-input"
                    }`}
                    style={getColorStyle(colorInfo.hex)}
                    title={colorInfo.name}
                  >
                    {selectedColor?.name === colorInfo.name && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Check
                          className={`h-3 w-3 ${
                            colorInfo.hex &&
                            ["#000000", "#755237"].includes(
                              colorInfo.hex.toLowerCase()
                            )
                              ? "text-white"
                              : "text-foreground"
                          } mix-blend-difference`}
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

        <div className="mb-5">
          <span className="text-3xl font-semibold text-primary mr-2">
            {formatZAR(product.price)}
          </span>
          {product.compare_price && product.compare_price > product.price && (
            <span className="text-lg text-muted-foreground line-through">
              {formatZAR(product.compare_price)}
            </span>
          )}
        </div>

        <EnhancedAddToCart
          product={product}
          className="mb-5"
          selectedColor={selectedColor}
        />

        <div className="flex items-center gap-4 mb-5 text-sm text-muted-foreground">
          <button
            className={`flex items-center gap-1 hover:text-primary transition-colors ${
              isWishlistLoading ? "opacity-50 cursor-wait" : ""
            }`}
            onClick={handleToggleWishlist}
            disabled={isWishlistLoading || !user?.id}
            aria-label={`${
              isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${isInWishlist ? "fill-destructive text-destructive" : ""}`}
            />
            {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          </button>
          {/* <span className="text-gray-300">|</span>
          <button
            className="flex items-center gap-1 hover:text-primary transition-colors cursor-not-allowed opacity-50"
            disabled
          >
            <GitCompareArrows className="w-4 h-4" /> Compare
          </button> */}
        </div>

        {/* <div className="mb-6 p-3 bg-warning/5 border border-warning/30 rounded-md text-xs text-warning flex items-start gap-2">
          <ShoppingBag className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-semibold block">Other people want this.</span>
            <span>29 people have this in their carts right now.</span>
          </div>
        </div> */}
        <div className="mt-auto pt-4 border-t text-sm">
          <span className="font-medium text-foreground">Categories: </span>
          {Array.isArray(product.product_categories) &&
          product.product_categories.length > 0 ? (
            product.product_categories
              .filter((pc) => pc?.categories?.slug)
              .map((pc, index, arr) => (
                <span key={pc!.categories!.id}>
                  <Link
                    href={`/products/c/${pc!.categories!.slug}`}
                    className="text-primary hover:underline"
                    onClick={onClose}
                  >
                    {pc!.categories!.name}
                  </Link>
                  {index < arr.length - 1 && ", "}
                </span>
              ))
          ) : (
            <span className="text-muted-foreground">N/A</span>
          )}
        </div>
      </div>
    </div>
  );
}
