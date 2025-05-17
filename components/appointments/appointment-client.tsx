"use client";

import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import useSWR from "swr";
import { customAlphabet } from "nanoid";
import { Copy } from "lucide-react";

import {
  Button,
  Calendar,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Label,
  Badge,
  Skeleton,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Input,
} from "@/constants/ui/index";

import DataTable from "@/components/admin/data-table";
import AppointmentFilter from "@/components/appointments/appointment-filter";
import EditBookingPopover from "@/components/booking/edit-booking-popover";

import { useMessaging } from "@/hooks/useMessaging";

import type { MessageChannel } from "@/lib/messaging";
import type { Booking, BookingStatus } from "@/types/index";

import { services, getTimeSlotsForDay, keyValueData } from "@/constants/data";

import { createBooking, updateBooking } from "@/actions/dashboardAction";

import { toast } from "sonner";

const nanoid = customAlphabet("0123456789", 6);

type DateType = "all" | "today" | "week" | "month";

interface AppointmentsClientProps {
  initialBookings: Booking[];
  initialClients: { id: string; name: string }[];
  currentPage: number;
  totalPages: number;
  status: string;
  search: string;
  date: string;
}

// Define the column structure for the DataTable
const appointmentColumns = [
  //add bookingId column
  {
    key: "booking_id",
    title: "Booking ID",
    render: (booking: Booking) => {
      const handleCopy = () => {
        navigator.clipboard.writeText(booking.booking_id);
        toast.success("Booking ID copied to clipboard");
      };

      return (
        <div className="flex items-center space-x-2">
          <span className="break-all">{booking.booking_id}</span>
          <Copy
            className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            onClick={handleCopy}
          />
        </div>
      );
    },
  },
  {
    key: "date",
    title: "Date & Time",
    render: (booking: Booking) => {
      const bookingDate = new Date(booking.booking_time);
      return (
        <div>
          <div className="font-medium">
            {format(bookingDate, "MMM dd, yyyy")}
          </div>
          <div className="text-sm text-muted-foreground">
            {format(bookingDate, "hh:mm a")}
          </div>
        </div>
      );
    },
  },
  {
    key: "client",
    title: "Client",
    render: (booking: Booking) => {
      return (
        <div>
          {`${booking.first_name} ${booking.last_name}` || "No name provided"}
        </div>
      );
    },
  },
  {
    key: "email",
    title: "Email",
    render: (booking: Booking) => {
      return <div>{booking.email || "No email provided"}</div>;
    },
  },
  {
    key: "phone",
    title: "Phone",
    render: (booking: Booking) => {
      return <div>{booking.phone || "No phone provided"}</div>;
    },
  },
  {
    key: "service",
    title: "Service",
    render: (booking: Booking) => {
      const service = services.find((s) => s.id === booking.service_id);
      return <div>{service?.name || booking.service_id}</div>;
    },
  },
  {
    key: "status",
    title: "Status",
    render: (booking: Booking) => {
      const statusStyles = {
        confirmed: "bg-green-100 text-green-800",
        pending: "bg-yellow-100 text-yellow-800",
        cancelled: "bg-red-100 text-red-800",
        completed: "bg-blue-100 text-blue-800",
      };

      const style =
        statusStyles[booking.status as keyof typeof statusStyles] ||
        "bg-gray-100 text-gray-800";

      return <Badge className={style}>{booking.status}</Badge>;
    },
  },
  {
    key: "special_requests",
    title: "Special Requests",
    render: (booking: Booking) => {
      if (!booking.special_requests) {
        return null;
      }

      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open</Button>
          </PopoverTrigger>
          <PopoverContent className="p-4">
            {booking.special_requests}
          </PopoverContent>
        </Popover>
      );
    },
  },
  {
    key: "actions",
    title: "Actions",
    render: () => <></>, // This will be replaced with proper render function that includes handlers
  },
];

