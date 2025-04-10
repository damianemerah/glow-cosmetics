-- Function to set created_at on insert
create or replace function public.handle_created_at()
returns trigger
language plpgsql
as $$
begin
  new.created_at := now();
  return new;
end;
$$;

-- Function to set updated_at on update
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Add timestamp columns to products table
alter table public.products
  add column if not exists created_at timestamp with time zone default now() not null,
  add column if not exists updated_at timestamp with time zone default now() not null;

-- Add timestamp columns to carts table
alter table public.carts
  add column if not exists created_at timestamp with time zone default now() not null,
  add column if not exists updated_at timestamp with time zone default now() not null;

-- Add timestamp columns to cart_items table
alter table public.cart_items
  add column if not exists created_at timestamp with time zone default now() not null,
  add column if not exists updated_at timestamp with time zone default now() not null;

-- Add timestamp columns to orders table
alter table public.orders
  add column if not exists created_at timestamp with time zone default now() not null,
  add column if not exists updated_at timestamp with time zone default now() not null;

-- Add timestamp columns to order_items table
alter table public.order_items
  add column if not exists created_at timestamp with time zone default now() not null,
  add column if not exists updated_at timestamp with time zone default now() not null;

-- Add timestamp columns to bookings table
alter table public.bookings
  add column if not exists created_at timestamp with time zone default now() not null,
  add column if not exists updated_at timestamp with time zone default now() not null;

-- Add timestamp columns to profiles table
alter table public.profiles
  add column if not exists created_at timestamp with time zone default now() not null,
  add column if not exists updated_at timestamp with time zone default now() not null;

-- Create triggers for products table
create trigger on_products_created
  before insert on public.products
  for each row execute function public.handle_created_at();

create trigger on_products_updated
  before update on public.products
  for each row execute function public.handle_updated_at();

-- Create triggers for carts table
create trigger on_carts_created
  before insert on public.carts
  for each row execute function public.handle_created_at();

create trigger on_carts_updated
  before update on public.carts
  for each row execute function public.handle_updated_at();

-- Create triggers for cart_items table
create trigger on_cart_items_created
  before insert on public.cart_items
  for each row execute function public.handle_created_at();

create trigger on_cart_items_updated
  before update on public.cart_items
  for each row execute function public.handle_updated_at();

-- Create triggers for orders table
create trigger on_orders_created
  before insert on public.orders
  for each row execute function public.handle_created_at();

create trigger on_orders_updated
  before update on public.orders
  for each row execute function public.handle_updated_at();

-- Create triggers for order_items table
create trigger on_order_items_created
  before insert on public.order_items
  for each row execute function public.handle_created_at();

create trigger on_order_items_updated
  before update on public.order_items
  for each row execute function public.handle_updated_at();

-- Create triggers for bookings table
create trigger on_bookings_created
  before insert on public.bookings
  for each row execute function public.handle_created_at();

create trigger on_bookings_updated
  before update on public.bookings
  for each row execute function public.handle_updated_at();

-- Create triggers for profiles table
create trigger on_profiles_created
  before insert on public.profiles
  for each row execute function public.handle_created_at();

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Modify carts table - drop status column (adjust this if it doesn't exist)
alter table public.carts
  drop column if exists status;

-- Add unique constraint on user_id in carts table
-- First, remove any duplicate active carts for users, keeping the newest one
do $$
declare
  redundant_cart_id uuid;
  user_with_multiple_carts uuid;
begin
  for user_with_multiple_carts in
    select user_id
    from public.carts
    group by user_id
    having count(*) > 1
  loop
    for redundant_cart_id in
      select id from public.carts
      where user_id = user_with_multiple_carts
      order by created_at desc
      offset 1
    loop
      delete from public.cart_items where cart_id = redundant_cart_id;
      delete from public.carts where id = redundant_cart_id;
    end loop;
  end loop;
end $$;

-- Now add the unique constraint
alter table public.carts
  add constraint carts_user_id_key unique (user_id);
