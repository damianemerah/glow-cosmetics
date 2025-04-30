"use client";

import { Input, Label, Checkbox } from "@/constants/ui/index";
import type { ChangeEvent } from "react";

interface ContactInformationProps {
  email: string;
  emailOffers: boolean;
  onEmailChange: (value: string) => void;
  onOffersChange: (checked: boolean) => void;
  error?: string;
  isUserLoggedIn: boolean; // To hide checkbox if logged in and already opted-in
  hasOptedInBefore?: boolean; // To hide checkbox if already opted-in
}

export default function ContactInformation({
  email,
  emailOffers,
  onEmailChange,
  onOffersChange,
  error,
  isUserLoggedIn,
  hasOptedInBefore,
}: ContactInformationProps) {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onEmailChange(e.target.value);
  };

  const handleCheckboxChange = (checked: boolean | "indeterminate") => {
    if (typeof checked === "boolean") {
      onOffersChange(checked);
    }
  };

  // Don't show checkbox if user is logged in AND has previously opted in
  const showOffersCheckbox = !isUserLoggedIn || !hasOptedInBefore;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 font-montserrat">Contact</h2>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="checkout-email">Email</Label>
          <Input
            id="checkout-email" // Unique ID
            name="email" // Keep name for potential non-JS form submission?
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={handleInputChange}
            className={error ? "border-red-500" : ""}
            aria-invalid={!!error}
            aria-describedby="checkout-email-error"
            required
          />
          {error && (
            <p id="checkout-email-error" className="text-red-600 text-sm mt-1">
              {error}
            </p>
          )}
        </div>
        {showOffersCheckbox && (
          <div className="flex items-center space-x-2 pt-1">
            <Checkbox
              id="checkout-emailOffers"
              name="emailOffers"
              checked={emailOffers}
              onCheckedChange={handleCheckboxChange}
            />
            <Label
              htmlFor="checkout-emailOffers"
              className="text-sm font-normal cursor-pointer"
            >
              Email me with news and offers
            </Label>
          </div>
        )}
      </div>
    </div>
  );
}
