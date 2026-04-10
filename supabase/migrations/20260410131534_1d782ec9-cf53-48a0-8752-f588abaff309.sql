
-- Create venue_projects table
CREATE TABLE public.venue_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Venue Layout',
  plan_image_url text,
  scale numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.venue_projects ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE TRIGGER update_venue_projects_updated_at
  BEFORE UPDATE ON public.venue_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS: owner access via weddings join
CREATE POLICY "Users can manage venue projects for their weddings"
  ON public.venue_projects FOR ALL USING (
    EXISTS (SELECT 1 FROM weddings WHERE weddings.id = venue_projects.wedding_id AND weddings.user_id = auth.uid())
  );

-- Create venue_tables table
CREATE TABLE public.venue_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_project_id uuid NOT NULL REFERENCES public.venue_projects(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  shape text NOT NULL DEFAULT 'round',
  width numeric NOT NULL DEFAULT 100,
  height numeric NOT NULL DEFAULT 100,
  x_position numeric NOT NULL DEFAULT 0,
  y_position numeric NOT NULL DEFAULT 0,
  rotation numeric NOT NULL DEFAULT 0,
  guest_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.venue_tables ENABLE ROW LEVEL SECURITY;

-- RLS: owner access via venue_projects → weddings join
CREATE POLICY "Users can manage venue tables for their weddings"
  ON public.venue_tables FOR ALL USING (
    EXISTS (
      SELECT 1 FROM venue_projects
      JOIN weddings ON weddings.id = venue_projects.wedding_id
      WHERE venue_projects.id = venue_tables.venue_project_id
        AND weddings.user_id = auth.uid()
    )
  );
