alter table "public"."order_items" add column "status" text not null;

alter table "public"."profiles" alter column "phone" drop not null;

alter table "public"."order_items" add constraint "order_items_status_check" CHECK ((status = ANY (ARRAY['incomplete'::text, 'complete'::text]))) not valid;

alter table "public"."order_items" validate constraint "order_items_status_check";

set check_function_bodies = off;

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
 SET search_path TO 'pg_catalog', 'public', 'extensions'
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

CREATE OR REPLACE FUNCTION public.trigger_deposit_paid_webhook()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'public', 'extensions'
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


