
-- Create a security definer function for checking wedding ownership
CREATE OR REPLACE FUNCTION public.is_wedding_owner(_wedding_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.weddings
    WHERE id = _wedding_id
      AND user_id = _user_id
  )
$$;

-- Drop and recreate the owner policy on wedding_shares
DROP POLICY IF EXISTS "Event owner can manage shares" ON public.wedding_shares;

CREATE POLICY "Event owner can manage shares"
  ON public.wedding_shares FOR ALL
  USING (public.is_wedding_owner(wedding_id, auth.uid()));
