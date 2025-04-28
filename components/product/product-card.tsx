// src/components/products/ProductCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Heart,
  ShoppingCart,
  Eye,
  Loader2,
  GitCompareArrows,
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
import type { ProductWithCategories, CartProduct } from "@/types/index";
import { formatZAR } from "@/utils";
import { useUserStore } from "@/store/authStore";
import { addToCart } from "@/actions/cartAction";
import { ProductQuickView } from "@/components/product/productQuickView";

interface ProductCardProps {
  product: ProductWithCategories;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const user = useUserStore((state) => state.user);
  const setShowModal = useUserStore((state) => state.setShowModal);

  const primaryImageUrl =
    product.image_url && product.image_url.length > 0
      ? product.image_url[0]
      : "/placeholder.svg";

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.id) {
      setShowModal(true);
      toast.info("Please log in to add items to your cart.");
      return;
    }
    setIsAddingToCart(true);
    try {
      const cartProduct: CartProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
      };
      const result = await addToCart(user.id, cartProduct, 1);
      if (result.success) {
        toast.success(`${product.name} added to cart!`);
      } else {
        toast.error(result.error || "Failed to add item to cart.");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Could not add item to cart.");
    } finally {
      setIsAddingToCart(false);
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
      const cartProduct: CartProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
      };
      const result = await addToCart(user.id, cartProduct, 1);

      if (result.success || result.error === "Item already in cart") {
        router.push("/checkout");
      } else {
        toast.error(result.error || "Failed to add item before checkout.");
      }
    } catch (error) {
      console.error("Buy Now error:", error);
      toast.error("Could not proceed to checkout.");
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
        <div className="group relative border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
          <div className="relative w-full overflow-hidden bg-gray-100">
            <div style={{ paddingTop: "110%" }}></div>
            <div className="absolute inset-0">
              <Link
                href={`/products/${product.slug}`}
                className="absolute inset-0 z-0"
              >
                <Image
                  src={primaryImageUrl}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </Link>
              <div className="absolute top-4 left-4">
                {product.is_bestseller && (
                  <Badge className=" bg-green-500 mr-3">Bestseller</Badge>
                )}
                {calculateDiscountPercentage(
                  product.price,
                  product.compare_price
                ) && (
                  <Badge className=" bg-red-500">
                    {calculateDiscountPercentage(
                      product.price,
                      product.compare_price
                    )}
                    % OFF
                  </Badge>
                )}
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full shadow-md hover:bg-red-100 text-gray-500 hover:text-red-500 transition-colors cursor-not-allowed opacity-60"
                    title="Wishlist coming soon"
                    disabled
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add to Wishlist (Coming Soon)</p>
                </TooltipContent>
              </Tooltip>

              <div className="absolute bottom-0 left-0 right-0 z-10 p-2 flex justify-center items-center space-x-2 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="bg-white/80 hover:bg-white text-primary rounded-full shadow cursor-not-allowed opacity-60"
                      title="Compare coming soon"
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
                </Tooltip>
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
                {isBuyingNow ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
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
