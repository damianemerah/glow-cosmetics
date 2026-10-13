"use client";

import { Button } from "@/constants/ui/index";
import { AlertCircle, CalendarHeart, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { Booking } from "@/types/index";
import { useState } from "react";
import { getUserBookings } from "@/actions/dashboardAction";
import { useUserStore } from "@/store/authStore";
import useSWR from "swr";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import BookingRow from "./booking-row";
import EmptyState from "./empty-state";

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
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 5; // Number of bookings to display per page

  // Use SWR for bookings data
  const {
    data: bookings,
    error,
    mutate,
  } = useSWR<Booking[]>(
    user ? `bookings-${user.user_id}` : null,
    async () => {
      if (!user?.user_id) return []; // Handle case where user is null
      const result = await getUserBookings(user.user_id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    {
      fallbackData: initialBookings,
      revalidateOnFocus: false,
      dedupingInterval: 10000, // 10 seconds
      onError: (error) => {
        console.error("Error fetching bookings:", error);
        toast.warning("Failed to load bookings");
      },
    },
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

  // Pagination calculations
  const totalBookings = sortedBookings.length;
  const totalPages = Math.ceil(totalBookings / bookingsPerPage);

  // Get current page bookings
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = sortedBookings.slice(
    indexOfFirstBooking,
    indexOfLastBooking,
  );

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const refreshBookings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await mutate();
      toast.success("Bookings refreshed");
    } catch (err) {
      console.error("Error refreshing bookings:", err);
      toast.warning("Failed to refresh bookings");
    } finally {
      setLoading(false);
    }
  };

  // const handleCancelBooking = async (bookingId: string) => {
  //   try {
  //     const result = await cancelBooking(bookingId);

  //     if (!result.success) {
  //       toast.warning(`Failed to cancel booking: ${result.error}`);
  //       // Revalidate on error
  //       mutate();
  //       return;
  //     }

  //     // Optimistically update UI via SWR cache
  //     const updatedBookings = bookings?.map((booking) =>
  //       booking.id === bookingId ? { ...booking, status: "cancelled" } : booking
  //     );

  //     mutate(updatedBookings, false);

  //     toast.info("Booking cancelled", {
  //       description: "Your booking has been successfully cancelled.",
  //     });
  //   } catch (error) {
  //     console.error("Error cancelling booking:", error);
  //     toast.warning("Failed to cancel booking. Please try again.");

  //     // Revalidate on error
  //     mutate();
  //   }
  // };

  if (error || initialError) {
    return (
      <div className="flex items-center rounded-lg bg-destructive/5 p-4 text-destructive">
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
      <EmptyState
        icon={CalendarHeart}
        title="You have no bookings yet"
        description="Your appointments will appear here once you book a treatment with us."
        action={{ label: "Book your first appointment", href: "/booking" }}
      />
    );
  }

  const now = new Date();

  return (
    <div className="space-y-3">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Showing {indexOfFirstBooking + 1}–
          {Math.min(indexOfLastBooking, totalBookings)} of {totalBookings}{" "}
          bookings
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshBookings}
            disabled={loading}
          >
            <RefreshCw className="mr-1 h-4 w-4" /> Refresh
          </Button>
          <Button size="sm" asChild>
            <Link href="/booking">
              <Plus className="mr-1 h-4 w-4" /> New booking
            </Link>
          </Button>
        </div>
      </div>

      {currentBookings.map((booking) => (
        <BookingRow
          key={booking.id}
          booking={booking}
          isPast={new Date(booking.booking_time) < now}
        />
      ))}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={prevPage}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {/* First page */}
            {currentPage > 3 && (
              <PaginationItem>
                <PaginationLink onClick={() => paginate(1)}>1</PaginationLink>
              </PaginationItem>
            )}

            {/* Ellipsis if needed */}
            {currentPage > 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Page numbers */}
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              let pageNum;

              if (currentPage <= 2) {
                // Show first 3 pages
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 1) {
                // Show last 3 pages
                pageNum = totalPages - 2 + i;
              } else {
                // Show current page and surrounding pages
                pageNum = currentPage - 1 + i;
              }

              // Ensure page numbers are within valid range
              if (pageNum > 0 && pageNum <= totalPages) {
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      isActive={currentPage === pageNum}
                      onClick={() => paginate(pageNum)}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              return null;
            })}

            {/* Ellipsis if needed */}
            {currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Last page */}
            {currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationLink onClick={() => paginate(totalPages)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={nextPage}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
