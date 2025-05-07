alter table "public"."product_categories" enable row level security;

create policy "Admins can manage all payments"
on "public"."payments"
as permissive
for all
to authenticated
using ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.user_id = auth.uid())) = 'admin'::text))
with check ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.user_id = auth.uid())) = 'admin'::text));


create policy "Users can view their own payments"
on "public"."payments"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM orders o
  WHERE ((o.id = payments.order_id) AND (o.user_id = auth.uid())))));


create policy "Admins can manage all product-category links"
on "public"."product_categories"
as permissive
for all
to authenticated
using ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.user_id = auth.uid())) = 'admin'::text))
with check ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.user_id = auth.uid())) = 'admin'::text));


create policy "Users can view product-category links for visible products and "
on "public"."product_categories"
as permissive
for select
to authenticated, anon
using (((EXISTS ( SELECT 1
   FROM products p
  WHERE (p.id = product_categories.product_id))) AND (EXISTS ( SELECT 1
   FROM categories c
  WHERE (c.id = product_categories.category_id)))));



