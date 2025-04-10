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

import { checkUserExistsByEmail, login, signup } from "@/actions/authAction";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Initialize Supabase client
const supabase = createClient();

// Define the form schemas
const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

const userDetailsSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  dateOfBirth: z.date({ required_error: "Date of birth is required" }),
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
  const [date, setDate] = useState<Date>();
  const [tempEmail, setTempEmail] = useState<string>("");
  const shouldShowModal = useUserStore((state) => state.shouldShowModal);

  // Open the modal if shouldShowModal is true
  useEffect(() => {
    if (shouldShowModal) {
      setOpen(true);
    }
  }, [shouldShowModal]);

  // Email form
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  // User details form with added phone default value
  const userDetailsForm = useForm<UserDetailsFormData>({
    resolver: zodResolver(userDetailsSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      receiveEmails: false,
    },
  });

  // Handler to update phone number in the form state
  const handlePhoneChange = (value: string) => {
    userDetailsForm.setValue("phone", value);
  };

  // Handle email form submission
  const handleEmailSubmit = async (data: EmailFormData) => {
    setIsLoading(true);
    setError(null);
    setTempEmail(data.email);

    try {
      const userExists = await checkUserExistsByEmail(data.email);
      if (userExists) {
        const loginData = await login(data.email);
        if (loginData) {
          setCurrentView("magicLinkSent");
        }
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
      const signupData = {
        email: tempEmail,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        phone: data.phone, // include phone number in signup data
        receiveEmails: data.receiveEmails,
      };

      const isAtLeast13YearsOld = (dateOfBirth: Date): boolean => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        if (
          monthDifference < 0 ||
          (monthDifference === 0 && today.getDate() < birthDate.getDate())
        ) {
          return age > 13;
        }

        return age >= 13;
      };

      if (!isAtLeast13YearsOld(data.dateOfBirth)) {
        throw new Error("You must be at least 13 years old to sign up.");
        return;
      }

      await signup(signupData);
      setCurrentView("magicLinkSent");
    } catch (err) {
      console.error("Error in signup process:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to complete signup. Please try again."
      );
      setCurrentView("error");
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
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error(`Error signing in with ${provider}:`, err);
      setError(
        err instanceof Error
          ? err.message
          : `Failed to sign in with ${provider}. Please try again.`
      );
      setCurrentView("error");
      setIsLoading(false);
    }
  };

  // Reset the popup state
  // const resetPopup = () => {
  //   setCurrentView("email");
  //   setError(null);
  //   emailForm.reset();
  //   userDetailsForm.reset();
  //   setDate(undefined);
  // };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-500 hover:bg-green-600">
          Login / Sign Up
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
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
            <form
              onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
              className="space-y-4 py-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...emailForm.register("email")}
                  className="w-full"
                />
                {emailForm.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Continue with Email
                  </>
                )}
              </Button>
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
                  <FaGoogle className="mr-2 h-4 w-4" />
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthSignIn("apple")}
                  disabled={isLoading}
                >
                  <FaApple className="mr-2 h-4 w-4" />
                  Apple
                </Button>
              </div>
            </form>
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
            <form
              onSubmit={userDetailsForm.handleSubmit(handleUserDetailsSubmit)}
              className="space-y-4 py-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    {...userDetailsForm.register("firstName")}
                    className="w-full"
                  />
                  {userDetailsForm.formState.errors.firstName && (
                    <p className="text-sm text-red-500">
                      {userDetailsForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...userDetailsForm.register("lastName")}
                    className="w-full"
                  />
                  {userDetailsForm.formState.errors.lastName && (
                    <p className="text-sm text-red-500">
                      {userDetailsForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <PhoneInput
                  country={"za"}
                  value={userDetailsForm.watch("phone") || ""}
                  onChange={handlePhoneChange}
                  inputProps={{
                    id: "phone",
                    name: "phone",
                    required: true,
                  }}
                  containerClass="w-full"
                  inputClass="w-full p-2 border rounded-md"
                />
                {userDetailsForm.formState.errors.phone && (
                  <p className="text-sm text-red-500">
                    {userDetailsForm.formState.errors.phone.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select your date of birth"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0"
                    align="start"
                    side="top"
                  >
                    <Calendar
                      showCustomCaption={true}
                      mode="single"
                      selected={date}
                      onSelect={(selectedDate) => {
                        setDate(selectedDate);
                        if (selectedDate) {
                          userDetailsForm.setValue("dateOfBirth", selectedDate);
                        }
                      }}
                      disabled={(date) => {
                        const today = new Date();
                        return date > today;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {userDetailsForm.formState.errors.dateOfBirth && (
                  <p className="text-sm text-red-500">
                    {userDetailsForm.formState.errors.dateOfBirth.message}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="receiveEmails"
                  onCheckedChange={(checked) => {
                    userDetailsForm.setValue("receiveEmails", checked === true);
                  }}
                />
                <Label htmlFor="receiveEmails" className="text-sm">
                  I want to receive emails about promotions and new products
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                By continuing, you agree to our{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>
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
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}

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
