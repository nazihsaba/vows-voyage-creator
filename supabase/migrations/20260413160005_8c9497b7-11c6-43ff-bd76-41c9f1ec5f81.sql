
-- Junction table for sharing weddings with other users
CREATE TABLE public.wedding_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  shared_with_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (wedding_id, shared_with_user_id)
);

-- Enable RLS
ALTER TABLE public.wedding_shares ENABLE ROW LEVEL SECURITY;

-- Owner can manage shares
CREATE POLICY "Event owner can manage shares"
  ON public.wedding_shares FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.weddings
    WHERE weddings.id = wedding_shares.wedding_id
      AND weddings.user_id = auth.uid()
  ));

-- Shared user can view their shares
CREATE POLICY "Shared user can view own shares"
  ON public.wedding_shares FOR SELECT
  USING (shared_with_user_id = auth.uid());

-- Allow shared users to also SELECT the wedding itself
CREATE POLICY "Shared users can view shared weddings"
  ON public.weddings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.wedding_shares
    WHERE wedding_shares.wedding_id = weddings.id
      AND wedding_shares.shared_with_user_id = auth.uid()
  ));

-- Allow shared users to UPDATE shared weddings
CREATE POLICY "Shared users can update shared weddings"
  ON public.weddings FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.wedding_shares
    WHERE wedding_shares.wedding_id = weddings.id
      AND wedding_shares.shared_with_user_id = auth.uid()
  ));
