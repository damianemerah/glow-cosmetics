-- Drop the old trigger
DROP TRIGGER IF EXISTS update_inventory_on_paid_trigger
  ON public.orders;

-- Drop the wrapper trigger-caller function
DROP FUNCTION IF EXISTS public.trigger_update_inventory_on_paid() CASCADE;

DROP FUNCTION IF EXISTS public.update_inventory_after_purchase(UUID);


CREATE OR REPLACE FUNCTION public.update_inventory_after_purchase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  order_item RECORD;
  current_stock INT;
  updated_stock INT;
BEGIN
  -- Only act when status changes to 'paid'
  IF TG_OP = 'UPDATE'
     AND NEW.status = 'paid'
     AND OLD.status IS DISTINCT FROM NEW.status
  THEN
    FOR order_item IN
      SELECT product_id, quantity
      FROM order_items
      WHERE order_id = NEW.id
    LOOP
      -- Fetch and adjust stock
      SELECT stock_quantity
      INTO current_stock
      FROM products
      WHERE id = order_item.product_id;

      updated_stock := current_stock - order_item.quantity;

      IF updated_stock < 0 THEN
        RAISE EXCEPTION 'Insufficient stock for product %', order_item.product_id;
      END IF;

      UPDATE products
      SET stock_quantity = updated_stock,
          updated_at     = NOW()
      WHERE id = order_item.product_id;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_inventory_after_purchase IS
  'Trigger function: decrements inventory when an order status transitions to paid.';

DROP TRIGGER IF EXISTS update_inventory_on_paid
  ON public.orders;

CREATE TRIGGER update_inventory_on_paid
AFTER UPDATE OF status
ON public.orders
FOR EACH ROW
WHEN (NEW.status = 'paid' AND OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.update_inventory_after_purchase();

REVOKE EXECUTE ON FUNCTION public.update_inventory_after_purchase() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.update_inventory_after_purchase() FROM service_role;

