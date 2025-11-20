-- Create a storage bucket for wedding videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wedding-videos',
  'wedding-videos',
  true,
  524288000, -- 500MB limit
  ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
);

-- RLS Policies for wedding-videos bucket
-- Anyone can view videos for published weddings
CREATE POLICY "Anyone can view wedding videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'wedding-videos');

-- Authenticated users can upload their own videos
CREATE POLICY "Users can upload wedding videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'wedding-videos' 
  AND auth.uid() IS NOT NULL
);

-- Users can update their own videos
CREATE POLICY "Users can update own wedding videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'wedding-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own videos
CREATE POLICY "Users can delete own wedding videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'wedding-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);