"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useUserStore } from "@/store/authStore";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/constants/ui/index";

import { EmailForm, EmailFormData } from "./forms/EmailForm";
import { UserDetailsForm, UserDetailsFormData } from "./forms/UserDetailsForm";
import { OtpVerificationForm, OtpFormData } from "./forms/OtpVerificationForm";
import { ErrorView } from "./forms/ErrorView";

// Initialize Supabase client
const supabase = createClient();

// Define the view states for the popup
type PopupView =
  | "email"
  | "newUserDetails"
  | "otpVerification"
  | "oauthDetails"
  | "loading"
  | "error";

export function LoginPopup() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [currentView, setCurrentView] = useState<PopupView>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempEmail, setTempEmail] = useState<string>("");
  const shouldShowModal = useUserStore((state) => state.shouldShowModal);
  const refreshUserData = useUserStore((state) => state.refreshUserData);

  useEffect(() => {
    if (shouldShowModal) {
      setOpen(true);
    }
  }, [shouldShowModal]);

  // Check if user exists by email
  const checkUserExistsByEmail = async (email: string) => {
    try {
      const { data, error } = await supabase.rpc("get_user_id_by_email", {
        p_email: email,
      });

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
          data: {
            first_name: signupData.firstName,
            last_name: signupData.lastName,
            date_of_birth: signupData.dateOfBirth.toISOString().split("T")[0],
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

  // Handle OTP verification
  const handleOtpSubmit = async (data: OtpFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: tempEmail,
        token: data.otp,
        type: "email",
      });

      if (error) throw error;

      // Ensure user data is refreshed in the store
      await refreshUserData();

      // Close modal on successful login
      setOpen(false);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to verify OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
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
        if (loginData) setCurrentView("otpVerification");
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
        setError("You must be at least 18 years old.");
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
      setCurrentView("otpVerification");
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

  const getViewContent = () => {
    switch (currentView) {
      case "email":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-montserrat">
                Join Glow by Sylvia
              </DialogTitle>
              <DialogDescription className="text-center">
                Enter your email to continue or create an account
              </DialogDescription>
            </DialogHeader>
            <EmailForm
              onSubmit={handleEmailSubmit}
              onOAuthSignIn={handleOAuthSignIn}
              isLoading={isLoading}
            />
          </>
        );

      case "newUserDetails":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-montserrat">
                Complete Your Profile
              </DialogTitle>
              <DialogDescription className="text-center">
                Please provide a few more details to create your account
              </DialogDescription>
            </DialogHeader>
            <UserDetailsForm
              onSubmit={handleUserDetailsSubmit}
              onBack={() => setCurrentView("email")}
              isLoading={isLoading}
            />
          </>
        );

      case "otpVerification":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-montserrat">
                Enter Verification Code
              </DialogTitle>
              <DialogDescription className="text-center">
                We&apos;ve sent a verification code to{" "}
                <strong>{tempEmail}</strong>
              </DialogDescription>
            </DialogHeader>
            <OtpVerificationForm
              onSubmit={handleOtpSubmit}
              onBack={() => setCurrentView("email")}
              isLoading={isLoading}
              email={tempEmail}
            />
          </>
        );

      case "error":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-montserrat text-red-500">
                Error
              </DialogTitle>
            </DialogHeader>
            <ErrorView error={error} onRetry={() => setCurrentView("email")} />
          </>
        );

      default:
        return null;
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
        {getViewContent()}
      </DialogContent>
    </Dialog>
  );
}
