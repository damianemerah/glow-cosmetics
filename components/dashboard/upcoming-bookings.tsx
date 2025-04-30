"use client";

import { Button, Badge } from "@/constants/ui/index";
import { AlertCircle, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import type { Booking } from "@/types/index";

import { toast } from "sonner";
import useSWR from "swr";
import { cancelBooking } from "@/actions/dashboardAction";

interface UpcomingBookingsProps {
  bookings: Booking[];
  initialError: boolean;
}

export default function UpcomingBookings({
  bookings: initialBookings,
  initialError,
}: UpcomingBookingsProps) {
  // Use SWR with the initial data from server
  const { data: bookings, mutate } = useSWR<Booking[]>(
    "upcoming-bookings",
    null, // No fetcher function because we're using initialData
    {
      fallbackData: initialBookings,
      revalidateOnFocus: false,
      dedupingInterval: 10000, // 10 seconds
    }
  );

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId);

      // Optimistically update the UI
      const updatedBookings = bookings?.map((booking) =>
        booking.id === bookingId ? { ...booking, status: "cancelled" } : booking
      );

      // Update the SWR cache
      mutate(updatedBookings, false);

      toast.info("Booking cancelled", {
        description: "Your booking has been successfully cancelled.",
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.warning("Failed to cancel booking. Please try again.");

      // Revalidate to get the correct state
      mutate();
    }
  };

  if (initialError) {
    return (
      <div className="flex items-center p-4 text-red-800 bg-red-50 rounded-md">
        <AlertCircle className="h-5 w-5 mr-2" />
        <p>Unable to load booking data. Please try again.</p>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No upcoming bookings</p>
        <Button className="mt-4 bg-green-500 hover:bg-green-600" asChild>
          <Link href="/booking">Book Now</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-md"
        >
          <div>
            <h4 className="font-medium">{booking.service_name}</h4>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{new Date(booking.booking_time).toLocaleDateString()}</span>
              <Clock className="h-4 w-4 ml-3 mr-1" />
              <span>
                {new Date(booking.booking_time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
          <div className="mt-3 md:mt-0 flex items-center">
            <Badge
              className={
                booking.status === "confirmed"
                  ? "bg-green-100 text-green-800"
                  : booking.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }
            >
              {booking.status}
            </Badge>
            {booking.status === "pending" && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleCancelBooking(booking.id)}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      ))}
      <div className="text-center">
        <Button variant="outline" asChild>
          <Link href="/booking">View All Bookings</Link>
        </Button>
      </div>
    </div>
  );
}
