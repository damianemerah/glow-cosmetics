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
import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { supabaseClient } from "@/lib/supabaseClient";
import { useUserStore } from "@/store/authStore";

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
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const user = useUserStore((state) => state.user);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    emailOffers: false,
    joinRewards: false,
    country: "United States",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    textOffers: false,
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    nameOnCard: "",
    useSameAddress: true,
    saveInfo: false,
    mobileNumber: "",
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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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

    // Payment validation depends on payment method
    if (paymentMethod === "credit-card") {
      if (!formData.cardNumber) errors.cardNumber = "Card number is required";
      if (!formData.cardExpiry)
        errors.cardExpiry = "Expiration date is required";
      if (!formData.cardCvc) errors.cardCvc = "Security code is required";
      if (!formData.nameOnCard) errors.nameOnCard = "Name on card is required";
    }

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

      // Process payment
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
        }),
      });

      const paymentData = await response.json();

      if (!response.ok) {
        throw new Error(paymentData.error || "Payment processing failed");
      }

      // If using Paystack, redirect to their payment page
      if (paymentData.data && paymentData.data.authorization_url) {
        window.location.href = paymentData.data.authorization_url;
        return;
      }

      // If not redirected, go to order confirmation
      router.push(`/order-confirmation?id=${order.id}`);
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error("Failed to complete checkout");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Contact */}
      <div>
        <h2 className="text-lg font-semibold mb-4 font-montserrat">Contact</h2>
        <div className="space-y-4">
          <div>
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
        </div>
      </div>

      {/* Delivery */}
      <div>
        <h2 className="text-lg font-semibold mb-4 font-montserrat">Delivery</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="country">Country/Region</Label>
            <Select
              value={formData.country}
              onValueChange={(value) => handleSelectChange("country", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="United States">United States</SelectItem>
                <SelectItem value="Canada">Canada</SelectItem>
                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                <SelectItem value="Australia">Australia</SelectItem>
                <SelectItem value="South Africa">South Africa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
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
            <div>
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
          <div>
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
          <div>
            <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
            <Input
              id="apartment"
              name="apartment"
              value={formData.apartment}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
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
            <div>
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
            <div>
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
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="flex items-center space-x-2 mb-4">
              <RadioGroupItem value="credit-card" id="credit-card" />
              <Label htmlFor="credit-card" className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Credit Card
              </Label>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <RadioGroupItem value="paystack" id="paystack" />
              <Label htmlFor="paystack" className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Paystack
              </Label>
            </div>
          </RadioGroup>

          {paymentMethod === "credit-card" && (
            <div className="space-y-4 p-4 border rounded-md mt-4">
              <div>
                <Label htmlFor="cardNumber">Card number</Label>
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  className={formErrors.cardNumber ? "border-red-500" : ""}
                />
                {formErrors.cardNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.cardNumber}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cardExpiry">Expiration date (MM/YY)</Label>
                  <Input
                    id="cardExpiry"
                    name="cardExpiry"
                    placeholder="MM/YY"
                    value={formData.cardExpiry}
                    onChange={handleInputChange}
                    className={formErrors.cardExpiry ? "border-red-500" : ""}
                  />
                  {formErrors.cardExpiry && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.cardExpiry}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="cardCvc">Security code</Label>
                  <Input
                    id="cardCvc"
                    name="cardCvc"
                    placeholder="CVC"
                    value={formData.cardCvc}
                    onChange={handleInputChange}
                    className={formErrors.cardCvc ? "border-red-500" : ""}
                  />
                  {formErrors.cardCvc && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.cardCvc}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="nameOnCard">Name on card</Label>
                <Input
                  id="nameOnCard"
                  name="nameOnCard"
                  value={formData.nameOnCard}
                  onChange={handleInputChange}
                  className={formErrors.nameOnCard ? "border-red-500" : ""}
                />
                {formErrors.nameOnCard && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.nameOnCard}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

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
          `Pay ${totalAmount.toFixed(2)} now`
        )}
      </Button>

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
