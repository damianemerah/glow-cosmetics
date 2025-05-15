create extension if not exists "unaccent" with schema "extensions";


drop policy "Update own carts" on "public"."carts";

drop policy "Update own profile" on "public"."profiles";

alter table "public"."order_items" drop constraint "order_items_status_check";

alter table "public"."orders" drop constraint "orders_status_check";

alter table "public"."order_items" drop column "status";

alter table "public"."orders" alter column "first_name" drop not null;

alter table "public"."orders" add constraint "orders_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'paid'::text, 'completed'::text, 'cancelled'::text]))) not valid;

alter table "public"."orders" validate constraint "orders_status_check";

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
      profile_avatar_url := NEW.raw_user_meta_data ->> 'avatar_url';
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

CREATE OR REPLACE FUNCTION public.lowercase_text_fields_orders()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'public'
AS $function$BEGIN
  IF NEW.first_name IS NOT NULL THEN
    NEW.first_name = LOWER(NEW.first_name);
  END IF;
  IF NEW.status IS NOT NULL THEN
    NEW.status = LOWER(NEW.status);
  END IF;
  IF NEW.payment_method IS NOT NULL THEN
    NEW.payment_method = LOWER(NEW.payment_method);
  END IF;
  IF NEW.last_name IS NOT NULL THEN
    NEW.last_name = LOWER(NEW.last_name);
  END IF;
  IF NEW.email IS NOT NULL THEN
    NEW.email = LOWER(NEW.email);
  END IF;
  -- IF NEW.phone IS NOT NULL THEN
  --   NEW.phone = LOWER(NEW.phone);
  -- END IF;
  IF NEW.payment_reference IS NOT NULL THEN
    NEW.payment_reference = LOWER(NEW.payment_reference);
  END IF;
  RETURN NEW;
END;$function$
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
  -- IF NEW.phone IS NOT NULL THEN
  --   NEW.phone = LOWER(NEW.phone);
  -- END IF;
  IF NEW.role IS NOT NULL THEN
    NEW.role = LOWER(NEW.role);
  END IF;
  IF NEW.avatar IS NOT NULL THEN
    NEW.avatar = LOWER(NEW.avatar);
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
      url := 'https://42eb-102-213-77-2.ngrok-free.app/api/webhooks/order-paid',
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

CREATE OR REPLACE FUNCTION public.search_items(term text, limit_count integer)
 RETURNS TABLE(id uuid, name text, item_type text)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'extensions', 'pg_catalog'
AS $function$
WITH
  -- 1. Product prefix/full-text
  prefix_products AS (
    SELECT
      p.id,
      p.name,
      'product' AS item_type,
      ts_rank(p.search_vector, q) AS rank
    FROM public.products p,
         to_tsquery('english', term || ':*') q
    WHERE p.search_vector @@ q
    ORDER BY rank DESC
    LIMIT limit_count
  ),

  -- 2. Product fuzzy match on name
  fuzzy_products AS (
    SELECT
      p.id,
      p.name,
      'product' AS item_type,
      similarity(unaccent(lower(p.name)), unaccent(lower(term))) AS rank
    FROM public.products p
    WHERE unaccent(lower(p.name)) % unaccent(lower(term))
    ORDER BY rank DESC
    LIMIT limit_count
  ),

-- 2a. Product word_similarity
  wordy_products AS (
    SELECT
      p.id,
      p.name,
      'product' AS item_type,
      word_similarity(term, p.name) AS rank
    FROM products p
    WHERE word_similarity(term, p.name) > 0.4
    ORDER BY rank DESC
    LIMIT limit_count
  ),

  -- 3. Product by category name matching
  products_by_category AS (
    SELECT
      p.id,
      p.name,
      'product' AS item_type,
      ts_rank(c.search_vector, q) AS rank
    FROM public.products p
    JOIN public.product_categories pc ON pc.product_id = p.id
    JOIN public.categories c        ON c.id = pc.category_id,
         to_tsquery('english', term || ':*') q
    WHERE c.search_vector @@ q
    ORDER BY rank DESC
    LIMIT limit_count
  ),

  -- 4. Category prefix search
  prefix_categories AS (
    SELECT
      c.id,
      c.name,
      'category' AS item_type,
      ts_rank(c.search_vector, q) AS rank
    FROM public.categories c,
         to_tsquery('english', term || ':*') q
    WHERE c.search_vector @@ q
    ORDER BY rank DESC
    LIMIT limit_count
  ),

-- 5. Unaccented fuzzy search on category name
fuzzy_categories AS (
  SELECT
    c.id,
    c.name,
    'category' AS item_type,
    similarity(
      unaccent(lower(c.name)),
      unaccent(lower(term))
    ) AS rank
  FROM public.categories c
  WHERE unaccent(lower(c.name)) % unaccent(lower(term))
  ORDER BY rank DESC
  LIMIT limit_count
),

combined AS (
    SELECT id, name, item_type, rank FROM prefix_products
    UNION ALL
    SELECT id, name, item_type, rank FROM fuzzy_products
    UNION ALL
    SELECT id, name, item_type, rank FROM wordy_products
    UNION ALL
    SELECT id, name, item_type, rank FROM products_by_category
    UNION ALL
    SELECT id, name, item_type, rank FROM prefix_categories
    UNION ALL
    SELECT id, name, item_type, rank FROM fuzzy_categories
  )
SELECT DISTINCT ON (item_type, id)
  id,
  name,
  item_type
FROM combined
ORDER BY
  item_type,    -- first group by type
  id,           -- then group by id
  rank DESC     -- pick the highest-ranked entry
LIMIT limit_count;
$function$
;

CREATE OR REPLACE FUNCTION public.trigger_deposit_paid_webhook()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
  -- Only trigger if the deposit amount has changed and is now greater than 0
  IF (OLD.initial_deposit IS NULL OR OLD.initial_deposit <= 0) AND NEW.initial_deposit > 0 THEN
    PERFORM net.http_post(
      url := 'https://42eb-102-213-77-2.ngrok-free.app/api/webhooks/deposit-paid',
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

CREATE OR REPLACE FUNCTION public.update_inventory_after_order()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  order_item RECORD;
  current_stock INT;
BEGIN
  -- Loop through each product in the new order
  FOR order_item IN
    SELECT product_id, quantity
    FROM public.order_items
    WHERE order_id = NEW.id
  LOOP
    -- Fetch current stock for the product
    SELECT stock_quantity
    INTO current_stock
    FROM public.products
    WHERE id = order_item.product_id;

    IF current_stock IS NULL THEN
      RAISE EXCEPTION 'No stock record found for product %', order_item.product_id;
    END IF;

    -- Ensure sufficient stock is available
    IF current_stock < order_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product %, available: %, requested: %', order_item.product_id, current_stock, order_item.quantity;
    END IF;

    -- Update product stock
    UPDATE public.products
    SET stock_quantity = current_stock - order_item.quantity,
        updated_at = NOW()
    WHERE id = order_item.product_id;
  END LOOP;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_last_purchase_date_on_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  IF NEW.status = 'paid' AND OLD.status <> 'paid' THEN
    UPDATE public.profiles
    SET last_purchase_date = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$function$
;

create policy "Allow authenticated users to update own cart"
on "public"."carts"
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Allow authenticated users to update own profile"
on "public"."profiles"
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



