
-- Create the invitation-images bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('invitation-images', 'invitation-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read from this bucket (public previews)
CREATE POLICY "Public read access on invitation-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'invitation-images');

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Authenticated users can upload invitation images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'invitation-images');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update invitation images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'invitation-images');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete invitation images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'invitation-images');
