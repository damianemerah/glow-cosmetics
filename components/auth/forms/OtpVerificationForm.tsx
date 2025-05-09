"use client";

import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  DialogFooter,
} from "@/constants/ui/index";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

// Define the form schema
const otpSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 digits" }),
});

export type OtpFormData = z.infer<typeof otpSchema>;

interface OtpVerificationFormProps {
  onSubmit: (data: OtpFormData) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
  email: string;
}

export function OtpVerificationForm({
  onSubmit,
  onBack,
  isLoading,
  email,
}: OtpVerificationFormProps) {
  // OTP form
  const form = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verification Code</FormLabel>
              <FormControl>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    onComplete={(value) => {
                      if (value.length === 6) {
                        form.setValue("otp", value);
                      }
                    }}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="py-2 text-sm text-muted-foreground">
          Please check <span className="font-medium">{email}</span> for the
          verification code. It may take a few moments to arrive.
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="mb-2 sm:mb-0"
          >
            Back
          </Button>
          <Button
            type="submit"
            className="bg-green-500 hover:bg-green-600"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoading ? "Verifying" : "Verify & Sign In"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
