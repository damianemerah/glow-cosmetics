"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import DataTable from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { services, timeSlots } from "@/constants/data";
import AppointmentFilter from "@/components/appointments/appointment-filter";
import EditBookingPopover from "@/components/booking/edit-booking-popover";
import { createBooking } from "@/actions/dashboardAction";
import type { Booking } from "@/types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import useSWR from "swr";

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
            {format(bookingDate, "h:mm a")}
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
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clients] = useState<{ id: string; name: string }[]>(initialClients);

  // Use SWR for bookings data
  const { data, mutate } = useSWR<Booking[]>(
    "appointments",
    null, // No fetcher function because we're using initialData
    {
      fallbackData: initialBookings,
      revalidateOnFocus: false,
    }
  );

  // Memoize bookings to avoid dependency changes in filteredBookings useMemo
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

  const handleCreateAppointment = async () => {
    if (!date || !selectedTime || !selectedService || !selectedClient) {
      toast.error("Please fill in all fields");
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

      const result = await createBooking({
        user_id: selectedClient,
        service_id: selectedService,
        booking_time: bookingDateTime.toISOString(),
        status: "pending",
        service_price: services.find(
          (service) => service.id === selectedService
        )!.price,
      });

      // Check the shape of the result and extract the actual booking
      const newBooking = "booking" in result ? result.booking : result;

      toast.success("Appointment created successfully");
      setOpen(false);

      // Update SWR cache with the new booking
      mutate([...(bookings || []), newBooking as Booking], false);
    } catch (err) {
      console.error("Error creating appointment:", err);
      toast.error("Failed to create appointment");
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

  const handleBookingDelete = (bookingId: string) => {
    // Update SWR cache with the cancelled booking
    mutate(
      bookings.map((booking) =>
        booking.id === bookingId ? { ...booking, status: "cancelled" } : booking
      ),
      false
    );
  };

  // Fix for the DataTable typings issue
  // We create a new array of columns where the action column has a simpler render function
  // that takes only one parameter (booking) but it internally calls the original render with handlers
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
            <Button
              variant="outline"
              size="sm"
              className="text-red-500"
              onClick={async () => {
                try {
                  await fetch(`/api/bookings/${booking.id}/cancel`, {
                    method: "POST",
                  });
                  toast.success("Booking cancelled");
                  handleBookingDelete(booking.id);
                } catch (err) {
                  console.error("Failed to cancel booking:", err);
                  toast.error("Failed to cancel booking");
                }
              }}
            >
              Cancel
            </Button>
          </div>
        ),
      };
    }
    return column;
  });

  return (
    <div>
      <AppointmentFilter
        onAddAppointmentClick={() => setOpen(true)}
        search={search}
        date={dateFilter as DateType}
        status={status}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Appointment</DialogTitle>
            <DialogDescription>
              Create a new appointment for a client.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="client">Client</Label>
              <Select onValueChange={setSelectedClient}>
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
            <div className="grid gap-2">
              <Label htmlFor="service">Service</Label>
              <Select onValueChange={setSelectedService}>
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
            <div className="grid gap-2">
              <Label>Date</Label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="border rounded-md p-3"
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today || date.getDay() === 0; // Disable past dates and Sundays
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Time</Label>
              <Select onValueChange={setSelectedTime}>
                <SelectTrigger id="time">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
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
