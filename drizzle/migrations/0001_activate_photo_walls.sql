CREATE TABLE IF NOT EXISTS public.photo_walls (
 wedding_id uuid PRIMARY KEY REFERENCES public.weddings(id) ON DELETE CASCADE,
 user_id uuid NOT NULL,
 status text NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment','paid','created','payment_failed')),
 price_amount numeric(10,2) NOT NULL DEFAULT 0,
 price_currency text NOT NULL DEFAULT 'USD',
 payment_external_id text,
 elan_event_id text,
 elan_mode text CHECK (elan_mode IS NULL OR elan_mode IN ('live','test')),
 guest_url text, qr_png_url text, qr_svg_url text,
 camera_opens_at timestamptz, camera_closes_at timestamptz, album_deleted_after timestamptz,
 last_error text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.photo_walls TO authenticated;
GRANT ALL ON public.photo_walls TO service_role;
ALTER TABLE public.photo_walls ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS photo_walls_user_id_idx ON public.photo_walls(user_id);
CREATE POLICY "Users can view their own photo walls" ON public.photo_walls FOR SELECT TO authenticated USING (auth.uid() = user_id);