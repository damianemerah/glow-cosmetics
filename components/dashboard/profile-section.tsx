"use client";
import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import useSWR from "swr";
import { format } from "date-fns";
import { Edit, Upload, AlertCircle, CalendarIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { capitalize } from "@/utils"; // Assuming you have this utility

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Progress,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Calendar,
  Popover,
  PopoverTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/constants/ui/index"; // Assuming this is your Shadcn UI export path
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Profile } from "@/types/index";
import { uploadAvatar, updateProfile } from "@/actions/dashboardAction"; // Your server actions
import { ContainedPopoverContent } from "../ui/ContainedPopoverContent"; // Assuming this path is correct

// Define Zod schema for form validation
const profileFormSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required.")
    .max(50, "First name is too long."),
  last_name: z
    .string()
    .min(1, "Last name is required.")
    .max(50, "Last name is too long."),
  email: z.string().email("Invalid email address."),
  phone: z
    .string()
    .min(10, "Phone number seems too short.")
    .max(15, "Phone number seems too long.")
    .optional()
    .or(z.literal("")), // Optional, allow empty
  date_of_birth: z
    .date({
      invalid_type_error: "That's not a valid date!",
    })
    .nullable()
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileSectionProps {
  profile: Profile | null;
  initialError: boolean;
}

