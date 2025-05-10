"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { unstable_cache } from "next/cache";
import { MessageData, sendEmail } from "@/lib/messaging";

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

export async function getClients(page = 1, itemsPerPage = 10) {
  try {
    const fetchClients = unstable_cache(
      async (currentPage: number, perPage: number) => {
        try {
          // Calculate offset based on page number
          const offset = (currentPage - 1) * perPage;

          // Get total count of profiles for pagination
          const { count, error: countError } = await supabaseAdmin
            .from("profiles")
            .select("*", { count: "exact", head: true });

          if (countError) {
            console.error("Error counting clients:", countError);
            return {
              success: false,
              error: countError.message,
              errorCode: "DB_COUNT_ERROR",
              clients: [],
              totalPages: 0,
              currentPage,
            };
          }

          // Get paginated profiles
          const { data: profiles, error } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false })
            .range(offset, offset + perPage - 1);

          if (error) {
            console.error("Error fetching clients:", error);
            return {
              success: false,
              error: error.message,
              errorCode: "DB_FETCH_ERROR",
              clients: [],
              totalPages: 0,
              currentPage,
            };
          }

          // For each profile, get their last booking and total spent
          const clientsPromises = profiles.map(async (profile) => {
            try {
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
                ? orders.reduce(
                  (sum, order) => sum + (order.total_price || 0),
                  0,
                )
                : 0;

              return {
                id: profile.user_id,
                name: `${profile.first_name || ""} ${profile.last_name || ""}`
                  .trim(),
                phone: profile.phone || "",
                email: profile.email || "",
                lastVisit: lastBooking
                  ? new Date(lastBooking.booking_time).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    },
                  )
                  : "Never",
                totalSpent: `R${totalSpent.toFixed(2)}`,
              };
            } catch (err) {
              console.error(
                `Error processing client data for ${profile.user_id}:`,
                err,
              );
              // Return partial data to avoid breaking the whole operation
              return {
                id: profile.user_id,
                name: `${profile.first_name || ""} ${profile.last_name || ""}`
                  .trim(),
                phone: profile.phone || "",
                email: profile.email || "",
                lastVisit: "Error",
                totalSpent: "Error",
              };
            }
          });

          const clients = await Promise.all(clientsPromises);
          return {
            success: true,
            clients,
            totalPages: Math.ceil((count || 0) / perPage),
            currentPage,
          };
        } catch (err) {
          console.error("Error in fetchClients cache function:", err);
          return {
            success: false,
            error: "An unexpected error occurred when fetching clients",
            errorCode: "CACHE_ERROR",
            clients: [],
            totalPages: 0,
            currentPage,
          };
        }
      },
      [`clients-page-${page}`],
      {
        revalidate: 300, // Cache for 5 minutes
        tags: ["clients"],
      },
    );

    return fetchClients(page, itemsPerPage);
  } catch (err) {
    console.error("Error in getClients:", err);
    return {
      success: false,
      error: "An unexpected error occurred when fetching clients",
      errorCode: "UNKNOWN_ERROR",
      clients: [],
      totalPages: 0,
      currentPage: page,
    };
  }
}

export async function sendClientEmail(
  formData: ContactFormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Fetch the Admin's Email from the database
    const { data: adminProfile, error: adminError } = await supabaseAdmin
      .from("profiles") // Your profiles table name
      .select("email") // Select only the email column
      .eq("role", "admin") // Filter by role 'admin'
      .single(); // Expect only one admin profile

    if (adminError || !adminProfile?.email) {
      console.error("Error fetching admin email:", adminError);
      throw new Error(
        adminError?.message || "Admin profile not found or missing email.",
      );
    }

    const adminEmail = adminProfile.email;
    const messageBody = `
      <h2>New Contact Form Submission</h2>
      <hr>
      <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      <p><strong>Subject:</strong> ${formData.subject}</p>
      <hr>
      <h3>Message:</h3>
      <p>${formData.message.replace(/\n/g, "<br>")}</p>
    `;

    const messageData: MessageData = {
      recipients: [adminEmail],
      subject: `New Contact Form: ${formData.subject}`,
      message: messageBody,
      channel: "email",
      type: "contact-form-submission",
    };

    const emailResponse = await sendEmail(messageData);

    if (!emailResponse.success) {
      console.error("Messaging service error:", emailResponse.error);
      throw new Error(
        emailResponse.error || "Failed to send email via messaging service.",
      );
    }

    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // eslint-enable-next-line @typescript-eslint/no-explicit-any
    console.error("Error in sendClientEmail action:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred.",
    };
  }
}
