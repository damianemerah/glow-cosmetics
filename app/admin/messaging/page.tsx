"use client";

import { getBookingWithId } from "@/actions/bookingAction";
import { getUserById } from "@/actions/authAction";
import type React from "react";
import { useState, useEffect } from "react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  RadioGroup,
  RadioGroupItem,
  Badge,
  Skeleton,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/constants/ui/index";

import PageHeader from "@/components/admin/page-header";
import DataTable from "@/components/admin/data-table";
import RichTextEditor from "@/components/RichTextEditor";

import { useMessaging } from "@/hooks/useMessaging";

import type { MessageData, MessageChannel } from "@/lib/messaging";
import { Booking } from "@/types/index";

import useSWR from "swr";
import { Search, X } from "lucide-react";
import { toast } from "sonner";

import {
  clientGroups,
  templateVariables,
  templates,
  bookingTemplateVariables,
} from "@/constants/data";

interface Message {
  id: string;
  date: string;
  recipients: string;
  subject: string;
  channel: MessageChannel;
  status: string;
  messageId?: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
}

const fetchClients = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch clients");
  }
  return response.json();
};

// New function to fetch booking by ID
const fetchBookingById = async (bookingId: string) => {
  try {
    const booking = await getBookingWithId(bookingId);
    return booking;
  } catch (error) {
    console.error("Error fetching booking:", error);
    return null;
  }
};

