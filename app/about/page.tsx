import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] bg-green-light">
        <div className="absolute inset-0">
          {/* <Image
            src="/placeholder.svg?height=400&width=1200"
            alt="About us"
            fill
            className="object-cover"
            priority
          /> */}
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-montserrat">
              About Glow by UgoSylvia
            </h1>
            <p className="text-xl md:text-2xl">
              Where beauty is more than skin deep, and expertise meets passion.
            </p>
          </div>
        </div>
      </section>

      {/* Owner Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 font-montserrat">
                  Meet Sylvia the Owner and Nurse Practitioner
                </h2>
                <div className="space-y-4">
                  <p>
                    Meet Sylvia, a dedicated Nurse Practitioner with a rich
                    history in nursing since her graduation from the University
                    of Toledo in 2005. Her journey continued with a
                    master&apos;s degree in science in nursing, culminating in
                    her graduation from Walden University in 2016.
                  </p>
                  <p>
                    Sylvia holds board certification from the American
                    Association of Nurse Practitioners, a testament to her
                    commitment to excellence.
                  </p>
                  <p>
                    Sylvia&apos;s diverse professional background encompasses
                    roles in urgent care, emergency medicine, hospital medicine,
                    and infectious diseases, showcasing her versatility and
                    expertise in various healthcare domains. While initially
                    seeking into medical aesthetics as a respite from
                    traditional medicine, Sylvia&apos;s passion for the field
                    grew. This passion led her to make a career shift, by
                    launching Glow by UgoSylvia and embracing the world of
                    medical aesthetics full-time.
                  </p>
                  {/* <p>
                    At the core of Sylvia&apos;s mission is the desire to empower
                    individuals, particularly women, to look and feel their
                    best. As a mother of four, she understands the importance of
                    self-care and recognizing that one cannot pour from an empty
                    cup. With Glow by UgoSylvia, Sylvia strives to provide a
                    rejuvenating experience that goes beyond aesthetics,
                    promoting overall well-being and confidence. Join Sylvia on
                    this transformative journey towards self-discovery and
                    self-love, where her expertise and genuine care converge to
                    enhance the beauty within.
                  </p> */}
                </div>
                <div className="mt-8">
                  <Button asChild className="bg-green-500 hover:bg-green-600">
                    <Link href="/booking">Book a Consultation</Link>
                  </Button>
                </div>
              </div>
              <div className="relative h-[500px] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/placeholder.svg?height=500&width=400"
                  alt="Sylvia - Owner and Nurse Practitioner"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16 bg-green-light">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 font-montserrat">
              Our Mission & Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 font-montserrat">
                  Quality
                </h3>
                <p>
                  We source our products from reputable manufacturers known for
                  rigorous testing and proven quality, ensuring consistently
                  exceptional results.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 font-montserrat">
                  Integrity
                </h3>
                <p>
                  We believe in honesty and transparency in all our
                  interactions, providing realistic expectations and
                  personalized recommendations.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 font-montserrat">Care</h3>
                <p>
                  We genuinely care about our clients&apos; well-being and
                  strive to create a warm, welcoming environment where everyone
                  feels valued and respected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credentials & Training */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center font-montserrat">
              Credentials & Training
            </h2>
            <div className="bg-green-light p-8 rounded-lg">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-3 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  <div>
                    <p className="font-semibold">
                      Bachelor of Science in Nursing
                    </p>
                    <p className="text-sm">University of Toledo, 2005</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-3 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  <div>
                    <p className="font-semibold">
                      Master of Science in Nursing
                    </p>
                    <p className="text-sm">Walden University, 2016</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-3 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  <div>
                    <p className="font-semibold">Board Certification</p>
                    <p className="text-sm">
                      American Association of Nurse Practitioners
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-3 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  <div>
                    <p className="font-semibold">
                      Advanced Injectable Training
                    </p>
                    <p className="text-sm">
                      Certified in advanced techniques for Botox and dermal
                      fillers
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-3 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  <div>
                    <p className="font-semibold">Continuing Education</p>
                    <p className="text-sm">
                      Regular participation in aesthetic medicine conferences
                      and workshops
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-t from-[#4a5a3a] to-[#5a6b47]/80 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 font-montserrat">
            Ready to book your appointment?
          </h2>
          <Button
            asChild
            size="lg"
            className="bg-white text-[#5a6b47] hover:bg-gray-100"
          >
            <Link href="/booking">Get started here!</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
