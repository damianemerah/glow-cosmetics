// UNUSED

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Calendar, Clock, RefreshCw, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { Booking } from "@/types/dashboard";
import { useState } from "react";
import { cancelBooking, getUserBookings } from "@/actions/dashboardAction";
import { useUserStore } from "@/store/authStore";
import useSWR from "swr";

interface BookingsListProps {
  bookings: Booking[];
  initialError: boolean;
}

export default function BookingsList({
  bookings: initialBookings,
  initialError,
}: BookingsListProps) {
  const user = useUserStore((state) => state.user);
  const [loading, setLoading] = useState(false);

  // Use SWR for bookings data
  const {
    data: bookings,
    error,
    mutate,
  } = useSWR<Booking[]>(
    user ? `bookings-${user.user_id}` : null,
    async () => {
      if (!user?.user_id) return []; // Handle case where user is null
      return getUserBookings(user.user_id);
    },
    {
      fallbackData: initialBookings,
      revalidateOnFocus: false,
      dedupingInterval: 10000, // 10 seconds
      onError: (error) => {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to load bookings");
      },
    }
  );

  // Sort bookings: upcoming first, then past
  const sortedBookings = bookings
    ? [...bookings].sort((a, b) => {
        const today = new Date();
        const dateA = new Date(`${a.booking_time}`);
        const dateB = new Date(`${b.booking_time}`);

        const aIsPast = dateA < today;
        const bIsPast = dateB < today;

        if (aIsPast && !bIsPast) return 1;
        if (!aIsPast && bIsPast) return -1;

        return dateA.getTime() - dateB.getTime();
      })
    : [];

  const refreshBookings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await mutate();
      toast.success("Bookings refreshed");
    } catch (err) {
      console.error("Error refreshing bookings:", err);
      toast.error("Failed to refresh bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId);

      // Optimistically update UI via SWR cache
      const updatedBookings = bookings?.map((booking) =>
        booking.id === bookingId ? { ...booking, status: "cancelled" } : booking
      );

      mutate(updatedBookings, false);

      toast.info("Booking cancelled", {
        description: "Your booking has been successfully cancelled.",
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking. Please try again.");

      // Revalidate on error
      mutate();
    }
  };

  if (error || initialError) {
    return (
      <div className="flex items-center p-4 text-red-800 bg-red-50 rounded-md">
        <AlertCircle className="h-5 w-5 mr-2" />
        <p>Unable to load booking data.</p>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={refreshBookings}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-1" /> Retry
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Loading bookings...</p>
      </div>
    );
  }

  if (!sortedBookings || sortedBookings.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">You have no bookings yet</p>
        <Button className="mt-4 bg-green-500 hover:bg-green-600" asChild>
          <Link href="/booking">Book Your First Appointment</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={refreshBookings}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      {sortedBookings.map((booking) => {
        const bookingDate = new Date(`${booking.booking_time}`);
        const isPast = bookingDate < new Date();

        return (
          <div
            key={booking.id}
            className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-md"
          >
            <div>
              <h4 className="font-medium">{booking.service_name}</h4>
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
                    ? "bg-green-100 text-green-800"
                    : booking.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : booking.status === "completed"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-red-100 text-red-800"
                }
              >
                {booking.status}
              </Badge>

              {!isPast && booking.status !== "cancelled" && (
                <div className="ml-2 flex">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    <X className="h-4 w-4" /> Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div className="text-center mt-6">
        <Button className="bg-green-500 hover:bg-green-600" asChild>
          <Link href="/booking">Book New Appointment</Link>
        </Button>
      </div>
    </div>
  );
}
