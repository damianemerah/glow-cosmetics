"use client";

import { useState } from "react";
import { Button, Switch } from "@/constants/ui/index";
import { toast } from "sonner";
import {
  setNotificationSettings,
  deleteUserAccount,
} from "@/actions/dashboardAction";
import { Bell, Download, Loader2, ShieldAlert, Trash2 } from "lucide-react";
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
            checked,
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
          "Account deleted successfully. You will be logged out shortly.",
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

  const handleExportData = async () => {
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
        { type: "application/json" },
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
  };

  return (
    <div className="relative space-y-6">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl backdrop-blur-xs">
          <div className="rounded-full bg-card p-3 shadow-md">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      )}

      <section className="rounded-xl border bg-card shadow-soft">
        <header className="flex items-center gap-3 border-b px-5 py-4">
          <Bell className="h-4 w-4 text-primary" />
          <h3 className="font-heading text-lg font-medium">
            Email preferences
          </h3>
        </header>
        <div className="divide-y">
          <label
            htmlFor="marketing-emails"
            className="flex cursor-pointer items-center justify-between gap-6 px-5 py-4"
          >
            <div>
              <p className="font-medium text-foreground">Marketing emails</p>
              <p className="text-sm text-muted-foreground">
                Stay informed with our latest product updates and exclusive
                promotions.
              </p>
            </div>
            <Switch
              id="marketing-emails"
              checked={isMarketingEnabled}
              onCheckedChange={(checked) => {
                handleNotificationChange("marketing", checked);
              }}
            />
          </label>

          <label
            htmlFor="appointment-reminders"
            className="flex cursor-pointer items-center justify-between gap-6 px-5 py-4"
          >
            <div>
              <p className="font-medium text-foreground">
                Appointment reminders
              </p>
              <p className="text-sm text-muted-foreground">
                Receive timely notifications about your upcoming appointments.
              </p>
            </div>
            <Switch
              id="appointment-reminders"
              checked={isAppointmentEnabled}
              onCheckedChange={(checked) => {
                handleNotificationChange("appointment", checked);
              }}
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border bg-card shadow-soft">
        <header className="flex items-center gap-3 border-b px-5 py-4">
          <Download className="h-4 w-4 text-primary" />
          <h3 className="font-heading text-lg font-medium">Your data</h3>
        </header>
        <div className="flex items-center justify-between gap-6 px-5 py-4">
          <div>
            <p className="font-medium text-foreground">Download your data</p>
            <p className="text-sm text-muted-foreground">
              Get a copy of your personal data as a JSON file.
            </p>
          </div>
          <Button variant="outline" onClick={handleExportData}>
            Export
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-destructive/30 bg-destructive/5">
        <header className="flex items-center gap-3 border-b border-destructive/20 px-5 py-4">
          <ShieldAlert className="h-4 w-4 text-destructive" />
          <h3 className="font-heading text-lg font-medium text-destructive">
            Danger zone
          </h3>
        </header>
        <div className="flex items-center justify-between gap-6 px-5 py-4">
          <div>
            <p className="font-medium text-foreground">Delete account</p>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all of its data.
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </section>

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
