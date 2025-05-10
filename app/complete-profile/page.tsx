"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { useUserStore } from "@/store/authStore";
import PhoneInput from "react-phone-input-2";
import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/constants/ui/index";

// Initialize Supabase client
const supabase = createClient();

// Define the form schema
const profileSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  dateOfBirth: z.date({
    required_error: "A date of birth is required.",
  }),
  phone: z.string().min(1, { message: "Phone number is required" }),
});

// Define the form data type
type ProfileFormData = z.infer<typeof profileSchema>;

export default function CompleteProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  // Prefix with underscore to avoid unused var warning since we're intentionally
  // not using it (handled in navbar instead)
  const { code: _code } = use(searchParams);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const refreshUserData = useUserStore((state) => state.refreshUserData);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        toast.error("Please login to complete your profile");
        router.push("/");
      }
    };

    checkAuth();
  }, [router]);

  // Form setup
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      dateOfBirth: undefined,
    },
  });

  // Handle form submission
  const onSubmit = async (data: ProfileFormData) => {
    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true);

    try {
      // Age verification
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
        form.setError("dateOfBirth", {
          type: "manual",
          message: "You must be at least 18 years old.",
        });
        setIsSubmitting(false);
        return;
      }

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Authentication error. Please login again.");
        setIsSubmitting(false);
        router.push("/");
        return;
      }

      // Update profile in database
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          date_of_birth: data.dateOfBirth.toISOString().split("T")[0],
          phone: data.phone,
          is_profile_complete: true, // Mark profile as complete
        })
        .eq("user_id", user.id);

      if (updateError) {
        toast.error("Failed to update profile: " + updateError.message);
        setIsSubmitting(false);
        return;
      }

      // Update local user state
      const userDataRefreshed = await refreshUserData();

      if (!userDataRefreshed) {
        console.warn(
          "Profile updated in database but failed to refresh user data in store"
        );
        // We still continue with navigation even if local store update failed
      }

      toast.success("Profile completed successfully!");

      // Ensure we set isSubmitting to false before navigation
      setIsSubmitting(false);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl font-montserrat">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-center">
            Please provide a few more details to complete your account setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* First Name / Last Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
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
                  control={form.control}
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
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <PhoneInput
                        country={"za"}
                        value={field.value || ""}
                        onChange={(phoneValue) => field.onChange(phoneValue)}
                        inputProps={{
                          id: "phone",
                          name: field.name,
                          onBlur: field.onBlur,
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
                control={form.control}
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
                              "w-full justify-start text-left font-normal",
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
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setIsDatePickerOpen(false);
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          fromYear={1920}
                          toYear={new Date().getFullYear()}
                          showCustomCaption={true}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Complete Profile"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          <p>All fields are required to proceed.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
