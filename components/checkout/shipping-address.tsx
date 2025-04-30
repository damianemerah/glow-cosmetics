"use client";

import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/constants/ui/index";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import type { ChangeEvent } from "react";

interface ShippingAddressData {
  country: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

interface ShippingAddressProps {
  formData: ShippingAddressData;
  errors: Record<keyof ShippingAddressData | "phone", string>; // Include phone explicitly if needed
  onInputChange: (name: keyof ShippingAddressData, value: string) => void;
  onPhoneChange: (value: string) => void;
}

export default function ShippingAddress({
  formData,
  errors,
  onInputChange,
  onPhoneChange,
}: ShippingAddressProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onInputChange(e.target.name as keyof ShippingAddressData, e.target.value);
  };

  const handleSelectChange = (value: string) => {
    onInputChange("country", value); // Assuming only country is a select for now
  };

  const handlePhoneInputChange = (value: string) => {
    // Basic validation/formatting could happen here if needed
    onPhoneChange(value);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 font-montserrat">
        Shipping Address
      </h2>
      <div className="space-y-4">
        {/* Country Select */}
        <div className="space-y-1.5">
          <Label htmlFor="checkout-country">Country/Region</Label>
          <Select
            name="country"
            value={formData.country}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger
              id="checkout-country"
              className={errors.country ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent>
              {/* Add more countries if needed */}
              <SelectItem value="South Africa">South Africa</SelectItem>
            </SelectContent>
          </Select>
          {errors.country && (
            <p className="text-red-600 text-sm mt-1">{errors.country}</p>
          )}
        </div>

        {/* First/Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="checkout-firstName">First name</Label>
            <Input
              id="checkout-firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className={errors.firstName ? "border-red-500" : ""}
            />
            {errors.firstName && (
              <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="checkout-lastName">Last name</Label>
            <Input
              id="checkout-lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className={errors.lastName ? "border-red-500" : ""}
            />
            {errors.lastName && (
              <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Phone Input */}
        <div className="space-y-1.5">
          <Label htmlFor="checkout-phone">Phone number</Label>
          {/* Ensure react-phone-input-2 is installed */}
          <PhoneInput
            country={"za"} // Default country South Africa
            value={formData.phone}
            onChange={handlePhoneInputChange}
            inputProps={{ id: "checkout-phone", name: "phone", required: true }}
            containerClass="w-full"
            inputClass={`!w-full !py-2 !px-3 !h-10 !border !rounded-md ${errors.phone ? "!border-red-500" : "!border-input"}`} // Use !important to override defaults if needed
            placeholder="+27 12 345 6789"
          />
          {errors.phone && (
            <p id="checkout-phone-error" className="text-red-600 text-sm mt-1">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <Label htmlFor="checkout-address">Address</Label>
          <Input
            id="checkout-address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className={errors.address ? "border-red-500" : ""}
          />
          {errors.address && (
            <p className="text-red-600 text-sm mt-1">{errors.address}</p>
          )}
        </div>

        {/* Apartment */}
        <div className="space-y-1.5">
          <Label htmlFor="checkout-apartment">
            Apartment, suite, etc. (optional)
          </Label>
          <Input
            id="checkout-apartment"
            name="apartment"
            value={formData.apartment}
            onChange={handleChange}
          />
        </div>

        {/* City / State / Zip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="checkout-city">City</Label>
            <Input
              id="checkout-city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className={errors.city ? "border-red-500" : ""}
            />
            {errors.city && (
              <p className="text-red-600 text-sm mt-1">{errors.city}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="checkout-state">State / Province</Label>
            <Input
              id="checkout-state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              className={errors.state ? "border-red-500" : ""}
            />
            {errors.state && (
              <p className="text-red-600 text-sm mt-1">{errors.state}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="checkout-zipCode">Postal code</Label>
            <Input
              id="checkout-zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              required
              className={errors.zipCode ? "border-red-500" : ""}
            />
            {errors.zipCode && (
              <p className="text-red-600 text-sm mt-1">{errors.zipCode}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
