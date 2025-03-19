alter table "public"."products" drop constraint "products_stock_quantity_check";

alter table "public"."audit_logs" enable row level security;

alter table "public"."products" alter column "category" set not null;

alter table "public"."products" alter column "stock_quantity" set not null;

create policy "select_audit_logs"
on "public"."audit_logs"
as permissive
for select
to public
using ((auth.uid() IS NOT NULL));



