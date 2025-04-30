"use client";

import { RadioGroup, RadioGroupItem, Label } from "@/constants/ui/index";
import { formatZAR } from "@/utils";

interface DeliveryOption {
  id: string;
  name: string;
  fee: number;
}

interface DeliveryMethodProps {
  options: DeliveryOption[];
  selectedMethod: string;
  onMethodChange: (value: string) => void;
  error?: string;
}

export default function DeliveryMethod({
  options,
  selectedMethod,
  onMethodChange,
  error,
}: DeliveryMethodProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-2">Delivery Method</h3>
      <RadioGroup
        value={selectedMethod}
        onValueChange={onMethodChange}
        className="space-y-2"
        aria-label="Delivery Method"
        name="deliveryMethod" // Keep name for potential non-JS
      >
        {options.map((option) => (
          <Label
            key={option.id}
            htmlFor={`delivery-${option.id}`} // Unique ID
            className={`flex items-center justify-between border p-3 rounded-md cursor-pointer transition-colors hover:border-gray-400 ${
              selectedMethod === option.id
                ? "border-primary ring-1 ring-primary" // Use primary color for selection
                : "border-input" // Default border
            }`}
            aria-invalid={!!error}
            aria-describedby="deliveryMethod-error"
          >
            <div className="flex items-center space-x-3">
              {" "}
              {/* Increased spacing */}
              <RadioGroupItem value={option.id} id={`delivery-${option.id}`} />
              <span className="font-medium text-sm">{option.name}</span>
            </div>
            <span
              className={`text-sm font-medium ${option.fee === 0 ? "text-green-600" : "text-gray-700"}`}
            >
              {option.fee === 0 ? "Free" : formatZAR(option.fee)}
            </span>
          </Label>
        ))}
      </RadioGroup>
      {error && (
        <p id="deliveryMethod-error" className="text-red-600 text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
