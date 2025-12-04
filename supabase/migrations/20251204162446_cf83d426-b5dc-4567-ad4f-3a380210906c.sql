-- Create storage bucket for sample images
INSERT INTO storage.buckets (id, name, public)
VALUES ('sample-images', 'sample-images', true);

-- Allow anyone to view sample images (public)
CREATE POLICY "Anyone can view sample images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'sample-images');

-- Allow authenticated users to upload sample images
CREATE POLICY "Authenticated users can upload sample images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'sample-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete sample images
CREATE POLICY "Authenticated users can delete sample images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'sample-images' AND auth.role() = 'authenticated');