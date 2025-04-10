alter table "public"."products" drop constraint "products_stock_quantity_check";

alter table "public"."audit_logs" enable row level security;

alter table "public"."bookings" alter column "first_name" set not null;

alter table "public"."bookings" alter column "last_name" set not null;

alter table "public"."bookings" alter column "service_price" set not null;

alter table "public"."cart_items" alter column "price_at_time" set not null;

alter table "public"."cart_items" alter column "product_id" set not null;

alter table "public"."cart_items" alter column "quantity" set not null;

alter table "public"."order_items" alter column "order_id" set not null;

alter table "public"."order_items" alter column "price_at_time" set not null;

alter table "public"."order_items" alter column "product_id" set not null;

alter table "public"."order_items" alter column "product_name" set not null;

alter table "public"."order_items" alter column "quantity" set not null;

alter table "public"."orders" alter column "email" set not null;

alter table "public"."orders" alter column "first_name" set not null;

alter table "public"."orders" alter column "payment_reference" set not null;

alter table "public"."orders" alter column "total_price" set not null;

alter table "public"."products" alter column "is_active" set not null;

alter table "public"."products" alter column "is_bestseller" set not null;

alter table "public"."products" alter column "stock_quantity" set not null;

alter table "public"."profiles" alter column "email" set not null;

alter table "public"."profiles" alter column "role" set not null;


