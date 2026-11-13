-- Elan photo wall add-on, one per invitation.
-- Rows are written only by the photo-wall server function (service role); the couple can read their own.
--
-- status:
--   pending_payment  a Whish payment was started and is not confirmed yet
--   paid             payment confirmed (or the add-on is free), the wall is not created yet
--                    (e.g. Elan returned limit_reached): creating it again is safe
--   created          the wall exists on Elan; guest_url / QR codes are filled in
--   payment_failed   the Whish payment failed or was cancelled

CREATE TABLE IF NOT EXISTS public.photo_walls (
  wedding_id uuid PRIMARY KEY REFERENCES public.weddings (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending_payment'
    CHECK (status IN ('pending_payment', 'paid', 'created', 'payment_failed')),
  price_amount numeric(10, 2) NOT NULL DEFAULT 0,
  price_currency text NOT NULL DEFAULT 'USD',
  payment_external_id text,
  elan_event_id text,
  elan_mode text CHECK (elan_mode IS NULL OR elan_mode IN ('live', 'test')),
  guest_url text,
  qr_png_url text,
  qr_svg_url text,
  camera_opens_at timestamptz,
  camera_closes_at timestamptz,
  album_deleted_after timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS photo_walls_user_id_idx ON public.photo_walls (user_id);

ALTER TABLE public.photo_walls ENABLE ROW LEVEL SECURITY;

-- The couple can see their own photo wall. No one can write from the browser.
DROP POLICY IF EXISTS "Users can view their own photo walls" ON public.photo_walls;
CREATE POLICY "Users can view their own photo walls"
  ON public.photo_walls
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
