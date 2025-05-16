// app/api/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    let next = searchParams.get("next") ?? "/";

    if (!code) {
        return NextResponse.redirect(`${origin}${next}`);
    }

    const supabaseAdmin = await createClient();

    const { data: exchangeData, error: exchangeError } = await supabaseAdmin
        .auth
        .exchangeCodeForSession(code);

    if (exchangeError || !exchangeData.session) {
        return NextResponse.redirect(`${origin}${next}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = exchangeData.session as any;
    // eslint-enable-next-line @typescript-eslint/no-explicit-any

    const provider = session.user.app_metadata.provider as string;
    const providerToken = session.provider_token as string | undefined;

    // Prepare profile fields
    let firstName: string | null = null;
    let lastName: string | null = null;
    let avatarUrl: string | null = null;

    // Fetch Google profile
    if (provider === "google" && providerToken) {
        try {
            const resp = await fetch(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                { headers: { Authorization: `Bearer ${providerToken}` } },
            );
            if (resp.ok) {
                const p = await resp.json();
                firstName = p.given_name || null;
                lastName = p.family_name || null;
                avatarUrl = p.picture || null;
                // Google doesn't normally return dob without extra scopes
            }
        } catch (e) {
            console.warn("Failed fetching Google profile", e);
        }
    }

    // Fetch Apple profile (if you stored name in raw_user_meta_data)
    if (provider === "apple") {
        // SupabaseAdmin only surfaces raw_user_meta_data once; Apple only sends name on first login
        const raw = session.user.raw_user_meta_data || {};
        firstName = raw.first_name || raw.name?.firstName || null;
        lastName = raw.last_name || raw.name?.lastName || null;
        // no avatar from Apple
    }

    // Fallback to generic metadata if still null
    if (!firstName || !lastName) {
        const raw = session.user.user_metadata || {};
        if (!firstName) {
            firstName = raw.full_name?.split(" ")[0] || raw.name || null;
        }
        if (!lastName) {
            lastName = raw.full_name?.split(" ").slice(1).join(" ") || null;
        }
        avatarUrl = avatarUrl || raw.avatar_url || raw.picture || null;
    }

    // Upsert into profiles
    const { error: upsertError } = await supabaseAdmin
        .from("profiles")
        .upsert(
            {
                user_id: session.user.id,
                email: session.user.email,
                first_name: firstName,
                last_name: lastName,
                avatar: avatarUrl,
                receive_emails: false,
                is_active: true,
            },
            { onConflict: "user_id" },
        );

    if (upsertError) {
        console.error("Error upserting user profile:", upsertError);
    }

    // Determine next redirect
    const { data: profile, error: fetchProfileError } = await supabaseAdmin
        .from("profiles")
        .select("first_name, last_name, phone, date_of_birth")
        .eq("user_id", session.user.id)
        .single();

    if (!fetchProfileError && profile) {
        if (
            profile.first_name && profile.last_name && profile.phone &&
            profile.date_of_birth
        ) {
            next = "/dashboard";
        } else {
            next = "/complete-profile";
        }
    } else {
        next = "/complete-profile";
    }

    // Handle forwarded host / environment
    const forwardedHost = request.headers.get("x-forwarded-host");
    const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
        return NextResponse.redirect(`${origin}${next}`);
    } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
    } else {
        return NextResponse.redirect(`${origin}${next}`);
    }
}
