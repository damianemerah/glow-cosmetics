drop policy "Allow authenticated users to update own profile" on "public"."profiles";

drop policy "Select own profile" on "public"."profiles";

alter table "public"."profiles" add column "deleted_at" date;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  profile_first_name TEXT;
  profile_last_name TEXT;
  profile_avatar_url TEXT;
  profile_phone TEXT;
  profile_date_of_birth DATE;
  profile_receive_emails BOOLEAN;
  v_provider TEXT; -- Variable to hold provider for logging
  v_err_context TEXT; -- For capturing error context
BEGIN
  -- Start Log: Indicate trigger execution and user ID
  RAISE NOTICE '[handle_new_user_profile] - START Trigger for User ID: %, Email: %', NEW.id, NEW.email;

  -- Wrap core logic in an exception block to catch errors during profile creation
  BEGIN
    -- Extract common data (add specific NOTICE if needed for debugging)
    profile_receive_emails := COALESCE((NEW.raw_user_meta_data ->> 'receive_emails')::boolean, FALSE);
    profile_phone := NEW.raw_user_meta_data ->> 'phone';

    -- Safely attempt date conversion
    BEGIN
      profile_date_of_birth := (NEW.raw_user_meta_data ->> 'date_of_birth')::date;
    EXCEPTION
      WHEN invalid_text_representation THEN
        RAISE NOTICE '[handle_new_user_profile] - User ID: % - Invalid date format provided: %', NEW.id, NEW.raw_user_meta_data ->> 'date_of_birth';
        profile_date_of_birth := NULL; -- Assign NULL if conversion fails
      WHEN others THEN -- Catch any other potential error during date conversion
        RAISE WARNING '[handle_new_user_profile] - User ID: % - Unexpected error converting date: %', NEW.id, SQLERRM;
        profile_date_of_birth := NULL;
    END;

    -- Log extracted common values
    RAISE NOTICE '[handle_new_user_profile] - User ID: % - Extracted Phone: %, DOB: %, Receives Emails: %',
        NEW.id, profile_phone, profile_date_of_birth, profile_receive_emails;

    -- Log the raw metadata for deeper debugging if necessary
    -- RAISE NOTICE '[handle_new_user_profile] - User ID: % - Raw User Meta Data: %', NEW.id, NEW.raw_user_meta_data;
    -- RAISE NOTICE '[handle_new_user_profile] - User ID: % - Raw App Meta Data: %', NEW.id, NEW.raw_app_meta_data;

    v_provider := NEW.raw_app_meta_data ->> 'provider';
    RAISE NOTICE '[handle_new_user_profile] - User ID: % - Detected Provider: %', NEW.id, v_provider;

    -- Provider-specific logic
    IF v_provider = 'google' THEN
      profile_first_name := NEW.raw_user_meta_data ->> 'given_name'; -- Often 'given_name' from Google
      profile_last_name := NEW.raw_user_meta_data ->> 'family_name'; -- Often 'family_name' from Google
      profile_avatar_url := NEW.raw_user_meta_data ->> 'picture';
      RAISE NOTICE '[handle_new_user_profile] - User ID: % - Extracted Google Data: Name=%, Avatar=%', NEW.id, profile_first_name || ' ' || profile_last_name, profile_avatar_url;

    ELSIF v_provider = 'apple' THEN
      -- Apple often provides name parts only on first login, might be in raw_user_meta_data -> 'name' object
      profile_first_name := NEW.raw_user_meta_data ->> 'first_name'; -- Adjust if needed based on actual Apple data structure
      profile_last_name := NEW.raw_user_meta_data ->> 'last_name';  -- Adjust if needed
      profile_avatar_url := NULL; -- Apple doesn't provide avatar URL
      RAISE NOTICE '[handle_new_user_profile] - User ID: % - Extracted Apple Data: Name=%', NEW.id, profile_first_name || ' ' || profile_last_name;

    ELSIF v_provider = 'email' OR v_provider = 'phone' THEN
      profile_first_name := NEW.raw_user_meta_data ->> 'first_name';
      profile_last_name := NEW.raw_user_meta_data ->> 'last_name';
      profile_avatar_url := NEW.raw_user_meta_data ->> 'avatar_url'; -- Might be null
      RAISE NOTICE '[handle_new_user_profile] - User ID: % - Extracted Email/Phone Data: Name=%, Avatar=%', NEW.id, profile_first_name || ' ' || profile_last_name, profile_avatar_url;

    ELSE -- Handle unknown or other providers
      RAISE NOTICE '[handle_new_user_profile] - User ID: % - Using default extraction for unknown provider: %', NEW.id, v_provider;
      profile_first_name := NEW.raw_user_meta_data ->> 'first_name'; -- Attempt generic extraction
      profile_last_name := NEW.raw_user_meta_data ->> 'last_name';
      profile_avatar_url := NEW.raw_user_meta_data ->> 'avatar_url';
    END IF;

    -- Log before insert
    RAISE NOTICE '[handle_new_user_profile] - User ID: % - Attempting INSERT/CONFLICT check into profiles.', NEW.id;
    RAISE NOTICE '[handle_new_user_profile] - User ID: % - Values: email=%, role=user, fname=%, lname=%, avatar=%, phone=%, dob=%, receive_emails=%, is_active=TRUE',
        NEW.id, NEW.email, profile_first_name, profile_last_name, profile_avatar_url, profile_phone, profile_date_of_birth, profile_receive_emails;

    -- Insert profile - ON CONFLICT handles potential race conditions or retries
    INSERT INTO public.profiles (
      user_id, email, role, first_name, last_name, avatar, phone, date_of_birth, receive_emails, is_active
    )
    VALUES (
      NEW.id, NEW.email, 'user', profile_first_name, profile_last_name, profile_avatar_url, profile_phone, profile_date_of_birth, profile_receive_emails, TRUE
    )
    ON CONFLICT (user_id) DO NOTHING; -- If user_id exists, do nothing

    RAISE NOTICE '[handle_new_user_profile] - User ID: % - INSERT/CONFLICT check completed.', NEW.id;

  EXCEPTION
    WHEN OTHERS THEN -- Catch any unexpected error during the process
      GET STACKED DIAGNOSTICS v_err_context = PG_EXCEPTION_CONTEXT;
      RAISE WARNING '[handle_new_user_profile] - User ID: % - EXCEPTION during profile creation! SQLSTATE: %, SQLERRM: %',
          NEW.id, SQLSTATE, SQLERRM;
      RAISE WARNING '[handle_new_user_profile] - User ID: % - Exception Context: %', NEW.id, v_err_context;
      -- IMPORTANT: Do not re-raise the exception here (e.g., with RAISE EXCEPTION)
      -- unless you INTEND for the original user creation INSERT to fail if profile creation fails.
      -- Usually, you want user creation to succeed even if profile population encounters an issue.
  END; -- End of the exception block

  -- End Log: Indicate trigger completion
  RAISE NOTICE '[handle_new_user_profile] - END Trigger for User ID: %', NEW.id;

  -- Crucial: ALWAYS return NEW for an AFTER INSERT trigger on auth.users
  -- Failure to do so can cause the original INSERT into auth.users to fail.
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.lowercase_text_fields_profiles()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'public'
AS $function$BEGIN
  IF NEW.first_name IS NOT NULL THEN
    NEW.first_name = LOWER(NEW.first_name);
  END IF;
  IF NEW.last_name IS NOT NULL THEN
    NEW.last_name = LOWER(NEW.last_name);
  END IF;
  IF NEW.email IS NOT NULL THEN
    NEW.email = LOWER(NEW.email);
  END IF;
  IF NEW.role IS NOT NULL THEN
    NEW.role = LOWER(NEW.role);
  END IF;
  RETURN NEW;
