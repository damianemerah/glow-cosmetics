-- 1. Create functions to convert text fields to lowercase

-- Function to convert text fields to lowercase on INSERT or UPDATE for profiles table
CREATE OR REPLACE FUNCTION public.lowercase_text_fields_profiles()
RETURNS trigger AS $$
BEGIN
  NEW.first_name = LOWER(NEW.first_name);
  NEW.last_name = LOWER(NEW.last_name);
  NEW.email = LOWER(NEW.email);
  NEW.phone = LOWER(NEW.phone);
  NEW.role = LOWER(NEW.role);
  IF NEW.avatar IS NOT NULL THEN
    NEW.avatar = LOWER(NEW.avatar);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles table
DROP TRIGGER IF EXISTS before_insert_update_profiles ON public.profiles;
CREATE TRIGGER before_insert_update_profiles
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.lowercase_text_fields_profiles();

-- Function to convert text fields to lowercase on INSERT or UPDATE for products table
CREATE OR REPLACE FUNCTION public.lowercase_text_fields_products()
RETURNS trigger AS $$
BEGIN
  NEW.name = LOWER(NEW.name);
  NEW.category = LOWER(NEW.category);
  NEW.slug = LOWER(NEW.slug);
  -- END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for products table
DROP TRIGGER IF EXISTS before_insert_update_products ON public.products;
CREATE TRIGGER before_insert_update_products
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.lowercase_text_fields_products();

-- Function to convert text fields to lowercase on INSERT or UPDATE for orders table
CREATE OR REPLACE FUNCTION public.lowercase_text_fields_orders()
RETURNS trigger AS $$
BEGIN
  NEW.first_name = LOWER(NEW.first_name);
  NEW.status = LOWER(NEW.status);
  NEW.payment_method = LOWER(NEW.payment_method);
  IF NEW.last_name IS NOT NULL THEN
    NEW.last_name = LOWER(NEW.last_name);
  END IF;
  NEW.email = LOWER(NEW.email);
  NEW.phone = LOWER(NEW.phone);
  NEW.payment_reference = LOWER(NEW.payment_reference);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for orders table
DROP TRIGGER IF EXISTS before_insert_update_orders ON public.orders;
CREATE TRIGGER before_insert_update_orders
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.lowercase_text_fields_orders();

-- Function to convert text fields to lowercase on INSERT or UPDATE for bookings table
CREATE OR REPLACE FUNCTION public.lowercase_text_fields_bookings()
RETURNS trigger AS $$
BEGIN
  NEW.service_name = LOWER(NEW.service_name);
  NEW.status = LOWER(NEW.status);
  -- END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for bookings table
DROP TRIGGER IF EXISTS before_insert_update_bookings ON public.bookings;
CREATE TRIGGER before_insert_update_bookings
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.lowercase_text_fields_bookings();

-- 2. Create webhook trigger for deposit-paid webhook

-- Function to call the deposit-paid webhook when a booking's initial_deposit is updated to a value > 0
CREATE OR REPLACE FUNCTION public.trigger_deposit_paid_webhook()
RETURNS trigger AS $$
BEGIN
  -- Only trigger if the deposit amount has changed and is now greater than 0
  IF (OLD.initial_deposit IS NULL OR OLD.initial_deposit <= 0) AND NEW.initial_deposit > 0 THEN
    PERFORM net.http_post(
      url := 'https://7bc1-102-213-77-2.ngrok-free.app/api/webhooks/deposit-paid',
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
$$ LANGUAGE plpgsql;

-- Trigger for bookings table to call webhook when deposit is paid
DROP TRIGGER IF EXISTS after_update_booking_deposit ON public.bookings;
CREATE TRIGGER after_update_booking_deposit
  AFTER UPDATE OF initial_deposit ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_deposit_paid_webhook();