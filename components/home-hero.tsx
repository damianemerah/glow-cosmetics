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
        bg-background
        isolate
        px-4 sm:px-6 lg:px-12 xl:px-24
        py-12 md:py-0
      "
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_20%_40%,var(--accent),transparent_70%),radial-gradient(ellipse_40%_40%_at_85%_20%,color-mix(in_oklch,var(--highlight)_18%,transparent),transparent_70%)]"
      />
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
        <p className="eyebrow mb-5 text-primary">Glow by UgoSylvia</p>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-medium mb-6 leading-[1.05] text-foreground">
          Reveal your{" "}
          <span className="italic text-primary">natural glow</span>
        </h1>
        <p className="text-base sm:text-lg max-w-lg mb-10 text-muted-foreground leading-relaxed">
          Discover bespoke beauty treatments and curated wellness products
          designed for your unique glow.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <Button asChild size="lg">
            <Link href="/booking">Book Your Experience</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/products">Shop the Collection</Link>
          </Button>
        </div>
        <div className="mt-10 flex items-center gap-4 sm:gap-6 text-[11px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span>Permanent Makeup</span>
          <span className="h-1 w-1 rounded-full bg-highlight" />
          <span>Lashes</span>
          <span className="h-1 w-1 rounded-full bg-highlight" />
          <span>Skincare</span>
        </div>
      </div>
    </section>
  );
}
