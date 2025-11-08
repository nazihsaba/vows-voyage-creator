-- Create table for OTP codes
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting OTPs (public function needs this)
CREATE POLICY "Allow inserting OTP codes"
ON public.otp_codes
FOR INSERT
WITH CHECK (true);

-- Create policy for updating OTPs (for marking as used)
CREATE POLICY "Allow updating OTP codes"
ON public.otp_codes
FOR UPDATE
USING (true);

-- Create policy for selecting OTPs (for verification)
CREATE POLICY "Allow selecting OTP codes"
ON public.otp_codes
FOR SELECT
USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS otp_codes_email_idx ON public.otp_codes(email);
CREATE INDEX IF NOT EXISTS otp_codes_expires_at_idx ON public.otp_codes(expires_at);

-- Create function to clean up expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.otp_codes 
  WHERE expires_at < NOW() - INTERVAL '1 hour';
$$;