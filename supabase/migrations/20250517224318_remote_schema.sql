drop function if exists "public"."get_random_products"(count integer);

alter table "public"."profiles" drop column "birthday_notification_enabled";

alter table "public"."profiles" add column "recently_viewed" uuid[] not null default '{}'::uuid[];

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_recommended_products(p_user_id uuid, p_count integer)
 RETURNS SETOF jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'pg_catalog'
AS $function$
  WITH
  order_products AS (
    SELECT DISTINCT oi.product_id
    FROM orders o
    JOIN order_items oi    ON o.id = oi.order_id
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
  personalized AS (
    SELECT p.*
    FROM products p
    WHERE p.is_active
      AND p.id IN (SELECT product_id FROM prioritized_products)
    ORDER BY random()
    LIMIT p_count
  ),
  fill_random AS (
    SELECT p.*
    FROM products p
    WHERE p.is_active
      AND p.id NOT IN (SELECT product_id FROM prioritized_products)
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
              'categories', to_jsonb(c.*)
            ) ORDER BY c.name
          )
          FROM product_categories pc
          JOIN categories c ON pc.category_id = c.id
          WHERE pc.product_id = f.id
        ),
        '[]'::jsonb
      )
    )
  FROM final_set f
  LIMIT p_count;
$function$
;

CREATE OR REPLACE FUNCTION public.set_recently_viewed(p_user_id uuid, p_recent_list uuid[])
 RETURNS void
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'pg_catalog'
AS $function$
  UPDATE public.profiles
  SET recently_viewed = (
    CASE
      WHEN array_length(p_recent_list,1) > 5
        THEN p_recent_list[1:5]
      ELSE p_recent_list
    END
  )
  WHERE user_id = p_user_id;
$function$
;


