import { Metadata } from "next";
import { getCartWithItems } from "@/actions/cartAction";
import { createClient } from "@/utils/supabase/server";
import CartClient from "@/components/cart/cart-client";
import CartSkeleton from "@/components/cart/cart-skeleton";
import { Suspense } from "react";
import type { CartItem } from "@/types/index";

export const metadata: Metadata = {
  title: "Your Cart | Glow by UgoSylvia",
  description: "View and manage your shopping cart at Glow by UgoSylvia.",
};

export const dynamic = "force-dynamic";

// Cart content component that fetches data
async function CartContent({ userId }: { userId: string }) {
  const { cart: cartData, items } = await getCartWithItems(userId);

  const typedItems = (items || []) as CartItem[];

  return (
    <CartClient initialCart={cartData || null} initialCartItems={typedItems} />
  );
}

export default async function CartPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="p-4 container mx-auto my-8">
      <h1 className="text-3xl font-bold mb-8 text-center font-montserrat">
        Your Cart
      </h1>

      {user ? (
        <Suspense fallback={<CartSkeleton />}>
          <CartContent userId={user.id} />
        </Suspense>
      ) : (
        <CartClient initialCart={null} initialCartItems={[]} />
      )}
    </div>
  );
}
