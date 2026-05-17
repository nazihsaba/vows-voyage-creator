CREATE TABLE public.wedding_tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_id UUID NOT NULL,
  table_number INTEGER NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (wedding_id, table_number)
);

CREATE INDEX idx_wedding_tables_wedding ON public.wedding_tables(wedding_id);

ALTER TABLE public.wedding_tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tables for published weddings"
ON public.wedding_tables FOR SELECT
USING (EXISTS (SELECT 1 FROM weddings WHERE weddings.id = wedding_tables.wedding_id AND weddings.status = 'published'));

CREATE POLICY "Users can manage tables for their weddings"
ON public.wedding_tables FOR ALL
USING (EXISTS (SELECT 1 FROM weddings WHERE weddings.id = wedding_tables.wedding_id AND weddings.user_id = auth.uid()));

CREATE POLICY "Shared users can manage tables"
ON public.wedding_tables FOR ALL
TO authenticated
USING (is_wedding_shared_with(wedding_id, auth.uid()))
WITH CHECK (is_wedding_shared_with(wedding_id, auth.uid()));