export default function ProfileSection({
  profile: initialProfile,
  initialError,
}: ProfileSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const router = useRouter();

  const {
    data: profile,
    error: swrError,
    mutate,
  } = useSWR<Profile | null>("user-profile", null, {
    // Key can be anything unique if fetcher is null
    fallbackData: initialProfile,
    revalidateOnFocus: false, // Keep manual control via mutate
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      // Initial defaults, will be overridden by useEffect
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      date_of_birth: undefined,
    },
  });

  const watchedFirstName = form.watch("first_name"); // For dynamic avatar fallback

  // Effect to reset form when dialog opens or profile data (from SWR) changes
  useEffect(() => {
    if (profile) {
      // Check if profile data is available
      form.reset({
        first_name: capitalize(profile.first_name) || "",
        last_name: capitalize(profile.last_name) || "",
        email: profile.email || "",
        phone: profile.phone || "",
        date_of_birth: profile.date_of_birth
          ? new Date(profile.date_of_birth)
          : undefined,
      });
      if (isDialogOpen && !avatarFile) {
        // Only reset preview from profile if dialog is open AND no new file is selected
        setAvatarPreview(profile.avatar || null);
      } else if (!isDialogOpen) {
        // When dialog closes
        setAvatarFile(null); // Clear staged avatar file
        setAvatarPreview(profile.avatar || null); // Revert preview to current profile avatar
      }
    }
  }, [profile, form, isDialogOpen, avatarFile]); // Removed avatarFile from deps to avoid loop on its own change

  const calculateProfileCompletion = useCallback(() => {
    if (!profile) return 0;
    const fieldsToConsider: (string | Date | null | undefined)[] = [
      profile.first_name,
      profile.last_name,
      profile.email,
      profile.phone,
      profile.date_of_birth,
      profile.avatar, // Optionally include avatar in completion
    ];
    const completedFields = fieldsToConsider.filter(
      (field) =>
        field &&
        String(field).trim() !== "" &&
        field !== null &&
        field !== undefined
    ).length;
    return Math.round((completedFields / fieldsToConsider.length) * 100);
  }, [profile]);

  const handleAvatarFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileSizeMB = file.size / 1024 / 1024;
      if (fileSizeMB > 2) {
        // Client-side check for immediate feedback
        toast.error("File is too large.", {
          description: "Please select an image smaller than 2MB.",
        });
        event.target.value = ""; // Clear the file input
        setAvatarFile(null); // Ensure staged file is cleared
        setAvatarPreview(profile?.avatar || null); // Revert preview
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      // If user cancels file selection
      setAvatarFile(null);
      setAvatarPreview(profile?.avatar || null);
    }
  };

  async function onSubmit(formData: ProfileFormValues) {
    setIsSubmitting(true);
    let newAvatarUrl: string | undefined = undefined;

    if (!profile?.user_id) {
      toast.error("Authentication error.", {
        description: "User ID not found. Please log in again.",
      });
      setIsSubmitting(false);
      return;
    }

    // 1. Handle Avatar Upload if a new file is staged
    if (avatarFile) {
      const uploadResult = await uploadAvatar(avatarFile, profile.user_id);
      if (!uploadResult.success) {
        toast.error(uploadResult.error || "Failed to upload avatar.", {
          description:
            uploadResult.errorCode === "FILE_TOO_LARGE"
              ? "Selected image is too large (max 2MB)." // Using 2MB as per your server error message
              : "Please try again or select a different image.",
          icon: <AlertCircle className="text-red-500 w-5 h-5" />,
        });
        setIsSubmitting(false);
        return;
      }
      newAvatarUrl = uploadResult.data;
      setAvatarFile(null); // Clear staged file as it's now processed (or attempted)
    }

    // 2. Prepare Profile Data for Update
    try {
      const updatePayload: Partial<Profile> = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        // email: formData.email, // Typically email shouldn't be updated here directly
        phone: formData.phone || null, // Send null if empty string to clear
        date_of_birth: formData.date_of_birth
          ? formData.date_of_birth.toISOString().split("T")[0]
          : null, // Send null if undefined/cleared
        updated_at: new Date().toISOString(),
      };

      if (newAvatarUrl !== undefined) {
        updatePayload.avatar = newAvatarUrl;
      }

      // 3. Update Profile
      const profileUpdateResult = await updateProfile(
        updatePayload,
        profile.user_id
      );

      if (!profileUpdateResult.success) {
        toast.error("Failed to update profile.", {
          description: "Please check your details and try again.",
        });
      } else {
        toast.success("Profile updated successfully!");
        setIsDialogOpen(false);
      }

      await mutate(); // Revalidate SWR to get the latest profile state
      router.refresh(); // If there are any server-side computed fields or redirects based on profile
    } catch (error) {
      console.error("Profile update submission error:", error);
      toast.error("An unexpected error occurred while updating your profile.");
      await mutate(); // Revalidate SWR on unexpected error
    } finally {
      setIsSubmitting(false);
    }
  }

  if (swrError || (initialError && !profile)) {
    // Check if SWR has an error or if initial load failed and SWR hasn't populated data
    return (
      <div className="flex items-center p-4 text-red-800 bg-red-50 rounded-md my-6">
        <AlertCircle className="h-5 w-5 mr-2" />
        <p>
          Unable to load profile data. Please refresh the page or try again
          later.
        </p>
      </div>
    );
  }

  // Display a loading state if SWR is fetching and there's no profile data yet
  // This is mainly for the initial load if `initialProfile` was null.
  // const { isLoading: isSwrProfileLoading } = useSWR("user-profile"); // Can get isLoading from SWR itself
  // if (isSwrProfileLoading && !profile) {
  //    return <p>Loading profile...</p>; // Or a skeleton loader
  // }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 md:h-20 md:w-20">
            <AvatarImage
              src={
                profile?.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${
                  capitalize(profile?.first_name) || "User"
                }`
              }
              alt={capitalize(profile?.first_name) || "User"}
            />
            <AvatarFallback className="text-xl md:text-2xl">
              {capitalize(profile?.first_name)?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-800">
              {capitalize(profile?.first_name)} {capitalize(profile?.last_name)}
            </h3>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>
        </div>

        <div className="mt-4 md:mt-0 ">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium">Profile Completion</span>
            <span className="text-sm font-medium">
              {calculateProfileCompletion()}%
            </span>
          </div>
          <Progress
            value={calculateProfileCompletion()}
            className="h-2 w-full md:w-[200px]"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-4 md:ml-6 md:mt-0"
          onClick={() => setIsDialogOpen(true)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] profile-dialog-content max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-montserrat">
              Edit Profile
            </DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 pt-4"
            >
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={
                        avatarPreview || // Shows selected file preview, then current profile avatar
                        profile?.avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${
                          watchedFirstName || profile?.first_name || "User"
                        }`
                      }
                      alt={watchedFirstName || profile?.first_name || "User"}
                    />
                    <AvatarFallback className="text-3xl">
                      {(watchedFirstName || profile?.first_name || "U")?.charAt(
                        0
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md hover:bg-primary/90 cursor-pointer">
                    <label
                      htmlFor="avatar-upload"
                      className="cursor-pointer flex items-center justify-center h-full w-full"
                    >
                      <Upload className="h-4 w-4" />
                      <input
                        id="avatar-upload"
                        type="file"
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleAvatarFileSelect}
                      />
                    </label>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload a new profile picture (Max 2MB).
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john.doe@example.com"
                        {...field}
                        disabled // Email is typically not editable here
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <PhoneInput
                        country={"za"}
                        value={field.value || ""}
                        onChange={(phoneValue) =>
                          field.onChange(
                            // Ensure value passed to RHF is string
                            phoneValue
                              ? phoneValue.startsWith("+")
                                ? phoneValue
                                : `+${phoneValue}`
                              : ""
                          )
                        }
                        inputProps={{ name: field.name, onBlur: field.onBlur }}
                        containerClass="w-full"
                        inputClass="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_of_birth"
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
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP") // Make sure field.value is a Date object
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <ContainedPopoverContent
                        containerSelector=".profile-dialog-content"
                        className="w-auto p-0 z-[60]" // Ensure z-index is higher than dialog overlay (default 50 for Dialog)
                        align="start"
                        onInteractOutside={(e) => {
                          if (
                            (e.target as HTMLElement)?.closest(
                              "[data-radix-popper-content-wrapper]"
                            ) &&
                            (e.target as HTMLElement)?.closest(
                              '[role="dialog"]'
                            )
                          ) {
                            // Allow interaction inside the dialog's popover
                          } else if (
                            (e.target as HTMLElement)?.closest(
                              '[role="combobox"]'
                            )
                          ) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <Calendar
                          mode="single"
                          captionLayout="dropdown-buttons"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
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
                          initialFocus
                        />
                      </ContainedPopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
