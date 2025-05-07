-- 1. Create functions to convert text fields to lowercase

-- Function to convert text fields to lowercase on INSERT or UPDATE for profiles table
CREATE OR REPLACE FUNCTION public.lowercase_text_fields_profiles()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF NEW.first_name IS NOT NULL THEN
    NEW.first_name = LOWER(NEW.first_name);
  END IF;
  IF NEW.last_name IS NOT NULL THEN
    NEW.last_name = LOWER(NEW.last_name);
  END IF;
  IF NEW.email IS NOT NULL THEN
    NEW.email = LOWER(NEW.email);
  END IF;
  IF NEW.phone IS NOT NULL THEN
    NEW.phone = LOWER(NEW.phone);
  END IF;
  IF NEW.role IS NOT NULL THEN
    NEW.role = LOWER(NEW.role);
  END IF;
  IF NEW.avatar IS NOT NULL THEN
    NEW.avatar = LOWER(NEW.avatar);
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for profiles table
DROP TRIGGER IF EXISTS before_insert_update_profiles ON public.profiles;
CREATE TRIGGER before_insert_update_profiles
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.lowercase_text_fields_profiles();

-- Function to convert text fields to lowercase on INSERT or UPDATE for products table
CREATE OR REPLACE FUNCTION public.lowercase_text_fields_products()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF NEW.name IS NOT NULL THEN
    NEW.name = LOWER(NEW.name);
  END IF;
  IF NEW.category IS NOT NULL THEN
    NEW.category = LOWER(NEW.category);
  END IF;
  IF NEW.slug IS NOT NULL THEN
    NEW.slug = LOWER(NEW.slug);
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for products table (no changes needed here)
DROP TRIGGER IF EXISTS before_insert_update_products ON public.products;
CREATE TRIGGER before_insert_update_products
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.lowercase_text_fields_products();


-- Function to convert text fields to lowercase on INSERT or UPDATE for orders table
CREATE OR REPLACE FUNCTION public.lowercase_text_fields_orders()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
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
  IF NEW.phone IS NOT NULL THEN
    NEW.phone = LOWER(NEW.phone);
  END IF;
  IF NEW.payment_reference IS NOT NULL THEN
    NEW.payment_reference = LOWER(NEW.payment_reference);
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for orders table (no changes needed here)
DROP TRIGGER IF EXISTS before_insert_update_orders ON public.orders;
CREATE TRIGGER before_insert_update_orders
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.lowercase_text_fields_orders();

-- Function to convert text fields to lowercase on INSERT or UPDATE for bookings table
CREATE OR REPLACE FUNCTION public.lowercase_text_fields_bookings()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF NEW.service_name IS NOT NULL THEN
    NEW.service_name = LOWER(NEW.service_name);
  END IF;
  IF NEW.status IS NOT NULL THEN
    NEW.status = LOWER(NEW.status);
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for bookings table (no changes needed here)
DROP TRIGGER IF EXISTS before_insert_update_bookings ON public.bookings;
CREATE TRIGGER before_insert_update_bookings
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.lowercase_text_fields_bookings();

-- 2. Create webhook trigger for deposit-paid webhook

-- Function to call the deposit-paid webhook when a booking's initial_deposit is updated to a value > 0
CREATE OR REPLACE FUNCTION public.trigger_deposit_paid_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, extensions -- ADDED (extensions for net.http_post)
AS $$
BEGIN
  -- Only trigger if the deposit amount has changed and is now greater than 0
  IF (OLD.initial_deposit IS NULL OR OLD.initial_deposit <= 0) AND NEW.initial_deposit > 0 THEN
    PERFORM net.http_post( -- net.http_post will be found in 'extensions' schema
      url := 'https://7bc1-102-213-77-2.ngrok-free.app/api/webhooks/deposit-paid', -- Consider making this URL configurable
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
END;
$$;

-- Trigger for bookings table (no changes needed here)
DROP TRIGGER IF EXISTS after_update_booking_deposit ON public.bookings;
CREATE TRIGGER after_update_booking_deposit
  AFTER UPDATE OF initial_deposit ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_deposit_paid_webhook();