-- Create storage bucket for wedding images
INSERT INTO storage.buckets (id, name, public)
VALUES ('wedding-images', 'wedding-images', true);

-- Allow authenticated users to upload their own wedding images
CREATE POLICY "Users can upload wedding images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'wedding-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own wedding images
CREATE POLICY "Users can update their wedding images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'wedding-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own wedding images
CREATE POLICY "Users can delete their wedding images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'wedding-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public access to view wedding images
CREATE POLICY "Anyone can view wedding images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'wedding-images');