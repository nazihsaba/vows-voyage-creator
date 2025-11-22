-- Remove unique constraint from unique_slug in invitation_links table
ALTER TABLE public.invitation_links 
DROP CONSTRAINT IF EXISTS invitation_links_unique_slug_key;