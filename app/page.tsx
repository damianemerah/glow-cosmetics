import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ChevronRight } from "lucide-react";

export default function Home() {
  const services = [
    {
      title: "Brow & Lash Treatments",
      description:
        "Enhance your natural beauty with our professional brow and lash services.",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      title: "Facial Treatments",
      description:
        "Rejuvenate your skin with our customized facial treatments.",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      title: "Injectables",
      description:
        "Smooth fine lines and restore volume with our injectable treatments.",
      image: "/placeholder.svg?height=300&width=400",
    },
  ];

  const products = [
    {
      name: "Hydrating Lip Gloss",
      price: "$24.99",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Vitamin C Serum",
      price: "$49.99",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Collagen Supplements",
      price: "$39.99",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Gentle Cleanser",
      price: "$29.99",
      image: "/placeholder.svg?height=300&width=300",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] bg-secondary">
        <div className="absolute inset-0">
          <Image
            src="/placeholder.svg?height=600&width=1200"
            alt="Beauty treatment"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-montserrat">
              Beauty & Wellness
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Where beauty is more than skin deep, and expertise meets passion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-green-500 hover:bg-green-600"
              >
                <Link href="/booking">Book Your Appointment</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 text-white border-white hover:bg-white/20"
              >
                <Link href="/services">Explore Services</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 font-montserrat">
              Welcome to Glow by Sylvia
            </h2>
            <p className="text-lg mb-8">
              We are a premier beauty and wellness destination offering a range
              of services including brow and lash treatments, facial services,
              and quality skincare products. Our mission is to help you look and
              feel your best.
            </p>
            <Button asChild className="bg-green-500 hover:bg-green-600">
              <Link href="/about">Learn More About Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center font-montserrat">
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card
                key={index}
                className="overflow-hidden border-none shadow-lg"
              >
                <div className="relative h-64">
                  <Image
                    src={service.image || "/placeholder.svg"}
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 font-montserrat">
                    {service.title}
                  </h3>
                  <p className="mb-4">{service.description}</p>
                  <Button asChild variant="outline" className="w-full">
                    <Link
                      href="/services"
                      className="flex items-center justify-center"
                    >
                      Learn More <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild className="bg-green-500 hover:bg-green-600">
              <Link href="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center font-montserrat">
            Featured Products
          </h2>
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent>
              {products.map((product, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="border-none shadow-md">
                    <div className="relative h-64">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-4 text-center">
                      <h3 className="font-medium mb-1 font-montserrat">
                        {product.name}
                      </h3>
                      <p className="text-green-500 font-semibold mb-3">
                        {product.price}
                      </p>
                      <Button className="w-full bg-green-500 hover:bg-green-600">
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
          <div className="text-center mt-12">
            <Button asChild className="bg-green-500 hover:bg-green-600">
              <Link href="/products">Shop All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#5a6b47] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 font-montserrat">
            Ready to Book Your Appointment?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Transform your look and boost your confidence with our professional
            beauty and wellness services.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-[#5a6b47] hover:bg-gray-100"
          >
            <Link href="/booking">Book Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
