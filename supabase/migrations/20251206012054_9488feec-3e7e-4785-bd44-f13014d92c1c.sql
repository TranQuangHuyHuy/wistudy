-- Create table to store generated images
CREATE TABLE public.generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  background_prompt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- Users can view their own images
CREATE POLICY "Users can view their own images"
  ON public.generated_images FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own images  
CREATE POLICY "Users can insert their own images"
  ON public.generated_images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for faster daily queries
CREATE INDEX idx_generated_images_user_date 
  ON public.generated_images(user_id, created_at);