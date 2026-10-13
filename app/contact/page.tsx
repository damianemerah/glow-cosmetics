"use client";
import PageHero from "@/components/common/page-hero";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { Button, Input, Label, Textarea } from "@/constants/ui/index";
import SectionHeading from "@/components/common/section-heading";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { sendClientEmail } from "@/actions/clientActions";
import { toast } from "sonner";

const contactDetails = [
  {
    icon: MapPin,
    title: "Our location",
    lines: ["4 Westminster Close, Bryanston", "Sandton, Gauteng 2196"],
  },
  {
    icon: Phone,
    title: "Phone",
    lines: ["+27781470504"],
    href: "tel:+27781470504",
  },
  {
    icon: Mail,
    title: "Email",
    lines: ["sylvia_emerah@yahoo.com"],
    href: "mailto:sylvia_emerah@yahoo.com",
  },
  {
    icon: Clock,
    title: "Business hours",
    lines: [
      "Monday - Friday: 9:00 AM - 6:00 PM",
      "Saturday: 8:00 AM - 6:00 PM",
      "Sunday: Closed",
    ],
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); // Disable button, show loading state

    try {
      // Call the server action
      const result = await sendClientEmail(formData);

      if (result.success) {
        toast.success("Message sent! We'll get back to you soon.");
        // Reset the form on successful submission
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        // Handle specific error returned from the action
        console.error("Failed to send message:", result.error);
        toast.warning(
          result.error || "Failed to send message. Please try again.",
        );
      }
    } catch (error) {
      // Catch unexpected errors during the action call itself
      console.error("Error submitting contact form:", error);
      toast.error("An unexpected error occurred. Please try again later."); // Use toast.error for unexpected issues
    } finally {
      setIsSubmitting(false); // Re-enable button
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <PageHero
        eyebrow="Get in Touch"
        title="Contact Us"
        description="We'd love to hear from you. Get in touch with our team."
        image="/images/contact-bg.jpg"
      />

      {/* Contact Form & Info Section */}
      <section className="bg-background py-16 md:py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-14">
            {/* Contact Form */}
            <div className="rounded-xl border bg-card p-6 shadow-soft md:p-10 lg:col-span-3">
              <p className="eyebrow mb-2 text-primary">Write to us</p>
              <h2 className="mb-8 font-heading text-3xl font-medium md:text-4xl">
                Send us a message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="lg:col-span-2">
              <p className="eyebrow mb-2 text-primary">Visit or call</p>
              <h2 className="mb-8 font-heading text-3xl font-medium md:text-4xl">
                Contact information
              </h2>
              <ul className="divide-y rounded-xl border bg-card">
                {contactDetails.map(({ icon: Icon, title, lines, href }) => (
                  <li key={title} className="flex items-start gap-4 p-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 text-sm">
                      <h3 className="mb-1 font-semibold text-foreground">
                        {title}
                      </h3>
                      {lines.map((line) =>
                        href ? (
                          <a
                            key={line}
                            href={href}
                            className="block break-words text-muted-foreground transition-colors hover:text-primary"
                          >
                            {line}
                          </a>
                        ) : (
                          <p key={line} className="text-muted-foreground">
                            {line}
                          </p>
                        ),
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-secondary py-16 md:py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <SectionHeading eyebrow="Bryanston, Sandton" title="Find us" />
          <div className="relative h-[400px] overflow-hidden rounded-xl border shadow-elevated">
            <iframe
              title="Glow by UgoSylvia on Google Maps"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3584.0542924795564!2d28.019232400000003!3d-26.064482!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e9573878dbb82d7%3A0x2b8692048198867c!2s4%20Westminster%20Ave%2C%20Bryanston%2C%20Sandton%2C%202191%2C%20South%20Africa!5e0!3m2!1sen!2sro!4v1746123412209!5m2!1sen!2sro"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative isolate overflow-hidden bg-primary py-20 text-primary-foreground md:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklch,var(--highlight)_28%,transparent),transparent_60%)]" />
        <div className="container mx-auto px-4 text-center">
          <p className="eyebrow mb-4 text-highlight">Ready when you are</p>
          <h2 className="mx-auto mb-10 max-w-2xl font-heading text-3xl font-medium leading-tight md:text-5xl">
            No questions? Go straight to booking.
          </h2>
          <Button
            asChild
            size="lg"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            <Link href="/booking">Book your appointment</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
