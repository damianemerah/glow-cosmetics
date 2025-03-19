import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import CheckoutForm from "@/components/checkout/checkout-form";
import OrderSummary from "@/components/checkout/order-summary";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | Glow Cosmetics",
  description: "Complete your purchase with Glow Cosmetics",
};

export default async function CheckoutPage() {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  // Redirect if not logged in
  if (!userId) {
    redirect("/login?redirect=/checkout");
  }

  // Get the active cart for the user
  const { data: cartData, error: cartError } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (cartError) {
    // No active cart found or error
    if (cartError.code === "PGRST116") {
      redirect("/cart"); // Redirect to cart page if no active cart
    }
    console.error("Error fetching cart:", cartError);
    // Handle other errors
  }

  // Get the cart items
  const { data: cartItems, error: itemsError } = await supabase
    .from("cart_items")
    .select("id, product_id, product_name, quantity, price, image_url")
    .eq("cart_id", cartData?.id);

  if (itemsError) {
    console.error("Error fetching cart items:", itemsError);
    // Handle error
  }

  // If cart is empty, redirect to cart page
  if (!cartItems || cartItems.length === 0) {
    redirect("/cart");
  }

  // Calculate total amount
  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 font-montserrat text-center">
        Checkout
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column - Forms */}
        <div>
          <CheckoutForm
            userId={userId}
            cartId={cartData?.id}
            cartItems={cartItems}
            totalAmount={totalAmount}
          />
        </div>

        {/* Right Column - Cart Summary */}
        <OrderSummary cartItems={cartItems} />
      </div>
    </div>
  );
}
