"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon, Check, X } from "lucide-react";

import {
  Button,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/constants/ui/index";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateBooking } from "@/actions/dashboardAction";
import type { Booking, BookingStatus } from "@/types/index";
import { getTimeSlotsForDay } from "@/constants/data";
import { useBookingStore } from "@/app/store/bookingStore";
import { Skeleton } from "@/constants/ui";

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
  const [time, setTime] = useState<string>(format(bookingDate, "hh:mm a"));
  const [status, setStatus] = useState(booking.status as BookingStatus);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get booked slots from bookingStore
  const {
    bookedSlots,
    isLoading: slotsLoading,
    fetchSlotsForDate,
  } = useBookingStore();

  // Fetch slots when date changes
  useEffect(() => {
    if (date) {
      fetchSlotsForDate(date);
    }
  }, [date, fetchSlotsForDate]);

  // Memoize fetched booked slots for the selected date
  const currentDateBookedTimes = useMemo(() => {
    if (!date) return [];
    const slotsForDate = bookedSlots.get(date.toDateString()) || [];
    return slotsForDate.map((slotDate) => format(slotDate, "hh:mm a"));
  }, [date, bookedSlots]);

  const handleUpdate = async () => {
    try {
      setIsLoading(true);

      // Check if anything has changed
      const isDateChanged =
        date && date.toDateString() !== bookingDate.toDateString();
      const isTimeChanged = time !== format(bookingDate, "hh:mm a");
      const isStatusChanged = status !== booking.status;

      // If nothing changed, show info message and return
      if (!isDateChanged && !isTimeChanged && !isStatusChanged) {
        toast.info("No changes to update");
        setOpen(false);
        return;
      }

      // Prepare the update data
      const updates: Partial<Booking> = {};

      // If status has changed, add it to updates
      updates.status = status;

      // If date or time has changed, calculate the new booking time
      if (isDateChanged || isTimeChanged) {
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
        const newDate = new Date(date!);
        newDate.setHours(hours, minutes, 0, 0);

        updates.booking_time = newDate.toISOString();
      }

      // Update the booking with all changes at once
      const result = await updateBooking(booking.id, updates);

      if (!result.success) {
        toast.warning(`Failed to update booking: ${result.error}`);
        return;
      }

      if (result.booking) {
        onBookingUpdated(result.booking as Booking);
        toast.success("Booking updated successfully");

        // Refresh slots data for the new date if changed
        if (isDateChanged && date) {
          fetchSlotsForDate(date);
        }
      }

      setOpen(false);
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.warning("Failed to update booking");
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
                {slotsLoading ? (
                  <div className="p-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full mt-2" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </div>
                ) : (
                  date &&
                  getTimeSlotsForDay(date).map((time) => {
                    const isBooked =
                      currentDateBookedTimes.includes(time) &&
                      // Exclude current booking time from being "booked"
                      !(
                        date.toDateString() === bookingDate.toDateString() &&
                        time === format(bookingDate, "hh:mm a")
                      );
                    const isPastTime =
                      date &&
                      new Date().toDateString() === date.toDateString() &&
                      (() => {
                        // IIFE for cleaner logic
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
                        disabled={isBooked || isPastTime}
                      >
                        {time}
                        {isBooked && " (Booked)"}
                        {isPastTime && " (Past)"}
                      </SelectItem>
                    );
                  })
                )}
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
                <SelectItem value="completed">Completed</SelectItem>
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
              {isLoading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin">⟳</span>{" "}
                  Updating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" /> Update
                </>
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
