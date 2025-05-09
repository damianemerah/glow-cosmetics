"use client";

import { Loader2, Mail } from "lucide-react";
import { FaGoogle, FaApple } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Button,
  Input,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/constants/ui/index";

// Define the form schema
const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export type EmailFormData = z.infer<typeof emailSchema>;

interface EmailFormProps {
  onSubmit: (data: EmailFormData) => Promise<void>;
  onOAuthSignIn: (provider: "google" | "apple") => Promise<void>;
  isLoading: boolean;
}

export function EmailForm({
  onSubmit,
  onOAuthSignIn,
  isLoading,
}: EmailFormProps) {
  // Email form
  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Mail className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Please wait" : "Continue with Email"}
        </Button>
        {/* OAuth Buttons */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOAuthSignIn("google")}
            disabled={isLoading}
          >
            <FaGoogle className="mr-2 h-4 w-4" /> Google
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOAuthSignIn("apple")}
            disabled={isLoading}
          >
            <FaApple className="mr-2 h-4 w-4" /> Apple
          </Button>
        </div>
      </form>
    </Form>
  );
}
