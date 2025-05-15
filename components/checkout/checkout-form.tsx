"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/constants/ui/index";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUserStore } from "@/store/authStore";
import { formatZAR } from "@/utils";
import { createOrder } from "@/actions/orderAction";
import type { CheckoutCartItem, OrderInputData, Order } from "@/types";

// Import sub-components
import OrderSummary from "@/components/checkout/order-summary";
import ContactInformation from "@/components/checkout/contact-information";
import ShippingAddress from "@/components/checkout/shipping-address";
import DeliveryMethod from "./delivery-method";
import PaymentMethod from "@/components/checkout/payment-method";
import { createClient } from "@/utils/supabase/client";
import { keyValueData, deliveryOptions } from "@/constants/data";

type ShippingAddress = {
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
};

const bankDetails = {
  bank_name: keyValueData.bankName,
  account_name: keyValueData.accountName,
  account_number: keyValueData.accountNumber,
  branch_code: keyValueData.branchCode,
};
const whatsappNumber = keyValueData.whatsappNumber;

interface CheckoutFormProps {
  userId: string;
  cartId: string;
  cartItems: CheckoutCartItem[];
  lastShippedOrder?: Order | null;
  initialTotalAmount: number; // Subtotal before delivery
}

export default function CheckoutForm({
  userId,
  cartId,
  cartItems,
  initialTotalAmount,
  lastShippedOrder,
}: CheckoutFormProps) {
  // const router = useRouter();
  const user = useUserStore((state) => state.user);

  // --- State Management ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "bank_transfer" | "paystack"
  >("paystack");
  const [generatedPaymentReference, setGeneratedPaymentReference] =
    useState<string>(""); // Store reference after order creation

  const [contactData, setContactData] = useState({
    email: "",
    emailOffers: false,
  });
  const [shippingData, setShippingData] = useState({
    country: "South Africa",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });
  const [deliveryMethod, setDeliveryMethod] = useState<string>(
    deliveryOptions[0].id
  ); // Default to first option
  const [deliveryFee, setDeliveryFee] = useState<number>(
    deliveryOptions[0].fee
  );
  const [totalAmount, setTotalAmount] = useState<number>(
    initialTotalAmount + deliveryOptions[0].fee
  );

  // Separate error state for better management
  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- Effects ---
  // Populate form with user data on mount
  useEffect(() => {
    if (user) {
      setContactData((prev) => ({
        ...prev,
        email: user.email || "",
        emailOffers: user.receive_emails || false, // Use receive_emails from profile
      }));
      const shippingAddress = lastShippedOrder?.shipping_address as
        | ShippingAddress
        | undefined;
      setShippingData((prev) => ({
        ...prev,
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        phone: user.phone || "",
        address: shippingAddress?.address || "",
        apartment: shippingAddress?.apartment || "",
        city: shippingAddress?.city || "",
        state: shippingAddress?.state || "",
        zipCode: shippingAddress?.zip_code || "",
        country: shippingAddress?.country || "South Africa",
      }));
    }
  }, [user, lastShippedOrder]);

  // Recalculate total when delivery method changes
  useEffect(() => {
    const selectedOption = deliveryOptions.find(
      (opt) => opt.id === deliveryMethod
    );
    const fee = selectedOption?.fee ?? 0;
    setDeliveryFee(fee);
    setTotalAmount(initialTotalAmount + fee);
  }, [deliveryMethod, initialTotalAmount]);

  const clearError = useCallback((name: string) => {
    setErrors((prev) => {
      if (!prev[name]) return prev; // No change if error doesn't exist
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  // --- Event Handlers ---
  const handleContactChange = useCallback(
    (field: keyof typeof contactData, value: string | boolean) => {
      setContactData((prev) => ({ ...prev, [field]: value }));
      if (field === "email" && errors.email) clearError("email");
    },
    [errors, clearError]
  );

  const handleShippingChange = useCallback(
    (field: keyof typeof shippingData, value: string) => {
      setShippingData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) clearError(field); // Clear specific error
    },
    [errors, clearError]
  );

  const handleDeliveryChange = useCallback(
    (value: string) => {
      setDeliveryMethod(value);
      if (errors.deliveryMethod) clearError("deliveryMethod");
    },
    [errors, clearError]
  );

  const handlePaymentChange = useCallback(
    (value: "bank_transfer" | "paystack") => {
      setPaymentMethod(value);
    },
    []
  );

  // --- Form Validation ---
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    // Contact
    if (!contactData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(contactData.email))
      newErrors.email = "Email is invalid";

    // Shipping - skip validation if store pickup
    const isStorePickup = deliveryMethod === "store_pickup";

    if (!isStorePickup) {
      if (!shippingData.firstName.trim())
        newErrors.firstName = "First name is required";
      if (!shippingData.lastName.trim())
        newErrors.lastName = "Last name is required";
      if (!shippingData.address.trim())
        newErrors.address = "Address is required";
      if (!shippingData.city.trim()) newErrors.city = "City is required";
      if (!shippingData.state.trim())
        newErrors.state = "State / Province is required";
      if (!shippingData.zipCode.trim())
        newErrors.zipCode = "Postal code is required";
    }

    // Phone is always required
    if (!shippingData.phone || shippingData.phone.length < 10)
      newErrors.phone = "Valid phone number is required";

    // Delivery
    if (!deliveryMethod)
      newErrors.deliveryMethod = "Delivery method is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [contactData, shippingData, deliveryMethod]);

  // --- Form Submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.warning("Please review the errors in the form.");
      // Find first error and focus (optional enhancement)
      const firstErrorKey = Object.keys(errors).find((key) => errors[key]);
      if (firstErrorKey) {
        const element = document.getElementById(`checkout-${firstErrorKey}`);
        element?.focus();
      }
      return;
    }

    setIsSubmitting(true);
    setGeneratedPaymentReference("");

    // Prepare data for Server Action
    const orderInput: OrderInputData = {
      userId,
      cartId,
      firstName: shippingData.firstName,
      lastName: shippingData.lastName,
      email: contactData.email,
      phone: shippingData.phone,
      shippingAddress: {
        address: shippingData.address,
        apartment: shippingData.apartment || undefined,
        city: shippingData.city,
        state: shippingData.state,
        zipCode: shippingData.zipCode,
        country: shippingData.country,
      },
      deliveryMethod: deliveryMethod,
      deliveryFee: deliveryFee,
      paymentMethod: paymentMethod,
      totalAmount: totalAmount,
      emailOffers: contactData.emailOffers,
      cartItems: cartItems.map((item) => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_time: item.price_at_time,
        color: item.color,
        product_name: item.products!.name,
      })),
    };

    try {
      // --- Call Server Action to Create Order ---
      const orderResult = await createOrder(orderInput);

      if (!orderResult.success) {
        throw new Error(orderResult.error); // Throw error from server action
      }

      const {
        orderId,
        paymentReference,
        paymentMethod: selectedPaymentMethod,
      } = orderResult;
      setGeneratedPaymentReference(paymentReference);

      // --- Handle Payment ---
      if (selectedPaymentMethod === "bank_transfer") {
        toast.success(
          "Order placed successfully! Please complete bank transfer."
        );
        return;
      } else if (selectedPaymentMethod === "paystack") {
        toast.info("Redirecting to secure payment gateway...");
        // --- Call API Route for Paystack Initialization ---
        const response = await fetch("/api/payment", {
          // Use the existing API route
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: contactData.email,
            orderId: orderId, // Use the ID returned by createOrder
            amount: totalAmount, // Use calculated total
            name: `${shippingData.firstName} ${shippingData.lastName}`,
            cartId: cartId,
            payment_method: "paystack", // Explicitly send method
            reference: paymentReference, // Use reference from createOrder
            address: orderInput.shippingAddress, // Send address if needed by Paystack/API
          }),
        });

        const paymentData = await response.json();

        if (!response.ok || !("authorization_url" in paymentData.data)) {
          const supabase = createClient();
          await supabase
            .from("orders")
            .update({ status: "failed" })
            .eq("id", orderId);
          console.error("Payment API Error:", paymentData.message);
          throw new Error(paymentData.message || "Payment initiation failed.");
        }

        window.location.href = paymentData.data.authorization_url;
        return;
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected checkout error occurred.";
      console.error("Checkout Submit Error:", message);
      toast.warning(message);
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Logic ---
  const selectedDeliveryOption = deliveryOptions.find(
    (opt) => opt.id === deliveryMethod
  );
  const isUserLoggedIn = !!user;
  const hasOptedInBefore = user?.receive_emails;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
      {/* Left Column: Checkout Form */}
      <div className="md:col-span-2">
        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          <ContactInformation
            email={contactData.email}
            emailOffers={contactData.emailOffers}
            onEmailChange={(val) => handleContactChange("email", val)}
            onOffersChange={(val) => handleContactChange("emailOffers", val)}
            error={errors.email}
            isUserLoggedIn={isUserLoggedIn}
            hasOptedInBefore={hasOptedInBefore}
          />

          <ShippingAddress
            formData={shippingData}
            errors={errors}
            onInputChange={handleShippingChange}
            onPhoneChange={(val) => handleShippingChange("phone", val)}
          />

          <PaymentMethod
            selectedMethod={paymentMethod}
            onMethodChange={handlePaymentChange}
            bankDetails={bankDetails}
            whatsappNumber={whatsappNumber}
            paymentReference={generatedPaymentReference}
            totalAmount={totalAmount}
          />

          <div className="mt-6 pt-6 border-t">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 py-3 text-base md:text-lg font-semibold disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />{" "}
                  Processing...
                </span>
              ) : paymentMethod === "bank_transfer" ? (
                `Complete Order - ${formatZAR(totalAmount)}`
              ) : (
                `Pay Securely - ${formatZAR(totalAmount)}`
              )}
            </Button>

            <div className="text-xs text-center text-muted-foreground mt-4 space-x-2">
              <Link href="/refund-policy" className="hover:underline">
                Refund policy
              </Link>
              <span>•</span>
              <Link href="/privacy-policy" className="hover:underline">
                Privacy policy
              </Link>
              <span>•</span>
              <Link href="/terms-of-service" className="hover:underline">
                Terms of service
              </Link>
            </div>
          </div>
        </form>
      </div>

      {/* Right Column: Delivery & Summary */}
      <div className="md:col-span-1">
        <div className="space-y-6 sticky top-24">
          <DeliveryMethod
            options={deliveryOptions}
            selectedMethod={deliveryMethod}
            onMethodChange={handleDeliveryChange}
            error={errors.deliveryMethod}
          />
          <OrderSummary
            cartItems={cartItems}
            subtotal={initialTotalAmount}
            deliveryMethodName={selectedDeliveryOption?.name || "Select..."}
            deliveryFee={deliveryFee}
            totalAmount={totalAmount}
          />
        </div>
      </div>
    </div>
  );
}
