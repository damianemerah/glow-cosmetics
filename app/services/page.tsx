import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ServicesPage() {
  const services = [
    {
      id: "wrinkle-relaxer",
      title: "Wrinkle Relaxer",
      description:
        "Reduce the appearance of fine lines and wrinkles with our wrinkle relaxer treatments.",
      price: "$300+",
      image: "/placeholder.svg?height=400&width=600",
      details:
        "Our wrinkle relaxer treatments use FDA-approved neurotoxins to temporarily reduce muscle activity, smoothing out wrinkles and preventing new ones from forming. Results typically last 3-4 months.",
    },
    {
      id: "lip-facial-filler",
      title: "Lip/Facial Filler",
      description:
        "Add volume and definition to your lips and face with our premium dermal fillers.",
      price: "$500+",
      image: "/placeholder.svg?height=400&width=600",
      details:
        "Dermal Fillers help to soften the appearance of facial lines and restore volume in the face. They can help improve aesthetic imperfections, plump lips, enhance contours, and soften facial creases. It creates some immediate improvements, but you will continue to see enhancement to your appearance as the filler stimulates the production of collagen and continues to rejuvenate your skin, smoothing lines and adding youthful volume.",
    },
    {
      id: "microneedling",
      title: "Microneedling",
      description:
        "Stimulate collagen production and improve skin texture with microneedling.",
      price: "$250+",
      image: "/placeholder.svg?height=400&width=600",
      details:
        "Microneedling is a minimally invasive cosmetic procedure that involves using fine needles to create tiny punctures in the skin. This triggers the body&apos;s natural wound healing process, resulting in increased collagen and elastin production. Benefits include improved skin texture, reduced scarring, and a more youthful appearance.",
    },
    {
      id: "derma-peel",
      title: "The Perfect Derma Peel",
      description:
        "Reveal brighter, smoother skin with our professional chemical peels.",
      price: "$200+",
      image: "/placeholder.svg?height=400&width=600",
      details:
        "Our derma peels use a blend of powerful ingredients to exfoliate the skin, remove dead skin cells, and stimulate new cell growth. The result is improved skin tone, texture, and a reduction in fine lines, wrinkles, and hyperpigmentation.",
    },
    {
      id: "prf-microneedling",
      title: "PRF Microneedling",
      description:
        "Combine the benefits of microneedling with platelet-rich fibrin for enhanced results.",
      price: "$350+",
      image: "/placeholder.svg?height=400&width=600",
      details:
        "PRF Microneedling combines traditional microneedling with platelet-rich fibrin derived from your own blood. The PRF contains growth factors that accelerate healing and stimulate collagen production, resulting in improved skin texture, reduced scarring, and a more youthful appearance.",
    },
    {
      id: "teeth-whitening",
      title: "Teeth Whitening",
      description:
        "Brighten your smile with our professional teeth whitening services.",
      price: "$150+",
      image: "/placeholder.svg?height=400&width=600",
      details:
        "Our professional teeth whitening treatments use safe, effective bleaching agents to remove stains and discoloration from your teeth. The result is a brighter, whiter smile that can boost your confidence and enhance your overall appearance.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] bg-secondary">
        <div className="absolute inset-0">
          <Image
            src="/placeholder.svg?height=400&width=1200"
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
            <p className="text-xl md:text-2xl">
              Explore a variety of non-surgical, aesthetic treatments and
              injectables or book a consultation.
            </p>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {services.map((service) => (
                <AccordionItem key={service.id} value={service.id}>
                  <AccordionTrigger className="text-xl font-montserrat py-4">
                    {service.title}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid md:grid-cols-2 gap-6 py-4">
                      <div className="relative h-64 md:h-auto">
                        <Image
                          src={service.image || "/placeholder.svg"}
                          alt={service.title}
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
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center font-montserrat">
            What Our Clients Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  JD
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold">Jane Doe</h3>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="italic">
                &quot;I&apos;ve been coming here for my lip fillers for over a
                year now. The results are always natural-looking and the staff
                is incredibly professional.&quot;
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  SM
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold">Sarah Miller</h3>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="italic">
                &quot;The microneedling treatment completely transformed my
                skin. My acne scars have faded significantly and my skin looks
                more youthful.&quot;
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  RJ
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold">Robert Johnson</h3>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="italic">
                &quot;I was hesitant to try wrinkle relaxers, but the team made
                me feel comfortable and the results look so natural. I
                couldn&apos;t be happier!&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#5a6b47] text-white">
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
