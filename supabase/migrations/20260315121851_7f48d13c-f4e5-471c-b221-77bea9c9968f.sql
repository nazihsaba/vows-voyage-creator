CREATE OR REPLACE VIEW public.public_gift_cards AS
SELECT id,
    wedding_id,
    card_name,
    card_number,
    logo_url,
    card_order,
    created_at
   FROM gift_cards gc
  WHERE (EXISTS ( SELECT 1
           FROM weddings w
          WHERE w.id = gc.wedding_id AND (w.status = 'published'::text OR w.user_id = auth.uid())));