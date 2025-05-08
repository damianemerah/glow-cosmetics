"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Mail } from "lucide-react";
import { FaGoogle, FaApple } from "react-icons/fa";
import { createClient } from "@/utils/supabase/client";
import { useUserStore } from "@/store/authStore";
import PhoneInput from "react-phone-input-2";

import { cn } from "@/lib/utils";

import {
  Button,
  Input,
  Checkbox,
  Calendar,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Popover,
  PopoverTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/constants/ui/index";

import { ContainedPopoverContent } from "@/components/ui/ContainedPopoverContent";

// Initialize Supabase client
const supabase = createClient();

// Define the form schemas
const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

const userDetailsSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  dateOfBirth: z.date({
    required_error: "A date of birth is required.",
  }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  receiveEmails: z.boolean().default(false),
});

// Define the view states for the popup
type PopupView =
  | "email"
  | "newUserDetails"
  | "magicLinkSent"
  | "oauthDetails"
  | "loading"
  | "error";

// Define the form data types
type EmailFormData = z.infer<typeof emailSchema>;
type UserDetailsFormData = z.infer<typeof userDetailsSchema>;

export function LoginPopup() {
  const [open, setOpen] = useState(false);
  const [currentView, setCurrentView] = useState<PopupView>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [tempEmail, setTempEmail] = useState<string>("");
  const shouldShowModal = useUserStore((state) => state.shouldShowModal);

  useEffect(() => {
    if (shouldShowModal) {
      setOpen(true);
    }
  }, [shouldShowModal]);

  // Email form
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  // User details form
  const userDetailsForm = useForm<UserDetailsFormData>({
    resolver: zodResolver(userDetailsSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      receiveEmails: false,
      dateOfBirth: undefined,
    },
  });

  // Check if user exists by email
  const checkUserExistsByEmail = async (email: string) => {
    try {
      const { data, error } = await supabase.rpc("get_user_id_by_email", {
        p_email: email,
      });

      console.log(data, 1234, error);

      if (error) throw error;

      return data ? true : false;
    } catch (err) {
      console.error("Error checking user existence:", err);
      return false;
    }
  };

  // Handle login with email
  const handleLogin = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        },
      });

      if (error) throw error;

      return data;
    } catch (error) {
      throw error;
    }
  };

  // Handle signup with email
  const handleSignup = async (signupData: {
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    phone: string;
    receiveEmails: boolean;
  }) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: signupData.email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
          data: {
            first_name: signupData.firstName,
            last_name: signupData.lastName,
            date_of_birth: signupData.dateOfBirth,
            receive_emails: signupData.receiveEmails,
            phone: signupData.phone,
          },
        },
      });

      if (error) throw error;

      return data;
    } catch (error) {
      throw error;
    }
  };

  // Handle email form submission
  const handleEmailSubmit = async (data: EmailFormData) => {
    setIsLoading(true);
    setError(null);
    setTempEmail(data.email);
    try {
      const userExists = await checkUserExistsByEmail(data.email);
      if (userExists) {
        const loginData = await handleLogin(data.email);
        if (loginData) setCurrentView("magicLinkSent");
      } else {
        setCurrentView("newUserDetails");
      }
    } catch (err) {
      console.error("Error checking user:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to signin. Please try again."
      );
      setCurrentView("error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user details form submission
  const handleUserDetailsSubmit = async (data: UserDetailsFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const isAtLeast18YearsOld = (dateOfBirth: Date): boolean => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (
          monthDifference < 0 ||
          (monthDifference === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }
        return age >= 18;
      };

      if (!isAtLeast18YearsOld(data.dateOfBirth)) {
        userDetailsForm.setError("dateOfBirth", {
          type: "manual",
          message: "You must be at least 18 years old.",
        });
        setIsLoading(false);
        return;
      }

      const signupData = {
        email: tempEmail,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        phone: data.phone,
        receiveEmails: data.receiveEmails,
      };

      await handleSignup(signupData);
      setCurrentView("magicLinkSent");
    } catch (err) {
      console.error("Error in signup process:", err);
      setError(
        err instanceof Error ? err.message : "Failed to complete signup."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OAuth sign in
  const handleOAuthSignIn = async (provider: "google" | "apple") => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/complete-profile`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error(`Error signing in with ${provider}:`, err);
      setError(
        err instanceof Error
          ? err.message
          : `Failed to sign in with ${provider}.`
      );
      setCurrentView("error");
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-500 hover:bg-green-600">
          Login / Sign Up
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] max-h-[85vh] overflow-y-auto login-dialog-content">
        {currentView === "email" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-montserrat">
                Join Glow by Sylvia
              </DialogTitle>
              <DialogDescription className="text-center">
                Enter your email to continue or create an account
              </DialogDescription>
            </DialogHeader>
            {/* Shadcn Form for Email */}
            <Form {...emailForm}>
              <form
                onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
                className="space-y-4 py-4"
              >
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                        />
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
                {/* OAuth Buttons remain the same */}
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
                    onClick={() => handleOAuthSignIn("google")}
                    disabled={isLoading}
                  >
                    <FaGoogle className="mr-2 h-4 w-4" /> Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOAuthSignIn("apple")}
                    disabled={isLoading}
                  >
                    <FaApple className="mr-2 h-4 w-4" /> Apple
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}

        {currentView === "newUserDetails" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-montserrat">
                Complete Your Profile
              </DialogTitle>
              <DialogDescription className="text-center">
                Please provide a few more details to create your account
              </DialogDescription>
            </DialogHeader>
            {/* Shadcn Form for User Details */}
            <Form {...userDetailsForm}>
              <form
                onSubmit={userDetailsForm.handleSubmit(handleUserDetailsSubmit)}
                className="space-y-4 py-4"
              >
                {/* First Name / Last Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={userDetailsForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={userDetailsForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Phone Field */}
                <FormField
                  control={userDetailsForm.control}
                  name="phone"
                  render={(
                    { field } // field contains { value, onChange, onBlur, name, ref }
                  ) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <PhoneInput
                          country={"za"}
                          value={field.value || ""}
                          // Use field.onChange which updates form state
                          onChange={(phoneValue) => field.onChange(phoneValue)}
                          inputProps={{
                            id: "phone",
                            name: field.name,
                            onBlur: field.onBlur, // Pass onBlur for validation triggers
                          }}
                          containerClass="w-full"
                          inputClass="w-full p-2 border rounded-md"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date of Birth Field */}
                <FormField
                  control={userDetailsForm.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of birth</FormLabel>
                      <Popover
                        open={isDatePickerOpen}
                        onOpenChange={setIsDatePickerOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              role="combobox"
                              aria-expanded={isDatePickerOpen}
                              className={cn(
                                "w-full justify-start text-left font-normal", // Use full width
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Select your date of birth</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        {/* Using standard PopoverContent now */}
                        <ContainedPopoverContent
                          containerSelector=".login-dialog-content"
                          className="w-auto p-0 z-[1000]"
                          align="start"
                          onInteractOutside={(e) => {
                            if (
                              (e.target as HTMLElement)?.closest(
                                '[data-slot="popover-trigger"]'
                              )
                            ) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <Calendar
                            mode="single"
                            showCustomCaption={true} // Use year-only dropdown caption
                            selected={field.value}
                            onSelect={(
                              currentValue,
                              _selectedDay,
                              _activeModifiers,
                              e
                            ) => {
                              e?.stopPropagation();
                              field.onChange(currentValue);
                              setIsDatePickerOpen(false);
                            }}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            fromYear={1920}
                            toYear={new Date().getFullYear()}
                          />
                        </ContainedPopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Receive Emails Field */}
                <FormField
                  control={userDetailsForm.control}
                  name="receiveEmails"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        I want to receive emails about promotions and new
                        products
                      </FormLabel>
                    </FormItem>
                  )}
                />

                {/* Terms Links */}
                <p className="text-xs text-muted-foreground">
                  By continuing, you agree to our{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </p>

                {/* Footer Buttons */}
                <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentView("email")}
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
                    {isLoading ? "Creating Account" : "Create Account"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}

        {/* magicLinkSent View */}
        {currentView === "magicLinkSent" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-montserrat">
                Check Your Email
              </DialogTitle>
              <DialogDescription className="text-center">
                We&apos;ve sent a magic link to <strong>{tempEmail}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <p className="mb-4">
                Click the link in the email to sign in to your account. If you
                don&apos;t see it, check your spam folder.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentView("email")}
                className="mt-2"
              >
                Back to Login
              </Button>
            </div>
          </>
        )}

        {/* error View */}
        {currentView === "error" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-montserrat text-red-500">
                Error
              </DialogTitle>
            </DialogHeader>
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <span className="text-red-600 text-xl">!</span>
              </div>
              <p className="mb-4 text-red-500">{error}</p>
              <Button
                type="button"
                onClick={() => setCurrentView("email")}
                className="mt-2 bg-green-500 hover:bg-green-600"
              >
                Try Again
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
