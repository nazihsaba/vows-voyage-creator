-- Drop the restrictive policy that prevents login
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;

-- Allow anyone to read email and username for login purposes
CREATE POLICY "Anyone can read email and username"
ON public.profiles
FOR SELECT
USING (true);

-- Users can still only update their own profile
-- (the update policy already exists)

-- Add unique constraint on username (where not null)
CREATE UNIQUE INDEX profiles_username_unique 
ON public.profiles (username) 
WHERE username IS NOT NULL;