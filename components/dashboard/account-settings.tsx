"use client";

import { useState } from "react";
import { Button, Switch, Separator } from "@/constants/ui/index";
import Link from "next/link";
import { toast } from "sonner";
import { setNotificationSettings } from "@/actions/dashboardAction";
import { Loader2 } from "lucide-react";

interface AccountSettingsProps {
  marketingEnabled: boolean;
  appointmentEnabled: boolean;
  birthdayEnabled: boolean;
  user_id: string;
}

export default function AccountSettings({
  marketingEnabled,
  appointmentEnabled,
  birthdayEnabled,
  user_id,
}: AccountSettingsProps) {
  const [isMarketingEnabled, setIsMarketingEnabled] =
    useState(marketingEnabled);
  const [isAppointmentEnabled, setIsAppointmentEnabled] =
    useState(appointmentEnabled);
  const [isBirthdayEnabled, setIsBirthdayEnabled] = useState(birthdayEnabled);
  const [userId] = useState(user_id);
  const [isLoading, setIsLoading] = useState(false);

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
        case "birthday":
          setIsBirthdayEnabled(checked);
          await setNotificationSettings(
            userId,
            "birthday_notification_enabled",
            checked
          );
          toast("Preferences Updated", {
            description:
              "Your birthday notification settings have been updated.",
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

          <div className="flex items-center justify-between p-3 border rounded-md">
            <div>
              <p className="font-medium">Birthday Notifications</p>
              <p className="text-sm text-muted-foreground">
                We&apos;ll celebrate your birthday with special notifications
                and exclusive offers.
              </p>
            </div>
            <Switch
              checked={isBirthdayEnabled}
              onCheckedChange={(checked) => {
                handleNotificationChange("birthday", checked);
              }}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
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
      </div>

      <Separator />

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
              onClick={() => {
                toast("Data Export Requested", {
                  description:
                    "We'll email you when your data is ready to download.",
                });
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
              onClick={() => {
                // This would typically open a confirmation modal
                toast.warning("Warning", {
                  description:
                    "Account deletion requires confirmation. Please contact support.",
                });
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
