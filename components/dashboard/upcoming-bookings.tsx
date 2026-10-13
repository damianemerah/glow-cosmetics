"use client";

import { Button, Badge, Separator } from "@/constants/ui/index";
import { AlertCircle, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import type { Booking } from "@/types/index";

// import { toast } from "sonner";
import useSWR from "swr";
// import { cancelBooking } from "@/actions/dashboardAction";
import { capitalize } from "@/utils";

interface UpcomingBookingsProps {
  bookings: Booking[];
  initialError: boolean;
}

export default function UpcomingBookings({
  bookings: initialBookings,
  initialError,
}: UpcomingBookingsProps) {
  // Use SWR with the initial data from server
  const { data: bookings } = useSWR<Booking[]>(
    "upcoming-bookings",
    null, // No fetcher function because we're using initialData
    {
      fallbackData: initialBookings,
      revalidateOnFocus: false,
      dedupingInterval: 10000, // 10 seconds
    }
  );

  // const handleCancelBooking = async (bookingId: string) => {
  //   try {
  //     await cancelBooking(bookingId);

  //     // Optimistically update the UI
  //     const updatedBookings = bookings?.map((booking) =>
  //       booking.id === bookingId ? { ...booking, status: "cancelled" } : booking
  //     );

  //     // Update the SWR cache
  //     mutate(updatedBookings, false);

  //     toast.info("Booking cancelled", {
  //       description: "Your booking has been successfully cancelled.",
  //     });
  //   } catch (error) {
  //     console.error("Error cancelling booking:", error);
  //     toast.warning("Failed to cancel booking. Please try again.");

  //     // Revalidate to get the correct state
  //     mutate();
  //   }
  // };

  if (initialError) {
    return (
      <div className="flex items-center p-4 text-destructive bg-destructive/5 rounded-md">
        <AlertCircle className="h-5 w-5 mr-2" />
        <p>Unable to load booking data. Please try again.</p>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No upcoming bookings</p>
        <Button className="mt-4 bg-primary hover:bg-primary/90" asChild>
          <Link href="/booking">Book Now</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.slice(0, 2).map((booking) => (
        <div key={booking.id}>
          <div className="flex flex-wrap items-center justify-between">
            <div>
              <h4 className="font-medium">
                {capitalize(booking.service_name)}
              </h4>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {new Date(booking.booking_time).toLocaleDateString()}
                </span>
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
                    ? "bg-success/10 text-success"
                    : booking.status === "pending"
                      ? "bg-warning/10 text-warning"
                      : "bg-destructive/10 text-destructive"
                }
              >
                {booking.status}
              </Badge>
              {/* {booking.status === "pending" && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 text-destructive hover:text-destructive hover:bg-destructive/5"
                onClick={() => handleCancelBooking(booking.id)}
              >
                Cancel
              </Button>
            )} */}
            </div>
          </div>
          <Separator className="mt-2" />
        </div>
      ))}
      <div className="text-center">
        <Button variant="outline" asChild>
          <a href="#bookings">View All Bookings</a>
        </Button>
      </div>
    </div>
  );
}
