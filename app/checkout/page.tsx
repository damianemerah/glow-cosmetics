import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
// Ensure this path points to the refactored combined component file
import CheckoutComponent from "@/components/checkout/checkout-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | Glow Cosmetics",
  description: "Complete your purchase with Glow Cosmetics",
};

// Type for data directly from Supabase query
interface CartItemRaw {
  id: string;
  quantity: number;
  price_at_time: number;
  product_id: string;
  // This MUST match the shape returned by the query: an OBJECT, not an array
  products: {
    name: string;
    price: number; // Current price from products table
    image_url?: string[] | null;
  } | null; // Allow products to be potentially null if the relation fails or product deleted
}

// Type expected by the CheckoutComponent (and OrderSummary)
interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number; // This will be price_at_time
  image_url?: string;
}

export default async function CheckoutPage() {
  const supabase = await createClient();

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    redirect("/login?redirect=/checkout");
  }
  const userId = user.id;

  // Get active cart
  const { data: cartData, error: cartError } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (cartError) {
    console.error("Error fetching cart:", cartError);
    redirect("/cart?error=cart_fetch_failed");
  }
  if (!cartData?.id) {
    console.log("No active cart found for user:", userId);
    redirect("/cart?message=empty_cart");
  }
  const cartId = cartData.id;

  // Get cart items using the fetched cartId
  const { data: rawCartItemsData, error: itemsError } = await supabase
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
    .eq("cart_id", cartId);

  if (itemsError) {
    console.error("Error fetching cart items:", itemsError);
    redirect(`/cart?error=item_fetch_failed&cartId=${cartId}`);
  }

  if (!rawCartItemsData || rawCartItemsData.length === 0) {
    console.log("Cart is empty, redirecting.");
    redirect("/cart?message=empty_cart");
  }

  // FIX: Apply type assertion here
  const rawCartItems = rawCartItemsData as unknown as CartItemRaw[];

  // Transform cart items
  const cartItems: CartItem[] = rawCartItems
    .filter((item): item is CartItemRaw => item.products !== null)
    .map((item) => ({
      id: item.id,
      product_id: item.product_id,
      product_name: item.products!.name,
      quantity: item.quantity,
      price: item.price_at_time,
      image_url: item.products!.image_url?.[0] ?? undefined,
    }));

  // Recalculate initial total amount based on potentially filtered items
  const initialTotalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Add a final check if filtering removed all items
  if (cartItems.length === 0) {
    console.log("All cart items missing product data, redirecting.");
    redirect("/cart?message=cart_items_invalid");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {" "}
      {/* Original container */}
      <h1 className="text-2xl font-bold mb-6 font-montserrat text-center">
        {" "}
        {/* Original H1 */}
        Checkout
      </h1>
      {/* Original Grid Layout */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Render the single combined component, passing needed props */}
        <CheckoutComponent
          userId={userId}
          cartId={cartId}
          cartItems={cartItems}
          initialTotalAmount={initialTotalAmount}
        />
        {/* The CheckoutComponent will internally render the necessary parts
            which we will then structure correctly in its own file.
            Or, more cleanly, CheckoutComponent renders the parts and this
            page places them. Let's go with the cleaner approach.
         */}
      </div>
    </div>
  );
}
