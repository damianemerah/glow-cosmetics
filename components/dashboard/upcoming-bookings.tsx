"use client";

import { AlertCircle, ArrowRight, CalendarHeart } from "lucide-react";
import useSWR from "swr";
import type { Booking } from "@/types/index";
import { Button } from "@/constants/ui/index";
import BookingRow from "./booking-row";
import EmptyState from "./empty-state";

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
    },
  );

  if (initialError) {
    return (
      <div className="flex items-center rounded-lg bg-destructive/5 p-4 text-destructive">
        <AlertCircle className="mr-2 h-5 w-5" />
        <p>Unable to load booking data. Please try again.</p>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <EmptyState
        icon={CalendarHeart}
        title="Nothing booked yet"
        description="Treat yourself to brows, lashes or a full glam session. Pick a time that suits you."
        action={{ label: "Book an appointment", href: "/booking" }}
      />
    );
  }

  return (
    <div className="space-y-3">
      {bookings.slice(0, 3).map((booking) => (
        <BookingRow key={booking.id} booking={booking} />
      ))}
      <div className="pt-2">
        <Button variant="link" className="h-auto px-0" asChild>
          <a href="#bookings">
            View all bookings <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
