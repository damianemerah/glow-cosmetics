"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type SignupData = {
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  receiveEmails: boolean;
  phone: string;
};

export async function login(email: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    },
  });

  if (error) {
    console.error("Login error:", error);
    throw error;
  }

  console.log("Login successful:", data);
  revalidatePath("/", "layout");
  return data;
}

export async function signup(data: SignupData) {
  const supabase = await createClient();

  const { data: authData, error } = await supabase.auth.signInWithOtp({
    email: data.email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
        date_of_birth: data.dateOfBirth,
        receive_emails: data.receiveEmails,
        phone: data.phone,
      },
    },
  });

  if (error) {
    throw error;
  }

  revalidatePath("/", "layout");
  return authData;
}

export async function checkUserExistsByEmail(email: string) {
  const { data, error } = await supabaseAdmin.rpc("get_user_id_by_email", {
    p_email: email,
  });

  if (error) {
    console.error("Error checking user existence:", error);
    return false;
  }

  return data ? true : false;
}

export async function getUserById(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }

  return data;
}
