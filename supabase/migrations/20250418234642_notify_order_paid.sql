-- Safely add columns to "bookings"
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'sent_confirmation'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN sent_confirmation BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'sent_thanks'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN sent_thanks BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END
$$;

-- Safely add column to "orders"
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'delivery_method'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN delivery_method TEXT NOT NULL;
  END IF;
END
$$;

-- Safely add column to "products"
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'compare_price'
  ) THEN
    ALTER TABLE public.products ADD COLUMN compare_price NUMERIC;
  END IF;
END
$$;

-- Create index only if it doesn’t exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relname = 'idx_bookings_booking_id'
  ) THEN
    CREATE INDEX idx_bookings_booking_id ON public.bookings USING btree (booking_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relname = 'idx_orders_payment_reference'
  ) THEN
    CREATE INDEX idx_orders_payment_reference ON public.orders USING btree (payment_reference);
  END IF;
END
$$;

-- Add and validate constraint if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_check'
      AND conrelid = 'products'::regclass
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_check
      CHECK ((compare_price IS NULL OR compare_price > price)) NOT VALID;

    ALTER TABLE public.products
      VALIDATE CONSTRAINT products_check;
  END IF;
END
$$;

-- Create notify_order_paid function (replace existing)
SET check_function_bodies = OFF;

CREATE OR REPLACE FUNCTION public.notify_order_paid()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
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
END;
$function$;

-- Safely create trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trigger_notify_order_paid'
  ) THEN
    CREATE TRIGGER trigger_notify_order_paid
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION notify_order_paid();
  END IF;
END
$$;
