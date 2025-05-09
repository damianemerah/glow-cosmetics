import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import CheckoutForm from "@/components/checkout/checkout-form";
import { Metadata } from "next";
import type { CheckoutCartItem, ColorInfo } from "@/types";
import { AuthSessionMissingError } from "@supabase/supabase-js";
import { transformToAdditionalDetails } from "@/utils";
import CheckoutSkeleton from "@/components/checkout/checkout-skeleton";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Checkout | Glow Cosmetics",
  description: "Complete your purchase with Glow Cosmetics",
};

const isColorInfo = (colorJson: unknown): colorJson is ColorInfo => {
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

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Handle auth errors or missing user
  if (authError || !user?.id) {
    console.error(
      "Auth Error or No User:",
      authError instanceof AuthSessionMissingError
    );
    redirect("/?login=true");
  }
  const userId = user.id;

  const { data: cartData, error: cartError } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (cartError) {
    console.error(`Error fetching active cart for user ${userId}:`, cartError);
    redirect("/cart?error=cart_fetch_failed");
  }
  if (!cartData?.id) {
    redirect("/cart?message=empty_cart");
  }
  const cartId = cartData.id;

  const { data: cartItemsData, error: itemsError } = await supabase
    .from("cart_items")
    .select(
      `
        id,
        quantity,
        price_at_time,
        product_id,
        color,
        products (
          name,
          price,
          image_url
        )
      `
    )
    .eq("cart_id", cartId);

  if (itemsError) {
    console.error(`Error fetching cart items for cart ${cartId}:`, itemsError);
    redirect(`/cart?error=item_fetch_failed&cartId=${cartId}`);
  }

  if (!cartItemsData || cartItemsData.length === 0) {
    redirect("/cart?message=empty_cart");
  }

  const cartItems: CheckoutCartItem[] = cartItemsData
    .map((item) => {
      let parsedColor: ColorInfo | null = null;
      if (typeof item.color === "string") {
        try {
          const jsonParsed = transformToAdditionalDetails(item.color);
          if (isColorInfo(jsonParsed)) {
            parsedColor = jsonParsed;
          }
        } catch (e) {
          console.warn(
            "Failed to parse color JSON, treating as null:",
            item.color,
            e
          );
        }
      } else if (isColorInfo(item.color)) {
        parsedColor = item.color;
      } else if (item.color !== null) {
        console.warn("Unexpected color format, treating as null:", item.color);
      }

      const productData = item.products;

      return {
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_time: item.price_at_time,
        color: parsedColor, // Use the parsed color object or null
        products: item.products
          ? {
              // @ts-expect-error: we know item.products isn’t really an array here
              name: productData.name,
              // @ts-expect-error: we know item.image_url isn’t really an array here
              image_url: productData.image_url,
            }
          : null,
      };
    })
    .filter((item) => item.products !== null); // Ensure product data exists after mapping

  const initialTotalAmount = cartItems.reduce(
    (total, item) => total + item.price_at_time * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    redirect("/cart?message=cart_items_invalid");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 font-montserrat text-center">
        Checkout
      </h1>
      <Suspense fallback={<CheckoutSkeleton />}>
        <CheckoutForm
          userId={userId}
          cartId={cartId}
          cartItems={cartItems}
          initialTotalAmount={initialTotalAmount}
        />
      </Suspense>
    </div>
  );
}
