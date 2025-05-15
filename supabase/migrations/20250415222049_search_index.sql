CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "extensions";

alter table "public"."profiles" add column if not exists "last_purchase_date" timestamp without time zone;

CREATE INDEX IF NOT EXISTS profiles_email_trgm_idx ON public.profiles USING gin (email gin_trgm_ops);

CREATE INDEX IF NOT EXISTS profiles_first_name_trgm_idx ON public.profiles USING gin (first_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS profiles_last_name_trgm_idx ON public.profiles USING gin (last_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS profiles_phone_trgm_idx ON public.profiles USING gin (phone gin_trgm_ops);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_last_purchase_date_on_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  IF NEW.status = 'paid' AND OLD.status <> 'paid' THEN
    UPDATE profiles
    SET last_purchase_date = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$function$
;

DROP TRIGGER IF EXISTS update_last_purchase_date_on_update_trigger ON public.orders;

CREATE TRIGGER update_last_purchase_date_on_update_trigger AFTER UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_last_purchase_date_on_update();


