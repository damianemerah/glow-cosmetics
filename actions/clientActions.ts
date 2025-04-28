"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { unstable_cache } from "next/cache";

export async function getClients(page = 1, itemsPerPage = 10) {
  const fetchClients = unstable_cache(
    async (currentPage: number, perPage: number) => {
      // Calculate offset based on page number
      const offset = (currentPage - 1) * perPage;

      // Get total count of profiles for pagination
      const { count, error: countError } = await supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (countError) {
        console.error("Error counting clients:", countError);
        throw new Error(countError.message);
      }

      // Get paginated profiles
      const { data: profiles, error } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .range(offset, offset + perPage - 1);

      if (error) {
        console.error("Error fetching clients:", error);
        throw new Error(error.message);
      }

      // For each profile, get their last booking and total spent
      const clientsPromises = profiles.map(async (profile) => {
        // Get last booking
        const { data: lastBooking } = await supabaseAdmin
          .from("bookings")
          .select("booking_time")
          .eq("user_id", profile.user_id)
          .order("booking_time", { ascending: false })
          .limit(1)
          .single();

        // Get total spent from orders
        const { data: orders } = await supabaseAdmin
          .from("orders")
          .select("total_price")
          .eq("user_id", profile.user_id);

        const totalSpent = orders
          ? orders.reduce((sum, order) => sum + (order.total_price || 0), 0)
          : 0;

        return {
          id: profile.user_id,
          name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim(),
          phone: profile.phone || "",
          email: profile.email || "",
          lastVisit: lastBooking
            ? new Date(lastBooking.booking_time).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
            : "Never",
          totalSpent: `R${totalSpent.toFixed(2)}`,
        };
      });

      const clients = await Promise.all(clientsPromises);
      return {
        clients,
        totalPages: Math.ceil((count || 0) / perPage),
        currentPage,
      };
    },
    [`clients-page-${page}`],
    {
      revalidate: 300, // Cache for 5 minutes
      tags: ["clients"],
    },
  );

  return fetchClients(page, itemsPerPage);
}
