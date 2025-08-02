DROP FUNCTION IF EXISTS public.get_recommended_products(uuid, integer, text);

CREATE OR REPLACE FUNCTION public.get_recommended_products(
  p_user_id uuid,
  p_count integer,
  p_category_filter text DEFAULT NULL
)
RETURNS SETOF jsonb
LANGUAGE sql
STABLE
SET search_path TO 'public', 'pg_catalog'
AS $function$
  WITH
  -- Define category groupings
  category_groups AS (
    SELECT
      c.id,
      c.name,
      CASE
        WHEN LOWER(c.name) = 'jewellers' THEN 'Jewellers'
        ELSE 'Beauty'
      END AS category_group
    FROM categories c
  ),
  order_products AS (
    SELECT DISTINCT oi.product_id
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = p_user_id
  ),
  recently_viewed AS (
    SELECT unnest(recently_viewed) AS product_id
    FROM profiles
    WHERE user_id = p_user_id
  ),
  prioritized_products AS (
    SELECT product_id FROM order_products
    UNION
    SELECT product_id FROM recently_viewed
  ),
  -- Filter products by category if specified
  filtered_products AS (
    SELECT DISTINCT p.id
    FROM products p
    WHERE p.is_active
      AND (
        p_category_filter IS NULL
        OR p.id IN (
          SELECT pc.product_id
          FROM product_categories pc
          JOIN category_groups cg ON pc.category_id = cg.id
          WHERE cg.category_group = p_category_filter
        )
      )
  ),
  personalized AS (
    SELECT p.*
    FROM products p
    WHERE p.is_active
      AND p.id IN (SELECT product_id FROM prioritized_products)
      AND p.id IN (SELECT id FROM filtered_products)
    ORDER BY random()
    LIMIT p_count
  ),
  fill_random AS (
    SELECT p.*
    FROM products p
    WHERE p.is_active
      AND p.id NOT IN (SELECT product_id FROM prioritized_products)
      AND p.id IN (SELECT id FROM filtered_products)
    ORDER BY random()
    LIMIT GREATEST(0, p_count - (SELECT COUNT(*) FROM personalized))
  ),
  final_set AS (
    SELECT * FROM personalized
    UNION ALL
    SELECT * FROM fill_random
  )
  SELECT
    to_jsonb(f.*) ||
    jsonb_build_object(
      'product_categories',
      COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'product_id', pc.product_id,
              'category_id', pc.category_id,
              'categories', to_jsonb(c.*) || jsonb_build_object('category_group', cg.category_group)
            ) ORDER BY c.name
          )
          FROM product_categories pc
          JOIN categories c ON pc.category_id = c.id
          JOIN category_groups cg ON c.id = cg.id
          WHERE pc.product_id = f.id
        ),
        '[]'::jsonb
      )
    )
  FROM final_set f
  LIMIT p_count;
$function$;
