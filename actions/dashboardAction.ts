"use server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import type { Booking, BookingStatus, Profile } from "@/types/index";
import { Resend } from "resend";

// export async function cancelBooking(bookingId: string) {
//   const { error } = await supabaseAdmin
//     .from("bookings")
//     .update({ status: "cancelled" })
//     .match({ id: bookingId });

//   if (error) {
//     throw new Error(error.message);
//   }
//   revalidatePath("/dashboard");

//   return { success: true };
// }

export async function cancelBooking(bookingId: string) {
  // 1) Fetch the booking_time
  const { data: booking, error: fetchError } = await supabaseAdmin
    .from("bookings")
    .select("booking_time")
    .eq("id", bookingId)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }
  if (!booking) {
    throw new Error("Booking not found");
  }

  // 2) Compare to now (in UTC)
  const now = new Date();
  const appointment = new Date(booking.booking_time);
  if (appointment <= now) {
    throw new Error(
      "Cannot cancel a booking on or after its appointment day. Please contact support to reschedule.",
    );
  }

  // 3) It's in the future—go ahead and cancel
  const { error: updateError } = await supabaseAdmin
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  // 4) Revalidate and return
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getUserBookings(userId: string) {
  const { data: bookings, error } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .eq("user_id", userId)
    .order("booking_time", { ascending: true });

  if (error) {
    console.error("Error fetching bookings:", error);
    throw new Error(error.message);
  }

  return bookings || [];
}

export async function updateBooking(
  bookingId: string,
  updates: Partial<Booking>,
) {
  if (updates.booking_time && !updates.status) {
    updates.status = "pending";
  }

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .update(updates)
    .match({ id: bookingId })
    .select();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin/appointments");
  return { booking: data?.[0], success: true };
}

export async function updateProfile(
  updateData: Partial<Profile>,
  userId: string,
) {
  const { error } = await supabaseAdmin
    .from("profiles")
    .update(updateData)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard");

  return { success: true };
}

export async function uploadAvatar(
  file: File,
  userId: string,
): Promise<string> {
  const fileName = `${userId}-${Date.now()}.webp`;
  const filePath = `${userId}/${fileName}`;

  const fileSize = file.size / 1024 / 1024; // in MB
  if (fileSize > 1) {
    throw new Error("File size should be less than 2MB");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const resizedImageBuffer = await sharp(buffer)
    .resize({
      width: 96,
      height: 96,
      // withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toBuffer();

  const { error } = await supabaseAdmin.storage
    .from("avatars")
    .upload(filePath, resizedImageBuffer, {
      upsert: false,
      contentType: "image/webp",
      cacheControl: "3600",
    });

  if (error) throw error;

  // Retrieve public URL for the uploaded file
  const { data: publicUrlData } = supabaseAdmin.storage
    .from("avatars")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

export async function createBooking(bookingData: {
  first_name: string;
  last_name?: string;
  user_id: string;
  service_id: string;
  booking_time: string;
  status: BookingStatus;
  service_price: number;
  special_requests?: string;
  booking_id: string;
  phone: string;
  service_name: string;
}) {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .insert([bookingData])
    .select();

  if (error) {
    console.log(error, "error🎈");
    throw new Error(error.message);
  }

  revalidatePath("/admin/appointments");
  return { booking: data?.[0], success: true };
}

export async function setNotificationSettings(
  userId: string,
  type: string,
  enabled: boolean,
) {
  // Ensure only valid notification fields are updated
  const allowedTypes = [
    "email_notifications_enabled",
    "whatsapp_notifications_enabled",
    "appointment_reminder",
    "birthday_notification_enabled",
    "receive_emails",
  ];

  if (!allowedTypes.includes(type)) {
    throw new Error("Invalid notification type");
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ [type]: enabled })
    .eq("user_id", userId);

  if (error) {
    console.log(error, "error🎈");
    throw new Error(error.message);
  }

  // If user is enabling email marketing, add them to Resend audience
  if (type === "receive_emails" && enabled) {
    try {
      // Get user details to add to Resend
      const { data: userData, error: userError } = await supabaseAdmin
        .from("profiles")
        .select("email, first_name, last_name")
        .eq("user_id", userId)
        .single();

      if (userError || !userData) {
        console.error(
          "Error fetching user data for Resend audience:",
          userError,
        );
      } else {
        // Initialize Resend client
        const resend = new Resend(process.env.RESEND_API_KEY);

        // Add user to Resend audience
        if (process.env.RESEND_AUDIENCE_ID && userData.email) {
          await resend.contacts.create({
            audienceId: process.env.RESEND_AUDIENCE_ID,
            email: userData.email,
            firstName: userData.first_name || "",
            lastName: userData.last_name || "",
            unsubscribed: false,
          });
          console.log(`Added ${userData.email} to Resend audience`);
        }
      }
    } catch (resendError) {
      console.error("Error adding user to Resend audience:", resendError);
      // Continue execution - don't fail the whole request for Resend errors
    }
  }

  revalidatePath("/dashboard");
  return { success: true };
}
