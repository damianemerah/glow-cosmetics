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

export async function deleteUserAccount(
  userId: string,
  shouldSignOut: boolean = true,
): Promise<ActionResult<{ shouldSignOut: true } | undefined>> {
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error("Failed to delete auth user:", error.message);
      throw error;
    }

    const filePath = `${userId}/avatar.png`;

    // 1. Remove the file from storage
    const { error: removeError } = await supabaseAdmin
      .storage
      .from("avatars")
      .remove([filePath]);

    if (removeError) {
      console.error("Error deleting avatar from storage:", removeError);
      throw removeError;
    }

    return {
      success: true,
      data: shouldSignOut ? { shouldSignOut } : undefined,
    };
  } catch (error) {
    console.error("Unexpected error in deleteUserAccount:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: "UNKNOWN_ERROR",
    };
  }
}

export async function exportUserData(
  userId: string,
): Promise<ActionResult<string>> {
  try {
    // Validate input
    if (!userId) {
      return {
        success: false,
        error: "User ID is required",
        errorCode: "INVALID_INPUT",
      };
    }

    // Fetch profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return {
        success: false,
        error: "Could not retrieve user profile data",
        errorCode: "DB_FETCH_ERROR",
      };
    }

    // Fetch bookings
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("user_id", userId);

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      // Continue even if there's an error with bookings
    }

    // Fetch orders
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("user_id", userId);

    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
      // Continue even if there's an error with orders
    }

    // Fetch wishlist
    const { data: wishlist, error: wishlistError } = await supabaseAdmin
      .from("wishlists")
      .select("*, products:products(name)")
      .eq("user_id", userId);

    if (wishlistError) {
      console.error("Error fetching wishlist:", wishlistError);
      // Continue even if there's an error with wishlist
    }

    // Create a combined data object
    const userData = {
      profile: {
        first_name: profile?.first_name || "Not provided",
        last_name: profile?.last_name || "Not provided",
        email: profile?.email || "Not provided",
        phone: profile?.phone || "Not provided",
        created_at: profile?.created_at || "Unknown",
        last_purchase_date: profile?.last_purchase_date || "None",
      },
      bookings: (bookings || []).map((booking) => ({
        service_name: booking.service_name,
        booking_time: booking.booking_time,
        status: booking.status,
        price: booking.service_price,
        created_at: booking.created_at,
      })),
      orders: (orders || []).map((order) => ({
        order_id: order.id,
        created_at: order.created_at,
        status: order.status,
        total_price: order.total_price,
        items_count: order.items ? order.items.length : 0,
      })),
      wishlist: (wishlist || []).map((item) => ({
        product_name: item.products?.name || "Unknown product",
        added_on: item.created_at,
      })),
    };

    // Convert to JSON string - this will be encoded for download
    const jsonData = JSON.stringify(userData, null, 2);
    const base64Data = Buffer.from(jsonData).toString("base64");

    return {
      success: true,
      data: base64Data,
    };
  } catch (err) {
    console.error("Unexpected error in exportUserData:", err);
    return {
      success: false,
      error: "An unexpected error occurred while exporting your data",
      errorCode: "UNKNOWN_ERROR",
    };
  }
}

// Add the ActionResult interface at the top of the file
interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
}
