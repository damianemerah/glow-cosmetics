import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProductCTA() {
  return (
    <section className="relative isolate overflow-hidden bg-primary py-20 text-primary-foreground md:py-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklch,var(--highlight)_28%,transparent),transparent_60%)]" />
      <div className="container mx-auto px-4 text-center">
        <p className="eyebrow mb-4 text-highlight">Personal advice</p>
        <h2 className="mx-auto max-w-2xl font-heading text-3xl font-medium leading-tight md:text-5xl">
          Have questions about our products?
        </h2>
        <p className="mx-auto mb-10 mt-4 max-w-xl text-base text-primary-foreground/80 md:text-lg">
          Our beauty experts are here to help you find the perfect products for
          your skin and routine.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            <Link href="/contact">Contact us</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Link href="/booking">Book a consultation</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
