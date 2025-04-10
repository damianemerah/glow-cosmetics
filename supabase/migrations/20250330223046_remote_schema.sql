drop policy "select_audit_logs" on "public"."audit_logs";

alter table "public"."audit_logs" disable row level security;

alter table "public"."cart_items" alter column "price_at_time" drop not null;

alter table "public"."cart_items" alter column "quantity" drop not null;

alter table "public"."orders" alter column "created_at" drop not null;

alter table "public"."orders" alter column "total_price" drop not null;

alter table "public"."orders" alter column "updated_at" drop not null;

alter table "public"."products" alter column "category" drop not null;

alter table "public"."products" alter column "is_active" drop not null;

alter table "public"."products" alter column "price" drop not null;

alter table "public"."products" alter column "stock_quantity" drop not null;

alter table "public"."profiles" drop column "full_name";

alter table "public"."products" add constraint "products_stock_quantity_check" CHECK ((stock_quantity >= 0)) not valid;

alter table "public"."products" validate constraint "products_stock_quantity_check";


