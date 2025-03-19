import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PaymentPlansPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[300px] bg-secondary">
        <div className="absolute inset-0">
          <Image
            src="/placeholder.svg?height=300&width=1200"
            alt="Payment Plans"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-montserrat">
              Payment Plans
            </h1>
            <p className="text-xl md:text-2xl">
              Flexible financing options to make beauty and wellness accessible.
            </p>
          </div>
        </div>
      </section>

      {/* Cherry Financing Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 font-montserrat">
              What is Cherry?
            </h2>
            <p className="text-lg mb-8">
              Get treated now and pay over time with Cherry. Cherry is a payment
              plan designed for your health, beauty, and wellness needs and
              procedures and allows you to make convenient monthly payments.
            </p>
            <Button asChild className="bg-green-500 hover:bg-green-600">
              <Link href="https://www.withcherry.com/lending-partners">
                Apply
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 font-montserrat">
                  3 Reasons Why You&apos;ll Love Cherry
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold mr-3">
                      1
                    </span>
                    <div>
                      <p className="font-semibold">
                        Cherry qualifies patients for up to $10,000.00
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold mr-3">
                      2
                    </span>
                    <div>
                      <p className="font-semibold">
                        There is no hard credit check
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold mr-3">
                      3
                    </span>
                    <div>
                      <p className="font-semibold">
                        Cherry offers 0% APR financing options*
                      </p>
                    </div>
                  </li>
                </ul>
                <p className="text-sm mt-4 italic">
                  *0% APR and other promotional rates subject to eligibility.
                </p>
              </div>
              <div className="relative h-[400px]">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="Cherry financing"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-[#5a6b47] text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center font-montserrat">
            How Does Cherry Work?
          </h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg mb-8 text-center">
              Cherry performs a soft credit check, which does not hurt your
              credit score, to determine approval amounts and contract type, as
              well as to verify applicant identity. Cherry may ask for
              additional information from some borrowers in order to determine
              approval amounts.
            </p>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="relative h-[400px] order-2 md:order-1">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="Patient requirements"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="order-1 md:order-2">
                <h2 className="text-3xl font-bold mb-6 font-montserrat">
                  Patient Requirements
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold mr-3">
                      1
                    </span>
                    <div>
                      <p className="font-semibold">
                        Patients must be at least 18 years of age
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold mr-3">
                      2
                    </span>
                    <div>
                      <p className="font-semibold">
                        Patients must have a valid bank-issued debit or credit
                        card
                      </p>
                    </div>
                  </li>
                </ul>
                <div className="mt-8">
                  <Button asChild className="bg-green-500 hover:bg-green-600">
                    <Link href="https://www.withcherry.com/lending-partners">
                      Apply
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Payment Options */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center font-montserrat">
            Other Payment Options
          </h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-white mb-4">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 font-montserrat">
                  Credit Cards
                </h3>
                <p>
                  We accept all major credit cards including Visa, Mastercard,
                  American Express, and Discover.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-white mb-4">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 font-montserrat">Cash</h3>
                <p>
                  Cash payments are accepted for all services and products at
                  our location.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-white mb-4">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 font-montserrat">
                  HSA/FSA
                </h3>
                <p>
                  Some of our services may be eligible for payment using Health
                  Savings Accounts (HSA) or Flexible Spending Accounts (FSA).
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-sm text-gray-600">
            <p>
              Payment options through Cherry Technologies, Inc. are issued by
              the following lending partners:
              https://withcherry.com/lending-partners/.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#5a6b47] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 font-montserrat">
            Ready to get started?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-[#5a6b47] hover:bg-gray-100"
            >
              <Link href="https://www.withcherry.com/lending-partners">
                Apply for Financing
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-[#5a6b47] hover:bg-white/10"
            >
              <Link href="/contact">Contact Us with Questions</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
