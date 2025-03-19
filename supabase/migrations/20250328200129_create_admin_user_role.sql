CREATE OR REPLACE FUNCTION public.get_user_id_by_email(p_email text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    user_id uuid;
BEGIN
    SELECT id INTO user_id FROM auth.users WHERE email = p_email LIMIT 1;
    RETURN user_id;
END;
$$;

-- Revoke all permissions from public and grant execute to specific roles
REVOKE ALL ON FUNCTION public.get_user_id_by_email FROM public;
GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(text) TO admin_user;
