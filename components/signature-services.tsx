// @/components/services/signature-services.tsx (or similar file)

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card"; // Assuming Card components are here
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Image from "next/image";

// Assume your service type now includes videoUrl:
interface Service {
  id: string;
  name: string;
  description: string;
  image?: string; // Keep image for poster/fallback
  videoUrl?: string; // Add video URL property
  // ... other properties
}

interface SignatureServicesProps {
  services: Service[];
}

export default function SignatureServices({
  services,
}: SignatureServicesProps) {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="uppercase text-4xl font-bold mb-10 md:mb-12 text-center font-serif text-secondary-foreground">
          Signature Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {services.slice(0, 3).map((service) => (
            <Card
              key={service.id}
              className="overflow-hidden border-none shadow-lg bg-card text-card-foreground flex flex-col"
            >
              {/* Added overflow-hidden and a background color for loading state */}
              <div className="relative h-52 md:h-64 overflow-hidden bg-muted">
                {service.videoUrl ? (
                  <video
                    // Use a key derived from the src for potential updates
                    key={service.videoUrl}
                    src={service.videoUrl}
                    // Use the static image as a poster (placeholder while loading)
                    poster={service.image || "/images/placeholder-poster.jpg"}
                    className="absolute inset-0 w-full h-full object-cover object-center" // Style to fill the container
                    autoPlay // Start playing automatically
                    loop // Loop the video
                    muted // MUST be muted for autoplay to work reliably
                    playsInline // Important for playback on mobile (iOS)
                    preload="metadata" // Load only metadata initially - faster start
                    // Controls are typically hidden for background/UI videos
                    controls={false} // Optional: Show controls if you want
                    // onContextMenu={(e) => e.preventDefault()} // Disable right-click context menu
                  >
                    {/* Fallback text for browsers that don't support the video tag */}
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  // Fallback to static image if no video URL is provided
                  // You might need to import Image again if you use this fallback
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-muted-foreground">
                    {/* Optional: Placeholder text/icon or use next/image here */}
                    {service.image ? (
                      <Image
                        src={service.image || "/images/pic5.jpg"}
                        alt={service.name}
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <span>No Preview</span>
                    )}
                  </div>
                )}
              </div>
              {/* --- END VIDEO CONTAINER --- */}

              <CardContent className="p-5 md:p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold mb-2 font-serif">
                  {service.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-3">
                  {service.description}
                </p>
                <Button asChild variant="outline" className="w-full mt-auto">
                  <Link
                    href={`/services#${service.id}`}
                    className="flex items-center justify-center"
                  >
                    Discover More <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button asChild variant="default" size="lg">
            <Link href="/services">Explore All Services</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
