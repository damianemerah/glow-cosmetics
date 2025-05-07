-- drop trigger if exists "update_inventory_on_paid" on "public"."orders";

-- drop function if exists "public"."update_inventory_after_purchase"();

set check_function_bodies = off;


CREATE OR REPLACE FUNCTION public.update_inventory_after_order()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
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

-- CREATE OR REPLACE FUNCTION public.lowercase_text_fields_bookings()
--  RETURNS trigger
--  LANGUAGE plpgsql
-- AS $function$
-- BEGIN
--   NEW.service_name = LOWER(NEW.service_name);
--   NEW.status = LOWER(NEW.status);
--   -- END IF;
--   RETURN NEW;
-- END;
-- $function$
-- ;

-- CREATE OR REPLACE FUNCTION public.lowercase_text_fields_products()
--  RETURNS trigger
--  LANGUAGE plpgsql
-- AS $function$
-- BEGIN
--   NEW.name = LOWER(NEW.name);
--   NEW.category = LOWER(NEW.category);
--   NEW.slug = LOWER(NEW.slug);
--   -- END IF;
--   RETURN NEW;
-- END;
-- $function$
-- ;

CREATE OR REPLACE FUNCTION public.notify_order_paid()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
  IF NEW.status = 'paid' AND OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM net.http_post(
      url := 'https://7bc1-102-213-77-2.ngrok-free.app/api/webhooks/order-paid',
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
END;$function$
;

CREATE TRIGGER update_inventory_after_order AFTER UPDATE OF status ON public.orders FOR EACH ROW WHEN (((new.status = 'paid'::text) AND (old.status IS DISTINCT FROM new.status))) EXECUTE FUNCTION update_inventory_after_order();


