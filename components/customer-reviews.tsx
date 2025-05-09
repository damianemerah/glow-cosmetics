// import React from "react";
// import { Carousel } from "@/constants/ui";

// export default function CustomerReviews() {
//   return (
//     <section className="py-16 bg-secondary">
//       <div className="container mx-auto px-4">
//         <h2 className="text-3xl font-bold mb-12 text-center font-montserrat">
//           What Our Clients Say
//         </h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           <div className="bg-white p-6 rounded-lg shadow-md">
//             <div className="flex items-center mb-4">
//               <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
//                 JD
//               </div>
//               <div className="ml-4">
//                 <a href="https://www.facebook.com/share/p/183Cs2Kaiq/">
//                   <h3 className="text-[#4a5a3a] font-semibold">Mpumi Waxa</h3>
//                 </a>
//                 <div className="flex">
//                   {[...Array(5)].map((_, i) => (
//                     <svg
//                       key={i}
//                       className="w-4 h-4 text-yellow-500"
//                       fill="currentColor"
//                       viewBox="0 0 20 20"
//                     >
//                       <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                     </svg>
//                   ))}
//                 </div>
//               </div>
//             </div>
//             <p className="italic">
//               &quot;I recommend her she&apos;s got magic touch and she is
//               passionate about her work I&apos;m happy with the results
//               ♥️.&quot;
//             </p>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow-md">
//             <div className="flex items-center mb-4">
//               <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
//                 SM
//               </div>
//               <div className="ml-4">
//                 <a href="https://www.facebook.com/share/p/1EgbU4GExA/">
//                   <h3 className="text-[#4a5a3a] font-semibold">
//                     Seipati Ntsoane
//                   </h3>
//                 </a>
//                 <div className="flex">
//                   {[...Array(5)].map((_, i) => (
//                     <svg
//                       key={i}
//                       className="w-4 h-4 text-yellow-500"
//                       fill="currentColor"
//                       viewBox="0 0 20 20"
//                     >
//                       <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                     </svg>
//                   ))}
//                 </div>
//               </div>
//             </div>
//             <p className="italic">
//               &quot;Waking up won&apos;t be the same again got a magic
//               touch...thanks for the great job.&quot;
//             </p>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow-md">
//             <div className="flex items-center mb-4">
//               <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
//                 RJ
//               </div>
//               <div className="ml-4">
//                 <a href="https://www.facebook.com/share/p/193s6MumgC/">
//                   <h3 className="text-[#4a5a3a] font-semibold">
//                     Sandra Kombelwa
//                   </h3>
//                 </a>
//                 <div className="flex">
//                   {[...Array(5)].map((_, i) => (
//                     <svg
//                       key={i}
//                       className="w-4 h-4 text-yellow-500"
//                       fill="currentColor"
//                       viewBox="0 0 20 20"
//                     >
//                       <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                     </svg>
//                   ))}
//                 </div>
//               </div>
//             </div>
//             <p className="italic">
//               &quot;she was gentle and all went well. am happy with the service
//               😊 I was scared for nothing!&quot;
//             </p>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

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
    <section className="py-16 md:py-24 bg-[#5a6b47] text-white">
      <div className="container mx-auto px-4">
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
                <div className="py-12 px-6 md:px-10">
                  <p className="text-2xl md:text-3xl lg:text-4xl font-serif italic leading-relaxed md:leading-loose mb-8 text-gray-100">
                    &quot;{review.reviewText}&quot;
                  </p>
                  <h3 className="text-xl md:text-2xl font-montserrat font-semibold text-gray-200">
                    - {review.name}
                  </h3>
                  {review.sourceLink && (
                    <a
                      href={review.sourceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-300 hover:text-white transition-colors mt-2 inline-block"
                    >
                      View Review
                    </a>
                  )}
                  {review.rating && (
                    <div className="flex justify-center mt-3">
                      {[...Array(review.rating)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-5 h-5 text-yellow-400"
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
          <CarouselPrevious className="absolute left-[-15px] md:left-[-50px] top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#5a6b47] border-none h-12 w-12 rounded-full disabled:opacity-30" />
          <CarouselNext className="absolute right-[-15px] md:right-[-50px] top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#5a6b47] border-none h-12 w-12 rounded-full disabled:opacity-30" />
        </Carousel>
      </div>
    </section>
  );
}