END;$function$
;

CREATE OR REPLACE FUNCTION public.notify_order_paid()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
  IF NEW.status = 'paid' AND OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM net.http_post(
      url := 'https://ugosylviacosmetics.co.za/api/webhooks/order-paid',
      body := jsonb_build_object(
        'order_id', NEW.id,
        'user_id', NEW.user_id,
        'total_price', NEW.total_price,
        'payment_reference', NEW.payment_reference
      ),
      headers := '{"Content-Type": "application/json"}'::jsonb
    );
  END IF;
  RETURN NEW;
END;$function$
;

CREATE OR REPLACE FUNCTION public.trigger_deposit_paid_webhook()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
  -- Only trigger if the deposit amount has changed and is now greater than 0
  IF (OLD.initial_deposit IS NULL OR OLD.initial_deposit <= 0) AND NEW.initial_deposit > 0 THEN
    PERFORM net.http_post(
      url := 'https://ugosylviacosmetics.co.za/api/webhooks/deposit-paid',
      body := jsonb_build_object(
        'booking_id', NEW.booking_id,
        'user_id', NEW.user_id,
        'deposit_amount', NEW.initial_deposit,
        'service_name', NEW.service_name
      ),
      headers := '{"Content-Type": "application/json"}'::jsonb
    );
  END IF;
  RETURN NEW;
END;$function$
;

create policy "profiles_insert_on_user"
on "public"."profiles"
as permissive
for insert
to authenticated, anon, service_role
with check ((auth.uid() = user_id));


create policy "profiles_select_own"
on "public"."profiles"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "profiles_update_on_user"
on "public"."profiles"
as permissive
for update
to authenticated, anon, service_role
using ((auth.uid() = user_id));



