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
    <div className="container mx-auto px-4 pb-20 pt-10 md:pt-14">
      <div className="mb-8 md:mb-10">
        <p className="eyebrow text-primary">Shopping bag</p>
        <h1 className="mt-2 font-heading text-4xl font-medium text-foreground md:text-5xl">
          Your cart
        </h1>
      </div>

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
