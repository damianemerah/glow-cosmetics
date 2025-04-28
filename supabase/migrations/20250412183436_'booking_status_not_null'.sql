alter table "public"."bookings" alter column "email" drop not null;

alter table "public"."bookings" alter column "status" set not null;

alter table "public"."orders" alter column "created_at" set not null;

alter table "public"."products" alter column "image_url" set not null;


