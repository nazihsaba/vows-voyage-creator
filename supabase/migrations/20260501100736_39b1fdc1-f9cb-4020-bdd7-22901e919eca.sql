ALTER TABLE public.wedding_locations DROP CONSTRAINT wedding_locations_type_check;
ALTER TABLE public.wedding_locations ADD CONSTRAINT wedding_locations_type_check
  CHECK (type = ANY (ARRAY['ceremony'::text, 'venue'::text, 'welcome_drink'::text, 'custom_1'::text, 'custom_2'::text, 'custom_3'::text, 'custom_4'::text]));