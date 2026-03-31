
-- Add table_number to invitees table
ALTER TABLE public.invitees ADD COLUMN table_number integer DEFAULT NULL;

-- Migrate existing data: copy table_number from invitation_links to invitees
UPDATE public.invitees 
SET table_number = il.table_number
FROM public.invitation_links il
WHERE invitees.invitation_link_id = il.id
AND il.table_number IS NOT NULL;

-- Remove table_number from invitation_links
ALTER TABLE public.invitation_links DROP COLUMN table_number;
