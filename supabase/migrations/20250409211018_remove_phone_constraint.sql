-- Drop the specific constraint by name
ALTER TABLE IF EXISTS profiles DROP CONSTRAINT IF EXISTS profiles_phone_check;

-- Make sure both phone and email are NOT NULL for profiles table
ALTER TABLE IF EXISTS profiles
  ALTER COLUMN phone SET NOT NULL,
  ALTER COLUMN email SET NOT NULL;

-- Make sure both phone and email are NOT NULL for orders table
ALTER TABLE IF EXISTS orders
  ALTER COLUMN phone SET NOT NULL,
  ALTER COLUMN email SET NOT NULL;
