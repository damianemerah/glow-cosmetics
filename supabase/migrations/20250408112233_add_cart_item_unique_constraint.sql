-- Migration file: 20240523112233_add_cart_item_unique_constraint.sql

-- Ensure no duplicates exist before applying the constraint
-- Delete duplicates, keeping the most recent entry for each cart_id/product_id pair
DELETE FROM public.cart_items
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY cart_id, product_id
             ORDER BY created_at DESC NULLS LAST
           ) as row_num
    FROM public.cart_items
  ) t
  WHERE t.row_num > 1
);

-- Add the unique constraint
ALTER TABLE public.cart_items
ADD CONSTRAINT unique_cart_product UNIQUE (cart_id, product_id);

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items (cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items (product_id);