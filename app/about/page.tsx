import PageHero from "@/components/common/page-hero";
import SectionHeading from "@/components/common/section-heading";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Award, BadgeCheck, Heart, Smile, Sparkles } from "lucide-react";

const values = [
  {
    icon: Sparkles,
    title: "Quality",
    body: "We source our products from reputable manufacturers known for rigorous testing and proven quality, ensuring consistently exceptional results.",
  },
  {
    icon: Smile,
    title: "Integrity",
    body: "We believe in honesty and transparency in all our interactions, providing realistic expectations and personalized recommendations.",
  },
  {
    icon: Heart,
    title: "Care",
    body: "We genuinely care about our clients' well-being and strive to create a warm, welcoming environment where everyone feels valued and respected.",
  },
];

const highlights = [
  { value: "2005", label: "Nursing since" },
  { value: "MSN", label: "Walden University" },
  { value: "AANP", label: "Board certified" },
];

const credentials = [
  {
    title: "Bachelor of Science in Nursing",
    detail: "University of Toledo, 2005",
  },
  {
    title: "Master of Science in Nursing",
    detail: "Walden University, 2016",
  },
  {
    title: "Board Certification",
    detail: "American Association of Nurse Practitioners",
  },
  {
    title: "Advanced Injectable Training",
    detail: "Certified in advanced techniques for Botox and dermal fillers",
  },
  {
    title: "Continuing Education",
    detail:
      "Regular participation in aesthetic medicine conferences and workshops",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PageHero
        eyebrow="Our Story"
        title="About Glow by UgoSylvia"
        description="Where beauty is more than skin deep, and expertise meets passion."
      />

      {/* Owner Section */}
      <section className="bg-background py-16 md:py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-5 lg:gap-16">
            <div className="lg:col-span-3">
              <p className="eyebrow mb-3 text-primary">Meet the founder</p>
              <h2 className="mb-8 font-heading text-3xl font-medium leading-tight md:text-5xl">
                Meet Sylvia, owner and Nurse Practitioner
              </h2>
              <div className="space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                <p>
                  Meet Sylvia, a dedicated Nurse Practitioner with a rich
                  history in nursing since her graduation from the University of
                  Toledo in 2005. Her journey continued with a master&apos;s
                  degree in science in nursing, culminating in her graduation
                  from Walden University in 2016.
                </p>
                <p>
                  Sylvia holds board certification from the American Association
                  of Nurse Practitioners, a testament to her commitment to
                  excellence.
                </p>
                <p>
                  Sylvia&apos;s diverse professional background encompasses
                  roles in urgent care, emergency medicine, hospital medicine,
                  and infectious diseases, showcasing her versatility and
                  expertise in various healthcare domains. While initially
                  seeking into medical aesthetics as a respite from traditional
                  medicine, Sylvia&apos;s passion for the field grew. This
                  passion led her to make a career shift, by launching Glow by
                  UgoSylvia and embracing the world of medical aesthetics
                  full-time.
                </p>
              </div>
              <div className="mt-10">
                <Button asChild size="lg">
                  <Link href="/booking">Book a consultation</Link>
                </Button>
              </div>
            </div>

            <figure className="relative isolate overflow-hidden rounded-2xl bg-primary p-8 text-primary-foreground shadow-elevated md:p-12 lg:col-span-2">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklch,var(--highlight)_35%,transparent),transparent_65%)]" />
              <Award className="mb-8 h-10 w-10 text-highlight" />
              <p className="font-heading text-2xl italic leading-snug md:text-3xl">
                Where beauty is more than skin deep, and expertise meets
                passion.
              </p>
              <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-primary-foreground/20 pt-6">
                {highlights.map(({ value, label }) => (
                  <div key={label}>
                    <dt className="sr-only">{label}</dt>
                    <dd className="font-heading text-2xl text-highlight md:text-3xl">
                      {value}
                    </dd>
                    <dd className="mt-1 text-xs text-primary-foreground/70">
                      {label}
                    </dd>
                  </div>
                ))}
              </dl>
            </figure>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="bg-secondary py-16 md:py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <SectionHeading
            eyebrow="What we stand for"
            title="Our mission & values"
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {values.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-xl border bg-card p-8 shadow-soft"
              >
                <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mb-3 font-heading text-2xl font-medium">
                  {title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credentials & Training */}
      <section className="bg-background py-16 md:py-24">
        <div className="container mx-auto max-w-4xl px-4">
          <SectionHeading eyebrow="Expertise" title="Credentials & training" />
          <ol className="relative space-y-8 border-l border-border pl-8 md:pl-10">
            {credentials.map(({ title, detail }) => (
              <li key={title} className="relative">
                <span className="absolute -left-[2.6rem] top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-background md:-left-[3.1rem]">
                  <BadgeCheck className="h-3.5 w-3.5" />
                </span>
                <p className="font-heading text-xl font-medium text-foreground">
                  {title}
                </p>
                <p className="mt-1 text-muted-foreground">{detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="relative isolate overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground md:px-16 md:py-24">
            <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklch,var(--highlight)_28%,transparent),transparent_60%)]" />
            <p className="eyebrow mb-4 text-highlight">Your glow starts here</p>
            <h2 className="mx-auto mb-10 max-w-2xl font-heading text-3xl font-medium leading-tight md:text-5xl">
              Ready to book your appointment?
            </h2>
            <Button
              asChild
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Link href="/booking">Get started</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
