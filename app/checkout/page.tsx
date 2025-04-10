import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import CheckoutForm from "@/components/checkout/checkout-form";
import OrderSummary from "@/components/checkout/order-summary";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | Glow Cosmetics",
  description: "Complete your purchase with Glow Cosmetics",
};

// Define types for cart items
interface CartItemRaw {
  id: string;
  quantity: number;
  price_at_time: number;
  product_id: string;
  products: {
    name: string;
    price: number;
    image_url?: string[];
  };
}

interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  image_url?: string;
}

export default async function CheckoutPage() {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  // Redirect if not logged in
  if (!userId) {
    redirect("/?redirect=/checkout");
  }

  // Get the active cart for the user
  const { data: cartData, error: cartError } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .single();
  // .eq("status", "active")

  if (cartError) {
    console.log(cartError, "cartError");
    // No active cart found or error
    if (cartError.code === "PGRST116") {
      redirect("/cart");
    }
    console.error("Error fetching cart:", cartError);
    // Handle other errors
  }

  // Get the cart items
  const { data: rawCartItems, error: itemsError } =
    cartData?.id &&
    (await supabase
      .from("cart_items")
      .select(
        `
        id,
        quantity,
        price_at_time,
        product_id,
        products (
          name,
          price,
          image_url
        )
      `
      )
      .eq("cart_id", cartData.id));

  if (itemsError) {
    console.log(itemsError, "itemsError");
    console.error("Error fetching cart items:", itemsError);
    // Handle error
  }

  // If cart is empty, redirect to cart page
  if (!rawCartItems || rawCartItems.length === 0) {
    console.log("No cart items");
    redirect("/cart");
  }

  // Transform the cart items to the expected format
  const cartItems: CartItem[] = rawCartItems.map((item: CartItemRaw) => ({
    id: item.id,
    product_id: item.product_id,
    product_name: item.products.name, // Map from nested object
    quantity: item.quantity,
    price: item.price_at_time, // Use price_at_time as price
    image_url: item.products.image_url ? item.products.image_url[0] : undefined,
  }));

  // Calculate total amount with proper type annotations
  const totalAmount = cartItems.reduce(
    (total: number, item: CartItem) => total + item.price * item.quantity,
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
