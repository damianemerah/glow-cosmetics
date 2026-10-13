"use client";

import useSWR, { useSWRConfig } from "swr"; // Added useSWRConfig
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Skeleton, Badge } from "@/constants/ui/index";
import { createClient } from "@/utils/supabase/client";
import { ShoppingCart, Heart, HeartOff, AlertTriangle } from "lucide-react";
import { addToCart } from "@/actions/cartAction";
import { useUserStore } from "@/store/authStore";
import { toast } from "sonner";
import { CartItemInputData } from "@/types";
import { formatZAR } from "@/utils";
import EmptyState from "./empty-state";

// Define Types
type WishlistItemProduct = {
  id: string;
  name: string;
  price: number;
  image_url: string[] | null;
  slug: string;
  stock_quantity: number;
  is_bestseller?: boolean;
  compare_price?: number | null;
};

type WishlistResponse = {
  id: string; // Wishlist item ID
  user_id: string;
  product_id: string;
  created_at: string;
  products: WishlistItemProduct;
};

// SWR Fetcher Function
const fetcher = async (): Promise<WishlistResponse[]> => {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return []; // Return empty if no user, or throw to let SWR handle error
  }

  const { data, error } = await supabase
    .from("wishlists")
    .select(
      "id, user_id, product_id, created_at, products:products(id, name, price, image_url, slug, stock_quantity, is_bestseller, compare_price)",
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching wishlist:", error);
    throw error;
  }

  const formattedData =
    data?.map((item) => {
      const initialProductFromSupabase = Array.isArray(item.products)
        ? item.products[0]
        : item.products;

      let finalProcessedProduct: WishlistItemProduct;

      if (!initialProductFromSupabase) {
        console.warn(
          `Wishlist item ${item.id} has no associated product data. Creating fallback.`,
        );
        finalProcessedProduct = {
          id: item.product_id,
          name: "Product Not Found",
          price: 0,
          image_url: [],
          slug: "#",
          stock_quantity: 0,
          is_bestseller: false,
          compare_price: null,
        };
      } else {
        finalProcessedProduct = {
          id: initialProductFromSupabase.id,
          name: initialProductFromSupabase.name,
          price: initialProductFromSupabase.price,
          image_url: initialProductFromSupabase.image_url || [],
          slug: initialProductFromSupabase.slug,
          stock_quantity: initialProductFromSupabase.stock_quantity,
          is_bestseller: initialProductFromSupabase.is_bestseller ?? false,
          compare_price: initialProductFromSupabase.compare_price ?? null,
        };
      }

      return {
        id: item.id,
        user_id: item.user_id,
        product_id: item.product_id,
        created_at: item.created_at,
        products: finalProcessedProduct,
      };
    }) || [];

  return formattedData as WishlistResponse[];
};

// Skeleton Component (Exported for potential use in Suspense fallbacks)
export const WishlistSkeleton = () => (
  <div>
    <Skeleton className="aspect-[4/5] w-full rounded-xl" />
    <Skeleton className="mt-3 h-4 w-3/4" />
    <Skeleton className="mt-2 h-4 w-1/3" />
    <Skeleton className="mt-3 h-9 w-full rounded-md" />
  </div>
);

