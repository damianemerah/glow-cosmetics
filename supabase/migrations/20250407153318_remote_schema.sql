alter table "public"."orders" add column "payment_method" text not null;

create policy "Insert own cart"
on "public"."carts"
as permissive
for insert
to authenticated
with check ((user_id = auth.uid()));



