-- Create invitation_links table
CREATE TABLE public.invitation_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  link_name TEXT NOT NULL,
  unique_slug TEXT NOT NULL UNIQUE,
  number_of_persons INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invitees table
CREATE TABLE public.invitees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_link_id UUID NOT NULL REFERENCES public.invitation_links(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_attending BOOLEAN DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invitation_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invitation_links
CREATE POLICY "Users can manage links for their weddings"
ON public.invitation_links
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.weddings
    WHERE weddings.id = invitation_links.wedding_id
    AND weddings.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view links for published weddings"
ON public.invitation_links
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.weddings
    WHERE weddings.id = invitation_links.wedding_id
    AND weddings.status = 'published'
  )
);

-- RLS Policies for invitees
CREATE POLICY "Users can manage invitees for their wedding links"
ON public.invitees
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.invitation_links
    JOIN public.weddings ON weddings.id = invitation_links.wedding_id
    WHERE invitation_links.id = invitees.invitation_link_id
    AND weddings.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view invitees for published wedding links"
ON public.invitees
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.invitation_links
    JOIN public.weddings ON weddings.id = invitation_links.wedding_id
    WHERE invitation_links.id = invitees.invitation_link_id
    AND weddings.status = 'published'
  )
);

-- Create indexes for better performance
CREATE INDEX idx_invitation_links_wedding_id ON public.invitation_links(wedding_id);
CREATE INDEX idx_invitation_links_unique_slug ON public.invitation_links(unique_slug);
CREATE INDEX idx_invitees_invitation_link_id ON public.invitees(invitation_link_id);