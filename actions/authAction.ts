"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Profile } from "@/types";

export async function getUserById(
  userId: string,
): Promise<
  { success: boolean; data: Profile | null; error?: string; errorCode?: string }
> {
  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching user by ID:", error);
      return {
        success: false,
        error: "Failed to fetch user profile",
        errorCode: "DB_ERROR",
        data: null,
      };
    }

    return {
      success: true,
      data: data as Profile,
    };
  } catch (err) {
    console.error("Unexpected error fetching user by ID:", err);
    return {
      success: false,
      error: "An unexpected error occurred while fetching user data",
      errorCode: "UNKNOWN_ERROR",
      data: null,
    };
  }
}
