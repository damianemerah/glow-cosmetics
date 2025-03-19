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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import PageHeader from "@/components/admin/page-header";
import DataTable from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";

// Mock data for sent messages
const sentMessages = [
  {
    id: "MSG-001",
    date: "Mar 10, 2025",
    recipients: "All Clients",
    subject: "March Special Offers",
    channel: "Email",
    status: "Delivered",
  },
  {
    id: "MSG-002",
    date: "Mar 5, 2025",
    recipients: "VIP Clients",
    subject: "Exclusive VIP Event",
    channel: "Email",
    status: "Delivered",
  },
  {
    id: "MSG-003",
    date: "Mar 1, 2025",
    recipients: "Recent Customers",
    subject: "Feedback Request",
    channel: "SMS",
    status: "Delivered",
  },
  {
    id: "MSG-004",
    date: "Feb 25, 2025",
    recipients: "All Clients",
    subject: "New Products Announcement",
    channel: "Email",
    status: "Delivered",
  },
  {
    id: "MSG-005",
    date: "Feb 20, 2025",
    recipients: "Inactive Clients",
    subject: "We Miss You - Special Offer",
    channel: "WhatsApp",
    status: "Delivered",
  },
];

const messageColumns = [
  {
    key: "id",
    title: "ID",
    render: (row: any) => (
      <div>
        <div className="font-medium">{row.id}</div>
        <div className="text-sm text-muted-foreground">{row.date}</div>
      </div>
    ),
  },
  { key: "recipients", title: "Recipients" },
  { key: "subject", title: "Subject" },
  {
    key: "channel",
    title: "Channel",
    render: (row: any) => {
      const channelStyles = {
        Email: "bg-blue-100 text-blue-800",
        SMS: "bg-green-100 text-green-800",
        WhatsApp: "bg-emerald-100 text-emerald-800",
      };

      // @ts-ignore - We know the channel will be one of the keys
      const style = channelStyles[row.channel] || "bg-gray-100 text-gray-800";

      return <Badge className={style}>{row.channel}</Badge>;
    },
  },
  { key: "status", title: "Status" },
  {
    key: "actions",
    title: "Actions",
    render: () => (
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          View
        </Button>
        <Button variant="outline" size="sm">
          Resend
        </Button>
      </div>
    ),
  },
];

// Mock data for client groups
const clientGroups = [
  { id: "all", name: "All Clients" },
  { id: "vip", name: "VIP Clients" },
  { id: "recent", name: "Recent Customers" },
  { id: "inactive", name: "Inactive Clients" },
];

export default function MessagingPage() {
  const [messageForm, setMessageForm] = useState({
    subject: "",
    message: "",
    recipients: "",
    channel: "email",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setMessageForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setMessageForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(messageForm);
    // Here you would typically send the message
    alert("Message sent successfully!");
    setMessageForm({
      subject: "",
      message: "",
      recipients: "",
      channel: "email",
    });
  };

  return (
    <div>
      <PageHeader
        title="Messaging"
        description="Send messages to your clients"
      />

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>New Message</CardTitle>
              <CardDescription>
                Create and send a new message to your clients.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipients">Recipients</Label>
                <Select
                  name="recipients"
                  value={messageForm.recipients}
                  onValueChange={(value) =>
                    handleSelectChange("recipients", value)
                  }
                >
                  <SelectTrigger id="recipients">
                    <SelectValue placeholder="Select recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={messageForm.subject}
                  onChange={handleInputChange}
                  placeholder="Enter message subject"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={messageForm.message}
                  onChange={handleInputChange}
                  placeholder="Enter your message"
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label>Channel</Label>
                <RadioGroup
                  defaultValue="email"
                  value={messageForm.channel}
                  onValueChange={(value) =>
                    handleSelectChange("channel", value)
                  }
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email" />
                    <Label htmlFor="email">Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sms" id="sms" />
                    <Label htmlFor="sms">SMS</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="whatsapp" id="whatsapp" />
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="bg-primary text-white hover:bg-primary/90 w-full"
              >
                Send Message
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Message Templates</CardTitle>
            <CardDescription>
              Save time by using pre-defined message templates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="border rounded-md p-3 cursor-pointer hover:bg-muted">
                <h3 className="font-medium">Appointment Reminder</h3>
                <p className="text-sm text-muted-foreground">
                  Reminder for upcoming appointments with date and time details.
                </p>
              </div>
              <div className="border rounded-md p-3 cursor-pointer hover:bg-muted">
                <h3 className="font-medium">Special Offer</h3>
                <p className="text-sm text-muted-foreground">
                  Announce special discounts or promotions to clients.
                </p>
              </div>
              <div className="border rounded-md p-3 cursor-pointer hover:bg-muted">
                <h3 className="font-medium">New Product Announcement</h3>
                <p className="text-sm text-muted-foreground">
                  Introduce new products or services to your client base.
                </p>
              </div>
              <div className="border rounded-md p-3 cursor-pointer hover:bg-muted">
                <h3 className="font-medium">Thank You</h3>
                <p className="text-sm text-muted-foreground">
                  Thank clients for their visit and request feedback.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 font-montserrat">
          Message History
        </h2>
        <DataTable columns={messageColumns} data={sentMessages} />
      </div>
    </div>
  );
}
