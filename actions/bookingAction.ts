"use server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";
import type { Booking } from "@/types/index";

export const fetchTodayBookings = async (date: Date) => {
  try {
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
      console.error("Error fetching today's bookings:", error);
      return { success: false, error: error.message, data: [] };
    }

    return {
      success: true,
      data: bookings.map((booking) => new Date(booking.booking_time)),
    };
  } catch (err) {
    console.error("Unexpected error fetching bookings:", err);
    return {
      success: false,
      error: "An unexpected error occurred while fetching bookings",
      errorCode: "UNKNOWN_ERROR",
      data: [],
    };
  }
};

export const createBooking = async (data: Partial<Booking>) => {
  try {
    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .insert([data])
      .select("*")
      .single();

    if (error) {
      console.error("Error creating booking:", error);
      return {
        success: false,
        error: error.message,
        errorCode: "DB_ERROR",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/booking");
    revalidatePath("/admin/appointments");

    return {
      success: true,
      booking,
    };
  } catch (err) {
    console.error("Unexpected error creating booking:", err);
    return {
      success: false,
      error: "An unexpected error occurred while creating the booking",
      errorCode: "UNKNOWN_ERROR",
    };
  }
};

export const getBookingWithId = async (bookingId: string) => {
  try {
    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("booking_id", bookingId)
      .single();

    if (error) {
      console.error("Error fetching booking:", error);
      return {
        success: false,
        error: error.message,
        errorCode: "DB_ERROR",
        data: null,
      };
    }

    return {
      success: true,
      data: booking,
    };
  } catch (err) {
    console.error("Unexpected error fetching booking:", err);
    return {
      success: false,
      error: "An unexpected error occurred while fetching the booking",
      errorCode: "UNKNOWN_ERROR",
      data: null,
    };
  }
};
