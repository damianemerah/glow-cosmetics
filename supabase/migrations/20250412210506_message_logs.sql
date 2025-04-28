-- Create message_logs table
CREATE TABLE IF NOT EXISTS "public"."message_logs" (
  "id" BIGSERIAL PRIMARY KEY,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "recipients" TEXT NOT NULL,
  "subject" TEXT,
  "message" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "message_id" TEXT,
  "status" TEXT NOT NULL DEFAULT 'delivered',
  "user_id" UUID REFERENCES auth.users(id),
  "resent_from" TEXT
);

-- Add index for faster message_id lookups
CREATE INDEX IF NOT EXISTS "message_logs_message_id_idx" ON "public"."message_logs" ("message_id");
-- Add index for faster user_id lookups
CREATE INDEX IF NOT EXISTS "message_logs_user_id_idx" ON "public"."message_logs" ("user_id");

-- Enable RLS
ALTER TABLE "public"."message_logs" ENABLE ROW LEVEL SECURITY;

-- Set up auto-update for updated_at field
CREATE TRIGGER "handle_updated_at"
BEFORE UPDATE ON "public"."message_logs"
FOR EACH ROW
EXECUTE FUNCTION "public"."handle_updated_at"();

-- Create a policy for admins to do anything
CREATE POLICY "Allow admins full access to message_logs"
ON "public"."message_logs"
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."profiles"
    WHERE "public"."profiles"."user_id" = auth.uid()
    AND "public"."profiles"."role" = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."profiles"
    WHERE "public"."profiles"."user_id" = auth.uid()
    AND "public"."profiles"."role" = 'admin'
  )
);

-- Create a policy for users to view only their own messages
CREATE POLICY "Allow users to view their messages"
ON "public"."message_logs"
FOR SELECT
TO authenticated
USING (
  "user_id" = auth.uid()
);