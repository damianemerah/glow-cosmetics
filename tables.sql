DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;

-- profiles
CREATE TABLE profiles (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role text DEFAULT 'user',
  first_name text,
  last_name text,
  avatar text,
  email text UNIQUE,
  date_of_birth date,
  phone text CHECK (phone ~ '^\+27[0-9]{9}$'),
  receive_emails boolean DEFAULT false,
  is_complete boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Select own profile" ON profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Update own profile" ON profiles FOR UPDATE USING (user_id = auth.uid());

-- products
CREATE TABLE products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  short_description text,
  price numeric,
  category text CHECK (category IN ('lip_gloss', 'skin_care', 'supplements')),
  image_url text[],
  stock_quantity integer DEFAULT 0 CHECK (stock_quantity >= 0),
  is_active boolean DEFAULT true,
  is_bestseller boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public select active products" ON products FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Admins select all products" ON products FOR SELECT USING (auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admins insert products" ON products FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admins update products" ON products FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin'));


-- bookings
CREATE TABLE bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(user_id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  service_id text,
  service_price numeric,
  booking_time timestamp with time zone NOT NULL,
  duration interval,
  location text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  special_requests text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Create bookings" ON bookings FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Select own bookings" ON bookings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Update own bookings" ON bookings FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admin full access to bookings" ON bookings FOR ALL USING (auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin'));

-- carts
CREATE TABLE carts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  total_price numeric DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Select own carts" ON carts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Update own carts" ON carts FOR UPDATE USING (user_id = auth.uid());

-- cart_items
CREATE TABLE cart_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id uuid REFERENCES carts(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  quantity int DEFAULT 1 CHECK (quantity > 0),
  price_at_time numeric,
  subtotal numeric GENERATED ALWAYS AS (quantity * price_at_time) STORED,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Select own cart items" ON cart_items FOR SELECT USING (EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));
CREATE POLICY "Update own cart items" ON cart_items FOR UPDATE USING (EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));
CREATE POLICY "Delete own cart items" ON cart_items FOR DELETE USING (EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));
CREATE POLICY "Admin Select all cart items" ON cart_items FOR SELECT USING (auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admin Delete any cart item" ON cart_items FOR DELETE USING (auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin'));

-- Drop existing tables
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;

-- orders
CREATE TABLE orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  cart_id uuid REFERENCES carts(id) ON DELETE CASCADE,
  total_price numeric,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered')),
  shipping_address jsonb,
  email text,
  phone text,
  payment_reference text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Insert own orders" ON orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Select own orders" ON orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Update own orders" ON orders FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins manage orders" ON orders FOR ALL USING (auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin'));

-- order_items
CREATE TABLE order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text,
  quantity integer CHECK (quantity > 0) DEFAULT 1,
  price_at_time numeric CHECK (price_at_time >= 0),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Select own order items" ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Insert own order items" ON order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Update own order items" ON order_items FOR UPDATE USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Delete own order items" ON order_items FOR DELETE USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Admins manage order items" ON order_items FOR ALL USING (auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin'));

-- Indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_cart_id ON orders(cart_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- payments
CREATE TABLE payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  amount numeric,
  status text DEFAULT 'pending',
  payment_method text CHECK (payment_method IN ('credit_card', 'eft', 'paypal')),
  transaction_id text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own payments" ON payments FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid()));

-- audit_logs
CREATE TABLE audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  table_name text,
  action text,
  old_data jsonb,
  new_data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_stock_quantity ON products(stock_quantity);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_bookings_booking_time ON bookings(booking_time);