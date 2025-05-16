"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Heart,
  ShoppingCart,
  Eye,
  Loader2,
  // GitCompareArrows,
} from "lucide-react";
import {
  Badge,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/constants/ui/index";
import type {
  ProductWithCategories,
  CartItemInputData,
  ColorInfo,
} from "@/types/index";
import { formatZAR } from "@/utils";
import { useUserStore } from "@/store/authStore";
import { addToCart } from "@/actions/cartAction";
import { ProductQuickView } from "@/components/product/productQuickView";
import { toggleWishlistItem } from "@/actions/wishlistActions";
import { useWishlistStatus } from "@/lib/swr/wishlist";
import { mutate } from "swr";
import { useCartStore } from "@/store/cartStore";

interface ProductCardProps {
  product: ProductWithCategories;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function isValidColorInfo(obj: any): obj is ColorInfo {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.name === "string" &&
    typeof obj.hex === "string"
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const user = useUserStore((state) => state.user);
  const setShowModal = useUserStore((state) => state.setShowModal);
  const [imageUrl, setImageUrl] = useState<string>(
    product.image_url && product.image_url.length > 0
      ? product.image_url[0]
      : "/placeholder.svg"
  );

  const {
    data: isInWishlist,
    mutate: mutateWishlist,
    isValidating: isWishlistLoading,
  } = useWishlistStatus(user?.id, product.id);

  const addOrUpdateOfflineItem = useCartStore(
    (state) => state.addOrUpdateOfflineItem
  );

  useEffect(() => {
    if (isHovered && product.image_url.length > 1) {
      const hoverImageUrl = product.image_url[1];
      setImageUrl(hoverImageUrl);
    }
  }, [isHovered, product.image_url]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAddingToCart(true);
    try {
      const firstValidColor =
        Array.isArray(product.color) &&
        product.color.length > 0 &&
        isValidColorInfo(product.color[0])
          ? product.color[0] // If it's an array and the first item is valid ColorInfo
          : null;

      if (!user) {
        // Handle offline cart
        const productDetails = {
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          stock_quantity: product.stock_quantity,
        };

        addOrUpdateOfflineItem(product.id, 1, firstValidColor, productDetails);
        toast.success(`Added to offline cart. Will sync when you log in.`);
        return;
      }

      const cartProduct: CartItemInputData = {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        color: firstValidColor, // Assign the extracted (or null) color
      };
      const result = await addToCart(user.id, cartProduct, 1);
      if (result.success) {
        toast.success(`Added to cart!`);
        mutate(`cart-count-${user.user_id}`);
      } else {
        toast.warning(result.error || "Failed to add item to cart.");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.warning("Could not add item to cart.");
    } finally {
      setIsAddingToCart(false);
    }
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
        mutateWishlist();
      } else {
        toast.warning(result.error || "Failed to update wishlist");
      }
    } catch (error) {
      console.error("Wishlist toggle error:", error);
      toast.warning("Could not update wishlist");
    }
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.id) {
      setShowModal(true);
      toast.info("Please log in to proceed to checkout.");
      return;
    }
    setIsBuyingNow(true);
    try {
      const firstValidColor =
        Array.isArray(product.color) &&
        product.color.length > 0 &&
        isValidColorInfo(product.color[0])
          ? product.color[0]
          : null;

      const cartProduct: CartItemInputData = {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        color: firstValidColor,
      };
      const result = await addToCart(user.id, cartProduct, 1);

      if (result.success || result.error === "Item already in cart") {
        router.push("/checkout");
      } else {
        toast.warning(result.error || "Failed to add item before checkout.");
      }
    } catch (error) {
      console.error("Buy Now error:", error);
      toast.warning("Could not proceed to checkout.");
    } finally {
      setIsBuyingNow(false);
    }
  };

  const calculateDiscountPercentage = (
    price: number,
    comparePrice: number | null
  ) => {
    if (!comparePrice || comparePrice <= price) return null;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <TooltipProvider delayDuration={100}>
        <div
          className="group relative border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative w-full overflow-hidden bg-gray-100">
            <div style={{ paddingTop: "110%" }} />
            <div className="absolute inset-0">
              <Link
                href={`/products/${product.slug}`}
                className="absolute inset-0 z-0"
              >
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </Link>
              <div className="absolute top-4 left-4">
                {product.is_bestseller && (
                  <Badge className="bg-green-500 mr-3">Bestseller</Badge>
                )}
                {calculateDiscountPercentage(
                  product.price,
                  product.compare_price
                ) && (
                  <Badge className="bg-red-500">
                    {calculateDiscountPercentage(
                      product.price,
                      product.compare_price
                    )}
                    % OFF
                  </Badge>
                )}
              </div>

              {/* Wishlist & Actions Overlay */}
              {user && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={`absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full shadow-md hover:bg-red-100 text-gray-500 hover:text-red-500 transition-colors ${
                        isWishlistLoading ? "opacity-50 cursor-wait" : ""
                      }`}
                      title={
                        isInWishlist
                          ? "Remove from Wishlist"
                          : "Add to Wishlist"
                      }
                      disabled={isWishlistLoading}
                      onClick={handleToggleWishlist}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isInWishlist ? "fill-red-500 text-red-500" : ""
                        }`}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {isInWishlist
                        ? "Remove from Wishlist"
                        : "Add to Wishlist"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}

              <div className="absolute bottom-0 left-0 right-0 z-10 p-2 flex justify-center items-center space-x-2 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Add to Cart */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="bg-white/80 hover:bg-white text-primary rounded-full shadow"
                      onClick={handleAddToCart}
                      disabled={isAddingToCart || product.stock_quantity <= 0}
                      aria-label="Add to cart"
                    >
                      {isAddingToCart ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShoppingCart className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add to Cart</p>
                  </TooltipContent>
                </Tooltip>

                {/* Quick View */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="bg-white/80 hover:bg-white text-primary rounded-full shadow"
                        aria-label="Quick view"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Quick View</p>
                  </TooltipContent>
                </Tooltip>

                {/* Compare (disabled) */}
                {/* <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="bg-white/80 hover:bg-white text-primary rounded-full shadow cursor-not-allowed opacity-60"
                      disabled
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Compare"
                    >
                      <GitCompareArrows className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Compare (Coming Soon)</p>
                  </TooltipContent>
                </Tooltip> */}
              </div>
            </div>
          </div>

          <div className="p-4 flex flex-col flex-grow">
            <Link
              href={`/products/${product.slug}`}
              className="hover:text-primary"
            >
              <h3 className="font-medium text-sm leading-snug mb-1 truncate capitalize">
                {product.name}
              </h3>
            </Link>

            <div className="mt-auto">
              <p className="text-lg font-semibold text-gray-800 mb-3">
                {formatZAR(product.price)}
                {product.compare_price &&
                  product.compare_price > product.price && (
                    <span className="ml-2 text-sm text-gray-400 line-through">
                      {formatZAR(product.compare_price)}
                    </span>
                  )}
              </p>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleBuyNow}
                disabled={
                  isBuyingNow || isAddingToCart || product.stock_quantity <= 0
                }
              >
                {isBuyingNow && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </TooltipProvider>

      <DialogContent className="sm:max-w-[1000px] p-0">
        <ProductQuickView
          product={product}
          onClose={() => setIsDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
