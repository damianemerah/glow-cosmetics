-- Migration file: 20240523120000_create_merge_add_cart_item_rpc.sql

-- Create RPC function to handle merging cart items with proper quantity addition
CREATE OR REPLACE FUNCTION public.merge_add_cart_item(
  p_cart_id uuid,
  p_product_id uuid,
  p_quantity_to_add int,
  p_price_at_time numeric
)
RETURNS boolean AS $$
DECLARE
  updated_rows int;
BEGIN
  -- Step 1: Attempt to add quantity to existing item
  UPDATE public.cart_items
  SET quantity = cart_items.quantity + p_quantity_to_add
  WHERE cart_id = p_cart_id AND product_id = p_product_id;

  GET DIAGNOSTICS updated_rows = ROW_COUNT;

  IF updated_rows > 0 THEN
    -- Successfully added quantity to existing item
    RETURN TRUE;
  ELSE
    -- Step 2: Item doesn't exist, attempt to insert
    BEGIN
      INSERT INTO public.cart_items (cart_id, product_id, quantity, price_at_time)
      VALUES (p_cart_id, p_product_id, p_quantity_to_add, p_price_at_time);
      -- Successfully inserted new item
      RETURN TRUE;
    EXCEPTION
      WHEN unique_violation THEN
        -- Handle race condition where item was inserted between our UPDATE and INSERT
        -- Try the update again
        UPDATE public.cart_items
        SET quantity = cart_items.quantity + p_quantity_to_add
        WHERE cart_id = p_cart_id AND product_id = p_product_id;

        GET DIAGNOSTICS updated_rows = ROW_COUNT;
        RETURN updated_rows > 0;
      WHEN others THEN
        -- Handle other potential errors during insert
        RAISE WARNING 'Error during insert in merge_add_cart_item: %', SQLERRM;
        RETURN FALSE;
    END;
  END IF;

EXCEPTION
  WHEN others THEN
    -- Handle potential errors during update
    RAISE WARNING 'Error during merge_add_cart_item: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.merge_add_cart_item(uuid, uuid, int, numeric) TO authenticated;