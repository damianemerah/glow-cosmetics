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
import { useMessaging } from "@/hooks/useMessaging";
import { Skeleton } from "@/components/ui/skeleton";
import type { MessageData, MessageChannel } from "@/lib/messaging";

interface Message {
  id: string;
  date: string;
  recipients: string;
  subject: string;
  channel: MessageChannel;
  status: string;
  messageId?: string;
}

// Mock data for client groups - replace with real data from your database
const clientGroups = [
  { id: "all", name: "All Clients" },
  { id: "vip", name: "VIP Clients" },
  { id: "recent", name: "Recent Customers" },
  { id: "inactive", name: "Inactive Clients" },
];

const templates = [
  {
    id: "reminder",
    name: "Appointment Reminder",
    description:
      "Reminder for upcoming appointments with date and time details",
  },
  {
    id: "offer",
    name: "Special Offer",
    description: "Announce special discounts or promotions to clients",
  },
  {
    id: "announcement",
    name: "New Product Announcement",
    description: "Introduce new products or services to your client base",
  },
  {
    id: "thankyou",
    name: "Thank You",
    description: "Thank clients for their visit and request feedback",
  },
];

export default function MessagingPage() {
  const { isLoading, sendMessage, resendMessage } = useMessaging();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageForm, setMessageForm] = useState<MessageData>({
    recipients: [],
    subject: "",
    message: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendMessage(messageForm);

      // Add the new message to the list
      const newMessage: Message = {
        id: `MSG-${messages.length + 1}`,
        date: new Date().toLocaleDateString(),
        recipients: messageForm.recipients.join(", "),
        subject: messageForm.subject,
        channel: messageForm.channel,
        status: "Delivered",
      };

      setMessages((prev) => [newMessage, ...prev]);

      // Reset form
      setMessageForm({
        recipients: [],
        subject: "",
        message: "",
        channel: "email",
      });
    } catch (error) {
      // Error is already handled by the useMessaging hook
      console.error("Failed to send message:", error);
    }
  };

  const handleResend = async (message: Message) => {
    try {
      await resendMessage(message.messageId!, {
        recipients: message.recipients.split(", "),
        subject: message.subject,
        message: "", // You might want to store the original message content
        channel: message.channel,
      });
    } catch (error) {
      // Error is already handled by the useMessaging hook
      console.error("Failed to resend message:", error);
    }
  };

  const messageColumns = [
    {
      key: "id",
      title: "ID",
      render: (row: Message) => (
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
      render: (row: Message) => {
        const channelStyles = {
          email: "bg-blue-100 text-blue-800",
          sms: "bg-green-100 text-green-800",
          whatsapp: "bg-emerald-100 text-emerald-800",
        };

        return (
          <Badge
            className={
              channelStyles[row.channel] || "bg-gray-100 text-gray-800"
            }
          >
            {row.channel.toUpperCase()}
          </Badge>
        );
      },
    },
    { key: "status", title: "Status" },
    {
      key: "actions",
      title: "Actions",
      render: (row: Message) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            View
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleResend(row)}>
            Resend
          </Button>
        </div>
      ),
    },
  ];
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
                  value={messageForm.recipients[0] || ""}
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
                    handleSelectChange("channel", value as MessageChannel)
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
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Skeleton className="h-4 w-20" />
                    <span className="ml-2">Sending...</span>
                  </>
                ) : (
                  "Send Message"
                )}
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
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="border rounded-md p-3 cursor-pointer hover:bg-muted"
                >
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {template.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 font-montserrat">
          Message History
        </h2>
        <DataTable columns={messageColumns} data={messages} />
      </div>
    </div>
  );
}
