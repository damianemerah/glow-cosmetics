"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { htmlToText } from "html-to-text";
import { ShoppingCart, Eye, Loader2 } from "lucide-react";
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

interface ProductCardListProps {
  product: ProductWithCategories;
}

export function ProductCardList({ product }: ProductCardListProps) {
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
  const plainShortDescription = product.short_description
    ? htmlToText(product.short_description, {
        wordwrap: 130,
        selectors: [
          { selector: "a", options: { ignoreHref: true } },
          { selector: "img", format: "skip" },
        ],
      }).trim()
    : "No description available.";

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
        setIsBuyingNow(false);
      }
    } catch (error) {
      console.error("Buy Now error:", error);
      toast.error("Could not proceed to checkout.");
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

  const discountPercentage = calculateDiscountPercentage(
    product.price,
    product.compare_price
  );
  const hasStock = product.stock_quantity > 0;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <TooltipProvider delayDuration={100}>
        <div className="group relative border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300 p-4 flex flex-col md:flex-row gap-4">
          <div className="relative w-full h-48 md:w-48 md:h-auto md:aspect-square flex-shrink-0 overflow-hidden rounded-md bg-gray-50">
            <Link
              href={`/products/${product.slug}`}
              className="absolute inset-0 z-10"
              aria-label={`View details for ${product.name}`}
            />
            <Image
              src={primaryImageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
              sizes="(max-width: 767px) 100vw, 192px"
            />
            <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
              {product.is_bestseller && (
                <Badge variant="default" className="bg-green-600 text-white">
                  Bestseller
                </Badge>
              )}
              {discountPercentage && (
                <Badge variant="destructive">-{discountPercentage}%</Badge>
              )}
              {!hasStock && <Badge variant="outline">Out of Stock</Badge>}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex-grow mb-3">
              <Link
                href={`/products/${product.slug}`}
                className="hover:text-primary transition-colors"
              >
                <h3 className="text-base md:text-lg font-medium leading-tight mb-1 capitalize line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                {plainShortDescription}
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-lg font-semibold text-gray-800">
                  {formatZAR(product.price)}
                </p>
                {product.compare_price &&
                  product.compare_price > product.price && (
                    <p className="text-sm text-gray-400 line-through">
                      {formatZAR(product.compare_price)}
                    </p>
                  )}
              </div>
            </div>

            <div className="mt-auto flex flex-wrap gap-2 items-center">
              <Button
                size="sm"
                variant={hasStock ? "default" : "outline"}
                className="flex-grow xs:flex-grow-0 bg-primary/90 hover:bg-primary disabled:bg-gray-300"
                onClick={handleAddToCart}
                disabled={isAddingToCart || isBuyingNow || !hasStock}
                aria-label={hasStock ? "Add to cart" : "Product out of stock"}
              >
                {isAddingToCart ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : hasStock ? (
                  <ShoppingCart className="mr-2 h-4 w-4" />
                ) : null}
                {hasStock ? "Add to Cart" : "Out of Stock"}
              </Button>

              {hasStock && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-grow xs:flex-grow-0"
                  onClick={handleBuyNow}
                  disabled={isBuyingNow || isAddingToCart}
                  aria-label="Buy now"
                >
                  {isBuyingNow && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Buy Now
                </Button>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto xs:ml-0"
                      aria-label="Quick view"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDialogOpen(true);
                      }}
                    >
                      <Eye className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Quick View</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </TooltipProvider>

      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden">
        <ProductQuickView
          product={product}
          onClose={() => setIsDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
