import CartSkeleton from "@/components/cart/cart-skeleton";

export default function Loading() {
  return (
    <div className="p-4 container mx-auto my-8">
      <h1 className="text-3xl font-bold mb-8 text-center font-montserrat">
        Your Cart
      </h1>

      <CartSkeleton />
    </div>
  );
}
