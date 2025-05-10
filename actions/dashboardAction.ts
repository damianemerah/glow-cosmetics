"use server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";
import sharp from "sharp";
import type { Booking, BookingStatus, Profile } from "@/types/index";

export async function cancelBooking(bookingId: string) {
  try {
    // 1) Fetch the booking_time
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from("bookings")
      .select("booking_time")
      .eq("id", bookingId)
      .single();

    if (fetchError) {
      console.error("Failed to fetch booking:", fetchError.message);
      return {
        success: false,
        error: fetchError.message,
        errorCode: "DB_FETCH_ERROR",
      };
    }
    if (!booking) {
      return {
        success: false,
        error: "Booking not found",
        errorCode: "NOT_FOUND",
      };
    }

    // 2) Compare to now (in UTC)
    const now = new Date();
    const appointment = new Date(booking.booking_time);
    if (appointment <= now) {
      return {
        success: false,
        error:
          "Cannot cancel a booking on or after its appointment day. Please contact support to reschedule.",
        errorCode: "PAST_BOOKING",
      };
    }

    // 3) It's in the future—go ahead and cancel
    const { error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Failed to update booking:", updateError.message);
      return {
        success: false,
        error: updateError.message,
        errorCode: "DB_UPDATE_ERROR",
      };
    }

    // 4) Revalidate and return
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Unexpected error in cancelBooking:", err);
    return {
      success: false,
      error: "An unexpected error occurred",
      errorCode: "UNKNOWN_ERROR",
    };
  }
}

export async function getUserBookings(
  userId: string,
): Promise<
  { success: boolean; error?: string; errorCode?: string; data: Booking[] | [] }
> {
  try {
    const { data: bookings, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("user_id", userId)
      .order("booking_time", { ascending: true });

    if (error) {
      console.error("Error fetching user bookings:", error);
      return {
        success: false,
        error: error.message,
        errorCode: "DB_ERROR",
        data: [],
      };
    }

    return {
      success: true,
      data: bookings || [],
    };
  } catch (err) {
    console.error("Unexpected error in getUserBookings:", err);
    return {
      success: false,
      error: "An unexpected error occurred",
      errorCode: "UNKNOWN_ERROR",
      data: [],
    };
  }
}

export async function updateBooking(
  bookingId: string,
  updates: Partial<Booking>,
) {
  try {
    if (updates.booking_time && !updates.status) {
      updates.status = "pending";
    }

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .update(updates)
      .match({ id: bookingId })
      .select();

    if (error) {
      console.error("Error updating booking:", error);
      return {
        success: false,
        error: error.message,
        errorCode: "DB_ERROR",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/admin/appointments");
    return {
      success: true,
      booking: data?.[0],
    };
  } catch (err) {
    console.error("Unexpected error in updateBooking:", err);
    return {
      success: false,
      error: "An unexpected error occurred",
      errorCode: "UNKNOWN_ERROR",
    };
  }
}

export async function updateProfile(
  updateData: Partial<Profile>,
  userId: string,
) {
  try {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update(updateData)
      .eq("user_id", userId);

    if (error) {
      throw new Error(error.message);
    }
    revalidatePath("/dashboard");
    revalidateTag(`profile-${userId}`);

    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
}

export async function uploadAvatar(
  file: File,
  userId: string,
): Promise<
  { success: boolean; data?: string; error?: string; errorCode?: string }
> {
  try {
    const fileName = `${userId}-${Date.now()}.webp`;
    const filePath = `${userId}/${fileName}`;

    const fileSize = file.size / 1024 / 1024; // in MB
    if (fileSize > 1) {
      return {
        success: false,
        error: "File size should be less than 2MB",
        errorCode: "FILE_TOO_LARGE",
      };
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

    if (error) {
      console.error("Error uploading avatar:", error);
      return {
        success: false,
        error: "Failed to upload avatar image to storage",
        errorCode: "STORAGE_ERROR",
      };
    }

    // Retrieve public URL for the uploaded file
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("avatars")
      .getPublicUrl(filePath);

    return {
      success: true,
      data: publicUrlData.publicUrl,
    };
  } catch (error) {
    console.error("Unexpected error uploading avatar:", error);
    return {
      success: false,
      error: "An unexpected error occurred during avatar upload",
      errorCode: "UNKNOWN_ERROR",
    };
  }
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
}): Promise<
  {
    success: boolean;
    booking?: Booking | null;
    error?: string;
    errorCode?: string;
  }
> {
  try {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .insert([bookingData])
      .select();

    if (error) {
      console.error("Error creating booking:", error);
      return {
        success: false,
        error: error.message,
        errorCode: "DB_ERROR",
      };
    }

    revalidatePath("/admin/appointments");
    return {
      success: true,
      booking: data?.[0],
    };
  } catch (err) {
    console.error("Unexpected error in createBooking:", err);
    return {
      success: false,
      error: "An unexpected error occurred",
      errorCode: "UNKNOWN_ERROR",
    };
  }
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

  revalidatePath("/dashboard");
  return { success: true };
}

// Add a new function to handle user account deletion

export async function deleteUserAccount(userId: string) {
  try {
    // First check if there are any active bookings
    const { data: activeBookings, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select("id")
      .eq("user_id", userId)
      .in("status", ["pending", "confirmed"])
      .limit(1);

    if (bookingError) {
      return { success: false, error: bookingError.message };
    }

    // If there are active bookings, don't allow deletion
    if (activeBookings && activeBookings.length > 0) {
      return {
        success: false,
        error:
          "Cannot delete account with active bookings. Please cancel them first.",
      };
    }

    // Perform cascading deletion:
    // 1. Soft delete by setting 'deleted_at' in profiles table
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ deleted_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    // 2. Anonymize personal data
    const { error: anonymizeError } = await supabaseAdmin
      .from("profiles")
      .update({
        first_name: "Deleted",
        last_name: "User",
        email: `deleted-${Date.now()}@example.com`,
        phone: null,
        address: null,
        profile_image: null,
      })
      .eq("user_id", userId);

    if (anonymizeError) {
      console.error("Error anonymizing user data:", anonymizeError);
      // Continue with deletion even if anonymization fails
    }

    // 3. Set all orders to anonymized
    const { error: ordersError } = await supabaseAdmin
      .from("orders")
      .update({ is_anonymized: true })
      .eq("user_id", userId);

    if (ordersError) {
      console.error("Error anonymizing orders:", ordersError);
      // Continue with deletion even if order anonymization fails
    }

    // Optional: If you truly want to delete the auth user as well (not just profile data)
    // This is more permanent and requires admin privileges
    // const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    // if (authError) {
    //   return { success: false, error: authError.message };
    // }

    return { success: true };
  } catch (error) {
    console.error("Error deleting user account:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