// Main Wishlist Component
export default function Wishlist() {
  const user = useUserStore((state) => state.user);
  const {
    data: wishlistItems,
    error,
    isLoading,
    mutate, // SWR's mutate function for this specific key
  } = useSWR<WishlistResponse[]>("userWishlist", fetcher);

  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});
  const { mutate: mutateGlobal } = useSWRConfig();

  const handleRemoveFromWishlist = async (wishlistItemId: string) => {
    const processingKey = `remove-${wishlistItemId}`;
    setIsProcessing((prev) => ({ ...prev, [processingKey]: true }));
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("wishlists")
      .delete()
      .eq("id", wishlistItemId);

    if (!deleteError) {
      toast.success("Item removed from wishlist!");
      mutate(
        // Optimistic update for this SWR key
        (currentData) =>
          currentData?.filter((item) => item.id !== wishlistItemId) || [],
        false, // Don't revalidate immediately
      );
    } else {
      toast.error("Failed to remove item from wishlist.");
      console.error("Error removing from wishlist:", deleteError);
      mutate(); // Revalidate to get correct server state
    }
    setIsProcessing((prev) => ({ ...prev, [processingKey]: false }));
  };

  const handleAddToCart = async (
    product: WishlistItemProduct,
    wishlistItemId: string,
  ) => {
    if (!user?.id) {
      // Check for user and user.id
      toast.error("Please log in to add items to your cart.");
      return;
    }

    const processingKey = `cart-${product.id}`;
    setIsProcessing((prev) => ({ ...prev, [processingKey]: true }));

    try {
      const itemData: CartItemInputData = {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url ? product.image_url : [],
        color: null,
      };

      const result = await addToCart(user.id, itemData);

      if (result.success) {
        mutateGlobal(`cart-count-${user.id}`);
        await handleRemoveFromWishlist(wishlistItemId);
        toast.success(`${product.name} added to cart!`);
      } else {
        toast.error(result.error || "Failed to add item to cart.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred while adding to cart.");
      console.error("Error adding to cart:", error);
    } finally {
      setIsProcessing((prev) => ({ ...prev, [processingKey]: false }));
    }
  };

  const getStockStatus = (
    quantity: number,
  ): {
    text: string;
    variant: "success" | "warning" | "destructive";
  } => {
    if (quantity <= 0) return { text: "Out of Stock", variant: "destructive" };
    if (quantity < 10) return { text: "Low Stock", variant: "warning" };
    return { text: "In Stock", variant: "success" };
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
        {[1, 2, 3].map((i) => (
          <WishlistSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-center">
        <AlertTriangle className="mb-4 h-10 w-10 text-destructive" />
        <h3 className="mb-2 font-heading text-xl font-medium text-foreground">
          Something went wrong
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          We couldn&apos;t load your wishlist right now. Please try again.
        </p>
        <Button onClick={() => mutate()} variant="outline">
          Try again
        </Button>
      </div>
    );
  }

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Your wishlist is empty"
        description="Tap the heart on any product to save it here for later."
        action={{ label: "Explore products", href: "/products" }}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6">
      {wishlistItems.map((item) => {
        const product = item.products;
        const imageUrl = Array.isArray(product.image_url)
          ? product.image_url[0]
          : product.image_url;
        const stock = getStockStatus(product.stock_quantity);
        const cartProcessingKey = `cart-${product.id}`;
        const removeProcessingKey = `remove-${item.id}`;

        return (
          <div key={item.id} className="group flex flex-col">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-secondary">
              <Link
                href={`/products/${product.slug}`}
                className="absolute inset-0"
                aria-label={product.name}
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 300px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <ShoppingCart className="h-8 w-8" />
                  </div>
                )}
              </Link>
              {product.is_bestseller && (
                <Badge variant="highlight" className="absolute left-3 top-3">
                  Bestseller
                </Badge>
              )}
              <button
                type="button"
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-card/90 text-destructive shadow-soft backdrop-blur transition-colors hover:bg-card disabled:opacity-50"
                disabled={isProcessing[removeProcessingKey]}
                onClick={() => handleRemoveFromWishlist(item.id)}
                aria-label={`Remove ${product.name} from wishlist`}
                title="Remove from wishlist"
              >
                <HeartOff className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-1 flex-col pt-3">
              <Link
                href={`/products/${product.slug}`}
                className="line-clamp-2 text-sm font-medium capitalize text-foreground transition-colors hover:text-primary md:text-base"
              >
                {product.name}
              </Link>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <p className="font-semibold text-primary">
                  {formatZAR(product.price)}
                </p>
                {product.compare_price &&
                  product.compare_price > product.price && (
                    <p className="text-sm text-muted-foreground line-through">
                      {formatZAR(product.compare_price)}
                    </p>
                  )}
                <Badge variant={stock.variant} className="ml-auto">
                  {stock.text}
                </Badge>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddToCart(product, item.id)}
                disabled={
                  isProcessing[cartProcessingKey] || product.stock_quantity <= 0
                }
                className="mt-3 w-full"
                aria-label={`Add ${product.name} to cart`}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {isProcessing[cartProcessingKey]
                  ? "Adding..."
                  : product.stock_quantity <= 0
                    ? "Out of Stock"
                    : "Move to Cart"}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
