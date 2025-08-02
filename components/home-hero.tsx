"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/constants/ui"; // Assuming this path is correct
import { useScroll } from "@/context/ScrollContext";

export default function HomeHero() {
  const heroRef = useRef<HTMLElement>(null);
  const { setHeroHeight } = useScroll();

  useEffect(() => {
    if (heroRef.current) {
      setHeroHeight(heroRef.current.offsetHeight);
    }
  }, [setHeroHeight]);

  return (
    <section
      ref={heroRef}
      className="
        relative
        flex flex-col md:flex-row
        items-center
        justify-center
        w-full
        min-h-[80vh] md:min-h-screen
        overflow-hidden
        bg-cover
        bg-center
        px-4 sm:px-6 lg:px-12 xl:px-24
        py-12 md:py-0
      "
      style={{
        backgroundImage: `url('/images/hero-bg.png')`,
      }}
    >
      <div
        className="
          relative
          w-full md:w-1/2
         h-[50vh] md:h-[80vh] lg:h-[90vh]
          flex-shrink-0
          mb-8 md:mb-0 md:mr-6 lg:mr-12
          order-1 md:order-1
        "
      >
        <Image
          src="/images/hero-person.png"
          alt="Glow Cosmetics model"
          fill
          className="object-contain object-center"
          priority
          sizes="(max-width: 767px) 100vw, 50vw"
        />
      </div>

      {/* Text Content Container */}
      {/* On mobile (flex-col), this is the bottom item. On desktop (flex-row), this is the right item. */}
      <div
        className="
          w-full md:w-1/2
          z-10
          flex flex-col
          items-center md:items-start
          justify-center
          text-center md:text-left
          order-2 md:order-2
        "
      >
        <p className="text-secondary-foreground tracking-widest font-bold text-sm sm:text-base lg:text-lg mb-2">
          Glow By Ugosylvia
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 tracking-tight font-montserrat leading-tight">
          <span className="text-primary">Glow</span>{" "}
          <span className="text-primary/60">Cosmetics</span>
        </h1>
        <p className="text-base sm:text-lg lg:text-xl max-w-xl md:max-w-none mb-8 text-gray-500">
          Discover bespoke beauty treatments and curated wellness products
          designed for your unique glow.
        </p>
        <div className="flex gap-4 w-auto">
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground w-auto" // Full width on mobile for buttons
          >
            <Link href="/booking">Book Your Experience</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10 hover:text-primary w-auto"
          >
            <Link href="/products">Shop Our Collection</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
