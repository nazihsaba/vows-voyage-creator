-- Drop existing SELECT policy and recreate with explicit authentication requirement
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create a more explicit policy that requires authentication
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Ensure no public/anon access by explicitly denying
-- The TO authenticated clause ensures only authenticated users can use this policy