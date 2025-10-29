-- Add username to profiles table
ALTER TABLE public.profiles
ADD COLUMN username text UNIQUE;

-- Add template_type to weddings table
ALTER TABLE public.weddings
ADD COLUMN template_type text DEFAULT 'template1';

-- Create index on username for faster lookups
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Update the handle_new_user function to include username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, username)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'username'
  );
  RETURN NEW;
END;
$function$;