DROP POLICY "Authenticated users can manage promo codes" ON public.promo_codes;
REVOKE INSERT, UPDATE, DELETE ON public.promo_codes FROM authenticated;
GRANT ALL ON public.promo_codes TO service_role;

ALTER POLICY "Users can upload wedding videos" ON storage.objects
TO authenticated
WITH CHECK (bucket_id = 'wedding-videos' AND (storage.foldername(name))[1] = (SELECT auth.uid()::text));

ALTER POLICY "Authenticated users can upload invitation images" ON storage.objects
WITH CHECK (
  bucket_id = 'invitation-images'
  AND (storage.foldername(name))[1] = 'invites'
  AND EXISTS (
    SELECT 1 FROM public.weddings AS w
    WHERE w.slug = (storage.foldername(name))[2]
      AND (w.user_id = (SELECT auth.uid()) OR public.is_wedding_shared_with(w.id, (SELECT auth.uid())))
  )
);

ALTER POLICY "Authenticated users can update invitation images" ON storage.objects
USING (
  bucket_id = 'invitation-images'
  AND (storage.foldername(name))[1] = 'invites'
  AND EXISTS (
    SELECT 1 FROM public.weddings AS w
    WHERE w.slug = (storage.foldername(name))[2]
      AND (w.user_id = (SELECT auth.uid()) OR public.is_wedding_shared_with(w.id, (SELECT auth.uid())))
  )
)
WITH CHECK (
  bucket_id = 'invitation-images'
  AND (storage.foldername(name))[1] = 'invites'
  AND EXISTS (
    SELECT 1 FROM public.weddings AS w
    WHERE w.slug = (storage.foldername(name))[2]
      AND (w.user_id = (SELECT auth.uid()) OR public.is_wedding_shared_with(w.id, (SELECT auth.uid())))
  )
);

ALTER POLICY "Authenticated users can delete invitation images" ON storage.objects
USING (
  bucket_id = 'invitation-images'
  AND (storage.foldername(name))[1] = 'invites'
  AND EXISTS (
    SELECT 1 FROM public.weddings AS w
    WHERE w.slug = (storage.foldername(name))[2]
      AND (w.user_id = (SELECT auth.uid()) OR public.is_wedding_shared_with(w.id, (SELECT auth.uid())))
  )
);