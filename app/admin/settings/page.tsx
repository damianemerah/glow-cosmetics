"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import PageHeader from "@/components/admin/page-header";

export default function SettingsPage() {
  const [businessInfo, setBusinessInfo] = useState({
    name: "Glow by UgoSylvia",
    email: "info@glowbyUgosylvia.com",
    phone: "(555) 123-4567",
    address: "123 Beauty Lane, Pretoria, South Africa",
    website: "www.glowbyUgosylvia.com",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    marketingEmails: false,
  });

  const handleBusinessInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setBusinessInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (name: string, checked: boolean) => {
    setNotificationSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSaveBusinessInfo = () => {
    console.log("Saving business info:", businessInfo);
    alert("Business information saved successfully!");
  };

  const handleSaveNotifications = () => {
    console.log("Saving notification settings:", notificationSettings);
    alert("Notification settings saved successfully!");
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your business settings and preferences"
      />

      <Tabs defaultValue="business" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="business">Business Info</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Update your business details and contact information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Business Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={businessInfo.name}
                    onChange={handleBusinessInfoChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={businessInfo.email}
                    onChange={handleBusinessInfoChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={businessInfo.phone}
                    onChange={handleBusinessInfoChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={businessInfo.website}
                    onChange={handleBusinessInfoChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={businessInfo.address}
                  onChange={handleBusinessInfoChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Business Logo</Label>
                <Input id="logo" type="file" />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="bg-primary text-white hover:bg-primary/90"
                onClick={handleSaveBusinessInfo}
              >
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Service Settings</CardTitle>
              <CardDescription>
                Manage your service offerings and pricing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Microblading</h3>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Price
                    </Label>
                    <p>R850.00</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Duration
                    </Label>
                    <p>90 minutes</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Status
                    </Label>
                    <p>Active</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Facial Treatment</h3>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Price
                    </Label>
                    <p>R650.00</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Duration
                    </Label>
                    <p>60 minutes</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Status
                    </Label>
                    <p>Active</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Lip Filler</h3>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Price
                    </Label>
                    <p>R1,200.00</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Duration
                    </Label>
                    <p>45 minutes</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Status
                    </Label>
                    <p>Active</p>
                  </div>
                </div>
              </div>

              <Button className="bg-primary text-white hover:bg-primary/90">
                Add New Service
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("emailNotifications", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via SMS
                  </p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={notificationSettings.smsNotifications}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("smsNotifications", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="appointment-reminders">
                    Appointment Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Send appointment reminders to clients
                  </p>
                </div>
                <Switch
                  id="appointment-reminders"
                  checked={notificationSettings.appointmentReminders}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("appointmentReminders", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing-emails">Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Send promotional emails to clients
                  </p>
                </div>
                <Switch
                  id="marketing-emails"
                  checked={notificationSettings.marketingEmails}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("marketingEmails", checked)
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="bg-primary text-white hover:bg-primary/90"
                onClick={handleSaveNotifications}
              >
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>
                Connect with third-party services and applications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center text-blue-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">Email Marketing</h3>
                      <p className="text-sm text-muted-foreground">
                        Connect with Mailchimp
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
              </div>

              <div className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center text-green-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" />
                        <path d="m7 16.5-4.74-2.85" />
                        <path d="m7 16.5 5-3" />
                        <path d="M7 16.5v5.17" />
                        <path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" />
                        <path d="m17 16.5-5-3" />
                        <path d="m17 16.5 4.74-2.85" />
                        <path d="M17 16.5v5.17" />
                        <path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" />
                        <path d="M12 8 7.26 5.15" />
                        <path d="m12 8 4.74-2.85" />
                        <path d="M12 13.5V8" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">Accounting</h3>
                      <p className="text-sm text-muted-foreground">
                        Connect with QuickBooks
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
              </div>

              <div className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-md flex items-center justify-center text-purple-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">Payment Processing</h3>
                      <p className="text-sm text-muted-foreground">
                        Connect with Stripe
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="bg-muted text-muted-foreground hover:bg-muted"
                  >
                    Connected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
