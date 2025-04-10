-- Create an RPC function to update inventory after a purchase is confirmed
CREATE OR REPLACE FUNCTION public.update_inventory_after_purchase(order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  order_item RECORD;
  current_stock INT;
  updated_stock INT;
  transaction_successful BOOLEAN := TRUE;
BEGIN
  -- Begin transaction
  BEGIN
    -- Loop through each order item
    FOR order_item IN (
      SELECT oi.product_id, oi.quantity
      FROM order_items oi
      WHERE oi.order_id = $1
    ) LOOP
      -- Get current stock
      SELECT stock_quantity INTO current_stock
      FROM products
      WHERE id = order_item.product_id;

      -- Calculate new stock level
      updated_stock := current_stock - order_item.quantity;

      -- Check if we have enough stock
      IF updated_stock < 0 THEN
        RAISE EXCEPTION 'Insufficient stock for product %', order_item.product_id;
      END IF;

      -- Update product stock
      UPDATE products
      SET stock_quantity = updated_stock,
          updated_at = NOW()
      WHERE id = order_item.product_id;

    END LOOP;

    -- If we get here without errors, return true
    RETURN TRUE;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error (could be expanded)
      RAISE NOTICE 'Error updating inventory: %', SQLERRM;
      -- Rollback will happen automatically
      transaction_successful := FALSE;
      RETURN FALSE;
  END;
END;
$$;

-- Add a comment to the function
COMMENT ON FUNCTION public.update_inventory_after_purchase IS 'Updates product inventory quantities after a successful purchase. Runs in a transaction to ensure data integrity.';

-- Grant access to authenticated and service role users
GRANT EXECUTE ON FUNCTION public.update_inventory_after_purchase TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_inventory_after_purchase TO service_role;