-- Add invitation_url column to store the full invitation link
ALTER TABLE public.invitation_links 
ADD COLUMN invitation_url TEXT;