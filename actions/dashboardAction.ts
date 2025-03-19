"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import type { Profile, Booking, BookingStatus } from "@/types/dashboard";

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .match({ id: bookingId });

  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard");

  return { success: true };
}

export async function getUserBookings(userId: string) {
  const supabase = await createClient();

  const { data: bookings, error } = await supabase
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
  updates: Partial<Booking>
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .update(updates)
    .match({ id: bookingId })
    .select();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  return { booking: data?.[0], success: true };
}

export async function rescheduleBooking(
  bookingId: string,
  newBookingTime: string
) {
  return updateBooking(bookingId, {
    booking_time: newBookingTime,
    status: "pending",
  });
}

export async function updateProfile(
  updateData: Partial<Profile>,
  userId: string
) {
  const supabase = await createClient();
  const { error } = await supabase
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
  userId: string
): Promise<string> {
  const supabase = await createClient();

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

  const { error } = await supabase.storage
    .from("avatars")
    .upload(filePath, resizedImageBuffer, {
      upsert: false,
      contentType: "image/webp",
      cacheControl: "3600",
    });

  if (error) throw error;

  // Retrieve public URL for the uploaded file
  const { data: publicUrlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

export async function createBooking(bookingData: {
  user_id: string;
  service_id: string;
  booking_time: string;
  status: BookingStatus;
  special_requests?: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .insert([bookingData])
    .select();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/appointments");
  return { booking: data?.[0], success: true };
}
