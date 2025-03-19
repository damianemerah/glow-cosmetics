"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { toast } from "sonner";

export default function AccountSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Email Preferences</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 border rounded-md">
            <div>
              <p className="font-medium">Marketing Emails</p>
              <p className="text-sm text-muted-foreground">
                Receive updates about new products and promotions
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                toast("Preferences Updated", {
                  description: "Your email preferences have been updated.",
                });
              }}
            >
              Manage
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-md">
            <div>
              <p className="font-medium">Appointment Reminders</p>
              <p className="text-sm text-muted-foreground">
                Receive reminders about upcoming appointments
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                toast("Preferences Updated", {
                  description:
                    "Your appointment reminder settings have been updated.",
                });
              }}
            >
              Manage
            </Button>
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
