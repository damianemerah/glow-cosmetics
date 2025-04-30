alter table "public"."orders" drop constraint "orders_status_check";

create table "public"."categories" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "parent_id" uuid,
    "created_at" timestamp with time zone not null default now(),
    "images" text[],
    "search_vector" tsvector,
    "slug" text not null,
    "pinned" boolean not null default true
);


alter table "public"."categories" enable row level security;

create table "public"."product_categories" (
    "product_id" uuid not null,
    "category_id" uuid not null
);


create table "public"."wishlists" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "product_id" uuid not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."wishlists" enable row level security;

alter table "public"."cart_items" add column "color" text;

alter table "public"."order_items" add column "color" text;

alter table "public"."products" drop column "category";

alter table "public"."products" add column "additional_details" jsonb;

alter table "public"."products" add column "color" jsonb[];

alter table "public"."products" add column "search_vector" tsvector;

alter table "public"."profiles" alter column "receive_emails" set not null;

CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id);

CREATE INDEX categories_search_vector_idx ON public.categories USING gin (search_vector);

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);

CREATE INDEX idx_wishlists_product_id ON public.wishlists USING btree (product_id);

CREATE INDEX idx_wishlists_user_id ON public.wishlists USING btree (user_id);

CREATE INDEX product_categories_category_id_idx ON public.product_categories USING btree (category_id);

CREATE UNIQUE INDEX product_categories_pkey ON public.product_categories USING btree (product_id, category_id);

CREATE INDEX product_categories_product_id_idx ON public.product_categories USING btree (product_id);

CREATE INDEX products_search_vector_idx ON public.products USING gin (search_vector);

CREATE UNIQUE INDEX wishlists_pkey ON public.wishlists USING btree (id);

CREATE UNIQUE INDEX wishlists_user_id_product_id_key ON public.wishlists USING btree (user_id, product_id);

alter table "public"."categories" add constraint "categories_pkey" PRIMARY KEY using index "categories_pkey";

alter table "public"."product_categories" add constraint "product_categories_pkey" PRIMARY KEY using index "product_categories_pkey";

alter table "public"."wishlists" add constraint "wishlists_pkey" PRIMARY KEY using index "wishlists_pkey";

alter table "public"."categories" add constraint "categories_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL not valid;

alter table "public"."categories" validate constraint "categories_parent_id_fkey";

alter table "public"."categories" add constraint "categories_slug_key" UNIQUE using index "categories_slug_key";

alter table "public"."product_categories" add constraint "product_categories_category_id_fkey" FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE not valid;

alter table "public"."product_categories" validate constraint "product_categories_category_id_fkey";

alter table "public"."product_categories" add constraint "product_categories_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE not valid;

alter table "public"."product_categories" validate constraint "product_categories_product_id_fkey";

alter table "public"."wishlists" add constraint "wishlists_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE not valid;

alter table "public"."wishlists" validate constraint "wishlists_product_id_fkey";

alter table "public"."wishlists" add constraint "wishlists_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE not valid;

alter table "public"."wishlists" validate constraint "wishlists_user_id_fkey";

alter table "public"."wishlists" add constraint "wishlists_user_id_product_id_key" UNIQUE using index "wishlists_user_id_product_id_key";

alter table "public"."orders" add constraint "orders_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'paid'::text, 'shipped'::text, 'completed'::text, 'cancelled'::text, 'failed'::text]))) not valid;

alter table "public"."orders" validate constraint "orders_status_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.search_items(term text, limit_count integer)
 RETURNS TABLE(id uuid, name text, item_type text)
 LANGUAGE sql
 STABLE