export default function MessagingPage() {
  const { isLoading, sendMessage, resendMessage, sendUserMessage } =
    useMessaging();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageForm, setMessageForm] = useState<MessageData>({
    recipients: [],
    subject: "",
    message: "",
    channel: "whatsapp",
    type: "",
  });

  // State for selected message in the View dialog
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // State for client search dialog
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // State for booking search
  const [bookingIdSearch, setBookingIdSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // State to track if we're using rich text
  const [isRichText, setIsRichText] = useState(false);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const messagesPerPage = 10;

  // Search for clients using SWR
  const { data: searchResults, error: searchError } = useSWR(
    searchQuery.length > 2
      ? `/api/clients/search?q=${encodeURIComponent(searchQuery)}`
      : null,
    fetchClients,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  // Fetch message logs on component mount or when page changes
  useEffect(() => {
    async function fetchMessageLogs() {
      try {
        const response = await fetch(
          `/api/messages/logs?limit=${messagesPerPage}&page=${currentPage}`
        );
        if (response.ok) {
          const data = await response.json();
          setMessages(data.logs || []);
          setTotalPages(data.totalPages || 1);
        }
      } catch (error) {
        console.error("Failed to fetch message logs:", error);
      }
    }
    fetchMessageLogs();
  }, [currentPage]);

  // Effect to update rich text state based on channel
  useEffect(() => {
    setIsRichText(messageForm.channel === "email");
  }, [messageForm.channel]);

  // Search for booking by ID
  const handleBookingSearch = async () => {
    if (!bookingIdSearch.trim()) return;

    setBookingLoading(true);
    try {
      const booking = await fetchBookingById(bookingIdSearch);
      if (booking) {
        setSelectedBooking(booking);
        console.log(booking);
        if (booking.user_id) {
          const userData = await getUserById(booking.user_id);
          if (userData) {
            const clientData = {
              id: userData.user_id,
              email: userData.email,
              firstName: userData.first_name,
              name: userData.first_name + " " + userData.last_name,
              phone: userData.phone,
            };

            setSelectedClient(clientData);
            setMessageForm((prev) => ({
              ...prev,
              recipients: [userData.id],
            }));
          }
        }
      } else {
        toast.warning("Booking not found");
      }
    } catch (error) {
      console.error("Error searching for booking:", error);
      toast.warning("Error searching for booking");
    } finally {
      setBookingLoading(false);
    }
  };

  // Clear booking selection
  const clearBookingSelection = () => {
    setSelectedBooking(null);
    setBookingIdSearch("");
  };

  // Format booking date and time
  const formatBookingDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-ZA", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }),
    };
  };

  // Get booking variables for templates
  const getBookingVariables = () => {
    if (!selectedBooking) return [];

    const { date, time } = formatBookingDateTime(selectedBooking.booking_time);

    return [
      { name: "{{booking.id}}", value: selectedBooking.booking_id },
      { name: "{{booking.date}}", value: date },
      { name: "{{booking.time}}", value: time },
      { name: "{{booking.name}}", value: selectedBooking.service_name },
      {
        name: "{{booking.specialRequests}}",
        value: selectedBooking.special_requests || "None",
      },
    ];
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setMessageForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "channel") {
      setIsRichText(value === "email");
    }
    setMessageForm((prev) => ({
      ...prev,
      [name]: name === "recipients" ? [value] : value,
    }));
  };

  // Handle rich text change
  const handleRichTextChange = (value: string) => {
    setMessageForm((prev) => ({ ...prev, message: value }));
  };

  // Handle template selection
  const handleTemplateSelect = (template: (typeof templates)[0]) => {
    if (template.id === "offer") {
      setMessageForm((prev) => ({
        ...prev,
        type: "offer",
      }));
    }
    //clear previously input text
    setMessageForm((prev) => ({ ...prev, message: "" }));

    setMessageForm({
      ...messageForm,
      subject: template.subject,
      message: template.content,
      channel: template.channel as MessageChannel,
    });
    setIsRichText(template.channel === "email");
  };

  // Handle template variable insertion
  const handleInsertVariable = (variable: string) => {
    // For rich text, we need to handle insertion differently
    if (isRichText) {
      // For now, just append to the end
      setMessageForm((prev) => ({
        ...prev,
        message: prev.message + " " + variable,
      }));
    } else {
      // For plain text, insert at cursor position or append
      const textarea = document.getElementById(
        "message"
      ) as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart || 0;
        const end = textarea.selectionEnd || 0;
        const text = textarea.value;
        const newText =
          text.substring(0, start) + variable + text.substring(end);
        setMessageForm((prev) => ({
          ...prev,
          message: newText,
        }));
      } else {
        // Fallback if we can't access the textarea
        setMessageForm((prev) => ({
          ...prev,
          message: prev.message + " " + variable,
        }));
      }
    }
  };

  // Handle client selection for individual messaging
  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setClientSearchOpen(false);
    setMessageForm((prev) => ({
      ...prev,
      recipients: [client.id],
    }));
  };

  // Handle sending message to individual client
  const handleSendToClient = async () => {
    if (!selectedClient) return;
    let bookingVariables = null;
    try {
      if (selectedBooking) {
        const { date, time } = formatBookingDateTime(
          selectedBooking.booking_time
        );
        bookingVariables = {
          name: selectedBooking.service_name,
          date,
          time,
          id: selectedBooking.booking_id,
          specialRequests: selectedBooking.special_requests,
        };
      }
      const data = {
        userId: selectedClient.id,
        subject: messageForm.subject,
        message: messageForm.message,
        variables: { user: selectedClient, booking: bookingVariables },
        channel: messageForm.channel,
        ...(messageForm.type && { type: messageForm.type }),
      };

      await sendUserMessage(data);

      const newMessage: Message = {
        id: `MSG-${messages.length + 1}`,
        date: new Date().toLocaleDateString(),
        recipients: selectedClient.name,
        subject: messageForm.subject,
        channel: messageForm.channel,
        status: "Delivered",
      };
      setMessages((prev) => [newMessage, ...prev]);
      setSelectedClient(null);
      setMessageForm((prev) => ({ ...prev, recipients: [] }));
    } catch (error) {
      console.error("Failed to send message to client:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClient) {
      await handleSendToClient();
      return;
    }
    try {
      await sendMessage(messageForm);
      const newMessage: Message = {
        id: `MSG-${messages.length + 1}`,
        date: new Date().toLocaleDateString(),
        recipients: Array.isArray(messageForm.recipients)
          ? messageForm.recipients.join(", ")
          : String(messageForm.recipients),
        subject: messageForm.subject,
        channel: messageForm.channel,
        status: "Delivered",
      };
      setMessages((prev) => [newMessage, ...prev]);
      setMessageForm({
        recipients: [],
        subject: "",
        message: "",
        channel: "whatsapp",
      });
      setIsRichText(false);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleResend = async (message: Message) => {
    try {
      await resendMessage(message.messageId!, {
        recipients: message.recipients.split(", "),
        subject: message.subject,
        message: "", // Consider storing original content
        channel: message.channel,
      });
    } catch (error) {
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedMessage(row)}
          >
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
              {/* Messaging Options Group */}
              <div className="border rounded-md p-4 space-y-4">
                <h3 className="font-semibold">Messaging Options</h3>

                {/* Channel selection */}
                <div className="space-y-2">
                  <Label>Channel</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <RadioGroup
                          value={messageForm.channel}
                          onValueChange={(value) =>
                            handleSelectChange(
                              "channel",
                              value as MessageChannel
                            )
                          }
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="email" id="email" />
                            <Label htmlFor="email">Email</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="whatsapp" id="whatsapp" />
                            <Label htmlFor="whatsapp">WhatsApp</Label>
                          </div>
                        </RadioGroup>
                      </TooltipTrigger>
                      <TooltipContent>
                        WhatsApp is preferred for direct messages, Email for
                        marketing
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Booking ID search */}
                <div className="space-y-2">
                  <Label htmlFor="bookingId">Booking ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bookingId"
                      placeholder="Enter booking ID"
                      value={bookingIdSearch}
                      onChange={(e) => setBookingIdSearch(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleBookingSearch}
                      disabled={bookingLoading || !bookingIdSearch.trim()}
                    >
                      {bookingLoading ? (
                        <Skeleton className="h-4 w-4" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Selected booking information */}
                {selectedBooking && (
                  <div className="border border-green-200 rounded-md p-3 bg-green-50">
                    <div className="flex justify-between">
                      <h4 className="font-medium">Booking Found</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearBookingSelection}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm">
                      <span className="font-semibold">ID:</span>{" "}
                      {selectedBooking.booking_id}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Client:</span>{" "}
                      {selectedBooking.first_name} {selectedBooking.last_name}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Service:</span>{" "}
                      {selectedBooking.service_name}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Date/Time:</span>{" "}
                      {formatBookingDateTime(selectedBooking.booking_time).date}{" "}
                      at{" "}
                      {formatBookingDateTime(selectedBooking.booking_time).time}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="recipients" className="mr-2">
                  Recipients
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setClientSearchOpen(true)}
                  className="ml-auto"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Find Client
                </Button>
              </div>

              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Select
                          name="recipients"
                          value={messageForm.recipients[0] || ""}
                          onValueChange={(value) =>
                            handleSelectChange("recipients", value)
                          }
                          disabled={!!selectedClient || !!selectedBooking}
                        >
                          <SelectTrigger id="recipients">
                            <SelectValue
                              placeholder={
                                selectedClient
                                  ? selectedClient.name
                                  : "Select recipients"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {clientGroups.map((group) => (
                              <SelectItem key={group.id} value={group.id}>
                                {group.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TooltipTrigger>
                      <TooltipContent>
                        Select a group of recipients or use Find Client for
                        individual messaging
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {selectedClient && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedClient(null);
                      setMessageForm((prev) => ({ ...prev, recipients: [] }));
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        id="subject"
                        name="subject"
                        value={messageForm.subject}
                        onChange={handleInputChange}
                        placeholder="Enter message subject"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      Required for email messages, optional for WhatsApp
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {isRichText ? (
                        <div className="min-h-[200px] border rounded-md">
                          <RichTextEditor
                            value={messageForm.message}
                            onChange={handleRichTextChange}
                            placeholder="Enter your message content..."
                          />
                        </div>
                      ) : (
                        <textarea
                          id="message"
                          name="message"
                          value={messageForm.message}
                          onChange={handleInputChange}
                          placeholder="Enter your message"
                          rows={5}
                          className="w-full min-h-[200px] p-2 border rounded-md"
                        />
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      {isRichText
                        ? "Rich text editing available for email messages"
                        : "Plain text for WhatsApp messages"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="space-y-2">
                <Label>Template Variables</Label>
                <div className="border rounded-md p-3">
                  <h4 className="text-sm font-medium mb-2">User Variables</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {templateVariables.map((variable) => (
                      <Badge
                        key={variable.name}
                        variant="outline"
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => handleInsertVariable(variable.name)}
                      >
                        {variable.name}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="ml-1">ℹ️</span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              {variable.description}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Badge>
                    ))}
                  </div>

                  {selectedBooking && (
                    <>
                      <h4 className="text-sm font-medium mb-2">
                        Booking Variables
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {bookingTemplateVariables.map((variable) => (
                          <Badge
                            key={variable.name}
                            variant="outline"
                            className="cursor-pointer hover:bg-muted"
                            onClick={() => handleInsertVariable(variable.name)}
                          >
                            {variable.name}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="ml-1">ℹ️</span>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                  {variable.description}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Badge>
                        ))}
                      </div>

                      <div className="mt-3 text-xs text-muted-foreground">
                        <p className="font-medium">Booking variable values:</p>
                        <ul className="list-disc list-inside mt-1">
                          {getBookingVariables().map((variable) => (
                            <li key={variable.name}>
                              <span className="font-mono">{variable.name}</span>
                              : {variable.value}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="bg-primary text-white hover:bg-primary/90 w-full"
                disabled={
                  isLoading ||
                  (!messageForm.recipients.length && !selectedClient)
                }
              >
                {isLoading ? (
                  <>
                    <Skeleton className="h-4 w-20" />
                    <span className="ml-2">Sending...</span>
                  </>
                ) : selectedClient ? (
                  "Send to Client"
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
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{template.name}</h3>
                    <Badge
                      className={
                        template.channel === "email"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-emerald-100 text-emerald-800"
                      }
                    >
                      {template.channel.toUpperCase()}
                    </Badge>
                  </div>
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

        {/* Add pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <nav className="inline-flex">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-l-md border ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-primary hover:bg-primary hover:text-white"
                }`}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border-t border-b ${
                      currentPage === page
                        ? "bg-primary text-white"
                        : "bg-white text-primary hover:bg-primary hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-r-md border ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-primary hover:bg-primary hover:text-white"
                }`}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Client Search Dialog */}
      <Dialog open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Find Client</DialogTitle>
            <DialogDescription>
              Search for a client by name, email, or phone number.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="button" variant="secondary">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {searchError && (
              <p className="text-red-500 text-sm">
                Error searching for clients
              </p>
            )}
            <div className="max-h-[300px] overflow-y-auto">
              {searchResults?.clients && searchResults.clients.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.clients.map((client: Client) => (
                    <div
                      key={client.id}
                      className="p-3 border rounded-md hover:bg-muted cursor-pointer"
                      onClick={() => handleClientSelect(client)}
                    >
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {client.email} • {client.phone}
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.length > 2 ? (
                <p className="text-center py-4 text-muted-foreground">
                  No clients found
                </p>
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  Enter at least 3 characters to search
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setClientSearchOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Message Dialog */}
      <Dialog
        open={!!selectedMessage}
        onOpenChange={() => setSelectedMessage(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
            <DialogDescription>
              View full details of the selected message.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <p>
              <strong>ID:</strong> {selectedMessage?.id}
            </p>
            <p>
              <strong>Date:</strong> {selectedMessage?.date}
            </p>
            <p>
              <strong>Recipients:</strong> {selectedMessage?.recipients}
            </p>
            <p>
              <strong>Subject:</strong> {selectedMessage?.subject}
            </p>
            <p>
              <strong>Channel:</strong> {selectedMessage?.channel.toUpperCase()}
            </p>
            <p>
              <strong>Status:</strong> {selectedMessage?.status}
            </p>
            {/* Optionally, include message body if available */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMessage(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
