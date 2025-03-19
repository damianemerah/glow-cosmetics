"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateBooking, rescheduleBooking } from "@/actions/dashboardAction";
import type { Booking, BookingStatus } from "@/types/dashboard";
import { timeSlots } from "@/constants/data";

interface EditBookingPopoverProps {
  booking: Booking;
  onBookingUpdated: (updatedBooking: Booking) => void;
  trigger: React.ReactNode;
}

export default function EditBookingPopover({
  booking,
  onBookingUpdated,
  trigger,
}: EditBookingPopoverProps) {
  const bookingDate = new Date(booking.booking_time);
  const [date, setDate] = useState<Date | undefined>(bookingDate);
  const [time, setTime] = useState<string>(format(bookingDate, "h:mm a"));
  const [status, setStatus] = useState<BookingStatus | null>(booking.status);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    try {
      setIsLoading(true);

      // If date or time changed, use rescheduleBooking
      if (
        date &&
        (date.toDateString() !== bookingDate.toDateString() ||
          time !== format(bookingDate, "h:mm a"))
      ) {
        // Parse the time string to get hours and minutes
        const timeMatch = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!timeMatch) throw new Error("Invalid time format");

        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const period = timeMatch[3].toUpperCase();

        // Convert to 24-hour format
        if (period === "PM" && hours < 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;

        // Create a new date with the selected date and time
        const newDate = new Date(date);
        newDate.setHours(hours, minutes, 0, 0);

        const { booking: updatedBooking } = await rescheduleBooking(
          booking.id,
          newDate.toISOString()
        );

        if (updatedBooking) {
          onBookingUpdated(updatedBooking as Booking);
          toast.success("Booking rescheduled successfully");
        }
      }
      // If only status changed
      else if (status !== booking.status) {
        const { booking: updatedBooking } = await updateBooking(booking.id, {
          status,
        });

        if (updatedBooking) {
          onBookingUpdated(updatedBooking as Booking);
          toast.success("Booking status updated successfully");
        }
      } else {
        toast.info("No changes to update");
      }

      setOpen(false);
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Edit Booking</h3>

          <div className="space-y-2">
            <label className="text-sm font-medium">Service</label>
            <p className="text-sm">{booking.service_name}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today || date.getDay() === 0; // Disable Sundays
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Time</label>
            <Select defaultValue={time} onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((timeSlot) => (
                  <SelectItem key={timeSlot} value={timeSlot}>
                    {timeSlot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              defaultValue={status || undefined}
              onValueChange={(value) => setStatus(value as BookingStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUpdate}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600"
            >
              <Check className="h-4 w-4 mr-1" /> Update
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
