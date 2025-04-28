
-- 1. Create (or replace) the trigger function
CREATE OR REPLACE FUNCTION public.trigger_update_inventory_on_paid()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- only fire when status becomes 'paid' and wasn't 'paid' before
  IF NEW.status = 'paid'
     AND OLD.status IS DISTINCT FROM NEW.status THEN

    -- call your RPC
    PERFORM public.update_inventory_after_purchase(NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Drop any existing trigger of the same name, then attach it
DROP TRIGGER IF EXISTS update_inventory_on_paid_trigger
  ON public.orders;

CREATE TRIGGER update_inventory_on_paid_trigger
AFTER UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.trigger_update_inventory_on_paid();

