"use client";

import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  DialogFooter,
  Alert,
  AlertDescription,
} from "@/constants/ui/index";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

// Initialize Supabase client
const supabase = createClient();

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
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);

  // OTP form
  const form = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Handle the form submission with error handling
  const handleSubmit = async (data: OtpFormData) => {
    setError(null);
    try {
      await onSubmit(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to verify OTP. Please try again.");
      }
    }
  };

  // Resend OTP functionality
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setIsResending(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) throw error;

      // Reset the timer
      setResendTimer(60);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to resend verification code. Please try again.");
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 py-4"
      >
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
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

        <div className="text-center">
          <Button
            type="button"
            variant="link"
            className="text-green-600 hover:text-green-700 h-auto p-0"
            onClick={handleResendOtp}
            disabled={resendTimer > 0 || isResending}
          >
            {isResending
              ? "Sending..."
              : resendTimer > 0
                ? `Resend in ${resendTimer}s`
                : "Resend code"}
          </Button>
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
