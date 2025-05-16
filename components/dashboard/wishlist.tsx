"use client";

import useSWR, { useSWRConfig } from "swr"; // Added useSWRConfig
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Card, CardTitle, Skeleton, Badge } from "@/constants/ui/index";
import { createClient } from "@/utils/supabase/client";
import { ShoppingCart, HeartOff, AlertTriangle } from "lucide-react";
import { addToCart } from "@/actions/cartAction";
import { useUserStore } from "@/store/authStore";
import { toast } from "sonner";
import { CartItemInputData } from "@/types";

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
      "id, user_id, product_id, created_at, products:products(id, name, price, image_url, slug, stock_quantity, is_bestseller, compare_price)"
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
          `Wishlist item ${item.id} has no associated product data. Creating fallback.`
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
  <Card className="overflow-hidden">
    <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr_auto] md:grid-cols-[120px_1fr_auto] gap-4 p-4 items-center">
      <Skeleton className="h-24 w-24 sm:h-28 sm:w-28 rounded-md bg-muted" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4 bg-muted" />
        <Skeleton className="h-4 w-1/2 bg-muted" />
        <Skeleton className="h-4 w-1/4 bg-muted" />
      </div>
      <div className="flex flex-col sm:items-end space-y-2 mt-2 sm:mt-0">
        <Skeleton className="h-8 w-28 md:w-32 bg-muted rounded-md" />
        <Skeleton className="h-8 w-20 md:w-24 bg-muted rounded-md" />
      </div>
    </div>
  </Card>
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
        false // Don't revalidate immediately
      );
    } else {
      toast.error("Failed to remove item from wishlist.");
      console.error("Error removing from wishlist:", deleteError);
      mutate(); // Revalidate to get correct server state
    }
    setIsProcessing((prev) => ({ ...prev, [processingKey]: false }));
  };

  const handleAddToCart = async (product: WishlistItemProduct) => {
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
        await handleRemoveFromWishlist(product.id);
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
    quantity: number
  ): {
    text: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  } => {
    if (quantity <= 0) return { text: "Out of Stock", variant: "destructive" };
    if (quantity < 10) return { text: "Low Stock", variant: "secondary" };
    return { text: "In Stock", variant: "default" };
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-6">
          My Wishlist
        </h1>
        {[1, 2, 3].map((i) => (
          <WishlistSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6 bg-background rounded-lg border border-destructive/50">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive mb-2">
          Oops! Something went wrong.
        </h2>
        <p className="text-muted-foreground mb-4">
          We couldn&apos;t load your wishlist at this moment. Please try again
          later.
        </p>
        <Button onClick={() => mutate()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6 bg-background rounded-lg border">
        <HeartOff className="h-16 w-16 text-muted-foreground mb-6" />
        <h2 className="text-2xl font-semibold mb-2">Your Wishlist is Empty</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Looks like you haven&apos;t added any products to your wishlist yet.
          Start exploring and save your favorites!
        </p>
        <Link href="/products" passHref>
          <Button size="lg">Explore Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1 sm:p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">
        My Wishlist
      </h1>
      {wishlistItems.map((item) => {
        const product = item.products;
        const imageUrl = Array.isArray(product.image_url)
          ? product.image_url[0]
          : product.image_url;
        const stock = getStockStatus(product.stock_quantity);
        const cartProcessingKey = `cart-${product.id}`;
        const removeProcessingKey = `remove-${item.id}`;

        return (
          <Card
            key={item.id}
            className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr_auto] md:grid-cols-[120px_1fr_auto] items-center gap-4 p-4">
              {/* Image */}
              <Link
                href={`/products/${product.slug}`}
                passHref
                className="block"
              >
                <div className="aspect-square w-full max-w-[100px] sm:max-w-none bg-muted rounded-md overflow-hidden relative">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100px, 120px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      priority={false}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-secondary text-muted-foreground">
                      <ShoppingCart className="h-8 w-8" />
                    </div>
                  )}
                </div>
              </Link>

              {/* Product Info */}
              <div className="flex flex-col justify-center">
                <Link href={`/products/${product.slug}`} passHref>
                  <CardTitle className="text-base sm:text-lg font-medium hover:text-primary transition-colors line-clamp-2">
                    {product.name}
                  </CardTitle>
                </Link>

                <div className="flex items-center gap-2 mt-1 mb-2">
                  <p className="text-lg sm:text-xl font-semibold text-primary">
                    ${product.price.toFixed(2)}
                  </p>
                  {product.compare_price &&
                    product.compare_price > product.price && (
                      <p className="text-sm text-muted-foreground line-through">
                        ${product.compare_price.toFixed(2)}
                      </p>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 items-center text-xs">
                  <Badge variant={stock.variant} className="capitalize">
                    {stock.text}
                  </Badge>
                  {product.is_bestseller && (
                    <Badge
                      variant="secondary"
                      className="bg-amber-400 text-amber-900 hover:bg-amber-500"
                    >
                      Bestseller
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:items-end gap-2 mt-2 sm:mt-0">
                <Button
                  size="sm"
                  onClick={() => handleAddToCart(product)}
                  disabled={
                    isProcessing[cartProcessingKey] ||
                    product.stock_quantity <= 0
                  }
                  className="w-full sm:w-auto"
                  aria-label={`Add ${product.name} to cart`}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {isProcessing[cartProcessingKey]
                    ? "Adding..."
                    : product.stock_quantity <= 0
                      ? "Out of Stock"
                      : "Add to Cart"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                  disabled={isProcessing[removeProcessingKey]}
                  onClick={() => handleRemoveFromWishlist(item.id)}
                  aria-label={`Remove ${product.name} from wishlist`}
                >
                  <HeartOff className="mr-2 h-4 w-4" />
                  {isProcessing[removeProcessingKey] ? "Removing..." : "Remove"}
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
