import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProductCTA() {
  return (
    <section className="py-16 md:py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6 font-heading">
          Have questions about our products?
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Our beauty experts are here to help you find the perfect products for
          your needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            <Link href="/contact">Contact Us</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Link href="/booking">Book a Consultation</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
