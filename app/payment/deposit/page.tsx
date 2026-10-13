"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Button,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Skeleton,
} from "@/constants/ui/index";
import { useUserStore } from "@/store/authStore";
import { CreditCard, Landmark, Loader2, ShieldCheck } from "lucide-react";
import StatusPage, {
  StatusPanel,
  StatusRow,
} from "@/components/common/status-page";
import { toast } from "sonner";
import { keyValueData } from "@/constants/data";
import { formatZAR } from "@/utils";

function DepositPaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "credit-card" | "direct-transfer"
  >("direct-transfer");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [depositAmount] = useState(200);
  const user = useUserStore((state) => state.user);
  const [bankDetails] = useState({
    bank_name: keyValueData.bankName,
    account_name: keyValueData.accountName,
    account_number: keyValueData.accountNumber,
    branch_code: keyValueData.branchCode,
  });

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

    if (user) {
      setName(user.first_name + " " + user.last_name || "");
      setEmail(user.email || "");
    }
  }, [searchParams, router, user]);

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
      toast.warning("Name and email are required for payment.");
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
          userId: user?.user_id,
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
        toast.warning(responseData.data.message, {
          description: "Please try again with a different booking ID.",
        });
      } else {
        toast.warning("Payment failed", {
          description: "There was an error processing your payment.",
        });
      }
    } catch (error) {
      console.error(error);
      toast.warning("Payment failed", {
        description: "There was an error processing your payment.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const whatsappUrl = bookingId
    ? `https://wa.me/${keyValueData.whatsappNumber}?text=${encodeURIComponent(
        `Hello, I have made a direct transfer for my booking *${bookingId}* with a deposit of *R${depositAmount.toFixed(
          2
        )}*. \n\n_*Please confirm and include a screenshot of your payment receipt.*_`
      )}`
    : "#";

  return (
    <StatusPage
      eyebrow="Secure your booking"
      title="Pay deposit"
      description={
        <>
          Booking ID:{" "}
          <span className="font-mono text-xs tracking-wide text-foreground">
            {bookingId || "Loading..."}
          </span>
        </>
      }
    >
      <StatusPanel>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between gap-4 rounded-xl bg-secondary/70 px-4 py-3">
            <Label className="text-muted-foreground">Deposit Amount</Label>
            <span className="font-heading text-2xl text-foreground">
              {formatZAR(depositAmount)}
            </span>
          </div>

          <div className="space-y-3">
            <Label>Payment Method</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) =>
                setPaymentMethod(value as "credit-card" | "direct-transfer")
              }
              className="space-y-2"
            >
              <Label
                htmlFor="direct-transfer"
                className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 font-normal transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent/40"
              >
                <RadioGroupItem value="direct-transfer" id="direct-transfer" />
                <Landmark className="h-4 w-4 text-primary" />
                Direct Transfer
              </Label>
              <Label
                htmlFor="credit-card"
                className="flex cursor-not-allowed items-center gap-3 rounded-xl border p-4 font-normal text-muted-foreground opacity-60"
              >
                <RadioGroupItem value="credit-card" id="credit-card" disabled />
                <CreditCard className="h-4 w-4" />
                Card Payment (Paystack) Coming Soon
              </Label>
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
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  `Pay ${formatZAR(depositAmount)}`
                )}
              </Button>
            </div>
          )}

          {paymentMethod === "direct-transfer" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please transfer the deposit amount to the following bank
                details:
              </p>
              <dl className="divide-y rounded-xl border px-4">
                <StatusRow label="Bank">{bankDetails.bank_name}</StatusRow>
                <StatusRow label="Account Name">
                  {bankDetails.account_name}
                </StatusRow>
                <StatusRow label="Account Number">
                  <span className="font-mono tracking-wide">
                    {bankDetails.account_number}
                  </span>
                </StatusRow>
                <StatusRow label="Branch Code">
                  <span className="font-mono tracking-wide">
                    {bankDetails.branch_code}
                  </span>
                </StatusRow>
                <StatusRow label="Reference">
                  <span className="break-words font-mono text-xs tracking-wide">
                    {bookingId}
                  </span>
                </StatusRow>
                <StatusRow label="Amount">{formatZAR(depositAmount)}</StatusRow>
              </dl>
              <Button asChild size="lg" className="w-full">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  Confirm Transfer via WhatsApp
                </a>
              </Button>
            </div>
          )}
        </form>
      </StatusPanel>
      <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="h-4 w-4" />
        Your payment is secure by Paystack
      </p>
    </StatusPage>
  );
}

export default function DepositPaymentPage() {
  return (
    <Suspense fallback={<DepositPaymentSkeleton />}>
      <DepositPaymentPageContent />
    </Suspense>
  );
}

function DepositPaymentSkeleton() {
  return (
    <section className="bg-background px-4 py-14 md:py-20">
      <div className="mx-auto w-full max-w-xl">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-11 w-56" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="mt-10 space-y-6 rounded-2xl border bg-card p-6 shadow-soft md:p-8">
          <Skeleton className="h-14 w-full rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-full" />
        </div>
      </div>
    </section>
  );
}
