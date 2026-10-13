"use client";

import React, { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/constants/ui";

interface Review {
  id: number;
  name: string;
  initials: string;
  reviewText: string;
  sourceLink?: string;
  rating?: number;
}

const reviews: Review[] = [
  {
    id: 1,
    name: "Vee Masbae",
    initials: "VM",
    reviewText:
      "Professional, cheerful, and humble. Explains procedures clearly. Impressed with her work and my brows. Thank you Sly.",
    rating: 5,
  },
  {
    id: 2,
    name: "Mpumi Waxa",
    initials: "MW",
    reviewText:
      "I recommend her she's got magic touch and she is passionate about her work I'm happy with the results ♥️.",
    sourceLink: "https://www.facebook.com/share/p/183Cs2Kaiq/",
    rating: 5,
  },
  {
    id: 3,
    name: "Seipati Ntsoane",
    initials: "SN",
    reviewText:
      "Waking up won't be the same again got a magic touch...thanks for the great job.",
    sourceLink: "https://www.facebook.com/share/p/1EgbU4GExA/",
    rating: 5,
  },
  {
    id: 4,
    name: "Sandra Kombelwa",
    initials: "SK",
    reviewText:
      "she was gentle and all went well. am happy with the service 😊 I was scared for nothing!",
    sourceLink: "https://www.facebook.com/share/p/193s6MumgC/",
    rating: 5,
  },
];

export default function CustomerReviews() {
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  return (
    <section className="py-16 md:py-24 bg-secondary text-foreground">
      <div className="container mx-auto px-4">
        <p className="eyebrow w-full justify-center text-primary">Kind Words</p>
        <Carousel
          plugins={[plugin.current]}
          className="w-full max-w-3xl mx-auto"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent>
            {reviews.map((review) => (
              <CarouselItem key={review.id} className="text-center">
                <div className="pt-12 pb-24 px-2 md:py-12 md:px-10">
                  <p className="text-2xl md:text-3xl lg:text-4xl font-serif italic leading-relaxed md:leading-snug mb-8 text-foreground">
                    &quot;{review.reviewText}&quot;
                  </p>
                  <h3 className="font-sans text-sm uppercase tracking-[0.2em] font-semibold text-foreground/80">
                    {review.name}
                  </h3>
                  {review.sourceLink && (
                    <a
                      href={review.sourceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline transition-colors mt-2 inline-block"
                    >
                      View Review
                    </a>
                  )}
                  {review.rating && (
                    <div className="flex justify-center mt-3">
                      {[...Array(review.rating)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-5 h-5 text-highlight"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* Below the quote on mobile so they never cover the text; beside it from md up. */}
          <CarouselPrevious className="absolute top-auto bottom-6 left-[calc(50%-3.25rem)] translate-y-0 md:top-1/2 md:bottom-auto md:left-[-50px] md:-translate-y-1/2 h-11 w-11 md:h-12 md:w-12 rounded-full border-primary/30 bg-transparent text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-30" />
          <CarouselNext className="absolute top-auto bottom-6 right-[calc(50%-3.25rem)] translate-y-0 md:top-1/2 md:bottom-auto md:right-[-50px] md:-translate-y-1/2 h-11 w-11 md:h-12 md:w-12 rounded-full border-primary/30 bg-transparent text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-30" />
        </Carousel>
      </div>
    </section>
  );
}
