-- ============================================
-- FIX 1: Gift Cards - Create view with masked card numbers for public access
-- ============================================

-- Create a view that masks card numbers for non-owners
CREATE OR REPLACE VIEW public.public_gift_cards AS
SELECT 
  gc.id, 
  gc.wedding_id, 
  gc.card_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM weddings w 
      WHERE w.id = gc.wedding_id 
      AND w.user_id = auth.uid()
    ) THEN gc.card_number
    ELSE public.get_masked_card_number(gc.card_number)
  END as card_number,
  gc.logo_url, 
  gc.card_order, 
  gc.created_at
FROM public.gift_cards gc;

-- Grant access to the view
GRANT SELECT ON public.public_gift_cards TO anon, authenticated;

-- ============================================
-- FIX 2: Storage Policies - Restrict to user-scoped folders
-- ============================================

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can upload to wedding-images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update files in wedding-images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete files in wedding-images" ON storage.objects;

-- Create secure user-scoped policies
CREATE POLICY "Users can upload to own folder in wedding-images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'wedding-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own files in wedding-images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'wedding-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own files in wedding-images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'wedding-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Do the same for wedding-videos bucket
DROP POLICY IF EXISTS "Authenticated users can upload to wedding-videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update files in wedding-videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete files in wedding-videos" ON storage.objects;

CREATE POLICY "Users can upload to own folder in wedding-videos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'wedding-videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own files in wedding-videos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'wedding-videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own files in wedding-videos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'wedding-videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- FIX 3: OTP Codes - Remove all public access
-- ============================================

-- Drop all permissive policies on otp_codes
DROP POLICY IF EXISTS "Allow inserting OTP codes" ON public.otp_codes;
DROP POLICY IF EXISTS "Allow updating OTP codes" ON public.otp_codes;
DROP POLICY IF EXISTS "Allow selecting OTP codes" ON public.otp_codes;

-- OTP codes should only be accessed via service role in edge functions
-- No client-side policies needed