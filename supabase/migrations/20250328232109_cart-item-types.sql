alter table "public"."cart_items" alter column "price_at_time" set not null;

alter table "public"."cart_items" alter column "quantity" set not null;

alter table "public"."products" alter column "price" set not null;


