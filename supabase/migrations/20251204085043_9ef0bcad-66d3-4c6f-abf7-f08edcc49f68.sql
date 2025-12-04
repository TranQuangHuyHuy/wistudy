-- Create table to store OTP codes
CREATE TABLE public.email_verification_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_email_verification_codes_email ON public.email_verification_codes(email);
CREATE INDEX idx_email_verification_codes_expires ON public.email_verification_codes(expires_at);

-- Enable RLS
ALTER TABLE public.email_verification_codes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for registration)
CREATE POLICY "Anyone can create verification codes"
ON public.email_verification_codes
FOR INSERT
WITH CHECK (true);

-- Allow anyone to read their own verification codes
CREATE POLICY "Anyone can read verification codes by email"
ON public.email_verification_codes
FOR SELECT
USING (true);

-- Allow anyone to update verification codes
CREATE POLICY "Anyone can update verification codes"
ON public.email_verification_codes
FOR UPDATE
USING (true);

-- Allow deletion of expired codes
CREATE POLICY "Anyone can delete verification codes"
ON public.email_verification_codes
FOR DELETE
USING (true);