AS $function$
WITH
  -- 1. Product prefix/full-text
  prefix_products AS (
    SELECT
      p.id,
      p.name,
      'product' AS item_type,
      ts_rank(p.search_vector, q) AS rank
    FROM public.products p,
         to_tsquery('english', term || ':*') q
    WHERE p.search_vector @@ q
    ORDER BY rank DESC
    LIMIT limit_count
  ),

  -- 2. Product fuzzy match on name
  fuzzy_products AS (
    SELECT
      p.id,
      p.name,
      'product' AS item_type,
      similarity(p.name, term) AS rank
    FROM public.products p
    WHERE p.name % term
    ORDER BY rank DESC
    LIMIT limit_count
  ),

  -- 3. Product by category name matching
  products_by_category AS (
    SELECT
      p.id,
      p.name,
      'product' AS item_type,
      ts_rank(c.search_vector, q) AS rank
    FROM public.products p
    JOIN public.product_categories pc ON pc.product_id = p.id
    JOIN public.categories c        ON c.id = pc.category_id,
         to_tsquery('english', term || ':*') q
    WHERE c.search_vector @@ q
    ORDER BY rank DESC
    LIMIT limit_count
  ),

  -- 4. Category prefix search
  prefix_categories AS (
    SELECT
      c.id,
      c.name,
      'category' AS item_type,
      ts_rank(c.search_vector, q) AS rank
    FROM public.categories c,
         to_tsquery('english', term || ':*') q
    WHERE c.search_vector @@ q
    ORDER BY rank DESC
    LIMIT limit_count
  ),

  -- 5. Category fuzzy search on name
  fuzzy_categories AS (
    SELECT
      c.id,
      c.name,
      'category' AS item_type,
      similarity(c.name, term) AS rank
    FROM public.categories c
    WHERE c.name % term
    ORDER BY rank DESC
    LIMIT limit_count
  ),
combined AS (
    SELECT id, name, item_type, rank FROM prefix_products
    UNION ALL
    SELECT id, name, item_type, rank FROM fuzzy_products
    UNION ALL
    SELECT id, name, item_type, rank FROM products_by_category
    UNION ALL
    SELECT id, name, item_type, rank FROM prefix_categories
    UNION ALL
    SELECT id, name, item_type, rank FROM fuzzy_categories
  )
SELECT DISTINCT ON (item_type, id)
  id,
  name,
  item_type
FROM combined
ORDER BY
  item_type,    -- first group by type
  id,           -- then group by id
  rank DESC     -- pick the highest-ranked entry
LIMIT limit_count;
$function$
;

CREATE OR REPLACE FUNCTION public.get_random_products(count integer)
 RETURNS SETOF jsonb
 LANGUAGE sql
 STABLE
AS $function$
SELECT
  -- Convert the product row to jsonb
  to_jsonb(p.*) || -- Use the || operator to merge JSONB objects
  -- Create a jsonb object with a single key 'product_categories'
  -- The value is the result of the subquery (an aggregated jsonb array)
  jsonb_build_object(
    'product_categories',
    ( -- Start correlated subquery to fetch and aggregate categories for THIS product (p.id)
      SELECT
        COALESCE(
          jsonb_agg( -- Aggregate the results into a JSONB array
            jsonb_build_object(
              -- Keys from the product_categories table itself
              'product_id', pc.product_id,
              'category_id', pc.category_id,
              -- Nested 'categories' object containing all columns from the categories table
              'categories', to_jsonb(c.*)
            ) ORDER BY c.name -- Optional: Order categories within the array
          ),
          '[]'::jsonb -- If aggregation results in NULL (no categories), return an empty array
        )
      FROM product_categories pc
      JOIN categories c ON pc.category_id = c.id
      WHERE pc.product_id = p.id -- IMPORTANT: Link subquery to the outer query's product
    ) -- End correlated subquery
  ) -- End jsonb_build_object
FROM
  products p -- Alias the main products table
WHERE
  p.is_active = true -- Filter for active products
ORDER BY
  random() -- Order the results randomly
LIMIT count; -- Limit to the specified number
$function$
;

