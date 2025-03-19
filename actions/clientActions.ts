"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { unstable_cache } from "next/cache";
import { SupabaseClient } from "@supabase/supabase-js";
// import type { Client } from "@/types/dashboard";

export async function getClients() {
  const supabase = await createClient();

  const fetchClients = unstable_cache(
    async (client: SupabaseClient) => {
      // Fetch profiles
      const { data: profiles, error } = await client
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching clients:", error);
        throw new Error(error.message);
      }

      // For each profile, get their last booking and total spent
      const clientsPromises = profiles.map(async (profile) => {
        // Get last booking
        const { data: lastBooking } = await client
          .from("bookings")
          .select("booking_time")
          .eq("user_id", profile.user_id)
          .order("booking_time", { ascending: false })
          .limit(1)
          .single();

        // Get total spent from orders
        const { data: orders } = await client
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
      return clients;
    },
    ["all-clients"],
    {
      revalidate: 300, // Cache for 5 minutes
      tags: ["clients"],
    }
  );

  return fetchClients(supabase);
}

export async function addClient(formData: FormData) {
  const supabase = await createClient();

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const notes = formData.get("notes") as string;

  // Create a new user account with a random password (they'll need to reset it)
  const tempPassword = Math.random().toString(36).slice(-8);

  const { data: authUser, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });

  if (authError) {
    console.error("Error creating user:", authError);
    return { success: false, error: authError.message };
  }

  // Create profile entry
  const { error: profileError } = await supabase.from("profiles").insert({
    user_id: authUser.user.id,
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    notes,
    address,
    is_complete: true,
  });

  if (profileError) {
    console.error("Error creating profile:", profileError);
    return { success: false, error: profileError.message };
  }

  // Revalidate the clients list
  revalidatePath("/admin/clients");
  return { success: true };
}

export async function importClientsFromCsv(formData: FormData) {
  const file = formData.get("file") as File;

  if (!file) {
    return { success: false, error: "No file provided" };
  }

  try {
    const text = await file.text();
    const rows = text.split("\n");

    // Parse headers
    const headers = rows[0].split(",").map((header) => header.trim());

    const clients = [];

    // Parse data rows
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue; // Skip empty lines

      const values = rows[i].split(",").map((value) => value.trim());
      const client: any = {};

      headers.forEach((header, index) => {
        client[header.toLowerCase()] = values[index];
      });

      clients.push(client);
    }

    // Create clients in the database
    const supabase = await createClient();

    for (const client of clients) {
      // Skip if no email (required field)
      if (!client.email) continue;

      // Create auth user
      const tempPassword = Math.random().toString(36).slice(-8);
      const { data: authUser, error: authError } =
        await supabase.auth.admin.createUser({
          email: client.email,
          password: tempPassword,
          email_confirm: true,
        });

      if (authError) {
        console.error(`Error creating user for ${client.email}:`, authError);
        continue;
      }

      // Create profile
      await supabase.from("profiles").insert({
        user_id: authUser.user.id,
        first_name: client.name?.split(" ")[0] || "",
        last_name: client.name?.split(" ").slice(1).join(" ") || "",
        email: client.email,
        phone: client.phone || "",
        notes: client.notes || "",
        address: client.address || "",
        is_complete: true,
      });
    }

    // Revalidate paths
    revalidatePath("/admin/clients");
    return { success: true, imported: clients.length };
  } catch (error) {
    console.error("Error importing clients:", error);
    return { success: false, error: "Failed to process CSV file" };
  }
}
