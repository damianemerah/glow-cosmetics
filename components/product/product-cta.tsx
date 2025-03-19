import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProductCTA() {
  return (
    <section className="py-16 bg-[#5a6b47] text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6 font-montserrat">
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
            className="bg-white text-[#5a6b47] hover:bg-gray-100"
          >
            <Link href="/contact">Contact Us</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white/10"
          >
            <Link href="/booking">Book a Consultation</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
