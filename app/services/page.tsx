"use client";
import PageHero from "@/components/common/page-hero";
import SectionHeading from "@/components/common/section-heading";

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
import { formatZAR } from "@/utils";

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get("service");
  const servicesScrollId = useScrollStore((state) => state.servicesScrollId);
  const clearServicesScrollId = useScrollStore(
    (state) => state.clearServicesScrollId,
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
    <div className="flex min-h-screen flex-col">
      <PageHero
        eyebrow="Treatments"
        title="Our Services"
        description="Enhance your natural beauty with our semi-permanent makeup services."
        image="/images/beauty.jpg"
      />

      {/* Services List */}
      <section className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <SectionHeading
            eyebrow="Menu"
            title="Treatments & pricing"
            description="Tap a treatment to see what's involved, then book a time that suits you."
          />
          <div className="mx-auto max-w-4xl">
            <Accordion
              type="single"
              collapsible
              className="w-full space-y-3"
              value={activeAccordion}
              onValueChange={handleAccordionChange}
            >
              {services.map((service) => (
                <AccordionItem
                  key={service.id}
                  value={service.id}
                  className="overflow-hidden rounded-xl border bg-card shadow-soft transition-shadow last:border-b data-[state=open]:shadow-elevated"
                  ref={(el) => {
                    serviceRefs.current[service.id] = el;
                  }}
                >
                  <AccordionTrigger className="items-center gap-4 px-4 py-4 hover:no-underline md:px-6">
                    <span className="flex min-w-0 flex-1 items-center gap-4">
                      <span className="relative hidden h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-secondary sm:block">
                        <Image
                          src={service.image || "/placeholder.svg"}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </span>
                      <span className="min-w-0 text-left">
                        <span className="block font-heading text-xl font-medium text-foreground md:text-2xl">
                          {service.name}
                        </span>
                        {service.category && (
                          <span className="eyebrow mt-0.5 block text-muted-foreground">
                            {service.category}
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="shrink-0 font-semibold text-primary">
                      {formatZAR(service.price)}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 md:px-6">
                    <div className="grid gap-6 border-t pb-2 pt-6 md:grid-cols-2 md:gap-8">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-secondary">
                        <Image
                          src={service.image || "/placeholder.svg"}
                          alt={service.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 420px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        {service.description && (
                          <p className="font-heading text-xl italic text-foreground">
                            {service.description}
                          </p>
                        )}
                        <p className="mt-3 leading-relaxed text-muted-foreground">
                          {service.details}
                        </p>
                        <div className="mt-6 flex items-center justify-between gap-4 border-t pt-6 md:mt-auto">
                          <div>
                            <p className="eyebrow text-muted-foreground">
                              From
                            </p>
                            <p className="font-heading text-3xl text-foreground">
                              {formatZAR(service.price)}
                            </p>
                          </div>
                          <Button asChild size="lg">
                            <Link href="/booking">Book now</Link>
                          </Button>
                        </div>
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
