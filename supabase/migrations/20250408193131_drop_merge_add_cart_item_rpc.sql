-- Migration file: YYYYMMDDHHMMSS_drop_merge_add_cart_item_rpc.sql

DROP FUNCTION IF EXISTS public.merge_add_cart_item(uuid, uuid, int, numeric);