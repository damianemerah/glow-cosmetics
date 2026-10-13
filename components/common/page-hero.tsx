import Image from "next/image";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  image?: string;
  video?: { src: string; poster?: string };
  className?: string;
}

/**
 * Shared hero band for top-level pages. Renders over an optional image or
 * video with a brand-tinted scrim, or as a solid primary band when no media
 * is given.
 */
export default function PageHero({
  eyebrow,
  title,
  description,
  image,
  video,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative isolate flex min-h-[320px] items-end overflow-hidden bg-primary text-primary-foreground md:min-h-[420px]",
        className
      )}
    >
      <div className="absolute inset-0 -z-10">
        {image && (
          <Image
            src={image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        {video && (
          <video
            src={video.src}
            poster={video.poster}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div
          className={cn(
            "absolute inset-0",
            image || video
              ? "bg-gradient-to-t from-primary via-primary/70 to-primary/20 md:bg-gradient-to-r md:from-primary/95 md:via-primary/60 md:to-primary/10"
              : "bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklch,var(--highlight)_30%,transparent),transparent_60%)]"
          )}
        />
      </div>

      <div className="container mx-auto pb-12 pt-24 md:pb-16">
        <div className="max-w-2xl">
          {eyebrow && <p className="eyebrow mb-4 text-highlight">{eyebrow}</p>}
          <h1 className="text-4xl font-medium leading-[1.1] md:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-base text-primary-foreground/80 md:text-lg">
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
