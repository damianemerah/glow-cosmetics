alter table "public"."products" alter column "is_active" set not null;

alter table "public"."profiles" add column "full_name" text generated always as (((first_name || ' '::text) || last_name)) stored;


