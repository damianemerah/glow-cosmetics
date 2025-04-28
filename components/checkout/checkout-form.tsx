"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Button,
  Input,
  Label,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/constants/ui/index";
import { BanknoteIcon, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabaseClient } from "@/lib/supabaseClient";
import { useUserStore } from "@/store/authStore";
import { customAlphabet } from "nanoid";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { formatZAR } from "@/utils";
import OrderSummary from "./order-summary";

interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  image_url?: string;
}

interface DeliveryOption {
  id: string;
  name: string;
  fee: number;
}

interface CheckoutComponentProps {
  userId: string;
  cartId: string;
  cartItems: CartItem[];
  initialTotalAmount: number;
}

const deliveryOptions: DeliveryOption[] = [
  { id: "store_pickup", name: "Store Pickup", fee: 0 },
  { id: "postnet", name: "PostNet Delivery", fee: 110 },
  { id: "paxi", name: "PAXI Delivery", fee: 70 },
];

const nanoid = customAlphabet("0123456789", 6);

export default function CheckoutComponent({
  userId,
  cartId,
  cartItems,
  initialTotalAmount,
}: CheckoutComponentProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "bank_transfer" | "paystack"
  >("paystack");
  const [bankDetails] = useState({
    bank_name: "Standard Bank",
    account_name: "Glow Cosmetics",
    account_number: "1234567890",
    branch_code: "051001",
  });
  const [whatsappNumber] = useState("+2347066765698");
  const [paymentReference, setPaymentReference] = useState("");
  const user = useUserStore((state) => state.user);

  const [formData, setFormData] = useState({
    email: "",
    emailOffers: false,
    country: "South Africa",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    deliveryMethod: "store_pickup",
    deliveryFee: 0,
    totalAmount: initialTotalAmount,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        totalAmount:
          initialTotalAmount +
          (deliveryOptions.find((opt) => opt.id === prev.deliveryMethod)?.fee ||
            0),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        totalAmount:
          initialTotalAmount +
          (deliveryOptions.find((opt) => opt.id === prev.deliveryMethod)?.fee ||
            0),
      }));
    }
  }, [user, initialTotalAmount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    clearError(name);
  };

  const handlePhoneChange = (value: string) => {
    const phoneValue = value.startsWith("+") ? value : "+" + value;
    setFormData((prev) => ({ ...prev, phone: phoneValue }));
    clearError("phone");
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const handleCheckboxChange = (
    name: string,
    checked: boolean | "indeterminate"
  ) => {
    if (typeof checked === "boolean") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    }
  };

  const handleDeliveryMethodChange = (value: string) => {
    const selectedOption = deliveryOptions.find((opt) => opt.id === value);
    if (!selectedOption) return;

    const newFee = selectedOption.fee;
    const newTotal = initialTotalAmount + newFee;

    setFormData((prev) => ({
      ...prev,
      deliveryMethod: value,
      deliveryFee: newFee,
      totalAmount: newTotal,
    }));
    clearError("deliveryMethod");
  };

  const clearError = (name: string) => {
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Email is invalid";
    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.state.trim()) errors.state = "State is required";
    if (!formData.zipCode.trim()) errors.zipCode = "Postal code is required";
    if (!formData.phone || formData.phone.length < 10)
      errors.phone = "Valid phone number is required";
    if (!formData.deliveryMethod)
      errors.deliveryMethod = "Delivery method is required";

    setFormErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    if (!isValid) {
      toast.error("Please fix the errors in the form.");
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        element?.focus();
      }
    }
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const stockCheckPromises = cartItems.map(async (item) => {
        const { data, error } = await supabaseClient
          .from("products")
          .select("stock_quantity, name")
          .eq("id", item.product_id)
          .single();
        if (error)
          throw new Error(
            `Stock check failed for ${item.product_name}: ${error.message}`
          );
        if (!data) throw new Error(`Product ${item.product_name} not found.`);
        if (data.stock_quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for ${data.name}. Only ${data.stock_quantity} available.`
          );
        }
      });
      await Promise.all(stockCheckPromises);

      const orderReference = `ORD-${nanoid()}`;
      setPaymentReference(orderReference);

      if (user && formData.emailOffers) {
        await supabaseClient
          .from("profiles")
          .update({ receive_emails: true })
          .eq("user_id", userId);
      }

      const shippingAddress = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        apartment: formData.apartment,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
      };

      const { data: order, error: orderError } = await supabaseClient
        .from("orders")
        .insert({
          user_id: userId,
          first_name: formData.firstName,
          last_name: formData.lastName,
          cart_id: cartId,
          total_price: formData.totalAmount,
          shipping_address: shippingAddress,
          email: formData.email,
          phone: formData.phone,
          status:
            paymentMethod === "bank_transfer" ? "pending_payment" : "pending",
          payment_reference: orderReference,
          payment_method: paymentMethod,
          delivery_method: formData.deliveryMethod,
          delivery_fee: formData.deliveryFee,
        })
        .select()
        .single();

      if (orderError)
        throw new Error(`Order creation failed: ${orderError.message}`);
      if (!order) throw new Error("Order creation returned no data.");

      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        price_at_time: item.price,
      }));
      const { error: itemsError } = await supabaseClient
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        await supabaseClient
          .from("orders")
          .update({ status: "creation_error" })
          .eq("id", order.id);
        throw new Error(`Failed to save order items: ${itemsError.message}`);
      }

      if (paymentMethod === "bank_transfer") {
        await supabaseClient
          .from("carts")
          .update({ status: "ordered" })
          .eq("id", cartId);
        router.push(`/order-confirmation?id=${order.id}&ref=${orderReference}`);
        return;
      }

      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          orderId: order.id,
          amount: formData.totalAmount,
          name: `${formData.firstName} ${formData.lastName}`,
          cartId: cartId,
          reference: orderReference,
          metadata: {
            type: "product-purchase",
            order_id: order.id,
            cart_id: cartId,
            user_id: userId,
            delivery_method: formData.deliveryMethod,
          },
        }),
      });

      const paymentData = await response.json();

      if (!response.ok || !paymentData.status) {
        await supabaseClient
          .from("orders")
          .update({ status: "payment_failed" })
          .eq("id", order.id);
        throw new Error(paymentData.message || "Payment initiation failed");
      }

      if (paymentData.data?.authorization_url) {
        await supabaseClient
          .from("carts")
          .update({ status: "processing_payment" })
          .eq("id", cartId);
        window.location.href = paymentData.data.authorization_url;
        return;
      } else {
        await supabaseClient
          .from("orders")
          .update({ status: "payment_error" })
          .eq("id", order.id);
        throw new Error("Could not get payment URL from Paystack.");
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${encodeURIComponent(
    `Hello, I have made a direct transfer for my order *${paymentReference || "..."}* for *${formatZAR(formData.totalAmount)}*. \nPlease confirm my payment. Order Reference: ${paymentReference || "..."}\n\n(Please attach a screenshot of your payment receipt)`
  )}`;

  const selectedDeliveryOption = deliveryOptions.find(
    (opt) => opt.id === formData.deliveryMethod
  );

  const renderFormFields = () => (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      <div>
        <h2 className="text-lg font-semibold mb-4 font-montserrat">Contact</h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleInputChange}
              className={formErrors.email ? "border-red-500" : ""}
              aria-invalid={!!formErrors.email}
              aria-describedby="email-error"
              required
            />
            {formErrors.email && (
              <p id="email-error" className="text-red-600 text-sm mt-1">
                {formErrors.email}
              </p>
            )}
          </div>
          {!user?.receive_emails && (
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="emailOffers"
                name="emailOffers"
                checked={formData.emailOffers}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("emailOffers", checked)
                }
              />
              <Label
                htmlFor="emailOffers"
                className="text-sm font-normal cursor-pointer"
              >
                Email me with news and offers
              </Label>
            </div>
          )}
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-4 font-montserrat">Delivery</h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="country">Country/Region</Label>
            <Select
              name="country"
              value={formData.country}
              onValueChange={(value) => handleSelectChange("country", value)}
            >
              <SelectTrigger id="country">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="South Africa">South Africa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={formErrors.firstName ? "border-red-500" : ""}
                aria-invalid={!!formErrors.firstName}
                aria-describedby="firstName-error"
                required
              />
              {formErrors.firstName && (
                <p id="firstName-error" className="text-red-600 text-sm mt-1">
                  {formErrors.firstName}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={formErrors.lastName ? "border-red-500" : ""}
                aria-invalid={!!formErrors.lastName}
                aria-describedby="lastName-error"
                required
              />
              {formErrors.lastName && (
                <p id="lastName-error" className="text-red-600 text-sm mt-1">
                  {formErrors.lastName}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone number</Label>
            <PhoneInput
              country={"za"}
              value={formData.phone}
              onChange={handlePhoneChange}
              inputProps={{ id: "phone", name: "phone", required: true }}
              containerClass="w-full"
              inputClass={`w-full p-2 border rounded-md ${formErrors.phone ? "border-red-500" : "border-input"}`}
              placeholder="+27 12 345 6789"
            />
            {formErrors.phone && (
              <p id="phone-error" className="text-red-600 text-sm mt-1">
                {formErrors.phone}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={formErrors.address ? "border-red-500" : ""}
              aria-invalid={!!formErrors.address}
              aria-describedby="address-error"
              required
            />
            {formErrors.address && (
              <p id="address-error" className="text-red-600 text-sm mt-1">
                {formErrors.address}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
            <Input
              id="apartment"
              name="apartment"
              value={formData.apartment}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={formErrors.city ? "border-red-500" : ""}
                aria-invalid={!!formErrors.city}
                aria-describedby="city-error"
                required
              />
              {formErrors.city && (
                <p id="city-error" className="text-red-600 text-sm mt-1">
                  {formErrors.city}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className={formErrors.state ? "border-red-500" : ""}
                aria-invalid={!!formErrors.state}
                aria-describedby="state-error"
                required
              />
              {formErrors.state && (
                <p id="state-error" className="text-red-600 text-sm mt-1">
                  {formErrors.state}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zipCode">Postal code</Label>
              <Input
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                className={formErrors.zipCode ? "border-red-500" : ""}
                aria-invalid={!!formErrors.zipCode}
                aria-describedby="zipCode-error"
                required
              />
              {formErrors.zipCode && (
                <p id="zipCode-error" className="text-red-600 text-sm mt-1">
                  {formErrors.zipCode}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-4 font-montserrat">Payment</h2>
        <RadioGroup
          value={paymentMethod}
          onValueChange={(value) =>
            setPaymentMethod(value as "bank_transfer" | "paystack")
          }
          className="space-y-2"
        >
          <Label
            htmlFor="paystack"
            className={`flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:border-gray-400 ${paymentMethod === "paystack" ? "border-gray-600 ring-1 ring-gray-500" : "border-gray-300"}`}
          >
            <RadioGroupItem value="paystack" id="paystack" />
            <CreditCard className="h-4 w-4 mr-1" />
            <span>Card Payment (Paystack)</span>
          </Label>
          <Label
            htmlFor="bank_transfer"
            className={`flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:border-gray-400 ${paymentMethod === "bank_transfer" ? "border-gray-600 ring-1 ring-gray-500" : "border-gray-300"}`}
          >
            <RadioGroupItem value="bank_transfer" id="bank_transfer" />
            <BanknoteIcon className="h-4 w-4 mr-1" />
            <span>Bank Transfer</span>
          </Label>
        </RadioGroup>
        {paymentMethod === "bank_transfer" && (
          <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-md border">
            <p className="text-sm font-medium">
              Please transfer the payment to:
            </p>
            <div className="bg-white p-3 rounded border text-sm space-y-1">
              <p>
                <strong>Bank:</strong> {bankDetails.bank_name}
              </p>
              <p>
                <strong>Account Name:</strong> {bankDetails.account_name}
              </p>
              <p>
                <strong>Account Number:</strong> {bankDetails.account_number}
              </p>
              <p>
                <strong>Branch Code:</strong> {bankDetails.branch_code}
              </p>
              <p className="mt-1.5">
                <strong>Amount:</strong>{" "}
                <span className="font-semibold">
                  {formatZAR(formData.totalAmount)}
                </span>
              </p>
              <p className="mt-1.5">
                <strong>Reference:</strong>{" "}
                <span className="font-semibold">
                  {paymentReference || "(Use Order # after completion)"}
                </span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              After placing the order, use the button that appears here or
              manually contact us on WhatsApp ({whatsappNumber}) with your Order
              Reference ({paymentReference || "..."}) and proof of payment.
            </p>
            {paymentReference && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2"
              >
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-green-500 text-green-600 hover:bg-green-50"
                >
                  Confirm Transfer via WhatsApp (After Payment)
                </Button>
              </a>
            )}
          </div>
        )}
      </div>
      <div className="mt-6 pt-6 border-t">
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 py-3 text-lg font-semibold disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Processing...
            </span>
          ) : paymentMethod === "bank_transfer" ? (
            `Complete Order - ${formatZAR(formData.totalAmount)}`
          ) : (
            `Pay Securely - ${formatZAR(formData.totalAmount)}`
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
  );

  const renderDeliveryAndSummary = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-2">Delivery Method</h3>
        <RadioGroup
          value={formData.deliveryMethod}
          onValueChange={handleDeliveryMethodChange}
          className="space-y-2"
          aria-label="Delivery Method"
          name="deliveryMethod"
        >
          {deliveryOptions.map((option) => (
            <Label
              key={option.id}
              htmlFor={option.id}
              className={`flex items-center justify-between border p-3 rounded-md cursor-pointer hover:border-gray-400 ${formData.deliveryMethod === option.id ? "border-gray-600 ring-1 ring-gray-500" : "border-gray-300"}`}
              aria-invalid={!!formErrors.deliveryMethod}
              aria-describedby="deliveryMethod-error"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <span className="font-medium">{option.name}</span>
              </div>
              <span
                className={`text-sm font-medium ${option.fee === 0 ? "text-green-600" : ""}`}
              >
                {option.fee === 0 ? "Free" : formatZAR(option.fee)}
              </span>
            </Label>
          ))}
        </RadioGroup>
        {formErrors.deliveryMethod && (
          <p id="deliveryMethod-error" className="text-red-600 text-sm mt-1">
            {formErrors.deliveryMethod}
          </p>
        )}
      </div>
      <div>
        <OrderSummary
          cartItems={cartItems}
          subtotal={initialTotalAmount}
          deliveryMethodName={selectedDeliveryOption?.name || "Select..."}
          deliveryFee={formData.deliveryFee}
          totalAmount={formData.totalAmount}
        />
      </div>
    </div>
  );

  return (
    <>
      <div>{renderFormFields()}</div>

      <div>{renderDeliveryAndSummary()}</div>
    </>
  );
}
