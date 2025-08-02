"use client";

import { RadioGroup, RadioGroupItem, Label } from "@/constants/ui/index";
import { BanknoteIcon, CreditCard } from "lucide-react";
import { formatZAR } from "@/utils";
import { PaymentMethodType } from "@/types";

interface BankDetails {
  bank_name: string;
  account_name: string;
  account_number: string;
  branch_code: string;
}

interface PaymentMethodProps {
  selectedMethod: PaymentMethodType;
  onMethodChange: (value: PaymentMethodType) => void;
  bankDetails: BankDetails;
  whatsappNumber: string;
  paymentReference: string; // The generated reference
  totalAmount: number; // To display amount for transfer
}

export default function PaymentMethod({
  selectedMethod,
  onMethodChange,
  bankDetails,
  whatsappNumber,
  paymentReference,
  totalAmount,
}: PaymentMethodProps) {
  // Generate WhatsApp URL only when needed
  const generateWhatsAppUrl = () => {
    if (!paymentReference) return "#"; // Return placeholder if no ref yet
    const text = `Hello, I have made a direct transfer for my order *${paymentReference}* for *${formatZAR(totalAmount)}*. Please confirm my payment. Order Reference: ${paymentReference}\n\n(Please attach a screenshot of your payment receipt)`;
    return `https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 font-montserrat">Payment</h2>
      <p className="text-sm text-muted-foreground mb-3">
        All transactions are secure and encrypted.
      </p>
      <RadioGroup
        value={selectedMethod}
        onValueChange={(value) => onMethodChange(value as PaymentMethodType)}
        className="space-y-3" // Increased spacing
      >
        {/* Paystack Option */}
        <Label
          htmlFor="paystack"
          className={`flex items-center space-x-3 border p-4 rounded-md cursor-pointer transition-colors hover:border-gray-400 ${
            // Increased padding
            selectedMethod === "paystack"
              ? "border-primary ring-1 ring-primary"
              : "border-input"
          }`}
        >
          <RadioGroupItem value="paystack" id="paystack" />
          <CreditCard className="h-5 w-5 text-gray-600" />{" "}
          {/* Slightly larger icon */}
          <span className="font-medium text-sm">Card Payment (Paystack)</span>
        </Label>

        {/* Bank Transfer Option */}
        <Label
          htmlFor="bank_transfer"
          className={`flex items-center space-x-3 border p-4 rounded-md cursor-pointer transition-colors hover:border-gray-400 ${
            // Increased padding
            selectedMethod === "bank_transfer"
              ? "border-primary ring-1 ring-primary"
              : "border-input"
          }`}
        >
          <RadioGroupItem value="bank_transfer" id="bank_transfer" />
          <BanknoteIcon className="h-5 w-5 text-gray-600" />{" "}
          {/* Slightly larger icon */}
          <span className="font-medium text-sm">Bank Transfer / EFT</span>
        </Label>
      </RadioGroup>

      {/* Bank Transfer Details (Conditional) */}
      {selectedMethod === "bank_transfer" && (
        <div className="mt-4 space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
          {" "}
          {/* Styled info box */}
          <p className="text-sm font-medium text-blue-800">
            Please use the details below for your Bank Transfer / EFT:
          </p>
          <div className="bg-white p-3 rounded border border-blue-100 text-sm space-y-1.5">
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
              <strong>Amount:</strong>{" "}
              <span className="font-semibold">{formatZAR(totalAmount)}</span>
            </p>
            <p>
              <strong>Reference:</strong>{" "}
              <span className="font-semibold text-primary">
                {paymentReference || "(Use Order # after completion)"}
              </span>
            </p>
          </div>
          <p className="text-xs text-blue-700">
            After placing the order and making payment, please use the button
            below or manually contact us on WhatsApp ({whatsappNumber}) with
            your Order Reference (<strong>{paymentReference || "..."}</strong>)
            and proof of payment. Your order status will be updated upon
            confirmation.
          </p>
          {/* Show WhatsApp link only if reference exists */}
          {paymentReference && (
            <a
              href={generateWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-3" // Margin top
            >
              <div className="w-full border border-green-500 text-green-600 hover:bg-green-50 text-center py-2 px-4 rounded-md text-sm font-medium transition-colors">
                Confirm Transfer via WhatsApp
              </div>
              {/* Use div styled as button if Link component causes issues */}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
