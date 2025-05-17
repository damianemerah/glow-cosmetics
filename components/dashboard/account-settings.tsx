"use client";

import { useState } from "react";
import { Button, Switch, Separator } from "@/constants/ui/index";
// import Link from "next/link";
import { toast } from "sonner";
import {
  setNotificationSettings,
  deleteUserAccount,
} from "@/actions/dashboardAction";
import { Loader2 } from "lucide-react";
import ConfirmDialog from "@/components/common/confirm-dialog";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/authStore";

interface AccountSettingsProps {
  marketingEnabled: boolean;
  appointmentEnabled: boolean;
  user_id: string;
}

export default function AccountSettings({
  marketingEnabled,
  appointmentEnabled,
  user_id,
}: AccountSettingsProps) {
  const router = useRouter();
  const [isMarketingEnabled, setIsMarketingEnabled] =
    useState(marketingEnabled);
  const [isAppointmentEnabled, setIsAppointmentEnabled] =
    useState(appointmentEnabled);
  const [userId] = useState(user_id);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const signOut = useUserStore((state) => state.signOut);

  const handleNotificationChange = async (type: string, checked: boolean) => {
    if (!userId) return;
    setIsLoading(true);
    try {
      switch (type) {
        case "marketing":
          setIsMarketingEnabled(checked);
          await setNotificationSettings(userId, "receive_emails", checked);
          toast("Preferences Updated", {
            description: "Your marketing email settings have been updated.",
          });
          break;
        case "appointment":
          setIsAppointmentEnabled(checked);
          await setNotificationSettings(
            userId,
            "appointment_reminder",
            checked
          );
          toast("Preferences Updated", {
            description:
              "Your appointment reminder settings have been updated.",
          });
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error updating notification settings:", error);
      toast.warning("Failed to update notification settings.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId) return;

    setIsDeleting(true);
    try {
      const result = await deleteUserAccount(userId);
      if (result.success) {
        toast.success(
          "Account deleted successfully. You will be logged out shortly."
        );
        await signOut();
        router.push("/");
      } else {
        console.error("Error deleting account:", result.error);
        toast.warning(`Failed to delete account`);
        setIsDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.warning("An error occurred while deleting your account.");
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 backdrop-blur-xs">
          <div className="bg-white p-3 rounded-full shadow-md">
            <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
          </div>
        </div>
      )}
      <div>
        <h3 className="text-lg font-medium mb-3">Email Preferences</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 border rounded-md">
            <div>
              <p className="font-medium">Marketing Emails</p>
              <p className="text-sm text-muted-foreground">
                Stay informed with our latest product updates and exclusive
                promotions.
              </p>
            </div>
            <Switch
              checked={isMarketingEnabled}
              onCheckedChange={(checked) => {
                handleNotificationChange("marketing", checked);
              }}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-md">
            <div>
              <p className="font-medium">Appointment Reminders</p>
              <p className="text-sm text-muted-foreground">
                Receive timely notifications about your upcoming appointments.
              </p>
            </div>
            <Switch
              checked={isAppointmentEnabled}
              onCheckedChange={(checked) => {
                handleNotificationChange("appointment", checked);
              }}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* <div>
        <h3 className="text-lg font-medium mb-3">Security</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 border rounded-md">
            <div>
              <p className="font-medium">Change Password</p>
              <p className="text-sm text-muted-foreground">
                Update your account password
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/change-password">Update</Link>
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-md">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/two-factor-auth">Setup</Link>
            </Button>
          </div>
        </div>
      </div> */}

      <div>
        <h3 className="text-lg font-medium mb-3">Account Management</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 border rounded-md">
            <div>
              <p className="font-medium">Download Your Data</p>
              <p className="text-sm text-muted-foreground">
                Get a copy of your personal data
              </p>
            </div>
            <Button
              variant="outline"
              onClick={async () => {
                toast("Exporting...", {
                  description: "Preparing your data...",
                });

                const res = await fetch("/api/export-user-data", {
                  method: "POST",
                  body: JSON.stringify({ userId }),
                  headers: { "Content-Type": "application/json" },
                });

                const result = await res.json();

                if (result.success) {
                  // Download the file
                  const blob = new Blob(
                    [atob(result.data)], // decode base64
                    { type: "application/json" }
                  );
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "your-data.json";
                  link.click();
                  window.URL.revokeObjectURL(url);

                  toast.success("Your data has been downloaded.");
                } else {
                  toast.warning("Failed to export data", {
                    description: result.error || "Please try again.",
                  });
                }
              }}
            >
              Export
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-md">
            <div>
              <p className="font-medium text-red-600">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteAccount}
        title="Delete Your Account"
        description="Are you sure you want to delete your account? This action is permanent and cannot be undone. All your data, including booking history, will be permanently removed."
        confirmText="Yes, delete my account"
        confirmVariant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