// Skeleton loaders for appointments table
const AppointmentSkeletons = () => (
  <div className="space-y-4">
    {Array(5)
      .fill(0)
      .map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-md">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-3 w-[80px]" />
          </div>
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[150px]" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-4 w-[120px]" />
          </div>
          <div>
            <Skeleton className="h-6 w-[100px] rounded-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-[60px] rounded-md" />
            <Skeleton className="h-8 w-[60px] rounded-md" />
          </div>
        </div>
      ))}
  </div>
);

const isValidStatus = (s: string): s is BookingStatus =>
  ["pending", "confirmed", "completed", "cancelled"].includes(s);

export default function AppointmentsClient({
  initialBookings,
  initialClients,
  currentPage,
  totalPages,
  date: dateFilter,
  search,
  status,
}: AppointmentsClientProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");

  const [bookingStatus, setBookingStatus] = useState<BookingStatus | undefined>(
    isValidStatus(status) ? status : undefined
  );
  const [phone, setPhone] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clients] = useState<{ id: string; name: string }[]>(initialClients);

  // Use SWR for bookings data. No fetcher function because we're using initialData
  const { data, mutate } = useSWR<Booking[]>("appointments", null, {
    fallbackData: initialBookings,
    revalidateOnFocus: false,
  });

  const bookings = useMemo(() => data || [], [data]);

  // Apply filters
  const filteredBookings = useMemo(() => {
    if (!bookings.length) return [];

    // Start with all bookings
    let filtered = [...bookings];

    // Apply date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    if (dateFilter === "today") {
      filtered = filtered.filter((booking) => {
        const bookingDate = new Date(booking.booking_time);
        return (
          bookingDate >= today &&
          bookingDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
        );
      });
    } else if (dateFilter === "week") {
      filtered = filtered.filter((booking) => {
        const bookingDate = new Date(booking.booking_time);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        return bookingDate >= weekStart && bookingDate < weekEnd;
      });
    } else if (dateFilter === "month") {
      filtered = filtered.filter((booking) => {
        const bookingDate = new Date(booking.booking_time);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return bookingDate >= monthStart && bookingDate <= monthEnd;
      });
    }

    // Apply status filter
    if (status !== "all") {
      filtered = filtered.filter((booking) => booking.status === status);
    }

    // Apply search filter (case insensitive)
    if (search.trim() !== "") {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          `${booking.first_name} ${booking.last_name}`
            .toLowerCase()
            .includes(query) ||
          booking.email?.toLowerCase().includes(query) ||
          booking.phone?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [bookings, dateFilter, status, search]);

  // Update client selection handler to populate the fields
  const handleClientSelect = (clientId: string) => {
    setSelectedClient(clientId);

    // Find the selected client to get their name and split it
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      const nameParts = client.name.split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");

      // Try to find the client's booking to get the phone number
      const clientBooking = bookings.find((b) => b.user_id === clientId);
      if (clientBooking && clientBooking.phone) {
        setPhone(clientBooking.phone);
      } else {
        setPhone("");
      }
    }
  };

  // Reset form fields when the dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedClient("");
      setSelectedService("");
      setSelectedTime("");
      setFirstName("");
      setLastName("");
      setPhone("");
    }
  }, [open]);

  const handleCreateAppointment = async () => {
    if (!date || !selectedTime || !selectedService || !firstName || !phone) {
      toast.warning("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);

      // Parse the time string
      const [hours, minutes] = selectedTime.split(":");
      const periodMatch = minutes.match(/[AP]M/);
      const period = periodMatch ? periodMatch[0] : "";
      const mins = minutes.replace(/\s*[AP]M/, "");

      let hour = parseInt(hours);
      if (period === "PM" && hour < 12) hour += 12;
      if (period === "AM" && hour === 12) hour = 0;

      // Create a new date with the selected date and time
      const bookingDateTime = new Date(date);
      bookingDateTime.setHours(hour, parseInt(mins), 0, 0);

      const booking_id = nanoid();

      const result = await createBooking({
        first_name: firstName,
        last_name: lastName || undefined,
        phone: phone,
        user_id: selectedClient || null,
        service_id: selectedService,
        booking_time: bookingDateTime.toISOString(),
        status: bookingStatus as BookingStatus,
        service_price: services.find(
          (service) => service.id === selectedService
        )!.price,
        booking_id: `GLOW-${booking_id}`,
        service_name: services.find((s) => s.id === selectedService)!.name,
      });

      // Check the shape of the result and extract the actual booking
      const newBooking = "booking" in result ? result.booking : result;

      toast.success("Appointment created successfully");
      setOpen(false);

      // Update SWR cache with the new booking
      mutate([...(bookings || []), newBooking as Booking], false);
    } catch (err) {
      console.error("Error creating appointment:", err);
      toast.warning("Failed to create appointment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingUpdate = (updatedBooking: Booking) => {
    // Update SWR cache with the updated booking
    mutate(
      bookings.map((booking) =>
        booking.id === updatedBooking.id ? updatedBooking : booking
      ),
      false
    );
  };

  const handleBookingDelete = async (bookingId: string) => {
    try {
      const result = await updateBooking(bookingId, { status: "cancelled" });

      if (!result.success) {
        toast.warning(`Failed to cancel booking: ${result.error}`);
        return;
      }

      mutate(
        bookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "cancelled" }
            : booking
        ),
        false
      );
      toast.success("Booking cancelled successfully");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.warning("Failed to cancel booking");
    }
  };

  // Add useMessaging hook
  const { sendUserMessage } = useMessaging();

  // Add a state to track which booking is currently sending a confirmation
  const [sendingConfirmationId, setSendingConfirmationId] = useState<
    string | null
  >(null);

  const [sendingThankYouId, setSendingThankYouId] = useState<string | null>(
    null
  );

  const handleSendConfirmation = async (booking: Booking) => {
    try {
      // Check if user_id exists
      if (!booking.user_id) {
        toast.warning(
          "Cannot send confirmation: No user ID associated with this booking"
        );
        return;
      }

      // Check if confirmation was already sent
      if (booking.sent_confirmation) {
        toast.info("Confirmation already sent for this booking");
        return;
      }
      setSendingConfirmationId(booking.id);

      // Prepare variables for template substitution
      const bookingDate = new Date(booking.booking_time);
      const formattedDate = format(bookingDate, "MMMM dd, yyyy");
      const formattedTime = format(bookingDate, "hh:mm a");

      const service = services.find((s) => s.id === booking.service_id);
      const serviceName =
        service?.name || booking.service_name || "your service";

      const adminNumber = keyValueData.whatsappNumber;
      const text = `Hello 👋 I'd like to reschedule my appointment.\nBooking Reference: ${booking.booking_id}\nService: ${serviceName}\nDate: ${formattedDate}\nTime: ${formattedTime}`;

      const rescheduleUrl = `https://wa.me/${adminNumber}?text=${encodeURIComponent(text)}`;

      const variables = {
        bookingId: booking.booking_id,
        serviceName,
        appointmentDate: formattedDate,
        appointmentTime: formattedTime,
        userName:
          `${booking.first_name || ""} ${booking.last_name || ""}`.trim() ||
          "Valued Customer",
        specialInstructions: booking.special_requests || "",
        rescheduleUrl,
      };

      const messageData = {
        userId: booking.user_id,
        subject: "Appointment Confirmation",
        message: "appointmentConfirmation.pug",
        variables,
        channel: "email" as MessageChannel,
      };
      await sendUserMessage(messageData);

      await updateBooking(booking.id, {
        sent_confirmation: true,
      });

      toast.success("Confirmation message sent successfully");

      // Update the local state to reflect that confirmation was sent
      mutate(
        bookings.map((b) =>
          b.id === booking.id ? { ...b, sent_confirmation: true } : b
        ),
        false
      );
    } catch (error) {
      toast.warning("Failed to send confirmation message");
      console.error(error);
    } finally {
      // Clear loading state
      setSendingConfirmationId(null);
    }
  };

  const handleSendThankYou = async (booking: Booking) => {
    try {
      // Check if user_id exists
      if (!booking.user_id) {
        toast.warning(
          "Cannot send thank you: No user ID associated with this booking"
        );
        return;
      }

      // Check if thank you was already sent
      if (booking.sent_thanks) {
        toast.info("Thank you message already sent for this booking");
        return;
      }

      // Set loading state for this specific booking
      setSendingThankYouId(booking.id);

      // Prepare variables for template substitution
      const bookingDate = new Date(booking.booking_time);
      const formattedDate = format(bookingDate, "MMMM dd, yyyy");

      const service = services.find((s) => s.id === booking.service_id);
      const serviceName =
        service?.name || booking.service_name || "your service";

      const variables = {
        userName:
          `${booking.first_name || ""} ${booking.last_name || ""}`.trim() ||
          "Valued Customer",
        serviceName,
        appointmentDate: formattedDate,
        bookingId: booking.booking_id,
        bookingUrl: `${window.location.origin}/booking`,
        feedbackUrl:
          "https://www.facebook.com/profile.php?id=100069551504619&sk=reviews",
      };

      const messageData = {
        userId: booking.user_id,
        subject: "Thank You for Your Visit",
        message: "appointmentThankYou.pug",
        variables,
        channel: "email" as MessageChannel,
      };

      // Send thank you message
      await sendUserMessage(messageData);

      // Update the booking in the database to mark thank you as sent
      await updateBooking(booking.id, {
        sent_thanks: true,
      });

      toast.success("Thank you message sent successfully");

      // Update the local state to reflect that thank you was sent
      mutate(
        bookings.map((b) =>
          b.id === booking.id ? { ...b, sent_thanks: true } : b
        ),
        false
      );
    } catch (error) {
      toast.warning("Failed to send thank you message");
      console.error(error);
    } finally {
      // Clear loading state
      setSendingThankYouId(null);
    }
  };

  const handleStatusChange = (value: string) => {
    if (isValidStatus(value)) {
      setBookingStatus(value);
    } else {
      console.warn("Invalid booking status selected:", value);
    }
  };

  const columnsWithHandlers = appointmentColumns.map((column) => {
    if (column.key === "actions") {
      return {
        ...column,
        render: (booking: Booking) => (
          <div className="flex gap-2">
            <EditBookingPopover
              booking={booking}
              onBookingUpdated={(updatedBooking) => {
                toast.success(`Booking updated successfully`);
                handleBookingUpdate(updatedBooking);
              }}
              trigger={
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              }
            />
            {booking.status === "pending" && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-500"
                onClick={() => handleBookingDelete(booking.id)}
              >
                Cancel
              </Button>
            )}
            {/* Show Send Confirmation button if confirmation not sent and status is not cancelled */}
            {!booking.sent_confirmation && booking.status !== "cancelled" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSendConfirmation(booking)}
                disabled={sendingConfirmationId === booking.id}
              >
                {sendingConfirmationId === booking.id
                  ? "Sending..."
                  : "Send Confirmation"}
              </Button>
            )}
            {/* Show Send Thank You button if confirmation was sent, thank you not sent, and status is completed */}
            {booking.sent_confirmation &&
              !booking.sent_thanks &&
              booking.status === "completed" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendThankYou(booking)}
                  disabled={sendingThankYouId === booking.id}
                >
                  {sendingThankYouId === booking.id
                    ? "Sending..."
                    : "Send Thank You"}
                </Button>
              )}
          </div>
        ),
      };
    }
    return column;
  });

  const currentDateBookedTimes = useMemo(() => {
    if (!date) return [];
    // Only consider bookings that are not cancelled
    return bookings
      .filter(
        (b) =>
          new Date(b.booking_time).toDateString() === date.toDateString() &&
          b.status !== "cancelled"
      )
      .map((b) => {
        const d = new Date(b.booking_time);
        return d ? format(d, "hh:mm a") : "";
      });
  }, [date, bookings]);

  const slotsLoading = false;

  return (
    <div>
      <AppointmentFilter
        onAddAppointmentClick={() => setOpen(true)}
        search={search}
        date={dateFilter as DateType}
        status={status}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto no-scrollbar">
          <DialogHeader>
            <DialogTitle>Add New Appointment</DialogTitle>
            <DialogDescription>
              Create a new appointment for a client.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="client">Client</Label>
              <Select onValueChange={handleClientSelect} value={selectedClient}>
                <SelectTrigger id="client">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2 grid-cols-2">
              <div>
                <Label htmlFor="service">Service</Label>
                <Select
                  onValueChange={setSelectedService}
                  value={selectedService}
                >
                  <SelectTrigger id="service">
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  onValueChange={handleStatusChange}
                  value={bookingStatus}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {["pending", "confirmed", "completed", "cancelled"].map(
                      (bookingstatus, i) => (
                        <SelectItem key={i} value={bookingstatus}>
                          {bookingstatus}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Date</Label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="border rounded-md p-3"
                initialFocus
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today || date.getDay() === 0;
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Time</Label>
              <Select
                value={selectedTime}
                onValueChange={setSelectedTime}
                required
                disabled={!date || !selectedService}
              >
                <SelectTrigger id="time">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {date ? (
                    getTimeSlotsForDay(date).map((time: string) => {
                      const isBooked = currentDateBookedTimes.includes(time);
                      const isPastTime =
                        new Date().toDateString() === date.toDateString() &&
                        (() => {
                          const [hoursStr, minutesStr] = time.split(":");
                          const period = time.includes("PM") ? "PM" : "AM";
                          let hours = parseInt(hoursStr);
                          if (period === "PM" && hours !== 12) hours += 12;
                          if (period === "AM" && hours === 12) hours = 0;

                          const now = new Date();
                          const slotTime = new Date(date);
                          slotTime.setHours(
                            hours,
                            parseInt(minutesStr) || 0,
                            0,
                            0
                          );

                          return now > slotTime;
                        })();

                      return (
                        <SelectItem
                          key={time}
                          value={time}
                          disabled={isBooked || isPastTime || slotsLoading}
                        >
                          {time}
                          {isBooked && " (Booked)"}
                          {isPastTime && " (Past)"}
                        </SelectItem>
                      );
                    })
                  ) : (
                    <SelectItem value="" disabled>
                      Select date first
                    </SelectItem>
                  )}
                  {slotsLoading && date && (
                    <SelectItem value="loading" disabled>
                      Loading slots...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="bg-primary text-white hover:bg-primary/90"
              onClick={handleCreateAppointment}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table with loading state */}
      {isLoading ? (
        <AppointmentSkeletons />
      ) : (
        <>
          <DataTable
            columns={columnsWithHandlers}
            data={filteredBookings}
            emptyState={
              <div className="text-center py-8">
                <p className="text-muted-foreground">No products found</p>
                <Button onClick={() => setOpen(true)} className="mt-4">
                  Add Your First Appointment
                </Button>
              </div>
            }
          />
          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={`/admin/appointments?page=${Math.max(
                      1,
                      currentPage - 1
                    )}`}
                    className={
                      currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href={`/admin/appointments?page=${pageNum}`}
                        isActive={pageNum === currentPage}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    href={`/admin/appointments?page=${Math.min(
                      totalPages,
                      currentPage + 1
                    )}&search=${search}&status=${status}&date=${dateFilter}`}
                    className={
                      currentPage >= totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
