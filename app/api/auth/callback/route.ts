import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    // if "next" is in param, use it as the redirect URL
    let next = searchParams.get("next") ?? "/";

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(
            code,
        );

        // const provider = data.session?.user.app_metadata.provider;

        const { data: userData, error: userError } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", data.session?.user.id)
            .single();

        if (userError) {
            console.error("Error fetching user data:", userError);
        }
        if (userData) {
            if (
                userData.first_name && userData.last_name &&
                userData.phone && userData.date_of_birth
            ) {
                // Profile is complete
                next = "/dashboard";
            } else {
                next = "/complete-profile";
            }
        } else {
            // User not found in the database, redirect to new user details page
            next = "/complete-profile";
        }

        if (!error) {
            const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
            console.log(forwardedHost, "FORWARDED HOST 🔥🔥");
            const isLocalEnv = process.env.NODE_ENV === "development";
            if (isLocalEnv) {
                // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
                return NextResponse.redirect(`${origin}${next}`);
            } else if (forwardedHost) {
                console.log("FORWARDED HOST 🔥🔥prod");
                return NextResponse.redirect(`https://${forwardedHost}${next}`);
            } else {
                return NextResponse.redirect(`${origin}${next}`);
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
