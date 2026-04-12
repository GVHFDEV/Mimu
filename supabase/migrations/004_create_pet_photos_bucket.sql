-- Create pet-photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-photos', 'pet-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Users can only upload their own pet photos
CREATE POLICY "Users can upload their own pet photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pet-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policy: Users can view their own pet photos
CREATE POLICY "Users can view their own pet photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'pet-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policy: Users can update their own pet photos
CREATE POLICY "Users can update their own pet photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'pet-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policy: Users can delete their own pet photos
CREATE POLICY "Users can delete their own pet photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'pet-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add photo_url column to pets table if it doesn't exist
ALTER TABLE pets ADD COLUMN IF NOT EXISTS photo_url TEXT;
