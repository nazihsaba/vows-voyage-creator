CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_percent integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  usage_count integer NOT NULL DEFAULT 0,
  max_uses integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone
);

GRANT SELECT ON public.promo_codes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_codes TO authenticated;
GRANT ALL ON public.promo_codes TO service_role;

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active promo codes"
  ON public.promo_codes
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage promo codes"
  ON public.promo_codes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);