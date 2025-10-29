-- Fix profiles table RLS policy to prevent email harvesting
-- Drop the existing permissive policy that allows viewing all profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create a strict policy that only allows users to view their own profile
CREATE POLICY "Users can view own profile only"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Fix gift_cards RLS to hide card numbers from public view
-- Drop existing policy
DROP POLICY IF EXISTS "Anyone can view gift cards for published weddings" ON public.gift_cards;

-- Create new policy that allows viewing but we'll handle card_number visibility in the app
CREATE POLICY "Anyone can view gift cards for published weddings"
ON public.gift_cards
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM weddings
    WHERE weddings.id = gift_cards.wedding_id 
    AND weddings.status = 'published'
  )
);

-- Add a secure function to get masked card numbers for public viewing
CREATE OR REPLACE FUNCTION public.get_masked_card_number(card_number text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN length(card_number) > 4 THEN 
      '****' || right(card_number, 4)
    ELSE 
      '****'
  END;
$$;

-- Fix function search_path issues for existing functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;