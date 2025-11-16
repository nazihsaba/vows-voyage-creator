-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can upload to wedding-images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update files in wedding-images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete files in wedding-images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view wedding-images" ON storage.objects;

-- Create storage policies for wedding-images bucket
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload to wedding-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'wedding-images');

-- Allow authenticated users to update
CREATE POLICY "Users can update files in wedding-images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'wedding-images');

-- Allow authenticated users to delete
CREATE POLICY "Users can delete files in wedding-images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'wedding-images');

-- Allow everyone to view (public bucket)
CREATE POLICY "Anyone can view wedding-images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'wedding-images');