"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BanknoteIcon, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { supabaseClient } from "@/lib/supabaseClient";
import { useUserStore } from "@/store/authStore";
import { customAlphabet } from "nanoid";
import PhoneInput from "react-phone-input-2";

// Create nanoid generator for order references
const nanoid = customAlphabet("0123456789", 6);

interface CheckoutFormProps {
  userId: string;
  cartId: string;
  cartItems: {
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
    image_url?: string;
  }[];
  totalAmount: number;
}

export default function CheckoutForm({
  userId,
  cartId,
  cartItems,
  totalAmount,
}: CheckoutFormProps) {
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

  // Form state
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
    textOffers: false,
    saveInfo: false,
  });

  // Form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Pre-fill form with user data from context if available
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    } else {
      // Fallback to fetch from database if not in context
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, phone: "+" + value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
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

    // Required fields
    if (!formData.email) errors.email = "Email is required";
    if (!formData.firstName) errors.firstName = "First name is required";
    if (!formData.lastName) errors.lastName = "Last name is required";
    if (!formData.address) errors.address = "Address is required";
    if (!formData.city) errors.city = "City is required";
    if (!formData.state) errors.state = "State is required";
    if (!formData.zipCode) errors.zipCode = "ZIP code is required";
    if (!formData.phone) errors.phone = "Phone number is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate payment reference
      const orderReference = `ORD-${nanoid()}`;

      // Prepare shipping address
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

      // Create order
      const { data: order, error: orderError } = await supabaseClient
        .from("orders")
        .insert({
          user_id: userId,
          first_name: formData.firstName,
          last_name: formData.lastName,
          cart_id: cartId,
          total_price: totalAmount,
          shipping_address: shippingAddress,
          email: formData.email,
          phone: formData.phone,
          status: "pending",
          payment_reference: orderReference,
          payment_method: paymentMethod,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
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

      if (itemsError) throw itemsError;

      if (paymentMethod === "bank_transfer") {
        // For bank transfer, just set the order ID and reference
        setPaymentReference(orderReference);
        router.push(`/order-confirmation?id=${order.id}`);
        return;
      }

      // Process payment with Paystack
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          orderId: order.id,
          amount: totalAmount,
          name: `${formData.firstName} ${formData.lastName}`,
          cartId: cartId,
          address: shippingAddress,
          payment_method: paymentMethod,
          reference: orderReference,
          metadata: {
            type: "product-purchase",
            order_id: order.id,
            cart_id: cartId,
            payment_type: "full-payment",
            payment_method: "paystack",
          },
        }),
      });

      const paymentData = await response.json();

      console.log(paymentData, "payment🥂");

      if (!response.ok) {
        throw new Error(paymentData.error || "Payment processing failed");
      }

      // Redirect to Paystack payment page
      if (paymentData.data && paymentData.data.authorization_url) {
        window.location.href = paymentData.data.authorization_url;
        return;
      }

      // If we get here, go to order confirmation
      router.push(`/order-confirmation?id=${order.id}`);
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error("Failed to complete checkout");
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${encodeURIComponent(
    `Hello, I have made a direct transfer for my order *${paymentReference || "pending"}* for *R${totalAmount.toFixed(
      2
    )}*. \n\n_*Please confirm and include a screenshot of your payment receipt.*_`
  )}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Contact */}
      <div>
        <h2 className="text-lg font-semibold mb-4 font-montserrat">Contact</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className={formErrors.email ? "border-red-500" : ""}
            />
            {formErrors.email && (
              <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
            )}
          </div>
          {!user?.receive_emails && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emailOffers"
                name="emailOffers"
                checked={formData.emailOffers}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    emailOffers: checked === true,
                  }))
                }
              />
              <Label htmlFor="emailOffers" className="text-sm">
                Email me with news and offers
              </Label>
            </div>
          )}
        </div>
      </div>

      {/* Delivery */}
      <div>
        <h2 className="text-lg font-semibold mb-4 font-montserrat">Delivery</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="country">Country/Region</Label>
            <Select
              value={formData.country}
              onValueChange={(value) => handleSelectChange("country", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="South Africa">South Africa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={formErrors.firstName ? "border-red-500" : ""}
              />
              {formErrors.firstName && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.firstName}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={formErrors.lastName ? "border-red-500" : ""}
              />
              {formErrors.lastName && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.lastName}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <PhoneInput
              country={"za"}
              value={formData.phone}
              onChange={handlePhoneChange}
              inputProps={{
                id: "phone",
                name: "phone",
                required: true,
              }}
              containerClass="w-full"
              inputClass={`w-full p-2 border rounded-md ${formErrors.phone ? "border-red-500" : ""}`}
              placeholder="+27 12 345 6789"
            />
            {formErrors.phone && (
              <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={formErrors.address ? "border-red-500" : ""}
            />
            {formErrors.address && (
              <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
            <Input
              id="apartment"
              name="apartment"
              value={formData.apartment}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={formErrors.city ? "border-red-500" : ""}
              />
              {formErrors.city && (
                <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className={formErrors.state ? "border-red-500" : ""}
              />
              {formErrors.state && (
                <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP code</Label>
              <Input
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                className={formErrors.zipCode ? "border-red-500" : ""}
              />
              {formErrors.zipCode && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.zipCode}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment */}
      <div>
        <h2 className="text-lg font-semibold mb-4 font-montserrat">Payment</h2>
        <div className="space-y-4">
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value) => {
              setPaymentMethod(value as "bank_transfer" | "paystack");
            }}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2 border p-3 rounded-md">
              <RadioGroupItem value="paystack" id="paystack" />
              <Label
                htmlFor="paystack"
                className="flex items-center cursor-pointer"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Card Payment (Paystack)
              </Label>
            </div>
            <div className="flex items-center space-x-2 border p-3 rounded-md">
              <RadioGroupItem value="bank_transfer" id="bank_transfer" />
              <Label
                htmlFor="bank_transfer"
                className="flex items-center cursor-pointer"
              >
                <BanknoteIcon className="h-4 w-4 mr-2" />
                Bank Transfer
              </Label>
            </div>
          </RadioGroup>

          {/* Show bank details immediately if bank transfer is selected */}
          {paymentMethod === "bank_transfer" && (
            <div className="mt-4 space-y-4">
              <p className="text-sm">
                Please transfer the payment to the following bank details:
              </p>
              <div className="bg-gray-100 p-4 rounded-md text-sm">
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
                <p className="mt-2">
                  <strong>Amount:</strong> R{totalAmount.toFixed(2)}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                After payment, use WhatsApp to confirm your transfer with a
                screenshot.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2"
              >
                <Button
                  type="button"
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  Confirm Transfer via WhatsApp
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>

      {paymentMethod !== "bank_transfer" && (
        <Button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 py-6 text-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </span>
          ) : (
            `Complete Order - R${totalAmount.toFixed(2)}`
          )}
        </Button>
      )}

      <div className="text-xs text-center text-muted-foreground space-x-2">
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
    </form>
  );
}
