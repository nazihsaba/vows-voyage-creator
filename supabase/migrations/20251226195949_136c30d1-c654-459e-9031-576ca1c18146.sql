-- Fix the SECURITY DEFINER view issue by making it SECURITY INVOKER
-- This ensures RLS policies are respected for the querying user
DROP VIEW IF EXISTS public.public_gift_cards;

CREATE VIEW public.public_gift_cards 
WITH (security_invoker = true)
AS
SELECT 
  gc.id, 
  gc.wedding_id, 
  gc.card_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM weddings w 
      WHERE w.id = gc.wedding_id 
      AND w.user_id = auth.uid()
    ) THEN gc.card_number
    ELSE public.get_masked_card_number(gc.card_number)
  END as card_number,
  gc.logo_url, 
  gc.card_order, 
  gc.created_at
FROM public.gift_cards gc
WHERE EXISTS (
  SELECT 1 FROM weddings w 
  WHERE w.id = gc.wedding_id 
  AND (w.status = 'published' OR w.user_id = auth.uid())
);

-- Grant access to the view
GRANT SELECT ON public.public_gift_cards TO anon, authenticated;