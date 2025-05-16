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
  const { code: _code } = use(searchParams);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const refreshUserData = useUserStore((state) => state.refreshUserData);
  const user = useUserStore((state) => state.user);
  const isFetchingUser = useUserStore((state) => state.isFetchingUser);
  const needsProfileCompletion = useUserStore(
    (state) => state.needsProfileCompletion
  );

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

  useEffect(() => {
    // Refresh user data on mount
    const init = async () => {
      await refreshUserData();
    };
    init();
  }, [refreshUserData]);

  useEffect(() => {
    if (isFetchingUser) return;
    //reset form with default values

    if (user) {
      form.reset({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        phone: user.phone || "",
        dateOfBirth: user.date_of_birth
          ? new Date(user.date_of_birth)
          : undefined,
      });
    }
  }, [user, isFetchingUser, form]);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        toast.error("Please login to complete your profile");
        console.log("NO ACTION NEEDED🎈🎈");
        router.push("/");
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (isFetchingUser) return;
    const needCompletion = needsProfileCompletion();
    if (!needCompletion || !user) {
      console.log("NO ACTION NEEDED💎💎");
      router.push("/");
    }
  }, [needsProfileCompletion, isFetchingUser, router, user]);

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
      }

      toast.success("Profile completed successfully!");

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
                    <FormLabel>Date of Birth</FormLabel>
                    <Popover
                      open={isDatePickerOpen}
                      onOpenChange={setIsDatePickerOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? format(field.value, "PPP")
                              : "Pick a date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
                          disabled={(date) => date > new Date()}
                          initialFocus
                          fromYear={1920}
                          toYear={new Date().getFullYear()}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
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
      </Card>
    </div>
  );
}
