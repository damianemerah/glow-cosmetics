"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import {
  Button,
  Input,
  Label,
  Textarea,
  Card,
  CardContent,
} from "@/constants/ui/index";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { sendClientEmail } from "@/actions/clientActions";
import { toast } from "sonner";

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
          result.error || "Failed to send message. Please try again."
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
    <div className="flex flex-col min-h-screen ">
      {/* Hero Section */}
      <section className="relative h-[300px] bg-secondary">
        <div className="absolute inset-0">
          <Image
            src="/images/contact-bg.jpg"
            alt="Contact us"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-montserrat">
              Contact Us
            </h1>
            <p className="text-xl md:text-2xl">
              We&apos;d love to hear from you. Get in touch with our team.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <h2 className="text-2xl font-bold mb-6 font-montserrat">
                  Send us a message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
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
                      type="subject"
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
                    className="w-full bg-green-500 hover:bg-green-600"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-2xl font-bold mb-6 font-montserrat">
                  Contact Information
                </h2>
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <MapPin className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                        <div>
                          <h3 className="font-semibold mb-1">Our Location</h3>
                          <p>4 Westminster Close, Bryanston</p>
                          <p>Sandton, Gauteng 2196</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <Phone className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                        <div>
                          <h3 className="font-semibold mb-1">Phone</h3>
                          <p>+27781470504</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <Mail className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                        <div>
                          <h3 className="font-semibold mb-1">Email</h3>
                          <p>sylvia_emerah@yahoo.com</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <Clock className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                        <div>
                          <h3 className="font-semibold mb-1">Business Hours</h3>
                          <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                          <p>Saturday: 8:00 AM - 6:00 PM</p>
                          <p>Sunday: Closed</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center font-montserrat">
            Find Us
          </h2>
          <div className="max-w-6xl mx-auto h-[400px] relative rounded-lg overflow-hidden shadow-lg">
            <iframe
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
      <section className="py-16 md:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 font-montserrat">
            Don&apos;t have any questions? Go straight to booking!
          </h2>
          <Button
            asChild
            size="lg"
            className="bg-white text-[#5a6b47] hover:bg-gray-100"
          >
            <a href="/booking">Book your appointment</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
