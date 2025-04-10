drop policy "Create bookings" on "public"."bookings";

CREATE UNIQUE INDEX profiles_user_id_key ON public.profiles USING btree (user_id);

alter table "public"."profiles" add constraint "profiles_user_id_key" UNIQUE using index "profiles_user_id_key";

create policy "Allow unauthenticated users to create bookings"
on "public"."bookings"
as permissive
for insert
to authenticated, anon
with check (true);



