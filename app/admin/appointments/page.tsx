import AppointmentsClient from "../../../components/appointments/appointment-client";
import { createClient } from "@/utils/supabase/server";
import { unstable_cache } from "next/cache";
import { type SupabaseClient } from "@supabase/supabase-js";
import PageHeader from "@/components/admin/page-header";

async function getAllBookings(page: number = 1) {
  const supabase = await createClient();
  const itemsPerPage = 1;

  const getBookings = unstable_cache(
    async (client: SupabaseClient) => {
      const {
        data: bookings,
        error,
        count,
      } = await client
        .from("bookings")
        .select("*", { count: "exact" })
        .order("booking_time", { ascending: true })
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

      if (error) {
        console.error("Error fetching all bookings:", error);
        throw new Error(error.message);
      }

      return {
        bookings: bookings || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / itemsPerPage),
      };
    },
    [`all-bookings-${page}`],
    {
      revalidate: 60,
      tags: ["bookings"],
    }
  );

  return getBookings(supabase);
}

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const {
    page = "1",
    search = "",
    date = "all",
    status = "all",
  } = await searchParams;
  const currentPage = parseInt(page);
  const { bookings, totalPages } = await getAllBookings(currentPage);

  // Extract unique clients from bookings for the client dropdown
  const uniqueClients = Array.from(
    new Set(bookings.map((booking) => booking.user_id))
  ).map((userId) => {
    const booking = bookings.find((b) => b.user_id === userId);
    return {
      id: userId,
      name:
        booking?.client_name ||
        `${booking?.first_name || ""} ${booking?.last_name || ""}`.trim() ||
        `Client ${userId.substring(0, 8)}`,
    };
  });

  return (
    <>
      <PageHeader
        title="Appointments"
        description="Manage client appointments and bookings"
      />
      <AppointmentsClient
        initialBookings={bookings}
        initialClients={uniqueClients}
        currentPage={currentPage}
        totalPages={totalPages}
        search={search}
        date={date}
        status={status}
      />
    </>
  );
}
