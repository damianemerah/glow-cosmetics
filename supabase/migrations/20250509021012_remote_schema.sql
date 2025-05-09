set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  profile_first_name TEXT;
  profile_last_name TEXT;
  profile_avatar_url TEXT;
  profile_phone TEXT;
  profile_date_of_birth DATE;
  profile_receive_emails BOOLEAN;
BEGIN
  profile_receive_emails := COALESCE((NEW.raw_user_meta_data ->> 'receive_emails')::boolean, FALSE);
  profile_phone := NEW.raw_user_meta_data ->> 'phone';
  profile_date_of_birth := (NEW.raw_user_meta_data ->> 'date_of_birth')::date;

  IF NEW.raw_app_meta_data ->> 'provider' = 'google' THEN
    profile_first_name := NEW.raw_user_meta_data ->> 'first_name';
    profile_last_name := NEW.raw_user_meta_data ->> 'last_name';
    profile_avatar_url := NEW.raw_user_meta_data ->> 'avatar_url';

  ELSIF NEW.raw_app_meta_data ->> 'provider' = 'apple' THEN
    profile_first_name := NEW.raw_user_meta_data ->> 'first_name';
    profile_last_name := NEW.raw_user_meta_data ->> 'last_name';
    profile_avatar_url := NULL;

  ELSIF NEW.raw_app_meta_data ->> 'provider' = 'email' OR NEW.raw_app_meta_data ->> 'provider' = 'phone' THEN
    profile_first_name := NEW.raw_user_meta_data ->> 'first_name';
    profile_last_name := NEW.raw_user_meta_data ->> 'last_name';
    profile_avatar_url := NEW.raw_user_meta_data ->> 'avatar_url';

  ELSE
    profile_first_name := NEW.raw_user_meta_data ->> 'first_name';
    profile_last_name := NEW.raw_user_meta_data ->> 'last_name';
    profile_avatar_url := NEW.raw_user_meta_data ->> 'avatar_url';
  END IF;

  INSERT INTO public.profiles (
    user_id,
    email,
    first_name,
    last_name,
    avatar,
    phone,
    date_of_birth,
    receive_emails,
    is_active
  )
  VALUES (
    NEW.id,
    NEW.email,
    profile_first_name,
    profile_last_name,
    profile_avatar_url,
    profile_phone,
    profile_date_of_birth,
    profile_receive_emails,
    TRUE
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$function$
;


