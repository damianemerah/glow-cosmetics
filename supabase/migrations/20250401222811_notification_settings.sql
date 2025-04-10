alter table "public"."products" alter column "price" set not null;

alter table "public"."profiles" add column "appointment_reminder" boolean not null default true;

alter table "public"."profiles" add column "birthday_notification_enabled" boolean not null default true;

alter table "public"."profiles" add column "email_notifications_enabled" boolean not null default true;

alter table "public"."profiles" add column "full_name" text generated always as (((first_name || ' '::text) || last_name)) stored;

alter table "public"."profiles" add column "marketing_notification_enabled" boolean not null default false;

alter table "public"."profiles" add column "whatsapp_notifications_enabled" boolean not null default true;


