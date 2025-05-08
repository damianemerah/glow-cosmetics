import Image from "next/image";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
} from "@/constants/ui/index";
import { services } from "@/constants/data";
import CustomerReviews from "@/components/customer-reviews";

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] bg-secondary">
        <div className="absolute inset-0">
          <Image
            src="/images/beauty.jpg"
            alt="Beauty services"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-montserrat">
              Our Services
            </h1>
            <p className="text-xl md:text-2xl italic">
              Enhance your natural beauty with our semi permanent makeup
              service.
            </p>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* <h2 className="text-lg md:text-2xl font-bold mb-10 md:mb-12 text-center font-montserrat italic max-w-2xl mx-auto">
            Enhance your natural beauty with our semi permanent makeup service.
          </h2> */}
          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {services.map((service) => (
                <AccordionItem key={service.id} value={service.id}>
                  <AccordionTrigger className="text-xl font-montserrat py-4">
                    {service.name}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid md:grid-cols-2 gap-6 py-4">
                      <div className="relative h-64 md:h-auto">
                        <Image
                          src={service.image || "/placeholder.svg"}
                          alt={service.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div>
                        <p className="mb-4">{service.details}</p>
                        <p className="text-xl font-semibold mb-6">
                          {service.price}
                        </p>
                        <Button
                          asChild
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Link href="/booking">Book Now</Link>
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <CustomerReviews />

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-t from-[#4a5a3a] to-[#5a6b47]/80 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 font-montserrat">
            Ready to book your consult or appointment?
          </h2>
          <Button
            asChild
            size="lg"
            className="bg-white text-[#5a6b47] hover:bg-gray-100"
          >
            <Link href="/booking">Get Started Here!</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
