"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/constants/ui";

import { Carousel, CarouselContent, CarouselItem } from "@/constants/ui";

import Autoplay from "embla-carousel-autoplay";

export default function HomeHero() {
  const images = ["/images/beauty.jpg", "/images/face-cream.png"];

  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  return (
    <section className="relative h-[65vh] text-white overflow-hidden">
      <Carousel
        plugins={[plugin.current]}
        className="absolute inset-0 z-0"
        opts={{
          loop: true,
        }}
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {images.map((src, index) => (
            <CarouselItem key={index}>
              <div className="relative h-[75vh] md:h-[85vh]">
                <Image
                  src={src}
                  alt={`Hero background slide ${index + 1}`}
                  fill
                  className="object-cover object-center"
                  priority={index === 0}
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center z-10">
        <div className="max-w-xl md:max-w-2xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 tracking-tight font-montserrat leading-tight">
            Elevate Your Radiance
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-200">
            Discover bespoke beauty treatments and curated wellness products
            designed for your unique glow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Link href="/booking">Book Your Experience</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white bg-white/10 backdrop-blur-sm hover:bg-white/20"
            >
              <Link href="/products">Shop Our Collection</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
