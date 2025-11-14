-- Update handle_new_user to make first user a superadmin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Insert or update profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      updated_at = NOW();

  -- Check if this is the first user
  SELECT COUNT(*) INTO user_count FROM auth.users;
  
  -- If first user, make them superadmin automatically
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role, granted_by)
    VALUES (NEW.id, 'superadmin'::app_role, NEW.id)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;