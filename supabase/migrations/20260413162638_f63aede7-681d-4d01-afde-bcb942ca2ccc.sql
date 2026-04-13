
-- wedding_locations: shared users can manage
CREATE POLICY "Shared users can manage locations"
ON public.wedding_locations FOR ALL
TO authenticated
USING (is_wedding_shared_with(wedding_id, auth.uid()))
WITH CHECK (is_wedding_shared_with(wedding_id, auth.uid()));

-- gallery_images: shared users can manage
CREATE POLICY "Shared users can manage gallery"
ON public.gallery_images FOR ALL
TO authenticated
USING (is_wedding_shared_with(wedding_id, auth.uid()))
WITH CHECK (is_wedding_shared_with(wedding_id, auth.uid()));

-- gift_cards: shared users can manage
CREATE POLICY "Shared users can manage gift cards"
ON public.gift_cards FOR ALL
TO authenticated
USING (is_wedding_shared_with(wedding_id, auth.uid()))
WITH CHECK (is_wedding_shared_with(wedding_id, auth.uid()));

-- invitation_links: shared users can manage
CREATE POLICY "Shared users can manage invitation links"
ON public.invitation_links FOR ALL
TO authenticated
USING (is_wedding_shared_with(wedding_id, auth.uid()))
WITH CHECK (is_wedding_shared_with(wedding_id, auth.uid()));

-- invitees: shared users can manage
CREATE POLICY "Shared users can manage invitees"
ON public.invitees FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM invitation_links
  WHERE invitation_links.id = invitees.invitation_link_id
    AND is_wedding_shared_with(invitation_links.wedding_id, auth.uid())
))
WITH CHECK (EXISTS (
  SELECT 1 FROM invitation_links
  WHERE invitation_links.id = invitees.invitation_link_id
    AND is_wedding_shared_with(invitation_links.wedding_id, auth.uid())
));

-- venue_projects: shared users can manage
CREATE POLICY "Shared users can manage venue projects"
ON public.venue_projects FOR ALL
TO authenticated
USING (is_wedding_shared_with(wedding_id, auth.uid()))
WITH CHECK (is_wedding_shared_with(wedding_id, auth.uid()));

-- venue_tables: shared users can manage
CREATE POLICY "Shared users can manage venue tables"
ON public.venue_tables FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM venue_projects
  WHERE venue_projects.id = venue_tables.venue_project_id
    AND is_wedding_shared_with(venue_projects.wedding_id, auth.uid())
))
WITH CHECK (EXISTS (
  SELECT 1 FROM venue_projects
  WHERE venue_projects.id = venue_tables.venue_project_id
    AND is_wedding_shared_with(venue_projects.wedding_id, auth.uid())
));
