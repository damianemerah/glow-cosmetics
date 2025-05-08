import Link from "next/link";
import {
  Card,
  CardContent,
  Button,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/constants/ui"; // Assuming all UI components are here
import { ChevronRight } from "lucide-react";
import Image from "next/image";

interface Service {
  id: string;
  name: string;
  description: string;
  image?: string; // Image URL property
  // Removed videoUrl property
  // ... other properties
}

interface SignatureServicesProps {
  services: Service[];
}

export default function SignatureServices({
  services,
}: SignatureServicesProps) {
  // Ensure services is an array before slicing
  const servicesToDisplay = Array.isArray(services) ? services.slice(0, 6) : [];

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="uppercase text-3xl md:text-4xl font-bold mb-10 md:mb-12 md:text-start text-center font-montserrat text-secondary-foreground">
          Signature Services
        </h2>

        <Carousel
          opts={{
            align: "start",
            loop: servicesToDisplay.length > 3,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {servicesToDisplay.map((service, index) => (
              <CarouselItem
                key={service.id || index}
                className="pl-4 md:basis-1/2 lg:basis-1/3"
              >
                <div className="p-1 h-full">
                  <Card className="overflow-hidden border-none shadow-lg bg-card text-card-foreground flex flex-col h-full">
                    {/* --- Simplified Image Section --- */}
                    <div className="relative h-52 md:h-64 overflow-hidden bg-muted">
                      {service.image ? ( // Check if image exists
                        <Image
                          // Use a unique key if image URLs might change dynamically
                          // key={service.image}
                          src={service.image} // Use the service image directly
                          alt={service.name}
                          fill // Use fill to cover the container
                          className="object-cover" // Ensure image covers the area
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Responsive image sizes
                          priority={index < 3} // Prioritize loading images visible initially
                        />
                      ) : (
                        // Fallback if no image is provided
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-muted-foreground">
                          <span>No Preview Available</span>{" "}
                          {/* Or a placeholder icon */}
                        </div>
                      )}
                    </div>
                    {/* --- End Simplified Image Section --- */}

                    <CardContent className="p-5 md:p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-semibold mb-2 font-montserrat">
                        {service.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-3">
                        {service.description}
                      </p>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full mt-auto"
                      >
                        <Link
                          href={`/services#${service.id}`}
                          className="flex items-center justify-center"
                        >
                          Discover More{" "}
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-[-15px] md:left-[-25px]" />
          <CarouselNext className="absolute right-[-15px] md:right-[-25px]" />
        </Carousel>

        <div className="text-center mt-12">
          <Button asChild variant="default" size="lg">
            <Link href="/services">Explore All Services</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
