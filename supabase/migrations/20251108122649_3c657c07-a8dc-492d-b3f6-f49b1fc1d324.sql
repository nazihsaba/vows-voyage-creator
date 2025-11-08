-- Add RLS policy to allow anyone to update RSVP status for invitees of published weddings
CREATE POLICY "Anyone can update RSVP for published wedding invitations"
ON invitees
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM invitation_links
    JOIN weddings ON weddings.id = invitation_links.wedding_id
    WHERE invitation_links.id = invitees.invitation_link_id
      AND weddings.status = 'published'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM invitation_links
    JOIN weddings ON weddings.id = invitation_links.wedding_id
    WHERE invitation_links.id = invitees.invitation_link_id
      AND weddings.status = 'published'
  )
);