-- Physical cards consultation bookings.
-- Rows are created only by the create-booking server function (service role).

CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  phone text CHECK (phone IS NULL OR char_length(phone) <= 40),
  meeting_type text NOT NULL CHECK (meeting_type IN ('google_meet', 'phone')),
  notes text CHECK (notes IS NULL OR char_length(notes) <= 1000),
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  google_event_id text,
  meet_link text,
  CHECK (end_time > start_time)
);

-- Only one confirmed booking per time slot (stops double bookings).
CREATE UNIQUE INDEX IF NOT EXISTS bookings_one_per_slot
  ON public.bookings (start_time)
  WHERE status = 'confirmed';

CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON public.bookings (user_id);

-- Data API access: customers read their own rows; only the service role writes.
GRANT SELECT ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Logged-in customers can see their own bookings. No one can write from the browser.
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
CREATE POLICY "Users can view their own bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);