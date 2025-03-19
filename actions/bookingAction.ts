"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { Booking } from "@/types/dashboard";

export const fetchTodayBookings = async (date: Date) => {
  const supabase = await createClient();
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { data: bookings, error } = await supabase
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
  const supabase = await createClient();

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert([data])
    .select("*")
    .single();

  revalidatePath("/dashboard");
  revalidatePath("/admin/appointments");

  console.log("Booking created:🔥🔥", booking);
  return { booking, error };
};

export const getAvailableTimes = async (serviceId: string, date: Date) => {
  const supabase = await createClient();
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("booking_time")
    .eq("service_id", serviceId)
    .eq("date", date.toDateString());
  return { bookings, error };
};
