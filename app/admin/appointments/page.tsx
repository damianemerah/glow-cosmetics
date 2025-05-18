import AppointmentsClient from "@/components/appointments/appointment-client";
import { createClient } from "@/utils/supabase/server";
import { unstable_cache } from "next/cache";
import { type SupabaseClient } from "@supabase/supabase-js";
import PageHeader from "@/components/admin/page-header";

async function getAllBookings(
  page: number = 1,
  sortBy: string = "booking_time",
  sortDir: "asc" | "desc" = "desc",
  service: string = "all"
) {
  const supabase = await createClient();
  const itemsPerPage = 20;

  const getBookings = unstable_cache(
    async (client: SupabaseClient) => {
      let query = client
        .from("bookings")
        .select("*", { count: "exact" })
        .order(sortBy, { ascending: sortDir === "asc" });

      // Add service filter
      if (service !== "all") {
        query = query.eq("service_id", service);
      }

      // Add pagination
      query = query.range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

      const { data: bookings, error, count } = await query;

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
    [`bookings-${page}-${sortBy}-${sortDir}-${service}`],
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
    service = "all",
    sortBy = "booking_time",
    sortDir = "desc",
  } = await searchParams;

  const currentPage = parseInt(page);
  const validatedSortBy = (
    ["booking_time", "created_at"].includes(sortBy) ? sortBy : "booking_time"
  ) as "booking_time" | "created_at";

  const validatedSortDir = (
    ["asc", "desc"].includes(sortDir) ? sortDir : "desc"
  ) as "asc" | "desc";

  // Pass validated values to getAllBookings
  const { bookings, totalPages } = await getAllBookings(
    currentPage,
    validatedSortBy,
    validatedSortDir,
    service
  );

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
        service={service}
        sortBy={validatedSortBy}
        sortDir={validatedSortDir}
      />
    </>
  );
}
