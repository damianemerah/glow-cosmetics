"use client";

import type React from "react";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Edit, Upload, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Profile } from "@/types/dashboard";
import { useRouter } from "next/navigation";
import useSWR from "swr";

import { uploadAvatar, updateProfile } from "@/actions/dashboardAction";

interface ProfileSectionProps {
  profile: Profile | null;
  initialError: boolean;
}

export default function ProfileSection({
  profile: initialProfile,
  initialError,
}: ProfileSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<Profile> | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const router = useRouter();

  // Use SWR for profile data
  const {
    data: profile,
    error,
    mutate,
  } = useSWR<Profile | null>(
    "user-profile",
    null, // No fetcher function because we're using initialData
    {
      fallbackData: initialProfile,
      revalidateOnFocus: false,
    }
  );

  // Calculate profile completion percentage
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
      (field) => field && field.trim() !== ""
    ).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const handleOpenDialog = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone: profile.phone,
      });

      if (profile.date_of_birth) {
        setDate(new Date(profile.date_of_birth));
      }
    }
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!profile?.user_id) {
      toast.error("User ID not found");
      setIsSubmitting(false);
      return;
    }

    try {
      // Validate phone number (South African format)
      if (formData?.phone && !formData.phone.match(/^\+27[0-9]{9}$/)) {
        toast.error("Phone number must be in format: +27XXXXXXXXX");
        setIsSubmitting(false);
        return;
      }

      // Prepare update data
      const updateData: Partial<Profile> = {
        first_name: formData?.first_name,
        last_name: formData?.last_name,
        email: formData?.email,
        phone: formData?.phone,
        date_of_birth: date ? date.toISOString().split("T")[0] : undefined,
        updated_at: new Date().toISOString(),
      };

      // Check if we have all required fields to mark profile as complete
      if (
        updateData.first_name &&
        updateData.last_name &&
        updateData.email &&
        updateData.phone &&
        updateData.date_of_birth
      ) {
        updateData.is_complete = true;
      }

      // If we have an avatar file, upload it
      if (avatarFile) {
        try {
          const avatarUrl = await uploadAvatar(avatarFile, profile.user_id);
          updateData.avatar = avatarUrl;
        } catch (uploadError) {
          const err = uploadError as Error;
          toast.error("Failed to upload profile picture", {
            description: err?.message || "An error occurred",
            icon: <AlertCircle className="text-red-500 w-5 h-5" />,
            duration: 8000,
          });
          return;
        }
      }

      // Update the profile in Supabase
      await updateProfile(updateData, profile.user_id);

      // Optimistically update the SWR cache
      mutate(
        {
          ...profile,
          ...updateData,
        },
        false
      );

      // Success message
      toast.success("Profile updated successfully");
      setIsDialogOpen(false);

      // Revalidate the page to show updated data
      router.refresh();
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile");

      // Revalidate on error
      mutate();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error || initialError) {
    toast.error("Failed", {
      description: "Unable to load profile data. Please try again.",
    });
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={
                profile?.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${
                  profile?.first_name || "User"
                }`
              }
              alt={profile?.first_name || "User"}
            />
            <AvatarFallback>
              {profile?.first_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">
              {profile?.first_name} {profile?.last_name}
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col items-center mb-4">
                <div className="relative mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={
                        avatarPreview ||
                        profile?.avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${
                          formData?.first_name || "User"
                        }`
                      }
                      alt={formData?.first_name || "User"}
                    />
                    <AvatarFallback>
                      {formData?.first_name?.charAt(0) || "U"}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData?.first_name || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData?.last_name || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData?.email || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData?.phone || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => {
                        const today = new Date();
                        return date > today;
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