CREATE OR REPLACE FUNCTION public.lowercase_text_fields_products()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.name = LOWER(NEW.name);
  NEW.slug = LOWER(NEW.slug);
  -- END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.notify_order_paid()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
  IF NEW.status = 'paid' AND OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM net.http_post(
      url := 'https://5551-185-107-56-61.ngrok-free.app/api/webhooks/order-paid',
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
      url := 'https://5551-185-107-56-61.ngrok-free.app/api/webhooks/deposit-paid',
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

grant delete on table "public"."categories" to "anon";

grant insert on table "public"."categories" to "anon";

grant references on table "public"."categories" to "anon";

grant select on table "public"."categories" to "anon";

grant trigger on table "public"."categories" to "anon";

grant truncate on table "public"."categories" to "anon";

grant update on table "public"."categories" to "anon";

grant delete on table "public"."categories" to "authenticated";

grant insert on table "public"."categories" to "authenticated";

grant references on table "public"."categories" to "authenticated";

grant select on table "public"."categories" to "authenticated";

grant trigger on table "public"."categories" to "authenticated";

grant truncate on table "public"."categories" to "authenticated";

grant update on table "public"."categories" to "authenticated";

grant delete on table "public"."categories" to "service_role";

grant insert on table "public"."categories" to "service_role";

grant references on table "public"."categories" to "service_role";

grant select on table "public"."categories" to "service_role";

grant trigger on table "public"."categories" to "service_role";

grant truncate on table "public"."categories" to "service_role";

grant update on table "public"."categories" to "service_role";

grant delete on table "public"."product_categories" to "anon";

grant insert on table "public"."product_categories" to "anon";

grant references on table "public"."product_categories" to "anon";

grant select on table "public"."product_categories" to "anon";

grant trigger on table "public"."product_categories" to "anon";

grant truncate on table "public"."product_categories" to "anon";

grant update on table "public"."product_categories" to "anon";

grant delete on table "public"."product_categories" to "authenticated";

grant insert on table "public"."product_categories" to "authenticated";

grant references on table "public"."product_categories" to "authenticated";

grant select on table "public"."product_categories" to "authenticated";

grant trigger on table "public"."product_categories" to "authenticated";

grant truncate on table "public"."product_categories" to "authenticated";

grant update on table "public"."product_categories" to "authenticated";

grant delete on table "public"."product_categories" to "service_role";

grant insert on table "public"."product_categories" to "service_role";

grant references on table "public"."product_categories" to "service_role";

grant select on table "public"."product_categories" to "service_role";

grant trigger on table "public"."product_categories" to "service_role";

grant truncate on table "public"."product_categories" to "service_role";

grant update on table "public"."product_categories" to "service_role";

grant delete on table "public"."wishlists" to "anon";

grant insert on table "public"."wishlists" to "anon";

grant references on table "public"."wishlists" to "anon";

grant select on table "public"."wishlists" to "anon";

grant trigger on table "public"."wishlists" to "anon";

grant truncate on table "public"."wishlists" to "anon";

grant update on table "public"."wishlists" to "anon";

grant delete on table "public"."wishlists" to "authenticated";

grant insert on table "public"."wishlists" to "authenticated";

grant references on table "public"."wishlists" to "authenticated";

grant select on table "public"."wishlists" to "authenticated";

grant trigger on table "public"."wishlists" to "authenticated";

grant truncate on table "public"."wishlists" to "authenticated";

grant update on table "public"."wishlists" to "authenticated";

grant delete on table "public"."wishlists" to "service_role";

grant insert on table "public"."wishlists" to "service_role";

grant references on table "public"."wishlists" to "service_role";

grant select on table "public"."wishlists" to "service_role";

grant trigger on table "public"."wishlists" to "service_role";

grant truncate on table "public"."wishlists" to "service_role";

grant update on table "public"."wishlists" to "service_role";

create policy "Admin full access"
on "public"."categories"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::text)))))
with check ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::text)))));


create policy "Allow insert for admin users"
on "public"."categories"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::text)))));


create policy "Allow select for all users"
on "public"."categories"
as permissive
for select
to public
using (true);


create policy "Allow individual delete access"
on "public"."wishlists"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Allow individual insert access"
on "public"."wishlists"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Allow individual read access"
on "public"."wishlists"
as permissive
for select
to public
using ((auth.uid() = user_id));


CREATE TRIGGER categories_search_vector BEFORE INSERT OR UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION tsvector_update_trigger('search_vector', 'pg_catalog.english', 'name');

CREATE TRIGGER products_search_vector BEFORE INSERT OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION tsvector_update_trigger('search_vector', 'pg_catalog.english', 'name', 'short_description', 'description');


