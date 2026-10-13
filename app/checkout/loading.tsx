import CheckoutSkeleton from "@/components/checkout/checkout-skeleton";

export default function CheckoutLoading() {
  return (
    <div className="container mx-auto px-4 pb-20 pt-10 md:pt-14">
      <div className="mb-8 md:mb-10">
        <p className="eyebrow text-primary">Secure checkout</p>
        <h1 className="mt-2 font-heading text-4xl font-medium text-foreground md:text-5xl">
          Checkout
        </h1>
      </div>
      <CheckoutSkeleton />
    </div>
  );
}
