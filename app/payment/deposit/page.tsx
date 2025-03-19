"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";

export default function DepositPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "credit-card" | "direct-transfer"
  >("credit-card");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [depositAmount] = useState(200); // Fixed deposit amount

  // Track name and email
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const id = searchParams.get("bookingId");
    if (id) {
      setBookingId(id);
    } else {
      router.push("/booking");
    }
  }, [searchParams, router]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod !== "credit-card") {
      return;
    }

    if (!email || !name) {
      toast.error("Name and email are required for payment.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          bookingId,
          amount: depositAmount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const responseData = await response.json();
      const authorization_url = responseData.data.data.authorization_url;

      if (authorization_url) {
        window.location.href = authorization_url;
      } else if (responseData.data.code === "duplicate_reference") {
        toast.error(responseData.data.message, {
          description: "Please try again with a different booking ID.",
        });
      } else {
        toast.error("Payment failed", {
          description: "There was an error processing your payment.",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Payment failed", {
        description: "There was an error processing your payment.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const whatsappUrl = bookingId
    ? `https://wa.me/+2347066765698?text=${encodeURIComponent(
        `Hello, I have made a direct transfer for my booking *${bookingId}* with a deposit of *R${depositAmount.toFixed(
          2
        )}*. \n\n_*Please confirm and include a screenshot of your payment receipt.*_`
      )}`
    : "#";

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold font-montserrat">
            Pay Deposit
          </CardTitle>
          <CardDescription>
            Booking ID: {bookingId || "Loading..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Deposit Amount</Label>
                <span className="font-semibold">
                  R{depositAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as "credit-card")
                }
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 border p-3 rounded-md">
                  <RadioGroupItem value="credit-card" id="credit-card" />
                  <Label
                    htmlFor="credit-card"
                    className="flex items-center cursor-pointer"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Credit Card
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-md">
                  <RadioGroupItem
                    value="direct-transfer"
                    id="direct-transfer"
                  />
                  <Label htmlFor="direct-transfer" className="cursor-pointer">
                    Direct Transfer
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {paymentMethod === "credit-card" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Your full name"
                    value={name}
                    onChange={handleNameChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={handleEmailChange}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-600"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </span>
                  ) : (
                    `Pay R${depositAmount.toFixed(2)}`
                  )}
                </Button>
              </div>
            )}

            {paymentMethod === "direct-transfer" && (
              <div className="space-y-4">
                <p className="text-sm">
                  Please transfer the deposit amount to the following bank
                  details:
                </p>
                <div className="bg-gray-100 p-4 rounded-md text-sm">
                  <p>
                    <strong>Bank:</strong> Your Bank Name
                  </p>
                  <p>
                    <strong>Account Name:</strong> Your Account Name
                  </p>
                  <p>
                    <strong>Account Number:</strong> 1234567890
                  </p>
                  <p>
                    <strong>Branch Code:</strong> 000000
                  </p>
                </div>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button
                    className="w-full bg-green-500 hover:bg-green-600"
                    type="button"
                  >
                    Confirm Transfer via WhatsApp
                  </Button>
                </a>
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          <p>Your payment is secure by Paystack</p>
        </CardFooter>
      </Card>
    </div>
  );
}
