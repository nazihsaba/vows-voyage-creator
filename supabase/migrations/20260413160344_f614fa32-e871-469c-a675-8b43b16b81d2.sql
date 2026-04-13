
-- Drop the recursive policies
DROP POLICY IF EXISTS "Shared users can view shared weddings" ON public.weddings;
DROP POLICY IF EXISTS "Shared users can update shared weddings" ON public.weddings;

-- Create security definer function to check sharing
CREATE OR REPLACE FUNCTION public.is_wedding_shared_with(_wedding_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.wedding_shares
    WHERE wedding_id = _wedding_id
      AND shared_with_user_id = _user_id
  )
$$;

-- Recreate policies using the function
CREATE POLICY "Shared users can view shared weddings"
  ON public.weddings FOR SELECT
  USING (public.is_wedding_shared_with(id, auth.uid()));

CREATE POLICY "Shared users can update shared weddings"
  ON public.weddings FOR UPDATE
  USING (public.is_wedding_shared_with(id, auth.uid()));
