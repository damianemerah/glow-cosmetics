"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
} from "@/constants/ui/index";
import { services } from "@/constants/data";
import CustomerReviews from "@/components/customer-reviews";
import { useScrollStore } from "@/store/scrollStore";

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get("service");
  const servicesScrollId = useScrollStore((state) => state.servicesScrollId);
  const clearServicesScrollId = useScrollStore(
    (state) => state.clearServicesScrollId
  );
  const [activeAccordion, setActiveAccordion] = useState<string>("");

  const serviceRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  // Handle initial load and servicesScrollId from external navigation
  useEffect(() => {
    // If servicesScrollId is present (from external page), update URL to the corresponding slug
    if (servicesScrollId && !serviceParam) {
      const service = services.find((s) => s.id === servicesScrollId);
      if (service) {
        window.history.replaceState(null, "", `?service=${service.slug}`);
        clearServicesScrollId();
      }
    }
  }, [servicesScrollId, serviceParam, clearServicesScrollId]);

  // Handle scrolling and accordion state based on serviceParam
  useEffect(() => {
    if (serviceParam) {
      const service = services.find((s) => s.slug === serviceParam);
      if (service) {
        setActiveAccordion(service.id);
        setTimeout(() => {
          const serviceElement = serviceRefs.current[service.id];
          if (serviceElement) {
            serviceElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 300);
      }
    }
  }, [serviceParam]);

  // Update URL when accordion is manually toggled
  const handleAccordionChange = (value: string) => {
    const service = services.find((s) => s.id === value);
    if (service) {
      window.history.replaceState(null, "", `?service=${service.slug}`);
    }
    setActiveAccordion(value);
  };

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
            <Accordion
              type="single"
              collapsible
              className="w-full"
              value={activeAccordion}
              onValueChange={handleAccordionChange}
            >
              {services.map((service) => (
                <AccordionItem
                  key={service.id}
                  value={service.id}
                  ref={(el) => {
                    serviceRefs.current[service.id] = el;
                  }}
                >
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
    </div>
  );
}
