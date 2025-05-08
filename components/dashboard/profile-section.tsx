"use client";
import React, { useState, useEffect } from "react"; // Added useEffect
import useSWR from "swr";
import { format } from "date-fns";
import { Edit, Upload, AlertCircle, CalendarIcon } from "lucide-react"; // Added CalendarIcon
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import { useForm } from "react-hook-form"; // Added
import { zodResolver } from "@hookform/resolvers/zod"; // Added
import * as z from "zod"; // Added
import { capitalize } from "@/utils";

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
  // Label, // Replaced by FormLabel
  Calendar,
  Popover,
  // PopoverContent,
  PopoverTrigger,
  Form, // Added
  FormControl, // Added
  // FormDescription, // Optional
  FormField, // Added
  FormItem, // Added
  FormLabel, // Added
  FormMessage, // Added
} from "@/constants/ui/index";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Profile } from "@/types/index";
import { uploadAvatar, updateProfile } from "@/actions/dashboardAction";
import { ContainedPopoverContent } from "../ui/ContainedPopoverContent";

// Define Zod schema for form validation
const profileFormSchema = z.object({
  first_name: z.string().min(1, "First name is required."),
  last_name: z.string().min(1, "Last name is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().min(10, "Phone number is required and seems too short."), // Adjust as needed
  date_of_birth: z
    .date({
      required_error: "Date of birth is required.",
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
    error,
    mutate,
  } = useSWR<Profile | null>("user-profile", null, {
    fallbackData: initialProfile,
    revalidateOnFocus: false,
  });

  // Initialize react-hook-form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: capitalize(initialProfile?.first_name) || "",
      last_name: capitalize(initialProfile?.last_name) || "",
      email: initialProfile?.email || "",
      phone: initialProfile?.phone || "",
      date_of_birth: initialProfile?.date_of_birth
        ? new Date(initialProfile.date_of_birth)
        : undefined,
    },
  });

  const watchedFirstName = form.watch("first_name"); // For avatar preview

  // Effect to reset form when dialog opens or profile data changes
  useEffect(() => {
    if (profile) {
      form.reset({
        first_name: capitalize(profile.first_name) || "",
        last_name: capitalize(profile.last_name) || "",
        email: profile.email || "",
        phone: profile.phone || "",
        date_of_birth: profile.date_of_birth
          ? new Date(profile.date_of_birth)
          : undefined,
      });
      if (!avatarFile) {
        // Only reset preview if user hasn't selected a new file
        setAvatarPreview(profile.avatar || null);
      }
    }
  }, [profile, form, isDialogOpen, avatarFile]); // Rerun if dialog opens to ensure latest profile data

  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    const fields = [
      profile.first_name,
      profile.last_name,
      profile.email,
      profile.phone,
      profile.date_of_birth,
    ];
    const completedFields = fields.filter(
      (field) => field && String(field).trim() !== ""
    ).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const handleOpenDialog = () => {
    // Form reset is now handled by useEffect based on `isDialogOpen` and `profile`
    setIsDialogOpen(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);

    if (!profile?.user_id) {
      toast.warning("User ID not found");
      setIsSubmitting(false);
      return;
    }

    try {
      const updateData: Partial<Profile> = {
        ...data,
        date_of_birth: data.date_of_birth
          ? data.date_of_birth.toISOString().split("T")[0]
          : undefined,
        updated_at: new Date().toISOString(),
      };

      if (avatarFile) {
        try {
          const avatarUrl = await uploadAvatar(avatarFile, profile.user_id);
          updateData.avatar = avatarUrl;
        } catch (uploadError) {
          const err = uploadError as Error;
          toast.warning("Failed to upload profile picture", {
            description: err?.message || "An error occurred",
            icon: <AlertCircle className="text-red-500 w-5 h-5" />,
            duration: 8000,
          });
          setIsSubmitting(false); // Stop submission if avatar upload fails
          return;
        }
      }

      await updateProfile(updateData, profile.user_id);

      mutate(
        (currentProfile) =>
          currentProfile ? { ...currentProfile, ...updateData } : null,
        false
      );

      toast.success("Profile updated successfully");
      setIsDialogOpen(false);
      setAvatarFile(null);
      router.refresh();
    } catch (error) {
      console.error("Profile update error:", error);
      toast.warning("Failed to update profile");
      mutate(); // Revalidate SWR cache on error
    } finally {
      setIsSubmitting(false);
    }
  }

  if (error || initialError) {
    toast.warning("Failed", {
      description: "Unable to load profile data. Please try again.",
    });
    // Consider returning a skeleton or error message UI here
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        {/* ... (Profile display part remains the same) ... */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={
                profile?.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${
                  profile?.first_name || "User"
                }`
              }
              alt={capitalize(profile?.first_name) || "User"}
            />
            <AvatarFallback>
              {capitalize(profile?.first_name)?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">
              {capitalize(profile?.first_name)} {capitalize(profile?.last_name)}
            </h3>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>
        </div>

        <div className="mt-4 md:mt-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium">Profile Completion</span>
            <span className="text-sm font-medium">
              {calculateProfileCompletion()}%
            </span>
          </div>
          <Progress
            value={calculateProfileCompletion()}
            className="h-2 w-[200px]"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-4 md:mt-0"
          onClick={handleOpenDialog}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] profile-dialog-content">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information below.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={
                        avatarPreview ||
                        profile?.avatar || // Fallback to current profile avatar if preview not set
                        `https://api.dicebear.com/7.x/initials/svg?seed=${
                          watchedFirstName || profile?.first_name || "User"
                        }`
                      }
                      alt={watchedFirstName || profile?.first_name || "User"}
                    />
                    <AvatarFallback>
                      {(watchedFirstName || profile?.first_name)?.charAt(0) ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 cursor-pointer">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <Upload className="h-4 w-4" />
                      <input
                        id="avatar-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Click the icon to upload a new profile picture
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
                        country={"za"} // Or your default country
                        value={field.value || ""}
                        onChange={(phoneValue) =>
                          field.onChange(
                            phoneValue.startsWith("+")
                              ? phoneValue
                              : `+${phoneValue}`
                          )
                        }
                        inputProps={{
                          name: field.name,
                          onBlur: field.onBlur,
                          // required: true, // react-hook-form handles this via schema
                        }}
                        containerClass="w-full"
                        // Apply shadcn input styles for consistency.
                        // You might need to fine-tune these or use a wrapper component.
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
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      {/* 👇 MODIFICATION HERE FOR Z-INDEX 👇 */}
                      <ContainedPopoverContent
                        containerSelector=".profile-dialog-content"
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
                          selected={field.value || undefined}
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

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
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
