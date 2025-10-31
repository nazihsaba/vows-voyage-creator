-- Drop the overly permissive policy that exposes all emails
DROP POLICY IF EXISTS "Anyone can read email and username" ON public.profiles;

-- Allow users to read only their own complete profile data (including email)
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);