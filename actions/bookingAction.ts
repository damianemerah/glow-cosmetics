"use server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";
import type { Booking } from "@/types/index";

export const fetchTodayBookings = async (date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { data: bookings, error } = await supabaseAdmin
    .from("bookings")
    .select("booking_time")
    .gte("booking_time", startOfDay.toISOString())
    .lte("booking_time", endOfDay.toISOString());

  if (error) {
    console.error(error);
    return [];
  }

  return bookings.map((booking) => new Date(booking.booking_time));
};

export const createBooking = async (data: Partial<Booking>) => {
  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .insert([data])
    .select("*")
    .single();

  revalidatePath("/dashboard");
  revalidatePath("/booking");
  revalidatePath("/admin/appointments");

  return { booking, error };
};

export const getAvailableTimes = async (serviceId: string, date: Date) => {
  const { data: bookings, error } = await supabaseAdmin
    .from("bookings")
    .select("booking_time")
    .eq("service_id", serviceId)
    .eq("date", date.toDateString());
  return { bookings, error };
};

export const getBookingWithId = async (bookingId: string) => {
  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .eq("booking_id", bookingId)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return booking;
};
